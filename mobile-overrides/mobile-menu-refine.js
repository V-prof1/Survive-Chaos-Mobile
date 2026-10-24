(() => {
'use strict';
try{
  if(typeof S==='undefined')return;
  const defaults={gfx:'auto',shake:1,flash:1,compactHud:0,haptic:1};
  S.uiPrefs=Object.assign({},defaults,S.uiPrefs||{});
  const save=()=>{try{sv()}catch(_){}};
  const gfxModes=['auto','high','balanced','performance'];
  const gfxLabel={auto:'AUTO',high:'ALTA',balanced:'EQUILIBRADA',performance:'DESEMPENHO'};
  function applyGraphics(resetAuto=false){
    const m=S.uiPrefs.gfx;let nl=LQ,nd=DC;
    if(m==='high'){nl=0;nd=1.75}
    else if(m==='balanced'){nl=1;nd=1.35}
    else if(m==='performance'){nl=3;nd=1}
    else if(m==='auto'){if(!resetAuto)return;nl=0;nd=1.75}
    const changed=nl!==LQ||Math.abs(nd-DC)>.001;LQ=nl;DC=nd;
    if(changed)try{rs()}catch(_){}
  }
  function cycleGfx(){const i=gfxModes.indexOf(S.uiPrefs.gfx);S.uiPrefs.gfx=gfxModes[(i+1)%gfxModes.length];applyGraphics(true);save();refreshPause()}
  function toggle(key){S.uiPrefs[key]=S.uiPrefs[key]?0:1;save();applyPrefs();refreshPause()}
  function applyPrefs(){
    document.body.classList.toggle('scHudCompact',!!S.uiPrefs.compactHud);
    document.body.classList.toggle('scNoFlash',!S.uiPrefs.flash);
    if(!S.uiPrefs.shake&&typeof shake==='number')shake=0;
  }
  function haptic(){if(S.uiPrefs.haptic&&navigator.vibrate)try{navigator.vibrate(8)}catch(_){}}
  function musicName(){try{return S.trk&&typeof SG!=='undefined'&&SG[S.trk-1]?SG[S.trk-1].n:'Automática'}catch(_){return'Automática'}}
  function cycleMusic(){try{S.trk=((S.trk||0)+1)%((typeof SG!=='undefined'?SG.length:0)+1);if(typeof mst!=='undefined')mst=0;save();if(typeof au==='function')au();if(typeof trk==='function')trk();if(typeof sfx==='function')sfx('ui')}catch(_){}refreshPause()}
  function toggleSound(){S.mute=S.mute?0:1;save();try{if(typeof vol==='function')vol();if(!S.mute&&typeof au==='function')au()}catch(_){}refreshPause()}

  function statusText(){
    try{const mode=typeof MN!=='undefined'?MN[CF.g||0].replace(/^\S+\s/,''):'Partida',dif=typeof MD!=='undefined'?MD[CF.m||0][0]:'Médio',bio=typeof BI!=='undefined'?BI[bi||0][0]:'Bioma';return mode+' · '+dif+' · '+bio}catch(_){return'Partida em andamento'}
  }
  function makeSetting(icon,title,id,action){
    const b=document.createElement('button');b.type='button';b.className='scPauseSetting';b.id=id;b.dataset.scButtonRefined='1';b.innerHTML='<span class="scSetIcon">'+icon+'</span><span class="scSetCopy"><small>'+title+'</small><b></b></span><i></i>';b.onclick=()=>{haptic();action()};return b
  }
  let nodes={};
  function mountPause(){
    const root=document.querySelector('#pause .panel');if(!root||root.dataset.scRefined)return;
    root.dataset.scRefined='1';root.classList.add('scPausePanel');
    const resume=document.getElementById('resume'),quit=document.getElementById('quit');if(!resume||!quit)return;
    resume.classList.add('scResume');quit.classList.add('scQuit');
    root.innerHTML='';
    const head=document.createElement('div');head.className='scPauseHead';head.innerHTML='<div><small>PARTIDA PAUSADA</small><h2>PAUSA</h2></div><div id="scPauseStatus"></div>';root.appendChild(head);
    root.appendChild(resume);
    const sec=document.createElement('div');sec.className='scPauseSec';sec.innerHTML='<div class="scPauseSecTitle"><b>CONFIGURAÇÕES</b><span>Aplicadas na hora</span></div>';const grid=document.createElement('div');grid.className='scPauseGrid';sec.appendChild(grid);
    nodes.sound=makeSetting('🔊','Som','scSetSound',toggleSound);grid.appendChild(nodes.sound);
    nodes.music=makeSetting('🎵','Música','scSetMusic',cycleMusic);grid.appendChild(nodes.music);
    nodes.gfx=makeSetting('✨','Gráficos','scSetGfx',cycleGfx);grid.appendChild(nodes.gfx);
    nodes.shake=makeSetting('📳','Tremor','scSetShake',()=>toggle('shake'));grid.appendChild(nodes.shake);
    nodes.flash=makeSetting('⚡','Flashes','scSetFlash',()=>toggle('flash'));grid.appendChild(nodes.flash);
    nodes.hud=makeSetting('◫','HUD','scSetHud',()=>toggle('compactHud'));grid.appendChild(nodes.hud);
    nodes.haptic=makeSetting('✦','Resposta tátil','scSetHaptic',()=>toggle('haptic'));grid.appendChild(nodes.haptic);
    root.appendChild(sec);
    const foot=document.createElement('div');foot.className='scPauseFoot';foot.appendChild(quit);root.appendChild(foot);
    refreshPause();
  }
  function setText(el,value){if(el&&el.textContent!==value)el.textContent=value}
  function setNode(el,value,on=true){if(!el)return;const b=el.querySelector('.scSetCopy b');setText(b,value);el.classList.toggle('on',!!on)}
  function refreshPause(){
    const st=document.getElementById('scPauseStatus');setText(st,statusText());
    setNode(nodes.sound,S.mute?'DESLIGADO':'LIGADO',!S.mute);
    setNode(nodes.music,musicName(),true);
    setNode(nodes.gfx,gfxLabel[S.uiPrefs.gfx]||'AUTO',S.uiPrefs.gfx!=='performance');
    setNode(nodes.shake,S.uiPrefs.shake?'LIGADO':'DESLIGADO',!!S.uiPrefs.shake);
    setNode(nodes.flash,S.uiPrefs.flash?'LIGADOS':'REDUZIDOS',!!S.uiPrefs.flash);
    setNode(nodes.hud,S.uiPrefs.compactHud?'COMPACTO':'COMPLETO',!S.uiPrefs.compactHud);
    setNode(nodes.haptic,S.uiPrefs.haptic?'LIGADA':'DESLIGADA',!!S.uiPrefs.haptic);
  }

  function decorateButtons(){
    document.querySelectorAll('.scr button').forEach(b=>{
      if(['dash','ult','dash1','ult1','run','run1'].includes(b.id)||b.dataset.scButtonRefined)return;
      b.dataset.scButtonRefined='1';
      b.addEventListener('pointerdown',()=>{b.classList.add('scPressed');haptic()},{passive:true});
      ['pointerup','pointercancel','pointerleave'].forEach(ev=>b.addEventListener(ev,()=>b.classList.remove('scPressed'),{passive:true}));
    });
  }

  // Never refresh pause text from the MutationObserver itself. Text writes inside an
  // observer callback can create an endless microtask loop in Android WebView.
  let domQueued=0;
  const syncDom=()=>{domQueued=0;decorateButtons();mountPause()};
  const mo=new MutationObserver(()=>{if(!domQueued)domQueued=requestAnimationFrame(syncDom)});
  mo.observe(document.body,{childList:true,subtree:true});

  decorateButtons();mountPause();applyGraphics(false);applyPrefs();
  setInterval(()=>{
    if(S.uiPrefs.gfx!=='auto')applyGraphics(false);
    if(!S.uiPrefs.shake&&typeof shake==='number')shake=0;
    if(!S.uiPrefs.flash&&typeof flash==='number'&&flash>.22)flash=.22;
    const pause=document.getElementById('pause');
    if(pause&&(pause.classList.contains('on')||getComputedStyle(pause).display!=='none'))refreshPause();
  },700);
  document.addEventListener('visibilitychange',()=>setTimeout(refreshPause,40));
  document.addEventListener('pointerdown',e=>{if(e.target&&e.target.closest&&e.target.closest('#pz'))setTimeout(refreshPause,0)},{passive:true,capture:true});
  window.SCMenuRefine={version:'1.2',applyPrefs,refreshPause,cycleGfx};
  console.log('[Mobile] Menu controls refined and pause settings enabled · touch-loop fix 1.2.');
}catch(err){console.warn('[Mobile Menu Refine]',err)}
})();

