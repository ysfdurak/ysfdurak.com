#!/usr/bin/env bash
# Destek Merkezi'ni ortak altyapıya kurar: https://destek.ysfdurak.com
# Ziyaretçi demo modunda çalışır: herkes giriş yapmadan kendine ait, örnek verili, geçici bir alan açar.
# yusuf kullanıcısıyla çalıştırılır. Tekrar çalıştırmak güvenlidir (günceller).
set -euo pipefail
DIZIN=~/destek-merkezi

echo "== 1/4 Kod =="
if [[ -d $DIZIN/.git ]]; then git -C $DIZIN pull -q; else git clone -q https://github.com/ysfdurak/destek-merkezi.git $DIZIN; fi
cd $DIZIN

echo "== 2/4 Ayarlar (.env) =="
if [[ ! -f .env ]]; then
  umask 077
  cat > .env <<ENV
DESTEK_BASE_URL=https://destek.ysfdurak.com
PORT=8080
DATA_DIR=/data
DEMO_MODE=true
DEMO_TTL_HOURS=72
DEMO_MAX=200
DEMO_PER_IP_HOUR=10
ENV
  echo ".env oluşturuldu (demo modu)."
else
  echo ".env zaten var, dokunulmadı."
fi

echo "== 3/4 Destek Merkezi derleniyor ve başlatılıyor (ilk derleme 1-3 dakika) =="
cd deploy && sudo docker compose -f docker-compose.ortak.yml up -d --build

echo "== 4/4 Caddy yönlendirmesi =="
cd ~/ysfdurak.com && git pull -q && cd sunucu/altyapi && sudo docker compose restart caddy

for i in {1..30}; do
  sudo docker exec destek node -e "fetch('http://127.0.0.1:8080/healthz').then(r=>process.exit(r.ok?0:1)).catch(()=>process.exit(1))" 2>/dev/null && break
  sleep 2
done
sudo docker logs --tail 10 destek
echo
echo "TAMAM. 1-2 dakika sonra aç: https://destek.ysfdurak.com"
echo "Demo sayaçları: sudo docker exec destek node server/demo-istatistik.mjs"
