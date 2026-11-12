#!/usr/bin/env bash
# 2. aşama: Docker kurulumu ve Caddy'nin başlatılması.
# yusuf kullanıcısıyla çalıştırılır (sudo şifresi sorulur).
set -euo pipefail

echo "== 1/4 Docker kuruluyor (resmi depodan) =="
sudo install -m 0755 -d /etc/apt/keyrings
sudo curl -fsSL https://download.docker.com/linux/ubuntu/gpg -o /etc/apt/keyrings/docker.asc
sudo chmod a+r /etc/apt/keyrings/docker.asc
KOD=$(. /etc/os-release && echo "${UBUNTU_CODENAME:-$VERSION_CODENAME}")
sudo tee /etc/apt/sources.list.d/docker.sources >/dev/null <<SRC
Types: deb
URIs: https://download.docker.com/linux/ubuntu
Suites: $KOD
Components: stable
Signed-By: /etc/apt/keyrings/docker.asc
SRC
sudo apt-get update -q
sudo apt-get install -y -q docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin git
sudo usermod -aG docker "$USER"

echo "== 2/4 Altyapı dosyaları indiriliyor =="
if [[ -d ~/ysfdurak.com/.git ]]; then
  git -C ~/ysfdurak.com pull -q
else
  git clone -q https://github.com/ysfdurak/ysfdurak.com.git ~/ysfdurak.com
fi
cd ~/ysfdurak.com/sunucu/altyapi

echo "== 3/4 Cloudflare token =="
if [[ ! -f .env ]]; then
  echo "Cloudflare API token'ını yapıştır ve Enter'a bas (ekranda görünmez):"
  read -rs TOKEN; echo
  [[ -n "$TOKEN" ]] || { echo "Token boş olamaz." >&2; exit 1; }
  umask 077; printf 'CF_API_TOKEN=%s\n' "$TOKEN" > .env
else
  echo ".env zaten var, dokunulmadı."
fi

echo "== 4/4 Caddy başlatılıyor (ilk derleme 1-3 dakika sürer) =="
sudo docker compose up -d --build
sleep 5
sudo docker compose ps
echo
echo "TAMAM. Birkaç dakika sonra tarayıcıda aç: https://app.ysfdurak.com"
echo "Sorun olursa: sudo docker compose -f ~/ysfdurak.com/sunucu/altyapi/compose.yml logs caddy"
