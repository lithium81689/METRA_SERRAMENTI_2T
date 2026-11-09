/* ============================================================
   RENDER: SIDEBAR
   ============================================================ */
function renderClientList(){
  const list = document.getElementById('clientList');
  const q = state.search.trim().toLowerCase();
  let clients = [...state.clients].sort((a,b)=> (b.createdAt||0) - (a.createdAt||0));
  if (q){
    clients = clients.filter(c => (c.nome||'').toLowerCase().includes(q));
  }
  if (clients.length===0){
    list.innerHTML = `<div class="empty-list">${state.clients.length===0
      ? 'Nessun cliente ancora.<br>Inizia aggiungendone uno.'
      : 'Nessun cliente trovato.'}</div>`;
    return;
  }
  list.innerHTML = clients.map(c=>{
    const nRooms = c.rooms.length;
    const nMeas = c.measurements.length;
    return `
      <div class="client-item ${c.id===state.selectedClientId?'active':''}" onclick="selectClient('${c.id}')">
        <p class="name">${escapeHtml(c.nome)}</p>
        <div class="meta">
          <span>${nRooms} stanz${nRooms===1?'a':'e'} · ${nMeas} misur.</span>
          <span>${fmtDate(c.data)}</span>
        </div>
      </div>`;
  }).join('');
}

/* ============================================================
   RENDER: MAIN AREA
   ============================================================ */
function renderMain(){
  const main = document.getElementById('mainArea');
  const client = getClient(state.selectedClientId);
  if (!client){
    main.innerHTML = `
      <div class="main-empty">
        <svg width="64" height="64" viewBox="0 0 64 64" fill="none">
          <rect x="10" y="8" width="44" height="48" rx="2" stroke="#8B96A3" stroke-width="1.6"/>
          <path d="M10 24H54M28 8V56" stroke="#8B96A3" stroke-width="1.2"/>
          <path d="M17 16H21M17 12V16" stroke="#C1793C" stroke-width="1.3" stroke-linecap="round"/>
        </svg>
        <h2>Nessun cliente selezionato</h2>
        <p>Seleziona un cliente dall'elenco a sinistra, oppure creane uno nuovo per iniziare a registrare le misurazioni.</p>
      </div>`;
    return;
  }

  const header = renderClientHeader(client);

  if (state.selectedCategory){
    main.innerHTML = header + renderCategoryDetail(client, state.selectedCategory);
  } else {
    main.innerHTML = header + renderClientOverview(client);
  }
}

function renderClientHeader(client){
  return `
    <div class="client-header">
      <div>
        <span class="badge-tag">Cliente</span>
        <h2>${escapeHtml(client.nome)}</h2>
        <div class="client-info-grid">
          <div class="info-field"><div class="lbl">Data sopralluogo</div><div class="val ${!client.data?'empty':''}">${client.data?fmtDate(client.data):'non indicata'}</div></div>
          <div class="info-field"><div class="lbl">Telefono</div><div class="val ${!client.telefono?'empty':''}">${client.telefono?escapeHtml(client.telefono):'non indicato'}</div></div>
          <div class="info-field"><div class="lbl">Email</div><div class="val ${!client.email?'empty':''}">${client.email?escapeHtml(client.email):'non indicata'}</div></div>
          ${client.note?`<div class="info-field" style="grid-column:1/-1;"><div class="lbl">Note</div><div class="val">${escapeHtml(client.note)}</div></div>`:''}
        </div>
      </div>
      <div class="client-header-actions">
        <button class="icon-btn" onclick="openClientModal('${client.id}')" title="Modifica cliente">
          <svg width="17" height="17" viewBox="0 0 17 17" fill="none"><path d="M11.5 2.5L14.5 5.5L6 14H3V11L11.5 2.5Z" stroke="currentColor" stroke-width="1.3" stroke-linejoin="round"/></svg>
        </button>
        <button class="icon-btn danger" onclick="askDeleteClient('${client.id}')" title="Elimina cliente">
          <svg width="17" height="17" viewBox="0 0 17 17" fill="none"><path d="M3 5H14M6.5 5V3.5H10.5V5M7 8V12M10 8V12M4.5 5L5 14H12L12.5 5" stroke="currentColor" stroke-width="1.3" stroke-linecap="round" stroke-linejoin="round"/></svg>
        </button>
        <button class="btn btn-ghost btn-sm" onclick="downloadClientPDF('${client.id}')" title="Genera un PDF completo con tutte le misurazioni">
          <svg width="13" height="13" viewBox="0 0 14 14" fill="none"><path d="M3 1.5H8.5L11 4V12.5H3V1.5Z" stroke="currentColor" stroke-width="1.2" stroke-linejoin="round"/><path d="M8.5 1.5V4H11" stroke="currentColor" stroke-width="1.2" stroke-linejoin="round"/></svg>
          PDF completo
        </button>
      </div>
    </div>
  `;
}

