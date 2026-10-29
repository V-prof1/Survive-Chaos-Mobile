/* ©criado por Vitor Ag/Nyx - 2026 */
/* ©criado por Vitor Ag/Nyx - 2026 */
/* ©criado por Vitor Ag/Nyx - 2026 */
(() => {
  'use strict';

  const $e=id=>document.getElementById(id);
  const fmt=n=>Math.floor(n||0).toLocaleString('pt-BR');
  const CORE=[
    {id:'vital',icon:'❤️',name:'Núcleo Vital',desc:'+8 de vida base por nível',base:5000,g:2.05,max:12,apply:p=>{p.mhp+=8;p.hp+=8}},
    {id:'arsenal',icon:'💥',name:'Arsenal Anômalo',desc:'+3% de dano base por nível',base:7500,g:2.08,max:12,apply:p=>{p.dmg*=1.03}},
    {id:'reflex',icon:'💨',name:'Reflexos Impossíveis',desc:'+2% velocidade e -1,5% recarga do Dash',base:10000,g:2.10,max:12,apply:p=>{p.sp*=1.02;p.dashCd*=.985}},
    {id:'wisdom',icon:'🧲',name:'Campo de Coleta',desc:'+4% XP e +7% alcance do ímã',base:12500,g:2.12,max:12,apply:p=>{p.xpm*=1.04;p.mag*=1.07}},
    {id:'fury',icon:'⚡',name:'Reator de Fúria',desc:'+1,5% crítico por nível e começa com +3% ULT',base:18000,g:2.15,max:12,apply:p=>{p.crit+=.015}}
  ];

  const CONTRACTS=[
    {id:'overdrive',icon:'🔥',name:'Protocolo Overdrive',cost:15000,desc:'Próxima run: +18% dano, +10% velocidade e começa com 25% de ULT.',apply:p=>{p.dmg*=1.18;p.sp*=1.10}},
    {id:'arsenal',icon:'🔱',name:'Carga de Arsenal',cost:50000,desc:'Próxima run: +1 projétil, +1 perfuração e +8% de crítico.',apply:p=>{p.cnt++;p.pierce++;p.crit+=.08}},
    {id:'phoenix',icon:'🪽',name:'Seguro de Alma',cost:125000,desc:'Próxima run: impede uma morte, retorna com 50% da vida e invulnerabilidade breve.',apply:p=>{}},
    {id:'apocalypse',icon:'☢️',name:'Contrato Apocalipse',cost:250000,desc:'Próxima run: +25% dano, +18% cadência, +15% velocidade, +1 perfuração e 40% ULT.',apply:p=>{p.dmg*=1.25;p.rate*=.82;p.sp*=1.15;p.pierce++}}
  ];

  const RUN={contract:null,phoenix:0};
  let confirmKey='',confirmUntil=0;

  function ensureSave(){
    S.econCore=S.econCore||{};
    S.econSpent=S.econSpent||0;
    S.econBuys=S.econBuys||0;
    if(S.econContract===undefined)S.econContract=null;
  }
  function coreLevel(id){ensureSave();return S.econCore[id]||0}
  function coreCost(c){const lv=coreLevel(c.id);return Math.floor(c.base*Math.pow(c.g,lv)/100)*100}
  function canSpend(n){return (S.coins||0)>=n}
  function spend(n){if(!canSpend(n))return false;S.coins-=n;S.econSpent=(S.econSpent||0)+n;S.econBuys=(S.econBuys||0)+1;sv();try{ref()}catch(_){};try{sfx('coin')}catch(_){};return true}
  function confirmPurchase(key,button,action){
    const now=performance.now();
    if(confirmKey===key&&now<confirmUntil){confirmKey='';confirmUntil=0;action();return}
    confirmKey=key;confirmUntil=now+2600;
    const old=button.textContent;button.textContent='CONFIRMAR COMPRA';button.classList.add('econConfirm');
    setTimeout(()=>{if(confirmKey===key){confirmKey='';confirmUntil=0}button.classList.remove('econConfirm');if(document.body.contains(button))button.textContent=old},2650)
  }

  function mount(){
    ensureSave();
    if(!$e('econBtn')){
      const stack=document.querySelector('#menu .stack');
      if(stack){const b=document.createElement('button');b.id='econBtn';b.className='btn econMain';b.innerHTML='<span>◈</span> NÚCLEO & MERCADO';const skins=$e('shopb');if(skins&&skins.parentNode===stack)stack.insertBefore(b,skins.nextSibling);else stack.appendChild(b)}
    }
    if(!$e('economy')){
      const s=document.createElement('div');s.className='scr';s.id='economy';s.innerHTML=`<div class="panel econPanel"><div class="econHead"><div><small>ECONOMIA ENDGAME</small><h2>NÚCLEO DO CAOS</h2></div><div class="econWallet"><span>CARTEIRA</span><b id="econCoins">0 🪙</b></div></div><div class="econStats"><span>Total queimado <b id="econSpent">0</b></span><span>Compras <b id="econBuys">0</b></span></div><div class="econTabs"><button id="econTabCore" class="on">◈ Núcleo</button><button id="econTabMarket">☠ Mercado Negro</button></div><div id="econCoreView"><p class="econLead">Melhorias permanentes. Os preços crescem violentamente a cada nível.</p><div id="econCoreGrid" class="econGrid"></div></div><div id="econMarketView" hidden><div class="econPending" id="econPending"></div><p class="econLead">Compre UM contrato para a próxima partida. Ele é consumido quando a run começa.</p><div id="econMarketGrid" class="econGrid"></div></div><button class="btn g" id="econBack">← Voltar ao menu</button></div>`;
      document.body.appendChild(s)
    }
    bind();render();
  }
  function bind(){
    const b=$e('econBtn');if(b&&!b.__econ){b.__econ=1;b.onclick=()=>{const m=$e('menu'),e=$e('economy');m&&m.classList.remove('on');e&&e.classList.add('on');render()}}
    const back=$e('econBack');if(back&&!back.__econ){back.__econ=1;back.onclick=()=>{$e('economy')?.classList.remove('on');$e('menu')?.classList.add('on');try{ref()}catch(_){}}}
    const tc=$e('econTabCore'),tm=$e('econTabMarket');
    if(tc&&!tc.__econ){tc.__econ=1;tc.onclick=()=>switchTab(0)}
    if(tm&&!tm.__econ){tm.__econ=1;tm.onclick=()=>switchTab(1)}
  }
  function switchTab(market){
    $e('econTabCore')?.classList.toggle('on',!market);$e('econTabMarket')?.classList.toggle('on',!!market);
    if($e('econCoreView'))$e('econCoreView').hidden=!!market;if($e('econMarketView'))$e('econMarketView').hidden=!market;render()
  }
  function render(){
    ensureSave();if(!$e('economy'))return;
    $e('econCoins').textContent=fmt(S.coins)+' 🪙';$e('econSpent').textContent=fmt(S.econSpent)+' 🪙';$e('econBuys').textContent=fmt(S.econBuys);
    const cg=$e('econCoreGrid');if(cg){cg.innerHTML='';for(const c of CORE){const lv=coreLevel(c.id),max=lv>=c.max,cost=max?0:coreCost(c);const card=document.createElement('article');card.className='econCard'+(max?' max':'');card.innerHTML=`<div class="econIcon">${c.icon}</div><div class="econInfo"><h3>${c.name}</h3><p>${c.desc}</p><div class="econLevel"><span>NÍVEL ${lv}/${c.max}</span><i><b style="width:${lv/c.max*100}%"></b></i></div></div><button class="econBuy" ${max||!canSpend(cost)?'disabled':''}>${max?'MAX':fmt(cost)+' 🪙'}</button>`;const btn=card.querySelector('button');if(!max){btn.onclick=()=>confirmPurchase('core:'+c.id,btn,()=>{const price=coreCost(c);if(!spend(price))return;S.econCore[c.id]=coreLevel(c.id)+1;sv();render()})}cg.appendChild(card)}}
    const pending=CONTRACTS.find(c=>c.id===S.econContract);const ep=$e('econPending');if(ep)ep.innerHTML=pending?`<b>CONTRATO ARMADO</b><span>${pending.icon} ${pending.name}</span><small>Será consumido na próxima partida.</small>`:'<b>NENHUM CONTRATO ARMADO</b><span>Escolha uma preparação abaixo.</span>';
    const mg=$e('econMarketGrid');if(mg){mg.innerHTML='';for(const c of CONTRACTS){const armed=S.econContract===c.id,locked=!!S.econContract&&!armed;const card=document.createElement('article');card.className='econCard market'+(armed?' armed':'');card.innerHTML=`<div class="econIcon">${c.icon}</div><div class="econInfo"><h3>${c.name}</h3><p>${c.desc}</p><small>Uso único · próxima run</small></div><button class="econBuy" ${armed||locked||!canSpend(c.cost)?'disabled':''}>${armed?'ARMADO':locked?'OCUPADO':fmt(c.cost)+' 🪙'}</button>`;const btn=card.querySelector('button');if(!armed&&!locked){btn.onclick=()=>confirmPurchase('contract:'+c.id,btn,()=>{if(S.econContract)return;if(!spend(c.cost))return;S.econContract=c.id;sv();render()})}mg.appendChild(card)}}
  }

  function applyCore(p){for(const c of CORE){const n=coreLevel(c.id);for(let i=0;i<n;i++)c.apply(p)}}
  function consumeContract(){ensureSave();const id=S.econContract;if(!id)return null;const c=CONTRACTS.find(v=>v.id===id);S.econContract=null;sv();return c||null}
  function applyEconomyRun(){
    ensureSave();for(const q of PL)applyCore(q);
    const c=consumeContract();RUN.contract=c?c.id:null;RUN.phoenix=c&&c.id==='phoenix'?1:0;
    if(c){for(const q of PL)c.apply(q);if(c.id==='overdrive')ult=Math.max(ult,25);if(c.id==='apocalypse')ult=Math.max(ult,40);setTimeout(()=>{try{ban(`${c.icon} CONTRATO ATIVO: ${c.name}`);sfx('boss2')}catch(_){}},350)}
    const fury=coreLevel('fury');if(fury)ult=Math.min(100,ult+fury*3)
  }

  const originalStart=start;
  start=function(){const out=originalStart.apply(this,arguments);try{applyEconomyRun()}catch(err){console.warn('[Mobile Economy start]',err)}return out};
  const originalDown=down;
  down=function(){
    if(RUN.phoenix>0&&P&&!P.dead){RUN.phoenix=0;P.hp=Math.max(1,P.mhp*.5);P.dead=0;P.dT=0;P.rv=0;P.iv=Math.max(P.iv||0,2.5);P.dc=0;ult=Math.min(100,ult+20);EB=[];FX.push({x:P.x,y:P.y,r:180,t:.5,ring:1});shake=Math.max(shake,14);flash=Math.max(flash,.35);try{ban('🪽 SEGURO DE ALMA — MORTE NEGADA');sfx('boss2')}catch(_){}return}
    return originalDown.apply(this,arguments)
  };

  document.addEventListener('visibilitychange',()=>{if(!document.hidden)render()});
  mount();
})();