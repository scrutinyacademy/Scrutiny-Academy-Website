#!/usr/bin/env python3
"""Build a compact, source-aware NCERT Biology cross-chapter search index.

The generated index contains locations and unordered search terms, not the
textbook's full prose. Put the listed source PDFs in --source-dir and run this
script whenever a chapter PDF is replaced.
"""

from __future__ import annotations

import argparse
import json
import math
import re
import unicodedata
from collections import Counter
from pathlib import Path

import pdfplumber


CHAPTERS = [
    {
        "number": 11,
        "title": "Photosynthesis in Higher Plants",
        "file": "PHOTOSYNTHESIS IN HIGHER PLANTS(4).pdf",
        "first_pdf_page": 3,
        "first_printed_page": 133,
        "sections": [
            ("11.1", "What do we Know?"),
            ("11.2", "Early Experiments"),
            ("11.3", "Where does Photosynthesis take place?"),
            ("11.4", "How many Pigments are involved in Photosynthesis?"),
            ("11.5", "What is Light Reaction?"),
            ("11.6", "The Electron Transport"),
            ("11.7", "Where are the ATP and NADPH Used?"),
            ("11.8", "The C4 Pathway"),
            ("11.9", "Photorespiration"),
            ("11.10", "Factors affecting Photosynthesis"),
        ],
    },
    {
        "number": 12,
        "title": "Respiration in Plants",
        "file": "RESPIRATION IN PLANTS(4).pdf",
        "first_pdf_page": 1,
        "first_printed_page": 153,
        "sections": [
            ("12.1", "Do Plants Breathe?"),
            ("12.2", "Glycolysis"),
            ("12.3", "Fermentation"),
            ("12.4", "Aerobic Respiration"),
            ("12.5", "The Respiratory Balance Sheet"),
            ("12.6", "Amphibolic Pathway"),
            ("12.7", "Respiratory Quotient"),
        ],
    },
    {
        "number": 13,
        "title": "Plant Growth and Development",
        "file": "PLANT GROWTH AND DEVELOPMENT(4).pdf",
        "first_pdf_page": 1,
        "first_printed_page": 166,
        "sections": [
            ("13.1", "Growth"),
            ("13.2", "Differentiation, Dedifferentiation and Redifferentiation"),
            ("13.3", "Development"),
            ("13.4", "Plant Growth Regulators"),
        ],
    },
    {
        "number": 14,
        "title": "Breathing and Exchange of Gases",
        "file": "Breathing and Exchange of Gases(2).pdf",
        "first_pdf_page": 3,
        "first_printed_page": 183,
        "sections": [
            ("14.1", "Respiratory Organs"),
            ("14.1.1", "Human Respiratory System"),
            ("14.2", "Mechanism of Breathing"),
            ("14.3", "Exchange of Gases"),
            ("14.4", "Transport of Gases"),
            ("14.4.1", "Transport of Oxygen"),
            ("14.4.2", "Transport of Carbon dioxide"),
            ("14.5", "Regulation of Respiration"),
            ("14.6", "Disorders of Respiratory System"),
        ],
    },
    {
        "number": 15,
        "title": "Body Fluids and Circulation",
        "file": "BODY FLUIDS AND CIRCULATION(2).pdf",
        "first_pdf_page": 1,
        "first_printed_page": 193,
        "sections": [
            ("15.1", "Blood"),
            ("15.1.1", "Plasma"),
            ("15.1.2", "Formed Elements"),
            ("15.1.3", "Blood Groups"),
            ("15.1.4", "Coagulation of Blood"),
            ("15.2", "Lymph (Tissue Fluid)"),
            ("15.3", "Circulatory Pathways"),
            ("15.3.1", "Human Circulatory System"),
            ("15.3.2", "Cardiac Cycle"),
            ("15.3.3", "Electrocardiogram (ECG)"),
            ("15.4", "Double Circulation"),
            ("15.5", "Regulation of Cardiac Activity"),
            ("15.6", "Disorders of Circulatory System"),
        ],
    },
    {
        "number": 16,
        "title": "Excretory Products and their Elimination",
        "file": "Excretory Products and their Elimination(2).pdf",
        "first_pdf_page": 1,
        "first_printed_page": 205,
        "sections": [
            ("16.1", "Human Excretory System"),
            ("16.2", "Urine Formation"),
            ("16.3", "Function of the Tubules"),
            ("16.4", "Mechanism of Concentration of the Filtrate"),
            ("16.5", "Regulation of Kidney Function"),
            ("16.6", "Micturition"),
            ("16.7", "Role of other Organs in Excretion"),
            ("16.8", "Disorders of the Excretory System"),
        ],
    },
    {
        "number": 17,
        "title": "Locomotion and Movement",
        "file": "Locomotion and Movement(2).pdf",
        "first_pdf_page": 1,
        "first_printed_page": 217,
        "sections": [
            ("17.1", "Types of Movement"),
            ("17.2", "Muscle"),
            ("17.3", "Skeletal System"),
            ("17.4", "Joints"),
            ("17.5", "Disorders of Muscular and Skeletal System"),
        ],
    },
    {
        "number": 18,
        "title": "Neural Control and Coordination",
        "file": "Neural Control and Coordination(2).pdf",
        "first_pdf_page": 1,
        "first_printed_page": 230,
        "sections": [
            ("18.1", "Neural System"),
            ("18.2", "Human Neural System"),
            ("18.3", "Neuron as Structural and Functional Unit of Neural System"),
            ("18.3.1", "Generation and Conduction of Nerve Impulse"),
            ("18.3.2", "Transmission of Impulses"),
            ("18.4", "Central Neural System"),
        ],
    },
    {
        "number": 19,
        "title": "Chemical Coordination and Integration",
        "file": "Chemical Coordination and Integration(2).pdf",
        "first_pdf_page": 1,
        "first_printed_page": 239,
        "sections": [
            ("19.1", "Endocrine Glands and Hormones"),
            ("19.2", "Human Endocrine System"),
            ("19.2.1", "The Hypothalamus"),
            ("19.2.2", "The Pituitary Gland"),
            ("19.2.3", "The Pineal Gland"),
            ("19.2.4", "Thyroid Gland"),
            ("19.2.5", "Parathyroid Gland"),
            ("19.2.6", "Thymus"),
            ("19.2.7", "Adrenal Gland"),
            ("19.2.8", "Pancreas"),
            ("19.2.9", "Testis"),
            ("19.2.10", "Ovary"),
            ("19.3", "Hormones of Heart, Kidney and Gastrointestinal Tract"),
            ("19.4", "Mechanism of Hormone Action"),
        ],
    },
]

