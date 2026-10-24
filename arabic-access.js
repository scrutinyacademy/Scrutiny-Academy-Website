import {firebaseConfig} from './firebase-config.js';
import {arabicMonthlyPrice, subscriptionPrice, entitledCourses} from './course-catalog.js?v=5';
import {getApps,getApp,initializeApp} from 'https://www.gstatic.com/firebasejs/10.14.1/firebase-app.js';
import {getAuth,getIdTokenResult,onAuthStateChanged} from 'https://www.gstatic.com/firebasejs/10.14.1/firebase-auth.js';
import {getFirestore,doc,getDoc} from 'https://www.gstatic.com/firebasejs/10.14.1/firebase-firestore.js';
import {getFunctions,httpsCallable} from 'https://www.gstatic.com/firebasejs/10.14.1/firebase-functions.js';
const money=n=>`₹${n.toLocaleString('en-IN',{maximumFractionDigits:2})}`;
let bundle;
const app=getApps().length?getApp():initializeApp(firebaseConfig),auth=getAuth(app);
export async function arabicData(name){
  bundle ||= httpsCallable(getFunctions(app,'asia-south1'),'getArabicCourseContent')().then(result=>result.data).catch(error=>{bundle=null;throw error;});
  const content=await bundle;
  if(!Object.hasOwn(content,name))throw Error('This learning resource is unavailable.');
  return content[name];
}
export async function requireArabicAccess(){
  await auth.authStateReady();
  const user=auth.currentUser;
  const snapshot=user?await getDoc(doc(getFirestore(app),'students',user.uid)):null;
  const profile=snapshot?.exists()?snapshot.data():{};
  const founder=user?(await getIdTokenResult(user)).claims.founder===true:false;
  const initialUid=user?.uid||null;
  onAuthStateChanged(auth,next=>{if((next?.uid||null)!==initialUid)location.reload();});
  if(founder || (user && entitledCourses(profile).includes('arabic')))return true;
  const eligible=!!user && arabicMonthlyPrice(profile)===299;
  const monthly=eligible?299:399;
  const target=document.getElementById('content');
  target.innerHTML=`<section class="hero arabic-intro"><span class="eyebrow">SCRUTINY ACADEMY · ARABIC &amp; QURAN</span><div class="intro-mark" lang="ar" dir="rtl" aria-hidden="true">ا ب ت</div><h1>A new language.<br>A meaningful beginning.</h1><p>Build a steady reading habit with clear, bite-sized lessons in Hindi, Hinglish, Urdu and English. Begin with the alphabet and grow one step at a time.</p><a class="button" href="#arabicPlans">Choose your learning plan ↓</a><div class="intro-facts"><span>28 alphabet lessons</span><span>4 language guides</span><span>Learn at your pace</span></div></section><section class="arabic-value grid"><article class="card"><span class="eyebrow">01 · RECOGNISE</span><h3>Meet each letter</h3><p>Explore letter shapes, dots and pronunciation guides, with common mistakes explained.</p></article><article class="card"><span class="eyebrow">02 · PRACTISE</span><h3>Turn practice into progress</h3><p>Use quizzes, revision and saved lesson progress to build your learning habit.</p></article><article class="card"><span class="eyebrow">03 · KEEP GROWING</span><h3>A thoughtful learning path</h3><p>Follow a seven-level roadmap towards reading. Verified Quran resources are still pending.</p></article></section><section class="card arabic-plans" id="arabicPlans"><span class="eyebrow">YOUR SUBSCRIPTION · YOUR PACE</span><h2>Start small. Keep learning.</h2><p>${eligible?'Your existing student benefit is ready.':'New Arabic-only registration'}</p><div class="arabic-rate">${eligible?'<s>₹399</s> ':''}<strong>${money(monthly)}</strong><span>/ month</span></div><p class="member-note">${eligible?'You save ₹100 every month with your existing Scrutiny account.':'Already registered for another Scrutiny course? Sign in to unlock ₹299/month.'}</p><div class="arabic-term-grid">${[1,3,6].map(months=>{const p=subscriptionPrice('arabic',months,eligible?profile:{});return `<label class="arabic-term"><input type="radio" name="arabicTerm" value="${months}" ${months===1?'checked':''}><span>${months} month${months===1?'':'s'}</span><strong>${money(p.total)}</strong><small>${p.discountPercent?`Save ${p.discountPercent}% · ${money(p.discount)} off`:'Regular monthly plan'}</small></label>`;}).join('')}</div><div id="arabicPaySummary" class="pay-summary" role="status" aria-live="polite"></div><a class="button" id="arabicSubscribe" href="${user?'payment.html?course=arabic&months=1':'index.html?course=arabic&months=1&mode=register#authCard'}">${user?'CONTINUE TO SECURE PAYMENT':'REGISTER & CONTINUE'} →</a>${!user?'<a class="member-login" href="index.html?course=arabic&mode=login#authCard">Already a student? Sign in for your ₹299 rate →</a>':''}<p class="fine-print">Pay upfront through Razorpay. Renew at expiry; no automatic deductions. Your selected subscription unlocks Arabic &amp; Quran only.</p></section><p class="notice">Please review before subscribing: pronunciation notes and lessons are practice drafts awaiting qualified Arabic/Quran teacher review. Verified Quran text, licensed recitations and lecture videos are pending. Transliteration is a learning aid; practise authentic pronunciation with a qualified teacher.</p>`;
  const update=()=>{
    const months=Number(document.querySelector('[name="arabicTerm"]:checked').value);
    const p=subscriptionPrice('arabic',months,eligible?profile:{});
    document.getElementById('arabicPaySummary').textContent=`${months} month${months===1?'':'s'} · Subtotal ${money(p.subtotal)}${p.discount?` · Save ${money(p.discount)} (${p.discountPercent}%)`:''} · Total payable ${money(p.total)}`;
    document.getElementById('arabicSubscribe').href=user?`payment.html?course=arabic&months=${months}`:`index.html?course=arabic&months=${months}&mode=register#authCard`;
  };
  document.querySelectorAll('[name="arabicTerm"]').forEach(input=>input.addEventListener('change',update));update();
  return false;
}
