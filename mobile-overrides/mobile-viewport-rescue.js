(() => {
'use strict';
try{
  const root=document.documentElement;
  let syncRaf=0;
  const q=id=>document.getElementById(id);

  function viewport(){
    const vv=window.visualViewport;
    const w=Math.max(1,Math.round(vv&&vv.width||innerWidth||screen.width||1));
    const h=Math.max(1,Math.round(vv&&vv.height||innerHeight||screen.height||1));
    return {w,h};
  }

  function syncViewport(){
    syncRaf=0;
    const {w,h}=viewport(),land=w>=h;
    root.style.setProperty('--sc-vvw',w+'px');
    root.style.setProperty('--sc-vvh',h+'px');
    root.classList.toggle('scRuntimeLandscape',land);
    document.body&&document.body.classList.toggle('scRuntimeLandscape',land);

    // Android can leave the portrait class stale for one or more frames after rotating.
    // Never allow that invisible overlay to block a landscape menu.
    if(land){
      root.classList.remove('scPortraitLocked');
      document.body&&document.body.classList.remove('scPortraitLocked');
      const lock=q('scRotateLock');
      if(lock){lock.setAttribute('aria-hidden','true');lock.style.pointerEvents='none'}
    }else{
      const lock=q('scRotateLock');
      if(lock)lock.style.pointerEvents='';
    }

    // Keep the canvas backing size in agreement with the repaired viewport.
    try{if(typeof rs==='function')rs()}catch(_){ }
  }

  function scheduleViewport(){
    if(syncRaf)return;
    syncRaf=requestAnimationFrame(syncViewport);
  }

  // Fallback only fires if the original button handler failed to change state.
  // It does not replace working game handlers.
  const fallback={
    play(){
      if(typeof st==='undefined'||st!=='menu')return;
      try{hide('menu');show('setup');st='setup';setupUI();if(typeof sfx==='function')sfx('ui')}catch(e){console.warn('[Viewport Rescue play]',e)}
    },
    shopb(){
      if(typeof st==='undefined'||st!=='menu')return;
      try{hide('menu');show('shop');st='shop';if(typeof ref==='function')ref();if(typeof shopUI==='function')shopUI()}catch(e){console.warn('[Viewport Rescue shop]',e)}
    },
    achb(){
      if(typeof st==='undefined'||st!=='menu')return;
      try{hide('menu');show('ach');st='ach';if(typeof achUI==='function')achUI(0);if(typeof sfx==='function')sfx('ui')}catch(e){console.warn('[Viewport Rescue achievements]',e)}
    },
    histb(){
      if(typeof st==='undefined'||st!=='menu')return;
      try{hide('menu');show('hist');st='hist';if(typeof histUI==='function')histUI();if(typeof sfx==='function')sfx('ui')}catch(e){console.warn('[Viewport Rescue history]',e)}
    }
  };

  document.addEventListener('click',e=>{
    const b=e.target&&e.target.closest&&e.target.closest('#play,#shopb,#achb,#histb');
    if(!b||!fallback[b.id])return;
    const before=typeof st==='undefined'?null:st;
    setTimeout(()=>{
      try{if(before==='menu'&&typeof st!=='undefined'&&st===before)fallback[b.id]()}catch(_){ }
    },32);
  },true);

  addEventListener('resize',scheduleViewport,{passive:true});
  addEventListener('orientationchange',()=>{scheduleViewport();setTimeout(scheduleViewport,80);setTimeout(scheduleViewport,240)},{passive:true});
  if(window.visualViewport){visualViewport.addEventListener('resize',scheduleViewport,{passive:true});visualViewport.addEventListener('scroll',scheduleViewport,{passive:true})}
  document.addEventListener('visibilitychange',()=>{if(!document.hidden)setTimeout(scheduleViewport,30)});
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',scheduleViewport,{once:true});
  else scheduleViewport();
  setTimeout(scheduleViewport,120);
  setTimeout(scheduleViewport,500);

  window.SCViewportRescue={version:'19.0',sync:syncViewport,get viewport(){return viewport()}};
  console.log('[Mobile] Viewport Rescue 19.0 enabled.');
}catch(err){console.warn('[Mobile Viewport Rescue]',err)}
})();
