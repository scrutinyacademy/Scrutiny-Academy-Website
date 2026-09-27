import fs from 'node:fs';
import path from 'node:path';

const root = path.resolve(import.meta.dirname, '..');
const file = path.join(root, 'data/class11/botany.json');
const data = JSON.parse(fs.readFileSync(file, 'utf8'));

// Each chapter has 15 syllabus-spanning, examinable ideas. The builder turns
// them into a 15/10/5 board bank without duplicating question text.
const banks = [
  [
    ['Living organism','A living organism is a self-replicating, evolving and self-regulating system capable of responding to external stimuli.'],
    ['Growth','Growth is an irreversible increase in mass or cell number; in living organisms it normally occurs from within.'],
    ['Metabolism','Metabolism is the sum of all anabolic and catabolic reactions occurring in a living organism.'],
    ['Consciousness','Consciousness is the ability to sense the environment and respond to physical, chemical or biological stimuli.'],
    ['Biodiversity','Biodiversity is the variety and variability of organisms at genetic, species and ecosystem levels.'],
    ['Taxonomy','Taxonomy is the science of identification, nomenclature and classification of organisms.'],
    ['Systematics','Systematics studies organismal diversity together with evolutionary relationships among organisms.'],
    ['Species','A species is the basic taxonomic unit whose members naturally interbreed and produce fertile offspring.'],
    ['Binomial nomenclature','Each scientific name has a capitalised genus and a lower-case specific epithet, printed in italics or underlined separately.'],
    ['Taxonomic hierarchy','The main ascending categories are species, genus, family, order, class, phylum or division, and kingdom.'],
    ['Herbarium','A herbarium is a repository of dried, pressed, mounted and labelled plant specimens arranged systematically.'],
    ['Botanical garden','A botanical garden maintains correctly identified living plant collections for study, conservation and public education.'],
    ['Museum','A biological museum preserves plant and animal specimens in jars, boxes or as dry preparations for reference.'],
    ['Taxonomic key','A taxonomic key identifies an organism through a sequence of paired contrasting statements called couplets.'],
    ['Flora and manuals','A flora records plants of an area, while manuals help identify species and provide concise diagnostic information.']
  ],
  [
    ['Five-kingdom classification','R. H. Whittaker classified organisms into Monera, Protista, Fungi, Plantae and Animalia using cell type, organisation, nutrition, reproduction and phylogeny.'],
    ['Three-domain system','Carl Woese recognised Bacteria, Archaea and Eukarya mainly from ribosomal RNA and molecular differences.'],
    ['Archaebacteria','Archaea have ether-linked membrane lipids and distinctive cell walls, enabling many to live in extreme habitats.'],
    ['Eubacteria','Eubacteria are true prokaryotes with peptidoglycan walls; they may be autotrophic or heterotrophic.'],
    ['Cyanobacteria','Cyanobacteria are oxygenic photosynthetic prokaryotes; heterocysts in forms such as Nostoc fix atmospheric nitrogen.'],
    ['Mycoplasma','Mycoplasmas are the smallest self-replicating cells and lack a cell wall, so their shape is variable.'],
    ['Protista','Protista contains mostly unicellular eukaryotes, including chrysophytes, dinoflagellates, euglenoids, slime moulds and protozoans.'],
    ['Diatoms','Diatoms have siliceous, two-piece walls called frustules; accumulated walls form diatomaceous earth.'],
    ['Dinoflagellates','Dinoflagellates possess two unequal flagella; rapid multiplication of some marine species causes red tides.'],
    ['Euglenoids','Euglenoids lack a cell wall, possess a protein-rich pellicle and can shift between autotrophic and heterotrophic nutrition.'],
    ['Fungi','Fungi are absorptive heterotrophs with chitinous walls; their hyphae form a mycelium and reproduce by spores.'],
    ['Fungal classes','Phycomycetes, Ascomycetes, Basidiomycetes and Deuteromycetes are distinguished mainly by mycelium and sexual spores.'],
    ['Virus','A virus is an acellular nucleoprotein particle that multiplies only inside a living host cell.'],
    ['Viroid and prion','A viroid is naked infectious RNA, whereas a prion is an infectious misfolded protein.'],
    ['Lichen','A lichen is a mutualistic association in which an alga supplies food and a fungus provides shelter, water and minerals.']
  ],
  [
    ['Botany','Botany is the scientific study of plants, including their structure, function, diversity, heredity, ecology and uses.'],
    ['Theophrastus','Theophrastus is called the Father of Botany because his works Historia Plantarum and De Causis Plantarum systematically described plants.'],
    ['Indian botany','Ancient Indian works such as Vrikshayurveda recorded plant classification, cultivation, diseases and medicinal uses.'],
    ['Morphology','Plant morphology studies the external form and visible organs of plants.'],
    ['Anatomy','Plant anatomy studies internal organisation of cells, tissues and organs.'],
    ['Taxonomy','Plant taxonomy identifies, names and classifies plants using diagnostic characters.'],
    ['Cytology','Cytology studies plant cells, their organelles, chromosomes and division.'],
    ['Embryology','Plant embryology examines formation and development of gametes, embryo and seed.'],
    ['Physiology','Plant physiology explains functions such as absorption, transport, photosynthesis, respiration and growth.'],
    ['Genetics','Plant genetics studies inheritance, variation and the expression of genes in plants.'],
    ['Ecology','Plant ecology examines relationships of plants with one another and with their physical environment.'],
    ['Palaeobotany','Palaeobotany reconstructs the history and evolution of plants from fossils.'],
    ['Economic botany','Economic botany studies plants and plant products used as food, fibre, timber, medicines and industrial raw materials.'],
    ['Plant pathology','Plant pathology investigates plant diseases, their causes, spread, effects and control.'],
    ['Biotechnology and scope','Plant biotechnology uses cells, genes and tissue culture to improve crops, conserve germplasm and produce useful compounds.']
  ],
  [
    ['Algae','Algae are simple, chlorophyll-bearing thalloid autotrophs, chiefly aquatic, with no true roots, stems or leaves.'],
    ['Chlorophyceae','Green algae contain chlorophyll a and b, store starch in pyrenoids and usually have cellulose-rich walls.'],
    ['Phaeophyceae','Brown algae contain fucoxanthin, store laminarin and mannitol, and have algin in their walls.'],
    ['Rhodophyceae','Red algae contain phycoerythrin, store floridean starch and mostly inhabit marine environments.'],
    ['Bryophytes','Bryophytes are non-vascular land plants with a dominant gametophyte and water-dependent fertilisation.'],
    ['Liverworts','Liverworts generally have a dorsiventral thallus or leafy gametophyte and reproduce asexually by fragmentation or gemmae.'],
    ['Moss life cycle','In mosses the protonema produces leafy gametophores; the attached sporophyte consists of foot, seta and capsule.'],
    ['Pteridophytes','Pteridophytes are seedless vascular plants with dominant, independent sporophytes and small prothallial gametophytes.'],
    ['Heterospory','Heterospory is production of microspores and megaspores; it is an important step toward the seed habit.'],
    ['Gymnosperms','Gymnosperms bear naked ovules and seeds, commonly on cone scales, and lack true fruits.'],
    ['Coralloid roots','Cycas has coralloid roots containing nitrogen-fixing cyanobacteria such as Nostoc and Anabaena.'],
    ['Angiosperms','Angiosperms bear flowers, enclose ovules within an ovary and produce seeds inside fruits after double fertilisation.'],
    ['Monocot and dicot','Monocots usually have one cotyledon, parallel venation and fibrous roots; dicots usually show two cotyledons, reticulate venation and tap roots.'],
    ['Alternation of generations','Plants alternate between a haploid gametophyte producing gametes and a diploid sporophyte producing spores by meiosis.'],
    ['Evolutionary trend','From algae to angiosperms, vascular tissue, sporophyte dominance, heterospory, seeds, pollen and protected embryos progressively increase.']
  ],
  [
    ['Root systems','Tap roots arise from the radicle, whereas fibrous roots form a cluster of similarly sized adventitious roots.'],
    ['Root modifications','Roots may store food, provide support, respire or absorb moisture; examples include carrot, banyan, Rhizophora and orchids.'],
    ['Stem modifications','Stems may become underground storage organs, climbing tendrils, defensive thorns or photosynthetic phylloclades.'],
    ['Leaf parts','A typical leaf has leaf base, petiole and lamina; stipules may occur at the leaf base.'],
    ['Venation','Reticulate venation forms a network and is common in dicots; parallel venation is common in monocots.'],
    ['Phyllotaxy','Alternate, opposite and whorled phyllotaxy describe the number and arrangement of leaves at a node.'],
    ['Leaf modifications','Leaves may form tendrils, spines, storage scales, insect traps or phyllodes according to function.'],
    ['Inflorescence','In racemose inflorescence the axis continues to grow; in cymose inflorescence it ends in a flower.'],
    ['Flower whorls','A complete flower has calyx, corolla, androecium and gynoecium arranged on the thalamus.'],
    ['Aestivation','Aestivation is arrangement of sepals or petals in a bud: valvate, twisted, imbricate or vexillary.'],
    ['Androecium','The androecium consists of stamens; cohesion and adhesion produce conditions such as monadelphous and epipetalous.'],
    ['Gynoecium','The gynoecium consists of one or more carpels, each usually differentiated into stigma, style and ovary.'],
    ['Placentation','Marginal, axile, parietal, free-central, basal and superficial placentation describe ovule arrangement within an ovary.'],
    ['Fruit','A fruit is a mature ovary; true fruits develop only from the ovary, while false fruits include accessory floral parts.'],
    ['Seed','A seed contains an embryo, reserve food and protective coat; albuminous seeds retain endosperm at maturity.']
  ],
  [
    ['Reproduction','Reproduction is the biological process by which organisms produce new individuals and maintain continuity of a species.'],
    ['Vegetative reproduction','Vegetative reproduction forms new plants from roots, stems or leaves without gamete fusion.'],
    ['Fission','In binary fission one parent cell divides into two; in multiple fission it produces many daughter cells.'],
    ['Budding','A small outgrowth develops on the parent and separates after maturation, as in yeast.'],
    ['Fragmentation','The parent body breaks into fragments and each fragment grows into a new individual, as in Spirogyra.'],
    ['Sporulation','Specialised spores disperse and germinate under favourable conditions to form new organisms.'],
    ['Natural root propagation','Adventitious buds on storage roots can form new plants, as in sweet potato and Dahlia.'],
    ['Natural stem propagation','Rhizomes, tubers, bulbs, corms, runners, stolons, suckers and offsets naturally propagate plants.'],
    ['Natural leaf propagation','Epiphyllous buds along Bryophyllum leaf margins develop into plantlets.'],
    ['Cutting','A detached stem, root or leaf piece is planted and induced to form roots and shoots.'],
    ['Layering','A branch forms roots while still attached to the parent and is then separated for planting.'],
    ['Grafting','A scion is joined to a rooted stock so their cambia unite and grow as one plant.'],
    ['Micropropagation','Tissue culture rapidly multiplies disease-free, genetically similar plantlets from a small explant under sterile conditions.'],
    ['Sexual reproduction','Sexual reproduction involves meiosis, formation of male and female gametes, fertilisation and development of a genetically variable offspring.'],
    ['Life-cycle phases','Juvenile or vegetative, reproductive and senescent phases occur sequentially in the life cycle of a flowering plant.']
  ],
  [
    ['Stamen and anther','A typical stamen has a filament and bilobed, dithecous anther containing four microsporangia.'],
    ['Microsporangium wall','The anther wall comprises epidermis, endothecium, middle layers and nutritive tapetum around sporogenous tissue.'],
    ['Microsporogenesis','Microspore mother cells undergo meiosis to form haploid microspore tetrads that separate into pollen grains.'],
    ['Pollen grain','A pollen grain has resistant sporopollenin exine and pecto-cellulosic intine; germ pores lack sporopollenin.'],
    ['Ovule','A typical anatropous ovule has funicle, hilum, raphe, integuments, micropyle, chalaza and nucellus.'],
    ['Megasporogenesis','A megaspore mother cell undergoes meiosis to produce four megaspores, usually only one of which remains functional.'],
    ['Embryo sac','The common Polygonum-type embryo sac is seven-celled and eight-nucleate, with egg apparatus, three antipodals and a central cell.'],
    ['Pollination','Pollination transfers pollen from anther to stigma and may be autogamy, geitonogamy or xenogamy.'],
    ['Outbreeding devices','Dichogamy, herkogamy, self-incompatibility and unisexuality reduce self-pollination and promote genetic variation.'],
    ['Pollen-pistil interaction','The pistil recognises compatible pollen, permits germination and guides the pollen tube to the ovule.'],
    ['Double fertilisation','One male gamete forms the diploid zygote; the other fuses with two polar nuclei to form triploid primary endosperm nucleus.'],
    ['Endosperm','Endosperm develops before the embryo and nourishes it; development may be nuclear, cellular or helobial.'],
    ['Embryo','A dicot embryo has two cotyledons and an embryonal axis with plumule and radicle; a monocot embryo has one scutellum.'],
    ['Seed and fruit formation','After fertilisation the ovule becomes a seed, integuments become seed coats and the ovary generally becomes a fruit.'],
    ['Apomixis and polyembryony','Apomixis forms seed without fertilisation; polyembryony is occurrence of more than one embryo in a seed.']
  ],
  [
    ['Artificial classification','Artificial systems use a few convenient characters and may group unrelated plants together.'],
    ['Natural classification','Natural systems use many characters and reflect overall similarities and natural affinities.'],
    ['Phylogenetic classification','Phylogenetic systems arrange taxa according to common ancestry and evolutionary relationships.'],
    ['Numerical taxonomy','Numerical taxonomy codes many characters and uses computers to measure overall similarity objectively.'],
    ['Cytotaxonomy','Cytotaxonomy uses chromosome number, structure and behaviour as taxonomic evidence.'],
    ['Chemotaxonomy','Chemotaxonomy uses characteristic proteins, pigments and secondary metabolites to establish relationships.'],
    ['Taxonomic description','A plant is described systematically by habit, vegetative characters, inflorescence, floral whorls, fruit and seed.'],
    ['Floral formula','A floral formula expresses symmetry, sexuality, number, fusion, adhesion and ovary position with standard symbols.'],
    ['Floral diagram','A floral diagram is a top-view plan showing relative number, position and union of floral parts.'],
    ['Fabaceae habit','Fabaceae includes herbs, shrubs or trees with alternate, usually compound stipulate leaves and root nodules.'],
    ['Fabaceae flower','The flower is bisexual, zygomorphic and papilionaceous, commonly with diadelphous stamens, superior monocarpellary ovary and legume fruit.'],
    ['Solanaceae habit','Solanaceae plants are mostly herbs or shrubs with alternate simple leaves and often cymose inflorescences.'],
    ['Solanaceae flower','The flower is bisexual, actinomorphic and pentamerous, with epipetalous stamens, bicarpellary superior ovary and axile placentation.'],
    ['Liliaceae habit','Liliaceae plants are perennial monocot herbs with bulbs or rhizomes, fibrous roots and parallel-veined leaves.'],
    ['Liliaceae flower','The flower is actinomorphic and trimerous, with six tepals, six epiphyllous stamens and a tricarpellary superior ovary.']
  ],
  [
    ['Cell theory','Schleiden and Schwann proposed that organisms consist of cells; Virchow added that every cell arises from a pre-existing cell.'],
    ['Prokaryotic cell','A prokaryotic cell lacks a membrane-bound nucleus and organelles; its circular DNA lies in a nucleoid.'],
    ['Plant cell wall','The cellulose-rich cell wall gives shape, prevents osmotic bursting and communicates through plasmodesmata.'],
    ['Plasma membrane','The plasma membrane is a selectively permeable fluid mosaic of lipids and proteins controlling cellular exchange.'],
    ['Endomembrane system','Endoplasmic reticulum, Golgi apparatus, lysosomes and vacuoles coordinate synthesis, modification, packaging and transport.'],
    ['Endoplasmic reticulum','Rough ER bears ribosomes and synthesises proteins; smooth ER synthesises lipids and aids detoxification.'],
    ['Golgi apparatus','Golgi cisternae receive materials at the cis face, modify and sort them, then dispatch vesicles from the trans face.'],
    ['Lysosome and vacuole','Lysosomes carry hydrolytic enzymes, while the plant vacuole stores solutes and maintains turgor through its tonoplast.'],
    ['Mitochondrion','A mitochondrion has cristae and matrix and produces ATP through aerobic respiration; it contains its own DNA and ribosomes.'],
    ['Chloroplast','A chloroplast has grana for light reactions and stroma for carbon fixation, besides circular DNA and 70S ribosomes.'],
    ['Ribosome','Ribosomes are non-membranous ribonucleoprotein particles that translate mRNA into polypeptides.'],
    ['Cytoskeleton','Microtubules, microfilaments and intermediate filaments provide shape, movement and intracellular transport.'],
    ['Cilia and flagella','Eukaryotic cilia and flagella usually have a 9+2 axoneme anchored in a basal body.'],
    ['Nucleus','The nucleus has a double envelope, pores, nucleoplasm, chromatin and nucleolus and controls gene expression.'],
    ['Chromatin and nucleosome','DNA wraps around histone octamers to form nucleosomes, which coil further to produce chromatin and chromosomes.']
  ],
  [
    ['Biomolecule','Biomolecules are carbon-based compounds of living cells, including carbohydrates, lipids, proteins and nucleic acids.'],
    ['Primary metabolites','Primary metabolites such as sugars, amino acids and nucleotides directly support growth and normal metabolism.'],
    ['Secondary metabolites','Alkaloids, terpenoids, pigments and essential oils have ecological roles and many medicinal or commercial uses.'],
    ['Monosaccharide','A monosaccharide is the simplest carbohydrate unit; glucose is a six-carbon reducing sugar and major respiratory substrate.'],
    ['Disaccharide','A disaccharide contains two monosaccharides joined by a glycosidic bond, as in sucrose, maltose and lactose.'],
    ['Polysaccharide','Polysaccharides are long sugar polymers; starch stores plant food, cellulose forms plant walls and glycogen stores animal food.'],
    ['Amino acid','An amino acid has amino and carboxyl groups attached to an alpha carbon; its variable R group determines properties.'],
    ['Protein structure','Proteins possess primary sequence and may fold into secondary, tertiary and quaternary levels of organisation.'],
    ['Enzyme','An enzyme is a biological catalyst that lowers activation energy through a specific active site without being consumed.'],
    ['Enzyme factors','Temperature, pH, substrate concentration and inhibitors affect enzyme activity by changing collisions or protein conformation.'],
    ['Lipid','Lipids are water-insoluble molecules; fats contain glycerol esterified with fatty acids and serve in energy storage and membranes.'],
    ['Saturated and unsaturated fats','Saturated fatty acids lack carbon-carbon double bonds, while unsaturated fatty acids contain one or more.'],
    ['Nucleotide','A nucleotide consists of a nitrogenous base, pentose sugar and phosphate group.'],
    ['DNA and RNA','DNA usually stores hereditary information as a double helix; RNA is generally single-stranded and functions in gene expression.'],
    ['Metabolism','Anabolism builds complex molecules using energy, whereas catabolism releases energy by breaking molecules down.']
  ],
  [
    ['Cell cycle','The cell cycle consists of interphase and M phase, producing orderly growth, DNA duplication and cell division.'],
    ['G1 phase','During G1 the cell grows, synthesises RNA and proteins, and decides whether to continue the cycle.'],
    ['S phase','DNA replication occurs in S phase, doubling DNA content while chromosome number remains unchanged.'],
    ['G2 phase','During G2 the cell grows further and synthesises proteins needed for mitosis.'],
    ['Mitosis','Mitosis is equational division producing two genetically similar daughter cells with the parental chromosome number.'],
    ['Prophase','Chromatin condenses, nucleolus disappears, spindle forms and the nuclear envelope disintegrates during late prophase.'],
    ['Metaphase','Maximally condensed chromosomes align at the equatorial plate with spindle fibres attached to kinetochores.'],
    ['Anaphase','Centromeres divide and sister chromatids move to opposite poles, each becoming a daughter chromosome.'],
    ['Telophase and cytokinesis','Chromosomes decondense and nuclei reform; plant cytokinesis proceeds by a centripetal cell plate.'],
    ['Meiosis','Meiosis is reduction division in which one diploid cell produces four haploid cells through two successive divisions.'],
    ['Prophase I','Leptotene, zygotene, pachytene, diplotene and diakinesis bring pairing, crossing over and separation of homologues.'],
    ['Synapsis and bivalent','Homologous chromosomes pair by a synaptonemal complex during zygotene, forming bivalents or tetrads.'],
    ['Crossing over','Non-sister chromatids exchange segments at pachytene; chiasmata become visible in diplotene.'],
    ['Meiosis I and II','Meiosis I separates homologues and reduces ploidy; meiosis II separates sister chromatids without another DNA replication.'],
    ['Significance of division','Mitosis enables growth and repair; meiosis maintains chromosome number across generations and creates variation.']
  ],
  [
    ['Meristematic tissue','Meristematic cells actively divide, have dense cytoplasm, prominent nuclei, thin walls and little or no vacuolation.'],
    ['Apical, intercalary and lateral meristems','Apical and intercalary meristems lengthen organs; lateral meristems increase girth by secondary growth.'],
    ['Simple permanent tissues','Parenchyma performs storage or photosynthesis, collenchyma gives flexible support, and lignified sclerenchyma gives strength.'],
    ['Xylem','Xylem conducts water and minerals through tracheids and vessels; fibres support and parenchyma stores food.'],
    ['Phloem','Phloem transports organic food through sieve elements assisted by companion cells; fibres support and parenchyma stores.'],
    ['Tissue systems','Epidermal, ground and vascular tissue systems respectively protect, perform basic functions and conduct materials.'],
    ['Dicot root','A dicot root has radial vascular bundles, exarch xylem, small pith and later develops secondary growth.'],
    ['Monocot root','A monocot root has many radial xylem bundles, large pith and normally lacks secondary growth.'],
    ['Dicot stem','A dicot stem has vascular bundles in a ring; bundles are conjoint, collateral and open due to cambium.'],
    ['Monocot stem','A monocot stem has numerous scattered, closed vascular bundles surrounded by sclerenchymatous bundle sheaths.'],
    ['Dorsiventral leaf','A dicot leaf has palisade tissue above, spongy tissue below and more stomata on the lower epidermis.'],
    ['Isobilateral leaf','A monocot leaf has similar surfaces, stomata on both, undifferentiated mesophyll and bulliform cells.'],
    ['Vascular cambium','Cambial ring produces secondary xylem inward and secondary phloem outward, increasing stem girth.'],
    ['Cork cambium','Phellogen forms cork outward and secondary cortex inward; lenticels permit gaseous exchange through periderm.'],
    ['Wood and annual rings','Seasonal differences create spring wood and autumn wood; one pair forms an annual ring useful in estimating age.']
  ],
  [
    ['Plant community','A plant community is an assemblage of interacting plant populations living in a shared habitat.'],
    ['Community characters','Species composition, stratification, dominance, frequency, density and abundance describe community structure.'],
    ['Ecological succession','Succession is the orderly replacement of communities over time, culminating in a relatively stable climax community.'],
    ['Primary and secondary succession','Primary succession begins on bare substrate without soil; secondary succession begins where a previous community and soil remain.'],
    ['Hydrophyte','A hydrophyte is adapted to live wholly or partly in water, as in Hydrilla, Nymphaea or Eichhornia.'],
    ['Hydrophyte roots and tissues','Hydrophytes have reduced roots and vascular or mechanical tissues because water and support are readily available.'],
    ['Hydrophyte aerenchyma','Large interconnected air spaces provide buoyancy, internal aeration and gas storage in aquatic plants.'],
    ['Floating-leaf adaptation','Floating leaves are broad and waxy with stomata mainly on the upper surface, which remains exposed to air.'],
    ['Mesophyte','A mesophyte grows where water is neither severely deficient nor excessive and shows ordinary roots, tissues and stomata.'],
    ['Xerophyte','A xerophyte survives dry habitats through features that acquire, store or conserve water.'],
    ['Xerophyte roots','Extensive deep or spreading root systems rapidly absorb water from a large soil volume.'],
    ['Xerophyte leaves','Leaves may be small, rolled, leathery or converted to spines, reducing exposed surface and transpiration.'],
    ['Xerophyte epidermis and stomata','A thick cuticle, multiple epidermis, hairs and sunken stomata reduce water loss.'],
    ['Succulent xerophytes','Succulents store water in fleshy stems or leaves and often use stems for photosynthesis.'],
    ['Convergent adaptation','Unrelated plants exposed to similar habitats may independently evolve similar adaptive features.']
  ],
  [
    ['Economic botany','Economic botany studies plants directly or indirectly useful to people and the products obtained from them.'],
    ['Rice','Oryza sativa is a cereal of Poaceae; its starchy endosperm is staple food and bran yields oil.'],
    ['Ragi','Eleusine coracana is a drought-tolerant millet rich in calcium and dietary fibre.'],
    ['Red gram','Cajanus cajan is a protein-rich pulse whose Rhizobium-bearing roots improve soil nitrogen.'],
    ['Sunflower','Helianthus annuus of Asteraceae yields edible oil from its cypsela-like fruits and oil-rich seeds.'],
    ['Cotton','Gossypium species of Malvaceae produce unicellular seed-coat fibres used by the textile industry.'],
    ['Neem','Azadirachta indica provides medicinal limonoids such as azadirachtin and is used as a biopesticide.'],
    ['Black pepper','Piper nigrum is a climbing vine whose dried drupes are used as spice; piperine produces pungency.'],
    ['Coffee','Coffea seeds are processed to make a stimulant beverage; caffeine is its principal alkaloid.'],
    ['Teak','Tectona grandis yields strong, durable, termite-resistant timber used in furniture and construction.'],
    ['Jatropha','Jatropha curcas seeds yield non-edible oil that can be converted into biodiesel.'],
    ['Cereal, millet and pulse','Cereals and millets chiefly provide carbohydrate-rich grains, while pulses supply protein-rich legume seeds.'],
    ['Fibre crop','A fibre crop supplies long, strong cells used for textiles, ropes or other materials; cotton is a surface fibre.'],
    ['Phytomedicine','A phytomedicine is a medicinal preparation or active compound obtained from plants.'],
    ['Sustainable use','Sustainable cultivation, processing and conservation protect useful plant diversity while supporting livelihoods.']
  ]
];

