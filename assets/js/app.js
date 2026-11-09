/* ============================================================
   ICONA APP (generata via canvas, nessun asset esterno)
   ============================================================ */
function generateAppIcon(){
  const canvas = document.createElement('canvas');
  canvas.width = 180; canvas.height = 180;
  const ctx = canvas.getContext('2d');
  ctx.fillStyle = '#F6F4EE'; ctx.fillRect(0,0,180,180);
  ctx.strokeStyle = '#2E5C8A'; ctx.lineWidth = 9;
  ctx.strokeRect(28,28,124,124);
  ctx.lineWidth = 4;
  ctx.beginPath();
  ctx.moveTo(28,90); ctx.lineTo(152,90);
  ctx.moveTo(90,28); ctx.lineTo(90,152);
  ctx.stroke();
  ctx.strokeStyle = '#C1793C'; ctx.lineWidth = 6; ctx.lineCap='round';
  ctx.beginPath();
  ctx.moveTo(12,50); ctx.lineTo(12,18); ctx.lineTo(44,18);
  ctx.stroke();
  return canvas.toDataURL('image/png');
}
function setupIcons(){
  try{
    const url = generateAppIcon();
    document.getElementById('appleIconLink').setAttribute('href', url);
    document.getElementById('faviconLink').setAttribute('href', url);
  }catch(e){ /* non bloccante */ }
}

/* ============================================================
   EVENTS
   ============================================================ */
document.getElementById('btnNewClient').addEventListener('click', ()=>openClientModal());
document.getElementById('searchInput').addEventListener('input', (e)=>{
  state.search = e.target.value;
  renderClientList();
});

function setupResizableSidebar(){
  const sidebar = document.querySelector('.sidebar');
  const handle = document.getElementById('sidebarResizer');
  if (!sidebar || !handle) return;

  const savedWidth = parseInt(localStorage.getItem('infissi-sidebar-width') || '', 10);
  if (savedWidth && window.innerWidth > 820){
    sidebar.style.width = Math.min(Math.max(savedWidth, 300), 620) + 'px';
  }

  let startX = 0;
  let startWidth = 0;

  function onPointerMove(e){
    const nextWidth = Math.min(Math.max(startWidth + (e.clientX - startX), 300), 620);
    sidebar.style.width = nextWidth + 'px';
  }

  function onPointerUp(){
    handle.classList.remove('dragging');
    document.body.style.userSelect = '';
    document.body.style.cursor = '';
    const finalWidth = parseInt(sidebar.getBoundingClientRect().width, 10);
    if (window.innerWidth > 820){
      localStorage.setItem('infissi-sidebar-width', String(finalWidth));
    }
    window.removeEventListener('pointermove', onPointerMove);
    window.removeEventListener('pointerup', onPointerUp);
  }

  handle.addEventListener('pointerdown', (e)=>{
    if (window.innerWidth <= 820) return;
    startX = e.clientX;
    startWidth = sidebar.getBoundingClientRect().width;
    handle.classList.add('dragging');
    document.body.style.userSelect = 'none';
    document.body.style.cursor = 'col-resize';
    window.addEventListener('pointermove', onPointerMove);
    window.addEventListener('pointerup', onPointerUp);
  });
}

document.querySelectorAll('.overlay').forEach(ov=>{
  ov.addEventListener('click', (e)=>{ if (e.target===ov) closeModal(ov.id); });
});
document.addEventListener('keydown', (e)=>{
  if (e.key==='Escape'){
    document.querySelectorAll('.overlay.show').forEach(ov=>closeModal(ov.id));
  }
});

/* ============================================================
   INIT
   ============================================================ */
setupIcons();
setupResizableSidebar();
loadData();
