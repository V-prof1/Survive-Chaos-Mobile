/* Survive Chaos Mobile — Hybrid Lighting / Shader Layer 28.0 */
(()=>{'use strict';
if(window.__SC_LIGHTING_SHADER__)return;window.__SC_LIGHTING_SHADER__=1;
const d=document,$=id=>d.getElementById(id),KEY='sc_lighting_quality_v1';
const MODES=['performance','medium','high','ultra'];
const LABEL={performance:'DESEMPENHO',medium:'MÉDIO',high:'ALTO',ultra:'ULTRA'};
const BIOME=[
  {dark:.12,tint:'rgba(34,62,44,.09)',glow:'#9dffc1',fog:'#86b99a'},
  {dark:.18,tint:'rgba(79,46,91,.12)',glow:'#d89cff',fog:'#9d74b0'},
  {dark:.22,tint:'rgba(47,82,57,.13)',glow:'#86ff9c',fog:'#6a9c73'},
  {dark:.20,tint:'rgba(48,90,125,.14)',glow:'#91ddff',fog:'#7faec9'},
  {dark:.16,tint:'rgba(124,66,34,.11)',glow:'#ffb66d',fog:'#b18061'}
];
let pref='high',eff='high',canvas=null,g=null,cw=0,ch=0,dpr=1,last=performance.now(),fpsAvg=60,lowFor=0,goodFor=0,adaptMsg=0,flashPulse=0,hurtPulse=0,ultPulse=0,wrapped=0;
function loadPref(){try{const q=localStorage.getItem(KEY);if(MODES.includes(q))pref=q;else if(typeof S!=='undefined'&&S.uiPrefs&&MODES.includes(S.uiPrefs.lighting))pref=S.uiPrefs.lighting}catch(_){}eff=pref}
function savePref(){try{localStorage.setItem(KEY,pref);if(typeof S!=='undefined'){S.uiPrefs=S.uiPrefs||{};S.uiPrefs.lighting=pref;if(typeof sv==='function')sv()}}catch(_){} }
function quality(){return MODES.indexOf(eff)}
function playing(){try{return typeof st!=='undefined'&&(st==='play'||st==='pause'||st==='cards'||st==='bossintro'||st==='devi')}catch(_){return false}}
function mount(){
 if(canvas)return canvas;const base=$('c');if(!base)return null;
 canvas=d.createElement('canvas');canvas.id='scLightingCanvas';canvas.setAttribute('aria-hidden','true');base.insertAdjacentElement('afterend',canvas);g=canvas.getContext('2d',{alpha:true,desynchronized:true});resize();mountControls();return canvas;
}
function resize(){if(!canvas)return;const w=Math.max(1,innerWidth),h=Math.max(1,innerHeight),q=quality();dpr=Math.min(devicePixelRatio||1,q>=3?1.35:q>=2?1.2:1);const nw=Math.round(w*dpr),nh=Math.round(h*dpr);if(nw!==cw||nh!==ch){cw=nw;ch=nh;canvas.width=nw;canvas.height=nh;canvas.style.width=w+'px';canvas.style.height=h+'px'}}
function screen(o){try{const z=typeof Z==='number'?Z:1,c=typeof cam!=='undefined'?cam:null;if(c&&o&&Number.isFinite(o.x)&&Number.isFinite(o.y))return{x:(o.x-c.x)*z+innerWidth/2,y:(o.y-c.y)*z+innerHeight/2}}catch(_){}return{x:innerWidth/2,y:innerHeight/2}}
function radial(x,y,r,col,a=1){if(!g||r<=1)return;const gr=g.createRadialGradient(x,y,0,x,y,r);gr.addColorStop(0,col);gr.addColorStop(.22,col);gr.addColorStop(1,'rgba(0,0,0,0)');g.globalAlpha=a;g.fillStyle=gr;g.beginPath();g.arc(x,y,r,0,Math.PI*2);g.fill();g.globalAlpha=1}
function cutLight(x,y,r,str=.9){const gr=g.createRadialGradient(x,y,0,x,y,r);gr.addColorStop(0,`rgba(0,0,0,${str})`);gr.addColorStop(.45,`rgba(0,0,0,${str*.72})`);gr.addColorStop(1,'rgba(0,0,0,0)');g.fillStyle=gr;g.beginPath();g.arc(x,y,r,0,Math.PI*2);g.fill()}
function playerLights(pal,q){let arr=[];try{arr=Array.isArray(PL)&&PL.length?PL:(typeof P!=='undefined'&&P?[P]:[])}catch(_){};for(const p of arr){if(!p||p.dead)continue;const s=screen(p),r=(q>=3?190:q>=2?155:q>=1?125:85);cutLight(s.x,s.y,r,.98);if(q>=1){g.globalCompositeOperation='lighter';radial(s.x,s.y,r*.72,pal.glow,q>=3?.17:.11);g.globalCompositeOperation='source-over'}}}
function worldLights(q){if(q<2)return;g.globalCompositeOperation='lighter';try{const bs=typeof B!=='undefined'&&Array.isArray(B)?B:[];const step=q>=3?Math.max(1,Math.ceil(bs.length/24)):Math.max(1,Math.ceil(bs.length/12));for(let i=0;i<bs.length;i+=step){const b=bs[i];if(!b)continue;const s=screen(b);if(s.x<-30||s.y<-30||s.x>innerWidth+30||s.y>innerHeight+30)continue;radial(s.x,s.y,q>=3?42:30,'#ffd86a',q>=3?.13:.08)}}catch(_){}
 try{const es=typeof EB!=='undefined'&&Array.isArray(EB)?EB:[];const step=q>=3?Math.max(1,Math.ceil(es.length/18)):Math.max(1,Math.ceil(es.length/8));for(let i=0;i<es.length;i+=step){const b=es[i];if(!b)continue;const s=screen(b);radial(s.x,s.y,q>=3?46:32,b.col||'#ff5969',q>=3?.15:.09)}}catch(_){}
 try{const boss=typeof bossE!=='undefined'?bossE:null;if(boss&&!boss.dead){const s=screen(boss);radial(s.x,s.y,q>=3?230:175,boss.dv?'#ff1738':'#ff5b80',q>=3?.19:.12)}}catch(_){}
 g.globalCompositeOperation='source-over'}
function fog(pal,q,t){if(q<3)return;g.save();g.globalCompositeOperation='source-over';for(let i=0;i<4;i++){const x=((t*.012*(i%2?1:-1)+i*.31)%1.4)*innerWidth-0.2*innerWidth,y=innerHeight*(.18+i*.22);const gr=g.createRadialGradient(x,y,0,x,y,innerWidth*.34);gr.addColorStop(0,hexAlpha(pal.fog,.026));gr.addColorStop(1,'rgba(0,0,0,0)');g.fillStyle=gr;g.fillRect(0,0,innerWidth,innerHeight)}g.restore()}
function hexAlpha(hex,a){const h=hex.replace('#','');const n=parseInt(h,16);return `rgba(${n>>16},${(n>>8)&255},${n&255},${a})`}
function render(ts){requestAnimationFrame(render);if(!mount()||!g)return;const dt=Math.min(.1,(ts-last)/1000||.016);last=ts;const inst=1/Math.max(dt,.001);fpsAvg=fpsAvg*.94+inst*.06;adapt(dt);if(!playing()){g.setTransform(1,0,0,1,0,0);g.clearRect(0,0,cw,ch);return}resize();const q=quality(),pal=BIOME[safeBiome()]||BIOME[0];g.setTransform(dpr,0,0,dpr,0,0);g.clearRect(0,0,innerWidth,innerHeight);
 let darkness=pal.dark+(q>=2?.035:0);try{if(typeof dark==='number'&&dark>0)darkness+=.22;if(typeof rain==='number'&&rain>0)darkness+=.045;if(typeof horde==='number'&&horde>0)darkness+=.025}catch(_){};if(q===0)darkness*=.24;else if(q===1)darkness*=.68;darkness=Math.min(.48,darkness);
 g.fillStyle=pal.tint;g.fillRect(0,0,innerWidth,innerHeight);if(darkness>.01){g.fillStyle=`rgba(3,4,8,${darkness})`;g.fillRect(0,0,innerWidth,innerHeight);g.globalCompositeOperation='destination-out';playerLights(pal,q);g.globalCompositeOperation='source-over'}
 worldLights(q);fog(pal,q,ts);
 if(q>=1){const vg=g.createRadialGradient(innerWidth/2,innerHeight/2,Math.min(innerWidth,innerHeight)*.24,innerWidth/2,innerHeight/2,Math.max(innerWidth,innerHeight)*.72);vg.addColorStop(0,'rgba(0,0,0,0)');vg.addColorStop(1,`rgba(0,0,0,${q>=3?.34:q>=2?.27:.18})`);g.fillStyle=vg;g.fillRect(0,0,innerWidth,innerHeight)}
 flashPulse=Math.max(0,flashPulse-dt*2.6);hurtPulse=Math.max(0,hurtPulse-dt*2.2);ultPulse=Math.max(0,ultPulse-dt*1.7);if(flashPulse>0){g.fillStyle=`rgba(255,223,158,${flashPulse*.22})`;g.fillRect(0,0,innerWidth,innerHeight)}if(hurtPulse>0){const vg=g.createRadialGradient(innerWidth/2,innerHeight/2,innerHeight*.25,innerWidth/2,innerHeight/2,Math.max(innerWidth,innerHeight)*.7);vg.addColorStop(0,'rgba(255,0,0,0)');vg.addColorStop(1,`rgba(255,20,45,${hurtPulse*.24})`);g.fillStyle=vg;g.fillRect(0,0,innerWidth,innerHeight)}if(ultPulse>0&&q>=1){g.globalCompositeOperation='lighter';radial(innerWidth/2,innerHeight/2,Math.max(innerWidth,innerHeight)*.65,'#ffe874',ultPulse*.13);g.globalCompositeOperation='source-over'}
}
function safeBiome(){try{return Math.max(0,Math.min(4,Number(bi)||0))}catch(_){return 0}}
function adapt(dt){if(pref==='performance'){eff=pref;return}if(fpsAvg<38){lowFor+=dt;goodFor=0}else if(fpsAvg>52){goodFor+=dt;lowFor=Math.max(0,lowFor-dt*.5)}else{lowFor=Math.max(0,lowFor-dt*.2);goodFor=Math.max(0,goodFor-dt*.2)}if(lowFor>6){const i=Math.max(0,MODES.indexOf(eff)-1);if(MODES[i]!==eff){eff=MODES[i];resize();notify('Iluminação adaptativa: '+LABEL[eff])}lowFor=0}if(goodFor>10&&MODES.indexOf(eff)<MODES.indexOf(pref)){eff=MODES[MODES.indexOf(eff)+1];resize();goodFor=0}}
function notify(txt){if(performance.now()-adaptMsg<6000)return;adaptMsg=performance.now();try{if(typeof ban==='function')ban('💡 '+txt)}catch(_){} }
function setMode(mode){if(!MODES.includes(mode))return;pref=mode;eff=mode;lowFor=goodFor=0;savePref();resize();refreshControls();notify('Iluminação: '+LABEL[pref])}
function cycle(){setMode(MODES[(MODES.indexOf(pref)+1)%MODES.length])}
function controlButton(id,icon,title){const b=d.createElement('button');b.type='button';b.id=id;b.className='scPauseSetting';b.dataset.scButtonRefined='1';b.innerHTML=`<span class="scSetIcon">${icon}</span><span class="scSetCopy"><small>${title}</small><b></b></span><i></i>`;b.onclick=cycle;return b}
function mountControls(){
 try{const gfx=$('scSetGfx');if(gfx&&!$('scSetLighting')){const b=controlButton('scSetLighting','💡','Iluminação');gfx.insertAdjacentElement('afterend',b)}}catch(_){}
 try{const sys=d.querySelector('#menu.scMenuV2 .scMenuSystems');if(sys&&!$('scLightMenuBtn')){const b=d.createElement('button');b.id='scLightMenuBtn';b.type='button';b.className='btn g';b.dataset.scButtonRefined='1';b.onclick=cycle;sys.appendChild(b)}}catch(_){}refreshControls()
}
function refreshControls(){const p=$('scSetLighting');if(p){const b=p.querySelector('.scSetCopy b');if(b)b.textContent=LABEL[pref];p.classList.toggle('on',pref!=='performance')}const m=$('scLightMenuBtn');if(m){m.textContent='💡 ILUMINAÇÃO · '+LABEL[pref];m.setAttribute('aria-label','Iluminação '+LABEL[pref])}}
function wrapHooks(){if(wrapped)return;try{if(typeof boom==='function'){const f=boom;boom=function(){flashPulse=Math.max(flashPulse,.8);return f.apply(this,arguments)}}if(typeof hurt==='function'){const f=hurt;hurt=function(){hurtPulse=Math.max(hurtPulse,.8);return f.apply(this,arguments)}}if(typeof fireUlt==='function'){const f=fireUlt;fireUlt=function(){ultPulse=1;flashPulse=Math.max(flashPulse,.45);return f.apply(this,arguments)}}wrapped=1}catch(_){} }
loadPref();mount();wrapHooks();setInterval(()=>{mountControls();wrapHooks();refreshControls()},900);addEventListener('resize',resize,{passive:true});addEventListener('orientationchange',()=>setTimeout(resize,120),{passive:true});requestAnimationFrame(render);
window.SCLighting={version:'28.0',modes:MODES,label:LABEL,get preferred(){return pref},get effective(){return eff},get fps(){return fpsAvg},setMode,cycle,flash:(v=1)=>{flashPulse=Math.max(flashPulse,v)}};
console.log('[Mobile] Hybrid Lighting 28.0 enabled: adaptive ambient light, dynamic glows, fog, vignette and quality scaling.');
})();