/* Main Menu 2.0 — move the real buttons, preserving their original handlers. */
(() => {
'use strict';
try{
  const byId=id=>document.getElementById(id);
  let queued=0;
  function iconize(el,icon){if(el)el.dataset.scMenuIcon=icon}
  function mountMainMenu(){
    const menu=byId('menu'),mb=menu&&menu.querySelector('.mb');
    if(!menu||!mb||mb.dataset.scHubReady)return !!(mb&&mb.dataset.scHubReady);
    const play=byId('play'),shop=byId('shopb'),ach=byId('achb'),hist=byId('histb'),snd=byId('snd'),trk=byId('trk');
    const online=byId('scOnlineBtn'),econ=byId('econBtn'),legacy=byId('legacyBtn');
    if(!play||!shop||!ach||!hist||!snd||!trk||!online||!econ||!legacy)return false;

    const prof=mb.querySelector('.prof'),stats=mb.querySelector('.row2'),ft=mb.querySelector('.ft');
    mb.dataset.scHubReady='1';mb.classList.add('scMenuHub');menu.classList.add('scMenuV2');

    const account=document.createElement('section');account.className='scMenuAccount';if(prof)account.appendChild(prof);if(stats)account.appendChild(stats);
    const primary=document.createElement('section');primary.className='scMenuPrimary';primary.appendChild(play);
    const quick=document.createElement('section');quick.className='scMenuQuick';iconize(shop,'◈');iconize(ach,'★');iconize(hist,'↺');quick.append(shop,ach,hist);
    const systems=document.createElement('section');systems.className='scMenuSystems';iconize(online,'◎');iconize(econ,'◇');iconize(legacy,'⚔');systems.append(online,econ,legacy);
    const prefs=document.createElement('section');prefs.className='scMenuPrefs';iconize(snd,'♪');iconize(trk,'♫');prefs.append(snd,trk);

    mb.replaceChildren(account,primary,quick,systems,prefs);
    if(ft)mb.appendChild(ft);
    console.log('[Mobile] Main Menu 2.0 compact hub mounted.');
    return true;
  }
  function schedule(){if(queued)return;queued=requestAnimationFrame(()=>{queued=0;if(!mountMainMenu())setTimeout(schedule,120)})}
  schedule();
  const obs=new MutationObserver(()=>{const mb=document.querySelector('#menu .mb');if(mb&&!mb.dataset.scHubReady)schedule()});
  obs.observe(document.body,{childList:true,subtree:true});
  window.SCMainMenu={version:'2.0',mount:mountMainMenu};
}catch(err){console.warn('[Mobile Main Menu]',err)}
})();
