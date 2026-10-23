(() => {
'use strict';
try{
  const root=document.body;
  const wrap=document.createElement('div');
  wrap.id='admCoinsPlus';
  wrap.innerHTML='<div class="admcp-box"><div class="admcp-title">💰 DAR MOEDAS</div><div class="admcp-sub">Escolha qualquer valor para adicionar ao saldo.</div><input id="admcpValue" type="text" inputmode="numeric" aria-label="Quantidade de moedas" placeholder="Quantidade de moedas" maxlength="16" value="10000"><div class="admcp-presets"><button data-v="1000">+1.000</button><button data-v="10000">+10.000</button><button data-v="100000">+100.000</button><button data-v="1000000">+1.000.000</button><button data-v="5000000">+5.000.000</button><button data-v="10000000">+10.000.000</button></div><div class="admcp-row"><button id="admcpCancel" class="btn g">Cancelar</button><button id="admcpGive" class="btn">Dar moedas</button></div><div id="admcpNow" class="admcp-now"></div></div>';
  root.appendChild(wrap);
  const input=document.getElementById('admcpValue'),now=document.getElementById('admcpNow');
  const fmt=n=>Number(n||0).toLocaleString('pt-BR');
  const refresh=()=>{now.textContent='Saldo atual: '+fmt(S.coins)+' moedas'};
  const open=()=>{refresh();wrap.classList.add('on');setTimeout(()=>{input.focus();input.select()},30)};
  const close=()=>wrap.classList.remove('on');
  wrap.querySelectorAll('[data-v]').forEach(b=>b.onclick=()=>{input.value=b.dataset.v;input.focus()});
  document.getElementById('admcpCancel').onclick=close;
  wrap.addEventListener('pointerdown',e=>{if(e.target===wrap)close()});
  document.getElementById('admcpGive').onclick=()=>{
    const raw=input.value.trim(),v=Number(raw);
    if(!/^\d+$/.test(raw)||!Number.isSafeInteger(v)||v<1){
      now.textContent='Digite uma quantidade inteira positiva e segura.';input.setAttribute('aria-invalid','true');return;
    }
    const balance=Number(S.coins);
    if(!Number.isSafeInteger(balance)||balance<0||v>Number.MAX_SAFE_INTEGER-balance){
      now.textContent='O saldo ultrapassaria o limite seguro de moedas.';return;
    }
    input.removeAttribute('aria-invalid');S.coins=balance+v;
    try{sv();ref();shopUI()}catch(_){try{sv();ref()}catch(__){}}
    try{ban('💰 +'+fmt(v)+' MOEDAS')}catch(_){ }
    refresh();close();
  };
  input.addEventListener('keydown',e=>{if(e.key==='Enter')document.getElementById('admcpGive').click();if(e.key==='Escape')close()});

  const patchButton=()=>{
    const b=[...document.querySelectorAll('#adm button')].find(x=>/10[\.\s]?000\s*moedas/i.test(x.textContent||''));
    if(!b)return false;
    b.textContent='💰 Dar moedas…';
    b.onclick=()=>{try{sfx('ui')}catch(_){ }open()};
    b.dataset.freeCoins='1';
    return true;
  };
  if(!patchButton())setTimeout(patchButton,250);
  const ob=new MutationObserver(()=>patchButton());
  const adm=document.getElementById('adm');if(adm)ob.observe(adm,{childList:true,subtree:true});
  console.log('[Mobile] Admin free coin grant enabled');
}catch(err){console.warn('[Mobile Admin Coins]',err)}
})();