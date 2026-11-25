#!/usr/bin/env bash
# Emanet + Usta'yı (Python: çağrı yönlendirme ve kişiye bağımlılık riski) ortak altyapıya kurar: https://emanet.ysfdurak.com
# yusuf kullanıcısıyla çalıştırılır. Tekrar çalıştırmak güvenlidir (günceller, .env'e dokunmaz).
# Ayrıntı: github.com/ysfdurak/emanet → deploy/KURULUM.md
set -euo pipefail
DIZIN=~/emanet

echo "== 1/4 Kod =="
if [[ -d $DIZIN/.git ]]; then git -C $DIZIN pull -q; else git clone -q https://github.com/ysfdurak/emanet.git $DIZIN; fi
cd $DIZIN

echo "== 2/4 Ayarlar (.env) =="
if [[ ! -f .env ]]; then
  # MCP anahtarı burada üretilir, ekrana yazılmaz. Claude'a bağlarken: grep MCP ~/emanet/.env
  umask 077
  sed -e "s|^EMANET_MCP_ANAHTARLARI=.*|EMANET_MCP_ANAHTARLARI=$(openssl rand -hex 32)|" .env.example > .env
  echo ".env oluşturuldu (yalnızca sen okuyabilirsin). MCP adresi: https://emanet.ysfdurak.com/mcp/<anahtar>"
else
  echo ".env zaten var, dokunulmadı."
fi

echo "== 3/4 Emanet derleniyor ve başlatılıyor (ilk derleme 2-4 dakika: scikit-learn) =="
cd deploy && sudo docker compose -f docker-compose.ortak.yml up -d --build

echo "== 4/4 Caddy yönlendirmesi =="
cd ~/ysfdurak.com && git pull -q && cd sunucu/altyapi && sudo docker compose restart caddy

# İlk açılışta demo verisi üretilir ve model eğitilir (10-30 sn)
for i in {1..45}; do
  sudo docker exec emanet python -c "import urllib.request,sys; sys.exit(0 if urllib.request.urlopen('http://127.0.0.1:8000/healthz', timeout=3).status==200 else 1)" 2>/dev/null && break
  sleep 2
done
sudo docker logs --tail 10 emanet
echo
echo "TAMAM. 1-2 dakika sonra aç: https://emanet.ysfdurak.com"
echo "Kontrol: iki ayrı tarayıcıda çağrı aç; biri ötekinin çağrısını görmemeli (ziyaretçi demosu)."
