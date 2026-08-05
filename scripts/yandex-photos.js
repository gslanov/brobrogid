/**
 * Скачивает фото для food POI с Яндекс.Карт.
 * Запуск: node scripts/yandex-photos.js [poi-id]
 *   без аргумента — все food POI у которых < MIN_PHOTOS фото
 *   с аргументом  — только конкретный POI
 */

import puppeteer from 'puppeteer';
import fs from 'fs';
import path from 'path';
import https from 'https';
import http from 'http';
import { execSync } from 'child_process';

const POIS_FILE  = 'public/content/pois.json';
const IMAGES_DIR = 'public/images/pois';
const MIN_PHOTOS = 5;   // если меньше — качаем
const MAX_PHOTOS = 10;  // сколько максимум скачать на один POI
const DELAY_MS   = 1500;

const sleep = ms => new Promise(r => setTimeout(r, ms));

function slugFromId(poi) {
  return poi.slug || poi.id;
}

function downloadFile(url, dest) {
  return new Promise((resolve, reject) => {
    const file  = fs.createWriteStream(dest);
    const proto = url.startsWith('https') ? https : http;
    const req   = proto.get(url, { headers: { 'Referer': 'https://yandex.com/' } }, res => {
      if (res.statusCode === 302 || res.statusCode === 301) {
        file.close();
        return downloadFile(res.headers.location, dest).then(resolve).catch(reject);
      }
      if (res.statusCode !== 200) {
        file.close();
        return reject(new Error(`HTTP ${res.statusCode}`));
      }
      res.pipe(file);
      file.on('finish', () => file.close(resolve));
    });
    req.on('error', reject);
  });
}

// Находит ссылку на галерею в карточке и возвращает URL галереи
async function findGalleryUrl(page, poiName) {
  const query = encodeURIComponent(`${poiName} Владикавказ`);
  const url   = `https://yandex.ru/maps/995/vladikavkaz/?text=${query}`;

  await page.goto(url, { waitUntil: 'networkidle2', timeout: 30000 });
  await sleep(DELAY_MS);

  // Ищем ссылку на галерею вида /gallery/
  const galleryUrl = await page.evaluate(() => {
    const links = document.querySelectorAll('a.tabs-select-view__label');
    for (const a of links) {
      if (a.textContent?.trim() === 'Фото' && a.href?.includes('/gallery/')) {
        return a.href;
      }
    }
    return null;
  });

  return galleryUrl;
}

