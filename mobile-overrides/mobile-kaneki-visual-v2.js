(() => {
'use strict';
try{
  if(typeof SPR==='undefined'||typeof window.SC_KANEKI_INDEX==='undefined')return;
  const IDX=window.SC_KANEKI_INDEX,TAU=Math.PI*2;
  const prev=SPR.hero.bind(SPR);
  const now=()=>performance.now();
  const rect=(c,x,y,w,h,col)=>{c.fillStyle=col;c.fillRect(Math.round(x),Math.round(y),Math.round(w),Math.round(h))};
  const poly=(c,p,col)=>{c.fillStyle=col;c.beginPath();c.moveTo(p[0][0],p[0][1]);for(let i=1;i<p.length;i++)c.lineTo(p[i][0],p[i][1]);c.closePath();c.fill()};
  const circ=(c,x,y,r,col)=>{c.fillStyle=col;c.beginPath();c.arc(x,y,r,0,TAU);c.fill()};
  const outlineCirc=(c,x,y,r,fill,stroke='#09090d',lw=2)=>{c.fillStyle=fill;c.strokeStyle=stroke;c.lineWidth=lw;c.beginPath();c.arc(x,y,r,0,TAU);c.fill();c.stroke()};
  const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));

  function dirOf(a){
    const ca=Math.cos(a),sa=Math.sin(a);
    if(Math.abs(sa)>Math.abs(ca)*1.05)return sa>0?'down':'up';
    return ca<0?'left':'right';
  }

  function curve(r,ang,len,pow,seed){
    const pts=[],t=now()/1000;
    for(let i=0;i<=10;i++){
      const u=i/10,d=len*u*pow,w=Math.sin(u*4.8+seed*1.7+t*2.8)*r*(.10+u*.72)*pow;
      pts.push([Math.cos(ang)*d+Math.cos(ang+Math.PI/2)*w,Math.sin(ang)*d+Math.sin(ang+Math.PI/2)*w+r*.30]);
    }
    return pts;
  }
  function kaguneArm(c,pts,r,alpha=1){
    c.save();c.globalAlpha=alpha;c.lineCap='round';c.lineJoin='round';
    const layers=[['#170006',1],['#630018',.73],['#b20834',.43],['#ff315f',.16]];
    for(const [col,m] of layers){
      c.strokeStyle=col;
      for(let i=0;i<pts.length-1;i++){
        const u=i/(pts.length-1);
        c.lineWidth=Math.max(1,r*((.72*(1-u)+.09)*m));
        c.beginPath();c.moveTo(pts[i][0],pts[i][1]);c.lineTo(pts[i+1][0],pts[i+1][1]);c.stroke();
      }
    }
    const a=pts[pts.length-2],b=pts[pts.length-1],dx=b[0]-a[0],dy=b[1]-a[1],d=Math.hypot(dx,dy)||1,px=-dy/d,py=dx/d;
    poly(c,[[b[0]+dx/d*r*.48,b[1]+dy/d*r*.48],[b[0]+px*r*.17,b[1]+py*r*.17],[b[0]-px*r*.17,b[1]-py*r*.17]],'#e70b41');
    c.restore();
  }
  function kagune(c,r,active,dash){
    const count=active?6:4,p=active?1:dash?.72:.58,spin=now()*.00011;
    const anchors=count===4?[-2.55,-1.92,-1.18,-.48]:[-2.75,-2.25,-1.72,-1.16,-.62,-.10];
    for(let i=0;i<count;i++){
      const ang=anchors[i]+Math.sin(spin*6+i)*.025;
      const len=r*(active?5.7:3.7+(i%2)*.32);
      kaguneArm(c,curve(r,ang,len,p,i+1),r*.76,active?.98:.88);
    }
  }

  function hairBack(c,r,dir){
    const side=dir==='left'?-1:dir==='right'?1:0;
    outlineCirc(c,side*r*.03,-r*.89,r*.70,'#c9cad2','#0a0a0e',Math.max(1,r*.08));
    const pts=[[-.68,-.96],[-.56,-1.23],[-.41,-1.12],[-.30,-1.36],[-.12,-1.17],[.02,-1.39],[.17,-1.16],[.32,-1.34],[.44,-1.11],[.61,-1.24],[.68,-.92],[.57,-.66],[-.54,-.65]].map(p=>[(p[0]+side*.035)*r,p[1]*r]);
    poly(c,pts,'#d8d9df');
  }

  function hairFront(c,r,dir){
    if(dir==='up')return;
    const side=dir==='left'?-1:dir==='right'?1:0;
    const pts=[[-.60,-1.03],[-.47,-1.29],[-.36,-1.04],[-.22,-1.32],[-.09,-1.00],[.04,-1.31],[.16,-.98],[.31,-1.28],[.41,-1.00],[.56,-1.18],[.61,-.84],[.39,-.70],[.22,-.78],[.05,-.67],[-.10,-.79],[-.28,-.66],[-.46,-.73]].map(p=>[(p[0]+side*.045)*r,p[1]*r]);
    poly(c,pts,'#f4f4f7');
    rect(c,(-.31+side*.03)*r,-1.08*r,.17*r,.06*r,'#ffffff');
    rect(c,(.08+side*.03)*r,-1.14*r,.18*r,.055*r,'#ffffff');
  }

  function face(c,r,dir){
    if(dir==='up')return;
    const side=dir==='left'?-1:dir==='right'?1:0;
    // exposed upper face
    const eyeX=(dir==='left'?-0.19:dir==='right'?0.19:0.20)*r;
    // black sclera + red Kakugan, no vampire fangs
    circ(c,eyeX,-r*.79,r*.15,'#040407');
    circ(c,eyeX,-r*.79,r*.071,'#e51243');
    circ(c,eyeX-r*.015,-r*.815,r*.021,'#fff2f5');
    // opposite eye hidden by hair/patch shadow
    if(dir==='down'){
      poly(c,[[-r*.47,-r*.91],[-r*.05,-r*.92],[-r*.09,-r*.68],[-r*.49,-r*.66]],'#111117');
      rect(c,-r*.43,-r*.77,r*.31,r*.045,'#26262d');
    }
    // proper ghoul mask: mechanical lower-face respirator with teeth detail
    poly(c,[[-r*.52,-r*.66],[r*.52,-r*.66],[r*.47,-r*.39],[r*.23,-r*.29],[-r*.23,-r*.29],[-r*.47,-r*.39]],'#0b0b10');
    rect(c,-r*.46,-r*.57,r*.92,r*.095,'#24242b');
    rect(c,-r*.49,-r*.47,r*.10,r*.10,'#34343d');rect(c,r*.39,-r*.47,r*.10,r*.10,'#34343d');
    for(let i=-4;i<=4;i++)rect(c,i*r*.096-r*.029,-r*.555,r*.058,r*.092,i%2?'#c7c8ca':'#f2efe6');
    // red mask seam
    rect(c,side*r*.02-r*.035,-r*.42,r*.07,r*.10,'#840523');
  }

  function bodyFront(c,r,dir,q){
    const walking=(typeof mv!=='undefined'&&mv)?Math.sin((typeof tm!=='undefined'?tm:0)*14):0;
    const dash=!!(q&&q.dT>0),side=dir==='left'?-1:dir==='right'?1:0;
    const bob=dash?r*.03:0;
    c.save();c.translate(side*(dash?r*.16:0),bob);

    // short chibi legs from the approved body base
    const legY=r*.34;
    rect(c,-r*.31,legY+walking*r*.075,r*.22,r*.43,'#101015');
    rect(c,r*.09,legY-walking*r*.075,r*.22,r*.43,'#101015');
    rect(c,-r*.35,r*.68+walking*r*.075,r*.28,r*.15,'#060609');
    rect(c,r*.07,r*.68-walking*r*.075,r*.28,r*.15,'#060609');

    // compact rounded torso, not long coat/cape
    c.fillStyle='#111116';c.strokeStyle='#07070a';c.lineWidth=Math.max(1,r*.08);
    c.beginPath();c.roundRect(-r*.54,-r*.15,r*1.08,r*.68,r*.24);c.fill();c.stroke();
    c.fillStyle='#202028';c.beginPath();c.roundRect(-r*.43,-r*.10,r*.86,r*.47,r*.18);c.fill();
    rect(c,-r*.035,-r*.12,r*.07,r*.50,'#5d061a');
    rect(c,-r*.39,r*.22,r*.78,r*.07,'#09090d');

    // stubby arms following the user's body silhouette
    const pose=now()<((window.SCKaneki&&window.SCKaneki.poseUntil)||0) || (typeof K!=='undefined'&&now()<K.poseUntil);
    if(pose&&dir!=='up'){
      rect(c,-r*.67,-r*.03,r*.20,r*.43,'#131319');
      rect(c,r*.45,-r*.25,r*.20,r*.39,'#131319');
      rect(c,r*.42,-r*.48,r*.19,r*.29,'#dbc9c3');
      rect(c,r*.23,-r*.61,r*.085,r*.29,'#e9d9d4');
      rect(c,r*.34,-r*.64,r*.08,r*.31,'#e9d9d4');
    }else{
      rect(c,-r*.66,-r*.02,r*.20,r*.43,'#131319');
      rect(c,r*.46,-r*.02,r*.20,r*.43,'#131319');
      rect(c,-r*.64,r*.31,r*.17,r*.13,'#d8c6bf');
      rect(c,r*.47,r*.31,r*.17,r*.13,'#d8c6bf');
    }

    // large rounded head matching the approved redesign/base
    outlineCirc(c,0,-r*.79,r*.66,'#d9c5be','#08080c',Math.max(1,r*.085));
    face(c,r,dir);
    hairBack(c,r,dir);
    hairFront(c,r,dir);

    // tall black collar characteristic of Kaneki
    poly(c,[[-r*.42,-r*.24],[-r*.12,-r*.40],[0,-r*.25],[-r*.22,-r*.10]],'#08080c');
    poly(c,[[r*.42,-r*.24],[r*.12,-r*.40],[0,-r*.25],[r*.22,-r*.10]],'#08080c');

    if(dir==='up'){
      rect(c,-r*.39,-r*.20,r*.78,r*.13,'#08080c');
      rect(c,-r*.045,-r*.18,r*.09,r*.37,'#5d061a');
    }
    c.restore();
  }

  function draw(c,r,a,q){
    const dir=dirOf(a),active=window.SCKanekiState&&now()<window.SCKanekiState.activeUntil,dash=!!(q&&q.dT>0);
    c.save();
    // The approved concept always shows the Rinkaku silhouette; ULT expands it.
    kagune(c,r,active,dash);
    bodyFront(c,r,dir,q);
    c.restore();
    return 1;
  }

  SPR.hero=function(c,r,a,si,q){
    if(si===IDX)return draw(c,r,a,q);
    return prev(c,r,a,si,q);
  };
  window.SCKanekiVisualV2={index:IDX,draw};
  console.log('[Mobile] Kaneki Visual V2 enabled: approved chibi silhouette, white hair, ghoul mask and persistent Rinkaku.');
}catch(err){console.warn('[Kaneki Visual V2]',err)}
})();