#!/usr/bin/env python3
"""Check vector/PDF fidelity and chapter coverage. Writes QA only when requested.
Usage: python scripts/validate-physics-formula-art.py /tmp/qa-directory
Requires PyMuPDF, libcairo, librsvg, Pillow, NumPy and Poppler.
"""
import hashlib
import ctypes as C
import json
import re
import subprocess
import sys
import xml.etree.ElementTree as ET
from pathlib import Path

import fitz
import numpy as np
from PIL import Image, ImageDraw


def render_svg(source, target, width, height):
    # librsvg supports the PDF's luminance masks; CairoSVG does not.
    rsvg = C.CDLL("librsvg-2.so.2")
    cairo = C.CDLL("libcairo.so.2")
    gobject = C.CDLL("libgobject-2.0.so.0")
    rsvg.rsvg_handle_new_from_file.argtypes = [C.c_char_p, C.c_void_p]
    rsvg.rsvg_handle_new_from_file.restype = C.c_void_p
    rsvg.rsvg_handle_render_cairo.argtypes = [C.c_void_p, C.c_void_p]
    rsvg.rsvg_handle_render_cairo.restype = C.c_int
    cairo.cairo_image_surface_create.argtypes = [C.c_int, C.c_int, C.c_int]
    cairo.cairo_image_surface_create.restype = C.c_void_p
    cairo.cairo_create.argtypes = [C.c_void_p]
    cairo.cairo_create.restype = C.c_void_p
    cairo.cairo_set_source_rgb.argtypes = [C.c_void_p, C.c_double, C.c_double, C.c_double]
    cairo.cairo_paint.argtypes = [C.c_void_p]
    cairo.cairo_scale.argtypes = [C.c_void_p, C.c_double, C.c_double]
    cairo.cairo_surface_write_to_png.argtypes = [C.c_void_p, C.c_char_p]
    cairo.cairo_destroy.argtypes = [C.c_void_p]
    cairo.cairo_surface_destroy.argtypes = [C.c_void_p]
    gobject.g_object_unref.argtypes = [C.c_void_p]
    handle = rsvg.rsvg_handle_new_from_file(str(source).encode(), None)
    assert handle
    surface = cairo.cairo_image_surface_create(0, width, height)
    cr = cairo.cairo_create(surface)
    cairo.cairo_set_source_rgb(cr, 1, 1, 1)
    cairo.cairo_paint(cr)
    cairo.cairo_scale(cr, width / 595.44, height / 841.68)
    assert rsvg.rsvg_handle_render_cairo(handle, cr)
    assert cairo.cairo_surface_write_to_png(surface, str(target).encode()) == 0
    cairo.cairo_destroy(cr)
    cairo.cairo_surface_destroy(surface)
    gobject.g_object_unref(handle)

ROOT = Path(__file__).resolve().parents[1]
DATA = ROOT / "assets/physics-formulas"
catalog = json.loads((DATA / "catalog.json").read_text())
pdf = fitz.open(DATA / "source.pdf")
out = Path(sys.argv[1])
out.mkdir(parents=True, exist_ok=True)
assert hashlib.sha256((DATA / "source.pdf").read_bytes()).hexdigest() == catalog["source"]["sha256"]
assert len(catalog["chapters"]) == 34
assert len({c["id"] for c in catalog["chapters"]}) == 34
assert set(range(1, 12)) == {f["page"] for c in catalog["chapters"] for f in c["fragments"]}
all_fragments = [(c, f) for c in catalog["chapters"] for f in c["fragments"]]
missed, cut = [], []
for pno, page in enumerate(pdf, 1):
    regions = [(c, f, fitz.Rect(f["viewBox"][0], f["viewBox"][1], f["viewBox"][0] + f["viewBox"][2], f["viewBox"][1] + f["viewBox"][3])) for c, f in all_fragments if f["page"] == pno]
    for block in page.get_text("dict")["blocks"]:
        for line in block.get("lines", []):
            text = "".join(s["text"] for s in line["spans"]).strip()
            if not text or text.startswith("Deepak"):
                continue
            r = fitz.Rect(line["bbox"])
            # Main document title / unit labels are not chapter formula content.
            if (pno == 1 and r.y0 < 90) or (r.y0 < 48 and r.x0 < 297.72 and pno in {4, 6, 7, 8, 11}) or (pno == 1 and 447 <= r.y0 <= 475 and r.x0 < 297.72):
                continue
            center = fitz.Point((r.x0 + r.x1) / 2, (r.y0 + r.y1) / 2)
            matches = [(c, f, rect) for c, f, rect in regions if center in rect]
            if not matches:
                missed.append((pno, text, tuple(r)))
            elif r.y0 < matches[0][2].y0 - 1 or r.y1 > matches[0][2].y1 + 1:
                cut.append((pno, text, tuple(r), tuple(matches[0][2])))
    svgpath = DATA / f"page-{pno:02}.svg"
    root = ET.parse(svgpath).getroot()
    assert root.tag.endswith("svg")
    assert not any(e.tag.endswith("script") or any(k.startswith("on") for k in e.attrib) for e in root.iter())
    assert not re.search(r'(?:href|url)=["\']https?://', svgpath.read_text())
    # Both use Cairo, but independently exercise PDF paint vs SVG paint at 144dpi.
    subprocess.run(["pdftocairo", "-f", str(pno), "-l", str(pno), "-r", "144", "-singlefile", "-png", str(DATA / "source.pdf"), str(out / f"pdf-{pno:02}")], check=True, stderr=subprocess.DEVNULL)
    original = Image.open(out / f"pdf-{pno:02}.png").convert("RGB")
    render_svg(svgpath, out / f"svg-{pno:02}.png", original.width, original.height)
    vector = Image.open(out / f"svg-{pno:02}.png").convert("RGB")
    # Different antialiasing is expected; structural comparison uses soft pixels.
    diff = np.abs(np.asarray(original, dtype=float) - np.asarray(vector, dtype=float))
    print(f"Page {pno:02}: mean RGB difference {diff.mean():.3f}/255; source/SVG {original.size}")
    assert diff.mean() < 12, f"Large render discrepancy on page {pno}"

assert not missed, f"Unmapped formula text: {missed}"
assert not cut, f"Formula text cut by chapter boundary: {cut}"
print("PASS: unchanged source checksum, 34 unique chapters, all 11 pages and formula text covered.")

# Contact sheets of actual SVG renders, labelled to inspect every chapter part.
for start in range(0, len(all_fragments), 10):
    batch = all_fragments[start:start + 10]
    thumbs = []
    for chapter, fragment in batch:
        img = Image.open(out / f"svg-{fragment['page']:02}.png")
        sx = img.width / catalog["source"]["width"]
        sy = img.height / catalog["source"]["height"]
        x, y, w, h = fragment["viewBox"]
        crop = img.crop((round(x*sx), round(y*sy), round((x+w)*sx), round((y+h)*sy)))
        crop.thumbnail((330, 850))
        tile = Image.new("RGB", (350, 900), "#e5eeee")
        draw = ImageDraw.Draw(tile)
        draw.text((10, 8), f"{chapter['code']} / page {fragment['page']} col {fragment['column']}", fill="#123a3d")
        tile.paste(crop, (10, 35))
        thumbs.append(tile)
    sheet = Image.new("RGB", (350*5, 900*2), "white")
    for i, tile in enumerate(thumbs):
        sheet.paste(tile, ((i % 5)*350, (i // 5)*900))
    sheet.save(out / f"contact-{start//10+1}.jpg")
