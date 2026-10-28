const assert=require('assert');
const fs=require('fs');
const path=require('path');
const http=require('http');
const {chromium}=require('playwright');

const root=path.resolve(process.argv[2]||'www');
const mime={'.html':'text/html; charset=utf-8','.js':'text/javascript; charset=utf-8','.css':'text/css; charset=utf-8','.png':'image/png','.mp3':'audio/mpeg','.json':'application/json'};
const server=http.createServer((req,res)=>{
  let p=decodeURIComponent((req.url||'/').split('?')[0]);if(p==='/'||!p)p='/index.html';
  p=path.normalize(p).replace(/^(\.\.[/\\])+/, '');const f=path.join(root,p);
  if(!f.startsWith(root)){res.writeHead(403);return res.end('forbidden')}
  fs.readFile(f,(err,data)=>{if(err){res.writeHead(404);return res.end('not found')}res.writeHead(200,{'content-type':mime[path.extname(f)]||'application/octet-stream','cache-control':'no-store'});res.end(data)});
});
const listen=()=>new Promise(r=>server.listen(0,'127.0.0.1',r));
const close=()=>new Promise(r=>server.close(r));

(async()=>{
  await listen();const port=server.address().port;const browser=await chromium.launch({headless:true});
  const context=await browser.newContext({viewport:{width:1280,height:720},hasTouch:true});
  await context.addInitScript(()=>{
    const makePad=index=>({index,connected:true,id:'SC Test Pad '+index,mapping:'standard',timestamp:0,axes:[0,0,0,0],buttons:Array.from({length:18},()=>({pressed:false,touched:false,value:0}))});
    window.__scPads=[makePad(0),makePad(1)];window.__scMakePad=makePad;
    Object.defineProperty(navigator,'getGamepads',{configurable:true,value:()=>window.__scPads});
    if(!navigator.vibrate)Object.defineProperty(navigator,'vibrate',{configurable:true,value:()=>true});
  });
  const page=await context.newPage();const errors=[];
  page.on('pageerror',e=>errors.push('pageerror: '+e.message));page.on('console',m=>{if(m.type()==='error')errors.push('console: '+m.text())});
  await page.goto(`http://127.0.0.1:${port}/index.html`,{waitUntil:'domcontentloaded'});
  await page.waitForFunction(()=>typeof start==='function'&&typeof coIn==='function'&&window.SCCoopIntegrity,{timeout:15000});
  const mobile=await page.evaluate(()=>String(window.SCCoopIntegrity?.version||'').startsWith('22.'));

  const reset=async(c1=1,c2=2,extra={})=>page.evaluate(({c1,c2,extra})=>{
    S.nick='P1';S.nick2='P2';S.webAdvMode=0;S.scSpecialMode=0;S.scWorldMode=0;S.scWorldMode2=0;
    Object.assign(S,extra.s||{});Object.assign(CF,{co:1,c1,c2,g:0,m:0,b:0,w:0,i:0},extra.cf||{});S.cf=CF;
    start();st='play';silence=99999;T=0;earned=0;ult=0;E.length=0;B.length=0;EB.length=0;RG.length=0;MK.length=0;G.length=0;
    for(let i=0;i<PL.length;i++){const q=PL[i];q.x=i?100:0;q.y=0;q.dead=0;q.hp=q.mhp;q.dc=0;q.dT=0;q.iv=0;q.rv=0}
    setCO();return{len:PL.length,sch:CO.sch.slice(),touch:CO.nt,version:window.SCCoopIntegrity?.version};
  },{c1,c2,extra});
  const key=async(type,code,keyValue)=>page.evaluate(({type,code,keyValue})=>dispatchEvent(new KeyboardEvent(type,{code,key:keyValue,bubbles:true,cancelable:true})),{type,code,keyValue});
  const pin=async(i)=>page.evaluate(i=>{P=PL[i];return coIn(i)},i);

  // Lobby auto-resolution and two-player construction.
  let s=await reset(1,1);assert.equal(s.len,2);assert.deepEqual(s.sch,[1,2],'WASD+WASD must auto-resolve to WASD+Arrows');
  s=await reset(2,2);assert.deepEqual(s.sch,[2,1],'Arrows+Arrows must auto-resolve to Arrows+WASD');
  s=await reset(3,3);assert.deepEqual(s.sch,[3,3],'Two controllers must remain independently selectable');
  s=await reset(0,0);assert.equal(s.touch,2,'Touch+Touch must allocate two touch joysticks');

  // Keyboard + keyboard: independent directions, dash and ULT.
  await reset(1,2);await key('keydown','KeyD','d');await key('keydown','ArrowLeft','ArrowLeft');let a=await pin(0),b=await pin(1);assert(a.mx>.9&&b.mx<-.9,'WASD/Arrows movement crossed');await key('keyup','KeyD','d');await key('keyup','ArrowLeft','ArrowLeft');
  await page.evaluate(()=>{PL[0].dc=PL[1].dc=0});await key('keydown','Space',' ');await key('keyup','Space',' ');assert(await page.evaluate(()=>PL[0].dT>0&&PL[1].dT<=0),'WASD dash routed to wrong player');
  await page.evaluate(()=>{PL[0].dT=PL[1].dT=0;PL[0].dc=PL[1].dc=0});await key('keydown','Enter','Enter');await key('keyup','Enter','Enter');assert(await page.evaluate(()=>PL[1].dT>0&&PL[0].dT<=0),'Arrow dash routed to wrong player');
  await page.evaluate(()=>{ult=100;PL[0].dT=PL[1].dT=0});await key('keydown','KeyQ','q');await key('keyup','KeyQ','q');assert(await page.evaluate(()=>ult<100),'WASD Q must fire ULT');
  await page.evaluate(()=>{ult=100});await key('keydown','Slash','/');await key('keyup','Slash','/');assert(await page.evaluate(()=>ult<100),'Arrow / must fire ULT');

  // Controller + controller and stable ownership across disconnect/reconnect.
  await page.evaluate(()=>{window.__scPads=[__scMakePad(0),__scMakePad(1)];__scPads[0].axes[0]=.8;__scPads[1].axes[0]=-.8});await reset(3,3);a=await pin(0);b=await pin(1);assert(a.mx>.7&&b.mx<-.7,'Gamepads are not independently routed');
  let gp=await page.evaluate(()=>CO.gp.slice());assert.deepEqual(gp,[0,1],'Gamepad slots were not pinned');
  await page.evaluate(()=>{__scPads[0].connected=false;dispatchEvent(new Event('gamepaddisconnected'))});await page.waitForTimeout(30);a=await pin(0);b=await pin(1);assert.equal(a.mx,0,'Disconnected P1 pad should become neutral');assert(b.mx<-.7,'P2 pad shifted into P1 slot after disconnect');
  await page.evaluate(()=>{__scPads[0]=__scMakePad(0);__scPads[0].axes[0]=.65;dispatchEvent(new Event('gamepadconnected'))});await page.waitForTimeout(30);a=await pin(0);assert(a.mx>.6,'Reconnected P1 pad did not recover its slot');
  await page.evaluate(()=>{st='play';CO.pb[1][2]=false;__scPads[1].buttons[9].pressed=true;P=PL[1];coIn(1)});assert.equal(await page.evaluate(()=>st),'pause','Start on P2 controller must pause');await page.evaluate(()=>{__scPads[1].buttons[9].pressed=false;document.getElementById('resume').click()});

  // Mixed controller + keyboard in both player orders.
  await page.evaluate(()=>{window.__scPads=[__scMakePad(0),__scMakePad(1)];__scPads[0].axes[0]=.9});await reset(3,1);await key('keydown','KeyA','a');a=await pin(0);b=await pin(1);assert(a.mx>.8&&b.mx<-.9,'Controller+WASD collision');await key('keyup','KeyA','a');
  await reset(2,3);await page.evaluate(()=>{__scPads[0].axes[0]=-.9});await key('keydown','ArrowRight','ArrowRight');a=await pin(0);b=await pin(1);assert(a.mx>.9&&b.mx<-.8,'Arrows+Controller collision');await key('keyup','ArrowRight','ArrowRight');

  // Controller + touch.
  await page.evaluate(()=>{window.__scPads=[__scMakePad(0),__scMakePad(1)];__scPads[0].axes[0]=-.85});await reset(0,3);
  await page.evaluate(()=>{const c=document.getElementById('c');c.dispatchEvent(new PointerEvent('pointerdown',{pointerId:31,pointerType:'touch',clientX:100,clientY:300,bubbles:true}));c.dispatchEvent(new PointerEvent('pointermove',{pointerId:31,pointerType:'touch',clientX:150,clientY:300,bubbles:true}))});a=await pin(0);b=await pin(1);assert(a.mx>.8&&b.mx<-.8,'Touch+Controller movement collision');
  await page.evaluate(()=>{PL[0].dc=0;document.getElementById('dash').dispatchEvent(new PointerEvent('pointerdown',{pointerId:41,pointerType:'touch',bubbles:true}))});assert(await page.evaluate(()=>PL[0].dT>0),'Touch dash did not target touch player');
  await page.evaluate(()=>{const c=document.getElementById('c');c.dispatchEvent(new PointerEvent('pointerup',{pointerId:31,pointerType:'touch',bubbles:true}))});

  // Touch + touch split: two independent sticks and two action button lanes.
  await reset(0,0);await page.evaluate(()=>{const c=document.getElementById('c');c.dispatchEvent(new PointerEvent('pointerdown',{pointerId:51,pointerType:'touch',clientX:120,clientY:300,bubbles:true}));c.dispatchEvent(new PointerEvent('pointermove',{pointerId:51,pointerType:'touch',clientX:170,clientY:300,bubbles:true}));c.dispatchEvent(new PointerEvent('pointerdown',{pointerId:52,pointerType:'touch',clientX:1100,clientY:300,bubbles:true}));c.dispatchEvent(new PointerEvent('pointermove',{pointerId:52,pointerType:'touch',clientX:1050,clientY:300,bubbles:true}))});a=await pin(0);b=await pin(1);assert(a.mx>.8&&b.mx<-.8,'Touch+Touch sticks are not independent');
  await page.evaluate(()=>{PL[0].dc=PL[1].dc=0;document.getElementById('dash1').dispatchEvent(new PointerEvent('pointerdown',{pointerId:61,pointerType:'touch',bubbles:true}))});assert(await page.evaluate(()=>PL[0].dT>0&&PL[1].dT<=0),'Left touch dash lane wrong');
  await page.evaluate(()=>{PL[0].dT=PL[1].dT=0;PL[0].dc=PL[1].dc=0;document.getElementById('dash').dispatchEvent(new PointerEvent('pointerdown',{pointerId:62,pointerType:'touch',bubbles:true}))});assert(await page.evaluate(()=>PL[1].dT>0&&PL[0].dT<=0),'Right touch dash lane wrong');

  // Targeting, pickups and shared upgrades.
  await reset(1,2);let route=await page.evaluate(()=>{PL[0].x=0;PL[1].x=100;return{enemy:tgt({x:90,y:0}).id,pickup:np(95,0).id,shared:PL[0].lv===PL[1].lv}});assert.deepEqual(route,{enemy:1,pickup:1,shared:true},'Nearest-player targeting/pickup/shared-upgrade state failed');
  let up=await page.evaluate(()=>{const d0=PL[0].dmg,d1=PL[1].dmg;giveUp(U[0]);return{a:PL[0].dmg/d0,b:PL[1].dmg/d1,lv:PL[0].lv.dmg}});assert(Math.abs(up.a-up.b)<1e-9&&up.a>1&&up.lv===1,'Shared co-op upgrade did not apply equally');

  // Projectile owner and P2 offensive dash.
  let owner=await page.evaluate(()=>{B.length=0;withP(PL[1],()=>B.push({x:PL[1].x,y:PL[1].y,vx:0,vy:0,r:3,l:1,d:10,p:0,b:0}));const bullet=B[0];P=PL[0];void bullet.d;return{tag:bullet.__scOwner===PL[1],p:P.id}});assert(owner.tag&&owner.p===1,'P2 projectile ownership was lost');
  let dashHit=await page.evaluate(()=>{E.length=0;PL[0].x=-500;PL[1].x=100;PL[1].y=0;PL[1].dmg=20;PL[1].dT=.15;const e=spawn(0,100,0,0);e.hp=e.mh=200;e.oc=0;P=PL[0];ext(.016);return e.hp});assert(dashHit<200,'P2 offensive dash still does no damage');

  // Death/revive and camera survivor behavior.
  let life=await page.evaluate(()=>{PL[0].x=0;PL[0].y=0;PL[1].x=10;PL[1].y=0;withP(PL[0],down);const notEnded=st!=='over';revive(3.1);return{notEnded,dead:PL[0].dead,hp:PL[0].hp,half:PL[0].mhp*.5,iv:PL[0].iv}});assert(life.notEnded&&!life.dead&&Math.abs(life.hp-life.half)<.01&&life.iv>=2,'Down/revive flow failed');
  let zoom=await page.evaluate(()=>{PL[0].dead=1;PL[0].x=-800;PL[1].dead=0;PL[1].x=100;ZM=.35;camUpd(.5);return ZM});assert(zoom>.35,'Camera did not recover toward surviving player');

  if(!mobile){
    // Web advanced modes: both players receive personal mode modifiers/rewards.
    await page.evaluate(()=>{S.webAdvMode=10;CF.co=1;CF.c1=1;CF.c2=2;start();st='play';silence=99999;modes(.016)});let ng=await page.evaluate(()=>[PL[0].dmg,PL[1].dmg]);assert(Math.abs(ng[0]-ng[1])<1e-8,'Web New Game+ buff differs between players');
    let heal=await page.evaluate(()=>{P=PL[0];PL[1].hp=PL[1].mhp*.3;const before=PL[1].hp;ban('SETOR CONCLUÍDO · Expedição 2');return[before,PL[1].hp]});assert(heal[1]>heal[0],'Web advanced-mode team heal missed P2');
  }else{
    // Mobile special mode personal parity.
    await page.evaluate(()=>{S.scSpecialMode=5;CF.co=1;CF.c1=1;CF.c2=2;start();st='play';silence=99999});let blitz=await page.evaluate(()=>[PL[0].sp,PL[1].sp]);assert(Math.abs(blitz[0]-blitz[1])<1e-8,'Mobile Blitz bonus differs between players');
    let asc=await page.evaluate(()=>{P=PL[0];const before=PL[1].dmg;ban('ASCENSÃO 2 · Bênção: +8% dano');return[before,PL[1].dmg]});assert(asc[1]>asc[0],'Ascension boon was not mirrored to P2');

    // King zone / Core Defense team participation.
    await page.evaluate(()=>{const m=SCModesPack.state;m.active=true;m.mode=4;m.zone={x:PL[1].x,y:PL[1].y};m.zoneHold=0;m.zoneNeed=18;PL[0].x=-500;PL[1].x=100;st='play'});await page.waitForTimeout(120);assert(await page.evaluate(()=>SCModesPack.state.zoneHold>0),'P2 cannot capture King of the Arena zone');
    await page.evaluate(()=>{const m=SCModesPack.state;m.active=true;m.mode=7;m.core={x:PL[1].x,y:PL[1].y,hp:40,max:100,time:0,need:999};PL[0].x=-500;E.length=0});const chp=await page.evaluate(()=>SCModesPack.state.core.hp);await page.waitForTimeout(120);assert(await page.evaluate(h=>SCModesPack.state.core&&SCModesPack.state.core.hp>h,chp),'P2 cannot repair Core Defense core');

    // Activities: P2 can collect caches.
    await page.evaluate(()=>{SCModesPack.state.active=false;const r=SCActivities.run;r.active=true;r.op={kind:'supply',name:'TEST',nodes:[{x:PL[1].x,y:PL[1].y,got:false}],got:0};PL[0].x=-500;st='play'});await page.waitForTimeout(100);assert(await page.evaluate(()=>SCActivities.run.op&&SCActivities.run.op.got===1),'P2 cannot collect Activity supply cache');

    // Worldshift scenery: P2 can activate interactive objects.
    if(await page.evaluate(()=>!!window.SCWorldshift)){
      await page.evaluate(()=>{const w=SCWorldshift.state;w.active=true;w.objects=[{type:'crystal',x:PL[1].x,y:PL[1].y,done:false}];PL[0].x=-500;ult=0;st='play'});await page.waitForTimeout(100);assert(await page.evaluate(()=>SCWorldshift.state.objects[0].done&&ult>0),'P2 cannot activate Worldshift scenery');
    }

    // Reality Break side-scroller: both local players are forced onto side physics.
    await reset(1,2);let side=await page.evaluate(()=>{bi=4;E.length=0;boss(3);const e=E.find(z=>z&&z.boss===4&&!z.helper)||bossE;if(!e)return{ok:false};P=PL[0];const r=SCAIDirector.boss(e,.016,PL[0]);return{ok:!!document.getElementById('rbMode')?.classList.contains('on'),y0:PL[0].y,y1:PL[1].y,groundish:Math.abs(PL[0].y-PL[1].y)<5}});assert(side.ok&&side.groundish,'Reality Break did not place both players into side-scroller physics');
  }

  // Result screen identifies the duo and restart preserves two players.
  await reset(1,2);await page.evaluate(()=>{S.nick='P1';S.nick2='P2';end(0)});let who=await page.evaluate(()=>document.querySelector('#os .who')?.textContent||'');assert(who.includes('P1')&&who.includes('P2'),'Result screen does not identify both local players');
  await page.evaluate(()=>document.getElementById('again').click());assert.equal(await page.evaluate(()=>PL.length),2,'Restart lost local co-op player');

  await page.waitForTimeout(80);assert.deepEqual(errors,[],`Browser errors during co-op suite:\n${errors.join('\n')}`);
  console.log(`Local co-op runtime suite passed (${mobile?'Mobile':'Web'}): inputs, gamepads, touch, combat ownership, dash, revive, camera, upgrades, modes and restart.`);
  await browser.close();await close();
})().catch(async e=>{console.error(e);try{await close()}catch(_){}process.exit(1)});
