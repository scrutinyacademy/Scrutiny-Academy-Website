#!/usr/bin/env python3
"""Reproducible, non-OCR extraction: retain the supplied PDF's vector artwork.

Run: python scripts/build-physics-formula-vault.py path/to/source.pdf
Requires PyMuPDF and Poppler's pdftocairo. Formula text is NOT retyped.
The catalog records exact page/column rectangles; the browser crops SVG views.
"""
import hashlib
import json
import re
import shutil
import sys
from pathlib import Path

import fitz

ROOT = Path(__file__).resolve().parents[1]
DEST = ROOT / "assets/physics-formulas"
GROUPS = ["Reference", "Mechanics", "Waves", "Optics", "Heat & Thermodynamics", "Electricity & Magnetism", "Modern Physics"]
# Human-readable search vocabulary, not a transcription of the mathematics.
TOPICS = {
    "0.1": "Units and measurements, SI constants, electron, proton, Planck, Boltzmann, Avogadro, gravitational constant",
    "1.1": "Motion in a plane, components, vector addition, dot product, cross product",
    "1.2": "Motion in a straight line, motion in a plane, acceleration, projectile, range, relative velocity, circular motion",
    "1.3": "Laws of motion, momentum, impulse, friction, centripetal force, banking",
    "1.4": "Work energy and power, kinetic energy, potential energy, spring, conservation",
    "1.5": "System of particles, centre of mass, center of mass, momentum, elastic collision, restitution",
    "1.6": "System of particles and rotational motion, torque, moment of inertia, angular momentum, rolling",
    "1.7": "Gravitation, satellite, escape velocity, orbital velocity, Kepler, gravitational potential",
    "1.8": "Oscillations, SHM, spring, pendulum, simple harmonic motion, superposition",
    "1.9": "Mechanical properties of solids, mechanical properties of fluids, elasticity, Young modulus, surface tension, viscosity, Bernoulli, Stokes, capillary",
    "2.1": "Waves, wave equation, wavelength, wave number, progressive wave, frequency",
    "2.2": "Waves, string, transverse wave, standing wave, interference, harmonics, sonometer",
    "2.3": "Waves, sound, organ pipe, resonance, Doppler effect, beats, intensity",
    "2.4": "Wave optics, interference, Young double slit, YDSE, diffraction, polarization, Malus law",
    "3.1": "Ray optics and optical instruments, mirror formula, reflection, magnification, focal length",
    "3.2": "Ray optics and optical instruments, refraction, Snell law, critical angle, prism, lens formula, lens maker, power of lens",
    "3.3": "Ray optics and optical instruments, microscope, telescope, magnification, resolving power",
    "3.4": "Ray optics, dispersion, prism, Cauchy equation, dispersive power",
    "4.1": "Thermal properties of matter, temperature, expansion, ideal gas, van der Waals, thermal stress",
    "4.2": "Kinetic theory, gases, RMS speed, average speed, Maxwell distribution, equipartition",
    "4.3": "Thermal properties of matter, specific heat, heat capacity, latent heat, gas mixture, internal energy",
    "4.4": "Thermodynamics, first law, isothermal, isobaric, adiabatic, isochoric, Carnot, entropy, refrigerator",
    "4.5": "Thermal properties of matter, heat transfer, conduction, thermal resistance, radiation, Wien, Stefan Boltzmann, cooling",
    "5.1": "Electric charges and fields, electrostatic potential, Coulomb law, dipole, electric field, potential energy",
    "5.2": "Electric charges and fields, electrostatic potential, Gauss law, flux, charged sphere, shell, ring, sheet",
    "5.3": "Electrostatic potential and capacitance, capacitors, dielectric, series, parallel, energy",
    "5.4": "Current electricity, Ohm law, Kirchhoff, resistivity, Wheatstone bridge, galvanometer, RC circuit, charging capacitor, thermoelectricity, electrolysis",
    "5.5": "Moving charges and magnetism, magnetism and matter, Lorentz force, magnetic moment, Hall effect",
    "5.6": "Moving charges and magnetism, magnetism and matter, Biot Savart, Ampere, solenoid, toroid, dip, galvanometer",
    "5.7": "Electromagnetic induction, alternating current, electromagnetic waves, Faraday, Lenz, inductance, LCR, impedance, transformer, resonance",
    "6.1": "Dual nature of radiation and matter, photoelectric effect, photon, stopping potential, de Broglie",
    "6.2": "Atoms, Bohr, Rydberg, spectrum, X ray, Moseley, uncertainty principle",
    "6.3": "Nuclei, radioactivity, half life, mass defect, binding energy, decay, nuclear reaction",
    "6.4": "Semiconductor electronics, electronic devices, diode, rectifier, transistor, logic gates, vacuum tube, triode",
}


