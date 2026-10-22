const fs = require('fs');
const path = 'www/game.js';
let s = fs.readFileSync(path, 'utf8');

const oldSpawn = `function spawn(k,px,py,el){const d=EN[k],m=T/60;if(E.length>300)return;const e={k,x:px,y:py,vx:0,vy:0,hp:d[1]*(1+m*.22)*HM()*(el?5:1),r:d[3]*(el?1.4:1),sp:d[2],dmg:d[4]*(1+m*.04),xp:d[5]*(el?5:1),col:d[6],ai:d[9],el,t1:R()*2,t2:0,oc:0,fl:0};e.mh=e.hp;E.push(e);return e}`;

const newSpawn = `let INF_LAST_MIN=0;
function mobileEnemyCap(){
  if(!CF.i)return 300;
  const m=Math.max(0,Math.floor(T/60));
  const raw=Math.floor(300*Math.pow(1.13,m));
  const perf=fps<28?.48:fps<36?.62:fps<45?.78:fps<54?.9:1;
  return Math.max(300,Math.min(1200,Math.floor(raw*perf)));
}
function spawn(k,px,py,el){const d=EN[k],m=T/60;if(E.length>=mobileEnemyCap())return;const e={k,x:px,y:py,vx:0,vy:0,hp:d[1]*(1+m*.22)*HM()*(el?5:1),r:d[3]*(el?1.4:1),sp:d[2],dmg:d[4]*(1+m*.04),xp:d[5]*(el?5:1),col:d[6],ai:d[9],el,t1:R()*2,t2:0,oc:0,fl:0};e.mh=e.hp;E.push(e);return e}`;

if (!s.includes(oldSpawn)) throw new Error('Mobile patch failed: spawn() signature changed upstream.');
s = s.replace(oldSpawn, newSpawn);

const oldLoop = `if(silence<=0&&CF.g!=2){bk-=dt;const gap=Math.max(.1,.85-T/60*.035)/(horde>0?3:1)/MZ[3]*(CF.g==5?3:1)/(CF.g==3?1.5:1)/(PL.length>1?1.5:1);if(bk<=0){bk=gap;const[a,b]=edge();spawn(pick(),a,b,T>180&&R()<.03)}}`;

const newLoop = `if(silence<=0&&CF.g!=2){
  bk-=dt;
  const im=Math.max(0,Math.floor(T/60));
  if(!CF.i)INF_LAST_MIN=0;
  else if(im===0)INF_LAST_MIN=0;
  const infRate=CF.i?Math.pow(1.09,im):1;
  const baseGap=Math.max(.1,.85-T/60*.035)/(horde>0?3:1)/MZ[3]*(CF.g==5?3:1)/(CF.g==3?1.5:1)/(PL.length>1?1.5:1);
  const gap=baseGap/Math.min(2.75,Math.pow(infRate,.55));
  if(bk<=0){
    bk=gap;
    const batch=CF.i?Math.max(1,Math.min(8,Math.floor(infRate+.35))):1;
    for(let si=0;si<batch;si++){const[a,b]=edge();spawn(pick(),a,b,T>180&&R()<.03)}
  }
  if(CF.i&&im>0&&im!==INF_LAST_MIN){
    INF_LAST_MIN=im;
    const wanted=Math.max(1,Math.round(16*Math.pow(1.24,im-1)));
    const room=Math.max(0,mobileEnemyCap()-E.length);
    const wave=Math.min(wanted,room);
    if(wave>0){ring(wave);ban('HORDA INFINITA: '+wave+' INIMIGOS — MINUTO '+im);shake=Math.min(18,6+im*.45)}
  }
}`;

if (!s.includes(oldLoop)) throw new Error('Mobile patch failed: main spawn loop changed upstream.');
s = s.replace(oldLoop, newLoop);

const oldIntro = `Modo infinito: a partida não termina, os bosses se repetem e o bioma muda a cada vitória.`;
const newIntro = `Modo infinito: a partida não termina, os bosses se repetem, o bioma muda a cada vitória e as hordas crescem exponencialmente a cada minuto.`;
if (s.includes(oldIntro)) s = s.replace(oldIntro, newIntro);

fs.writeFileSync(path, s);

for (const file of ['mobile-pro.js', 'mobile-pro.css']) {
  fs.copyFileSync(`mobile-overrides/${file}`, `www/${file}`);
}

const indexPath = 'www/index.html';
let html = fs.readFileSync(indexPath, 'utf8');
if (!html.includes('mobile-pro.css')) {
  html = html.replace('</head>', '<link rel="stylesheet" href="mobile-pro.css"></head>');
}
if (!html.includes('mobile-pro.js')) {
  html = html.replace('</body>', '<script src="mobile-pro.js"></script></body>');
}
fs.writeFileSync(indexPath, html);

console.log('Survive Chaos Mobile patch applied.');
console.log('Infinite horde formula: 16 × 1.24^(minute-1), plus exponential normal spawn pressure.');
console.log('Combat 2.0 enabled: Flow rewards, Near Miss, Perfect Dash, boss phases and Chaos Director.');
