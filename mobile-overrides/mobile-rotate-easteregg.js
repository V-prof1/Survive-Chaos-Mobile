/* ©criado por Vitor Ag/Nyx - 2026 */
/* ©criado por Vitor Ag/Nyx - 2026 */
/* ©criado por Vitor Ag/Nyx - 2026 */
(() => {
'use strict';
try{
  const ID='s_rotate_brain';
  const NAME='Idiota com pouco cérebro';
  const DESC='Passe 60 segundos ignorando uma instrução que literalmente manda girar o celular.';
  const ROASTS=[
    [15,'15 segundos. Gira a porra do celular. É literalmente só isso.'],
    [25,'25 segundos. Você é burro ou tá treinando? Deita o celular.'],
    [35,'35 segundos. Caralho, até agora? Seu QI deve estar brigando pra chegar nos dois dígitos.'],
    [45,'45 segundos. Você ainda não girou. Parabéns, imbecil.'],
    [55,'55 segundos. Você não tá distraído. Você só é extremamente dedicado a fazer merda.'],
    [60,'1 minuto. Você é oficialmente burro demais pra seguir uma instrução de três palavras. Toma sua conquista, campeão.']
  ];
  let enteredAt=0,lastStep=-1,registered=false,unlockedThisSession=false;

  const portrait=()=>innerHeight>innerWidth;
  const byId=id=>document.getElementById(id);

  function registerAchievement(){
    if(registered)return true;
    try{
      if(typeof ACH==='undefined'||typeof ACM==='undefined'||typeof ACS==='undefined')return false;
      if(!ACM[ID]){
        const a={id:ID,n:NAME,d:DESC,r:9.95,f:null,s:true};
        ACH.push(a);ACM[ID]=a;ACS.push(a);ACS.sort((x,y)=>x.r-y.r);
      }
      registered=true;
      return true;
    }catch(_){return false}
  }

  function mountUI(){
    const lock=byId('scRotateLock');
    if(!lock)return false;
    const card=lock.querySelector('.scRotateCard');
    if(!card)return false;
    if(!byId('scRotateRoast')){
      const roast=document.createElement('div');
      roast.id='scRotateRoast';
      roast.setAttribute('aria-live','polite');
      roast.textContent='';
      const hint=card.querySelector('.scRotateHint');
      if(hint)card.insertBefore(roast,hint);else card.appendChild(roast);
    }
    if(!byId('scRotateAchievement')){
      const badge=document.createElement('div');
      badge.id='scRotateAchievement';
      badge.innerHTML='<span>🏆</span><div><small>CONQUISTA SECRETA DESBLOQUEADA</small><b>'+NAME+'</b></div>';
      card.appendChild(badge);
    }
    if(!byId('scRotateEggStyle')){
      const st=document.createElement('style');st.id='scRotateEggStyle';st.textContent=`
#scRotateRoast{display:none;width:min(350px,100%);padding:10px 12px;border-left:3px solid #ffd34f;border-radius:8px;background:rgba(255,211,79,.07);color:#ddd5f4;font:800 11px/1.4 var(--bd,system-ui);letter-spacing:.01em}
#scRotateRoast.on{display:block}
#scRotateAchievement{display:none;width:min(360px,100%);align-items:center;gap:10px;margin-top:3px;padding:11px 13px;border:1px solid rgba(255,211,79,.72);border-radius:12px;background:linear-gradient(180deg,rgba(83,59,14,.92),rgba(42,28,8,.96));box-shadow:inset 0 1px 0 rgba(255,255,255,.1),0 8px 24px rgba(0,0,0,.34);text-align:left}
#scRotateAchievement.on{display:flex;animation:scEggPop .35s ease-out both}
#scRotateAchievement>span{font-size:28px;filter:drop-shadow(0 2px 0 #000)}
#scRotateAchievement div{display:grid;gap:2px;min-width:0}
#scRotateAchievement small{font:900 8px/1.2 var(--px,system-ui);letter-spacing:.12em;color:#f4c94d}
#scRotateAchievement b{font:900 14px/1.15 var(--bd,system-ui);color:#fff5cf}
@keyframes scEggPop{from{opacity:0;transform:scale(.92) translateY(8px)}to{opacity:1;transform:none}}
@media(prefers-reduced-motion:reduce){#scRotateAchievement.on{animation:none!important}}

/* Landscape menu balance: keep the dashboard composition, only normalize scale. */
@media (orientation:landscape){
  #menu.scMenuV2 #play{
    height:50px!important;
    min-height:50px!important;
    max-height:50px!important;
    padding:7px 12px!important;
    font-size:13px!important;
  }
  #menu.scMenuV2 .scMenuSystems{
    grid-template-rows:auto 48px 48px 48px!important;
    align-content:start!important;
  }
  #menu.scMenuV2 .scMenuSystems .btn,
  #menu.scMenuV2 #scOnlineBtn{
    height:48px!important;
    min-height:48px!important;
    max-height:48px!important;
    padding:6px 8px!important;
    font-size:8px!important;
    box-sizing:border-box!important;
  }
}
@media (orientation:landscape) and (max-height:390px){
  #menu.scMenuV2 #play{
    height:46px!important;
    min-height:46px!important;
    max-height:46px!important;
  }
  #menu.scMenuV2 .scMenuSystems{grid-template-rows:auto 42px 42px 42px!important}
  #menu.scMenuV2 .scMenuSystems .btn,
  #menu.scMenuV2 #scOnlineBtn{
    height:42px!important;
    min-height:42px!important;
    max-height:42px!important;
  }
}
`;
      document.head.appendChild(st);
    }
    return true;
  }

  function currentStep(sec){let idx=-1;for(let i=0;i<ROASTS.length;i++)if(sec>=ROASTS[i][0])idx=i;return idx}

  function showRoast(sec){
    if(!mountUI())return;
    const step=currentStep(sec),el=byId('scRotateRoast');
    if(!el)return;
    if(step<0){
      if(lastStep!==-1){el.textContent='';el.classList.remove('on');lastStep=-1}
      return;
    }
    if(step===lastStep)return;lastStep=step;
    el.textContent=ROASTS[step][1];el.classList.add('on');
  }

  function unlock(){
    if(unlockedThisSession)return;
    registerAchievement();
    let already=false;
    try{already=!!(typeof S!=='undefined'&&S.ach&&S.ach[ID])}catch(_){}
    if(!already){
      try{if(typeof ach==='function')ach(ID);else if(typeof S!=='undefined'){S.ach=S.ach||{};S.ach[ID]=Date.now();if(typeof sv==='function')sv()}}catch(_){}
      unlockedThisSession=true;
      const badge=byId('scRotateAchievement');if(badge)badge.classList.add('on');
      try{if(typeof sfx==='function')sfx('lvl')}catch(_){}
      try{if(typeof achUI==='function'&&typeof st!=='undefined'&&st==='ach')achUI()}catch(_){}
    }
  }

  function tick(){
    registerAchievement();mountUI();
    if(!portrait()){
      enteredAt=0;lastStep=-1;unlockedThisSession=false;
      const roast=byId('scRotateRoast');if(roast){roast.textContent='';roast.classList.remove('on')}
      const badge=byId('scRotateAchievement');if(badge)badge.classList.remove('on');
      return;
    }
    if(!enteredAt)enteredAt=Date.now();
    const sec=Math.floor((Date.now()-enteredAt)/1000);
    showRoast(sec);
    if(sec>=60)unlock();
  }

  setInterval(tick,1000);
  addEventListener('resize',tick,{passive:true});
  addEventListener('orientationchange',()=>setTimeout(tick,180),{passive:true});
  setTimeout(tick,250);
  window.SCRotateEgg={id:ID,name:NAME,seconds:60,tick};
  console.log('[Mobile] Rotate easter egg enabled: first roast at 15s, secret achievement after 60s portrait.');
}catch(err){console.warn('[Mobile Rotate Egg]',err)}
})();


