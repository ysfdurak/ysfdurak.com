#!/usr/bin/env bash
# Pusula'yı ortak altyapıya kurar: https://pusula.ysfdurak.com
# yusuf kullanıcısıyla çalıştırılır. Tekrar çalıştırmak güvenlidir (günceller).
set -euo pipefail
DIZIN=~/pusula-is-takip

echo "== 1/4 Kod =="
if [[ -d $DIZIN/.git ]]; then git -C $DIZIN pull -q; else git clone -q https://github.com/ysfdurak/pusula-is-takip.git $DIZIN; fi
cd $DIZIN

echo "== 2/4 Ayarlar (.env) =="
if [[ ! -f .env ]]; then
  read -rp  "Yönetici Google e-posta adresin: " ADMIN
  read -rp  "Google Client ID: " GID
  read -rsp "Google Client secret (görünmez): " GSECRET; echo
  umask 077
  cat > .env <<ENV
APP_URL=https://pusula.ysfdurak.com/
PORT=8080
PUSULA_ADMINS=$ADMIN
PUSULA_WORKSPACE_NAME=Pusula
AUTH_MODE=google
GOOGLE_CLIENT_ID=$GID
GOOGLE_CLIENT_SECRET=$GSECRET
SESSION_HOURS=10
SESSION_IDLE_MINUTES=120
MAX_FILE_MB=5
MAIL_MODE=off
DATA_DIR=/data
BACKUP_KEEP=14
DEMO_MODE=true
DEMO_TTL_DAYS=7
DEMO_MAX_SANDBOXES=300
ANALYTICS_RETENTION_DAYS=180
MCP_ENABLED=true
ENV
  echo ".env oluşturuldu."
else
  echo ".env zaten var, dokunulmadı."
fi

echo "== 3/4 Pusula derleniyor ve başlatılıyor (ilk derleme 2-4 dakika) =="
cd deploy && sudo docker compose -f docker-compose.ortak.yml up -d --build

echo "== 4/4 Caddy yönlendirmesi =="
cd ~/ysfdurak.com && git pull -q && cd sunucu/altyapi && sudo docker compose restart caddy

for i in {1..30}; do
  sudo docker exec pusula node -e "fetch('http://127.0.0.1:8080/healthz').then(r=>process.exit(r.ok?0:1)).catch(()=>process.exit(1))" 2>/dev/null && break
  sleep 2
done
sudo docker logs --tail 15 pusula
echo
echo "TAMAM. 1-2 dakika sonra aç: https://pusula.ysfdurak.com"
