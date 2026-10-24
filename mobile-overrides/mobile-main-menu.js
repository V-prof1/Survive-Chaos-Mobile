(() => {
'use strict';
try{
  const byId=id=>document.getElementById(id);
  let queued=0;

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
@media (orientation:portrait){
  #menu.scMenuV2 .scMenuHub{margin-top:clamp(8px,1.4vh,14px)!important;gap:7px!important;padding:9px!important}
  #menu.scMenuV2 #play{min-height:49px!important}
  #menu.scMenuV2 .scMenuQuick .btn[data-sc-icon-only="1"]{min-height:48px!important}
  #menu.scMenuV2 .scMenuSystems{grid-template-columns:1fr 1fr!important}
  #menu.scMenuV2 #scOnlineBtn{grid-column:1/-1!important}
}
@media (orientation:portrait) and (max-width:380px){
  #menu.scMenuV2 .scMenuQuick{gap:4px!important;padding:6px!important}
  #menu.scMenuV2 .scMenuQuick .btn[data-sc-icon-only="1"]{min-height:44px!important}
  #menu.scMenuV2 .scMenuQuick .btn[data-sc-icon-only="1"]::before{font-size:21px!important}
}
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
    injectIconStyles();
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
    iconize(shop,'🎭','SKINS',true);
    iconize(ach,'🏅','CONQUISTAS',true);
    iconize(hist,'🕘','HISTÓRICO',true);
    iconize(snd,'🔊','SOM LIGADO',true);
    iconize(trk,'🎵','MÚSICA',true);
    quick.append(shop,ach,hist,snd,trk);

    const systems=document.createElement('section');systems.className='scMenuSystems';
    iconize(online,'🌐','CONTA & ONLINE');iconize(econ,'◇','NÚCLEO & MERCADO');iconize(legacy,'⚔','ARSENAL & DESAFIOS');
    systems.append(online,econ,legacy);

    const prefs=document.createElement('section');prefs.className='scMenuPrefs';
    mb.replaceChildren(account,primary,quick,systems,prefs);
    if(ft)mb.appendChild(ft);
    menu.classList.add('scMenuV2');menu.dataset.scMenuLayout='responsive';

    syncStateIcons();
    if(!snd.dataset.scStateHook){snd.dataset.scStateHook='1';snd.addEventListener('click',()=>setTimeout(syncStateIcons,0))}
    return true;
  }

  function schedule(){if(queued)return;queued=requestAnimationFrame(()=>{queued=0;if(!mount())setTimeout(schedule,120)})}
  schedule();
  const mo=new MutationObserver(()=>{if(!byId('menu')?.querySelector('.mb')?.dataset.scHubReady)schedule();else syncStateIcons()});
  mo.observe(document.body,{childList:true,subtree:true});
  document.addEventListener('visibilitychange',()=>setTimeout(syncStateIcons,40));
  window.SCMainMenu={version:'2.1',mount,syncStateIcons};
  console.log('[Mobile] Main menu 2.1 enabled: five-icon shortcut dock + portrait/landscape layouts.');
}catch(err){console.warn('[Mobile Main Menu]',err)}
})();
