/* ---- MEASUREMENT ---- */
let editingMeasureId = null;

function populateRoomSelect(selectedRoomId){
  const client = getClient(state.selectedClientId);
  const sel = document.getElementById('mRoom');
  sel.innerHTML = client.rooms.map(r=>`<option value="${r.id}">${escapeHtml(r.nome)}</option>`).join('')
    + `<option value="__new__">+ Nuova stanza…</option>`;
  if (selectedRoomId) sel.value = selectedRoomId;
  onRoomSelectChange();
}

function onRoomSelectChange(){
  const sel = document.getElementById('mRoom');
  const newInput = document.getElementById('mNewRoomName');
  newInput.style.display = sel.value==='__new__' ? 'block' : 'none';
  if (sel.value==='__new__') setTimeout(()=>newInput.focus(), 30);
}

function setApertura(val){
  state.currentApertura = val;
  document.querySelectorAll('#mAperturaField .seg-btn').forEach(b=>{
    b.classList.toggle('active', b.dataset.val===val);
  });
}

function toggleCassonettoDetails(){
  const checked = document.getElementById('mCassonettoPresente').checked;
  document.getElementById('mCassonettoDetails').style.display = checked ? 'block' : 'none';
}

function onMeasureTypeChange(){
  const tipo = document.getElementById('mType').value;
  const field = document.getElementById('mAperturaField');
  const hint = document.getElementById('mAperturaHint');
  const anteField = document.getElementById('mAnteField');
  const cassWrap = document.getElementById('mCassonettoWrap');
  const balconeFields = document.getElementById('mBalconeFields');
  const zanzarieraFields = document.getElementById('mZanzarieraFields');
  const tendaFields = document.getElementById('mTendaFields');
  const tipoMisuraField = document.getElementById('mTipoMisuraField');
  const misuraLuceField = document.getElementById('mMisuraLuceField');

  anteField.style.display = tipo==='finestra' ? 'block' : 'none';
  cassWrap.style.display = tipo==='finestra' ? 'block' : 'none';
  balconeFields.style.display = tipo==='balcone' ? 'block' : 'none';
  zanzarieraFields.style.display = tipo==='zanzariera' ? 'block' : 'none';
  tendaFields.style.display = tipo==='tenda_oscurante' ? 'block' : 'none';
  tipoMisuraField.style.display = tipo==='serranda' ? 'none' : 'block';
  misuraLuceField.style.display = tipo==='serranda' ? 'block' : 'none';

  if (!usesApertura(tipo)){
    field.style.display = 'none';
    setApertura('');
  } else {
    field.style.display = 'block';
    if (tipo==='porta'){
      hint.textContent = "Vista entrando nella stanza (verso di apertura a spinta).";
    } else {
      hint.textContent = "Vista dall'interno della stanza. Il disegno usa |>| per apertura sinistra e |<| per apertura destra.";
    }
  }

  if (tipo!=='finestra'){
    document.getElementById('mCassonettoPresente').checked = false;
  }
  toggleCassonettoDetails();
}

function openMeasureModal(presetTipo, measureId){
  const client = getClient(state.selectedClientId);
  const m = measureId ? client.measurements.find(x=>x.id===measureId) : null;
  editingMeasureId = m ? m.id : null;

  document.getElementById('measureModalTitle').textContent = m ? 'Modifica misurazione' : 'Nuova misurazione';
  document.getElementById('mType').value = m ? m.tipo : (presetTipo || 'finestra');
  document.getElementById('mWidth').value = m ? m.larghezza : '';
  document.getElementById('mHeight').value = m ? m.altezza : '';
  document.getElementById('mDepth').value = m ? (m.profondita || '') : '';
  document.getElementById('mQuantity').value = m ? quantityVal(m) : 1;
  document.getElementById('mNumeroAnte').value = m && m.numeroAnte ? String(m.numeroAnte) : '1';
  document.getElementById('mBalconeElemento').value = m && m.balconeElemento ? m.balconeElemento : 'finestra';
  document.getElementById('mBalconeTipologia').value = m && m.balconeTipologia ? m.balconeTipologia : 'Vicentina';
  document.getElementById('mZanzarieraTipo').value = m && m.zanzarieraTipo ? m.zanzarieraTipo : 'verticale';
  document.getElementById('mCavoPosizione').value = m && m.cavoPosizione ? m.cavoPosizione : '';
  document.querySelectorAll('input[name="mTipoMisura"]').forEach(input=>{
    input.checked = !!(m && m.tipoMisura===input.value);
  });
  document.getElementById('mMisuraLuce').checked = !!(m && m.misuraLuce);
  document.getElementById('mNotes').value = m ? (m.note||'') : '';
  document.getElementById('mNewRoomName').value = '';

  const cass = m && m.cassonetto ? m.cassonetto : null;
  document.getElementById('mCassonettoPresente').checked = !!(cass && cass.presente);
  document.getElementById('mCassWidth').value = cass && cass.larghezza ? cass.larghezza : '';
  document.getElementById('mCassHeight').value = cass && cass.altezza ? cass.altezza : '';
  document.getElementById('mCassDepth').value = cass && cass.profondita ? cass.profondita : '';
  document.getElementById('mCassNotes').value = cass ? (cass.note||'') : '';

  if (client.rooms.length===0){
    // forza la creazione di una stanza al volo
    populateRoomSelect(null);
    document.getElementById('mRoom').value = '__new__';
    onRoomSelectChange();
  } else {
    populateRoomSelect(m ? m.roomId : client.rooms[0].id);
  }

  setApertura(m ? (m.apertura||'') : '');
  onMeasureTypeChange();
  openModal('measureOverlay');
}

