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
  window.scrollTo({ top: 0, behavior: 'instant' });
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

const phoneModalNumber = document.querySelector('.phone-modal-number');

phoneCopyBtn?.addEventListener('click', async () => {
  const phoneNumber = phoneModalNumber?.textContent.trim() ?? '';
  await navigator.clipboard.writeText(phoneNumber);
  phoneCopyBtn.textContent = '복사되었습니다';
  setTimeout(() => { phoneCopyBtn.textContent = '번호 복사하기'; }, 2000);
});

// Scroll-triggered stagger reveal
const revealObserver = new IntersectionObserver(
  (entries) => {
    for (const entry of entries) {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-visible');
        revealObserver.unobserve(entry.target);
      }
    }
  },
  { threshold: 0.15 }
);

function observeReveals(root) {
  root.querySelectorAll('.reveal').forEach((el, i) => {
    el.style.transitionDelay = `${Math.min(i % 6, 5) * 60}ms`;
    revealObserver.observe(el);
  });
}

observeReveals(document);
