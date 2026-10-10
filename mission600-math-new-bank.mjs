// New Mission 600 Mathematics DPP question bank (2026 rebuild).
// Generated in-browser; independent of Firebase deployment and previous DPP documents.
const levels = [
  { code: "E", difficulty: "Easy", title: "Foundation Builder", minutes: 25 },
  { code: "M", difficulty: "Medium", title: "Concept Master", minutes: 35 },
  { code: "H", difficulty: "Hard", title: "Board Challenger", minutes: 45 },
];
const gcd = (a, b) => b ? gcd(b, a % b) : Math.abs(a);
const lcm = (a, b) => Math.abs(a * b) / gcd(a, b);
const frac = (a, b) => { const d = gcd(a, b); return b / d === 1 ? String(a / d) : `${a / d}/${b / d}`; };
const setText = (values) => `{${[...values].sort((a, b) => a - b).join(", ")}}`;
function choice(question, correct, distractors, explanation, seed) {
  const raw = [String(correct), ...distractors.map(String)].filter((v, i, all) => all.indexOf(v) === i);
  for (let n = 1; raw.length < 4; n += 1) raw.push(`None of these ${n}`);
  const four = raw.slice(0, 4), shift = seed % 4;
  const options = four.slice(shift).concat(four.slice(0, shift));
  return { question, options, answer: options.indexOf(String(correct)), explanation };
}

function realNumbers(i, level) {
  const k = i + 101 + level * 17, variant = Math.floor((i % 20) / 5);
  if (i % 5 === 0) {
    const h = 2 + k % 7, a = h * (5 + k), b = h * (8 + 2 * k), ans = gcd(a, b);
    return choice(`Find the HCF of ${a} and ${b}.`, ans, [h, ans + h, Math.abs(b - a)], `Euclid's algorithm gives the last non-zero remainder ${ans}.`, k);
  }
  if (i % 5 === 1) {
    const a = 4 + k, b = 6 + 2 * k, ans = lcm(a, b);
    return choice(`Find the LCM of ${a} and ${b}.`, ans, [gcd(a, b), a * b, ans + gcd(a, b)], `LCM × HCF = product, so LCM = ${a * b} ÷ ${gcd(a, b)} = ${ans}.`, k);
  }
  if (i % 5 === 2) {
    const den = ((variant + level) % 2 ? [8, 20, 25, 40] : [3, 7, 11, 21])[variant];
    let reduced = den; while (reduced % 2 === 0) reduced /= 2; while (reduced % 5 === 0) reduced /= 5;
    const ans = reduced === 1 ? "Terminating" : "Non-terminating recurring";
    return choice(`Without dividing, classify the decimal expansion of 1/${den}.`, ans, [ans === "Terminating" ? "Non-terminating recurring" : "Terminating", "Non-terminating non-recurring", "Not rational"], `A reduced rational number terminates only if its denominator has no prime factors except 2 and 5.`, k);
  }
  if (i % 5 === 3) {
    const p = [2, 3, 5, 7][k % 4], q = [3, 5, 7, 11][(k + 1) % 4], n = p * p * q;
    return choice(`Which is the prime factorisation of ${n}?`, `${p}² × ${q}`, [`${p} × ${q}²`, `${p}² + ${q}`, `${p} × ${q}`], `${n} = ${p} × ${p} × ${q}.`, k);
  }
  const divisor = 5 + k % 8, quotient = 3 + k, remainder = k % divisor, dividend = divisor * quotient + remainder;
  return choice(`When ${dividend} is divided by ${divisor}, what is the remainder?`, remainder, [quotient, divisor - remainder, remainder + 1], `${dividend} = ${divisor} × ${quotient} + ${remainder}.`, k);
}

