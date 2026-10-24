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
#menu.scMenuV2 [data-sc-icon-only="1"]{font-size:0!important;letter-spacing:0!important;padding:4px!important}
#menu.scMenuV2 [data-sc-icon-only="1"]::before{content:attr(data-sc-menu-icon)!important;margin:0!important;font-family:system-ui,"Apple Color Emoji","Segoe UI Emoji",sans-serif!important;line-height:1!important}
#menu.scMenuV2 #achb[data-sc-icon-only="1"]::before{font-size:23px!important;filter:drop-shadow(0 2px 0 rgba(0,0,0,.35))}
#menu.scMenuV2 #snd[data-sc-icon-only="1"]::before{font-size:22px!important;color:#fff!important;text-shadow:none!important}
#menu.scMenuV2 .scMenuQuick{grid-template-columns:minmax(0,1fr) 54px minmax(0,1fr)!important}
#menu.scMenuV2 .scMenuPrefs{grid-template-columns:54px minmax(0,1fr)!important}
#menu.scMenuV2 #achb[data-sc-icon-only="1"]{min-width:54px!important;width:54px!important;min-height:46px!important;border-radius:13px!important}
#menu.scMenuV2 #snd[data-sc-icon-only="1"]{min-width:54px!important;width:54px!important;min-height:34px!important;border-radius:12px!important}
@media (orientation:portrait){
  #menu.scMenuV2 .scMenuHub{margin-top:clamp(10px,1.8vh,18px)!important;gap:7px!important;padding:10px!important}
  #menu.scMenuV2 #play{min-height:50px!important}
  #menu.scMenuV2 .scMenuQuick .btn{min-height:46px!important}
  #menu.scMenuV2 .scMenuSystems .btn{min-height:42px!important}
}
@media (orientation:landscape){
  #menu.scMenuV2 .scMenuQuick{grid-template-columns:minmax(0,1fr) 48px minmax(0,1fr)!important}
  #menu.scMenuV2 .scMenuPrefs{grid-template-columns:48px minmax(0,1fr)!important}
  #menu.scMenuV2 #achb[data-sc-icon-only="1"],#menu.scMenuV2 #snd[data-sc-icon-only="1"]{width:48px!important;min-width:48px!important}
  #menu.scMenuV2 .scMenuHub{border-radius:16px!important}
}
`;
    document.head.appendChild(st);
  }

  function iconize(el,icon,label,iconOnly=false){
    if(!el)return;
    el.dataset.scMenuIcon=icon;
    if(label){
      el.dataset.scMenuLabel=label;
      el.setAttribute('aria-label',label);
      el.title=label;
    }
    if(iconOnly)el.dataset.scIconOnly='1';
  }

  function syncStateIcons(){
    const snd=byId('snd');
    if(!snd)return;
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

    mb.dataset.scHubReady='1';
    mb.classList.add('scMenuHub');

    const prof=mb.querySelector('.prof'),stats=mb.querySelector('.row2'),ft=mb.querySelector('.ft');
    const account=document.createElement('section');account.className='scMenuAccount';
    if(prof)account.appendChild(prof);
    if(stats)account.appendChild(stats);

    const primary=document.createElement('section');primary.className='scMenuPrimary';primary.appendChild(play);

    const quick=document.createElement('section');quick.className='scMenuQuick';
    iconize(shop,'◈','SKINS');
    iconize(ach,'🏅','CONQUISTAS',true);
    iconize(hist,'↺','HISTÓRICO');
    quick.append(shop,ach,hist);

    const systems=document.createElement('section');systems.className='scMenuSystems';
    iconize(online,'◎','CONTA & ONLINE');iconize(econ,'◇','NÚCLEO & MERCADO');iconize(legacy,'⚔','ARSENAL & DESAFIOS');
    systems.append(online,econ,legacy);

    const prefs=document.createElement('section');prefs.className='scMenuPrefs';
    iconize(snd,'🔊','SOM LIGADO',true);iconize(trk,'🎵','MÚSICA');prefs.append(snd,trk);

    mb.replaceChildren(account,primary,quick,systems,prefs);
    if(ft)mb.appendChild(ft);
    menu.classList.add('scMenuV2');
    menu.dataset.scMenuLayout='responsive';

    syncStateIcons();
    if(!snd.dataset.scStateHook){
      snd.dataset.scStateHook='1';
      snd.addEventListener('click',()=>setTimeout(syncStateIcons,0));
    }
    return true;
  }

  function schedule(){
    if(queued)return;
    queued=requestAnimationFrame(()=>{queued=0;if(!mount())setTimeout(schedule,120)});
  }
  schedule();
  const mo=new MutationObserver(()=>{
    if(!byId('menu')?.querySelector('.mb')?.dataset.scHubReady)schedule();
    else syncStateIcons();
  });
  mo.observe(document.body,{childList:true,subtree:true});
  document.addEventListener('visibilitychange',()=>setTimeout(syncStateIcons,40));
  window.SCMainMenu={version:'2.1',mount,syncStateIcons};
  console.log('[Mobile] Main menu 2.1 enabled: compact portrait hub + landscape dashboard + icon controls.');
}catch(err){console.warn('[Mobile Main Menu]',err)}
})();
