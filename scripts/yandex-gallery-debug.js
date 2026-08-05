// Смотрим что за фильтры есть на странице галереи
import puppeteer from 'puppeteer';

const sleep = ms => new Promise(r => setTimeout(r, ms));

const browser = await puppeteer.launch({
  headless: false,
  defaultViewport: null,
  args: ['--start-maximized', '--no-sandbox'],
});

const page = await browser.newPage();
await page.setUserAgent(
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.0.0 Safari/537.36'
);

await page.goto('https://yandex.com/maps/org/stariy_most/236747243944/gallery/', {
  waitUntil: 'networkidle2', timeout: 30000
});
await sleep(3000);

await page.screenshot({ path: 'scripts/gallery-debug.png' });

// Все кликабельные элементы — ищем фильтры
const items = await page.evaluate(() => {
  const els = document.querySelectorAll('a, button, [role=tab], [class*="filter"], [class*="tab"], [class*="rubric"], [class*="tag"]');
  return [...els].map(el => ({
    tag: el.tagName,
    text: el.textContent?.trim().slice(0, 80),
    cls: el.className?.toString().slice(0, 100),
    href: el.href || '',
  })).filter(e => e.text && e.text.length < 60);
});

console.log('\nВсе элементы:');
items.forEach(e => console.log(JSON.stringify(e)));

await browser.close();
