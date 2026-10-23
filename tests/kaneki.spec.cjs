/* Run against the assembled www tree: node tests/kaneki.spec.cjs. */
const {chromium}=require('playwright');
const assert=require('node:assert/strict'),fs=require('node:fs'),http=require('node:http'),path=require('node:path');
const root=path.resolve(__dirname,'../www'),out=path.resolve(__dirname,'../output/qa');fs.mkdirSync(out,{recursive:true});
const mime={'.js':'text/javascript','.html':'text/html','.css':'text/css','.png':'image/png','.mp3':'audio/mpeg'};
const server=http.createServer((req,res)=>{let file=path.join(root,decodeURIComponent(req.url.split('?')[0]));if(req.url==='/')file=path.join(root,'index.html');if(!file.startsWith(root+path.sep)){res.writeHead(403);return res.end()}fs.readFile(file,(e,data)=>{res.writeHead(e?404:200,{'Content-Type':mime[path.extname(file)]||'application/octet-stream'});res.end(e?'':data)})});
(async()=>{
 await new Promise(r=>server.listen(0,'127.0.0.1',r));const url='http://127.0.0.1:'+server.address().port;
 const browser=await chromium.launch({headless:true,...(process.env.CHROMIUM_PATH?{executablePath:process.env.CHROMIUM_PATH,args:['--no-sandbox','--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader']}: {})});
 console.log('Chromium launched');const errors=[],report={};const page=await browser.newPage({viewport:{width:390,height:844},deviceScaleFactor:1,isMobile:true,hasTouch:true});
 page.on('pageerror',e=>{errors.push(e.message);console.error('PAGE ERROR',e.message)});page.on('console',m=>{if(m.type()==='warning')console.error(m.text())});page.setDefaultTimeout(10000);
 await page.addInitScript(()=>{window.requestAnimationFrame=()=>0;if(!localStorage.getItem('nsf'))localStorage.setItem('nsf',JSON.stringify({coins:12345678,skin:21,own:[0,5,21],best:777,customPreserved:{hello:42},mute:true}))});
 await page.route('**/*',route=>route.request().url().startsWith(url)?route.continue():route.abort());await page.goto(url,{waitUntil:'domcontentloaded'});console.log('Game loaded');await page.waitForFunction(()=>window.SCGhoul,null,{polling:100});await page.evaluate(()=>{for(const i of [0,5,6,9])SPR.sheet('hero_'+i)});await page.waitForFunction(()=>[0,5,6,9].every(i=>SPR.S['hero_'+i]?.ok),null,{polling:100});
 console.log('Renderers ready');report.legacy=await page.evaluate(()=>({idx:SC_KANEKI_INDEX,own:S.own,skin:S.skin,best:S.best,extra:S.customPreserved}));
 assert.equal(report.legacy.idx,21);assert.ok(report.legacy.own.includes(21));assert.equal(report.legacy.best,777);assert.deepEqual(report.legacy.extra,{hello:42});
 console.log('Legacy checked');const shop=await page.evaluate(()=>{S.own=[0];S.skin=0;S.coins=5000000;shopUI();const card=[...document.querySelectorAll('#sg .sk')].find(c=>c.textContent.includes('Kaneki · Ghoul'));const desc=card.textContent;card.querySelector('button').click();const bought={coins:S.coins,own:S.own.slice(),skin:S.skin};shopUI();[...document.querySelectorAll('#sg .sk')].find(c=>c.textContent.includes('Kaneki · Ghoul')).querySelector('button').click();return {desc,bought,again:S.coins}});
 assert.match(shop.desc,/Kagune exclusiva/);assert.equal(shop.bought.coins,0);assert.equal(shop.bought.skin,21);assert.equal(shop.bought.own.filter(n=>n===21).length,1);assert.equal(shop.again,0);report.purchase=shop;
 await page.evaluate(()=>{st='shop';sv()});await page.waitForTimeout(750);
 assert.equal(await page.evaluate(()=>JSON.parse(localStorage.getItem('nsf')).skin),21);
 report.admin=await page.evaluate(()=>{S.coins=0;const input=document.querySelector('#admcpValue'),give=document.querySelector('#admcpGive');const invalid=['','NaN','Infinity','-1','1.5','123abc','1e6','9007199254740992'];const result=[];for(const value of invalid){input.value=value;give.click();result.push(S.coins)}input.value='8735421';give.click();const custom=S.coins;S.coins=Number.MAX_SAFE_INTEGER-2;input.value='3';give.click();const overflow=S.coins;S.coins=123;sv();return {invalid:result,custom,overflow,presets:[...document.querySelectorAll('#admCoinsPlus [data-v]')].map(b=>+b.dataset.v)}});
 assert.deepEqual(report.admin.invalid,Array(8).fill(0));assert.equal(report.admin.custom,8735421);assert.equal(report.admin.overflow,Number.MAX_SAFE_INTEGER-2);assert.deepEqual(report.admin.presets,[1000,10000,100000,1000000,5000000,10000000]);
 // Compare original weapon damage/cadence/ballistics against the same weapon with Kaneki.
 console.log('Shop, save and ADM checked');report.weapons=await page.evaluate(()=>{
  const all=[];function run(w,skin){S.skin=skin;CF.w=w;CF.co=0;CF.m=0;CF.g=0;CF.i=0;start();beginGame();god=1;E=[];spawn(0,140,0,false);E[0].hp=E[0].mh=1e9;E[0].sp=0;P.crit=0;P.cd=0;upd(.016);return {rate:P.rate,cnt:P.cnt,dmg:P.dmg,bullets:B.map(b=>({d:b.d,vx:b.vx,vy:b.vy,l:b.l,p:b.p,bn:b.bn,kg:b.kg}))}}
  for(let w=0;w<5;w++){const normal=run(w,0),ghoul=run(w,21);all.push({w,normal,ghoul})}return all;
 });
 for(const pair of report.weapons){assert.ok(pair.ghoul.bullets.length>0);assert.ok(pair.ghoul.bullets.every(b=>b.kg===pair.w));const strip=v=>({...v,bullets:v.bullets.map(({kg,...b})=>b)});assert.deepEqual(strip(pair.normal),strip(pair.ghoul))}
 // Match original aim sectors, real profile pixels, back silhouette and native animation cycles.
 report.directions=await page.evaluate(()=>{
  SCGhoul.cancel();mv=0;tm=0;
  const frames={},samples=[];
  for(const d of ['down','up','side']){
   const c=SCGhoul.atlas[d+':idle:0:0'],pixels=c.getContext('2d').getImageData(0,0,96,96).data;
   let red=0,teeth=0;for(let i=0;i<pixels.length;i+=4){if(pixels[i]===211&&pixels[i+1]===29&&pixels[i+2]===66)red++;if(pixels[i]===229&&pixels[i+1]===229&&pixels[i+2]===228)teeth++}
   frames[d]={image:c.toDataURL(),red,teeth};
  }
  for(let i=0;i<32;i++){const a=i*Math.PI/16,ca=Math.cos(a),sa=Math.sin(a),expected=Math.abs(sa)>Math.abs(ca)*1.1?(sa>0?'down':'up'):'side';samples.push({a,...SCGhoul.frameState(a,P,false),expected,expectedFlip:expected==='side'&&ca<0})}
  const modes={};for(const [mode,count] of [['idle',4],['walk',6],['dash',3]])for(const d of ['down','up','side']){
   const images=[];for(let f=0;f<count;f++)images.push(SCGhoul.atlas[d+':'+mode+':'+f+':0'].toDataURL());modes[d+':'+mode]={count:images.length,unique:new Set(images).size};
  }
  mv=1;P.dT=0;tm=.2;const walking=SCGhoul.frameState(Math.PI,P,false);P.dT=.09;const dashing=SCGhoul.frameState(-Math.PI/2,P,false);P.dT=0;mv=0;
  return {frames,samples,modes,walking,dashing};
 });
 assert.notEqual(report.directions.frames.side.image,report.directions.frames.down.image);
 assert.ok(report.directions.frames.side.red>0);assert.ok(report.directions.frames.down.red>0);
 assert.equal(report.directions.frames.up.red,0);assert.equal(report.directions.frames.up.teeth,0);
 assert.ok(report.directions.frames.side.teeth<report.directions.frames.down.teeth);
 for(const s of report.directions.samples){assert.equal(s.direction,s.expected);assert.equal(s.flip,s.expectedFlip)}
 for(const v of Object.values(report.directions.modes)){assert.ok(v.unique>=2)}
 assert.equal(report.directions.walking.mode,'walk');assert.equal(report.directions.walking.flip,true);assert.equal(report.directions.dashing.mode,'dash');assert.equal(report.directions.dashing.direction,'up');
 delete report.directions.frames.side.image;delete report.directions.frames.down.image;delete report.directions.frames.up.image;
 const directionsArt=await page.evaluate(()=>{
  SCGhoul.cancel();CF.w=0;tm=0;mv=0;
  const c=document.createElement('canvas');c.width=960;c.height=640;const g=c.getContext('2d');g.fillStyle='#171622';g.fillRect(0,0,960,640);g.imageSmoothingEnabled=false;
  const views=[['Direita',0],['Esquerda',Math.PI],['Frente',Math.PI/2],['Costas',-Math.PI/2]];
  g.fillStyle='#ece8ef';g.font='bold 23px system-ui';g.fillText('KANEKI · GHOUL — DIREÇÕES REFEITAS',28,35);
  for(let i=0;i<4;i++){
   const [name,a]=views[i],xx=120+i*240;g.fillStyle='#b7b0c8';g.font='17px system-ui';g.fillText(name,xx-35,75);
   g.save();g.translate(xx,207);SPR.hero(g,31,a,21,null);g.restore();
   g.fillStyle='#b7b0c8';g.font='14px system-ui';g.fillText('Mesma escala do Clássico',xx-87,287);
   g.save();g.translate(xx-36,368);SPR.hero(g,17,a,0,null);g.restore();g.save();g.translate(xx+36,368);SPR.hero(g,17,a,21,null);g.restore();
   const f=SCGhoul.facing(a);for(let j=0;j<3;j++){
    g.save();g.translate(xx-72+j*72,517);if(f.flip)g.scale(-1,1);g.drawImage(SCGhoul.atlas[f.direction+':walk:'+j+':0'],-48*.72,-87*.72,96*.72,96*.72);g.restore();
   }
   g.fillStyle='#9e94af';g.fillText('Quadros de caminhada',xx-76,563);
  }
  return c.toDataURL();
 });fs.writeFileSync(path.join(out,'kaneki-directions.png'),Buffer.from(directionsArt.split(',')[1],'base64'));
 // Visual evidence at the same radius and anchor, plus all five projectile shapes.
 const art=await page.evaluate(()=>{
  const c=document.createElement('canvas');c.width=1000;c.height=560;const g=c.getContext('2d');g.imageSmoothingEnabled=false;g.fillStyle='#201c2a';g.fillRect(0,0,1000,560);g.fillStyle='#ece5ec';g.font='18px system-ui';
  const ids=[0,5,6,9,21];for(let i=0;i<5;i++){const xx=100+i*200;g.save();g.translate(xx,150);SPR.hero(g,28,.6,ids[i],null);g.restore();g.fillText(SK[ids[i]][0],xx-65,205)}
  for(let w=0;w<5;w++){CF.w=w;g.save();g.translate(100+w*200,370);SCGhoul.hero(g,28,.6,P,false);g.restore();SCGhoul.bullet(g,{kg:w,x:100+w*200,y:420,vx:100,vy:0,c:false});g.fillText(SPR.WEAPON[w],45+w*200,475)}return c.toDataURL();
 });fs.writeFileSync(path.join(out,'proportions-and-weapons.png'),Buffer.from(art.split(',')[1],'base64'));
 const movement=await page.evaluate(()=>{E=[];const before=P.x;joy.kx=1;joy.ky=0;for(let i=0;i<12;i++)upd(1/60);joy.kx=0;const moved=P.x-before;P.dc=0;dash();const d=P.dT;upd(.016);return {moved,dash:d,x:P.x}});assert.ok(movement.moved>0);assert.ok(movement.dash>0);report.movement=movement;
 // ULT: spend once, pause-safe timeline, four damage waves, healing, cleanup.
 report.ult=await page.evaluate(()=>{SCGhoul.cancel();P.hp=40;P.mhp=100;ult=100;E=[];spawn(0,P.x+100,P.y,false);E[0].hp=E[0].mh=1e9;E[0].sp=0;fireUlt();const spent=ult;const age=SCGhoul.state.age;st='pause';draw(1000);const paused=SCGhoul.state.age;st='play';let hp=E[0].hp;for(let i=0;i<150;i++)upd(1/60);const damage=hp-E[0].hp,healed=P.hp,waves=SCGhoul.state.wave;for(let i=0;i<70;i++)upd(1/60);return {spent,age,paused,damage,healed,waves,final:SCGhoul.state.age}});
 assert.equal(report.ult.spent,0);assert.equal(report.ult.age,report.ult.paused);assert.equal(report.ult.waves,4);assert.ok(report.ult.damage>0);assert.equal(report.ult.healed,52);assert.equal(report.ult.final,-1);
 for(const [label,w,h] of [['portrait',390,844],['landscape',844,390]]){await page.setViewportSize({width:w,height:h});await page.evaluate(()=>{rs();hide('intro');hide('menu');hide('shop');st='play';SCGhoul.cancel();draw(1000)});await page.screenshot({path:path.join(out,label+'.png')});assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false)}
 await page.evaluate(()=>{SCGhoul.cancel();ult=100;fireUlt();for(let i=0;i<25;i++)upd(1/60);draw(1400)});await page.screenshot({path:path.join(out,'ultimate-pose.png')});
 await page.evaluate(()=>{for(let i=0;i<33;i++)upd(1/60);draw(1900)});await page.screenshot({path:path.join(out,'ultimate-lash.png')});
 // Mid-sequence restart must not deliver damage into a new run.
 assert.equal(await page.evaluate(()=>{start();return SCGhoul.state.age}),-1);
 // Render cost with 1200 enemies and hundreds of projectiles. Relative evidence, not a phone FPS claim.
 report.performance=await page.evaluate(()=>{S.skin=21;CF.w=2;start();beginGame();god=1;E=[];for(let i=0;i<1200;i++){const e={...EN[0],k:0,x:(i%40)*24-480,y:Math.floor(i/40)*24-360,r:11,hp:100,mh:100,sp:0,col:'#576',t1:0,t2:0,oc:0,fl:0,ai:'c'};E.push(e)}B=[];for(let i=0;i<250;i++)B.push({kg:i%5,x:i%25*24-300,y:Math.floor(i/25)*24-120,vx:430,vy:0,c:false,l:1});const nodes=document.querySelectorAll('*').length;let times=[];for(let i=0;i<25;i++){const t=performance.now();draw(2000+i*16);times.push(performance.now()-t)}return {enemies:E.length,bullets:B.length,medianMs:times.sort((a,b)=>a-b)[12],nodesBefore:nodes,nodesAfter:document.querySelectorAll('*').length,atlasCount:Object.keys(SCGhoul.atlas).length}});
 assert.equal(report.performance.nodesBefore,report.performance.nodesAfter);assert.ok(report.performance.atlasCount<=48);assert.deepEqual(errors,[]);
 await page.reload({waitUntil:'domcontentloaded'});await page.waitForFunction(()=>window.SCGhoul,null,{polling:100});
 report.reload=await page.evaluate(()=>({skin:S.skin,owned:S.own.includes(21),best:S.best,extra:S.customPreserved}));
 assert.equal(report.reload.skin,21);assert.equal(report.reload.owned,true);assert.equal(report.reload.best,777);assert.deepEqual(report.reload.extra,{hello:42});
 report.errors=errors;fs.writeFileSync(path.join(out,'test-results.json'),JSON.stringify(report,null,2));console.log(JSON.stringify(report,null,2));await browser.close();server.close();
})().catch(e=>{console.error(e);server.close();process.exitCode=1});
