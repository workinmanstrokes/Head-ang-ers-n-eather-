import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';

const read = (path) => readFileSync(new URL('../' + path, import.meta.url), 'utf8');

test('Android target SDK is 35 and only the permissions the app uses are declared', () => {
  const manifest = read('android/app/src/main/AndroidManifest.xml');
  const vars = read('android/variables.gradle');
  const gradle = read('android/app/build.gradle');
  const strings = read('android/app/src/main/res/values/strings.xml');
  assert.match(vars, /targetSdkVersion\s*=\s*35/);
  assert.match(manifest, /android:screenOrientation="portrait"/);
  assert.match(manifest, /android.permission.INTERNET/);
  assert.match(manifest, /android.permission.RECORD_AUDIO/);
  assert.match(manifest, /android.permission.MODIFY_AUDIO_SETTINGS/);
  assert.match(manifest, /android.hardware.microphone" android:required="false"/);
  assert.doesNotMatch(manifest, /CAMERA|ACCESS_FINE_LOCATION|ACCESS_COARSE_LOCATION|READ_CONTACTS|READ_EXTERNAL_STORAGE|WRITE_EXTERNAL_STORAGE|POST_NOTIFICATIONS|READ_MEDIA/);
  assert.match(gradle, /keystore\.properties/);
  assert.match(gradle, /applicationId "com\.soundboard\.app"/);
  assert.match(strings, /Soundboard/);
  assert.doesNotMatch(strings + manifest + gradle, /Laugh Pad|com\.diddlerrr\.laughpad/);
});
