#!/usr/bin/env bash
# Diyalog Atölyesi'ni ortak altyapıya kurar: https://diyalog.ysfdurak.com
# Yapay zekâ karakteri için Anthropic API anahtarı ister (console.anthropic.com → API Keys).
# yusuf kullanıcısıyla çalıştırılır. Tekrar çalıştırmak güvenlidir (günceller, .env'e dokunmaz).
set -euo pipefail
DIZIN=~/diyalog-atolyesi

echo "== 1/4 Kod =="
if [[ -d $DIZIN/.git ]]; then git -C $DIZIN pull -q; else git clone -q https://github.com/ysfdurak/diyalog-atolyesi.git $DIZIN; fi
cd $DIZIN

echo "== 2/4 Ayarlar (.env) =="
if [[ ! -f .env ]]; then
  echo "Anthropic API anahtarını yapıştır ve Enter'a bas (yazarken ekranda görünmez):"
  read -rs ANAHTAR
  echo
  [[ $ANAHTAR == sk-ant-* ]] || { echo "Anahtar 'sk-ant-' ile başlamalı. Hiçbir şey kurulmadı; komutu yeniden çalıştır."; exit 1; }
  umask 077
  cat > .env <<ENV
APP_URL=https://diyalog.ysfdurak.com/
PORT=8080
DATA_DIR=/data
ANTHROPIC_API_KEY=$ANAHTAR
MODEL_MODE=anthropic
KARAKTER_MODELI=claude-haiku-5-5
DEGERLENDIRICI_MODELI=claude-haiku-5-5
ZIYARETCI_GUNLUK_OTURUM=3
SITE_GUNLUK_OTURUM=30
MCP_ENABLED=false
MCP_ANAHTARLARI=
MCP_GUNLUK_OTURUM=10
ENV
  unset ANAHTAR
  echo ".env oluşturuldu (yalnızca yusuf kullanıcısı okuyabilir)."
else
  echo ".env zaten var, dokunulmadı."
fi

echo "== 3/4 Diyalog Atölyesi derleniyor ve başlatılıyor (ilk derleme 1-3 dakika) =="
cd deploy && sudo docker compose -f docker-compose.ortak.yml up -d --build

echo "== 4/4 Caddy yönlendirmesi =="
cd ~/ysfdurak.com && git pull -q && cd sunucu/altyapi && sudo docker compose restart caddy

for i in {1..30}; do
  sudo docker exec diyalog node -e "fetch('http://127.0.0.1:8080/healthz').then(r=>process.exit(r.ok?0:1)).catch(()=>process.exit(1))" 2>/dev/null && break
  sleep 2
done
sudo docker logs --tail 10 diyalog
echo
echo "TAMAM. 1-2 dakika sonra aç: https://diyalog.ysfdurak.com"
echo "Kullanım ve tahmini maliyet: sudo docker exec diyalog node server/istatistik.js"
