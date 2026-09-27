(() => {
  const panel = document.getElementById('detailPanel');
  const title = document.getElementById('detailTitle');
  const roman = document.getElementById('detailRoman');
  const glyph = document.getElementById('detailGlyph');
  const lead = document.getElementById('detailLead');
  const note = document.getElementById('detailNote');
  const meta = document.getElementById('detailMeta');
  const source = document.getElementById('detailSource');
  const close = document.getElementById('detailClose');
  const wayfinding = document.getElementById('wayfinding');
  const shell = document.querySelector('.ui-shell');

  const labels = {'紫微':'帝居之象','北斗':'帝车之象','天棓':'宿卫之象','华盖':'仪盖之象','天厨':'膳府之象','传舍':'驿馆之象','天柱':'支天之象','文昌':'文府之象','三师':'辅弼之象','太尊':'尊位之象','天牢':'禁垣之象','内阶':'阶陛之象','天床':'寝居之象','八谷':'禾黍之象','天理':'法度之象','六甲':'历序之象','勾陈':'宿卫之象','北极':'天枢之象','天皇':'帝座之象','五帝':'五方之象','尚书':'诏令之象','女史':'内记之象','柱史':'史册之象','御女':'内廷之象','天枪':'兵卫之象','玄戈':'兵戈之象','三公':'辅政之象','相':'宰辅之象','紫微垣':'宫城之象'};
  const romans = {'紫微垣':'PURPLE FORBIDDEN ENCLOSURE','北斗':'NORTHERN DIPPER','文昌':'WENCHANG','华盖':'IMPERIAL CANOPY','紫微':'PURPLE PALACE'};
  function markInterfacePointer(event){if(!event.target.closest('.ui-shell')) return;window.__starChartUiPointer=true;window.setTimeout(()=>{window.__starChartUiPointer=false;},420)}
  ['pointerdown','mousedown','touchstart','pointerup','mouseup','touchend','click'].forEach(name=>document.addEventListener(name,markInterfacePointer,true));
  ['pointerdown','mousedown','touchstart','click'].forEach(name=>shell.addEventListener(name,e=>e.stopPropagation()));
  close.addEventListener('click',()=>window.starChartSetChosen?.(-1));
  function select(group){
    const on=Boolean(group);
    panel.classList.toggle('is-visible',on);panel.setAttribute('aria-hidden',String(!on));wayfinding.classList.toggle('is-dismissed',on);document.body.classList.toggle('has-detail',on);
    const isZiwei=on&&group.name==='紫微垣';
    document.body.classList.toggle('is-ziwei',isZiwei);
    if(!on) return;
    title.textContent=group.name;roman.textContent=romans[group.name] || 'DUNHUANG STAR OFFICER';glyph.textContent=labels[group.name] || '星象之意';
    lead.textContent=group.note || '古人以星官组织夜空，也把人间秩序、器物与想象投射到天上。';
    note.textContent=group.detail || '星位与星名共同构成一套古代观天语言。点与线在此不只是坐标，也被理解为可见的天上形制。';
    meta.textContent='星官 '+String(group.i+1).padStart(2,'0')+' / 29';source.textContent=group.source || '据古代天文文献整理';
  }
  window.starChartUI={select};
})();
