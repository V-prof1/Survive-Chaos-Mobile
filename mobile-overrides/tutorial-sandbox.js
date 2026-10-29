/* Survive Chaos Mobile — ECHO tutorial save sandbox 1.2 */
(()=>{'use strict';if(window.__SC_TUTORIAL_SANDBOX__)return;window.__SC_TUTORIAL_SANDBOX__=1;let snap=null,armed=false,wasActive=false,wasGuideEcho=false,compatDone=false;
const clone=v=>{try{return JSON.parse(JSON.stringify(v))}catch(_){return null}};
function capture(){try{if(armed)return;snap={s:clone(S),cf:clone(CF)};armed=!!snap.s}catch(_){snap=null;armed=false}}
function restore(){if(!armed||!snap)return;try{for(const k of Object.keys(S))delete S[k];Object.assign(S,snap.s||{});Object.assign(CF,snap.cf||{});S.cf=CF;if(typeof CO!=='undefined'){CO.on=0;try{setBtn()}catch(_){}}if(typeof sv==='function')sv();if(typeof ref==='function')ref()}catch(e){console.warn('[Tutorial sandbox restore]',e)}snap=null;armed=false;wasActive=false;wasGuideEcho=false}
function normalizeGuidedSteps(){if(compatDone||!window.SCGuidedTour?.steps)return;try{for(const s of SCGuidedTour.steps()){if(s.mode==null&&s.m!=null)s.mode=s.m;if(s.target==null&&s.q!=null)s.target=s.q;if(s.title==null&&s.t!=null)s.title=s.t;if(s.phase==null&&s.p!=null)s.phase=s.p}compatDone=true;console.log('[Tutorial] Mobile guided step compatibility normalized')}catch(_){}}
document.addEventListener('click',e=>{const b=e.target?.closest?.('#scTutNext');if(!b)return;if(/ECHO/i.test(b.textContent||'')&&/TREINO/i.test(b.textContent||''))capture()},true);
function loop(){requestAnimationFrame(loop);normalizeGuidedSteps();const guideEcho=document.documentElement.classList.contains('sc-guide-echo');if(guideEcho&&!wasGuideEcho&&!armed)capture();wasGuideEcho=guideEcho;const on=document.documentElement.classList.contains('sc-tut-practice');if(on)wasActive=true;else if(wasActive&&armed)restore()}requestAnimationFrame(loop);
window.SCTutorialSandbox={version:'1.2',capture,restore,normalizeGuidedSteps};
})();
