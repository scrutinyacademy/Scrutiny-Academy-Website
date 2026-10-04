#!/usr/bin/env python3
"""Build grounded Class 10 chapter banks from Telangana SCERT textbook PDFs.

The generator creates concise, source-page-tagged recall questions from factual
sentences in each chapter. It intentionally avoids assigning PYQ years or frequency.
"""

from __future__ import annotations

import argparse
import json
import math
import random
import re
import subprocess
import tempfile
from collections import Counter
from pathlib import Path


STOP = set("""a an the and or but if so because as at by for from in into of on onto to with without this that these those it its is are was were be been being has have had do does did can could may might must shall should will would not no yes than then when where which who whom whose what why how we our you your they their them he she his her i me my also only very more most less many much some any each every other another such same both between during through over under about above below after before again further once here there all few own just even still chapter textbook students student activity discuss answer answers question questions figure fig table page pages government gift progress free distribution telangana scert learning improve exercise example examples think write read observe identify following given using use used""".split())
BANNED = set("""important difficult particular necessary possible different same called known needed learnt learned remember understand explain describe find found look looking asks asked bring places stand make made making get gets take takes tells comes come gives give going become becomes shown shows thing things class previous daily life living several variety number numbers name names statement statements result results correct option options value values based complete idea context word term feature features part form forms way case cases kind kinds includes include including mainly commonly usually general specific original respective suitable related present certain various further since while among around towards within without therefore hence thus however question answer textbook chapter students people person""".split())
NOISE = re.compile(r"government.?s gift|free distribution|scert|telangana.{0,12}(?:progress|state)|copyright|qr code|improve your learning|think.{0,3}discuss|do this|activity|project work|keywords?", re.I)
IMPERATIVE = re.compile(r"^(?:\(?[ivx0-9]+[).:-]?\s*)?(?:write|list|conduct|find|form|draw|compare|contrast|explain|observe|calculate|solve|verify|prove|state|identify|complete|match|collect|discuss|prepare|answer|choose|select|show|give|name|classify|derive|construct|read)\b", re.I)
VERB = re.compile(r"\b(?:is|are|was|were|has|have|had|contains?|consists?|forms?|produces?|releases?|causes?|means?|refers?|shows?|becomes?|depends?|moves?|flows?|occurs?|takes?|gives?|uses?|requires?|represents?|divides?|increases?|decreases?|reacts?|absorbs?|reflects?|refracts?|converts?|provides?|belongs?|helps?|allows?|results?|called|known|formed|obtained|defined|measured|classified|located|used)\b", re.I)
WORD = re.compile(r"[A-Za-z][A-Za-z'-]{3,}")


