# -*- coding: utf-8 -*-
"""Rehber yazıları için çizim (SVG) üreticisi.

Çalıştırma:  python3 scripts/rehber_gorselleri.py
Çıktı:       public/img/rehber/<konu>/<ad>.svg

Bütün çizimler 5S rehberindeki elle çizilmiş görsellerle aynı dili kullanır:
beyaz zemin, lacivert başlık, kırmızı = sorun/önce, yeşil-turkuaz = iyi/sonra,
sistem yazı tipi. Sayılar yazıların içindeki örneklerden gelir; bir yazıdaki
örnek değişirse buradaki sayılar da güncellenip betik yeniden çalıştırılmalı.
"""
import math
import os
import random
from xml.sax.saxutils import escape

KOK = os.path.join(os.path.dirname(__file__), '..', 'public', 'img', 'rehber')
FONT = "system-ui, -apple-system, 'Segoe UI', Roboto, Arial, sans-serif"

NAVY, INK, SOFT = '#13294b', '#14213a', '#4a5872'
LINE, GRID = '#dde3ec', '#eef1f5'
RED, RED_BG, RED_LN = '#b42318', '#fdf3f2', '#efd2cf'
TEAL, TEAL_BG, TEAL_LN = '#0f766e', '#eef7f5', '#cbe6e1'
ORANGE, BLUE, YELLOW, AMBER = '#c2410c', '#1d4ed8', '#eab308', '#b45309'
SLATE = '#94a3b8'
WOOD = '#8a6a4a'
# Risk renkleri: düşük → çok yüksek
RISK = ['#15803d', '#65a30d', '#ca8a04', '#ea580c', '#b42318']


# ---------- yardımcılar ----------
def a(**kw):
    out = []
    for k, v in kw.items():
        if v is None:
            continue
        k = k.rstrip('_').replace('_', '-')
        out.append(f'{k}="{v}"')
    return ' '.join(out)


def T(x, y, s, size=15, fill=INK, weight=None, anchor=None, italic=False, rotate=None):
    tr = f'rotate({rotate} {x} {y})' if rotate is not None else None
    return (f'<text {a(x=round(x, 1), y=round(y, 1), font_size=size, font_weight=weight, fill=fill, text_anchor=anchor, font_style="italic" if italic else None, transform=tr)}>'
            f'{escape(str(s))}</text>')


def R(x, y, w, h, fill='none', stroke=None, sw=None, rx=None, dash=None, op=None):
    return f'<rect {a(x=round(x, 1), y=round(y, 1), width=round(w, 1), height=round(h, 1), rx=rx, fill=fill, stroke=stroke, stroke_width=sw, stroke_dasharray=dash, opacity=op)}/>'


def L(x1, y1, x2, y2, stroke=SOFT, sw=2, dash=None, cap=None):
    return f'<line {a(x1=round(x1, 1), y1=round(y1, 1), x2=round(x2, 1), y2=round(y2, 1), stroke=stroke, stroke_width=sw, stroke_dasharray=dash, stroke_linecap=cap)}/>'


def C(cx, cy, r, fill='none', stroke=None, sw=None):
    return f'<circle {a(cx=round(cx, 1), cy=round(cy, 1), r=r, fill=fill, stroke=stroke, stroke_width=sw)}/>'


def P(d, fill='none', stroke=SOFT, sw=2, dash=None, join='round', cap='round'):
    return f'<path {a(d=d, fill=fill, stroke=stroke, stroke_width=sw, stroke_dasharray=dash, stroke_linejoin=join, stroke_linecap=cap)}/>'


def ok(x1, y1, x2, y2, color=SOFT, sw=2.5, head=9, dash=None):
    """Ok çizgisi ve ucu."""
    ang = math.atan2(y2 - y1, x2 - x1)
    bx, by = x2 - head * math.cos(ang), y2 - head * math.sin(ang)
    px, py = -math.sin(ang) * head * 0.6, math.cos(ang) * head * 0.6
    return (L(x1, y1, bx, by, color, sw, dash) +
            f'<polygon points="{x2:.1f},{y2:.1f} {bx + px:.1f},{by + py:.1f} {bx - px:.1f},{by - py:.1f}" fill="{color}"/>')


def yaz(konu, ad, w, h, baslik, aciklama, govde):
    svg = (f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {w} {h}" font-family="{FONT}" role="img" aria-labelledby="t d">\n'
           f'  <title id="t">{escape(baslik)}</title>\n'
           f'  <desc id="d">{escape(aciklama)}</desc>\n'
           f'  <rect width="{w}" height="{h}" fill="#ffffff"/>\n'
           + '\n'.join('  ' + g for g in govde if g) + '\n</svg>\n')
    klasor = os.path.join(KOK, konu)
    os.makedirs(klasor, exist_ok=True)
    with open(os.path.join(klasor, ad + '.svg'), 'w', encoding='utf-8') as f:
        f.write(svg)
    print(f'{konu}/{ad}.svg  {w}x{h}')


def panel(x, y, w, h, tur):
    """5S görsellerindeki önce/sonra panelleri."""
    if tur == 'once':
        return R(x, y, w, h, RED_BG, RED_LN, rx=14)
    return R(x, y, w, h, TEAL_BG, TEAL_LN, rx=14)


def tr_sayi(v, ond=1):
    s = f'{v:,.{ond}f}'.replace(',', 'X').replace('.', ',').replace('X', '.')
    return s


def lejant(x, y, ogeler, size=14, kutu=14, bosluk=26):
    g = []
    for renk, ad in ogeler:
        g.append(R(x, y - kutu + 3, kutu, kutu, renk, rx=3))
        g.append(T(x + kutu + 7, y, ad, size, SOFT))
        x += kutu + 7 + len(ad) * size * 0.56 + bosluk
    return g


def insan(kalca, omuz, bas, dirsek, el, diz, ayak, renk=NAVY, sw=7, diz2=None, ayak2=None):
    """Basit çöp adam: eklemler (x, y) olarak verilir."""
    g = []
    if diz2 and ayak2:
        g.append(P(f'M{kalca[0]},{kalca[1]} L{diz2[0]},{diz2[1]} L{ayak2[0]},{ayak2[1]}', stroke='#6b7a93', sw=sw))
    g.append(P(f'M{kalca[0]},{kalca[1]} L{diz[0]},{diz[1]} L{ayak[0]},{ayak[1]}', stroke=renk, sw=sw))
    g.append(P(f'M{kalca[0]},{kalca[1]} L{omuz[0]},{omuz[1]}', stroke=renk, sw=sw + 3))
    g.append(P(f'M{omuz[0]},{omuz[1]} L{dirsek[0]},{dirsek[1]} L{el[0]},{el[1]}', stroke=renk, sw=sw - 1))
    g.append(C(bas[0], bas[1], 13, renk))
    return g


# ---------- 7 israf ----------
def israf():
    W, H = 680, 330
    x0, olcek = 110, 10.4
    VA, SVA, NVA = TEAL, SLATE, RED
    once = [(6, NVA, 'Fazla işlem'), (8, SVA, None), (14, VA, None), (3, NVA, 'Hareket'),
            (6, SVA, None), (5, NVA, 'Bekleme'), (4, SVA, None)]
    sonra = [(8, SVA, None), (14, VA, None), (6, SVA, None), (4, SVA, None)]
    g = [T(24, 36, 'Paketleme çevrimi: adımlar sınıflandırıldı', 19, NAVY, 700)]

    def bar(y, adimlar, etiket, toplam, renk_et):
        out = [T(24, y + 30, etiket, 17, renk_et, 800)]
        x = x0
        for s, renk, israf_adi in adimlar:
            w = s * olcek
            out.append(R(x, y, w - 2, 46, renk, rx=4))
            yazi = f'{s}' if renk != VA else f'{s} sn · Yerleştirme'
            out.append(T(x + (w - 2) / 2, y + 29, yazi, 14, '#ffffff', 700, 'middle'))
            if israf_adi:
                out.append(L(x + (w - 2) / 2, y + 50, x + (w - 2) / 2, y + 60, RED, 1.5))
                out.append(T(x + (w - 2) / 2, y + 76, israf_adi, 13, RED, 600, 'middle'))
            x += w
        tx = x0 + 46 * olcek + 12
        out.append(T(tx, y + 22, f'{toplam} sn', 17, INK, 800))
        va = sum(s for s, r, _ in adimlar if r == VA)
        out.append(T(tx, y + 42, f'VA %{round(100 * va / toplam)}', 14, TEAL, 700))
        return out

    g += bar(64, once, 'Önce', 46, RED)
    g += bar(178, sonra, 'Sonra', 32, TEAL)
    # kaldırılan israf
    g.append(R(x0 + 32 * olcek, 178, 14 * olcek - 2, 46, 'none', RED, 2, rx=4, dash='6 5'))
    g.append(T(x0 + 39 * olcek, 206, '−14 sn', 14, RED, 700, 'middle'))
    g.append(T(24, 262, 'Barkodla sipariş açma, sabit bant askısı ve önceden etiket basma 14 sn israfı kaldırdı.', 14, SOFT))
    g += lejant(24, 300, [(VA, 'Katma değerli (VA)'), (SVA, 'Gerekli (SVA)'), (NVA, 'İsraf (NVA)')])
    yaz('7-israf', 'paketleme-cevrimi', W, H, 'Paketleme çevrimi: 46 saniyeden 32 saniyeye',
        'Önce 46 saniyelik çevrimde 14 saniye katma değerli yerleştirme, 14 saniye israf (fazla işlem 6, hareket 3, bekleme 5) var. '
        'İsraf kaldırılınca çevrim 32 saniyeye iniyor, katma değerli payı yüzde 30\'dan yüzde 44\'e çıkıyor.', g)


