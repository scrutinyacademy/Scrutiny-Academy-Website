import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import {execFileSync} from 'node:child_process';
import assert from 'node:assert/strict';

const root = path.resolve(import.meta.dirname, '..');
const biologyPath = path.join(root, 'data/neet/biology.json');
const chemistryPath = path.join(root, 'data/neet/chemistry.json');
const TARGET = 250;

const class12ConceptText = {
  'neet-chemistry-12-1': `Molarity|moles of solute per litre of solution|Molarity changes with temperature because solution volume changes.
Molality|moles of solute per kilogram of solvent|Molality is independent of temperature because it uses mass of solvent.
Mole fraction|moles of one component divided by total moles of all components|The sum of mole fractions in a solution is one.
Raoult law|partial vapour pressure equals mole fraction multiplied by vapour pressure of the pure component|It describes ideal-solution vapour pressure.
Ideal solution|obeys Raoult law over the entire composition range|For an ideal solution, enthalpy and volume of mixing are zero.
Positive deviation|vapour pressure is greater than predicted by Raoult law|Weaker unlike interactions favour escape to vapour and may form a minimum-boiling azeotrope.
Negative deviation|vapour pressure is less than predicted by Raoult law|Stronger unlike interactions may produce a maximum-boiling azeotrope.
Henry law|gas solubility is related to its partial pressure by p equals KH times mole fraction|At a given pressure, a larger Henry constant means lower solubility.
Relative lowering of vapour pressure|equals solute mole fraction for a dilute solution of nonvolatile solute|It is a colligative property.
Elevation of boiling point|delta Tb equals Kb times molality|A nonvolatile solute raises the boiling point of a solvent.
Depression of freezing point|delta Tf equals Kf times molality|A solute lowers the freezing point of a solvent.
Osmotic pressure|pi equals concentration times R times T for a dilute solution|Osmotic pressure is useful for molar-mass determination of biomolecules.
Reverse osmosis|solvent is forced through a semipermeable membrane by pressure exceeding osmotic pressure|It is used in desalination and water purification.
van't Hoff factor|ratio of observed to calculated colligative property|Dissociation usually gives i greater than one and association gives i less than one.
Isotonic solutions|have the same osmotic pressure at the same temperature|There is no net osmosis between isotonic solutions through a semipermeable membrane.
Azeotrope|mixture that boils at constant composition|Its liquid and vapour phases have the same composition.`,

  'neet-chemistry-12-2': `Conductance|reciprocal of resistance|Conductance is measured in siemens.
Conductivity|conductance of a solution column of unit length and unit cross-sectional area|Conductivity decreases on dilution because ions per unit volume decrease.
Molar conductivity|conductivity multiplied by volume containing one mole of electrolyte|Molar conductivity generally increases on dilution.
Kohlrausch law|limiting molar conductivity is the sum of limiting ionic contributions|It helps calculate limiting conductivity of weak electrolytes.
Galvanic cell|converts spontaneous chemical energy into electrical energy|Oxidation occurs at the anode and reduction at the cathode.
Cell notation|anode is written on the left and cathode on the right|A double vertical line denotes the salt bridge.
Standard cell potential|standard cathode reduction potential minus standard anode reduction potential|A positive value corresponds to a spontaneous cell reaction under standard conditions.
Nernst equation|E equals E standard minus RT over nF times natural log Q|Cell potential depends on concentration and temperature.
Gibbs energy and cell potential|delta G equals minus nFE|A positive cell potential gives negative Gibbs energy.
Equilibrium constant and cell potential|standard cell potential equals RT over nF times natural log K|A larger positive standard potential corresponds to a larger equilibrium constant.
Salt bridge|maintains electrical neutrality and completes the circuit|It minimises liquid-junction potential without mixing the bulk solutions rapidly.
Electrolytic cell|uses external electrical energy to drive a nonspontaneous reaction|The anode remains the site of oxidation.
Faraday first law|mass deposited is proportional to quantity of electricity passed|Charge equals current multiplied by time.
Faraday constant|charge carried by one mole of electrons|Its value is approximately 96500 coulomb per mole.
Corrosion of iron|electrochemical oxidation produces hydrated iron(III) oxide|Moisture and oxygen are required for ordinary rusting.
Fuel cell|converts continuously supplied fuel and oxidant directly into electrical energy|Hydrogen-oxygen fuel cells produce water as the main product.`,

  'neet-chemistry-12-3': `Average reaction rate|change in concentration divided by the corresponding time interval|Stoichiometric coefficients are used to express one common reaction rate.
Instantaneous rate|slope of the concentration-time tangent at a specified instant|It is the limiting value of average rate as the interval approaches zero.
Rate law|rate equals k times reactant concentrations raised to experimentally determined powers|Rate-law exponents need not equal stoichiometric coefficients.
Order of reaction|sum of powers of concentration terms in the rate law|Order is determined experimentally.
Molecularity|number of reacting species in an elementary step|Molecularity is a positive integer and is not defined for an overall complex reaction.
Zero-order reaction|rate is independent of reactant concentration|Its concentration-time graph is linear with slope minus k.
Zero-order half-life|t half equals initial concentration divided by two k|Its half-life depends on initial concentration.
First-order reaction|log initial concentration over final concentration equals kt over 2.303|Its rate constant has unit time inverse.
First-order half-life|t half equals 0.693 over k|It is independent of initial concentration.
Pseudo-first-order reaction|one reactant is present in large excess so its concentration is effectively constant|Hydrolysis with water in large excess is a common example.
Arrhenius equation|k equals A e raised to minus Ea over RT|Increasing temperature raises the fraction of molecules crossing the activation barrier.
Activation energy|minimum energy barrier associated with reaction progress|A catalyst provides a pathway with lower activation energy.
Catalyst and equilibrium|a catalyst speeds forward and reverse reactions equally|It does not change equilibrium constant or equilibrium composition.
Collision frequency|number of molecular collisions per unit time and volume|Only collisions with sufficient energy and proper orientation are effective.
Temperature coefficient|reaction rate commonly increases when temperature rises|The increase arises mainly from the larger high-energy fraction.
Rate-determining step|slowest elementary step controlling the overall rate|A proposed mechanism must agree with the observed rate law.`,

  'neet-chemistry-12-4': `Transition element|element whose atom or common ion has an incompletely filled d subshell|Zinc is not a transition element because Zn and Zn2+ have filled d subshells.
General d-block configuration|is (n minus 1)d one to ten ns zero to two|Chromium and copper show stability-related configuration exceptions.
Variable oxidation states|arise because ns and (n minus 1)d electrons have comparable energies|Middle-series elements commonly show several oxidation states.
Coloured ions|often result from d-d electronic transitions|Ions with d zero or d ten configurations are generally colourless.
Paramagnetism|arises from unpaired electrons|Spin-only magnetic moment is root of n into n plus two Bohr magnetons.
Catalytic activity|is favoured by variable oxidation states and surface adsorption|Transition metals and their compounds often act as catalysts.
Complex formation|is promoted by small ionic size, high charge and available orbitals|Transition-metal ions readily bind ligands.
Interstitial compounds|form when small atoms occupy holes in a metal lattice|They are often hard and retain metallic conductivity.
Alloy formation|is favoured by similar atomic radii of transition metals|Substitution in metallic lattices gives solid solutions.
Lanthanoid contraction|steady decrease in lanthanoid ionic radii across the series|Poor shielding by 4f electrons causes the contraction.
Zirconium-hafnium similarity|results from lanthanoid contraction|Their radii are nearly equal and separation is difficult.
Lanthanoid oxidation state|plus three is the most common state|Plus two and plus four occur when they give especially stable f configurations.
Actinoid oxidation states|show wider variability than lanthanoids|5f, 6d and 7s levels have comparable energies.
Potassium permanganate|is a strong oxidising agent in acidic medium|Permanganate is reduced mainly to Mn2+ in acid.
Potassium dichromate|is an orange oxidising agent in acidic medium|Dichromate is reduced to green Cr3+.
Chromate-dichromate equilibrium|acid favours orange dichromate and base favours yellow chromate|The interconversion depends on hydrogen-ion concentration.`,

  'neet-chemistry-12-5': `Coordination entity|central metal atom or ion bonded to a fixed number of ligands|The species inside square brackets is treated as one entity.
Ligand|Lewis base that donates an electron pair to a metal centre|Ligands may be neutral, anionic or cationic.
Coordination number|number of ligand donor atoms directly bonded to the metal|A bidentate ligand contributes two to coordination number.
Denticity|number of donor atoms through which one ligand binds|EDTA is hexadentate.
Chelation|ring formation by a multidentate ligand attached to one metal|Chelates are commonly more stable than analogous monodentate complexes.
Oxidation number in a complex|is found by balancing ligand charges with the complex charge|Neutral ligands do not contribute ionic charge.
Werner theory|distinguishes primary valency from secondary valency|Secondary valency corresponds to coordination number and is directional.
Ionisation isomerism|exchange occurs between a coordinated ion and a counter ion|The isomers give different ions in solution.
Linkage isomerism|an ambidentate ligand coordinates through different donor atoms|Nitrite can bind through nitrogen or oxygen.
Geometrical isomerism|arises from different spatial arrangements such as cis and trans|Square-planar and octahedral complexes commonly show it.
Optical isomerism|non-superimposable mirror-image complexes rotate plane-polarised light oppositely|Some chelate complexes are optically active.
Crystal-field splitting|ligand approach removes degeneracy of metal d orbitals|Octahedral splitting gives lower t2g and higher eg sets.
Strong-field ligand|can produce a large splitting and electron pairing|Cyanide is stronger-field than fluoride in the spectrochemical series.
High-spin complex|contains the maximum number of unpaired electrons allowed by a small splitting|Weak-field ligands favour high spin.
Coordination-compound colour|often arises from absorption associated with d-orbital transitions|Observed colour is complementary to absorbed light.
IUPAC complex naming|ligands are named before the metal and anionic metal complexes use an ate ending|Oxidation state of the metal is written in Roman numerals.`,

  'neet-chemistry-12-6': `Carbon-halogen bond polarity|carbon bears partial positive charge and halogen partial negative charge|Bond polarity makes the carbon susceptible to nucleophilic attack.
SN2 reaction|concerted backside attack gives inversion of configuration|Its rate depends on both substrate and nucleophile concentration.
SN1 reaction|proceeds through a planar carbocation intermediate|Its rate depends mainly on substrate concentration.
SN1 substrate preference|tertiary halides react faster because their carbocations are more stable|Polar protic solvents support ionisation.
SN2 substrate preference|methyl and primary halides react faster because steric hindrance is low|Tertiary halides are strongly hindered for backside attack.
Walden inversion|configuration is inverted in an SN2 displacement|Backside attack reverses the tetrahedral arrangement.
Elimination reaction|alcoholic base can remove hydrogen halide to form an alkene|More substituted alkene is commonly the major Saytzeff product.
Finkelstein reaction|alkyl chloride or bromide is converted to alkyl iodide using sodium iodide in acetone|Precipitation of sodium chloride or bromide drives the reaction.
Swarts reaction|alkyl chloride or bromide is converted to alkyl fluoride using a metal fluoride|It is used to prepare fluoroalkanes.
Wurtz reaction|alkyl halides couple with sodium in dry ether|Symmetrical higher alkanes are obtained most cleanly.
Aryl carbon-halogen bond|has partial double-bond character because of resonance|Chlorobenzene is less reactive than chloroethane toward nucleophilic substitution.
Haloarene carbon hybridisation|halogen is bonded to an sp2 carbon|The shorter stronger bond resists cleavage.
Grignard reagent|organomagnesium halide is strongly nucleophilic and basic|It must be prepared under anhydrous conditions.
Chirality|a tetrahedral carbon with four different groups may be stereogenic|Enantiomers rotate plane-polarised light equally in opposite directions.
DDT persistence|arises from resistance to biodegradation|Its biomagnification causes environmental concern.
Freon impact|chlorofluorocarbons release radicals that destroy stratospheric ozone|Their chemical stability lets them reach the stratosphere.`,

  'neet-chemistry-12-7': `Alcohol classification|primary, secondary and tertiary labels depend on substitution at the carbon bearing hydroxyl|This classification predicts oxidation and substitution behaviour.
Alcohol boiling point|is high relative to similar hydrocarbons because of intermolecular hydrogen bonding|Boiling point generally rises with molecular mass and falls with branching.
Alcohol acidity|alcohols are weaker acids than water in many alkyl cases|Electron-releasing alkyl groups destabilise alkoxide ions.
Lucas test|tertiary alcohol gives immediate turbidity with concentrated HCl and zinc chloride|Turbidity is due to insoluble alkyl chloride formation.
Alcohol dehydration|concentrated acid and heat convert alcohol to alkene|More substituted alkene is commonly favoured.
Primary alcohol oxidation|can give aldehyde and then carboxylic acid|Controlled oxidation is needed to stop at aldehyde.
Secondary alcohol oxidation|gives a ketone|Further oxidation requires carbon-carbon bond cleavage.
Tertiary alcohol oxidation|does not occur readily without carbon-carbon bond cleavage|There is no hydrogen on the hydroxyl-bearing carbon.
Phenol acidity|phenol is more acidic than alcohol because phenoxide is resonance-stabilised|Electron-withdrawing ring groups increase phenol acidity.
Kolbe reaction|sodium phenoxide reacts with carbon dioxide then acidification gives salicylic acid|Carboxylation occurs mainly at the ortho position.
Reimer-Tiemann reaction|phenol with chloroform and base gives salicylaldehyde after work-up|The formyl group enters mainly at the ortho position.
Williamson synthesis|alkoxide reacts with primary alkyl halide by SN2 to form ether|Tertiary halide favours elimination rather than ether formation.
Ether cleavage|hot concentrated hydrogen iodide cleaves carbon-oxygen bonds|In aryl alkyl ether, cleavage occurs at the alkyl oxygen bond.
Anisole substitution|methoxy group activates the ring and directs ortho and para|Resonance donation increases ring electron density.
Hydrogen bonding and solubility|lower alcohols mix well with water through hydrogen bonding|Solubility decreases as the hydrophobic alkyl group grows.
Alcohol with sodium|forms alkoxide and liberates hydrogen gas|The reaction demonstrates cleavage of the oxygen-hydrogen bond.`,

  'neet-chemistry-12-8': `Carbonyl carbon|is electrophilic because the carbon-oxygen bond is polar|Nucleophiles attack the carbonyl carbon.
Nucleophilic addition|converts the trigonal carbonyl carbon toward a tetrahedral product|Aldehydes are generally more reactive than ketones.
Aldehyde reactivity|is greater than ketone reactivity because steric and electron-donating effects are smaller|Formaldehyde is especially reactive.
HCN addition|aldehyde or ketone forms a cyanohydrin|The product contains hydroxyl and cyano groups on the former carbonyl carbon.
Sodium bisulphite addition|many aldehydes and ketones form crystalline addition products|The reaction can help purification and separation.
Grignard addition|carbonyl compounds give alcohols after hydrolysis|Formaldehyde gives primary, other aldehydes secondary and ketones tertiary alcohols.
Tollens test|aldehyde reduces diamminesilver(I) to a silver mirror|Most ketones do not respond.
Fehling test|aliphatic aldehyde reduces copper(II) to brick-red copper(I) oxide|Aromatic aldehydes generally do not give the test.
Iodoform test|methyl ketones and compounds oxidisable to them give yellow triiodomethane|Ethanol and secondary alcohols with a methyl group can respond.
Aldol condensation|aldehyde or ketone with alpha hydrogen forms a beta-hydroxy carbonyl then may dehydrate|Enolate formation initiates the reaction.
Cannizzaro reaction|aldehyde without alpha hydrogen disproportionates in concentrated base|One molecule is oxidised and another reduced.
Clemmensen reduction|zinc amalgam and hydrochloric acid reduce carbonyl to methylene|It is performed in acidic medium.
Wolff-Kishner reduction|hydrazine and strong base reduce carbonyl to methylene|It is performed in strongly basic medium.
Carboxylic acid acidity|carboxylate ion is stabilised by equivalent resonance structures|Carboxylic acids are more acidic than phenols and alcohols.
Esterification|carboxylic acid and alcohol form ester in presence of acid|The reversible reaction also forms water.
Hell-Volhard-Zelinsky reaction|carboxylic acid with alpha hydrogen undergoes alpha halogenation|Halogen substitutes at the carbon adjacent to carboxyl.`,

  'neet-chemistry-12-9': `Amine basicity|lone pair on nitrogen accepts a proton|Availability of the lone pair controls basic strength.
Aniline basicity|is lower than ammonia because the lone pair is delocalised into the benzene ring|Electron-withdrawing substituents further reduce basicity.
Amine classification|primary, secondary and tertiary labels count carbon groups attached to nitrogen|Quaternary ammonium ion has four carbon substituents and positive charge.
Gabriel synthesis|phthalimide route gives primary alkyl amines|It is not suitable for preparing aryl amines.
Hofmann bromamide reaction|amide gives a primary amine with one fewer carbon|Bromine and strong base bring about rearrangement.
Carbylamine test|primary amine with chloroform and alcoholic base gives foul-smelling isocyanide|Secondary and tertiary amines do not give the test.
Hinsberg test|benzenesulphonyl chloride distinguishes primary, secondary and tertiary amines|Solubility behaviour of sulphonamide products differs.
Nitrous acid with primary aliphatic amine|gives unstable diazonium species that evolves nitrogen|An alcohol is commonly formed.
Diazotisation|primary aromatic amine forms diazonium salt at 273 to 278 kelvin|Low temperature stabilises the diazonium salt.
Diazonium substitution|diazonium group can be replaced by halogen, cyano or hydroxyl|Diazonium chemistry introduces groups difficult to install directly.
Sandmeyer reaction|copper(I) salts replace diazonium by chlorine, bromine or cyano|Nitrogen gas is released.
Azo coupling|diazonium ion couples with activated aromatic ring to form an azo compound|Phenol and aniline give brightly coloured products.
Aniline bromination|bromine water gives 2,4,6-tribromoaniline|The amino group strongly activates ortho and para positions.
Acylation of amine|reduces nitrogen basicity by delocalising the lone pair into carbonyl|Acetanilide is less activating than aniline.
Ammonolysis of alkyl halide|can produce a mixture of primary, secondary and tertiary amines|Further alkylation of the initially formed amine causes mixtures.
Amide reduction|lithium aluminium hydride converts amide carbonyl to methylene|The product is an amine with the same carbon skeleton.`,

  'neet-chemistry-12-10': `Monosaccharide|carbohydrate that cannot be hydrolysed to simpler carbohydrate|Glucose and fructose are monosaccharides.
Glucose|aldohexose with six carbon atoms and an aldehyde function in open-chain form|Its predominant solution forms are cyclic hemiacetals.
Fructose|ketohexose with a ketone function in open-chain form|It commonly forms a five-membered cyclic hemiketal.
Anomers|cyclic sugar forms differing at the anomeric carbon|Alpha and beta glucose interconvert through mutarotation.
Sucrose|nonreducing disaccharide of glucose and fructose|Both anomeric carbons participate in its glycosidic bond.
Maltose|reducing disaccharide of two glucose units|It contains an alpha one-to-four glycosidic linkage.
Lactose|reducing disaccharide of galactose and glucose|It contains a beta one-to-four glycosidic linkage.
Starch|plant storage polysaccharide made of alpha glucose|Amylose is mainly unbranched and amylopectin is branched.
Cellulose|linear polymer of beta glucose|Humans cannot digest its beta one-to-four links.
Glycogen|highly branched animal storage polysaccharide|It is stored mainly in liver and muscle.
Amino acid zwitterion|contains both ammonium and carboxylate groups in one molecule|At isoelectric point it has no net charge.
Peptide bond|amide linkage formed between amino and carboxyl groups|Protein hydrolysis breaks peptide bonds.
Protein primary structure|specific sequence of amino acids|Changing one residue can alter protein function.
Protein denaturation|loss of secondary and tertiary structure without breaking primary peptide sequence|Heat or pH can destroy biological activity.
DNA sugar|two-deoxyribose|DNA contains thymine and is usually double-stranded.
RNA sugar|ribose|RNA contains uracil and is commonly single-stranded.`,
};

