import fs from 'node:fs';
import path from 'node:path';

const root = path.resolve(import.meta.dirname, '..');
const physicsPath = path.join(root, 'data/neet/physics.json');

const C = (term, truth, misconception, application, extra = {}) => ({
  kind: 'concept', term, truth, misconception, application, ...extra,
});
const N = (term, truth, misconception, application, formula, unit, calc, sets, scale, extra = {}) => ({
  kind: 'numerical', term, truth, misconception, application, formula, unit, calc, sets, scale, ...extra,
});

const chapters = [
  {
    id: 'neet-physics-11-1', name: 'Units and Measurements', pdf: 'UNITS AND MEASUREMENT.pdf', pages: 12,
    subtopics: [
      { name: 'SI Units, Conversions and Measurement', sections: '1.1-1.2', page: 1, importance: 'High', items: [
        C('physical measurement', 'A measurement is a numerical value accompanied by a unit and compares a quantity with an accepted standard.', 'A numerical value without a unit is a complete measurement of every physical quantity.', 'reporting a laboratory length'),
        C('SI base quantities', 'The SI has seven base quantities; other mechanical and electromagnetic units can be derived from them.', 'Force and energy are SI base quantities.', 'classifying kilogram, newton and joule'),
        C('coherent derived units', 'A coherent derived SI unit follows from base units without an additional numerical factor.', 'Every unit conversion changes the physical quantity being measured.', 'expressing force as kg m s^-2'),
        N('unit conversion by dimensions', 'A physical quantity is unchanged when its unit is changed, so its numerical value changes inversely with unit size.', 'The numerical value and unit size change in the same direction.', 'converting speed between km h^-1 and m s^-1', 'v(m s^-1) = v(km h^-1)/3.6', 'm s^-1', x => x[0] / 3.6, [[72], [108]], 'Doubling a speed in km h^-1 doubles its value in m s^-1.'),
        N('order-of-magnitude conversion', 'Prefixes represent powers of ten and must be applied to the whole measured quantity.', 'The prefix milli means 10^-3 only when it appears in the numerator.', 'converting millimetres to metres', 'L(m) = L(mm) x 10^-3', 'm', x => x[0] * 1e-3, [[250], [6.5]], 'If the millimetre value is multiplied by 10, the metre value is also multiplied by 10.'),
      ]},
      { name: 'Significant Figures and Measurement Uncertainty', sections: '1.3', page: 3, importance: 'Very High', items: [
        C('significant figures', 'Significant figures are the reliably known digits plus the first uncertain digit in a measured value.', 'All zeros written in a measured number are automatically insignificant.', 'reporting the precision of 0.00450 m'),
        C('rounding rules', 'When rounding, the first discarded digit determines whether the retained last digit changes.', 'Every discarded digit causes the retained digit to increase by one.', 'rounding a calculated result to three significant figures'),
        C('precision versus accuracy', 'Precision describes repeatability or resolution, while accuracy describes closeness to the accepted value.', 'A highly precise measurement must always be accurate.', 'comparing clustered readings with the true value'),
        N('absolute and relative uncertainty', 'Relative uncertainty is absolute uncertainty divided by the measured value.', 'Relative uncertainty carries the same physical unit as the measured quantity.', 'estimating fractional uncertainty in a measured length', 'relative uncertainty = Delta x / x', '', x => x[0] / x[1], [[0.2, 20], [0.05, 5]], 'At fixed absolute uncertainty, doubling the measured value halves the relative uncertainty.'),
        N('percentage uncertainty', 'Percentage uncertainty equals one hundred times the relative uncertainty.', 'Percentage uncertainty is found by multiplying absolute uncertainty directly by 100.', 'reporting experimental uncertainty as a percentage', 'percentage uncertainty = 100 Delta x/x', '%', x => 100 * x[0] / x[1], [[0.1, 25], [0.02, 4]], 'At fixed measured value, doubling absolute uncertainty doubles percentage uncertainty.'),
      ]},
      { name: 'Dimensions and Dimensional Formulae', sections: '1.4-1.5', page: 7, importance: 'Very High', items: [
        C('dimensions of a quantity', 'Dimensions show how a physical quantity depends on base quantities such as mass, length and time.', 'Dimensions specify the numerical magnitude of a physical quantity.', 'writing velocity as [L T^-1]'),
        C('dimensionless quantities', 'A dimensionless quantity can have a numerical value and may sometimes be expressed using a named angular unit.', 'Every dimensionless quantity must have numerical value one.', 'classifying strain and plane angle'),
        C('same dimensions, different quantities', 'Distinct physical quantities can share a dimensional formula even though their meanings and units names differ.', 'Quantities with the same dimensions are necessarily physically identical.', 'comparing work and torque'),
        N('dimensions of force', 'From F = ma, force has dimensions [M L T^-2].', 'Force has dimensions [M L^2 T^-2], the dimensions of energy.', 'checking a force equation', 'F = ma', 'N', x => x[0] * x[1], [[3, 4], [0.5, 10]], 'At fixed acceleration, doubling mass doubles force.'),
        N('dimensions of energy', 'Work or energy has dimensions [M L^2 T^-2].', 'Energy has the same dimensions as power.', 'checking kinetic energy dimensionally', 'K = (1/2)mv^2', 'J', x => 0.5 * x[0] * x[1] ** 2, [[2, 3], [4, 5]], 'At fixed mass, doubling speed makes kinetic energy four times.'),
      ]},
      { name: 'Dimensional Analysis and Applications', sections: '1.6', page: 9, importance: 'Very High', items: [
        C('principle of dimensional homogeneity', 'All additive terms in a physically meaningful equation must have the same dimensions.', 'Numerical equality alone guarantees that an equation is dimensionally valid.', 'rejecting an equation whose two sides have different dimensions'),
        C('limits of dimensional analysis', 'Dimensional analysis cannot determine dimensionless numerical constants or distinguish all quantities having the same dimensions.', 'Dimensional analysis determines every trigonometric dependence and numerical coefficient.', 'assessing whether a derived formula is complete'),
        C('dimensionless arguments', 'The argument of an exponential, logarithm or trigonometric function must be dimensionless.', 'A sine function can accept a dimensional length directly.', 'checking sin(omega t)'),
        N('change of unit numerical value', 'For fixed quantity Q = n u, numerical value n varies inversely with the chosen unit u.', 'Choosing a smaller unit produces a smaller numerical value.', 'expressing one length in two unit systems', 'n2 = n1(u1/u2)', '', x => x[0] * x[1] / x[2], [[5, 1, 0.01], [2, 1, 0.001]], 'If the new unit is half as large, the numerical value doubles.'),
        N('dimensional power-law inference', 'Powers in a product relation can be found by equating base-dimension exponents.', 'Dimensional analysis can fix an arbitrary additive constant.', 'inferring pendulum-time dependence on length and gravity', 'T proportional to sqrt(l/g)', 's', x => Math.sqrt(x[0] / x[1]), [[9.8, 9.8], [2.45, 9.8]], 'At fixed g, making length four times makes the time scale twice.'),
      ]},
    ],
  },
  {
    id: 'neet-physics-11-2', name: 'Motion in a Straight Line', pdf: 'MOTION IN A STRAIGHT LINE.pdf', pages: 14,
    subtopics: [
      { name: 'Position, Displacement, Speed and Average Velocity', sections: '2.1-2.2', page: 1, importance: 'Very High', items: [
        C('point-object approximation', 'An object can be treated as a point when its size is negligible compared with the distance scale of its motion.', 'Every moving body must be treated as a point regardless of the problem scale.', 'modelling a train on a long intercity route'),
        C('displacement', 'Displacement is the signed change in position and depends only on the initial and final positions.', 'Distance travelled and magnitude of displacement are always equal.', 'returning to the starting point after a trip'),
        C('average speed versus average velocity', 'Average speed uses total distance, while average velocity uses displacement over the same time interval.', 'Average speed can be negative when motion is toward the negative x-direction.', 'comparing a round trip speed and velocity'),
        N('average velocity', 'Average velocity is displacement divided by elapsed time.', 'Average velocity is always total path length divided by time.', 'finding motion from two position readings', 'v_avg = (x2-x1)/(t2-t1)', 'm s^-1', x => (x[1] - x[0]) / x[2], [[2, 14, 4], [10, -2, 3]], 'At fixed time, doubling displacement doubles average velocity.'),
        N('average speed', 'Average speed equals total distance divided by total time and is non-negative.', 'Average speed is the arithmetic mean of two speeds in every journey.', 'calculating a multi-leg journey', 'speed_avg = total distance/total time', 'm s^-1', x => (x[0] + x[1]) / (x[2] + x[3]), [[60, 40, 6, 4], [30, 70, 5, 5]], 'At fixed total time, doubling every path length doubles average speed.'),
      ]},
      { name: 'Instantaneous Velocity and Position-Time Graphs', sections: '2.2', page: 2, importance: 'Very High', items: [
        C('instantaneous velocity', 'Instantaneous velocity is the limiting value of average velocity as the time interval approaches zero.', 'Instantaneous velocity requires a finite one-second interval.', 'reading motion at one instant'),
        C('slope of an x-t graph', 'The slope of a position-time graph gives velocity; a steeper signed slope means a larger velocity magnitude.', 'The area under a position-time graph gives displacement.', 'comparing two walkers from straight-line x-t plots'),
        C('turning point in one-dimensional motion', 'At a smooth turning point of x(t), instantaneous velocity is zero and changes sign.', 'At every turning point acceleration must also be zero.', 'a particle reaching its greatest x-position'),
        N('velocity from linear position law', 'For x = x0 + vt, the coefficient of t is the constant velocity.', 'The intercept of an x-t graph is its velocity.', 'extracting velocity from an equation of motion', 'v = dx/dt for x=x0+bt', 'm s^-1', x => x[0], [[5], [-3]], 'Multiplying the coefficient b by two doubles the slope and velocity.'),
        N('instantaneous velocity from quadratic x(t)', 'For x = at^2 + bt + c, velocity is 2at+b.', 'Velocity equals x/t even when x(t) is nonlinear.', 'differentiating a position-time law', 'v = 2at+b', 'm s^-1', x => 2 * x[0] * x[2] + x[1], [[2, 3, 1], [-1, 8, 2]], 'At fixed a, increasing b shifts velocity by the same amount.'),
      ]},
      { name: 'Acceleration and Motion Graphs', sections: '2.3', page: 5, importance: 'Very High', items: [
        C('acceleration', 'Acceleration is the time rate of change of velocity and can be nonzero even when speed is momentarily zero.', 'Acceleration always points in the direction of motion.', 'a vertically thrown ball at its highest point'),
        C('slope and area of a v-t graph', 'The slope of a velocity-time graph is acceleration and its signed area is displacement.', 'The height of a velocity-time graph directly gives acceleration.', 'reading a piecewise linear v-t graph'),
        C('speeding up and slowing down', 'Speed increases when velocity and acceleration have the same sign and decreases when their signs differ.', 'Negative acceleration always means the object is slowing down.', 'motion toward negative x with negative acceleration'),
        N('average acceleration', 'Average acceleration is change in velocity divided by elapsed time.', 'Acceleration is change in position divided by time.', 'calculating braking acceleration', 'a_avg = (v2-v1)/Delta t', 'm s^-2', x => (x[1] - x[0]) / x[2], [[20, 5, 3], [-4, 8, 2]], 'At fixed velocity change, doubling time halves acceleration magnitude.'),
        N('displacement from constant-acceleration v-t graph', 'For linearly changing velocity, displacement equals average velocity times time.', 'Displacement equals final velocity times time for every accelerated motion.', 'finding the trapezium area under a v-t graph', 'Delta x = (u+v)t/2', 'm', x => 0.5 * (x[0] + x[1]) * x[2], [[2, 10, 4], [-2, 6, 5]], 'At fixed u and v, doubling the interval doubles displacement.'),
      ]},
      { name: 'Uniform Acceleration and Relative Velocity', sections: '2.4-2.5', page: 7, importance: 'Very High', items: [
        C('kinematic equations', 'The standard equations v=u+at, x=ut+(1/2)at^2 and v^2=u^2+2ax require constant acceleration.', 'The constant-acceleration equations apply unchanged to arbitrary acceleration.', 'choosing an equation for a braking car'),
        C('free fall sign convention', 'In free fall near Earth, acceleration has magnitude g downward; its algebraic sign follows the chosen positive axis.', 'The value of g changes sign physically when an object moves upward.', 'analysing upward and downward motion with one coordinate axis'),
        C('relative velocity in one dimension', 'Velocity of A relative to B is vA-vB in a common reference frame.', 'Relative speed of two bodies is always the sum of their speeds.', 'finding how fast one car approaches another'),
        N('uniformly accelerated displacement', 'Displacement under constant acceleration is ut+(1/2)at^2.', 'The term (1/2)at^2 may be omitted whenever initial velocity is nonzero.', 'predicting a car position after a time', 's = ut + (1/2)at^2', 'm', x => x[0] * x[2] + 0.5 * x[1] * x[2] ** 2, [[4, 2, 3], [20, -5, 2]], 'At u=0 and fixed a, doubling time makes displacement four times.'),
        N('relative velocity', 'Relative velocity is obtained by vector subtraction; in one dimension signs carry the direction.', 'Speeds can be subtracted without first assigning directions.', 'computing one vehicle velocity as seen from another', 'v_AB = v_A-v_B', 'm s^-1', x => x[0] - x[1], [[25, 15], [-10, 6]], 'Adding the same velocity to both bodies leaves their relative velocity unchanged.'),
      ]},
    ],
  },
  {
    id: 'neet-physics-11-3', name: 'Motion in a Plane', pdf: 'MOTION IN A PLANE.pdf', pages: 22,
    subtopics: [
      { name: 'Scalars, Vectors and Graphical Vector Algebra', sections: '3.1-3.4', page: 1, importance: 'High', items: [
        C('scalar and vector quantities', 'A vector has both magnitude and direction and obeys vector addition; a scalar has magnitude only.', 'Every quantity with a positive magnitude is a scalar.', 'classifying displacement, speed and work'),
        C('equality and negative of vectors', 'Equal vectors have the same magnitude and direction independent of their positions; a negative vector reverses direction.', 'Vectors are equal only when drawn from the same initial point.', 'translating a vector parallel to itself'),
        C('triangle and parallelogram laws', 'Vector addition can be performed head-to-tail or by the parallelogram diagonal.', 'Vector addition is performed by simply adding magnitudes in all cases.', 'combining two perpendicular displacements'),
        N('magnitude of perpendicular resultant', 'For perpendicular components Ax and Ay, magnitude is sqrt(Ax^2+Ay^2).', 'The magnitude is always Ax+Ay.', 'finding a resultant displacement', 'A = sqrt(Ax^2+Ay^2)', '', x => Math.hypot(x[0], x[1]), [[3, 4], [5, 12]], 'Doubling both components doubles the resultant magnitude.'),
        N('resultant of two vectors', 'For vectors A and B separated by angle theta, R^2=A^2+B^2+2AB cos theta.', 'The resultant magnitude is independent of the angle between vectors.', 'adding two forces at an angle', 'R = sqrt(A^2+B^2+2AB cos theta)', 'N', x => Math.sqrt(x[0] ** 2 + x[1] ** 2 + 2 * x[0] * x[1] * Math.cos(x[2] * Math.PI / 180)), [[3, 4, 90], [5, 5, 60]], 'For fixed magnitudes, the resultant is greatest when the angle is zero.'),
      ]},
      { name: 'Vector Resolution and Analytical Addition', sections: '3.5-3.6', page: 6, importance: 'Very High', items: [
        C('resolution of a vector', 'Resolving a vector expresses it as the sum of components along chosen axes.', 'A vector has only one possible set of components independent of axes.', 'splitting weight along and normal to an incline'),
        C('unit vectors', 'Unit vectors have magnitude one and specify direction; i-hat and j-hat represent Cartesian x and y directions.', 'A unit vector must be dimensionless in every use and cannot multiply a dimensional component.', 'writing velocity in component form'),
        C('component signs and quadrant', 'The signs of Cartesian components depend on the vector quadrant and chosen positive axes.', 'Both components of any vector magnitude are positive.', 'finding components of a vector in quadrant II'),
        N('Cartesian components', 'A vector A at angle theta from +x has Ax=A cos theta and Ay=A sin theta.', 'The x-component is always A sin theta regardless of angle definition.', 'resolving a force', 'Ax = A cos theta', 'N', x => x[0] * Math.cos(x[1] * Math.PI / 180), [[10, 60], [20, 30]], 'At fixed A, the x-component tends to zero as theta approaches 90 degrees.'),
        N('direction from components', 'For a vector with components Ax and Ay, tan theta=Ay/Ax with quadrant correction.', 'The ratio Ax/Ay always gives the angle from +x.', 'finding direction of a displacement vector', 'theta = atan2(Ay,Ax)', 'degree', x => Math.atan2(x[1], x[0]) * 180 / Math.PI, [[3, 3], [3, 4]], 'Multiplying both components by the same positive factor leaves direction unchanged.'),
      ]},
      { name: 'Motion in a Plane with Constant Acceleration', sections: '3.7-3.8', page: 10, importance: 'Very High', items: [
        C('vector kinematics', 'Position, velocity and acceleration in a plane are vectors whose Cartesian components can be analysed independently.', 'Acceleration in x necessarily changes the y-component of velocity.', 'separating horizontal and vertical motion'),
        C('constant vector acceleration', 'With constant acceleration, vector equations have the same form as one-dimensional equations applied componentwise.', 'Constant acceleration requires constant speed.', 'motion under a constant oblique force'),
        C('trajectory from components', 'A trajectory is obtained by eliminating time between component position equations.', 'The trajectory equation always contains time explicitly.', 'deriving the path of a particle'),
        N('two-dimensional velocity magnitude', 'Speed is the magnitude of the velocity vector.', 'Speed equals vx+vy even for perpendicular components.', 'finding speed from velocity components', 'v = sqrt(vx^2+vy^2)', 'm s^-1', x => Math.hypot(x[0], x[1]), [[6, 8], [-5, 12]], 'Doubling both velocity components doubles speed.'),
        N('constant-acceleration component displacement', 'Each Cartesian displacement follows Delta x=ux t+(1/2)ax t^2 and similarly for y.', 'The same scalar acceleration must be inserted in both components.', 'locating a particle after a time', 'Delta x = ux t + (1/2)ax t^2', 'm', x => x[0] * x[2] + 0.5 * x[1] * x[2] ** 2, [[4, 2, 3], [10, -1, 4]], 'At ux=0 with fixed ax, doubling time makes x-displacement four times.'),
      ]},
      { name: 'Projectile and Uniform Circular Motion', sections: '3.9-3.10', page: 13, importance: 'Very High', items: [
        C('projectile independence', 'Ignoring air resistance, horizontal projectile velocity is constant while vertical acceleration is g downward.', 'Gravity reduces horizontal velocity at the same rate as vertical velocity.', 'analysing a ball launched at an angle'),
        C('projectile symmetry', 'For launch and landing at the same level, ascent and descent times are equal and horizontal speeds match.', 'At the highest point both horizontal and vertical velocity components are zero.', 'comparing projectile motion on either side of its apex'),
        C('uniform circular motion acceleration', 'Uniform circular motion has constant speed but changing velocity and centripetal acceleration v^2/r toward the centre.', 'Zero change in speed means zero acceleration.', 'a stone moving in a horizontal circle'),
        N('projectile range', 'For equal launch and landing levels, range is u^2 sin(2theta)/g.', 'Range is u^2 sin(theta)/g.', 'choosing a launch angle for maximum range', 'R = u^2 sin(2theta)/g', 'm', x => x[0] ** 2 * Math.sin(2 * x[1] * Math.PI / 180) / 9.8, [[14, 45], [19.6, 30]], 'At fixed angle, doubling launch speed makes range four times.'),
        N('centripetal acceleration', 'Centripetal acceleration magnitude is v^2/r or omega^2 r.', 'Centripetal acceleration is v/r^2.', 'finding inward acceleration on a circular track', 'ac = v^2/r', 'm s^-2', x => x[0] ** 2 / x[1], [[10, 5], [6, 3]], 'At fixed radius, doubling speed makes centripetal acceleration four times.'),
      ]},
    ],
  },
  {
    id: 'neet-physics-11-4', name: 'Laws of Motion', pdf: 'LAWS OF MOTION.pdf', pages: 22,
    subtopics: [
      { name: 'Inertia and Newton First Law', sections: '4.1-4.4', page: 1, importance: 'High', items: [
        C('Aristotle fallacy', 'Continuous force is not required to maintain uniform velocity when net external force is zero.', 'A moving object necessarily stops because motion itself consumes force.', 'motion of a puck on nearly frictionless ice'),
        C('inertia', 'Inertia is the tendency to resist a change in velocity and is measured by mass.', 'Inertia is a force that pushes a body forward.', 'passengers lurching when a bus stops'),
        C('Newton first law', 'A body remains at rest or in uniform straight-line motion unless acted on by a net external force.', 'Zero net force implies the body must be at rest.', 'identifying an inertial frame'),
        N('net force in uniform motion', 'Uniform straight-line motion has zero acceleration and therefore zero net force.', 'A constant velocity requires a constant nonzero net force.', 'finding net force on a cruising object', 'Fnet = ma', 'N', x => x[0] * x[1], [[5, 0], [1200, 0]], 'Changing mass does not change zero net force when acceleration remains zero.'),
        N('inertia and mass comparison', 'For the same force, acceleration is inversely proportional to mass.', 'For the same force, heavier bodies have greater acceleration.', 'comparing carts pushed by the same force', 'a = F/m', 'm s^-2', x => x[0] / x[1], [[12, 3], [20, 5]], 'Doubling mass at fixed force halves acceleration.'),
      ]},
      { name: 'Newton Second Law, Momentum and Impulse', sections: '4.5', page: 5, importance: 'Very High', items: [
        C('momentum', 'Linear momentum is the vector product mv and has the direction of velocity.', 'Momentum is a scalar equal to mass times speed only.', 'comparing moving objects with different masses'),
        C('Newton second law', 'Net external force equals the time rate of change of momentum; for constant mass it becomes ma.', 'The largest individual force always equals ma even when other forces act.', 'writing a component force equation'),
        C('impulse', 'Impulse is the time integral of force and equals the change in momentum.', 'Impulse equals force divided by contact time.', 'explaining why follow-through changes a ball momentum safely'),
        N('constant-mass net force', 'For constant mass, net force is mass times acceleration.', 'The vector net force can be found using speed alone.', 'calculating a vehicle net force', 'Fnet = ma', 'N', x => x[0] * x[1], [[4, 3], [1200, -2]], 'At fixed acceleration, doubling mass doubles net force.'),
        N('average impulsive force', 'Average force equals momentum change divided by contact time.', 'A longer collision time increases average force for the same momentum change.', 'finding average stopping force', 'Favg = Delta p/Delta t', 'N', x => x[0] / x[1], [[20, 0.5], [-30, 0.2]], 'At fixed impulse, doubling contact time halves average force magnitude.'),
      ]},
      { name: 'Third Law, Momentum Conservation and Equilibrium', sections: '4.6-4.8', page: 9, importance: 'Very High', items: [
        C('Newton third-law pair', 'Action and reaction are equal and opposite forces of the same interaction acting on different bodies.', 'Third-law forces cancel because they act on the same body.', 'identifying forces in a person-Earth interaction'),
        C('momentum conservation', 'Total momentum of a system is constant when net external impulse is zero.', 'Internal forces can change total momentum of an isolated system.', 'recoil and explosion motion'),
        C('particle equilibrium', 'A particle is in translational equilibrium when the vector sum of forces is zero.', 'Equilibrium requires that no forces act on the particle.', 'balancing a knot pulled by several strings'),
        N('one-dimensional recoil', 'For an initially stationary isolated two-body system, m1v1+m2v2=0.', 'Both recoil velocities point in the same direction.', 'calculating gun recoil', 'v2 = -m1 v1/m2', 'm s^-1', x => -x[0] * x[1] / x[2], [[0.02, 400, 4], [2, 6, 12]], 'At fixed ejected momentum, doubling recoiling mass halves recoil speed.'),
        N('two-force equilibrium', 'Two forces alone balance only if equal, opposite and collinear.', 'Equal magnitudes guarantee equilibrium regardless of directions.', 'finding a balancing tension', 'Fbalance = -F', 'N', x => -x[0], [[10], [-25]], 'Reversing the original force reverses the required balancing force.'),
      ]},
      { name: 'Common Forces, Friction, Circular Motion and Free-Body Diagrams', sections: '4.9-4.11', page: 12, importance: 'Very High', items: [
        C('normal reaction', 'The normal force is perpendicular to the contact surface and need not equal weight.', 'The normal force on every body always equals mg.', 'a block on an incline or accelerating lift'),
        C('static and kinetic friction', 'Static friction adjusts up to its limiting value, while kinetic friction acts during slipping.', 'Static friction is always equal to mu_s N even below impending motion.', 'a block remaining at rest under a small horizontal push'),
        C('free-body diagram', 'A free-body diagram contains only forces acting on the selected body, with interactions represented once.', 'A free-body diagram should include forces exerted by the selected body on other objects.', 'analysing a connected-block system'),
        N('limiting static friction', 'Maximum static friction is mu_s N.', 'Actual static friction is always mu_s N.', 'checking whether a block begins to slide', 'f_s,max = mu_s N', 'N', x => x[0] * x[1], [[0.4, 50], [0.3, 100]], 'At fixed coefficient, doubling normal force doubles limiting friction.'),
        N('centripetal force requirement', 'The radial net force required for circular motion is mv^2/r toward the centre.', 'Centripetal force is an additional force independent of real interactions.', 'finding tire-road friction needed for a turn', 'Fradial = mv^2/r', 'N', x => x[0] * x[1] ** 2 / x[2], [[2, 6, 3], [1000, 10, 50]], 'At fixed m and r, doubling speed makes the required force four times.'),
      ]},
    ],
  },
  {
    id: 'neet-physics-11-5', name: 'Work, Energy and Power', pdf: 'WORK, ENERGY AND POWER.pdf', pages: 21,
    subtopics: [
      { name: 'Work and Kinetic Energy', sections: '5.1-5.4', page: 1, importance: 'Very High', items: [
        C('mechanical work', 'Work by a constant force is the scalar product F dot displacement and can be positive, negative or zero.', 'Any nonzero force necessarily does positive work.', 'a porter carrying a load horizontally'),
        C('kinetic energy', 'Kinetic energy is (1/2)mv^2, a non-negative scalar that depends on the chosen frame.', 'Kinetic energy is a vector in the direction of velocity.', 'comparing the energy of two moving bodies'),
        C('work-energy theorem', 'Net work on a particle equals its change in kinetic energy.', 'Work by each individual force always equals the total kinetic-energy change.', 'finding speed after several forces act'),
        N('constant-force work', 'Work is Fs cos theta for constant force and displacement.', 'The angle used is between force and velocity after the motion ends.', 'calculating work by an oblique pull', 'W = Fs cos theta', 'J', x => x[0] * x[1] * Math.cos(x[2] * Math.PI / 180), [[10, 5, 60], [20, 3, 0]], 'At 90 degrees, work is zero regardless of force magnitude.'),
        N('kinetic energy', 'Kinetic energy equals one half mass times speed squared.', 'Kinetic energy is proportional to speed rather than speed squared.', 'finding the energy of a moving object', 'K = (1/2)mv^2', 'J', x => 0.5 * x[0] * x[1] ** 2, [[2, 4], [1000, 10]], 'At fixed mass, doubling speed makes kinetic energy four times.'),
      ]},
      { name: 'Variable Force and Work-Energy Applications', sections: '5.5-5.6', page: 6, importance: 'Very High', items: [
        C('work by variable force', 'Work by a variable one-dimensional force is the definite integral of F(x) dx and the signed area under the F-x graph.', 'The slope of an F-x graph gives work.', 'finding work from a piecewise force graph'),
        C('negative net work', 'Negative net work reduces kinetic energy but does not by itself require displacement to be negative.', 'Negative work means the object must move in the negative coordinate direction.', 'braking a moving car'),
        C('path dependence of work', 'Work by a general force may depend on path, while net-work change in kinetic energy depends only on initial and final speeds.', 'Work by every force depends only on endpoints.', 'comparing frictional work along two routes'),
        N('work from a linear F-x graph', 'For force increasing linearly from zero to F over distance x, work is the triangular area Fx/2.', 'Work equals the final force times distance without the one-half factor.', 'calculating area under a ramp force graph', 'W = (1/2)Fmax x', 'J', x => 0.5 * x[0] * x[1], [[10, 4], [30, 2]], 'Doubling both peak force and distance makes work four times.'),
        N('speed from net work', 'Using Wnet=Delta K, final speed follows from Kf=Ki+Wnet.', 'Net work should be added directly to speed.', 'finding final speed after known work', 'v = sqrt(u^2+2W/m)', 'm s^-1', x => Math.sqrt(x[0] ** 2 + 2 * x[1] / x[2]), [[2, 48, 4], [5, 75, 6]], 'At rest, doubling positive work multiplies speed by sqrt(2).'),
      ]},
      { name: 'Potential Energy and Mechanical-Energy Conservation', sections: '5.7-5.8', page: 9, importance: 'Very High', items: [
        C('conservative force', 'For a conservative force, work between two points is path independent and equals minus the change in potential energy.', 'A conservative force always does positive work.', 'gravity acting along different paths'),
        C('potential-energy reference', 'Only potential-energy differences affect mechanics; the zero level may be chosen conveniently.', 'Potential energy has one absolute zero fixed for every problem.', 'choosing ground level for gravitational energy'),
        C('mechanical-energy conservation', 'When only conservative forces do work, K+U remains constant.', 'Mechanical energy remains constant even with dissipative friction and no other energy transfer.', 'a frictionless roller coaster'),
        N('near-Earth gravitational potential energy', 'Near Earth, a height change h changes gravitational potential energy by mgh.', 'Gravitational potential energy change depends on path length.', 'lifting an object slowly', 'Delta U = mgh', 'J', x => x[0] * 9.8 * x[1], [[2, 5], [10, 3]], 'At fixed height, doubling mass doubles potential-energy change.'),
        N('speed from falling height', 'With negligible resistance, loss of mgh becomes kinetic energy.', 'Heavier bodies fall faster because they lose more potential energy.', 'finding speed after descent from rest', 'v = sqrt(2gh)', 'm s^-1', x => Math.sqrt(2 * 9.8 * x[0]), [[5], [20]], 'Fall speed from a given height is independent of mass.'),
      ]},
      { name: 'Springs, Power and Collisions', sections: '5.9-5.11', page: 12, importance: 'Very High', items: [
        C('spring potential energy', 'An ideal spring stores potential energy (1/2)kx^2 relative to its natural length.', 'Spring potential energy is kx and can be negative for compression.', 'compressing a spring launcher'),
        C('power', 'Instantaneous power is the rate of doing work and equals F dot v for a particle.', 'High power necessarily means a large total amount of work.', 'comparing engines doing the same work in different times'),
        C('elastic and inelastic collision', 'Momentum is conserved in an isolated collision; kinetic energy is additionally conserved only in an elastic collision.', 'Kinetic energy is conserved in every isolated collision.', 'classifying sticking and rebounding collisions'),
        N('spring energy', 'Spring energy is one half kx squared.', 'For a fixed spring, stored energy is directly proportional to extension.', 'calculating stored elastic energy', 'Us = (1/2)kx^2', 'J', x => 0.5 * x[0] * x[1] ** 2, [[200, 0.1], [50, 0.2]], 'Doubling extension makes stored energy four times.'),
        N('average power', 'Average power equals work divided by elapsed time.', 'Power equals work multiplied by time.', 'rating a machine lifting a load', 'P = W/t', 'W', x => x[0] / x[1], [[1000, 5], [600, 3]], 'Doing the same work in half the time doubles average power.'),
      ]},
    ],
  },
  {
    id: 'neet-physics-11-6', name: 'System of Particles and Rotational Motion', pdf: 'SYSTEMS OF PARTICLES AND ROTATIONAL MOTION.pdf', pages: 35,
    subtopics: [
      { name: 'Centre of Mass and System Momentum', sections: '6.1-6.4', page: 1, importance: 'Very High', items: [
        C('centre of mass', 'The centre of mass is the mass-weighted average position and can lie outside the material of a body.', 'The centre of mass must always lie inside matter.', 'locating the centre of a ring or bent object'),
        C('motion of centre of mass', 'Total external force equals total mass times centre-of-mass acceleration.', 'Internal forces can accelerate the centre of mass of an isolated system.', 'people moving inside a stationary boat'),
        C('system momentum', 'Total linear momentum equals total mass times centre-of-mass velocity.', 'Centre-of-mass velocity is the unweighted average of all particle velocities.', 'tracking fragments after an explosion'),
        N('two-particle centre of mass', 'For positions x1 and x2, xcm=(m1x1+m2x2)/(m1+m2).', 'The centre of mass is always the midpoint independent of masses.', 'finding the balance point of two masses', 'xcm = (m1x1+m2x2)/(m1+m2)', 'm', x => (x[0] * x[1] + x[2] * x[3]) / (x[0] + x[2]), [[2, 0, 3, 10], [1, -2, 4, 3]], 'Moving both particles by the same displacement moves xcm by that displacement.'),
        N('centre-of-mass acceleration', 'Centre-of-mass acceleration is net external force divided by total mass.', 'It is determined by the largest internal force.', 'finding system acceleration', 'acm = Fext/M', 'm s^-2', x => x[0] / x[1], [[20, 5], [-12, 3]], 'At fixed external force, doubling total mass halves centre-of-mass acceleration.'),
      ]},
      { name: 'Vector Product and Angular Kinematics', sections: '6.5-6.6, 6.10', page: 10, importance: 'High', items: [
        C('vector product', 'The cross product a x b has magnitude ab sin theta and direction from the right-hand rule.', 'The cross product is commutative: a x b=b x a.', 'finding a normal to a plane containing two vectors'),
        C('angular velocity', 'For rotation about a fixed axis, angular velocity points along the axis by the right-hand rule.', 'Angular velocity points tangentially along particle motion.', 'describing a rotating wheel'),
        C('rotational kinematics analogy', 'For constant angular acceleration, angular equations mirror linear constant-acceleration equations.', 'Angular displacement is always equal to arc length.', 'finding wheel angle after acceleration'),
        N('linear-angular speed relation', 'For fixed-axis rotation, tangential speed is omega r.', 'Every point of a rigid body has the same tangential speed.', 'finding rim speed of a rotating disc', 'v = omega r', 'm s^-1', x => x[0] * x[1], [[10, 0.5], [4, 2]], 'At fixed omega, doubling radius doubles tangential speed.'),
        N('constant angular acceleration', 'Angular speed changes as omega=omega0+alpha t for constant alpha.', 'Angular speed changes as omega0+alpha t^2.', 'finding final angular speed', 'omega = omega0+alpha t', 'rad s^-1', x => x[0] + x[1] * x[2], [[2, 3, 4], [10, -2, 3]], 'At fixed alpha, doubling time doubles the angular-speed change.'),
      ]},
      { name: 'Torque, Angular Momentum and Rigid-Body Equilibrium', sections: '6.7-6.8, 6.12', page: 14, importance: 'Very High', items: [
        C('torque', 'Torque about an origin is r x F and measures the turning effect of force.', 'Torque magnitude is always rF even when force is parallel to r.', 'using a long wrench'),
        C('angular momentum', 'Particle angular momentum about an origin is r x p and depends on the chosen origin.', 'Angular momentum is always parallel to linear momentum.', 'finding angular momentum of an orbiting particle'),
        C('rigid-body equilibrium', 'Complete rigid-body equilibrium requires both zero net force and zero net torque.', 'Zero net force alone prevents every kind of rigid-body acceleration.', 'balancing a beam with several loads'),
        N('torque magnitude', 'Torque magnitude is rF sin theta.', 'Only force magnitude matters, not its line of action.', 'calculating a force turning a lever', 'tau = rF sin theta', 'N m', x => x[0] * x[1] * Math.sin(x[2] * Math.PI / 180), [[0.5, 20, 90], [2, 10, 30]], 'At 90 degrees, doubling lever arm doubles torque.'),
        N('angular momentum of perpendicular motion', 'When r is perpendicular to mv, angular momentum magnitude is mvr.', 'Angular momentum magnitude is mv/r.', 'finding angular momentum about a point', 'L = mvr', 'kg m^2 s^-1', x => x[0] * x[1] * x[2], [[2, 3, 4], [0.5, 10, 2]], 'At fixed m and v, doubling perpendicular distance doubles angular momentum.'),
      ]},
      { name: 'Moment of Inertia and Rotational Dynamics', sections: '6.9-6.12', page: 23, importance: 'Very High', items: [
        C('moment of inertia', 'Moment of inertia is sum or integral of mass times squared perpendicular distance from the rotation axis.', 'Moment of inertia depends only on total mass and never on axis location.', 'comparing a ring and disc about their axes'),
        C('parallel and perpendicular axis theorems', 'The parallel-axis theorem adds Md^2 to the centre-of-mass-axis value; the perpendicular-axis theorem applies to a planar lamina.', 'The perpendicular-axis theorem applies to any three-dimensional body.', 'shifting an axis or relating planar axes'),
        C('rotational dynamics', 'For fixed-axis rotation, net torque equals I alpha and rotational kinetic energy is (1/2)I omega^2.', 'A larger moment of inertia gives larger angular acceleration for the same torque.', 'accelerating a flywheel'),
        N('fixed-axis angular acceleration', 'Angular acceleration is net torque divided by moment of inertia.', 'Angular acceleration is the product of torque and moment of inertia.', 'finding a rotor acceleration', 'alpha = tau/I', 'rad s^-2', x => x[0] / x[1], [[12, 3], [5, 0.5]], 'At fixed torque, doubling I halves angular acceleration.'),
        N('rotational kinetic energy', 'Rotational kinetic energy is one half I omega squared.', 'Rotational kinetic energy is linear in angular speed.', 'calculating energy of a flywheel', 'Krot = (1/2)I omega^2', 'J', x => 0.5 * x[0] * x[1] ** 2, [[2, 3], [0.5, 10]], 'At fixed I, doubling omega makes energy four times.'),
      ]},
    ],
  },
  {
    id: 'neet-physics-11-7', name: 'Gravitation', pdf: 'GRAVITATION.pdf', pages: 17,
    subtopics: [
      { name: 'Kepler Laws and Universal Gravitation', sections: '7.1-7.4', page: 1, importance: 'Very High', items: [
        C('Kepler first law', 'Each planet moves in an ellipse with the Sun at one focus.', 'The Sun lies at the geometric centre of every planetary ellipse.', 'identifying a planetary orbit'),
        C('Kepler second and third laws', 'Equal areas are swept in equal times, and orbital period squared is proportional to semi-major axis cubed for the same central mass.', 'A planet moves with constant speed everywhere in an elliptical orbit.', 'comparing planet speed and orbital period'),
        C('universal gravitation', 'Two point masses attract along their joining line with force Gm1m2/r^2.', 'Gravitational force can be repulsive for opposite signs of mass.', 'finding mutual attraction between separated bodies'),
        N('Newton gravitational force', 'Gravitational force follows an inverse-square dependence on separation.', 'Gravitational force is proportional to separation squared.', 'calculating attraction between two masses', 'F = Gm1m2/r^2', 'N', x => 6.67e-11 * x[0] * x[1] / x[2] ** 2, [[100, 200, 2], [5e3, 2e3, 10]], 'Doubling separation makes force one-fourth.'),
        N('Kepler third-law ratio', 'For the same central mass, T^2/a^3 is constant.', 'Orbital period is directly proportional to orbital radius.', 'comparing two circular orbits', 'T2/T1 = (r2/r1)^(3/2)', '', x => (x[1] / x[0]) ** 1.5, [[1, 4], [4, 9]], 'Multiplying orbital radius by four multiplies period by eight.'),
      ]},
      { name: 'Acceleration Due to Gravity and Its Variation', sections: '7.5-7.6', page: 6, importance: 'Very High', items: [
        C('surface gravity', 'At a spherical planet surface, g=GM/R^2 and is independent of the falling test mass.', 'Heavier falling bodies experience a larger gravitational acceleration in vacuum.', 'comparing free fall of two masses'),
        C('gravity above and below Earth', 'Above Earth g decreases approximately as inverse square of distance from the centre; inside a uniform Earth it decreases linearly toward zero at the centre.', 'Gravity is greatest at Earth centre because all mass surrounds the object.', 'comparing mine depth and mountain height'),
        C('inertial and gravitational mass', 'Equality of inertial and gravitational mass explains the mass-independent free-fall acceleration.', 'The gravitational mass cancels only because its value is zero.', 'understanding universal free fall'),
        N('surface gravitational acceleration', 'Surface gravity is GM/R squared.', 'Surface gravity is GM/R.', 'calculating g for a planet', 'g = GM/R^2', 'm s^-2', x => 6.67e-11 * x[0] / x[1] ** 2, [[6e24, 6.4e6], [7.35e22, 1.74e6]], 'At fixed mass, doubling radius makes surface g one-fourth.'),
        N('gravity at altitude', 'At altitude h, g_h=g0[R/(R+h)]^2.', 'Gravity at altitude falls linearly to zero at h=R.', 'finding g above a planet', 'g_h = g0[R/(R+h)]^2', 'm s^-2', x => x[0] * (x[1] / (x[1] + x[2])) ** 2, [[9.8, 6400, 6400], [10, 6000, 3000]], 'At altitude equal to radius, g is one-fourth its surface value.'),
      ]},
      { name: 'Gravitational Potential Energy and Escape Speed', sections: '7.7-7.8', page: 10, importance: 'Very High', items: [
        C('gravitational potential energy', 'With zero at infinity, two separated masses have U=-GMm/r.', 'Gravitational potential energy is positive for an attractive bound pair with zero at infinity.', 'finding energy required to separate masses'),
        C('gravitational potential', 'Potential is potential energy per unit test mass and superposes algebraically.', 'Gravitational potential is a vector directed toward mass.', 'adding potentials from several masses'),
        C('escape speed', 'Escape speed is the minimum launch speed to reach infinity with zero residual speed when resistance and further propulsion are absent.', 'Escape speed depends on the mass of the projectile.', 'launching from a planet surface'),
        N('gravitational potential energy', 'Potential energy of two point masses is -GMm/r with zero at infinity.', 'The negative sign means gravitational force does negative work during attraction.', 'calculating bound-system energy', 'U = -GMm/r', 'J', x => -6.67e-11 * x[0] * x[1] / x[2], [[6e24, 10, 6.4e6], [2e30, 1e3, 1.5e11]], 'Doubling separation halves the magnitude of potential energy.'),
        N('escape speed', 'Surface escape speed is sqrt(2GM/R)=sqrt(2gR).', 'Escape speed equals orbital speed at the same radius.', 'calculating planetary escape speed', 've = sqrt(2gR)', 'm s^-1', x => Math.sqrt(2 * x[0] * x[1]), [[9.8, 6.4e6], [1.6, 1.74e6]], 'At fixed radius, quadrupling g doubles escape speed.'),
      ]},
      { name: 'Earth Satellites and Orbital Energy', sections: '7.9-7.10', page: 12, importance: 'Very High', items: [
        C('circular satellite orbit', 'Gravity supplies the centripetal force for a freely orbiting satellite.', 'An orbiting satellite has zero acceleration because it feels weightless.', 'explaining continuous free fall around Earth'),
        C('geostationary satellite', 'A geostationary satellite has a circular equatorial orbit, moves west-to-east and has Earths rotational period.', 'Any satellite with a 24-hour period is geostationary regardless of orbital plane or direction.', 'keeping a communications satellite above one longitude'),
        C('orbital energy', 'For a circular gravitational orbit, K=GMm/(2r), U=-GMm/r and total E=-GMm/(2r).', 'A bound circular satellite has positive total mechanical energy.', 'comparing energies of two circular orbits'),
        N('circular orbital speed', 'Circular orbital speed is sqrt(GM/r).', 'Orbital speed increases with orbital radius.', 'finding satellite speed', 'vo = sqrt(GM/r)', 'm s^-1', x => Math.sqrt(6.67e-11 * x[0] / x[1]), [[6e24, 6.8e6], [6e24, 4.2e7]], 'At four times radius, circular orbital speed is half.'),
        N('circular-orbit total energy', 'Total energy in a circular orbit is -GMm/(2r).', 'Total energy equals potential energy alone.', 'calculating satellite binding energy', 'E = -GMm/(2r)', 'J', x => -6.67e-11 * x[0] * x[1] / (2 * x[2]), [[6e24, 1000, 7e6], [6e24, 500, 4.2e7]], 'At twice radius, total energy is less negative with half the magnitude.'),
      ]},
    ],
  },
];

