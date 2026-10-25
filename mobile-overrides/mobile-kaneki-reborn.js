(() => {
'use strict';
try{
  if(typeof SK==='undefined'||typeof SPR==='undefined'||typeof S==='undefined'||typeof fireUlt!=='function')return;
  const TAU=Math.PI*2,PRICE=28000;
  let admin=SK.findIndex(s=>s&&s[0]==='ADMIN');
  if(admin<0){SK.push(['ADMIN','#ff2a2a',4,999999999]);admin=SK.length-1}
  let IDX=SK.findIndex(s=>s&&/^Kaneki\b/i.test(s[0]));
  if(IDX<0){IDX=SK.length;SK.push(['Kaneki · Ghoul','#17151d',11,PRICE])}
  window.SC_KANEKI_INDEX=IDX;

  const K={activeUntil:0,poseUntil:0,cutUntil:0,start:0,combo:0};
  const now=()=>performance.now();
  const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
  const rect=(c,a,b,w,h,col)=>{c.fillStyle=col;c.fillRect(Math.round(a),Math.round(b),Math.round(w),Math.round(h))};
  const poly=(c,p,col)=>{c.fillStyle=col;c.beginPath();c.moveTo(p[0][0],p[0][1]);for(let i=1;i<p.length;i++)c.lineTo(p[i][0],p[i][1]);c.closePath();c.fill()};
  const circ=(c,a,b,r,col)=>{c.fillStyle=col;c.beginPath();c.arc(a,b,r,0,TAU);c.fill()};

  function curve(r,ang,len,pow,seed){
    const out=[],t=now()/1000;
    for(let i=0;i<=12;i++){
      const u=i/12,d=len*u*pow,w=Math.sin(u*5.2+seed*1.9+t*3.2)*r*(.12+u*.95)*pow;
      out.push([Math.cos(ang)*d+Math.cos(ang+Math.PI/2)*w,Math.sin(ang)*d+Math.sin(ang+Math.PI/2)*w+r*.18]);
    }
    return out;
  }
  function tentacle(c,pts,r,alpha=1){
    c.save();c.globalAlpha=alpha;c.lineCap='round';c.lineJoin='round';
    const cols=['#1b0009','#760321','#ca0c3d','#ff466d'];
    for(let l=0;l<4;l++){
      c.strokeStyle=cols[l];
      for(let i=0;i<pts.length-1;i++){
        const u=i/(pts.length-1),ww=Math.max(1,r*(.72*(1-u)+.08)*(1-l*.22));
        c.lineWidth=ww;c.beginPath();c.moveTo(pts[i][0],pts[i][1]);c.lineTo(pts[i+1][0],pts[i+1][1]);c.stroke();
      }
    }
    const a=pts[pts.length-2],b=pts[pts.length-1],dx=b[0]-a[0],dy=b[1]-a[1],d=Math.hypot(dx,dy)||1,px=-dy/d,py=dx/d;
    poly(c,[[b[0]+dx/d*r*.55,b[1]+dy/d*r*.55],[b[0]+px*r*.18,b[1]+py*r*.18],[b[0]-px*r*.18,b[1]-py*r*.18]],'#ff315e');
    c.restore();
  }
  function kagune(c,r,power,count=4,wide=1){
    const spin=now()*.00016;
    for(let i=0;i<count;i++){
      const base=-Math.PI*.78+i*(TAU/count);
      tentacle(c,curve(r,base+spin*(i%2?1:-1),r*(3.2+wide*1.8+(i%2)*.35),power,i+1),r*.78,.94);
    }
  }

  function direction(a){
    const ca=Math.cos(a),sa=Math.sin(a);
    if(Math.abs(sa)>Math.abs(ca)*1.05)return sa>0?'down':'up';
    return ca<0?'left':'right';
  }
  function drawHair(c,r,dir){
    const back=dir==='up';
    const col=back?'#c8c9d1':'#f2f2f5',shade='#b7b8c2';
    circ(c,0,-r*.86,r*.72,shade);
    poly(c,[[-.70,-.92],[-.55,-1.32],[-.34,-1.16],[-.20,-1.42],[-.02,-1.18],[.18,-1.43],[.31,-1.14],[.52,-1.31],[.70,-.92],[.58,-.62],[-.58,-.62]].map(p=>[p[0]*r,p[1]*r]),col);
    if(!back){
      const shift=dir==='left'?-r*.06:dir==='right'?r*.06:0;
      poly(c,[[-.58,-1.02],[-.40,-1.24],[-.30,-.90],[-.10,-1.25],[.00,-.88],[.18,-1.23],[.28,-.90],[.48,-1.15],[.60,-.82],[.28,-.66],[-.04,-.72],[-.30,-.64]].map(p=>[(p[0]*r)+shift,p[1]*r]),'#fff');
    }
  }
  function drawFace(c,r,dir){
    if(dir==='up')return;
    poly(c,[[-r*.55,-r*.79],[r*.55,-r*.79],[r*.50,-r*.48],[r*.20,-r*.32],[-r*.20,-r*.32],[-r*.50,-r*.48]],'#0b0b10');
    rect(c,-r*.47,-r*.58,r*.94,r*.10,'#28282f');
    for(let i=-4;i<=4;i++)rect(c,i*r*.102-r*.032,-r*.56,r*.065,r*.105,i%2?'#cfd0d2':'#f5f2e8');
    const ex=dir==='left'?-r*.19:dir==='right'?r*.19:r*.21;
    circ(c,ex,-r*.78,r*.18,'#050509');circ(c,ex,-r*.78,r*.085,'#ef1747');circ(c,ex-r*.018,-r*.81,r*.026,'#fff');
    if(dir==='down'){
      poly(c,[[-r*.48,-r*.89],[-r*.05,-r*.90],[-r*.08,-r*.67],[-r*.50,-r*.65]],'#16151c');
      rect(c,-r*.44,-r*.76,r*.36,r*.055,'#2a2830');
    }
  }
  function drawBody(c,r,dir,q){
    const walk=(typeof mv!=='undefined'&&mv)?Math.sin((typeof tm!=='undefined'?tm:0)*14):0;
    const dash=q&&q.dT>0,lean=dash?(dir==='left'?-r*.16:dir==='right'?r*.16:0):0;
    c.save();c.translate(lean,dash?r*.06:0);
    rect(c,-r*.39,r*.35+walk*r*.08,r*.27,r*.48,'#121217');
    rect(c,r*.12,r*.35-walk*r*.08,r*.27,r*.48,'#121217');
    rect(c,-r*.44,r*.71+walk*r*.08,r*.34,r*.14,'#050509');
    rect(c,r*.10,r*.71-walk*r*.08,r*.34,r*.14,'#050509');
    poly(c,[[-r*.56,-r*.16],[r*.56,-r*.16],[r*.47,r*.48],[r*.18,r*.57],[0,r*.45],[-r*.18,r*.57],[-r*.47,r*.48]],'#17171d');
    poly(c,[[-r*.44,-r*.10],[0,-r*.22],[r*.44,-r*.10],[r*.31,r*.35],[0,r*.28],[-r*.31,r*.35]],'#24242c');
    rect(c,-r*.045,-r*.16,r*.09,r*.57,'#78051d');
    const pose=now()<K.poseUntil;
    if(pose&&dir!=='up'){
      rect(c,-r*.67,-r*.06,r*.22,r*.47,'#17171d');
      rect(c,r*.43,-r*.29,r*.22,r*.43,'#17171d');
      rect(c,r*.40,-r*.55,r*.21,r*.31,'#dbc9c3');
      rect(c,r*.20,-r*.67,r*.095,r*.31,'#e8d7d2');
      rect(c,r*.32,-r*.70,r*.09,r*.34,'#e8d7d2');
    }else{
      rect(c,-r*.67,-r*.07,r*.22,r*.50,'#17171d');rect(c,r*.45,-r*.07,r*.22,r*.50,'#17171d');
      rect(c,-r*.66,r*.32,r*.18,r*.15,'#d8c6bf');rect(c,r*.48,r*.32,r*.18,r*.15,'#d8c6bf');
    }
    circ(c,0,-r*.82,r*.68,'#dcc8c0');
    drawFace(c,r,dir);drawHair(c,r,dir);
    if(dir!=='up'){
      poly(c,[[-r*.42,-r*.28],[-r*.11,-r*.42],[0,-r*.27],[-r*.22,-r*.12]],'#08080d');
      poly(c,[[r*.42,-r*.28],[r*.11,-r*.42],[0,-r*.27],[r*.22,-r*.12]],'#08080d');
      rect(c,-r*.56,-r*.18,r*.065,r*.32,'#8d0728');
    } else {
      rect(c,-r*.43,-r*.25,r*.86,r*.17,'#0b0b10');
      rect(c,-r*.07,-r*.25,r*.14,r*.42,'#6f061d');
    }
    c.restore();
  }
  function drawKaneki(c,r,a,q,preview=false){
    const dir=direction(a),active=now()<K.activeUntil,dash=q&&q.dT>0;
    c.save();
    if(preview||active||dash){
      const p=preview?.72:active?clamp((now()-K.start)/360,0,1):.34;
      kagune(c,r,p,active?6:4,active?1.35:.72);
    }
    drawBody(c,r,dir,q);
    c.restore();
    return 1;
  }

  const prevHero=SPR.hero.bind(SPR);
  SPR.hero=function(c,r,a,si,q){if(si===IDX)return drawKaneki(c,r,a,q,false);return prevHero(c,r,a,si,q)};

  const style=document.createElement('style');style.id='scKanekiRebornStyle';style.textContent=`
#scKanekiCut{position:fixed;z-index:95;inset:0;display:none;align-items:center;justify-content:center;pointer-events:none;background:radial-gradient(circle at 50% 52%,rgba(92,0,25,.52),rgba(4,3,8,.90) 58%,rgba(0,0,0,.97));overflow:hidden}
#scKanekiCut.on{display:flex;animation:scKanekiCutIn .16s steps(2,end)}
#scKanekiCut canvas{width:min(68vw,460px);height:auto;image-rendering:pixelated;filter:drop-shadow(0 0 20px rgba(255,30,74,.42))}
#scKanekiCut .txt{position:absolute;left:0;right:0;bottom:8%;text-align:center;font-family:monospace;font-weight:900;letter-spacing:.16em;color:#fff;text-shadow:0 2px #000,0 0 16px #ff174c}
#scKanekiCut .txt b{display:block;font-size:clamp(18px,4vw,38px);color:#ff315f}.scKCrack{font-size:clamp(9px,1.7vw,14px);opacity:.78}
@keyframes scKanekiCutIn{from{opacity:0;transform:scale(1.06)}to{opacity:1;transform:none}}
#sg .sk.sc-kaneki{border-color:#8d1034!important;box-shadow:inset 0 0 0 1px rgba(255,62,105,.24),0 0 22px rgba(170,0,45,.17)}
#sg .sk.sc-kaneki:before{content:'RINKAKU';position:absolute;right:7px;top:7px;font:900 7px/1 monospace;letter-spacing:.11em;color:#ff5276}
`;document.head.appendChild(style);
  const cut=document.createElement('div');cut.id='scKanekiCut';
  cut.innerHTML='<canvas width="192" height="108"></canvas><div class="txt"><b>RINKAKU // 1000 − 7</b><span class="scKCrack">ESTALO · KAKUGAN · DESPERTAR</span></div>';
  document.body.appendChild(cut);
  const cc=cut.querySelector('canvas'),cx=cc.getContext('2d');cx.imageSmoothingEnabled=false;

  function handFrame(frame){
    cx.clearRect(0,0,192,108);
    cx.fillStyle='#08050a';cx.fillRect(0,0,192,108);
    for(let y=0;y<108;y+=4){cx.fillStyle=y%8?'#13060b':'#200711';cx.fillRect(0,y,192,1)}
    cx.fillStyle='#ececf0';cx.fillRect(23,18,42,9);cx.fillRect(17,27,54,14);cx.fillRect(14,41,58,17);
    cx.fillStyle='#0a0910';cx.fillRect(15,55,58,28);cx.fillRect(20,78,49,11);
    cx.fillStyle='#ed1648';cx.fillRect(49,47,7,5);cx.fillStyle='#fff';cx.fillRect(51,47,2,1);
    for(let i=0;i<8;i++){cx.fillStyle=i%2?'#d2d2d5':'#f6f3e9';cx.fillRect(25+i*5,64,4,5)}
    const k=[0,2,4,6,4,1][frame%6];
    cx.fillStyle='#d7c3bb';
    cx.fillRect(112,53,30,29);cx.fillRect(103,72,50,13);
    cx.fillRect(134-k,31+k,8,31);
    cx.fillRect(123,35,7,28);cx.fillRect(113,39,7,25);cx.fillRect(104,44,7,20);
    cx.fillStyle='#24121a';cx.fillRect(103,82,51,16);
    cx.fillStyle='#e5d3cc';cx.fillRect(147,42,20,25);cx.fillRect(139+k,36-k,24,8);cx.fillRect(143+k,31-k,7,18);
    if(frame===3||frame===4){
      cx.fillStyle='#ff2b5b';cx.fillRect(143,29,3,10);cx.fillRect(138,34,13,3);cx.fillStyle='#fff';cx.fillRect(144,32,2,3);
    }
    if(frame>=3){
      cx.strokeStyle='#d10b3d';cx.lineWidth=4;
      for(let i=0;i<3;i++){cx.beginPath();cx.moveTo(94,94-i*7);cx.quadraticCurveTo(120+i*8,72-i*12,186,88-i*22);cx.stroke()}
      cx.strokeStyle='#ff476c';cx.lineWidth=1;
      for(let i=0;i<3;i++){cx.beginPath();cx.moveTo(95,93-i*7);cx.quadraticCurveTo(125+i*6,72-i*11,186,87-i*22);cx.stroke()}
    }
  }
  function showCut(){
    K.cutUntil=now()+980;cut.classList.add('on');
    const start=now();
    function anim(){
      if(now()>=K.cutUntil){cut.classList.remove('on');return}
      const f=Math.min(5,Math.floor((now()-start)/145));handFrame(f);requestAnimationFrame(anim);
    }
    anim();
  }

  function worldCurve(px,py,ang,len,seed){
    const out=[];
    for(let i=0;i<=14;i++){const u=i/14,w=Math.sin(u*5.4+seed)*48*u;out.push([px+Math.cos(ang)*len*u+Math.cos(ang+Math.PI/2)*w,py+Math.sin(ang)*len*u+Math.sin(ang+Math.PI/2)*w])}
    return out;
  }
  function segDist(px,py,a,b){
    const vx=b[0]-a[0],vy=b[1]-a[1],wx=px-a[0],wy=py-a[1],vv=vx*vx+vy*vy,t=vv?clamp((wx*vx+wy*vy)/vv,0,1):0;
    return Math.hypot(px-(a[0]+vx*t),py-(a[1]+vy*t));
  }
  function damage(e,amount){
    if(!e||e.dead)return;
    try{hit(e,amount,P.x,P.y)}catch(_){e.hp-=amount;if(e.hp<=0)try{kill(e)}catch(__){e.dead=1}}
  }
  function lash(ang,len,mul,seed){
    if(st!=='play'||!P)return;
    const pts=worldCurve(P.x,P.y,ang,len,seed),base=P.dmg*(typeof dx==='number'?dx:1);
    for(let i=2;i<pts.length;i+=2)try{FX.push({x:pts[i][0],y:pts[i][1],r:13+i*1.3,t:.18+i*.006,ring:1})}catch(_){}
    for(const e of E){
      if(!e||e.dead)continue;
      for(let i=0;i<pts.length-1;i++){
        if(segDist(e.x,e.y,pts[i],pts[i+1])<(e.r||12)+22){damage(e,base*mul*(e.boss?.72:1));break}
      }
    }
  }
  function radialLashes(count,mul,len,offset=0){
    for(let i=0;i<count;i++)lash(offset+i*TAU/count,len,mul,i+offset*3);
  }
  function targetBurst(count,mul){
    if(st!=='play'||!P)return;
    const base=P.dmg*(typeof dx==='number'?dx:1);
    const targets=E.filter(e=>e&&!e.dead).sort((a,b)=>Math.hypot(a.x-P.x,a.y-P.y)-Math.hypot(b.x-P.x,b.y-P.y)).slice(0,count);
    targets.forEach((e,i)=>{
      const ang=Math.atan2(e.y-P.y,e.x-P.x);
      lash(ang,Math.min(520,Math.hypot(e.x-P.x,e.y-P.y)+70),mul,i+9);
      if(i%2===0)damage(e,base*mul*.55*(e.boss?.65:1));
    });
  }
  function cage(){
    if(st!=='play'||!P)return;
    const base=P.dmg*(typeof dx==='number'?dx:1);
    for(const e of E){
      if(!e||e.dead)continue;
      const vx=P.x-e.x,vy=P.y-e.y,d=Math.hypot(vx,vy)||1;
      if(d<430){
        const pull=e.boss?.035:.12;e.x+=vx*pull;e.y+=vy*pull;
        damage(e,base*(e.boss?2.1:3.4));
      }
    }
    for(let i=0;i<8;i++)try{FX.push({x:P.x,y:P.y,r:95+i*38,t:.32+i*.025,ring:1})}catch(_){}
  }
  function finisher(){
    if(st!=='play'||!P)return;
    const base=P.dmg*(typeof dx==='number'?dx:1);
    radialLashes(10,4.6,510,Math.PI/10);
    try{boom(P.x,P.y,355,base*7.2)}catch(_){}
    for(const e of E)if(e&&!e.dead&&Math.hypot(e.x-P.x,e.y-P.y)<390)damage(e,base*(e.boss?3.8:6.5));
    P.hp=Math.min(P.mhp,P.hp+Math.max(12,P.mhp*.12));
    try{shake=36;flash=.82;sfx('boss2');ban('🩸 1000 − 7 // EXECUÇÃO RINKAKU')}catch(_){}
  }

  function ultKaneki(){
    if(st!=='play'||typeof ult==='undefined'||ult<100||!P)return;
    ult=0;try{ach('e_ult')}catch(_){}
    K.start=now();K.poseUntil=K.start+850;K.activeUntil=K.start+3600;K.combo++;
    showCut();
    try{EB.length=0;fz=.72;shake=18;flash=.62;ban('🩸 KANEKI // ESTALO');sfx('lvl')}catch(_){}
    setTimeout(()=>{if(st==='play'){radialLashes(4,3.2,360,.22);try{shake=16;ban('KAKUGAN // DESPERTAR')}catch(_){}}},420);
    setTimeout(()=>{if(st==='play'){targetBurst(8,3.6);try{shake=20;sfx('boom')}catch(_){}}},760);
    setTimeout(()=>{if(st==='play'){radialLashes(6,3.1,450,Math.PI/6);}},1050);
    setTimeout(()=>{if(st==='play'){cage();try{shake=24;ban('RINKAKU // JAULA')}catch(_){}}},1360);
    setTimeout(()=>{if(st==='play')targetBurst(10,3.9)},1640);
    setTimeout(()=>{if(st==='play')finisher()},1960);
  }

  const prevUlt=fireUlt;
  fireUlt=function(){if(S.skin===IDX)return ultKaneki();return prevUlt.apply(this,arguments)};

  if(window.SCUltSkins){
    const get0=SCUltSkins.get,p0=SCUltSkins.power,r0=SCUltSkins.radius;
    SCUltSkins.count=Math.max(Number(SCUltSkins.count)||0,IDX+1);
    SCUltSkins.get=i=>i===IDX?{idx:IDX,name:'RINKAKU // 1000 − 7',kind:'kaneki',c:['#a40935','#ff4a72'],desc:'Estalo, chicotadas Rinkaku, jaula e execução final.',price:PRICE,power:1.82,radius:460,duration:3.6}:get0(i);
    SCUltSkins.power=i=>i===IDX?1.82:p0(i);SCUltSkins.radius=i=>i===IDX?460:r0(i);
  }

  function polishCard(){
    try{
      const cards=[...document.querySelectorAll('#sg .sk')],card=cards.find(e=>/Kaneki/i.test(e.textContent||''));
      if(card){card.classList.add('sc-kaneki');const title=card.querySelector('b');if(title)title.textContent='Kaneki · Ghoul'}
    }catch(_){}
  }
  new MutationObserver(polishCard).observe(document.body,{childList:true,subtree:true});setTimeout(polishCard,500);

  window.SCKaneki={index:IDX,price:PRICE,ult:'RINKAKU // 1000 − 7',draw:drawKaneki};
  console.log('[Mobile] Kaneki Reborn enabled at skin index '+IDX+' with original pixel finger-crack cut-in and multi-stage Rinkaku ULT.');
}catch(err){console.warn('[Kaneki Reborn]',err)}
})();