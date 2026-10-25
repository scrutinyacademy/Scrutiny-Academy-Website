// Structured chapter facts generate recall, paired-association and multi-statement
// questions. Each level adds 27 different questions to its 3 authored questions.
import { tables } from './fact-tables.mjs';
import { expandMath } from './math-expansion.mjs';
const pick = (values, correct, seed) => {
 const pool=[...new Set(values)].filter(value=>value!==correct);
 if(pool.length<3) throw Error(`Insufficient distinct distractors: ${correct}`);
 return [0,1,2].map(i=>pool[(seed+i)%pool.length]);
};
const indices = mask => [0,1,2].filter(i=>mask&(1<<i)).map(i=>['I','II','III'][i]).join(', ') || 'None';
export function expandBanks(banks) {
 for(const [subject,chapters] of Object.entries(banks)) {
  if(subject==='mathematics'){expandMath(chapters);continue;}
  const source=tables[subject];
  if(source.length!==chapters.length)throw Error(`Chapter coverage: ${subject}`);
  chapters.forEach((levels,chapterIndex)=>{
   const {fields,rows}=source[chapterIndex];
   if(rows.length!==9 || fields.length!==3)throw Error('Each chapter needs nine three-part concept profiles.');
   const columns=fields.map((_,col)=>[...rows.map(row=>row[col+1]),...(source[chapterIndex].extras?.[col]||[])]);
   const wrongFor=(r,c,seed)=>pick(source[chapterIndex].wrongRows?.[r]?.[c] || columns[c].filter(value=>!(source[chapterIndex].validPeers?.[r]?.[c] || []).includes(value)),rows[r][c+1],seed);
   const claim=(r,c,value=rows[r][c+1])=>`${rows[r][0]} — ${fields[c]}: ${value}`;
   rows.forEach((row,r)=>fields.forEach((field,c)=>{
    const correct=row[c+1], distractors=wrongFor(r,c,r+c);
    levels[0].push({question:`${row[0]}: which option correctly identifies the ${field}?`,correct,distractors,explanation:claim(r,c)+'.',topic:`${row[0]} · ${field}`});
    const next=(c+1)%3, pair=`${correct} → ${row[next+1]}`;
    const wrongNext=wrongFor(r,next,r);
    levels[1].push({question:`Which pair correctly matches ${row[0]} with its ${field} and ${fields[next]}, in that order?`,correct:pair,distractors:[`${distractors[0]} → ${row[next+1]}`,`${correct} → ${wrongNext[0]}`,`${distractors[1]} → ${wrongNext[1]}`],explanation:`${claim(r,c)}. ${claim(r,next)}. Both parts must be correct.`,topic:row[0]});
    const q=r*3+c;
    const refs=[[r,c],[(r+4)%9,(c+1)%3],[(r+7)%9,(c+2)%3]];
    // Cycle all eight validity patterns, including none/all, without changing facts.
    const mask=(q+chapterIndex)%8;
    const statements=refs.map(([rr,cc],i)=>claim(rr,cc,(mask&(1<<i))?rows[rr][cc+1]:wrongFor(rr,cc,q+i)[0]));
    const answer=indices(mask);
    const wrong=[mask^1,mask^2,mask^4].map(indices);
    levels[2].push({question:`Evaluate these chapter statements. Which are correct?\nI. ${statements[0]}\nII. ${statements[1]}\nIII. ${statements[2]}`,correct:answer,distractors:wrong,explanation:`Correct set: ${answer}. Check against the accurate associations: ${refs.map(([rr,cc])=>claim(rr,cc)).join('; ')}.`,topic:`${row[0]} · comparing chapter concepts`});
   }));
   for(const level of levels)if(level.length!==30)throw Error(`Expected 30 questions: ${subject} ${chapterIndex+1}`);
  });
 }
}
