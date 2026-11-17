#!/usr/bin/env bash
# Diyalog Atölyesi'ni ortak altyapıya kurar: https://diyalog.ysfdurak.com
# yusuf kullanıcısıyla çalıştırılır. Tekrar çalıştırmak güvenlidir (günceller, .env'e dokunmaz).
# Ayrıntı: github.com/ysfdurak/diyalog-atolyesi → docs/SUNUCU_KURULUMU.md
set -euo pipefail
DIZIN=~/diyalog-atolyesi

echo "== 1/4 Kod =="
if [[ -d $DIZIN/.git ]]; then git -C $DIZIN pull -q; else git clone -q https://github.com/ysfdurak/diyalog-atolyesi.git $DIZIN; fi
cd $DIZIN

echo "== 2/4 Ayarlar (.env) =="
if [[ ! -f .env ]]; then
  read -rsp "Anthropic API anahtarı (görünmez, sk-ant- ile başlar): " ANAHTAR; echo
  [[ $ANAHTAR == sk-ant-* ]] || { echo "Anahtar sk-ant- ile başlamalı. Tekrar çalıştır."; exit 1; }
  read -rp  "Yüklediğin kredi, USD (ör. 5; takip istemiyorsan 0): " KREDI
  KREDI=${KREDI:-0}
  KONU="diyalog-$(openssl rand -hex 8)"
  umask 077
  sed -e "s|^ANTHROPIC_API_KEY=.*|ANTHROPIC_API_KEY=$ANAHTAR|" \
      -e "s|^BILDIRIM_URL=.*|BILDIRIM_URL=https://ntfy.sh/$KONU|" \
      -e "s|^KREDI_USD=.*|KREDI_USD=$KREDI|" \
      -e "s|^KREDI_BASLANGIC=.*|KREDI_BASLANGIC=$(date +%F)|" \
      .env.example > .env
  unset ANAHTAR
  echo ".env oluşturuldu (yalnızca sen okuyabilirsin)."
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
echo "Telefon bildirimi: ntfy uygulamasında şu konuya abone ol → $(grep ^BILDIRIM_URL $DIZIN/.env | cut -d/ -f4)"
echo "Kullanım ve kredi: sudo docker exec diyalog node server/istatistik.js"
