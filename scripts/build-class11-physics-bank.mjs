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
  {
    id: 'neet-physics-11-8', name: 'Mechanical Properties of Solids', pdf: 'MECHANICAL PROPERTIES OF SOLIDS.pdf', pages: 13, part: 'Part II',
    subtopics: [
      { name: 'Elasticity, Stress and Strain', sections: '8.1-8.2', page: 1, importance: 'Very High', items: [
        C('elasticity and plasticity', 'Elasticity is the tendency to regain original size and shape after removal of deforming force; plastic deformation remains.', 'A material that undergoes a larger strain is necessarily more elastic.', 'distinguishing steel, rubber and putty after unloading'),
        C('stress', 'Stress is the internal restoring force per unit area and has SI unit pascal.', 'Stress is the total external force and therefore has unit newton.', 'classifying tensile, compressive, shear and hydraulic loading'),
        C('strain', 'Strain is a fractional change in dimension and is dimensionless.', 'Longitudinal strain has the unit metre because it contains a length change.', 'comparing extension of specimens with different original lengths'),
        N('longitudinal stress', 'Longitudinal stress is normal force divided by cross-sectional area.', 'Using diameter in place of cross-sectional area gives the correct stress.', 'finding tensile stress in a loaded wire', 'stress = F/A', 'Pa', x => x[0] / x[1], [[200, 2e-6], [1500, 5e-4]], 'At fixed force, doubling area halves stress.'),
        N('longitudinal strain', 'Longitudinal strain is extension divided by original length.', 'Strain is extension multiplied by original length.', 'finding fractional elongation of a rod', 'strain = Delta L/L', '', x => x[0] / x[1], [[0.001, 2], [0.0005, 0.5]], 'At fixed extension, doubling original length halves strain.'),
      ]},
      { name: 'Hooke Law and Stress-Strain Curves', sections: '8.3-8.4', page: 4, importance: 'Very High', items: [
        C('Hooke law', 'For sufficiently small deformation, stress is proportional to strain; the proportionality limit must not be ignored.', 'Hooke law applies to every deformation up to fracture.', 'interpreting the initial straight segment of a stress-strain plot'),
        C('elastic and plastic regions', 'Below the elastic limit a specimen regains its dimensions; beyond yield it can retain a permanent set.', 'The proportional limit, elastic limit and fracture point are always the same.', 'predicting the specimen after unloading from different points'),
        C('ductility and brittleness', 'A ductile material sustains substantial plastic strain before fracture, whereas a brittle material fractures with little plastic deformation.', 'A brittle material must have a smaller Young modulus than every ductile material.', 'comparing tensile-test curves'),
        N('modulus from graph slope', 'In the linear region, the slope of stress versus strain is the elastic modulus.', 'The area under a stress-strain graph is the elastic modulus.', 'finding modulus from two points in the linear region', 'modulus = stress/strain', 'Pa', x => x[0] / x[1], [[2e8, 0.002], [7.5e7, 0.0015]], 'At fixed strain, doubling stress doubles the slope and modulus.'),
        N('elastic energy density', 'For linear elastic loading, energy stored per unit volume is one half stress times strain.', 'Elastic energy density equals stress divided by strain.', 'finding energy stored per unit volume from a linear stress-strain graph', 'u = (1/2) stress x strain', 'J m^-3', x => 0.5 * x[0] * x[1], [[1e8, 0.001], [4e7, 0.002]], 'Doubling stress at fixed strain doubles the triangular graph area.'),
      ]},
      { name: 'Young, Shear and Bulk Moduli', sections: '8.5.1-8.5.3', page: 6, importance: 'Very High', items: [
        C('Young modulus', 'Young modulus is longitudinal stress divided by longitudinal strain within the linear elastic range.', 'A larger Young modulus means a larger strain for the same stress.', 'comparing axial stiffness of materials'),
        C('shear modulus', 'Shear modulus is tangential stress divided by shear strain, with shear strain approximately equal to the small shear angle in radians.', 'Shearing stress changes volume without changing shape.', 'deforming a block by tangential forces'),
        C('bulk modulus and compressibility', 'Bulk modulus relates pressure increase to fractional volume decrease, and compressibility is its reciprocal.', 'A highly incompressible material has a small bulk modulus.', 'comparing volume response under pressure'),
        N('extension using Young modulus', 'For a uniform wire in the elastic range, extension is FL/(AY).', 'Extension is proportional to cross-sectional area and Young modulus.', 'finding extension of a loaded wire', 'Delta L = FL/(AY)', 'm', x => x[0] * x[1] / (x[2] * x[3]), [[100, 2, 1e-6, 2e11], [500, 1.5, 2e-5, 1e11]], 'At fixed load and material, doubling length doubles extension.'),
        N('volume change using bulk modulus', 'The magnitude of fractional volume change is pressure increase divided by bulk modulus.', 'Volume strain is pressure multiplied by bulk modulus.', 'finding compression under uniform pressure', 'abs(Delta V/V) = Delta P/B', '', x => x[0] / x[1], [[2e6, 1e10], [5e7, 2.5e9]], 'At fixed pressure, doubling bulk modulus halves volume strain.'),
      ]},
      { name: 'Elastic Applications and Material Design', sections: '8.5-8.6', page: 9, importance: 'High', items: [
        C('elastic stiffness of a wire', 'For the same material and length, axial stiffness YA/L increases with cross-sectional area.', 'A thinner wire is stiffer because it experiences greater stress.', 'selecting a support wire with limited extension'),
        C('beam design', 'An I-shaped cross-section places material away from the neutral region and improves resistance to bending without excessive mass.', 'The neutral central material contributes most strongly to bending resistance.', 'understanding I-section girders'),
        C('load safety and yield strength', 'Engineering design keeps working stress safely below yield strength using a factor of safety.', 'A structure is safe whenever its working stress is below ultimate fracture stress.', 'choosing a cable for an elevator'),
        N('wire stiffness', 'Axial force constant of a wire is YA/L.', 'Wire stiffness is YL/A.', 'finding effective force constant of an elastic wire', 'k = YA/L', 'N m^-1', x => x[0] * x[1] / x[2], [[2e11, 1e-6, 2], [7e10, 4e-6, 1]], 'Doubling area at fixed length doubles axial stiffness.'),
        N('safe load', 'Safe load equals allowable stress times load-bearing area.', 'Safe load is allowable stress divided by area.', 'finding maximum permitted load on a cable', 'Fsafe = sigma_allow A', 'N', x => x[0] * x[1], [[1e8, 2e-4], [2.5e7, 8e-5]], 'At fixed allowable stress, doubling area doubles safe load.'),
      ]},
    ],
  },
  {
    id: 'neet-physics-11-9', name: 'Mechanical Properties of Fluids', pdf: 'MECHANICAL PROPERTIES OF FLUIDS.pdf', pages: 22, part: 'Part II',
    subtopics: [
      { name: 'Fluid Pressure, Pascal Law and Buoyancy', sections: '9.1-9.2', page: 1, importance: 'Very High', items: [
        C('fluid pressure', 'A fluid at rest exerts pressure normal to a surface, and at the same level in a connected static fluid pressure is the same.', 'Static-fluid pressure acts only vertically downward.', 'comparing pressure gauges at equal depth'),
        C('Pascal law', 'A pressure change applied to an enclosed fluid is transmitted undiminished throughout the fluid and container walls.', 'A hydraulic machine creates energy because output force exceeds input force.', 'operating a hydraulic lift'),
        C('Archimedes principle', 'Buoyant force equals the weight of displaced fluid and acts upward through the centre of buoyancy.', 'Buoyant force always equals the weight of the immersed object.', 'deciding whether an object floats or sinks'),
        N('hydrostatic pressure increase', 'Pressure increases with depth by rho gh for a uniform incompressible fluid.', 'Hydrostatic pressure depends on container shape rather than depth.', 'finding gauge pressure below a liquid surface', 'Delta P = rho g h', 'Pa', x => x[0] * 9.8 * x[1], [[1000, 5], [800, 2.5]], 'At fixed liquid density, doubling depth doubles gauge pressure.'),
        N('hydraulic force multiplication', 'Equal transmitted pressure gives F1/A1=F2/A2.', 'Equal pressure requires equal forces even for unequal piston areas.', 'finding output force of a hydraulic lift', 'F2 = F1 A2/A1', 'N', x => x[0] * x[1] / x[2], [[200, 0.2, 0.01], [50, 0.5, 0.0025]], 'At fixed input piston, doubling output area doubles output force.'),
      ]},
      { name: 'Continuity, Streamline Flow and Bernoulli Principle', sections: '9.3-9.4', page: 6, importance: 'Very High', items: [
        C('streamline flow', 'In steady flow, velocity at a fixed point does not change with time and streamlines do not cross.', 'Two streamlines may cross because a fluid particle can have two velocities at one point.', 'distinguishing steady from turbulent flow'),
        C('equation of continuity', 'For steady incompressible flow, Av is constant along a flow tube by conservation of mass.', 'Fluid speed is greatest where pipe area is greatest.', 'analysing a constricted pipe'),
        C('Bernoulli principle', 'Along a streamline in steady, incompressible, non-viscous flow, P plus rho v squared over two plus rho gy is constant.', 'Bernoulli equation applies unchanged across a pump or large viscous loss.', 'explaining a Venturi meter or efflux'),
        N('continuity speed', 'For incompressible steady flow, A1v1=A2v2.', 'Speed is directly proportional to cross-sectional area.', 'finding speed in a narrower pipe', 'v2 = A1 v1/A2', 'm s^-1', x => x[0] * x[1] / x[2], [[0.04, 2, 0.01], [6e-3, 3, 2e-3]], 'Halving area at fixed discharge doubles speed.'),
        N('Torricelli efflux speed', 'For a small opening at depth h in a large tank, ideal efflux speed is sqrt(2gh).', 'Efflux speed is proportional to depth rather than its square root.', 'finding speed of a liquid jet from a tank', 'v = sqrt(2gh)', 'm s^-1', x => Math.sqrt(2 * 9.8 * x[0]), [[1.25], [5]], 'Quadrupling depth doubles ideal efflux speed.'),
      ]},
      { name: 'Viscosity, Stokes Law and Terminal Speed', sections: '9.5', page: 12, importance: 'Very High', items: [
        C('viscosity', 'Viscosity is internal fluid friction opposing relative motion of adjacent layers.', 'Viscosity of a fluid at rest produces a permanent shear strain like a solid.', 'comparing honey and water flow'),
        C('Reynolds number', 'Reynolds number compares inertial and viscous effects and helps predict streamline or turbulent flow.', 'Reynolds number has SI unit pascal second.', 'assessing flow through a tube'),
        C('terminal velocity', 'At terminal speed, viscous drag plus buoyancy balances weight so acceleration becomes zero.', 'At terminal speed all forces vanish individually.', 'a small sphere falling through a viscous liquid'),
        N('Stokes drag', 'For slow motion of a sphere, viscous drag is 6 pi eta r v.', 'Stokes drag varies with the square of sphere speed.', 'finding drag on a small sphere', 'F = 6 pi eta r v', 'N', x => 6 * Math.PI * x[0] * x[1] * x[2], [[0.5, 0.001, 0.2], [1.2, 0.002, 0.1]], 'At fixed radius and viscosity, doubling speed doubles drag.'),
        N('terminal speed of a sphere', 'Stokes-law terminal speed is 2 r squared (rho_s-rho_f)g divided by 9 eta.', 'Terminal speed is directly proportional to radius.', 'finding terminal speed in a viscous liquid', 'vt = 2r^2(rho_s-rho_f)g/(9eta)', 'm s^-1', x => 2 * x[0] ** 2 * (x[1] - x[2]) * 9.8 / (9 * x[3]), [[0.001, 7800, 1000, 1], [0.0005, 2500, 1000, 0.2]], 'Doubling radius makes terminal speed four times in the Stokes regime.'),
      ]},
      { name: 'Surface Tension, Drops, Bubbles and Capillarity', sections: '9.6', page: 16, importance: 'Very High', items: [
        C('surface tension and surface energy', 'Surface tension is force per unit length and numerically equals surface energy per unit area at constant temperature.', 'Surface tension acts perpendicular to the liquid surface.', 'understanding a stretched soap film'),
        C('angle of contact', 'Angle of contact is measured through the liquid and depends on the liquid-solid-medium combination.', 'The angle of contact is a property of the liquid alone.', 'comparing water and mercury in glass'),
        C('capillarity', 'Capillary rise or depression results from surface tension, wetting and hydrostatic balance.', 'A wider capillary produces a larger rise for the same liquid.', 'predicting meniscus and liquid level in a narrow tube'),
        N('excess pressure in a drop', 'Excess pressure inside a liquid drop is 2S/r, while a soap bubble has two surfaces and 4S/r.', 'A liquid drop and soap bubble of equal radius have equal excess pressure.', 'finding excess pressure in a liquid drop', 'Delta P = 2S/r', 'Pa', x => 2 * x[0] / x[1], [[0.072, 0.001], [0.05, 0.002]], 'Doubling radius halves excess pressure.'),
        N('capillary rise', 'For a tube of radius r, h=2S cos theta/(rho g r).', 'Capillary rise is directly proportional to tube radius.', 'finding capillary rise for a wetting liquid', 'h = 2S cos(theta)/(rho g r)', 'm', x => 2 * x[0] * Math.cos(x[1] * Math.PI / 180) / (x[2] * 9.8 * x[3]), [[0.072, 0, 1000, 0.0005], [0.05, 60, 800, 0.001]], 'At fixed liquid and contact angle, halving radius doubles capillary rise.'),
      ]},
    ],
  },
  {
    id: 'neet-physics-11-10', name: 'Thermal Properties of Matter', pdf: 'THERMAL PROPERTIES OF MATTER.pdf', pages: 24, part: 'Part II',
    subtopics: [
      { name: 'Temperature Scales and Ideal-Gas Thermometry', sections: '10.1-10.4', page: 1, importance: 'High', items: [
        C('heat and temperature', 'Temperature determines the direction of spontaneous heat flow; heat is energy transferred because of temperature difference.', 'A body contains a definite amount of heat as a state variable.', 'explaining thermal contact between two bodies'),
        C('thermometric property', 'A thermometer uses a reproducible property that varies with temperature and is calibrated at fixed points.', 'Every thermometric property varies identically at all temperatures.', 'calibrating resistance or gas thermometers'),
        C('absolute temperature', 'Kelvin temperature has the same interval size as Celsius and is related by T=tC+273.15.', 'A temperature of 0 degree Celsius means zero molecular activity.', 'converting laboratory temperatures'),
        N('Celsius-Fahrenheit conversion', 'Celsius and Fahrenheit scales satisfy tF=(9/5)tC+32.', 'A Celsius temperature is converted to Fahrenheit by adding 273.15.', 'converting a Celsius reading to Fahrenheit', 'tF = (9/5)tC + 32', 'degree F', x => 1.8 * x[0] + 32, [[100], [-40]], 'A temperature interval of 5 Celsius degrees equals 9 Fahrenheit degrees.'),
        N('constant-volume gas thermometer', 'At fixed amount and volume of an ideal gas, absolute temperature is proportional to pressure.', 'At fixed volume, absolute temperature is inversely proportional to gas pressure.', 'finding temperature from a pressure ratio', 'T2 = T1 P2/P1', 'K', x => x[0] * x[1] / x[2], [[300, 1.2e5, 1e5], [273, 2e5, 1.5e5]], 'At fixed volume, doubling pressure doubles absolute temperature.'),
      ]},
      { name: 'Thermal Expansion', sections: '10.5', page: 6, importance: 'Very High', items: [
        C('linear expansion', 'For a small temperature change, fractional length change is alpha times temperature change.', 'A hole in a uniformly heated sheet contracts because material expands inward.', 'allowing gaps in rails and bridges'),
        C('area and volume expansion', 'For an isotropic solid, area and volume expansion coefficients are approximately 2 alpha and 3 alpha.', 'The volume expansion coefficient of an isotropic solid equals its linear coefficient.', 'expansion of plates and containers'),
        C('anomalous expansion of water', 'Water has maximum density near 4 degree Celsius and expands when cooled from 4 degree Celsius to 0 degree Celsius.', 'Water contracts continuously on cooling down to freezing.', 'explaining why lakes freeze from the top'),
        N('linear thermal expansion', 'Length change is alpha L Delta T for small expansion.', 'Length change is independent of original length.', 'finding expansion of a rod', 'Delta L = alpha L Delta T', 'm', x => x[0] * x[1] * x[2], [[1.2e-5, 2, 100], [2e-5, 0.5, 50]], 'Doubling original length doubles expansion for the same temperature change.'),
        N('apparent liquid expansion', 'Apparent volume expansion of a liquid in a vessel is approximately (gamma_liquid-gamma_vessel)V Delta T.', 'Container expansion should be added to obtain apparent expansion.', 'finding overflow from a heated filled vessel', 'Delta Vapp = (gamma_l-gamma_v)V Delta T', 'm^3', x => (x[0] - x[1]) * x[2] * x[3], [[5e-4, 3e-5, 0.01, 50], [9e-4, 6e-5, 0.002, 100]], 'A more expansive container reduces apparent liquid expansion.'),
      ]},
      { name: 'Specific Heat, Calorimetry and Change of State', sections: '10.6-10.8', page: 9, importance: 'Very High', items: [
        C('specific heat capacity', 'Specific heat capacity is heat required per unit mass per unit temperature rise.', 'A substance with high specific heat warms more for the same heat per unit mass.', 'comparing land and water temperature changes'),
        C('calorimetry principle', 'In an isolated calorimeter, heat lost by hotter bodies equals heat gained by colder bodies until equilibrium.', 'Final equilibrium temperature can lie outside the initial temperature range without a phase change.', 'mixing hot and cold substances'),
        C('latent heat', 'During an ideal phase change at fixed pressure, supplied heat changes phase while temperature remains constant.', 'Latent heat necessarily raises temperature throughout melting or boiling.', 'interpreting a heating curve plateau'),
        N('sensible heat', 'Without phase change, heat is mc Delta T.', 'Heat capacity equals specific heat divided by mass.', 'finding heat needed for a temperature rise', 'Q = mc Delta T', 'J', x => x[0] * x[1] * x[2], [[2, 4200, 10], [0.5, 900, 80]], 'At fixed mass and material, doubling temperature rise doubles heat.'),
        N('latent heat transfer', 'Heat for a phase change is mL.', 'Latent heat transfer is inversely proportional to mass.', 'finding heat required to melt or vaporise a sample', 'Q = mL', 'J', x => x[0] * x[1], [[0.2, 3.34e5], [0.05, 2.26e6]], 'Doubling mass doubles phase-change heat.'),
      ]},
      { name: 'Heat Transfer and Newton Law of Cooling', sections: '10.9-10.10', page: 14, importance: 'Very High', items: [
        C('conduction', 'Conduction transfers energy through microscopic interactions without bulk transport of matter.', 'Good thermal insulators must have high thermal conductivity.', 'heat flow through a wall'),
        C('convection and radiation', 'Convection involves bulk fluid motion, while thermal radiation can cross vacuum.', 'Convection is the dominant heat-transfer mode through empty space.', 'sea breeze and solar heating'),
        C('Newton law of cooling', 'For modest temperature differences under fixed conditions, cooling rate is proportional to excess temperature above surroundings.', 'A cooling body loses equal temperature in equal times at every temperature.', 'analysing a cooling curve'),
        N('steady conduction rate', 'For a uniform slab, heat current is KA Delta T/L.', 'Increasing slab thickness increases heat current.', 'finding heat flow through a wall', 'H = KA Delta T/L', 'W', x => x[0] * x[1] * x[2] / x[3], [[0.8, 2, 20, 0.1], [200, 0.01, 50, 0.5]], 'Doubling thickness halves steady heat current.'),
        N('radiated power', 'Net radiative power is epsilon sigma A(T fourth-Ts fourth).', 'Radiative power depends linearly on absolute temperature.', 'finding net thermal radiation from a surface', 'P = epsilon sigma A(T^4-Ts^4)', 'W', x => x[0] * 5.67e-8 * x[1] * (x[2] ** 4 - x[3] ** 4), [[0.8, 1, 400, 300], [1, 0.5, 500, 300]], 'Absolute temperatures, not Celsius readings, must be raised to the fourth power.'),
      ]},
    ],
  },
  {
    id: 'neet-physics-11-11', name: 'Thermodynamics', pdf: 'THERMODYNAMICS.pdf', pages: 18, part: 'Part II',
    subtopics: [
      { name: 'Thermal Equilibrium, State Variables and Zeroth Law', sections: '11.1-11.3, 11.7', page: 1, importance: 'High', items: [
        C('thermal equilibrium', 'Two systems in thermal equilibrium have no net heat transfer when placed in thermal contact.', 'Thermal equilibrium requires equal internal energies.', 'using a thermometer to compare temperatures'),
        C('zeroth law', 'If two systems are separately in thermal equilibrium with a third, they are in thermal equilibrium with each other.', 'The zeroth law is a statement that internal energy is conserved.', 'establishing temperature as a measurable property'),
        C('state variables and equation of state', 'Pressure, volume and temperature describe equilibrium states; heat and work depend on the path.', 'Heat supplied is a state variable fixed only by initial and final states.', 'comparing paths on a P-V diagram'),
        N('ideal gas equation of state', 'For an ideal gas, PV=nRT.', 'The product PV is constant for every process regardless of temperature.', 'finding pressure of an equilibrium ideal-gas state', 'P = nRT/V', 'Pa', x => x[0] * 8.314 * x[1] / x[2], [[2, 300, 0.05], [1, 500, 0.02]], 'At fixed n and V, pressure is proportional to absolute temperature.'),
        N('state change at fixed amount', 'For a fixed ideal-gas sample, P1V1/T1=P2V2/T2.', 'Celsius temperatures may be used directly in gas-law ratios.', 'finding an unknown final state variable', 'P2 = P1 V1 T2/(T1 V2)', 'Pa', x => x[0] * x[1] * x[2] / (x[3] * x[4]), [[1e5, 0.02, 600, 300, 0.04], [2e5, 0.01, 300, 400, 0.015]], 'Use absolute temperature in every equation-of-state ratio.'),
      ]},
      { name: 'Heat, Work, Internal Energy and First Law', sections: '11.4-11.6', page: 4, importance: 'Very High', items: [
        C('internal energy', 'Internal energy is microscopic kinetic plus intermolecular potential energy and excludes overall centre-of-mass kinetic energy.', 'Internal energy of an ideal gas depends on its container volume alone.', 'separating bulk motion from molecular energy'),
        C('heat and work sign convention', 'In NCERT convention Q is positive into the system and W is positive when done by the system.', 'Compression work done on a gas is positive work by the gas.', 'tracking energy in piston processes'),
        C('first law of thermodynamics', 'Energy conservation gives Delta Q=Delta U+Delta W when W is work done by the system.', 'In every process heat supplied equals work done because internal energy never changes.', 'performing an energy audit'),
        N('first-law energy change', 'With NCERT signs, internal-energy change is Q-W.', 'Work done by the system must be added to heat to find internal-energy gain.', 'finding internal-energy change from heat and work', 'Delta U = Q-W', 'J', x => x[0] - x[1], [[500, 200], [-100, -250]], 'Positive work by the system reduces the energy retained for fixed heat input.'),
        N('constant-pressure work', 'For quasistatic expansion at constant pressure, work by the gas is P Delta V.', 'P-V graph slope equals work done.', 'finding work from a rectangular area on a P-V graph', 'W = P(V2-V1)', 'J', x => x[0] * (x[1] - x[2]), [[2e5, 0.03, 0.01], [1e5, 0.01, 0.025]], 'Expansion gives positive work and compression gives negative work in NCERT convention.'),
      ]},
      { name: 'Thermodynamic Processes and P-V Diagrams', sections: '11.8', page: 8, importance: 'Very High', items: [
        C('isothermal process', 'For an ideal gas in an isothermal process, internal energy change is zero and heat absorbed equals work done.', 'Isothermal expansion has no heat transfer.', 'following a hyperbola on a P-V diagram'),
        C('adiabatic, isochoric and isobaric processes', 'Adiabatic means Q=0, isochoric means W=0, and isobaric means pressure is constant.', 'Adiabatic and isothermal processes are identical because both keep temperature constant.', 'classifying paths on a P-V diagram'),
        C('cyclic process', 'Over a complete cycle the state returns to its start so Delta U=0, while net work is the signed enclosed P-V area.', 'Net work over every cycle is zero because the final state equals the initial state.', 'interpreting clockwise and anticlockwise cycles'),
        N('isothermal ideal-gas work', 'Reversible isothermal work is nRT ln(V2/V1).', 'Isothermal work is simply P1(V2-V1) despite changing pressure.', 'finding work in an isothermal expansion', 'W = nRT ln(V2/V1)', 'J', x => x[0] * 8.314 * x[1] * Math.log(x[2] / x[3]), [[1, 300, 0.04, 0.02], [2, 400, 0.03, 0.01]], 'For expansion V2 greater than V1, the logarithm and work are positive.'),
        N('adiabatic work', 'For an ideal gas, adiabatic work by the gas is nR(T1-T2)/(gamma-1).', 'During adiabatic expansion temperature must remain unchanged.', 'finding work from the temperature drop', 'W = nR(T1-T2)/(gamma-1)', 'J', x => x[0] * 8.314 * (x[1] - x[2]) / (x[3] - 1), [[1, 400, 300, 1.4], [2, 500, 350, 1.67]], 'Adiabatic expansion cools the ideal gas and produces positive work.'),
      ]},
      { name: 'Second Law, Reversibility and Carnot Engine', sections: '11.9-11.11', page: 12, importance: 'Very High', items: [
        C('second law statements', 'Kelvin-Planck forbids complete cyclic conversion of heat from one reservoir into work; Clausius forbids unaided heat flow cold to hot.', 'The first law alone sets the maximum possible heat-engine efficiency.', 'testing proposed engines and refrigerators'),
        C('reversible and irreversible processes', 'A reversible process is an ideal limit with no dissipative effects and restores both system and surroundings when reversed.', 'Every quasistatic process is reversible even with friction.', 'comparing free expansion with a Carnot step'),
        C('Carnot theorem', 'No engine between two given reservoir temperatures is more efficient than a reversible Carnot engine.', 'Carnot efficiency depends on the working substance and engine size.', 'setting the upper bound for an engine'),
        N('Carnot efficiency', 'Carnot efficiency is 1-Tc/Th with absolute temperatures.', 'Celsius temperatures can be inserted directly into the Carnot ratio.', 'finding maximum heat-engine efficiency', 'eta = 1-Tc/Th', '', x => 1 - x[0] / x[1], [[300, 600], [400, 1000]], 'Raising source temperature at fixed sink temperature increases maximum efficiency.'),
        N('refrigerator coefficient of performance', 'For a Carnot refrigerator, COP is Tc/(Th-Tc).', 'Refrigerator COP must be less than one like engine efficiency.', 'finding ideal refrigerator performance', 'COP = Tc/(Th-Tc)', '', x => x[0] / (x[1] - x[0]), [[270, 300], [250, 350]], 'A smaller temperature lift gives a larger ideal COP.'),
      ]},
    ],
  },
  {
    id: 'neet-physics-11-12', name: 'Kinetic Theory', pdf: 'KINETIC THEORY.pdf', pages: 15, part: 'Part II',
    subtopics: [
      { name: 'Molecular Nature, Gas Laws and Ideal Gas', sections: '12.1-12.3', page: 1, importance: 'High', items: [
        C('molecular nature of matter', 'Macroscopic matter consists of atoms or molecules whose microscopic motion and interactions underlie thermal behaviour.', 'Gas molecules remain stationary between collisions.', 'connecting Brownian motion and diffusion to molecules'),
        C('ideal gas approximation', 'Real gases approach ideal behaviour at low pressure and high temperature where molecular size and attractions are less important.', 'Real gases are most ideal at high pressure and low temperature.', 'choosing conditions for PV=nRT'),
        C('Avogadro and Boltzmann constants', 'One mole contains Avogadro number of entities and R=NA kB.', 'Boltzmann constant is the gas constant per kilogram.', 'moving between per-molecule and per-mole descriptions'),
        N('ideal-gas pressure', 'Ideal gas pressure is nRT/V.', 'Pressure is proportional to volume at fixed n and T.', 'finding pressure of a gas sample', 'P = nRT/V', 'Pa', x => x[0] * 8.314 * x[1] / x[2], [[1, 300, 0.024], [0.5, 400, 0.01]], 'At fixed amount and temperature, doubling volume halves pressure.'),
        N('number density', 'Number density is number of molecules divided by volume.', 'Number density equals molecular mass times volume.', 'finding molecules per unit volume', 'number density = N/V', 'm^-3', x => x[0] / x[1], [[6.02e23, 0.024], [3e22, 0.005]], 'At fixed molecule count, doubling volume halves number density.'),
      ]},
      { name: 'Kinetic Theory of Pressure and Temperature', sections: '12.4', page: 5, importance: 'Very High', items: [
        C('kinetic-theory assumptions', 'Ideal-gas molecules are treated as tiny particles in random motion with negligible interactions except brief elastic collisions.', 'Ideal-gas molecules continuously exert long-range attractive forces on one another.', 'deriving pressure from wall collisions'),
        C('pressure from molecular motion', 'Kinetic theory gives P=(1/3)rho vrms squared for an isotropic gas.', 'Gas pressure is caused by molecular weight alone and persists without wall collisions.', 'relating microscopic speeds to macroscopic pressure'),
        C('molecular interpretation of temperature', 'Average translational kinetic energy per molecule is (3/2)kBT and depends only on absolute temperature.', 'At one temperature heavier molecules have greater average translational kinetic energy.', 'comparing gases in a mixture'),
        N('rms molecular speed', 'Root-mean-square speed is sqrt(3RT/M) for molar mass M in kg per mole.', 'RMS speed is proportional to molar mass.', 'finding rms speed of an ideal gas', 'vrms = sqrt(3RT/M)', 'm s^-1', x => Math.sqrt(3 * 8.314 * x[0] / x[1]), [[300, 0.028], [400, 0.004]], 'At fixed gas, quadrupling absolute temperature doubles rms speed.'),
        N('pressure from rms speed', 'Kinetic pressure is one third density times rms speed squared.', 'Pressure varies linearly with rms speed.', 'finding pressure from density and rms speed', 'P = (1/3)rho vrms^2', 'Pa', x => x[0] * x[1] ** 2 / 3, [[1.2, 500], [0.8, 300]], 'Doubling rms speed at fixed density makes pressure four times.'),
      ]},
      { name: 'Degrees of Freedom, Equipartition and Specific Heats', sections: '12.5-12.6', page: 8, importance: 'Very High', items: [
        C('degrees of freedom', 'Each independent quadratic translational or rotational degree contributes one half kBT per molecule in classical equilibrium.', 'Each degree of freedom contributes kBT per molecule.', 'counting active modes of monoatomic and diatomic gases'),
        C('vibrational modes', 'Each active vibrational frequency contributes two quadratic modes, kinetic and potential, for total kBT per molecule.', 'A vibrational mode contributes only potential energy.', 'explaining temperature dependence of gas heat capacity'),
        C('specific-heat relation', 'For an ideal gas Cp-Cv=R per mole and gamma=Cp/Cv.', 'Cp is smaller than Cv because expansion requires work.', 'comparing constant-pressure and constant-volume heating'),
        N('molar internal energy from degrees', 'For f active quadratic degrees, ideal-gas molar internal energy is (f/2)RT.', 'Internal energy is fRT without the one-half factor.', 'finding internal energy of an ideal gas', 'U = (f/2)nRT', 'J', x => x[0] * x[1] * 8.314 * x[2] / 2, [[3, 2, 300], [5, 1, 400]], 'At fixed f and n, internal energy is proportional to absolute temperature.'),
        N('heat-capacity ratio', 'With f active quadratic degrees, Cv=fR/2 and gamma=(f+2)/f.', 'Gamma equals f/2 for every ideal gas.', 'finding gamma from degrees of freedom', 'gamma = (f+2)/f', '', x => (x[0] + 2) / x[0], [[3], [5]], 'More active degrees of freedom bring gamma closer to one.'),
      ]},
      { name: 'Mean Free Path and Molecular Collisions', sections: '12.7', page: 11, importance: 'High', items: [
        C('mean free path', 'Mean free path is the average distance a molecule travels between successive collisions.', 'Mean free path is the mean distance from a molecule to the container wall only.', 'describing molecular motion in a dilute gas'),
        C('collision cross-section', 'For hard-sphere molecules, larger molecular diameter gives a larger collision cross-section and shorter mean free path.', 'Larger molecules at the same number density travel farther between collisions.', 'comparing gases with different effective diameters'),
        C('pressure dependence', 'At fixed temperature, increasing pressure raises number density and reduces mean free path.', 'Mean free path increases with pressure at fixed temperature.', 'understanding rarefied gases and vacuum systems'),
        N('mean free path', 'For hard spheres, mean free path is 1/(sqrt(2) pi d squared n).', 'Mean free path is proportional to molecular diameter squared.', 'finding average distance between collisions', 'lambda = 1/(sqrt(2) pi d^2 n)', 'm', x => 1 / (Math.sqrt(2) * Math.PI * x[0] ** 2 * x[1]), [[3e-10, 2.5e25], [2e-10, 1e24]], 'Doubling molecular diameter makes mean free path one-fourth.'),
        N('collision time estimate', 'Mean collision time is approximately mean free path divided by molecular speed.', 'Collision time is mean free path multiplied by speed.', 'estimating time between molecular collisions', 'tau = lambda/vrms', 's', x => x[0] / x[1], [[1e-7, 500], [5e-6, 1000]], 'At fixed mean free path, doubling speed halves mean collision time.'),
      ]},
    ],
  },
  {
    id: 'neet-physics-11-13', name: 'Oscillations', pdf: 'OSCILLATIONS.pdf', pages: 19, part: 'Part II',
    subtopics: [
      { name: 'Periodic Motion, SHM and Phase', sections: '13.1-13.4', page: 1, importance: 'Very High', items: [
        C('periodic and oscillatory motion', 'Periodic motion repeats after a fixed interval; oscillatory motion is to-and-fro about an equilibrium position.', 'Every periodic motion is necessarily oscillatory along a line.', 'classifying rotation, orbital motion and a vibrating mass'),
        C('simple harmonic motion', 'SHM has acceleration proportional to displacement and directed toward equilibrium: a=-omega squared x.', 'Any repeating motion is SHM regardless of its force law.', 'testing whether a motion law is harmonic'),
        C('phase and phase constant', 'The phase omega t plus phi specifies the oscillator state, while phi fixes the initial state for a chosen time origin.', 'Two particles with the same amplitude always have the same phase.', 'reading sinusoidal displacement equations'),
        N('period-frequency relation', 'Period is the reciprocal of frequency and omega=2 pi f.', 'Angular frequency is the same numerical quantity as ordinary frequency.', 'converting between frequency and period', 'T = 1/f', 's', x => 1 / x[0], [[5], [50]], 'Doubling frequency halves period.'),
        N('SHM displacement', 'For x=A cos(omega t+phi), displacement follows the cosine of phase.', 'Amplitude is the instantaneous displacement at every time.', 'finding displacement at a specified phase', 'x = A cos(theta)', 'm', x => x[0] * Math.cos(x[1] * Math.PI / 180), [[0.1, 60], [0.2, 120]], 'A phase shift of pi reverses displacement.'),
      ]},
      { name: 'SHM Velocity, Acceleration and Force', sections: '13.5-13.6', page: 8, importance: 'Very High', items: [
        C('velocity in SHM', 'Speed is maximum at equilibrium and zero at the extremes, with v squared=omega squared(A squared-x squared).', 'Speed is maximum at maximum displacement.', 'reading x-t and v-t graphs'),
        C('acceleration in SHM', 'Acceleration is zero at equilibrium and maximum in magnitude at the extremes, always opposing displacement.', 'Acceleration and displacement have the same sign in SHM.', 'interpreting an a-x graph'),
        C('restoring-force law', 'A linear restoring force F=-kx produces SHM with angular frequency sqrt(k/m).', 'A constant force toward equilibrium produces exact SHM.', 'analysing a horizontal spring-mass system'),
        N('SHM speed at displacement', 'SHM speed magnitude is omega sqrt(A squared-x squared).', 'Speed varies linearly as A-x.', 'finding speed away from equilibrium', 'v = omega sqrt(A^2-x^2)', 'm s^-1', x => x[0] * Math.sqrt(x[1] ** 2 - x[2] ** 2), [[4, 0.5, 0.3], [10, 0.1, 0.06]], 'At equilibrium x=0, speed is omega A.'),
        N('SHM acceleration', 'Acceleration is -omega squared x.', 'Acceleration is -omega x.', 'finding acceleration at a given displacement', 'a = -omega^2 x', 'm s^-2', x => -(x[0] ** 2) * x[1], [[5, 0.2], [10, -0.05]], 'At fixed displacement, doubling omega makes acceleration magnitude four times.'),
      ]},
      { name: 'Energy in SHM and Spring Oscillator', sections: '13.7', page: 10, importance: 'Very High', items: [
        C('energy exchange in SHM', 'In ideal SHM, kinetic and potential energies exchange while total mechanical energy remains constant.', 'Kinetic and potential energies are individually constant in SHM.', 'interpreting K-x and U-x plots'),
        C('turning points and equilibrium', 'At a turning point energy is entirely potential, while at equilibrium it is entirely kinetic for a spring oscillator.', 'Both kinetic and potential energy vanish at equilibrium.', 'tracking an oscillator through one cycle'),
        C('energy frequency', 'Kinetic and potential energies vary with twice the oscillation frequency because they contain squared sine or cosine terms.', 'Energy oscillates with half the displacement frequency.', 'comparing x-t and U-t graphs'),
        N('total SHM energy', 'Total energy of a spring oscillator is one half kA squared.', 'Total energy is proportional to amplitude.', 'finding mechanical energy from amplitude', 'E = (1/2)kA^2', 'J', x => 0.5 * x[0] * x[1] ** 2, [[200, 0.1], [50, 0.2]], 'Doubling amplitude makes total energy four times.'),
        N('spring oscillator period', 'The period of an ideal mass-spring oscillator is 2 pi sqrt(m/k).', 'A heavier mass oscillates faster on the same spring.', 'finding the period of a spring-mass system', 'T = 2 pi sqrt(m/k)', 's', x => 2 * Math.PI * Math.sqrt(x[0] / x[1]), [[1, 100], [0.5, 200]], 'Quadrupling mass doubles period.'),
      ]},
      { name: 'Simple Pendulum and SHM Applications', sections: '13.8', page: 13, importance: 'Very High', items: [
        C('simple pendulum approximation', 'For small angular displacement, sin theta is approximately theta and the pendulum executes approximate SHM.', 'A simple pendulum is exact SHM at every amplitude.', 'deciding when the standard period formula applies'),
        C('pendulum period dependencies', 'For small oscillations, pendulum period depends on length and local g, not bob mass.', 'A heavier pendulum bob has a longer small-angle period.', 'comparing pendulums with different bobs'),
        C('effective gravity', 'In an accelerating support, pendulum behaviour is governed by the vector effective gravity.', 'Horizontal acceleration changes pendulum mass and therefore its period.', 'a pendulum in an accelerating vehicle'),
        N('simple pendulum period', 'Small-angle period is 2 pi sqrt(L/g).', 'Pendulum period is proportional to length.', 'finding a pendulum period', 'T = 2 pi sqrt(L/g)', 's', x => 2 * Math.PI * Math.sqrt(x[0] / x[1]), [[1, 9.8], [0.25, 9.8]], 'Quadrupling length doubles period.'),
        N('pendulum length from period', 'Pendulum length is gT squared divided by 4 pi squared.', 'Length is proportional to period rather than period squared.', 'finding length of a seconds-type pendulum', 'L = gT^2/(4 pi^2)', 'm', x => x[0] * x[1] ** 2 / (4 * Math.PI ** 2), [[9.8, 2], [1.62, 2]], 'At fixed g, doubling period makes length four times.'),
      ]},
    ],
  },
  {
    id: 'neet-physics-11-14', name: 'Waves', pdf: 'WAVES.pdf', pages: 22, part: 'Part II',
    subtopics: [
      { name: 'Wave Motion and Travelling-Wave Equation', sections: '14.1-14.3', page: 1, importance: 'Very High', items: [
        C('mechanical wave', 'A mechanical wave transports energy through a material medium while particles oscillate about equilibrium without net bulk travel with the wave.', 'Medium particles move from source to receiver with the wave speed.', 'distinguishing wave propagation from particle motion'),
        C('transverse and longitudinal waves', 'Particle displacement is perpendicular to propagation in a transverse wave and parallel in a longitudinal wave.', 'Sound in air is transverse because it can be drawn as a sinusoid.', 'classifying string and sound waves'),
        C('travelling-wave phase', 'For y=A sin(kx-omega t+phi), constant phase moves in the positive x direction.', 'The sign between kx and omega t has no relation to propagation direction.', 'reading a wave equation'),
        N('wave number and wavelength', 'Angular wave number is 2 pi divided by wavelength.', 'Wave number equals wavelength divided by 2 pi.', 'finding wave number from wavelength', 'k = 2 pi/lambda', 'rad m^-1', x => 2 * Math.PI / x[0], [[0.5], [2]], 'Doubling wavelength halves wave number.'),
        N('phase difference', 'At one instant, phase difference between points separated by Delta x is 2 pi Delta x/lambda.', 'Phase difference depends only on amplitude.', 'finding phase difference along a wave', 'Delta phi = 2 pi Delta x/lambda', 'rad', x => 2 * Math.PI * x[0] / x[1], [[0.25, 1], [0.6, 2]], 'A separation of one wavelength gives phase difference 2 pi.'),
      ]},
      { name: 'Wave Speed on Strings and in Sound Media', sections: '14.4', page: 7, importance: 'Very High', items: [
        C('wave speed relation', 'Wave speed equals frequency times wavelength and is set mainly by medium properties for a mechanical wave.', 'Increasing source frequency necessarily increases wave speed in the same nondispersive medium.', 'predicting wavelength after changing frequency'),
        C('string-wave speed', 'Transverse-wave speed on a stretched string is sqrt(T/mu), where mu is linear mass density.', 'A heavier string at the same tension carries waves faster.', 'comparing waves on stretched strings'),
        C('speed of sound', 'Sound speed depends on an elastic modulus divided by density under a square root; in a gas the adiabatic bulk modulus is gamma P.', 'Sound speed in a gas is determined by pressure alone and is independent of density.', 'comparing sound in gases and solids'),
        N('wave speed from frequency', 'For a periodic wave, v=f lambda.', 'Wave speed equals frequency divided by wavelength.', 'finding propagation speed', 'v = f lambda', 'm s^-1', x => x[0] * x[1], [[50, 2], [500, 0.68]], 'At fixed medium speed, doubling frequency halves wavelength.'),
        N('speed on a stretched string', 'String-wave speed is sqrt(T/mu).', 'String-wave speed is proportional to tension rather than its square root.', 'finding transverse wave speed on a string', 'v = sqrt(T/mu)', 'm s^-1', x => Math.sqrt(x[0] / x[1]), [[200, 0.02], [50, 0.005]], 'Quadrupling tension doubles wave speed.'),
      ]},
      { name: 'Superposition, Reflection and Standing Waves', sections: '14.5-14.6', page: 10, importance: 'Very High', items: [
        C('superposition and interference', 'When waves overlap in a linear medium, resultant displacement is the algebraic sum of individual displacements.', 'Interfering waves permanently destroy each other after destructive interference.', 'combining coherent waves'),
        C('reflection phase change', 'A transverse wave reflecting from a rigid end undergoes phase reversal, while reflection from a free end does not.', 'Reflection from both fixed and free ends always reverses phase.', 'predicting reflected pulses'),
        C('standing-wave nodes and antinodes', 'Standing waves have fixed nodes of zero amplitude and antinodes of maximum amplitude, with adjacent nodes separated by lambda/2.', 'Energy is progressively transported through a perfect standing wave.', 'reading a standing-wave pattern'),
        N('resultant interference amplitude', 'Two equal-amplitude waves of phase difference phi combine with amplitude 2a cos(phi/2) in magnitude.', 'Resultant amplitude is always 2a regardless of phase.', 'finding amplitude after superposition', 'Aresult = abs(2a cos(phi/2))', 'm', x => Math.abs(2 * x[0] * Math.cos(x[1] * Math.PI / 360)), [[0.1, 120], [0.2, 180]], 'Equal waves exactly out of phase cancel.'),
        N('node spacing', 'Adjacent nodes or adjacent antinodes of a standing wave are separated by lambda/2.', 'A node and its nearest antinode are separated by lambda/2.', 'finding wavelength from a standing-wave pattern', 'lambda = 2d_nodes', 'm', x => 2 * x[0], [[0.3], [0.75]], 'Nearest node-antinode separation is lambda/4.'),
      ]},
      { name: 'Strings, Organ Pipes, Resonance and Beats', sections: '14.6-14.7', page: 14, importance: 'Very High', items: [
        C('harmonics of strings and open pipes', 'A string fixed at both ends and an open pipe support all integer harmonics with fundamental v/(2L).', 'An open pipe supports only odd harmonics.', 'identifying allowed normal modes'),
        C('closed-pipe harmonics', 'A pipe closed at one end supports odd harmonics with fundamental v/(4L) in the ideal end-correction-free model.', 'The second harmonic is an allowed mode of an ideal one-end-closed pipe.', 'distinguishing open and closed organ pipes'),
        C('beats and resonance', 'Beats have frequency equal to the absolute difference of two nearby frequencies; resonance gives large response near a natural frequency.', 'Beat frequency is the sum of the two source frequencies.', 'tuning musical instruments'),
        N('fixed-string frequency', 'Allowed string frequencies are nv/(2L).', 'The fundamental of a fixed string is v/(4L).', 'finding a string harmonic frequency', 'fn = n v/(2L)', 'Hz', x => x[0] * x[1] / (2 * x[2]), [[3, 200, 1], [2, 300, 1.5]], 'Doubling length halves every normal-mode frequency.'),
        N('beat frequency', 'Beat frequency is the absolute difference between nearby component frequencies.', 'Beat frequency is their arithmetic mean.', 'finding beats heard per second', 'fbeat = abs(f1-f2)', 'Hz', x => Math.abs(x[0] - x[1]), [[256, 260], [440, 436]], 'As the two frequencies approach equality, beat frequency approaches zero.'),
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
  return { sourceType: 'Original', sourceLabel: `NCERT Physics ${ch.part || 'Part I'}, uploaded current edition`, pdfFilename: ch.pdf, pdfPage: item.page || sub.page, section: sub.sections, ncertTopic: item.term };
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
    { ...common, question: `For ${item.term}, let X denote the complete variable factor on the right-hand side of ${item.formula}, after fixed constants are removed. The graph plots calculated output y against X. Which interpretation is correct?`, options: ['The constant slope is the remaining proportionality factor.', 'The area must always equal the physical output.', 'A straight line proves y and X have different dimensions.', 'The intercept must equal one in SI units.'], answer: 0, questionType: 'Graph', visualRequired: true, visualSpec: { type: 'line', xLabel: 'transformed variable X', yLabel: 'calculated output y', points: [[0, 0], [1, 1], [2, 2], [3, 3]] }, conceptTested: item.term, commonTrap: 'Plotting against an untransformed variable when the formula is inverse or nonlinear.', neetShortcut: 'Linearise the formula first, then interpret slope and intercept.', explanation: `After the formula is written as y = constant times X, the slope gives that remaining constant.`, solutionSteps: ['Identify the full variable dependence in the formula.', 'Define X using that dependence, including powers or reciprocals.', 'Read the slope as the remaining proportionality factor.'] },
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
