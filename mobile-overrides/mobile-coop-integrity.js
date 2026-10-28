/* Survive Chaos Mobile — Local Co-op Integrity 22.0
   Two-player correctness layer. All behavior is gated behind local co-op. */
(() => {
'use strict';
if(window.__SC_MOBILE_COOP_INTEGRITY__)return;window.__SC_MOBILE_COOP_INTEGRITY__=true;
try{
  const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
  const party=()=>Array.isArray(PL)&&PL.length?PL:(P?[P]:[]);
  const alive=()=>party().filter(q=>q&&!q.dead);
  const coop=()=>typeof CO!=='undefined'&&CO.on&&party().length>1;
  const anchor=()=>alive()[0]||party()[0]||P;
  const distance=(a,b)=>Math.hypot((a?.x||0)-(b?.x||0),(a?.y||0)-(b?.y||0));
  const withPlayer=(q,fn)=>{if(!q)return;const old=P;P=q;try{return fn()}finally{P=old}};
  const others=()=>party().filter(q=>q&&q!==P);
  const healOthers=(fr,min=0)=>{if(!coop())return;for(const q of alive())if(q!==P)q.hp=Math.min(q.mhp,q.hp+Math.max(min,q.mhp*fr))};

  // ===== INPUT / GAMEPAD STABILITY =====
  function connectedPads(){try{return navigator.getGamepads?[...navigator.getGamepads()].filter(g=>g&&g.connected):[]}catch(_){return[]}}
  function mapPads(force=false){
    if(!coop())return;
    CO.gp=Array.isArray(CO.gp)?CO.gp:[null,null];const pads=connectedPads(),used=new Set();
    for(let i=0;i<2;i++)if(CO.sch[i]===3){
      const old=CO.gp[i],keep=pads.find(g=>g.index===old&&!used.has(g.index));
      if(keep){used.add(keep.index);continue}
      if(old!=null&&!force)continue; // never shift P2 into P1 just because P1 disconnected.
      const next=pads.find(g=>!used.has(g.index));CO.gp[i]=next?next.index:null;if(next)used.add(next.index);
    }else CO.gp[i]=null;
  }
  if(typeof setCO==='function'){
    const base=setCO;setCO=function(){const r=base.apply(this,arguments);CO.gp=[null,null];mapPads(true);return r};
  }
  if(typeof padIn==='function'){
    padIn=function(i,o){
      CO.gp=Array.isArray(CO.gp)?CO.gp:[null,null];if(CO.gp[i]==null)mapPads(true);
      let g=null;try{const all=navigator.getGamepads?[...navigator.getGamepads()]:[];g=all.find(q=>q&&q.connected&&q.index===CO.gp[i])||null}catch(_){}
      if(!g)return;
      const ax=k=>Math.abs(g.axes[k]||0)>.22?g.axes[k]:0,b=k=>!!(g.buttons[k]&&g.buttons[k].pressed),pb=CO.pb[i]||(CO.pb[i]=[]);
      o.mx=ax(0)+(b(15)?1:0)-(b(14)?1:0);o.my=ax(1)+(b(13)?1:0)-(b(12)?1:0);
      const rx=ax(2),ry=ax(3);if(Math.hypot(rx,ry)>.3){o.am=1;o.aa=Math.atan2(ry,rx);o.af=1}
      if((b(0)||b(5))&&!pb[0])dash();
      if((b(1)||b(2)||b(4))&&!pb[1])fireUlt();
      if(b(9)&&!pb[2]&&st==='play'){const z=document.getElementById('pz');z&&z.click()}
      pb[0]=b(0)||b(5);pb[1]=b(1)||b(2)||b(4);pb[2]=b(9);
    };
  }
  addEventListener('gamepadconnected',()=>mapPads(false));
  addEventListener('gamepaddisconnected',()=>setTimeout(()=>mapPads(false),0));

  // ===== DAMAGE / PROJECTILE OWNERSHIP =====
  function tagBullet(b){
    if(!coop()||!b||b.__scCoopTagged||!P||!party().includes(P))return b;
    const owner=P;let dmg=b.d;
    try{
      Object.defineProperty(b,'__scCoopTagged',{value:1,configurable:true});
      Object.defineProperty(b,'__scOwner',{value:owner,configurable:true});
      if(typeof dmg==='number')Object.defineProperty(b,'d',{configurable:true,enumerable:true,get(){if(coop()&&owner)P=owner;return dmg},set(v){dmg=v}});
    }catch(_){b.__scOwner=owner;b.__scCoopTagged=1}
    return b;
  }
  function armBullets(){
    if(!Array.isArray(B)||B.__scCoopPush)return;
    const raw=B.push;try{Object.defineProperty(B,'__scCoopPush',{value:1,configurable:true})}catch(_){B.__scCoopPush=1}
    B.push=function(){for(const b of arguments)tagBullet(b);return raw.apply(this,arguments)};
  }
  let hitDepth=0;
  if(typeof hit==='function'){
    const base=hit;hit=function(e){const owner=P;hitDepth++;try{const r=base.apply(this,arguments);if(coop()&&e&&owner){e.__scLastHitOwner=owner;if((owner.burn||0)>0)e.__scBurnOwner=owner}return r}finally{hitDepth--}};
  }
  if(typeof kill==='function'){
    const base=kill;kill=function(e){if(coop()&&!hitDepth&&e){const owner=(e.bn>0&&e.__scBurnOwner)||e.__scLastHitOwner;if(owner&&!owner.dead)P=owner}return base.apply(this,arguments)};
  }

  // Turret power-up belongs to the teammate who collected it.
  if(typeof usePW==='function'){
    const base=usePW;usePW=function(n){const owner=P,before=Array.isArray(TR)?TR.length:0,r=base.apply(this,arguments);if(coop()&&n===4&&Array.isArray(TR))for(let i=before;i<TR.length;i++){
      const t=TR[i];if(!t||t.__scOwnerBound)continue;t.__scOwner=owner;t.__scOwnerBound=1;let cd=t.cd;
      try{Object.defineProperty(t,'cd',{configurable:true,enumerable:true,get(){if(owner)P=owner;return cd},set(v){cd=v;if(owner)P=owner}})}catch(_){}
    }return r};
  }

  // Legacy global effect pass only executed offensive dash collision for one P.
  if(typeof ext==='function'){
    const base=ext;ext=function(dt){const first=P,r=base.apply(this,arguments);if(coop())for(const q of party())if(q&&q!==first&&!q.dead&&q.dT>0){
      withPlayer(q,()=>{try{puff(q.x,q.y,'#4fe0e8',1,30)}catch(_){};for(const e of E||[])if(e&&!e.dead&&e.oc<=0&&Math.hypot(e.x-q.x,e.y-q.y)<e.r+26){e.oc=.25;hit(e,q.dmg*3*dx,q.x,q.y)}});
    }P=first||anchor();return r};
  }

  // ===== SURVIVOR ANCHOR / CAMERA =====
  if(typeof upd==='function'){
    const base=upd;upd=function(dt){if(coop()&&P&&P.dead){const q=anchor();if(q)P=q}armBullets();const r=base.apply(this,arguments);if(coop())P=anchor()||P;return r};
  }
  if(typeof draw==='function'){
    const base=draw;draw=function(){const r=base.apply(this,arguments);if(coop())P=anchor()||P;return r};
  }
  if(typeof camUpd==='function'){
    const base=camUpd;camUpd=function(dt){const r=base.apply(this,arguments);if(coop()&&alive().length<2){const f=Math.min(1,Math.max(0,dt||0)*4);ZM+=(1-ZM)*f;Z=ZB*ZM}return r};
  }

  // ===== MOBILE SPECIAL MODES / REPLAY / ACTIVITIES =====
  const encounterMirror={
    'Pacto Rubro':q=>{q.dmg*=1.15;q.mhp*=.90;q.hp=Math.min(q.hp,q.mhp)},
    'Protocolo Titã':q=>{q.mhp+=40;q.hp=Math.min(q.mhp,q.hp+Math.max(40,q.mhp*.35));q.sp*=.95},
    'Overclock':q=>{q.rate*=.90;q.dashCd*=.90;q.armor=Math.max(0,(q.armor||0)-.04)},
    'Fornalha de Almas':q=>{q.scSoul=(q.scSoul||0)+.18},
    'Juramento do Caçador':q=>{q.scBoss=(q.scBoss||0)+.15},
    'Cache Proibido':q=>{q.crit=(q.crit||0)+.05}
  };
  function mirrorAscension(text){for(const q of others())if(q&&!q.dead){if(text.includes('+8% dano'))q.dmg*=1.08;else if(text.includes('+6% velocidade'))q.sp*=1.06;else if(text.includes('+4% crítico'))q.crit=(q.crit||0)+.04;else if(text.includes('vitalidade')){q.mhp+=20;q.hp=Math.min(q.mhp,q.hp+35)}}}

  const modMirror={
    'Duplo Cano':q=>{q.cnt=(q.cnt||1)+1;q.dmg*=.88},
    'Núcleo Instável':q=>{q.dmg*=1.28;q.rate*=1.12},
    'Mira Inteligente':q=>{q.crit=(q.crit||0)+.13;q.bounce=(q.bounce||0)+1},
    'Munição Fantasma':q=>{q.pierce=(q.pierce||0)+3;q.dmg*=.92},
    'Condutor Tesla':q=>{q.light=(q.light||0)+2;q.crit=(q.crit||0)+.08},
    'Câmara Rubra':q=>{q.vamp=(q.vamp||0)+1;q.dmg*=1.10}
  };

  let lastTempKey='',teamTemp=[];
  function revertTeamTemp(){for(const r of teamTemp){const q=r.q;if(!q)continue;for(const[k,m]of Object.entries(r.mods||{}))if(typeof q[k]==='number'&&m)q[k]/=m;for(const[k,v]of Object.entries(r.add||{}))if(typeof q[k]==='number')q[k]-=v}teamTemp=[];lastTempKey=''}
  function syncWorldTemp(){
    if(!coop()||!window.SCWorldshift?.state)return;const t=SCWorldshift.state.temp;if(!t)return;
    const key=(t.name||'')+'|'+Math.round((t.end||0)*100);if(key===lastTempKey)return;revertTeamTemp();lastTempKey=key;
    for(const q of others()){if(!q||q.dead)continue;for(const[k,m]of Object.entries(t.mods||{}))if(typeof q[k]==='number')q[k]*=m;for(const[k,v]of Object.entries(t.add||{}))q[k]=(q[k]||0)+v;teamTemp.push({q,mods:{...(t.mods||{})},add:{...(t.add||{})},end:t.end||0})}
  }
  function tempTick(){if(!teamTemp.length)return;const wr=window.SCWorldshift?.state;if(!wr?.active||teamTemp.every(r=>(T||0)>=r.end))revertTeamTemp()}

  if(typeof ban==='function'){
    const base=ban;ban=function(t){const r=base.apply(this,arguments);if(coop()&&typeof t==='string'){
      if(t.includes('RECOMPENSA COLETADA'))healOthers(.12);
      else if(t.includes('NÚCLEO ESTABILIZADO'))healOthers(.20);
      else if(t.includes('OPERAÇÃO CONCLUÍDA'))healOthers(.12,12);
      else if(t.includes('DESAFIO CONCLUÍDO'))healOthers(.10,10);
      else if(t.includes('ASCENSÃO ')&&t.includes('Bênção:'))mirrorAscension(t);
      else if(t.includes('PACTO ACEITO')){const name=t.split('·').slice(1).join('·').trim();const fn=encounterMirror[name];if(fn)for(const q of others())fn(q)}
      else if(t.includes('PUZZLE RESOLVIDO'))healOthers(.20);
      else if(t.includes('MOD INSTALADO')){const name=t.split('·').slice(1).join('·').trim();const fn=modMirror[name];if(fn)for(const q of others())fn(q)}
      else if(t.includes('ARMA TEMPORÁRIA'))setTimeout(syncWorldTemp,0);
      else if(t.includes('REALITY ROULETTE')&&t.includes('CALMARIA'))healOthers(.22);
    }return r};
  }

  // Worldshift choices: personal bonuses must apply to both local players.
  addEventListener('click',e=>{if(!coop())return;const b=e.target&&e.target.closest&&e.target.closest('.scWorldChoice');if(!b)return;const name=(b.querySelector('b')?.textContent||b.textContent||'').trim();setTimeout(()=>{
    if(name==='Temperar arma')for(const q of others())q.dmg*=1.12;
    else if(name==='Aliviar arma')for(const q of others()){q.sp*=1.10;q.rate*=.92}
    else if(name==='Tratamento completo')for(const q of others())q.hp=Math.min(q.mhp,q.hp+q.mhp*.55);
    else if(name==='Reator de ULT')for(const q of others())q.light=(q.light||0)+1;
    else if(name==='ACEITAR O PACTO')for(const q of others()){q.dmg*=1.22;q.mhp*=.72;q.hp=Math.min(q.hp,q.mhp)}
    else if(name==='CONTROLAR O CAOS')for(const q of others()){q.dmg*=1.10;q.sp*=1.08}
    else if(name==='SANTUÁRIO')for(const q of others()){q.hp=Math.min(q.mhp,q.hp+q.mhp*.42);q.iv=Math.max(q.iv||0,2)}
    else if(name==='FORTALEZA MÓVEL')healOthers(.30);
    else if(name==='CAÇA DE COROAS')healOthers(.20);
    syncWorldTemp();
  },0)},true);

  function mobileModeTick(dt){
    if(!coop()||st!=='play')return;
    const sm=window.SCModesPack?.state;
    if(sm?.active){
      // Blitz start bonuses were applied only to the current P.
      if(sm.mode===5)for(const q of party().slice(1))if(!q.__scBlitzCo){q.__scBlitzCo=1;q.sp*=1.10;q.dashCd*=.88}
      // King of the Arena: either teammate may hold the zone.
      if(sm.mode===4&&sm.zone){const p0=party()[0],p2=party()[1];if(p2&&!p2.dead&&distance(p2,sm.zone)<76&&(!p0||p0.dead||distance(p0,sm.zone)>=76))sm.zoneHold=clamp(sm.zoneHold+dt*1.45,0,sm.zoneNeed)}
      // Core Defense: either teammate can repair while standing near the core.
      if(sm.mode===7&&sm.core){const p0=party()[0],p2=party()[1];if(p2&&!p2.dead&&distance(p2,sm.core)<105&&(!p0||p0.dead||distance(p0,sm.core)>=105))sm.core.hp=Math.min(sm.core.max,sm.core.hp+dt*.65)}
      // Chaos Cycle bullet hell should threaten a separated second player too.
      if(sm.mode===3&&sm.law?.id==='hell'){sm.__scP2Hell=(sm.__scP2Hell||0)-dt;if(sm.__scP2Hell<=0){sm.__scP2Hell=.75;const p0=party()[0],p2=party()[1];if(p2&&!p2.dead&&p0&&distance(p0,p2)>300){const pool=(E||[]).filter(z=>z&&!z.dead&&!z.boss&&distance(z,p2)<430&&distance(z,p0)>300);for(let i=0;i<Math.min(2,pool.length);i++){const z=pool.splice(Math.floor(R()*pool.length),1)[0];try{radial(z,5,120,R()*PI*2,'#ff4f72')}catch(_){}}}}}
    }

    // Activities: both players may occupy beacon zones and collect supply caches.
    const ar=window.SCActivities?.run,op=ar?.op;if(ar?.active&&op){const p0=party()[0],p2=party()[1];if(p2&&!p2.dead){
      if(op.kind==='beacon'&&distance(p2,op)<68&&(!p0||p0.dead||distance(p0,op)>=68))op.hold=clamp(op.hold+dt*1.65,0,op.need);
      if(op.kind==='supply'&&Array.isArray(op.nodes))for(const n of op.nodes)if(!n.got&&distance(p2,n)<25){n.got=true;op.got=(op.got||0)+1;try{const cm=Math.max(.12,Math.min(1.5,(MZ&&MZ[4])||1));earned+=Math.max(1,Math.round(6*cm));sfx('coin');FX.push({x:n.x,y:n.y,r:55,t:.22,ring:1})}catch(_){}}
    }}

    // Worldshift interactive scenery can be activated by either teammate.
    const wr=window.SCWorldshift?.state;if(wr?.active&&Array.isArray(wr.objects)){const p0=party()[0],p2=party()[1];if(p2&&!p2.dead)for(const o of wr.objects){if(!o||o.done||distance(p2,o)>=42)continue;o.done=true;
      if(o.type==='explosive'){for(const z of E||[])if(z&&!z.dead&&distance(z,o)<150)withPlayer(p2,()=>hit(z,Math.max(45,p2.dmg*4),o.x,o.y))}
      else if(o.type==='altar'){p2.mhp=Math.max(40,p2.mhp-12);p2.hp=Math.min(p2.hp,p2.mhp);p2.dmg*=1.12}
      else if(o.type==='crystal')ult=Math.min(100,(ult||0)+45);
      else if(o.type==='turret'&&window.SCWorldshift?.addAlly)SCWorldshift.addAlly('drone',100);
      try{ban('OBJETO ATIVADO · '+String(o.type||'').toUpperCase())}catch(_){}
    }}
    tempTick();
  }

  // ===== WORLDSHIFT MODES: TEAM OBJECTIVES =====
  function worldModesTick(dt){
    if(!coop()||st!=='play'||!window.SCWorldModes?.state)return;const m=SCWorldModes.state,p0=party()[0],p2=party()[1];if(!p2||p2.dead)return;
    // Expedition/Escape checkpoint: either teammate can reach it.
    if(m.mode===2&&m.checkpoint&&distance(p2,m.checkpoint)<42&&(!p0||p0.dead||distance(p0,m.checkpoint)>=42)){
      m.escapeCount=(m.escapeCount||0)+1;m.checkpoint=null;p2.hp=Math.min(p2.mhp,p2.hp+p2.mhp*.10);try{ban('PONTO DE EXTRAÇÃO · '+m.escapeCount+'/7');sfx('coin')}catch(_){}
    }
    // Defense core regeneration from either player.
    if(m.mode===3&&m.core&&distance(p2,m.core)<100&&(!p0||p0.dead||distance(p0,m.core)>=100))m.core.hp=Math.min(m.core.max,m.core.hp+dt*.75);
    // Reality micro-escape checkpoint.
    if(m.mode===11&&m.micro==='escape'&&m.checkpoint&&distance(p2,m.checkpoint)<42&&(!p0||p0.dead||distance(p0,m.checkpoint)>=42)){
      m.checkpoint=null;try{withPlayer(p2,()=>window.SCWorldshift?.giveMod&&SCWorldshift.giveMod());ban('MICRO-MODO CONCLUÍDO · EXTRAÇÃO');sfx('coin')}catch(_){}
    }
  }

  // ===== REALITY BREAK SIDE-SCROLLER CO-OP =====
  const side={active:false,center:0,ground:0,players:new Map()};
  function sideInput(q){try{return typeof coIn==='function'?coIn(q.id):{mx:0,my:0}}catch(_){return{mx:0,my:0}}}
  function sideStep(q,dt){if(!q||q.dead||!side.active)return;let s=side.players.get(q);if(!s){s={vy:0,on:1,lock:0,y:side.ground-18};side.players.set(q,s)}const i=sideInput(q);q.x=clamp(q.x,side.center-385,side.center+385);if(i.my<-.45&&s.on&&!s.lock){s.vy=-385;s.on=0;s.lock=1;try{sfx('dash')}catch(_){}}if(i.my>-.18)s.lock=0;s.vy+=980*dt;s.y+=s.vy*dt;const floor=side.ground-18;if(s.y>=floor){s.y=floor;s.vy=0;s.on=1}q.y=s.y;q.ddy=0;if(Math.abs(i.mx)>.1)q.ddx=Math.sign(i.mx)}
  if(window.SCAIDirector&&typeof SCAIDirector.boss==='function'){
    const baseBoss=SCAIDirector.boss;SCAIDirector.boss=function(e,dt,p){
      if(!coop()||!e||bi!==4||e.boss!==4||e.helper)return baseBoss.apply(this,arguments);
      const primary=anchor()||p,was=!!document.getElementById('rbMode')?.classList.contains('on'),oldP=P;
      const ji={dx:joy.dx,dy:joy.dy,kx:joy.kx,ky:joy.ky};const ii=sideInput(primary);joy.dx=ii.mx||0;joy.dy=ii.my||0;joy.kx=joy.ky=0;P=primary;
      let out;try{out=baseBoss.call(this,e,dt,primary)}finally{joy.dx=ji.dx;joy.dy=ji.dy;joy.kx=ji.kx;joy.ky=ji.ky;P=oldP}
      const on=!!document.getElementById('rbMode')?.classList.contains('on');if(on&&!was){side.active=true;side.center=primary.x;side.ground=primary.y+18;side.players.clear();side.players.set(primary,{vy:0,on:1,lock:0,y:primary.y});for(const q of party())if(q!==primary&&!q.dead){q.x=clamp(q.x,side.center-330,side.center+330);q.y=side.ground-18;side.players.set(q,{vy:0,on:1,lock:0,y:q.y})}}
      if(on&&side.active){for(const q of party())sideStep(q,dt);for(const q of party())if(q!==primary&&!q.dead&&Math.hypot(q.x-e.x,q.y-e.y)<e.r+q.r)withPlayer(q,()=>hurt(e.dmg))}
      else if(side.active){side.active=false;side.players.clear()}
      return out;
    };
  }

  // ===== RUN LIFECYCLE =====
  let lastFrame=performance.now();
  function auxLoop(now){const dt=Math.min(.05,Math.max(0,(now-lastFrame)/1000));lastFrame=now;try{if(coop()){mobileModeTick(dt);worldModesTick(dt);if(P&&P.dead)P=anchor()||P}}catch(err){console.warn('[Mobile Co-op aux]',err)}requestAnimationFrame(auxLoop)}
  requestAnimationFrame(auxLoop);

  if(typeof start==='function'){
    const base=start;start=function(){revertTeamTemp();side.active=false;side.players.clear();const r=base.apply(this,arguments);armBullets();CO.gp=[null,null];mapPads(true);
      if(coop()&&window.SCModesPack?.state?.mode===5)for(const q of party().slice(1)){q.__scBlitzCo=1;q.sp*=1.10;q.dashCd*=.88}
      return r};
  }
  if(typeof end==='function'){
    const base=end;end=function(){revertTeamTemp();side.active=false;side.players.clear();return base.apply(this,arguments)};
  }

  armBullets();mapPads(true);
  window.SCCoopIntegrity={version:'22.0',party,alive,anchor,mapPads,armBullets};
  console.log('[Mobile] Local Co-op Integrity 22.0 active');
}catch(err){console.warn('[Mobile Co-op Integrity 22.0]',err)}
})();
