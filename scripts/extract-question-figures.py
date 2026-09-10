"""Crop the user's supplied textbook figures without redrawing scientific content."""
from pathlib import Path
import json
import sys
import fitz

ROOT = Path(__file__).resolve().parents[1]
FILES = {'cell': 'CELL THE UNIT OF LIFE.pdf', 'biomolecules': 'Biomolecules.pdf', 'division': 'CELL CYCLE AND CELL DIVISION.pdf'}
# Coordinates are PDF points, inspected against rendered source pages.
FIGURES = {
    'cell-membrane': ('cell', 9, [55, 440, 535, 714], 'Figure 8.4'),
    'cell-mitochondrion': ('cell', 13, [45, 98, 410, 310], 'Figure 8.7'),
    'cell-chloroplast': ('cell', 14, [44, 96, 330, 272], 'Figure 8.8'),
    'cell-axoneme': ('cell', 15, [45, 102, 510, 295], 'Figure 8.10'),
    'cell-chromosomes': ('cell', 17, [45, 455, 510, 716], 'Figure 8.13'),
    'biomolecules-small': ('biomolecules', 4, [40, 91, 512, 701], 'Figure 9.1'),
    'biomolecules-glycogen': ('biomolecules', 7, [38, 395, 550, 704], 'Figure 9.2'),
    'biomolecules-protein': ('biomolecules', 9, [38, 99, 326, 438], 'Figure 9.3'),
    'biomolecules-energy': ('biomolecules', 12, [279, 94, 538, 330], 'Figure 9.4'),
    'biomolecules-activity': ('biomolecules', 13, [42, 515, 544, 704], 'Figure 9.5'),
    'division-cycle': ('division', 2, [289, 109, 523, 354], 'Figure 10.1'),
    'division-early': ('division', 4, [330, 99, 515, 701], 'Figure 10.2a–b'),
    'division-late': ('division', 5, [48, 98, 226, 700], 'Figure 10.2c–e'),
    'division-meiosis1': ('division', 8, [40, 99, 527, 346], 'Figure 10.3'),
    'division-meiosis2': ('division', 9, [37, 99, 546, 375], 'Figure 10.4'),
}
out = ROOT / 'assets/questions'
out.mkdir(parents=True, exist_ok=True)
metadata = {}
for key, (source, page_number, rectangle, figure) in FIGURES.items():
    with fitz.open(Path(sys.argv[1]) / FILES[source]) as doc:
        page = doc[page_number - 1]
        pix = page.get_pixmap(matrix=fitz.Matrix(2, 2), clip=fitz.Rect(rectangle), alpha=False)
        pix.save(out / f'{key}.jpg', jpg_quality=88)
    metadata[key] = {'src': f'assets/questions/{key}.jpg', 'alt': f'{figure}: textbook diagram used in the question', 'caption': f'{figure} · supplied chapter', 'source': source, 'pdfPage': page_number, 'printedPage': page_number + {'cell':84, 'biomolecules':103, 'division':119}[source]}
(ROOT / 'data/sources/figures.json').write_text(json.dumps(metadata, ensure_ascii=False, indent=2) + '\n')
