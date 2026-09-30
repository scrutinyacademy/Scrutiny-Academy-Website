/* Local DOM integration tests. Install jsdom as a dev-only dependency and run:
 * NODE_PATH=/path/to/node_modules node scripts/test-physics-formulas.cjs
 * No production authentication is bypassed; no live student data is used.
 */
const fs = require('node:fs');
const path = require('node:path');
const assert = require('node:assert/strict');
const { JSDOM } = require('jsdom');
const root = path.resolve(__dirname, '..');
const read = p => fs.readFileSync(path.join(root, p), 'utf8');
const catalog = JSON.parse(read('assets/physics-formulas/catalog.json'));
const tick = () => new Promise(resolve => setTimeout(resolve, 15));
async function until(check, label) {
  for (let i = 0; i < 150; i++) { if (check()) return; await tick(); }
  throw new Error(`Timed out: ${label}`);
}
function setup(file = 'physics-formulas.html', search = '') {
  const dom = new JSDOM(read(file), { url: `https://test.invalid/${file}${search}`, runScripts: 'outside-only', pretendToBeVisual: true });
  const w = dom.window, errors = [];
  w.console.error = (...args) => errors.push(args.join(' '));
  w.addEventListener('error', e => errors.push(e.message));
  w.HTMLElement.prototype.scrollIntoView = function() {};
  w.HTMLDialogElement.prototype.showModal = function() { this.setAttribute('open', ''); };
  w.HTMLDialogElement.prototype.close = function() { this.removeAttribute('open'); this.dispatchEvent(new w.Event('close')); };
  w.fetch = async p => {
    const name = new URL(p, 'https://test.invalid/').pathname.slice(1);
    try { return { ok: true, json: async () => JSON.parse(read(name)) }; }
    catch { return { ok: false }; }
  };
  w.eval(read('physics-formula-notes.js'));
  w.eval(read('physics-formulas.js'));
  return { dom, w, d: w.document, errors };
}

