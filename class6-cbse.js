import { firebaseConfig } from "./firebase-config.js";
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.14.1/firebase-app.js";
import { getAuth, onAuthStateChanged, signOut, getIdTokenResult } from "https://www.gstatic.com/firebasejs/10.14.1/firebase-auth.js";
import { getFirestore, doc, getDoc } from "https://www.gstatic.com/firebasejs/10.14.1/firebase-firestore.js";

const SUBJECTS = {
  mathematics: { name: "Mathematics", icon: "➗", book: "NCERT Ganita Prakash", chapters: [
    ["Patterns in Mathematics","Recognise number and shape patterns and explain the rule.",["Pattern rule","A pattern repeats or grows according to a rule."],["Sequence","An ordered list of numbers or shapes."],"Look at what changes from one term to the next.","Which number comes next: 1, 3, 6, 10?",[12,15,14,16],15],
    ["Lines and Angles","Identify lines, rays, segments and compare angles.",["Line segment","A part of a line with two endpoints."],["Right angle","An angle measuring exactly 90°."],"Use the corner of a book to spot a right angle.","An angle of 90° is called what?",["Acute","Right","Obtuse","Straight"],"Right"],
    ["Number Play","Use place value, factors and number properties to solve puzzles.",["Place value","A digit's value depends on its position."],["Factor","A number that divides another number exactly."],"Test divisibility before doing long division.","Which is a factor of 24?",[5,7,8,11],8],
    ["Data Handling and Presentation","Collect, organise and read data using tables and graphs.",["Data","A collection of facts, numbers or observations."],["Pictograph","A graph that uses pictures or symbols to show data."],"Always read the graph key before counting symbols.","What explains the value of one symbol in a pictograph?",["Title","Key","Axis","Table"],"Key"],
    ["Prime Time","Classify numbers using factors, multiples and prime factorisation.",["Prime number","A number greater than 1 with exactly two factors."],["Composite number","A number with more than two factors."],"Remember: 2 is the only even prime number.","Which number is prime?",[9,15,17,21],17],
    ["Perimeter and Area","Measure the boundary and surface covered by plane shapes.",["Perimeter","The total length around a closed figure."],["Area","The amount of surface a shape covers."],"Fence means perimeter; floor tile means area.","Area of a rectangle equals?",["l+b","2(l+b)","l×b","l÷b"],"l×b"],
    ["Fractions","Compare and operate with parts of a whole.",["Numerator","The top number showing selected parts."],["Denominator","The bottom number showing total equal parts."],"For equal denominators, compare only numerators.","Which fraction is equal to one half?",["2/3","3/6","4/6","5/8"],"3/6"],
    ["Playing with Constructions","Use ruler and compass to construct accurate figures.",["Compass","A tool used to draw circles and transfer lengths."],["Construction","An exact drawing made using geometric tools."],"Keep the compass width unchanged when transferring a length.","Which tool draws a circle?",["Protractor","Compass","Divider line","Set square"],"Compass"],
    ["Symmetry","Find lines of symmetry and recognise rotational balance.",["Line of symmetry","A line that divides a figure into matching halves."],["Reflection","A mirror image across a line."],"Imagine folding the shape: matching halves show symmetry.","How many lines of symmetry does a square have?",[1,2,3,4],4],
    ["The Other Side of Zero","Understand negative numbers and use the number line.",["Negative number","A number less than zero."],["Number line","Numbers arranged in order on a straight line."],"Move right to increase; move left to decrease.","Which is smaller?",[-2,-5,0,3],-5]
  ]},
  science: { name: "Science", icon: "🔬", book: "NCERT Curiosity", chapters: [
    ["The Wonderful World of Science","Ask questions, observe carefully and test ideas.",["Observation","Information gathered using the senses or instruments."],["Experiment","A fair test used to investigate a question."],"Think like a detective: ask, predict, test, record.","What should a scientific investigation begin with?",["A question","A conclusion","A prize","A guess only"],"A question"],
    ["Diversity in the Living World","Group living organisms by shared features and habitats.",["Habitat","The natural home of an organism."],["Biodiversity","The variety of living organisms in an area."],"Group by visible features, then compare habitats.","The natural home of an organism is its?",["Habit","Habitat","Shelter only","Community"],"Habitat"],
    ["Mindful Eating: A Path to a Healthy Body","Connect nutrients, balanced meals and healthy food choices.",["Nutrient","A useful substance in food needed by the body."],["Balanced diet","A diet containing all nutrients in suitable amounts."],"Build a rainbow plate with different food groups.","Which nutrient mainly helps growth and repair?",["Proteins","Water","Roughage","Minerals only"],"Proteins"],
    ["Exploring Magnets","Investigate magnetic poles, attraction and direction.",["Magnetic pole","A region near either end where a magnet is strongest."],["Repulsion","The push between like magnetic poles."],"Like poles repel; unlike poles attract.","A north pole brought near another north pole will?",["Attract","Repel","Disappear","Rotate once"],"Repel"],
    ["Measurement of Length and Motion","Choose standard units and describe types of motion.",["SI unit of length","The metre (m) is the standard SI unit."],["Periodic motion","Motion that repeats after equal time intervals."],"Match the tool and unit to the size being measured.","Which is an example of periodic motion?",["Swinging pendulum","Parked car","Book on table","Stone at rest"],"Swinging pendulum"],
    ["Materials Around Us","Classify materials using observable properties.",["Solubility","The ability of a substance to dissolve in a liquid."],["Transparent","Allows most light to pass through clearly."],"Test one property at a time: lustre, hardness, solubility, transparency.","Which material is transparent?",["Clear glass","Wood","Cardboard","Stone"],"Clear glass"],
    ["Temperature and its Measurement","Measure temperature safely using suitable thermometers.",["Temperature","A measure of how hot or cold something is."],["Clinical thermometer","A thermometer designed to measure body temperature."],"Read the scale at eye level without touching the bulb.","Normal human body temperature is close to?",["37°C","0°C","100°C","60°C"],"37°C"],
    ["A Journey through States of Water","Explain melting, freezing, evaporation and condensation.",["Evaporation","Change of liquid water into water vapour."],["Condensation","Change of water vapour into liquid water."],"Follow H₂O: solid → liquid → gas and back.","Droplets outside a cold glass form by?",["Melting","Condensation","Freezing","Boiling"],"Condensation"],
    ["Methods of Separation in Everyday Life","Select separation methods based on material properties.",["Filtration","Separating an insoluble solid from a liquid using a filter."],["Sieving","Separating particles of different sizes using a mesh."],"Ask what differs: size, weight, solubility or magnetism.","Tea leaves are separated from tea by?",["Filtration","Winnowing","Churning","Handpicking"],"Filtration"],
    ["Living Creatures: Exploring their Characteristics","Recognise common life processes and growth.",["Respiration","The process that releases energy from food."],["Stimulus","A change that causes an organism to respond."],"Use MRS GREN to remember major life processes.","Turning toward light is a response to a?",["Stimulus","Mineral","Habitat","Nutrient"],"Stimulus"],
    ["Nature's Treasures","Use natural resources carefully and distinguish renewable resources.",["Natural resource","A useful material or feature obtained from nature."],["Conservation","Careful protection and use of resources."],"Reduce first, reuse next, recycle last.","Which resource is renewable?",["Sunlight","Coal","Petroleum","Natural gas"],"Sunlight"],
    ["Beyond Earth","Describe the Solar System and objects visible in the night sky.",["Solar System","The Sun and all objects that move around it."],["Constellation","A recognised pattern of stars in the sky."],"Planet order: My Very Educated Mother Just Served Us Noodles.","Which object is at the centre of our Solar System?",["Earth","Moon","Sun","Polaris"],"Sun"]
  ]},
  "social-science": { name: "Social Science", icon: "🌍", book: "NCERT Exploring Society: India and Beyond", chapters: [
    ["Locating Places on the Earth","Use maps, directions, latitude and longitude to locate places.",["Latitude","Imaginary east–west circles measuring distance north or south."],["Longitude","Imaginary north–south semicircles measuring distance east or west."],"Latitude lies flat; longitude is long from pole to pole.","The Equator is which latitude?",["0°","90°N","180°","23.5°N"],"0°"],
    ["Oceans and Continents","Identify continents, oceans and their influence on life.",["Continent","A very large continuous landmass."],["Ocean","A vast body of salt water."],"Use a blank map and label from memory.","Which is the largest ocean?",["Indian","Atlantic","Pacific","Arctic"],"Pacific"],
    ["Landforms and Life","Relate mountains, plateaus and plains to human life.",["Mountain","A high landform with steep slopes."],["Plateau","An elevated area with a broad, fairly flat top."],"Picture the three P's: Peaks, Plateaus, Plains.","Which landform is often called a tableland?",["Plain","Plateau","Valley","Delta"],"Plateau"],
    ["Timeline and Sources of History","Arrange events in time and evaluate historical sources.",["Timeline","A line showing events in chronological order."],["Archaeological source","Material remains such as tools, coins or buildings."],"Ask: who made this source, when and why?","Which is an archaeological source?",["Coin","Modern rumour","Future plan","Weather forecast"],"Coin"],
    ["India, That Is Bharat","Explore India's names, regions and early geographical ideas.",["Bharat","An ancient and continuing name for India."],["Subcontinent","A large, distinct part of a continent."],"Connect names to the sources and periods that used them.","India is part of which continent?",["Asia","Europe","Africa","Australia"],"Asia"],
    ["The Beginnings of Indian Civilisation","Study cities, crafts and trade of the Harappan civilisation.",["Civilisation","An organised society with developed towns, work and culture."],["Harappan civilisation","An early urban civilisation of the Indian subcontinent."],"Remember DCT: drainage, crafts, trade.","Which feature is strongly linked with Harappan cities?",["Planned drainage","Airports","Printing presses","Railways"],"Planned drainage"],
    ["India's Cultural Roots","Understand the Vedas, schools of thought and shared traditions.",["Vedas","Ancient Indian collections of hymns and knowledge."],["Oral tradition","Knowledge passed by speaking and memorising."],"Make a roots-and-branches chart for ideas and traditions.","Knowledge passed by speaking is called?",["Oral tradition","Industrial record","Digital archive","Map scale"],"Oral tradition"],
    ["Unity in Diversity","Recognise India's variety and the connections that create unity.",["Diversity","The presence of many different cultures, languages or ways of life."],["Unity","A sense of togetherness despite differences."],"Find one difference and one shared connection in each example.","Many languages and shared festivals show?",["Unity in diversity","Isolation","Uniformity only","No culture"],"Unity in diversity"],
    ["Family and Community","Explain cooperation, roles and responsibility in social groups.",["Family","A group connected by relationships, care and responsibility."],["Community","People linked by place, interests or shared life."],"Rights and responsibilities travel together.","Which value strengthens a community?",["Cooperation","Neglect","Dishonesty","Isolation"],"Cooperation"],
    ["Grassroots Democracy — Governance","Understand rules, public institutions and citizen participation.",["Government","Institutions that make decisions and administer public affairs."],["Democracy","A system in which people participate in choosing representatives."],"Who decides, for whom, and how are they accountable?","In a democracy, representatives are chosen by?",["Citizens","Only judges","Foreign states","Machines"],"Citizens"],
    ["Grassroots Democracy — Local Government in Rural Areas","Describe Gram Sabha and Panchayat roles.",["Gram Sabha","All registered voters of a village or group of villages."],["Gram Panchayat","An elected rural local-government body."],"Sabha includes voters; Panchayat is the elected team.","Who belongs to the Gram Sabha?",["All registered village voters","Only the Sarpanch","Only officials","Only teachers"],"All registered village voters"],
    ["Grassroots Democracy — Local Government in Urban Areas","Compare Nagar Panchayat, Municipal Council and Corporation.",["Municipality","An urban local body that manages civic services."],["Ward","A local electoral division within a town or city."],"Bigger settlement, bigger urban local body.","A city is commonly divided into?",["Wards","Continents","Provinces only","Farms"],"Wards"],
    ["The Value of Work","Respect different forms of work and distinguish paid and unpaid work.",["Economic activity","Work involving production, distribution or exchange of goods and services."],["Non-economic activity","Work done from care, duty or service without payment."],"Value work by its contribution, not only its salary.","Caring for a family member without pay is usually?",["Non-economic activity","Factory production","Trade","Taxation"],"Non-economic activity"],
    ["Economic Activities Around Us","Classify primary, secondary and tertiary activities.",["Primary sector","Activities using natural resources directly."],["Tertiary sector","Activities providing services."],"Farm → factory → service: primary → secondary → tertiary.","Banking belongs to which sector?",["Primary","Secondary","Tertiary","None"],"Tertiary"]
  ]}
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const $ = (id) => document.getElementById(id);
const storageKey = "scrutiny_class6_progress_v1";
const mistakeKey = "scrutiny_class6_mistakes_v1";
let state = { subjects: [], activeSubject: "", chapter: 0, view: "learn", completed: JSON.parse(localStorage.getItem(storageKey) || "{}"), mistakes: JSON.parse(localStorage.getItem(mistakeKey) || "[]") };

const esc = (value) => String(value ?? "").replace(/[&<>"']/g, (char) => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"})[char]);
function chapterData(){ return SUBJECTS[state.activeSubject].chapters[state.chapter]; }
function chapterKey(){ return `${state.activeSubject}:${state.chapter}`; }

