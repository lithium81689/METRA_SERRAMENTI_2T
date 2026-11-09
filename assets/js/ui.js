function showToast(msg){
  const t = document.getElementById('toast');
  t.textContent = msg;
  t.classList.add('show');
  setTimeout(()=>t.classList.remove('show'), 2200);
}

/* ============================================================
   MODAL CONTROL
   ============================================================ */
function openModal(id){ document.getElementById(id).classList.add('show'); }
function closeModal(id){ document.getElementById(id).classList.remove('show'); }

/* ---- CONFIRM ---- */
let confirmAction = null;
function showConfirm(text, onConfirm){
  document.getElementById('confirmText').textContent = text;
  confirmAction = onConfirm;
  openModal('confirmOverlay');
}
document.getElementById('btnConfirmDelete').addEventListener('click', ()=>{
  if (confirmAction) confirmAction();
  confirmAction = null;
  closeModal('confirmOverlay');
});
