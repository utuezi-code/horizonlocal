# Horizon Local v2.0

Marketplace multi-vendeurs québécoise — produits 100% locaux.

**Stack** : Laravel 11 (API) + Next.js 14 (frontend) + PostgreSQL + Redis + Stripe Connect.

## Démarrage rapide

### Avec Docker (recommandé)

```bash
docker compose up -d
docker compose exec api php artisan key:generate
docker compose exec api php artisan migrate --seed
```

- API : http://localhost:8000
- Frontend : http://localhost:3000

### Sans Docker

```bash
# 1. API Laravel
cd api
cp .env.example .env
composer install
php artisan key:generate
# Configurer DB_* dans .env (Postgres) puis :
php artisan migrate --seed
php artisan serve

# 2. Frontend Next.js (autre terminal)
cd frontend
cp .env.example .env.local
npm install
npm run dev
```

## Comptes par défaut (seeders)

Mot de passe : `changeme` (à changer en prod)

| Email | Rôle |
|-------|------|
| `alain@horizonlocal.ca` | super_admin |
| `admin@horizonlocal.ca` | admin |
| `marketeur@horizonlocal.ca` | marketer |
| `contact@colorantic.ca` | vendor (Colorantic) |
| `contact@jaytoutenbois.ca` | vendor (JAY TOUT EN BOIS) |

## Architecture

```
horizonlocal/
├── api/              # Laravel 11 (PHP 8.3) — REST API
├── frontend/         # Next.js 14 (App Router, TS, Tailwind)
├── docker-compose.yml
├── DEPLOYMENT.md     # Guide Vercel + Railway
└── .github/workflows/deploy.yml
```

## Documentation

- **[DEPLOYMENT.md](./DEPLOYMENT.md)** — Déploiement sur Vercel + Railway
- **SAD complet** — `efe46060-SAD_HorizonLocal.md` (Software Architecture Document v1.2)

## Tests rapides

```bash
# Health check
curl http://localhost:8000/api/health

# Catalogue public
curl http://localhost:8000/api/products
curl http://localhost:8000/api/categories
curl http://localhost:8000/api/vendors

# Login
curl -X POST http://localhost:8000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"alain@horizonlocal.ca","password":"changeme"}'
```

## Licence

Propriétaire — Digital Zeph / Alain SAWADOGO.