function sets(i, level) {
  const k = i + 102 + level * 19, variant = Math.floor(i / 5);
  const A = new Set([1, 2 + variant, 3 + k % 4, 7 + k % 3 + variant]), B = new Set([2 + variant, 3 + k % 4, 5 + k % 5, 9 + k % 2 + variant]);
  const union = new Set([...A, ...B]), intersection = new Set([...A].filter((x) => B.has(x)));
  if (i % 5 === 0) return choice(`If A = ${setText(A)} and B = ${setText(B)}, find A ∪ B.`, setText(union), [setText(intersection), setText(A), setText(B)], `The union contains every element in A or B, without repetition.`, k);
  if (i % 5 === 1) return choice(`If A = ${setText(A)} and B = ${setText(B)}, find A ∩ B.`, setText(intersection), [setText(union), "∅", setText(A)], `The intersection contains only elements common to both sets.`, k);
  if (i % 5 === 2) {
    const n = 3 + variant, ans = 2 ** n;
    return choice(`How many subsets does a set with ${n} elements have?`, ans, [n * 2, ans - 1, n ** 2], `A set with n elements has 2ⁿ subsets; 2^${n} = ${ans}.`, k);
  }
  if (i % 5 === 3) {
    const a = 18 + k, b = 16 + k, both = 5 + k % 6, ans = a + b - both;
    return choice(`${a} students like Mathematics, ${b} like Science and ${both} like both. How many like at least one?`, ans, [a + b, ans - both, Math.max(a, b)], `n(A∪B) = n(A)+n(B)−n(A∩B) = ${ans}.`, k);
  }
  const extra = [1, 2, 4, 5][variant % 4];
  const U = new Set([1, 2, 3, 4, 5, 6, 7, 8]), C = new Set([extra, 3, 6, 8]), complement = new Set([...U].filter((x) => !C.has(x)));
  return choice(`For U = ${setText(U)} and A = ${setText(C)}, find A′.`, setText(complement), [setText(C), setText(U), "∅"], `A′ contains the elements of U that are not in A.`, k);
}

function polynomials(i, level) {
  const k = i + 101 + level * 19, r = 1 + k % 7, s = 2 + (k * 2) % 7, sum = r + s, product = r * s;
  if (i % 5 === 0) {
    const x = 1 + k % 5, ans = x * x - sum * x + product;
    return choice(`For p(x) = x² − ${sum}x + ${product}, find p(${x}).`, ans, [ans + x, ans - x, product], `Substitution gives ${x}² − ${sum}(${x}) + ${product} = ${ans}.`, k);
  }
  if (i % 5 === 1) return choice(`What are the zeroes of x² − ${sum}x + ${product}?`, `${r}, ${s}`, [`−${r}, −${s}`, `${sum}, ${product}`, `${r}, −${s}`], `It factorises as (x−${r})(x−${s}).`, k);
  if (i % 5 === 2) {
    const a = 2 + level;
    return choice(`Find the sum of zeroes of ${a}x² − ${sum * a}x + ${product}.`, sum, [-sum, product, frac(product, a)], `For ax²+bx+c, sum of zeroes is −b/a = ${sum}.`, k);
  }
  if (i % 5 === 3) {
    const a = 2 + level, c = r + k, ans = a * r * r - sum * r + c;
    return choice(`Find the remainder when ${a}x² − ${sum}x + ${c} is divided by x − ${r}.`, ans, [c, ans + r, ans - r], `By the Remainder Theorem the remainder is p(${r}) = ${ans}.`, k);
  }
  return choice(`Which monic quadratic has zeroes ${r} and ${s}?`, `x² − ${sum}x + ${product}`, [`x² + ${sum}x + ${product}`, `x² − ${product}x + ${sum}`, `x² + ${product}`], `Use x² − (sum of zeroes)x + product of zeroes.`, k);
}

function linearPairs(i, level) {
  const k = i + 102 + level * 19, x = 1 + k % 6, y = 2 + (k * 2) % 7;
  const a = 1 + k % 4, b = 2 + level, c = a * x + b * y, d = 2 + (k + 1) % 5;
  let e = 1 + k % 3; if (a * e === b * d) e += 1;
  const f = d * x + e * y;
  if (i % 5 === 0) return choice(`Solve ${a}x + ${b}y = ${c} and ${d}x + ${e}y = ${f}.`, `x = ${x}, y = ${y}`, [`x = ${y}, y = ${x}`, `x = ${x + 1}, y = ${y - 1}`, "No solution"], `Elimination gives x = ${x}, y = ${y}; these satisfy both equations.`, k);
  if (i % 5 === 1) return choice(`The pair 2x + 3y = ${c} and 4x + 6y = ${2 * c} represents`, "coincident lines", ["parallel lines", "intersecting lines", "perpendicular lines"], `All three coefficient ratios are equal, so there are infinitely many solutions.`, k);
  if (i % 5 === 2) return choice(`The pair 2x + 3y = ${c} and 4x + 6y = ${2 * c + 1} has`, "no solution", ["one solution", "infinitely many solutions", "two solutions"], `a₁/a₂ = b₁/b₂ but differs from c₁/c₂, so the lines are parallel.`, k);
  if (i % 5 === 3) {
    const m = 5 + k, n = 2 + k % 5, sum = 2 * m, diff = 2 * n;
    return choice(`Two numbers have sum ${sum} and difference ${diff}. What are they?`, `${m + n} and ${m - n}`, [`${sum} and ${diff}`, `${m} and ${n}`, `${m + n + 1} and ${m - n - 1}`], `Solve x+y=${sum}, x−y=${diff}; adding gives x=${m + n}, then y=${m - n}.`, k);
  }
  return choice(`For what value of k do kx + ${b}y = ${c} and ${a}x + ${b}y = ${c} represent the same line?`, a, [b, c, a + 1], `Identical equations require matching coefficients, hence k = ${a}.`, k);
}

