(function(){
  'use strict';
  const VERSION='2026-09-08-family-authority-2';
  const norm=v=>String(v||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().replace(/sovraluce/g,'sopraluce').replace(/taverso|tarverso/g,'traverso').replace(/[^a-z0-9]+/g,' ').trim();
  const text=el=>el ? (el.options?.[el.selectedIndex]?.textContent || el.value || '') : '';
  const fam=v=>{const n=norm(v);if(n.includes('reverii'))return'REVERII';if(n.includes('alluminio'))return'ALLUMINIO';if(n.includes('pvc'))return'PVC';return'';};

  function ctx(card){
    return {
      madre:fam(text(card?.querySelector('.madre'))),
      serie:norm(text(card?.querySelector('.serie'))),
      tipo:norm(text(card?.querySelector('.tipologia')))
    };
  }

  function tipoCompatibile(rowTipo, selectedTipo, madre){
    const rt=norm(rowTipo);
    const st=norm(selectedTipo);
    if(rt===st) return true;

    // Alias SOLO per ALLUMINIO / Planet Door 72.
    // "Apertura esterna" nel configuratore corrisponde ai disegni del portoncino a spingere.
    if(madre==='ALLUMINIO'){
      const selectedAntipanico=st.includes('antipanico');
      const rowAntipanico=rt.includes('antipanico');
      if(selectedAntipanico && rowAntipanico) return true;

      const selectedEsterna=st.includes('apertura esterna') || st.includes('esterna') || st.includes('a spingere') || st.includes('spingere');
      const rowEsterna=rt.includes('a spingere') || rt.includes('spingere') || rt.includes('apertura esterna') || rt.includes('esterna');
      if(selectedEsterna && rowEsterna) return true;
    }
    return false;
  }

  function rows(card){
    const c=ctx(card);
    if(!c.madre) return [];
    let list=(window.PW_ZIP_OPENINGS||[]).filter(r=>fam(r?.madre)===c.madre);
    if(c.serie) list=list.filter(r=>!r.serie?.length || r.serie.some(s=>norm(s)===c.serie));
    if(c.tipo) list=list.filter(r=>!r.tipologia?.length || r.tipologia.some(t=>tipoCompatibile(t,c.tipo,c.madre)));
    const out=[], seen=new Set();
    for(const r of list){const k=norm(r.nome);if(!k||seen.has(k))continue;seen.add(k);out.push(r);} 
    return out;
  }

  function enforce(card){
    const sel=card?.querySelector('.apertura');
    if(!sel) return;
    const c=ctx(card);
    if(!c.madre) return;
    const list=rows(card);
    const old=norm(sel.value||text(sel));
    const desired=['Seleziona apertura',...list.map(r=>r.nome)];
    const current=[...sel.options].map(o=>o.textContent||'');
    const same=current.length===desired.length && current.every((v,i)=>norm(v)===norm(desired[i]));
    if(!same){
      const frag=document.createDocumentFragment();
      const ph=document.createElement('option');ph.value='';ph.textContent='Seleziona apertura';frag.appendChild(ph);
      let keep='';
      for(const r of list){const o=document.createElement('option');o.value=r.nome;o.textContent=r.nome;if(r.immagine)o.dataset.openingImage=r.immagine;if(norm(r.nome)===old)keep=r.nome;frag.appendChild(o);} 
      sel.replaceChildren(frag);sel.value=keep||'';
    }
    delete sel.dataset.openingImage;delete card.dataset.pwSummaryOpeningImage;
    const rec=list.find(r=>norm(r.nome)===norm(sel.value));
    if(rec?.immagine){sel.dataset.openingImage=rec.immagine;card.dataset.pwSummaryOpeningImage=rec.immagine;}
    sel.dataset.pwFamilyAuthority=c.madre;
  }

  function schedule(card){[0,50,120,250,500,900].forEach(ms=>setTimeout(()=>enforce(card),ms));}
  document.addEventListener('change',e=>{const card=e.target?.closest?.('.serramento');if(!card)return;if(e.target.matches('.madre,.serie,.tipologia,.apertura'))schedule(card);},true);
  const obs=new MutationObserver(ms=>{
    const cards=new Set();
    for(const m of ms){const n=m.target?.nodeType===1?m.target:m.target?.parentElement;const card=n?.closest?.('.serramento');if(card)cards.add(card);}
    cards.forEach(card=>setTimeout(()=>enforce(card),0));
  });
  function init(){document.querySelectorAll('.serramento').forEach(enforce);obs.observe(document.body,{childList:true,subtree:true});}
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init,{once:true});else init();
  setTimeout(()=>document.querySelectorAll('.serramento').forEach(enforce),600);
  setTimeout(()=>document.querySelectorAll('.serramento').forEach(enforce),1600);
  window.PW_OPENING_FAMILY_AUTHORITY_VERSION=VERSION;
})();
