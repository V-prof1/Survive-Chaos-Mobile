/* ©criado por Vitor Ag/Nyx - 2026 */
/* ©criado por Vitor Ag/Nyx - 2026 */
/* ©criado por Vitor Ag/Nyx - 2026 */
(() => {
'use strict';
try{
  if(typeof S==='undefined')return;
  const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
  const PROFILE_KEY='hudLayoutV2';
  const TARGETS=[
    {key:'xp',label:'Barra de XP',sel:'#xpb',icon:'XP'},
    {key:'vitals',label:'Vida · nível · moedas',sel:'#hud .pl',icon:'♥'},
    {key:'clock',label:'Tempo',sel:'#tm',icon:'◷'},
    {key:'pause',label:'Pausa',sel:'#pz',icon:'Ⅱ',control:1},
    {key:'stats',label:'Abates · pontos',sel:'#scPortraitStats',icon:'★'},
    {key:'combo',label:'Combo',sel:'#proCombat',icon:'×'},
    {key:'mission',label:'Missão',sel:'#ms',icon:'◎'},
    {key:'boss',label:'Boss',sel:'#boss',icon:'☠'},
    {key:'phase',label:'Fase do boss',sel:'#proBossPhase',icon:'III'},
    {key:'announce',label:'Avisos de combate',sel:'#proAnnouncer',icon:'!'},
    {key:'banner',label:'Avisos do jogo',sel:'#ban',icon:'⚠'},
    {key:'dash',label:'Dash',sel:'#dash',icon:'D',control:1},
    {key:'ult',label:'ULT',sel:'#ult',icon:'U',control:1},
    {key:'run',label:'Run',sel:'#run',icon:'R',control:1},
    {key:'dash2',label:'Dash P2',sel:'#dash1',icon:'D2',control:1},
    {key:'ult2',label:'ULT P2',sel:'#ult1',icon:'U2',control:1},
    {key:'run2',label:'Run P2',sel:'#run1',icon:'R2',control:1},
    {key:'quick',label:'Ação rápida',sel:'#qa',icon:'Q',control:1}
  ];
  const DEFAULT_POS={
    portrait:{xp:[.5,.012],vitals:[.28,.075],clock:[.73,.055],pause:[.93,.055],stats:[.82,.13],combo:[.5,.19],mission:[.5,.25],boss:[.5,.31],phase:[.87,.25],announce:[.5,.30],banner:[.5,.40],dash:[.86,.89],ult:[.64,.89],run:[.50,.89],dash2:[.14,.89],ult2:[.36,.89],run2:[.50,.79],quick:[.08,.93]},
    landscape:{xp:[.5,.015],vitals:[.16,.10],clock:[.50,.07],pause:[.95,.08],stats:[.50,.14],combo:[.50,.12],mission:[.50,.20],boss:[.50,.28],phase:[.88,.20],announce:[.50,.22],banner:[.50,.40],dash:[.91,.80],ult:[.79,.80],run:[.67,.80],dash2:[.09,.80],ult2:[.21,.80],run2:[.33,.80],quick:[.05,.90]}
  };
  function ensureStore(){
    if(!S[PROFILE_KEY]||typeof S[PROFILE_KEY]!=='object')S[PROFILE_KEY]={portrait:{},landscape:{}};
    if(!S[PROFILE_KEY].portrait)S[PROFILE_KEY].portrait={};
    if(!S[PROFILE_KEY].landscape)S[PROFILE_KEY].landscape={};
    return S[PROFILE_KEY];
  }
  ensureStore();
  const orient=()=>innerHeight>=innerWidth?'portrait':'landscape';
  const profile=()=>ensureStore()[orient()];
  function getEl(t){
    if(!t)return null;
    if(t.key==='stats')return document.getElementById(orient()==='portrait'?'scPortraitStats':'kl');
    return document.querySelector(t.sel);
  }
  const save=()=>{try{sv()}catch(_){}};
  function clearCustom(el){
    if(!el)return;el.classList.remove('scHudCustom','scHudEditPreview','scHudSelected');
    for(const p of ['--sc-hud-x','--sc-hud-y','--sc-hud-scale'])el.style.removeProperty(p);
    delete el.dataset.scHudTemp;
  }
  function applyPlacement(el,p){
    if(!el||!p)return;el.classList.add('scHudCustom');
    el.style.setProperty('--sc-hud-x',(clamp(Number(p.x)||.5,.025,.975)*100).toFixed(3)+'vw');
    el.style.setProperty('--sc-hud-y',(clamp(Number(p.y)||.5,.025,.975)*100).toFixed(3)+'vh');
    el.style.setProperty('--sc-hud-scale',clamp(Number(p.s)||1,.5,1.8).toFixed(3));
  }
  function applyAll(){
    const p=profile();
    for(const t of TARGETS){const el=getEl(t);if(!el)continue;clearCustom(el);if(p[t.key])applyPlacement(el,p[t.key])}
    if(opened&&selected)selectTarget(selected.key,false);
  }
  function safePlacement(t,x,y,s,el){
    s=clamp(Number(s)||1,.5,1.8);let mx=.035,my=.035;
    if(el){const r=el.getBoundingClientRect();mx=Math.min(.45,Math.max(.025,(r.width*s/2+9)/Math.max(1,innerWidth)));my=Math.min(.45,Math.max(.025,(r.height*s/2+9)/Math.max(1,innerHeight)))}
    if(t&&t.control){mx=Math.max(mx,.045);my=Math.max(my,.045)}
    return{x:clamp(x,mx,1-mx),y:clamp(y,my,1-my),s};
  }
  function placementFromRect(t,el){
    const p=profile()[t.key];if(p)return{x:p.x,y:p.y,s:p.s||1};
    if(el){const r=el.getBoundingClientRect();if(r.width>3&&r.height>3)return{x:(r.left+r.width/2)/innerWidth,y:(r.top+r.height/2)/innerHeight,s:1}}
    const d=(DEFAULT_POS[orient()][t.key]||[.5,.5]);return{x:d[0],y:d[1],s:1};
  }

  let editor=null,selected=null,opened=false,drag=null,tag=null,raf=0;
  function refreshTargetButtons(){
    if(!editor)return;
    for(const b of editor.querySelectorAll('.scHudTargetList button')){const t=TARGETS.find(q=>q.key===b.dataset.target);b.classList.toggle('missing',!getEl(t))}
  }
  function makeEditor(){
    if(editor)return editor;
    editor=document.createElement('div');editor.id='scHudEditor';editor.innerHTML=`
      <div class="scHudEditTop">
        <div><small>EDITOR DE GAMEPLAY</small><b>AJUSTAR HUD</b><span id="scHudOrientation"></span></div>
        <div class="scHudEditTopBtns"><button id="scHudReset">↶ RESETAR</button><button id="scHudDone">✓ CONCLUIR</button></div>
      </div>
      <div class="scHudEditHint" id="scHudHint">Toque em um item abaixo e arraste-o pela tela.</div>
      <div class="scHudBottom">
        <div class="scHudTargetList" id="scHudTargetList"></div>
        <div class="scHudScaleRow">
          <button id="scHudMinus" aria-label="Diminuir">−</button>
          <label><span>TAMANHO</span><input id="scHudScale" type="range" min="50" max="180" step="5" value="100"><b id="scHudScaleVal">100%</b></label>
          <button id="scHudPlus" aria-label="Aumentar">+</button>
          <button id="scHudOneReset">RESTAURAR ITEM</button>
        </div>
      </div>`;
    document.body.appendChild(editor);
    const list=editor.querySelector('#scHudTargetList');
    for(const t of TARGETS){const b=document.createElement('button');b.type='button';b.dataset.target=t.key;b.innerHTML='<i>'+t.icon+'</i><span>'+t.label+'</span>';b.onclick=()=>selectTarget(t.key,true);list.appendChild(b)}
    editor.querySelector('#scHudDone').onclick=closeEditor;
    editor.querySelector('#scHudReset').onclick=resetCurrent;
    editor.querySelector('#scHudOneReset').onclick=resetSelected;
    const slider=editor.querySelector('#scHudScale');slider.oninput=()=>setScale(Number(slider.value)/100);
    editor.querySelector('#scHudMinus').onclick=()=>stepScale(-.05);
    editor.querySelector('#scHudPlus').onclick=()=>stepScale(.05);
    tag=document.createElement('div');tag.id='scHudTargetTag';document.body.appendChild(tag);
    refreshTargetButtons();return editor;
  }
  function updateOrientationUI(){
    if(!editor)return;const o=orient(),lab=editor.querySelector('#scHudOrientation');lab.textContent=o==='portrait'?'VERTICAL':'HORIZONTAL';lab.className=o;
    const hint=editor.querySelector('#scHudHint');hint.textContent=(o==='portrait'?'Perfil VERTICAL':'Perfil HORIZONTAL')+' · gire o celular para editar o outro perfil. As posições são salvas separadamente.';
    refreshTargetButtons();
  }
  function mountPauseEntry(){
    const grid=document.querySelector('#pause .scPauseGrid');if(!grid||document.getElementById('scSetHudEditor'))return;
    const b=document.createElement('button');b.type='button';b.id='scSetHudEditor';b.className='scPauseSetting on scHudEditorEntry';b.dataset.scButtonRefined='1';
    b.innerHTML='<span class="scSetIcon">✥</span><span class="scSetCopy"><small>Interface</small><b>AJUSTAR HUD</b></span><i></i>';b.onclick=()=>openEditor();grid.appendChild(b);
  }
  function openEditor(){
    makeEditor();mountPauseEntry();opened=true;document.body.classList.add('scHudEditing');editor.classList.add('on');try{hide('pause')}catch(_){};
    updateOrientationUI();applyAll();const first=TARGETS.find(t=>getEl(t));selectTarget((selected&&getEl(selected)&&selected.key)||(first&&first.key)||'vitals',true);loopTag();
  }
  function closeEditor(){
    if(!opened)return;opened=false;drag=null;document.body.classList.remove('scHudEditing');if(editor)editor.classList.remove('on');if(tag)tag.classList.remove('on');
    for(const t of TARGETS){const el=getEl(t);if(el)el.classList.remove('scHudEditPreview','scHudSelected')}
    applyAll();save();try{show('pause')}catch(_){};try{window.SCMenuRefine&&SCMenuRefine.refreshPause()}catch(_){}
  }
  function selectTarget(key,scroll){
    if(selected){const old=getEl(selected);if(old){old.classList.remove('scHudSelected','scHudEditPreview');if(old.dataset.scHudTemp){clearCustom(old);const p=profile()[selected.key];if(p)applyPlacement(old,p)}}}
    const t=TARGETS.find(q=>q.key===key);if(!t)return;const el=getEl(t);
    if(!el){const b=editor&&editor.querySelector('[data-target="'+key+'"]');if(b)b.classList.add('missing');return}
    selected=t;editor.querySelectorAll('.scHudTargetList button').forEach(b=>b.classList.toggle('on',b.dataset.target===key));el.classList.add('scHudSelected','scHudEditPreview');
    const p=placementFromRect(t,el),r=el.getBoundingClientRect();if(!profile()[key]&&(r.width<3||r.height<3)){el.dataset.scHudTemp='1';applyPlacement(el,p)}
    updateScaleUI(p.s||1);if(scroll){const b=editor.querySelector('[data-target="'+key+'"]');if(b)b.scrollIntoView({behavior:'smooth',block:'nearest',inline:'center'})}
  }
  function commitPlacement(p){
    if(!selected)return;const el=getEl(selected);if(!el)return;p=safePlacement(selected,p.x,p.y,p.s,el);profile()[selected.key]=p;delete el.dataset.scHudTemp;applyPlacement(el,p);save();updateScaleUI(p.s)
  }
  function setScale(s){if(!selected)return;const el=getEl(selected),p=placementFromRect(selected,el);commitPlacement({x:p.x,y:p.y,s})}
  function stepScale(d){if(!selected)return;const p=placementFromRect(selected,getEl(selected));setScale(clamp((p.s||1)+d,.5,1.8))}
  function updateScaleUI(s){if(!editor)return;const n=Math.round((s||1)*100);editor.querySelector('#scHudScale').value=n;editor.querySelector('#scHudScaleVal').textContent=n+'%'}
  function resetSelected(){if(!selected)return;delete profile()[selected.key];save();applyAll();selectTarget(selected.key,true);toast('ITEM RESTAURADO')}
  function resetCurrent(){const o=orient();S[PROFILE_KEY][o]={};save();applyAll();if(selected&&getEl(selected))selectTarget(selected.key,true);toast((o==='portrait'?'HUD VERTICAL':'HUD HORIZONTAL')+' RESTAURADO')}
  function toast(txt){if(!editor)return;const h=editor.querySelector('#scHudHint');h.textContent=txt;h.classList.add('ok');setTimeout(()=>{h.classList.remove('ok');if(opened)updateOrientationUI()},900)}
  function loopTag(){
    cancelAnimationFrame(raf);const f=()=>{if(!opened||!selected||!tag)return;const el=getEl(selected);if(el){const r=el.getBoundingClientRect();tag.textContent=selected.label+' · '+Math.round((placementFromRect(selected,el).s||1)*100)+'%';tag.style.left=clamp(r.left+r.width/2,56,innerWidth-56)+'px';tag.style.top=clamp(r.top-8,38,innerHeight-92)+'px';tag.classList.add('on')}raf=requestAnimationFrame(f)};raf=requestAnimationFrame(f)
  }

  document.addEventListener('pointerdown',e=>{
    if(!opened||!selected)return;const el=getEl(selected);if(!el||!(e.target===el||el.contains(e.target)))return;
    e.preventDefault();e.stopPropagation();const p=placementFromRect(selected,el);drag={id:e.pointerId,x:e.clientX,y:e.clientY,px:p.x,py:p.y,s:p.s||1};try{el.setPointerCapture(e.pointerId)}catch(_){}
  },true);
  document.addEventListener('pointermove',e=>{
    if(!opened||!drag||e.pointerId!==drag.id)return;e.preventDefault();e.stopPropagation();commitPlacement({x:drag.px+(e.clientX-drag.x)/innerWidth,y:drag.py+(e.clientY-drag.y)/innerHeight,s:drag.s})
  },true);
  const endDrag=e=>{if(drag&&(!e||e.pointerId===drag.id))drag=null};
  document.addEventListener('pointerup',endDrag,true);document.addEventListener('pointercancel',endDrag,true);
  document.addEventListener('click',e=>{if(!opened||!selected)return;const el=getEl(selected);if(el&&(e.target===el||el.contains(e.target))){e.preventDefault();e.stopPropagation()}},true);

  addEventListener('orientationchange',()=>setTimeout(()=>{applyAll();if(opened){updateOrientationUI();const keep=selected&&getEl(selected)?selected.key:(TARGETS.find(t=>getEl(t))||{}).key;if(keep)selectTarget(keep,true)}},220),{passive:true});
  addEventListener('resize',()=>setTimeout(()=>{applyAll();if(opened&&selected&&getEl(selected))selectTarget(selected.key,false)},80),{passive:true});
  const observer=new MutationObserver(()=>{mountPauseEntry();refreshTargetButtons();if(!opened)applyAll()});observer.observe(document.body,{childList:true,subtree:true});
  mountPauseEntry();applyAll();
  window.SCHudEditor={version:'2.0',open:openEditor,close:closeEditor,reset:resetCurrent,apply:applyAll,profiles:S[PROFILE_KEY]};
  console.log('[Mobile] HUD Editor 2.0 enabled: separate portrait/landscape layouts with safe reset.');
}catch(err){console.warn('[Mobile HUD Editor]',err)}
})();