// Скачивает фото из галереи Яндекс.Карт
async function downloadFromGallery(page, galleryUrl, maxPhotos) {
  await page.goto(galleryUrl, { waitUntil: 'networkidle2', timeout: 30000 });
  await sleep(DELAY_MS);

  // Ждём появления фото
  try {
    await page.waitForSelector(
      '.photo-album-view__photo img, .gallery-item img, [class*="photo"] img',
      { timeout: 10000 }
    );
  } catch {
    // попробуем без ожидания — может уже есть
  }

  // Прокручиваем для подгрузки
  for (let i = 0; i < 6; i++) {
    await page.evaluate(() => window.scrollBy(0, 800));
    await sleep(500);
  }

  // Собираем URL фото
  const urls = await page.evaluate((max) => {
    const result = new Set();

    // Все img на странице
    const imgs = document.querySelectorAll('img');
    for (const img of imgs) {
      const src = img.src || img.dataset.src || '';
      // Яндекс фото хранит на avatars.mds.yandex.net
      if (src.includes('avatars.mds.yandex.net') || src.includes('avatars.yandex.net')) {
        // Апгрейд до максимального размера
        const big = src
          .replace(/\/\d+x\d+$/, '/orig')
          .replace(/size=\w+/, 'size=XXL')
          .replace(/\/[a-z]+\/[a-z]+\/\d+x\d+\//, '/orig/');
        result.add(big);
      }
      if (result.size >= max) break;
    }

    // Также ищем по background-image
    if (result.size < max) {
      const divs = document.querySelectorAll('[style*="background-image"]');
      for (const div of divs) {
        const style = div.getAttribute('style') || '';
        const m = style.match(/url\(["']?([^"')]+)["']?\)/);
        if (m && (m[1].includes('avatars.mds') || m[1].includes('avatars.yandex'))) {
          result.add(m[1].replace(/\/\d+x\d+$/, '/orig'));
        }
        if (result.size >= max) break;
      }
    }

    return [...result];
  }, maxPhotos);

  return urls;
}

async function main() {
  const targetId = process.argv[2] || null;

  const raw  = fs.readFileSync(POIS_FILE, 'utf-8').replace(/^﻿/, '');
  const pois = JSON.parse(raw);

  let targets = pois.filter(p => p.category === 'food');
  if (targetId) {
    targets = targets.filter(p => p.id === targetId);
    if (!targets.length) { console.log('POI не найден:', targetId); process.exit(1); }
  } else {
    targets = targets.filter(p => (p.photos?.length ?? 0) < MIN_PHOTOS);
  }

  console.log(`\nPOI для обработки: ${targets.length}\n`);
  if (!targets.length) { console.log('Всё уже есть.'); return; }

  const browser = await puppeteer.launch({
    headless: false,
    defaultViewport: null,
    args: ['--start-maximized', '--no-sandbox'],
  });

  const page = await browser.newPage();
  await page.setUserAgent(
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.0.0 Safari/537.36'
  );

  const report = [];

  for (const poi of targets) {
    const name     = poi.name.ru;
    const existing = poi.photos?.length ?? 0;
    console.log(`\n[${poi.id}] ${name} (уже ${existing} фото)`);

    // 1. Находим URL галереи
    let galleryUrl = null;
    try {
      galleryUrl = await findGalleryUrl(page, name);
    } catch (err) {
      console.log('  ✗ ошибка поиска:', err.message);
    }

    if (!galleryUrl) {
      console.log('  ✗ галерея не найдена, пропускаю');
      report.push({ id: poi.id, name, downloaded: 0, status: 'не найдено' });
      continue;
    }

    console.log(`  → галерея: ${galleryUrl}`);

    // 2. Скачиваем URL фото
    let photoUrls = [];
    try {
      photoUrls = await downloadFromGallery(page, galleryUrl, MAX_PHOTOS);
    } catch (err) {
      console.log('  ✗ ошибка галереи:', err.message);
    }

    console.log(`  → найдено URL: ${photoUrls.length}`);

    // 3. Сохраняем файлы
    const slug  = slugFromId(poi);
    const saved = [];
    let   idx   = existing + 1;

    for (const url of photoUrls) {
      const ext  = url.includes('.webp') ? 'webp' : 'jpg';
      const file = path.join(IMAGES_DIR, `${slug}_${idx}.${ext}`);
      try {
        await downloadFile(url, file);
        const size = fs.statSync(file).size;
        if (size < 5000) {
          // файл слишком мал — скорее всего иконка, удаляем
          fs.unlinkSync(file);
          console.log(`  ✗ пропущено (слишком мало ${size}b): ${path.basename(file)}`);
        } else {
          saved.push(`/images/pois/${slug}_${idx}.${ext}`);
          console.log(`  ✓ ${path.basename(file)} (${Math.round(size / 1024)}kb)`);
          idx++;
        }
        // Конвертируем в WebP
        const webpFile = file.replace(/\.jpg$/, '.webp');
        try {
          execSync(`python -c "from PIL import Image; img=Image.open(r'${file}'); img.convert('RGB').save(r'${webpFile}','WEBP',quality=85)"`, { stdio: 'ignore' });
        } catch { /* WebP не критично */ }
      } catch (e) {
        console.log(`  ✗ ошибка загрузки: ${e.message}`);
      }
      await sleep(300);
    }

    report.push({ id: poi.id, name, downloaded: saved.length });

    if (saved.length > 0) {
      poi.photos = [...(poi.photos ?? []), ...saved];
    }

    await sleep(DELAY_MS);
  }

  // Сохраняем pois.json
  fs.writeFileSync(POIS_FILE, JSON.stringify(pois, null, 4), 'utf-8');

  await browser.close();

  console.log('\n═══════════ ИТОГ ═══════════');
  for (const r of report) {
    const status = r.status || `скачано ${r.downloaded}`;
    console.log(`${r.id} | ${r.name} | ${status}`);
  }
}

main().catch(err => { console.error(err); process.exit(1); });
