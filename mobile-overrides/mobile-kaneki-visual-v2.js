(() => {
'use strict';
try {
  if (typeof SK === 'undefined' || typeof hero !== 'function') return;

  const ATLAS = 'player-skins-redesign.png';
  const CW = 56, CH = 76;
  const POSE = { front:0, side:1, back:2, walk:3, dash:4 };
  const img = new Image();
  let ready = false;
  img.decoding = 'async';
  img.onload = () => { ready = true; };
  img.src = ATLAS;

  const nativeHero = hero;

  function atlasIndex(sk) {
    if (!sk) return -1;
    const name = String(sk[0] || '');
    if (name === 'ADMIN') return 20;
    if (/^Kaneki\b/i.test(name)) return 21;
    const i = SK.indexOf(sk);
    return i >= 0 && i < 20 ? i : -1;
  }

  function facing(a) {
    const ca = Math.cos(a || 0), sa = Math.sin(a || 0);
    if (Math.abs(sa) > Math.abs(ca) * 1.05) return sa > 0 ? 'down' : 'up';
    return ca < 0 ? 'left' : 'right';
  }

  function choosePose(dir, q) {
    const dash = !!(q && q.dT > 0);
    const moving = typeof mv !== 'undefined' && !!mv;
    if (dir === 'up') return POSE.back;
    if (dir === 'down') return POSE.front;
    if (dash) return POSE.dash;
    if (moving) {
      const t = typeof tm === 'number' ? tm : performance.now() / 1000;
      return Math.floor(t * 7) & 1 ? POSE.walk : POSE.side;
    }
    return POSE.side;
  }

  function classicWeapon(c, px, py, r, a) {
    c.save();
    c.translate(px, py);
    c.rotate(a || 0);
    c.fillStyle = '#11151f';
    c.fillRect(r * .46, -r * .15, r * 1.0, r * .30);
    c.fillStyle = '#3b4252';
    c.fillRect(r * .48, -r * .11, r * .70, r * .22);
    c.fillStyle = '#ffb340';
    c.fillRect(r * 1.23, -r * .08, r * .22, r * .16);
    c.fillStyle = '#171a22';
    c.fillRect(r * .67, r * .10, r * .22, r * .40);
    c.restore();
  }

  function drawSkin(c, px, py, r, sk, a, z, q) {
    const idx = atlasIndex(sk);
    if (!ready || idx < 0) return false;

    const dir = facing(a), pose = choosePose(dir, q), flip = dir === 'left';
    const moving = typeof mv !== 'undefined' && !!mv;
    const t = typeof tm === 'number' ? tm : performance.now() / 1000;
    const bob = moving && (dir === 'up' || dir === 'down') ? Math.sin(t * 13) * r * .045 : 0;
    const dh = r * 2.58;
    const dw = dh * (CW / CH);
    const footY = r * .96 + bob;

    c.save();
    c.translate(px, py);
    c.imageSmoothingEnabled = false;

    c.globalAlpha = .25;
    c.fillStyle = '#000';
    c.beginPath();
    c.ellipse(0, r * .91, r * .78, r * .24, 0, 0, Math.PI * 2);
    c.fill();
    c.globalAlpha = 1;

    if (flip) c.scale(-1, 1);
    c.drawImage(img, pose * CW, idx * CH, CW, CH, -dw / 2, footY - dh, dw, dh);
    c.restore();

    if (q && !z) {
      try {
        if (idx === 0) classicWeapon(c, px, py, r, a);
        else if (window.SCArsenal && typeof SCArsenal.drawWeapon === 'function' && idx <= 20)
          SCArsenal.drawWeapon(c, px, py, r, idx, a, q);
      } catch (_) {}
    }
    return true;
  }

  hero = function(c, px, py, r, sk, a, z, q) {
    if (drawSkin(c, px, py, r, sk, a, z, q)) return;
    return nativeHero.apply(this, arguments);
  };

  window.SCSkinRedesign = {
    version: '3.0',
    atlas: ATLAS,
    source: 'approved-concept-art',
    frame: [CW, CH],
    skins: 22,
    poses: ['front','side','back','walk','dash'],
    ready: () => ready
  };
  console.log('[Mobile] Skin Redesign 3.0 loaded: 22 current skins use the approved concept-art pixel sprites.');
} catch (err) {
  console.warn('[Mobile Skin Redesign 3.0]', err);
}
})();