"""Ayarlar: ortam değişkenlerinden. Hatalar toplu döner; sunucu eksik ayarla başlamaz."""
from __future__ import annotations

import os
import re
from dataclasses import dataclass, field


def _sayi(v, varsayilan, alt, ust):
    try:
        return min(ust, max(alt, int(v)))
    except (TypeError, ValueError):
        return varsayilan


@dataclass
class Ayarlar:
    dakikalik_istek: int
    mcp_acik: bool
    mcp_anahtarlari: list[str] = field(default_factory=list)
    hatalar: list[str] = field(default_factory=list)


def yukle(env=os.environ) -> Ayarlar:
    hatalar = []
    anahtarlar = [a.strip() for a in (env.get("MCP_ANAHTARLARI") or "").split(",") if a.strip()]
    if any(len(a) < 32 or not re.fullmatch(r"[A-Za-z0-9_-]+", a) for a in anahtarlar):
        hatalar.append("MCP_ANAHTARLARI: her anahtar en az 32 karakter, yalnız harf, rakam, tire, alt çizgi (openssl rand -hex 32).")
    mcp_acik = env.get("MCP_ENABLED") == "true"
    if mcp_acik and not anahtarlar:
        hatalar.append("MCP_ENABLED=true için MCP_ANAHTARLARI gerekli.")
    # Projeye özgü ayarlar buraya: zorunlu olanlar eksikse hatalar'a yaz.
    return Ayarlar(_sayi(env.get("DAKIKALIK_ISTEK"), 60, 5, 1000), mcp_acik, anahtarlar, hatalar)
