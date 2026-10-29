/* ©criado por Vitor Ag/Nyx - 2026 */
/* ©criado por Vitor Ag/Nyx - 2026 */
/* ©criado por Vitor Ag/Nyx - 2026 */
const fs=require('fs');
for(const file of ['mobile-skin-ults.js','mobile-skin-ults.css']){
  const src=`mobile-overrides/${file}`,dst=`www/${file}`;
  if(!fs.existsSync(src))throw new Error(`Missing ${src}`);
  fs.copyFileSync(src,dst);
}
const p='www/index.html';let html=fs.readFileSync(p,'utf8');
if(!html.includes('mobile-skin-ults.css'))html=html.replace('</head>','<link rel="stylesheet" href="mobile-skin-ults.css"></head>');
if(!html.includes('mobile-skin-ults.js'))html=html.replace('</body>','<script src="mobile-skin-ults.js"></script></body>');
fs.writeFileSync(p,html);
console.log('Skin ULT v1 integrated: 21 animated ultimates, price-scaled power, ADMIN apex.');
