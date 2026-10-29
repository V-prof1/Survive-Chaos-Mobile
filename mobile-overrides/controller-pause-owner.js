/* Survive Chaos — Controller Pause Owner 1.0
   Controller navigation is the single owner of Start/Pause. Prevents co-op padIn double-toggle. */
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
  window.SCControllerPauseOwner={version:'1.0'};
  console.log('[Controller] Pause owner 1.0 active');
}catch(err){console.warn('[Controller Pause Owner]',err)}
})();
