/* Para Elixea — social templates (designed at 1080 px, scaled into slots).
   <div data-post="quote" data-size="320"></div>          → 1:1 post
   <div data-story="launch" data-size="300"></div>        → 9:16 story (size = width)
*/
(function () {
  const P = "assets/photos/";
  const H = (f, w, s) => `font-family:var(--f-head);font-weight:${w};font-size:${s}px;`;
  const sym = (c, h) => PE.symbol(c, h);
  const corner = (c) => `<div style="position:absolute;left:80px;top:80px">${sym(c, 64)}</div>`;
  const handle = (c) => `<div style="position:absolute;right:80px;top:96px;${H(0, 500, 22)}letter-spacing:.3em;color:${c};opacity:.8">@PARA.ELIXEA</div>`;

  const POSTS = {
    quote: () => `<div class="bg-creme" style="width:1080px;height:1080px;position:relative">${corner("#1A5F7A")}${handle("#1A5F7A")}
      <div style="position:absolute;left:80px;right:80px;top:330px;${H(0, 300, 92)}line-height:1.08;color:#1A5F7A;letter-spacing:-.02em">Prendre soin<br>de soi est<br><i style="font-style:italic;color:#88B0A8">un rituel.</i></div>
      <div style="position:absolute;left:80px;bottom:80px;${H(0, 500, 22)}letter-spacing:.3em;color:#0F3443;opacity:.6">LE SANCTUAIRE BIEN-ÊTRE</div></div>`,
    archphoto: () => `<div class="bg-sauge" style="width:1080px;height:1080px;position:relative">
      <div class="arch" style="position:absolute;left:270px;top:150px;width:540px;height:800px"><img class="cover-img" src="${P}shelves.jpg"></div>
      <div style="position:absolute;left:80px;bottom:80px;${H(0, 500, 22)}letter-spacing:.3em;color:#0F3443">NOTRE SÉLECTION</div>
      <div style="position:absolute;right:80px;bottom:72px">${sym("#0F3443", 52)}</div></div>`,
    promo: () => `<div class="bg-marine" style="width:1080px;height:1080px;position:relative;overflow:hidden">
      <div data-pattern="leaf" data-c="#fff" data-o=".07" data-size="300" style="position:absolute;inset:0"></div>
      ${corner("#fff")}
      <div style="position:absolute;left:80px;top:300px;${H(0, 500, 26)}letter-spacing:.32em;color:#88B0A8">SEMAINE DERMO-COSMÉTIQUE</div>
      <div style="position:absolute;left:72px;top:360px;${H(0, 300, 300)}line-height:1;color:#fff;letter-spacing:-.04em">-20<span style="font-size:160px">%</span></div>
      <div style="position:absolute;left:80px;top:700px;font-family:var(--f-body);font-size:34px;line-height:1.4;color:#fff;opacity:.85;width:640px">Sur une sélection de soins visage, du 10 au 20 du mois.</div>
      <div style="position:absolute;left:80px;bottom:80px" class="pill c-white">En magasin</div></div>`,
    pattern: () => `<div class="bg-marine" style="width:1080px;height:1080px;position:relative">
      <div data-pattern="leaf" data-c="#88B0A8" data-o=".55" data-size="260" style="position:absolute;inset:0"></div>
      <div style="position:absolute;left:340px;top:340px;width:400px;height:400px;border-radius:50%;background:#F5EFE6;display:flex;align-items:center;justify-content:center">${sym("#1A5F7A", 190)}</div></div>`,
    tip: () => `<div class="bg-beige" style="width:1080px;height:1080px;position:relative">${corner("#0F3443")}
      <div style="position:absolute;right:80px;top:80px;${H(0, 300, 120)}color:#0F3443;opacity:.35;line-height:1">04</div>
      <div style="position:absolute;left:80px;top:330px;${H(0, 500, 26)}letter-spacing:.32em;color:#1A5F7A">LE CONSEIL DE LA SEMAINE</div>
      <div style="position:absolute;left:80px;top:390px;${H(0, 400, 76)}line-height:1.1;color:#0F3443;width:880px">L'hydratation commence de l'intérieur.</div>
      <div style="position:absolute;left:80px;top:640px;font-family:var(--f-body);font-size:32px;line-height:1.45;color:#0F3443;opacity:.8;width:760px">Associez un sérum à l'acide hyaluronique à 1,5 L d'eau par jour. Demandez conseil à notre équipe.</div>
      <div style="position:absolute;left:80px;bottom:80px">${PE.icon("drop", "#1A5F7A", 90, 2)}</div></div>`,
    photo: () => `<div style="width:1080px;height:1080px;position:relative;background:#0F3443">
      <img class="cover-img" src="${P}pharmacist-counter.jpg" style="position:absolute;inset:0;filter:saturate(.75)">
      <div style="position:absolute;inset:0;background:linear-gradient(180deg,rgba(15,52,67,0) 45%,rgba(15,52,67,.85))"></div>
      <div style="position:absolute;left:80px;bottom:150px;${H(0, 400, 64)}line-height:1.1;color:#fff;width:820px">Un conseil expert,<br>à chaque visite.</div>
      <div style="position:absolute;left:80px;bottom:80px;${H(0, 500, 22)}letter-spacing:.3em;color:#88B0A8">NOTRE ÉQUIPE</div>
      <div style="position:absolute;right:80px;bottom:76px">${sym("#fff", 56)}</div></div>`,
    new: () => `<div class="bg-creme" style="width:1080px;height:1080px;position:relative">
      <div class="arch" style="position:absolute;right:80px;bottom:0;width:470px;height:880px"><img class="cover-img" src="${P}customer-shelves.jpg" style="object-position:45% 50%"></div>
      <div style="position:absolute;left:80px;top:80px">${sym("#1A5F7A", 64)}</div>
      <div style="position:absolute;left:80px;top:420px;${H(0, 500, 26)}letter-spacing:.32em;color:#88B0A8">NOUVEAUTÉS</div>
      <div style="position:absolute;left:80px;top:470px;${H(0, 300, 84)}line-height:1.05;color:#1A5F7A">Ce mois-ci<br>en rayon.</div>
      <div style="position:absolute;left:80px;bottom:80px" class="pill c-marine">Découvrir</div></div>`,
    symbol: () => `<div class="bg-sauge" style="width:1080px;height:1080px;position:relative;display:flex;align-items:center;justify-content:center">${sym("#F5EFE6", 420)}</div>`,
    visit: () => `<div class="bg-nuit" style="width:1080px;height:1080px;position:relative">
      <div class="arch" style="position:absolute;left:80px;top:80px;width:420px;height:620px"><img class="cover-img" src="${P}store-arches.jpg" style="object-position:22% 50%"></div>
      <div style="position:absolute;left:560px;top:120px;${H(0, 500, 26)}letter-spacing:.32em;color:#88B0A8">NOUS TROUVER</div>
      <div style="position:absolute;left:560px;top:170px;${H(0, 300, 66)}line-height:1.12;color:#fff">Slimen,<br>Nabeul.</div>
      <div style="position:absolute;left:560px;top:380px;font-family:var(--f-body);font-size:30px;line-height:1.5;color:#fff;opacity:.75;width:440px">Votre sanctuaire bien-être, au cœur du Cap Bon.</div>
      <div style="position:absolute;left:80px;right:80px;bottom:80px;display:flex;justify-content:space-between;align-items:center;border-top:1px solid rgba(255,255,255,.25);padding-top:40px">
        ${PE.lockupH("#fff", 64)}<div style="${H(0, 500, 22)}letter-spacing:.3em;color:#fff;opacity:.7">@PARA.ELIXEA</div></div></div>`,
  };

  const STORIES = {
    launch: () => `<div class="bg-marine" style="width:1080px;height:1920px;position:relative;overflow:hidden">
      <div data-pattern="leaf" data-c="#fff" data-o=".07" data-size="320" style="position:absolute;inset:0"></div>
      <div style="position:absolute;left:0;right:0;top:140px;display:flex;justify-content:center">${PE.lockupV("#fff", 130)}</div>
      <div class="arch" style="position:absolute;left:160px;top:560px;width:760px;height:900px"><img class="cover-img" src="${P}shelves.jpg" style="object-position:50% 40%"></div>
      <div style="position:absolute;left:0;right:0;top:1520px;text-align:center;${H(0, 300, 72)}color:#fff;line-height:1.1">Bienvenue dans<br>votre sanctuaire.</div>
      <div style="position:absolute;left:0;right:0;bottom:110px;display:flex;justify-content:center"><span class="pill c-white" style="font-size:24px;padding:22px 44px">Venez nous voir</span></div></div>`,
    routine: () => `<div class="bg-creme" style="width:1080px;height:1920px;position:relative">
      <div style="position:absolute;left:90px;top:140px">${sym("#1A5F7A", 80)}</div>
      <div style="position:absolute;left:90px;top:360px;${H(0, 500, 28)}letter-spacing:.32em;color:#88B0A8">ROUTINE DU SOIR</div>
      <div style="position:absolute;left:90px;top:420px;${H(0, 300, 104)}line-height:1.04;color:#1A5F7A">3 gestes<br>essentiels.</div>
      ${["Nettoyer", "Traiter", "Hydrater"].map((t, i) => `<div style="position:absolute;left:90px;right:90px;top:${820 + i * 280}px;height:230px;border-radius:999px;background:${["#fff", "#E7EFED", "#F7F2EE"][i]};display:flex;align-items:center;gap:50px;padding:0 70px">
        <div style="${H(0, 300, 90)}color:#88B0A8">0${i + 1}</div><div><div style="${H(0, 500, 46)}color:#0F3443">${t}</div><div style="font-family:var(--f-body);font-size:30px;color:#0F3443;opacity:.7">${["Gel doux sans savon", "Sérum ciblé", "Crème de nuit"][i]}</div></div>
        <div style="margin-left:auto">${PE.icon(["drop", "capsule", "leaf"][i], "#1A5F7A", 90, 2)}</div></div>`).join("")}
      <div style="position:absolute;left:0;right:0;bottom:110px;text-align:center;${H(0, 500, 24)}letter-spacing:.3em;color:#1A5F7A">CONSEILS EN MAGASIN</div></div>`,
  };

  function mount(el, html, w, h, size) {
    const s = size / w;
    el.style.width = size + "px"; el.style.height = h * s + "px"; el.style.overflow = "hidden";
    if (getComputedStyle(el).position === "static") el.style.position = "relative";
    el.innerHTML = `<div style="width:${w}px;height:${h}px;transform:scale(${s});transform-origin:0 0">${html}</div>`;
    PE.render(el);
  }
  function renderPosts(root) {
    (root || document).querySelectorAll("[data-post]").forEach(el => mount(el, POSTS[el.dataset.post](), 1080, 1080, +el.dataset.size || 300));
    (root || document).querySelectorAll("[data-story]").forEach(el => mount(el, STORIES[el.dataset.story](), 1080, 1920, +el.dataset.size || 300));
  }
  window.PEPosts = { POSTS, STORIES, renderPosts };
  document.addEventListener("DOMContentLoaded", () => renderPosts());
})();
