import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import vm from 'node:vm';

const root = join(import.meta.dirname, '..');
const context = vm.createContext({});
vm.runInContext(readFileSync(join(root, 'assets/js/utils.js'), 'utf8'), context);
vm.runInContext(readFileSync(join(root, 'assets/js/pdf.js'), 'utf8'), context);

function copy(value){
  return JSON.parse(JSON.stringify(value));
}
function nearlyEqual(actual, expected, epsilon=1e-9){
  assert.ok(Math.abs(actual-expected) < epsilon, 'Atteso ' + expected + ', ricevuto ' + actual);
}

const serramento = {
  id: 'm1',
  createdAt: 1,
  roomId: 'r1',
  tipo: 'finestra',
  larghezza: 1000,
  altezza: 1200,
  profondita: 80,
  quantita: 2,
  numeroAnte: 2,
  apertura: 'sinistra',
  tipoMisura: 'piena',
  misuraLuce: false,
  cassonetto: { presente: false },
  note: 'Telaio bianco'
};
const stessoSerramento = {
  ...copy(serramento),
  id: 'm2',
  createdAt: 2,
  roomId: 'r2',
  larghezza: '1000',
  altezza: '1200',
  profondita: '80',
  quantity: 3
};
delete stessoSerramento.quantita;

const gruppiUguali = context.groupPdfMeasurements([serramento, stessoSerramento]);
assert.equal(gruppiUguali.length, 1);
assert.equal(gruppiUguali[0].quantity, 5);

const variantiSerramento = [
  { apertura: 'destra' },
  { numeroAnte: 1 },
  { tipoMisura: 'da_fare' },
  { larghezza: 1001 },
  { altezza: 1201 },
  { profondita: 81 },
  { cassonetto: { presente: true, larghezza: 1000, altezza: 200, profondita: 180, note: '' } },
  { note: 'Telaio nero' }
].map((changes,index)=>({ ...copy(serramento), ...changes, id: 'variante-' + index }));
assert.equal(context.groupPdfMeasurements([serramento, ...variantiSerramento]).length, 1 + variantiSerramento.length);

const opzionaleMancante = { ...copy(serramento), profondita: undefined };
const opzionaleVuoto = { ...copy(serramento), profondita: '' };
assert.equal(context.pdfMeasurementIdentityKey(opzionaleMancante), context.pdfMeasurementIdentityKey(opzionaleVuoto));

const portaConDatiIrrilevanti = {
  tipo: 'porta',
  larghezza: 900,
  altezza: 2100,
  profondita: null,
  quantita: 1,
  apertura: 'destra',
  tipoMisura: 'piena',
  note: ''
};
const portaConResiduiLegacy = {
  ...copy(portaConDatiIrrilevanti),
  numeroAnte: 9,
  zanzarieraTipo: 'laterale',
  cassonetto: { presente: true, larghezza: 1 }
};
assert.equal(context.pdfMeasurementIdentityKey(portaConDatiIrrilevanti), context.pdfMeasurementIdentityKey(portaConResiduiLegacy));

const avvolgibile = {
  tipo: 'serranda',
  larghezza: 1000,
  altezza: 2200,
  profondita: null,
  quantita: 1,
  misuraLuce: false,
  note: ''
};
assert.equal(
  context.groupPdfMeasurements([avvolgibile, { ...copy(avvolgibile), misuraLuce: true }]).length,
  2
);

const zanzariera = {
  tipo: 'zanzariera',
  larghezza: 800,
  altezza: 2100,
  profondita: null,
  quantita: 1,
  zanzarieraTipo: 'verticale',
  tipoMisura: 'piena',
  note: ''
};
assert.equal(
  context.groupPdfMeasurements([zanzariera, { ...copy(zanzariera), zanzarieraTipo: 'laterale' }]).length,
  2
);

const balcone = {
  tipo: 'balcone',
  larghezza: 900,
  altezza: 2200,
  profondita: 100,
  quantita: 1,
  apertura: 'sinistra',
  balconeElemento: 'porta-finestra',
  balconeTipologia: 'Vicentina',
  tipoMisura: 'piena',
  note: ''
};
assert.equal(
  context.groupPdfMeasurements([
    balcone,
    { ...copy(balcone), balconeElemento: 'finestra' },
    { ...copy(balcone), balconeTipologia: 'Scorrevole' }
  ]).length,
  3
);

const tenda = {
  tipo: 'tenda_oscurante',
  larghezza: 1000,
  altezza: 2000,
  quantita: 1,
  cavoPosizione: 'sinistra',
  tipoMisura: 'piena',
  note: ''
};
assert.equal(
  context.groupPdfMeasurements([tenda, { ...copy(tenda), cavoPosizione: 'destra' }]).length,
  2
);

const serramentoConCassonetto = {
  ...copy(serramento),
  cassonetto: { presente: true, larghezza: 1000, altezza: 200, profondita: 180, note: 'Isolato' }
};
assert.equal(
  context.groupPdfMeasurements([
    serramentoConCassonetto,
    { ...copy(serramentoConCassonetto), cassonetto: { ...serramentoConCassonetto.cassonetto, larghezza: 1001 } },
    { ...copy(serramentoConCassonetto), cassonetto: { ...serramentoConCassonetto.cassonetto, altezza: 201 } },
    { ...copy(serramentoConCassonetto), cassonetto: { ...serramentoConCassonetto.cassonetto, profondita: 181 } },
    { ...copy(serramentoConCassonetto), cassonetto: { ...serramentoConCassonetto.cassonetto, note: 'Non isolato' } }
  ]).length,
  5
);

