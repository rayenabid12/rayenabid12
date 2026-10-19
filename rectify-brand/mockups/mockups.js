// Renders the Rectify application mockups (stationery, app, web, social, merch, signage).
const path = require('path');
const { C, symbol, wordmark, lockup, hlockup, render } = require('./lib');

const out = path.join(__dirname, 'png');
const src = path.join(__dirname, 'src');
const W = 1600, H = 1000;

const ico = {
  mail: `<svg viewBox="0 0 24 24" width="100%" height="100%" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="5" width="18" height="14" rx="3"/><path d="m4 7 8 6 8-6"/></svg>`,
  phone: `<svg viewBox="0 0 24 24" width="100%" height="100%" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M6 3h3l2 5-2.5 1.5a11 11 0 0 0 6 6L16 13l5 2v3a3 3 0 0 1-3 3A15 15 0 0 1 3 6a3 3 0 0 1 3-3z"/></svg>`,
  web: `<svg viewBox="0 0 24 24" width="100%" height="100%" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"><circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3c3 3 3 15 0 18M12 3c-3 3-3 15 0 18"/></svg>`,
  play: `<svg viewBox="0 0 24 24" width="100%" height="100%"><path d="M8 5.5v13a1 1 0 0 0 1.5.9l10-6.5a1 1 0 0 0 0-1.7l-10-6.6A1 1 0 0 0 8 5.5z" fill="currentColor"/></svg>`,
  star: `<svg viewBox="0 0 24 24" width="100%" height="100%"><path d="M12 2.8l2.8 5.8 6.3.9-4.6 4.4 1.1 6.3L12 17.2l-5.6 3 1.1-6.3L2.9 9.5l6.3-.9z" fill="currentColor" stroke="currentColor" stroke-width="1.5" stroke-linejoin="round"/></svg>`,
  home: `<svg viewBox="0 0 24 24" width="100%" height="100%" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linejoin="round"><path d="M4 11 12 4l8 7v9h-5v-6H9v6H4z"/></svg>`,
  search: `<svg viewBox="0 0 24 24" width="100%" height="100%" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round"><circle cx="11" cy="11" r="7"/><path d="m20 20-4-4"/></svg>`,
  user: `<svg viewBox="0 0 24 24" width="100%" height="100%" fill="none" stroke="currentColor" stroke-width="2.4"><circle cx="12" cy="8" r="4"/><path d="M4 21a8 8 0 0 1 16 0"/></svg>`,
};
const I = (name, s, color) => `<span style="display:inline-block;width:${s}px;height:${s}px;color:${color};flex:none">${ico[name]}</span>`;

const contact = [['mail', 'contact@rectify.tn'], ['phone', '+216 25 477 131'], ['web', 'www.rectify.tn']];

// ---- Business cards ---------------------------------------------------------
const cardW = 520, cardH = 300;
const stack = (n) => Array.from({ length: n }, (_, i) => `0 ${i + 1}px 0 ${i % 2 ? '#e9e1d6' : '#f4eee6'}`).join(',');
const cardFront = `<div style="width:${cardW}px;height:${cardH}px;border-radius:14px;background:${C.orange};position:relative;overflow:hidden;display:flex;align-items:center;justify-content:center;box-shadow:${stack(10)},0 40px 50px rgba(60,30,10,.28)">
  <div style="position:absolute;right:-60px;bottom:-120px;opacity:.16">${symbol(C.white, 380)}</div>
  ${lockup(C.white, 170)}</div>`;
const cardBack = `<div style="width:${cardW}px;height:${cardH}px;border-radius:14px;background:${C.cream};position:relative;overflow:hidden;padding:42px 44px;display:flex;flex-direction:column;justify-content:space-between;box-shadow:${stack(10)},0 40px 50px rgba(60,30,10,.28)">
  <div><div class="f" style="font-size:34px;font-weight:600;line-height:1">Bassem Bouazizi</div>
  <div style="font-size:17px;color:${C.deep};font-weight:700;margin-top:8px;letter-spacing:.04em;text-transform:uppercase">Project Manager</div></div>
  <div style="display:flex;flex-direction:column;gap:9px;font-size:17px;font-weight:600">${contact.map(([i, t]) => `<div style="display:flex;align-items:center;gap:12px">${I(i, 20, C.orange)}${t}</div>`).join('')}</div>
  <div style="position:absolute;right:40px;top:40px">${symbol(C.orange, 70)}</div>
  <div style="position:absolute;left:0;right:0;bottom:0;height:12px;background:linear-gradient(90deg,${C.orange} 0 70%,${C.coral} 70%)"></div></div>`;
