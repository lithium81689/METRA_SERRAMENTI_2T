# Scheda Misurazioni Serramenti — versione riorganizzata

Applicazione web per registrare sopralluoghi e misure di serramenti. Funziona direttamente nel browser, senza backend, database, account utente, installazione o compilazione.

Questa copia mantiene il comportamento e il formato dati del progetto originale, ma separa HTML, CSS e JavaScript per rendere più sicure le modifiche successive.

## Funzionalità

- gestione, ricerca, modifica ed eliminazione di più clienti;
- gestione delle stanze, con rinomina ed eliminazione;
- inserimento, modifica, duplicazione ed eliminazione delle misure;
- creazione di una stanza direttamente durante l'inserimento di una misura;
- categorie: serramenti, porte, balconi, avvolgibili, zanzariere e tende oscuranti;
- misure in millimetri e quantità per elementi uguali;
- campi specifici per ante, apertura, cassonetto, balconi, zanzariere e tende;
- scelta obbligatoria tra Misura Piena e Misura Da Fare, eccetto per gli avvolgibili;
- opzione Misura Luce dedicata agli avvolgibili;
- esportazione e importazione dei backup JSON;
- PDF completo o limitato a una singola categoria;
- interfaccia adattata a computer, tablet e smartphone;
- sidebar ridimensionabile su desktop.

## Avvio

È possibile aprire **index.html** direttamente in un browser moderno. Per un ambiente equivalente a GitHub Pages è preferibile servirlo come sito statico.

Non esistono dipendenze da installare e non è previsto alcun processo di build. Per pubblicare il progetto su GitHub Pages deve essere caricata l'intera struttura, non soltanto index.html.

## Struttura

~~~text
index.html
assets/
├─ css/
│  ├─ base.css
│  ├─ layout.css
│  ├─ components.css
│  ├─ print.css
│  └─ responsive.css
└─ js/
   ├─ state.js
   ├─ utils.js
   ├─ ui.js
   ├─ storage.js
   ├─ rendering.js
   ├─ clients.js
   ├─ rooms.js
   ├─ measurements.js
   ├─ pdf-logo.js
   ├─ pdf.js
   ├─ backup.js
   └─ app.js
docs/
├─ architecture.md
├─ data-and-backups.md
└─ testing.md
tests/
├─ verify-structure.mjs
└─ verify-pdf-summary.mjs
~~~

Le responsabilità dei file e il loro ordine di caricamento sono descritti in [docs/architecture.md](docs/architecture.md).

## Dati e compatibilità

La chiave usata nel browser resta:

~~~text
infissi-app-clients-v2
~~~

Il formato persistito ed esportato resta:

~~~json
{
  "clients": []
}
~~~

Di conseguenza i backup generati dalla versione precedente continuano a essere importabili. Nessuna migrazione viene applicata durante questa riorganizzazione.

localStorage è legato all'origine del sito. Due versioni pubblicate sotto la stessa origine e con la stessa chiave possono leggere gli stessi dati; sotto origini diverse i dati devono essere trasferiti con il backup JSON. Ulteriori dettagli sono disponibili in [docs/data-and-backups.md](docs/data-and-backups.md).

## PDF

Il PDF viene costruito direttamente in JavaScript, senza usare la finestra di stampa del browser. Contiene il logo e l'intestazione aziendale e può includere tutte le misure oppure una singola categoria. In fondo al documento aggiunge un riepilogo che accorpa gli elementi dello stesso tipo con tutti i dati identici, escluse le note, e ne somma le quantità. Per ogni unità conteggiata viene riportata una riga numerata dedicata alla relativa nota, anche quando la nota è vuota; per serramenti, balconi, avvolgibili e zanzariere sono riportate anche le superfici totali calcolate da larghezza e altezza. Su iOS il file può essere aperto in una nuova scheda, mentre sugli altri dispositivi viene scaricato.

Il logo rimane incorporato in **pdf-logo.js** per preservare la generazione sincrona e il funzionamento senza un caricamento separato dell'immagine.

## Verifica

Il controllo statico non richiede pacchetti esterni:

~~~text
node tests/verify-structure.mjs
~~~

La checklist funzionale per desktop, smartphone, persistenza, backup e PDF è in [docs/testing.md](docs/testing.md).

## Requisiti

- Google Chrome;
- Microsoft Edge;
- Safari;
- Firefox.

I caratteri Google vengono caricati dalla rete. Se non sono disponibili, l'applicazione usa i caratteri di riserva del sistema; dati e logica principale restano locali.

## Limitazioni

- nessuna sincronizzazione automatica tra dispositivi;
- i dati possono andare persi eliminando i dati del sito dal browser;
- il backup JSON non è cifrato;
- non sono presenti autenticazione o controllo degli accessi.

È consigliato esportare periodicamente un backup.

## Licenza

Progetto personale. Utilizzo, modifica e distribuzione dipendono dalle indicazioni del proprietario del repository.