function quadratics(i, level) {
  const k = i + 101 + level * 19, r = 1 + k % 8, s = 2 + (2 * k) % 9, sum = r + s, product = r * s;
  if (i % 5 === 0) return choice(`Solve x² − ${sum}x + ${product} = 0.`, `x = ${r} or ${s}`, [`x = −${r} or −${s}`, `x = ${sum} or ${product}`, "No real roots"], `Factorising gives (x−${r})(x−${s}) = 0.`, k);
  if (i % 5 === 1) {
    const ans = sum * sum - 4 * product;
    return choice(`Find the discriminant of x² − ${sum}x + ${product} = 0.`, ans, [sum * sum + 4 * product, sum - 4 * product, Math.abs(r - s)], `D = b²−4ac = ${sum}²−4(${product}) = ${ans}.`, k);
  }
  if (i % 5 === 2) {
    const root = 2 + k % 7, b = 2 * root, c = root * root;
    return choice(`What is the nature of roots of x² − ${b}x + ${c} = 0?`, "Real and equal", ["Real and distinct", "Non-real", "Only one root exists"], `The discriminant is ${b}²−4(${c}) = 0.`, k);
  }
  if (i % 5 === 3) return choice(`Form the monic quadratic equation with roots ${r} and ${s}.`, `x² − ${sum}x + ${product} = 0`, [`x² + ${sum}x + ${product} = 0`, `x² − ${product}x + ${sum} = 0`, `x² + ${product} = 0`], `Use x² − (sum of roots)x + product of roots = 0.`, k);
  return choice(`If one root of x² − ${sum}x + ${product} = 0 is ${r}, find the other.`, s, [sum, product, Math.abs(s - r)], `The roots sum to ${sum}; the other is ${sum}−${r}=${s}.`, k);
}

function progressions(i, level) {
  const k = i + 101 + level * 19, a = 2 + k % 8, d = 2 + level + k % 4, n = 5 + k % 11;
  if (i % 5 === 0) {
    const ans = a + (n - 1) * d;
    return choice(`Find the ${n}th term of the AP ${a}, ${a + d}, ${a + 2 * d}, …`, ans, [a + n * d, n * d, ans - d], `aₙ = a+(n−1)d = ${a}+${n - 1}(${d}) = ${ans}.`, k);
  }
  if (i % 5 === 1) return choice(`Find the common difference of ${a}, ${a + d}, ${a + 2 * d}, …`, d, [a, a + d, 2 * d], `Common difference = ${a + d}−${a} = ${d}.`, k);
  if (i % 5 === 2) {
    const ans = n * (2 * a + (n - 1) * d) / 2;
    return choice(`Find the sum of the first ${n} terms of the AP with first term ${a} and common difference ${d}.`, ans, [a + (n - 1) * d, n * (a + d), ans + n], `Sₙ = n/2[2a+(n−1)d] = ${ans}.`, k);
  }
  if (i % 5 === 3) return choice(`Find the arithmetic mean between ${a} and ${a + 2 * d}.`, a + d, [d, a + 2 * d, a + 3 * d], `Arithmetic mean = (${a}+${a + 2 * d})/2 = ${a + d}.`, k);
  const term = a + (n - 1) * d;
  return choice(`Which term of ${a}, ${a + d}, ${a + 2 * d}, … is ${term}?`, n, [n - 1, n + 1, term / d], `Solve ${term}=${a}+(n−1)${d}; n=${n}.`, k);
}

