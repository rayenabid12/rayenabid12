// family_sheets.js: model sheets for the family, as standalone loops (one still each). Labels are fine here: these are
// reference sheets, not a video. Render one with:
//   node render.mjs --loop=mom_turn --stills=0 --out=out/sheets/mom_turn
// Sheets per character: <who>_turn, <who>_faces_a, <who>_faces_b, <who>_poses_a, <who>_poses_b; plus lineup.
(() => {
  const label = (txt, x, y, size = 22, o = {}) => letter(txt, x, y, size, PAL.ink, { ink: false, alpha: .82, ...o });
  const title = (txt, sub) => {
    label(txt, 64, 58, 46, { align: 'left', alpha: .92 });
    if (sub) label(sub, 66, 100, 20, { align: 'left', alpha: .6 });
  };
  const floor = (y, x0 = 40, x1 = W - 40) => { boilSeed('floor' + y + x0); inkLine([[x0, y + 6], [(x0 + x1) / 2, y + 4], [x1, y + 7]], .6, mixCol(PAL.paper, PAL.ink, .35), 'inkfine', .5); };
  const guide = (y, x0, x1) => { boilSeed('guide' + y); inkLine([[x0, y], [x1, y]], .35, mixCol(PAL.paper, PAL.ink, .22), 'inkfine', 0); };
  // height of a character in u (sole to the top of the hair), and of its bust
  const tall = C => C.leg + .2 + C.torso + C.neck + C.ry * 1.9 + C.vol + (C.style === 'bun' ? .55 : 0) + (C.curl ? .3 : 0);
  const bustH = C => 1.3 + C.neck + C.ry * 1.9 + C.vol + (C.style === 'bun' ? .55 : 0) + (C.curl ? .3 : 0);
  const order = ['girl', 'boy', 'mom', 'dad', 'grandma', 'grandpa'];

  for (const who of order) {
    const C = CAST[who];

    // turnaround: the five key views on one floor, with proportion guides and the palette
    LOOPS[who + '_turn'] = t => {
      title(`${C.name}  ·  turnaround`, 'front · 3/4 · side · 3/4 back · back   —   every view faces right; flip to face left');
      const fy = 880, u = 700 / (tall(C) * C.sc), U = u * C.sc;
      const ys = [fy - tall(C) * U, fy - (C.leg + .2 + C.torso) * U, fy - (C.leg + .2) * U, fy - (C.leg / 2 + .2) * U];
      ys.forEach(y => guide(y, 70, W - 70));
      [['front', 'front'], ['q', '3/4'], ['side', 'side'], ['qback', '3/4 back'], ['back', 'back']].forEach(([v, name], i) => {
        const x = 200 + i * 350;
        person(x, fy, u, who, { view: v, face: FACES.neutral, boilKey: who + v });
        label(name, x, fy + 48, 26);
      });
      floor(fy);
      label('head', W - 70, ys[0] - 14, 15, { align: 'right', alpha: .5 });
      label('shoulders', W - 70, ys[1] - 14, 15, { align: 'right', alpha: .5 });
      label('hips', W - 70, ys[2] - 14, 15, { align: 'right', alpha: .5 });
      label('knees', W - 70, ys[3] - 14, 15, { align: 'right', alpha: .5 });
      // palette
      const sw = [['skin', C.skin], ['hair', C.hair], ['eyes', C.eye], ['top', C.top], [C.dress ? 'dress' : 'trousers', C.dress || C.pants], ['shoes', C.shoe]];
      if (C.glasses) sw.push(['glasses', C.glasses]);
      if (C.stripe) sw.push(['stripes', C.stripe]);
      if (C.print) sw.push(['print', C.print]);
      if (C.inner) sw.push(['inner tee', C.inner]);
      sw.forEach(([name, col], i) => {
        const x = 96 + i * 150, y = 1020;
        boilSeed('swatch' + i);
        paint(ellPts(x, y, 26, 22, 18, 1.5), { wash: col, fill: mixCol(col, PAL.ink, .2), fillOp: 60, tex: .6, ink: PAL.ink, sw: .7 });
        label(name, x + 36, y - 6, 17, { align: 'left' });
        label(col.toUpperCase(), x + 36, y + 14, 13, { align: 'left', alpha: .5, font: '13px monospace' });
      });
    };
    LOOPS[who + '_turn'].len = 1;

    // expressions: 2 sheets of 12 busts
    ['a', 'b'].forEach((part, pi) => {
      LOOPS[`${who}_faces_${part}`] = t => {
        title(`${C.name}  ·  expressions ${pi + 1}/2`, 'head and shoulders  —  top row front view, bottom row 3/4 view');
        const names = FACE_ORDER.slice(pi * 12, pi * 12 + 12), cw = W / 6, u = 330 / (bustH(C) * C.sc + 1.1 * C.sc);
        names.forEach((name, i) => {
          const col = i % 6, row = Math.floor(i / 6), x = cw * col + cw / 2, by = 560 + row * 470;
          const F = faceOf(name);
          person(x, by - 30, u, who, { bust: true, view: row ? 'q' : 'front', face: F.face, tilt: F.tilt, emote: F.emote, boilKey: who + name });
          label(name, x, by + 6, 24);
        });
        floor(530); floor(1000);
      };
      LOOPS[`${who}_faces_${part}`].len = 1;
    });

    // poses: 2 sheets of 8
    const posesA = ['stand', 'walk', 'run', 'jump', 'sit', 'wave', 'point', 'cheer'];
    const posesB = ['crossed', 'hips', 'thinking', 'shrug', 'sad', 'scared', 'sneak', 'signature'];
    [posesA, posesB].forEach((list, pi) => {
      LOOPS[`${who}_poses_${'ab'[pi]}`] = t => {
        title(`${C.name}  ·  poses ${pi + 1}/2`, 'body acting: stance, motion, gesture');
        const cw = W / 4, u = 380 / ((tall(C) + 1.6) * C.sc);
        list.forEach((name, i) => {
          const x = cw * (i % 4) + cw / 2, fy = 535 + Math.floor(i / 4) * 470;
          const sig = name === 'signature', o = sig ? SIGNATURE[who].o(C) : POSES[name](C);
          person(x + (o.chair ? 20 : 0), fy, u, who, { ...o, boilKey: who + name });
          label(sig ? SIGNATURE[who].label : name, x, fy + 40, 24);
        });
        floor(535); floor(1005);
      };
      LOOPS[`${who}_poses_${'ab'[pi]}`].len = 1;
    });
  }

  // the whole family, to scale
  LOOPS.lineup = t => {
    title('The family  ·  lineup', 'to scale, left to right as they sit at the table');
    const fy = 905, u = 76, adult = CAST.dad;
    const tops = order.map(w => fy - tall(CAST[w]) * u * CAST[w].sc);
    [Math.min(...tops), fy - (adult.leg + .2 + adult.torso) * u * adult.sc, fy - (adult.leg + .2) * u * adult.sc].forEach(y => guide(y, 70, W - 70));
    order.forEach((w, i) => {
      const x = 175 + i * 314, face = { ...FACES.happy, blush: 0 };
      person(x, fy, u, w, { view: 'front', face, boilKey: 'line' + w });
      label(CAST[w].name, x, fy + 50, 30);
    });
    floor(fy);
  };
  LOOPS.lineup.len = 1;
})();
