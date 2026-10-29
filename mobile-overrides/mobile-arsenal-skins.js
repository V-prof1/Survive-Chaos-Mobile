/* ©criado por Vitor Ag/Nyx - 2026 */
/* ©criado por Vitor Ag/Nyx - 2026 */
/* ©criado por Vitor Ag/Nyx - 2026 */
(() => {
'use strict';
try{
  if(typeof SK==='undefined'||typeof S==='undefined')return;

  const THEMES=[
    {n:'Padrão',p:'#2b2f3a',a:'#ffb340',t:'#ffe9a0',k:'std'},
    {n:'Militar',p:'#4f5d3c',a:'#9ba768',t:'#d7e3a9',k:'camo'},
    {n:'Lenhador',p:'#6d4027',a:'#c86f3b',t:'#f0b879',k:'wood'},
    {n:'Orbital',p:'#e9eef5',a:'#55d8ff',t:'#c7f5ff',k:'astro'},
    {n:'Corsário',p:'#2d3140',a:'#d6a643',t:'#ffd978',k:'pirate'},
    {n:'Shinobi',p:'#15161d',a:'#bd3147',t:'#ff6a79',k:'ninja'},
    {n:'Aço Real',p:'#8f9baa',a:'#d8c879',t:'#e8f1ff',k:'knight'},
    {n:'Fronteira',p:'#6f4c30',a:'#d59a46',t:'#f1c47d',k:'cowboy'},
    {n:'Arcano',p:'#284b9a',a:'#76b8ff',t:'#aee6ff',k:'mage'},
    {n:'Carmesim',p:'#3a171d',a:'#ba3946',t:'#ff7a83',k:'samurai'},
    {n:'Tóxico',p:'#39593b',a:'#8bd36a',t:'#c7ff8e',k:'zombie'},
    {n:'Nórdico',p:'#5b6671',a:'#c6a15f',t:'#dcefff',k:'viking'},
    {n:'Mecânico',p:'#596775',a:'#39e2e7',t:'#9cffff',k:'robot'},
    {n:'Circo Sombrio',p:'#3a214a',a:'#d44788',t:'#ff89be',k:'clown'},
    {n:'Osso',p:'#d9d4c4',a:'#8b7f6d',t:'#fff8dc',k:'bone'},
    {n:'Celestial',p:'#f0eadf',a:'#efc84f',t:'#fff1a5',k:'angel'},
    {n:'Infernal',p:'#2b1116',a:'#dc3e3e',t:'#ff775c',k:'demon'},
    {n:'Dracônico',p:'#2d5e42',a:'#66c87a',t:'#b4ff9b',k:'dragon'},
    {n:'Neon',p:'#101625',a:'#25e8e4',t:'#ff49ce',k:'cyber'},
    {n:'Dourado',p:'#5b4313',a:'#ffc83d',t:'#fff1a0',k:'gold'},
    {n:'GLITCH',p:'#05050a',a:'#ff2bd6',t:'#39f6ff',k:'glitch'}
  ];

  // Remove the retired Kaneki slot without touching any other progression.
  const hadRetired=Array.isArray(S.own)&&S.own.some(i=>Number(i)>=21);
  if(hadRetired&&!S.kanekiRefunded){S.coins=(Number(S.coins)||0)+5000000;S.kanekiRefunded=1}
  if(Array.isArray(S.own))S.own=S.own.filter(i=>Number.isInteger(i)&&i>=0&&i<SK.length);
  if(!S.own.includes(0))S.own.unshift(0);
  if(!Number.isInteger(S.skin)||S.skin<0||S.skin>=SK.length)S.skin=0;
  if(typeof CF!=='undefined'&&CF.s2!=null&&(CF.s2<0||CF.s2>=SK.length))CF.s2=0;
  try{sv()}catch(_){ }

  const theme=i=>THEMES[Math.max(0,Math.min(THEMES.length-1,i|0))]||THEMES[0];

  function glow(c,col,r,alpha=.35){
    c.save();c.globalCompositeOperation='lighter';c.globalAlpha=alpha;c.fillStyle=col;c.beginPath();c.arc(0,0,r,0,Math.PI*2);c.fill();c.restore();
  }
  function poly(c,col,p){c.fillStyle=col;c.beginPath();c.moveTo(p[0],p[1]);for(let i=2;i<p.length;i+=2)c.lineTo(p[i],p[i+1]);c.closePath();c.fill()}
  function outlineRect(c,x,y,w,h,r,col,fill){c.lineWidth=Math.max(1,r*.07);c.strokeStyle=col;c.fillStyle=fill;c.beginPath();c.roundRect(x,y,w,h,Math.max(1,r*.08));c.fill();c.stroke()}

  function glitchEcho(c,draw,r){
    c.save();c.globalAlpha=.42;c.translate(Math.sin((typeof tm!=='undefined'?tm:0)*31)*r*.08,0);c.globalCompositeOperation='lighter';draw('#28f2ff');c.restore();
    c.save();c.globalAlpha=.38;c.translate(-Math.cos((typeof tm!=='undefined'?tm:0)*27)*r*.08,r*.03);c.globalCompositeOperation='lighter';draw('#ff2bd6');c.restore();
    draw('#f2f2ff');
  }

  function weaponShape(c,r,w,t,accentOverride){
    const a=accentOverride||t.a, main=t.p, ink=t.k==='bone'?'#4a4339':'#0a0b10';
    const ox=r*.48;c.translate(ox,0);
    if(w===0){
      outlineRect(c,0,-r*.15,r*.98,r*.30,r,ink,main);
      poly(c,a,[r*.18,r*.13,r*.47,r*.13,r*.34,r*.56,r*.08,r*.53]);
      c.fillStyle=t.t;c.fillRect(r*.72,-r*.08,r*.26,r*.16);
    }else if(w===1){
      outlineRect(c,0,-r*.19,r*1.45,r*.38,r,ink,main);
      c.fillStyle=a;c.fillRect(r*.58,-r*.13,r*.62,r*.26);
      c.fillStyle=t.t;c.fillRect(r*1.28,-r*.1,r*.22,r*.20);
      poly(c,ink,[r*.30,r*.16,r*.57,r*.16,r*.42,r*.56,r*.15,r*.52]);
    }else if(w===2){
      outlineRect(c,-r*.08,-r*.12,r*1.72,r*.24,r,ink,main);
      c.fillStyle=a;c.fillRect(r*.38,-r*.18,r*.52,r*.10);
      c.fillStyle=t.t;c.fillRect(r*1.43,-r*.07,r*.26,r*.14);
      poly(c,ink,[r*.18,r*.11,r*.50,r*.11,r*.34,r*.46,r*.12,r*.43]);
    }else if(w===3){
      c.strokeStyle=a;c.lineWidth=Math.max(2,r*.12);c.beginPath();c.arc(r*.75,0,r*.62,-1.12,1.12);c.stroke();
      c.strokeStyle=main;c.lineWidth=Math.max(2,r*.18);c.beginPath();c.moveTo(-r*.1,0);c.lineTo(r*1.55,0);c.stroke();
      c.strokeStyle=t.t;c.lineWidth=Math.max(1,r*.07);c.beginPath();c.moveTo(r*.15,0);c.lineTo(r*1.72,0);c.stroke();
      poly(c,t.t,[r*1.72,0,r*1.42,-r*.16,r*1.43,r*.16]);
    }else{
      c.strokeStyle=main;c.lineWidth=Math.max(2,r*.2);c.beginPath();c.moveTo(-r*.08,r*.45);c.lineTo(r*1.45,-r*.35);c.stroke();
      c.strokeStyle=a;c.lineWidth=Math.max(1,r*.08);c.beginPath();c.moveTo(r*.25,r*.28);c.lineTo(r*1.5,-r*.38);c.stroke();
      c.save();c.translate(r*1.48,-r*.38);glow(c,t.t,r*.42,t.k==='gold'||t.k==='cyber'?0.36:.22);c.fillStyle=t.t;c.beginPath();c.arc(0,0,r*.20,0,Math.PI*2);c.fill();c.strokeStyle=a;c.lineWidth=Math.max(1,r*.06);c.beginPath();c.arc(0,0,r*.31,0,Math.PI*2);c.stroke();c.restore();
    }
    if(t.k==='gold'){c.strokeStyle='#fff2a7';c.lineWidth=Math.max(1,r*.045);c.beginPath();c.moveTo(r*.12,-r*.06);c.lineTo(r*(w===2?1.45:1.1),-r*.06);c.stroke()}
    if(t.k==='dragon')for(let i=0;i<3;i++)poly(c,'#66c87a',[r*(.35+i*.3),-r*.15,r*(.47+i*.3),-r*.34,r*(.56+i*.3),-r*.12]);
    if(t.k==='ninja'||t.k==='samurai')poly(c,a,[r*.55,-r*.16,r*.72,-r*.34,r*.76,-r*.13]);
  }

  function drawWeapon(c,px,py,r,idx,a,q){
    if(idx<=0||idx>=THEMES.length)return false;
    const t=theme(idx),w=typeof CF!=='undefined'?CF.w||0:0;
    c.save();c.translate(px,py);c.rotate(a||0);
    if(t.k==='glitch')glitchEcho(c,col=>weaponShape(c,r,w,t,col),r);else weaponShape(c,r,w,t);
    c.restore();return true;
  }

  function projectileShape(c,b,t,w){
    const ang=Math.atan2(b.vy||0,b.vx||1),spd=Math.hypot(b.vx||0,b.vy||0),s=w===3?1.35:w===2?1.18:1;
    c.save();c.translate(b.x,b.y);c.rotate(ang);
    c.strokeStyle=t.a+'88';c.lineWidth=w===3?3:1.6;c.beginPath();c.moveTo(-Math.min(28,spd*.05),0);c.lineTo(-5,0);c.stroke();
    if(t.k==='cyber'||t.k==='glitch'||t.k==='gold')glow(c,t.t,w===4?10:6,t.k==='glitch'?.30:.20);
    if(w===0)poly(c,t.t,[-6*s,0,-1*s,-2.2*s,7*s,0,-1*s,2.2*s]);
    else if(w===1){c.fillStyle=t.t;c.beginPath();c.ellipse(0,0,4.2,2.4,0,0,Math.PI*2);c.fill();c.strokeStyle=t.a;c.lineWidth=1;c.stroke()}
    else if(w===2)poly(c,t.t,[-10,0,-4,-1.7,12,0,-4,1.7]);
    else if(w===3){c.fillStyle=t.p;c.fillRect(-11,-1.5,20,3);poly(c,t.t,[12,0,5,-4,6,4])}
    else{c.fillStyle=t.t;c.beginPath();c.arc(0,0,4.5,0,Math.PI*2);c.fill();c.strokeStyle=t.a;c.lineWidth=2;c.beginPath();c.arc(0,0,8+Math.sin((typeof tm!=='undefined'?tm:0)*9)*1.5,0,Math.PI*2);c.stroke()}
    if(t.k==='glitch'){c.globalCompositeOperation='lighter';c.globalAlpha=.7;c.fillStyle='#ff2bd6';c.fillRect(-2,-4,6,1);c.fillStyle='#28f2ff';c.fillRect(-5,3,8,1)}
    c.restore();
  }

  function bullet(c,b){
    const idx=Number.isInteger(b.sk)?b.sk:0;if(idx<=0||idx>=THEMES.length)return false;
    projectileShape(c,b,theme(idx),Number.isInteger(b.wt)?b.wt:(typeof CF!=='undefined'?CF.w||0:0));return true;
  }

  function orbital(c,q,a){
    const idx=q&&q.sk!=null?q.sk:S.skin;if(idx<=0||idx>=THEMES.length)return false;
    const t=theme(idx);c.save();c.translate(q.x+Math.cos(a)*(52+(q.orr||0)),q.y+Math.sin(a)*(52+(q.orr||0)));c.rotate(a*3);
    if(t.k==='glitch'){c.globalAlpha=.55;c.fillStyle='#28f2ff';c.fillRect(-10,-4,18,6);c.fillStyle='#ff2bd6';c.fillRect(-7,-1,18,6);c.globalAlpha=1}
    c.fillStyle=t.t;c.fillRect(-9,-3,18,6);c.fillStyle=t.a;c.fillRect(2,-2,7,4);c.restore();return true;
  }

  // Replace SPR.hero's normal weapon only for themed skins while preserving the native up/side/down layering.
  if(typeof SPR!=='undefined'&&SPR.hero){
    const nativeHero=SPR.hero.bind(SPR);
    SPR.hero=function(c,r,a,si,q){
      if(!q||si<=0||si>=THEMES.length)return nativeHero(c,r,a,si,q);
      const sh='hero_'+si;if(!SPR.sheet(sh))return 0;
      const ca=Math.cos(a),sa=Math.sin(a);let d='side',fl=0;if(Math.abs(sa)>Math.abs(ca)*1.1)d=sa>0?'down':'up';else fl=ca<0;
      const s=r*4.2/96,gy=r*.9,mvg=mv?1:0;let k=(mvg?'walk_':'idle_')+d,t=tm,once=0;
      if(q.dT>0){k='dash_'+d;t=1-q.dT/.18;once=1}
      const drawW=()=>drawWeapon(c,0,0,r,si,a,q);
      if(d==='up')drawW();
      SPR.at(c,sh,k,t,0,gy,s,fl,0,once);
      if(d!=='up')drawW();
      return 1;
    };
  }

  // ADMIN is rendered by game.js before SPR.hero, so give that special renderer its glitch weapon explicitly.
  if(typeof hero==='function'){
    const nativeGameHero=hero;
    hero=function(c,px,py,r,sk,a,z,q){
      const idx=SK.indexOf(sk),out=nativeGameHero.apply(this,arguments);
      if(idx===20&&!z)drawWeapon(c,px,py,r,20,a,q);
      return out;
    };
  }

  function polishShop(){
    const cards=[...document.querySelectorAll('#sg .sk')];
    cards.forEach((card,i)=>{if(i>=SK.length||card.querySelector('.arsenal-skin-tag'))return;const s=document.createElement('small');s.className='arsenal-skin-tag';s.textContent='ARSENAL: '+theme(i).n.toUpperCase();card.appendChild(s)});
  }
  const obs=document.getElementById('sg');if(obs)new MutationObserver(polishShop).observe(obs,{childList:true,subtree:true});setTimeout(polishShop,0);

  window.SCArsenal={theme,bullet,orbital,drawWeapon,themes:THEMES};
  console.log('[Mobile] Skin Arsenal enabled: 21 player skins replace weapon/projectile visuals; ADMIN glitch arsenal active; Kaneki retired');
}catch(err){console.warn('[Mobile Skin Arsenal]',err)}
})();