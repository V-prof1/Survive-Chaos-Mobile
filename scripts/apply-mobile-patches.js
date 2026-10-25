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

function replaceRequired(before, after) {
  if (!s.includes(before)) throw new Error('Mobile integration changed upstream: '+before.slice(0,80));
  s=s.replace(before,after);
}

// ===== Economy / score rebalance in the Mobile build only =====
replaceRequired("const scoreNow=()=>Math.round((kills*10+RUN.boss*500+Math.floor(T)*3)*MZ[4]);",
  "const scoreNow=()=>Math.round((kills*4+RUN.boss*750+Math.floor(T)*2)*MZ[4]);");
replaceRequired("pm=1+(S.perm&&S.perm.coin||0)*.1", "pm=1+(S.perm&&S.perm.coin||0)*.04");
replaceRequired("(kills/6+t/12+(win?400:0))", "(kills/14+t/30+(win?120:0))");
replaceRequired("(win?Math.round(2000*MZ[4]):0)", "(win?Math.round(1200*MZ[4]):0)");
replaceRequired("bonus=Math.floor(sc/80*rk[2]*pm)", "bonus=Math.floor(sc/260*rk[2]*pm)");
replaceRequired("earned+=Math.ceil(v*P.xpm*1.5);", "earned+=Math.ceil(v*P.xpm*.35);");
s=s.replace(/earned\+=25/g,'earned+=8');
replaceRequired("else{earned+=5;sfx('coin')}", "else{earned+=2;sfx('coin')}");
replaceRequired("if(e.boss){if(e.helper){earned+=60;", "if(e.boss){if(e.helper){earned+=20;");
replaceRequired("bossDown();earned+=150;", "bossDown();earned+=50;");
replaceRequired("for(let i=0;i<8;i++)G.push({x:P.x+R()*60-30,y:P.y+R()*60-30,v:1,k:2});", "for(let i=0;i<2;i++)G.push({x:P.x+R()*60-30,y:P.y+R()*60-30,v:1,k:2});");

