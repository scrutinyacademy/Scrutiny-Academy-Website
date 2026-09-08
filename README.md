# Scrutiny Academy - Educational Platform

> **LEARN • UNDERSTAND • PRACTICE • MASTER**
> Official web platform for **Class 10 SSC Telangana**, **NEET UG**, and **MBBS Undergraduate Medical Education**.

---

## 🏛️ About Scrutiny Academy

**Scrutiny Academy** is a unified, open-access digital learning and competitive assessment platform. Designed with academic rigor and modern university aesthetics, it provides syllabus-aligned curriculum breakdowns, verified concept-oriented question banks, and an advanced cognitive MCQ practice engine.

---

## 📂 Multi-File Architecture

```text
scrutiny-academy/
├── index.html                   # Semantic HTML5 structure with accessible landmarks
├── style.css                    # Responsive CSS3 styling & brand watermark system
├── script.js                    # Vanilla JavaScript unified MCQ engine & controller
├── README.md                    # Project documentation & deployment guide
├── assets/
│   ├── logo.svg                 # Official Scrutiny Academy vector logo
│   ├── logo.png                 # High-resolution raster brand logo
│   ├── favicon.svg              # Scalable browser favicon
│   ├── favicon.png              # Standard PNG favicon (64x64)
│   ├── upi-qr.svg               # Vector UPI Payment QR Card (pramod sharma)
│   └── upi-qr.png               # High-resolution raster UPI payment card
└── data/
    ├── manifest.json            # Master curriculum catalog
    ├── prebundled_data.js       # Offline & zero-server fallback data store
    ├── class10/
    │   ├── biology.json         # Class 10 Biology (VSAQ, SAQ, LAQ, 50 MCQs)
    │   ├── physics.json         # Class 10 Physics (VSAQ, SAQ, LAQ, 50 MCQs)
    │   ├── mathematics.json     # Class 10 Mathematics (VSAQ, SAQ, LAQ, 50 MCQs)
    │   └── social-science.json  # Class 10 Social Science (VSAQ, SAQ, LAQ, 50 MCQs)
    ├── neet/
    │   ├── biology.json         # NEET Biology (Botany & Zoology MCQs)
    │   ├── physics.json         # NEET Physics (Mechanics, Waves, Electrodynamics)
    │   └── chemistry.json       # NEET Chemistry (Physical, Organic, Inorganic)
    └── mbbs/
        ├── anatomy.json         # Phase 1: Clinical Anatomy
        ├── physiology.json      # Phase 1: Systemic Physiology
        ├── biochemistry.json    # Phase 1: Medical Biochemistry
        ├── pathology.json       # Phase 2: General & Systemic Pathology
        ├── pharmacology.json    # Phase 2: Medical Pharmacology
        ├── microbiology.json    # Phase 2: Clinical Microbiology
        ├── forensic-medicine.json # Phase 2: Forensic Medicine & Toxicology
        ├── community-medicine.json # Phase 2: Preventive & Social Medicine
        ├── medicine.json        # Phase 3: General Medicine
        ├── surgery.json         # Phase 3: General Surgery
        ├── pediatrics.json      # Phase 3: Pediatrics & Neonatology
        ├── obgyn.json           # Phase 3: Obstetrics & Gynecology
        ├── ophthalmology.json   # Phase 3: Ophthalmology
        ├── ent.json             # Phase 3: Otorhinolaryngology
        ├── orthopedics.json     # Phase 3: Orthopedics & Trauma
        ├── dermatology.json     # Phase 3: Dermatology & Venereology
        ├── psychiatry.json      # Phase 3: Psychiatry
        ├── radiology.json       # Phase 3: Diagnostic Radiology
        └── anesthesiology.json  # Phase 3: Anesthesiology & Critical Care
```

---

## 🚀 Key Features

1. **Class 10 SSC Telangana Dashboard**:
   - Covers Biology, Physics, Mathematics, and Social Science.
   - Distinct tabs for **VSAQ** (Very Short Answer Questions), **SAQ** (Short Answer Questions), **LAQ** (Long Answer Questions), and **MCQs** (50 original MCQs per chapter).
   - Difficulty tags: Easy, Medium, Hard.

2. **NEET UG Entrance Portal**:
   - NCERT-grounded Biology, formula/numerical Physics, and reaction-mechanism Chemistry.
   - Comprehensive step-by-step rationales eliminating common conceptual traps.