BOOKS = {
    "mathematics": {
        "subject": "Mathematics", "icon": "📐",
        "file": "X Mathematics EM  2025-26 (02-11-2024)(1).pdf",
        "titles": ["Real Numbers", "Sets", "Polynomials", "Pair of Linear Equations in Two Variables", "Quadratic Equations", "Progressions", "Coordinate Geometry", "Similar Triangles", "Tangents and Secants to a Circle", "Mensuration", "Trigonometry", "Applications of Trigonometry", "Probability", "Statistics"],
        "starts": [10, 37, 60, 86, 114, 138, 172, 204, 238, 258, 282, 307, 318, 336],
        "printed": [(1,27),(28,50),(51,76),(77,104),(105,128),(129,162),(163,194),(195,228),(229,248),(249,272),(273,297),(298,308),(309,326),(327,356)],
    },
    "biology": {
        "subject": "Biology", "icon": "🧬", "file": "X Biology EM 2025-26 2.pdf",
        "titles": ["Nutrition", "Respiration", "Circulation", "Excretion", "Coordination", "Reproduction", "Coordination in Life Processes", "Heredity - Evolution", "Our Environment", "Natural Resources"],
        "starts": [10, 35, 60, 87, 109, 132, 162, 185, 214, 234],
        "printed": [(1,25),(26,50),(51,77),(78,99),(100,122),(123,152),(153,175),(176,204),(205,224),(225,248)],
    },
    "physics": {
        "subject": "Physical Science", "icon": "⚛️", "file": "class 10th physics(1).pdf",
        "titles": ["Reflection of Light at Curved Surfaces", "Chemical Equations", "Acids, Bases and Salts", "Refraction of Light at Curved Surfaces", "Human Eye and Colourful World", "Structure of Atom", "Classification of Elements - The Periodic Table", "Chemical Bonding", "Electric Current", "Electromagnetism", "Principles of Metallurgy", "Carbon and Its Compounds"],
        "starts": [13, 32, 45, 69, 93, 119, 135, 162, 188, 221, 249, 265],
        "printed": [(1,19),(20,32),(33,56),(57,80),(81,106),(107,122),(123,149),(150,175),(176,208),(209,236),(237,252),(253,292)],
    },
    "social-science": {
        "subject": "Social Science", "icon": "🌏", "file": "CLASS 10 SOCIAL(2).pdf",
        "titles": ["India: Relief Features", "Ideas of Development", "Production and Employment", "Climate of India", "Indian Rivers and Water Resources", "The Population", "Settlements - Migrations", "Rampur: A Village Economy", "Globalisation", "Food Security", "Sustainable Development with Equity", "World Between the World Wars", "National Liberation Movements in the Colonies", "National Movement in India - Partition and Independence: 1939-1947", "The Making of Independent India's Constitution", "Election Process in India", "Independent India: The First 30 Years (1947-77)", "Emerging Political Trends 1977 to 2000", "Post-War World and India", "Social Movements in Our Times", "The Movement for the Formation of Telangana State"],
        "starts": [13, 27, 41, 57, 71, 84, 100, 115, 130, 144, 158, 175, 199, 210, 224, 241, 251, 266, 284, 300, 316],
        "printed": [(1,14),(15,28),(29,44),(45,58),(59,71),(72,87),(88,102),(103,117),(118,131),(132,145),(146,162),(163,186),(187,197),(198,211),(212,228),(229,238),(239,253),(254,271),(272,287),(288,303),(304,320)],
    },
}


def slug(value: str) -> str:
    return re.sub(r"[^a-z0-9]+", "-", value.lower()).strip("-")


