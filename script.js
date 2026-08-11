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

  // portfolio filter
  const tabs = document.querySelectorAll('.tab');
  const cards = document.querySelectorAll('#portfolioGrid .pf-card');
  tabs.forEach(tab=>{
    tab.addEventListener('click', ()=>{
      tabs.forEach(t=>t.classList.remove('active'));
      tab.classList.add('active');
      const f = tab.dataset.filter;
      cards.forEach(c=>{
        c.style.display = (f==='all' || c.dataset.cat===f) ? '' : 'none';
      });
    });
  });

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

