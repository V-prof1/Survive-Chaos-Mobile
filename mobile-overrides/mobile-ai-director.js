(() => {
'use strict';
try {
  const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
  const dist=(a,b)=>Math.hypot((b.x||0)-(a.x||0),(b.y||0)-(a.y||0))||1;
  const now=()=>typeof T==='number'?T:0;
  const BOSS_ATTACK_NAME={
    meteor:'Chuva de Meteoros',slam:'Impacto',beam:'Raio',cross:'Cruz Mortal',fan:'Leque',
    charge:'Investida',around:'Cerco',rings:'Onda Circular',radial:'Rajada Radial',
    aimed:'Rajada Mirada',summon:'Invocação'
  };

  function setIntent(e,text,t=.55,icon='⚠'){
    e.scIntent=text||'';e.scIntentT=t;e.scIntentIcon=icon;
  }
  function decayIntent(e,dt){
    if(e.scIntentT>0){e.scIntentT-=dt;if(e.scIntentT<=0){e.scIntentT=0;e.scIntent=''}}
  }
  function step(e,ux,uy,speed,dt){e.x+=ux*speed*dt;e.y+=uy*speed*dt}
  function strafe(e,ux,uy,speed,dt,dir){e.x+=(-uy*dir)*speed*dt;e.y+=(ux*dir)*speed*dt}
  function contact(e,p,d,mul=1){
    if(d<e.r+p.r*.8){e.scTouch=(e.scTouch||0)-.016;if(e.scTouch<=0){e.scTouch=.35;hurt(e.dmg*mul)}}
  }
  function markerCircle(px,py,rad,dmg,t=.7){MK.push({x:px,y:py,t,t0:t,rad,d:dmg})}
  function fireAim(e,spd,dmg,off=0,r=5,col='#ffd45a'){aim(e,spd,off,dmg,r,col)}

  function enemyBrain(e){
    if(e.scPack3Name){
      if(e.scPack3Name==='Lâmina Fantasma')return 'phantom';
      if(e.scPack3Name==='Bruto de Ferrugem')return 'bruiser';
      if(e.scPack3Name==='Oráculo do Vazio')return 'summoner';
      if(e.scPack3Name==='Carrapato Prismático')return 'bomber';
      if(e.scPack3Name==='Artilheiro Caótico')return 'marksman';
      if(e.scPack3Name==='Guardião do Abismo')return 'bruiser';
    }
    return e.ai==='a'?'marksman':e.ai==='n'?'summoner':e.ai==='w'?'pouncer':e.ai==='x'?'bomber':e.ai==='b'?'skirmisher':e.ai==='h'?'bruiser':e.ai==='g'?'phantom':'melee';
  }

  const MINI={
    fort:{name:'Bastião Colossal',icon:'🛡️',hp:2.45,dmg:1.18,sp:.88},
    rage:{name:'Predador Frenético',icon:'🔥',hp:1.95,dmg:1.32,sp:1.16},
    mirror:{name:'Arauto Espelhado',icon:'🔷',hp:2.05,dmg:1.22,sp:1.04},
    regen:{name:'Sangue Imortal',icon:'💚',hp:2.35,dmg:1.15,sp:.96},
    split:{name:'Ninhada Alfa',icon:'🧬',hp:2.10,dmg:1.20,sp:1.02}
  };

  function ascendMini(e,key){
    if(e.scMiniBoss)return;
    const m=MINI[key]||MINI.fort;
    e.scMiniBoss=1;e.scMiniName=m.name;e.scMiniIcon=m.icon;e.scMiniPhase=0;
    e.hp*=m.hp;e.mh=e.hp;e.dmg*=m.dmg;e.sp*=m.sp;e.r*=1.18;e.xp=Math.max(e.xp*4,12);
    e.scCD=.8+R()*.8;e.scState='approach';e.scTimer=.5;
    try{ban('⚠ MINI-BOSS: '+m.name.toUpperCase())}catch(_){}
  }

  function initEnemy(e){
    if(!e||e.boss||e.scAIBrain)return;
    e.scAIBrain=enemyBrain(e);
    e.scState='approach';e.scTimer=.4+R()*1.3;e.scCD=.8+R()*2;e.scDir=R()<.5?-1:1;
    e.scBurst=0;e.scShotGap=0;e.scLastHp=e.hp;e.scDirected=!!e.el||!!e.scPack3||e.ai!=='c'||R()<.38;
    if(e.scJuggernaut)e.scDirected=true;
    if(e.el){
      const key=e.__mutation||['fort','rage','mirror','regen','split'][Math.floor(R()*5)];
      e.scEliteKey=key;e.scDirected=true;
      const late=now()>600?.30:now()>300?.20:.10;
      const hard=(typeof CF!=='undefined'&&CF.m>=3)?.08:0;
      if(MINI[key]&&R()<late+hard)ascendMini(e,key);
      else {e.scEliteAbility=key;e.scCD=.6+R()*1.2}
    }
  }

  const baseSpawn=spawn;
  spawn=function(k,px,py,el){const e=baseSpawn.apply(this,arguments);if(e&&!e.boss)initEnemy(e);return e};

  function meleeAI(e,dt,p,d,ux,uy,rm){
    e.scCD-=dt;e.scTimer-=dt;
    if(e.scState==='windup'){
      strafe(e,ux,uy,e.sp*.35,dt,e.scDir);
      if(e.scTimer<=0){e.scState='lunge';e.scTimer=.38;e.scCD=2.2+R()*1.2;setIntent(e,'INVESTIDA',.25,'➤')}
    }else if(e.scState==='lunge'){
      step(e,ux,uy,e.sp*2.45*rm,dt);contact(e,p,d,1.12);
      if(e.scTimer<=0){e.scState='recover';e.scTimer=.6}
    }else if(e.scState==='recover'){
      if(d<90)step(e,-ux,-uy,e.sp*.55,dt);else strafe(e,ux,uy,e.sp*.45,dt,e.scDir);
      if(e.scTimer<=0)e.scState='approach';
    }else{
      if(d>150)step(e,ux,uy,e.sp*rm,dt);else strafe(e,ux,uy,e.sp*.62*rm,dt,e.scDir);
      contact(e,p,d);
      if(e.scCD<=0&&d<190){e.scState='windup';e.scTimer=.34+R()*.18;setIntent(e,'PREPARANDO INVESTIDA',e.scTimer,'⚠')}
    }
    return true;
  }

  function marksmanAI(e,dt,p,d,ux,uy,rm){
    e.scCD-=dt;e.scTimer-=dt;e.scShotGap-=dt;
    const desired=e.scPack3Name==='Artilheiro Caótico'?255:220;
    if(e.scState==='windup'){
      strafe(e,ux,uy,e.sp*.35,dt,e.scDir);
      if(e.scTimer<=0){e.scState='burst';e.scBurst=e.scPack3Name?3:2;e.scShotGap=0}
    }else if(e.scState==='burst'){
      if(e.scShotGap<=0&&e.scBurst>0){
        const spread=(e.scBurst%2?.06:-.06);
        fireAim(e,e.scPack3Name?190:165,e.dmg,spread,5,e.scPack3Name?'#ffb04a':(e.k==6?'#d38aff':'#ffd45a'));
        e.scBurst--;e.scShotGap=.20;
      }
      if(e.scBurst<=0){e.scState='recover';e.scTimer=.8;e.scCD=2.4+R()*1.1}
    }else if(e.scState==='recover'){
      if(d<desired-45)step(e,-ux,-uy,e.sp*.7,dt);else strafe(e,ux,uy,e.sp*.7,dt,e.scDir);
      if(e.scTimer<=0){e.scState='approach';e.scDir*=-1}
    }else{
      if(d<desired-35)step(e,-ux,-uy,e.sp*.82*rm,dt);else if(d>desired+55)step(e,ux,uy,e.sp*.75*rm,dt);
      strafe(e,ux,uy,e.sp*.42*rm,dt,e.scDir);
      if(e.scCD<=0&&d<380){e.scState='windup';e.scTimer=.48;setIntent(e,e.scPack3Name?'TRIPLA RAJADA':'RAJADA',.48,'🎯')}
    }
    contact(e,p,d,.75);return true;
  }

  function summonerAI(e,dt,p,d,ux,uy,rm){
    e.scCD-=dt;e.scTimer-=dt;
    if(e.scState==='channel'){
      if(e.scLastHp-e.hp>e.mh*.08){e.scState='recover';e.scTimer=.7;e.scCD=2;setIntent(e,'RITUAL INTERROMPIDO',.5,'✕')}
      else if(e.scTimer<=0){
        const count=e.scPack3Name?3:2;summon(e,0,count);
        for(let i=-1;i<=1;i++)fireAim(e,145,e.dmg*.85,i*.13,5,e.scPack3Name?'#9166ff':'#c58bff');
        e.scState='recover';e.scTimer=1;e.scCD=4.1+R()*1.1;
      }
    }else if(e.scState==='recover'){
      if(d<230)step(e,-ux,-uy,e.sp*.7,dt);else strafe(e,ux,uy,e.sp*.55,dt,e.scDir);
      if(e.scTimer<=0)e.scState='approach';
    }else{
      if(d<220)step(e,-ux,-uy,e.sp*.8*rm,dt);else if(d>310)step(e,ux,uy,e.sp*.65*rm,dt);else strafe(e,ux,uy,e.sp*.45,dt,e.scDir);
      if(e.scCD<=0&&d<390){e.scState='channel';e.scTimer=.9;setIntent(e,e.scPack3Name?'RITUAL DO VAZIO':'INVOCANDO',.9,'🔮')}
    }
    e.scLastHp=e.hp;contact(e,p,d,.7);return true;
  }

  function pouncerAI(e,dt,p,d,ux,uy,rm){
    e.scCD-=dt;e.scTimer-=dt;
    if(e.scState==='windup'){
      if(d<120)step(e,-ux,-uy,e.sp*.35,dt);
      if(e.scTimer<=0){e.scState='lunge';e.scTimer=.48;setIntent(e,'SALTO',.3,'🐺')}
    }else if(e.scState==='lunge'){
      step(e,ux,uy,e.sp*3.6*rm,dt);contact(e,p,d,1.25);
      if(e.scTimer<=0){e.scState='recover';e.scTimer=1.1;e.scCD=2.7+R()*.8}
    }else if(e.scState==='recover'){
      strafe(e,ux,uy,e.sp*.7,dt,e.scDir);
      if(e.scTimer<=0){e.scState='approach';e.scDir*=-1}
    }else{
      if(d>205)step(e,ux,uy,e.sp*.8*rm,dt);else strafe(e,ux,uy,e.sp*.75,dt,e.scDir);
      if(e.scCD<=0&&d<260){e.scState='windup';e.scTimer=.5;setIntent(e,'PREPARANDO SALTO',.5,'⚠')}
    }
    return true;
  }

  function bomberAI(e,dt,p,d,ux,uy,rm){
    e.scCD-=dt;e.scTimer-=dt;
    if(e.scState==='dive'){
      step(e,ux,uy,e.sp*2.7*rm,dt);
      if(d<e.r+p.r+12){e.dead=1;boom(e.x,e.y,70,0);if(Math.hypot(p.x-e.x,p.y-e.y)<70+p.r)hurt(Math.max(28,e.dmg*1.6));return true}
      if(e.scTimer<=0){e.scState='orbit';e.scTimer=.7;e.scCD=1.8}
    }else{
      const orbit=185;
      if(d>orbit+35)step(e,ux,uy,e.sp*.68*rm,dt);else if(d<orbit-35)step(e,-ux,-uy,e.sp*.48,dt);
      strafe(e,ux,uy,e.sp*.85,dt,e.scDir);
      if(e.scCD<=0&&d<245){e.scState='dive';e.scTimer=1.2;setIntent(e,'MERGULHO EXPLOSIVO',.5,'💣')}
    }
    return true;
  }

  function skirmisherAI(e,dt,p,d,ux,uy,rm){
    e.scCD-=dt;e.scTimer-=dt;
    if(e.scState==='dive'){
      step(e,ux,uy,e.sp*2.3*rm,dt);contact(e,p,d,1.05);
      if(e.scTimer<=0){e.scState='orbit';e.scTimer=1;e.scCD=1.8+R()}
    }else{
      strafe(e,ux,uy,e.sp*1.05*rm,dt,e.scDir);if(d>170)step(e,ux,uy,e.sp*.35,dt);
      if(e.scCD<=0&&d<230){e.scState='dive';e.scTimer=.42;setIntent(e,'RASANTE',.32,'🦇')}
      if(e.scTimer<=0){e.scDir*=-1;e.scTimer=.9+R()}
    }
    return true;
  }

  function bruiserAI(e,dt,p,d,ux,uy,rm){
    e.scCD-=dt;e.scTimer-=dt;const heavy=!!e.scJuggernaut||e.scPack3Name==='Guardião do Abismo';
    if(e.scState==='windup'){
      if(e.scTimer<=0){markerCircle(e.x,e.y,e.r*(heavy?2.5:2)+50,e.dmg*(heavy?1.45:1.2),.55);e.scState='recover';e.scTimer=.9;e.scCD=(heavy?3.2:2.6)+R();setIntent(e,'IMPACTO',.45,'💥')}
    }else if(e.scState==='recover'){
      if(d<120)step(e,-ux,-uy,e.sp*.45,dt);if(e.scTimer<=0)e.scState='approach';
    }else{
      if(d>115)step(e,ux,uy,e.sp*.78*rm,dt);else strafe(e,ux,uy,e.sp*.3,dt,e.scDir);contact(e,p,d,1.15);
      if(e.scCD<=0&&d<180){e.scState='windup';e.scTimer=heavy?.85:.62;setIntent(e,heavy?'ABALO DO ABISMO':'GOLPE PESADO',e.scTimer,'⚠')}
    }
    return true;
  }

  function phantomAI(e,dt,p,d,ux,uy,rm){
    e.scCD-=dt;e.scTimer-=dt;
    if(e.scState==='blink'){
      if(e.scTimer<=0){const a=Math.atan2(p.y-e.y,p.x-e.x)+(e.scDir>0?1:-1)*1.8,rr=90+R()*45;e.x=p.x+Math.cos(a)*rr;e.y=p.y+Math.sin(a)*rr;FX.push({x:e.x,y:e.y,r:55,t:.22,ring:1});e.scState='strike';e.scTimer=.48;setIntent(e,'EMBOSCADA',.35,'👁️')}
    }else if(e.scState==='strike'){
      step(e,ux,uy,e.sp*2.5*rm,dt);contact(e,p,d,1.2);if(e.scTimer<=0){e.scState='recover';e.scTimer=.9;e.scCD=2.8+R()}
    }else if(e.scState==='recover'){
      strafe(e,ux,uy,e.sp*.85,dt,e.scDir);if(e.scTimer<=0)e.scState='approach';
    }else{
      if(d>210)step(e,ux,uy,e.sp*.55*rm,dt);else strafe(e,ux,uy,e.sp*.9,dt,e.scDir);
      if(e.scCD<=0&&d<300){e.scState='blink';e.scTimer=.45;setIntent(e,'DESAPARECENDO',.45,'◌')}
    }
    return true;
  }

  function eliteAbility(e,dt,p,d,ux,uy,rm){
    const key=e.scEliteKey||e.__mutation;if(!key)return false;
    e.scEliteCD=(e.scEliteCD==null?1+R()*2:e.scEliteCD-dt);
    if(e.scMiniBoss&&e.hp/e.mh<.5&&!e.scMiniPhase){e.scMiniPhase=1;e.scEliteCD=.25;e.sp*=1.08;e.dmg*=1.08;setIntent(e,'FASE 2',.9,'⚠');try{shake=8}catch(_){}}
    if(e.scEliteChannel){
      e.scEliteChannel-=dt;
      if(key==='regen'&&e.scLastHp-e.hp>e.mh*.06){e.scEliteChannel=0;e.scEliteCD=2.2;setIntent(e,'CURA INTERROMPIDA',.45,'✕')}
      else if(e.scEliteChannel<=0){
        if(key==='fort')markerCircle(e.x,e.y,e.r*2.5+55,e.dmg*1.35,.55);
        else if(key==='rage'){e.scState='lunge';e.scTimer=e.scMiniBoss?.72:.48}
        else if(key==='mirror'){const n=e.scMiniBoss?12:8;radial(e,n,e.scMiniBoss?175:145,R()*7,'#63d8ff');for(let i=-1;i<=1;i++)fireAim(e,190,e.dmg*.85,i*.12,5,'#63d8ff')}
        else if(key==='regen'){e.hp=Math.min(e.mh,e.hp+e.mh*(e.scMiniBoss?.18:.10));summon(e,0,e.scMiniBoss?3:1)}
        else if(key==='split'){
          if(!e.scSplitCast){e.scSplitCast=1;const n=e.scMiniBoss?4:2;for(let i=0;i<n;i++){const c=spawn(e.k,e.x+R()*60-30,e.y+R()*60-30,0);if(c){c.hp=c.mh=Math.max(15,e.mh*(e.scMiniBoss?.10:.08));c.r*=.72;c.xp=1;c.scDirected=true}}}
          else markerCircle(p.x,p.y,55,e.dmg,.7);
        }
        e.scEliteCD=(e.scMiniBoss?2.4:3.4)+R()*1.5;
      }
      e.scLastHp=e.hp;return true;
    }
    if(e.scEliteCD<=0){
      e.scEliteChannel=key==='regen'?1.15:key==='fort'?.75:key==='mirror'?.65:key==='split'?.8:.45;
      const names={fort:'BASTIÃO: ONDA DE CHOQUE',rage:'FRENESI: INVESTIDA',mirror:'ESPELHO: CONTRA-RAJADA',regen:'REGENERAÇÃO: CANALIZANDO',split:'DIVISÃO: GERANDO CÓPIAS'};
      setIntent(e,names[key]||'MUTAÇÃO',e.scEliteChannel,'⚠');return true;
    }
    e.scLastHp=e.hp;return false;
  }

  function enemy(e,dt,p,d,ux,uy,rm){
    try{
      if(!e||e.dead||e.boss)return false;initEnemy(e);decayIntent(e,dt);if(!e.scDirected)return false;if(e.inv>0)e.inv=Math.max(0,e.inv-dt);
      if(e.scMiniBoss||e.el){if(eliteAbility(e,dt,p,d,ux,uy,rm)&&e.scEliteChannel>0){strafe(e,ux,uy,e.sp*.18,dt,e.scDir);contact(e,p,d,.8);return true}}
      const b=e.scAIBrain;
      if(b==='marksman')return marksmanAI(e,dt,p,d,ux,uy,rm);
      if(b==='summoner')return summonerAI(e,dt,p,d,ux,uy,rm);
      if(b==='pouncer')return pouncerAI(e,dt,p,d,ux,uy,rm);
      if(b==='bomber')return bomberAI(e,dt,p,d,ux,uy,rm);
      if(b==='skirmisher')return skirmisherAI(e,dt,p,d,ux,uy,rm);
      if(b==='bruiser')return bruiserAI(e,dt,p,d,ux,uy,rm);
      if(b==='phantom')return phantomAI(e,dt,p,d,ux,uy,rm);
      return meleeAI(e,dt,p,d,ux,uy,rm);
    }catch(err){console.warn('[AI enemy]',err);return false}
  }

  const BOSS_COMBOS={
    1:[['meteor','radial'],['summon','beam'],['slam','radial'],['meteor','beam']],
    2:[['charge','fan'],['aimed','charge'],['summon','around'],['fan','aimed']],
    3:[['rings','meteor'],['cross','charge'],['slam','rings'],['meteor','cross']],
    4:[['cross','fan','beam'],['around','radial'],['rings','cross'],['fan','beam','radial']]
  };

  function scaleAttack(e,name,phase=0){
    if(typeof AT==='undefined'||!AT[name])return;
    const n0=EB.length,m0=MK.length,r0=RG.length;AT[name](e,phase);const mul=(e.bm||1)*(e.helper?.82:1);
    for(let i=n0;i<EB.length;i++)if(EB[i].d)EB[i].d*=mul;
    for(let i=m0;i<MK.length;i++)if(MK[i].d)MK[i].d*=mul;
    for(let i=r0;i<RG.length;i++)RG[i].d=18*mul;
  }

  function pickCombo(e,d,phase){
    const list=BOSS_COMBOS[e.boss]||BOSS_COMBOS[1];let preferred=list;
    if(d<145)preferred=list.filter(c=>c.includes('slam')||c.includes('charge')||c.includes('around'));
    else if(d>300)preferred=list.filter(c=>c.includes('beam')||c.includes('meteor')||c.includes('aimed'));
    if(!preferred.length)preferred=list;
    const s=e.scBossBrain;let idx=Math.floor(R()*preferred.length),combo=preferred[idx];
    if(s.lastCombo&&preferred.length>1&&combo.join('|')===s.lastCombo)combo=preferred[(idx+1)%preferred.length];
    s.lastCombo=combo.join('|');const out=combo.slice();
    if(phase>=2&&out.length<3){const extra=e.boss===2?'aimed':e.boss===3?'cross':'radial';if(!out.includes(extra))out.push(extra)}
    return out;
  }

  function bossMove(e,p,d,dt,state){
    const a=Math.atan2(p.y-e.y,p.x-e.x),ux=Math.cos(a),uy=Math.sin(a),s=e.scBossBrain,desired=[0,185,235,205,255][e.boss]||220;
    const speed=e.sp*(s.phase>=2?1.20:s.phase>=1?1.08:1)*(e.helper?.72:1);if(state==='windup'||state==='execute')return;
    if(d>desired+55)step(e,ux,uy,speed,dt);else if(d<desired-45)step(e,-ux,-uy,speed*.8,dt);else strafe(e,ux,uy,speed*.62,dt,s.dir);
    s.dirT-=dt;if(s.dirT<=0){s.dir*=-1;s.dirT=1.8+R()*2.2}
  }

  function normalBoss(e,dt,p){
    if(!e.scBossBrain)e.scBossBrain={state:'position',t:1+R(),phase:0,combo:null,step:0,lastCombo:'',dir:R()<.5?-1:1,dirT:2};
    const s=e.scBossBrain,d=dist(e,p),f=e.hp/e.mh,phase=f<.25?2:f<.55?1:0;decayIntent(e,dt);
    if(phase>s.phase){s.phase=phase;s.state='transition';s.t=.9;s.combo=null;s.step=0;setIntent(e,'FASE '+(phase+1),.9,'⚠');try{shake=8}catch(_){}}
    s.t-=dt;
    if(s.state==='transition'){
      strafe(e,(p.x-e.x)/d,(p.y-e.y)/d,e.sp*.22,dt,s.dir);if(s.t<=0){s.state='position';s.t=.55}
    }else if(s.state==='position'){
      bossMove(e,p,d,dt,s.state);
      if(s.t<=0){s.combo=pickCombo(e,d,s.phase);s.step=0;s.state='windup';s.t=s.phase>=2?.48:s.phase>=1?.62:.78;setIntent(e,'COMBO: '+BOSS_ATTACK_NAME[s.combo[0]],s.t,'⚠')}
    }else if(s.state==='windup'){
      if(s.t<=0){s.state='execute';s.t=0}
    }else if(s.state==='execute'){
      if(s.t<=0&&s.combo){const name=s.combo[s.step];scaleAttack(e,name,s.phase);e.at=.45;setIntent(e,BOSS_ATTACK_NAME[name],.38,'✦');s.step++;if(s.step>=s.combo.length){s.state='recover';s.t=(s.phase>=2?1.0:s.phase>=1?1.25:1.55)*(e.helper?1.3:1)}else{s.state='gap';s.t=s.phase>=2?.34:.48}}
    }else if(s.state==='gap'){
      bossMove(e,p,d,dt,'gap');if(s.t<=0){s.state='windup';s.t=s.phase>=2?.34:.48;setIntent(e,'ENCADEANDO: '+BOSS_ATTACK_NAME[s.combo[s.step]],s.t,'↪')}
    }else if(s.state==='recover'){
      bossMove(e,p,d,dt,'recover');if(s.t<=0){s.state='position';s.t=.45+R()*.55}
    }
    if(d<e.r*.9+p.r)hurt(e.dmg);return true;
  }

  const DEV_COMBOS={
    early:[['meteors','lightning'],['cows','fireworks'],['sharks','horde']],
    mid:[['hole','meteors','lightning'],['lasers','sharks'],['blades','fireworks','lightning'],['flip','meteors']],
    late:[['freeze','lightning','lasers'],['hole','lasers','quake'],['sharks','blades','aura'],['horde','meteors','fireworks']],
    final:[['freeze','lightning','lasers','hole','fireworks'],['quake','sharks','blades','aura','meteors'],['hole','freeze','fireworks','lasers','lightning']]
  };

  function devTier(n){return n>=15?'final':n>=10?'late':n>=5?'mid':'early'}
  function chooseDevCombo(e,n,d){
    const arr=DEV_COMBOS[devTier(n)],s=e.scDevBrain;let pool=arr;
    if(d<170)pool=arr.filter(c=>c.includes('quake')||c.includes('aura')||c.includes('hole'));
    else if(d>320)pool=arr.filter(c=>c.includes('lightning')||c.includes('meteors')||c.includes('lasers'));
    if(!pool.length)pool=arr;let i=Math.floor(R()*pool.length),c=pool[i];
    if(s.lastCombo&&pool.length>1&&c.join('|')===s.lastCombo)c=pool[(i+1)%pool.length];s.lastCombo=c.join('|');return c.slice();
  }
  function devBurst(e,n){
    const arms=n>=13?3:n>=7?2:1,shots=n>=10?3:2;e.s=(e.s||0)+.45;
    for(let j=0;j<shots;j++)for(let k=0;k<arms;k++){const a=e.s+k*PI*2/arms+j*.13;EB.push({x:e.x,y:e.y,vx:Math.cos(a)*170,vy:Math.sin(a)*170,r:7,l:6,d:1e6,col:k%2?'#ffd45a':'#ff2a2a'})}
  }
  function devMove(e,p,d,dt,state,n){
    const ax=p.x-e.x,ay=p.y-e.y,ux=ax/d,uy=ay/d,s=e.scDevBrain,base=[0,52,76,105][e.bar]||75,sp=base*(n>=6?1.12:1)*(1+.02*(e.nb-1));
    if(state==='windup'||state==='execute')return;
    if(d>285)step(e,ux,uy,sp,dt);else if(d<175)step(e,-ux,-uy,sp*.72,dt);else strafe(e,ux,uy,sp*.68,dt,s.dir);
    s.dirT-=dt;if(s.dirT<=0){s.dir*=-1;s.dirT=2+R()*2}
  }
  function devBoss(e,dt,p){
    if(typeof DVP==='undefined'||typeof dvN==='undefined'||typeof DV==='undefined')return false;
    const n=dvN(e),d=dist(e,p);
    if(!e.scDevBrain)e.scDevBrain={state:'position',t:1.2,bar:n,combo:null,step:0,lastCombo:'',dir:R()<.5?-1:1,dirT:2,spiral:1.8,blink:6,lightning:4.5,gravity:7,horde:12,gravityT:0};
    const s=e.scDevBrain;e.inv=Math.max(0,(e.inv||0)-dt);decayIntent(e,dt);
    if(n!==s.bar){s.bar=n;s.state='transition';s.t=1.05;s.combo=null;s.step=0;s.spiral=1.5;s.blink=5;s.lightning=4;s.gravity=6;s.horde=11;setIntent(e,'NOVO PADRÃO DE COMBATE',1,'👁️')}
    s.t-=dt;s.spiral-=dt;s.blink-=dt;s.lightning-=dt;s.gravity-=dt;s.horde-=dt;
    if(s.gravityT>0){s.gravityT-=dt;for(const q of PL){if(q.dead||q.dT>0)continue;const gx=e.x-q.x,gy=e.y-q.y,gd=Math.hypot(gx,gy)||1;if(gd<440){q.x+=gx/gd*55*dt;q.y+=gy/gd*55*dt}}}
    if(n>=2&&s.spiral<=0&&s.state!=='windup'){devBurst(e,n);s.spiral=Math.max(1.45,2.45-n*.055)}
    if(n>=4&&s.blink<=0&&s.state==='position'){
      const a=R()*PI*2,tx=p.x+Math.cos(a)*(210+R()*55),ty=p.y+Math.sin(a)*(210+R()*55);FX.push({x:tx,y:ty,r:70,t:.45,ring:1});
      DV.q.push({t:.45,f:()=>{if(DV.e&&!DV.e.dead){DV.e.x=tx;DV.e.y=ty;FX.push({x:tx,y:ty,r:85,t:.2,ring:1})}}});s.blink=8-R()*1.5;setIntent(e,'BLINK TÁTICO',.45,'◌');
    }
    if(n>=7&&s.lightning<=0&&s.state!=='execute'){dvMk(p.x+(p.ddx||0)*75+R()*50-25,p.y+(p.ddy||0)*75+R()*50-25,.85,38,'⚡');s.lightning=4.7}
    if(n>=11&&s.gravity<=0&&s.state==='recover'){s.gravityT=1.4;s.gravity=7.5;setIntent(e,'PULSO GRAVITACIONAL',1.4,'🕳️')}
    if(n>=12&&s.horde<=0&&s.state==='recover'){DVP.horde(e);s.horde=14.5}
    if(s.state==='transition'){
      if(s.t<=0){s.state='position';s.t=.7}
    }else if(s.state==='position'){
      devMove(e,p,d,dt,s.state,n);if(s.t<=0){s.combo=chooseDevCombo(e,n,d);s.step=0;s.state='windup';s.t=n>=15?.55:n>=10?.68:.82;setIntent(e,'PREPARANDO COMBO',s.t,'👁️')}
    }else if(s.state==='windup'){
      if(s.t<=0){s.state='execute';s.t=0}
    }else if(s.state==='execute'){
      if(s.t<=0&&s.combo){const power=s.combo[s.step];if(DVP[power])DVP[power](e);setIntent(e,'DEV: '+power.toUpperCase(),.42,'✦');s.step++;if(s.step>=s.combo.length){s.state='recover';s.t=n>=15?1.25:n>=10?1.45:1.75}else{s.state='gap';s.t=n>=15?.48:n>=10?.58:.72}}
    }else if(s.state==='gap'){
      devMove(e,p,d,dt,'gap',n);if(s.t<=0){s.state='windup';s.t=n>=15?.42:.55;setIntent(e,'ENCADEANDO...',s.t,'↪')}
    }else if(s.state==='recover'){
      devMove(e,p,d,dt,'recover',n);if(s.t<=0){s.state='position';s.t=n>=15?.7:1+R()*.55}
    }
    if(d<e.r*.9+p.r)hurt(1e6);return true;
  }

  function boss(e,dt,p){
    try{if(!e||e.dead||!e.boss)return false;if(e.dv)return devBoss(e,dt,p);return normalBoss(e,dt,p)}catch(err){console.warn('[AI boss]',err);return false}
  }

  const baseKill=kill;
  kill=function(e){
    const wasMini=!!(e&&e.scMiniBoss),x0=e&&e.x,y0=e&&e.y;const out=baseKill.apply(this,arguments);
    if(wasMini&&e&&e.dead){try{for(let i=0;i<5;i++)G.push({x:x0+R()*30-15,y:y0+R()*30-15,v:2,k:0});for(let i=0;i<3;i++)G.push({x:x0+R()*25-12,y:y0+R()*25-12,v:1,k:2});ban('✓ MINI-BOSS DERROTADO: '+(e.scMiniName||'MUTAÇÃO'))}catch(_){}}
    return out;
  };

  const baseDrawE=drawE;
  drawE=function(e){
    baseDrawE.apply(this,arguments);if(!e||e.dead)return;
    try{
      if(e.scMiniBoss){
        const w=Math.max(54,e.r*2.8),y=e.y-e.r*2.05;x.save();x.textAlign='center';x.font='900 10px Nunito';x.lineWidth=3;x.strokeStyle='rgba(0,0,0,.9)';x.fillStyle='#ffd76a';
        x.strokeText((e.scMiniIcon||'⚠')+' '+e.scMiniName,e.x,y-7);x.fillText((e.scMiniIcon||'⚠')+' '+e.scMiniName,e.x,y-7);x.fillStyle='rgba(0,0,0,.7)';x.fillRect(e.x-w/2,y,w,5);x.fillStyle='#ff625f';x.fillRect(e.x-w/2,y,w*clamp(e.hp/e.mh,0,1),5);x.restore();
      }
      if(e.scIntent&&e.scIntentT>0){
        const y=e.y-e.r*(e.boss?2.15:2.35);x.save();x.textAlign='center';x.font=(e.boss?'900 11px':'800 9px')+' Nunito';x.lineWidth=3;x.strokeStyle='rgba(0,0,0,.92)';x.fillStyle=e.dv?'#ff5c68':e.boss?'#ffd45a':'#f4e7ff';
        const txt=(e.scIntentIcon||'⚠')+' '+e.scIntent;x.strokeText(txt,e.x,y);x.fillText(txt,e.x,y);x.restore();
      }
    }catch(_){}
  };

  window.SCAIDirector={version:'1.0',enemy,boss,initEnemy};
  console.log('[Mobile] AI Director 1.0 enabled: tactical enemies, elite mini-boss mutations, boss combos and paced DEV patterns.');
}catch(err){console.warn('[Mobile AI Director]',err)}
})();