const iso = (inner, x, y, rot = 0) => `<div style="position:absolute;left:${x}px;top:${y}px;transform:rotateX(52deg) rotateZ(${-38 + rot}deg);transform-style:preserve-3d">${inner}</div>`;
const cards = {
  name: 'mockup-business-cards', w: W, h: H,
  body: `<div style="width:${W}px;height:${H}px;background:radial-gradient(ellipse at 40% 30%,#efe6da,#d9cbbb);perspective:2400px;position:relative;overflow:hidden">
  ${iso(cardFront, 120, 150)}${iso(cardBack, 860, 60, 4)}${iso(cardBack, 260, 560, -2)}${iso(cardFront, 1000, 470, 6)}</div>`,
};

// ---- Stationery -------------------------------------------------------------
const lorem = 'Thank you for joining Rectify. We build short, playful video lessons and activities that help children explore math, language and science at their own pace. This letter confirms your school’s partnership for the new term.';
const letter = `<div style="width:600px;height:850px;background:#fffdf9;border-radius:4px;padding:64px 64px 50px;display:flex;flex-direction:column;position:relative;overflow:hidden;box-shadow:0 30px 60px rgba(0,0,0,.45)">
  <div style="display:flex;justify-content:space-between;align-items:flex-start">${hlockup(C.orange, 64, '', C.ink)}
  <div style="font-size:12px;line-height:1.7;text-align:right;color:#6b5d54">contact@rectify.tn<br>+216 25 477 131<br>www.rectify.tn</div></div>
  <div style="margin-top:70px;font-size:13px;color:#6b5d54">19 October 2026</div>
  <div style="margin-top:22px;font-size:14px;font-weight:700">Dear Ms. Ben Salah,</div>
  ${[lorem, 'Our team will share the onboarding kit, teacher accounts and a short training session over the coming weeks. If anything is unclear, we are one message away.', 'We can’t wait to see what your students discover.'].map((t) => `<p style="margin-top:16px;font-size:13.5px;line-height:1.75;color:#3d322c">${t}</p>`).join('')}
  <div style="margin-top:34px;font-size:13.5px">Warm regards,</div>
  <div class="f" style="margin-top:22px;font-size:20px;font-weight:600">Bassem Bouazizi</div>
  <div style="font-size:12px;color:${C.deep};font-weight:700;text-transform:uppercase;letter-spacing:.06em">General Manager</div>
  <div style="position:absolute;left:0;right:0;bottom:0;height:14px;background:linear-gradient(90deg,${C.orange} 0 70%,${C.coral} 70%)"></div>
  <div style="position:absolute;right:-70px;bottom:-60px;opacity:.07">${symbol(C.orange, 340)}</div></div>`;
const envelope = `<div style="width:720px;height:360px;background:${C.orange};border-radius:6px;position:relative;overflow:hidden;box-shadow:0 30px 60px rgba(0,0,0,.45)">
  <div style="position:absolute;left:-40px;top:-110px;opacity:.95">${symbol(C.white, 520)}</div>
  <div style="position:absolute;right:48px;bottom:44px;font-size:16px;line-height:1.7;color:${C.ink};font-weight:600;text-align:right">Rectify<br>Tunis, Tunisia<br>www.rectify.tn</div></div>`;
const compCard = `<div style="width:420px;height:210px;background:${C.coral};border-radius:6px;display:flex;align-items:center;justify-content:center;box-shadow:0 26px 50px rgba(0,0,0,.45)">${hlockup(C.white, 90)}</div>`;
const stationery = {
  name: 'mockup-stationery', w: W, h: H,
  body: `<div style="width:${W}px;height:${H}px;background:radial-gradient(ellipse at 30% 20%,#3a2e27,#1c1511);position:relative;overflow:hidden">
  <div style="position:absolute;left:190px;top:70px;transform:rotate(-4deg)">${letter}</div>
  <div style="position:absolute;left:820px;top:140px;transform:rotate(5deg)">${envelope}</div>
  <div style="position:absolute;left:930px;top:600px;transform:rotate(-7deg)">${compCard}</div>
</div>`,
};

