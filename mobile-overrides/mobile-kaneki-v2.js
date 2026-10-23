/* Kaneki V2 visual rework: native pixel grid, bounded Canvas geometry, no gameplay timers. */
(() => {
'use strict';
const IDX=window.SC_KANEKI_INDEX,TAU=Math.PI*2;
const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
const active=q=>!!q&&(q.sk==null?S.skin:q.sk)===IDX;
const K={age:-1,owner:null,wave:0,clock:0,shot:0,weapon:0,angle:0,hitstop:0};
// Reused typed buffers: 17 center samples + left/right tapered silhouette.
const N=17,px=new Float32Array(N),py=new Float32Array(N),nx=new Float32Array(N),ny=new Float32Array(N),width=new Float32Array(N);
function rect(c,x,y,w,h,col){c.fillStyle=col;c.fillRect(x,y,w,h)}
function polygon(c,col,coords){c.fillStyle=col;c.beginPath();c.moveTo(coords[0],coords[1]);for(let i=2;i<coords.length;i+=2)c.lineTo(coords[i],coords[i+1]);c.closePath();c.fill()}
// Same directional thresholds and mirroring as the original SPR.hero.
function facing(a){const ca=Math.cos(a),sa=Math.sin(a);return {direction:Math.abs(sa)>Math.abs(ca)*1.1?(sa>0?'down':'up'):'side',flip:Math.abs(sa)<=Math.abs(ca)*1.1&&ca<0}}
function frameState(a,q,cinema){
 const f=cinema?{direction:'down',flip:false}:facing(a);
 const pose=cinema||(q===K.owner&&K.age>=0&&K.age<.75);
 const mode=pose?'pose':q&&q.dT>0?'dash':mv?'walk':'idle';
 const count=mode==='dash'?3:mode==='walk'?6:4;
 const frame=mode==='pose'?0:mode==='dash'?Math.min(2,Math.max(0,Math.floor((1-q.dT/.18)*3))):Math.floor(Math.max(0,tm)*(mode==='walk'?12:6))%count;
 return {...f,mode,frame,pose:pose?(K.age>.36?2:1):0};
}
const atlas={};
function body(direction,frame,pose,mode='idle'){
 const key=direction+':'+mode+':'+frame+':'+pose;if(atlas[key])return atlas[key];
 const cv=document.createElement('canvas');cv.width=cv.height=96;const c=cv.getContext('2d');c.scale(3,3);
 const side=direction==='side',back=direction==='up',walk=mode==='walk',dash=mode==='dash';
 const stride=walk?[0,1,1,0,-1,-1][frame]:0,breath=mode==='idle'&&frame===2?1:0;
 const ink='#0d0d18',black='#15151f',coat='#24232e',edge='#3a3946',wine='#592334',skin='#d9cacc';
 // The feet retain the base anchor. Profile has two genuinely overlapping legs.
 if(side){
  rect(c,13-stride,24,4,5,ink);rect(c,12-stride,28,6,2,ink);
  rect(c,14-stride,25,2,3,coat);rect(c,13-stride,28,4,1,'#45414c');
  rect(c,17+stride,24,4,5,black);rect(c,17+stride,28,6,2,ink);
  rect(c,18+stride,25,2,3,edge);rect(c,18+stride,28,4,1,'#68606a');
 }else{
  rect(c,11,24,5,5-(stride>0?1:0),ink);rect(c,17,24,5,5-(stride<0?1:0),ink);
  rect(c,12,24,3,3,coat);rect(c,18,24,3,3,black);
  rect(c,10,28-(stride>0?1:0),6,2,ink);rect(c,17,28-(stride<0?1:0),6,2,ink);
  rect(c,11,28-(stride>0?1:0),4,1,'#46414b');rect(c,18,28-(stride<0?1:0),4,1,'#514952');
 }
 // Coats are drawn separately for front, profile and back; no frontal art is squashed sideways.
 if(side){
  polygon(c,ink,[13,16,20,16,22,19,21,24,19,26,13,25,12,22]);
  polygon(c,black,[14,17,19,17,20,23,18,25,14,24]);
  rect(c,14,18,2,5,coat);rect(c,19,19,1,4,edge);rect(c,13,24,5,1,wine);
  rect(c,13,22,7,1,ink);rect(c,18,22,2,1,'#8b747b');
  // Far sleeve first, near sleeve follows the walk cycle independently.
  rect(c,12-stride,17+breath,3,7,ink);rect(c,13-stride,18+breath,1,4,coat);
  rect(c,19+stride,17+breath,4,7,ink);rect(c,20+stride,18+breath,2,4,coat);
  rect(c,20+stride,21+breath,2,1,wine);rect(c,20+stride,24+breath,2,1,'#9d8c98');
  rect(c,15,15,5,2,ink);rect(c,18,15,2,1,skin);
 }else{
  polygon(c,ink,[10,16,22,16,24,24,21,26,18,26,16,24,14,26,10,26,8,24]);
  polygon(c,black,[11,17,21,17,22,24,19,25,16,23,13,25,10,24]);
  rect(c,11,18,2,5,coat);rect(c,20,18,1,5,edge);
  rect(c,15,18,1,6,back?ink:'#70636e');rect(c,16,18,1,6,ink);
  rect(c,10,24,4,1,wine);rect(c,19,24,3,1,wine);rect(c,11,22,10,1,ink);
  if(back){rect(c,12,17,9,1,edge);rect(c,14,23,5,2,'#4f1c30');rect(c,16,18,1,5,'#45404c')}
  else{polygon(c,'#34323d',[12,17,15,16,16,18,14,20]);polygon(c,ink,[20,17,17,16,16,18,18,20]);rect(c,15,22,2,1,'#8b747b')}
  rect(c,7,17+stride+breath,4,7,ink);rect(c,22,17-stride+breath,4,7,ink);
  rect(c,8,18+stride+breath,2,4,coat);rect(c,23,18-stride+breath,2,4,coat);
  rect(c,8,21+stride+breath,2,1,wine);rect(c,23,21-stride+breath,2,1,wine);
  rect(c,8,24+stride+breath,2,1,'#9d8c98');rect(c,23,24-stride+breath,2,1,'#9d8c98');
  rect(c,13,15,7,2,ink);rect(c,15,15,3,1,back?black:skin);
 }
 // Keep head at the base skin height. Head, fringe, ear, nose and mask differ by view.
 c.save();c.translate(dash&&side?frame:0,breath+(dash&&frame===1?1:0));
 if(side){
  // True right-facing silhouette: rear skull on left, one eye, protruding nose and pointed jaw on right.
  polygon(c,ink,[11,5,16,3,21,4,23,6,23,9,25,11,24,12,23,12,23,14,20,16,14,15,11,12,10,8]);
  polygon(c,'#ab9ca8',[15,7,21,7,22,9,22,10,24,11,22,12,22,14,20,15,15,13]);
  polygon(c,skin,[17,8,21,8,22,10,24,11,22,11,22,13,20,14,17,12]);
  rect(c,13,10,3,3,'#b4a3ad');rect(c,14,11,1,1,'#786877');
  polygon(c,'#080912',[19,9,23,9,22,11,19,11]);
  rect(c,21,9,1,2,'#d31d42');rect(c,21,9,1,1,'#ff6679');
  rect(c,20,8,3,1,'#65505f');
  // Mask hugs the profile jaw; a short zipper plate replaces a frontal grinning mouth.
  polygon(c,'#10101a',[16,12,20,12,24,11,23,14,20,16,16,14]);
  rect(c,17,12,6,1,'#4e4756');rect(c,18,13,5,1,'#a0a2af');
  rect(c,19,13,1,1,'#e5e5e4');rect(c,21,13,1,1,'#e5e5e4');
  rect(c,16,12,1,2,'#746471');rect(c,14,12,2,1,ink);
  polygon(c,'#686e81',[10,7,11,4,14,4,16,3,19,3,22,4,23,6,23,9,21,8,20,10,18,8,16,11,13,10,12,12,11,10]);
  polygon(c,'#a9b3c4',[11,7,12,4,15,5,17,3,20,4,22,5,22,7,20,7,19,9,17,7,15,10,14,8,12,10]);
  polygon(c,'#e2e9ed',[12,6,13,4,15,5,17,4,20,5,21,6,19,6,18,8,17,6,15,8,14,7,12,9]);
  rect(c,15,4,2,1,'#ffffff');rect(c,19,5,2,1,'#ffffff');rect(c,11,8,1,2,'#c2cad7');
 }else if(back){
  polygon(c,ink,[10,5,13,3,21,3,24,6,24,11,22,14,19,16,13,15,10,12,9,8]);
  // Back is all layered hair and nape: never draw eyes, mask or teeth through the head.
  polygon(c,'#687083',[10,7,11,4,14,4,16,3,19,4,22,3,23,6,24,8,23,12,21,14,19,14,18,16,16,14,13,15,12,12,10,12]);
  polygon(c,'#a5b1c3',[11,7,12,4,15,5,17,3,19,5,21,4,23,7,22,11,20,10,20,13,18,12,17,14,15,12,13,13,12,10,11,11]);
  polygon(c,'#dbe3e9',[12,6,13,4,15,5,17,4,19,5,21,5,22,7,20,9,19,7,17,10,16,7,14,10,13,8,12,10]);
  rect(c,14,5,2,1,'#ffffff');rect(c,18,5,2,1,'#f2f7f5');rect(c,14,14,5,1,'#423643');
 }else{
  polygon(c,ink,[10,6,12,4,21,4,23,7,24,11,22,14,19,16,13,16,10,13,9,9]);
  rect(c,10,10,2,3,'#a798a5');rect(c,22,10,2,3,'#a798a5');
  polygon(c,skin,[12,7,21,7,22,10,22,13,20,15,13,15,11,12,11,9]);
  rect(c,12,9,9,1,'#b2a2ae');
  rect(c,12,10,3,1,'#4f4558');rect(c,13,10,1,1,'#b8b5c3');
  polygon(c,'#080912',[17,9,22,9,21,11,17,11]);rect(c,19,9,1,2,'#d31d42');rect(c,19,9,1,1,'#ff6679');
  rect(c,20,8,2,1,'#65505f');
  polygon(c,'#10101a',[11,12,16,12,22,11,21,14,19,16,14,16,11,14]);
  rect(c,12,12,9,1,'#474451');rect(c,13,13,7,1,'#a0a2af');
  for(let i=0;i<3;i++)rect(c,14+i*2,13,1,1,'#e5e5e4');
  rect(c,12,13,1,2,'#746471');rect(c,21,12,1,2,'#746471');
  polygon(c,'#686e81',[9,8,10,5,12,4,14,3,17,4,19,3,22,4,23,6,24,8,23,10,21,9,20,7,18,9,16,8,14,12,12,10,10,12]);
  polygon(c,'#a9b3c4',[10,8,11,5,13,5,15,3,17,5,19,4,21,5,23,7,21,7,20,9,18,7,16,9,15,7,13,11,12,8,10,10]);
  polygon(c,'#e2e9ed',[11,6,12,5,14,5,15,4,17,5,19,5,21,6,22,7,20,7,19,8,18,6,16,7,15,6,14,9,13,7,11,9]);
  rect(c,13,5,2,1,'#ffffff');rect(c,17,5,2,1,'#ffffff');
 }
 if(mode==='idle'&&frame===3)rect(c,side?12:11,7,1,1,'#e8edf1');
 c.restore();
 if(pose&&!back){
  rect(c,side?13:8,19,side?5:7,3,coat);rect(c,19,17,4,3,coat);
  rect(c,15,18,4,3,skin);rect(c,18,15,2,5,skin);
  rect(c,pose===2?16:17,pose===2?16:15,pose===2?2:1,pose===2?1:3,'#efe1dc');
  rect(c,16,18,4,1,'#897580');rect(c,17,20,2,1,'#897580');
 }
 atlas[key]=cv;return cv;
}
// Finite original-style cycles: 4 idle, 6 walk and 3 dash frames per direction, plus ULT poses.
for(const d of ['down','up','side']){
 for(const [mode,count] of [['idle',4],['walk',6],['dash',3]])for(let f=0;f<count;f++)body(d,f,0,mode);
 for(const p of [1,2])body(d,0,p,'pose');
}
function fillRibbon(c,col,factor,offset){
 c.fillStyle=col;c.beginPath();
 for(let i=0;i<N;i++){const w=width[i]*factor+offset,X=Math.round(px[i]+nx[i]*w),Y=Math.round(py[i]+ny[i]*w);if(!i)c.moveTo(X,Y);else c.lineTo(X,Y)}
 for(let i=N-1;i>=0;i--){const w=width[i]*factor-offset;c.lineTo(Math.round(px[i]-nx[i]*w),Math.round(py[i]-ny[i]*w))}c.closePath();c.fill();
}
function tentacle(c,angle,length,thick,seed,time,bend,geometryOnly){
 const ca=Math.cos(angle),sa=Math.sin(angle);
 for(let i=0;i<N;i++){
  const u=i/(N-1),sway=Math.sin(u*5.4+seed+time*(.9+seed*.035))*length*.19*u+Math.sin(u*Math.PI)*length*bend;
  px[i]=ca*length*u-sa*sway;py[i]=sa*length*u+ca*sway;
  width[i]=thick*Math.pow(1-u,.92)*(1+.12*Math.sin(u*26+seed));
 }
 for(let i=0;i<N;i++){const j=Math.max(0,i-1),k=Math.min(N-1,i+1),dx=px[k]-px[j],dy=py[k]-py[j],h=Math.hypot(dx,dy)||1;nx[i]=-dy/h;ny[i]=dx/h}
 if(geometryOnly)return;
 fillRibbon(c,'#210d1b',1,0);fillRibbon(c,'#67152d',.77,-thick*.06);fillRibbon(c,'#b72645',.40,-thick*.12);
 // Asymmetric muscle plates. A few broad highlights remain readable at gameplay scale.
 c.strokeStyle='#e14b5d';c.lineWidth=Math.max(.7,thick*.15);c.beginPath();
 for(let i=2;i<N-2;i+=3){c.moveTo(px[i]-nx[i]*width[i]*.4,py[i]-ny[i]*width[i]*.4);c.lineTo(px[i+1]-nx[i+1]*width[i+1]*.32,py[i+1]-ny[i+1]*width[i+1]*.32)}c.stroke();
 c.strokeStyle='#3e1025';c.lineWidth=Math.max(.8,thick*.19);c.beginPath();
 for(let i=3;i<N-2;i+=3){c.moveTo(px[i]+nx[i]*width[i]*.8,py[i]+ny[i]*width[i]*.8);c.lineTo(px[i+1]-nx[i+1]*width[i+1]*.48,py[i+1]-ny[i+1]*width[i+1]*.48)}c.stroke();
}
function hero(c,r,a,q,cinema){
 const view=frameState(a,q,cinema),{direction,flip,mode,frame}=view;
 const t=tm||0,move=mode==='walk';
 const own=q&&K.owner===q,age=own?K.age:-1,pose=cinema||(age>=0&&age<.75);
 const growth=age<0?0:age<.7?clamp((age-.4)/.3,0,1):age<2.4?1:clamp((3.4-age),0,1);
 const shot=own?K.shot:0,w=q?CF.w:0,preview=!q&&!cinema;
 const charge=w===3&&q?clamp(1-q.cd/Math.max(.01,q.rate),0,1):0;
 c.save();c.translate(0,r*.10); // roots below waist, not shoulders
 const trail=q?clamp((q.ddx||0)*.24,-.24,.24):0;
 for(let i=0;i<(growth>.3?6:4);i++){
   const ang=[-2.2,-.94,-3.35,.18,-1.5,1.5][i]+Math.sin(t*.8+i)*.09-trail;
   const hitArm=shot>0&&(w===1||i===((K.weapon+1)%4));
   const attack=hitArm?Math.sin(clamp(shot/.24,0,1)*Math.PI):0;
   tentacle(c,hitArm?a+(i-1.5)*(w===1?.32:.07):ang,r*(preview?2.05:3.0)*(1+growth*2.7+attack*(w===2?1.7:1.05))*(w===3&&!hitArm?1-charge*.18:1),r*(.32+growth*.12),i+1,t,.18*(i%2?1:-1)-trail);
 }
 if(w===4&&q)for(let i=0;i<3;i++){const an=t*1.5+i*TAU/3;c.save();c.translate(Math.cos(an)*r*2.5,Math.sin(an)*r*1.4-r*.4);c.rotate(an+.7);shard(c,4,0,false);c.restore()}
 c.restore();
 const scale=r*4.2/96,gy=r*.9,bob=move?Math.abs(Math.sin(t*12))*r*.035:Math.sin(t*2)*r*.014;
 c.save();c.translate(0,bob);if(flip)c.scale(-1,1);
 // Subtle attack squash uses feet as pivot.
 if(shot>0)c.transform(1,0,0,1-Math.sin(shot/.24*Math.PI)*.025,0,0);
 c.drawImage(body(direction,frame,view.pose,mode),-48*scale,gy-87*scale,96*scale,96*scale);
 // Kakugan ignition, single pixel pulse instead of an oversized glow.
 if(!cinema&&age>=.38&&age<.7&&direction!=='up')rect(c,(direction==='side'?15:9)*scale,gy-60*scale,3*scale,3*scale,'#ff7889');
 c.restore();return 1;
}
const originalHero=SPR.hero.bind(SPR);
SPR.hero=function(c,r,a,si,q){return si===IDX?hero(c,r,a,q,false):originalHero(c,r,a,si,q)};
function shard(c,w,t,crit){
 const col=crit?'#f68c9d':'#d64259';
 if(w===0){polygon(c,'#491326',[-8,0,-3,-3,7,0,-3,2]);polygon(c,col,[-4,-1,7,0,-3,0])}
 else if(w===1){polygon(c,'#57162c',[-6,3,-3,-3,5,-2,2,1,-1,4]);polygon(c,col,[-3,-2,5,-2,0,1])}
 else if(w===2){polygon(c,'#58172c',[-13,0,-5,-2,13,0,-5,2]);polygon(c,col,[-7,-1,13,0,-4,0])}
 else if(w===3){polygon(c,'#320d21',[-16,1,-8,-5,4,-3,17,0,0,5,-8,4]);polygon(c,'#90233d',[-13,1,-5,-3,17,0,-1,3]);polygon(c,col,[-5,-2,17,0,0,0]);rect(c,-7,0,2,2,'#e36a79')}
 else {c.rotate(Math.sin(t*5)*.25);polygon(c,'#421126',[-8,1,-4,-5,3,-3,7,0,1,5,-5,4]);polygon(c,col,[-4,-3,2,-2,6,0,0,1,-3,3]);rect(c,-1,-1,2,2,'#ef8a93')}
}
function bullet(c,b){
 if(b.kg==null)return false;
 c.save();c.translate(b.x,b.y);c.rotate(Math.atan2(b.vy,b.vx));
 // Two batched strokes, no particle objects or gradients per bullet.
 c.strokeStyle='#731b3c80';c.lineWidth=b.kg===3?3:1.5;c.beginPath();c.moveTo(-7,0);c.lineTo(b.kg===2?-24:-17,Math.sin(K.clock*13+b.x)*1.2);c.stroke();
 shard(c,b.kg,K.clock,b.c);c.restore();return true;
}
function shot(q){if(!active(q))return;K.owner=K.age>=0?K.owner:q;K.shot=.24;K.weapon=CF.w;K.angle=q.a}
function dist(x,y,ax,ay,bx,by){const vx=bx-ax,vy=by-ay,u=clamp(((x-ax)*vx+(y-ay)*vy)/(vx*vx+vy*vy||1),0,1);return Math.hypot(x-ax-u*vx,y-ay-u*vy)}
const rotations=[0,Math.PI/4,Math.PI*.75,0];
function lashes(stage){
 const q=K.owner;if(!q)return;
 const count=stage===2?6:stage===3?8:2,rot=rotations[stage],damage=q.dmg*dx*(stage===3?6:2.7);
 const already=new Set();
 // Damage follows the exact same sampled ribbons drawn by world(), once per enemy per wave.
 for(let i=0;i<count;i++){
  tentacle(x,rot+i*TAU/count,stage===3?310:420,22,i+stage,stage*.24,.25*(i%2?1:-1),true);
  for(const e of E){if(e.dead||already.has(e))continue;for(let j=1;j<N;j++)if(dist(e.x-q.x,e.y-q.y,px[j-1],py[j-1],px[j],py[j])<e.r+width[j]+8){already.add(e);hit(e,damage,q.x,q.y);break}}
 }
 if(stage===3){q.hp=Math.min(q.mhp,q.hp+q.mhp*.12);flash=.45;shake=20}else shake=12;
 K.hitstop=.035;sfx(stage===3?'boss2':'boom');
}
function cancel(){K.age=-1;K.owner=null;K.wave=0;K.shot=0;K.hitstop=0}
function step(dt){
 K.clock+=dt;K.shot=Math.max(0,K.shot-dt);
 if(K.age<0)return 1;
 if(!K.owner||K.owner.dead||!PL.includes(K.owner)||!active(K.owner)){cancel();return 1}
 K.age+=dt;
 const schedule=[.85,1.15,1.48,1.96];
 while(K.wave<4&&K.age>=schedule[K.wave])lashes(K.wave++);
 if(K.age>3.4){cancel();return 1}
 if(K.hitstop>0){K.hitstop-=dt;return .08}
 return K.age<.22?.12:K.age<.68?.4:1;
}
const baseUpd=upd;
upd=function(dt){const factor=step(dt);return baseUpd(dt*factor)};
const baseStart=start;start=function(){cancel();return baseStart.apply(this,arguments)};
const baseUlt=fireUlt;
fireUlt=function(){
 if(!active(P))return baseUlt.apply(this,arguments);
 if(st!=='play'||P.dead||ult<100||K.age>=0)return;
 ult=0;ach('e_ult');K.age=0;K.wave=0;K.owner=P;EB.length=0;flash=.28;shake=7;sfx('boss2');
};
function world(c){
 if(K.age<.68||!K.owner)return;
 const t=K.age,q=K.owner;c.save();c.translate(q.x,q.y);
 const stage=Math.max(0,K.wave-1),since=t-[.85,1.15,1.48,1.96][stage];
 if(since>=0&&since<.28){
  const count=stage===2?6:stage===3?8:2;c.globalAlpha=clamp(1-since/.28,0,1);
  const grow=Math.min(1,since/.055+.35);
  for(let i=0;i<count;i++)tentacle(c,rotations[stage]+i*TAU/count, (stage===3?310:420)*grow,22,i+stage,stage*.24,.25*(i%2?1:-1));
 }
 c.restore();
}
function orbital(c,q,a){if(!active(q))return false;c.save();c.translate(q.x+Math.cos(a)*(52+(q.orr||0)),q.y+Math.sin(a)*(52+(q.orr||0)));c.rotate(a+Math.PI/2);shard(c,4,K.clock,false);c.restore();return true}
const cutCanvas=document.createElement('canvas');cutCanvas.width=cutCanvas.height=180;const cc=cutCanvas.getContext('2d');cc.imageSmoothingEnabled=false;
function screen(c){
 if(K.age<0)return;
 const age=K.age;
 if(age<.78){
  c.save();c.fillStyle=age<.18?'rgba(12,3,12,.65)':'rgba(12,3,12,.87)';c.fillRect(0,0,W,H);
  cc.clearRect(0,0,180,180);cc.save();cc.translate(90,123);hero(cc,27,.6,null,true);cc.restore();
  if(age>.38){rect(cc,100,77,2,2,'#ff4b68');rect(cc,98,78,7,1,'#9c263d')}
  const size=Math.min(W*.88,H*.78,400),xx=(W-size)/2,yy=(H-size)/2-12;
  c.imageSmoothingEnabled=false;c.drawImage(cutCanvas,xx,yy,size,size);
  c.textAlign='center';c.fillStyle='#f34c69';c.font='900 '+Math.min(38,W*.09)+'px system-ui';c.fillText('KAGUNE',W/2,H*.83);
  c.fillStyle='#eee3e7';c.font='700 14px system-ui';c.fillText('DESPERTAR',W/2,H*.83+23);c.restore();
 }
}
// Duck both music and effects, then restore through normal audio mixing; no extra timers.
if(typeof AUD!=='undefined'){
 const tick=AUD.tick.bind(AUD);AUD.tick=function(){tick();const duck=K.age>=0&&K.age<.68?.28:1;
 for(const n in AUD.els){const a=AUD.els[n];if(duck<1)a.volume=Math.min(a.volume,(AUD.vol[n]||.5)*duck)}
 if(typeof GS!=='undefined'&&GS&&typeof AC!=='undefined'&&AC)GS.gain.setTargetAtTime(S.mute?0:.6*duck,AC.currentTime,.045);
 };
}
window.SCGhoul={active,shot,bullet,world,screen,orbital,hero,step,cancel,state:K,atlas,facing,frameState};
console.log('[Mobile] Kaneki V2 visual rework: shared proportions, organic arms, five weapon forms');
})();
