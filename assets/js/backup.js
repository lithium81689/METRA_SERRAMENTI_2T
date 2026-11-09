/* ============================================================
   BACKUP EXPORT / IMPORT
   ============================================================ */
document.getElementById('btnExport').addEventListener('click', ()=>{
  const blob = new Blob([JSON.stringify({clients: state.clients}, null, 2)], {type:'application/json'});
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'backup-misurazioni-' + new Date().toISOString().slice(0,10) + '.json';
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
  showToast('Backup scaricato');
});

document.getElementById('btnImport').addEventListener('click', ()=>{
  document.getElementById('importFile').click();
});
document.getElementById('importFile').addEventListener('change', (e)=>{
  const file = e.target.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = (ev)=>{
    try{
      const parsed = JSON.parse(ev.target.result);
      if (!parsed || !Array.isArray(parsed.clients)) throw new Error('formato non valido');
      showConfirm(`Importare ${parsed.clients.length} client${parsed.clients.length===1?'e':'i'}? I dati attuali verranno sostituiti.`, ()=>{
        state.clients = parsed.clients;
        state.selectedClientId = null;
        state.selectedCategory = null;
        saveData();
        renderAll();
        showToast('Backup importato correttamente');
      });
    }catch(err){
      showToast('File di backup non valido');
    }
  };
  reader.readAsText(file);
  e.target.value = '';
});