function coordinateGeometry(i, level) {
  const k = i + 101 + level * 19, x = 1 + k % 7, y = 2 + (2 * k) % 7;
  const triples = [[3, 4, 5], [5, 12, 13], [6, 8, 10], [8, 15, 17]], [dx, dy, distance] = triples[k % 4];
  if (i % 5 === 0) return choice(`Find the distance between (${x}, ${y}) and (${x + dx}, ${y + dy}).`, distance, [dx + dy, Math.abs(dx - dy), distance + 1], `Distance = √(${dx}²+${dy}²) = ${distance}.`, k);
  if (i % 5 === 1) return choice(`Find the midpoint of (${x}, ${y}) and (${x + 2 * dx}, ${y + 2 * dy}).`, `(${x + dx}, ${y + dy})`, [`(${dx}, ${dy})`, `(${2 * dx}, ${2 * dy})`, `(${x + 2 * dx}, ${y + 2 * dy})`], `Midpoint = ((x₁+x₂)/2,(y₁+y₂)/2) = (${x + dx}, ${y + dy}).`, k);
  if (i % 5 === 2) return choice(`P divides the segment from (${x}, ${y}) to (${x + 3 * dx}, ${y + 3 * dy}) in the ratio 1:2. Find P.`, `(${x + dx}, ${y + dy})`, [`(${x + 2 * dx}, ${y + 2 * dy})`, `(${dx}, ${dy})`, `(${x + 3 * dx}, ${y + 3 * dy})`], `The 1:2 division point is one-third of the way from the first endpoint.`, k);
  if (i % 5 === 3) {
    const base = 2 + k % 8, height = 3 + k % 7, ans = base * height / 2;
    return choice(`Find the area of the triangle with vertices (0,0), (${base},0), (0,${height}).`, ans, [base * height, base + height, ans + 1], `Area = 1/2 × ${base} × ${height} = ${ans}.`, k);
  }
  return choice(`The points (${x},${y}), (${x + dx},${y + dy}) and (${x + 2 * dx},${y + 2 * dy}) are`, "collinear", ["equilateral", "on the x-axis", "on the y-axis"], `Consecutive points have the same displacement (${dx},${dy}), so they lie on one line.`, k);
}

function similarTriangles(i, level) {
  const k = i + 101 + level * 19, variant = Math.floor(i / 5), scale = 2 + k % 4, a = 3 + k % 6, b = 4 + k % 7;
  if (i % 5 === 0) return choice(`Similar triangles have corresponding sides ${a} cm and ${a * scale} cm. Find the scale factor.`, scale, [scale * scale, a, a * scale], `Scale factor = ${a * scale}/${a} = ${scale}.`, k);
  if (i % 5 === 1) return choice(`Corresponding sides of two similar triangles are in ratio 1:${scale}. Find their area ratio.`, `1:${scale * scale}`, [`1:${scale}`, `${scale}:${scale * scale}`, `${scale * scale}:1`], `Areas are in the square of the corresponding-side ratio.`, k);
  if (i % 5 === 2) {
    const triple = [[3, 4, 5], [5, 12, 13], [8, 15, 17], [7, 24, 25]][variant % 4];
    return choice(`In a right triangle, the legs are ${triple[0]} cm and ${triple[1]} cm. Find the hypotenuse.`, `${triple[2]} cm`, [`${triple[0] + triple[1]} cm`, `${triple[2] + 2} cm`, `${triple[0] * triple[1]} cm`], `By Pythagoras, c=√(${triple[0]}²+${triple[1]}²)=${triple[2]} cm.`, k);
  }
  if (i % 5 === 3) return choice(`In ΔABC, DE ∥ BC. If AD/DB = ${a}/${b}, find AE/EC.`, `${a}/${b}`, [`${b}/${a}`, `${a}/${a + b}`, `${b}/${a + b}`], `By the Basic Proportionality Theorem, the two sides are divided in the same ratio.`, k);
  const small = 2 * (a + b), ans = small * scale;
  return choice(`A triangle's perimeter is ${small} cm. A similar triangle has scale factor ${scale}. Find its perimeter.`, ans, [small, ans * scale, small + scale], `Perimeters of similar triangles follow the side ratio: ${small}×${scale}=${ans}.`, k);
}

