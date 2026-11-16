import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { mkdtempSync, readFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import test from 'node:test';
import {
  APP_LABEL,
  POSTHOG_PROJECT,
  describeStats,
  eventProperties,
  keepBreadcrumb,
  posthogInitOptions,
  scrubSentryEvent,
} from '../www/lib/telemetry.js';

const blank = { stored: null, doNotTrack: false, localHttp: false, sentryDsn: '', posthogKey: '' };

test('blank keys are a no-op even when the switch is on', () => {
  const plan = describeStats({ ...blank, stored: 'on', sentryDsn: '  ', posthogKey: '' });
  assert.equal(plan.reason, 'no-keys');
  assert.equal(plan.sentry, false);
  assert.equal(plan.posthog, false);
});

test('the saved off switch blocks reporting even when keys exist', () => {
  const plan = describeStats({
    ...blank,
    stored: 'off',
    sentryDsn: 'https://abc@o1.ingest.us.sentry.io/1',
    posthogKey: 'phc_abcdefgh',
  });
  assert.equal(plan.reason, 'off');
  assert.equal(plan.sentry, false);
  assert.equal(plan.posthog, false);
});

test('do not track and a local http page send nothing', () => {
  const keys = { sentryDsn: 'https://abc@o1.ingest.us.sentry.io/1', posthogKey: 'phc_abcdefgh' };
  assert.equal(describeStats({ ...blank, ...keys, doNotTrack: true }).reason, 'dnt');
  assert.equal(describeStats({ ...blank, ...keys, localHttp: true }).reason, 'local');
  assert.equal(describeStats({ ...blank, localHttp: true }).reason, 'no-keys');
});

test('keys and an on switch enable only the reporters that have keys', () => {
  const plan = describeStats({ ...blank, stored: null, posthogKey: 'phc_abcdefgh' });
  assert.equal(plan.reason, 'on');
  assert.equal(plan.sentry, false);
  assert.equal(plan.posthog, true);
});

test('play stats are labeled for Laugh Pad and drop free-text fields', () => {
  assert.equal(APP_LABEL, 'Laugh Pad');
  assert.equal(POSTHOG_PROJECT, 'workinmanstrokesinc');
  assert.deepEqual(eventProperties({ kind: 'starter', label: 'secret name', term: 'laugh' }), {
    app: 'Laugh Pad',
    kind: 'starter',
  });
  assert.deepEqual(eventProperties({ kind: 'nope' }), { app: 'Laugh Pad' });
});

test('PostHog options refuse profiles, recordings, autocapture, and stored IPs', () => {
  const options = posthogInitOptions('https://us.i.posthog.com', () => true);
  assert.equal(options.person_profiles, 'never');
  assert.equal(options.autocapture, false);
  assert.equal(options.disable_session_recording, true);
  assert.equal(options.ip, false);
  assert.equal(options.capture_pageview, false);
  const sent = options.before_send({ properties: { $ip: '203.0.113.5', note: 'hi' } });
  assert.equal(sent.properties.$ip, undefined);
  assert.equal(sent.properties.app, 'Laugh Pad');
  const denied = posthogInitOptions('https://us.i.posthog.com', () => false);
  assert.equal(denied.before_send({ properties: { app: 'Laugh Pad' } }), null);
});

test('Sentry drops input breadcrumbs, email text, and the IP field', () => {
  assert.equal(keepBreadcrumb({ category: 'ui.input' }), false);
  assert.equal(keepBreadcrumb({ category: 'console' }), true);
  const event = scrubSentryEvent({
    message: 'failed for a@b.co',
    user: { ip_address: '{{auto}}', email: 'a@b.co' },
    server_name: 'phone',
    request: { url: 'https://app.example/index.html?q=secret', headers: { 'User-Agent': 'Test', Cookie: 'nope' } },
    exception: { values: [{ value: 'write a@b.co' }] },
    breadcrumbs: [{ message: 'mail a@b.co', data: { url: 'https://app.example/x?y=1' } }],
  });
  assert.deepEqual(event.user, { ip_address: null });
  assert.equal(event.server_name, undefined);
  assert.equal(event.message, 'failed for [email]');
  assert.equal(event.request.url, 'https://app.example/index.html');
  assert.deepEqual(event.request.headers, { 'User-Agent': 'Test' });
  assert.equal(event.exception.values[0].value, 'write [email]');
  assert.equal(event.breadcrumbs[0].data.url, 'https://app.example/x');
});

test('bake writes blank keys when env is missing and refuses a bad key', () => {
  const dir = mkdtempSync(join(tmpdir(), 'laughpad-telemetry-'));
  const out = join(dir, 'telemetry-config.js');
  const empty = spawnSync(process.execPath, ['scripts/bake-telemetry.mjs', '--out', out], {
    cwd: new URL('..', import.meta.url).pathname,
    env: { ...process.env, SENTRY_DSN: '', POSTHOG_KEY: '', POSTHOG_HOST: '' },
    encoding: 'utf8',
  });
  assert.equal(empty.status, 0, empty.stderr);
  const blankText = readFileSync(out, 'utf8');
  assert.match(blankText, /SENTRY_DSN = ""/);
  assert.match(blankText, /POSTHOG_KEY = ""/);
  assert.match(blankText, /workinmanstrokesinc/);

  const bad = 'phc_not a key !!!';
  const rejected = spawnSync(process.execPath, ['scripts/bake-telemetry.mjs', '--out', out], {
    cwd: new URL('..', import.meta.url).pathname,
    env: { ...process.env, SENTRY_DSN: 'http://nope', POSTHOG_KEY: bad, POSTHOG_HOST: 'https://evil.example' },
    encoding: 'utf8',
  });
  assert.equal(rejected.status, 0);
  assert.doesNotMatch(rejected.stdout, /not a key/);
  const text = readFileSync(out, 'utf8');
  assert.match(text, /SENTRY_DSN = ""/);
  assert.match(text, /POSTHOG_KEY = ""/);
  assert.match(text, /https:\/\/us\.i\.posthog\.com/);
  assert.doesNotMatch(text, /evil\.example/);
});

test('the committed config stays blank', () => {
  const text = readFileSync(new URL('../www/telemetry-config.js', import.meta.url), 'utf8');
  assert.match(text, /SENTRY_DSN = ''/);
  assert.match(text, /POSTHOG_KEY = ''/);
});
