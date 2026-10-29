/* ©criado por Vitor Ag/Nyx - 2026 */
/* ©criado por Vitor Ag/Nyx - 2026 */
/* ©criado por Vitor Ag/Nyx - 2026 */
(() => {
'use strict';
try{
  const proto=window.Storage&&Storage.prototype;
  if(proto&&!proto.__scSaveGuard){
    proto.__scSaveGuard=1;
    const raw=proto.setItem;
    let pending=null,timer=0;
    const flush=()=>{if(!pending)return;const [store,k,v]=pending;pending=null;timer=0;try{raw.call(store,k,v)}catch(_){}};
    proto.setItem=function(k,v){
      if(k==='nsf'&&typeof st!=='undefined'&&st==='play'){
        pending=[this,k,v];
        if(!timer)timer=setTimeout(flush,650);
        return;
      }
      if(k==='nsf')flush();
      return raw.call(this,k,v);
    };
    addEventListener('pagehide',flush);
    addEventListener('visibilitychange',()=>{if(document.hidden)flush()});
  }
}catch(err){console.warn('[Mobile SaveGuard]',err)}

// Normaliza os dois sistemas novos para o MESMO visual dos botões originais do menu.
try{
  if(!document.getElementById('scMenuNormalize')){
    const style=document.createElement('style');
    style.id='scMenuNormalize';
    style.textContent=`
      #menu #econBtn.econMain,#menu #legacyBtn.legacyMain{
        background:var(--pn2)!important;color:var(--tx)!important;
        border:3px solid var(--edge)!important;border-radius:0!important;
        box-shadow:inset 0 -5px 0 #181326,inset 0 0 0 2px var(--ln),0 4px 0 var(--edge)!important;
        text-shadow:none!important;letter-spacing:normal!important;
      }
      #menu #econBtn.econMain span,#menu #legacyBtn.legacyMain span{color:inherit!important;text-shadow:none!important}
      #menu #econBtn.econMain:active,#menu #legacyBtn.legacyMain:active{
        transform:translateY(4px)!important;
        box-shadow:inset 0 -5px 0 #181326,inset 0 0 0 2px var(--ln),0 0 0 var(--edge)!important;
      }
    `;
    document.head.appendChild(style);
  }
}catch(err){console.warn('[Mobile Menu Normalize]',err)}

// Arte própria dos 10 upgrades exclusivos da versão Mobile.
try{
  const wrap=body=>`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" shape-rendering="crispEdges"><g stroke="#0a0720" stroke-width="4" stroke-linejoin="round" stroke-linecap="square">${body}</g></svg>`;
  const ART={
    up_sc_critd:wrap('<circle cx="32" cy="32" r="17" fill="none" stroke="#ff5a3c"/><path d="M8 11L53 56M56 9L11 54" stroke="#ff315d" stroke-width="7"/><rect x="28" y="28" width="8" height="8" fill="#ffcf3f"/>'),
    up_sc_boss:wrap('<path d="M14 22L7 10L22 16L32 8L42 16L57 10L50 23V44L42 54H22L14 44Z" fill="#b8324d"/><rect x="20" y="27" width="9" height="8" fill="#ffcf3f"/><rect x="36" y="27" width="9" height="8" fill="#ffcf3f"/><path d="M26 43H38" stroke="#fff6e2" stroke-width="5"/>'),
    up_sc_exec:wrap('<path d="M12 48L47 13L55 21L20 56Z" fill="#d8d4c8"/><path d="M8 13L20 8L26 17L18 27L9 23Z" fill="#ff5a3c"/><rect x="39" y="42" width="16" height="8" fill="#b8321a"/>'),
    up_sc_bleed:wrap('<path d="M11 37L34 10L52 22L30 49Z" fill="#d4981a"/><path d="M16 38L22 45L29 39L35 46L42 39" fill="none" stroke="#fff6e2" stroke-width="4"/><path d="M48 38C56 46 53 56 47 56C40 56 39 46 48 38Z" fill="#ff315d"/>'),
    up_sc_dashnova:wrap('<path d="M8 32H38" stroke="#3fe0c5" stroke-width="8"/><path d="M31 18L49 32L31 46" fill="none" stroke="#3fe0c5" stroke-width="8"/><path d="M48 10C60 20 60 44 48 54" fill="none" stroke="#5af0ff" stroke-width="5"/>'),
    up_sc_iron:wrap('<path d="M32 7L53 15V31C53 44 45 53 32 58C19 53 11 44 11 31V15Z" fill="#59398f"/><path d="M32 14V50M18 25H46" stroke="#c7a8ff" stroke-width="6"/><rect x="27" y="25" width="10" height="14" fill="#3fe0c5"/>'),
    up_sc_chain:wrap('<path d="M12 38L23 27C29 21 39 22 44 27L47 30M17 34L20 37C25 42 35 43 41 37L52 26" fill="none" stroke="#b88cff" stroke-width="8"/><rect x="28" y="27" width="8" height="8" fill="#ffcf3f"/>'),
    up_sc_scav:wrap('<path d="M10 26H54V54H10Z" fill="#9a5a20"/><path d="M17 18H47L53 27H11Z" fill="#d4981a"/><rect x="27" y="31" width="10" height="10" fill="#ffcf3f"/><circle cx="49" cy="15" r="9" fill="#ffcf3f"/><rect x="46" y="10" width="6" height="10" fill="#fff6e2"/>'),
    up_sc_low:wrap('<path d="M8 23L18 12L27 22L32 9L38 22L47 12L56 24L50 49L32 57L14 49Z" fill="#b8321a"/><rect x="18" y="30" width="10" height="7" fill="#ffcf3f"/><rect x="37" y="30" width="10" height="7" fill="#ffcf3f"/><path d="M23 47L32 40L41 47" fill="none" stroke="#ff5a3c" stroke-width="5"/>'),
    up_sc_soul:wrap('<rect x="16" y="12" width="32" height="44" rx="3" fill="#3b245f"/><rect x="25" y="6" width="14" height="7" fill="#b88cff"/><path d="M32 49C18 40 24 30 31 27C27 19 36 15 39 24C49 31 43 43 32 49Z" fill="#a166ff"/><rect x="29" y="30" width="6" height="6" fill="#fff6e2"/>')
  };
  const MAP={
    sc_critd:'up_sc_critd',sc_boss:'up_sc_boss',sc_exec:'up_sc_exec',sc_bleed:'up_sc_bleed',sc_dashnova:'up_sc_dashnova',
    sc_iron:'up_sc_iron',sc_chain:'up_sc_chain',sc_scav:'up_sc_scav',sc_low:'up_sc_low',sc_soul:'up_sc_soul'
  };
  if(typeof ICN!=='undefined')Object.assign(ICN,MAP);
  if(typeof SPR!=='undefined'&&SPR.ui&&!SPR.__mobileUpgradeArt){
    SPR.__mobileUpgradeArt=1;
    const oldUi=SPR.ui.bind(SPR);
    SPR.ui=function(n,c){
      const svg=ART[n];
      if(!svg)return oldUi(n,c);
      const src='data:image/svg+xml;charset=UTF-8,'+encodeURIComponent(svg);
      return '<img class="oi'+(c?' '+c:'')+'" src="'+src+'" alt="">';
    };
  }
}catch(err){console.warn('[Mobile Upgrade Art]',err)}
})();