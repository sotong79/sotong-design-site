/* Column navigation: same compact behavior as the homepage. */
(() => {
  'use strict';
  const header = document.getElementById('siteHeader');
  if (!header) return;
  const menu = header.querySelector('.journal-mobile-menu');
  // Original journal pages already register menu handlers in column-script.js.
  // New pages use this shared script for their menu and compact navigation.
  if (document.body.classList.contains('journal-page')) return;
  if (menu) {
    menu.querySelectorAll('a').forEach(link => link.addEventListener('click', () => { menu.open = false; }));
    document.addEventListener('click', event => { if (!menu.contains(event.target)) menu.open = false; });
    document.addEventListener('keydown', event => {
      if (event.key === 'Escape' && menu.open) {
        menu.open = false;
        menu.querySelector('summary').focus();
      }
    });
  }
  const logo = header.querySelector('.logo-img');
  if (logo) {
    const hideMissingLogo = () => { logo.hidden = true; };
    logo.addEventListener('error', hideMissingLogo);
    if (logo.complete && logo.naturalWidth === 0) hideMissingLogo();
  }
  let queued = false;
  function update() {
    const y = window.scrollY || window.pageYOffset || 0;
    if (y > 48) header.classList.add('is-scrolled');
    else if (y < 12) header.classList.remove('is-scrolled');
    queued = false;
  }
  function requestUpdate() {
    if (queued) return;
    queued = true;
    window.requestAnimationFrame(update);
  }
  window.addEventListener('scroll', requestUpdate, { passive: true });
  window.addEventListener('resize', requestUpdate);
  window.addEventListener('load', requestUpdate);
  requestUpdate();
})();
