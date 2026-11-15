import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';
import { contrast, inkFor } from '../www/lib/color.js';

const root = new URL('../', import.meta.url);

test('starter pack is 16 original wavs with safe levels', () => {
  const pack = JSON.parse(readFileSync(new URL('www/data/starter-pack.json', root), 'utf8'));
  assert.equal(pack.sounds.length, 16);
  assert.match(pack.license, /Original works/);
  const ids = new Set();
  for (const sound of pack.sounds) {
    assert.ok(!ids.has(sound.id));
    ids.add(sound.id);
    assert.ok(contrast(sound.colour, inkFor(sound.colour)) >= 4.5, sound.id);
    const wav = readFileSync(new URL('www/' + sound.file, root));
    assert.equal(wav.toString('ascii', 0, 4), 'RIFF');
    assert.equal(wav.toString('ascii', 8, 12), 'WAVE');
    const rate = wav.readUInt32LE(24);
    const channels = wav.readUInt16LE(22);
    const bits = wav.readUInt16LE(34);
    const dataBytes = wav.readUInt32LE(40);
    assert.equal(rate, 44100);
    assert.equal(channels, 1);
    assert.equal(bits, 16);
    const seconds = dataBytes / 2 / rate;
    assert.ok(Math.abs(seconds - sound.duration) < 0.02, sound.id);
    let peak = 0;
    for (let i = 44; i < wav.length; i += 2) {
      peak = Math.max(peak, Math.abs(wav.readInt16LE(i)) / 32768);
    }
    assert.ok(peak > 0.2 && peak <= 0.7, sound.id + ' peak ' + peak);
  }
});
