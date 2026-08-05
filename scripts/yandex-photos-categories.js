/**
 * Скачивает фото по категориям (Внутри + Еда) для первых 25 food POI.
 * Запуск: node scripts/yandex-photos-categories.js [poi-id]
 */

import puppeteer from 'puppeteer';
import fs from 'fs';
import path from 'path';
import https from 'https';
import http from 'http';
import { execSync } from 'child_process';

const POIS_FILE  = 'public/content/pois.json';
const IMAGES_DIR = 'public/images/pois';
const PHOTOS_PER_CATEGORY = 5;
const DELAY_SHORT = 2000;
const DELAY_LONG  = 4000;
const DELAY_POI   = 6000; // между POI — чтобы Яндекс не заблокировал

const sleep = ms => new Promise(r => setTimeout(r, ms));

function downloadFile(url, dest) {
  return new Promise((resolve, reject) => {
    const file  = fs.createWriteStream(dest);
    const proto = url.startsWith('https') ? https : http;
    const req   = proto.get(url, { headers: { 'Referer': 'https://yandex.com/' } }, res => {
      if (res.statusCode === 302 || res.statusCode === 301) {
        file.close();
        return downloadFile(res.headers.location, dest).then(resolve).catch(reject);
      }
      if (res.statusCode !== 200) { file.close(); return reject(new Error(`HTTP ${res.statusCode}`)); }
      res.pipe(file);
      file.on('finish', () => file.close(resolve));
    });
    req.on('error', reject);
  });
}

function toWebP(jpgPath) {
  const webpPath = jpgPath.replace(/\.jpg$/, '.webp');
  try {
    execSync(
      `python -c "from PIL import Image; img=Image.open(r'${jpgPath}'); img.convert('RGB').save(r'${webpPath}','WEBP',quality=85)"`,
      { stdio: 'ignore' }
    );
  } catch { /* не критично */ }
}

// Проверяем, не попали ли на капчу / блокировку
async function checkBlocked(page) {
  const url = page.url();
  if (url.includes('showcaptcha') || url.includes('captcha')) {
    console.log('\n⚠️  КАПЧА! Реши её в браузере и нажми Enter...');
    await new Promise(r => process.stdin.once('data', r));
  }
}

// Находит gallery URL через поиск карт
async function findGalleryUrl(page, poiName) {
  const query = encodeURIComponent(`${poiName} Владикавказ`);
  await page.goto(`https://yandex.ru/maps/995/vladikavkaz/?text=${query}`, {
    waitUntil: 'networkidle2', timeout: 40000
  });
  await sleep(DELAY_LONG);
  await checkBlocked(page);

  return page.evaluate(() => {
    for (const a of document.querySelectorAll('a.tabs-select-view__label')) {
      if (a.textContent?.trim() === 'Фото' && a.href?.includes('/gallery/')) return a.href;
    }
    return null;
  });
}

// Извлекает URL фото из текущей страницы
async function extractPhotoUrls(page, count) {
  // Ждём появления фото
  try {
    await page.waitForFunction(
      () => [...document.querySelectorAll('img')].some(img =>
        img.src && (img.src.includes('avatars.mds.yandex') || img.src.includes('avatars.yandex'))
      ),
      { timeout: 8000 }
    );
  } catch {
    return [];
  }

  // Прокрутка для подгрузки
  for (let i = 0; i < 6; i++) {
    await page.evaluate(() => window.scrollBy(0, 500));
    await sleep(600);
  }

  return page.evaluate((max) => {
    const result = new Set();
    for (const img of document.querySelectorAll('img')) {
      const src = img.src || img.dataset.src || '';
      if (src.includes('avatars.mds.yandex.net') || src.includes('avatars.yandex.net')) {
        result.add(src.replace(/\/\d+x\d+$/, '/orig'));
      }
      if (result.size >= max) break;
    }
    return [...result];
  }, count);
}

// Скачивает фото из конкретного фильтра галереи
async function fetchFromFilter(page, galleryUrl, filterName, count) {
  await page.goto(galleryUrl, { waitUntil: 'networkidle2', timeout: 40000 });
  await sleep(DELAY_LONG);
  await checkBlocked(page);

  // Ищем и кликаем фильтр
  const clicked = await page.evaluate((name) => {
    const buttons = document.querySelectorAll('.photos-tags button, .business-media-list__tags button');
    for (const btn of buttons) {
      if (btn.textContent?.trim() === name) { btn.click(); return true; }
    }
    return false;
  }, filterName);

  if (!clicked) {
    // Проверяем есть ли вообще фильтры на странице
    const filters = await page.evaluate(() => {
      const btns = document.querySelectorAll('.photos-tags button, .business-media-list__tags button');
      return [...btns].map(b => b.textContent?.trim());
    });
    if (filters.length === 0) {
      console.log(`    ✗ фильтры не загрузились (возможна блокировка)`);
    } else {
      console.log(`    ✗ фильтр «${filterName}» отсутствует. Есть: ${filters.join(', ')}`);
    }
    return [];
  }

  await sleep(DELAY_LONG); // ждём перезагрузки контента

  return extractPhotoUrls(page, count);
}

