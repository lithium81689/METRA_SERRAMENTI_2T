function sanitizePdfText(str){
  return String(str ?? '')
    .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    .replace(/[’‘]/g, "'")
    .replace(/[“”]/g, '"')
    .replace(/[–—]/g, '-')
    .replace(/[·]/g, '-')
    .replace(/[^\x20-\x7E]/g, '?')
    .replace(/\s+/g, ' ')
    .trim();
}
function pdfEscape(str){
  return sanitizePdfText(str).replace(/\\/g,'\\\\').replace(/\(/g,'\\(').replace(/\)/g,'\\)');
}
function pdfFileName(str){
  return sanitizePdfText(str || 'cliente').toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/^-+|-+$/g,'') || 'cliente';
}
function base64ToBytes(b64){
  const bin = atob(b64);
  const out = new Uint8Array(bin.length);
  for (let i=0;i<bin.length;i++) out[i] = bin.charCodeAt(i);
  return out;
}
function asciiBytes(str){
  return new TextEncoder().encode(str);
}
function concatBytes(chunks){
  const total = chunks.reduce((sum,c)=>sum+c.length,0);
  const out = new Uint8Array(total);
  let offset = 0;
  chunks.forEach(c=>{ out.set(c, offset); offset += c.length; });
  return out;
}
function makePdfObject(id, body){
  const chunks = [asciiBytes(`${id} 0 obj\n`)];
  if (typeof body === 'string') chunks.push(asciiBytes(body));
  else chunks.push(body);
  chunks.push(asciiBytes(`\nendobj\n`));
  return concatBytes(chunks);
}
function makePdfBytes(pageStreams){
  const imageBytes = base64ToBytes(COMPANY_LOGO_JPEG_BASE64);
  const objects = [];
  const pageCount = pageStreams.length;
  const catalogId = 1, pagesId = 2, fontId = 3, boldFontId = 4, imageId = 5;
  const firstPageContentId = 6;
  const pageIds = [];

  objects[catalogId] = makePdfObject(catalogId, `<< /Type /Catalog /Pages ${pagesId} 0 R >>`);
  objects[fontId] = makePdfObject(fontId, `<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>`);
  objects[boldFontId] = makePdfObject(boldFontId, `<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold >>`);
  objects[imageId] = makePdfObject(imageId, concatBytes([
    asciiBytes(`<< /Type /XObject /Subtype /Image /Width ${COMPANY_LOGO_WIDTH} /Height ${COMPANY_LOGO_HEIGHT} /ColorSpace /DeviceRGB /BitsPerComponent 8 /Filter /DCTDecode /Length ${imageBytes.length} >>\nstream\n`),
    imageBytes,
    asciiBytes(`\nendstream`)
  ]));

  for (let i=0;i<pageCount;i++){
    const contentId = firstPageContentId + i*2;
    const pageId = contentId + 1;
    pageIds.push(pageId);
    const content = asciiBytes(pageStreams[i]);
    objects[contentId] = makePdfObject(contentId, concatBytes([
      asciiBytes(`<< /Length ${content.length} >>\nstream\n`),
      content,
      asciiBytes(`\nendstream`)
    ]));
    objects[pageId] = makePdfObject(pageId,
      `<< /Type /Page /Parent ${pagesId} 0 R /MediaBox [0 0 595.28 841.89] /Resources << /Font << /F1 ${fontId} 0 R /F2 ${boldFontId} 0 R >> /XObject << /Logo ${imageId} 0 R >> >> /Contents ${contentId} 0 R >>`
    );
  }
  objects[pagesId] = makePdfObject(pagesId, `<< /Type /Pages /Kids [${pageIds.map(id=>`${id} 0 R`).join(' ')}] /Count ${pageCount} >>`);

  const chunks = [asciiBytes('%PDF-1.4\n')];
  const offsets = [0];
  let pos = chunks[0].length;
  for (let id=1; id<objects.length; id++){
    offsets[id] = pos;
    chunks.push(objects[id]);
    pos += objects[id].length;
  }
  const xrefPos = pos;
  let xref = `xref\n0 ${objects.length}\n0000000000 65535 f \n`;
  for (let id=1; id<objects.length; id++){
    xref += String(offsets[id]).padStart(10,'0') + ' 00000 n \n';
  }
  xref += `trailer\n<< /Size ${objects.length} /Root ${catalogId} 0 R >>\nstartxref\n${xrefPos}\n%%EOF`;
  chunks.push(asciiBytes(xref));
  return concatBytes(chunks);
}

