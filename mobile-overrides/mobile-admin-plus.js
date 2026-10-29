/* ©criado por Vitor Ag/Nyx - 2026 */
/* ©criado por Vitor Ag/Nyx - 2026 */
/* ©criado por Vitor Ag/Nyx - 2026 */
(() => {
'use strict';
try{
  const $e=id=>document.getElementById(id);
  const adm=$e('adm'),apan=$e('apan');
  if(!adm||!apan)return;

  const fmt=n=>Number(n||0).toLocaleString('pt-BR');
  const safeText=v=>String(v==null?'':v);
  const slug=v=>safeText(v).normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().replace(/[^a-z0-9]+/g,'.').replace(/^\.|\.$/g,'');
  const favKey='sc_admin_favs_v2';
  const readFavs=()=>{try{return new Set(JSON.parse(localStorage.getItem(favKey)||'[]'))}catch(_){return new Set()}};
  const writeFavs=s=>{try{localStorage.setItem(favKey,JSON.stringify([...s]))}catch(_){}};
  const favs=readFavs();
  const recent=[];
  const commands=new Map();
  const listeners=new Set();
  const sessionId='adm-'+Date.now().toString(36)+'-'+Math.random().toString(36).slice(2,8);
  let transport=null,transportMeta={mode:'offline',serverId:null},players=[{id:'self',name:'Eu (local)',self:true}],targetId='self';
  let confirmId='',confirmUntil=0;

  function runContext(){
    return {
      runActive:typeof P!=='undefined'&&!!P&&typeof st!=='undefined'&&!['menu','shop','over','setup'].includes(st),
      state:typeof st!=='undefined'?st:'unknown',
      mode:typeof CF!=='undefined'?CF.g:null,
      difficulty:typeof CF!=='undefined'?CF.m:null,
      biome:typeof bi!=='undefined'?bi:null,
      infinite:typeof CF!=='undefined'?!!CF.i:false
    };
  }

  function packetFor(cmd,args){
    return {
      protocol:'sc.admin.v1',
      requestId:sessionId+'-'+Date.now().toString(36)+'-'+Math.random().toString(36).slice(2,7),
      commandId:cmd.id,
      permission:cmd.permission||'admin.gameplay',
      args:args||{},
      target:{type:targetId==='all'?'all':'player',id:targetId},
      context:runContext(),
      client:{surface:'mobile-admin',version:2,sessionId},
      clientTime:Date.now()
    };
  }

  function notify(type,msg,detail){
    const ev={type,msg,detail,time:Date.now()};
    listeners.forEach(fn=>{try{fn(ev)}catch(_){}});
  }

  async function execute(id,args={}){
    const cmd=commands.get(id);if(!cmd)return {ok:false,error:'UNKNOWN_COMMAND'};
    if(cmd.requiresRun&&!runContext().runActive){notify('error','Essa ação precisa de uma partida ativa.');return {ok:false,error:'RUN_REQUIRED'}}
    if(cmd.danger){
      const now=performance.now();
      if(confirmId!==id||now>confirmUntil){confirmId=id;confirmUntil=now+2600;notify('confirm','Toque de novo para confirmar: '+cmd.label);return {ok:false,error:'CONFIRM_REQUIRED'}}
      confirmId='';confirmUntil=0;
    }
    const packet=packetFor(cmd,args);
    try{
      let result;
      if(transport){
        result=await transport(packet);
        if(!result||result.ok===false)throw new Error(result&&result.error||'Servidor recusou o comando');
      }else{
        if(targetId!=='self'){notify('error','Esse alvo só existe no futuro modo online.');return {ok:false,error:'REMOTE_TARGET_OFFLINE'}}
        result=await cmd.local(args,packet);
      }
      recent.unshift({id,label:cmd.label,time:Date.now()});if(recent.length>12)recent.length=12;
      try{navigator.vibrate&&navigator.vibrate(18)}catch(_){ }
      notify('success',cmd.label,result);
      return {ok:true,result};
    }catch(err){notify('error',err&&err.message?err.message:'Falha ao executar comando');return {ok:false,error:String(err&&err.message||err)}}
  }

  const Bus={
    version:1,protocol:'sc.admin.v1',
    register(def){commands.set(def.id,def);return def.id},
    execute,
    setTransport(fn,meta={}){transport=typeof fn==='function'?fn:null;transportMeta={mode:transport?'remote':'offline',serverId:meta.serverId||null,...meta};notify('transport',transport?'Servidor admin conectado':'Modo admin local');renderOnlineStatus();},
    clearTransport(){this.setTransport(null)},
    setPlayers(list){players=[{id:'self',name:'Eu (local)',self:true},...(Array.isArray(list)?list.filter(p=>p&&p.id&&p.id!=='self'):[])];renderTargets();},
    setTarget(id){if(players.some(p=>String(p.id)===String(id))||id==='all'){targetId=String(id);renderTargets()}},
    subscribe(fn){listeners.add(fn);return()=>listeners.delete(fn)},
    getPacket(id,args={}){const cmd=commands.get(id);return cmd?packetFor(cmd,args):null},
    getCommands(){return [...commands.values()].map(({local,...x})=>x)},
    getTransport(){return {...transportMeta,connected:!!transport}}
  };
  window.SCAdminBus=Bus;

  // ===== Coin grant modal =====
  const coinWrap=document.createElement('div');
  coinWrap.id='admCoinsPlus';
  coinWrap.innerHTML='<div class="admcp-box"><div class="admcp-title">💰 DAR MOEDAS</div><div class="admcp-sub">No offline altera seu save local. No futuro online este mesmo comando será validado pelo servidor.</div><input id="admcpValue" type="text" inputmode="numeric" aria-label="Quantidade de moedas" placeholder="Quantidade de moedas" maxlength="16" value="10000"><div class="admcp-presets"><button data-v="1000">+1.000</button><button data-v="10000">+10.000</button><button data-v="100000">+100.000</button><button data-v="1000000">+1.000.000</button><button data-v="5000000">+5.000.000</button><button data-v="10000000">+10.000.000</button></div><div class="admcp-row"><button id="admcpCancel" class="btn g">Cancelar</button><button id="admcpGive" class="btn">Dar moedas</button></div><div id="admcpNow" class="admcp-now"></div></div>';
  document.body.appendChild(coinWrap);
  const coinInput=$e('admcpValue'),coinNow=$e('admcpNow');
  const refreshCoins=()=>{coinNow.textContent='Saldo atual: '+fmt(typeof S!=='undefined'?S.coins:0)+' moedas'};
  const openCoins=()=>{refreshCoins();coinWrap.classList.add('on');setTimeout(()=>{coinInput.focus();coinInput.select()},30)};
  const closeCoins=()=>coinWrap.classList.remove('on');
  coinWrap.querySelectorAll('[data-v]').forEach(b=>b.onclick=()=>{coinInput.value=b.dataset.v;coinInput.focus()});
  $e('admcpCancel').onclick=closeCoins;
  coinWrap.addEventListener('pointerdown',e=>{if(e.target===coinWrap)closeCoins()});

  Bus.register({
    id:'economy.grant_coins',label:'Dar moedas',permission:'admin.economy',category:'system',icon:'💰',
    local:({amount})=>{
      const v=Number(amount),balance=Number(S.coins);
      if(!Number.isSafeInteger(v)||v<1)throw new Error('Quantidade inválida.');
      if(!Number.isSafeInteger(balance)||balance<0||v>Number.MAX_SAFE_INTEGER-balance)throw new Error('O saldo ultrapassaria o limite seguro.');
      S.coins=balance+v;try{sv();ref();shopUI()}catch(_){try{sv();ref()}catch(__){}}
      try{ban('💰 +'+fmt(v)+' MOEDAS')}catch(_){ }
      return {balance:S.coins,amount:v};
    }
  });
  $e('admcpGive').onclick=async()=>{
    const raw=coinInput.value.trim(),v=Number(raw);
    if(!/^\d+$/.test(raw)||!Number.isSafeInteger(v)||v<1){coinNow.textContent='Digite uma quantidade inteira positiva e segura.';coinInput.setAttribute('aria-invalid','true');return}
    coinInput.removeAttribute('aria-invalid');const r=await Bus.execute('economy.grant_coins',{amount:v});if(r.ok){refreshCoins();closeCoins()}
  };
  coinInput.addEventListener('keydown',e=>{if(e.key==='Enter')$e('admcpGive').click();if(e.key==='Escape')closeCoins()});

  // ===== Capture the already-working legacy actions =====
  const canonical={
    'Invencível':'player.god','Dano ×10':'player.damage10','Liberar todas as skins':'progress.unlock_skins',
    'Subir 1 nível':'player.level1','+10 níveis':'player.level10','Pular +1 minuto':'world.time60','Pular +5 minutos':'world.time300',
    'Boss 1':'spawn.boss1','Boss 2':'spawn.boss2','Boss 3':'spawn.boss3','Boss 4 (final)':'spawn.boss4',
    'Horda (40)':'spawn.horde40','Elite':'spawn.elite','Noite escura':'world.dark','Chuva':'world.rain','Evento aleatório':'event.random',
    'Limpar inimigos':'world.clear_enemies','Curar tudo':'player.heal','Todos os upgrades':'player.all_upgrades',
    'Velocidade do jogo':'system.gamespeed','Mostrar debug':'system.debug','Resetar progresso':'progress.reset',
    '👁️ Boss secreto DEV':'spawn.dev','🌌 Trocar bioma':'world.next_biome','✨ Todos os upgrades supremos':'player.all_supremes',
    '🕶️ Skin ADMIN (glitch)':'player.admin_skin','👑 Matar boss':'world.kill_boss','💀 Apocalipse (mata tudo)':'world.apocalypse'
  };
  const worldNames=/Noite|Chuva$|bioma|tempo|Limpar inimigos|Terremoto|Congelar tudo/i;
  const spawnNames=/Boss|Horda|Elite|galinhas|Patos|Dinossauros|Matilha|Festa do chefão/i;
  const playerNames=/Invencível|Dano ×10|Curar|upgrade|níve|Skin ADMIN|Modo gigante|Metralhadora|lâminas|Evolução suprema/i;
  const systemNames=/moedas|skins|Velocidade do jogo|debug|Resetar|dinheiro/i;
  const dangerNames=/Resetar progresso|Apocalipse|Matar boss/i;
  function categoryFor(label,origin){
    if(systemNames.test(label))return 'system';if(playerNames.test(label))return 'player';if(spawnNames.test(label))return 'spawn';if(worldNames.test(label))return 'world';
    return origin==='ag_u'?'player':origin==='ag_c'?'system':'events';
  }
  function permissionFor(cat,label){
    if(/moedas|skins|Resetar progresso/i.test(label))return 'admin.economy';
    if(cat==='system')return 'admin.system';return 'admin.gameplay';
  }
  function iconFor(label,cat){const m=label.match(/^\p{Extended_Pictographic}/u);if(m)return m[0];return {player:'🧍',spawn:'👹',events:'✨',world:'🌍',system:'⚙️'}[cat]||'⚡'}
  function cleanLabel(label){return label.replace(/^\p{Extended_Pictographic}\s*/u,'').trim()}

  const proxies=[];
  function captureGrid(id){
    const g=$e(id);if(!g)return;
    [...g.querySelectorAll(':scope > button')].forEach((b,idx)=>{
      if(b.dataset.adminCaptured)return;b.dataset.adminCaptured='1';
      let label=(b.textContent||'Comando').trim();
      if(/^\+?10[\.\s]?000\s*moedas$/i.test(label)){
        label='💰 Dar moedas…';b.textContent=label;b.onclick=openCoins;
      }
      const cat=categoryFor(label,id),baseId=canonical[cleanLabel(label)]||canonical[label]||('legacy.'+slug(label));
      let cmdId=baseId,n=2;while(commands.has(cmdId))cmdId=baseId+'.'+n++;
      const original=b.onclick;
      Bus.register({id:cmdId,label,category:cat,icon:iconFor(label,cat),permission:permissionFor(cat,label),danger:dangerNames.test(label),requiresRun:cat!=='system'&&!/skins|moedas|debug|Velocidade do jogo|Resetar progresso|Skin ADMIN/i.test(label),local:()=>original&&original.call(b)});
      proxies.push({id:cmdId,label,cat,button:b,icon:iconFor(label,cat)});
    });
  }
  captureGrid('ag_u');captureGrid('ag_a');captureGrid('ag_c');

  // ===== Shell =====
  const shell=document.createElement('div');shell.id='admPro';
  shell.innerHTML=`
    <div class="admpro-statusbar">
      <div class="admpro-brand"><b>108 ADMIN</b><span>COMMAND CENTER · MOBILE</span></div>
      <div class="admpro-live"><span id="admProConn" class="offline">● OFFLINE</span><span id="admProRun">SEM RUN</span></div>
    </div>
    <div class="admpro-toolbar">
      <label class="admpro-search"><span>⌕</span><input id="admProSearch" autocomplete="off" placeholder="Buscar comando…"></label>
      <label class="admpro-target"><span>ALVO</span><select id="admProTarget"></select></label>
    </div>
    <nav id="admProNav" class="admpro-nav">
      <button data-page="home" class="on">⌂ Início</button><button data-page="player">🧍 Jogador</button><button data-page="spawn">👹 Spawns</button><button data-page="events">✨ Eventos</button><button data-page="world">🌍 Mundo</button><button data-page="system">⚙️ Sistema</button><button data-page="online">🌐 Online</button>
    </nav>
    <div class="admpro-pages">
      <section data-view="home" class="on"><div class="admpro-homegrid"><article class="admpro-card"><small>PARTIDA</small><div id="admProStats" class="admpro-stats"></div></article><article class="admpro-card"><small>FAVORITOS</small><div id="admProFavs" class="admpro-mini"></div></article></div><div class="admpro-title">Acesso rápido</div><div id="admProQuick" class="admpro-grid"></div></section>
      <section data-view="player"><div class="admpro-title">Jogador & build</div><div id="admProPlayer" class="admpro-grid"></div><div class="admpro-card admpro-tool"><small>DAR UPGRADE ESPECÍFICO</small><div id="admProUpgradeTool"></div></div><div class="admpro-card admpro-tool"><small>PERMANENTES</small><div id="admProPerm"></div></div></section>
      <section data-view="spawn"><div class="admpro-card admpro-tool"><small>SPAWN DIRETO</small><div id="admProSpawnTool"></div></div><div class="admpro-title">Bosses, hordas e criaturas</div><div id="admProSpawn" class="admpro-grid"></div></section>
      <section data-view="events"><div class="admpro-card admpro-tool"><small>CONTROLE DE EVENTOS</small><div id="admProStop"></div></div><div class="admpro-title">Admin abuse</div><div id="admProEvents" class="admpro-grid"></div></section>
      <section data-view="world"><div class="admpro-title">Mundo & partida</div><div id="admProWorld" class="admpro-grid"></div></section>
      <section data-view="system"><div class="admpro-title">Sistema & progresso</div><div id="admProSystem" class="admpro-grid"></div></section>
      <section data-view="online"><div class="admpro-onlinehero"><span>🌐</span><div><b id="admProOnlineTitle">PRONTO PARA SERVIDOR</b><small id="admProOnlineSub">Hoje os comandos rodam localmente. A interface já envia pacotes sc.admin.v1 quando um transporte online for conectado.</small></div></div><div class="admpro-onlinegrid"><article class="admpro-card"><small>TRANSPORTE</small><b id="admProTransport">LOCAL / OFFLINE</b><p>O cliente nunca deve decidir permissão no online. O servidor recebe commandId, target, args e permission e revalida tudo.</p></article><article class="admpro-card"><small>PROTOCOLO</small><b>sc.admin.v1</b><p>IDs estáveis de comando, requestId único, alvo explícito e contexto da partida.</p></article></div><div class="admpro-title">Atividade recente</div><div id="admProLog" class="admpro-log"></div></section>
    </div>
    <div id="admProToast" class="admpro-toast"></div>`;
  apan.appendChild(shell);

  // Old navigation remains as the functional command source, but is no longer the UI.
  ['amenu','s_u','s_a','s_c'].forEach(id=>{const el=$e(id);if(el)el.classList.add('admpro-legacy-hidden')});

  function makeProxy(p,quick=false){
    const card=document.createElement('div');card.className='admpro-command'+(dangerNames.test(p.label)?' danger':'');card.dataset.search=(p.label+' '+p.cat).toLowerCase();card.dataset.command=p.id;
    const main=document.createElement('button');main.className='admpro-command-main';main.innerHTML='<span class="ico">'+p.icon+'</span><span class="txt"><b>'+safeText(cleanLabel(p.label))+'</b><small>'+({player:'Jogador',spawn:'Spawn',events:'Evento',world:'Mundo',system:'Sistema'}[p.cat]||'Admin')+'</small></span><span class="go">›</span>';
    main.onclick=()=>Bus.execute(p.id);
    const star=document.createElement('button');star.className='admpro-star'+(favs.has(p.id)?' on':'');star.textContent=favs.has(p.id)?'★':'☆';star.title='Favoritar';
    star.onclick=e=>{e.stopPropagation();favs.has(p.id)?favs.delete(p.id):favs.add(p.id);writeFavs(favs);renderFavs();renderStars()};
    card.append(main,star);if(quick)card.classList.add('quick');return card;
  }
  const byCat={player:$e('admProPlayer'),spawn:$e('admProSpawn'),events:$e('admProEvents'),world:$e('admProWorld'),system:$e('admProSystem')};
  proxies.forEach(p=>byCat[p.cat]?.appendChild(makeProxy(p)));

  // High-frequency actions on the home page.
  const quickIds=['player.god','player.heal','spawn.boss1','spawn.dev','spawn.horde40','world.clear_enemies','system.debug','system.gamespeed'];
  quickIds.forEach(id=>{const p=proxies.find(x=>x.id===id);if(p)$e('admProQuick').appendChild(makeProxy(p,true))});

  // Move the original live controls; their existing event handlers are preserved.
  const upgradeTool=$e('admProUpgradeTool'),spawnTool=$e('admProSpawnTool'),permTool=$e('admProPerm'),stopTool=$e('admProStop');
  const aup=$e('aup'),aug=$e('aug');if(aup&&aug){const row=document.createElement('div');row.className='admpro-inline';row.append(aup,aug);upgradeTool.appendChild(row)}
  const asp=$e('asp'),as1=$e('as1'),as10=$e('as10');if(asp&&as1&&as10){const row=document.createElement('div');row.className='admpro-spawnline';row.append(asp,as1,as10);spawnTool.appendChild(row)}
  const agp=$e('ag_p');if(agp)permTool.appendChild(agp);
  const stopall=$e('stopall');if(stopall)stopTool.appendChild(stopall);

  function renderTargets(){
    const s=$e('admProTarget');if(!s)return;s.innerHTML='';players.forEach(p=>{const o=document.createElement('option');o.value=p.id;o.textContent=p.name||p.id;s.appendChild(o)});
    if(transport){const all=document.createElement('option');all.value='all';all.textContent='Todos os jogadores';s.appendChild(all)}
    if(![...s.options].some(o=>o.value===targetId))targetId='self';s.value=targetId;
  }
  renderTargets();$e('admProTarget').onchange=e=>{targetId=e.target.value};

  function renderStars(){document.querySelectorAll('.admpro-command').forEach(c=>{const s=c.querySelector('.admpro-star'),id=c.dataset.command;if(s){s.classList.toggle('on',favs.has(id));s.textContent=favs.has(id)?'★':'☆'}})}
  function renderFavs(){
    const d=$e('admProFavs');d.innerHTML='';const list=proxies.filter(p=>favs.has(p.id)).slice(0,6);
    if(!list.length){d.innerHTML='<span class="admpro-empty">Toque ☆ nos comandos que você mais usa.</span>';return}
    list.forEach(p=>{const b=document.createElement('button');b.textContent=p.icon+' '+cleanLabel(p.label);b.onclick=()=>Bus.execute(p.id);d.appendChild(b)})
  }
  renderFavs();

  function renderStats(){
    const d=$e('admProStats');if(!d)return;
    const run=runContext().runActive;
    d.innerHTML='<span><b>'+fmt(typeof S!=='undefined'?S.coins:0)+'</b><small>MOEDAS</small></span><span><b>'+(run&&typeof E!=='undefined'?E.filter(e=>!e.dead).length:'—')+'</b><small>INIMIGOS</small></span><span><b>'+(run&&typeof T!=='undefined'?Math.floor(T/60)+':'+String(Math.floor(T%60)).padStart(2,'0'):'—')+'</b><small>TEMPO</small></span><span><b>'+(run&&typeof bossE!=='undefined'&&bossE?'SIM':'NÃO')+'</b><small>BOSS</small></span>';
    const rr=$e('admProRun');if(rr)rr.textContent=run?'RUN ATIVA':'SEM RUN';
  }
  function renderOnlineStatus(){
    const c=$e('admProConn'),t=$e('admProTransport');if(c){c.className=transport?'online':'offline';c.textContent=transport?'● ONLINE':'● OFFLINE'}if(t)t.textContent=transport?(transportMeta.serverId?'SERVIDOR · '+transportMeta.serverId:'SERVIDOR CONECTADO'):'LOCAL / OFFLINE';
  }
  renderOnlineStatus();

  const pages=[...shell.querySelectorAll('[data-view]')],nav=[...shell.querySelectorAll('[data-page]')];
  function openPage(id){nav.forEach(b=>b.classList.toggle('on',b.dataset.page===id));pages.forEach(v=>v.classList.toggle('on',v.dataset.view===id));const body=adm.querySelector('.cbody');if(body)body.scrollTop=0}
  nav.forEach(b=>b.onclick=()=>openPage(b.dataset.page));

  const search=$e('admProSearch');
  search.addEventListener('input',()=>{
    const q=search.value.trim().toLowerCase();
    document.querySelectorAll('.admpro-command').forEach(c=>c.hidden=!!q&&!c.dataset.search.includes(q));
    if(q){pages.forEach(v=>v.classList.add('searching'));nav.forEach(b=>b.classList.remove('on'))}else{pages.forEach(v=>v.classList.remove('searching'));openPage('home')}
  });

  let toastTimer=0;
  Bus.subscribe(ev=>{
    const t=$e('admProToast');if(!t)return;clearTimeout(toastTimer);t.className='admpro-toast on '+ev.type;t.textContent=ev.type==='confirm'?'⚠ '+ev.msg:ev.type==='error'?'✕ '+ev.msg:'✓ '+ev.msg;toastTimer=setTimeout(()=>t.classList.remove('on'),2200);
    renderStats();renderLog();
  });
  function renderLog(){
    const d=$e('admProLog');if(!d)return;d.innerHTML='';if(!recent.length){d.innerHTML='<div class="admpro-empty">Nenhum comando executado nesta sessão.</div>';return}
    recent.forEach(r=>{const row=document.createElement('div');row.innerHTML='<b>'+safeText(r.label)+'</b><span>'+new Date(r.time).toLocaleTimeString('pt-BR',{hour:'2-digit',minute:'2-digit',second:'2-digit'})+'</span>';d.appendChild(row)})
  }
  renderLog();

  // Make the header more informative while keeping the original close button/event.
  const title=adm.querySelector('.ctitle');if(title){const old=title.querySelector('span:not(.led)');if(old)old.textContent='ADMIN // COMMAND CENTER'}

  // Keyboard ergonomics on desktop, harmless on mobile.
  addEventListener('keydown',e=>{
    if(!adm.classList.contains('on'))return;
    if(e.key==='/'&&!/INPUT|SELECT|TEXTAREA/.test((e.target||{}).tagName||'')){e.preventDefault();search.focus()}
    if(e.key==='Escape'&&coinWrap.classList.contains('on'))closeCoins();
  });

  // Refresh live dashboard without touching gameplay.
  setInterval(()=>{if(adm.classList.contains('on')){renderStats();renderOnlineStatus()}},500);
  renderStats();

  // Public integration notes for the future online server:
  // SCAdminBus.setTransport(async packet => websocketRpc(packet), {serverId:'...'});
  // SCAdminBus.setPlayers([{id:'uid123',name:'Vitor'}, ...]);
  // The SERVER must authorize packet.permission + packet.commandId + packet.target before applying anything.
  console.log('[Mobile] Admin Command Center v2 enabled · server-ready protocol sc.admin.v1');
}catch(err){console.warn('[Mobile Admin Plus]',err)}
})();