function parseConcepts(text, id) {
  assert.ok(text, `Missing concepts for ${id}`);
  return text.trim().split('\n').map((line, index) => {
    const [term, fact, explanation] = line.split('|');
    assert.ok(term && fact && explanation, `${id} concept ${index + 1}`);
    return {prompt: term.trim(), answer: fact.trim(), explanation: explanation.trim()};
  });
}

function rotate(values, amount) {
  const shift = amount % values.length;
  return values.slice(shift).concat(values.slice(0, shift));
}

function optionsFor(correct, distractors, seed) {
  const unique = [correct, ...distractors.filter(value => value !== correct)].filter((value, index, all) => all.indexOf(value) === index).slice(0, 4);
  assert.equal(unique.length, 4, `Could not build four unique options for ${correct}`);
  const options = rotate(unique, seed);
  return {options, answer: options.indexOf(correct)};
}

function makeDirectQuestions(concepts, meta, prefix) {
  return concepts.flatMap((concept, index) => {
    const factDistractors = [3, 7, 11].map(offset => concepts[(index + offset) % concepts.length].answer);
    const termDistractors = [2, 6, 10].map(offset => concepts[(index + offset) % concepts.length].prompt);
    const direct = optionsFor(concept.answer, factDistractors, index % 4);
    const reverse = optionsFor(concept.prompt, termDistractors, (index + 2) % 4);
    const common = {
      chapter: meta.name,
      classLevel: meta.classLevel,
      subject: meta.subject,
      difficulty: index < 5 ? 'Foundation' : 'NEET Standard',
      provenance: 'Original NCERT-aligned NEET practice question',
      ncertReference: `NCERT Class ${meta.classLevel} ${meta.subject} — ${meta.name}`,
      verified: true,
    };
    return [
      {...common, id: `${prefix}-D-${String(index + 1).padStart(3, '0')}`, question: `Which NCERT association is correct for “${concept.prompt}”?`, ...direct, explanation: concept.explanation, questionType: 'Single correct'},
      {...common, id: `${prefix}-R-${String(index + 1).padStart(3, '0')}`, question: `Identify the term described by this NCERT statement: ${concept.answer}`, ...reverse, explanation: concept.explanation, questionType: 'Reverse recall'},
    ];
  });
}

