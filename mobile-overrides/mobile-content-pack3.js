(() => {
'use strict';
try{
  const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
  const byId=id=>document.getElementById(id);

  const CP={
    version:'3.0',started:false,nextContract:55,contract:null,contractsDone:0,
    nextAssault:135,assaultCount:0,sigils:new Set(),sigilOpen:false,lastT:0,
    noHitSince:0,lastHurtAt:-999,packKills:0,eliteKills:0,lastMilestone:-1
  };

  // ===== 6 NEW ENDGAME ENEMIES =====
  const EN_START=EN.length;
  const PACK_EN=[
    ['Lâmina Fantasma',115,88,11,18,9,'#85d7ff',12,1.3,'g','🗡️'],
    ['Bruto de Ferrugem',360,29,22,31,17,'#a55f3d',15,.9,'h','⚙️'],
    ['Oráculo do Vazio',145,41,14,17,14,'#9166ff',17,1.1,'n','🔻'],
    ['Carrapato Prismático',82,108,10,12,8,'#59f0d0',11,1.5,'x','💠'],
    ['Artilheiro Caótico',175,37,15,21,15,'#ffb04a',18,1.0,'a','🎯'],
    ['Guardião do Abismo',690,24,26,39,28,'#4b3b8d',22,.7,'h','🜏']
  ];
  PACK_EN.forEach(d=>EN.push(d.slice(0,10)));

  const prevSpawn=spawn;
  spawn=function(k,px,py,el){
    const e=prevSpawn.apply(this,arguments);
    if(!e)return e;
    if(k>=EN_START&&k<EN_START+PACK_EN.length){
      const m=PACK_EN[k-EN_START];
      e.scPack3=1;e.scPack3Name=m[0];e.scPack3Icon=m[10];
      if(k===EN_START+5){e.hp*=1.18;e.mh=e.hp;e.dmg*=1.08;e.scJuggernaut=1}
    }
    return e;
  };

  const prevDrawE=drawE;
  drawE=function(e){
    prevDrawE.apply(this,arguments);
    if(!e||!e.scPack3Icon||e.dead)return;
    x.save();x.textAlign='center';x.font='700 12px Nunito';x.lineWidth=3;
    x.strokeStyle='rgba(0,0,0,.85)';x.fillStyle='#fff';
    x.strokeText(e.scPack3Icon,e.x,e.y-e.r*1.72);x.fillText(e.scPack3Icon,e.x,e.y-e.r*1.72);x.restore();
  };

  // ===== RUN SIGILS =====
  const SIGILS=[
    {id:'fury',icon:'🔥',name:'Sigilo da Fúria',desc:'+9% de dano durante esta run.',apply:p=>p.dmg*=1.09},
    {id:'bulwark',icon:'🛡️',name:'Sigilo do Bastião',desc:'+45 de vida máxima e cura 45.',apply:p=>{p.mhp+=45;p.hp=Math.min(p.mhp,p.hp+45)}},
    {id:'kinetic',icon:'💨',name:'Sigilo Cinético',desc:'+7% de velocidade de movimento.',apply:p=>p.sp*=1.07},
    {id:'pierce',icon:'🏹',name:'Sigilo Perfurante',desc:'+1 perfuração.',apply:p=>p.pierce++},
    {id:'storm',icon:'⚡',name:'Sigilo da Tempestade',desc:'+1 nível de Relâmpago.',apply:p=>p.light++},
    {id:'blood',icon:'🩸',name:'Sigilo Vampírico',desc:'+1 nível de Vampirismo.',apply:p=>p.vamp++},
    {id:'focus',icon:'🎯',name:'Sigilo do Foco',desc:'+7% de chance crítica.',apply:p=>p.crit+=.07},
    {id:'orbit',icon:'🌀',name:'Sigilo Orbital',desc:'+1 lâmina orbital.',apply:p=>p.orb++}
  ];

  function mountSigilUI(){
    if(byId('scSigilDraft'))return;
    const d=document.createElement('div');d.id='scSigilDraft';
    d.innerHTML='<div class="scSigilPanel"><small>CONTRATO DE CAOS · RECOMPENSA</small><h2>ESCOLHA UM SIGILO</h2><p>O efeito dura até o fim desta partida.</p><div id="scSigilGrid"></div></div>';
    document.body.appendChild(d);
  }

  function openSigilDraft(){
    if(CP.sigilOpen)return;
    mountSigilUI();
    const pool=SIGILS.filter(s=>!CP.sigils.has(s.id)).sort(()=>R()-.5).slice(0,3);
    if(!pool.length)return;
    CP.sigilOpen=true;
    const prevState=st;st='scSigil';
    const g=byId('scSigilGrid');g.innerHTML='';
    for(const s of pool){
      const b=document.createElement('button');b.className='scSigilCard';
      b.innerHTML=`<span>${s.icon}</span><b>${s.name}</b><small>${s.desc}</small>`;
      b.onclick=()=>{
        CP.sigils.add(s.id);for(const p of PL)s.apply(p);
        CP.sigilOpen=false;byId('scSigilDraft').classList.remove('on');
        st=prevState==='pause'?'pause':'play';
        try{sfx('lvl');ban('✦ '+s.name.toUpperCase())}catch(_){}
      };
      g.appendChild(b);
    }
    byId('scSigilDraft').classList.add('on');
  }

  // ===== CHAOS CONTRACTS =====
  const CONTRACTS=[
    {id:'kills',icon:'☠️',name:'Extermínio',make:()=>({goal:32+Math.min(28,CP.contractsDone*4),value:0}),desc:c=>`Elimine ${c.goal} inimigos.`,onKill:(c,e)=>{if(!e.boss)c.value++}},
    {id:'elite',icon:'👹',name:'Caçador de Elites',make:()=>({goal:3+Math.min(4,Math.floor(CP.contractsDone/2)),value:0}),desc:c=>`Elimine ${c.goal} elites.`,onKill:(c,e)=>{if(e.el&&!e.boss)c.value++}},
    {id:'pack',icon:'🜏',name:'Ruptura Hostil',make:()=>({goal:8+Math.min(8,CP.contractsDone),value:0}),desc:c=>`Elimine ${c.goal} criaturas da Ruptura.`,onKill:(c,e)=>{if(e.scPack3)c.value++}},
    {id:'survive',icon:'⏱️',name:'Sangue Frio',make:()=>({goal:38+Math.min(22,CP.contractsDone*2),value:0,start:T}),desc:c=>`Sobreviva ${c.goal}s sem sofrer dano.`,tick:c=>{const since=Math.max(c.start,CP.lastHurtAt);c.value=Math.max(0,Math.floor(T-since))}}
  ];

  function contractTemplate(){
    const options=CONTRACTS.filter(q=>!(CP.contract&&q.id===CP.contract.id));
    return options[Math.floor(R()*options.length)];
  }

  function startContract(){
    if(st!=='play'||CP.contract)return;
    const t=contractTemplate(),data=t.make();
    CP.contract={...data,id:t.id,icon:t.icon,name:t.name,desc:t.desc,onKill:t.onKill,tick:t.tick};
    try{ban('CONTRATO: '+t.name.toUpperCase())}catch(_){}
    updateContractUI();
  }

  function contractComplete(){
    const c=CP.contract;if(!c)return;
    CP.contractsDone++;CP.contract=null;
    for(const p of PL)p.hp=Math.min(p.mhp,p.hp+Math.max(16,p.mhp*.12));
    try{ult=Math.min(100,ult+18)}catch(_){}
    try{
      for(let i=0;i<10+Math.min(12,CP.contractsDone*2);i++){
        const a=R()*PI*2,d=20+R()*75;
        G.push({x:P.x+Math.cos(a)*d,y:P.y+Math.sin(a)*d,v:1,k:2});
      }
      sfx('boss2');ban('✓ CONTRATO CONCLUÍDO');
    }catch(_){}
    CP.nextContract=T+70+R()*35;
    if(CP.contractsDone%3===0)setTimeout(openSigilDraft,450);
    updateContractUI();
  }

  function mountContractUI(){
    if(byId('scContractHud'))return;
    const d=document.createElement('div');d.id='scContractHud';
    d.innerHTML='<div class="scContractTop"><span id="scContractIcon">☠️</span><div><small>CONTRATO DE CAOS</small><b id="scContractName">AGUARDANDO</b></div></div><div id="scContractDesc">Um novo contrato aparecerá durante a partida.</div><div class="scContractBar"><i id="scContractFill"></i></div><small id="scContractProg"></small>';
    document.body.appendChild(d);
  }

  function updateContractUI(){
    mountContractUI();
    const h=byId('scContractHud');if(!h)return;
    h.classList.toggle('on',st==='play'&&!!CP.contract);
    if(!CP.contract)return;
    const c=CP.contract;
    byId('scContractIcon').textContent=c.icon;byId('scContractName').textContent=c.name;
    byId('scContractDesc').textContent=c.desc(c);byId('scContractProg').textContent=Math.min(c.goal,c.value)+' / '+c.goal;
    byId('scContractFill').style.width=(clamp(c.value/c.goal,0,1)*100)+'%';
  }

  // ===== RIFT ASSAULTS =====
  function spawnPack(index,count,eliteChance=.12){
    for(let i=0;i<count;i++){const [sx,sy]=edge();spawn(EN_START+index,sx,sy,R()<eliteChance)}
  }

  function riftAssault(){
    if(st!=='play')return;
    CP.assaultCount++;
    const tier=1+Math.floor(T/240),type=CP.assaultCount%4;
    try{
      if(type===1){ban('⚠ ASSALTO: LÂMINAS DA RUPTURA');spawnPack(0,7+tier*2,.16);spawnPack(3,5+tier,.10)}
      else if(type===2){ban('⚠ ASSALTO: LINHA DE CERCO');spawnPack(1,4+tier,.18);spawnPack(4,5+tier,.14)}
      else if(type===3){ban('⚠ ASSALTO: ORÁCULOS DO VAZIO');spawnPack(2,5+tier,.20);spawnPack(0,4+tier,.12)}
      else{ban('⚠ ASSALTO: GUARDIÃO DO ABISMO');spawnPack(5,1+Math.floor(tier/3),.35);spawnPack(3,6+tier,.14);spawnPack(4,4+tier,.14)}
      shake=Math.min(16,7+tier);
    }catch(_){}
    CP.nextAssault=T+125+R()*55;
  }

  // ===== KILL / HURT HOOKS =====
  const prevKill=kill;
  kill=function(e){
    const wasAlive=e&&!e.dead;
    const out=prevKill.apply(this,arguments);
    if(!wasAlive||!e||!e.dead)return out;
    if(e.scPack3)CP.packKills++;if(e.el&&!e.boss)CP.eliteKills++;
    const c=CP.contract;
    if(c&&c.onKill){
      try{c.onKill(c,e)}catch(_){}
      if(c.value>=c.goal)contractComplete();else updateContractUI();
    }
    return out;
  };

  const prevHurt=hurt;
  hurt=function(d){
    if(d>0&&st==='play'){
      CP.lastHurtAt=T;
      if(CP.contract&&CP.contract.id==='survive'){CP.contract.start=T;CP.contract.value=0;updateContractUI()}
    }
    return prevHurt.apply(this,arguments);
  };

  // ===== RUN RESET =====
  const prevStart=start;
  start=function(){
    const out=prevStart.apply(this,arguments);
    CP.started=true;CP.nextContract=55;CP.contract=null;CP.contractsDone=0;CP.nextAssault=135;CP.assaultCount=0;
    CP.sigils.clear();CP.sigilOpen=false;CP.lastT=0;CP.noHitSince=0;CP.lastHurtAt=-999;CP.packKills=0;CP.eliteKills=0;CP.lastMilestone=-1;
    updateContractUI();return out;
  };

  // ===== MAIN TICK WITHOUT TOUCHING THE CORE LOOP =====
  function tick(){
    try{
      if(st!=='play'){updateContractUI();return}
      if(!CP.started)CP.started=true;
      if(!CP.contract&&T>=CP.nextContract)startContract();
      if(CP.contract&&CP.contract.tick){
        CP.contract.tick(CP.contract);
        if(CP.contract.value>=CP.contract.goal)contractComplete();else updateContractUI();
      }
      if(T>=CP.nextAssault)riftAssault();
      if(typeof CF!=='undefined'&&CF.i){
        const minute=Math.floor(T/60);
        if(minute>=10&&minute!==CP.lastMilestone&&minute%5===0){
          CP.lastMilestone=minute;
          try{ban('☠ CATACLISMO DO MINUTO '+minute)}catch(_){}
          spawnPack(0,4+Math.floor(minute/2),.20);spawnPack(2,3+Math.floor(minute/3),.22);spawnPack(5,Math.max(1,Math.floor(minute/10)),.30);
        }
      }
    }catch(err){console.warn('[Content Pack 3 tick]',err)}
  }

  setInterval(tick,500);mountContractUI();mountSigilUI();
  window.SCContentPack3={version:CP.version,enemies:PACK_EN.map(q=>q[0]),contracts:CONTRACTS.map(q=>q.name),sigils:SIGILS.map(q=>q.name),state:CP};
  console.log('[Mobile] Content Pack 3.0 enabled: 6 enemies, Chaos Contracts, 8 Sigils and Rift Assaults.');
}catch(err){console.warn('[Mobile Content Pack 3]',err)}
})();