from pathlib import Path
import json, shutil, zipfile, re, html
_initial = json.loads((Path(__file__).resolve().parent / "articles.json").read_text())
ARTICLES = _initial["articles"]
CATEGORIES = [c["name"] for c in _initial["categories"]]

ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT
OUT.mkdir(exist_ok=True)
(OUT / 'columns/categories').mkdir(parents=True, exist_ok=True)
(OUT / 'maintenance').mkdir(exist_ok=True)
E = html.escape
BASE = 'https://designsotong.com'
VERSION = '20261015-final'
CATS = dict(zip(CATEGORIES, ['major-repair', 'building-performance', 'space-design', 'cost-contract']))
DESCS = dict(zip(CATEGORIES, [
    '용도변경, 주차, 피난과 도로 조건. 공사를 계획하기 전 확인할 기준을 살펴봅니다.',
    '구조보강, 외벽, 방수, 배관과 단열. 보이지 않는 건물의 기본을 다룹니다.',
    '병원과 상가, 주거 공간의 동선·조명·창호·천장을 사용자의 관점에서 살펴봅니다.',
    '견적 비교부터 계약, 설계 검토와 공정 계획까지. 공사 전 합의할 내용을 정리합니다.'
]))

# Use the user's homepage and preserve all existing project/contact sections.
SOURCE = (ROOT / 'maintenance/home-template.html').read_text()
HEADER = re.search(r'<header class="site-header".*?</header>', SOURCE, re.S).group()
FOOTER = re.search(r'<footer>.*?</footer>', SOURCE, re.S).group()

def header(prefix='', current=False):
    s = HEADER
    menu = '<a href="'+prefix+'columns/index.html"'+(' aria-current="page"' if current else '')+'>공간 칼럼</a>'
    s = s.replace('<a href="#contact">문의하기</a>', menu+'\n      <a href="#contact">문의하기</a>', 1)
    nav = re.search(r'<nav class="nav-links".*?</nav>', s, re.S).group()
    mobile = '<details class="journal-mobile-menu"><summary>메뉴 <span aria-hidden="true">＋</span></summary><nav aria-label="모바일 주요 메뉴">'+re.sub(r'^<nav[^>]*>|</nav>$','',nav,flags=re.S)+'</nav></details>'
    s = s.replace('</nav>', '</nav>\n'+mobile, 1)
    if prefix:
        s = s.replace('src="images/', 'src="'+prefix+'images/')
        s = s.replace('href="#top"', 'href="'+prefix+'index.html"')
        s = re.sub(r'href="#([^"]+)"', lambda m:'href="'+prefix+'index.html#'+m[1]+'"', s)
    return s

def footer(prefix=''):
    s = FOOTER.replace('<div class="footer-links">','<div class="footer-links"><a href="'+prefix+'columns/index.html">공간 칼럼</a>')
    if prefix:
        s = re.sub(r'href="#([^"]+)"',lambda m:'href="'+prefix+'index.html#'+m[1]+'"',s)
    return s

def category_url(cat, prefix=''):
    return prefix+'columns/categories/'+CATS[cat]+'.html'

def card(a, prefix='', heading='h2'):
    return f'''<article class="journal-card" data-journal-card data-search="{E(a['title']+' '+a['category']+' '+a['answer'], quote=True)}">
      <a class="journal-card-link" href="{prefix}columns/{a['slug']}.html">
        <span class="journal-kicker">{E(a['category'])}</span>
        <{heading}><span class="journal-q" aria-hidden="true">Q.</span> {E(a['title'])}</{heading}>
        <p>{E(a['answer'])}</p><span class="journal-read">칼럼 읽기 <span aria-hidden="true">↗</span></span>
      </a></article>'''

