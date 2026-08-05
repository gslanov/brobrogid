import puppeteer from 'puppeteer';

const sleep = ms => new Promise(r => setTimeout(r, ms));

const browser = await puppeteer.launch({ headless: false, defaultViewport: null, args: ['--start-maximized'] });
const page = await browser.newPage();
await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.0.0 Safari/537.36');

await page.goto('https://yandex.com/maps/org/vertel/1692140453/gallery/', { waitUntil: 'networkidle2', timeout: 30000 });
await sleep(3000);

// Кликаем Внутри
await page.evaluate(() => {
  const els = document.querySelectorAll('button, a, [role="tab"], [class*="tab"], [class*="filter"], [class*="pill"]');
  for (const el of els) {
    if (['Внутри','Интерьер'].includes(el.textContent?.trim())) { el.click(); return; }
  }
});
await sleep(2000);

for (let i = 0; i < 5; i++) { await page.evaluate(() => window.scrollBy(0, 800)); await sleep(400); }

const result = await page.evaluate(() => {
  const imgs = [...document.querySelectorAll('img')].map(i => i.src).filter(s => s && !s.endsWith('.svg') && s.length > 20);
  const divBg = [...document.querySelectorAll('[style*="background"]')].map(d => d.getAttribute('style')).filter(Boolean);
  return { imgs: imgs.slice(0, 20), divBg: divBg.slice(0, 10) };
});

console.log('IMG src найдено:', result.imgs.length);
result.imgs.forEach(s => console.log(' ', s.slice(0, 120)));
console.log('\nBackground-image найдено:', result.divBg.length);
result.divBg.forEach(s => console.log(' ', s.slice(0, 120)));

await browser.close();
