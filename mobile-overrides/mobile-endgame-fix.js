(() => {
'use strict';
try{
  document.addEventListener('click',e=>{
    const b=e.target&&e.target.closest&&e.target.closest('#scAscendBtn');
    if(!b)return;
    setTimeout(()=>{
      try{
        const rt=window.SCEndgame&&SCEndgame.run;
        if(rt&&typeof st!=='undefined'&&st==='play'){
          rt.active=true;
          rt.lastT=typeof T==='number'?T:0;
          rt.payoutUsed=true;
        }
      }catch(_){}
    },0);
  },true);
  console.log('[Mobile] Endgame 14.1 ascendant-state fix enabled.');
}catch(err){console.warn('[Endgame 14.1 fix]',err)}
})();
