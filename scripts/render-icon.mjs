/**
 * Original Soundboard launcher art. Drawn in code — no stock images.
 * Writes the PWA icons, and, when android/ exists, replaces launcher and splash PNGs.
 */
import { readdir, readFile, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import { deflateSync } from 'node:zlib';
import { dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');

function crc32(buf) {
  let c = ~0;
  for (const b of buf) {
    c ^= b;
    for (let k = 0; k < 8; k++) c = (c >>> 1) ^ (0xedb88320 & -(c & 1));
  }
  return ~c >>> 0;
}

function chunk(type, data) {
  const len = Buffer.alloc(4);
  len.writeUInt32BE(data.length, 0);
  const body = Buffer.concat([Buffer.from(type), data]);
  const crc = Buffer.alloc(4);
  crc.writeUInt32BE(crc32(body), 0);
  return Buffer.concat([len, body, crc]);
}

function encodePng(w, h, rgba) {
  const raw = Buffer.alloc((w * 4 + 1) * h);
  for (let y = 0; y < h; y++) {
    raw[y * (w * 4 + 1)] = 0;
    rgba.copy(raw, y * (w * 4 + 1) + 1, y * w * 4, (y + 1) * w * 4);
  }
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(w, 0);
  ihdr.writeUInt32BE(h, 4);
  ihdr[8] = 8;
  ihdr[9] = 6;
  const sig = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);
  return Buffer.concat([
    sig,
    chunk('IHDR', ihdr),
    chunk('IDAT', deflateSync(raw, { level: 9 })),
    chunk('IEND', Buffer.alloc(0)),
  ]);
}

function pngSize(buf) {
  return { w: buf.readUInt32BE(16), h: buf.readUInt32BE(20) };
}

const hex = (h) => [parseInt(h.slice(1, 3), 16), parseInt(h.slice(3, 5), 16), parseInt(h.slice(5, 7), 16)];

function blend(dst, i, rgb, a) {
  const aa = a / 255;
  const inv = 1 - aa;
  dst[i] = dst[i] * inv + rgb[0] * aa;
  dst[i + 1] = dst[i + 1] * inv + rgb[1] * aa;
  dst[i + 2] = dst[i + 2] * inv + rgb[2] * aa;
  dst[i + 3] = dst[i + 3] * inv + a * (dst[i + 3] / 255) + a * (1 - dst[i + 3] / 255) * 0 + Math.min(255, dst[i + 3] + a * (1 - dst[i + 3] / 255));
}

function cover(x, y, w, h, r) {
  const px = x;
  const py = y;
  const cx = Math.min(Math.max(px, r), w - r);
  const cy = Math.min(Math.max(py, r), h - r);
  const dx = px - cx;
  const dy = py - cy;
  return dx * dx + dy * dy <= r * r;
}

function roundCoverage(x, y, w, h, r) {
  let hit = 0;
  const n = 3;
  for (let sy = 0; sy < n; sy++) {
    for (let sx = 0; sx < n; sx++) {
      if (cover(x + (sx + 0.5) / n, y + (sy + 0.5) / n, w, h, r)) hit++;
    }
  }
  return hit / (n * n);
}

function drawIcon(size, { transparent = false, markScale = 0.62 } = {}) {
  const rgba = Buffer.alloc(size * size * 4);
  const bg = hex('#14121c');
  if (!transparent) {
    const radius = size * 0.22;
    for (let y = 0; y < size; y++) {
      for (let x = 0; x < size; x++) {
        const a = roundCoverage(x, y, size, size, radius);
        if (!a) continue;
        const i = (y * size + x) * 4;
        rgba[i] = bg[0];
        rgba[i + 1] = bg[1];
        rgba[i + 2] = bg[2];
        rgba[i + 3] = Math.round(a * 255);
      }
    }
  }
  const pads = [
    { c: '#c81f36', col: 0, row: 0, press: true },
    { c: '#ef7d12', col: 1, row: 0, press: false },
    { c: '#5346e4', col: 0, row: 1, press: false },
    { c: '#0d7a4d', col: 1, row: 1, press: false },
  ];
  const board = size * markScale;
  const origin = (size - board) / 2;
  const gap = board * 0.08;
  const pad = (board - gap) / 2;
  const radius = pad * 0.22;
  for (const p of pads) {
    const shift = p.press ? pad * 0.12 : 0;
    const x0 = origin + p.col * (pad + gap);
    const y0 = origin + p.row * (pad + gap) + shift;
    const rgb = hex(p.c);
    const lip = rgb.map((v) => Math.round(v * 0.55));
    const hi = rgb.map((v) => Math.min(255, Math.round(v + (255 - v) * 0.34)));
    const mix = (a, b, t) => a.map((v, i) => Math.round(v + (b[i] - v) * t));
    for (let y = 0; y < pad; y++) {
      for (let x = 0; x < pad; x++) {
        const px = Math.round(x0 + x);
        const py = Math.round(y0 + y);
        if (px < 0 || py < 0 || px >= size || py >= size) continue;
        const a = roundCoverage(x, y, pad, pad, radius);
        if (!a) continue;
        const t = y / Math.max(1, pad - 1);
        const base = t < 0.62 ? mix(hi, rgb, t / 0.62) : mix(rgb, lip, (t - 0.62) / 0.38);
        const i = (py * size + px) * 4;
        const alpha = Math.round(a * 255);
        if (rgba[i + 3] === 0) {
          rgba[i] = base[0];
          rgba[i + 1] = base[1];
          rgba[i + 2] = base[2];
          rgba[i + 3] = alpha;
        } else {
          const aa = alpha / 255;
          rgba[i] = rgba[i] * (1 - aa) + base[0] * aa;
          rgba[i + 1] = rgba[i + 1] * (1 - aa) + base[1] * aa;
          rgba[i + 2] = rgba[i + 2] * (1 - aa) + base[2] * aa;
          rgba[i + 3] = Math.min(255, rgba[i + 3] + alpha * (1 - rgba[i + 3] / 255));
        }
      }
    }
  }
  return rgba;
}

function downscale(src, sw, sh, dw, dh) {
  const dst = Buffer.alloc(dw * dh * 4);
  for (let y = 0; y < dh; y++) {
    const y0 = Math.floor((y * sh) / dh);
    const y1 = Math.max(y0 + 1, Math.floor(((y + 1) * sh) / dh));
    for (let x = 0; x < dw; x++) {
      const x0 = Math.floor((x * sw) / dw);
      const x1 = Math.max(x0 + 1, Math.floor(((x + 1) * sw) / dw));
      let r = 0; let g = 0; let b = 0; let a = 0; let n = 0;
      for (let yy = y0; yy < y1; yy++) {
        for (let xx = x0; xx < x1; xx++) {
          const i = (yy * sw + xx) * 4;
          r += src[i]; g += src[i + 1]; b += src[i + 2]; a += src[i + 3];
          n++;
        }
      }
      const o = (y * dw + x) * 4;
      dst[o] = r / n; dst[o + 1] = g / n; dst[o + 2] = b / n; dst[o + 3] = a / n;
    }
  }
  return dst;
}

function splash(w, h) {
  const rgba = Buffer.alloc(w * h * 4);
  const bg = hex('#100e16');
  for (let i = 0; i < w * h; i++) {
    rgba[i * 4] = bg[0];
    rgba[i * 4 + 1] = bg[1];
    rgba[i * 4 + 2] = bg[2];
    rgba[i * 4 + 3] = 255;
  }
  const side = Math.round(Math.min(w, h) * 0.42);
  const icon = downscale(drawIcon(512), 512, 512, side, side);
  const x0 = Math.floor((w - side) / 2);
  const y0 = Math.floor((h - side) / 2);
  for (let y = 0; y < side; y++) {
    for (let x = 0; x < side; x++) {
      const s = (y * side + x) * 4;
      const d = ((y0 + y) * w + (x0 + x)) * 4;
      const a = icon[s + 3] / 255;
      rgba[d] = rgba[d] * (1 - a) + icon[s] * a;
      rgba[d + 1] = rgba[d + 1] * (1 - a) + icon[s + 1] * a;
      rgba[d + 2] = rgba[d + 2] * (1 - a) + icon[s + 2] * a;
      rgba[d + 3] = 255;
    }
  }
  return encodePng(w, h, rgba);
}

const master = drawIcon(1024);
await writeFile(join(ROOT, 'www/icons/icon-512.png'), encodePng(512, 512, downscale(master, 1024, 1024, 512, 512)));
await writeFile(join(ROOT, 'www/icons/icon-192.png'), encodePng(192, 192, downscale(master, 1024, 1024, 192, 192)));
console.log('wrote PWA icons');

if (process.argv.includes('--android')) {
  const res = join(ROOT, 'android/app/src/main/res');
  const fg = drawIcon(1024, { transparent: true, markScale: 0.5 });
  async function walk(dir) {
    let entries = [];
    try { entries = await readdir(dir, { withFileTypes: true }); } catch { return; }
    for (const entry of entries) {
      const path = join(dir, entry.name);
      if (entry.isDirectory()) await walk(path);
      else if (entry.name.endsWith('.png')) {
        const buf = await readFile(path);
        const { w, h } = pngSize(buf);
        let png;
        if (entry.name.includes('splash')) png = splash(w, h);
        else if (entry.name.includes('foreground')) {
          png = encodePng(w, h, downscale(fg, 1024, 1024, w, h));
        } else {
          png = encodePng(w, h, downscale(master, 1024, 1024, w, h));
        }
        await writeFile(path, png);
        console.log('replaced', path, w + 'x' + h);
      }
    }
  }
  await walk(res);
}
