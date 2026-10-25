(() => {
'use strict';
try{
  const $=id=>document.getElementById(id), clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
  S.scReplay=S.scReplay||{};
  S.scReplay.archive=Array.isArray(S.scReplay.archive)?S.scReplay.archive:[];
  S.scReplay.stats=Object.assign({runs:0,routes:0,trials:0,awards:0,fragments:0},S.scReplay.stats||{});

  const R={active:false,lastT:0,route:null,routeDone:false,routeDraft:false,trial:null,nextTrial:105,trialOpen:false,hits:0,kills:0,elites:0,bosses:0,dashes:0,ults:0,runStart:0,endPaid:false,lastCombo:0,combo100:0,archiveDrop:0};
  const ROUTES=[
    {id:'hunt',icon:'🎯',name:'ROTA DO CAÇADOR',desc:'Derrube 4 elites e 1 boss.',goal:r=>r.elites>=4&&r.bosses>=1,progress:r=>`${Math.min(4,r.elites)}/4 elites · ${Math.min(1,r.bosses)}/1 boss`},
    {id:'horde',icon:'☠️',name:'ROTA DO MASSACRE',desc:'Elimine 240 inimigos.',goal:r=>r.kills>=240,progress:r=>`${Math.min(240,r.kills)}/240 abates`},
    {id:'flow',icon:'⚡',name:'ROTA DO FLOW',desc:'Alcance combo 100 duas vezes.',goal:r=>r.combo100>=2,progress:r=>`${Math.min(2,r.combo100)}/2 CHAOS BREAKS`},
    {id:'dash',icon:'💨',name:'ROTA CINÉTICA',desc:'Use 28 Dashes e elimine 120 inimigos.',goal:r=>r.dashes>=28&&r.kills>=120,progress:r=>`${Math.min(28,r.dashes)}/28 dash · ${Math.min(120,r.kills)}/120 abates`},
    {id:'ult',icon:'🌩️',name:'ROTA DA SOBRECARGA',desc:'Use 5 ULTs e derrube 2 elites.',goal:r=>r.ults>=5&&r.elites>=2,progress:r=>`${Math.min(5,r.ults)}/5 ULT · ${Math.min(2,r.elites)}/2 elites`},
    {id:'survive',icon:'🛡️',name:'ROTA DO SOBREVIVENTE',desc:'Sobreviva 4 minutos sofrendo no máximo 8 golpes.',goal:r=>T-r.runStart>=240&&r.hits<=8,progress:r=>`${Math.min(240,Math.max(0,Math.floor(T-r.runStart)))}/240s · ${r.hits}/8 golpes`}
  ];
  const BOONS=[
    {id:'predator',icon:'🦅',name:'Predador',desc:'+14% dano e +6% crítico.',apply:q=>{q.dmg*=1.14;q.crit=(q.crit||0)+.06}},
    {id:'reactor',icon:'⚡',name:'Reator Vivo',desc:'ULT +35% agora e abates carregam mais.',apply:q=>{ult=Math.min(100,(ult||0)+35);q.scSoul=(q.scSoul||0)+.20}},
    {id:'bulwark',icon:'🛡️',name:'Bastião',desc:'+55 vida, cura e +7% armadura.',apply:q=>{q.mhp+=55;q.hp=Math.min(q.mhp,q.hp+70);q.armor=(q.armor||0)+.07}},
    {id:'kinetic',icon:'💨',name:'Motor Cinético',desc:'+10% velocidade e Dash 16% mais rápido.',apply:q=>{q.sp*=1.10;q.dashCd*=.84}},
    {id:'storm',icon:'🌩️',name:'Tempestade',desc:'+2 Relâmpagos e +1 perfuração.',apply:q=>{q.light=(q.light||0)+2;q.pierce=(q.pierce||0)+1}},
    {id:'orbit',icon:'🌀',name:'Órbita Rubra',desc:'+2 lâminas orbitais e +1 Aura.',apply:q=>{q.orb=(q.orb||0)+2;q.aura=(q.aura||0)+1}},
    {id:'vamp',icon:'🩸',name:'Sede Controlada',desc:'+1 Vampirismo e +12% dano com pouca vida.',apply:q=>{q.vamp=(q.vamp||0)+1;q.scLowDmg=(q.scLowDmg||0)+.12}},
    {id:'fortune',icon:'👑',name:'Fortuna de Guerra',desc:'+8% crítico e mais moedas nesta run.',apply:q=>{q.crit=(q.crit||0)+.08;q.scScavenge=(q.scScavenge||0)+.035}}
  ];
  const TRIALS=[
    {id:'rush',icon:'⏱️',name:'PROVA DE EXTERMÍNIO',desc:'Elimine 55 inimigos em 35 segundos.',time:35,start:t=>{t.kills0=R.kills;ring(10)},done:t=>R.kills-(t.kills0||0)>=55},
    {id:'elite',icon:'🔥',name:'DUELO DE ELITES',desc:'Derrube 3 elites em 45 segundos.',time:45,start:t=>{t.elite0=R.elites;elite(3)},done:t=>R.elites-(t.elite0||0)>=3},
    {id:'untouched',icon:'🪽',name:'SEM TOQUE',desc:'Passe 28 segundos sem sofrer dano.',time:28,start:t=>t.hit0=R.hits,done:t=>R.hits===(t.hit0||0)},
    {id:'ult',icon:'⚡',name:'SOBRECARGA',desc:'Use 2 ULTs em 50 segundos.',time:50,start:t=>t.ult0=R.ults,done:t=>R.ults-(t.ult0||0)>=2},
    {id:'combo',icon:'💥',name:'FLOW TEST',desc:'Alcance combo 75 antes do tempo acabar.',time:40,start:t=>{},done:t=>(typeof cmb==='number'?cmb:0)>=75}
  ];
  const ARCHIVE=[
    ['f1','Fragmento Rubro','Sobreviva à pressão e continue avançando.'],['f2','Olho Partido','Chefes também deixam rastros do Vazio.'],['f3','Engrenagem Negra','A Fábrica já foi algo pior do que parece.'],['f4','Presa Ancestral','Alguns monstros aprenderam a caçar o próprio Caos.'],
    ['f5','Cinza Viva','Nem toda chama desaparece quando o inimigo morre.'],['f6','Cristal Oco','O gelo das ruínas guarda vozes antigas.'],['f7','Selo do Carrasco','Elites carregam marcas que não pertencem a eles.'],['f8','Núcleo Instável','Energia suficiente para alimentar uma arena inteira.'],
    ['f9','Moeda Sem Face','Algumas recompensas não deveriam ter dono.'],['f10','Fio do Destino','Uma run termina; outra começa um pouco diferente.'],['f11','Coroa Quebrada','Todo boss cai. A questão é quantos vêm depois.'],['f12','Marca do Vazio','Poucos sobreviventes viram isto e continuaram humanos.']
  ];

  function notice(a,b=''){try{ban(a+(b?' · '+b:''));sfx('ui')}catch(_){}}
  function coins(n){try{if(typeof earned==='number')earned+=Math.max(1,Math.round(n*Math.max(.15,Math.min(1.4,(MZ&&MZ[4])||1))))}catch(_){}}
  function marks(n){try{if(S.scOps){S.scOps.marks=(Number(S.scOps.marks)||0)+n}}catch(_){}}
  function save(){try{sv()}catch(_){}}

  function mount(){
    if(!$('scReplayHud')){const d=document.createElement('div');d.id='scReplayHud';d.innerHTML='<small>ROTA DA RUN</small><b id="scRouteName">—</b><span id="scRouteProgress"></span><i id="scTrialLine"></i>';document.body.appendChild(d)}
    if(!$('scRouteDraft')){const d=document.createElement('div');d.id='scRouteDraft';d.innerHTML='<div class="scReplayPanel"><small>ROTA CONCLUÍDA</small><h2>ESCOLHA SUA RECOMPENSA</h2><p>Uma melhoria única para o resto desta run.</p><div id="scRouteChoices"></div></div>';document.body.appendChild(d)}
    if(!$('scTrialOffer')){const d=document.createElement('div');d.id='scTrialOffer';d.innerHTML='<div class="scReplayPanel trial"><small>DESAFIO OPCIONAL</small><h2 id="scTrialTitle"></h2><p id="scTrialDesc"></p><div class="scTrialActions"><button id="scTrialAccept">ACEITAR</button><button id="scTrialSkip">IGNORAR</button></div></div>';document.body.appendChild(d)}
    if(!$('scArchive')){const d=document.createElement('div');d.className='scr';d.id='scArchive';d.innerHTML='<div class="panel scArchivePanel"><div class="scArchiveHead"><div><small>COLEÇÃO PERMANENTE</small><h2>ARQUIVO DO CAOS</h2></div><button class="btn g s" id="scArchiveBack">← Voltar</button></div><div id="scArchiveStats"></div><div id="scArchiveGrid"></div></div>';document.body.appendChild(d);$('scArchiveBack').onclick=()=>{hide('scArchive');show('menu');st='menu'}}
    if(!$('scArchiveBtn')){const stack=document.querySelector('#menu .stack')||document.querySelector('#menu .mb');if(stack){const b=document.createElement('button');b.id='scArchiveBtn';b.className='btn g';b.textContent='📚 Arquivo do Caos';b.onclick=()=>{hide('menu');show('scArchive');st='archive';renderArchive()};stack.appendChild(b)}}
  }

  function chooseRoute(){const pool=ROUTES.slice().sort(()=>R()-.5);R.route=pool[0];R.routeDone=false}
  function resetRun(){R.active=true;R.lastT=0;R.routeDone=false;R.routeDraft=false;R.trial=null;R.nextTrial=95+R()*40;R.trialOpen=false;R.hits=R.kills=R.elites=R.bosses=R.dashes=R.ults=R.combo100=0;R.runStart=typeof T==='number'?T:0;R.endPaid=false;R.lastCombo=0;R.archiveDrop=0;chooseRoute();mount();notice(R.route.icon+' '+R.route.name,R.route.desc)}
  const _start=start;start=function(){const out=_start.apply(this,arguments);try{resetRun()}catch(err){console.warn('[ReplayPack start]',err)}return out};

  function completeRoute(){if(R.routeDone||!R.route)return;R.routeDone=true;S.scReplay.stats.routes++;coins(85);marks(4);save();openDraft();notice('✓ '+R.route.name,'rota concluída')}
  function openDraft(){if(R.routeDraft||!P)return;R.routeDraft=true;mount();const choices=BOONS.slice().sort(()=>R()-.5).slice(0,3),g=$('scRouteChoices');g.innerHTML='';for(const b of choices){const x=document.createElement('button');x.innerHTML=`<span>${b.icon}</span><b>${b.name}</b><small>${b.desc}</small>`;x.onclick=()=>{for(const q of PL)b.apply(q);$('scRouteDraft').classList.remove('on');R.routeDraft=false;st='play';try{sfx('boss2');FX.push({x:P.x,y:P.y,r:140,t:.35,ring:1})}catch(_){}};g.appendChild(x)}$('scRouteDraft').classList.add('on');st='routeDraft'}

  function offerTrial(){if(R.trial||R.trialOpen||!P||P.dead)return;const t=Object.assign({},TRIALS[Math.floor(R()*TRIALS.length)]);R.trialOpen=true;mount();$('scTrialTitle').textContent=t.icon+' '+t.name;$('scTrialDesc').textContent=t.desc;$('scTrialOffer').classList.add('on');const old=st;st='trialOffer';$('scTrialAccept').onclick=()=>{$('scTrialOffer').classList.remove('on');R.trialOpen=false;R.trial=t;t.end=(typeof T==='number'?T:0)+t.time;try{t.start(t)}catch(_){};st='play';notice(t.name,'DESAFIO ACEITO')};$('scTrialSkip').onclick=()=>{$('scTrialOffer').classList.remove('on');R.trialOpen=false;R.nextTrial=(typeof T==='number'?T:0)+85+R()*40;st=old==='play'?'play':'play'}}
  function finishTrial(ok){const t=R.trial;if(!t)return;if(ok){S.scReplay.stats.trials++;coins(65);marks(3);if(P){P.hp=Math.min(P.mhp,P.hp+Math.max(10,P.mhp*.10));ult=Math.min(100,(ult||0)+15)}notice('✓ '+t.name,'DESAFIO CONCLUÍDO')}else notice('✕ '+t.name,'tente outra vez nesta run');R.trial=null;R.nextTrial=T+105+R()*50;save()}
  function updateTrial(){if(!R.trial)return;let ok=false;try{ok=R.trial.done(R.trial)}catch(_){}if(ok)finishTrial(true);else if(T>=R.trial.end)finishTrial(false)}

  function awardFragment(source){if(!S.scReplay||S.scReplay.archive.length>=ARCHIVE.length)return;const owned=new Set(S.scReplay.archive),pool=ARCHIVE.filter(a=>!owned.has(a[0]));if(!pool.length)return;const chance=source==='boss'?1:source==='elite'?.20:.04;if(R()>chance)return;const f=pool[Math.floor(R()*pool.length)];S.scReplay.archive.push(f[0]);S.scReplay.stats.fragments++;coins(30);save();notice('📜 DESCOBERTA: '+f[1],`${S.scReplay.archive.length}/${ARCHIVE.length} no Arquivo`)}

  const _kill=kill;kill=function(e){const alive=e&&!e.dead,out=_kill.apply(this,arguments);if(alive&&e&&e.dead&&R.active){R.kills++;if(e.boss&&!e.helper&&!e.dv){R.bosses++;awardFragment('boss')}else if(e.el||e.scMini||e.__mutation){R.elites++;awardFragment('elite')}else if(R()<.008)awardFragment('normal')}return out};
  const _hurt=hurt;hurt=function(d){const hp=P&&P.hp,out=_hurt.apply(this,arguments);if(R.active&&P&&hp>P.hp)R.hits++;return out};
  const _dash=dash;dash=function(){const ready=R.active&&P&&!P.dead&&P.dc<=0,out=_dash.apply(this,arguments);if(ready&&P.dT>0)R.dashes++;return out};
  if(typeof useUlt==='function'){const _u=useUlt;useUlt=function(){const before=typeof ult==='number'?ult:0,out=_u.apply(this,arguments);if(R.active&&before>=100&&ult<before)R.ults++;return out}}

  function updateRoute(){if(!R.route||R.routeDone)return;try{if(R.route.goal(R))completeRoute()}catch(_){} }
  function trackCombo(){const c=typeof cmb==='number'?cmb:0;if(c>=100&&R.lastCombo<100)R.combo100++;R.lastCombo=c;if(c===0)R.lastCombo=0}

  function payEndAwards(){if(R.endPaid)return;R.endPaid=true;S.scReplay.stats.runs++;const awards=[];if(R.hits<=3&&T-R.runStart>=120)awards.push(['🪽','INTOCÁVEL',40]);if(R.bosses>=3)awards.push(['👑','CAÇADOR DE BOSSES',45]);if(R.elites>=10)awards.push(['🔥','QUEBRA-ELITES',35]);if(R.kills>=500)awards.push(['☠️','MASSACRE',45]);if(R.dashes>=45)awards.push(['💨','HIPERATIVO',30]);if(R.ults>=6)awards.push(['⚡','SOBRECARGA',35]);if(R.combo100>=2)awards.push(['💥','FLOW MASTER',40]);let total=0;for(const a of awards)total+=a[2];if(total){S.scReplay.stats.awards+=awards.length;S.coins=(S.coins||0)+total;marks(Math.min(8,awards.length));save();try{ban('🏅 '+awards.map(a=>a[1]).slice(0,3).join(' · ')+' · +'+total+' moedas')}catch(_){}}}

  function renderArchive(){mount();const owned=new Set(S.scReplay.archive),g=$('scArchiveGrid'),stt=$('scArchiveStats');if(!g||!stt)return;stt.innerHTML=`<b>${owned.size}/${ARCHIVE.length}</b><span>fragmentos descobertos</span><i>${S.scReplay.stats.routes||0} rotas · ${S.scReplay.stats.trials||0} provas · ${S.scReplay.stats.awards||0} prêmios</i>`;g.innerHTML='';for(const f of ARCHIVE){const on=owned.has(f[0]),d=document.createElement('article');d.className='scArchiveCard'+(on?' unlocked':'');d.innerHTML=`<span>${on?'◈':'?'}</span><div><b>${on?f[1]:'Fragmento desconhecido'}</b><small>${on?f[2]:'Derrote elites e bosses para descobrir.'}</small></div>`;g.appendChild(d)}}
  function updateHud(){mount();const h=$('scReplayHud');if(!h)return;h.classList.toggle('on',R.active&&['play','pause','cards','devi','routeDraft','trialOffer'].includes(st));if(R.route){$('scRouteName').textContent=R.route.icon+' '+R.route.name;$('scRouteProgress').textContent=R.routeDone?'CONCLUÍDA':R.route.progress(R)}const tl=$('scTrialLine');if(R.trial)tl.textContent=`${R.trial.icon} ${R.trial.name} · ${Math.max(0,Math.ceil(R.trial.end-T))}s`;else tl.textContent=`PRÓXIMA PROVA: ${Math.max(0,Math.ceil(R.nextTrial-T))}s`}

  let last=performance.now();
  function loop(now){const dt=Math.min(.06,Math.max(0,(now-last)/1000));last=now;try{mount();if(R.active&&typeof T==='number'&&T+.5<R.lastT)resetRun();R.lastT=typeof T==='number'?T:0;if(st==='play'&&R.active){trackCombo();updateRoute();updateTrial();if(!R.trial&&!R.trialOpen&&!R.routeDraft&&T>=R.nextTrial)offerTrial()}if(st==='over'&&R.active){payEndAwards();R.active=false}updateHud()}catch(err){console.warn('[Replay Pack]',err)}requestAnimationFrame(loop)}
  mount();requestAnimationFrame(loop);
}catch(err){console.error('[Replay Pack init]',err)}
})();