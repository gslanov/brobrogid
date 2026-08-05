// Отладка: смотрим что Яндекс показывает и какие есть кнопки/вкладки
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

const query = encodeURIComponent('Старый мостъ Владикавказ');
await page.goto(`https://yandex.ru/maps/995/vladikavkaz/?text=${query}`, {
  waitUntil: 'networkidle2', timeout: 30000
});
await sleep(3000);

await page.screenshot({ path: 'scripts/debug1.png', fullPage: false });
console.log('Скриншот 1 сохранён');

// Все кликабельные элементы с текстом
const clickables = await page.evaluate(() => {
  const els = document.querySelectorAll('a, button, [role=tab], [class*=tab]');
  return [...els].map(el => ({
    tag: el.tagName,
    text: el.textContent?.trim().slice(0, 60),
    cls: el.className?.toString().slice(0, 80),
    href: el.href || '',
  })).filter(e => e.text);
});

console.log('\nКликабельные элементы:');
clickables.forEach(e => console.log(JSON.stringify(e)));

await browser.close();
