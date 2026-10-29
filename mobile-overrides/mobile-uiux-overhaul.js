/* ©criado por Vitor Ag/Nyx - 2026 */
/* ©criado por Vitor Ag/Nyx - 2026 */
/* ©criado por Vitor Ag/Nyx - 2026 */
(() => {
'use strict';
try{
  const d=document,body=d.body;
  if(!body||body.classList.contains('scUIUX'))return;
  body.classList.add('scUIUX');

  const LABELS={
    play:'Jogar',shopb:'Abrir skins',achb:'Abrir conquistas',histb:'Abrir histórico',snd:'Alternar som',trk:'Alternar música',
    pz:'Pausar partida',dash:'Usar Dash',ult:'Usar Ultimate',dash1:'Usar Dash do jogador 2',ult1:'Usar Ultimate do jogador 2',
    resume:'Continuar partida',quit:'Sair da partida',again:'Jogar novamente',home:'Voltar ao menu',rr:'Rerrolar melhorias',
    sback:'Voltar',ach_back:'Voltar',hist_back:'Voltar',intro_b:'Começar partida'
  };

  function enhanceButton(el){
    if(!el||el.dataset.scUxReady)return;
    el.dataset.scUxReady='1';
    const id=el.id;
    if(LABELS[id]&&!el.getAttribute('aria-label'))el.setAttribute('aria-label',LABELS[id]);
    if(!el.getAttribute('type'))el.setAttribute('type','button');
  }

  function enhanceCard(el){
    if(!el||el.dataset.scUxCard)return;
    el.dataset.scUxCard='1';el.setAttribute('role','button');
    if(!el.hasAttribute('tabindex'))el.tabIndex=0;
    const b=el.querySelector('b');
    if(b&&!el.getAttribute('aria-label'))el.setAttribute('aria-label','Escolher '+b.textContent.trim());
  }

  function enhance(root=d){
    root.querySelectorAll?.('button').forEach(enhanceButton);
    root.querySelectorAll?.('.card').forEach(enhanceCard);
    root.querySelectorAll?.('.scr').forEach(s=>s.setAttribute('aria-hidden',s.classList.contains('on')?'false':'true'));
  }
  enhance();

  // Consistent press feedback. It intentionally does not reposition or resize gameplay controls.
  const pressSel='button,.card,.opt,.tog,.scPauseSetting';
  d.addEventListener('pointerdown',e=>{
    const el=e.target.closest&&e.target.closest(pressSel);if(!el||el.disabled)return;
    el.classList.add('scPressed');
    // Tiny tactile confirmation on Android. Non-blocking and ignored where unsupported.
    try{if(e.isTrusted&&navigator.vibrate&&el.matches('button,.card'))navigator.vibrate(el.id==='play'?10:5)}catch(_){}
  },{passive:true});
  const clearPressed=e=>{
    const el=e.target&&e.target.closest&&e.target.closest(pressSel);if(el)el.classList.remove('scPressed');
  };
  d.addEventListener('pointerup',clearPressed,{passive:true});
  d.addEventListener('pointercancel',clearPressed,{passive:true});
  d.addEventListener('pointerleave',clearPressed,{passive:true,capture:true});

  // Keyboard/controller-friendly upgrade cards for desktop testing and accessibility.
  d.addEventListener('keydown',e=>{
    if((e.key==='Enter'||e.key===' ')&&e.target&&e.target.classList&&e.target.classList.contains('card')){
      e.preventDefault();e.target.click();
    }
  });

  // Screen transitions get one consistent state class and preserve scroll predictably.
  let current=null;
  function syncScreen(){
    const on=d.querySelector('.scr.on');
    d.querySelectorAll('.scr').forEach(s=>s.setAttribute('aria-hidden',s===on?'false':'true'));
    if(on&&on!==current){
      if(current)current.classList.remove('scUxCurrent');
      current=on;on.classList.add('scUxCurrent');
      const focus=on.querySelector('button:not(:disabled),input:not(:disabled)');
      if(focus&&matchMedia('(pointer:fine)').matches)setTimeout(()=>{try{focus.focus({preventScroll:true})}catch(_){}},80);
    }
  }

  // HUD semantic states. These are cheap reads and make critical information visible without adding widgets.
  let low=false,lastHud=0;
  function hudTick(ts){
    if(ts-lastHud>120){
      lastHud=ts;
      try{
        const playing=typeof st!=='undefined'&&st==='play'&&typeof P!=='undefined'&&P;
        const next=!!(playing&&P.mhp>0&&P.hp/P.mhp<=.28);
        if(next!==low){low=next;body.classList.toggle('scLowHp',low)}
        const ult=d.getElementById('ult');
        if(ult){const ready=ult.classList.contains('rdy');ult.setAttribute('aria-label',ready?'Ultimate pronta':'Ultimate carregando')}
      }catch(_){}
    }
    requestAnimationFrame(hudTick);
  }
  requestAnimationFrame(hudTick);

  // Make status bars announce values to assistive tech without visual clutter.
  function syncMeters(){
    try{
      const hp=d.getElementById('hpt'),hpw=hp&&hp.closest('.hp');
      if(hpw&&hp){hpw.setAttribute('role','status');hpw.setAttribute('aria-label','Vida '+hp.textContent.trim())}
      const boss=d.getElementById('boss'),bn=d.getElementById('bn');
      if(boss&&bn&&getComputedStyle(boss).display!=='none')boss.setAttribute('aria-label','Boss '+bn.textContent.trim());
    }catch(_){}
  }
  setInterval(syncMeters,500);

  const mo=new MutationObserver(ms=>{
    let needScreen=false;
    for(const m of ms){
      if(m.type==='childList')for(const n of m.addedNodes)if(n.nodeType===1)enhance(n);
      if(m.type==='attributes'&&m.target.classList&&m.target.classList.contains('scr'))needScreen=true;
    }
    if(needScreen)syncScreen();
  });
  mo.observe(d.documentElement,{subtree:true,childList:true,attributes:true,attributeFilter:['class']});
  syncScreen();

  // Low-HP styling is intentionally subtle; no full-screen flashing.
  const style=d.createElement('style');
  style.textContent=`
    body.scUIUX.scLowHp #hud .hp:first-of-type{border-color:rgba(255,86,104,.72)!important;box-shadow:0 0 0 2px rgba(255,86,104,.08),0 0 18px rgba(255,60,80,.18)!important}
    body.scUIUX.scLowHp #hpf{filter:saturate(1.18) brightness(1.08)}
    body.scUIUX .scPressed{-webkit-transform:translateY(2px) scale(.985);transform:translateY(2px) scale(.985)}
  `;
  d.head.appendChild(style);

  window.SCUIUX={version:'11.0',enhance,syncScreen};
  console.log('[Mobile] UI/UX Overhaul 11.0 enabled.');
}catch(err){console.error('[UIUX 11.0]',err)}
})();
