/* Survive Chaos Mobile — Rare Funny Gameplay Easter Eggs 26.0 */
(()=>{'use strict';
if(window.__SC_FUN_EGGS__)return;window.__SC_FUN_EGGS__=1;
let nextRoll=18+Math.random()*18,last=performance.now(),activeToast=null;
const E=[
{id:'update',w:1.2,t:'🪟 WINDOWS UPDATE DO CAOS',x:'Atualizando arena... 99%. Não desligue os monstros.',b:'Windows Update do Caos travou em 99%. Padrão.'},
{id:'duck',w:1,t:'🦆 PATO FISCAL',x:'Ele veio auditar sua build. Não encontrou nota fiscal da ULT.',b:'🦆 Pato fiscal detectado.'},
{id:'sus',w:1.1,t:'📮 MUITO SUSPEITO',x:'Um inimigo vermelho saiu pelo duto. Provavelmente coincidência.',b:'📮 Um inimigo está suspeito demais.'},
{id:'cake',w:.8,t:'🎂 BOLO SUSPEITO',x:'O bolo continua suspeito. E não, você não vai ganhar um agora.',b:'🎂 O bolo parece... pouco confiável.'},
{id:'awake',w:.8,t:'🐉 JOGO ERRADO',x:'ECHO: “Finalmente acordou...” Não, pera. Jogo errado.',b:'🤖 ECHO abriu o roteiro de outro jogo.'},
{id:'404',w:1.25,t:'💻 ERRO 404',x:'Habilidade não encontrada. Sugestão: tente desviar.',b:'404: habilidade não encontrada.'},
{id:'clt',w:1,t:'📋 CLT DETECTADA',x:'O RH do caos quer conversar sobre seu desempenho e suas 47 horas extras.',b:'📋 O RH do caos está te procurando.'},
{id:'git',w:1,t:'🧑‍💻 DEV MOMENT',x:'DEV executou git push --force na realidade. Nada parece confiável agora.',b:'DEV fez push --force no universo.'},
{id:'deathfake',w:.7,t:'💀 VOCÊ MORREU',x:'Brincadeira. Ainda não. Mas o jogo claramente considerou a possibilidade.',b:'💀 Quase. O jogo ensaiou sua tela de derrota.',cond:()=>{try{return P&&P.hp/P.mhp<.55}catch(_){return false}}},
{id:'matrix',w:.7,t:'🕶️ ESCOLHA DIFÍCIL',x:'A pílula vermelha não está no inventário. A azul também não.',b:'🕶️ A Matrix esqueceu de carregar os itens.'},
{id:'skill',w:1,t:'🎮 DIAGNÓSTICO',x:'Análise concluída: 10% build, 20% reflexo, 70% “confia”.',b:'🎮 Diagnóstico da run concluído.'}
];
function tutorial(){try{return document.documentElement.classList.contains('sc-tut-practice')||document.documentElement.classList.contains('sc-guide-echo')||!!window.SCGuidedTour?.isActive?.()}catch(_){return false}}
function playing(){try{return typeof st!=='undefined'&&st==='play'&&!tutorial()}catch(_){return false}}
function mount(){let d=document.getElementById('scFunEgg');if(d)return d;d=document.createElement('div');d.id='scFunEgg';d.innerHTML='<div class="scFunEggCard"><b id="scFunEggT"></b><span id="scFunEggX"></span></div>';const s=document.createElement('style');s.textContent=`#scFunEgg{position:fixed;left:50%;top:max(14px,env(safe-area-inset-top));z-index:2147481200;transform:translate(-50%,-14px);opacity:0;pointer-events:none;transition:.18s ease;font-family:system-ui,sans-serif}#scFunEgg.on{opacity:1;transform:translate(-50%,0)}.scFunEggCard{width:min(520px,88vw);padding:10px 14px;border:1px solid rgba(255,255,255,.13);border-radius:14px;background:linear-gradient(180deg,rgba(20,20,24,.97),rgba(8,8,11,.97));box-shadow:0 16px 45px rgba(0,0,0,.48);text-align:center}.scFunEggCard b{display:block;color:#fff;font-size:12px;letter-spacing:.06em}.scFunEggCard span{display:block;margin-top:3px;color:#aaaab2;font-size:10px;line-height:1.35}.scDuck{position:fixed;z-index:2147481100;top:20%;left:-70px;font-size:34px;pointer-events:none;animation:scDuckFly 3.6s linear forwards}@keyframes scDuckFly{to{transform:translateX(calc(100vw + 140px)) rotate(18deg)}}`;document.head.appendChild(s);document.body.appendChild(d);return d}
function toast(e){const d=mount();document.getElementById('scFunEggT').textContent=e.t;document.getElementById('scFunEggX').textContent=e.x;d.classList.add('on');clearTimeout(activeToast);activeToast=setTimeout(()=>d.classList.remove('on'),3900);try{if(typeof ban==='function')ban(e.b)}catch(_){} }
function ducks(){for(let i=0;i<5;i++)setTimeout(()=>{const q=document.createElement('div');q.className='scDuck';q.textContent=i%2?'🦆':'🪿';q.style.top=(15+Math.random()*65)+'%';q.style.animationDuration=(3+Math.random()*1.6)+'s';document.body.appendChild(q);setTimeout(()=>q.remove(),5200)},i*180)}
function trigger(id){const e=E.find(q=>q.id===id)||E[Math.floor(Math.random()*E.length)];if(e.cond&&!e.cond())return false;toast(e);if(e.id==='duck')ducks();if(e.id==='update'){try{flash=Math.max(flash||0,.18)}catch(_){} }if(e.id==='git'){try{shake=Math.max(shake||0,5)}catch(_){} }return true}
function choose(){const ok=E.filter(e=>!e.cond||e.cond()),sum=ok.reduce((a,e)=>a+e.w,0);let r=Math.random()*sum;for(const e of ok){r-=e.w;if(r<=0)return e}return ok[0]}
function tick(){const n=performance.now(),dt=Math.min(2,(n-last)/1000);last=n;if(!playing())return;nextRoll-=dt;if(nextRoll>0)return;nextRoll=18+Math.random()*18;if(Math.random()<.018){const e=choose();e&&trigger(e.id)}}
setInterval(tick,500);window.SCFunEvents={version:'26.0',events:E,trigger,rollNow:()=>{const e=choose();return e&&trigger(e.id)}};console.log('[Mobile] Rare funny easter eggs 26.0 enabled.');
})();