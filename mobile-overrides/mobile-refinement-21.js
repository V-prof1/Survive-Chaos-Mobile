(() => {
'use strict';
try{
  const VERSION='21.0';
  const $=id=>document.getElementById(id);
  const safeSave=()=>{try{sv()}catch(_){}};
  const diff=()=>typeof CF!=='undefined'&&Number.isInteger(CF.m)?CF.m:1;
  const DIFF=['Fácil','Médio','Difícil','Pesadelo','Baby'];

  // Difficulty compatibility is intentionally conservative: accessibility modes never
  // silently inherit endgame rules from an aggressive game-mode layer.
  const SPECIAL_ALLOWED={
    0:new Set([0,2,4,7]),
    1:new Set([0,1,2,3,4,5,6,7,8]),
    2:new Set([0,1,2,3,4,5,6,7,8]),
    3:new Set([0,1,2,3,4,5,6,7,8]),
    4:new Set([0,2,4,7])
  };
  const WORLD_ALLOWED={
    0:new Set([0,1,2,3,7,8]),
    1:new Set([0,1,2,3,4,5,6,7,8,10]),
    2:new Set([0,1,2,3,4,5,6,7,8,9,10,11]),
    3:new Set([0,1,2,3,4,5,6,7,8,9,10,11]),
    4:new Set([0,1,2,3,8])
  };
  const allowedSpecial=id=>(SPECIAL_ALLOWED[diff()]||SPECIAL_ALLOWED[1]).has(id|0);
  const allowedWorld=id=>{
    id|=0;
    if(!(WORLD_ALLOWED[diff()]||WORLD_ALLOWED[1]).has(id))return false;
    if(id===9&&!(S.scWorld&&S.scWorld.wins>0))return false;
    return true;
  };
  let lastCompatMessage='';
  function normalizeModes(notify=false){
    let changed=[];
    if(!allowedSpecial(S.scSpecialMode||0)){changed.push('Modo Especial');S.scSpecialMode=0}
    if(!allowedWorld(S.scWorldMode||0)){changed.push('Tipo de Partida');S.scWorldMode=0}
    if(changed.length){safeSave();lastCompatMessage=changed.join(' + ')+' ajustado para '+(DIFF[diff()]||'esta dificuldade');if(notify)try{ban('🔒 '+lastCompatMessage);sfx('ui')}catch(_){}}
    return changed.length>0;
  }
  const reasonSpecial=id=>{
    if(allowedSpecial(id))return '';
    if(diff()===0||diff()===4)return 'Exige Médio ou superior para não quebrar a proposta acessível desta dificuldade.';
    return 'Indisponível nesta dificuldade.';
  };
  const reasonWorld=id=>{
    if(id===9&&!(S.scWorld&&S.scWorld.wins>0))return 'New Game+ exige uma vitória e dificuldade Difícil ou Pesadelo.';
    if(allowedWorld(id))return '';
    if([4,5,6,10].includes(id)&&(diff()===0||diff()===4))return 'Este modo altera agressividade/padrões demais para Fácil/Baby. Exige Médio ou superior.';
    if(id===11||id===9)return 'Modo de endgame: exige Difícil ou Pesadelo.';
    return 'Indisponível nesta dificuldade.';
  };

  function decorateModes(){
    normalizeModes(false);
    const sp=[...document.querySelectorAll('#scSpecialModes .scModeOpt')];
    sp.forEach((b,i)=>{const ok=allowedSpecial(i);b.disabled=!ok;b.classList.toggle('scDiffLocked',!ok);b.title=ok?'':reasonSpecial(i);if(!ok)b.setAttribute('aria-label',(b.textContent||'Modo')+' bloqueado: '+reasonSpecial(i))});
    const wp=[...document.querySelectorAll('#scWorldModes .scWorldModeGrid .opt')];
    wp.forEach((b,i)=>{const ok=allowedWorld(i);b.disabled=!ok;b.classList.toggle('scDiffLocked',!ok);b.title=ok?'':reasonWorld(i);if(!ok)b.setAttribute('aria-label',(b.textContent||'Modo')+' bloqueado: '+reasonWorld(i))});
    const panel=document.querySelector('#setup .panel.setup');
    if(panel){
      let box=$('scCompatInfo');if(!box){box=document.createElement('div');box.id='scCompatInfo';box.className='scCompatInfo';const go=$('go');panel.insertBefore(box,go&&go.parentElement?go.parentElement:null)}
      const d=diff(),txt=d===4?'Baby prioriza treino: sem Boss Rush, Blitz, Randomizer, Boss Marathon, Mirror ou Bullet Hell.':d===0?'Fácil bloqueia modos de endgame/caos extremo. Boss Rush, Blitz, Randomizer, Mirror, Boss Marathon e Bullet Hell começam no Médio.':d===1?'Médio libera quase todos os modos. New Game+ e Reality Roulette continuam reservados ao endgame.':'Esta dificuldade aceita todos os modos desbloqueados.';
      box.innerHTML='<b>🎚️ COMPATIBILIDADE · '+DIFF[d].toUpperCase()+'</b><span>'+txt+'</span>'+(lastCompatMessage?'<small>'+lastCompatMessage+'</small>':'');
    }
  }

  // ===== Supreme absorption =====
  // A Supreme incorporates its two maxed prerequisites. Their already-earned stats remain
  // part of the evolved build, but those families stop occupying slots and cannot be rolled again.
  const classMode=()=>typeof CF!=='undefined'&&CF.g===6;
  const absorbed=()=>P&&P.scSupremeAbsorbed&&typeof P.scSupremeAbsorbed==='object'?P.scSupremeAbsorbed:{};
  const absorbedIds=()=>new Set(Object.keys(absorbed()));
  const activeFamilies=()=>{
    if(!P||!P.lv)return 0;const a=absorbedIds();return U.filter(u=>(P.lv[u[0]]||0)>0&&!a.has(u[0])).length;
  };
  const absorbedFamilies=()=>Object.keys(absorbed()).length;
  const supremeCount=()=>P&&P.lv?SUP.filter(s=>(P.lv[s[0]]||0)>0).length:0;
  const uname=id=>{const u=U.find(q=>q[0]===id);return u?u[1]:id};
  const sname=id=>{const s=SUP.find(q=>q[0]===id);return s?s[1]:id};
  function absorbSupreme(u){
    if(!P||!P.lv||classMode()||!u||u.length<=6)return;
    if(!P.scSupremeAbsorbed||typeof P.scSupremeAbsorbed!=='object')P.scSupremeAbsorbed={};
    const req=[u[5],u[6]].filter(Boolean);let gained=0;
    for(const id of req){if(!P.scSupremeAbsorbed[id]){P.scSupremeAbsorbed[id]={supreme:u[0],level:P.lv[id]||0};gained++}}
    if(gained){
      try{ban('✨ '+u[1].toUpperCase()+' · '+gained+' SLOTS LIBERADOS');sfx('boss2')}catch(_){ }
      try{FX.push({x:P.x,y:P.y,r:240,t:.35,ring:1})}catch(_){ }
    }
  }

  if(typeof giveUp==='function'){
    const oldGive=giveUp;
    giveUp=function(u){
      const isSup=Array.isArray(u)&&u.length>6&&String(u[0]||'').startsWith('s_');
      const fresh=isSup&&P&&P.lv&&!(P.lv[u[0]]||0);
      const out=oldGive.apply(this,arguments);
      if(fresh)absorbSupreme(u);
      setTimeout(refreshBuildHud,0);
      return out;
    };
  }

  if(typeof rollCards==='function'){
    const oldRoll=rollCards;
    rollCards=function(){
      if(!P||!P.lv||classMode()){
        const out=oldRoll.apply(this,arguments);setTimeout(()=>{annotateCards();refreshBuildHud()},0);return out;
      }
      const ids=absorbedIds(),savedU=U.slice(),savedLv=new Map();
      try{
        // Make the previous 8-slot guard see absorbed prerequisites as free slots.
        for(const id of ids){savedLv.set(id,P.lv[id]||0);P.lv[id]=0}
        U.splice(0,U.length,...savedU.filter(u=>!ids.has(u[0])));
        const out=oldRoll.apply(this,arguments);
        annotateCards();refreshBuildHud();return out;
      }finally{
        U.splice(0,U.length,...savedU);
        for(const [id,v] of savedLv)P.lv[id]=v;
        setTimeout(refreshBuildHud,0);
      }
    };
  }

  function annotateCards(){
    if(!Array.isArray(cur)||!$('cl'))return;
    [...$('cl').children].forEach((card,i)=>{
      const u=cur[i];if(!u||u.length<=6)return;
      let n=card.querySelector('.scSupAbsorb');if(!n){n=document.createElement('small');n.className='scSupAbsorb';card.appendChild(n)}
      n.textContent='ABSORVE '+uname(u[5])+' + '+uname(u[6])+' · LIBERA 2 SLOTS';
    });
  }
  function refreshBuildHud(){
    if(!P)return;
    const a=activeFamilies(),ab=absorbedFamilies(),s=supremeCount();
    const n=$('scBuildNormal'),q=$('scBuildSup');
    if(n)n.textContent='BUILD '+a+'/8'+(ab?' · '+ab+' ABSORVIDOS':'');
    if(q)q.textContent='SUPREMAS '+s+'/2';
    const cards=$('cards');if(cards)cards.dataset.buildfull=a>=8?'1':'0';
    const rule=$('scBuildRule');if(rule){const span=rule.querySelector('span');if(span)span.textContent='Até 8 famílias ativas e 2 Supremas. Ao criar uma Suprema, os 2 upgrades exigidos são absorvidos pela evolução: mantêm o poder adquirido, deixam de ocupar slots e não podem ser escolhidos novamente nesta run.'}
  }

  // Public counters are replaced so achievements and future layers understand absorption.
  if(window.SCEnemyIndex){window.SCEnemyIndex.usedNormal=activeFamilies;window.SCEnemyIndex.usedSupreme=supremeCount;window.SCEnemyIndex.absorbedNormal=absorbedFamilies}
  try{
    const a4=typeof ACH!=='undefined'&&ACH.find(a=>a.id==='up4');
    if(a4){a4.n='Build Evoluída';a4.d='Complete 8 famílias ativas, absorva upgrades em 2 Supremas e maximize sua build final.';a4.f=()=>typeof inR==='function'&&inR()&&activeFamilies()>=8&&supremeCount()>=2&&absorbedFamilies()>=4}
  }catch(_){ }

  // Setup/start hooks are deliberately final: every older mode layer gets normalized inputs.
  if(typeof setupUI==='function'){
    const oldSetup=setupUI;
    setupUI=function(){const out=oldSetup.apply(this,arguments);setTimeout(()=>{decorateModes();refreshBuildHud()},0);return out};
  }
  if(typeof start==='function'){
    const oldStart=start;
    start=function(){normalizeModes(true);const out=oldStart.apply(this,arguments);if(P)P.scSupremeAbsorbed={};setTimeout(refreshBuildHud,0);return out};
  }

  const css=document.createElement('style');css.textContent=`
    .scDiffLocked{opacity:.32!important;filter:grayscale(1);cursor:not-allowed!important;box-shadow:none!important}
    .scCompatInfo{margin:10px 0;padding:10px 12px;border:1px solid rgba(255,68,86,.28);border-radius:12px;background:rgba(16,12,18,.82);display:flex;flex-direction:column;gap:4px}
    .scCompatInfo b{font-size:11px;color:#ff6a78;letter-spacing:.08em}.scCompatInfo span{font-size:11px;color:#ddd;line-height:1.35}.scCompatInfo small{font-size:10px;color:#ffd45a}
    .scSupAbsorb{display:block!important;margin-top:7px!important;padding:5px 7px!important;border-radius:8px!important;background:rgba(255,196,52,.12)!important;border:1px solid rgba(255,196,52,.28)!important;color:#ffd45a!important;font-weight:900!important;font-size:9px!important;letter-spacing:.04em!important}
  `;document.head.appendChild(css);

  const uiTimer=setInterval(()=>{try{if(st==='cards'){refreshBuildHud();annotateCards()}else if(st==='setup')decorateModes()}catch(_){ }},420);
  addEventListener('pagehide',()=>clearInterval(uiTimer),{once:true});
  setTimeout(()=>{normalizeModes(false);decorateModes();refreshBuildHud()},0);
  window.SCRefinement={version:VERSION,allowedSpecial,allowedWorld,normalizeModes,activeFamilies,absorbedFamilies,supremeCount};
  console.log('[Mobile] Refinement 21.0 enabled: difficulty-mode compatibility + Supreme absorption with 2 freed family slots each.');
}catch(err){console.warn('[Mobile Refinement 21.0]',err)}
})();