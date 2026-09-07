(function () {
  'use strict';

  const VERSION = '2026-09-07-family-opening-map-2';

  const normalize = value => String(value || '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, ' ')
    .trim();

  function currentFamily(card) {
    return String(card?.querySelector('.madre')?.value || '').trim().toUpperCase();
  }

  function currentType(card) {
    return normalize(card?.querySelector('.tipologia')?.value || '');
  }

  function isUnavailableAlluminioPortafinestra(label) {
    const n = normalize(label);
    return /telaio inferiore|serratura|trapezio|arco|ribassat/.test(n);
  }

  function pruneUnavailableOpenings(card) {
    if (!card) return;
    if (currentFamily(card) !== 'ALLUMINIO' || currentType(card) !== 'portafinestra') return;
    const select = card.querySelector('.apertura');
    if (!select) return;
    [...select.options].forEach(option => {
      const label = option.textContent || option.value || '';
      if (isUnavailableAlluminioPortafinestra(label)) option.remove();
    });
  }

  function correctOpeningImage(value, card) {
    try {
      // Prima scelta: record già filtrato per madre/serie/tipologia.
      // In questo modo PVC, REVERII e ALLUMINIO non possono condividere
      // accidentalmente l'immagine di un'altra famiglia.
      if (typeof window.openingRecord === 'function') {
        const record = window.openingRecord(value, card);
        if (record?.immagine) return record.immagine;
      }
      // Solo come fallback, se il record della famiglia non esiste.
      if (typeof window.fallbackOpeningImage === 'function') {
        const fallback = window.fallbackOpeningImage(value, card);
        if (fallback) return fallback;
      }
    } catch (error) {
      console.warn('[PW] Correzione immagine apertura:', error);
    }
    return '';
  }

  function forceOpeningPreview(card) {
    if (!card) return;
    pruneUnavailableOpenings(card);
    const select = card.querySelector('.apertura');
    const visual = card.querySelector('.opening-visual');
    if (!select || !visual) return;
    const value = typeof window.valoreSelect === 'function' ? window.valoreSelect(select) : select.value;
    if (!value) return;
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
    if (typeof window.openingImage !== 'function' || window.openingImage.__pwFamilyPatched) return;
    const original = window.openingImage;
    const patched = function (value, card) {
      return correctOpeningImage(value, card) || original(value, card);
    };
    patched.__pwFamilyPatched = true;
    window.openingImage = patched;
  }

  function patchGallery(card) {
    const modal = document.getElementById('openingModal');
    if (!modal || !card) return;
    const allPf = currentFamily(card) === 'ALLUMINIO' && currentType(card) === 'portafinestra';
    modal.querySelectorAll('.opening-choice').forEach(button => {
      const value = button.querySelector('span')?.textContent?.trim() || '';
      if (allPf && isUnavailableAlluminioPortafinestra(value)) {
        button.hidden = true;
        button.style.display = 'none';
        return;
      }
      const image = correctOpeningImage(value, card);
      const img = button.querySelector('img');
      if (image && img) img.src = image;
    });
  }

  function initCard(card) {
    if (!card) return;
    pruneUnavailableOpenings(card);
    card.dataset.pwEnhanced = VERSION;
    forceOpeningPreview(card);
  }

  function initAll() {
    patchOpeningImageResolver();
    document.querySelectorAll('.serramento').forEach(initCard);
  }

  document.addEventListener('change', event => {
    const card = event.target?.closest?.('.serramento');
    if (!card) return;
    if (event.target?.matches?.('.madre,.serie,.tipologia')) {
      setTimeout(() => {
        pruneUnavailableOpenings(card);
        forceOpeningPreview(card);
      }, 30);
    }
    if (event.target?.matches?.('.apertura')) {
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
  setTimeout(() => document.querySelectorAll('.serramento').forEach(initCard), 800);
})();
