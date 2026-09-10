import { firebaseConfig, SCRUTINY_ADMIN_EMAILS } from './firebase-config.js';
import { initializeApp } from 'https://www.gstatic.com/firebasejs/10.14.1/firebase-app.js';
import { getAuth, onAuthStateChanged } from 'https://www.gstatic.com/firebasejs/10.14.1/firebase-auth.js';
import { getFirestore, doc, getDoc } from 'https://www.gstatic.com/firebasejs/10.14.1/firebase-firestore.js';

const configured=firebaseConfig.apiKey && firebaseConfig.apiKey!=='REPLACE_ME' && firebaseConfig.projectId!=='REPLACE_ME';
if(!configured){
  console.warn('Scrutiny Academy auth gate is not configured yet. Preview remains accessible for development.');
  document.documentElement.classList.remove('auth-check');
} else {
  const app=initializeApp(firebaseConfig),auth=getAuth(app),db=getFirestore(app);
  onAuthStateChanged(auth,async user=>{
    if(!user){ location.replace('login.html'); return; }
    const admin=SCRUTINY_ADMIN_EMAILS.map(x=>x.toLowerCase()).includes((user.email||'').toLowerCase());
    if(admin){ document.documentElement.classList.remove('auth-check'); return; }
    const snap=await getDoc(doc(db,'students',user.uid));
    if(!snap.exists()||snap.data().accessStatus!=='active'){ location.replace('payment.html'); return; }
    document.documentElement.classList.remove('auth-check');
  });
}
