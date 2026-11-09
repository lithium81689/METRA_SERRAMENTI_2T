/* ---- CLIENT ---- */
let editingClientId = null;
function openClientModal(id){
  editingClientId = id || null;
  const c = id ? getClient(id) : null;
  document.getElementById('clientModalTitle').textContent = c ? 'Modifica cliente' : 'Nuovo cliente';
  document.getElementById('cName').value = c ? c.nome : '';
  document.getElementById('cDate').value = c ? (c.data||'') : '';
  document.getElementById('cPhone').value = c ? (c.telefono||'') : '';
  document.getElementById('cEmail').value = c ? (c.email||'') : '';
  document.getElementById('cNotes').value = c ? (c.note||'') : '';
  openModal('clientOverlay');
  setTimeout(()=>document.getElementById('cName').focus(), 50);
}

document.getElementById('btnSaveClient').addEventListener('click', ()=>{
  const nome = document.getElementById('cName').value.trim();
  if (!nome){ showToast('Il nome del cliente è obbligatorio'); document.getElementById('cName').focus(); return; }
  const data = {
    nome,
    data: document.getElementById('cDate').value,
    telefono: document.getElementById('cPhone').value.trim(),
    email: document.getElementById('cEmail').value.trim(),
    note: document.getElementById('cNotes').value.trim()
  };
  if (editingClientId){
    const c = getClient(editingClientId);
    Object.assign(c, data);
  } else {
    const newClient = {
      id: uid(),
      ...data,
      createdAt: Date.now(),
      rooms: [],
      measurements: []
    };
    state.clients.push(newClient);
    state.selectedClientId = newClient.id;
    state.selectedCategory = null;
  }
  saveData();
  renderAll();
  closeModal('clientOverlay');
  showToast('Cliente salvato');
});

function selectClient(id){
  state.selectedClientId = id;
  state.selectedCategory = null;
  renderAll();
}

function askDeleteClient(id){
  const c = getClient(id);
  showConfirm(`Eliminare il cliente "${c.nome}" e tutte le stanze/misurazioni collegate?`, ()=>{
    state.clients = state.clients.filter(cl=>cl.id!==id);
    if (state.selectedClientId===id){ state.selectedClientId = null; state.selectedCategory = null; }
    saveData();
    renderAll();
    showToast('Cliente eliminato');
  });
}
