/* Planet Windows - SOLO colore anteprime ALLUMINIO. Non modifica immagini, mappe, aperture, PVC o Reverii. */
(function(){
'use strict';
const norm=s=>String(s||'').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/[^a-z0-9]+/g,' ').trim();
const cache=new Map();

function isAlluminio(card){
  const t=norm(card?.innerText||'');
  return /\balluminio\b|planet 72|planet 82|planet door 72|planet door 82|planet panoramico|planet top slide|top slide|panoramico/.test(t);
}
function colorEl(card){
  return card?.querySelector('.coloreInt,.colore-interno,.coloreInterno,[name*="colore_interno"],[name*="coloreInterno"],[class*="colore"][class*="intern"]');
}
function selectedColor(el){
  if(!el)return'';
  try{
    return typeof window.valoreSelect==='function'?(window.valoreSelect(el)||''):(el.value||'');
  }catch{return el.value||'';}
}
function previewStyle(el){
  const value=selectedColor(el);
  if(!value)return null;
  try{
    return typeof window.stileAnteprimaColore==='function'?window.stileAnteprimaColore(value):null;
  }catch{return null;}
}
function RGB(c){
  if(!c)return null;
  const d=document.createElement('span');
  d.style.color=c; d.style.display='none'; document.body.appendChild(d);
  const a=(getComputedStyle(d).color.match(/[\d.]+/g)||[]).slice(0,3).map(Number);
  d.remove(); return a.length===3?a:null;
}
function loadImage(src){
  return new Promise((resolve,reject)=>{
    const image=new Image();
    image.onload=()=>resolve(image);
    image.onerror=reject;
    image.src=src;
  });
}
function syncCorrectBase(card){
  const img=card?.querySelector('.opening-visual img');
  const base=img?.dataset?.pwBaseSrc||'';
  if(img&&base)img.dataset.originalSrc=base;
}

async function recolorAlluminio(card){
  if(!card||!isAlluminio(card))return;
  const img=card.querySelector('.opening-visual img');
  const ce=colorEl(card);
  if(!img||!ce||img.hidden)return;

  const base=img.dataset.pwBaseSrc || img.getAttribute('src') || '';
  if(!base)return;
  img.dataset.pwBaseSrc=base;
  img.dataset.originalSrc=base;

  const style=previewStyle(ce);
  if(!style){
    img.src=base;
    if(typeof window.renderNavigator==='function')window.renderNavigator();
    return;
  }

  const styleKey=selectedColor(ce);
  const ck=base+'|ALONLY|'+styleKey;
  if(cache.has(ck)){ img.src=cache.get(ck); return; }

  const token=String(Date.now())+Math.random();
  img.dataset.colorRenderToken=token;

  let source,texture=null;
  try{
    source=await loadImage(base);
    if(style.type==='texture'&&style.src)texture=await loadImage(style.src);
  }catch{return;}
  if(img.dataset.colorRenderToken!==token)return;

  const w=source.naturalWidth, h=source.naturalHeight;
  if(!w||!h)return;
  const cv=document.createElement('canvas'); cv.width=w; cv.height=h;
  const ctx=cv.getContext('2d',{willReadFrequently:true});
  ctx.drawImage(source,0,0);
  let id; try{id=ctx.getImageData(0,0,w,h);}catch{return;}
  const p=id.data, total=w*h;

  let target=null,textureData=null,tw=0,th=0;
  if(texture){
    const tc=document.createElement('canvas');
    tw=texture.naturalWidth||texture.width;
    th=texture.naturalHeight||texture.height;
    tc.width=tw;tc.height=th;
    const tx=tc.getContext('2d',{willReadFrequently:true});
    tx.drawImage(texture,0,0,tw,th);
    textureData=tx.getImageData(0,0,tw,th).data;
  }else if(style.type==='solid'&&style.color){
    target=RGB(style.color);
  }
  if(!textureData&&!target)return;

  /*
    Le tavole ALLUMINIO provenienti dai PDF non hanno tutte lo stesso grigio.
    La maschera include ora anche i riempimenti e le superfici grigio-chiare
    dell'infisso, non soltanto le cornici, continuando a escludere fondo bianco,
    testi, simboli sottili e dettagli non pertinenti.
  */
  const mask=new Uint8Array(total);
  for(let y=0;y<h;y++){
    for(let x=0;x<w;x++){
      const q=y*w+x, n=q*4;
      if(p[n+3]<20)continue;
      const r=p[n],g=p[n+1],b=p[n+2];
      const mx=Math.max(r,g,b), mn=Math.min(r,g,b);
      const lum=(r+g+b)/3;
      if(mx-mn<=48 && lum>=24 && lum<=250) mask[q]=1;
    }
  }

  const seen=new Uint8Array(total);
  const stack=[];
  const components=[];
  const dirs=[-1,1,-w,w,-w-1,-w+1,w-1,w+1];
  for(let q=0;q<total;q++){
    if(!mask[q]||seen[q])continue;
    seen[q]=1; stack.length=0; stack.push(q);
    const pts=[]; let minx=w,miny=h,maxx=0,maxy=0,touches=false;
    while(stack.length){
      const a=stack.pop(); pts.push(a);
      const x=a%w, y=(a/w)|0;
      if(x<minx)minx=x;if(x>maxx)maxx=x;if(y<miny)miny=y;if(y>maxy)maxy=y;
      if(x===0||y===0||x===w-1||y===h-1)touches=true;
      for(const d of dirs){
        const z=a+d; if(z<0||z>=total||seen[z]||!mask[z])continue;
        const zx=z%w, zy=(z/w)|0;
        if(Math.abs(zx-x)>1||Math.abs(zy-y)>1)continue;
        seen[z]=1; stack.push(z);
      }
    }
    const bw=maxx-minx+1,bh=maxy-miny+1, area=pts.length;
    const density=area/(bw*bh);
    const bigEnough=area>=Math.max(28,total*0.0007);
    const profileLike=(density>=0.055 || area>=total*0.003 || bw>=w*0.35 || bh>=h*0.35);
    if(!touches && bigEnough && profileLike) components.push(pts);
  }

  for(const pts of components){
    for(const q of pts){
      const n=q*4;
      const r=p[n],g=p[n+1],b=p[n+2];
      const lum=(r+g+b)/3;
      let tr,tg,tb;
      if(textureData){
        const x=q%w,y=(q/w)|0;
        const ti=((y%th)*tw+(x%tw))*4;
        tr=textureData[ti];tg=textureData[ti+1];tb=textureData[ti+2];
      }else{
        [tr,tg,tb]=target;
      }
      const shade=Math.max(0.28,Math.min(1.18,lum/150));
      p[n]=Math.min(255,Math.round(tr*shade));
      p[n+1]=Math.min(255,Math.round(tg*shade));
      p[n+2]=Math.min(255,Math.round(tb*shade));
    }
  }

  ctx.putImageData(id,0,0);
  const out=cv.toDataURL('image/webp',0.96);
  cache.set(ck,out);
  if(img.dataset.colorRenderToken===token){
    img.src=out;
    if(typeof window.renderNavigator==='function')window.renderNavigator();
  }
}

document.addEventListener('change',e=>{
  const card=e.target?.closest?.('.serramento');
  if(!card||!isAlluminio(card))return;
  if(e.target===colorEl(card)){
    syncCorrectBase(card);
    setTimeout(()=>recolorAlluminio(card),140);
  }
},true);

document.addEventListener('change',e=>{
  const card=e.target?.closest?.('.serramento');
  if(!card||!isAlluminio(card))return;
  if(e.target?.matches?.('.apertura')) setTimeout(()=>recolorAlluminio(card),180);
},true);

window.pwRecolorAlluminioOnly=recolorAlluminio;
})();
