import fs from 'node:fs';
import path from 'node:path';
const out=path.resolve(import.meta.dirname,'../assets/botany'); fs.mkdirSync(out,{recursive:true});
const base=(title,subtitle,body)=>`<svg xmlns="http://www.w3.org/2000/svg" width="900" height="540" viewBox="0 0 900 540" role="img" aria-labelledby="t d"><title id="t">${title}</title><desc id="d">${subtitle}</desc><defs><style>.h{font:700 28px Arial;fill:#103f37}.s{font:15px Arial;fill:#5c716c}.l{font:700 15px Arial;fill:#153c35}.n{font:13px Arial;fill:#294b44}.lne{stroke:#426d63;stroke-width:2;fill:none}.g{fill:#dcf4e9;stroke:#08765d;stroke-width:3}.b{fill:#e8f1ff;stroke:#2864b7;stroke-width:3}.y{fill:#fff1bd;stroke:#c58b00;stroke-width:3}.p{fill:#f6e6f5;stroke:#9b4a91;stroke-width:3}</style></defs><rect width="900" height="540" rx="24" fill="#fbfdfc"/><text x="42" y="52" class="h">${title}</text><text x="42" y="78" class="s">${subtitle}</text>${body}<text x="42" y="515" class="s">Scrutiny Academy • Board-answer diagram • Practise drawing with a sharp pencil</text></svg>`;
const write=(name,title,subtitle,body)=>fs.writeFileSync(path.join(out,name),base(title,subtitle,body));

write('plant-kingdom.svg','Plant Kingdom — evolutionary overview','Increasing structural complexity and sporophyte independence',`
<path d="M90 390 C220 350 260 265 380 260 S560 175 790 145" class="lne" stroke-width="7"/>
${[['Algae',115,375,'Thallus'],['Bryophytes',255,300,'Embryophytes'],['Pteridophytes',405,235,'Vascular'],['Gymnosperms',575,175,'Seeds'],['Angiosperms',755,125,'Flowers']].map(([a,x,y,b])=>`<circle cx="${x}" cy="${y}" r="45" class="g"/><text x="${x}" y="${y}" class="l" text-anchor="middle">${a}</text><text x="${x}" y="${y+20}" class="n" text-anchor="middle">${b}</text>`).join('')}
<text x="115" y="455" class="n" text-anchor="middle">No embryo</text><text x="405" y="330" class="n" text-anchor="middle">Dominant sporophyte</text><text x="690" y="250" class="n" text-anchor="middle">Pollen + protected embryo</text>`);

write('flower-morphology.svg','Typical flower — longitudinal section','Label whorls from outside to inside and show ovary position',`
<path d="M435 445 Q450 320 445 115" class="lne" stroke-width="12"/><ellipse cx="445" cy="290" rx="62" ry="102" class="g"/><circle cx="445" cy="265" r="12" class="y"/><circle cx="445" cy="305" r="12" class="y"/>
<path d="M425 205 Q335 110 295 190 Q345 250 425 250 M465 205 Q555 110 595 190 Q545 250 465 250" class="p"/>
<path d="M420 345 Q330 300 315 380 Q380 400 430 360 M470 345 Q560 300 575 380 Q510 400 460 360" class="g"/>
<path d="M370 170 Q390 230 400 285 M520 170 Q500 230 490 285" class="lne"/><ellipse cx="366" cy="160" rx="14" ry="27" class="y"/><ellipse cx="524" cy="160" rx="14" ry="27" class="y"/>
<path d="M445 188 L445 110" class="lne" stroke-width="8"/><ellipse cx="445" cy="100" rx="34" ry="13" class="p"/>
<path d="M595 190 L735 135" class="lne"/><text x="746" y="140" class="l">Corolla (petal)</text><path d="M575 380 L735 405" class="lne"/><text x="746" y="410" class="l">Calyx (sepal)</text><path d="M524 160 L690 215" class="lne"/><text x="700" y="220" class="l">Anther</text><path d="M445 100 L245 110" class="lne"/><text x="95" y="115" class="l">Stigma</text><path d="M445 290 L220 290" class="lne"/><text x="90" y="295" class="l">Ovary + ovules</text>`);

write('double-fertilisation.svg','Double fertilisation in an angiosperm','Syngamy produces the zygote; triple fusion produces primary endosperm nucleus',`
<ellipse cx="560" cy="300" rx="145" ry="180" class="g"/><ellipse cx="560" cy="300" rx="82" ry="130" class="b"/><circle cx="560" cy="385" r="18" class="y"/><circle cx="525" cy="405" r="12" class="p"/><circle cx="595" cy="405" r="12" class="p"/><circle cx="545" cy="285" r="13" class="y"/><circle cx="575" cy="285" r="13" class="y"/>
<path d="M120 135 C260 135 300 245 455 360" class="lne" stroke-width="9"/><circle cx="110" cy="135" r="30" class="y"/><circle cx="405" cy="330" r="10" class="p"/><circle cx="430" cy="350" r="10" class="p"/>
<path d="M430 350 L535 380 M405 330 L545 285" class="lne" stroke-dasharray="7 5"/>
<text x="60" y="95" class="l">Pollen grain</text><text x="205" y="205" class="l">Pollen tube</text><text x="620" y="385" class="l">Egg → zygote (2n)</text><text x="610" y="275" class="l">Polar nuclei → PEN (3n)</text><text x="650" y="485" class="l">Embryo sac inside ovule</text>`);

