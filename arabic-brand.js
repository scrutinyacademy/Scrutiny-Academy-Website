// Shared collaboration identity across the Arabic course and its lessons.
export function arabicCollaboration(variant = '') {
  return `<div class="arabic-collaboration ${variant}" aria-label="A collaboration between Scrutiny Academy and Quddusi Intellectual Forum"><span class="collaboration-label">IN COLLABORATION</span><div class="collaboration-names"><span>Scrutiny Academy</span><span class="collaboration-cross" aria-hidden="true">×</span><span>Quddusi Intellectual Forum</span></div></div>`;
}
