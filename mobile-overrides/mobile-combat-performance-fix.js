/* ©criado por Vitor Ag/Nyx - 2026 */
/* ©criado por Vitor Ag/Nyx - 2026 */
/* ©criado por Vitor Ag/Nyx - 2026 */
/* Survive Chaos Mobile — Combat Integrity & Performance 29.0 */
(()=>{'use strict';
try{
  if(window.__SC_COMBAT_FIX_29__)return;window.__SC_COMBAT_FIX_29__=1;
  const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
  const now=()=>typeof performance!=='undefined'?performance.now():Date.now();
  const bossState=new WeakMap(),invSeen=new WeakMap();
  let fixedAttacks=0,fixedHp=0,trimmed=0,lastFps=60;

  function arr(name){try{return typeof globalThis[name]!=='undefined'?globalThis[name]:eval(name)}catch(_){return null}}
  function livePhyl(b){try{return Array.isArray(E)&&E.some(o=>o&&!o.dead&&o.rbPhyl===b)}catch(_){return false}}
  function legitimateInv(e){
    if(!e||!(e.inv>0))return false;
    if(e.dv)return true;
    if(e.rbInvT>0)return true;
    if(e.rbSide){const t=invSeen.get(e)||now();invSeen.set(e,t);return now()-t<1300}
    return false;
  }
  function sanitizeEnemy(e){
    if(!e||e.dead)return;
    if(!Number.isFinite(e.mh)||e.mh<=0){const hp=Number.isFinite(e.hp)&&e.hp>0?e.hp:1;e.mh=Math.max(1,hp);fixedHp++}
    if(!Number.isFinite(e.hp)){e.hp=e.mh;fixedHp++}
    if(e.hp>e.mh*12&&!e.dv){e.hp=Math.max(1,e.mh);fixedHp++}
    if(e.rbInvT!=null&&!Number.isFinite(e.rbInvT)){e.rbInvT=0;e.inv=0;fixedHp++}
    if(e.rbInvT<=0&&e.rbInvT!=null&&!e.dv&&!e.rbSide&&e.inv>0){e.inv=0;fixedHp++}
    if(!e.boss&&e.inv>0){e.inv=0;fixedHp++}
    if(e.boss&&e.rbShield&&!livePhyl(e)){e.rbShield=0;fixedHp++}
    if(e.boss&&e.inv>0&&!legitimateInv(e)){e.inv=0;fixedHp++}
    if(e.hp<=0&&!e.dead){try{kill(e)}catch(_){e.dead=1}fixedHp++}
  }

  function tagNew(a,start,e,type){
    if(!Array.isArray(a))return;
    for(let i=start;i<a.length;i++){const q=a[i];if(!q)continue;q.scBossAttack=1;q.scBossOwner=e;q.scBossType=type;q.scBossBorn=typeof T==='number'?T:0}
  }
  function fallbackAttack(e,name,p){
    if(!e||e.dead)return;
    const target=p||(typeof P!=='undefined'?P:null);if(!target)return;
    const a=Math.atan2(target.y-e.y,target.x-e.x),mul=(e.bm||1),dmg=Math.max(12,(e.dmg||18)*.78);
    try{
      if(name==='charge'||name==='beam'||name==='fan'||name==='cross'){
        const count=name==='fan'?5:name==='cross'?4:1;
        for(let i=0;i<count;i++){const aa=name==='fan'?a+(i-2)*.28:name==='cross'?a+i*Math.PI/2:a;MK.push({x:e.x,y:e.y,a:aa,len:name==='charge'?600:760,w:name==='charge'?Math.max(42,e.r*1.35):50,d:dmg*mul,t:.55,t0:.55,L:1,dash:name==='charge'?e:0,scBossAttack:1,scBossOwner:e,scBossType:name})}
      }else if(name==='slam'||name==='meteor'||name==='around'){
        const n=name==='meteor'?5:name==='around'?6:1;
        for(let i=0;i<n;i++){const aa=i/Math.max(1,n)*Math.PI*2,rr=name==='around'?135:0;MK.push({x:(name==='meteor'?target.x+(Math.random()-.5)*340:target.x+Math.cos(aa)*rr),y:(name==='meteor'?target.y+(Math.random()-.5)*340:target.y+Math.sin(aa)*rr),rad:name==='slam'?e.r*1.8+60:52,d:dmg*mul,t:.62+i*.05,t0:.62+i*.05,scBossAttack:1,scBossOwner:e,scBossType:name})}
      }else if(name==='rings')RG.push({x:e.x,y:e.y,r:0,m:390,sp:235,h:0,d:Math.max(18,dmg*.7)*mul,scBossAttack:1,scBossOwner:e,scBossType:name});
      else {for(let i=-2;i<=2;i++){const aa=a+i*.16;EB.push({x:e.x,y:e.y,vx:Math.cos(aa)*190,vy:Math.sin(aa)*190,r:6,l:5,d:dmg*.65*mul,col:'#ff735d',scBossAttack:1,scBossOwner:e,scBossType:name})}}
      fixedAttacks++;try{if(typeof shake==='number')shake=Math.max(shake,5)}catch(_){}
    }catch(err){console.warn('[CombatFix fallback]',err)}
  }

  function installBossGuard(){
    const ai=window.SCAIDirector;if(!ai||typeof ai.boss!=='function'||ai.__scCombat29)return false;
    const old=ai.boss;
    ai.boss=function(e,dt,p){
      if(!e||e.dead)return old.apply(this,arguments);
      sanitizeEnemy(e);
      const brain=e.scBossBrain,preState=brain&&brain.state,preStep=brain&&brain.step||0,attack=preState==='execute'&&brain&&brain.combo?brain.combo[preStep]:null;
      const eb0=Array.isArray(EB)?EB.length:0,mk0=Array.isArray(MK)?MK.length:0,rg0=Array.isArray(RG)?RG.length:0;
      const out=old.apply(this,arguments);
      tagNew(EB,eb0,e,attack||'boss');tagNew(MK,mk0,e,attack||'boss');tagNew(RG,rg0,e,attack||'boss');
      const b=e.scBossBrain;
      if(b){
        if(!Number.isFinite(b.t))b.t=0;
        let rec=bossState.get(e);const t=now();if(!rec||rec.state!==b.state){rec={state:b.state,since:t};bossState.set(e,rec)}
        const age=t-rec.since;
        if((b.state==='windup'&&age>1800)||(b.state==='execute'&&age>700)){b.t=0}
        if(b.state==='execute'&&!b.combo){b.state='position';b.t=.25;b.step=0}
      }
      if(attack&&attack!=='summon'&&preState==='execute'){
        const made=(EB.length-eb0)+(MK.length-mk0)+(RG.length-rg0);
        if(made<=0)fallbackAttack(e,attack,p);
      }
      sanitizeEnemy(e);return out;
    };
    ai.__scCombat29=1;return true;
  }

  function installHitGuard(){
    if(typeof hit!=='function'||hit.__scCombat29)return false;
    const old=hit;
    const wrapped=function(e,d){
      if(e)sanitizeEnemy(e);const before=e&&Number.isFinite(e.hp)?e.hp:null,immune=e&&((e.rbShield&&livePhyl(e))||legitimateInv(e));
      const out=old.apply(this,arguments);
      if(e&&!e.dead&&before!=null&&Number.isFinite(d)&&d>0&&e.hp===before&&!immune){e.hp-=d;e.fl=.08;fixedHp++;if(e.hp<=0&&!e.dead)try{kill(e)}catch(_){e.dead=1}}
      return out;
    };wrapped.__scCombat29=1;hit=wrapped;return true;
  }

  function critical(q){return !!(q&&(q.scBossAttack||q.rb||q.dv||q.d>=100000||(q.dash&&q.dash.boss)))}
  function trimPriority(a,cap){
    if(!Array.isArray(a)||a.length<=cap)return 0;
    const crit=[],normal=[];for(const q of a)(critical(q)?crit:normal).push(q);
    const hard=Math.max(cap,Math.ceil(cap*1.35));const keepCrit=crit.slice(-hard),room=Math.max(0,cap-keepCrit.length),keep=keepCrit.concat(normal.slice(-room));
    const n=a.length-keep.length;if(n>0){a.length=0;a.push(...keep);trimmed+=n}return n;
  }
  function perfScale(){
    let f=60;try{if(Number.isFinite(fps))f=fps}catch(_){}lastFps=lastFps*.82+f*.18;
    if(lastFps<27)return .52;if(lastFps<34)return .64;if(lastFps<42)return .78;if(lastFps<50)return .90;return 1;
  }
  function optimize(){
    try{
      const p=window.SCDifficultyIntegrity&&SCDifficultyIntegrity.profile||{enemyShots:165,markers:38};const s=perfScale();
      const shotCap=Math.max(55,Math.floor((p.enemyShots||165)*s)),markCap=Math.max(16,Math.floor((p.markers||38)*Math.max(.72,s))),ringCap=Math.max(10,Math.ceil(markCap*.48));
      trimPriority(EB,shotCap);trimPriority(MK,markCap);trimPriority(RG,ringCap);
      if(Array.isArray(PA)&&PA.length>Math.floor(260*s+70))PA.splice(0,PA.length-Math.floor(260*s+70));
      if(Array.isArray(FX)&&FX.length>Math.floor(180*s+60))FX.splice(0,FX.length-Math.floor(180*s+60));
      if(Array.isArray(TX)&&TX.length>48)TX.splice(0,TX.length-48);
      if(Array.isArray(DS)&&DS.length>36)DS.splice(0,DS.length-36);
      if(Array.isArray(E))for(const e of E)sanitizeEnemy(e);
    }catch(err){console.warn('[CombatFix optimize]',err)}
  }

  installBossGuard();installHitGuard();
  const timer=setInterval(()=>{installBossGuard();installHitGuard();optimize()},120);
  addEventListener('pagehide',()=>clearInterval(timer),{once:true});
  window.SCCombatIntegrity={version:'29.0',optimize,sanitizeEnemy,get stats(){return{fixedAttacks,fixedHp,trimmed,fps:Math.round(lastFps)}}};
  console.log('[Mobile] Combat Integrity 29.0 enabled: boss attack watchdog, immortality guard and adaptive combat budgets.');
}catch(err){console.error('[Mobile Combat Integrity 29.0]',err)}
})();