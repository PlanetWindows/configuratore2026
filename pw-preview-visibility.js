(function(){
  'use strict';

  // L'immagine del senso di apertura non deve comparire durante la configurazione.
  // La descrizione testuale e tutti i menu restano invariati.
  function hideConfigurationOpeningPreview(card){
    if(!card) return;
    const visual = card.querySelector('.opening-visual');
    if(!visual) return;
    visual.hidden = true;
    visual.style.display = 'none';
    visual.setAttribute('aria-hidden','true');
  }

  function hideAll(){
    document.querySelectorAll('.serramento').forEach(hideConfigurationOpeningPreview);
  }

  document.addEventListener('change', function(event){
    const card = event.target?.closest?.('.serramento');
    if(!card) return;
    hideConfigurationOpeningPreview(card);
    setTimeout(function(){ hideConfigurationOpeningPreview(card); },0);
    setTimeout(function(){ hideConfigurationOpeningPreview(card); },100);
  }, true);

  const observer = new MutationObserver(function(){
    hideAll();
  });

  if(document.readyState === 'loading'){
    document.addEventListener('DOMContentLoaded', function(){
      hideAll();
      observer.observe(document.body,{childList:true,subtree:true});
    }, {once:true});
  } else {
    hideAll();
    observer.observe(document.body,{childList:true,subtree:true});
  }

  setTimeout(hideAll,300);
  setTimeout(hideAll,900);
})();
