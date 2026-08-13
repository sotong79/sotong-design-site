// scroll reveal
  const revealEls = document.querySelectorAll('.reveal');
  const io = new IntersectionObserver((entries)=>{
    entries.forEach(e=>{ if(e.isIntersecting){ e.target.classList.add('in'); io.unobserve(e.target); } });
  }, { threshold: 0.15 });
  revealEls.forEach(el=> io.observe(el));

  // hero full-bleed carousel
  (function(){
    const track = document.getElementById('hfTrack');
    if(!track) return;
    const slides = track.querySelectorAll('.hf-slide');
    const label = document.getElementById('hfLabel');
    const bar = document.getElementById('hfBar');
    const prevBtn = document.getElementById('hfPrev');
    const nextBtn = document.getElementById('hfNext');
    const prevZone = document.getElementById('hfPrevZone');
    const nextZone = document.getElementById('hfNextZone');
    const total = slides.length;
    let idx = 0, timer = null;
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    function render(){
      track.style.transform = 'translateX(-' + (idx * 100) + '%)';
      const projectNo = String(idx + 1).padStart(2, '0');
      label.innerHTML =
        '<span class="hf-category">' + slides[idx].dataset.category + '</span>' +
        '<span class="hf-title">' + slides[idx].dataset.label + '</span>' +
        '<span class="hf-project">PROJECT ' + projectNo + ' / ' + String(total).padStart(2, '0') + '</span>';
      bar.classList.remove('animate');
      void bar.offsetWidth;
      bar.classList.add('animate');
    }
    function goTo(i){ idx = (i + total) % total; render(); }
    function next(){ goTo(idx + 1); }
    function prev(){ goTo(idx - 1); }

    function startAuto(){ if(reduceMotion) return; stopAuto(); timer = setInterval(next, 4800); }
    function stopAuto(){ if(timer) clearInterval(timer); }

    nextBtn.addEventListener('click', ()=>{ next(); startAuto(); });
    prevBtn.addEventListener('click', ()=>{ prev(); startAuto(); });
    nextZone.addEventListener('click', ()=>{ next(); startAuto(); });
    prevZone.addEventListener('click', ()=>{ prev(); startAuto(); });

    const heroFull = document.getElementById('heroFull');
    heroFull.addEventListener('mouseenter', stopAuto);
    heroFull.addEventListener('mouseleave', startAuto);

    render();
    startAuto();
  })();

  // blueprint dialogue notes
  const notes = [
    {
      tag: '서교동 미용실 리모델링 — 주방/시술 공간',
      lines: [
        ['클라이언트', '"손님이 대기하면서 답답하지 않았으면 좋겠어요."'],
        ['디자인소통', '대기 공간과 시술 공간 사이 파티션을 낮추고, 창가 쪽으로 대기석을 재배치했습니다.']
      ]
    },
    {
      tag: '동교동 카페 — 홀 공간',
      lines: [
        ['클라이언트', '"로스팅하는 모습도 손님들에게 보여주고 싶어요."'],
        ['디자인소통', '로스팅 공간을 유리 파티션으로 분리해 시야는 열되 소음은 차단했습니다.']
      ]
    },
    {
      tag: '일산 아파트 — 주방/거실',
      lines: [
        ['클라이언트', '"주방과 거실이 자연스럽게 이어졌으면 좋겠어요."'],
        ['디자인소통', '가벽을 정리하고 아일랜드와 수납 동선을 재구성해 개방감 있는 공용 공간으로 설계했습니다.']
      ]
    },
    {
      tag: '구산동 아파트 — 거실/조명',
      lines: [
        ['클라이언트', '"저녁에 너무 밝지 않고 따뜻한 분위기였으면 좋겠습니다."'],
        ['디자인소통', '메인 등 대신 우물천장 간접 조명과 등기구 레이아웃을 다변화해 따뜻한 무드를 연출했습니다.']
      ]
    }
  ];

  const pinGroups = document.querySelectorAll('.pin-group');
  const notePanel = document.getElementById('notePanel');

  function renderNote(idx){
    const n = notes[idx];
    notePanel.innerHTML =
      '<div class="note-tag">' + n.tag + '</div>' +
      n.lines.map(l => '<div class="note-line"><b>'+l[0]+'</b><span>'+l[1]+'</span></div>').join('') +
      '<div class="note-hint"></div>';
  }

  pinGroups.forEach(g=>{
    g.addEventListener('click', ()=>{
      pinGroups.forEach(p=>p.classList.remove('active'));
      g.classList.add('active');
      renderNote(parseInt(g.dataset.note));
    });
    g.addEventListener('keypress', (e)=>{ if(e.key==='Enter') g.click(); });
  });

  // portfolio filter: existing tabs + intro category buttons share one state
  (function(){
    const cards = Array.from(document.querySelectorAll('#portfolioGrid .pf-card'));
    if(!cards.length) return;

    const tabs = Array.from(document.querySelectorAll('.tab'));
    const heroTags = Array.from(document.querySelectorAll('.hero-tag[data-filter]'));
    const status = document.getElementById('portfolioFilterStatus');
    const statusText = document.getElementById('portfolioFilterText');
    const resetButton = document.getElementById('portfolioFilterReset');
    const portfolio = document.getElementById('portfolio');
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    let activeFilter = 'all';

    function updateControls(filter){
      tabs.forEach(tab=>{
        const isActive = (tab.dataset.filter || 'all') === filter;
        tab.classList.toggle('active', isActive);
        tab.setAttribute('aria-pressed', String(isActive));
      });

      heroTags.forEach(button=>{
        const isActive = button.dataset.filter === filter;
        button.classList.toggle('is-active', isActive);
        button.setAttribute('aria-pressed', String(isActive));
      });
    }

    function updateStatus(filter){
      if(!status) return;

      const isAll = filter === 'all';
      status.hidden = isAll;
      if(!isAll && statusText){
        statusText.textContent = filter + ' 프로젝트만 보고 있습니다.';
      }
    }

    function applyFilter(filter, options){
      const opts = options || {};
      activeFilter = filter || 'all';

      cards.forEach(card=>{
        const show = activeFilter === 'all' || card.dataset.cat === activeFilter;
        card.hidden = !show;
        if(show) card.classList.add('in');
      });

      updateControls(activeFilter);
      updateStatus(activeFilter);

      if(opts.scroll && portfolio){
        portfolio.scrollIntoView({
          behavior: reduceMotion ? 'auto' : 'smooth',
          block: 'start'
        });
      }
    }

    tabs.forEach(tab=>{
      tab.addEventListener('click', ()=>{
        applyFilter(tab.dataset.filter || 'all');
      });
    });

    heroTags.forEach(button=>{
      button.addEventListener('click', ()=>{
        const filter = button.dataset.filter;
        const nextFilter = activeFilter === filter ? 'all' : filter;
        applyFilter(nextFilter, { scroll:true });
      });
    });

    if(resetButton){
      resetButton.addEventListener('click', ()=>{
        applyFilter('all');
      });
    }

    applyFilter('all');
  })();

  // contact form / FormSubmit AJAX
  (function(){
    const form = document.getElementById('contactForm');
    if(!form) return;

    const button = form.querySelector('button[type="submit"]');
    const status = document.getElementById('formStatus');
    const defaultButtonText = button ? button.textContent : '무료 상담 신청하기';

    form.addEventListener('submit', async (event)=>{
      event.preventDefault();

      if(!form.reportValidity()) return;

      if(button){
        button.disabled = true;
        button.textContent = '전송 중...';
      }
      if(status) status.textContent = '';

      try{
        const response = await fetch('https://formsubmit.co/ajax/designsotong79@naver.com', {
          method: 'POST',
          headers: {
            'Accept': 'application/json'
          },
          body: new FormData(form)
        });

        let result = {};
        try{
          result = await response.json();
        }catch(_e){
          result = {};
        }

        if(!response.ok || result.success === false || result.success === 'false'){
          throw new Error(result.message || 'Form submission failed');
        }

        form.reset();
        if(button) button.textContent = '접수되었습니다. 곧 연락드리겠습니다.';
        if(status) status.textContent = '문의가 정상적으로 접수되었습니다.';

        window.setTimeout(()=>{
          if(button) button.textContent = defaultButtonText;
          if(status) status.textContent = '';
        }, 5000);
      }catch(error){
        console.error('Contact form error:', error);
        if(button) button.textContent = '전송 실패 · 다시 시도해주세요';
        if(status) status.textContent = '전송 중 문제가 발생했습니다. 잠시 후 다시 시도하거나 전화 또는 이메일로 문의해 주세요.';

        window.setTimeout(()=>{
          if(button) button.textContent = defaultButtonText;
        }, 5000);
      }finally{
        if(button) button.disabled = false;
      }
    });
  })();
