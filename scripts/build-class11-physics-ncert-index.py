"""Build source-aware Class 11 Physics NCERT search records from uploaded PDFs."""
import argparse
import hashlib
import json
import re
from collections import Counter
from pathlib import Path

import fitz

ROOT = Path(__file__).resolve().parents[1]

CHAPTERS = [
    {
        "chapter_number": 1,
        "chapter": "Units and Measurement",
        "filename": "UNITS AND MEASUREMENT(1).pdf",
        "printed_start": 1,
    },
    {
        "chapter_number": 2,
        "chapter": "Motion in a Straight Line",
        "filename": "MOTION IN A STRAIGHT LINE(1).pdf",
        "printed_start": 13,
    },
    {
        "chapter_number": 3,
        "chapter": "Motion in a Plane",
        "filename": "MOTION IN A PLANE(1).pdf",
        "printed_start": 27,
    },
    {
        "chapter_number": 4,
        "chapter": "Laws of Motion",
        "filename": "LAWS OF MOTION(1).pdf",
        "printed_start": 49,
    },
    {
        "chapter_number": 5,
        "chapter": "Work, Energy and Power",
        "filename": "WORK, ENERGY AND POWER(1).pdf",
        "printed_start": 71,
    },
    {
        "chapter_number": 6,
        "chapter": "System of Particles and Rotational Motion",
        "filename": "SYSTEMS OF PARTICLES AND ROTATIONAL MOTION(1).pdf",
        "printed_start": 92,
    },
    {
        "chapter_number": 7,
        "chapter": "Gravitation",
        "filename": "GRAVITATION(1).pdf",
        "printed_start": 127,
    },
]

STOPWORDS = {
    "about",
    "above",
    "after",
    "again",
    "against",
    "also",
    "among",
    "because",
    "been",
    "being",
    "between",
    "body",
    "both",
    "chapter",
    "could",
    "does",
    "each",
    "example",
    "figure",
    "from",
    "given",
    "have",
    "into",
    "more",
    "most",
    "only",
    "other",
    "same",
    "shall",
    "shown",
    "such",
    "that",
    "their",
    "then",
    "there",
    "these",
    "this",
    "those",
    "through",
    "thus",
    "upon",
    "when",
    "where",
    "which",
    "while",
    "with",
}


def decode_private_font(text):
    return "".join(
        chr(ord(character) - 0xF000)
        if 0xF000 <= ord(character) <= 0xF0FF
        else character
        for character in text
    )


def clean_text(text):
    text = decode_private_font(text)
    text = text.replace("\u00ad", "")
    text = re.sub(r"[\uf0b3\uf0d5\uf0ae\uf0a4\uf0b5\uf0a5]", " ", text)
    text = re.sub(r"\s+", " ", text)
    text = re.sub(r"\s+([,.;:!?])", r"\1", text)
    return text.strip()


def normalise(value):
    return re.sub(r"[^a-z0-9]+", " ", value.lower()).strip()


def sentence_snippet(text, limit=240):
    text = clean_text(text)
    if len(text) <= limit:
        return text
    end = max(text.rfind(".", 0, limit), text.rfind(";", 0, limit))
    if end < 80:
        end = text.rfind(" ", 0, limit)
    return f"{text[:end].strip()}..."


def is_noise(text):
    words = normalise(text).split()
    if len(words) < 8:
        return True
    if len(words) <= 12 and any(
        token in words for token in ["physics", "summary", "exercises", "points", "ponder"]
    ):
        return True
    return False


def keyword_string(values):
    words = []
    for value in values:
        words.extend(normalise(value).split())
    useful = sorted({word for word in words if len(word) > 1 and word not in STOPWORDS})
    return " ".join(useful)


def topic_from_text(section, text):
    words = [
        word
        for word, _ in Counter(normalise(text).split()).most_common(6)
        if len(word) > 3 and word not in STOPWORDS
    ]
    if words:
        return f"{section} - {' '.join(words[:3])}"
    return section


def section_heading(lines, fallback):
    for line in lines:
        cleaned = clean_text(line)
        if re.match(r"^\d+\.\d+\s+[A-Z][A-Z0-9 ,:;()'’\-]+$", cleaned):
            return cleaned.title().replace("Si", "SI")
    return fallback


def build_records(upload_directory):
    records = []
    chapters = []
    for chapter in CHAPTERS:
        path = upload_directory / chapter["filename"]
        if not path.exists():
            raise FileNotFoundError(path)
        doc = fitz.open(path)
        current_section = chapter["chapter"]
        chapter_count = 0
        for page_index, page in enumerate(doc):
            page_text = clean_text(page.get_text("text"))
            current_section = section_heading(page_text.splitlines(), current_section)
            printed_page = chapter["printed_start"] + page_index
            for block_index, block in enumerate(page.get_text("blocks", sort=True), start=1):
                if block[6] != 0:
                    continue
                block_text = clean_text(block[4])
                if not block_text or is_noise(block_text):
                    continue
                heading_match = re.match(
                    r"^(\d+\.\d+\s+[A-Z][A-Z0-9 ,:;()'’\-]+)", block_text
                )
                if heading_match:
                    current_section = heading_match.group(1).title().replace("Si", "SI")
                    block_text = block_text[len(heading_match.group(1)) :].strip()
                    if is_noise(block_text):
                        continue
                record_id = (
                    f"ncert-physics-11-{chapter['chapter_number']:02d}-"
                    f"{page_index + 1:02d}-{block_index:02d}"
                )
                topic = topic_from_text(current_section, block_text)
                records.append(
                    {
                        "id": record_id,
                        "class": 11,
                        "subject": "Physics",
                        "topic": topic,
                        "meaning": sentence_snippet(block_text),
                        "chapterNumber": chapter["chapter_number"],
                        "chapter": chapter["chapter"],
                        "section": current_section,
                        "sourceLabel": "NCERT Physics Part I, Reprint 2026-27",
                        "pdfFilename": chapter["filename"],
                        "pdfPage": page_index + 1,
                        "printedPage": printed_page,
                        "keywords": keyword_string(
                            [
                                chapter["chapter"],
                                current_section,
                                topic,
                                block_text,
                            ]
                        ),
                        "sourceBlock": block_index,
                    }
                )
                chapter_count += 1
        chapters.append(
            {
                "chapterNumber": chapter["chapter_number"],
                "chapter": chapter["chapter"],
                "pdfFilename": chapter["filename"],
                "pdfPages": len(doc),
                "recordCount": chapter_count,
                "sha256": hashlib.sha256(path.read_bytes()).hexdigest(),
            }
        )
    return {
        "status": "active",
        "title": "NCERT Class 11 Physics uploaded source index",
        "description": "Searchable section and page references generated from uploaded NCERT Physics Part I chapters.",
        "chapterCount": len(chapters),
        "chapters": chapters,
        "records": records,
    }


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("upload_directory")
    args = parser.parse_args()
    catalog = build_records(Path(args.upload_directory))
    output = ROOT / "data" / "ncert" / "physics-class11-uploaded.json"
    output.write_text(json.dumps(catalog, ensure_ascii=False, indent=2) + "\n")
    print(
        f"Built {len(catalog['records'])} Class 11 Physics NCERT source records "
        f"across {catalog['chapterCount']} uploaded chapters."
    )


if __name__ == "__main__":
    main()
