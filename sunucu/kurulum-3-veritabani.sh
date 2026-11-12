#!/usr/bin/env bash
# 3. aşama: PostgreSQL ve Cloudflare R2'ye gece yedeği.
# yusuf kullanıcısıyla çalıştırılır.
set -euo pipefail
cd ~/ysfdurak.com && git pull -q
cd sunucu/altyapi

echo "== 1/4 Veritabanı şifresi =="
if ! grep -q '^POSTGRES_PASSWORD=' .env; then
  umask 077; echo "POSTGRES_PASSWORD=$(openssl rand -hex 32)" >> .env
  echo "Üretildi ve .env dosyasına yazıldı."
else
  echo "Zaten var, dokunulmadı."
fi

echo "== 2/4 PostgreSQL başlatılıyor =="
sudo docker compose up -d
for i in {1..30}; do
  sudo docker exec postgres pg_isready -U admin -q && break; sleep 2
done
sudo docker exec postgres pg_isready -U admin

echo "== 3/4 Yedek ayarları (Cloudflare R2) =="
sudo apt-get install -y -q rclone
if [[ ! -f /etc/ysf-yedek.env ]]; then
  read -rp  "R2 bucket adı: " BUCKET
  read -rp  "R2 S3 endpoint (https://... ile başlayan): " ENDPOINT
  read -rp  "Access Key ID: " KEYID
  read -rsp "Secret Access Key (görünmez): " SECRET; echo
  sudo install -m 600 /dev/null /etc/ysf-yedek.env
  sudo tee /etc/ysf-yedek.env >/dev/null <<ENV
R2_BUCKET=$BUCKET
export RCLONE_CONFIG_R2_TYPE=s3
export RCLONE_CONFIG_R2_PROVIDER=Cloudflare
export RCLONE_CONFIG_R2_ENDPOINT=$ENDPOINT
export RCLONE_CONFIG_R2_ACCESS_KEY_ID=$KEYID
export RCLONE_CONFIG_R2_SECRET_ACCESS_KEY=$SECRET
ENV
else
  echo "/etc/ysf-yedek.env zaten var, dokunulmadı."
fi
sudo install -m 755 ../yedek.sh /usr/local/bin/ysf-yedek
echo '30 3 * * * root /usr/local/bin/ysf-yedek >> /var/log/ysf-yedek.log 2>&1' | sudo tee /etc/cron.d/ysf-yedek >/dev/null

echo "== 4/4 İlk yedek deneniyor =="
sudo /usr/local/bin/ysf-yedek
echo
echo "TAMAM. PostgreSQL çalışıyor, yedek her gece 03:30'da R2'ye gidecek."
echo "Kayıtlar: sudo tail /var/log/ysf-yedek.log"
