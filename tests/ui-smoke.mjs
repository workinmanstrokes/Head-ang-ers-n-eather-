/**
 * Phone-sized UI smoke test. Serves www/ and drives system Chrome.
 * Saves screenshots under /opt/cursor/artifacts/screenshots.
 */
import { spawn } from 'node:child_process';
import { mkdir, rm } from 'node:fs/promises';
import { createServer } from 'node:net';
import puppeteer from 'puppeteer-core';

const OUT = '/opt/cursor/artifacts/screenshots';
const CHROME = process.env.CHROME_PATH || '/usr/local/bin/google-chrome';

function freePort() {
  return new Promise((resolve, reject) => {
    const server = createServer();
    server.listen(0, '127.0.0.1', () => {
      const { port } = server.address();
      server.close(() => resolve(port));
    });
    server.on('error', reject);
  });
}

const port = await freePort();
const server = spawn('python3', ['-m', 'http.server', String(port), '-d', 'www'], {
  cwd: new URL('..', import.meta.url).pathname,
  stdio: 'ignore',
});

const failures = [];
function check(cond, message) {
  if (!cond) failures.push(message);
}

let browser;
try {
  await new Promise((r) => setTimeout(r, 300));
  browser = await puppeteer.launch({
    executablePath: CHROME,
    headless: 'new',
    args: [
      '--no-sandbox',
      '--disable-dev-shm-usage',
      '--autoplay-policy=no-user-gesture-required',
      '--use-fake-ui-for-media-stream',
      '--use-fake-device-for-media-stream',
    ],
  });
  const page = await browser.newPage();
  const errors = [];
  const leaks = [];
  page.on('pageerror', (err) => errors.push(String(err)));
  page.on('request', (req) => {
    if (/sentry\.io|posthog\.com/.test(req.url())) leaks.push(req.url());
  });
  await page.setViewport({ width: 360, height: 800, deviceScaleFactor: 3, isMobile: true, hasTouch: true });
  await page.evaluateOnNewDocument(() => {
    window.__micCalls = 0;
    const orig = navigator.mediaDevices && navigator.mediaDevices.getUserMedia
      ? navigator.mediaDevices.getUserMedia.bind(navigator.mediaDevices)
      : null;
    if (navigator.mediaDevices) {
      navigator.mediaDevices.getUserMedia = (...args) => {
        window.__micCalls += 1;
        const error = new Error('denied');
        error.name = 'NotAllowedError';
        return Promise.reject(error);
      };
    }
    window.__origGetUserMedia = orig;
  });
  await page.goto(`http://127.0.0.1:${port}/index.html#test`, { waitUntil: 'domcontentloaded' });
  await page.waitForFunction(() => (document.getElementById('status') || {}).textContent.includes('ready'), { timeout: 8000 });
  await mkdir(OUT, { recursive: true });

  const metrics = await page.evaluate(() => {
    const pads = [...document.querySelectorAll('.pad')];
    const stop = document.getElementById('stopAll').getBoundingClientRect();
    const pad = pads[0].getBoundingClientRect();
    return {
      pads: pads.length,
      padH: pad.height,
      stopH: stop.height,
      overflow: document.documentElement.scrollWidth > document.documentElement.clientWidth + 1,
      privacy: document.getElementById('privacyLink').href,
      mic: window.__micCalls,
      text: document.body.innerText,
    };
  });
  check(metrics.pads === 16, 'expected 16 pads, got ' + metrics.pads);
  check(metrics.padH >= 120, 'pad too small ' + metrics.padH);
  check(metrics.stopH >= 48, 'stop too small ' + metrics.stopH);
  check(metrics.overflow === false, 'horizontal overflow');
  check(metrics.privacy === 'https://workinmanstrokes.github.io/test-builds/privacy/soundboard.html', 'privacy href');
  check(metrics.mic === 0, 'microphone was requested at launch');
  check(/Laugh Pad: Meme Soundboard/.test(metrics.text), 'display name missing');

  await page.screenshot({ path: OUT + '/01-board.png' });

  const padBox = await page.$('.pad');
  const box = await padBox.boundingBox();
  await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
  await page.mouse.down();
  await page.screenshot({ path: OUT + '/02-pad-pressed.png' });
  await page.mouse.up();

  const voices = await page.evaluate(() => {
    for (let i = 0; i < 30; i++) window.__sb.playIndex(i % 4);
    return window.__sb.activeVoices();
  });
  check(voices <= 12, 'polyphony ' + voices);
  await page.click('#stopAll');
  await new Promise((r) => setTimeout(r, 120));
  const after = await page.evaluate(() => window.__sb.activeVoices());
  check(after === 0, 'voices stuck after stop ' + after);

  await page.click('[data-open="search"]');
  await page.waitForSelector('#panel-search:not([hidden])');
  await page.screenshot({ path: OUT + '/03-search.png' });
  await page.click('.sheet-head [data-close]');

  await page.click('[data-open="record"]');
  await page.waitForSelector('#panel-record:not([hidden])');
  const recCopy = await page.$eval('#panel-record', (el) => el.innerText);
  check(/microphone/i.test(recCopy), 'recorder does not explain the microphone');
  check(/not uploaded/i.test(recCopy), 'recorder does not say recordings stay on device');
  await page.screenshot({ path: OUT + '/04-record.png' });
  await page.click('#recBtn');
  await page.waitForFunction(() => window.__micCalls >= 1, { timeout: 5000 });
  const denied = await page.$eval('#recStatus', (el) => el.textContent);
  check(/Microphone access is off/i.test(denied), 'denial message: ' + denied);
  check(await page.evaluate(() => document.querySelectorAll('.pad').length === 16), 'board broke after denial');
  await page.screenshot({ path: OUT + '/05-record-denied.png' });
  await page.click('.sheet-head [data-close]');

  await page.click('[data-open="macro"]');
  await page.waitForSelector('#panel-macro:not([hidden])');
  await page.screenshot({ path: OUT + '/06-chain.png' });
  await page.click('#macroArm');
  await page.click('.sheet-head [data-close]');
  await page.click('.pad');
  await page.click('[data-open="macro"]');
  await page.type('#macroName', 'Hit');
  await page.click('#macroSave');
  await page.click('.sheet-head [data-close]');
  const chips = await page.$$('.chip');
  check(chips.length === 1, 'chain chip missing');
  await page.screenshot({ path: OUT + '/07-chain-saved.png' });

  await page.click('[data-open="more"]');
  await page.waitForSelector('#panel-more:not([hidden])');
  await page.screenshot({ path: OUT + '/08-more.png' });
  const statsOn = await page.$eval('#statsToggle', (el) => el.checked);
  const statsText = await page.$eval('#statsState', (el) => el.textContent);
  check(statsOn === true, 'stats switch should start on');
  check(/nothing is sent/i.test(statsText), 'blank keys should send nothing: ' + statsText);
  await page.click('#statsToggle');
  await page.waitForFunction(() => localStorage.getItem('laughpad.stats.v1') === 'off');
  await page.reload({ waitUntil: 'domcontentloaded' });
  await page.waitForFunction(() => (document.getElementById('status') || {}).textContent.includes('ready'), { timeout: 8000 });
  await page.click('[data-open="more"]');
  await page.waitForSelector('#statsToggle');
  const statsOff = await page.$eval('#statsToggle', (el) => el.checked);
  const offText = await page.$eval('#statsState', (el) => el.textContent);
  check(statsOff === false, 'stats switch did not stay off');
  check(/Off/.test(offText), 'off copy: ' + offText);
  check(leaks.length === 0, 'telemetry network calls: ' + leaks.join(' '));
  await page.click('#editArm');
  await page.click('.pad');
  await page.waitForSelector('#panel-editor:not([hidden])');
  await page.screenshot({ path: OUT + '/09-editor.png' });

  check(errors.length === 0, 'page errors: ' + errors.join('\n'));
  if (failures.length) {
    console.error(failures.join('\n'));
    process.exitCode = 1;
  } else {
    console.log('ui smoke ok');
  }
} catch (err) {
  console.error(err);
  process.exitCode = 1;
} finally {
  if (browser) await browser.close();
  server.kill();
}
