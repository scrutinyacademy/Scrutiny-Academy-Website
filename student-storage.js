(() => {
  if (window.ScrutinyStudentStorage) return;
  let uid = null;
  let generation = 0;
  const keyFor = (key) => uid ? `scrutiny_student:${encodeURIComponent(uid)}:${key}` : null;
  window.ScrutinyStudentStorage = {
    get uid() { return uid; },
    get generation() { return generation; },
    setUser(user) {
      const next = user?.uid || null;
      if (next === uid) return;
      uid = next;
      generation++;
      window.__scrutinyProgress = {};
      window.__scrutinyStudentContext = null;
      window.dispatchEvent(new CustomEvent('scrutiny:student-changed', { detail: { uid } }));
    },
    getItem(key) {
      const scoped = keyFor(key);
      if (!scoped) return null;
      try { return localStorage.getItem(scoped); } catch { return null; }
    },
    setItem(key, value) {
      const scoped = keyFor(key);
      if (scoped) localStorage.setItem(scoped, value);
    },
    removeItem(key) {
      const scoped = keyFor(key);
      if (scoped) localStorage.removeItem(scoped);
    },
  };
  // Unattributed browser-wide history is never assigned to a student.
})();
