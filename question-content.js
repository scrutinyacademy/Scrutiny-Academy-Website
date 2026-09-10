/* Shared rendering for live practice and completed-test review. */
(function () {
  'use strict';
  const titles = {cell:'Cell: The Unit of Life',biomolecules:'Biomolecules',division:'Cell Cycle and Cell Division'};
  const element = (tag, text, className) => {
    const el=document.createElement(tag);
    if(text!==undefined) el.textContent=text;
    if(className) el.className=className;
    return el;
  };
  function renderExtras(container, question) {
    container.replaceChildren();
    if(question.image && /^assets\/questions\/[a-z0-9-]+\.jpg$/.test(question.image.src)) {
      const figure=element('figure',undefined,'question-figure');
      const img=element('img');
      img.src=question.image.src;
      img.alt=question.image.alt;
      img.loading='lazy';
      const link=element('a');
      link.href=question.image.src;link.target='_blank';link.rel='noopener';
      link.setAttribute('aria-label','Open full-size question diagram in a new tab');
      link.append(img);figure.append(link);
      figure.append(element('figcaption',`${question.image.caption} · Select image to enlarge`));
      container.append(figure);
    }
    if(question.table) {
      const wrap=element('div',undefined,'question-table-wrap');
      wrap.tabIndex=0;wrap.setAttribute('role','region');wrap.setAttribute('aria-label',question.table.caption||'Question table');
      const table=element('table',undefined,'question-table');
      table.append(element('caption',question.table.caption||'Question table'));
      const head=element('thead'),heading=element('tr');
      question.table.headers.forEach(text=>{const th=element('th',text);th.scope='col';heading.append(th);});
      head.append(heading);table.append(head);
      const body=element('tbody');
      question.table.rows.forEach(row=>{
        const tr=element('tr');
        row.forEach((text,i)=>{const cell=element(i===0?'th':'td',text);if(i===0)cell.scope='row';tr.append(cell);});
        body.append(tr);
      });
      table.append(body);wrap.append(table);container.append(wrap);
    }
  }
  function renderReferences(container, question) {
    container.replaceChildren();
    if(!question.references?.length) return;
    container.append(element('strong','Source references'));
    const list=element('ul');
    question.references.forEach(ref=>{
      if(!titles[ref.source]) return;
      const item=element('li');
      const a=element('a',`${titles[ref.source]} · printed p. ${ref.printedPage} (PDF p. ${ref.pdfPage}) · paragraph/block ${ref.paragraph} · lines ${ref.lineStart}–${ref.lineEnd}`);
      const query=new URLSearchParams({source:ref.source,page:ref.pdfPage,paragraph:ref.paragraph});
      a.href=`references.html?${query}#line-${ref.lineStart}`;
      a.target='_blank';a.rel='noopener';
      item.append(a);list.append(item);
    });
    container.append(list);
    container.append(element('p','Paragraph/block and line numbers are assigned to the extracted text, not printed in the textbook. Open a reference to inspect the numbered passage.','reference-convention'));
    if(question.image) container.append(element('p',`Diagram: ${question.image.caption}, printed p. ${question.image.printedPage} (PDF p. ${question.image.pdfPage}).`,'reference-convention'));
  }
  window.ScrutinyQuestionContent={renderExtras,renderReferences};
}());
