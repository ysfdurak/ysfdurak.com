#!/usr/bin/env bash
# Yeni proje için veritabanı ve kullanıcı oluşturur, bağlantı adresini yazdırır.
# Kullanım: bash db-olustur.sh pusula
set -euo pipefail
AD="${1:?Proje adı ver, ör: bash db-olustur.sh pusula}"
[[ "$AD" =~ ^[a-z][a-z0-9_]{1,30}$ ]] || { echo "Ad yalnızca küçük harf, rakam ve _ içermeli." >&2; exit 1; }
SIFRE=$(openssl rand -hex 24)
sudo docker exec -i postgres psql -U admin -v ON_ERROR_STOP=1 <<SQL
CREATE ROLE "$AD" LOGIN PASSWORD '$SIFRE';
CREATE DATABASE "$AD" OWNER "$AD";
REVOKE ALL ON DATABASE "$AD" FROM PUBLIC;
SQL
echo
echo "Oluşturuldu. Projenin .env dosyasına ekle (bir daha gösterilmez):"
echo "DATABASE_URL=postgres://$AD:$SIFRE@postgres:5432/$AD"
