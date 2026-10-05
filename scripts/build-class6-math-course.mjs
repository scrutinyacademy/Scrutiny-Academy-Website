import fs from "node:fs";
import path from "node:path";

const chapterSpecs = [
  {
    id:"patterns-in-mathematics", title:"Patterns in Mathematics", source:"fegp101.pdf", goal:"Discover, describe and explain patterns in numbers and shapes.",
    topics:[
      ["Mathematics as a search for patterns","Mathematics is not only calculation. It is the search for regularity, structure and convincing explanations of why a pattern continues.",["Observe carefully","Describe the rule in words","Test the rule on more cases","Explain why it works"],"The daily cycle of sunrise and sunset is a repeating pattern.","Write one pattern you notice at home or school.","A calendar, floor tiles or a staircase are suitable examples."],
      ["Number sequences","A sequence is an ordered list. To find its rule, compare neighbouring terms and check whether the change stays constant or follows another pattern.",["Additive patterns add or subtract","Multiplicative patterns multiply or divide","Some patterns use alternating rules"],"3, 7, 11, 15 grows by 4, so the next term is 19.","Find the next term: 2, 6, 12, 20, __.","30, because the differences are 4, 6, 8, then 10."],
      ["Visualising sequences","Dots and shapes can make a number pattern visible. A picture often reveals why a formula or rule works.",["Triangular numbers form triangles","Square numbers form squares","Growing pictures show how much is added"],"The fourth triangular number uses 1+2+3+4 = 10 dots.","Draw the fifth triangular number.","Arrange 15 dots in rows of 1, 2, 3, 4 and 5."],
      ["Relations among sequences","Two sequences can be connected. Adding neighbouring triangular numbers produces square numbers.",["Look for sums and differences","Compare positions term by term","A visual proof explains the relation"],"6 + 10 = 16: neighbouring triangular numbers make 4².","Use triangular numbers to make 25.","10 + 15 = 25."],
      ["Patterns in shapes","Shapes may repeat, grow, rotate or fit together according to a rule.",["Count new parts at each stage","Track colour, direction and position","Predict before drawing"],"A matchstick row of squares needs 4 sticks first, then 3 more for each new square.","How many sticks for 4 joined squares?","13 sticks: 4 + 3 + 3 + 3."],
      ["Explaining a pattern","A strong explanation states the rule, checks examples and shows why the rule must continue.",["A guess is not a proof","Use words, tables or pictures","Check for exceptions"],"Odd numbers grow by 2 because every next odd number lies two steps away on the number line.","Explain why the sum of two odd numbers is even.","Each odd number has one unpaired unit; the two unpaired units make a pair, so the sum is even."]
    ],
    facts:[["sequence","an ordered list following a rule"],["term","one item in a sequence"],["triangular number","a number represented by dots arranged in a triangle"],["square number","a number of the form n × n"],["additive pattern","a pattern formed by repeatedly adding or subtracting"],["multiplicative pattern","a pattern formed by repeatedly multiplying or dividing"],["visual pattern","a rule shown using shapes, colours or positions"],["rule","a clear statement describing how a pattern changes"],["prediction","a reasoned statement about what comes next"],["counterexample","an example showing that a claimed rule is not always true"],["explanation","reasoning that tells why a pattern works"]]
  },
  {
    id:"lines-and-angles", title:"Lines and Angles", source:"fegp102.pdf", goal:"Build geometric ideas from points, lines, rays, segments and measured angles.",
    topics:[
      ["Points and line segments","A point marks an exact location and has no size. A line segment joins two endpoints and has a fixed measurable length.",["Name points with capital letters","A segment has two endpoints","AB and BA name the same segment"],"A sharpened pencil dot models point P; a ruler draws segment PQ.","Draw and name a 5 cm segment.","Mark A and B exactly 5 cm apart and join them."],
      ["Lines and rays","A line extends endlessly in both directions. A ray starts at one endpoint and extends endlessly in one direction.",["Arrows show endless direction","A ray's first letter is its endpoint","A line has no endpoint"],"Sun rays model rays because each begins at the Sun and travels outward.","How is ray AB different from ray BA?","Their endpoints and directions are different."],
      ["Understanding angles","An angle is formed by two rays with a common endpoint called the vertex. The amount of turn, not arm length, decides its size.",["Common endpoint = vertex","Rays = arms","Angle size measures turn"],"A door opening around its hinge creates an angle.","Will longer arms make an angle larger?","No. Only the amount of turn changes angle size."],
      ["Comparing angles","Angles can be compared by superimposing them or comparing their amount of turn.",["Align vertices","Align one arm","See which second arm turns farther"],"A quarter turn is larger than an eighth turn.","Compare 60° and 75°.","75° is larger because it requires a greater turn."],
      ["Special angle types","Zero, acute, right, obtuse, straight, reflex and complete angles are classified by their measures.",["Acute: 0°–90°","Right: 90°","Obtuse: 90°–180°","Straight: 180°","Reflex: 180°–360°","Complete: 360°"],"120° is obtuse because it is more than 90° but less than 180°.","Classify 270°.","It is a reflex angle."],
      ["Measuring with a protractor","Place the protractor centre on the vertex, align its baseline with one arm and read the correct scale where the other arm crosses.",["Centre on vertex","Baseline on one arm","Begin with 0° on that side","Read at eye level"],"If the starting arm points right, use the scale beginning with 0° on the right.","What is the most common protractor mistake?","Reading the wrong inner or outer scale."],
      ["Drawing angles","Draw a base ray, mark the required degree on a protractor, then draw the second ray through the mark.",["Use a sharp pencil","Label the vertex","Check the final measure"],"To draw 65°, mark 65 on the correct scale and join it to the vertex.","Draw 135° and name its type.","It is an obtuse angle."]
    ],
    facts:[["point","an exact location with no length, breadth or height"],["line segment","part of a line with two endpoints"],["line","a straight path extending endlessly in both directions"],["ray","part of a line with one endpoint"],["vertex","the common endpoint of an angle's arms"],["arms of an angle","the two rays forming an angle"],["right angle","an angle measuring 90°"],["straight angle","an angle measuring 180°"],["reflex angle","an angle greater than 180° but less than 360°"],["protractor","an instrument used to measure and draw angles"],["degree","the standard unit used to measure angles"]]
  },
  {
    id:"number-play", title:"Number Play", source:"fegp103.pdf", goal:"Investigate digit patterns, mental strategies, estimation and number games.",
    topics:[
      ["Numbers tell stories","A number can represent position, comparison, measurement, code or relationship depending on its context.",["Always ask what the number describes","The same number can have different meanings","Context gives meaning"],"A jersey number identifies a player, while 12 kg measures mass.","Give two meanings of the number 8.","Examples: eight objects and bus route number 8."],
      ["Supercells and number-line patterns","Local rules can create interesting patterns. Examine neighbouring values and test which arrangements satisfy a condition.",["Check neighbours systematically","Record successes in a table","Look for a repeating structure"],"A cell may be special when its value is greater than both neighbours.","Can adjacent cells both be greater than each other?","No; the conditions would contradict."],
      ["Playing with digits","Changing digit positions changes place value. Digit sums and reversals create useful investigations.",["A digit's place matters","Reverse carefully, keeping zeros","Compare original and reversed numbers"],"In 407, 4 means 400, while in 740 it means 40.","Reverse 3805.","5083."],
      ["Palindromes","A palindrome reads the same from left to right and right to left.",["Single digits are palindromes","Reverse-and-add may produce palindromes","Check the entire digit order"],"1331 is a palindrome.","Is 1221 a palindrome?","Yes, its reverse is also 1221."],
      ["Kaprekar's routine","For a four-digit number with at least two distinct digits: arrange digits descending and ascending, subtract, and repeat.",["Keep leading zeros","Use exactly four digits","6174 is the famous fixed result"],"For 3524: 5432 − 2345 = 3087.","Why is 1111 unsuitable?","All digits are equal, so subtraction gives 0000."],
      ["Clock and calendar numbers","Time and dates contain arithmetic relationships and repeating cycles.",["A clock uses modular cycles","A week repeats every 7 days","Calendar patterns depend on month lengths"],"Three hours after 11 o'clock is 2 o'clock.","What day is 10 days after Monday?","Thursday, because 10 leaves remainder 3 when divided by 7."],
      ["Mental mathematics","Break numbers into friendly parts and use compensation to calculate efficiently.",["Round and adjust","Split by place value","Use doubles and near-doubles"],"398 + 257 = 400 + 257 − 2 = 655.","Calculate 1002 − 498 mentally.","504: subtract 500 then add 2."],
      ["Estimation","Estimation gives a sensible nearby value and helps detect unreasonable exact answers.",["Choose a place value","Round consistently","State that the result is approximate"],"498 × 21 is about 500 × 20 = 10,000.","Estimate 2,947 + 5,108 to the nearest hundred.","About 8,000."],
      ["Winning strategies","A strategy is a plan that guarantees success when followed correctly, not a lucky move.",["Work backwards from winning positions","Look for invariants","Test small cases first"],"In a take-away game, leaving a multiple of a key number may force a win.","Why test small cases?","They reveal the repeating structure of winning and losing positions."]
    ],
    facts:[["place value","the value of a digit determined by its position"],["palindrome","a number that reads the same in both directions"],["digit sum","the sum of all digits in a number"],["reversal","a number formed by writing digits in reverse order"],["Kaprekar routine","repeated descending-minus-ascending digit subtraction"],["6174","Kaprekar's constant for suitable four-digit numbers"],["mental math","calculating using number relationships without written algorithms"],["compensation","rounding a number and then adjusting"],["estimation","finding a reasonable approximate value"],["Collatz rule","halve an even number; triple an odd number and add one"],["winning strategy","a method that guarantees a win when used correctly"]]
  },
  {
    id:"data-handling", title:"Data Handling and Presentation", source:"fegp104.pdf", goal:"Collect, organise, display and interpret data honestly and clearly.",
    topics:[
      ["What is data?","Data is a collection of facts, numbers, measures, observations or descriptions that convey information.",["Start with a clear question","Decide what must be recorded","Use consistent units"],"Class favourite games form categorical data.","What data would answer 'How do students travel to school?'","Record each student's main mode of transport."],
      ["Collecting and organising","Raw data becomes useful when sorted into categories and counted using tally marks and frequency tables.",["One tally per observation","Group the fifth tally across four","Frequency is the total count"],"Tallies ||||/ represent 5.","Write tally marks for 8.","One group of five and three more tallies."],
      ["Pictographs","A pictograph represents data using symbols. Its key tells how many items each symbol represents.",["Always read the key","Use partial symbols only when clearly defined","Label categories"],"If ★ = 4 books, 5 stars mean 20 books.","If ● = 6 children, what do 3 circles show?","18 children."],
      ["Reading bar graphs","A bar graph uses equal-width bars and a numerical scale. Bar height or length shows frequency.",["Check title and labels","Read scale intervals","Compare from the same baseline"],"A bar reaching 35 on a scale of 5 represents 35 items.","Why must bars start from a common baseline?","So their lengths can be compared fairly."],
      ["Drawing bar graphs","Choose a suitable scale, draw labelled axes, keep bars equally wide with equal gaps, and add a clear title.",["Scale should fit the largest value","Intervals must be equal","Use a ruler"],"For values up to 80, 1 division = 10 can be convenient.","Choose a scale for 15, 30, 45, 60.","For example, 1 division = 5 or 10."],
      ["Interpretation and inference","Read exact values first, then compare, calculate totals or differences, and state conclusions supported by the data.",["Separate fact from opinion","Use numbers in conclusions","Do not claim beyond the data"],"If 18 choose cricket and 12 choose hockey, cricket has 6 more choices.","Can a class survey prove the preference of an entire country?","No; the sample is too limited."],
      ["Fair and attractive presentation","Colour and design should improve readability without distorting values.",["Avoid 3D distortion","Keep a readable contrast","Do not change symbol size unfairly"],"A taller-looking 3D bar can mislead even when values are close.","What matters more than decoration?","Accurate, clear communication of the data."]
    ],
    facts:[["data","a collection of facts, measurements or observations"],["raw data","data in the form originally collected"],["tally mark","a quick stroke used to count observations"],["frequency","the number of times a value or category occurs"],["frequency table","a table pairing categories with their counts"],["pictograph","a display using pictures or symbols"],["key","the value represented by each pictograph symbol"],["bar graph","a display using equal-width bars to show values"],["scale","the value of each marked interval on an axis"],["inference","a conclusion drawn from evidence in the data"],["survey","a method of collecting information by asking questions"]]
  },
  {
    id:"prime-time", title:"Prime Time", source:"fegp105.pdf", goal:"Use factors, multiples, primes and divisibility to understand number structure.",
    topics:[
      ["Multiples and common multiples","Multiples of a number are found by multiplying it by whole numbers. Common multiples belong to two or more multiplication lists.",["Multiples continue without end","LCM is the least positive common multiple","Use lists for small numbers"],"Multiples of 4: 4, 8, 12, 16…; multiples of 6: 6, 12…; LCM = 12.","Find the LCM of 3 and 5.","15."],
      ["Factors and common factors","A factor divides a number exactly. Common factors divide each of the given numbers.",["Factors are finite","1 is a factor of every whole number","HCF is the greatest common factor"],"Factors of 18 are 1, 2, 3, 6, 9, 18.","Find the HCF of 12 and 18.","6."],
      ["Prime and composite numbers","A prime number has exactly two factors: 1 and itself. A composite number has more than two factors.",["1 is neither prime nor composite","2 is the only even prime","Check divisors up to the square root"],"17 is prime; 21 is composite because 3 × 7 = 21.","Is 29 prime?","Yes."],
      ["Co-prime numbers","Two numbers are co-prime when their only common factor is 1. Each number need not be prime.",["Co-prime describes a pair","Consecutive numbers are co-prime","HCF of co-primes is 1"],"8 and 15 are co-prime although both are not prime.","Are 14 and 25 co-prime?","Yes, their HCF is 1."],
      ["Prime factorisation","Every composite number can be expressed as a product of primes. Factor trees may look different but end with the same prime factors.",["Divide by smallest prime first","Continue until every factor is prime","Check by multiplying back"],"60 = 2 × 2 × 3 × 5.","Prime-factorise 84.","84 = 2 × 2 × 3 × 7."],
      ["Divisibility tests","Digit-based tests tell whether division will leave remainder zero without completing long division.",["2: last digit even","3: digit sum divisible by 3","5: last digit 0 or 5","9: digit sum divisible by 9","10: last digit 0"],"4,572 is divisible by 3 because 4+5+7+2 = 18.","Is 7,245 divisible by 9?","Yes; its digit sum is 18."],
      ["Using factors in problems","Factors help make equal groups; multiples help match repeating events.",["Equal grouping suggests HCF","Repeating cycles suggest LCM","Translate the story before calculating"],"Two bells ring every 6 and 8 minutes; together again after LCM(6,8)=24 minutes.","Which idea helps divide 24 red and 36 blue beads into maximum identical groups?","HCF."],
      ["Number puzzles","Factor and multiple knowledge can reveal hidden numbers and support logical elimination.",["List constraints","Eliminate impossible values","Verify every condition"],"A number below 30 divisible by 4 and 6 is 12 or 24.","Find the smallest number divisible by 4, 6 and 8.","24."]
    ],
    facts:[["multiple","a product of a number and a whole number"],["factor","a whole number that divides another exactly"],["common multiple","a multiple shared by two or more numbers"],["common factor","a factor shared by two or more numbers"],["prime number","a number greater than 1 with exactly two factors"],["composite number","a number with more than two factors"],["co-prime numbers","numbers whose only common factor is 1"],["prime factorisation","writing a number as a product of primes"],["LCM","the least positive common multiple"],["HCF","the greatest common factor"],["divisibility test","a rule for deciding exact divisibility quickly"]]
  },
  {
    id:"perimeter-and-area", title:"Perimeter and Area", source:"fegp106.pdf", goal:"Distinguish boundary length from surface area and solve measurement problems.",
    topics:[
      ["Perimeter as boundary length","Perimeter is the total distance around a closed plane figure. Add every outer side using the same unit.",["Trace the outside boundary","Convert units before adding","Do not include internal lines"],"A triangle with sides 5, 6 and 7 cm has perimeter 18 cm.","Find the perimeter of sides 4, 8, 5 and 3 cm.","20 cm."],
      ["Rectangle and square perimeter","Opposite sides of a rectangle are equal, so P = 2(l+b). A square has four equal sides, so P = 4s.",["Perimeter uses linear units","Write the formula before substituting","Check all four sides"],"A 12 cm by 8 cm rectangle has P = 2(12+8)=40 cm.","Square side 9 m: find perimeter.","36 m."],
      ["Area by counting units","Area measures surface covered. Count equal square units without gaps or overlaps.",["Area uses square units","A full unit square counts 1","Combine partial squares carefully"],"A 3 by 5 array contains 15 unit squares.","How many unit squares cover a 4 by 7 rectangle?","28."],
      ["Rectangle and square area","For a rectangle, A = length × breadth. For a square, A = side × side.",["Use compatible units","Label square units","Area and perimeter answer different questions"],"A 7 cm by 4 cm card has area 28 cm².","Square side 11 cm: find area.","121 cm²."],
      ["Area of a triangle","A triangle made by a diagonal of a rectangle has half the rectangle's area, so A = ½ × base × height.",["Height must be perpendicular to base","Any side can be chosen as base","Match base with its height"],"Base 8 cm, height 5 cm: area = 20 cm².","Base 12 m, height 7 m: find area.","42 m²."],
      ["Composite shapes","Split an irregular figure into familiar rectangles or triangles, find each area and add or subtract.",["Draw helpful dividing lines","Avoid double counting","Use more than one method to check"],"An L-shape can be a large rectangle minus a missing small rectangle.","Why can two different splits give the same area?","They cover exactly the same region without gaps or overlap."],
      ["Real-life measurement","Fencing, borders and laps involve perimeter; flooring, painting and tiling involve area.",["Boundary clue → perimeter","Covering clue → area","Include units in the answer"],"Ribbon around a photo frame needs perimeter.","Which measure is used to tile a floor?","Area."],
      ["Same perimeter, different area","Figures can share a perimeter but enclose different areas. A more compact rectangle often encloses more area.",["Do not assume same perimeter means same area","Make a table of possibilities","Compare systematically"],"Rectangles 1×5 and 2×4 both have perimeter 12, but areas 5 and 8.","Give another rectangle with perimeter 12.","3×3 is a square with area 9." ]
    ],
    facts:[["perimeter","the total length around a closed figure"],["area","the amount of surface a figure covers"],["square unit","the unit used to measure area"],["rectangle perimeter","2 × (length + breadth)"],["square perimeter","4 × side"],["rectangle area","length × breadth"],["square area","side × side"],["triangle area","one half × base × perpendicular height"],["composite figure","a shape made from two or more simple figures"],["linear unit","a unit such as cm or m used for length"],["square centimetre","the area of a square with side 1 cm"]]
  },
  {
    id:"fractions", title:"Fractions", source:"fegp107.pdf", goal:"Interpret, compare and calculate with fractions and mixed numbers.",
    topics:[
      ["Fractional units and equal shares","A fraction describes equal parts. The denominator names the size of each part; the numerator counts selected parts.",["Parts must be equal","Larger denominator means smaller unit fractions","A fraction is also a number"],"One roti shared equally among 4 children gives each 1/4.","Why is 1/8 smaller than 1/6?","The same whole is divided into more equal parts."],
      ["Fractions as parts of a whole","A whole may be a shape, collection, length or quantity. Clearly identify the whole before naming a fraction.",["Same whole is essential for comparison","Shade equal parts","Count total parts and selected parts"],"3 shaded parts out of 8 equal parts represent 3/8.","What fraction is 5 red beads out of 12?","5/12."],
      ["Fractions as measurement","Fractions locate points between whole numbers on a number line and measure lengths smaller than a unit.",["Divide each unit equally","Count intervals, not marks","Fractions have exact positions"],"3/4 lies at the third of four equal steps from 0 to 1.","Where is 5/4?","One quarter beyond 1."],
      ["Improper and mixed fractions","An improper fraction has numerator at least as large as denominator. A mixed number combines a whole number and a proper fraction.",["Divide numerator by denominator","Quotient = whole part","Remainder = new numerator"],"11/4 = 2 3/4.","Convert 3 2/5 to an improper fraction.","17/5."],
      ["Equivalent fractions","Multiplying or dividing numerator and denominator by the same non-zero number keeps the fraction's value unchanged.",["Value stays same","Use common factors to simplify","Cross-products can verify equivalence"],"2/3 = 4/6 = 6/9.","Complete: 5/7 = __/21.","15/21."],
      ["Comparing fractions","Use equal denominators, equal numerators, benchmarks or cross multiplication to compare.",["Same denominator: compare numerators","Same numerator: smaller denominator gives larger fraction","Use 1/2 and 1 as benchmarks"],"5/8 > 3/8.","Compare 3/4 and 5/8.","3/4 = 6/8, so 3/4 > 5/8."],
      ["Adding and subtracting fractions","Combine fractions only after expressing them in the same fractional unit, meaning a common denominator.",["Keep denominator for like fractions","Find a common denominator for unlike fractions","Simplify the result"],"2/5 + 1/5 = 3/5.","Find 2/3 + 1/6.","4/6 + 1/6 = 5/6."],
      ["Fractions in daily life","Recipes, time, money, distance and sharing all use fractions.",["Identify the whole","Use units","Check whether the answer is sensible"],"Half an hour is 30 minutes.","What fraction of an hour is 15 minutes?","1/4."],
      ["Common fraction traps","Unequal parts, adding denominators, or comparing without the same whole lead to errors.",["Do not add denominators","Do not judge by numerator alone","Draw a model when unsure"],"1/3 + 1/3 = 2/3, not 2/6.","Why is 1/3 of a large cake not always equal to 1/3 of a small cake?","The wholes are different sizes." ]
    ],
    facts:[["fraction","a number representing equal parts of a whole"],["numerator","the top number counting selected parts"],["denominator","the bottom number naming total equal parts"],["unit fraction","a fraction with numerator 1"],["proper fraction","a fraction smaller than 1"],["improper fraction","a fraction whose numerator is at least its denominator"],["mixed number","a whole number together with a proper fraction"],["equivalent fractions","different fractions with the same value"],["simplest form","a fraction whose numerator and denominator have no common factor except 1"],["common denominator","a shared denominator used to combine or compare fractions"],["fraction number line","a number line divided into equal fractional intervals"]]
  },
  {
    id:"playing-with-constructions", title:"Playing with Constructions", source:"fegp108.pdf", goal:"Construct accurate circles, rectangles and squares using ruler and compass.",
    topics:[
      ["Curves, circles and compass control","A compass draws points at a fixed distance from a centre. All points on a circle are equally distant from its centre.",["Needle stays at the centre","Pencil opening sets radius","Rotate without changing opening"],"A compass opened to 4 cm draws a circle of radius 4 cm.","What happens if compass width changes while drawing?","The curve will not be a true circle."],
      ["Constructing a circle","Mark the centre, set the radius with a ruler, place the needle and rotate the compass smoothly.",["Use a sharp pencil","Keep paper steady","Label centre and radius"],"Circle with centre O and radius 3 cm.","How many points on that circle are 3 cm from O?","Infinitely many."],
      ["Squares and rectangles","Rectangles have four right angles and equal opposite sides; squares also have all four sides equal.",["Square is a special rectangle","Opposite rectangle sides equal","Corners are right angles"],"A 6 cm by 4 cm rectangle has opposite sides 6 cm and 4 cm.","Is every rectangle a square?","No; a rectangle need not have all sides equal."],
      ["Constructing rectangles","Draw one side, construct perpendiculars at its endpoints, mark the required breadths and join the final vertices.",["Measure accurately","Perpendiculars create right angles","Check opposite sides"],"Construct ABCD with AB=6 cm and BC=4 cm.","Which property confirms its corners?","Each angle is 90°."],
      ["Constructing squares","Draw one side, construct equal perpendicular sides at both endpoints, then join their endpoints.",["All four sides equal","All four angles right","Diagonals can verify"],"Construct a square of side 5 cm.","What should both diagonals look like?","They should be equal and bisect each other at right angles."],
      ["Diagonals","A diagonal joins non-adjacent vertices. Rectangle diagonals are equal and bisect each other; square diagonals add perpendicularity.",["Rectangle: equal and bisect","Square: equal, bisect and perpendicular","Use arcs to compare lengths"],"AC and BD are diagonals of rectangle ABCD.","Do rectangle diagonals always meet at 90°?","No; that is guaranteed for a square, not every rectangle."],
      ["Equidistant points","Points equally distant from two fixed points lie on the perpendicular bisector of the segment joining them.",["Draw equal-radius arcs from both endpoints","Join arc intersections","The new line bisects at 90°"],"Any point on the perpendicular bisector of AB has equal distances from A and B.","How can you locate the midpoint without measuring?","Construct the perpendicular bisector using equal-radius arcs."],
      ["Construction accuracy","Construction is based on geometric properties, not visual guessing.",["Keep construction arcs","Label every point","Verify lengths and angles","Use light, precise lines"],"Two independently drawn arcs can locate an exact intersection.","Why keep arc marks?","They show the reasoning and allow the construction to be checked." ]
    ],
    facts:[["compass","a tool for drawing circles and transferring lengths"],["circle","the set of points at a fixed distance from a centre"],["radius","a segment from the centre to the circle"],["diameter","a chord through the centre equal to two radii"],["construction","an exact geometric drawing using permitted tools"],["rectangle","a quadrilateral with four right angles"],["square","a rectangle with four equal sides"],["diagonal","a segment joining non-adjacent vertices"],["perpendicular lines","lines meeting at 90°"],["perpendicular bisector","a line cutting a segment equally at 90°"],["equidistant","at equal distance from two or more points"]]
  },
  {
    id:"symmetry", title:"Symmetry", source:"fegp109.pdf", goal:"Recognise and create line and rotational symmetry.",
    topics:[
      ["Symmetry in designs","Symmetry creates balance when parts of a figure repeat through reflection or rotation.",["Look for matching parts","Identify the movement","Not every attractive figure is symmetric"],"Butterfly wings often model reflection symmetry.","Name a symmetric object around you.","Possible answers include a leaf, bottle or window."],
      ["Line symmetry","A line of symmetry divides a figure into two matching mirror halves.",["Imagine folding","Corresponding points are equally far from the line","The line may be vertical, horizontal or slanting"],"A square has four lines of symmetry.","How many lines of symmetry does a non-square rectangle have?","Two."],
      ["Completing reflected figures","To reflect a point, place its image on the opposite side at the same perpendicular distance from the mirror line.",["Count squares perpendicular to the line","Copy every vertex","Join images in the same order"],"A point 3 grid squares left appears 3 squares right.","What stays unchanged under reflection?","Lengths and angles."],
      ["Rotational symmetry","A figure has rotational symmetry if it matches itself after a turn smaller than one full turn.",["Fix the centre","Turn the whole figure","Check exact overlap"],"A square matches after 90°, 180°, 270° and 360°.","Does a scalene triangle have non-trivial rotational symmetry?","No."],
      ["Order and angle of rotation","Order is the number of matches in one full turn. For evenly spaced matches, smallest angle = 360° ÷ order.",["Count the starting position","Order is at least 1","Smaller angle means higher order"],"An equilateral triangle has order 3 and angle 120°.","Find the angle for order 6.","60°."],
      ["Line versus rotational symmetry","A figure may have line symmetry, rotational symmetry, both or neither.",["Reflection uses a mirror line","Rotation uses a centre","Test separately"],"A capital N has rotational symmetry but usually no line symmetry.","What symmetry does a circle have?","Infinitely many lines and rotational symmetry through every angle about its centre."],
      ["Creating symmetric art","Grids, tracing, folding and repeated rotations can create precise symmetric designs.",["Start from a simple motif","Repeat by a defined transformation","Check alignment"],"A rangoli motif repeated every 90° has order 4.","Design a shape with order 5.","Repeat the same motif every 72° around a centre." ]
    ],
    facts:[["symmetry","balanced matching parts under a transformation"],["line of symmetry","a line dividing a figure into matching mirror halves"],["reflection","a flip across a mirror line"],["mirror image","a reflected copy of a figure"],["rotational symmetry","matching after a turn smaller than 360°"],["centre of rotation","the fixed point around which a figure turns"],["order of rotation","the number of matches in one full turn"],["angle of rotation","the smallest positive turn producing a match"],["square symmetry","four lines and rotational order 4"],["rectangle symmetry","two lines and rotational order 2"],["equilateral triangle symmetry","three lines and rotational order 3"]]
  },
  {
    id:"integers", title:"The Other Side of Zero", source:"fegp110.pdf", goal:"Use negative numbers, integer order and operations in real contexts.",
    topics:[
      ["Numbers below zero","Negative numbers extend the number line left of zero and describe values below a chosen reference point.",["Positive values lie right of zero","Negative values lie left","Zero is neither positive nor negative"],"−5°C means five degrees below zero.","Which is lower: −2°C or −7°C?","−7°C."],
      ["Number line and ordering","Numbers increase to the right and decrease to the left. A number farther right is greater.",["Every integer has a position","Opposites are equally far from zero","Do not compare only digit size"],"−3 > −8 because −3 lies farther right.","Arrange −4, 2, 0, −1 in increasing order.","−4, −1, 0, 2."],
      ["Bela's Building of Fun","Floors above ground model positive integers; basement floors model negative integers; ground level models zero.",["Upward movement is positive","Downward movement is negative","Track start and movement"],"From floor 2, move down 5 floors to reach −3.","From −4, move up 7 floors.","You reach 3."],
      ["Token model","Positive and negative tokens cancel in zero pairs. The model makes addition and subtraction visible.",["One + and one − make zero","Add tokens to add integers","Subtract by removing tokens"],"(+ + +) with (− −) leaves +1.","Model −2 + 5.","Two zero pairs cancel, leaving +3."],
      ["Adding integers","Same signs: add magnitudes and keep the sign. Different signs: subtract magnitudes and keep the sign of the larger magnitude.",["Use movement on a number line","Check sign before calculating","Estimate the direction"],"−7 + (−4) = −11; −7 + 10 = 3.","Find 6 + (−14).","−8."],
      ["Subtracting integers","Subtracting a number is equivalent to adding its opposite.",["Change subtraction to add opposite","Two negatives can create addition","Verify on number line"],"5 − (−3) = 5 + 3 = 8.","Find −4 − 6.","−10."],
      ["Integers in context","Temperatures, elevations, bank balance changes and game scores can be represented by signed numbers.",["Choose a reference zero","State units","Interpret the sign in words"],"A depth of 30 m below sea level is −30 m.","A ₹200 deposit after a ₹50 debt gives what balance?","₹150, represented by +150."],
      ["Exploring integer properties","Adding zero leaves a number unchanged; adding the opposite gives zero; addition is commutative and associative.",["a+0=a","a+(−a)=0","Order does not change an addition sum"],"−9 + 9 = 0.","What is the additive inverse of 12?","−12."],
      ["Avoiding sign errors","Separate the operation sign from the number sign and use brackets for negative numbers.",["Read −(−a) carefully","Use a number line when uncertain","Check whether the result direction is sensible"],"8 − (−2) means move right 2, giving 10.","Why is −3 smaller than −1?","−3 lies farther left on the number line." ]
    ],
    facts:[["integer","a whole number, its negative or zero"],["positive integer","an integer greater than zero"],["negative integer","an integer less than zero"],["opposite integers","numbers equally distant from zero on opposite sides"],["additive inverse","the number that adds to a given number to make zero"],["zero pair","one positive and one negative token together"],["absolute distance","distance from zero without direction"],["ascending order","arrangement from least to greatest"],["integer addition","combining signed quantities"],["integer subtraction","adding the opposite of the number being subtracted"],["reference point","the chosen zero from which signed values are measured"]]
  }
];

