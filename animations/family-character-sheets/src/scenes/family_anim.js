// family_anim.js: animated clips of the family, as standalone loops. Render one to MP4 with:
//   node render.mjs --soft-gl --loop=mom_walk --clip --out=clips/mom_walk.mp4
// Clips per character: <who>_turn (360° turnaround), <who>_walk, <who>_run (cycles, tracking camera),
// <who>_jump (jump and wave), <who>_emotions (14 acted emotion changes, medium shot).
//
// Animation renders swap p5.brush's watercolour fills for flat washes (FAST below): the look barely changes and frames
// render about 300 times faster without a GPU. The sheets keep the fills.
(() => {
  const FAST = () => { window.NOFILL = true; };
  { const _paint = paint; paint = (pts, o = {}) => _paint(pts, window.NOFILL && o.fill ? (o.wash ? { ...o, fill: undefined } : { ...o, wash: o.fill, washOp: Math.min(255, (o.fillOp ?? 170) * .55), fill: undefined }) : o); }

  const ORDER = ['girl', 'boy', 'mom', 'dad', 'grandma', 'grandpa'];
  const tall = C => C.leg + .2 + C.torso + C.neck + C.ry * 1.9 + C.vol + (C.style === 'bun' ? .8 : 0) + (C.curl ? .3 : 0);
  // blinks every few seconds, at a different moment for each character
  const blinkAt = (t, seed = 0) => ((t + hash(seed + 3) * 3.1) % 3.3) < .12 ? 1 : 0;
  const breath = t => .035 * Math.sin(t * TAU * .32);
  const floor = (y, x0 = 40, x1 = W - 40) => { boilSeed('floor' + y); inkLine([[x0, y + 6], [W / 2, y + 4], [x1, y + 7]], .6, mixCol(PAL.paper, PAL.ink, .35), 'inkfine', .5); };
  // body drop that keeps the lowest foot on the ground, whatever the legs are doing
  const plant = (C, legs) => C.leg / 2 * (2 - Math.max(...legs.map(([a, k]) => Math.cos(a) + Math.cos(a + k))));
  const relX = (C, [a, k]) => C.leg / 2 * (Math.sin(a) + Math.sin(a + k));

  // ---------- cycles ----------
  // Walk / run at phase ph (radians, one stride = 2π): thigh swings A·sin, the knee folds on the forward swing.
  function cycle(C, ph, run) {
    const A = run ? .78 : .42, K = run ? 1.9 : 1.05;
    const leg = p => [A * Math.sin(p), -K * Math.pow(Math.max(0, Math.cos(p)), run ? 1 : 1.4) - (run ? .25 : .06)];
    const legs = [leg(ph), leg(ph + Math.PI)], s = Math.sin(ph);
    const arms = run
      ? [[-.85 * s, 1.45 + .25 * s], [.85 * s, 1.45 - .25 * s]]
      : [[-.45 * s, .28 + .3 * Math.max(0, -s)], [.45 * s, .28 + .3 * Math.max(0, s)]];
    return { legs, arms, dy: plant(C, legs) - (run ? .32 * Math.abs(Math.cos(ph)) : 0), lean: run ? .2 : .03 };
  }
  // distance the body covers per half stride (the planted foot doesn't slide)
  const stride = (C, run) => { const A = run ? .78 : .42, k = run ? -.25 : -.06; return relX(C, [A, k]) - relX(C, [-A, k]); };

  // ---------- acting an emotion timeline ----------
  // Keep in step with the Remotion reel (src/emotions.ts there): the same list, start and duration.
  const EMO_LIST = ['neutral', 'happy', 'laugh', 'surprised', 'scared', 'sad', 'cry', 'angry', 'love', 'thinking', 'idea', 'excited', 'proud', 'sleepy'];
  const EMO_T0 = .3, EMO_DUR = 1.3, EMO_KEYS = EMO_LIST.map((n, i) => [i ? EMO_T0 + i * EMO_DUR : 0, n]);
  for (const who of ORDER) {
    const C = CAST[who], face = (name, over = {}) => ({ ...FACES[name], ...over });

    // ---------- 360° turnaround ----------
    // Steps through the eight drawn key views (front, 3/4, side, 3/4 back, back, and the mirrored ones), holding each.
    const TURN = [['front', 0], ['q', 0], ['side', 0], ['qback', 0], ['back', 0], ['qback', 1], ['side', 1], ['q', 1], ['front', 0]];
    LOOPS[who + '_turn'] = t => {
      FAST();
      const fy = 900, u = 640 / (tall(C) * C.sc), t0 = .8, hold = .55;
      floor(fy);
      const k = t < t0 ? 0 : Math.min(8, Math.floor((t - t0) / hold) + 1), since = t < t0 ? 9 : t - t0 - (k - 1) * hold;
      const [view, flip] = TURN[k], kick = k ? spring(since, 0, 9, 24) : 0;
      person(960, fy, u, who, { view, flip: !!flip, face: face('neutral', { blink: blinkAt(t, 1) }), sq: .035 * kick, dy: breath(t) - .06 * Math.max(0, kick), boilKey: who });
    };
    LOOPS[who + '_turn'].len = .8 + 8 * .55 + .9;

    // ---------- walk and run: cycles under a tracking camera; the ground scrolls past ----------
    for (const run of [false, true]) {
      const period = run ? .62 : 1.05, len = run ? 3.2 : 4.4;
      LOOPS[who + (run ? '_run' : '_walk')] = t => {
        FAST();
        const fy = 900, u = 600 / (tall(C) * C.sc), U = u * C.sc, ph = t / period * TAU;
        const scroll = (t / period) * 2 * stride(C, run) * U;
        boilSeed('ground');
        paint(rectPts(-40, fy + 4, W + 80, H - fy + 40), { wash: '#A9C98B', washOp: 110, ink: null });
        floor(fy);
        for (let i = 0; i < 16; i++) {   // grass tufts and pebbles scroll by at the walking speed
          const x = ((i * 157 - scroll) % (W + 300) + W + 300) % (W + 300) - 150, yy = fy + 30 + 120 * hash(i);
          boilSeed('tuft' + i);
          if (i % 3) for (const d of [-8, 0, 8]) inkLine([[x + d * .5, yy], [x + d, yy - 14 - 10 * hash(i + d)]], .5, '#5E8A48', 'inkfine', .3);
          else paint(ellPts(x, yy, 9, 5, 10), { wash: '#C9BFA8', ink: PAL.ink, sw: .35 });
        }
        const cy = cycle(C, ph, run);
        person(960, fy, u, who, { view: 'side', ...cy, face: face(run ? 'determined' : 'happy', { blink: run ? 0 : blinkAt(t, 2), emote: null }), boilKey: who });
      };
      LOOPS[who + (run ? '_run' : '_walk')].len = len;
    }

    // ---------- jump, land, wave ----------
    LOOPS[who + '_jump'] = t => {
      FAST();
      const fy = 900, u = 600 / ((tall(C) + 1.5) * C.sc);
      floor(fy);
      const crouchL = [[-.32, .72], [.32, -.72]], tuck = [[-.4, 1.0], [.4, -1.0]], straight = [[-.04, 0], [.04, 0]];
      const T0 = 1.0, T1 = 1.3, T2 = 1.95, T3 = 2.35;   // crouch, take off, land, recover
      let legs = straight, arms = [[-.13, .14], [.13, -.14]], air = 0, sq = 0, f = face('happy', { blink: blinkAt(t, 3) }), emote = null, emoteK = 0;
      const mix = (A, B, k) => A.map((p, i) => [lerp(p[0], B[i][0], k), lerp(p[1], B[i][1], k)]);
      if (t >= T0 && t < T1) { const k = ease(seg(t, T0, T1)); legs = mix(straight, crouchL, k); arms = mix(arms, [[-.55, -.3], [.55, .3]], k); f = face('determined'); }
      else if (t >= T1 && t < T2) {
        const k = (t - T1) / (T2 - T1); legs = mix(straight, tuck, Math.sin(k * Math.PI)); air = 3.2 * 4 * k * (1 - k);
        arms = [[-2.5, -.2, 'open'], [2.5, .2, 'open']]; f = face('excited'); emote = 'spark'; emoteK = seg(k, .2, .45); sq = -.06 * Math.cos(k * Math.PI);
      } else if (t >= T2 && t < T3) { const k = seg(t, T2, T3); legs = mix(crouchL, straight, easeOut(k)); sq = .12 * Math.exp(-6 * k) * Math.cos(12 * k); f = face('laugh'); }
      else if (t >= T3) {
        const w = Math.sin((t - T3) * TAU * 2.2);
        arms = [[-.13, .14], [lerp(.13, 2.35, backOut(seg(t, T3, T3 + .35))), lerp(-.14, .55 + .4 * w, seg(t, T3, T3 + .35)), 'open']];
        f = face(t < T3 + 1.2 ? 'laugh' : 'happy', { blink: blinkAt(t, 3) });
      }
      person(960, fy, u, who, { view: 'front', legs, arms, dy: plant(C, legs) - air + breath(t), sq, face: f, emote, emoteK, emoteAge: t - T1, boilKey: who });
    };
    LOOPS[who + '_jump'].len = 4.6;

    // ---------- emotions: acted changes, medium shot ----------
    LOOPS[who + '_emotions'] = t => {
      FAST();
      const u = 900 / ((tall(C) - C.leg * .55) * C.sc), fy = 70 + tall(C) * u * C.sc;
      boilSeed('backdrop');
      paint(ellPts(960, 560, 620, 470, 40, 6), { wash: mixCol(C.top, PAL.paper, .62), washOp: 140, ink: null });
      person(960, fy, u, who, { view: 'front', ...actEmotions(who, t, EMO_KEYS), boilKey: who });
    };
    LOOPS[who + '_emotions'].len = EMO_T0 + EMO_LIST.length * EMO_DUR + .3;
  }

  // each emotion's body (front view): arms, lean, head tilt, bounce
  const EBODY = {
    neutral:   t => ({ arms: [[-.13, .14], [.13, -.14]] }),
    happy:     t => ({ arms: [[-.42, .5], [.42, -.5]], dy: -.14 * Math.abs(Math.sin(t * TAU)) }),
    laugh:     t => { const c = Math.abs(Math.sin(t * TAU * 4)); return { arms: [{ to: 'belly0', bend: -1 }, { to: 'belly1', bend: 1 }], dy: -.07 * c, tilt: -.12 + .05 * c, lean: -.03 }; },
    surprised: t => ({ arms: [[-1.95, -.85, 'open'], [1.95, .85, 'open']], dy: -.1 }),
    scared:    t => ({ arms: [{ to: 'cheek0', bend: -1, hand: 'open' }, { to: 'cheek1', bend: 1, hand: 'open' }], dx: .03 * Math.sin(t * TAU * 11), dy: .08 }),
    sad:       t => ({ arms: [[-.04, .02], [.04, -.02]], tilt: .22, lean: .04, dy: .12, sq: .03 }),
    cry:       t => ({ arms: [{ to: 'eye0', bend: -1 }, { to: 'eye1', bend: 1 }], dy: .06 - .06 * Math.abs(Math.sin(t * TAU * 1.6)), tilt: .1 }),
    angry:     t => ({ arms: [[-.32, .3], [.32, -.3]], dx: .025 * Math.sin(t * TAU * 14), lean: .03, sq: -.02 }),
    love:      t => ({ arms: [{ to: 'chest', bend: -1, hand: 'open' }, { to: 'chest', bend: 1, hand: 'open' }], dx: .12 * Math.sin(t * TAU * .8), tilt: .12 * Math.sin(t * TAU * .8) }),
    thinking:  t => ({ arms: [{ to: 'chin', bend: -1 }, { to: 'belly0', bend: 1 }], tilt: .08 }),
    idea:      t => ({ arms: [[-.13, .14], [2.75, .15, 'point']], dy: -.1 * Math.abs(Math.sin(t * TAU)) }),
    excited:   t => ({ arms: [[-2.5, -.2, 'open'], [2.5, .2, 'open']], dy: -.75 * Math.abs(Math.sin(t * TAU)) }),
    proud:     t => ({ arms: [{ to: 'hip0', bend: -1 }, { to: 'hip1', bend: 1 }], tilt: -.1 }),
    sleepy:    t => ({ arms: [[-.03, .03], [.03, -.03]], tilt: .3 + .06 * Math.sin(t * TAU * .3), dx: .05 * Math.sin(t * TAU * .3) }),
  };
  // Like Clawd's emotions(): the eyes shut just before and after each change (so the face swaps unseen), a take fires,
  // the body swings into its new pose with overshoot, brows/blush/tint cross-fade and the new emote pops in.
  function actEmotions(who, t, keys) {
    let i = 0; while (i + 1 < keys.length && t >= keys[i + 1][0]) i++;
    const [tc, name] = keys[i], age = t - tc, tn = i + 1 < keys.length ? keys[i + 1][0] : Infinity, prev = i ? keys[i - 1][1] : null;
    const F = FACES[name], Fp = prev ? FACES[prev] : F, B = EBODY[name](t), Bp = prev ? EBODY[prev](t) : B;
    const k = prev ? backOut(seg(age, 0, .4)) : 1, kc = prev ? ease(seg(age, 0, .3)) : 1;
    const A = resolveArms(who, 'front', B.arms), Ap = resolveArms(who, 'front', Bp.arms);
    const arms = A.map((x, j) => ({ a: lerp(Ap[j].a, x.a, k), e: lerp(Ap[j].e, x.e, k), hand: k > .5 ? x.hand : Ap[j].hand }));
    const num = f => lerp(Bp[f] || 0, B[f] || 0, k), br = (f, b) => lerp((Fp.brows || {})[f] || 0, (F.brows || {})[f] || 0, b);
    const brows = { r: br('r', kc), t: br('t', kc), a: [0, 1].map(j => lerp(((Fp.brows || {}).a || [0, 0])[j], ((F.brows || {}).a || [0, 0])[j], kc)) };
    const tk = prev ? take(t, tc, .45) : { sq: 0, dy: 0 }, tkN = tn < Infinity ? take(t, tn, .45) : { sq: 0, dy: 0 };
    const blink = (tn - t < .09 || (prev && age < .09)) ? 1 : blinkAt(t, 5);
    const face = { ...F, brows, blink, blush: lerp(Fp.blush || 0, F.blush || 0, kc), tint: F.tint || Fp.tint, tintK: F.tint ? (F.tintK ?? .3) * kc : (Fp.tintK ?? .3) * (1 - kc) };
    return {
      face, arms, dx: num('dx'), dy: num('dy') + breath(t) + (tk.dy + tkN.dy) * .35, sq: num('sq') + (tk.sq + tkN.sq) * .5,
      lean: num('lean'), tilt: lerp((Bp.tilt || 0) + (Fp.tilt || 0), (B.tilt || 0) + (F.tilt || 0), k),
      emote: F.emote, emoteK: seg(age, .06, .3) * (name === 'surprised' ? 1 - seg(age, 1.0, 1.25) : 1), emoteAge: age,
    };
  }
})();
