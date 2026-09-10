import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';
const root = path.resolve(import.meta.dirname, '..');
const read = p => JSON.parse(fs.readFileSync(path.join(root, p), 'utf8'));
const data = read('data/neet/biology.json');
const figures = read('data/sources/figures.json');
const configs = [['cell',8,84], ['biomolecules',9,103], ['division',10,119]];
const rows = name => fs.readFileSync(path.join(root,'scripts/biology-concepts',name),'utf8').split('\n').filter(l=>l.trim()&&!l.startsWith('#')).map(l=>l.split('|'));
const rotate = (list,n) => list.slice(n).concat(list.slice(0,n));

for (const [source, chapterNumber, offset] of configs) {
  const index = read(`data/sources/${source}.json`);
  const ch = data.chapters.find(c=>c.id===`neet-biology-11-${chapterNumber}`);
  const references = pointers => [...new Set(pointers.split(','))].map(pointer => {
    const [pdfPage,paragraph] = pointer.split('.').map(Number);
    const block = index.pages.find(p=>p.pdfPage===pdfPage)?.paragraphs.find(b=>b.paragraph===paragraph);
    assert.ok(block,`Unknown reference ${source}:${pointer}`);
    return {source, pdfPage, printedPage:pdfPage+offset, paragraph, lineStart:block.lineStart, lineEnd:block.lineEnd};
  });
  const concepts = rows(`${source}-sourced.txt`).map(r=>{
    assert.equal(r.length,7);
    const [label,correct,...tail]=r;
    return {label,correct,distractors:tail.slice(0,3),explanation:tail[3],pointers:tail[4]};
  });
  assert.equal(concepts.length,90);
  const mcqs=[];
  function add(question,options,answer,explanation,pointers,extra={}) {
    const number=mcqs.length+1;
    const shift=(number*7+chapterNumber)%4;
    const shuffled=rotate(options,shift);
    assert.equal(new Set(shuffled).size,4,question);
    mcqs.push({id:`NEET-BIO-SRC-${chapterNumber}-${String(number).padStart(3,'0')}`,question,options:shuffled,answer:(answer-shift+4)%4,explanation,difficulty:'Medium',chapter:ch.name,subject:'Biology',references:references(pointers),...extra});
  }
  for(const c of concepts) add(`Select the correct entry: ${c.label}.`,[c.correct,...c.distractors],0,c.explanation,c.pointers,{questionType:'concept',difficulty:'Easy'});

  // Forty-five distinct three-row matching tables. Each table has a single
  // one-to-one mapping, including when the source bank has synonymous topics.
  for(let i=0;i<45;i++) {
    const selected=[concepts[i*2],concepts[i*2+1]];
    // Repeated answers are unsuitable for matching: replace the second topic.
    let cursor=(i*2+2)%90;
    while(selected[0].correct===selected[1].correct || selected[0].label===selected[1].label) selected[1]=concepts[cursor++%90];
    cursor=(i*2+23)%90;
    while(selected.length<3) {
      const c=concepts[cursor++%90];
      if(!selected.some(s=>s.correct===c.correct||s.label===c.label)) selected.push(c);
    }
    const order=rotate([0,1,2],i%3);
    const mapping=selected.map((_,j)=>order.indexOf(j)+1);
    const encode=m=>m.map((n,j)=>`${'ABC'[j]}–${n}`).join(', ');
    const permutations=[[0,1,2],[0,2,1],[1,0,2],[1,2,0],[2,0,1],[2,1,0]];
    const correct=encode(mapping);
    const wrong=permutations.map(p=>encode(p.map(n=>n+1))).filter(x=>x!==correct).slice(0,3);
    add(`Match the three entries in List I with List II. Begin with “${selected[0].label}”.`,[correct,...wrong],0,selected.map(c=>c.explanation).join(' '),selected.map(c=>c.pointers).join(','),{
      questionType:'table',table:{caption:'Match List I with List II',headers:['List I — feature or concept','List II — entry'],rows:selected.map((c,j)=>[`${'ABC'[j]}. ${c.label}`,`${j+1}. ${selected[order[j]].correct}`])}
    });
  }
  for(let i=0;i<30;i++) {
    const a=concepts[(i*3+1)%90],b=concepts[(i*3+47)%90];
    const aTrue=i%4<2,bTrue=i%2===0;
    const statement=c=>`“${c.label}” is correctly associated with “${c.value}”.`;
    const answer=aTrue?(bTrue?0:1):(bTrue?2:3);
    add(`Evaluate the statements.\nI. ${statement({...a,value:aTrue?a.correct:a.distractors[0]})}\nII. ${statement({...b,value:bTrue?b.correct:b.distractors[1]})}`,
      ['Both I and II are correct','Only I is correct','Only II is correct','Neither I nor II is correct'],answer,
      `Statement I is ${aTrue?'correct':'incorrect'}: ${a.explanation} Statement II is ${bTrue?'correct':'incorrect'}: ${b.explanation}`,`${a.pointers},${b.pointers}`,{questionType:'statement',difficulty:'Medium'});
  }
  const imageRows=rows(`${source}-images.txt`);
  assert.equal(imageRows.length,15);
  for(const row of imageRows) {
    assert.equal(row.length,8);
    const [question,correct,a,b,c,explanation,pointers,key]=row;
    assert.ok(figures[key]);
    add(question,[correct,a,b,c],0,explanation,pointers,{questionType:'image',image:figures[key]});
  }
  assert.equal(mcqs.length,180);
  ch.mcqs=mcqs;
  ch.questionBank={source:'User-supplied chapter PDF',sourceId:source,sourceFile:index.title,sourceSha256:index.sha256,referenceConvention:index.referenceConvention,counts:{concept:90,table:45,statement:30,image:15},note:'Original practice questions based on the supplied chapter; formats revisit concepts for revision. These are not labelled as past NEET examination questions.'};
}
const total=data.chapters.reduce((n,c)=>n+(c.mcqs?.length||0),0);
assert.equal(total,1920);
data.description='1,920 chapter-wise Biology practice MCQs. Each of the first ten Class 11 chapters has 180 questions. Cell, Biomolecules and Cell Division include source references, diagrams and tables. Confirm exam-year coverage against the official syllabus.';
fs.writeFileSync(path.join(root,'data/neet/biology.json'),JSON.stringify(data,null,2)+'\n');
console.log('Built 540 sourced MCQs: 270 concept, 135 table, 90 statement and 45 image questions.');
