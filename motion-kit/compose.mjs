// Render a motion-kit timeline to MP4.
//   node compose.mjs videos/01-return.html                     → placeholder face, silent
//   node compose.mjs videos/01-return.html --footage take.mp4  → your footage in the card, with its audio
//   node compose.mjs videos/01-return.html --frames 2,10.5,30  → PNG stills only (quick check)
// Options: --out file.mp4
import { chromium } from 'playwright';
import { spawn, spawnSync } from 'child_process';
import { mkdtempSync, mkdirSync, rmSync, writeFileSync } from 'fs';
import { tmpdir } from 'os';
import path from 'path';

const args = process.argv.slice(2);
const opt = (k) => { const i = args.indexOf(k); return i >= 0 ? args[i + 1] : null; };
const html = path.resolve(args[0]);
const footage = opt('--footage') && path.resolve(opt('--footage'));
const stills = opt('--frames');
const out = path.resolve(opt('--out') || html.replace(/\.html$/, '.mp4'));

let frameDir = null;
if (footage) {
  // footage → 25 fps, vertical 1080×1920 JPEG frames that the card shows one by one
  frameDir = mkdtempSync(path.join(tmpdir(), 'kit-frames-'));
  const r = spawnSync('ffmpeg', ['-loglevel', 'error', '-y', '-i', footage, '-vf',
    'fps=25,scale=1080:1920:force_original_aspect_ratio=increase,crop=1080:1920', '-q:v', '3',
    path.join(frameDir, 'f_%05d.jpg')], { stdio: 'inherit' });
  if (r.status !== 0) process.exit(r.status);
}

const browser = await chromium.launch({ args: ['--allow-file-access-from-files'] });
const page = await browser.newPage({ viewport: { width: 1080, height: 1920 } });
if (frameDir) await page.addInitScript((p) => { window.__FOOTAGE = p; }, 'file://' + path.join(frameDir, 'f_{n}.jpg'));
await page.goto('file://' + html);
await page.evaluate(() => document.fonts.ready);
await page.waitForTimeout(600);
const { FPS, DURATION } = await page.evaluate(() => ({ FPS, DURATION }));

const frame = async (t, type) => {
  await page.evaluate((t) => render(t), t);
  await page.evaluate(() => frameReady());
  return page.screenshot(type === 'png' ? { type: 'png' } : { type: 'jpeg', quality: 94 });
};

if (stills) {
  const dir = out.replace(/\.mp4$/, '-frames');
  mkdirSync(dir, { recursive: true });
  for (const t of stills.split(',').map(Number)) {
    writeFileSync(path.join(dir, `t${t}.png`), await frame(t, 'png'));
  }
  console.log('stills →', dir);
} else {
  const audio = footage ? ['-i', footage, '-map', '0:v', '-map', '1:a?'] : ['-f', 'lavfi', '-t', String(DURATION), '-i', 'anullsrc=r=48000:cl=stereo', '-map', '0:v', '-map', '1:a'];
  const ff = spawn('ffmpeg', ['-loglevel', 'error', '-y', '-f', 'image2pipe', '-framerate', String(FPS), '-c:v', 'mjpeg', '-i', '-',
    ...audio, '-c:v', 'libx264', '-pix_fmt', 'yuv420p', '-crf', '18', '-preset', 'medium', '-r', String(FPS),
    '-c:a', 'aac', '-b:a', '192k', '-t', String(DURATION), '-movflags', '+faststart', out], { stdio: ['pipe', 'inherit', 'inherit'] });
  const N = Math.round(FPS * DURATION);
  for (let i = 0; i < N; i++) {
    const buf = await frame(i / FPS, 'jpeg');
    if (!ff.stdin.write(buf)) await new Promise((r) => ff.stdin.once('drain', r));
    if (i % 125 === 0) process.stdout.write(`\r${Math.round(i / N * 100)}%`);
  }
  ff.stdin.end();
  await new Promise((r) => ff.on('close', r));
  console.log('\rvideo →', out);
}
await browser.close();
if (frameDir) rmSync(frameDir, { recursive: true, force: true });
