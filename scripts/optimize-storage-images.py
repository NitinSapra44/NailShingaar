#!/usr/bin/env python3
"""Create small WebP copies of every photo in the `product-images` bucket.

Writes opt/w600/<path>.webp and opt/w1200/<path>.webp next to each original
(see src/lib/images.ts), cached for a year. Originals are never modified.
Photos that already have both copies are skipped, so it's safe to re-run, e.g.
after uploads from a browser that couldn't make the copies itself.

Needs: pip install pillow; NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY
in .env.local (service key: server only, never commit it).

    python3 scripts/optimize-storage-images.py            # do it
    python3 scripts/optimize-storage-images.py --dry-run  # just report
"""
import io
import json
import pathlib
import sys
import urllib.parse
import subprocess

from PIL import Image, ImageOps

BUCKET = "product-images"
WIDTHS = (600, 1200)
QUALITY = {600: 76, 1200: 80}
IMAGE_EXT = (".jpg", ".jpeg", ".png", ".webp")
CACHE = "public, max-age=31536000, immutable"

ROOT = pathlib.Path(__file__).resolve().parent.parent
env = {}
for line in (ROOT / ".env.local").read_text().splitlines():
    line = line.strip()
    if line and not line.startswith("#") and "=" in line:
        k, v = line.split("=", 1)
        env[k] = v
URL = env["NEXT_PUBLIC_SUPABASE_URL"].rstrip("/")
KEY = env.get("SUPABASE_SERVICE_ROLE_KEY") or sys.exit("SUPABASE_SERVICE_ROLE_KEY missing in .env.local")
AUTH = {"Authorization": f"Bearer {KEY}", "apikey": KEY}
DRY = "--dry-run" in sys.argv


def request(method, path, body=None, headers=None):
    # curl rather than urllib: some macOS Python installs lack root certificates.
    cmd = ["curl", "-sS", "--fail-with-body", "--max-time", "120", "-X", method, f"{URL}{path}"]
    for k, v in {**AUTH, **(headers or {})}.items():
        cmd += ["-H", f"{k}: {v}"]
    if body is not None:
        cmd += ["--data-binary", "@-"]
    r = subprocess.run(cmd, input=body, capture_output=True)
    if r.returncode != 0:
        raise RuntimeError(f"{method} {path} failed: {r.stderr.decode()[:200]} {r.stdout[:200]!r}")
    return r.stdout


def list_objects(prefix=""):
    """All object paths under prefix (the list API returns one folder level per call)."""
    out, offset = [], 0
    while True:
        body = json.dumps({"prefix": prefix, "limit": 1000, "offset": offset,
                           "sortBy": {"column": "name", "order": "asc"}}).encode()
        items = json.loads(request("POST", f"/storage/v1/object/list/{BUCKET}", body,
                                   {"Content-Type": "application/json"}))
        for it in items:
            path = f"{prefix}{it['name']}"
            if it.get("id") is None:          # a folder
                out += list_objects(path + "/")
            else:
                out.append(path)
        if len(items) < 1000:
            return out
        offset += 1000


def variant_path(path, width):
    return f"opt/w{width}/{path.rsplit('.', 1)[0]}.webp"


def main():
    print("Listing bucket…")
    objects = list_objects()
    existing = {p for p in objects if p.startswith("opt/")}
    originals = [p for p in objects if not p.startswith("opt/") and p.lower().endswith(IMAGE_EXT)]
    todo = [p for p in originals if any(variant_path(p, w) not in existing for w in WIDTHS)]
    print(f"{len(originals)} photos, {len(originals) - len(todo)} already done, {len(todo)} to process")
    if DRY:
        return

    before = after = failed = 0
    for n, path in enumerate(todo, 1):
        quoted = urllib.parse.quote(path)
        try:
            raw = request("GET", f"/storage/v1/object/{BUCKET}/{quoted}")
            img = ImageOps.exif_transpose(Image.open(io.BytesIO(raw)))
            img = img.convert("RGBA" if img.mode in ("RGBA", "LA", "P") else "RGB")
            before += len(raw)
            for w in WIDTHS:
                copy = img.copy()
                if copy.width > w:
                    copy = copy.resize((w, round(copy.height * w / copy.width)), Image.LANCZOS)
                buf = io.BytesIO()
                copy.save(buf, "WEBP", quality=QUALITY[w], method=6)
                data = buf.getvalue()
                after += len(data) if w == 600 else 0
                request("POST", f"/storage/v1/object/{BUCKET}/{urllib.parse.quote(variant_path(path, w))}", data,
                        {"Content-Type": "image/webp", "Cache-Control": CACHE, "x-upsert": "true"})
            print(f"[{n}/{len(todo)}] {path}  {len(raw)//1024} KB -> {len(data)//1024} KB (1200w)")
        except Exception as e:  # keep going; the site falls back to the original
            failed += 1
            print(f"[{n}/{len(todo)}] FAILED {path}: {e}")

    print(f"\nDone. Originals {before/1e6:.1f} MB; card-size copies {after/1e6:.1f} MB; {failed} failed")


if __name__ == "__main__":
    main()
