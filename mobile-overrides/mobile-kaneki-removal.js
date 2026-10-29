/* ©criado por Vitor Ag/Nyx - 2026 */
/* ©criado por Vitor Ag/Nyx - 2026 */
/* ©criado por Vitor Ag/Nyx - 2026 */
(() => {
'use strict';
try {
  if (typeof S === 'undefined') return;
  const OLD_INDEX = 21;
  const REFUND = 28000;
  const own = Array.isArray(S.own) ? S.own : [0];
  const hadKaneki = own.includes(OLD_INDEX);
  const selectedKaneki = Number(S.skin) === OLD_INDEX;

  if ((hadKaneki || selectedKaneki) && !S.kanekiRemovedRefundV1) {
    if (hadKaneki) S.coins = Math.max(0, Number(S.coins || 0)) + REFUND;
    S.kanekiRemovedRefundV1 = 1;
  }

  S.own = own.filter((v, i, a) => v !== OLD_INDEX && a.indexOf(v) === i);
  if (!S.own.includes(0)) S.own.unshift(0);
  if (selectedKaneki || (typeof SK !== 'undefined' && !SK[S.skin])) S.skin = 0;

  try { sv(); } catch (_) {}
  console.log('[Mobile] Kaneki removed from runtime; old ownership migrated safely.');
} catch (err) {
  console.warn('[Mobile Kaneki Removal]', err);
}
})();
