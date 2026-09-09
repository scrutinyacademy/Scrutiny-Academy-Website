import fs from 'node:fs';
import path from 'node:path';

const root = path.resolve(import.meta.dirname, '..');
const file = path.join(root, 'data/neet/biology.json');
const data = JSON.parse(fs.readFileSync(file, 'utf8'));

// Each row is: question, correct option, three distractors, explanation, difficulty.
// Questions are original and aligned to the chapter named by the key.
const bank = {
  'neet-biology-11-1': [
    ['The basic unit used in the binomial system of nomenclature is:', 'Species', 'Genus', 'Family', 'Order', 'Species is the basic unit of classification.', 'Easy'],
    ['In Mangifera indica, the word Mangifera denotes the:', 'Genus', 'Species', 'Family', 'Order', 'The first word in a scientific name is the genus.', 'Easy'],
    ['A taxonomic key is primarily based on:', 'Contrasting characters', 'Habitat alone', 'Chromosome number alone', 'Economic importance', 'Keys use paired contrasting characters called couplets.', 'Easy'],
    ['A herbarium is a collection of:', 'Dried, pressed and preserved plant specimens', 'Living wild animals', 'Microbial cultures only', 'Fossil fuels', 'Herbaria store labelled, dried and pressed plant specimens.', 'Easy'],
    ['The correct ascending taxonomic sequence is:', 'Species, genus, family, order', 'Genus, species, order, family', 'Family, species, genus, order', 'Order, family, species, genus', 'Species is followed by genus, family and order in ascending rank.', 'Medium'],
    ['Which feature is a defining property of living organisms?', 'Cellular organisation', 'Increase in size alone', 'Locomotion', 'Crystallisation', 'All living organisms possess cellular organisation; growth alone can occur in non-living matter.', 'Medium']
  ],
  'neet-biology-11-2': [
    ['The cell wall of most fungi is mainly composed of:', 'Chitin', 'Cellulose only', 'Peptidoglycan', 'Pectin only', 'Fungal cell walls characteristically contain chitin.', 'Easy'],
    ['Methanogens belong to the group:', 'Archaebacteria', 'Eubacteria', 'Cyanobacteria', 'Slime moulds', 'Methanogens are archaebacteria that produce methane in anaerobic habitats.', 'Easy'],
    ['Diatomaceous earth is formed chiefly from the deposits of:', 'Diatom cell walls', 'Fungal hyphae', 'Lichen thalli', 'Bacterial capsules', 'Siliceous frustules of diatoms accumulate as diatomaceous earth.', 'Medium'],
    ['The infectious agent made only of low-molecular-weight RNA is a:', 'Viroid', 'Virus', 'Prion', 'Bacterium', 'Viroids are naked infectious RNA molecules without a protein coat.', 'Medium'],
    ['Lichens represent a symbiotic association between:', 'An alga and a fungus', 'A bacterium and a virus', 'Two fungi', 'A moss and a fern', 'The algal partner photosynthesises while the fungal partner provides shelter and minerals.', 'Easy'],
    ['Red tides are commonly caused by rapid multiplication of:', 'Dinoflagellates', 'Euglenoids', 'Slime moulds', 'Archaebacteria', 'Blooms of pigmented dinoflagellates can produce red tides.', 'Medium']
  ],
  'neet-biology-11-3': [
    ['The dominant plant body in bryophytes is the:', 'Gametophyte', 'Sporophyte', 'Embryo', 'Seedling', 'Bryophytes have a dominant, independent gametophyte.', 'Easy'],
    ['Heterospory is observed in:', 'Selaginella', 'Funaria', 'Marchantia', 'Chara', 'Selaginella produces distinct microspores and megaspores.', 'Medium'],
    ['In gymnosperms, ovules are called naked because they are:', 'Not enclosed by an ovary wall', 'Without integuments', 'Without a nucellus', 'Produced without meiosis', 'Gymnosperm ovules and seeds are not enclosed within an ovary or fruit.', 'Easy'],
    ['The reserve food in brown algae is mainly:', 'Laminarin and mannitol', 'Starch and cellulose', 'Floridean starch', 'Glycogen only', 'Phaeophyceae commonly store laminarin and mannitol.', 'Medium'],
    ['Protonema is a stage in the life cycle of:', 'Mosses', 'Gymnosperms', 'Angiosperms', 'Brown algae', 'A moss spore germinates into a filamentous protonema.', 'Easy'],
    ['The dominant generation in pteridophytes is the:', 'Sporophyte', 'Gametophyte', 'Endosperm', 'Protonema', 'Pteridophytes possess a dominant, independent vascular sporophyte.', 'Easy']
  ],
  'neet-biology-11-4': [
    ['Cnidoblasts are characteristic of:', 'Cnidaria', 'Porifera', 'Annelida', 'Mollusca', 'Cnidarians possess stinging cells called cnidoblasts or cnidocytes.', 'Easy'],
    ['A pseudocoelom is found in:', 'Aschelminthes', 'Platyhelminthes', 'Annelida', 'Echinodermata', 'Roundworms possess a body cavity not fully lined by mesoderm.', 'Medium'],
    ['The water vascular system is characteristic of:', 'Echinodermata', 'Arthropoda', 'Mollusca', 'Chordata', 'Echinoderms use a water vascular system for locomotion and feeding.', 'Easy'],
    ['Jointed appendages are a defining feature of:', 'Arthropoda', 'Annelida', 'Ctenophora', 'Hemichordata', 'Arthropods have paired, jointed appendages and a chitinous exoskeleton.', 'Easy'],
    ['Notochord is present at least during embryonic life in:', 'Chordates', 'Molluscs', 'Annelids', 'Echinoderms only', 'Presence of a notochord at some developmental stage defines chordates.', 'Easy'],
    ['Which animal is diploblastic?', 'Hydra', 'Earthworm', 'Cockroach', 'Starfish', 'Hydra has ectoderm and endoderm separated by mesoglea.', 'Medium']
  ],
  'neet-biology-11-5': [
    ['Prop roots occur in:', 'Banyan', 'Maize', 'Carrot', 'Potato', 'Banyan branches produce pillar-like prop roots for support.', 'Easy'],
    ['A potato tuber is a modified:', 'Stem', 'Root', 'Leaf', 'Flower', 'Its eyes are axillary buds, showing that potato is a stem tuber.', 'Easy'],
    ['The edible part of a coconut is mainly the:', 'Endosperm', 'Pericarp', 'Cotyledon', 'Thalamus', 'Coconut water and kernel are liquid and solid endosperm, respectively.', 'Medium'],
    ['In a hypogynous flower, the ovary is:', 'Superior', 'Half-inferior', 'Inferior', 'Absent', 'Other floral whorls arise below the ovary in hypogynous flowers.', 'Easy'],
    ['Valvate aestivation occurs when sepals or petals:', 'Touch at the margins without overlapping', 'Overlap in one direction', 'Show a large standard petal', 'Remain fused into a tube', 'Valvate members meet at their edges but do not overlap.', 'Medium'],
    ['The fruit of pea is classified as a:', 'Legume', 'Caryopsis', 'Capsule', 'Drupe', 'Pea develops a dry dehiscent legume from a monocarpellary ovary.', 'Easy']
  ],
  'neet-biology-11-6': [
    ['Vascular bundles in a typical monocot stem are:', 'Scattered and closed', 'Arranged in a ring and open', 'Radial and open', 'Absent from the ground tissue', 'Monocot stems have scattered bundles lacking vascular cambium.', 'Medium'],
    ['Bulliform cells are found in the:', 'Upper epidermis of monocot leaves', 'Root cap', 'Secondary phloem', 'Pith of dicot stems', 'Bulliform cells help monocot leaves roll during water stress.', 'Medium'],
    ['Casparian strips occur in the:', 'Endodermis', 'Epidermis', 'Pericycle', 'Pith', 'Suberised Casparian strips regulate movement through root endodermis.', 'Easy'],
    ['In a dorsiventral leaf, palisade tissue lies mainly below the:', 'Upper epidermis', 'Lower epidermis', 'Bundle sheath', 'Pericycle', 'Palisade mesophyll is positioned below the adaxial epidermis.', 'Easy'],
    ['Secondary growth in a dicot stem is mainly produced by:', 'Vascular cambium and cork cambium', 'Apical meristem only', 'Intercalary meristem only', 'Root cap and epidermis', 'Lateral meristems add secondary vascular and protective tissues.', 'Medium'],
    ['Protoxylem is endarch in a typical:', 'Stem', 'Root', 'Leaf epidermis', 'Root cap', 'Stem protoxylem lies toward the pith, giving an endarch arrangement.', 'Medium']
  ],
  'neet-biology-11-7': [
    ['The epithelium lining alveoli is primarily:', 'Simple squamous epithelium', 'Stratified cuboidal epithelium', 'Ciliated columnar epithelium', 'Transitional epithelium', 'A thin squamous lining permits rapid gas diffusion.', 'Easy'],
    ['Intercalated discs are found in:', 'Cardiac muscle', 'Smooth muscle', 'Skeletal muscle', 'Nervous tissue', 'Intercalated discs connect cardiac muscle cells mechanically and electrically.', 'Easy'],
    ['Tendon connects:', 'Muscle to bone', 'Bone to bone', 'Neuron to muscle', 'Cartilage to epithelium', 'Dense regular connective tissue forms tendons between muscle and bone.', 'Easy'],
    ['The structural and functional unit of nervous tissue is the:', 'Neuron', 'Nephron', 'Osteon', 'Sarcomere', 'Neurons receive and transmit nerve impulses.', 'Easy'],
    ['Areolar tissue is a type of:', 'Loose connective tissue', 'Muscular tissue', 'Neural tissue', 'Epithelial tissue', 'Areolar tissue loosely binds skin, muscles, vessels and nerves.', 'Medium'],
    ['The body cavity of a cockroach is mainly a:', 'Haemocoel', 'True coelom filled only with coelomic fluid', 'Pseudocoel', 'Spongocoel', 'In cockroach the coelom is reduced and the main cavity is a blood-filled haemocoel.', 'Medium']
  ],
  'neet-biology-11-8': [
    ['Cristae are infoldings of the:', 'Inner mitochondrial membrane', 'Outer chloroplast membrane', 'Nuclear envelope only', 'Golgi cisterna', 'Cristae increase the surface available for oxidative phosphorylation.', 'Easy'],
    ['The cis face of the Golgi apparatus mainly:', 'Receives vesicles from the endoplasmic reticulum', 'Releases lysosomal enzymes outside the cell', 'Synthesises DNA', 'Forms spindle fibres', 'The cis or forming face receives ER-derived transport vesicles.', 'Medium']
  ],
  'neet-biology-11-9': [
    ['The bond joining two amino acids is a:', 'Peptide bond', 'Glycosidic bond', 'Phosphodiester bond', 'Hydrogen bond only', 'A peptide bond forms between amino and carboxyl groups of adjacent amino acids.', 'Easy'],
    ['A nucleotide differs from a nucleoside by the presence of:', 'A phosphate group', 'A nitrogenous base', 'A pentose sugar', 'A peptide group', 'A nucleoside becomes a nucleotide when one or more phosphate groups are added.', 'Easy']
  ],
  'neet-biology-11-10': [
    ['DNA replication occurs mainly during which phase of interphase?', 'S phase', 'G1 phase', 'G2 phase', 'G0 phase', 'Chromosomal DNA is duplicated during S phase.', 'Easy'],
    ['Centromeres divide and sister chromatids separate during:', 'Anaphase of mitosis', 'Prophase of mitosis', 'Metaphase I', 'Telophase I', 'Centromere division initiates sister chromatid movement in mitotic anaphase.', 'Medium'],
    ['Reduction in chromosome number occurs because homologous chromosomes separate in:', 'Anaphase I', 'Anaphase II', 'Mitotic anaphase', 'Prophase II', 'Homologues separate in meiosis I while sister centromeres remain together.', 'Medium']
  ],
  'neet-biology-11-11': [
    ['The first stable product of the C4 pathway is:', 'Oxaloacetic acid', '3-phosphoglycerate', 'Ribulose bisphosphate', 'Pyruvate only', 'PEP carboxylase initially fixes carbon dioxide into oxaloacetate.', 'Easy'],
    ['Photorespiration begins when RuBisCO acts as a/an:', 'Oxygenase', 'Decarboxylase', 'Kinase', 'Hydrolase', 'RuBisCO oxygenates RuBP when the oxygen-to-carbon dioxide ratio is high.', 'Medium']
  ],
  'neet-biology-11-12': [
    ['Glycolysis occurs in the:', 'Cytoplasm', 'Mitochondrial matrix', 'Inner mitochondrial membrane', 'Chloroplast stroma', 'The ten reactions of glycolysis take place in the cytosol.', 'Easy'],
    ['The final electron acceptor in aerobic respiration is:', 'Oxygen', 'NADH', 'Pyruvate', 'Carbon dioxide', 'Oxygen accepts electrons and protons to form water.', 'Easy'],
    ['The Krebs cycle occurs in the:', 'Mitochondrial matrix', 'Cytoplasm', 'Thylakoid lumen', 'Golgi apparatus', 'Enzymes of the Krebs cycle are located chiefly in the mitochondrial matrix.', 'Easy'],
    ['Alcoholic fermentation of one glucose molecule produces:', 'Two ethanol and two carbon dioxide molecules', 'Two lactate molecules only', 'Six carbon dioxide molecules', 'One ethanol molecule', 'Yeast converts two pyruvate into two ethanol and two carbon dioxide.', 'Medium'],
    ['The respiratory quotient is approximately 1 when the substrate is:', 'A carbohydrate', 'A fat', 'An organic acid with abundant oxygen', 'A protein only', 'Complete carbohydrate oxidation releases and consumes equal volumes of carbon dioxide and oxygen.', 'Medium'],
    ['Most ATP in aerobic respiration is formed by:', 'Oxidative phosphorylation', 'Glycolysis alone', 'Substrate-level phosphorylation in the Krebs cycle only', 'Fermentation', 'The electron transport chain establishes the proton gradient that drives ATP synthase.', 'Medium']
  ],
  'neet-biology-11-13': [
    ['Apical dominance is promoted mainly by:', 'Auxin', 'Cytokinin', 'Ethylene', 'Abscisic acid', 'Auxin from the shoot apex suppresses growth of lateral buds.', 'Easy'],
    ['Bolting in rosette plants can be induced by:', 'Gibberellins', 'Abscisic acid', 'Ethylene only', 'Florigen breakdown', 'Gibberellins cause rapid internode elongation and bolting.', 'Easy'],
    ['The stress hormone that promotes stomatal closure is:', 'Abscisic acid', 'Auxin', 'Cytokinin', 'Gibberellin', 'ABA accumulates during water stress and helps close stomata.', 'Easy'],
    ['Fruit ripening is promoted by:', 'Ethylene', 'Cytokinin', 'Auxin only', 'Abscisic acid only', 'Ethylene is a gaseous regulator that accelerates ripening in climacteric fruits.', 'Easy'],
    ['Vernalisation refers to induction of flowering by:', 'Exposure to low temperature', 'Long-day light only', 'High salt concentration', 'Removal of the shoot apex', 'A period of chilling promotes flowering in many winter varieties and biennials.', 'Medium']
  ],
  'neet-biology-11-14': [
    ['The largest amount of carbon dioxide is transported in blood as:', 'Bicarbonate ions', 'Carbaminohaemoglobin', 'Dissolved carbon dioxide', 'Carbon monoxide', 'Most carbon dioxide is converted to bicarbonate in red blood cells and plasma.', 'Medium'],
    ['Oxygen binds to haemoglobin mainly in the:', 'Pulmonary capillaries', 'Systemic tissues', 'Renal tubules', 'Hepatic portal vein', 'High alveolar oxygen pressure favours formation of oxyhaemoglobin.', 'Easy'],
    ['The normal inspiratory reserve volume is approximately:', '2500–3000 mL', '500 mL', '1000–1100 mL', '1100–1200 mL', 'Inspiratory reserve volume is the additional air inhaled after a normal inspiration.', 'Medium'],
    ['Emphysema primarily involves damage to the:', 'Alveolar walls', 'Tricuspid valve', 'Glomerular capsule', 'Myelin sheath', 'Loss of alveolar septa reduces respiratory surface area in emphysema.', 'Easy']
  ],
  'neet-biology-11-15': [
    ['The pacemaker of the human heart is the:', 'Sinoatrial node', 'Atrioventricular node', 'Bundle of His', 'Purkinje fibres', 'The SA node initiates the normal heartbeat.', 'Easy'],
    ['The first heart sound is produced chiefly by closure of the:', 'Atrioventricular valves', 'Semilunar valves', 'Vena caval openings', 'Coronary arteries', 'Closure of mitral and tricuspid valves produces the first heart sound.', 'Medium'],
    ['Which blood component is most directly involved in clot formation?', 'Platelets', 'Neutrophils', 'Lymphocytes', 'Erythrocytes', 'Platelets release factors and provide surfaces needed for coagulation.', 'Easy']
  ],
  'neet-biology-11-16': [
    ['Ultrafiltration of blood occurs in the:', 'Glomerulus', 'Loop of Henle', 'Collecting duct', 'Ureter', 'Glomerular capillary pressure drives filtration into Bowman\'s capsule.', 'Easy'],
    ['ADH increases water reabsorption mainly in the:', 'Distal tubule and collecting duct', 'Glomerulus only', 'Ascending limb only', 'Renal artery', 'ADH increases water permeability in the late distal tubule and collecting duct.', 'Medium']
  ],
  'neet-biology-11-17': [
    ['The functional contractile unit of a striated muscle fibre is the:', 'Sarcomere', 'Neuron', 'Osteon', 'Nephron', 'A sarcomere extends between two successive Z lines.', 'Easy'],
    ['During skeletal muscle contraction, the length of the A band:', 'Remains constant', 'Decreases to zero', 'Doubles', 'First increases and then disappears', 'Thick filament length does not change, so the A band remains constant.', 'Medium'],
    ['Calcium initiates skeletal muscle contraction by binding to:', 'Troponin', 'Myosin head directly', 'Actin active site', 'Tropomyosin only', 'Calcium-bound troponin shifts tropomyosin away from actin binding sites.', 'Medium'],
    ['A ball-and-socket joint occurs at the:', 'Shoulder', 'Elbow', 'Knee only', 'Joint between atlas and axis', 'The shoulder permits movement in many planes through a ball-and-socket joint.', 'Easy'],
    ['Gout is associated with deposition of crystals of:', 'Uric acid', 'Calcium carbonate', 'Glucose', 'Cholesterol only', 'Monosodium urate crystals in joints produce gouty inflammation.', 'Easy']
  ],
  'neet-biology-11-18': [
    ['The resting membrane potential of a neuron is maintained largely by the:', 'Sodium–potassium pump and selective ion permeability', 'Golgi apparatus alone', 'Centrosome', 'Ribosome', 'Ion gradients and selective permeability keep the inside relatively negative.', 'Medium'],
    ['Saltatory conduction occurs in:', 'Myelinated nerve fibres', 'Unmyelinated fibres only', 'Smooth muscle', 'Dendrites without membranes', 'Impulses appear to jump between nodes of Ranvier in myelinated axons.', 'Easy'],
    ['The blind spot of the human eye lacks:', 'Photoreceptors', 'Optic nerve fibres', 'Blood vessels', 'Ganglion cells only', 'The optic nerve exits at the blind spot, where rods and cones are absent.', 'Easy'],
    ['The organ of Corti is located in the:', 'Cochlea', 'Semicircular canals', 'Eustachian tube', 'Tympanic membrane', 'Sensory hair cells for hearing are housed in the organ of Corti.', 'Easy']
  ],
  'neet-biology-11-19': [
    ['Insulin is secreted by the:', 'Beta cells of pancreatic islets', 'Alpha cells of pancreatic islets', 'Adrenal medulla', 'Thyroid follicles', 'Pancreatic beta cells release insulin in response to elevated blood glucose.', 'Easy'],
    ['The hormone that raises blood calcium concentration is:', 'Parathyroid hormone', 'Calcitonin', 'Insulin', 'Melatonin', 'Parathyroid hormone promotes calcium release and reabsorption.', 'Medium'],
    ['Oxytocin is released into blood from the:', 'Posterior pituitary', 'Anterior pituitary', 'Thyroid gland', 'Adrenal cortex', 'Oxytocin is synthesised in the hypothalamus and released from the posterior pituitary.', 'Medium'],
    ['Iodine is essential for synthesis of:', 'Thyroid hormones', 'Insulin', 'Cortisol', 'Adrenaline', 'Thyroxine and triiodothyronine contain iodine.', 'Easy']
  ],
  'neet-biology-12-1': [
    ['A typical angiosperm embryo sac at maturity is:', 'Seven-celled and eight-nucleate', 'Eight-celled and eight-nucleate', 'Four-celled and eight-nucleate', 'Seven-celled and seven-nucleate', 'The mature Polygonum-type embryo sac has seven cells but eight nuclei.', 'Medium'],
    ['Double fertilisation produces a zygote and a:', 'Primary endosperm nucleus', 'Pollen mother cell', 'Megaspore mother cell', 'Seed coat', 'One male gamete forms the zygote and the other fuses with polar nuclei to form the primary endosperm nucleus.', 'Easy'],
    ['The pollen tube usually enters the ovule through the:', 'Micropyle', 'Chalaza', 'Funicle', 'Integument wall at random', 'Entry through the micropyle is called porogamy and is most common.', 'Easy']
  ],
  'neet-biology-12-2': [
    ['The acrosome of a sperm is derived from the:', 'Golgi apparatus', 'Mitochondrion', 'Nucleus', 'Smooth endoplasmic reticulum', 'During spermiogenesis, the Golgi apparatus forms the enzyme-containing acrosome.', 'Medium']
  ],
  'neet-biology-12-3': [
    ['A copper-releasing intrauterine device mainly prevents pregnancy by:', 'Reducing sperm motility and fertilising capacity', 'Permanently stopping ovulation', 'Destroying the endometrium completely', 'Blocking pituitary hormone release', 'Copper ions suppress sperm motility and fertilising capacity; IUDs also increase phagocytosis of sperm.', 'Medium'],
    ['Amniocentesis is legally restricted when misused for:', 'Prenatal sex determination', 'Detecting chromosomal disorders', 'Assessing foetal development', 'Sampling amniotic fluid for diagnosis', 'Its misuse for sex determination contributed to female foeticide and is prohibited.', 'Easy'],
    ['Vasectomy involves cutting and tying the:', 'Vasa deferentia', 'Ureters', 'Urethra', 'Seminiferous tubules', 'Vasectomy blocks sperm transport through the vasa deferentia.', 'Easy'],
    ['In vitro fertilisation followed by transfer of an embryo with more than eight blastomeres into the uterus is called:', 'IUT', 'ZIFT', 'GIFT', 'AI', 'An embryo beyond the eight-blastomere stage is transferred to the uterus by intrauterine transfer.', 'Hard']
  ],
  'neet-biology-12-6': [
    ['Homologous organs provide evidence for:', 'Divergent evolution', 'Convergent evolution', 'Chemical evolution only', 'Mutation without selection', 'Homologous structures share ancestry but may perform different functions.', 'Easy'],
    ['Industrial melanism in peppered moths demonstrates:', 'Natural selection', 'Artificial hybridisation', 'Genetic drift only', 'Use and disuse', 'Environmental change altered camouflage and differential survival of colour forms.', 'Medium']
  ],
  'neet-biology-12-7': [
    ['Antibodies are secreted by:', 'Plasma cells', 'Erythrocytes', 'Platelets', 'Neutrophils only', 'Activated B lymphocytes differentiate into antibody-secreting plasma cells.', 'Easy'],
    ['HIV primarily attacks cells bearing the receptor:', 'CD4', 'CD8 only', 'Haemoglobin', 'Insulin', 'HIV targets CD4-positive helper T cells and other CD4-bearing cells.', 'Medium'],
    ['The infective stage of Plasmodium introduced into humans is the:', 'Sporozoite', 'Merozoite', 'Gametocyte', 'Ookinete', 'An infected female Anopheles injects sporozoites during a bite.', 'Easy'],
    ['Vaccination produces protection mainly by generating:', 'Immunological memory', 'Immediate nonspecific inflammation only', 'More erythrocytes', 'Permanent fever', 'Memory B and T cells enable a rapid secondary immune response.', 'Easy'],
    ['Histamine released during allergy is commonly associated with:', 'Mast cells', 'Red blood cells', 'Osteocytes', 'Hepatocytes', 'Mast-cell degranulation releases histamine during immediate allergic responses.', 'Medium']
  ],
  'neet-biology-12-8': [
    ['Biogas is rich in:', 'Methane', 'Oxygen', 'Nitrogen dioxide', 'Sulphur trioxide', 'Methanogenic archaea generate methane under anaerobic conditions.', 'Easy'],
    ['The flocs formed during sewage treatment contain:', 'Bacteria associated with fungal filaments', 'Only viruses', 'Only algae', 'Sterile organic particles', 'Microbial flocs oxidise organic matter in aeration tanks.', 'Medium'],
    ['Statins used to lower blood cholesterol were originally obtained from:', 'Monascus purpureus', 'Lactobacillus', 'Methanobacterium', 'Trichoderma polysporum', 'The yeast Monascus purpureus produces cholesterol-lowering statins.', 'Medium'],
    ['Cyclosporin A is produced by:', 'Trichoderma polysporum', 'Saccharomyces cerevisiae', 'Aspergillus niger', 'Rhizobium', 'This fungal product is used as an immunosuppressant in organ transplantation.', 'Medium'],
    ['The bacterium used as a biocontrol agent against several plant pathogens is:', 'Bacillus subtilis', 'Vibrio cholerae', 'Salmonella typhi', 'Clostridium tetani', 'Selected Bacillus strains suppress plant pathogens and are used in biological control.', 'Hard']
  ],
  'neet-biology-12-9': [
    ['Restriction endonucleases cut DNA at:', 'Specific recognition sequences', 'Every phosphodiester bond', 'Random amino acid sites', 'Only telomeres', 'Each restriction enzyme recognises a characteristic DNA sequence.', 'Easy'],
    ['A plasmid cloning vector must contain an origin of replication to:', 'Initiate replication in the host', 'Translate inserted DNA', 'Destroy selectable markers', 'Remove restriction sites', 'The origin controls initiation and often copy number of the vector.', 'Easy'],
    ['DNA fragments are separated by agarose gel electrophoresis primarily according to:', 'Size', 'Base colour', 'Number of ribosomes', 'Amino acid sequence', 'Negatively charged DNA moves through the gel, with smaller fragments migrating faster.', 'Medium'],
    ['The enzyme that joins DNA fragments by forming phosphodiester bonds is:', 'DNA ligase', 'DNA helicase', 'Restriction endonuclease', 'RNA polymerase', 'DNA ligase seals breaks in the sugar-phosphate backbone.', 'Easy'],
    ['PCR requires a thermostable DNA polymerase such as:', 'Taq polymerase', 'DNA ligase', 'Reverse transcriptase only', 'RuBisCO', 'Taq polymerase tolerates repeated high-temperature denaturation cycles.', 'Easy']
  ],
  'neet-biology-12-10': [
    ['Bt toxin is produced by:', 'Bacillus thuringiensis', 'Agrobacterium tumefaciens', 'Escherichia coli only', 'Rhizobium leguminosarum', 'Bacillus thuringiensis produces insecticidal crystal proteins.', 'Easy'],
    ['The inactive Bt protoxin becomes active in the insect:', 'Alkaline gut', 'Acidic stomach of mammals', 'Salivary gland', 'Haemolymph only', 'The alkaline insect gut solubilises and activates the crystal protoxin.', 'Medium'],
    ['RNA interference protects a transgenic plant by:', 'Silencing a complementary messenger RNA', 'Increasing translation of every gene', 'Removing all introns', 'Doubling chromosome number', 'Double-stranded RNA triggers sequence-specific degradation or silencing of target RNA.', 'Medium'],
    ['The first clinical gene therapy mentioned for ADA deficiency used genetically modified:', 'Lymphocytes', 'Erythrocytes', 'Platelets', 'Nephrons', 'Patient lymphocytes were cultured, given functional ADA cDNA and returned to the patient.', 'Medium'],
    ['Golden rice was engineered to accumulate:', 'Beta-carotene', 'Vitamin C only', 'Iron-containing haemoglobin', 'Insulin', 'Beta-carotene is a precursor of vitamin A.', 'Easy']
  ],
  'neet-biology-12-11': [
    ['Population density changes through births, deaths, immigration and:', 'Emigration', 'Mutation alone', 'Succession only', 'Stratification', 'Emigration removes individuals and is one of four direct demographic processes.', 'Easy'],
    ['In exponential population growth, dN/dt equals:', 'rN', 'K − N', 'N/r', 'r/K', 'With unlimited resources, change in population size is proportional to intrinsic rate r and population N.', 'Medium'],
    ['The logistic growth curve is typically:', 'Sigmoid', 'Perfectly linear', 'Circular', 'Always J-shaped', 'Resource limitation slows growth near carrying capacity, producing an S-shaped curve.', 'Easy'],
    ['An interaction in which one species benefits and the other is unaffected is:', 'Commensalism', 'Mutualism', 'Competition', 'Predation', 'Commensalism is denoted +/0.', 'Easy'],
    ['The competitive exclusion principle is associated with:', 'Gause', 'Darwin and Wallace jointly only', 'Mendel', 'Watson and Crick', 'Gause proposed that complete competitors cannot coexist indefinitely under identical limiting conditions.', 'Medium']
  ],
  'neet-biology-12-12': [
    ['The first trophic level in a grazing food chain is occupied by:', 'Producers', 'Herbivores', 'Primary carnivores', 'Decomposers only', 'Green plants capture solar energy and form the producer level.', 'Easy'],
    ['The pyramid of energy is always:', 'Upright', 'Inverted', 'Spindle-shaped only', 'Horizontal', 'Energy decreases at successive trophic levels because much is dissipated as heat.', 'Easy'],
    ['Primary succession on bare rock commonly begins with:', 'Lichens', 'Large trees', 'Zooplankton', 'Earthworms', 'Pioneer lichens weather rock and help initiate soil formation.', 'Easy'],
    ['Net primary productivity is equal to:', 'Gross primary productivity minus respiration', 'Gross primary productivity plus respiration', 'Respiration minus gross primary productivity', 'Secondary productivity minus decomposition', 'NPP is the biomass available after plants meet their respiratory costs.', 'Medium']
  ],
  'neet-biology-12-13': [
    ['Species richness is generally highest in:', 'Tropical regions', 'Polar regions', 'High mountain summits', 'Deeply polluted lakes', 'Tropical regions typically support greater species diversity than temperate or polar regions.', 'Easy'],
    ['A biodiversity hotspot must show high endemism and:', 'Extensive habitat loss', 'Low species richness', 'No human influence', 'Only marine organisms', 'Hotspots combine exceptional endemic diversity with severe habitat threat.', 'Medium'],
    ['Sacred groves are an example of:', 'In situ conservation', 'Ex situ conservation', 'Cryopreservation', 'Gene-bank storage', 'Species are protected within their natural community in sacred groves.', 'Easy'],
    ['Cryopreservation of gametes is an example of:', 'Ex situ conservation', 'In situ conservation', 'Ecological succession', 'Biomagnification', 'Genetic material is conserved outside the natural habitat at very low temperature.', 'Easy'],
    ['The IUCN Red List primarily provides information on:', 'Extinction risk of species', 'Daily weather forecasts', 'Crop market prices', 'Human blood groups', 'IUCN categories assess the conservation status and extinction risk of taxa.', 'Easy']
  ],
  'neet-biology-legacy-33': [
    ['Biomagnification refers to increasing concentration of a persistent pollutant at:', 'Successive trophic levels', 'Lower atmospheric layers only', 'The producer level alone', 'Each rainfall event', 'Non-biodegradable pollutants can become progressively concentrated along a food chain.', 'Easy'],
    ['Eutrophication is commonly caused by excessive input of:', 'Nutrients such as nitrates and phosphates', 'Oxygen only', 'Sand and gravel', 'Noble gases', 'Nutrient enrichment stimulates algal blooms and subsequent oxygen depletion.', 'Easy'],
    ['The Montreal Protocol was designed chiefly to control:', 'Ozone-depleting substances', 'Carbon monoxide from respiration', 'Soil erosion', 'Radioactive decay', 'The agreement phases out chemicals such as chlorofluorocarbons that damage stratospheric ozone.', 'Medium']
  ]
};

