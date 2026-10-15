"""Reproduce the reviewed NCERT crops: python scripts/crop-class11-biology.py textbook.pdf"""
import json,sys
from pathlib import Path
import fitz
from PIL import Image
root=Path(__file__).resolve().parent.parent
manifest=json.loads((root/'data/neet/diagrams/class11-biology.json').read_text())
source=fitz.open(sys.argv[1])
if len(source)!=manifest['source']['pages']:raise ValueError('Expected the supplied 252-page NCERT Class XI Biology PDF')
for item in manifest['items']:
    pix=source[item['page']-1].get_pixmap(matrix=fitz.Matrix(2.5,2.5),clip=fitz.Rect(item['crop']),alpha=False)
    im=Image.frombytes('RGB',(pix.width,pix.height),pix.samples)
    target=root/item['src'];target.parent.mkdir(parents=True,exist_ok=True)
    im.save(target,'WEBP',quality=92,method=4)
    assert im.size==(item['width'],item['height']),item['id']
print(f"Saved {len(manifest['items'])} reviewed crops from the original PDF")
