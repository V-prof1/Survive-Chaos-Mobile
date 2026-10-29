/* ©criado por Vitor Ag/Nyx - 2026 */
/* ©criado por Vitor Ag/Nyx - 2026 */
/* ©criado por Vitor Ag/Nyx - 2026 */
(() => {
'use strict';
try{
  const $=id=>document.getElementById(id), clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
  const MODES=[
    {id:0,icon:'—',name:'Nenhum',desc:'Sem regra especial adicional.'},
    {id:1,icon:'👑',name:'Boss Rush',desc:'Bosses entram em intervalos curtos e ficam mais fortes a cada vitória.'},
    {id:2,icon:'🎯',name:'Caçada de Recompensa',desc:'Alvos especiais aparecem com tempo limitado. Falhar chama reforços.'},
    {id:3,icon:'🌀',name:'Ciclo do Caos',desc:'Uma nova Lei do Caos muda as regras temporariamente a cada minuto.'},
    {id:4,icon:'🏰',name:'Rei da Arena',desc:'Capture zonas móveis enquanto hordas tentam expulsar você.'},
    {id:5,icon:'⚡',name:'Blitz',desc:'Ondas a cada poucos segundos, elites frequentes e bosses acelerados.'},
    {id:6,icon:'📈',name:'Ascensão',desc:'A ameaça sobe de tier a cada 2 minutos, mas você recebe uma bênção junto.'},
    {id:7,icon:'💠',name:'Núcleo em Fuga',desc:'Proteja um núcleo instável; inimigos próximos drenam a vida dele.'},
    {id:8,icon:'🎲',name:'Roleta Especial',desc:'Escolhe aleatoriamente um dos sete modos especiais ao iniciar.'}
  ];
  if(!Number.isInteger(S.scSpecialMode)||S.scSpecialMode<0||S.scSpecialMode>=MODES.length)S.scSpecialMode=0;

  const M={active:false,mode:0,lastT:0,nextBoss:85,bossWins:0,nextBounty:55,bounty:null,bountyEnd:0,nextLaw:45,law:null,lawEnd:0,lawPulse:0,zone:null,zoneHold:0,zoneNeed:18,zonePulse:0,blitzWave:20,blitzElite:62,blitzBoss:140,ascStage:0,nextAsc:120,core:null,coreWave:0,nextEncounter:150,encOpen:false};
  const LAW=[
    {id:'blood',name:'LUA DE SANGUE',desc:'Você e os inimigos causam +35% de dano.'},
    {id:'hell',name:'BULLET HELL',desc:'Inimigos próximos disparam rajadas extras.'},
    {id:'harvest',name:'COLHEITA',desc:'Abates soltam XP extra, mas hordas chegam mais rápido.'},
    {id:'dark',name:'APAGÃO',desc:'A arena escurece e elites aparecem nas sombras.'},
    {id:'soul',name:'TEMPESTADE DE ALMAS',desc:'ULT recarrega continuamente enquanto ondas surgem.'},
    {id:'panic',name:'PÂNICO',desc:'Hordas curtas e agressivas entram em sequência.'}
  ];
  const ENCOUNTERS=[
    {id:'blood',icon:'🩸',name:'Pacto Rubro',desc:'+15% dano nesta run, mas -10% de vida máxima.',apply:q=>{q.dmg*=1.15;q.mhp*=.90;q.hp=Math.min(q.hp,q.mhp)}},
    {id:'titan',icon:'🛡️',name:'Protocolo Titã',desc:'+40 vida e cura parcial, porém -5% velocidade.',apply:q=>{q.mhp+=40;q.hp=Math.min(q.mhp,q.hp+Math.max(40,q.mhp*.35));q.sp*=.95}},
    {id:'clock',icon:'⚙️',name:'Overclock',desc:'Cadência e Dash 10% melhores; -4% armadura.',apply:q=>{q.rate*=.90;q.dashCd*=.90;q.armor=Math.max(0,(q.armor||0)-.04)}},
    {id:'soul',icon:'⚡',name:'Fornalha de Almas',desc:'+35% ULT agora e mais carga por abate. Um elite aparece.',apply:q=>{ult=Math.min(100,(ult||0)+35);q.scSoul=(q.scSoul||0)+.18;elite(1)}},
    {id:'hunter',icon:'🎯',name:'Juramento do Caçador',desc:'+15% dano contra bosses. Uma horda entra imediatamente.',apply:q=>{q.scBoss=(q.scBoss||0)+.15;ring(12)}},
    {id:'cache',icon:'📦',name:'Cache Proibido',desc:'Moedas, +5% crítico e dois elites para cobrar o preço.',apply:q=>{if(typeof earned==='number')earned+=Math.max(15,Math.round(45*((MZ&&MZ[4])||1)));q.crit=(q.crit||0)+.05;elite(2)}}
  ];

  const activeName=()=>MODES[M.mode]?.name||'Nenhum';
  function notice(a,b=''){try{ban((a||'')+(b?' · '+b:''));sfx('ui')}catch(_){}}
  function marks(n){try{if(S.scOps){S.scOps.marks=(Number(S.scOps.marks)||0)+n;sv()}}catch(_){}}
  function coins(n){try{if(typeof earned==='number')earned+=Math.max(1,Math.round(n*Math.max(.12,Math.min(1.4,(MZ&&MZ[4])||1))))}catch(_){}}
  function spawnNear(px,py,n,eliteChance=0){for(let i=0;i<n;i++){const a=R()*PI*2,d=90+R()*180;spawn(pick(),px+Math.cos(a)*d,py+Math.sin(a)*d,R()<eliteChance)}}
  function point(min=180,max=310){const a=R()*PI*2,d=min+R()*(max-min);return{x:P.x+Math.cos(a)*d,y:P.y+Math.sin(a)*d}}
  function dist(a,b){return Math.hypot((a.x||0)-(b.x||0),(a.y||0)-(b.y||0))}

  function mountSetup(){
    const panel=document.querySelector('#setup .panel.setup'),go=$('go');if(!panel||!go)return;
    let sec=$('scSpecialModes');if(sec)sec.remove();
    sec=document.createElement('div');sec.id='scSpecialModes';sec.className='sec scSpecialModes';sec.innerHTML='<div class="lbl">Modo especial · combinável</div>';
    const grid=document.createElement('div');grid.className='scSpecialGrid';
    MODES.forEach(m=>{const b=document.createElement('button');b.type='button';b.className='opt scModeOpt'+(S.scSpecialMode===m.id?' on':'');b.innerHTML='<span>'+m.icon+'</span><b>'+m.name+'</b>';b.onclick=()=>{S.scSpecialMode=m.id;sv();try{sfx('ui')}catch(_){};setupUI()};grid.appendChild(b)});
    sec.appendChild(grid);const d=document.createElement('div');d.className='desc scModeDesc';d.textContent=MODES[S.scSpecialMode].desc+' Pode ser combinado com o Modo Extra Mobile.';sec.appendChild(d);
    panel.insertBefore(sec,go.parentElement);
  }
  const _setup=setupUI;setupUI=function(){const out=_setup.apply(this,arguments);mountSetup();return out};

  function mountHud(){
    if(!$('scSpecialHud')){const d=document.createElement('div');d.id='scSpecialHud';d.innerHTML='<small>MODO ESPECIAL</small><b id="scSpecialTitle">—</b><span id="scSpecialInfo"></span>';document.body.appendChild(d)}
    if(!$('scEncounter')){const d=document.createElement('div');d.id='scEncounter';d.innerHTML='<div class="scEncounterPanel"><small>ENCONTRO DO CAOS</small><h2>ESCOLHA O PREÇO DA VANTAGEM</h2><p>Essas decisões duram até o fim da run.</p><div id="scEncounterGrid"></div></div>';document.body.appendChild(d)}
  }

  function resetMode(){
    M.active=true;M.mode=S.scSpecialMode===8?1+Math.floor(R()*7):S.scSpecialMode;M.lastT=0;M.nextBoss=75+R()*20;M.bossWins=0;M.nextBounty=50+R()*20;M.bounty=null;M.bountyEnd=0;M.nextLaw=42+R()*15;M.law=null;M.lawEnd=0;M.lawPulse=0;M.zone=null;M.zoneHold=0;M.zoneNeed=18;M.zonePulse=0;M.blitzWave=18;M.blitzElite=58;M.blitzBoss=135;M.ascStage=0;M.nextAsc=120;M.core=null;M.coreWave=0;M.nextEncounter=145+R()*45;M.encOpen=false;
    document.body.classList.remove('scLawDark');
    if(M.mode===5&&P){P.sp*=1.10;P.dashCd*=.88}
    if(M.mode===4)initZone();if(M.mode===7)initCore();
    if(M.mode)notice('MODO ESPECIAL: '+activeName());
  }
  const _start=start;start=function(){const out=_start.apply(this,arguments);try{resetMode()}catch(err){console.warn('[Modes Pack start]',err)}return out};

  const _spawn=spawn;spawn=function(k,px,py,el){const e=_spawn.apply(this,arguments);if(!e||e.boss)return e;if(M.active&&M.mode===6&&M.ascStage>0){const hp=1+M.ascStage*.10,dm=1+M.ascStage*.055,sp=1+Math.min(.24,M.ascStage*.025);e.hp*=hp;e.mh=e.hp;e.dmg*=dm;e.sp*=sp;e.scAsc=M.ascStage}return e};

  const _boss=boss;boss=function(){const n=E.length,out=_boss.apply(this,arguments);try{if(M.active&&M.mode===1){for(let i=n;i<E.length;i++){const e=E[i];if(!e||!e.boss||e.dv||e.__scRush)continue;e.__scRush=1;const mul=1+M.bossWins*.13;e.hp*=mul;e.mh=e.hp;e.dmg*=1+M.bossWins*.06}}}catch(_){}return out};

  const _hit=hit;hit=function(e,d,sx,sy,crit){if(M.active&&M.mode===3&&M.law?.id==='blood')d*=1.35;return _hit.call(this,e,d,sx,sy,crit)};
  const _hurt=hurt;hurt=function(d){if(M.active&&M.mode===3&&M.law?.id==='blood')d*=1.35;return _hurt.call(this,d)};

  function rewardBounty(){coins(65);marks(3);if(P){P.hp=Math.min(P.mhp,P.hp+P.mhp*.12);ult=Math.min(100,(ult||0)+15)}notice('RECOMPENSA COLETADA','alvo prioritário eliminado');M.bounty=null;M.bountyEnd=0;M.nextBounty=T+60+R()*20}
  function failBounty(){notice('RECOMPENSA PERDIDA','reforços inimigos chegando');elite(2);ring(8);M.bounty=null;M.bountyEnd=0;M.nextBounty=T+55+R()*15}
  const _kill=kill;kill=function(e){const alive=e&&!e.dead,out=_kill.apply(this,arguments);if(!alive||!e||!e.dead)return out;try{
    if(M.active&&M.mode===2&&e===M.bounty)rewardBounty();
    if(M.active&&M.mode===1&&e.boss&&!e.helper&&!e.dv){M.bossWins++;coins(45+M.bossWins*7);marks(2);M.nextBoss=T+Math.max(52,82-M.bossWins*3)}
    if(M.active&&M.mode===3&&M.law?.id==='harvest'&&R()<.34)G.push({x:e.x+R()*10-5,y:e.y+R()*10-5,v:2,k:0});
    if(M.active&&M.mode===7&&M.core&&dist(e,M.core)<120)M.core.hp=Math.min(M.core.max,M.core.hp+1.2);
  }catch(_){}return out};

  function createBounty(){
    const before=E.length;elite(1);let e=null;for(let i=E.length-1;i>=before;i--){if(E[i]&&!E[i].boss){e=E[i];break}}if(!e){const[a,b]=edge();e=spawn(pick(),a,b,1)}if(!e){M.nextBounty=T+20;return}
    e.__scBounty2=1;e.hp*=3.8;e.mh=e.hp;e.dmg*=1.32;e.r*=1.18;e.col='#ffd45a';M.bounty=e;M.bountyEnd=T+38;notice('ALVO DE RECOMPENSA','38 segundos para eliminar');
  }
  function chooseLaw(){
    const prev=M.law?.id,pool=LAW.filter(q=>q.id!==prev);M.law=pool[Math.floor(R()*pool.length)];M.lawEnd=T+42;M.nextLaw=T+57+R()*10;M.lawPulse=0;document.body.classList.toggle('scLawDark',M.law.id==='dark');notice('LEI DO CAOS: '+M.law.name,M.law.desc);
    if(M.law.id==='dark')elite(1);
  }
  function updateLaw(dt){if(!M.law)return;if(T>=M.lawEnd){document.body.classList.remove('scLawDark');M.law=null;return}M.lawPulse-=dt;if(M.lawPulse>0)return;
    if(M.law.id==='hell'){M.lawPulse=5;const pool=E.filter(e=>!e.dead&&!e.boss&&dist(e,P)<430);const e=pool[Math.floor(R()*pool.length)];if(e&&typeof radial==='function')radial(e,8,125,R()*PI*2,'#ff657a')}
    else if(M.law.id==='harvest'){M.lawPulse=7;ring(5)}
    else if(M.law.id==='soul'){M.lawPulse=3;ult=Math.min(100,(ult||0)+3);ring(3)}
    else if(M.law.id==='panic'){M.lawPulse=4.5;ring(6)}
    else if(M.law.id==='dark'){M.lawPulse=10;if(R()<.55)elite(1)}
    else M.lawPulse=4;
  }

  function initZone(){if(!P)return;M.zone=point(190,300);M.zoneHold=0;M.zonePulse=0;spawnNear(M.zone.x,M.zone.y,7,.06);notice('REI DA ARENA','capture a zona marcada')}
  function updateZone(dt){if(!M.zone||!P)return;M.zonePulse-=dt;if(M.zonePulse<=0){M.zonePulse=.18;try{FX.push({x:M.zone.x,y:M.zone.y,r:76,t:.22,ring:1})}catch(_){}}const inside=dist(P,M.zone)<76;M.zoneHold=clamp(M.zoneHold+(inside?dt:-dt*.45),0,M.zoneNeed);if(inside&&R()<dt*.75)spawnNear(M.zone.x,M.zone.y,1,.05);if(M.zoneHold>=M.zoneNeed){coins(55);marks(3);ult=Math.min(100,(ult||0)+18);notice('ZONA DOMINADA','nova arena marcada');M.zone=point(220,340);M.zoneHold=0;spawnNear(M.zone.x,M.zone.y,10,.10)}}

  function ascend(){M.ascStage++;const hp=1.08,dm=1.045,sp=1.018;for(const e of E){if(!e||e.dead||e.boss)continue;e.hp*=hp;e.mh*=hp;e.dmg*=dm;e.sp*=sp;e.scAsc=M.ascStage}const q=P,boon=Math.floor(R()*5);if(q){if(boon===0){q.dmg*=1.08;notice('ASCENSÃO '+M.ascStage,'Bênção: +8% dano')}else if(boon===1){q.sp*=1.06;notice('ASCENSÃO '+M.ascStage,'Bênção: +6% velocidade')}else if(boon===2){q.crit=(q.crit||0)+.04;notice('ASCENSÃO '+M.ascStage,'Bênção: +4% crítico')}else if(boon===3){q.mhp+=20;q.hp=Math.min(q.mhp,q.hp+35);notice('ASCENSÃO '+M.ascStage,'Bênção: vitalidade')}else{ult=Math.min(100,(ult||0)+35);notice('ASCENSÃO '+M.ascStage,'Bênção: +35% ULT')}}M.nextAsc=T+120}

  function initCore(){if(!P)return;const p=point(130,190);M.core={x:p.x,y:p.y,hp:100,max:100,time:0,need:48};M.coreWave=1;notice('NÚCLEO INSTÁVEL','proteja-o por 48 segundos')}
  function updateCore(dt){const c=M.core;if(!c||!P)return;c.time+=dt;M.coreWave-=dt;try{if(R()<dt*7)FX.push({x:c.x,y:c.y,r:42,t:.18,ring:1})}catch(_){}let pressure=0;for(const e of E){if(!e||e.dead||e.boss)continue;if(dist(e,c)<90)pressure++}if(pressure)c.hp-=dt*(2.2+pressure*1.05);if(dist(P,c)<105)c.hp=Math.min(c.max,c.hp+dt*.65);if(M.coreWave<=0){M.coreWave=5.2;spawnNear(c.x,c.y,5+Math.min(7,Math.floor(c.time/12)),.07)}if(c.hp<=0){notice('NÚCLEO DESTRUÍDO','onda de punição');ring(14);elite(1);M.core=null;setTimeout(()=>{if(M.active&&M.mode===7&&st==='play')initCore()},1200);return}if(c.time>=c.need){coins(75);marks(4);if(P){P.hp=Math.min(P.mhp,P.hp+P.mhp*.20);ult=Math.min(100,(ult||0)+25)}notice('NÚCLEO ESTABILIZADO','recompensa liberada');M.core=null;setTimeout(()=>{if(M.active&&M.mode===7&&st==='play')initCore()},1800)}}

  function encounterChoices(){return [...ENCOUNTERS].sort(()=>R()-.5).slice(0,3)}
  function openEncounter(){if(M.encOpen||!P||P.dead||bossE)return;mountHud();M.encOpen=true;st='scEncounter';const box=$('scEncounter'),g=$('scEncounterGrid');g.innerHTML='';for(const e of encounterChoices()){const b=document.createElement('button');b.type='button';b.className='scEncounterCard';b.innerHTML='<span>'+e.icon+'</span><b>'+e.name+'</b><small>'+e.desc+'</small>';b.onclick=()=>{try{e.apply(P);sfx('boss2')}catch(_){};box.classList.remove('on');M.encOpen=false;M.nextEncounter=T+185+R()*65;st='play';notice('PACTO ACEITO',e.name)};g.appendChild(b)}box.classList.add('on')}

  function blitz(){if(T>=M.blitzWave){M.blitzWave=T+24;ring(8+Math.min(14,Math.floor(T/120)*2))}if(T>=M.blitzElite){M.blitzElite=T+60;elite(T>480?2:1)}if(T>=M.blitzBoss&&!bossE){M.blitzBoss=T+145;boss()}}
  function bossRush(){if(T>=M.nextBoss&&!bossE){boss();M.nextBoss=T+80}}
  function bountyMode(){if(!M.bounty&&T>=M.nextBounty)createBounty();if(M.bounty&&M.bounty.dead)rewardBounty();else if(M.bounty&&T>=M.bountyEnd)failBounty()}

  function updateHud(){mountHud();const h=$('scSpecialHud');if(!h)return;h.classList.toggle('on',M.active&&M.mode>0&&['play','pause','cards','devi'].includes(st));$('scSpecialTitle').textContent=(MODES[M.mode]?.icon||'')+' '+activeName();let t='';if(M.mode===1)t='Próximo boss: '+Math.max(0,Math.ceil(M.nextBoss-T))+'s · vitórias '+M.bossWins;else if(M.mode===2)t=M.bounty?'ALVO: '+Math.max(0,Math.ceil(M.bountyEnd-T))+'s':'Próximo alvo: '+Math.max(0,Math.ceil(M.nextBounty-T))+'s';else if(M.mode===3)t=M.law?(M.law.name+' · '+Math.max(0,Math.ceil(M.lawEnd-T))+'s'):'Nova lei: '+Math.max(0,Math.ceil(M.nextLaw-T))+'s';else if(M.mode===4)t='Domínio '+Math.floor((M.zoneHold/M.zoneNeed)*100)+'%';else if(M.mode===5)t='Onda '+Math.max(0,Math.ceil(M.blitzWave-T))+'s · Boss '+Math.max(0,Math.ceil(M.blitzBoss-T))+'s';else if(M.mode===6)t='Tier '+M.ascStage+' · próxima ascensão '+Math.max(0,Math.ceil(M.nextAsc-T))+'s';else if(M.mode===7)t=M.core?'Núcleo '+Math.max(0,Math.ceil(M.core.hp))+'% · '+Math.max(0,Math.ceil(M.core.need-M.core.time))+'s':'Reiniciando núcleo...';$('scSpecialInfo').textContent=t}

  let prev=performance.now();
  function loop(now){const dt=Math.min(.05,Math.max(0,(now-prev)/1000));prev=now;try{mountHud();if(st==='menu'||st==='over')M.active=false;if(M.active&&st==='play'&&P&&!P.dead){
      if(M.mode===1)bossRush();else if(M.mode===2)bountyMode();else if(M.mode===3){if(!M.law&&T>=M.nextLaw)chooseLaw();updateLaw(dt)}else if(M.mode===4)updateZone(dt);else if(M.mode===5)blitz();else if(M.mode===6&&T>=M.nextAsc)ascend();else if(M.mode===7)updateCore(dt);
      if(T>=M.nextEncounter&&!M.encOpen&&!bossE&&(!M.bounty||M.mode!==2))openEncounter();
    }updateHud();M.lastT=typeof T==='number'?T:0}catch(err){console.warn('[Modes Pack 6.0]',err)}requestAnimationFrame(loop)}
  mountHud();requestAnimationFrame(loop);
  window.SCModesPack={version:'6.0',modes:MODES,state:M};
  console.log('[Mobile] Modes Pack 6.0 enabled: 7 combinable special modes + mid-run Chaos Encounters.');
}catch(err){console.warn('[Mobile Modes Pack 6.0]',err)}
})();