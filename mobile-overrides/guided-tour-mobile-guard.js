/* Survive Chaos Mobile — Guided Tour early input guard */
(()=>{'use strict';if(window.__SC_GUIDE_MOBILE_GUARD__)return;window.__SC_GUIDE_MOBILE_GUARD__=1;
function block(e){try{const g=window.SCGuidedTour;if(!g?.isActive?.()||document.documentElement.classList.contains('sc-guide-echo'))return;const s=g.steps?.()[g.index?.()];if(!s)return;const fn=s.q||s.target,t=typeof fn==='function'?fn():null;const inPanel=e.target?.closest?.('#scGuidePanel');const inTarget=t&&(e.target===t||t.contains?.(e.target));if((s.m==='confirm'&&inPanel)||((s.m==='target'||s.m==='custom')&&inTarget))return;e.preventDefault();e.stopPropagation();e.stopImmediatePropagation()}catch(_){}}
window.addEventListener('pointerdown',block,true);window.addEventListener('touchstart',block,{capture:true,passive:false});console.log('[Tutorial] Mobile early input guard active');
})();