// ===== Skin arsenal hooks: cosmetic only, never changes weapon stats =====
s=s.replace(/\bB\.push\(\{x:/g, 'B.push({sk:(P&&P.sk!=null?P.sk:S.skin),wt:CF.w,x:');
replaceRequired("for(const b of B){const bk=", "for(const b of B){if(window.SCArsenal&&SCArsenal.bullet(x,b))continue;const bk=");
replaceRequired("const a=q.oa+i/q.orb*PI*2;x.fillStyle='#d8e4ff';",
  "const a=q.oa+i/q.orb*PI*2;if(window.SCArsenal&&SCArsenal.orbital(x,q,a))continue;x.fillStyle='#d8e4ff';");

// ===== AI Director hooks =====
replaceRequired(
  "function bossAI(e,dt){if(e.dv){devAI(e,dt);return}",
  "function bossAI(e,dt){if(window.SCAIDirector&&window.SCAIDirector.boss&&window.SCAIDirector.boss(e,dt,P))return;if(e.dv){devAI(e,dt);return}"
);
replaceRequired(
  "const ddx=P.x-e.x,ddy=P.y-e.y,d=Math.hypot(ddx,ddy)||1,ux=ddx/d,uy=ddy/d;let v=e.sp*rm,ai=e.ai;",
  "const ddx=P.x-e.x,ddy=P.y-e.y,d=Math.hypot(ddx,ddy)||1,ux=ddx/d,uy=ddy/d;let v=e.sp*rm,ai=e.ai;if(window.SCAIDirector&&window.SCAIDirector.enemy&&window.SCAIDirector.enemy(e,dt,P,d,ux,uy,rm))continue;"
);

fs.writeFileSync(path, s);

// DEV used to grant 25,000 raw coins on top of the normal end-of-run economy.
const devPath='www/dev.js';
let ds=fs.readFileSync(devPath,'utf8');
if(!ds.includes('earned+=25000')) throw new Error('DEV reward signature changed upstream.');
ds=ds.replace('earned+=25000','earned+=2500');
fs.writeFileSync(devPath,ds);

for (const file of [
  'mobile-pro.js','mobile-pro.css',
  'mobile-economy.js','mobile-economy.css',
  'mobile-content.js','mobile-content.css',
  'mobile-legacy.js','mobile-legacy.css',
  'mobile-saveguard.js',
  'mobile-menu-fix.css','mobile-upgrade-icons.js',
  'mobile-admin-plus.js','mobile-admin-plus.css',
  'mobile-arsenal-skins.js','mobile-arsenal-skins.css',
  'mobile-rebalance.js','mobile-rebalance.css',
  'mobile-difficulty-plus.js',
  'mobile-hud-responsive.js','mobile-hud-responsive.css',
  'mobile-online-config.js','mobile-online.js','mobile-online-socket.js','mobile-online.css',
  'mobile-skin-ults.js','mobile-skin-ults.css',
  'mobile-menu-refine.js','mobile-menu-refine.css',
  'mobile-hud-editor.js','mobile-hud-editor.css',
  'mobile-main-menu.js','mobile-main-menu.css',
  'mobile-rotate-easteregg.js',
  'mobile-ai-director.js'
]) fs.copyFileSync(`mobile-overrides/${file}`, `www/${file}`);

const indexPath = 'www/index.html';
let html = fs.readFileSync(indexPath, 'utf8');
for (const css of [
  'mobile-pro.css','mobile-economy.css','mobile-content.css','mobile-legacy.css','mobile-menu-fix.css',
  'mobile-admin-plus.css','mobile-arsenal-skins.css','mobile-rebalance.css','mobile-hud-responsive.css','mobile-online.css','mobile-skin-ults.css','mobile-menu-refine.css','mobile-hud-editor.css','mobile-main-menu.css'
]) if (!html.includes(css)) html = html.replace('</head>', `<link rel="stylesheet" href="${css}"></head>`);
for (const js of [
  'mobile-pro.js','mobile-economy.js','mobile-content.js','mobile-legacy.js','mobile-saveguard.js','mobile-upgrade-icons.js',
  'mobile-admin-plus.js','mobile-arsenal-skins.js','mobile-rebalance.js','mobile-difficulty-plus.js','mobile-hud-responsive.js','mobile-online-config.js','mobile-online.js','mobile-online-socket.js','mobile-skin-ults.js','mobile-menu-refine.js','mobile-hud-editor.js','mobile-main-menu.js','mobile-rotate-easteregg.js','mobile-ai-director.js'
]) if (!html.includes(js)) html = html.replace('</body>', `<script src="${js}"></script></body>`);
fs.writeFileSync(indexPath, html);

console.log('Survive Chaos Mobile patch applied.');
console.log('Infinite horde formula retained with performance-aware enemy cap.');
console.log('Combat 2.0, Economy, Content Expansion, Legacy and SaveGuard retained.');
console.log('Kaneki removed from runtime; invalid Kaneki save slot is migrated/refunded once.');
console.log('Skin Arsenal enabled: every base skin themes weapons/projectiles; Golden Reaper = gold, ADMIN = glitch.');
console.log('Skin ULT v1 enabled: 21 unique animated ultimates; price scales power; ADMIN is apex.');
console.log('Rebalance 2.0 enabled: difficulty/economy/score/upgrades/biomes/modes/bosses/DEV retuned.');
console.log('Difficulty 3.0 enabled: Easy safety net, Hard elite hunters, Nightmare ruptures and stronger bosses.');
console.log('Menu refinement enabled: polished menu buttons and in-run pause settings; combat controls untouched.');
console.log('HUD Editor 2.0 enabled: independent portrait/landscape positions and sizes with safe reset.');
console.log('Main Menu 2.1 enabled: landscape-only gameplay with portrait rotation lock.');
console.log('Rotate easter egg enabled: secret IQ achievement after 60 seconds in portrait.');
console.log('AI Director 1.0 enabled: tactical enemy states, elite mini-boss mutations, boss combos and paced DEV patterns.');
console.log('DEV raw reward reduced from 25,000 to 2,500 coins.');
console.log('Responsive portrait HUD enabled: split kills/score chips and isolated combo lane.');
console.log('Online foundation enabled: account/cloud-save UI, PKCE callback and Socket.IO lobby transport are backend-disabled by default.');
console.log('Five stackable Mobile extra modes + random mode added.');
