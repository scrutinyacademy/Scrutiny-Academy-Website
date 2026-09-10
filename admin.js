import { firebaseConfig, SCRUTINY_ADMIN_EMAILS } from './firebase-config.js';
import { initializeApp } from 'https://www.gstatic.com/firebasejs/10.14.1/firebase-app.js';
import { getAuth, onAuthStateChanged, signOut } from 'https://www.gstatic.com/firebasejs/10.14.1/firebase-auth.js';
import { getFirestore, collection, query, where, getDocs, doc, updateDoc, serverTimestamp } from 'https://www.gstatic.com/firebasejs/10.14.1/firebase-firestore.js';
const app=initializeApp(firebaseConfig),auth=getAuth(app),db=getFirestore(app),$=id=>document.getElementById(id);
const esc=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const msg=(t,k='')=>{const e=$('adminMessage');e.textContent=t;e.className=`message ${k}`};
let isAdmin=false;
onAuthStateChanged(auth,async user=>{
  if(!user){location.replace('login.html');return}
  isAdmin=SCRUTINY_ADMIN_EMAILS.map(x=>x.toLowerCase()).includes((user.email||'').toLowerCase());
  if(!isAdmin){msg('This account is not authorized for the admin panel.','error');$('requestRows').innerHTML='<tr><td colspan="4">Access denied.</td></tr>';return}
  await loadRequests();
});
async function loadRequests(){
  try{
    const q=query(collection(db,'students'),where('paymentStatus','==','submitted'));
    const snap=await getDocs(q), rows=[];
    snap.forEach(d=>{const p=d.data(),pay=p.payment||{};rows.push(`<tr><td><strong>${esc(p.name||'Student')}</strong><br>${esc(p.email||'')}<br>${esc(p.phone||'')}</td><td>₹${esc(pay.amount||'')}<br>UTR: <strong>${esc(pay.utr||'')}</strong><br>${esc(pay.date||'')}</td><td><span class="status-pill ${p.accessStatus==='active'?'active':p.accessStatus==='rejected'?'rejected':'pending'}">${esc((p.accessStatus||'pending').toUpperCase())}</span></td><td><div class="action-row"><button class="primary approve" data-id="${d.id}">Approve</button><button class="ghost reject" data-id="${d.id}">Reject</button></div></td></tr>`)});
    $('requestRows').innerHTML=rows.length?rows.join(''):'<tr><td colspan="4">No submitted payment requests.</td></tr>';
    document.querySelectorAll('.approve').forEach(b=>b.onclick=()=>setStatus(b.dataset.id,'active'));
    document.querySelectorAll('.reject').forEach(b=>b.onclick=()=>setStatus(b.dataset.id,'rejected'));
  }catch(err){console.error(err);msg('Could not load payment requests. Check Firebase rules and indexes.','error')}
}
async function setStatus(uid,status){
  if(!isAdmin)return;
  const action=status==='active'?'approve':'reject';
  if(!confirm(`Are you sure you want to ${action} this student access request?`))return;
  try{
    await updateDoc(doc(db,'students',uid),{accessStatus:status,paymentStatus:status==='active'?'verified':'rejected',verifiedAt:serverTimestamp(),updatedAt:serverTimestamp()});
    msg(`Student access ${status==='active'?'approved':'rejected'}.`,'success');await loadRequests();
  }catch(err){console.error(err);msg('Could not update this student.','error')}
}
$('logoutBtn').onclick=async()=>{await signOut(auth);location.replace('login.html')};