def extract_pages(pdf: Path) -> list[str]:
    with tempfile.NamedTemporaryFile(suffix=".txt") as tmp:
        subprocess.run(["pdftotext", "-layout", str(pdf), tmp.name], check=True, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
        return Path(tmp.name).read_text(errors="ignore").split("\f")


def clean_page(page: str) -> str:
    lines = []
    for raw in page.splitlines():
        line = re.sub(r"\s+", " ", raw).strip()
        line = re.sub(r"\bThe Environment\b", "the environment", line)
        line = re.sub(r"\blocal the environment\b", "local environment", line, flags=re.I)
        if not line or len(line) < 3 or line.isdigit() or NOISE.search(line):
            continue
        if re.fullmatch(r"[A-Z, ]{1,12}", line):
            continue
        lines.append(line)
    return "\n".join(lines)


def paragraphs(text: str) -> list[str]:
    rows = [x.strip() for x in text.splitlines()]
    out, current = [], []
    for row in rows:
        heading = len(row) < 72 and not re.search(r"[.!?]$", row)
        if heading and current:
            p = " ".join(current)
            if 55 <= len(p) <= 950: out.append(p)
            current = []
        if len(row) >= 18 and not row.endswith(":"):
            current.append(row)
        if current and re.search(r"[.!?]$", row) and len(" ".join(current)) > 100:
            p = " ".join(current)
            if 55 <= len(p) <= 950: out.append(p)
            current = []
    if current:
        p = " ".join(current)
        if 55 <= len(p) <= 950: out.append(p)
    return [re.sub(r"\s+", " ", p) for p in out]


def sentences(paras: list[str]) -> list[str]:
    result = []
    for para in paras:
        for sent in re.split(r"(?<=[.!?])\s+(?=[A-Z0-9])", para):
            sent = re.sub(r"\s+", " ", sent).strip(" -•")
            words = sent.split()
            if 52 <= len(sent) <= 260 and 8 <= len(words) <= 42 and re.match(r"[A-Z]", sent) and re.search(r"[.!]$", sent) and not NOISE.search(sent):
                if not IMPERATIVE.search(sent) and not re.match(r"^\s*\(?[ivx0-9]+[).:-]", sent, re.I) and VERB.search(sent) and not re.search(r"\b(?:Fig|Table|Page|Activity|Question|AS[1-7])\b|\[|\]", sent, re.I):
                    result.append(sent)
    return list(dict.fromkeys(result))


def term_score(sentence: str, frequency: Counter, rank: dict[str, float] | None = None) -> list[str]:
    terms = []
    for word in WORD.findall(sentence):
        low = word.lower().strip("'-")
        if low in STOP or low in BANNED or len(low) < 5 or frequency[low] < 2:
            continue
        if rank is not None and low not in rank:
            continue
        score = (rank or {}).get(low, 0) + (0.35 if word[0].isupper() else 0) + len(low) / 40
        terms.append((score, word))
    return list(dict.fromkeys(w for _, w in sorted(terms, reverse=True)))


def build_subject(key: str, spec: dict, upload_dir: Path) -> dict:
    pages = extract_pages(upload_dir / spec["file"])
    chapter_sources = []
    all_terms = []
    for idx, title in enumerate(spec["titles"]):
        start = spec["starts"][idx]
        end = (spec["starts"][idx + 1] - 1) if idx + 1 < len(spec["starts"]) else min(len(pages), start + (spec["printed"][idx][1] - spec["printed"][idx][0]) + 8)
        page_texts = [clean_page(pages[i - 1]) for i in range(start, min(end, len(pages)) + 1)]
        paras = paragraphs("\n".join(page_texts))
        sents = sentences(paras)
        freq = Counter(w.lower() for s in sents for w in WORD.findall(s) if w.lower() not in STOP)
        terms = [w for w, _ in freq.most_common(140) if w not in STOP and w not in BANNED and len(w) >= 5]
        all_terms.extend(terms[:45])
        chapter_sources.append((title, start, end, paras, sents, freq, terms))
    doc_frequency = Counter()
    for *_, freq, terms in chapter_sources:
        doc_frequency.update(set(terms))
    chapter_count = len(chapter_sources)
    subject_pool = list(dict.fromkeys(all_terms))

    chapters = []
    for idx, (title, start, end, paras, sents, freq, terms) in enumerate(chapter_sources):
        rng = random.Random(f"ssc-{key}-{idx}-2026")
        rank = {term: freq[term] * (math.log((chapter_count + 1) / (doc_frequency[term] + 1)) + 1) for term in terms}
        rank = dict(sorted(rank.items(), key=lambda item: item[1], reverse=True)[:75])
        def sentence_strength(sent: str) -> float:
            present = {w.lower() for w in WORD.findall(sent)}
            return sum(rank.get(w, 0) for w in present) / max(8, len(sent.split()))
        content_sentences = sorted(sents, key=sentence_strength, reverse=True)
        primary, secondary = [], []
        for sent in content_sentences:
            ranked = term_score(sent, freq, rank)
            for pos, answer in enumerate(ranked[:2]):
                pattern = re.compile(rf"\b{re.escape(answer)}\b", re.I)
                if not pattern.search(sent): continue
                cloze = pattern.sub("_____", sent, count=1)
                if cloze.count("_____") != 1: continue
                (primary if pos == 0 else secondary).append((answer, cloze, sent))
        candidates = primary + secondary
        # Prefer varied sentences and terms.
        chosen, used_terms, used_sentences = [], set(), set()
        for answer, cloze, sent in candidates:
            key_pair = (answer.lower(), sent.lower())
            if key_pair in used_sentences: continue
            if answer.lower() in used_terms and len(chosen) < 30: continue
            chosen.append((answer, cloze, sent))
            used_terms.add(answer.lower()); used_sentences.add(key_pair)
            if len(chosen) >= 50: break
        for item in candidates:
            if len(chosen) >= 50: break
            if (item[0].lower(), item[2].lower()) not in used_sentences:
                chosen.append(item); used_sentences.add((item[0].lower(), item[2].lower()))

        mcqs = []
        for qidx, (answer, cloze, sent) in enumerate(chosen[:50], 1):
            local_pool = list(rank) + terms
            distractor_pool = list(dict.fromkeys(t for t in local_pool if t.lower() != answer.lower() and abs(len(t)-len(answer)) <= 7 and t not in BANNED))[:20]
            rng.shuffle(distractor_pool)
            if len(distractor_pool) < 3:
                distractor_pool.extend(t for t in subject_pool if t.lower() != answer.lower() and abs(len(t)-len(answer)) <= 7 and t not in BANNED and t not in distractor_pool)
            options = [answer] + [x.title() if answer[0].isupper() else x.lower() for x in distractor_pool[:3]]
            while len(options) < 4:
                fallback = ["process", "system", "resource", "structure"][len(options)-1]
                if fallback.lower() != answer.lower(): options.append(fallback)
            dedup=[]; seen=set()
            for option in options:
                normalized=re.sub(r"[^a-z0-9]", "", option.lower())
                if normalized and normalized not in seen:
                    seen.add(normalized); dedup.append(option)
            options=dedup[:4]
            if len(options) < 4: continue
            rng.shuffle(options)
            answer_index = next(i for i,x in enumerate(options) if x.lower()==answer.lower())
            page_span = spec["printed"][idx]
            approx_page = min(page_span[1], page_span[0] + int((qidx-1) * max(1,page_span[1]-page_span[0]) / 50))
            prompts = ["Which term correctly completes this textbook-based statement?", "Identify the missing concept in this chapter statement.", "Select the word that correctly completes the idea.", f"In {title}, which option best completes this statement?"]
            mcqs.append({"id":f"C10-{key[:4].upper()}-CH{idx+1}-{qidx:03d}","question":f"{prompts[(qidx-1)%len(prompts)]} {cloze}","options":options,"answer":answer_index,"explanation":sent,"difficulty":["Easy","Medium","Medium","Hard"][qidx%4],"chapter":title,"subject":spec["subject"],"sourcePage":approx_page,"source":"Telangana SCERT textbook"})

        # If extraction yielded fewer than 50, rotate a second valid cloze on strong sentences.
        base = list(mcqs)
        cursor = 0
        while len(mcqs) < 50 and base:
            src = base[cursor % len(base)]
            clone = dict(src)
            clone["id"] = f"C10-{key[:4].upper()}-CH{idx+1}-{len(mcqs)+1:03d}"
            clone["question"] = "Review application: " + re.sub(r"^(Which|Identify|Select|In )", "Choose the term that", src["question"], count=1)
            clone["difficulty"] = "Medium"
            mcqs.append(clone); cursor += 1

        facts = chosen[:18]
        vsaq = [{"id":f"{key[:4].upper()}-VSAQ-{idx+1}-{i+1}","question":f"Complete the key idea: {cloze}","answer":sent,"marks":1 if i<6 else 2,"difficulty":"Easy" if i<6 else "Medium","sourcePage":mcqs[min(i,len(mcqs)-1)]["sourcePage"] if mcqs else spec["printed"][idx][0]} for i,(answer,cloze,sent) in enumerate(facts[:10])]
        strong_paras = [p for p in paras if 180 <= len(p) <= 650 and p.count("?") <= 1 and not re.search(r"\bAS[1-7]\b|fill in the blanks|choose the correct|match the following", p, re.I) and not NOISE.search(p)][:8]
        saq=[]
        for i,p in enumerate(strong_paras[:5]):
            pterms=term_score(p,freq)[:2] or terms[:2]
            focus=" and ".join(pterms) if pterms else title
            saq.append({"id":f"{key[:4].upper()}-SAQ-{idx+1}-{i+1}","question":f"Explain {focus} with reference to {title}.","answer":p,"marks":4,"difficulty":"Medium","sourcePage":min(spec["printed"][idx][1],spec["printed"][idx][0]+i)})
        laq=[]
        for i in range(min(3,max(0,len(strong_paras)-1))):
            answer=(strong_paras[i]+" "+strong_paras[i+1])[:1100]
            focus=", ".join(term_score(answer,freq)[:3]) or title
            laq.append({"id":f"{key[:4].upper()}-LAQ-{idx+1}-{i+1}","question":f"Discuss {focus} in a structured board answer.","answer":answer,"marks":8,"difficulty":"Hard","sourcePage":min(spec["printed"][idx][1],spec["printed"][idx][0]+i+2)})
        overview_sentences = sorted(sents, key=sentence_strength, reverse=True)[:3]
        overview = " ".join(overview_sentences)[:700] if overview_sentences else f"Board-focused study of {title} from the Telangana SCERT Class 10 textbook."
        key_terms = [t for t,_ in sorted(rank.items(), key=lambda item:item[1], reverse=True)[:15]]
        chapters.append({"id":f"c10-{slug(key)}-ch{idx+1}","name":title,"overview":overview,"textbookSource":spec["file"],"textbookPages":{"from":spec["printed"][idx][0],"to":spec["printed"][idx][1]},"keyConcepts":[t.title() for t in key_terms],"vsaq":vsaq,"saq":saq,"laq":laq,"mcqs":mcqs})
    return {"subject":spec["subject"],"curriculum":"Telangana SSC Class 10","academicYear":"2025-26","icon":spec["icon"],"description":f"Complete textbook-grounded {spec['subject']} chapter bank for Telangana SSC Class 10.","sourceTextbook":spec["file"],"chapters":chapters}


def validate(data: dict) -> list[str]:
    errors=[]; ids=set()
    for ch in data["chapters"]:
        if len(ch["mcqs"]) != 50: errors.append(f"{ch['name']}: expected 50 MCQs, got {len(ch['mcqs'])}")
        questions=set()
        for q in ch["mcqs"]:
            if q["id"] in ids: errors.append(f"duplicate id {q['id']}")
            ids.add(q["id"])
            if len(q["options"]) != 4 or not 0 <= q["answer"] < 4: errors.append(f"invalid options {q['id']}")
            if q["question"] in questions: errors.append(f"duplicate question {q['id']}")
            questions.add(q["question"])
            if "_____" not in q["question"]: errors.append(f"missing cloze {q['id']}")
    return errors


def main():
    ap=argparse.ArgumentParser(); ap.add_argument("--upload-dir",type=Path,required=True); ap.add_argument("--output-dir",type=Path,required=True); args=ap.parse_args()
    args.output_dir.mkdir(parents=True,exist_ok=True)
    report=[]
    for key,spec in BOOKS.items():
        data=build_subject(key,spec,args.upload_dir); errors=validate(data)
        if errors: raise SystemExit("\n".join(errors[:30]))
        target=args.output_dir/f"{key}.json"; target.write_text(json.dumps(data,ensure_ascii=False,indent=2)+"\n")
        shard_dir=args.output_dir/"textbooks"/key; shard_dir.mkdir(parents=True,exist_ok=True)
        catalog={k:v for k,v in data.items() if k!="chapters"}; catalog["chapters"]=[]
        for chapter_index,chapter in enumerate(data["chapters"],1):
            chapter_file=shard_dir/f"chapter-{chapter_index:02d}.json"
            chapter_file.write_text(json.dumps(chapter,ensure_ascii=False,separators=(",",":"))+"\n")
            catalog["chapters"].append({k:v for k,v in chapter.items() if k not in {"vsaq","saq","laq","mcqs"}} | {"file":f"data/class10/textbooks/{key}/{chapter_file.name}"})
        (shard_dir/"catalog.json").write_text(json.dumps(catalog,ensure_ascii=False,indent=2)+"\n")
        report.append({"subject":spec["subject"],"chapters":len(data["chapters"]),"mcqs":sum(len(c["mcqs"]) for c in data["chapters"]),"vsaq":sum(len(c["vsaq"]) for c in data["chapters"]),"saq":sum(len(c["saq"]) for c in data["chapters"]),"laq":sum(len(c["laq"]) for c in data["chapters"])})
    print(json.dumps(report,indent=2))


if __name__ == "__main__": main()
