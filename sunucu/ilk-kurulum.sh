#!/usr/bin/env bash
# ysfdurak.com sunucusu - ilk kurulum ve güvenlik ayarları
# Ubuntu 26.04 LTS için. root olarak, BİR KEZ çalıştırılır.
# Ne yaptığı: güncelleme, kullanıcı oluşturma, SSH anahtarı, şifreli/root girişini kapatma,
# güvenlik duvarı, otomatik güvenlik güncellemeleri, fail2ban, swap.
set -euo pipefail

KULLANICI="yusuf"

if [[ $EUID -ne 0 ]]; then
  echo "Bu dosya root olarak çalıştırılmalı." >&2; exit 1
fi

echo "== 1/8 Açık anahtar =="
echo "Bilgisayarındaki id_ed25519.pub içeriğini yapıştır ve Enter'a bas:"
read -r PUBKEY
if [[ ! "$PUBKEY" =~ ^ssh-ed25519\ [A-Za-z0-9+/=]+ ]]; then
  echo "Bu bir ssh-ed25519 açık anahtarı gibi görünmüyor. Hiçbir şey değiştirilmedi." >&2; exit 1
fi

echo "== 2/8 Sistem güncelleniyor (birkaç dakika sürebilir) =="
export DEBIAN_FRONTEND=noninteractive
apt-get update -q
apt-get -y -q full-upgrade
apt-get -y -q install ufw fail2ban unattended-upgrades curl ca-certificates
timedatectl set-timezone Europe/Istanbul

echo "== 3/8 Kullanıcı: $KULLANICI =="
if ! id "$KULLANICI" &>/dev/null; then
  adduser --disabled-password --gecos "" "$KULLANICI"
fi
usermod -aG sudo "$KULLANICI"
echo "Şimdi $KULLANICI için bir sudo şifresi belirle (yönetici komutlarında sorulur):"
passwd "$KULLANICI"

echo "== 4/8 SSH anahtarı ekleniyor =="
install -d -m 700 -o "$KULLANICI" -g "$KULLANICI" "/home/$KULLANICI/.ssh"
AK="/home/$KULLANICI/.ssh/authorized_keys"
touch "$AK"
grep -qxF "$PUBKEY" "$AK" || echo "$PUBKEY" >> "$AK"
chown "$KULLANICI:$KULLANICI" "$AK"; chmod 600 "$AK"

echo "== 5/8 SSH sıkılaştırma =="
# Dosya adı 00- ile başlıyor: sshd, ayarlar arasında İLK gördüğü değeri kullanır;
# böylece sağlayıcının eklediği "PasswordAuthentication yes" ayarı bizimkini ezemez.
cat > /etc/ssh/sshd_config.d/00-sertlestirme.conf <<CONF
PermitRootLogin no
PasswordAuthentication no
KbdInteractiveAuthentication no
PubkeyAuthentication yes
AllowUsers $KULLANICI
MaxAuthTries 3
CONF
sshd -t
systemctl restart ssh

echo "== 6/8 Güvenlik duvarı (ufw) =="
ufw default deny incoming
ufw default allow outgoing
ufw allow OpenSSH
ufw allow 80/tcp
ufw allow 443/tcp
ufw --force enable

echo "== 7/8 Otomatik güvenlik güncellemeleri ve fail2ban =="
cat > /etc/apt/apt.conf.d/20auto-upgrades <<CONF
APT::Periodic::Update-Package-Lists "1";
APT::Periodic::Unattended-Upgrade "1";
CONF
systemctl enable --now unattended-upgrades fail2ban

echo "== 8/8 Swap (2 GB) =="
if ! swapon --show | grep -q '/swapfile'; then
  fallocate -l 2G /swapfile && chmod 600 /swapfile && mkswap /swapfile && swapon /swapfile
  grep -q '/swapfile' /etc/fstab || echo '/swapfile none swap sw 0 0' >> /etc/fstab
fi

echo
echo "TAMAM. Bu pencereyi KAPATMA."
echo "Yeni bir PowerShell penceresinde test et:  ssh $KULLANICI@$(hostname -I | awk '{print $1}')"
echo "Giriş çalışırsa bu root oturumunu kapatabilirsin."