def main(source):
    DEST.mkdir(parents=True, exist_ok=True)
    target = DEST / "source.pdf"
    if source.resolve() != target.resolve():
        shutil.copyfile(source, target)
    pdf = fitz.open(target)
    assert len(pdf) == 11, "This extraction map is for the supplied 11-page PDF."
    chapters, active = [], None
    group_start_pages = {1, 4, 6, 7, 8, 11}
    for pno, page in enumerate(pdf, 1):
        svg = DEST / f"page-{pno:02}.svg"
        # Convert text to paths so every radical, fraction, subscript and symbol
        # renders independently of device fonts while all diagrams stay vector.
        svg.write_text(page.get_svg_image(text_as_path=True))
        lines = [line for b in page.get_text("dict")["blocks"] if "lines" in b for line in b["lines"]]
        headings = []
        for line in lines:
            text = "".join(s["text"] for s in line["spans"]).strip()
            match = re.match(r"^(\d+\.\d+):\s*(.+)", text)
            if match:
                headings.append((match[1], match[2], line["bbox"]))
        for col in range(2):
            col_heads = sorted([h for h in headings if (h[2][0] > 300) == bool(col)], key=lambda h: h[2][1])
            x0, x1 = (14, 297.72) if col == 0 else (297.72, 581.44)
            cursor = 18.0

            def fragment(end):
                if active and end - cursor > 20:
                    active["fragments"].append({"page": pno, "column": col + 1, "viewBox": [x0, round(cursor, 3), round(x1 - x0, 3), round(end - cursor, 3)]})

            for code, title, box in col_heads:
                start = box[1] - 6
                # Group titles are navigation, not part of the previous chapter.
                if not (col == 0 and pno in group_start_pages and start < 110):
                    fragment(447.0 if code == "1.1" else start)
                # Normalize ligatures emitted by the PDF text layer so chapter
                # labels and deep-link IDs remain readable and searchable.
                title = title.translate(str.maketrans({"ﬀ": "ff", "ﬁ": "fi", "ﬂ": "fl", "ﬃ": "ffi", "ﬄ": "ffl"}))
                slug = re.sub(r"[^a-z0-9]+", "-", title.lower()).strip("-")
                if code == "4.4":
                    title, slug = "Thermodynamic Processes", "thermodynamic-processes"
                active = {"id": slug, "code": code, "title": title, "group": GROUPS[int(code[0])], "topics": TOPICS[code], "fragments": []}
                chapters.append(active)
                cursor = start
            fragment(803.0)
    assert len(chapters) == len(TOPICS) == 34
    assert {c["code"] for c in chapters} == set(TOPICS)
    # Catalog follows actual reading order (left column, then right column).
    for chapter in chapters:
        chapter["pages"] = sorted({f["page"] for f in chapter["fragments"]})
        for fragment in chapter["fragments"]:
            fragment["asset"] = f"assets/physics-formulas/page-{fragment['page']:02}.svg"
    catalog = {"version": 1, "source": {"url": "assets/physics-formulas/source.pdf", "filename": source.name, "title": "Physics Formulas for Class 11 and Class 12", "author": pdf.metadata.get("author", ""), "pageCount": len(pdf), "sha256": hashlib.sha256(target.read_bytes()).hexdigest(), "width": pdf[0].rect.width, "height": pdf[0].rect.height}, "chapters": chapters}
    (DEST / "catalog.json").write_text(json.dumps(catalog, ensure_ascii=False, indent=2) + "\n")
    print(f"Extracted {len(pdf)} vector pages, {len(chapters)} chapters, {sum(len(c['fragments']) for c in chapters)} source regions.")


if __name__ == "__main__":
    main(Path(sys.argv[1]))
