/* Survive Chaos Mobile — Tutorial Shame Achievement 25.0 */
(()=>{'use strict';
if(window.__SC_TUTORIAL_SHAME_ACH__)return;window.__SC_TUTORIAL_SHAME_ACH__=1;
const ID='s_tut_pessimo',MARK='sc_tutorial_pessimo_unlocked_v1';
let wrapped=false,awardedThisSession=false;
const now=()=>Date.now();
function marker(){try{return Number(localStorage.getItem(MARK)||0)||0}catch(_){return 0}}
function tutorialActive(){try{return document.documentElement.classList.contains('sc-tut-practice')||document.documentElement.classList.contains('sc-guide-echo')||!!window.SCGuidedTour?.isActive?.()}catch(_){return false}}
function register(){
  try{
    if(typeof ACH==='undefined'||typeof S==='undefined')return false;
    S.ach=S.ach||{};
    let a=ACH.find(q=>q&&q.id===ID);
    if(!a){
      a={id:ID,n:'Péssimo no jogo',d:'Morra durante o tutorial. O ECHO tinha literalmente uma missão: te carregar. Você transformou uma aula guiada em tela de derrota. Estatisticamente impressionante — pelo motivo errado.',r:9.95,f:null,s:true};
      ACH.push(a);
    }
    try{if(typeof ACM!=='undefined')ACM[ID]=a}catch(_){}
    try{if(typeof ACS!=='undefined'&&!ACS.some(q=>q&&q.id===ID)){ACS.push(a);ACS.sort((x,y)=>x.r-y.r)}}catch(_){}
    const ts=marker();
    if(ts&&!S.ach[ID]){S.ach[ID]=ts;try{if(typeof sv==='function')sv()}catch(_){}}
    return true;
  }catch(_){return false}
}
function mountShame(){
  let d=document.getElementById('scTutShame');if(d)return d;
  d=document.createElement('div');d.id='scTutShame';d.setAttribute('aria-hidden','true');
  d.innerHTML='<div class="scTutShameCard"><div class="scTutShameK">🏆 CONQUISTA SECRETA DESBLOQUEADA</div><div class="scTutShameTitle">PÉSSIMO NO JOGO</div><div class="scTutShameCopy">Você conseguiu <b>MORRER NO TUTORIAL.</b><br>O lugar onde o jogo diminui o ritmo, explica os botões e ainda coloca um robô para te ajudar.</div><div class="scTutShameEcho">🤖 <b>ECHO • BOT</b><span>“Meu código prevê 12.847 formas de perder. Essa não estava na lista.”</span></div><div class="scTutShameFoot">Recomendação oficial: na próxima tentativa, experimente a técnica avançada chamada <b>não encostar nos inimigos</b>.</div></div>';
  const st=document.createElement('style');st.id='scTutShameStyle';st.textContent=`#scTutShame{position:fixed;inset:0;z-index:2147483300;display:none;place-items:center;padding:18px;background:rgba(0,0,0,.78);backdrop-filter:blur(8px);font-family:system-ui,sans-serif}#scTutShame.on{display:grid;animation:scShameIn .18s ease-out both}@keyframes scShameIn{from{opacity:0;transform:scale(.97)}to{opacity:1;transform:none}}.scTutShameCard{width:min(680px,94vw);padding:22px;border:1px solid rgba(255,47,61,.58);border-radius:20px;background:linear-gradient(180deg,#291014,#0c0c0f 45%);box-shadow:0 30px 90px #000,0 0 45px rgba(255,30,45,.16);text-align:center;color:#fff}.scTutShameK{color:#ff6670;font-size:10px;font-weight:950;letter-spacing:.14em}.scTutShameTitle{margin:7px 0 12px;color:#fff;font-size:clamp(27px,7vw,48px);font-weight:1000;letter-spacing:-.03em;text-shadow:0 3px 0 #690b14}.scTutShameCopy{font-size:14px;line-height:1.5;color:#d9d9dc}.scTutShameCopy b{color:#ff5b66}.scTutShameEcho{display:flex;align-items:center;gap:10px;margin:17px auto 12px;padding:12px;text-align:left;border:1px solid rgba(255,255,255,.09);border-radius:13px;background:#111116}.scTutShameEcho>b{white-space:nowrap;color:#fff;font-size:11px}.scTutShameEcho span{color:#aaaab2;font-size:11px;line-height:1.35}.scTutShameFoot{color:#85858d;font-size:10px;line-height:1.4}.scTutShameFoot b{color:#e8e8eb}`;
  document.head.appendChild(st);document.body.appendChild(d);d.addEventListener('click',()=>d.classList.remove('on'));
  return d;
}
function shame(){
  const d=mountShame();d.classList.add('on');d.setAttribute('aria-hidden','false');
  clearTimeout(shame.t);shame.t=setTimeout(()=>{d.classList.remove('on');d.setAttribute('aria-hidden','true')},7200);
  try{if(typeof ban==='function')ban('💀 VOCÊ MORREU... NO TUTORIAL. COMO?')}catch(_){}
  setTimeout(()=>{try{if(typeof ban==='function')ban('🤖 ECHO: eu fui programado para ajudar, não para operar milagres.')}catch(_){}},1800);
}
function award(){
  if(awardedThisSession)return;awardedThisSession=true;register();
  const ts=now();try{localStorage.setItem(MARK,String(ts))}catch(_){}
  try{
    if(typeof S!=='undefined'){S.ach=S.ach||{};if(!S.ach[ID]){
      if(typeof ach==='function')ach(ID);else{S.ach[ID]=ts;if(typeof sv==='function')sv()}
    }}
  }catch(_){}
  shame();
}
function humanIsDownTarget(){
  try{
    if(!Array.isArray(PL)||!PL[0])return false;
    return P===PL[0]||(!P&&PL.length===1);
  }catch(_){return false}
}
function wrapDown(){
  try{
    if(wrapped||typeof down!=='function')return false;
    const base=down;
    down=function(){
      const should=tutorialActive()&&humanIsDownTarget();
      const q=typeof P!=='undefined'?P:null;
      const r=base.apply(this,arguments);
      if(should&&q&&(q.dead||q.hp<=0))award();
      return r;
    };
    wrapped=true;return true;
  }catch(_){return false}
}
function sync(){register();wrapDown()}
sync();setInterval(sync,800);
window.SCTutorialShameAchievement={version:'25.0',id:ID,marker:MARK,register,isTutorialActive:tutorialActive,awardForTest:award};
console.log('[Mobile] Tutorial Shame Achievement 25.0 ready: secret “Péssimo no jogo” watches real P1 tutorial deaths.');
})();
