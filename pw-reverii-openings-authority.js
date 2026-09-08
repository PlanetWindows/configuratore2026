(function(){
'use strict';
const VERSION='2026-09-08-reverii-authority-1';
const ASSET_BASE='https://cdn.jsdelivr.net/gh/PlanetWindows/configuratore2026@957b9d1ee15c2ebc49fca0b43f8b9e7448a8bd17/';
const norm=v=>String(v||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().replace(/sovraluce/g,'sopraluce').replace(/taverso|tarverso/g,'traverso').replace(/[^a-z0-9]+/g,' ').trim();
const text=el=>el?(el.options?.[el.selectedIndex]?.textContent||el.value||''):'';
function isReverii(card){return norm(text(card?.querySelector('.madre'))).includes('reverii');}
function category(card){
 const tipo=norm(text(card?.querySelector('.tipologia')));
 if(tipo.includes('antipanico'))return'ANTIPANICO';
 if(tipo.includes('apertura esterna')||tipo.includes('spingere'))return'SPINGERE';
 if(tipo.includes('ribalta')||tipo.includes('traslante'))return'TRASLANTE';
 if(tipo.includes('porta finestra')||tipo.includes('portafinestra'))return'PORTAFINESTRA';
 if(tipo.includes('portoncino'))return'INTERNO';
 if(tipo.includes('finestra'))return'FINESTRA';
 return'';
}
function belongs(r,cat){
 const n=norm(r.nome);
 switch(cat){
  case'FINESTRA':return n.includes('fisso')||n.includes('wasistas')||n.includes('finestra');
  case'PORTAFINESTRA':return n.includes('portafinestra');
  case'INTERNO':return n.includes('portoncino interno');
  case'ANTIPANICO':return n.includes('portoncino antipanico');
  case'SPINGERE':return n.includes('portoncino a spingere');
  case'TRASLANTE':return n.includes('scorrevole traslante');
  default:return false;
 }
}
function rows(card){
 if(!isReverii(card))return[];
 const cat=category(card);if(!cat)return[];
 const list=(window.PW_ZIP_OPENINGS||[]).filter(r=>norm(r?.madre)==='reverii'&&belongs(r,cat));
 const out=[],seen=new Set();
 for(const r of list){const k=norm(r.nome);if(!k||seen.has(k))continue;seen.add(k);out.push(r);}
 return out;
}
function imageSrc(raw){if(!raw)return'';if(raw.startsWith('data:')||/^https?:/i.test(raw))return raw;return ASSET_BASE+raw.replace(/^\.\//,'');}
function resolve(value,card){if(!isReverii(card))return null;const q=norm(value);const rec=rows(card).find(r=>norm(r.nome)===q)||null;return rec?Object.assign({},rec,{immagine:imageSrc(rec.immagine)}):null;}
function patchResolvers(){
 if(typeof window.openingRecord==='function'&&!window.openingRecord.__pwReverii){const prev=window.openingRecord;const fn=function(value,card=null){if(isReverii(card))return resolve(value,card);return prev.apply(this,arguments);};fn.__pwReverii=true;window.openingRecord=fn;}
 if(typeof window.openingImage==='function'&&!window.openingImage.__pwReverii){const prev=window.openingImage;const fn=function(value,card=null){if(isReverii(card))return resolve(value,card)?.immagine||'';return prev.apply(this,arguments);};fn.__pwReverii=true;window.openingImage=fn;}
 if(typeof window.availableOpenings==='function'&&!window.availableOpenings.__pwReverii){const prev=window.availableOpenings;const fn=function(card){if(isReverii(card))return rows(card).map(r=>Object.assign({},r,{immagine:imageSrc(r.immagine)}));return prev.apply(this,arguments);};fn.__pwReverii=true;window.availableOpenings=fn;}
}
function apply(card){
 if(!isReverii(card))return;patchResolvers();
 const sel=card.querySelector('.apertura');if(!sel)return;
 const list=rows(card),old=norm(sel.value||text(sel));
 const desired=['Seleziona apertura',...list.map(r=>r.nome)],current=[...sel.options].map(o=>o.textContent||'');
 const same=current.length===desired.length&&current.every((v,i)=>norm(v)===norm(desired[i]));
 if(!same){
  const frag=document.createDocumentFragment();const ph=document.createElement('option');ph.value='';ph.textContent='Seleziona apertura';frag.appendChild(ph);let keep='';
  for(const r of list){const o=document.createElement('option');o.value=r.nome;o.textContent=r.nome;const src=imageSrc(r.immagine);if(src)o.dataset.openingImage=src;if(norm(r.nome)===old)keep=r.nome;frag.appendChild(o);}sel.replaceChildren(frag);sel.value=keep||'';
 }
 const rec=resolve(sel.value,card),src=rec?.immagine||'';
 if(src){sel.dataset.openingImage=src;card.dataset.pwSummaryOpeningImage=src;const img=card.querySelector('.opening-preview-box img');if(img){img.dataset.originalSrc=src;img.src=src;img.hidden=false;}}
 else{delete sel.dataset.openingImage;delete card.dataset.pwSummaryOpeningImage;}
 sel.dataset.pwReveriiAuthority=VERSION;
}
function schedule(card){[0,80,200,450,900,1500,2200].forEach(ms=>setTimeout(()=>apply(card),ms));}
document.addEventListener('change',e=>{const card=e.target?.closest?.('.serramento');if(!card||!isReverii(card))return;if(e.target.matches('.madre,.serie,.tipologia,.apertura'))schedule(card);},true);
function init(){patchResolvers();document.querySelectorAll('.serramento').forEach(c=>{if(isReverii(c))schedule(c);});}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init,{once:true});else init();setTimeout(init,700);setTimeout(init,1800);
setInterval(()=>{patchResolvers();document.querySelectorAll('.serramento').forEach(c=>{if(isReverii(c))apply(c);});},300);
window.PW_REVERII_OPENINGS_AUTHORITY_VERSION=VERSION;
})();
