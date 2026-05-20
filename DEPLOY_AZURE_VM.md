# Déploiement sur VM Azure Ubuntu

Guide rapide pour déployer Horizon Local sur une VM Ubuntu (Azure, ou n'importe quel VPS).

---

## Pré-requis Azure

Avant de te connecter à la VM, vérifie côté Azure Portal :

### 1. Ports ouverts (Network Security Group)

Va dans : **Ta VM → Networking → Inbound port rules** et ajoute :

| Port | Protocole | Source | But |
|------|-----------|--------|-----|
| 22 | TCP | Mon IP uniquement | SSH |
| 80 | TCP | Any | HTTP (futur HTTPS) |
| 443 | TCP | Any | HTTPS |
| 3000 | TCP | Any | Frontend Next.js |
| 8000 | TCP | Any | API Laravel |

⚠️ Plus tard quand tu auras un domaine + Nginx, tu pourras fermer 3000 et 8000.

### 2. Taille VM recommandée

| Taille | vCPU | RAM | Coût/mois | Convient pour |
|--------|------|-----|-----------|---------------|
| B1ms | 1 | 2 GB | ~15 $ | Dev / test (limite) |
| **B2s** | 2 | 4 GB | ~30 $ | **Staging recommandé** |
| B2ms | 2 | 8 GB | ~60 $ | Prod légère |

---

## Installation en une commande

Connecte-toi à la VM en SSH :

```bash
ssh azureuser@<IP-publique-de-ta-VM>
```

Puis lance le script d'installation automatique :

```bash
curl -fsSL https://raw.githubusercontent.com/utuezi-code/horizonlocal/main/scripts/deploy-ubuntu.sh -o deploy.sh
bash deploy.sh
```

Le script s'occupe de :

1. Mise à jour Ubuntu
2. Installation Docker + Docker Compose
3. Configuration firewall (ufw)
4. Clone du repo dans `/opt/horizonlocal`
5. Création des fichiers `.env` avec ton IP publique
6. Build et lancement des 4 conteneurs (postgres, redis, api, frontend)
7. Migrations + seeders

**Durée totale : 5–8 minutes**

À la fin tu verras :

```
==========================================================
  Horizon Local deploye !
==========================================================
  Frontend : http://20.123.45.67:3000
  API      : http://20.123.45.67:8000/api/health
```

---

## Vérification

Depuis ton PC :

```bash
# Health check API
curl http://<IP>:8000/api/health
# Reponse attendue : {"status":"ok","database":"ok","redis":"ok"}

# Login test
curl -X POST http://<IP>:8000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"alain@horizonlocal.ca","password":"changeme"}'
```

Dans ton navigateur :

```
http://<IP>:3000
```

---

## Mise à jour du code (après un push GitHub)

```bash
ssh azureuser@<IP>
cd /opt/horizonlocal
git pull origin main
docker compose up -d --build
docker compose exec api php artisan migrate --force
```

---

## Commandes utiles

```bash
cd /opt/horizonlocal

# Voir les logs en temps reel
docker compose logs -f
docker compose logs -f api
docker compose logs -f frontend

# Redemarrer un service
docker compose restart api

# Arreter toute la stack
docker compose down

# Tout relancer
docker compose up -d

# Acceder a la console PHP de l'API
docker compose exec api php artisan tinker

# Acceder a la base Postgres
docker compose exec postgres psql -U horizon -d horizonlocal
```

---

## Sécuriser les mots de passe seedés

⚠️ Tous les comptes seedés ont le mot de passe `changeme`. Change-les immédiatement :

```bash
docker compose exec api php artisan tinker
```

Dans tinker :

```php
$u = App\Models\User::where('email', 'alain@horizonlocal.ca')->first();
$u->password = Hash::make('un-mot-de-passe-tres-fort');
$u->save();
exit
```

Répète pour les autres comptes admin.

---

## Backups Postgres (recommandé)

Crée un cron pour sauvegarder la base quotidiennement :

```bash
sudo nano /etc/cron.daily/backup-horizonlocal
```

Contenu :

```bash
#!/bin/bash
BACKUP_DIR=/var/backups/horizonlocal
mkdir -p $BACKUP_DIR
DATE=$(date +%Y%m%d-%H%M%S)
docker compose -f /opt/horizonlocal/docker-compose.yml exec -T postgres \
  pg_dump -U horizon horizonlocal | gzip > $BACKUP_DIR/db-$DATE.sql.gz
# Garde 7 jours
find $BACKUP_DIR -name "db-*.sql.gz" -mtime +7 -delete
```

```bash
sudo chmod +x /etc/cron.daily/backup-horizonlocal
```

Pour stocker hors VM, copie périodiquement vers Azure Blob Storage avec `azcopy`.

---

## Prochaines étapes (quand tu auras un domaine)

1. Pointer `horizonlocal.ca` (A record) vers l'IP publique de la VM
2. Installer Nginx + Certbot :
   ```bash
   sudo apt install -y nginx certbot python3-certbot-nginx
   ```
3. Créer un reverse proxy `/etc/nginx/sites-available/horizonlocal` qui pointe :
   - `horizonlocal.ca` → `localhost:3000`
   - `api.horizonlocal.ca` → `localhost:8000`
4. Générer les certificats : `sudo certbot --nginx -d horizonlocal.ca -d api.horizonlocal.ca`
5. Mettre à jour `APP_URL`, `FRONTEND_URL`, `SANCTUM_STATEFUL_DOMAINS` dans `api/.env`
6. Mettre à jour `NEXT_PUBLIC_API_URL` dans `frontend/.env.local`
7. Fermer les ports 3000 et 8000 dans le Network Security Group Azure
8. `docker compose restart`

---

## Dépannage

**Docker compose dit "permission denied"**
→ Tu dois te reconnecter en SSH après l'installation de Docker (le groupe `docker` n'est actif qu'après nouvelle session).

**Le frontend ne peut pas joindre l'API**
→ Vérifie que `NEXT_PUBLIC_API_URL` dans `frontend/.env.local` contient bien l'IP publique de la VM, pas `localhost`. Rebuild : `docker compose up -d --build frontend`.

**Migrations échouent**
→ Vérifie que Postgres est bien up : `docker compose ps`. Sinon : `docker compose logs postgres`.

**Port 3000 ou 8000 inaccessible depuis ton navigateur**
→ Vérifie le Network Security Group Azure : ces ports doivent être ouverts en inbound.

**La VM se fait attaquer / trop de tentatives SSH**
→ Installe `fail2ban` : `sudo apt install -y fail2ban && sudo systemctl enable --now fail2ban`
