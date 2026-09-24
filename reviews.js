import { firebaseConfig } from './firebase-config.js';
import { initializeApp, getApps } from 'https://www.gstatic.com/firebasejs/10.14.1/firebase-app.js';
import { getFirestore, collection, doc, getDocs, query, orderBy, limit, serverTimestamp, setDoc } from 'https://www.gstatic.com/firebasejs/10.14.1/firebase-firestore.js';

const app=getApps()[0]||initializeApp(firebaseConfig);
const db=getFirestore(app);
const grid=document.getElementById('publicReviews');
const ratingEl=document.getElementById('publicRating');
const starsEl=document.getElementById('publicStars');
const countEl=document.getElementById('publicReviewCount');
const publicForm=document.getElementById('publicReviewForm');
const publicMessage=document.getElementById('publicReviewMessage');
let publicRating=0;

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
      countEl.textContent='No reviews yet';
      grid.innerHTML='<div class="review-empty">Be the first to share an honest review of Scrutiny Academy.</div>';
      return;
    }
    const average=reviews.reduce((sum,r)=>sum+Number(r.rating),0)/reviews.length;
    ratingEl.textContent=average.toFixed(1)+'/5';
    starsEl.textContent=starText(Math.round(average));
    countEl.textContent=reviews.length+' public review'+(reviews.length===1?'':'s');
    grid.innerHTML=reviews.slice(0,6).map(r=>{
      const identity=r.verifiedRegisteredStudent===true
        ? '<span class="verified-student-badge"><span aria-hidden="true">✓</span> Verified Scrutiny Student</span>'
        : '<small class="community-review-label">Community review</small>';
      return `<article class="review-card"><div class="review-card-top"><span class="review-avatar">${escapeHtml(r.studentName.trim().charAt(0).toUpperCase())}</span><div><strong>${escapeHtml(r.studentName)}</strong>${identity}</div><span class="review-stars" aria-label="${Number(r.rating)} out of 5 stars">${starText(Number(r.rating))}</span></div><p>“${escapeHtml(r.review)}”</p></article>`;
    }).join('');
  }catch(error){
    console.error('Reviews could not be loaded',error);
    ratingEl.textContent='—';
    starsEl.textContent='☆☆☆☆☆';
    countEl.textContent='Reviews temporarily unavailable';
    grid.innerHTML='<div class="review-empty">Student reviews are temporarily unavailable.</div>';
  }
}

function paintPublicStars(){
  document.querySelectorAll('#publicStarPicker button').forEach(button=>{
    const selected=Number(button.dataset.star)<=publicRating;
    button.classList.toggle('selected',selected);
    button.setAttribute('aria-pressed',String(Number(button.dataset.star)===publicRating));
  });
}

function guestReviewId(){
  const key='scrutiny_public_review_id';
  let id=localStorage.getItem(key);
  if(!/^[a-f0-9]{32}$/.test(id||'')){
    id=crypto.randomUUID().replaceAll('-','');
    localStorage.setItem(key,id);
  }
  return `guest_${id}`;
}

function setPublicMessage(text,kind=''){
  if(!publicMessage) return;
  publicMessage.textContent=text;
  publicMessage.className=`message ${kind}`;
}

if(publicForm){
  document.querySelectorAll('#publicStarPicker button').forEach(button=>button.addEventListener('click',()=>{
    publicRating=Number(button.dataset.star);
    paintPublicStars();
  }));
  if(localStorage.getItem('scrutiny_public_review_submitted')==='true'){
    setPublicMessage('Thank you. A review has already been submitted from this device.','success');
  }
  publicForm.addEventListener('submit',async event=>{
    event.preventDefault();
    const name=document.getElementById('publicReviewName').value.trim();
    const review=document.getElementById('publicReviewText').value.trim();
    const honeypot=document.getElementById('publicReviewWebsite').value;
    if(honeypot) return;
    if(name.length<2){ setPublicMessage('Please enter your name.','error'); return; }
    if(publicRating<1){ setPublicMessage('Choose a star rating first.','error'); return; }
    if(review.length<10){ setPublicMessage('Please write at least 10 characters.','error'); return; }
    if(localStorage.getItem('scrutiny_public_review_submitted')==='true'){
      setPublicMessage('A review has already been submitted from this device.','error'); return;
    }
    const submitButton=publicForm.querySelector('button[type="submit"]');
    submitButton.disabled=true;
    setPublicMessage('Publishing your review…');
    try{
      await setDoc(doc(db,'reviews',guestReviewId()),{
        uid:'',
        studentName:name.slice(0,80),
        rating:publicRating,
        review:review.slice(0,500),
        verifiedRegisteredStudent:false,
        source:'public',
        updatedAt:serverTimestamp()
      });
      localStorage.setItem('scrutiny_public_review_submitted','true');
      publicForm.reset();
      publicRating=0;
      paintPublicStars();
      setPublicMessage('Thank you. Your review is now published.','success');
      await loadReviews();
    }catch(error){
      console.error('Public review save failed',error);
      submitButton.disabled=false;
      setPublicMessage('Could not publish your review. Please try again.','error');
    }
  });
}
loadReviews();
