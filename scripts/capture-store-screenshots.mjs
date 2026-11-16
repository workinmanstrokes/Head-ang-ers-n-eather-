/**
 * Store screenshots of the running app at 1080×1920 (360×640 CSS pixels, 3×).
 * Writes docs/store/screenshots. These are the real board, not placeholder art.
 */
import { spawn } from 'node:child_process';
import { mkdir } from 'node:fs/promises';
import { createServer } from 'node:net';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import puppeteer from 'puppeteer-core';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const outDir = resolve(root, 'docs/store/screenshots');
const chrome = process.env.CHROME_PATH || '/usr/local/bin/google-chrome';

function freePort() {
  return new Promise((resolvePort, reject) => {
    const server = createServer();
    server.listen(0, '127.0.0.1', () => {
      const { port } = server.address();
      server.close(() => resolvePort(port));
    });
    server.on('error', reject);
  });
}

const port = await freePort();
const server = spawn('python3', ['-m', 'http.server', String(port), '-d', 'www'], {
  cwd: root,
  stdio: 'ignore',
});

let browser;
try {
  await new Promise((r) => setTimeout(r, 300));
  await mkdir(outDir, { recursive: true });
  browser = await puppeteer.launch({
    executablePath: chrome,
    headless: 'new',
    args: ['--no-sandbox', '--disable-dev-shm-usage', '--hide-scrollbars'],
  });
  const page = await browser.newPage();
  await page.setViewport({ width: 360, height: 640, deviceScaleFactor: 3, isMobile: true, hasTouch: true });
  await page.goto(`http://127.0.0.1:${port}/index.html`, { waitUntil: 'networkidle0' });
  await page.waitForFunction(() => (document.getElementById('status') || {}).textContent.includes('ready'), { timeout: 8000 });
  await page.evaluate(() => document.fonts && document.fonts.ready);

  const shots = [
    ['01-board.png', async () => {}],
    ['02-find.png', async () => {
      await page.click('[data-open="search"]');
      await page.waitForSelector('#panel-search:not([hidden])');
    }],
    ['03-record.png', async () => {
      await page.click('.sheet-head [data-close]');
      await page.click('[data-open="record"]');
      await page.waitForSelector('#panel-record:not([hidden])');
    }],
    ['04-chain.png', async () => {
      await page.click('.sheet-head [data-close]');
      await page.click('[data-open="macro"]');
      await page.waitForSelector('#panel-macro:not([hidden])');
    }],
    ['05-more.png', async () => {
      await page.click('.sheet-head [data-close]');
      await page.click('[data-open="more"]');
      await page.waitForSelector('#statsToggle');
      await page.waitForFunction(() => (document.getElementById('statsState') || {}).textContent.length > 0);
    }],
  ];

  for (const [name, prepare] of shots) {
    await prepare();
    await page.screenshot({ path: resolve(outDir, name), type: 'png' });
    console.log(name);
  }
} finally {
  if (browser) await browser.close();
  server.kill();
}