function fmt(n) {
  if (Object.is(n, -0)) n = 0;
  const a = Math.abs(n);
  if (!Number.isFinite(n)) return String(n);
  if (a !== 0 && (a >= 1e4 || a < 1e-2)) return n.toExponential(3).replace('e+', ' x 10^').replace('e', ' x 10^');
  return String(Number(n.toPrecision(5)));
}
function rotate(a, n) { const k = n % a.length; return a.slice(k).concat(a.slice(0, k)); }
function numericOptions(value, unit, seed) {
  const candidates = [value, value * 2, value / 2, -value];
  const unique = [...new Set(candidates.map(v => `${fmt(v)}${unit ? ` ${unit}` : ''}`))];
  while (unique.length < 4) unique.push(`${fmt(value + unique.length)}${unit ? ` ${unit}` : ''}`);
  return rotate(unique.slice(0, 4), seed);
}
function ref(ch, sub, item) {
  return { sourceType: 'Original', sourceLabel: 'NCERT Physics Part I, uploaded current edition', pdfFilename: ch.pdf, pdfPage: item.page || sub.page, section: sub.sections, ncertTopic: item.term };
}
function conceptQuestions(ch, sub, item, seed) {
  const r = ref(ch, sub, item);
  const peers = [...new Set(sub.items.filter(x => x !== item && x.term !== item.term).map(x => x.term))];
  while (peers.length < 3) peers.push(['unrelated scalar shortcut', 'unverified inverse rule', 'constant-zero approximation'][peers.length]);
  const terms = [item.term, ...peers.slice(0, 3)];
  const common = { chapter: ch.name, classLevel: 11, subject: 'Physics', subtopic: sub.name, ncertSection: sub.sections, topic: item.term, sourceType: 'Original', references: [r], visualRequired: false, estimatedTime: '60-90 s', tags: [sub.name, item.term, 'NCERT'] };
  return [
    { ...common, question: `Which NCERT concept is described here: ${item.truth}`, options: terms, answer: 0, questionType: 'Conceptual', conceptTested: item.term, formulaUsed: 'Not required', commonTrap: item.misconception, neetShortcut: 'Match the defining words before checking the options.', explanation: `${item.truth}`, solutionSteps: ['Identify the defining physical statement.', `It matches ${item.term}.`, 'Reject choices that describe a different quantity or law.'] },
    { ...common, question: `Which statement about ${item.term} is correct?`, options: [item.truth, item.misconception, `It is unrelated to ${item.application}.`, 'It is valid only when every measured quantity is zero.'], answer: 0, questionType: 'Conceptual', conceptTested: item.term, formulaUsed: item.formula || 'Not required', commonTrap: item.misconception, neetShortcut: 'Test each statement against the definition, not everyday wording.', explanation: item.truth, solutionSteps: ['Recall the NCERT definition.', 'Compare each option with it.', 'Only option A remains consistent.'] },
    { ...common, question: `A student is ${item.application}. Which idea should be applied first?`, options: terms, answer: 0, questionType: 'Application', conceptTested: item.term, formulaUsed: item.formula || 'Not required', commonTrap: item.misconception, neetShortcut: 'Translate the situation into the physical quantity being asked.', explanation: `${item.term} is the direct concept because ${item.truth}`, solutionSteps: ['Identify the physical change or interaction.', `Connect it to ${item.term}.`, 'Apply its defining condition.'] },
    { ...common, question: `Which option states a common misconception about ${item.term}?`, options: [item.misconception, item.truth, `The concept is used while ${item.application}.`, 'Its conclusion must be interpreted with the stated assumptions.'], answer: 0, questionType: 'Common Trap', conceptTested: item.term, formulaUsed: item.formula || 'Not required', commonTrap: item.misconception, neetShortcut: 'Absolute words such as always and never often expose the distractor.', explanation: `The misconception is: ${item.misconception} Correct principle: ${item.truth}`, solutionSteps: ['Locate the statement that contradicts the definition.', 'State the correct NCERT principle.', 'Check the assumptions.'] },
    { ...common, question: `Statement I: ${item.truth}\nStatement II: ${item.misconception}`, options: ['Both statements are true', 'Statement I is true but Statement II is false', 'Statement I is false but Statement II is true', 'Both statements are false'], answer: 1, questionType: 'Statement/Reasoning', conceptTested: item.term, formulaUsed: item.formula || 'Not required', commonTrap: item.misconception, neetShortcut: 'Judge each statement independently before combining.', explanation: `Statement I is correct. Statement II is the misconception: ${item.misconception}`, solutionSteps: ['Evaluate Statement I from NCERT.', 'Evaluate Statement II separately.', 'Choose the matching truth combination.'] },
    { ...common, question: `Assertion: ${item.truth}\nReason: This is relevant when ${item.application}.`, options: ['Both are true and the reason correctly explains the assertion', 'Both are true but the reason is not the complete explanation', 'Assertion is true but reason is false', 'Assertion is false but reason is true'], answer: 1, questionType: 'Assertion-Reason', conceptTested: item.term, formulaUsed: item.formula || 'Not required', commonTrap: 'Treating a true application as a derivation of the principle.', neetShortcut: 'A true example is not automatically the reason for a law.', explanation: 'Both statements are true, but the application illustrates rather than derives the principle.', solutionSteps: ['Check the assertion.', 'Check the application statement.', 'Test whether the second statement logically explains the first.'] },
    { ...common, question: `A learner uses this rule: "${item.misconception}" while ${item.application}. What is the best correction?`, options: [item.truth, 'Keep the rule but reverse every sign.', 'Ignore all units and directions.', 'The rule is correct without qualification.'], answer: 0, questionType: 'Common Trap', conceptTested: item.term, formulaUsed: item.formula || 'Not required', commonTrap: item.misconception, neetShortcut: 'Replace the wrong rule with the exact defining relation.', explanation: item.truth, solutionSteps: ['Identify the incorrect assumption.', 'Replace it with the NCERT statement.', 'Re-evaluate the situation using the corrected rule.'] },
    { ...common, question: `Which conclusion combines ${item.term} with its application most accurately?`, options: [`${item.truth} Therefore it is directly useful when ${item.application}.`, `${item.misconception} Therefore no assumptions need checking.`, `${item.truth} Therefore the opposite conclusion must always hold.`, `${item.misconception} Therefore units determine the physical law.`], answer: 0, questionType: 'Multi-concept', conceptTested: item.term, formulaUsed: item.formula || 'Not required', commonTrap: item.misconception, neetShortcut: 'Require both halves of a combined option to be true.', explanation: `The first option combines the correct principle with a valid application.`, solutionSteps: ['Check the principle in each option.', 'Check the linked application.', 'Accept only the option with both parts correct.'] },
  ];
}
function numericalQuestions(ch, sub, item, seed) {
  const r = ref(ch, sub, item);
  const common = { chapter: ch.name, classLevel: 11, subject: 'Physics', subtopic: sub.name, ncertSection: sub.sections, topic: item.term, sourceType: 'Original', references: [r], visualRequired: false, estimatedTime: '90-120 s', tags: [sub.name, item.term, 'Numerical'], formulaUsed: item.formula };
  const makeNumeric = (values, index) => {
    const value = item.calc(values), correct = `${fmt(value)}${item.unit ? ` ${item.unit}` : ''}`, options = numericOptions(value, item.unit, seed + index);
    return { ...common, question: `${item.application}. Use ${item.formula} for values ${values.join(', ')} in the stated SI order. What is the result?`, options, answer: options.indexOf(correct), questionType: 'Numerical', conceptTested: item.term, commonTrap: item.misconception, neetShortcut: 'Write the symbolic relation first, then substitute SI values.', explanation: `Using ${item.formula}, substitution gives ${correct}.`, calculation: `${item.formula}; values = ${values.join(', ')}; result = ${correct}`, finalAnswer: correct, unit: item.unit, solutionSteps: [`Write ${item.formula}.`, `Substitute the SI values ${values.join(', ')}.`, `Calculate and retain the unit: ${correct}.`] };
  };
  const scaleCorrect = item.scale;
  const scaleOptions = [scaleCorrect, 'The quantity is unchanged.', 'The quantity becomes zero.', 'The opposite proportional change occurs.'];
  return [
    { ...common, question: `Which relation correctly represents ${item.term}?`, options: [item.formula, `inverse of (${item.formula})`, `${item.formula} with every exponent removed`, `${item.formula} with numerator and denominator interchanged`], answer: 0, questionType: 'Formula', conceptTested: item.term, commonTrap: item.misconception, neetShortcut: 'Check dimensions and limiting behaviour.', explanation: `${item.truth} The applicable relation is ${item.formula}.`, solutionSteps: ['Recall the governing definition or law.', 'Check dimensional consistency.', `Select ${item.formula}.`] },
    makeNumeric(item.sets[0], 1),
    makeNumeric(item.sets[1], 2),
    { ...common, question: `For ${item.term}, which proportional conclusion is correct?`, options: scaleOptions, answer: 0, questionType: 'Numerical', conceptTested: item.term, commonTrap: item.misconception, neetShortcut: 'Use proportionality before doing arithmetic.', explanation: `${scaleCorrect} This follows directly from ${item.formula}.`, calculation: `Read the dependence from ${item.formula}.`, finalAnswer: scaleCorrect, unit: '', solutionSteps: [`Start with ${item.formula}.`, 'Hold the unmentioned quantities fixed.', `Apply the stated change: ${scaleCorrect}`] },
    { ...common, question: `What is the correct output unit when ${item.formula} is evaluated for ${item.term}?`, options: [item.unit || 'dimensionless', 'kg', 's^-1', 'N C^-1'], answer: 0, questionType: 'Units', conceptTested: item.term, commonTrap: 'Finishing a numerical answer without checking its unit.', neetShortcut: 'Reduce the formula to SI base units.', explanation: `The result has unit ${item.unit || 'dimensionless'}.`, solutionSteps: ['Insert SI units for each input.', 'Cancel common factors.', `The remaining unit is ${item.unit || 'dimensionless'}.`] },
    { ...common, question: `Which error is most likely to spoil a calculation of ${item.term}?`, options: [item.misconception, 'Converting every input to SI before substitution.', 'Checking the final dimension.', 'Separating magnitude from direction when appropriate.'], answer: 0, questionType: 'Common Trap', conceptTested: item.term, commonTrap: item.misconception, neetShortcut: 'Audit powers, signs and SI conversion before pressing calculate.', explanation: `The error is: ${item.misconception}`, solutionSteps: ['Write the correct relation.', 'Compare it with the mistaken reasoning.', 'Correct the dependence before calculating.'] },
    { ...common, question: `For ${item.term}, the graph shows an ideal directly proportional output y versus an input x based on ${item.formula}. Which interpretation is correct?`, options: ['The constant slope represents the proportionality factor when other variables are fixed.', 'The area must always equal the physical output.', 'A straight line proves the variables have different dimensions.', 'The intercept must equal one in SI units.'], answer: 0, questionType: 'Graph', visualRequired: true, visualSpec: { type: 'line', xLabel: 'input x', yLabel: 'output y', points: [[0, 0], [1, 1], [2, 2], [3, 3]] }, conceptTested: item.term, commonTrap: 'Confusing slope with area.', neetShortcut: 'Identify what the slope and intercept mean before using graph values.', explanation: `With other quantities fixed, the plotted dependence is represented by its slope.`, solutionSteps: ['Read both axes.', 'Recognise the straight line through the origin.', 'Interpret slope as the constant ratio y/x.'] },
    { ...common, question: `While solving ${item.term}, a student obtains an answer that contradicts this limiting behaviour: ${item.scale} What should be checked first?`, options: [item.formula, 'The colour of the graph line', 'Whether the option letters are alphabetical', 'The chapter page count'], answer: 0, questionType: 'Multi-concept', conceptTested: item.term, commonTrap: item.misconception, neetShortcut: 'Use limiting cases to catch an inverted relation.', explanation: `The governing relation ${item.formula} determines the correct limiting behaviour.`, solutionSteps: ['State the expected proportional trend.', `Compare with ${item.formula}.`, 'Locate any inverted factor or missing exponent.'] },
  ];
}

