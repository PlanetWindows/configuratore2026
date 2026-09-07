/* Planet Windows - SOLO colore anteprime ALLUMINIO. Non modifica immagini, mappe, aperture, PVC o Reverii. */
(function(){
'use strict';

const norm=s=>String(s||'').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/[^a-z0-9]+/g,' ').trim();
const cache=new Map();

function isAlluminio(card){
  const t=norm(card?.innerText||'');
  return /\balluminio\b|planet 72|planet 82|planet door 72|planet door 82|planet panoramico|planet top slide|top slide|panoramico/.test(t);
}
function getImg(card){return card?.querySelector('.opening-visual img,.opening-preview-box img');}
function colorEl(card){return card?.querySelector('.coloreInt,.colore-interno,.coloreInterno,[name*="colore_interno"],[name*="coloreInterno"],[class*="colore"][class*="intern"]');}
function selectedColor(el){
  if(!el)return'';
  try{return typeof window.valoreSelect==='function'?(window.valoreSelect(el)||''):(el.value||'');}
  catch{return el.value||'';}
}
function previewStyle(el){
  const value=selectedColor(el);
  if(!value)return null;
  try{return typeof window.stileAnteprimaColore==='function'?window.stileAnteprimaColore(value):null;}
  catch{return null;}
}
function RGB(c){
  if(!c)return null;
  const d=document.createElement('span');d.style.color=c;d.style.display='none';document.body.appendChild(d);
  const a=(getComputedStyle(d).color.match(/[\d.]+/g)||[]).slice(0,3).map(Number);d.remove();return a.length===3?a:null;
}
function loadImage(src){return new Promise((resolve,reject)=>{const im=new Image();im.onload=()=>resolve(im);im.onerror=reject;im.src=src;});}
function syncBase(card){
  const img=getImg(card);if(!img)return'';
  const base=img.dataset.pwBaseSrc||'';
  if(base)img.dataset.originalSrc=base;
  return base;
}
function edgeWhite(p,n){
  if(p[n+3]<20)return true;
  const r=p[n],g=p[n+1],b=p[n+2];
  return r>=246&&g>=246&&b>=246;
}
function glassPixel(r,g,b){
  const lum=(r+g+b)/3,mx=Math.max(r,g,b),mn=Math.min(r,g,b),chroma=mx-mn;
  return lum>=82&&chroma>=18&&b>=r+14&&(b>=g-8||g>=r+10);
}

async function recolorAlluminio(card){
  if(!card||!isAlluminio(card))return;
  const img=getImg(card),ce=colorEl(card);
  if(!img||!ce||img.hidden)return;

  const base=syncBase(card)||img.getAttribute('src')||'';
  if(!base)return;
  img.dataset.pwBaseSrc=base;img.dataset.originalSrc=base;

  const style=previewStyle(ce);
  if(!style){img.src=base;if(typeof window.renderNavigator==='function')window.renderNavigator();return;}

  const key=base+'|FULLPROFILE5|'+selectedColor(ce);
  if(cache.has(key)){img.src=cache.get(key);if(typeof window.renderNavigator==='function')window.renderNavigator();return;}

  const token=String(Date.now())+Math.random();img.dataset.colorRenderToken=token;
  let source,texture=null;
  try{source=await loadImage(base);if(style.type==='texture'&&style.src)texture=await loadImage(style.src);}catch{return;}
  if(img.dataset.colorRenderToken!==token)return;

  const w=source.naturalWidth,h=source.naturalHeight,total=w*h;if(!w||!h)return;
  const cv=document.createElement('canvas');cv.width=w;cv.height=h;
  const ctx=cv.getContext('2d',{willReadFrequently:true});ctx.drawImage(source,0,0);
  let id;try{id=ctx.getImageData(0,0,w,h);}catch{return;}
  const p=id.data;

  let target=null,textureData=null,tw=0,th=0;
  if(texture){
    tw=texture.naturalWidth||texture.width;th=texture.naturalHeight||texture.height;
    const tc=document.createElement('canvas');tc.width=tw;tc.height=th;
    const tx=tc.getContext('2d',{willReadFrequently:true});tx.drawImage(texture,0,0,tw,th);
    textureData=tx.getImageData(0,0,tw,th).data;
  }else if(style.type==='solid'&&style.color){target=RGB(style.color);}
  if(!textureData&&!target)return;

  /* Sfondo: solo il bianco connesso ai bordi dell'immagine. */
  const background=new Uint8Array(total),queue=new Int32Array(total);let qh=0,qt=0;
  function pushBg(q){if(!background[q]){background[q]=1;queue[qt++]=q;}}
  for(let x=0;x<w;x++){
    let q=x;if(edgeWhite(p,q*4))pushBg(q);
    q=(h-1)*w+x;if(edgeWhite(p,q*4))pushBg(q);
  }
  for(let y=0;y<h;y++){
    let q=y*w;if(edgeWhite(p,q*4))pushBg(q);
    q=y*w+w-1;if(edgeWhite(p,q*4))pushBg(q);
  }
  while(qh<qt){
    const a=queue[qh++],x=a%w,y=(a/w)|0;
    if(x>0){const z=a-1;if(!background[z]&&edgeWhite(p,z*4))pushBg(z);}
    if(x<w-1){const z=a+1;if(!background[z]&&edgeWhite(p,z*4))pushBg(z);}
    if(y>0){const z=a-w;if(!background[z]&&edgeWhite(p,z*4))pushBg(z);}
    if(y<h-1){const z=a+w;if(!background[z]&&edgeWhite(p,z*4))pushBg(z);}
  }

  /* Profilo: tutto ciò che non è sfondo né vetro azzurro. Non dipende più da un singolo grigio. */
  const candidate=new Uint8Array(total);
  for(let q=0;q<total;q++){
    if(background[q])continue;
    const n=q*4;if(p[n+3]<20)continue;
    const r=p[n],g=p[n+1],b=p[n+2];
    if(glassPixel(r,g,b))continue;
    if((r+g+b)/3<=253)candidate[q]=1;
  }

  /* Componenti grandi/continue = telaio, ante, piantoni e traversi. I dettagli piccoli restano invariati. */
  const seen=new Uint8Array(total),stack=[],components=[],dirs=[-1,1,-w,w,-w-1,-w+1,w-1,w+1];
  for(let q=0;q<total;q++){
    if(!candidate[q]||seen[q])continue;
    seen[q]=1;stack.length=0;stack.push(q);
    const pts=[];let minx=w,miny=h,maxx=0,maxy=0;
    while(stack.length){
      const a=stack.pop(),x=a%w,y=(a/w)|0;pts.push(a);
      if(x<minx)minx=x;if(x>maxx)maxx=x;if(y<miny)miny=y;if(y>maxy)maxy=y;
      for(const d of dirs){
        const z=a+d;if(z<0||z>=total||seen[z]||!candidate[z])continue;
        const zx=z%w,zy=(z/w)|0;if(Math.abs(zx-x)>1||Math.abs(zy-y)>1)continue;
        seen[z]=1;stack.push(z);
      }
    }
    const bw=maxx-minx+1,bh=maxy-miny+1,area=pts.length;
    const longEnough=bw>=w*0.055||bh>=h*0.055;
    const thickEnough=Math.min(bw,bh)>=Math.max(2,Math.round(Math.min(w,h)*0.008));
    const bigEnough=area>=Math.max(45,Math.round(total*0.00045));
    if(bigEnough&&longEnough&&thickEnough)components.push(pts);
  }

  let maxArea=0;for(const pts of components)if(pts.length>maxArea)maxArea=pts.length;
  const chosen=components.filter(pts=>pts.length>=Math.max(45,maxArea*0.055));

  for(const pts of chosen){
    for(const q of pts){
      const n=q*4,r=p[n],g=p[n+1],b=p[n+2],lum=(r+g+b)/3;
      let tr,tg,tb;
      if(textureData){const x=q%w,y=(q/w)|0,ti=((y%th)*tw+(x%tw))*4;tr=textureData[ti];tg=textureData[ti+1];tb=textureData[ti+2];}
      else [tr,tg,tb]=target;
      const shade=Math.max(0.34,Math.min(1.22,lum/165));
      p[n]=Math.min(255,Math.round(tr*shade));p[n+1]=Math.min(255,Math.round(tg*shade));p[n+2]=Math.min(255,Math.round(tb*shade));
    }
  }

  ctx.putImageData(id,0,0);
  const out=cv.toDataURL('image/webp',0.96);cache.set(key,out);
  if(img.dataset.colorRenderToken===token){img.src=out;if(typeof window.renderNavigator==='function')window.renderNavigator();}
}

document.addEventListener('change',e=>{
  const card=e.target?.closest?.('.serramento');if(!card||!isAlluminio(card))return;
  if(e.target===colorEl(card)){syncBase(card);setTimeout(()=>recolorAlluminio(card),70);setTimeout(()=>recolorAlluminio(card),220);}
},true);

document.addEventListener('change',e=>{
  const card=e.target?.closest?.('.serramento');if(!card||!isAlluminio(card))return;
  if(e.target?.matches?.('.apertura')){setTimeout(()=>recolorAlluminio(card),140);setTimeout(()=>recolorAlluminio(card),300);}
},true);

window.pwRecolorAlluminioOnly=recolorAlluminio;
})();
