(function(){
'use strict';
const VERSION='2026-09-09-reverii-authority-5';
const ASSET_BASE='https://cdn.jsdelivr.net/gh/PlanetWindows/configuratore2026@7bfb4ebeac7babdd96d9f8d69964da8fa7e3bd0e/';
const norm=v=>String(v||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().replace(/sovraluce/g,'sopraluce').replace(/taverso|tarverso/g,'traverso').replace(/[^a-z0-9]+/g,' ').trim();
const text=el=>el?(el.options?.[el.selectedIndex]?.textContent||el.value||''):'';
function isReverii(card){return norm(text(card?.querySelector('.madre'))).includes('reverii');}
function category(card){
 const t=norm(text(card?.querySelector('.tipologia')));
 if(t.includes('antipanico'))return'portoncino antipanico';
 if(t.includes('apertura esterna')||t.includes('spingere'))return'portoncino a spingere';
 if(t.includes('porta finestra')||t.includes('portafinestra'))return'portafinestra';
 if(t.includes('portoncino'))return'portoncino';
 if(t.includes('finestra'))return'finestra';
 return'';
}
function src(raw){
 if(!raw)return'';
 if(/^data:|^https?:/i.test(raw))return raw;
 return ASSET_BASE+String(raw).replace(/^\.\//,'');
}
function rows(card){
 const k=category(card);if(!k)return[];
 const blocked=/(arco|trapezio|traslante|scorrevole)/i;
 return (window.PW_ZIP_OPENINGS||[])
  .filter(r=>norm(r?.madre).includes('reverii'))
  .filter(r=>(Array.isArray(r?.tipologia)?r.tipologia:[r?.tipologia]).some(v=>norm(v)===k))
  .filter(r=>!blocked.test(norm(r?.nome)))
  .map(r=>({...r,immagine:src(r.immagine)}));
}
function resolve(value,card){const q=norm(value);return rows(card).find(r=>norm(r.nome)===q)||null;}
function removeUnsupportedReveriiTypes(card){
 if(!isReverii(card))return;
 const tipo=card.querySelector('.tipologia');if(!tipo)return;
 const blocked=['ribalta','traslante','scorrevole','arco','trapezio'];
 let removedSelected=false;
 [...tipo.options].forEach(o=>{const n=norm(o.textContent||o.value);if(blocked.some(x=>n.includes(x))){if(o.selected)removedSelected=true;o.remove();}});
 if(removedSelected){tipo.value='';const ap=card.querySelector('.apertura');if(ap)ap.replaceChildren(new Option('Seleziona apertura',''));delete card.dataset.pwSummaryOpeningImage;}
}
function forcePreview(card,rec){
 const img=card.querySelector('.opening-preview-box img');const ph=card.querySelector('.opening-placeholder');
 if(rec?.immagine){const u=rec.immagine;card.dataset.pwSummaryOpeningImage=u;const sel=card.querySelector('.apertura');if(sel)sel.dataset.openingImage=u;if(img){img.dataset.originalSrc=u;if(img.src!==u)img.src=u;img.alt=rec.nome;img.hidden=false;}if(ph)ph.hidden=true;}
 else{delete card.dataset.pwSummaryOpeningImage;const sel=card.querySelector('.apertura');if(sel)delete sel.dataset.openingImage;}
}
function patch(){
 const wrap=(name,kind)=>{const old=window[name];if(typeof old!=='function'||old.__pwReveriiV5)return;const fn=function(a,b){const card=kind==='available'?a:b;if(isReverii(card)){if(kind==='available')return rows(card);if(kind==='image')return resolve(a,card)?.immagine||'';return resolve(a,card);}return old.apply(this,arguments);};fn.__pwReveriiV5=true;window[name]=fn;};
 wrap('openingRecord','record');wrap('openingImage','image');wrap('availableOpenings','available');
}
function apply(card){
 if(!isReverii(card))return;removeUnsupportedReveriiTypes(card);patch();
 const sel=card.querySelector('.apertura');if(!sel)return;
 const list=rows(card),old=norm(sel.value||text(sel));const wanted=['Seleziona apertura',...list.map(r=>r.nome)];const now=[...sel.options].map(o=>o.textContent||'');const same=now.length===wanted.length&&now.every((v,i)=>norm(v)===norm(wanted[i]));
 if(!same){const f=document.createDocumentFragment();const ph=document.createElement('option');ph.value='';ph.textContent='Seleziona apertura';f.appendChild(ph);let keep='';for(const r of list){const o=document.createElement('option');o.value=r.nome;o.textContent=r.nome;o.dataset.openingImage=r.immagine;if(norm(r.nome)===old)keep=r.nome;f.appendChild(o);}sel.replaceChildren(f);sel.value=keep||'';}
 forcePreview(card,resolve(sel.value,card));sel.dataset.pwReveriiAuthority=VERSION;
}
function schedule(card){[0,50,120,250,500,900,1500,2400].forEach(ms=>setTimeout(()=>apply(card),ms));}
document.addEventListener('change',e=>{const card=e.target?.closest?.('.serramento');if(!card||!isReverii(card))return;if(e.target.matches('.madre,.serie,.tipologia,.apertura'))schedule(card);},true);
function init(){patch();document.querySelectorAll('.serramento').forEach(c=>{if(isReverii(c))schedule(c);});}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init,{once:true});else init();setTimeout(init,600);setTimeout(init,1600);setInterval(()=>{patch();document.querySelectorAll('.serramento').forEach(c=>{if(isReverii(c))apply(c);});},350);
window.PW_REVERII_OPENINGS_AUTHORITY_VERSION=VERSION;
})();