#!/usr/bin/env bash
# Kalkan'ı ortak altyapıya kurar: https://kalkan.ysfdurak.com
# yusuf kullanıcısıyla çalıştırılır. Tekrar çalıştırmak güvenlidir (günceller, .env'e dokunmaz).
# Ayrıntı: github.com/ysfdurak/kalkan → docs/SUNUCU_KURULUMU.md
set -euo pipefail
DIZIN=~/kalkan

echo "== 1/4 Kod =="
if [[ -d $DIZIN/.git ]]; then git -C $DIZIN pull -q; else git clone -q https://github.com/ysfdurak/kalkan.git $DIZIN; fi
cd $DIZIN

echo "== 2/4 Ayarlar (.env) =="
if [[ ! -f .env ]]; then
  # Demo modu: ziyaretçi başına sentetik alan, giriş yok. MCP anahtarı burada üretilir, ekrana yazılmaz.
  umask 077
  sed -e "s|^MCP_ENABLED=.*|MCP_ENABLED=true|" \
      -e "s|^MCP_ANAHTARLARI=.*|MCP_ANAHTARLARI=$(openssl rand -hex 32)|" \
      .env.example > .env
  echo ".env oluşturuldu (yalnızca sen okuyabilirsin). MCP anahtarı: grep MCP_ANAHTARLARI ~/kalkan/.env"
else
  echo ".env zaten var, dokunulmadı."
fi

echo "== 3/4 Kalkan derleniyor ve başlatılıyor =="
cd deploy && sudo docker compose -f docker-compose.ortak.yml up -d --build

echo "== 4/4 Caddy yönlendirmesi =="
cd ~/ysfdurak.com && git pull -q && cd sunucu/altyapi && sudo docker compose restart caddy

for i in {1..30}; do
  sudo docker exec kalkan node -e "fetch('http://127.0.0.1:8080/healthz').then(r=>process.exit(r.ok?0:1)).catch(()=>process.exit(1))" 2>/dev/null && break
  sleep 2
done
sudo docker logs --tail 10 kalkan
echo
echo "TAMAM. 1-2 dakika sonra aç: https://kalkan.ysfdurak.com (\"Deneme alanını aç\")"
