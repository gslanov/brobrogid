/**
 * Скачивает фото меню (5 шт) и интерьера (5 шт) для food POI с 26 по 50.
 * Запуск: node scripts/yandex-menu-interior.js [poi-id]
 */

import puppeteer from 'puppeteer';
import fs from 'fs';
import path from 'path';
import https from 'https';
import http from 'http';
import { execSync } from 'child_process';

const POIS_FILE  = 'public/content/pois.json';
const IMAGES_DIR = 'public/images/pois';
const DELAY_MS   = 1500;
const MAX_PER_CAT = 5;

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

function extractYandexImgUrls(max) {
  const result = new Set();
  const imgs = document.querySelectorAll('img');
  for (const img of imgs) {
    const src = img.src || img.dataset.src || '';
    if (src.includes('avatars.mds.yandex.net') || src.includes('avatars.yandex.net')) {
      const big = src.replace(/\/\d+x\d+$/, '/orig').replace(/size=\w+/, 'size=XXL');
      result.add(big);
    }
    if (result.size >= max) break;
  }
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
}

async function findGalleryUrl(page, poiName) {
  const query = encodeURIComponent(`${poiName} Владикавказ`);
  await page.goto(`https://yandex.ru/maps/995/vladikavkaz/?text=${query}`, {
    waitUntil: 'networkidle2', timeout: 30000
  });
  await sleep(DELAY_MS);

  return await page.evaluate(() => {
    const links = document.querySelectorAll('a');
    for (const a of links) {
      if (a.textContent?.trim() === 'Фото' && a.href?.includes('/gallery/')) return a.href;
    }
    // Попробуем по классу
    const tabs = document.querySelectorAll('.tabs-select-view__label, [class*="tab"]');
    for (const t of tabs) {
      if (t.textContent?.trim() === 'Фото' && t.href?.includes('/gallery/')) return t.href;
    }
    return null;
  });
}

// Переходим в галерею и кликаем нужную вкладку (Меню / Внутри)
// Перехватываем реальные URL через сетевые запросы (обход lazy load)
async function getPhotosByCategory(page, galleryUrl, categoryNames, maxPhotos) {
  const captured = new Set();

  // Перехват сетевых запросов к Яндекс CDN
  const onResponse = response => {
    const url = response.url();
    if (url.includes('avatars.mds.yandex.net') || url.includes('avatars.yandex.net')) {
      const big = url.replace(/\/\d+x\d+$/, '/orig').replace(/size=\w+/, 'size=XXL');
      captured.add(big);
    }
  };
  page.on('response', onResponse);

  await page.goto(galleryUrl, { waitUntil: 'networkidle2', timeout: 30000 });
  await sleep(DELAY_MS);

  // Ищем и кликаем вкладку
  const clicked = await page.evaluate((names) => {
    const candidates = document.querySelectorAll(
      'button, a, [role="tab"], [class*="tab"], [class*="filter"], [class*="pill"]'
    );
    for (const el of candidates) {
      const txt = el.textContent?.trim();
      if (names.includes(txt)) { el.click(); return txt; }
    }
    return null;
  }, categoryNames);

  if (clicked) {
    console.log(`    → вкладка "${clicked}" найдена, ждём загрузки...`);
    await sleep(2000);
  } else {
    console.log(`    → вкладка не найдена, берём из общей галереи`);
  }

  // Прокручиваем — это триггерит lazy load и сетевые запросы
  for (let i = 0; i < 10; i++) {
    await page.evaluate(() => window.scrollBy(0, 600));
    await sleep(500);
  }
  await sleep(1000);

  page.off('response', onResponse);
  return [...captured].slice(0, maxPhotos);
}

