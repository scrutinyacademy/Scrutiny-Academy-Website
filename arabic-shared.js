import {arabicCollaboration} from './arabic-brand.js?v=1';
export const $ = id => document.getElementById(id);
export const esc = s => String(s ?? '').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
export {arabicData as data} from './arabic-access.js?v=2';
export function shell(){
 document.querySelector('header').innerHTML=`<a class="brand" href="index.html"><img src="assets/logo.svg" alt="Scrutiny Academy"><strong>SCRUTINY ACADEMY<small>ARABIC &amp; QURAN · LEARN WITH PURPOSE</small></strong></a><nav aria-label="Course"><a href="arabic-learning.html">Overview</a><a href="arabic-learning.html#alphabet">Alphabet</a><a href="arabic-learning.html#quran">Quran</a><a href="index.html">Home</a></nav>${arabicCollaboration('collaboration-header')}`;
 document.querySelector('footer').innerHTML=`${arabicCollaboration('collaboration-footer')}<a href="https://www.youtube.com/@ScrutinyAcademy"><svg viewBox="0 0 24 24" width="24" height="24" aria-label="YouTube"><rect x="1" y="4" width="22" height="16" rx="5" fill="#c62828"/><path d="m10 8 6 4-6 4" fill="white"/></svg> Watch &amp; Learn on our YouTube Channel — Scrutiny Academy</a><p>For more support, mail us at <a href="mailto:scrutinyacademy@gmail.com">scrutinyacademy@gmail.com</a></p>`;
}
export function fail(e){$('content').textContent=e.message;}
