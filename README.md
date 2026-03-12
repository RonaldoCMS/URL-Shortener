# 🔗 URL Shortener

Un URL Shortener costruito con **NestJS**, **Redis** e **PostgreSQL**, orchestrati con **Docker Compose**.

Progetto didattico per imparare il pattern **cache-aside** con Redis e la gestione del **TTL** (Time To Live).

---

## 🚀 Stack Tecnologico

| Tecnologia | Ruolo |
|---|---|
| NestJS | Framework backend |
| PostgreSQL | Database persistente |
| Redis | Cache in-memory |
| Docker Compose | Orchestrazione dei container |
| TypeORM | ORM per PostgreSQL |
| cache-manager | Integrazione Redis con NestJS |

---

## 📐 Architettura

Il progetto implementa il pattern **cache-aside**:

```
Richiesta GET /:shortCode
       │
       ▼
  Cerca in Redis
       │
  ┌────┴────┐
  │         │
HIT        MISS
  │         │
  │         ▼
  │    Cerca in PostgreSQL
  │         │
  │         ▼
  │    Salva in Redis (con TTL)
  │         │
  └────┬────┘
       │
       ▼
   Redirect
```

---

## ⚙️ Prerequisiti

- [Node.js](https://nodejs.org/) v20+
- [Docker Desktop](https://www.docker.com/products/docker-desktop/)
- [NestJS CLI](https://docs.nestjs.com/cli/overview)

---

## 🛠️ Installazione

### 1. Clona il repository

```bash
git clone https://github.com/tuousername/url-shortener.git
cd url-shortener
```

### 2. Installa le dipendenze

```bash
npm install
```

### 3. Crea il file `.env`

```env
# Database
DB_HOST=localhost
DB_PORT=5432
DB_USER=postgres
DB_PASSWORD=postgres
DB_NAME=url_shortener

# Redis
REDIS_HOST=localhost
REDIS_PORT=6379

# App
PORT=3000
```

### 4. Avvia i container Docker

```bash
docker compose up -d
```

### 5. Avvia l'applicazione

```bash
npm run start:dev
```

L'app sarà disponibile su `http://localhost:3000`.

---

## 📡 API Endpoints

### `POST /shorten`
Accorcia un URL. Accetta un TTL opzionale in secondi.

**Body:**
```json
{
  "originalUrl": "https://www.example.com",
  "ttlSeconds": 3600
}
```

**Response:**
```json
{
  "id": 1,
  "shortCode": "abc123",
  "originalUrl": "https://www.example.com",
  "expiresAt": "2026-03-13T00:00:00.000Z",
  "createdAt": "2026-03-12T23:00:00.000Z"
}
```

---

### `GET /:shortCode`
Risolve uno short code e redirige all'URL originale.

- Prima cerca in **Redis** (Cache HIT → redirect immediato)
- Se non trovato, cerca in **PostgreSQL** (Cache MISS → salva in Redis → redirect)

---

### `DELETE /:shortCode`
Elimina un URL sia da Redis che da PostgreSQL (**cache invalidation**).

**Response:**
```json
{
  "message": "abc123 eliminato con successo"
}
```

---

## 🧠 Concetti Redis Appresi

### Cache-aside Pattern
La strategia più comune: l'applicazione gestisce manualmente la cache. Prima legge da Redis, poi dal DB, poi aggiorna Redis.

### TTL (Time To Live)
Ogni chiave Redis può avere una scadenza automatica. Utile per link temporanei o sessioni.

```typescript
await this.cacheManager.set(shortCode, originalUrl, ttlMilliseconds);
```

### Cache Invalidation
Eliminazione manuale di una chiave da Redis quando il dato viene cancellato.

```typescript
await this.cacheManager.del(shortCode);
```

---

## 🐳 Docker Compose

```yaml
services:
  redis:    # Cache in-memory, porta 6379
  postgres: # Database persistente, porta 5432
```

Avvia tutto con:
```bash
docker compose up -d    # Avvia
docker compose down     # Spegni
docker compose logs -f  # Log in tempo reale
```

---

## 📁 Struttura del Progetto

```
url-shortener/
├── src/
│   ├── url/
│   │   ├── url.controller.ts   # Endpoints REST
│   │   ├── url.service.ts      # Logica business + Redis
│   │   ├── url.entity.ts       # Entità TypeORM
│   │   └── url.module.ts       # Modulo NestJS
│   ├── app.module.ts           # Modulo root (DB + Redis config)
│   └── main.ts                 # Entry point
├── docker-compose.yml          # Redis + PostgreSQL
├── .env                        # Variabili d'ambiente
└── README.md
```

---

## 👨‍💻 Autore

**Fabio Danubbio** — [danubbio.it](https://danubbio.it) · [GitHub](https://github.com/ronaldocms)