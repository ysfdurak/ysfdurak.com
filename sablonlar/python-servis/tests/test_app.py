"""Şablonun güvenlik sözleşmesi: yeni projede de bu testler geçmeli (projeye özgü testler ayrı dosyalarda)."""
from fastapi.testclient import TestClient

from servis.app import olustur
from servis.config import yukle

MCP = "m" * 40


def istemci(**env):
    a = yukle({"MCP_ENABLED": "true", "MCP_ANAHTARLARI": MCP, **env})
    assert a.hatalar == []
    return TestClient(olustur(a))


def test_basliklar_ve_kapali_belgeler():
    with istemci() as c:
        r = c.get("/v1/ortalama?sayilar=1,2,3")
        assert r.status_code == 200 and r.json()["ortalama"] == 2
        for b in ("content-security-policy", "x-content-type-options", "x-frame-options", "referrer-policy", "permissions-policy", "cache-control"):
            assert b in r.headers
        assert c.get("/v1/ortalama?sayilar=a,b").status_code == 400
        for yol in ("/docs", "/redoc", "/openapi.json"):
            assert c.get(yol).status_code == 404


def test_hiz_siniri_ve_sahte_vekil_basligi():
    with istemci(DAKIKALIK_ISTEK="5") as c:
        assert [c.get("/v1/ortalama?sayilar=1").status_code for _ in range(7)][-2:] == [429, 429]
        assert c.get("/v1/ortalama?sayilar=1", headers={"x-forwarded-for": "1.2.3.4"}).status_code == 429
        assert c.get("/healthz").status_code == 200


def test_mcp_anahtar_ve_salt_okuma():
    h = {"accept": "application/json, text/event-stream", "content-type": "application/json"}
    with istemci() as c:
        assert c.post("/mcp", json={"jsonrpc": "2.0", "id": 1, "method": "tools/list"}, headers=h).status_code == 401
        hh = {**h, "authorization": f"Bearer {MCP}"}
        r = c.post("/mcp", json={"jsonrpc": "2.0", "id": 1, "method": "tools/list"}, headers=hh)
        assert r.status_code == 200
        assert all(a["annotations"]["readOnlyHint"] for a in r.json()["result"]["tools"])
        assert c.get("/mcp", headers=hh).status_code == 405


def test_ayar_hatalari():
    assert yukle({"MCP_ENABLED": "true"}).hatalar
    assert yukle({"MCP_ANAHTARLARI": "kisa"}).hatalar
    with istemci(MCP_ENABLED="false") as c:
        assert c.post("/mcp", json={}).status_code == 404
