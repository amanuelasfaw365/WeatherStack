# WeatherStack

Full-stack weather app — Next.js 14, PostgreSQL, Prisma, JWT auth, OpenWeatherMap.

## Setup

### 1. Environment

Copy `.env.example` to `.env` and fill in:

```env
DATABASE_URL="postgresql://user:password@localhost:5432/weatherstack"
JWT_SECRET="min-32-char-secret"
JWT_REFRESH_SECRET="min-32-char-refresh-secret"
OPENWEATHER_API_KEY="your-key-from-openweathermap.org"
```

### 2. Database

```bash
npm run db:push      # push schema to DB (dev)
npm run db:generate  # generate Prisma client
```

### 3. Run

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

---

## Features

| Feature | Description |
|---|---|
| Auth | Register / Login with `user` or `admin` role |
| JWT | Access token (15 min) + refresh token (7 days) in httpOnly cookies |
| Middleware | All `/dashboard/*` routes are protected |
| Weather search | By city/country name (Geocoding API) or lat/lon coordinates |
| Coord validation | Lat: −90–90 · Lon: −180–180 |
| FHRS | Per-user FIFO queue of last 5 searches in PostgreSQL |
| SLIP | On logout saves current country; on next login shows resume banner |
| Flags | Country flags via flagcdn.com |

## API Routes

| Method | Path | Auth | Description |
|---|---|---|---|
| POST | `/api/auth/register` | — | Register |
| POST | `/api/auth/login` | — | Login (returns `lastSession`) |
| POST | `/api/auth/logout` | cookie | Logout + saves session |
| POST | `/api/auth/refresh` | cookie | Rotate refresh token |
| GET  | `/api/auth/me` | cookie | Get current user |
| POST | `/api/weather/search` | cookie | Search weather |
| GET  | `/api/history` | cookie | Get search history |

## Prisma Schema

- **User** — id, email, name, password (bcrypt), role, lastSession (JSON), timestamps
- **RefreshToken** — token, userId, expiresAt
- **SearchHistory** — userId, country, city, lat, lon, searchedAt
