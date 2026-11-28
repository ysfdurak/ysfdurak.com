#!/usr/bin/env bash
# Termin Olasılığı'nı (Monte Carlo ile olasılıklı proje bitişi, web + MCP) ortak altyapıya kurar: https://termin.ysfdurak.com
# yusuf kullanıcısıyla çalıştırılır. Tekrar çalıştırmak güvenlidir (günceller, .env'e dokunmaz).
# Sunucu veri saklamaz: birim, veritabanı ve yedek yok. Ayrıntı: github.com/ysfdurak/termin-olasiligi → deploy/KURULUM.md
set -euo pipefail
DIZIN=~/termin-olasiligi

echo "== 1/4 Kod =="
if [[ -d $DIZIN/.git ]]; then git -C $DIZIN pull -q; else git clone -q https://github.com/ysfdurak/termin-olasiligi.git $DIZIN; fi
cd $DIZIN

echo "== 2/4 Ayarlar (.env) =="
if [[ ! -f .env ]]; then
  umask 077
  cp .env.example .env
  echo ".env oluşturuldu (gizli anahtar yok; sınırlar burada)."
else
  echo ".env zaten var, dokunulmadı."
fi

echo "== 3/4 Derleniyor ve başlatılıyor (ilk derleme 1-2 dakika) =="
cd deploy && sudo docker compose -f docker-compose.ortak.yml up -d --build

echo "== 4/4 Caddy yönlendirmesi =="
cd ~/ysfdurak.com && git pull -q && cd sunucu/altyapi && sudo docker compose restart caddy

for i in {1..30}; do
  sudo docker exec termin node -e "fetch('http://127.0.0.1:8080/healthz').then(r=>process.exit(r.ok?0:1)).catch(()=>process.exit(1))" 2>/dev/null && break
  sleep 2
done
sudo docker logs --tail 5 termin
echo
echo "TAMAM. 1-2 dakika sonra aç: https://termin.ysfdurak.com"
echo "Kontrol: curl -sI https://termin.ysfdurak.com | grep -i content-security"
echo "Claude: Ayarlar → Bağlayıcılar → Özel bağlayıcı ekle → https://termin.ysfdurak.com/mcp (oturum açma yok)"
echo "Ölçüm servisine yeni proje eklendi: bash ~/ysfdurak.com/sunucu/kurulum-olcum.sh"
