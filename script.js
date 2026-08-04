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
      year: '2024'
      lines: [
        ['클라이언트', '"손님이 대기하면서 답답하지 않았으면 좋겠어요."'],
        ['소통디자인', '대기 공간과 시술 공간 사이 파티션을 낮추고, 창가 쪽으로 대기석을 재배치했습니다.']
      ]
    },
    {
      tag: '목동 상가주택 대수선 — 단열/외벽 마감',
      year: '2022'
      lines: [
        ['클라이언트', '"외관은 깔끔하게, 내부 온도는 따뜻하게! 겉과 속이 모두 새 건물처럼 바뀌길 기대했습니다."'],
        ['소통디자인', '철거 후 기존 벽체와 설비 상태를 확인하고 외단열, 창호와 배관의 공사 범위를 정리했습니다. 외부는 롱브릭 마감으로 건물의 전체 인상을 새롭게 구성했습니다.']
      ]
    },
    {
      tag: '당산 래미안 아파트 — 주방/거실',
      year: '2020'
      lines: [
        ['클라이언트', '"주방과 거실이 자연스럽게 이어졌으면 좋겠어요."'],
        ['소통디자인', '가벽을 정리하고 아일랜드와 수납 동선을 재구성해 개방감 있는 공용 공간으로 설계했습니다.']
      ]
    },
    {
      tag: '구산동 아파트 — 거실/조명',
      year: '2018'
      lines: [
        ['클라이언트', '"저녁에 너무 밝지 않고 따뜻한 분위기였으면 좋겠습니다."'],
        ['소통디자인', '메인 등 대신 우물천장 간접 조명과 등기구 레이아웃을 다변화해 따뜻한 무드를 연출했습니다.']
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
