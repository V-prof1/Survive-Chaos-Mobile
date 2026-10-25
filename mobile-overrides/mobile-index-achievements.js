(() => {
'use strict';
try{
  const I=window.SCEnemyIndex;if(!I||typeof ACH==='undefined')return;
  const a3=ACH.find(a=>a.id==='up3');
  if(a3){a3.n='Dupla Suprema';a3.d='Ative as 2 Supremas permitidas na mesma build.';a3.f=()=>inR()&&I.usedSupreme()>=2;}
  const a4=ACH.find(a=>a.id==='up4');
  if(a4){a4.n='Build Fechada';a4.d='Ocupe as 8 famílias de upgrade, maximize todas elas e complete a build com 2 Supremas.';a4.f=()=>inR()&&I.usedNormal()>=8&&I.usedSupreme()>=2&&U.filter(u=>(P.lv[u[0]]||0)>0).every(u=>(P.lv[u[0]]||0)>=u[3]);}
  if(!ACH.some(a=>a.id==='idx_all'))A1('idx_all','Arquivo Completo','Revele 100% da Index derrotando ao menos uma vez cada ameaça registrada.',9,()=>I.entries.length>0&&I.entries.every(e=>S.scIndex&&S.scIndex.entries&&S.scIndex.entries[e.id]));
  console.log('[Mobile] Index achievements updated for 8+2 build rules.');
}catch(err){console.warn('[Index achievements]',err)}
})();
