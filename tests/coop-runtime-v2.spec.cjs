const fs=require('fs');
const path=require('path');
const cp=require('child_process');

const src=path.join(__dirname,'coop-runtime.spec.cjs');
let s=fs.readFileSync(src,'utf8');

// Match a real projectile shape so the background collision loop never sees a test-only incomplete bullet.
s=s.replace("d:10,p:0,b:0}));const bullet=B[0]","d:10,p:0,b:0,h:[]}));const bullet=B[0]");

// The last Activity cache completes the operation and intentionally clears run.op.
s=s.replace(
  "assert(await page.evaluate(()=>SCActivities.run.op&&SCActivities.run.op.got===1),'P2 cannot collect Activity supply cache');",
  "assert(await page.evaluate(()=>!SCActivities.run.op||SCActivities.run.op.got===1),'P2 cannot collect Activity supply cache');"
);

// Worldshift may remove a consumed scenery object from the array immediately.
s=s.replace(
  "assert(await page.evaluate(()=>SCWorldshift.state.objects[0].done&&ult>0),'P2 cannot activate Worldshift scenery');",
  "assert(await page.evaluate(()=>ult>0&&(!SCWorldshift.state.objects[0]||SCWorldshift.state.objects[0].done)),'P2 cannot activate Worldshift scenery');"
);

// Explicitly exercise the Worldshift objectives that used to be P1-only.
const marker="    await reset(1,2);let side=await page.evaluate(()=>{bi=4;E.length=0;boss(3);";
const extra=`    if(await page.evaluate(()=>!!window.SCWorldModes&&!!window.SCWorldshift)){
      await reset(1,2);await page.evaluate(()=>{SCWorldshift.state.active=true;const m=SCWorldModes.state;m.mode=2;m.escapeCount=0;m.checkpoint={x:PL[1].x,y:PL[1].y,end:T+30};PL[0].x=-500;PL[1].x=100;st='play'});await page.waitForTimeout(120);assert(await page.evaluate(()=>SCWorldModes.state.escapeCount>=1),'P2 cannot complete Worldshift Escape checkpoint');
      await page.evaluate(()=>{const m=SCWorldModes.state;m.mode=3;m.core={x:PL[1].x,y:PL[1].y,hp:40,max:100};PL[0].x=-500;PL[1].x=100;st='play'});const whp=await page.evaluate(()=>SCWorldModes.state.core.hp);await page.waitForTimeout(120);assert(await page.evaluate(h=>SCWorldModes.state.core&&SCWorldModes.state.core.hp>h,whp),'P2 cannot repair Worldshift Defense core');
      await page.evaluate(()=>{const m=SCWorldModes.state;m.mode=11;m.checkpoint={x:PL[1].x,y:PL[1].y,end:T+30};PL[0].x=-500;PL[1].x=100;st='play'});await page.waitForTimeout(120);assert(await page.evaluate(()=>SCWorldModes.state.checkpoint===null),'P2 cannot complete Reality Roulette micro-escape');
    }
`;
if(s.includes(marker))s=s.replace(marker,extra+marker);else throw new Error('Could not inject Worldshift co-op tests');

s=s.replace("page.on('pageerror',e=>errors.push('pageerror: '+e.message));","page.on('pageerror',e=>errors.push('pageerror: '+(e.stack||e.message)));");

const out=path.join(__dirname,'coop-runtime.generated.cjs');
fs.writeFileSync(out,s);
const r=cp.spawnSync(process.execPath,[out,...process.argv.slice(2)],{stdio:'inherit'});
try{fs.unlinkSync(out)}catch(_){}
process.exit(r.status==null?1:r.status);
