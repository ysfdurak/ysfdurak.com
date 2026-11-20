#!/usr/bin/env bash
# Ölçüm servisini ortak altyapıya kurar: https://olcum.ysfdurak.com
# Önce Cloudflare'de: "olcum" için A kaydı (sunucu IP'si, proxy açık).
# yusuf kullanıcısıyla çalıştırılır. Tekrar çalıştırmak güvenlidir (günceller, .env'e dokunmaz).
set -euo pipefail
cd ~/ysfdurak.com && git pull -q
cd olcum

echo "== 1/3 Ayarlar (.env) =="
if [[ ! -f .env ]]; then
  umask 077
  SIFRE=$(openssl rand -base64 18 | tr -d '/+=')
  sed -e "s|^PANEL_SIFRE=.*|PANEL_SIFRE=$SIFRE|" .env.example > .env
  echo "Panel şifresi oluşturuldu. Bir kez gösteriliyor, parola yöneticine kaydet:"
  echo "    kullanıcı: panel   şifre: $SIFRE"
  unset SIFRE
else
  echo ".env zaten var, dokunulmadı. Şifreyi görmek için: grep PANEL_SIFRE ~/ysfdurak.com/olcum/.env"
fi

echo "== 2/3 Derleniyor ve başlatılıyor =="
sudo docker compose up -d --build

echo "== 3/3 Caddy yönlendirmesi =="
cd ~/ysfdurak.com/sunucu/altyapi && sudo docker compose restart caddy

for i in {1..20}; do
  sudo docker exec olcum node -e "fetch('http://127.0.0.1:8080/healthz').then(r=>process.exit(r.ok?0:1)).catch(()=>process.exit(1))" 2>/dev/null && break
  sleep 2
done
sudo docker logs --tail 5 olcum
echo
echo "TAMAM. Panel: https://olcum.ysfdurak.com/panel (kullanıcı adı: panel)"
# Gece yedeğinin güncel hali (ölçüm veritabanı da R2'ye gider)
sudo install -m 755 ~/ysfdurak.com/sunucu/yedek.sh /usr/local/bin/ysf-yedek
echo "Gece yedeği güncellendi: ölçüm veritabanı da R2'ye gidiyor."
