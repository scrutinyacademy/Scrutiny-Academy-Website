/** Original practice variants. Shared by the portal, content builder and validators. */
const normal=s=>String(s).trim().replace(/\s+/g,' ').toLowerCase();
const label=s=>normal(s).replace(/^[a-d]\. /,'').replace(/^which scientific association is correct for [“"](.+?)[”"]\?$/,'$1').replace(/ is:$/,'');
export function semanticSignature(q){
 if(q.expansionKind==='match')return 'match:'+q.associations.map(x=>label(x.label)+'='+normal(x.correct)).sort().join('|');
 if(q.table?.headers?.length===2&&q.table.rows?.length<=4){
  const mapping=String(q.options?.[q.answer]||'').match(/[A-D][–-][1-4]/g);
  if(mapping?.length===q.table.rows.length){
   const right=q.table.rows.map(r=>String(r[1]).replace(/^\d+\. /,''));
   const pairs=q.table.rows.map((r,i)=>label(r[0])+'='+normal(right[Number(mapping[i].at(-1))-1]));
   return 'match:'+pairs.sort().join('|');
  }
 }
 if(q.expansionKind==='statements')return 'statements:'+q.statements.map(x=>normal(x)).sort().join('|');
 if(q.expansionKind==='association')return 'association:'+normal(q.options[q.answer])+'|'+q.options.map(normal).sort().join('|');
 return normal(q.question)+JSON.stringify(q.table||'');
}
function permutations(values){return values.length===1?[values]:values.flatMap((x,i)=>permutations(values.filter((_,j)=>i!==j)).map(rest=>[x,...rest]));}
const orders={3:permutations([0,1,2]),4:permutations([0,1,2,3])};
const fmt=n=>Number(n.toPrecision(5)).toString();
function place(correct,wrong,pos){const options=wrong.slice(0,3);options.splice(pos,0,correct);return {options,answer:pos};}
const T=(formula,unit,values,prompt,calc)=>({formula,unit,values,prompt,calc});
const int=(r,a,b)=>a+r()%(b-a+1);
export const numericalTemplates={
 'neet-physics-11-1':[T('percentage error = 100 × absolute error / measured value','%',r=>[int(r,10,90),int(r,1,9)/10],v=>`A length is measured as (${v[0]} ± ${v[1]}) cm. What is the percentage error in the length?`,v=>100*v[1]/v[0])],
 'neet-physics-11-2':[T('v = u + at','m s⁻¹',r=>[int(r,0,15),int(r,1,8),int(r,2,15)],v=>`A particle starts with velocity ${v[0]} m s⁻¹ and accelerates uniformly at ${v[1]} m s⁻² along its motion for ${v[2]} s. Find its final velocity.`,v=>v[0]+v[1]*v[2])],
 'neet-physics-11-3':[T('R = u² sin(2θ)/g','m',r=>[int(r,10,60),[30,45,60][r()%3]],v=>`A projectile is launched at ${v[0]} m s⁻¹ at ${v[1]}° above horizontal and lands at its launch height. Neglect air resistance and take g = 10 m s⁻². Find its horizontal range.`,v=>v[0]**2*Math.sin(2*v[1]*Math.PI/180)/10)],
 'neet-physics-11-4':[T('net force = ma','N',r=>[int(r,2,20),int(r,1,9)],v=>`A ${v[0]} kg body has acceleration ${v[1]} m s⁻². What is the magnitude of the net force on it?`,v=>v[0]*v[1])],
 'neet-physics-11-5':[T('K = ½mv²','J',r=>[int(r,2,20),int(r,2,20)],v=>`A body of mass ${v[0]} kg moves at ${v[1]} m s⁻¹. Find its kinetic energy.`,v=>.5*v[0]*v[1]**2)],
 'neet-physics-11-6':[T('I = ½MR²','kg m²',r=>[int(r,2,20),int(r,2,20)/10],v=>`A uniform solid disc has mass ${v[0]} kg and radius ${v[1]} m. Find its moment of inertia about its symmetry axis perpendicular to its plane.`,v=>.5*v[0]*v[1]**2)],
 'neet-physics-11-7':[T('g(h) = g₀R²/(R+h)²','m s⁻²',r=>[int(r,1,15)/10],v=>`For a spherical planet with surface gravity 10 m s⁻², find gravity at height h = ${v[0]}R above its surface, where R is its radius. Ignore rotation.`,v=>10/(1+v[0])**2)],
 'neet-physics-11-8':[T('Y = FL/(AΔL)','Pa',r=>[int(r,10,90),int(r,1,9),int(r,1,9),int(r,1,9)/10],v=>`A wire ${v[1]} m long and cross-sectional area ${v[2]} mm² extends by ${v[3]} mm under tensile force ${v[0]} N within its elastic limit. Find Young’s modulus.`,v=>v[0]*v[1]/(v[2]*1e-6*v[3]*1e-3))],
 'neet-physics-11-9':[T('gauge pressure = ρgh','Pa',r=>[int(r,1,20)/2],v=>`Find the gauge pressure at depth ${v[0]} m in stationary water of density 1000 kg m⁻³. Take g = 10 m s⁻².`,v=>10000*v[0])],
 'neet-physics-11-10':[T('Q = mcΔT','J',r=>[int(r,1,20)/10,int(r,5,60)],v=>`How much heat raises the temperature of ${v[0]} kg of water by ${v[1]} K without a phase change? Use c = 4200 J kg⁻¹ K⁻¹.`,v=>v[0]*4200*v[1])],
 'neet-physics-11-11':[T('ΔU = Q − W (W done by gas)','J',r=>[int(r,20,90)*10,int(r,1,15)*10],v=>`An ideal gas absorbs ${v[0]} J of heat and does ${v[1]} J of work on its surroundings. Find its change in internal energy.`,v=>v[0]-v[1])],
 'neet-physics-11-12':[T('U = (3/2)nRT for a monatomic ideal gas','J',r=>[int(r,1,9)/2,int(r,20,60)*10],v=>`Find the internal energy of ${v[0]} mol of a monatomic ideal gas at ${v[1]} K, taking R = 8.31 J mol⁻¹ K⁻¹.`,v=>1.5*v[0]*8.31*v[1])],
 'neet-physics-11-13':[T('T = 2π√(m/k)','s',r=>[int(r,1,20)/10,int(r,10,90)*10],v=>`A mass ${v[0]} kg attached to an ideal spring of force constant ${v[1]} N m⁻¹ executes SHM without damping. Find its period.`,v=>2*Math.PI*Math.sqrt(v[0]/v[1]))],
 'neet-physics-11-14':[T('v = fλ','m s⁻¹',r=>[int(r,10,90)*10,int(r,1,20)/10],v=>`A travelling wave has frequency ${v[0]} Hz and wavelength ${v[1]} m in a medium. Find its speed.`,v=>v[0]*v[1])],
 'neet-physics-12-1':[T('F = k|q₁q₂|/r²','N',r=>[int(r,1,9),int(r,1,9),int(r,1,9)/10],v=>`Two point charges of magnitudes ${v[0]} μC and ${v[1]} μC are ${v[2]} m apart in vacuum. Find the force magnitude, taking k = 9 × 10⁹ N m² C⁻².`,v=>9e9*v[0]*v[1]*1e-12/v[2]**2)],
 'neet-physics-12-2':[T('U = ½CV²','J',r=>[int(r,1,90),int(r,2,90)],v=>`A ${v[0]} μF capacitor is charged to ${v[1]} V. Find the energy stored in it.`,v=>.5*v[0]*1e-6*v[1]**2)],
 'neet-physics-12-3':[T('P = V²/R','W',r=>[int(r,2,40),int(r,2,40)],v=>`An ohmic resistor of resistance ${v[1]} Ω is connected across ${v[0]} V. Find its electrical power.`,v=>v[0]**2/v[1])],
 'neet-physics-12-4':[T('F = |q|vB sinθ','N',r=>[int(r,1,9),int(r,1,9),int(r,1,9)/10],v=>`A charge of magnitude ${v[0]} μC moves at ${v[1]} × 10⁴ m s⁻¹ perpendicular to a uniform magnetic field of ${v[2]} T. Find the magnetic force magnitude.`,v=>v[0]*1e-6*v[1]*1e4*v[2])],
 'neet-physics-12-5':[T('τ = μB sinθ','N m',r=>[int(r,1,20)/10,int(r,1,20)/10,[30,60,90][r()%3]],v=>`A magnetic dipole of moment ${v[0]} A m² makes angle ${v[2]}° with a uniform field of ${v[1]} T. Find the torque magnitude.`,v=>v[0]*v[1]*Math.sin(v[2]*Math.PI/180))],
 'neet-physics-12-6':[T('|ε| = N|ΔΦ|/Δt','V',r=>[int(r,1,20)*10,int(r,1,20)/1000,int(r,1,20)/10],v=>`Flux through each turn of a ${v[0]}-turn coil changes uniformly by ${v[1]} Wb in ${v[2]} s. Find the induced emf magnitude.`,v=>v[0]*v[1]/v[2])],
 'neet-physics-12-7':[T('Iᵣₘₛ = I₀/√2','A',r=>[int(r,1,90)/2],v=>`A sinusoidal current has peak magnitude ${v[0]} A. Find its RMS value.`,v=>v[0]/Math.SQRT2)],
 'neet-physics-12-8':[T('E₀ = cB₀','V m⁻¹',r=>[int(r,1,90)/10],v=>`An electromagnetic wave in vacuum has peak magnetic field ${v[0]} μT. Find the peak electric field, taking c = 3 × 10⁸ m s⁻¹.`,v=>300*v[0])],
 'neet-physics-12-9':[T('1/f = 1/v − 1/u; u = −object distance','cm',r=>[int(r,5,30),int(r,2,6)],v=>`A real object is placed ${v[0]*v[1]} cm in front of a convex thin lens of focal length ${v[0]} cm. Find the positive image distance using the Cartesian convention.`,v=>v[0]*v[1]/(v[1]-1))],
 'neet-physics-12-10':[T('β = λD/d','mm',r=>[int(r,4,7)*100,int(r,1,30)/10,int(r,1,20)/10],v=>`In Young’s double-slit experiment, wavelength is ${v[0]} nm, screen distance ${v[1]} m and slit separation ${v[2]} mm. Find fringe width in mm using the small-angle approximation.`,v=>v[0]*1e-3*v[1]/v[2])],
 'neet-physics-12-11':[T('Kₘₐₓ = E(photon) − work function','eV',r=>[int(r,20,40)/10,int(r,45,90)/10],v=>`Light with photon energy ${v[1]} eV illuminates a metal whose work function is ${v[0]} eV. Find maximum photoelectron kinetic energy.`,v=>v[1]-v[0])],
 'neet-physics-12-12':[T('rₙ = 0.529 n²/Z Å','Å',r=>[int(r,1,6),int(r,1,5)],v=>`For a hydrogen-like one-electron ion with nuclear charge Z = ${v[1]}, find the Bohr radius of orbit n = ${v[0]}. Use a₀ = 0.529 Å.`,v=>.529*v[0]**2/v[1])],
 'neet-physics-12-13':[T('binding energy = mass defect × 931.5 MeV/u','MeV',r=>[int(r,10,200)/1000],v=>`A nucleus has mass defect ${v[0]} u. Find its total binding energy using 1 u c² = 931.5 MeV.`,v=>v[0]*931.5)],
 'neet-physics-12-14':[T('I = (V − 0.7)/R for the stated forward diode model','mA',r=>[int(r,2,15),int(r,1,20)*100],v=>`A forward-biased silicon diode with constant voltage drop 0.7 V is in series with ${v[1]} Ω across a ${v[0]} V DC source. Find the current in mA.`,v=>1000*(v[0]-.7)/v[1])],
 'neet-chemistry-11-1':[T('n = m/M','mol',r=>[int(r,1,90),[18,44,58.5][r()%3]],v=>`A sample has mass ${v[0]} g and molar mass ${v[1]} g mol⁻¹. Find its amount in moles.`,v=>v[0]/v[1])],
 'neet-chemistry-11-2':[T('maximum electrons = 2n²','electrons',r=>[int(r,1,7)],v=>`What is the maximum number of electrons accommodated in a shell with principal quantum number n = ${v[0]}?`,v=>2*v[0]**2)],
 'neet-chemistry-11-4':[T('bond order = ½(Nb − Na)','',r=>[int(r,6,16),int(r,0,4)],v=>`A diatomic molecule has ${v[0]} bonding electrons and ${v[1]} antibonding electrons in its molecular-orbital description. Find its bond order.`,v=>(v[0]-v[1])/2)],
 'neet-chemistry-11-5':[T('ΔU = q + w (w done on system)','J',r=>[int(r,20,90)*10,int(r,1,15)*10],v=>`A closed chemical system absorbs ${v[0]} J of heat while doing ${v[1]} J of work on its surroundings. Find ΔU using the chemistry sign convention.`,v=>v[0]-v[1])],
 'neet-chemistry-11-6':[T('pH = −log₁₀[H⁺]','',r=>[int(r,1,9),int(r,2,6)],v=>`A dilute aqueous solution has [H⁺] = ${v[0]} × 10⁻${v[1]} mol L⁻¹. Using the ideal concentration approximation, find its pH.`,v=>v[1]-Math.log10(v[0]))],
 'neet-chemistry-12-1':[T('ΔTf = iKfm','K',r=>[int(r,1,20)/10,int(r,1,20)/10],v=>`A non-electrolyte forms an ideal dilute solution of molality ${v[0]} mol kg⁻¹ in a solvent with Kf = ${v[1]} K kg mol⁻¹. Find freezing-point depression. Take i = 1.`,v=>v[0]*v[1])],
 'neet-chemistry-12-2':[T('m = QM/(zF)','g',r=>[int(r,1,20)*965,[27,63.5,108][r()%3]],v=>`A charge of ${v[0]} C deposits metal with molar mass ${v[1]} g mol⁻¹ from ${v[1]===27?'M³⁺':v[1]===63.5?'M²⁺':'M⁺'} ions at 100% current efficiency. Find deposited mass. Take F = 96500 C mol⁻¹.`,v=>v[0]*v[1]/((v[1]===27?3:v[1]===63.5?2:1)*96500))],
 'neet-chemistry-12-3':[T('t½ = ln2/k','s',r=>[int(r,1,90)/1000],v=>`A first-order reaction has rate constant ${v[0]} s⁻¹. Find its half-life.`,v=>Math.LN2/v[0])],
 'neet-chemistry-12-4':[T('μ = √[n(n+2)] μB','μB',r=>[int(r,1,5)],v=>`An ion has ${v[0]} unpaired electrons. Find its spin-only magnetic moment in Bohr magnetons.`,v=>Math.sqrt(v[0]*(v[0]+2)))],
};
export function expandChapter(ch,subject,start=1){
 return ch.specs.map((spec,index)=>{
  const serial=start+index,refs=[{sourceLabel:`NCERT Class ${ch.classLevel} ${subject==='biology'?'Biology':subject==='physics'?'Physics':'Chemistry'}${ch.labManual?' / Laboratory Manual':''}`,section:ch.name}];
  const common={id:`NEET-UG-15K-${ch.id}-${String(serial).padStart(4,'0')}`,subject:subject[0].toUpperCase()+subject.slice(1),chapter:ch.name,classLevel:ch.classLevel,questionType:'Match-the-column',difficulty:'Moderate',provenance:'Original NCERT-mapped practice variant; not an official PYQ',references:refs,ncertBasis:`Concept map for ${ch.name}`,expansionRelease:'2026-10-14',topic:ch.name,conceptIds:[]};
  if(spec[0]==='numerical'){
   const t=numericalTemplates[ch.id][spec[1]],v=spec[2],value=t.calc(v),correct=fmt(value)+(t.unit?' '+t.unit:'');
   const wrong=[value*2,value/2,value*1.5].map(x=>fmt(x)+(t.unit?' '+t.unit:''));
   return {...common,expansionKind:'numerical',question:t.prompt(v),...place(correct,wrong,spec[3]),questionType:'Numerical',topic:t.formula,formulaUsed:t.formula,calculation:`${t.formula}; result = ${correct}`,finalAnswer:correct,unit:t.unit,explanation:`Apply ${t.formula}. Convert the given quantities to the units used in the formula before substitution. With the stated values the result is ${correct}.`,solutionSteps:[t.formula,`Input values: ${v.join(', ')} in the units in the question.`,`Result: ${correct}`],commonTrap:'Check powers, unit conversions and the stated physical conditions before calculating.'};
  }
  const rows=spec[1].map(i=>ch.rows[i]);common.conceptIds=rows.map(r=>r.key);
  if(spec[0]==='statements'){
   const truth=spec[2],flags=[Boolean(truth&1),Boolean(truth&2)];
   const statements=rows.map((r,i)=>`${r.label}: ${flags[i]?r.correct:r.wrong[0]}`);
   const choices=['Both I and II are correct','Only I is correct','Only II is correct','Neither I nor II is correct'];
   const correct=choices[flags[0]?(flags[1]?0:1):(flags[1]?2:3)];
   return {...common,expansionKind:'statements',statements,question:`Assess the two statements independently. I. ${statements[0]} II. ${statements[1]}`,...place(correct,choices.filter(x=>x!==correct),spec[3]),questionType:'Statement I/II',explanation:rows.map((r,i)=>`${i?'II':'I'} is ${flags[i]?'correct':'incorrect'}. ${r.label}: ${r.correct}. ${r.explanation}`).join(' '),commonTrap:'Evaluate each statement separately; one correct statement does not make the other correct.'};
  }
  if(spec[0]==='association'){
   const truth=spec[2],correct=`${rows[truth].label}: ${rows[truth].correct}`;
   const wrong=rows.filter((_,i)=>i!==truth).map(r=>`${r.label}: ${r.wrong[0]}`);
   return {...common,expansionKind:'association',question:'Which scientific association is correct?',...place(correct,wrong,spec[3]),questionType:'Single correct',explanation:`${correct}. ${rows[truth].explanation} The other choices use known misconceptions for their stated concepts.`,commonTrap:'Check both parts of each association; a familiar term paired with the wrong property remains incorrect.'};
  }
  const permutations=orders[rows.length],order=permutations[spec[2]%permutations.length];
  const right=order.map(i=>rows[i].correct),mapping=rows.map(r=>right.indexOf(r.correct));
  const code=p=>p.map((n,i)=>`${'ABCD'[i]}–${n+1}`).join(', '),correct=code(mapping);
  const wrong=permutations.filter(p=>p.join()!==mapping.join()).slice(0,3).map(code);
  return {...common,expansionKind:'match',associations:rows.map(({label,correct})=>({label,correct})),question:`Match the ${rows.length===4?'four':'three'} entries in List I with their corresponding entries in List II. Choose the correct mapping code.`,...place(correct,wrong,spec[3]),table:{caption:ch.name+' — concept comparison',headers:['List I','List II'],rows:rows.map((r,i)=>[`${'ABCD'[i]}. ${r.label}`,`${i+1}. ${right[i]}`])},explanation:`Correct mapping: ${correct}. `+rows.map((r,i)=>`${'ABCD'[i]}: ${r.label} — ${r.correct}. ${r.explanation}`).join(' '),commonTrap:'Match every row independently and verify the complete code before selecting an option.'};
 });
}
export function mergeExpansion(base,pack){
 if(pack.version!==1||pack.subject!==base.subject.toLowerCase())throw Error('NEET practice pack mismatch');
 const additions=new Map(pack.chapters.map(ch=>[ch.id,ch]));
 const chapters=base.chapters.map(ch=>({...ch,mcqs:[...ch.mcqs]}));
 for(const ch of chapters){const extra=additions.get(ch.id);if(!extra)continue;const qs=expandChapter(extra,pack.subject);ch.mcqs.push(...qs);if(ch.subtopics?.length)ch.subtopics=[...ch.subtopics,{id:ch.id+'-15k-mixed',name:'Additional NCERT practice',ncertSections:ch.name,mcqs:qs,importance:'High'}];additions.delete(ch.id);}
 for(const ch of additions.values())chapters.push({id:ch.id,name:ch.name,classLevel:ch.classLevel,mcqs:expandChapter(ch,pack.subject)});
 return {...base,chapters,expansion:{release:pack.release,added:pack.chapters.reduce((n,ch)=>n+ch.specs.length,0)}};
}
