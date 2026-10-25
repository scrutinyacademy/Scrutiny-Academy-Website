const gcd=(a,b)=>b?gcd(b,a%b):Math.abs(a);
const lcm=(a,b)=>a*b/gcd(a,b);
const num=x=>Number.isInteger(x)?String(x):String(Number(x.toFixed(6)));
function q(question,correct,explanation,wrong=[]){
 const answer=typeof correct==='number'?num(correct):String(correct);
 const choices=[...new Set(wrong.map(String))].filter(x=>x!==answer);
 if(typeof correct==='number')for(const d of [1,-1,2,-2,3,5,10]){if(choices.length>=3)break;const x=num(correct+d);if(x!==answer&&!choices.includes(x))choices.push(x);}
 if(choices.length<3)throw Error('Need distractors: '+question);
 return {question,correct:answer,distractors:choices.slice(0,3),explanation};
}
const set=a=>`{${a.join(', ')}}`;
const frac=(a,b)=>{const g=gcd(a,b);return `${a/g}/${b/g}`;};
function extra(chapter,i,level){
 const v=Math.floor(i/9)+1, type=i%9, n=v+level*3+1, a=n+2, b=n+3;
 const tag=level===0?'Find':level===1?'Calculate':'Determine';
 switch(chapter){
 case 1:
  switch(type){
   case 0:return q(`${tag} the HCF of ${6*a} and ${9*a}.`,3*a,`Factor out ${a}; HCF(6,9)=3, giving ${3*a}.`);
   case 1:return q(`${tag} the LCM of ${4*a} and ${6*a}.`,12*a,`The common factor is ${a}; LCM(4,6)=12, giving ${12*a}.`);
   case 2:return q(`What is the remainder when ${7*a+3} is divided by 7?`,3,`${7*a+3}=7×${a}+3.`);
   case 3:return q(`What is the quotient in Euclid's division of ${11*a+5} by 11?`,a,`${11*a+5}=11×${a}+5, with 0≤5<11.`);
   case 4:return q(`Two positive integers have HCF ${n} and LCM ${12*n}. If one is ${3*n}, find the other.`,4*n,`The other integer is HCF×LCM divided by the known integer: ${n}×${12*n}/${3*n}=${4*n}.`);
   case 5:return q(`In the lowest-term fraction 1/${2**n*5}, how many decimal places are required for its terminating expansion?`,n,`The denominator is 2^${n}×5; completing a power of 10 requires ${n} decimal places.`);
   case 6:return q(`What is the HCF of the consecutive positive integers ${10*n} and ${10*n+1}?`,1,'Any common divisor divides their difference, which is 1.');
   case 7:return q(`What is the LCM of the coprime integers ${2**n} and 3?`,3*2**n,'For coprime positive integers, the LCM is their product.');
   default:return q(`What is the units digit of 6^${n+2}?`,6,'Every positive integer power of 6 ends in 6.');
  }
 case 2:{
  const A=[n,n+1,n+2],B=[n+2,n+3,n+4];
  switch(type){
   case 0:return q(`For A=${set(A)} and B=${set(B)}, find n(A∪B).`,5,'There are five different elements in the union.');
   case 1:return q(`For A=${set(A)} and B=${set(B)}, find n(A∩B).`,1,`Only ${n+2} belongs to both sets.`);
   case 2:return q(`A has ${a} elements. How many subsets does it have?`,2**a,`The subset count is 2^${a}.`);
   case 3:return q(`A has ${a} elements. How many proper subsets does it have?`,2**a-1,`Exclude A itself from its 2^${a} subsets.`);
   case 4:return q(`In a universe with ${10*a} elements, A has ${3*a} elements. Find n(A′).`,7*a,`n(A′)=${10*a}−${3*a}=${7*a}.`);
   case 5:return q(`If n(A)=${4*a}, n(B)=${3*a}, n(A∩B)=${a}, find n(A∪B).`,6*a,`Use n(A)+n(B)−n(A∩B)=${6*a}.`);
   case 6:return q(`If n(A)=${5*a} and n(A∩B)=${2*a}, find n(A−B).`,3*a,`Remove the ${2*a} common elements from A's ${5*a} elements.`);
   case 7:return q(`Two disjoint sets have ${a} and ${b} elements. Find the size of their union.`,a+b,'Disjoint sets have no common elements, so add their sizes.');
   default:return q(`In a group of ${10*a}, ${6*a} like tea, ${5*a} like coffee, and ${3*a} like both. How many like neither?`,2*a,`The union is ${6*a}+${5*a}−${3*a}=${8*a}; subtract from ${10*a}.`);
  }}
 case 3:
  switch(type){
   case 0:return q(`For p(x)=x²−${2*n+1}x+${n*(n+1)}, find the sum of the zeros.`,2*n+1,'For a monic quadratic, the sum of zeros is the negative of the x coefficient.');
   case 1:return q(`For p(x)=x²−${a+b}x+${a*b}, find the product of the zeros.`,a*b,'For a monic quadratic, the product is its constant term.');
   case 2:return q(`Find the remainder when x²+${n}x+1 is divided by x−2.`,5+2*n,`By the remainder theorem, p(2)=4+${2*n}+1.`);
   case 3:return q(`If x−${n} divides x²+kx−${2*n*n}, find k.`,n,`Substituting x=${n} gives ${n*n}+${n}k−${2*n*n}=0, so k=${n}.`);
   case 4:return q(`Zeros α,β of x²−${2*n}x+${n*n-1} satisfy α²+β² = ?`,2*n*n+2,`Use (α+β)²−2αβ=${4*n*n}−${2*(n*n-1)}.`);
   case 5:return q(`What is the degree of ${a}x^${n+2}+x−1?`,n+2,'The largest nonzero power determines the degree.');
   case 6:return q(`Find p(${n}) for p(x)=x²−${2*n}x+${n*n}.`,0,`p(x)=(x−${n})², which vanishes at x=${n}.`);
   case 7:return q(`The zeros of a quadratic are ${n} and ${n+2}. What is their difference, larger minus smaller?`,2,`${n+2}−${n}=2.`);
   default:return q(`A monic quadratic has zeros ${n} and −${n+1}. What is its x coefficient?`,1,'The sum of zeros is −1, so the x coefficient is 1.');
  }
 case 4:
  switch(type){
   case 0:return q(`Solve x+y=${2*n+3} and x−y=3. Find x.`,n+3,`Adding gives 2x=${2*n+6}.`);
   case 1:return q(`Solve x+y=${3*n} and x=2y. Find y.`,n,`Substitute x=2y to obtain 3y=${3*n}.`);
   case 2:return q(`Two pens and a pencil cost ₹${5*n}; one pen and a pencil cost ₹${3*n}. What is the pen price in rupees?`,2*n,'Subtract the second purchase equation from the first.');
   case 3:return q(`For x+2y=${5*n} and x−y=${2*n}, find y.`,n,`Subtracting gives 3y=${3*n}.`);
   case 4:return q(`For 2x+y=${7*n} and x+y=${4*n}, find x.`,3*n,'Subtract the second equation from the first.');
   case 5:return q(`For x+y=${4*n} and x−y=${2*n}, find the product xy.`,3*n*n,`Adding and subtracting give x=${3*n}, y=${n}, so xy=${3*n*n}.`);
   case 6:return q(`For 3x+2y=${8*n} and x=2y, find x.`,2*n,`Substitution gives 8y=${8*n}, so x=${2*n}.`);
   case 7:return q(`If x+y=${3*n} and 2x+2y=k describe the same line, find k.`,6*n,'The second left-hand side is twice the first, so its right-hand side must also double.');
   default:return q(`Two positive numbers sum to ${5*n} and differ by ${n}. Find the smaller number.`,2*n,`The smaller number is (sum−difference)/2=(${5*n}−${n})/2.`);
  }
 case 5:
  switch(type){
   case 0:return q(`Find the larger root of x²−${2*n+1}x+${n*(n+1)}=0.`,n+1,`The factors are (x−${n})(x−${n+1}).`);
   case 1:return q(`Find the smaller root of x²−${2*n+3}x+${n*(n+3)}=0.`,n,`The roots are ${n} and ${n+3}.`);
   case 2:return q(`Find the discriminant of x²−${2*n}x+${n*n}=0.`,0,`D=(${2*n})²−4×${n*n}=0.`);
   case 3:return q(`For x²−${2*n}x+k=0 to have equal roots, find k.`,n*n,`Set ${4*n*n}−4k=0.`);
   case 4:return q(`A rectangle has consecutive integer sides and area ${n*(n+1)}. Find its shorter side.`,n,`x(x+1)=${n*(n+1)} has positive solution x=${n}.`);
   case 5:return q(`Find the positive root of x²=${9*n*n}.`,3*n,`The roots are ±${3*n}; the positive root is ${3*n}.`);
   case 6:return q(`For x²+${n}x−${2*n*n}=0, find the positive root.`,n,`Factor as (x−${n})(x+${2*n})=0.`);
   case 7:return q(`Find the sum of the roots of ${n}x²−${3*n}x+${2*n}=0.`,3,'The sum is −b/a=3.');
   default:return q(`Find the discriminant of x²−${2*n}x+${n*n-4}=0.`,16,`D=${4*n*n}−4×${n*n-4}=16.`);
  }
 case 6:
  switch(type){
   case 0:return q(`Find the ${a}th term of the AP with first term ${n} and common difference 3.`,n+3*(a-1),`aₙ=a+(n−1)d=${n}+(${a}−1)×3.`);
   case 1:return q(`Find the sum of the first ${2*a+1} positive integers.`,(2*a+1)*(a+1),`Use N(N+1)/2 with N=${2*a+1}.`);
   case 2:return q(`The AP has first term ${n} and second term ${n+4}. Find its common difference.`,4,'Subtract the first term from the second.');
   case 3:return q(`Find the fourth term of the GP ${n},${2*n},${4*n},… .`,8*n,'The common ratio is 2, so a₄=a×2³.');
   case 4:return q(`Find the sum of the first ${a} terms of the AP ${n},${n+2},${n+4},… .`,a*(n+a-1),`S=${a}[2×${n}+(${a}−1)×2]/2.`);
   case 5:return q(`An AP has fifth term ${3*n} and ninth term ${3*n+12}. Find its common difference.`,3,'Four common differences add to 12, so d=3.');
   case 6:return q(`Find the common ratio of the GP ${n},${3*n},${9*n},… .`,3,'Divide any term by its preceding nonzero term.');
   case 7:return q(`An AP has first term ${n} and common difference ${n}. How many terms are needed to reach ${10*n}?`,10,`aₖ=${n}+(k−1)${n}=${10*n}, giving k=10.`);
   default:return q(`An AP has middle term ${n} among its first nine terms. Find the sum of those nine terms.`,9*n,'The mean of an odd number of AP terms equals the middle term.');
  }
 case 7:
  switch(type){
   case 0:return q(`Find the distance between (0,0) and (${3*n},${4*n}).`,5*n,`Distance=√[(${3*n})²+(${4*n})²]=${5*n}.`);
   case 1:return q(`Find the x-coordinate of the midpoint of (${n},2) and (${3*n},8).`,2*n,'Average the two x-coordinates.');
   case 2:return q(`Find the y-coordinate of the midpoint of (2,${n}) and (8,${5*n}).`,3*n,'Average the two y-coordinates.');
   case 3:return q(`Find the area of the triangle (0,0),(${2*n},0),(0,${3*n}).`,3*n*n,`Area=½×${2*n}×${3*n}.`);
   case 4:return q(`A divides the segment from (0,0) to (${3*n},${6*n}) internally in ratio 1:2. Find its x-coordinate.`,n,'The point is one-third of the way from the origin to the second endpoint.');
   case 5:return q(`The midpoint of A(${n},${2*n}) and B is (${3*n},${4*n}). Find B's x-coordinate.`,5*n,`Bₓ=2Mₓ−Aₓ=${6*n}−${n}.`);
   case 6:return q(`Find the distance between (${n},${n}) and (${n},${6*n}).`,5*n,'The x-coordinates agree, so use the absolute difference of y-coordinates.');
   case 7:return q(`Points (0,0),(${n},${2*n}),(${3*n},k) are collinear. Find k.`,6*n,'The line through the first two points has equation y=2x.');
   default:return q(`Find the area of a rectangle with vertices (0,0),(${4*n},0),(${4*n},${2*n}),(0,${2*n}).`,8*n*n,'Multiply the horizontal side length by the vertical side length.');
  }
 case 8:
  switch(type){
   case 0:return q(`Similar triangles have side ratio 1:${n}. If the smaller area is 4, find the larger area.`,4*n*n,'Areas scale as the square of corresponding side lengths.');
   case 1:return q(`A right triangle has perpendicular sides ${3*n} and ${4*n}. Find the hypotenuse.`,5*n,'Apply the Pythagorean theorem to the scaled 3-4-5 triangle.');
   case 2:return q(`A ${n} m pole casts a ${2*n} m shadow. A tree casts a ${10*n} m shadow at the same time. Find tree height in metres.`,5*n,`Similar triangles give h/${10*n}=${n}/${2*n}.`);
   case 3:return q(`In triangle ABC, DE∥BC. AD=${n}, DB=${2*n}, AE=${3*n}. Find EC.`,6*n,'AD/DB=AE/EC by the basic proportionality theorem.');
   case 4:return q(`A right triangle's altitude divides the hypotenuse into ${n} and ${4*n}. Find the altitude.`,2*n,'The altitude squared equals the product of the two hypotenuse segments.');
   case 5:return q(`Similar triangles have corresponding sides ${n} and ${3*n}. If the smaller perimeter is ${6*n}, find the larger perimeter.`,18*n,'Perimeters scale in the same ratio as sides, here 1:3.');
   case 6:return q(`Similar triangles have areas ${n*n} and ${4*n*n}. A side in the smaller is ${3*n}. Find its corresponding larger side.`,6*n,'The side ratio is the square root of the area ratio, here 1:2.');
   case 7:return q(`A right triangle has hypotenuse ${13*n} and one leg ${5*n}. Find the other leg.`,12*n,'Use b²=c²−a² for a scaled 5-12-13 triangle.');
   default:return q(`DE∥BC in triangle ABC and AD/AB=1/3. If BC=${9*n}, find DE.`,3*n,'Similarity gives DE/BC=AD/AB=1/3.');
  }
 case 9:
  switch(type){
   case 0:return q(`PA and PB are tangents from P to a circle. If PA=${7*n}, find PB.`,7*n,'Tangent segments from the same external point have equal lengths.');
   case 1:return q(`An external point is ${5*n} cm from a circle's centre; the radius is ${3*n} cm. Find the tangent length in cm.`,4*n,'The radius and tangent form a right triangle: PT²=OP²−r².');
   case 2:return q(`A tangent has length ${6*n}. A secant from the same point has external segment ${3*n}. Find the whole secant length.`,12*n,'Tangent²=external secant segment × whole secant segment.');
   case 3:return q(`Intersecting chords have segments ${2*n} and ${6*n} on one chord, and ${3*n} and x on the other. Find x.`,4*n,'The products of the two segment lengths are equal.');
   case 4:return q(`A circumscribed quadrilateral has consecutive sides ${3*n},${4*n},${5*n},x. Find x.`,4*n,'Opposite-side sums are equal: 3n+5n=4n+x.');
   case 5:return q(`Two radii to tangent contact points enclose ${90+n}°. Find the angle between the tangents in degrees.`,90-n,'The two right angles at contact make the remaining angles supplementary.');
   case 6:return q(`Two secants from P have external and whole lengths ${n},${12*n} and ${2*n},x. Find x.`,6*n,'Equal secant products give n×12n=2n×x.');
   case 7:return q(`A right triangle formed by a radius and tangent has tangent ${12*n} and centre-to-external-point distance ${13*n}. Find the radius.`,5*n,'r²=(13n)²−(12n)²=25n².');
   default:return q(`PA and PB are tangents of length ${n+5}. Find PA+PB.`,2*(n+5),'The tangent lengths are equal, so add two copies of the given length.');
  }
 case 10:
  switch(type){
   case 0:return q(`A cylinder has radius ${n} and height 3. Find its volume divided by π.`,3*n*n,'V=πr²h, so V/π=r²h.');
   case 1:return q(`A cone has radius ${n} and height 6. Find its volume divided by π.`,2*n*n,'V=πr²h/3.');
   case 2:return q(`A sphere has radius ${3*n}. Find its volume divided by π.`,36*n**3,'V=4πr³/3, and r=3n.');
   case 3:return q(`A cylinder has radius ${n} and height ${2*n}. Find curved surface area divided by π.`,4*n*n,'CSA=2πrh=4πn².');
   case 4:return q(`A cone has radius ${3*n} and height ${4*n}. Find its slant height.`,5*n,'l=√(r²+h²), a scaled 3-4-5 right triangle.');
   case 5:return q(`A hemisphere has radius ${n}. Find its total surface area divided by π.`,3*n*n,'Add curved area 2πr² and circular base πr².');
   case 6:return q(`A sphere of radius ${3*n} is melted into a cylinder of radius ${3*n}. Find the cylinder height.`,4*n,'Equate 4πr³/3 to πr²h, giving h=4r/3.');
   case 7:return q(`A cylinder has radius ${n} and height ${n+1}. Find its total surface area divided by 2π.`,n*(2*n+1),'TSA=2πr(r+h), so divide by 2π.');
   default:return q(`A cone and cylinder share radius ${n} and height ${3*n}. Find the cylinder-to-cone volume ratio.`,3,'For equal base radius and height, a cone has one-third of the cylinder volume.');
  }
 case 11:{
  const h=5*n,opp=3*n,adj=4*n;
  switch(type){
   case 0:return q(`A right triangle has opposite side ${opp} and hypotenuse ${h}. Find sin θ.`, '3/5','Divide opposite by hypotenuse.',['4/5','3/4','5/3']);
   case 1:return q(`A right triangle has adjacent side ${adj} and hypotenuse ${h}. Find cos θ.`, '4/5','Divide adjacent by hypotenuse.',['3/5','4/3','5/4']);
   case 2:return q(`A right triangle has opposite side ${opp} and adjacent side ${adj}. Find tan θ.`, '3/4','Divide opposite by adjacent.',['4/3','3/5','4/5']);
   case 3:return q(`A right triangle has opposite side ${n} and hypotenuse ${2*n} for acute θ. Find θ in degrees.`,30,'sin30°=1/2.');
   case 4:return q(`Evaluate ${2*n}sin30°+${2*n}cos60°.`,2*n,'Both sin30° and cos60° equal 1/2.');
   case 5:return q(`Evaluate ${n}(sin²37°+cos²37°).`,n,'Use sin²θ+cos²θ=1.');
   case 6:return q(`Evaluate ${n}(sec²25°−tan²25°).`,n,'Use sec²θ−tan²θ=1.');
   case 7:return q(`A right triangle has opposite side ${5*n} and adjacent side ${12*n} for acute θ. Find cosec θ.`, '13/5','The triangle has side ratio 5:12:13, so cosecθ=13/5.',['5/13','13/12','12/5']);
   default:return q(`Evaluate ${n}tan45°+${n}cot45°.`,2*n,'tan45° and cot45° both equal 1.');
  }}
 case 12:
  switch(type){
   case 0:return q(`A tower top is viewed at 45° from ${10*n} m away on level ground at base-level eye height. Find tower height in m.`,10*n,'h=d tan45°=d.');
   case 1:return q(`An observer's eye is 2 m high and ${5*n} m from a building. The top elevation is 45°. Find building height in m.`,5*n+2,'Height above the eye is 5n; add the 2 m eye height.');
   case 2:return q(`A ${10*n} m ladder makes 30° with level ground. Find the height reached in m.`,5*n,'Height is ladder length × sin30°.');
   case 3:return q(`A ${10*n} m ladder makes 60° with level ground. Find its foot's horizontal distance from the wall in m.`,5*n,'Horizontal distance equals ladder length × cos60°.');
   case 4:return q(`A vertical pole is ${3*n} m tall and casts a ${3*n} m shadow. Find the Sun's elevation in degrees.`,45,'tanθ=height/shadow=1.');
   case 5:return q(`A tower is ${4*n} m tall. From its top, the angle of depression to a ground point is 45°. Find horizontal distance in m.`,4*n,'The corresponding elevation is 45°, giving equal vertical and horizontal legs.');
   case 6:return q(`The elevation to a tower is 45°. A point ${2*n} m nearer sees it at an angle with tangent 2. Find tower height in m.`,4*n,'Let height h equal the far distance; h/(h−2n)=2 gives h=4n.');
   case 7:return q(`A kite string is ${10*n} m long, straight and inclined 30° to level ground. Ignore hand height. Find kite height in m.`,5*n,'The string is the hypotenuse; height=L sin30°.');
   default:return q(`A ${6*n} m vertical pole is observed at 45° from a point on level ground. If the observer moves ${3*n} m towards it, what is tan of the new elevation?`,2,'The new horizontal distance is 3n, so tanθ=6n/(3n)=2.');
  }
 case 13:
  switch(type){
   case 0:return q(`A bag contains ${n} red and ${3*n} blue balls. Find P(red).`,'1/4','There are n red balls out of 4n total.',['3/4','1/3','1/2']);
   case 1:return q(`Choose one integer uniformly from 1 to ${4*n}. Find P(even).`,'1/2','Exactly half the integers from 1 through an even endpoint are even.',['1/4','3/4','1/3']);
   case 2:return q(`A box has ${2*n} green and ${3*n} yellow counters. Find P(not green).`,'3/5','The complement of green consists of 3n yellow counters out of 5n.',['2/5','1/5','1/2']);
   case 3:return q(`One ticket is chosen from ${5*n} equally likely tickets numbered from 1. Find P(a multiple of 5).`,'1/5','There are n multiples of 5 among 5n tickets.',['2/5','1/4','4/5']);
   case 4:return q(`A bag has ${n} red, ${n} blue and ${2*n} green balls. Find P(red or blue).`,'1/2','Red and blue together give 2n of the 4n balls.',['1/4','3/4','1/3']);
   case 5:return q(`A number is chosen uniformly from 1 to ${6*n}. Find P(divisible by 3).`,'1/3','There are 2n multiples of 3 among 6n integers.',['1/6','1/2','2/3']);
   case 6:return q(`An event has probability ${frac(n,n+1)}. Find the probability of its complement.`,frac(1,n+1),`Use 1−${n}/${n+1}=1/${n+1}.`,[frac(1,n+2),frac(1,n+3),frac(n+1,n+2)]);
   case 7:return q(`A box contains ${3*n} black and ${n} white balls. Find P(black).`,'3/4','Black balls make up 3n of the 4n total.',['1/4','1/3','1/2']);
   default:return q(`Of ${10*n} equally likely tickets, ${3*n} win a prize. Find P(not winning).`,'7/10','The remaining 7n tickets out of 10n do not win.',['3/10','1/10','1/2']);
  }
 case 14:
  switch(type){
   case 0:return q(`Find the mean of ${n},${n+2},${n+4}.`,n+2,'Add the three values and divide by 3.');
   case 1:return q(`Find the median of ${n},${n+1},${n+3},${n+5},${n+8}.`,n+3,'For five sorted observations, the third is the median.');
   case 2:return q(`Find the mode of ${n},${n},${n+1},${n+2}.`,n,`The value ${n} occurs twice, more often than the others.`);
   case 3:return q(`Find the class mark of the interval ${10*n}–${10*n+10}.`,10*n+5,'Average the lower and upper boundaries.');
   case 4:return q(`Values ${n} and ${n+5} have frequencies 2 and 3. Find their mean.`,n+3,`Weighted mean=[2×${n}+3×${n+5}]/5.`);
   case 5:return q(`The mean of four observations is ${n+5}. Three are ${n},${n+2},${n+4}. Find the fourth.`,n+14,`Required total is 4×${n+5}; subtract ${3*n+6}.`);
   case 6:return q(`Find the median of ${n+1},${n+3},${n+7},${n+9}.`,n+5,'For four sorted values, average the second and third.');
   case 7:return q(`Each value in a dataset with mean ${n} is increased by 7. Find the new mean.`,n+7,'Adding a constant to every observation adds it to the mean.');
   default:return q(`Each value in a dataset with mean ${n+1} is multiplied by 3. Find the new mean.`,3*(n+1),'Scaling every observation scales the mean by the same factor.');
  }
 default:throw Error('Unknown mathematics chapter');
 }
}
const topicNames = [
 ['HCF','LCM','Division remainder','Euclidean division','HCF-LCM product','Terminating decimals','Coprime numbers','Prime factorisation','Units digits'],
 ['Set union','Set intersection','Subsets','Proper subsets','Complement','Inclusion-exclusion','Set difference','Disjoint sets','Survey problems'],
 ['Sum of zeros','Product of zeros','Remainder theorem','Factor theorem','Symmetric expressions','Degree','Evaluating polynomials','Zeros','Forming polynomials'],
 ['Elimination','Substitution','Price problems','Elimination','Elimination','Combining solutions','Substitution','Coincident lines','Sum-difference problems'],
 ['Factoring quadratics','Factoring quadratics','Discriminant','Repeated roots','Area problems','Square-root method','Positive roots','Sum of roots','Discriminant'],
 ['AP nth term','Sums of integers','Common difference','GP terms','AP sums','Finding common difference','Common ratio','Number of terms','Middle term and sum'],
 ['Distance formula','Midpoint x-coordinate','Midpoint y-coordinate','Triangle area','Section formula','Missing endpoint','Vertical distance','Collinearity','Coordinate area'],
 ['Similarity and areas','Pythagoras','Shadow applications','Basic proportionality theorem','Altitude theorem','Similarity and perimeters','Areas to side lengths','Missing side','Parallel-line similarity'],
 ['Equal tangents','Tangent length','Tangent-secant theorem','Intersecting chords','Circumscribed quadrilaterals','Angle between tangents','Secant products','Radius from tangent','Tangent sums'],
 ['Cylinder volume','Cone volume','Sphere volume','Cylinder curved area','Cone slant height','Hemisphere area','Recasting solids','Cylinder total area','Volume ratios'],
 ['Sine ratio','Cosine ratio','Tangent ratio','Standard angles','Standard-angle expressions','Pythagorean identity','Secant-tangent identity','Reciprocal ratios','Complementary ratios'],
 ['Tower height','Eye height','Ladder height','Ladder distance','Sun elevation','Angle of depression','Changing observation point','Kite height','New angle of elevation'],
 ['Single-draw probability','Equally likely outcomes','Complement','Divisibility','Union of disjoint events','Counting multiples','Complement','Single-draw probability','Losing probability'],
 ['Mean','Median','Mode','Class mark','Weighted mean','Missing observation','Even-sample median','Shifting data','Scaling data'],
];
export function expandMath(chapters){
 chapters.forEach((levels,chapter)=>levels.forEach((items,level)=>{
  for(let i=0;i<27;i++) {
   const first=extra(chapter+1,i,level);
   if(level===0){items.push({...first,topic:topicNames[chapter][i%9]});continue;}
   const refs=[first,extra(chapter+1,(i+4)%27,level)];
   if(level===2)refs.push(extra(chapter+1,(i+7)%27,level));
   const correct=refs.map(item=>item.correct).join(' ; ');
   const wrong=refs.map((_,k)=>refs.map((item,j)=>j===k?item.distractors[(i+k)%3]:item.correct).join(' ; '));
   if(wrong.length===2)wrong.push(refs.map(item=>item.distractors[i%3]).join(' ; '));
   items.push({question:`Solve these ${refs.length===2?'two':'three'} tasks. Which option lists the answers in order?\n${refs.map((item,j)=>`${['I','II','III'][j]}. ${item.question}`).join('\n')}`,correct,distractors:wrong,explanation:refs.map((item,j)=>`${['I','II','III'][j]}. ${item.explanation} Answer: ${item.correct}.`).join(' '),topic:topicNames[chapter][i%9]});
  }
  if(items.length!==30)throw Error('Mathematics DPP must have 30 questions.');
 }));
}
