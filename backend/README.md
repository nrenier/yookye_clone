# Yookye Backend API

Flask-based REST API per il clone di Yookye con autenticazione JWT e integrazione OpenSearch.

## Caratteristiche

- **Autenticazione JWT** con Flask-JWT-Extended
- **Database OpenSearch** con fallback mockup in-memory
- **Validazione dati** con Marshmallow
- **Rate limiting** per protezione API
- **CORS** configurato per il frontend
- **Sicurezza** con Helmet
- **Hash password** con Bcrypt

## API Endpoints

### Autenticazione (`/api/auth`)
- `POST /register` - Registrazione utente
- `POST /login` - Login utente
- `POST /refresh` - Refresh token
- `GET /profile` - Profilo utente (autenticato)
- `PUT /profile` - Aggiorna profilo (autenticato)
- `POST /logout` - Logout utente (autenticato)

### Viaggi (`/api/travel`)
- `POST /submit-form` - Invia form configurazione viaggio
- `GET /my-travels` - Viaggi dell'utente (autenticato)
- `GET /travel/<id>` - Dettagli viaggio (autenticato)
- `PUT /travel/<id>/status` - Aggiorna status viaggio (autenticato)
- `GET /statistics` - Statistiche viaggi utente (autenticato)
- `GET /destinations` - Lista destinazioni disponibili (pubblico)

### Utente (`/api/user`)
- `GET/POST/PUT /preferences` - Gestione preferenze utente (autenticato)
- `GET /dashboard` - Dati dashboard utente (autenticato)
- `GET /activity` - Log attività utente (autenticato)
- `DELETE /delete-account` - Elimina account (autenticato)
- `GET /export-data` - Esporta dati utente GDPR (autenticato)

### Sistema
- `GET /api/health` - Health check

## Setup e Installazione

### Prerequisiti
- Python 3.8+
- pip o pipenv

### Installazione

1. **Installa dipendenze:**
   ```bash
   cd backend
   pip install -r requirements.txt
   ```

2. **Configurazione ambiente:**
   ```bash
   cp .env.example .env
   # Modifica .env con le tue configurazioni
   ```

3. **Avvia il server:**
   ```bash
   python app.py
   ```

Il server sarà disponibile su `http://localhost:3001`

### Sviluppo con auto-reload
```bash
FLASK_ENV=development python app.py
```

## Configurazione OpenSearch

### Con OpenSearch reale
```env
OPENSEARCH_HOST=your-opensearch-host
OPENSEARCH_PORT=9200
OPENSEARCH_USERNAME=admin
OPENSEARCH_PASSWORD=your-password
OPENSEARCH_USE_SSL=true
```

### Modalità Mockup (default)
Se OpenSearch non è disponibile, l'API utilizzerà automaticamente uno storage in-memory. Perfetto per sviluppo e testing.

## Struttura Database

### Indice `users`
```json
{
  "email": "user@example.com",
  "password_hash": "hashed_password",
  "first_name": "Nome",
  "last_name": "Cognome",
  "created_at": "2025-01-01T00:00:00Z",
  "last_login": "2025-01-01T00:00:00Z"
}
```

### Indice `travels`
```json
{
  "user_id": "uuid",
  "passions": ["Storia e arte", "Food & Wine"],
  "destinations": "Toscana, Sardegna",
  "travel_pace": "moderate",
  "accommodation_level": "boutique",
  "accommodation_type": "hotel",
  "travelers": {
    "adults": 2,
    "children": 0,
    "infants": 0,
    "rooms": 1
  },
  "budget": "midrange",
  "contact_email": "user@example.com",
  "status": "submitted",
  "created_at": "2025-01-01T00:00:00Z"
}
```

### Indice `preferences`
```json
{
  "user_id": "uuid",
  "preferences": {
    "travel_style": "aventura",
    "budget_range": "medio",
    "accommodation_preferences": ["hotel", "b&b"],
    "activity_preferences": ["cultura", "enogastronomia"]
  },
  "created_at": "2025-01-01T00:00:00Z",
  "updated_at": "2025-01-01T00:00:00Z"
}
```

## Sicurezza

- **Rate Limiting**: 200 richieste/giorno, 50/ora per IP
- **JWT Tokens**: Access token (24h) + Refresh token (30 giorni)
- **Password Hashing**: Bcrypt con salt
- **CORS**: Configurato per origine specifica
- **Validazione Input**: Marshmallow schemas
- **Helmet**: Headers di sicurezza

## Testing

```bash
# Health check
curl http://localhost:3001/api/health

# Registrazione
curl -X POST http://localhost:3001/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123","first_name":"Test","last_name":"User"}'

# Login
curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123"}'
```

## Deployment

### Produzione con Gunicorn
```bash
gunicorn -w 4 -b 0.0.0.0:3001 app:create_app()
```

### Docker (TODO)
```dockerfile
FROM python:3.9-slim
WORKDIR /app
COPY requirements.txt .
RUN pip install -r requirements.txt
COPY . .
EXPOSE 3001
CMD ["gunicorn", "-w", "4", "-b", "0.0.0.0:3001", "app:create_app()"]
```

## TODO / Roadmap

- [ ] Email notifications per form submissions
- [ ] File upload per documenti viaggio
- [ ] Admin panel per gestione esperti locali
- [ ] Integration con sistemi di pagamento
- [ ] WebSocket per notifiche real-time
- [ ] Cache Redis per performance
- [ ] Logging strutturato
- [ ] Metrics e monitoring
- [ ] Tests automatizzati
- [ ] CI/CD pipeline
