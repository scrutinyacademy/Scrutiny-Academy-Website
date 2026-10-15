const fs = require('node:fs');
const assert = require('node:assert/strict');

const css = fs.readFileSync('v2.css', 'utf8');
const diagrams = fs.readFileSync('neet-diagrams.css', 'utf8');
const html = fs.readFileSync('preview-v2.html', 'utf8');
const goal = fs.readFileSync('today-goal.js', 'utf8');
const help = fs.readFileSync('help-bot.js', 'utf8');
const catalog = JSON.parse(fs.readFileSync('data/neet/diagrams/catalog.json', 'utf8'));

assert.match(css, /grid-template-rows:auto auto 4px minmax\(0,1fr\) auto/);
assert.match(css, /\.quiz-shell>section\{[^}]*overflow-y:auto/);
assert.match(css, /@media \(min-width:601px\) and \(max-width:1024px\)/);
assert.match(css, /@media \(max-width:600px\)/);
assert.match(css, /\.control-row\{display:grid;grid-template-columns:repeat\(2,minmax\(0,1fr\)\)/);
assert.match(diagrams, /@media\(max-width:1024px\)/);
assert.match(diagrams, /\.dv-title h3\{[^}]*overflow-wrap:anywhere/);
assert.match(goal, /right:76px;bottom:max\(12px,env\(safe-area-inset-bottom\)\);width:52px/);
assert.match(help, /right:12px;bottom:max\(12px,env\(safe-area-inset-bottom\)\);width:52px/);
assert.match(html, /v2\.css\?v=43/);
assert.match(html, /neet-diagrams\.js\?v=3/);

const brokenTitles = catalog.chapters.flatMap(chapter => chapter.items)
  .filter(item => /(?:\b[A-Za-z]\s+){3,}[A-Za-z]\b/.test(item.title));
assert.deepEqual(brokenTitles, []);

console.log('PASS: phone, tablet and laptop breakpoints; scroll-safe MCQ dialog; compact floating controls; responsive diagrams; clean visual titles.');
