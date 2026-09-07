/* Planet Windows - SOLO colore anteprime ALLUMINIO. Usa la routine colore originale del configuratore sulle nuove immagini ALLUMINIO. */
(function(){
'use strict';

const norm=s=>String(s||'').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/[^a-z0-9]+/g,' ').trim();

function isAlluminio(card){
  const t=norm(card?.innerText||'');
  return /\balluminio\b|planet 72|planet 82|planet door 72|planet door 82|planet panoramico|planet top slide|top slide|panoramico/.test(t);
}

function getImg(card){
  return card?.querySelector('.opening-visual img, .opening-preview-box img');
}

function colorEl(card){
  return card?.querySelector('.coloreInt,.colore-interno,.coloreInterno,[name*="colore_interno"],[name*="coloreInterno"],[class*="colore"][class*="intern"]');
}

function syncNewAlluminioBase(card){
  const img=getImg(card);
  if(!img)return false;

  // pw-alluminio-only.js salva qui la nuova tavola ZIP corretta.
  const newBase=img.dataset.pwBaseSrc||'';
  if(!newBase)return false;

  // La routine colore originale legge originalSrc: la puntiamo SEMPRE
  // alla nuova immagine ALLUMINIO, così non può tornare alla vecchia beige.
  img.dataset.originalSrc=newBase;
  return true;
}

async function applyOriginalColor(card){
  if(!card||!isAlluminio(card))return;
  const img=getImg(card);
  if(!img||img.hidden)return;
  if(!syncNewAlluminioBase(card))return;

  // Riutilizza la routine nativa del configuratore: è quella già usata per
  // colori RAL/texture e colora telaio + ante + montanti + traversi.
  try{
    if(typeof applicaColoreAnteprima==='function'){
      await applicaColoreAnteprima(card);
    }else if(typeof window.applicaColoreAnteprima==='function'){
      await window.applicaColoreAnteprima(card);
    }
  }catch(e){
    console.warn('PW ALLUMINIO color apply:',e);
  }

  if(typeof window.renderNavigator==='function')window.renderNavigator();
}

// Sul cambio colore interveniamo in capture: prima che la vecchia gestione
// possa leggere originalSrc, lo sostituiamo con la nuova tavola ALLUMINIO.
document.addEventListener('change',e=>{
  const card=e.target?.closest?.('.serramento');
  if(!card||!isAlluminio(card))return;
  if(e.target===colorEl(card)){
    syncNewAlluminioBase(card);
    setTimeout(()=>applyOriginalColor(card),30);
    setTimeout(()=>applyOriginalColor(card),180);
  }
},true);

// Quando cambia apertura, pw-alluminio-only aggiorna prima pwBaseSrc;
// poi riapplichiamo il colore interno già selezionato sulla nuova immagine.
document.addEventListener('change',e=>{
  const card=e.target?.closest?.('.serramento');
  if(!card||!isAlluminio(card))return;
  if(e.target?.matches?.('.apertura')){
    setTimeout(()=>applyOriginalColor(card),120);
    setTimeout(()=>applyOriginalColor(card),260);
  }
},true);

window.pwRecolorAlluminioOnly=applyOriginalColor;
})();