// ---- App screens -------------------------------------------------------------
const phone = (screen) => `<div style="width:380px;height:790px;border-radius:58px;background:#16110e;padding:14px;box-shadow:0 50px 80px rgba(60,30,10,.35),inset 0 0 0 2px #3b302a">
  <div style="width:100%;height:100%;border-radius:46px;overflow:hidden;position:relative;background:${C.cream}">
  <div style="position:absolute;top:12px;left:50%;transform:translateX(-50%);width:110px;height:32px;border-radius:16px;background:#16110e;z-index:5"></div>
  <div style="height:54px;display:flex;align-items:center;justify-content:space-between;padding:6px 30px 0;font-size:15px;font-weight:800"><span>9:41</span><span>●●● ▮</span></div>
  ${screen}</div></div>`;
const nav = (active) => `<div style="position:absolute;left:16px;right:16px;bottom:16px;height:70px;border-radius:24px;background:${C.white};display:flex;align-items:center;justify-content:space-around;box-shadow:0 8px 20px rgba(35,26,21,.08)">
  ${['home', 'search', 'star', 'user'].map((n, i) => `<div style="width:48px;height:48px;border-radius:16px;display:flex;align-items:center;justify-content:center;background:${i === active ? C.orange : 'transparent'}">${I(n, 24, i === active ? C.ink : '#9b8b80')}</div>`).join('')}</div>`;
const subject = (bg, label, count, glyph) => `<div style="flex:1;border-radius:22px;background:${bg};padding:16px 14px;display:flex;flex-direction:column;gap:30px">
  <div class="f" style="width:42px;height:42px;border-radius:14px;background:rgba(255,255,255,.55);display:flex;align-items:center;justify-content:center;font-size:24px;font-weight:700">${glyph}</div>
  <div><div class="f" style="font-size:19px;font-weight:600">${label}</div><div style="font-size:12px;font-weight:700;opacity:.75">${count} videos</div></div></div>`;
const screenHome = `<div style="padding:12px 22px">
  <div style="display:flex;justify-content:space-between;align-items:center">${symbol(C.orange, 40)}<div style="width:40px;height:40px;border-radius:20px;background:${C.peach};display:flex;align-items:center;justify-content:center" class="f"><b>L</b></div></div>
  <div class="f" style="font-size:30px;font-weight:600;line-height:1.1;margin-top:20px">Hi Lina!<br><span style="color:${C.deep}">What will you discover today?</span></div>
  <div style="display:flex;gap:10px;margin-top:22px">${subject(C.sun, 'Math', 48, '+')}${subject('#7CD3B4', 'Words', 36, 'Aa')}${subject('#9EC3FA', 'Science', 52, '?')}</div>
  <div style="margin-top:22px;font-weight:800;font-size:16px">Continue watching</div>
  <div style="margin-top:10px;border-radius:24px;background:${C.white};padding:12px;display:flex;gap:14px;align-items:center;box-shadow:0 6px 18px rgba(35,26,21,.06)">
    <div style="width:96px;height:76px;border-radius:16px;background:linear-gradient(135deg,${C.coral},${C.orange});display:flex;align-items:center;justify-content:center">${I('play', 30, C.white)}</div>
    <div style="flex:1"><div class="f" style="font-size:17px;font-weight:600;line-height:1.15">Why is the sky blue?</div><div style="font-size:12px;color:#7a6b61;font-weight:700;margin-top:4px">Science · 4 min</div>
    <div style="height:7px;border-radius:4px;background:${C.peach};margin-top:8px"><div style="width:62%;height:100%;border-radius:4px;background:${C.orange}"></div></div></div></div></div>${nav(0)}`;
const screenVideo = `<div style="height:300px;background:linear-gradient(160deg,#9EC3FA,${C.sky});position:relative;display:flex;align-items:center;justify-content:center;overflow:hidden">
  <div style="position:absolute;right:-30px;bottom:-60px;opacity:.25">${symbol(C.white, 260)}</div>
  <div style="width:80px;height:80px;border-radius:40px;background:${C.white};display:flex;align-items:center;justify-content:center;padding-left:6px">${I('play', 36, C.ink)}</div>
  <div style="position:absolute;left:18px;right:18px;bottom:16px;height:6px;border-radius:3px;background:rgba(255,255,255,.4)"><div style="width:40%;height:100%;background:${C.white};border-radius:3px"></div></div></div>
  <div style="padding:20px 22px">
  <div style="display:inline-block;padding:5px 12px;border-radius:10px;background:#DCE9FD;font-size:12px;font-weight:800;color:#1D4F9A">SCIENCE · LESSON 3</div>
  <div class="f" style="font-size:28px;font-weight:600;line-height:1.1;margin-top:12px">Why is the sky blue?</div>
  <div style="font-size:14px;line-height:1.5;color:#5c4f47;margin-top:8px">Sunlight is made of many colors. Watch how the air bends the blue ones all around us!</div>
  <div style="margin-top:18px;border-radius:22px;background:${C.white};padding:16px">
   <div style="font-weight:800;font-size:15px">Quick quiz</div>
   <div style="font-size:14px;margin-top:6px">Which color scatters the most?</div>
   <div style="display:flex;gap:8px;margin-top:12px">${['Red', 'Blue', 'Green'].map((t) => `<div style="flex:1;text-align:center;padding:10px 0;border-radius:14px;font-weight:800;font-size:14px;${t === 'Blue' ? `background:${C.orange};color:${C.ink}` : `background:${C.cream}`}">${t}</div>`).join('')}</div></div></div>${nav(1)}`;
