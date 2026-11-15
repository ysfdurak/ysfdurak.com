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

## 2. aşama: Docker ve Caddy (kurulum-2-docker.sh)

Önce Cloudflare'de: `app` için A kaydı (proxy açık), SSL/TLS modu **Full (strict)**, "Edit zone DNS" yetkili API token.

```bash
ssh yusuf@SUNUCU_IP
curl -fsSL https://raw.githubusercontent.com/ysfdurak/ysfdurak.com/main/sunucu/kurulum-2-docker.sh -o kurulum-2-docker.sh
bash kurulum-2-docker.sh
```

- **Caddy**, sunucunun tek giriş kapısıdır: 80/443'ü yalnızca o dinler, gelen isteği alt alan adına göre doğru uygulamaya iletir.
- Sertifikayı Cloudflare DNS doğrulamasıyla alır; token sunucuda `sunucu/altyapi/.env` dosyasında durur, GitHub'a girmez.
- Projeler `web` adlı Docker ağına katılır ve dışarıya port açmaz; böylece güvenlik duvarının dışında kalan bir kapı oluşmaz.

## 3. aşama: PostgreSQL ve gece yedeği (kurulum-3-veritabani.sh)

Önce Cloudflare R2'de: bir bucket (ör. `ysfdurak-yedek`, konum Avrupa) ve yalnızca o bucket'a "Object Read & Write" yetkili bir API token.

```bash
ssh ysf
bash ~/ysfdurak.com/sunucu/kurulum-3-veritabani.sh
```

- **PostgreSQL 18** tek konteynerde çalışır; her proje kendi veritabanını ve kullanıcısını alır: `bash ~/ysfdurak.com/sunucu/db-olustur.sh pusula`
- Veritabanı `db` adlı **iç ağda** durur: internete hiç açılmaz, yalnızca bu ağa katılan proje konteynerleri bağlanabilir.
- **Yedek:** her gece 03:30'da tüm veritabanları sıkıştırılır, bütünlüğü kontrol edilir, R2'ye gönderilir. Sunucuda 7 gün, R2'de 30 gün saklanır. Elle çalıştırmak: `sudo ysf-yedek`
- **Geri yükleme:** `zcat dosya.sql.gz | docker exec -i postgres psql -U admin`

## Projeler

Her proje kendi deposunda durur. Konteyneri `web` ağına katılır, dışarıya port açmaz. Caddy, `altyapi/Caddyfile` içindeki alt alan adı bloğuyla isteği konteynere iletir.

| Proje | Adres | Kurulum / güncelleme | Veri |
|---|---|---|---|
| Pusula | pusula.ysfdurak.com | `bash ~/ysfdurak.com/sunucu/kurulum-pusula.sh` | SQLite, gece R2'ye yedeklenir |
| Destek Merkezi | destek.ysfdurak.com | `bash ~/ysfdurak.com/sunucu/kurulum-destek.sh` | Ziyaretçi demo alanları (SQLite, 72 saatte silinir, yedek yok) |

Yeni bir alt alan adı için önce Cloudflare DNS'te A kaydı açılır (sunucu IP'si, proxy açık). Ardından `altyapi/Caddyfile` dosyasına bir blok eklenir.

**Destek Merkezi**

- Demo modunda gerçek veri tutmaz. Bu yüzden gece yedeğine eklenmedi.
- Demo sayaçları: `sudo docker exec destek node server/demo-istatistik.mjs`
- Ayrıntı: github.com/ysfdurak/destek-merkezi → `docs/SUNUCU_KURULUMU.md`
