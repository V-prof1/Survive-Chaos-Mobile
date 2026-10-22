(() => {
'use strict';
try{
  const proto=window.Storage&&Storage.prototype;
  if(!proto||proto.__scSaveGuard)return;
  proto.__scSaveGuard=1;
  const raw=proto.setItem;
  let pending=null,timer=0;
  const flush=()=>{if(!pending)return;const [store,k,v]=pending;pending=null;timer=0;try{raw.call(store,k,v)}catch(_){}};
  proto.setItem=function(k,v){
    if(k==='nsf'&&typeof st!=='undefined'&&st==='play'){
      pending=[this,k,v];
      if(!timer)timer=setTimeout(flush,650);
      return;
    }
    if(k==='nsf')flush();
    return raw.call(this,k,v);
  };
  addEventListener('pagehide',flush);
  addEventListener('visibilitychange',()=>{if(document.hidden)flush()});
}catch(err){console.warn('[Mobile SaveGuard]',err)}
})();