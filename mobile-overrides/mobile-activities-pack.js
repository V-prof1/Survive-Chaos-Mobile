/* ©criado por Vitor Ag/Nyx - 2026 */
/* ©criado por Vitor Ag/Nyx - 2026 */
/* ©criado por Vitor Ag/Nyx - 2026 */
(() => {
'use strict';
try{
  const byId=id=>document.getElementById(id);
  const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
  const nowStats=()=>{
    S.scOps=S.scOps||{};
    S.scOps.marks=Number(S.scOps.marks)||0;
    S.scOps.claimed=Array.isArray(S.scOps.claimed)?S.scOps.claimed:[];
    S.scOps.stats=Object.assign({kills:0,elites:0,bosses:0,contracts:0,ops:0,time:0,dashes:0,ults:0},S.scOps.stats||{});
    return S.scOps;
  };
  const career=nowStats();

  const run={active:false,contracts:[],op:null,nextOp:75,hudT:0,perfT:0,stable:0,lastEndT:-1};
  const TITLES=['RECRUTA','CAÇADOR','EXECUTOR','CARRASCO','ANIQUILADOR','LORDE DO CAOS','PREDADOR DO VAZIO'];
  const rank=()=>1+Math.floor((career.marks||0)/25);
  const rankName=()=>TITLES[Math.min(TITLES.length-1,Math.floor((rank()-1)/3))];
  const fmtTime=s=>{s=Math.max(0,Math.floor(s||0));return String(Math.floor(s/60)).padStart(2,'0')+':'+String(s%60).padStart(2,'0')};
  const markScale=()=>CF&&CF.m===4?.35:CF&&CF.m===0?.7:CF&&CF.m===3?1.35:CF&&CF.m===2?1.15:1;
  const coinScale=()=>Math.max(.12,Math.min(1.5,(MZ&&MZ[4])||1));
  const addMarks=n=>{career.marks=(career.marks||0)+Math.max(1,Math.round(n*markScale()));sv()};

  // ===== CONTRATOS ENCADEADOS =====
  const CT=[
    {id:'kills',icon:'☠️',name:'Extermínio',target:()=>55+Math.floor(R()*36),desc:n=>'Elimine '+n+' inimigos.',marks:2,coins:32},
    {id:'elite',icon:'🔥',name:'Caça de Elite',target:()=>2+Math.floor(R()*3),desc:n=>'Derrube '+n+' elites ou mini-bosses.',marks:3,coins:45},
    {id:'boss',icon:'👑',name:'Quebra-Coroas',target:()=>1,desc:()=> 'Derrote um boss.',marks:4,coins:58},
    {id:'xp',icon:'💠',name:'Coletor',target:()=>90+Math.floor(R()*71),desc:n=>'Colete '+n+' pontos de XP bruto.',marks:2,coins:30},
    {id:'time',icon:'⏱️',name:'Sobrevivente',target:()=>75+Math.floor(R()*76),desc:n=>'Sobreviva por '+n+' segundos.',marks:2,coins:34},
    {id:'dash',icon:'💨',name:'Sem Freio',target:()=>8+Math.floor(R()*8),desc:n=>'Use Dash '+n+' vezes.',marks:2,coins:28},
    {id:'ult',icon:'⚡',name:'Sobrecarga',target:()=>2+Math.floor(R()*3),desc:n=>'Use a ULT '+n+' vezes.',marks:3,coins:42},
    {id:'rift',icon:'🌀',name:'Serviço de Campo',target:()=>1,desc:()=> 'Conclua uma Operação de Campo.',marks:4,coins:50}
  ];
  function makeContract(exclude=[]){
    const pool=CT.filter(t=>!exclude.includes(t.id));const t=pool[Math.floor(R()*pool.length)]||CT[0],n=t.target();
    return {id:t.id,icon:t.icon,name:t.name,target:n,progress:0,desc:t.desc(n),marks:t.marks,coins:t.coins,done:false,respawn:0};
  }
  function resetContracts(){run.contracts=[];while(run.contracts.length<3){const c=makeContract(run.contracts.map(q=>q.id));run.contracts.push(c)}}
  function contractEvent(kind,amount=1){
    if(!run.active)return;
    for(const c of run.contracts){if(c.done||c.id!==kind)continue;c.progress=Math.min(c.target,c.progress+amount);if(c.progress>=c.target)completeContract(c)}
  }
  function completeContract(c){
    if(c.done)return;c.done=true;c.respawn=T+7;
    const reward=Math.max(2,Math.round(c.coins*coinScale()));earned+=reward;addMarks(c.marks);career.stats.contracts++;sv();
    try{ban('✓ CONTRATO: '+c.name+' · +'+reward+' moedas');sfx('boss2')}catch(_){}
  }
  function refreshContracts(){
    for(let i=0;i<run.contracts.length;i++){const c=run.contracts[i];if(c.done&&T>=c.respawn){run.contracts[i]=makeContract(run.contracts.filter((_,j)=>j!==i).map(q=>q.id))}}
  }

  // ===== OPERAÇÕES DE CAMPO =====
  const opPoint=(min=210,max=330)=>{const a=R()*PI*2,d=min+R()*(max-min);return {x:P.x+Math.cos(a)*d,y:P.y+Math.sin(a)*d}};
  const near=(a,b,r)=>{const dx=a.x-b.x,dy=a.y-b.y;return dx*dx+dy*dy<=r*r};
  function opNotice(t){try{ban(t);sfx('ui')}catch(_){}}
  function spawnAround(px,py,n,eliteChance=0){
    for(let i=0;i<n;i++){const a=R()*PI*2,d=90+R()*170;spawn(pick(),px+Math.cos(a)*d,py+Math.sin(a)*d,R()<eliteChance)}
  }
  function startOperation(){
    if(!run.active||run.op||!P||P.dead)return;
    if(typeof DV!=='undefined'&&DV.e){run.nextOp=T+45;return}
    const kind=['beacon','hunt','supply','rift'][Math.floor(R()*4)];
    if(kind==='beacon'){
      const p=opPoint();run.op={kind,name:'DEFESA DO SINAL',icon:'📡',x:p.x,y:p.y,hold:0,need:8,spawn:1.2};
      opNotice('📡 OPERAÇÃO: alcance o sinal e segure a área');
    }else if(kind==='hunt'){
      const [px,py]=edge(),e=spawn(pick(),px,py,1);if(!e){run.nextOp=T+20;return}
      e.hp*=2.6;e.mh=e.hp;e.dmg*=1.32;e.r*=1.18;e.scFieldBounty=1;e.scBountyName='ALVO PRIORITÁRIO';
      run.op={kind,name:'CAÇADA PRIORITÁRIA',icon:'🎯',target:e};opNotice('🎯 OPERAÇÃO: um alvo prioritário entrou na arena');
    }else if(kind==='supply'){
      const nodes=[];for(let i=0;i<3;i++){const p=opPoint(180,340);nodes.push({x:p.x,y:p.y,got:false})}
      run.op={kind,name:'VARREDURA DE SUPRIMENTOS',icon:'📦',nodes,got:0};opNotice('📦 OPERAÇÃO: colete 3 caches espalhados');
    }else{
      const p=opPoint(230,330);run.op={kind,name:'SELAR A FENDA',icon:'🌀',x:p.x,y:p.y,kills:0,need:14};spawnAround(p.x,p.y,16,.08);opNotice('🌀 OPERAÇÃO: elimine inimigos dentro da fenda');
    }
  }
  function finishOperation(extra=''){
    const op=run.op;if(!op)return;
    const base={beacon:45,hunt:65,supply:55,rift:70}[op.kind]||45,reward=Math.max(4,Math.round(base*coinScale()));
    earned+=reward;addMarks(op.kind==='hunt'||op.kind==='rift'?6:4);career.stats.ops++;contractEvent('rift',1);
    if(P){P.hp=Math.min(P.mhp,P.hp+Math.max(12,P.mhp*.12));ult=Math.min(100,(ult||0)+18)}
    if(op.kind==='hunt'||op.kind==='rift')G.push({x:P.x+20,y:P.y,v:1,k:4});
    try{ban('✓ OPERAÇÃO CONCLUÍDA · +'+reward+' moedas'+(extra?' · '+extra:''));sfx('boss2');FX.push({x:P.x,y:P.y,r:150,t:.35,ring:1})}catch(_){}
    run.op=null;run.nextOp=T+125+R()*55;sv();
  }
  function updateOperation(dt){
    const op=run.op;if(!op)return;
    if(typeof DV!=='undefined'&&DV.e)return;
    if(op.kind==='beacon'){
      const inside=near(P,op,68);op.hold=clamp(op.hold+(inside?dt:-dt*.65),0,op.need);op.spawn-=dt;
      if(op.spawn<=0){op.spawn=2.7;spawnAround(op.x,op.y,inside?5:3,.06)}
      if(op.hold>=op.need)finishOperation('sinal estabilizado');
    }else if(op.kind==='hunt'){
      if(!op.target||op.target.dead)finishOperation('alvo abatido');
    }else if(op.kind==='supply'){
      for(const n of op.nodes){if(!n.got&&near(P,n,25)){n.got=true;op.got++;earned+=Math.max(1,Math.round(6*coinScale()));try{sfx('coin');FX.push({x:n.x,y:n.y,r:55,t:.22,ring:1})}catch(_){}}}
      if(op.got>=op.nodes.length)finishOperation('caches recuperados');
    }else if(op.kind==='rift'&&op.kills>=op.need)finishOperation('fenda selada');
  }

  // ===== CENTRO DE OPERAÇÕES / METAPROGRESSÃO =====
  const MILE=[
    {id:'k500',icon:'☠️',name:'Primeiro Massacre',desc:'Elimine 500 inimigos no total.',key:'kills',need:500,coins:180,marks:5},
    {id:'k2500',icon:'💀',name:'Montanha de Corpos',desc:'Elimine 2.500 inimigos no total.',key:'kills',need:2500,coins:650,marks:12},
    {id:'e25',icon:'🔥',name:'Quebra-Elites',desc:'Derrube 25 elites ou mini-bosses.',key:'elites',need:25,coins:260,marks:7},
    {id:'b10',icon:'👑',name:'Colecionador de Coroas',desc:'Derrote 10 bosses.',key:'bosses',need:10,coins:420,marks:9},
    {id:'c20',icon:'📋',name:'Mercenário',desc:'Conclua 20 contratos.',key:'contracts',need:20,coins:380,marks:10},
    {id:'o10',icon:'📡',name:'Operador',desc:'Conclua 10 Operações de Campo.',key:'ops',need:10,coins:450,marks:12},
    {id:'t3600',icon:'⏱️',name:'Uma Hora no Caos',desc:'Some 60 minutos sobrevividos.',key:'time',need:3600,coins:520,marks:10},
    {id:'u50',icon:'⚡',name:'Sobrecarga Crônica',desc:'Use 50 ULTs.',key:'ults',need:50,coins:300,marks:8}
  ];
  function mountUI(){
    if(!byId('scActivityHud')){
      const h=document.createElement('div');h.id='scActivityHud';h.innerHTML='<div class="scActHead"><b>🎯 ATIVIDADES</b><button id="scActToggle" type="button">−</button></div><div id="scActBody"><div id="scOpLine"></div><div id="scContractLines"></div></div>';
      document.body.appendChild(h);byId('scActToggle').onclick=()=>h.classList.toggle('mini');
    }
    if(!byId('scOpsCenter')){
      const s=document.createElement('div');s.className='scr';s.id='scOpsCenter';s.innerHTML='<div class="panel scOpsPanel"><div class="scOpsHead"><div><small>CENTRAL DE OPERAÇÕES</small><h2>CARREIRA NO CAOS</h2></div><button class="btn g s" id="scOpsBack">← Voltar</button></div><div id="scOpsCareer"></div><div class="lbl">MARCOS DE CARREIRA</div><div id="scMilestones"></div></div>';
      document.body.appendChild(s);byId('scOpsBack').onclick=()=>{hide('scOpsCenter');show('menu');st='menu'};
    }
    if(!byId('scOpsBtn')){
      const stack=document.querySelector('#menu .stack')||document.querySelector('#menu .mb');if(stack){const b=document.createElement('button');b.id='scOpsBtn';b.className='btn g';b.textContent='🎯 Operações';b.onclick=()=>{hide('menu');show('scOpsCenter');st='scops';renderCareer()};stack.appendChild(b)}
    }
  }
  function renderCareer(){
    mountUI();const c=byId('scOpsCareer');if(!c)return;const s=career.stats;
    c.innerHTML='<div class="scRank"><span>RANK '+rank()+'</span><b>'+rankName()+'</b><i>'+career.marks+' MARCAS DO CAOS</i></div><div class="scStatGrid">'+
      '<span><b>'+s.kills.toLocaleString('pt-BR')+'</b>abates</span><span><b>'+s.elites+'</b>elites</span><span><b>'+s.bosses+'</b>bosses</span><span><b>'+s.contracts+'</b>contratos</span><span><b>'+s.ops+'</b>operações</span><span><b>'+fmtTime(s.time)+'</b>tempo</span></div>';
    const g=byId('scMilestones');g.innerHTML='';
    for(const m of MILE){const got=career.claimed.includes(m.id),v=career.stats[m.key]||0,ready=v>=m.need,d=document.createElement('div');d.className='scMile'+(ready?' ready':'')+(got?' claimed':'');
      d.innerHTML='<span>'+m.icon+'</span><div><b>'+m.name+'</b><small>'+m.desc+'</small><i>'+Math.min(v,m.need).toLocaleString('pt-BR')+' / '+m.need.toLocaleString('pt-BR')+'</i></div>';
      const b=document.createElement('button');b.type='button';b.disabled=got||!ready;b.textContent=got?'RESGATADO':ready?'RESGATAR':'EM PROGRESSO';
      b.onclick=()=>{if(!ready||career.claimed.includes(m.id))return;career.claimed.push(m.id);S.coins=(S.coins||0)+m.coins;career.marks+=m.marks;sv();try{ref();sfx('boss2')}catch(_){};renderCareer()};d.appendChild(b);g.appendChild(d)}
  }
  function updateActivityHud(){
    mountUI();const h=byId('scActivityHud');if(!h)return;h.classList.toggle('on',run.active&&['play','cards','pause','devi'].includes(st));
    const op=run.op,ol=byId('scOpLine');
    if(!op)ol.innerHTML='<small>PRÓXIMA OPERAÇÃO</small><b>em '+Math.max(0,Math.ceil(run.nextOp-T))+'s</b>';
    else if(op.kind==='beacon')ol.innerHTML='<small>'+op.icon+' '+op.name+'</small><b>SEGURE A ÁREA · '+Math.floor(op.hold/op.need*100)+'%</b>';
    else if(op.kind==='hunt')ol.innerHTML='<small>'+op.icon+' '+op.name+'</small><b>ELIMINE O ALVO MARCADO</b>';
    else if(op.kind==='supply')ol.innerHTML='<small>'+op.icon+' '+op.name+'</small><b>CACHES '+op.got+'/'+op.nodes.length+'</b>';
    else ol.innerHTML='<small>'+op.icon+' '+op.name+'</small><b>ABATES NA FENDA '+op.kills+'/'+op.need+'</b>';
    const box=byId('scContractLines');box.innerHTML=run.contracts.map(c=>'<div class="scContract '+(c.done?'done':'')+'"><span>'+c.icon+'</span><div><b>'+c.name+'</b><small>'+(c.done?'CONCLUÍDO':c.desc)+'</small></div><i>'+Math.floor(c.progress)+'/'+c.target+'</i></div>').join('');
  }

  // ===== MARCADORES NO MUNDO =====
  function worldToScreen(px,py){return {x:(px-cam.x)*Z+W/2,y:(py-cam.y)*Z+H/2}}
  function marker(px,py,label,col='#7ce8ff',progress=-1){
    const p=worldToScreen(px,py),pad=28,sx=clamp(p.x,pad,W-pad),sy=clamp(p.y,pad,H-pad),off=p.x!==sx||p.y!==sy;
    x.save();x.translate(sx,sy);x.globalAlpha=.92;x.strokeStyle=col;x.fillStyle='rgba(7,12,20,.72)';x.lineWidth=3;x.beginPath();x.arc(0,0,off?14:24,0,PI*2);x.fill();x.stroke();
    if(progress>=0){x.strokeStyle='#fff';x.lineWidth=4;x.beginPath();x.arc(0,0,30,-PI/2,-PI/2+PI*2*clamp(progress,0,1));x.stroke()}
    x.fillStyle='#fff';x.font='800 12px Nunito, sans-serif';x.textAlign='center';x.textBaseline='middle';x.fillText(label,0,1);x.restore();
  }
  const baseDraw=draw;
  draw=function(t){const out=baseDraw.apply(this,arguments);if(run.active&&run.op&&['play','cards','pause','devi'].includes(st)){
    const op=run.op;if(op.kind==='beacon')marker(op.x,op.y,'📡','#56f2d4',op.hold/op.need);else if(op.kind==='rift')marker(op.x,op.y,'🌀','#b56cff',op.kills/op.need);else if(op.kind==='supply')for(const n of op.nodes)if(!n.got)marker(n.x,n.y,'📦','#ffd45a');else if(op.kind==='hunt'&&op.target&&!op.target.dead)marker(op.target.x,op.target.y,'🎯','#ff647a');
    return out}return out};

  // ===== GANCHOS DE GAMEPLAY =====
  const baseStart=start;
  start=function(){const out=baseStart.apply(this,arguments);run.active=true;run.op=null;run.nextOp=70+R()*25;run.hudT=0;run.perfT=0;resetContracts();updateActivityHud();return out};

  const baseKill2=kill;
  kill=function(e){const dead=!!(e&&e.dead),isElite=!!(e&&(e.el||e.scMini||e.__mutation)),isBoss=!!(e&&e.boss),px=e&&e.x,py=e&&e.y;const out=baseKill2.apply(this,arguments);
    if(!dead&&e&&e.dead){career.stats.kills++;contractEvent('kills',1);if(isElite){career.stats.elites++;contractEvent('elite',1)}if(isBoss&&!e.helper&&!e.dv){career.stats.bosses++;contractEvent('boss',1)}
      if(run.op&&run.op.kind==='rift'&&px!=null){const dx=px-run.op.x,dy=py-run.op.y;if(dx*dx+dy*dy<240*240)run.op.kills++}
      if(run.op&&run.op.kind==='hunt'&&e===run.op.target)finishOperation('alvo abatido');
    }return out};

  const baseXP=xpAdd;xpAdd=function(v){if(run.active&&v>0)contractEvent('xp',v);return baseXP.apply(this,arguments)};
  const baseDash2=dash;dash=function(){const ok=run.active&&st==='play'&&P&&!P.dead&&P.dc<=0,out=baseDash2.apply(this,arguments);if(ok){career.stats.dashes++;contractEvent('dash',1)}return out};
  if(typeof fireUlt==='function'){const baseUlt=fireUlt;fireUlt=function(){const ok=run.active&&st==='play'&&ult>=100,out=baseUlt.apply(this,arguments);if(ok){career.stats.ults++;contractEvent('ult',1)}return out}}

  // ===== OTIMIZAÇÃO ADAPTATIVA =====
  function trimOld(a,cap){if(a&&a.length>cap)a.splice(0,a.length-cap)}
  function pruneFar(a,maxD){if(!a||!a.length||!PL||!PL.length)return;const md=maxD*maxD;for(let i=a.length-1;i>=0;i--){const o=a[i];if(!o||o.x==null)continue;let close=false;for(const q of PL){if(!q||q.dead)continue;const dx=o.x-q.x,dy=o.y-q.y;if(dx*dx+dy*dy<md){close=true;break}}if(!close)a.splice(i,1)}}
  function mergeXP(){
    if(!G||G.length<170)return;const map=new Map(),keep=[];
    for(const g of G){if(!g||g.k!==0||g.v<0){keep.push(g);continue}const k=Math.floor(g.x/42)+','+Math.floor(g.y/42),old=map.get(k);if(old)old.v+=g.v;else{map.set(k,g);keep.push(g)}}
    if(keep.length<G.length){G.length=0;G.push(...keep)}
  }
  function perfPass(){
    const f=Number(fps)||60;
    pruneFar(B,f<38?1050:1450);pruneFar(EB,f<38?900:1250);
    if(f<34){trimOld(PA,120);trimOld(FX,55);trimOld(TX,24);trimOld(DS,36);trimOld(EB,280);trimOld(B,330);LQ=Math.max(LQ,2)}
    else if(f<43){trimOld(PA,200);trimOld(FX,85);trimOld(TX,36);trimOld(DS,55);trimOld(EB,420);trimOld(B,520);LQ=Math.max(LQ,1)}
    else{trimOld(PA,320);trimOld(FX,130);trimOld(TX,55);trimOld(DS,80)}
    mergeXP();
    if(f>56)run.stable++;else run.stable=0;if(run.stable>=10&&LQ>0){LQ--;run.stable=0}
    window.SCPerfGovernor={fps:f,quality:LQ,enemies:E.length,bullets:B.length,enemyBullets:EB.length,drops:G.length};
  }

  const baseUpd2=upd;
  upd=function(dt){const out=baseUpd2.apply(this,arguments);if(run.active){contractEvent('time',dt);refreshContracts();updateOperation(dt);if(!run.op&&T>=run.nextOp)startOperation();run.hudT+=dt;run.perfT+=dt;if(run.hudT>=.28){run.hudT=0;updateActivityHud()}if(run.perfT>=1){run.perfT=0;perfPass()}}return out};

  const baseEnd=end;
  end=function(){if(run.active&&run.lastEndT!==T){run.lastEndT=T;career.stats.time+=Math.max(0,Math.floor(T));run.active=false;run.op=null;sv();updateActivityHud()}return baseEnd.apply(this,arguments)};

  mountUI();renderCareer();
  window.SCActivities={version:'5.0',career,run,open:()=>{hide('menu');show('scOpsCenter');st='scops';renderCareer()}};
  console.log('[Mobile] Activities Pack 5.0: contracts, field operations, career milestones and adaptive performance governor enabled.');
}catch(err){console.warn('[Mobile Activities Pack 5.0]',err)}
})();
