(function(){
  'use strict';

  function openingValue(card){
    const select = card?.querySelector('.apertura');
    if(!select) return '';
    try {
      return typeof window.valoreSelect === 'function' ? (window.valoreSelect(select) || '') : (select.value || '');
    } catch(e){
      return select.value || '';
    }
  }

  function setPreviewVisible(card, visible){
    if(!card) return;
    const visual = card.querySelector('.opening-visual');
    if(!visual) return;
    const img = visual.querySelector('img');
    const placeholder = visual.querySelector('.opening-placeholder');

    if(visible){
      visual.hidden = false;
      visual.style.display = '';
      if(img) img.hidden = false;
      if(placeholder) placeholder.hidden = true;
    } else {
      if(img){
        img.hidden = true;
        img.removeAttribute('src');
        img.alt = '';
      }
      if(placeholder) placeholder.hidden = true;
      visual.hidden = true;
      visual.style.display = 'none';
    }
  }

  function resetCard(card){
    if(!card) return;
    card.dataset.pwOpeningExplicit = '0';
    setPreviewVisible(card, false);
  }

  function initCard(card){
    if(!card) return;
    if(card.dataset.pwOpeningExplicit !== '1') resetCard(card);
  }

  function initAll(){
    document.querySelectorAll('.serramento').forEach(initCard);
  }

  document.addEventListener('change', function(event){
    const target = event.target;
    const card = target?.closest?.('.serramento');
    if(!card) return;

    if(target.matches?.('.apertura')){
      const value = openingValue(card).trim();
      if(!value){
        resetCard(card);
        return;
      }
      card.dataset.pwOpeningExplicit = '1';
      setTimeout(function(){
        if(card.dataset.pwOpeningExplicit === '1' && openingValue(card).trim()){
          setPreviewVisible(card, true);
        }
      }, 0);
      return;
    }

    if(target.matches?.('select')){
      const cls = String(target.className || '').toLowerCase();
      const name = String(target.name || '').toLowerCase();
      const id = String(target.id || '').toLowerCase();
      const key = cls + ' ' + name + ' ' + id;
      if(/material|prodot|profil|tipolog|categoria|sistema/.test(key)){
        resetCard(card);
      }
    }
  }, true);

  document.addEventListener('click', function(event){
    const choice = event.target?.closest?.('.opening-choice');
    if(!choice) return;
    const modal = document.getElementById('openingModal');
    const card = document.querySelector('.serramento[data-opening-active="1"]') || document.querySelector('.serramento:focus-within');
    if(!card) return;
    card.dataset.pwOpeningExplicit = '1';
    setTimeout(function(){
      if(openingValue(card).trim()) setPreviewVisible(card, true);
    }, 50);
  }, true);

  const observer = new MutationObserver(function(mutations){
    mutations.forEach(function(mutation){
      mutation.addedNodes.forEach(function(node){
        if(!(node instanceof Element)) return;
        if(node.matches?.('.serramento')) initCard(node);
        node.querySelectorAll?.('.serramento').forEach(initCard);
      });
    });
  });

  if(document.readyState === 'loading'){
    document.addEventListener('DOMContentLoaded', function(){
      initAll();
      observer.observe(document.body,{childList:true,subtree:true});
    }, {once:true});
  } else {
    initAll();
    observer.observe(document.body,{childList:true,subtree:true});
  }

  setTimeout(initAll, 300);
  setTimeout(initAll, 900);
})();