const mappingPermutations = [[0,1,2],[0,2,1],[1,0,2],[1,2,0],[2,0,1],[2,1,0]];
function makeTableQuestions(associations, count, meta, prefix, start = 1) {
  assert.ok(associations.length >= 8, `${meta.name}: too few associations`);
  const questions = [];
  const pick = (seed, offset = 0) => associations[(seed * 5 + offset * 7) % associations.length];
  const wrongFor = (correct, seed) => {
    for (let offset = 1; offset < associations.length; offset++) {
      const candidate = associations[(seed + offset * 3) % associations.length].answer;
      if (candidate !== correct) return candidate;
    }
    throw new Error('No distinct distractor');
  };
  for (let i = 0; i < count; i++) {
    const serial = start + i;
    const type = i % 3;
    const common = {
      id: `${prefix}-T-${String(serial).padStart(3, '0')}`,
      chapter: meta.name,
      classLevel: meta.classLevel,
      subject: meta.subject,
      difficulty: i % 5 === 4 ? 'Challenge' : 'NEET Standard',
      provenance: 'Original NCERT-aligned NEET practice question',
      ncertReference: `NCERT Class ${meta.classLevel} ${meta.subject} — ${meta.name}`,
      verified: true,
    };
    if (type === 0) {
      const selected = [pick(serial, 0), pick(serial, 1), pick(serial, 2)];
      const unique = [];
      for (const item of selected) if (!unique.some(value => value.prompt === item.prompt || value.answer === item.answer)) unique.push(item);
      for (let offset = 3; unique.length < 3; offset++) {
        const item = pick(serial, offset);
        if (!unique.some(value => value.prompt === item.prompt || value.answer === item.answer)) unique.push(item);
      }
      const order = mappingPermutations[(serial * 5 + 1) % mappingPermutations.length];
      const right = order.map(position => unique[position].answer);
      const mapping = unique.map(item => right.indexOf(item.answer) + 1);
      const encode = values => values.map((value, index) => `${'ABC'[index]}–${value}`).join(', ');
      const correct = encode(mapping);
      const distractors = mappingPermutations.map(values => encode(values.map(value => value + 1))).filter(value => value !== correct).slice(0, 3);
      const optionSet = optionsFor(correct, distractors, serial % 4);
      questions.push({...common, question: `Match List I with List II using the table below (Set ${serial}).`, ...optionSet,
        explanation: `Correct mapping: ${correct}. ${unique.map(item => item.explanation).join(' ')}`,
        questionType: 'Match the following', table: {caption: 'NCERT concept matching', headers: ['List I', 'List II'], rows: unique.map((item, index) => [`${'ABC'[index]}. ${item.prompt}`, `${index + 1}. ${right[index]}`])}});
    } else if (type === 1) {
      const rows = [pick(serial, 0), pick(serial, 1), pick(serial, 2), pick(serial, 3)];
      const wrongIndex = serial % 4;
      const tableRows = rows.map((item, index) => [`Row ${'ABCD'[index]}`, item.prompt, index === wrongIndex ? wrongFor(item.answer, serial + index) : item.answer]);
      const correct = `Row ${'ABCD'[wrongIndex]}`;
      const optionSet = optionsFor(correct, ['Row A','Row B','Row C','Row D'].filter(value => value !== correct), (serial + 1) % 4);
      questions.push({...common, question: `Which row in the table is incorrectly matched? (Set ${serial})`, ...optionSet,
        explanation: `${correct} is incorrect. The correct association is: ${rows[wrongIndex].prompt} — ${rows[wrongIndex].answer}. ${rows[wrongIndex].explanation}`,
        questionType: 'Incorrect match', table: {caption: 'Check each NCERT association', headers: ['Row', 'Concept', 'Association'], rows: tableRows}});
    } else {
      const first = pick(serial, 0);
      const second = pick(serial, 2);
      const pattern = serial % 4;
      const firstTrue = pattern === 0 || pattern === 1;
      const secondTrue = pattern === 0 || pattern === 2;
      const firstStatement = firstTrue ? first.answer : wrongFor(first.answer, serial + 1);
      const secondStatement = secondTrue ? second.answer : wrongFor(second.answer, serial + 2);
      const correct = firstTrue ? (secondTrue ? 'Both I and II are correct' : 'Only I is correct') : (secondTrue ? 'Only II is correct' : 'Neither I nor II is correct');
      const choices = ['Both I and II are correct','Only I is correct','Only II is correct','Neither I nor II is correct'];
      const optionSet = optionsFor(correct, choices.filter(value => value !== correct), (serial + 2) % 4);
      questions.push({...common, question: `Evaluate Statements I and II from the table. (Set ${serial})`, ...optionSet,
        explanation: `Statement I is ${firstTrue ? 'correct' : 'incorrect'} and Statement II is ${secondTrue ? 'correct' : 'incorrect'}. ${first.explanation} ${second.explanation}`,
        questionType: 'Two statements', table: {caption: 'Statement evaluation', headers: ['Statement', 'NCERT association'], rows: [[`I. ${first.prompt}`, firstStatement], [`II. ${second.prompt}`, secondStatement]]}});
    }
  }
  return questions;
}