// ===== CONTENT PACK 3.0 — loaded last so it layers over all Mobile systems =====
(() => {
'use strict';
try{
  if(!document.getElementById('scContentPack3Style')){const s=document.createElement('style');s.id='scContentPack3Style';s.textContent=`/* Survive Chaos Mobile — Content Pack 3.0 */
#scContractHud{position:fixed;z-index:24;left:max(12px,env(safe-area-inset-left));bottom:max(12px,env(safe-area-inset-bottom));width:min(255px,36vw);padding:9px 10px;border:1px solid rgba(155,122,255,.45);border-radius:12px;background:linear-gradient(180deg,rgba(25,18,58,.94),rgba(10,8,28,.96));box-shadow:0 10px 28px rgba(0,0,0,.35),inset 0 1px 0 rgba(255,255,255,.05);color:#f4f0ff;font-family:Nunito,system-ui,sans-serif;opacity:0;transform:translateY(10px);pointer-events:none;transition:.18s ease}
#scContractHud.on{opacity:1;transform:none}.scContractTop{display:flex;align-items:center;gap:8px}#scContractIcon{font-size:21px;filter:drop-shadow(0 2px 0 #000)}.scContractTop>div{display:grid;gap:1px;min-width:0}.scContractTop small{font-size:7px;font-weight:900;letter-spacing:.13em;color:#a99bea}#scContractName{font-size:12px;line-height:1.1;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}#scContractDesc{margin-top:5px;font-size:9px;line-height:1.25;color:#c8c0df}.scContractBar{height:5px;margin-top:7px;border-radius:999px;background:#110e27;overflow:hidden;box-shadow:inset 0 0 0 1px rgba(255,255,255,.05)}#scContractFill{display:block;height:100%;width:0;background:linear-gradient(90deg,#754dff,#e45cff);transition:width .18s ease}#scContractProg{display:block;margin-top:4px;font-size:8px;font-weight:900;color:#fff;text-align:right}
#scSigilDraft{position:fixed;z-index:65;inset:0;display:none;align-items:center;justify-content:center;padding:18px;background:rgba(5,4,16,.82);backdrop-filter:blur(7px)}#scSigilDraft.on{display:flex}.scSigilPanel{width:min(720px,96vw);padding:18px;border:1px solid rgba(154,119,255,.5);border-radius:18px;background:linear-gradient(180deg,#1c1744,#0e0b28);box-shadow:0 24px 70px rgba(0,0,0,.55),inset 0 1px 0 rgba(255,255,255,.06);color:white;text-align:center;font-family:Nunito,system-ui,sans-serif}.scSigilPanel>small{font-size:8px;font-weight:900;letter-spacing:.15em;color:#a995ff}.scSigilPanel h2{margin:5px 0 3px;font-size:22px}.scSigilPanel>p{margin:0 0 13px;font-size:11px;color:#bdb5d8}#scSigilGrid{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:10px}.scSigilCard{min-width:0;min-height:122px;display:grid;grid-template-rows:auto auto 1fr;align-items:center;gap:5px;padding:12px 9px;border:1px solid #51448e;border-radius:14px;background:linear-gradient(180deg,#2b235d,#171239);color:white;box-shadow:inset 0 1px 0 rgba(255,255,255,.06),0 5px 0 #0a071b}.scSigilCard:active{transform:translateY(3px);box-shadow:inset 0 1px 0 rgba(255,255,255,.06),0 2px 0 #0a071b}.scSigilCard span{font-size:26px}.scSigilCard b{font-size:12px}.scSigilCard small{font-size:9px;line-height:1.3;color:#c9c2df}
@media(orientation:landscape) and (max-height:430px){#scContractHud{width:min(225px,31vw);padding:7px 8px;bottom:8px}#scContractIcon{font-size:18px}#scContractDesc{font-size:8px}.scSigilPanel{padding:12px}.scSigilPanel h2{font-size:18px}.scSigilCard{min-height:92px;padding:8px 7px}.scSigilCard span{font-size:21px}.scSigilCard b{font-size:10px}.scSigilCard small{font-size:8px}}
@media(max-width:560px){#scContractHud{width:min(230px,44vw)}#scSigilGrid{gap:7px}}
`;document.head.appendChild(s)}
  const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
  const byId=id=>document.getElementById(id);

  const CP={
    version:'3.0',started:false,nextContract:55,contract:null,contractsDone:0,
    nextAssault:135,assaultCount:0,sigils:new Set(),sigilOpen:false,lastT:0,
    noHitSince:0,lastHurtAt:-999,packKills:0,eliteKills:0,lastMilestone:-1
  };

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
    const e=prevSpawn.apply(this,arguments);if(!e)return e;
    if(k>=EN_START&&k<EN_START+PACK_EN.length){const m=PACK_EN[k-EN_START];e.scPack3=1;e.scPack3Name=m[0];e.scPack3Icon=m[10];if(k===EN_START+5){e.hp*=1.18;e.mh=e.hp;e.dmg*=1.08;e.scJuggernaut=1}}
    return e;
  };

  const prevDrawE=drawE;
  drawE=function(e){prevDrawE.apply(this,arguments);if(!e||!e.scPack3Icon||e.dead)return;x.save();x.textAlign='center';x.font='700 12px Nunito';x.lineWidth=3;x.strokeStyle='rgba(0,0,0,.85)';x.fillStyle='#fff';x.strokeText(e.scPack3Icon,e.x,e.y-e.r*1.72);x.fillText(e.scPack3Icon,e.x,e.y-e.r*1.72);x.restore()};

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

  function mountSigilUI(){if(byId('scSigilDraft'))return;const d=document.createElement('div');d.id='scSigilDraft';d.innerHTML='<div class="scSigilPanel"><small>CONTRATO DE CAOS · RECOMPENSA</small><h2>ESCOLHA UM SIGILO</h2><p>O efeito dura até o fim desta partida.</p><div id="scSigilGrid"></div></div>';document.body.appendChild(d)}
  function openSigilDraft(){if(CP.sigilOpen)return;mountSigilUI();const pool=SIGILS.filter(s=>!CP.sigils.has(s.id)).sort(()=>R()-.5).slice(0,3);if(!pool.length)return;CP.sigilOpen=true;const prevState=st;st='scSigil';const g=byId('scSigilGrid');g.innerHTML='';for(const s of pool){const b=document.createElement('button');b.className='scSigilCard';b.innerHTML=`<span>${s.icon}</span><b>${s.name}</b><small>${s.desc}</small>`;b.onclick=()=>{CP.sigils.add(s.id);for(const p of PL)s.apply(p);CP.sigilOpen=false;byId('scSigilDraft').classList.remove('on');st=prevState==='pause'?'pause':'play';try{sfx('lvl');ban('✦ '+s.name.toUpperCase())}catch(_){}};g.appendChild(b)}byId('scSigilDraft').classList.add('on')}

  const CONTRACTS=[
    {id:'kills',icon:'☠️',name:'Extermínio',make:()=>({goal:32+Math.min(28,CP.contractsDone*4),value:0}),desc:c=>`Elimine ${c.goal} inimigos.`,onKill:(c,e)=>{if(!e.boss)c.value++}},
    {id:'elite',icon:'👹',name:'Caçador de Elites',make:()=>({goal:3+Math.min(4,Math.floor(CP.contractsDone/2)),value:0}),desc:c=>`Elimine ${c.goal} elites.`,onKill:(c,e)=>{if(e.el&&!e.boss)c.value++}},
    {id:'pack',icon:'🜏',name:'Ruptura Hostil',make:()=>({goal:8+Math.min(8,CP.contractsDone),value:0}),desc:c=>`Elimine ${c.goal} criaturas da Ruptura.`,onKill:(c,e)=>{if(e.scPack3)c.value++}},
    {id:'survive',icon:'⏱️',name:'Sangue Frio',make:()=>({goal:38+Math.min(22,CP.contractsDone*2),value:0,start:T}),desc:c=>`Sobreviva ${c.goal}s sem sofrer dano.`,tick:c=>{const since=Math.max(c.start,CP.lastHurtAt);c.value=Math.max(0,Math.floor(T-since))}}
  ];

  function contractTemplate(){const options=CONTRACTS.filter(q=>!(CP.contract&&q.id===CP.contract.id));return options[Math.floor(R()*options.length)]}
  function startContract(){if(st!=='play'||CP.contract)return;const t=contractTemplate(),data=t.make();CP.contract={...data,id:t.id,icon:t.icon,name:t.name,desc:t.desc,onKill:t.onKill,tick:t.tick};try{ban('CONTRATO: '+t.name.toUpperCase())}catch(_){}updateContractUI()}
  function contractComplete(){const c=CP.contract;if(!c)return;CP.contractsDone++;CP.contract=null;for(const p of PL)p.hp=Math.min(p.mhp,p.hp+Math.max(16,p.mhp*.12));try{ult=Math.min(100,ult+18)}catch(_){}try{for(let i=0;i<10+Math.min(12,CP.contractsDone*2);i++){const a=R()*PI*2,d=20+R()*75;G.push({x:P.x+Math.cos(a)*d,y:P.y+Math.sin(a)*d,v:1,k:2})}sfx('boss2');ban('✓ CONTRATO CONCLUÍDO')}catch(_){}CP.nextContract=T+70+R()*35;if(CP.contractsDone%3===0)setTimeout(openSigilDraft,450);updateContractUI()}

  function mountContractUI(){if(byId('scContractHud'))return;const d=document.createElement('div');d.id='scContractHud';d.innerHTML='<div class="scContractTop"><span id="scContractIcon">☠️</span><div><small>CONTRATO DE CAOS</small><b id="scContractName">AGUARDANDO</b></div></div><div id="scContractDesc">Um novo contrato aparecerá durante a partida.</div><div class="scContractBar"><i id="scContractFill"></i></div><small id="scContractProg"></small>';document.body.appendChild(d)}
  function updateContractUI(){mountContractUI();const h=byId('scContractHud');if(!h)return;h.classList.toggle('on',st==='play'&&!!CP.contract);if(!CP.contract)return;const c=CP.contract;byId('scContractIcon').textContent=c.icon;byId('scContractName').textContent=c.name;byId('scContractDesc').textContent=c.desc(c);byId('scContractProg').textContent=Math.min(c.goal,c.value)+' / '+c.goal;byId('scContractFill').style.width=(clamp(c.value/c.goal,0,1)*100)+'%'}

  function spawnPack(index,count,eliteChance=.12){for(let i=0;i<count;i++){const [sx,sy]=edge();spawn(EN_START+index,sx,sy,R()<eliteChance)}}
  function riftAssault(){if(st!=='play')return;CP.assaultCount++;const tier=1+Math.floor(T/240),type=CP.assaultCount%4;try{if(type===1){ban('⚠ ASSALTO: LÂMINAS DA RUPTURA');spawnPack(0,7+tier*2,.16);spawnPack(3,5+tier,.10)}else if(type===2){ban('⚠ ASSALTO: LINHA DE CERCO');spawnPack(1,4+tier,.18);spawnPack(4,5+tier,.14)}else if(type===3){ban('⚠ ASSALTO: ORÁCULOS DO VAZIO');spawnPack(2,5+tier,.20);spawnPack(0,4+tier,.12)}else{ban('⚠ ASSALTO: GUARDIÃO DO ABISMO');spawnPack(5,1+Math.floor(tier/3),.35);spawnPack(3,6+tier,.14);spawnPack(4,4+tier,.14)}shake=Math.min(16,7+tier)}catch(_){}CP.nextAssault=T+125+R()*55}

  const prevKill=kill;
  kill=function(e){const wasAlive=e&&!e.dead;const out=prevKill.apply(this,arguments);if(!wasAlive||!e||!e.dead)return out;if(e.scPack3)CP.packKills++;if(e.el&&!e.boss)CP.eliteKills++;const c=CP.contract;if(c&&c.onKill){try{c.onKill(c,e)}catch(_){}if(c.value>=c.goal)contractComplete();else updateContractUI()}return out};

  const prevHurt=hurt;
  hurt=function(d){if(d>0&&st==='play'){CP.lastHurtAt=T;if(CP.contract&&CP.contract.id==='survive'){CP.contract.start=T;CP.contract.value=0;updateContractUI()}}return prevHurt.apply(this,arguments)};

  const prevStart=start;
  start=function(){const out=prevStart.apply(this,arguments);CP.started=true;CP.nextContract=55;CP.contract=null;CP.contractsDone=0;CP.nextAssault=135;CP.assaultCount=0;CP.sigils.clear();CP.sigilOpen=false;CP.lastT=0;CP.noHitSince=0;CP.lastHurtAt=-999;CP.packKills=0;CP.eliteKills=0;CP.lastMilestone=-1;updateContractUI();return out};

  function tick(){try{if(st!=='play'){updateContractUI();return}if(!CP.started)CP.started=true;if(!CP.contract&&T>=CP.nextContract)startContract();if(CP.contract&&CP.contract.tick){CP.contract.tick(CP.contract);if(CP.contract.value>=CP.contract.goal)contractComplete();else updateContractUI()}if(T>=CP.nextAssault)riftAssault();if(typeof CF!=='undefined'&&CF.i){const minute=Math.floor(T/60);if(minute>=10&&minute!==CP.lastMilestone&&minute%5===0){CP.lastMilestone=minute;try{ban('☠ CATACLISMO DO MINUTO '+minute)}catch(_){}spawnPack(0,4+Math.floor(minute/2),.20);spawnPack(2,3+Math.floor(minute/3),.22);spawnPack(5,Math.max(1,Math.floor(minute/10)),.30)}}}catch(err){console.warn('[Content Pack 3 tick]',err)}}

  setInterval(tick,500);mountContractUI();mountSigilUI();
  window.SCContentPack3={version:CP.version,enemies:PACK_EN.map(q=>q[0]),contracts:CONTRACTS.map(q=>q.name),sigils:SIGILS.map(q=>q.name),state:CP};
  console.log('[Mobile] Content Pack 3.0 enabled: 6 enemies, Chaos Contracts, 8 Sigils and Rift Assaults.');
}catch(err){console.warn('[Mobile Content Pack 3]',err)}
})();