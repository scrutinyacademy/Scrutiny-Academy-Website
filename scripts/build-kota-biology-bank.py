#!/usr/bin/env python3
"""Build the faculty-selected KOTA Biology quiz bank from supplied PDFs.

The PDFs use a consistent two-column ALLEN exercise layout.  This builder
extracts question text and four choices, reads the printed answer keys, and
renders exact source crops for visual/table/diagram questions so the web quiz
does not lose scientific notation or artwork.
"""

from __future__ import annotations

import json
import re
import shutil
import subprocess
from pathlib import Path

import fitz
from PIL import Image


ROOT = Path(__file__).resolve().parents[1]
UPLOAD = ROOT.parent / "upload"
OUT = ROOT / "data" / "neet" / "kota-biology"
ASSETS = ROOT / "assets" / "kota-biology"

SPECS = [
    ("molecular-basis-of-inheritance", "Molecular Basis of Inheritance", "MOLECULAR BASIS OF INHERITANCE.pdf", 12),
    ("photosynthesis-in-higher-plants", "Photosynthesis in Higher Plants", "PHOTOSYNTHESIS IN HIGHER PLANTS(5).pdf", 11),
    ("locomotion-and-movement", "Locomotion & Movement", "LOCOMOTION & MOVEMENT.pdf", 11),
    ("biomolecules", "Biomolecules", "BIOMOLECULES(2).pdf", 11),
    ("enzymes", "Enzymes", "ENZYMES.pdf", 11),
    ("principles-of-inheritance-and-variation", "Principles of Inheritance & Variation", "PRINCIPLES OF INHERITANCE & VARIATIONS.pdf", 12),
    ("breathing-and-exchange-of-gases", "Breathing & Exchange of Gases", "BREATHING & EXCHANGE OF GASES.pdf", 11),
    ("cockroach", "Cockroach", "COCKROACH.pdf", 11),
    ("strategies-for-enhancement-in-food-production", "Strategies for Enhancement in Food Production", "STRATEGIES FOR ENHANCEMENT IN FOOD PRODUCTION.pdf", 12),
    ("human-health-and-disease", "Human Health & Disease", "HUMAN HEALTH & DISEASE.pdf", 12),
]

EXERCISES = [
    ("conceptual", "Exercise I · Conceptual Questions"),
    ("previous-year", "Exercise II · Previous Year Questions"),
    ("mastery", "Exercise III · NCERT & Analytical Mastery"),
]

VISUAL_RE = re.compile(
    r"\b(match|column|table|figure|diagram|graph|structure|pedigree|shown below|given below|"
    r"identify\s+(?:the\s+)?[a-d](?:,|\s+and)|reaction|pathway|cycle|chart|image|shown|"
    r"labelled|labeled|band\s*\d|curve|represented below|marked\s+(?:as|in))\b|[\uf000-\uf8ff]",
    re.I,
)


def answer_keys(pdf: Path) -> list[dict[int, int]]:
    raw = subprocess.check_output(
        ["pdftotext", "-layout", str(pdf), "-"], stderr=subprocess.DEVNULL
    ).decode("utf-8", "ignore")
    result: list[dict[int, int]] = []
    for page in raw.split("\f"):
        if "ANSWER KEY" not in page:
            continue
        section = page[page.rfind("ANSWER KEY") :]
        lines = section.splitlines()
        key: dict[int, int] = {}
        for index, line in enumerate(lines):
            if not re.match(r"\s*Que\.", line):
                continue
            questions = [int(value) for value in re.findall(r"\d+", line)]
            for next_index in range(index + 1, min(index + 4, len(lines))):
                if re.match(r"\s*Ans\.", lines[next_index]):
                    answers = [int(value) for value in re.findall(r"\d+", lines[next_index])]
                    if len(questions) != len(answers):
                        raise ValueError(f"Answer-key row mismatch in {pdf.name}")
                    key.update(zip(questions, answers))
                    break
        if key:
            result.append(key)
    if len(result) != 3:
        raise ValueError(f"Expected three answer keys in {pdf.name}; found {len(result)}")
    return result


def clean(value: str) -> str:
    value = value.replace("$//((1®", " ").replace("$//(1®", " ").replace("®", " ")
    value = re.sub(r"\b(?:ALLEN|Pre-?Medical|Join Telegram:\s*@\w+)\b", " ", value, flags=re.I)
    value = re.sub(r"\b[A-Z]{2,6}\d{4}\b", " ", value)
    value = re.sub(r"\s+", " ", value).strip(" -\n")
    return value


