(function(){
  'use strict';
  const VERSION='2026-09-08-pvc-authority-1';

  const norm=v=>String(v||'')
    .normalize('NFD').replace(/[\u0300-\u036f]/g,'')
    .toLowerCase()
    .replace(/sovraluce/g,'sopraluce')
    .replace(/taverso|tarverso/g,'traverso')
    .replace(/[^a-z0-9]+/g,' ')
    .trim();

  const text=el=>el ? (el.options?.[el.selectedIndex]?.textContent || el.value || '') : '';

  function isPVC(card){
    const n=norm(text(card?.querySelector('.madre')));
    return n==='pvc' || n.startsWith('pvc ' ) || n.includes(' pvc');
  }

  function pvcCategory(card){
    const tipo=norm(text(card?.querySelector('.tipologia')));
    const serie=norm(text(card?.querySelector('.serie')));

    if(serie.includes('premidoor') || tipo.includes('alzante')) return 'scorrevole alzante';
    if(serie.includes('premislide') || tipo.includes('parallelo')) return 'scorrevole parallelo';
    if(tipo.includes('ribalta') || tipo.includes('traslante')) return 'ribalta e scorri';
    if(tipo.includes('antipanico')) return 'portoncino antipanico';
    if(tipo.includes('spingere') || tipo.includes('apertura esterna')) return 'portoncino a spingere';
    if(tipo.includes('porta finestra') || tipo.includes('portafinestra')) return 'portafinestra';
    if(tipo.includes('portoncino')) return 'portoncino';
    if(tipo.includes('finestra')) return 'finestra';
    return tipo;
  }

  function pvcRows(card){
    if(!isPVC(card)) return [];
    const wanted=pvcCategory(card);
    const serie=norm(text(card?.querySelector('.serie')));
    let rows=(window.PW_ZIP_OPENINGS||[]).filter(r=>norm(r?.madre)==='pvc');

    if(serie){
      rows=rows.filter(r=>!r.serie?.length || r.serie.some(s=>norm(s)===serie));
    }

    if(wanted){
      rows=rows.filter(r=>{
        if(!r.tipologia?.length) return true;
        return r.tipologia.some(t=>{
          const rt=norm(t);
          if(wanted==='portafinestra') return rt==='portafinestra' || rt==='porta finestra con serratura';
          return rt===wanted;
        });
      });
    }

    const out=[];
    const seen=new Set();
    for(const r of rows){
      const k=norm(r.nome);
      if(!k || seen.has(k)) continue;
      seen.add(k);
      out.push(r);
    }
    return out;
  }

  function enforcePVC(card){
    if(!isPVC(card)) return;
    const sel=card?.querySelector('.apertura');
    if(!sel) return;

    const rows=pvcRows(card);
    const old=norm(sel.value || text(sel));
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
      if(norm(r.nome)===old) keep=r.nome;
      frag.appendChild(o);
    }

    sel.replaceChildren(frag);
    sel.value=keep || '';
    delete sel.dataset.openingImage;
    delete card.dataset.pwSummaryOpeningImage;

    if(sel.value){
      const rec=rows.find(r=>norm(r.nome)===norm(sel.value));
      if(rec?.immagine){
        sel.dataset.openingImage=rec.immagine;
        card.dataset.pwSummaryOpeningImage=rec.immagine;
      }
    }
    sel.dataset.pwPvcAuthority=VERSION;
  }

  function schedule(card){
    [0,60,160,350,700,1200].forEach(ms=>setTimeout(()=>enforcePVC(card),ms));
  }

  document.addEventListener('change',e=>{
    const card=e.target?.closest?.('.serramento');
    if(!card || !isPVC(card)) return;
    if(e.target.matches('.madre,.serie,.tipologia,.apertura')) schedule(card);
  },true);

  const obs=new MutationObserver(ms=>{
    const cards=new Set();
    for(const m of ms){
      const n=m.target?.nodeType===1?m.target:m.target?.parentElement;
      const card=n?.closest?.('.serramento');
      if(card && isPVC(card)) cards.add(card);
    }
    cards.forEach(card=>setTimeout(()=>enforcePVC(card),0));
  });

  function init(){
    document.querySelectorAll('.serramento').forEach(card=>{if(isPVC(card)) enforcePVC(card);});
    obs.observe(document.body,{childList:true,subtree:true});
  }

  if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',init,{once:true});
  else init();
  setTimeout(init,500);
  setTimeout(init,1500);
  window.PW_PVC_OPENINGS_AUTHORITY_VERSION=VERSION;
})();
