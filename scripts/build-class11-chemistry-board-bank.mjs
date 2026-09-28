import fs from 'node:fs';
import path from 'node:path';

const root = path.resolve(import.meta.dirname, '..');
const file = path.join(root, 'data/class11/chemistry.json');

const chapters = [
  {
    name:'Atomic Structure', focus:'Atomic models, quantum numbers, electronic configuration and hydrogen spectrum repeatedly support definitions, reasons and numerical questions.', diagram:'atomic-orbitals.svg',
    facts:[
      ['Rutherford model','Rutherford proposed a very small, dense, positively charged nucleus containing almost all atomic mass, with electrons outside it; the atom is mostly empty space.'],
      ['Atomic number and mass number','Atomic number Z is the number of protons. Mass number A is the total number of protons and neutrons, so neutrons = A − Z.'],
      ['Electromagnetic relation','For radiation in vacuum, c = νλ, where c is speed, ν frequency and λ wavelength. Photon energy is E = hν.'],
      ['Bohr energy','For a hydrogen-like species, Eₙ = −13.6Z²/n² eV. A negative value shows that the electron is bound to the nucleus.'],
      ['de Broglie relation','Every moving particle has wavelength λ = h/mv = h/p; matter-wave character is significant for microscopic particles.'],
      ['Uncertainty principle','The position and momentum of a microscopic particle cannot both be measured exactly: Δx·Δp ≥ h/4π.'],
      ['Quantum numbers','n gives shell and energy; l gives subshell and shape; mₗ gives orientation; mₛ gives electron spin.'],
      ['Orbital capacity','A shell holds at most 2n² electrons; a subshell holds 2(2l+1), and one orbital holds two electrons with opposite spins.'],
      ['Aufbau, Pauli and Hund rules','Orbitals fill in increasing energy; no two electrons have all four quantum numbers identical; degenerate orbitals fill singly before pairing.'],
      ['Half-filled stability','Half-filled and completely filled subshells are relatively stable because of symmetrical distribution and greater exchange energy.']
    ],
    long:[
      ['Explain Bohr’s model of the hydrogen atom and derive the radius and energy of its nth orbit.',`Postulates: the electron moves only in permitted stationary orbits; angular momentum is quantised, mvr = nh/2π; radiation is emitted or absorbed only during a transition, hν = |E₂−E₁|.

For a hydrogen-like ion, electrostatic attraction supplies centripetal force: mv²/r = Ze²/(4πε₀r²). Combining this with mvr = nh/2π gives rₙ = 4πε₀n²h²/(4π²mZe²) = a₀n²/Z, where a₀ = 0.529 Å.

Total energy E = ½mv² − Ze²/(4πε₀r). Using the force equation, Eₙ = −mZ²e⁴/(8ε₀²h²n²) = −13.6Z²/n² eV. The model explains hydrogen-like spectra but not multi-electron atoms, fine structure or Zeeman effect.`],
      ['Describe the four quantum numbers and state the allowed values and significance of each.',`1. Principal quantum number n = 1, 2, 3… specifies the main shell, approximate size and energy. A shell contains n² orbitals and at most 2n² electrons.
2. Azimuthal quantum number l = 0 to n−1 specifies subshell and shape: s, p, d, f correspond to 0, 1, 2, 3.
3. Magnetic quantum number mₗ = −l to +l specifies orbital orientation; a subshell therefore contains 2l+1 orbitals.
4. Spin quantum number mₛ = +½ or −½ specifies the two allowed electron-spin orientations.

Apply Pauli’s principle: no two electrons in one atom can have the same set of all four quantum numbers.`],
      ['Explain the Aufbau principle, Pauli exclusion principle and Hund’s rule with electronic-configuration examples.',`Aufbau principle: electrons occupy available orbitals in increasing (n+l) order; when (n+l) is equal, the orbital with lower n fills first. Pauli principle: an orbital can contain at most two electrons and their spins must be opposite. Hund’s rule: degenerate orbitals are singly occupied with parallel spins before pairing.

Example: N (Z=7) is 1s² 2s² 2pₓ¹2pᵧ¹2p_z¹, showing three parallel unpaired p electrons. O (Z=8) has one paired and two singly occupied 2p orbitals. Chromium is [Ar]3d⁵4s¹ and copper is [Ar]3d¹⁰4s¹ because half-filled and filled d subshells gain extra stability.`]
    ]
  },
  {
    name:'Classification of Elements and Periodicity in Properties', focus:'Modern periodic law, block identification and explanations of trend exceptions are high-yield board areas.', diagram:'periodic-trends.svg',
    facts:[
      ['Modern periodic law','The physical and chemical properties of elements are periodic functions of their atomic numbers.'],
      ['Period and group','The highest principal quantum number generally gives the period; related valence-shell configurations place main-group elements in the same group.'],
      ['Blocks','The subshell receiving the differentiating electron identifies the s, p, d or f block of an element.'],
      ['Atomic radius trend','Atomic radius generally decreases across a period due to increasing effective nuclear charge and increases down a group as shells are added.'],
      ['Ionic radius','A cation is smaller than its atom, while an anion is larger. In an isoelectronic series, radius decreases with increasing nuclear charge.'],
      ['Ionisation enthalpy','Ionisation enthalpy generally increases across a period and decreases down a group; stable filled and half-filled subshells cause exceptions.'],
      ['Electron-gain enthalpy','Electron-gain enthalpy is the enthalpy change when an isolated gaseous atom accepts an electron; a more negative value usually indicates favourable addition.'],
      ['Electronegativity','Electronegativity is the tendency of a bonded atom to attract the shared electron pair; it generally rises across a period and falls down a group.'],
      ['Diagonal relationship','The first element of some groups resembles the diagonally placed element of the next group, for example Li–Mg and Be–Al.'],
      ['Valency trend','Across a main-group period, valency with respect to hydrogen rises from 1 to 4 and then falls to 0; oxidation-state patterns follow valence electrons.']
    ],
    long:[
      ['Explain periodic trends in atomic radius, ionisation enthalpy, electron-gain enthalpy and electronegativity.',`Across a period, nuclear charge increases while electrons enter the same shell. Effective nuclear attraction therefore rises: atomic radius falls, while ionisation enthalpy and electronegativity generally rise. Electron-gain enthalpy tends to become more negative, subject to subshell stability and small-size repulsion.

Down a group, new shells increase size and shielding. Atomic radius rises, whereas ionisation enthalpy and electronegativity generally fall. Electron-gain enthalpy usually becomes less negative. Cite exceptions: Be > B and N > O in ionisation enthalpy; chlorine has more negative electron-gain enthalpy than fluorine because fluorine’s compact 2p shell has greater repulsion.`],
      ['Describe the long form of the periodic table and relate position to electronic configuration.',`The long form has seven periods and eighteen groups. The period equals the highest occupied shell number. The differentiating electron determines the block: ns¹–² gives s block; ns²np¹–⁶ gives p block; (n−1)d¹–¹⁰ns⁰–² gives d block; and (n−2)f¹–¹⁴ gives f block.

For p-block elements, group number is generally 10 plus the number of valence electrons. Helium is placed in group 18 because its shell is complete despite 1s² configuration. Lanthanoids and actinoids are displayed separately to keep the table compact.`],
      ['Explain important anomalies in periodic properties using electronic configuration.',`Boron has lower first ionisation enthalpy than beryllium because the electron removed from B is a higher-energy 2p electron, while Be has stable 2s². Oxygen is lower than nitrogen because O has one paired 2p electron with extra repulsion, whereas N has stable 2p³.

Fluorine has less negative electron-gain enthalpy than chlorine because its very small 2p orbital produces strong incoming-electron repulsion. Noble gases have very high ionisation enthalpy and positive or near-zero electron-gain enthalpy because their valence shells are complete.`]
    ]
  },
  {
    name:'Chemical Bonding and Molecular Structure', focus:'Lewis structures, VSEPR shapes, hybridisation, hydrogen bonding and molecular-orbital bond order dominate board questions.', diagram:'molecular-shapes.svg',
    facts:[
      ['Ionic bond','An ionic bond is the electrostatic attraction between oppositely charged ions formed after electron transfer.'],
      ['Covalent bond','A covalent bond forms by mutual sharing of one or more electron pairs between atoms.'],
      ['Formal charge','Formal charge = valence electrons − lone-pair electrons − ½(bonding electrons); minimum charge separation favours a Lewis structure.'],
      ['Bond order','For comparable atoms, greater bond order normally means shorter and stronger bonding. In MO theory, bond order = ½(Nᵦ−Nₐ).'],
      ['VSEPR principle','Electron pairs around a central atom arrange themselves to minimise repulsion: LP–LP > LP–BP > BP–BP.'],
      ['Hybridisation','Hybridisation is mixing of similar-energy atomic orbitals on one atom to form equivalent, directed hybrid orbitals.'],
      ['Coordinate bond','In a coordinate covalent bond, both shared electrons are donated by the same atom, as in NH₄⁺ formation.'],
      ['Resonance','The actual molecule is a resonance hybrid of contributing Lewis structures and is more stable than any one contributor.'],
      ['Hydrogen bonding','Hydrogen bonding occurs when H bonded to F, O or N interacts with a lone pair on an electronegative atom.'],
      ['Dipole moment','Dipole moment μ = qr measures bond or molecular polarity; molecular geometry determines whether bond moments cancel.']
    ],
    long:[
      ['Explain VSEPR theory and predict the shapes of BeCl₂, BF₃, CH₄, NH₃, H₂O and PCl₅.',`VSEPR theory states that valence-shell electron pairs stay as far apart as possible. Multiple bonds act as one electron domain but repel more strongly; lone pairs occupy more space and compress bond angles.

BeCl₂: two bond pairs, linear, 180°. BF₃: three bond pairs, trigonal planar, 120°. CH₄: four bond pairs, tetrahedral, 109.5°. NH₃: three bond pairs and one lone pair, trigonal pyramidal, about 107°. H₂O: two bond pairs and two lone pairs, bent, about 104.5°. PCl₅: five bond pairs, trigonal bipyramidal, with three equatorial and two axial positions.`],
      ['Describe hybridisation and geometry in methane, ethene, ethyne and PCl₅.',`In CH₄, carbon uses sp³ hybridisation: one s and three p orbitals form four tetrahedral hybrids, producing four σ bonds at 109.5°. In ethene, each carbon is sp² hybridised; three coplanar sp² orbitals form σ bonds and the unhybridised p orbitals overlap sideways to form one π bond.

In ethyne, each carbon is sp hybridised and linear; two perpendicular unhybridised p pairs form two π bonds in addition to the C–C σ bond. In PCl₅, phosphorus uses sp³d description with trigonal-bipyramidal arrangement. Clearly distinguish head-on σ overlap from sidewise π overlap.`],
      ['Explain molecular-orbital theory and compare O₂, O₂⁺, O₂⁻ and O₂²⁻ using bond order and magnetism.',`Atomic orbitals of suitable energy and symmetry combine to form bonding and antibonding molecular orbitals. Electrons fill them by Aufbau, Pauli and Hund rules. Bond order = ½(Nᵦ−Nₐ); a positive value indicates bonding.

O₂ has bond order 2 and two unpaired π* electrons, so it is paramagnetic. Removing one antibonding electron gives O₂⁺ bond order 2.5. Adding one gives O₂⁻ bond order 1.5 with one unpaired electron. Adding two gives peroxide O₂²⁻ bond order 1 and all electrons paired. Thus bond strength follows O₂⁺ > O₂ > O₂⁻ > O₂²⁻, while bond length follows the reverse order.`]
    ]
  },
  {
    name:'States of Matter: Gases and Liquids', focus:'Gas-law numericals, kinetic theory, molecular speeds and real-gas graphs are standard scoring problems.', diagram:'gas-laws.svg',
    facts:[
      ['Boyle’s law','At constant temperature and amount, pressure is inversely proportional to volume: P₁V₁ = P₂V₂.'],
      ['Charles’s law','At constant pressure and amount, volume is directly proportional to absolute temperature: V₁/T₁ = V₂/T₂.'],
      ['Ideal gas equation','For n moles of an ideal gas, PV = nRT. Temperature must be in kelvin.'],
      ['Dalton’s law','The total pressure of non-reacting gases is the sum of partial pressures: P = ΣPᵢ; Pᵢ = xᵢP.'],
      ['Graham’s law','At the same temperature and pressure, diffusion or effusion rate is inversely proportional to √M.'],
      ['RMS speed','Root-mean-square speed uᵣₘₛ = √(3RT/M); molecular speeds rise with temperature and fall with molar mass.'],
      ['Kinetic pressure','Kinetic theory gives P = ⅓ρuᵣₘₛ², relating gas pressure to molecular motion.'],
      ['Compressibility factor','Z = PV/nRT. For an ideal gas Z=1; deviation from unity measures real-gas behaviour.'],
      ['Critical temperature','Critical temperature is the highest temperature at which a gas can be liquefied by pressure alone.'],
      ['Surface tension and viscosity','Surface tension minimises liquid surface area; viscosity resists flow. Both depend on intermolecular forces and temperature.']
    ],
    long:[
      ['Derive the ideal gas equation from the gas laws and explain the significance of R.',`Boyle’s law gives V ∝ 1/P at constant T and n. Charles’s law gives V ∝ T at constant P and n. Avogadro’s law gives V ∝ n at constant P and T. Combining: V ∝ nT/P, hence PV = nRT.

R is the universal gas constant: 8.314 J mol⁻¹ K⁻¹ in SI units or 0.0821 L atm mol⁻¹ K⁻¹. Use absolute temperature. For a fixed sample, P₁V₁/T₁ = P₂V₂/T₂. State assumptions of ideal behaviour: negligible molecular volume and intermolecular attraction.`],
      ['State the postulates of kinetic molecular theory and derive P = ⅓ρuᵣₘₛ².',`A gas contains many tiny molecules in continuous random motion; their own volume is negligible, intermolecular forces are absent except during collision, collisions are perfectly elastic, and collision time is negligible.

For N molecules of mass m in a cube, momentum transfer to a wall gives P = (Nm/V)⟨cₓ²⟩. Random motion makes ⟨cₓ²⟩ = ⟨c²⟩/3. Since density ρ = Nm/V and uᵣₘₛ² = ⟨c²⟩, P = ⅓ρuᵣₘₛ². With PV=NkT, the mean translational kinetic energy per molecule is 3kT/2.`],
      ['Explain deviation of real gases from ideal behaviour and the van der Waals correction.',`Real molecules have finite volume and attractions. Attractive forces reduce the observed pressure, so pressure is corrected as P + an²/V². Available volume is less than container volume, so volume is corrected as V − nb. The van der Waals equation is (P + an²/V²)(V − nb) = nRT.

At low pressure and high temperature, molecules are far apart and real gases approach ideal behaviour. Z<1 shows attraction dominates; Z>1 shows repulsion or excluded-volume effects dominate. Liquefaction is favoured below the critical temperature by cooling and compression.`]
    ]
  },
  {
    name:'Stoichiometry', focus:'Mole concept, concentration, formula calculations and redox balancing offer reliable numerical and equation-based marks.', diagram:'stoichiometry-redox.svg',
    facts:[
      ['Mole','One mole contains 6.022 × 10²³ specified entities. Amount n = mass/molar mass.'],
      ['Molar mass','Molar mass is the mass of one mole of a substance, expressed in g mol⁻¹.'],
      ['Limiting reagent','The limiting reagent is consumed first in stoichiometric proportion and therefore fixes the maximum product yield.'],
      ['Empirical formula','An empirical formula gives the simplest whole-number ratio of atoms; molecular formula = empirical formula × n.'],
      ['Molarity','Molarity M = moles of solute/litre of solution and changes with temperature because volume changes.'],
      ['Molality','Molality m = moles of solute/kg of solvent and is temperature independent.'],
      ['Oxidation number','Oxidation number is formal electron bookkeeping; its algebraic sum equals zero in a neutral compound and ionic charge in an ion.'],
      ['Oxidation and reduction','Oxidation is electron loss or increase in oxidation number; reduction is electron gain or decrease in oxidation number.'],
      ['Disproportionation','In disproportionation, the same species is simultaneously oxidised and reduced to products with higher and lower oxidation numbers.'],
      ['Equivalent mass','Equivalent mass = molar mass/n-factor; equivalents of reacting oxidant and reductant are equal at the equivalence point.']
    ],
    long:[
      ['Explain the mole concept and solve the general steps for stoichiometric calculations.',`Write and balance the chemical equation. Convert each given amount to moles using n=m/M, n=V/22.4 L for an ideal gas at STP when appropriate, or n=MV for a solution. Divide available moles by the stoichiometric coefficient to identify the limiting reagent.

Use the mole ratio to calculate product moles, then convert to mass, volume or particles using the required relation. Percentage yield = actual yield/theoretical yield ×100. Always retain units and appropriate significant figures.`],
      ['Describe how empirical and molecular formulae are determined from percentage composition.',`Assume 100 g of compound, so each percentage becomes grams. Divide each elemental mass by its atomic mass to obtain relative moles. Divide all mole values by the smallest and multiply when necessary to obtain whole-number ratios; these give the empirical formula.

Calculate empirical-formula mass E. If molar mass M is given, n=M/E must be a whole number. Molecular formula = (empirical formula)ₙ. Verify that the calculated percentages and molar mass match the data.`],
      ['Balance a redox equation by the ion–electron method and state the checking rules.',`Separate oxidation and reduction half-reactions. Balance atoms other than O and H. In acidic medium balance O with H₂O, H with H⁺ and charge with electrons. Multiply half-reactions to equalise electrons, add and cancel common species.

For basic medium, add OH⁻ to both sides to neutralise H⁺, convert it to H₂O and cancel excess water. Finally verify equality of every atom and net charge on the two sides. Identify oxidising agent as the species reduced and reducing agent as the species oxidised.`]
    ]
  },
  {
    name:'Thermodynamics', focus:'First law, enthalpy cycles, calorimetry, spontaneity and Gibbs-energy calculations are major LAQ areas.', diagram:'hess-cycle.svg',
    facts:[
      ['System and surroundings','The system is the chosen part of the universe under study; everything else is the surroundings.'],
      ['State function','A state function depends only on initial and final states, not path; U, H, S and G are state functions.'],
      ['First law','Using the chemistry sign convention, ΔU = q + w; expansion work at constant external pressure is w = −PₑₓₜΔV.'],
      ['Enthalpy','H = U + PV. At constant pressure with only PV work, heat exchanged qₚ = ΔH.'],
      ['Extensive and intensive','Extensive properties depend on amount, such as mass and U; intensive properties do not, such as temperature and pressure.'],
      ['Hess’s law','The enthalpy change of a reaction is independent of path and equals the sum of enthalpy changes of suitable steps.'],
      ['Formation enthalpy','Standard enthalpy of formation forms one mole of a substance from elements in their standard states.'],
      ['Entropy','Entropy measures energy dispersal or number of accessible arrangements; an isolated system tends toward increasing total entropy.'],
      ['Gibbs energy','At constant T and P, ΔG = ΔH − TΔS; ΔG<0 is spontaneous, ΔG=0 equilibrium and ΔG>0 non-spontaneous forward.'],
      ['Calorimetry','At constant heat capacity, q = mcΔT; in an isolated calorimeter, heat lost equals heat gained.']
    ],
    long:[
      ['State the first law of thermodynamics and derive the relation between ΔH and ΔU for a gaseous reaction.',`The first law expresses energy conservation: ΔU = q + w. With pressure–volume work w = −PₑₓₜΔV, heat absorbed raises internal energy or is used for expansion.

H = U + PV, hence ΔH = ΔU + Δ(PV). For ideal gases at fixed temperature, PV=nRT, so Δ(PV)=Δn_gRT. Therefore ΔH = ΔU + Δn_gRT, where Δn_g = gaseous product moles − gaseous reactant moles. Include only gaseous species and use the balanced equation.`],
      ['Explain Hess’s law and calculate reaction enthalpy using formation or bond enthalpy data.',`Hess’s law follows because enthalpy is a state function. Thermochemical equations may be reversed (change the sign of ΔH), multiplied (multiply ΔH by the same factor), and added to obtain the target equation.

Using formation data: ΔᵣH° = ΣνΔfH°(products) − ΣνΔfH°(reactants). Using average bond enthalpies for gas-phase estimates: ΔH ≈ ΣBE(bonds broken) − ΣBE(bonds formed). Write coefficients, units and physical states; these are common sources of lost marks.`],
      ['Discuss spontaneity using entropy and Gibbs energy and explain the effect of temperature.',`At constant T and P, ΔG = ΔH − TΔS. A process is thermodynamically spontaneous when ΔG<0, but it need not be fast. If ΔH<0 and ΔS>0, it is spontaneous at all temperatures. If ΔH>0 and ΔS<0, it is never spontaneous.

For ΔH<0, ΔS<0, low temperature favours spontaneity. For ΔH>0, ΔS>0, high temperature favours it. At equilibrium ΔG=0 and, when ΔH and ΔS are treated as constant, the crossover temperature is T=ΔH/ΔS. Convert entropy units before substitution.`]
    ]
  },
  {
    name:'Chemical Equilibrium and Acids–Bases', focus:'Kc/Kp, Le Chatelier, pH, buffers and solubility product produce frequent numericals and explanations.', diagram:'equilibrium-ph.svg',
    facts:[
      ['Dynamic equilibrium','At equilibrium, forward and reverse reaction rates are equal while concentrations remain constant, not necessarily equal.'],
      ['Equilibrium constant','For aA+bB⇌cC+dD, Kc=[C]ᶜ[D]ᵈ/[A]ᵃ[B]ᵇ using equilibrium concentrations; pure solids and liquids are omitted.'],
      ['Kp and Kc','For gaseous reactions, Kp = Kc(RT)^Δn, where Δn = gaseous product coefficients − gaseous reactant coefficients.'],
      ['Reaction quotient','Q has the form of K using current concentrations. Q<K drives forward, Q>K reverse and Q=K means equilibrium.'],
      ['Le Chatelier principle','An equilibrium shifts in the direction that opposes an imposed concentration, pressure or temperature change.'],
      ['Brønsted acid and base','A Brønsted acid donates H⁺ and a base accepts H⁺; conjugate pairs differ by one proton.'],
      ['Lewis acid and base','A Lewis acid accepts an electron pair, while a Lewis base donates an electron pair.'],
      ['pH and ionic product','pH=−log[H⁺]. At 298 K, Kw=[H⁺][OH⁻]=1.0×10⁻¹⁴ and pH+pOH=14.'],
      ['Buffer','A buffer contains a weak acid/base and its conjugate partner and resists small additions of acid or base.'],
      ['Solubility product','Ksp is the equilibrium product of ion concentrations raised to stoichiometric powers for a sparingly soluble salt.']
    ],
    long:[
      ['Derive the relation between Kp and Kc and explain the meaning of equilibrium constant.',`For a gaseous reaction aA+bB⇌cC+dD, Kp=(P_CᶜP_Dᵈ)/(P_AᵃP_Bᵇ). Since each partial pressure Pᵢ=CᵢRT, substitution gives Kp=Kc(RT)^(c+d−a−b)=Kc(RT)^Δn.

K depends only on temperature. K≫1 means products predominate; K≪1 means reactants predominate. It does not give reaction speed. Reversing a reaction gives 1/K; multiplying coefficients by n gives Kⁿ; adding reactions multiplies their equilibrium constants.`],
      ['Explain Le Chatelier’s principle using the Haber process and contact process.',`For N₂+3H₂⇌2NH₃, ΔH<0. High pressure favours the side with fewer gas moles and lower temperature favours ammonia, but a moderate temperature is used for adequate rate. Removing NH₃ shifts the reaction forward. Iron catalyst speeds both directions without changing K or equilibrium composition.

For 2SO₂+O₂⇌2SO₃, ΔH<0, high pressure and low temperature favour SO₃; practical conditions balance yield, rate and cost. Concentration and pressure change composition, temperature changes K, while catalyst only shortens time to equilibrium.`],
      ['Explain pH of weak acids, buffer action and solubility product with useful formulae.',`For weak monoprotic acid HA of concentration C and small ionisation, Ka=x²/(C−x)≈x²/C, so [H⁺]=x≈√(KaC) and pH=−log[H⁺]. For an acidic buffer, pH=pKa+log([A⁻]/[HA]). Added H⁺ is consumed by A⁻; added OH⁻ is consumed by HA.

For AB(s)⇌A⁺+B⁻, Ksp=s² in pure water. For CaF₂, Ksp=[Ca²⁺][F⁻]²=s(2s)²=4s³. Precipitation is expected when ionic product exceeds Ksp. A common ion lowers molar solubility.`]
    ]
  },
  {
    name:'Hydrogen and its Compounds', focus:'Hydrides, hardness of water, hydrogen peroxide and heavy water are traditional reaction-rich board questions.', diagram:'hydrogen-peroxide.svg',
    facts:[
      ['Isotopes of hydrogen','Protium ¹H has no neutron, deuterium ²H has one and tritium ³H has two neutrons; tritium is radioactive.'],
      ['Hydrides','Hydrides are classified as ionic or saline, covalent or molecular, and metallic or non-stoichiometric.'],
      ['Hard water','Hardness is caused mainly by Ca²⁺ and Mg²⁺ salts; bicarbonates cause temporary hardness, while chlorides and sulphates cause permanent hardness.'],
      ['Temporary hardness removal','Boiling or lime treatment decomposes soluble bicarbonates and precipitates insoluble carbonates or hydroxides.'],
      ['Permanent hardness removal','Washing soda precipitates Ca²⁺/Mg²⁺ as carbonates; ion-exchange or zeolite methods replace hardness ions.'],
      ['Hydrogen peroxide structure','H₂O₂ is non-planar with an open-book structure; each oxygen is approximately sp³ hybridised.'],
      ['H₂O₂ oxidation state','Oxygen has oxidation number −1 in H₂O₂, so it can act as both oxidising and reducing agent.'],
      ['Heavy water','Heavy water D₂O contains deuterium; it is used as moderator and coolant in some nuclear reactors.'],
      ['Hydrogen fuel','Hydrogen has high calorific value and forms water on combustion, but storage, transport and production route affect safety and sustainability.'],
      ['Water anomaly','Hydrogen bonding explains unusually high boiling point, heat capacity and surface tension of water and the open structure of ice.']
    ],
    long:[
      ['Describe preparation, properties, structure and uses of hydrogen peroxide.',`Laboratory preparation: BaO₂·8H₂O + H₂SO₄(dilute, cold) → BaSO₄↓ + H₂O₂ + 8H₂O. Industrial production commonly uses an anthraquinone cycle. Pure H₂O₂ is pale blue, viscous and decomposes as 2H₂O₂→2H₂O+O₂; light and impurities accelerate decomposition, so it is stored in dark, stabilised containers.

Its non-planar open-book structure contains an O–O single bond. It oxidises Fe²⁺ to Fe³⁺ in acid and reduces strong oxidants such as acidified KMnO₄, itself forming O₂. Uses include bleaching, disinfection, pollution control and chemical synthesis.`],
      ['Explain temporary and permanent hardness of water and methods for removing each.',`Temporary hardness is due to Ca(HCO₃)₂ and Mg(HCO₃)₂. Boiling forms insoluble CaCO₃ and Mg(OH)₂. Clark’s lime method adds calculated Ca(OH)₂ to precipitate hardness.

Permanent hardness is due mainly to Ca/Mg chlorides and sulphates. Washing soda supplies CO₃²⁻ to precipitate carbonates. Zeolite exchanges Na⁺ for Ca²⁺/Mg²⁺ and is regenerated with brine. Ion-exchange resins can remove both cations and anions to demineralise water. State one balanced representative equation for full marks.`],
      ['Classify hydrides and explain their characteristic properties with examples.',`Ionic hydrides such as NaH and CaH₂ contain H⁻, are crystalline and react with water to release H₂. Covalent hydrides are molecular compounds of p-block elements; they may be electron-deficient (B₂H₆), electron-precise (CH₄) or electron-rich (NH₃, H₂O).

Metallic hydrides are formed by many d- and f-block metals, are often non-stoichiometric and conduct electricity. Classification should be based on bonding and electronic character, followed by at least two correct examples and one characteristic reaction or use.`]
    ]
  },
  {
    name:'The s-Block Elements', focus:'Anomalous behaviour, diagonal relationships and preparation/properties of sodium and calcium compounds are common long answers.', diagram:'sblock-flame.svg',
    facts:[
      ['s-block configuration','Group 1 elements have ns¹ and group 2 elements have ns² valence configurations.'],
      ['Alkali reactivity','Alkali-metal reactivity increases down the group as ionisation enthalpy decreases; they are stored away from air and moisture.'],
      ['Flame colours','Li gives crimson red, Na golden yellow, K lilac and Ca brick red due to characteristic electronic excitation.'],
      ['Lithium anomaly','Lithium differs because of very small size, high polarising power, high hydration enthalpy and absence of d orbitals.'],
      ['Li–Mg diagonal relation','Li and Mg form nitrides, their carbonates decompose on heating, and their fluorides are sparingly soluble.'],
      ['Beryllium anomaly','Beryllium compounds are mainly covalent; BeO and Be(OH)₂ are amphoteric because Be²⁺ is small and strongly polarising.'],
      ['Solvay process','Sodium carbonate is manufactured by precipitating NaHCO₃ from ammoniated brine and calcining it.'],
      ['Baking soda','NaHCO₃ is a mild base used in baking powder, antacids and fire extinguishers; on heating it gives Na₂CO₃, CO₂ and H₂O.'],
      ['Plaster of Paris','CaSO₄·½H₂O is plaster of Paris; with water it sets to gypsum, CaSO₄·2H₂O.'],
      ['Biological importance','Na⁺ and K⁺ maintain membrane potential and fluid balance; Ca²⁺ supports bones, clotting and contraction, while Mg²⁺ activates enzymes.']
    ],
    long:[
      ['Explain the anomalous behaviour of lithium and its diagonal relationship with magnesium.',`Lithium is unusually small, has high ionisation enthalpy, high hydration enthalpy and strong polarising power. It forms Li₃N directly, mainly Li₂O on combustion, and its carbonate and nitrate decompose on heating. LiF, Li₂CO₃ and Li₃PO₄ are comparatively sparingly soluble.

Lithium resembles magnesium diagonally: both form nitrides; carbonates decompose to oxides; fluorides are sparingly soluble; chlorides are deliquescent and show covalent character; bicarbonates exist mainly in solution. Relate each similarity to comparable charge density and polarising power.`],
      ['Describe manufacture of sodium carbonate by the Solvay process with equations and recycling.',`Purified brine is saturated with NH₃ and CO₂. NH₃+CO₂+H₂O→NH₄HCO₃; then NH₄HCO₃+NaCl→NaHCO₃↓+NH₄Cl. Sodium hydrogen carbonate is filtered and heated: 2NaHCO₃→Na₂CO₃+CO₂+H₂O.

CO₂ is regenerated by CaCO₃→CaO+CO₂. CaO+H₂O→Ca(OH)₂, which recovers ammonia: 2NH₄Cl+Ca(OH)₂→2NH₃+CaCl₂+2H₂O. The net raw materials are brine and limestone; ammonia is recycled.`],
      ['Describe important compounds of calcium: quicklime, slaked lime, gypsum and plaster of Paris.',`Quicklime CaO is formed by calcining limestone: CaCO₃→CaO+CO₂. Adding water gives slaked lime: CaO+H₂O→Ca(OH)₂, used in mortar, whitewash and neutralisation.

Gypsum is CaSO₄·2H₂O. Heating it near 373 K gives plaster of Paris, CaSO₄·½H₂O. On mixing with water, plaster resets to interlocking gypsum crystals: CaSO₄·½H₂O+1½H₂O→CaSO₄·2H₂O. Controlled heating is essential; excessive heating produces dead-burnt plaster.`]
    ]
  },
  {
    name:'The p-Block Elements – Group 13', focus:'Boron anomaly and structures, preparation and reactions of borax, boric acid and diborane are core board material.', diagram:'diborane.svg',
    facts:[
      ['Group 13 configuration','Group 13 elements have valence configuration ns²np¹ and commonly show +3 oxidation state.'],
      ['Inert-pair effect','Down the group, the +1 state becomes more stable relative to +3 because the ns² pair increasingly resists bonding.'],
      ['Boron anomaly','Boron is a hard non-metal and forms covalent, electron-deficient compounds because of its small size and high ionisation enthalpy.'],
      ['Lewis acidity of BX₃','Boron trihalides are Lewis acids because boron has an incomplete octet; BF₃ is weaker than BCl₃ due to pπ–pπ back bonding.'],
      ['Borax','Borax is Na₂B₄O₇·10H₂O and gives alkaline solution due to hydrolysis.'],
      ['Boric acid','H₃BO₃ is a weak monobasic Lewis acid; it accepts OH⁻ from water rather than directly donating three protons.'],
      ['Diborane','B₂H₆ contains four terminal two-centre bonds and two B–H–B three-centre two-electron bridge bonds.'],
      ['Aluminium amphoterism','Al₂O₃ and Al(OH)₃ react with both acids and bases and are therefore amphoteric.'],
      ['Aluminium chloride','Anhydrous AlCl₃ is covalent and exists as dimer Al₂Cl₆ because electron-deficient Al accepts chloride lone pairs.'],
      ['Borax bead test','On heating, borax forms a glassy B₂O₃ bead that dissolves metal oxides and develops characteristic colours.']
    ],
    long:[
      ['Describe the structure and bonding of diborane and explain its important reactions.',`Diborane has four terminal B–H bonds in one plane and two bridging hydrogen atoms above and below it. Each bridge is a three-centre two-electron B–H–B banana bond, explaining electron deficiency. The terminal bonds are ordinary two-centre two-electron bonds.

It is prepared by reducing boron halides, for example 4BF₃+3LiAlH₄→2B₂H₆+3LiF+3AlF₃. It burns to B₂O₃ and water, hydrolyses to boric acid and H₂, and forms donor adducts with Lewis bases. Draw and label terminal and bridge hydrogens.`],
      ['Explain preparation, properties and uses of borax and boric acid.',`Borax may be obtained from natural deposits or by treating borate minerals. In water it hydrolyses to boric acid and NaOH, so the solution is alkaline. On heating it loses water, swells and finally gives transparent B₂O₃ glass used in the borax bead test.

Acidifying a hot borax solution gives H₃BO₃. Boric acid has layered hydrogen-bonded structure and acts as a monobasic Lewis acid: B(OH)₃+2H₂O⇌[B(OH)₄]⁻+H₃O⁺. On heating it successively forms metaboric acid, tetraboric acid and B₂O₃. Uses include borosilicate glass, enamels and mild antiseptic formulations.`],
      ['Discuss trends in Group 13 and explain anomalous behaviour of boron.',`Atomic and ionic radii generally increase down the group, while irregular shielding by d and f electrons causes deviations. +3 is common, but +1 stability increases down the group due to inert-pair effect. Metallic character increases from B to Tl.

Boron is non-metallic, does not form B³⁺ in ordinary chemistry, forms covalent and electron-deficient compounds, and has high melting point. Aluminium is metallic and amphoteric. Explain BF₃ Lewis acidity, covalent halides and the inability of boron to expand its octet using its small size and absence of low-energy d orbitals.`]
    ]
  },
  {
    name:'The p-Block Elements – Group 14', focus:'Carbon anomaly, allotropes and compounds of carbon and silicon feature in descriptive and structure-based questions.', diagram:'carbon-silicon.svg',
    facts:[
      ['Group 14 configuration','Group 14 elements have ns²np² valence configuration and show +4 and +2 oxidation states.'],
      ['Catenation','Catenation is self-linking into chains and rings; carbon shows it strongly because the C–C bond is small and strong.'],
      ['Carbon anomaly','Carbon differs through small size, high electronegativity, strong multiple bonding and absence of vacant d orbitals.'],
      ['Diamond','Diamond is a three-dimensional sp³ covalent network, extremely hard and an electrical insulator.'],
      ['Graphite','Graphite has sp² hexagonal layers with delocalised electrons, making it soft and electrically conducting.'],
      ['Carbon monoxide','CO is colourless, odourless and toxic because it binds haemoglobin strongly; it is a reducing agent and ligand.'],
      ['Carbon dioxide','CO₂ is linear and non-polar overall; it is an acidic oxide and contributes to greenhouse warming.'],
      ['Silica','SiO₂ is a giant covalent network of corner-linked SiO₄ tetrahedra and therefore has high melting point.'],
      ['Silicones','Silicones contain alternating –Si–O–Si– chains with organic groups and show thermal stability and water repellence.'],
      ['Zeolites','Zeolites are porous hydrated aluminosilicates used as molecular sieves, ion exchangers and catalysts.']
    ],
    long:[
      ['Compare diamond and graphite in structure, bonding and properties.',`Diamond: each carbon is sp³ hybridised and tetrahedrally bonded to four others in a rigid 3D network. All valence electrons are localised in σ bonds, so diamond is extremely hard, has high thermal conductivity and is an electrical insulator.

Graphite: each carbon is sp² hybridised and bonded to three atoms in planar hexagonal sheets. The remaining p electrons are delocalised, so graphite conducts electricity. Weak forces between layers allow them to slide, making graphite soft and lubricating. Link every property to the drawn structure.`],
      ['Explain preparation, properties and uses of carbon monoxide and carbon dioxide.',`CO is prepared in the laboratory by dehydrating formic acid with concentrated H₂SO₄ and industrially in producer or water gas. It burns to CO₂, reduces heated metal oxides and forms metal carbonyls. Its strong binding to haemoglobin makes it poisonous.

CO₂ may be produced by acid on a carbonate. It is linear, an acidic oxide, does not support ordinary combustion and reacts with bases to form carbonates/bicarbonates. It is used in fire extinguishers, carbonated drinks, dry ice and controlled atmospheres. Excess atmospheric CO₂ contributes to greenhouse warming.`],
      ['Describe the structures and uses of silica, silicates, silicones and zeolites.',`Silica is a 3D network in which each Si is tetrahedrally bonded to four O atoms and each O bridges two Si atoms. Silicates are built from SiO₄ tetrahedra that may be isolated, form chains, sheets or frameworks by sharing corners.

Silicones have –R₂Si–O– repeating backbones and may be oils, rubbers or resins; they resist heat and water. Zeolites are porous aluminosilicate frameworks containing exchangeable cations and water. Their uniform pores allow molecular sieving, ion exchange, water softening and shape-selective catalysis.`]
    ]
  },
  {
    name:'Environmental Chemistry', focus:'Pollutant sources, mechanisms, effects and control measures support direct, highly scorable answers.', diagram:'pollution-cycle.svg',
    facts:[
      ['Primary and secondary pollutants','Primary pollutants are emitted directly; secondary pollutants such as ozone in smog form by atmospheric reactions.'],
      ['Photochemical smog','Sunlight acts on NOₓ and hydrocarbons to form oxidants such as O₃ and PAN, causing eye and respiratory irritation.'],
      ['Acid rain','Rain with pH below about 5.6 results mainly when SO₂ and NOₓ form sulphuric and nitric acids.'],
      ['Greenhouse effect','Greenhouse gases absorb outgoing infrared radiation; their enhanced concentration raises Earth’s average temperature.'],
      ['Ozone depletion','Stratospheric chlorine radicals from CFCs catalytically convert ozone to oxygen, increasing harmful UV-B at the surface.'],
      ['BOD','Biochemical oxygen demand measures oxygen used by microorganisms to oxidise biodegradable matter; high BOD signals organic pollution.'],
      ['Eutrophication','Excess nutrients cause algal growth, decomposition and dissolved-oxygen depletion in water bodies.'],
      ['Particulate matter','Fine particles enter deep into lungs, reduce visibility and can carry toxic chemicals; size strongly affects health risk.'],
      ['Soil pollution','Persistent pesticides, plastics, salts and industrial wastes degrade soil organisms, fertility and food-chain safety.'],
      ['Green chemistry','Green chemistry designs products and processes that reduce hazardous substances, waste and energy use at the source.']
    ],
    long:[
      ['Explain photochemical smog: formation, effects and control.',`In sunny urban air, NO₂ absorbs light and forms NO and atomic oxygen; O combines with O₂ to form ozone. Hydrocarbon radicals convert NO back to NO₂ without consuming ozone and generate PAN, aldehydes and other oxidants. This brown oxidising smog irritates eyes and lungs, damages plants, rubber and materials, and reduces visibility.

Control requires catalytic converters, low-emission fuels, vehicle maintenance, public transport, vapour recovery and reduction of NOₓ and volatile-organic emissions. Do not confuse it with sulphurous smog associated with coal smoke and humid conditions.`],
      ['Describe causes, effects and control of water pollution using BOD and eutrophication.',`Domestic sewage, industrial effluents, fertiliser runoff, pesticides, oil and heated discharges pollute water. Biodegradable organic matter raises BOD as microbes consume dissolved oxygen, stressing aquatic life. Nitrate and phosphate enrichment causes eutrophication: algal bloom, reduced light, decomposition, oxygen depletion and fish death.

Control includes primary screening/sedimentation, biological secondary treatment, nutrient removal, disinfection, effluent standards, safe sanitation and reduced fertiliser runoff. Lower BOD after treatment indicates removal of biodegradable load.`],
      ['Explain acid rain, greenhouse warming and ozone depletion with key chemical steps and prevention.',`SO₂ and NOₓ are oxidised and hydrated to H₂SO₄ and HNO₃, producing acid deposition that damages lakes, soil, monuments and vegetation. CO₂, CH₄, N₂O and other greenhouse gases enhance infrared trapping and climate warming.

In the stratosphere, UV light releases Cl radicals from CFCs: Cl·+O₃→ClO·+O₂; ClO·+O→Cl·+O₂, giving net O₃+O→2O₂. Prevention includes low-sulphur energy, NOₓ controls, efficiency and renewables, methane reduction, and replacement/recovery of ozone-depleting substances.`]
    ]
  },
  {
    name:'Organic Chemistry – Basic Principles, Techniques and Hydrocarbons', focus:'IUPAC naming, isomerism, electronic effects, mechanisms, purification and hydrocarbon reactions dominate the organic portion.', diagram:'organic-reactions.svg',
    facts:[
      ['Homologous series','A homologous series has the same functional group and general formula; successive members differ by –CH₂– and show graded physical properties.'],
      ['Functional group','A functional group is the atom or group responsible for characteristic organic reactions, such as –OH, –CHO or –COOH.'],
      ['Structural isomerism','Structural isomers have the same molecular formula but different connectivity, including chain, position and functional isomerism.'],
      ['Inductive effect','The inductive effect is permanent σ-bond electron displacement caused by electronegativity or charge and decreases with distance.'],
      ['Resonance effect','Resonance delocalises π or lone-pair electrons; the real hybrid is more stable than any contributing structure.'],
      ['Hyperconjugation','Hyperconjugation delocalises adjacent C–H σ electrons into a π bond or empty p orbital and stabilises substituted alkenes and carbocations.'],
      ['Electrophile and nucleophile','An electrophile accepts an electron pair; a nucleophile donates an electron pair to an electron-deficient centre.'],
      ['Carbocation stability','Simple carbocation stability is generally 3°>2°>1°>CH₃⁺ due to +I effect and hyperconjugation; resonance can dominate.'],
      ['Markovnikov rule','In addition of HX to an unsymmetrical alkene, H usually adds to the carbon already bearing more H, through the more stable carbocation.'],
      ['Aromaticity of benzene','Benzene is planar, cyclic and conjugated with six π electrons satisfying the 4n+2 rule; it prefers substitution over addition.']
    ],
    long:[
      ['Explain IUPAC nomenclature and structural isomerism with a systematic method.',`Choose the longest parent chain containing the principal functional group and maximum multiple bonds. Number it to give the principal group, multiple bond and substituents the lowest permitted locants in that order. Name substituents alphabetically, use multiplicative prefixes, then write parent prefix, unsaturation and suffix with correct locants.

Structural isomers differ in connectivity: chain isomers have different carbon skeletons, position isomers differ in location of substituent or multiple bond, and functional isomers have different functional groups. Draw complete structures and verify valency and molecular formula.`],
      ['Explain homolytic and heterolytic bond fission, reaction intermediates and electronic effects.',`Homolysis divides a bond equally to give radicals and is favoured by heat, light or non-polar conditions. Heterolysis gives ions and is favoured by polar bonds/solvents. Carbocations are electron-deficient and usually planar; carbanions contain a lone pair; radicals contain an unpaired electron.

Inductive effect is σ polarisation and weakens with distance. Resonance delocalises electrons across conjugated p orbitals. Hyperconjugation delocalises adjacent C–H σ bonding electrons. Use these effects to explain intermediate stability, acidity/basicity and orientation of reactions.`],
      ['Describe preparation and characteristic reactions of alkanes, alkenes, alkynes and benzene.',`Alkanes are prepared by hydrogenation, Wurtz reaction or decarboxylation and undergo combustion and free-radical halogen substitution. Alkenes are prepared by dehydration of alcohols or dehydrohalogenation and undergo electrophilic addition of H₂, X₂, HX and water, oxidation and polymerisation.

Alkynes are formed by double dehydrohalogenation; they undergo addition and terminal alkynes form metal acetylides because of acidic hydrogen. Benzene undergoes electrophilic substitution: nitration, sulphonation, halogenation and Friedel–Crafts reactions. For each, state reagent/condition, balanced transformation, major product and governing rule.`]
    ]
  }
];

