const fs=require('fs');
require('./apply-mobile-patches-core.js');
fs.copyFileSync('mobile-overrides/player-skins-redesign.png','www/player-skins-redesign.png');
console.log('Skin Redesign 3.0 atlas copied into Mobile web assets.');
