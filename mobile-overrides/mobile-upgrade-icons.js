/* ©criado por Vitor Ag/Nyx - 2026 */
/* ©criado por Vitor Ag/Nyx - 2026 */
/* ©criado por Vitor Ag/Nyx - 2026 */
(() => {
  'use strict';

  const MAP={
    sc_critd:'up_sc_critd',
    sc_boss:'up_sc_boss',
    sc_exec:'up_sc_exec',
    sc_bleed:'up_sc_bleed',
    sc_dashnova:'up_sc_dashnova',
    sc_iron:'up_sc_iron',
    sc_chain:'up_sc_chain',
    sc_scav:'up_sc_scav',
    sc_low:'up_sc_low',
    sc_soul:'up_sc_soul'
  };

  // Fallbacks: mesmo que a arte customizada não carregue, nunca mostra "undefined".
  const FALLBACK={
    sc_critd:'💢',
    sc_boss:'👹',
    sc_exec:'🗡️',
    sc_bleed:'🩸',
    sc_dashnova:'💨',
    sc_iron:'🔰',
    sc_chain:'⛓️',
    sc_scav:'🧰',
    sc_low:'😈',
    sc_soul:'🔋'
  };

  try{if(typeof IC!=='undefined')Object.assign(IC,FALLBACK)}catch(_){}
  try{if(typeof ICN!=='undefined')Object.assign(ICN,MAP)}catch(_){}

  const svg=(body,accent='#b88cff')=>
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" shape-rendering="crispEdges">`+
    `<rect x="3" y="3" width="58" height="58" rx="8" fill="#171233" stroke="#0a0720" stroke-width="5"/>`+
    `<rect x="7" y="7" width="50" height="50" rx="5" fill="#241d4d" stroke="${accent}" stroke-width="2" opacity=".96"/>`+
    `<g stroke="#0a0720" stroke-width="3.5" stroke-linejoin="round" stroke-linecap="square">${body}</g></svg>`;

  const ART={
    up_sc_critd:svg('<circle cx="32" cy="32" r="15" fill="none" stroke="#ff5a3c" stroke-width="4"/><path d="M13 13L51 51M51 13L13 51" stroke="#ff315d" stroke-width="6"/><rect x="28" y="28" width="8" height="8" fill="#ffcf3f"/>','#ff5a3c'),
    up_sc_boss:svg('<path d="M15 23L9 13L23 18L32 10L41 18L55 13L49 24V43L41 52H23L15 43Z" fill="#b8324d"/><rect x="20" y="28" width="9" height="7" fill="#ffcf3f"/><rect x="35" y="28" width="9" height="7" fill="#ffcf3f"/><path d="M25 43H39" stroke="#fff6e2" stroke-width="5"/>','#ff315d'),
    up_sc_exec:svg('<path d="M14 49L46 17L53 24L21 56Z" fill="#d8d4c8"/><path d="M10 14L21 10L27 18L19 28L11 24Z" fill="#ff5a3c"/><rect x="38" y="41" width="15" height="8" fill="#b8321a"/>','#ff5a3c'),
    up_sc_bleed:svg('<path d="M13 37L34 12L51 23L30 48Z" fill="#d4981a"/><path d="M17 38L22 44L28 39L34 45L40 39" fill="none" stroke="#fff6e2" stroke-width="4"/><path d="M47 37C55 45 53 55 47 55C40 55 39 45 47 37Z" fill="#ff315d"/>','#ff315d'),
    up_sc_dashnova:svg('<path d="M11 32H38" stroke="#3fe0c5" stroke-width="7"/><path d="M31 19L48 32L31 45" fill="none" stroke="#3fe0c5" stroke-width="7"/><path d="M48 13C58 22 58 42 48 51" fill="none" stroke="#5af0ff" stroke-width="4"/>','#3fe0c5'),
    up_sc_iron:svg('<path d="M32 9L51 16V31C51 43 44 51 32 56C20 51 13 43 13 31V16Z" fill="#59398f"/><path d="M32 16V49M19 26H45" stroke="#c7a8ff" stroke-width="5"/><rect x="28" y="27" width="8" height="12" fill="#3fe0c5"/>','#b88cff'),
    up_sc_chain:svg('<path d="M13 38L24 27C29 22 38 22 43 27L47 31M17 34L21 38C26 43 35 43 41 37L52 26" fill="none" stroke="#b88cff" stroke-width="7"/><rect x="28" y="28" width="8" height="8" fill="#ffcf3f"/>','#b88cff'),
    up_sc_scav:svg('<path d="M11 27H53V53H11Z" fill="#9a5a20"/><path d="M17 19H47L52 27H12Z" fill="#d4981a"/><rect x="27" y="32" width="10" height="9" fill="#ffcf3f"/><circle cx="48" cy="16" r="8" fill="#ffcf3f"/><rect x="46" y="11" width="5" height="10" fill="#fff6e2"/>','#ffcf3f'),
    up_sc_low:svg('<path d="M10 24L19 14L27 22L32 11L38 22L46 14L54 25L49 47L32 55L15 47Z" fill="#b8321a"/><rect x="19" y="30" width="9" height="7" fill="#ffcf3f"/><rect x="36" y="30" width="9" height="7" fill="#ffcf3f"/><path d="M24 46L32 40L40 46" fill="none" stroke="#ff5a3c" stroke-width="5"/>','#ff5a3c'),
    up_sc_soul:svg('<rect x="17" y="13" width="30" height="42" rx="3" fill="#3b245f"/><rect x="26" y="8" width="12" height="6" fill="#b88cff"/><path d="M32 49C20 41 24 31 31 28C28 20 36 17 39 25C48 32 42 43 32 49Z" fill="#a166ff"/><rect x="29" y="31" width="6" height="6" fill="#fff6e2"/>','#a166ff')
  };

  try{
    if(typeof SPR!=='undefined'&&SPR.ui&&!SPR.__mobileUpgradeArtV3){
      SPR.__mobileUpgradeArtV3=1;
      const previous=SPR.ui.bind(SPR);
      SPR.ui=function(n,c){
        if(!ART[n])return previous(n,c);
        const src='data:image/svg+xml;charset=UTF-8,'+encodeURIComponent(ART[n]);
        return `<img class="oi${c?' '+c:''} scUpgradeArt" src="${src}" alt="">`;
      };
    }
  }catch(err){console.warn('[Mobile Upgrade Icons]',err)}

  // Segurança extra para qualquer conteúdo Mobile futuro que esqueça um ícone.
  try{
    if(typeof U!=='undefined'&&typeof IC!=='undefined'){
      for(const u of U){if(u&&u[0]&&!IC[u[0]]&&!ICN?.[u[0]])IC[u[0]]='✦'}
    }
  }catch(_){}
})();
