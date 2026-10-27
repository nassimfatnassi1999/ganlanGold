/** Decorative progressive olive → oil motion; no framework, dependencies or network calls. */
(() => {
  "use strict";
  const markup = `<div class="olive-journey" aria-hidden="true" data-olive-journey>
  <svg class="olive-journey__art" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1160 225" preserveAspectRatio="xMidYMid meet" role="presentation">
    <defs>
      <linearGradient id="oil-gold" x1="0" y1="0" x2="1" y2="1"><stop stop-color="#f9d875"/><stop offset=".55" stop-color="#d3a73b"/><stop offset="1" stop-color="#a87b28"/></linearGradient>
      <linearGradient id="bottle-emerald" x1="0" y1="0" x2="1" y2="0"><stop stop-color="#071d13"/><stop offset=".55" stop-color="#1d5536"/><stop offset="1" stop-color="#081e16"/></linearGradient>
      <radialGradient id="bowl-light"><stop stop-color="#ffe29c"/><stop offset="1" stop-color="#d0a44d"/></radialGradient>
    </defs>
    <g class="olive-journey__branch">
      <path d="M52 164 Q134 80 300 64 M128 93 Q182 102 216 143" stroke="#b5aa70" stroke-width="4" fill="none" stroke-linecap="round"/>
      <g fill="#7d9a60" stroke="#d1cf88" stroke-width="1.2">
        <path d="M76 137 Q54 95 28 104 Q30 130 76 137Z"/><path d="M118 102 Q95 60 64 73 Q71 103 118 102Z"/>
        <path d="M168 81 Q144 40 113 57 Q124 83 168 81Z"/><path d="M224 65 Q208 24 177 38 Q184 64 224 65Z"/>
        <path d="M99 118 Q113 157 149 155 Q151 127 99 118Z"/><path d="M157 85 Q179 130 208 118 Q197 88 157 85Z"/>
        <path d="M221 69 Q238 99 271 90 Q266 65 221 69Z"/>
      </g>
      <ellipse class="olive-journey__olive" cx="159" cy="124" rx="14" ry="20" transform="rotate(-24 159 124)" fill="#849440" stroke="#bdaf57" stroke-width="2"/>
      <ellipse class="olive-journey__olive" cx="205" cy="96" rx="12" ry="18" transform="rotate(24 205 96)" fill="#b8a139" stroke="#d9ba5e" stroke-width="2"/>
    </g>
    <path d="M320 110 H428" stroke="#dcc183" stroke-width="1" stroke-dasharray="4 9" opacity=".4"/>
    <g class="olive-journey__bottle">
      <rect x="525" y="51" width="65" height="138" rx="15" fill="url(#bottle-emerald)" stroke="#b6a15b" stroke-width="2"/>
      <rect x="540" y="26" width="35" height="36" rx="6" fill="#112c1e" stroke="#c3a85e" stroke-width="2"/>
      <rect x="538" y="18" width="39" height="16" rx="4" fill="url(#oil-gold)"/>
      <path d="M543 35 V23 M549 35 V23 M556 35 V23 M563 35 V23 M570 35 V23" stroke="#8c6a2c" stroke-width="1" opacity=".75"/>
      <rect x="534" y="102" width="47" height="66" rx="5" fill="#0b3020" stroke="#cdaa58" stroke-width="1.3"/>
      <path d="M545 134 Q555 118 569 132 M557 120 L557 148 M547 143 Q559 133 569 143" fill="none" stroke="#d3b368" stroke-width="1.8" stroke-linecap="round"/>
      <path d="M534 75 C530 89 531 107 534 122" stroke="#a6bf72" stroke-width="3" opacity=".55" fill="none"/>
    </g>
    <path class="olive-journey__stream" d="M516 42 C503 64 497 74 483 96 C475 113 474 128 484 147" fill="none" stroke="url(#oil-gold)" stroke-width="6" stroke-linecap="round"/>
    <path class="olive-journey__drop" d="M486 149 Q476 165 486 173 Q497 167 486 149Z" fill="url(#oil-gold)"/>
    <g transform="translate(470 169)"><ellipse rx="88" ry="14" fill="#061b11" opacity=".32" cy="23"/><path d="M-78 -3 Q-65 37 0 38 Q65 37 78 -3" fill="#d3bc83" stroke="#f2dca1" stroke-width="2"/><ellipse rx="79" ry="16" cy="-3" fill="#eee0bf" stroke="#a89460" stroke-width="3"/><ellipse rx="61" ry="10" cy="-3" fill="url(#bowl-light)"/></g>
    <path d="M690 115 H800" stroke="#dcc183" stroke-width="1" stroke-dasharray="4 9" opacity=".4"/>
    <g opacity=".76"><path d="M865 159 Q908 100 1007 83" stroke="#b2aa70" stroke-width="3" fill="none"/>
      <path d="M897 127 Q887 99 861 112 Q871 132 897 127Z M933 104 Q918 72 892 88 Q904 108 933 104Z M968 90 Q962 60 935 71 Q949 96 968 90Z" fill="#86a36c" stroke="#d0c58a"/>
      <ellipse cx="924" cy="120" rx="11" ry="16" transform="rotate(22 924 120)" fill="#b6a148"/>
      <ellipse cx="973" cy="101" rx="12" ry="17" transform="rotate(-19 973 101)" fill="#85913f"/>
    </g>
  </svg></div>`;
  const boot = () => {
    if (document.querySelector('[data-olive-journey]')) return;
    const origin = document.getElementById('origin');
    if (!origin) return;
    origin.insertAdjacentHTML('afterend', markup);
    const scene = document.querySelector('[data-olive-journey]');
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)');
    let queued = false;
    const update = () => {
      queued = false;
      if (reduced.matches) { scene.style.setProperty('--olive-progress','0'); return; }
      const r = scene.getBoundingClientRect();
      const progress = Math.max(0, Math.min(1, (window.innerHeight - r.top) / (window.innerHeight + r.height)));
      scene.style.setProperty('--olive-progress', progress.toFixed(3));
      scene.style.setProperty('--olive-x', `${(progress*16).toFixed(2)}px`);
      scene.style.setProperty('--olive-bob', `${(-11*(1-progress)).toFixed(2)}px`);
      scene.style.setProperty('--olive-branch-angle', `${(progress*8).toFixed(2)}deg`);
      scene.style.setProperty('--olive-growth', (0.92 + progress*.08).toFixed(3));
      scene.style.setProperty('--oil-bottle-y', `${(5*(1-progress)).toFixed(2)}px`);
      scene.style.setProperty('--oil-bottle-angle', `${(-38*progress).toFixed(2)}deg`);
      scene.style.setProperty('--oil-flow-opacity', Math.min(1,Math.max(0,(progress-.3)*3.2)).toFixed(3));
      scene.style.setProperty('--oil-flow-dash', (135*(1-progress)).toFixed(2));
      scene.style.setProperty('--oil-drop-opacity', Math.min(1,Math.max(0,(progress-.48)*3)).toFixed(3));
      scene.style.setProperty('--oil-drop-y', `${(36*progress).toFixed(2)}px`);
    };
    const onScroll = () => { if (!queued) { queued = true; requestAnimationFrame(update); } };
    window.addEventListener('scroll',onScroll,{passive:true});
    window.addEventListener('resize',onScroll,{passive:true});
    reduced.addEventListener?.('change',onScroll);
    update();
  };
  const afterHydration = () => {
    // React has committed its initial client effects before we add a decorative sibling.
    if (document.querySelector('[data-reveal-ready="true"]')) { boot(); return; }
    const host = document.getElementById('main-content');
    if (!host) return;
    const observer = new MutationObserver(() => {
      if (!document.querySelector('[data-reveal-ready="true"]')) return;
      observer.disconnect(); boot();
    });
    observer.observe(host, { attributes: true, subtree: true, attributeFilter: ['data-reveal-ready'] });
    window.setTimeout(() => { observer.disconnect(); boot(); }, 3500);
  };
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', afterHydration, {once:true});
  else afterHydration();
})();
