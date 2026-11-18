#!/usr/bin/env bash
# Ortak ölçüm ve geri bildirim servisini kurar ya da günceller: https://olcum.ysfdurak.com
# Önce Cloudflare DNS'te "olcum" için A kaydı (sunucu IP'si, proxy açık) açılmış olmalı.
# yusuf kullanıcısıyla çalıştırılır. Tekrar çalıştırmak güvenlidir (günceller, .env'e dokunmaz).
set -euo pipefail
DIZIN=~/ysfdurak.com/sunucu/olcum

echo "== 1/4 Kod =="
git -C ~/ysfdurak.com pull -q
cd $DIZIN

echo "== 2/4 Veritabanı ve ayarlar (.env) =="
if [[ ! -f .env ]]; then
  DB_SIFRE=$(openssl rand -hex 24)
  YONETIM_SIFRE=$(openssl rand -base64 18 | tr -d '/+=' | cut -c1-20)
  # Rol varsa yalnızca şifresi yenilenir; yoksa rol ve veritabanı oluşturulur.
  if sudo docker exec postgres psql -U admin -tAc "SELECT 1 FROM pg_roles WHERE rolname='olcum'" | grep -q 1; then
    sudo docker exec -i postgres psql -U admin -v ON_ERROR_STOP=1 -c "ALTER ROLE olcum PASSWORD '$DB_SIFRE';" >/dev/null
  else
    sudo docker exec -i postgres psql -U admin -v ON_ERROR_STOP=1 >/dev/null <<SQL
CREATE ROLE olcum LOGIN PASSWORD '$DB_SIFRE';
CREATE DATABASE olcum OWNER olcum;
REVOKE ALL ON DATABASE olcum FROM PUBLIC;
SQL
  fi
  umask 077
  sed -e "s|^DATABASE_URL=.*|DATABASE_URL=postgres://olcum:$DB_SIFRE@postgres:5432/olcum|" \
      -e "s|^YONETIM_SIFRE=.*|YONETIM_SIFRE=$YONETIM_SIFRE|" \
      .env.example > .env
  unset DB_SIFRE
  echo ".env oluşturuldu (yalnızca sen okuyabilirsin)."
  YENI=1
else
  echo ".env zaten var, dokunulmadı."
  YENI=0
fi

echo "== 3/4 Ölçüm servisi derleniyor ve başlatılıyor =="
sudo docker compose up -d --build

echo "== 4/4 Caddy yönlendirmesi =="
cd ~/ysfdurak.com/sunucu/altyapi && sudo docker compose restart caddy

for i in {1..30}; do
  sudo docker exec olcum wget -qO- http://127.0.0.1:8080/saglik >/dev/null 2>&1 && break
  sleep 2
done
sudo docker logs --tail 5 olcum
echo
echo "TAMAM. Yönetim sayfası: https://olcum.ysfdurak.com/yonetim"
if [[ $YENI == 1 ]]; then
  echo "Kullanıcı adı: yusuf"
  echo "Şifre: $YONETIM_SIFRE"
  echo "Şifreyi şimdi bir şifre yöneticisine kaydet. Unutursan: grep YONETIM_SIFRE $DIZIN/.env"
fi
