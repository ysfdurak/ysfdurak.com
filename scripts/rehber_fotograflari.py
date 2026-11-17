# -*- coding: utf-8 -*-
"""Rehber yazılarına telifsiz fotoğraf ekler (Pexels ve Unsplash).

Kullanım:
  python3 scripts/rehber_fotograflari.py indir      # fotoğrafları indirir, küçültür, public/img/rehber/ altına .webp yazar
  python3 scripts/rehber_fotograflari.py klasor DIR # indirilmiş dosyaları DIR içinden alır (ad: <konu>-<ad>.jpg)
  python3 scripts/rehber_fotograflari.py ekle       # webp'leri yazılara <figure> olarak ekler (tekrar çalıştırmak güvenli)

Lisanslar: Pexels Lisansı ve Unsplash Lisansı ticari kullanıma izin verir, atıf zorunlu değildir;
bu yüzden sayfada fotoğrafçı adı gösterilmez. Kaynak kimlikleri aşağıdaki listede kayıtlıdır.
Unsplash+ (ücretli) fotoğraflar bu listeye alınmaz.
"""
import io
import os
import sys
import urllib.request

KOK = os.path.join(os.path.dirname(__file__), '..')
IMG = os.path.join(KOK, 'public', 'img', 'rehber')
MD = os.path.join(KOK, 'src', 'pages', 'tr', 'rehber')
GENISLIK = 1200
# Dikey fotoğraflar yazıda çok yer kaplamasın diye yatay kırpılır (genişlik/yükseklik oranı).
ORAN = {'5s': 3 / 2}
VARSAYILAN_ORAN = 4 / 3
# Kırpmada dikey odak (0 = üst, 1 = alt); yazılmayanlar ortadan kırpılır.
ODAK = {'is-orneklemesi-forklift-depo': 0.72, 'hat-dengeleme-koli-hazirlama': 0.55,
        'ofis-ergonomisi-calisma-masasi': 0.62, 'hat-dengeleme-koli-bantlama': 0.72}   # yazı sütunu ~760 px; 1200 px yüksek yoğunluklu ekranlarda da net
KALITE = 74

