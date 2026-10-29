/* ©criado por Vitor Ag/Nyx - 2026 */
/* ©criado por Vitor Ag/Nyx - 2026 */
/* ©criado por Vitor Ag/Nyx - 2026 */
(() => {
'use strict';
try{
  if(typeof MD==='undefined'||typeof CF==='undefined')return;
  const PROFILES=[
    {name:'Fácil',threat:1,hp:.90,dmg:.75,spawn:.95,reward:.32,pdmg:1.12,xp:1.05,boss:.95,special:'Fôlego extra: uma vez por partida, vida crítica ativa proteção e uma pequena cura.',tag:'ACESSÍVEL'},
    {name:'Médio',threat:2,hp:1.15,dmg:1.10,spawn:1.12,reward:.55,pdmg:1.00,xp:.92,boss:1.15,special:'Experiência padrão. A pressão cresce naturalmente com o tempo e com o bioma.',tag:'PADRÃO'},
    {name:'Difícil',threat:4,hp:1.85,dmg:1.62,spawn:1.55,reward:.88,pdmg:.88,xp:.78,boss:1.55,special:'Caçadores de Elite entram periodicamente. Bosses recebem reforço extra de vida, dano e ritmo.',tag:'CAÇADA'},
    {name:'Pesadelo',threat:5,hp:3.05,dmg:2.40,spawn:2.18,reward:1.18,pdmg:.70,xp:.60,boss:2.00,special:'Rupturas do Pesadelo combinam elites, hazard e hordas. Bosses ficam ainda mais agressivos.',tag:'ENDGAME'},
    {name:'Baby',threat:0,hp:.42,dmg:.20,spawn:1.05,reward:.06,pdmg:2.10,xp:1.30,boss:.50,special:'Modo brincadeira e treino. Quase não rende moedas/score para não virar modo de farm.',tag:'TREINO'}
  ];
  PROFILES.forEach((p,i)=>{if(MD[i]){MD[i].length=0;MD[i].push(p.name,p.hp,p.dmg,p.spawn,p.reward,p.pdmg,p.xp,p.boss)}});
  if(typeof DDESC!=='undefined')PROFILES.forEach((p,i)=>DDESC[i]=p.special);
  window.SCDifficulty={version:'3.0',profiles:PROFILES,get:()=>PROFILES[CF.m]||PROFILES[1]};

  const state={assist:0,eliteAt:0,ruptureAt:0,lastM:-1};
  const allowsThreatEvents=()=>CF.g!==2&&CF.g!==5;
  function resetThreat(){
    state.assist=0;state.lastM=CF.m;
    state.eliteAt=CF.m===2?95:CF.m===3?58:1e9;
    state.ruptureAt=CF.m===3?118:1e9;
  }

  const baseStart=start;
  start=function(){const out=baseStart.apply(this,arguments);resetThreat();return out};

  const baseBoss=boss;
  boss=function(){
    const n=E.length,out=baseBoss.apply(this,arguments);
    if(CF.m>=2){
      for(let i=n;i<E.length;i++){
        const e=E[i];if(!e||!e.boss||e.dv||e.__diff3)continue;e.__diff3=1;
        const hp=CF.m===3?1.15:1.08,dm=CF.m===3?1.10:1.05,cd=CF.m===3?.88:.95;
        e.hp*=hp;e.mh*=hp;e.dmg*=dm;e.bm=(e.bm||1)*dm;e.cd=Math.max(.65,(e.cd||2)*cd);
      }
    }
    return out;
  };

  function diffNotice(text){try{ban(text)}catch(_){}}
  function emergencyAssist(){
    if(CF.m!==0||state.assist||!P||P.dead||P.hp/P.mhp>.18)return;
    state.assist=1;P.hp=Math.min(P.mhp,P.hp+P.mhp*.18);P.iv=Math.max(P.iv||0,1.05);
    if(P.shM>0)P.sh=Math.max(P.sh||0,1);ult=Math.min(100,(ult||0)+8);
    try{FX.push({x:P.x,y:P.y,r:150,t:.4,ring:1});sfx('lvl')}catch(_){}
    diffNotice('FÔLEGO EXTRA · proteção de emergência');
  }
  function hardHunter(){
    if(CF.m!==2||!allowsThreatEvents()||T<state.eliteAt||bossE)return;
    state.eliteAt=T+78+R()*18;elite(T>720?2:1);diffNotice('DIFÍCIL · CAÇADOR DE ELITE');
  }
  function nightmareHunter(){
    if(CF.m!==3||!allowsThreatEvents()||T<state.eliteAt)return;
    state.eliteAt=T+46+R()*13;elite(T>540?2:1);if(T>900&&R()<.35)elite(1);diffNotice('PESADELO · ELITE À CAÇA');
  }
  function nightmareRupture(){
    if(CF.m!==3||!allowsThreatEvents()||T<state.ruptureAt)return;
    state.ruptureAt=T+102+R()*24;
    const amount=Math.min(22,10+Math.floor(T/240)*2);
    try{hazard()}catch(_){}
    if(E.length<250)ring(amount);elite(T>600?2:1);
    shake=Math.max(shake,11);flash=Math.max(flash,.35);diffNotice('RUPTURA DO PESADELO · sobreviva à pressão');
  }

  const baseUpd=upd;
  upd=function(dt){
    const out=baseUpd.apply(this,arguments);
    if(state.lastM!==CF.m&&T<1)resetThreat();
    emergencyAssist();hardHunter();nightmareHunter();nightmareRupture();
    return out;
  };

  function threatDots(n){let s='';for(let i=0;i<5;i++)s+='<i class="'+(i<n?'on':'')+'"></i>';return s}
  function mountBrief(){
    const panel=document.querySelector('#setup .panel.setup');if(!panel)return;
    const secs=[...panel.querySelectorAll('.sec')];const ds=secs.find(s=>(s.querySelector('.lbl')?.textContent||'').trim()==='Dificuldade');if(!ds)return;
    let card=document.getElementById('scDifficultyBrief');if(card)card.remove();
    const p=PROFILES[CF.m]||PROFILES[1];card=document.createElement('div');card.id='scDifficultyBrief';
    const reward=(p.reward).toFixed(2).replace('.',',');
    card.innerHTML='<div class="scDiffHead"><div><small>PERFIL DE AMEAÇA</small><b>'+p.name.toUpperCase()+' · '+p.tag+'</b></div><div class="scThreat">'+threatDots(p.threat)+'</div></div>'+
      '<div class="scDiffStats"><span>VIDA INIMIGA <b>×'+String(p.hp).replace('.',',')+'</b></span><span>DANO INIMIGO <b>×'+String(p.dmg).replace('.',',')+'</b></span><span>PRESSÃO <b>×'+String(p.spawn).replace('.',',')+'</b></span><span>RECOMPENSA <b>×'+reward+'</b></span></div>'+
      '<p>'+p.special+'</p>';
    ds.appendChild(card);
  }
  const prevSetup=setupUI;setupUI=function(){const out=prevSetup.apply(this,arguments);mountBrief();return out};

  console.log('[Mobile] Difficulty 3.0 enabled: distinct threat profiles, Hard hunters and Nightmare ruptures.');
}catch(err){console.warn('[Mobile Difficulty 3.0]',err)}
})();