/* ============================================================
   STATO & PERSISTENZA (localStorage — funziona solo fuori
   dall'anteprima Claude.ai, una volta scaricato/ospitato il file)
   ============================================================ */
const STORAGE_KEY = 'infissi-app-clients-v2';
let storageAvailable = true;

let state = {
  clients: [],
  selectedClientId: null,
  selectedCategory: null, // categoria selezionata oppure null
  search: '',
  currentApertura: ''
};

const TYPE_META = {
  finestra:         { label:'Serramento',       plural:'Serramenti',       color:'#2E5C8A' },
  porta:            { label:'Porta',            plural:'Porte',            color:'#5B6B7A' },
  balcone:          { label:'Balcone',          plural:'Balconi',          color:'#C1793C' },
  serranda:         { label:'Avvolgibile',      plural:'Avvolgibili',      color:'#4C7A5E' },
  zanzariera:       { label:'Zanzariera',       plural:'Zanzariere',       color:'#7A6B4C' },
  tenda_oscurante:  { label:'Tenda oscurante',  plural:'Tende Oscuranti',  color:'#6D5877' }
};
const CATEGORY_ORDER = ['porta','finestra','balcone','serranda','zanzariera','tenda_oscurante'];

const CATEGORY_ICONS = {
  porta: `<svg width="30" height="30" viewBox="0 0 30 30" fill="none"><rect x="7" y="3" width="16" height="24" rx="1" stroke="currentColor" stroke-width="1.6"/><circle cx="19.5" cy="15" r="1.1" fill="currentColor"/></svg>`,
  finestra: `<svg width="30" height="30" viewBox="0 0 30 30" fill="none"><rect x="4" y="4" width="22" height="22" rx="1" stroke="currentColor" stroke-width="1.6"/><path d="M15 4V26M4 15H26" stroke="currentColor" stroke-width="1.3"/></svg>`,
  balcone: `<svg width="30" height="30" viewBox="0 0 30 30" fill="none"><rect x="5" y="3" width="20" height="24" rx="1" stroke="currentColor" stroke-width="1.6"/><path d="M15 3V27" stroke="currentColor" stroke-width="1.3"/><circle cx="12" cy="15" r="1" fill="currentColor"/><circle cx="18" cy="15" r="1" fill="currentColor"/></svg>`,
  serranda: `<svg width="30" height="30" viewBox="0 0 30 30" fill="none"><rect x="5" y="5" width="20" height="20" rx="1" stroke="currentColor" stroke-width="1.6"/><path d="M5 10H25M5 15H25M5 20H25" stroke="currentColor" stroke-width="1.2"/></svg>`,
  zanzariera: `<svg width="30" height="30" viewBox="0 0 30 30" fill="none"><rect x="4" y="5" width="22" height="20" rx="1" stroke="currentColor" stroke-width="1.6"/><path d="M8 5V25M12 5V25M16 5V25M20 5V25M24 5V25M4 10H26M4 15H26M4 20H26" stroke="currentColor" stroke-width=".75" opacity=".7"/></svg>`,
  tenda_oscurante: `<svg width="30" height="30" viewBox="0 0 30 30" fill="none"><rect x="5" y="5" width="20" height="20" rx="1" stroke="currentColor" stroke-width="1.6"/><path d="M9 5V25M13 5V25M17 5V25M21 5V25" stroke="currentColor" stroke-width="1" opacity=".75"/><path d="M24 7V23" stroke="currentColor" stroke-width="1.4" stroke-linecap="round"/></svg>`
};

function getClient(id){ return state.clients.find(c=>c.id===id); }
