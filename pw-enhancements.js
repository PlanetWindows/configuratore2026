(function () {
  'use strict';

  const VERSION = '2026-09-07-glass-and-opening-fix-1';

  // Dimensionamento ricavato dalla tabella Pescini fornita (L 100-6000 mm, H 100-3210 mm).
  // Ogni riga contiene i limiti di fine fascia (numero di celle da 100 mm):
  // [fine giallo, fine rosso, fine azzurro, fine verde]. Il resto e' blu.
  const HEIGHTS = [
    100,200,300,400,500,600,700,800,900,1000,1100,1200,1300,1400,1500,1600,
    1700,1800,1900,2000,2100,2200,2300,2400,2500,2600,2700,2800,2900,3000,3100,3210
  ];
  const BOUNDS = [
    [28,44,49,57],[28,44,49,57],[28,43,49,57],[28,42,49,57],
    [28,41,49,57],[28,41,49,57],[27,40,49,57],[27,40,49,57],
    [27,39,49,57],[27,39,49,57],[27,38,48,56],[23,37,49,56],
    [23,36,48,56],[22,35,47,56],[22,34,46,55],[22,34,45,55],
    [18,33,44,54],[18,33,43,54],[14,32,42,53],[14,32,41,53],
    [14,28,40,52],[14,27,39,52],[13,26,38,51],[12,25,37,51],
    [9,24,36,50],[8,23,35,50],[7,22,34,49],[6,21,33,49],
    [0,20,32,49],[0,19,31,48],[0,18,30,48],[0,18,29,47]
  ];

  const GLASS = [
    { band: 'Giallo', mono: '3/3 - CAMERA - 3/3', doppia: '3/3 - C - 4 - C - 3/3' },
    { band: 'Rosso', mono: '4/4 - CAMERA - 4/4', doppia: '4/4 - C - 4 - C - 4/4' },
    { band: 'Azzurro', mono: '5/5 - MIN. 12 - 5/5', doppia: '5/5 - C - 6 - C - 5/5' },
    { band: 'Verde', mono: '6/6 - MIN. 14 - 6/6', doppia: '6/6 - C - 6 - C - 6/6' },
    { band: 'Blu', mono: '8/8 - MIN. 15 - 8/8', doppia: '8/8 - C - 8 - C - 8/8' }
  ];

  function numberValue(value) {
    const n = Number(String(value == null ? '' : value).replace(',', '.'));
    return Number.isFinite(n) ? n : 0;
  }

  function rowForHeight(height) {
    for (let i = 0; i < HEIGHTS.length; i += 1) {
      if (height <= HEIGHTS[i]) return i;
    }
    return -1;
  }

  function glassSuggestion(width, height) {
    width = numberValue(width);
    height = numberValue(height);
    if (!(width > 0 && height > 0)) return null;
    if (width > 6000 || height > 3210) {
      return {
        outside: true,
        display: 'Fuori campo tabella (max 6000 x 3210 mm): verifica tecnica necessaria.',
        email: 'Fuori campo tabella Pescini (max 6000 x 3210 mm) - verifica tecnica necessaria.'
      };
    }
    const row = rowForHeight(height);
    if (row < 0) return null;
    const col = Math.max(1, Math.ceil(width / 100));
    const [bY, bR, bC, bG] = BOUNDS[row];
    let index = 4;
    if (col <= bY) index = 0;
    else if (col <= bR) index = 1;
    else if (col <= bC) index = 2;
    else if (col <= bG) index = 3;
    const item = GLASS[index];
    return {
      outside: false,
      band: item.band,
      mono: item.mono,
      doppia: item.doppia,
      display: `Monocamera: ${item.mono}  |  Doppiacamera: ${item.doppia}`,
      email: `Monocamera: ${item.mono} | Doppiacamera: ${item.doppia}`
    };
  }

  function suggestionForCard(card) {
    if (!card) return null;
    return glassSuggestion(card.querySelector('.larghezza')?.value, card.querySelector('.altezza')?.value);
  }

  function ensureSuggestion(card) {
    const field = card?.querySelector('.glass-field');
    if (!field) return null;
    let box = field.querySelector('.pw-glass-suggestion');
    if (!box) {
      box = document.createElement('div');
      box.className = 'pw-glass-suggestion';
      box.setAttribute('aria-live', 'polite');
      field.appendChild(box);
    }
    return box;
  }

  function updateSuggestion(card) {
    const box = ensureSuggestion(card);
    if (!box) return;
    const suggestion = suggestionForCard(card);
    if (!suggestion) {
      box.hidden = false;
      box.classList.remove('outside');
      box.innerHTML = '<strong>Suggerimento vetro</strong><span>Inserisci L e H per ottenere il dimensionamento.</span>';
      return;
    }
    box.hidden = false;
    box.classList.toggle('outside', Boolean(suggestion.outside));
    box.innerHTML = `<strong>Suggerimento vetro${suggestion.band ? ` - fascia ${suggestion.band}` : ''}</strong><span>${suggestion.display}</span><small>Indicazione dimensionale: la scelta del vetro resta sempre libera.</small>`;
  }

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

  function installStyle() {
    if (document.getElementById('pw-enhancements-style')) return;
    const style = document.createElement('style');
    style.id = 'pw-enhancements-style';
    style.textContent = `
      .pw-glass-suggestion{margin-top:9px;padding:10px 12px;border:1px solid rgba(155,118,46,.34);border-radius:10px;background:#faf7f0;display:flex;flex-direction:column;gap:4px;line-height:1.35}
      .pw-glass-suggestion strong{color:#8c6825;font-size:12px;letter-spacing:.2px}
      .pw-glass-suggestion span{color:#231f20;font-size:12px;font-weight:600;overflow-wrap:anywhere}
      .pw-glass-suggestion small{color:#777;font-size:10px}
      .pw-glass-suggestion.outside{border-color:#b45858;background:#fff7f7}
      .pw-glass-suggestion.outside strong{color:#9c3d3d}
    `;
    document.head.appendChild(style);
  }

  function suggestionSummary() {
    return [...document.querySelectorAll('.serramento')]
      .map((card, index) => {
        const s = suggestionForCard(card);
        if (!s) return null;
        return `Serramento ${index + 1}: ${s.email}`;
      })
      .filter(Boolean)
      .join('\n');
  }

  function patchDataCollection() {
    if (typeof window.raccogli === 'function' && !window.raccogli.__pwPatched) {
      const original = window.raccogli;
      const patched = function () {
        const data = original();
        if (data?.serramenti) {
          const cards = [...document.querySelectorAll('.serramento')];
          data.serramenti.forEach((item, index) => {
            const s = suggestionForCard(cards[index]);
            item.vetroSuggerito = s?.email || '';
          });
        }
        return data;
      };
      patched.__pwPatched = true;
      window.raccogli = patched;
    }
  }

  function patchEmailPayload() {
    if (typeof window.inviaModuloFormSubmit === 'function' && !window.inviaModuloFormSubmit.__pwPatched) {
      const original = window.inviaModuloFormSubmit;
      const patched = function (payload, target) {
        try {
          const summary = suggestionSummary();
          if (summary && payload instanceof FormData && !payload.has('Suggerimenti vetro')) {
            payload.append('Suggerimenti vetro', summary);
          }
        } catch (error) {
          console.warn('[PW] Inserimento suggerimento vetro in email:', error);
        }
        return original(payload, target);
      };
      patched.__pwPatched = true;
      window.inviaModuloFormSubmit = patched;
    }
  }

  function patchEmailPdf() {
    if (typeof window.creaPaginaRiepilogoEmail === 'function' && !window.creaPaginaRiepilogoEmail.__pwPatched) {
      const original = window.creaPaginaRiepilogoEmail;
      const patched = async function (data, serramenti, indiceIniziale, numeroPagina, totalePagine) {
        const enriched = serramenti.map((item, localIndex) => {
          const globalIndex = indiceIniziale + localIndex;
          const s = data?.serramenti?.[globalIndex]?.vetroSuggerito || item.vetroSuggerito || '';
          if (!s) return item;
          const originalNote = String(item.note || '').trim();
          return { ...item, note: `Suggerimento vetro: ${s}${originalNote ? ` | Note: ${originalNote}` : ''}` };
        });
        return original(data, enriched, indiceIniziale, numeroPagina, totalePagine);
      };
      patched.__pwPatched = true;
      window.creaPaginaRiepilogoEmail = patched;
    }
  }

  function initCard(card) {
    if (!card || card.dataset.pwEnhanced === VERSION) return;
    card.dataset.pwEnhanced = VERSION;
    ensureSuggestion(card);
    updateSuggestion(card);
    forceOpeningPreview(card);
  }

  function initAll() {
    patchOpeningImageResolver();
    patchDataCollection();
    patchEmailPayload();
    patchEmailPdf();
    installStyle();
    document.querySelectorAll('.serramento').forEach(initCard);
  }

  document.addEventListener('input', event => {
    if (event.target?.matches?.('.larghezza, .altezza')) {
      const card = event.target.closest('.serramento');
      updateSuggestion(card);
    }
  });

  document.addEventListener('change', event => {
    if (event.target?.matches?.('.larghezza, .altezza')) {
      updateSuggestion(event.target.closest('.serramento'));
    }
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
  setTimeout(() => document.querySelectorAll('.serramento').forEach(card => {
    updateSuggestion(card);
    forceOpeningPreview(card);
  }), 800);
})();
