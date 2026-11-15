#!/usr/bin/env bash
# Docker kayıt (log) dosyalarına boyut sınırı koyar: konteyner başına en fazla 3 × 10 MB.
# Sınır olmadan kayıtlar zamanla diski doldurabilir.
# yusuf kullanıcısıyla çalıştırılır. Tekrar çalıştırmak güvenlidir.
# DİKKAT: Docker yeniden başlatılır; tüm uygulamalar (Caddy, PostgreSQL, Pusula, Destek) 10-30 saniye kesilir.
set -euo pipefail
F=/etc/docker/daemon.json

echo "== 1/3 Docker ayarı =="
if sudo test -f $F && sudo grep -q '"max-size"' $F; then
  echo "Zaten ayarlı, dokunulmadı."
else
  sudo python3 - <<'PY'
import json, os
f = '/etc/docker/daemon.json'
text = open(f).read().strip() if os.path.exists(f) else ''
d = json.loads(text) if text else {}
d['log-driver'] = 'json-file'
d['log-opts'] = {'max-size': '10m', 'max-file': '3'}
with open(f, 'w') as out:
    json.dump(d, out, indent=2)
PY
  echo "== 2/3 Docker yeniden başlatılıyor =="
  sudo systemctl restart docker
fi

echo "== 3/3 Konteynerler yeni ayarla yeniden oluşturuluyor =="
# Sınır yalnızca yeniden oluşturulan konteynerlere uygulanır.
cd ~/ysfdurak.com/sunucu/altyapi && sudo docker compose up -d --force-recreate --no-build
[[ -d ~/pusula-is-takip/deploy ]] && (cd ~/pusula-is-takip/deploy && sudo docker compose -f docker-compose.ortak.yml up -d --force-recreate --no-build)
[[ -d ~/destek-merkezi/deploy ]] && (cd ~/destek-merkezi/deploy && sudo docker compose -f docker-compose.ortak.yml up -d --force-recreate --no-build)

sleep 5
echo
sudo docker ps --format 'table {{.Names}}\t{{.Status}}'
echo
for c in $(sudo docker ps --format '{{.Names}}'); do
  printf '%-12s %s\n' "$c" "$(sudo docker inspect --format '{{.HostConfig.LogConfig.Config}}' "$c")"
done
echo "TAMAM. Her satırda max-size:10m görünmeli."
