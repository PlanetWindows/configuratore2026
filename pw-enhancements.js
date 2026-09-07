(function () {
  'use strict';

  const VERSION = '2026-09-07-opening-fix-only-1';

  function correctOpeningImage(value, card) {
    try {
      if (typeof window.fallbackOpeningImage === 'function') {
        const preferred = window.fallbackOpeningImage(value, card);
        if (preferred) return preferred;
      }
      if (typeof window.openingRecord === 'function') {
        return window.openingRecord(value, card)?.immagine || '';
      }
    } catch (error) {
      console.warn('[PW] Correzione immagine apertura:', error);
    }
    return '';
  }

  function forceOpeningPreview(card) {
    if (!card) return;
    const select = card.querySelector('.apertura');
    const visual = card.querySelector('.opening-visual');
    if (!select || !visual) return;
    const value = typeof window.valoreSelect === 'function' ? window.valoreSelect(select) : select.value;
    const image = correctOpeningImage(value, card);
    if (!image) return;
    select.dataset.openingImage = image;
    const img = visual.querySelector('img');
    const placeholder = visual.querySelector('.opening-placeholder');
    if (img) {
      img.src = image;
      img.alt = value || '';
      img.hidden = false;
    }
    if (placeholder) placeholder.hidden = true;
  }

  function patchOpeningImageResolver() {
    if (typeof window.openingImage !== 'function' || window.openingImage.__pwPatched) return;
    const original = window.openingImage;
    const patched = function (value, card) {
      return correctOpeningImage(value, card) || original(value, card);
    };
    patched.__pwPatched = true;
    window.openingImage = patched;
  }

  function patchGallery(card) {
    const modal = document.getElementById('openingModal');
    if (!modal || !card) return;
    modal.querySelectorAll('.opening-choice').forEach(button => {
      const value = button.querySelector('span')?.textContent?.trim() || '';
      const image = correctOpeningImage(value, card);
      const img = button.querySelector('img');
      if (image && img) img.src = image;
    });
  }

  function initCard(card) {
    if (!card || card.dataset.pwEnhanced === VERSION) return;
    card.dataset.pwEnhanced = VERSION;
    forceOpeningPreview(card);
  }

  function initAll() {
    patchOpeningImageResolver();
    document.querySelectorAll('.serramento').forEach(initCard);
  }

  document.addEventListener('change', event => {
    if (event.target?.matches?.('.apertura')) {
      const card = event.target.closest('.serramento');
      setTimeout(() => forceOpeningPreview(card), 0);
    }
  });

  document.addEventListener('click', event => {
    const libraryButton = event.target?.closest?.('.opening-library-btn');
    if (libraryButton) {
      const card = libraryButton.closest('.serramento');
      setTimeout(() => patchGallery(card), 0);
    }
  });

  const observer = new MutationObserver(mutations => {
    mutations.forEach(mutation => mutation.addedNodes.forEach(node => {
      if (!(node instanceof Element)) return;
      if (node.matches?.('.serramento')) initCard(node);
      node.querySelectorAll?.('.serramento').forEach(initCard);
    }));
  });

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      initAll();
      observer.observe(document.body, { childList: true, subtree: true });
    }, { once: true });
  } else {
    initAll();
    observer.observe(document.body, { childList: true, subtree: true });
  }

  setTimeout(initAll, 250);
  setTimeout(() => document.querySelectorAll('.serramento').forEach(forceOpeningPreview), 800);
})();
