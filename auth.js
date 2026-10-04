import { firebaseConfig } from './firebase-config.js';
import { COURSE_CATALOG, currentCoursePrice } from './course-catalog.js?v=2';
import { initializeApp } from 'https://www.gstatic.com/firebasejs/10.14.1/firebase-app.js';
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, sendPasswordResetEmail, onAuthStateChanged, getIdTokenResult } from 'https://www.gstatic.com/firebasejs/10.14.1/firebase-auth.js';
import { getFirestore, doc, setDoc, getDoc, serverTimestamp } from 'https://www.gstatic.com/firebasejs/10.14.1/firebase-firestore.js';
import { getFunctions, httpsCallable } from 'https://www.gstatic.com/firebasejs/10.14.1/firebase-functions.js';

const configured = firebaseConfig.apiKey && firebaseConfig.apiKey !== 'REPLACE_ME' && firebaseConfig.projectId !== 'REPLACE_ME';
const $ = id => document.getElementById(id);
const msg = (text, kind='') => { const el=$('authMessage'); if(!el) return; el.textContent=text; el.className=`message ${kind}`; };
let authActionInProgress = false;
let studentOfferActive = true;

const loginTab=$('loginTab'), registerTab=$('registerTab'), loginForm=$('loginForm'), registerForm=$('registerForm');
const courseSelect=$('regCourse'), neetYearWrap=$('neetYearWrap'), neetYear=$('regNeetYear'), selectionSummary=$('courseSelectionSummary');
function updateCourseSelection(){
  const courseId=courseSelect?.value;
  const course=COURSE_CATALOG[courseId];
  const isNeet=courseId==='neet';
  if(neetYearWrap){ neetYearWrap.hidden=!isNeet; neetYear.required=isNeet; if(!isNeet) neetYear.value=''; }
  if(selectionSummary){
    if(!course){ selectionSummary.hidden=true; return; }
    const price=currentCoursePrice(courseId,studentOfferActive);
    selectionSummary.hidden=false;
    selectionSummary.innerHTML=`<strong>${course.name} · ₹${price}</strong><span>${course.includes.join(' • ')}</span><small>${isNeet ? 'Choose NEET 2027 or 2028 to set your validity.' : course.validity}</small>`;
  }
}
courseSelect?.addEventListener('change',updateCourseSelection);
function updateOfferPresentation(status={active:true,remaining:100,limit:100}){
  studentOfferActive=status.active!==false;
  Object.entries(COURSE_CATALOG).forEach(([id,course])=>{
    const price=currentCoursePrice(id,studentOfferActive);
    const option=courseSelect?.querySelector(`option[value="${id}"]`);
    if(option) option.textContent=`${course.name} — ${studentOfferActive?'Student offer':'Regular price'} ₹${price.toLocaleString('en-IN')}`;
    const card=document.querySelector(`[data-offer-card="${id}"]`);
    if(!card) return;
    card.classList.toggle('offer-ended',!studentOfferActive);
    if(!studentOfferActive){
      card.querySelector('.plan-price').innerHTML=`₹${price.toLocaleString('en-IN')} <small>regular price</small>`;
      const action=card.querySelector('a[data-select-course]');
      if(action) action.textContent='SELECT COURSE';
    }
  });
  const statusText=document.getElementById('studentOfferStatus');
  if(statusText) statusText.textContent=studentOfferActive
    ? `${status.remaining} of the first ${status.limit} website-wide student offer places remain. The offer ends automatically when Scrutiny Academy reaches ${status.limit} paid students.`
    : `The first ${status.limit} paid-student launch offer is complete. Regular course prices now apply.`;
  updateCourseSelection();
}
function activate(mode){
  const login = mode==='login';
  loginTab?.classList.toggle('active',login); registerTab?.classList.toggle('active',!login);
  loginTab?.setAttribute('aria-selected',String(login)); registerTab?.setAttribute('aria-selected',String(!login));
  loginForm?.classList.toggle('active',login); registerForm?.classList.toggle('active',!login); msg('');
}
loginTab?.addEventListener('click',()=>activate('login'));
registerTab?.addEventListener('click',()=>activate('register'));
document.querySelectorAll('[data-auth-mode]').forEach(control=>{
  control.addEventListener('click',()=>{
    activate(control.dataset.authMode==='register'?'register':'login');
    document.getElementById('authCard')?.scrollIntoView({behavior:'smooth',block:'center'});
  });
});

