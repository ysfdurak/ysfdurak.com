# Python servis şablonu

Portföyde Python gereken işler (makine öğrenmesi, optimizasyon, simülasyon, istatistik) için başlangıç. Node servislerindeki kalıbın aynısıdır, böylece yeni bir Python servisi güvenlik, kurulum ve MCP açısından sıfırdan başlamaz. İlk kullanıcısı [Nabız Analiz](https://github.com/ysfdurak/nabiz-analiz).

**Ne zaman Python, ne zaman Node?** Web ekranı, kayıt tutma ve başka sistemlere bağlanma için Node kullanılır (Pusula, Arıza Defteri, Nabız). Analiz, model ve hesap için Python kullanılır. Servisler birbirine HTTP API ve MCP ile bağlanır, dil bağımlılığı yoktur.

## Yeni proje

```bash
bash ysfdurak.com/sablonlar/python-servis/yeni.sh talep-tahmini      # ./talep-tahmini klasörü, adlar değişmiş, git init
cd talep-tahmini
python3 -m venv .venv && .venv/bin/pip install --require-hashes -r requirements.txt -r requirements-dev.txt
.venv/bin/python -m pytest -q
```

## İçinde ne var

| Dosya | Ne yapar |
| --- | --- |
| `servis/cekirdek.py` | Projenin asıl işi. Saf fonksiyonlar; HTTP ve MCP bilmez. |
| `servis/app.py` | Web kapısı (`/v1`) ve MCP kapısı (`/mcp`) aynı çekirdeği çağırır. Güvenlik başlıkları, sıkı CSP, IP başına hız sınırı, MCP anahtarı (sabit sürede karşılaştırılır, bellekte özet olarak durur), genel hata iletisi. `/docs` kapalı. |
| `servis/gercek_ip.py` | Gerçek IP yalnız güvenilen vekilden alınır (Node'daki `gercek-ip.js` ile aynı kural). |
| `servis/config.py` | Ortam değişkenleri. Eksik ya da zayıf ayarla açılmaz. |
| `requirements.in` / `.txt` | Sürüm **ve** özet (hash) ile sabit bağımlılıklar. Docker'da `--require-hashes`. |
| `Dockerfile` | Sabit Python imajı, root olmayan kullanıcı, HEALTHCHECK. |
| `deploy/docker-compose.ortak.yml` | `name:`, `read_only`, `cap_drop: ALL`, `no-new-privileges`, bellek/süreç/kayıt sınırı, port açmadan `web` ağı. |
| `.github/workflows/test.yml` | `permissions: contents: read`, testler, `pip-audit`. |
| `tests/test_app.py` | Güvenlik sözleşmesi: yeni projede de geçmeli. |

Kurallar ve gerekçeleri: [docs/GUVENLIK_TEMELI.md](../../docs/GUVENLIK_TEMELI.md) → 3b. Tarama: `python3 araclar/guvenlik/tara.py --audit ../<proje>`. Python kuralları ve `pip-audit` de çalışır. Tarama `git ls-files` kullanır, dosyalar en az `git add` edilmiş olmalı.

## Lisans

Şablondan çıkan proje PolyForm Shield 1.0.0 ile başlar (`LICENSE.md`). README'deki TR/EN lisans bölümü için Nabız Analiz'in README'si örnek alınır.
