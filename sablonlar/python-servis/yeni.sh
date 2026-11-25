#!/usr/bin/env bash
# Python servis şablonundan yeni proje: bash ysfdurak.com/sablonlar/python-servis/yeni.sh <proje-adi> [hedef-klasör]
# proje-adi: küçük harf, rakam, tire (ör. talep-tahmini). Docker konteyner ve compose adı olur.
set -euo pipefail
AD=${1:?Kullanım: yeni.sh <proje-adi> [hedef-klasör]}
[[ $AD =~ ^[a-z][a-z0-9-]{2,40}$ ]] || { echo "Ad küçük harf, rakam ve tireden oluşmalı (3-40 karakter)."; exit 1; }
HEDEF=${2:-$(pwd)/$AD}
[[ -e $HEDEF ]] && { echo "$HEDEF zaten var."; exit 1; }
KAYNAK=$(cd "$(dirname "$0")" && pwd)
mkdir -p "$HEDEF"
(cd "$KAYNAK" && tar --exclude=yeni.sh --exclude=__pycache__ --exclude=.pytest_cache -cf - .) | (cd "$HEDEF" && tar -xf -)
grep -rl PROJE_ADI "$HEDEF" | xargs sed -i "s/PROJE_ADI/$AD/g"
sed -i "s/Copyright [0-9]\{4\}/Copyright $(date +%Y)/" "$HEDEF/LICENSE.md"
git -C "$HEDEF" init -q -b main
echo "Hazır: $HEDEF"
echo "Sıradaki: README.md'yi yaz (lisans bölümü hazır), servis/cekirdek.py'ye işi koy, testleri çalıştır:"
echo "  python3 -m venv .venv && .venv/bin/pip install --require-hashes -r requirements.txt -r requirements-dev.txt && .venv/bin/python -m pytest -q"
echo "Bağımlılık eklerken: requirements.in'e yaz, sonra pip-compile --generate-hashes --strip-extras --allow-unsafe -o requirements.txt requirements.in"
