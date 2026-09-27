(() => {
  const detailPanel = document.getElementById('detailPanel');
  const detailTitle = document.getElementById('detailTitle');
  const detailLead = document.getElementById('detailLead');
  const detailNote = document.getElementById('detailNote');
  const detailMeta = document.getElementById('detailMeta');
  const detailSource = document.getElementById('detailSource');
  const wayfinding = document.getElementById('wayfinding');
  const uiShell = document.querySelector('.ui-shell');

  function markInterfacePointer(event) {
    if (!event.target.closest('.ui-shell')) return;
    window.__starChartUiPointer = true;
    window.setTimeout(() => { window.__starChartUiPointer = false; }, 400);
  }

  ['pointerdown', 'mousedown', 'touchstart', 'pointerup', 'mouseup', 'touchend', 'click'].forEach((eventName) => {
    document.addEventListener(eventName, markInterfacePointer, true);
  });

  ['pointerdown', 'mousedown', 'touchstart', 'click'].forEach((eventName) => {
    uiShell.addEventListener(eventName, (event) => event.stopPropagation());
  });

  function select(group) {
    const hasSelection = Boolean(group);
    detailPanel.classList.toggle('is-visible', hasSelection);
    detailPanel.setAttribute('aria-hidden', String(!hasSelection));
    wayfinding.classList.toggle('is-dismissed', hasSelection);
    document.body.classList.toggle('has-detail', hasSelection);

    if (!hasSelection) return;

    detailTitle.textContent = group.name;
    detailLead.textContent = group.note || '古人以此星官象天上秩序，各有所司。';
    detailNote.textContent = group.detail || '古籍所载星官各有职掌，今据传统星官文献作简要整理。';
    detailMeta.textContent = `星官 ${String(group.i + 1).padStart(2, '0')} / 29`;
    detailSource.textContent = group.source || '据《晋书·天文志》整理';
  }

  window.starChartUI = { select };
})();
