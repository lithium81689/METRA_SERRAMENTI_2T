/* ---- ROOM ---- */
let editingRoomId = null;
function openRoomModal(roomId){
  editingRoomId = roomId || null;
  const client = getClient(state.selectedClientId);
  const room = roomId ? client.rooms.find(r=>r.id===roomId) : null;
  document.getElementById('roomModalTitle').textContent = room ? 'Rinomina stanza' : 'Nuova stanza';
  document.getElementById('rName').value = room ? room.nome : '';
  openModal('roomOverlay');
  setTimeout(()=>document.getElementById('rName').focus(), 50);
}

document.getElementById('btnSaveRoom').addEventListener('click', ()=>{
  const nome = document.getElementById('rName').value.trim();
  if (!nome){ showToast('Il nome della stanza è obbligatorio'); document.getElementById('rName').focus(); return; }
  const client = getClient(state.selectedClientId);
  if (editingRoomId){
    const room = client.rooms.find(r=>r.id===editingRoomId);
    room.nome = nome;
  } else {
    const newRoom = { id: uid(), nome };
    client.rooms.push(newRoom);
  }
  saveData();
  renderAll();
  closeModal('roomOverlay');
  showToast('Stanza salvata');
});

function askDeleteRoom(roomId){
  const client = getClient(state.selectedClientId);
  const room = client.rooms.find(r=>r.id===roomId);
  const nMeas = client.measurements.filter(m=>m.roomId===roomId).length;
  const warn = nMeas>0 ? ` Verranno eliminate anche ${nMeas} misurazioni associate.` : '';
  showConfirm(`Eliminare la stanza "${room.nome}"?${warn}`, ()=>{
    client.rooms = client.rooms.filter(r=>r.id!==roomId);
    client.measurements = client.measurements.filter(m=>m.roomId!==roomId);
    saveData();
    renderAll();
    showToast('Stanza eliminata');
  });
}
