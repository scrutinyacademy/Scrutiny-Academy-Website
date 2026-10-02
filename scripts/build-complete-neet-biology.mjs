import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';

const root = path.resolve(import.meta.dirname, '..');
const target = path.join(root, 'data/neet/biology.json');
const data = JSON.parse(fs.readFileSync(target, 'utf8'));

// Original NEET-style practice questions generated from a reviewed concept map.
// Each row is "term|NCERT association|short explanation". The builder turns the
// concept map into direct, reverse-association, statement and matching questions.
const banks = {
  'neet-biology-11-11': `Chlorophyll a|chief pigment in the reaction centre|Chlorophyll a directly participates in the light reaction.
Chlorophyll b|accessory photosynthetic pigment|It broadens the range of light absorbed and transfers energy to chlorophyll a.
Photosystem II|reaction centre P680|PSII absorbs best near 680 nm and begins non-cyclic electron flow.
Photosystem I|reaction centre P700|PSI absorbs best near 700 nm and reduces NADP positive.
Photolysis of water|occurs on the inner side of the thylakoid membrane|Water splitting supplies electrons, protons and oxygen.
Non-cyclic photophosphorylation|produces ATP, NADPH and oxygen|Both photosystems operate and electrons do not return to the source.
Cyclic photophosphorylation|produces ATP but not NADPH or oxygen|Only PSI participates and electrons cycle back.
Chemiosmosis|ATP synthesis driven by a proton gradient|Protons move through ATP synthase from lumen to stroma.
Calvin-cycle carboxylation|carbon dioxide combines with RuBP|RuBisCO catalyses the first step of the C3 cycle.
First stable C3 product|3-phosphoglycerate|Two molecules of 3-PGA arise after fixation of one carbon dioxide.
Calvin-cycle reduction|3-PGA is converted to triose phosphate|ATP and NADPH from the light reaction are consumed.
RuBP regeneration|requires ATP|Regeneration allows the Calvin cycle to continue accepting carbon dioxide.
First stable C4 product|oxaloacetic acid|PEP carboxylase fixes bicarbonate in mesophyll cells to form OAA.
Kranz anatomy|prominent bundle-sheath cells around vascular bundles|This spatial arrangement separates initial fixation from the Calvin cycle.
PEP carboxylase|primary carbon dioxide-fixing enzyme in C4 mesophyll|It has a high affinity for bicarbonate and lacks oxygenase activity.
Photorespiration|starts when RuBisCO oxygenates RuBP|The pathway consumes energy and releases carbon dioxide without producing ATP.
C4 advantage|suppression of photorespiration|Carbon dioxide is concentrated in bundle-sheath cells.
Blackman's law|rate is limited by the factor nearest its minimum|Increasing a non-limiting factor does not raise photosynthetic rate.
Light compensation point|photosynthesis equals respiration|Net gas exchange is zero at this light intensity.
Red and blue light|most effective regions for photosynthesis|The action spectrum broadly follows absorption by photosynthetic pigments.`,

  'neet-biology-11-12': `Glycolysis|conversion of glucose to pyruvate in the cytoplasm|The EMP pathway does not require mitochondrial enzymes.
Glycolytic investment phase|uses two ATP per glucose|ATP phosphorylates intermediates before energy payoff.
Glycolytic net gain|two ATP and two NADH per glucose|Four ATP are formed but two were invested.
Pyruvate in aerobic cells|enters mitochondria for oxidation|It is converted to acetyl coenzyme A before the TCA cycle.
Oxidative decarboxylation|pyruvate forms acetyl coenzyme A|Carbon dioxide and NADH are produced by the pyruvate dehydrogenase complex.
Krebs cycle location|mitochondrial matrix|Most TCA-cycle enzymes occur in the matrix.
Acetyl coenzyme A|two-carbon entry molecule of the Krebs cycle|It condenses with oxaloacetate to form citrate.
Substrate-level phosphorylation|direct enzymatic formation of ATP or GTP|It occurs in glycolysis and at one step of the Krebs cycle.
Electron transport system|located on the inner mitochondrial membrane|Carriers pass electrons and pump protons into the intermembrane space.
Terminal electron acceptor|molecular oxygen|Oxygen combines with electrons and protons to form water.
Oxidative phosphorylation|ATP formation coupled to electron transport|The proton-motive force drives ATP synthase.
Alcoholic fermentation|forms ethanol and carbon dioxide|Yeast regenerates NAD positive under anaerobic conditions.
Lactic acid fermentation|forms lactate without carbon dioxide release|It may occur in muscle when oxygen supply is inadequate.
Respiratory quotient|carbon dioxide released divided by oxygen consumed|RQ helps indicate the respiratory substrate.
Carbohydrate RQ|approximately one|Equal volumes of carbon dioxide and oxygen are involved in complete glucose oxidation.
Fat RQ|less than one|Fats require proportionally more oxygen for oxidation.
Organic-acid RQ|often greater than one|Oxygen-rich substrates need relatively less external oxygen.
Amphibolic pathway|serves both catabolism and anabolism|Respiratory intermediates are used to build cellular compounds.
Respiratory balance sheet|theoretical ATP yield exceeds actual cellular yield|Transport costs, leaks and alternative pathways reduce the realised total.
Succinate dehydrogenase|Krebs-cycle enzyme embedded in the inner membrane|It also functions as complex II of the electron transport chain.`,

  'neet-biology-11-13': `Growth|irreversible permanent increase in size|Plant growth commonly involves cell division and enlargement.
Open growth|continued production of new cells by meristems|Plants retain meristematic regions throughout life.
Arithmetic growth|one daughter cell continues to divide|Length increases at a constant linear rate.
Geometric growth|both daughter cells continue to divide|Growth is exponential when resources are unlimited.
Sigmoid growth curve|lag, log and stationary phases|Resource limitation produces the typical S-shaped curve.
Absolute growth rate|total growth per unit time|It compares actual increases in size.
Relative growth rate|growth per unit initial size per time|It compares efficiency relative to starting size.
Differentiation|cells mature for specialised functions|Cells acquire structural and functional specialisation.
Dedifferentiation|mature cells regain capacity to divide|Interfascicular cambium can arise by dedifferentiation.
Redifferentiation|dedifferentiated cells specialise again|Secondary tissues produced by cambium later mature.
Development|sum of growth and differentiation|Intrinsic and environmental factors both shape plant development.
Plasticity|different structures develop in response to phase or environment|Heterophylly is a common example.
Auxin|promotes cell elongation and apical dominance|Auxin also supports rooting and tropic responses.
Gibberellin|promotes stem elongation and bolting|It can break dormancy and aid malting.
Cytokinin|promotes cell division and delays senescence|It helps mobilise nutrients and stimulates lateral buds.
Ethylene|gaseous regulator promoting fruit ripening|It also promotes senescence and the triple response.
Abscisic acid|stress hormone promoting stomatal closure|ABA generally inhibits growth and supports dormancy.
Photoperiodism|flowering response to relative day and night length|Leaves perceive the photoperiodic signal.
Vernalisation|flowering promoted by low-temperature exposure|It shortens the vegetative phase in some plants.
Apical dominance|suppression of lateral buds by the shoot apex|Removing the apex or applying cytokinin can release lateral buds.`,

  'neet-biology-11-14': `Inspiration|active enlargement of the thoracic chamber|Contraction of diaphragm and external intercostals lowers intrapulmonary pressure.
Expiration at rest|mainly passive elastic recoil|Relaxation reduces thoracic volume and raises intrapulmonary pressure.
Tidal volume|air inspired or expired in a normal breath|A healthy adult exchanges about 500 mL per quiet breath.
Inspiratory reserve volume|additional air inspired after a normal inspiration|It is larger than tidal volume.
Expiratory reserve volume|additional air expired after a normal expiration|It is measured by spirometry.
Residual volume|air remaining after forceful expiration|It prevents complete lung collapse and cannot be expelled voluntarily.
Vital capacity|IRV plus tidal volume plus ERV|It is the maximum air expelled after a maximum inspiration.
Total lung capacity|vital capacity plus residual volume|It is the volume in lungs after maximal inspiration.
Alveolar diffusion|follows partial-pressure gradients|Thin respiratory membrane and large surface area aid exchange.
Oxygen transport|mostly as oxyhaemoglobin|Only a small fraction travels dissolved in plasma.
Oxygen dissociation curve|sigmoid relationship between oxygen pressure and saturation|Cooperative binding gives haemoglobin its S-shaped curve.
Bohr effect|higher carbon dioxide and hydrogen ions favour oxygen unloading|Active tissues shift the curve to the right.
Carbon dioxide transport|mainly as bicarbonate ions|Carbonic anhydrase in erythrocytes accelerates bicarbonate formation.
Carbaminohaemoglobin|carbon dioxide bound to globin chains|It accounts for part of carbon dioxide carriage.
Chloride shift|chloride enters RBCs as bicarbonate leaves|It maintains electrical neutrality during carbon dioxide transport.
Medullary respiratory rhythm centre|generates the basic breathing rhythm|Neural groups in the medulla set the respiratory pattern.
Chemosensitive area|responds strongly to carbon dioxide and hydrogen ions|It modifies respiratory rhythm when these rise.
Asthma|allergic inflammation and narrowing of bronchi|Wheezing and difficult breathing result from airway constriction.
Emphysema|damage to alveolar walls|Loss of respiratory surface commonly follows chronic smoking.
Occupational respiratory disorder|long exposure to dust causes inflammation and fibrosis|Silica or asbestos exposure can reduce lung capacity.`,

  'neet-biology-11-15': `Plasma|straw-coloured fluid matrix of blood|It carries proteins, nutrients, hormones and wastes.
Erythrocytes|biconcave cells transporting respiratory gases|Mammalian RBCs lack nuclei at maturity and contain haemoglobin.
Neutrophils|most abundant phagocytic leucocytes|They engulf invading microbes.
Lymphocytes|cells central to immune responses|B and T lymphocytes mediate adaptive immunity.
Platelets|cell fragments important in clotting|They release factors that initiate coagulation.
ABO blood groups|determined by A and B antigens on RBCs|Naturally occurring plasma antibodies react with absent antigens.
Rh incompatibility|can cause erythroblastosis fetalis|Anti-Rh antibodies from an Rh-negative mother may affect a later Rh-positive foetus.
Lymph|tissue fluid returned through lymphatic vessels|It transports absorbed fats and recirculates immune cells.
Sinoatrial node|normal pacemaker of the heart|It initiates each heartbeat in the right atrium.
Atrioventricular node|delays and relays atrial excitation|The delay permits ventricular filling before contraction.
Cardiac cycle|sequence of systole and diastole|At about 75 beats per minute one cycle lasts roughly 0.8 second.
Ventricular systole|AV valves close and semilunar valves open|Rising ventricular pressure ejects blood into arteries.
Heart sounds|lub and dub arise mainly from valve closure|The first follows AV-valve closure and the second semilunar-valve closure.
Cardiac output|heart rate multiplied by stroke volume|It is about five litres per minute in a resting adult.
Electrocardiogram P wave|atrial depolarisation|It precedes atrial contraction.
Electrocardiogram QRS complex|ventricular depolarisation|Atrial repolarisation is masked within it.
Electrocardiogram T wave|ventricular repolarisation|It marks electrical recovery of ventricles.
Double circulation|blood passes through the heart twice per circuit|Pulmonary and systemic circuits keep oxygenated and deoxygenated blood separate.
Hepatic portal system|carries gut blood to the liver|Absorbed nutrients first pass through hepatic capillaries.
Hypertension|persistent arterial pressure above the normal range|It increases risk of vascular and cardiac damage.`,

  'neet-biology-11-16': `Ammonotelism|excretion mainly as ammonia|Aquatic animals can dilute highly toxic ammonia with abundant water.
Ureotelism|excretion mainly as urea|Mammals and adult amphibians convert ammonia to less toxic urea.
Uricotelism|excretion mainly as uric acid|Birds, reptiles and insects conserve water by excreting a paste.
Kidney cortex|outer region containing renal corpuscles|Convoluted tubules also occur mainly in the cortex.
Kidney medulla|inner region organised into renal pyramids|Loops of Henle and collecting ducts extend through it.
Nephron|structural and functional unit of the kidney|Each includes a renal corpuscle and tubule.
Glomerular filtration|pressure-driven ultrafiltration into Bowman's capsule|Cells and most plasma proteins remain in blood.
Glomerular filtration rate|filtrate formed by both kidneys per minute|A healthy adult forms about 125 mL per minute.
Proximal convoluted tubule|major site of selective reabsorption|All glucose and amino acids and most salts and water are reclaimed normally.
Loop of Henle|establishes a medullary osmotic gradient|Its limbs have different water and salt permeabilities.
Counter-current mechanism|interaction of Henle's loop and vasa recta|It helps concentrate urine while preserving the medullary gradient.
Distal convoluted tubule|conditional reabsorption and secretion|Hormones adjust sodium, water and ion handling here.
Collecting duct|final adjustment of water reabsorption|It passes through hyperosmotic medulla and responds to ADH.
Antidiuretic hormone|increases water permeability of distal nephron|ADH reduces urine volume when body water is low.
Renin-angiotensin mechanism|raises pressure and promotes sodium retention|Reduced renal perfusion stimulates renin release.
Aldosterone|increases sodium reabsorption and potassium secretion|It acts mainly on distal tubules and collecting ducts.
Atrial natriuretic factor|promotes sodium loss and lowers blood pressure|It opposes renin-angiotensin-aldosterone effects.
Micturition reflex|neural control of bladder emptying|Stretch receptors initiate a spinal reflex modified by higher centres.
Haemodialysis|removes wastes across a semipermeable membrane|It substitutes for renal filtration in severe kidney failure.
Uremia|accumulation of urea and other wastes in blood|It indicates serious loss of renal excretory function.`,

  'neet-biology-11-17': `Amoeboid movement|movement using pseudopodia|Macrophages and leucocytes can move this way.
Ciliary movement|coordinated beating of cilia|It moves ova in oviducts and mucus in airways.
Muscular movement|contraction of muscle fibres|Interaction of actin and myosin generates force.
Sarcomere|segment between two successive Z lines|It is the functional contractile unit of striated muscle.
Thin filament|mainly actin with troponin and tropomyosin|Its regulatory proteins control access to myosin-binding sites.
Thick filament|formed chiefly by myosin|Projecting heads bind actin and hydrolyse ATP.
Sliding-filament theory|thin filaments slide over thick filaments|Filament lengths remain constant as the sarcomere shortens.
Calcium in contraction|binds to troponin|This moves tropomyosin away from actin's active sites.
ATP in contraction|powers cross-bridge cycling and detachment|Fresh ATP allows myosin to release actin.
A band|length remains constant during contraction|It corresponds to the full length of thick filaments.
I band|shortens during contraction|It contains regions with thin filaments only.
H zone|narrows or disappears during contraction|Thin filaments slide into the central thick-filament region.
Axial skeleton|skull, vertebral column, ribs and sternum|It forms the central supporting axis.
Appendicular skeleton|limb bones and girdles|Pectoral and pelvic girdles attach limbs to the axial skeleton.
Ball-and-socket joint|permits movement in many planes|Shoulder and hip are examples.
Hinge joint|mainly permits movement in one plane|Elbow and knee are examples.
Pivot joint|allows rotation around an axis|The atlas-axis articulation enables head rotation.
Myasthenia gravis|autoimmune weakness at neuromuscular junctions|Antibodies impair transmission to skeletal muscle.
Muscular dystrophy|progressive inherited degeneration of muscle|Muscle fibres weaken over time.
Gout|urate crystals accumulate in joints|Elevated uric acid can cause painful inflammation.`,

  'neet-biology-11-18': `Central nervous system|brain and spinal cord|It integrates sensory input and coordinates responses.
Peripheral nervous system|nerves connecting CNS with the body|Cranial and spinal nerves carry afferent and efferent signals.
Somatic neural system|controls voluntary skeletal muscles|It also carries conscious sensory information.
Autonomic neural system|regulates involuntary visceral functions|Sympathetic and parasympathetic divisions often have opposing effects.
Neuron|structural and functional unit of neural tissue|Dendrites receive signals and the axon conducts impulses away.
Myelin sheath|electrically insulates many axons|It permits rapid saltatory conduction.
Node of Ranvier|gap between adjacent myelin segments|Action potentials are regenerated at these nodes.
Resting membrane potential|inside of neuron is negative relative to outside|Selective permeability and ion pumps maintain ionic gradients.
Depolarisation|rapid sodium entry makes membrane potential less negative|Voltage-gated sodium channels open after threshold is reached.
Repolarisation|potassium exit restores negativity|Voltage-gated potassium channels dominate this phase.
Action potential|all-or-none electrical event|Its size does not increase with a stronger suprathreshold stimulus.
Saltatory conduction|impulse appears to jump node to node|It is faster and more energy-efficient in myelinated fibres.
Electrical synapse|ions pass directly through gap junctions|Transmission is very rapid and usually bidirectional.
Chemical synapse|neurotransmitter crosses a synaptic cleft|Transmission has a short delay and is usually unidirectional.
Neurotransmitter release|triggered by calcium entry into the presynaptic terminal|Synaptic vesicles fuse with the membrane by exocytosis.
Reflex action|rapid involuntary response to a stimulus|A reflex arc can operate through the spinal cord.
Sensory neuron|carries impulses toward the CNS|It forms the afferent limb of a reflex arc.
Motor neuron|carries impulses from CNS to an effector|It forms the efferent limb of a reflex arc.
Interneuron|links neurons within the CNS|It integrates information between sensory and motor pathways.
Threshold stimulus|minimum stimulus that triggers an action potential|Subthreshold depolarisation does not generate a propagated impulse.`,

  'neet-biology-11-19': `Hypothalamus|links neural control with endocrine regulation|It produces releasing and inhibiting hormones for the pituitary.
Growth hormone|promotes body growth and protein synthesis|Excess or deficiency produces characteristic growth disorders.
Prolactin|supports mammary-gland development and milk production|It is secreted by the anterior pituitary.
Thyroid-stimulating hormone|stimulates thyroid hormone secretion|It is released from the anterior pituitary.
Adrenocorticotropic hormone|stimulates adrenal cortex|It particularly promotes glucocorticoid secretion.
Follicle-stimulating hormone|acts on ovarian follicles and Sertoli cells|It supports gametogenesis.
Luteinising hormone|triggers ovulation and stimulates Leydig cells|Its actions differ in females and males.
Oxytocin|causes uterine contraction and milk ejection|It is released through the posterior pituitary.
Vasopressin|increases renal water reabsorption|Deficiency can produce diabetes insipidus.
Thyroid hormones|increase basal metabolic activity|Iodine is required for their synthesis.
Calcitonin|lowers blood calcium concentration|It is secreted by thyroid parafollicular cells.
Parathyroid hormone|raises blood calcium concentration|It acts on bone, kidney and indirectly intestine.
Thymosin|supports T-lymphocyte differentiation|It is secreted by the thymus, especially in children.
Adrenaline|mediates short-term fight-or-flight responses|It increases heart rate and mobilises energy reserves.
Cortisol|major glucocorticoid of adrenal cortex|It promotes stress adaptation and gluconeogenesis.
Aldosterone|major mineralocorticoid|It promotes sodium retention and potassium loss.
Insulin|lowers blood glucose|Pancreatic beta cells secrete it after a rise in glucose.
Glucagon|raises blood glucose|Pancreatic alpha cells stimulate glycogen breakdown and gluconeogenesis.
Melatonin|helps regulate circadian rhythms|The pineal gland secretes it mainly in darkness.
Steroid-hormone action|intracellular receptor alters gene transcription|Lipid-soluble hormones cross the plasma membrane.`,

  'neet-biology-12-1': `Microsporogenesis|formation of haploid microspores by meiosis|Pollen mother cells divide inside the anther's microsporangia.
Pollen exine|tough outer wall containing sporopollenin|It resists high temperatures, strong acids and alkalis.
Pollen intine|inner wall made mainly of cellulose and pectin|The pollen tube emerges through a germ pore.
Two-celled pollen|vegetative cell plus generative cell|Most angiosperms shed pollen at this stage.
Three-celled pollen|vegetative cell plus two male gametes|The generative cell has already divided mitotically.
Megasporogenesis|formation of megaspores by meiosis|A megaspore mother cell usually produces four haploid megaspores.
Monosporic embryo sac|develops from one functional megaspore|The common Polygonum type is eight-nucleate and seven-celled.
Egg apparatus|one egg and two synergids|It lies at the micropylar end of the embryo sac.
Filiform apparatus|thickenings in synergids|It guides the pollen tube into a synergid.
Antipodal cells|three cells at the chalazal end|They lie opposite the egg apparatus.
Central cell|contains two polar nuclei before fusion|It becomes the site of triple fusion.
Autogamy|pollen transfer within the same flower|It provides assured seed set but little variation.
Geitonogamy|pollen transfer between flowers of the same plant|It is functionally cross-pollination but genetically self-pollination.
Xenogamy|pollen transfer between different plants of the same species|It introduces genetically different pollen.
Outbreeding devices|mechanisms that prevent self-pollination|Dichogamy, herkogamy and self-incompatibility promote crossing.
Double fertilisation|syngamy plus triple fusion|This combination is characteristic of angiosperms.
Syngamy|male gamete fuses with egg|The diploid zygote gives rise to the embryo.
Triple fusion|male gamete fuses with two polar nuclei|It produces the triploid primary endosperm nucleus.
Apomixis|seed formation without fertilisation|It can preserve desirable hybrid characters.
Polyembryony|more than one embryo in a seed|It occurs naturally in some Citrus and mango varieties.`,

  'neet-biology-12-2': `Spermatogenesis|formation of spermatozoa in seminiferous tubules|It begins at puberty under gonadotropin and androgen control.
Spermiogenesis|conversion of spermatids into spermatozoa|No meiotic division occurs during this differentiation.
Spermiation|release of spermatozoa from Sertoli cells|Mature sperm enter the lumen of seminiferous tubules.
Sertoli cells|nourish developing germ cells|FSH acts on them and they support spermatogenesis.
Leydig cells|secrete testicular androgens|LH stimulates these interstitial cells.
Sperm acrosome|enzyme-containing cap derived from Golgi apparatus|It helps sperm penetrate egg coverings.
Sperm middle piece|contains numerous mitochondria|ATP produced here powers flagellar movement.
Oogenesis|formation and maturation of the female gamete|It begins before birth and includes long meiotic arrests.
Primary oocyte arrest|prophase I of meiosis|Primary oocytes remain arrested until recruited after puberty.
Secondary oocyte arrest|metaphase II of meiosis|Meiosis II finishes only after sperm entry.
Follicular phase|ovarian follicles grow under FSH influence|Oestrogen rises as the dominant follicle develops.
Ovulation|release of secondary oocyte after LH surge|It occurs near the middle of a typical cycle.
Luteal phase|corpus luteum secretes progesterone|Progesterone maintains the secretory endometrium.
Menstruation|shedding of endometrium after hormone withdrawal|It follows degeneration of the corpus luteum without pregnancy.
Fertilisation site|ampullary-isthmic junction of oviduct|Sperm and secondary oocyte normally meet here.
Cleavage|rapid mitotic divisions without overall growth|The zygote becomes a morula and then blastocyst.
Blastocyst|contains trophoblast and inner cell mass|The trophoblast participates in implantation.
Implantation|embedding of blastocyst in endometrium|It begins about a week after fertilisation.
Placenta|temporary endocrine and exchange organ|It transfers gases and nutrients and secretes several hormones.
Parturition|childbirth initiated by neuroendocrine reflexes|Foetal ejection reflex and oxytocin amplify uterine contractions.`,

  'neet-biology-12-3': `Reproductive health|total well-being in reproductive matters|It includes physical, emotional, behavioural and social dimensions.
Natural contraception|avoids intercourse during the fertile period|Periodic abstinence requires careful cycle awareness.
Barrier method|physically prevents sperm from reaching the ovum|Condoms also reduce transmission of many STIs.
Copper IUD|increases sperm phagocytosis and reduces sperm motility|Copper ions suppress fertilising capacity.
Hormone-releasing IUD|makes uterus unsuitable and cervix hostile to sperm|It also alters endometrial conditions.
Oral contraceptive pill|suppresses ovulation and alters cervical mucus|Combined formulations use oestrogen and progestogen.
Saheli|non-steroidal oral contraceptive developed in India|Centchroman is taken on a weekly schedule after the initial phase.
Vasectomy|small portion of each vas deferens is cut and tied|It prevents sperm from entering semen.
Tubectomy|small portion of each fallopian tube is cut and tied|It prevents gamete transport and fertilisation.
Medical termination of pregnancy|intentional termination before full term|It is safest when performed early by qualified professionals.
Amniocentesis misuse|prenatal sex determination|This misuse is prohibited because it promoted female foeticide.
Gonorrhoea|bacterial sexually transmitted infection|Early diagnosis and antibiotic treatment are important.
Syphilis|bacterial STI caused by Treponema pallidum|Untreated infection can progress through multiple stages.
Genital herpes|viral STI with recurrent lesions|The virus may persist latently after infection.
HIV infection|can be transmitted sexually and through infected blood|Prevention includes safe sex and screened blood.
Infertility|inability to conceive despite unprotected intercourse|Causes may occur in either partner and can be investigated.
IVF|fertilisation outside the body|Embryos are cultured before transfer to the reproductive tract.
ZIFT|zygote or early embryo transferred to fallopian tube|The transferred embryo has up to eight blastomeres.
IUT|embryo with more than eight blastomeres transferred to uterus|It is one method used after in-vitro fertilisation.
ICSI|single sperm injected directly into an ovum|It is useful in some severe male-factor infertility cases.`,

  'neet-biology-12-4': `Mendel's monohybrid cross|produces a 3 to 1 phenotypic ratio in F2|The genotypic ratio is 1 to 2 to 1 under complete dominance.
Law of dominance|one allele expresses in a heterozygote|The other allele is described as recessive in complete dominance.
Law of segregation|allele pairs separate during gamete formation|Each gamete receives only one allele of a gene.
Test cross|individual of unknown genotype crossed with a recessive homozygote|Offspring reveal the genotype of the tested parent.
Dihybrid F2 ratio|9 to 3 to 3 to 1 with independent assortment|It applies when two genes assort independently and show complete dominance.
Independent assortment|alleles of different genes segregate independently|It is most evident for genes on different chromosomes or far apart.
Incomplete dominance|heterozygote has an intermediate phenotype|Snapdragon flower colour gives a 1 to 2 to 1 phenotypic ratio.
Codominance|both alleles express in a heterozygote|AB blood group expresses both IA and IB alleles.
Multiple alleles|more than two allelic forms exist in a population|An individual still carries only two alleles at one locus.
Pleiotropy|one gene affects multiple traits|Phenylketonuria illustrates several effects of one altered gene.
Chromosomal theory of inheritance|genes occur on chromosomes|Sutton and Boveri connected meiotic chromosome behaviour with Mendel's laws.
Linkage|genes on the same chromosome tend to be inherited together|Closer genes show lower recombination frequency.
Crossing over|exchange between non-sister chromatids of homologues|It creates recombinant gene combinations during pachytene.
Sex-linked inheritance|gene located on a sex chromosome|X-linked recessive traits occur more often in males.
Haemophilia|X-linked recessive disorder affecting clotting|Carrier mothers can transmit the allele to sons.
Colour blindness|commonly X-linked recessive|Affected males transmit the allele to all daughters but not sons.
Sickle-cell anaemia|autosomal recessive point-mutation disorder|Valine replaces glutamic acid at the sixth beta-globin position.
Thalassaemia|reduced synthesis of an alpha or beta globin chain|It is a quantitative defect in haemoglobin production.
Down syndrome|trisomy of chromosome 21|Nondisjunction commonly causes the extra chromosome.
Turner syndrome|45,X chromosomal constitution|Affected individuals are phenotypic females with gonadal dysgenesis.`,

  'neet-biology-12-5': `Griffith experiment|demonstrated bacterial transformation|A heritable factor from heat-killed virulent bacteria transformed live non-virulent cells.
Avery MacLeod and McCarty|identified DNA as the transforming principle|DNase abolished transformation whereas protease and RNase did not.
Hershey and Chase experiment|confirmed DNA enters bacteria during phage infection|Radioactive phosphorus labelled DNA and sulfur labelled protein.
DNA nucleotide|base, deoxyribose and phosphate|Nucleotides join through phosphodiester bonds.
DNA double helix|two antiparallel polynucleotide strands|Complementary bases pair inside the helix.
Adenine-thymine pairing|two hydrogen bonds|Purine-pyrimidine pairing maintains uniform helix width.
Guanine-cytosine pairing|three hydrogen bonds|GC-rich DNA generally requires more heat to separate.
Semiconservative replication|each daughter DNA has one old and one new strand|Meselson and Stahl demonstrated this using nitrogen isotopes.
DNA polymerase|extends DNA only in the 5 prime to 3 prime direction|It requires a template and a primer with a free 3-prime hydroxyl.
Leading strand|synthesised continuously toward the replication fork|Its template permits continuous 5-prime to 3-prime synthesis.
Lagging strand|synthesised discontinuously as Okazaki fragments|DNA ligase joins the fragments.
Transcription|RNA synthesis from a DNA template|RNA polymerase reads the template strand.
Messenger RNA|carries coding information to ribosomes|Its codons specify amino-acid order.
Transfer RNA|adaptor between codon and amino acid|Its anticodon pairs with mRNA and its acceptor end binds an amino acid.
Genetic code|triplet, degenerate and nearly universal|Most amino acids are specified by more than one codon.
Start codon|AUG|It initiates translation and codes for methionine.
Stop codons|UAA, UAG and UGA|They terminate translation and do not specify amino acids.
Lac operon|inducible operon for lactose metabolism|Lactose-derived inducer disables the repressor when glucose is low.
Human Genome Project|sequenced and mapped the human genome|It combined large-scale sequencing with bioinformatics.
DNA fingerprinting|uses polymorphic repetitive DNA regions|Variation in VNTR or STR patterns helps identify individuals.`,

  'neet-biology-12-6': `Chemical evolution|formation of organic molecules before life|Oparin and Haldane proposed evolution from pre-existing non-living organic molecules.
Miller experiment|formed amino acids under simulated primitive conditions|Electrical sparks acted on reducing gases and water vapour.
Fossils|direct historical evidence of past life|Their age and sequence document change through geological time.
Homologous organs|same basic structure with different functions|They indicate common ancestry and divergent evolution.
Analogous organs|different origin with similar function|They illustrate convergent evolution.
Adaptive radiation|diversification from a common ancestor in one region|Darwin's finches are a classic example.
Natural selection|differential survival and reproduction of heritable variants|It changes allele frequencies over generations.
Industrial melanism|environment-dependent selection of moth colour forms|Pollution altered camouflage and predation pressure.
Antibiotic resistance|pre-existing resistant variants are selected|Antibiotics do not direct bacteria to mutate adaptively.
Hardy-Weinberg equilibrium|allele frequencies remain constant under ideal conditions|Random mating and absence of evolutionary forces are assumed.
Hardy-Weinberg equation|p squared plus 2pq plus q squared equals one|It describes genotype frequencies for two alleles.
Mutation|source of new alleles|Random DNA changes introduce heritable variation.
Gene flow|movement of alleles between populations|Migration can reduce differences between populations.
Genetic drift|random change in allele frequency|Its effects are strongest in small populations.
Founder effect|drift after a new population starts from few individuals|The new population may carry unusual allele frequencies.
Recombination|creates new combinations of existing alleles|Crossing over and independent assortment contribute.
Stabilising selection|favours intermediate phenotypes|Variation around the mean tends to decrease.
Directional selection|favours one extreme phenotype|The population mean shifts over time.
Disruptive selection|favours both extremes over intermediates|It can produce a bimodal distribution.
Human evolution|modern humans share primate ancestry|Evolution is branching and does not form a simple ladder of living species.`,

  'neet-biology-12-7': `Innate immunity|non-specific defence present from birth|Physical, physiological, cellular and cytokine barriers act immediately.
Acquired immunity|pathogen-specific defence with memory|B and T lymphocytes produce stronger secondary responses.
Humoral immunity|antibody-mediated defence|B lymphocytes differentiate into plasma and memory cells.
Cell-mediated immunity|T-lymphocyte-mediated defence|It is important against infected cells and in graft rejection.
Active immunity|host produces antibodies after antigen exposure|It develops more slowly but usually provides lasting memory.
Passive immunity|ready-made antibodies are received|Protection is immediate but generally short-lived.
Vaccination|induces immunological memory safely|A later encounter produces a rapid secondary response.
Allergy|exaggerated immune response to harmless antigen|IgE and mast-cell mediators such as histamine are often involved.
Autoimmunity|immune response against self components|Loss of self-tolerance damages host tissues.
HIV|retrovirus that targets CD4-positive cells|Progressive helper-T-cell loss causes immunodeficiency.
AIDS transmission|sexual contact, infected blood, shared needles or mother-to-child|It is not spread by ordinary social contact.
ELISA|commonly used screening test for HIV antibodies or antigens|Reactive screening results require confirmatory interpretation.
Plasmodium sporozoite|infective stage injected into humans|Female Anopheles mosquitoes deliver sporozoites.
Malaria periodic fever|linked to synchronous rupture of infected RBCs|Haemozoin and parasite products trigger symptoms.
Entamoeba histolytica|causes amoebiasis|Contaminated food and water transmit cysts.
Ascaris lumbricoides|causes ascariasis|Eggs spread through faecally contaminated food, water or soil.
Wuchereria|filarial worm affecting lymphatic vessels|Chronic infection can cause elephantiasis.
Cancer|uncontrolled cell proliferation and invasion|Carcinogens and mutations disrupt normal growth control.
Metastasis|spread of malignant cells to distant sites|Cancer cells travel through blood or lymph.
Drug addiction|compulsive use despite harmful consequences|Prevention includes education, support and early intervention.`,

  'neet-biology-12-8': `Lactobacillus|converts milk to curd|Lactic acid coagulates milk proteins and improves digestibility.
Saccharomyces cerevisiae|used in baking and alcoholic fermentation|Yeast releases carbon dioxide and ethanol from sugars.
Aspergillus niger|industrial source of citric acid|Microbes produce many commercially valuable organic acids.
Acetobacter aceti|industrial source of acetic acid|It oxidises ethanol during vinegar production.
Penicillium|source of penicillin|The antibiotic inhibits susceptible bacteria.
Streptokinase|microbial clot buster|It activates plasminogen and helps dissolve blood clots.
Cyclosporin A|immunosuppressant from Trichoderma polysporum|It is used to reduce organ-transplant rejection.
Statins|cholesterol-lowering products of Monascus purpureus|They inhibit a key enzyme in cholesterol synthesis.
Primary sewage treatment|physical removal of floating and suspended solids|Screening, grit removal and sedimentation precede biological treatment.
Secondary sewage treatment|microbial oxidation of organic matter|Aeration promotes floc formation and lowers BOD.
Flocs|bacteria associated with fungal filaments|They consume organic matter in the aeration tank.
Biochemical oxygen demand|oxygen needed by microbes to oxidise organic matter|High BOD indicates strong organic pollution.
Activated sludge|sediment rich in microbial flocs|Part is recycled as inoculum and the rest enters anaerobic digesters.
Anaerobic sludge digester|produces biogas|Methanogens break down organic matter without oxygen.
Biogas|mainly methane with carbon dioxide and other gases|It is a renewable fuel from microbial digestion.
Methanogens|archaea producing methane anaerobically|They occur in sludge digesters and ruminant guts.
Biocontrol|use of organisms to suppress pests and pathogens|It reduces dependence on broad-spectrum chemicals.
Bacillus thuringiensis|microbial insecticide|Its spores and crystal proteins kill susceptible insect larvae.
Trichoderma|fungal biocontrol agent against plant pathogens|It is applied to roots or soil in sustainable agriculture.
Biofertiliser|organism that enriches soil nutrient availability|Rhizobium, cyanobacteria and mycorrhizae are examples.`,

  'neet-biology-12-9': `Biotechnology|use of organisms, cells or enzymes for useful products|Modern biotechnology commonly uses genetic engineering and sterile bioprocessing.
Restriction endonuclease|cuts DNA at specific recognition sequences|Many recognise palindromic DNA sites.
Sticky ends|single-stranded overhangs after staggered cuts|Complementary overhangs help recombinant molecules anneal.
DNA ligase|joins DNA fragments by phosphodiester bonds|It seals the sugar-phosphate backbone.
Cloning vector|DNA molecule carrying foreign DNA into a host|Plasmids and bacteriophages can serve as vectors.
Origin of replication|site where vector replication begins|It influences copy number in the host.
Selectable marker|identifies cells that carry a vector|Antibiotic-resistance genes are common laboratory examples.
Cloning site|unique restriction site used for DNA insertion|Insertion should not disrupt essential vector functions.
Competent cell|host prepared to take up recombinant DNA|Calcium treatment and heat shock can aid plasmid entry into bacteria.
Gel electrophoresis|separates DNA fragments mainly by size|DNA migrates toward the positive electrode through agarose.
Elution|recovery of a selected DNA band from gel|The purified fragment can be used for ligation.
PCR|amplifies a chosen DNA segment in vitro|Cycles of denaturation, annealing and extension multiply the target.
Taq polymerase|thermostable enzyme used in PCR|It tolerates repeated high-temperature denaturation.
Reverse transcriptase|makes DNA from an RNA template|It is useful for preparing complementary DNA.
Insertional inactivation|foreign DNA disrupts a marker gene|Recombinant colonies can be distinguished by loss of marker function.
Bioreactor|controlled vessel for large-scale product formation|Temperature, pH, oxygen and mixing are regulated.
Stirred-tank bioreactor|uses an agitator for mixing and aeration|It provides uniform access to nutrients and oxygen.
Downstream processing|product recovery and purification after biosynthesis|It includes separation, formulation and quality control.
Recombinant DNA|DNA assembled from different sources|Restriction enzymes and ligase permit construction.
Agrobacterium vector|modified Ti plasmid transfers genes into plants|Disease-causing genes are removed before use.`,

  'neet-biology-12-10': `Recombinant insulin|produced using separate human insulin-chain sequences in bacteria|The chains are purified and joined to form active insulin.
Gene therapy|introduces a functional gene to treat a disorder|Its success depends on delivery and persistence of expression.
ADA deficiency therapy|functional ADA cDNA introduced into patient lymphocytes|Repeated infusions may be needed when corrected cells are not permanent stem cells.
Bt toxin|insecticidal protein from Bacillus thuringiensis|Different cry genes target particular insect groups.
Bt protoxin activation|occurs in the alkaline insect gut|Activated toxin damages midgut epithelial cells.
Bt cotton|transgenic crop expressing cry genes|It is protected against selected bollworms.
RNA interference|sequence-specific silencing by double-stranded RNA|Complementary mRNA is degraded or translation is blocked.
Nematode-resistant tobacco|engineered using RNA interference|Sense and antisense RNA produce double-stranded RNA against the parasite.
Golden rice|engineered to accumulate beta-carotene|It aims to improve vitamin A nutrition.
Genetically modified organism|has DNA altered using biotechnology|Inserted genes can confer new agricultural or medical traits.
Transgenic animal|carries a foreign gene in its genome|Such animals support research, safety testing and product development.
Vaccine safety testing|one use of transgenic animals|They can model immune responses before human use.
Biopharming|production of therapeutic proteins in engineered organisms|Plants or animals can act as biological factories.
Biosafety|assessment and management of biotechnology risks|Environmental and health effects require evaluation.
Biopiracy|use of biological resources or knowledge without fair authorisation|Benefit sharing protects source communities and countries.
Patent|time-limited legal right over an invention|Patent claims must meet applicable standards of novelty and utility.
Molecular diagnosis|detects disease-associated nucleic acids or proteins|PCR and probes can identify infection before obvious symptoms.
ELISA|detects antigens or antibodies through enzyme-linked reactions|It is widely used in clinical screening.
Recombinant vaccine|vaccine antigen made by genetic engineering|It avoids growing large amounts of the complete pathogen.
Ethical biotechnology|balances innovation with safety, consent and equity|Regulation addresses impacts on people, animals and ecosystems.`,

  'neet-biology-12-11': `Population density|number or biomass per unit area or volume|Density can be measured directly or by suitable proxies.
Natality|births added to a population per unit time|It increases population density.
Mortality|deaths in a population per unit time|It decreases population density.
Immigration|individuals enter a population|It raises local population size.
Emigration|individuals leave a population|It lowers local population size.
Age pyramid|shows pre-reproductive, reproductive and post-reproductive groups|Its shape indicates whether a population is expanding, stable or declining.
Sex ratio|proportion of males and females|It affects reproductive potential of a population.
Exponential growth|J-shaped increase under unlimited resources|The equation is dN by dt equals rN.
Intrinsic rate of increase|per-capita potential growth rate|It is represented by r in population equations.
Logistic growth|S-shaped growth with resource limitation|Growth slows as population approaches carrying capacity.
Carrying capacity|maximum sustainable population size|It is represented by K in the logistic equation.
Mutualism|both interacting species benefit|Pollination and mycorrhizal associations are examples.
Competition|both species are negatively affected|They use a shared limiting resource.
Predation|predator benefits and prey is harmed|Predators can regulate prey and maintain diversity.
Parasitism|parasite benefits while host is harmed|Parasites often evolve host-specific adaptations.
Commensalism|one species benefits and the other is unaffected|An orchid growing on a mango branch is a common example.
Competitive exclusion|complete competitors cannot coexist indefinitely|Gause demonstrated exclusion under limited resources.
Resource partitioning|species reduce competition by using resources differently|It can permit coexistence of similar species.
Brood parasitism|parasite lays eggs in another bird's nest|Host parents incubate and rear the parasite's young.
Population regulation|density-dependent factors alter growth near carrying capacity|Competition, disease and predation often strengthen at high density.`,

  'neet-biology-12-12': `Ecosystem|functional unit of organisms and physical environment|Energy flow and nutrient cycling connect its components.
Abiotic component|non-living chemical and physical environment|Light, temperature, water and minerals are examples.
Producer|autotroph that fixes external energy|Green plants form the first trophic level of a grazing chain.
Primary consumer|herbivore feeding on producers|It occupies the second trophic level in a grazing chain.
Decomposer|microbe that mineralises dead organic matter|Fungi and bacteria return nutrients to the environment.
Gross primary productivity|total photosynthetic production|It includes organic matter later used in plant respiration.
Net primary productivity|gross productivity minus respiratory loss|It is biomass available to consumers and decomposers.
Secondary productivity|rate of new biomass formation by consumers|It depends on food assimilation and growth.
Decomposition|breakdown of detritus into simpler substances|Detritivores and microbes carry out its steps.
Fragmentation|detritus broken into smaller particles|Detritivores such as earthworms facilitate it.
Leaching|water dissolves nutrients and carries them into soil layers|Some salts may precipitate and become unavailable.
Catabolism|microbial enzymes convert detritus to inorganic substances|Warm, moist conditions generally accelerate it.
Humification|formation of dark resistant humus|Humus decomposes very slowly and stores nutrients.
Mineralisation|release of inorganic nutrients from organic matter|Microbial action makes elements available again.
Food chain|linear transfer of matter and energy through feeding|Grazing and detritus chains are major types.
Food web|interconnected food chains|Multiple pathways can increase ecosystem stability.
Ten-percent law|only a small fraction of energy passes to the next trophic level|Most energy is lost as heat and metabolism.
Pyramid of energy|always upright|Available energy decreases at successive trophic levels.
Pyramid of biomass|may be inverted in aquatic ecosystems|Rapid producer turnover can support larger consumer standing biomass.
Ecological succession|orderly change in community composition|Pioneer stages gradually give way to more stable communities.`,

  'neet-biology-12-13': `Biodiversity|variation at genetic, species and ecosystem levels|It includes diversity within species and among habitats.
Genetic diversity|variation in genes within a species|India has many rice strains and mango varieties.
Species diversity|variety and relative abundance of species|It differs among communities and regions.
Ecological diversity|variety of ecosystems and habitats|Forests, deserts, wetlands and coral reefs differ ecologically.
Latitudinal gradient|species richness generally rises toward the tropics|Stable climate and long evolutionary time contribute.
Species-area relationship|species richness increases with sampled area|On a log-log plot it forms a straight line over a range.
Rivet-popper hypothesis|progressive species loss weakens ecosystem function|Loss of key species may have disproportionate effects.
Habitat loss|major cause of biodiversity decline|Fragmentation isolates populations and reduces viable habitat.
Over-exploitation|harvest exceeds replacement rate|It has driven many species toward extinction.
Alien species invasion|introduced species harms native communities|Lantana and water hyacinth are invasive examples in India.
Co-extinction|one species disappears when its obligate partner is lost|Host and parasite or plant and pollinator may be linked.
In situ conservation|protects species in natural habitats|Biosphere reserves, national parks and sanctuaries are examples.
Ex situ conservation|protects biodiversity outside natural habitats|Zoos, botanical gardens and gene banks are examples.
Biodiversity hotspot|region with high endemism and severe habitat loss|Hotspots prioritise limited conservation resources.
Endemic species|naturally restricted to a defined region|Narrow ranges can increase extinction vulnerability.
Red Data Book|catalogue of threatened species information|It supports assessment and conservation planning.
Biosphere reserve|large area integrating conservation and sustainable use|Core, buffer and transition zones may be recognised.
National park|protected area with strong ecosystem and wildlife protection|Human activity is more restricted than in many multi-use landscapes.
Sacred grove|community-protected patch of natural vegetation|Traditional protection conserves rare local species.
Cryopreservation|long-term storage at very low temperature|Gametes, seeds or tissues can be preserved ex situ.`
};

