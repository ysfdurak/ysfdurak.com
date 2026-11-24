#!/usr/bin/env bash
# Nabız Analiz'i (Python: güvenilirlik ve bakım aralığı) ortak altyapıya kurar. Dışarı açılmaz (Caddy bloğu yok):
# Nabız iç ağdan http://nabiz-analiz:8000 ile okur. Önce Arıza Defteri kurulu olmalı. Tekrar çalıştırmak güvenlidir.
# Ayrıntı: github.com/ysfdurak/nabiz-analiz → docs/SUNUCU_KURULUMU.md
set -euo pipefail
DIZIN=~/nabiz-analiz

echo "== 1/3 Kod =="
if [[ -d $DIZIN/.git ]]; then git -C $DIZIN pull -q; else git clone -q https://github.com/ysfdurak/nabiz-analiz.git $DIZIN; fi
cd $DIZIN

echo "== 2/3 Ayarlar (.env) =="
if [[ ! -f .env ]]; then
  umask 077
  cp .env.example .env
  echo ".env oluşturuldu (MCP kapalı; Claude'a Nabız'ın MCP'si üzerinden ulaşılır)."
else
  echo ".env zaten var, dokunulmadı."
fi

echo "== 3/3 Derleniyor ve başlatılıyor =="
cd deploy && sudo docker compose -f docker-compose.ortak.yml up -d --build
for i in {1..30}; do
  sudo docker exec nabiz-analiz python -c "import urllib.request,sys; sys.exit(0 if urllib.request.urlopen('http://127.0.0.1:8000/healthz', timeout=3).status==200 else 1)" 2>/dev/null && break
  sleep 2
done
sudo docker logs --tail 5 nabiz-analiz

# Nabız'a adresini bildir (yoksa) ve Nabız'ı yeniden başlat
if [[ -f ~/nabiz/.env ]] && ! grep -q '^ANALIZ_URL=http' ~/nabiz/.env; then
  sed -i 's|^ANALIZ_URL=.*|ANALIZ_URL=http://nabiz-analiz:8000|' ~/nabiz/.env
  grep -q '^ANALIZ_URL=' ~/nabiz/.env || echo 'ANALIZ_URL=http://nabiz-analiz:8000' >> ~/nabiz/.env
  (cd ~/nabiz/deploy && sudo docker compose -f docker-compose.ortak.yml up -d)
  echo "Nabız'a ANALIZ_URL eklendi ve yeniden başlatıldı."
fi
echo
echo "TAMAM. Kontrol: https://nabiz.ysfdurak.com/#/analiz"
