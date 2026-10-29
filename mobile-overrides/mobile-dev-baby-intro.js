/* ©criado por Vitor Ag/Nyx - 2026 */
/* ©criado por Vitor Ag/Nyx - 2026 */
/* ©criado por Vitor Ag/Nyx - 2026 */
(()=>{
'use strict';
try{
  if(typeof DV==='undefined'||typeof CF==='undefined'||typeof MD==='undefined')return;

  const STYLE_ID='scBabyDevIntroStyle';
  if(!document.getElementById(STYLE_ID)){
    const stl=document.createElement('style');
    stl.id=STYLE_ID;
    stl.textContent=`
      #scBabyDevIntro{position:fixed;left:50%;top:max(18px,env(safe-area-inset-top));transform:translateX(-50%);z-index:9998;pointer-events:none;display:none;min-width:min(72vw,460px);max-width:86vw;text-align:center;font-family:inherit;color:#fff;text-shadow:0 3px 0 #090611,0 0 16px rgba(0,0,0,.8)}
      #scBabyDevIntro.on{display:block;animation:scDevFade .22s ease-out}
      #scBabyDevIntro .scdi-kicker{font-size:11px;font-weight:900;letter-spacing:.22em;opacity:.72;margin-bottom:5px}
      #scBabyDevIntro .scdi-title{font-size:clamp(24px,5.4vmin,48px);font-weight:1000;line-height:.95}
      #scBabyDevIntro .scdi-sub{margin-top:8px;font-size:clamp(12px,2.2vmin,17px);font-weight:900;letter-spacing:.06em}
      #scBabyDevIntro.shift .scdi-title{animation:scDevShift .48s cubic-bezier(.2,.8,.2,1)}
      #scBabyDevIntro .baby{color:#8ff7ff}#scBabyDevIntro .night{color:#ff315d}
      #scBabyDevIntro .arrow{display:inline-block;margin:0 .18em;color:#fff;animation:scDevArrow .5s ease-in-out infinite alternate}
      @keyframes scDevFade{from{opacity:0;transform:translate(-50%,-8px)}to{opacity:1;transform:translate(-50%,0)}}
      @keyframes scDevShift{0%{transform:scale(.88);filter:brightness(3)}60%{transform:scale(1.12)}100%{transform:scale(1)}}
      @keyframes scDevArrow{from{transform:translateX(-3px)}to{transform:translateX(3px)}}
      @media (prefers-reduced-motion:reduce){#scBabyDevIntro.on,#scBabyDevIntro.shift .scdi-title,#scBabyDevIntro .arrow{animation:none!important}}
    `;
    document.head.appendChild(stl);
  }

  let ui=document.getElementById('scBabyDevIntro');
  if(!ui){
    ui=document.createElement('div');ui.id='scBabyDevIntro';ui.setAttribute('aria-live','polite');
    ui.innerHTML='<div class="scdi-kicker">BOSS SECRETO</div><div class="scdi-title">DEV</div><div class="scdi-sub"></div>';
    document.body.appendChild(ui);
  }
  const title=ui.querySelector('.scdi-title'),sub=ui.querySelector('.scdi-sub'),kicker=ui.querySelector('.scdi-kicker');

  let active=null,raf=0,forcedFrom=null,damageRatio=1;
  const eligible=()=>CF.m===4&&CF.w===0&&CF.i&&(CF.g===0||CF.g===1);
  const face=(e,px,py,ex,ey)=>{
    if(!P||!e)return;
    P.x=px;P.y=py;P.vx=P.vy=0;P.ddx=P.ddy=0;P.a=Math.atan2(ey-py,ex-px);
    e.x=ex;e.y=ey;e.vx=e.vy=0;e.a=Math.atan2(py-ey,px-ex);
    try{if(typeof joy!=='undefined'){joy.on=0;joy.dx=joy.dy=joy.kx=joy.ky=0}}catch(_){}
  };
  const setCaption=(a,b,c)=>{kicker.textContent=a||'';title.innerHTML=b||'';sub.textContent=c||''};

  function forceNightmare(e){
    if(forcedFrom!==null)return;
    forcedFrom=4;
    const old=MD[4],night=MD[3];
    if(old&&night&&old[5]&&night[5]){
      damageRatio=night[5]/old[5];
      if(typeof PL!=='undefined'&&Array.isArray(PL)){for(const q of PL)if(q&&Number.isFinite(q.dmg))q.dmg*=damageRatio;}
      else if(P&&Number.isFinite(P.dmg))P.dmg*=damageRatio;
    }
    CF.m=3;MZ=MD[3];
    // Recalcula a primeira barra com o DPS já convertido para Pesadelo,
    // mantendo a duração-alvo original do boss sem herdar o bônus de dano do Baby.
    try{
      const dps=P.dmg*dx*P.cnt/(P.rate*(PW&&PW.fr>0?.5:1));
      const h=Math.max(15000,Math.round(dps*8));
      e.H0=h;e.bh=h;e.hp=e.mh=h;
    }catch(_){}
    ui.classList.add('shift');
    setCaption('DEV ALTEROU AS REGRAS','<span class="baby">BABY</span><span class="arrow">→</span><span class="night">PESADELO</span>','Agora vale de verdade.');
    try{flash=Math.max(flash||0,.95);shake=Math.max(shake||0,20);ban('DEV MUDOU A DIFICULDADE: PESADELO');sfx('boss')}catch(_){}
  }

  function restoreDifficulty(){
    if(forcedFrom===null)return;
    if(damageRatio&&damageRatio!==1){
      const inv=1/damageRatio;
      try{if(typeof PL!=='undefined'&&Array.isArray(PL)){for(const q of PL)if(q&&Number.isFinite(q.dmg))q.dmg*=inv;}else if(P&&Number.isFinite(P.dmg))P.dmg*=inv}catch(_){}
    }
    CF.m=forcedFrom;MZ=MD[forcedFrom];forcedFrom=null;damageRatio=1;
  }

  function finishIntro(e){
    if(!active)return;
    active=null;cancelAnimationFrame(raf);ui.classList.remove('on','shift');
    if(e){e.__scBabyDevIntroDone=1;e.inv=Math.max(e.inv||0,.75)}
    try{st='play';ban('PESADELO · LUTE');shake=Math.max(shake||0,10);sfx('boss2')}catch(_){}
  }

  function startIntro(e){
    if(!e||e.__scBabyDevIntro||!eligible())return;
    e.__scBabyDevIntro=1;
    const px=P.x,py=P.y,ex=px+Math.max(155,Math.min(205,190/(Math.max(.85,Math.min(1.3,Z||1))))),ey=py;
    active={e,px,py,ex,ey,t0:performance.now(),stage:-1};
    try{st='devi';const old=document.getElementById('devI');if(old)old.classList.remove('on')}catch(_){}
    ui.classList.remove('shift');ui.classList.add('on');
    setCaption('9.999 ABATES','DEV','...');

    const tick=now=>{
      if(!active||active.e!==e)return;
      const t=(now-active.t0)/1000;
      face(e,px,py,ex,ey);
      if(t<1.15){
        if(active.stage!==0){active.stage=0;setCaption('9.999 ABATES','DEV','O campo fica em silêncio.');}
      }else if(t<2.45){
        if(active.stage!==1){active.stage=1;setCaption('BOSS SECRETO','DEV','Os dois apenas se encaram.');}
      }else if(t<3.65){
        if(active.stage!==2){active.stage=2;forceNightmare(e);}
      }else if(t<4.35){
        if(active.stage!==3){active.stage=3;ui.classList.remove('shift');setCaption('DIFICULDADE FORÇADA','PESADELO','A luta começa agora.');}
      }else{finishIntro(e);return}
      raf=requestAnimationFrame(tick);
    };
    raf=requestAnimationFrame(tick);
  }

  function watch(){
    try{
      const e=DV.e;
      if(e&&!e.__scBabyDevIntro&&eligible())startIntro(e);
      if(forcedFrom!==null&&(!DV.e||st==='over'||st==='menu'||st==='setup')){
        ui.classList.remove('on','shift');active=null;cancelAnimationFrame(raf);restoreDifficulty();
      }
    }catch(err){console.warn('[Baby DEV Intro watch]',err)}
    requestAnimationFrame(watch);
  }
  requestAnimationFrame(watch);
  window.SCBabyDevIntro={version:'1.0'};
  console.log('[Mobile] Baby DEV intro enabled: face-off, forced Nightmare, then combat.');
}catch(err){console.warn('[Mobile Baby DEV Intro]',err)}
})();
