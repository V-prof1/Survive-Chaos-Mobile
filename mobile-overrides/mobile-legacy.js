/* ©criado por Vitor Ag/Nyx - 2026 */
/* ©criado por Vitor Ag/Nyx - 2026 */
/* ©criado por Vitor Ag/Nyx - 2026 */
(() => {
'use strict';
const $l=id=>document.getElementById(id), clamp=(v,a,b)=>Math.max(a,Math.min(b,v)), fmtL=n=>Math.floor(n||0).toLocaleString('pt-BR');
const LEG={nextNemesis:240,nemesisStage:0,nemesis:null,nextAnomaly:145,eventCount:0,curses:new Set(),curseOpen:false,lastT:0,tick:.12,surgeUntil:0,ended:false};
const WN=['Pistola','Escopeta','Rifle','Besta','Cajado'];
const MUTATORS=[
 {id:'glass',icon:'💎',name:'Mundo de Vidro',desc:'Você tem -35% de vida. Inimigos causam +20% dano.',reward:.55},
 {id:'swarm',icon:'🐜',name:'Enxame',desc:'Spawns normais podem criar cópias extras.',reward:.40},
 {id:'haste',icon:'⚡',name:'Aceleração Hostil',desc:'Inimigos se movem 32% mais rápido.',reward:.35},
 {id:'brutal',icon:'🩸',name:'Sem Misericórdia',desc:'Inimigos causam +45% dano.',reward:.50},
 {id:'elite',icon:'👑',name:'Temporada de Elites',desc:'Muito mais Elites e mutações Apex.',reward:.65},
 {id:'scarcity',icon:'☠️',name:'Escassez',desc:'Você recebe 28% menos XP.',reward:.30},
 {id:'dash',icon:'⛓️',name:'Dash Quebrado',desc:'Recarga do Dash 65% maior.',reward:.35},
 {id:'boss',icon:'🔥',name:'Boss em Fúria',desc:'Bosses têm +55% HP, +25% dano e +12% velocidade.',reward:.75}
];
const CURSES=[
 {id:'devil',icon:'😈',name:'Pacto do Demônio',desc:'+70% dano, porém -35% de vida máxima.',apply:p=>{p.dmg*=1.70;p.mhp*=.65;p.hp=Math.min(p.hp,p.mhp)}},
 {id:'clock',icon:'🕰️',name:'Relógio Negro',desc:'+30% cadência, porém Dash 45% mais lento para recarregar.',apply:p=>{p.rate*=.70;p.dashCd*=1.45}},
 {id:'lead',icon:'👑',name:'Coroa de Chumbo',desc:'+2 projéteis, porém -22% de velocidade.',apply:p=>{p.cnt+=2;p.sp*=.78}},
 {id:'greed',icon:'🪙',name:'Ídolo da Ganância',desc:'Muito mais moedas e crítico; -30% XP.',apply:p=>{p.scScavenge=(p.scScavenge||0)+.25;p.crit+=.08;p.xpm*=.70}},
 {id:'thorn',icon:'🌹',name:'Trono de Espinhos',desc:'+22% armadura; regeneração natural é reduzida.',apply:p=>{p.armor+=.22;p.regen=Math.max(0,(p.regen||0)-.5)}},
 {id:'abyss',icon:'👁️',name:'Olho do Abismo',desc:'+28% crítico e críticos muito mais fortes; -20% vida.',apply:p=>{p.crit+=.28;p.scCritDmg=(p.scCritDmg||0)+.40;p.mhp*=.8;p.hp=Math.min(p.hp,p.mhp)}},
 {id:'hunger',icon:'🩸',name:'Fome Eterna',desc:'+3 Vampirismo e +25% dano crítico de vida; drena vida lentamente.',apply:p=>{p.vamp=(p.vamp||0)+3;p.scLowDmg=(p.scLowDmg||0)+.25}},
 {id:'titan',icon:'🗿',name:'Carne de Titã',desc:'+120 vida e +15% armadura; -15% cadência.',apply:p=>{p.mhp+=120;p.hp+=120;p.armor+=.15;p.rate*=1.15}},
 {id:'chaos',icon:'☢️',name:'Marca do Caos',desc:'+40% dano e +15% cadência; perde 12% armadura.',apply:p=>{p.dmg*=1.4;p.rate*=.85;p.armor=Math.max(0,p.armor-.12)}},
 {id:'soul',icon:'💀',name:'Alma de Vidro',desc:'+5 orbitais e +3 aura; vida máxima cai 45%.',apply:p=>{p.orb=(p.orb||0)+5;p.aura=(p.aura||0)+3;p.mhp*=.55;p.hp=Math.min(p.hp,p.mhp)}}
];
const APEX=[
 {id:'art',icon:'🎆',name:'Artilheiro',apply:e=>{e.__apexCd=.8;e.col='#ff9a45'}},
 {id:'volatile',icon:'💣',name:'Volátil',apply:e=>{e.col='#ff5454'}},
 {id:'brood',icon:'🧬',name:'Procriador',apply:e=>{e.col='#cb65ff'}},
 {id:'phase',icon:'🌀',name:'Fásico',apply:e=>{e.__apexCd=3.2;e.col='#6ed7ff'}},
 {id:'sniper',icon:'🎯',name:'Atirador',apply:e=>{e.__apexCd=1.6;e.col='#ffd25c'}},
 {id:'leech',icon:'🧪',name:'Sanguessuga',apply:e=>{e.__leech=1;e.col='#55d68a'}}
];
const CHALLENGES=[
 {id:'k500',name:'Primeiro Massacre',desc:'500 abates',reward:5000,val:s=>s.kills||0,goal:500},
 {id:'k2500',name:'Triturador',desc:'2.500 abates',reward:20000,val:s=>s.kills||0,goal:2500},
 {id:'k10000',name:'Extinção',desc:'10.000 abates',reward:75000,val:s=>s.kills||0,goal:10000},
 {id:'b10',name:'Colecionador de Chefes',desc:'10 bosses derrotados',reward:15000,val:s=>s.bosses||0,goal:10},
 {id:'b50',name:'Matador de Deuses',desc:'50 bosses derrotados',reward:70000,val:s=>s.bosses||0,goal:50},
 {id:'n5',name:'Rivalidade',desc:'5 Nêmesis derrotados',reward:30000,val:s=>s.nemesis||0,goal:5},
 {id:'n25',name:'Sem Rivais',desc:'25 Nêmesis derrotados',reward:150000,val:s=>s.nemesis||0,goal:25},
 {id:'r10',name:'Veterano',desc:'10 runs finalizadas',reward:20000,val:s=>s.runs||0,goal:10},
 {id:'t1200',name:'Sobrevivente',desc:'Sobreviva 20 minutos em uma run',reward:50000,val:s=>s.bestTime||0,goal:1200},
 {id:'m10',name:'Arma Favorita',desc:'Chegue à Maestria 10',reward:25000,val:s=>masteryBest(),goal:10},
 {id:'m20',name:'Especialista',desc:'Chegue à Maestria 20',reward:80000,val:s=>masteryBest(),goal:20},
 {id:'m30',name:'Lenda do Arsenal',desc:'Chegue à Maestria 30',reward:250000,val:s=>masteryBest(),goal:30},
 {id:'c10',name:'Amaldiçoado',desc:'Aceite 10 Relíquias Amaldiçoadas',reward:60000,val:s=>s.curses||0,goal:10},
 {id:'e40',name:'Turista do Caos',desc:'Sobreviva a 40 anomalias',reward:60000,val:s=>s.events||0,goal:40}
];
function ensureLegacy(){S.scMastery=S.scMastery||{};S.scMutators=Array.isArray(S.scMutators)?S.scMutators:[];S.scStats=S.scStats||{};S.scClaimed=S.scClaimed||{};for(let i=0;i<5;i++)S.scMastery[i]=S.scMastery[i]||{lv:0,xp:0}}
function masteryNeed(lv){return Math.floor(35+Math.pow(lv+1,1.48)*22)}
function masteryBest(){ensureLegacy();return Math.max(...Object.values(S.scMastery).map(v=>v.lv||0),0)}
function addMastery(n){ensureLegacy();const k=Math.max(0,Math.min(4,CF.w||0)),m=S.scMastery[k];m.xp+=n;let up=0;while(m.lv<30&&m.xp>=masteryNeed(m.lv)){m.xp-=masteryNeed(m.lv);m.lv++;up++}if(up){try{ban(`⚔️ ${WN[k]} — MAESTRIA ${m.lv}`);sfx('boss2')}catch(_){}}sv()}
function applyMastery(p){ensureLegacy();const k=Math.max(0,Math.min(4,CF.w||0)),lv=S.scMastery[k].lv||0;if(!lv)return;p.dmg*=1+lv*.008;const tier=Math.floor(lv/5);if(k===0)p.crit+=tier*.015;if(k===1&&lv>=10)p.pierce+=Math.floor(lv/10);if(k===2)p.rate*=Math.pow(.97,tier);if(k===3)p.dmg*=1+tier*.04;if(k===4&&lv>=15)p.orb+=Math.floor(lv/15)}
function mut(id){return S.scMutators&&S.scMutators.includes(id)}
function rewardBonus(){return (S.scMutators||[]).reduce((a,id)=>a+(MUTATORS.find(m=>m.id===id)?.reward||0),0)}
function applyMutators(){for(const p of PL){if(mut('glass')){p.mhp*=.65;p.hp=Math.min(p.hp,p.mhp)}if(mut('dash'))p.dashCd*=1.65;if(mut('scarcity'))p.xpm*=.72;applyMastery(p)}}
function traitElite(e){if(!e||e.boss||e.__apex)return;const chance=mut('elite')?.92:.62;if(R()>chance)return;const a=APEX[Math.floor(R()*APEX.length)];e.__apex=a.id;e.__apexIcon=a.icon;e.__apexName=a.name;a.apply(e)}
function mountLegacy(){ensureLegacy();if(!$l('legacyBtn')){const stack=document.querySelector('#menu .stack');if(stack){const b=document.createElement('button');b.id='legacyBtn';b.className='btn legacyMain';b.innerHTML='<span>⚔</span> ARSENAL & DESAFIOS';const e=$l('econBtn');if(e&&e.parentNode===stack)stack.insertBefore(b,e.nextSibling);else stack.appendChild(b)}}if(!$l('legacy')){const d=document.createElement('div');d.className='scr';d.id='legacy';d.innerHTML='<div class="panel legacyPanel"><div class="legacyHead"><div><small>PROGRESSÃO MOBILE</small><h2>LEGADO DO CAOS</h2></div><div><b id="legacyCoins">0 🪙</b><small id="legacyReward">BÔNUS DE RUN ×1.00</small></div></div><div class="legacyTabs"><button id="legMaster" class="on">⚔ Maestria</button><button id="legMut">☢ Mutadores</button><button id="legChal">🏆 Desafios</button></div><div id="legMasterView"><div id="masterGrid" class="legacyGrid"></div></div><div id="legMutView" hidden><p class="legacyLead">Ative até 3 modificadores. Quanto mais cruel a run, maior o bônus de moedas ao final.</p><div id="mutGrid" class="legacyGrid"></div></div><div id="legChalView" hidden><div id="challengeGrid" class="legacyGrid"></div></div><button class="btn g" id="legacyBack">← Voltar ao menu</button></div>';document.body.appendChild(d)}if(!$l('curseDraft')){const d=document.createElement('div');d.id='curseDraft';d.innerHTML='<div class="cursePanel"><small>RECOMPENSA DO NÊMESIS</small><h2>ESCOLHA SUA MALDIÇÃO</h2><p>Quanto mais poderosa a bênção, pior o preço.</p><div id="curseGrid"></div></div>';document.body.appendChild(d)}if(!$l('legacyTier')){const hud=$l('hud');if(hud)hud.insertAdjacentHTML('beforeend','<div id="legacyTier"><b>CAOS I</b><span>NÊMESIS EM --:--</span></div>')}bindLegacy();renderLegacy()}
function bindLegacy(){const b=$l('legacyBtn');if(b&&!b.__l){b.__l=1;b.onclick=()=>{hide('menu');show('legacy');st='legacy';renderLegacy()}}const back=$l('legacyBack');if(back&&!back.__l){back.__l=1;back.onclick=()=>{hide('legacy');show('menu');st='menu';try{ref()}catch(_){}}}const tabs=[['legMaster','legMasterView'],['legMut','legMutView'],['legChal','legChalView']];tabs.forEach(([id,view])=>{const q=$l(id);if(q&&!q.__l){q.__l=1;q.onclick=()=>{tabs.forEach(([a,b])=>{$l(a)?.classList.toggle('on',a===id);if($l(b))$l(b).hidden=b!==view});renderLegacy()}}})}
function renderLegacy(){ensureLegacy();if(!$l('legacy'))return;$l('legacyCoins').textContent=fmtL(S.coins)+' 🪙';$l('legacyReward').textContent='BÔNUS DE RUN ×'+(1+rewardBonus()).toFixed(2);const mg=$l('masterGrid');if(mg){mg.innerHTML='';for(let i=0;i<5;i++){const m=S.scMastery[i],need=m.lv>=30?1:masteryNeed(m.lv),pct=m.lv>=30?100:clamp(m.xp/need*100,0,100),c=document.createElement('article');c.className='legacyCard mastery'+((CF.w||0)===i?' current':'');c.innerHTML=`<div class="legacyIcon">${['🔫','💥','⚙️','🏹','🔮'][i]}</div><div><h3>${WN[i]}</h3><p>+0,8% dano por nível · bônus únicos a cada 5 níveis.</p><div class="masterBar"><span>MAESTRIA ${m.lv}/30</span><i><b style="width:${pct}%"></b></i><small>${m.lv>=30?'MÁXIMO':fmtL(m.xp)+' / '+fmtL(need)+' XP'}</small></div></div>`;mg.appendChild(c)}}const ug=$l('mutGrid');if(ug){ug.innerHTML='';for(const m of MUTATORS){const on=mut(m.id),locked=!on&&(S.scMutators||[]).length>=3,c=document.createElement('button');c.className='legacyCard mut'+(on?' on':'');c.disabled=locked;c.innerHTML=`<div class="legacyIcon">${m.icon}</div><div><h3>${m.name}</h3><p>${m.desc}</p><small>RECOMPENSA +${Math.round(m.reward*100)}%</small></div><b>${on?'ATIVO':'ATIVAR'}</b>`;c.onclick=()=>{ensureLegacy();if(on)S.scMutators=S.scMutators.filter(v=>v!==m.id);else if(S.scMutators.length<3)S.scMutators.push(m.id);sv();renderLegacy()};ug.appendChild(c)}}const cg=$l('challengeGrid');if(cg){cg.innerHTML='';for(const c0 of CHALLENGES){const v=c0.val(S.scStats),done=!!S.scClaimed[c0.id],pct=clamp(v/c0.goal*100,0,100),c=document.createElement('article');c.className='legacyCard challenge'+(done?' done':'');c.innerHTML=`<div class="legacyIcon">${done?'✓':'🏆'}</div><div><h3>${c0.name}</h3><p>${c0.desc}</p><div class="masterBar"><i><b style="width:${pct}%"></b></i><small>${fmtL(Math.min(v,c0.goal))} / ${fmtL(c0.goal)}</small></div></div><b>${done?'CONCLUÍDO':fmtL(c0.reward)+' 🪙'}</b>`;cg.appendChild(c)}}}
function checkChallenges(){ensureLegacy();let gain=0;for(const c of CHALLENGES){if(S.scClaimed[c.id])continue;if(c.val(S.scStats)>=c.goal){S.scClaimed[c.id]=1;S.coins=(S.coins||0)+c.reward;gain+=c.reward}}if(gain){sv();try{ref();ban('🏆 DESAFIOS CONCLUÍDOS: +'+fmtL(gain)+' MOEDAS');sfx('boss2')}catch(_){}}}
function openCurse(){if(LEG.curseOpen||st!=='play')return;const pool=CURSES.filter(c=>!LEG.curses.has(c.id)).sort(()=>R()-.5).slice(0,3);if(!pool.length)return;mountLegacy();LEG.curseOpen=true;st='curseDraft';const g=$l('curseGrid');g.innerHTML='';for(const c of pool){const b=document.createElement('button');b.className='curseCard';b.innerHTML=`<span>${c.icon}</span><b>${c.name}</b><small>${c.desc}</small><i>RELÍQUIA AMALDIÇOADA</i>`;b.onclick=()=>{LEG.curses.add(c.id);for(const p of PL)c.apply(p);ensureLegacy();S.scStats.curses=(S.scStats.curses||0)+1;sv();checkChallenges();LEG.curseOpen=false;$l('curseDraft').classList.remove('on');st='play';try{ban('☠ MALDIÇÃO ACEITA: '+c.name);sfx('boss2')}catch(_){}};g.appendChild(b)}$l('curseDraft').classList.add('on')}
function spawnNemesis(){if(bossE||LEG.nemesis&&!LEG.nemesis.dead)return;LEG.nemesisStage++;const [px,py]=edge(),k=pick(),e=spawn(k,px,py,1);if(!e)return;const s=LEG.nemesisStage;e.__nemesis=1;e.em='☠️';e.contentName='NÊMESIS '+s;e.hp*=7+s*1.65;e.mh=e.hp;e.r*=1.45;e.sp*=1.08+Math.min(.25,s*.02);e.dmg*=1.65+s*.06;e.xp*=10;traitElite(e);LEG.nemesis=e;LEG.nextNemesis=T+180+Math.min(120,s*8);try{ban('☠ NÊMESIS '+s+' ENTROU NA ARENA');shake=Math.max(shake,12);flash=Math.max(flash,.25);sfx('boss2')}catch(_){}}
const ANOMALIES=[
 ['MARÉ CARMESIM','Uma horda comprimida invadiu a arena.',()=>ring(34+Math.min(70,Math.floor(T/90)*4))],
 ['PROCISSÃO APEX','Elites especiais foram liberados.',()=>elite(mut('elite')?6:4)],
 ['FOGO CRUZADO','Projéteis cercam sua posição.',()=>{for(let i=0;i<22;i++){const a=i/22*PI*2,d=260;EB.push({x:P.x+Math.cos(a)*d,y:P.y+Math.sin(a)*d,vx:-Math.cos(a)*125,vy:-Math.sin(a)*125,r:5,l:5,d:10+T/180,col:'#ff6a76'})}}],
 ['BLECAUTE','Visibilidade reduzida. Boa sorte.',()=>{dark=Math.max(dark,42)}],
 ['CHUVA DE SANGUE','Hordas e velocidade aumentadas temporariamente.',()=>{rain=Math.max(rain,38);horde=Math.max(horde,32)}],
 ['COFRE DO CAOS','Uma chuva de recursos apareceu.',()=>{for(let i=0;i<18;i++){const a=R()*PI*2,d=35+R()*180;G.push({x:P.x+Math.cos(a)*d,y:P.y+Math.sin(a)*d,v:1,k:i%6===0?4:2})}}],
 ['SOBRECARGA','Inimigos novos ficam mais violentos por 25 segundos.',()=>{LEG.surgeUntil=T+25}],
 ['RUPTURA TOTAL','Horda + Elites + escuridão.',()=>{ring(25);elite(2);dark=Math.max(dark,22)}]
];
function anomaly(){const a=ANOMALIES[Math.floor(R()*ANOMALIES.length)];LEG.eventCount++;ensureLegacy();S.scStats.events=(S.scStats.events||0)+1;sv();try{ban('⚠ '+a[0]+' — '+a[1]);sfx('boss2')}catch(_){}a[2]();LEG.nextAnomaly=T+125+R()*70;checkChallenges()}
const baseSpawnL=spawn;
spawn=function(k,px,py,el){const forceElite=el||(!el&&mut('elite')&&R()<.075),e=baseSpawnL.call(this,k,px,py,forceElite);if(!e)return e;const tier=Math.floor(T/300);if(tier>0&&!e.boss){const hp=1+tier*.11;e.hp*=hp;e.mh=e.hp;e.dmg*=1+tier*.075;e.sp*=1+Math.min(.22,tier*.025)}if(mut('haste'))e.sp*=1.32;if(mut('brutal'))e.dmg*=1.45;if(mut('glass'))e.dmg*=1.20;if(T<LEG.surgeUntil){e.sp*=1.18;e.dmg*=1.18}if(e.el&&!e.boss)traitElite(e);if(mut('swarm')&&!el&&!e.boss&&R()<.20){const c=baseSpawnL.call(this,k,px+R()*22-11,py+R()*22-11,0);if(c){c.hp*=.7;c.mh=c.hp;c.xp=Math.max(1,c.xp*.6)}}return e};
const baseBossL=boss;
boss=function(i){const out=baseBossL.apply(this,arguments);if(bossE){const tier=Math.floor(T/300);if(tier){bossE.hp*=1+tier*.10;bossE.mh=bossE.hp;bossE.dmg*=1+tier*.07}if(mut('boss')){bossE.hp*=1.55;bossE.mh=bossE.hp;bossE.dmg*=1.25;bossE.sp*=1.12}}return out};
const baseKillL=kill;
kill=function(e){const alive=e&&!e.dead,wasNem=alive&&e.__nemesis,wasBoss=alive&&e.boss,out=baseKillL.apply(this,arguments);if(!alive||!e||!e.dead)return out;ensureLegacy();S.scStats.kills=(S.scStats.kills||0)+1;if(wasBoss)S.scStats.bosses=(S.scStats.bosses||0)+1;addMastery(wasBoss?35:e.el?6:1);if(wasNem){S.scStats.nemesis=(S.scStats.nemesis||0)+1;earned+=250+LEG.nemesisStage*125;for(let i=0;i<12;i++)G.push({x:e.x+R()*40-20,y:e.y+R()*40-20,v:1,k:2});G.push({x:e.x,y:e.y,v:1,k:4});LEG.nemesis=null;setTimeout(()=>{if(st==='play')openCurse()},500)}if(e.__apex==='volatile')boom(e.x,e.y,95,Math.max(18,(P?.dmg||10)*1.1),180);if(e.__apex==='brood'){for(let i=0;i<3;i++){const c=spawn(1,e.x+R()*32-16,e.y+R()*32-16,0);if(c){c.hp=c.mh=Math.max(8,e.mh*.12);c.r=Math.max(6,e.r*.45);c.xp=1}}}if((S.scStats.kills||0)%25===0||wasBoss||wasNem){sv();checkChallenges()}return out};
const baseEndL=end;
end=function(win){if(st!=='over'&&!LEG.ended){LEG.ended=true;ensureLegacy();S.scStats.runs=(S.scStats.runs||0)+1;S.scStats.bestTime=Math.max(S.scStats.bestTime||0,Math.floor(T));const rb=rewardBonus();if(rb>0)earned+=Math.floor((kills*2.2+T*.45+LEG.nemesisStage*90)*rb);sv();checkChallenges()}return baseEndL.apply(this,arguments)};
const baseStartL=start;
start=function(){const out=baseStartL.apply(this,arguments);LEG.nextNemesis=240;LEG.nemesisStage=0;LEG.nemesis=null;LEG.nextAnomaly=145;LEG.eventCount=0;LEG.curses.clear();LEG.curseOpen=false;LEG.surgeUntil=0;LEG.ended=false;applyMutators();return out};
const baseDrawEL=drawE;
drawE=function(e){baseDrawEL.apply(this,arguments);if(e&&!e.dead&&(e.__apexIcon||e.__nemesis)){x.save();x.textAlign='center';x.font='700 13px Nunito';x.lineWidth=3;x.strokeStyle='rgba(0,0,0,.9)';x.fillStyle=e.__nemesis?'#ff4058':'#fff';const t=e.__nemesis?'☠ NÊMESIS':e.__apexIcon+' '+e.__apexName;x.strokeText(t,e.x,e.y-e.r*2.1);x.fillText(t,e.x,e.y-e.r*2.1);x.restore()}};
function tickLegacy(now){try{mountLegacy();if(st==='play'){const dt=Math.min(.08,Math.max(0,(T-LEG.lastT)||0));LEG.lastT=T;if(T>=LEG.nextNemesis&&!bossE)spawnNemesis();if(T>=LEG.nextAnomaly&&!bossE)anomaly();for(const e of E){if(e.dead||!e.__apex)continue;if(e.__leech)e.hp=Math.min(e.mh,e.hp+e.mh*.006*dt);if(e.__apexCd!==undefined){e.__apexCd-=dt;if(e.__apexCd<=0){if(e.__apex==='art'){radial(e,7,115,R()*PI*2,'#ff9a45');e.__apexCd=1.7}else if(e.__apex==='sniper'){aim(e,220,0,e.dmg*.65,5,'#ffd25c');e.__apexCd=2.2}else if(e.__apex==='phase'){const a=R()*PI*2,d=120+R()*100;e.x=P.x+Math.cos(a)*d;e.y=P.y+Math.sin(a)*d;FX.push({x:e.x,y:e.y,r:55,t:.2,ring:1});e.__apexCd=4.2}}}if(LEG.curses.has('hunger')&&P&&!P.dead){LEG.tick-=dt;if(LEG.tick<=0){LEG.tick=6;P.hp=Math.max(1,P.hp-P.mhp*.018)}}const t=Math.floor(T/300)+1,el=$l('legacyTier');if(el){el.classList.add('on');el.querySelector('b').textContent='CAOS '+['I','II','III','IV','V','VI','VII','VIII','IX','X'][Math.min(9,t-1)];const rem=Math.max(0,LEG.nextNemesis-T);el.querySelector('span').textContent='NÊMESIS EM '+Math.floor(rem/60)+':'+String(Math.floor(rem%60)).padStart(2,'0')}}}else{LEG.lastT=typeof T==='number'?T:0;$l('legacyTier')?.classList.remove('on')}}catch(err){console.warn('[Mobile Legacy]',err)}requestAnimationFrame(tickLegacy)}
mountLegacy();requestAnimationFrame(tickLegacy);
})();