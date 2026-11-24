"""Çekirdek: projenin asıl işi (hesap, model, kural). Saf fonksiyonlar: HTTP, MCP, veritabanı bilmez; testler doğrudan çağırır.
Web kapısı (/v1) ve MCP kapısı (/mcp) aynı fonksiyonları çağırır: ikili yapı."""


def ornek_hesap(sayilar: list[float]) -> dict:
    """Şablon örneği: yerine projenin hesabı gelir."""
    if not sayilar:
        raise ValueError("En az bir sayı gerekli.")
    return {"adet": len(sayilar), "ortalama": sum(sayilar) / len(sayilar)}
