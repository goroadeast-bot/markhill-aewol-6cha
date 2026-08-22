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

// Scroll-to-hero floating button
const scrollTopBtn = document.getElementById('scrollTopBtn');
const heroSection = document.querySelector('.hero-split');

if (scrollTopBtn && heroSection) {
  const heroVisibilityObserver = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        scrollTopBtn.classList.toggle('is-visible', !entry.isIntersecting);
      }
    },
    { threshold: 0 }
  );
  heroVisibilityObserver.observe(heroSection);
}

// Hero copy + card entrance animation
const heroCopy = document.querySelector('.hero-copy');
const heroCardEls = Array.from(document.querySelectorAll('.hero-card'));
const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

function splitIntoWords(el, className) {
  const words = el.textContent.trim().split(/\s+/);
  el.innerHTML = words.map((word, i) => `<span class="${className}" style="--i:${i}">${word}</span>`).join(' ');
}

if (heroCopy && heroCardEls.length) {
  heroCardEls.forEach((card) => {
    const desc = card.querySelector('.hero-card-desc');
    if (desc) splitIntoWords(desc, 'hero-card-word');
  });

  if (reduceMotion) {
    heroCopy.classList.add('is-visible');
    heroCardEls.forEach((card) => card.classList.add('is-revealed'));
  } else {
    requestAnimationFrame(() => heroCopy.classList.add('is-visible'));
    const copyDoneAt = 1240;
    heroCardEls.forEach((card, i) => {
      setTimeout(() => card.classList.add('is-revealed'), copyDoneAt + i * 220);
    });
  }
}

// Overview intro — repeats every time it scrolls into/out of view (not one-shot)
const overviewIntro = document.querySelector('.overview-intro');
if (overviewIntro) {
  const introObserver = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        entry.target.classList.toggle('is-visible', entry.isIntersecting);
      }
    },
    { threshold: 0.2 }
  );
  introObserver.observe(overviewIntro);
}

// Location rows + map — same repeat-reveal pattern as the overview intro group
const locationReveals = Array.from(document.querySelectorAll('.location-row, .location-map'));
if (locationReveals.length) {
  const locationObserver = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        entry.target.classList.toggle('is-visible', entry.isIntersecting);
      }
    },
    { threshold: 0.2 }
  );
  locationReveals.forEach((el) => locationObserver.observe(el));
}

// Types intro — title-only repeat-reveal, same pattern as overview/location
const typesIntro = document.querySelector('.types-intro');
if (typesIntro) {
  const typesObserver = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        entry.target.classList.toggle('is-visible', entry.isIntersecting);
      }
    },
    { threshold: 0.2 }
  );
  typesObserver.observe(typesIntro);
}

// Terms block — sweep-highlight the key figures in order, staggered 160ms apart, repeats
const termsBlock = document.querySelector('.terms-block');
if (termsBlock) {
  const termsHighlights = Array.from(termsBlock.querySelectorAll('.terms-hl'));
  termsHighlights.forEach((el, i) => {
    el.style.transitionDelay = `${i * 160}ms`;
  });
  const termsObserver = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        entry.target.classList.toggle('is-visible', entry.isIntersecting);
      }
    },
    { threshold: 0.2 }
  );
  termsObserver.observe(termsBlock);
}

// Siteplan scroll-linked scale (0.78 at bottom of viewport → 1.00 when centered) + caption trigger
const siteplanScaler = document.querySelector('.siteplan-scaler');
const siteplanCaption = document.querySelector('.siteplan-caption');
const START_SCALE = 0.78;

if (siteplanScaler && siteplanCaption && !reduceMotion) {
  const updateSiteplanScale = () => {
    const rect = siteplanScaler.getBoundingClientRect();
    const centerY = rect.top + rect.height / 2;
    const progress = Math.max(0, Math.min(1, (window.innerHeight - centerY) / (window.innerHeight * 0.5)));
    const scale = START_SCALE + progress * (1 - START_SCALE);
    siteplanScaler.style.transform = `scale(${scale.toFixed(3)})`;
    siteplanCaption.classList.toggle('is-revealed', progress >= 0.995);
  };
  window.addEventListener('scroll', updateSiteplanScale, { passive: true });
  window.addEventListener('resize', updateSiteplanScale);
  updateSiteplanScale();
} else if (siteplanCaption) {
  siteplanCaption.classList.add('is-revealed');
}

// Phone modal
const phoneModal = document.getElementById('phoneModal');

function isMobileDevice() {
  return /Android|iPhone|iPad|iPod|Windows Phone/i.test(navigator.userAgent);
}

const phoneLinks = document.querySelectorAll('a[href^="tel:"]');
if (phoneModal && phoneLinks.length) {
  phoneLinks.forEach((link) => {
    link.addEventListener('click', (e) => {
      if (!isMobileDevice()) {
        e.preventDefault();
        phoneModal.setAttribute('aria-hidden', 'false');
      }
      // 모바일: 기본 동작(전화 앱 연결)을 그대로 둠
    });
  });
}

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
