(function(){
'use strict';
const VERSION='2026-09-07-pvc-only-1';
const ASSET_BASE='https://raw.githubusercontent.com/PlanetWindows/configuratore2026/957b9d1ee15c2ebc49fca0b43f8b9e7448a8bd17/';
let originalOpeningImage=null;
function norm(v){return String(v||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().replace(/sovraluce/g,'sopraluce').replace(/taverso|tarverso/g,'traverso').replace(/\s+/g,' ').trim()}
function isPVC(card){return norm(card?.querySelector('.madre')?.value)==='pvc'}
function context(card){return{serie:norm(card?.querySelector('.serie')?.value),tipologia:norm(card?.querySelector('.tipologia')?.value)}}
function pvcRecords(card){if(!isPVC(card))return[];const c=context(card);return (window.PW_ZIP_OPENINGS||[]).filter(r=>norm(r.madre)==='pvc'&&(!r.serie?.length||r.serie.some(x=>norm(x)===c.serie))&&(!r.tipologia?.length||r.tipologia.some(x=>norm(x)===c.tipologia)))}
function findRecord(value,card){const q=norm(value);return pvcRecords(card).find(r=>norm(r.nome)===q)||null}
function asset(src){if(!src)return'';if(src.startsWith('data:')||/^https?:/i.test(src))return src;return ASSET_BASE+src.replace(/^\.\//,'')}
function mapped(value,card){return asset(findRecord(value,card)?.immagine||'')}
function same(a,b){if(!a||!b)return false;try{return new URL(a,location.href).href===new URL(b,location.href).href}catch(_){return a===b}}
function selectedValue(sel){if(!sel)return'';const opt=sel.options?.[sel.selectedIndex];return sel.value||opt?.textContent?.trim()||''}
function refresh(card){if(!isPVC(card))return;const sel=card.querySelector('.apertura');if(!sel)return;const value=selectedValue(sel);const src=mapped(value,card);if(!src)return;let old='';try{if(originalOpeningImage)old=originalOpeningImage(value,card)||''}catch(_){}
if(old){for(const im of card.querySelectorAll('img')){const cur=im.getAttribute('src')||im.src||'';if(same(cur,old)){im.src=src;im.alt=value;im.hidden=false}}}
sel.dataset.pvcOpeningImage=src;
}
function patch(){if(typeof window.openingImage!=='function'||window.openingImage.__pwPVCOnly)return;originalOpeningImage=window.openingImage;const wrapped=function(value,card){if(card&&isPVC(card)){const src=mapped(value,card);if(src)return src}return originalOpeningImage.apply(this,arguments)};wrapped.__pwPVCOnly=true;window.openingImage=wrapped}
function init(){patch();document.querySelectorAll('.serramento').forEach(refresh)}
document.addEventListener('change',function(e){if(!e.target?.matches?.('.madre,.serie,.tipologia,.apertura'))return;const card=e.target.closest('.serramento');if(!card)return;setTimeout(()=>{patch();refresh(card)},0);setTimeout(()=>refresh(card),80)});
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init,{once:true});else init();setTimeout(init,400);setTimeout(init,1200);
window.PW_PVC_ONLY_VERSION=VERSION;
})();