const PDF_AREA_TYPES = ['finestra','balcone','serranda','zanzariera'];

function normalizePdfIdentityNumber(value){
  if (value===undefined || value===null || value==='') return null;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : String(value).trim();
}
function normalizePdfIdentityText(value){
  return value===undefined || value===null ? '' : String(value).trim();
}
function pdfMeasurementIdentity(m){
  const tipo = normalizePdfIdentityText(m.tipo);
  const cassonetto = tipo==='finestra' && m.cassonetto && m.cassonetto.presente
    ? {
        presente: true,
        larghezza: normalizePdfIdentityNumber(m.cassonetto.larghezza),
        altezza: normalizePdfIdentityNumber(m.cassonetto.altezza),
        profondita: normalizePdfIdentityNumber(m.cassonetto.profondita),
        note: normalizePdfIdentityText(m.cassonetto.note)
      }
    : { presente: false };

  return {
    tipo,
    larghezza: normalizePdfIdentityNumber(m.larghezza),
    altezza: normalizePdfIdentityNumber(m.altezza),
    profondita: normalizePdfIdentityNumber(m.profondita),
    apertura: usesApertura(tipo) ? normalizePdfIdentityText(m.apertura) : '',
    numeroAnte: tipo==='finestra' ? normalizePdfIdentityNumber(m.numeroAnte) : null,
    tipoMisura: tipo==='serranda' ? null : (normalizePdfIdentityText(m.tipoMisura) || null),
    misuraLuce: tipo==='serranda' ? !!m.misuraLuce : false,
    balconeElemento: tipo==='balcone' ? normalizePdfIdentityText(m.balconeElemento) : '',
    balconeTipologia: tipo==='balcone' ? normalizePdfIdentityText(m.balconeTipologia) : '',
    zanzarieraTipo: tipo==='zanzariera' ? normalizePdfIdentityText(m.zanzarieraTipo) : '',
    cavoPosizione: tipo==='tenda_oscurante' ? normalizePdfIdentityText(m.cavoPosizione) : '',
    cassonetto,
    note: normalizePdfIdentityText(m.note)
  };
}
function pdfMeasurementIdentityKey(m){
  return JSON.stringify(pdfMeasurementIdentity(m));
}
function groupPdfMeasurements(measurements){
  const groups = [];
  const groupsByKey = new Map();
  measurements.forEach(m=>{
    const key = pdfMeasurementIdentityKey(m);
    let group = groupsByKey.get(key);
    if (!group){
      group = { measure: m, quantity: 0 };
      groupsByKey.set(key, group);
      groups.push(group);
    }
    group.quantity += quantityVal(m);
  });
  return groups;
}
function pdfMeasurementAreaSqm(m){
  if (!PDF_AREA_TYPES.includes(m.tipo)) return 0;
  const width = Number(m.larghezza);
  const height = Number(m.altezza);
  if (!Number.isFinite(width) || !Number.isFinite(height) || width<=0 || height<=0) return 0;
  return width * height * quantityVal(m) / 1000000;
}
function pdfAreaTotals(measurements){
  const totals = Object.fromEntries(PDF_AREA_TYPES.map(tipo=>[tipo, 0]));
  measurements.forEach(m=>{
    if (PDF_AREA_TYPES.includes(m.tipo)) totals[m.tipo] += pdfMeasurementAreaSqm(m);
  });
  return totals;
}
function formatPdfArea(value){
  const safeValue = Number.isFinite(value) ? value : 0;
  return safeValue.toFixed(2).replace('.', ',');
}

