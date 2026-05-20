#!/usr/bin/env bash
# Horizon Local - Installation automatique sur VM Ubuntu 22.04 / 24.04
# Usage : bash deploy-ubuntu.sh
#
# Pre-requis : VM Ubuntu fraichement installee, user avec sudo (ex: azureuser)
# Ouvrir ports : 22 (SSH), 80 (HTTP), 443 (HTTPS), 3000 (frontend dev), 8000 (api)

set -euo pipefail

REPO_URL="${REPO_URL:-https://github.com/utuezi-code/horizonlocal.git}"
APP_DIR="${APP_DIR:-/opt/horizonlocal}"
BRANCH="${BRANCH:-main}"

log() { echo -e "\033[1;34m[$(date +%H:%M:%S)]\033[0m $*"; }
err() { echo -e "\033[1;31m[ERREUR]\033[0m $*" >&2; exit 1; }

[[ $EUID -eq 0 ]] && err "Ne pas lancer en root. Utilise un user avec sudo."
command -v sudo >/dev/null || err "sudo manquant."

log "1/7 - Mise a jour systeme"
sudo apt-get update -qq
sudo apt-get upgrade -y -qq

log "2/7 - Installation outils (git, curl, ufw)"
sudo apt-get install -y -qq git curl ufw ca-certificates gnupg

log "3/7 - Installation Docker + Compose plugin"
if ! command -v docker >/dev/null; then
  curl -fsSL https://get.docker.com | sudo sh
  sudo usermod -aG docker "$USER"
  log "  Docker installe. Tu devras te reconnecter en SSH apres le script."
else
  log "  Docker deja present."
fi

log "4/7 - Configuration firewall (ufw)"
sudo ufw --force reset >/dev/null
sudo ufw default deny incoming
sudo ufw default allow outgoing
sudo ufw allow 22/tcp
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw allow 3000/tcp
sudo ufw allow 8000/tcp
sudo ufw --force enable

log "5/7 - Clone du repo dans $APP_DIR"
if [[ ! -d "$APP_DIR" ]]; then
  sudo mkdir -p "$APP_DIR"
  sudo chown "$USER:$USER" "$APP_DIR"
  git clone --branch "$BRANCH" "$REPO_URL" "$APP_DIR"
else
  log "  Repo deja present, pull des changements"
  cd "$APP_DIR" && git pull origin "$BRANCH"
fi

cd "$APP_DIR"

log "6/7 - Configuration .env API"
if [[ ! -f api/.env ]]; then
  cp api/.env.example api/.env
  PUBLIC_IP=$(curl -s ifconfig.me || echo "127.0.0.1")
  sed -i "s|^APP_URL=.*|APP_URL=http://${PUBLIC_IP}:8000|" api/.env
  sed -i "s|^FRONTEND_URL=.*|FRONTEND_URL=http://${PUBLIC_IP}:3000|" api/.env
  sed -i "s|^APP_ENV=.*|APP_ENV=production|" api/.env
  sed -i "s|^APP_DEBUG=.*|APP_DEBUG=false|" api/.env
  log "  api/.env cree (IP publique : ${PUBLIC_IP})"
fi

if [[ ! -f frontend/.env.local ]]; then
  PUBLIC_IP=$(curl -s ifconfig.me || echo "127.0.0.1")
  cat > frontend/.env.local <<EOF
NEXT_PUBLIC_API_URL=http://${PUBLIC_IP}:8000/api
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_xxx
NEXT_PUBLIC_APP_NAME=Horizon Local
EOF
  log "  frontend/.env.local cree"
fi

log "7/7 - Lancement de la stack Docker Compose"
# Si l'utilisateur vient juste d'etre ajoute au groupe docker, sg evite la reconnexion
if ! groups | grep -q docker; then
  log "  (Utilisation de 'sg docker' car groupe pas encore actif dans cette session)"
  sg docker -c "docker compose up -d --build"
  sleep 10
  sg docker -c "docker compose exec -T api php artisan key:generate --force"
  sg docker -c "docker compose exec -T api php artisan migrate --seed --force"
else
  docker compose up -d --build
  sleep 10
  docker compose exec -T api php artisan key:generate --force
  docker compose exec -T api php artisan migrate --seed --force
fi

PUBLIC_IP=$(curl -s ifconfig.me || echo "127.0.0.1")
echo ""
echo "=========================================================="
echo "  Horizon Local deploye !"
echo "=========================================================="
echo "  Frontend : http://${PUBLIC_IP}:3000"
echo "  API      : http://${PUBLIC_IP}:8000/api/health"
echo ""
echo "  Comptes seedes (mot de passe : changeme) :"
echo "    alain@horizonlocal.ca       (super_admin)"
echo "    admin@horizonlocal.ca       (admin)"
echo "    marketeur@horizonlocal.ca   (marketer)"
echo "    contact@colorantic.ca       (vendor)"
echo "    contact@jaytoutenbois.ca    (vendor)"
echo ""
echo "  Logs   : docker compose logs -f"
echo "  Stop   : docker compose down"
echo "=========================================================="
