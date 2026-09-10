import { firebaseConfig } from './firebase-config.js';
import { initializeApp } from 'https://www.gstatic.com/firebasejs/10.14.1/firebase-app.js';
import { getAuth, onAuthStateChanged, signOut } from 'https://www.gstatic.com/firebasejs/10.14.1/firebase-auth.js';
import { getFirestore, doc, getDoc } from 'https://www.gstatic.com/firebasejs/10.14.1/firebase-firestore.js';
const app=initializeApp(firebaseConfig),auth=getAuth(app),db=getFirestore(app),$=id=>document.getElementById(id);
onAuthStateChanged(auth,async user=>{
  if(!user){location.replace('login.html');return}
  const snap=await getDoc(doc(db,'students',user.uid));
  if(!snap.exists()){await signOut(auth);location.replace('login.html');return}
  const p=snap.data();
  if(p.accessStatus!=='active'){location.replace('payment.html');return}
  $('welcome').textContent=`Welcome${p.name?`, ${p.name}`:''}`;
  $('studentMeta').textContent=`${p.email||user.email} • Access status: Active`;
});
$('logoutBtn').onclick=async()=>{await signOut(auth);location.replace('login.html')};
