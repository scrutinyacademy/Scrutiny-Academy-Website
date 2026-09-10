(async function () {
  'use strict';
  const titles={cell:'Cell: The Unit of Life',biomolecules:'Biomolecules',division:'Cell Cycle and Cell Division'};
  const offsets={cell:84,biomolecules:103,division:119};
  const params=new URLSearchParams(location.search);
  const source=params.get('source')||'cell';
  const pageNumber=Number(params.get('page')||3);
  const paragraph=Number(params.get('paragraph')||0);
  const status=document.getElementById('source-status');
  document.getElementById('source-navigation').addEventListener('submit',event=>{
    event.preventDefault();
    location.href=`references.html?${new URLSearchParams({source:document.getElementById('source-select').value,page:document.getElementById('source-page').value})}`;
  });
  try {
    if(!titles[source]||!Number.isInteger(pageNumber)||pageNumber<1) throw new Error('Choose a valid chapter and PDF page.');
    document.getElementById('source-select').value=source;
    const response=await fetch(`data/sources/${source}.json`);
    if(!response.ok) throw new Error('The source text could not be loaded. Please try again.');
    const data=await response.json();
    const page=data.pages.find(p=>p.pdfPage===pageNumber);
    const input=document.getElementById('source-page');input.max=data.pages.length;input.value=pageNumber;
    if(!page) throw new Error(`This source has ${data.pages.length} PDF pages. Choose a page within that range.`);
    document.title=`${titles[source]} — source page ${pageNumber} | Scrutiny Academy`;
    document.getElementById('source-title').textContent=titles[source];
    document.getElementById('source-file').textContent=`Source file: ${data.title}`;
    status.textContent=source==='cell'&&pageNumber<3?`PDF page ${pageNumber} · introductory pages`:`Printed page ${pageNumber+offsets[source]} · PDF page ${pageNumber}`;
    const host=document.getElementById('source-passages');
    page.paragraphs.forEach(block=>{
      const section=document.createElement('section');
      section.className=`source-paragraph${paragraph===block.paragraph?' source-highlight':''}`;
      const heading=document.createElement('h2');
      heading.textContent=`Paragraph/block ${block.paragraph} · lines ${block.lineStart}–${block.lineEnd}`;
      section.append(heading);
      block.lines.forEach((text,i)=>{
        const line=document.createElement('p');line.className='source-line';line.id=`line-${block.lineStart+i}`;
        const number=document.createElement('span');number.className='source-line-number';number.textContent=block.lineStart+i;number.setAttribute('aria-label',`Line ${block.lineStart+i}`);
        const content=document.createElement('span');content.textContent=text;
        line.append(number,content);section.append(line);
      });
      host.append(section);
    });
    const anchor=document.getElementById(location.hash.slice(1));
    if(anchor) anchor.scrollIntoView({block:'center'});
  } catch(error) {
    status.textContent=error.message;
    status.setAttribute('role','alert');
  }
}());
