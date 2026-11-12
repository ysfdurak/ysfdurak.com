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

# --s3-no-head: R2, yüklemeden sonra rclone'un yaptığı "versionId" kontrolünü desteklemiyor (501).
# Bu kontrol yerine dosyanın R2'deki boyutunu aşağıda kendimiz doğruluyoruz.
rclone copy "$DOSYA" "r2:$R2_BUCKET/postgres/" --s3-no-check-bucket --s3-no-head
YEREL=$(stat -c %s "$DOSYA")
UZAK=$(rclone size "r2:$R2_BUCKET/postgres/$(basename "$DOSYA")" --json --s3-no-check-bucket | grep -o '"bytes":[0-9]*' | cut -d: -f2)
[[ "$YEREL" == "$UZAK" ]] || { echo "R2'deki dosya boyutu tutmuyor ($YEREL / $UZAK)" >&2; exit 1; }

# SQLite kullanan uygulamalar: kendi aldıkları en yeni yedeği de R2'ye gönder
for UYG in pusula; do
  docker ps --format '{{.Names}}' | grep -qx "$UYG" || continue
  SON=$(docker exec "$UYG" sh -c "ls -1 /data/backups/$UYG-*.db 2>/dev/null | tail -1")
  [[ -n "$SON" ]] || { echo "$UYG: yedek bulunamadı" >&2; continue; }
  HEDEF="$YER/${UYG}_$ZAMAN.db.gz"
  docker exec "$UYG" cat "$SON" | gzip -9 > "$HEDEF"
  gzip -t "$HEDEF"
  rclone copy "$HEDEF" "r2:$R2_BUCKET/$UYG/" --s3-no-check-bucket --s3-no-head
  rclone delete "r2:$R2_BUCKET/$UYG/" --min-age 30d --s3-no-check-bucket
  echo "$UYG yedeği: $(basename "$HEDEF") ($(du -h "$HEDEF" | cut -f1))"
done

# Sunucuda 7 gün, R2'de 30 gün sakla
find "$YER" \( -name '*.sql.gz' -o -name '*.db.gz' \) -mtime +7 -delete
rclone delete "r2:$R2_BUCKET/postgres/" --min-age 30d --s3-no-check-bucket

echo "$(date -Is) yedek tamam: $(basename "$DOSYA") ($(du -h "$DOSYA" | cut -f1))"
