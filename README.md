# FlightMeet CodeIgniter 4 Backend

Dateien in dein bestehendes CodeIgniter-4-Projekt kopieren.

## Datenbank einrichten

In `.env` Datenbank konfigurieren, dann:

```bash
php spark migrate
php spark db:seed FlightMeetSeeder
php spark serve
```

API läuft dann zum Beispiel unter:

```txt
http://localhost:8080/api/meetups
```

Falls React über `localhost:5173` läuft, CORS in CodeIgniter erlauben.
