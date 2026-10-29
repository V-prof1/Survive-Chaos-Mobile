/* Survive Chaos — Controller Pause Owner 2.4
   Dedicated 20ms rising-edge Start scan; gameplay pause always has priority over modal residue. */
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
      if(typeof st==='undefined')return;
      if(st==='play'){st='pause';if(typeof show==='function')show('pause');else document.getElementById('pause')?.classList.add('on');return}
      if(st==='pause'){if(typeof hide==='function')hide('pause');else document.getElementById('pause')?.classList.remove('on');st='play';return}
      if(document.getElementById('scPadKeyboard')?.classList.contains('on'))return;
      if(document.getElementById('scTutorial')?.classList.contains('on'))return;
      if(st==='intro')document.getElementById('intro_b')?.click();
    }catch(err){console.warn('[Controller Pause trigger]',err)}
  }
  function scan(){let pads=[];try{pads=[...navigator.getGamepads()].filter(g=>g&&g.connected)}catch(_){}const seen=new Set();for(const g of pads){seen.add(g.index);const n=pressed(g),p=!!prev.get(g.index);if(n&&!p)trigger();prev.set(g.index,n)}for(const k of [...prev.keys()])if(!seen.has(k))prev.delete(k)}
  setInterval(scan,20);addEventListener('blur',()=>prev.clear());addEventListener('gamepaddisconnected',()=>setTimeout(scan,0));
  window.SCControllerPauseOwner={version:'2.4',scan,trigger,reset:()=>prev.clear()};
  console.log('[Controller] Pause owner 2.4 active');
}catch(err){console.warn('[Controller Pause Owner]',err)}
})();
