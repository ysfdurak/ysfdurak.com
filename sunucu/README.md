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
- **Geri yükleme (sunucudaki son 7 gün):** `sudo zcat /var/backups/postgres/<dosya>.sql.gz | sudo docker exec -i postgres psql -U admin`
- **Geri yükleme (R2'den, şifreli):** `sudo bash -c 'source /etc/ysf-yedek.env; rclone ls r2s:postgres/'` ile dosyayı bul, sonra `sudo bash -c 'source /etc/ysf-yedek.env; rclone cat r2s:postgres/<dosya>.sql.gz' | zcat | sudo docker exec -i postgres psql -U admin`. Sunucu tamamen kaybolduysa başka bir bilgisayarda rclone'a R2 anahtarını ve `yedek-sifrele.sh`'in gösterdiği iki şifreyi ver (`rclone config` → crypt, uzak alan `r2:<bucket>/sifreli`, dosya adı şifreleme kapalı).

## Projeler

Her proje kendi deposunda durur. Konteyneri `web` ağına katılır, dışarıya port açmaz. Caddy, `altyapi/Caddyfile` içindeki alt alan adı bloğuyla isteği konteynere iletir.

| Proje | Adres | Kurulum / güncelleme | Veri |
|---|---|---|---|
| Pusula | pusula.ysfdurak.com | `bash ~/ysfdurak.com/sunucu/kurulum-pusula.sh` | SQLite, gece R2'ye yedeklenir |
| Destek Merkezi | destek.ysfdurak.com | `bash ~/ysfdurak.com/sunucu/kurulum-destek.sh` | Ziyaretçi demo alanları (SQLite, 72 saatte silinir, yedek yok) |
| Diyalog Atölyesi | diyalog.ysfdurak.com | `bash ~/ysfdurak.com/sunucu/kurulum-diyalog.sh` | Anthropic API; SQLite'ta yalnızca sayaçlar, yedek yok |
| Arıza Defteri | ariza.ysfdurak.com | `bash ~/ysfdurak.com/sunucu/kurulum-ariza.sh` | SQLite; sentetik veri tarihten yeniden üretilebildiği için yedek yok (gerçek kayıt yazılmaya başlarsa yedeğe eklenir) |
| Zimmet (ekipman) | zimmet.ysfdurak.com | `bash ~/ysfdurak.com/sunucu/kurulum-zimmet.sh` | SQLite; ziyaretçi demo alanları 24 saatte silinir, MCP vitrini her gün yeniden üretilir, yedek yok; MCP anahtarı `.env`'de |
| Nabız | nabiz.ysfdurak.com | `bash ~/ysfdurak.com/sunucu/kurulum-nabiz.sh` (önce Arıza Defteri; soru sormaz) | SQLite; demo modunda ziyaretçi alanları 72 saatte silinir, vitrin her gün yeniden üretilir, yedek yok |
| Nabız Analiz (Python) | yalnız iç ağ (`http://nabiz-analiz:8000`) | `bash ~/ysfdurak.com/sunucu/kurulum-nabiz-analiz.sh` | Veri tutmaz; Arıza Defteri'nden okur; Caddy bloğu yok, Claude'a Nabız MCP'si üzerinden |
| Emanet + Usta (Python) | emanet.ysfdurak.com | `bash ~/ysfdurak.com/sunucu/kurulum-emanet.sh` | SQLite; demo her gece yeniden üretilir, ziyaretçi kopyaları 24 saatte silinir, yedek yok; MCP anahtarı `.env`'de |
| Kalkan (İSG) | kalkan.ysfdurak.com | `bash ~/ysfdurak.com/sunucu/kurulum-kalkan.sh` | SQLite; ziyaretçi demo alanları 24 saatte silinir, MCP vitrini her gün yeniden üretilir, yedek yok; MCP anahtarı `.env`'de |
| Termin Olasılığı | termin.ysfdurak.com | `bash ~/ysfdurak.com/sunucu/kurulum-termin.sh` | Veri tutmaz (projeler ziyaretçinin tarayıcısında); açık, salt okunur MCP; yedek yok |
| Ortak ölçüm ve geri bildirim | olcum.ysfdurak.com | `bash ~/ysfdurak.com/sunucu/kurulum-olcum.sh` | PostgreSQL `olcum`, gece R2'ye yedeklenir; ayrıntı `olcum/README.md` |

Yeni bir alt alan adı için önce Cloudflare DNS'te A kaydı açılır (sunucu IP'si, proxy açık). Ardından `altyapi/Caddyfile` dosyasına bir blok eklenir.

**Destek Merkezi**