async function main() {
  const targetId = process.argv[2] || null;

  const raw  = fs.readFileSync(POIS_FILE, 'utf-8').replace(/^﻿/, '');
  const pois = JSON.parse(raw);

  let foodPois = pois.filter(p => p.category === 'food');

  let targets;
  if (targetId) {
    targets = foodPois.filter(p => p.id === targetId);
    if (!targets.length) { console.log('POI не найден:', targetId); process.exit(1); }
  } else {
    targets = foodPois.slice(0, 25);
  }

  console.log(`\nPOI для обработки: ${targets.length}`);
  console.log(`Категории: Внутри (${PHOTOS_PER_CATEGORY}) + Еда (${PHOTOS_PER_CATEGORY})\n`);

  const browser = await puppeteer.launch({
    headless: false,
    defaultViewport: null,
    args: ['--start-maximized', '--no-sandbox'],
  });

  const page = await browser.newPage();
  await page.setUserAgent(
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.0.0 Safari/537.36'
  );

  // Прогрев — сначала заходим на главную Яндекс
  await page.goto('https://yandex.ru', { waitUntil: 'networkidle2', timeout: 20000 });
  await sleep(2000);

  const report = [];

  for (let i = 0; i < targets.length; i++) {
    const poi  = targets[i];
    const name = poi.name.ru;
    console.log(`\n[${i + 1}/25] [${poi.id}] ${name}`);

    // Находим gallery URL
    let galleryUrl = null;
    try {
      galleryUrl = await findGalleryUrl(page, name);
    } catch (err) {
      console.log(`  ✗ ошибка поиска: ${err.message}`);
    }

    if (!galleryUrl) {
      console.log('  ✗ галерея не найдена, пропускаю');
      report.push({ id: poi.id, name, downloaded: 0, status: 'не найдено' });
      await sleep(DELAY_POI);
      continue;
    }

    console.log(`  → ${galleryUrl}`);

    const slug     = poi.slug || poi.id;
    const existing = poi.photos?.length ?? 0;
    let   idx      = existing + 1;
    const saved    = [];

    // Скачиваем из двух фильтров
    for (const [filterName, suffix] of [['Внутри', 'in'], ['Еда', 'food']]) {
      console.log(`  → фильтр «${filterName}»`);

      let urls = [];
      try {
        urls = await fetchFromFilter(page, galleryUrl, filterName, PHOTOS_PER_CATEGORY);
      } catch (err) {
        console.log(`    ✗ ошибка: ${err.message}`);
      }

      console.log(`    найдено URL: ${urls.length}`);

      for (const url of urls) {
        const file = path.join(IMAGES_DIR, `${slug}_${suffix}_${idx}.jpg`);
        try {
          await downloadFile(url, file);
          const size = fs.statSync(file).size;
          if (size < 5000) {
            fs.unlinkSync(file);
            console.log(`    ✗ пропущено (${size}b)`);
          } else {
            toWebP(file);
            saved.push(`/images/pois/${slug}_${suffix}_${idx}.jpg`);
            console.log(`    ✓ ${path.basename(file)} (${Math.round(size / 1024)}kb)`);
            idx++;
          }
        } catch (e) {
          console.log(`    ✗ ошибка загрузки: ${e.message}`);
        }
        await sleep(300);
      }

      await sleep(DELAY_SHORT); // пауза между фильтрами
    }

    report.push({ id: poi.id, name, downloaded: saved.length });

    if (saved.length > 0) {
      poi.photos = [...(poi.photos ?? []), ...saved];
      // Сохраняем после каждого POI — чтобы не потерять при сбое
      fs.writeFileSync(POIS_FILE, JSON.stringify(pois, null, 4), 'utf-8');
    }

    console.log(`  → итог: ${saved.length} фото`);
    await sleep(DELAY_POI); // пауза между заведениями
  }

  await browser.close();

  console.log('\n═══════════ ИТОГ ═══════════');
  let total = 0;
  for (const r of report) {
    const d = r.downloaded ?? 0;
    total += d;
    console.log(`${r.id} | ${r.name} | ${r.status ?? `скачано ${d}`}`);
  }
  console.log(`\nВсего скачано: ${total} фото`);
}

main().catch(err => { console.error(err); process.exit(1); });
