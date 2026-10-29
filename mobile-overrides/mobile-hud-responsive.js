/* ©criado por Vitor Ag/Nyx - 2026 */
/* ©criado por Vitor Ag/Nyx - 2026 */
/* ©criado por Vitor Ag/Nyx - 2026 */
(() => {
'use strict';
try{
  const hud=document.getElementById('hud');if(!hud)return;
  if(!document.getElementById('scPortraitStats')){
    hud.insertAdjacentHTML('beforeend','<div id="scPortraitStats" aria-hidden="true"><span id="scPortraitKills">☠ 0</span><span id="scPortraitScore" class="scps-score">★ 0</span></div>');
  }
  const killsEl=document.getElementById('scPortraitKills');
  const scoreEl=document.getElementById('scPortraitScore');
  let last=-1;
  function tick(now){
    if(now-last>160){
      last=now;
      try{
        const k=typeof kills==='number'?kills:0;
        const sc=typeof scoreNow==='function'?scoreNow():0;
        killsEl.textContent='☠ '+Number(k).toLocaleString('pt-BR')+' ABATES';
        scoreEl.textContent='★ '+Number(sc||0).toLocaleString('pt-BR')+' PTS';
      }catch(_){ }
    }
    requestAnimationFrame(tick);
  }
  requestAnimationFrame(tick);
  console.log('[Mobile] Responsive portrait HUD enabled');
}catch(err){console.warn('[Mobile Portrait HUD]',err)}
})();