"""Başlatma: python -m analiz   (ayarlar: .env.example)"""
import logging
import sys

import uvicorn

from .app import olustur
from .config import yukle

logging.basicConfig(level=logging.INFO, format="%(asctime)s %(name)s %(message)s")
logging.getLogger("httpx").setLevel(logging.WARNING)  # her Arıza Defteri isteğini kayda yazmasın


def main() -> None:
    ayarlar = yukle()
    if ayarlar.hatalar:
        print("PROJE_ADI başlatılamadı, ayarları kontrol et:\n - " + "\n - ".join(ayarlar.hatalar), file=sys.stderr)
        sys.exit(1)
    import os
    port = int(os.environ.get("PORT", "8000"))
    logging.getLogger("servis").info("PROJE_ADI: %s · MCP %s", port, "açık" if ayarlar.mcp_acik else "kapalı")
    # Ters vekilin arkasında: X-Forwarded-For'u uvicorn değil gercek_ip yorumlar (proxy_headers kapalı).
    uvicorn.run(olustur(ayarlar), host=os.environ.get("HOST", "0.0.0.0"), port=port, proxy_headers=False,
                server_header=False, date_header=False, log_level="info", timeout_keep_alive=5, limit_concurrency=64)


if __name__ == "__main__":
    main()
