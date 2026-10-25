import { expandBanks } from './expand-dpps.mjs';
// Retained authored questions, expanded below to 30 per DPP using chapter-specific sources.
// Each row: prompt | correct answer | three distractors | explanation.
export const banks = {};
const add = (subject, chapters) => { banks[subject] = chapters.map(chapter => chapter.map(level => level.trim().split('\n').map(line => {
 const [question, correct, a, b, c, explanation] = line.split('|');
 if (![question,correct,a,b,c,explanation].every(Boolean)) throw Error(line);
 return {question, correct, distractors:[a,b,c], explanation};
}))); };
add('mathematics', [
[
`Which number is irrational?|√2|0.25|−3|2/7|√2 cannot be written as a ratio of integers.
What is the HCF of 18 and 24?|6|3|12|72|18 = 3 × 6 and 24 = 4 × 6; no larger integer divides both.
A rational number in lowest terms terminates when its denominator has only which prime factors?|2 and 5|3 and 7|2 and 3|5 and 7|A denominator dividing a power of 10 gives a terminating decimal.`,
`What is the LCM of 12 and 18?|36|6|72|216|LCM × HCF = 12 × 18; the HCF is 6.
Does 7/40 have a terminating decimal?|Yes, because 40 = 2³ × 5|No, because 7 is prime|No, because 40 is not a power of 10|Yes, because every fraction terminates|In lowest terms the denominator contains only 2 and 5.
What is the remainder when 100 is divided by 7?|2|1|3|5|100 = 7 × 14 + 2.`,
`If two positive integers have HCF 12 and LCM 180, and one is 36, what is the other?|60|48|72|90|Their product is 12 × 180; divide by 36 to get 60.
If √3 = p/q in lowest terms, which contradiction completes the irrationality proof?|Both p and q must be divisible by 3|p must be even|q must be 1|p must be smaller than q|Squaring gives p² = 3q², forcing both integers to have factor 3.
Why is 6ⁿ never divisible by 10 for a positive integer n?|Its prime factorisation has no factor 5|It is always odd|It has no factor 2|Its last digit is always 0|6ⁿ contains only factors 2 and 3; divisibility by 10 also requires 5.`
],
[
`What is the intersection of {1,2,3} and {3,4}?|{3}|{1,2,3,4}|{1,2}|{4}|Intersection contains elements common to both sets.
How many subsets does a two-element set have?|4|2|3|8|A set with n elements has 2ⁿ subsets.
Which symbol denotes the empty set?|∅|{0}|{∅}|0|The empty set has no elements; {0} has one.`,
`If n(A)=12, n(B)=9 and n(A∩B)=4, find n(A∪B).|17|21|25|5|Use 12 + 9 − 4 to avoid counting the intersection twice.
For U={1,2,3,4,5} and A={2,4}, find A′.|{1,3,5}|{2,4}|{1,2,3}|{5}|The complement contains elements of U outside A.
If A={1,2} and B={2,3}, what is A−B?|{1}|{2}|{3}|{1,3}|Remove from A every element that also belongs to B.`,
`In a class of 40, 25 study Hindi, 20 study Telugu and 10 study both. How many study neither?|5|10|15|0|The union has 25+20−10=35 students; 40−35=5.
For finite sets A⊆B with n(A)=n(B), what follows?|A=B|A=∅ always|A∩B=∅|A and B must be infinite|A proper subset of a finite set has fewer elements.
Which identity is valid for all sets A and B?|A−B=A∩B′|A−B=B−A|A∪B=A∩B|A∩B′=A∪B|An element is in A−B exactly when it is in A and outside B.`
],
[
`What is the degree of 3x²−5x+7?|2|3|1|7|The greatest exponent with a nonzero coefficient is 2.
Which value is a zero of x−4?|4|−4|0|1|Substituting 4 makes x−4 equal to zero.
For ax²+bx+c, the sum of its zeros is what?|−b/a|b/a|c/a|−c/a|Comparing a(x−α)(x−β) gives α+β=−b/a.`,
`Find the product of the zeros of 2x²−7x+3.|3/2|7/2|−3/2|−7/2|The product is c/a = 3/2.
What remainder results when x²+3x+2 is divided by x−1?|6|0|2|4|The remainder theorem gives p(1)=1+3+2=6.
Which monic quadratic has zeros 2 and −3?|x²+x−6|x²−x−6|x²+x+6|x²−5x+6|Expand (x−2)(x+3).`,
`If one zero of 2x²+kx−6 is 2, find k.|−1|1|−2|2|Substitute x=2: 8+2k−6=0, so k=−1.
If α and β are zeros of x²−5x+3, find α²+β².|19|25|31|10|Use (α+β)²−2αβ=25−6=19.
Which polynomial must divide x³−3x²−4x+12 exactly?|x−3|x−1|x+1|x−2|At x=3 the polynomial is 27−27−12+12=0.`
],
[
`A pair of intersecting straight lines represents how many common solutions?|One|None|Two|Infinitely many|The intersection point satisfies both equations.
Which ordered pair satisfies x+y=5?|(2,3)|(1,3)|(3,3)|(0,4)|2+3=5.
Two distinct parallel lines represent what type of system?|Inconsistent|Consistent with one solution|Consistent with infinitely many solutions|Identical equations|Distinct parallel lines have no intersection.`,
`Solve x+y=7 and x−y=1.|x=4,y=3|x=3,y=4|x=5,y=2|x=6,y=1|Adding gives 2x=8; then y=3.
What does the pair 2x+3y=6 and 4x+6y=12 represent?|Coincident lines|Distinct parallel lines|Perpendicular lines|Two intersection points|The second equation is twice the first.
Two pens and one pencil cost ₹25; one pen and one pencil cost ₹15. Find the pen price.|₹10|₹5|₹15|₹20|Subtract the second equation from the first.`,
`For what k does kx+2y=5 and 3x+6y=15 have infinitely many solutions?|1|2|3|5|All coefficient and constant ratios must be equal: k/3=2/6=5/15.
A two-digit number has digit sum 9 and is 27 greater than its reverse. What is it?|63|36|72|54|If digits are x,y, then x+y=9 and 9(x−y)=27, giving x=6,y=3.
For what k does 2x+3y=7 and 4x+6y=k have no solution?|Any k other than 14|Only k=14|Only k=7|Every real k|The left side doubles, so consistency requires k=14.`
],
[
`Which equation is quadratic?|x²−3x+2=0|2x+1=0|x³=1|1/x=2|A quadratic polynomial equation has degree 2.
What is the discriminant of ax²+bx+c=0?|b²−4ac|b²+4ac|a²−4bc|2a+b|The discriminant is the expression under the square root in the quadratic formula.
If a quadratic has discriminant zero, its real roots are what?|Equal|Distinct|Non-real|Always zero|The square-root term vanishes.`,
`Solve x²−5x+6=0.|2 and 3|−2 and −3|1 and 6|−1 and −6|Factor as (x−2)(x−3)=0.
How many real roots does x²+4x+5=0 have?|None|One repeated root|Two distinct roots|Infinitely many|The discriminant is 16−20=−4.
A rectangle has sides x and x+3 and area 40. Find its positive shorter side.|5|8|4|10|x²+3x−40=(x+8)(x−5)=0; reject the negative length.`,
`For which k does x²−6x+k=0 have equal roots?|9|6|3|12|Set the discriminant 36−4k equal to zero.
Two consecutive positive integers have product 156. Find their sum.|25|24|26|27|12×13=156, so their sum is 25.
Which roots solve 2x²−x−3=0?|3/2 and −1|−3/2 and 1|3 and −1/2|1/2 and −3|Factor as (2x−3)(x+1)=0.`
],
[
`What is the common difference of 3,7,11,15,…?|4|3|7|2|Subtract each term from the next.
The nth term of an AP is which expression?|a+(n−1)d|a+nd|adⁿ|a/n+d|The first term receives n−1 increments of d.
What is the next term of 2,6,18,…, a geometric progression?|54|36|24|20|The common ratio is 3.`,
`Find the tenth term of the AP 5,8,11,… .|32|35|30|27|a₁₀=5+9×3=32.
Find the sum of the first 20 positive integers.|210|200|190|220|S=20×21/2=210.
Find the fifth term of the GP 3,6,12,… .|48|24|96|30|a₅=3×2⁴=48.`,
`The third and seventh AP terms are 11 and 23. Find the first term.|5|3|7|8|Four common differences total 12, so d=3 and a=11−6=5.
How many terms of 3,7,11,… sum to 210?|10|9|11|12|Sₙ=n[6+4(n−1)]/2=n(2n+1); n=10 gives 210.
An AP has a₅=0. What is the sum of its first nine terms?|0|9|45|Cannot be determined|In an odd-length AP the middle term equals the mean; S₉=9a₅=0.`
],
[
`Find the distance from (0,0) to (3,4).|5|7|1|25|Distance is √(3²+4²)=5.
Find the midpoint of (2,4) and (6,8).|(4,6)|(8,12)|(2,2)|(3,4)|Average the two x coordinates and the two y coordinates.
Which point lies on the x-axis?|(3,0)|(0,3)|(2,2)|(−1,4)|Every point on the x-axis has y=0.`,
`Find the distance between (−2,1) and (4,9).|10|8|14|100|The coordinate differences are 6 and 8; √(36+64)=10.
A point divides the segment from (0,0) to (6,9) internally in the ratio 1:2. Find it.|(2,3)|(4,6)|(3,4.5)|(1,2)|The point is one-third of the way from the first endpoint.
What is the area of the triangle (0,0),(4,0),(0,3)?|6 square units|12 square units|7 square units|3 square units|Use half the product of perpendicular base 4 and height 3.`,
`For what k are (1,2),(3,6),(k,10) collinear?|5|4|6|7|The first slope is 2; (10−6)/(k−3)=2 gives k=5.
A point on the y-axis is equidistant from (2,3) and (4,1). What is it?|(0,0)|(0,1)|(0,2)|(0,3)|Set 4+(y−3)²=16+(y−1)² to obtain y=0.
The midpoint of AB is (3,−1), and A=(−2,5). Find B.|(8,−7)|(4,−6)|(1,4)|(6,−2)|Use B=2M−A coordinate by coordinate.`
],
[
`Corresponding angles in similar triangles are what?|Equal|Supplementary always|Complementary always|Unequal|Similar figures have equal corresponding angles.
If two similar triangles have side ratio 2:3, what is their area ratio?|4:9|2:3|8:27|3:2|Areas scale as the square of the side ratio.
Which criterion establishes similarity using two equal angles?|AA|SSS congruence only|RHS only|Equal perimeters|The third angle is then also equal.`,
`A 1.5 m stick casts a 2 m shadow; a tree casts an 8 m shadow at the same time. Find its height.|6 m|8 m|4 m|12 m|Similar right triangles give h/8=1.5/2.
In triangle ABC, DE∥BC with D on AB and E on AC. If AD=3, DB=2 and AE=6, find EC.|4|3|2|5|The basic proportionality theorem gives AD/DB=AE/EC.
A right triangle has legs 6 and 8. Find its hypotenuse.|10|14|12|7|Pythagoras gives √(36+64)=10.`,
`Similar triangles have areas 25 and 49. If a side of the smaller is 15, find the corresponding larger side.|21|29.4|35|10.7|Their side ratio is 5:7, so 15×7/5=21.
In a right triangle, the altitude to the hypotenuse divides it into lengths 4 and 9. Find the altitude.|6|13|5|√13|Similarity gives h²=4×9=36.
A line through D on AB and E on AC has AD/DB=AE/EC. What follows?|DE∥BC|DE⊥BC|AB=AC|D is necessarily the midpoint|This is the converse of the basic proportionality theorem.`
],
[
`The radius at the point of tangency is at what angle to the tangent?|90°|0°|45°|180°|A tangent is perpendicular to the radius at contact.
How many tangents can be drawn from a point outside a circle?|2|1|0|Infinitely many|The two tangents touch at distinct contact points.
Tangents drawn from the same external point have what relation?|Equal lengths|Perpendicular lengths always|One is twice the other|Their sum equals the radius|The two tangent segments from an external point are equal.`,
`A circle has radius 5 cm and OP=13 cm for an external point P. Find tangent length PT.|12 cm|8 cm|18 cm|√194 cm|OPT is right-angled at T; PT²=13²−5²=144.
If PA and PB are tangents and PA=7 cm, find PB.|7 cm|14 cm|3.5 cm|49 cm|Tangent lengths from the same external point are equal.
Two radii to tangent contact points enclose 110°. Find the angle between the tangents.|70°|110°|55°|35°|In the quadrilateral, two angles are 90°, leaving 180°−110°.`,
`From P, a tangent has length 6. A secant meets the circle at A and B with PA=3. Find PB.|12|9|6|15|The tangent-secant theorem gives PT²=PA×PB, so 36=3PB.
A quadrilateral circumscribes a circle. Three consecutive sides are 4,7,8. Find the fourth side.|5|11|3|19|Opposite-side sums are equal: 4+8=7+x.
Two chords intersect inside a circle. One has segments 3 and 8; the other has one segment 4. Find its other segment.|6|7|5|24|Intersecting-chord products are equal: 3×8=4x.`
],
[
`What is the volume of a cylinder of radius r and height h?|πr²h|2πrh|πrh²|4πr³/3|Volume is base area multiplied by height.
What is the curved surface area of a cone of radius r and slant height l?|πrl|πr²l|2πrl|πr²|Unrolling the curved surface gives a circular sector of area πrl.
What is the volume of a sphere of radius r?|4πr³/3|4πr²|πr³|2πr³/3|The sphere volume formula is 4πr³/3.`,
`A cylinder has radius 7 cm and height 10 cm. Using π=22/7, find its volume.|1540 cm³|440 cm³|770 cm³|3080 cm³|Volume=(22/7)×49×10=1540.
A cone has radius 3 cm and height 4 cm. Find its slant height.|5 cm|7 cm|1 cm|25 cm|Use l²=r²+h²=9+16.
A sphere's radius doubles. By what factor does its volume increase?|8|2|4|16|Volume is proportional to the cube of radius.`,
`A solid sphere of radius 3 cm is melted into a cylinder of radius 3 cm. Find the cylinder height.|4 cm|3 cm|6 cm|9 cm|Equate volumes: 36π=9πh, giving h=4.
A hemisphere of radius r is placed on a cylinder of radius r and height 2r. Find exposed surface area, including the bottom.|7πr²|8πr²|6πr²|9πr²|Add cylinder curve 4πr², hemisphere curve 2πr² and bottom πr².
A cone and cylinder have equal radius and height. What fraction of cylinder volume remains after removing the cone volume?|2/3|1/3|1/2|3/4|The cone occupies one-third of the cylinder's volume.`
],
[
`In a right triangle, sin θ is which ratio?|Opposite/hypotenuse|Adjacent/hypotenuse|Opposite/adjacent|Hypotenuse/opposite|Sine compares the opposite side with the hypotenuse.
What is tan 45°?|1|0|√3|1/√3|The opposite and adjacent sides are equal.
Which identity holds for all acute θ?|sin²θ+cos²θ=1|sin θ+cos θ=1|tan²θ=1|sin²θ−cos²θ=1|This follows by dividing the Pythagorean relation by hypotenuse squared.`,
`If sin θ=3/5 for acute θ, find cos θ.|4/5|3/4|5/4|2/5|cos θ=√(1−9/25)=4/5.
Evaluate 2sin 30°+cos 60°.|3/2|1|2|1/2|2×1/2+1/2=3/2.
If tan θ=5/12, find sec θ for acute θ.|13/12|12/13|13/5|5/13|The hypotenuse of the corresponding 5-12 right triangle is 13.`,
`Simplify (1−cos²θ)/sin θ for acute θ.|sin θ|cos θ|tan θ|1|The numerator equals sin²θ; divide by sin θ.
If sec θ+tan θ=3, find sec θ−tan θ.|1/3|3|2|1|Their product is sec²θ−tan²θ=1.
Evaluate sin²30°+cos²45°+tan²60°.|15/4|13/4|7/2|4|The sum is 1/4+1/2+3=15/4.`
],
[
`The angle made by a line of sight above the horizontal is called what?|Angle of elevation|Angle of depression|Right angle always|Bearing angle always|Elevation is measured upwards from the observer's horizontal.
A horizontal line of sight gives what elevation angle?|0°|90°|45°|180°|No upward tilt means zero elevation.
For a vertical tower and level ground, which ratio relates height to horizontal distance?|tan θ|sin θ only|cos θ only|sec θ only|In the right triangle, tan θ=height/distance.`,
`A tower is viewed at 45° from 20 m away on level ground, with eye level at its base level. Find its height.|20 m|10 m|20√3 m|40 m|h=20tan45°=20.
An observer's eye is 1.5 m high and 10 m from a building. Its top has elevation 45°. Find building height.|11.5 m|10 m|8.5 m|15 m|The top is 10 m above the eye; add 1.5 m.
A 10 m ladder makes 60° with the ground. What height does it reach?|5√3 m|5 m|10√3 m|10 m|The ladder is the hypotenuse; height=10sin60°.`,
`A tower has elevation 30° from a point. After moving 20 m towards it on level ground, elevation is 60°. Find height.|10√3 m|20√3 m|10 m|30 m|Let near distance be x: h=√3x=(x+20)/√3, so x=10.
From a tower top, a car's angle of depression is 30°. If tower height is 20 m, find horizontal distance.|20√3 m|20/√3 m|10 m|40 m|The elevation from the car is 30°; d=20/tan30°.
Two equal-height vertical poles stand 30 m apart. From the base of one, the other's top has elevation 45°. Find each height.|30 m|15 m|30√3 m|60 m|The relevant right triangle has horizontal leg 30 and tan45°=h/30.`
],
[
`What is the probability of an impossible event?|0|1|1/2|−1|An impossible event has no favourable outcomes.
For a fair coin, what is P(head)?|1/2|1|0|2|One of two equally likely outcomes is a head.
What is P(E)+P(not E)?|1|0|2|1/2|An event and its complement cover all possible outcomes.`,
`A fair die is rolled. Find the probability of a prime number.|1/2|1/3|2/3|1/6|The primes on the die are 2,3,5: three of six outcomes.
A bag has 3 red and 2 blue balls. Find P(blue).|2/5|3/5|1/2|2/3|Two of five equally likely balls are blue.
Two fair coins are tossed. Find P(exactly one head).|1/2|1/4|3/4|1|HT and TH are two of the four equally likely outcomes.`,
`Two fair dice are rolled. Find P(sum is 9).|1/9|1/6|1/12|1/4|The four ordered outcomes are (3,6),(4,5),(5,4),(6,3), out of 36.
One card is drawn from a standard 52-card deck. Find P(red king).|1/26|1/13|1/4|1/2|There are two red kings, so probability is 2/52.
A number is chosen uniformly from 1 to 30. Find P(divisible by 2 or 3).|2/3|1/2|5/6|1/3|There are 15 multiples of 2 and 10 of 3, with 5 counted twice: 20/30.`
],
[
`Find the arithmetic mean of 2,4,6.|4|3|6|12|Sum 12 divided by three observations gives 4.
What is the median of 1,3,5,7,9?|5|3|7|9|The median is the middle observation in sorted data.
What is the mode of 2,2,3,4?|2|3|4|11|The mode is the observation with the highest frequency.`,
`Values 10 and 20 have frequencies 3 and 2. Find their mean.|14|15|16|12|Weighted mean=(10×3+20×2)/5=14.
Find the median of 2,4,8,10.|6|4|8|7|With four values, average the middle two: (4+8)/2=6.
What is the class mark of the interval 20–30?|25|20|30|10|A class mark is the midpoint of its class boundaries.`,
`Grouped data has N=40, median class 20–30, preceding cumulative frequency 15 and median-class frequency 10. Find median.|25|20|30|27.5|Median=20+[(20−15)/10]×10=25.
The mean of five numbers is 12. Four are 8,10,12,14. Find the fifth.|16|12|14|18|Required sum is 60; known sum is 44.
A modal class has l=20,h=10,f₁=15,f₀=10,f₂=5. Find mode.|70/3|25|80/3|30|Mode=20+[(15−10)/(30−10−5)]×10=20+10/3.`
]
]);
add('physics', [
[
`Which mirror can form a real image of a real object?|Concave mirror|Plane mirror|Convex mirror|All mirrors always|A concave mirror converges rays and can produce a real image.
For a spherical mirror, how are focal length f and radius R related?|f=R/2|f=2R|f=R|f=R²|In the paraxial approximation the focus lies midway between pole and centre.
A convex mirror usually gives what image of a real object?|Virtual, erect and diminished|Real and enlarged|Real and inverted|Virtual and inverted|Reflected rays diverge; their backward extensions meet behind the mirror.`,
`A concave mirror has f=−10 cm and an object at u=−30 cm. Find v using the Cartesian convention.|−15 cm|15 cm|−30 cm|30 cm|1/v=1/f−1/u=−1/10+1/30=−1/15.
Where must an object be placed before a concave mirror to produce an enlarged erect image?|Between pole and focus|Beyond centre of curvature|At centre of curvature|At infinity|Inside the focal length, reflected rays form a virtual enlarged image.
Why are convex mirrors used as vehicle rear-view mirrors?|They provide a wide field of view|They always magnify vehicles|They form images on a screen|They eliminate reflection|Their diminished upright images let the driver see a wider region.`,
`A concave mirror forms a real image twice the object height. If f=−12 cm, find u.|−18 cm|−24 cm|−36 cm|18 cm|m=−2=−v/u gives v=2u; 1/u+1/(2u)=−1/12, so u=−18.
What happens to the image of a distant object when a concave mirror's upper half is covered?|A complete but dimmer image remains|The upper image half disappears|The lower image half disappears|No image forms|Each uncovered part can reflect rays from the whole object; less light reduces brightness.
An object moves towards a concave mirror from beyond C to between C and F. How does its real image change?|It moves farther from the mirror and enlarges|It moves closer and shrinks|It remains fixed at F|It becomes erect immediately|The mirror equation predicts increasing image distance and magnification until the object reaches F.`
],
[
`Why must a chemical equation be balanced?|Atoms are conserved in a reaction|Molecules never change|Reactants must have equal masses individually|All coefficients must be one|The number of atoms of each element remains unchanged.
Which reaction absorbs heat?|Endothermic reaction|Exothermic reaction|Every combustion reaction|Every neutralisation reaction|Endothermic processes take energy from their surroundings.
What is oxidation in terms of oxygen?|Addition of oxygen|Removal of oxygen|Addition of nitrogen always|Removal of all atoms|At this level, oxidation includes oxygen gain or hydrogen loss.`,
`Balance Al+O₂→Al₂O₃. Which coefficients are correct?|4,3,2|2,3,1|1,1,1|2,1,2|4Al+3O₂→2Al₂O₃ conserves four Al and six O atoms.
Zn+CuSO₄→ZnSO₄+Cu is which type of reaction?|Displacement|Decomposition|Combination|Neutralisation|More reactive zinc displaces copper from its salt.
Heating CaCO₃ produces CaO and CO₂. What reaction type is this?|Thermal decomposition|Double displacement|Combination|Precipitation|Heat breaks one compound into simpler products.`,
`In CuO+H₂→Cu+H₂O, which statement is correct?|CuO is reduced and H₂ is oxidised|CuO is oxidised and H₂ is reduced|Neither substance changes oxidation state|Both reactants are reduced|CuO loses oxygen; hydrogen gains oxygen.
Why must subscripts remain unchanged when balancing equations?|Changing them changes the identity of substances|They are always equal to coefficients|Subscripts indicate temperature|Only gaseous subscripts may change|Balancing adjusts particle numbers through coefficients, not chemical formulae.
Mixing Na₂SO₄(aq) and BaCl₂(aq) gives what evidence of reaction?|A white BaSO₄ precipitate|Hydrogen gas|Copper deposition|A black carbon deposit|Insoluble barium sulfate forms in this double-displacement reaction.`
],
[
`An aqueous solution with pH 2 is what?|Acidic|Neutral|Basic|Always a salt-free solution|pH below 7 indicates acidity under ordinary school conditions.
What colour does blue litmus turn in an acid?|Red|Green|Yellow|It always remains blue|Acids turn blue litmus red.
What is the chemical formula of common salt?|NaCl|NaOH|Na₂CO₃|CaCO₃|Common salt is sodium chloride.`,
`Which gas forms when dilute HCl reacts with zinc?|Hydrogen|Oxygen|Nitrogen|Chlorine|Zn+2HCl→ZnCl₂+H₂.
Adding acid to a carbonate releases which gas?|Carbon dioxide|Hydrogen|Oxygen|Ammonia|Carbonates react with acids to produce salt, water and CO₂.
A solution changes from pH 3 to pH 5. What happens to hydrogen-ion concentration?|It becomes 100 times smaller|It doubles|It becomes 100 times larger|It remains unchanged|Each pH increase of 1 represents a tenfold decrease in H⁺ concentration.`,
`Why does dry HCl gas not change dry blue litmus red?|Water is needed to form the ions responsible for acidity|HCl contains no hydrogen|Dry HCl is a strong base|Litmus reacts only with metals|HCl displays acidic behaviour after ionisation in water.
Why is acid added slowly to water during dilution?|Dilution releases heat; abundant water helps absorb it|Dilution always absorbs heat|Water chemically neutralises all acid|It prevents ion formation|Adding small acid portions with stirring limits dangerous local heating.
A farmer has acidic soil. Which treatment is most appropriate?|Apply a suitable amount of lime|Add hydrochloric acid|Add more acidic fertiliser indiscriminately|Remove all water permanently|Basic lime materials can neutralise excess soil acidity.`
],
[
`A convex lens in air is generally which kind of lens?|Converging|Diverging|Always plane|Always opaque|A convex lens brings parallel paraxial rays towards a focus.
What is the SI unit of lens power?|Dioptre|Metre|Newton|Joule|Power is the reciprocal of focal length in metres.
A concave lens forms what image of a real object?|Virtual, erect and diminished|Always real and inverted|Always enlarged|Always on a screen|Its refracted rays diverge and appear to come from a smaller upright image.`,
`A convex lens has focal length 25 cm. Find its power.|+4 D|−4 D|+0.04 D|+25 D|P=1/0.25=+4 dioptres.
For a convex lens f=+10 cm and u=−20 cm, find v.|+20 cm|−20 cm|+10 cm|+5 cm|Use 1/f=1/v−1/u; 1/v=1/10−1/20.
An object is placed within a convex lens's focal length. What image forms?|Virtual, erect and enlarged|Real, inverted and diminished|Real and same size|No image at all|The emerging rays diverge and their backward extensions meet on the object side.`,
`Two thin lenses of powers +5 D and −2 D are in contact. Find their equivalent focal length.|1/3 m|3 m|1/7 m|−1/3 m|P=5−2=3 D, so f=1/3 m.
A convex lens produces a real image three times object height. If f=15 cm, find object distance magnitude.|20 cm|30 cm|45 cm|60 cm|v=−3u; 1/15=1/(−3u)−1/u gives u=−20 cm.
Why does a lens's power depend on the surrounding medium?|Refraction depends on relative refractive index|Its glass mass changes|Its thickness must become zero|Light ceases travelling in liquids|Changing the medium changes the refractive contrast and hence focal length.`
],
[
`Which eye defect is corrected using a concave lens?|Myopia|Hypermetropia|Cataract directly|Colour blindness|A concave lens diverges incoming rays so a myopic eye focuses distant objects on the retina.
Which part controls the amount of light entering the eye?|Iris|Retina|Optic nerve|Cornea alone|The iris changes pupil size.
Splitting white light into its component colours is called what?|Dispersion|Reflection|Accommodation|Diffusion|Different wavelengths refract by different amounts.`,
`A myopic eye has far point 2 m. What lens power corrects distant vision?|−0.5 D|+0.5 D|−2 D|+2 D|For distant objects the correcting lens forms a virtual image at −2 m; P=−0.5 D.
Why does the clear daytime sky appear blue?|Shorter visible wavelengths scatter more strongly|Air contains blue pigment|Only blue light reaches Earth|The oceans reflect blue light onto all air|Air molecules scatter short wavelengths much more strongly than long ones.
When viewing a nearby object, what happens to the normal eye lens?|It becomes thicker and more powerful|It becomes thinner and less powerful|It becomes opaque|Its refractive index becomes zero|Ciliary muscles allow greater curvature, reducing focal length.`,
`A person can read only beyond 50 cm. What power helps read at 25 cm?|+2 D|−2 D|+4 D|−4 D|The lens must make u=−0.25 m appear at v=−0.50 m: P=1/v−1/u=2 D.
Why does the Sun appear reddish near the horizon?|Longer atmospheric paths scatter much of the shorter-wavelength light away|The Sun's surface suddenly cools each evening|Red light scatters most strongly|The atmosphere emits only red light|More blue and violet light is removed from the direct beam along the longer path.
Why do stars twinkle more noticeably than planets?|A star's point-like image is strongly affected by varying atmospheric refraction|Stars switch their nuclear reactions on and off|Planets emit steadier visible light than stars|Planets lie outside the atmosphere but stars do not|A planet's small extended disc averages many refracted rays, reducing fluctuations.`
],
[
`What is the maximum number of electrons in an orbital?|2|1|8|18|The two electrons in an orbital must have opposite spins.
What is the charge of a neutron?|Zero|+1 elementary charge|−1 elementary charge|+2 elementary charges|Neutrons are electrically neutral.
The atomic number equals the number of what?|Protons|Neutrons always|Protons plus neutrons|Orbitals|Each element is defined by its proton number.`,
`What is the shell distribution of a neutral sodium atom, Z=11?|2,8,1|2,7,2|2,8,2|2,6,3|Eleven electrons occupy the shells as 2,8,1 in the school model.
How many orbitals are in a p subshell?|3|1|5|7|The three p orbitals correspond to three allowed magnetic quantum numbers.
An atom has mass number 23 and atomic number 11. Find neutrons.|12|11|23|34|Neutrons = mass number − proton number = 23−11.`,
`Why does an atom emit a line spectrum rather than all possible wavelengths?|Electrons move between discrete allowed energies|Electrons can have every possible bound energy|The nucleus emits only sound|All atoms have identical energy gaps|Photon energy equals the difference between two quantised levels.
Which electron configuration violates the Pauli principle?|Two electrons with the same spin in one orbital|Two opposite-spin electrons in one orbital|One electron in each p orbital|An empty higher-energy orbital|No two electrons in an atom can have all four quantum numbers equal.
For the same principal quantum number n=3, what is the maximum shell capacity?|18|8|9|32|The maximum is 2n²=2×9=18, although filling follows orbital energies.`
],
[
`The modern periodic table arranges elements primarily by what?|Atomic number|Atomic mass alone|Density|Melting point|Atomic number gives the fundamental ordering.
Elements in the same group usually have similar what?|Valence-electron configurations|Numbers of shells|Atomic numbers|Atomic masses|Similar outer configurations explain similar chemical properties.
What generally happens to atomic size down a group?|It increases|It always decreases|It becomes zero|It remains identical|Additional electron shells place outer electrons farther from the nucleus.`,
`An element has electron distribution 2,8,7. Which group does it belong to?|17|1|2|18|Seven valence electrons place this main-group element in group 17.
Why does atomic size generally decrease across a period?|Increasing effective nuclear attraction pulls electrons closer|An electron shell is lost at every step|Protons are removed|Atomic number decreases|Electrons enter the same main shell while nuclear charge increases.
Which is generally more metallic: Na or Cl?|Na|Cl|Both equally|Neither, because both are gases|Metallic character generally decreases from left to right across a period.`,
`Two elements have configurations 2,8,1 and 2,8,8,1. What best explains their similar chemistry?|Both have one valence electron|Both have equal numbers of shells|Both are noble gases|Both have equal atomic radii|Their identical valence-electron count leads to similar common reactions.
Why is the second ionisation energy of sodium much greater than its first?|The second electron must be removed from a stable inner shell|The neutral atom has no nucleus|The second electron is farther from the nucleus|Sodium gains a shell after losing an electron|Na⁺ has the stable neon-like configuration 2,8.
Which comparison is correct for Na and Na⁺?|Na⁺ is smaller because it loses its outer shell|Na⁺ is larger because it gains a shell|Both have 11 electrons|Na⁺ has fewer protons|Ion formation removes the outermost electron without changing nuclear charge.`
],
[
`A covalent bond involves what?|Sharing electron pairs|Sharing protons|Transferring neutrons|Destroying nuclei|Covalent bonding results from shared electron pairs.
What ions form in sodium chloride?|Na⁺ and Cl⁻|Na⁻ and Cl⁺|Na²⁺ and Cl²⁻|Neutral Na and Cl atoms only|Sodium transfers one electron to chlorine.
How many electron pairs are shared in an N₂ molecule?|3|1|2|4|The nitrogen atoms form a triple covalent bond.`,
`Why does molten NaCl conduct electricity?|Its ions can move|Its molecules become metals|Its protons move through wires|It contains free neutrons|Mobile charged ions carry current in the melt.
Which bonding description fits MgO?|Mg transfers two electrons to O|Mg shares one proton with O|O transfers two electrons to Mg|Both atoms lose two electrons|Mg²⁺ and O²⁻ are formed by two-electron transfer.
Why does solid NaCl not conduct under ordinary conditions?|Its ions are fixed in a lattice|It has no charged particles|Its electrons are all free|It contains only molecules of gas|The lattice prevents the movement of ions needed for conduction.`,
`Which property best distinguishes many ionic compounds from simple molecular covalent compounds?|High melting point from strong ionic attractions|Always being liquids|Never dissolving in water|Conducting electricity as solids|Strong electrostatic attractions require considerable energy to overcome.
Why can a water molecule be polar although its overall charge is zero?|Unequal sharing and bent geometry give a net dipole|It contains unequal proton and electron totals|Every neutral molecule is nonpolar|Oxygen gives both its electrons to hydrogen|O−H bond dipoles do not cancel in the bent molecule.
Which Lewis description is correct for CO₂?|O=C=O with two double bonds|O−C−O with two single bonds and no other electrons|One triple bond to each oxygen|An ionic chain of C⁴⁻ and O²⁺|Two shared pairs per C−O bond satisfy the usual octets.`
],
[
`What is the SI unit of electric current?|Ampere|Volt|Ohm|Watt|Current is charge flowing per unit time, measured in amperes.
Which relation expresses Ohm's law at constant temperature?|V=IR|V=I/R|R=VI|I=VR|For an ohmic conductor, potential difference is proportional to current.
In a series circuit, which quantity is the same through every resistor?|Current|Voltage always|Resistance always|Power always|The same charge flow passes through each series element.`,
`A 6 Ω resistor has 12 V across it. Find current.|2 A|72 A|0.5 A|6 A|I=V/R=12/6=2.
Find the equivalent resistance of 6 Ω and 3 Ω in parallel.|2 Ω|9 Ω|3 Ω|18 Ω|1/R=1/6+1/3=1/2.
A device draws 2 A at 220 V. Find power.|440 W|110 W|222 W|48400 W|P=VI=220×2.`,
`A wire is stretched to twice its length at constant volume and unchanged resistivity. What is its new resistance?|4R|2R|R/2|R/4|Length doubles and area halves; R=ρL/A increases fourfold.
A 1000 W heater runs for 2 hours. How much electrical energy is used?|2 kWh|0.5 kWh|2000 kWh|1000 kWh|Energy in kWh equals power in kW multiplied by hours.
A 60 W and a 100 W lamp, both rated 220 V, are connected separately to 220 V. Which has higher resistance?|The 60 W lamp|The 100 W lamp|Both have equal resistance|Neither has resistance|R=V²/P; at the same rated voltage, lower power means higher resistance.`
],
[
`A current-carrying wire produces what around it?|A magnetic field|Only a gravitational field|Only a static electric charge|No field|Moving charge creates a magnetic field.
Which device converts electrical energy into mechanical energy?|Electric motor|Electric generator|Transformer alone|Dry cell|A motor uses magnetic force to produce motion.
What is electromagnetic induction?|Producing an emf by changing magnetic flux|Producing heat by friction|Charging by rubbing only|Splitting white light|A changing magnetic flux through a circuit induces emf.`,
`Reversing current in a straight wire does what to its magnetic field direction?|Reverses it|Leaves it unchanged|Eliminates Earth's field|Makes it radial outward|The right-hand thumb rule reverses when current reverses.
What happens when a magnet remains stationary relative to a stationary coil?|No induced emf from that unchanged flux|A constant induced current must flow|An infinite voltage forms|The coil must rotate|Induction requires a change of flux, not merely the presence of a field.
A wire is parallel to a uniform magnetic field. What is the magnetic force on its current?|Zero|Maximum|Always BI²L|Always BIL|F=BILsinθ; θ=0 gives zero.`,
`Why does an induced current oppose the flux change that produces it?|Lenz's law expresses conservation of energy|A coil always repels every magnet|Magnetic fields cannot store energy|Electric charge is destroyed|Otherwise the induced effect could reinforce the change and generate energy without input.
For a perpendicular wire, if B and I double while L is unchanged, how does force change?|It becomes four times as large|It doubles|It halves|It remains unchanged|F=BIL, so doubling both B and I multiplies F by four.
How can induced emf be increased while moving the same magnet through the same coil?|Move the magnet faster|Hold it still inside the coil|Remove every coil turn|Keep flux constant|Faster motion increases the rate of change of flux.`
],
[
`What is an ore?|A mineral from which a metal can be economically extracted|Any rock containing no metals|A pure alloy|Only a liquid mineral|Economic extractability distinguishes an ore from a general mineral.
What is gangue?|Unwanted earthy impurities in an ore|The extracted pure metal|The electrolyte in every cell|Only carbon dioxide|Gangue includes sand and other unwanted material.
Which process commonly converts a sulfide ore to oxide?|Roasting in air|Freezing in water|Electroplating|Simple filtration|Roasting heats sulfide ores in excess air.`,
`Why is aluminium extracted by electrolysis rather than carbon reduction?|Aluminium oxide is too stable for ordinary carbon reduction|Aluminium is less reactive than copper|Aluminium oxide contains no oxygen|Carbon cannot be heated|Highly reactive metals require electrolytic methods.
Heating a carbonate ore with limited or no air is called what?|Calcination|Roasting|Electrorefining|Alloying|Calcination removes volatile components such as CO₂ from carbonate ores.
What is the purpose of a flux in smelting?|To react with gangue and form slag|To increase ore impurities|To prevent every chemical reaction|To act only as a fuel|Flux converts gangue into a more easily removable slag.`,
`In electrolytic refining of copper, which electrode gains pure copper?|The pure-copper cathode|The impure-copper anode|Both gain identical masses of impurities|Neither, because copper cannot dissolve|Copper ions receive electrons at the cathode and deposit as metal.
Why is zinc able to displace copper from CuSO₄ solution?|Zinc is more reactive and more readily loses electrons|Copper is more reactive than zinc|Sulfate changes into chloride|Zinc has a smaller mass in every sample|Zn is oxidised while Cu²⁺ is reduced to copper metal.
Why is extraction method selected using the metal reactivity series?|More reactive metals form compounds harder to reduce|All metals melt at the same temperature|Reactivity gives the exact ore price|Every ore contains the same gangue|Compound stability influences whether heating, chemical reduction or electrolysis is suitable.`
],
[
`Why does carbon commonly form four covalent bonds?|It has four valence electrons|It has four shells|It always gains four protons|It has no electrons|Sharing four electrons lets carbon complete an octet.
What is catenation?|Self-linking of atoms into chains or rings|Bonding only to oxygen|Breaking every carbon bond|Formation of salts only|Carbon readily bonds with other carbon atoms.
Which functional group identifies an alcohol?|−OH|−COOH|−CHO|−CO−|Alcohols contain a hydroxyl group bonded to carbon.`,
`Which compound is unsaturated?|Ethene|Ethane|Methane|Propane|Ethene contains a carbon-carbon double bond.
What are the usual products of complete combustion of ethanol?|CO₂ and H₂O|CO and H₂ only|NaCl and H₂O|Carbon and nitrogen|Complete combustion converts carbon to CO₂ and hydrogen to water.
What is the difference between consecutive members of a homologous series?|CH₂|CH₄|CO₂|H₂O|Successive homologues differ by one methylene group and 14 u.`,
`Why is soap less effective in hard water?|Ca²⁺ and Mg²⁺ form insoluble salts with soap|Soap converts all water to acid|Hard water contains no ions|Soap becomes a metal|These insoluble salts produce scum and consume soap.
Ethanol reacts with ethanoic acid in the presence of concentrated H₂SO₄ to form what?|An ester and water|Only methane|Only hydrogen|Sodium ethanoate and oxygen|Esterification forms ethyl ethanoate and water.
Why can C₄H₁₀ have two structural isomers?|Its atoms can form different carbon-chain arrangements|Its carbon atoms change atomic number|Each isomer has a different molecular formula|It must contain a double bond|Butane and 2-methylpropane have the same formula but different connectivity.`
]
]);
add('biology', [
[
`Which pigment captures light for photosynthesis?|Chlorophyll|Haemoglobin|Melanin|Bile|Chlorophyll in chloroplasts absorbs light energy.
Which enzyme begins starch digestion in the mouth?|Salivary amylase|Pepsin|Trypsin|Lipase|Salivary amylase breaks starch into simpler carbohydrates.
Where are most digested nutrients absorbed in humans?|Small intestine|Oesophagus|Stomach only|Large intestine only|The small intestine has extensive absorptive surfaces.`,
`Why is a leaf boiled in alcohol during the starch test?|To remove chlorophyll|To add starch|To produce oxygen|To close stomata|Decolourisation makes the iodine colour change easier to see; use a water bath safely.
What is bile's main contribution to fat digestion?|Emulsifying fat into smaller droplets|Directly digesting fat with a bile enzyme|Converting all fat into protein|Absorbing oxygen|Emulsification increases the surface area available to lipase.
Why do intestinal villi improve absorption?|They increase surface area|They eliminate blood vessels|They prevent contact with food|They secrete only hydrochloric acid|Many villi provide a large surface with transport vessels.`,
`A destarched plant has part of a leaf covered with opaque paper and is exposed to light. Which part tests positive for starch?|The uncovered green part|Only the covered part|Every part regardless of light|Neither part under any conditions|The exposed green tissue can photosynthesise and accumulate starch.
A plant receives light and water but no carbon dioxide. Why is glucose production restricted?|Carbon dioxide supplies carbon for carbohydrate synthesis|CO₂ supplies chlorophyll directly|Water cannot enter roots without CO₂|Light becomes completely absent|Light energy cannot replace the carbon source needed to build sugars.
Why is the stomach protected from its own acidic contents?|A mucus barrier protects the lining|Its acid is neutral at all times|Pepsin digests only plant tissue|The lining contains no proteins|Mucus and related protective mechanisms limit acid and enzyme injury.`
],
[
`Which organelle produces much of the ATP during aerobic respiration?|Mitochondrion|Ribosome|Lysosome|Golgi body|Mitochondria house major stages of aerobic energy release.
Which structures are the main gas-exchange surfaces in human lungs?|Alveoli|Ribs|Bronchi cartilage|Diaphragm|Alveoli provide thin surfaces near capillaries.
Yeast fermentation commonly produces which products?|Ethanol and carbon dioxide|Oxygen and water only|Urea and glucose|Starch and nitrogen|Alcoholic fermentation releases ethanol, CO₂ and a small ATP yield.`,
`What happens to the diaphragm during normal inhalation?|It contracts and flattens|It relaxes and domes upwards|It stops all movement|It closes the trachea|The enlarged thoracic volume lowers pressure and draws air in.
Why does limewater turn milky with exhaled air?|Carbon dioxide forms insoluble calcium carbonate|Oxygen forms calcium metal|Nitrogen becomes chalk|Water vapour forms sodium chloride|CO₂ reacts with calcium hydroxide to produce a calcium carbonate precipitate.
Why is aerobic respiration usually more energy-yielding than fermentation?|Glucose is oxidised more completely|It uses no enzymes|It occurs without substrates|Fermentation never makes ATP|More complete oxidation permits a much larger ATP yield.`,
`Why can breathing rate rise during strenuous exercise?|Working muscles need faster oxygen delivery and CO₂ removal|The lungs manufacture extra glucose|Blood stops transporting gases|The diaphragm becomes a digestive organ|Metabolic demand and CO₂ production increase with exercise.
Why are alveoli both thin-walled and closely supplied with capillaries?|To reduce diffusion distance and maintain gas gradients|To store solid food|To prevent oxygen reaching blood|To maximise the distance gases travel|Short diffusion paths and blood flow support efficient gas exchange.
What correctly distinguishes breathing from cellular respiration?|Breathing moves air; cellular respiration releases usable energy from substrates|Both are only mechanical air movements|Cellular respiration occurs only in the lungs|Breathing directly produces all ATP|Ventilation supplies gases, while biochemical reactions in cells release energy.`
],
[
`Which blood cells mainly transport oxygen?|Red blood cells|Platelets|White blood cells|All blood cells equally|Haemoglobin in red cells binds oxygen.
Which plant tissue transports water and minerals from roots?|Xylem|Phloem|Epidermis only|Cork only|Xylem conducts water and dissolved minerals.
Which blood vessels carry blood away from the heart?|Arteries|Veins|Lymph vessels|Venules only|Arteries are defined by direction of flow, not oxygen content.`,
`Why do veins in the limbs have valves?|To reduce backward blood flow|To add oxygen to blood|To make blood clot continuously|To digest glucose|Valves assist return of low-pressure blood towards the heart.
Which chamber pumps blood into the aorta?|Left ventricle|Right ventricle|Right atrium|Left atrium|The left ventricle supplies the systemic circulation.
What is the main effect of transpiration pull?|Drawing water upward through xylem|Pushing food only down phloem|Stopping evaporation|Closing every stomatal pore permanently|Evaporation from leaves creates tension in continuous water columns.`,
`Why is the pulmonary artery an exception to the common oxygenation rule for arteries?|It carries deoxygenated blood away from the heart|It carries blood towards the heart|It has no walls|It carries only lymph|Its classification depends on flow direction; it goes from right ventricle to lungs.
What is the benefit of separating oxygenated and deoxygenated blood in humans?|Efficient oxygen supply supports high metabolic demand|It eliminates the need for lungs|It makes all blood blue|It prevents nutrient transport|Double circulation limits mixing and supports efficient tissue oxygenation.
If a ring of bark including phloem is removed while xylem remains intact, what initially accumulates above the ring?|Sugars|Only oxygen gas|Only soil minerals|Urea|Interrupted phloem blocks transport of photosynthates past the ring.`
],
[
`What is the functional unit of the human kidney?|Nephron|Neuron|Alveolus|Villus|Nephrons filter blood and modify filtrate to form urine.
What is the main nitrogenous waste excreted in human urine?|Urea|Starch|Cellulose|Chlorophyll|Protein metabolism produces nitrogenous waste largely excreted as urea.
Which tubes carry urine from kidneys to urinary bladder?|Ureters|Urethra|Arteries|Oviducts|Each ureter connects a kidney to the bladder.`,
`Where does filtration into a nephron begin?|Glomerulus into Bowman's capsule|Urinary bladder into urethra|Ureter into kidney|Collecting duct into artery|Blood pressure drives filtration across glomerular capillaries.
Why is glucose normally absent or very low in healthy urine?|Filtered glucose is reabsorbed|Glucose cannot enter kidney blood|All glucose is excreted unchanged|Kidneys manufacture no filtrate|Tubular transport normally recovers filtered glucose.
What is a major function of dialysis in kidney failure?|Removing wastes and excess substances from blood|Replacing all hormonal functions permanently|Producing red cells directly|Digesting dietary proteins|Dialysis uses a membrane and concentration gradients to clear selected substances.`,
`Why does final urine volume differ greatly from the volume initially filtered?|Most filtered water is reabsorbed|All filtrate evaporates|The bladder converts water to urea|Filtration happens only once a month|Tubular reabsorption returns most water and useful solutes to blood.
How can plants dispose of some wastes without a specialised excretory organ?|Store them in leaves or bark that are later shed|Convert every waste into oxygen|Use kidneys in roots|Never produce metabolic wastes|Plants can isolate wastes in tissues, exude substances or release gases.
Why is excretion different from egestion?|Excretion removes metabolic wastes; egestion removes undigested food|Both remove only faeces|Egestion filters blood|Excretion means food absorption|The distinction concerns the origin of the material removed.`
],
[
`What is the basic functional cell of nervous tissue?|Neuron|Nephron|Platelet|Guard cell|Neurons receive and transmit information.
Which hormone lowers blood glucose by promoting uptake and storage?|Insulin|Adrenaline|Thyroxine|Growth hormone|Pancreatic beta cells secrete insulin.
A plant shoot growing towards light shows what?|Positive phototropism|Negative phototropism|Geotropism only|Thigmonasty only|Directional growth towards light is positive phototropism.`,
`Why can withdrawal from a hot object occur before conscious awareness?|A spinal reflex pathway initiates the response|The brain is never informed|Muscles decide without neurons|Hormones must first reach every cell|Reflex circuits can rapidly coordinate withdrawal while information also reaches the brain.
Which brain region is especially associated with balance and coordinated movement?|Cerebellum|Cerebrum only|Medulla only|Hypothalamus only|The cerebellum fine-tunes movement and posture.
How does auxin cause a shoot to bend towards light?|Greater elongation on the shaded side|Equal growth on both sides always|Destruction of every illuminated cell|Growth only in roots|Unequal auxin distribution promotes more elongation on the shaded shoot side.`,
`What happens if the sensory neuron of a withdrawal reflex is damaged?|The incoming signal may fail to reach the reflex centre|The response necessarily becomes faster|The receptor becomes a hormone gland|The motor neuron starts producing insulin|A complete reflex needs a sensory pathway, central connection and motor output.
Why can endocrine effects be slower but longer-lasting than many nerve impulses?|Hormones travel through blood and act on target cells|Hormones move only along axons|Nerve impulses are stored in the stomach|Every hormone acts instantly at a synapse|Blood-borne signalling often has different timing and persistence from electrical impulses.
Why does adrenaline prepare the body for an emergency?|It increases readiness for rapid action, including heart activity|It stops oxygen delivery|It permanently stops glucose use|It functions only in digestion|Adrenaline coordinates several changes that support immediate physical responses.`
],
[
`Which process produces two daughter cells in Amoeba reproduction?|Binary fission|Budding only|Fragmentation only|Pollination|Amoeba reproduces by division of one cell into two.
Where are human sperm produced?|Testes|Ovaries|Uterus|Urinary bladder|The seminiferous tubules of testes produce sperm.
Transfer of pollen from anther to stigma is called what?|Pollination|Fertilisation|Germination|Implantation|Pollination precedes fertilisation in flowering plants.`,
`What forms after fusion of male and female gametes?|Zygote|Pollen grain|Placenta immediately|Spore only|Fertilisation produces a diploid zygote.
What is an advantage of vegetative propagation for desirable crop varieties?|It preserves useful parental characteristics|It always creates maximum genetic variation|It requires seed fertilisation every time|It prevents all plant diseases|Clonal propagation largely retains the parent plant's genotype.
What is the placenta's main role?|Exchange between maternal and fetal circulations|Direct mixing of all maternal and fetal blood|Production of sperm|Transporting air into fetal lungs|The placenta enables transfer of nutrients, gases and wastes without normal direct blood mixing.`,
`Why does sexual reproduction usually generate more variation than asexual reproduction?|Meiosis and gamete fusion combine genetic material|All offspring are identical clones|It uses no DNA|Only one parent contributes genes|Recombination, chromosome assortment and fertilisation create new combinations.
Why is pollination not the same as fertilisation?|Pollination transfers pollen; fertilisation fuses gametes|Both mean seed dispersal|Pollination fuses egg and sperm directly|Fertilisation is transfer of pollen to anther|A pollen tube and male-gamete delivery follow successful pollination.
Why do most barrier contraceptives prevent fertilisation?|They hinder sperm from reaching the egg|They change every inherited gene|They always stop ovulation hormonally|They destroy the uterus|Physical separation of sperm and egg reduces the chance of fertilisation.`
],
[
`Which enzyme in saliva begins carbohydrate digestion?|Amylase|Pepsin|Lipase|Trypsin|Salivary amylase begins starch breakdown.
Which movement propels food through the alimentary canal?|Peristalsis|Diffusion only|Filtration|Transpiration|Coordinated waves of muscle contraction move food forward.
Which organ produces bile?|Liver|Pancreas|Stomach|Spleen|The liver produces bile, which is stored in the gallbladder.`,
`Why does salivation sometimes begin when food is seen or smelled?|Nervous coordination prepares the digestive system|The eyes secrete saliva directly|Food has already entered the stomach|Salivation occurs without any regulation|Sensory inputs can stimulate salivary gland activity before eating.
Why does the epiglottis help during swallowing?|It helps keep food out of the airway|It pumps blood to the lungs|It absorbs amino acids|It produces bile|Swallowing coordinates protection of the laryngeal opening.
Why are intestinal contents mixed repeatedly?|To improve contact with digestive secretions and absorptive surfaces|To stop every enzyme reaction|To remove all intestinal villi|To return all food to the mouth|Muscle activity helps digestion and exposure to the intestinal lining.`,
`What makes digestion an example of organ-system coordination?|Nerves, hormones, glands and muscles act together|Only one enzyme controls every step|The stomach works independently of the rest of the body|Absorption requires no circulation|Effective digestion needs timed secretion, movement, absorption and transport.
Why can a damaged swallowing mechanism cause food to enter the airway?|Airway closure and food propulsion may lose coordination|The oesophagus normally ends in the lung|Bile closes the trachea|The stomach draws air through food|Swallowing must coordinate several muscles and protective actions.
How do digestive hormones and nerves complement each other?|They coordinate secretions and movements according to food-related signals|They always cancel each other's effects|Hormones transport undigested food mechanically|Nerves replace all digestive enzymes|Multiple signalling routes match digestive activity to the meal.`
],
[
`Who used pea plants in foundational inheritance experiments?|Gregor Mendel|Charles Darwin|Louis Pasteur|Robert Hooke|Mendel studied predictable inheritance patterns in peas.
Alternative forms of a gene are called what?|Alleles|Tissues|Organelles|Species|Alleles are different versions of a gene at a locus.
What is a fossil?|Preserved evidence of past life|Any modern living organism|Only a volcanic mineral|Only fresh plant tissue|Fossils include preserved remains, impressions and traces.`,
`In a monohybrid cross Tt×Tt with complete dominance, what fraction is recessive tt?|1/4|1/2|3/4|1|The genotypes occur in the ratio TT:Tt:tt = 1:2:1.
Why are human males described as heterogametic in the standard XX/XY model?|They produce X-bearing and Y-bearing sperm|They produce only X-bearing sperm|They have two identical X chromosomes|They produce no gametes|The usual XY chromosome pair produces two sex-chromosome classes of sperm.
Which pair illustrates homologous organs?|Human arm and whale flipper|Bird wing and insect wing|Fish gills and mammalian lungs as identical structures|Potato tuber and human heart|The arm and flipper share an inherited structural plan despite different functions.`,
`A tall pea plant crossed with tt gives approximately equal tall and dwarf offspring. What is the tall parent's genotype?|Tt|TT|tt|Cannot be inferred under the stated Mendelian model|Tt×tt produces equal Tt and tt offspring.
Why are acquired traits such as a trained muscle generally not inherited as Mendelian traits?|They usually do not change the genetic information passed through gametes|They necessarily replace all gamete DNA|Every acquired trait is dominant|They are always caused by new species formation|Changes to body tissues alone are not automatically transmitted through germ cells.
How does natural selection change populations over generations?|Heritable variants affecting reproductive success can become more common|Individuals deliberately evolve needed genes|Every mutation is beneficial|All members change identically at once|Selection acts on variation; differential reproduction changes variant frequencies.`
],
[
`Which organisms are producers in most land ecosystems?|Green plants|Herbivores|Carnivores|Decomposers only|Photosynthetic plants convert solar energy into organic matter.
What do decomposers mainly do?|Break down dead organic material|Create sunlight|Prevent nutrient recycling|Consume only living predators|Their activity returns nutrients to ecosystems.
Which is a biodegradable material?|Vegetable peel|Glass bottle|Polythene bag|Aluminium can|Microorganisms can decompose plant organic matter.`,
`If producers contain 10000 J and 10% is transferred to each next trophic level, how much reaches secondary consumers?|100 J|1000 J|10 J|10000 J|Two transfers give 10000×0.1×0.1=100 J.
Why can persistent pollutants become more concentrated at higher trophic levels?|They accumulate and are passed through feeding relationships|They evaporate completely in all predators|Higher consumers make all pesticides|Producers contain no pollutants|Slow breakdown and repeated feeding can cause biomagnification.
What is one role of the stratospheric ozone layer?|Absorbing much harmful ultraviolet radiation|Creating all atmospheric oxygen|Blocking all visible sunlight|Producing rain directly|Ozone limits the amount of UV reaching Earth's surface.`,
`Why is energy flow through an ecosystem not a closed cycle?|Usable energy is dissipated as heat at each transfer|All heat returns directly to producers as food|Energy is created by consumers|Only matter can be lost as heat|Energy needs continuing input, unlike many nutrients that cycle.
What may happen after a top predator is removed?|Changes can cascade through lower trophic levels|All other populations must stay fixed|Producers always disappear immediately|Every herbivore becomes a predator|Predator-prey interactions can indirectly alter multiple populations.
Why does waste segregation help environmental management?|It allows suitable recycling, composting and safer handling|All wastes require identical treatment|It makes hazardous waste harmless automatically|It removes the need to reduce waste|Separating streams improves the effectiveness of different treatment methods.`
],
[
`Which is a renewable resource under suitable management?|Solar energy|Coal|Petroleum|Natural gas|Solar energy is continually supplied on human timescales.
What is rainwater harvesting?|Collecting and storing or recharging rainwater|Removing every local pond|Pumping only fossil groundwater|Converting rain into petroleum|Harvesting makes rainfall available for later use or groundwater recharge.
What does biodiversity mean?|Variety of life at multiple levels|Only the number of cattle|Only soil depth|Only rainfall amount|It includes variation within species, between species and among ecosystems.`,
`Why can over-pumping groundwater cause a falling water table?|Extraction exceeds recharge|All pumping creates new rainfall|Groundwater cannot move|Wells manufacture water|A sustained withdrawal-recharge imbalance depletes stored groundwater.
Why are forests important in watershed conservation?|They help protect soil and regulate runoff|They stop every drop of rain|They prevent all infiltration|They consume all stream water permanently|Vegetation and litter reduce erosion and support infiltration.
Which practice best reduces household material use?|Repairing and reusing products|Replacing working items daily|Burning all recyclable waste|Using disposable goods for every task|Extending product life reduces demand for new materials.`,
`Why must a renewable resource still be managed carefully?|Use can exceed its regeneration rate|Renewable means unlimited at every place and time|It never supports ecosystems|It cannot be depleted locally|Forests and groundwater can decline when consumption outpaces recovery.
A village restores tanks and contour bunds. What combined effect is most likely?|More local infiltration and less rapid runoff|Immediate formation of coal|Permanent elimination of drought everywhere|A guaranteed rise in seawater salinity|Water-holding measures slow runoff and create recharge opportunities.
Why should conservation decisions involve local communities?|They depend on resources and hold knowledge relevant to practical management|They have no stake in outcomes|Only distant users experience environmental effects|Participation automatically removes every conflict|Shared planning can improve fairness, local suitability and sustained stewardship.`
]
]);
add('social-science', [
[
`Which mountains form India's major northern mountain barrier?|Himalayas|Western Ghats|Eastern Ghats|Aravallis only|The Himalayan system extends along the northern part of the subcontinent.
Which region is largely built from river-deposited alluvium?|Northern Plains|Deccan Plateau's central lava region|Himalayan high peaks|Lakshadweep coral islands|The Indus-Ganga-Brahmaputra systems have deposited extensive alluvial plains.
Which is generally higher and more continuous?|Western Ghats|Eastern Ghats|Eastern coastal plain|Thar Desert dunes|The Western Ghats form a relatively continuous escarpment along the plateau's west.`,
`Why are the Northern Plains suitable for intensive agriculture?|Level land, alluvial soils and river water|Permanent snow cover|An absence of rivers|Only steep slopes|Physical conditions facilitate cultivation, although productivity also depends on human inputs.
Which landform is associated with the older crystalline rocks of peninsular India?|Peninsular Plateau|Young Himalayan fold ranges|Recent river delta deposits only|Coastal coral reefs only|The plateau is geologically older than the young Himalayan mountain system.
Why do several east-flowing peninsular rivers form deltas?|They deposit sediments near their mouths|They originate in the sea|They flow only underground|They contain no sediment|Reduced velocity at the coast allows sediment accumulation.`,
`Why should relief be considered when comparing transport costs across regions?|Steep slopes and mountain barriers can raise construction difficulties|All terrains have identical construction requirements|Rivers remove every transport barrier|Plateaus cannot have roads|Relief influences routes, gradients, bridges and engineering needs.
What best explains why relief alone cannot determine a region's prosperity?|Technology, institutions and social conditions also affect development|Physical geography has no influence anywhere|Mountains always prevent all economic activity|Every plain has identical income|Geography creates opportunities and constraints, but human factors shape outcomes.
How can Himalayan relief influence climate and water availability together?|It affects air movement and supports snow- and glacier-fed river systems|It eliminates seasonal rainfall everywhere|It stops all river flow to plains|It makes all peninsular rivers perennial|The mountain system interacts with atmospheric circulation and river headwaters.`
],
[
`Per capita income is calculated by dividing total income by what?|Population|Land area|Number of factories|Number of rivers|It is average income per person.
Which is a non-income development goal?|Safety and dignity|A higher salary only|More business profit only|Higher export revenue only|People value security, freedom, equality and respect as well as money.
Which service is a public facility?|A government health centre|A privately owned luxury watch|A personal jewellery collection|An individual's bank locker|Public facilities serve collective needs and may be publicly provided.`,
`Two regions have the same average income. Can income inequality still differ?|Yes, averages can hide distribution|No, averages prove identical distributions|No, both must have zero poverty|Only if their populations are zero|The same total per person can coexist with very different individual incomes.
A state has high income but poor child health. What does this suggest?|Income alone is an incomplete measure of development|Health is irrelevant to development|All residents are equally healthy|Schooling must be excellent|Development assessment also needs health, education and distribution indicators.
Why might workers and factory owners disagree over a development project?|Their benefits, costs and priorities may differ|Everyone always has identical interests|Only owners can have goals|Workers cannot value income|Groups occupy different positions and may experience the same project differently.`,
`A dam raises electricity output but displaces villages. Which assessment is most appropriate?|Consider benefits, displacement, rehabilitation and affected people's rights|Count only electricity generated|Ignore costs paid by poorer groups|Assume every resident gains equally|Development evaluation should consider who gains and who bears social and environmental costs.
Why can public schooling improve development beyond an immediate income rise?|It expands capabilities and future opportunities|It automatically removes every inequality|It reduces all skill levels|Its only effect is higher rainfall|Education supports participation, health understanding and future livelihoods.
What is a limitation of comparing countries using per capita income alone?|It omits distribution and many dimensions of wellbeing|It directly measures all freedoms|It reports each person's exact income|It proves environmental sustainability|An income average cannot by itself represent health, equality, rights or ecological conditions.`
],
[
`Agriculture belongs mainly to which sector?|Primary|Secondary|Tertiary|Quaternary only|It directly uses natural resources.
Manufacturing cloth from cotton belongs to which sector?|Secondary|Primary|Tertiary only|Household consumption only|Manufacturing transforms raw materials into products.
Banking and transport are generally classified as what?|Tertiary activities|Primary cultivation|Secondary manufacturing only|Unproductive by definition|Services support people and other economic activities.`,
`Five workers share farm work that three could do without reducing output. What is this?|Disguised unemployment|Full productive employment for all five|Seasonal rainfall|Industrial growth|Some workers' removal would not reduce output, indicating underemployment.
Why are only final goods counted to avoid double counting in GDP?|Intermediate inputs are already included in final product value|Intermediate goods have no value|Final goods are always imported|All goods must be counted twice|Counting both inputs and their final product would duplicate value.
A worker has no paid leave or job security. Which employment condition does this illustrate?|Informal or unorganised employment conditions|Guaranteed formal protections|Zero economic activity|Ownership of all production|Such workers commonly lack enforceable benefits and protection.`,
`Agriculture employs a large share of workers but produces a much smaller income share. What concern does this raise?|Low average output per worker and possible underemployment|Every farmer earns more than every service worker|Agriculture produces no goods|All agricultural work is unnecessary|The disparity suggests a need to improve productivity and create other decent employment.
How can irrigation reduce seasonal underemployment?|It can enable additional crop seasons|It removes all need for farm labour|It guarantees identical profits on every farm|It ends every non-farm job|More reliable water may support more cropping and related work.
Why should employment policy consider job quality as well as job numbers?|Low pay, insecurity and unsafe work can persist despite employment|All paid jobs provide equal security|Any job automatically ends poverty|Working conditions never affect development|Decent livelihoods depend on conditions, earnings and social protection too.`
],
[
`Which winds bring much of India's seasonal rainfall?|Southwest monsoon|Polar easterlies only|Permanent land breezes only|Trade winds with no seasonal change|The southwest monsoon is central to India's rainy season.
What is weather?|Short-term atmospheric conditions|Average conditions over decades only|The shape of land|The number of rivers|Weather describes conditions at a particular time and place.
Why are coastal temperatures often more moderate?|The sea heats and cools more slowly than land|Sea water has no heat capacity|Coasts receive no sunlight|All coasts are at the poles|The nearby sea reduces daily and seasonal extremes.`,
`Why can the leeward side of a mountain receive less rain?|Air has lost moisture on the windward side|Mountains prevent all winds globally|Leeward land contains no soil|Rain only falls below sea level|Descending air is relatively dry, creating a rain-shadow effect.
Why do higher-altitude places tend to be cooler?|Temperature generally decreases with altitude in the troposphere|They are farther from all clouds|Mountains produce cold without air|They receive no solar radiation|The usual environmental lapse rate helps explain cooler highlands.
Why can a late monsoon harm rainfed farmers?|Sowing and crop-water availability depend on rainfall timing|Rainfed crops never need water|Every crop grows only in winter snow|Monsoon timing affects only coastal fishing|Delayed rain can disrupt sowing windows and crop establishment.`,
`Why does rainfall amount alone not reveal agricultural water security?|Its timing, distribution, storage and soil conditions also matter|Rainfall has no agricultural role|Annual totals show every dry spell|Irrigation cannot store any water|The same total can arrive in destructive bursts or leave long dry periods.
How can Himalayan relief affect the winter climate of northern India?|It limits penetration of very cold continental winds|It blocks every western disturbance|It makes winter identical to summer|It removes all north Indian cold|The mountain barrier influences movement of cold air masses.
Why is a single unusually hot day insufficient evidence of a long-term climate trend?|Climate trends require observations over longer periods|Weather and climate are identical timescales|Temperature cannot be measured|One place's weather proves a global trend|Short-term variability must be distinguished from sustained climatic changes.`
],
[
`Which river generally flows west into the Arabian Sea?|Narmada|Godavari|Krishna|Mahanadi|The Narmada is a major west-flowing peninsular river.
What is a drainage basin?|Land drained by a river and its tributaries|Only the river mouth|Only a dam wall|An ocean current|A basin includes the area contributing runoff to a river system.
What is groundwater?|Water stored below the land surface|Only water in clouds|Only sea waves|All river sediment|It occupies pores and fractures below ground.`,
`Why are Himalayan rivers often described as perennial?|Rainfall and snow or glacier melt support their flow|They receive no seasonal inputs|They never change discharge|They all begin in the ocean|Multiple water sources sustain flow, though volume varies seasonally.
How can urban paving reduce groundwater recharge?|It limits infiltration and increases surface runoff|It creates unlimited new aquifers|It makes all rain evaporate instantly|It changes freshwater into petroleum|Impermeable surfaces prevent rainfall from entering soil easily.
What is a benefit of managing a watershed as a unit?|Upstream and downstream water uses can be considered together|Administrative boundaries erase river links|Only the river mouth needs attention|Soil and vegetation have no water effects|Activities in one part of a catchment affect water and sediment elsewhere.`,
`Two districts share an aquifer. Why can unregulated pumping in one affect the other?|Groundwater systems can extend across administrative boundaries|Water cannot move underground|District borders block all seepage|Each well creates a separate planet|Shared storage and hydraulic connections make extraction effects collective.
Why can a large dam create both benefits and conflicts?|Irrigation and power gains may accompany displacement and ecosystem changes|Every dam benefits every group equally|Dams have no social effects|Only fishers use river water|Water projects redistribute opportunities and costs among groups and places.
Why combine water conservation with demand management?|New supply alone may not prevent overuse|Demand can never change|Conservation creates water without limits|Efficiency removes every need for governance|Sustainable use also requires crop choices, regulation and responsible consumption.`
],
[
`Population density measures people per unit of what?|Area|Time|Income|Rainfall|It commonly reports people per square kilometre.
What is a census?|A systematic enumeration of a population|A daily weather forecast|A crop-price list|A single family's budget|A census collects population and related information at a specified reference time.
In the Indian census convention, sex ratio is generally expressed as what?|Females per 1000 males|Males per 100 females|Births per 1000 people|Children per square kilometre|This is the convention used in the textbook's population discussion.`,
`What happens to population if births exceed deaths and net migration is zero?|It increases|It must decline|It stays unchanged|It becomes zero|Natural increase equals births minus deaths.
A town has 50000 people in 100 km². Find density.|500 people/km²|50 people/km²|5000 people/km²|5 people/km²|Divide 50000 by 100.
Why can migration change a city's age structure?|Migrants may be concentrated in working ages|All migrants have identical ages to residents|Migration changes only rainfall|Migration never affects population composition|Age-selective movement can alter the share of working-age residents.`,
`Why does a large working-age population not automatically create a demographic dividend?|Education, health and productive jobs are also needed|Working-age people cannot produce goods|Population size alone guarantees high incomes|Schools reduce all productivity|A favourable age structure offers potential that depends on capabilities and opportunities.
Why should population growth be analysed alongside resource distribution?|Scarcity and access also depend on consumption and inequality|Each person consumes exactly the same resources|Only headcounts affect wellbeing|Distribution never affects access|Population totals alone cannot explain unequal resource use or deprivation.
How can improvements in girls' education influence population and wellbeing?|They can expand choices, health knowledge and opportunities|They force every family to have the same size|They remove the need for healthcare|They change biological sex ratios automatically|Education supports informed decisions without mechanically determining an individual's choices.`
],
[
`Movement from one place to another to live or work is called what?|Migration|Inflation|Irrigation|Weathering|Migration involves a change in usual residence or temporary relocation for work.
Which is a push factor in migration?|Lack of local employment|Better wages at the destination|Good destination schools|Improved destination transport|A push factor encourages departure from the place of origin.
A settlement's site refers primarily to what?|Its immediate physical location|Its total export earnings|Its election results|Its residents' languages only|Site concerns the local land and physical conditions on which it is built.`,
`Why might farm labourers migrate for only part of a year?|Local agricultural work is seasonal|All migrants permanently abandon families|Cities ban permanent residents|Farming has identical labour demand every day|Seasonal migration can fill gaps in local employment.
Money sent home by migrants is called what?|Remittances|Tariffs|Subsidies|Census returns|Remittances transfer part of migrants' earnings to their home households.
Why do many settlements develop near water sources?|Water supports household needs and livelihoods|Water makes all transport impossible|People do not need food near water|Rivers prevent all trade|Reliable water is one important factor in settlement location.`,
`Why can rapid urban growth strain public services?|Housing, water and sanitation may expand more slowly than population|Every new resident immediately gets full services|Migration destroys all infrastructure instantly|Cities need no planning|Capacity and investment may not keep pace with growing demand.
Why should migrants not be treated as a single uniform group?|Their skills, reasons for moving and conditions differ|Every migrant has identical work and income|All migration is voluntary and permanent|Children never migrate|Migration experiences range from opportunity-driven moves to distress displacement.
A village gains remittances but loses many working-age adults. What is the best conclusion?|Migration can create both gains and local challenges|Migration has only benefits|Migration has only costs|Remittances prove every resident is wealthy|Households may gain income while care, labour availability or social life changes.`
],
[
`Which is a fixed capital input in farming?|A tractor|Seeds used in one crop|Daily wages|Fertiliser used up in a season|Fixed capital can be used repeatedly over production cycles.
Which is working capital?|Money for seeds and wages|A long-lasting farm building only|Land itself only|A permanent irrigation canal only|Working capital finances inputs consumed or paid during production.
Growing more than one crop on the same land during a year is called what?|Multiple cropping|Monoculture by definition|Deforestation|Mining|Multiple cropping raises the number of crop cycles on a plot.`,
`How can irrigation support multiple cropping?|It supplies water beyond the rainy season|It guarantees unlimited free labour|It replaces all seeds|It removes soil nutrients permanently|Reliable water makes additional seasonal cultivation possible.
Why might a small farmer borrow before sowing?|To purchase inputs before harvest income arrives|Harvest income always arrives before inputs are needed|Borrowing is required for every landowner by law|Seeds can never be bought with savings|The timing of costs and receipts can create a financing gap.
Which activity diversifies a village economy beyond farming?|Dairy or small-scale manufacturing|Growing the same crop on another field only|Leaving every resource unused|Stopping all services|Non-farm and allied activities can broaden incomes and employment.`,
`Why might high-interest loans trap a farmer in repeated debt?|Repayment obligations can exceed the crop's net earnings|Interest always raises crop yields|All harvests are risk-free|Debt disappears when prices fall|Low or uncertain returns may leave farmers borrowing again to repay earlier debts.
Why can increased production coexist with unequal village incomes?|Access to land, capital and markets differs|Every farmer has equal resources|Output is always shared equally|Land ownership never affects income|Households capture different gains according to assets and bargaining positions.
Why should farming sustainability consider both yield and soil health?|Short-term output gains can damage future productive capacity|Soil can never lose fertility|Only this year's harvest matters|Every input improves soil without limit|Long-term livelihoods depend on maintaining land and water resources.`
],
[
`Globalisation involves increasing connections between what?|Economies and societies across countries|Only villages within one district|Only weather systems|Only local households|Trade, investment, technology and communication deepen cross-border integration.
What is a multinational corporation?|A company operating in more than one country|Any shop with two workers|A business forbidden from foreign activity|Only a government school|MNCs organise production or business operations across national borders.
A tax on imports is called what?|Tariff|Remittance|Wage|Dividend|Tariffs are trade barriers that affect imported goods' prices.`,
`Why might an MNC place production in a country with lower costs?|To reduce costs and improve profitability|To ensure all goods become free|To avoid every market|Because transport is always costless|Wages, inputs, infrastructure and markets influence production decisions.
What does liberalisation of trade usually involve?|Reducing selected trade restrictions|Banning every import|Ending all domestic production|Making every price government-fixed|It generally eases barriers to international exchange.
How can better communication technology support global production?|It helps coordinate activities in distant locations|It eliminates all need for workers|It makes shipping unnecessary for every product|It removes every legal difference|Rapid information exchange supports distributed supply chains.`,
`Why can globalisation benefit consumers but pressure some small producers?|More choice and competition may coexist with unequal ability to compete|Every producer has identical resources|All imports are necessarily harmful|Competition guarantees every firm survives|Benefits and adjustment costs vary across groups.
Why do global supply chains not guarantee good working conditions?|Cost pressures and weak protections can leave workers vulnerable|International trade automatically enforces every labour right|All workers own the firms|Competition removes all job insecurity|Labour laws, enforcement and bargaining power still matter.
What would make globalisation more equitable?|Policies protecting workers and helping disadvantaged producers participate|Removing every worker protection|Ignoring displacement and unequal bargaining|Restricting education to large-company owners|Fairer outcomes need institutions and opportunities, not integration alone.`
],
[
`Food security requires reliable access to what?|Sufficient, safe and nutritious food|Only expensive imported foods|Only food exports|Only one cereal regardless of diet|Food security includes availability, access and nutritional adequacy.
What is a buffer stock?|Food grain held for public purposes such as supply stabilisation|A private jewellery reserve|Unused farm machinery only|A tax on vegetables|Public grain stocks can support distribution and emergencies.
What does PDS stand for?|Public Distribution System|Private Development Survey|Population Data Service|Primary Drainage Scheme|PDS distributes designated commodities through the public system.`,
`Why can hunger persist even when national food output is adequate?|Some households lack purchasing power or access|Every household receives equal food automatically|Production figures measure every person's diet|Adequate output eliminates all poverty|Availability at national level does not ensure household access.
Why is dietary diversity important?|Different foods supply different nutrients|Only calories matter for all health needs|Cereals contain every nutrient in ideal amounts|Vegetables provide no useful nutrients|A varied diet helps meet protein, vitamin and mineral needs.
How can school meals support food security?|By improving children's access to meals|By replacing all family livelihoods|By guaranteeing all adults employment|By eliminating every food-price change|Meals provide direct nutritional support to participating children.`,
`A household gets enough calories but lacks protein and micronutrients. Is its nutrition fully secure?|No, nutritional quality also matters|Yes, calories alone prove complete nutrition|Yes, any cereal-only diet is complete|No, because calories are never needed|Food security is not just the total energy consumed.
Why can poor storage undermine food security even after a good harvest?|Losses reduce usable food supplies|Stored grain always becomes more nutritious without limit|Harvest size proves there can be no loss|Storage cannot affect availability|Pests, spoilage and inadequate facilities can reduce available grain.
Why combine food distribution with livelihood measures?|Income and reliable food access address connected causes of hunger|Employment has no effect on food access|Distribution alone automatically ends every deprivation|Only exports affect household diets|Public support and decent earnings can complement each other.`
],
[
`Sustainable development considers whose needs as well as those of people today?|Future generations|Only today's wealthiest consumers|Only exporters|Only factory owners|Sustainability protects the ability of future generations to meet their needs.
Equity in development refers mainly to what?|Fairness in access, benefits and burdens|Identical geography everywhere|Only maximum output|Only the lowest project cost|Equity asks how opportunities and costs are distributed.
Which is a non-renewable resource?|Coal|Sunlight|Wind|Seasonally replenished surface water|Coal forms over geological timescales.`,
`Why can industrial output growth have an environmental cost?|Pollution and resource depletion may accompany production|Every factory always cleans all waste perfectly|Output never uses materials|Environmental quality cannot change|Production choices and safeguards determine environmental effects.
Why should displaced families receive attention in project planning?|They may bear serious livelihood and social losses|They automatically gain more than everyone|Their land and work have no value|Only distant consumers have rights|Project assessment should include rights, rehabilitation and livelihood restoration.
Why can reducing energy waste support sustainability?|It lowers resource demand for a given useful service|It always increases fossil fuel extraction|It stops all development|It removes every energy need permanently|Efficiency can reduce avoidable consumption.`,
`A project raises GDP while contaminating drinking water. What does GDP growth fail to show?|Environmental damage and unequal health costs|All monetary production|The project's entire physical output|The number of goods sold only|A production total does not fully account for wellbeing or ecological harm.
Why is environmental justice linked to equity?|Vulnerable groups may bear disproportionate damage|All groups always face identical risks|Pollution affects only future generations|Environmental costs are automatically shared equally|Location, income and political power can influence exposure and protection.
Why should alternatives be compared before approving a major resource project?|Different designs can change social costs, ecological harm and benefits|The largest project is always the fairest|Alternatives never affect outcomes|Consultation removes the need for evidence|Comparison helps identify options that meet needs with fewer unjustified harms.`
],
[
`In which year did the First World War begin?|1914|1918|1939|1945|The First World War lasted from 1914 to 1918.
Which event occurred in Russia in 1917?|Revolution ending tsarist rule and later bringing Bolsheviks to power|The start of the Second World War|The founding of the United Nations|The end of the Cold War|The 1917 revolutions transformed Russian government.
Which country was ruled by the Nazi regime under Hitler?|Germany|Japan|Britain|France|Hitler led the Nazi dictatorship in Germany.`,
`Why did the 1929 economic crisis spread across countries?|Trade and financial links transmitted the downturn|Every country had an isolated economy|Only farming existed globally|All banks were in one village|Interdependence helped spread falling demand and financial distress.
What was one major effect of the Treaty of Versailles on Germany?|Resentment over territorial losses and reparations|Immediate abolition of every European army|Germany becoming a victorious Allied power|The end of all nationalism|The settlement generated grievances later exploited by extremist politics.
What distinguishes totalitarian rule from democratic government?|Extensive control and suppression of political opposition|Regular free competition among parties|Independent media guaranteed in all cases|Government accountability through free elections|Totalitarian regimes seek broad control over political and social life.`,
`Why is it incomplete to blame the First World War only on the Sarajevo assassination?|Militarism, alliances, imperial rivalry and nationalism formed deeper conditions|The assassination did not happen|There were no alliances|European states had no armies|The assassination triggered a crisis within a wider structure of tensions.
How could mass propaganda strengthen a dictatorship?|By shaping opinion and delegitimising targeted groups and opponents|By ensuring free access to all competing views|By automatically protecting minority rights|By eliminating state censorship everywhere|Controlled messaging can support obedience and persecution.
Why should economic distress be considered alongside political institutions when explaining fascism's rise?|Crisis created grievances that authoritarian movements exploited|Poverty mechanically makes every country fascist|Institutions never matter|Fascism is defined by free political competition|Economic hardship helped extremist mobilisation, but choices and institutions shaped outcomes.`
],
[
`Which leader is associated with the Three Principles in Chinese nationalism?|Sun Yat-sen|Nelson Mandela|Lenin|Hitler|Sun Yat-sen advocated nationalism, democracy and people's livelihood.
Nigeria was colonised primarily by which European power?|Britain|Portugal|Germany|Italy|British colonial rule shaped Nigeria's political boundaries and institutions.
Which leader emphasised peasant mobilisation in the Chinese communist movement?|Mao Zedong|Winston Churchill|Mussolini|Woodrow Wilson|Mao gave a central role to rural mobilisation.`,
`Why did colonial boundaries create difficulties in Nigeria?|They joined diverse regions and communities under colonial administration|They made every community culturally identical|They removed all regional inequality|They abolished all competition|Colonial administration linked different groups while often deepening divisions.
Why were peasants important to the Chinese revolution?|They formed a large rural population facing land-related grievances|China had no rural population|Only foreign merchants could organise|Land ownership was identical for all|Rural conditions made peasant mobilisation politically significant.
What connected otherwise different anti-colonial struggles?|Opposition to foreign domination and demands for self-rule|Identical languages in all colonies|The same single leader everywhere|An absence of social differences|Movements sought sovereignty but had different local agendas.`,
`Why could political independence leave unresolved economic dependence?|Foreign control of trade, capital or resources could continue|A flag change automatically equalises all economies|Independence removes every external influence|Colonies had no economic relationships|Formal sovereignty does not by itself transform all economic structures.
Why did building national unity require more than opposing colonial rulers?|Internal regional, ethnic and class interests also needed accommodation|All people had identical priorities|Social differences vanish immediately at independence|Only an anthem determines political stability|A durable national project must address internal diversity and fairness.
Why is comparing China and Nigeria useful without assuming identical paths?|It shows shared anti-colonial aims alongside different social and historical conditions|Every colony followed the same revolution|Both had the same colonial administration|Both lacked peasant populations|Comparison highlights both patterns and context-specific differences.`
],
[
`The Quit India movement was launched in which year?|1942|1930|1947|1919|The movement began in August 1942.
British India was partitioned in which year?|1947|1935|1942|1950|Independence and Partition took place in 1947.
Who led the Indian National Army in its best-known wartime phase?|Subhas Chandra Bose|Mahatma Gandhi|B. R. Ambedkar|Clement Attlee|Bose led the INA during the Second World War.`,
`Why did Congress ministries resign in 1939?|India was committed to war without consulting Indian representatives|India had already become a republic|Universal adult franchise had been abolished after independence|The Constitution came into force|The wartime decision demonstrated the limits of Indian control under colonial rule.
What did the 1940 Lahore Resolution express?|The Muslim League's demand concerning separate Muslim-majority political units|Immediate acceptance of the Indian Constitution|A plan for the 1956 states reorganisation|The launching of Quit India|The resolution became central to the League's separate-state demand.
Why was Partition a major humanitarian crisis?|Violence and mass displacement affected millions|No people moved across borders|It involved only administrative paperwork|All communities experienced identical benefits|Border creation was accompanied by violence, migration and loss.`,
`Why did the Second World War weaken Britain's ability to retain India?|War costs and changing political pressures reduced imperial capacity|Britain emerged with unlimited resources|Indian nationalism disappeared|No international changes occurred|Wartime exhaustion interacted with strong anti-colonial mobilisation.
Why is independence best understood through more than a single organisation's actions?|Mass movements, political negotiations and several social forces contributed|Only one individual's decision affected events|Workers and peasants never participated|War had no impact on politics|Multiple actors and pressures shaped the transfer of power.
Why should accounts of Partition include ordinary people's experiences?|They reveal displacement, violence and social disruption beyond constitutional decisions|Personal experiences replace every historical document|Only leaders were affected|Borders had no effect on daily life|Political agreements alone cannot convey the full human consequences.`
],
[
`Who chaired the Drafting Committee of India's Constituent Assembly?|B. R. Ambedkar|Mahatma Gandhi|Subhas Chandra Bose|Bhagat Singh|Ambedkar chaired the committee responsible for preparing the draft Constitution.
When did India's Constitution come into force?|26 January 1950|15 August 1947|26 November 1949|2 October 1950|It was adopted on 26 November 1949 and came into force on 26 January 1950.
What does universal adult franchise mean?|Voting rights for adult citizens subject to lawful eligibility|Voting only by property owners|Voting only by graduates|Voting only by men|Adult citizenship, rather than wealth or education, underlies the franchise.`,
`Why does a constitution limit government power?|To protect rights and define lawful authority|To remove all public accountability|To allow rulers unlimited discretion|To abolish every institution|Constitutional rules set powers, procedures and protections.
What is a key feature of federalism?|Constitutional division of powers between levels of government|All powers belong permanently to one village|Courts have no role|States have no assigned powers|Federal arrangements allocate authority between Union and state institutions.
Why were fundamental rights included?|To protect important freedoms and equality against arbitrary action|To guarantee unlimited power to rulers|To prevent every citizen from voting|To make discrimination compulsory|Enforceable rights are central safeguards in a democracy.`,
`Why did the Constituent Assembly debate different proposals extensively?|The constitutional framework needed reasoned choices for a diverse society|Debate meant no decisions could be made|All members had identical views|A constitution requires no public reasoning|Deliberation helped resolve competing goals and institutional designs.
What does constitutional equality require beyond declaring equal status?|Addressing discrimination and enabling meaningful opportunity|Ignoring historical disadvantage in every policy|Giving identical outcomes automatically|Removing every right|Formal equality may need supportive measures to counter entrenched exclusion.
Why can constitutional amendments be necessary in a democracy?|They allow lawful adaptation while preserving constitutional procedures|They prove laws never matter|They permit any official to ignore the Constitution|They replace elections permanently|A constitution can balance continuity with change through specified amendment rules.`
],
[
`What is the minimum voting age for ordinary elections in India?|18 years|16 years|21 years|25 years|Eligible citizens can register to vote from age 18.
Which body supervises elections to Parliament and state legislatures?|Election Commission of India|Supreme Court acting as the sole polling body|Planning Commission|Reserve Bank of India|The Election Commission administers and supervises these elections.
What is an electoral roll?|The list of registered eligible voters|A list of only candidates|A party manifesto|A record of rainfall|The roll identifies registered voters in a constituency.`,
`In a single-member first-past-the-post constituency, who wins?|The candidate with the most votes|The oldest candidate|The candidate with the lowest votes|Only a candidate with every vote|The largest vote total wins; an absolute majority is not always required.
Why is a secret ballot important?|It helps voters choose without intimidation or forced disclosure|It lets candidates see each voter's choice|It removes the need for counting|It guarantees everyone votes for one party|Ballot secrecy protects freedom of choice.
What is the purpose of reserved constituencies for SCs and STs?|To support representation of historically excluded communities|To remove their voting rights|To reserve every seat for one party|To exclude all other voters from voting there|Eligible candidates belong to the designated group, while the constituency's electorate votes.`,
`A candidate gets 40%, another 35% and another 25%. Who wins under first-past-the-post?|The candidate with 40%|No one, because 50% is always compulsory|The candidate with 25%|All three share the seat|The highest vote share wins in a single-member constituency.
Why does high voter turnout alone not prove an election is fully free and fair?|Competition, rights, impartial administration and freedom from coercion also matter|Turnout is irrelevant in every assessment|An election needs no candidates|Ballot secrecy makes fairness impossible|Participation is one indicator among several conditions of electoral integrity.
Why must parties be able to criticise the government during an election?|Voters need meaningful alternatives and public scrutiny|Criticism automatically invalidates every vote|Only the ruling party may discuss policies|Elections require identical manifestos|Open debate and opposition are necessary for informed democratic choice.`
],
[
`Which party dominated India's early national elections after independence?|Indian National Congress|Bharatiya Janata Party|Janata Party|Telangana Rashtra Samithi|Congress held the leading national position during the early post-independence decades.
What was a central aim of the early Five-Year Plans?|Planned economic development|Ending all public investment|Abolishing all farming|Replacing elections with lotteries|Plans directed investment and development priorities.
The nationwide Emergency was declared in which year?|1975|1962|1977|1950|The Emergency period discussed in this chapter began in 1975.`,
`Why were many states reorganised on linguistic lines?|To respond to language-based regional aspirations within the Union|To abolish all languages|To end federalism|To make every state identical in size|Linguistic reorganisation sought to accommodate diversity in state boundaries.
What was one major objective of land reforms?|To reduce exploitative agrarian relations and improve access to land|To restore every intermediary tax collector|To prohibit all cultivation|To remove all tenancy protections|Measures included intermediary abolition and attempts at tenancy and ceiling reform.
Why did the Green Revolution initially benefit some regions more than others?|Access to irrigation, inputs and infrastructure differed|Seeds required no water or investment|Every village had identical resources|Only rainfall changed everywhere equally|The new package depended on complementary resources.`,
`How did the 1967 elections challenge earlier political patterns?|They showed stronger opposition and reduced Congress dominance in several states|They ended all state elections permanently|They established a single-party constitution|They abolished legislatures|Opposition gains demonstrated a more competitive political landscape.
Why is the Emergency important when evaluating democracy?|It shows how civil liberties and institutional checks can come under pressure|It proves rights need no protection|It removed the relevance of elections forever|It affected only weather policy|Restrictions and concentration of power raised major democratic questions.
Why should early development planning be evaluated for both achievements and limits?|Industrial capacity grew while poverty and inequalities persisted|Planning had no measurable effects|Every social problem disappeared|All regions gained equally|Balanced assessment considers institution-building alongside uneven outcomes.`
],
[
`Which coalition came to power nationally after the 1977 election?|Janata Party-led government|Congress under Nehru|United Front in 1996|National Democratic Alliance in 1999|The 1977 result ended the Congress government's Emergency-era rule.
Which regional party was founded by N. T. Rama Rao?|Telugu Desam Party|DMK|Akali Dal|National Conference|N. T. Rama Rao founded the Telugu Desam Party in 1982.
Major economic liberalisation reforms in India began in which year?|1991|1971|1951|1947|The 1991 reforms responded to an economic crisis and changed policy direction.`,
`What is a coalition government?|A government supported by more than one political party|A government with no elected members|A permanent military council|A court-appointed monarchy|Parties combine support to form or sustain a government.
Why did regional parties gain influence in national politics?|They represented regional interests and became important coalition partners|State-level concerns disappeared|Every national party ceased to exist|The Constitution prohibited national parties|Fragmented mandates increased the bargaining role of regional parties.
The Mandal debate concerned reservations for which broad category?|Other Backward Classes|Only foreign citizens|Only industrial corporations|Only the armed forces|Implementation of OBC reservation recommendations became a major political issue.`,
`Why can coalition politics strengthen federal bargaining?|State-based parties can influence national decisions|It always removes all disagreements|It gives every state identical seats|It abolishes Parliament|Coalition partners may negotiate policies and representation for their regions.
Why did the 1977 election have significance beyond a change of party?|Voters demonstrated the ability to hold an Emergency-era government accountable|It ended universal adult franchise|It made future elections unnecessary|It removed every constitutional right|Electoral turnover showed the public's power to replace rulers.
How should the effects of 1991 reforms be assessed?|Consider growth and new opportunities alongside uneven benefits and vulnerabilities|Assume every household gained equally|Ignore employment and social effects|Measure only the number of foreign advertisements|Policy evaluation requires attention to distribution as well as aggregate change.`
],
[
`The Cold War mainly involved rivalry between which powers?|USA and USSR|India and Nepal|Brazil and Argentina|Egypt and Nigeria|The US-led and Soviet-led blocs shaped much of post-war geopolitics.
The United Nations was founded in which year?|1945|1914|1919|1991|The UN was created after the Second World War.
What was a central principle of non-alignment?|Independent foreign-policy judgement rather than automatic bloc alignment|No relations with any country|Compulsory membership of both military blocs|Isolation from every international issue|Non-alignment sought policy autonomy in a divided world.`,
`Why was the Cold War dangerous despite the absence of direct full-scale US-USSR war?|Nuclear rivalry and proxy conflicts threatened many societies|There were no weapons|All states agreed on every issue|It involved only sporting events|The superpowers competed militarily and through conflicts elsewhere.
Why did newly independent countries value non-alignment?|It helped protect autonomy and focus on development|It required abandoning sovereignty|It prohibited all diplomacy|It forced every state to become a colony|Many wished to avoid dependence on rival blocs.
What does a permanent UN Security Council member's veto do?|It can block a substantive Council resolution|It automatically dissolves the UN|It gives every citizen a direct vote|It applies only to school elections|The veto reflects the special powers of the five permanent members.`,
`Why is non-alignment different from neutrality on every moral or political issue?|A non-aligned state can judge issues independently and take positions|It forbids all criticism|It requires identical votes with one superpower|It means no foreign policy exists|Independence from blocs does not require silence on international disputes.
How could decolonisation change international institutions?|New states sought representation and raised development and equality issues|It reduced the number of sovereign states|It ended every international disagreement|It made colonial rule universal|New memberships and agendas altered international debate.
Why did the end of the USSR not end every global conflict?|Conflicts have regional, economic, ethnic and political causes beyond one rivalry|All conflicts depend on one state|Nuclear weapons ceased to exist immediately|Every border dispute was resolved|The Cold War was influential but not the sole source of conflict.`
],
[
`A social movement involves what?|Collective action around shared social concerns|Only one person's private shopping choice|Only a natural disaster|Only a government department|People organise to seek or resist social change.
Which movement is associated with opposition to large-dam displacement in the Narmada valley?|Narmada Bachao Andolan|Quit India movement|Non-Cooperation movement|Swadeshi movement of 1905|The movement raised displacement, rehabilitation and environmental concerns.
The US civil rights movement challenged what?|Racial discrimination and segregation|Universal suffrage itself|Only import tariffs|Only railway timetables|It sought equal rights and an end to racial exclusion.`,
`Why might affected communities organise against a development project?|They may face livelihood losses or lack an effective voice|Every community opposes all improvements|Only outsiders can assess local impacts|Projects never affect residents|Collective action can raise concerns overlooked in planning.
How can women's movements deepen democracy?|By challenging unequal rights, violence and exclusion|By making participation less equal|By removing all public debate|By giving only one household a voice|They expand the issues and groups represented in public life.
What is one common nonviolent movement method?|Peaceful demonstration and petitioning|Targeted violence against civilians|Preventing every discussion|Destroying all public records|Organised peaceful pressure can draw attention to demands.`,
`Why can social movements remain important between elections?|They bring neglected concerns into public debate and press for accountability|Citizens have no role after voting|Only elected officials may discuss policy|Every election resolves every grievance permanently|Democratic participation extends beyond periodic ballots.
How should a movement's claim to represent affected people be assessed?|Examine participation, evidence, inclusion and whose voices are heard|Assume its name proves universal representation|Ignore internal diversity|Count only social-media slogans|Movements can contain different interests and should be evaluated critically.
Why can environmental and livelihood movements overlap?|Ecosystem damage can also threaten work, homes and local cultures|Environment has no connection to daily life|All conservation requires removing every resident|Livelihoods depend only on cash payments|Natural-resource decisions often have linked ecological and social effects.`
],
[
`Telangana became a separate state on which date?|2 June 2014|1 November 1956|15 August 1947|26 January 1950|The new state was formed on 2 June 2014.
The Gentlemen's Agreement was associated with which year?|1956|1942|1975|1991|The agreement accompanied the formation of Andhra Pradesh in 1956.
Which city became the capital of Telangana at its formation?|Hyderabad|Warangal|Karimnagar|Nizamabad|Hyderabad was designated the state capital.`,
`What was a major concern in the Telangana movement?|Fair access to jobs, water, resources and political voice|A demand to abolish all schools|Opposition to every election|A request to restore British colonial rule|Regional grievances concerned safeguards, allocation and representation.
Why were regional safeguards important in the 1956 merger discussions?|They were intended to protect Telangana's interests within the new state|They abolished all regional differences immediately|They removed every public job|They prevented any legislative institution|Safeguards sought assurances concerning administration and regional development.
What does the 1969 Telangana agitation indicate?|Separate-state demands and dissatisfaction had historical depth|The demand began only after 2014|No earlier grievances existed|The region had never experienced protest|The 1969 movement was a major earlier phase of mobilisation.`,
`Why should the Telangana movement be studied across multiple decades?|Its demands, participants and political conditions evolved over time|All events occurred on a single day|Only the final parliamentary decision matters|Earlier safeguards had no relevance to later debate|A long view connects regional grievances, mobilisation and institutional decisions.
Why does formation of a new state not automatically resolve every development problem?|Resource management, governance and equitable policy remain necessary|State boundaries create unlimited resources|Every household immediately gets equal income|No elections are needed after statehood|Statehood changes institutions but outcomes still depend on continuing decisions.
What is a balanced way to study a regional statehood movement?|Use historical evidence and examine grievances, diverse participation and constitutional processes|Assume all residents held identical views|Rely only on one slogan|Ignore social and economic context|Evidence-based study connects people's experiences with political and legal developments.`
]
]);

expandBanks(banks);
