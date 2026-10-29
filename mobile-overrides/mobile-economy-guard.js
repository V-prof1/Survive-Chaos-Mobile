/* ©criado por Vitor Ag/Nyx - 2026 */
/* ©criado por Vitor Ag/Nyx - 2026 */
/* ©criado por Vitor Ag/Nyx - 2026 */
(() => {
'use strict';
try{
  if(typeof end!=='function'||typeof S==='undefined')return;
  const DIFF=[.65,1,1.18,1.35,.18];
  const capFor=(win,t)=>{
    t=Math.max(0,Number(t)||0);
    const first=Math.min(t,1200)*.18;
    const late=Math.max(0,t-1200)*.06;
    const base=55+first+late+(win?75:0);
    const f=DIFF[Math.max(0,Math.min(4,(CF&&CF.m)||0))]||1;
    return Math.max(25,Math.round(base*f));
  };
  const oldEnd=end;
  end=function(win){
    const before=Number(S.coins)||0;
    const rt=window.SCEndgame&&SCEndgame.run;
    const already=!!(rt&&rt.payoutUsed);
    const lab=!!(rt&&rt.lab);
    const out=oldEnd.apply(this,arguments);
    let delta=Math.max(0,(Number(S.coins)||0)-before);
    const cap=(already||lab)?0:capFor(!!win,typeof T==='number'?T:0);
    const allowed=Math.min(delta,cap);
    if(delta>allowed){
      S.coins=Math.max(0,(Number(S.coins)||0)-(delta-allowed));
      try{
        if(Array.isArray(S.hist)&&S.hist[0]&&typeof S.hist[0].c==='number')S.hist[0].c=allowed;
        const gain=document.querySelector('#over .gain');
        if(gain)gain.textContent='+'+allowed.toLocaleString('pt-BR')+' 🪙';
        const box=document.getElementById('os');
        if(box){const n=document.createElement('div');n.className='sbd';n.textContent=lab?'Boss Lab: treino sem recompensa.':already?'Caos Ascendente: progressão e drops, sem pagamento duplicado.':'Economia controlada: teto desta run '+cap.toLocaleString('pt-BR')+' moedas.';box.appendChild(n)}
        if(typeof sv==='function')sv();if(typeof ref==='function')ref();
      }catch(_){}
    }
    if(rt)rt.payoutUsed=true;
    return out;
  };
  window.SCEconomyGuard={version:'15.0',capFor};
  console.log('[Mobile] Economy Guard 15.0 enabled: run payouts are softly capped by duration/difficulty; Heat/endgame progression does not multiply coins.');
}catch(err){console.error('[Economy Guard 15.0]',err)}
})();
