(() => {
  const milestones = [
    ["1770", "Joseph Priestley demonstrated the essential role of air in the growth of green plants."],
    ["1774", "Joseph Priestley discovered oxygen (O2)."],
    ["1831", "Robert Brown first discovered and described the nucleus."],
    ["1838", "Matthias Schleiden, a German botanist, proposed that plants are composed of cells."],
    ["1839", "Theodor Schwann, a British zoologist, extended cell theory to animals."],
    ["1855", "Rudolf Virchow stated Omnis cellula e cellula: cells arise from pre-existing cells."],
    ["Key idea", "Louis Pasteur's yeast experiments supported biogenesis: life arises from pre-existing life."],
    ["Key idea", "Spontaneous generation proposed that life arose from non-living, decaying or rotting matter."],
    ["Key idea", "Oparin and Haldane proposed chemical evolution: life arose from pre-existing non-living organic molecules."],
    ["1856-1863", "Gregor Mendel conducted his seven-year experiments on garden pea."],
    ["1860", "Julius von Sachs developed the hydroponics technique."],
    ["1865", "Gregor Mendel presented and published his work on inheritance."],
    ["1866", "John Langdon Down described Down syndrome."],
    ["1869", "Friedrich Miescher first identified DNA and named it nuclein."],
    ["1891", "Henking observed the X-body during spermatogenesis."],
    ["1891", "Homo erectus fossils were discovered in Java."],
    ["1892", "Dmitri Ivanowsky discovered the infectious agent later recognised as a virus."],
    ["1898", "Martinus Beijerinck called the viral agent contagium vivum fluidum, or infectious living fluid."],
    ["1898", "Camillo Golgi observed the Golgi apparatus."],
    ["1900", "Hugo de Vries, Carl Correns and Erich von Tschermak independently rediscovered Mendel's results."],
    ["1902", "Chromosome movement during meiosis was worked out, supporting the chromosome theory of inheritance."],
    ["1905", "F. F. Blackman proposed the law of limiting factors."],
    ["1928", "Frederick Griffith demonstrated transformation in Streptococcus pneumoniae."],
    ["1935", "W. M. Stanley crystallised the tobacco mosaic virus."],
    ["1937", "Ramdeo Misra obtained his PhD in ecology from the University of Leeds, UK."],
    ["1938", "A living coelacanth was caught off the coast of South Africa."],
    ["1945", "Alexander Fleming, Ernst Chain and Howard Florey received the Nobel Prize for penicillin."],
    ["1950", "James Watson obtained his PhD for studying the effect of hard X-rays on bacteriophage multiplication."],
    ["1951", "India launched its national family planning programme."],
    ["1952", "Hershey and Chase used bacteriophages to provide unequivocal evidence that DNA is the genetic material."],
    ["1953", "Stanley Miller simulated primitive atmospheric conditions using methane, ammonia, hydrogen and water vapour."],
    ["1953", "Watson and Crick proposed the double-helical structure of B-DNA and a replication scheme."],
    ["1953", "George Palade described ribosomes as small particulate components of the cytoplasm."],
    ["1954", "G. N. Ramachandran proposed the triple-helical model of collagen, published in Nature."],
    ["1954", "Francis Crick completed his PhD thesis on X-ray diffraction, polypeptides and proteins."],
    ["1958", "Meselson and Stahl used E. coli to prove semiconservative DNA replication in prokaryotes."],
    ["1958", "J. Herbert Taylor's work on Vicia faba supported semiconservative DNA replication in eukaryotes."],
    ["1960", "Katherine Esau published Anatomy of Seed Plants."],
    ["1961", "Melvin Calvin received the Nobel Prize for research on carbon dioxide assimilation in plants."],
    ["1962", "Watson, Crick and Maurice Wilkins received the Nobel Prize for discoveries concerning nucleic acids."],
    ["1963", "High-yielding wheat varieties Sonalika and Kalyan Sona were introduced during the Green Revolution period."],
    ["1963", "Two enzymes responsible for restricting bacteriophage growth in E. coli were isolated."],
    ["1966", "Derivatives of IR-8 and Taichung Native-1 rice were introduced."],
    ["1969", "R. H. Whittaker proposed the five-kingdom classification."],
    ["1971", "The Government of India enacted the Medical Termination of Pregnancy Act."],
    ["1971", "T. O. Diener discovered viroids: infectious free RNA without a protein capsid."],
    ["1972", "Singer and Nicolson proposed the fluid mosaic model of the plasma membrane."],
    ["1972", "Stanley Cohen and Herbert Boyer pioneered recombinant DNA technology."],
    ["1972", "The National Committee on Environmental Planning and Coordination (NCEPC) was established."],
    ["1974", "India enacted the Water (Prevention and Control of Pollution) Act."],
    ["1980", "Joint Forest Management initiatives developed around community participation in forest protection."],
    ["1981", "AIDS was first reported."],
    ["1981", "India enacted the Air (Prevention and Control of Pollution) Act."],
    ["1983", "Eli Lilly produced recombinant human insulin using E. coli."],
    ["1984", "India established a dedicated Ministry of Environment and Forests during the mid-1980s."],
    ["1986", "India enacted the Environment (Protection) Act."],
    ["1987", "The Montreal Protocol on ozone-depleting substances was adopted in Montreal, Canada."],
  ];

  const timeline = document.getElementById("biologyTimeline");
  if (timeline) {
    timeline.innerHTML = milestones
      .map(([year, fact]) => `<li><time>${year}</time><p>${fact}</p></li>`)
      .join("");
  }

  const watermarks = document.getElementById("boosterWatermarks");
  if (watermarks) {
    watermarks.innerHTML = Array.from(
      { length: 84 },
      () => "<span>SCRUTINY ACADEMY</span>",
    ).join("");
  }

  const ascii = (value) =>
    String(value)
      .replace(/[\u2010-\u2015]/g, "-")
      .replace(/[\u2018\u2019]/g, "'")
      .replace(/[\u201c\u201d]/g, '"')
      .replace(/[^\x20-\x7e]/g, " ")
      .replace(/\s+/g, " ")
      .trim();

  const pdfEscape = (value) =>
    ascii(value).replace(/\\/g, "\\\\").replace(/\(/g, "\\(").replace(/\)/g, "\\)");

  const wrapText = (value, maxCharacters) => {
    const words = ascii(value).split(" ");
    const lines = [];
    let line = "";
    words.forEach((word) => {
      const candidate = line ? `${line} ${word}` : word;
      if (candidate.length > maxCharacters && line) {
        lines.push(line);
        line = word;
      } else {
        line = candidate;
      }
    });
    if (line) lines.push(line);
    return lines;
  };

  const pdfText = (x, y, size, text, font = "F1", colour = "0.09 0.16 0.28") =>
    `BT /${font} ${size} Tf ${colour} rg 1 0 0 1 ${x} ${y} Tm (${pdfEscape(text)}) Tj ET\n`;

  const circle = (x, y, radius) => {
    const c = radius * 0.5522847498;
    return `${x + radius} ${y} m ${x + radius} ${y + c} ${x + c} ${y + radius} ${x} ${y + radius} c ${x - c} ${y + radius} ${x - radius} ${y + c} ${x - radius} ${y} c ${x - radius} ${y - c} ${x - c} ${y - radius} ${x} ${y - radius} c ${x + c} ${y - radius} ${x + radius} ${y - c} ${x + radius} ${y} c`;
  };

  const paginateMilestones = () => {
    const pages = [[]];
    let y = 688;
    milestones.forEach(([year, fact], index) => {
      const lines = wrapText(fact, 84);
      const height = Math.max(32, 15 + lines.length * 10);
      if (y - height < 65) {
        pages.push([]);
        y = 688;
      }
      pages.at(-1).push({ index: index + 1, year, lines, y, height });
      y -= height + 5;
    });
    return pages;
  };

  const makePageStream = (items, pageNumber, pageCount) => {
    let stream = "";
    stream += "q 1 1 1 rg 0 0 595 842 re f Q\n";

    // Repeating, small background watermark across every generated PDF page.
    for (let row = 0; row < 7; row += 1) {
      for (let column = 0; column < 3; column += 1) {
        const x = 16 + column * 190;
        const y = 110 + row * 105;
        stream += `q 0.92 0.95 0.98 rg BT /F2 8 Tf 0.866 0.5 -0.5 0.866 ${x} ${y} Tm (SCRUTINY ACADEMY) Tj ET Q\n`;
      }
    }

    stream += "q 0.73 0.89 1 rg ";
    stream += `${circle(58, 788, 24)} f Q\n`;
    stream += pdfText(44, 784, 18, "S", "F2", "0 0 0");
    stream += pdfText(58, 775, 18, "A", "F2", "0 0 0");
    stream += pdfText(91, 796, 12, "SCRUTINY ACADEMY", "F2");
    stream += pdfText(91, 781, 7, "LEARN - UNDERSTAND - PRACTICE - MASTER", "F1", "0.32 0.39 0.49");
    stream += pdfText(305, 799, 9, "NCERT BOOSTER CORNER", "F2", "0.12 0.37 0.75");
    stream += pdfText(305, 779, 17, "Important Years in Biology", "F2");
    stream += "0.07 0.16 0.34 RG 1.5 w 36 756 m 559 756 l S\n";

    items.forEach(({ index, year, lines, y, height }) => {
      stream += `q 0.98 0.99 1 rg 0.78 0.84 0.92 RG 0.6 w 36 ${y - height + 5} 523 ${height} re B Q\n`;
      stream += pdfText(46, y - 11, 8, `${index}.`, "F2", "0.12 0.37 0.75");
      stream += "q 0.07 0.16 0.34 rg 70 " + (y - 18) + " 76 20 re f Q\n";
      stream += pdfText(79, y - 12, 8, year, "F2", "1 1 1");
      lines.forEach((line, lineIndex) => {
        stream += pdfText(158, y - 10 - lineIndex * 10, 8.4, line);
      });
    });

    stream += "0.78 0.84 0.92 RG 0.6 w 36 49 m 559 49 l S\n";
    stream += pdfText(36, 32, 8, "SCRUTINY ACADEMY", "F2");
    stream += pdfText(146, 32, 7, "NCERT Booster Corner - Educational revision material", "F1", "0.32 0.39 0.49");
    stream += pdfText(492, 32, 7, `Page ${pageNumber} of ${pageCount}`, "F1", "0.32 0.39 0.49");
    stream += pdfText(36, 19, 6.5, "scrutinyacademy.github.io/Scrutiny-Academy-Website - (c) 2026 Scrutiny Academy", "F1", "0.32 0.39 0.49");
    return stream;
  };

  const buildPdf = () => {
    const pages = paginateMilestones();
    const objects = [];
    const addObject = (value) => {
      objects.push(value);
      return objects.length;
    };

    const catalogId = addObject("");
    const pagesId = addObject("");
    const regularFontId = addObject("<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>");
    const boldFontId = addObject("<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold >>");
    const pageIds = [];

    pages.forEach((items, index) => {
      const stream = makePageStream(items, index + 1, pages.length);
      const contentId = addObject(`<< /Length ${stream.length} >>\nstream\n${stream}endstream`);
      const pageId = addObject(
        `<< /Type /Page /Parent ${pagesId} 0 R /MediaBox [0 0 595 842] /Resources << /Font << /F1 ${regularFontId} 0 R /F2 ${boldFontId} 0 R >> >> /Contents ${contentId} 0 R >>`,
      );
      pageIds.push(pageId);
    });

    objects[catalogId - 1] = `<< /Type /Catalog /Pages ${pagesId} 0 R >>`;
    objects[pagesId - 1] = `<< /Type /Pages /Kids [${pageIds.map((id) => `${id} 0 R`).join(" ")}] /Count ${pageIds.length} >>`;

    let pdf = "%PDF-1.4\n%SCRUTINY-ACADEMY\n";
    const offsets = [0];
    objects.forEach((object, index) => {
      offsets.push(pdf.length);
      pdf += `${index + 1} 0 obj\n${object}\nendobj\n`;
    });
    const xref = pdf.length;
    pdf += `xref\n0 ${objects.length + 1}\n0000000000 65535 f \n`;
    offsets.slice(1).forEach((offset) => {
      pdf += `${String(offset).padStart(10, "0")} 00000 n \n`;
    });
    pdf += `trailer\n<< /Size ${objects.length + 1} /Root ${catalogId} 0 R >>\nstartxref\n${xref}\n%%EOF`;
    return new Blob([pdf], { type: "application/pdf" });
  };

  const showStatus = (message) => {
    const toast = document.getElementById("toast");
    if (!toast) return;
    toast.textContent = message;
    toast.classList.add("show");
    window.setTimeout(() => toast.classList.remove("show"), 2800);
  };

  const downloadButton = document.getElementById("downloadNcertBooster");
  if (downloadButton) {
    downloadButton.addEventListener("click", () => {
      const originalText = downloadButton.textContent;
      downloadButton.disabled = true;
      downloadButton.textContent = "Creating PDF...";
      try {
        const url = URL.createObjectURL(buildPdf());
        const link = document.createElement("a");
        link.href = url;
        link.download = "Scrutiny-Academy-NCERT-Booster-Biology.pdf";
        link.rel = "noopener";
        document.body.appendChild(link);
        link.click();
        link.remove();
        window.setTimeout(() => URL.revokeObjectURL(url), 60000);
        showStatus("PDF created. Check your Downloads folder.");
      } catch (error) {
        console.error("Unable to create NCERT Booster PDF", error);
        showStatus("PDF download failed. Please use Print instead.");
      } finally {
        downloadButton.disabled = false;
        downloadButton.textContent = originalText;
      }
    });
  }

  const printButton = document.getElementById("printNcertBooster");
  if (printButton) {
    printButton.addEventListener("click", () => {
      document.body.classList.add("booster-print-mode");
      window.print();
    });
    window.addEventListener("afterprint", () => {
      document.body.classList.remove("booster-print-mode");
    });
  }
})();