function seeded(seed){ let x=seed>>>0; return()=>((x=(x*1664525+1013904223)>>>0)/4294967296); }
function shuffle(items, rnd){ const a=[...items]; for(let i=a.length-1;i>0;i--){const j=Math.floor(rnd()*(i+1));[a[i],a[j]]=[a[j],a[i]];} return a; }
function makeFlashcards(chapter){
  const cards=[];
  const prompts=[
    (term,def)=>[`What is ${term}?`,def,"Definition"],
    (term,def)=>[`Explain ${term} in your own words.`,def,"Explain"],
    (term,def)=>[`Complete: ${term} means …`,def,"Recall"],
    (term,def)=>[`Which idea matches: “${def}”?`,term,"Reverse recall"],
    (term,def)=>[`Give the key fact about ${term}.`,def,"Key fact"]
  ];
  chapter.facts.forEach(([term,def])=>prompts.forEach((fn)=>{const [front,back,tag]=fn(term,def);cards.push({front,back,tag});}));
  return cards;
}

function optionsFor(correct, distractors, rnd){
  const unique=[];
  for(const value of [correct,...distractors]) if(!unique.some((entry)=>String(entry)===String(value))) unique.push(value);
  let offset=2;
  while(unique.length<4){
    const candidate=typeof correct==="number"?correct+offset:`None of these ${offset}`;
    if(!unique.some((entry)=>String(entry)===String(candidate))) unique.push(candidate);
    offset++;
  }
  const options=shuffle(unique.slice(0,4),rnd); return {options,correctIndex:options.findIndex(v=>String(v)===String(correct))};
}
function item(question,correct,distractors,explanation,topic,difficulty,rnd){const o=optionsFor(correct,distractors,rnd);return{question,options:o.options.map(String),correctIndex:o.correctIndex,explanation,topic,difficulty};}