- Demo modunda gerçek veri tutmaz. Bu yüzden gece yedeğine eklenmedi.
- Demo sayaçları: `sudo docker exec destek node server/demo-istatistik.mjs`
- Ayrıntı: github.com/ysfdurak/destek-merkezi → `docs/SUNUCU_KURULUMU.md`

## Kayıt (log) sınırı

Docker kayıtları konteyner başına en fazla 3 × 10 MB tutulur. Ayar `/etc/docker/daemon.json` dosyasındadır. Yeni bir sunucuda Docker kurulduktan sonra bir kez çalıştırılır:

```bash
bash ~/ysfdurak.com/sunucu/kayit-siniri.sh
```

Docker yeniden başlatıldığı için tüm uygulamalar 10-30 saniye kesilir.


## Güvenlik sertleştirme (Kasım 2026 taraması)

| Ne | Nerede | Neden |
| --- | --- | --- |
| Uygulama konteynerleri salt okunur kök dosya sistemiyle çalışır; yazma yalnız `/data` birimine ve 64 MB'lık `/tmp`'ye | Destek, Pusula, Diyalog `deploy/docker-compose.*.yml` | Uygulamaya sızan biri dosya bırakıp kalıcı hale gelemez |
| Linux yetkileri kapalı (`cap_drop: ALL`), yetki yükseltme yok (`no-new-privileges`), bellek, süreç ve kayıt boyutu sınırlı | Aynı dosyalar; Caddy yalnız `NET_BIND_SERVICE` ile | Bir konteynerdeki sorun ötekileri ve sunucuyu etkilemez |
| Compose proje adları açık: `destek`, `pusula`, `diyalog` | `deploy/docker-compose.ortak.yml` | Destek ve Pusula aynı `deploy` adını paylaşıyordu; birinde `down` ya da `--remove-orphans` ötekini durdurabilirdi. Veri birimi adları (`deploy_destek-data`, `deploy_pusula-data`) korundu; `kurulum-destek.sh` ve `kurulum-pusula.sh` eski konteyneri kaldırıp aynı birimle yeniden başlatır |
| Caddy: HSTS, nosniff, Referrer-Policy, Permissions-Policy, X-Frame-Options, Server başlığı gizli | `altyapi/Caddyfile` | Uygulama başlık göndermese bile tarayıcı korumaları açık |
| Yedekler R2'ye şifreli gider (rclone crypt, istemci tarafında); sunucudaki yedek dosyaları yalnız root okur (`umask 077`) | `yedek.sh`, `yedek-sifrele.sh` | Döküm bütün veritabanlarını, parola özetlerini ve demo ziyaretçilerinin e-postalarını içerir; R2 anahtarı sızsa bile içerik okunamaz. İki şifreyi parola yöneticine kaydet: onlarsız yedek açılmaz |
| 80/443 yalnız Cloudflare'den (isteğe bağlı, önerilen) | `cloudflare-kaynak.sh` | Sunucu IP'sini bilen biri Cloudflare'in korumasını atlayamaz. ufw bunu yapamaz: Docker'ın açtığı portlar ufw'yi atlar; kural Docker'ın `DOCKER-USER` zincirine yazılır ve açılışta yeniden yazılır. Önce Cloudflare'de bütün kayıtlar turuncu bulut olmalı. Geri alma: `sudo bash cloudflare-kaynak.sh --kaldir` |

Uygulamak için (sırayla):

```bash
cd ~/ysfdurak.com && git pull
cd sunucu/altyapi && sudo docker compose up -d          # Caddy ve Postgres yeni ayarlarla
bash ~/ysfdurak.com/sunucu/kurulum-destek.sh            # eski 'deploy' konteynerini kaldırır, aynı veriyle başlatır
bash ~/ysfdurak.com/sunucu/kurulum-pusula.sh
bash ~/ysfdurak.com/sunucu/kurulum-diyalog.sh
sudo install -m 755 ~/ysfdurak.com/sunucu/yedek.sh /usr/local/bin/ysf-yedek   # yeni yedek betiği
sudo bash ~/ysfdurak.com/sunucu/yedek-sifrele.sh       # iki şifre gösterir: parola yöneticine kaydet
sudo ysf-yedek                                         # deneme; "UYARI: şifresiz" yazmamalı
sudo bash ~/ysfdurak.com/sunucu/cloudflare-kaynak.sh    # Cloudflare'de turuncu bulutu kontrol ettikten sonra
```

Bir uygulama salt okunur kök yüzünden açılmazsa (`sudo docker logs <ad>` "read-only file system" der) o compose dosyasında `read_only: true` satırının başına `#` koyup kurulum betiğini yeniden çalıştır ve bana haber ver. Yerel denemede üç uygulama da `/data` ve `/tmp` dışına yazmadı (strace ile denetlendi).