const misureSuperficie = [
  { ...copy(serramento), larghezza: 1000, altezza: 1200, quantita: 2 },
  { ...copy(serramento), larghezza: 1000, altezza: 1200, quantita: 3 },
  { ...copy(serramento), larghezza: 500, altezza: 1000, quantita: 2, note: 'variante' },
  { tipo: 'balcone', larghezza: 900, altezza: 2200, quantita: 2 },
  { tipo: 'balcone', larghezza: 900, altezza: 2200, quantita: 1 },
  { tipo: 'balcone', larghezza: 900, altezza: 2200, quantita: 1, note: 'variante' },
  { ...copy(avvolgibile), quantita: 3 },
  { ...copy(avvolgibile), quantita: 1, misuraLuce: true },
  { ...copy(zanzariera), quantita: 3 },
  { ...copy(zanzariera), quantita: 1, zanzarieraTipo: 'laterale' },
  { tipo: 'porta', larghezza: 1000, altezza: 2000, quantita: 100 },
  { tipo: 'tenda_oscurante', larghezza: 1000, altezza: 2000, quantita: 100 }
];
const totali = context.pdfAreaTotals(misureSuperficie);
nearlyEqual(totali.finestra, 7);
nearlyEqual(totali.balcone, 7.92);
nearlyEqual(totali.serranda, 8.8);
nearlyEqual(totali.zanzariera, 6.72);
nearlyEqual(Object.values(totali).reduce((sum,value)=>sum+value,0), 30.44);
assert.equal(context.formatPdfArea(30.44), '30,44');
assert.equal(context.pdfMeasurementAreaSqm({ tipo: 'finestra', larghezza: 'x', altezza: 1000, quantita: 2 }), 0);
assert.equal(context.pdfMeasurementAreaSqm({ tipo: 'porta', larghezza: 1000, altezza: 2000, quantita: 2 }), 0);

const capture = { blob: null, toast: '' };
const pdfContext = vm.createContext({
  TextEncoder,
  Uint8Array,
  Blob,
  atob,
  navigator: { userAgent: 'Node.js', platform: 'Win32', maxTouchPoints: 0 },
  window: { open: ()=>null },
  document: {
    createElement: ()=>({ href: '', download: '', click(){}, remove(){} }),
    body: { appendChild(){} }
  },
  URL: {
    createObjectURL(blob){ capture.blob = blob; return 'blob:test'; },
    revokeObjectURL(){}
  },
  setTimeout: ()=>0,
  showToast(message){ capture.toast = message; }
});
for (const file of ['assets/js/state.js', 'assets/js/utils.js', 'assets/js/pdf-logo.js', 'assets/js/pdf.js']){
  vm.runInContext(readFileSync(join(root, file), 'utf8'), pdfContext);
}

async function generatePdfText(client, tipoFiltro=null){
  capture.blob = null;
  vm.runInContext('state.clients = ' + JSON.stringify([client]) + ';', pdfContext);
  pdfContext.downloadClientPDF(client.id, tipoFiltro);
  assert.ok(capture.blob instanceof Blob, 'Il PDF non è stato generato');
  return Buffer.from(await capture.blob.arrayBuffer()).toString('latin1');
}
function pdfPageCount(pdfText){
  const match = pdfText.match(/\/Type \/Pages[\s\S]*?\/Count (\d+)/);
  assert.ok(match, 'Conteggio pagine PDF non trovato');
  return Number(match[1]);
}

const integrationClient = {
  id: 'cliente-test',
  nome: 'Cliente Test',
  data: '2026-11-09',
  telefono: '',
  email: '',
  note: '',
  rooms: [
    { id: 'r1', nome: 'Cucina' },
    { id: 'r2', nome: 'Camera' }
  ],
  measurements: [
    serramento,
    stessoSerramento,
    { ...copy(balcone), roomId: 'r1', quantita: 2 }
  ]
};
const completePdfText = await generatePdfText(integrationClient);
assert.match(completePdfText, /RIEPILOGO MISURAZIONI/);
assert.match(completePdfText, /Quantita totale: 5/);
assert.match(completePdfText, /Serramenti: 6,00 m2/);
assert.match(completePdfText, /Balconi: 3,96 m2/);
assert.match(completePdfText, /Totale complessivo: 9,96 m2/);

const filteredPdfText = await generatePdfText(integrationClient, 'finestra');
assert.match(filteredPdfText, /Serramenti: 6,00 m2/);
assert.doesNotMatch(filteredPdfText, /Balconi:/);
assert.doesNotMatch(filteredPdfText, /Totale complessivo:/);

const longNoteClient = {
  ...copy(integrationClient),
  id: 'cliente-note-lunghe',
  measurements: [{
    ...copy(serramento),
    id: 'misura-note-lunghe',
    roomId: 'r1',
    quantita: 1,
    note: Array.from({ length: 2500 }, (_,index)=>'dettaglio' + index).join(' ')
  }]
};
const longPdfText = await generatePdfText(longNoteClient);
assert.ok(pdfPageCount(longPdfText) >= 3, 'La prova con note lunghe deve produrre più pagine');
const textYPositions = [...longPdfText.matchAll(/BT \/F[12] [\d.]+ Tf [\d.]+ ([\d.]+) Td \(/g)]
  .map(match=>Number(match[1]));
assert.ok(textYPositions.length>0, 'Nessuna coordinata di testo trovata nel PDF');
assert.ok(textYPositions.every(y=>y>=38), 'Testo PDF disegnato sotto il margine inferiore');

console.log('Riepilogo PDF verificato: raggruppamento, quantità, superfici e paginazione corretti.');