async function savePhotos(urls, slug, prefix, startIdx) {
  const saved = [];
  let idx = startIdx;
  for (const url of urls) {
    const ext  = url.includes('.webp') ? 'webp' : 'jpg';
    const file = path.join(IMAGES_DIR, `${slug}_${prefix}_${idx}.${ext}`);
    try {
      await downloadFile(url, file);
      const size = fs.statSync(file).size;
      if (size < 5000) {
        fs.unlinkSync(file);
        console.log(`    ✗ пропущено (слишком мало ${size}b)`);
      } else {
        // Конвертируем в WebP
        const webpFile = file.replace(/\.(jpg|jpeg|png)$/i, '.webp');
        try {
          execSync(`python -c "from PIL import Image; img=Image.open(r'${file}'); img.convert('RGB').save(r'${webpFile}','WEBP',quality=85)"`, { stdio: 'ignore' });
          if (fs.existsSync(webpFile) && webpFile !== file) fs.unlinkSync(file);
          const finalPath = `/images/pois/${slug}_${prefix}_${idx}.webp`;
          saved.push(finalPath);
          console.log(`    ✓ ${slug}_${prefix}_${idx}.webp (${Math.round(size / 1024)}kb)`);
        } catch {
          const photoPath = `/images/pois/${slug}_${prefix}_${idx}.${ext}`;
          saved.push(photoPath);
          console.log(`    ✓ ${path.basename(file)} (${Math.round(size / 1024)}kb)`);
        }
        idx++;
      }
    } catch (e) {
      console.log(`    ✗ ошибка: ${e.message}`);
    }
    await sleep(300);
    if (saved.length >= MAX_PER_CAT) break;
  }
  return saved;
}

async function main() {
  const targetId = process.argv[2] || null;

  const raw  = fs.readFileSync(POIS_FILE, 'utf-8').replace(/^﻿/, '');
  const pois = JSON.parse(raw);

  const allFood = pois.filter(p => p.category === 'food');
  let targets;

  if (targetId) {
    targets = allFood.filter(p => p.id === targetId);
    if (!targets.length) { console.log('POI не найден:', targetId); process.exit(1); }
  } else {
    // С 1-й по 25-ю точку (индексы 0–24)
    targets = allFood.slice(0, 25);
  }

  console.log(`\nPOI для обработки: ${targets.length}\n`);

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
    const name = poi.name.ru;
    const slug = poi.slug || poi.id;
    console.log(`\n[${poi.id}] ${name}`);

    // Находим URL галереи
    let galleryUrl = null;
    try {
      galleryUrl = await findGalleryUrl(page, name);
    } catch (err) {
      console.log('  ✗ ошибка поиска:', err.message);
    }

    if (!galleryUrl) {
      console.log('  ✗ галерея не найдена, пропускаю');
      report.push({ id: poi.id, name, menu: 0, interior: 0, status: 'не найдено' });
      continue;
    }

    console.log(`  → галерея: ${galleryUrl}`);

    // 1. Интерьер
    console.log(`  [Интерьер]`);
    let interiorUrls = [];
    try {
      interiorUrls = await getPhotosByCategory(
        page, galleryUrl,
        ['Внутри', 'Интерьер', 'Inside', 'Interior'],
        MAX_PER_CAT + 3
      );
    } catch (e) { console.log('  ✗', e.message); }

    const interiorSaved = await savePhotos(interiorUrls, slug, 'int', 1);

    // 2. Меню
    console.log(`  [Меню]`);
    let menuUrls = [];
    try {
      menuUrls = await getPhotosByCategory(
        page, galleryUrl,
        ['Меню', 'Menu', 'Блюда', 'Еда'],
        MAX_PER_CAT + 3
      );
    } catch (e) { console.log('  ✗', e.message); }

    const menuSaved = await savePhotos(menuUrls, slug, 'menu', 1);

    // Добавляем в pois.json
    const allNew = [...interiorSaved, ...menuSaved];
    if (allNew.length > 0) {
      const poiInArr = pois.find(p => p.id === poi.id);
      poiInArr.photos = [...(poiInArr.photos ?? []), ...allNew];
    }

    report.push({ id: poi.id, name, interior: interiorSaved.length, menu: menuSaved.length });
    await sleep(DELAY_MS);
  }

  // Сохраняем pois.json
  fs.writeFileSync(POIS_FILE, JSON.stringify(pois, null, 4), 'utf-8');
  await browser.close();

  console.log('\n═══════════════════════════ ИТОГ ═══════════════════════════');
  for (const r of report) {
    if (r.status) {
      console.log(`${r.id} | ${r.name} | ${r.status}`);
    } else {
      console.log(`${r.id} | ${r.name} | интерьер: ${r.interior} | меню: ${r.menu}`);
    }
  }
}

main().catch(err => { console.error(err); process.exit(1); });
