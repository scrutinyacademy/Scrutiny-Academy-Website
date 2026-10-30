// Optional identity only. No entitlement, payment or existing profile writes.
import {firebaseConfig} from './firebase-config.js';
try {
  const [{initializeApp,getApps,getApp},{getAuth,onAuthStateChanged}]=await Promise.all([
    import('https://www.gstatic.com/firebasejs/10.14.1/firebase-app.js'),
    import('https://www.gstatic.com/firebasejs/10.14.1/firebase-auth.js')]);
  const app=getApps().length?getApp():initializeApp(firebaseConfig);
  onAuthStateChanged(getAuth(app),user=>{window.__cbseAccount=user?{uid:user.uid}:null;window.__cbseAccountReady=true;window.dispatchEvent(new Event('cbse:account'));});
}catch{window.__cbseAccountReady=true;window.dispatchEvent(new Event('cbse:account'));}