function renderSubjects(){
  $("subjectTabs").innerHTML = state.subjects.map((id) => `<button type="button" data-subject="${id}" class="${id===state.activeSubject?"active":""}">${SUBJECTS[id].icon} ${SUBJECTS[id].name}</button>`).join("");
  $("subjectTabs").querySelectorAll("button").forEach((button) => button.onclick = () => { state.activeSubject=button.dataset.subject; state.chapter=0; state.view="learn"; render(); });
}

function renderChapters(){
  const subject=SUBJECTS[state.activeSubject];
  $("subjectTitle").textContent=subject.name;
  $("chapterList").innerHTML=subject.chapters.map((chapter,index)=>`<button type="button" data-chapter="${index}" class="${index===state.chapter?"active":""}"><b>${String(index+1).padStart(2,"0")}</b><span>${esc(chapter[0])}</span><i>${state.completed[`${state.activeSubject}:${index}`]?"✓":""}</i></button>`).join("");
  $("chapterList").querySelectorAll("button").forEach(button=>button.onclick=()=>{state.chapter=Number(button.dataset.chapter);state.view="learn";render();});
}

function renderLesson(){
  const subject=SUBJECTS[state.activeSubject], chapter=chapterData();
  $("chapterNumber").textContent=String(state.chapter+1).padStart(2,"0");
  $("bookName").textContent=subject.book;
  $("chapterTitle").textContent=chapter[0];
  $("chapterGoal").textContent=chapter[1];
  document.querySelectorAll("[data-view]").forEach(button=>button.classList.toggle("active",button.dataset.view===state.view));
  const facts=[chapter[2],chapter[3]];
  if(state.view==="learn") $("lessonContent").innerHTML=`<div class="learn-card"><h3>What you will understand</h3><p>${esc(chapter[1])}</p><div class="concept-grid">${facts.map(f=>`<div class="concept"><strong>${esc(f[0])}</strong><p>${esc(f[1])}</p></div>`).join("")}</div><button class="complete-btn" id="completeChapter" type="button">${state.completed[chapterKey()]?"COMPLETED ✓":"MARK CHAPTER COMPLETE"}</button></div>`;
  if(state.view==="tricks") $("lessonContent").innerHTML=`<div class="trick-card"><h3>🧠 Memory trick</h3><p><strong>${esc(chapter[4])}</strong></p><p>Say it aloud, write it once, then explain it without looking.</p></div>`;
  if(state.view==="flashcards") $("lessonContent").innerHTML=`<div class="flash-grid">${facts.map((f,i)=>`<button class="flashcard" type="button"><span>TAP TO REVEAL · CARD ${i+1}</span><strong class="question">What is ${esc(f[0])}?</strong><strong class="answer">${esc(f[1])}</strong></button>`).join("")}</div>`;
  if(state.view==="questions") $("lessonContent").innerHTML=`<div class="qa-list"><details class="qa-card"><summary>1. Explain ${esc(facts[0][0])}.</summary><p>${esc(facts[0][1])}</p></details><details class="qa-card"><summary>2. What is the main learning goal of this chapter?</summary><p>${esc(chapter[1])} A good answer should use the keywords <strong>${esc(facts[0][0])}</strong> and <strong>${esc(facts[1][0])}</strong>.</p></details><details class="qa-card"><summary>3. Write one exam-ready comparison or example.</summary><p>${esc(facts[0][0])}: ${esc(facts[0][1])} ${esc(facts[1][0])}: ${esc(facts[1][1])}</p></details></div>`;
  if(state.view==="mcqs") $("lessonContent").innerHTML=`<div class="mcq-list"><div class="mcq-card"><h3>1. ${esc(chapter[5])}</h3><div class="options">${chapter[6].map(option=>`<button type="button" data-option="${esc(option)}">${esc(option)}</button>`).join("")}</div><p class="mcq-feedback"></p></div></div>`;
  bindLessonActions(chapter);
}

