/* ©criado por Vitor Ag/Nyx - 2026 */
/* ©criado por Vitor Ag/Nyx - 2026 */
/* ©criado por Vitor Ag/Nyx - 2026 */
(() => {
'use strict';
try {
  const MAX_SHIELD=3;
  const BASE_RECHARGE=13;
  const PERFECT_MS=95;
  const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));

  // ===== SHIELD REBALANCE =====
  const shield=Array.isArray(U)?U.find(u=>u&&u[0]==='shield'):null;
  if(shield){
    shield[2]='+1 carga de escudo. Bloquear reinicia a recarga; máximo total de 3 cargas.';
    shield[3]=2;
    shield[4]=p=>{
      p.shM=Math.min(MAX_SHIELD,(p.shM||0)+1);
      p.sh=Math.min(p.shM,(p.sh||0)+1);
      p.shr=Math.max(BASE_RECHARGE,p.shr||0);
      p.shT=0;
    };
    try{if(typeof UM!=='undefined')UM.shield=2}catch(_){}
  }

  try{
    if(typeof U2!=='undefined')U2.shield=q=>{
      q.shk=(q.shk||0)+.35;
      q.shr=Math.max(12,(q.shr||BASE_RECHARGE)*.94);
    };
  }catch(_){}

  try{
    const imm=Array.isArray(SUP)?SUP.find(u=>u&&u[0]==='s_immortal'):null;
    if(imm){
      imm[2]='+140 de vida, regeneração +2,5 e +1 escudo. Preço: dano −18% e velocidade −10%.';
      imm[4]=p=>{
        p.mhp+=140;p.hp+=140;p.regen+=2.5;
        p.shM=Math.min(MAX_SHIELD,(p.shM||0)+1);
        p.sh=Math.min(p.shM,(p.sh||0)+1);
        p.shr=Math.max(12,p.shr||BASE_RECHARGE);p.shT=0;
        p.dmg*=.82;p.sp*=.90;
      };
    }
  }catch(_){}

  function capShield(q){
    if(!q)return;
    q.shM=clamp(q.shM||0,0,MAX_SHIELD);
    q.sh=clamp(q.sh||0,0,q.shM);
    if(q.shM>0)q.shr=Math.max(12,q.shr||BASE_RECHARGE);
    q.shT=Math.max(0,q.shT||0);
  }

  if(typeof giveUp==='function'){
    const oldGive=giveUp;
    giveUp=function(){
      const out=oldGive.apply(this,arguments);
      try{for(const q of PL||[])capShield(q)}catch(_){}
      return out;
    };
  }

  if(typeof start==='function'){
    const oldStart=start;
    start=function(){
      const out=oldStart.apply(this,arguments);
      try{for(const q of PL||[])capShield(q)}catch(_){}
      return out;
    };
  }

  // ===== PERFECT DASH =====
  // Snapshot only properties whose names clearly represent stamina/energy.
  function staminaSnapshot(q){
    const snap={};
    if(!q)return snap;
    for(const k of Object.keys(q)){
      if(!/(stamina|stam|energy)/i.test(k))continue;
      if(typeof q[k]==='number'&&Number.isFinite(q[k]))snap[k]=q[k];
    }
    return snap;
  }
  function restoreStamina(q,snap){
    if(!q||!snap)return;
    for(const k of Object.keys(snap))if(typeof q[k]==='number')q[k]=Math.max(q[k],snap[k]);
  }
  function perfectFx(q){
    try{
      FX.push({x:q.x,y:q.y,r:95,t:.24,ring:1});
      if(typeof puff==='function')puff(q.x,q.y,'#7cf6ff',8,150);
      if(typeof ban==='function')ban('⚡ PERFECT DASH · RECARGA ZERADA');
      if(typeof sfx==='function')sfx('boss2');
    }catch(_){}
  }

  if(typeof dash==='function'){
    const oldDash=dash;
    dash=function(){
      const q=P;
      const ready=!!(q&&st==='play'&&!q.dead&&q.dc<=0);
      if(ready){
        q.scPerfectArmed=1;
        q.scPerfectDone=0;
        q.scPerfectUntil=performance.now()+PERFECT_MS;
        q.scPerfectStamina=staminaSnapshot(q);
      }
      return oldDash.apply(this,arguments);
    };
  }

  if(typeof hurt==='function'){
    const oldHurt=hurt;
    hurt=function(d){
      const q=P;
      const now=performance.now();
      const perfect=!!(q&&q.dT>0&&q.scPerfectArmed&&!q.scPerfectDone&&now<=q.scPerfectUntil);
      const shBefore=q?(q.sh||0):0;

      if(perfect){
        q.scPerfectDone=1;
        q.scPerfectArmed=0;
        q.dc=0;
        restoreStamina(q,q.scPerfectStamina);
        q.scPerfectStamina=null;
        perfectFx(q);
      }

      const out=oldHurt.apply(this,arguments);

      // A real shield block must restart the recharge from zero.
      if(q&&shBefore>(q.sh||0)){
        q.shT=0;
        q.iv=Math.min(q.iv||0,.35);
        capShield(q);
      }
      return out;
    };
  }

  // Clean expired perfect-dash state cheaply; no gameplay loop scan required.
  let last=0;
  function upkeep(t){
    if(t-last>250){
      last=t;
      try{
        for(const q of PL||[]){
          capShield(q);
          if(q.scPerfectArmed&&performance.now()>q.scPerfectUntil){q.scPerfectArmed=0;q.scPerfectStamina=null}
        }
      }catch(_){}
    }
    requestAnimationFrame(upkeep);
  }
  requestAnimationFrame(upkeep);

  window.SCDefenseMobility={version:'9.0',maxShield:MAX_SHIELD,shieldRecharge:BASE_RECHARGE,perfectDashWindowMs:PERFECT_MS};
}catch(err){console.error('[Defense Mobility 9.0]',err)}
})();
