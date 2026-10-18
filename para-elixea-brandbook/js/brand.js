/* Para Elixea — logo, icon and pattern builders.
   Usage in markup:
     <span data-pe="symbol|h|v|wm" data-h="120" data-c="#1A5F7A"></span>
     <span data-icon="drop" data-s="56" data-c="#1A5F7A"></span>
     <div data-pattern="leaf|arch|line" data-c="#fff" data-o=".14" data-size="140"></div>
*/
(function () {
  // Monogram traced from the original artwork: one constant monoline stroke,
  // round terminals. viewBox height = 550 units, stroke = 42 (≈ 1/13 of height).
  const VB = "22 22 626 550";
  const STROKE = 42;
  const PATHS = [
    "M44,540 V205",                                                             // P — stem
    "M203,46 a159,159 0 1,1 0,318 a159,159 0 1,1 0,-318",                       // P — bowl
    "M614,46 C500,28 330,70 280,230 C234,375 322,548 470,548 C555,548 604,470 618,400", // leaf → e
    "M614,46 C634,180 580,320 388,334",                                         // leaf — lower edge / e bar
    "M522,142 C430,180 330,250 290,330",                                        // leaf — midrib
  ];
  const ASPECT = 626 / 550;

  function symbol(color, h, extra) {
    const w = h * ASPECT;
    return `<svg class="pe" xmlns="http://www.w3.org/2000/svg" viewBox="${VB}" width="${w}" height="${h}" fill="none" stroke="${color}" stroke-width="${STROKE}" stroke-linecap="round" stroke-linejoin="round" ${extra || ""}>${PATHS.map(d => `<path d="${d}"/>`).join("")}</svg>`;
  }
  // only the leaf/e part (pattern + deconstruction)
  function leaf(color, h, sw) {
    return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="240 22 408 550" width="${h * 408 / 550}" height="${h}" fill="none" stroke="${color}" stroke-width="${sw || STROKE}" stroke-linecap="round" stroke-linejoin="round">${PATHS.slice(2).map(d => `<path d="${d}"/>`).join("")}</svg>`;
  }

  function lockupH(color, h, wmColor) {
    // ratios measured from the original lockup: cap height ≈ .42 H, gap ≈ .24 H
    return `<span class="pe-lockup" style="gap:${h * .24}px">${symbol(color, h)}<span class="wm" style="font-size:${h * .6}px;color:${wmColor || color};transform:translateY(${h * .03}px)">Para Elixea</span></span>`;
  }
  function lockupV(color, h, wmColor) {
    return `<span class="pe-stack" style="gap:${h * .2}px">${symbol(color, h)}<span class="wm" style="font-size:${h * .42}px;color:${wmColor || color}">Para Elixea</span></span>`;
  }
  function wordmark(color, h) {
    return `<span class="pe-lockup"><span class="wm" style="font-size:${h}px;color:${color}">Para Elixea</span></span>`;
  }

  // Monoline icon set — same DNA as the symbol: constant stroke, round caps.
  const ICONS = {
    leaf: '<path d="M40 8C26 8 12 16 12 30c0 6 3 10 8 10 14 0 20-16 20-32Z"/><path d="M8 42 28 22"/>',
    drop: '<path d="M24 6C18 15 12 21 12 29a12 12 0 0 0 24 0c0-8-6-14-12-23Z"/><path d="M19 30a5 5 0 0 0 5 5"/>',
    capsule: '<rect x="6" y="17" width="36" height="14" rx="7" transform="rotate(-40 24 24)"/><path d="m19 18 11 12"/>',
    baby: '<path d="M18 6h12M20 6v6M28 6v6"/><path d="M16 16c0-2 2-4 4-4h8c2 0 4 2 4 4v24c0 2-2 2-2 2H18s-2 0-2-2Z"/><path d="M16 24h6M16 31h6"/>',
    chat: '<path d="M8 12c0-2 2-4 4-4h24c2 0 4 2 4 4v16c0 2-2 4-4 4H20l-8 7v-7c-2 0-4-2-4-4Z"/><path d="M17 20h14"/>',
    bag: '<path d="M10 16h28l-2 24H12Z"/><path d="M18 20v-6a6 6 0 0 1 12 0v6"/>',
    calendar: '<rect x="8" y="10" width="32" height="30" rx="4"/><path d="M8 19h32M16 6v8M32 6v8"/><path d="m19 29 4 4 7-8"/>',
    sun: '<circle cx="24" cy="24" r="8"/><path d="M24 5v5M24 38v5M5 24h5M38 24h5M10.5 10.5l3.5 3.5M34 34l3.5 3.5M37.5 10.5 34 14M14 34l-3.5 3.5"/>',
    heart: '<path d="M24 40S8 30 8 18a8 8 0 0 1 16-2 8 8 0 0 1 16 2c0 12-16 22-16 22Z"/>',
    arch: '<path d="M12 42V22a12 12 0 0 1 24 0v20"/><path d="M6 42h36"/>',
    pin: '<path d="M24 42s14-12 14-23a14 14 0 0 0-28 0c0 11 14 23 14 23Z"/><circle cx="24" cy="19" r="5"/>',
    phone: '<path d="M14 6h6l3 9-4 3a22 22 0 0 0 11 11l3-4 9 3v6c0 2-2 4-4 4C21 38 10 27 10 10c0-2 2-4 4-4Z"/>',
    star: '<path d="m24 7 5 11 12 1-9 8 3 12-11-6-11 6 3-12-9-8 12-1Z"/>',
    check: '<path d="m12 25 8 8 16-18"/>',
    cross: '<path d="M14 14l20 20M34 14 14 34"/>',
  };
  function icon(name, color, s, sw) {
    return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" width="${s}" height="${s}" fill="none" stroke="${color}" stroke-width="${sw || 2.4}" stroke-linecap="round" stroke-linejoin="round">${ICONS[name] || ""}</svg>`;
  }

  function enc(svg) { return `url("data:image/svg+xml;utf8,${encodeURIComponent(svg)}")`; }
  function pattern(kind, color, size, opacity) {
    const o = opacity || 1;
    let svg;
    if (kind === "leaf") {
      // the deconstructed "e-leaf", repeated in a half-drop grid
      const lf = PATHS.slice(2).map(d => `<path d="${d}"/>`).join("");
      svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 1000 1000"><g fill="none" stroke="${color}" stroke-opacity="${o}" stroke-width="34" stroke-linecap="round" stroke-linejoin="round">
        <g transform="translate(-60,-10) scale(.62)">${lf}</g><g transform="translate(440,490) scale(.62)">${lf}</g></g></svg>`;
    } else if (kind === "arch") {
      svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size * 1.5}" viewBox="0 0 100 150"><g fill="none" stroke="${color}" stroke-opacity="${o}" stroke-width="1.6">
        <path d="M20 150V60a30 30 0 0 1 60 0v90"/><path d="M32 150V64a18 18 0 0 1 36 0v86"/></g></svg>`;
    } else { // line: continuous monoline waves, from the stroke of the P bowl
      svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size / 2}" viewBox="0 0 200 100"><g fill="none" stroke="${color}" stroke-opacity="${o}" stroke-width="2.2" stroke-linecap="round">
        <path d="M0 50c25 0 25-40 50-40s25 40 50 40 25-40 50-40 25 40 50 40"/><path d="M0 90c25 0 25-40 50-40s25 40 50 40 25-40 50-40 25 40 50 40"/></g></svg>`;
    }
    return enc(svg);
  }

  function render(root) {
    (root || document).querySelectorAll("[data-pe]").forEach(el => {
      const k = el.dataset.pe, h = +el.dataset.h || 100, c = el.dataset.c || "#1A5F7A", w = el.dataset.w;
      el.innerHTML = k === "h" ? lockupH(c, h, w) : k === "v" ? lockupV(c, h, w) : k === "wm" ? wordmark(c, h) : k === "leaf" ? leaf(c, h, +el.dataset.sw) : symbol(c, h);
      el.style.display = el.style.display || "inline-block";
    });
    (root || document).querySelectorAll("[data-icon]").forEach(el => {
      el.innerHTML = icon(el.dataset.icon, el.dataset.c || "#1A5F7A", +el.dataset.s || 48, +el.dataset.sw);
      el.style.display = el.style.display || "inline-block"; el.style.lineHeight = 0;
    });
    (root || document).querySelectorAll("[data-pattern]").forEach(el => {
      el.style.backgroundImage = pattern(el.dataset.pattern, el.dataset.c || "#fff", +el.dataset.size || 160, +el.dataset.o || 1);
      el.style.backgroundRepeat = "repeat";
    });
  }

  window.PE = { symbol, leaf, lockupH, lockupV, wordmark, icon, pattern, render, PATHS, VB, STROKE, ICONS };
  document.addEventListener("DOMContentLoaded", () => render());
})();