def parse_content(text: str, number: int) -> tuple[str, list[str]]:
    text = re.sub(rf"^\s*{number}\.?\s*", "", text.strip())
    code = list(re.finditer(r"\b[A-Z]{2,6}\d{4}\b", text))
    if code:
        text = text[: code[-1].start()]
    parts = re.split(r"[（(]\s*([1-4])\s*[)）]", text)
    question = clean(parts[0]) if parts else clean(text)
    choices: dict[int, str] = {}
    for index in range(1, len(parts) - 1, 2):
        choices[int(parts[index])] = clean(parts[index + 1])
    options = [choices.get(index, "") for index in range(1, 5)]
    return question, options


def candidates(doc: fitz.Document, expected: list[int]) -> list[list[dict]]:
    sequences: list[list[dict]] = []
    current: list[dict] = []
    columns = ((35, 295), (300, 565))
    for page_index, page in enumerate(doc):
        words = page.get_text("words")
        for column, (x0, x1) in enumerate(columns):
            starts = []
            for word in words:
                wx0, wy0, _wx1, _wy1, token, *_ = word
                if (
                    re.fullmatch(r"\d{1,3}\.", token)
                    and x0 - 2 <= wx0 < x0 + 45
                    and 65 < wy0 < 805
                ):
                    starts.append((wy0, int(token.rstrip("."))))
            starts.sort()
            for start_index, (y0, number) in enumerate(starts):
                if number == 1 and current:
                    sequences.append(current)
                    current = []
                y1 = starts[start_index + 1][0] - 2 if start_index + 1 < len(starts) else 805
                # Prefer the printed source code as the lower boundary for the
                # last question in a column, keeping footer/answer-key text out.
                if start_index + 1 == len(starts):
                    code_words = [
                        word for word in words
                        if x0 <= word[0] < x1 and y0 < word[1] < y1
                        and re.fullmatch(r"[A-Z]{2,6}\d{4}", word[4])
                    ]
                    if code_words:
                        y1 = min(805, code_words[-1][3] + 7)
                current.append({
                    "page": page_index,
                    "column": column,
                    "number": number,
                    "y0": y0,
                    "rect": fitz.Rect(x0 - 3, y0 - 2, x1, y1),
                })
    if current:
        sequences.append(current)
    selected = [sequence for sequence in sequences if sequence and sequence[0]["number"] == 1][:3]
    # A few source question numbers were printed without a trailing full stop
    # (50, 100 and 244). Recover only the exact missing sequence values so
    # ordinary numbers inside question text cannot become false starts.
    columns = ((35, 295), (300, 565))
    for sequence_index, sequence in enumerate(selected):
        missing = set(range(1, expected[sequence_index] + 1)) - {item["number"] for item in sequence}
        if not missing:
            continue
        first_page, last_page = sequence[0]["page"], sequence[-1]["page"]
        for page_index in range(first_page, last_page + 1):
            page = doc[page_index]
            for column, (x0, x1) in enumerate(columns):
                for word in page.get_text("words"):
                    wx0, wy0, _wx1, _wy1, token, *_ = word
                    if token.isdigit() and int(token) in missing and x0 - 2 <= wx0 < x0 + 45 and 65 < wy0 < 805:
                        sequence.append({"page": page_index, "column": column, "number": int(token), "y0": wy0})
                        missing.remove(int(token))
        if missing:
            raise ValueError(f"Could not recover question numbers {sorted(missing)}")
        sequence.sort(key=lambda item: (item["page"], item["column"], item["y0"]))
        for item_index, item in enumerate(sequence):
            x0, x1 = columns[item["column"]]
            following = sequence[item_index + 1] if item_index + 1 < len(sequence) else None
            if following and following["page"] == item["page"] and following["column"] == item["column"]:
                y1 = following["y0"] - 2
            else:
                y1 = 805
                words = doc[item["page"]].get_text("words")
                code_words = [
                    word for word in words
                    if x0 <= word[0] < x1 and item["y0"] < word[1] < y1
                    and re.fullmatch(r"[A-Z]{2,6}\d{4}", word[4])
                ]
                if code_words:
                    y1 = min(805, code_words[0][3] + 7)
            item["rect"] = fitz.Rect(x0 - 3, item["y0"] - 2, x1, y1)
    return selected


