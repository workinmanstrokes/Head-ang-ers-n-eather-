#!/usr/bin/env node
// Rewrite www/telemetry-config.js from env. Prints only whether each key is set, never the key.
// Blank or invalid values leave that reporter off.

import { writeFileSync } from 'node:fs';
import { resolve } from 'node:path';

const HOSTS = new Set(['https://us.i.posthog.com', 'https://eu.i.posthog.com']);

function clean(value) {
  return String(value || '').replace(/[\r\n"\\]/g, '').trim();
}

function main() {
  const outFlag = process.argv.indexOf('--out');
  const target = resolve(outFlag > -1 ? process.argv[outFlag + 1] : new URL('../www/telemetry-config.js', import.meta.url).pathname);

  let dsn = clean(process.env.SENTRY_DSN);
  let key = clean(process.env.POSTHOG_KEY);
  let host = clean(process.env.POSTHOG_HOST) || 'https://us.i.posthog.com';

  if (dsn && !/^https:\/\/[A-Za-z0-9]+@.+\.sentry\.io\/\d+$/.test(dsn)) {
    console.log('sentry_dsn: ignored (expected a https Sentry DSN)');
    dsn = '';
  }
  if (key && !/^phc_[A-Za-z0-9]{8,}$/.test(key)) {
    console.log('posthog_key: ignored (expected a phc_ project key)');
    key = '';
  }
  if (!HOSTS.has(host)) host = 'https://us.i.posthog.com';

  const text = `// Public client keys for Laugh Pad. Blank values leave crash reports and play stats off.
// CI rewrites this file from Actions env (SENTRY_DSN, POSTHOG_KEY, POSTHOG_HOST)
// before the Android build. Do not commit real keys.
// POSTHOG_KEY belongs to the shared PostHog project workinmanstrokesinc.

export const SENTRY_DSN = ${JSON.stringify(dsn)};
export const POSTHOG_KEY = ${JSON.stringify(key)};
export const POSTHOG_HOST = ${JSON.stringify(host)};
`;
  writeFileSync(target, text);
  console.log(`telemetry-config.js sentry_set=${Boolean(dsn)} posthog_set=${Boolean(key)}`);
}

main();