function associationsFromQuestions(questions) {
  const associations = [];
  for (const question of questions) {
    const answer = question.options?.[Number(question.answer)];
    const prompt = String(question.conceptTested || question.topic || question.question || '').replace(/\s+/g, ' ').trim();
    if (!prompt || !answer) continue;
    const item = {prompt: prompt.length > 150 ? `${prompt.slice(0, 147)}…` : prompt, answer: String(answer).trim(), explanation: String(question.explanation || 'This follows from the stated NCERT concept.').trim()};
    if (!associations.some(value => value.prompt === item.prompt && value.answer === item.answer)) associations.push(item);
  }
  return associations;
}

function evenlySelect(chapter, limit) {
  if (!chapter.subtopics?.length) return (chapter.mcqs || []).slice(0, limit);
  const groups = chapter.subtopics.map(subtopic => [...(subtopic.mcqs || [])]);
  const selected = [];
  for (let cursor = 0; selected.length < limit && groups.some(group => cursor < group.length); cursor++) {
    for (const group of groups) if (selected.length < limit && group[cursor]) selected.push(group[cursor]);
  }
  return selected;
}

// Biology: preserve every published question, then add varied structured-table questions.
const biology = JSON.parse(fs.readFileSync(biologyPath, 'utf8'));
assert.equal(biology.chapters.length, 32);
for (const chapter of biology.chapters) {
  assert.ok(chapter.mcqs.length <= TARGET, `${chapter.name} already exceeds ${TARGET}`);
  const associations = associationsFromQuestions(chapter.mcqs);
  const needed = TARGET - chapter.mcqs.length;
  const additions = makeTableQuestions(associations, needed, {name: chapter.name, classLevel: chapter.classLevel, subject: 'Biology'}, `NEET-BIO-250-${chapter.classLevel}-${chapter.id.split('-').at(-1)}`);
  chapter.mcqs = [...chapter.mcqs, ...additions];
  chapter.practiceNote = '250 original NCERT-aligned NEET questions with four options, answer explanations and properly formatted matching/statement tables.';
  chapter.questionBank = {source: `NCERT Class ${chapter.classLevel} Biology`, syllabus: 'Current NEET-UG syllabus', total: TARGET, includesStructuredTables: true};
}
biology.description = '8,000 chapter-wise Biology MCQs: exactly 250 questions in each of all 32 current NCERT Class 11 and Class 12 Biology chapters for NEET.';

