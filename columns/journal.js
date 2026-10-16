/* Search and pagination enhance links already present in the HTML. */
(function () {
  'use strict';
  function normalize(value) {
    return String(value || '').normalize('NFKC').toLocaleLowerCase('ko').replace(/\s+/g, ' ').trim();
  }
  function matches(text, query) {
    const haystack = normalize(text);
    return normalize(query).split(' ').filter(Boolean).every(term => haystack.includes(term));
  }
  function paginate(items, requestedPage, pageSize) {
    const pages = Math.max(1, Math.ceil(items.length / pageSize));
    const page = Math.min(Math.max(1, Number(requestedPage) || 1), pages);
    return { page, pages, items: items.slice((page - 1) * pageSize, page * pageSize) };
  }
  if (typeof module !== 'undefined' && module.exports) module.exports = { normalize, matches, paginate };
  if (typeof document === 'undefined') return;
  const form = document.querySelector('.sj-search');
  if (!form) return;
  const input = form.querySelector('input[name="q"]');
  const cards = Array.from(document.querySelectorAll('.sj-card'));
  const pagination = document.getElementById('sj-pagination');
  const count = document.getElementById('sj-count');
  const empty = document.getElementById('sj-empty');
  const heading = document.getElementById('sj-list-start');
  const params = new URLSearchParams(location.search);
  const size = 12;
  let currentPage = Number(params.get('page')) || 1;
  input.value = params.get('q') || '';
  function render(moveFocus) {
    const filtered = cards.filter(card => matches(card.dataset.search, input.value));
    const result = paginate(filtered, currentPage, size);
    currentPage = result.page;
    const visible = new Set(result.items);
    cards.forEach(card => { card.hidden = !visible.has(card); });
    empty.hidden = filtered.length > 0;
    count.textContent = filtered.length ? '총 ' + filtered.length + '편 · ' + currentPage + ' / ' + result.pages + '페이지' : '검색 결과 0편';
    pagination.replaceChildren();
    function button(label, page, disabled, current) {
      const el = document.createElement('button');
      el.type = 'button';
      el.textContent = label;
      el.disabled = disabled;
      el.setAttribute('aria-label', label === '이전' || label === '다음' ? label + ' 페이지' : label + '페이지');
      if (current) el.setAttribute('aria-current', 'page');
      el.addEventListener('click', function () { currentPage = page; render(true); });
      pagination.appendChild(el);
    }
    if (filtered.length > size) {
      button('이전', currentPage - 1, currentPage === 1, false);
      for (let page = 1; page <= result.pages; page++) button(String(page), page, false, page === currentPage);
      button('다음', currentPage + 1, currentPage === result.pages, false);
    }
    const nextParams = new URLSearchParams();
    if (input.value.trim()) nextParams.set('q', input.value.trim());
    if (currentPage > 1) nextParams.set('page', String(currentPage));
    const suffix = nextParams.toString();
    try { history.replaceState(null, '', location.pathname + (suffix ? '?' + suffix : '') + location.hash); } catch (_) { /* Local previews may restrict history. */ }
    if (moveFocus) {
      heading.focus({ preventScroll: true });
      heading.scrollIntoView({ behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth', block: 'start' });
    }
  }
  form.addEventListener('submit', function (event) { event.preventDefault(); currentPage = 1; render(false); });
  form.addEventListener('reset', function () { input.value = ''; currentPage = 1; render(false); });
  render(false);
})();
