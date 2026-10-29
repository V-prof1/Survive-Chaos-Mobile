/* ©criado por Vitor Ag/Nyx - 2026 */
/* ©criado por Vitor Ag/Nyx - 2026 */
/* ©criado por Vitor Ag/Nyx - 2026 */
/* Survive Chaos Mobile — Rare References & Funny Easter Eggs 27.0 */
(()=>{'use strict';
if(window.__SC_FUN_EGGS__)return;window.__SC_FUN_EGGS__=1;
let gameRoll=18+Math.random()*24,menuRoll=12+Math.random()*20,last=performance.now(),activeToast=null,lastId='';
const G=[
{id:'update',w:1.2,t:'🪟 WINDOWS UPDATE DO CAOS',x:'Atualizando arena... 99%. Não desligue os monstros.',b:'Windows Update do Caos travou em 99%. Padrão.'},
{id:'duck',w:1,t:'🦆 PATO FISCAL',x:'Ele veio auditar sua build. Não encontrou nota fiscal da ULT.',b:'🦆 Pato fiscal detectado.',fx:'ducks'},
{id:'sus',w:1.1,t:'📮 MUITO SUSPEITO',x:'Um inimigo vermelho saiu pelo duto. Provavelmente coincidência.',b:'📮 Um inimigo está suspeito demais.'},
{id:'cake',w:.8,t:'🎂 BOLO SUSPEITO',x:'O bolo continua suspeito. E não, você não vai ganhar um agora.',b:'🎂 O bolo parece... pouco confiável.'},
{id:'awake',w:.8,t:'🐉 JOGO ERRADO',x:'ECHO: “Finalmente acordou...” Não, pera. Jogo errado.',b:'🤖 ECHO abriu o roteiro de outro jogo.'},
{id:'404',w:1.25,t:'💻 ERRO 404',x:'Habilidade não encontrada. Sugestão: tente desviar.',b:'404: habilidade não encontrada.'},
{id:'clt',w:1,t:'📋 CLT DETECTADA',x:'O RH do caos quer conversar sobre seu desempenho e suas 47 horas extras.',b:'📋 O RH do caos está te procurando.'},
{id:'git',w:1,t:'🧑‍💻 DEV MOMENT',x:'DEV executou git push --force na realidade. Nada parece confiável agora.',b:'DEV fez push --force no universo.',fx:'shake'},
{id:'deathfake',w:.65,t:'💀 VOCÊ MORREU',x:'Brincadeira. Ainda não. Mas o jogo claramente considerou a possibilidade.',b:'💀 Quase. O jogo ensaiou sua tela de derrota.',cond:()=>{try{return P&&P.hp/P.mhp<.55}catch(_){return false}}},
{id:'matrix',w:.7,t:'🕶️ ESCOLHA DIFÍCIL',x:'A pílula vermelha não está no inventário. A azul também não.',b:'🕶️ A Matrix esqueceu de carregar os itens.'},
{id:'skill',w:1,t:'🎮 DIAGNÓSTICO',x:'Análise concluída: 10% build, 20% reflexo, 70% “confia”.',b:'🎮 Diagnóstico da run concluído.'},
{id:'creeper',w:.85,t:'🟩 SSSSS...?',x:'Alguma coisa quadrada fez um barulho suspeito atrás de você. Era só o caos.',b:'🟩 Nenhum bloco foi explodido. Ainda.',fx:'rainGreen'},
{id:'bonfire',w:.75,t:'🔥 FOGUEIRA ERRADA',x:'Você encontrou uma fogueira. Ela não salva progresso e nem sabe o que é Estus.',b:'🔥 Descanso negado: arena ocupada.',fx:'fire'},
{id:'stars',w:.7,t:'⭐ NÍVEL DE PROCURADO',x:'Cinco estrelas apareceram. A polícia decidiu não entrar nessa arena.',b:'⭐⭐⭐⭐⭐ Procurado por crimes contra o balanceamento.',fx:'stars'},
{id:'wild',w:.8,t:'⚡ UM SELVAGEM APARECEU',x:'Era um Slime. Você não tem Pokébola. Resolva do jeito tradicional.',b:'⚡ Sem captura. Só caos.'},
{id:'pot',w:.75,t:'🏺 INSTINTO HEROICO',x:'Há um pote imaginário perto. O jogo pede educadamente para você não quebrá-lo.',b:'🏺 O pote sobreviveu à sua presença.'},
{id:'jojo',w:.72,t:'✨ POSE INEXPLICÁVEL',x:'Por 0,3 segundos sua build ficou 80% mais dramática e 0% mais útil.',b:'✨ Uma pose excessivamente poderosa aconteceu.',fx:'pose'},
{id:'domain',w:.72,t:'🔴 EXPANSÃO DE DOMÍNIO',x:'Domínio ativado: “Área de Trabalho com 37 abas abertas”.',b:'🔴 Técnica amaldiçoada: multitarefa.',fx:'red'},
{id:'power',w:.8,t:'💥 MEDIDOR DE PODER',x:'A calculadora tentou medir seu poder. Ela fechou o aplicativo.',b:'💥 Valor fora do intervalo aceitável.'},
{id:'treasure',w:.72,t:'🏴‍☠️ O TESOURO',x:'O grande tesouro não está nessa arena. Provavelmente.',b:'🏴‍☠️ ECHO se recusa a revelar spoilers.'},
{id:'doom',w:.78,t:'🎸 MÚSICA PESADA',x:'Uma guitarra começou a tocar na sua cabeça. Nenhum demônio gostou disso.',b:'🎸 Intensidade aumentada em 0%. Dramaticidade +100%.'},
{id:'fnaf',w:.7,t:'📹 CÂMERA 6',x:'Sinal perdido. Felizmente você está olhando diretamente para o problema.',b:'📹 A câmera de segurança pediu demissão.'},
{id:'determination',w:.78,t:'❤️ DETERMINAÇÃO',x:'Você sente que continuar andando é uma excelente ideia.',b:'❤️ Determinação detectada.'},
{id:'blueShell',w:.68,t:'🐢 CASCO AZUL?',x:'Um casco azul procurou o primeiro colocado e desistiu ao ver esta arena.',b:'🐢 Nenhum veículo foi atingido.',fx:'blue'},
{id:'rings',w:.8,t:'💍 ANÉIS?',x:'Você ouviu um tilintar. Não havia anéis. Só XP no chão.',b:'💍 Velocidade de ouriço não incluída.',fx:'rings'},
{id:'pipe',w:.75,t:'🟢 CANO VERDE',x:'ECHO encontrou um cano verde e tentou entrar. A hitbox discordou.',b:'🟢 O encanador não trabalha neste turno.'},
{id:'pressf',w:.85,t:'⌨️ PRESSIONE F',x:'Para respeitar a quantidade de inimigos que você acabou de apagar.',b:'⌨️ Respeito enviado em formato digital.'},
{id:'wifi',w:.9,t:'📶 SINAL FRACO',x:'Wi‑Fi da arena: uma barra. Curiosamente o jogo continua offline.',b:'📶 Ping imaginário: 999 ms.'},
{id:'bluetooth',w:.86,t:'📡 BLUETOOTH',x:'Novo dispositivo encontrado: “BOSS_DESCONHECIDO”. Pareamento recusado.',b:'📡 Boss não pareado.'},
{id:'captcha',w:.82,t:'🤖 CAPTCHA',x:'Selecione todos os quadrados contendo “uma decisão ruim”. A tela inteira foi marcada.',b:'🤖 Verificação humana inconclusiva.'},
{id:'touchgrass',w:.75,t:'🌱 OBJETIVO SECRETO',x:'Toque na grama. A arena informa que isso não conta.',b:'🌱 Grama tocada tecnicamente.'},
{id:'npcunion',w:.72,t:'🤝 SINDICATO DOS NPCs',x:'Os inimigos solicitaram intervalo. O pedido foi ignorado pelo diretor de IA.',b:'🤝 Negociação coletiva falhou.'},
{id:'lootbox',w:.72,t:'📦 CAIXA MISTERIOSA',x:'Você encontrou uma caixa que definitivamente não custa dinheiro real. Ela também não existe.',b:'📦 Conteúdo: expectativa.'},
{id:'speedrun',w:.82,t:'⏱️ SPEEDRUN?',x:'Um cronômetro invisível começou. Ninguém homologou essa categoria.',b:'⏱️ Any% sobreviver ao próprio ego.'},
{id:'savepoint',w:.72,t:'💾 SALVANDO...',x:'Brincadeira. A run já sabe o que está fazendo.',b:'💾 Autosave emocional concluído.'}
];
const M=[
{id:'m_pipe',w:1,t:'🟢 ENCANAMENTO',x:'Um cano verde apareceu atrás do botão Jogar. ECHO recomenda não entrar.',fx:'icons',icons:'🟢⭐🍄'},
{id:'m_creeper',w:.9,t:'🟩 MENU MUITO QUADRADO',x:'Você ouviu um “ssss” no menu. Relaxa: aqui não tem explosão.',fx:'icons',icons:'🟩⬛🟩'},
{id:'m_pokemon',w:.95,t:'⚡ CURSOR SELVAGEM',x:'Um cursor selvagem apareceu! Ele fugiu antes de você escolher um ataque.',fx:'cursor'},
{id:'m_zelda',w:.85,t:'🏺 POTE INTACTO',x:'Parabéns. Você passou alguns segundos no menu sem destruir cerâmica.',fx:'icons',icons:'🏺💚✨'},
{id:'m_sonic',w:.9,t:'💨 VOCÊ AINDA ESTÁ AÍ?',x:'Um ouriço imaginário já teria apertado Jogar umas oito vezes.',fx:'play'},
{id:'m_jojo',w:.8,t:'✨ POSE DE MENU',x:'O logo ficou dramaticamente inclinado. Ninguém sabe por quê.',fx:'logoPose'},
{id:'m_domain',w:.78,t:'🔴 EXPANSÃO DE DOMÍNIO',x:'Domínio: “Configurações que você jurou que não ia mexer”.',fx:'red'},
{id:'m_fnaf',w:.78,t:'📹 TURNO DA NOITE',x:'Câmera 1: menu. Câmera 2: menu. Câmera 3: você ainda no menu.',fx:'scan'},
{id:'m_stars',w:.75,t:'⭐ CINCO ESTRELAS',x:'Você ainda nem apertou Jogar e já está sendo procurado.',fx:'stars'},
{id:'m_cake',w:.82,t:'🎂 SOBRE O BOLO',x:'Continua suspeito. O menu se recusa a comentar mais.',fx:'icons',icons:'🎂❓🧪'},
{id:'m_matrix',w:.72,t:'🕶️ DUAS OPÇÕES',x:'Escolha difícil: Jogar... ou continuar olhando o menu.',fx:'matrix'},
{id:'m_treasure',w:.72,t:'🏴‍☠️ CADÊ O TESOURO?',x:'Não está em Skins, nem em Conquistas. ECHO diz para parar de procurar spoilers.',fx:'icons',icons:'🏴‍☠️🗺️❌'},
{id:'m_power',w:.82,t:'💥 SCANNER DE PODER',x:'Tentando calcular seu poder no menu... resultado: ainda não apertou Jogar.',fx:'play'},
{id:'m_deathnote',w:.72,t:'📓 CAMPO DO NICK',x:'ECHO recomenda não digitar nomes em cadernos pretos misteriosos.',fx:'nick'},
{id:'m_konami',w:.75,t:'⬆️⬆️⬇️⬇️',x:'O menu sentiu uma sequência antiga no ar. Não, não vai entregar 30 vidas.',fx:'keys'},
{id:'m_xp',w:.85,t:'🖥️ SOM DE INICIALIZAÇÃO IMAGINÁRIO',x:'O computador de 2001 dentro do caos terminou de ligar.',fx:'logoGlitch'},
{id:'m_altf4',w:.88,t:'⌨️ DICA TOTALMENTE SEGURA',x:'ECHO recomenda NÃO testar Alt+F4 para ganhar moedas.',fx:'keys'},
{id:'m_bonfire',w:.76,t:'🔥 DESCANSAR?',x:'Não há fogueira no menu. Mas você pode respirar antes de apertar Jogar.',fx:'fire'},
{id:'m_pressstart',w:1,t:'🎮 PRESS START',x:'Tradição antiga detectada. Qualquer botão serve, menos o botão imaginário.',fx:'play'},
{id:'m_union',w:.8,t:'🤝 GREVE DOS BOTÕES',x:'Skins, Conquistas e Histórico exigiram férias. Jogar votou contra.',fx:'buttons'},
{id:'m_echo_sleep',w:.9,t:'🤖 ECHO AUSENTE',x:'ECHO está fingindo que entrou em modo de economia de bateria.',fx:'icons',icons:'🤖💤🔋'},
{id:'m_save',w:.82,t:'💾 SLOT DE SAVE',x:'Slot 1: caos. Slot 2: caos. Slot 3: adivinha.',fx:'icons',icons:'💾💾💾'},
{id:'m_hamster',w:.85,t:'🐹 SERVIDOR',x:'O hamster do servidor recebeu água. Mesmo o jogo sendo offline.',fx:'icons',icons:'🐹⚙️🥤'},
{id:'m_dlc',w:.8,t:'📦 DLC DETECTADA',x:'Conteúdo adicional encontrado: absolutamente nada. Preço: R$ 0,00.',fx:'icons',icons:'📦0️⃣✅'},
{id:'m_touchgrass',w:.8,t:'🌱 ANTES DE JOGAR',x:'Missão opcional: tocar grama real. Recompensa: vitamina D.',fx:'icons',icons:'🌱☀️🫳'},
{id:'m_wronggame',w:.82,t:'🗡️ ARMA ERRADA',x:'Uma espada lendária tentou entrar no inventário. O arsenal recusou a importação.',fx:'icons',icons:'🗡️✨🚫'},
{id:'m_menuBoss',w:.7,t:'👑 BOSS DO MENU',x:'O botão Jogar ganhou uma barra de vida imaginária. Ela já foi removida.',fx:'play'},
{id:'m_gta',w:.7,t:'🚗 MAPA ERRADO',x:'Cinco estrelas no canto. Nenhum carro. Definitivamente o jogo errado.',fx:'stars'},
{id:'m_captcha',w:.85,t:'🤖 VOCÊ É HUMANO?',x:'Clique em todas as imagens contendo caos. O menu inteiro acendeu.',fx:'buttons'},
{id:'m_404',w:.95,t:'💻 MENU 404',x:'Motivação para começar a run não encontrada.',fx:'logoGlitch'},
{id:'m_clt',w:.8,t:'📋 RH DO CAOS',x:'O botão Jogar perguntou se esse turno tem vale-refeição.',fx:'play'},
{id:'m_matrix2',w:.7,t:'🟩 CHUVA DIGITAL',x:'Por alguns segundos o menu se sentiu muito mais hacker do que realmente é.',fx:'matrix'},
{id:'m_achievement',w:.82,t:'🏆 CONQUISTA QUASE DESBLOQUEADA',x:'“Ficar encarando o menu por tempo demais.” Ainda não existe. Talvez.',fx:'icons',icons:'🏆👀⏳'}
];
const ALL=[...G,...M];
function tutorial(){try{return document.documentElement.classList.contains('sc-tut-practice')||document.documentElement.classList.contains('sc-guide-echo')||!!window.SCGuidedTour?.isActive?.()}catch(_){return false}}
function playing(){try{return typeof st!=='undefined'&&st==='play'&&!tutorial()}catch(_){return false}}
function menuing(){try{return typeof st!=='undefined'&&st==='menu'&&!tutorial()&&document.getElementById('menu')?.classList.contains('on')}catch(_){return false}}
function mount(){let d=document.getElementById('scFunEgg');if(d)return d;d=document.createElement('div');d.id='scFunEgg';d.innerHTML='<div class="scFunEggCard"><b id="scFunEggT"></b><span id="scFunEggX"></span></div>';const s=document.createElement('style');s.id='scFunEggStyle';s.textContent=`#scFunEgg{position:fixed;left:50%;top:max(14px,env(safe-area-inset-top));z-index:2147481200;transform:translate(-50%,-14px);opacity:0;pointer-events:none;transition:.18s ease;font-family:system-ui,sans-serif}#scFunEgg.on{opacity:1;transform:translate(-50%,0)}.scFunEggCard{width:min(560px,88vw);padding:10px 14px;border:1px solid rgba(255,255,255,.13);border-radius:14px;background:linear-gradient(180deg,rgba(20,20,24,.97),rgba(8,8,11,.97));box-shadow:0 16px 45px rgba(0,0,0,.48);text-align:center}.scFunEggCard b{display:block;color:#fff;font-size:12px;letter-spacing:.06em}.scFunEggCard span{display:block;margin-top:3px;color:#aaaab2;font-size:10px;line-height:1.35}.scFloatRef{position:fixed;z-index:2147481100;top:20%;left:-70px;font-size:30px;pointer-events:none;animation:scRefFly 3.8s linear forwards;filter:drop-shadow(0 5px 8px #000)}@keyframes scRefFly{from{transform:translateX(-80px) rotate(-8deg);opacity:0}10%{opacity:1}90%{opacity:1}to{transform:translateX(calc(100vw + 140px)) rotate(14deg);opacity:0}}.scRefStars{position:fixed;right:16px;top:16px;z-index:2147481090;font-size:24px;letter-spacing:2px;pointer-events:none;text-shadow:0 2px 8px #000;animation:scRefBlink .5s steps(2) 6}@keyframes scRefBlink{50%{opacity:.35}}.scRefRain{position:fixed;top:-50px;z-index:2147481080;pointer-events:none;font-size:22px;animation:scRefFall 2.8s linear forwards}@keyframes scRefFall{to{transform:translateY(calc(100vh + 100px)) rotate(300deg);opacity:.1}}#menu.scRefRed{box-shadow:inset 0 0 100px rgba(255,0,35,.28)}#menu.scRefMatrix{filter:hue-rotate(70deg) saturate(1.3)}#menu.scRefScan:after{content:'';position:absolute;inset:0;pointer-events:none;background:repeating-linear-gradient(0deg,transparent 0 4px,rgba(255,255,255,.035) 4px 5px)}#logo.scRefLogo{animation:scLogoRef .12s steps(2) 12}@keyframes scLogoRef{50%{transform:translate(3px,-1px) skew(-4deg);text-shadow:-4px 0 #0ff,4px 0 #f24}}#logo.scRefPose{transform:rotate(-5deg) scale(1.04)}#play.scRefPlay{animation:scPlayRef .28s ease-in-out 6}@keyframes scPlayRef{50%{transform:scale(1.035)}}.scRefButtons{animation:scButtonsRef .45s ease-in-out 4}@keyframes scButtonsRef{50%{transform:translateY(2px);opacity:.75}}`;document.head.appendChild(s);document.body.appendChild(d);return d}
function toast(e){const d=mount();document.getElementById('scFunEggT').textContent=e.t;document.getElementById('scFunEggX').textContent=e.x;d.classList.add('on');clearTimeout(activeToast);activeToast=setTimeout(()=>d.classList.remove('on'),3900);try{if(playing()&&typeof ban==='function')ban(e.b||e.t)}catch(_){} }
function floatIcons(chars='✨',count=5){const list=[...chars];for(let i=0;i<count;i++)setTimeout(()=>{const q=document.createElement('div');q.className='scFloatRef';q.textContent=list[i%list.length]||'✨';q.style.top=(12+Math.random()*72)+'%';q.style.left='-70px';q.style.animationDuration=(3+Math.random()*1.5)+'s';document.body.appendChild(q);setTimeout(()=>q.remove(),5200)},i*150)}
function stars(){const d=document.createElement('div');d.className='scRefStars';d.textContent='★★★★★';document.body.appendChild(d);setTimeout(()=>d.remove(),3200)}
function rain(chars='01',count=14){const list=[...chars];for(let i=0;i<count;i++){const q=document.createElement('div');q.className='scRefRain';q.textContent=list[i%list.length];q.style.left=(Math.random()*100)+'vw';q.style.animationDelay=(Math.random()*.7)+'s';q.style.animationDuration=(2.1+Math.random()*1.5)+'s';document.body.appendChild(q);setTimeout(()=>q.remove(),4300)}}
function tempClass(el,c,ms=2600){if(!el)return;el.classList.add(c);setTimeout(()=>el.classList.remove(c),ms)}
function fx(e){const menu=document.getElementById('menu'),logo=document.getElementById('logo'),play=document.getElementById('play');switch(e.fx){case'ducks':floatIcons('🦆🪿',5);break;case'icons':floatIcons(e.icons||'✨',6);break;case'stars':stars();break;case'rainGreen':rain('🟩⬛',12);break;case'fire':floatIcons('🔥✨',5);break;case'rings':floatIcons('💍✨',7);break;case'blue':floatIcons('🐢🔵',4);break;case'shake':try{shake=Math.max(shake||0,5)}catch(_){}break;case'red':tempClass(menu,'scRefRed');try{flash=Math.max(flash||0,.14)}catch(_){}break;case'pose':tempClass(logo,'scRefPose');break;case'logoPose':tempClass(logo,'scRefPose',3200);break;case'logoGlitch':tempClass(logo,'scRefLogo',2200);break;case'play':tempClass(play,'scRefPlay',2200);break;case'buttons':document.querySelectorAll('#menu button').forEach(b=>tempClass(b,'scRefButtons',2200));break;case'matrix':tempClass(menu,'scRefMatrix',3000);rain('01',14);break;case'scan':tempClass(menu,'scRefScan',3000);break;case'cursor':floatIcons('⚡◀️',4);break;case'nick':tempClass(document.getElementById('nick'),'scRefButtons');break;case'keys':floatIcons('⬆️⬇️⬅️➡️',7);break}}
function trigger(id){const e=ALL.find(q=>q.id===id)||ALL[Math.floor(Math.random()*ALL.length)];if(!e||(e.cond&&!e.cond()))return false;lastId=e.id;toast(e);fx(e);return true}
function choose(pool){const ok=pool.filter(e=>(!e.cond||e.cond())&&e.id!==lastId),src=ok.length?ok:pool,sum=src.reduce((a,e)=>a+e.w,0);let r=Math.random()*sum;for(const e of src){r-=e.w;if(r<=0)return e}return src[0]}
function tick(){const n=performance.now(),dt=Math.min(2,(n-last)/1000);last=n;if(tutorial())return;if(playing()){gameRoll-=dt;if(gameRoll<=0){gameRoll=18+Math.random()*24;if(Math.random()<.03){const e=choose(G);e&&trigger(e.id)}}return}if(menuing()){menuRoll-=dt;if(menuRoll<=0){menuRoll=12+Math.random()*20;if(Math.random()<.045){const e=choose(M);e&&trigger(e.id)}}}}
setInterval(tick,500);window.SCFunEvents={version:'27.0',events:ALL,gameEvents:G,menuEvents:M,trigger,rollNow:(scope)=>{const pool=scope==='menu'?M:scope==='game'?G:(menuing()?M:G),e=choose(pool);return e&&trigger(e.id)}};console.log('[Mobile] Rare references & funny easter eggs 27.0 enabled: gameplay + menu.');
})();