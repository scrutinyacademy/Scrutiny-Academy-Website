/* Editorial cautions are separate from, and never painted over, the source.
 * Scientific relations below are factual checks, not copied textbook prose.
 * This is a list of noticed issues, not an assertion of a complete audit.
 */
window.ScrutinyFormulaNotes = Object.freeze({
  "1.6": [{
    title: "Initial angular velocity",
    text: "For constant angular acceleration, use the INITIAL angular velocity in the displacement equation. The source's ωt + ½αt² notation is ambiguous if ω denotes final velocity.",
    math: '<math xmlns="http://www.w3.org/1998/Math/MathML" display="block"><mi>θ</mi><mo>−</mo><msub><mi>θ</mi><mn>0</mn></msub><mo>=</mo><msub><mi>ω</mi><mn>0</mn></msub><mi>t</mi><mo>+</mo><mfrac><mn>1</mn><mn>2</mn></mfrac><mi>α</mi><msup><mi>t</mi><mn>2</mn></msup></math>',
    source: "https://openstax.org/books/university-physics-volume-1/pages/10-2-rotation-with-constant-angular-acceleration",
  }],
  "2.3": [{
    title: "Open organ pipe · page 5",
    text: "For a pipe open at BOTH ends, the allowed frequency uses 2L in the denominator, not the 4L printed in the source's general-frequency line. Here n = 1, 2, 3, …; end correction is neglected.",
    math: '<math xmlns="http://www.w3.org/1998/Math/MathML" display="block"><msub><mi>f</mi><mi>n</mi></msub><mo>=</mo><mfrac><mrow><mi>n</mi><mi>v</mi></mrow><mrow><mn>2</mn><mi>L</mi></mrow></mfrac></math>',
    source: "https://openstax.org/books/university-physics-volume-1/pages/17-4-normal-modes-of-a-standing-sound-wave",
  }],
  "4.1": [{
    title: "Celsius to kelvin · page 7",
    text: "Use 273.15 (not the printed 273.16) for the Celsius-to-kelvin offset. Also, the source's van der Waals equation mixes one-mole and n-mole notation: for n moles and total volume V, use (p + an²/V²)(V − nb) = nRT.",
    math: '<math xmlns="http://www.w3.org/1998/Math/MathML" display="block"><mi>T</mi><mo>(</mo><mi mathvariant="normal">K</mi><mo>)</mo><mo>=</mo><mi>t</mi><mo>(</mo><mi mathvariant="normal">°C</mi><mo>)</mo><mo>+</mo><mn>273.15</mn></math>',
    source: "https://openstax.org/books/university-physics-volume-2/pages/1-2-thermometers-and-temperature-scales",
  }],
  "4.3": [{
    title: "Gas-mixture heat-capacity ratio · page 7",
    text: "The source labels the mole-weighted mean of Cp as γ. That mean is the mixture's molar Cp, not γ. For an ideal mixture, γmix = (n₁Cp₁ + n₂Cp₂)/(n₁Cv₁ + n₂Cv₂). Heat capacities must be evaluated under consistent conditions.",
    source: "https://openstax.org/books/university-physics-volume-2/pages/3-5-heat-capacities-of-an-ideal-gas",
  }],
  "5.1": [{
    title: "Potential-energy sign · page 8",
    text: "With zero energy at infinite separation, the energy of two point charges has no extra leading minus sign. Keep the signs of q₁ and q₂. For the differential potential relation, the displacement is dℓ, not just r: dV = −E · dℓ.",
    math: '<math xmlns="http://www.w3.org/1998/Math/MathML" display="block"><mi>U</mi><mo>=</mo><mfrac><mrow><msub><mi>q</mi><mn>1</mn></msub><msub><mi>q</mi><mn>2</mn></msub></mrow><mrow><mn>4</mn><mi>π</mi><msub><mi>ε</mi><mn>0</mn></msub><mi>r</mi></mrow></mfrac></math>',
    source: "https://openstax.org/books/university-physics-volume-2/pages/7-1-electric-potential-energy",
  }],
  "6.2": [{
    title: "Emission wavelength · page 11",
    text: "For emission from n to m with n > m, the reciprocal-wavelength difference must be positive. The source reverses the order. For a hydrogen-like ion use the relation below (R with the appropriate nuclear-mass convention).",
    math: '<math xmlns="http://www.w3.org/1998/Math/MathML" display="block"><mfrac><mn>1</mn><mi>λ</mi></mfrac><mo>=</mo><mi>R</mi><msup><mi>Z</mi><mn>2</mn></msup><mo>(</mo><mfrac><mn>1</mn><msup><mi>m</mi><mn>2</mn></msup></mfrac><mo>−</mo><mfrac><mn>1</mn><msup><mi>n</mi><mn>2</mn></msup></mfrac><mo>)</mo></math>',
    source: "https://openstax.org/books/university-physics-volume-3/pages/6-4-bohrs-model-of-the-hydrogen-atom",
  }, {
    title: "Uncertainty bound · page 11",
    text: "When uncertainties mean standard deviations, the position–momentum bound is ℏ/2 = h/(4π), not h/(2π). Energy–time uncertainty also needs a defined lifetime/time scale; it is not an identical position–momentum measurement statement.",
    math: '<math xmlns="http://www.w3.org/1998/Math/MathML" display="block"><mi>Δx</mi><mi>Δp</mi><mo>≥</mo><mfrac><mi>ℏ</mi><mn>2</mn></mfrac><mo>=</mo><mfrac><mi>h</mi><mrow><mn>4</mn><mi>π</mi></mrow></mfrac></math>',
    source: "https://openstax.org/books/university-physics-volume-3/pages/7-2-the-heisenberg-uncertainty-principle",
  }],
});
