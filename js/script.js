import { CHAPTER_IDS, resolveChapter } from './chapter-router.js';

const sections = new Map(
  Array.from(document.querySelectorAll('[data-chapter]')).map((el) => [el.dataset.chapter, el])
);
const navButtons = Array.from(document.querySelectorAll('[data-nav-target]'));

function showChapter(requestedId) {
  const id = resolveChapter(requestedId);
  for (const chapterId of CHAPTER_IDS) {
    const section = sections.get(chapterId);
    if (!section) continue;
    const isTarget = chapterId === id;
    section.hidden = !isTarget;
    section.classList.toggle('is-entering', isTarget);
  }
  for (const btn of navButtons) {
    btn.setAttribute('aria-current', btn.dataset.navTarget === id ? 'true' : 'false');
  }
  window.location.hash = id;
}

for (const btn of navButtons) {
  btn.addEventListener('click', () => showChapter(btn.dataset.navTarget));
}

window.addEventListener('hashchange', () => {
  showChapter(window.location.hash.replace('#', ''));
});

showChapter(window.location.hash.replace('#', '') || CHAPTER_IDS[0]);

// Phone modal
const phoneModal = document.getElementById('phoneModal');
const phoneCopyBtn = document.getElementById('phoneCopyBtn');

document.addEventListener('click', (e) => {
  if (e.target.closest('[data-open-phone-modal]')) {
    phoneModal.setAttribute('aria-hidden', 'false');
  }
  if (e.target.closest('[data-phone-modal-close]')) {
    phoneModal.setAttribute('aria-hidden', 'true');
  }
});

phoneCopyBtn?.addEventListener('click', async () => {
  await navigator.clipboard.writeText('010-9347-1345');
  phoneCopyBtn.textContent = '복사되었습니다';
  setTimeout(() => { phoneCopyBtn.textContent = '번호 복사하기'; }, 2000);
});