const screenProgress = `<div style="padding:12px 22px">
  <div class="f" style="font-size:28px;font-weight:600">My progress</div>
  <div style="margin-top:16px;border-radius:26px;background:${C.orange};padding:20px;position:relative;overflow:hidden">
   <div style="position:absolute;right:-20px;top:-26px;opacity:.25">${symbol(C.white, 180)}</div>
   <div class="f" style="font-size:54px;font-weight:700;line-height:1">7</div><div style="font-weight:800;font-size:16px">day learning streak</div>
   <div style="display:flex;gap:6px;margin-top:14px">${'MTWTFSS'.split('').map((d, i) => `<div style="width:30px;height:30px;border-radius:10px;background:${i < 5 ? C.ink : 'rgba(255,255,255,.4)'};color:${i < 5 ? C.white : C.ink};font-size:12px;font-weight:800;display:flex;align-items:center;justify-content:center">${d}</div>`).join('')}</div></div>
  <div style="margin-top:20px;font-weight:800;font-size:16px">Badges</div>
  <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:10px;margin-top:10px">
   ${[[C.sun, 'Number Ninja'], ['#7CD3B4', 'Word Wizard'], ['#9EC3FA', 'Sky Spotter'], [C.peach, 'Early Bird'], [C.coral, 'Quiz Star'], ['#EDE4DA', '???']].map(([bg, t], i) => `<div style="border-radius:20px;background:${C.white};padding:12px 6px;display:flex;flex-direction:column;align-items:center;gap:8px">
   <div style="width:56px;height:56px;border-radius:28px;background:${bg};display:flex;align-items:center;justify-content:center;${i === 5 ? 'opacity:.5' : ''}">${I('star', 28, i === 5 ? '#b5a79c' : C.ink)}</div><div style="font-size:11px;font-weight:800;text-align:center">${t}</div></div>`).join('')}</div></div>${nav(2)}`;
const app = {
  name: 'mockup-app', w: W, h: H,
  body: `<div style="width:${W}px;height:${H}px;background:${C.peach};position:relative;overflow:hidden;display:flex;align-items:center;justify-content:center;gap:56px">
  <div style="position:absolute;left:-120px;top:-140px;opacity:.35">${symbol(C.white, 700)}</div>
  <div style="transform:translateY(40px)">${phone(screenVideo)}</div><div style="transform:translateY(-30px)">${phone(screenHome)}</div><div style="transform:translateY(40px)">${phone(screenProgress)}</div></div>`,
};

