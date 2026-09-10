/**
 * SCRUTINY ACADEMY - Unified Client Application Engine
 * Pure Vanilla JavaScript • Zero Dependencies • Static & GitHub Pages Ready
 */

(function () {
  'use strict';

  // -------------------------------------------------------------
  // STATE MANAGEMENT
  // -------------------------------------------------------------
  const AppState = {
    manifest: null,
    dataCache: {},
    activeCurriculum: 'class10', // 'class10', 'neet', 'mbbs'
    activeSubjectKey: 'biology',
    activeChapterIndex: 0,
    activeFormat: 'mcqs', // 'mcqs', 'vsaq', 'saq', 'laq'
    
    // MCQ Engine State
    engine: {
      active: false,
      mode: 'practice', // 'practice' or 'test'
      questions: [],
      currentIndex: 0,
      userAnswers: {}, // index -> optionIndex
      markedReview: {}, // index -> boolean
      score: 0,
      startTime: null,
      timerInterval: null,
      elapsedSeconds: 0,
      filterDifficulty: 'all',
      requestedCount: 25,
      shuffleQuestions: true,
      shuffleOptions: true,
      currentCourseTitle: ''
    }
  };

  // -------------------------------------------------------------
  // DOM ELEMENT SELECTORS
  // -------------------------------------------------------------
  const DOM = {
    // Header & Nav
    mobileMenuBtn: document.getElementById('mobile-menu-btn'),
    mobileDrawer: document.getElementById('mobile-drawer'),
    searchTrigger: document.getElementById('search-trigger'),
    searchModal: document.getElementById('search-modal'),
    searchCloseBtn: document.getElementById('search-close-btn'),
    globalSearchInput: document.getElementById('global-search-input'),
    searchResultsList: document.getElementById('search-results-list'),
    
    // Quick Actions
    heroQuickTestBtn: document.getElementById('hero-quick-practice-btn'),
    
    // Class 10 Section
    c10SubjectTabs: document.getElementById('c10-subject-tabs'),
    c10SubjectTitle: document.getElementById('c10-subject-title'),
    c10SubjectDesc: document.getElementById('c10-subject-desc'),
    c10ChapterSelect: document.getElementById('c10-chapter-select'),
    c10FormatTabs: document.getElementById('c10-format-tabs'),
    c10FormatContent: document.getElementById('c10-format-content'),
    c10LaunchMcqBtn: document.getElementById('c10-launch-mcq-btn'),
    
    // NEET Section
    neetSubjectTabs: document.getElementById('neet-subject-tabs'),
    neetSubjectTitle: document.getElementById('neet-subject-title'),
    neetSubjectDesc: document.getElementById('neet-subject-desc'),
    neetPracticeBtn: document.getElementById('neet-practice-mode-btn'),
    neetTestBtn: document.getElementById('neet-test-mode-btn'),
    neetPreview: document.getElementById('neet-question-preview'),
    
    // MBBS Section
    mbbsPhaseTabs: document.getElementById('mbbs-phase-tabs'),
    mbbsGrid: document.getElementById('mbbs-subjects-grid'),
    
    // MCQ Engine
    engineConfigBar: document.getElementById('engine-config-bar'),
    engineSubjectSelect: document.getElementById('engine-subject-select'),
    btnModePractice: document.getElementById('btn-mode-practice'),
    btnModeTest: document.getElementById('btn-mode-test'),
    engineCountSelect: document.getElementById('engine-count-select'),
    engineDiffSelect: document.getElementById('engine-difficulty-select'),
    engineShuffleQ: document.getElementById('engine-shuffle-questions'),
    engineShuffleOpt: document.getElementById('engine-shuffle-options'),
    engineStartBtn: document.getElementById('engine-start-btn'),
    engineStage: document.getElementById('engine-stage'),
    engineResultScreen: document.getElementById('engine-result-screen'),
    
    // Live Stage Elements
    stageModeBadge: document.getElementById('stage-mode-badge'),
    stageSubjectBadge: document.getElementById('stage-subject-badge'),
    stageDiffBadge: document.getElementById('stage-diff-badge'),
    stageTimer: document.getElementById('stage-timer'),
    engineProgressBar: document.getElementById('engine-progress-bar'),
    qNumberText: document.getElementById('q-number-text'),
    qChapterTag: document.getElementById('q-chapter-tag'),
    qPromptText: document.getElementById('q-prompt-text'),
    optionsGrid: document.getElementById('options-grid'),
    explanationBox: document.getElementById('explanation-box'),
    explanationText: document.getElementById('explanation-text'),
    btnPrevQ: document.getElementById('btn-prev-q'),
    btnNextQ: document.getElementById('btn-next-q'),
    btnSubmitTest: document.getElementById('btn-submit-test'),
    qScoreCounter: document.getElementById('q-score-counter'),
    btnMarkReview: document.getElementById('btn-mark-review'),
    btnTogglePalette: document.getElementById('btn-toggle-palette'),
    paletteDrawer: document.getElementById('palette-drawer'),
    paletteGrid: document.getElementById('palette-grid'),
    
    // Results Elements
    resScore: document.getElementById('res-score'),
    resAccuracy: document.getElementById('res-accuracy'),
    resTime: document.getElementById('res-time'),
    resAttempted: document.getElementById('res-attempted'),
    resultMetaText: document.getElementById('result-meta-text'),
    resultBreakdownList: document.getElementById('result-breakdown-list'),
    btnRetakeTest: document.getElementById('btn-retake-test'),
    btnReviewIncorrect: document.getElementById('btn-review-incorrect'),
    btnResetEngine: document.getElementById('btn-reset-engine'),
    
    // Progress Dashboard
    dashAttempted: document.getElementById('dash-total-attempted'),
    dashCorrect: document.getElementById('dash-total-correct'),
    dashIncorrect: document.getElementById('dash-total-incorrect'),
    dashAccuracy: document.getElementById('dash-overall-accuracy'),
    recentSessionsList: document.getElementById('recent-sessions-list'),
    btnClearProgress: document.getElementById('btn-clear-progress'),
    
    // Support Modal
    openSupportModalBtn: document.getElementById('open-support-modal-btn'),
    supportModal: document.getElementById('support-modal'),
    modalCloseBtn: document.getElementById('modal-close-btn'),
    btnCopyUpi: document.getElementById('btn-copy-upi'),
    upiIdText: document.getElementById('upi-id-text'),
    
    // Toast
    toast: document.getElementById('toast')
  };

  // -------------------------------------------------------------
  // DATA LOADER (Asynchronous Fetch with Offline Fallback)
  // -------------------------------------------------------------
  async function loadDataFile(path, fallbackKey) {
    if (AppState.dataCache[path]) {
      return AppState.dataCache[path];
    }

    try {
      const response = await fetch(path);
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      const data = await response.json();
      AppState.dataCache[path] = data;
      return data;
    } catch (e) {
      // Fallback to window.SCRUTINY_DATA
      if (window.SCRUTINY_DATA) {
        if (fallbackKey && fallbackKey.length) {
          let ref = window.SCRUTINY_DATA;
          for (let k of fallbackKey) {
            ref = ref ? ref[k] : undefined;
          }
          if (ref) {
            AppState.dataCache[path] = ref;
            return ref;
          }
        }
      }
      console.warn(`Data fallback used for: ${path}`);
      return null;
    }
  }

  // -------------------------------------------------------------
  // INITIALIZATION
  // -------------------------------------------------------------
  async function initApp() {
    // 1. Load manifest
    AppState.manifest = await loadDataFile('data/manifest.json', ['manifest']);

    // 2. Setup curriculum subject select options in MCQ engine
    populateEngineCourseDropdown();

    // 3. Render initial views
    renderClass10View();
    renderBoardView('class11');
    renderBoardView('class12');
    renderNeetView();
    renderMbbsView('all');

    // 4. Render user progress dashboard
    renderProgressDashboard();

    // 5. Setup event listeners
    setupEventListeners();

    // 6. Setup Deterrents
    setupBrandProtection();
  }

  // -------------------------------------------------------------
  // CLASS 10 SSC TELANGANA CONTROLLER
  // -------------------------------------------------------------
  async function renderClass10View() {
    const subjectKey = AppState.activeSubjectKey;
    const filePath = `data/class10/${subjectKey}.json`;
    const subjectData = await loadDataFile(filePath, ['class10', subjectKey]);

    if (!subjectData) return;

    DOM.c10SubjectTitle.textContent = `${subjectData.icon || ''} ${subjectData.subject}`;
    DOM.c10SubjectDesc.textContent = subjectData.description || 'Telangana SSC Board Standard Content';

    // Populate Chapter dropdown
    DOM.c10ChapterSelect.innerHTML = '';
    subjectData.chapters.forEach((ch, idx) => {
      const opt = document.createElement('option');
      opt.value = idx;
      opt.textContent = `Chapter ${idx + 1}: ${ch.name}`;
      DOM.c10ChapterSelect.appendChild(opt);
    });

    DOM.c10ChapterSelect.value = AppState.activeChapterIndex;
    renderClass10FormatContent(subjectData);
  }

  function renderClass10FormatContent(subjectData) {
    const chapterIndex = parseInt(DOM.c10ChapterSelect.value, 10) || 0;
    const chapter = subjectData.chapters[chapterIndex];
    const format = AppState.activeFormat;
    DOM.c10FormatContent.innerHTML = '';

    if (!chapter) return;

    if (format === 'mcqs') {
      const mcqCount = chapter.mcqs ? chapter.mcqs.length : 0;
      DOM.c10FormatContent.innerHTML = `
        <div class="written-q-card" style="text-align: center; padding: 40px 20px;">
          <h4 style="font-size: 1.3rem; margin-bottom: 8px; color: var(--color-navy);">Chapter MCQ Question Bank</h4>
          <p style="color: var(--color-gray-600); margin-bottom: 24px;">
            ${mcqCount} Original, syllabus-aligned multiple choice questions with Easy, Medium, and Hard difficulty levels.
          </p>
          <div style="display: flex; gap: 14px; justify-content: center; flex-wrap: wrap;">
            <button class="btn btn-primary btn-lg" id="c10-start-chapter-mcqs">Practice These ${mcqCount} MCQs Now</button>
            <button class="btn btn-outline btn-lg" id="c10-timed-chapter-mcqs">Take Timed Chapter Test</button>
          </div>
        </div>
      `;

      document.getElementById('c10-start-chapter-mcqs')?.addEventListener('click', () => {
        launchEngineWithQuestions(chapter.mcqs, `${subjectData.subject} - ${chapter.name}`, 'practice');
      });

      document.getElementById('c10-timed-chapter-mcqs')?.addEventListener('click', () => {
        launchEngineWithQuestions(chapter.mcqs, `${subjectData.subject} - ${chapter.name}`, 'test');
      });
      return;
    }

    const items = chapter[format] || [];
    if (items.length === 0) {
      DOM.c10FormatContent.innerHTML = `<p class="empty-hint">No questions available in this format for this chapter.</p>`;
      return;
    }

    items.forEach((item, i) => {
      const card = document.createElement('div');
      card.className = 'written-q-card';
      card.innerHTML = `
        <div class="written-q-header">
          <span class="q-badge-tag">${item.difficulty || 'Board Standard'}</span>
          <span style="font-size: 0.8rem; font-weight: 700; color: var(--color-blue-primary);">${item.marks} ${item.marks === 1 ? 'Mark' : 'Marks'}</span>
        </div>
        <div class="written-q-text">Q${i + 1}. ${item.question}</div>
        <div class="written-a-box">
          <strong>Answer:</strong> ${item.answer}
        </div>
      `;
      DOM.c10FormatContent.appendChild(card);
    });
  }

  // -------------------------------------------------------------
  // NEET CONTROLLER
  // -------------------------------------------------------------

  // Shared board subject/chapter view. All content comes from manifest-linked JSON.
  const boardState = {};
  const escapeText = value => String(value ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  async function renderBoardView(course, selectedSubject, chapterId) {
    const category = AppState.manifest?.categories.find(c => c.id === course);
    const host = document.getElementById(course + '-view');
    if (!category || !host) return;
    const state = boardState[course] ||= {subject: category.subjects[0].id, chapter: '', format: 'vsaq', request: 0};
    if (selectedSubject && selectedSubject !== state.subject) { state.subject = selectedSubject; state.chapter = ''; }
    if (chapterId) state.chapter = chapterId;
    const request = ++state.request;
    const subject = category.subjects.find(s => s.id === state.subject);
    host.setAttribute('aria-busy','true');
    const data = await loadDataFile(subject.file, [course, subject.id]);
    if (request !== state.request) return;
    host.setAttribute('aria-busy','false');
    if (!data) { host.innerHTML = '<p role="alert">This subject could not load. Please refresh to try again.</p>'; return; }
    const chapter = data.chapters.find(c => c.id === state.chapter) || data.chapters[0];
    state.chapter = chapter?.id || '';
    host.innerHTML = `
      <div class="subject-pills-bar" aria-label="Subjects">${category.subjects.map(sub => `<button type="button" class="pill-btn ${sub.id === state.subject ? 'active' : ''}" aria-pressed="${sub.id === state.subject}" data-board-subject="${sub.id}">${sub.icon} ${sub.name}</button>`).join('')}</div>
      <div class="curriculum-card shadow-lg board-panel">
        <div class="subject-header-row"><div><h3>${escapeText(data.subject)}</h3><p>${data.chapters.length} chapters / units · Source: ${escapeText(data.source.academicYear)}</p></div></div>
        ${data.source.note ? `<p class="source-notice" role="note">${escapeText(data.source.note)}</p>` : ''}
        <div class="chapter-bar"><label for="${course}-chapter">Select chapter / unit</label><select class="form-select" id="${course}-chapter">${data.chapters.map(c => `<option value="${c.id}" ${c.id === state.chapter ? 'selected' : ''}>${c.number}. ${escapeText(c.name)}</option>`).join('')}</select></div>
        <h4 class="board-chapter-title">${escapeText(chapter?.name || 'Chapters coming soon')}</h4>
        ${chapter?.topics?.length ? `<details class="chapter-topics"><summary>Topics in this unit</summary><ul>${chapter.topics.map(t=>`<li>${escapeText(t)}</li>`).join('')}</ul></details>` : ''}
        <div class="qformat-tabs" aria-label="Question and resource formats">${['vsaq','saq','laq','mcqs','resources'].map(f=>`<button type="button" class="qtab-btn ${f===state.format?'active':''}" aria-pressed="${f===state.format}" data-board-format="${f}">${f==='resources'?'Lectures & Notes':f.toUpperCase()} (${chapter?.[f]?.length || 0})</button>`).join('')}</div>
        <div class="board-content" aria-live="polite"></div>
      </div>`;
    host.querySelectorAll('[data-board-subject]').forEach(btn=>btn.addEventListener('click',()=>renderBoardView(course,btn.dataset.boardSubject)));
    host.querySelector('select').addEventListener('change',e=>{state.chapter=e.target.value;renderBoardView(course);});
    host.querySelectorAll('[data-board-format]').forEach(btn=>btn.addEventListener('click',()=>{state.format=btn.dataset.boardFormat;renderBoardView(course);}));
    const area=host.querySelector('.board-content');
    const items=chapter?.[state.format] || [];
    if(!items.length) {
      area.innerHTML='<p class="content-empty">Content is being prepared for this chapter. Choose another chapter or explore the available NEET practice bank.</p>';
    } else if(state.format==='mcqs') {
      const btn=document.createElement('button');btn.className='btn btn-primary';btn.textContent=`Practice ${items.length} MCQs`;
      btn.addEventListener('click',()=>launchEngineWithQuestions(items,`${category.name} · ${data.subject} · ${chapter.name}`,'practice'));area.appendChild(btn);
    } else if(state.format==='resources') {
      items.forEach(item=>{if(!/^https:\/\//.test(item.url || '')) return;const a=document.createElement('a');a.className='btn btn-outline';a.textContent=item.title;a.href=item.url;a.target='_blank';a.rel='noopener noreferrer';area.appendChild(a);});
    } else {
      items.forEach(item=>{const card=document.createElement('details');card.className='board-answer';card.innerHTML=`<summary>${escapeText(item.question)}${item.marks ? ` · ${item.marks} marks` : ''}</summary><p>${escapeText(item.answer)}</p>`;area.appendChild(card);});
    }
  }

  let neetRequest=0;
  let currentNeetData=null;
  function selectedNeetChapters() {
    const level=document.getElementById('neet-class-select')?.value || 'all';
    const chapter=document.getElementById('neet-chapter-select')?.value || 'all';
    return (currentNeetData?.chapters || []).filter(c=>(level==='all'||String(c.classLevel)===level)&&(chapter==='all'||c.id===chapter));
  }
  function launchSelectedNeet(mode) {
    const chapters=selectedNeetChapters();
    launchEngineWithQuestions(chapters.flatMap(c=>c.mcqs || []),`NEET ${currentNeetData?.subject || ''} · ${chapters.length===1?chapters[0].name:'Selected chapters'}`,mode);
  }
  async function renderNeetView() {
    const activeSub=document.querySelector('#neet-subject-tabs .pill-btn.active')?.dataset.subject || 'biology';
    const request=++neetRequest;
    currentNeetData=null;
    DOM.neetPracticeBtn.disabled=true;DOM.neetTestBtn.disabled=true;
    DOM.neetPreview.textContent='Loading chapters…';
    const data=await loadDataFile(`data/neet/${activeSub}.json`,['neet',activeSub]);
    if(request!==neetRequest) return;
    if(!data){DOM.neetPreview.textContent='This question bank could not load. Please refresh to try again.';return;}
    currentNeetData=data;
    DOM.neetSubjectTitle.textContent=`NEET ${data.subject}`;
    DOM.neetSubjectDesc.textContent=data.description;
    DOM.neetPreview.innerHTML=`
      <div class="neet-filters">
        <div><label for="neet-class-select">NCERT class</label><select class="form-select" id="neet-class-select"><option value="11">Class 11</option><option value="12">Class 12</option></select></div>
        <div><label for="neet-chapter-select">Chapter</label><select class="form-select" id="neet-chapter-select"></select></div>
      </div><p class="source-notice">NCERT class grouping differs from Telangana board years. This is an existing practice bank, not a complete NEET syllabus or full mock examination.</p>
      <p id="neet-bank-count" role="status"></p><div class="neet-chapters" id="neet-chapter-cards"></div>`;
    const levelSelect=document.getElementById('neet-class-select');
    const chapterSelect=document.getElementById('neet-chapter-select');
    const refresh=()=>{
      const chapters=selectedNeetChapters();
      const count=chapters.reduce((n,c)=>n+(c.mcqs?.length||0),0);
      DOM.neetPracticeBtn.disabled=!count;DOM.neetTestBtn.disabled=!count;
      document.getElementById('neet-bank-count').textContent=`${chapters.length} chapters · ${count} available questions`;
      const cards=document.getElementById('neet-chapter-cards');cards.innerHTML='';
      if(!chapters.length) cards.textContent='Questions for this selection are being prepared.';
      chapters.forEach(ch=>{
        const card=document.createElement('article');card.className='neet-chapter-card';
        card.innerHTML=`<span>Class ${ch.classLevel}</span><h4>${escapeText(ch.name)}</h4><p>${ch.mcqs.length} MCQs${ch.legacy ? " · Legacy topic; check exam syllabus" : ""}</p><button type="button" class="btn btn-outline" ${ch.mcqs.length ? "" : "disabled"}>${ch.mcqs.length ? "Practice chapter" : "Questions coming soon"}</button>`;
        card.querySelector('button').addEventListener('click',()=>launchEngineWithQuestions(ch.mcqs,`NEET ${data.subject} · ${ch.name}`,'practice',ch.mcqs.length));cards.appendChild(card);
      });
    };
    const updateChapters=()=>{
      const chapters=data.chapters.filter(c=>levelSelect.value==='all'||String(c.classLevel)===levelSelect.value);
      chapterSelect.innerHTML='<option value="all">All available chapters</option>'+chapters.map(c=>`<option value="${c.id}">${escapeText(c.name)}</option>`).join('');
      refresh();
    };
    levelSelect.addEventListener('change',updateChapters);chapterSelect.addEventListener('change',refresh);updateChapters();
  }

  // -------------------------------------------------------------
  // MBBS CONTROLLER
  // -------------------------------------------------------------
  async function renderMbbsView(phaseFilter = 'all') {
    const mbbsSubList = AppState.manifest?.categories?.find(c => c.id === 'mbbs')?.subjects || [];
    DOM.mbbsGrid.innerHTML = '';

    const filtered = (phaseFilter === 'all')
      ? mbbsSubList
      : mbbsSubList.filter(s => s.phase.toLowerCase().includes(phaseFilter.toLowerCase()) || s.phase === phaseFilter);

    for (let sub of filtered) {
      const subData = await loadDataFile(sub.file, ['mbbs', sub.id]);
      const card = document.createElement('div');
      card.className = 'mbbs-subject-card';
      const topicsText = subData?.topics ? subData.topics.join(' • ') : 'Clinical Examination Topics';

      card.innerHTML = `
        <div class="mbbs-card-top">
          <span class="mbbs-icon">${sub.icon || '🩺'}</span>
          <span class="mbbs-phase-badge">${sub.phase || 'Clinical'}</span>
        </div>
        <h3 class="mbbs-card-title">${sub.name}</h3>
        <p class="mbbs-topics-list">${topicsText}</p>
        <button class="btn btn-outline btn-sm mbbs-card-btn" data-subject="${sub.id}">
          Launch Clinical MCQs &rarr;
        </button>
      `;

      card.querySelector('.mbbs-card-btn').addEventListener('click', () => {
        if (subData && subData.chapters && subData.chapters[0].mcqs) {
          launchEngineWithQuestions(subData.chapters[0].mcqs, `MBBS ${sub.name}`, 'practice');
        }
      });

      DOM.mbbsGrid.appendChild(card);
    }
  }

  // -------------------------------------------------------------
  // MCQ PRACTICE ENGINE CONTROLLER
  // -------------------------------------------------------------
  function populateEngineCourseDropdown() {
    DOM.engineSubjectSelect.innerHTML = '';

    const groups = (AppState.manifest?.categories || []).map(c => ({label:c.name,key:c.id}));

    groups.forEach(g => {
      const optGroup = document.createElement('optgroup');
      optGroup.label = g.label;
      const cat = AppState.manifest?.categories?.find(c => c.id === g.key);
      if (cat && cat.subjects) {
        cat.subjects.forEach(s => {
          const opt = document.createElement('option');
          opt.value = `${g.key}:${s.id}`;
          opt.textContent = `${s.name} (${g.label})`;
          optGroup.appendChild(opt);
        });
      }
      DOM.engineSubjectSelect.appendChild(optGroup);
    });
  }

  async function launchEngineWithQuestions(questionList, courseTitle, mode = 'practice', overrideCount = null) {
    if (!questionList || questionList.length === 0) {
      showToast('No questions currently available for this module.');
      return;
    }

    AppState.engine.currentCourseTitle = courseTitle;
    AppState.engine.mode = mode;
    AppState.engine.filterDifficulty = DOM.engineDiffSelect.value;
    AppState.engine.shuffleQuestions = DOM.engineShuffleQ.checked;
    AppState.engine.shuffleOptions = DOM.engineShuffleOpt.checked;

    let pool = [...questionList];

    // Filter by difficulty if needed
    if (AppState.engine.filterDifficulty !== 'all') {
      const filtered = pool.filter(q => q.difficulty && q.difficulty.toLowerCase() === AppState.engine.filterDifficulty.toLowerCase());
      pool = filtered;
      if (!pool.length) { showToast('No questions match this difficulty. Choose another difficulty.'); return; }
    }

    // Shuffle questions
    if (AppState.engine.shuffleQuestions) {
      pool.sort(() => Math.random() - 0.5);
    }

    const count = overrideCount || parseInt(DOM.engineCountSelect.value, 10) || 25;
    if (count > pool.length) showToast(`Only ${pool.length} questions are available; the session uses all of them.`);
    AppState.engine.questions = pool.slice(0, count);

    // Prepare questions with optional shuffled options
    AppState.engine.questions = AppState.engine.questions.map(q => {
      if (!AppState.engine.shuffleOptions) return { ...q, currentOptions: q.options, correctIndex: q.answer };
      
      const optObjs = q.options.map((text, idx) => ({ text, isCorrect: idx === q.answer }));
      optObjs.sort(() => Math.random() - 0.5);
      return {
        ...q,
        currentOptions: optObjs.map(o => o.text),
        correctIndex: optObjs.findIndex(o => o.isCorrect)
      };
    });

    AppState.engine.currentIndex = 0;
    AppState.engine.userAnswers = {};
    AppState.engine.markedReview = {};
    AppState.engine.score = 0;
    AppState.engine.elapsedSeconds = 0;
    AppState.engine.active = true;

    // UI Updates
    DOM.engineConfigBar.style.display = 'none';
    DOM.engineResultScreen.style.display = 'none';
    DOM.engineStage.style.display = 'flex';

    DOM.stageModeBadge.textContent = mode === 'practice' ? 'Practice Mode' : 'Test Mode';
    DOM.stageSubjectBadge.textContent = courseTitle;

    // Start Timer
    clearInterval(AppState.engine.timerInterval);
    AppState.engine.timerInterval = setInterval(() => {
      AppState.engine.elapsedSeconds++;
      const mins = String(Math.floor(AppState.engine.elapsedSeconds / 60)).padStart(2, '0');
      const secs = String(AppState.engine.elapsedSeconds % 60).padStart(2, '0');
      DOM.stageTimer.textContent = `${mins}:${secs}`;
    }, 1000);

    renderCurrentQuestion();
    renderQuestionPalette();

    // Scroll to engine
    document.getElementById('mcq-engine').scrollIntoView({ behavior: 'smooth' });
  }

  function renderCurrentQuestion() {
    const q = AppState.engine.questions[AppState.engine.currentIndex];
    if (!q) return;

    const total = AppState.engine.questions.length;
    const current = AppState.engine.currentIndex + 1;

    DOM.qNumberText.textContent = `Question ${current} of ${total}`;
    DOM.qChapterTag.textContent = q.chapter || q.topic || 'General';
    DOM.stageDiffBadge.textContent = q.difficulty || 'Standard';
    DOM.qPromptText.textContent = q.question;

    // Progress Bar
    const percent = (current / total) * 100;
    DOM.engineProgressBar.style.width = `${percent}%`;

    // Render Options
    DOM.optionsGrid.innerHTML = '';
    const letters = ['A', 'B', 'C', 'D'];
    const selectedAnswer = AppState.engine.userAnswers[AppState.engine.currentIndex];
    const isAnswered = selectedAnswer !== undefined;

    q.currentOptions.forEach((optText, optIdx) => {
      const btn = document.createElement('button');
      btn.className = 'option-btn';
      btn.setAttribute('role', 'radio');
      btn.setAttribute('aria-checked', selectedAnswer === optIdx ? 'true' : 'false');

      btn.innerHTML = `
        <span class="option-letter">${letters[optIdx]}</span>
        <span class="option-text">${optText}</span>
      `;

      if (AppState.engine.mode === 'practice') {
        if (isAnswered) {
          btn.disabled = true;
          if (optIdx === q.correctIndex) {
            btn.classList.add('correct');
          } else if (selectedAnswer === optIdx) {
            btn.classList.add('incorrect');
          }
        } else {
          btn.addEventListener('click', () => handleOptionSelect(optIdx));
        }
      } else {
        // Test Mode
        if (selectedAnswer === optIdx) {
          btn.classList.add('selected');
        }
        btn.addEventListener('click', () => handleOptionSelect(optIdx));
      }

      DOM.optionsGrid.appendChild(btn);
    });

    // Explanation Box Handling
    if (AppState.engine.mode === 'practice' && isAnswered) {
      DOM.explanationBox.style.display = 'block';
      DOM.explanationText.textContent = q.explanation || 'Accurate syllabus concept justification.';
    } else {
      DOM.explanationBox.style.display = 'none';
    }

    // Navigation buttons state
    DOM.btnPrevQ.disabled = AppState.engine.currentIndex === 0;
    if (AppState.engine.currentIndex === total - 1) {
      DOM.btnNextQ.style.display = 'none';
      DOM.btnSubmitTest.style.display = 'inline-flex';
    } else {
      DOM.btnNextQ.style.display = 'inline-flex';
      DOM.btnSubmitTest.style.display = 'none';
    }

    // Mark for Review state
    if (AppState.engine.markedReview[AppState.engine.currentIndex]) {
      DOM.btnMarkReview.textContent = 'Unmark Review';
      DOM.btnMarkReview.style.background = 'var(--color-warning-bg)';
      DOM.btnMarkReview.style.borderColor = 'var(--color-warning)';
    } else {
      DOM.btnMarkReview.textContent = 'Mark for Review';
      DOM.btnMarkReview.style.background = '';
      DOM.btnMarkReview.style.borderColor = '';
    }

    DOM.qScoreCounter.textContent = `Score: ${AppState.engine.score}`;
    updateQuestionPaletteCurrent();
  }

  function handleOptionSelect(optIdx) {
    const curIdx = AppState.engine.currentIndex;
    const q = AppState.engine.questions[curIdx];

    AppState.engine.userAnswers[curIdx] = optIdx;

    if (AppState.engine.mode === 'practice') {
      if (optIdx === q.correctIndex) {
        AppState.engine.score++;
        showToast('Correct! Great job.', 'success');
      } else {
        showToast('Incorrect. Read the explanation below.', 'error');
      }
    }

    renderCurrentQuestion();
    renderQuestionPalette();
  }

  function renderQuestionPalette() {
    DOM.paletteGrid.innerHTML = '';
    AppState.engine.questions.forEach((_, idx) => {
      const btn = document.createElement('button');
      btn.className = 'palette-btn';
      btn.textContent = idx + 1;

      if (idx === AppState.engine.currentIndex) {
        btn.classList.add('current');
      }

      if (AppState.engine.userAnswers[idx] !== undefined) {
        btn.classList.add('answered');
      }

      if (AppState.engine.markedReview[idx]) {
        btn.classList.add('marked');
      }

      btn.addEventListener('click', () => {
        AppState.engine.currentIndex = idx;
        renderCurrentQuestion();
      });

      DOM.paletteGrid.appendChild(btn);
    });
  }

  function updateQuestionPaletteCurrent() {
    const buttons = DOM.paletteGrid.querySelectorAll('.palette-btn');
    buttons.forEach((btn, idx) => {
      btn.classList.toggle('current', idx === AppState.engine.currentIndex);
    });
  }

  function finishTestSession() {
    clearInterval(AppState.engine.timerInterval);
    AppState.engine.active = false;

    // Calculate score for test mode
    let calculatedScore = 0;
    AppState.engine.questions.forEach((q, idx) => {
      if (AppState.engine.userAnswers[idx] === q.correctIndex) {
        calculatedScore++;
      }
    });

    const total = AppState.engine.questions.length;
    const attemptedCount = Object.keys(AppState.engine.userAnswers).length;
    const accuracy = total > 0 ? Math.round((calculatedScore / total) * 100) : 0;
    const mins = String(Math.floor(AppState.engine.elapsedSeconds / 60)).padStart(2, '0');
    const secs = String(AppState.engine.elapsedSeconds % 60).padStart(2, '0');
    const timeFormatted = `${mins}:${secs}`;

    // Update Result View
    DOM.resScore.textContent = `${calculatedScore} / ${total}`;
    DOM.resAccuracy.textContent = `${accuracy}%`;
    DOM.resTime.textContent = timeFormatted;
    DOM.resAttempted.textContent = `${attemptedCount} / ${total}`;
    DOM.resultMetaText.textContent = `${AppState.engine.currentCourseTitle} • ${AppState.engine.mode === 'practice' ? 'Practice Mode' : 'Test Mode'}`;

    renderResultBreakdown(false);

    // Save Session to Local Storage
    saveSessionToStorage({
      course: AppState.engine.currentCourseTitle,
      score: calculatedScore,
      total: total,
      accuracy: accuracy,
      time: timeFormatted,
      date: new Date().toLocaleDateString()
    });

    DOM.engineStage.style.display = 'none';
    DOM.engineResultScreen.style.display = 'flex';
    DOM.engineResultScreen.scrollIntoView({ behavior: 'smooth' });

    renderProgressDashboard();
  }

  function renderResultBreakdown(showOnlyIncorrect = false) {
    DOM.resultBreakdownList.innerHTML = '';
    const letters = ['A', 'B', 'C', 'D'];

    AppState.engine.questions.forEach((q, idx) => {
      const userAns = AppState.engine.userAnswers[idx];
      const isCorrect = userAns === q.correctIndex;

      if (showOnlyIncorrect && isCorrect) return;

      const card = document.createElement('div');
      card.className = `breakdown-card ${isCorrect ? 'card-correct' : 'card-incorrect'}`;

      const userAnsText = userAns !== undefined ? `${letters[userAns]}. ${q.currentOptions[userAns]}` : 'Not Attempted';
      const correctAnsText = `${letters[q.correctIndex]}. ${q.currentOptions[q.correctIndex]}`;

      card.innerHTML = `
        <div style="display: flex; justify-content: space-between; margin-bottom: 8px;">
          <span style="font-weight: 700; color: var(--color-navy);">Question ${idx + 1}</span>
          <span style="font-size: 0.8rem; font-weight: 700; color: ${isCorrect ? 'var(--color-success)' : 'var(--color-danger)'}">
            ${isCorrect ? '✓ Correct' : (userAns !== undefined ? '✗ Incorrect' : '⚪ Skipped')}
          </span>
        </div>
        <p style="font-weight: 600; margin-bottom: 12px; color: var(--color-navy);">${q.question}</p>
        <div style="font-size: 0.9rem; margin-bottom: 8px;">
          <strong>Your Answer:</strong> <span style="color: ${isCorrect ? 'var(--color-success)' : 'var(--color-danger)'}">${userAnsText}</span>
        </div>
        <div style="font-size: 0.9rem; margin-bottom: 12px;">
          <strong>Correct Answer:</strong> <span style="color: var(--color-success); font-weight: 600;">${correctAnsText}</span>
        </div>
        <div style="background: var(--color-white); padding: 12px; border-radius: var(--radius-sm); font-size: 0.85rem; line-height: 1.5; color: var(--color-gray-700);">
          <strong>Explanation:</strong> ${q.explanation || 'Verified academic syllabus answer.'}
        </div>
      `;
      DOM.resultBreakdownList.appendChild(card);
    });
  }

  // -------------------------------------------------------------
  // LOCAL STORAGE & PROGRESS TRACKING
  // -------------------------------------------------------------
  const STORAGE_KEY = 'scrutiny_academy_progress';

  function getStoredProgress() {
    try {
      const data = localStorage.getItem(STORAGE_KEY);
      return data ? JSON.parse(data) : { sessions: [], totalAttempted: 0, totalCorrect: 0, totalIncorrect: 0 };
    } catch (e) {
      return { sessions: [], totalAttempted: 0, totalCorrect: 0, totalIncorrect: 0 };
    }
  }

  function saveSessionToStorage(session) {
    const progress = getStoredProgress();
    progress.sessions.unshift(session);
    if (progress.sessions.length > 20) progress.sessions.pop(); // Keep recent 20

    progress.totalAttempted += session.total;
    progress.totalCorrect += session.score;
    progress.totalIncorrect += (session.total - session.score);

    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(progress));
    } catch (e) {
      console.warn('Storage quota exceeded');
    }
  }

  function renderProgressDashboard() {
    const p = getStoredProgress();
    DOM.dashAttempted.textContent = p.totalAttempted;
    DOM.dashCorrect.textContent = p.totalCorrect;
    DOM.dashIncorrect.textContent = p.totalIncorrect;

    const acc = p.totalAttempted > 0 ? Math.round((p.totalCorrect / p.totalAttempted) * 100) : 0;
    DOM.dashAccuracy.textContent = `${acc}%`;

    DOM.recentSessionsList.innerHTML = '';
    if (p.sessions.length === 0) {
      DOM.recentSessionsList.innerHTML = `<p class="empty-hint">No sessions completed yet. Start practicing questions to see your progress!</p>`;
      return;
    }

    p.sessions.forEach(s => {
      const row = document.createElement('div');
      row.className = 'session-row';
      row.innerHTML = `
        <div class="session-info">
          <span class="session-title">${s.course}</span>
          <span class="session-time">${s.date} • Duration: ${s.time}</span>
        </div>
        <div class="session-score" style="color: ${s.accuracy >= 70 ? 'var(--color-success)' : 'var(--color-blue-primary)'}">
          ${s.score} / ${s.total} (${s.accuracy}%)
        </div>
      `;
      DOM.recentSessionsList.appendChild(row);
    });
  }

  // -------------------------------------------------------------
  // GLOBAL SEARCH CONTROLLER
  // -------------------------------------------------------------
  function openSearchModal() {
    DOM.searchModal.classList.add('open');
    DOM.searchModal.setAttribute('aria-hidden', 'false');
    DOM.globalSearchInput.focus();
  }

  function closeSearchModal() {
    DOM.searchModal.classList.remove('open');
    DOM.searchModal.setAttribute('aria-hidden', 'true');
    DOM.globalSearchInput.value = '';
    DOM.searchResultsList.innerHTML = `
      <div class="search-empty-state">
        Type a topic or concept (e.g. "Photosynthesis", "Optics", "Anatomy", "Mendel", "Cardiac") to search across all courses.
      </div>
    `;
  }

  function performSearch(query) {
    if (!query || query.trim().length < 2) {
      DOM.searchResultsList.innerHTML = `<div class="search-empty-state">Please enter at least 2 characters to search.</div>`;
      return;
    }

    const qLower = query.toLowerCase().trim();
    const matches = [];

    // Search cache or pre-bundled data
    const dataRoot = window.SCRUTINY_DATA || {};

    for (const course of ['class11','class12']) {
      for (const [subject, data] of Object.entries(dataRoot[course] || {})) {
        data.chapters.forEach(ch=>{
          const content=[ch.name,...(ch.topics||[]),...['vsaq','saq','laq','mcqs'].flatMap(f=>(ch[f]||[]).map(q=>q.question+' '+(q.answer||'')))].join(' ').toLowerCase();
          if(content.includes(qLower)) matches.push({category:course==='class11'?'Class 11':'Class 12',subject:data.subject,chapter:ch.name,text:ch.name,action:()=>{closeSearchModal();renderBoardView(course,subject,ch.id);document.getElementById(course).scrollIntoView({behavior:'smooth'});}});
        });
      }
    }

    // 1. Search Class 10
    if (dataRoot.class10) {
      for (let [subKey, subData] of Object.entries(dataRoot.class10)) {
        subData.chapters?.forEach(ch => {
          if (ch.name.toLowerCase().includes(qLower) || ch.overview?.toLowerCase().includes(qLower)) {
            matches.push({
              category: 'Class 10 SSC',
              subject: subData.subject,
              chapter: ch.name,
              text: `Chapter: ${ch.name}`,
              action: () => {
                closeSearchModal();
                AppState.activeSubjectKey = subKey;
                renderClass10View();
                document.getElementById('class10').scrollIntoView({ behavior: 'smooth' });
              }
            });
          }
          ch.mcqs?.forEach(mcq => {
            if (mcq.question.toLowerCase().includes(qLower) || mcq.explanation?.toLowerCase().includes(qLower)) {
              matches.push({
                category: 'Class 10 SSC',
                subject: subData.subject,
                chapter: ch.name,
                text: mcq.question,
                action: () => {
                  closeSearchModal();
                  launchEngineWithQuestions([mcq], `Class 10 ${subData.subject}`, 'practice');
                }
              });
            }
          });
        });
      }
    }

    // 2. Search NEET
    if (dataRoot.neet) {
      for (let [subKey, subData] of Object.entries(dataRoot.neet)) {
        subData.chapters?.forEach(ch => {
          ch.mcqs?.forEach(mcq => {
            if (mcq.question.toLowerCase().includes(qLower) || mcq.explanation?.toLowerCase().includes(qLower)) {
              matches.push({
                category: 'NEET UG',
                subject: subData.subject,
                chapter: mcq.chapter || ch.name,
                text: mcq.question,
                action: () => {
                  closeSearchModal();
                  launchEngineWithQuestions([mcq], `NEET ${subData.subject}`, 'practice');
                }
              });
            }
          });
        });
      }
    }

    // 3. Search MBBS
    if (dataRoot.mbbs) {
      for (let [subKey, subData] of Object.entries(dataRoot.mbbs)) {
        subData.chapters?.forEach(ch => {
          ch.mcqs?.forEach(mcq => {
            if (mcq.question.toLowerCase().includes(qLower) || mcq.explanation?.toLowerCase().includes(qLower)) {
              matches.push({
                category: 'MBBS Medical',
                subject: subData.subject,
                chapter: mcq.topic || ch.name,
                text: mcq.question,
                action: () => {
                  closeSearchModal();
                  launchEngineWithQuestions([mcq], `MBBS ${subData.subject}`, 'practice');
                }
              });
            }
          });
        });
      }
    }

    // Render results
    if (matches.length === 0) {
      DOM.searchResultsList.innerHTML = `<div class="search-empty-state">No matching questions or topics found for "${escapeText(query)}".</div>`;
      return;
    }

    DOM.searchResultsList.innerHTML = '';
    matches.slice(0, 30).forEach(m => {
      const item = document.createElement('div');
      item.className = 'search-item-result';
      item.innerHTML = `
        <div class="search-item-badges">
          <span class="q-badge-tag">${m.category}</span>
          <span style="font-size: 0.75rem; font-weight: 700; color: var(--color-blue-primary);">${m.subject}</span>
          <span style="font-size: 0.75rem; color: var(--color-gray-600);">${m.chapter}</span>
        </div>
        <div class="search-item-title">${m.text}</div>
      `;
      item.addEventListener('click', m.action);
      DOM.searchResultsList.appendChild(item);
    });
  }

  // -------------------------------------------------------------
  // SUPPORT MODAL & UPI ACTIONS
  // -------------------------------------------------------------
  function openSupportModal() {
    DOM.supportModal.classList.add('open');
    DOM.supportModal.setAttribute('aria-hidden', 'false');
  }

  function closeSupportModal() {
    DOM.supportModal.classList.remove('open');
    DOM.supportModal.setAttribute('aria-hidden', 'true');
  }

  function copyUpiId() {
    const upi = DOM.upiIdText.textContent.trim();
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(upi).then(() => {
        showToast('UPI ID copied to clipboard!', 'success');
      }).catch(() => {
        fallbackCopyText(upi);
      });
    } else {
      fallbackCopyText(upi);
    }
  }

  function fallbackCopyText(text) {
    const input = document.createElement('input');
    input.value = text;
    document.body.appendChild(input);
    input.select();
    document.execCommand('copy');
    document.body.removeChild(input);
    showToast('UPI ID copied to clipboard!', 'success');
  }

  // -------------------------------------------------------------
  // TOAST NOTIFICATION UTILITY
  // -------------------------------------------------------------
  let toastTimeout;
  function showToast(message, type = 'info') {
    clearTimeout(toastTimeout);
    DOM.toast.textContent = message;
    DOM.toast.className = `toast-notification show ${type}`;
    toastTimeout = setTimeout(() => {
      DOM.toast.classList.remove('show');
    }, 3200);
  }

  // -------------------------------------------------------------
  // BRAND PROTECTION & CONTENT DETERRENTS
  // -------------------------------------------------------------
  function setupBrandProtection() {
    // 1. Right click notification deterrent
    document.addEventListener('contextmenu', (e) => {
      // Allow right clicks on inputs, textareas
      if (['INPUT', 'TEXTAREA'].includes(e.target.tagName)) return;
      e.preventDefault();
      showToast('Content Protected • Scrutiny Academy');
    });

    // 2. Prevent accidental image dragging
    document.addEventListener('dragstart', (e) => {
      if (e.target.tagName === 'IMG') {
        e.preventDefault();
      }
    });

    // 3. Clipboard Attribution appending
    document.addEventListener('copy', (e) => {
      const selection = window.getSelection();
      if (!selection.rangeCount) return;
      
      const selectedText = selection.toString();
      if (selectedText.length > 50) {
        const attribution = `\n\n[Source: Scrutiny Academy • Learn • Understand • Practice • Master (https://scrutinyacademy.github.io)]`;
        if (e.clipboardData) {
          e.clipboardData.setData('text/plain', selectedText + attribution);
          e.preventDefault();
        }
      }
    });
  }

  // -------------------------------------------------------------
  // EVENT LISTENERS REGISTRATION
  // -------------------------------------------------------------
  function setupEventListeners() {
    // Mobile Drawer Toggle
    DOM.mobileMenuBtn?.addEventListener('click', () => {
      const isOpen = DOM.mobileDrawer.classList.toggle('open');
      DOM.mobileMenuBtn.setAttribute('aria-expanded', isOpen);
    });

    // Close mobile drawer on link click
    document.querySelectorAll('.mobile-nav-link').forEach(link => {
      link.addEventListener('click', () => {
        DOM.mobileDrawer.classList.remove('open');
        DOM.mobileMenuBtn.setAttribute('aria-expanded', 'false');
      });
    });

    // Quick Test Hero Button
    DOM.heroQuickTestBtn?.addEventListener('click', () => {
      document.getElementById('mcq-engine').scrollIntoView({ behavior: 'smooth' });
    });

    // Class 10 Subject Switcher
    DOM.c10SubjectTabs?.addEventListener('click', (e) => {
      const btn = e.target.closest('.pill-btn');
      if (!btn) return;
      DOM.c10SubjectTabs.querySelectorAll('.pill-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      AppState.activeSubjectKey = btn.dataset.subject;
      AppState.activeChapterIndex = 0;
      renderClass10View();
    });

    // Class 10 Chapter Select
    DOM.c10ChapterSelect?.addEventListener('change', () => {
      AppState.activeChapterIndex = parseInt(DOM.c10ChapterSelect.value, 10) || 0;
      const subKey = AppState.activeSubjectKey;
      const data = AppState.dataCache[`data/class10/${subKey}.json`];
      if (data) renderClass10FormatContent(data);
    });

    // Class 10 Question Format Tabs
    DOM.c10FormatTabs?.addEventListener('click', (e) => {
      const btn = e.target.closest('.qtab-btn');
      if (!btn) return;
      DOM.c10FormatTabs.querySelectorAll('.qtab-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      AppState.activeFormat = btn.dataset.format;
      const subKey = AppState.activeSubjectKey;
      const data = AppState.dataCache[`data/class10/${subKey}.json`];
      if (data) renderClass10FormatContent(data);
    });

    // Class 10 Subject Launch Button
    DOM.c10LaunchMcqBtn?.addEventListener('click', async () => {
      const subKey = AppState.activeSubjectKey;
      const data = await loadDataFile(`data/class10/${subKey}.json`, ['class10', subKey]);
      if (data && data.chapters) {
        const allMcqs = data.chapters.flatMap(ch => ch.mcqs || []);
        launchEngineWithQuestions(allMcqs, `Class 10 ${data.subject}`, 'practice');
      }
    });

    // NEET Subject Tabs
    DOM.neetSubjectTabs?.addEventListener('click', (e) => {
      const btn = e.target.closest('.pill-btn');
      if (!btn) return;
      DOM.neetSubjectTabs.querySelectorAll('.pill-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      renderNeetView();
    });

    DOM.neetPracticeBtn?.addEventListener('click', () => launchSelectedNeet('practice'));
    DOM.neetTestBtn?.addEventListener('click', () => launchSelectedNeet('test'));

    // MBBS Phase Filter Tabs
    DOM.mbbsPhaseTabs?.addEventListener('click', (e) => {
      const btn = e.target.closest('.phase-btn');
      if (!btn) return;
      DOM.mbbsPhaseTabs.querySelectorAll('.phase-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      renderMbbsView(btn.dataset.phase);
    });

    // MCQ Engine Mode Switcher
    DOM.btnModePractice?.addEventListener('click', () => {
      DOM.btnModePractice.classList.add('active');
      DOM.btnModeTest.classList.remove('active');
      AppState.engine.mode = 'practice';
    });

    DOM.btnModeTest?.addEventListener('click', () => {
      DOM.btnModeTest.classList.add('active');
      DOM.btnModePractice.classList.remove('active');
      AppState.engine.mode = 'test';
    });

    // MCQ Engine Start
    DOM.engineStartBtn?.addEventListener('click', async () => {
      const selected = DOM.engineSubjectSelect.value.split(':');
      const curKey = selected[0];
      const subKey = selected[1];
      const data = await loadDataFile(`data/${curKey}/${subKey}.json`, [curKey, subKey]);

      if (data && data.chapters) {
        const allMcqs = data.chapters.flatMap(ch => ch.mcqs || []);
        launchEngineWithQuestions(allMcqs, `${data.subject || subKey}`, AppState.engine.mode);
      }
    });

    // MCQ Stage Navigation Buttons
    DOM.btnPrevQ?.addEventListener('click', () => {
      if (AppState.engine.currentIndex > 0) {
        AppState.engine.currentIndex--;
        renderCurrentQuestion();
      }
    });

    DOM.btnNextQ?.addEventListener('click', () => {
      if (AppState.engine.currentIndex < AppState.engine.questions.length - 1) {
        AppState.engine.currentIndex++;
        renderCurrentQuestion();
      }
    });

    DOM.btnSubmitTest?.addEventListener('click', () => {
      const unanswered = AppState.engine.questions.length - Object.keys(AppState.engine.userAnswers).length;
      if (unanswered > 0) {
        if (!confirm(`You still have ${unanswered} unanswered question(s). Are you sure you want to submit?`)) {
          return;
        }
      }
      finishTestSession();
    });

    DOM.btnMarkReview?.addEventListener('click', () => {
      const cur = AppState.engine.currentIndex;
      AppState.engine.markedReview[cur] = !AppState.engine.markedReview[cur];
      renderCurrentQuestion();
      renderQuestionPalette();
    });

    DOM.btnTogglePalette?.addEventListener('click', () => {
      const isVisible = DOM.paletteDrawer.style.display === 'block';
      DOM.paletteDrawer.style.display = isVisible ? 'none' : 'block';
    });

    // Result Screen Buttons
    DOM.btnRetakeTest?.addEventListener('click', () => {
      launchEngineWithQuestions(AppState.engine.questions, AppState.engine.currentCourseTitle, AppState.engine.mode);
    });

    DOM.btnReviewIncorrect?.addEventListener('click', () => {
      renderResultBreakdown(true);
      showToast('Showing only incorrect/skipped questions');
    });

    DOM.btnResetEngine?.addEventListener('click', () => {
      DOM.engineResultScreen.style.display = 'none';
      DOM.engineConfigBar.style.display = 'flex';
      DOM.engineConfigBar.scrollIntoView({ behavior: 'smooth' });
    });

    // Progress Reset
    DOM.btnClearProgress?.addEventListener('click', () => {
      if (confirm('Are you sure you want to reset all your progress data? This cannot be undone.')) {
        localStorage.removeItem(STORAGE_KEY);
        renderProgressDashboard();
        showToast('Progress data cleared');
      }
    });

    // Support Modal
    DOM.openSupportModalBtn?.addEventListener('click', openSupportModal);
    DOM.modalCloseBtn?.addEventListener('click', closeSupportModal);
    DOM.supportModal?.addEventListener('click', (e) => {
      if (e.target === DOM.supportModal) closeSupportModal();
    });
    DOM.btnCopyUpi?.addEventListener('click', copyUpiId);

    // Search Trigger & Modal
    DOM.searchTrigger?.addEventListener('click', openSearchModal);
    DOM.searchCloseBtn?.addEventListener('click', closeSearchModal);
    DOM.searchModal?.addEventListener('click', (e) => {
      if (e.target === DOM.searchModal) closeSearchModal();
    });

    let searchDebounce;
    DOM.globalSearchInput?.addEventListener('input', (e) => {
      clearTimeout(searchDebounce);
      searchDebounce = setTimeout(() => {
        performSearch(e.target.value);
      }, 200);
    });

    // Keyboard Shortcuts
    document.addEventListener('keydown', (e) => {
      // ⌘K or Ctrl+K for search
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        openSearchModal();
      }
      // Escape closes modals
      if (e.key === 'Escape') {
        closeSearchModal();
        closeSupportModal();
      }
    });
  }

  // Run on DOM Ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initApp);
  } else {
    initApp();
  }

})();