const currentIds = [
  ...Array.from({length: 19}, (_, i) => `neet-biology-11-${i + 1}`),
  ...Array.from({length: 13}, (_, i) => `neet-biology-12-${i + 1}`)
];

// Remove the legacy Environmental Issues card: it is not a chapter in the
// current NCERT Class 12 Biology book and is outside NEET-UG 2026 Unit 10.
data.chapters = data.chapters.filter(chapter => currentIds.includes(chapter.id));
assert.deepEqual(data.chapters.map(chapter => chapter.id), currentIds);

function parse(block, id) {
  const rows = block.split('\n').map(line => line.trim()).filter(Boolean).map((line, index) => {
    const fields = line.split('|').map(value => value.trim());
    assert.equal(fields.length, 3, `${id} concept ${index + 1}`);
    return {term: fields[0], fact: fields[1], explanation: fields[2]};
  });
  assert.equal(rows.length, 20, `${id}: expected 20 reviewed concepts`);
  assert.equal(new Set(rows.map(row => row.term.toLowerCase())).size, 20, `${id}: duplicate terms`);
  assert.equal(new Set(rows.map(row => row.fact.toLowerCase())).size, 20, `${id}: duplicate facts`);
  return rows;
}

function rotatedOptions(correct, distractors, seed) {
  const options = [correct, ...distractors];
  const shift = seed % 4;
  const rotated = options.slice(shift).concat(options.slice(0, shift));
  return {options: rotated, answer: rotated.indexOf(correct)};
}