(async () => {
  const { dom, w, d, errors } = setup();
  await until(() => !d.getElementById('pfWorkspace').hidden, 'vault load');
  const el = id => d.getElementById(id);
  assert.equal(d.querySelectorAll('[data-pf-chapter]').length, 34);
  assert.equal(el('pfPrevious').disabled, true);
  el('pfSearch').value = 'projectile'; el('pfSearch').dispatchEvent(new w.Event('input'));
  assert.equal(d.querySelectorAll('[data-pf-chapter]').length, 1);
  d.querySelector('[data-pf-chapter]').click();
  assert.equal(el('pfChapterTitle').textContent, 'Kinematics');
  assert.equal(d.querySelectorAll('.pf-sheet').length, 2);
  el('pfSave').click(); el('pfReviewed').click();
  assert.equal(el('pfSave').getAttribute('aria-pressed'), 'true');
  assert.equal(el('pfReviewed').getAttribute('aria-pressed'), 'true');
  assert.equal(el('pfProgress').value, 1);
  assert.ok(JSON.parse(w.localStorage.getItem('scrutiny_physics_formulas_v1')).saved.includes('kinematics'));
  el('pfRecall').click(); assert.equal(el('pfSheets').hidden, true);
  el('pfReveal').click(); assert.equal(el('pfSheets').hidden, false);
  for (let i=0; i<10; i++) el('pfZoomIn').click();
  assert.equal(el('pfZoomReset').textContent, '300%'); assert.equal(el('pfZoomIn').disabled, true);
  el('pfZoomReset').click(); assert.equal(el('pfZoomReset').textContent, '100%');
  el('pfClose').click(); assert.equal(el('pfDialog').open, false);
  await w.ScrutinyFormulas.open(); assert.equal(el('pfChapterTitle').textContent, 'Kinematics');
  el('pfSearch').value = ''; el('pfSearch').dispatchEvent(new w.Event('input'));
  d.querySelector('[data-pf-filter="saved"]').click(); assert.equal(d.querySelectorAll('[data-pf-chapter]').length, 1);
  d.querySelector('[data-pf-filter="pending"]').click(); assert.equal(d.querySelectorAll('[data-pf-chapter]').length, 33);
  d.querySelector('[data-pf-filter="all"]').click();
  for (const c of catalog.chapters) {
    await w.ScrutinyFormulas.open({ id: c.id });
    assert.equal(el('pfChapterTitle').textContent, c.title);
    assert.equal(d.querySelectorAll('.pf-sheet').length, c.fragments.length);
    assert.ok(el('pfSource').href.endsWith(`#page=${c.pages[0]}`));
    for (const [i, img] of [...d.querySelectorAll('.pf-sheet image')].entries()) assert.equal(img.getAttribute('href'), c.fragments[i].asset);
  }
  assert.equal(el('pfNext').disabled, true);
  await w.ScrutinyFormulas.open({ quiz: true, chapter: 'Alternating Current' });
  assert.equal(el('pfChapterTitle').textContent, 'Electromagnetic Induction');
  assert.ok(el('pfContext').textContent.includes('timer keeps running'));
  await w.ScrutinyFormulas.open({ id: 'the-atom' });
  assert.equal(d.querySelectorAll('.pf-caution').length, 2);
  assert.equal(d.querySelectorAll('math').length, 2);
  assert.deepEqual(errors, []);
  dom.window.close();
  console.log('PASS: 34 chapters, search, source mapping, save, revise, recall, zoom, persisted state, cautions.');

  // Exercise actual quiz code in a local DOM with repository fixtures only.
  const quiz = setup('preview-v2.html', '?course=neet&subject=physics');
  const { w: qw, d: qd } = quiz;
  const qel = id => qd.getElementById(id);
  qw.eval(read('data/neet/class11-physics-bank.js'));
  qw.eval(read('data/neet/class11-chemistry-bank.js'));
  qw.eval(read('v2-core.js'));
  await until(() => typeof qel('neetStart').onclick === 'function', 'quiz data boot');
  for (const mode of ['practice', 'test']) {
    qel('neetMode').value = mode;
    qd.querySelector('.neet-chapter-practice[data-i="1"]').click();
    assert.equal(qel('quizDialog').open, true);
    assert.equal(qel('quizFormulas').hidden, false);
    const question = qel('quizQuestion').textContent;
    qd.querySelector('#quizOptions button').click();
    const chosen = qd.querySelector('#quizOptions button.selected').textContent;
    qel('quizFormulas').focus(); qel('quizFormulas').click();
    await until(() => qel('pfDialog').open && !qel('pfWorkspace').hidden, 'in-quiz vault');
    assert.equal(qel('quizDialog').open, true);
    assert.equal(qel('pfChapterTitle').textContent, 'Kinematics');
    qel('pfClose').click();
    assert.equal(qel('quizDialog').open, true);
    assert.equal(qel('quizQuestion').textContent, question);
    assert.equal(qd.querySelector('#quizOptions button.selected').textContent, chosen);
    assert.equal(qd.activeElement, qel('quizFormulas'));
    qel('quizSubmit').click();
    assert.ok(qel('resultTime').textContent.includes('Formula-assisted practice'));
    qel('closeResult').click();
  }
  // Verify subject isolation when starting a fresh biology session.
  qel('neetSubject').value = 'biology';
  await qel('neetSubject').onchange({ target: qel('neetSubject') });
  await qel('neetStart').onclick();
  assert.equal(qel('quizFormulas').hidden, true);
  qel('quizSubmit').click();
  assert.ok(!qel('resultTime').textContent.includes('Formula-assisted'));
  assert.deepEqual(quiz.errors, []);
  quiz.dom.window.close();
  console.log('PASS: real Physics quiz integration (practice + test), chapter matching, answers preserved, focus restored, assisted result, Biology unaffected.');

  const offline = setup('index.html');
  offline.w.fetch = async () => { throw new Error('offline'); };
  await offline.w.ScrutinyFormulas.open();
  assert.ok(offline.d.getElementById('pfRetry'));
  assert.equal(offline.d.getElementById('pfWorkspace').hidden, true);
  offline.w.fetch = async () => ({ ok: true, json: async () => catalog });
  offline.d.getElementById('pfRetry').click();
  await until(() => !offline.d.getElementById('pfWorkspace').hidden, 'retry succeeds');
  Object.defineProperty(offline.w, 'localStorage', { get() { throw new Error('denied'); } });
  await offline.w.ScrutinyFormulas.open({ id: 'kinematics' });
  offline.d.getElementById('pfSave').click();
  assert.ok(offline.d.getElementById('pfStatus').textContent);
  assert.deepEqual(offline.errors, []);
  offline.dom.window.close();
  console.log('PASS: fetch failure and retry, storage-disabled fallback, no runtime errors.');
})().catch(error => { console.error(error); process.exitCode = 1; });
