/* Progressive enhancements only: every article and category works without JS. */
(() => {
  'use strict';
  // A local preview may not have the existing site's logo asset beside it.
  const logo = document.querySelector('.logo-img');
  if (logo) {
    const hideMissingLogo = () => { logo.hidden = true; };
    logo.addEventListener('error', hideMissingLogo);
    if (logo.complete && logo.naturalWidth === 0) hideMissingLogo();
  }
  const menu = document.querySelector('.journal-mobile-menu');
  if (menu) {
    menu.querySelectorAll('a').forEach(link => link.addEventListener('click', () => { menu.open = false; }));
    document.addEventListener('click', event => { if (!menu.contains(event.target)) menu.open = false; });
    document.addEventListener('keydown', event => {
      if (event.key === 'Escape' && menu.open) { menu.open = false; menu.querySelector('summary').focus(); }
    });
  }
  // Article/category pages do not load the homepage's carousel/form script.
  if (document.body.classList.contains('journal-page')) {
    const header = document.getElementById('siteHeader');
    const compact = () => header?.classList.toggle('is-scrolled', window.scrollY > 50);
    window.addEventListener('scroll', compact, { passive: true }); compact();
  }
  const form = document.querySelector('[data-journal-search]');
  if (!form) return;
  const input = form.querySelector('input');
  const cards = Array.from(document.querySelectorAll('[data-journal-card]'));
  const count = document.querySelector('[data-journal-count]');
  const empty = document.querySelector('[data-journal-empty]');
  const normalize = text => text.normalize('NFKC').toLocaleLowerCase('ko-KR').replace(/\s+/g, ' ').trim();
  function filter() {
    const terms = normalize(input.value).split(' ').filter(Boolean);
    let visible = 0;
    cards.forEach(card => {
      const matches = terms.every(term => normalize(card.dataset.search).includes(term));
      card.hidden = !matches;
      if (matches) visible++;
    });
    count.textContent = terms.length ? `검색 결과 ${visible}편 / 전체 ${cards.length}편` : `총 ${cards.length}편`;
    empty.hidden = visible !== 0;
  }
  const initial = new URLSearchParams(location.search).get('q');
  if (initial) input.value = initial;
  form.hidden = false;
  input.addEventListener('input', filter);
  form.addEventListener('submit', event => { event.preventDefault(); filter(); });
  form.querySelector('[data-journal-clear]').addEventListener('click', () => { input.value = ''; filter(); input.focus(); });
  filter();
})();
