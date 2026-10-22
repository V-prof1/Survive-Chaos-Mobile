(() => {
  'use strict';

  const CONTENT={
    relics:new Set(),pendingRelics:0,relicOpen:false,nextEvent:115,eventCount:0,lastT:0,bleedTick:0,eliteTick:0
  };
  const byId=id=>document.getElementById(id), clamp=(v,a,b)=>Math.max(a,Math.min(b,v));

  // ===== 8 NOVOS INIMIGOS =====
  const EN0=EN.length;
  const NEW_EN=[
    ['Carrasco',210,34,18,24,9,'#b43b46',6,1.8,'h','🪓'],
    ['Cultista Rubro',75,42,12,13,6,'#b73666',7,2.4,'a','🩸'],
    ['Espectro Carmesim',95,64,12,16,8,'#ff5470',9,1.8,'g','👁️'],
    ['Besouro Bombardeiro',68,92,13,0,7,'#e78b3a',10,1.7,'x','💣'],
    ['Caçador da Névoa',130,78,14,19,10,'#6572c8',12,1.5,'w','🐺'],
    ['Invocador Abissal',155,38,14,14,13,'#7041a8',14,1.2,'n','🔮'],
    ['Colosso Carmesim',520,26,23,35,22,'#8e2f38',16,.8,'h','🗿'],
    ['Arauto do Caos',190,48,15,20,17,'#e94bb7',18,1.0,'a','☄️']
  ];
  NEW_EN.forEach(d=>EN.push(d.slice(0,10)));

  const baseSpawn=spawn;
  spawn=function(k,px,py,el){
    const e=baseSpawn.apply(this,arguments);
    if(!e)return e;
    if(k>=EN0){const m=NEW_EN[k-EN0];e.em=m[10];e.contentName=m[0];e.contentMob=1}
    if(el&&!e.boss&&!e.__mutation)mutateElite(e);
    return e
  };

  // ===== 10 NOVOS UPGRADES =====
  const EXTRA_UPGRADES=[
    ['sc_critd','Ruptura Crítica','Críticos causam +15% de dano extra',5,p=>p.scCritDmg=(p.scCritDmg||0)+.15],
    ['sc_boss','Caçador de Titãs','+8% de dano contra bosses',5,p=>p.scBoss=(p.scBoss||0)+.08],
    ['sc_exec','Execução','+8% de dano contra inimigos abaixo de 30% de vida',4,p=>p.scExecute=(p.scExecute||0)+.08],
    ['sc_bleed','Munição Serrilhada','Acertos causam sangramento progressivamente mais forte',5,p=>p.scBleed=(p.scBleed||0)+1],
    ['sc_dashnova','Pulso de Dash','Dash libera uma explosão que causa dano ao redor',4,p=>p.scDashNova=(p.scDashNova||0)+1],
    ['sc_iron','Liga Reativa','Com menos de 50% de vida, recebe -5% de dano',5,p=>p.scIron=(p.scIron||0)+.05],
    ['sc_chain','Reator em Cadeia','Críticos podem gerar uma explosão elétrica',4,p=>p.scChain=(p.scChain||0)+.08],
    ['sc_scav','Catador de Guerra','Abates têm +3% de chance de derrubar moedas',5,p=>p.scScavenge=(p.scScavenge||0)+.03],
    ['sc_low','Frenesi Mortal','Com menos de 30% de vida, causa +10% de dano',4,p=>p.scLowDmg=(p.scLowDmg||0)+.10],
    ['sc_soul','Bateria de Almas','Cada abate carrega ainda mais a ULT',4,p=>p.scSoul=(p.scSoul||0)+.45]
  ];
  for(const u of EXTRA_UPGRADES)if(!U.some(q=>q[0]===u[0]))U.push(u);

  // ===== RELÍQUIAS RARAS =====
  const RELICS=[
    {id:'glass',icon:'💎',name:'Canhão de Vidro',desc:'+55% dano, mas -25% de vida máxima.',apply:p=>{p.dmg*=1.55;p.mhp*=.75;p.hp=Math.min(p.hp,p.mhp)}},
    {id:'hydra',icon:'🐉',name:'Câmara da Hidra',desc:'+2 projéteis, porém -12% dano.',apply:p=>{p.cnt+=2;p.dmg*=.88}},
    {id:'chrono',icon:'⏱️',name:'Motor Cronal',desc:'Dash recarrega 35% mais rápido e +12% velocidade.',apply:p=>{p.dashCd*=.65;p.sp*=1.12}},
    {id:'blood',icon:'🩸',name:'Coroa de Sangue',desc:'+2 Vampirismo e +20% dano com vida crítica.',apply:p=>{p.vamp+=2;p.scLowDmg=(p.scLowDmg||0)+.20}},
    {id:'critical',icon:'🎯',name:'Massa Crítica',desc:'+20% crítico e críticos causam +50% dano.',apply:p=>{p.crit+=.20;p.scCritDmg=(p.scCritDmg||0)+.50}},
    {id:'storm',icon:'⚡',name:'Ídolo da Tempestade',desc:'+3 níveis de Relâmpago e críticos encadeiam explosões.',apply:p=>{p.light+=3;p.scChain=(p.scChain||0)+.18}},
    {id:'void',icon:'🕳️',name:'Coração do Vazio',desc:'+3 lâminas orbitais e +2 Aura de Fogo.',apply:p=>{p.orb+=3;p.aura+=2}},
    {id:'fortress',icon:'🛡️',name:'Fortaleza Ambulante',desc:'+20% armadura e +80 de vida; -8% velocidade.',apply:p=>{p.armor+=.20;p.mhp+=80;p.hp+=80;p.sp*=.92}},
    {id:'slayer',icon:'☠️',name:'Juramento do Matador',desc:'+50% de dano contra bosses.',apply:p=>p.scBoss=(p.scBoss||0)+.50},
    {id:'collector',icon:'🧲',name:'Singularidade de Coleta',desc:'+35% XP e alcance do ímã dobrado.',apply:p=>{p.xpm*=1.35;p.mag*=2}},
    {id:'reactor',icon:'☢️',name:'Reator Instável',desc:'Dash causa uma explosão colossal e ganha +1 perfuração.',apply:p=>{p.scDashNova=(p.scDashNova||0)+3;p.pierce++}},
    {id:'greed',icon:'👑',name:'Crânio Dourado',desc:'Abates derrubam muito mais moedas e +12% crítico.',apply:p=>{p.scScavenge=(p.scScavenge||0)+.18;p.crit+=.12}}
  ];

  function mountRelicUI(){
    if(byId('contentRelic'))return;
    const d=document.createElement('div');d.id='contentRelic';d.innerHTML='<div class="contentRelicPanel"><small>RECOMPENSA DE BOSS</small><h2>ESCOLHA UMA RELÍQUIA</h2><p>Relíquias são únicas nesta run e podem transformar completamente sua build.</p><div id="contentRelicGrid"></div></div>';
    document.body.appendChild(d)
  }
  function openRelicDraft(){
    mountRelicUI();
    const pool=RELICS.filter(r=>!CONTENT.relics.has(r.id)).sort(()=>R()-.5).slice(0,3);
    if(!pool.length){CONTENT.pendingRelics=0;return}
    CONTENT.pendingRelics--;CONTENT.relicOpen=true;st='contentRelic';
    const g=byId('contentRelicGrid');g.innerHTML='';
    for(const r of pool){const b=document.createElement('button');b.className='contentRelicCard';b.innerHTML=`<span>${r.icon}</span><b>${r.name}</b><small>${r.desc}</small><i>RELÍQUIA ÚNICA</i>`;b.onclick=()=>{CONTENT.relics.add(r.id);for(const q of PL)r.apply(q);CONTENT.relicOpen=false;byId('contentRelic').classList.remove('on');st='play';try{sfx('boss2');ban('✦ RELÍQUIA: '+r.name)}catch(_){};};g.appendChild(b)}
    byId('contentRelic').classList.add('on')
  }

  // ===== MUTAÇÕES DE ELITE =====
  const MUT=[
    {id:'fort',icon:'🛡️',name:'Fortificado',apply:e=>{e.hp*=1.8;e.mh=e.hp;e.sp*=.78;e.col='#8fa4b8'}},
    {id:'rage',icon:'🔥',name:'Frenético',apply:e=>{e.sp*=1.38;e.dmg*=1.3;e.col='#ff4d5e'}},
    {id:'mirror',icon:'🔷',name:'Espelhado',apply:e=>{e.__mirrorCd=.8;e.col='#63d8ff'}},
    {id:'regen',icon:'💚',name:'Regenerador',apply:e=>{e.__regen=1;e.col='#65d47b'}},
    {id:'split',icon:'🧬',name:'Divisor',apply:e=>{e.__split=1;e.col='#cf72ff'}}
  ];
  function mutateElite(e){const m=MUT[Math.floor(R()*MUT.length)];e.__mutation=m.id;e.__mutationIcon=m.icon;e.__mutationName=m.name;m.apply(e)}
  const baseDrawE=drawE;
  drawE=function(e){baseDrawE.apply(this,arguments);if(e&&e.__mutationIcon&&!e.dead){x.save();x.textAlign='center';x.font='700 13px Nunito';x.lineWidth=3;x.strokeStyle='rgba(0,0,0,.9)';x.fillStyle='#fff';x.strokeText(e.__mutationIcon,e.x,e.y-e.r*1.8);x.fillText(e.__mutationIcon,e.x,e.y-e.r*1.8);x.restore()}};

  // ===== COMBATE DOS NOVOS UPGRADES =====
  const baseHit=hit;
  hit=function(e,d,sx,sy,crit){
    const q=P;
    if(q&&e){
      if(crit&&q.scCritDmg)d*=1+q.scCritDmg;
      if(e.boss&&q.scBoss)d*=1+q.scBoss;
      if(e.mh>0&&e.hp/e.mh<=.30&&q.scExecute)d*=1+q.scExecute;
      if(q.mhp>0&&q.hp/q.mhp<=.30&&q.scLowDmg)d*=1+q.scLowDmg;
    }
    const before=e&&e.hp,out=baseHit.call(this,e,d,sx,sy,crit);
    if(q&&e&&before>0&&!e.dead&&q.scBleed){e.__bleedT=3;e.__bleedD=Math.max(e.__bleedD||0,q.dmg*(.06+.035*q.scBleed))}
    if(q&&e&&before>0&&crit&&q.scChain&&R()<Math.min(.65,q.scChain)){if(!e.__chainLock){e.__chainLock=1;boom(e.x,e.y,48+q.scChain*70,q.dmg*(.6+q.scChain),90);e.__chainLock=0}}
    return out
  };

  const baseHurt=hurt;
  hurt=function(d){if(P&&P.mhp>0&&P.hp/P.mhp<.5&&P.scIron)d*=1-clamp(P.scIron,0,.35);return baseHurt.call(this,d)};

  const baseDash=dash;
  dash=function(){const q=P,ready=st==='play'&&q&&!q.dead&&q.dc<=0;const out=baseDash.apply(this,arguments);if(ready&&q.dT>0&&q.scDashNova){const lv=q.scDashNova;boom(q.x,q.y,70+lv*18,q.dmg*(.65+lv*.45),180+lv*25);FX.push({x:q.x,y:q.y,r:90+lv*20,t:.25,ring:1})}return out};

  const baseKill=kill;
  kill=function(e){
    const alive=e&&!e.dead,out=baseKill.apply(this,arguments);
    if(!alive||!e||!e.dead)return out;
    const q=P;
    if(q&&q.scSoul)ult=Math.min(100,ult+q.scSoul);
    if(q&&q.scScavenge&&R()<Math.min(.75,q.scScavenge)){const n=1+(R()<q.scScavenge*.45?1:0);for(let i=0;i<n;i++)G.push({x:e.x+R()*16-8,y:e.y+R()*16-8,v:1,k:2})}
    if(e.__mutation==='split'&&!e.boss){for(let i=0;i<2;i++){const c=spawn(1,e.x+R()*26-13,e.y+R()*26-13);if(c){c.hp=c.mh=Math.max(8,e.mh*.16);c.r=Math.max(7,e.r*.55);c.sp*=1.15;c.xp=1;c.em='🧬'}}}
    if(e.__mutation==='rage'&&R()<.25){for(let i=0;i<4;i++)G.push({x:e.x+R()*22-11,y:e.y+R()*22-11,v:1,k:0})}
    if(e.boss&&!e.helper&&!e.dv){CONTENT.pendingRelics++}
    return out
  };

  // ===== EVENTOS DE CAOS =====
  const EVENTS=[
    {name:'FENDA RUBRA',sub:'Uma muralha de inimigos rasgou a arena.',run:()=>ring(28+Math.min(45,Math.floor(T/90)*3))},
    {name:'INVASÃO DE ELITES',sub:'Três mutações entraram em campo.',run:()=>elite(3)},
    {name:'CHUVA DE SUPRIMENTOS',sub:'Dois baús caíram próximos.',run:()=>{for(let i=0;i<2;i++){const a=R()*PI*2,d=90+R()*110;G.push({x:P.x+Math.cos(a)*d,y:P.y+Math.sin(a)*d,v:1,k:4})}}},
    {name:'FEBRE DO OURO',sub:'O chão está cuspindo moedas.',run:()=>{for(let i=0;i<24;i++){const a=R()*PI*2,d=35+R()*180;G.push({x:P.x+Math.cos(a)*d,y:P.y+Math.sin(a)*d,v:1,k:2})}}},
    {name:'TEMPESTADE DO VAZIO',sub:'Não fique parado.',run:()=>{for(let i=0;i<12;i++){const a=R()*PI*2,d=70+R()*300;MK.push({x:P.x+Math.cos(a)*d,y:P.y+Math.sin(a)*d,t:.65+i*.12,t0:.65+i*.12,rad:48+R()*25,d:18+T/150})}}},
    {name:'CAÇADA DA NÉVOA',sub:'Uma matilha escolheu você.',run:()=>{for(let i=0;i<10;i++){const[a,b]=edge();spawn(EN0+4,a,b,i<2)}}},
    {name:'RITUAL ABISSAL',sub:'Invocadores cercaram a arena.',run:()=>{for(let i=0;i<6;i++){const[a,b]=edge();spawn(EN0+5,a,b,i===0)}}},
    {name:'RUPTURA DO CAOS',sub:'Tudo ficou pior de uma vez.',run:()=>{ring(22);elite(1);for(const q of PL)q.hp=Math.min(q.mhp,q.hp+q.mhp*.08)}}
  ];
  function triggerEvent(){const ev=EVENTS[Math.floor(R()*EVENTS.length)];CONTENT.eventCount++;ban('⚠ '+ev.name+' — '+ev.sub);try{sfx('boss2')}catch(_){};flash=Math.max(flash,.22);shake=Math.max(shake,7);ev.run()}

  function resetContent(){CONTENT.relics.clear();CONTENT.pendingRelics=0;CONTENT.relicOpen=false;CONTENT.nextEvent=105+R()*35;CONTENT.eventCount=0;CONTENT.bleedTick=0;CONTENT.eliteTick=0;const r=byId('contentRelic');if(r)r.classList.remove('on')}
  const baseStart=start;
  start=function(){resetContent();return baseStart.apply(this,arguments)};

  function combatTick(dt){
    CONTENT.bleedTick+=dt;CONTENT.eliteTick+=dt;
    if(CONTENT.bleedTick>=.12){const step=CONTENT.bleedTick;CONTENT.bleedTick=0;for(const e of E){if(e.dead)continue;if(e.__bleedT>0){e.__bleedT-=step;e.hp-=e.__bleedD*step;if(e.hp<=0&&!e.dead)kill(e)}}}
    if(CONTENT.eliteTick>=.10){const step=CONTENT.eliteTick;CONTENT.eliteTick=0;for(const e of E){if(e.dead||!e.el)continue;if(e.__mutation==='regen')e.hp=Math.min(e.mh,e.hp+e.mh*.006*step*10);if(e.__mutation==='mirror'){e.__mirrorCd=(e.__mirrorCd||0)-step;if(e.__mirrorCd<=0&&EB.length<430){e.__mirrorCd=1.4+R()*.7;aim(e,175,-.12,e.dmg*.7,5,'#63d8ff');aim(e,175,.12,e.dmg*.7,5,'#63d8ff')}}}}
    if(CONTENT.pendingRelics>0&&!CONTENT.relicOpen&&st==='play')openRelicDraft();
    if(st==='play'&&T>=CONTENT.nextEvent&&!bossE&&CF.g!==2&&CF.g!==5){CONTENT.nextEvent=T+105+R()*60;triggerEvent()}
  }

  let last=performance.now();
  function tick(now){const dt=Math.min(.05,Math.max(0,(now-last)/1000));last=now;try{if(st==='play')combatTick(dt)}catch(err){console.warn('[Mobile Content]',err)}requestAnimationFrame(tick)}
  mountRelicUI();requestAnimationFrame(tick);
  console.log('[Survive Chaos Mobile] Content Expansion loaded: 8 enemies, 10 upgrades, 12 relics, 5 elite mutations, 8 chaos events.');
})();
