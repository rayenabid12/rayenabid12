const { chromium } = require('playwright');
(async () => { const b = await chromium.launch(); const p = await b.newPage();
 for (const [src,out,w] of JSON.parse(process.argv[2])) {
  const svg = require('fs').readFileSync(src,'utf8');
  const m = svg.match(/viewBox="([\d.\s-]+)"/)[1].split(/\s+/).map(Number); const h = Math.round(w*m[3]/m[2]);
  await p.setViewportSize({width:w,height:h});
  await p.setContent(`<html><body style="margin:0;background:transparent"><img src="data:image/svg+xml;base64,${Buffer.from(svg).toString('base64')}" style="width:${w}px;height:${h}px;display:block"></body></html>`);
  await p.waitForTimeout(100); await p.screenshot({path:out, omitBackground:true}); }
 await b.close(); })();
