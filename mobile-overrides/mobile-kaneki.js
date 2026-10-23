/* Mobile only. Keep the legacy purchase slot and the original nsf save schema. */
(() => {
'use strict';
if (SK.length === 20) SK.push(['ADMIN','#ff2a2a',4,999999999]);
const existing=SK.findIndex(s=>s[0]==='Kaneki · Ghoul');
const index=existing<0?SK.length:existing;
if(existing<0) SK.push(['Kaneki · Ghoul','#17151d',11,5000000]);
window.SC_KANEKI_INDEX=index;
const baseShop=shopUI;
shopUI=function(){
  baseShop();
  const card=[...document.querySelectorAll('#sg .sk')].find(c=>c.textContent.includes('Kaneki · Ghoul'));
  if(!card)return;
  card.classList.add('kaneki-skin','kaneki-v2-card');
  const tag=document.createElement('small');tag.className='kaneki-tag';
  tag.textContent='Kagune exclusiva • Armas transformadas • ULT especial';
  card.insertBefore(tag,card.querySelector('button'));
  if(!S.own.includes(index))card.querySelector('button').textContent='5.000.000 moedas';
};
})();