if(!configured){
  document.querySelectorAll('form button[type="submit"]').forEach(b=>b.disabled=true);
  msg('Firebase configuration is unavailable. Please contact scrutinyacademy@gmail.com.','error');
} else {
  const app=initializeApp(firebaseConfig), auth=getAuth(app), db=getFirestore(app);
  const getOfferStatus=httpsCallable(getFunctions(app,'asia-south1'),'getStudentOfferStatus');
  getOfferStatus().then(({data})=>updateOfferPresentation(data)).catch(error=>console.warn('Student offer status unavailable:',error));

  onAuthStateChanged(auth, async user=>{
    // Account creation signs the new user in before the Firestore profile write
    // finishes. Let the active form handler complete that write and redirect.
    if(!user || authActionInProgress) return;
    try {
      const snap=await getDoc(doc(db,'students',user.uid));
      const profile=snap.exists()?snap.data():{};
      const founder=(await getIdTokenResult(user,true)).claims.founder===true;
      if(profile.accessStatus==='active'||founder) location.replace('student.html');
      else if(location.pathname.endsWith('login.html') || /\/$/.test(location.pathname) || location.pathname.endsWith('index.html')) location.replace('payment.html');
    } catch (err) {
      console.error('Scrutiny Academy profile check failed:', err);
    }
  });

  loginForm?.addEventListener('submit',async e=>{
    e.preventDefault(); authActionInProgress=true; msg('Signing in…');
    try{
      const cred=await signInWithEmailAndPassword(auth,$('loginEmail').value.trim(),$('loginPassword').value);
      const snap=await getDoc(doc(db,'students',cred.user.uid));
      const p=snap.exists()?snap.data():{};
      const founder=(await getIdTokenResult(cred.user,true)).claims.founder===true;
      if(p.accessStatus==='active'||founder) location.replace('student.html'); else location.replace('payment.html');
    }catch(err){ authActionInProgress=false; msg(friendly(err),'error'); console.error(err); }
  });

  registerForm?.addEventListener('submit',async e=>{
    e.preventDefault(); authActionInProgress=true; msg('Creating your account…');
    try{
      const email=$('regEmail').value.trim().toLowerCase();
      const activeCourse=courseSelect.value;
      const selectedCourse=COURSE_CATALOG[activeCourse];
      const selectedNeetYear=activeCourse==='neet'?neetYear.value:'';
      if(!selectedCourse) throw new Error('Choose a valid course.');
      if(activeCourse==='neet' && !['2027','2028'].includes(selectedNeetYear)) throw new Error('Choose the NEET exam year you are preparing for.');
      const cred=await createUserWithEmailAndPassword(auth,email,$('regPassword').value);
      await setDoc(doc(db,'students',cred.user.uid),{
        uid:cred.user.uid,
        name:$('regName').value.trim(),
        phone:$('regPhone').value.trim(),
        email,
        role:'student',
        accessStatus:'pending',
        accessPrice:currentCoursePrice(activeCourse,studentOfferActive),
        paymentStatus:'not_submitted',
        activeCourse,
        requestedCourse:activeCourse,
        neetExamYear:selectedNeetYear || null,
        enrolledCourses:[],
        courseEntitlements:{},
        createdAt:serverTimestamp(),
        updatedAt:serverTimestamp()
      });
      msg('Account created. Continue to secure payment to unlock your selected course.','success');
      const paymentQuery = new URLSearchParams({ course: activeCourse });
      if (selectedNeetYear) paymentQuery.set('exam', selectedNeetYear);
      location.replace(`payment.html?${paymentQuery}`);
    }catch(err){
      authActionInProgress=false;
      console.error('Scrutiny Academy registration failed:',err);
      const code=err?.code||err?.name||'unknown-error';
      msg(`${friendly(err)} [${code}]`,'error');
    }
  });

  $('forgotPassword')?.addEventListener('click',async()=>{
    const email=$('loginEmail').value.trim();
    if(!email){ msg('Enter your email first, then tap Forgot password.','error'); return; }
    try{ await sendPasswordResetEmail(auth,email); msg('Password reset email sent. Check your Gmail Inbox, Spam or Promotions folder.','success'); }
    catch(err){ msg(`${friendly(err)} [${err?.code||'unknown-error'}]`,'error'); console.error(err); }
  });
}

function friendly(err){
  const code=err?.code||'';
  const map={
    'auth/invalid-credential':'Email or password is incorrect.',
    'auth/email-already-in-use':'An account already exists with this email.',
    'auth/weak-password':'Use a stronger password with at least 8 characters.',
    'auth/invalid-email':'Enter a valid email address.',
    'auth/too-many-requests':'Too many attempts. Please try again later.',
    'auth/network-request-failed':'Network error. Check your internet connection.',
    'auth/operation-not-allowed':'Email/password sign-up is not enabled in Firebase Authentication.',
    'auth/unauthorized-domain':'This website domain is not authorized in Firebase Authentication.',
    'auth/api-key-not-valid.-please-pass-a-valid-api-key.':'Firebase rejected the web API key.',
    'permission-denied':'The account was created, but Firestore security rules rejected the student profile.'
  };
  return map[code]||err?.message||'Something went wrong. Please try again or contact scrutinyacademy@gmail.com.';
}
