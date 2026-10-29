/* Survive Chaos — ECHO tutorial save sandbox */
(()=>{'use strict';if(window.__SC_TUTORIAL_SANDBOX__)return;window.__SC_TUTORIAL_SANDBOX__=1;let snap=null,armed=false,wasActive=false;
const clone=v=>{try{return JSON.parse(JSON.stringify(v))}catch(_){return null}};
function capture(){try{snap={s:clone(S),cf:clone(CF)};armed=!!snap.s}catch(_){snap=null;armed=false}}
function restore(){if(!armed||!snap)return;try{for(const k of Object.keys(S))delete S[k];Object.assign(S,snap.s||{});Object.assign(CF,snap.cf||{});S.cf=CF;if(typeof CO!=='undefined'){CO.on=0;try{setBtn()}catch(_){}}if(typeof sv==='function')sv();if(typeof ref==='function')ref()}catch(e){console.warn('[Tutorial sandbox restore]',e)}snap=null;armed=false;wasActive=false}
document.addEventListener('click',e=>{const b=e.target?.closest?.('#scTutNext');if(!b)return;if(/ECHO/i.test(b.textContent||'')&&/TREINO/i.test(b.textContent||''))capture()},true);
function loop(){requestAnimationFrame(loop);const on=document.documentElement.classList.contains('sc-tut-practice');if(on)wasActive=true;else if(wasActive&&armed)restore()}requestAnimationFrame(loop);
window.SCTutorialSandbox={version:'1.0'};
})();