document.getElementById('btnSaveMeasure').addEventListener('click', ()=>{
  const larghezza = document.getElementById('mWidth').value;
  const altezza = document.getElementById('mHeight').value;
  const quantita = parseInt(document.getElementById('mQuantity').value, 10);
  const tipo = document.getElementById('mType').value;
  const tipoMisuraInput = document.querySelector('input[name="mTipoMisura"]:checked');
  if (larghezza==='' || altezza===''){
    showToast('Larghezza e altezza sono obbligatorie');
    return;
  }
  if (!quantita || quantita < 1){
    showToast('La quantità deve essere almeno 1');
    document.getElementById('mQuantity').focus();
    return;
  }
  if (tipo!=='serranda' && !tipoMisuraInput){
    showToast('Seleziona Misura Piena oppure Misura Da Fare');
    document.getElementById('mMisuraPiena').focus();
    return;
  }
  const client = getClient(state.selectedClientId);
  let roomId = document.getElementById('mRoom').value;

  if (roomId==='__new__'){
    const newName = document.getElementById('mNewRoomName').value.trim();
    if (!newName){ showToast('Indica il nome della nuova stanza'); document.getElementById('mNewRoomName').focus(); return; }
    const newRoom = { id: uid(), nome: newName };
    client.rooms.push(newRoom);
    roomId = newRoom.id;
  }

  const cassonettoPresente = tipo==='finestra' && document.getElementById('mCassonettoPresente').checked;
  const data = {
    tipo,
    roomId,
    larghezza: parseFloat(larghezza),
    altezza: parseFloat(altezza),
    profondita: readOptionalNumber('mDepth'),
    quantita,
    numeroAnte: tipo==='finestra' ? parseInt(document.getElementById('mNumeroAnte').value, 10) : null,
    apertura: usesApertura(tipo) ? state.currentApertura : '',
    balconeElemento: tipo==='balcone' ? document.getElementById('mBalconeElemento').value : null,
    balconeTipologia: tipo==='balcone' ? document.getElementById('mBalconeTipologia').value : null,
    zanzarieraTipo: tipo==='zanzariera' ? document.getElementById('mZanzarieraTipo').value : null,
    cavoPosizione: tipo==='tenda_oscurante' ? document.getElementById('mCavoPosizione').value : null,
    tipoMisura: tipo==='serranda' ? null : tipoMisuraInput.value,
    misuraLuce: tipo==='serranda' && document.getElementById('mMisuraLuce').checked,
    cassonetto: cassonettoPresente ? {
      presente: true,
      larghezza: readOptionalNumber('mCassWidth'),
      altezza: readOptionalNumber('mCassHeight'),
      profondita: readOptionalNumber('mCassDepth'),
      note: document.getElementById('mCassNotes').value.trim()
    } : { presente: false },
    note: document.getElementById('mNotes').value.trim()
  };

  if (editingMeasureId){
    const m = client.measurements.find(x=>x.id===editingMeasureId);
    Object.assign(m, data);
  } else {
    client.measurements.push({ id: uid(), createdAt: Date.now(), ...data });
  }

  state.selectedCategory = tipo;
  saveData();
  renderAll();
  closeModal('measureOverlay');
  showToast('Misurazione salvata');
});

function duplicateMeasure(measureId){
  const client = getClient(state.selectedClientId);
  const idx = client.measurements.findIndex(m=>m.id===measureId);
  if (idx===-1) return;
  const copy = JSON.parse(JSON.stringify(client.measurements[idx]));
  copy.id = uid();
  copy.createdAt = Date.now();
  client.measurements.splice(idx+1, 0, copy);
  state.selectedCategory = copy.tipo;
  saveData();
  renderAll();
  showToast('Misurazione duplicata');
}

function askDeleteMeasure(measureId){
  showConfirm('Eliminare questa misurazione?', ()=>{
    const client = getClient(state.selectedClientId);
    client.measurements = client.measurements.filter(m=>m.id!==measureId);
    saveData();
    renderAll();
    showToast('Misurazione eliminata');
  });
}
