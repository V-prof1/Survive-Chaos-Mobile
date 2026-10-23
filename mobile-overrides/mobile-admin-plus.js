(() => {
'use strict';
try{
  const root=document.body;
  const wrap=document.createElement('div');
  wrap.id='admCoinsPlus';
  wrap.innerHTML='<div class="admcp-box"><div class="admcp-title">💰 DAR MOEDAS</div><div class="admcp-sub">Escolha qualquer valor para adicionar ao saldo.</div><input id="admcpValue" type="number" inputmode="numeric" min="1" max="9999999999" step="1" value="10000"><div class="admcp-presets"><button data-v="1000">+1K</button><button data-v="10000">+10K</button><button data-v="100000">+100K</button><button data-v="1000000">+1M</button><button data-v="5000000">+5M</button><button data-v="10000000">+10M</button></div><div class="admcp-row"><button id="admcpCancel" class="btn g">Cancelar</button><button id="admcpGive" class="btn">Dar moedas</button></div><div id="admcpNow" class="admcp-now"></div></div>';
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
    let v=Math.floor(Number(input.value));
    if(!Number.isFinite(v)||v<1){input.value=1;return}
    v=Math.min(v,9999999999);
    S.coins=Math.min(Number.MAX_SAFE_INTEGER,(Number(S.coins)||0)+v);
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