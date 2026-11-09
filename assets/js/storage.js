function loadData(){
  try{
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw){
      const parsed = JSON.parse(raw);
      state.clients = parsed.clients || [];
    }
  }catch(e){
    storageAvailable = false;
    console.error('Storage non disponibile:', e);
    showToast('Salvataggio locale non disponibile in questo contesto');
  }
  renderAll();
}

function saveData(){
  try{
    localStorage.setItem(STORAGE_KEY, JSON.stringify({clients: state.clients}));
  }catch(e){
    storageAvailable = false;
    console.error('Errore salvataggio locale:', e);
    showToast('Impossibile salvare in locale (spazio esaurito o accesso bloccato)');
  }
}