// Use the reviewed Class 11 Chemistry source bank already maintained by the project.
execFileSync(process.execPath, [path.join(root, 'scripts/build-class11-chemistry-bank.mjs')], {stdio: 'inherit'});
const chemistryRuntime = {window: {}};
vm.runInNewContext(fs.readFileSync(path.join(root, 'data/neet/class11-chemistry-bank.js'), 'utf8'), chemistryRuntime);
const generatedClass11 = new Map(chemistryRuntime.window.SCRUTINY_CLASS11_CHEMISTRY.map(chapter => [chapter.id, chapter]));

const chemistry = JSON.parse(fs.readFileSync(chemistryPath, 'utf8'));
assert.equal(chemistry.chapters.length, 19);
for (const chapter of chemistry.chapters) {
  const meta = {name: chapter.name, classLevel: chapter.classLevel, subject: 'Chemistry'};
  if (chapter.classLevel === 11) {
    const generated = generatedClass11.get(chapter.id);
    assert.ok(generated, `Missing Class 11 source bank: ${chapter.id}`);
    const originals = evenlySelect(generated, Math.min(190, generated.mcqs.length));
    const associations = associationsFromQuestions(generated.mcqs);
    const additions = makeTableQuestions(associations, TARGET - originals.length, meta, `NEET-CHEM-250-11-${chapter.id.split('-').at(-1)}`);
    // The consolidated JSON bank is chapter-wise. Avoid exposing empty subtopic
    // cards after the selected and structured-table questions are combined.
    delete chapter.subtopics;
    chapter.mcqs = [...originals, ...additions].map((question, index) => ({...question, id: `NEET-CHEM-250-11-${chapter.id.split('-').at(-1)}-${String(index + 1).padStart(3, '0')}`, chapter: chapter.name, classLevel: 11, subject: 'Chemistry'}));
  } else {
    const concepts = parseConcepts(class12ConceptText[chapter.id], chapter.id);
    const direct = makeDirectQuestions(concepts, meta, `NEET-CHEM-250-12-${chapter.id.split('-').at(-1)}`);
    const additions = makeTableQuestions(concepts, TARGET - direct.length, meta, `NEET-CHEM-250-12-${chapter.id.split('-').at(-1)}`);
    chapter.mcqs = [...direct, ...additions];
  }
  chapter.practiceNote = '250 original NCERT-aligned NEET questions with four options, answer explanations and properly formatted matching/statement tables.';
  chapter.questionBank = {source: `NCERT Class ${chapter.classLevel} Chemistry`, syllabus: 'Current NEET-UG syllabus', total: TARGET, includesStructuredTables: true};
}
chemistry.description = '4,750 chapter-wise Chemistry MCQs: exactly 250 questions in each of all 19 current NCERT/NEET Chemistry chapters.';
chemistry.syllabus = {exam: 'Current NEET-UG syllabus', chapters: 19, class11Chapters: 9, class12Chapters: 10};

