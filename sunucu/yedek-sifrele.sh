#!/usr/bin/env bash
# Gece yedeklerini R2'ye göndermeden önce şifrelemeyi açar (rclone crypt, istemci tarafında).
# Bir kez çalıştırılır: iki rastgele şifre üretir, bir kez gösterir ve /etc/ysf-yedek.env dosyasına ekler.
# Şifreleri parola yöneticine kaydet: sunucu kaybolursa yedekleri yalnız bu şifrelerle açabilirsin.
# Kullanım: sudo bash yedek-sifrele.sh
set -euo pipefail
ENV=/etc/ysf-yedek.env
[[ $EUID -eq 0 ]] || { echo "sudo ile çalıştır: sudo bash $0" >&2; exit 1; }
[[ -f $ENV ]] || { echo "$ENV yok. Önce kurulum-3-veritabani.sh çalıştırılmalı." >&2; exit 1; }
if grep -q '^export RCLONE_CONFIG_R2S_TYPE=crypt' "$ENV"; then echo "Şifreleme zaten açık ($ENV)."; exit 0; fi
command -v rclone >/dev/null || { echo "rclone kurulu değil." >&2; exit 1; }
source "$ENV"
S1=$(openssl rand -base64 33 | tr -d '\n/+=' | cut -c1-40)
S2=$(openssl rand -base64 33 | tr -d '\n/+=' | cut -c1-40)
umask 077
cat >> "$ENV" <<AYAR
# Yedek şifreleme (yedek-sifrele.sh, $(date -I)): R2'de r2:$R2_BUCKET/sifreli altında, dosya adları okunur kalır.
export RCLONE_CONFIG_R2S_TYPE=crypt
export RCLONE_CONFIG_R2S_REMOTE=r2:$R2_BUCKET/sifreli
export RCLONE_CONFIG_R2S_PASSWORD=$(rclone obscure "$S1")
export RCLONE_CONFIG_R2S_PASSWORD2=$(rclone obscure "$S2")
export RCLONE_CONFIG_R2S_FILENAME_ENCRYPTION=off
export RCLONE_CONFIG_R2S_DIRECTORY_NAME_ENCRYPTION=false
AYAR
chmod 600 "$ENV"
cat <<MESAJ

Şifreleme açıldı. Bu iki şifreyi ŞİMDİ parola yöneticine kaydet (bir daha gösterilmez):

  Yedek şifresi 1 (password):  $S1
  Yedek şifresi 2 (salt):      $S2

Sunucu kaybolursa yedeği başka bir bilgisayarda açmak: README → "Yedekten geri dönüş".
Şimdi bir yedek alıp deneyelim: sudo ysf-yedek
MESAJ
