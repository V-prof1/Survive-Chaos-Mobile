/* ©criado por Vitor Ag/Nyx - 2026 */
/* ©criado por Vitor Ag/Nyx - 2026 */
/* ©criado por Vitor Ag/Nyx - 2026 */
/* Survive Chaos Mobile — Finados / Dia dos Mortos Event 31.0 */
(()=>{'use strict';
try{
  if(window.__SC_FINADOS_31__)return;window.__SC_FINADOS_31__=1;
  const VERSION='31.0';
  const TYPES={
    camin:{id:'camin',name:'Caminhante de Cempasúchil',img:'finados-caminhante.svg',col:'#ff9d1f',ai:'c',hp:1.20,sp:.94,dmg:1.10,xp:1.35,scale:4.25},
    catrina:{id:'catrina',name:'Catrina Velada',img:'finados-catrina.svg',col:'#ff4fa3',ai:'a',hp:1.05,sp:1.05,dmg:1.18,xp:1.45,scale:4.35},
    xolo:{id:'xolo',name:'Xolo Guardião',img:'finados-xolo.svg',col:'#4ee8e1',ai:'w',hp:1.38,sp:1.24,dmg:1.22,xp:1.60,scale:4.55},
    mictlan:{id:'mictlan',name:'GUARDIÃO DO MICTLÁN',img:'finados-mictlan-lord.svg',col:'#a761ff',ai:'B',hp:1.34,sp:.96,dmg:1.18,xp:1.55,scale:2.55}
  };
  const imgs={};for(const t of Object.values(TYPES)){const im=new Image();im.decoding='async';im.src=t.img;imgs[t.id]=im}
  let active=false,bossUsed=false,lastPlay=false;
  const isFinadosDate=d=>d instanceof Date&&!Number.isNaN(+d)&&d.getMonth()===10&&d.getDate()===2;
  const tut=()=>!!(document.querySelector('.sc-tut-practice')||(window.SCGuidedTour&&typeof SCGuidedTour.isActive==='function'&&SCGuidedTour.isActive()));

  function ensureBadge(){
    let b=document.getElementById('scFinadosBadge');if(b)return b;
    b=document.createElement('div');b.id='scFinadosBadge';b.innerHTML='<div class="scFinDate"><span><b>02</b>NOV</span></div><div class="scFinTxt"><b>FINADOS</b><small>NOITE DAS MEMÓRIAS</small></div>';
    document.body.appendChild(b);return b;
  }
  function clearSeasonalEntities(){
    try{
      if(Array.isArray(E))E=E.filter(e=>!e?.scFinadosType);
      if(bossE&&bossE.scFinadosBoss){bossE=null;const bb=document.getElementById('boss');if(bb)bb.style.display='none'}
    }catch(_){ }
  }
  function setActive(on){
    on=!!on;if(active===on){document.body?.classList.toggle('scFinados',on);return active}
    active=on;ensureBadge();document.body.classList.toggle('scFinados',active);
    if(active){try{ban('FINADOS: A NOITE DAS MEMÓRIAS COMEÇOU')}catch(_){} }
    else clearSeasonalEntities();
    return active;
  }
  function syncDate(d=new Date()){return setActive(isFinadosDate(d))}

  function pickType(){const r=Math.random();return r<.52?TYPES.camin:r<.82?TYPES.catrina:TYPES.xolo}
  function seasonalize(e,t=pickType()){
    if(!e||e.boss||e.dv||e.scFinadosType)return e;
    e.scFinadosType=t.id;e.scFinadosName=t.name;e.nm=t.name;e.col=t.col;e.ai=t.ai;
    e.mh=Math.max(1,(e.mh||e.hp||1)*t.hp);e.hp=e.mh;e.sp=Math.max(16,(e.sp||35)*t.sp);e.dmg=Math.max(1,(e.dmg||5)*t.dmg);e.xp=Math.max(1,Math.round((e.xp||1)*t.xp));
    e.r=Math.max(e.r||10,t.id==='xolo'?12:11);return e;
  }
  function seasonalBoss(e){
    if(!e)return e;const t=TYPES.mictlan;e.scFinadosType=t.id;e.scFinadosBoss=1;e.scFinadosName=t.name;e.nm=t.name;e.em='';e.sn='';e.col=t.col;
    e.mh=Math.max(1,(e.mh||e.hp||1)*t.hp);e.hp=e.mh;e.sp=Math.max(24,(e.sp||40)*t.sp);e.dmg=Math.max(14,(e.dmg||20)*t.dmg);e.xp=Math.round((e.xp||60)*t.xp);e.r=(e.r||70)*1.08;e.scFinadosPhase=0;
    try{document.getElementById('bn').textContent=t.name;document.getElementById('boss').style.display='block';ban('BOSS DE FINADOS: '+t.name);shake=Math.max(shake||0,16);flash=Math.max(flash||0,.72)}catch(_){}
    return e;
  }

  const baseSpawn=typeof spawn==='function'?spawn:null;
  if(baseSpawn){spawn=function(k,px,py,el){const e=baseSpawn.apply(this,arguments);if(active&&!tut()&&e&&!e.boss){const ch=el ? .18 : .29;if(Math.random()<ch)seasonalize(e)}return e}}
  const baseBoss=typeof boss==='function'?boss:null;
  if(baseBoss){boss=function(i){const out=baseBoss.apply(this,arguments);if(active&&!tut()&&!bossUsed&&bossE){bossUsed=true;seasonalBoss(bossE)}return out}}

  function h(a,b){let n=((a*374761393)^(b*668265263))|0;n=Math.imul(n^(n>>>13),1274126177);return(n^(n>>>16))>>>0}
  function flower(cx,cy,s,seed){
    x.save();x.translate(cx,cy);const rot=(seed%628)/100;x.rotate(rot);for(let i=0;i<8;i++){const a=i*Math.PI/4;x.fillStyle=i%2?'#ff9d1f':'#ffd45a';x.beginPath();x.ellipse(Math.cos(a)*s*.52,Math.sin(a)*s*.52,s*.26,s*.15,a,0,Math.PI*2);x.fill()}x.fillStyle='#8b3f22';x.beginPath();x.arc(0,0,s*.20,0,Math.PI*2);x.fill();x.restore()
  }
  function candle(cx,cy,s,seed){x.save();x.translate(cx,cy);x.fillStyle='rgba(255,236,184,.92)';x.fillRect(-s*.22,-s*.15,s*.44,s*.72);x.fillStyle='#ff9d1f';x.beginPath();x.moveTo(0,-s*.62);x.quadraticCurveTo(s*.26,-s*.35,0,-s*.15);x.quadraticCurveTo(-s*.23,-s*.36,0,-s*.62);x.fill();x.globalAlpha=.24;x.fillStyle='#ffd45a';x.beginPath();x.arc(0,-s*.30,s*.8,0,Math.PI*2);x.fill();x.restore()}
  function altar(cx,cy,seed){
    x.save();x.translate(cx,cy);x.globalAlpha=.88;x.fillStyle='#25142e';x.fillRect(-30,-15,60,30);x.fillStyle='#7c366d';x.fillRect(-24,-10,48,7);x.fillStyle='#ff9d1f';x.fillRect(-18,-1,36,5);x.fillStyle='#4ee8e1';x.fillRect(-7,6,14,4);flower(-34,8,8,seed);flower(34,6,7,seed+2);candle(-20,-19,8,seed);candle(20,-19,8,seed+1);x.restore()
  }
  function grave(cx,cy,seed){x.save();x.translate(cx,cy);x.globalAlpha=.6;x.fillStyle='#2a2530';x.beginPath();x.roundRect(-14,-19,28,38,7);x.fill();x.fillStyle='#bcaec4';x.fillRect(-2,-12,4,18);x.fillRect(-8,-7,16,4);flower(18,13,6,seed);x.restore()}
  function drawWorldDecor(cx,cy){
    if(!active)return;const step=250,rx=Math.max(3,Math.ceil((typeof W==='number'?W:800)/(typeof Z==='number'?Z:1)/step/2)+2),ry=Math.max(3,Math.ceil((typeof H==='number'?H:600)/(typeof Z==='number'?Z:1)/step/2)+2),gx=Math.floor(cx/step),gy=Math.floor(cy/step);
    x.save();for(let i=gx-rx;i<=gx+rx;i++)for(let j=gy-ry;j<=gy+ry;j++){const seed=h(i,j),kind=seed%17;if(kind>5)continue;const ox=((seed>>>8)%120)-60,oy=((seed>>>16)%120)-60,px=i*step+ox,py=j*step+oy;if(kind===0)altar(px,py,seed);else if(kind===1||kind===2)grave(px,py,seed);else{for(let q=0;q<3+(seed%4);q++)flower(px+((h(seed,q)%70)-35),py+((h(q,seed)%70)-35),4+(h(seed+q,q)%4),seed+q)}}x.restore()
  }
  if(typeof world==='function'){const baseWorld=world;world=function(cx,cy){const out=baseWorld.apply(this,arguments);if(active)drawWorldDecor(cx,cy);return out}}

  function drawSprite(c,e,id,alpha=1){
    const im=imgs[id];if(!im||!im.complete||!im.naturalWidth)return false;const t=TYPES[id];if(!t)return false;const bossish=id==='mictlan',w=Math.max(bossish?150:46,(e.r||12)*t.scale),h=w;
    c.save();c.globalAlpha*=alpha;c.imageSmoothingEnabled=false;const bob=Math.sin(((typeof T==='number'?T:0)*7)+(e.x||0)*.01)*(bossish?3:1.7);if(typeof P!=='undefined'&&P&&P.x<e.x)c.scale(-1,1);c.drawImage(im,-w/2,-h*.60+bob,w,h);if((e.fl||0)>0){c.globalCompositeOperation='lighter';c.globalAlpha=.38*alpha;c.drawImage(im,-w/2,-h*.60+bob,w,h)}c.restore();return true
  }
  if(typeof SPR!=='undefined'&&SPR){
    const oldEnemy=SPR.enemy.bind(SPR);SPR.enemy=function(c,e){if(active&&e?.scFinadosType&&drawSprite(c,e,e.scFinadosType))return 1;return oldEnemy(c,e)};
    const oldDeath=SPR.death.bind(SPR);SPR.death=function(c,d){if(d?.scFinadosType&&drawSprite(c,d,d.scFinadosType,Math.max(0,1-(d.t||0)/.7)))return 1;return oldDeath(c,d)};
  }
  if(typeof kill==='function'){
    const baseKill=kill;kill=function(e){const before=Array.isArray(DS)?DS.length:0,type=e?.scFinadosType;const out=baseKill.apply(this,arguments);if(type&&Array.isArray(DS)&&DS.length>before){const d=DS[DS.length-1];d.scFinadosType=type;d.r=e.r;d.x=e.x;d.y=e.y}return out}
  }

  function summonXolos(b){
    if(!baseSpawn||!b)return;for(let i=0;i<4;i++){const a=i*Math.PI/2+(Math.random()-.5)*.3,e=baseSpawn(8,b.x+Math.cos(a)*120,b.y+Math.sin(a)*120,0);if(e)seasonalize(e,TYPES.xolo)}
    try{dark=Math.max(dark||0,5);shake=Math.max(shake||0,9);ban('O GUARDIÃO DO MICTLÁN ABRIU O VÉU DOS MORTOS')}catch(_){}
  }
  if(typeof upd==='function'){
    const baseUpd=upd;upd=function(dt){const out=baseUpd.apply(this,arguments);try{
      const playing=typeof st!=='undefined'&&st==='play';if(playing&&!lastPlay)bossUsed=false;lastPlay=playing;
      if(active&&playing&&bossE?.scFinadosBoss&&!bossE.dead){const r=bossE.hp/Math.max(1,bossE.mh),want=r<.33?2:r<.66?1:0;while((bossE.scFinadosPhase||0)<want){bossE.scFinadosPhase=(bossE.scFinadosPhase||0)+1;summonXolos(bossE)}}
    }catch(_){ }return out}
  }

  syncDate();ensureBadge();const timer=setInterval(()=>syncDate(),30000);addEventListener('pagehide',()=>clearInterval(timer),{once:true});
  window.SCFinadosEvent={version:VERSION,isFinadosDate,sync:syncDate,get active(){return active},types:Object.values(TYPES).map(t=>({id:t.id,name:t.name,img:t.img})),seasonalize,seasonalBoss};
  console.log('[Mobile] Finados Event 31.0 ready: annual Nov 2 theme, map memorial details, seasonal enemies and Mictlán boss.');
}catch(err){console.error('[Mobile Finados Event 31.0]',err)}
})();
