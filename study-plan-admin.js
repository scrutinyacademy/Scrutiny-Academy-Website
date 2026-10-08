import {firebaseConfig} from './firebase-config.js';
import {initializeApp} from 'https://www.gstatic.com/firebasejs/10.14.1/firebase-app.js';
import {getAuth,onAuthStateChanged,getIdTokenResult} from 'https://www.gstatic.com/firebasejs/10.14.1/firebase-auth.js';
import {getFirestore,doc,getDoc,setDoc,deleteDoc,serverTimestamp} from 'https://www.gstatic.com/firebasejs/10.14.1/firebase-firestore.js';
const app=initializeApp(firebaseConfig),auth=getAuth(app),db=getFirestore(app),$=id=>document.getElementById(id);
const status=t=>$('status').textContent=t;
const initial=[
'2026-10-12 | 19:00 | Mathematics | Trigonometry fundamentals and 20 practice questions',
'2026-10-13 | 19:00 | Mathematics | Applications of trigonometry and worked examples',
'2026-10-14 | 19:00 | Mathematics | Circles: theorems and 15 board-style questions',
'2026-10-15 | 19:00 | Mathematics | Logarithms: rules and 20 mixed questions',
'2026-10-16 | 19:00 | Telugu | Vocabulary, reading and answer-writing practice',
'2026-10-17 | 19:00 | Science | Physics revision and 20 MCQs',
'2026-10-18 | 19:00 | Social Studies | Important short answers and weekly review'
].join('\n');
$('tasks').value=initial;$('startDate').value='2026-10-12';$('endDate').value='2026-10-18';
let founder=false;
onAuthStateChanged(auth,async user=>{if(!user){location.replace('login.html');return;}try{const token=await getIdTokenResult(user,true);founder=token.claims.founder===true;if(!founder){status('Access denied. This account needs a server-issued founder custom claim.');return;}$('planForm').hidden=false;status('Founder verified. Assign or edit a student plan.');}catch(e){status('Could not verify permissions: '+e.message);}});
function parseTasks(raw){const lines=raw.split(/\r?\n/).map(x=>x.trim()).filter(Boolean);if(!lines.length||lines.length>100)throw Error('Enter 1–100 tasks.');return lines.map((line,i)=>{const parts=line.split('|').map(x=>x.trim());if(parts.length!==4||!/^[0-9]{4}-[0-9]{2}-[0-9]{2}$/.test(parts[0])||!/^[0-2][0-9]:[0-5][0-9]$/.test(parts[1])||parts.some(x=>!x))throw Error('Invalid task line '+(i+1));if(parts.some(x=>x.length>250))throw Error('Task text too long at line '+(i+1));return{id:'task-'+i,date:parts[0],time:parts[1],subject:parts[2],activity:parts[3]};});}
$('load').onclick=async()=>{if(!founder)return;try{const uid=$('uid').value.trim();const snap=await getDoc(doc(db,'studyPlans',uid));if(!snap.exists()){status('No existing plan for this UID.');return;}const p=snap.data();$('studentName').value=p.studentName||'';$('title').value=p.title||'';$('startDate').value=p.startDate||'';$('endDate').value=p.endDate||'';$('tasks').value=(p.tasks||[]).map(t=>[t.date,t.time,t.subject,t.activity].join(' | ')).join('\n');status('Loaded plan for '+uid);}catch(e){status('Load failed: '+e.message);}};
$('planForm').onsubmit=async e=>{e.preventDefault();if(!founder)return;try{const uid=$('uid').value.trim(),tasks=parseTasks($('tasks').value);if($('startDate').value>$('endDate').value)throw Error('End date must be after start date.');if(!confirm('Assign this plan to '+$('studentName').value+'? Existing task completion will reset.'))return;const student=await getDoc(doc(db,'students',uid));if(!student.exists())throw Error('Student UID not found in Firestore.');await setDoc(doc(db,'studyPlans',uid),{uid,studentName:$('studentName').value.trim(),title:$('title').value.trim(),startDate:$('startDate').value,endDate:$('endDate').value,tasks,updatedAt:serverTimestamp()});await deleteDoc(doc(db,'studyPlanProgress',uid));status('Plan assigned. Student can view it at student-study-plan.html.');}catch(err){status('Save failed: '+err.message);}};
