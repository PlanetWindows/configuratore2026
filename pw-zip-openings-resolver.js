(function(){
  'use strict';
  const norm=s=>String(s||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().replace(/[^a-z0-9]+/g,' ').trim().replace(/\s+/g,' ');
  function includesNorm(list,value){return !list?.length || list.some(x=>norm(x)===norm(value));}
  function resolve(value,card){
    const all=window.PW_ZIP_OPENINGS||[];
    if(!value||!card||!all.length) return '';
    const madre=card.querySelector('.madre')?.value||'';
    const serie=card.querySelector('.serie')?.value||'';
    const tipologia=card.querySelector('.tipologia')?.value||'';
    const nv=norm(value);
    const matches=all.filter(x=>x.madre===madre && norm(x.nome)===nv && includesNorm(x.serie,serie) && includesNorm(x.tipologia,tipologia));
    return matches.length?matches[matches.length-1].immagine:'';
  }
  window.PW_ZIP_RESOLVE=resolve;
  const originalOpeningImage=typeof window.openingImage==='function'?window.openingImage:null;
  window.openingImage=function(value,card){return resolve(value,card)||(originalOpeningImage?originalOpeningImage(value,card):'');};
  function apply(card){
    if(!card)return;
    const sel=card.querySelector('.apertura'); const visual=card.querySelector('.opening-visual');
    if(!sel||!visual)return;
    const value=typeof window.valoreSelect==='function'?window.valoreSelect(sel):sel.value;
    const image=resolve(value,card); if(!image)return;
    sel.dataset.openingImage=image;
    const img=visual.querySelector('img'); const ph=visual.querySelector('.opening-placeholder');
    if(img){img.src=image;img.alt=value||'';img.hidden=false;} if(ph)ph.hidden=true;
  }
  document.addEventListener('change',e=>{if(e.target?.matches?.('.madre,.serie,.tipologia,.apertura')){const card=e.target.closest('.serramento');setTimeout(()=>apply(card),0);}});
  document.addEventListener('click',e=>{const b=e.target?.closest?.('.opening-library-btn');if(!b)return;const card=b.closest('.serramento');setTimeout(()=>{const modal=document.getElementById('openingModal');if(!modal)return;modal.querySelectorAll('.opening-choice').forEach(btn=>{const val=btn.querySelector('span')?.textContent?.trim()||'';const im=resolve(val,card);const img=btn.querySelector('img');if(im&&img)img.src=im;});},0);});
  const obs=new MutationObserver(ms=>ms.forEach(m=>m.addedNodes.forEach(n=>{if(!(n instanceof Element))return;if(n.matches?.('.serramento'))apply(n);n.querySelectorAll?.('.serramento').forEach(apply);}))); 
  if(document.readyState==='loading'){document.addEventListener('DOMContentLoaded',()=>{document.querySelectorAll('.serramento').forEach(apply);obs.observe(document.body,{childList:true,subtree:true});},{once:true});} else {document.querySelectorAll('.serramento').forEach(apply);obs.observe(document.body,{childList:true,subtree:true});}
  setTimeout(()=>document.querySelectorAll('.serramento').forEach(apply),700);
})();
