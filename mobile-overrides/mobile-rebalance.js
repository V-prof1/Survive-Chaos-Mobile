(() => {
'use strict';
try{
  const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
  const fmtN=n=>Math.floor(n||0).toLocaleString('pt-BR');

  // ===== DIFFICULTY 2.0 =====
  // name, mob HP, mob damage, spawn pressure, score/coins, player damage, XP, boss damage
  const DIFF=[
    ['Fácil',.90,.75,.95,.35,1.10,1.00,.95],
    ['Médio',1.15,1.10,1.12,.55,1.00,.92,1.15],
    ['Difícil',1.75,1.55,1.48,.80,.88,.78,1.45],
    ['Pesadelo',2.80,2.25,2.05,1.05,.72,.62,1.85],
    ['Baby',.45,.25,1.18,.08,2.00,1.25,.55]
  ];
  for(let i=0;i<Math.min(MD.length,DIFF.length);i++){MD[i].length=0;MD[i].push(...DIFF[i])}
  if(typeof DDESC!=='undefined'){
    DDESC[0]='Entrada acessível, mas sem chuva de recompensas: inimigos ×0,90 HP / ×0,75 dano; moedas e score ×0,35.';
    DDESC[1]='Novo padrão do jogo: inimigos ×1,15 HP / ×1,10 dano, mais pressão e recompensas moderadas.';
    DDESC[2]='Inimigos ×1,75 HP / ×1,55 dano, mais numerosos; seu dano e XP são reduzidos. Recompensa ×0,80.';
    DDESC[3]='Endgame real: inimigos ×2,80 HP / ×2,25 dano, pressão extrema, bosses agressivos e progressão mais lenta.';
    DDESC[4]='Modo brincadeira: ainda muito fácil, mas agora quase não rende moedas/score e não serve para farm.';
  }

  // Rank is now something to chase instead of something earned passively.
  if(typeof RK!=='undefined'){
    const ranks=[[0,'D',1],[5000,'C',1],[16000,'B',1.04],[40000,'A',1.10],[90000,'S',1.18],[200000,'SS',1.28]];
    RK.splice(0,RK.length,...ranks);
  }

  // ===== UPGRADE POWER COMPRESSION =====
  const setU=(id,max,desc,apply)=>{const u=U.find(v=>v[0]===id);if(!u)return;u[2]=desc;u[3]=max;u[4]=apply;if(typeof UM!=='undefined')UM[id]=max};
  setU('dmg',6,'+10% de dano',p=>p.dmg*=1.10);
  setU('rate',6,'Atira 9% mais rápido',p=>p.rate*=.91);
  setU('multi',3,'+1 projétil',p=>p.cnt++);
  setU('pierce',3,'Atravessa +1 inimigo',p=>p.pierce++);
  setU('bounce',2,'Rebate em +1 inimigo',p=>p.bounce++);
  setU('crit',5,'+6% de chance de crítico',p=>p.crit+=.06);
  setU('mhp',6,'+18 de vida e cura',p=>{p.mhp+=18;p.hp+=18});
  setU('regen',4,'+0,35 de vida por segundo',p=>p.regen+=.35);
  setU('spd',4,'+6% de velocidade',p=>p.sp*=1.06);
  setU('mag',4,'Atrai cristais de mais longe',p=>p.mag*=1.22);
  setU('xp',4,'+10% de XP',p=>p.xpm*=1.10);
  setU('orb',4,'+1 lâmina orbital',p=>p.orb++);
  setU('aura',4,'Aura de fogo cresce',p=>p.aura++);
  setU('light',4,'Relâmpago adicional',p=>p.light++);
  setU('exp',4,'Explosões ao abater',p=>p.exp++);
  setU('vamp',3,'Vampirismo controlado',p=>p.vamp++);
  setU('shield',2,'+1 carga de escudo',p=>{p.shM++;p.sh++});
  setU('dash',3,'Recarga do dash 15% menor',p=>p.dashCd*=.85);
  setU('armor',4,'-6% de dano recebido',p=>p.armor+=.06);

  if(typeof U2!=='undefined'){
    U2.dmg=q=>{q.bdm=(q.bdm||0)+.04};
    U2.rate=q=>{q.spd=(q.spd||430)*1.035};
    U2.pierce=q=>{q.pdm=(q.pdm||0)+.04};
    U2.bounce=q=>{q.br=(q.br||220)+30};
    U2.crit=q=>{q.cdm=(q.cdm||2)+.15};
    U2.mhp=q=>{q.lvh=(q.lvh||0)+.025};
    U2.regen=q=>{q.rst=(q.rst||0)+.25};
    U2.spd=q=>{q.mvd=(q.mvd||0)+.035};
    U2.mag=q=>{q.gh=(q.gh||0)+.08};
    U2.aura=q=>{q.burn=(q.burn||0)+.65};
    U2.light=q=>{q.lch=(q.lch||0)+1};
    U2.exp=q=>{q.exr=(q.exr||0)+.07};
    U2.vamp=q=>{q.vlow=(q.vlow||0)+.16};
    U2.shield=q=>{q.shk=(q.shk||0)+.7;q.shr=Math.max(5,(q.shr||10)*.95)};
    U2.dash=q=>{q.dtx=(q.dtx||0)+.08};
    U2.armor=q=>{q.thn=(q.thn||0)+.65};
  }

  const setSup=(id,desc,fn)=>{const u=SUP.find(v=>v[0]===id);if(u){u[2]=desc;u[4]=fn}};
  setSup('s_fury','Dano ×1,65 e cadência 22% maior. Preço: −45 de vida máxima',p=>{p.dmg*=1.65;p.rate*=.78;cut(p,45)});
  setSup('s_rain','+2 projéteis e +4 perfuração. Preço: dano −22%',p=>{p.cnt+=2;p.pierce+=4;p.dmg*=.78});
  setSup('s_sun','+3 lâminas e +6 de aura. Preço: velocidade −12%',p=>{p.orb+=3;p.aura+=6;p.sp*=.88});
  setSup('s_storm','+4 raios e +3 explosões. Preço: cadência 20% mais lenta',p=>{p.light+=4;p.exp+=3;p.rate*=1.20});
  setSup('s_immortal','+140 de vida, regeneração +2,5 e 2 escudos. Preço: dano −18% e velocidade −10%',p=>{p.mhp+=140;p.hp+=140;p.regen+=2.5;p.shM+=2;p.sh+=2;p.dmg*=.82;p.sp*=.90});
  setSup('s_wraith','Velocidade ×1,25 e dash muito rápido. Preço: −50 de vida e dano −15%',p=>{p.sp*=1.25;p.dashCd*=.45;cut(p,50);p.dmg*=.85});
  setSup('s_eagle','+25% crítico e +3 ricochetes. Preço: cadência 15% mais lenta',p=>{p.crit+=.25;p.bounce+=3;p.rate*=1.15});
  setSup('s_sage','XP ×1,45 e ímã ×2,2. Preço: dano −15%',p=>{p.xpm*=1.45;p.mag*=2.2;p.dmg*=.85});
  setSup('s_blood','Vampirismo ×4 e armadura +18%. Preço: −80 de vida máxima',p=>{p.vamp=Math.max(p.vamp,1)*4;p.armor+=.18;cut(p,80)});

  // Mobile content upgrades were added before this layer. Reduce the largest snowball sources.
  const extra={
    sc_critd:[4,'Críticos causam +8% de dano extra',p=>p.scCritDmg=(p.scCritDmg||0)+.08],
    sc_boss:[4,'+5% de dano contra bosses',p=>p.scBoss=(p.scBoss||0)+.05],
    sc_exec:[3,'+5% de dano contra alvos abaixo de 30%',p=>p.scExecute=(p.scExecute||0)+.05],
    sc_bleed:[4,'Sangramento progressivo',p=>p.scBleed=(p.scBleed||0)+1],
    sc_dashnova:[3,'Dash libera um pulso moderado',p=>p.scDashNova=(p.scDashNova||0)+1],
    sc_iron:[4,'Com pouca vida, recebe -4% de dano',p=>p.scIron=(p.scIron||0)+.04],
    sc_chain:[3,'Críticos têm +5% de chance de reação em cadeia',p=>p.scChain=(p.scChain||0)+.05],
    sc_scav:[4,'Abates têm +1,2% de chance de derrubar moeda',p=>p.scScavenge=(p.scScavenge||0)+.012],
    sc_low:[3,'Com pouca vida, causa +6% de dano',p=>p.scLowDmg=(p.scLowDmg||0)+.06],
    sc_soul:[3,'Abates carregam um pouco mais a ULT',p=>p.scSoul=(p.scSoul||0)+.25]
  };
  for(const id in extra){const u=U.find(v=>v[0]===id);if(u){u[2]=extra[id][1];u[3]=extra[id][0];u[4]=extra[id][2];if(typeof UM!=='undefined')UM[id]=u[3]}}

  // ===== NEW STACKABLE MOBILE MODES =====
  const XMODES=[
    ['Nenhum','Experiência base rebalanceada.'],
    ['🛡️ Cerco','Uma arena fecha lentamente. Ficar fora dela causa dano e hordas extras atacam.'],
    ['☠️ Caçada de Elite','Elites aparecem constantemente e a pressão sobe a cada minuto.'],
    ['🌑 Eclipse','Escuridão permanente, caçadores extras e inimigos mais velozes.'],
    ['🩸 Racionamento','Regeneração e vampirismo ficam desativados. Só pickups/efeitos instantâneos salvam você.'],
    ['👹 Dupla Ameaça','Sempre que um boss aparece, outro boss entra junto com vida reduzida.'],
    ['🎲 Roleta','Escolhe aleatoriamente um dos cinco modos extras no início da run.']
  ];
  if(!Number.isInteger(S.mobileExtraMode)||S.mobileExtraMode<0||S.mobileExtraMode>=XMODES.length)S.mobileExtraMode=0;
  const BM={mode:0,t:0,t2:0,siegeR:640,lastWave:0,doubleLock:0};
  const extraMode=()=>BM.mode||0;

  function mountExtraModes(){
    const panel=document.querySelector('#setup .panel.setup'),go=document.getElementById('go');if(!panel||!go||document.getElementById('mobileExtraModes'))return;
    const d=document.createElement('div');d.className='sec';d.id='mobileExtraModes';d.innerHTML='<div class="lbl">Modo extra · Mobile</div>';
    const seg=document.createElement('div');seg.className='seg';
    XMODES.forEach((m,i)=>{const b=document.createElement('button');b.className='opt'+(S.mobileExtraMode===i?' on':'');b.innerHTML='<b>'+m[0]+'</b>';b.onclick=()=>{S.mobileExtraMode=i;sv();sfx('ui');setupUI()};seg.appendChild(b)});
    d.appendChild(seg);const desc=document.createElement('div');desc.className='desc';desc.textContent=XMODES[S.mobileExtraMode][1];d.appendChild(desc);
    const bio=['Floresta: inimigos corpo a corpo mais rápidos.','Cemitério: espectros/ranged mais resistentes e perigosos.','Pântano: inimigos mais resistentes e poças mais frequentes.','Ruínas Geladas: inimigos mais rápidos e estacas frequentes.','Fábrica: dano inimigo maior e lasers mais frequentes.'];
    const bd=document.createElement('div');bd.className='desc mobileBiomeRule';bd.textContent='⚠ '+bio[CF.b||0];d.appendChild(bd);
    panel.insertBefore(d,go.parentElement);
  }
  const baseSetup=setupUI;setupUI=function(){const out=baseSetup.apply(this,arguments);mountExtraModes();return out};

  function applyCaps(q){
    if(!q)return;
    q.armor=Math.min(q.armor||0,.50);q.crit=Math.min(q.crit||0,.68);q.regen=Math.min(q.regen||0,5);
    q.sp=Math.min(q.sp||150,315);q.dashCd=Math.max(q.dashCd||3,.70);q.rate=Math.max(q.rate||.5,.085);
    q.cnt=Math.min(q.cnt||1,8);q.pierce=Math.min(q.pierce||0,10);q.bounce=Math.min(q.bounce||0,6);q.vamp=Math.min(q.vamp||0,5);
    q.scBoss=Math.min(q.scBoss||0,.35);q.scCritDmg=Math.min(q.scCritDmg||0,.55);q.scScavenge=Math.min(q.scScavenge||0,.12);q.scChain=Math.min(q.scChain||0,.28);
  }

  function startTuning(){
    BM.mode=S.mobileExtraMode===6?1+Math.floor(R()*5):S.mobileExtraMode;BM.t=BM.t2=0;BM.siegeR=640;BM.lastWave=0;
    for(const q of PL){
      // Modes that previously trivialized the game are pulled back into line.
      if(CF.g===3){q.dmg*=.70;q.crit=Math.max(.05,(q.crit||0)-.12)}
      if(CF.g===6){q.dmg*=.72;q.mhp*=.82;q.hp=Math.min(q.hp,q.mhp);q.sp*=.95;q.regen*=.65}
      if(BM.mode===4){q.regen=0;q.vamp=0;q.lvh=0}
      applyCaps(q);
    }
    if(CF.g===5)nb=Math.min(nb,12);
    if(CF.g===4)cz=Math.min(cz,15);
    if(BM.mode)try{ban('MODO EXTRA: '+XMODES[BM.mode][0].replace(/^\S+\s/,''))}catch(_){ }
  }
  const baseStart=start;start=function(){const out=baseStart.apply(this,arguments);try{startTuning()}catch(err){console.warn('[Balance start]',err)}return out};

  // ===== BIOME + LATE GAME PRESSURE =====
  const baseSpawn=spawn;
  spawn=function(k,px,py,el){
    const e=baseSpawn.apply(this,arguments);if(!e||e.boss)return e;
    const late=1+Math.min(.45,Math.max(0,T-300)/1800*.45);
    e.hp*=late;e.mh=e.hp;e.dmg*=1+Math.min(.25,Math.max(0,T-300)/2100*.25);e.sp*=1+Math.min(.10,Math.max(0,T-420)/1800*.10);
    if(bi===0&&['c','w','b'].includes(e.ai)){e.sp*=1.06;e.dmg*=1.04}
    else if(bi===1&&['a','g','n'].includes(e.ai)){e.hp*=1.12;e.mh=e.hp;e.dmg*=1.10}
    else if(bi===2){e.hp*=1.15;e.mh=e.hp;e.dmg*=1.07;e.sp*=.97}
    else if(bi===3){e.sp*=1.12;e.dmg*=1.06}
    else if(bi===4){e.hp*=1.08;e.mh=e.hp;e.dmg*=1.14;if(el){e.hp*=1.12;e.mh=e.hp}}
    if(extraMode()===2&&el){e.hp*=1.35;e.mh=e.hp;e.dmg*=1.18}
    if(extraMode()===3)e.sp*=1.10;
    return e;
  };

  // ===== BOSS 2.0 =====
  const tuneBoss=e=>{
    if(!e||e.dv||e.__mobileBoss)return e;e.__mobileBoss=1;
    const df=[1.20,1.35,1.50,1.65,1.05][CF.m]||1.3,late=1+Math.min(.50,T/1800*.50);
    let mf=CF.g===5?1.18:CF.g===6?1.28:1;if(extraMode()===2)mf*=1.12;if(extraMode()===5)mf*=1.08;
    const hp=df*late*mf;e.hp*=hp;e.mh=e.hp;e.sp*=1.10+(CF.m>=2?.05:0);e.cd=Math.min(e.cd||2.5,1.85);
    e.bm=(e.bm||1)*(1.10+(CF.m===3?.10:0));e.dmg=20*e.bm;e.__mburst=2.8;e.__mphase=0;return e;
  };
  const baseBoss=boss;
  boss=function(i){
    const n=E.length,out=baseBoss.apply(this,arguments);for(let j=n;j<E.length;j++)if(E[j]&&E[j].boss)tuneBoss(E[j]);
    if(extraMode()===5&&!BM.doubleLock&&!(typeof DV!=='undefined'&&DV.e)){
      BM.doubleLock=1;const n2=E.length;baseBoss.call(this,(i+1)%4);const second=E.slice(n2).find(e=>e&&e.boss&&!e.dv);if(second){tuneBoss(second);second.hp*=.68;second.mh=second.hp;second.dmg*=.90;second.bm*=.90}BM.doubleLock=0;try{ban('👹 DUPLA AMEAÇA')}catch(_){ }
    }
    return out;
  };

  const baseBossAI=bossAI;
  bossAI=function(e,dt){
    if(!e||e.dv||e.helper)return baseBossAI.apply(this,arguments);
    const f=e.hp/Math.max(1,e.mh);e.__mburst=(e.__mburst||2.8)-dt;
    if(f<.70&&e.__mphase<1){e.__mphase=1;e.inv=Math.max(e.inv||0,.45);for(let i=0;i<3;i++)spawn(pick(),e.x+R()*100-50,e.y+R()*100-50);try{ban('BOSS: FASE 2')}catch(_){ }}
    if(f<.35&&e.__mphase<2){e.__mphase=2;e.inv=Math.max(e.inv||0,.55);for(let i=0;i<5;i++)spawn(pick(),e.x+R()*130-65,e.y+R()*130-65, i===0);try{ban('BOSS: ENFURECIDO')}catch(_){ }}
    if(e.__mburst<=0){
      const n=f<.35?12:f<.70?9:6,b0=EB.length;radial(e,n,125+(1-f)*90,R()*PI,e.col||'#ff6a5e');if(f<.55){aim(e,220,0,12*e.bm,6,e.col||'#ffd45a');aim(e,220,.18,12*e.bm,6,e.col||'#ffd45a');aim(e,220,-.18,12*e.bm,6,e.col||'#ffd45a')}
      for(let i=b0;i<EB.length;i++)EB[i].d=(EB[i].d||10)*e.bm;e.__mburst=f<.35?2.05:f<.70?2.7:3.5;
    }
    return baseBossAI.call(this,e,dt*(f<.25?1.12:1));
  };

  // Damage gates stop endgame builds from deleting a boss before its mechanics can happen.
  const baseHit=hit;
  hit=function(e,d,sx,sy,crit){
    if(e&&e.boss&&Number.isFinite(d)){
      const cap=e.mh*(e.dv?.008:.025);d=Math.min(d,cap);d*=e.dv?.72:.82;
    }
    return baseHit.call(this,e,d,sx,sy,crit);
  };

  // Boss Rush no longer restores a full health bar after every kill.
  const baseKill=kill;
  kill=function(e){
    const realBoss=!!(e&&e.boss&&!e.helper&&!e.dv&&!e.dead),hp=realBoss?PL.map(q=>q.hp):null,out=baseKill.apply(this,arguments);
    if(realBoss&&e.dead&&CF.g===5&&st!=='over'){
      PL.forEach((q,i)=>{if(!q.dead)q.hp=Math.min(q.mhp,(hp[i]||0)+q.mhp*.22)});nb=T+45;
    }else if(realBoss&&e.dead&&CF.i&&CF.g!==5&&st!=='over')nb=Math.min(nb,T+210);
    return out;
  };

  // DEV: more time alive, faster mechanics and no deletion by one broken build.
  if(typeof devSpawn==='function'){
    const baseDevSpawn=devSpawn;devSpawn=function(){const out=baseDevSpawn.apply(this,arguments),e=DV&&DV.e;if(e&&!e.__mobileHard){e.__mobileHard=1;e.H0=Math.max(45000,Math.round(e.H0*1.85));e.bh=e.H0;e.hp=e.mh=e.bh;e.sp*=1.12;e.cd=Math.min(e.cd,1.35);try{devHud();ban('DEV // LIMITADORES REMOVIDOS')}catch(_){ }}return out};
  }
  if(typeof devNext==='function'){
    const baseDevNext=devNext;devNext=function(e){const out=baseDevNext.apply(this,arguments);if(out&&e){e.cd=Math.min(e.cd,.85);e.inv=Math.max(e.inv||0,1.9);e.sp*=1.04}return out};
  }
  if(typeof devAI==='function'){
    const baseDevAI=devAI;devAI=function(e,dt){const n=typeof dvN==='function'?dvN(e):1,boost=n>=12?1.22:n>=7?1.15:1.08;return baseDevAI.call(this,e,dt*boost)};
  }

  // ===== BASE MODE REBALANCE + EXTRA MODE LOGIC =====
  const baseModes=modes;
  modes=function(dt){
    const oldWave=WV.n,hps=CF.g===2?PL.map(q=>q.hp):null,g0=G.length;baseModes.apply(this,arguments);
    if(CF.g===2&&WV.n>oldWave){
      PL.forEach((q,i)=>{if(!q.dead)q.hp=Math.min(q.hp,(hps[i]||0)+q.mhp*.08)});
      if(WV.n%3===0&&WV.n%6!==0)for(let i=G.length-1;i>=g0;i--)if(G[i]&&G[i].k===4){G.splice(i,1);break}
      if(WV.n%4===0&&WV.n%5!==0)elite(1);
    }
    if(CF.g===4)cz=Math.min(cz,15);
  };

  const baseUpd=upd;
  upd=function(dt){
    const out=baseUpd.apply(this,arguments);BM.t+=dt;BM.t2+=dt;
    // Biome hazard pacing.
    const hzCap=[10,7.5,6.5,7,5.5][bi]||8;if(hz>hzCap)hz=hzCap;
    if(CF.g===6&&CL&&CL.on&&CL.t>12)CL.t=12;
    for(const q of PL){applyCaps(q);if(extraMode()===4){q.regen=0;q.vamp=0;q.lvh=0}}
    if(extraMode()===1){
      BM.siegeR=Math.max(320,640-T*.16);
      if(BM.t>=45){BM.t=0;ring(18+Math.min(36,Math.floor(T/60)*2));try{ban('🛡️ CERCO: A ARENA APERTA')}catch(_){ }}
      for(const q of PL){if(q.dead)continue;const d=Math.hypot(q.x,q.y);if(d>BM.siegeR){const old=P;P=q;hurt(9+T/180);P=old;q.x*=.995;q.y*=.995}}
    }else if(extraMode()===2){
      if(BM.t>=22){BM.t=0;elite(1+Math.min(2,Math.floor(T/360)));if(T>180)ring(10+Math.floor(T/120));try{ban('☠️ CAÇADA DE ELITE')}catch(_){ }}
    }else if(extraMode()===3){
      dark=Math.max(dark,1);if(BM.t>=32){BM.t=0;for(let i=0;i<5+Math.min(5,Math.floor(T/180));i++){const[a,b]=edge();spawn(R()<.55?7:1,a,b,i===0&&T>300)}try{ban('🌑 ALGO SE MOVE NO ESCURO')}catch(_){ }}
    }
    return out;
  };

  if(typeof drawPW==='function'){
    const baseDrawPW=drawPW;drawPW=function(){const out=baseDrawPW.apply(this,arguments);if(extraMode()===1&&st==='play'){
      x.save();x.strokeStyle='rgba(255,78,92,.72)';x.lineWidth=5;x.setLineDash([16,10]);x.beginPath();x.arc(0,0,BM.siegeR,0,PI*2);x.stroke();x.setLineDash([]);x.restore();
    }return out};
  }

  // Keep setup updated when entering it for the first time.
  setTimeout(()=>{if(document.getElementById('setup')?.classList.contains('on'))mountExtraModes()},0);
  window.SCBalance={extraMode,state:BM,modes:XMODES,diff:DIFF};
  console.log('[Mobile] Rebalance 2.0 enabled: economy pressure, 5 extra modes, biome rules, boss phases and harder DEV');
}catch(err){console.warn('[Mobile Rebalance]',err)}
})();