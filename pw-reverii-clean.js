(function(){
'use strict';
const VERSION='2026-11-24-reverii-clean-2';
const ASSET_BASE='https://cdn.jsdelivr.net/gh/PlanetWindows/configuratore2026@957b9d1ee15c2ebc49fca0b43f8b9e7448a8bd17/';
const norm=v=>String(v||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().replace(/sovraluce/g,'sopraluce').replace(/taverso|tarverso/g,'traverso').replace(/[^a-z0-9]+/g,' ').trim();
const text=el=>el?(el.options?.[el.selectedIndex]?.textContent||el.value||''):'';
const BLOCKED=['ribalta','arco','trapezio','traslante','scorrevole'];

const DATA={
 finestra:[
  ['1- Fisso','assets/aperture/reverii/01.png'],
  ['2- Fisso con traverso','assets/aperture/reverii/02.png'],
  ['3- Fisso con piantone','assets/aperture/reverii/03.png'],
  ['4- Wasistas con cricchetto','assets/aperture/reverii/04.png'],
  ['5- Wasistas con cremonese','assets/aperture/reverii/05.png'],
  ['6- Finestra 1 anta destra','assets/aperture/reverii/06.png'],
  ['7- Finestra 1 anta sinistra','assets/aperture/reverii/07.png'],
  ['8- Finestra 1 anta con sottoluce','assets/aperture/reverii/08.png'],
  ['9- Finestra 1 anta con sopraluce','assets/aperture/reverii/09.png'],
  ['10- Finestra 2 ante con piantone','assets/aperture/reverii/10.png'],
  ['11- Finestra 2 ante destra','assets/aperture/reverii/11.png'],
  ['12- Finestra 2 ante sinistra','assets/aperture/reverii/12.png'],
  ['13- Finestra 2 ante con sottoluce','assets/aperture/reverii/13.png'],
  ['14- Finestra 2 ante con sopraluce','assets/aperture/reverii/14.png'],
  ['15- Finestra 3 ante','assets/aperture/reverii/15.png'],
  ['16- Finestra 4 ante','assets/aperture/reverii/16.png']
 ],
 portafinestra:[
  ['17- Portafinestra 1 anta destra','assets/aperture/reverii/17.png'],
  ['18- Portafinestra 1 anta sinistra','assets/aperture/reverii/18.png'],
  ['19- Portafinestra 1 anta con sopraluce','assets/aperture/reverii/19.png'],
  ['20- Portafinestra 1 anta con traverso','assets/aperture/reverii/20.png'],
  ['21- Portafinestra 1 anta con telaio inferiore','assets/aperture/reverii/21.png'],
  ['22- Portafinestra 1 anta con serratura','assets/aperture/reverii/22.png'],
  ['23- Portafinestra 2 ante destra','assets/aperture/reverii/23.png'],
  ['24- Portafinestra 2 ante sinistra','assets/aperture/reverii/24.png'],
  ['25- Portafinestra 2 ante con sopraluce','assets/aperture/reverii/25.png'],
  ['26- Portafinestra 2 ante con traverso','assets/aperture/reverii/26.png'],
  ['27- Portafinestra 2 ante con telaio inferiore','assets/aperture/reverii/27.png'],
  ['28- Portafinestra 2 ante con serratura','assets/aperture/reverii/28.png'],
  ['29- Portafinestra 3 ante','assets/aperture/reverii/29.png'],
  ['30- Portafinestra 4 ante','assets/aperture/reverii/30.png']
 ],
 portoncino:[
  ['31- Portoncino interno 1 anta destra','assets/aperture/reverii/31.png'],
  ['32- Portoncino interno 1 anta sinistra','assets/aperture/reverii/32.png'],
  ['33- Portoncino interno 1 anta con traverso','assets/aperture/reverii/33.png'],
  ['34- Portoncino interno 1 anta con fianco luce sinistro','assets/aperture/reverii/34.png'],
  ['35- Portoncino interno 1 anta con fianco luce destro','assets/aperture/reverii/35.png'],
  ['36- Portoncino interno 1 anta con sopraluce','assets/aperture/reverii/36.png'],
  ['37- Portoncino interno 2 ante destra','assets/aperture/reverii/37.png'],
  ['38- Portoncino interno 2 ante sinistra','assets/aperture/reverii/38.png'],
  ['39- Portoncino interno 2 ante asimmetriche','assets/aperture/reverii/39.png'],
  ['40- Portoncino interno 2 ante con traverso','assets/aperture/reverii/40.png'],
  ['41- Portoncino interno 2 ante con sopraluce','assets/aperture/reverii/41.png']
 ],
 'portoncino a spingere':[
  ['45- Portoncino a spingere 1 anta destra','assets/aperture/reverii/45.png'],
  ['46- Portoncino a spingere 1 anta sinistra','assets/aperture/reverii/46.png'],
  ['47- Portoncino a spingere 1 anta con traverso','assets/aperture/reverii/47.png'],
  ['48- Portoncino a spingere 2 ante destra','assets/aperture/reverii/48.png'],
  ['49- Portoncino a spingere 2 ante sinistra','assets/aperture/reverii/49.png'],
  ['50- Portoncino a spingere 2 ante asimmetriche','assets/aperture/reverii/50.png'],
  ['51- Portoncino a spingere 2 ante con traverso','assets/aperture/reverii/51.png']
 ],
 'portoncino antipanico':[
  ['52- Portoncino antipanico 1 anta destra','assets/aperture/reverii/52.png'],
  ['53- Portoncino antipanico 1 anta sinistra','assets/aperture/reverii/53.png'],
  ['54- Portoncino antipanico 1 anta con traverso','assets/aperture/reverii/54.png'],
  ['55- Portoncino antipanico 2 ante destra','assets/aperture/reverii/55.png'],
  ['56- Portoncino antipanico 2 ante sinistra','assets/aperture/reverii/56.png'],
  ['57- Portoncino antipanico 2 ante asimmetriche','assets/aperture/reverii/57.png'],
  ['58- Portoncino antipanico 2 ante con traverso','assets/aperture/reverii/58.png']
 ]
};

function isReverii(card){return norm(text(card?.querySelector('.madre'))).includes('reverii');}
function branchFromText(value){
 const t=norm(value);
 if(BLOCKED.some(x=>t.includes(x)))return'';
 if(t.includes('antipanico'))return'portoncino antipanico';
 if(t.includes('apertura esterna')||t.includes('spingere'))return'portoncino a spingere';
 if(t.includes('porta finestra')||t.includes('portafinestra'))return'portafinestra';
 if(t.includes('portoncino'))return'portoncino';
 if(t.includes('finestra'))return'finestra';
 return'';
}
function branch(card){return branchFromText(text(card?.querySelector('.tipologia')));}
function imageSrc(raw){
 if(!raw)return'';
 if(raw.startsWith('assets/aperture/reverii/'))return new URL(raw,document.baseURI).href;
 if(raw.startsWith('@c'))return (window.PW_ZIP_COLLISIONS||{})[raw.slice(1)]||'';
 if(/^data:|^https?:/i.test(raw))return raw;
 return ASSET_BASE+raw;
}
function records(card){
 const key=branch(card);if(!key)return[];
 return (DATA[key]||[]).map(([nome,raw])=>({madre:'REVERII',serie:['Reverii'],tipologia:[key],nome,immagine:imageSrc(raw),raw}));
}
function resolve(value,card){const q=norm(value);return records(card).find(r=>norm(r.nome)===q)||null;}

window.pwReveriiOpeningImage=(value,card)=>isReverii(card)?resolve(value,card)?.immagine||'':null;

function cleanTipologie(card){
 if(!isReverii(card))return;
 const tipo=card.querySelector('.tipologia');if(!tipo)return;
 const selected=tipo.value;
 const selectedText=text(tipo);
 const options=[...tipo.options];
 const placeholder=options.find(o=>!String(o.value||'').trim()||norm(o.textContent).includes('seleziona'));
 const byBranch=new Map();
 for(const o of options){
  const key=branchFromText(o.textContent||o.value);
  if(key&&!byBranch.has(key))byBranch.set(key,o);
 }
 const order=['finestra','portafinestra','portoncino','portoncino a spingere','portoncino antipanico'];
 const f=document.createDocumentFragment();
 if(placeholder)f.appendChild(placeholder);else f.appendChild(new Option('Seleziona tipologia',''));
 for(const key of order){const o=byBranch.get(key);if(o)f.appendChild(o);}
 tipo.replaceChildren(f);
 const oldKey=branchFromText(selectedText);
 const keep=[...tipo.options].find(o=>branchFromText(o.textContent||o.value)===oldKey&&oldKey);
 if(keep)tipo.value=keep.value;else if([...tipo.options].some(o=>o.value===selected))tipo.value=selected;else tipo.value='';
}

function setPreview(card,rec){
 const sel=card.querySelector('.apertura');
 const img=card.querySelector('.opening-preview-box img');
 const ph=card.querySelector('.opening-placeholder');
 const visual=img?.closest('.opening-visual');
 const showNew=Boolean(rec?.raw.startsWith('assets/aperture/reverii/'));
 visual?.toggleAttribute('data-reverii-opening-image',showNew);
 if(showNew&&visual){
  visual.hidden=false;
  visual.removeAttribute('aria-hidden');
 }
 if(rec&&rec.immagine){
  const u=rec.immagine;
  card.dataset.pwSummaryOpeningImage=u;
  if(sel)sel.dataset.openingImage=u;
  if(img){
   const changed=img.src!==u||img.hidden;
   img.dataset.originalSrc=u;
   if(changed)img.src=u;
   img.alt=rec.nome;
   img.hidden=false;
   if(changed&&showNew)window.renderNavigator?.();
  }
  if(ph)ph.hidden=true;
 }else{
  delete card.dataset.pwSummaryOpeningImage;
  if(sel)delete sel.dataset.openingImage;
  if(img){img.removeAttribute('src');img.hidden=true;}
  if(ph)ph.hidden=false;
 }
}

function fillAperture(card){
 const sel=card.querySelector('.apertura');if(!sel)return;
 const list=records(card);
 const old=norm(sel.value||text(sel));
 const f=document.createDocumentFragment();
 f.appendChild(new Option('Seleziona apertura',''));
 let keep='';
 for(const r of list){
  const o=new Option(r.nome,r.nome);
  o.dataset.openingImage=r.immagine;
  if(norm(r.nome)===old)keep=r.nome;
  f.appendChild(o);
 }
 const wanted=['Seleziona apertura',...list.map(r=>r.nome)];
 const now=[...sel.options].map(o=>o.textContent||'');
 const same=now.length===wanted.length&&now.every((v,i)=>norm(v)===norm(wanted[i]));
 if(!same){sel.replaceChildren(f);sel.value=keep||'';}
 const rec=resolve(sel.value,card);
 setPreview(card,rec);
 sel.dataset.pwReveriiClean=VERSION;
}

function patchFunctions(){
 const wrap=(name,kind)=>{
  const old=window[name];
  if(typeof old!=='function'||old.__pwReveriiClean)return;
  const fn=function(a,b){
   const card=kind==='available'?a:b;
   if(isReverii(card)){
    if(kind==='available')return records(card);
    if(kind==='image')return resolve(a,card)?.immagine||'';
    return resolve(a,card);
   }
   return old.apply(this,arguments);
  };
  fn.__pwReveriiClean=true;
  window[name]=fn;
 };
 wrap('openingRecord','record');
 wrap('openingImage','image');
 wrap('availableOpenings','available');
}

function apply(card){
 if(!isReverii(card))return;
 cleanTipologie(card);
 patchFunctions();
 fillAperture(card);
}
function schedule(card){[0,40,100,220,450,850,1400,2200].forEach(ms=>setTimeout(()=>apply(card),ms));}
document.addEventListener('change',e=>{
 const card=e.target?.closest?.('.serramento');if(!card)return;
 if(e.target.matches('.madre')){
  if(isReverii(card))schedule(card);
  else card.querySelector('.opening-visual[data-reverii-opening-image]')?.removeAttribute('data-reverii-opening-image');
  return;
 }
 if(!isReverii(card))return;
 if(e.target.matches('.serie,.tipologia,.apertura'))schedule(card);
},true);
function init(){patchFunctions();document.querySelectorAll('.serramento').forEach(c=>{if(isReverii(c))schedule(c);});}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init,{once:true});else init();
setTimeout(init,500);setTimeout(init,1300);
setInterval(()=>{patchFunctions();document.querySelectorAll('.serramento').forEach(c=>{if(isReverii(c))apply(c);});},400);
window.PW_REVERII_CLEAN_VERSION=VERSION;
})();