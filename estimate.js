(function(){
  'use strict';
  const E=window.SotongEstimate,form=document.getElementById('estimateForm');
  if(!E||!form)return;
  const $=id=>document.getElementById(id),state=Object.assign({},E.defaults);
  let step=0,latest=null,hasResult=false,toastTimer;
  const escaped=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  document.querySelectorAll('[data-options]').forEach(el=>{
    const key=el.dataset.options;
    el.innerHTML=E.options[key].map(([value,label,hint])=>'<label><input type="radio" name="'+key+'" value="'+value+'"'+(state[key]===value?' checked':'')+'><span>'+label+'<small>'+hint+'</small></span></label>').join('');
  });
  $('processChoices').innerHTML=E.processes.map(p=>'<label><input type="checkbox" name="'+p.key+'" checked><span>'+p.label+'</span></label>').join('');
  function toast(message){$('estimateToast').textContent=message;$('estimateToast').hidden=false;clearTimeout(toastTimer);toastTimer=setTimeout(()=>$('estimateToast').hidden=true,4500);}
  function availability(){
    document.querySelectorAll('[data-process-fields]').forEach(el=>{
      const off=!state[el.dataset.processFields];
      if(el.tagName==='FIELDSET')el.disabled=off;
      el.classList.toggle('process-is-off',off);
      el.querySelectorAll('input,select,button').forEach(input=>input.disabled=off);
    });
    document.querySelectorAll('[data-process-toggle]').forEach(input=>input.checked=state[input.dataset.processToggle]);
    document.querySelectorAll('[data-process-status]').forEach(el=>{
      const key=el.dataset.processStatus;
      el.textContent=state[key]?(key==='doFurniture'?'필요한 가구와 붙박이장 길이를 선택해주세요.':'기존 창호 유지부터 전체 교체까지 선택할 수 있습니다.'):'현재 견적에서 제외되어 있습니다. 위의 공사 포함을 선택하면 아래 항목을 선택할 수 있습니다.';
    });
    $('bathGradeField').disabled=!state.doBath||Number(form.elements.baths.value)===0;
    document.querySelectorAll('[data-process-copy]').forEach(el=>el.hidden=!state[el.dataset.processCopy]);
    $('bathGradeField').querySelector('.included-note').hidden=!state.doBath||Number(form.elements.baths.value)===0;
  }
  function valid(){
    const area=Number($('area').value),good=$('area').value.trim()!==''&&Number.isFinite(area)&&area>=10&&area<=80;
    $('areaError').hidden=good;$('area').setAttribute('aria-invalid',String(!good));
    return good&&form.checkValidity();
  }
  function formView(){
    availability();
    $('processSelectionCount').textContent=E.processes.filter(p=>state[p.key]).length+'개 공정 선택';
    $('newExpansionField').disabled=state.expansion==='all';
    $('extensionHint').textContent=state.expansion==='all'?'이미 전체 확장된 집은 신규 확장을 선택할 수 없습니다. 기존 확장부 재시공은 별도 상담입니다.':'미확장 공간을 새로 확장하는 기준입니다. 기본 단열·난방 연결·미장을 반영하며, 창호·행위허가 등은 별도로 확인합니다.';
    if(state.expansion==='all'){
      for(const name of ['livingExtension','kitchenExtension']){form.elements[name].checked=false;state[name]=false;}
      form.elements.roomExtension.value=0;state.roomExtension=0;
    }
    document.querySelectorAll('[data-area]').forEach(b=>b.setAttribute('aria-pressed',String(Number(b.dataset.area)===state.area)));
  }
  function syncState(){
    for(const p of E.processes)state[p.key]=form.elements[p.key].checked;
    availability();
    if(!valid()){formView();$('liveEstimate').textContent='입력값을 확인한 뒤 마지막 단계에서 견적을 확인해주세요.';return false;}
    for(const key of Object.keys(E.defaults)){
      const el=form.elements[key];if(!el||el.disabled)continue;
      if(typeof E.defaults[key]==='boolean')state[key]=el.checked;
      else if(typeof E.defaults[key]==='number')state[key]=Number(el.value);
      else state[key]=el.value;
    }
    Object.assign(state,E.normalize(state));formView();return true;
  }
  function invalidate(changed){
    const wasResult=hasResult;hasResult=false;latest=null;
    $('resultContent').hidden=true;$('beforeEstimate').hidden=false;
    $('summaryTitle').textContent='예상 견적은 마지막에 확인해요.';
    $('beforeEstimateMessage').textContent=changed&&wasResult?'선택 조건이 변경되었습니다. 마지막 단계에서 ‘예상 견적 확인’을 다시 눌러주세요.':'공사할 항목을 모두 선택한 뒤, 마지막 단계에서 ‘예상 견적 확인’을 눌러주세요.';
    $('liveEstimate').textContent='입력 중에는 금액이 표시되지 않습니다.';
    $('mobileTotal').textContent='선택을 마친 뒤 확인';$('mobileSummary').textContent='마지막 단계 →';
    $('mobilePriceLabel').textContent='아파트 예상 견적';
    $('estimateContact').disabled=true;
  }
  function pair(label,value){return '<div><dt>'+label+'</dt><dd>'+escaped(value)+'</dd></div>';}
  function renderResult(){
    const s=latest.state;
    $('summaryTitle').textContent='선택한 공사의 예상 견적';
    $('supplyPrice').innerHTML=escaped((latest.supply/10000).toLocaleString('ko-KR'))+'<span>만원</span>';
    $('vatPrice').textContent=E.money(latest.vat);
    $('totalPrice').textContent='부가세 포함 합계 '+E.money(latest.total);
    const home=$('apartmentName').value.trim();
    $('summaryHome').textContent=(home?home+' · ':'')+s.area+'평 · 방 '+s.rooms+'개 · 욕실 공사 '+(s.doBath?s.baths:0)+'개';
    const furniture=[s.shoe?'신발장':'',s.fridge?'냉장고장':'',s.utility?'발코니장':'',s.island?'아일랜드':'',s.wardrobe?'붙박이장 '+s.wardrobe+'m':''].filter(Boolean).join(', ')||'선택 없음';
    const extras=[s.middleDoor?'중문':'',s.fan?'실링팬':'',s.indirect?'간접조명':'',s.livingExtension?'거실 확장':'',s.kitchenExtension?'주방 확장':'',s.roomExtension?'방 확장 '+s.roomExtension+'개':''].filter(Boolean).join(', ')||'선택 없음';
    $('selectionSummary').innerHTML=pair('마감',(s.doFloor?E.label('floor',s.floor):'바닥 제외')+' · '+(s.doWall?E.label('wall',s.wall):'도배 제외'))+pair('욕실',s.doBath&&s.baths?s.baths+'개 · '+E.label('bathGrade',s.bathGrade)+' · 방수 포함':'욕실 공사 제외')+pair('주방',s.doKitchen?E.label('kitchen',s.kitchen)+' · 약 '+s.kitchenLength+'m':'주방 공사 제외')+pair('창호',s.doWindow?E.label('window',s.window):'창호 공사 제외')+pair('가구',s.doFurniture?furniture:'제작 가구 제외')+pair('추가',extras)+(latest.excluded.length?pair('제외',latest.excluded.join(', ')):'');
    $('pendingNote').hidden=!latest.pending.length;
    $('pendingList').textContent=latest.pending.join(' / ')+(latest.pending.length?(s.doWindow&&s.window==='unknown'?' — 창호는 필름 예산을 임시 반영했습니다. 그 외 별도 상담 항목의 비용은 현재 합계에 포함되지 않습니다.':' — 선택한 별도 상담 공사의 비용은 현재 합계에 포함되지 않습니다.'):'');
    $('costRows').innerHTML=latest.rows.filter(r=>r.amount).map(r=>'<div class="cost-row"><span>'+r.label+'</span><span>'+E.money(r.amount)+'</span></div>').join('');
    $('beforeEstimate').hidden=true;$('resultContent').hidden=false;
    $('estimateContact').disabled=false;
    $('liveEstimate').textContent='선택하신 조건으로 계산했습니다. 공사금액은 십만원 단위로 절사했습니다.';
    $('mobileTotal').textContent='공사금액 '+E.money(latest.supply);$('mobileSummary').textContent='견적 확인 ↑';
    $('mobilePriceLabel').textContent='부가세 별도 · 합계는 결과에서 확인';
  }
  function focusSummary(){
    $('estimateSummary').focus({preventScroll:true});
    $('estimateSummary').scrollIntoView({behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'auto':'smooth',block:'start'});
  }
  function confirmEstimate(){
    if(!syncState()){form.reportValidity();return;}
    const candidate=E.calculate(state);
    if(!candidate.supply){invalidate(false);$('beforeEstimateMessage').textContent='산정할 공정을 한 개 이상 선택해주세요. 별도 상담 공사만 필요한 경우 상단의 무료 상담을 이용해주세요.';focusSummary();return;}
    latest=candidate;hasResult=true;renderResult();focusSummary();
  }
  function showStep(n,focus){
    if(!syncState()){form.reportValidity();return;}
    step=Math.min(3,Math.max(0,n));
    document.querySelectorAll('[data-panel]').forEach(p=>p.hidden=Number(p.dataset.panel)!==step);
    document.querySelectorAll('[data-step]').forEach(b=>Number(b.dataset.step)===step?b.setAttribute('aria-current','step'):b.removeAttribute('aria-current'));
    $('previousStep').hidden=step===0;$('nextStep').textContent=step===3?'예상 견적 확인':'다음 단계 →';$('stepCounter').textContent=(step+1)+' / 4';
    if(focus)$('stepTitle'+step).focus({preventScroll:true});
  }
  function summaryText(){
    const s=latest.state;
    return '[디자인소통 아파트 예상 견적]\n'+$('summaryHome').textContent+'\n기존 확장: '+E.label('expansion',s.expansion)+'\n'+Array.from($('selectionSummary').children).map(r=>r.querySelector('dt').textContent+': '+r.querySelector('dd').textContent).join('\n')+'\n\n'+latest.rows.filter(r=>r.amount).map(r=>r.label+': '+E.money(r.amount)).join('\n')+'\n\n공사금액(부가세 별도): '+E.money(latest.supply)+'\n부가세 10%: '+E.money(latest.vat)+'\n합계(VAT 포함): '+E.money(latest.total)+(latest.pending.length?'\n별도 확인/추가 비용: '+latest.pending.join(', '):'')+'\n※ 실측 전 참고용 금액입니다. 현장·자재·수량 확인 후 최종 견적이 확정됩니다.';
  }
  function handleChange(event){
    const key=event&&event.target&&event.target.dataset.processToggle;
    if(key&&E.processes.some(p=>p.key===key))form.elements[key].checked=event.target.checked;
    invalidate(true);syncState();
  }
  form.addEventListener('submit',e=>e.preventDefault());
  form.addEventListener('input',handleChange);form.addEventListener('change',handleChange);
  document.querySelectorAll('[data-step]').forEach(b=>b.addEventListener('click',()=>showStep(Number(b.dataset.step),true)));
  document.querySelectorAll('[data-process-select]').forEach(button=>button.addEventListener('click',()=>{for(const p of E.processes)form.elements[p.key].checked=button.dataset.processSelect==='all';handleChange();}));
  document.querySelectorAll('[data-area]').forEach(b=>b.addEventListener('click',()=>{$('area').value=b.dataset.area;handleChange();}));
  document.querySelectorAll('[data-adjust]').forEach(b=>b.addEventListener('click',()=>{
    if(b.closest('fieldset:disabled'))return;
    const [name,delta]=b.dataset.adjust.split(':'),el=form.elements[name];el.value=Math.min(Number(el.max),Math.max(Number(el.min),Number(el.value||0)+Number(delta)));handleChange();
  }));
  $('previousStep').addEventListener('click',()=>showStep(step-1,true));
  $('nextStep').addEventListener('click',()=>step<3?showStep(step+1,true):confirmEstimate());
  $('mobileSummary').addEventListener('click',()=>hasResult?focusSummary():showStep(3,true));
  $('resetEstimate').addEventListener('click',()=>{form.reset();Object.assign(state,E.defaults);invalidate(false);formView();showStep(0,false);toast('기본 조건으로 돌아왔습니다.');});
  $('estimateContact').addEventListener('click',()=>{
    if(!hasResult)return;
    try{sessionStorage.setItem('sotong-estimate-handoff',JSON.stringify({version:1,time:Date.now(),message:summaryText()}));location.href='index.html?estimate=1#contact';}
    catch(_){toast('상담 내역을 전달하지 못했습니다. 홈페이지의 무료 상담을 이용해주세요.');}
  });
  formView();invalidate(false);
})();

// Close the mobile navigation after choosing a link or leaving the menu.
(function(){
  const menu=document.querySelector('.sotong-mobile-menu');if(!menu)return;
  menu.addEventListener('click',event=>{if(event.target.closest('a'))menu.open=false;});
  document.addEventListener('click',event=>{if(!menu.contains(event.target))menu.open=false;});
  document.addEventListener('keydown',event=>{if(event.key==='Escape'&&menu.open){menu.open=false;menu.querySelector('summary').focus();}});
})();
