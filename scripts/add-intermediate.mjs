// One-time, idempotent curriculum migration. Chapter order follows supplied PDFs.
import fs from 'node:fs';
import path from 'node:path';
const root = path.resolve(import.meta.dirname, '..');
const read = p => JSON.parse(fs.readFileSync(path.join(root,p),'utf8'));
const write = (p,d) => { fs.mkdirSync(path.dirname(path.join(root,p)),{recursive:true}); fs.writeFileSync(path.join(root,p),JSON.stringify(d,null,2)+'\n'); };
const catalog = {
  class11: {
    botany: ['The Living World','Biological Classification','Science of Plants - Botany','Plant Kingdom','Morphology of Flowering Plants','Modes of Reproduction','Sexual Reproduction in Flowering Plants','Taxonomy of Angiosperms','Cell: The Unit of Life','Biomolecules','Cell Cycle and Cell Division','Histology and Anatomy of Flowering Plants','Ecological Adaptations, Succession and Ecological Services'],
    zoology: ['The Living World','Animal Tissues','Animal Diversity - I (Invertebrate Phyla)','Animal Diversity - II (Phylum: Chordata)','Biology in Human Welfare','Periplaneta americana (Cockroach)','Ecology and Biodiversity','Economic Zoology'],
    physics: ['Physical World and Measurement','Motion along a Straight Line','Motion in a Plane','Laws of Motion','Work, Energy and Power','System of Particles and Rotational Motion','Oscillations','Gravitation','Mechanical Properties of Solids','Mechanical Properties of Fluids','Thermal Properties of Matter','Thermodynamics','Kinetic Theory','Physics of Emerging Technologies'],
    chemistry: ['Atomic Structure','Classification of Elements and Periodicity in Properties','Chemical Bonding and Molecular Structure','Stoichiometry','Thermodynamics','Chemical Equilibrium and Acids-Bases','The s-Block Elements','The p-Block Elements - Group 13','The p-Block Elements - Group 14','Organic Chemistry - Some Basic Principles and Techniques and Hydrocarbons']
  },
  class12: {
    botany: ['Transport in Plants','Mineral Nutrition','Enzymes','Photosynthesis in Higher Plants','Respiration in Plants','Plant Growth and Development','Bacteria','Viruses','Principles of Inheritance and Variation','Molecular Basis of Inheritance','Biotechnology: Principles and Processes','Biotechnology and its Applications','Strategies for Enhancement in Food Production','Microbes in Human Welfare'],
    zoology: ['Human Anatomy and Physiology - I','Human Anatomy and Physiology - II','Human Anatomy and Physiology - III','Human Anatomy and Physiology - IV','Human Reproduction','Genetics','Organic Evolution','Applied Biology'],
    physics: ['Waves','Ray Optics and Optical Instruments','Wave Optics','Electric Charges and Fields','Electrostatic Potential and Capacitance','Current Electricity','Moving Charges and Magnetism','Magnetism and Matter','Electromagnetic Induction','Alternating Current','Electromagnetic Waves','Dual Nature of Radiation and Matter','Atoms','Nuclei','Semiconductor Electronics: Materials, Devices and Simple Circuits','Communication Systems'],
    chemistry: ['Solid State','Solutions','Electrochemistry and Chemical Kinetics','Surface Chemistry','General Principles of Metallurgy','p-Block Elements - Groups 15, 16, 17 and 18','d- and f-Block Elements and Coordination Compounds','Polymers','Biomolecules','Chemistry in Everyday Life','Haloalkanes and Haloarenes','Organic Compounds Containing C, H and O','Organic Compounds Containing Nitrogen']
  }
};
const sources = {
  class11: {botany:'Botany first year .pdf',zoology:'ZOOLOGY_-I_SYLLABUS.pdf',physics:'PHYSICS_I_SYLLABUS.pdf',chemistry:'CHEMISTRY_I_SYLLABUS.pdf'},
  class12: {botany:'Academic_Annual_Plan_Botany_II.pdf',zoology:'Academic_Annual_Plan_Zoology_II.pdf',physics:'Academic_Annual_Plan_Physics_II.pdf',chemistry:'Annual_Plan__Chemistry_II.pdf'}
};
const zooTopics = [['Digestion and Absorption','Breathing and Exchange of Gases'],['Body Fluids and Circulation','Excretory Products and their Elimination'],['Musculo-Skeletal System','Neural Control and Coordination'],['Endocrine System and Chemical Coordination','Immune System'],['Human Reproductive System','Reproductive Health'],['Heredity and Variation','Blood Groups','Sex Determination','Sex-linked Inheritance','Genetic Disorders','Human Genome Project','DNA Fingerprinting'],['Origin of Life','Evidence and Theories of Evolution','Hardy-Weinberg Equilibrium','Speciation','Human Evolution'],['Animal Husbandry','Poultry','Bee-Keeping','Fishery Management','Biotechnology in Medicine','Vaccines','Molecular Diagnosis','Gene Therapy','Transgenic Animals','Stem Cells']];
const names={botany:'Botany',zoology:'Zoology',physics:'Physics',chemistry:'Chemistry'};
const icons={botany:'🌿',zoology:'🦋',physics:'⚛️',chemistry:'⚗️'};
const manifest=read('data/manifest.json');
for(const [course,subjects] of Object.entries(catalog)) {
  const level=Number(course.replace('class',''));
  for(const [subject,chapters] of Object.entries(subjects)) {
    const file=`data/${course}/${subject}.json`;
    if(fs.existsSync(path.join(root,file))) continue; // Never overwrite authored questions on rerun.
    write(file,{subject:names[subject],icon:icons[subject],classLevel:level,board:'Telangana Intermediate',source:{file:sources[course][subject],academicYear:course==='class11'&&subject==='botany'?'2024-2025':'2026-2027',kind:course==='class12'||subject==='botany'?'Annual academic plan':'Syllabus',note:course==='class11'&&subject==='botany'?'Supplied source is 2024-2025; alignment with 2026-2027 is not yet verified.':''},description:`Telangana Intermediate ${level===11?'First':'Second'} Year ${names[subject]}`,chapters:chapters.map((name,i)=>({id:`${course}-${subject}-${String(i+1).padStart(2,'0')}`,number:i+1,name,topics:course==='class12'&&subject==='zoology'?zooTopics[i]:[],resources:[],vsaq:[],saq:[],laq:[],mcqs:[]}))});
  }
  if(!manifest.categories.some(c=>c.id===course)) manifest.categories.splice(level===11?1:2,0,{id:course,name:`Class ${level} • Telangana Intermediate`,tagline:`${level===11?'First':'Second'} Year Board Preparation`,subjects:Object.keys(subjects).map(s=>({id:s,name:names[s],icon:icons[s],file:`data/${course}/${s}.json`}))});
}
// NEET class labels use NCERT class placement, not Telangana board placement.
const bio=read('data/neet/biology.json');
const zoology=new Set(['Circulation','Respiration','Excretion','Chemical Coordination','Neural Control','Human Reproduction','Reproductive Health','Evolution']);
const bio12=new Set(['Principles of Inheritance','Molecular Basis of Inheritance','Sexual Reproduction in Flowering Plants','Human Reproduction','Reproductive Health','Evolution','Ecosystem','Environmental Issues']);
const physics12=new Set(['Waves','Electrostatics','Current Electricity','Moving Charges and Magnetism','Electromagnetic Induction','Alternating Current','Electromagnetic Waves','Wave Optics','Dual Nature of Radiation and Matter','Atoms','Nuclei','Semiconductor Electronics']);
// Waves is NCERT Class 11, although it belongs to TG Intermediate second year.
physics12.delete('Waves');
const chem12=new Set(['d- and f-Block Elements','Aldehydes, Ketones and Carboxylic Acids','Amines']);
const split=(questions,subject,is12)=>({subject:names[subject],exam:'NEET UG',icon:icons[subject],description:'Existing practice bank, organized by NCERT class and chapter. Syllabus coverage and answer review are not complete.',chapters:[...new Set(questions.map(q=>q.chapter))].map((name,i)=>({id:`neet-${subject}-${i+1}`,name,classLevel:is12.has(name)?12:11,mcqs:questions.filter(q=>q.chapter===name)}))});
for(const s of ['botany','zoology']) {
  if(!fs.existsSync(path.join(root,`data/neet/${s}.json`))) write(`data/neet/${s}.json`,split(bio.chapters.flatMap(c=>c.mcqs).filter(q=>zoology.has(q.chapter)===(s==='zoology')),s,bio12));
}
for(const s of ['physics','chemistry']) {
  const old=read(`data/neet/${s}.json`);
  if(!old.chapters.every(c=>c.classLevel)) write(`data/neet/${s}.json`,split(old.chapters.flatMap(c=>c.mcqs),s,s==='physics'?physics12:chem12));
}
manifest.categories.find(c=>c.id==='neet').subjects=Object.keys(names).map(s=>({id:s,name:names[s],icon:icons[s],file:`data/neet/${s}.json`}));
manifest.version='2.0.0';
write('data/manifest.json',manifest);
console.log('Added eight board subject files and reorganized NEET; existing content preserved.');
