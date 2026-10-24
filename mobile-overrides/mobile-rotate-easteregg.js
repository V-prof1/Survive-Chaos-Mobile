(() => {
'use strict';
try{
  const ID='s_rotate_brain';
  const NAME='Idiota com pouco cérebro';
  const DESC='Passe 60 segundos ignorando uma instrução que literalmente manda girar o celular.';
  const ROASTS=[
    [0,'A instrução tem TRÊS palavras. Vamos descobrir se alguma delas entra aí.'],
    [10,'10 segundos. Impressionante: você já perdeu para um desenho de celular girando.'],
    [20,'20 segundos. Até o acelerômetro do seu celular está com vergonha de você.'],
    [30,'30 segundos. QI estimado: insuficiente para operar um retângulo com tela.'],
    [40,'40 segundos. A tela disse “GIRE O CELULAR”. Você respondeu com absoluto nada. Gênio.'],
    [50,'50 segundos. Nesse ponto não é distração. É dedicação profissional à burrice.'],
    [60,'1 minuto. Parabéns: você foi oficialmente derrotado por uma instrução de três palavras. A conquista de idiota agora é sua.']
  ];
  let enteredAt=0,lastStep=-1,registered=false,unlockedThisSession=false;

  const portrait=()=>innerHeight>innerWidth;
  const byId=id=>document.getElementById(id);

  function registerAchievement(){
    if(registered)return true;
    try{
      if(typeof ACH==='undefined'||typeof ACM==='undefined'||typeof ACS==='undefined')return false;
      if(!ACM[ID]){
        const a={id:ID,n:NAME,d:DESC,r:9.95,f:null,s:true};
        ACH.push(a);ACM[ID]=a;ACS.push(a);ACS.sort((x,y)=>x.r-y.r);
      }
      registered=true;
      return true;
    }catch(_){return false}
  }

  function mountUI(){
    const lock=byId('scRotateLock');
    if(!lock)return false;
    const card=lock.querySelector('.scRotateCard');
    if(!card)return false;
    if(!byId('scRotateRoast')){
      const roast=document.createElement('div');
      roast.id='scRotateRoast';
      roast.setAttribute('aria-live','polite');
      roast.textContent=ROASTS[0][1];
      const hint=card.querySelector('.scRotateHint');
      if(hint)card.insertBefore(roast,hint);else card.appendChild(roast);
    }
    if(!byId('scRotateAchievement')){
      const badge=document.createElement('div');
      badge.id='scRotateAchievement';
      badge.innerHTML='<span>🏆</span><div><small>CONQUISTA SECRETA DESBLOQUEADA</small><b>'+NAME+'</b></div>';
      card.appendChild(badge);
    }
    if(!byId('scRotateEggStyle')){
      const st=document.createElement('style');st.id='scRotateEggStyle';st.textContent=`
#scRotateRoast{width:min(350px,100%);padding:10px 12px;border-left:3px solid #ffd34f;border-radius:8px;background:rgba(255,211,79,.07);color:#ddd5f4;font:800 11px/1.4 var(--bd,system-ui);letter-spacing:.01em}
#scRotateAchievement{display:none;width:min(360px,100%);align-items:center;gap:10px;margin-top:3px;padding:11px 13px;border:1px solid rgba(255,211,79,.72);border-radius:12px;background:linear-gradient(180deg,rgba(83,59,14,.92),rgba(42,28,8,.96));box-shadow:inset 0 1px 0 rgba(255,255,255,.1),0 8px 24px rgba(0,0,0,.34);text-align:left}
#scRotateAchievement.on{display:flex;animation:scEggPop .35s ease-out both}
#scRotateAchievement>span{font-size:28px;filter:drop-shadow(0 2px 0 #000)}
#scRotateAchievement div{display:grid;gap:2px;min-width:0}
#scRotateAchievement small{font:900 8px/1.2 var(--px,system-ui);letter-spacing:.12em;color:#f4c94d}
#scRotateAchievement b{font:900 14px/1.15 var(--bd,system-ui);color:#fff5cf}
@keyframes scEggPop{from{opacity:0;transform:scale(.92) translateY(8px)}to{opacity:1;transform:none}}
@media(prefers-reduced-motion:reduce){#scRotateAchievement.on{animation:none!important}}
`;
      document.head.appendChild(st);
    }
    return true;
  }

  function currentStep(sec){let idx=0;for(let i=0;i<ROASTS.length;i++)if(sec>=ROASTS[i][0])idx=i;return idx}

  function showRoast(sec){
    if(!mountUI())return;
    const step=currentStep(sec);if(step===lastStep)return;lastStep=step;
    const el=byId('scRotateRoast');if(el)el.textContent=ROASTS[step][1];
  }

  function unlock(){
    if(unlockedThisSession)return;
    registerAchievement();
    let already=false;
    try{already=!!(typeof S!=='undefined'&&S.ach&&S.ach[ID])}catch(_){}
    if(!already){
      try{if(typeof ach==='function')ach(ID);else if(typeof S!=='undefined'){S.ach=S.ach||{};S.ach[ID]=Date.now();if(typeof sv==='function')sv()}}catch(_){}
      unlockedThisSession=true;
      const badge=byId('scRotateAchievement');if(badge)badge.classList.add('on');
      try{if(typeof sfx==='function')sfx('lvl')}catch(_){}
      try{if(typeof achUI==='function'&&typeof st!=='undefined'&&st==='ach')achUI()}catch(_){}
    }
  }

  function tick(){
    registerAchievement();mountUI();
    if(!portrait()){
      enteredAt=0;lastStep=-1;unlockedThisSession=false;
      const roast=byId('scRotateRoast');if(roast)roast.textContent=ROASTS[0][1];
      const badge=byId('scRotateAchievement');if(badge)badge.classList.remove('on');
      return;
    }
    if(!enteredAt)enteredAt=Date.now();
    const sec=Math.floor((Date.now()-enteredAt)/1000);
    showRoast(sec);
    if(sec>=60)unlock();
  }

  setInterval(tick,1000);
  addEventListener('resize',tick,{passive:true});
  addEventListener('orientationchange',()=>setTimeout(tick,180),{passive:true});
  setTimeout(tick,250);
  window.SCRotateEgg={id:ID,name:NAME,seconds:60,tick};
  console.log('[Mobile] Rotate easter egg enabled: secret achievement after 60s portrait.');
}catch(err){console.warn('[Mobile Rotate Egg]',err)}
})();
