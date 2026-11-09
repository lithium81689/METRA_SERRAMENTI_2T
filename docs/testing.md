# Checklist di collaudo

## Controllo statico

- eseguire node tests/verify-structure.mjs;
- eseguire node tests/verify-pdf-summary.mjs;
- verificare che tutti i percorsi rispettino maiuscole e minuscole;
- verificare che la console del browser non mostri errori;
- confermare che non siano richiesti build o pacchetti esterni.

## Flusso funzionale minimo

- avviare l'app con archivio vuoto;
- creare, cercare e modificare un cliente;
- aggiungere, rinominare ed eliminare una stanza;
- creare una stanza direttamente dal form di misurazione;
- inserire una misura per tutte le sei categorie;
- verificare che Misura Piena e Misura Da Fare siano esclusive e obbligatorie;
- verificare che gli avvolgibili mostrino soltanto la spunta Misura Luce;
- cambiare categoria nel form e verificare la corretta alternanza dei campi;
- modificare, duplicare ed eliminare una misura;
- chiudere i modali con X, Annulla, sfondo ed Escape;
- ricaricare la pagina e verificare la persistenza.

## Backup

- esportare un archivio contenente tutte le categorie;
- importarlo e verificare dati, conteggi e note;
- provare un JSON non valido e confermare che lo stato resti invariato;
- annullare un'importazione valida e confermare che lo stato resti invariato;
- verificare un backup proveniente dalla versione precedente.

## PDF

- generare il PDF completo;
- generare un PDF per ciascuna categoria;
- controllare logo, intestazione, cliente, stanze, quantità e misure;
- controllare apertura, dettagli specifici, cassonetto e note;
- verificare il riepilogo finale, l'accorpamento degli elementi dello stesso tipo con dati identici escluse le note, una nota numerata per ogni unità conteggiata e la somma delle quantità;
- verificare i totali in m2 per serramenti, balconi, avvolgibili e zanzariere;
- confermare che i PDF filtrati riepiloghino soltanto la categoria selezionata;
- provare una categoria senza misure;
- provare dati sufficienti a creare più pagine;
- verificare almeno un browser desktop e Safari su iPhone/iPad.

## Desktop e mobile

- desktop: 1024 px, 1366 px e schermo ampio;
- verificare sidebar tra 300 e 620 px e persistenza della larghezza;
- verificare il passaggio esatto fra 820 e 821 px;
- mobile indicativo: 390 × 844 px;
- verificare modali scorribili, campi su una colonna e assenza di overflow;
- provare orientamento verticale e orizzontale;
- provare il sito senza disponibilità dei font remoti.
