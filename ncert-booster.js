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
