(function(){
  'use strict';
  const VERSION='2026-09-08-family-guard-2';
  const norm=v=>String(v||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().replace(/sovraluce/g,'sopraluce').replace(/taverso|tarverso/g,'traverso').replace(/[^a-z0-9]+/g,' ').trim();
  function selectedText(el){return el?(el.options?.[el.selectedIndex]?.textContent||el.value||''):'';}
  function familyOf(value){const n=norm(value);if(n.includes('reverii'))return'REVERII';if(n.includes('alluminio'))return'ALLUMINIO';if(n.includes('pvc'))return'PVC';return'';}
  function getContext(card){return {madre:familyOf(selectedText(card?.querySelector('.madre'))),serie:norm(selectedText(card?.querySelector('.serie'))),tipologia:norm(selectedText(card?.querySelector('.tipologia')))};}
  function skip(card){return getContext(card).madre==='PVC';}
  function rowsFor(card){
    const c=getContext(card);if(!c.madre||c.madre==='PVC')return [];
    let rows=(window.PW_ZIP_OPENINGS||[]).filter(r=>familyOf(r?.madre)===c.madre);
    if(c.serie)rows=rows.filter(r=>!r?.serie?.length||r.serie.some(s=>norm(s)===c.serie));
    if(c.tipologia)rows=rows.filter(r=>!r?.tipologia?.length||r.tipologia.some(t=>norm(t)===c.tipologia));
    const out=[],seen=new Set();for(const r of rows){const key=norm(r.nome);if(!key||seen.has(key))continue;seen.add(key);out.push(r);}return out;
  }
  function rebuild(card){
    if(skip(card))return;const sel=card?.querySelector('.apertura');if(!sel)return;const c=getContext(card);if(!c.madre)return;
    const rows=rowsFor(card),previous=norm(sel.value||selectedText(sel)),frag=document.createDocumentFragment();
    const ph=document.createElement('option');ph.value='';ph.textContent='Seleziona apertura';frag.appendChild(ph);let keep='';
    for(const r of rows){const o=document.createElement('option');o.value=r.nome;o.textContent=r.nome;if(r.immagine)o.dataset.openingImage=r.immagine;if(norm(r.nome)===previous)keep=r.nome;frag.appendChild(o);}sel.replaceChildren(frag);sel.value=keep||'';sel.dataset.pwFamilyGuard=c.madre;
    delete sel.dataset.openingImage;delete card.dataset.pwSummaryOpeningImage;if(sel.value){const rec=rows.find(r=>norm(r.nome)===norm(sel.value));if(rec?.immagine){sel.dataset.openingImage=rec.immagine;card.dataset.pwSummaryOpeningImage=rec.immagine;}}
  }
  function schedule(card){if(skip(card))return;[0,40,100,220,500].forEach(ms=>setTimeout(()=>rebuild(card),ms));}
  document.addEventListener('change',e=>{const card=e.target?.closest?.('.serramento');if(!card||skip(card))return;if(e.target.matches('.madre,.serie,.tipologia'))schedule(card);if(e.target.matches('.apertura')){const rows=rowsFor(card),sel=e.target;delete sel.dataset.openingImage;delete card.dataset.pwSummaryOpeningImage;const rec=rows.find(r=>norm(r.nome)===norm(sel.value));if(rec?.immagine){sel.dataset.openingImage=rec.immagine;card.dataset.pwSummaryOpeningImage=rec.immagine;}}},true);
  function init(){document.querySelectorAll('.serramento').forEach(card=>{if(!skip(card))schedule(card);});}
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init,{once:true});else init();setTimeout(init,500);setTimeout(init,1400);window.PW_OPENING_FAMILY_GUARD_VERSION=VERSION;
})();