# Exact heading locations verified against the rendered Reprint 2026-27 PDFs.
# Pages without a new heading inherit the final heading from the previous page.
PAGE_SECTIONS = {
    11: {
        3: [("11.1", "What do we Know?")],
        4: [("11.2", "Early Experiments")],
        6: [("11.3", "Where does Photosynthesis take place?")],
        7: [("11.4", "How many Pigments are involved in Photosynthesis?")],
        8: [("11.5", "What is Light Reaction?"), ("11.6", "The Electron Transport")],
        9: [("11.6.1", "Splitting of Water"), ("11.6.2", "Cyclic and Non-cyclic Photophosphorylation")],
        10: [("11.6.3", "Chemiosmotic Hypothesis")],
        12: [("11.7", "Where are the ATP and NADPH Used?")],
        13: [("11.7.1", "The Primary Acceptor of CO2"), ("11.7.2", "The Calvin Cycle")],
        15: [("11.8", "The C4 Pathway")],
        17: [("11.9", "Photorespiration")],
        19: [("11.10", "Factors affecting Photosynthesis"), ("11.10.1", "Light")],
        20: [("11.10.2", "Carbon dioxide Concentration"), ("11.10.3", "Temperature"), ("11.10.4", "Water")],
    },
    12: {
        1: [("12.1", "Do Plants Breathe?")],
        3: [("12.2", "Glycolysis")],
        5: [("12.3", "Fermentation")],
        6: [("12.4", "Aerobic Respiration"), ("12.4.1", "Tricarboxylic Acid Cycle")],
        7: [("12.4.2", "Electron Transport System and Oxidative Phosphorylation")],
        9: [("12.5", "The Respiratory Balance Sheet")],
        10: [("12.6", "Amphibolic Pathway")],
        11: [("12.7", "Respiratory Quotient")],
    },
    13: {
        1: [("13.1", "Growth")],
        2: [("13.1.1", "Plant Growth Generally is Indeterminate")],
        3: [("13.1.2", "Growth is Measurable"), ("13.1.3", "Phases of Growth")],
        4: [("13.1.4", "Growth Rates")],
        6: [("13.1.5", "Conditions for Growth")],
        7: [("13.2", "Differentiation, Dedifferentiation and Redifferentiation"), ("13.3", "Development")],
        9: [("13.4", "Plant Growth Regulators"), ("13.4.1", "Characteristics"), ("13.4.2", "Discovery of Plant Growth Regulators")],
        10: [("13.4.3", "Physiological Effects of Plant Growth Regulators")],
    },
    14: {
        3: [("14.1", "Respiratory Organs")],
        4: [("14.1.1", "Human Respiratory System")],
        5: [("14.2", "Mechanism of Breathing")],
        6: [("14.2.1", "Respiratory Volumes and Capacities")],
        7: [("14.3", "Exchange of Gases")],
        9: [("14.4", "Transport of Gases"), ("14.4.1", "Transport of Oxygen"), ("14.4.2", "Transport of Carbon dioxide")],
        10: [("14.5", "Regulation of Respiration"), ("14.6", "Disorders of Respiratory System")],
    },
    15: {
        1: [("15.1", "Blood"), ("15.1.1", "Plasma")],
        2: [("15.1.2", "Formed Elements")],
        3: [("15.1.3", "Blood Groups")],
        4: [("15.1.4", "Coagulation of Blood")],
        5: [("15.2", "Lymph (Tissue Fluid)"), ("15.3", "Circulatory Pathways")],
        6: [("15.3.1", "Human Circulatory System")],
        7: [("15.3.2", "Cardiac Cycle")],
        8: [("15.3.3", "Electrocardiogram (ECG)")],
        9: [("15.4", "Double Circulation")],
        10: [("15.5", "Regulation of Cardiac Activity"), ("15.6", "Disorders of Circulatory System")],
    },
    16: {
        1: [("16.1", "Human Excretory System")],
        4: [("16.2", "Urine Formation")],
        5: [("16.3", "Function of the Tubules")],
        6: [("16.4", "Mechanism of Concentration of the Filtrate")],
        8: [("16.5", "Regulation of Kidney Function"), ("16.6", "Micturition")],
        9: [("16.7", "Role of other Organs in Excretion"), ("16.8", "Disorders of the Excretory System")],
    },
    17: {
        1: [("17.1", "Types of Movement")],
        2: [("17.2", "Muscle")],
        5: [("17.2.1", "Structure of Contractile Proteins"), ("17.2.2", "Mechanism of Muscle Contraction")],
        8: [("17.3", "Skeletal System")],
        10: [("17.4", "Joints")],
        11: [("17.5", "Disorders of Muscular and Skeletal System")],
    },
    18: {
        1: [("18.1", "Neural System")],
        2: [("18.1", "Neural System"), ("18.2", "Human Neural System"), ("18.3", "Neuron as Structural and Functional Unit of Neural System")],
        3: [("18.3.1", "Generation and Conduction of Nerve Impulse")],
        5: [("18.3.2", "Transmission of Impulses")],
        6: [("18.4", "Central Neural System")],
        7: [("18.4.1", "Forebrain"), ("18.4.2", "Midbrain"), ("18.4.3", "Hindbrain")],
    },
    19: {
        1: [("19.1", "Endocrine Glands and Hormones")],
        2: [("19.2", "Human Endocrine System"), ("19.2.1", "The Hypothalamus")],
        3: [("19.2.2", "The Pituitary Gland")],
        4: [("19.2.3", "The Pineal Gland"), ("19.2.4", "Thyroid Gland")],
        5: [("19.2.5", "Parathyroid Gland"), ("19.2.6", "Thymus")],
        6: [("19.2.7", "Adrenal Gland")],
        7: [("19.2.8", "Pancreas")],
        8: [("19.2.9", "Testis"), ("19.2.10", "Ovary")],
        9: [("19.3", "Hormones of Heart, Kidney and Gastrointestinal Tract"), ("19.4", "Mechanism of Hormone Action")],
    },
}

