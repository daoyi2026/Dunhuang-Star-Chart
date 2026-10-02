(() => {
  const detailPanel = document.getElementById('detailPanel');
  const detailTitle = document.getElementById('detailTitle');
  const detailGlyph = document.getElementById('detailGlyph');
  const detailLead = document.getElementById('detailLead');
  const detailNote = document.getElementById('detailNote');
  const detailMeta = document.getElementById('detailMeta');
  const detailSource = document.getElementById('detailSource');
  const detailClose = document.getElementById('detailClose');
  const wayfinding = document.getElementById('wayfinding');
  const uiShell = document.querySelector('.ui-shell');

  const motifLabels = {
    '紫微':'宫阙','紫微垣':'宫阙','北斗':'帝车','华盖':'华盖','天厨':'膳府',
    '传舍':'驿馆','天柱':'天柱','文昌':'文册','三师':'辅弼','太尊':'尊位',
    '天牢':'禁垣','内阶':'阶陛','天床':'寝座','八谷':'禾黍','天理':'法度',
    '六甲':'甲历','勾陈':'宿卫','北极':'天枢','天皇':'帝座','五帝':'五方',
    '尚书':'诏书','女史':'记事','柱史':'史册','御女':'内廷','天枪':'兵卫',
    '玄戈':'兵卫','三公':'辅弼','相':'宰辅'
  };

  const shorten = (text, max = 168) => {
    const value = (text || '').replace(/s+/g, ' ').trim();
    return value.length > max ? value.slice(0, max).replace(/[，、；：]$/,'') + '……' : value;
  };

  function markInterfacePointer(event) {
    if (!event.target.closest('.ui-shell')) return;
    window.__starChartUiPointer = true;
    window.setTimeout(() => { window.__starChartUiPointer = false; }, 420);
  }

  ['pointerdown','mousedown','touchstart','pointerup','mouseup','touchend','click'].forEach((eventName) => {
    document.addEventListener(eventName, markInterfacePointer, true);
  });

  ['pointerdown','mousedown','touchstart','click'].forEach((eventName) => {
    uiShell.addEventListener(eventName, (event) => event.stopPropagation());
  });

  detailClose.addEventListener('click', () => {
    if (typeof window.starChartSetChosen === 'function') window.starChartSetChosen(-1);
  });

  function select(group) {
    const hasSelection = Boolean(group);
    detailPanel.classList.toggle('is-visible', hasSelection);
    detailPanel.setAttribute('aria-hidden', String(!hasSelection));
    wayfinding.classList.toggle('is-dismissed', hasSelection);
    document.body.classList.toggle('has-detail', hasSelection);

    if (!hasSelection) return;

    detailGlyph.textContent = motifLabels[group.name] || '星象';
    detailTitle.textContent = group.name;
    detailLead.textContent = group.note || '古人以星官命名天象，也把人间秩序与生活投射到夜空。';
    detailNote.textContent = shorten(group.detail, window.innerWidth < 760 ? 110 : 188);
    detailMeta.textContent = `星官 ${String(group.i + 1).padStart(2, '0')} / 29`;
    detailSource.textContent = group.source || '据古代天文文献整理';
  }

  window.starChartUI = { select };
})();
