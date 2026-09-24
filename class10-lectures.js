const subjects=[["Hindi",null],["Telugu",null],["Physics","physics"],["Social Studies","social-science"],["English",null],["Biology","biology"]];
const fallback={"Hindi":[],"Telugu":[],"English":[]};
let selected="Physics",chapters={},query="";
const tabs=document.querySelector("#subjects"),out=document.querySelector("#chapters"),search=document.querySelector("#search");
function safe(t){return String(t??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));}
function extract(data){const list=Array.isArray(data)?data:(data.chapters||data.units||[]);return list.flatMap(c=>c.chapters||[c]).map(c=>typeof c==="string"?c:(c.title||c.name||c.chapter||"")).filter(x=>typeof x==="string"&&x.trim());}
async function load(){await Promise.all(subjects.filter(s=>s[1]).map(async([name,slug])=>{try{const r=await fetch("data/class10/"+slug+".json");if(!r.ok)throw Error(r.status);chapters[name]=extract(await r.json());}catch(e){console.warn("Could not load "+name,e);chapters[name]=[];}}));render();}
function render(){tabs.innerHTML=subjects.map(([name])=>'<button type="button" data-subject="'+safe(name)+'" aria-selected="'+(name===selected)+'">'+safe(name)+'</button>').join("");
tabs.querySelectorAll("button").forEach(b=>b.onclick=()=>{selected=b.dataset.subject;render()});
const all=chapters[selected]||fallback[selected]||[];const visible=all.filter(x=>x.toLowerCase().includes(query));
document.querySelector("#count").textContent=visible.length+" chapters";
out.innerHTML=visible.length?visible.map((name,i)=>'<article class="chapter"><span class="tag">'+safe(selected.toUpperCase())+' · CHAPTER '+(all.indexOf(name)+1)+'</span><h3>'+safe(name)+'</h3><p>Verified video link pending. Browse our channel for any available lessons.</p><a href="https://www.youtube.com/@ScrutinyAcademy/videos" target="_blank" rel="noopener noreferrer">Explore channel ↗</a></article>').join(""):'<div class="empty">'+(query?'No matching chapters.':'Chapter catalogue for this subject is being prepared.')+'</div>';}
search.addEventListener("input",e=>{query=e.target.value.trim().toLowerCase();render()});load();