function bindLessonActions(chapter){
  $("completeChapter")?.addEventListener("click",()=>{state.completed[chapterKey()]=true;localStorage.setItem(storageKey,JSON.stringify(state.completed));render();});
  document.querySelectorAll(".flashcard").forEach(card=>card.onclick=()=>card.classList.toggle("flipped"));
  document.querySelectorAll("[data-option]").forEach(button=>button.onclick=()=>{
    const chosen=button.dataset.option, correct=String(chapter[7]);
    document.querySelectorAll("[data-option]").forEach(item=>{item.disabled=true;if(item.dataset.option===correct)item.classList.add("correct");});
    const feedback=document.querySelector(".mcq-feedback");
    if(chosen===correct){button.classList.add("correct");feedback.textContent="Correct! Well done.";}
    else {button.classList.add("wrong");feedback.textContent=`Not quite. Correct answer: ${correct}.`;state.mistakes.unshift({subject:SUBJECTS[state.activeSubject].name,chapter:chapter[0],question:chapter[5],answer:correct});state.mistakes=state.mistakes.slice(0,30);localStorage.setItem(mistakeKey,JSON.stringify(state.mistakes));renderMistakes();}
  });
}

function renderProgress(){
  const total=state.subjects.reduce((sum,id)=>sum+SUBJECTS[id].chapters.length,0);
  const done=Object.keys(state.completed).filter(key=>state.completed[key]&&state.subjects.includes(key.split(":")[0])).length;
  const percent=total?Math.round(done/total*100):0;
  $("completedCount").textContent=`${done} of ${total} chapters`;
  $("masteryScore").textContent=`${percent}%`;
  $("progressBar").style.width=`${percent}%`;
}
function renderMistakes(){
  $("mistakeList").innerHTML=state.mistakes.length?state.mistakes.slice(0,6).map(item=>`<div class="mistake-item"><strong>${esc(item.subject)} · ${esc(item.chapter)}</strong><br>${esc(item.question)}<br><b>Correct: ${esc(item.answer)}</b></div>`).join(""):"<p>No mistakes yet. Start practising!</p>";
}
function render(){renderSubjects();renderChapters();renderLesson();renderProgress();renderMistakes();}
document.querySelectorAll("[data-view]").forEach(button=>button.onclick=()=>{state.view=button.dataset.view;renderLesson();});
$("logoutBtn").onclick=async()=>{await signOut(auth);location.replace("login.html");};

onAuthStateChanged(auth,async(user)=>{
  if(!user){location.replace("login.html");return;}
  try{
    const [token,snapshot]=await Promise.all([getIdTokenResult(user,true),getDoc(doc(db,"students",user.uid))]);
    const profile=snapshot.exists()?snapshot.data():{};
    const entitlement=profile.courseEntitlements?.class6;
    const founder=token.claims.founder===true;
    if(!founder && entitlement?.status!=="active"){location.replace("payment.html?course=class6");return;}
    if(!founder && entitlement?.expiresAt?.toDate && entitlement.expiresAt.toDate()<new Date()){location.replace("payment.html?course=class6");return;}
    state.subjects=founder?Object.keys(SUBJECTS):(entitlement?.selectedSubjects||[]).filter(id=>SUBJECTS[id]);
    if(!state.subjects.length){location.replace("payment.html?course=class6");return;}
    state.activeSubject=state.subjects[0];
    $("studentLabel").textContent=`Hi, ${profile.name||user.displayName||"Student"}`;
    $("loadingState").hidden=true;$("portal").hidden=false;render();
  }catch(error){console.error(error);$("loadingState").innerHTML="<strong>We could not open your course.</strong><p>Please refresh or contact Scrutiny Academy support.</p>";}
});
