(() => {
'use strict';
try{
  if(typeof SPR==='undefined'||typeof SK==='undefined')return;
  const BASE_COUNT=Math.min(20,SK.length);
  const W=40,H=56,AX=20,AY=47,CACHE=new Map();
  const DATA=[
    {n:'Clássico',skin:'#d9b18b',hair:'#2d211d',body:'#36556f',trim:'#e2a94f',pants:'#253646',boots:'#161d24',eye:'#263746',kind:'classic'},
    {n:'Camuflado',skin:'#bf946f',hair:'#332d23',body:'#53613d',trim:'#89935a',pants:'#303a2b',boots:'#171d16',eye:'#202a1c',kind:'camo'},
    {n:'Lenhador',skin:'#d1a17d',hair:'#6b3827',body:'#9e3f32',trim:'#d39b69',pants:'#2b3d4e',boots:'#2a1b16',eye:'#35251e',kind:'lumber'},
    {n:'Astronauta',skin:'#d9b89c',hair:'#5d493e',body:'#d9e0e7',trim:'#ff8f40',pants:'#c7d0d9',boots:'#6e7885',eye:'#a9ecff',kind:'astro'},
    {n:'Pirata',skin:'#c58f68',hair:'#3a241c',body:'#3f506c',trim:'#b8493e',pants:'#302a34',boots:'#2a1814',eye:'#241c1b',kind:'pirate'},
    {n:'Ninja',skin:'#c49b80',hair:'#17171b',body:'#23262e',trim:'#a52e3c',pants:'#1b1d24',boots:'#0d0f13',eye:'#d4424c',kind:'ninja'},
    {n:'Cavaleiro',skin:'#d0aa8c',hair:'#5b4334',body:'#8b98aa',trim:'#d4c27f',pants:'#566273',boots:'#303946',eye:'#b9d7ff',kind:'knight'},
    {n:'Cowboy',skin:'#d0a071',hair:'#4b2f21',body:'#815b38',trim:'#d8a04d',pants:'#34506b',boots:'#3a2118',eye:'#33241b',kind:'cowboy'},
    {n:'Mago Azul',skin:'#cab2a0',hair:'#dde6ff',body:'#314f9d',trim:'#7fb7ff',pants:'#243875',boots:'#17234a',eye:'#8fe6ff',kind:'mage'},
    {n:'Samurai',skin:'#c99a7f',hair:'#17151a',body:'#722b31',trim:'#d8ad57',pants:'#24252c',boots:'#17171b',eye:'#38211f',kind:'samurai'},
    {n:'Zumbi Amigável',skin:'#7fae6a',hair:'#33402f',body:'#596b50',trim:'#9dc17c',pants:'#35433c',boots:'#202b25',eye:'#d7ff90',kind:'zombie'},
    {n:'Viking',skin:'#d3a579',hair:'#7b4a2d',body:'#6a5146',trim:'#c9a66a',pants:'#354252',boots:'#261c19',eye:'#31536e',kind:'viking'},
    {n:'Robô',skin:'#8696a8',hair:'#4c5b68',body:'#657688',trim:'#4ee7ee',pants:'#465563',boots:'#28333c',eye:'#74fbff',kind:'robot'},
    {n:'Palhaço Sombrio',skin:'#ddd1d9',hair:'#51285f',body:'#502b68',trim:'#d73b79',pants:'#30213c',boots:'#1a111f',eye:'#ff5d9d',kind:'clown'},
    {n:'Esqueleto',skin:'#ddd9c9',hair:'#15161a',body:'#24262b',trim:'#c9c6b8',pants:'#1b1d21',boots:'#111216',eye:'#92d9ff',kind:'skeleton'},
    {n:'Anjo',skin:'#ead9bd',hair:'#f1e3ba',body:'#eee8dc',trim:'#f1c95a',pants:'#d7d2ca',boots:'#a89d85',eye:'#79b9e6',kind:'angel'},
    {n:'Demônio',skin:'#a33a3a',hair:'#241516',body:'#4d2025',trim:'#d9574d',pants:'#2f171d',boots:'#1d0d11',eye:'#ffb03e',kind:'demon'},
    {n:'Dragão',skin:'#5f8f62',hair:'#263c2b',body:'#35664b',trim:'#7fca7f',pants:'#274535',boots:'#17271d',eye:'#ffd85f',kind:'dragon'},
    {n:'Cyber Neon',skin:'#a7bfd0',hair:'#121521',body:'#171b2d',trim:'#27e6e3',pants:'#101421',boots:'#080b13',eye:'#ff49c9',kind:'cyber'},
    {n:'Ceifador Dourado',skin:'#d1b16d',hair:'#0d0d11',body:'#17151d',trim:'#e2b83f',pants:'#111016',boots:'#08070b',eye:'#ffdf68',kind:'reaper'}
  ];
  const rr=(g,x,y,w,h,col)=>{g.fillStyle=col;g.fillRect(Math.round(x),Math.round(y),Math.round(w),Math.round(h))};
  const poly=(g,p,col)=>{g.fillStyle=col;g.beginPath();g.moveTo(p[0][0],p[0][1]);for(let i=1;i<p.length;i++)g.lineTo(p[i][0],p[i][1]);g.closePath();g.fill()};
  const line=(g,x1,y1,x2,y2,col,w=1)=>{g.strokeStyle=col;g.lineWidth=w;g.beginPath();g.moveTo(x1,y1);g.lineTo(x2,y2);g.stroke()};
  const pxEye=(g,x,y,col)=>{rr(g,x,y,2,2,'#08090d');rr(g,x,y,1,1,col)};
  function shade(hex,amt){let n=parseInt(hex.slice(1),16),r=(n>>16)+amt,gg=((n>>8)&255)+amt,b=(n&255)+amt;return'#'+((1<<24)+(Math.max(0,Math.min(255,r))<<16)+(Math.max(0,Math.min(255,gg))<<8)+Math.max(0,Math.min(255,b))).toString(16).slice(1)}

  function baseBody(g,d,dir,f,mode){
    const walk=mode==='walk',dash=mode==='dash',step=walk?(f%2?1:-1):0,lean=dash?2:0;
    // shadow
    rr(g,11,46,18,3,'rgba(0,0,0,.25)');
    // legs / boots
    const lY=35+(step>0?1:0),rY=35+(step<0?1:0);
    rr(g,13+lean,lY,6,9,d.pants);rr(g,21+lean,rY,6,9,shade(d.pants,-10));
    rr(g,12+lean,lY+7,7,4,d.boots);rr(g,21+lean,rY+7,7,4,d.boots);
    // torso
    rr(g,11+lean,21,18,16,shade(d.body,-20));rr(g,12+lean,20,16,15,d.body);rr(g,14+lean,21,6,13,shade(d.body,12));
    rr(g,12+lean,31,16,2,shade(d.trim,-35));
    // arms with walk swing
    const aL=walk?-step:0,aR=walk?step:0;
    rr(g,8+lean,22+aL,5,12,shade(d.body,-18));rr(g,27+lean,22+aR,5,12,shade(d.body,-26));
    rr(g,9+lean,32+aL,4,4,d.skin);rr(g,27+lean,32+aR,4,4,shade(d.skin,-6));
    // neck/head
    rr(g,17+lean,18,6,4,shade(d.skin,-8));
    if(dir==='up'){
      rr(g,13+lean,8,14,12,shade(d.hair,-18));rr(g,14+lean,7,12,10,d.hair);
      rr(g,12+lean,12,3,7,shade(d.hair,-25));rr(g,25+lean,12,3,7,shade(d.hair,-25));
    }else if(dir==='side'){
      rr(g,14+lean,8,13,12,shade(d.skin,-5));rr(g,14+lean,7,11,6,d.hair);rr(g,23+lean,9,5,7,shade(d.hair,-14));
      pxEye(g,24+lean,13,d.eye);rr(g,25+lean,17,3,2,shade(d.skin,-25));
    }else{
      rr(g,13+lean,8,14,12,d.skin);rr(g,14+lean,7,12,5,d.hair);rr(g,12+lean,10,3,7,shade(d.hair,-10));rr(g,25+lean,10,3,7,shade(d.hair,-16));
      pxEye(g,16+lean,13,d.eye);pxEye(g,23+lean,13,d.eye);rr(g,18+lean,17,4,1,shade(d.skin,-35));
    }
    return lean;
  }

  function details(g,d,dir,f,mode,lean){
    const side=dir==='side',up=dir==='up';
    switch(d.kind){
      case'classic':
        rr(g,15+lean,21,10,3,'#274156');rr(g,19+lean,24,2,7,d.trim);rr(g,16+lean,10,8,2,shade(d.hair,18));
        break;
      case'camo':
        for(const q of [[14,22,3,2],[22,24,4,2],[17,28,3,2],[24,31,2,2]])rr(g,q[0]+lean,q[1],q[2],q[3],q[0]%2?'#303a25':'#6d7847');
        rr(g,13+lean,7,14,3,'#3c4931');rr(g,22+lean,10,6,2,'#3c4931');
        break;
      case'lumber':
        for(let y=22;y<34;y+=4)rr(g,12+lean,y,16,1,'#e4a27c');for(let x=16;x<27;x+=5)rr(g,x+lean,20,1,15,'#542721');
        if(!up){rr(g,14+lean,17,12,3,'#6a3324');rr(g,16+lean,19,8,2,'#4a251d')}rr(g,13+lean,6,14,3,'#8b3d2f');
        break;
      case'astro':
        rr(g,13+lean,9,14,10,'#263848');rr(g,15+lean,10,10,7,'#78cbe7');rr(g,16+lean,11,8,2,'#bceefa');
        rr(g,14+lean,23,12,5,'#edf4f8');rr(g,18+lean,24,4,3,'#243b4d');rr(g,12+lean,29,16,2,d.trim);rr(g,8+lean,24,3,9,'#8093a2');
        break;
      case'pirate':
        if(!up)rr(g,14+lean,13,5,2,'#15151a');rr(g,14+lean,6,12,3,'#23181a');rr(g,11+lean,8,18,3,'#2f2020');rr(g,18+lean,21,4,13,'#efe0c9');rr(g,12+lean,22,3,12,d.trim);
        break;
      case'ninja':
        rr(g,12+lean,8,16,7,'#14161c');rr(g,13+lean,14,14,5,'#20242c');if(!up){rr(g,14+lean,13,12,2,'#a9b5bc');pxEye(g,16+lean,13,d.eye);pxEye(g,23+lean,13,d.eye)}
        rr(g,12+lean,20,16,3,d.trim);poly(g,[[27+lean,22],[35+lean,25],[28+lean,27]],d.trim);rr(g,18+lean,23,4,11,'#15171c');
        break;
      case'knight':
        rr(g,12+lean,8,16,11,'#707d8d');rr(g,14+lean,9,12,3,'#b4c0cd');if(!up){rr(g,14+lean,13,12,2,'#1b222b');for(let x=15;x<26;x+=3)rr(g,x+lean,13,1,2,'#b8d8ff')}
        rr(g,10+lean,21,20,4,'#a9b4c1');rr(g,13+lean,26,14,7,'#7c8795');rr(g,18+lean,21,4,13,d.trim);poly(g,[[20+lean,6],[17+lean,2],[23+lean,4]],'#b02f3c');
        break;
      case'cowboy':
        rr(g,12+lean,6,16,4,'#765032');rr(g,9+lean,9,22,3,'#8b633e');rr(g,13+lean,21,14,5,'#554333');rr(g,17+lean,22,6,8,'#d9c4a5');rr(g,12+lean,28,16,3,'#6a1f28');
        if(!up)rr(g,15+lean,17,10,2,'#5e3328');
        break;
      case'mage':
        poly(g,[[10+lean,12],[20+lean,2],[30+lean,12],[27+lean,15],[13+lean,15]],'#263f8f');rr(g,16+lean,6,3,2,'#9fd8ff');rr(g,22+lean,8,2,2,'#d9efff');
        rr(g,11+lean,21,18,4,'#203775');rr(g,18+lean,24,4,10,d.trim);rr(g,12+lean,33,16,2,'#6e96dc');
        break;
      case'samurai':
        rr(g,12+lean,8,16,9,'#2b2429');rr(g,10+lean,10,20,3,'#8b3036');poly(g,[[20+lean,5],[17+lean,9],[23+lean,9]],d.trim);rr(g,10+lean,21,20,4,'#5a2429');
        for(let y=25;y<34;y+=3)rr(g,12+lean,y,16,1,d.trim);rr(g,8+lean,22,4,7,'#722b31');rr(g,28+lean,22,4,7,'#722b31');
        break;
      case'zombie':
        rr(g,14+lean,10,4,2,'#638e54');rr(g,24+lean,15,3,2,'#638e54');rr(g,13+lean,22,6,5,'#465b43');rr(g,22+lean,28,6,4,'#465b43');line(g,15+lean,17,18+lean,15,'#39523a');
        if(!up){pxEye(g,16+lean,13,'#d8ff83');pxEye(g,23+lean,13,'#ff8f64')}break;
      case'viking':
        rr(g,12+lean,8,16,9,'#7b8791');poly(g,[[13+lean,9],[8+lean,4],[11+lean,12]],'#d6c6a0');poly(g,[[27+lean,9],[32+lean,4],[29+lean,12]],'#d6c6a0');
        if(!up){rr(g,14+lean,17,12,3,'#74462c');rr(g,16+lean,19,8,3,'#5a3726')}rr(g,10+lean,21,20,4,'#7f6b59');rr(g,12+lean,25,16,3,'#d0c2a4');
        break;
      case'robot':
        rr(g,12+lean,8,16,11,'#465764');rr(g,14+lean,10,12,5,'#1a2730');rr(g,15+lean,12,10,2,d.trim);rr(g,10+lean,21,20,4,'#536773');rr(g,18+lean,24,4,5,'#18232b');rr(g,19+lean,25,2,3,d.trim);
        rr(g,8+lean,22,4,5,'#738796');rr(g,28+lean,22,4,5,'#738796');break;
      case'clown':
        if(!up){rr(g,14+lean,12,3,2,'#5b1b43');rr(g,23+lean,12,3,2,'#5b1b43');rr(g,18+lean,16,4,2,'#9e1e4e')}poly(g,[[13+lean,7],[9+lean,3],[17+lean,6]],'#6a2c78');poly(g,[[27+lean,7],[31+lean,3],[23+lean,6]],'#b52964');
        rr(g,11+lean,21,8,13,'#3d2451');rr(g,21+lean,21,8,13,'#6e2d63');for(let y=23;y<34;y+=4){rr(g,18+lean,y,2,2,'#e3c66d');rr(g,22+lean,y+1,2,2,'#e3c66d')}break;
      case'skeleton':
        rr(g,14+lean,9,12,9,'#d9d6c8');if(!up){rr(g,15+lean,12,3,3,'#111216');rr(g,22+lean,12,3,3,'#111216');rr(g,18+lean,16,4,2,'#111216')}rr(g,18+lean,21,4,12,'#d9d6c8');
        for(let y=22;y<32;y+=3)rr(g,14+lean,y,12,1,'#d9d6c8');rr(g,11+lean,23,3,9,'#d9d6c8');rr(g,26+lean,23,3,9,'#d9d6c8');break;
      case'angel':
        rr(g,12+lean,21,16,13,'#f0eee7');rr(g,18+lean,22,4,12,d.trim);line(g,12+lean,27,28+lean,27,'#c8b873');
        poly(g,[[10+lean,22],[3+lean,18],[7+lean,29],[12+lean,31]],'#e7edf2');poly(g,[[30+lean,22],[37+lean,18],[33+lean,29],[28+lean,31]],'#e7edf2');
        line(g,15+lean,5,25+lean,5,d.trim,2);break;
      case'demon':
        poly(g,[[14+lean,9],[10+lean,3],[17+lean,8]],'#251216');poly(g,[[26+lean,9],[30+lean,3],[23+lean,8]],'#251216');rr(g,12+lean,21,16,13,'#542128');rr(g,18+lean,22,4,12,'#1d1014');
        if(!up){pxEye(g,16+lean,13,d.eye);pxEye(g,23+lean,13,d.eye)}poly(g,[[29+lean,31],[36+lean,35],[33+lean,38]],'#8f2e35');break;
      case'dragon':
        poly(g,[[13+lean,9],[9+lean,5],[16+lean,8]],'#24412d');poly(g,[[27+lean,9],[31+lean,5],[24+lean,8]],'#24412d');for(let y=22;y<34;y+=4)rr(g,13+lean,y,14,2,'#4d865d');
        rr(g,18+lean,21,4,13,'#b2c36c');poly(g,[[10+lean,24],[5+lean,19],[7+lean,30]],'#2a573d');poly(g,[[30+lean,24],[35+lean,19],[33+lean,30]],'#2a573d');break;
      case'cyber':
        rr(g,12+lean,8,16,10,'#171b27');rr(g,14+lean,11,12,3,'#10131d');rr(g,15+lean,12,10,1,d.trim);rr(g,10+lean,21,20,3,'#1f2435');
        rr(g,13+lean,23,2,10,'#ff3bc8');rr(g,25+lean,23,2,10,d.trim);rr(g,18+lean,24,4,8,'#131724');rr(g,9+lean,28,3,2,d.trim);rr(g,28+lean,28,3,2,'#ff3bc8');break;
      case'reaper':
        poly(g,[[11+lean,13],[15+lean,5],[25+lean,5],[29+lean,13],[27+lean,19],[13+lean,19]],'#101015');if(!up){rr(g,14+lean,11,12,7,'#17161c');rr(g,15+lean,12,10,5,'#caa33c');rr(g,16+lean,13,3,3,'#0c0b0e');rr(g,22+lean,13,3,3,'#0c0b0e');rr(g,19+lean,16,2,2,'#0c0b0e')}
        rr(g,11+lean,21,18,13,'#15131a');rr(g,18+lean,22,4,12,d.trim);poly(g,[[12+lean,33],[8+lean,41],[16+lean,36]],'#111015');poly(g,[[28+lean,33],[32+lean,41],[24+lean,36]],'#111015');break;
    }
  }

  function make(si,dir,f,mode){
    const key=si+'|'+dir+'|'+f+'|'+mode;if(CACHE.has(key))return CACHE.get(key);
    const cv=document.createElement('canvas');cv.width=W;cv.height=H;const g=cv.getContext('2d');g.imageSmoothingEnabled=false;
    const d=DATA[si],lean=baseBody(g,d,dir,f,mode);details(g,d,dir,f,mode,lean);CACHE.set(key,cv);return cv;
  }
  function drawWeapon(c,r,a,q){
    if(!q||typeof CF==='undefined'||!SPR.WEAPON)return;const wp=SPR.WEAPON[CF.w||0];if(!wp)return;
    const ca=Math.cos(a),sa=Math.sin(a),s=r*4.2/96;c.save();c.translate(ca*r*.35,-r*.3+sa*r*.3);c.rotate(a);if(ca<0)c.scale(1,-1);
    SPR.at(c,'items',wp+'_1f',0,0,0,s);const full=q.rate*(typeof PW!=='undefined'&&PW.fr>0?.5:1),el=full-q.cd;if(q.cd>0&&el>=0&&el<.08)SPR.at(c,'items',wp+'_flash_4f',el/.08,0,0,s,0,0,1);c.restore();
  }
  function render(c,r,a,si,q){
    const ca=Math.cos(a),sa=Math.sin(a);let dir='side',flip=0;if(Math.abs(sa)>Math.abs(ca)*1.1)dir=sa>0?'down':'up';else flip=ca<0;
    const dash=!!(q&&q.dT>0),moving=typeof mv!=='undefined'&&mv,mode=dash?'dash':moving?'walk':'idle';
    const frame=mode==='walk'?Math.floor((typeof tm!=='undefined'?tm:0)*10)%4:mode==='dash'?1:Math.floor((typeof tm!=='undefined'?tm:0)*2)%2;
    const img=make(si,dir,frame,mode),s=r/14,gy=r*.92;
    if(q&&dir==='up')drawWeapon(c,r,a,q);
    c.save();c.translate(0,gy);if(flip)c.scale(-1,1);c.imageSmoothingEnabled=false;c.drawImage(img,-AX*s,-AY*s,W*s,H*s);c.restore();
    if(q&&dir!=='up')drawWeapon(c,r,a,q);return 1;
  }

  const previous=SPR.hero.bind(SPR);
  SPR.hero=function(c,r,a,si,q){if(si>=0&&si<BASE_COUNT)return render(c,r,a,si,q);return previous(c,r,a,si,q)};

  function polishShop(){
    const cards=[...document.querySelectorAll('#sg .sk')];cards.forEach((card,i)=>{if(i>=BASE_COUNT)return;card.classList.add('skin-v2-card');card.dataset.skinTier=i>=17?'legendary':i>=13?'epic':i>=8?'rare':i>=4?'uncommon':'classic';if(!card.querySelector('.skin-v2-tag')){const tag=document.createElement('span');tag.className='skin-v2-tag';tag.textContent=i>=17?'LENDÁRIA':i>=13?'ÉPICA':i>=8?'RARA':i>=4?'INCOMUM':'CLÁSSICA';card.appendChild(tag)}})
  }
  const oldShop=typeof shopUI==='function'?shopUI:null;if(oldShop)shopUI=function(){oldShop();polishShop()};
  setTimeout(polishShop,350);
  console.log('[Mobile] Base Skins V2 loaded:',BASE_COUNT,'procedural pixel-art skins');
}catch(err){console.warn('[Mobile Skins V2]',err)}
})();