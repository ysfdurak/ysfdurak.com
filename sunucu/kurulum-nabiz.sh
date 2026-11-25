#!/usr/bin/env bash
# Nabız'ı (depo ekipmanı TPM) ortak altyapıya kurar: https://nabiz.ysfdurak.com
# Önce Arıza Defteri kurulu olmalı (kurulum-ariza.sh). yusuf kullanıcısıyla çalıştırılır. Tekrar çalıştırmak güvenlidir.
# Ayrıntı: github.com/ysfdurak/nabiz → docs/SUNUCU_KURULUMU.md (Pusula hizmet hesabı dahil)
set -euo pipefail
DIZIN=~/nabiz

echo "== 1/4 Kod =="
if [[ -d $DIZIN/.git ]]; then git -C $DIZIN pull -q; else git clone -q https://github.com/ysfdurak/nabiz.git $DIZIN; fi
cd $DIZIN

echo "== 2/4 Ayarlar (.env) =="
if [[ ! -f .env ]]; then
  ARIZA_ANAHTAR=$(grep -s '^YAZMA_ANAHTARLARI=' ~/ariza-defteri/.env | cut -d= -f2 | cut -d, -f1 || true)
  [[ -n $ARIZA_ANAHTAR ]] || echo "Uyarı: Arıza Defteri yazma anahtarı bulunamadı; arıza bildirimi benzetim olur."
  read -rsp "Pusula hizmet anahtarı (Pusula .env MCP_TOKENS'taki nabiz@ satırı; boş = bağlantı kapalı, görünmez): " PUSULA; echo
  read -rp  "Pusula'da işlerin düşeceği ekip adı (boş olabilir): " EKIP
  umask 077
  sed -e "s|^ARIZA_DEFTERI_URL=.*|ARIZA_DEFTERI_URL=http://ariza-defteri:8080|" \
      -e "s|^ARIZA_YAZMA_ANAHTARI=.*|ARIZA_YAZMA_ANAHTARI=$ARIZA_ANAHTAR|" \
      -e "s|^PUSULA_MCP_URL=.*|PUSULA_MCP_URL=${PUSULA:+http://pusula:8080/mcp}|" \
      -e "s|^PUSULA_ANAHTARI=.*|PUSULA_ANAHTARI=$PUSULA|" \
      -e "s|^PUSULA_EKIP=.*|PUSULA_EKIP=$EKIP|" \
      -e "s|^SITE_SIFRESI=.*|SITE_SIFRESI=$(openssl rand -base64 18 | tr -d '/+=')|" \
      -e "s|^ANALIZ_URL=.*|ANALIZ_URL=http://nabiz-analiz:8000|" \
      -e "s|^MCP_ENABLED=.*|MCP_ENABLED=true|" \
      -e "s|^MCP_ANAHTARLARI=.*|MCP_ANAHTARLARI=$(openssl rand -hex 32)|" \
      .env.example > .env
  unset PUSULA ARIZA_ANAHTAR
  echo ".env oluşturuldu (yalnızca sen okuyabilirsin). Kurum girişi şifresi: grep SITE_SIFRESI ~/nabiz/.env"
else
  echo ".env zaten var, dokunulmadı."
fi

echo "== 3/4 Nabız derleniyor ve başlatılıyor =="
cd deploy && sudo docker compose -f docker-compose.ortak.yml up -d --build

echo "== 4/4 Caddy yönlendirmesi =="
cd ~/ysfdurak.com && git pull -q && cd sunucu/altyapi && sudo docker compose restart caddy

for i in {1..30}; do
  sudo docker exec nabiz node -e "fetch('http://127.0.0.1:8080/healthz').then(r=>process.exit(r.ok?0:1)).catch(()=>process.exit(1))" 2>/dev/null && break
  sleep 2
done
sudo docker logs --tail 10 nabiz
echo
echo "TAMAM. 1-2 dakika sonra aç: https://nabiz.ysfdurak.com  ·  QR etiketleri: https://nabiz.ysfdurak.com/#/qr"
