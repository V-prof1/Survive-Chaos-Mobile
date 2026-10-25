(() => {
'use strict';
try{
  const DATA='data:image/webp;base64,'+(window.SC_EXTRA_SPRITE_CHUNKS||[]).join('');
  const img=new Image();let ready=false;img.onload=()=>{ready=true};img.src=DATA;
  const norm=s=>String(s||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toUpperCase().replace(/[^A-Z0-9]+/g,' ').trim();
  const ENEMY_NAMES=[
    'Lâmina Fantasma','Bruto de Ferrugem','Oráculo do Vazio','Carrapato Prismático','Artilheiro Caótico','Guardião do Abismo',
    'Bastião Colossal','Predador Frenético','Arauto Espelhado','Sangue Imortal','Ninhada Alfa',
    'QUEBRA-FLOW','CARRASCO DO INTOCÁVEL','QUEBRA-ESCUDOS','CAÇADOR CINÉTICO','ALFA DA HORDA',
    'CAÇADOR CARMESIM','VIÚVA BRANCA','COLOSSO OCO','ENGENHEIRO MORTO','PREDADOR DO VAZIO',
    'NÊMESIS','🐔','🦆','🦖'
  ];
  const NPC_NAMES=['FERREIRO ERRANTE','MÉDICA DO VAZIO','CONTRABANDISTA','CAÇADOR DE COROAS','CIENTISTA DA FÁBRICA'];
  const enemyMap=new Map(ENEMY_NAMES.map((n,i)=>[norm(n),i]));
  const npcMap=new Map(NPC_NAMES.map((n,i)=>[norm(n),i]));
  const ROW=16,BLOCK=64,NPC_Y=1600,NPC_H=22,FRAMES=6;

  function resolveEnemy(e){
    if(!e)return -1;
    if(e.scPack3Name&&enemyMap.has(norm(e.scPack3Name)))return enemyMap.get(norm(e.scPack3Name));
    if(e.scMiniName&&enemyMap.has(norm(e.scMiniName)))return enemyMap.get(norm(e.scMiniName));
    if(e.scLegendaryName&&enemyMap.has(norm(e.scLegendaryName)))return enemyMap.get(norm(e.scLegendaryName));
    if(e.scNemesis)return 21;
    if(e.em==='🐔')return 22;if(e.em==='🦆')return 23;if(e.em==='🦖')return 24;
    return -1;
  }
  function frameFor(e,row){
    if(row===2)return Math.floor((T*12+(e.ph||0)*3))%FRAMES;
    return Math.floor((T*(row===1?11:8)+(e.ph||0)*4))%FRAMES;
  }
  function rowFor(e){
    if((e.fl||0)>0)return 2;
    const s=String(e.scState||'');
    if((e.scIntentT||0)>0||['windup','lunge','burst','channel','dive','strike'].includes(s))return 1;
    return 0;
  }
  function drawEnemy(c,e,idx){
    if(!ready||idx<0)return false;
    const row=rowFor(e),f=frameFor(e,row),sx=f*ROW,sy=idx*BLOCK+row*ROW;
    const bossish=!!(e.scMiniBoss||e.scMini||e.scLegendary||e.scNemesis);
    const w=Math.max(40,e.r*(bossish?4.15:3.65)),h=w;
    const gy=e.r*.92,flip=typeof P!=='undefined'&&P&&P.x<e.x;
    c.save();
    if(e.el||bossish){
      c.globalAlpha=.28;
      c.fillStyle=e.scLegendary?'#ff334b':e.scNemesis?'#f5f5f7':'#ffffff';
      c.beginPath();c.arc(0,0,e.r*(bossish?1.65:1.4),0,Math.PI*2);c.fill();
      c.globalAlpha=1;
    }
    if(flip)c.scale(-1,1);
    c.imageSmoothingEnabled=false;
    c.drawImage(img,sx,sy,ROW,ROW,-w/2,gy-h,w,h);
    c.restore();
    return true;
  }

  if(typeof SPR!=='undefined'&&SPR){
    const oldEnemy=SPR.enemy.bind(SPR);
    SPR.enemy=function(c,e){
      const idx=resolveEnemy(e);
      if(idx>=0&&drawEnemy(c,e,idx))return 1;
      return oldEnemy(c,e);
    };
    const oldDeath=SPR.death.bind(SPR);
    SPR.death=function(c,d){
      if(ready&&d&&Number.isInteger(d.scExtraSprite)){
        const idx=d.scExtraSprite,p=Math.min(1,(d.t||0)/.62),f=Math.min(5,Math.floor(p*6)),sx=f*ROW,sy=idx*BLOCK+3*ROW;
        const w=Math.max(40,(d.r||12)*3.8),h=w,gy=(d.r||12)*.92;
        c.save();c.imageSmoothingEnabled=false;c.globalAlpha=p>.78?(1-p)/.22:1;
        c.translate(d.x,d.y);if(d.fl)c.scale(-1,1);
        c.drawImage(img,sx,sy,ROW,ROW,-w/2,gy-h,w,h);c.restore();return 1;
      }
      return oldDeath(c,d);
    };
  }
  if(typeof kill==='function'){
    const oldKill=kill;
    kill=function(e){
      const idx=resolveEnemy(e),before=Array.isArray(DS)?DS.length:0;
      const out=oldKill.apply(this,arguments);
      if(idx>=0&&Array.isArray(DS)&&DS.length>before)DS[DS.length-1].scExtraSprite=idx;
      return out;
    };
  }

  const css=document.createElement('style');
  css.textContent=`
    #scNpcPortrait{display:none;width:88px;height:118px;image-rendering:pixelated;image-rendering:crisp-edges;margin:2px auto 10px;border-radius:16px;border:1px solid rgba(255,255,255,.14);background:radial-gradient(circle at 50% 70%,rgba(255,45,65,.14),rgba(10,10,12,.96) 70%);box-shadow:0 12px 30px rgba(0,0,0,.38);pointer-events:none}
    #scNpcPortrait.on{display:block}
    .scExtraIdxPortrait{width:54px;height:54px;image-rendering:pixelated;image-rendering:crisp-edges;display:block;margin:0 auto 5px;filter:drop-shadow(0 5px 6px rgba(0,0,0,.45));pointer-events:none}
  `;
  document.head.appendChild(css);

  function drawNpcCanvas(canvas,idx,t){
    if(!ready||!canvas||idx<0)return;
    const f=Math.floor(t/150)%6;
    if(canvas.width!==144)canvas.width=144;
    if(canvas.height!==192)canvas.height=192;
    const q=canvas.getContext('2d');q.imageSmoothingEnabled=false;q.clearRect(0,0,144,192);
    q.drawImage(img,f*16,NPC_Y+idx*NPC_H,16,22,0,0,144,192);
  }
  function ensureNpcPortrait(){
    const root=document.getElementById('scWorldEvent');
    if(!root||!root.classList.contains('on'))return null;
    const panel=root.querySelector('.scWorldPanel');if(!panel)return null;
    let c=document.getElementById('scNpcPortrait');
    if(!c){c=document.createElement('canvas');c.id='scNpcPortrait';c.style.pointerEvents='none';const h=panel.querySelector('h2');panel.insertBefore(c,h||panel.firstChild)}
    return c;
  }
  function syncNpcPortrait(t=Date.now()){
    const root=document.getElementById('scWorldEvent');
    if(!root||!root.classList.contains('on'))return;
    const c=ensureNpcPortrait();if(!c)return;
    const tag=document.getElementById('scEventTag'),title=document.getElementById('scEventTitle');
    const isNpc=tag&&/NPC RARO/i.test(tag.textContent||'');
    let idx=-1;
    if(isNpc&&title){const nt=norm(title.textContent);for(const [k,v] of npcMap)if(nt.includes(k)){idx=v;break}}
    if(idx<0){c.classList.remove('on');return}
    c.classList.add('on');drawNpcCanvas(c,idx,t);
  }
  function indexIsOpen(){
    const screen=document.getElementById('scEnemyIndex');
    return !!(screen&&screen.classList.contains('on'));
  }
  function makeIndexPortrait(idx,size){
    const cv=document.createElement('canvas');cv.className='scExtraIdxPortrait';cv.width=size;cv.height=size;cv.dataset.scExtraIdx=String(idx);cv.style.pointerEvents='none';
    const q=cv.getContext('2d');q.imageSmoothingEnabled=false;q.drawImage(img,0,idx*BLOCK,16,16,0,0,size,size);return cv;
  }
  function addIndexPortraits(){
    if(!ready||!indexIsOpen())return;
    const grid=document.getElementById('scIdxGrid');if(!grid)return;
    grid.querySelectorAll('.scIdxCard.open').forEach(card=>{
      const b=card.querySelector('b');if(!b)return;
      let n=norm(b.textContent).replace(/^ELITE /,'');let idx=enemyMap.get(n);
      if(idx===undefined&&n.startsWith('NEMESIS'))idx=21;
      if(idx===undefined)return;
      let cv=card.querySelector('.scExtraIdxPortrait');
      if(!cv){cv=makeIndexPortrait(idx,96);const icon=card.querySelector('.scIdxIcon');if(icon)icon.style.display='none';card.insertBefore(cv,icon||card.firstChild)}
    });
    const detail=document.getElementById('scIdxDetailBody');
    if(detail){
      const h=detail.querySelector('h2'),big=detail.querySelector('.scIdxBig');
      if(h&&big){
        let n=norm(h.textContent).replace(/^ELITE /,'');let idx=enemyMap.get(n);
        if(idx===undefined&&n.startsWith('NEMESIS'))idx=21;
        if(idx!==undefined){
          let cv=big.querySelector('.scExtraIdxPortrait');
          if(!cv||cv.dataset.scExtraIdx!==String(idx)){big.textContent='';cv=makeIndexPortrait(idx,120);big.appendChild(cv)}
        }
      }
    }
  }

  // Hotfix 18.1: never observe the full document and never run a permanent RAF loop.
  // UI portraits are refreshed only while their own screens are actually open.
  const uiTimer=setInterval(()=>{
    try{
      const world=document.getElementById('scWorldEvent');
      if(world&&world.classList.contains('on'))syncNpcPortrait(Date.now());
      if(indexIsOpen())addIndexPortraits();
    }catch(_){ }
  },180);
  addEventListener('pagehide',()=>clearInterval(uiTimer),{once:true});

  window.SCExtraCharacters={version:'18.1',image:img,ready:()=>ready,enemies:ENEMY_NAMES,npcs:NPC_NAMES,resolveEnemy};
  console.log('[Mobile] Extra Characters 18.1 hotfix enabled: animated sprites retained without global DOM observers.');
}catch(err){console.warn('[Extra Characters 18.1]',err)}
})();