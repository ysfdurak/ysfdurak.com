"""Ziyaretçinin gerçek IP adresi (hız sınırı için). Node projelerindeki server/gercek-ip.js ile aynı kural:
- X-Forwarded-For yalnız bağlantı özel ağdaki ters vekilden (Caddy) geliyorsa okunur, son elemanı alınır.
- CF-Connecting-IP yalnız o adres Cloudflare aralıklarındaysa okunur (gri bulutta herkes yazabilir).
Cloudflare aralıkları: https://www.cloudflare.com/ips/ (son değişiklik Eylül 2023)."""
from __future__ import annotations

import ipaddress

_CLOUDFLARE = [ipaddress.ip_network(a) for a in (
    "173.245.48.0/20", "103.21.244.0/22", "103.22.200.0/22", "103.31.4.0/22", "141.101.64.0/18", "108.162.192.0/18",
    "190.93.240.0/20", "188.114.96.0/20", "197.234.240.0/22", "198.41.128.0/17", "162.158.0.0/15", "104.16.0.0/13",
    "104.24.0.0/14", "172.64.0.0/13", "131.0.72.0/22",
    "2400:cb00::/32", "2606:4700::/32", "2803:f800::/32", "2405:b500::/32", "2405:8100::/32", "2a06:98c0::/29", "2c0f:f248::/32")]
_OZEL = [ipaddress.ip_network(a) for a in ("10.0.0.0/8", "172.16.0.0/12", "192.168.0.0/16", "127.0.0.0/8", "::1/128", "fc00::/7")]


def _ip(metin: str | None):
    try:
        ip = ipaddress.ip_address(str(metin or "").strip())
        return ip.ipv4_mapped or ip if isinstance(ip, ipaddress.IPv6Address) else ip
    except ValueError:
        return None


def _icinde(aglar, ip) -> bool:
    return ip is not None and any(ip.version == a.version and ip in a for a in aglar)


def gercek_ip(soket: str | None, basliklar) -> str:
    es = _ip(soket)
    if _icinde(_OZEL, es):
        zincir = [x for x in (basliklar.get("x-forwarded-for") or "").split(",") if x.strip()]
        son = _ip(zincir[-1]) if zincir else None
        if son is not None:
            es = son
    bulut = _ip(basliklar.get("cf-connecting-ip"))
    if _icinde(_CLOUDFLARE, es) and bulut is not None:
        return str(bulut)
    return str(es) if es is not None else "bilinmiyor"
