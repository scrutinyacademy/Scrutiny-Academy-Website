// Chapter-specific reference facts. Rows: concept, three attributes in field order.
// Kept separate from generator logic so every fact can be reviewed and corrected.
export const tables={physics:[],biology:[],'social-science':[]};
function add(subject,fields,text){
 const rows=text.trim().split('\n').map(line=>line.split('|'));
 if(rows.some(row=>row.length!==4||row.some(v=>!v.trim())))throw Error(text);
 tables[subject].push({fields,rows});
}
add('physics',['optical description','image or geometric property','usual application or association'],`
Concave mirror|A converging spherical mirror|Can form real or virtual images of a real object|A shaving mirror when the face is within the focus
Convex mirror|A diverging spherical mirror|Forms a diminished erect virtual image of a real object|A vehicle rear-view mirror
Plane mirror|A flat reflecting surface|Forms a same-size virtual image of a real object|A dressing mirror
Principal focus of a concave mirror|Meeting point of reflected paraxial rays incident parallel to the axis|Lies in front of the mirror|A distant object's image forms close to this point
Centre of curvature|Centre of the sphere of which a spherical mirror is a part|Its distance from the pole is the radius of curvature|A ray through it is reflected back along its path
Pole of a spherical mirror|Geometric centre of the reflecting surface|The principal axis passes through it|The origin for Cartesian mirror distances
Object at the centre of curvature of a concave mirror|An object placed at twice the focal distance|Produces a real inverted image of equal size|Image forms at the centre of curvature
Object between focus and pole of a concave mirror|An object inside the focal length|Produces an erect enlarged virtual image|Image appears behind the mirror
Object at the focus of a concave mirror|An object placed at the principal focal point|Reflected rays emerge parallel in the paraxial model|A parallel reflected beam is used in reflectors
`);
add('physics',['reaction classification','defining change','representative equation'],`
Combination reaction|Two or more reactants form one principal product|Several substances combine into one compound|CaO + H₂O → Ca(OH)₂
Thermal decomposition|A compound breaks down on heating|Heat supplies energy for breakdown|CaCO₃ → CaO + CO₂
Photochemical decomposition|Light causes a compound to break down|Light energy drives decomposition|2AgCl → 2Ag + Cl₂
Displacement reaction|A more reactive element replaces another|An element displaces a less reactive one from a compound|Zn + CuSO₄ → ZnSO₄ + Cu
Double displacement|Ions are exchanged between compounds|Two compounds exchange their ionic partners|Na₂SO₄ + BaCl₂ → BaSO₄ + 2NaCl
Neutralisation|Acid and base react to form salt and water|Hydrogen and hydroxide ions combine to form water|HCl + NaOH → NaCl + H₂O
Reduction of copper oxide by hydrogen|A redox reaction involving oxygen transfer|Copper oxide loses oxygen while hydrogen gains it|CuO + H₂ → Cu + H₂O
Combustion of methane|An exothermic oxidation reaction|Methane reacts completely with oxygen|CH₄ + 2O₂ → CO₂ + 2H₂O
Electrolytic decomposition of water|Electrical energy breaks down water|Hydrogen and oxygen form in a 2:1 volume ratio|2H₂O → 2H₂ + O₂
`);
add('physics',['chemical formula','common name or identity','main textbook use or property'],`
Sodium chloride|NaCl|Common salt|Raw material for several sodium compounds
Sodium hydroxide|NaOH|Caustic soda|A strong base used in soap manufacture
Sodium hydrogen carbonate|NaHCO₃|Baking soda|Releases carbon dioxide on heating
Sodium carbonate decahydrate|Na₂CO₃·10H₂O|Washing soda|Used in cleaning and softening hard water
Calcium oxychloride|CaOCl₂|Bleaching powder|Used for bleaching and disinfection
Calcium sulfate hemihydrate|CaSO₄·½H₂O|Plaster of Paris|Sets into a hard mass when mixed with water
Calcium sulfate dihydrate|CaSO₄·2H₂O|Gypsum|Starting material for preparing Plaster of Paris
Hydrochloric acid|HCl|An acid present in gastric juice|Turns blue litmus red in aqueous solution
Calcium hydroxide|Ca(OH)₂|Slaked lime|Its clear aqueous solution tests for carbon dioxide
`);
add('physics',['lens or optical quantity','standard property or relation','specific association'],`
Convex lens|A lens thicker at the centre than at the edges|Converges parallel paraxial rays in air|Can produce a real inverted image of a distant object
Concave lens|A lens thinner at the centre than at the edges|Diverges parallel rays in air|Produces a virtual diminished image of a real object
Optical centre of a thin lens|A central point of the lens|A ray through it is approximately undeviated|Used to construct lens ray diagrams
Power of a lens|Reciprocal of focal length in metres|P = 1/f|Measured in dioptres
Positive lens power|Power of a converging lens in air|Focal length is positive in the Cartesian convention|A +2 D lens has focal length +0.5 m
Negative lens power|Power of a diverging lens in air|Focal length is negative in the Cartesian convention|A −2 D lens has focal length −0.5 m
Thin-lens formula|Relation between object distance, image distance and focal length|1/f = 1/v − 1/u|Distances use a consistent Cartesian sign convention
Linear lens magnification|Ratio of image height to object height|m = v/u|Negative magnification indicates an inverted image
Lenses in contact|A combination of thin lenses with negligible separation|Equivalent power equals the sum of individual powers|A +3 D lens and −1 D lens combine to +2 D
`);
add('physics',['primary description','mechanism or optical cause','correction or consequence'],`
Myopia|Distant objects appear blurred|Distant-object image forms before the retina|Corrected using a suitable concave lens
Hypermetropia|Nearby objects appear blurred|Near-object image tends to form behind the retina|Corrected using a suitable convex lens
Presbyopia|Age-related difficulty focusing on near objects|Accommodation declines with age|Suitable reading or multifocal lenses may be required
Accommodation|Adjustment of eye-lens power for different object distances|Ciliary muscles change lens curvature|Near vision normally requires greater lens power
Dispersion|Separation of white light into component colours|Refractive index varies with wavelength|A prism can produce a spectrum
Atmospheric refraction|Bending of light through changing atmospheric density|Air layers have different refractive indices|Contributes to the apparent twinkling of stars
Scattering by air molecules|Redirection of light by atmospheric molecules|Shorter visible wavelengths scatter more strongly|Helps explain a blue daytime sky
Reddish Sun near the horizon|The direct sunlight is relatively depleted of shorter wavelengths|A longer atmospheric path scatters more blue light away|Red and orange components become relatively prominent
Cataract|Clouding of the eye's lens|The normally transparent lens becomes opaque|Spectacle power alone does not remove the opacity
`);
add('physics',['physical identity','charge or defining property','location or standard association'],`
Proton|A positively charged nuclear particle|Charge +1 elementary unit|Its count defines atomic number
Neutron|An electrically neutral nuclear particle|Zero electric charge|Its count contributes to mass number
Electron|A negatively charged subatomic particle|Charge −1 elementary unit|Occupies allowed states outside the nucleus
Atomic number|The number of protons in a nucleus|Represented by Z|Equals electron count in a neutral atom
Mass number|The total number of protons and neutrons|Represented by A|Neutron count equals A − Z
Isotopes|Atoms of one element with different neutron counts|Same atomic number but different mass numbers|Have the same proton count
s subshell|A subshell with one orbital|Holds at most two electrons|Associated with angular momentum quantum number l = 0
p subshell|A subshell with three orbitals|Holds at most six electrons|Associated with angular momentum quantum number l = 1
d subshell|A subshell with five orbitals|Holds at most ten electrons|Associated with angular momentum quantum number l = 2
`);
add('physics',['periodic-table description','outer-electron or trend feature','representative example or consequence'],`
Group 1|Alkali-metal group apart from hydrogen's special placement|Main-group members have one valence electron|Sodium commonly forms Na⁺
Group 2|Alkaline-earth-metal group|Main-group members have two valence electrons|Magnesium commonly forms Mg²⁺
Group 17|Halogen group|Main-group members have seven valence electrons|Chlorine commonly forms Cl⁻
Group 18|Noble-gas group|Filled valence shells, with helium's duplet exception|Neon has electron distribution 2,8
Period number|A horizontal-row identifier|Corresponds to the occupied principal-shell count in the ground-state school model|Sodium belongs to period 3
Atomic radius across a period|Generally decreases from left to right|Nuclear attraction increases while electrons enter the same main shell|Sodium is larger than chlorine as a neutral atom
Atomic radius down a group|Generally increases|Additional occupied shells increase size|Potassium is larger than sodium
Metallic character across a period|Generally decreases from left to right|Electron loss becomes less favourable overall|Sodium is more metallic than sulfur
Electron loss by sodium|Formation of a positive ion|The outer third-shell electron is removed|Na⁺ has a smaller radius than Na
`);
add('physics',['bonding description','electron or structural feature','characteristic example or property'],`
Ionic bond|Electrostatic attraction between oppositely charged ions|Electron transfer produces cations and anions|Sodium chloride contains Na⁺ and Cl⁻
Single covalent bond|Sharing of one electron pair|Two electrons form the shared pair|The H₂ molecule has one single bond
Double covalent bond|Sharing of two electron pairs|Four electrons participate in the shared pairs|The O₂ molecule has a double bond
Triple covalent bond|Sharing of three electron pairs|Six electrons participate in the shared pairs|The N₂ molecule has a triple bond
Sodium chloride crystal|An extended ionic lattice|Ions are fixed in place in the solid|Conducts when molten because ions become mobile
Magnesium oxide formation|An ionic-bonding example|Magnesium transfers two electrons to oxygen|Mg²⁺ and O²⁻ are formed
Water molecule|A bent polar covalent molecule|O−H bond dipoles do not cancel|Has a net molecular dipole despite being neutral
Methane molecule|A tetrahedral covalent molecule|Carbon shares four electron pairs with four hydrogen atoms|Has four C−H single bonds
Carbon dioxide molecule|A linear covalent molecule|Carbon forms a double bond with each oxygen|Its symmetric bond dipoles cancel
`);
add('physics',['physical meaning','SI unit','formula with the named quantity isolated on the left'],`
Electric current|Rate of flow of charge|Ampere|I = Q/t
Potential difference|Work done per unit charge|Volt|V = W/Q
Resistance|Opposition quantified by voltage divided by current for a circuit element|Ohm|R = V/I
Resistivity|Material-dependent factor in a uniform wire's resistance|Ohm metre|ρ = RA/L
Electric power|Rate of electrical energy transfer|Watt|P = VI
Electrical energy|Electrical work transferred over time|Joule|E = VIt
Charge|Quantity transferred by an electric current over time|Coulomb|Q = It
Conductance|Reciprocal of electrical resistance|Siemens|G = 1/R
Heat produced in a resistor|Joule heating during current flow|Joule|H = I²Rt
`);
add('physics',['main physical principle','key condition or feature','specific device or rule association'],`
Magnetic field around a straight current-carrying wire|Current produces a circular magnetic field|Field direction reverses when current reverses|Right-hand thumb rule
Magnetic force on a straight wire|A current in a magnetic field experiences force|For a perpendicular wire, F = BIL|Fleming's left-hand rule gives the motor-force direction
Electric motor|Electrical energy is converted into mechanical energy|Magnetic forces create torque on a coil|A split-ring commutator is used in a simple DC motor
Electric generator|Mechanical energy is converted into electrical energy|Changing magnetic flux induces emf|A simple AC generator uses slip rings
Electromagnetic induction|A changing magnetic flux produces emf|A stationary coil with unchanging flux has no induced emf from that flux|Faraday's principle
Lenz's law|Induced current opposes the change producing it|Its direction is consistent with energy conservation|An approaching magnet can be opposed by the coil's induced field
Solenoid|A long coil carrying electric current|Its field resembles that of a bar magnet|A soft-iron core can strengthen an electromagnet
Force on a wire parallel to a field|The magnetic force is zero|The current direction has angle 0° or 180° to the field|F = BIL sin θ explains the zero value
Electromagnet|A current-produced temporary magnet|Magnetism can be controlled through the current|Used in devices such as an electric bell
`);
add('physics',['process or material description','essential condition or purpose','representative association'],`
Ore|A mineral deposit suitable for economically viable extraction|Metal recovery must be feasible under the conditions|Bauxite is an important aluminium ore
Gangue|Unwanted earthy material mixed with ore|It is removed during processing|Sand and rocky impurities are common examples
Roasting|Heating an ore in excess air|Commonly converts sulfides to oxides|Zinc sulfide can form zinc oxide and sulfur dioxide
Calcination|Heating an ore with limited or no air|Commonly removes carbon dioxide from carbonates|Zinc carbonate can form zinc oxide and carbon dioxide
Flux|A substance added to react with gangue|Helps produce removable slag|Limestone-derived lime can react with silica
Slag|Material formed when flux reacts with gangue|Helps separate impurities from the metal|Calcium silicate is a common textbook example
Electrolytic extraction|Decomposition of a compound using electricity|Suitable for highly reactive metals whose compounds resist ordinary carbon reduction|Used in aluminium extraction
Electrolytic refining of copper|Purification through electrolysis|Copper deposits on a pure-copper cathode|Impure copper is used as the anode
Alloy|A mixture containing a metal and other element or elements|Composition changes useful material properties|Brass contains copper and zinc
`);
add('physics',['chemical identity or group','structural or reaction feature','characteristic example or use'],`
Methane|An alkane with formula CH₄|Contains four single C−H bonds|A major component of natural gas
Ethane|An alkane with formula C₂H₆|Contains a carbon-carbon single bond|A saturated hydrocarbon
Ethene|An alkene with formula C₂H₄|Contains a carbon-carbon double bond|Can undergo addition reactions
Ethyne|An alkyne with formula C₂H₂|Contains a carbon-carbon triple bond|An unsaturated hydrocarbon with two carbon atoms
Ethanol|An alcohol with formula C₂H₅OH|Contains a hydroxyl functional group|Can be oxidised to ethanoic acid
Ethanoic acid|A carboxylic acid with formula CH₃COOH|Contains the −COOH functional group|Dilute aqueous solution is associated with vinegar
Esterification|Reaction of an alcohol with a carboxylic acid|An ester and water are formed|Ethanol and ethanoic acid form ethyl ethanoate
Hydrogenation|Addition of hydrogen to an unsaturated compound|Often uses a metal catalyst such as nickel|Used to convert some unsaturated oils into more saturated fats
Soap action in hard water|Calcium and magnesium ions react with soap|Insoluble salts form scum|Cleaning efficiency falls because some soap is consumed
`);
add('biology',['main site of action','principal substrate','main digestion product or effect'],`
Salivary amylase|Mouth|Starch|Begins conversion of starch into simpler sugars
Pepsin|Stomach|Proteins|Breaks proteins into smaller peptides
Pancreatic amylase|Small intestine|Starch|Continues digestion of starch into simpler sugars
Trypsin|Small intestine|Proteins and polypeptides|Produces smaller peptide fragments
Pancreatic lipase|Small intestine|Fats|Produces fatty acids and glycerol in the school-level account
Maltase|Small intestine|Maltose|Produces glucose
Sucrase|Small intestine|Sucrose|Produces glucose and fructose
Lactase|Small intestine|Lactose|Produces glucose and galactose
Bile salts|Small intestine|Large fat globules|Emulsify fat without enzymatically digesting it
`);
add('biology',['biological description','main site or organism','main product or physical effect'],`
Glycolysis|Initial enzymatic breakdown of glucose|Cytoplasm|Pyruvate and a small net ATP gain
Aerobic oxidation after glycolysis|Oxygen-dependent energy-releasing stages|Mitochondria|Carbon dioxide, water and a large additional ATP yield
Alcoholic fermentation|Anaerobic conversion of pyruvate in yeast|Yeast cells|Ethanol and carbon dioxide
Lactic acid formation|Anaerobic pathway during oxygen shortage in muscles|Muscle-cell cytoplasm|Lactate with a small ATP yield from glycolysis
Inhalation|Movement of air into the lungs|Thoracic cavity and respiratory passages|Thoracic volume increases as the diaphragm contracts
Exhalation at rest|Movement of air out of the lungs|Thoracic cavity and respiratory passages|Thoracic volume decreases as the diaphragm relaxes
Alveolar gas exchange|Diffusion between air spaces and blood|Alveolar-capillary surface|Oxygen enters blood while carbon dioxide leaves it
Tissue gas exchange|Diffusion between blood and body cells|Systemic tissue capillaries|Oxygen leaves blood while carbon dioxide enters it
Breathing through gills|Exchange of dissolved respiratory gases|Fish gill surfaces|Dissolved oxygen enters the blood from water
`);
add('biology',['structure or component type','usual direction, location or content','principal function'],`
Aorta|A systemic artery|Leaves the left ventricle|Carries oxygenated blood into systemic circulation
Vena cava|A major systemic vein|Enters the right atrium|Returns deoxygenated blood from the body
Pulmonary artery|An artery of pulmonary circulation|Leaves the right ventricle|Carries deoxygenated blood to the lungs
Pulmonary vein|A vein of pulmonary circulation|Enters the left atrium|Returns oxygenated blood from the lungs
Red blood cell|A haemoglobin-containing blood cell|Circulates within blood vessels|Transports much of the blood's oxygen
Platelet|A blood-cell fragment involved in haemostasis|Circulates in blood plasma|Helps blood clot at injured vessels
Xylem|A plant conducting tissue for water and minerals|Connects roots with aerial parts|Conducts water and mineral ions mainly upwards
Phloem|A plant conducting tissue for organic food|Links source tissues with sink tissues|Translocates organic nutrients according to source-sink needs
Stomatal pore|An opening regulated by guard cells|Leaf epidermis|Permits gas exchange and water-vapour loss
`);
add('biology',['anatomical or physiological identity','site or direction','specific role'],`
Glomerulus|A tuft of blood capillaries|Inside Bowman's capsule|Filters fluid from blood under pressure
Bowman's capsule|A cup-shaped nephron structure|Surrounds the glomerulus|Collects the initial filtrate
Renal tubule|A tubular part of the nephron|Extends from Bowman's capsule|Modifies filtrate by reabsorption and secretion
Collecting duct|A urine-collecting tube in the kidney|Receives fluid from multiple nephrons|Carries modified fluid towards the renal pelvis
Ureter|A muscular tube carrying urine|From kidney to bladder|Propels urine into the bladder
Urinary bladder|A muscular storage organ|Between the ureters and urethra in the urinary route|Temporarily stores urine
Urethra|The tube for urine discharge|From bladder towards the exterior|Conducts urine out of the body
Urea|A major human nitrogenous waste|Formed mainly in the liver and removed by kidneys|Disposes of nitrogen from amino-acid breakdown
Dialysis membrane|A selectively permeable artificial barrier|Between blood and dialysis fluid|Allows selected wastes and small solutes to move across it
`);
add('biology',['signal or structural identity','usual source or location','principal role'],`
Sensory neuron|A nerve cell carrying incoming information|Between receptors and the central nervous system|Conducts impulses towards a central processing region
Motor neuron|A nerve cell carrying outgoing information|Between the central nervous system and an effector|Conducts impulses towards a muscle or gland
Synapse|A junction between signalling cells|Between a neuron's ending and the next cell|Transfers a signal, often by a neurotransmitter
Cerebrum|A major forebrain region|Upper main part of the brain|Supports conscious perception and voluntary control
Cerebellum|A hindbrain region|Posterior part of the brain|Coordinates balance and precise movement
Medulla oblongata|A brainstem region|Continuous with the spinal cord|Helps regulate vital involuntary functions
Insulin|A blood-glucose-lowering hormone|Pancreatic beta cells|Promotes glucose uptake and storage
Adrenaline|An emergency-response hormone|Adrenal medulla|Prepares multiple organs for rapid action
Auxin|A plant growth regulator|Produced especially in young growing tissues|Promotes shoot-cell elongation and contributes to tropic bending
`);
add('biology',['process or structure identity','main participant or site','immediate result or role'],`
Binary fission in Amoeba|Asexual division of a single parent cell|Amoeba|Produces two daughter individuals
Budding in Hydra|Asexual outgrowth from the parent body|Hydra|A bud grows and can detach as a new individual
Spore formation in Rhizopus|Asexual production of dispersal cells|Sporangia of bread mould|Spores can germinate under favourable conditions
Vegetative propagation by a potato|Asexual growth from a stem tuber|Eyes or buds on the potato tuber|A bud develops into a new plant
Pollination|Transfer of pollen|From anther to stigma|Positions pollen where fertilisation can later be enabled
Fertilisation in flowering plants|Fusion involving male and female gametes|Ovule inside the ovary|A zygote is formed
Human sperm production|Formation of male gametes|Seminiferous tubules of the testes|Produces sperm cells
Human fertilisation|Fusion of sperm and egg|Usually in the oviduct|Produces a diploid zygote
Implantation|Embedding of an early embryo|Uterine lining|Establishes the developing embryo in the uterus
`);
add('biology',['digestive-system role','normal location or source','specific contribution'],`
Salivary glands|Glands secreting saliva|Around the oral cavity|Moisten food and provide salivary amylase
Tongue|A muscular oral organ|Floor of the oral cavity|Mixes food and assists swallowing
Epiglottis|A protective flap involved in swallowing|At the laryngeal entrance|Helps keep swallowed food out of the airway
Oesophagus|A muscular food-conducting tube|Between pharynx and stomach|Moves swallowed food by peristalsis
Stomach|A muscular chamber for storage and mixing|Between oesophagus and small intestine|Mixes food with acidic gastric secretion
Liver|A gland that produces bile|Upper abdomen|Supplies bile for fat emulsification after delivery to the intestine
Gallbladder|A bile-storage organ|Beneath the liver|Stores and concentrates bile between meals
Pancreas|A gland contributing digestive enzymes|Behind the stomach|Releases enzyme-containing secretion into the small intestine
Intestinal villi|Finger-like absorptive projections|Lining of the small intestine|Increase surface area for absorption of nutrients
`);
add('biology',['genetic or evolutionary description','defining relationship','representative implication'],`
Alleles|Alternative versions of a gene|Occupy the same locus on homologous chromosomes|A heterozygote carries different alleles at that locus
Homozygous genotype|Two identical alleles at a locus|Examples include TT and tt|Produces one allele type at that locus in gametes
Heterozygous genotype|Two different alleles at a locus|A typical example is Tt|Produces T-bearing and t-bearing gametes
Dominant allele in complete dominance|An allele expressed in a heterozygote|Its phenotype masks the recessive allele in that model|Tt can show the same tall phenotype as TT
Recessive allele in complete dominance|An allele masked in the heterozygote|Its phenotype appears in the corresponding homozygote|tt can produce the dwarf phenotype
Monohybrid Tt × Tt cross|A cross tracking one gene with two alleles|Genotype ratio is 1 TT : 2 Tt : 1 tt|The complete-dominance phenotype ratio is 3:1
Homologous organs|Structures sharing an inherited structural plan|Functions may differ despite common ancestry|Human forelimb and whale flipper are examples
Analogous organs|Structures with similar functions but different evolutionary origins|Similar function need not indicate the same structural ancestry|Bird and insect wings illustrate the distinction
Natural selection|Differential reproduction associated with heritable variation|Useful variants can increase in a particular environment|Population composition can change across generations
`);
add('biology',['ecological identity','role or position','specific example or consequence'],`
Producer|An organism that makes organic food from inorganic materials|Usually the first trophic level|Green plants support many terrestrial food chains
Primary consumer|An organism feeding on producers|Usually the second trophic level|A grass-eating deer is an example
Secondary consumer|An organism feeding on primary consumers|Usually the third trophic level|A frog eating herbivorous insects is an example
Decomposer|An organism breaking down dead organic matter|Contributes to nutrient recycling|Many bacteria and fungi perform this role
Food chain|A linear sequence of feeding transfers|Shows one route for matter and energy transfer|Grass → deer → tiger is an example
Food web|A network of interconnected feeding relationships|Combines multiple linked food chains|A consumer may have several food sources
Biomagnification|Increasing concentration of some persistent pollutants up food chains|Higher consumers can accumulate more pollutant per unit mass|Persistent pesticides can threaten top predators
Ozone layer|A region of the stratosphere relatively rich in ozone|Absorbs much harmful ultraviolet radiation|Its depletion can increase UV exposure at Earth's surface
Biodegradable waste|Material decomposable through biological action|Can enter natural decomposition processes|Vegetable peels can be composted under suitable conditions
`);
add('biology',['resource or management category','key characteristic','appropriate example or implication'],`
Solar energy|A renewable energy flow|Continually supplied on human timescales|Can be captured using solar devices
Coal|A non-renewable fossil fuel|Forms over geological timescales|Burning it releases stored carbon into the atmosphere
Groundwater|Water stored in subsurface pores and fractures|Can be depleted when withdrawal exceeds recharge|Recharge and pumping need coordinated management
Rainwater harvesting|A water-conservation practice|Collects rainfall for storage or recharge|Rooftop collection can support local water availability
Watershed management|Planning linked land and water use in a drainage area|Upstream activities can affect downstream water and sediment|Contour bunds and vegetation can slow runoff
Biodiversity|Variety of life across genetic, species and ecosystem levels|Contributes to ecosystem functioning and resilience|Conservation includes habitats as well as individual species
Reduce|Avoidance of unnecessary material consumption|Prevents waste before it is generated|Refusing needless disposable packaging is an example
Reuse|Using an item again without full material reprocessing|Extends a product's useful life|Refilling a durable bottle is an example
Recycle|Reprocessing discarded material into usable material|Requires collection and suitable processing|Reprocessing recovered paper is an example
`);
add('social-science',['landform classification','principal location','distinguishing geographical description'],`
Himalayas|Young fold mountains|Northern edge of the Indian subcontinent|Formed through convergence involving the Indian and Eurasian plates
Northern Plains|Extensive alluvial plains|South of the Himalayas|Built largely by deposits of the Indus-Ganga-Brahmaputra river systems
Peninsular Plateau|An old plateau region|Peninsular interior of India|Contains ancient crystalline rocks and several mineral-bearing areas
Western Ghats|A relatively continuous western escarpment|Western edge of the Peninsular Plateau|Intercept moisture-bearing southwest monsoon winds
Eastern Ghats|Discontinuous eastern hill ranges|Eastern edge of the Peninsular Plateau|Interrupted by several east-flowing rivers
Thar Desert|An arid desert region|Mainly western Rajasthan|Has low rainfall and extensive sandy areas
Eastern Coastal Plain|A generally broad coastal lowland|Between the Eastern Ghats and Bay of Bengal|Contains large deltas of several peninsular rivers
Western Coastal Plain|A generally narrow coastal lowland|Between the Western Ghats and Arabian Sea|Includes the Konkan and Malabar coastal stretches
Lakshadweep|A coral-island group|Arabian Sea southwest of the Indian mainland|Associated with coral reef and atoll formations
`);
add('social-science',['development concept','what it measures or emphasises','important limitation or implication'],`
Per capita income|An average income indicator|Total income divided by population|Does not show how income is distributed
Income distribution|The spread of income among people or groups|Who receives different shares of total income|Equal averages can coexist with unequal distributions
Literacy rate|An education indicator|The proportion of people meeting the specified literacy criterion|Education outcomes require measures beyond income
Infant mortality rate|A child-survival indicator|Deaths before age one per thousand live births|Lower values generally indicate better child-survival conditions
Life expectancy|A population-health indicator|Expected years of life under the relevant mortality conditions|Summarises survival rather than income distribution
Public facilities|Collectively important services|Access to services such as schooling, water and healthcare|Private income alone may not provide adequate shared infrastructure
Non-income goals|Dimensions of wellbeing beyond earnings|Safety, dignity, freedom and respect|People can value outcomes not captured in monetary income
Sustainable development|An intergenerational development concern|Meeting present needs without undermining future needs|Resource depletion can harm future opportunities
Conflicting development goals|Differences in interests among groups|One group's gain can impose costs on another|Project assessment should consider affected people's perspectives
`);
add('social-science',['economic classification','defining activity or condition','representative example'],`
Primary sector|Natural-resource-based production|Direct use or extraction of natural resources|Cultivating paddy
Secondary sector|Manufacturing and construction|Transformation of materials into new products or structures|Making cloth from cotton
Tertiary sector|Provision of services|Supplying services rather than directly extracting or manufacturing goods|Banking and passenger transport
Organised-sector employment|Employment with formal institutional arrangements|Work is expected to follow applicable regulations and protections|A registered workplace providing recognised benefits
Unorganised-sector employment|Employment often lacking formal protections|Workers may have low security and limited benefits|An unprotected daily-wage job in a small informal enterprise
Disguised unemployment|Underemployment hidden within an activity|Some workers can leave without lowering total output|Five people doing farm work that three can complete
Seasonal unemployment|Worklessness linked to seasonal demand|Employment is unavailable during part of the year|A farm labourer lacking work between crop seasons
Final goods|Products intended for final use in the accounting period|Their value includes relevant intermediate inputs|Bread bought by a household for consumption
Intermediate goods|Inputs used to produce other goods|Their value is incorporated into the final product|Flour bought by a bakery to make bread for sale
`);
add('social-science',['climatic factor or phenomenon','main physical explanation','typical implication for India'],`
Latitude|A control on the distribution of solar heating|The angle and seasonal pattern of sunlight vary with latitude|The Tropic of Cancer divides India into broadly different latitude zones
Altitude|A control related to height above sea level|Air temperature generally declines with height in the troposphere|Highland places tend to be cooler than nearby lowlands
Distance from the sea|A control on temperature moderation|Water heats and cools more slowly than land|Coastal places often have smaller temperature ranges
Southwest monsoon|A seasonal moisture-bearing wind system|Seasonal pressure and circulation changes bring moist winds|Supplies much of India's summer rainfall
Orographic rainfall|Rain caused by air rising over a barrier|Ascending moist air cools and condenses|Windward slopes can receive heavy rain
Rain shadow|Relative dryness on the leeward side|Air descending after moisture loss becomes relatively dry|Some interior areas receive less rain than windward slopes
Western disturbances|Weather systems affecting northwestern India in winter|Eastward-moving disturbances bring changing weather|Can provide winter precipitation useful to rabi crops
Retreating monsoon|Seasonal withdrawal of the summer monsoon|Wind circulation changes as the rainy season recedes|Parts of the southeastern coast receive important late-year rainfall
Weather versus climate|A distinction between short-term and long-term conditions|Weather concerns immediate conditions while climate concerns longer-term patterns|One unusual day alone does not establish a climate trend
`);
add('social-science',['river-system or water concept','location or defining feature','water-management implication or outlet'],`
Ganga river system|A major Himalayan river system|Drains extensive parts of the northern plains|Flows towards the Bay of Bengal
Brahmaputra river system|A major trans-Himalayan river system|Passes through the Assam valley|Joins the Ganga-Meghna system before reaching the Bay of Bengal
Godavari|A large peninsular river|Flows east across the Deccan region|Forms a delta at the Bay of Bengal
Krishna|A major east-flowing peninsular river|Drains parts of the southern plateau|Reaches the Bay of Bengal
Narmada|A major west-flowing peninsular river|Flows through a rift-valley region|Reaches the Arabian Sea
Drainage basin|An area contributing water to a river system|Includes the land drained by a river and its tributaries|Upstream land use can affect downstream water and sediment
Watershed divide|A boundary separating drainage areas|Often follows higher ground|Runoff on opposite sides enters different drainage systems
Groundwater recharge|Replenishment of subsurface water|Occurs when water infiltrates and reaches groundwater storage|Can be reduced by extensive impermeable paving
Rainwater harvesting|Collection or local retention of rainfall|Uses structures such as tanks and rooftop systems|Can support storage or recharge rather than rapid runoff
`);
add('social-science',['population measure or process','definition','interpretation'],`
Population density|A measure of spatial concentration|Population divided by area|Commonly expressed as persons per square kilometre
Birth rate|A population-change indicator|Live births per thousand population in a year|Contributes to natural increase when exceeding the death rate
Death rate|A population-change indicator|Deaths per thousand population in a year|A decline can contribute to population growth if other factors are unchanged
Natural increase|A component of population change|Births minus deaths|Excludes the separate effect of net migration
Net migration|A component of population change through movement|Immigration minus emigration for the area|Can raise or lower an area's population
Age structure|The distribution of people across age groups|Shares of children, working-age people and older people|Affects education, employment and care needs
Sex ratio in the Indian census convention|A demographic composition measure|Females per thousand males|Requires the stated convention when comparing data
Literacy rate|An education-related population indicator|Share meeting the census literacy criterion in the relevant age group|Does not by itself measure all learning outcomes
Demographic dividend|Potential economic benefit of a favourable age structure|A relatively large working-age population|Requires health, education and productive employment to realise the potential
`);
add('social-science',['settlement or migration concept','defining feature','illustrative implication'],`
Settlement site|The immediate physical location of a settlement|Local land, water and physical conditions|A reliable water source can favour settlement
Settlement situation|A settlement's relation to surrounding places|Connections with routes, markets and other settlements|A transport junction can improve accessibility
Rural settlement|A settlement associated largely with countryside activities|Agriculture and related livelihoods are often important|Services and non-farm work may still be present
Urban settlement|A settlement with a concentration of non-farm activities|Manufacturing, administration and services are often important|Planning must address housing and public infrastructure
Push factor|A condition encouraging departure from an origin|Examples include joblessness or livelihood distress|Can contribute to distress migration
Pull factor|A condition attracting people to a destination|Examples include better jobs or educational opportunities|Can influence the choice of destination
Seasonal migration|Movement for part of a year|Often follows seasonal work opportunities|Migrants may return to their home settlement
Remittance|Money sent home by a migrant|Transfers part of destination earnings to an origin household|Can support consumption, education or household investment
Forced displacement|Movement caused by coercion or loss of the ability to remain|Can result from violence, disaster or some project impacts|Differs from a move freely chosen solely for opportunity
`);
add('social-science',['village-economy concept','defining economic feature','representative implication'],`
Land|A natural productive resource|Its physical area is limited|More output may require improved methods rather than unlimited expansion
Fixed capital|A repeatedly usable production input|Tools, machinery and buildings last across production cycles|A tractor can be used for several crop seasons
Working capital|Funds or inputs used up during production|Includes seeds, fertiliser and payments such as wages|Costs may arise before harvest revenue is received
Multiple cropping|Growing more than one crop on the same land in a year|Raises the number of crop cycles on a plot|Reliable water can help make extra cropping possible
Irrigation|Artificial supply of water to crops|Reduces dependence on the timing of rain|Can support cultivation beyond the rainy season
Farm labour|Work performed on agricultural land|May be hired and paid wages|Employment demand can change across the crop cycle
Small farmer|A cultivator with a relatively small operational holding|Often faces limits on assets and market power|May need credit for seasonal inputs
Non-farm activity|A village livelihood outside crop cultivation|Includes services, processing and small manufacturing|Can diversify local employment and income
High-interest borrowing|Credit carrying a heavy repayment burden|Interest raises the amount owed over time|Poor harvests can make repeated debt difficult to escape
`);
add('social-science',['global-economy concept','defining feature','typical example or effect'],`
Globalisation|Growing cross-border economic and social integration|Links production, trade, investment and communication|A product may involve inputs and work from several countries
Multinational corporation|A firm operating in more than one country|Coordinates activity across national borders|Can locate production where costs and market access suit its strategy
Foreign trade|Exchange of goods or services across countries|Connects domestic markets with external markets|Imports can expand consumers' available choices
Foreign investment|Investment by a source based abroad|Can establish or expand productive activity across borders|An overseas firm may finance a local production facility
Tariff|A tax on imports|Can raise the domestic price of imported goods|A government may use it as a trade-policy instrument
Trade liberalisation|Reduction of selected restrictions on trade|Eases some barriers to cross-border exchange|Can intensify competition faced by domestic producers
Outsourcing|Contracting some activities to another provider|Tasks may be performed outside the contracting firm's own organisation|Service work may be supplied from a distant location
Information technology|Digital tools supporting information exchange|Allows rapid coordination and communication|Helps firms manage dispersed production networks
Fairer globalisation|A goal concerning distribution and participation|Requires attention to unequal bargaining power and opportunities|Worker protection and support for vulnerable producers can improve outcomes
`);
add('social-science',['food-security concept','defining feature','main role or implication'],`
Food availability|The supply dimension of food security|Food must exist through production, stocks or trade|Adequate national supply does not alone guarantee household access
Food accessibility|The ability to obtain food|Includes physical and economic access|Low income can restrict access even when markets have food
Food affordability|The relationship between food prices and household means|People need enough resources to purchase required food|A price rise can hurt low-income consumers
Nutritional adequacy|The quality dimension of the diet|Needs include nutrients as well as sufficient energy|Enough calories alone do not prove a balanced diet
Buffer stock|A publicly held food reserve|Grain is stored for designated public purposes|Can support distribution and emergency supply
Public Distribution System|A public channel for specified commodities|Uses designated distribution arrangements|Can improve access for eligible households
Minimum support price|An announced price-support instrument for specified crops|Offers a price benchmark within the procurement framework|Procurement can contribute grain to public stocks
School meals|A meal-support intervention for children|Food is provided through a school-based programme|Can support children's nutrition and participation in schooling
Dietary diversity|Consumption of a variety of food types|Different foods contribute different nutrients|Helps reduce dependence on a nutritionally narrow diet
`);
add('social-science',['sustainability concept','core concern','appropriate assessment principle'],`
Intergenerational equity|Fairness between present and future people|Current resource use can affect later generations|Consider whether future needs remain achievable
Intragenerational equity|Fairness among people living today|Benefits and burdens may be distributed unequally|Examine who gains and who bears costs
Non-renewable resource depletion|Loss of a finite stock over human timescales|Extraction can reduce what remains available|Use efficiency and alternatives when assessing long-term needs
Environmental pollution|Contamination of air, water or land|Production can impose costs outside the market transaction|Include environmental and health damage in project assessment
Displacement|Loss of homes or access associated with a change or project|Affected people can lose livelihoods and social ties|Assess rights, consent requirements and rehabilitation obligations
Rehabilitation|Support to restore lives after displacement|A cash payment alone may not restore a livelihood|Consider housing, land, work and social needs
Environmental justice|Fair treatment in environmental risks and protection|Vulnerable groups may face disproportionate harm|Examine exposure, participation and access to remedies
Resource efficiency|Obtaining useful services with less resource input|Wasteful consumption increases pressure on resources|Compare ways to meet needs with lower material and energy use
Public participation|Involvement of affected people in decisions|Local knowledge and interests can be overlooked|Use informed consultation alongside evidence and accountable decisions
`);
add('social-science',['historical period or location','central event or character','major consequence or significance'],`
First World War|1914–1918, centred on a conflict spreading from Europe|Major alliances fought a large industrial war|Heavy losses and a changed European political order followed
Russian Revolution of 1917|Russia in 1917|Tsarist rule ended and the Bolsheviks later took power|A new socialist political experiment developed
Treaty of Versailles|Post-First World War settlement in 1919|Imposed territorial losses and reparations on Germany|Generated grievances used by later extremist politics
Great Depression|A worldwide crisis beginning in 1929|Production, trade and employment contracted sharply|Economic insecurity deepened across many societies
Fascism in Italy|Interwar Italy|Mussolini established an authoritarian nationalist regime|Political opposition and democratic freedoms were suppressed
Nazism in Germany|Germany under Hitler from 1933|A dictatorship promoted racial hierarchy and aggressive nationalism|Persecution and expansionist war followed
Second World War|1939–1945|A global conflict involving Axis and Allied powers|Mass destruction helped reshape post-war institutions and power
Holocaust|Nazi-controlled Europe during the Second World War|Systematic persecution and murder especially targeting Jews|Demonstrates the catastrophic consequences of genocidal racial ideology
League of Nations|An organisation created after the First World War|Sought international cooperation and prevention of war|Its weaknesses became evident as aggression escalated
`);
add('social-science',['national-movement association','central idea or contribution','historical significance'],`
Sun Yat-sen|Chinese nationalist movement|Advanced nationalism, democracy and people's livelihood|His ideas influenced modern Chinese nationalism
Guomindang|Chinese nationalist political organisation|Sought national unity under a nationalist programme|Became a major force in twentieth-century Chinese politics
Chinese Communist Party|Chinese revolutionary political organisation|Developed a communist challenge to the existing order|Came to power on the mainland in 1949
Mao Zedong|Chinese communist leadership|Emphasised mobilisation of peasants|Rural organisation became central to the communist revolutionary strategy
Chinese peasantry|Rural social base of revolutionary mobilisation|Faced grievances concerning land and rural power|Land questions helped shape revolutionary support
British colonial rule in Nigeria|Colonial administration in West Africa|Brought different regions under a single colonial structure|Left lasting issues of regional inequality and political unity
Hausa-Fulani region in Nigeria|Predominantly associated with northern Nigeria|Had a social and religious setting different from southern regions|Regional diversity complicated the construction of national unity
Yoruba region in Nigeria|Predominantly associated with southwestern Nigeria|Was one of Nigeria's major regional communities|A Nigerian national movement had to accommodate regional identities
Igbo region in Nigeria|Predominantly associated with southeastern Nigeria|Was another major regional community within colonial Nigeria|Postcolonial nation-building faced the task of integrating diverse regions
`);
add('social-science',['historical date or period','main action or development','political significance'],`
Congress ministries' resignation|1939|Congress ministries resigned after India was committed to war without consultation|Expressed opposition to colonial decision-making without Indian consent
Lahore Resolution|1940|The Muslim League advanced a demand concerning Muslim-majority political units|Became central to the League's separate-state demand
Cripps Mission|1942|British proposals were presented concerning India's constitutional future|Its failure preceded the Quit India movement
Quit India movement|August 1942|Congress called for an end to British rule|Brought a major wave of anti-colonial mobilisation and repression
Indian National Army under Bose|A major wartime phase during the Second World War|Sought independence through an armed struggle against British power|Added another strand to the broader independence struggle
Royal Indian Navy revolt|1946|Naval ratings protested under colonial rule|Reflected unrest reaching parts of the colonial armed services
Cabinet Mission|1946|Proposed a framework for transferring power and a constitutional arrangement|Sought an agreed political settlement before independence
Independence and Partition|1947|British rule ended and British India was divided|Sovereignty was accompanied by violence and mass displacement
Constituent Assembly's early work|Began in 1946|Representatives worked towards a constitutional framework|Provided the institutional setting for drafting independent India's Constitution
`);
add('social-science',['constitutional identity','core meaning','institutional implication'],`
Preamble|An introductory statement of constitutional ideals|Sets out aspirations including justice, liberty, equality and fraternity|Guides understanding of the Constitution's purposes
Sovereignty|The authority of an independent political community|India governs itself rather than being subordinate to a colonial ruler|Foreign-policy and domestic choices are made through constitutional institutions
Democracy|Government based on the political authority of the people|Representative institutions depend on elections and public accountability|Citizens can replace representatives through lawful elections
Republic|A system without a hereditary head of state|Public office is not inherited as a royal entitlement|India has an elected constitutional head of state
Fundamental Rights|Constitutionally protected rights|Safeguard important freedoms and equality|Can be enforced through constitutional remedies
Directive Principles|Constitutional guidance for governance|Set social and economic objectives for the state|Guide policy though not enforceable in the same way as Fundamental Rights
Federalism|A division of authority between levels of government|The Constitution allocates powers to Union and state institutions|Different levels have specified responsibilities
Universal adult franchise|Adult citizens' voting entitlement subject to lawful eligibility|Voting does not depend on wealth, caste or educational qualification|Broadens democratic participation
Drafting Committee|The Constituent Assembly committee chaired by B. R. Ambedkar|Prepared a draft constitutional text for deliberation|Its work formed a central part of constitution-making
`);
add('social-science',['electoral institution or concept','defining function','democratic purpose or implication'],`
Election Commission of India|A constitutional election-supervision body|Supervises elections to Parliament and state legislatures|Impartial administration supports electoral integrity
Electoral roll|A register of eligible enrolled voters|Identifies people registered to vote in the area|Accurate enrolment supports participation
Constituency|A territorial electoral unit|Elects its representative under the relevant electoral arrangement|Connects a defined electorate with representation
Nomination|The formal process of entering an election as a candidate|Candidates submit required details under election rules|Enables recognised candidacy for the ballot
Election campaign|A period of public political persuasion|Parties and candidates present policies and seek votes|Allows voters to compare alternatives
Secret ballot|Privacy of an individual voter's choice|Others cannot ordinarily know how a person voted from the ballot|Helps protect voters from intimidation
First-past-the-post|An electoral method for a single-member seat|The candidate with the highest vote count wins|An absolute majority of votes is not always required
Reserved constituency|A representation safeguard for designated groups|Candidate eligibility is reserved for the specified category|Other eligible voters in the constituency still vote
Model Code of Conduct|Election-period guidelines for political conduct|Sets standards intended to support fair campaigning|Constrains misuse of official advantage and improper campaigning
`);
add('social-science',['early post-independence policy or event','main objective or character','historical implication'],`
Integration of princely states|Political consolidation after independence|Brought princely territories into the Indian Union|Helped establish the territorial framework of independent India
Linguistic reorganisation|Reorganisation of state boundaries|Responded to major language-based regional aspirations|Accommodated linguistic diversity within the Union
Five-Year Plans|A framework for planned development|Set priorities for public investment and economic change|Supported institution-building and productive capacity
Land reforms|Measures changing agrarian ownership and tenancy relations|Sought to reduce exploitative intermediaries and improve agrarian conditions|Implementation and results varied across regions
Green Revolution|A package of agricultural technological changes|Combined high-yielding varieties with inputs such as irrigation and fertiliser|Raised output in some areas while benefits remained uneven
Public sector investment|State-led creation of economic capacity|Built infrastructure and basic industries|Aimed to support long-term development needs
1967 elections|A turning point in electoral competition|Opposition parties gained strength in several states|Challenged the earlier pattern of Congress dominance
Emergency of 1975|A period of exceptional central power and restrictions|Civil liberties and opposition activity were curtailed|Raised major questions about checks on executive authority
1977 election|The election following the Emergency period|Voters replaced the Congress government at the Centre|Demonstrated democratic accountability through electoral turnover
`);
add('social-science',['political development or organisation','central feature','historical association'],`
Janata Party government|The national government formed after the 1977 election|Brought together opposition to the Emergency-era Congress government|Marked the first non-Congress government at the Centre
Telugu Desam Party|A regional party founded by N. T. Rama Rao in 1982|Mobilised around Telugu regional identity and political concerns|Became important in Andhra Pradesh and national coalition politics
Regional parties|Parties with strong state or regional bases|Represent particular regional aspirations and interests|Can influence the formation of national coalitions
Coalition government|A government sustained by more than one party|Depends on negotiated support among partners|Became prominent as national mandates fragmented
Mandal Commission debate|A major debate over affirmative action|Concerned recommendations relating to Other Backward Classes|Brought questions of social justice and representation to the centre of politics
Economic reforms of 1991|A shift in economic policy during a balance-of-payments crisis|Introduced major liberalisation measures|Changed the relationship between state regulation, markets and external integration
National Front government|A coalition arrangement formed in 1989|Relied on a combination of parties and supporting forces|Illustrated the growing importance of alliance politics
United Front governments|Coalition governments during 1996–1998|Brought together multiple parties with outside support|Reflected a period of fragmented national electoral outcomes
National Democratic Alliance|A party alliance that formed a government in the late 1990s|Combined the BJP with coalition partners|Represented another major national coalition arrangement
`);
add('social-science',['post-war international concept','central feature','important implication'],`
Cold War|A rivalry centred on the USA and USSR|Competing blocs used military, political and ideological influence|Proxy conflicts and nuclear competition endangered many societies
United Nations|An international organisation founded in 1945|Seeks cooperation, peace and international security|Offers institutions for diplomacy and collective deliberation
Security Council veto|A special power of the five permanent members|Can block a substantive Council resolution|Limits action when a permanent member opposes a proposal
Non-alignment|A foreign-policy approach seeking independent judgement|Avoids automatic alignment with a rival power bloc|Does not require silence on international disputes
Decolonisation|The process of colonies gaining independence|Created many new sovereign states|Changed membership and priorities in international institutions
Arms race|Competitive military expansion|Rival powers seek stronger or more advanced weapons|Can divert resources and increase insecurity
Proxy war|A conflict in which outside powers support opposing local sides|Superpower rivalry can shape a regional conflict|People outside the superpowers' own territories can suffer major costs
Peaceful coexistence|An approach to relations between states|Seeks management of differences without war|Requires diplomacy despite continuing political disagreement
Dissolution of the Soviet Union|A major political change in 1991|Ended the USSR as a single union state|Changed the international balance without ending every conflict
`);
add('social-science',['movement or collective-action concept','central concern','broader democratic significance'],`
US civil rights movement|A struggle against racial discrimination|Challenged segregation and unequal rights|Expanded demands for equal citizenship
Anti-apartheid movement|A struggle against institutionalised racial rule in South Africa|Opposed exclusion of the non-white majority|Linked political rights with the dismantling of racial domination
Women's movements|Collective action around gender inequality|Address issues such as discrimination, violence and representation|Broaden democratic participation and public agendas
Environmental movements|Collective action concerning ecological harm|Challenge damaging resource use or pollution|Connect environmental protection with public accountability
Narmada Bachao Andolan|A movement concerning large-dam impacts in the Narmada valley|Raised displacement, rehabilitation and environmental questions|Made affected communities' rights central to development debates
Peace movements|Collective action opposing war and militarisation|Can challenge nuclear weapons and armed conflict|Bring security and survival questions into public debate
Nonviolent protest|A method of collective political action|Uses peaceful pressure rather than physical violence|Can mobilise public attention and moral argument
Petitioning|A formal presentation of collective demands|Communicates grievances or requested changes to an authority|Offers a channel for organised participation
Public accountability|The demand that decision-makers explain and answer for their actions|Requires scrutiny, information and opportunities to challenge decisions|Remains important between elections as well as during them
`);
add('social-science',['historical stage or instrument','central feature','relevance to Telangana statehood'],`
Hyderabad state before the 1956 merger|An earlier state including Telangana|Its administrative history differed from that of coastal Andhra|Provided a distinct regional background to later debates
Andhra Pradesh formation in 1956|The merger creating a larger linguistic state|Telangana was merged with Andhra areas|Raised questions about regional safeguards within the new state
Gentlemen's Agreement|An agreement associated with the 1956 merger|Set out safeguards intended to protect Telangana interests|Its implementation became part of later regional grievances
Employment safeguards|Rules and assurances concerning local opportunities|Sought protection of local interests in public employment|Jobs became a major issue in Telangana mobilisation
1969 Telangana agitation|An important earlier phase of separate-state mobilisation|Expressed dissatisfaction concerning safeguards and regional interests|Shows that the demand had a history preceding the final phase
Regional water concerns|Grievances about access to and allocation of water|Linked irrigation and development questions to regional equity|Water became a prominent theme in the movement
Regional resource and revenue concerns|Debate over distribution of resources and development benefits|Questioned whether the region received a fair share|Connected statehood demands with economic and administrative issues
Parliamentary reorganisation process|The constitutional route used to create the new state|Required national legislative action on reorganisation|Provided the legal basis for Telangana's formation
Telangana formation on 2 June 2014|The establishment of a separate state|Hyderabad became the new state's capital|Statehood changed institutions while development responsibilities continued
`);