const priority = i => i < 4 ? 'Must revise' : i < 7 ? 'High yield' : 'Core syllabus';
const label = term => term.replace(/^[Tt]he /,'');

const data = {
  subject:'Chemistry', icon:'🧪', classLevel:11, board:'Telangana Intermediate',
  source:{academicYear:'2026-2027 preparation',kind:'TGBIE-aligned reference syllabus and March 2026 paper analysis',note:'The 2026–27 syllabus was not yet officially published when the bank was prepared; all 13 chapters in the latest available first-year reference syllabus are covered.'},
  description:'Complete Telangana Intermediate First Year Chemistry board bank: all 13 chapters, 130 VSAQs, 65 SAQs and 39 LAQs with equations, numerical methods, reactions and labelled diagrams.',
  chapters:chapters.map((chapter,index)=>{
    const number=index+1;
    const base={
      id:`class11-chemistry-${String(number).padStart(2,'0')}`, number, name:chapter.name,
      topics:chapter.facts.map(x=>x[0]), resources:[], mcqs:[],
      examAnalysis:{
        pattern:'VSAQ 2 marks • SAQ 4 marks • LAQ 8 marks',
        approach:'Start with the definition or governing principle. Write balanced equations and conditions, show every numerical step with units, and use a labelled structure or graph where it earns marks.',
        sourceNote:`Board-paper focus: ${chapter.focus} Priority labels guide revision and are not predictions of exact questions.`
      }
    };
    base.vsaq=chapter.facts.map(([term,answer],i)=>({
      id:`c11-chem-${number}-v-${i+1}`, marks:2, priority:priority(i),
      question:i%3===0?`Define or explain ${label(term)}.`:i%3===1?`Write the key statement for ${label(term)}.`:`State the important relation or chemical significance of ${label(term)}.`,
      answer:`${answer}\n\nExam line: Write the definition first, then add the relation, condition or one suitable example.`, keyPoints:`${term} • definition • condition • example`
    }));
    base.saq=Array.from({length:5},(_,i)=>{
      const a=chapter.facts[i*2], b=chapter.facts[i*2+1];
      return {
        id:`c11-chem-${number}-s-${i+1}`, marks:4, priority:priority(i),
        question:i%2===0?`Explain ${a[0]} and ${b[0]} with the relevant relation, reason or example.`:`Differentiate or connect ${a[0]} and ${b[0]}. Give the chemical basis and one example.`,
        answer:`1. ${a[0]}: ${a[1]}\n2. ${b[0]}: ${b[1]}\n3. Chemical link: State how electronic structure, intermolecular force, equilibrium or stoichiometry connects the two ideas in this chapter.\n4. Scoring presentation: Add the relevant equation/formula, define symbols and write one correct example or condition.`,
        keyPoints:`${a[0]} • ${b[0]} • reason • equation • example`
      };
    });
    base.laq=chapter.long.map(([question,answer],i)=>({
      id:`c11-chem-${number}-l-${i+1}`, marks:8, priority:i===0?'Must revise':'High yield', question,
      answer:`Answer plan: Begin with the law, definition or correctly balanced reaction. Organise the body under short steps and show conditions above the reaction arrow.\n\n${answer}\n\nScoring finish: Check atoms and charge, include units in numericals, underline the final relation or product, and label the diagram if used.`,
      keyPoints:question.replace(/[?.]/g,'').split(' ').slice(0,10).join(' • '),
      ...(i===0?{diagram:`assets/chemistry-board/${chapter.diagram}`,diagramAlt:`Labelled board-exam Chemistry diagram for ${chapter.name}`}:{})
    }));
    return base;
  }),
  boardAnalysis:{
    exam:'Telangana Intermediate First Year Chemistry', duration:'3 hours', maximumMarks:60,
    sections:[
      {name:'Section A',format:'VSAQ',marks:'10 × 2 = 20',rule:'Answer all 10. Give the exact definition, relation/reason and one example where useful.'},
      {name:'Section B',format:'SAQ',marks:'6 × 4 = 24',rule:'Eight are given; answer any six. Use four clear points, equations and conditions.'},
      {name:'Section C',format:'LAQ',marks:'2 × 8 = 16',rule:'Three are given; answer any two. Present principle, steps, equations/derivation, diagram and result.'}
    ],
    note:'The March 2026 paper used 10 compulsory 2-mark VSAQs, 8 four-mark SAQs with any 6, and 3 eight-mark LAQs with any 2. This 234-answer bank covers all 13 chapters in the latest available first-year reference syllabus, with extra breadth for revision rather than predicting the exact paper.'
  }
};

fs.writeFileSync(file,JSON.stringify(data,null,2)+'\n');
console.log(`Built ${data.chapters.length} Chemistry chapters and ${data.chapters.reduce((n,c)=>n+c.vsaq.length+c.saq.length+c.laq.length,0)} answers.`);
