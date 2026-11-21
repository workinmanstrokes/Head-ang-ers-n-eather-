import assert from 'node:assert/strict';
import test from 'node:test';
import { archiveDownloadUrl, archiveSearchUrl, parseDuration, pickClipFile, safeTerm } from '../www/lib/archive.js';
import { contrast, inkFor } from '../www/lib/color.js';
import { classifyLicense, formatAttribution } from '../www/lib/licenses.js';
import { selectVoicesToSteal, MAX_VOICES } from '../www/lib/voices.js';

test('license allowlist accepts PD, CC0, BY, BY-SA and rejects NC, ND, and blank', () => {
  assert.equal(classifyLicense('https://creativecommons.org/publicdomain/zero/1.0/').id, 'cc0');
  assert.equal(classifyLicense('http://creativecommons.org/publicdomain/mark/1.0/').ok, true);
  assert.equal(classifyLicense('http://creativecommons.org/licenses/publicdomain/').id, 'pd');
  assert.equal(classifyLicense('https://creativecommons.org/licenses/by/4.0/').name, 'CC BY');
  assert.equal(classifyLicense('https://creativecommons.org/licenses/by-sa/4.0/').name, 'CC BY-SA');
  assert.equal(classifyLicense('', 'No known copyright restrictions').ok, true);
  for (const url of [
    'https://creativecommons.org/licenses/by-nc/4.0/',
    'https://creativecommons.org/licenses/by-nd/4.0/',
    'https://creativecommons.org/licenses/by-nc-sa/4.0/',
    'https://creativecommons.org/licenses/by-nc-nd/4.0/',
    '',
    'https://example.com/all-rights-reserved',
  ]) {
    assert.equal(classifyLicense(url).ok, false, url);
  }
});

test('attribution names the work, the creator, and the deed', () => {
  const line = formatAttribution({
    title: 'Door',
    creator: 'Ada',
    license: { name: 'CC BY', url: 'https://creativecommons.org/licenses/by/4.0/' },
    identifier: 'door',
  });
  assert.match(line, /Door by Ada/);
  assert.match(line, /CC BY/);
  assert.match(line, /creativecommons\.org/);
});

test('duration parser accepts seconds and clock times', () => {
  assert.equal(parseDuration('12.5'), 12.5);
  assert.equal(parseDuration(3), 3);
  assert.equal(parseDuration('00:12'), 12);
  assert.equal(parseDuration('01:02'), 62);
  assert.equal(parseDuration('1:02:03'), 3723);
  assert.equal(parseDuration(''), null);
  assert.equal(parseDuration('nope'), null);
});

test('clip picker keeps the shortest in-range mp3 and drops the rest', () => {
  const picked = pickClipFile([
    { name: 'long.mp3', length: '01:20', size: '1000' },
    { name: 'mid.mp3', length: '8.0', size: '1000' },
    { name: 'tiny.mp3', length: '1.2', size: '1000' },
    { name: 'huge.mp3', length: '2', size: String(3_000_000) },
    { name: 'notes.txt', length: '1', size: '10' },
  ]);
  assert.equal(picked.name, 'tiny.mp3');
  assert.equal(pickClipFile([{ name: 'song.mp3', length: '03:10', size: '10' }]), null);
});

test('search URL asks Archive for licensed MP3 and escapes the term', () => {
  assert.equal(safeTerm('laugh <script>'), 'laugh script');
  const url = archiveSearchUrl('air horn');
  assert.match(url, /^https:\/\/archive\.org\/advancedsearch\.php/);
  assert.match(decodeURIComponent(url), /air horn/);
  assert.match(url, /licenseurl/);
  assert.equal(
    archiveDownloadUrl('door slam', 'a/b c.mp3'),
    'https://archive.org/download/door%20slam/a/b%20c.mp3',
  );
});

test('voice steal frees one slot at the cap and takes the oldest first', () => {
  const voices = Array.from({ length: MAX_VOICES }, (_, i) => ({ id: i + 1, startedAt: i }));
  assert.deepEqual(selectVoicesToSteal(voices), [1]);
  assert.deepEqual(selectVoicesToSteal(voices.slice(0, MAX_VOICES - 1)), []);
  assert.deepEqual(selectVoicesToSteal(voices.concat([{ id: 99, startedAt: -1 }, { id: 100, startedAt: 50 }])), [99, 1, 2]);
});

test('pad ink stays at least AA against the pad colour', () => {
  for (const hex of ['#c81f36', '#ef7d12', '#5346e4', '#0d7a4d', '#1f5fd4', '#0c7380', '#c21868', '#d4652a', '#c4920a', '#7a4b38', '#d7a30e', '#b42338', '#c99712', '#4e7a22', '#8e2eb0', '#334856', '#1a1a2e', '#2e9e5b', '#e8b93c', '#d21f3c', '#ff6b1a', '#6d4c41', '#f57c00', '#5c6bc0', '#4dd0e1', '#546e7a', '#9ccc65', '#ff4081', '#ffb300', '#795548', '#7e57c2', '#212121']) {
    assert.ok(contrast(hex, inkFor(hex)) >= 4.5, hex);
  }
});