# (konu klasörü, dosya adı, yazı, kaynak, kimlik, fotoğrafçı, alt metin, alt yazı)
FOTOLAR = [
    ('5s', 'once-daginik-tezgah', '5s-nedir', 'unsplash', 'CxuTYrgVoyI', '',
     'Tozlu bir tezgâhın üzerine karışık bırakılmış el aletleri',
     None),
    ('5s', 'sonra-alet-panosu', '5s-nedir', 'unsplash', 't5YUoHW6zRo', 'Barn Images',
     'Duvardaki panoda her biri kendi yerinde asılı el aletleri',
     None),
    ('7-israf', 'forklift-paletler', '7-israf-nedir', 'unsplash', 'F2C_mSrb6iM', 'Bernd Dittrich',
     'Paletlerle dolu bir depoda ilerleyen forklift',
     'Taşıma israfı: palet her yer değiştirdiğinde zaman harcanır, ürün değişmez.'),
    ('takt-zamani', 'depo-koli-tasima', 'takt-zamani-nedir', 'pexels', '4487360', 'Tiger Lily',
     'Depoda raflar arasında koli taşıyan iki çalışan',
     'Takt, depodaki işin talebe göre hangi hızda akması gerektiğini söyler.'),
    ('hat-dengeleme', 'koli-bantlama', 'hat-dengeleme-yamazumi', 'unsplash', 'OmjHovNJvA8', '',
     'Depodaki paketleme masasında koliyi bantlayan bir çalışan',
     'Paketleme hattında her istasyonun yükü takta ne kadar yakınsa hat o kadar dengelidir.'),
    ('standart-is', 'strecli-paletler', 'standart-is-kombinasyon-tablosu', 'pexels', '4487363', 'Tiger Lily',
     'Depoda streç filmle sarılmış paletler ve raflar',
     'Streç sarma gibi makine işlerinde operatörün beklediği süre kombinasyon tablosunda görünür olur.'),
    ('kaizen', 'yapiskan-notlar', 'kaizen-oneri-sistemi-nasil-kurulur', 'unsplash', 'fQOyF0D0cDU', 'Jakub Żerdzicki',
     'Duvarda renkli yapışkan notlar',
     'Öneriler kayda girmezse duvardaki not gibi kalır; akış ve sorumlu onları sonuca taşır.'),
    ('zaman-etudu', 'kronometre', 'zaman-etudu-nasil-yapilir', 'unsplash', 'VwqMTcsb0Tg', 'William Warby',
     'Siyah zemin üzerinde mekanik bir kronometre',
     'Kronometreyle kaçan an geri gelmez; videoyla ölçüm adım sınırlarını kare kare bulmayı sağlar.'),
    ('is-orneklemesi', 'forklift-depo', 'is-orneklemesi-nedir', 'unsplash', '82ZiY5pzl1c', 'Kseniia Ilinykh',
     'Büyük bir depoda sarı forklift',
     'Forklift operatörü gibi işi her an değişen rollerde zamanın nereye gittiğini iş örneklemesi gösterir.'),
    ('fine-kinney', 'forklift-raflar', 'fine-kinney-risk-analizi', 'pexels', '13532504', 'Jimmy Nilsson Masth',
     'Yüksek raflar arasında forklift kullanan bir çalışan',
     'Forkliftle yayanın aynı koridoru kullanması, Fine-Kinney ile puanlanan tipik bir depo tehlikesidir.'),
    ('star-teknigi', 'mulakat-el-sikisma', 'star-teknigi-yetkinlik-mulakati', 'unsplash', 'jEpZNyFSQwQ', 'Vitaly Gariev',
     'Masa üzerinden tokalaşan iki kişi, iş görüşmesi sonrası',
     'Yetkinlik mülakatında görüşmeci, anlattığınız olayda sizin ne yaptığınızı dinler.'),
    ('reba', 'koli-yukleme', 'reba-nasil-hesaplanir', 'pexels', '4487487', 'Tiger Lily',
     'Kamyonete karton koli yükleyen iki çalışan',
     'Koli alma ve yerleştirme gibi tüm vücudun çalıştığı işler REBA ile puanlanır.'),
    ('rula-reba', 'raf-duzenleme', 'rula-nedir-reba-farki', 'pexels', '7019225', 'cottonbro studio',
     'Depo rafında kutuları düzenleyen bir çalışan',
     'Kolların yoğun çalıştığı işlerde RULA, tüm vücudun çalıştığı işlerde REBA daha açıklayıcıdır.'),
    ('owas', 'koli-tasima', 'owas-nedir', 'pexels', '4487362', 'Tiger Lily',
     'Depoda koli taşıyan iki çalışan',
     'Vardiya boyunca değişen duruşlar OWAS koduyla hızlıca kaydedilebilir.'),
    ('niosh', 'koli-tasiyan-calisan', 'niosh-kaldirma-denklemi', 'pexels', '4483774', 'Tiger Lily',
     'Depo koridorunda koli taşıyan bir çalışan',
     'Aynı 12 kg, koşullara göre güvenli de olabilir riskli de: NIOSH ağırlığı koşullarıyla birlikte değerlendirir.'),
    ('ofis-ergonomisi', 'calisma-masasi', 'ofis-ergonomisi-rosa', 'unsplash', 'tdnYk4qOGhc', 'ergonofis',
     'Ahşap çalışma masası, monitör ve klavye',
     'Ekran, klavye ve sandalye birbirine göre ayarlanmadıkça pahalı ekipman tek başına fark yaratmaz.'),
    ('gurultu', 'kulak-koruyucu', 'gurultu-maruziyeti-hesaplama', 'unsplash', '8WmS1_XWdKg', 'Jimmy Nilsson Masth',
     'Koruyucu gözlük ve kulaklık takmış bir çalışan',
     'Kulak koruyucu son çaredir; önce kaynakta azaltma gelir.'),
    ('isi-stresi', 'yukleme-rampasi', 'isi-stresi-wbgt', 'unsplash', 'SJGC3NNOqU4', '',
     'Güneş alan bir depo cephesinde yan yana yükleme rampası kapıları',
     'Güneş alan rampa kapıları ve ısınan metal yüzeyler ışınım yoluyla ısı yükünü artırır.'),
]


def indir_url(kaynak, kimlik):
    if kaynak == 'pexels':
        return f'https://images.pexels.com/photos/{kimlik}/pexels-photo-{kimlik}.jpeg?auto=compress&cs=tinysrgb&w=1600'
    return f'https://unsplash.com/photos/{kimlik}/download?force=true&w=1600'


def sayfa_url(kaynak, kimlik):
    if kaynak == 'pexels':
        return f'https://www.pexels.com/photo/{kimlik}/'
    return f'https://unsplash.com/photos/{kimlik}'


def kucult(veri, hedef, anahtar=''):
    from PIL import Image, ImageOps
    im = Image.open(io.BytesIO(veri))
    im = ImageOps.exif_transpose(im).convert('RGB')
    oran = ORAN.get(anahtar.split('-')[0], VARSAYILAN_ORAN)
    if im.width / im.height < oran:   # fazla dikey: yatay kırp
        h = round(im.width / oran)
        ust = round((im.height - h) * ODAK.get(anahtar, 0.5))
        im = im.crop((0, ust, im.width, ust + h))
    if im.width > GENISLIK:
        im = im.resize((GENISLIK, round(im.height * GENISLIK / im.width)), Image.LANCZOS)
    os.makedirs(os.path.dirname(hedef), exist_ok=True)
    im.save(hedef, 'WEBP', quality=KALITE, method=6)   # EXIF/konum bilgisi yazılmaz
    return im.size