// All listed digestive agents act; a heart chamber is an explicitly incorrect site.
tables.biology[0].extras=[['Heart ventricle'],[],[]];
// Some valid associations overlap. Exclude those from distractors rather than
// treating an incidental-but-true association as an incorrect answer.
function overlap(subject,chapter,column,groups){
 const table=tables[subject][chapter-1];table.validPeers??={};
 for(const group of groups)for(const r of group){table.validPeers[r]??={};table.validPeers[r][column]=[...(table.validPeers[r][column]||[]),...group.map(index=>table.rows[index][column+1])];}
}
overlap('physics',1,1,[[4,5]]);
overlap('physics',2,0,[[4,5]]);
overlap('physics',5,0,[[0,1,2,8]]);
for(const col of [0,1,2])overlap('physics',10,col,[[1,2],[3,4,5],[6,8]]);
overlap('biology',1,2,[[0,2],[1,3]]);
overlap('biology',2,1,[[0,3]]);
overlap('biology',3,1,[[4,5]]);
overlap('biology',4,2,[[2,3]]);
overlap('biology',6,2,[[5,7]]);
overlap('biology',7,1,[[5,7]]);
overlap('biology',10,2,[[6,7,8]]);
overlap('social-science',13,0,[[0,1,2,3],[5,6,7,8]]);
overlap('social-science',14,0,[[2,3],[5,6,8]]);
function wrongColumn(subject,chapter,col,text){
 const table=tables[subject][chapter-1];table.wrongRows??={};
 const rows=text.trim().split('\n').map(line=>line.split('|'));
 if(rows.length!==9||rows.some(row=>row.length!==3))throw Error('Expected nine three-choice misconception lists.');
 rows.forEach((values,r)=>{table.wrongRows[r]??={};table.wrongRows[r][col]=values;});
}
wrongColumn('social-science',2,2,`
Proves all household incomes are identical|Measures each person's exact earnings|Automatically measures political freedom
An equal average guarantees equal distribution|No income differences can exist within a country|Distribution is irrelevant whenever total income rises
Literacy rates directly measure household income equality|Literacy means every student has identical learning|Income figures make education measures unnecessary
A higher infant mortality rate indicates better child survival|It counts deaths among all adults|It is measured per square kilometre
It gives every individual's guaranteed age at death|It directly reports income inequality|It counts only school attendance
Only wealthy individuals can benefit from clean public water|Public facilities are never shared services|A higher private income eliminates every need for public infrastructure
Safety and dignity are never development concerns|Only earnings can be valued by people|All people have identical non-income priorities
Future resource availability is irrelevant|Present growth guarantees all future needs|Non-renewable stocks cannot be depleted
Every project gives identical gains to all groups|Development goals never conflict|Affected communities' losses cannot matter
`);
wrongColumn('social-science',6,2,`
Means births per thousand people|Measures rainfall in a district|Always equals total population
Has no role in natural population change|Counts only deaths|Is measured as persons per square kilometre
A fall necessarily reduces population growth in all other unchanged conditions|Counts only births|Is unrelated to mortality
Includes migration by definition|Always equals total population|Can never be negative
Never changes an area's population|Equals births minus deaths|Measures only the area of a district
Has no implications for schooling or jobs|Every age group has identical needs|Is determined only by rainfall
Means males per hundred females under the stated convention|Is a count of births alone|Needs no definition when comparing different conventions
Directly measures every person's practical skills|Guarantees all learners have identical achievement|Means the total number of factories
Automatically guarantees jobs and prosperity|Requires no investment in health or education|Occurs only when there are no working-age people
`);
wrongColumn('social-science',7,2,`
Local water and terrain cannot influence settlement|Only election results define a settlement's site|The site is the settlement's export income
Relations with surrounding markets are irrelevant|Situation means only the soil under one building|A transport junction cannot affect accessibility
Rural places can never have services|Every rural resident must cultivate crops|Non-farm work is prohibited by the definition
Urban places need no housing or sanitation planning|All urban residents work on farms|Public services automatically expand at the same speed as population
Always means better jobs at the destination|Can never involve livelihood distress|Refers only to money sent home
Always means a crisis at the place of origin|Can never involve education|Is identical to forced removal
Always means permanent emigration|Never follows seasonal demand for workers|Necessarily ends all ties with the home settlement
Is a tax imposed on imports|Means the migrant's total village population|Cannot support an origin household
Is always freely chosen for higher wages|Never involves loss of homes|Is identical to a holiday trip
`);
wrongColumn('social-science',8,2,`
The physical area of land expands without limit|More production never needs inputs|Every farm has identical soil and water
Must be completely used up in one crop season|Means only daily wages|A tractor cannot be used again
Always lasts unchanged for many production cycles|Excludes all spending on seeds|Is identical to the land's physical area
Means only one crop over the entire year|Never depends on water availability|Automatically removes every production risk
Guarantees unlimited groundwater|Makes all crop water unnecessary|Cannot affect the cropping season
Demand for farm labour is identical every day|All farm labourers own every field they work on|Farm wages can never vary
Always has unlimited capital and market power|Never needs finance before harvest|Necessarily owns the largest holding in the village
Means only cultivating crops on another field|Cannot include services|Eliminates all need for local skills
Interest always increases crop yields|Repayment disappears after a poor harvest|All borrowing is cost-free
`);
wrongColumn('social-science',9,2,`
Always gives identical benefits to every producer|Means every country stops trading|Eliminates all national economic differences
Must operate only within one village|Cannot invest outside its home country|Automatically provides identical wages worldwide
Can never change consumer choice|Means goods never cross borders|Guarantees every domestic firm survives competition
Always means a tax on imports|Cannot finance any production activity|Automatically transfers ownership to every local worker
Is money sent home by migrants|Must reduce the import price by definition|Is identical to a wage payment
Means banning all imports|Guarantees no producer faces adjustment costs|Eliminates every market competition
Means every contracted task is performed by the same firm's own employees|Can never involve services|Necessarily removes all need for communication
Makes physical transport unnecessary for every product|Ends all differences in labour laws|Works only within one room
Requires ignoring all worker protections|Automatically follows from trade growth alone|Means disadvantaged producers need no opportunities or support
`);
wrongColumn('social-science',10,2,`
Proves every household can afford food|Guarantees every diet is nutritionally balanced|Makes all access measures unnecessary
Depends only on total national output|Is guaranteed whenever food exists anywhere|Cannot be affected by income
Food prices never affect low-income consumers|Affordability means only food exports|Household resources do not influence purchases
Enough calories guarantee every nutrient requirement|Protein and micronutrients are irrelevant|Diet quality is unrelated to nutrition
Can never be used during a supply emergency|Means only grain left accidentally in a field|Automatically prevents all storage losses
Guarantees equal access for every person without effective delivery|Means privately buying any luxury product|Has no connection to food access
Is the same as each consumer's retail food bill|Guarantees procurement of every crop from every farmer|Measures the number of children receiving meals
Guarantees every adult a permanent job|Replaces all household incomes|Eliminates every food-price change
Means eating only one cereal for life|Has no relation to nutrient adequacy|Makes total food intake irrelevant
`);
wrongColumn('social-science',11,2,`
Only present consumption matters|Future needs can always be ignored|Non-renewable resources are unlimited
Distribution of present benefits does not matter|Every current household receives identical gains automatically|Only the richest group's interests count
Stocks regenerate immediately after extraction|Finite stocks cannot decline|Long-term resource availability is irrelevant
Pollution has no health or environmental cost|Market output records every ecological harm fully|All effluent is harmless
Loss of homes and work needs no assessment|Affected residents have no relevant interests|A project never changes livelihoods
Cash alone always restores every lost livelihood|Housing and work are unrelated to rehabilitation|No support is needed after displacement
Every group is exposed to identical environmental harm|Participation cannot matter to fairness|Vulnerable communities never face disproportionate risks
More waste per useful service means greater efficiency|Efficiency depends only on total production|Resource input is irrelevant to efficiency
Affected people's knowledge should always be excluded|Consultation replaces every need for evidence|Decision-makers never need to explain their choices
`);
for(const col of [1,2])overlap('social-science',13,col,[[0,1,2,3],[5,6,7,8]]);
for(const col of [0,1,2])overlap('social-science',5,col,[[2,3]]);
for(const col of [0,1,2])overlap('social-science',17,col,[[2,5]]);
for(const r of [2,3,4,5,6,7,8]){
 const t=tables['social-science'][0];t.validPeers??={};t.validPeers[r]??={};t.validPeers[r][1]=[t.rows[1][2]];
}
wrongColumn('social-science',15,2,`
It replaces every enforceable constitutional provision|It gives any official unlimited power|It is only an annual financial budget
It means continued subordination to colonial rule|It prevents all independent policy choices|It gives foreign rulers constitutional supremacy
Citizens cannot replace elected representatives|Elections and accountability are irrelevant|Only hereditary rulers hold political authority
The head of state inherits office as a monarch|Public office is automatically a royal entitlement|No non-hereditary constitutional head is possible
Rights need no constitutional remedy|Arbitrary state action is always unlimited|Equality and freedoms have no protection
They are enforceable in exactly the same way as Fundamental Rights|They prohibit all social-policy objectives|They abolish all government responsibility
All authority belongs permanently to one village|States have no constitutionally allocated responsibilities|The division of powers has no constitutional basis
Wealth is a necessary qualification for voting|Only university graduates may vote|Adult citizenship has no relevance to the franchise
It was chaired by the British monarch|It alone adopted the text without Assembly deliberation|It had no role in preparing the constitutional draft
`);
wrongColumn('social-science',16,2,`
It exists to ensure a permanent victory for one party|It supervises only private company purchases|Impartiality has no role in its work
It lists only political candidates|It is a record of rainfall|Accurate voter enrolment is unnecessary
It is identical to a party manifesto|Its purpose is to abolish all local representation|It never has a defined electorate
It means every resident automatically becomes a candidate|No formal candidacy process is involved|It substitutes for voting and counting
Only the ruling party may present policies|Voters need no alternatives|Campaign debate necessarily invalidates the election
It lets employers inspect each worker's vote|It requires voters to announce their choices publicly|It removes all protection from intimidation
The lowest vote count wins|An absolute majority is always compulsory|All candidates share the single seat equally
Only members of the reserved category may vote there|It reserves the seat permanently for one party|It removes all other residents from the electoral roll
It gives the ruling party unlimited campaign advantages|It bans every lawful criticism of government|It replaces all election laws with an individual's wishes
`);
wrongColumn('social-science',17,2,`
It kept every princely territory permanently outside India|It ended the need for a territorial framework|It created British colonial rule
It abolished the Union|It made all Indian languages identical|It made regional language concerns irrelevant
It guaranteed poverty vanished immediately|It made public investment unnecessary|It ensured every region gained equally
Implementation was identical and complete everywhere|It aimed to restore all exploitative intermediaries|It prohibited changes to tenancy relations
Every farmer received identical gains|It required no irrigation or other inputs|It removed all environmental concerns
It involved no state role in infrastructure|It ended the need for basic industries|It guaranteed all inequalities disappeared
It ended every opposition party|It proved Congress dominance increased in every state|It abolished state elections permanently
It expanded unrestricted civil liberties everywhere|It showed executive authority needs no checks|It permanently eliminated the relevance of democracy
It ended voters' ability to replace rulers|It restored the Emergency as a permanent constitutional requirement|It made future national elections unnecessary
`);
wrongColumn('social-science',18,2,`
It was formed after the 1952 election|It continued the Emergency-era Congress government unchanged|It made national elections cease permanently
It was founded by N. T. Rama Rao in 1947|It never had a regional political base|It had no role in Andhra Pradesh politics
They cannot influence national coalitions|They are constitutionally forbidden from elections|They represent no regional aspirations
It requires support from exactly one party|It needs no negotiation among supporting parties|It automatically removes every political disagreement
It concerned reservations only for foreign citizens|It had no connection to social justice|It addressed only the price of imported machinery
They occurred in 1951 rather than 1991|They banned all market activity|Their benefits and costs were identical for every household
It was the government formed after the 1947 transfer of power|It showed alliances had no significance|It consisted of a permanent hereditary monarchy
They governed during 1950–1952|They showed fragmented mandates could never produce governments|They abolished multi-party politics
It was a single-party organisation founded by Sun Yat-sen|It had no coalition partners|It was formed to administer the League of Nations
`);
wrongColumn('social-science',19,2,`
It involved no nuclear rivalry|It caused no conflicts outside the two superpowers|It meant all international disputes disappeared
It was founded after the First World War in 1919|It eliminates all need for diplomacy|It guarantees unanimous agreement on every dispute
Any one ordinary citizen can use it|It automatically dissolves the UN|It applies only to school elections
It requires silence on every international dispute|It means no diplomatic relations with any country|It compels permanent alignment with one superpower
It reduced all colonies to a single empire|It left the number of sovereign states unchanged everywhere|It removed all development concerns from world politics
It necessarily increases resources available for social needs|It guarantees lasting peace without diplomacy|It never creates security risks
It means the conflict has no local participants|It cannot involve outside support|It causes no harm outside superpower territories
It requires identical political systems in all states|It forbids diplomatic negotiation|It means differences can be resolved only by war
It occurred in 1945|It resolved every regional and ethnic conflict|It caused all nuclear weapons worldwide to vanish immediately
`);
wrongColumn('social-science',20,2,`
It aimed to preserve racial segregation|It rejected equal citizenship as a goal|It concerned only a tax on imported goods
It supported permanent white-minority rule|It sought to deepen legal racial exclusion|It had no connection to political rights
They aim to exclude women from public life|They regard gender-based violence as irrelevant|They cannot influence democratic agendas
They have no connection to resource use or pollution|They necessarily reject all public accountability|They prove ecological harm cannot affect livelihoods
It dealt only with the US electoral system|It ignored all displacement and rehabilitation issues|It was a movement supporting Nazi racial policy
They seek nuclear war as their defining objective|They cannot raise security questions|They are identical to an arms race
It requires targeted violence against civilians|It means destroying every public institution|It never uses peaceful public pressure
It is the direct use of armed force|It cannot communicate collective demands|It replaces all forms of decision-making permanently
It matters only on polling day|Officials never need to explain decisions|Scrutiny and information prevent accountability
`);
wrongColumn('social-science',21,2,`
It had exactly the same administrative history as every coastal Andhra area|It was created after Telangana formed in 2014|It had no relevance to regional historical experience
It occurred in 2014 rather than 1956|It removed every need to discuss regional safeguards|It created the British Empire in India
It was unrelated to the 1956 merger|It guaranteed safeguards could never be disputed|It concerned only global nuclear weapons
Jobs were never relevant to regional mobilisation|It required abolishing all public employment|Local opportunities had no connection to safeguards
It proves no mobilisation existed before 2014|It occurred after the separate state's formation|It had no connection to regional grievances
Irrigation had no connection to regional equity|The movement concerned only ocean shipping|Water allocation never affects development
Resource distribution was irrelevant to the demand|Every region automatically received equal benefits|Statehood debates had no economic dimension
It required no legislative action|A new state could be created only by a private company|It replaced every constitutional institution with a monarchy
It automatically solved every development problem|It eliminated all continuing governance responsibilities|It occurred on 26 January 1950
`);
overlap('biology',1,1,[[1,3],[4,8]]);
