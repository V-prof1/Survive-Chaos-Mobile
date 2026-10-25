const fs=require('fs');
const cp=require('child_process');
require('./apply-mobile-patches-core.js');

// Keep the currently approved base-skin redesign untouched.
fs.copyFileSync('mobile-overrides/player-skins-redesign.png','www/player-skins-redesign.png');

// Kaneki is no longer part of the Mobile runtime. The old source can remain in git history,
// but it is neither loaded nor packaged in the generated APK.
const indexPath='www/index.html';
let html=fs.readFileSync(indexPath,'utf8');
html=html.replace(/<script src="mobile-kaneki-reborn\.js"><\/script>/g,'');
try{fs.rmSync('www/mobile-kaneki-reborn.js',{force:true})}catch(_){}

const extras=[
  'mobile-kaneki-removal.js',
  'mobile-xp-balance.js',
  'mobile-hud-editor-fix.js',
  'mobile-hud-editor-fix.css',
  'mobile-dev-baby-intro.js',
  'mobile-activities-pack.js',
  'mobile-activities-pack.css',
  'mobile-modes-pack2.js',
  'mobile-modes-pack2.css',
  'mobile-replay-pack-v2.js',
  'mobile-replay-pack.css',
  'mobile-squad-ai.js',
  'mobile-defense-mobility.js',
  'mobile-reality-break.js',
  'mobile-uiux-overhaul.css',
  'mobile-uiux-overhaul.js',
  'mobile-uiux-red-theme.css',
  'mobile-custom-audio.css',
  'mobile-custom-audio.js',
  'mobile-endgame-pack.css',
  'mobile-endgame-pack.js',
  'mobile-endgame-fix.js',
  'mobile-economy-guard.js',
  'mobile-worldshift-pack.css',
  'mobile-worldshift-core.js',
  'mobile-worldshift-modes.js',
  'mobile-worldshift-threats.js'
];
for(const file of ['mobile-endgame-pack.js','mobile-endgame-fix.js','mobile-economy-guard.js','mobile-worldshift-core.js','mobile-worldshift-modes.js','mobile-worldshift-threats.js'])cp.execFileSync(process.execPath,['--check','mobile-overrides/'+file],{stdio:'inherit'});
for(const file of extras)fs.copyFileSync('mobile-overrides/'+file,'www/'+file);

// Crimson remains the main identity. Endgame/Worldshift UI and Custom Audio are final self-contained layers.
for(const css of ['mobile-hud-editor-fix.css','mobile-activities-pack.css','mobile-modes-pack2.css','mobile-replay-pack.css','mobile-uiux-overhaul.css','mobile-uiux-red-theme.css','mobile-custom-audio.css','mobile-endgame-pack.css','mobile-worldshift-pack.css']){
  if(!html.includes(css))html=html.replace('</head>','<link rel="stylesheet" href="'+css+'"></head>');
}
for(const js of ['mobile-kaneki-removal.js','mobile-xp-balance.js','mobile-hud-editor-fix.js','mobile-dev-baby-intro.js','mobile-activities-pack.js','mobile-modes-pack2.js','mobile-replay-pack-v2.js','mobile-squad-ai.js','mobile-defense-mobility.js','mobile-reality-break.js','mobile-uiux-overhaul.js','mobile-custom-audio.js','mobile-endgame-pack.js','mobile-endgame-fix.js','mobile-economy-guard.js','mobile-worldshift-core.js','mobile-worldshift-modes.js','mobile-worldshift-threats.js']){
  if(!html.includes(js))html=html.replace('</body>','<script src="'+js+'"></script></body>');
}
fs.writeFileSync(indexPath,html);

console.log('Skin Redesign 3.0 atlas retained for the existing base skins.');
console.log('Kaneki removed from Mobile runtime; save migration/refund enabled.');
console.log('XP Balance 4.0 enabled for difficulties, modes, extra modes and Infinite.');
console.log('HUD Editor 2.1 fix enabled: editor chrome can be hidden to move Dash/ULT freely.');
console.log('Baby DEV cinematic enabled: 9,999-kill face-off switches the fight to Nightmare before combat.');
console.log('Activities Pack 5.0 enabled: endless contracts, field operations, career milestones and adaptive performance governor.');
console.log('Modes Pack 6.0 enabled: Boss Rush, Bounty Hunt, Chaos Cycle, King of the Arena, Blitz, Ascension, Core Defense, Special Roulette and Chaos Encounters.');
console.log('Replay Pack 7.0 enabled: run routes, optional trials, boon drafts, Chaos Archive, weapon feats and end-of-run awards.');
console.log('Squad AI 8.0 enabled: coordinated plans, squad roles, predictive interception, attack staggering and adaptive tactical budgets.');
console.log('Defense & Mobility 9.0 enabled: shield cap/recharge reset plus skill-based Perfect Dash cooldown reset and stamina refund.');
console.log('Reality Break 10.0 enabled: five biome reality events, 20 unique boss gimmicks, DEV recompilation attacks and a full side-scroller Master Core fight.');
console.log('UI/UX Overhaul 11.0 enabled: unified design system, cleaner HUD, responsive menus, readable upgrades, cinematic boss UI and tactile/accessibility polish.');
console.log('Crimson Theme 12.0 enabled: black/white/red visual identity with gold reserved for exceptional rarity.');
console.log('Custom Audio 13.0 enabled: 21 offline replaceable music/SFX slots persisted in IndexedDB with no server dependency.');
console.log('Endgame Expansion 14.0 enabled: mastery, weapon evolutions, relic fusion, Nemesis, anomalies, secret rifts, EX bosses, Heat, skill trials, Codex, Hall, Chaos Absolute, finishers, chained secrets, build discovery, Flow, Boss Lab and Ascendant Chaos.');
console.log('Economy Guard 15.0 enabled: run payouts are controlled by duration/difficulty and cannot be duplicated by Ascendant Chaos.');
console.log('Worldshift Expansion 16.0 enabled: sectors, hybrid/corrupted biomes, gameplay weather, NPC choices, allies, interactive scenery, temporary weapons, mods, evolving hub, shareable seeds, adaptive threats, legendary hunts, boss variants and genre-shifting modes.');