function tangents(i, level) {
  const k = i + 101 + level * 19, variant = Math.floor(i / 5), r = 3 + k % 7, t = 4 + k % 8, point = ["T", "A", "Q", "R"][variant % 4];
  if (i % 5 === 0) return choice(`A tangent at ${point} to a circle with centre O is`, `perpendicular to O${point}`, [`parallel to O${point}`, `equal to O${point}`, "a diameter"], `A tangent is perpendicular to the radius at the point of contact.`, k);
  if (i % 5 === 1) return choice(`PA and PB are tangents from P. If PA = ${t} cm, find PB.`, t, [r, 2 * t, t + r], `Tangents from the same external point are equal.`, k);
  if (i % 5 === 2) {
    const op2 = r * r + t * t;
    return choice(`A circle has OT = ${r} cm and OP² = ${op2} cm². If PT is tangent, find PT.`, t, [r, Math.sqrt(op2), r + t], `OT ⟂ PT, so PT=√(OP²−OT²)=√(${op2}−${r * r})=${t}.`, k);
  }
  if (i % 5 === 3) {
    const external = 2 + k % 6, whole = external + 6 + k % 7, ans = external * whole;
    return choice(`A tangent PT and secant PAB are drawn. If PA=${external} cm and PB=${whole} cm, find PT².`, ans, [external + whole, whole - external, whole * whole], `PT² = PA×PB = ${external}×${whole} = ${ans}.`, k);
  }
  const central = 60 + 10 * (k % 7), ans = 180 - central;
  return choice(`Tangents PA and PB touch at A and B. If ∠AOB=${central}°, find ∠APB.`, `${ans}°`, [`${central}°`, `${180 + central}°`, `${90 - central / 2}°`], `∠APB+∠AOB=180°, so ∠APB=${ans}°.`, k);
}

function mensuration(i, level) {
  const k = i + 101 + level * 19, variant = Math.floor(i / 5), r = 7 * (1 + k % 3), h = 2 + k % 9, pi = 22 / 7;
  if (i % 5 === 0) {
    const ans = pi * r * r * h;
    return choice(`Using π=22/7, find the volume of a cylinder of radius ${r} cm and height ${h} cm.`, ans, [2 * pi * r * h, pi * r * r, ans / 3], `V=πr²h=${ans} cm³.`, k);
  }
  if (i % 5 === 1) {
    const ans = 2 * pi * r * h;
    return choice(`Using π=22/7, find the curved surface area of a cylinder with radius ${r} cm and height ${h} cm.`, ans, [pi * r * r * h, pi * r * h, 2 * pi * r * (r + h)], `CSA=2πrh=${ans} cm².`, k);
  }
  if (i % 5 === 2) {
    const radius = 7 * (variant + 1), slant = radius + 7, ans = pi * radius * slant;
    return choice(`A cone has radius ${radius} cm and slant height ${slant} cm. Find its curved surface area using π=22/7.`, ans, [pi * radius * radius, 2 * ans, ans / 3], `CSA=πrl=${ans} cm².`, k);
  }
  if (i % 5 === 3) {
    const radius = 7 * (variant + 1), ans = 4 * pi * radius * radius;
    return choice(`Find the surface area of a sphere of radius ${radius} cm using π=22/7.`, ans, [ans / 4, ans / 2, ans * radius / 3], `Surface area=4πr²=${ans} cm².`, k);
  }
  const radius = 7 * (variant + 1), ans = 2 * pi * radius * radius;
  return choice(`Find the curved surface area of a hemisphere of radius ${radius} cm using π=22/7.`, ans, [ans / 2, ans * 1.5, ans * 2], `Curved surface area=2πr²=${ans} cm².`, k);
}

