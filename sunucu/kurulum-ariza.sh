#!/usr/bin/env bash
# Arıza Defteri'ni ortak altyapıya kurar: https://ariza.ysfdurak.com
# yusuf kullanıcısıyla çalıştırılır. Tekrar çalıştırmak güvenlidir (günceller, .env'e dokunmaz).
# Ayrıntı: github.com/ysfdurak/ariza-defteri → docs/SUNUCU_KURULUMU.md
set -euo pipefail
DIZIN=~/ariza-defteri

echo "== 1/4 Kod =="
if [[ -d $DIZIN/.git ]]; then git -C $DIZIN pull -q; else git clone -q https://github.com/ysfdurak/ariza-defteri.git $DIZIN; fi
cd $DIZIN

echo "== 2/4 Ayarlar (.env) =="
if [[ ! -f .env ]]; then
  # Anahtarlar burada üretilir, ekrana yazılmaz; gerektiğinde .env'den okunur (Nabız'a yazma, Claude'a MCP anahtarı).
  umask 077
  sed -e "s|^YAZMA_ANAHTARLARI=.*|YAZMA_ANAHTARLARI=$(openssl rand -hex 32)|" \
      -e "s|^MCP_ENABLED=.*|MCP_ENABLED=true|" \
      -e "s|^MCP_ANAHTARLARI=.*|MCP_ANAHTARLARI=$(openssl rand -hex 32)|" \
      .env.example > .env
  echo ".env oluşturuldu (yalnızca sen okuyabilirsin). Anahtarlar: grep ANAHTAR ~/ariza-defteri/.env"
else
  echo ".env zaten var, dokunulmadı."
fi

echo "== 3/4 Arıza Defteri derleniyor ve başlatılıyor (ilk açılışta 360 günlük geçmiş üretilir) =="
cd deploy && sudo docker compose -f docker-compose.ortak.yml up -d --build

echo "== 4/4 Caddy yönlendirmesi =="
cd ~/ysfdurak.com && git pull -q && cd sunucu/altyapi && sudo docker compose restart caddy

for i in {1..30}; do
  sudo docker exec ariza-defteri node -e "fetch('http://127.0.0.1:8080/healthz').then(r=>process.exit(r.ok?0:1)).catch(()=>process.exit(1))" 2>/dev/null && break
  sleep 2
done
sudo docker logs --tail 10 ariza-defteri
echo
echo "TAMAM. 1-2 dakika sonra aç: https://ariza.ysfdurak.com"
echo "Elle yeniden üretim: sudo docker exec ariza-defteri node --disable-warning=ExperimentalWarning tools/uret.js --gun 30 --yeniden"