def render_crop(page: fitz.Page, rect: fitz.Rect, destination: Path) -> None:
    pix = page.get_pixmap(matrix=fitz.Matrix(2, 2), clip=rect, colorspace=fitz.csGRAY, alpha=False)
    image = Image.frombytes("L", (pix.width, pix.height), pix.samples)
    destination.parent.mkdir(parents=True, exist_ok=True)
    image.save(destination, "WEBP", quality=82, method=6)


def build_chapter(slug: str, title: str, filename: str, class_level: int) -> dict:
    pdf = UPLOAD / filename
    doc = fitz.open(pdf)
    shutil.rmtree(ASSETS / slug, ignore_errors=True)
    keys = answer_keys(pdf)
    expected = [len(key) for key in keys]
    sequences = candidates(doc, expected)
    actual = [len(sequence) for sequence in sequences]
    if actual != expected:
        raise ValueError(f"Question sequence mismatch in {filename}: {actual} != {expected}")

    questions = []
    visual_count = 0
    for exercise_index, sequence in enumerate(sequences):
        exercise_id, exercise_name = EXERCISES[exercise_index]
        for item in sequence:
            number = item["number"]
            page = doc[item["page"]]
            raw = page.get_text("text", clip=item["rect"], sort=True)
            question, options = parse_content(raw, number)
            needs_visual = len([option for option in options if option]) != 4 or bool(VISUAL_RE.search(raw))
            image = ""
            if needs_visual:
                visual_count += 1
                image_name = f"{exercise_index + 1}-{number:03d}.webp"
                render_crop(page, item["rect"], ASSETS / slug / image_name)
                image = f"assets/kota-biology/{slug}/{image_name}"
            if not question:
                question = f"Refer to the source question shown below and select the correct option."
            if any(not option for option in options):
                options = [f"Option {index}" for index in range(1, 5)]
            questions.append({
                "id": f"KOTA-BIO-{slug.upper()}-{exercise_index + 1}-{number:03d}",
                "exercise": exercise_id,
                "exerciseName": exercise_name,
                "number": number,
                "question": question,
                "options": options,
                "answer": keys[exercise_index][number] - 1,
                "image": image or None,
                "visualKind": "source-layout" if image else None,
                "sourcePage": item["page"] + 1,
            })

    payload = {
        "schemaVersion": 1,
        "title": title,
        "classLevel": class_level,
        "label": "KOTA LEVEL MCQs FOR NEET",
        "source": filename,
        "totalQuestions": len(questions),
        "visualQuestions": visual_count,
        "exercises": [
            {"id": item[0], "name": item[1], "count": len(sequences[index])}
            for index, item in enumerate(EXERCISES)
        ],
        "questions": questions,
    }
    OUT.mkdir(parents=True, exist_ok=True)
    (OUT / f"{slug}.json").write_text(json.dumps(payload, ensure_ascii=False, separators=(",", ":")) + "\n")
    return {
        "slug": slug,
        "title": title,
        "classLevel": class_level,
        "file": f"data/neet/kota-biology/{slug}.json",
        "totalQuestions": len(questions),
        "visualQuestions": visual_count,
        "exerciseCounts": {item[0]: len(sequences[index]) for index, item in enumerate(EXERCISES)},
    }


def main() -> None:
    OUT.mkdir(parents=True, exist_ok=True)
    ASSETS.mkdir(parents=True, exist_ok=True)
    chapters = [build_chapter(*spec) for spec in SPECS]
    catalog = {
        "schemaVersion": 1,
        "id": "faculty-selected-kota-biology",
        "title": "Faculty Selected KOTA Level MCQs",
        "label": "KOTA LEVEL MCQs FOR NEET",
        "subject": "Biology",
        "description": "1,872 faculty-selected MCQs reproduced as interactive practice and timed tests with printed answer-key scoring.",
        "totalQuestions": sum(chapter["totalQuestions"] for chapter in chapters),
        "chapters": chapters,
    }
    (OUT / "catalog.json").write_text(json.dumps(catalog, ensure_ascii=False, indent=2) + "\n")
    print(f"Built {catalog['totalQuestions']} KOTA Biology MCQs across {len(chapters)} chapters")


if __name__ == "__main__":
    main()
