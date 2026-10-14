#!/usr/bin/env node
// Capture screenshots and measured style data for brand-audit-content.
//
// Usage:
//   node capture_page.mjs --out DIR [--slices 6] [--mobile-slices 2] [--full-page]
//                         [--wait 1500] URL [URL ...]
//
// For each URL, writes to DIR (names are <host>_<path>):
//   *-desktop-NN.png   successive 1440x900 screens, top to bottom
//   *-mobile-NN.png    first 412x839 mobile screens
//   *-desktop-full.png full-length capture (only with --full-page)
//   *.styles.json      capture details, meta, headings, nav, CTAs, typography,
//                      font and color usage, contrast ratios, image alt counts
// and prints a JSON summary to stdout.
//
// Exit codes: 0 = at least one URL captured, 1 = bad arguments or every URL failed,
//             2 = Playwright (or its browser) is not available.

import { createRequire } from 'node:module';
import { execSync } from 'node:child_process';
import { mkdirSync, writeFileSync, existsSync } from 'node:fs';
import { join, resolve } from 'node:path';

const DESKTOP = { width: 1440, height: 900 };
const MAX_FULL_PAGE_HEIGHT = 16000;

function usage(msg) {
  if (msg) console.error(`error: ${msg}`);
  console.error('usage: node capture_page.mjs --out DIR [--slices N] [--mobile-slices N] [--full-page] [--wait MS] URL [URL ...]');
  process.exit(1);
}