write('floral-families.svg','Diagnostic floral families','Use symmetry, stamens, ovary and fruit to identify a family',`
${[['FABACEAE','Zygomorphic','10 stamens: 9+1','Legume',165,'g'],['SOLANACEAE','Actinomorphic','5 epipetalous','Berry / capsule',450,'b'],['LILIACEAE','Trimerous','6 epiphyllous','Capsule / berry',735,'p']].map(([a,b,c,d,x,k])=>`<circle cx="${x}" cy="225" r="105" class="${k}"/><circle cx="${x}" cy="225" r="55" fill="none" stroke="#446b62" stroke-width="2"/><text x="${x}" y="205" class="l" text-anchor="middle">${a}</text><text x="${x}" y="232" class="n" text-anchor="middle">${b}</text><text x="${x}" y="254" class="n" text-anchor="middle">${c}</text><text x="${x}" y="395" class="l" text-anchor="middle">Fruit: ${d}</text>`).join('')}`);

write('plant-cell.svg','Plant cell — major organelles','Cell wall, large vacuole and plastids distinguish a typical plant cell',`
<rect x="170" y="105" width="560" height="350" rx="75" class="g"/><rect x="190" y="125" width="520" height="310" rx="62" fill="#f1fbf7" stroke="#478578" stroke-width="3"/><ellipse cx="500" cy="285" rx="145" ry="115" class="b"/><circle cx="315" cy="220" r="55" class="p"/><circle cx="315" cy="220" r="20" class="y"/>
<ellipse cx="600" cy="175" rx="58" ry="25" class="g"/><path d="M555 175h90M565 165h70M565 185h70" class="lne"/><ellipse cx="285" cy="365" rx="52" ry="25" class="y"/><path d="M245 365q20-25 40 0t40 0" class="lne"/>
<path d="M170 165 L70 135" class="lne"/><text x="28" y="130" class="l">Cell wall</text><path d="M315 220 L95 225" class="lne"/><text x="30" y="230" class="l">Nucleus</text><path d="M500 285 L785 285" class="lne"/><text x="795" y="290" class="l">Central vacuole</text><path d="M600 175 L780 145" class="lne"/><text x="790" y="150" class="l">Chloroplast</text><path d="M285 365 L100 405" class="lne"/><text x="30" y="415" class="l">Mitochondrion</text>`);

write('cell-division.svg','Mitosis — four continuous stages','Chromosome behaviour during equational division',`
${[['Prophase','XX  XX'],['Metaphase','X X X'],['Anaphase','V     V'],['Telophase','( ) ( )']].map(([a,b],i)=>{const x=135+i*210;return `<circle cx="${x}" cy="260" r="80" class="${i%2?'b':'g'}"/><text x="${x}" y="267" text-anchor="middle" class="l" font-size="22">${b}</text><text x="${x}" y="375" text-anchor="middle" class="l">${a}</text>${i<3?`<path d="M${x+90} 260h30" class="lne"/><path d="M${x+115} 250l12 10-12 10" class="lne"/>`:''}`}).join('')}
<text x="135" y="415" text-anchor="middle" class="n">Condensation</text><text x="345" y="415" text-anchor="middle" class="n">Equatorial plate</text><text x="555" y="415" text-anchor="middle" class="n">Chromatid separation</text><text x="765" y="415" text-anchor="middle" class="n">Two nuclei</text>`);

write('dicot-anatomy.svg','Young dicot stem — transverse section','Conjoint, collateral, open vascular bundles arranged in a ring',`
<circle cx="420" cy="290" r="180" class="g"/><circle cx="420" cy="290" r="145" fill="#f6fbf9" stroke="#75a799" stroke-width="3"/><circle cx="420" cy="290" r="60" class="y"/>
${Array.from({length:8},(_,i)=>{const a=i*Math.PI/4,x=420+112*Math.cos(a),y=290+112*Math.sin(a);return `<ellipse cx="${x}" cy="${y}" rx="25" ry="38" transform="rotate(${i*45+90} ${x} ${y})" class="b"/><circle cx="${420+92*Math.cos(a)}" cy="${290+92*Math.sin(a)}" r="9" class="y"/>`}).join('')}
<path d="M420 290 L705 260" class="lne"/><text x="715" y="265" class="l">Pith</text><path d="M525 245 L720 175" class="lne"/><text x="730" y="180" class="l">Open vascular bundle</text><path d="M265 165 L100 130" class="lne"/><text x="25" y="125" class="l">Epidermis</text><path d="M285 200 L95 250" class="lne"/><text x="25" y="255" class="l">Cortex</text>`);

write('ecological-adaptations.svg','Ecological adaptations','Form follows water availability in hydrophytes, mesophytes and xerophytes',`
<rect x="55" y="125" width="240" height="315" rx="20" class="b"/><rect x="330" y="125" width="240" height="315" rx="20" class="g"/><rect x="605" y="125" width="240" height="315" rx="20" class="y"/>
<text x="175" y="165" class="l" text-anchor="middle">HYDROPHYTE</text><path d="M175 390V220M175 265q-75-45-80 15q55 25 80 5M175 240q70-45 82 12q-50 30-82 12" class="lne" stroke-width="7"/><text x="175" y="420" class="n" text-anchor="middle">Aerenchyma • reduced roots</text>
<text x="450" y="165" class="l" text-anchor="middle">MESOPHYTE</text><path d="M450 390V215M450 275q-75-50-85 10q55 35 85 10M450 245q70-50 85 10q-55 35-85 10" class="lne" stroke-width="7"/><text x="450" y="420" class="n" text-anchor="middle">Ordinary leaf and roots</text>
<text x="725" y="165" class="l" text-anchor="middle">XEROPHYTE</text><path d="M725 390V215M725 255l-55-40M725 255l55-40M725 300l-55 45M725 300l55 45" class="lne" stroke-width="12"/><text x="725" y="420" class="n" text-anchor="middle">Spines • thick cuticle • deep roots</text>`);
console.log('Built 8 labelled Botany SVG diagrams.');