function generateMcqs(chapter, ci){
  const rnd=seeded(6112026+ci*101), out=[];
  const add=(...args)=>out.push(item(...args,rnd));
  const topic=(n)=>chapter.topics[n%chapter.topics.length][0];
  for(let i=0;i<150;i++){
    const k=i%10, n=i+1, a=2+(i*7)%18, b=2+(i*11)%15, c=1+(i*5)%9;
    if(ci===0){
      if(k<4){const d=2+(i%7),start=1+(i%8),pos=4+(i%5),ans=start+d*pos;add(`Sequence ${start}, ${start+d}, ${start+2*d}, … adds ${d} each time. What is term ${pos+1}?`,ans,[ans-d,ans+d,start*d],`Term ${pos+1} is ${start} + ${pos} × ${d} = ${ans}.`,topic(k),k<2?"Easy":"Medium");}
      else if(k<7){const t=3+(i%10),ans=t*(t+1)/2;add(`How many dots are in triangular number T${t}?`,ans,[t*t,ans+t,ans-1],`T${t} = ${t}×${t+1}÷2 = ${ans}.`,"Visualising sequences","Medium");}
      else {const squares=2+(i%12),ans=3*squares+1;add(`${squares} joined squares share sides in a row. How many matchsticks are needed?`,ans,[4*squares,ans-1,ans+2],`The first square needs 4 and each additional square adds 3: 4+3×${squares-1}=${ans}.`,"Patterns in shapes","Hard");}
    } else if(ci===1){
      const angle=(i*17)%360;
      if(k<6){const ans=angle===0?"zero":angle<90?"acute":angle===90?"right":angle<180?"obtuse":angle===180?"straight":angle<360?"reflex":"complete";add(`Classify an angle measuring ${angle}°.`,ans,["acute","obtuse","reflex","straight"].filter(x=>x!==ans),`${angle}° falls in the ${ans}-angle range.`,"Special angle types",angle>180?"Medium":"Easy");}
      else if(k<8){const ans=90-(10+(i%7)*5);add(`An angle is ${10+(i%7)*5}°. How much more is needed to make a right angle?`,ans,[90+ans,180-ans,ans+10],`Subtract from 90°: 90° − ${10+(i%7)*5}° = ${ans}°.`,"Comparing angles","Medium");}
      else add(`Which statement about ray AB is correct in Question ${n}?`,"It begins at A and passes through B",["It begins at B","It has two endpoints","It extends endlessly both ways"],"The first letter names the endpoint of a ray.","Lines and rays","Easy");
    } else if(ci===2){
      if(k<3){const x=1000+((i*137)%8999),rev=Number(String(x).split("").reverse().join(""));add(`What is the reversal of ${x}?`,rev,[x,rev+9,Number(String(x).slice(1)+String(x)[0])],`Reverse the digit order to obtain ${rev}.`,"Playing with digits","Easy");}
      else if(k<5){const x=100+(i%80),pal=Number(String(x)+String(x).split("").reverse().join(""));add(`Which number is a palindrome?`,pal,[pal+10,pal+100,pal-1],`${pal} reads the same in both directions.`,"Palindromes","Medium");}
      else if(k<7){const x=300+(i*23)%600,ans=Math.round(x/100)*100;add(`Round ${x} to the nearest hundred.`,ans,[Math.floor(x/100)*100,Math.ceil(x/100)*100,x],`The tens digit decides the nearest hundred: ${ans}.`,"Estimation","Easy");}
      else if(k<9){const x=98+(i%20),y=37+(i%15),ans=x+y;add(`Use compensation to find ${x}+${y}.`,ans,[ans-2,ans+2,x+y+10],`Round ${x} to a friendly number, add, then compensate. Exact sum = ${ans}.`,"Mental mathematics","Medium");}
      else {const x=5+2*(i%30),ans=3*x+1;add(`Under the Collatz rule, what follows the odd number ${x}?`,ans,[x/2,3*x,ans+1],`For an odd number, calculate 3n+1 = ${ans}.`,"Number patterns","Medium");}
    } else if(ci===3){
      if(k<4){const symbols=1+(i%9),key=2+(i%6),ans=symbols*key;add(`A pictograph uses ${symbols} symbols and each symbol represents ${key} students. How many students are shown?`,ans,[symbols+key,ans-key,ans+symbols],`${symbols} × ${key} = ${ans}.`,"Pictographs","Easy");}
      else if(k<7){const values=[a,b,c,a+b];const ans=Math.max(...values);add(`A bar graph shows values ${values.join(", ")}. What should the vertical scale at least reach?`,ans,[Math.min(...values),ans-1,values.reduce((s,v)=>s+v,0)],`The scale must include the largest value, ${ans}.`,"Drawing a Bar Graph","Medium");}
      else {const x=10+(i%20),y=5+(i%10),ans=x-y;add(`A survey records ${x} votes for A and ${y} for B. How many more votes did A receive?`,ans,[x+y,y-x,x],`Difference = ${x} − ${y} = ${ans}.`,"Interpretation and inference","Easy");}
    } else if(ci===4){
      if(k<3){const x=2+(i%20),m=2+(i%10),ans=x*m;add(`Which is the ${m}th multiple of ${x}?`,ans,[x+m,ans+x,ans-1],`${x} × ${m} = ${ans}.`,"Multiples","Easy");}
      else if(k<5){const x=12+(i%30),ans=[...Array(x).keys()].map(v=>v+1).filter(v=>x%v===0).length;add(`How many positive factors does ${x} have?`,ans,[ans-1,ans+1,x],`List all whole-number divisors of ${x}; there are ${ans}.`,"Factors","Medium");}
      else if(k<7){const primes=[11,13,17,19,23,29,31,37,41,43],ans=primes[i%primes.length];add(`Which number is prime in set ${n}?`,ans,[ans+1,ans+3,ans+5],`${ans} has exactly two factors: 1 and ${ans}.`,"Prime numbers","Easy");}
      else if(k<9){const x=2+(i%8),y=3+(i%7),num=x*y*5,ans=`${x} × ${y} × 5`;add(`A factor tree for ${num} ends with which product?`,ans,[`${x+y} × 5`,`${x} × ${y+5}`,`${num} × 1`],`Multiplying the prime factors reconstructs ${num}.`,"Prime factorisation","Medium");}
      else {const num=1000+((i*81)%8000),sum=String(num).split("").reduce((s,d)=>s+Number(d),0),ans=sum%3===0?"Yes":"No";add(`Is ${num} divisible by 3?`,ans,[ans==="Yes"?"No":"Yes","Only by 2","Cannot tell"],`Digit sum is ${sum}; ${sum%3===0?"it is":"it is not"} divisible by 3.`,"Divisibility tests","Medium");}
    } else if(ci===5){
      if(k<3){const l=3+(i%18),w=2+(i%11),ans=2*(l+w);add(`Find the perimeter of a ${l} cm by ${w} cm rectangle.`,ans,[l*w,l+w,2*l+w],`P=2(l+w)=2(${l}+${w})=${ans} cm.`,"Rectangle perimeter","Easy");}
      else if(k<6){const l=3+(i%18),w=2+(i%11),ans=l*w;add(`Find the area of a ${l} cm by ${w} cm rectangle.`,ans,[2*(l+w),l+w,ans+2],`A=l×w=${l}×${w}=${ans} cm².`,"Rectangle area","Easy");}
      else if(k<8){const base=2*(3+(i%10)),h=2+(i%12),ans=base*h/2;add(`A triangle has base ${base} cm and perpendicular height ${h} cm. Find its area.`,ans,[base*h,base+h,ans+base],`A=½×${base}×${h}=${ans} cm².`,"Area of a triangle","Medium");}
      else {const s=3+(i%15),ans=s*s;add(`A square has side ${s} m. What is its area?`,ans,[4*s,2*s,s*s+s],`Area=s²=${s}×${s}=${ans} m².`,"Square area","Easy");}
    } else if(ci===6){
      if(k<3){const den=3+(i%9),num=1+(i%(den-1));const mul=2+(i%4),ans=`${num*mul}/${den*mul}`;add(`Which fraction is equivalent to ${num}/${den}?`,ans,[`${num+mul}/${den+mul}`,`${num*mul}/${den}`,`${num}/${den*mul}`],`Multiply numerator and denominator by ${mul}.`,"Equivalent fractions","Easy");}
      else if(k<5){const den=4+(i%8),a=1+(i%(den-1)),b=1+((i+2)%(den-1)),ans=`${a+b}/${den}`;add(`Find ${a}/${den} + ${b}/${den}.`,ans,[`${a+b}/${den*2}`,`${a*b}/${den}`,`${Math.abs(a-b)}/${den}`],`Like denominators keep denominator ${den}; add numerators.`,"Adding fractions","Easy");}
      else if(k<7){const den=3+(i%8),whole=1+(i%5),num=1+(i%(den-1)),ans=`${whole*den+num}/${den}`;add(`Convert ${whole} ${num}/${den} to an improper fraction.`,ans,[`${whole+num}/${den}`,`${whole*den}/${num}`,`${whole+den}/${num}`],`${whole}×${den}+${num}=${whole*den+num}.`,"Mixed fractions","Medium");}
      else {const d1=2+(i%8),d2=3+((i*2)%9),n1=1+(i%(d1-1||1)),n2=1+(i%(d2-1));const left=n1/d1,right=n2/d2,ans=left===right?"=":left>right?">":"<";add(`Choose the correct sign: ${n1}/${d1} __ ${n2}/${d2}`,ans,[">","<","=","cannot compare"].filter(x=>x!==ans),`Cross-products are ${n1*d2} and ${n2*d1}, so the sign is ${ans}.`,"Comparing fractions","Medium");}
    } else if(ci===7){
      if(k<4){const r=2+(i%12),ans=r*2;add(`A circle has radius ${r} cm. What is its diameter?`,ans,[r,ans+r,Math.round(r/2)],`Diameter = 2 × radius = ${ans} cm.`,"Circles and compass","Easy");}
      else if(k<7){const s=3+(i%12),ans="four equal sides and four right angles";add(`Which property must a square of side ${s} cm have?`,ans,["only opposite sides equal","no right angles","unequal diagonals"],"Every square has four equal sides and four right angles.","Constructing squares","Easy");}
      else add(`Which locus contains every point equally distant from A and B in construction ${n}?`,"the perpendicular bisector of AB",["ray AB","a circle centred only at A","a line parallel to AB"],"Every point on the perpendicular bisector is equidistant from the segment endpoints.","Equidistant points","Medium");
    } else if(ci===8){
      if(k<4){const shapes=[['square',4],['non-square rectangle',2],['equilateral triangle',3],['circle','infinitely many']];const [shape,ans]=shapes[i%shapes.length];add(`How many lines of symmetry does a ${shape} have?`,ans,[1,2,3,4].filter(x=>String(x)!==String(ans)),`A ${shape} has ${ans} line${ans===1?"":"s"} of symmetry.`,"Line symmetry","Easy");}
      else if(k<8){const orders=[2,3,4,5,6,8,10,12],order=orders[i%orders.length],ans=360/order;add(`A design has rotational order ${order}. What is its smallest angle of rotation?`,ans,[360-ans,ans+10,order*10],`360° ÷ ${order} = ${ans}°.`,"Order and angle of rotation","Medium");}
      else add(`Which movement creates a mirror image in item ${n}?`,"reflection",["translation only","rotation only","enlargement"],"Reflection flips a figure across a mirror line.","Completing reflected figures","Easy");
    } else {
      if(k<3){const x=-20+(i%41),y=-20+((i*3)%41),ans=x>y?x:y;add(`Which integer is greater: ${x} or ${y}?`,ans,[x===ans?y:x,Math.abs(x),-Math.abs(ans)],`The greater integer lies farther right on the number line: ${ans}.`,"Number line and ordering","Easy");}
      else if(k<6){const x=-15+(i%31),y=-12+((i*5)%25),ans=x+y;add(`Calculate ${x} + (${y}).`,ans,[x-y,y-x,-ans],`Combine the signed movements to get ${ans}.`,"Adding integers","Medium");}
      else if(k<8){const x=-12+(i%25),y=-10+((i*7)%21),ans=x-y;add(`Calculate ${x} − (${y}).`,ans,[x+y,y-x,-ans],`Subtracting ${y} means adding ${-y}; result ${ans}.`,"Subtracting integers","Medium");}
      else {const start=-8+(i%17),move=-6+((i*4)%13),ans=start+move;add(`A lift starts at floor ${start} and moves ${move>=0?"up":"down"} ${Math.abs(move)} floors. Where does it stop?`,ans,[start-move,move,ans+1],`Represent the movement by ${move}; ${start}+(${move})=${ans}.`,"Bela's Building of Fun","Easy");}
    }
  }
  const seen=new Set(); out.forEach((q,index)=>{q.id=`c${ci+1}q${String(index+1).padStart(3,"0")}`;const key=q.question;if(seen.has(key))q.question+=` [Practice ${index+1}]`;seen.add(q.question);});
  return out;
}

