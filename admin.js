import { firebaseConfig, SCRUTINY_ADMIN_EMAILS } from './firebase-config.js';
import { initializeApp } from 'https://www.gstatic.com/firebasejs/10.14.1/firebase-app.js';
import { getAuth, onAuthStateChanged, signOut } from 'https://www.gstatic.com/firebasejs/10.14.1/firebase-auth.js';
import { getFirestore, collection, getDocs } from 'https://www.gstatic.com/firebasejs/10.14.1/firebase-firestore.js';

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const $ = id => document.getElementById(id);
const esc = v => String(v ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const msg = (t, k='') => { const e=$('adminMessage'); e.textContent=t; e.className=`message ${k}`; };

onAuthStateChanged(auth, async user => {
  if (!user) { location.replace('login.html'); return; }
  const isAdmin = SCRUTINY_ADMIN_EMAILS.map(x => x.toLowerCase()).includes((user.email || '').toLowerCase());
  if (!isAdmin) {
    msg('This account is not authorized for the admin panel.', 'error');
    $('requestRows').innerHTML = '<tr><td colspan="4">Access denied.</td></tr>';
    return;
  }
  await loadStudents();
});

async function loadStudents() {
  try {
    const [studentsSnap, requestsSnap] = await Promise.all([
      getDocs(collection(db, 'students')),
      getDocs(collection(db, 'paymentRequests')),
    ]);
    const students = new Map();
    studentsSnap.forEach(d => students.set(d.id, d.data()));
    const rows = [];
    requestsSnap.forEach(d => {
      const req = d.data();
      const p = students.get(req.uid) || {};
      const paymentStatus = req.status || 'pending';
      const accessStatus = p.courseEntitlements?.[req.courseId]?.status || 'pending';
      const orderId = req.orderId || '—';
      const paymentId = req.paymentId || '—';
      const amount = req.amount || '—';
      rows.push(`<tr>
        <td><strong>${esc(p.name || 'Student')}</strong><br>${esc(p.email || '')}<br>${esc(p.phone || '')}</td>
        <td><strong>${esc(req.courseName || req.courseId || 'Course')}</strong><br>₹${esc(amount)}<br><span class="status-pill ${paymentStatus === 'paid' ? 'active' : 'pending'}">${esc(paymentStatus.toUpperCase())}</span></td>
        <td><span class="status-pill ${accessStatus === 'active' ? 'active' : 'pending'}">${esc(accessStatus.toUpperCase())}</span></td>
        <td><small>Order: ${esc(orderId)}</small><br><small>Payment: ${esc(paymentId)}</small></td>
      </tr>`);
    });
    $('requestRows').innerHTML = rows.length ? rows.join('') : '<tr><td colspan="4">No student accounts yet.</td></tr>';
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
