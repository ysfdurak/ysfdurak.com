from servis.gercek_ip import gercek_ip


def test_disaridan_gelen_baslik_yok_sayilir():
    assert gercek_ip("203.0.113.5", {"x-forwarded-for": "1.1.1.1", "cf-connecting-ip": "9.9.9.9"}) == "203.0.113.5"


def test_vekilden_gelen_son_eleman_alinir():
    assert gercek_ip("172.18.0.2", {"x-forwarded-for": "6.6.6.6, 203.0.113.7"}) == "203.0.113.7"


def test_cloudflare_basligi_yalniz_cloudflare_adresinden():
    assert gercek_ip("172.18.0.2", {"x-forwarded-for": "104.16.0.1", "cf-connecting-ip": "198.51.100.9"}) == "198.51.100.9"
    assert gercek_ip("172.18.0.2", {"x-forwarded-for": "203.0.113.7", "cf-connecting-ip": "198.51.100.9"}) == "203.0.113.7"
