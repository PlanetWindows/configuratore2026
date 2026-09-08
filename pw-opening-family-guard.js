(function(){
  'use strict';
  const VERSION='2026-09-08-family-guard-1';

  const norm=v=>String(v||'')
    .normalize('NFD').replace(/[\u0300-\u036f]/g,'')
    .toLowerCase()
    .replace(/sovraluce/g,'sopraluce')
    .replace(/taverso|tarverso/g,'traverso')
    .replace(/[^a-z0-9]+/g,' ')
    .trim();

  function selectedText(el){
    if(!el) return '';
    return el.options?.[el.selectedIndex]?.textContent || el.value || '';
  }

  function familyOf(value){
    const n=norm(value);
    if(n.includes('reverii')) return 'REVERII';
    if(n.includes('alluminio')) return 'ALLUMINIO';
    if(n.includes('pvc')) return 'PVC';
    return '';
  }

  function getContext(card){
    const madreEl=card?.querySelector('.madre');
    const serieEl=card?.querySelector('.serie');
    const tipoEl=card?.querySelector('.tipologia');
    return {
      madre: familyOf(selectedText(madreEl)),
      serie: norm(selectedText(serieEl)),
      tipologia: norm(selectedText(tipoEl))
    };
  }

  function belongsToFamily(row, family){
    return familyOf(row?.madre)===family;
  }

  function matchesSeries(row, serie){
    if(!row?.serie?.length || !serie) return true;
    return row.serie.some(s=>norm(s)===serie);
  }

  function matchesType(row, tipologia){
    if(!row?.tipologia?.length || !tipologia) return true;
    return row.tipologia.some(t=>norm(t)===tipologia);
  }

  function rowsFor(card){
    const c=getContext(card);
    if(!c.madre) return [];

    // PRIMA separazione rigida per famiglia madre.
    let rows=(window.PW_ZIP_OPENINGS||[]).filter(r=>belongsToFamily(r,c.madre));

    // Poi restringi a serie e tipologia, senza mai pescare da un'altra famiglia.
    if(c.serie) rows=rows.filter(r=>matchesSeries(r,c.serie));
    if(c.tipologia) rows=rows.filter(r=>matchesType(r,c.tipologia));

    const out=[];
    const seen=new Set();
    for(const r of rows){
      const key=norm(r.nome);
      if(!key || seen.has(key)) continue;
      seen.add(key);
      out.push(r);
    }
    return out;
  }

  function rebuild(card){
    const sel=card?.querySelector('.apertura');
    if(!sel) return;
    const c=getContext(card);
    if(!c.madre) return;

    const rows=rowsFor(card);
    const previous=norm(sel.value || selectedText(sel));

    const frag=document.createDocumentFragment();
    const ph=document.createElement('option');
    ph.value='';
    ph.textContent='Seleziona apertura';
    frag.appendChild(ph);

    let keep='';
    for(const r of rows){
      const o=document.createElement('option');
      o.value=r.nome;
      o.textContent=r.nome;
      if(r.immagine) o.dataset.openingImage=r.immagine;
      if(norm(r.nome)===previous) keep=r.nome;
      frag.appendChild(o);
    }

    sel.replaceChildren(frag);
    sel.value=keep || '';
    sel.dataset.pwFamilyGuard=c.madre;

    delete sel.dataset.openingImage;
    delete card.dataset.pwSummaryOpeningImage;
    if(sel.value){
      const rec=rows.find(r=>r.nome===sel.value);
      if(rec?.immagine){
        sel.dataset.openingImage=rec.immagine;
        card.dataset.pwSummaryOpeningImage=rec.immagine;
      }
    }
  }

  function schedule(card){
    [0,40,100,220,500].forEach(ms=>setTimeout(()=>rebuild(card),ms));
  }

  document.addEventListener('change',e=>{
    const card=e.target?.closest?.('.serramento');
    if(!card) return;
    if(e.target.matches('.madre,.serie,.tipologia')) schedule(card);
    if(e.target.matches('.apertura')){
      const rows=rowsFor(card);
      const sel=e.target;
      delete sel.dataset.openingImage;
      delete card.dataset.pwSummaryOpeningImage;
      const rec=rows.find(r=>norm(r.nome)===norm(sel.value));
      if(rec?.immagine){
        sel.dataset.openingImage=rec.immagine;
        card.dataset.pwSummaryOpeningImage=rec.immagine;
      }
    }
  },true);

  function init(){
    document.querySelectorAll('.serramento').forEach(schedule);
  }

  if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',init,{once:true});
  else init();

  setTimeout(init,500);
  setTimeout(init,1400);
  window.PW_OPENING_FAMILY_GUARD_VERSION=VERSION;
})();