const targetByIndex = index => index < 15 ? 6 : 5;
const existingIds = data.chapters.flatMap(ch => ch.mcqs || []).map(q => q.id);
let serial = Math.max(...existingIds.map(id => Number(id.match(/(\d+)$/)?.[1] || 0))) + 1;

for (const [index, chapter] of data.chapters.entries()) {
  const target = targetByIndex(index);
  const needed = target - (chapter.mcqs || []).length;
  if (needed < 0) throw new Error(`${chapter.name} already exceeds its target.`);
  const rows = bank[chapter.id] || [];
  if (rows.length !== needed) {
    throw new Error(`${chapter.name}: needs ${needed} new questions, bank has ${rows.length}.`);
  }

  chapter.mcqs ||= [];
  for (const [question, correct, wrong1, wrong2, wrong3, explanation, difficulty] of rows) {
    const options = [correct, wrong1, wrong2, wrong3];
    const shift = serial % 4;
    const rotated = options.slice(shift).concat(options.slice(0, shift));
    chapter.mcqs.push({
      id: `NEET-BIO-${String(serial).padStart(3, '0')}`,
      question,
      options: rotated,
      answer: rotated.indexOf(correct),
      explanation,
      difficulty,
      chapter: chapter.name,
      subject: 'Biology'
    });
    serial += 1;
  }
}

const total = data.chapters.reduce((sum, chapter) => sum + chapter.mcqs.length, 0);
if (total !== 180) throw new Error(`Expected 180 Biology MCQs, found ${total}.`);
if (new Set(data.chapters.flatMap(ch => ch.mcqs.map(q => q.id))).size !== total) {
  throw new Error('Duplicate Biology MCQ IDs detected.');
}

data.description = '180 original, chapter-wise Class 11 and Class 12 Biology MCQs for NEET UG practice, with answers and explanations.';
fs.writeFileSync(file, `${JSON.stringify(data, null, 2)}\n`);
console.log(`Biology question bank expanded to ${total} MCQs across ${data.chapters.length} chapters.`);