const diagrams = {
  4:'assets/botany/plant-kingdom.svg', 5:'assets/botany/flower-morphology.svg',
  7:'assets/botany/double-fertilisation.svg', 8:'assets/botany/floral-families.svg',
  9:'assets/botany/plant-cell.svg', 11:'assets/botany/cell-division.svg',
  12:'assets/botany/dicot-anatomy.svg', 13:'assets/botany/ecological-adaptations.svg'
};
const clean = s => s.replace(/[.]+$/,'');
const importance = i => i < 5 ? 'Must revise' : i < 10 ? 'High yield' : 'Core syllabus';

for (let c = 0; c < data.chapters.length; c++) {
  const chapter = data.chapters[c], facts = banks[c];
  if (!facts || facts.length !== 15) throw new Error(`Chapter ${c+1} needs 15 concepts`);
  chapter.topics = facts.map(x => x[0]);
  chapter.examAnalysis = {
    pattern:'VSAQ 2 marks • SAQ 4 marks • LAQ 8 marks',
    approach:'Write to the command word, underline keywords, and add a neat labelled diagram wherever requested.',
    sourceNote:'Prior Telangana Intermediate paper pattern and complete chapter syllabus coverage; not a prediction of the next paper.'
  };
  chapter.vsaq = facts.map(([term,answer],i) => ({
    id:`c11-bot-${c+1}-v-${i+1}`, marks:2, priority:importance(i),
    question:i%3===0 ? `Define ${term}.` : i%3===1 ? `What is meant by ${term}?` : `Write a short note on ${term}.`,
    answer, keyPoints:term
  }));
  chapter.saq = Array.from({length:10},(_,i) => {
    const a=facts[i], b=facts[(i+5)%15];
    return {id:`c11-bot-${c+1}-s-${i+1}`,marks:4,priority:importance(i),
      question:i%2 ? `Explain ${a[0]} and ${b[0]} with their biological significance.` : `Differentiate or relate ${a[0]} and ${b[0]}.`,
      answer:`• ${a[0]}: ${clean(a[1])}.\n• ${b[0]}: ${clean(b[1])}.\n• Relationship: Both are central to ${chapter.name.toLowerCase()}, but they describe different levels, structures or processes.\n• Exam point: State the defining feature first, then add the example, function or consequence.`,
      keyPoints:`${a[0]} • ${b[0]} • definition • significance`
    };
  });
  chapter.laq = Array.from({length:5},(_,i) => {
    const group=Array.from({length:5},(_,j)=>facts[(i*3+j)%15]);
    const diagram=diagrams[c+1] && i<2 ? diagrams[c+1] : undefined;
    return {id:`c11-bot-${c+1}-l-${i+1}`,marks:8,priority:i<2?'Must revise':'High yield',
      question:`Give a detailed account of ${group.slice(0,3).map(x=>x[0]).join(', ')} in the context of ${chapter.name}.`,
      answer:`Introduction: ${chapter.name} is best understood by connecting structure, process and significance.\n\n${group.map(([t,a],n)=>`${n+1}. ${t}: ${a}`).join('\n')}\n\nConclusion: These points together explain the chapter concept from its definition through its biological role. In an 8-mark answer, use these subheadings, underline technical terms and add the labelled diagram when relevant.`,
      keyPoints:group.map(x=>x[0]).join(' • '),
      ...(diagram?{diagram,diagramAlt:`Labelled study diagram for ${chapter.name}`}:{})
    };
  });
}

data.boardAnalysis = {
  exam:'Telangana Intermediate First Year Botany', duration:'3 hours', maximumMarks:60,
  sections:[
    {name:'Section A',format:'VSAQ',marks:'10 × 2 = 20',rule:'Answer all 10; about five lines each.'},
    {name:'Section B',format:'SAQ',marks:'6 × 4 = 24',rule:'Answer any 6 of 8; about twenty lines each.'},
    {name:'Section C',format:'LAQ',marks:'2 × 8 = 16',rule:'Answer any 2 of 3; about sixty lines each.'}
  ],
  note:'Built from the recurring structure of available Telangana Intermediate papers and the complete published syllabus. Importance labels guide revision; they are not guaranteed questions.'
};
data.description='Complete Telangana Intermediate First Year Botany board bank: 14 chapters, 210 VSAQs, 140 SAQs and 70 LAQs with answer guidance.';
fs.writeFileSync(file, JSON.stringify(data,null,2)+'\n');
console.log(`Built ${data.chapters.length} chapters and ${data.chapters.reduce((n,c)=>n+c.vsaq.length+c.saq.length+c.laq.length,0)} questions.`);
