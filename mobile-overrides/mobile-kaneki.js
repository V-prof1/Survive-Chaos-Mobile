(() => {
'use strict';
try{
  if(typeof SK==='undefined'||typeof SPR==='undefined')return;
  // O índice 20 é reservado pelo jogo para a skin ADMIN/DEV. Mantemos esse slot invisível.
  if(SK.length===20)SK.push(['ADMIN','#ff2a2a',4,999999999]);
  const KSK=SK.length;
  const KPRICE=5000000;
  SK.push(['Kaneki · Ghoul','#17151d',11,KPRICE]);
  window.SC_KANEKI_INDEX=KSK;

  const KGIF='data:image/gif;base64,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';

  const K={until:0};
  function px(c,x,y,w,h,col){c.fillStyle=col;c.fillRect(Math.round(x),Math.round(y),Math.round(w),Math.round(h))}
  function kanekiHero(c,r,a,q){
    const s=r/25,bob=Math.sin((typeof tm!=='undefined'?tm:0)*9)*.7,moving=(typeof mv!=='undefined'&&mv)?1:0;
    c.save();c.scale(s,s);c.translate(0,bob+(moving?Math.sin(tm*15)*.7:0));
    // Kagune: aparece durante a ULT e discretamente no preview da loja.
    const showK=Date.now()<K.until||!q;
    if(showK){c.lineCap='square';for(let i=0;i<4;i++){const side=i%2?-1:1,up=i<2?-1:1;c.strokeStyle='#5d0017';c.lineWidth=5;c.beginPath();c.moveTo(side*4,8);c.quadraticCurveTo(side*(15+i*2),up*(4+i*3),side*(21+i),up*(13+i*2));c.stroke();c.strokeStyle='#e01845';c.lineWidth=2;c.stroke()}}
    // pernas e sobretudo preto
    px(c,-9,8,7,13,'#111117');px(c,2,8,7,13,'#111117');px(c,-11,-1,22,14,'#17171e');px(c,-13,4,4,13,'#202028');px(c,9,4,4,13,'#202028');
    // cabeça
    c.fillStyle='#e7cdb8';c.beginPath();c.arc(0,-10,8,0,Math.PI*2);c.fill();
    // cabelo branco irregular
    c.fillStyle='#eef2f7';c.beginPath();c.moveTo(-9,-12);c.lineTo(-8,-21);c.lineTo(-4,-17);c.lineTo(-1,-23);c.lineTo(2,-18);c.lineTo(6,-22);c.lineTo(6,-16);c.lineTo(10,-18);c.lineTo(8,-10);c.lineTo(3,-13);c.lineTo(-2,-11);c.closePath();c.fill();
    // sombra ghoul + olho vermelho
    px(c,0,-12,8,5,'#171119');px(c,3,-11,3,2,'#ff315d');px(c,-5,-11,2,2,'#f6f6f8');
    // gola/máscara baixa
    px(c,-7,-4,14,4,'#292833');px(c,-4,-3,8,2,'#09090d');
    // braço/mão em pose de estalar dedos quando a ULT está ativa
    if(Date.now()<K.until){px(c,-13,-1,13,4,'#22222a');px(c,-1,-3,4,12,'#e7cdb8');px(c,8,-5,4,11,'#22222a');px(c,4,-11,4,10,'#e7cdb8');px(c,1,-14,7,3,'#e7cdb8')}
    c.restore();
    // arma continua visível e funcional
    if(q&&SPR.at&&typeof CF!=='undefined'){
      const ca=Math.cos(a),sa=Math.sin(a),wp=SPR.WEAPON[CF.w||0],ss=r*4.2/96;
      c.save();c.translate(ca*r*.35,-r*.3+sa*r*.3);c.rotate(a);if(ca<0)c.scale(1,-1);SPR.at(c,'items',wp+'_1f',0,0,0,ss);c.restore();
    }
    return 1;
  }

  const oldHero=SPR.hero.bind(SPR);
  SPR.hero=function(c,r,a,si,q){return si===KSK?kanekiHero(c,r,a,q):oldHero(c,r,a,si,q)};

  // Cut-in pixelado: GIF próprio, sem depender de internet.
  const cut=document.createElement('div');cut.id='kanekiUltCutin';cut.innerHTML='<span class="slash"></span><span class="slash"></span><span class="slash"></span><div class="kframe"><div class="kflash"></div><img alt="Kaneki ULT"><div class="ktxt"><b>KAGUNE</b> // DESPERTAR</div></div>';document.body.appendChild(cut);
  const cutImg=cut.querySelector('img');
  function cutin(){cut.classList.remove('on');cutImg.removeAttribute('src');void cut.offsetWidth;cutImg.src=KGIF;cut.classList.add('on');setTimeout(()=>cut.classList.remove('on'),980)}

  function segDist(px0,py0,x1,y1,x2,y2){const vx=x2-x1,vy=y2-y1,wx=px0-x1,wy=py0-y1,c1=vx*wx+vy*wy,c2=vx*vx+vy*vy,t=c2?Math.max(0,Math.min(1,c1/c2)):0,dx0=px0-(x1+t*vx),dy0=py0-(y1+t*vy);return Math.hypot(dx0,dy0)}
  function kaguneUlt(){
    if(st!=='play'||ult<100)return;
    ult=0;try{ach('e_ult')}catch(_){ }
    const ox=P.x,oy=P.y,base=P.dmg*dx;
    K.until=Date.now()+1650;cutin();EB.length=0;fz=1.35;shake=28;flash=.85;
    try{sfx('boss2');setTimeout(()=>sfx('boom'),180)}catch(_){ }
    try{ban('🩸 KAGUNE DESPERTA')}catch(_){ }
    // Núcleo: semelhante à ULT normal, mas com alcance menor e maior identidade visual.
    boom(ox,oy,245,base*9);
    for(let i=0;i<4;i++)FX.push({x:ox,y:oy,r:90+i*70,t:.28+i*.05,ring:1});
    // Oito chicotes Kagune atravessam a tela e atingem cada inimigo no máximo uma vez.
    setTimeout(()=>{
      if(st!=='play')return;const hitSet=new Set(),len=440;
      for(let j=0;j<8;j++){
        const an=j*Math.PI/4+(j%2?.10:-.08),ex=ox+Math.cos(an)*len,ey=oy+Math.sin(an)*len;
        for(let k=1;k<=6;k++)FX.push({x:ox+(ex-ox)*k/6,y:oy+(ey-oy)*k/6,r:24+k*2,t:.18+k*.025,ring:1});
        for(const e of E){if(!e||e.dead||hitSet.has(e))continue;if(segDist(e.x,e.y,ox,oy,ex,ey)<(e.r||10)+30){hitSet.add(e);try{hit(e,base*5,ox,oy)}catch(_){e.hp-=base*5;if(e.hp<=0)kill(e)}}}
      }
      // regeneração temática, limitada para não transformar a skin em invencibilidade.
      P.hp=Math.min(P.mhp,P.hp+P.mhp*.12);shake=20;flash=.45;
    },240);
  }

  const baseFireUlt=fireUlt;
  fireUlt=function(){return S.skin===KSK?kaguneUlt():baseFireUlt()};

  // Card especial na loja, mantendo toda a lógica original de compra/save.
  const baseShopUI=shopUI;
  shopUI=function(){
    baseShopUI();
    const cards=[...document.querySelectorAll('#sg .sk')];
    const card=cards.find(el=>el.textContent.includes('Kaneki · Ghoul'));
    if(card){card.classList.add('kaneki-skin');if(!card.querySelector('.kaneki-tag')){const tag=document.createElement('small');tag.className='kaneki-tag';tag.textContent='5.000.000 moedas • ULT exclusiva Kagune';const btn=card.querySelector('button');card.insertBefore(tag,btn)}const b=card.querySelector('button');if(b&&!S.own.includes(KSK))b.textContent=S.coins>=KPRICE?'5.000.000 moedas':'5.000.000 moedas'}
  };

  function syncUlt(){const on=S.skin===KSK;for(const id of['ult','ult1']){const b=document.getElementById(id);if(!b)continue;const sm=b.querySelector('small'),bb=b.querySelector('b');if(sm)sm.textContent=on?'KAGUNE':'ULT';if(bb)bb.textContent=on?'🩸':'⚡'}}
  setInterval(syncUlt,400);syncUlt();
  console.log('[Mobile] Kaneki skin loaded at index',KSK,'price',KPRICE);
}catch(err){console.warn('[Mobile Kaneki]',err)}
})();
