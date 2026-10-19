export const $ = id => document.getElementById(id);
export const esc = s => String(s ?? '').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
export async function data(name){const r=await fetch(`data/arabic/${name}.json`);if(!r.ok)throw Error('Learning resources could not load. Please reconnect and retry.');return r.json();}
export function shell(){
 document.querySelector('header').innerHTML=`<a class="brand" href="index.html"><img src="assets/logo.svg" alt="Scrutiny Academy"><strong>SCRUTINY ACADEMY<small>FREE LEARNING FOR EVERYONE</small></strong></a><nav aria-label="Course"><a href="arabic-learning.html">Overview</a><a href="arabic-learning.html#alphabet">Alphabet</a><a href="arabic-learning.html#quran">Quran</a><a href="index.html">Home</a></nav>`;
 document.querySelector('footer').innerHTML=`<a href="https://www.youtube.com/@ScrutinyAcademy"><svg viewBox="0 0 24 24" width="24" height="24" aria-label="YouTube"><rect x="1" y="4" width="22" height="16" rx="5" fill="#c62828"/><path d="m10 8 6 4-6 4" fill="white"/></svg> Watch &amp; Learn on our YouTube Channel — Scrutiny Academy</a><p>For more support, mail us at <a href="mailto:scrutinyacademy@gmail.com">scrutinyacademy@gmail.com</a></p>`;
}
export function fail(e){$('content').textContent=e.message;}
