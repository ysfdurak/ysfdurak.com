# Sunucu (VPS) kurulumu

Contabo Cloud VPS 6 · Ubuntu 26.04 LTS · Almanya

## ilk-kurulum.sh ne yapar?

| Adım | Ne | Neden |
| --- | --- | --- |
| 1 | Açık SSH anahtarını sorar | Şifre yerine anahtarla giriş |
| 2 | Sistemi günceller, saat dilimini İstanbul yapar | Güncel güvenlik yamaları |
| 3 | `yusuf` kullanıcısını oluşturur, sudo yetkisi verir | Günlük işler root ile yapılmaz |
| 4 | Anahtarı `yusuf` kullanıcısına ekler | |
| 5 | Root girişini ve şifreyle girişi kapatır | Kaba kuvvet saldırılarını boşa çıkarır |
| 6 | Güvenlik duvarı: yalnızca 22 (SSH), 80, 443 açık | Diğer her port kapalı |
| 7 | Otomatik güvenlik güncellemeleri ve fail2ban | Yamalar kendiliğinden gelir; çok hatalı deneme yapan IP engellenir |
| 8 | 2 GB swap | Bellek anlık dolarsa sistem çökmez |

## Kullanım (bir kez)

```bash
ssh root@SUNUCU_IP
curl -fsSL https://raw.githubusercontent.com/ysfdurak/ysfdurak.com/main/sunucu/ilk-kurulum.sh -o ilk-kurulum.sh
less ilk-kurulum.sh   # içeriğe göz at, q ile çık
bash ilk-kurulum.sh
```

Bitince root penceresini kapatmadan yeni pencerede `ssh yusuf@SUNUCU_IP` ile test et.

## Bundan sonra giriş

```powershell
ssh yusuf@SUNUCU_IP
```
Yönetici komutları `sudo` ile çalışır ve `yusuf` şifresini sorar.
