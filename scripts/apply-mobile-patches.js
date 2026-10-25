const fs=require('fs');
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
  'mobile-dev-baby-intro.js'
];
for(const file of extras)fs.copyFileSync('mobile-overrides/'+file,'www/'+file);

if(!html.includes('mobile-hud-editor-fix.css'))html=html.replace('</head>','<link rel="stylesheet" href="mobile-hud-editor-fix.css"></head>');
for(const js of ['mobile-kaneki-removal.js','mobile-xp-balance.js','mobile-hud-editor-fix.js','mobile-dev-baby-intro.js']){
  if(!html.includes(js))html=html.replace('</body>','<script src="'+js+'"></script></body>');
}
fs.writeFileSync(indexPath,html);

console.log('Skin Redesign 3.0 atlas retained for the existing base skins.');
console.log('Kaneki removed from Mobile runtime; save migration/refund enabled.');
console.log('XP Balance 4.0 enabled for difficulties, modes, extra modes and Infinite.');
console.log('HUD Editor 2.1 fix enabled: editor chrome can be hidden to move Dash/ULT freely.');
console.log('Baby DEV cinematic enabled: 9,999-kill face-off switches the fight to Nightmare before combat.');