STOPWORDS = set("""
a about above after again against all also am an and any are as at be because been before being below between
both but by can could did do does doing down during each few for from further had has have having he her here
hers herself him himself his how i if in into is it its itself just me more most my myself no nor not now of off
on once only or other our ours ourselves out over own same she should so some such than that the their theirs them
themselves then there these they this those through to too under until up very was we were what when where which
while who whom why will with you your yours yourself yourselves biology chapter figure table reprint exercise
exercises summary and/or per cent one two three four five six seven eight nine ten
""".split())


def normalise(value: str) -> str:
    value = unicodedata.normalize("NFKD", value)
    value = "".join(ch for ch in value if not unicodedata.combining(ch))
    value = value.lower().replace("α", " alpha ").replace("β", " beta ").replace("γ", " gamma ")
    return re.sub(r"[^a-z0-9]+", " ", value).strip()


def tokens(value: str) -> list[str]:
    return [token for token in normalise(value).split() if len(token) > 1 and not token.isdigit()]


def section_hits(text: str, sections: list[tuple[str, str]]) -> list[tuple[str, str]]:
    compact = normalise(text)
    hits = []
    for section_id, title in sections:
        title_words = [word for word in tokens(title) if word not in STOPWORDS]
        signature = " ".join([normalise(section_id), *title_words[:2]])
        if signature and signature in compact:
            hits.append((section_id, title))
    return hits