function buildSubtopic(ch, sub, chapterIndex, subIndex) {
  const questions = sub.items.flatMap((item, i) => item.kind === 'numerical' ? numericalQuestions(ch, sub, item, i) : conceptQuestions(ch, sub, item, i));
  if (questions.length !== 40) throw new Error(`${ch.name} / ${sub.name}: expected 40, got ${questions.length}`);
  const reordered = [
    ...questions.filter((_, i) => i % 5 === 0).slice(0, 8),
    ...questions.filter((_, i) => i % 5 !== 0).slice(0, 24),
  ];
  const selected = new Set(reordered);
  reordered.push(...questions.filter(q => !selected.has(q)));
  return reordered.map((q, i) => ({
    ...q,
    id: `NEET-PHY11-${String(chapterIndex + 1).padStart(2, '0')}-${String(subIndex + 1).padStart(2, '0')}-${String(i + 1).padStart(2, '0')}`,
    questionNumber: i + 1,
    difficulty: i < 8 ? 'Foundation' : i < 32 ? 'NEET Standard' : 'Challenge',
    estimatedTime: i < 8 ? '45-60 s' : i < 32 ? q.estimatedTime : '120-150 s',
  }));
}

const physics = JSON.parse(fs.readFileSync(physicsPath, 'utf8'));
for (const [ci, ch] of chapters.entries()) {
  const target = physics.chapters.find(x => x.id === ch.id);
  if (!target) throw new Error(`Missing repository chapter ${ch.id}`);
  target.subtopics = ch.subtopics.map((sub, si) => ({
    id: `${ch.id}-sub-${si + 1}`,
    name: sub.name,
    ncertSections: sub.sections,
    importance: sub.importance,
    targetMcqs: 40,
    mcqs: buildSubtopic(ch, sub, ci, si),
  }));
  target.mcqs = target.subtopics.flatMap(s => s.mcqs);
}
fs.writeFileSync(physicsPath, `${JSON.stringify(physics, null, 2)}\n`);
const source = fs.readFileSync(import.meta.filename, 'utf8');
const runtimeCore = source.slice(source.indexOf('const C ='), source.indexOf('const physics ='));
const runtime = `/** Generated by scripts/build-class11-physics-bank.mjs. */\n(() => {\n${runtimeCore}\nwindow.SCRUTINY_CLASS11_PHYSICS = chapters.map((chapter, chapterIndex) => ({\n  id: chapter.id,\n  name: chapter.name,\n  classLevel: 11,\n  subtopics: chapter.subtopics.map((subtopic, subtopicIndex) => ({\n    id: \`${'${chapter.id}'}-sub-${'${subtopicIndex + 1}'}\`,\n    name: subtopic.name,\n    ncertSections: subtopic.sections,\n    importance: subtopic.importance,\n    targetMcqs: 40,\n    mcqs: buildSubtopic(chapter, subtopic, chapterIndex, subtopicIndex),\n  })),\n})).map(chapter => ({ ...chapter, mcqs: chapter.subtopics.flatMap(subtopic => subtopic.mcqs) }));\n})();\n`;
fs.writeFileSync(path.join(root, 'data/neet/class11-physics-bank.js'), runtime);
console.log(`Wrote ${chapters.reduce((n, ch) => n + ch.subtopics.length * 40, 0)} Class 11 Physics MCQs across ${chapters.reduce((n, ch) => n + ch.subtopics.length, 0)} subtopics.`);