for (const chapter of data.chapters.slice(10)) {
  const concepts = parse(banks[chapter.id], chapter.id);
  const questions = [];
  const prefix = `NEET-BIO-COMP-${chapter.classLevel}-${chapter.id.split('-').at(-1)}-`;
  const add = (question, correct, distractors, explanation, type, difficulty = 'Medium') => {
    const serial = questions.length + 1;
    const {options, answer} = rotatedOptions(correct, distractors, serial * 7 + chapter.name.length);
    assert.equal(new Set(options.map(option => option.toLowerCase())).size, 4, question);
    questions.push({
      id: `${prefix}${String(serial).padStart(3, '0')}`,
      question, options, answer, explanation, difficulty,
      chapter: chapter.name, subject: 'Biology', questionType: type,
      provenance: 'Original NCERT-aligned NEET practice question'
    });
  };

  // 20 direct concept questions.
  concepts.forEach((concept, index) => {
    const other = [1, 7, 13].map(offset => concepts[(index + offset) % concepts.length].fact);
    add(`Which NCERT association is correct for “${concept.term}”?`, concept.fact, other,
      concept.explanation, 'single-correct', index < 7 ? 'Easy' : 'Medium');
  });

  // 20 reverse-recall questions.
  concepts.forEach((concept, index) => {
    const other = [3, 9, 15].map(offset => concepts[(index + offset) % concepts.length].term);
    add(`Identify the term described by this statement: ${concept.fact}.`, concept.term, other,
      concept.explanation, 'reverse-recall', index < 6 ? 'Easy' : 'Medium');
  });

  // 30 two-statement questions with a balanced truth pattern.
  for (let i = 0; i < 30; i++) {
    const first = concepts[(i * 3) % concepts.length];
    const second = concepts[(i * 3 + 7) % concepts.length];
    const truth = i % 4;
    const firstTrue = truth === 0 || truth === 1;
    const secondTrue = truth === 0 || truth === 2;
    const firstFact = firstTrue ? first.fact : concepts[(i * 3 + 1) % concepts.length].fact;
    const secondFact = secondTrue ? second.fact : concepts[(i * 3 + 8) % concepts.length].fact;
    const correct = firstTrue ? (secondTrue ? 'Both I and II are correct' : 'Only I is correct')
      : (secondTrue ? 'Only II is correct' : 'Neither I nor II is correct');
    add(`Statement set ${i + 1}: Evaluate I and II. I. ${first.term}: ${firstFact}. II. ${second.term}: ${secondFact}.`, correct,
      ['Both I and II are correct', 'Only I is correct', 'Only II is correct', 'Neither I nor II is correct'].filter(option => option !== correct),
      `Statement I is ${firstTrue ? 'correct' : 'incorrect'} and statement II is ${secondTrue ? 'correct' : 'incorrect'}. ${first.explanation} ${second.explanation}`,
      'two-statements', 'Medium');
  }

  // 30 three-pair matching questions.
  const permutations = [[0,1,2],[0,2,1],[1,0,2],[1,2,0],[2,0,1],[2,1,0]];
  for (let i = 0; i < 30; i++) {
    const selected = [concepts[i % 20], concepts[(i + 6) % 20], concepts[(i + 13) % 20]];
    const order = permutations[(i * 5 + 1) % permutations.length];
    const listTwo = order.map(position => selected[position].fact);
    const mapping = selected.map(item => listTwo.indexOf(item.fact) + 1);
    const encode = values => values.map((value, index) => `${'ABC'[index]}–${value}`).join(', ');
    const correct = encode(mapping);
    const wrong = permutations.map(values => encode(values.map(value => value + 1))).filter(option => option !== correct).slice(0, 3);
    const left = selected.map((item, index) => `${'ABC'[index]}. ${item.term}`).join('; ');
    const right = listTwo.map((fact, index) => `${index + 1}. ${fact}`).join('; ');
    add(`Matching set ${i + 1}: Match List I with List II. List I: ${left}. List II: ${right}.`, correct, wrong,
      selected.map(item => item.explanation).join(' '), 'match-the-following', i < 10 ? 'Medium' : 'Hard');
  }

  assert.equal(questions.length, 100, `${chapter.name}: question total`);
  assert.equal(new Set(questions.map(question => question.question.toLowerCase())).size, 100, `${chapter.name}: duplicate question text`);
  chapter.mcqs = questions;
  chapter.practiceNote = '100 original NCERT-aligned NEET questions: direct recall, reverse recall, two-statement and matching formats. Not labelled as previous-year questions.';
  chapter.questionBank = {
    source: 'NCERT Biology Class 11 and 12 chapter concepts',
    syllabus: 'NEET-UG 2026 Biology syllabus',
    counts: {'single-correct': 20, 'reverse-recall': 20, 'two-statements': 30, 'match-the-following': 30}
  };
}