// ---- Website ------------------------------------------------------------------
const site = `<div style="width:1180px;height:720px;background:${C.cream};overflow:hidden;position:relative">
  <div style="height:84px;display:flex;align-items:center;justify-content:space-between;padding:0 56px">${hlockup(C.orange, 48, '', C.ink)}
  <div style="display:flex;gap:36px;font-weight:700;font-size:16px;align-items:center"><span>Subjects</span><span>For parents</span><span>For schools</span>
  <span style="padding:12px 22px;border-radius:16px;background:${C.ink};color:${C.white}">Log in</span></div></div>
  <div style="display:flex;padding:40px 56px 0;gap:30px">
   <div style="flex:1.1;padding-top:40px">
    <div style="display:inline-block;padding:7px 14px;border-radius:12px;background:${C.peach};color:${C.deep};font-weight:800;font-size:14px">NEW · 200+ science videos</div>
    <div class="f" style="font-size:76px;font-weight:600;line-height:1.02;margin-top:20px;letter-spacing:-.01em">Learn. Laugh.<br><span style="color:${C.orange}">Look closer.</span></div>
    <div style="font-size:20px;line-height:1.55;color:#5c4f47;margin-top:22px;max-width:470px">Short, playful videos and activities in math, language and science, made for curious kids.</div>
    <div style="display:flex;gap:14px;margin-top:30px"><span style="padding:18px 30px;border-radius:20px;background:${C.orange};font-weight:800;font-size:18px">Start exploring</span>
    <span style="padding:18px 30px;border-radius:20px;border:2px solid ${C.ink};font-weight:800;font-size:18px">How it works</span></div></div>
   <div style="flex:1;position:relative;height:540px">
    <div style="position:absolute;left:40px;top:10px;width:440px;height:440px;border-radius:220px;background:${C.orange}"></div>
    <div style="position:absolute;left:120px;top:40px">${symbol(C.white, 380)}</div>
    <div style="position:absolute;left:-10px;top:300px;padding:16px 20px;border-radius:22px;background:${C.white};box-shadow:0 16px 40px rgba(35,26,21,.12);display:flex;gap:12px;align-items:center">
     <div style="width:44px;height:44px;border-radius:14px;background:${C.sun};display:flex;align-items:center;justify-content:center" class="f"><b>+</b></div><div><div style="font-weight:800">Math</div><div style="font-size:13px;color:#7a6b61">48 videos</div></div></div>
    <div style="position:absolute;right:0;top:110px;padding:16px 20px;border-radius:22px;background:${C.white};box-shadow:0 16px 40px rgba(35,26,21,.12);display:flex;gap:12px;align-items:center">
     <div style="width:44px;height:44px;border-radius:14px;background:#9EC3FA;display:flex;align-items:center;justify-content:center" class="f"><b>?</b></div><div><div style="font-weight:800">Science</div><div style="font-size:13px;color:#7a6b61">52 videos</div></div></div>
   </div></div></div>`;
const web = {
  name: 'mockup-website', w: W, h: H,
  body: `<div style="width:${W}px;height:${H}px;background:linear-gradient(180deg,#f3ece3,#e2d6c8);display:flex;flex-direction:column;align-items:center;justify-content:center">
  <div style="width:1240px;border-radius:30px 30px 0 0;background:#1a1411;padding:30px 30px 26px">${site}</div>
  <div style="width:1440px;height:40px;border-radius:0 0 30px 30px;background:linear-gradient(180deg,#cfc5bb,#a99d92);position:relative;box-shadow:0 30px 40px rgba(60,30,10,.25)"><div style="position:absolute;left:50%;transform:translateX(-50%);width:220px;height:14px;border-radius:0 0 12px 12px;background:#8f8379"></div></div></div>`,
};

// ---- Social posts ---------------------------------------------------------------
const post = (bg, inner) => `<div style="width:440px;height:440px;border-radius:24px;background:${bg};position:relative;overflow:hidden;box-shadow:0 30px 50px rgba(60,30,10,.18)">${inner}</div>`;
const social = {
  name: 'mockup-social', w: W, h: H,
  body: `<div style="width:${W}px;height:${H}px;background:${C.cream};display:flex;align-items:center;justify-content:center;gap:40px">
  <div style="transform:translateY(-40px)">${post(C.coral, `<div style="padding:40px;height:100%;display:flex;flex-direction:column;justify-content:space-between">
    <div style="font-weight:800;font-size:18px;letter-spacing:.08em">MATH MONDAY</div>
    <div class="f" style="font-size:96px;font-weight:700;line-height:1">7 × 8 = ?</div>
    <div style="display:flex;justify-content:space-between;align-items:flex-end"><div style="font-size:18px;font-weight:700">Answer in the comments!</div>${symbol(C.ink, 70)}</div></div>`)}</div>
  <div style="transform:translateY(40px)">${post(C.orange, `<div style="position:absolute;right:-30px;bottom:-80px">${symbol(C.white, 260)}</div>
    <div style="padding:40px;position:relative"><div style="display:inline-block;padding:7px 14px;border-radius:12px;background:${C.ink};color:${C.white};font-weight:800;font-size:15px">NEW VIDEO</div>
    <div class="f" style="font-size:46px;font-weight:600;line-height:1.05;margin-top:24px;max-width:250px">Why do we have seasons?</div></div>`)}</div>
  <div style="transform:translateY(-40px)">${post(C.ink, `<div style="padding:40px;height:100%;display:flex;flex-direction:column;justify-content:space-between">
    ${hlockup(C.orange, 56, '', C.white)}
    <div class="f" style="font-size:58px;font-weight:600;line-height:1.05;color:${C.white}">Learn.<br>Laugh.<br><span style="color:${C.orange}">Look closer.</span></div></div>`)}</div></div>`,
};

