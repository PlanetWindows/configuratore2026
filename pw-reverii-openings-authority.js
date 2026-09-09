(function(){
'use strict';
const VERSION='2026-09-09-reverii-authority-3';
const ASSET_BASE='https://cdn.jsdelivr.net/gh/PlanetWindows/configuratore2026@957b9d1ee15c2ebc49fca0b43f8b9e7448a8bd17/';
const norm=v=>String(v||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().replace(/sovraluce/g,'sopraluce').replace(/taverso|tarverso/g,'traverso').replace(/[^a-z0-9]+/g,' ').trim();
const text=el=>el?(el.options?.[el.selectedIndex]?.textContent||el.value||''):'';
function isReverii(card){return norm(text(card?.querySelector('.madre'))).includes('reverii');}
function cat(card){
 const t=norm(text(card?.querySelector('.tipologia')));
 if(t.includes('antipanico'))return'ANTIPANICO';
 if(t.includes('apertura esterna')||t.includes('spingere'))return'SPINGERE';
 if(t.includes('porta finestra')||t.includes('portafinestra'))return'PORTAFINESTRA';
 if(t.includes('portoncino'))return'INTERNO';
 if(t.includes('finestra'))return'FINESTRA';
 return'';
}
const C={
 FINESTRA:[
 ['1- Fisso','@c4'],['2- Fisso con traverso','2-fisso-con-traverso.webp'],['3- Fisso con piantone','@c5'],['4- Wasistas con cricchetto','4-wasistas-cricchetto.webp'],['5- Wasistas con cremonese','5-wasistas-cremonese.webp'],['6- Finestra 1 anta destra','@c6'],['7- Finestra 1 anta sinistra','@c7'],['8- Finestra 1 anta con sottoluce','8-f1-con-sottoluce.webp'],['9- Finestra 1 anta con sopraluce','9-f1-sovraluce.webp'],['10- Finestra 2 ante con piantone','10-f2-con-piantone.webp'],['11- Finestra 2 ante destra','11-f2-dx.webp'],['12- Finestra 2 ante sinistra','12-f2-sx.webp'],['13- Finestra 2 ante con sottoluce','13-f2-con-sottoluce.webp'],['14- Finestra 2 ante con sopraluce','14-f2-con-sovraluce.webp'],['15- Finestra 3 ante','15-f3.webp'],['16- Finestra 4 ante','16-f4.webp']],
 PORTAFINESTRA:[
 ['17- Portafinestra 1 anta destra','pf-1-anta-dx.webp'],
 ['18- Portafinestra 1 anta sinistra','pf-1-anta-sx.webp'],
 ['19- Portafinestra 1 anta con sopraluce','pf-1-con-sovraluce.webp'],
 ['20- Portafinestra 1 anta con traverso','pf-1-anta-con-traverso.webp'],
 ['23- Portafinestra 2 ante destra','pf-2-ante-dx.webp'],
 ['24- Portafinestra 2 ante sinistra','pf-2-ante-sx.webp'],
 ['25- Portafinestra 2 ante con sopraluce','pf-2-ante-sovraluce.webp'],
 ['26- Portafinestra 2 ante con traverso','pf-2-ante-traverso.webp'],
 ['29- Portafinestra 3 ante','pf-3-ante.webp'],
 ['30- Portafinestra 4 ante','pf-4-ante.webp']],
 INTERNO:[
 ['31- Portoncino interno 1 anta destra','pi-1-anta-dx.webp'],
 ['32- Portoncino interno 1 anta sinistra','pi-1-anta-sx.webp'],
 ['33- Portoncino interno 1 anta con traverso','pi-1-anta-con-traverso.webp'],
 ['34- Portoncino interno 1 anta con fianco luce sinistro','pi-1-anta-con-fiancoluce-a-sx.webp'],
 ['35- Portoncino interno 1 anta con fianco luce destro','pi-1-anta-con-fianco-luce-a-dx.webp'],
 ['36- Portoncino interno 1 anta con sopraluce','pi-1-anta-con-sovraluce.webp'],
 ['37- Portoncino interno 2 ante destra','pi-2-ante-dx.webp'],
 ['38- Portoncino interno 2 ante sinistra','pi-2-ante-sx.webp'],
 ['39- Portoncino interno 2 ante asimmetriche','pi-con-ante-asimmetriche.webp'],
 ['40- Portoncino interno 2 ante con traverso','pi-2-ante-con-traverso.webp'],
 ['41- Portoncino interno 2 ante con sopraluce','pi-2-ante-con-sovraluce.webp']],
 SPINGERE:[
 ['45- Portoncino a spingere 1 anta destra','pe-1-anta-dx.webp'],
 ['46- Portoncino a spingere 1 anta sinistra','pe-1-anta-sx.webp'],
 ['47- Portoncino a spingere 1 anta con traverso','pe-1-anta-con-traverso.webp'],
 ['48- Portoncino a spingere 2 ante destra','pe-2-ante-dx.webp'],
 ['49- Portoncino a spingere 2 ante sinistra','pe-2-ante-sx.webp'],
 ['50- Portoncino a spingere 2 ante asimmetriche','pe-2-ante-asimmetriche.webp'],
 ['51- Portoncino a spingere 2 ante con traverso','pe-2-ante-con-traverso.webp']],
 ANTIPANICO:[
 ['52- Portoncino antipanico 1 anta destra','p-antipanico-1-anta-dx.webp'],
 ['53- Portoncino antipanico 1 anta sinistra','p-antipanico-1-anta-sx.webp'],
 ['54- Portoncino antipanico 1 anta con traverso','pa-1-anta-con-traverso.webp'],
 ['55- Portoncino antipanico 2 ante destra','p-antipanico-2-ante-dx.webp'],
 ['56- Portoncino antipanico 2 ante sinistra','p-antipanico-2-ante-sx.webp'],
 ['57- Portoncino antipanico 2 ante asimmetriche','p-antipanico-2-ante-asimmetriche.webp'],
 ['58- Portoncino antipanico 2 ante con traverso','pa-2-ante-con-traverso.webp']]
};
function src(raw){if(!raw)return'';if(raw.startsWith('@c'))return (window.PW_ZIP_COLLISIONS||{})[raw.slice(1)]||'';if(/^data:|^https?:/i.test(raw))return raw;return ASSET_BASE+raw;}
function rows(card){const k=cat(card);return (C[k]||[]).map(([nome,raw])=>({madre:'REVERII',serie:['Reverii'],tipologia:[k],nome,immagine:src(raw),raw}));}
function resolve(value,card){const q=norm(value);return rows(card).find(r=>norm(r.nome)===q)||null;}
function removeRibaltaScorri(card){
 if(!isReverii(card))return;
 const tipo=card.querySelector('.tipologia');if(!tipo)return;
 let removedSelected=false;
 [...tipo.options].forEach(o=>{const n=norm(o.textContent||o.value);if(n.includes('ribalta')||n.includes('traslante')){if(o.selected)removedSelected=true;o.remove();}});
 if(removedSelected){tipo.value='';const ap=card.querySelector('.apertura');if(ap){ap.replaceChildren(new Option('Seleziona apertura',''));}delete card.dataset.pwSummaryOpeningImage;}
}
function forcePreview(card,rec){const img=card.querySelector('.opening-preview-box img');const ph=card.querySelector('.opening-placeholder');if(rec?.immagine){const u=rec.immagine;card.dataset.pwSummaryOpeningImage=u;const sel=card.querySelector('.apertura');if(sel)sel.dataset.openingImage=u;if(img){img.dataset.originalSrc=u;if(img.src!==u)img.src=u;img.alt=rec.nome;img.hidden=false;}if(ph)ph.hidden=true;}else{delete card.dataset.pwSummaryOpeningImage;const sel=card.querySelector('.apertura');if(sel)delete sel.dataset.openingImage;}}
function patch(){
 const wrap=(name,kind)=>{const old=window[name];if(typeof old!=='function'||old.__pwReveriiV3)return;const fn=function(a,b){const card=kind==='available'?a:b;if(isReverii(card)){if(kind==='available')return rows(card);if(kind==='image')return resolve(a,card)?.immagine||'';return resolve(a,card);}return old.apply(this,arguments);};fn.__pwReveriiV3=true;window[name]=fn;};
 wrap('openingRecord','record');wrap('openingImage','image');wrap('availableOpenings','available');
}
function apply(card){
 if(!isReverii(card))return;removeRibaltaScorri(card);patch();const sel=card.querySelector('.apertura');if(!sel)return;const list=rows(card),old=norm(sel.value||text(sel));const wanted=['Seleziona apertura',...list.map(r=>r.nome)];const now=[...sel.options].map(o=>o.textContent||'');const same=now.length===wanted.length&&now.every((v,i)=>norm(v)===norm(wanted[i]));
 if(!same){const f=document.createDocumentFragment();const ph=document.createElement('option');ph.value='';ph.textContent='Seleziona apertura';f.appendChild(ph);let keep='';for(const r of list){const o=document.createElement('option');o.value=r.nome;o.textContent=r.nome;o.dataset.openingImage=r.immagine;if(norm(r.nome)===old)keep=r.nome;f.appendChild(o);}sel.replaceChildren(f);sel.value=keep||'';}
 forcePreview(card,resolve(sel.value,card));sel.dataset.pwReveriiAuthority=VERSION;
}
function schedule(card){[0,50,120,250,500,900,1500,2400].forEach(ms=>setTimeout(()=>apply(card),ms));}
document.addEventListener('change',e=>{const card=e.target?.closest?.('.serramento');if(!card||!isReverii(card))return;if(e.target.matches('.madre,.serie,.tipologia,.apertura'))schedule(card);},true);
function init(){patch();document.querySelectorAll('.serramento').forEach(c=>{if(isReverii(c))schedule(c);});}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init,{once:true});else init();setTimeout(init,600);setTimeout(init,1600);setInterval(()=>{patch();document.querySelectorAll('.serramento').forEach(c=>{if(isReverii(c))apply(c);});},350);
window.PW_REVERII_OPENINGS_AUTHORITY_VERSION=VERSION;
})();