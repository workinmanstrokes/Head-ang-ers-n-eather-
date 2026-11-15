import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';

const read = (path) => readFileSync(new URL('../' + path, import.meta.url), 'utf8');

test('keeps the existing app id and does not use the unapproved name or package', () => {
  const config = read('capacitor.config.json');
  const html = read('www/index.html');
  const privacy = read('docs/privacy/soundboard.html');
  const blob = config + html + privacy + read('www/app.js') + read('www/manifest.webmanifest');
  assert.match(config, /"appId": "com\.soundboard\.app"/);
  assert.match(config, /"appName": "Soundboard"/);
  assert.doesNotMatch(blob, /Laugh Pad/i);
  assert.doesNotMatch(blob, /com\.diddlerrr\.laughpad/);
  assert.doesNotMatch(blob, /com\.diddlerrr\.soundboard/);
});

test('privacy link is the GitHub Pages soundboard policy', () => {
  const html = read('www/index.html');
  const url = 'https://workinmanstrokes.github.io/test-builds/privacy/soundboard.html';
  assert.equal(html.split(url).length - 1, 2);
  assert.match(read('docs/privacy/soundboard.html'), /mscofield1588@gmail.com/);
  assert.match(read('docs/privacy/soundboard.html'), /Diddlerrr/);
  assert.match(read('docs/privacy/soundboard.html'), /does not show ads/);
  assert.match(read('docs/privacy/soundboard.html'), /does not include advertising SDKs, analytics SDKs/);
  assert.match(read('docs/privacy/soundboard.html'), /microphone/i);
});