def page_head(title, description, url, prefix, schema):
    return f'''<!DOCTYPE html>
<html lang="ko"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1">
<title>{E(title)} | 디자인소통</title><meta name="description" content="{E(description, quote=True)}">
<link rel="canonical" href="{BASE+url}"><meta property="og:locale" content="ko_KR"><meta property="og:site_name" content="디자인소통">
<meta property="og:type" content="{'article' if schema.get('@type')=='Article' else 'website'}"><meta property="og:title" content="{E(title,quote=True)} | 디자인소통">
<meta property="og:description" content="{E(description,quote=True)}"><meta property="og:url" content="{BASE+url}"><meta name="twitter:card" content="summary">
<link rel="stylesheet" href="https://cdn.jsdelivr.net/gh/orioncactus/pretendard/dist/web/variable/pretendardvariable-dynamic-subset.css">
<link rel="stylesheet" href="{prefix}style.css?v=20260818-editorial-v3"><link rel="stylesheet" href="{prefix}column-style.css?v={VERSION}">
<script type="application/ld+json">{json.dumps(schema,ensure_ascii=False).replace('</','<\\/')}</script>
</head><body class="journal-page"><a class="journal-skip" href="#journal-main">본문 바로가기</a>{header(prefix,True)}
'''

def tabs(prefix='', selected=None):
    return '<nav class="journal-categories" aria-label="칼럼 카테고리">'+f'<a href="{prefix}columns/index.html"'+(' aria-current="page"' if selected is None else '')+f'>전체 <span>{len(ARTICLES)}</span></a>'+''.join(f'<a href="{category_url(c,prefix)}"'+(' aria-current="page"' if c==selected else '')+f'>{c} <span>{sum(a["category"]==c for a in ARTICLES)}</span></a>' for c in CATS)+'</nav>'

def consult(prefix=''):
    return f'''<aside class="journal-consult"><div><span class="journal-kicker">LET’S TALK</span><h2>우리 공간의 가능성도<br>함께 살펴볼까요?</h2><p>건물 위치와 현재 고민을 알려주세요.<br>공간에 필요한 검토부터 차근차근 시작합니다.</p></div><a class="journal-button" href="{prefix}index.html#contact">프로젝트 상담 <span aria-hidden="true">↗</span></a></aside>'''

