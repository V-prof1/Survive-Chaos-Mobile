const fs=require('fs');
const assert=require('assert');
const cp=require('child_process');
const read=p=>fs.readFileSync(p,'utf8');
const must=(s,q,msg)=>assert(s.includes(q),msg||`Missing: ${q}`);
const mustNot=(s,q,msg)=>assert(!s.includes(q),msg||`Unexpected: ${q}`);

const game=read('www/game.js');
const index=read('www/index.html');
const arsenal=read('www/mobile-arsenal-skins.js');
const balance=read('www/mobile-rebalance.js');
const difficulty=read('www/mobile-difficulty-plus.js');
const menuRefine=read('www/mobile-menu-refine.js');
const menuRefineCss=read('www/mobile-menu-refine.css');
const mainMenu=read('www/mobile-main-menu.js');
const mainMenuCss=read('www/mobile-main-menu.css');
const hudEditor=read('www/mobile-hud-editor.js');
const hudEditorCss=read('www/mobile-hud-editor.css');
const admin=read('www/mobile-admin-plus.js');
const adminCss=read('www/mobile-admin-plus.css');
const hud=read('www/mobile-hud-responsive.js');
const hudCss=read('www/mobile-hud-responsive.css');
const online=read('www/mobile-online.js');
const onlineCfg=read('www/mobile-online-config.js');
const onlineSocket=read('www/mobile-online-socket.js');
const onlineCss=read('www/mobile-online.css');
const ults=read('www/mobile-skin-ults.js');
const ultsCss=read('www/mobile-skin-ults.css');

for(const f of ['mobile-skin-ults.js','mobile-difficulty-plus.js','mobile-menu-refine.js','mobile-main-menu.js','mobile-hud-editor.js']){
  cp.execFileSync(process.execPath,['--check','www/'+f],{stdio:'inherit'});
}

// Runtime layers / retired experiments.
for(const q of ['mobile-arsenal-skins.js','mobile-rebalance.js','mobile-difficulty-plus.js','mobile-menu-refine.js','mobile-menu-refine.css','mobile-main-menu.js','mobile-main-menu.css','mobile-hud-editor.js','mobile-hud-editor.css','mobile-admin-plus.js','mobile-hud-responsive.js','mobile-hud-responsive.css','mobile-skin-ults.js','mobile-skin-ults.css','mobile-online-config.js','mobile-online.js','mobile-online-socket.js','mobile-online.css']) must(index,q,`${q} missing from index`);
for(const q of ['mobile-kaneki.js','mobile-kaneki-v2.js','mobile-kaneki.css','mobile-skins-v2.js','mobile-skins-v2.css']) mustNot(index,q,`${q} must not be injected`);

// Economy / arsenal / balance.
must(game,'SCArsenal.bullet(x,b)','Projectile skin hook missing');
must(game,'SCArsenal.orbital(x,q,a)','Orbital skin hook missing');
must(game,'RUN.boss*750','Score rebalance missing');
must(game,"earned+=Math.ceil(v*P.xpm*.35)",'Max-level XP conversion missing');
must(game,"earned+=2;sfx('coin')",'Coin pickup rebalance missing');
must(arsenal,"n:'Dourado'",'Golden arsenal missing');
must(arsenal,"n:'GLITCH'",'Special glitch arsenal missing');
must(arsenal,'5000000','Retired-skin migration/refund missing');
must(balance,'Dupla Ameaça','Double-boss mode missing');
must(balance,'Caçada de Elite','Elite Hunt mode missing');
must(balance,"['Pesadelo',2.80,2.25,2.05,1.05,.72,.62,1.85]",'Base Nightmare rebalance missing');

// Difficulty 3.0.
must(difficulty,"name:'Pesadelo',threat:5,hp:3.05,dmg:2.40,spawn:2.18,reward:1.18",'Nightmare 3.0 missing');
must(difficulty,'FÔLEGO EXTRA','Easy safety net missing');
must(difficulty,'DIFÍCIL · CAÇADOR DE ELITE','Hard hunter missing');
must(difficulty,'RUPTURA DO PESADELO','Nightmare rupture missing');
must(difficulty,"window.SCDifficulty={version:'3.0'",'Difficulty API missing');
must(difficulty,'e.hp*=hp;e.mh*=hp;e.dmg*=dm','Boss reinforcement missing');
must(difficulty,'scDifficultyBrief','Difficulty briefing missing');

// Pause/menu touch safety. The main-menu controller must NOT live here anymore.
must(menuRefine,"gfx:'auto'",'Graphics preference missing');
must(menuRefine,'scPauseSetting','Pause settings missing');
must(menuRefine,"toggle('shake')",'Shake option missing');
must(menuRefine,"toggle('flash')",'Flash option missing');
must(menuRefine,"toggle('compactHud')",'Compact HUD option missing');
must(menuRefine,'cycleMusic','Music selector missing');
must(menuRefine,'toggleSound','Sound toggle missing');
must(menuRefine,"window.SCMenuRefine={version:'1.2'",'Pause/menu refinement 1.2 missing');
must(menuRefine,'requestAnimationFrame(syncDom)','MutationObserver must be RAF-throttled');
mustNot(menuRefine,'MutationObserver(()=>{decorateButtons();mountPause();refreshPause()})','Observer must never refresh pause text directly');
must(menuRefine,'if(el&&el.textContent!==value)el.textContent=value','Pause text writes must be idempotent');
mustNot(menuRefine,'window.SCMainMenu','Legacy main-menu controller must not be duplicated inside menu-refine');
must(menuRefineCss,'#pause .scPausePanel','Pause panel styles missing');
must(menuRefineCss,'.scPauseGrid','Pause settings grid missing');
must(menuRefineCss,'#scDifficultyBrief','Difficulty briefing styles missing');
must(menuRefineCss,':not(#dash):not(#ult):not(#dash1):not(#ult1):not(#run):not(#run1)','Combat control exclusion missing');