function downloadClientPDF(clientId, tipoFiltro=null){
  const client = getClient(clientId);
  if (!client){ showToast('Cliente non trovato'); return; }
  const filtroMeta = tipoFiltro ? TYPE_META[tipoFiltro] : null;
  const filtroLabel = filtroMeta ? filtroMeta.plural : 'tutte le misurazioni';

  const PAGE_W = 595.28, PAGE_H = 841.89;
  const M = 38;
  const CONTENT_W = PAGE_W - M*2;
  const REPEAT_HEADER_HEIGHT = 16 + 22;
  const CONTINUATION_PAGE_HEIGHT = PAGE_H - M*2 - REPEAT_HEADER_HEIGHT;
  let pages = [];
  let content = '';
  let y = PAGE_H - M;

  function num(n){ return Number(n).toFixed(2); }
  function line(x1,y1,x2,y2,w=0.8){ return `${num(w)} w ${num(x1)} ${num(y1)} m ${num(x2)} ${num(y2)} l S\n`; }
  function textWidthApprox(txt, size){ return sanitizePdfText(txt).length * size * 0.51; }
  function drawText(txt, x, yy, size=10, bold=false){
    const font = bold ? 'F2' : 'F1';
    return `BT /${font} ${num(size)} Tf ${num(x)} ${num(yy)} Td (${pdfEscape(txt)}) Tj ET\n`;
  }
  function drawCenter(txt, yy, size=10, bold=false){
    const x = (PAGE_W - textWidthApprox(txt, size))/2;
    return drawText(txt, Math.max(M, x), yy, size, bold);
  }
  function wrapText(txt, size=10, indent=0){
    const clean = sanitizePdfText(txt);
    const maxChars = Math.max(20, Math.floor((CONTENT_W-indent)/(size*0.51)));
    const words = clean.split(' ');
    const lines = [];
    let cur = '';
    words.forEach(w=>{
      if ((cur + ' ' + w).trim().length > maxChars){
        if (cur) lines.push(cur);
        cur = w;
      } else {
        cur = (cur + ' ' + w).trim();
      }
    });
    if (cur) lines.push(cur);
    return lines.length ? lines : [''];
  }
  function finishPage(){
    if (content.trim()) pages.push(content);
    content = '';
  }
  function startNewPage(repeatHeader=false){
    if (content.trim()) finishPage();
    y = PAGE_H - M;
    if (repeatHeader){
      content += drawCenter(`DUE T ARREDAMENTI SU MISURA - ${filtroMeta ? filtroMeta.plural : 'Scheda Misurazioni'}`, y, 10, true);
      y -= 16;
      content += line(M, y, PAGE_W-M, y, 1);
      y -= 22;
    }
  }
  function ensureSpace(h){
    if (y - h < M){ startNewPage(true); }
  }
  function wrappedItemHeight(item){
    const lineHeight = item.spacing || (item.size + 4);
    return wrapText(item.text, item.size, item.indent || 0).length * lineHeight;
  }
  function itemsHeight(items, trailing=0){
    return items.reduce((sum,item)=>sum + wrappedItemHeight(item), trailing);
  }
  function ensureTogether(height){
    ensureSpace(Math.min(height, CONTINUATION_PAGE_HEIGHT));
  }
  function addLine(txt, size=10, bold=false, indent=0, spacing=null){
    const lines = wrapText(txt, size, indent);
    const lineH = spacing || (size + 4);
    const totalHeight = lines.length * lineH;
    if (totalHeight + 2 <= CONTINUATION_PAGE_HEIGHT){
      ensureSpace(totalHeight + 2);
      lines.forEach(l=>{
        content += drawText(l, M + indent, y, size, bold);
        y -= lineH;
      });
      return;
    }
    lines.forEach(l=>{
      ensureSpace(lineH + 2);
      content += drawText(l, M + indent, y, size, bold);
      y -= lineH;
    });
  }

  // Intestazione aziendale, prima pagina
  const logoW = 270;
  const logoH = logoW * COMPANY_LOGO_HEIGHT / COMPANY_LOGO_WIDTH;
  const logoX = (PAGE_W - logoW) / 2;
  const logoY = PAGE_H - 44 - logoH;
  content += `q ${num(logoW)} 0 0 ${num(logoH)} ${num(logoX)} ${num(logoY)} cm /Logo Do Q\n`;
  y = logoY - 20;
  content += drawCenter('DUE T ARREDAMENTI SU MISURA di Toniolo Adriano & C. snc', y, 9.5, true); y -= 14;
  content += drawCenter("Via dell'Artigianato, 36  -  36023 Longare Vicenza", y, 9.5, false); y -= 14;
  content += drawCenter('Laboratorio 0444953510  - Showroom 3515861675', y, 9.5, false); y -= 14;
  content += drawCenter('E-Mail - info@duetarredamenti.it  -  www.duetarredamenti.it', y, 9.5, false); y -= 16;
  content += line(M, y, PAGE_W-M, y, 1.2); y -= 24;

  const misurazioniPerConteggio = tipoFiltro
    ? client.measurements.filter(m=>m.tipo===tipoFiltro)
    : client.measurements;
  const stanzePerConteggio = new Set(misurazioniPerConteggio.map(m=>m.roomId).filter(Boolean)).size;

  addLine(`${filtroMeta ? 'Scheda ' + filtroMeta.plural : 'Scheda Misurazioni'} - ${client.nome || ''}`, 16, true, 0, 22);
  addLine(`Data sopralluogo: ${client.data ? fmtDate(client.data) : '-'}`, 10);
  addLine(`Telefono: ${client.telefono || '-'}`, 10);
  addLine(`Email: ${client.email || '-'}`, 10);
  addLine(`${filtroMeta ? 'Categoria PDF: ' + filtroMeta.plural : 'PDF completo'}`, 10);
  addLine(`Stanze / Misurazioni: ${stanzePerConteggio} / ${misurazioniPerConteggio.length}`, 10);
  if (client.note) addLine(`Note cliente: ${client.note}`, 10);
  y -= 10;

  const roomsById = {};
  client.rooms.forEach(r=>roomsById[r.id]=r.nome);
  const byRoom = {};
  misurazioniPerConteggio.forEach(m=>{
    const key = m.roomId || '__none__';
    if (!byRoom[key]) byRoom[key] = [];
    byRoom[key].push(m);
  });
  const roomIds = client.rooms.map(r=>r.id).filter(id=>byRoom[id] && byRoom[id].length>0);

  if (roomIds.length===0){
    addLine(`Nessuna misurazione registrata per ${filtroLabel}.`, 11, false);
  } else {
    roomIds.forEach((rid)=>{
      ensureSpace(44);
      content += line(M, y, PAGE_W-M, y, 0.8); y -= 18;
      addLine(roomsById[rid] || 'Stanza non indicata', 13, true, 0, 18);

      byRoom[rid].forEach((m, idx)=>{
        const meta = TYPE_META[m.tipo] || TYPE_META.finestra;
        const qta = quantityVal(m);
        const apertura = usesApertura(m.tipo) ? aperturaLabel(m.apertura) : '';
        const details = measureDetailsText(m);
        const cass = cassonettoText(m.cassonetto);
        const cassNote = m.cassonetto && m.cassonetto.note ? ` - ${m.cassonetto.note}` : '';
        const misuraLine = usesApertura(m.tipo)
          ? `Misure: L ${fmtNum(m.larghezza)} mm - H ${fmtNum(m.altezza)} mm - P ${fmtNum(m.profondita)} mm - Apertura: ${apertura}`
          : `Misure: L ${fmtNum(m.larghezza)} mm - H ${fmtNum(m.altezza)} mm - P ${fmtNum(m.profondita)} mm`;

        ensureSpace(70);
        addLine(`${idx+1}. ${meta.label} - Q.ta ${qta}`, 11, true, 0, 15);
        addLine(misuraLine, 10, false, 12, 14);
        if (details) addLine(`Dettagli: ${details}`, 10, false, 12, 14);
        if (cass) addLine(`Cassonetto: ${cass}${cassNote}`, 10, false, 12, 14);
        if (m.note) addLine(`Note: ${m.note}`, 10, false, 12, 14);
        y -= 4;
      });
    });
  }

  const groupedMeasurements = groupPdfMeasurements(misurazioniPerConteggio);
  const presentTypes = [...new Set(groupedMeasurements.map(group=>group.measure.tipo))];
  const orderedTypes = [
    ...CATEGORY_ORDER.filter(tipo=>presentTypes.includes(tipo)),
    ...presentTypes.filter(tipo=>!CATEGORY_ORDER.includes(tipo))
  ];
  let summaryIndex = 1;
  const summarySections = orderedTypes.map(tipo=>{
    const meta = TYPE_META[tipo] || { label: tipo || 'Elemento', plural: tipo || 'Altri elementi' };
    const entries = groupedMeasurements
      .filter(group=>group.measure.tipo===tipo)
      .map(group=>{
        const m = group.measure;
        const apertura = usesApertura(m.tipo) ? aperturaLabel(m.apertura) : '';
        const details = measureDetailsText(m);
        const cass = cassonettoText(m.cassonetto);
        const cassNote = m.cassonetto && m.cassonetto.note ? ' - ' + m.cassonetto.note : '';
        const misuraLine = usesApertura(m.tipo)
          ? 'Misure: L ' + fmtNum(m.larghezza) + ' mm - H ' + fmtNum(m.altezza) + ' mm - P ' + fmtNum(m.profondita) + ' mm - Apertura: ' + apertura
          : 'Misure: L ' + fmtNum(m.larghezza) + ' mm - H ' + fmtNum(m.altezza) + ' mm - P ' + fmtNum(m.profondita) + ' mm';
        const lines = [
          { text: summaryIndex + '. ' + meta.label + ' - Quantita totale: ' + group.quantity, size: 10.5, bold: true, indent: 0, spacing: 15 },
          { text: misuraLine, size: 9.5, bold: false, indent: 12, spacing: 13 }
        ];
        if (details) lines.push({ text: 'Dettagli: ' + details, size: 9.5, bold: false, indent: 12, spacing: 13 });
        if (cass) lines.push({ text: 'Cassonetto: ' + cass + cassNote, size: 9.5, bold: false, indent: 12, spacing: 13 });
        if (m.note) lines.push({ text: 'Note: ' + m.note, size: 9.5, bold: false, indent: 12, spacing: 13 });
        summaryIndex += 1;
        return lines;
      });
    return { meta, entries };
  });
  function summaryEntryHeight(lines){
    return itemsHeight(lines, 4);
  }
  function addSummaryEntry(lines){
    lines.forEach(item=>addLine(item.text, item.size, item.bold, item.indent, item.spacing));
    y -= 4;
  }

  const summaryIntroItems = [
    { text: 'RIEPILOGO MISURAZIONI', size: 14, indent: 0, spacing: 19 },
    {
      text: 'Gli elementi con specifiche identiche sono accorpati e riportati con la quantita totale.',
      size: 9,
      indent: 0,
      spacing: 13
    }
  ];
  const summaryIntroHeight = 8 + 22 + itemsHeight(summaryIntroItems) + 5;
  const firstSummaryHeight = summarySections.length
    ? wrappedItemHeight({
        text: summarySections[0].meta.plural,
        size: 11,
        indent: 0,
        spacing: 16
      }) + summaryEntryHeight(summarySections[0].entries[0])
    : 16;
  ensureTogether(summaryIntroHeight + firstSummaryHeight);
  y -= 8;
  content += line(M, y, PAGE_W-M, y, 1.2); y -= 22;
  addLine('RIEPILOGO MISURAZIONI', 14, true, 0, 19);
  addLine('Gli elementi con specifiche identiche sono accorpati e riportati con la quantita totale.', 9);
  y -= 5;

  if (groupedMeasurements.length===0){
    addLine('Nessuna misurazione da riepilogare per ' + filtroLabel + '.', 10);
  } else {
    summarySections.forEach(section=>{
      const headingHeight = wrappedItemHeight({
        text: section.meta.plural,
        size: 11,
        indent: 0,
        spacing: 16
      });
      ensureTogether(headingHeight + summaryEntryHeight(section.entries[0]));
      addLine(section.meta.plural, 11, true, 0, 16);

      section.entries.forEach((lines,index)=>{
        if (index>0) ensureTogether(summaryEntryHeight(lines));
        addSummaryEntry(lines);
      });
    });
  }

  const displayedAreaTypes = tipoFiltro
    ? (PDF_AREA_TYPES.includes(tipoFiltro) ? [tipoFiltro] : [])
    : PDF_AREA_TYPES;
  if (displayedAreaTypes.length){
    const areaTotals = pdfAreaTotals(misurazioniPerConteggio);
    const surfaceBlockHeight = 24 + 16 + displayedAreaTypes.length * 13 + (!tipoFiltro ? 14 : 0) + 4;
    ensureSpace(surfaceBlockHeight);
    y -= 6;
    content += line(M, y, PAGE_W-M, y, 0.8); y -= 18;
    addLine('SUPERFICI TOTALI (L x H)', 11, true, 0, 16);
    displayedAreaTypes.forEach(tipo=>{
      addLine(TYPE_META[tipo].plural + ': ' + formatPdfArea(areaTotals[tipo]) + ' m2', 9.5, false, 12, 13);
    });
    if (!tipoFiltro){
      const grandTotal = displayedAreaTypes.reduce((sum,tipo)=>sum+areaTotals[tipo],0);
      addLine('Totale complessivo: ' + formatPdfArea(grandTotal) + ' m2', 10, true, 12, 14);
    }
  }

  const todayStr = new Date().toLocaleDateString('it-IT');
  ensureSpace(26);
  y -= 8;
  content += line(M, y, PAGE_W-M, y, 0.6); y -= 14;
  content += drawText(`Generato il ${todayStr}`, M, y, 8, false);
  finishPage();

  const pdfBytes = makePdfBytes(pages);
  const blob = new Blob([pdfBytes], {type:'application/pdf'});
  const url = URL.createObjectURL(blob);
  const fileName = `scheda-${tipoFiltro ? pdfFileName(filtroMeta.plural) + '-' : 'misurazioni-'}${pdfFileName(client.nome)}.pdf`;

  const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
  if (isIOS){
    const opened = window.open(url, '_blank');
    if (!opened){
      const a = document.createElement('a');
      a.href = url;
      a.download = fileName;
      document.body.appendChild(a);
      a.click();
      a.remove();
    }
    showToast(tipoFiltro ? `PDF ${filtroMeta.plural} generato` : 'PDF completo generato');
  } else {
    const a = document.createElement('a');
    a.href = url;
    a.download = fileName;
    document.body.appendChild(a);
    a.click();
    a.remove();
    showToast(tipoFiltro ? `PDF ${filtroMeta.plural} scaricato` : 'PDF completo scaricato');
  }
  setTimeout(()=>URL.revokeObjectURL(url), 60000);
}
