const base = require('./neetss-base.cjs');
const expansion = require('./neetss-phase2.cjs');
const legacySources = {
  sepsis: 'https://doi.org/10.1007/s00134-021-06506-y',
  shock: 'https://doi.org/10.1186/s13054-023-04327-7',
  ssi: 'https://www.who.int/publications/i/item/9789241550475',
};
base.modules.forEach(m => {
  m.sourceUrl=legacySources[m.id];
  m.revision=m.sections.map(([a,b])=>[a,b]).concat([['Clinical pearl',m.pearl]]);
});
base.questions.forEach((q,i)=>{
  q.id=`p1-${i+1}`;
  q.provenance='Original Scrutiny Academy practice; not an official PYQ';
  q.type='Single best answer';
  q.sourceUrl=i<4?legacySources.sepsis:i<8?legacySources.shock:legacySources.ssi;
});
base.questions[2].ref=expansion.refs.uro.label;
base.questions[2].sourceUrl=expansion.refs.uro.url;
base.questions[10].why='Prophylaxis should not be extended solely because a drain remains. Treat established infection separately using source control, cultures and the clinical course.';
// Keep all legacy indexes/IDs stable so earlier histories and Mistake Books survive.
module.exports={version:expansion.version,modules:[...base.modules,...expansion.modules],questions:[...base.questions,...expansion.questions],cards:[...base.cards,...expansion.cards],cases:expansion.cases,atlas:expansion.atlas,review:{checkedAt:'2026-10-11',status:'Source-checked educational summaries; independent surgeon review pending',limitations:'Focused Phase 2 expansion, not comprehensive coverage of all 18 domains. Diagrams are original schematics, not patient images.'}};
