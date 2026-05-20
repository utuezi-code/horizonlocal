# Guide de déploiement — Horizon Local

Configuration : **Frontend sur Vercel** + **API sur Railway** (avec PostgreSQL et Redis managés).

---

## Pré-requis

- Compte GitHub avec accès au dépôt `utuezi-code/horizonlocal`
- Compte [Railway](https://railway.app) (5 $ de crédit offerts, hobby ~5 $/mois)
- Compte [Vercel](https://vercel.com) (gratuit pour les projets perso)
- Compte [Stripe](https://stripe.com) en mode Test puis Live
- Compte [Resend](https://resend.com) pour les emails (gratuit jusqu'à 3 000 emails/mois)

---

## 1. Déployer l'API sur Railway

### 1.1 Créer le projet Railway

1. Va sur [railway.app/new](https://railway.app/new)
2. **Deploy from GitHub repo** → sélectionne `utuezi-code/horizonlocal`
3. Railway détecte le `Dockerfile` dans `/api` automatiquement
4. Dans **Settings** du service :
   - **Root Directory** : `/api`
   - **Watch Paths** : `api/**` (pour ne re-déployer que sur changements API)

### 1.2 Ajouter PostgreSQL

1. Dans le projet Railway, clique **+ New** → **Database** → **Add PostgreSQL**
2. Railway crée automatiquement une variable `DATABASE_URL`
3. Dans le service `api`, va dans **Variables** → **Reference Variables** :
   - Sélectionne la variable `DATABASE_URL` du service Postgres
   - Ou crée manuellement : `DB_HOST`, `DB_PORT`, `DB_DATABASE`, `DB_USERNAME`, `DB_PASSWORD` à partir de `${{Postgres.PGHOST}}` etc.

### 1.3 Ajouter Redis

1. **+ New** → **Database** → **Add Redis**
2. Référence `REDIS_URL` dans le service `api`, ou décompose en `REDIS_HOST`, `REDIS_PORT`, `REDIS_PASSWORD`

### 1.4 Configurer les variables d'environnement du service `api`

Dans Railway → service `api` → **Variables** :

```env
APP_NAME=Horizon Local
APP_ENV=production
APP_KEY=                     # Générer : php artisan key:generate --show
APP_DEBUG=false
APP_URL=https://${{RAILWAY_PUBLIC_DOMAIN}}
APP_LOCALE=fr
APP_FALLBACK_LOCALE=fr

DB_CONNECTION=pgsql
DB_HOST=${{Postgres.PGHOST}}
DB_PORT=${{Postgres.PGPORT}}
DB_DATABASE=${{Postgres.PGDATABASE}}
DB_USERNAME=${{Postgres.PGUSER}}
DB_PASSWORD=${{Postgres.PGPASSWORD}}

REDIS_HOST=${{Redis.REDISHOST}}
REDIS_PORT=${{Redis.REDISPORT}}
REDIS_PASSWORD=${{Redis.REDISPASSWORD}}
CACHE_STORE=redis
SESSION_DRIVER=redis
QUEUE_CONNECTION=redis

STRIPE_KEY=pk_live_xxx
STRIPE_SECRET=sk_live_xxx
STRIPE_WEBHOOK_SECRET=whsec_xxx

MAIL_MAILER=resend
RESEND_API_KEY=re_xxx
MAIL_FROM_ADDRESS=noreply@horizonlocal.ca
MAIL_FROM_NAME=Horizon Local

FRONTEND_URL=https://horizonlocal.ca       # à remplacer par l'URL Vercel ensuite
SANCTUM_STATEFUL_DOMAINS=horizonlocal.ca,horizonlocal.vercel.app

PORT=8080
```

Pour générer `APP_KEY` localement :
```bash
cd api
php artisan key:generate --show
# Copie la valeur retournée (commence par "base64:...")
```

### 1.5 Activer le domaine public

1. Service `api` → **Settings** → **Networking** → **Generate Domain**
2. Railway génère une URL du type `horizonlocal-api-production.up.railway.app`
3. Note-la, tu en auras besoin pour Vercel

### 1.6 Premier déploiement

Railway déploie automatiquement à chaque push sur `main`. Le `Dockerfile` exécute :
- `php artisan migrate --force` (au démarrage)
- `php artisan config:cache`
- Démarre nginx + php-fpm + queue worker + scheduler via supervisord

### 1.7 Seeders (une seule fois en prod)

Connecte-toi à la console du service `api` via Railway → **Shell** :
```bash
php artisan db:seed --force
```

**⚠️ Changer immédiatement les mots de passe des comptes seedés** (`changeme`) :
```bash
php artisan tinker
> $user = App\Models\User::where('email', 'alain@horizonlocal.ca')->first();
> $user->password = Hash::make('mot-de-passe-fort');
> $user->save();
```

---

## 2. Déployer le frontend sur Vercel

### 2.1 Importer le repo

1. Va sur [vercel.com/new](https://vercel.com/new)
2. **Import Git Repository** → `utuezi-code/horizonlocal`
3. **Root Directory** : `frontend`
4. **Framework Preset** : Next.js (auto-détecté)
5. **Build Command** : `npm run build` (par défaut)
6. **Output Directory** : laisser par défaut

### 2.2 Variables d'environnement Vercel

Dans **Settings** → **Environment Variables** :

```env
NEXT_PUBLIC_API_URL=https://horizonlocal-api-production.up.railway.app/api
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_xxx
NEXT_PUBLIC_APP_NAME=Horizon Local
```

> Remplace l'URL par celle générée à l'étape 1.5.

### 2.3 Déploiement automatique

Vercel déploie automatiquement à chaque push sur `main`. L'URL initiale est du type :
`horizonlocal-frontend.vercel.app`

### 2.4 Domaine personnalisé (optionnel)

Si tu as `horizonlocal.ca` :
1. Vercel → **Domains** → ajouter `horizonlocal.ca` (frontend)
2. Railway → ajouter `api.horizonlocal.ca` (sous-domaine API)
3. Mettre à jour les DNS chez ton registrar :
   - `horizonlocal.ca` → CNAME vers `cname.vercel-dns.com`
   - `api.horizonlocal.ca` → CNAME vers le domaine Railway

### 2.5 Mettre à jour les CORS côté API

Dans Railway → service `api` → variables :
```env
FRONTEND_URL=https://horizonlocal-frontend.vercel.app
SANCTUM_STATEFUL_DOMAINS=horizonlocal-frontend.vercel.app,horizonlocal.ca
```

Redéploie l'API.

---

## 3. Configurer Stripe Connect

### 3.1 Stripe Dashboard

1. Va sur [dashboard.stripe.com](https://dashboard.stripe.com)
2. **Connect** → activer **Stripe Connect** (Express)
3. **Settings** → **Connect settings** → branding (logo Horizon Local, couleurs)

### 3.2 Webhook

1. **Developers** → **Webhooks** → **Add endpoint**
2. URL : `https://horizonlocal-api-production.up.railway.app/api/webhooks/stripe`
3. Events à écouter :
   - `payment_intent.succeeded`
   - `payment_intent.payment_failed`
   - `account.updated` (pour onboarding vendeur)
4. Copie le **Signing secret** → ajoute-le dans Railway comme `STRIPE_WEBHOOK_SECRET`

---

## 4. Configurer Resend (emails)

1. Va sur [resend.com](https://resend.com)
2. Crée un domaine vérifié : `horizonlocal.ca`
3. Ajoute les DNS records (SPF, DKIM) chez ton registrar
4. **API Keys** → créer une clé → ajoute-la dans Railway comme `RESEND_API_KEY`

---

## 5. Vérifier le déploiement

```bash
# Health check de l'API
curl https://horizonlocal-api-production.up.railway.app/api/health
# Réponse attendue : {"status":"ok","database":"ok","redis":"ok"}

# Catalogue public
curl https://horizonlocal-api-production.up.railway.app/api/categories

# Frontend
# Ouvre https://horizonlocal-frontend.vercel.app dans un navigateur
```

---

## 6. CI/CD automatique

Le workflow `.github/workflows/deploy.yml` est déjà en place :
- Tests Laravel (pgsql + redis) sur chaque PR
- Build Next.js sur chaque PR
- Déploiement Railway automatique sur `main`

Vercel se déclenche sur chaque push (pas besoin de configuration GitHub Actions séparée).

---

## 7. Coût estimé en production

| Service | Tier | Coût mensuel |
|---------|------|--------------|
| Railway (api + postgres + redis) | Hobby | ~5–10 $ |
| Vercel (frontend) | Hobby | 0 $ |
| Stripe Connect | Pay-per-use | 2,9 % + 0,30 $ par transaction |
| Resend | Free tier | 0 $ (3k emails/mois) |
| Domaine `.ca` (optionnel) | — | ~15 $/an |

**Total fixe : ~5–10 $/mois** + commissions Stripe par vente.

---

## Dépannage

**Migrations échouent au démarrage**
→ Vérifier que `DATABASE_URL` ou les `DB_*` pointent vers le service Postgres Railway (pas localhost).

**CORS bloque les requêtes du frontend**
→ Vérifier `FRONTEND_URL` et `SANCTUM_STATEFUL_DOMAINS` dans Railway.

**Le frontend ne reçoit pas les images**
→ Ajouter le hostname Railway dans `next.config.ts` → `images.remotePatterns`.

**Le webhook Stripe renvoie 400**
→ La signature ne correspond pas. Re-copier `STRIPE_WEBHOOK_SECRET` depuis Stripe Dashboard.

---

## Développement local (alternative)

Pour développer chez toi sans cloud :

```bash
git clone https://github.com/utuezi-code/horizonlocal.git
cd horizonlocal
docker compose up -d
# API : http://localhost:8000
# Frontend : http://localhost:3000
# Postgres : localhost:5432 (user: horizon / password: horizon)
# Redis : localhost:6379
```

Premier setup :
```bash
docker compose exec api php artisan key:generate
docker compose exec api php artisan migrate --seed
```
