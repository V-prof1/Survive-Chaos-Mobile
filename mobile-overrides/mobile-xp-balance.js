/* ©criado por Vitor Ag/Nyx - 2026 */
/* ©criado por Vitor Ag/Nyx - 2026 */
/* ©criado por Vitor Ag/Nyx - 2026 */
(() => {
'use strict';
try {
  if (typeof xpAdd !== 'function' || typeof lvUp !== 'function' || typeof xpNeed !== 'function' || typeof start !== 'function') return;

  const baseStart = start;
  const DIFF_GAIN = [0.95, 0.86, 0.72, 0.58, 1.02]; // Fácil, Médio, Difícil, Pesadelo, Baby
  const MODE_GAIN = [1.00, 0.84, 0.78, 0.82, 0.86, 0.58, 0.45];
  const EXTRA_GAIN = [1.00, 0.90, 0.72, 0.84, 0.92, 0.70, 0.80];
  const DIRECT_LEVEL = [0.72, 0.62, 0.50, 0.40, 0.78];
  const MODE_DIRECT = [1.00, 0.90, 0.86, 0.88, 0.90, 0.55, 0.35];

  const at = (arr, i, fallback=1) => Number.isInteger(i) && arr[i] != null ? arr[i] : fallback;

  function needCurve(level) {
    const n = Math.max(0, Number(level || 1) - 1);
    return 1.10 + Math.min(1.05, Math.pow(n / 22, 1.18) * 0.62);
  }

  function balancedNeed(level) {
    return Math.max(1, Math.ceil(xpNeed(level) * needCurve(level)));
  }

  function infiniteGain() {
    if (typeof CF === 'undefined' || !CF.i) return 1;
    const min = Math.max(0, (typeof T === 'number' ? T : 0) / 60);
    return Math.max(0.58, 1 - Math.max(0, min - 3) * 0.018);
  }

  function gainMultiplier() {
    const diff = at(DIFF_GAIN, typeof CF !== 'undefined' ? CF.m : 1, 0.86);
    const mode = at(MODE_GAIN, typeof CF !== 'undefined' ? CF.g : 0, 0.82);
    const extra = at(EXTRA_GAIN, typeof S !== 'undefined' ? Number(S.mobileExtraMode || 0) : 0, 0.85);
    const bloodHorde = typeof horde !== 'undefined' && horde > 0 ? 0.68 : 1;
    return diff * mode * extra * infiniteGain() * bloodHorde;
  }

  function wisdomMultiplier() {
    const raw = typeof P !== 'undefined' && P ? Number(P.xpm || 1) : 1;
    return 1 + Math.max(0, raw - 1) * 0.65;
  }

  function balancedXpAdd(v) {
    v = Math.max(0, Number(v) || 0);
    if (maxed() || lvl >= LVC) {
      earned += Math.ceil(v * wisdomMultiplier() * 0.30);
      xp = xpn;
      if (!P.cv) { P.cv = 1; ban('Tudo no máximo! XP vira moedas'); }
      sfx('coin');
      return;
    }

    xp += v * wisdomMultiplier() * gainMultiplier();
    while (xp >= xpn && lvl < LVC) {
      xp -= xpn;
      lvl++;
      xpn = balancedNeed(lvl);
      pend++;
      for (const q of PL) if (q.lvh) q.hp = Math.min(q.mhp, q.hp + q.mhp * q.lvh);
      sfx('lvl');
      FX.push({x:P.x,y:P.y,r:130,t:.25,ring:1});
    }
    if (pend && st === 'play') cardsOpen();
  }

  function directRewardFraction(n) {
    const diff = at(DIRECT_LEVEL, typeof CF !== 'undefined' ? CF.m : 1, 0.58);
    const mode = at(MODE_DIRECT, typeof CF !== 'undefined' ? CF.g : 0, 0.85);
    return Math.max(0.12, Number(n || 1) * diff * mode);
  }

  lvUp = function(n=1) {
    if (maxed() || lvl >= LVC) {
      earned += Math.max(2, Math.ceil(Number(n || 1) * 4));
      return;
    }
    const frac = directRewardFraction(n);
    const divisor = Math.max(0.04, wisdomMultiplier() * gainMultiplier());
    balancedXpAdd((xpn * frac) / divisor);
  };

  xpAdd = balancedXpAdd;

  start = function() {
    const out = baseStart.apply(this, arguments);
    try { xpn = balancedNeed(lvl); } catch (_) {}
    return out;
  };

  if (typeof EV !== 'undefined') {
    for (const ev of EV) if (ev && ev[2] === 'Horda sangrenta: XP em dobro') ev[2] = 'Horda sangrenta: XP +35%';
  }

  window.SCXpBalance = {
    version:'4.0',
    difficulty:DIFF_GAIN.slice(),
    modes:MODE_GAIN.slice(),
    extras:EXTRA_GAIN.slice(),
    need:balancedNeed,
    gain:gainMultiplier
  };
  console.log('[Mobile] XP Balance 4.0 enabled: progressive level curve + difficulty/mode/infinite scaling + partial direct-level rewards.');
} catch (err) {
  console.warn('[Mobile XP Balance]', err);
}
})();
