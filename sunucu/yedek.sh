#!/usr/bin/env bash
# Gece yedeği: tüm PostgreSQL veritabanlarını sıkıştırıp önce sunucuya, sonra Cloudflare R2'ye kopyalar.
# Sunucuda /usr/local/bin/ysf-yedek olarak durur; cron her gece 03:30'da çalıştırır.
set -euo pipefail
source /etc/ysf-yedek.env

YER=/var/backups/postgres
ZAMAN=$(date +%Y-%m-%d_%H%M)
DOSYA="$YER/tum-veritabanlari_$ZAMAN.sql.gz"
mkdir -p "$YER"

docker exec postgres pg_dumpall -U admin | gzip -9 > "$DOSYA"
# Boş ya da bozuk yedek olmasın: gzip bütünlüğü ve en az bir CREATE ifadesi
gzip -t "$DOSYA"
zgrep -q "CREATE ROLE" "$DOSYA" || { echo "Yedek beklenen içeriği taşımıyor: $DOSYA" >&2; exit 1; }

rclone copy "$DOSYA" "r2:$R2_BUCKET/postgres/" --s3-no-check-bucket

# Sunucuda 7 gün, R2'de 30 gün sakla
find "$YER" -name '*.sql.gz' -mtime +7 -delete
rclone delete "r2:$R2_BUCKET/postgres/" --min-age 30d --s3-no-check-bucket

echo "$(date -Is) yedek tamam: $(basename "$DOSYA") ($(du -h "$DOSYA" | cut -f1))"
