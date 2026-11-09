# Architettura

La riorganizzazione separa le responsabilità senza introdurre framework, moduli ES o una fase di compilazione. Gli script restano classici per conservare sia l'apertura diretta di index.html sia gli handler HTML esistenti.

## HTML

index.html contiene metadati, struttura dell'interfaccia, modali e riferimenti agli asset esterni. Non contiene più blocchi CSS o logica JavaScript incorporata.

## CSS

| File | Responsabilità |
| --- | --- |
| base.css | variabili, tipografia e regole generali |
| layout.css | sidebar, area principale e disposizione delle sezioni |
| components.css | stanze, categorie, schede misure, modali e notifiche |
| print.css | area e regole di stampa mantenute dalla versione originale |
| responsive.css | breakpoint mobile e gestione del focus |

L'ordine dei collegamenti in index.html preserva la cascata CSS originale.

## JavaScript

| File | Responsabilità |
| --- | --- |
| state.js | stato condiviso, categorie, icone e chiave di persistenza |
| utils.js | identificatori, formattazione, escaping ed etichette |
| ui.js | toast, apertura/chiusura modali e conferme |
| storage.js | caricamento e salvataggio in localStorage |
| rendering.js | sidebar, viste, schede e disegni SVG |
| clients.js | operazioni sui clienti |
| rooms.js | operazioni sulle stanze |
| measurements.js | form e operazioni sulle misurazioni |
| pdf-logo.js | immagine aziendale incorporata e relative dimensioni |
| pdf.js | composizione e download dei PDF |
| backup.js | esportazione e importazione JSON |
| app.js | icona applicazione, eventi generali e inizializzazione |

## Ordine di caricamento

~~~text
state → utils → ui → storage → rendering → clients → rooms
→ measurements → pdf-logo → pdf → backup → app
~~~

app.js è intenzionalmente ultimo: collega gli eventi, prepara l'interfaccia e chiama loadData() soltanto dopo che tutte le dipendenze sono disponibili.

## Regole per gli aggiornamenti

- non cambiare la forma dei dati durante modifiche esclusivamente visive;
- centralizzare le nuove categorie in state.js;
- mantenere la logica di persistenza in storage.js;
- aggiornare insieme rendering, form e PDF quando si aggiunge un campo;
- conservare globali le funzioni richiamate dagli attributi onclick e onchange;
- eseguire il controllo statico e la checklist prima di integrare una modifica in main.