def build(data):
    global ARTICLES, CATEGORIES, CATS
    ARTICLES = data['articles']
    CATEGORIES = [c['name'] for c in data['categories']]
    CATS = {c['name']:c['slug'] for c in data['categories']}
    slugs = [a['slug'] for a in ARTICLES]
    if len(slugs) != len(set(slugs)) or not all(re.fullmatch(r'[a-z0-9]+(?:-[a-z0-9]+)*',s) for s in slugs):
        raise ValueError('칼럼 slug는 중복 없는 영문 소문자·숫자·하이픈으로 작성하세요.')
    if not all(a['category'] in CATS and len(a['sections']) >= 1 for a in ARTICLES):
        raise ValueError('각 칼럼의 category와 sections를 확인하세요.')
    for c in data['categories']: DESCS[c['name']]=c['description']
    featured = [next(a for a in ARTICLES if a['category']==c) for c in CATEGORIES]
    top = featured[0]
    feature = f'''<!-- SPACE JOURNAL: featured question -->
<section class="journal-feature" aria-labelledby="journal-feature-title"><div class="wrap journal-feature-grid">
<div><p class="journal-kicker">SPACE JOURNAL</p><p class="journal-feature-label">공사 전,<br>먼저 나누고 싶은 이야기.</p><a class="journal-text-link" href="columns/index.html">전체 칼럼 보기 ↗</a></div>
<article><span class="journal-kicker">{top['category']}</span><h2 id="journal-feature-title"><a href="columns/{top['slug']}.html"><span class="journal-q">Q.</span> {top['title']}</a></h2><p>{top['answer']}</p><a class="journal-text-link" href="columns/{top['slug']}.html">답변 읽기 →</a></article>
</div></section>'''
    selection = f'''<!-- SPACE JOURNAL: homepage selection -->
<section class="journal-selection" id="columns" aria-labelledby="journal-selection-title"><div class="wrap">
<div class="journal-section-head"><div><p class="journal-kicker">SPACE JOURNAL</p><h2 id="journal-selection-title">공사를 결정하기 전,<br>궁금했던 질문들.</h2></div><div><p>법규와 건물 성능부터 공간 디자인, 견적과 계약까지.<br>필요한 기준을 글로 차근차근 살펴보세요.</p><a class="journal-text-link" href="columns/index.html">전체 {len(ARTICLES)}편 보기 ↗</a></div></div>
<div class="journal-card-grid">{''.join(card(a,heading='h3') for a in featured)}</div>
</div></section>'''
    main = SOURCE.replace(HEADER,header()).replace(FOOTER,footer())
    main = main.replace('  <!-- SERVICES -->',feature+'\n  <!-- SERVICES -->',1)
    main = main.replace('  <!-- CTA / CONTACT -->',selection+'\n  <!-- CTA / CONTACT -->',1)
    # Fail rather than silently omit insertion if source markers change.
    assert 'id="journal-feature-title"' in main and 'id="journal-selection-title"' in main
    main = main.replace('</head>',f'<link rel="stylesheet" href="column-style.css?v={VERSION}">\n</head>',1)
    main = main.replace('</body>',f'<script src="column-script.js?v={VERSION}" defer></script>\n</body>')
    (OUT/'index.html').write_text(main)
    for cat in [None]+CATEGORIES:
        items = [a for a in ARTICLES if cat is None or a['category']==cat]
        prefix = '../../' if cat else '../'
        dest = OUT/('columns/categories/'+CATS[cat]+'.html' if cat else 'columns/index.html')
        url = '/'+str(dest.relative_to(OUT))
        title = cat or '공간 칼럼'
        description = DESCS[cat] if cat else '대수선과 용도변경, 건물 성능, 공간 디자인, 견적과 계약. 공사 전 궁금했던 질문에 답하는 디자인소통 공간 칼럼입니다.'
        schema = {'@context':'https://schema.org','@type':'CollectionPage','name':title+' | 디자인소통','url':BASE+url,'inLanguage':'ko-KR','mainEntity':{'@type':'ItemList','itemListElement':[{'@type':'ListItem','position':i,'url':BASE+'/columns/'+a['slug']+'.html','name':a['title']} for i,a in enumerate(items,1)]}}
        content = page_head(title,description,url,prefix,schema)
        content += f'''<main id="journal-main" class="journal-main"><div class="wrap">
<nav class="journal-breadcrumb" aria-label="현재 위치"><a href="{prefix}index.html">홈</a><span>/</span>{('<a href="'+prefix+'columns/index.html">공간 칼럼</a><span>/</span>') if cat else ''}<span aria-current="page">{title}</span></nav>
<header class="journal-archive-head"><p class="journal-kicker">SPACE JOURNAL</p><h1>{cat if cat else '공간을 바꾸기 전,<br>질문부터 시작합니다.'}</h1><p>{description}</p></header>
{tabs(prefix,cat)}
<form class="journal-search" role="search" data-journal-search hidden><label for="journal-query">궁금한 주제 찾기</label><div class="journal-search-control"><input type="search" id="journal-query" name="q" placeholder="주차, 방수, 병원, 견적…" autocomplete="off"><button type="button" data-journal-clear>초기화</button><button type="submit">검색</button></div></form>
<div class="journal-results-head"><h2>{'카테고리 칼럼' if cat else '전체 칼럼'}</h2><p role="status" aria-live="polite" data-journal-count>총 {len(items)}편</p></div>
<div class="journal-card-grid">{''.join(card(a,prefix,heading='h3') for a in items)}</div>
<div class="journal-empty" data-journal-empty hidden><h2>일치하는 칼럼이 없습니다.</h2><p>다른 검색어로 다시 찾아보세요.</p></div>
{consult(prefix)}</div></main>{footer(prefix)}<script src="{prefix}column-script.js?v={VERSION}" defer></script></body></html>'''
        dest.write_text(content)
    for a in ARTICLES:
        prefix='../'; url='/columns/'+a['slug']+'.html'
        schema = {'@context':'https://schema.org','@type':'Article','headline':a['title'],'description':a['answer'],'inLanguage':'ko-KR','articleSection':a['category'],'mainEntityOfPage':{'@type':'WebPage','@id':BASE+url},'author':{'@type':'Organization','name':'디자인소통','url':BASE+'/'},'publisher':{'@type':'Organization','name':'디자인소통','url':BASE+'/'}}
        text=page_head(a['title'],a['answer'],url,prefix,schema)
        toc=''.join(f'<li><a href="#section-{i}">{E(s[0])}</a></li>' for i,s in enumerate(a['sections'],1))
        body=''.join(f'<section id="section-{i}" class="journal-body-section"><h2>{E(s[0])}</h2><p>{E(s[1])}</p></section>' for i,s in enumerate(a['sections'],1))
        related=[b for b in ARTICLES if b['category']==a['category'] and b['slug']!=a['slug']][:2]
        legal = '<p class="journal-scope-note">적용 기준은 건물의 용도·규모·위치와 관련 법령 및 조례에 따라 달라질 수 있으므로, 계획 단계에서 개별 검토가 필요합니다.</p>' if a['category']=='대수선과 용도변경' else ''
        text+=f'''<main id="journal-main" class="journal-main"><div class="wrap">
<nav class="journal-breadcrumb" aria-label="현재 위치"><a href="../index.html">홈</a><span>/</span><a href="index.html">공간 칼럼</a><span>/</span><a href="categories/{CATS[a['category']]}.html">{a['category']}</a></nav>
<article class="journal-article"><header class="journal-article-head"><a class="journal-kicker" href="categories/{CATS[a['category']]}.html">{a['category']}</a><h1>{E(a['title'])}</h1><p class="journal-byline">디자인소통 · 공간 칼럼</p></header>
<div class="journal-answer"><span class="journal-kicker">핵심 답변</span><p>{E(a['answer'])}</p></div>
<div class="journal-reading-layout"><aside class="journal-toc"><p>이 글에서 살펴볼 내용</p><ol>{toc}</ol><a class="journal-text-link" href="index.html">전체 칼럼 보기 ↗</a></aside>
<div class="journal-body">{body}<aside class="journal-checklist"><h2>상담 전 확인사항</h2><p>{E(a['checklist'])}</p></aside>{legal}<div class="journal-back"><a href="categories/{CATS[a['category']]}.html">← {a['category']} 목록</a><a href="index.html">전체 칼럼 →</a></div></div></div></article>
<section class="journal-related" aria-labelledby="related-title"><div class="journal-section-head"><h2 id="related-title">함께 읽으면 좋은 질문</h2><a class="journal-text-link" href="categories/{CATS[a['category']]}.html">카테고리 전체 보기 ↗</a></div><div class="journal-card-grid">{''.join(card(b,prefix,heading='h3') for b in related)}</div></section>
{consult(prefix)}</div></main>{footer(prefix)}<script src="../column-script.js?v={VERSION}" defer></script></body></html>'''
        (OUT/('columns/'+a['slug']+'.html')).write_text(text)
    # Previous draft URLs remain usable if a prior package was uploaded.
    for old,new in {'rebuild-or-remodel':'narrow-road-remodeling','major-repair-cost':'major-repair-estimate','design-to-completion':'3d-design-cost'}.items():
        # Resolve the actual slug from the final source instead of guessing names.
        target = next(a['slug'] for a in ARTICLES if a.get('original')=={'rebuild-or-remodel':6,'major-repair-cost':12,'design-to-completion':11}[old])
        (OUT/f'columns/{old}.html').write_text(f'<!doctype html><html lang="ko"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><meta name="robots" content="noindex"><meta http-equiv="refresh" content="0;url={target}.html"><link rel="canonical" href="{BASE}/columns/{target}.html"><title>칼럼으로 이동 | 디자인소통</title></head><body><p><a href="{target}.html">업데이트된 칼럼 읽기</a></p></body></html>')
    urls=['/columns/index.html']+['/columns/categories/'+s+'.html' for s in CATS.values()]+['/columns/'+a['slug']+'.html' for a in ARTICLES]
    xml='<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n'+''.join(f'  <url><loc>{BASE+u}</loc></url>\n' for u in urls)+'</urlset>\n'
    (OUT/'sitemap-columns.xml').write_text(xml)
    print(f'Generated {len(ARTICLES)} articles, {len(CATS)} category pages, main and archive.')

if __name__ == '__main__':
    build(json.loads((ROOT/'maintenance/articles.json').read_text()))
