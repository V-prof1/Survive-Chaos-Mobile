/* ©criado por Vitor Ag/Nyx - 2026 */
/* ©criado por Vitor Ag/Nyx - 2026 */
/* ©criado por Vitor Ag/Nyx - 2026 */
(() => {
  'use strict';
  const PRO={active:false,lastT:0,comboTier:0,nextBreak:200,nearChain:0,nearT:0,nearTotal:0,perfectDash:0,secondWind:false,boss:null,nextDirector:80,lastAssist:-999,timers:[],scan:0,announceTimer:0};
  const byId=id=>document.getElementById(id),clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
  function mountUI(){
    if(byId('proCombat'))return;
    const hud=byId('hud'); if(!hud)return;
    hud.insertAdjacentHTML('beforeend','<div id="proCombat" aria-hidden="true"><div class="proCombatTop"><span id="proGrade">FLOW</span><b id="proCombo">COMBO 0</b><span id="proMulti">×1.00</span></div><div class="proMeter"><i id="proMeterFill"></i></div><div id="proNear"></div></div><div id="proBossPhase"></div>');
    document.body.insertAdjacentHTML('beforeend','<div id="proAnnouncer" aria-hidden="true"><b id="proAnnTitle"></b><span id="proAnnSub"></span></div>');
  }
  function announce(title,sub='',tone=''){
    mountUI(); const box=byId('proAnnouncer'); if(!box)return;
    byId('proAnnTitle').textContent=title; byId('proAnnSub').textContent=sub; box.className=tone?`on ${tone}`:'on';
    clearTimeout(PRO.announceTimer); PRO.announceTimer=setTimeout(()=>box.className='',1250);
  }
  function resetRun(){
    PRO.active=true; PRO.comboTier=0; PRO.nextBreak=200; PRO.nearChain=0; PRO.nearT=0; PRO.nearTotal=0; PRO.perfectDash=0; PRO.secondWind=false; PRO.boss=null; PRO.nextDirector=80; PRO.lastAssist=-999; PRO.timers.length=0; PRO.scan=0;
    const p=byId('proBossPhase'); if(p)p.className='';
  }
  function comboRank(c){if(c>=100)return['S','APOCALIPSE'];if(c>=50)return['A','DOMÍNIO'];if(c>=25)return['B','MASSACRE'];if(c>=10)return['C','AQUECENDO'];return['D','FLOW'];}
  function rewardCombo(tier){
    if(!P||P.dead)return;
    const cfg={1:{ult:4,frenzy:.55,text:'FLOW ATIVO',sub:'Cadência acelerada'},2:{ult:7,frenzy:.9,text:'MASSACRE',sub:'+ ULT · ritmo aumentado'},3:{ult:11,frenzy:1.35,text:'DOMÍNIO',sub:'Cura leve · + ULT'},4:{ult:16,frenzy:2,text:'APOCALIPSE',sub:'O caos está do seu lado'}}[tier];
    if(!cfg)return; ult=Math.min(100,ult+cfg.ult); PW.fr=Math.max(PW.fr||0,cfg.frenzy);
    if(tier>=3)P.hp=Math.min(P.mhp,P.hp+P.mhp*(tier===4?.08:.035));
    FX.push({x:P.x,y:P.y,r:75+tier*22,t:.28,ring:1}); shake=Math.max(shake,2+tier*1.4); announce(cfg.text,cfg.sub,tier===4?'danger':'good');
  }
  function chaosBreak(){
    if(!P||P.dead)return; PRO.nextBreak+=100; ult=Math.min(100,ult+18); PW.fr=Math.max(PW.fr||0,2.2); P.hp=Math.min(P.mhp,P.hp+P.mhp*.07);
    announce(`CHAOS BREAK ×${cmb}`,'Onda de choque · ULT carregando','danger'); FX.push({x:P.x,y:P.y,r:180,t:.38,ring:1}); boom(P.x,P.y,165,Math.max(18,P.dmg*2.2)*dx,220); flash=Math.max(flash,.22); shake=Math.max(shake,10);
  }
  const baseKill=kill;
  kill=function(e){const wasDead=!e||!!e.dead,out=baseKill.apply(this,arguments);if(!wasDead&&e&&e.dead&&st==='play'){const tier=cmb>=100?4:cmb>=50?3:cmb>=25?2:cmb>=10?1:0;if(tier>PRO.comboTier){PRO.comboTier=tier;rewardCombo(tier)}if(cmb>=PRO.nextBreak)chaosBreak()}return out};
  const baseHit=hit;
  hit=function(e,d,sx,sy,crit){const before=e&&e.hp,out=baseHit.apply(this,arguments);if(st==='play'&&e&&before>0){if(crit){if(!LQ)puff(e.x,e.y,'#ffd45a',e.boss?5:3,120);if(e.boss)shake=Math.max(shake,3.5)}const heavy=P&&d>=Math.max(30,P.dmg*4);if(heavy){FX.push({x:e.x,y:e.y,r:Math.min(75,22+Math.sqrt(d)*3),t:.12,ring:1});shake=Math.max(shake,e.boss?4:2.5)}}return out};
  const baseDash=dash;
  dash=function(){const q=P,ready=st==='play'&&q&&!q.dead&&q.dc<=0;let danger=0;if(ready){for(const e of E)if(!e.dead&&Math.hypot(e.x-q.x,e.y-q.y)<105+e.r)danger++;for(const b of EB)if(b.l>0&&Math.hypot(b.x-q.x,b.y-q.y)<80+(b.r||5))danger+=1.25}
    const out=baseDash.apply(this,arguments);if(ready&&q.dT>0&&danger>=3){PRO.perfectDash++;const gain=Math.min(9,2+Math.floor(danger));ult=Math.min(100,ult+gain);cmbT=Math.max(cmbT,2.1);PW.fr=Math.max(PW.fr||0,.55);if(danger>=5){for(const b of EB)if(b.l>0&&Math.hypot(b.x-q.x,b.y-q.y)<72+(b.r||5))b.l=0}FX.push({x:q.x,y:q.y,r:90,t:.24,ring:1});announce('PERFECT DASH',`+${gain}% ULT · projéteis desviados`,'good')}return out};
  const baseHurt=hurt;
  hurt=function(d){const q=P,hp0=q&&q.hp,out=baseHurt.apply(this,arguments);if(q&&hp0>q.hp){PRO.nearChain=0;PRO.nearT=0;const r0=hp0/Math.max(1,q.mhp),r1=q.hp/Math.max(1,q.mhp);if(!PRO.secondWind&&CF.g!==3&&r0>.2&&r1<=.2&&q.hp>0){PRO.secondWind=true;q.dc=0;q.iv=Math.max(q.iv,.9);PW.fr=Math.max(PW.fr||0,1.1);ult=Math.min(100,ult+12);announce('ADRENALINA','Dash recarregado · proteção breve · + ULT','danger')}}return out};
  function schedule(seconds,fn){PRO.timers.push({t:seconds,fn})}
  function bossPhase(e,phase){
    if(!e||e.dead||e.dv||e.__scPhase>=phase)return;e.__scPhase=phase;const phaseEl=byId('proBossPhase');
    if(phase===2){e.sp*=1.08;e.dmg*=1.08;announce('BOSS // FASE 2',`${e.nm||'Chefe'} ficou mais agressivo`,'boss')}else{e.sp*=1.11;e.dmg*=1.12;announce('BOSS // FASE FINAL',`${e.nm||'Chefe'} entrou em fúria`,'danger')}
    if(phaseEl){phaseEl.textContent=`FASE ${phase}/3`;phaseEl.className=`on p${phase}`}flash=Math.max(flash,phase===3?.42:.25);shake=Math.max(shake,phase===3?13:9);FX.push({x:e.x,y:e.y,r:e.r+80,t:.65,ring:1});
    schedule(.72,()=>{if(st!=='play'||e.dead||!E.includes(e)||EB.length>440)return;const n=phase===3?16:10,sp=phase===3?170:135;radial(e,n,sp,R()*PI*2,phase===3?'#ff4d6d':'#ffb340');if(phase===3){aim(e,205,-.18,e.dmg*.72,5,'#ff4d6d');aim(e,205,0,e.dmg*.72,5,'#ff4d6d');aim(e,205,.18,e.dmg*.72,5,'#ff4d6d')}})
  }
  function trackBoss(){
    const e=bossE;if(!e||e.dead||e.dv){PRO.boss=null;const phaseEl=byId('proBossPhase');if(phaseEl)phaseEl.className='';return}
    if(PRO.boss!==e){PRO.boss=e;e.__scPhase=1;const phaseEl=byId('proBossPhase');if(phaseEl){phaseEl.textContent='FASE 1/3';phaseEl.className='on p1'}announce('BOSS ENCOUNTER',e.nm||'A ameaça chegou','boss')}
    const ratio=e.hp/Math.max(1,e.mh);if(ratio<=.33)bossPhase(e,3);else if(ratio<=.66)bossPhase(e,2)
  }
  function nearMissScan(dt){
    PRO.scan+=dt;if(PRO.scan<.04||!P||P.dead)return;PRO.scan=0;
    for(const b of EB){if(b.__scNear||b.l<=0)continue;const rr=(b.r||5)+(P.r||12),dx0=b.x-P.x,dy0=b.y-P.y,d2=dx0*dx0+dy0*dy0,max=rr+18;if(d2>rr*rr&&d2<max*max){b.__scNear=1;PRO.nearChain++;PRO.nearTotal++;PRO.nearT=2.2;ult=Math.min(100,ult+.45);if(cmb>0)cmbT=Math.max(cmbT,1.05);if(PRO.nearChain%5===0)announce(`NEAR MISS ×${PRO.nearChain}`,'Esquiva precisa · ULT carregada','good')}}
  }
  function director(){
    if(st!=='play'||!P||P.dead||T<PRO.nextDirector)return;PRO.nextDirector=T+65+R()*20;if(bossE||CF.g===2||CF.g===5)return;
    const live=PL.filter(q=>!q.dead);if(!live.length)return;const hp=live.reduce((a,q)=>a+q.hp/Math.max(1,q.mhp),0)/live.length;
    if(hp<.28&&T-PRO.lastAssist>120){PRO.lastAssist=T;const a=R()*PI*2;G.push({x:P.x+Math.cos(a)*95,y:P.y+Math.sin(a)*95,v:1,k:1});announce('SUPRIMENTO DE EMERGÊNCIA','Vida crítica: kit médico enviado','good');return}
    if((cmb>=25||hp>.82)&&E.length<260){elite(1);announce('PRESSÃO AUMENTOU','Um inimigo elite entrou na arena','boss');return}
    if(!CF.i&&E.length<150&&R()<.45){ring(8+Math.min(18,Math.floor(T/180)*2));announce('NOVA ONDA','O caos não vai deixar você respirar')}
  }
  function updateHUD(){
    mountUI();const box=byId('proCombat');if(!box)return;const rank=comboRank(cmb),visible=st==='play'&&(cmb>=5||PRO.nearChain>0);box.classList.toggle('on',visible);box.dataset.rank=rank[0];
    byId('proGrade').textContent=rank[0];byId('proCombo').textContent=cmb>=5?`COMBO ${cmb}`:rank[1];byId('proMulti').textContent=`×${cm().toFixed(2)}`;
    const progress=cmb<10?cmb/10:cmb<25?(cmb-10)/15:cmb<50?(cmb-25)/25:cmb<100?(cmb-50)/50:1;byId('proMeterFill').style.width=`${clamp(progress,0,1)*100}%`;
    const near=byId('proNear');near.textContent=PRO.nearChain>0?`NEAR MISS ×${PRO.nearChain}`:'';near.classList.toggle('on',PRO.nearChain>0)
  }
  let last=performance.now();
  function tick(now){
    const dt=Math.min(.05,Math.max(0,(now-last)/1000));last=now;
    try{mountUI();if((st==='intro'||st==='play')&&(!PRO.active||T+.5<PRO.lastT))resetRun();if(st==='menu'||st==='over')PRO.active=false;PRO.lastT=typeof T==='number'?T:0;
      if(st==='play'&&PRO.active){if(cmb===0){PRO.comboTier=0;PRO.nextBreak=200}if(PRO.nearT>0){PRO.nearT-=dt;if(PRO.nearT<=0)PRO.nearChain=0}
        for(let i=PRO.timers.length-1;i>=0;i--){const t=PRO.timers[i];t.t-=dt;if(t.t<=0){PRO.timers.splice(i,1);try{t.fn()}catch(_){}}}
        nearMissScan(dt);trackBoss();director()}
      updateHUD()
    }catch(err){console.warn('[Survive Chaos Mobile Pro]',err)}
    requestAnimationFrame(tick)
  }
  mountUI();requestAnimationFrame(tick)
})();