function renderClientOverview(client){
  const roomChips = client.rooms.map(r=>`
    <div class="room-chip">
      <span>${escapeHtml(r.nome)}</span>
      <div class="chip-actions">
        <button class="icon-btn" style="padding:2px" onclick="openRoomModal('${r.id}')" title="Rinomina">
          <svg width="12" height="12" viewBox="0 0 17 17" fill="none"><path d="M11.5 2.5L14.5 5.5L6 14H3V11L11.5 2.5Z" stroke="currentColor" stroke-width="1.3" stroke-linejoin="round"/></svg>
        </button>
        <button class="icon-btn danger" style="padding:2px" onclick="askDeleteRoom('${r.id}')" title="Elimina">
          <svg width="12" height="12" viewBox="0 0 17 17" fill="none"><path d="M3 5H14M6.5 5V3.5H10.5V5M7 8V12M10 8V12M4.5 5L5 14H12L12.5 5" stroke="currentColor" stroke-width="1.3" stroke-linecap="round" stroke-linejoin="round"/></svg>
        </button>
      </div>
    </div>
  `).join('');

  const catCards = CATEGORY_ORDER.map(tipo=>{
    const meta = TYPE_META[tipo];
    const count = client.measurements.filter(m=>m.tipo===tipo).length;
    return `
      <div class="category-card" style="--cat-color:${meta.color}" onclick="openCategory('${tipo}')">
        <div class="icon-wrap">${CATEGORY_ICONS[tipo]}</div>
        <h4>${meta.plural}</h4>
        <div class="cat-count">${count} misurazion${count===1?'e':'i'}</div>
      </div>
    `;
  }).join('');

  return `
    <div class="section-head">
      <h3>Stanze <span class="count">${client.rooms.length}</span></h3>
    </div>
    <div class="room-chips">
      ${roomChips}
      <button class="add-room-chip" onclick="openRoomModal()">+ Aggiungi stanza</button>
    </div>

    <div class="section-head">
      <h3>Misurazioni per categoria</h3>
      <button class="btn btn-copper btn-sm" onclick="openMeasureModal()">
        <svg width="12" height="12" viewBox="0 0 14 14" fill="none"><path d="M7 1V13M1 7H13" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/></svg>
        Nuova misurazione
      </button>
    </div>
    <div class="category-grid">${catCards}</div>

    <div class="section-head">
      <h3>PDF misurazioni</h3>
    </div>
    <div class="pdf-actions-grid">
      <button class="btn btn-ghost btn-sm" onclick="downloadClientPDF('${client.id}')">PDF completo</button>
      ${CATEGORY_ORDER.map(t=>`<button class="btn btn-ghost btn-sm" onclick="downloadClientPDF('${client.id}','${t}')">PDF ${TYPE_META[t].plural}</button>`).join('')}
    </div>
  `;
}

function renderCategoryDetail(client, tipo){
  const meta = TYPE_META[tipo];
  const measurements = client.measurements.filter(m=>m.tipo===tipo);
  const roomsById = {};
  client.rooms.forEach(r=>roomsById[r.id]=r.nome);

  return `
    <button class="back-link" onclick="closeCategory()">
      <svg width="13" height="13" viewBox="0 0 13 13" fill="none"><path d="M8.5 2L3.5 6.5L8.5 11" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/></svg>
      Tutte le categorie
    </button>
    <div class="section-head">
      <h3 style="color:${meta.color}">${meta.plural} <span class="count">${measurements.length}</span></h3>
      <div class="category-actions">
        <button class="btn btn-ghost btn-sm" onclick="downloadClientPDF('${client.id}','${tipo}')">
          <svg width="13" height="13" viewBox="0 0 14 14" fill="none"><path d="M3 1.5H8.5L11 4V12.5H3V1.5Z" stroke="currentColor" stroke-width="1.2" stroke-linejoin="round"/><path d="M8.5 1.5V4H11" stroke="currentColor" stroke-width="1.2" stroke-linejoin="round"/></svg>
          PDF ${meta.plural}
        </button>
        <button class="btn btn-copper btn-sm" onclick="openMeasureModal('${tipo}')">
          <svg width="12" height="12" viewBox="0 0 14 14" fill="none"><path d="M7 1V13M1 7H13" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/></svg>
          Aggiungi ${meta.label.toLowerCase()}
        </button>
      </div>
    </div>
    ${measurements.length===0
      ? `<div class="measure-empty">Nessuna misurazione di questo tipo registrata.</div>`
      : `<div class="measure-grid">${measurements.map(m=>renderMeasureCard(client, m, roomsById[m.roomId])).join('')}</div>`}
  `;
}

