const base = require('./neetss-base.cjs');
const expansion = require('./neetss-phase2.cjs');
const breadth = require('./neetss-phase3.cjs');
const companion = require('./neetss-bailey.cjs');
const part1 = require('./neetss-bailey28.cjs');
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
module.exports={version:'bailey28-part1-2026-10-14',books:[companion.book,part1.book],modules:[...base.modules,...expansion.modules,...breadth.modules,...companion.modules,...part1.modules],questions:[...base.questions,...expansion.questions,...breadth.questions,...companion.questions,...part1.questions],cards:[...base.cards,...expansion.cards,...breadth.cards,...companion.cards,...part1.cards],cases:expansion.cases,atlas:expansion.atlas,targets:{mcqsPerChapter:250,cardsPerChapter:150,totalMcqs:17000,totalCards:3000},review:{checkedAt:'2026-10-14',status:'Source-linked educational summaries; independent surgeon review pending',limitations:'Focused coverage across 18 domains, including 16 focused units from 28th-edition Part 1. The 17,000-MCQ/3,000-card target remains incomplete. Attributed book figures are cropped from user-supplied references; the full textbooks are not redistributed.'}};