function parseArgs(argv) {
  const opts = { out: null, slices: 6, mobileSlices: 2, fullPage: false, wait: 1500, urls: [] };
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    const next = () => { if (i + 1 >= argv.length) usage(`${a} needs a value`); return argv[++i]; };
    if (a === '--out') opts.out = next();
    else if (a === '--slices') opts.slices = parseInt(next(), 10);
    else if (a === '--mobile-slices') opts.mobileSlices = parseInt(next(), 10);
    else if (a === '--full-page') opts.fullPage = true;
    else if (a === '--wait') opts.wait = parseInt(next(), 10);
    else if (a === '-h' || a === '--help') usage();
    else if (a.startsWith('--')) usage(`unknown option ${a}`);
    else opts.urls.push(a);
  }
  if (!opts.out) usage('--out is required');
  if (!opts.urls.length) usage('give at least one URL');
  for (const k of ['slices', 'mobileSlices', 'wait']) {
    if (!Number.isFinite(opts[k]) || opts[k] < 0) usage(`invalid value for ${k}`);
  }
  opts.urls = opts.urls.map(u => (/^https?:\/\//i.test(u) ? u : `https://${u}`));
  return opts;
}

function loadPlaywright() {
  const require = createRequire(import.meta.url);
  const names = ['playwright', 'playwright-core', '@playwright/test'];
  for (const n of names) { try { return require(n); } catch {} }
  try {
    const root = execSync('npm root -g', { encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'] }).trim();
    for (const n of names) { try { return require(join(root, n)); } catch {} }
  } catch {}
  return null;
}

function slug(s, max = 60) {
  return (s || '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '').slice(0, max).replace(/-+$/, '');
}

function baseName(url, used) {
  const u = new URL(url);
  const host = slug(u.hostname.replace(/^www\./, ''), 40) || 'site';
  const path = slug(u.pathname) || 'home';
  let name = `${host}_${path}`;
  let n = 2;
  while (used.has(name)) name = `${host}_${path}-${n++}`;
  used.add(name);
  return name;
}

function proxyFromEnv() {
  const server = process.env.HTTPS_PROXY || process.env.https_proxy || process.env.HTTP_PROXY || process.env.http_proxy;
  if (!server) return undefined;
  // Chromium rejects the whole bypass list if one entry is malformed, so normalize
  // NO_PROXY: bracket IPv6 literals and drop wildcard-only entries.
  const bypass = (process.env.NO_PROXY || process.env.no_proxy || '')
    .split(',').map(s => s.trim()).filter(Boolean)
    .map(s => {
      if (!s.includes(':') || s.startsWith('[')) return s;
      const [addr, bits] = s.split('/');
      return addr.replace(/:/g, '') === '' ? null : `[${addr}]${bits ? '/' + bits : ''}`;
    })
    .filter(s => s && s !== '*');
  return bypass.length ? { server, bypass: bypass.join(',') } : { server };
}

// Runs inside the page. Must be self-contained (no outer variables).
function extractPageData() {
  const firstScreenHeight = window.innerHeight;
  const MAXTXT = 100;
  const clean = s => (s || '').replace(/\s+/g, ' ').trim();
  const trunc = s => { s = clean(s); return s.length > MAXTXT ? s.slice(0, MAXTXT - 1) + '…' : s; };
  const isVisible = el => {
    const r = el.getBoundingClientRect();
    if (r.width < 1 || r.height < 1) return false;
    const s = getComputedStyle(el);
    return s.visibility !== 'hidden' && s.display !== 'none' && parseFloat(s.opacity) > 0;
  };
  const docY = el => Math.round(el.getBoundingClientRect().top + window.scrollY);
  const parseColor = str => {
    const m = /^rgba?\(([^)]+)\)$/.exec((str || '').trim());
    if (!m) return null;
    const p = m[1].split(/[\s,\/]+/).filter(Boolean);
    if (p.length < 3) return null;
    const ch = v => (v.endsWith('%') ? parseFloat(v) * 2.55 : parseFloat(v));
    const a = p.length > 3 ? (p[3].endsWith('%') ? parseFloat(p[3]) / 100 : parseFloat(p[3])) : 1;
    return { r: ch(p[0]), g: ch(p[1]), b: ch(p[2]), a };
  };
  const hex2 = v => Math.max(0, Math.min(255, Math.round(v))).toString(16).padStart(2, '0');
  const toHex = c => '#' + hex2(c.r) + hex2(c.g) + hex2(c.b) + (c.a < 1 ? hex2(c.a * 255) : '');
  const blend = (top, bottom) => {
    const a = top.a + bottom.a * (1 - top.a);
    if (a === 0) return { r: 0, g: 0, b: 0, a: 0 };
    const mix = k => (top[k] * top.a + bottom[k] * bottom.a * (1 - top.a)) / a;
    return { r: mix('r'), g: mix('g'), b: mix('b'), a };
  };
  const effectiveBg = el => {
    const layers = [];
    for (let n = el; n && n.nodeType === 1; n = n.parentElement) {
      const s = getComputedStyle(n);
      if (s.backgroundImage && s.backgroundImage !== 'none') return { image: true };
      const c = parseColor(s.backgroundColor);
      if (!c) return { raw: s.backgroundColor };
      if (c.a > 0) { layers.push(c); if (c.a >= 1) break; }
    }
    let base = { r: 255, g: 255, b: 255, a: 1 };
    for (let i = layers.length - 1; i >= 0; i--) base = blend(layers[i], base);
    return { color: base };
  };
  const luminance = c => {
    const f = v => { v /= 255; return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4); };
    return 0.2126 * f(c.r) + 0.7152 * f(c.g) + 0.0722 * f(c.b);
  };
  const contrast = (fg, bg) => {
    const f = fg.a < 1 ? blend(fg, bg) : fg;
    const l1 = luminance(f), l2 = luminance(bg);
    return (Math.max(l1, l2) + 0.05) / (Math.min(l1, l2) + 0.05);
  };
  const MEDIA = new Set(['IMG', 'VIDEO', 'CANVAS', 'PICTURE', 'IFRAME']);
  const overMedia = el => {
    el.scrollIntoView({ block: 'center', behavior: 'instant' });
    const r = el.getBoundingClientRect();
    const x = Math.max(0, Math.min(window.innerWidth - 1, r.left + Math.min(r.width, 200) / 2));
    const y = Math.max(0, Math.min(window.innerHeight - 1, r.top + r.height / 2));
    const stack = document.elementsFromPoint(x, y);
    const idx = stack.indexOf(el);
    const below = idx >= 0 ? stack.slice(idx + 1) : stack;
    for (const n of below) {
      if (n.contains(el)) {
        // An opaque ancestor hides everything painted beneath it.
        const c = parseColor(getComputedStyle(n).backgroundColor);
        if (c && c.a >= 1) return false;
        continue;
      }
      if (MEDIA.has(n.tagName.toUpperCase()) || getComputedStyle(n).backgroundImage !== 'none') return true;
    }
    return false;
  };
  const typography = (el, role) => {
    const s = getComputedStyle(el);
    const fg = parseColor(s.color);
    const bg = effectiveBg(el);
    const media = overMedia(el);
    const size = parseFloat(s.fontSize);
    const weight = parseInt(s.fontWeight, 10) || 400;
    const large = size >= 24 || (size >= 18.66 && weight >= 700);
    let ratio = null, note = null;
    if (!fg) note = 'text color not parsed';
    else if (media || bg.image) note = 'text over image or media: check visually';
    else if (!bg.color) note = 'background not parsed';
    else ratio = Math.round(contrast(fg, bg.color) * 100) / 100;
    const y = docY(el);
    return {
      role,
      tag: el.tagName.toLowerCase(),
      text: trunc(el.innerText || el.value || el.getAttribute('aria-label')),
      font_family: s.fontFamily,
      font_size: s.fontSize,
      font_weight: s.fontWeight,
      line_height: s.lineHeight,
      letter_spacing: s.letterSpacing,
      text_transform: s.textTransform,
      color: fg ? toHex(fg) : s.color,
      background: bg.color ? toHex(bg.color) : (bg.image ? 'image' : (bg.raw || null)),
      contrast_ratio: ratio,
      wcag_aa: ratio === null ? null : ratio >= (large ? 3 : 4.5),
      large_text: large,
      contrast_note: note,
      y,
      in_first_screen: y < firstScreenHeight,
    };
  };
  const inc = (map, key, w) => map.set(key, (map.get(key) || 0) + w);
  const top = (map, n, unit) => {
    const total = [...map.values()].reduce((a, b) => a + b, 0) || 1;
    return [...map.entries()].sort((a, b) => b[1] - a[1]).slice(0, n)
      .map(([value, w]) => ({ value, share_pct: Math.round((w / total) * 1000) / 10, basis: unit }));
  };
  const meta = name => {
    const m = document.querySelector(`meta[name="${name}"], meta[property="${name}"]`);
    return m ? m.getAttribute('content') : null;
  };

  // Headings
  const headingEls = [...document.querySelectorAll('h1, h2, h3')].filter(isVisible);
  const headings = headingEls.slice(0, 40).map(h => ({ level: +h.tagName[1], text: trunc(h.innerText), y: docY(h) }));
  const h1s = [...document.querySelectorAll('h1')].filter(isVisible);

  // Navigation
  const navSeen = new Set();
  const nav = [];
  for (const a of document.querySelectorAll('header a, nav a')) {
    if (!isVisible(a)) continue;
    const text = trunc(a.innerText || a.getAttribute('aria-label'));
    const href = a.getAttribute('href');
    const key = text + '|' + href;
    if (!text || navSeen.has(key)) continue;
    navSeen.add(key);
    nav.push({ text, href });
    if (nav.length >= 40) break;
  }

  // CTA candidates: short, visible, button-like links and buttons
  const ctaEls = [...document.querySelectorAll('a, button, input[type=submit], input[type=button], [role=button]')]
    .filter(isVisible)
    .filter(el => {
      const t = clean(el.innerText || el.value || '');
      if (!t || t.length > 40) return false;
      const s = getComputedStyle(el);
      const bg = parseColor(s.backgroundColor);
      const cls = typeof el.className === 'string' ? el.className : (el.className && el.className.baseVal) || '';
      const hasFill = (bg && bg.a > 0.5) || s.backgroundImage !== 'none';
      const hasBorder = parseFloat(s.borderTopWidth) >= 1 && s.borderTopStyle !== 'none' && parseFloat(s.borderBottomWidth) >= 1;
      return el.tagName === 'BUTTON' || el.tagName === 'INPUT' || /btn|button|cta/i.test(cls) || hasFill || hasBorder;
    })
    .sort((a, b) => docY(a) - docY(b))
    .slice(0, 15);
  // Record positions before typography() scrolls the page (fixed elements move with scroll).
  const ctaY = new Map(ctaEls.map(el => [el, docY(el)]));
  const ctas = ctaEls.map((el, i) => {
    const base = {
      text: trunc(el.innerText || el.value),
      href: el.getAttribute('href'),
      y: ctaY.get(el),
      in_first_screen: ctaY.get(el) < firstScreenHeight,
      in_header_or_nav: !!el.closest('header, nav'),
      in_dialog_or_cookie_banner: !!el.closest('[role=dialog], [aria-modal=true], [class*=cookie i], [id*=cookie i], [class*=consent i], [id*=consent i]'),
    };
    return i < 4 ? Object.assign(base, { typography: typography(el, 'cta') }) : base;
  });

  // Key element typography
  const key = [];
  const firstOf = sel => [...document.querySelectorAll(sel)].find(isVisible);
  for (const [sel, role] of [['h1', 'h1'], ['h2', 'h2'], ['h3', 'h3']]) {
    const el = firstOf(sel);
    if (el) key.push(typography(el, role));
  }
  const para = [...document.querySelectorAll('main p, p')].find(p => isVisible(p) && clean(p.innerText).length > 40);
  if (para) key.push(typography(para, 'body paragraph'));
  const navLink = firstOf('header a, nav a');
  if (navLink) key.push(typography(navLink, 'nav link'));

  // Font, size and color usage across visible text
  const fonts = new Map(), stacks = new Map(), sizes = new Map(), colors = new Map();
  const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
  let node, counted = 0;
  while ((node = walker.nextNode()) && counted < 6000) {
    const text = node.textContent.trim();
    if (!text) continue;
    const el = node.parentElement;
    if (!el || ['SCRIPT', 'STYLE', 'NOSCRIPT', 'TEMPLATE'].includes(el.tagName) || !isVisible(el)) continue;
    counted++;
    const s = getComputedStyle(el);
    const w = text.length;
    inc(fonts, s.fontFamily.split(',')[0].replace(/["']/g, '').trim(), w);
    inc(stacks, s.fontFamily, w);
    inc(sizes, s.fontSize, w);
    const c = parseColor(s.color);
    inc(colors, c ? toHex(c) : s.color, w);
  }
  const bgs = new Map();
  const all = [document.documentElement, document.body, ...document.body.querySelectorAll('*')].slice(0, 5000);
  for (const el of all) {
    const c = parseColor(getComputedStyle(el).backgroundColor);
    if (!c || c.a === 0) continue;
    const r = el.getBoundingClientRect();
    const area = r.width * r.height;
    if (area >= 100) inc(bgs, toHex(c), area);
  }

  const webfonts = [...new Set([...document.fonts]
    .filter(f => f.status === 'loaded')
    .map(f => `${f.family.replace(/["']/g, '')} ${f.weight} ${f.style}`))].slice(0, 30);

  const imgs = [...document.images];
  const firstScreen = {
    viewport: [window.innerWidth, firstScreenHeight],
    headings: headings.filter(h => h.y < firstScreenHeight).map(h => `h${h.level}: ${h.text}`),
    ctas: ctas.filter(c => c.in_first_screen && !c.in_dialog_or_cookie_banner).map(c => c.text),
    cookie_or_dialog_visible: ctas.some(c => c.in_first_screen && c.in_dialog_or_cookie_banner),
  };

  window.scrollTo({ top: 0, behavior: 'instant' });

  return {
    meta: {
      title: document.title || null,
      description: meta('description'),
      og_title: meta('og:title'),
      og_description: meta('og:description'),
      og_image: meta('og:image'),
      lang: document.documentElement.lang || null,
      canonical: (document.querySelector('link[rel=canonical]') || {}).href || null,
    },
    page_height_px: Math.max(document.documentElement.scrollHeight, document.body ? document.body.scrollHeight : 0),
    first_screen: firstScreen,
    headings: { h1_count: h1s.length, outline: headings },
    nav_links: nav,
    cta_candidates: ctas,
    key_typography: key,
    font_usage: {
      primary_families: top(fonts, 10, 'characters of visible text'),
      declared_stacks: top(stacks, 5, 'characters of visible text'),
      font_sizes: top(sizes, 12, 'characters of visible text'),
      loaded_webfonts: webfonts,
    },
    color_usage: {
      text_colors: top(colors, 10, 'characters of visible text'),
      background_colors: top(bgs, 10, 'element area (approximate, nested areas overlap)'),
    },
    images: {
      total: imgs.length,
      visible: imgs.filter(isVisible).length,
      missing_alt_attribute: imgs.filter(i => !i.hasAttribute('alt')).length,
      empty_alt: imgs.filter(i => i.getAttribute('alt') === '').length,
    },
  };
}

async function settle(page, waitMs) {
  try { await page.waitForLoadState('networkidle', { timeout: 10000 }); } catch {}
  await page.waitForTimeout(waitMs);
  // Scroll through once so lazy-loaded images and sections render.
  await page.evaluate(async () => {
    const step = Math.max(400, Math.floor(window.innerHeight * 0.8));
    const limit = Math.min(document.documentElement.scrollHeight, 20000);
    for (let y = 0; y < limit; y += step) {
      window.scrollTo({ top: y, behavior: 'instant' });
      await new Promise(r => setTimeout(r, 120));
    }
    window.scrollTo({ top: 0, behavior: 'instant' });
  });
  await page.waitForTimeout(500);
}

async function slices(page, count, prefix, files, notes) {
  // innerHeight, not the device viewport: pages without a viewport meta tag lay out wider on mobile.
  const [viewportHeight, height] = await page.evaluate(() => [window.innerHeight, document.documentElement.scrollHeight]);
  const step = Math.floor(viewportHeight * 0.85);
  const n = Math.min(count, Math.max(1, Math.ceil((height - viewportHeight) / step) + 1));
  for (let i = 0; i < n; i++) {
    const target = i * step;
    const actual = await page.evaluate(y => { window.scrollTo({ top: y, behavior: 'instant' }); return window.scrollY; }, target);
    if (i > 0 && actual === 0) {
      notes.push(`${prefix}: page does not scroll with the window (custom scroll container); only the first screen was captured. Try --full-page.`);
      break;
    }
    await page.waitForTimeout(350);
    const file = `${prefix}-${String(i + 1).padStart(2, '0')}.png`;
    await page.screenshot({ path: file });
    files.push(file);
  }
  await page.evaluate(() => window.scrollTo({ top: 0, behavior: 'instant' }));
}

async function capture(browser, devices, url, name, opts) {
  const out = resolve(opts.out);
  const result = { url, name, final_url: null, http_status: null, captured_at: new Date().toISOString(), files: [], notes: [], errors: [] };
  let data = null;

  // Desktop
  const desktop = await browser.newContext({ viewport: DESKTOP, deviceScaleFactor: 1 });
  try {
    const page = await desktop.newPage();
    page.setDefaultTimeout(30000);
    const resp = await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 45000 });
    result.http_status = resp ? resp.status() : null;
    result.final_url = page.url();
    if (result.http_status && result.http_status >= 400) result.notes.push(`HTTP ${result.http_status}: captured anyway as evidence`);
    await settle(page, opts.wait);
    data = await page.evaluate(extractPageData);
    if (opts.slices > 0) await slices(page, opts.slices, join(out, `${name}-desktop`), result.files, result.notes);
    if (opts.fullPage) {
      const h = await page.evaluate(() => document.documentElement.scrollHeight);
      const file = join(out, `${name}-desktop-full.png`);
      if (h > MAX_FULL_PAGE_HEIGHT) {
        await page.screenshot({ path: file, fullPage: true, clip: { x: 0, y: 0, width: DESKTOP.width, height: MAX_FULL_PAGE_HEIGHT } });
        result.notes.push(`full-page capture truncated at ${MAX_FULL_PAGE_HEIGHT}px of ${h}px`);
      } else {
        await page.screenshot({ path: file, fullPage: true });
      }
      result.files.push(file);
    }
  } catch (e) {
    result.errors.push(`desktop: ${e.message.split('\n')[0]}`);
  } finally {
    await desktop.close();
  }

  // Mobile
  if (opts.mobileSlices > 0 && !result.errors.length) {
    const device = devices && devices['Pixel 7'];
    const mobile = await browser.newContext(device ? { ...device } : { viewport: { width: 412, height: 839 }, deviceScaleFactor: 2, isMobile: true, hasTouch: true });
    try {
      const page = await mobile.newPage();
      page.setDefaultTimeout(30000);
      await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 45000 });
      await settle(page, opts.wait);
      const m = await page.evaluate(extractPageData);
      if (data) data.mobile = { first_screen: m.first_screen, key_typography: m.key_typography, page_height_px: m.page_height_px };
      await slices(page, opts.mobileSlices, join(out, `${name}-mobile`), result.files, result.notes);
    } catch (e) {
      result.errors.push(`mobile: ${e.message.split('\n')[0]}`);
    } finally {
      await mobile.close();
    }
  }

  if (data) {
    const stylesFile = join(out, `${name}.styles.json`);
    const capture = { url, final_url: result.final_url, http_status: result.http_status, captured_at: result.captured_at, notes: result.notes };
    writeFileSync(stylesFile, JSON.stringify({ capture, ...data }, null, 2));
    result.files.push(stylesFile);
  }
  return result;
}

async function main() {
  const opts = parseArgs(process.argv.slice(2));
  const pw = loadPlaywright();
  if (!pw || !pw.chromium) {
    console.error('Playwright is not installed. Install it with `npm i -g playwright && npx playwright install chromium`, or use another browser/screenshot tool.');
    process.exit(2);
  }
  mkdirSync(resolve(opts.out), { recursive: true });

  let browser;
  try {
    const launch = { headless: true };
    const proxy = proxyFromEnv();
    if (proxy) {
      launch.proxy = proxy;
      // Otherwise Playwright forces loopback through the proxy, overriding NO_PROXY.
      process.env.PLAYWRIGHT_DISABLE_FORCED_CHROMIUM_PROXIED_LOOPBACK = '1';
    }
    if (process.env.CHROMIUM_PATH && existsSync(process.env.CHROMIUM_PATH)) launch.executablePath = process.env.CHROMIUM_PATH;
    browser = await pw.chromium.launch(launch);
  } catch (e) {
    console.error(`Could not launch Chromium: ${e.message.split('\n')[0]}`);
    console.error('Run `npx playwright install chromium`, or set CHROMIUM_PATH to a Chromium executable.');
    process.exit(2);
  }

  const used = new Set();
  const results = [];
  try {
    for (const url of opts.urls) {
      let name;
      try { name = baseName(url, used); } catch { results.push({ url, errors: ['invalid URL'], files: [] }); continue; }
      results.push(await capture(browser, pw.devices, url, name, opts));
    }
  } finally {
    await browser.close();
  }

  console.log(JSON.stringify(results, null, 2));
  process.exit(results.some(r => r.files.length) ? 0 : 1);
}

main().catch(e => { console.error(e); process.exit(1); });
