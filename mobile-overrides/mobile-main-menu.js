(() => {
'use strict';
try{
  const byId=id=>document.getElementById(id);
  let queued=0,pausedByOrientation=false;

  function injectIconStyles(){
    if(byId('scMenuIconStyles'))return;
    const st=document.createElement('style');
    st.id='scMenuIconStyles';
    st.textContent=`
#menu.scMenuV2 .scMenuQuick{display:grid!important;grid-template-columns:repeat(5,minmax(0,1fr))!important;gap:6px!important;padding:7px!important;border:1px solid rgba(94,80,175,.38)!important;border-radius:15px!important;background:linear-gradient(180deg,rgba(27,22,59,.78),rgba(16,13,38,.86))!important}
#menu.scMenuV2 .scMenuQuick::before{content:'ATALHOS';grid-column:1/-1;margin:0 2px -1px;color:#77709d;font:8px var(--px);letter-spacing:.16em}
#menu.scMenuV2 .scMenuQuick .btn[data-sc-icon-only="1"]{min-width:0!important;width:100%!important;min-height:50px!important;padding:5px 2px!important;border-radius:12px!important;font-size:0!important;letter-spacing:0!important;display:flex!important;align-items:center!important;justify-content:center!important}
#menu.scMenuV2 .scMenuQuick .btn[data-sc-icon-only="1"]::before{content:attr(data-sc-menu-icon)!important;margin:0!important;font:24px/1 system-ui,"Apple Color Emoji","Segoe UI Emoji",sans-serif!important;color:#fff!important;text-shadow:none!important;filter:drop-shadow(0 2px 0 rgba(0,0,0,.38))}
#menu.scMenuV2 #shopb[data-sc-icon-only="1"]::before{font-size:23px!important}
#menu.scMenuV2 #achb[data-sc-icon-only="1"]::before{font-size:25px!important}
#menu.scMenuV2 #histb[data-sc-icon-only="1"]::before{font-size:23px!important}
#menu.scMenuV2 #snd[data-sc-icon-only="1"]::before{font-size:24px!important}
#menu.scMenuV2 #trk[data-sc-icon-only="1"]::before{font-size:23px!important}
#menu.scMenuV2 .scMenuPrefs{display:none!important}
#menu.scMenuV2 .scMenuSystems{grid-template-columns:1fr!important;gap:7px!important}
#menu.scMenuV2 .scMenuSystems .btn{min-height:43px!important;font-size:9px!important;border-radius:11px!important}
#menu.scMenuV2 #scOnlineBtn{grid-column:auto!important}

#scRotateLock{display:none;position:fixed;inset:0;z-index:2147483646;align-items:center;justify-content:center;padding:max(24px,env(safe-area-inset-top)) max(22px,env(safe-area-inset-right)) max(24px,env(safe-area-inset-bottom)) max(22px,env(safe-area-inset-left));background:radial-gradient(circle at 50% 20%,rgba(53,43,112,.97),rgba(12,9,31,.995) 55%,#080618 100%);color:#fff;text-align:center;touch-action:none;overscroll-behavior:none}
.scPortraitLocked #scRotateLock{display:flex!important}
.scPortraitLocked body{overflow:hidden!important}
#scRotateLock .scRotateCard{width:min(430px,92vw);display:flex;flex-direction:column;align-items:center;gap:10px;padding:28px 24px 24px;border:1px solid rgba(130,112,232,.55);border-radius:24px;background:linear-gradient(180deg,rgba(25,20,59,.94),rgba(12,9,32,.97));box-shadow:inset 0 1px 0 rgba(255,255,255,.06),0 24px 70px rgba(0,0,0,.48)}
#scRotateLock .scRotatePhone{width:72px;height:118px;border:5px solid #f5e7ff;border-radius:16px;display:grid;place-items:center;box-shadow:0 0 0 4px rgba(93,76,177,.5),0 10px 26px rgba(0,0,0,.38);animation:scRotatePhone 1.8s ease-in-out infinite}
#scRotateLock .scRotatePhone div{width:30px;height:5px;border-radius:999px;background:#f7ca46;align-self:end;margin-bottom:8px}
#scRotateLock .scRotateArrow{font:700 34px/1 system-ui,sans-serif;color:#ffd24d;margin-top:-6px;animation:scRotateArrow 1.8s ease-in-out infinite}
#scRotateLock small{font:800 10px/1.2 var(--px,system-ui);letter-spacing:.18em;color:#9d93ca;margin-top:4px}
#scRotateLock h1{margin:0;font:900 clamp(34px,10vw,52px)/.98 var(--px,system-ui);letter-spacing:.02em;color:#ffd34f;text-shadow:3px 3px 0 #e35b3d,6px 6px 0 #090616}
#scRotateLock p{margin:4px 0 0;max-width:330px;font:700 14px/1.45 var(--bd,system-ui);color:#c8c0e7}
#scRotateLock .scRotateHint{margin-top:8px;padding:9px 12px;border:1px solid rgba(80,221,194,.32);border-radius:999px;background:rgba(25,73,71,.25);font:800 10px/1.2 var(--bd,system-ui);color:#77e8d3;letter-spacing:.02em}
#scRotateLock .scRotateHint span{display:inline-block;width:7px;height:7px;margin-right:5px;border-radius:50%;background:#4be1c4;box-shadow:0 0 12px #4be1c4;animation:scRotatePulse 1.2s ease-in-out infinite}
@keyframes scRotatePhone{0%,20%{transform:rotate(0deg)}65%,100%{transform:rotate(90deg)}}
@keyframes scRotateArrow{0%,20%{transform:rotate(0);opacity:.65}65%,100%{transform:rotate(90deg);opacity:1}}
@keyframes scRotatePulse{50%{opacity:.35;transform:scale(.72)}}
@media (prefers-reduced-motion:reduce){#scRotateLock .scRotatePhone,#scRotateLock .scRotateArrow,#scRotateLock .scRotateHint span{animation:none!important}.scPortraitLocked #scRotateLock .scRotatePhone{transform:rotate(90deg)}}
@media (orientation:landscape){#scRotateLock{display:none!important}}

@media (orientation:portrait){
  #menu.scMenuV2{justify-content:flex-start!important;padding-top:max(18px,env(safe-area-inset-top))!important;padding-bottom:max(18px,env(safe-area-inset-bottom))!important}
  #menu.scMenuV2 .mt{margin-top:0!important;gap:5px!important}
  #menu.scMenuV2 .logo-e img{width:clamp(31px,6.8vw,43px)!important}
  #menu.scMenuV2 h1{font-size:clamp(42px,9.6vw,61px)!important}
  #menu.scMenuV2 .mt .sub{font-size:11px!important;max-width:300px!important}
  #menu.scMenuV2 .scMenuHub{width:min(470px,94vw)!important;min-height:clamp(560px,56dvh,760px)!important;margin-top:clamp(10px,1.7vh,18px)!important;padding:11px!important;gap:10px!important;display:grid!important;grid-template-rows:auto auto auto minmax(170px,1fr) auto!important;align-content:stretch!important;border-radius:22px!important}
  #menu.scMenuV2 .scMenuAccount{align-self:start!important}
  #menu.scMenuV2 .scMenuPrimary{align-self:start!important}
  #menu.scMenuV2 #play{min-height:50px!important}
  #menu.scMenuV2 .scMenuQuick{align-self:start!important}
  #menu.scMenuV2 .scMenuQuick .btn[data-sc-icon-only="1"]{min-height:48px!important}
  #menu.scMenuV2 .scMenuSystems{grid-template-columns:1fr!important;grid-template-rows:auto repeat(3,minmax(42px,1fr))!important;align-self:stretch!important;align-content:stretch!important;gap:9px!important}
  #menu.scMenuV2 .scMenuSystems::before{grid-column:auto!important;margin-bottom:-2px!important}
  #menu.scMenuV2 .scMenuSystems .btn{min-height:44px!important;height:100%!important;padding:8px 10px!important;font-size:9px!important}
  #menu.scMenuV2 #scOnlineBtn{grid-column:auto!important}
  #menu.scMenuV2 .ft{align-self:end!important;padding-top:2px!important;font-size:7px!important;opacity:.78}
}
@media (orientation:portrait) and (min-height:900px){#menu.scMenuV2 .scMenuHub{min-height:60dvh!important}#menu.scMenuV2 .scMenuSystems{gap:11px!important}#menu.scMenuV2 .scMenuSystems .btn{min-height:48px!important}}
@media (orientation:portrait) and (max-width:380px){#menu.scMenuV2 .scMenuHub{width:96vw!important;min-height:55dvh!important;padding:9px!important;gap:8px!important}#menu.scMenuV2 .scMenuQuick{gap:4px!important;padding:6px!important}#menu.scMenuV2 .scMenuQuick .btn[data-sc-icon-only="1"]{min-height:44px!important}#menu.scMenuV2 .scMenuQuick .btn[data-sc-icon-only="1"]::before{font-size:21px!important}#menu.scMenuV2 .scMenuSystems{gap:7px!important}}
@media (orientation:portrait) and (max-height:760px){#menu.scMenuV2 .logo-e{display:none!important}#menu.scMenuV2 h1{font-size:42px!important}#menu.scMenuV2 .mt .sub{display:none!important}#menu.scMenuV2 .scMenuHub{min-height:auto!important;margin-top:8px!important;grid-template-rows:auto auto auto auto auto!important}#menu.scMenuV2 .scMenuSystems .btn{height:auto!important;min-height:40px!important}}

@media (orientation:landscape){
  #menu.scMenuV2 .scMenuHub{border-radius:16px!important;grid-template-areas:'account account' 'primary systems' 'quick systems' 'foot foot'!important}
  #menu.scMenuV2 .scMenuQuick{align-self:end!important;grid-template-columns:repeat(5,minmax(0,1fr))!important;padding:6px!important}
  #menu.scMenuV2 .scMenuQuick::before{display:none!important}
  #menu.scMenuV2 .scMenuQuick .btn[data-sc-icon-only="1"]{min-height:42px!important}
  #menu.scMenuV2 .scMenuQuick .btn[data-sc-icon-only="1"]::before{font-size:21px!important}
  #menu.scMenuV2 .scMenuSystems{grid-template-columns:1fr!important;align-content:stretch!important}
}
`;
    document.head.appendChild(st);
  }

  function mountRotateLock(){
    if(byId('scRotateLock'))return;
    const lock=document.createElement('div');
    lock.id='scRotateLock';
    lock.setAttribute('role','alert');
    lock.setAttribute('aria-live','assertive');
    lock.innerHTML='<div class="scRotateCard"><div class="scRotatePhone" aria-hidden="true"><div></div></div><div class="scRotateArrow" aria-hidden="true">↻</div><small>MODO HORIZONTAL OBRIGATÓRIO</small><h1>GIRE O CELULAR</h1><p>Survive Chaos foi feito para jogar na horizontal.<br>Deite a tela para continuar.</p><div class="scRotateHint"><span></span> O jogo continua assim que a tela estiver deitada</div></div>';
    document.body.appendChild(lock);
  }

  function portrait(){return innerHeight>innerWidth}
  function syncOrientation(){
    mountRotateLock();
    const locked=portrait();
    document.documentElement.classList.toggle('scPortraitLocked',locked);
    document.body.classList.toggle('scPortraitLocked',locked);
    const el=byId('scRotateLock');if(el)el.setAttribute('aria-hidden',locked?'false':'true');
    try{
      if(locked&&typeof st!=='undefined'&&st==='play'){
        st='pause';if(typeof show==='function')show('pause');pausedByOrientation=true;
      }else if(!locked&&pausedByOrientation&&typeof st!=='undefined'&&st==='pause'){
        if(typeof hide==='function')hide('pause');st='play';pausedByOrientation=false;
      }else if(!locked){pausedByOrientation=false}
    }catch(_){ }
  }

  function iconize(el,icon,label,iconOnly=false){
    if(!el)return;
    el.dataset.scMenuIcon=icon;
    if(label){el.dataset.scMenuLabel=label;el.setAttribute('aria-label',label);el.title=label}
    if(iconOnly)el.dataset.scIconOnly='1';
  }

  function syncStateIcons(){
    const snd=byId('snd');if(!snd)return;
    const muted=typeof S!=='undefined'&&!!S.mute;
    snd.dataset.scMenuIcon=muted?'🔈':'🔊';
    snd.dataset.scMenuLabel=muted?'SOM DESLIGADO':'SOM LIGADO';
    snd.setAttribute('aria-label',muted?'Som desligado':'Som ligado');
    snd.title=muted?'Som desligado':'Som ligado';
  }

  function mount(){
    injectIconStyles();mountRotateLock();syncOrientation();
    const menu=byId('menu'),mb=menu&&menu.querySelector('.mb');
    if(!menu||!mb||mb.dataset.scHubReady)return false;
    const play=byId('play'),shop=byId('shopb'),ach=byId('achb'),hist=byId('histb'),snd=byId('snd'),trk=byId('trk');
    const online=byId('scOnlineBtn'),econ=byId('econBtn'),legacy=byId('legacyBtn');
    if(!play||!shop||!ach||!hist||!snd||!trk||!online||!econ||!legacy)return false;

    mb.dataset.scHubReady='1';mb.classList.add('scMenuHub');
    const prof=mb.querySelector('.prof'),stats=mb.querySelector('.row2'),ft=mb.querySelector('.ft');
    const account=document.createElement('section');account.className='scMenuAccount';
    if(prof)account.appendChild(prof);if(stats)account.appendChild(stats);
    const primary=document.createElement('section');primary.className='scMenuPrimary';primary.appendChild(play);
    const quick=document.createElement('section');quick.className='scMenuQuick';
    iconize(shop,'🎭','SKINS',true);iconize(ach,'🏅','CONQUISTAS',true);iconize(hist,'🕘','HISTÓRICO',true);iconize(snd,'🔊','SOM LIGADO',true);iconize(trk,'🎵','MÚSICA',true);
    quick.append(shop,ach,hist,snd,trk);
    const systems=document.createElement('section');systems.className='scMenuSystems';
    iconize(online,'🌐','CONTA & ONLINE');iconize(econ,'◇','NÚCLEO & MERCADO');iconize(legacy,'⚔','ARSENAL & DESAFIOS');
    systems.append(online,econ,legacy);
    const prefs=document.createElement('section');prefs.className='scMenuPrefs';
    mb.replaceChildren(account,primary,quick,systems,prefs);if(ft)mb.appendChild(ft);
    menu.classList.add('scMenuV2');menu.dataset.scMenuLayout='responsive';
    syncStateIcons();
    if(!snd.dataset.scStateHook){snd.dataset.scStateHook='1';snd.addEventListener('click',()=>setTimeout(syncStateIcons,0))}
    return true;
  }

  function schedule(){if(queued)return;queued=requestAnimationFrame(()=>{queued=0;if(!mount())setTimeout(schedule,120)})}
  schedule();
  const mo=new MutationObserver(()=>{if(!byId('menu')?.querySelector('.mb')?.dataset.scHubReady)schedule();else syncStateIcons()});
  mo.observe(document.body,{childList:true,subtree:true});
  addEventListener('resize',syncOrientation,{passive:true});
  addEventListener('orientationchange',()=>setTimeout(syncOrientation,80),{passive:true});
  document.addEventListener('visibilitychange',()=>{setTimeout(syncStateIcons,40);setTimeout(syncOrientation,40)});
  window.SCMainMenu={version:'2.1',mount,syncStateIcons,syncOrientation};
  window.SCOrientationLock={version:'1.0',sync:syncOrientation,isPortrait:portrait};
  console.log('[Mobile] Main menu enabled: landscape dashboard + portrait lock screen.');
}catch(err){console.warn('[Mobile Main Menu]',err)}
})();
