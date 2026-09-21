import { firebaseConfig } from './firebase-config.js';
import { initializeApp, getApps } from 'https://www.gstatic.com/firebasejs/10.14.1/firebase-app.js';
import { getFirestore, collection, getDocs, query, orderBy, limit } from 'https://www.gstatic.com/firebasejs/10.14.1/firebase-firestore.js';

const app=getApps()[0]||initializeApp(firebaseConfig);
const db=getFirestore(app);
const grid=document.getElementById('publicReviews');
const ratingEl=document.getElementById('publicRating');
const starsEl=document.getElementById('publicStars');
const countEl=document.getElementById('publicReviewCount');

const escapeHtml=value=>String(value??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const starText=n=>'★'.repeat(Math.max(0,Math.min(5,n)))+'☆'.repeat(5-Math.max(0,Math.min(5,n)));

async function loadReviews(){
  if(!grid) return;
  try{
    const snap=await getDocs(query(collection(db,'reviews'),orderBy('updatedAt','desc'),limit(12)));
    const reviews=snap.docs.map(d=>d.data()).filter(r=>Number(r.rating)>=1&&Number(r.rating)<=5&&r.review&&r.studentName);
    if(!reviews.length){
      ratingEl.textContent='New';
      starsEl.textContent='☆☆☆☆☆';
      countEl.textContent='No registered-student reviews yet';
      grid.innerHTML='<div class="review-empty">Be among the first registered students to share an honest review.</div>';
      return;
    }
    const average=reviews.reduce((sum,r)=>sum+Number(r.rating),0)/reviews.length;
    ratingEl.textContent=average.toFixed(1)+'/5';
    starsEl.textContent=starText(Math.round(average));
    countEl.textContent=reviews.length+' registered student review'+(reviews.length===1?'':'s');
    grid.innerHTML=reviews.slice(0,6).map(r=>`<article class="review-card"><div class="review-card-top"><span class="review-avatar">${escapeHtml(r.studentName.trim().charAt(0).toUpperCase())}</span><div><strong>${escapeHtml(r.studentName)}</strong><small>Registered student ✓</small></div><span class="review-stars">${starText(Number(r.rating))}</span></div><p>“${escapeHtml(r.review)}”</p></article>`).join('');
  }catch(error){
    console.error('Reviews could not be loaded',error);
    ratingEl.textContent='—';
    starsEl.textContent='☆☆☆☆☆';
    countEl.textContent='Reviews temporarily unavailable';
    grid.innerHTML='<div class="review-empty">Student reviews are temporarily unavailable.</div>';
  }
}
loadReviews();
