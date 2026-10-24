(() => {
'use strict';
try{
  const mq=matchMedia('(orientation: portrait)');
  let pausedByOrientation=false;

  function mount(){
    if(document.getElementById('scRotateLock'))return;
    const lock=document.createElement('div');
    lock.id='scRotateLock';
    lock.setAttribute('role','alert');
    lock.setAttribute('aria-live','assertive');
    lock.innerHTML=`<div class="scRotateCard"><div class="scRotatePhone" aria-hidden="true"><div></div></div><div class="scRotateArrow" aria-hidden="true">↻</div><small>MODO HORIZONTAL OBRIGATÓRIO</small><h1>GIRE O CELULAR</h1><p>Survive Chaos foi feito para jogar na horizontal.<br>Deite a tela para continuar.</p><div class="scRotateHint"><span></span> O jogo continua assim que a tela estiver deitada</div></div>`;
    document.body.appendChild(lock);
  }

  function portrait(){return mq.matches||innerHeight>innerWidth}

  function pauseForRotation(){
    try{
      if(typeof st!=='undefined'&&st==='play'){
        st='pause';
        if(typeof show==='function')show('pause');
        pausedByOrientation=true;
      }
    }catch(_){pausedByOrientation=false}
  }

  function resumeFromRotation(){
    if(!pausedByOrientation)return;
    try{
      if(typeof st!=='undefined'&&st==='pause'){
        if(typeof hide==='function')hide('pause');
        st='play';
      }
    }catch(_){ }
    pausedByOrientation=false;
  }

  function sync(){
    mount();
    const locked=portrait();
    document.documentElement.classList.toggle('scPortraitLocked',locked);
    document.body.classList.toggle('scPortraitLocked',locked);
    const el=document.getElementById('scRotateLock');
    if(el)el.setAttribute('aria-hidden',locked?'false':'true');
    if(locked)pauseForRotation();else resumeFromRotation();
  }

  mq.addEventListener?.('change',sync);
  addEventListener('resize',sync,{passive:true});
  addEventListener('orientationchange',()=>setTimeout(sync,80),{passive:true});
  document.addEventListener('visibilitychange',()=>setTimeout(sync,40));
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',sync,{once:true});else sync();

  window.SCOrientationLock={version:'1.0',sync,isPortrait:portrait};
  console.log('[Mobile] Landscape-only gameplay lock enabled.');
}catch(err){console.warn('[Mobile Orientation Lock]',err)}
})();