def webp_yolu(konu, ad):
    return os.path.join(IMG, konu, ad + '.webp')


def indir():
    for konu, ad, _, kaynak, kimlik, *_ in FOTOLAR:
        hedef = webp_yolu(konu, ad)
        if os.path.exists(hedef):
            continue
        istek = urllib.request.Request(indir_url(kaynak, kimlik), headers={'User-Agent': 'Mozilla/5.0'})
        with urllib.request.urlopen(istek, timeout=60) as yanit:
            boyut = kucult(yanit.read(), hedef, f'{konu}-{ad}')
        print(f'{konu}/{ad}.webp {boyut}')


def klasorden(klasor):
    for konu, ad, *_ in FOTOLAR:
        for uzanti in ('.jpg', '.jpeg', '.png', '.webp'):
            yol = os.path.join(klasor, f'{konu}-{ad}{uzanti}')
            if os.path.exists(yol):
                with open(yol, 'rb') as f:
                    print(f'{konu}/{ad}.webp {kucult(f.read(), webp_yolu(konu, ad), f"{konu}-{ad}")}')
                break
        else:
            print('eksik:', f'{konu}-{ad}')


def boyut(konu, ad):
    from PIL import Image
    with Image.open(webp_yolu(konu, ad)) as im:
        return im.size


def kredi(kaynak, kimlik, yazar):
    site = 'Pexels' if kaynak == 'pexels' else 'Unsplash'
    return f'Fotoğraf: <a href="{sayfa_url(kaynak, kimlik)}" rel="nofollow">{yazar} / {site}</a>'


def img(konu, ad, alt):
    w, h = boyut(konu, ad)
    return f'<img src="/img/rehber/{konu}/{ad}.webp" width="{w}" height="{h}" alt="{alt}" loading="lazy" decoding="async" />'


def ekle():
    tekli = [f for f in FOTOLAR if f[7]]
    for konu, ad, yazi, kaynak, kimlik, yazar, alt, altyazi in tekli:
        if not os.path.exists(webp_yolu(konu, ad)):
            print('atlandı (dosya yok):', konu, ad)
            continue
        yol = os.path.join(MD, yazi + '.md')
        metin = open(yol, encoding='utf-8').read()
        if f'/img/rehber/{konu}/{ad}.webp' in metin:
            continue
        blok = ('<figure class="rehber-gorsel rehber-foto">\n'
                f'  {img(konu, ad, alt)}\n'
                f'  <figcaption>{altyazi}</figcaption>\n'
                '</figure>\n')
        satirlar = metin.split('\n')
        i = next(k for k, s in enumerate(satirlar) if s.startswith('**Kısa cevap:**'))
        satirlar[i + 1:i + 1] = [''] + blok.rstrip('\n').split('\n')
        open(yol, 'w', encoding='utf-8').write('\n'.join(satirlar))
        print('eklendi:', yazi)

    # 5S: önce/sonra fotoğraf çifti, çizimli önce/sonra görselinin hemen önüne
    once, sonra = FOTOLAR[0], FOTOLAR[1]
    if all(os.path.exists(webp_yolu(f[0], f[1])) for f in (once, sonra)):
        yol = os.path.join(MD, '5s-nedir.md')
        metin = open(yol, encoding='utf-8').read()
        if '/img/rehber/5s/sonra-alet-panosu.webp' not in metin:
            blok = ('<figure class="rehber-gorsel rehber-foto foto-cift">\n'
                    '  <div>\n'
                    f'    {img(once[0], once[1], once[6])}\n'
                    '    <span class="foto-etiket once">Önce</span>\n'
                    '  </div>\n'
                    '  <div>\n'
                    f'    {img(sonra[0], sonra[1], sonra[6])}\n'
                    '    <span class="foto-etiket sonra">Sonra</span>\n'
                    '  </div>\n'
                    '  <figcaption>Dağınık tezgâhta alet aranır; alet panosunda her aletin yeri bellidir ve eksik olan hemen görünür.</figcaption>\n'
                    '</figure>\n\n')
            hedef = '<figure class="rehber-gorsel">\n  <a href="/img/rehber/5s/once-sonra.svg"'
            assert hedef in metin
            metin = metin.replace(hedef, blok + hedef, 1)
            open(yol, 'w', encoding='utf-8').write(metin)
            print('eklendi: 5s-nedir (çift)')


if __name__ == '__main__':
    komut = sys.argv[1] if len(sys.argv) > 1 else ''
    if komut == 'indir':
        indir()
    elif komut == 'klasor':
        klasorden(sys.argv[2])
    elif komut == 'ekle':
        ekle()
    else:
        print(__doc__)
