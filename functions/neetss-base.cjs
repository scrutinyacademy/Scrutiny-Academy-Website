module.exports = {
  "modules": [
    {
      "id": "sepsis",
      "title": "Surgical Sepsis & Source Control",
      "chapter": "Surgical Infections",
      "reference": "Surviving Sepsis Campaign 2021; WHO SSI guideline, 2018 update",
      "summary": "Recognise organ dysfunction, resuscitate without delaying source control, and reassess repeatedly.",
      "sections": [
        [
          "Recognition",
          "Suspect sepsis when infection is accompanied by acute organ dysfunction. Scores support—not replace—clinical judgment. Obtain cultures promptly when this does not materially delay antimicrobials."
        ],
        [
          "Decision pathway",
          "Stabilise airway/oxygenation → assess perfusion and lactate in context → begin appropriate antimicrobials → identify the anatomical source → choose the least physiologically costly effective source-control procedure → reassess response and de-escalate therapy."
        ],
        [
          "High-yield trap",
          "A normal blood pressure does not exclude occult hypoperfusion. Lactate is a risk marker, not a stand-alone diagnosis, and should be interpreted with examination, trend and alternative causes."
        ]
      ],
      "pearl": "In uncontrolled surgical infection, antibiotics without source control are usually an incomplete treatment plan."
    },
    {
      "id": "shock",
      "title": "Haemorrhagic Shock & Damage-Control Resuscitation",
      "chapter": "Trauma and Emergency Surgery",
      "reference": "ATLS principles; European major bleeding guideline, 2023",
      "summary": "Control bleeding early, avoid dilutional resuscitation, correct the lethal diamond and choose definitive versus damage-control surgery.",
      "sections": [
        [
          "Immediate priorities",
          "Activate haemorrhage control while securing airway and ventilation. Use balanced blood-component resuscitation according to the institutional massive-transfusion protocol; prevent hypothermia and monitor ionised calcium."
        ],
        [
          "Decision pathway",
          "Recognise shock → direct pressure/pelvic binder/operative or endovascular control → activate massive transfusion when indicated → give tranexamic acid early in eligible bleeding trauma patients → reassess physiology → definitive repair if stable, damage-control strategy if exhausted physiology."
        ],
        [
          "High-yield trap",
          "Permissive hypotension is not a universal rule. Avoid it in traumatic brain injury where cerebral perfusion must be preserved, and individualise it in pregnancy and chronic hypertension."
        ]
      ],
      "pearl": "The endpoint is not a “normal” blood pressure; it is haemorrhage control with improving perfusion, temperature, coagulation and calcium."
    },
    {
      "id": "ssi",
      "title": "SSI Prevention & Perioperative Antibiotics",
      "chapter": "General Surgical Principles",
      "reference": "CDC SSI guideline 2017; WHO SSI guideline, 2018 update",
      "summary": "Match prophylaxis to procedure flora, deliver it before incision, redose when needed, and do not prolong it without an indication.",
      "sections": [
        [
          "Core concept",
          "Prophylaxis prevents contamination from becoming infection; it does not sterilise tissue. Choose the narrowest regimen that covers expected organisms and local resistance patterns."
        ],
        [
          "Decision pathway",
          "Classify procedure → select drug/allergy alternative → administer so effective tissue concentration exists at incision → redose for prolonged surgery or major blood loss according to drug half-life → stop after the recommended prophylaxis window unless treating established infection."
        ],
        [
          "High-yield trap",
          "Continuing prophylactic antibiotics merely because a drain remains is not evidence-based. A drain is not, by itself, an indication for prolonged prophylaxis."
        ]
      ],
      "pearl": "Correct timing and redosing are frequently more important than “stronger” or longer antibiotic therapy."
    }
  ],
  "questions": [
    {
      "topic": "Surgical Infections",
      "difficulty": "Hard",
      "q": "A patient with perforated sigmoid diverticulitis remains vasopressor-dependent after initial resuscitation. CT shows free perforation and diffuse contamination. Which intervention most directly addresses the continuing driver of shock?",
      "o": [
        "Escalate to a broader antibiotic alone",
        "Urgent operative source control",
        "Repeat serum procalcitonin in 6 hours",
        "Start parenteral nutrition"
      ],
      "a": 1,
      "why": "Diffuse contamination from a free perforation requires urgent source control alongside resuscitation and antimicrobials.",
      "wrong": [
        "Broader antibiotics cannot remove ongoing faecal contamination.",
        "Correct.",
        "A biomarker trend must not delay source control.",
        "Nutrition is important later but does not control the septic source."
      ],
      "ref": "Surviving Sepsis Campaign 2021",
      "id": "p1-1"
    },
    {
      "topic": "Surgical Infections",
      "difficulty": "Medium",
      "q": "Which statement about lactate in suspected surgical sepsis is most accurate?",
      "o": [
        "A normal lactate excludes septic shock",
        "Lactate alone establishes the diagnosis of sepsis",
        "Serial lactate can support perfusion reassessment but requires clinical context",
        "Any elevation mandates laparotomy"
      ],
      "a": 2,
      "why": "Lactate is a prognostic/perfusion marker and trends can guide reassessment, but alternative causes and the clinical picture matter.",
      "wrong": [
        "Normal lactate does not exclude organ dysfunction.",
        "Sepsis is a clinical syndrome, not a single-test diagnosis.",
        "Correct.",
        "Source control depends on anatomy and diagnosis, not lactate alone."
      ],
      "ref": "Surviving Sepsis Campaign 2021",
      "id": "p1-2"
    },
    {
      "topic": "Surgical Infections",
      "difficulty": "Easy",
      "q": "In a patient with an infected obstructed collecting system and sepsis, the priority source-control principle is:",
      "o": [
        "Delay drainage until cultures identify the organism",
        "Urgent decompression plus antimicrobials",
        "Oral antibiotics and outpatient review",
        "Definitive stone clearance before resuscitation"
      ],
      "a": 1,
      "why": "An infected obstructed system is a source-control emergency requiring prompt drainage with antibiotics and resuscitation.",
      "wrong": [
        "Cultures should not delay drainage.",
        "Correct.",
        "This is unsafe in sepsis with obstruction.",
        "Initial decompression is usually prioritised over definitive stone treatment in an unstable patient."
      ],
      "ref": "EAU Urolithiasis guideline principles",
      "id": "p1-3"
    },
    {
      "topic": "Surgical Infections",
      "difficulty": "Medium",
      "q": "After adequate source control for complicated intra-abdominal infection, the best antibiotic strategy is generally:",
      "o": [
        "Continue indefinitely until drains are removed",
        "Use the shortest effective course guided by clinical response and current guidance",
        "Always give at least 21 days",
        "Stop immediately before the first dose"
      ],
      "a": 1,
      "why": "After adequate source control, unnecessarily prolonged therapy increases harm without improving outcomes; duration is tailored to response and diagnosis.",
      "wrong": [
        "Drains alone do not determine duration.",
        "Correct.",
        "A fixed 21-day minimum is unsupported.",
        "Initial antimicrobial therapy is still required."
      ],
      "ref": "WSES/SIS source-control principles",
      "id": "p1-4"
    },
    {
      "topic": "Trauma and Emergency Surgery",
      "difficulty": "Hard",
      "q": "A polytrauma patient has ongoing haemorrhage, temperature 34°C, worsening acidosis and diffuse coagulopathic bleeding. The most appropriate operative strategy is:",
      "o": [
        "Prolonged definitive reconstruction",
        "Damage-control surgery with rapid haemorrhage/contamination control",
        "Delay haemorrhage control for complete imaging",
        "Large-volume cold crystalloid resuscitation"
      ],
      "a": 1,
      "why": "Physiological exhaustion with hypothermia, acidosis and coagulopathy favours abbreviated damage-control surgery and ICU correction before definitive reconstruction.",
      "wrong": [
        "Prolonged surgery worsens physiological exhaustion.",
        "Correct.",
        "Ongoing haemorrhage takes priority.",
        "Cold crystalloid worsens dilution, hypothermia and coagulopathy."
      ],
      "ref": "ATLS and damage-control surgery principles",
      "id": "p1-5"
    },
    {
      "topic": "Trauma and Emergency Surgery",
      "difficulty": "Medium",
      "q": "Permissive hypotension is least appropriate in which situation?",
      "o": [
        "Penetrating torso haemorrhage without brain injury",
        "Suspected traumatic brain injury",
        "Controlled external limb bleeding awaiting theatre",
        "Short transfer with active abdominal bleeding"
      ],
      "a": 1,
      "why": "Hypotension threatens cerebral perfusion; traumatic brain injury requires avoidance of hypotension.",
      "wrong": [
        "This can be an eligible context before haemorrhage control.",
        "Correct.",
        "Management is individualised, but TBI is the clearest contraindicating context here.",
        "This may be used cautiously if no contraindication exists."
      ],
      "ref": "ATLS principles",
      "id": "p1-6"
    },
    {
      "topic": "Trauma and Emergency Surgery",
      "difficulty": "Medium",
      "q": "During massive transfusion, which electrolyte disturbance requires active surveillance because citrate can reduce the ionised fraction?",
      "o": [
        "Hypermagnesaemia",
        "Hypocalcaemia",
        "Hyperphosphataemia",
        "Hypernatraemia"
      ],
      "a": 1,
      "why": "Citrate in blood products binds calcium; clinically important ionised hypocalcaemia can impair coagulation and cardiovascular function.",
      "wrong": [
        "Not the characteristic citrate-related disturbance.",
        "Correct.",
        "Not the principal citrate effect.",
        "Not the principal citrate effect."
      ],
      "ref": "European major bleeding guideline 2023",
      "id": "p1-7"
    },
    {
      "topic": "Trauma and Emergency Surgery",
      "difficulty": "Easy",
      "q": "The most important treatment for haemorrhagic shock is:",
      "o": [
        "Rapid haemorrhage control with appropriate resuscitation",
        "Normalising haemoglobin before localisation",
        "Routine bicarbonate for all acidosis",
        "Vasopressors as the sole initial treatment"
      ],
      "a": 0,
      "why": "Definitive improvement requires stopping blood loss while supporting perfusion and correcting physiological derangement.",
      "wrong": [
        "Correct.",
        "Waiting for a laboratory target delays control.",
        "Bicarbonate does not correct ongoing tissue hypoperfusion.",
        "Vasopressors do not replace blood or haemorrhage control."
      ],
      "ref": "ATLS principles",
      "id": "p1-8"
    },
    {
      "topic": "General Surgical Principles",
      "difficulty": "Medium",
      "q": "For most indicated prophylactic antibiotics, the key timing principle is:",
      "o": [
        "Begin after skin closure",
        "Ensure effective tissue concentration at incision",
        "Give only when fever develops",
        "Continue until every drain is removed"
      ],
      "a": 1,
      "why": "Prophylaxis should achieve effective tissue levels when contamination occurs—at incision—with agent-specific timing.",
      "wrong": [
        "This is too late for prophylaxis.",
        "Correct.",
        "That is treatment, not prophylaxis.",
        "Drain presence alone does not justify prolonged prophylaxis."
      ],
      "ref": "WHO SSI guideline 2018; CDC 2017",
      "id": "p1-9"
    },
    {
      "topic": "General Surgical Principles",
      "difficulty": "Hard",
      "q": "A long operation exceeds two drug half-lives and involves major blood loss. What is the best prophylaxis adjustment?",
      "o": [
        "No action because the first dose is always sufficient",
        "Intraoperative redosing according to the agent and blood loss",
        "Switch automatically to an antifungal",
        "Continue the same antibiotic for seven days"
      ],
      "a": 1,
      "why": "Prolonged duration and major blood loss can reduce tissue concentration, making appropriate intraoperative redosing necessary.",
      "wrong": [
        "Concentrations may become subtherapeutic.",
        "Correct.",
        "Routine antifungal prophylaxis is not indicated.",
        "Postoperative duration does not correct inadequate intraoperative exposure."
      ],
      "ref": "CDC/WHO SSI prevention principles",
      "id": "p1-10"
    },
    {
      "topic": "General Surgical Principles",
      "difficulty": "Easy",
      "q": "Which statement about surgical drains and antibiotic prophylaxis is correct?",
      "o": [
        "Any drain mandates antibiotics until removal",
        "A drain alone is not an indication to prolong prophylaxis",
        "Drains eliminate SSI risk",
        "Antibiotics should start only when the drain is removed"
      ],
      "a": 1,
      "why": "Prophylaxis should not be extended solely because a drain remains.",
      "wrong": [
        "This promotes harm and resistance without evidence.",
        "Correct.",
        "Drains can themselves be associated with complications.",
        "This misses the prophylactic window."
      ],
      "ref": "WHO SSI guideline 2018",
      "id": "p1-11"
    },
    {
      "topic": "General Surgical Principles",
      "difficulty": "Medium",
      "q": "Which approach best supports antimicrobial stewardship after surgery?",
      "o": [
        "Broaden therapy whenever CRP is elevated",
        "Review cultures, anatomy, source control and clinical response, then de-escalate when appropriate",
        "Use dual broad-spectrum therapy for every clean operation",
        "Avoid documenting an intended duration"
      ],
      "a": 1,
      "why": "Stewardship requires repeated reassessment and narrowing/stopping based on microbiology, source control and clinical course.",
      "wrong": [
        "CRP alone is nonspecific.",
        "Correct.",
        "Clean procedures do not justify routine broad therapy.",
        "Documented indication and duration improve safety."
      ],
      "ref": "WHO/SSC antimicrobial stewardship principles",
      "id": "p1-12"
    }
  ],
  "cards": [
    {
      "id": "f1",
      "front": "qSOFA purpose",
      "back": "A bedside risk prompt in suspected infection; it is not a stand-alone definition or screening replacement.",
      "topic": "Surgical Infections"
    },
    {
      "id": "f2",
      "front": "Source control",
      "back": "Remove/drain/debride the anatomical focus as soon as medically and logistically practical.",
      "topic": "Surgical Infections"
    },
    {
      "id": "f3",
      "front": "Lactate",
      "back": "Interpret trend and context; elevation is not specific for sepsis.",
      "topic": "Surgical Infections"
    },
    {
      "id": "f4",
      "front": "Septic vasopressor first line",
      "back": "Norepinephrine is the usual first-line vasopressor in adult septic shock.",
      "topic": "Surgical Infections"
    },
    {
      "id": "f5",
      "front": "Culture timing",
      "back": "Obtain before antimicrobials when this does not meaningfully delay treatment.",
      "topic": "Surgical Infections"
    },
    {
      "id": "f6",
      "front": "Antibiotic de-escalation",
      "back": "Narrow or stop based on cultures, source control and response.",
      "topic": "Surgical Infections"
    },
    {
      "id": "f7",
      "front": "Lethal diamond",
      "back": "Hypothermia, acidosis, coagulopathy and hypocalcaemia reinforce one another.",
      "topic": "Trauma and Emergency Surgery"
    },
    {
      "id": "f8",
      "front": "Damage-control surgery",
      "back": "Abbreviated control of bleeding/contamination followed by physiological restoration and later definitive repair.",
      "topic": "Trauma and Emergency Surgery"
    },
    {
      "id": "f9",
      "front": "Permissive hypotension exception",
      "back": "Avoid hypotension in traumatic brain injury; preserve cerebral perfusion.",
      "topic": "Trauma and Emergency Surgery"
    },
    {
      "id": "f10",
      "front": "Massive transfusion calcium",
      "back": "Citrate binds calcium; monitor ionised calcium.",
      "topic": "Trauma and Emergency Surgery"
    },
    {
      "id": "f11",
      "front": "TXA in trauma",
      "back": "Benefit is time-sensitive; use early in eligible major bleeding trauma patients according to protocol.",
      "topic": "Trauma and Emergency Surgery"
    },
    {
      "id": "f12",
      "front": "Pelvic binder",
      "back": "Place over the greater trochanters, not the iliac crests.",
      "topic": "Trauma and Emergency Surgery"
    },
    {
      "id": "f13",
      "front": "Prophylaxis goal",
      "back": "Adequate tissue concentration at the time of incision.",
      "topic": "General Surgical Principles"
    },
    {
      "id": "f14",
      "front": "Redosing trigger",
      "back": "Prolonged surgery or major blood loss, adjusted to the antimicrobial half-life/protocol.",
      "topic": "General Surgical Principles"
    },
    {
      "id": "f15",
      "front": "Drain trap",
      "back": "A drain alone is not an indication for prolonged prophylactic antibiotics.",
      "topic": "General Surgical Principles"
    },
    {
      "id": "f16",
      "front": "Clean wound",
      "back": "Uninfected operative wound without entry into respiratory, alimentary, genital or uninfected urinary tract.",
      "topic": "General Surgical Principles"
    },
    {
      "id": "f17",
      "front": "SSI prevention bundle",
      "back": "Combine evidence-based measures; no single intervention substitutes for sound technique.",
      "topic": "General Surgical Principles"
    },
    {
      "id": "f18",
      "front": "Established infection",
      "back": "Requires therapeutic antibiotics and source control—not merely a longer “prophylaxis” course.",
      "topic": "General Surgical Principles"
    }
  ],
  "cases": [
    {
      "title": "Perforation with septic shock",
      "stem": "A 64-year-old has diffuse peritonitis, lactate 5.1 mmol/L and escalating norepinephrine. CT shows free colonic perforation.",
      "choices": [
        "Wait for lactate normalisation before surgery",
        "Urgent source control while resuscitation continues",
        "Escalate antibiotics and repeat CT tomorrow"
      ],
      "answer": 1,
      "explanation": "Resuscitation and source control proceed together; persistent anatomical contamination will continue to drive shock."
    },
    {
      "title": "Cold, coagulopathic trauma patient",
      "stem": "After blunt trauma, the patient is bleeding, 34°C, acidotic and requires continuing transfusion.",
      "choices": [
        "Definitive multivisceral reconstruction now",
        "Abbreviated damage-control operation",
        "Stop transfusion until coagulation tests normalise"
      ],
      "answer": 1,
      "explanation": "Physiological exhaustion favours abbreviated haemorrhage/contamination control and ICU restoration before definitive repair."
    },
    {
      "title": "Drain after colorectal surgery",
      "stem": "A stable patient has no evidence of infection on postoperative day 2. A pelvic drain remains.",
      "choices": [
        "Continue prophylaxis until drain removal",
        "Stop prophylaxis according to the recommended window",
        "Add antifungal prophylaxis"
      ],
      "answer": 1,
      "explanation": "A drain alone does not justify extending prophylactic antibiotics."
    }
  ]
};
