import assert from 'node:assert/strict';
import { readFileSync, existsSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { spawnSync } from 'node:child_process';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const index = readFileSync(join(root, 'index.html'), 'utf8');

const cssFiles = [
  'assets/css/base.css',
  'assets/css/layout.css',
  'assets/css/components.css',
  'assets/css/print.css',
  'assets/css/responsive.css'
];

const jsFiles = [
  'assets/js/state.js',
  'assets/js/utils.js',
  'assets/js/ui.js',
  'assets/js/storage.js',
  'assets/js/rendering.js',
  'assets/js/clients.js',
  'assets/js/rooms.js',
  'assets/js/measurements.js',
  'assets/js/pdf-logo.js',
  'assets/js/pdf.js',
  'assets/js/backup.js',
  'assets/js/app.js'
];

for (const file of [...cssFiles, ...jsFiles]) {
  assert.ok(existsSync(join(root, file)), 'File mancante: ' + file);
}

let lastPosition = -1;
for (const file of cssFiles) {
  const position = index.indexOf('href="' + file + '"');
  assert.ok(position > lastPosition, 'Ordine CSS errato o riferimento mancante: ' + file);
  lastPosition = position;
}

lastPosition = -1;
for (const file of jsFiles) {
  const position = index.indexOf('src="' + file + '"');
  assert.ok(position > lastPosition, 'Ordine JavaScript errato o riferimento mancante: ' + file);
  lastPosition = position;
}

assert.ok(!/<style(?:\s|>)/i.test(index), 'index.html contiene ancora CSS incorporato');
assert.ok(!/<script(?![^>]*\bsrc=)[^>]*>/i.test(index), 'index.html contiene ancora JavaScript incorporato');

const ids = [...index.matchAll(/\bid="([^"]+)"/g)].map(match => match[1]);
assert.equal(new Set(ids).size, ids.length, 'Sono presenti ID HTML duplicati');

const jsSource = jsFiles.map(file => readFileSync(join(root, file), 'utf8')).join('\n');
const referencedIds = [...jsSource.matchAll(/getElementById\(['"]([^'"]+)['"]\)/g)].map(match => match[1]);
for (const id of new Set(referencedIds)) {
  assert.ok(ids.includes(id), 'Elemento HTML non trovato per getElementById: ' + id);
}

const declaredFunctions = new Set(
  [...jsSource.matchAll(/function\s+([A-Za-z_$][\w$]*)\s*\(/g)].map(match => match[1])
);
const inlineHandlers = [...index.matchAll(/\bon(?:click|change)="([^"]+)"/g)]
  .flatMap(match => [...match[1].matchAll(/\b([A-Za-z_$][\w$]*)\s*\(/g)].map(call => call[1]));
for (const handler of new Set(inlineHandlers)) {
  assert.ok(declaredFunctions.has(handler), 'Handler inline non dichiarato: ' + handler);
}

assert.match(readFileSync(join(root, 'assets/js/state.js'), 'utf8'), /infissi-app-clients-v2/);
assert.match(readFileSync(join(root, 'assets/js/backup.js'), 'utf8'), /Array\.isArray\(parsed\.clients\)/);
assert.match(readFileSync(join(root, 'assets/js/pdf.js'), 'utf8'), /RIEPILOGO MISURAZIONI/);
assert.match(readFileSync(join(root, 'assets/js/pdf.js'), 'utf8'), /SUPERFICI TOTALI \(L x H\)/);
assert.match(index, /id="mMisuraPiena"[^>]*value="piena"[^>]*required/);
assert.match(index, /id="mMisuraDaFare"[^>]*value="da_fare"[^>]*required/);
assert.match(index, /id="mMisuraLuce"/);
const measurementSource = readFileSync(join(root, 'assets/js/measurements.js'), 'utf8');
assert.match(measurementSource, /tipo!=='serranda' && !tipoMisuraInput/);
assert.match(measurementSource, /tipoMisura: tipo==='serranda' \? null : tipoMisuraInput\.value/);
assert.match(measurementSource, /misuraLuce: tipo==='serranda'/);
assert.ok(
  measurementSource.indexOf("tipo!=='serranda' && !tipoMisuraInput") < measurementSource.indexOf("if (roomId==='__new__')"),
  'La scelta del tipo misura deve essere validata prima di creare una nuova stanza',
);

for (const file of jsFiles) {
  const result = spawnSync(process.execPath, ['--check', join(root, file)], { encoding: 'utf8' });
  assert.equal(result.status, 0, 'Errore di sintassi in ' + file + ':\n' + result.stderr);
}

console.log(
  'Verifica completata: ' + cssFiles.length + ' CSS, ' +
  jsFiles.length + ' JavaScript, ' + ids.length + ' ID HTML.'
);