const total = data.chapters.reduce((sum, chapter) => sum + chapter.mcqs.length, 0);
assert.equal(data.chapters.length, 32);
assert.equal(total, 4000);
assert.ok(data.chapters.every(chapter => chapter.mcqs.length >= 100));
const allQuestions = data.chapters.flatMap(chapter => chapter.mcqs);
assert.equal(new Set(allQuestions.map(question => question.id)).size, total);
for (const question of allQuestions) {
  assert.equal(question.options.length, 4, question.id);
  assert.ok(Number.isInteger(question.answer) && question.answer >= 0 && question.answer < 4, question.id);
  assert.ok(question.question.trim() && question.explanation.trim(), question.id);
}

data.description = '4,000 chapter-wise Biology MCQs across all 32 current NCERT Class 11 and Class 12 chapters in the NEET-UG 2026 syllabus. Every chapter has at least 100 original questions with answers and explanations.';
data.syllabus = {
  exam: 'NEET-UG 2026',
  chapters: 32,
  class11Chapters: 19,
  class12Chapters: 13,
  note: 'Environmental Issues and other rationalised legacy chapters are excluded from the active bank because they are outside the current official Biology syllabus.'
};
fs.writeFileSync(target, `${JSON.stringify(data, null, 2)}\n`);
console.log(`Built ${total} Biology MCQs across ${data.chapters.length} current chapters.`);
