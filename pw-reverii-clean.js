(function(){
'use strict';
const VERSION='2026-09-09-reverii-clean-1';
const ASSET_BASE='https://cdn.jsdelivr.net/gh/PlanetWindows/configuratore2026@957b9d1ee15c2ebc49fca0b43f8b9e7448a8bd17/';
const norm=v=>String(v||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().replace(/sovraluce/g,'sopraluce').replace(/taverso|tarverso/g,'traverso').replace(/[^a-z0-9]+/g,' ').trim();
const text=el=>el?(el.options?.[el.selectedIndex]?.textContent||el.value||''):'';
const BLOCKED=['ribalta','arco','trapezio','traslante','scorrevole'];

const DATA={
 finestra:[
  ['1- Fisso','@c4'],
  ['2- Fisso con traverso','2-fisso-con-traverso.webp'],
  ['3- Fisso con piantone','@c5'],
  ['4- Wasistas con cricchetto','4-wasistas-cricchetto.webp'],
  ['5- Wasistas con cremonese','5-wasistas-cremonese.webp'],
  ['6- Finestra 1 anta destra','@c6'],
  ['7- Finestra 1 anta sinistra','@c7'],
  ['8- Finestra 1 anta con sottoluce','8-f1-con-sottoluce.webp'],
  ['9- Finestra 1 anta con sopraluce','9-f1-sovraluce.webp'],
  ['10- Finestra 2 ante con piantone','10-f2-con-piantone.webp'],
  ['11- Finestra 2 ante destra','11-f2-dx.webp'],
  ['12- Finestra 2 ante sinistra','12-f2-sx.webp'],
  ['13- Finestra 2 ante con sottoluce','13-f2-con-sottoluce.webp'],
  ['14- Finestra 2 ante con sopraluce','14-f2-con-sovraluce.webp'],
  ['15- Finestra 3 ante','15-f3.webp'],
  ['16- Finestra 4 ante','16-f4.webp']
 ],
 portafinestra:[
  ['17- Portafinestra 1 anta destra','17-pf1-dx.webp'],
  ['18- Portafinestra 1 anta sinistra','18-pf-1-sx.webp'],
  ['19- Portafinestra 1 anta con sopraluce','19-pf1-sovraluce.webp'],
  ['20- Portafinestra 1 anta con traverso','20-pf1-traverso.webp'],
  ['21- Portafinestra 1 anta con telaio inferiore','21-pf-1-con-telaio-inf.webp'],
  ['22- Portafinestra 1 anta con serratura','22-pf1-con-serratura.webp'],
  ['23- Portafinestra 2 ante destra','23-pf2-dx.webp'],
  ['24- Portafinestra 2 ante sinistra','24-pf2-sx.webp'],
  ['25- Portafinestra 2 ante con sopraluce','25-pf-con-sovraluce.webp'],
  ['26- Portafinestra 2 ante con traverso','26-pf2-con-traverso.webp'],
  ['27- Portafinestra 2 ante con telaio inferiore','27-pf-2-con-telaio-inf.webp'],
  ['28- Portafinestra 2 ante con serratura','28-pf2-con-serratura.webp'],
  ['29- Portafinestra 3 ante','29-pf-3.webp'],
  ['30- Portafinestra 4 ante','30-pf4.webp']
 ],
 portoncino:[
  ['31- Portoncino interno 1 anta destra','31-pi1-dx.webp'],
  ['32- Portoncino interno 1 anta sinistra','32-pi1-sx.webp'],
  ['33- Portoncino interno 1 anta con traverso','33-pi-1-con-traverso.webp'],
  ['34- Portoncino interno 1 anta con fianco luce sinistro','34-pi-1-con-finaco-luce-sx.webp'],
  ['35- Portoncino interno 1 anta con fianco luce destro','35-pi-1-con-finaco-luce-dx.webp'],
  ['36- Portoncino interno 1 anta con sopraluce','36-pi-1-con-sovraluce.webp'],
  ['37- Portoncino interno 2 ante destra','37-pi2-dx.webp'],
  ['38- Portoncino interno 2 ante sinistra','38-pi2-sx.webp'],
  ['39- Portoncino interno 2 ante asimmetriche','39-pi-2-ante-asimmetriche.webp'],
  ['40- Portoncino interno 2 ante con traverso','40-pi-2-con-traverso.webp'],
  ['41- Portoncino interno 2 ante con sopraluce','41-pi2-con-sovraluce.webp']
 ],
 'portoncino a spingere':[
  ['45- Portoncino a spingere 1 anta destra','45-pe-1-dx.webp'],
  ['46- Portoncino a spingere 1 anta sinistra','46-pe-1-sx.webp'],
  ['47- Portoncino a spingere 1 anta con traverso','47-pe-1-con-traverso.webp'],
  ['48- Portoncino a spingere 2 ante destra','48-pe2-dx.webp'],
  ['49- Portoncino a spingere 2 ante sinistra','49-pe-2-sx.webp'],
  ['50- Portoncino a spingere 2 ante asimmetriche','50-pe2-ante-asimmetriche.webp'],
  ['51- Portoncino a spingere 2 ante con traverso','51-pe2-con-traverso.webp']
 ],
 'portoncino antipanico':[
  ['52- Portoncino antipanico 1 anta destra','52-pa-dx.webp'],
  ['53- Portoncino antipanico 1 anta sinistra','53-pa-sx.webp'],
  ['54- Portoncino antipanico 1 anta con traverso','54-pa-con-traverso.webp'],
  ['55- Portoncino antipanico 2 ante destra','55-pa-2-dx.webp'],
  ['56- Portoncino antipanico 2 ante sinistra','56-pa-2-sx.webp'],
  ['57- Portoncino antipanico 2 ante asimmetriche','57-pa-2-ante-asimmetriche.webp'],
  ['58- Portoncino antipanico 2 ante con traverso','58-pa-2-con-traverso.webp']
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
 if(raw.startsWith('@c'))return (window.PW_ZIP_COLLISIONS||{})[raw.slice(1)]||'';
 if(/^data:|^https?:/i.test(raw))return raw;
 return ASSET_BASE+raw;
}
function records(card){
 const key=branch(card);if(!key)return[];
 return (DATA[key]||[]).map(([nome,raw])=>({madre:'REVERII',serie:['Reverii'],tipologia:[key],nome,immagine:imageSrc(raw),raw}));
}
function resolve(value,card){const q=norm(value);return records(card).find(r=>norm(r.nome)===q)||null;}

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
 if(rec&&rec.immagine){
  const u=rec.immagine;
  card.dataset.pwSummaryOpeningImage=u;
  if(sel)sel.dataset.openingImage=u;
  if(img){img.dataset.originalSrc=u;img.src=u;img.alt=rec.nome;img.hidden=false;}
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
 if(e.target.matches('.madre')){if(isReverii(card))schedule(card);return;}
 if(!isReverii(card))return;
 if(e.target.matches('.serie,.tipologia,.apertura'))schedule(card);
},true);
function init(){patchFunctions();document.querySelectorAll('.serramento').forEach(c=>{if(isReverii(c))schedule(c);});}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init,{once:true});else init();
setTimeout(init,500);setTimeout(init,1300);
setInterval(()=>{patchFunctions();document.querySelectorAll('.serramento').forEach(c=>{if(isReverii(c))apply(c);});},400);
window.PW_REVERII_CLEAN_VERSION=VERSION;
})();