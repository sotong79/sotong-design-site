/* 디자인소통 예상 견적 시안 v3 · 2026-10-30
 * 기준: 34평, 방3/욕실2, 일부 확장, 강마루/실크, ㄱ자3.6m,
 * 창호 필름, 신발장/냉장고장/발코니장. 방수 포함 공급가 60,000,000원.
 * 아래 공정별 배분/계수는 제출 견적을 참고한 운영 가정이며 확정 단가표가 아닙니다.
 * 기존 협력업체 견적에 관리비가 포함되어 있으면 이를 다시 가산하지 마세요.
 */
(function (root) {
  'use strict';
  const processes=[
    {key:'doDemolition',id:'demolition',label:'기본 철거·폐기물'},
    {key:'doPlumbing',id:'plumbing',label:'기본 설비'},
    {key:'doWoodwork',id:'woodwork',label:'목공·방문'},
    {key:'doElectric',id:'electric',label:'전기·기본 조명'},
    {key:'doFloor',id:'floor',label:'바닥 마감'},
    {key:'doWall',id:'wall',label:'도배'},
    {key:'doBath',id:'bathroom',label:'욕실·방수'},
    {key:'doKitchen',id:'kitchen',label:'기본 주방'},
    {key:'doFurniture',id:'furniture',label:'제작 가구'},
    {key:'doWindow',id:'window',label:'창호'},
    {key:'doFilm',id:'film',label:'현관문·기본 필름'},
    {key:'doRepair',id:'baseRepair',label:'부분 단열·바탕 보수'},
    {key:'doTile',id:'tile',label:'욕실 외 타일'},
    {key:'doPaint',id:'paint',label:'발코니 도장'},
    {key:'doFinish',id:'finish',label:'마감·입주청소'}
  ];
  const defaults = Object.assign({ area:34, rooms:3, baths:2, expansion:'partial', floor:'wood', wall:'silk', bathGrade:'standard', kitchen:'l', kitchenLength:3.6, window:'film', shoe:true, fridge:true, utility:true, wardrobe:0, island:false, middleDoor:false, fan:false, indirect:false, livingExtension:false, kitchenExtension:false, roomExtension:0, aircon:false, pipes:false, structure:false, leak:false },Object.fromEntries(processes.map(p=>[p.key,true])));
  const options = {
    expansion:[['none','확장하지 않은 집','기존 발코니 유지'],['partial','일부 확장된 집','기본 선택'],['all','전체 확장된 집','방·거실 확장 기준']],
    floor:[['vinyl','장판','실용적인 기본 마감'],['wood','강마루','기본 선택'],['wide','광폭 강마루','넓은 폭의 마루']],
    wall:[['paper','합지벽지','실용적인 종이 벽지'],['silk','실크벽지','기본 선택'],['premium','고급 실크벽지','질감·마감 업그레이드']],
    bathGrade:[['standard','기본 욕실','기본 도기·수전·타일'],['premium','업그레이드 욕실','도기·수전·타일 사양 상향']],
    kitchen:[['straight','일자형','기본 조리·수납 구성'],['l','ㄱ자형','기본 선택'],['u','ㄷ자형','넉넉한 조리·수납 구성']],
    window:[['keep','기존 창호 유지','교체·필름 비용 제외'],['film','필름 리폼','기본 선택 · 기존 프레임 마감'],['partial','부분 교체','일부 창 교체 예산'],['all','전체 교체','전체 창 교체 예산'],['unknown','잘 모르겠어요','필름 예산 임시 반영 · 상담 확인']]
  };
  const rates = { floor:{vinyl:0.6,wood:1,wide:1.35}, wall:{paper:0.7,silk:1,premium:1.35}, bath:{standard:4250000,premium:5500000}, window:{keep:0,film:3000000,partial:5500000,all:11500000,unknown:3000000}, kitchen:{straight:0.9,l:1,u:1.18}, expansion:{none:0.77,partial:0.85,all:0.90}, management:7000000/53000000 };
  function normalize(input) {
    const s=Object.assign({},defaults,input||{});
    const bounds={area:[10,80],rooms:[1,6],baths:[0,3],kitchenLength:[2,8],wardrobe:[0,15],roomExtension:[0,3]};
    for(const [k,[min,max]] of Object.entries(bounds)) { const n=Number(s[k]); s[k]=Math.min(max,Math.max(min,Number.isFinite(n)?n:defaults[k])); }
    for(const k of ['rooms','baths','roomExtension']) s[k]=Math.round(s[k]);
    for(const k of Object.keys(options)) if(!options[k].some(o=>o[0]===s[k])) s[k]=defaults[k];
    for(const k of Object.keys(defaults)) if(typeof defaults[k]==='boolean') s[k]=s[k]===true;
    if(s.expansion==='all') {s.livingExtension=false;s.kitchenExtension=false;s.roomExtension=0;}
    return s;
  }
  function calculate(input) {
    const s=normalize(input), round=n=>Math.round(n/10000)*10000;
    const areaRatio=s.area/34, mixed=(variable)=>1-variable+variable*areaRatio;
    const newFloor=(s.livingExtension?3:0)+(s.kitchenExtension?1.5:0)+s.roomExtension*1.5;
    const floorArea=s.area*rates.expansion[s.expansion]+newFloor;
    const rows=[]; const add=(id,label,amount)=>{const p=processes.find(p=>p.id===id);rows.push({id,label,amount:p&&!s[p.key]?0:Math.max(0,round(amount))});};
    add('demolition','기본 철거·폐기물',4200000*mixed(0.7));
    add('plumbing','기본 설비',1800000*mixed(0.3));
    add('woodwork','목공·방문',6500000*mixed(0.5)+(s.rooms-3)*200000);
    add('electric','전기·기본 조명',3200000*mixed(0.6));
    add('floor','바닥 마감',3500000*(floorArea/(34*0.85))*rates.floor[s.floor]);
    add('wall','벽·천장 도배',3800000*mixed(0.85)*rates.wall[s.wall]);
    add('bathroom','욕실 전체 공사·방수',s.baths*rates.bath[s.bathGrade]);
    add('kitchen','기본 주방',6500000*(0.3+0.7*s.kitchenLength/3.6)*rates.kitchen[s.kitchen]);
    add('furniture','제작 가구', (s.shoe?1300000:0)+(s.fridge?1100000:0)+(s.utility?1100000:0)+s.wardrobe*550000+(s.island?1800000:0));
    add('window','창호'+(s.window==='unknown'?' 임시 예산':''),rates.window[s.window]*mixed(0.7));
    add('film','현관문·기본 필름',1500000*mixed(0.5));
    add('baseRepair','부분 단열·바탕 보수',2500000*mixed(0.5));
    add('tile','현관·주방·발코니 타일',2000000*mixed(0.5));
    add('paint','발코니 도장',1000000*mixed(0.5));
    add('finish','마감·입주청소',1500000*mixed(0.6));
    add('extras','선택 공사', (s.middleDoor?1200000:0)+(s.fan?700000:0)+(s.indirect?1400000:0)+(s.livingExtension?2000000:0)+(s.kitchenExtension?1500000:0)+s.roomExtension*1500000);
    const subtotal=rows.reduce((a,r)=>a+r.amount,0);
    add('management','현장관리·공통경비',subtotal*rates.management);
    const beforeRounding=rows.reduce((a,r)=>a+r.amount,0);
    const supply=Math.floor(beforeRounding/100000)*100000;
    if(supply!==beforeRounding)rows.push({id:'rounding',label:'공사금액 단수조정',amount:supply-beforeRounding});
    const vat=Math.round(supply/10),total=supply+vat;
    const pending=[];
    if(s.doWindow&&s.window==='unknown') pending.push('창호 범위 확정(필름 예산 임시 반영)');
    for(const [k,label] of [['aircon','시스템에어컨 제품·설치'],['pipes','급수·난방 배관 전체 교체'],['structure','구조·벽체 변경'],['leak','누수 원인 보수·특수 단열']]) if(s[k]) pending.push(label);
    return {state:s,rows,supply,vat,total,beforeRounding,pending,excluded:processes.filter(p=>!s[p.key]).map(p=>p.label),floorArea:Math.round(floorArea*10)/10,wallArea:Math.round(s.area*2.6*10)/10};
  }
  function label(key,value) { return (options[key].find(x=>x[0]===value)||['',value])[1]; }
  function money(n) {return (n/10000).toLocaleString('ko-KR',{maximumFractionDigits:1})+'만원';}
  const api={defaults,options,rates,processes,normalize,calculate,label,money,version:'2026-10-30-final'};
  root.SotongEstimate=api;
  if(typeof module!=='undefined'&&module.exports) module.exports=api;
})(typeof window!=='undefined'?window:globalThis);
