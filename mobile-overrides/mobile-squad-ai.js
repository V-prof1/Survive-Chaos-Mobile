/* ©criado por Vitor Ag/Nyx - 2026 */
/* ©criado por Vitor Ag/Nyx - 2026 */
/* ©criado por Vitor Ag/Nyx - 2026 */
(() => {
'use strict';
try{
  const TA={active:false,lastNow:performance.now(),lastT:0,planAcc:0,steerAcc:0,modelAcc:0,plan:'encircle',planUntil:0,lastPlan:'',agents:[],squads:[],frameEMA:16.7,budget:72,plannerStep:.26,steerStep:.075,px:0,py:0,pvx:0,pvy:0,moveAngle:0,dashTimes:[],hitTimes:[],planHits:0,planStarted:0,serial:1};
  const TWO=Math.PI*2,clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
  const rng=()=>{try{return typeof window.R==='function'?window.R():Math.random()}catch(_){return Math.random()}};
  const time=()=>typeof T==='number'?T:0;
  const livePlay=()=>typeof st!=='undefined'&&st==='play'&&typeof P!=='undefined'&&P&&!P.dead&&typeof E!=='undefined';
  const brain=e=>e.scAIBrain||(e.ai==='a'?'marksman':e.ai==='n'?'summoner':e.ai==='w'?'pouncer':e.ai==='x'?'bomber':e.ai==='b'?'skirmisher':e.ai==='h'?'bruiser':e.ai==='g'?'phantom':'melee');
  const important=e=>!!(e.el||e.scMiniBoss||e.scJuggernaut||e.scPack3||e.__mutation);
  const ranged=e=>{const b=brain(e);return b==='marksman'||b==='summoner'};
  const fast=e=>{const b=brain(e);return b==='pouncer'||b==='skirmisher'||b==='phantom'||b==='bomber'};
  const heavy=e=>brain(e)==='bruiser'||!!e.scJuggernaut;
  const valid=e=>!!e&&!e.dead&&!e.boss&&!e.dv&&Number.isFinite(e.x)&&Number.isFinite(e.y)&&Number.isFinite(e.sp);
  const d2=(a,b)=>{const x=(a.x||0)-(b.x||0),y=(a.y||0)-(b.y||0);return x*x+y*y};
  const angNorm=a=>{while(a>Math.PI)a-=TWO;while(a<-Math.PI)a+=TWO;return a};

  function reset(){TA.active=true;TA.lastT=time();TA.planAcc=TA.steerAcc=TA.modelAcc=0;TA.plan='encircle';TA.lastPlan='';TA.planUntil=0;TA.agents=[];TA.squads=[];TA.px=P?.x||0;TA.py=P?.y||0;TA.pvx=TA.pvy=0;TA.moveAngle=0;TA.dashTimes.length=0;TA.hitTimes.length=0;TA.planHits=0;TA.planStarted=time()}

  function updatePerformance(dtMs){
    TA.frameEMA=TA.frameEMA*.92+dtMs*.08;
    const n=E?.length||0;
    if(TA.frameEMA>28||n>260){TA.budget=46;TA.plannerStep=.50;TA.steerStep=.12}
    else if(TA.frameEMA>22||n>190){TA.budget=56;TA.plannerStep=.40;TA.steerStep=.10}
    else if(TA.frameEMA>18.5||n>125){TA.budget=68;TA.plannerStep=.32;TA.steerStep=.085}
    else {TA.budget=84;TA.plannerStep=.24;TA.steerStep=.065}
  }

  function modelPlayer(dt){
    if(!P)return;const safe=Math.max(.016,dt),vx=(P.x-TA.px)/safe,vy=(P.y-TA.py)/safe;
    TA.pvx=TA.pvx*.72+clamp(vx,-520,520)*.28;TA.pvy=TA.pvy*.72+clamp(vy,-520,520)*.28;
    const sp=Math.hypot(TA.pvx,TA.pvy);if(sp>18)TA.moveAngle=Math.atan2(TA.pvy,TA.pvx);
    TA.px=P.x;TA.py=P.y;
    const t=time();TA.dashTimes=TA.dashTimes.filter(v=>t-v<7);TA.hitTimes=TA.hitTimes.filter(v=>t-v<7);
  }

  function collect(){
    const near=[],farImportant=[];if(!P)return near;
    for(const e of E){if(!valid(e))continue;const q=d2(e,P);if(q<=900*900)near.push({e,d:q});else if(important(e)&&q<=1150*1150)farImportant.push({e,d:q})}
    near.sort((a,b)=>a.d-b.d-(important(a.e)?14000:0)+(important(b.e)?14000:0));
    farImportant.sort((a,b)=>a.d-b.d);
    const out=near.slice(0,TA.budget);
    for(const q of farImportant){if(out.length>=TA.budget+8)break;if(!out.some(v=>v.e===q.e))out.push(q)}
    return out.map(v=>v.e);
  }

  function composition(list){let r=0,f=0,h=0,m=0;for(const e of list){if(ranged(e))r++;else if(fast(e))f++;else if(heavy(e))h++;else m++}return{r,f,h,m,n:list.length}}

  function choosePlan(list){
    const c=composition(list),hp=P.hp/Math.max(1,P.mhp),t=time();
    const dash=TA.dashTimes.filter(v=>t-v<5).length,orb=(P.orb||0)+(P.aura||0)*.65;
    let p='encircle';
    if(hp<.30&&c.n>=6)p='collapse';
    else if(dash>=4&&c.f>=2)p='intercept';
    else if(orb>=4&&c.r>=2)p='suppress';
    else if(c.h>=1&&c.r>=2&&c.n>=6)p='breach';
    else if(c.f>=4&&c.n>=6)p='pincer';
    else if(c.r>=3&&c.n>=7)p='suppress';
    else if(c.n>=9)p='encircle';
    else if(c.f>=2)p='pincer';
    else p='pressure';
    if(p===TA.lastPlan&&TA.planHits===0&&t-TA.planStarted>4.2){const alt=['encircle','pincer','suppress','intercept','breach'].filter(x=>x!==p);p=alt[Math.floor(rng()*alt.length)]}
    return p;
  }

  function makeSquads(list,plan){
    const supports=list.filter(ranged),heavies=list.filter(heavy),fasts=list.filter(e=>fast(e)&&!supports.includes(e)),others=list.filter(e=>!supports.includes(e)&&!heavies.includes(e)&&!fasts.includes(e));
    const groups=[];const mk=(name,role,arr)=>{if(arr.length)groups.push({id:TA.serial++,name,role,members:arr,leader:arr.slice().sort((a,b)=>(important(b)?1:0)-(important(a)?1:0))[0]})};
    if(plan==='suppress'){mk('LINHA DE FOGO','support',supports);mk('TELA','screen',heavies.concat(others.slice(0,Math.ceil(others.length/2))));mk('FLANCO','flank',fasts.concat(others.slice(Math.ceil(others.length/2))))}
    else if(plan==='breach'){mk('MARTELO','breach',heavies.concat(others.slice(0,Math.ceil(others.length/3))));mk('BIGORNA','flank',fasts.concat(others.slice(Math.ceil(others.length/3))));mk('COBERTURA','support',supports)}
    else if(plan==='pincer'){const rush=fasts.concat(others),a=[],b=[];rush.forEach((e,i)=>(i%2?a:b).push(e));mk('PINÇA E','left',a);mk('PINÇA D','right',b);mk('ÂNCORA','support',supports.concat(heavies))}
    else if(plan==='intercept'){mk('CORTE','intercept',fasts);mk('FUNIL','screen',heavies.concat(others));mk('COBERTURA','support',supports)}
    else if(plan==='collapse'){const all=list.slice();for(let i=0;i<3;i++)mk('ONDA '+(i+1),'wave'+i,all.filter((_,j)=>j%3===i))}
    else {const all=list.slice().sort((a,b)=>Math.atan2(a.y-P.y,a.x-P.x)-Math.atan2(b.y-P.y,b.x-P.x)),count=Math.min(4,Math.max(2,Math.ceil(all.length/7)));for(let i=0;i<count;i++)mk('SETOR '+(i+1),plan==='pressure'?'pressure':'sector',all.filter((_,j)=>j%count===i))}
    return groups;
  }

  const label={encircle:'CERCAR',pincer:'PINÇA',suppress:'SUPRESSÃO',breach:'ROMPER LINHA',intercept:'INTERCEPTAR',collapse:'FECHAR CERCO',pressure:'PRESSIONAR'};
  function telegraph(g,plan){const e=g.leader;if(!e)return;e.scIntent=label[plan]||'COORDENANDO';e.scIntentIcon='◆';e.scIntentT=1.0}

  function attackSchedule(groups,plan){
    let serial=0;
    for(const g of groups){for(const e of g.members){if(!valid(e))continue;const b=brain(e),stagger=(serial++%5)*.11;
      if(plan==='suppress'&&ranged(e))e.scCD=Math.min(Number.isFinite(e.scCD)?e.scCD:1,.30+stagger);
      else if(plan==='pincer'&&fast(e))e.scCD=Math.min(Number.isFinite(e.scCD)?e.scCD:1,.42+stagger);
      else if(plan==='breach'&&heavy(e))e.scCD=Math.min(Number.isFinite(e.scCD)?e.scCD:1,.25+stagger);
      else if(plan==='collapse')e.scCD=Math.min(Number.isFinite(e.scCD)?e.scCD:1,.55+(g.role==='wave0'?0:g.role==='wave1'?.45:.9)+stagger*.5);
      else if(plan==='intercept'&&fast(e))e.scCD=Math.min(Number.isFinite(e.scCD)?e.scCD:1,.38+stagger);
      if(b==='marksman'||b==='summoner')e.scDir=((serial+g.id)&1)?1:-1;
    }}
  }

  function assignFormation(groups,plan){
    const base=TA.moveAngle||0;
    for(const g of groups){const n=Math.max(1,g.members.length);g.members.forEach((e,i)=>{
      let a=base,r=130,w=.20;
      const b=brain(e),pref=ranged(e)?285:heavy(e)?105:fast(e)?155:135;
      if(plan==='pincer'){a=base+(g.role==='left'?1.55:g.role==='right'?-1.55:Math.PI);r=g.role==='support'?285:145;w=g.role==='support'?.14:.25}
      else if(plan==='suppress'){a=base+Math.PI+(i-(n-1)/2)*.28;r=g.role==='support'?290:g.role==='flank'?165:120;w=g.role==='support'?.14:.23}
      else if(plan==='breach'){a=base+(g.role==='flank'?(i%2?1.4:-1.4):g.role==='support'?Math.PI:0);r=g.role==='support'?275:g.role==='flank'?165:95;w=g.role==='breach'?.27:.20}
      else if(plan==='intercept'){a=base+(g.role==='intercept'?0:g.role==='support'?Math.PI:(i%2?1.15:-1.15));r=g.role==='intercept'?70:g.role==='support'?280:140;w=g.role==='intercept'?.30:.19}
      else if(plan==='collapse'){const wave=Number(g.role.replace('wave',''))||0;a=base+(wave-1)*2.05+(i-(n-1)/2)*.22;r=115+wave*25;w=.18+(.02*(2-wave))}
      else {a=(TWO*(i+g.id*.37)/Math.max(3,n))+base*.15;r=pref;w=plan==='pressure'?.18:.22}
      e.scSquadPlan=plan;e.scSquadId=g.id;e.scSquadRole=g.role;e.scSquadAngle=a;e.scSquadRadius=r;e.scSquadWeight=w;e.scSquadSlot=i;e.scSquadBrain=b;
    })}
  }

  function replan(){
    if(!livePlay())return;const list=collect();TA.agents=list;if(list.length<2){TA.squads=[];return}
    const next=choosePlan(list),changed=next!==TA.plan||time()>=TA.planUntil;
    if(changed){TA.lastPlan=TA.plan;TA.plan=next;TA.planUntil=time()+4.8+rng()*2.2;TA.planStarted=time();TA.planHits=0}
    const groups=makeSquads(list,TA.plan);TA.squads=groups;assignFormation(groups,TA.plan);
    if(changed){groups.forEach(g=>telegraph(g,TA.plan));attackSchedule(groups,TA.plan)}
  }

  function targetFor(e){
    const lead=.42,spd=Math.hypot(TA.pvx,TA.pvy),lx=P.x+TA.pvx*lead,ly=P.y+TA.pvy*lead;
    let cx=P.x,cy=P.y;if(e.scSquadRole==='intercept'&&spd>25){cx=lx;cy=ly}
    const a=e.scSquadAngle||0,r=e.scSquadRadius||140;
    return{x:cx+Math.cos(a)*r,y:cy+Math.sin(a)*r}
  }

  function spatialHash(list){const size=74,map=new Map();for(const e of list){const x=Math.floor(e.x/size),y=Math.floor(e.y/size),k=x+','+y;if(!map.has(k))map.set(k,[]);map.get(k).push(e)}return{size,map}}
  function repel(e,hash){const s=hash.size,cx=Math.floor(e.x/s),cy=Math.floor(e.y/s);let rx=0,ry=0,n=0;for(let yy=-1;yy<=1;yy++)for(let xx=-1;xx<=1;xx++){const a=hash.map.get((cx+xx)+','+(cy+yy));if(!a)continue;for(const o of a){if(o===e||!valid(o))continue;const dx=e.x-o.x,dy=e.y-o.y,dd=dx*dx+dy*dy,min=(e.r||12)+(o.r||12)+8;if(dd>0&&dd<min*min){const d=Math.sqrt(dd),q=(min-d)/min;rx+=dx/d*q;ry+=dy/d*q;if(++n>=6)return{rx,ry}}}}return{rx,ry}}

  function steer(dt){
    if(!livePlay()||!TA.agents.length)return;const hash=spatialHash(TA.agents);
    for(const e of TA.agents){if(!valid(e)||!e.scSquadPlan)continue;const q=d2(e,P);if(q>980*980&&!important(e))continue;
      const t=targetFor(e),dx=t.x-e.x,dy=t.y-e.y,d=Math.hypot(dx,dy)||1,sep=repel(e,hash);let nx=dx/d,ny=dy/d;
      nx+=sep.rx*.72;ny+=sep.ry*.72;const nd=Math.hypot(nx,ny)||1;nx/=nd;ny/=nd;
      let w=e.scSquadWeight||.18;if(e.scState==='windup'||e.scState==='burst'||e.scState==='channel')w*=.25;if(e.scState==='lunge'||e.scState==='dive'||e.scState==='strike')w*=.08;
      const maxStep=Math.min(28,(e.sp||80)*w*dt);e.x+=nx*maxStep;e.y+=ny*maxStep;
    }
  }

  const baseDash=typeof dash==='function'?dash:null;if(baseDash){dash=function(){const ready=livePlay()&&P&&P.dc<=0,out=baseDash.apply(this,arguments);if(ready&&P&&P.dT>0){TA.dashTimes.push(time());if(TA.dashTimes.length>12)TA.dashTimes.shift()}return out}}
  const baseHurt=typeof hurt==='function'?hurt:null;if(baseHurt){hurt=function(d){const hp=P&&P.hp,out=baseHurt.apply(this,arguments);if(P&&hp>P.hp){TA.hitTimes.push(time());TA.planHits++;if(TA.hitTimes.length>16)TA.hitTimes.shift()}return out}}

  function loop(nowMs){
    const dtMs=Math.min(70,Math.max(1,nowMs-TA.lastNow));TA.lastNow=nowMs;const dt=dtMs/1000;updatePerformance(dtMs);
    try{
      if(livePlay()){
        if(!TA.active||time()+.5<TA.lastT)reset();TA.lastT=time();TA.modelAcc+=dt;TA.planAcc+=dt;TA.steerAcc+=dt;
        if(TA.modelAcc>=.08){modelPlayer(TA.modelAcc);TA.modelAcc=0}
        if(TA.planAcc>=TA.plannerStep||time()>=TA.planUntil){TA.planAcc=0;replan()}
        if(TA.steerAcc>=TA.steerStep){const s=TA.steerAcc;TA.steerAcc=0;steer(s)}
      }else {TA.active=false;TA.agents.length=0;TA.squads.length=0}
    }catch(err){console.warn('[Squad AI]',err)}
    requestAnimationFrame(loop)
  }

  window.SCSquadAI={version:'8.0',state:TA,getPlan:()=>TA.plan,getAgents:()=>TA.agents.length,getSquads:()=>TA.squads.map(g=>({name:g.name,role:g.role,size:g.members.length})),getPerformance:()=>({frameMs:+TA.frameEMA.toFixed(1),budget:TA.budget,plannerHz:+(1/TA.plannerStep).toFixed(1),steerHz:+(1/TA.steerStep).toFixed(1)})};
  requestAnimationFrame(loop);
}catch(err){console.error('[Squad AI init]',err)}
})();