// ---- Merch: tee, tote, stickers -----------------------------------------------
const tee = `<svg viewBox="0 0 400 420" width="470" height="494"><path d="M130 20 Q200 60 270 20 L370 70 L340 160 L300 140 L300 400 Q200 415 100 400 L100 140 L60 160 L30 70 Z" fill="${C.orange}"/><path d="M130 20 Q200 60 270 20 Q200 85 130 20Z" fill="#d86c00"/></svg>`;
const tote = `<div style="position:relative;width:380px;height:500px">
  <div style="position:absolute;left:90px;top:0;width:200px;height:200px;border:16px solid #e8dccb;border-bottom:none;border-radius:100px 100px 0 0"></div>
  <div style="position:absolute;left:0;top:150px;width:380px;height:350px;background:#f2e8da;border-radius:8px;display:flex;align-items:center;justify-content:center;box-shadow:0 30px 50px rgba(60,30,10,.2)">${lockup(C.ink, 210)}</div></div>`;
const sticker = (bg, inner, s, rot) => `<div style="width:${s}px;height:${s}px;border-radius:${s / 2}px;background:${bg};border:8px solid ${C.white};display:flex;align-items:center;justify-content:center;transform:rotate(${rot}deg);box-shadow:0 14px 26px rgba(60,30,10,.2)">${inner}</div>`;
const merch = {
  name: 'mockup-merch', w: W, h: H,
  body: `<div style="width:${W}px;height:${H}px;background:${C.peach};position:relative;overflow:hidden">
  <div style="position:absolute;left:90px;top:230px;filter:drop-shadow(0 30px 40px rgba(60,30,10,.25))">${tee}</div>
  <div style="position:absolute;left:250px;top:390px">${symbol(C.white, 210)}</div>
  <div style="position:absolute;left:630px;top:250px">${tote}</div>
  <div style="position:absolute;left:1090px;top:200px">${sticker(C.orange, symbol(C.white, 130), 200, -8)}</div>
  <div style="position:absolute;left:1260px;top:420px">${sticker(C.coral, `<div class="f" style="font-size:30px;font-weight:700;color:${C.ink};text-align:center;line-height:1">LOOK<br>CLOSER</div>`, 190, 10)}</div>
  <div style="position:absolute;left:1080px;top:540px">${sticker(C.ink, symbol(C.orange, 110), 170, -4)}</div>
  <div style="position:absolute;left:1180px;top:740px">${sticker(C.cream, wordmark(C.orange, 34), 180, 6)}</div></div>`,
};

// ---- Signage -------------------------------------------------------------------
const extrude = (fill) => `filter:${Array.from({ length: 6 }, (_, i) => `drop-shadow(${i * 0 + 1}px ${1}px 0 ${fill})`).join(' ')} drop-shadow(18px 26px 18px rgba(0,0,0,.45))`;
const sign = {
  name: 'mockup-signage', w: W, h: H,
  body: `<div style="width:${W}px;height:${H}px;background:linear-gradient(180deg,#3b302a 0 72%,#2a221e 72%);position:relative;overflow:hidden">
  <div style="position:absolute;inset:0;background:radial-gradient(ellipse at 50% 30%,rgba(255,226,199,.22),transparent 60%)"></div>
  <div style="position:absolute;left:50%;top:150px;transform:translateX(-50%);${extrude('#b85d00')}">${hlockup(C.orange, 300, '', C.white)}</div>
  <div style="position:absolute;left:180px;right:180px;top:720px;height:200px;border-radius:16px 16px 0 0;background:linear-gradient(180deg,${C.cream},#e6d9c9);box-shadow:0 -10px 40px rgba(0,0,0,.3)"></div>
  <div style="position:absolute;left:180px;right:180px;top:720px;height:16px;border-radius:16px 16px 0 0;background:${C.orange}"></div>
  <div class="f" style="position:absolute;left:0;right:0;top:810px;text-align:center;font-size:40px;font-weight:600;color:${C.ink}">Welcome, curious minds.</div></div>`,
};

render([cards, stationery, app, web, social, merch, sign], out, src).catch((e) => { console.error(e); process.exit(1); });