function renderMeasureCard(client, m, roomName){
  const meta = TYPE_META[m.tipo] || TYPE_META.finestra;
  const details = measureDetailsText(m);
  const cass = cassonettoText(m.cassonetto);
  const cassNote = m.cassonetto && m.cassonetto.note ? m.cassonetto.note : '';
  return `
    <div class="m-card">
      <div class="m-card-top">
        <span class="m-room-badge" title="${escapeHtml(roomName||'')}">${escapeHtml(roomName||'—')}</span>
        <div class="m-card-actions">
          <button class="icon-btn" style="padding:3px" onclick="duplicateMeasure('${m.id}')" title="Duplica misurazione">
            <svg width="13" height="13" viewBox="0 0 17 17" fill="none"><rect x="5" y="3" width="8" height="8" rx="1" stroke="currentColor" stroke-width="1.3"/><path d="M4 6H3.5C2.7 6 2 6.7 2 7.5V13.5C2 14.3 2.7 15 3.5 15H9.5C10.3 15 11 14.3 11 13.5V13" stroke="currentColor" stroke-width="1.3" stroke-linecap="round"/></svg>
          </button>
          <button class="icon-btn" style="padding:3px" onclick="openMeasureModal(null,'${m.id}')" title="Modifica">
            <svg width="13" height="13" viewBox="0 0 17 17" fill="none"><path d="M11.5 2.5L14.5 5.5L6 14H3V11L11.5 2.5Z" stroke="currentColor" stroke-width="1.3" stroke-linejoin="round"/></svg>
          </button>
          <button class="icon-btn danger" style="padding:3px" onclick="askDeleteMeasure('${m.id}')" title="Elimina">
            <svg width="13" height="13" viewBox="0 0 17 17" fill="none"><path d="M3 5H14M6.5 5V3.5H10.5V5M7 8V12M10 8V12M4.5 5L5 14H12L12.5 5" stroke="currentColor" stroke-width="1.3" stroke-linecap="round" stroke-linejoin="round"/></svg>
          </button>
        </div>
      </div>
      <div class="m-svg-wrap">${dimensionSVG(m.larghezza, m.altezza, meta.color, m.apertura, m.tipo)}</div>
      <div class="m-dims">
        <span><span class="dim-lbl">Q.tà</span><b>${quantityVal(m)}</b></span>
        <span><span class="dim-lbl">L</span><b>${fmtNum(m.larghezza)}</b> mm</span>
        <span><span class="dim-lbl">H</span><b>${fmtNum(m.altezza)}</b> mm</span>
        <span><span class="dim-lbl">P</span><b>${fmtNum(m.profondita)}</b> mm</span>
      </div>
      ${details ? `<div class="m-detail">${escapeHtml(details)}</div>` : ''}
      ${usesApertura(m.tipo) ? `<div class="m-apertura">Apertura: <b>${aperturaLabel(m.apertura)}</b></div>` : ''}
      ${cass ? `<div class="m-note"><b>Cassonetto:</b> ${escapeHtml(cass)}${cassNote ? `<br>${escapeHtml(cassNote)}` : ''}</div>` : ''}
      ${m.note ? `<div class="m-note">${escapeHtml(m.note)}</div>` : ''}
    </div>
  `;
}