3. **MBBS Medical Education**:
   - Full 19-subject undergraduate curriculum organized across Pre-Clinical (Phase 1), Para-Clinical (Phase 2), and Clinical (Phase 3).
   - High-yield clinical vignettes suited for university exams and NEXT / FMGE preparation.
   - Clear educational disclaimers.

4. **Universal MCQ Practice Engine**:
   - **Practice Mode**: Instant feedback upon selection with detailed explanations.
   - **Test Mode**: Timed exam simulation, question palette, review flags, and a comprehensive final scorecard with accuracy analytics.
   - Configurable question counts: 10, 25, 50, 100, 180 questions.
   - Option and question randomization toggles.

5. **My Progress Tracking (Local Storage)**:
   - Private, browser-based performance tracker without requiring accounts or logins.
   - Tracks total attempts, correct/incorrect responses, accuracy percentages, and recent session history.

6. **Global Search Engine (`⌘K` / `Ctrl+K`)**:
   - Live instantaneous search across subjects, chapters, questions, and topics.

7. **Brand Protection & Watermark Layer**:
   - Subtle repeating diagonal watermark across the viewport and cards.
   - Print stylesheet embedding full copyright attribution.
   - Contextmenu notification deterrent and clipboard source attribution.

8. **Support Scrutiny Academy**:
   - Modal featuring the official UPI QR code card (`pramod sharma`, `iampramodsharma02-1@oksbi`) with one-click copy and payment instructions.

9. **Help Desk & Social Links**:
   - Direct link to YouTube (`https://m.youtube.com/@ScrutinyAcademy`).
   - Direct link to Instagram (`https://www.instagram.com/scrutinyacademy`).
   - Help Desk contact button targeting `scrutinyacademy@gmail.com`.

---

## 🌐 Deploying to GitHub Pages (Step-by-Step Guide)

### Option 1: Using the GitHub Web Interface (Easiest)

1. **Create a GitHub Repository**:
   - Log into [GitHub](https://github.com).
   - Click the **+** icon in the top right and select **New repository**.
   - Repository name: `scrutiny-academy` (or `<your-username>.github.io` for a user site).
   - Choose **Public**.
   - Check **Add a README file** (or leave unchecked if uploading directly).
   - Click **Create repository**.

2. **Upload Website Files**:
   - In your repository, click **Add file** -> **Upload files**.
   - Drag and drop all files and folders from this folder (`index.html`, `style.css`, `script.js`, `README.md`, `assets/`, `data/`).
   - Click **Commit changes**.

3. **Enable GitHub Pages**:
   - Click the **Settings** tab of the repository.
   - On the left sidebar under *Code and automation*, click **Pages**.
   - Under **Build and deployment**:
     - **Source**: Select `Deploy from a branch`.
     - **Branch**: Select `main` (or `master`) and folder `/ (root)`.
     - Click **Save**.
   - Wait 1–2 minutes. Your live website will be available at:
     ```text
     https://<your-username>.github.io/scrutiny-academy/
     ```

---

### Option 2: Using the Git Command Line

```bash
# 1. Initialize git repository
cd scrutiny-academy
git init

# 2. Add all files
git add .
git commit -m "Initial commit: Scrutiny Academy complete educational platform"

# 3. Add remote repository and push
git branch -M main
git remote add origin https://github.com/<your-username>/scrutiny-academy.git
git push -u origin main
```

Then follow Step 3 above in the GitHub Settings UI to enable Pages on the `main` branch.

---

## 💻 Local Testing

You can run the website locally in any of the following ways:

- **Direct file opening**: Double-click `index.html` in any web browser. The built-in `prebundled_data.js` ensures all questions load offline without CORS issues.
- **Local HTTP Server**:
  ```bash
  # Python 3
  python3 -m http.server 8000
  ```
  Then open `http://localhost:8000` in your browser.

---

## ⚖️ Copyright & Legal Notice

© 2026 SCRUTINY ACADEMY. ALL RIGHTS RESERVED.  
Educational content created for learning, board preparation, and competitive examination training.
# Intermediate curriculum update

Class 11 and Class 12 now have separate Telangana Intermediate subject sections, with 96 chapters/units transcribed from the supplied syllabus documents. The NEET bank is split into Botany, Zoology, Physics and Chemistry with NCERT class and chapter filters. Board question and resource sections are ready for content, but currently empty. See [CURRICULUM.md](CURRICULUM.md) for source years, actual coverage, known limits and editing instructions. Earlier feature descriptions below describe the original site and should not be treated as verified content coverage.

After editing any JSON file, run `node scripts/build-data.mjs` followed by `node scripts/validate-data.mjs`.
