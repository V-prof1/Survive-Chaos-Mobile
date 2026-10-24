(() => {
'use strict';
try{
  const ID='s_rotate_brain';
  const NAME='Idiota com pouco cérebro';
  const DESC='Passe 60 segundos ignorando uma instrução que literalmente manda girar o celular.';
  const ROASTS=[
    [15,'15 segundos. Gira a porra do celular. É literalmente só isso.'],
    [25,'25 segundos. Você é burro ou tá treinando? Deita o celular.'],
    [35,'35 segundos. Caralho, até agora? Seu QI deve estar brigando pra chegar nos dois dígitos.'],
    [45,'45 segundos. Você ainda não girou. Parabéns, imbecil.'],
    [55,'55 segundos. Você não tá distraído. Você só é extremamente dedicado a fazer merda.'],
    [60,'1 minuto. Você é oficialmente burro demais pra seguir uma instrução de três palavras. Toma sua conquista, campeão.']
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
      roast.textContent='';
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
#scRotateRoast{display:none;width:min(350px,100%);padding:10px 12px;border-left:3px solid #ffd34f;border-radius:8px;background:rgba(255,211,79,.07);color:#ddd5f4;font:800 11px/1.4 var(--bd,system-ui);letter-spacing:.01em}
#scRotateRoast.on{display:block}
#scRotateAchievement{display:none;width:min(360px,100%);align-items:center;gap:10px;margin-top:3px;padding:11px 13px;border:1px solid rgba(255,211,79,.72);border-radius:12px;background:linear-gradient(180deg,rgba(83,59,14,.92),rgba(42,28,8,.96));box-shadow:inset 0 1px 0 rgba(255,255,255,.1),0 8px 24px rgba(0,0,0,.34);text-align:left}
#scRotateAchievement.on{display:flex;animation:scEggPop .35s ease-out both}
#scRotateAchievement>span{font-size:28px;filter:drop-shadow(0 2px 0 #000)}
#scRotateAchievement div{display:grid;gap:2px;min-width:0}
#scRotateAchievement small{font:900 8px/1.2 var(--px,system-ui);letter-spacing:.12em;color:#f4c94d}
#scRotateAchievement b{font:900 14px/1.15 var(--bd,system-ui);color:#fff5cf}
@keyframes scEggPop{from{opacity:0;transform:scale(.92) translateY(8px)}to{opacity:1;transform:none}}
@media(prefers-reduced-motion:reduce){#scRotateAchievement.on{animation:none!important}}

/* Landscape menu balance: keep the dashboard composition, only normalize scale. */
@media (orientation:landscape){
  #menu.scMenuV2 #play{
    height:50px!important;
    min-height:50px!important;
    max-height:50px!important;
    padding:7px 12px!important;
    font-size:13px!important;
  }
  #menu.scMenuV2 .scMenuSystems{
    grid-template-rows:auto 48px 48px 48px!important;
    align-content:start!important;
  }
  #menu.scMenuV2 .scMenuSystems .btn,
  #menu.scMenuV2 #scOnlineBtn{
    height:48px!important;
    min-height:48px!important;
    max-height:48px!important;
    padding:6px 8px!important;
    font-size:8px!important;
    box-sizing:border-box!important;
  }
}
@media (orientation:landscape) and (max-height:390px){
  #menu.scMenuV2 #play{
    height:46px!important;
    min-height:46px!important;
    max-height:46px!important;
  }
  #menu.scMenuV2 .scMenuSystems{grid-template-rows:auto 42px 42px 42px!important}
  #menu.scMenuV2 .scMenuSystems .btn,
  #menu.scMenuV2 #scOnlineBtn{
    height:42px!important;
    min-height:42px!important;
    max-height:42px!important;
  }
}
`;
      document.head.appendChild(st);
    }
    return true;
  }

  function currentStep(sec){let idx=-1;for(let i=0;i<ROASTS.length;i++)if(sec>=ROASTS[i][0])idx=i;return idx}

  function showRoast(sec){
    if(!mountUI())return;
    const step=currentStep(sec),el=byId('scRotateRoast');
    if(!el)return;
    if(step<0){
      if(lastStep!==-1){el.textContent='';el.classList.remove('on');lastStep=-1}
      return;
    }
    if(step===lastStep)return;lastStep=step;
    el.textContent=ROASTS[step][1];el.classList.add('on');
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
      const roast=byId('scRotateRoast');if(roast){roast.textContent='';roast.classList.remove('on')}
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
  console.log('[Mobile] Rotate easter egg enabled: first roast at 15s, secret achievement after 60s portrait.');
}catch(err){console.warn('[Mobile Rotate Egg]',err)}
})();