function trigonometry(i, level) {
  const k = i + 101 + level * 19, variant = Math.floor(i / 5);
  const standards = [["sin 30°", "1/2", ["√3/2", "1", "0"]], ["cos 60°", "1/2", ["√3/2", "0", "1"]], ["tan 45°", "1", ["0", "1/2", "√3"]], ["sin 90°", "1", ["0", "1/2", "√3/2"]], ["cos 0°", "1", ["0", "1/2", "√3/2"]]], standard = standards[k % 5];
  const selectedStandard = standards[(variant + level) % standards.length];
  if (i % 5 === 0) return choice(`Evaluate ${selectedStandard[0]}.`, selectedStandard[1], selectedStandard[2], `The standard value is ${selectedStandard[0]}=${selectedStandard[1]}.`, k);
  if (i % 5 === 1) {
    const multiple = 1 + k % 4, opp = 3 * multiple, adj = 4 * multiple;
    return choice(`For acute θ, opposite=${opp} and adjacent=${adj}. Find tan θ.`, "3/4", ["4/3", "3/5", "4/5"], `tan θ=opposite/adjacent=${opp}/${adj}=3/4.`, k);
  }
  if (i % 5 === 2) {
    const sin2 = ["1/4", "1/2", "3/4", "0"][variant % 4], cos2 = ["3/4", "1/2", "1/4", "1"][variant % 4];
    return choice(`If sin²θ=${sin2}, find cos²θ.`, cos2, [sin2, "0", "2"], `sin²θ+cos²θ=1, so cos²θ=${cos2}.`, k);
  }
  if (i % 5 === 3) {
    const theta = [30, 45, 60, 20][variant % 4];
    return choice(`For acute θ=${theta}°, cos(90°−θ) equals`, `sin ${theta}°`, [`cos ${theta}°`, `tan ${theta}°`, `cot ${theta}°`], `Complementary ratios give cos(90°−θ)=sin θ.`, k);
  }
  const finalVariants = [["tan", "1/√3", "30°"], ["tan", "1", "45°"], ["tan", "√3", "60°"], ["cot", "1", "45°"]], [ratioName, value, angle] = finalVariants[variant % 4];
  return choice(`If ${ratioName} θ=${value} and θ is acute, find θ.`, angle, ["0°", "90°", angle === "45°" ? "30°" : "45°"], `The standard value ${ratioName} ${angle}=${value}.`, k);
}

function applications(i, level) {
  const k = i + 101 + level * 19, variant = Math.floor((i % 20) / 5), distance = 10 * (1 + variant + level), angle = [30, 45, 60, 45][variant];
  if (i % 5 === 0) {
    const ans = angle === 30 ? `${distance}/√3 m` : angle === 45 ? `${distance} m` : `${distance}√3 m`;
    return choice(`From a point ${distance} m from a tower, its angle of elevation is ${angle}°. Find its height.`, ans, [`${distance * 2} m`, `${distance}/2 m`, `${distance}√2 m`], `height=distance×tan ${angle}°=${ans}.`, k);
  }
  if (i % 5 === 1) return choice(`A pole is ${distance} m high. From a point ${distance} m away, find the angle of elevation of its top.`, "45°", ["30°", "60°", "90°"], `tan θ=height/distance=1, so θ=45°.`, k);
  if (i % 5 === 2) {
    const object = ["kite", "tower top", "cloud", "flag top"][variant % 4];
    return choice(`The angle measured upward from a horizontal line of sight to a ${object} is the`, "angle of elevation", ["angle of depression", "reflex angle", "complementary angle"], `An object above eye level forms an angle of elevation.`, k);
  }
  if (i % 5 === 3) {
    const object = ["tower", "lighthouse", "building", "hilltop"][variant % 4];
    return choice(`The angle of depression from a ${object} and the corresponding ground angle of elevation are`, "equal", ["complementary", "supplementary", "unrelated"], `They are alternate interior angles between parallel horizontal lines.`, k);
  }
  const ratios = [["1:√3", "30°"], ["1:1", "45°"], ["√3:1", "60°"], ["2:2", "45°"]], [ratioText, answer] = ratios[variant];
  const object = ["pole", "tree", "tower", "flagstaff"][variant];
  return choice(`A vertical ${object} has height-to-shadow ratio ${ratioText}. Find the Sun's angle of elevation.`, answer, ["0°", answer === "45°" ? "30°" : "45°", "90°"], `tan θ=height/shadow, so θ=${answer}.`, k);
}

