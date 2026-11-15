import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';

const read = (path) => readFileSync(new URL('../' + path, import.meta.url), 'utf8');

test('uses the approved Laugh Pad id and display name', () => {
  const config = read('capacitor.config.json');
  const html = read('www/index.html');
  const privacy = read('docs/privacy/soundboard.html');
  const manifest = read('www/manifest.webmanifest');
  assert.match(config, /"appId": "com\.diddlerrr\.laughpad"/);
  assert.match(config, /"appName": "Laugh Pad"/);
  assert.match(html, /<title>Laugh Pad: Meme Soundboard<\/title>/);
  assert.match(html, /<h1>Laugh Pad: Meme Soundboard<\/h1>/);
  assert.match(manifest, /"name": "Laugh Pad: Meme Soundboard"/);
  assert.match(manifest, /"short_name": "Laugh Pad"/);
  assert.match(privacy, /Laugh Pad: Meme Soundboard/);
  assert.match(privacy, /com\.diddlerrr\.laughpad/);
  assert.match(html, /https:\/\/workinmanstrokes\.github\.io\/test-builds\/privacy\/soundboard\.html/);
  assert.doesNotMatch(config + read('android/app/build.gradle'), /com\.soundboard\.app/);
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