/* schematic dimension drawing (signature element) */
function dimensionSVG(w, h, color, apertura, tipo){
  const wv = parseFloat(w) || 1;
  const hv = parseFloat(h) || 1;
  const maxW = 110, maxH = 76;
  const ratio = wv/hv;
  let rw, rh;
  if (ratio > maxW/maxH){ rw = maxW; rh = maxW/ratio; }
  else { rh = maxH; rw = maxH*ratio; }
  rw = Math.max(rw, 34); rh = Math.max(rh, 30);

  const padTop = 18, padLeft = 26;
  const totalW = padLeft + rw + 14;
  const totalH = padTop + rh + 8;
  const rx = padLeft, ry = padTop;
  let openingMark = '';

  if (tipo==='serranda'){
    const y1 = ry + rh*.25;
    const y2 = ry + rh*.50;
    const y3 = ry + rh*.75;
    openingMark = `
      <line x1="${rx+4}" y1="${y1}" x2="${rx+rw-4}" y2="${y1}" stroke="${color}" stroke-width=".8" opacity=".45"/>
      <line x1="${rx+4}" y1="${y2}" x2="${rx+rw-4}" y2="${y2}" stroke="${color}" stroke-width=".8" opacity=".45"/>
      <line x1="${rx+4}" y1="${y3}" x2="${rx+rw-4}" y2="${y3}" stroke="${color}" stroke-width=".8" opacity=".45"/>`;
  } else if (tipo==='zanzariera'){
    openingMark = `
      <line x1="${rx+rw*.25}" y1="${ry+4}" x2="${rx+rw*.25}" y2="${ry+rh-4}" stroke="${color}" stroke-width=".7" opacity=".45"/>
      <line x1="${rx+rw*.50}" y1="${ry+4}" x2="${rx+rw*.50}" y2="${ry+rh-4}" stroke="${color}" stroke-width=".7" opacity=".45"/>
      <line x1="${rx+rw*.75}" y1="${ry+4}" x2="${rx+rw*.75}" y2="${ry+rh-4}" stroke="${color}" stroke-width=".7" opacity=".45"/>
      <line x1="${rx+4}" y1="${ry+rh*.33}" x2="${rx+rw-4}" y2="${ry+rh*.33}" stroke="${color}" stroke-width=".7" opacity=".45"/>
      <line x1="${rx+4}" y1="${ry+rh*.66}" x2="${rx+rw-4}" y2="${ry+rh*.66}" stroke="${color}" stroke-width=".7" opacity=".45"/>`;
  } else if (tipo==='tenda_oscurante'){
    openingMark = `
      <line x1="${rx+rw*.25}" y1="${ry+3}" x2="${rx+rw*.25}" y2="${ry+rh-3}" stroke="${color}" stroke-width="1" opacity=".55"/>
      <line x1="${rx+rw*.50}" y1="${ry+3}" x2="${rx+rw*.50}" y2="${ry+rh-3}" stroke="${color}" stroke-width="1" opacity=".55"/>
      <line x1="${rx+rw*.75}" y1="${ry+3}" x2="${rx+rw*.75}" y2="${ry+rh-3}" stroke="${color}" stroke-width="1" opacity=".55"/>`;
  } else if (apertura==='sinistra'){
    // Richiesto: apertura sinistra = |>|, bordi verticali + tratteggio a >
    openingMark = `<path d="M ${rx+5} ${ry+5} L ${rx+rw-5} ${ry+rh/2} L ${rx+5} ${ry+rh-5}" fill="none" stroke="${color}" stroke-width="1" stroke-dasharray="3,3" opacity=".85"/>`;
  } else if (apertura==='destra'){
    // Richiesto: apertura destra = |<|, bordi verticali + tratteggio a <
    openingMark = `<path d="M ${rx+rw-5} ${ry+5} L ${rx+5} ${ry+rh/2} L ${rx+rw-5} ${ry+rh-5}" fill="none" stroke="${color}" stroke-width="1" stroke-dasharray="3,3" opacity=".85"/>`;
  }

  return `
  <svg width="${totalW}" height="${totalH}" viewBox="0 0 ${totalW} ${totalH}" style="overflow:visible">
    <rect x="${rx}" y="${ry}" width="${rw}" height="${rh}" fill="none" stroke="${color}" stroke-width="1.4"/>
    <line x1="${rx+3}" y1="${ry}" x2="${rx+3}" y2="${ry+rh}" stroke="${color}" stroke-width=".7" opacity=".55"/>
    <line x1="${rx+rw-3}" y1="${ry}" x2="${rx+rw-3}" y2="${ry+rh}" stroke="${color}" stroke-width=".7" opacity=".55"/>
    ${openingMark}
    <line x1="${rx}" y1="8" x2="${rx+rw}" y2="8" stroke="#5B6B7A" stroke-width="1"/>
    <line x1="${rx}" y1="4" x2="${rx}" y2="12" stroke="#5B6B7A" stroke-width="1"/>
    <line x1="${rx+rw}" y1="4" x2="${rx+rw}" y2="12" stroke="#5B6B7A" stroke-width="1"/>
    <line x1="10" y1="${ry}" x2="10" y2="${ry+rh}" stroke="#5B6B7A" stroke-width="1"/>
    <line x1="6" y1="${ry}" x2="14" y2="${ry}" stroke="#5B6B7A" stroke-width="1"/>
    <line x1="6" y1="${ry+rh}" x2="14" y2="${ry+rh}" stroke="#5B6B7A" stroke-width="1"/>
  </svg>`;
}

function renderAll(){
  renderClientList();
  renderMain();
}

/* ============================================================
   CATEGORY NAV
   ============================================================ */
function openCategory(tipo){
  state.selectedCategory = tipo;
  renderMain();
}
function closeCategory(){
  state.selectedCategory = null;
  renderMain();
}