function probability(i, level) {
  const k = i + 101 + level * 19, variant = Math.floor(i / 5);
  if (i % 5 === 0) return choice(`A fair die is thrown. Find the probability of getting ${1 + k % 6}.`, "1/6", ["1/2", "1/3", "5/6"], `One of six equally likely outcomes is favourable.`, k);
  if (i % 5 === 1) {
    const coinQuestions = [
      [`A fair coin is tossed once. Find P(head).`, "1/2", ["1/4", "0", "1"], `One of two equally likely outcomes is a head.`],
      [`Two fair coins are tossed. Find P(exactly one head).`, "1/2", ["1/4", "3/4", "1"], `HT and TH are two of four outcomes.`],
      [`Two fair coins are tossed. Find P(two heads).`, "1/4", ["1/2", "3/4", "1"], `Only HH is favourable among four outcomes.`],
      [`Two fair coins are tossed. Find P(at least one head).`, "3/4", ["1/4", "1/2", "1"], `HH, HT and TH are three of four outcomes.`],
    ][variant % 4];
    return choice(coinQuestions[0], coinQuestions[1], coinQuestions[2], coinQuestions[3], k);
  }
  if (i % 5 === 2) {
    const red = 3 + k % 7, blue = 4 + k % 6, ans = frac(red, red + blue);
    return choice(`A bag has ${red} red and ${blue} blue balls. Find P(red).`, ans, [frac(blue, red + blue), frac(red, blue), frac(1, red + blue)], `P(red)=${red}/${red + blue}=${ans}.`, k);
  }
  if (i % 5 === 3) {
    const p = 1 + k % 7, ans = frac(10 - p, 10);
    return choice(`If P(E)=${frac(p, 10)}, find P(not E).`, ans, [frac(p, 10), "1", "1/10"], `P(not E)=1−P(E)=${ans}.`, k);
  }
  const sum = 5 + k % 7, favourable = 6 - Math.abs(7 - sum), ans = frac(favourable, 36);
  return choice(`Two fair dice are thrown. Find the probability that their sum is ${sum}.`, ans, [frac(sum, 36), "1/6", frac(36 - favourable, 36)], `${favourable} of 36 ordered outcomes have sum ${sum}; probability=${ans}.`, k);
}

function statistics(i, level) {
  const k = i + 101 + level * 19, base = 2 + k % 8;
  if (i % 5 === 0) {
    const data = [base, base + 2, base + 4, base + 6, base + 8], ans = base + 4;
    return choice(`Find the mean of ${data.join(", ")}.`, ans, [ans - 2, ans + 2, data.reduce((a, b) => a + b, 0)], `Mean=${data.reduce((a, b) => a + b, 0)}/5=${ans}.`, k);
  }
  if (i % 5 === 1) {
    const data = [base, base + 1, base + 3, base + 7, base + 9], ans = data[2];
    return choice(`Find the median of ${data.join(", ")}.`, ans, [data[1], data[3], (data[1] + data[2]) / 2], `With five ordered values, the median is the third value, ${ans}.`, k);
  }
  if (i % 5 === 2) {
    const ans = base + 2, data = [base, ans, ans, ans, base + 5, base + 7];
    return choice(`Find the mode of ${data.join(", ")}.`, ans, [base, base + 5, base + 7], `${ans} has the greatest frequency.`, k);
  }
  if (i % 5 === 3) {
    const high = base + 9 + level, ans = high - base;
    return choice(`Find the range of ${base}, ${base + 2}, ${base + 5}, ${high}.`, ans, [high, base, high + base], `Range=largest−smallest=${high}−${base}=${ans}.`, k);
  }
  const median = 10 + k, mean = 8 + k, mode = 3 * median - 2 * mean;
  return choice(`Using Mode = 3 Median − 2 Mean, find the mode when median=${median} and mean=${mean}.`, mode, [median, mean, 3 * mean - 2 * median], `Mode=3(${median})−2(${mean})=${mode}.`, k);
}


const generators = [realNumbers, sets, polynomials, linearPairs, quadratics, progressions, coordinateGeometry, similarTriangles, tangents, mensuration, trigonometry, applications, probability, statistics];

export function createMathematicsDpp(chapterIndex, levelIndex, chapter) {
 if(!Number.isInteger(chapterIndex)||chapterIndex<0||chapterIndex>=14||![0,1,2].includes(levelIndex)) throw new Error("Invalid DPP selection");
 const level=levels[levelIndex];
 return {title:chapter.name+" — "+level.title,chapter:chapter.name,difficulty:level.difficulty,suggestedDurationMinutes:level.minutes,questions:Array.from({length:20},(_,i)=>({id:"M600-NEW-"+(chapterIndex+1)+"-"+level.code+"-"+(i+1),...generators[chapterIndex](i+levelIndex*20+100,levelIndex)}))};
}