// Main Menu 2.1: portrait hub + true landscape dashboard.
must(mainMenu,"window.SCMainMenu={version:'2.1'",'Main Menu 2.1 API missing');
must(mainMenu,"quick.className='scMenuQuick'",'Quick-actions section missing');
must(mainMenu,"systems.className='scMenuSystems'",'Progression systems section missing');
must(mainMenu,'mb.replaceChildren(account,primary,quick,systems,prefs)','Menu hierarchy missing');
must(mainMenu,"menu.dataset.scMenuLayout='responsive'",'Responsive layout marker missing');
must(mainMenuCss,'@media (orientation:portrait)','Portrait menu variant missing');
must(mainMenuCss,'@media (orientation:landscape)','Landscape menu variant missing');
must(mainMenuCss,"grid-template-areas:",'Landscape dashboard grid missing');
must(mainMenuCss,"'primary systems'",'Landscape two-column primary/systems row missing');
must(mainMenuCss,'grid-template-columns:repeat(3,minmax(0,1fr))','Portrait quick-card grid missing');
must(mainMenuCss,"content:'ATALHOS'",'Portrait shortcuts hierarchy missing');
must(mainMenuCss,"content:'PROGRESSÃO'",'Progression hierarchy missing');

// HUD editor.
must(hudEditor,"const PROFILE_KEY='hudLayoutV2'",'HUD layout save key missing');
must(hudEditor,'portrait:{xp:[','Portrait HUD defaults missing');
must(hudEditor,'landscape:{xp:[','Landscape HUD defaults missing');
must(hudEditor,"label:'Dash',sel:'#dash'",'Dash target missing');
must(hudEditor,"label:'ULT',sel:'#ult'",'ULT target missing');
must(hudEditor,"label:'Run',sel:'#run'",'Run target missing');
must(hudEditor,'safePlacement','HUD safe-area clamping missing');
must(hudEditor,'RESETAR','HUD emergency reset missing');
must(hudEditor,'RESTAURAR ITEM','Per-item reset missing');
must(hudEditor,"window.SCHudEditor={version:'2.0'",'HUD editor API missing');
must(hudEditorCss,'.scHudCustom','Custom HUD placement styles missing');
must(hudEditorCss,'#scSetHudEditor','Adjust HUD pause entry missing');
must(hudEditorCss,'body.scHudEditing .scHudSelected','HUD selection style missing');

// Unique ULT layer.
must(ults,"protocol:'sc.ult.v1'",'ULT protocol missing');
must(ults,'SYSTEM // OVERRIDE','Apex ULT missing');
must(ults,'CEIFA DOURADA','Golden ULT missing');
must(ults,'if(idx===20)return 2.15','Apex ULT scaling missing');
must(ults,'Math.sqrt(Math.min(12000,price(idx))/12000)','Price scaling missing');
must(ults,'for(let i=1;i<=6;i++)','Six-wave sequence missing');
must(ults,'fireUlt=function()','ULT override missing');
must(ultsCss,'#scUltCanvas','ULT canvas missing');

// HUD/readability.
must(hud,'scPortraitStats','Portrait stats container missing');
must(hud,'scPortraitKills','Portrait kills chip missing');
must(hud,'scPortraitScore','Portrait score chip missing');
must(hudCss,'@media (orientation:portrait)','Portrait HUD media query missing');
must(hudCss,'#hud #kl{display:none!important}','Legacy mixed stats must be hidden in portrait');
must(hudCss,'#proCombat','Portrait combo lane missing');
must(hudCss,'#proAnnouncer','Portrait announcer spacing missing');
must(hudCss,'#hud #boss','Portrait boss spacing missing');

// Online foundation stays disabled until configured.
must(onlineCfg,'enabled:false','Online backend must stay disabled until configured');
must(onlineCfg,"redirectUrl:'survivechaos://auth/callback'",'OAuth callback missing');
mustNot(onlineCfg,'service_role','Private service credentials must never be shipped');
must(online,"protocol:cfg.protocol||'sc.online.v1'",'Online protocol missing');
must(online,"flowType:'pkce'",'PKCE missing');
must(online,"provider:'google'",'Google auth preparation missing');
must(online,'exchangeCodeForSession(code)','OAuth exchange missing');
must(online,"from('player_saves')",'Cloud save integration missing');
must(online,"send('room.create'",'Room create contract missing');
must(online,"send('room.join'",'Room join contract missing');
must(online,"send('room.ready'",'Room ready contract missing');
must(onlineSocket,"socket.emit('sc:request'",'Socket request transport missing');
must(onlineSocket,"transports:['websocket','polling']",'Socket fallback missing');
must(onlineSocket,'session.access_token','Authenticated socket token missing');
must(onlineCss,'.scOnlinePanel','Online UI styles missing');

// Existing command-center protocol sanity checks remain guarded.
must(admin,"protocol:'sc.admin.v1'",'Command protocol missing');
must(admin,'window.SCAdminBus=Bus','Command bus missing');
must(admin,'setTransport(fn,meta={})','Server transport hook missing');
must(admin,'CONFIRM_REQUIRED','Dangerous-action confirmation missing');
must(adminCss,'@media(max-width:760px)','Mobile command-center layout missing');

console.log('Mobile static regression checks passed: balance, pause touch safety, Main Menu 2.1, HUD editor, online and ULT layers.');
