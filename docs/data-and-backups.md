# Dati e backup

## Persistenza

L'applicazione salva lo stato nel localStorage del browser con la chiave:

~~~text
infissi-app-clients-v2
~~~

Il contenuto principale ha questa forma:

~~~json
{
  "clients": [
    {
      "id": "identificatore",
      "nome": "Mario Rossi",
      "data": "2026-11-07",
      "telefono": "",
      "email": "",
      "note": "",
      "createdAt": 0,
      "rooms": [],
      "measurements": []
    }
  ]
}
~~~

La riorganizzazione non modifica questo formato e continua a supportare quantity come alias storico di quantita in lettura.

Le nuove misurazioni non appartenenti agli avvolgibili salvano tipoMisura con valore piena oppure da_fare. Gli avvolgibili salvano misuraLuce come valore booleano. I backup precedenti, nei quali questi campi non esistono, restano importabili; il valore viene richiesto quando una vecchia misurazione non-avvolgibile viene modificata e salvata.

## Esportazione

Il comando **Esporta backup** scarica un file JSON con tutti i clienti, le stanze e le misurazioni. Il file non è cifrato: va conservato come un documento contenente dati personali.

## Importazione

L'importazione accetta il formato con un array clients. Dopo la conferma, i dati presenti nel browser vengono sostituiti. Annullando la conferma, lo stato non cambia.

## Compatibilità

- i backup della versione monolitica rimangono importabili;
- la stessa origine web e la stessa chiave condividono i dati tra le due versioni;
- origini web differenti hanno aree localStorage separate;
- il trasferimento tra dispositivi richiede esportazione e importazione manuali.

Prima di introdurre nuovi campi obbligatori o cambiare la struttura sarà necessario aggiungere una versione dello schema e una migrazione esplicita.
