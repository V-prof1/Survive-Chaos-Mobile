/* Survive Chaos Mobile — Co-op World Modes parity 22.2 */
(() => {
'use strict';
if(window.__SC_COOP_WORLDMODES_FIX__)return;window.__SC_COOP_WORLDMODES_FIX__=true;
try{
  const coop=()=>typeof CO!=='undefined'&&CO.on&&Array.isArray(PL)&&PL.length>1;
  const live=()=>PL.filter(q=>q&&!q.dead);
  const d=(a,b)=>Math.hypot((a?.x||0)-(b?.x||0),(a?.y||0)-(b?.y||0));
  const withP2=(q,fn)=>{const old=P;P=q;try{return fn()}finally{P=old}};

  if(typeof ban==='function'){
    const oldBan=ban;ban=function(t){const r=oldBan.apply(this,arguments);if(coop()&&typeof t==='string'&&t.includes('EXTRAÇÃO PERDIDA')){
      for(const q of live())if(q!==P)withP2(q,()=>hurt(Math.max(8,q.mhp*.12)));
    }return r};
  }

  // The base result card names only P1. Keep every stat/reward from end(), then relabel the duo.
  if(typeof end==='function'){
    const oldEnd=end;
    end=function(win){
      const wasCoop=!!(CF&&CF.co),n1=(S&&S.nick)||'P1',n2=(S&&S.nick2)||'P2';
      const r=oldEnd.apply(this,arguments);
      if(wasCoop){
        try{
          const w=document.querySelector('#os .who');
          if(w){
            const mode=(typeof MN!=='undefined'&&MN[CF.g])?MN[CF.g]:'';
            const diff=(typeof MD!=='undefined'&&MD[CF.m])?MD[CF.m][0]:'';
            w.textContent=n1+' + '+n2+(mode?' · '+mode:'')+(diff?' · '+diff:'');
          }
        }catch(_){}
      }
      return r;
    };
  }

  let last=performance.now(),p2Hell=0;
  function loop(now){requestAnimationFrame(loop);const dt=Math.min(.06,Math.max(0,(now-last)/1000));last=now;if(!coop()||st!=='play'||!window.SCWorldModes?.state)return;
    const m=SCWorldModes.state,p0=PL[0],p2=PL[1];if(!p2||p2.dead)return;

    if(m.mode===2&&m.checkpoint&&d(p2,m.checkpoint)<58&&(!p0||p0.dead||d(p0,m.checkpoint)>=58)){
      m.escapeCount=(m.escapeCount||0)+1;m.checkpoint=null;p2.hp=Math.min(p2.mhp,p2.hp+p2.mhp*.10);
      try{sfx('coin');ring(10+m.escapeCount*2)}catch(_){}
      if(m.escapeCount>=7){try{SCWorldshift.trophy('escape');ban('ROTA DE FUGA COMPLETA');end(1)}catch(_){}}
      else try{ban('🚪 EXTRAÇÃO '+m.escapeCount+'/7 · P2 alcançou o portal')}catch(_){}
    }

    if(m.mode===3&&m.core&&d(p2,m.core)<115&&(!p0||p0.dead||d(p0,m.core)>=115))m.core.hp=Math.min(m.core.max,m.core.hp+dt*.35);

    if(m.mode===10){p2Hell-=dt;if(p2Hell<=0){p2Hell=1.25+(typeof R==='function'?R():Math.random())*.7;if(p0&&d(p0,p2)>280){const rnd=typeof R==='function'?R:Math.random,n=10+Math.floor(rnd()*9),rad=Math.max(innerWidth,innerHeight)/2+80,a0=rnd()*Math.PI*2;for(let i=0;i<n;i++){const a=a0+i/n*Math.PI*2,x=p2.x+Math.cos(a)*rad,y=p2.y+Math.sin(a)*rad,aa=Math.atan2(p2.y-y,p2.x-x)+(i%2?-.12:.12);try{EB.push({x,y,vx:Math.cos(aa)*(170+Math.floor(rnd()*80)),vy:Math.sin(aa)*(170+Math.floor(rnd()*80)),r:5,l:7,d:8,col:i%2?'#ff334b':'#fff'})}catch(_){}}}}}

    if(m.mode===11&&m.checkpoint&&d(p2,m.checkpoint)<55&&(!p0||p0.dead||d(p0,m.checkpoint)>=55)){
      m.checkpoint=null;try{withP2(p2,()=>SCWorldshift.giveMod());ban('MICRO-ESCAPE CONCLUÍDO · P2');sfx('coin')}catch(_){}
    }
  }
  requestAnimationFrame(loop);
  console.log('[Mobile] Co-op World Modes parity 22.2 active');
}catch(err){console.warn('[Mobile Co-op World Modes 22.2]',err)}
})();