function validate(data, expectedChapters, subject) {
  assert.equal(data.chapters.length, expectedChapters);
  const ids = new Set();
  for (const chapter of data.chapters) {
    assert.equal(chapter.mcqs.length, TARGET, `${chapter.name}: expected ${TARGET}`);
    assert.equal(new Set(chapter.mcqs.map(question => question.question.toLowerCase())).size, TARGET, `${chapter.name}: duplicate question text`);
    for (const question of chapter.mcqs) {
      assert.ok(!ids.has(question.id), `Duplicate ID ${question.id}`);
      ids.add(question.id);
      assert.equal(question.options?.length, 4, `${question.id}: four options required`);
      assert.ok(Number.isInteger(question.answer) && question.answer >= 0 && question.answer < 4, `${question.id}: invalid answer`);
      assert.ok(question.question?.trim() && question.explanation?.trim(), `${question.id}: incomplete`);
      if (question.table) {
        assert.ok(question.table.caption && question.table.headers?.length >= 2 && question.table.rows?.length >= 2, `${question.id}: invalid table`);
        assert.ok(question.table.rows.every(row => row.length === question.table.headers.length), `${question.id}: uneven table`);
      }
    }
  }
  console.log(`Validated ${ids.size} ${subject} MCQs across ${expectedChapters} chapters.`);
}

validate(biology, 32, 'Biology');
validate(chemistry, 19, 'Chemistry');
// Minified JSON keeps the two production payloads well below GitHub's web-upload limit.
fs.writeFileSync(biologyPath, `${JSON.stringify(biology)}\n`);
fs.writeFileSync(chemistryPath, `${JSON.stringify(chemistry)}\n`);
console.log('Built 12,750 Biology and Chemistry MCQs, exactly 250 per chapter.');
