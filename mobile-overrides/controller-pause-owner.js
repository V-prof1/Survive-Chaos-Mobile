/* Survive Chaos — Controller Pause Owner 2.1
   Dedicated 20ms rising-edge Start scan; raw co-op padIn cannot also toggle pause. */
(()=>{'use strict';
if(window.__SC_CONTROLLER_PAUSE_OWNER__)return;window.__SC_CONTROLLER_PAUSE_OWNER__=1;
try{
  if(typeof padIn==='function'){
    const base=padIn;
    padIn=function(){
      const z=document.getElementById('pz');if(!z)return base.apply(this,arguments);
      const click=z.click;z.click=()=>{};
      try{return base.apply(this,arguments)}finally{z.click=click}
    };
  }
  const prev=new Map();
  const pressed=g=>!!g?.buttons?.[9]?.pressed;
  function trigger(){
    try{
      if(document.getElementById('scPadKeyboard')?.classList.contains('on'))return;
      if(document.getElementById('scTutorial')?.classList.contains('on'))return;
      if(typeof st==='undefined')return;
      if(st==='play')document.getElementById('pz')?.click();
      else if(st==='pause')document.getElementById('resume')?.click();
      else if(st==='intro')document.getElementById('intro_b')?.click();
    }catch(_){}
  }
  function scan(){let pads=[];try{pads=[...navigator.getGamepads()].filter(g=>g&&g.connected)}catch(_){}const seen=new Set();for(const g of pads){seen.add(g.index);const n=pressed(g),p=!!prev.get(g.index);if(n&&!p)trigger();prev.set(g.index,n)}for(const k of [...prev.keys()])if(!seen.has(k))prev.delete(k)}
  setInterval(scan,20);addEventListener('blur',()=>prev.clear());addEventListener('gamepaddisconnected',()=>setTimeout(scan,0));
  window.SCControllerPauseOwner={version:'2.1'};
  console.log('[Controller] Pause owner 2.1 active');
}catch(err){console.warn('[Controller Pause Owner]',err)}
})();
