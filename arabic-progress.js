const PREFIX='scrutiny_arabic_v1:';
let owner='guest';
const memory=new Map();
export const empty=()=>({version:1,completed:[],scores:{},mistakes:[],lastLesson:'',bookmarks:[],resume:''});
export function clean(raw){const s=empty();if(!raw||raw.version!==1)return s;for(const k of ['completed','mistakes','bookmarks'])s[k]=[...new Set(Array.isArray(raw[k])?raw[k].filter(v=>typeof v==='string'&&v.length<100):[])].slice(0,120);for(const [k,v] of Object.entries(raw.scores||{}).slice(0,120))if(/^[\w-]{1,80}$/.test(k)&&Number.isFinite(v)&&v>=0&&v<=100)s.scores[k]=v;for(const k of ['lastLesson','resume'])if(typeof raw[k]==='string')s[k]=raw[k].slice(0,100);return s;}
export function load(){try{return clean(JSON.parse(localStorage.getItem(PREFIX+owner))||memory.get(owner));}catch{return clean(memory.get(owner));}}
export function save(s){memory.set(owner,clean(s));try{localStorage.setItem(PREFIX+owner,JSON.stringify(clean(s)));return true;}catch{document.getElementById('saveStatus')?.replaceChildren('Storage unavailable: progress lasts only while this page stays open.');return false;}}
export function update(fn){const s=load();fn(s);save(s);return s;}
export async function syncProgress(importGuest=false){
 const [{firebaseConfig},app,auth,fire]=await Promise.all([import('./firebase-config.js'),import('https://www.gstatic.com/firebasejs/10.14.1/firebase-app.js'),import('https://www.gstatic.com/firebasejs/10.14.1/firebase-auth.js'),import('https://www.gstatic.com/firebasejs/10.14.1/firebase-firestore.js')]);
 const instance=app.getApps().length?app.getApp():app.initializeApp(firebaseConfig),a=auth.getAuth(instance);await a.authStateReady();const user=a.currentUser;if(!user)throw Error('Sign in with your existing account first, then return here. Guest lessons remain free.');
 const guest=owner==='guest'?load():empty();owner=user.uid;localStorage.setItem(PREFIX+'sync','yes');const local=load(),ref=fire.doc(fire.getFirestore(instance),'arabicProgress',owner),remote=await fire.getDoc(ref);if(a.currentUser?.uid!==owner)throw Error('Account changed. Reload before synchronizing.');const cloud=remote.exists()?clean(remote.data().progress):empty();const sources=[cloud,local,...(importGuest?[guest]:[])],out=empty();for(const s of sources){for(const k of ['completed','mistakes','bookmarks'])out[k]=[...new Set([...out[k],...s[k]])];Object.assign(out.scores,s.scores);if(s.lastLesson)out.lastLesson=s.lastLesson;if(s.resume)out.resume=s.resume;}save(out);await fire.setDoc(ref,{progress:clean(out),updatedAt:fire.serverTimestamp()});return out;
}
// Only opt-in sync users load Firebase; guest learning never waits for it.
export async function restoreIdentity(){
 try{if(localStorage.getItem(PREFIX+'sync')!=='yes')return;const [{firebaseConfig},app,auth]=await Promise.all([import('./firebase-config.js'),import('https://www.gstatic.com/firebasejs/10.14.1/firebase-app.js'),import('https://www.gstatic.com/firebasejs/10.14.1/firebase-auth.js')]);const a=auth.getAuth(app.getApps().length?app.getApp():app.initializeApp(firebaseConfig));await a.authStateReady();owner=a.currentUser?.uid||'guest';auth.onAuthStateChanged(a,user=>{const next=user?.uid||'guest';if(next!==owner){owner=next;location.reload();}});}catch{owner='guest';}
}
