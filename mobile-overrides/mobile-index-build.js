(() => {
'use strict';
try{
  const $=id=>document.getElementById(id), clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
  const save=()=>{try{sv()}catch(_){}};
  const slug=s=>String(s||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'');
  const LIMIT={normal:8,supreme:2};
  S.scIndex=S.scIndex&&typeof S.scIndex==='object'?S.scIndex:{entries:{}};
  S.scIndex.entries=S.scIndex.entries&&typeof S.scIndex.entries==='object'?S.scIndex.entries:{};
  const IDX=S.scIndex.entries;
  const CATEGORY_ORDER=['Inimigos','Elites','Mini-bosses','Lendários','Bosses','Especiais'];
  const entries=[];
  const factionByAI={c:'MORTOS',w:'FERAIS',b:'FERAIS',s:'FERAIS',x:'VOLÁTEIS',a:'OCULTISTAS',n:'OCULTISTAS',g:'VAZIO',h:'CONSTRUTOS'};
  const rivals={MORTOS:'CONSTRUTOS',FERAIS:'VAZIO',OCULTISTAS:'FERAIS',CONSTRUTOS:'MORTOS',VAZIO:'FERAIS',VOLÁTEIS:'OCULTISTAS'};
  const baseDesc={
    'Zumbi':'Avança em linha reta e tenta vencer pelo volume. Parece simples sozinho, mas vira parede quando a horda fecha espaço.',
    'Corredor':'Unidade leve e agressiva que usa velocidade para encurtar distância antes que você consiga reposicionar.',
    'Arqueiro':'Mantém distância e pressiona com disparos, tentando forçar movimento enquanto outros inimigos cercam.',
    'Morcego':'Escaramuçador rápido. Orbita, muda de ângulo e entra em rasantes curtos para quebrar sua rota.',
    'Slime':'Criatura resistente que ocupa espaço e pode gerar versões menores ao morrer.',
    'Exploder':'Volátil suicida. Procura mergulhar no jogador e transformar proximidade em explosão.',
    'Bruxa':'Conjuradora de longo alcance. Prefere kite, canais e pressão por projéteis em vez de contato direto.',
    'Fantasma':'Predador de emboscada. Pode reposicionar de forma brusca e atacar por ângulos difíceis de antecipar.',
    'Lobisomem':'Caçador de salto. Circula a presa, prepara a investida e entra com explosão de velocidade.',
    'Golem':'Brutamontes lento e muito resistente. Usa golpes pesados de área para negar espaço.',
    'Necromante':'Controlador de campo. Mantém distância, invoca reforços e tenta alongar a luta.',
    'Lâmina Fantasma':'Assassino da Ruptura que combina mobilidade fantasma com emboscadas rápidas.',
    'Bruto de Ferrugem':'Tanque mecânico da Ruptura. Muito HP, golpes pesados e forte presença de linha de frente.',
    'Oráculo do Vazio':'Conjurador do Vazio que canaliza rituais, invoca pressão e pode ser interrompido por dano alto.',
    'Carrapato Prismático':'Volátil extremamente rápido que circula a arena antes de mergulhar para explodir.',
    'Artilheiro Caótico':'Atirador da Ruptura especializado em rajadas coordenadas de longa distância.',
    'Guardião do Abismo':'Juggernaut raro da Ruptura. Lento, gigantesco e capaz de gerar impactos de área brutais.'
  };
  const miniDesc={
    'Bastião Colossal':'Mutação de elite focada em resistência. Aguenta muito mais dano e domina espaço com força bruta.',
    'Predador Frenético':'Mutação agressiva que sacrifica segurança por velocidade e pressão constante.',
    'Arauto Espelhado':'Mutação tática criada para confundir posicionamento e responder ao ritmo da build.',
    'Sangue Imortal':'Mutação de sustain que transforma uma elite em uma ameaça longa e difícil de finalizar.',
    'Ninhada Alfa':'Mutação de pressão por número e domínio de área, feita para quebrar rotas seguras.',
    'QUEBRA-FLOW':'Surge quando seu combo/Flow está alto para interromper runs excessivamente confortáveis.',
    'CARRASCO DO INTOCÁVEL':'Caça jogadores que ficam muito tempo quase sem receber dano.',
    'QUEBRA-ESCUDOS':'Especialista em pressionar builds defensivas com muitas cargas de escudo.',
    'CAÇADOR CINÉTICO':'Persegue builds extremamente rápidas e tenta antecipar suas saídas.',
    'ALFA DA HORDA':'Mini-boss coringa do Director quando nenhuma outra condição especial domina a run.'
  };
  const miniSpawn={
    'Bastião Colossal':'Uma elite pode ascender para esta mutação. A chance cresce no late game e é maior no Pesadelo.',
    'Predador Frenético':'Uma elite pode ascender para esta mutação. A chance cresce no late game e é maior no Pesadelo.',
    'Arauto Espelhado':'Uma elite pode ascender para esta mutação. A chance cresce no late game e é maior no Pesadelo.',
    'Sangue Imortal':'Uma elite pode ascender para esta mutação. A chance cresce no late game e é maior no Pesadelo.',
    'Ninhada Alfa':'Uma elite pode ascender para esta mutação. A chance cresce no late game e é maior no Pesadelo.',
    'QUEBRA-FLOW':'Worldshift pode convocá-lo após alguns minutos se seu combo estiver muito alto.',
    'CARRASCO DO INTOCÁVEL':'Worldshift pode convocá-lo se você passar muito tempo sofrendo pouquíssimos golpes.',
    'QUEBRA-ESCUDOS':'Worldshift pode convocá-lo quando sua build acumula muitas cargas de escudo.',
    'CAÇADOR CINÉTICO':'Worldshift pode convocá-lo quando sua velocidade entra em patamar extremo.',
    'ALFA DA HORDA':'Worldshift usa este mini-boss como fallback de ameaça adaptativa.'
  };
  const legendaryDesc={
    'CAÇADOR CARMESIM':'Predador veloz que intensifica rajadas e perseguição conforme a luta se estende.',
    'VIÚVA BRANCA':'Lendária de controle radial, cobrindo saídas com padrões circulares.',
    'COLOSSO OCO':'Gigante lento e massivo que transforma proximidade em zonas de impacto.',
    'ENGENHEIRO MORTO':'Invocador mecânico que chama reforços e pode trazer elites para a luta.',
    'PREDADOR DO VAZIO':'Caçador de teleporte que reaparece perto do jogador e dispara por múltiplos ângulos.'
  };
  const bossDesc={
    'Guardião Podre':'Controla a arena com Prisão de Raízes e transforma a floresta em obstáculo ofensivo.',
    'Rainha Aranha':'Cria teias executoras, enxames e zonas que punem quem para no mesmo lugar.',
    'Colosso de Pedra':'Rompe o chão com falhas tectônicas e ataques de impacto de grande área.',
    'Ceifador da Meia-Noite':'Teleporta, aparece em ângulos cegos e executa cortes em cruz.',
    'Coveiro Maldito':'Abre o cemitério durante a luta e levanta mortos para dividir sua atenção.',
    'Banshee Lamentosa':'Usa gritos de repulsão para empurrar o jogador para posições perigosas.',
    'Cavaleiro Sem Cabeça':'Combina investidas com corridas de abóboras e pressão lateral.',
    'Lich Imperador':'Invoca três Filactérios; enquanto eles existem, o Lich entra em janela de proteção.',
    'Sapo Anciã':'Usa uma língua de longo alcance para puxar o jogador e quebrar posicionamento.',
    'Hidra do Lodo':'Ataca com múltiplas cabeças, criando pressão simultânea de vários lados.',
    'Bruxa do Brejo':'Espalha caldeirões e zonas amaldiçoadas que alteram quais partes da arena são seguras.',
    'Leviatã Podre':'Submerge, fica temporariamente inalvejável e reaparece em investidas violentas.',
    'Yeti Furioso':'Arremessa projéteis gigantes e força deslocamentos largos pela arena.',
    'Dama do Gelo':'Cria espelhos e espectros congelados para multiplicar ameaças visuais.',
    'Golem de Cristal':'Ativa Prisma Refletor, reduzindo dano por janelas enquanto lança cristais.',
    'Dragão Glacial':'Varre grandes partes da arena com Sopro do Zero e padrões congelantes.',
    'Sentinela Enferrujada':'Usa lock-on e mísseis que tentam prever para onde você está indo.',
    'Fornalha Viva':'Entra em Sobrecarga Térmica com lasers giratórios e pressão de área.',
    'Torre Tesla':'Alterna polaridade para puxar/empurrar o jogador enquanto dispara eletricidade.',
    'Núcleo Mestre':'Quebra as regras da partida e transforma a luta em side-scroller com gravidade, pulo e padrões próprios.'
  };
  const iconBase=['🧟','🏃','🏹','🦇','🦠','💣','🧙','👻','🐺','🗿','☠️','🗡️','⚙️','🔻','💠','🎯','🜏'];
  const catIcon={Inimigos:'☠️',Elites:'👹','Mini-bosses':'⚔️','Lendários':'🏆',Bosses:'👑',Especiais:'👁️'};
  function addEntry(e){entries.push(e);return e}
  function normalSpawn(d,name){const m=Number(d&&d[7])||0;let s=m<=0?'Pode entrar no pool desde o início da run.':`Entra no pool normal a partir de aproximadamente ${m} min.`;if(name==='Lâmina Fantasma'||name==='Bruto de Ferrugem'||name==='Oráculo do Vazio'||name==='Carrapato Prismático'||name==='Artilheiro Caótico'||name==='Guardião do Abismo')s+=' Também aparece em Assaltos da Ruptura e Cataclismos do Infinito.';return s}
  function factionFor(d,name){if(name==='Lâmina Fantasma'||name==='Oráculo do Vazio'||name==='Guardião do Abismo')return 'VAZIO';if(name==='Bruto de Ferrugem'||name==='Artilheiro Caótico')return 'CONSTRUTOS';return factionByAI[d&&d[9]]||'FERAIS'}
  function rebuildRegistry(){entries.length=0;
    (EN||[]).forEach((d,i)=>{if(!d||!d[0])return;const name=d[0],fac=factionFor(d,name),icon=iconBase[i]||'☠️';
      addEntry({id:'enemy:'+slug(name),cat:'Inimigos',name,icon,desc:baseDesc[name]||'Criatura hostil da horda.',spawn:normalSpawn(d,name),faction:fac,rival:rivals[fac]||'OUTROS GRUPOS'});
      addEntry({id:'elite:'+slug(name),cat:'Elites',name:'Elite '+name,icon:'👹',desc:`Versão elite de ${name}: muito mais resistente, mais perigosa e elegível a mutações especiais.`,spawn:'Pode surgir em eventos de Elite, contratos, modos especiais e sistemas de ameaça. Usa como base um inimigo já disponível no pool atual.',faction:fac,rival:rivals[fac]||'OUTROS GRUPOS'});
    });
    addEntry({id:'special:slime-menor',cat:'Especiais',name:'Slime Menor',icon:'🦠',desc:'Fragmento gerado por certos Slimes ao morrer. Pequeno, rápido de eliminar e perigoso apenas quando aparece em quantidade.',spawn:'Nasce da divisão de um Slime após a morte.',faction:'FERAIS',rival:'VAZIO'});
    Object.keys(miniDesc).forEach(n=>addEntry({id:'mini:'+slug(n),cat:'Mini-bosses',name:n,icon:'⚔️',desc:miniDesc[n],spawn:miniSpawn[n],faction:'AMEAÇA ADAPTATIVA',rival:'QUALQUER FACÇÃO QUE ATRAPALHE SUA CAÇADA'}));
    Object.keys(legendaryDesc).forEach(n=>addEntry({id:'legend:'+slug(n),cat:'Lendários',name:n,icon:'🏆',desc:legendaryDesc[n],spawn:'Aparece em Caçadas Lendárias e eventos raros do Worldshift. A presença é deliberadamente incomum.',faction:'LENDÁRIO',rival:'TODOS'}));
    (BS||[]).forEach((set,b)=>set.forEach((d,i)=>{const name=d[0];addEntry({id:'boss:'+slug(name),cat:'Bosses',name,icon:d[4]||'👑',desc:bossDesc[name]||'Boss de bioma com padrões próprios.',spawn:`${i+1}º boss de ${BI&&BI[b]?BI[b][0]:'seu bioma'}. No Clássico, sua janela padrão é perto de ${[5,10,15,20][i]} min; modos especiais podem antecipar ou repetir a luta.`,faction:'BOSS',rival:'O JOGADOR E FACÇÕES QUE INVADEM SUA ARENA'});}));
    addEntry({id:'special:nemesis',cat:'Especiais',name:'NÊMESIS',icon:'☠️',desc:'Um inimigo que sobrevive na memória da campanha depois de participar de sua derrota. Retorna em outra run com nível e mutação próprios.',spawn:'Pode nascer em runs futuras depois que o sistema Nêmesis registra um inimigo ligado a uma derrota anterior.',faction:'NÊMESIS',rival:'VOCÊ'});
    addEntry({id:'dev:dev',cat:'Especiais',name:'DEV',icon:'👁️',desc:'Boss secreto de 15 barras que ignora várias regras normais, usa poderes de admin e escala suas mecânicas ao longo de cinco biomas.',spawn:'Condição secreta revelada: Clássico ou Rápido + Infinito + Pistola + Baby/Difícil/Pesadelo; surge ao atingir 9.999 abates.',faction:'DEV',rival:'TUDO QUE EXISTE'});
  }
  rebuildRegistry();
  function record(id,extra){let r=IDX[id];if(!r)r=IDX[id]={kills:0,first:Date.now(),variants:[]};r.kills=(r.kills||0)+1;if(extra&&extra.variant&&!r.variants.includes(extra.variant))r.variants.push(extra.variant);save();return r.kills===1}
  function enemyName(e){if(!e)return'';if(e.scPack3Name)return e.scPack3Name;if(Number.isInteger(e.k)&&e.k>=0&&EN[e.k])return EN[e.k][0];return e.nm||''}
  function discover(e){if(!e)return;const name=enemyName(e);let fresh=false;
    if(e.boss){if(e.dv)fresh=record('dev:dev')||fresh;else if(e.nm)fresh=record('boss:'+slug(e.nm),{variant:e.scVariant})||fresh;}
    else{
      if(name)fresh=record('enemy:'+slug(name))||fresh;
      if(e.el&&name)fresh=record('elite:'+slug(name))||fresh;
      if(e.sm)fresh=record('special:slime-menor')||fresh;
      const mn=e.scMiniName||(e.scMiniBoss?e.scMiniName:'');if(mn)fresh=record('mini:'+slug(mn))||fresh;
      if(e.scLegendaryName)fresh=record('legend:'+slug(e.scLegendaryName))||fresh;
      if(e.scNemesis)fresh=record('special:nemesis')||fresh;
    }
    if(fresh){try{ban('📖 INDEX ATUALIZADA');sfx('lvl')}catch(_){};renderIndex()}
  }
  const oldKill=kill;kill=function(e){const was=e&&!e.dead;const out=oldKill.apply(this,arguments);if(was&&e&&e.dead)try{discover(e)}catch(err){console.warn('[Index discover]',err)}return out};

  function mountIndex(){if($('scEnemyIndex'))return;
    const d=document.createElement('div');d.id='scEnemyIndex';d.className='scr';d.innerHTML=`<div class="scIdxPanel"><div class="scIdxHead"><div><small>ARQUIVO DE AMEAÇAS</small><h2>INDEX</h2><p id="scIdxProg"></p></div><button class="btn g s" id="scIdxBack">← Voltar</button></div><div class="scIdxTools"><div id="scIdxTabs"></div><input id="scIdxSearch" placeholder="Buscar desbloqueados..." maxlength="30"></div><div id="scIdxGrid"></div></div><div id="scIdxDetail"><div class="scIdxDetailCard"><button id="scIdxClose">×</button><div id="scIdxDetailBody"></div></div></div>`;document.body.appendChild(d);
    $('scIdxBack').onclick=()=>{hide('scEnemyIndex');show('menu');st='menu'};$('scIdxClose').onclick=()=>$('scIdxDetail').classList.remove('on');$('scIdxDetail').onclick=e=>{if(e.target===$('scIdxDetail'))$('scIdxDetail').classList.remove('on')};$('scIdxSearch').oninput=()=>renderIndex();
    const stack=document.querySelector('#menu .stack');if(stack&&!$('scIdxBtn')){const b=document.createElement('button');b.id='scIdxBtn';b.className='btn g';b.textContent='📖 Index de Inimigos';b.onclick=()=>{hide('menu');show('scEnemyIndex');st='index';renderIndex()};stack.appendChild(b)}
  }
  let cat='Todos';
  function openDetail(e){const r=IDX[e.id];if(!r)return;const vars=(r.variants||[]).length?`<div><b>Variantes derrotadas</b><span>${r.variants.join(' · ')}</span></div>`:'';$('scIdxDetailBody').innerHTML=`<div class="scIdxBig">${e.icon}</div><small>${e.cat}</small><h2>${e.name}</h2><p>${e.desc}</p><div class="scIdxFacts"><div><b>Como aparece</b><span>${e.spawn}</span></div><div><b>Facção / comportamento</b><span>${e.faction||'DESCONHECIDA'}</span></div><div><b>Não gosta de</b><span>${e.rival||'OUTRAS AMEAÇAS'}</span></div>${vars}<div><b>Abates registrados</b><span>${r.kills||1}</span></div></div>`;$('scIdxDetail').classList.add('on')}
  function renderIndex(){mountIndex();const unlocked=entries.filter(e=>IDX[e.id]).length;$('scIdxProg').textContent=`${unlocked} / ${entries.length} identificados`;
    const tabs=$('scIdxTabs');tabs.innerHTML='';['Todos',...CATEGORY_ORDER].forEach(c=>{const b=document.createElement('button');b.className='scIdxTab'+(cat===c?' on':'');b.textContent=c;b.onclick=()=>{cat=c;renderIndex()};tabs.appendChild(b)});
    const q=($('scIdxSearch').value||'').trim().toLowerCase(),g=$('scIdxGrid');g.innerHTML='';
    entries.filter(e=>cat==='Todos'||e.cat===cat).forEach(e=>{const r=IDX[e.id],matches=!q||(r&&e.name.toLowerCase().includes(q));if(!matches)return;const b=document.createElement('button');b.className='scIdxCard'+(r?' open':' locked');if(!r){b.innerHTML='<span class="scIdxQ">?</span>';b.disabled=true}else{b.innerHTML=`<span class="scIdxIcon">${e.icon}</span><small>${e.cat}</small><b>${e.name}</b><i>${r.kills||1} abate${(r.kills||1)===1?'':'s'}</i>`;b.onclick=()=>openDetail(e)}g.appendChild(b)});
  }
  mountIndex();

  // Rivalidades reais do ecossistema: poucos checks, baixa frequência, sem custo alto de CPU.
  let ecoAt=0;function factionOfEnemy(e){if(!e||e.boss)return'';const n=enemyName(e);if(e.scLegendary)return'LENDÁRIO';if(e.scPack3Name)return factionFor(EN[e.k],n);return factionFor(EN[e.k],n)}
  function ecoConflict(){if(!P||!Array.isArray(E)||T<ecoAt)return;ecoAt=T+3.6;const a=E.filter(e=>e&&!e.dead&&!e.boss&&Math.hypot(e.x-P.x,e.y-P.y)>300);if(a.length<2)return;for(let z=0;z<2;z++){const x=a[Math.floor(Math.random()*a.length)],fx=factionOfEnemy(x),want=rivals[fx];if(!want)continue;const y=a.find(o=>o!==x&&factionOfEnemy(o)===want&&Math.hypot(o.x-x.x,o.y-x.y)<120);if(!y)continue;const d=Math.max(1,(x.dmg||4)*.22);y.hp=Math.max(1,y.hp-d);try{FX.push({x:y.x,y:y.y,r:10,t:.12,ring:1})}catch(_){}}}
  setInterval(()=>{if(st==='play')ecoConflict()},900);

  // ===== BUILD CAP: 8 famílias normais + 2 Supremas =====
  const usedNormal=()=>P&&P.lv?U.filter(u=>(P.lv[u[0]]||0)>0).length:0;
  const usedSupreme=()=>P&&P.lv?SUP.filter(u=>(P.lv[u[0]]||0)>0).length:0;
  function mountBuildSlots(){if(!$('cards')||$('scBuildSlots'))return;const d=document.createElement('div');d.id='scBuildSlots';d.innerHTML='<span id="scBuildNormal"></span><span id="scBuildSup"></span>';const cl=$('cl');cl.parentNode.insertBefore(d,cl)}
  function updateBuildSlots(){mountBuildSlots();if(!$('scBuildNormal')||!P)return;$('scBuildNormal').textContent=`BUILD ${usedNormal()}/${LIMIT.normal}`;$('scBuildSup').textContent=`SUPREMAS ${usedSupreme()}/${LIMIT.supreme}`;const c=$('cards');if(c)c.dataset.buildfull=usedNormal()>=LIMIT.normal?'1':'0'}
  const oldRoll=rollCards;rollCards=function(){if(!P||!P.lv||typeof oldRoll!=='function')return oldRoll&&oldRoll.apply(this,arguments);const classMode=typeof CF!=='undefined'&&CF.g===6;if(classMode){const o=oldRoll.apply(this,arguments);updateBuildSlots();return o}
    const keepU=U.slice(),keepS=SUP.slice();try{if(usedNormal()>=LIMIT.normal)U.splice(0,U.length,...keepU.filter(u=>(P.lv[u[0]]||0)>0));if(usedSupreme()>=LIMIT.supreme)SUP.splice(0,SUP.length);const out=oldRoll.apply(this,arguments);updateBuildSlots();if(Array.isArray(cur))cur.forEach((u,i)=>{const card=$('cl')&&$('cl').children[i];if(card&&u){const sp=u.length>5;card.dataset.slot=sp?'supreme':'normal';if(!sp&&(P.lv[u[0]]||0)===0&&usedNormal()===LIMIT.normal-1)card.classList.add('scLastSlot')}});return out}finally{U.splice(0,U.length,...keepU);SUP.splice(0,SUP.length,...keepS)}};
  const oldStart=start;start=function(){const out=oldStart.apply(this,arguments);setTimeout(updateBuildSlots,0);return out};
  const oldSetup=typeof setupUI==='function'?setupUI:null;if(oldSetup)setupUI=function(){const out=oldSetup.apply(this,arguments);setTimeout(()=>{const p=document.querySelector('#setup .panel');if(p&&!$('scBuildRule')){const d=document.createElement('div');d.id='scBuildRule';d.innerHTML='<b>🧬 REGRA DE BUILD</b><span>Escolha no máximo 8 famílias de upgrade e 2 Supremas. Depois de ocupar um slot, aquela família pode continuar subindo até o máximo.</span>';p.appendChild(d)}},0);return out};
  setInterval(()=>{if(st==='cards')updateBuildSlots()},350);
  window.SCEnemyIndex={version:'17.0',entries,save:S.scIndex,rebuild:rebuildRegistry,buildLimit:LIMIT,usedNormal,usedSupreme};
  console.log('[Mobile] Index & Build Identity 17.0 enabled: hidden enemy encyclopedia, kill discovery, faction rivalries, 8 upgrade families and 2 supreme slots.');
}catch(err){console.error('[Index & Build Identity 17.0]',err)}
})();