function makeQuestions(chapter){
  const qs=[];
  chapter.topics.forEach((t,i)=>{
    qs.push({marks:2,question:`Explain ${t[0]} in simple words.`,answer:`${t[1]} Key points: ${t[2].join("; ")}.`});
    qs.push({marks:3,question:`Use an example to show your understanding of ${t[0]}.`,answer:`${t[3]} This example works because it follows the chapter rule: ${t[2][0]}.`});
  });
  qs.push({marks:4,question:`Write a step-by-step method for solving a typical ${chapter.title} problem.`,answer:`First identify the information and the exact question. Next select the matching concept or rule. Work one clear step at a time, include units or labels, and finally check whether the answer is sensible.`});
  qs.push({marks:5,question:`What common mistakes should a student avoid in ${chapter.title}?`,answer:`Do not rush from the question to a formula. Check definitions, units, signs, diagrams and the final condition. Use a second method or a quick estimate whenever possible.`});
  return qs.slice(0,20);
}

const course={
  title:"Class 6 CBSE Mathematics - Ganita Prakash",
  edition:"NCERT Reprint 2026-27",
  methodology:"Learn → See → Try → Recall → Practise → Explain",
  generatedAt:new Date().toISOString(),
  chapters:chapterSpecs.map((chapter,index)=>({
    id:chapter.id,title:chapter.title,source:chapter.source,goal:chapter.goal,
    summary:chapter.topics.map(t=>t[1]).join(" "),
    topics:chapter.topics.map((t,ti)=>({id:`${chapter.id}-t${ti+1}`,title:t[0],explanation:t[1],keyPoints:t[2],workedExample:t[3],tryIt:t[4],answer:t[5],tip:`Pause after each step and explain why it is valid. ${t[2][0]}.`})),
    flashcards:makeFlashcards(chapter),
    importantQuestions:makeQuestions(chapter),
    mcqs:generateMcqs(chapter,index)
  }))
};

for(const chapter of course.chapters){
  if(chapter.flashcards.length!==55) throw new Error(`${chapter.title}: expected 55 flashcards`);
  if(chapter.mcqs.length!==150) throw new Error(`${chapter.title}: expected 150 MCQs`);
  if(chapter.importantQuestions.length<14) throw new Error(`${chapter.title}: too few questions`);
  for(const q of chapter.mcqs){if(q.options.length!==4||q.correctIndex<0||q.correctIndex>3)throw new Error(`${chapter.title}: invalid MCQ ${q.id}`);}
}

const output=path.resolve("data/class6/mathematics.json");
fs.mkdirSync(path.dirname(output),{recursive:true});
fs.writeFileSync(output,JSON.stringify(course,null,2)+"\n");
console.log(`Built ${course.chapters.length} chapters, ${course.chapters.reduce((s,c)=>s+c.flashcards.length,0)} flashcards, ${course.chapters.reduce((s,c)=>s+c.mcqs.length,0)} MCQs and ${course.chapters.reduce((s,c)=>s+c.importantQuestions.length,0)} important Q&As.`);
