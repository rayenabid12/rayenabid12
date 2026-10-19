const fs=require('fs');const {chromium}=require('playwright');
const S=process.argv[2], OUT=process.argv[3];
const P=JSON.parse(fs.readFileSync(S+'/src/parts.json','utf8'));
const mark=P.groups.mark.map(d=>`<path d="${d}"/>`).join('');
const word=P.groups.word.map(d=>`<path d="${d}"/>`).join('');
const desc=P.desc.join('');
const C={navy:'#002B5C',ink:'#0A0F1A',white:'#FFFFFF',graphite:'#333333'};
const r=n=>+n.toFixed(2);
(async()=>{
const b=await chromium.launch();const p=await b.newPage();
await p.setContent(`<svg xmlns="http://www.w3.org/2000/svg" width="900" height="600"><g id="d">${desc}</g></svg>`);
const D=await p.evaluate(()=>{const r=document.getElementById('d').getBBox();return {x:r.x,y:r.y,w:r.width,h:r.height}});
const M=P.mark,W=P.word;
// ---- lockup definitions: return {vb:[w,h], body}
const L={};
// symbol only, pad 0
L['symbol']={vb:[M.w,M.h],body:`<g transform="translate(${-M.x} ${-M.y})">${mark}</g>`};
// primary stacked: original geometry, cropped
{const x0=Math.min(M.x,W.x,D.x),x1=Math.max(M.x+M.w,W.x+W.w,D.x+D.w),y0=M.y,y1=D.y+D.h;
 L['primary-stacked']={vb:[x1-x0,y1-y0],body:`<g transform="translate(${-x0} ${-y0})">${mark}${word}${desc}</g>`};}
// wordmark: name + descriptor, centered (original relative positions)
{const x0=Math.min(W.x,D.x),x1=Math.max(W.x+W.w,D.x+D.w),y0=W.y,y1=D.y+D.h;
 L['wordmark']={vb:[x1-x0,y1-y0],body:`<g transform="translate(${-x0} ${-y0})">${word}${desc}</g>`};}
// name only
L['name']={vb:[W.w,W.h],body:`<g transform="translate(${-W.x} ${-W.y})">${word}</g>`};
// horizontal: mark left, name + descriptor left-aligned on the right
{const s=1.0, gap=M.w*0.22; const textH=W.h+ (D.y-(W.y+W.h)) + D.h; const ws=(M.h*0.26)/W.h; // scale text
 const nameH=W.h*ws, dGap=(D.y-(W.y+W.h))*ws*0.9, dH=D.h*ws, blockH=nameH+dGap+dH;
 const ty=M.h*0.389-blockH/2, tx=M.w+gap;
 const w=tx+Math.max(W.w,D.w)*ws;
 L['horizontal']={vb:[w,M.h],body:`<g transform="translate(${-M.x} ${-M.y})">${mark}</g>
<g transform="translate(${tx} ${ty}) scale(${ws}) translate(${-W.x} ${-W.y})">${word}</g>
<g transform="translate(${tx} ${ty+nameH+dGap}) scale(${ws}) translate(${-D.x} ${-D.y})">${desc}</g>`};}
const files=[];
for(const [name,l] of Object.entries(L)){
 for(const [cn,col] of Object.entries(C)){
  const [w,h]=l.vb;
  const svg=`<?xml version="1.0" encoding="UTF-8"?>
<!-- Ghaith Jenhani — ${name} — ${cn} (${col}). Vector master, do not redraw. -->
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${r(w)} ${r(h)}" width="${r(w)}" height="${r(h)}" fill="${col}">
${l.body}
</svg>
`;
  const f=`gj-${name}-${cn}.svg`;fs.writeFileSync(`${OUT}/logos/svg/${f}`,svg);files.push([f,w,h,cn]);
 }}
// app icon: symbol on navy, square
{const pad=M.h*0.22, side=M.h+pad*2; const ox=(side-M.w)/2;
 for(const [cn,bg,fg] of [['navy','#002B5C','#FFFFFF'],['ink','#0A0F1A','#FFFFFF'],['paper','#F5F2EC','#002B5C']]){
 const svg=`<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${r(side)} ${r(side)}" width="512" height="512"><rect width="${r(side)}" height="${r(side)}" fill="${bg}"/><g fill="${fg}" transform="translate(${r(ox)} ${r(pad)}) translate(${-M.x} ${-M.y})">${mark}</g></svg>
`; const f=`gj-avatar-${cn}.svg`;fs.writeFileSync(`${OUT}/logos/svg/${f}`,svg);files.push([f,side,side,'icon']);}}
// PNG exports
for(const [f,w,h,cn] of files){
 const tw=f.includes('avatar')?1080:2400, th=Math.round(tw*h/w);
 await p.setViewportSize({width:tw,height:th});
 await p.setContent(`<html><body style="margin:0;background:transparent"><img src="data:image/svg+xml;base64,${Buffer.from(fs.readFileSync(`${OUT}/logos/svg/${f}`)).toString('base64')}" style="width:${tw}px;height:${th}px;display:block"></body></html>`);
 await p.screenshot({path:`${OUT}/logos/png/${f.replace('.svg','.png')}`,omitBackground:true});
}
fs.writeFileSync(S+'/src/inline.json',JSON.stringify({mark,word,desc,M,W,D,L:Object.fromEntries(Object.entries(L).map(([k,v])=>[k,{vb:v.vb.map(r),body:v.body}]))}));
console.log(files.length,'files');await b.close();})();