// sticky header: compact on scroll + highlight the current section
(function(){
  const header = document.getElementById('siteHeader');
  if(!header) return;

  const navLinks = Array.from(header.querySelectorAll('.nav-links a[href^="#"]'));
  const targets = navLinks
    .map(link => {
      const selector = link.getAttribute('href');
      const target = selector ? document.querySelector(selector) : null;
      return target ? { link, target } : null;
    })
    .filter(Boolean);

  let ticking = false;

  function setActiveLink(activeLink){
    navLinks.forEach(link => {
      const active = link === activeLink;
      link.classList.toggle('is-active', active);
      if(active){
        link.setAttribute('aria-current', 'location');
      }else{
        link.removeAttribute('aria-current');
      }
    });
  }

  function updateHeader(){
    const scrollY = window.scrollY || window.pageYOffset || 0;

    // Hysteresis keeps the compact state from oscillating around one threshold.
    // The header itself is fixed in CSS, so this only changes its visual size.
    if(scrollY > 48){
      header.classList.add('is-scrolled');
    }else if(scrollY < 12){
      header.classList.remove('is-scrolled');
    }

    if(targets.length){
      const probe = scrollY + header.offsetHeight + 96;
      let current = null;

      for(const item of targets){
        if(item.target.offsetTop <= probe){
          current = item.link;
        }else{
          break;
        }
      }

      // No menu item is highlighted while the user is still in the opening hero/intro area.
      setActiveLink(current);
    }

    ticking = false;
  }

  function requestUpdate(){
    if(ticking) return;
    ticking = true;
    window.requestAnimationFrame(updateHeader);
  }

  window.addEventListener('scroll', requestUpdate, { passive:true });
  window.addEventListener('resize', requestUpdate);
  window.addEventListener('load', requestUpdate);
  requestUpdate();
})();

