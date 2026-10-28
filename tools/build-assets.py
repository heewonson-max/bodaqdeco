#!/usr/bin/env python3
"""
Bodaq Deco — derived asset builder.

Generates the renewal-only images from the ORIGINAL site assets. Original files
under assets/{logo,spaces,carousel,patterns-display,patterns-thumbnail} are never
modified; everything this script writes lands in assets/renewal/.

  python3 tools/build-assets.py          (run from the project root)

Requires Pillow  (pip install pillow)

What it builds
  assets/renewal/swatches/<dir>/<CODE>-720.jpg / -360.jpg
      Index-grid material plates (4:5). Cropped from the final composite
      (space render × pattern overlay), so lighting matches the real render.
  assets/renewal/hero/hero-main.jpg
      Pre-composited hero (Vertical Wood · CW02 E22P, living room).
  assets/renewal/og/og-image.jpg
      1200×630 social preview.
  assets/renewal/logo/logo-mask.png
      Trimmed logo used as a CSS mask (colour follows the theme).

When a collection gets a new finish, add its display/thumbnail files with the
existing naming, add it to data/catalog.js, and re-run this script.
"""
from pathlib import Path
from PIL import Image, ImageChops

ROOT = Path(__file__).resolve().parent.parent
A = ROOT / "assets"
OUT = A / "renewal"

# Crop windows (x, y, w, h) in the space render's own pixel space, 4:5.
# Chosen by hand so each plate shows only the material surface.
CROPS = {
    "glossy":        (400, 60, 640, 800),     # built-in storage wall
    "vertical":      (0, 200, 320, 400),     # entry wall panel, above niche
    "ceramic":       (272, 766, 416, 520),    # kitchen island front
    "travertine":    (480, 80, 440, 550),     # wardrobe doors
    "vertical-wood": (40, 236, 324, 405),     # wall above fireplace
    "noble-oak":     (60, 60, 1100, 1375),    # oak wall (2000px source)
}

PRODUCTS = {
    "glossy": ["WH517_E46", "IV055_E46", "GY123_E46", "GY116_E46"],
    "vertical": ["AH01_E30P", "AH04_E30P"],
    "ceramic": ["DK03_ES10P", "DK06_ES10P"],
    "travertine": ["WH111_E45", "KWH203_E45", "GY01D_E45"],
    "vertical-wood": ["CW01_E22P", "CW02_E22P"],
    "noble-oak": ["SX7K1G", "SX7K2G", "SX7K3G"],
}


def composite(space_dir: str, code: str) -> Image.Image:
    base = Image.open(A / "spaces" / f"{space_dir}-space.jpg").convert("RGB")
    over = Image.open(A / "patterns-display" / space_dir / f"{code}.jpg").convert("RGB")
    if over.size != base.size:
        over = over.resize(base.size, Image.LANCZOS)
    return ImageChops.multiply(base, over)


def save(img: Image.Image, path: Path, q=84):
    path.parent.mkdir(parents=True, exist_ok=True)
    img.save(path, "JPEG", quality=q, optimize=True, progressive=True)


def main():
    for d, codes in PRODUCTS.items():
        x, y, w, h = CROPS[d]
        for code in codes:
            plate = composite(d, code).crop((x, y, x + w, y + h))
            for size in (720, 360):
                target = plate.resize((size, size * 5 // 4), Image.LANCZOS)
                save(target, OUT / "swatches" / d / f"{code}-{size}.jpg")
            print("swatch", d, code)

    hero = composite("vertical-wood", "CW02_E22P")
    save(hero, OUT / "hero" / "hero-main.jpg", q=86)

    og = hero.crop((0, 300, 1080, 300 + 567)).resize((1200, 630), Image.LANCZOS)
    save(og, OUT / "og" / "og-image.jpg", q=82)

    logo = Image.open(A / "logo" / "logo-white.png").convert("RGBA")
    logo = logo.crop(logo.getbbox())
    logo = logo.resize((1200, round(logo.height * 1200 / logo.width)), Image.LANCZOS)
    (OUT / "logo").mkdir(parents=True, exist_ok=True)
    logo.save(OUT / "logo" / "logo-mask.png", optimize=True)
    print("hero, og, logo done")


if __name__ == "__main__":
    main()
