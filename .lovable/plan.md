

## Piano: Aggiornare email_settings nel database

Eseguire una query UPDATE sulla tabella `email_settings` per sostituire i riferimenti Unilabgroup con Notelseit:

```sql
UPDATE email_settings
SET smtp_host = 'mail.notelseit.com',
    smtp_user = 'info@notelseit.com',
    from_email = 'info@notelseit.com',
    updated_at = now()
WHERE smtp_user = 'crm@unilabgroup.it';
```

Nessuna modifica a file di codice. Solo aggiornamento dati DB tramite insert tool.

