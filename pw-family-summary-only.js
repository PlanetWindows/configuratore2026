(function(){
  'use strict';
  const VERSION='2026-09-08-summary-family-3';
  const ASSET_BASE='https://cdn.jsdelivr.net/gh/PlanetWindows/configuratore2026@957b9d1ee15c2ebc49fca0b43f8b9e7448a8bd17/';
  const norm=v=>String(v||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().replace(/sovraluce/g,'sopraluce').replace(/taverso|tarverso/g,'traverso').replace(/[^a-z0-9]+/g,' ').trim();
  function canonicalFamily(value){const n=norm(value);if(n==='pvc'||n.startsWith('pvc '))return'pvc';if(n==='reverii'||n.includes('reverii'))return'reverii';if(n==='alluminio'||n.includes('alluminio'))return'alluminio';return'';}
  function val(card,sel){const el=card?.querySelector(sel);if(!el)return'';try{return typeof window.valoreSelect==='function'?(window.valoreSelect(el)||el.value||''):(el.value||'')}catch(_){return el.value||''}}
  function familyContext(card){return {madre:canonicalFamily(val(card,'.madre')),serie:norm(val(card,'.serie')),tipologia:norm(val(card,'.tipologia'))};}
  function isPVC(card){return familyContext(card).madre==='pvc';}
  function matchRecord(value,card){if(!card||isPVC(card))return null;const c=familyContext(card);if(!c.madre)return null;const q=norm(value);if(!q)return null;const rows=(window.PW_ZIP_OPENINGS||[]).filter(r=>{if(canonicalFamily(r.madre)!==c.madre)return false;if(r.serie?.length&&c.serie&&!r.serie.some(s=>norm(s)===c.serie))return false;if(r.tipologia?.length&&c.tipologia&&!r.tipologia.some(t=>norm(t)===c.tipologia))return false;return true;});return rows.find(r=>norm(r.nome)===q)||null;}
  function imageFor(value,card){const rec=matchRecord(value,card);const src=rec?.immagine||'';if(!src)return'';if(src.startsWith('data:')||/^https?:/i.test(src))return src;return ASSET_BASE+src.replace(/^\.\//,'');}
  function clearCard(card){if(!card||isPVC(card))return;const sel=card.querySelector('.apertura');if(sel)delete sel.dataset.openingImage;delete card.dataset.pwSummaryOpeningImage;}
  function storeOnCard(card){if(!card||isPVC(card))return;clearCard(card);const sel=card.querySelector('.apertura');if(!sel)return;const src=imageFor(val(card,'.apertura'),card);if(!src)return;sel.dataset.openingImage=src;card.dataset.pwSummaryOpeningImage=src;}
  function patchOpeningImage(){const original=window.openingImage;if(typeof original!=='function'||original.__pwSummaryFamilyPatched)return;const patched=function(value,card){const family=familyContext(card).madre;if(family==='pvc'){
        // PVC è gestito esclusivamente da pw-pvc-openings-authority.js.
        // Non ricalcolare l'immagine da cataloghi condivisi: usa solo quella già assegnata al PVC.
        const sel=card?.querySelector?.('.apertura');
        return card?.dataset?.pwSummaryOpeningImage || sel?.dataset?.openingImage || '';
      }
      if(family==='reverii'||family==='alluminio')return imageFor(value,card)||'';
      return original.apply(this,arguments);};patched.__pwSummaryFamilyPatched=true;window.openingImage=patched;}
  function refreshCard(card){patchOpeningImage();if(!isPVC(card))storeOnCard(card);}
  function init(){patchOpeningImage();document.querySelectorAll('.serramento').forEach(card=>{if(!isPVC(card))storeOnCard(card);});}
  document.addEventListener('change',e=>{if(!e.target?.matches?.('.madre,.serie,.tipologia,.apertura'))return;const card=e.target.closest('.serramento');if(!card||isPVC(card))return;clearCard(card);[0,60,140,300].forEach(ms=>setTimeout(()=>refreshCard(card),ms));},true);
  const obs=new MutationObserver(()=>init());
  if(document.readyState==='loading'){document.addEventListener('DOMContentLoaded',()=>{init();obs.observe(document.body,{childList:true,subtree:true})},{once:true});}else{init();obs.observe(document.body,{childList:true,subtree:true});}
  setTimeout(init,400);setTimeout(init,1200);window.PW_FAMILY_SUMMARY_VERSION=VERSION;
})();