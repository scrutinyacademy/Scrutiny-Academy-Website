import { firebaseConfig } from './firebase-config.js';
import { courseById, verifiedCourses } from './course-catalog.js';
import { initializeApp } from 'https://www.gstatic.com/firebasejs/10.14.1/firebase-app.js';
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, sendEmailVerification, sendPasswordResetEmail, onAuthStateChanged } from 'https://www.gstatic.com/firebasejs/10.14.1/firebase-auth.js';
import { getFirestore, doc, setDoc, getDoc, serverTimestamp } from 'https://www.gstatic.com/firebasejs/10.14.1/firebase-firestore.js';

const configured = firebaseConfig.apiKey && firebaseConfig.apiKey !== 'REPLACE_ME' && firebaseConfig.projectId !== 'REPLACE_ME';
const $ = id => document.getElementById(id);
const msg = (text, kind='') => { const el=$('authMessage'); if(!el) return; el.textContent=text; el.className=`message ${kind}`; };
let authActionInProgress = false;

const loginTab=$('loginTab'), registerTab=$('registerTab'), loginForm=$('loginForm'), registerForm=$('registerForm');
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

  onAuthStateChanged(auth, async user=>{
    // Account creation signs the new user in before the Firestore profile write
    // finishes. Let the active form handler complete that write and redirect.
    if(!user || authActionInProgress) return;
    try {
      const snap=await getDoc(doc(db,'students',user.uid));
      const profile=snap.exists()?snap.data():{};
      if(verifiedCourses(profile).length) location.replace('student.html');
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
      if(verifiedCourses(p).length) location.replace('student.html'); else location.replace(`payment.html?course=${encodeURIComponent(p.activeCourse || '')}`);
    }catch(err){ authActionInProgress=false; msg(friendly(err),'error'); console.error(err); }
  });

  registerForm?.addEventListener('submit',async e=>{
    e.preventDefault(); authActionInProgress=true; msg('Creating your account…');
    try{
      const email=$('regEmail').value.trim().toLowerCase();
      const activeCourse=$('regCourse').value;
      const course=courseById(activeCourse);
      if(!course) throw new Error('Choose an available course.');
      const cred=await createUserWithEmailAndPassword(auth,email,$('regPassword').value);
      await setDoc(doc(db,'students',cred.user.uid),{
        uid:cred.user.uid,
        name:$('regName').value.trim(),
        phone:$('regPhone').value.trim(),
        email,
        role:'student',
        accessStatus:'pending',
        accessPrice:course.price,
        paymentStatus:'not_submitted',
        activeCourse,
        enrolledCourses:[],
        courseEntitlements:{},
        createdAt:serverTimestamp(),
        updatedAt:serverTimestamp()
      });
      await sendEmailVerification(cred.user);
      msg('Account created. Verification email sent. Opening payment page…','success');
      setTimeout(()=>location.replace('payment.html'),900);
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
    try{ await sendPasswordResetEmail(auth,email); msg('Password reset email sent.','success'); }
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
