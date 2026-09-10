"""Create a stable, inspectable text-block/line index of the supplied PDFs.

PDF pages are one-based. Paragraph numbers here mean extracted text blocks,
including captions. Line numbers count the extracted nonempty lines per page.
These are study-reference locators, not line numbers printed by the publisher.
"""
import argparse
import hashlib
import json
from pathlib import Path
import fitz

ROOT = Path(__file__).resolve().parents[1]
FILES = {
    'cell': 'CELL THE UNIT OF LIFE.pdf',
    'biomolecules': 'Biomolecules.pdf',
    'division': 'CELL CYCLE AND CELL DIVISION.pdf',
}
parser = argparse.ArgumentParser()
parser.add_argument('upload_directory')
args = parser.parse_args()
out = ROOT / 'data' / 'sources'
out.mkdir(parents=True, exist_ok=True)
for key, name in FILES.items():
    path = Path(args.upload_directory) / name
    doc = fitz.open(path)
    pages = []
    for index, page in enumerate(doc):
        paragraphs = []
        line_number = 1
        for block in page.get_text('blocks', sort=True):
            if block[6] != 0:
                continue
            lines = [line.strip() for line in block[4].splitlines() if line.strip()]
            if not lines:
                continue
            paragraphs.append({'paragraph':len(paragraphs)+1, 'lineStart':line_number,
                'lineEnd':line_number+len(lines)-1, 'lines':lines,
                'bbox':[round(v,2) for v in block[:4]]})
            line_number += len(lines)
        pages.append({'pdfPage':index+1, 'paragraphs':paragraphs})
    result = {'id':key, 'title':name, 'sha256':hashlib.sha256(path.read_bytes()).hexdigest(),
        'referenceConvention':'Paragraph numbers identify extracted text blocks; lines count nonempty extracted lines on each PDF page. These locators are assigned for this study edition, not printed publisher line numbers.',
        'pages':pages}
    (out / (key+'.json')).write_text(json.dumps(result,ensure_ascii=False,indent=2)+'\n')
    print(key, len(pages), 'pages')
