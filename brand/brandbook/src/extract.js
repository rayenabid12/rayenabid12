const fs=require('fs');const {chromium}=require('playwright');
const S=process.argv[2];
const svg=fs.readFileSync(S+'/src/p11.svg','utf8');
const glyphs={};for(const m of svg.matchAll(/<g id="(glyph-0-\d+)">\s*<path d="([^"]+)"/g))glyphs[m[1]]=m[2];
const paths=[...svg.matchAll(/<path fill-rule="nonzero"[^>]* d="([^"]+)"/g)].map(m=>m[1]);
const uses=[...svg.matchAll(/<use xlink:href="#(glyph-0-\d+)" x="([\d.]+)" y="([\d.]+)"/g)].map(m=>({d:glyphs[m[1]],x:+m[2],y:+m[3]}));
const groups={mark:paths.slice(0,6),word:paths.slice(6)};
(async()=>{const b=await chromium.launch();const p=await b.newPage();
const out={};
const html=`<svg xmlns="http://www.w3.org/2000/svg" width="900" height="600">
<g id="mark">${groups.mark.map(d=>`<path d="${d}"/>`).join('')}</g>
<g id="word">${groups.word.map(d=>`<path d="${d}"/>`).join('')}</g>
<g id="desc">${uses.map(u=>`<path transform="translate(${u.x} ${u.y})" d="${u.d}"/>`).join('')}</g></svg>`;
await p.setContent(html);
for(const id of ['mark','word','desc']){out[id]=await p.evaluate(i=>{const r=document.getElementById(i).getBBox();return {x:r.x,y:r.y,w:r.width,h:r.height}},id);}
out.groups=groups;out.desc=uses.map(u=>`<path transform="translate(${u.x.toFixed(3)} ${u.y.toFixed(3)})" d="${u.d}"/>`);
fs.writeFileSync(S+'/src/parts.json',JSON.stringify(out));
console.log(out.mark,out.word,out.desc.length,JSON.stringify(await p.evaluate(()=>document.getElementById('desc').getBBox())));
await b.close();})();
