(() => {
'use strict';
try{
  const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
  const RB={biomeCd:22,force:null,tide:null,ice:null,side:null,devFx:0,devCd:10};
  const bossName=(e)=>e?.nm||'BOSS';
  const diffMul=()=>Math.max(.7,Math.min(1.8,(typeof MZ!=='undefined'&&MZ[2])||1));

  function line(px,py,a,len,w,d,t=.85){
    MK.push({x:px,y:py,a,len,w,d,t,t0:t,L:1,rb:1});
  }
  function circle(px,py,r,d,t=.8){
    MK.push({x:px,y:py,rad:r,d,t,t0:t,rb:1});
  }
  function fx(px,py,r=80){try{FX.push({x:px,y:py,r,t:.25,ring:1})}catch(_){} }
  function msg(s){try{ban(s)}catch(_){} }
  function hurtQ(q,d){if(!q||q.dead)return;const old=P;try{P=q;hurt(d)}finally{P=old}}
  function livePhyl(b){return Array.isArray(E)&&E.some(o=>o&&!o.dead&&o.rbPhyl===b)}
  function nearestAlive(px,py,max=9999){let n=null,bd=max;for(const e of E){if(!e||e.dead||e.boss)continue;const d=Math.hypot(e.x-px,e.y-py);if(d<bd){bd=d;n=e}}return n}

  // ===== BIOME REALITY EVENTS =====
  const BIOME_NAMES=['FLORESTA VIVA','CEMITÉRIO DOS ECOS','PÂNTANO TÓXICO','RUÍNAS DE GELO','FÁBRICA INSTÁVEL'];
  function forestEvent(q){
    msg('🌿 FLORESTA VIVA · AS RAÍZES ACORDARAM');
    const base=Math.atan2(q.ddy||0,q.ddx||1);
    for(let i=0;i<5;i++){const a=base+(i-2)*.48;line(q.x-Math.cos(a)*260,q.y-Math.sin(a)*260,a,520,30,16*diffMul(),1.0+i*.08)}
    for(let i=0;i<5;i++){const a=i/5*PI*2,d=260;const e=spawn(8,q.x+Math.cos(a)*d,q.y+Math.sin(a)*d,0);if(e){e.rbRootWolf=1;e.sp*=1.12;e.hp*=.8;e.mh=e.hp}}
  }
  function cemeteryEvent(q){
    msg('👻 ECO DOS MORTOS · A HORDA VOLTA UMA VEZ');
    try{dark=Math.max(dark||0,7)}catch(_){}
    for(let i=0;i<6;i++){const a=i/6*PI*2,d=230+R()*80;const e=spawn(7,q.x+Math.cos(a)*d,q.y+Math.sin(a)*d,i<2);if(e){e.rbEcho=1;e.col='#b8d9ff';e.hp*=.62;e.mh=e.hp;e.sp*=1.18}}
    for(let i=0;i<10;i++){const a=i/10*PI*2;EB.push({x:q.x+Math.cos(a)*300,y:q.y+Math.sin(a)*300,vx:-Math.cos(a)*110,vy:-Math.sin(a)*110,r:6,l:5,d:10*diffMul(),col:'#bfe5ff'})}
  }
  function swampEvent(q){
    const a=R()*PI*2,d=70+R()*85;RB.tide={t:7,x:q.x+Math.cos(a)*d,y:q.y+Math.sin(a)*d,tick:0};
    msg('☣ MARÉ TÓXICA · CORRA PARA O LÍRIO VERDE');
    circle(RB.tide.x,RB.tide.y,82,0,1.2);
  }
  function iceEvent(q){
    RB.ice={t:7,dx:R()<.5?-1:1,tick:.4};
    msg('❄ BLIZZARD ESPELHADA · O GELO EMPURRA VOCÊ');
    for(let i=0;i<7;i++){const a=i/7*PI*2+.2;line(q.x+Math.cos(a)*310,q.y+Math.sin(a)*310,a+PI,620,18,14*diffMul(),.8+i*.12)}
  }
  function factoryEvent(q){
    const a=[0,PI/2,PI,PI*1.5][Math.floor(R()*4)];RB.force={t:7,ux:Math.cos(a),uy:Math.sin(a),p:70};
    msg('⚙ ESTEIRAS EM OVERDRIVE · MOVIMENTO FORÇADO');
    for(let i=-2;i<=2;i++){const off=i*95;line(q.x-360*Math.cos(a)+off*Math.cos(a+PI/2),q.y-360*Math.sin(a)+off*Math.sin(a+PI/2),a,720,15,13*diffMul(),1+i*.03)}
  }
  function triggerBiome(){
    if(!P||P.dead||RB.side?.active)return;
    const q=PL?.[0]||P;
    ([forestEvent,cemeteryEvent,swampEvent,iceEvent,factoryEvent][bi||0]||forestEvent)(q);
    RB.biomeCd=28+R()*15;
  }
  function biomeTick(dt){
    if(st!=='play'||!P)return;
    if(!RB.side?.active){RB.biomeCd-=dt;if(RB.biomeCd<=0)triggerBiome()}
    if(RB.force){RB.force.t-=dt;for(const q of PL||[]){if(q.dead||q.dT>0)continue;q.x+=RB.force.ux*RB.force.p*dt;q.y+=RB.force.uy*RB.force.p*dt}if(RB.force.t<=0)RB.force=null}
    if(RB.ice){RB.ice.t-=dt;RB.ice.tick-=dt;for(const q of PL||[]){if(q.dead||q.dT>0)continue;q.x+=RB.ice.dx*28*dt}if(RB.ice.tick<=0){RB.ice.tick=.7;const q=PL?.[0]||P;const sx=q.x+(R()<.5?-1:1)*(260+R()*80);line(sx,q.y-260,PI/2,520,14,12*diffMul(),.65)}if(RB.ice.t<=0)RB.ice=null}
    if(RB.tide){RB.tide.t-=dt;RB.tide.tick-=dt;if(RB.tide.tick<=0){RB.tide.tick=.7;for(const q of PL||[]){if(q.dead)continue;if(Math.hypot(q.x-RB.tide.x,q.y-RB.tide.y)>88)hurtQ(q,8*diffMul())}}if(RB.tide.t<=0)RB.tide=null}
    if(RB.devFx>0){RB.devFx-=dt;try{AB.fa=Math.sin(T*10)*.07*(RB.devFx>1?1:RB.devFx)}catch(_){} }else{try{if(Math.abs(AB.fa||0)<.08)AB.fa=0}catch(_){}}
    if(RB.side?.active){
      const s=RB.side;if(!s.boss||s.boss.dead||!E.includes(s.boss)){exitSide()}
      else for(const o of E)if(o&&!o.dead&&!o.boss)o.dead=1;
    }
    for(const e of E||[]){if(e?.boss&&e.rbShield&&!livePhyl(e)){e.rbShield=0;msg('💀 FILACTÉRIOS DESTRUÍDOS · LICH VULNERÁVEL')}}
  }

  // ===== 20 UNIQUE BOSS GIMMICKS =====
  const GIMMICK_NAMES=[
    'PRISÃO DE RAÍZES','TEIA EXECUTORA','FALHA TECTÔNICA','CORTE DA SOMBRA',
    'CEMITÉRIO ABERTO','GRITO DE REPULSÃO','CORRIDA DAS ABÓBORAS','FILACTÉRIOS IMPERIAIS',
    'LÍNGUA DO ANCIÃO','TRÊS CABEÇAS','CALDEIRÃO AMALDIÇOADO','MERGULHO DO LEVIATÃ',
    'BOLA DE NEVE TITÂNICA','PALÁCIO DE ESPELHOS','PRISMA REFLETOR','SOPRO DO ZERO',
    'LOCK-ON DE MÍSSEIS','SOBRECARGA TÉRMICA','POLARIDADE TESLA','REALITY BREAK'
  ];
  function bossGimmick(e,dt,p){
    if(!e||e.dead||e.helper)return;
    if(e.rbInvT>0){e.rbInvT-=dt;e.inv=Math.max(e.inv||0,.05);if(e.rbInvT<=0)e.inv=0}
    if(e.rbPrismT>0)e.rbPrismT-=dt;
    e.rbCd=(e.rbCd==null?5+R()*3:e.rbCd-dt);if(e.rbCd>0)return;
    const idx=(bi||0)*4+(e.boss-1),dmg=Math.max(12,e.dmg*.75),phase=e.hp/e.mh<.5?1:0;
    msg('⚠ '+bossName(e)+' · '+(GIMMICK_NAMES[idx]||'RUPTURA'));
    switch(idx){
      case 0:{ // Guardião Podre
        for(let i=0;i<6;i++){const a=i/6*PI*2+.2;line(p.x+Math.cos(a)*240,p.y+Math.sin(a)*240,a+PI,480,28,dmg,.9+i*.07)}
        break;
      }
      case 1:{ // Rainha Aranha
        for(let i=0;i<6;i++){const a=R()*PI*2,r=55+R()*150;circle(p.x+Math.cos(a)*r,p.y+Math.sin(a)*r,42,dmg*.75,.7+i*.12)}
        for(let i=0;i<4;i++){const a=i/4*PI*2;const s=spawn(1,p.x+Math.cos(a)*190,p.y+Math.sin(a)*190,0);if(s){s.sp*=1.5;s.col='#d65aff'}}
        break;
      }
      case 2:{ // Colosso
        for(let i=-2;i<=2;i++)line(p.x-360,p.y+i*75,0,720,30,dmg*1.1,.8+Math.abs(i)*.1);
        break;
      }
      case 3:{ // Ceifador
        const a=Math.atan2(p.y-e.y,p.x-e.x);e.x=p.x-Math.cos(a)*150;e.y=p.y-Math.sin(a)*150;fx(e.x,e.y,100);line(p.x-350,p.y,0,700,22,dmg, .7);line(p.x,p.y-350,PI/2,700,22,dmg,.9);
        break;
      }
      case 4:{ // Coveiro
        for(let i=0;i<6;i++){const a=i/6*PI*2,d=180+R()*50;const z=spawn(i%2?0:9,p.x+Math.cos(a)*d,p.y+Math.sin(a)*d,i<2);if(z){z.hp*=1.25;z.mh=z.hp}}
        circle(p.x,p.y,115,dmg,.95);break;
      }
      case 5:{ // Banshee
        for(const q of PL||[]){if(q.dead)continue;const ax=q.x-e.x,ay=q.y-e.y,dd=Math.hypot(ax,ay)||1;q.x+=ax/dd*85;q.y+=ay/dd*85}RG.push({x:e.x,y:e.y,r:0,m:420,sp:290,h:0,d:dmg});break;
      }
      case 6:{ // Headless
        for(let i=0;i<9;i++){const a=R()*PI*2,rr=260+R()*90;EB.push({x:p.x+Math.cos(a)*rr,y:p.y+Math.sin(a)*rr,vx:-Math.cos(a)*150,vy:-Math.sin(a)*150,r:9,l:5,d:dmg*.7,col:'#ff8a2a'})}break;
      }
      case 7:{ // Lich phylacteries
        if(!livePhyl(e)){e.rbShield=1;for(let i=0;i<3;i++){const a=i/3*PI*2,rr=170;const z=spawn(7,e.x+Math.cos(a)*rr,e.y+Math.sin(a)*rr,1);if(z){z.rbPhyl=e;z.em='💎';z.col='#b56cff';z.hp=z.mh=Math.max(120,e.mh*.035);z.sp*=.7}}}break;
      }
      case 8:{ // Frog tongue pull
        line(e.x,e.y,Math.atan2(p.y-e.y,p.x-e.x),Math.hypot(p.x-e.x,p.y-e.y),20,dmg,.65);for(const q of PL||[]){const ax=e.x-q.x,ay=e.y-q.y,dd=Math.hypot(ax,ay)||1;q.x+=ax/dd*75;q.y+=ay/dd*75}break;
      }
      case 9:{ // Hydra triple head
        const a=Math.atan2(p.y-e.y,p.x-e.x);for(let h=-1;h<=1;h++)for(let j=-2;j<=2;j++){const aa=a+h*.28+j*.08;EB.push({x:e.x,y:e.y,vx:Math.cos(aa)*175,vy:Math.sin(aa)*175,r:6,l:5,d:dmg*.62,col:h?'#73d34f':'#d8ff5a'})}break;
      }
      case 10:{ // Witch cauldron
        for(let i=0;i<5;i++){const a=R()*PI*2,r=70+R()*150;circle(p.x+Math.cos(a)*r,p.y+Math.sin(a)*r,52,dmg*.9,.75+i*.1)}try{dark=Math.max(dark||0,5)}catch(_){}break;
      }
      case 11:{ // Leviathan submerge
        e.rbInvT=1.35;e.inv=1;e.x=p.x+(R()<.5?-1:1)*360;e.y=p.y+(R()*160-80);fx(e.x,e.y,120);line(e.x,e.y,Math.atan2(p.y-e.y,p.x-e.x),760,e.r*.8,dmg*1.15,1.0);break;
      }
      case 12:{ // Yeti snowballs
        for(let i=-2;i<=2;i++){const a=Math.atan2(p.y-e.y,p.x-e.x)+i*.18;EB.push({x:e.x,y:e.y,vx:Math.cos(a)*(130+Math.abs(i)*18),vy:Math.sin(a)*(130+Math.abs(i)*18),r:13+Math.abs(i)*2,l:6,d:dmg*.8,col:'#e7f6ff'})}break;
      }
      case 13:{ // Ice lady mirrors
        for(let i=0;i<4;i++){const a=i/4*PI*2,rr=170;const z=spawn(7,e.x+Math.cos(a)*rr,e.y+Math.sin(a)*rr,0);if(z){z.rbMirror=1;z.em='❄️';z.col='#8fd9ff';z.hp=z.mh=Math.max(35,e.mh*.025);z.sp*=1.25}}break;
      }
      case 14:{ // Crystal golem prism shield
        e.rbPrismT=3.2;for(let i=0;i<16;i++){const a=i/16*PI*2;EB.push({x:e.x,y:e.y,vx:Math.cos(a)*165,vy:Math.sin(a)*165,r:6,l:5,d:dmg*.6,col:'#65e8ff'})}break;
      }
      case 15:{ // Dragon breath sweep
        const a=Math.atan2(p.y-e.y,p.x-e.x);for(let i=-3;i<=3;i++)line(e.x,e.y,a+i*.16,680,24,dmg*.85,.65+Math.abs(i)*.09);break;
      }
      case 16:{ // Sentinel missile lock
        for(let i=0;i<7;i++){const lead=(i+1)*18;circle(p.x+(p.ddx||0)*lead,p.y+(p.ddy||0)*lead,46,dmg*.85,.55+i*.16)}break;
      }
      case 17:{ // Furnace heat overload
        for(let i=0;i<4;i++){const a=i/4*PI*2+T;line(e.x,e.y,a,620,38,dmg,.8+i*.08)}circle(e.x,e.y,135,dmg*.8,1.0);break;
      }
      case 18:{ // Tesla polarity
        const ax=p.x-e.x,ay=p.y-e.y,dd=Math.hypot(ax,ay)||1,pull=R()<.5?1:-1;RB.force={t:2.2,ux:(e.x-p.x)/dd*pull,uy:(e.y-p.y)/dd*pull,p:135};for(let i=0;i<12;i++){const a=i/12*PI*2;EB.push({x:e.x,y:e.y,vx:Math.cos(a)*190,vy:Math.sin(a)*190,r:5,l:4,d:dmg*.65,col:'#60eaff'})}break;
      }
      case 19:break; // handled by full side-scroller
    }
    e.rbCd=Math.max(4.5,9.5-(phase?1.6:0)-Math.min(2,T/500));
  }

  // ===== SIDE-SCROLLER BOSS: NÚCLEO MESTRE =====
  function mountMode(){
    if(document.getElementById('rbMode'))return;
    const stl=document.createElement('style');stl.textContent='#rbMode{position:fixed;left:50%;top:70px;transform:translateX(-50%);z-index:80;pointer-events:none;background:rgba(6,9,18,.82);border:1px solid rgba(83,235,255,.55);border-radius:12px;padding:7px 13px;color:#dffcff;font:900 11px Nunito,system-ui;letter-spacing:.12em;opacity:0;transition:.18s}#rbMode.on{opacity:1}';document.head.appendChild(stl);
    const d=document.createElement('div');d.id='rbMode';d.textContent='⚡ REALITY BREAK · SIDE-SCROLLER · ↑ PULAR';document.body.appendChild(d);
  }
  function enterSide(e,p){
    if(RB.side?.active)return;
    mountMode();const ground=p.y+105;RB.side={active:1,boss:e,center:p.x,ground,y:ground-18,vy:0,onGround:1,jumpLock:0,atk:1.2,pattern:0,oldSilence:silence||0};
    p.y=RB.side.y;e.x=p.x+285;e.y=ground-105;e.rbSide=1;e.inv=.7;EB.length=0;RG.length=0;for(let i=MK.length-1;i>=0;i--)if(!MK[i].rb)MK.splice(i,1);
    silence=Math.max(silence||0,9999);document.getElementById('rbMode')?.classList.add('on');msg('⚡ REALITY BREAK · O JOGO VIROU SIDE-SCROLLER');shake=18;flash=.8;
  }
  function exitSide(){
    const s=RB.side;if(!s?.active)return;try{silence=s.oldSilence||0}catch(_){};for(let i=MK.length-1;i>=0;i--)if(MK[i].rb)MK.splice(i,1);document.getElementById('rbMode')?.classList.remove('on');RB.side=null;msg('↻ REALIDADE RESTAURADA · TOP-DOWN');
  }
  function sidePhysics(dt,p){
    const s=RB.side;if(!s)return;const ix=(joy.dx||0)+(joy.kx||0),iy=(joy.dy||0)+(joy.ky||0);
    p.x=clamp(p.x,s.center-385,s.center+385);
    if(iy<-.45&&s.onGround&&!s.jumpLock){s.vy=-385;s.onGround=0;s.jumpLock=1;try{sfx('dash')}catch(_){}}
    if(iy>-.18)s.jumpLock=0;s.vy+=980*dt;s.y+=s.vy*dt;const floor=s.ground-18;if(s.y>=floor){s.y=floor;s.vy=0;s.onGround=1}p.y=s.y;p.ddy=0;if(Math.abs(ix)>.1)p.ddx=Math.sign(ix);
  }
  function sidePattern(e,p){
    const s=RB.side,dm=Math.max(16,e.dmg*.72),left=s.center-405,ground=s.ground,phase=e.hp/e.mh<.35?2:e.hp/e.mh<.68?1:0,k=s.pattern++%5;
    if(k===0){msg('⚡ NÚCLEO MESTRE · PULE A ONDA');line(left,ground-58,0,810,24,dm,.95)}
    else if(k===1){msg('⚡ NÚCLEO MESTRE · COLUNAS DE PURGA');for(let i=0;i<3+phase;i++){const tx=s.center-300+R()*600;line(tx,ground, -PI/2,300,36,dm,.75+i*.13)}}
    else if(k===2){msg('⚡ NÚCLEO MESTRE · CHUVA DE SUCATA');for(let i=0;i<8+phase*3;i++){const tx=s.center-360+R()*720;EB.push({x:tx,y:ground-330-R()*120,vx:(R()-.5)*25,vy:215+R()*65,r:9,l:5,d:dm*.75,col:'#ff9a45'})}}
    else if(k===3){msg('⚡ NÚCLEO MESTRE · VARREDURA DE PAREDE');const fromLeft=R()<.5;line(fromLeft?left:s.center+405,ground-280,PI/2,310,42,dm*1.05,.95);for(let i=0;i<6;i++){const a=Math.atan2(p.y-e.y,p.x-e.x)+(i-2.5)*.12;EB.push({x:e.x,y:e.y,vx:Math.cos(a)*180,vy:Math.sin(a)*180,r:6,l:5,d:dm*.55,col:'#ff4f88'})}}
    else{msg('⚡ NÚCLEO MESTRE · CHÃO CORROMPIDO');line(left,ground-12,0,810,28,dm,.82);for(let i=0;i<5;i++){const tx=s.center-300+i*150;circle(tx,ground-22,34,dm*.7,.7+i*.1)}}
  }
  function sideBoss(e,dt,p){
    if(!RB.side?.active)enterSide(e,p);const s=RB.side;if(!s)return true;sidePhysics(dt,p);e.inv=Math.max(0,(e.inv||0)-dt);e.y=s.ground-115+Math.sin(T*1.8)*22;e.x=s.center+Math.sin(T*.72)*285;
    s.atk-=dt;if(s.atk<=0){sidePattern(e,p);const ph=e.hp/e.mh<.35?2:e.hp/e.mh<.68?1:0;s.atk=[3.2,2.65,2.15][ph]}
    if(Math.hypot(p.x-e.x,p.y-e.y)<e.r+p.r)hurt(e.dmg);return true;
  }

  // ===== DEV REALITY COMPILER =====
  function devExtra(e,dt,p){
    RB.devCd-=dt;if(RB.devCd>0)return;let n=0;try{n=typeof dvN==='function'?dvN(e):0}catch(_){};if(n<10){RB.devCd=7;return}
    RB.devCd=n>=15?8:11;RB.devFx=2.4;msg('👁 DEV · RECOMPILANDO A ARENA');const a=R()*PI;
    for(let i=-2;i<=2;i++)line(p.x-360*Math.cos(a)+i*78*Math.cos(a+PI/2),p.y-360*Math.sin(a)+i*78*Math.sin(a+PI/2),a,720,18,1e6,.75+Math.abs(i)*.08);
  }

  // ===== HOOKS =====
  if(typeof start==='function'){
    const oldStart=start;start=function(){const out=oldStart.apply(this,arguments);RB.biomeCd=20+R()*8;RB.force=RB.tide=RB.ice=null;RB.devFx=0;RB.devCd=10;if(RB.side?.active)exitSide();return out};
  }
  if(typeof end==='function'){
    const oldEnd=end;end=function(){if(RB.side?.active)exitSide();return oldEnd.apply(this,arguments)};
  }
  if(typeof camUpd==='function'){
    const oldCam=camUpd;camUpd=function(dt){const out=oldCam.apply(this,arguments);try{biomeTick(dt)}catch(err){console.warn('[Reality biome]',err)}return out};
  }
  if(typeof drawPW==='function'){
    const oldDrawPW=drawPW;drawPW=function(){
      if(RB.side?.active){const s=RB.side;x.save();x.fillStyle='rgba(15,25,38,.82)';x.fillRect(s.center-430,s.ground-4,860,130);x.strokeStyle='#56e8ff';x.lineWidth=5;x.beginPath();x.moveTo(s.center-430,s.ground);x.lineTo(s.center+430,s.ground);x.stroke();x.globalAlpha=.28;for(let i=-5;i<=5;i++){x.strokeStyle=i%2?'#ff4f88':'#56e8ff';x.beginPath();x.moveTo(s.center+i*80,s.ground);x.lineTo(s.center+i*80,s.ground+95);x.stroke()}x.restore()}
      if(RB.tide){x.save();x.fillStyle='rgba(86,255,125,.17)';x.strokeStyle='#72ff87';x.lineWidth=4;x.beginPath();x.arc(RB.tide.x,RB.tide.y,88,0,7);x.fill();x.stroke();x.fillStyle='#baffc4';x.font='900 11px Nunito';x.textAlign='center';x.fillText('ZONA SEGURA',RB.tide.x,RB.tide.y-98);x.restore()}
      return oldDrawPW.apply(this,arguments)
    };
  }
  if(typeof hit==='function'){
    const oldHit=hit;hit=function(e,d){
      if(e?.rbShield&&livePhyl(e)){try{FX.push({x:e.x,y:e.y,r:e.r*2,t:.15,ring:1})}catch(_){};return}
      if(e?.rbPrismT>0)d*=.35;
      const args=[...arguments];args[1]=d;return oldHit.apply(this,args)
    };
  }
  if(window.SCAIDirector&&typeof window.SCAIDirector.boss==='function'){
    const oldBoss=window.SCAIDirector.boss;
    window.SCAIDirector.boss=function(e,dt,p){
      try{
        if(e?.dv){devExtra(e,dt,p);return oldBoss.apply(this,arguments)}
        if(e&&bi===4&&e.boss===4&&!e.helper)return sideBoss(e,dt,p);
        bossGimmick(e,dt,p);
      }catch(err){console.warn('[Reality boss]',err)}
      return oldBoss.apply(this,arguments)
    };
  }

  window.SCRealityBreak={version:'10.0',biomes:5,bossGimmicks:20,sideScrollerBoss:'Núcleo Mestre'};
  console.log('[Mobile] Reality Break 10.0 enabled: biome reality events, 20 boss gimmicks and full side-scroller Master Core fight.');
}catch(err){console.error('[Reality Break 10.0]',err)}
})();