// architectural drawing lightbox: original-resolution zoom + drag
(function(){
  const lightbox = document.getElementById('drawingLightbox');
  const image = document.getElementById('drawingLightboxImage');
  const title = document.getElementById('drawingLightboxTitle');
  const closeButton = document.getElementById('drawingLightboxClose');
  const viewport = document.getElementById('drawingLightboxViewport');
  const stage = document.getElementById('drawingLightboxStage');
  const zoomIn = document.getElementById('drawingZoomIn');
  const zoomOut = document.getElementById('drawingZoomOut');
  const zoomReset = document.getElementById('drawingZoomReset');
  const zoomLevel = document.getElementById('drawingZoomLevel');
  const openers = Array.from(document.querySelectorAll('[data-drawing-src]'));

  if(!lightbox || !image || !viewport || !stage || !openers.length) return;

  const minScale = 1;
  const maxScale = 3.5;
  const wheelStep = 0.16;
  let scale = 1;
  let x = 0;
  let y = 0;
  let dragging = false;
  let pointerId = null;
  let startX = 0;
  let startY = 0;
  let originX = 0;
  let originY = 0;
  let lastFocused = null;

  function clamp(value,min,max){
    return Math.min(max,Math.max(min,value));
  }

  function render(){
    stage.style.transform = `translate3d(${x}px, ${y}px, 0) scale(${scale})`;
    if(zoomLevel) zoomLevel.textContent = Math.round(scale * 100) + '%';
    if(zoomOut) zoomOut.disabled = scale <= minScale + 0.001;
    if(zoomIn) zoomIn.disabled = scale >= maxScale - 0.001;
    viewport.classList.toggle('is-draggable', scale > 1.001);
    if(scale <= 1.001){
      x = 0;
      y = 0;
      stage.style.transform = 'translate3d(0,0,0) scale(1)';
    }
  }

  function setScale(nextScale){
    scale = clamp(nextScale,minScale,maxScale);
    if(scale <= 1.001){
      x = 0;
      y = 0;
    }
    render();
  }

  function resetView(){
    scale = 1;
    x = 0;
    y = 0;
    render();
  }

  function openDrawing(opener){
    lastFocused = document.activeElement;
    const src = opener.dataset.drawingSrc;
    const label = opener.dataset.drawingTitle || 'DRAWING';
    const alt = opener.dataset.drawingAlt || label;

    image.src = src;
    image.alt = alt;
    if(title) title.textContent = label;
    resetView();

    lightbox.hidden = false;
    lightbox.setAttribute('aria-hidden','false');
    document.body.classList.add('drawing-modal-open');
    window.requestAnimationFrame(()=> closeButton && closeButton.focus());
  }

  function closeDrawing(){
    lightbox.hidden = true;
    lightbox.setAttribute('aria-hidden','true');
    document.body.classList.remove('drawing-modal-open');
    image.removeAttribute('src');
    resetView();
    if(lastFocused && typeof lastFocused.focus === 'function') lastFocused.focus();
  }

  openers.forEach(opener => {
    opener.addEventListener('click',()=> openDrawing(opener));
  });

  if(closeButton) closeButton.addEventListener('click',closeDrawing);
  if(zoomIn) zoomIn.addEventListener('click',()=> setScale(scale + .25));
  if(zoomOut) zoomOut.addEventListener('click',()=> setScale(scale - .25));
  if(zoomReset) zoomReset.addEventListener('click',resetView);

  viewport.addEventListener('wheel',(event)=>{
    event.preventDefault();
    const direction = event.deltaY < 0 ? 1 : -1;
    setScale(scale + direction * wheelStep);
  },{passive:false});

  viewport.addEventListener('dblclick',()=>{
    setScale(scale > 1.15 ? 1 : 2);
  });

  viewport.addEventListener('pointerdown',(event)=>{
    if(scale <= 1.001 || event.button !== 0) return;
    dragging = true;
    pointerId = event.pointerId;
    startX = event.clientX;
    startY = event.clientY;
    originX = x;
    originY = y;
    viewport.setPointerCapture(pointerId);
    viewport.classList.add('is-dragging');
  });

  viewport.addEventListener('pointermove',(event)=>{
    if(!dragging || event.pointerId !== pointerId) return;
    x = originX + (event.clientX - startX);
    y = originY + (event.clientY - startY);
    render();
  });

  function endDrag(event){
    if(!dragging || (event && event.pointerId !== pointerId)) return;
    dragging = false;
    viewport.classList.remove('is-dragging');
    if(pointerId !== null && viewport.hasPointerCapture(pointerId)){
      viewport.releasePointerCapture(pointerId);
    }
    pointerId = null;
  }

  viewport.addEventListener('pointerup',endDrag);
  viewport.addEventListener('pointercancel',endDrag);

  lightbox.addEventListener('click',(event)=>{
    if(event.target === viewport && scale <= 1.001) closeDrawing();
  });

  document.addEventListener('keydown',(event)=>{
    if(lightbox.hidden) return;
    if(event.key === 'Escape') closeDrawing();
    if(event.key === '+' || event.key === '=') setScale(scale + .25);
    if(event.key === '-') setScale(scale - .25);
    if(event.key === '0') resetView();
  });
})();
