/* Planet Windows – aggiunta della sola famiglia Genesi. */
(function () {
  'use strict';
  const data = window.PW_GENESI_DATA;
  if (!data || !Array.isArray(data.aperture) || !Array.isArray(window.DATABASE_SERRAMENTI)) return;
  data.madre = 'GENESI';
  data.serie = 'GENESI';
  for (const opening of data.aperture) {
    opening.madre = data.madre;
    opening.serie = [data.serie];
  }
  const isGenesi = card => card?.querySelector('.madre')?.value === data.madre;
  const normalized = value => String(value || '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim();
  const selected = (card, cls) => {
    const el = card?.querySelector('.' + cls);
    return el ? (typeof window.valoreSelect === 'function' ? window.valoreSelect(el) : el.value) : '';
  };
  const rows = card => {
    const serie = selected(card, 'serie');
    const tipo = selected(card, 'tipologia');
    if (serie && serie !== data.serie && serie !== 'ALTRO') return [];
    return data.aperture.filter(row => !tipo || tipo === 'ALTRO' || row.tipologia.includes(tipo));
  };
  const record = (value, card) => rows(card).find(row => normalized(row.nome) === normalized(value)) || null;

  // Existing records keep their values, order and object identity.
  for (const tipo of ['Finestra', 'Porta finestra', 'Portoncino']) {
    if (window.DATABASE_SERRAMENTI.some(row => row.profiloMadre === data.madre && row.serie === data.serie && row.tipologia === tipo)) continue;
    window.DATABASE_SERRAMENTI.push({
      profiloMadre: data.madre, serie: data.serie, tipologia: tipo,
      telaio: data.telai.join(' | '),
      apertura: data.aperture.filter(row => row.tipologia.includes(tipo)).map(row => row.nome).join(' | '),
      coloreInterno: data.colori.map(row => row.nome).join(' | '),
      coloreEsterno: data.colori.map(row => row.nome).join(' | '),
      vetro: 'Vetro standard', ferramenta: ''
    });
  }

  const colors = new Map(data.colori.map(row => [row.nome, row]));
  const loaded = new Map();
  const rendered = new Map();
  function loadImage(src) {
    if (!loaded.has(src)) loaded.set(src, new Promise((resolve, reject) => {
      const img = new Image(); img.onload = () => resolve(img); img.onerror = reject; img.src = src;
    }));
    return loaded.get(src);
  }
  async function renderColor(card) {
    const img = card?.querySelector('.opening-preview-box img');
    const opening = record(selected(card, 'apertura'), card);
    const color = colors.get(selected(card, 'coloreInt'));
    if (!img || !opening) return;
    const token = opening.id + '|' + (color?.nome || '');
    img.dataset.pwGenesiColorToken = token;
    img.dataset.originalSrc = opening.immagine;
    img.alt = opening.nome;
    img.hidden = false;
    const apply = src => {
      if (!isGenesi(card) || img.dataset.pwGenesiColorToken !== token) return;
      delete img.dataset.pwBaseSrc;
      delete img.dataset.pwInternalColorBase;
      if (img.getAttribute('src') !== src) {
        img.src = src;
        if (typeof window.renderNavigator === 'function') window.renderNavigator();
      }
    };
    if (!color) { apply(opening.immagine); return; }
    if (rendered.has(token)) { apply(rendered.get(token)); return; }
    try {
      const [source, mask, texture] = await Promise.all([loadImage(opening.immagine), loadImage(opening.maschera), loadImage(color.immagine)]);
      if (!isGenesi(card) || img.dataset.pwGenesiColorToken !== token) return;
      const canvas = document.createElement('canvas'); canvas.width = source.width; canvas.height = source.height;
      const ctx = canvas.getContext('2d', {willReadFrequently:true}); ctx.drawImage(source, 0, 0);
      const pixels = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const maskCanvas = document.createElement('canvas'); maskCanvas.width = canvas.width; maskCanvas.height = canvas.height;
      const maskCtx = maskCanvas.getContext('2d', {willReadFrequently:true}); maskCtx.drawImage(mask, 0, 0);
      const maskPixels = maskCtx.getImageData(0, 0, canvas.width, canvas.height).data;
      const tc = document.createElement('canvas'); tc.width = texture.width; tc.height = texture.height;
      const tx = tc.getContext('2d', {willReadFrequently:true}); tx.drawImage(texture, 0, 0);
      const texturePixels = tx.getImageData(0, 0, tc.width, tc.height).data;
      for (let q = 0; q < canvas.width * canvas.height; q++) {
        const offset = q * 4;
        if (maskPixels[offset] < 128) continue;
        const x = q % canvas.width, y = Math.floor(q / canvas.width);
        const sample = ((y % tc.height) * tc.width + (x % tc.width)) * 4;
        const shade = Math.max(0.45, Math.min(1.08, (pixels.data[offset] + pixels.data[offset+1] + pixels.data[offset+2]) / 555));
        for (let channel = 0; channel < 3; channel++) pixels.data[offset+channel] = Math.min(255, texturePixels[sample+channel] * shade);
      }
      ctx.putImageData(pixels, 0, 0);
      // Lossless PNG preserves the original glass, hardware and opening symbols.
      const src = canvas.toDataURL('image/png');
      rendered.set(token, src);
      if (rendered.size > 64) rendered.delete(rendered.keys().next().value);
      apply(src);
    } catch (error) { console.warn('[PW] Anteprima Genesi:', error); apply(opening.immagine); }
  }

  function addMother(card) {
    const select = card?.querySelector('.madre');
    if (!select || [...select.options].some(option => option.value === data.madre)) return;
    const option = document.createElement('option'); option.value = data.madre; option.textContent = data.madre;
    select.insertBefore(option, [...select.options].find(option => option.value === 'ALTRO') || null);
  }
  function swatches(card) {
    for (const cls of ['coloreInt', 'coloreEst']) {
      const select = card.querySelector('.' + cls);
      if (!select) continue;
      const color = isGenesi(card) ? colors.get(selected(card, cls)) : null;
      let preview = select.parentElement.querySelector('.pw-genesi-swatch');
      if (!color) { if (preview) { preview.hidden = true; preview.style.display = 'none'; } continue; }
      if (!preview) {
        preview = document.createElement('img'); preview.className = 'pw-genesi-swatch';
        preview.width = 56; preview.height = 30;
        preview.style.cssText = 'display:block;object-fit:cover;border:1px solid #d6d0c6;border-radius:5px;margin-top:6px';
        select.parentElement.appendChild(preview);
      }
      if (preview.getAttribute('src') !== color.immagine) preview.src = color.immagine;
      preview.alt = color.nome; preview.title = color.nome; preview.hidden = false; preview.style.display = 'block';
    }
  }
  function refresh(card) {
    if (!isGenesi(card)) return;
    const sel = card.querySelector('.apertura');
    const opening = record(selected(card, 'apertura'), card);
    if (sel && opening) sel.dataset.openingImage = opening.immagine;
    if (opening) renderColor(card);
    swatches(card);
  }
  function wrap(name, handler) {
    const original = window[name];
    if (typeof original !== 'function') return;
    const wrapped = function (...args) { return handler.call(this, original, args); };
    // Preserve existing module markers so their delayed initialization remains stable.
    Object.assign(wrapped, original);
    window[name] = wrapped;
  }
  function init() {
    if (window.PW_GENESI_VERSION) return;
    // Read older saved quotes that used the mixed-case family and series name.
    for (const name of ['impostaSelect', 'impostaValoreSelect']) {
      wrap(name, function (original, args) {
        if (args[0]?.matches?.('.madre,.serie') && normalized(args[1]) === 'genesi') {
          args[1] = args[0].matches('.madre') ? data.madre : data.serie;
        }
        return original.apply(this, args);
      });
    }
    wrap('availableOpenings', function (original, args) {
      return isGenesi(args[0]) ? rows(args[0]) : original.apply(this, args);
    });
    for (const name of ['openingRecord', 'openingImage', 'fallbackOpeningImage']) {
      wrap(name, function (original, args) {
        if (!isGenesi(args[1])) return original.apply(this, args);
        const found = record(args[0], args[1]);
        return name === 'openingRecord' ? found : found?.immagine || '';
      });
    }
    wrap('applicaColoreAnteprima', function (original, args) {
      return isGenesi(args[0]) ? renderColor(args[0]) : original.apply(this, args);
    });
    document.querySelectorAll('.serramento').forEach(card => { addMother(card); refresh(card); });
    document.addEventListener('change', event => {
      const card = event.target?.closest?.('.serramento');
      if (!card) return;
      if (event.target.matches('.madre,.serie,.tipologia,.apertura,.coloreInt,.coloreEst')) {
        swatches(card);
        if (isGenesi(card)) { refresh(card); setTimeout(() => refresh(card), 350); }
        else { const img = card.querySelector('.opening-preview-box img'); if (img) delete img.dataset.pwGenesiColorToken; }
      }
    });
    const observer = new MutationObserver(mutations => {
      for (const mutation of mutations) for (const node of mutation.addedNodes) {
        if (!(node instanceof Element)) continue;
        if (node.matches('.serramento')) { addMother(node); refresh(node); }
        node.querySelectorAll('.serramento').forEach(card => { addMother(card); refresh(card); });
      }
    });
    observer.observe(document.body, {subtree:true, childList:true});
    window.PW_GENESI_VERSION = data.versione;
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init, {once:true});
  else init();
})();
