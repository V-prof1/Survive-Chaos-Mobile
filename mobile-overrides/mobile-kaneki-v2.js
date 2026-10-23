(() => {
'use strict';
try{
  if(typeof SPR==='undefined'||typeof S==='undefined'||typeof window.SC_KANEKI_INDEX==='undefined')return;
  const IDX=window.SC_KANEKI_INDEX,TAU=Math.PI*2;
  const K2={activeUntil:0,poseUntil:0,cutUntil:0,start:0};
  const now=()=>performance.now();
  const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
  const poly=(c,p,col)=>{c.fillStyle=col;c.beginPath();c.moveTo(p[0][0],p[0][1]);for(let i=1;i<p.length;i++)c.lineTo(p[i][0],p[i][1]);c.closePath();c.fill()};
  const rect=(c,x,y,w,h,col)=>{c.fillStyle=col;c.fillRect(Math.round(x),Math.round(y),Math.round(w),Math.round(h))};

  function tentaclePoints(r,ang,len,power,seed){
    const pts=[],t=now()/1000;
    for(let j=0;j<=11;j++){
      const u=j/11,d=len*u*power,w=Math.sin(u*4.7+seed*1.71+t*3.4)*r*(.22+u*1.12)*power;
      const a=ang+Math.sin(t*1.7+seed)*.045;
      pts.push([Math.cos(a)*d+Math.cos(a+Math.PI/2)*w,Math.sin(a)*d+Math.sin(a+Math.PI/2)*w+r*.22]);
    }
    return pts;
  }
  function strokeTentacle(c,pts,r){
    c.lineCap='round';c.lineJoin='round';
    for(let layer=0;layer<3;layer++){
      for(let i=0;i<pts.length-1;i++){
        const u=i/(pts.length-1),w=r*((.82*(1-u)+.15)*(layer===0?1:layer===1?.60:.14));
        c.strokeStyle=layer===0?'#23000c':layer===1?'#9c0730':'#ff4569';
        c.lineWidth=Math.max(1,w);c.beginPath();c.moveTo(pts[i][0],pts[i][1]);c.lineTo(pts[i+1][0],pts[i+1][1]);c.stroke();
      }
    }
    // dark muscle bands + pointed organic tip
    c.strokeStyle='rgba(18,0,8,.65)';c.lineWidth=Math.max(1,r*.07);
    for(let i=2;i<pts.length-2;i+=2){const a=pts[i-1],b=pts[i+1],m=pts[i],dx=b[0]-a[0],dy=b[1]-a[1],d=Math.hypot(dx,dy)||1,px=-dy/d,py=dx/d,s=r*(.24*(1-i/pts.length)+.08);c.beginPath();c.moveTo(m[0]-px*s,m[1]-py*s);c.lineTo(m[0]+px*s,m[1]+py*s);c.stroke()}
    const a=pts[pts.length-2],b=pts[pts.length-1],dx=b[0]-a[0],dy=b[1]-a[1],d=Math.hypot(dx,dy)||1,px=-dy/d,py=dx/d;
    poly(c,[[b[0]+dx/d*r*.55,b[1]+dy/d*r*.55],[b[0]+px*r*.25,b[1]+py*r*.25],[b[0]-px*r*.25,b[1]-py*r*.25]],'#d70b3f');
    poly(c,[[b[0]+dx/d*r*.42,b[1]+dy/d*r*.42],[b[0]+px*r*.08,b[1]+py*r*.08],[b[0]-px*r*.08,b[1]-py*r*.08]],'#ff6985');
  }
  function drawKagune(c,r,power,preview){
    const count=preview?4:6,spin=(now()/1000)*.12;
    for(let i=0;i<count;i++){
      const ang=-Math.PI*.78+i*(TAU/count)+(preview?0:spin),len=r*(preview?3.5:7.2+i%2*.7);
      strokeTentacle(c,tentaclePoints(r,ang,len,power,i+1),r);
    }
  }
  function drawWeapon(c,r,a,q){
    if(!q||typeof CF==='undefined'||!SPR.WEAPON)return;
    const wp=SPR.WEAPON[CF.w||0];if(!wp)return;
    const ca=Math.cos(a),sa=Math.sin(a),s=r*4.2/96;
    c.save();c.translate(ca*r*.52,-r*.05+sa*r*.40);c.rotate(a);if(ca<0)c.scale(1,-1);SPR.at(c,'items',wp+'_1f',0,0,0,s);c.restore();
  }
  function drawKaneki(c,r,a,q,cinematic){
    const t=now(),active=t<K2.activeUntil,preview=!q||cinematic,move=typeof mv!=='undefined'&&mv;
    const power=preview?.58:active?clamp((t-K2.start)/420,0,1):0;
    const bob=(move?Math.sin((typeof tm!=='undefined'?tm:0)*15)*r*.055:Math.sin(t*.006)*r*.025);
    c.save();c.translate(0,bob);
    if(preview||active)drawKagune(c,r,power||.58,preview&&!active);
    // legs, deliberately proportioned like the game's normal heroes
    rect(c,-r*.56,r*.22,r*.40,r*.72,'#15141a');rect(c,r*.16,r*.22,r*.40,r*.72,'#111117');
    rect(c,-r*.60,r*.73,r*.46,r*.18,'#09090d');rect(c,r*.14,r*.73,r*.46,r*.18,'#09090d');
    // long black coat with red inner seam
    poly(c,[[-r*.78,-r*.20],[r*.78,-r*.20],[r*.64,r*.58],[r*.30,r*.70],[0,r*.51],[-r*.30,r*.70],[-r*.64,r*.58]],'#17161d');
    poly(c,[[-r*.64,-r*.13],[0,-r*.30],[r*.64,-r*.13],[r*.42,r*.38],[0,r*.26],[-r*.42,r*.38]],'#25232c');
    rect(c,-r*.06,-r*.24,r*.12,r*.79,'#79051f');
    rect(c,-r*.58,r*.13,r*1.16,r*.09,'#09090d');
    // arms; during ULT one hand rises into the finger-crack pose
    const pose=cinematic||t<K2.poseUntil;
    if(pose){
      rect(c,-r*.78,-r*.05,r*.30,r*.57,'#17161d');rect(c,r*.48,-r*.28,r*.28,r*.52,'#17161d');
      rect(c,r*.45,-r*.52,r*.24,r*.36,'#d8c5bf');rect(c,r*.28,-r*.67,r*.12,r*.34,'#e7d6d0');rect(c,r*.43,-r*.69,r*.11,r*.37,'#e7d6d0');
    }else{
      rect(c,-r*.82,-r*.10,r*.30,r*.62,'#17161d');rect(c,r*.52,-r*.10,r*.30,r*.62,'#17161d');
      rect(c,-r*.82,r*.37,r*.25,r*.20,'#d6c3bc');rect(c,r*.57,r*.37,r*.25,r*.20,'#d6c3bc');
    }
    // neck + head
    rect(c,-r*.20,-r*.43,r*.40,r*.22,'#d6c3bc');
    c.fillStyle='#decac3';c.strokeStyle='#0b0a0f';c.lineWidth=Math.max(1,r*.08);c.beginPath();c.arc(0,-r*.66,r*.62,0,TAU);c.fill();c.stroke();
    // black ghoul mask lower face
    poly(c,[[-r*.57,-r*.69],[r*.56,-r*.68],[r*.48,-r*.33],[0,-r*.24],[-r*.48,-r*.34]],'#111015');
    rect(c,-r*.48,-r*.54,r*.96,r*.14,'#202027');
    // mask teeth
    for(let i=-4;i<=4;i++)rect(c,i*r*.105-r*.035,-r*.52,r*.07,r*.12,i%2?'#d8d8d3':'#f2f0e8');
    // ghoul eye: dark sclera, bright red iris and glow
    c.fillStyle='#050509';c.beginPath();c.ellipse(r*.22,-r*.72,r*.20,r*.14,0,0,TAU);c.fill();
    c.fillStyle='rgba(255,21,65,.28)';c.beginPath();c.arc(r*.22,-r*.72,r*.27,0,TAU);c.fill();
    c.fillStyle='#f01748';c.beginPath();c.arc(r*.22,-r*.72,r*.095,0,TAU);c.fill();
    rect(c,r*.195,-r*.76,r*.05,r*.08,'#fff0f3');
    // opposite eye hidden by mask/patch shadow
    poly(c,[[-r*.48,-r*.82],[-r*.05,-r*.86],[-r*.08,-r*.63],[-r*.50,-r*.60]],'#15131a');
    // layered white hair, more detailed but same chunky language as other skins
    const hairBack=[[-.62,-.80],[-.54,-1.15],[-.34,-1.03],[-.20,-1.30],[-.02,-1.08],[.16,-1.34],[.28,-1.08],[.49,-1.22],[.60,-.92],[.52,-.71]];
    poly(c,hairBack.map(p=>[p[0]*r,p[1]*r]),'#b9b8c0');
    const bangs=[[-.58,-.93],[-.42,-1.18],[-.31,-.88],[-.16,-1.19],[-.06,-.86],[.10,-1.23],[.20,-.89],[.37,-1.17],[.50,-.83],[.33,-.64],[.12,-.76],[-.03,-.60],[-.17,-.78],[-.39,-.62]];
    poly(c,bangs.map(p=>[p[0]*r,p[1]*r]),'#eeeef2');
    rect(c,-r*.34,-r*1.01,r*.23,r*.08,'#fff');rect(c,r*.08,-r*1.08,r*.20,r*.07,'#fff');
    // collar and red stitches/straps
    poly(c,[[-r*.47,-r*.22],[-r*.12,-r*.38],[0,-r*.22],[-r*.24,-r*.05]],'#08080c');
    poly(c,[[r*.47,-r*.22],[r*.12,-r*.38],[0,-r*.22],[r*.24,-r*.05]],'#08080c');
    rect(c,-r*.66,-r*.24,r*.10,r*.42,'#72051e');
    c.restore();
    if(!cinematic)drawWeapon(c,r,a,q);
    return 1;
  }

  const priorHero=SPR.hero.bind(SPR);
  SPR.hero=function(c,r,a,si,q){if(si===IDX)return drawKaneki(c,r,a,q,0);return priorHero(c,r,a,si,q)};

  // New pixel-art activation cut-in rendered at low resolution and scaled with nearest-neighbour.
  const cut=document.createElement('div');cut.id='kanekiV2Cut';cut.innerHTML='<div class="kv2-noise"></div><canvas width="180" height="180"></canvas><div class="kv2-title"><b>KAGUNE</b><span>DESPERTAR</span></div>';
  document.body.appendChild(cut);const cc=cut.querySelector('canvas'),cx=cc.getContext('2d');cx.imageSmoothingEnabled=false;
  function cutFrame(){
    if(now()>=K2.cutUntil){cut.classList.remove('on');return}
    const p=clamp(1-(K2.cutUntil-now())/1250,0,1);cx.clearRect(0,0,180,180);
    const g=cx.createRadialGradient(90,92,12,90,92,100);g.addColorStop(0,'#38000e');g.addColorStop(1,'#050309');cx.fillStyle=g;cx.fillRect(0,0,180,180);
    cx.save();cx.translate(90,111);drawKaneki(cx,31,0,null,1);cx.restore();
    if(p>.35){cx.strokeStyle='rgba(255,35,74,'+Math.min(1,(p-.35)*2)+')';cx.lineWidth=2;for(let i=0;i<5;i++){cx.beginPath();cx.arc(90,100,34+i*10+(p*8),0,TAU);cx.stroke()}}
    requestAnimationFrame(cutFrame);
  }
  function showCut(){K2.cutUntil=now()+1250;cut.classList.remove('on');void cut.offsetWidth;cut.classList.add('on');cutFrame()}

  function worldCurve(cx0,cy0,ang,seed){
    const a=[],len=430;
    for(let j=0;j<=14;j++){const u=j/14,w=Math.sin(u*5+seed*1.3)*58*u;a.push([cx0+Math.cos(ang)*len*u+Math.cos(ang+Math.PI/2)*w,cy0+Math.sin(ang)*len*u+Math.sin(ang+Math.PI/2)*w])}return a;
  }
  function dseg(px,py,a,b){const vx=b[0]-a[0],vy=b[1]-a[1],wx=px-a[0],wy=py-a[1],vv=vx*vx+vy*vy,t=vv?clamp((wx*vx+wy*vy)/vv,0,1):0;return Math.hypot(px-(a[0]+vx*t),py-(a[1]+vy*t))}
  function lashWave(rot,mul){
    if(st!=='play'||!P)return;const base=P.dmg*dx,hitOnce=new Set();
    for(let i=0;i<6;i++){
      const ang=rot+i*TAU/6,pts=worldCurve(P.x,P.y,ang,i+rot*3);
      for(let j=2;j<pts.length;j+=2)FX.push({x:pts[j][0],y:pts[j][1],r:18+j*1.4,t:.24+j*.01,ring:1});
      for(const e of E){if(!e||e.dead||hitOnce.has(e))continue;for(let j=0;j<pts.length-1;j++)if(dseg(e.x,e.y,pts[j],pts[j+1])<(e.r||12)+30){hitOnce.add(e);try{hit(e,base*mul,P.x,P.y)}catch(_){e.hp-=base*mul;if(e.hp<=0)kill(e)}break}}
    }
  }
  function kaguneV2Ult(){
    if(st!=='play'||ult<100)return;
    ult=0;try{ach('e_ult')}catch(_){ }
    K2.start=now();K2.activeUntil=K2.start+2050;K2.poseUntil=K2.start+650;showCut();
    EB.length=0;fz=1.25;shake=30;flash=.9;try{ban('🩸 KAGUNE — DESPERTAR');sfx('boss2')}catch(_){ }
    const base=P.dmg*dx;
    setTimeout(()=>{if(st==='play'&&P){boom(P.x,P.y,180,base*4);shake=24}},180);
    setTimeout(()=>{lashWave(-.18,4.4);shake=22;try{sfx('boom')}catch(_){ }},420);
    setTimeout(()=>{lashWave(Math.PI/6+.16,3.8);shake=18},720);
    setTimeout(()=>{if(st==='play'&&P){boom(P.x,P.y,315,base*8);P.hp=Math.min(P.mhp,P.hp+P.mhp*.12);for(let i=0;i<5;i++)FX.push({x:P.x,y:P.y,r:100+i*55,t:.28+i*.035,ring:1});shake=34;flash=.75}},1080);
  }
  const priorUlt=fireUlt;
  fireUlt=function(){if(S.skin===IDX)return kaguneV2Ult();return priorUlt()};

  // Richer store presentation without changing purchase/save logic.
  const polish=()=>{const card=[...document.querySelectorAll('#sg .sk')].find(e=>/Kaneki\s*·\s*Ghoul/.test(e.textContent||''));if(!card)return;card.classList.add('kaneki-v2-card');const tag=card.querySelector('.kaneki-tag');if(tag)tag.textContent='SSS • 5.000.000 moedas • Kagune: Despertar'};
  setInterval(polish,500);polish();
  console.log('[Mobile] Kaneki V2 visual + Kagune polish enabled');
}catch(err){console.warn('[Mobile Kaneki V2]',err)}
})();