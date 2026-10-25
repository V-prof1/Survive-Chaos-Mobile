(() => {
'use strict';
try{
  if(typeof SPR==='undefined')return;
  const V='18.0', C=new Map(), norm=s=>String(s||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().replace(/[^a-z0-9]+/g,'_').replace(/^_|_$/g,'');
  const DEF={
    lamina_fantasma:['assassin','#152431','#67d9ff','#d8f8ff'], bruto_de_ferrugem:['brute','#402a22','#a75d38','#ef9b5b'],
    oraculo_do_vazio:['oracle','#211837','#8056db','#caa9ff'], carrapato_prismatico:['bug','#103336','#49d8c8','#ddfff8'],
    artilheiro_caotico:['gunner','#28201c','#dc762e','#ffd28d'], guardiao_do_abismo:['brute','#171329','#4f3b91','#aa8cff'],
    bastiao_colossal:['shield','#242830','#aab5c5','#fff'], predador_frenetico:['beast','#321417','#cf3545','#ff8f7c'],
    arauto_espelhado:['knight','#182836','#62b8df','#e0f8ff'], sangue_imortal:['vamp','#2a121a','#9e2036','#f16c79'],
    ninhada_alfa:['bug','#152018','#5b9a45','#b8e878'], quebra_flow:['knight','#241417','#df4453','#f7f7f7'],
    carrasco_do_intocavel:['brute','#1c1b20','#87878f','#ddd'], quebra_escudos:['hammer','#281a16','#b96b3c','#ffd08a'],
    cacador_cinetico:['assassin','#151e29','#49a8db','#ddf8ff'], alfa_da_horda:['brute','#251c15','#8e5d37','#e7b97a'],
    cacador_carmesim:['assassin','#2d1117','#c62e43','#ff9c90'], viuva_branca:['oracle','#1f232c','#d4dce8','#fff'],
    colosso_oco:['brute','#1b1b1d','#66666e','#c0c0c8'], engenheiro_morto:['gunner','#20211f','#8d7849','#e2c27a'],
    predador_do_vazio:['beast','#171426','#5a3e99','#c7a0ff'], nemesis:['nemesis','#151515','#b52434','#f5f5f5'],
    galinha_admin:['chicken','#39261a','#e8e0cc','#ff4b4b'], pato_kamikaze:['duck','#172321','#4d9b78','#f4c94f'],
    dinossauro_admin:['dino','#16251a','#4f9855','#c8e56c']
  };
  const NPC={
    'FERREIRO ERRANTE':['blacksmith','#29201b','#b96a3e','#f1b87d'], 'MÉDICA DO VAZIO':['medic','#171e26','#dce6ed','#a17de9'],
    'CONTRABANDISTA':['smuggler','#211d1c','#79624e','#d9b58f'], 'CAÇADOR DE COROAS':['hunter','#1d2024','#b64b42','#efca5d'],
    'CIENTISTA DA FÁBRICA':['scientist','#1b2226','#dce5e8','#6fc0cf']
  };
  const PACK=new Set(['lamina_fantasma','bruto_de_ferrugem','oraculo_do_vazio','carrapato_prismatico','artilheiro_caotico','guardiao_do_abismo']);
  const MINI=new Set(['bastiao_colossal','predador_frenetico','arauto_espelhado','sangue_imortal','ninhada_alfa','quebra_flow','carrasco_do_intocavel','quebra_escudos','cacador_cinetico','alfa_da_horda']);
  const LEG=new Set(['cacador_carmesim','viuva_branca','colosso_oco','engenheiro_morto','predador_do_vazio']);
  const ADMIN={'🐔':'galinha_admin','🦆':'pato_kamikaze','🦖':'dinossauro_admin'};
  const rect=(g,x,y,w,h,c)=>{g.fillStyle=c;g.fillRect(x|0,y|0,w|0,h|0)}, poly=(g,p,c)=>{g.fillStyle=c;g.beginPath();g.moveTo(p[0][0]|0,p[0][1]|0);for(let i=1;i<p.length;i++)g.lineTo(p[i][0]|0,p[i][1]|0);g.closePath();g.fill()}, ell=(g,x,y,w,h,c)=>{g.fillStyle=c;g.beginPath();g.ellipse(x,y,w,h,0,0,7);g.fill()};
  function human(g,type,p,st,f){const[d,m,h]=p,cx=24,b=39+(st==='walk'?[0,-1,0,1][f%4]:0),atk=st==='attack';ell(g,cx,b+2,10,3,'rgba(0,0,0,.28)');
    rect(g,cx-7,b-3,5,13,d);rect(g,cx+2,b-3,5,13,d);rect(g,cx-9,b-17,18,16,m);rect(g,cx-13,b-15,5,14,d);rect(g,cx+8,b-15,atk?12:5,6,d);ell(g,cx,b-22,7,7,h);
    if(['assassin','oracle','vamp','smuggler','nemesis'].includes(type))poly(g,[[cx-10,b-17],[cx-8,b-31],[cx,b-35],[cx+8,b-31],[cx+10,b-17]],d);
    if(['brute','shield','knight','hammer','gunner','nemesis','blacksmith','hunter'].includes(type)){rect(g,cx-8,b-16,16,7,h);rect(g,cx-5,b-9,10,5,d)}
    if(['assassin','vamp','knight','nemesis'].includes(type)){g.strokeStyle=h;g.lineWidth=2;g.beginPath();g.moveTo(cx+11,b-10);g.lineTo(cx+(atk?25:20),b-20);g.stroke()}
    if(['gunner','hunter'].includes(type)){rect(g,cx+10,b-14,atk?17:13,5,h);rect(g,cx+15,b-9,4,7,d)}
    if(['brute','hammer','blacksmith'].includes(type)){g.strokeStyle=h;g.lineWidth=3;g.beginPath();g.moveTo(cx+12,b-14);g.lineTo(cx+21,b-3);g.stroke();rect(g,cx+17,b-20,10,7,m)}
    if(type==='oracle'){g.strokeStyle=h;g.lineWidth=2;g.beginPath();g.moveTo(cx+14,b-29);g.lineTo(cx+14,b+5);g.stroke();ell(g,cx+14,b-31,4,4,m)}
    if(type==='shield'){rect(g,cx-19,b-18,9,20,h);rect(g,cx-17,b-15,5,14,d)}
    if(type==='nemesis'){poly(g,[[cx-6,b-29],[cx-13,b-38],[cx-9,b-27]],h);poly(g,[[cx+6,b-29],[cx+13,b-38],[cx+9,b-27]],h)}
    rect(g,cx-4,b-24,2,2,d);rect(g,cx+2,b-24,2,2,d);
  }
  function creature(g,type,p,st,f){const[d,m,h]=p,cx=24,b=34+(st==='walk'?[0,-1,0,1][f%4]:0),atk=st==='attack';ell(g,cx,b+7,11,3,'rgba(0,0,0,.25)');
    if(type==='bug'){ell(g,cx,b,10,9,m);ell(g,cx,b-10,7,6,d);for(const s of[-1,1])for(let i=0;i<3;i++){g.strokeStyle=h;g.lineWidth=2;g.beginPath();g.moveTo(cx+s*6,b-4+i*5);g.lineTo(cx+s*(14+i*2),b-8+i*7);g.stroke()}poly(g,[[cx,b-17],[cx+6,b-7],[cx,b+1],[cx-6,b-7]],h)}
    else if(type==='beast'){ell(g,cx,b,11,8,m);ell(g,cx,b-11,7,7,d);for(const s of[-1,1]){g.strokeStyle=h;g.lineWidth=3;g.beginPath();g.moveTo(cx+s*6,b+3);g.lineTo(cx+s*(atk?20:14),b+10);g.stroke();poly(g,[[cx+s*4,b-17],[cx+s*10,b-25],[cx+s*7,b-14]],h)}}
    else if(type==='chicken'){ell(g,cx-2,b,10,8,h);ell(g,cx+7,b-8,6,5,h);rect(g,cx+11,b-9,6,3,m);rect(g,cx+5,b-16,4,5,'#ff4b4b')}
    else if(type==='duck'){ell(g,cx-2,b,11,8,m);ell(g,cx+7,b-9,6,5,m);rect(g,cx+11,b-10,7,4,h);rect(g,cx-4,b-4,9,5,d)}
    else if(type==='dino'){ell(g,cx-4,b,12,9,m);rect(g,cx+3,b-15,9,16,m);ell(g,cx+8,b-18,7,6,m);poly(g,[[cx-13,b-2],[cx-25,b-10],[cx-15,b+4]],d);for(let i=0;i<3;i++)poly(g,[[cx-7+i*6,b-8],[cx-4+i*6,b-16],[cx,b-8]],h)}
  }
  function frame(slug,st='walk',f=0){const k=slug+'|'+st+'|'+f;if(C.has(k))return C.get(k);const q=document.createElement('canvas');q.width=q.height=48;const g=q.getContext('2d');g.imageSmoothingEnabled=false;const z=DEF[slug];if(!z)return q;const type=z[0],p=z.slice(1);if(['bug','beast','chicken','duck','dino'].includes(type))creature(g,type,p,st,f);else human(g,type,p,st,f);if(st==='hurt'){g.globalCompositeOperation='source-atop';g.fillStyle='rgba(255,255,255,.55)';g.fillRect(0,0,48,48)}if(st==='death'){g.globalAlpha=Math.max(.15,1-f/5);g.globalCompositeOperation='destination-in';g.fillStyle='rgba(255,255,255,'+g.globalAlpha+')';g.fillRect(0,Math.min(42,f*5),48,48)}C.set(k,q);return q}
  function enemySlug(e){if(!e||e.dv||e.boss)return null;if(e.em&&ADMIN[e.em])return ADMIN[e.em];if(e.scNemesis)return'nemesis';let n=norm(e.scLegendaryName||e.scMiniName||e.scPack3Name||'');if(DEF[n])return n;if(Number.isInteger(e.k)&&typeof EN!=='undefined'&&EN[e.k]){n=norm(EN[e.k][0]);if(PACK.has(n))return n}return null}
  const baseEnemy=SPR.enemy.bind(SPR);SPR.enemy=function(g,e){const s=enemySlug(e);if(!s)return baseEnemy(g,e);const big=!!(e.scLegendary||e.scMini||e.scMiniBoss||e.scNemesis),size=big?Math.max(52,(e.r||14)*3):Math.max(40,(e.r||12)*2.8),flip=typeof P!=='undefined'&&P&&P.x<e.x,st=e.fl>0?'hurt':(e.scIntentT>0||['windup','lunge','strike','dive','burst','channel'].includes(e.scState)?'attack':'walk'),n=st==='attack'?3:4,f=Math.floor((typeof T==='number'?T:0)*10)%n,q=frame(s,st,f);g.save();if(flip){g.scale(-1,1);g.drawImage(q,-size/2,-size*.78,size,size)}else g.drawImage(q,-size/2,-size*.78,size,size);if(e.scLegendary||e.scNemesis){g.strokeStyle=e.scNemesis?'#ff334b':'#fff';g.globalAlpha=.6;g.setLineDash([3,4]);g.lineDashOffset=-(typeof T==='number'?T:0)*18;g.beginPath();g.arc(0,0,(e.r||14)+7,0,7);g.stroke()}g.restore();return 1};
  const oldKill=typeof kill==='function'?kill:null;if(oldKill)kill=function(e){const s=enemySlug(e),n=typeof DS!=='undefined'?DS.length:0,out=oldKill.apply(this,arguments);if(s&&e&&e.dead&&typeof DS!=='undefined'&&DS.length>n)for(let i=DS.length-1;i>=n;i--){const d=DS[i];if(d&&Math.abs(d.x-e.x)<1&&Math.abs(d.y-e.y)<1){d.scOwnSprite=s;break}}return out};
  const oldDeath=SPR.death.bind(SPR);SPR.death=function(g,d){if(!d||!d.scOwnSprite)return oldDeath(g,d);const f=Math.min(5,Math.floor((d.t||0)*10)),q=frame(d.scOwnSprite,'death',f),size=Math.max(40,(d.r||12)*2.8);g.save();g.globalAlpha=Math.max(.05,1-f/5);if(d.fl){g.translate(d.x,d.y);g.scale(-1,1);g.drawImage(q,-size/2,-size*.78,size,size)}else g.drawImage(q,d.x-size/2,d.y-size*.78,size,size);g.restore();return 1};
  function npcFrame(name,f){const k='npc|'+name+'|'+f;if(C.has(k))return C.get(k);const q=document.createElement('canvas');q.width=q.height=64;const g=q.getContext('2d'),z=NPC[name],type=z[0],p=z.slice(1);g.save();g.translate(8,9);human(g,type,p,'walk',f);g.restore();if(type==='medic'){rect(g,28,31,8,2,'#d34c59');rect(g,31,28,2,8,'#d34c59')}if(type==='scientist'){ell(g,47,39,5,5,'#64d6e8')}C.set(k,q);return q}
  let npcName=null;function mountNpc(){const panel=document.querySelector('#scWorldEvent .scWorldPanel');if(!panel)return;let cv=document.getElementById('scNpcPortrait');if(!cv){cv=document.createElement('canvas');cv.id='scNpcPortrait';cv.width=cv.height=128;panel.insertBefore(cv,panel.querySelector('#scEventTitle')||panel.firstChild)}const tag=document.getElementById('scEventTag'),title=document.getElementById('scEventTitle');npcName=null;if(tag&&tag.textContent.trim()==='NPC RARO'&&title)for(const n in NPC)if(title.textContent.includes(n)){npcName=n;break}cv.classList.toggle('on',!!npcName)}
  const obs=new MutationObserver(mountNpc);function loop(){const cv=document.getElementById('scNpcPortrait');if(cv&&npcName){const g=cv.getContext('2d');g.clearRect(0,0,128,128);g.imageSmoothingEnabled=false;const f=Math.floor(performance.now()/180)%4;g.drawImage(npcFrame(npcName,f),14,6,100,100)}requestAnimationFrame(loop)}
  const boot=()=>{mountNpc();const e=document.getElementById('scWorldEvent');if(e)obs.observe(e,{subtree:true,childList:true,characterData:true,attributes:true});loop()};if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot,{once:true});else boot();
  window.SCCharacterSprites={version:V,enemySprites:Object.keys(DEF).length,npcSprites:Object.keys(NPC).length,enemySlug};
  console.log('[Mobile] Character Sprites 18.0 enabled: 25 dedicated enemy/mini-boss/legendary sprites and 5 animated NPC portraits.');
}catch(err){console.warn('[Mobile Character Sprites]',err)}
})();