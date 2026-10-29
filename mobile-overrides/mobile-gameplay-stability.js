/* ©criado por Vitor Ag/Nyx - 2026 */
/* ©criado por Vitor Ag/Nyx - 2026 */
/* ©criado por Vitor Ag/Nyx - 2026 */
(() => {
'use strict';
try{
  const VERSION='20.0';
  const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
  const profiles=[
    {name:'Fácil',enemy:80,elite:4,boss:1,enemyShots:90,markers:24,ringBurst:14,eliteBurst:1,radial:9,shotChance:.74,rush:96,mini:420,adapt:180,sector:180},
    {name:'Médio',enemy:125,elite:7,boss:1,enemyShots:165,markers:38,ringBurst:22,eliteBurst:2,radial:13,shotChance:.94,rush:82,mini:255,adapt:105,sector:150},
    {name:'Difícil',enemy:185,elite:12,boss:2,enemyShots:270,markers:58,ringBurst:34,eliteBurst:3,radial:19,shotChance:1,rush:66,mini:175,adapt:72,sector:132},
    {name:'Pesadelo',enemy:275,elite:18,boss:3,enemyShots:430,markers:90,ringBurst:50,eliteBurst:4,radial:28,shotChance:1,rush:52,mini:120,adapt:52,sector:112},
    {name:'Baby',enemy:52,elite:2,boss:1,enemyShots:58,markers:15,ringBurst:8,eliteBurst:1,radial:6,shotChance:.48,rush:120,mini:1e9,adapt:1e9,sector:215}
  ];
  const prof=()=>profiles[(typeof CF!=='undefined'&&Number.isInteger(CF.m))?CF.m:1]||profiles[1];
  const alive=e=>e&&!e.dead;
  const bosses=()=>Array.isArray(E)?E.filter(e=>alive(e)&&e.boss&&!e.helper):[];
  const normals=()=>Array.isArray(E)?E.filter(e=>alive(e)&&!e.boss):[];
  const eliteCount=()=>normals().filter(e=>e.el||e.scMini||e.scMiniBoss||e.scLegendary||e.__mutation).length;
  const dist2=e=>{try{return P?(e.x-P.x)**2+(e.y-P.y)**2:0}catch(_){return 0}};

  // ---- Spawn integrity: every expansion must respect the selected difficulty. ----
  if(typeof spawn==='function'){
    const oldSpawn=spawn;
    spawn=function(k,px,py,el){
      const p=prof();
      if(normals().length>=p.enemy)return null;
      if(el&&eliteCount()>=p.elite)return null;
      return oldSpawn.apply(this,arguments);
    };
  }
  if(typeof ring==='function'){
    const oldRing=ring;
    ring=function(n){
      const p=prof(),room=Math.max(0,p.enemy-normals().length);
      const want=Math.max(0,Math.floor(Number.isFinite(+n)?+n:1));
      const use=Math.min(want,room,p.ringBurst);
      if(use<=0)return null;
      const a=[...arguments];a[0]=use;return oldRing.apply(this,a);
    };
  }
  if(typeof elite==='function'){
    const oldElite=elite;
    elite=function(n){
      const p=prof(),room=Math.max(0,p.elite-eliteCount());
      const want=Math.max(1,Math.floor(Number.isFinite(+n)?+n:1));
      const use=Math.min(want,room,p.eliteBurst);
      if(use<=0)return null;
      const a=[...arguments];a[0]=use;return oldElite.apply(this,a);
    };
  }
  if(typeof boss==='function'){
    const oldBoss=boss;
    boss=function(){
      const p=prof(),before=new Set(bosses());
      if(before.size>=p.boss)return (typeof bossE!=='undefined'&&bossE&&!bossE.dead)?bossE:[...before][0]||null;
      const out=oldBoss.apply(this,arguments);
      try{
        for(const e of bosses())if(!before.has(e)){
          // Extra boss mechanics may exist, but their cadence still follows difficulty.
          if(typeof e.scVariantCd==='number')e.scVariantCd=Math.max(e.scVariantCd,CF.m===4?6.8:CF.m===0?5.2:CF.m===1?4.1:CF.m===2?2.9:2.1);
          e.__scDifficultyGovernor=CF.m;
        }
      }catch(_){ }
      return out;
    };
  }
  if(typeof radial==='function'){
    const oldRadial=radial;
    radial=function(e,n){const a=[...arguments];a[1]=Math.min(Math.max(1,Math.floor(+n||1)),prof().radial);return oldRadial.apply(this,a)};
  }
  if(typeof aim==='function'){
    const oldAim=aim;
    aim=function(e){
      const p=prof();
      if(e&&e!==P&&Math.random()>p.shotChance)return null;
      return oldAim.apply(this,arguments);
    };
  }
  if(typeof summon==='function'){
    const oldSummon=summon;
    summon=function(e,k,n){
      const p=prof(),room=Math.max(0,p.enemy-normals().length),a=[...arguments];
      if(a.length>=3)a[2]=Math.min(Math.max(0,Math.floor(+n||0)),room,CF.m===4?2:CF.m===0?3:CF.m===1?5:CF.m===2?8:12);
      if(a.length>=3&&a[2]<=0)return null;
      return oldSummon.apply(this,a);
    };
  }

  // ---- Difficulty-aware timers for expansion systems. ----
  function tuneSystems(){
    const p=prof();
    try{
      const m=window.SCModesPack&&window.SCModesPack.state;
      if(m&&m.active){
        if(m.mode===1)m.nextBoss=Math.max(Number(m.nextBoss)||0,(typeof T==='number'?T:0)+p.rush);
        if(m.mode===5)m.blitzBoss=Math.max(Number(m.blitzBoss)||0,(typeof T==='number'?T:0)+Math.round(p.rush*1.55));
      }
    }catch(_){ }
    try{
      const t=window.SCWorldThreats&&window.SCWorldThreats.state;
      if(t){t.nextMini=(typeof T==='number'?T:0)+p.mini;t.nextAdapt=(typeof T==='number'?T:0)+p.adapt}
    }catch(_){ }
    try{
      const w=window.SCWorldshift&&window.SCWorldshift.state;
      if(w&&w.active){w.nextSector=Math.max(Number(w.nextSector)||0,(typeof T==='number'?T:0)+p.sector);w.nextDirector=Math.max(Number(w.nextDirector)||0,(typeof T==='number'?T:0)+(CF.m===4?70:CF.m===0?55:CF.m===1?42:CF.m===2?35:28))}
    }catch(_){ }
  }
  if(typeof start==='function'){
    const oldStart=start;
    start=function(){const out=oldStart.apply(this,arguments);setTimeout(tuneSystems,0);return out};
  }

  // ---- Rare encounters are mechanics, not giant character canvases. ----
  const eventNames=new Map([
    ['FERREIRO ERRANTE',['🛠️ OFICINA IMPROVISADA','Uma oficina rara surgiu no setor. Escolha um serviço para esta run.']],
    ['MÉDICA DO VAZIO',['🩺 ESTAÇÃO DE RECUPERAÇÃO','Uma estação médica instável ficou acessível por alguns segundos.']],
    ['CONTRABANDISTA',['📦 CACHE ILEGAL','Um carregamento proibido foi encontrado. Escolha o que aproveitar.']],
    ['CAÇADOR DE COROAS',['🎯 CONTRATO DE CAÇA','Um contrato raro apareceu. Escolha o risco que quer assumir.']],
    ['CIENTISTA DA FÁBRICA',['🧪 PROTOCOLO DE RUPTURA','Um protocolo experimental pode alterar esta run.']]
  ]);
  function sanitizeRareEvent(){
    const portrait=document.getElementById('scNpcPortrait');if(portrait)portrait.remove();
    const root=document.getElementById('scWorldEvent');if(!root||!root.classList.contains('on'))return;
    const tag=document.getElementById('scEventTag'),title=document.getElementById('scEventTitle'),desc=document.getElementById('scEventDesc');
    if(!tag||!/NPC RARO/i.test(tag.textContent||''))return;
    tag.textContent='EVENTO RARO';
    const raw=(title&&title.textContent||'').toUpperCase();
    for(const [name,repl] of eventNames){if(raw.includes(name)){if(title)title.textContent=repl[0];if(desc)desc.textContent=repl[1];break}}
  }
  const st=document.createElement('style');st.textContent='#scNpcPortrait{display:none!important;position:static!important;width:0!important;height:0!important;pointer-events:none!important}';document.head.appendChild(st);

  // ---- Extra enemy sprite fix: attack rows contained baked projectiles on some characters.
  // Keep the smooth walk/hit animation, but actual projectiles are now drawn only by gameplay. ----
  function installStableExtraRenderer(){
    const extra=window.SCExtraCharacters;if(!extra||!extra.image||typeof extra.resolveEnemy!=='function'||typeof SPR==='undefined'||!SPR||SPR.__scStableExtra)return false;
    const previous=SPR.enemy.bind(SPR),img=extra.image,ROW=16,BLOCK=64,FRAMES=6;
    SPR.enemy=function(c,e){
      const idx=extra.resolveEnemy(e);
      if(idx<0||!extra.ready())return previous(c,e);
      const row=(e.fl||0)>0?2:0; // never row 1: it contained the held-projectile attack artwork.
      const f=Math.floor(((typeof T==='number'?T:0)*(row===2?12:8)+(e.ph||0)*4))%FRAMES;
      const sx=f*ROW,sy=idx*BLOCK+row*ROW,bossish=!!(e.scMiniBoss||e.scMini||e.scLegendary||e.scNemesis);
      const w=Math.max(40,e.r*(bossish?4.15:3.65)),h=w,gy=e.r*.92,flip=typeof P!=='undefined'&&P&&P.x<e.x;
      c.save();
      if(e.el||bossish){c.globalAlpha=.25;c.fillStyle=e.scLegendary?'#ff334b':e.scNemesis?'#f5f5f7':'#ffffff';c.beginPath();c.arc(0,0,e.r*(bossish?1.65:1.4),0,Math.PI*2);c.fill();c.globalAlpha=1}
      if(flip)c.scale(-1,1);c.imageSmoothingEnabled=false;c.drawImage(img,sx,sy,ROW,ROW,-w/2,gy-h,w,h);c.restore();return 1;
    };
    SPR.__scStableExtra=1;return true;
  }

  // ---- Runtime hard caps. They remove overflow without rewards, so the player is never punished/rewarded for a bug. ----
  function enforce(){
    const p=prof();
    try{
      if(Array.isArray(E)){
        const bs=bosses();
        if(bs.length>p.boss){
          const ordered=bs.slice().sort((a,b)=>((b.dv?1:0)-(a.dv?1:0))||((a.hp/Math.max(1,a.mh))-(b.hp/Math.max(1,b.mh))));
          const keep=new Set(ordered.slice(0,p.boss));
          for(let i=E.length-1;i>=0;i--){const e=E[i];if(e&&e.boss&&!e.helper&&!keep.has(e))E.splice(i,1)}
          if(typeof bossE!=='undefined'&&(!bossE||!keep.has(bossE)))bossE=ordered.find(e=>keep.has(e))||null;
        }
        const ns=normals();
        if(ns.length>p.enemy){
          let excess=ns.length-p.enemy;
          const victims=ns.slice().sort((a,b)=>{
            const pa=(a.scLegendary||a.scMini||a.scMiniBoss||a.__scBounty2||a.el)?1:0,pb=(b.scLegendary||b.scMini||b.scMiniBoss||b.__scBounty2||b.el)?1:0;
            return pa-pb||dist2(b)-dist2(a);
          });
          const remove=new Set(victims.slice(0,excess));for(let i=E.length-1;i>=0;i--)if(remove.has(E[i]))E.splice(i,1);
        }
      }
      if(Array.isArray(EB)&&EB.length>p.enemyShots)EB.splice(0,EB.length-p.enemyShots);
      if(Array.isArray(MK)&&MK.length>p.markers)MK.splice(0,MK.length-p.markers);
      if(Array.isArray(RG)&&RG.length>Math.ceil(p.markers*.45))RG.splice(0,RG.length-Math.ceil(p.markers*.45));
    }catch(e){console.warn('[Difficulty governor enforce]',e)}
    sanitizeRareEvent();installStableExtraRenderer();
  }

  let timer=setInterval(enforce,220);
  addEventListener('pagehide',()=>clearInterval(timer),{once:true});
  installStableExtraRenderer();sanitizeRareEvent();
  window.SCDifficultyIntegrity={version:VERSION,profiles,get profile(){return prof()},enforce,tuneSystems};
  console.log('[Mobile] Gameplay Stability '+VERSION+' enabled: difficulty caps, boss-stack prevention, rare-event UI cleanup and projectile-art sprite fix.');
}catch(err){console.warn('[Mobile Gameplay Stability 20.0]',err)}
})();
