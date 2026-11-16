import assert from 'node:assert/strict';
import { readdirSync, readFileSync } from 'node:fs';
import test from 'node:test';

const read = (path) => readFileSync(new URL('../' + path, import.meta.url), 'utf8');

test('the workflow builds a debug APK and skips a missing release keystore', () => {
  const yml = read('.github/workflows/build-apk.yml');
  assert.match(yml, /pull_request/);
  assert.match(yml, /LaughPad-debug\.apk/);
  assert.match(yml, /retention-days: 2/);
  assert.match(yml, /ANDROID_KEYSTORE_BASE64/);
  assert.match(yml, /ANDROID_KEYSTORE_PASSWORD/);
  assert.match(yml, /ANDROID_KEY_ALIAS/);
  assert.match(yml, /ANDROID_KEY_PASSWORD/);
  assert.match(yml, /Skipping the signed release AAB/);
  assert.match(yml, /bundleRelease/);
});

test('store listing matches the telemetry and the Laugh Pad name', () => {
  const listing = read('docs/store/listing.md');
  assert.match(listing, /Laugh Pad: Meme Soundboard/);
  assert.match(listing, /DowntownDiddlerrr/);
  assert.match(listing, /mscofield1588@gmail.com/);
  assert.match(listing, /Sentry/);
  assert.match(listing, /PostHog/);
  assert.match(listing, /workinmanstrokesinc/);
  assert.match(listing, /person_profiles: 'never'/);
  assert.match(listing, /Session recordings/);
  assert.match(listing, /No ads/);
  assert.doesNotMatch(listing, /Head-ang/);
});

test('store screenshots are real 1080×1920 captures', () => {
  const dir = new URL('../docs/store/screenshots/', import.meta.url);
  const names = readdirSync(dir).filter((name) => name.endsWith('.png')).sort();
  assert.ok(names.length >= 4, 'expected several screenshots, got ' + names.join(','));
  for (const name of names) {
    const buf = readFileSync(new URL(name, dir));
    assert.equal(buf.toString('ascii', 1, 4), 'PNG', name);
    const width = buf.readUInt32BE(16);
    const height = buf.readUInt32BE(20);
    assert.ok(width >= 1080 && width <= 1440, name + ' width ' + width);
    assert.ok(height >= 1920 && height <= 2560, name + ' height ' + height);
    assert.ok(buf.length > 20_000, name + ' looks empty');
  }
});
