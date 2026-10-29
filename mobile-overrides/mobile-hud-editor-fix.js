/* ©criado por Vitor Ag/Nyx - 2026 */
/* ©criado por Vitor Ag/Nyx - 2026 */
/* ©criado por Vitor Ag/Nyx - 2026 */
(() => {
'use strict';
try {
  let enhanced = false;

  function enhanceEditor() {
    const editor = document.getElementById('scHudEditor');
    if (!editor || editor.dataset.scChromeFix === '1') return false;
    editor.dataset.scChromeFix = '1';
    enhanced = true;

    const topBtns = editor.querySelector('.scHudEditTopBtns');
    if (!topBtns) return false;

    const toggle = document.createElement('button');
    toggle.type = 'button';
    toggle.id = 'scHudChromeToggle';
    toggle.textContent = '▾ OCULTAR';
    toggle.setAttribute('aria-label', 'Ocultar painéis do editor');
    topBtns.insertBefore(toggle, topBtns.firstChild);

    const mini = document.createElement('button');
    mini.type = 'button';
    mini.id = 'scHudChromeMini';
    mini.innerHTML = '<b>HUD</b><small>mostrar</small>';
    mini.setAttribute('aria-label', 'Mostrar painéis do editor');
    editor.appendChild(mini);

    const setHidden = on => {
      editor.classList.toggle('scHudChromeHidden', !!on);
      document.body.classList.toggle('scHudChromeHidden', !!on);
      toggle.textContent = on ? '▴ MOSTRAR' : '▾ OCULTAR';
      toggle.setAttribute('aria-label', on ? 'Mostrar painéis do editor' : 'Ocultar painéis do editor');
    };

    toggle.addEventListener('click', e => {
      e.preventDefault();
      e.stopPropagation();
      setHidden(true);
    });
    mini.addEventListener('click', e => {
      e.preventDefault();
      e.stopPropagation();
      setHidden(false);
    });

    const done = editor.querySelector('#scHudDone');
    if (done) done.addEventListener('click', () => setHidden(false), {capture:true});

    editor.addEventListener('click', e => {
      const b = e.target.closest && e.target.closest('[data-target]');
      if (!b) return;
      const key = b.dataset.target || '';
      if (/^(dash|ult|dash2|ult2|run|run2|quick)$/.test(key)) {
        const hint = editor.querySelector('#scHudHint');
        if (hint) hint.textContent = 'Controle selecionado · use OCULTAR para liberar a tela inteira e arrastar sem as barras cobrindo.';
      }
    });

    window.SCHudChrome = {hide:()=>setHidden(true), show:()=>setHidden(false), editor};
    return true;
  }

  const observer = new MutationObserver(() => enhanceEditor());
  observer.observe(document.body, {childList:true, subtree:true});
  enhanceEditor();

  console.log('[Mobile] HUD Editor 2.1 fix enabled: editor panels can be hidden while dragging controls.');
} catch (err) {
  console.warn('[Mobile HUD Editor Fix]', err);
}
})();
