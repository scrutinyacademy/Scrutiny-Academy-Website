import { firebaseConfig, SCRUTINY_ADMIN_EMAILS } from './firebase-config.js';
import { initializeApp } from 'https://www.gstatic.com/firebasejs/10.14.1/firebase-app.js';
import { getAuth, onAuthStateChanged, signOut } from 'https://www.gstatic.com/firebasejs/10.14.1/firebase-auth.js';
import { getFirestore, collection, getDocs } from 'https://www.gstatic.com/firebasejs/10.14.1/firebase-firestore.js';
import { getFunctions, httpsCallable } from 'https://www.gstatic.com/firebasejs/10.14.1/firebase-functions.js';

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const setNeetssAccess = httpsCallable(getFunctions(app, 'asia-south1'), 'setNeetssComplimentaryAccess');
const $ = id => document.getElementById(id);
const esc = v => String(v ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const msg = (t, k='') => { const e=$('adminMessage'); e.textContent=t; e.className=`message ${k}`; };

onAuthStateChanged(auth, async user => {
  if (!user) { location.replace('login.html'); return; }
  const isAdmin = SCRUTINY_ADMIN_EMAILS.map(x => x.toLowerCase()).includes((user.email || '').toLowerCase());
  if (!isAdmin) {
    msg('This account is not authorized for the admin panel.', 'error');
    $('requestRows').innerHTML = '<tr><td colspan="5">Access denied.</td></tr>';
    return;
  }
  await loadStudents();
});

async function loadStudents() {
  try {
    const [studentsSnap, requestsSnap, neetssSnap] = await Promise.all([
      getDocs(collection(db, 'students')),
      getDocs(collection(db, 'paymentRequests')),
      getDocs(collection(db, 'neetssAccessRequests')),
    ]);
    const neetssRequests = new Map(neetssSnap.docs.map(item => [item.id, item.data()]));
    const requests = new Map();
    requestsSnap.forEach(d => {
      const value=d.data();
      if(!requests.has(value.uid)) requests.set(value.uid,[]);
      requests.get(value.uid).push(value);
    });
    const rows = [];
    studentsSnap.forEach(d => {
      const p = d.data();
      const studentRequests = requests.get(d.id) || [];
      const req = studentRequests.find(item=>item.status==='paid') || studentRequests[0] || {};
      const pay = p.payment || {};
      const paymentStatus = p.paymentStatus || req.status || 'not_submitted';
      const accessStatus = p.accessStatus || 'pending';
      const orderId = pay.orderId || req.orderId || '—';
      const paymentId = pay.paymentId || req.paymentId || '—';
      const amount = pay.amount || req.amount || p.accessPrice || 59;
      const owned=Object.values(p.courseEntitlements||{}).filter(item=>item?.status==='active');
      const course = owned.map(item=>item.courseName||item.courseId).join(', ') || req.courseName || p.requestedCourse || p.activeCourse || '—';
      const validity = owned.map(item=>item.validityLabel).filter(Boolean).join(' · ') || req.validityCode || (p.neetExamYear ? `NEET ${p.neetExamYear}` : '—');
      const neetssActive=p.courseEntitlements?.neetss?.status==='active';
      const neetssRequest=neetssRequests.get(d.id);
      rows.push(`<tr>
        <td><strong>${esc(p.name || 'Student')}</strong><br>${esc(p.email || '')}<br>${esc(p.phone || '')}</td>
        <td><strong>${esc(course)}</strong><br><small>${esc(validity)}</small></td>
        <td>₹${esc(amount)}<br><span class="status-pill ${paymentStatus === 'verified' ? 'active' : 'pending'}">${esc(paymentStatus.toUpperCase())}</span></td>
        <td><span class="status-pill ${accessStatus === 'active' ? 'active' : 'pending'}">${esc(accessStatus.toUpperCase())}</span></td>
        <td><small>Order: ${esc(orderId)}</small><br><small>Payment: ${esc(paymentId)}</small>${neetssRequest?`<br><small>NEET-SS: ${esc(neetssRequest.status)}</small>`:''}<br><button class="ghost" type="button" data-neetss-uid="${esc(d.id)}" data-neetss-active="${neetssActive?'false':'true'}">${neetssActive?'REVOKE NEET-SS':'GRANT NEET-SS'}</button></td>
      </tr>`);
    });
    $('requestRows').innerHTML = rows.length ? rows.join('') : '<tr><td colspan="5">No student accounts yet.</td></tr>';
    document.querySelectorAll('[data-neetss-uid]').forEach(button=>button.addEventListener('click',async()=>{
      button.disabled=true; msg('Updating complimentary NEET-SS access…');
      try { await setNeetssAccess({uid:button.dataset.neetssUid,active:button.dataset.neetssActive==='true'}); await loadStudents(); }
      catch(error){ console.error(error); button.disabled=false; msg(error?.message||'Could not update NEET-SS access.','error'); }
    }));
    msg('Razorpay payments activate access automatically after secure server verification.', 'success');
  } catch (err) {
    console.error(err);
    msg('Could not load student payment status. Check deployed Firestore rules.', 'error');
  }
}

$('logoutBtn').onclick = async () => {
  await signOut(auth);
  location.replace('login.html');
};
