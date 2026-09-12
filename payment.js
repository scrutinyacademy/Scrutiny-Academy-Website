import { firebaseConfig, SCRUTINY_ACCESS_PRICE } from './firebase-config.js';
import { initializeApp } from 'https://www.gstatic.com/firebasejs/10.14.1/firebase-app.js';
import { getAuth, onAuthStateChanged, signOut } from 'https://www.gstatic.com/firebasejs/10.14.1/firebase-auth.js';
import { getFirestore, doc, getDoc, setDoc, updateDoc, serverTimestamp } from 'https://www.gstatic.com/firebasejs/10.14.1/firebase-firestore.js';

const app=initializeApp(firebaseConfig),auth=getAuth(app),db=getFirestore(app),$=id=>document.getElementById(id);
const message=(t,k='')=>{const e=$('paymentMessage');e.textContent=t;e.className=`message ${k}`};
let currentUser=null;
$('amount').value=SCRUTINY_ACCESS_PRICE;
$('paymentDate').value=new Date().toISOString().slice(0,10);

onAuthStateChanged(auth,async user=>{
  if(!user){ location.replace('login.html'); return; }
  currentUser=user;
  try{
    const ref=doc(db,'students',user.uid);
    const snap=await getDoc(ref);
    let p;
    if(snap.exists()){
      p=snap.data();
    }else{
      // Repair accounts created before the registration redirect race was fixed.
      p={
        uid:user.uid,
        name:user.displayName||(user.email?user.email.split('@')[0]:'Student'),
        phone:'',
        email:user.email||'',
        role:'student',
        accessStatus:'pending',
        accessPrice:SCRUTINY_ACCESS_PRICE,
        paymentStatus:'not_submitted',
        createdAt:serverTimestamp(),
        updatedAt:serverTimestamp()
      };
      await setDoc(ref,p);
    }
    $('studentName').textContent=p.name?`Hi, ${p.name}`:'Student Access';
    renderStatus(p);
  }catch(err){
    console.error('Scrutiny Academy profile recovery failed:',err);
    $('statusText').textContent='We could not load your student profile. Please refresh the page or contact the help desk.';
    $('statusPill').textContent='PROFILE ERROR';
    $('statusPill').className='status-pill rejected';
    $('paymentForm').style.display='none';
    message('Your account is signed in, but its student profile could not be loaded.','error');
  }
});

function renderStatus(p){
  const status=p.accessStatus||'unpaid', pill=$('statusPill'), form=$('paymentForm');
  pill.className=`status-pill ${status==='active'?'active':status==='rejected'?'rejected':'pending'}`;
  if(status==='active'){
    pill.textContent='ACCESS ACTIVE'; $('statusText').textContent='Your payment has been verified. Your Scrutiny Academy student access is active.'; form.style.display='none';
    const b=document.createElement('button'); b.className='primary'; b.textContent='OPEN STUDENT DASHBOARD'; b.onclick=()=>location.href='student.html'; form.parentElement.insertBefore(b,$('paymentMessage'));
  }else if(p.paymentStatus==='submitted'){
    pill.textContent='VERIFICATION PENDING'; $('statusText').textContent='We have received your payment reference. Please do not submit another payment. Access will unlock after approval.'; form.style.display='none';
  }else if(status==='rejected'){
    pill.textContent='NEEDS REVIEW'; $('statusText').textContent='Your previous submission could not be verified. Check the reference and submit the correct payment details, or contact the help desk.';
  }else{
    pill.textContent='PAYMENT REQUIRED'; $('statusText').textContent='Complete the ₹59 access payment and submit the UTR/reference for manual verification.';
  }
}

$('paymentForm').addEventListener('submit',async e=>{
  e.preventDefault();
  if(!currentUser) return;
  const utr=$('utr').value.trim().replace(/\s+/g,'');
  if(utr.length<6){ message('Enter a valid UTR/reference number.','error'); return; }
  const amount=Number($('amount').value);
  if(amount<SCRUTINY_ACCESS_PRICE){ message(`The access token amount is ₹${SCRUTINY_ACCESS_PRICE}.`,'error'); return; }
  try{
    await updateDoc(doc(db,'students',currentUser.uid),{
      paymentStatus:'submitted',
      accessStatus:'pending',
      payment:{utr,amount,date:$('paymentDate').value,submittedAt:serverTimestamp()},
      updatedAt:serverTimestamp()
    });
    message('Payment reference submitted successfully. Verification is pending.','success');
    renderStatus({accessStatus:'pending',paymentStatus:'submitted'});
  }catch(err){ console.error(err); message('Could not submit payment details. Please try again.','error'); }
});

$('logoutBtn').onclick=async()=>{await signOut(auth);location.replace('login.html')};