def build(source_dir: Path) -> dict:
    pages = []
    for chapter in CHAPTERS:
        source = source_dir / chapter["file"]
        if not source.exists():
            raise FileNotFoundError(source)
        current_section = chapter["sections"][0]
        with pdfplumber.open(source) as pdf:
            for pdf_page, page in enumerate(pdf.pages, 1):
                if pdf_page < chapter["first_pdf_page"]:
                    continue
                text = page.extract_text(x_tolerance=2, y_tolerance=3) or ""
                if len(normalise(text)) < 80:
                    continue
                hits = PAGE_SECTIONS.get(chapter["number"], {}).get(pdf_page, [])
                if hits:
                    current_section = hits[-1]
                display_sections = hits or [current_section]
                section = " / ".join(f"{number} {title}" for number, title in display_sections)
                page_tokens = tokens(text)
                pages.append({
                    "id": f"bio-x-{chapter['number']}-{pdf_page:02d}",
                    "class": 11,
                    "subject": "Biology",
                    "topic": section,
                    "chapter": chapter["title"],
                    "chapterNumber": chapter["number"],
                    "section": section,
                    "sourceLabel": "NCERT Biology Class XI, Reprint 2026-27",
                    "pdfFilename": chapter["file"],
                    "pdfPage": pdf_page,
                    "printedPage": chapter["first_printed_page"] + pdf_page - chapter["first_pdf_page"],
                    "_tokens": page_tokens,
                })

    document_frequency = Counter()
    for page in pages:
        document_frequency.update(set(page["_tokens"]))

    total_pages = len(pages)
    for page in pages:
        counts = Counter(token for token in page["_tokens"] if token not in STOPWORDS)
        ranked = sorted(
            counts,
            key=lambda token: (-(counts[token] * (1 + math.log((total_pages + 1) / (document_frequency[token] + 1)))), token),
        )
        key_terms = ranked[:10]
        page["meaning"] = (
            f"NCERT discusses this concept in {page['section']}. "
            f"Key terms on this page include {', '.join(key_terms[:7])}."
        )
        searchable = sorted(set(page.pop("_tokens")) | set(tokens(page["section"])) | set(tokens(page["chapter"])))
        page["keywords"] = " ".join(searchable)
        page["detailed"] = True
        page["crossChapter"] = True

    return {
        "schemaVersion": 1,
        "title": "NCERT Class 11 Biology cross-chapter page index",
        "description": "Searchable locations from nine official NCERT Biology chapter PDFs, with cross-chapter occurrence discovery.",
        "sourceEdition": "Reprint 2026-27",
        "chapterCount": len(CHAPTERS),
        "pageRecordCount": len(pages),
        "chapters": [
            {
                "number": chapter["number"],
                "name": chapter["title"],
                "file": chapter["file"],
                "firstPdfPage": chapter["first_pdf_page"],
                "firstPrintedPage": chapter["first_printed_page"],
            }
            for chapter in CHAPTERS
        ],
        "records": pages,
    }


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--source-dir", type=Path, required=True)
    parser.add_argument(
        "--output",
        type=Path,
        default=Path("data/ncert/biology-cross-chapter-index.json"),
    )
    args = parser.parse_args()
    result = build(args.source_dir)
    args.output.parent.mkdir(parents=True, exist_ok=True)
    args.output.write_text(json.dumps(result, ensure_ascii=False, separators=(",", ":")), encoding="utf-8")
    print(
        f"Wrote {result['pageRecordCount']} searchable page records "
        f"across {result['chapterCount']} chapters to {args.output}"
    )


if __name__ == "__main__":
    main()
