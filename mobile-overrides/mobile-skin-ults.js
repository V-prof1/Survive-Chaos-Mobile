/* ©criado por Vitor Ag/Nyx - 2026 */
/* ©criado por Vitor Ag/Nyx - 2026 */
/* ©criado por Vitor Ag/Nyx - 2026 */
(() => {
'use strict';
try{
  if(typeof fireUlt!=='function'||typeof SK==='undefined')return;
  const TAU=Math.PI*2,MOBILE=true;
  const NAMES=['ONDA DE CAOS','ATAQUE TÁTICO','FÚRIA DO LENHADOR','COLAPSO ORBITAL','SALVA DO CORSÁRIO','CORTE DAS SOMBRAS','JURAMENTO REAL','DEADEYE','TEMPESTADE ARCANA','IAI CARMESIM','PRAGA VIVA','IRA DE ODIN','PROTOCOLO ORBITAL','CIRCO DO CAOS','OSSÁRIO','JULGAMENTO CELESTIAL','INFERNO ABERTO','FÚRIA DRACÔNICA','NEON OVERDRIVE','CEIFA DOURADA','SYSTEM // OVERRIDE'];
  const KINDS=['classic','camo','wood','space','pirate','ninja','knight','cowboy','mage','samurai','zombie','viking','robot','clown','bone','angel','demon','dragon','cyber','gold','admin'];
  const COLORS=[['#ffb340','#fff0aa'],['#7d8f4e','#d9ef9c'],['#c0583a','#ffd18a'],['#55d8ff','#e9f8ff'],['#d6a643','#ffef9b'],['#bd3147','#ff7587'],['#aab4c4','#fff0a0'],['#d59a46','#fff0bd'],['#4d79ff','#9de8ff'],['#a33a3a','#ff8490'],['#7fbf6a','#c9ff93'],['#8aa6c4','#e8f4ff'],['#39e2e7','#d7ffff'],['#c05bff','#ff73bd'],['#e8e4d4','#fffbe6'],['#ffe9a0','#fffbd1'],['#ff3a3a','#ff8a5d'],['#3fff8a','#c6ff9d'],['#2de2e6','#ff49ce'],['#ffc94a','#fff3a0'],['#ff2bd6','#39f6ff']];
  const DESCS=['Explosão equilibrada','Radar + bombardeio preciso','Ondas cortantes de impacto','Gravidade puxa e implode','Canhões cercam a arena','Golpes instantâneos nos alvos','Escudo, cura e lâminas reais','Marca e executa alvos feridos','Runas detonam em três estágios','Cortes críticos em sequência','Nuvem tóxica rouba vida','Raios atingem vários inimigos','Bombardeio orbital automatizado','Explosões imprevisíveis em cadeia','Estacas ósseas cercam os alvos','Cura, escudos e luz destrutiva','Ondas infernais de alto dano','Cinco rajadas de fogo dracônico','Overclock, invulnerabilidade e pulsos','Campo de execução e ceifas douradas','Domínio total: glitch, execução e seis ondas'];

  function price(idx){return Number(SK[idx]&&SK[idx][3])||0}
  function power(idx){if(idx===20)return 2.15;return 1+.48*Math.sqrt(Math.min(12000,price(idx))/12000)}
  function radius(idx){if(idx===20)return 520;return 320+100*Math.sqrt(Math.min(12000,price(idx))/12000)}
  const cfg=i=>({idx:i,name:NAMES[i]||NAMES[0],kind:KINDS[i]||'classic',c:COLORS[i]||COLORS[0],desc:DESCS[i]||'',price:price(i),power:power(i),radius:radius(i),duration:i===20?2.05:i>=19?1.7:i>=15?1.5:1.22+Math.min(.2,i*.008)});
  window.SCUltSkins={protocol:'sc.ult.v1',count:21,get:cfg,power,radius};

  let layer=null,ctx=null,title=null,active=null,last=performance.now(),tasks=[];
  function mount(){
    if(layer)return;layer=document.createElement('canvas');layer.id='scUltCanvas';document.body.appendChild(layer);
    title=document.createElement('div');title.id='scUltTitle';title.innerHTML='<b></b><span></span>';document.body.appendChild(title);ctx=layer.getContext('2d');resize();
  }
  function resize(){if(!layer)return;const d=Math.min(devicePixelRatio||1,2);layer.width=Math.max(1,innerWidth*d);layer.height=Math.max(1,innerHeight*d);layer.style.width=innerWidth+'px';layer.style.height=innerHeight+'px';ctx.setTransform(d,0,0,d,0,0)}
  addEventListener('resize',resize,{passive:true});addEventListener('orientationchange',()=>setTimeout(resize,120),{passive:true});
  function project(q){const z=typeof Z==='number'?Z:1,fa=(typeof AB!=='undefined'&&AB.fa)||0,dx=(q.x-cam.x)*z,dy=(q.y-cam.y)*z,ca=Math.cos(fa),sa=Math.sin(fa);return[innerWidth/2+dx*ca-dy*sa,innerHeight/2+dx*sa+dy*ca]}
  function ring(cx,cy,r,col,a=1,w=3){ctx.globalAlpha=a;ctx.strokeStyle=col;ctx.lineWidth=w;ctx.beginPath();ctx.arc(cx,cy,r,0,TAU);ctx.stroke()}
  function ray(cx,cy,a,r0,r1,col,alpha=1,w=3){ctx.globalAlpha=alpha;ctx.strokeStyle=col;ctx.lineWidth=w;ctx.beginPath();ctx.moveTo(cx+Math.cos(a)*r0,cy+Math.sin(a)*r0);ctx.lineTo(cx+Math.cos(a)*r1,cy+Math.sin(a)*r1);ctx.stroke()}
  function poly(cx,cy,n,r,rot,col,alpha=1){ctx.globalAlpha=alpha;ctx.strokeStyle=col;ctx.lineWidth=2;ctx.beginPath();for(let i=0;i<=n;i++){const a=rot+(i%n)/n*TAU,x=cx+Math.cos(a)*r,y=cy+Math.sin(a)*r;i?ctx.lineTo(x,y):ctx.moveTo(x,y)}ctx.stroke()}
  function bolt(cx,cy,a,len,col,alpha){ctx.globalAlpha=alpha;ctx.strokeStyle=col;ctx.lineWidth=3;ctx.beginPath();let x=cx,y=cy;ctx.moveTo(x,y);for(let i=1;i<=5;i++){const d=len*i/5;x=cx+Math.cos(a)*d+Math.sin(a)*(i%2?8:-7);y=cy+Math.sin(a)*d-Math.cos(a)*(i%2?8:-7);ctx.lineTo(x,y)}ctx.stroke()}
  function drawFX(now){
    if(!ctx||!active)return;const a=active,q=a.q;if(!q||q.dead||st!=='play'){active=null;title.className='';ctx.clearRect(0,0,innerWidth,innerHeight);return}
    const t=(now-a.start)/(a.conf.duration*1000);if(t>=1){active=null;title.className='';ctx.clearRect(0,0,innerWidth,innerHeight);return}
    ctx.clearRect(0,0,innerWidth,innerHeight);const [cx,cy]=project(q),fade=Math.sin(Math.PI*Math.min(1,t)),c=a.conf.c[0],c2=a.conf.c[1],tier=Math.min(1,a.conf.price/12000),n=MOBILE?Math.round(12+20*tier+(a.idx===20?18:0)):12;
    ctx.save();ctx.globalCompositeOperation='lighter';ctx.fillStyle=c;ctx.globalAlpha=.035+.055*fade;ctx.fillRect(0,0,innerWidth,innerHeight);
    const spin=now*.0022;
    if(a.conf.kind==='classic'){for(let i=0;i<3;i++)ring(cx,cy,(55+i*52)+t*100,c2,fade*(.8-i*.15),3)}
    else if(a.conf.kind==='camo'){ring(cx,cy,95+t*80,c,fade,3);ray(cx,cy,spin,0,190,c2,fade,2);for(let i=0;i<4;i++)ray(cx,cy,i*Math.PI/2,75,125,c,fade*.7,2)}
    else if(a.conf.kind==='wood'){for(let i=0;i<6;i++)ray(cx,cy,spin+i*TAU/6,38,145,c2,fade,6);ring(cx,cy,80+t*55,c,fade*.8,7)}
    else if(a.conf.kind==='space'){ctx.fillStyle='#08101f';ctx.globalAlpha=.8*fade;ctx.beginPath();ctx.arc(cx,cy,32+18*fade,0,TAU);ctx.fill();for(let i=0;i<7;i++){const an=spin*(1+i*.06)+i*TAU/7,rr=70+i*10;ring(cx,cy,rr,c,fade*.35,1);ctx.fillStyle=c2;ctx.globalAlpha=fade;ctx.beginPath();ctx.arc(cx+Math.cos(an)*rr,cy+Math.sin(an)*rr,3+i%2,0,TAU);ctx.fill()}}
    else if(a.conf.kind==='pirate'){for(let i=0;i<6;i++){const an=i*TAU/6+spin*.25;ray(cx,cy,an,70,165,c2,fade,9);ring(cx+Math.cos(an)*175,cy+Math.sin(an)*175,18+20*t,c,fade,4)}}
    else if(a.conf.kind==='ninja'){for(let i=0;i<8;i++){const yy=cy-110+i*30+(i%2?8:-8);ctx.strokeStyle=i%2?c:c2;ctx.globalAlpha=fade;ctx.lineWidth=3+i%3;ctx.beginPath();ctx.moveTo(cx-155,yy+50);ctx.lineTo(cx+155,yy-50);ctx.stroke()}}
    else if(a.conf.kind==='knight'){poly(cx,cy,6,90+t*40,Math.PI/6,c2,fade);for(let i=0;i<8;i++)ray(cx,cy,i*TAU/8+spin*.15,65,160,c,fade,5)}
    else if(a.conf.kind==='cowboy'){ring(cx,cy,105+t*35,c2,fade,2);for(let i=0;i<4;i++)ray(cx,cy,i*Math.PI/2,80,145,c,fade,2);for(let i=0;i<10;i++)ray(cx,cy,(i*2.399+spin*.1)%TAU,135,210,c2,fade*.6,2)}
    else if(a.conf.kind==='mage'){for(let i=0;i<3;i++){poly(cx,cy,6+i,62+i*35+t*20,spin*(i%2?1:-1),i%2?c:c2,fade);ring(cx,cy,48+i*46,c2,fade*.35,1)}}
    else if(a.conf.kind==='samurai'){for(let i=0;i<7;i++){ctx.strokeStyle=i===3?c2:c;ctx.globalAlpha=fade*(i===3?1:.65);ctx.lineWidth=i===3?7:3;ctx.beginPath();ctx.moveTo(cx-180,cy+(i-3)*24+28);ctx.lineTo(cx+180,cy+(i-3)*24-28);ctx.stroke()}}
    else if(a.conf.kind==='zombie'){for(let i=0;i<n;i++){const an=i*TAU/n+spin*.3,rr=45+(i%5)*28+t*35;ctx.fillStyle=i%3?c:c2;ctx.globalAlpha=fade*.7;ctx.beginPath();ctx.arc(cx+Math.cos(an)*rr,cy+Math.sin(an)*rr,5+i%5,0,TAU);ctx.fill()}ring(cx,cy,130+t*35,c,fade,5)}
    else if(a.conf.kind==='viking'){ring(cx,cy,115,c2,fade*.5,3);for(let i=0;i<9;i++)bolt(cx,cy,i*TAU/9+spin*.08,180,c2,fade)}
    else if(a.conf.kind==='robot'){for(let i=0;i<4;i++)poly(cx,cy,4,55+i*34,spin*(i%2?1:-1),i%2?c:c2,fade*.8);for(let i=0;i<8;i++)ray(cx,cy,i*TAU/8,85,175,c,fade*.6,2)}
    else if(a.conf.kind==='clown'){for(let i=0;i<n;i++){const an=i*2.399+spin*(i%2?1:-1),rr=55+(i%6)*25;poly(cx+Math.cos(an)*rr,cy+Math.sin(an)*rr,3+(i%3),7+i%5,an,c2,fade*.8)}ring(cx,cy,145,c,fade*.7,5)}
    else if(a.conf.kind==='bone'){for(let i=0;i<14;i++){const an=i*TAU/14+spin*.06;ray(cx,cy,an,55,155,c2,fade,5);ray(cx,cy,an+.12,120,145,c,fade*.7,2)}}
    else if(a.conf.kind==='angel'){ring(cx,cy-35,48+t*12,c2,fade,5);for(const s of[-1,1])for(let i=0;i<8;i++){const an=(s<0?Math.PI:0)+(i-3.5)*.13;ray(cx+s*20,cy+5,an,25,95+i*8,c2,fade*.8,5)}for(let i=0;i<12;i++)ray(cx,cy,i*TAU/12,75,165,c,fade*.45,2)}
    else if(a.conf.kind==='demon'){for(let i=0;i<5;i++)poly(cx,cy,5,70+i*18,spin*(i%2?1:-1),i%2?c2:c,fade*.8);for(let i=0;i<10;i++)ray(cx,cy,i*TAU/10+spin*.15,60,180,c,fade*.7,4)}
    else if(a.conf.kind==='dragon'){for(let i=0;i<n;i++){const an=spin*1.2+i*.52,rr=25+i*5;ctx.fillStyle=i%2?c:c2;ctx.globalAlpha=fade*.65;ctx.beginPath();ctx.arc(cx+Math.cos(an)*rr,cy+Math.sin(an)*rr,4+i%6,0,TAU);ctx.fill()}for(let i=0;i<5;i++)ray(cx,cy,spin*.2+i*TAU/5,70,190,c2,fade,7)}
    else if(a.conf.kind==='cyber'){for(let i=-5;i<=5;i++){ctx.strokeStyle=i%2?c:c2;ctx.globalAlpha=fade*.35;ctx.lineWidth=1;ctx.beginPath();ctx.moveTo(cx-190,cy+i*28);ctx.lineTo(cx+190,cy+i*28);ctx.stroke();ctx.beginPath();ctx.moveTo(cx+i*28,cy-190);ctx.lineTo(cx+i*28,cy+190);ctx.stroke()}for(let i=0;i<3;i++)ring(cx,cy,65+i*45+t*30,i%2?c:c2,fade,3)}
    else if(a.conf.kind==='gold'){for(let i=0;i<5;i++){ctx.strokeStyle=i%2?c2:c;ctx.globalAlpha=fade;ctx.lineWidth=9-i;ctx.beginPath();ctx.arc(cx,cy,72+i*30,spin+i*.7,spin+Math.PI*1.1+i*.7);ctx.stroke()}for(let i=0;i<12;i++)ray(cx,cy,i*TAU/12+spin*.1,105,205,c2,fade*.65,3)}
    else if(a.conf.kind==='admin'){for(let i=0;i<5;i++)ring(cx+(i%2?6:-6)*Math.sin(now*.03+i),cy,60+i*42+t*28,i%2?c:c2,fade,3+i%2);for(let i=0;i<20;i++){const y=(i*47+now*.18)%innerHeight;ctx.fillStyle=i%2?c:c2;ctx.globalAlpha=fade*(.08+(i%4)*.03);ctx.fillRect(0,y,innerWidth,2+i%3)}for(let i=0;i<n;i++){const an=i*2.399+spin*1.6,rr=55+(i%8)*24;ctx.fillStyle=i%2?c:c2;ctx.globalAlpha=fade*.65;ctx.fillRect(cx+Math.cos(an)*rr-5,cy+Math.sin(an)*rr-2,10+(i%4)*5,3+(i%3))}}
    ctx.restore()
  }

  function announce(conf){mount();title.querySelector('b').textContent=conf.name;title.querySelector('span').textContent=conf.desc;title.style.setProperty('--u1',conf.c[0]);title.style.setProperty('--u2',conf.c[1]);title.className='on '+conf.kind}
  function schedule(q,delay,fn){tasks.push({q,t:delay,fn})}
  function owner(q,fn){const old=P;P=q;try{return fn()}finally{P=old}}
  function around(q,r){return E.filter(e=>e&&!e.dead&&Math.hypot(e.x-q.x,e.y-q.y)<=r+(e.r||0))}
  function nearest(q,n,r=9999){return E.filter(e=>e&&!e.dead&&Math.hypot(e.x-q.x,e.y-q.y)<r).sort((a,b)=>Math.hypot(a.x-q.x,a.y-q.y)-Math.hypot(b.x-q.x,b.y-q.y)).slice(0,n)}
  function hitOne(q,e,m){if(!e||e.dead)return;owner(q,()=>hit(e,q.dmg*m*power(q.__ultSkin)*dx,q.x,q.y,true))}
  function blast(q,r,m){if(!q||q.dead)return;owner(q,()=>boom(q.x,q.y,r,q.dmg*m*power(q.__ultSkin)*dx))}
  function spot(q,x0,y0,r,m){if(!q||q.dead)return;owner(q,()=>boom(x0,y0,r,q.dmg*m*power(q.__ultSkin)*dx))}

  function special(q,idx,conf){
    q.__ultSkin=idx;const p=conf.power,r=conf.radius;
    if(idx===1){nearest(q,4,r*1.4).forEach((e,i)=>schedule(q,.12+i*.09,()=>spot(q,e.x,e.y,75,3.2)))}
    else if(idx===2){schedule(q,.18,()=>blast(q,r*.76,5));schedule(q,.38,()=>blast(q,r*.9,4))}
    else if(idx===3){for(const e of around(q,r*1.15))if(!e.boss){e.x+=(q.x-e.x)*.16;e.y+=(q.y-e.y)*.16}schedule(q,.32,()=>blast(q,r,6.2))}
    else if(idx===4){for(let i=0;i<6;i++){const a=i*TAU/6;const xx=q.x+Math.cos(a)*r*.72,yy=q.y+Math.sin(a)*r*.72;schedule(q,.08+i*.06,()=>spot(q,xx,yy,92,3.7))}}
    else if(idx===5){nearest(q,9,r*1.25).forEach((e,i)=>schedule(q,.04+i*.045,()=>hitOne(q,e,5.2)))}
    else if(idx===6){q.hp=Math.min(q.mhp,q.hp+q.mhp*.07);q.sh=Math.min(q.shM,Math.max(q.sh||0,1));schedule(q,.22,()=>blast(q,r*.86,5.4))}
    else if(idx===7){for(const e of around(q,r*1.25)){if(!e.boss&&e.hp/e.mh<=.28)hitOne(q,e,80)}nearest(q,6,r*1.4).forEach((e,i)=>schedule(q,.08+i*.05,()=>hitOne(q,e,5.5)))}
    else if(idx===8){for(let i=1;i<=3;i++)schedule(q,i*.16,()=>blast(q,r*(.58+i*.13),3.7+i*.45))}
    else if(idx===9){nearest(q,10,r*1.2).forEach((e,i)=>schedule(q,.04+i*.035,()=>hitOne(q,e,6.1)))}
    else if(idx===10){const n=around(q,r).length;q.hp=Math.min(q.mhp,q.hp+q.mhp*Math.min(.12,.035+n*.004));schedule(q,.2,()=>blast(q,r*.82,5.5))}
    else if(idx===11){nearest(q,10,r*1.4).forEach((e,i)=>schedule(q,.06+i*.055,()=>{hitOne(q,e,6.3);FX.push({bolt:1,x0:e.x,y0:e.y-150,x:e.x,y:e.y,t:.15})}))}
    else if(idx===12){for(let i=0;i<7;i++){const a=i*TAU/7+.3,xx=q.x+Math.cos(a)*r*.72,yy=q.y+Math.sin(a)*r*.72;schedule(q,.07+i*.055,()=>spot(q,xx,yy,90,4.4))}}
    else if(idx===13){for(let i=0;i<9;i++){const a=(i*2.399)%(TAU),rr=r*(.25+(i%4)*.17),xx=q.x+Math.cos(a)*rr,yy=q.y+Math.sin(a)*rr;schedule(q,.06+i*.045,()=>spot(q,xx,yy,80,4.1))}}
    else if(idx===14){schedule(q,.14,()=>blast(q,r*.75,5.2));schedule(q,.32,()=>{blast(q,r,5.8);nearest(q,8,r*1.2).forEach(e=>hitOne(q,e,3.5))})}
    else if(idx===15){q.hp=Math.min(q.mhp,q.hp+q.mhp*.18);q.sh=Math.min(q.shM,Math.max(q.sh||0,2));q.iv=Math.max(q.iv||0,1.25);for(let i=1;i<=3;i++)schedule(q,i*.17,()=>blast(q,r*(.62+i*.12),4.8))}
    else if(idx===16){for(let i=1;i<=4;i++)schedule(q,i*.13,()=>blast(q,r*(.58+i*.1),4.8+i*.35))}
    else if(idx===17){for(let i=1;i<=5;i++)schedule(q,i*.11,()=>blast(q,r*(.52+i*.09),4.6+i*.38))}
    else if(idx===18){q.iv=Math.max(q.iv||0,1.15);PW.fr=Math.max(PW.fr||0,2.2);for(let i=1;i<=4;i++)schedule(q,i*.12,()=>blast(q,r*(.62+i*.09),5.4))}
    else if(idx===19){q.hp=Math.min(q.mhp,q.hp+q.mhp*.12);for(const e of around(q,r*1.18))if(!e.boss&&e.hp/e.mh<=.5)hitOne(q,e,120);for(let i=1;i<=4;i++)schedule(q,i*.14,()=>blast(q,r*(.68+i*.08),6.2+i*.45))}
    else if(idx===20){q.iv=Math.max(q.iv||0,2.4);q.hp=Math.min(q.mhp,q.hp+q.mhp*.25);q.sh=Math.max(q.sh||0,q.shM||0);EB.length=0;for(const e of around(q,620))if(!e.boss)hitOne(q,e,250);nearest(q,4,900).filter(e=>e.boss).forEach(e=>hitOne(q,e,18));for(let i=1;i<=6;i++)schedule(q,.09+i*.11,()=>blast(q,340+i*32,6.5+i*.65))}
    if(idx>0&&idx<15)schedule(q,.1,()=>blast(q,r*.7,2.1+idx*.08));
  }

  const original=fireUlt;
  fireUlt=function(){
    if(st!=='play'||ult<100||!P||P.dead)return;
    const q=P,idx=Math.max(0,Math.min(20,Number.isInteger(q.sk)?q.sk:(Number(S.skin)||0))),conf=cfg(idx);q.__ultSkin=idx;
    ult=0;try{ach('e_ult')}catch(_){ };
    owner(q,()=>boom(q.x,q.y,conf.radius,q.dmg*14*conf.power*dx));
    for(let i=0;i<3+(idx>=15?2:0);i++)FX.push({x:q.x,y:q.y,r:100+i*(45+idx),t:.25+i*.045,ring:1});
    EB.length=0;fz=Math.max(fz,idx===20?2.1:1.15+Math.min(.65,conf.price/18000));shake=Math.max(shake,idx===20?28:15+Math.min(9,idx*.35));flash=Math.max(flash,idx===20?.85:.42+Math.min(.22,idx*.008));try{sfx(idx>=19?'boss2':'boom')}catch(_){ };
    announce(conf);active={q,idx,conf,start:performance.now()};special(q,idx,conf)
  };

  function tick(now){const dt=Math.min(.05,Math.max(0,(now-last)/1000));last=now;if(st==='play'){for(let i=tasks.length-1;i>=0;i--){const a=tasks[i];a.t-=dt;if(a.t<=0){tasks.splice(i,1);if(a.q&&!a.q.dead)try{a.fn()}catch(e){console.warn('[Skin ULT task]',e)}}}}else tasks.length=0;drawFX(now);requestAnimationFrame(tick)}
  mount();requestAnimationFrame(tick);
  console.log('[Mobile] 21 animated skin ultimates enabled; price scales power; ADMIN is apex ULT');
}catch(err){console.warn('[Mobile Skin ULTs]',err)}
})();