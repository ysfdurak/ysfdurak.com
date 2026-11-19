#!/usr/bin/env bash
# Sunucunun 80/443 portlarına yalnızca Cloudflare'den gelen bağlantıları kabul et (Kasım 2026 güvenlik taraması).
#
# Neden: Alan adları Cloudflare'in arkasında (turuncu bulut). Sunucunun IP'sini bilen biri Cloudflare'i atlayıp doğrudan
# bağlanabilir; Cloudflare'in saldırı koruması ve hız sınırları devre dışı kalır. ufw burada yetmez: Docker'ın dışarı
# açtığı portlar (Caddy'nin 80/443'ü) ufw kurallarını atlar. Kural bu yüzden Docker'ın kendi zincirine (DOCKER-USER) yazılır.
#
# Sertifika etkilenmez: Caddy sertifikayı DNS doğrulamasıyla alır (acme_dns cloudflare), 80. porta gelen doğrulama gerekmez.
# Önce Cloudflare panelinde bütün kayıtların turuncu bulut (proxied) olduğundan emin ol; gri buluttaki adres bu kuraldan
# sonra açılmaz.
#
# Kullanım (yusuf kullanıcısıyla):
#   sudo bash cloudflare-kaynak.sh            # kuralları yaz ve açılışta yeniden yazılması için servis kur
#   sudo bash cloudflare-kaynak.sh --kaldir   # kuralları ve servisi kaldır (eski duruma dön)
#   sudo bash cloudflare-kaynak.sh --durum    # yazılı kuralları göster
# Cloudflare aralıkları: https://www.cloudflare.com/ips/ (son değişiklik Eylül 2023; Caddyfile'daki liste ile aynı tutulmalı).
set -euo pipefail
V4="173.245.48.0/20 103.21.244.0/22 103.22.200.0/22 103.31.4.0/22 141.101.64.0/18 108.162.192.0/18 190.93.240.0/20 188.114.96.0/20 197.234.240.0/22 198.41.128.0/17 162.158.0.0/15 104.16.0.0/13 104.24.0.0/14 172.64.0.0/13 131.0.72.0/22"
V6="2400:cb00::/32 2606:4700::/32 2803:f800::/32 2405:b500::/32 2405:8100::/32 2a06:98c0::/29 2c0f:f248::/32"
ZINCIR=CF-KAYNAK
SERVIS=/etc/systemd/system/cf-kaynak.service

kaldir() {
  for ipt in iptables ip6tables; do
    while $ipt -C DOCKER-USER -j $ZINCIR 2>/dev/null; do $ipt -D DOCKER-USER -j $ZINCIR; done
    $ipt -F $ZINCIR 2>/dev/null || true
    $ipt -X $ZINCIR 2>/dev/null || true
  done
}

yaz() {
  kaldir
  # Yalnız dış arayüzden GELEN trafik süzülür. Konteynerlerin dışarıya yaptığı HTTPS istekleri (Anthropic API,
  # e-posta, sertifika) de DOCKER-USER'dan geçer; arayüz koşulu olmadan onlar da kesilirdi.
  DIS=$( (ip route show default 2>/dev/null || true) | awk '{print $5; exit}'); [[ -n "$DIS" ]] || DIS=$(awk '$2=="00000000"{print $1; exit}' /proc/net/route)
  [[ -n "$DIS" ]] || { echo "Dış ağ arayüzü bulunamadı." >&2; exit 1; }
  for ipt in iptables ip6tables; do
    [[ $ipt == iptables ]] && LISTE=$V4 || LISTE=$V6
    $ipt -N $ZINCIR
    # Yalnız dışarıdan 80/443'e yeni gelen bağlantılara bakılır (konteynerlerin kendi trafiği ve yanıtlar etkilenmez).
    $ipt -A $ZINCIR -m conntrack --ctstate RELATED,ESTABLISHED -j RETURN
    for a in $LISTE; do $ipt -A $ZINCIR -s "$a" -j RETURN; done
    for p in 80 443; do
      $ipt -A $ZINCIR -i "$DIS" -p tcp -m conntrack --ctorigdstport $p --ctdir ORIGINAL -j DROP
    done
    $ipt -A $ZINCIR -i "$DIS" -p udp -m conntrack --ctorigdstport 443 --ctdir ORIGINAL -j DROP
    $ipt -A $ZINCIR -j RETURN
    $ipt -I DOCKER-USER 1 -j $ZINCIR
  done
}

case "${1:-}" in
  --kaldir)
    kaldir
    systemctl disable --now cf-kaynak.service 2>/dev/null || true
    rm -f "$SERVIS"; systemctl daemon-reload
    echo "Kaldırıldı: 80/443 yeniden herkese açık."
    ;;
  --durum)
    iptables -L $ZINCIR -n --line-numbers 2>/dev/null || echo "Kural yok."
    ;;
  --yalniz-kural)
    yaz
    ;;
  *)
    iptables -L DOCKER-USER -n >/dev/null 2>&1 || { echo "DOCKER-USER zinciri yok: Docker çalışıyor mu?" >&2; exit 1; }
    yaz
    install -m 0755 "$0" /usr/local/sbin/cf-kaynak.sh
    cat > "$SERVIS" <<UNIT
[Unit]
Description=80/443 yalniz Cloudflare'den (DOCKER-USER)
After=docker.service
Requires=docker.service

[Service]
Type=oneshot
ExecStart=/usr/local/sbin/cf-kaynak.sh --yalniz-kural
RemainAfterExit=yes

[Install]
WantedBy=multi-user.target
UNIT
    systemctl daemon-reload
    systemctl enable cf-kaynak.service >/dev/null
    echo "TAMAM. 80/443 artık yalnız Cloudflare'den kabul ediliyor. Denetim:"
    echo "  - Tarayıcıdan https://pusula.ysfdurak.com açılmalı (Cloudflare üzerinden)."
    echo "  - Başka bir makineden: curl -m 5 -k https://<SUNUCU_IP> → zaman aşımı olmalı."
    echo "Geri almak için: sudo bash cloudflare-kaynak.sh --kaldir"
    ;;
esac
