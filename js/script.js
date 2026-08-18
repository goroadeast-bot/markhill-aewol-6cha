import { NAV_ZONES, pickActiveNav } from './scroll-spy.js';

const navLinks = Array.from(document.querySelectorAll('.chapter-nav-list a[href]'));
const zoneRatios = new Map(NAV_ZONES.map((zone) => [zone.navTarget, 0]));
const sectionToZone = new Map(NAV_ZONES.map((zone) => [zone.sectionId, zone.navTarget]));

function updateActiveNav() {
  const visibleZones = [...zoneRatios.entries()]
    .filter(([, ratio]) => ratio > 0)
    .map(([navTarget, ratio]) => ({ navTarget, ratio }));
  const active = pickActiveNav(visibleZones);
  for (const link of navLinks) {
    link.setAttribute('aria-current', link.getAttribute('href') === `#${active}` ? 'true' : 'false');
  }
}

const zoneObserver = new IntersectionObserver(
  (entries) => {
    for (const entry of entries) {
      const navTarget = sectionToZone.get(entry.target.id);
      if (!navTarget) continue;
      zoneRatios.set(navTarget, entry.intersectionRatio);
    }
    updateActiveNav();
  },
  { rootMargin: '-76px 0px -55% 0px', threshold: [0, 0.25, 0.5, 0.75, 1] }
);

for (const zone of NAV_ZONES) {
  const section = document.getElementById(zone.sectionId);
  if (section) zoneObserver.observe(section);
}

// The observer above only fires on crossings of its quantized thresholds
// (0/25/50/75/100%). A fast programmatic scroll (e.g. clicking a nav link,
// which triggers the browser's native smooth-scroll over a long single-scroll
// page) can settle at a position whose true ratio never lands on one of those
// thresholds, leaving zoneRatios — and therefore aria-current — stuck on a
// section that scrolled out of view mid-animation. Once scrolling actually
// stops, recompute each zone's ratio directly from layout to correct that.
let scrollSettleTimer;
window.addEventListener(
  'scroll',
  () => {
    clearTimeout(scrollSettleTimer);
    scrollSettleTimer = setTimeout(() => {
      const bandTop = 76;
      const bandBottom = window.innerHeight * 0.45; // matches rootMargin's -55% bottom inset
      for (const zone of NAV_ZONES) {
        const section = document.getElementById(zone.sectionId);
        if (!section) continue;
        const rect = section.getBoundingClientRect();
        const overlap = Math.max(0, Math.min(rect.bottom, bandBottom) - Math.max(rect.top, bandTop));
        zoneRatios.set(zone.navTarget, rect.height > 0 ? overlap / rect.height : 0);
      }
      updateActiveNav();
    }, 150);
  },
  { passive: true }
);

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