def israf_kartlari():
    W, H = 680, 420
    g = []
    kartlar = [
        ('1', 'Taşıma', 'Paletin birkaç kez el değiştirmesi'),
        ('2', 'Stok', 'İstasyon önünde biriken siparişler'),
        ('3', 'Hareket', 'Alçak paletten eğilerek koli almak'),
        ('4', 'Bekleme', 'Forkliftin rampa açılmasını beklemesi'),
        ('5', 'Fazla üretim', 'Sevkiyattan çok önce hazır paletler'),
        ('6', 'Fazla işlem', 'Doğrulanmış siparişi yeniden saymak'),
        ('7', 'Hata', 'Yanlış etiket, yeniden paketleme'),
        ('8', 'Yetenek', 'Sahadaki fikirleri sormamak'),
    ]
    cw, ch, gap = 155, 190, 12
    for i, (no, ad, ornek) in enumerate(kartlar):
        cx = 12 + (i % 4) * (cw + gap)
        cy = 12 + (i // 4) * (ch + gap)
        sekizinci = no == '8'
        g.append(R(cx, cy, cw, ch, '#ffffff', LINE if not sekizinci else '#cbd5e1', 2, rx=12,
                   dash='6 5' if sekizinci else None))
        g.append(R(cx, cy, cw, 8, RED if not sekizinci else SLATE, rx=4))
        mx, my = cx + cw / 2, cy + 62
        g += israf_ikon(no, mx, my)
        g.append(T(mx, cy + 122, f'{no} · {ad}', 17, INK, 700, 'middle'))
        # örnek iki satıra
        kelimeler, satir, satirlar = ornek.split(), '', []
        for k in kelimeler:
            if len(satir + ' ' + k) > 20:
                satirlar.append(satir.strip())
                satir = k
            else:
                satir += ' ' + k
        satirlar.append(satir.strip())
        for j, s in enumerate(satirlar[:3]):
            g.append(T(mx, cy + 146 + j * 18, s, 13, SOFT, None, 'middle'))
    yaz('7-israf', 'israf-turleri', W, H, '7 israf ve sekizinci israf: depodan örnekler',
        'Sekiz kart: taşıma, stok, hareket, bekleme, fazla üretim, fazla işlem, hata ve kullanılmayan yetenek; her birinde depodan bir örnek.', g)


def israf_ikon(no, x, y):
    g = []
    kutu = '#d6b98c'
    kenar = '#a88a5c'
    if no == '1':  # taşıma: palet ve zikzak ok
        g.append(R(x - 52, y - 4, 30, 22, kutu, kenar, 1.5, rx=2))
        g.append(R(x - 54, y + 18, 34, 5, '#b08455'))
        g.append(P(f'M{x - 14},{y + 8} L{x + 4},{y - 14} L{x + 20},{y + 10} L{x + 36},{y - 12}', stroke=RED, sw=3, dash='5 4'))
        g.append(ok(x + 30, y - 4, x + 48, y - 22, RED, 3, 10))
    elif no == '2':  # stok: yığın
        for r_, (dx, dy) in enumerate([(-36, 6), (-12, 6), (12, 6), (36, 6), (-24, -18), (0, -18), (24, -18), (-12, -42), (12, -42)]):
            g.append(R(x + dx - 11, y + dy - 3, 22, 22, kutu, kenar, 1.5, rx=2))
    elif no == '3':  # hareket: eğilen adam
        g += insan((x - 18, y + 4), (x + 10, y - 20), (x + 22, y - 30), (x + 18, y - 2), (x + 30, y + 16),
                   (x - 12, y + 18), (x - 20, y + 32), NAVY, 5)
        g.append(R(x + 26, y + 18, 22, 16, kutu, kenar, 1.5, rx=2))
    elif no == '4':  # bekleme: saat
        g.append(C(x, y, 30, '#ffffff', NAVY, 4))
        g.append(L(x, y, x, y - 19, NAVY, 4, cap='round'))
        g.append(L(x, y, x + 14, y + 6, NAVY, 4, cap='round'))
        g.append(C(x, y, 3, NAVY))
    elif no == '5':  # fazla üretim: üst üste paletler ve artı
        for k in range(3):
            g.append(R(x - 40, y + 12 - k * 22, 46, 18, kutu, kenar, 1.5, rx=2))
            g.append(R(x - 42, y + 30 - k * 22, 50, 4, '#b08455'))
        g.append(T(x + 30, y + 12, '+', 40, RED, 800, 'middle'))
    elif no == '6':  # fazla işlem: belge ve iki tik
        g.append(R(x - 24, y - 32, 48, 62, '#ffffff', NAVY, 3, rx=4))
        g.append(P(f'M{x - 14},{y - 12} l7,7 l13,-14', stroke=TEAL, sw=3.5))
        g.append(P(f'M{x - 14},{y + 12} l7,7 l13,-14', stroke=RED, sw=3.5))
        g.append(L(x + 10, y - 9, x + 16, y - 9, SLATE, 3))
        g.append(L(x + 10, y + 15, x + 16, y + 15, SLATE, 3))
    elif no == '7':  # hata: kutu ve çarpı
        g.append(R(x - 26, y - 22, 52, 44, kutu, kenar, 2, rx=3))
        g.append(L(x - 12, y - 10, x + 12, y + 10, RED, 5, cap='round'))
        g.append(L(x + 12, y - 10, x - 12, y + 10, RED, 5, cap='round'))
    elif no == '8':  # yetenek: ampul
        g.append(C(x, y - 8, 22, '#fef9c3', AMBER, 3))
        g.append(R(x - 10, y + 14, 20, 14, SLATE, rx=3))
        g.append(P(f'M{x - 6},{y - 4} l6,8 l6,-8', stroke=AMBER, sw=2.5))
    return g


# ---------- takt zamanı ----------
def takt():
    W, H = 680, 400
    g = [T(24, 34, 'Kullanılabilir süre', 18, NAVY, 700)]
    x0, w0 = 24, 632
    k = w0 / 28800
    parcalar = [(25200, TEAL, '25.200 sn kullanılabilir', '#ffffff'),
                (2700, '#cbd5e1', '', INK), (900, '#e2e8f0', '', INK)]
    x = x0
    for s, renk, et, yrenk in parcalar:
        g.append(R(x, 50, s * k - 2, 44, renk, rx=4))
        g.append(T(x + (s * k - 2) / 2, 78, et, 14, yrenk, 700, 'middle'))
        x += s * k
    g.append(T(x0, 116, 'Vardiya 8 saat = 28.800 sn', 13, SOFT))
    g.append(T(x0 + w0, 116, 'Molalar 2.700 + toplantı ve 5S 900', 13, SOFT, None, 'end'))
    # formül
    g.append(R(120, 136, 440, 64, '#ffffff', NAVY, 2, rx=12))
    g.append(T(340, 177, '25.200 sn ÷ 1.800 koli = 14 sn / koli', 21, NAVY, 800, 'middle'))
    g.append(ok(340, 200, 340, 222, SOFT))
    # kaç kişi
    g.append(T(24, 248, 'Kaç kişi? Bir kolinin toplam iş içeriği 50 sn', 18, NAVY, 700))
    k2 = 600 / 56
    bloklar = [14, 14, 14, 8]
    x = x0
    for i, s in enumerate(bloklar):
        w = s * k2
        g.append(R(x, 264, w - 3, 48, TEAL if s == 14 else '#5eead4', rx=4))
        g.append(T(x + w / 2, 294, f'Kişi {i + 1} · {s} sn' if s == 14 else f'Kişi {i + 1} · {s}', 15 if s == 14 else 13.5, '#ffffff' if s == 14 else INK, 700, 'middle'))
        x += w
    # boş kapasite
    g.append(R(x - 3, 264, 6 * k2, 48, 'none', SOFT, 2, rx=4, dash='6 5'))
    g.append(T(x + 3 * k2, 294, 'boş 6', 13, SOFT, None, 'middle'))
    for i in range(5):
        g.append(L(x0 + i * 14 * k2 - (2 if i else 0), 258, x0 + i * 14 * k2 - (2 if i else 0), 320, RED, 1.5, '3 4'))
    g.append(T(x0, 340, 'Kırmızı çizgiler takt aralıklarını gösterir: her kişiye en fazla 14 sn iş düşer.', 14, SOFT))
    g.append(T(x0, 370, '50 ÷ 14 ≈ 3,6 → 4 kişi; dördüncü kişi tam dolu çalışmaz.', 16, INK, 700))
    yaz('takt-zamani', 'takt-hesabi', W, H, 'Takt zamanı ve gereken kişi sayısı',
        '28.800 saniyelik vardiyadan molalar ve toplantı düşülünce 25.200 saniye kalır; 1.800 koli için takt 14 saniyedir. '
        '50 saniyelik iş içeriği 14 saniyelik dilimlere bölününce 3,6 kişi eder, yani 4 kişi gerekir.', g)


# ---------- hat dengeleme / Yamazumi ----------
ADIM_RENK = {'Koli': '#1d4ed8', 'Toplama': '#0891b2', 'Yerleştir': TEAL, 'Kontrol': '#65a30d',
             'Bant': ORANGE, 'Etiket': '#a16207', 'Palet': '#7c3aed'}


def yamazumi():
    W, H = 680, 410
    sure = {'Koli': 6, 'Toplama': 7, 'Yerleştir': 8, 'Kontrol': 5, 'Bant': 9, 'Etiket': 5, 'Palet': 8}
    once = [['Koli', 'Toplama'], ['Yerleştir', 'Kontrol', 'Bant'], ['Etiket'], ['Palet']]
    sonra = [['Koli', 'Toplama'], ['Yerleştir', 'Kontrol'], ['Bant', 'Etiket'], ['Palet']]
    g = []
    taban, olcek = 300, 9.6

    def ciz(px, dagilim, tur, baslik, alt):
        out = [panel(px, 10, 324, 390, tur)]
        out.append(T(px + 18, 40, baslik, 19, RED if tur == 'once' else TEAL, 800))
        ax = px + 44
        for v in (0, 7, 14, 21):
            y = taban - v * olcek
            out.append(L(ax - 4, y, px + 312, y, GRID if v else LINE, 1))
            out.append(T(ax - 8, y + 5, v, 12, SOFT, None, 'end'))
        for i, adimlar in enumerate(dagilim):
            cx = ax + 8 + i * 66
            y = taban
            for ad in adimlar:
                h = sure[ad] * olcek
                out.append(R(cx, y - h, 54, h - 2, ADIM_RENK[ad], rx=3))
                out.append(T(cx + 27, y - h / 2 + 5, ad, 11.5, '#ffffff', 600, 'middle'))
                y -= h
            top = sum(sure[x] for x in adimlar)
            renk = RED if top > 14 else INK
            out.append(T(cx + 27, taban + 20, f'Kişi {i + 1}', 13, SOFT, None, 'middle'))
            out.append(T(cx + 27, taban + 39, f'{top} sn', 15, renk, 800, 'middle'))
        ty = taban - 14 * olcek
        out.append(L(ax - 4, ty, px + 312, ty, RED, 2.5, '8 5'))
        out.append(T(px + 312, ty - 6, 'Takt 14 sn', 13, RED, 700, 'end'))
        for j, s in enumerate(alt):
            out.append(T(px + 18, 368 + j * 20, s, 14, INK if j == 0 else SOFT, 700 if j == 0 else None))
        return out

    g += ciz(10, once, 'once', 'Önce', ['Denge verimi %55', 'Saatte ~164 koli'])
    g += ciz(346, sonra, 'sonra', 'Sonra', ['Denge verimi %86', 'Saatte ~257 koli'])
    yaz('hat-dengeleme', 'yamazumi', W, H, 'Yamazumi grafiği: dört kişilik paketleme hattı, önce ve sonra',
        'Önce ikinci kişinin yükü 22 saniye, takt 14 saniye; hat darboğazda, denge verimi yüzde 55. '
        'Bantlama üçüncü kişiye geçince yükler 13, 13, 14 ve 8 saniye oluyor; hat takta yetişiyor, denge verimi yüzde 86.', g)


# ---------- standart iş kombinasyon tablosu ----------
def dalga(x1, x2, y, genlik=5, adim=10):
    d = f'M{x1:.1f},{y}'
    x = x1
    yukari = True
    while x < x2:
        nx = min(x + adim, x2)
        d += f' Q{(x + nx) / 2:.1f},{y - genlik if yukari else y + genlik} {nx:.1f},{y}'
        yukari = not yukari
        x = nx
    return d


def kombinasyon():
    W, H = 680, 430
    x0, k = 120, 5.5
    g = []

    def ciz(y0, baslik, op_adimlar, makine, cevrim, renk):
        out = [T(24, y0, baslik, 18, renk, 800)]
        # eksen
        for s in range(0, 100, 10):
            x = x0 + s * k
            out.append(L(x, y0 + 14, x, y0 + 104, GRID, 1))
            out.append(T(x, y0 + 120, s, 11.5, SOFT, None, 'middle'))
        out.append(T(24, y0 + 46, 'Operatör', 15, INK, 600))
        out.append(T(24, y0 + 90, 'Makine', 15, INK, 600))
        oy, my = y0 + 41, y0 + 85
        for bas, bit, tur, et in op_adimlar:
            x1, x2 = x0 + bas * k, x0 + bit * k
            if tur == 'yurume':
                out.append(P(dalga(x1, x2, oy), stroke=BLUE, sw=3))
            elif tur == 'el':
                out.append(L(x1 + 1, oy, x2 - 1, oy, NAVY, 6))
            elif tur == 'bekle':
                out.append(R(x1, oy - 13, x2 - x1, 26, RED_BG, RED, 1.5, rx=4, dash='4 3'))
            if et:
                out.append(T((x1 + x2) / 2, oy - 16 if tur != 'bekle' else oy + 5, et, 12.5, RED if tur == 'bekle' else SOFT,
                             700 if tur == 'bekle' else None, 'middle'))
        mx1, mx2 = x0 + makine[0] * k, x0 + makine[1] * k
        out.append(L(mx1, my, mx2, my, ORANGE, 6, '10 6'))
        out.append(T((mx1 + mx2) / 2, my - 14, 'Streç sarma 45 sn', 12.5, ORANGE, 600, 'middle'))
        cx = x0 + cevrim * k
        out.append(L(cx, y0 + 12, cx, y0 + 104, renk, 2.5))
        out.append(T(cx - 6 if cevrim > 80 else cx + 6, y0 + 4, f'Çevrim {cevrim} sn', 14, renk, 800, 'end' if cevrim > 80 else None))
        return out

    g += ciz(32, 'Mevcut', [(0, 12, 'yurume', 'Sür'), (12, 15, 'el', None), (15, 60, 'bekle', 'Makineyi izliyor 45 sn'),
                            (60, 80, 'el', 'Etiket'), (80, 95, 'el', 'Sonraki palet')], (15, 60), 95, RED)
    g += ciz(196, 'Yeni düzen', [(0, 12, 'yurume', 'Sür'), (12, 15, 'el', None), (15, 35, 'el', 'Etiket'),
                                 (35, 50, 'el', 'Sonraki palet'), (50, 60, 'bekle', '10')], (15, 60), 60, TEAL)
    g.append(T(24, 352, 'Makine sararken etiket ve sonraki palet hazırlanıyor: saatte ~38 yerine ~60 palet.', 14, INK, 600))
    ly = 392
    g.append(L(24, ly - 5, 60, ly - 5, NAVY, 6))
    g.append(T(68, ly, 'El işi', 14, SOFT))
    g.append(P(dalga(140, 176, ly - 5), stroke=BLUE, sw=3))
    g.append(T(184, ly, 'Yürüme', 14, SOFT))
    g.append(L(268, ly - 5, 304, ly - 5, ORANGE, 6, '10 6'))
    g.append(T(312, ly, 'Makine', 14, SOFT))
    g.append(R(390, ly - 16, 36, 22, RED_BG, RED, 1.5, rx=4, dash='4 3'))
    g.append(T(434, ly, 'Bekleme', 14, SOFT))
    g.append(T(24, 418, 'Eksen: saniye', 12, SOFT))
    yaz('standart-is', 'kombinasyon-tablosu', W, H, 'Streç sarma istasyonu: standart iş kombinasyon tablosu, mevcut ve yeni düzen',
        'Mevcut düzende operatör makine sararken 45 saniye bekliyor, çevrim 95 saniye. Yeni düzende etiketleme ve sonraki paleti hazırlama '
        'makine sararken yapılıyor; operatörün işi 50 saniyede bitiyor, çevrimi makine belirliyor: 60 saniye.', g)


# ---------- kaizen öneri akışı ----------
def oneri_akisi():
    W, H = 680, 400
    g = []
    adimlar = [('1', 'Öneri girişi', 'Çalışan, telefondan', None),
               ('2', 'Ön değerlendirme', 'Anlaşılır mı, benzeri var mı?', '3 iş günü'),
               ('3', 'Bölüm kararı', 'Alan sorumlusu', '10 iş günü'),
               ('4', 'Aksiyon planı', 'Kim, ne, ne zaman?', '5 iş günü'),
               ('5', 'Uygulama', 'Uygulandı / uygulanamadı', None),
               ('6', 'Kazanç', 'Net kazanç = kazanç − maliyet', None),
               ('7', 'Onay, puan, ödül', 'Üst yönetici onayı', '10 iş günü')]
    bw, bh = 148, 104
    konum = []
    for i in range(4):
        konum.append((14 + i * (bw + 18), 44))
    for i in range(3):
        konum.append((14 + (bw + 18) * 0.5 + i * (bw + 18), 230))
    for (no, ad, alt, sure), (x, y) in zip(adimlar, konum):
        g.append(R(x, y, bw, bh, '#ffffff', NAVY, 2, rx=12))
        g.append(C(x + 24, y + 24, 13, NAVY))
        g.append(T(x + 24, y + 29, no, 14, '#ffffff', 800, 'middle'))
        g.append(T(x + 12, y + 60, ad, 14.5, INK, 700))
        # alt yazıyı satırlara böl
        satir, satirlar = '', []
        for kel in alt.split():
            if len(satir + ' ' + kel) > 22:
                satirlar.append(satir.strip())
                satir = kel
            else:
                satir += ' ' + kel
        satirlar.append(satir.strip())
        for j, s in enumerate(satirlar):
            g.append(T(x + 12, y + 79 + j * 16, s, 12, SOFT))
        if sure:
            g.append(R(x + bw - 92, y + 14, 82, 20, '#fff7ed', '#fdba74', 1, rx=10))
            g.append(T(x + bw - 51, y + 28, sure, 12, ORANGE, 700, 'middle'))
    for i in range(3):
        x1 = konum[i][0] + bw
        g.append(ok(x1 + 2, 96, x1 + 16, 96, SOFT))
    # 4 → 5
    g.append(P(f'M{konum[3][0] + bw / 2},{44 + bh} L{konum[3][0] + bw / 2},{195} L{konum[4][0] + bw / 2},{195}', stroke=SOFT, sw=2.5))
    g.append(ok(konum[4][0] + bw / 2, 195, konum[4][0] + bw / 2, 228, SOFT))
    for i in range(4, 6):
        x1 = konum[i][0] + bw
        g.append(ok(x1 + 2, 282, x1 + 16, 282, SOFT))
    # yan dallar
    g.append(T(konum[1][0] + 4, 168, '↩ Eksikse revizyon', 12.5, RED, 600))
    g.append(T(konum[2][0] + 4, 168, '✕ Ret yalnızca gerekçeyle', 12.5, RED, 600))
    g.append(T(konum[4][0] + 4, 354, 'Uygulanamadı → kapanır', 12.5, RED, 600))
    g.append(R(14, 366, 652, 28, TEAL_BG, TEAL_LN, rx=8))
    g.append(T(340, 385, 'Her aşamanın sorumlusu ve hedef süresi panoda görünür; sonuç önerene döner.', 13.5, TEAL, 700, 'middle'))
    yaz('kaizen', 'oneri-akisi', W, H, 'Öneriden kapanışa yedi aşamalı akış',
        'Öneri girişi, ön değerlendirme (3 iş günü), bölüm kararı (10 iş günü), aksiyon planı (5 iş günü), uygulama, kazanç ve onay-puan-ödül (10 iş günü). '
        'Eksik öneri revizyona döner, ret yalnızca gerekçeyle yapılır, uygulanamayan öneri kapanır.', g)


# ---------- zaman etüdü ----------
def standart_sure():
    W, H = 680, 380
    gozlem = [12.4, 11.8, 13.1, 12.0, 12.7, 11.5, 12.9, 13.4, 12.2, 11.9]
    g = [T(24, 34, 'Koli bantlama: gözlemden standart süreye', 19, NAVY, 700)]
    taban, k = 320, 17
    ax = 70
    for v in (0, 4, 8, 12, 16):
        y = taban - v * k
        g.append(L(ax, y, 520, y, GRID if v else LINE, 1))
        g.append(T(ax - 8, y + 5, v, 12, SOFT, None, 'end'))
    g.append(T(ax - 40, 60, 'sn', 12, SOFT))
    sutun = [('Ortalama', 12.39, SLATE, '10 gözlem'), ('Normal süre', 13.01, BLUE, '× tempo %105'),
             ('Standart süre', 14.78, TEAL, '÷ (1 − %12 tolerans)')]
    for i, (ad, v, renk, not_) in enumerate(sutun):
        x = ax + 30 + i * 150
        h = v * k
        g.append(R(x, taban - h, 96, h, renk, rx=4))
        g.append(T(x + 48, taban - max(h, 13.6 * k) - 10, tr_sayi(v, 2) + ' sn', 16, INK, 800, 'middle'))
        g.append(T(x + 48, taban + 22, ad, 14, INK, 700, 'middle'))
        g.append(T(x + 48, taban + 42, not_, 12.5, SOFT, None, 'middle'))
        if i:
            g.append(ok(x - 50, taban - 140, x - 6, taban - 140, SOFT))
    # gözlem noktaları ilk sütunun üstünde
    random.seed(4)
    x = ax + 30
    for v in gozlem:
        g.append(C(x + 18 + random.random() * 60, taban - v * k, 4.5, '#ffffff', NAVY, 2))
    # kapasite kutusu
    g.append(R(540, 140, 126, 120, TEAL_BG, TEAL_LN, 1.5, rx=12))
    g.append(T(603, 172, 'Kapasite', 14, TEAL, 700, 'middle'))
    g.append(T(603, 206, '≈ 243', 28, TEAL, 800, 'middle'))
    g.append(T(603, 230, 'koli / saat', 13, SOFT, None, 'middle'))
    g.append(T(603, 249, '3.600 ÷ 14,78', 12, SOFT, None, 'middle'))
    yaz('zaman-etudu', 'standart-sure', W, H, 'Gözlemden standart süreye: koli bantlama örneği',
        'On gözlemin ortalaması 12,39 saniye. Yüzde 105 tempo ile normal süre 13,01, yüzde 12 tolerans ile standart süre 14,78 saniye. '
        'Saatlik kapasite yaklaşık 243 koli.', g)


# ---------- iş örneklemesi ----------
def is_orneklemesi():
    W, H = 680, 400
    kat = [('Yükleme ve boşaltma', 172, 0.381, 0.479, TEAL), ('Boş sürüş ve yürüme', 108, 0.226, 0.314, RED),
           ('Bekleme', 76, 0.152, 0.228, '#e11d48'), ('Diğer', 44, 0.079, 0.141, SLATE)]
    g = [T(24, 34, 'Vardiyada rastgele anlarda gözlem', 18, NAVY, 700)]
    # zaman çizelgesi
    random.seed(7)
    x0, x1 = 24, 656
    g.append(R(x0, 52, x1 - x0, 34, '#f8fafc', LINE, 1, rx=6))
    havuz = []
    for ad, n, *_ , renk in [(k[0], k[1], k[4]) for k in kat]:
        havuz += [renk] * round(n / 10)
    random.shuffle(havuz)
    anlar = sorted(random.uniform(x0 + 6, x1 - 6) for _ in havuz)
    for x, renk in zip(anlar, havuz):
        g.append(L(x, 56, x, 82, renk, 3, cap='round'))
    for i, saat in enumerate(['08:00', '10:00', '12:00', '14:00', '16:00']):
        g.append(T(x0 + i * (x1 - x0) / 4, 104, saat, 12, SOFT, None, ['start', 'middle', 'middle', 'middle', 'end'][i]))
    g.append(T(24, 136, 'Her çizgi bir gözlem anı (400 gözlemin bir kısmı). Saat başı değil, rastgele.', 13, SOFT))
    # paylar
    g.append(T(24, 172, 'Paylar ve %95 güven aralığı', 18, NAVY, 700))
    bx, k = 200, 8.2  # yüzde başına piksel
    for v in (0, 10, 20, 30, 40, 50):
        x = bx + v * k
        g.append(L(x, 186, x, 346, GRID if v else LINE, 1))
        g.append(T(x, 362, f'%{v}', 12, SOFT, None, 'middle'))
    for i, (ad, n, lo, hi, renk) in enumerate(kat):
        y = 194 + i * 38
        p = n / 400
        g.append(T(bx - 10, y + 19, ad, 14, INK, 600, 'end'))
        g.append(R(bx, y + 4, p * 100 * k, 22, renk, rx=3, op=0.85))
        g.append(L(bx + lo * 100 * k, y + 15, bx + hi * 100 * k, y + 15, INK, 2))
        g.append(L(bx + lo * 100 * k, y + 8, bx + lo * 100 * k, y + 22, INK, 2))
        g.append(L(bx + hi * 100 * k, y + 8, bx + hi * 100 * k, y + 22, INK, 2))
        g.append(T(bx + hi * 100 * k + 8, y + 20, f'%{tr_sayi(p * 100)}', 14, INK, 700))
    g.append(R(24, 372, 632, 24, RED_BG, RED_LN, rx=6))
    g.append(T(340, 389, 'Boş sürüş + bekleme = zamanın %46\'sı katma değer üretmiyor', 13.5, RED, 700, 'middle'))
    yaz('is-orneklemesi', 'paylar-guven-araligi', W, H, 'İş örneklemesi: forklift operatörünün zamanı',
        'Vardiya boyunca rastgele anlarda yapılan 400 gözlem: yükleme ve boşaltma yüzde 43, boş sürüş ve yürüme yüzde 27, bekleme yüzde 19, diğer yüzde 11; '
        'her payın yüzde 95 güven aralığı çizgiyle gösterilmiş.', g)


# ---------- Fine-Kinney ----------
def fine_kinney():
    W, H = 680, 330
    g = [T(24, 34, 'Risk puanı = Olasılık × Frekans × Şiddet', 19, NAVY, 700)]
    x0, x1 = 30, 650
    lo, hi = math.log10(5), math.log10(2000)

    def X(v):
        return x0 + (math.log10(v) - lo) / (hi - lo) * (x1 - x0)
    siniflar = [(5, 20, 'Önemsiz'), (20, 70, 'Olası'), (70, 200, 'Önemli'), (200, 400, 'Yüksek'), (400, 2000, 'Tolerans\ngösterilemez')]
    for i, (a_, b_, ad) in enumerate(siniflar):
        g.append(R(X(a_), 56, X(b_) - X(a_) - 2, 40, RISK[i], rx=4))
        satirlar = ad.split('\n')
        for j, s in enumerate(satirlar):
            g.append(T((X(a_) + X(b_)) / 2, 80 - (len(satirlar) - 1) * 8 + j * 16, s, 13 if len(satirlar) > 1 else 14, '#ffffff', 700, 'middle'))
    for v in (20, 70, 200, 400):
        g.append(T(X(v), 114, v, 12.5, SOFT, 600, 'middle'))
    g.append(T(x0, 114, 'Logaritmik ölçek', 11.5, SOFT))

    def ornek(y, ad, once, sonra, f_once, f_sonra):
        out = [T(24, y, ad, 15, INK, 700)]
        out.append(L(x0, y + 26, x1, y + 26, LINE, 1))
        out.append(ok(X(once) - 10, y + 26, X(sonra) + 12, y + 26, TEAL, 3, 11))
        out.append(C(X(once), y + 26, 9, RED))
        out.append(C(X(sonra), y + 26, 9, TEAL))
        out.append(T(X(once), y + 54, f'{once} · {f_once}', 13, RED, 700, 'middle'))
        out.append(T(X(sonra), y + 54, f'{sonra} · {f_sonra}', 13, TEAL, 700, 'middle'))
        return out
    g += ornek(150, 'Forklift–yaya: bariyerli yaya yolu ile olasılık 3 → 0,5', 720, 120, '3×6×40', '0,5×6×40')
    g += ornek(236, 'Alçak paletten koli: palet yükseltici ve rotasyon', 420, 42, '6×10×7', '1×6×7')
    yaz('fine-kinney', 'risk-olcegi', W, H, 'Fine-Kinney risk sınıfları ve iki örnekte önlemin etkisi',
        'Risk sınıfları: 20 altı önemsiz, 20–70 olası, 70–200 önemli, 200–400 yüksek, 400 ve üzeri tolerans gösterilemez. '
        'Forklift–yaya örneğinde risk 720\'den 120\'ye, alçak palet örneğinde 420\'den 42\'ye iniyor.', g)


# ---------- STAR ----------
def star():
    W, H = 680, 330
    g = [T(24, 34, 'Bir STAR cevabında sürenin dağılımı', 19, NAVY, 700)]
    parca = [('S', 'Durum', '1–2 cümle', 0.15, SLATE), ('T', 'Görev', '1 cümle', 0.10, '#64748b'),
             ('A', 'Eylem', 'Siz neyi, nasıl, neden yaptınız?', 0.55, TEAL), ('R', 'Sonuç', 'Sayı ve dayanak', 0.20, BLUE)]
    x, w0 = 24, 632
    for harf, ad, alt, oran, renk in parca:
        w = oran * w0
        g.append(R(x, 56, w - 4, 92, renk, rx=8))
        g.append(T(x + (w - 4) / 2, 98, harf, 34, '#ffffff', 800, 'middle'))
        g.append(T(x + (w - 4) / 2, 128, ad, 15, '#ffffff', 700, 'middle'))
        g.append(T(x + (w - 4) / 2 if oran > 0.12 else x, 172, alt, 13, SOFT, None, 'middle' if oran > 0.12 else 'start'))
        x += w
    g.append(T(24 + 0.25 * w0 + 0.275 * w0, 200, 'Ağırlık eylemde: “biz” değil “ben”', 14, TEAL, 700, 'middle'))
    # takip soruları
    g.append(T(24, 240, 'Takip sorularına hazırlık', 16, NAVY, 700))
    ekler = [('Dayanak', 'Sonucu nereden biliyorsunuz?'), ('Alternatif', 'Başka ne yapabilirdiniz?'),
             ('Öğrenme', 'Şimdi neyi farklı yapardınız?')]
    for i, (ad, soru) in enumerate(ekler):
        x = 24 + i * 214
        g.append(R(x, 254, 204, 64, '#ffffff', LINE, 2, rx=10))
        g.append(T(x + 14, 280, ad, 15, INK, 700))
        g.append(T(x + 14, 303, soru, 12.5, SOFT))
    yaz('star-teknigi', 'star-yapisi', W, H, 'STAR tekniği: Durum, Görev, Eylem, Sonuç',
        'Durum ve görev kısa, eylem cevabın yarıdan fazlası, sonuç sayı ve dayanakla. Altında üç takip sorusu: dayanak, alternatif, öğrenme.', g)


# ---------- REBA ----------
def reba_durus():
    W, H = 680, 360
    g = [panel(10, 10, 320, 340, 'once'), panel(350, 10, 320, 340, 'sonra')]
    g.append(T(30, 44, 'Önce', 22, RED, 800))
    g.append(T(370, 44, 'Sonra', 22, TEAL, 800))
    zemin = 280
    kutu, kenar = '#d6b98c', '#a88a5c'
    # önce: alçak palet
    g.append(L(30, zemin, 310, zemin, '#c9d1dc', 2))
    g.append(R(180, zemin - 14, 110, 14, '#b08455'))
    g.append(R(200, zemin - 50, 60, 36, kutu, kenar, 1.5, rx=2))
    g += insan(kalca=(118, 200), omuz=(170, 150), bas=(190, 136), dirsek=(186, 186), el=(204, 226),
               diz=(140, 240), ayak=(118, zemin - 4), diz2=(130, 242), ayak2=(104, zemin - 4))
    g.append(T(60, 120, 'Gövde 45°', 14, RED, 700))
    g.append(T(150, 262, 'Diz 40°', 13, RED, 600))
    g.append(T(30, 312, 'REBA 10 · Yüksek', 18, RED, 800))
    g.append(T(30, 334, 'NIOSH LI 1,84 · OWAS 3', 14, SOFT))
    # sonra: makaslı kaldırıcı
    g.append(L(370, zemin, 650, zemin, '#c9d1dc', 2))
    lx = 520
    g.append(R(lx, zemin - 8, 120, 8, '#64748b'))
    g.append(L(lx + 6, zemin - 8, lx + 114, 196, '#64748b', 4))
    g.append(L(lx + 114, zemin - 8, lx + 6, 196, '#64748b', 4))
    g.append(R(lx, 188, 120, 8, '#64748b'))
    g.append(R(lx + 8, 174, 104, 14, '#b08455'))
    g.append(R(lx + 28, 138, 60, 36, kutu, kenar, 1.5, rx=2))
    g += insan(kalca=(460, 196), omuz=(470, 126), bas=(476, 106), dirsek=(492, 160), el=(522, 160),
               diz=(462, 238), ayak=(460, zemin - 4), diz2=(452, 238), ayak2=(448, zemin - 4))
    g.append(T(386, 100, 'Gövde 10°', 14, TEAL, 700))
    g.append(T(372, 312, 'REBA 5 · Orta', 18, TEAL, 800))
    g.append(T(372, 334, 'NIOSH LI 0,93 · OWAS 1', 14, SOFT))
    yaz('reba', 'once-sonra-durus', W, H, 'Alçak paletten koli alma: palet yükseltici öncesi ve sonrası',
        'Solda çalışan gövdesi 45 derece eğik, dizleri bükük, yerden 15 santimetredeki paletten koli alıyor: REBA 10, yüksek risk. '
        'Sağda palet makaslı kaldırıcıyla bel hizasına gelmiş, çalışan dik duruyor: REBA 5, orta risk.', g)


def reba_puanlama():
    W, H = 680, 350
    g = [T(24, 34, 'REBA puanı nasıl birleşir? (örnek: 12 kg koli)', 19, NAVY, 700)]

    def grup(x, y, baslik, oge, tablo, ek_ad, ek, skor_ad, skor, renk):
        out = [R(x, y, 300, 206, '#ffffff', renk, 2, rx=12), R(x, y, 300, 8, renk, rx=4)]
        out.append(T(x + 16, y + 36, baslik, 16, INK, 700))
        for i, (ad, p) in enumerate(oge):
            bx = x + 16 + i * 92
            out.append(R(bx, y + 50, 82, 50, GRID, rx=8))
            out.append(T(bx + 41, y + 72, ad, 12.5, SOFT, None, 'middle'))
            out.append(T(bx + 41, y + 93, p, 17, INK, 800, 'middle'))
        out.append(T(x + 16, y + 130, f'Tablo {tablo}', 14, SOFT))
        out.append(T(x + 16, y + 158, f'+ {ek_ad}', 14, SOFT))
        out.append(T(x + 284, y + 130, oge_tablo[tablo], 16, INK, 800, 'end'))
        out.append(T(x + 284, y + 158, f'+{ek}', 16, INK, 800, 'end'))
        out.append(L(x + 16, y + 168, x + 284, y + 168, LINE, 1))
        out.append(T(x + 284, y + 192, f'{skor_ad} = {skor}', 18, renk, 800, 'end'))
        return out
    oge_tablo = {'A': '5', 'B': '5'}
    g += grup(24, 54, 'Grup A · gövde, boyun, bacak', [('Gövde 45°', '3'), ('Boyun 25°', '2'), ('Bacak', '2')], 'A', 'Yük 12 kg', 2, 'Skor A', 7, ORANGE)
    g += grup(356, 54, 'Grup B · kol ve bilek', [('Üst kol 50°', '3'), ('Dirsek 110°', '2'), ('Bilek 20°', '2')], 'B', 'Kavrama orta', 1, 'Skor B', 6, BLUE)
    # birleşim
    g.append(ok(174, 262, 260, 290, SOFT))
    g.append(ok(506, 262, 420, 290, SOFT))
    g.append(R(196, 292, 288, 44, RED_BG, RED_LN, 1.5, rx=10))
    g.append(T(340, 320, 'Tablo C 9 + aktivite 1 = REBA 10', 17, RED, 800, 'middle'))
    yaz('reba', 'puanlama', W, H, 'REBA puanlamasının akışı',
        'Grup A: gövde 3, boyun 2, bacak 2; Tablo A 5, yük +2, Skor A 7. Grup B: üst kol 3, ön kol 2, bilek 2; Tablo B 5, kavrama +1, Skor B 6. '
        'Tablo C 9, aktivite +1: REBA 10.', g)


# ---------- RULA / REBA ölçek ----------
def rula_reba():
    W, H = 680, 350
    g = [T(24, 34, 'Aynı iki iş, iki yöntem', 19, NAVY, 700)]

    def olcek(x, y, w, maks, sinirlar, skor, ad):
        # sinirlar: [(bas, bit, renk_idx)]
        out = [T(x - 10, y + 18, ad, 14, INK, 700, 'end')]
        k = w / maks
        for bas, bit, ri in sinirlar:
            out.append(R(x + (bas - 1) * k, y, (bit - bas + 1) * k - 2, 26, RISK[ri], rx=3, op=0.9))
        mx = x + (skor - 0.5) * k
        out.append(f'<polygon points="{mx:.1f},{y - 4} {mx - 8:.1f},{y - 16} {mx + 8:.1f},{y - 16}" fill="{INK}"/>')
        out.append(T(mx, y - 20, skor, 16, INK, 800, 'middle'))
        out.append(T(x, y + 44, '1', 11.5, SOFT, None, 'start'))
        out.append(T(x + w, y + 44, str(maks), 11.5, SOFT, None, 'end'))
        return out
    rula_s = [(1, 2, 0), (3, 4, 2), (5, 6, 3), (7, 7, 4)]
    reba_s = [(1, 1, 0), (2, 3, 1), (4, 7, 2), (8, 10, 3), (11, 15, 4)]
    g.append(T(24, 72, '1 · Paketleme masası (bilek ve boyun zorlanıyor)', 15, SOFT, 600))
    g += olcek(120, 104, 520, 7, rula_s, 5, 'RULA')
    g += olcek(120, 170, 520, 15, reba_s, 4, 'REBA')
    g.append(T(24, 238, '2 · Alçak paletten 12 kg koli (tüm vücut zorlanıyor)', 15, SOFT, 600))
    g += olcek(120, 292, 250, 7, rula_s, 7, 'RULA')
    g += olcek(500, 292, 150, 15, reba_s, 10, 'REBA')
    yaz('rula-reba', 'iki-yontem', W, H, 'RULA ve REBA aynı iki işte',
        'Paketleme masasında RULA 5 (kısa sürede değişiklik), REBA 4 (orta): risk bilek ve boyunda toplandığı için RULA daha ciddi görüyor. '
        'Alçak paletten koli almada RULA 7, REBA 10: iki yöntem de alarm veriyor.', g)


# ---------- OWAS ----------
def owas():
    W, H = 680, 330
    g = [T(24, 34, 'OWAS kodu: dört rakam, bir eylem kategorisi', 19, NAVY, 700)]

    def satir(y, kod, aciklama, kat, baslik):
        out = [T(24, y - 10, baslik, 14.5, SOFT, 600)]
        etiket = ['Sırt', 'Kollar', 'Bacaklar', 'Yük']
        for i, (r_, ac) in enumerate(zip(kod, aciklama)):
            x = 24 + i * 112
            out.append(R(x, y, 102, 84, '#ffffff', NAVY, 2, rx=10))
            out.append(T(x + 51, y + 20, etiket[i], 12.5, SOFT, None, 'middle'))
            out.append(T(x + 51, y + 52, r_, 28, NAVY, 800, 'middle'))
            out.append(T(x + 51, y + 74, ac, 11.5, SOFT, None, 'middle'))
        out.append(ok(478, y + 42, 514, y + 42, SOFT))
        renk = [RISK[0], RISK[2], RISK[3], RISK[4]][kat - 1]
        adlar = ['Normal', 'Hafif zararlı', 'Belirgin zararlı', 'Çok zararlı']
        out.append(R(522, y, 134, 84, renk, rx=10))
        out.append(T(589, y + 38, f'Kategori {kat}', 17, '#ffffff', 800, 'middle'))
        out.append(T(589, y + 62, adlar[kat - 1], 13, '#ffffff', 600, 'middle'))
        return out
    g += satir(72, '2142', ['öne eğik', 'omuz altı', 'iki diz bükük', '10–20 kg'], 3, 'Alçak paletten 12 kg koli')
    g += satir(200, '1122', ['düz', 'omuz altı', 'iki bacak düz', '10–20 kg'], 1, 'Aynı iş, palet yükseltici ile')
    g.append(T(24, 316, 'Açı ölçmeden gözle kodlanır; vardiya boyunca rastgele anlarda kodlanınca duruş dağılımı çıkar.', 13, SOFT))
    yaz('owas', 'kod-kategori', W, H, 'OWAS kodu ve eylem kategorisi',
        'Alçak paletten 12 kilogram koli alma: sırt 2, kollar 1, bacaklar 4, yük 2; kategori 3, belirgin zararlı. '
        'Palet yükseltici ile: 1-1-2-2; kategori 1, normal.', g)


# ---------- NIOSH ----------
def niosh_olcu():
    W, H = 680, 360
    g = [T(24, 34, 'Ölçüler kaldırmanın başında alınır', 19, NAVY, 700)]
    zemin = 320
    cm = 2.3  # cm başına piksel (dikey)
    kutu, kenar = '#d6b98c', '#a88a5c'
    g.append(L(24, zemin, 656, zemin, '#c9d1dc', 2))
    # palet 15 cm
    g.append(R(250, zemin - 12, 120, 12, '#b08455'))
    g.append(R(280, zemin - 15 * cm - 22, 64, 44, kutu, kenar, 1.5, rx=2))
    # konveyör 75 cm
    kv = zemin - 75 * cm
    g.append(R(470, kv, 170, 12, '#64748b', rx=3))
    for x in range(480, 640, 22):
        g.append(C(x + 6, kv + 6, 4, '#cbd5e1'))
    g.append(R(490, kv + 12, 8, zemin - kv - 12, '#94a3b8'))
    g.append(R(612, kv + 12, 8, zemin - kv - 12, '#94a3b8'))
    g.append(R(520, kv - 40, 60, 40, kutu, kenar, 1.5, rx=2, dash='5 4'))
    # insan
    g += insan(kalca=(176, 214), omuz=(236, 170), bas=(256, 156), dirsek=(258, 210), el=(282, zemin - 15 * cm - 4),
               diz=(196, 260), ayak=(170, zemin - 4), diz2=(186, 262), ayak2=(156, zemin - 4))
    # H
    ay = zemin + 0
    g.append(L(163, zemin - 2, 163, zemin - 76, ORANGE, 1.5, '3 3'))
    g.append(L(312, zemin - 15 * cm, 312, zemin - 76, ORANGE, 1.5, '3 3'))
    g.append(ok(170, zemin - 70, 306, zemin - 70, ORANGE, 2, 8))
    g.append(ok(306, zemin - 70, 170, zemin - 70, ORANGE, 2, 8))
    g.append(R(212, zemin - 84, 54, 26, '#ffffff'))
    g.append(T(239, zemin - 64, 'H 40', 14, ORANGE, 800, 'middle'))
    # V
    g.append(ok(390, zemin, 390, zemin - 15 * cm, BLUE, 2, 7))
    g.append(T(398, zemin - 10, 'V 15', 14, BLUE, 800))
    # D
    g.append(L(380, zemin - 15 * cm, 440, zemin - 15 * cm, BLUE, 1, '3 3'))
    g.append(L(440, kv, 470, kv, BLUE, 1, '3 3'))
    g.append(ok(440, zemin - 15 * cm, 440, kv, TEAL, 2, 8))
    g.append(ok(440, kv, 440, zemin - 15 * cm, TEAL, 2, 8))
    g.append(T(448, (kv + zemin - 15 * cm) / 2 + 5, 'D 60', 14, TEAL, 800))
    g.append(T(560, kv - 50, 'Konveyör 75 cm', 13, SOFT, None, 'middle'))
    # açıklamalar
    g.append(T(24, 68, 'H: ayak bileği ortası ile ellerin ortası arası yatay mesafe (cm)', 13, SOFT))
    g.append(T(24, 88, 'V: ellerin yerden yüksekliği · D: başlangıç ile varış yüksekliği farkı', 13, SOFT))
    g.append(T(24, 108, 'A: gövde dönmesi 30° · 4 kaldırma/dk · tutamaksız koli 12 kg', 13, SOFT))
    yaz('niosh', 'olculer', W, H, 'NIOSH ölçüleri: alçak paletten konveyöre koli',
        'Yan görünüş: çalışan yerden 15 santimetredeki paletten koliyi alıp 75 santimetrelik konveyöre koyuyor. '
        'Yatay mesafe H 40, dikey yükseklik V 15, dikey mesafe D 60 santimetre; gövde 30 derece dönüyor.', g)


def niosh_carpan():
    W, H = 680, 380
    g = [T(24, 34, 'Çarpanlar: en küçük çarpan en büyük riski gösterir', 19, NAVY, 700)]
    veri = [('HM · Yatay', 0.63, 0.83), ('VM · Dikey', 0.82, 0.99), ('DM · Mesafe', 0.90, 1.00),
            ('AM · Dönme', 0.90, 1.00), ('FM · Sıklık', 0.72, 0.72), ('CM · Kavrama', 0.95, 0.95)]
    bx, k = 150, 330
    for v in (0, 0.25, 0.5, 0.75, 1.0):
        x = bx + v * k
        g.append(L(x, 52, x, 284, GRID if v < 1 else LINE, 1))
        g.append(T(x, 300, tr_sayi(v, 2), 11.5, SOFT, None, 'middle'))
    for i, (ad, once, sonra) in enumerate(veri):
        y = 60 + i * 38
        g.append(T(bx - 10, y + 20, ad, 14, INK, 600, 'end'))
        g.append(R(bx, y + 3, once * k, 14, RED if once < 0.85 else '#f3a39a', rx=3))
        g.append(R(bx, y + 19, sonra * k, 10, TEAL, rx=3))
        g.append(T(bx + once * k + 6, y + 15, tr_sayi(once, 2), 12.5, RED if once < 0.85 else SOFT, 700))
        if sonra != once:
            g.append(T(bx + sonra * k + 6, y + 30, tr_sayi(sonra, 2), 12.5, TEAL, 700))
    # sonuç kutuları
    for j, (bas, rwl, li, renk, bg, ln) in enumerate([('Önce', '6,5 kg', '1,84', RED, RED_BG, RED_LN),
                                                       ('Palet yükseltici ile', '12,9 kg', '0,93', TEAL, TEAL_BG, TEAL_LN)]):
        x = 512
        y = 56 + j * 118
        g.append(R(x, y, 154, 104, bg, ln, 1.5, rx=12))
        g.append(T(x + 14, y + 26, bas, 14, renk, 800))
        g.append(T(x + 14, y + 54, f'RWL {rwl}', 16, INK, 700))
        g.append(T(x + 14, y + 84, f'LI {li}', 22, renk, 800))
    g += lejant(150, 336, [('#b42318', 'Önce'), (TEAL, 'Palet yükseltici ile')])
    g.append(T(24, 366, 'RWL = 23 kg × HM × VM × DM × AM × FM × CM · LI = 12 kg ÷ RWL', 13.5, SOFT))
    yaz('niosh', 'carpanlar', W, H, 'NIOSH çarpanları önce ve sonra',
        'Önce en küçük çarpanlar HM 0,63, FM 0,72 ve VM 0,82; önerilen sınır 6,5 kg, kaldırma indeksi 1,84. '
        'Palet yükseltici ile HM 0,83, VM 0,99, DM ve AM 1,00; önerilen sınır 12,9 kg, indeks 0,93.', g)


# ---------- ROSA ----------
def rosa():
    W, H = 680, 420
    g = []
    zemin = 380
    # masa
    g.append(L(20, zemin, 660, zemin, '#c9d1dc', 2))
    g.append(R(300, 226, 300, 12, WOOD, rx=2))
    g.append(R(580, 238, 10, zemin - 238, WOOD))
    # ekran
    g.append(R(498, 110, 12, 80, '#334155'))  # gövde (yan görünüş)
    g.append(R(486, 98, 18, 100, '#1e293b', rx=3))
    g.append(R(470, 196, 56, 8, '#64748b', rx=2))
    g.append(R(482, 204, 30, 22, '#94a3b8', rx=2))  # yükseltici
    # klavye ve fare
    g.append(R(338, 218, 70, 8, '#475569', rx=2))
    g.append(R(420, 216, 20, 10, '#475569', rx=5))
    # sandalye
    g.append(R(130, 250, 110, 12, '#334155', rx=4))
    g.append(P('M134,250 Q118,200 128,140', stroke='#334155', sw=10))
    g.append(R(182, 262, 8, 70, '#64748b'))
    g.append(L(146, 336, 226, 336, '#64748b', 6, cap='round'))
    g.append(C(150, 344, 7, '#334155'))
    g.append(C(222, 344, 7, '#334155'))
    g.append(R(196, 210, 50, 8, '#475569', rx=3))  # kolçak
    g.append(R(212, 218, 6, 32, '#475569'))
    # insan (oturuyor)
    g += insan(kalca=(152, 238), omuz=(160, 148), bas=(170, 124), dirsek=(208, 204), el=(356, 210),
               diz=(258, 240), ayak=(262, zemin - 8), sw=8)
    # göz hattı
    g.append(L(182, 124, 486, 116, BLUE, 1.5, '5 4'))
    # numaralı işaretler
    isaret = [(250, 286, '1'), (125, 182, '2'), (230, 196, '3'), (530, 120, '4'), (362, 196, '5'), (300, 120, '6')]
    for x, y, n in isaret:
        g.append(C(x, y, 13, ORANGE))
        g.append(T(x, y + 5, n, 14, '#ffffff', 800, 'middle'))
    # açıklama listesi
    notlar = ['1 Dizler ~90°, ayaklar yerde', '2 Bel desteği, sırt 95–110°', '3 Dirsek destekli, omuz gevşek',
              '4 Ekran üst kenarı göz hizasında', '5 Klavye ve fare aynı yüzeyde', '6 Ekran 40–75 cm uzakta']
    g.append(R(14, 14, 652, 70, '#f8fafc', LINE, 1, rx=10))
    for i, s in enumerate(notlar):
        g.append(T(28 + (i % 3) * 212, 42 + (i // 3) * 26, s, 12.5, INK, 600))
    yaz('ofis-ergonomisi', 'masa-basi-duzeni', W, H, 'Doğru masa başı düzeni: yan görünüş',
        'Oturan çalışanın yan görünüşü üzerinde altı kontrol noktası: dizler yaklaşık 90 derece ve ayaklar yerde, bel desteği ve 95–110 derece sırt açısı, '
        'dirsekler destekli, ekran üst kenarı göz hizasında, klavye ve fare aynı yüzeyde, ekran 40–75 santimetre uzakta.', g)


# ---------- gürültü ----------
def gurultu():
    W, H = 680, 400
    g = [T(24, 34, 'Günlük ses enerjisinin kaynağı', 18, NAVY, 700)]
    paylar = [('Sorter besleme · 90 dB(A) · 3 sa', 86, RED), ('Paketleme 82 · 3 sa', 13, ORANGE), ('', 1, SLATE)]
    x = 24
    for ad, p, renk in paylar:
        w = p / 100 * 632
        g.append(R(x, 50, max(w - 2, 3), 38, renk, rx=4))
        if p > 10:
            g.append(T(x + 10, 74, f'%{p} · {ad}' if p > 50 else f'%{p}', 13.5, '#ffffff', 700))
        x += w
    g.append(T(24, 108, 'Paketleme %14, mola ve ofis %1. Önlem, enerjinin %86\'sının geldiği yerden başlar.', 13, SOFT))
    # ölçek
    g.append(T(24, 152, 'LEX,8h ve yönetmelik değerleri', 18, NAVY, 700))
    x0, x1, lo, hi = 190, 650, 79, 89

    def X(v):
        return x0 + (v - lo) / (hi - lo) * (x1 - x0)
    g.append(R(X(79), 166, X(80) - X(79), 196, '#f0fdf4'))
    g.append(R(X(80), 166, X(85) - X(80), 196, '#fefce8'))
    g.append(R(X(85), 166, X(87) - X(85), 196, '#fff7ed'))
    g.append(R(X(87), 166, X(89) - X(87), 196, '#fef2f2'))
    for v, ad, renk in [(80, 'Alt eylem 80', AMBER), (85, 'Üst eylem 85', ORANGE), (87, 'Sınır 87', RED)]:
        g.append(L(X(v), 166, X(v), 362, renk, 2, '6 4'))
        g.append(T(X(v), 380, ad, 12.5, renk, 700, 'middle'))
    secenek = [('Mevcut durum', 86.4, RED), ('Rotasyon', 84.5, ORANGE), ('Kaynakta azaltma', 81.9, AMBER), ('İkisi birlikte', 81.4, AMBER)]
    for i, (ad, v, renk) in enumerate(secenek):
        y = 190 + i * 44
        g.append(T(x0 - 12, y + 5, ad, 14, INK, 600, 'end'))
        g.append(L(X(lo), y, X(v), y, LINE, 3))
        g.append(C(X(v), y, 9, renk))
        g.append(T(X(v) + (14 if v < 86 else -14), y + 5, tr_sayi(v), 13.5, renk, 800, 'start' if v < 86 else 'end'))
    yaz('gurultu', 'maruziyet-olcek', W, H, 'Gürültü maruziyeti: enerji payı ve önlem seçenekleri',
        'Günlük ses enerjisinin yüzde 86\'sı sorterdaki 3 saatten geliyor. LEX,8h mevcut durumda 86,4 dB(A), rotasyonla 84,5, kaynakta azaltmayla 81,9, '
        'ikisi birlikte 81,4; yönetmelik değerleri 80, 85 ve 87 dB(A).', g)


# ---------- WBGT ----------
def termometre(x, y, renk, etiket, agirlik):
    g = [R(x - 7, y, 14, 70, '#ffffff', SOFT, 2, rx=7), C(x, y + 80, 13, renk, SOFT, 2), R(x - 3, y + 24, 6, 52, renk)]
    g.append(T(x, y + 116, etiket, 13, INK, 600, 'middle'))
    g.append(T(x, y - 12, agirlik, 18, NAVY, 800, 'middle'))
    return g


def wbgt():
    W, H = 680, 410
    g = [T(24, 34, 'İç ortam: WBGT = 0,7 × yaş + 0,3 × glob', 19, NAVY, 700)]
    g += termometre(70, 84, BLUE, 'Yaş (nem)', '0,7')
    g += termometre(160, 84, '#1f2937', 'Glob (ışınım)', '0,3')
    g.append(T(24, 242, 'Nemli ortamda ter buharlaşmaz;', 13, SOFT))
    g.append(T(24, 260, 'en büyük ağırlık yaş termometrede.', 13, SOFT))
    # karşılaştırma
    x0, taban, k, lo = 300, 320, 20, 20

    def Y(v):
        return taban - (v - lo) * k
    for v in (20, 22, 24, 26, 28, 30):
        g.append(L(x0, Y(v), 660, Y(v), GRID if v > 20 else LINE, 1))
        g.append(T(x0 - 8, Y(v) + 5, f'{v}°', 12, SOFT, None, 'end'))
    gruplar = [('Önce · ağır iş', 29.6, 26.6, RED), ('Sonra · orta iş', 27.8, 28.2, TEAL)]
    for i, (ad, w_, ref, renk) in enumerate(gruplar):
        x = x0 + 30 + i * 180
        g.append(R(x, Y(w_), 60, taban - Y(w_), renk, rx=4))
        g.append(T(x + 30, Y(w_) - 8, tr_sayi(w_), 15, renk, 800, 'middle'))
        g.append(L(x - 10, Y(ref), x + 130, Y(ref), INK, 2.5, '7 4'))
        g.append(T(x + 70, Y(ref) - 6 if ref > w_ else Y(ref) + 18, f'Referans {tr_sayi(ref)}', 12.5, INK, 700))
        g.append(T(x + 60, taban + 22, ad, 14, INK, 700, 'middle'))
        fark = w_ - ref
        g.append(T(x + 60, taban + 42, ('+' if fark > 0 else '−') + tr_sayi(abs(fark)) + ' °C ' + ('aşım' if fark > 0 else 'altında'),
                   13, renk, 700, 'middle'))
    g.append(T(x0, 58, 'Yükleme rampası, temmuz öğleden sonra (ısıya alışık)', 14, SOFT, 600))
    g.append(T(x0, 78, 'Önlem: ışınım perdesi + fan, transpalet ve konveyör', 13, SOFT))
    g.append(T(24, 396, 'Isıya alışık olmayan yeni çalışan için ağır işte referans 23,0 °C: aşım 6,6 °C\'ye çıkar.', 13, RED, 600))
    yaz('isi-stresi', 'wbgt-karsilastirma', W, H, 'WBGT hesabı ve referans değerle karşılaştırma',
        'WBGT iç ortamda yaş termometre yüzde 70, glob termometre yüzde 30 ağırlıkla hesaplanır. Önce WBGT 29,6, ağır iş referansı 26,6: 3 derece aşım. '
        'Önlemlerden sonra WBGT 27,8, orta iş referansı 28,2: referansın 0,4 derece altında.', g)


if __name__ == '__main__':
    israf(); israf_kartlari(); takt(); yamazumi(); kombinasyon(); oneri_akisi()
    standart_sure(); is_orneklemesi(); fine_kinney(); star()
    reba_durus(); reba_puanlama(); rula_reba(); owas()
    niosh_olcu(); niosh_carpan(); rosa(); gurultu(); wbgt()
