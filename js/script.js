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

// Premium intro — same repeat-reveal pattern as overview/location/types
const premiumIntro = document.querySelector('.premium-intro');
if (premiumIntro) {
  const premiumObserver = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        entry.target.classList.toggle('is-visible', entry.isIntersecting);
      }
    },
    { threshold: 0.2 }
  );
  premiumObserver.observe(premiumIntro);
}

// Premium note — sweep-highlight "참고용 이미지", repeats on scroll in/out
const premiumNote = document.querySelector('.acc-note');
if (premiumNote) {
  const premiumNoteObserver = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        entry.target.classList.toggle('is-visible', entry.isIntersecting);
      }
    },
    { threshold: 0.6 }
  );
  premiumNoteObserver.observe(premiumNote);
}

// Rooftop intro — title words mask-reveal + eyebrow/lede fade, same repeat-reveal group
const rooftopIntro = document.querySelector('.rooftop-intro');
if (rooftopIntro) {
  const rooftopIntroObserver = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        entry.target.classList.toggle('is-visible', entry.isIntersecting);
      }
    },
    { threshold: 0.3 }
  );
  rooftopIntroObserver.observe(rooftopIntro);
}

// Rooftop bento grid — cells stagger in (delays set inline in HTML), stat tile counts up 0 → 2.93kw
const rooftopBento = document.querySelector('.rooftop-bento');
const rooftopNum = document.getElementById('rooftopNum');
if (rooftopBento) {
  const ROOFTOP_TARGET = 2.93;
  let rooftopCountTimer = null;

  function setRooftopNum(value) {
    if (!rooftopNum) return;
    rooftopNum.innerHTML = `${value.toFixed(2)}<span class="rooftop-unit-kw">kw</span>`;
  }

  function rooftopCountUp() {
    clearInterval(rooftopCountTimer);
    const duration = 900;
    const start = Date.now();
    rooftopCountTimer = setInterval(() => {
      const progress = Math.min(1, (Date.now() - start) / duration);
      const eased = 1 - Math.pow(1 - progress, 3);
      setRooftopNum(ROOFTOP_TARGET * eased);
      if (progress >= 1) clearInterval(rooftopCountTimer);
    }, 16);
  }

  if (reduceMotion) {
    rooftopBento.classList.add('is-visible');
    setRooftopNum(ROOFTOP_TARGET);
  } else {
    setRooftopNum(0);
    let rooftopWasVisible = false;
    const rooftopBentoObserver = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          rooftopBento.classList.toggle('is-visible', entry.isIntersecting);
          if (entry.isIntersecting && !rooftopWasVisible) {
            setTimeout(rooftopCountUp, 900);
          } else if (!entry.isIntersecting && rooftopWasVisible) {
            clearInterval(rooftopCountTimer);
            setRooftopNum(0);
          }
          rooftopWasVisible = entry.isIntersecting;
        }
      },
      { threshold: 0.3 }
    );
    rooftopBentoObserver.observe(rooftopBento);
  }
}

// Rooftop note — sweep-highlight "참고용 이미지", repeats on scroll in/out
const rooftopNote = document.getElementById('rooftopNote');
if (rooftopNote) {
  const rooftopNoteObserver = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        entry.target.classList.toggle('is-visible', entry.isIntersecting);
      }
    },
    { threshold: 0.6 }
  );
  rooftopNoteObserver.observe(rooftopNote);
}

// History timeline — items reveal on scroll, sticky rail tracks the active phase
const historyTimeline = document.querySelector('.htl');
if (historyTimeline) {
  const htlItems = Array.from(historyTimeline.querySelectorAll('.htl-item'));
  const htlYear = document.getElementById('htlYear');
  const htlPlace = document.getElementById('htlPlace');
  const htlIdx = document.getElementById('htlIdx');
  const htlBar = document.getElementById('htlBar');

  function setHistoryRail(item) {
    const year = item.dataset.year;
    const place = item.dataset.place;
    htlIdx.textContent = item.dataset.idx;
    if (htlYear.textContent === year && htlPlace.textContent === place) return;
    htlYear.classList.add('is-swapping');
    htlPlace.classList.add('is-swapping');
    setTimeout(() => {
      htlYear.textContent = year;
      htlPlace.textContent = place;
      htlYear.classList.remove('is-swapping');
      htlPlace.classList.remove('is-swapping');
    }, 190);
  }

  if (reduceMotion) {
    htlItems.forEach((el) => el.classList.add('is-visible'));
    setHistoryRail(htlItems[htlItems.length - 1]);
    htlBar.style.width = '100%';
  } else {
    const htlObserver = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          entry.target.classList.toggle('is-visible', entry.isIntersecting);
        }
      },
      { threshold: 0.2 }
    );
    htlItems.forEach((el) => htlObserver.observe(el));

    let htlActive = -1;
    const updateHistoryRail = () => {
      const line = window.innerHeight * 0.38;
      let best = 0;
      htlItems.forEach((el, i) => {
        if (el.getBoundingClientRect().top <= line) best = i;
      });
      if (best === htlActive) return;
      htlActive = best;
      setHistoryRail(htlItems[best]);
      htlBar.style.width = `${Math.round(((best + 1) / htlItems.length) * 100)}%`;
    };
    window.addEventListener('scroll', updateHistoryRail, { passive: true });
    window.addEventListener('resize', updateHistoryRail);
    updateHistoryRail();
  }
}

// History phase modal — 1~5차 카드를 클릭하면 markhill_blog 원문을 정리한 상세 내용을 보여줌
const HISTORY_PHASES = {
  1: {
    tag: '1차 · 2020~21 · 애월읍 상귀리', title: '마크힐의 시작',
    photo: 'images/history-1cha.jpg',
    specs: [['공급/전용', '143.5㎡(43.4평) · 128.6㎡(38.9평)'], ['세대수', '18세대 · 3개동'], ['준공', '2021년 5월']],
    gallery: [
      ['images/history-modal-1cha-living.jpg', '거실'],
      ['images/history-modal-1cha-kitchen.jpg', '주방'],
      ['images/history-modal-1cha-dining.jpg', '다이닝룸'],
      ['images/history-modal-1cha-master.jpg', '안방'],
    ],
    feat: [
      '지상 4층 필로티 구조, 세대당 <b>2+@대</b> 주차',
      '애조로 인접 — 신제주 15분·외도 10분·하귀 5분, 하귀초·귀일중 도보권',
      '다이닝룸 <b>루바 슬라이딩도어</b> — 훗날 "히든 슬라이딩도어"로 이어지는 마크힐 시그니처의 시작',
      '아일랜드 주방, 조리대·개수대 <b>천연대리석</b> 마감',
      '거실 헤링본 강마루 + 우드&amp;스텐 실링팬',
      '안방 욕실 <b>테라조타일 + 타일욕조</b>',
    ],
    note: '당시 분양가 3억 1,900만~3억 7,900만원(층별 상이) · 준공 전 완판.',
  },
  2: {
    tag: '2차 · 2022 · 애월읍 상귀리', title: '기둥을 없애다',
    photo: 'images/history-2cha.jpg',
    specs: [['공급/전용', '143.8㎡(43.5평) · 123.9㎡(37.5평)'], ['세대수', '23세대 · 4개동'], ['준공', '2022년 7월']],
    gallery: [
      ['images/history-modal-2cha-living.jpg', '거실'],
      ['images/history-modal-2cha-kitchen.jpg', '주방'],
      ['images/history-modal-2cha-dining.jpg', '다이닝룸'],
      ['images/history-modal-2cha-master.jpg', '안방'],
    ],
    feat: [
      '1차의 <b>환기 부족을 개선</b> — 별도 환풍기 추가, 도어를 갤러리도어 형태로 변경',
      '1차엔 있던 다이닝룸 앞 <b>구조기둥을 설계변경으로 제거</b> — 더 시원한 개방감',
      '현관 거울 간접등 + 6~70족 신발장, 전 세대 4bay 구조',
      '아일랜드 주방·대리석 상판, 거실 헤링본마루 등 1차 구성 계승',
      '안방 욕실 테라조타일 + 타일욕조 유지',
    ],
    note: '당시 분양가 3억 7,200만~4억 1,800만원 · 1차 완판 신화를 이어 빠르게 계약.',
  },
  3: {
    tag: '3차 · 2022 · 애월읍 상귀리', title: '조망으로 나뉜 배치',
    photo: 'images/history-3cha.jpg',
    specs: [['공급/전용', '143.5㎡(43.4평) · 124.4㎡(37.7평)'], ['세대수', '26세대'], ['배치', '오션뷰 2개동 · 정남향 1개동']],
    gallery: [
      ['images/history-modal-2cha-living.jpg', '거실'],
      ['images/history-modal-2cha-kitchen.jpg', '주방'],
      ['images/history-modal-2cha-dining.jpg', '다이닝룸'],
      ['images/history-modal-2cha-master.jpg', '안방'],
    ],
    galleryNote: '내부구조·인테리어가 2차와 동일해 2차 사진으로 대신합니다.',
    feat: [
      '2차와 <b>동일한 내부구조·옵션</b>으로 동시 진행',
      '오션뷰 2개동 + 정남향 1개동 배치 — 두 방향 모두 선호도 높은 구성',
      '애조로·중산간도로 사이 — 노형·중문·조천·한림 교통 편리',
      '오픈과 동시에 계약 시작, 사전계약 기간 특전 진행',
    ],
    note: '당시 분양가 2차와 동일(3억 7,200만~4억 1,800만원).',
  },
  4: {
    tag: '4차 · 2023 · 제주시 외도일동', title: '마크힐, 동지역으로',
    photo: 'images/history-4cha.jpg',
    specs: [['전용/실사용', '25.7평 · 약 35평(발코니 확장 포함)'], ['세대수', '12세대 · 2개동'], ['준공', '2023년 9월']],
    gallery: [
      ['images/history-modal-4cha-living.jpg', '거실'],
      ['images/history-modal-4cha-kitchen.jpg', '주방'],
      ['images/history-modal-4cha-dining.jpg', '다이닝룸'],
      ['images/history-modal-4cha-master.jpg', '안방'],
    ],
    feat: [
      '오션동 6세대 + 포레동 6세대, 필로티형 2개동',
      '<b>가전·보일러 모바일 제어 최초 도입</b> — 삼성 스마트씽 앱으로 에어컨·보일러 제어',
      '다이닝 우드 슬라이딩도어(히든 다용도실 출입문) 유지, 안방 욕조 높이를 낮춤',
      '주방 대리석 상판을 측면까지 확장',
      '샘플하우스 디피 제품 판매수익을 <b>제주사회복지공동모금회에 기부</b>',
    ],
    note: '외도일동 첫 마크힐 — 상귀리 밖에서도 "마크힐" 이름을 이어감.',
  },
  5: {
    tag: '5차 · 2024~25 · 노형동', title: '펜트하우스, 그리고 세라믹',
    photo: 'images/history-5cha-penthouse.jpg',
    specs: [['공급/전용', '105.1㎡ · 84.9㎡(+발코니 32.9㎡)'], ['세대수', '48세대 · 8개동'], ['준공', '2025.7.17 사용승인']],
    gallery: [
      ['images/history-modal-5cha-living.jpg', '거실'],
      ['images/history-modal-5cha-kitchen.jpg', '주방'],
      ['images/history-modal-5cha-dining.jpg', '다이닝룸'],
      ['images/history-modal-5cha-master.jpg', '안방'],
    ],
    feat: [
      '마크힐 최초 <b>복층형 펜트하우스 8세대</b> — 보이드 구조로 개방감 확보',
      '주방 상판을 대리석에서 <b>세라믹</b>으로 처음 전환(오염·열기에 강함)',
      '안방 욕실 <b>조적욕조</b> — 1차부터 이어온 욕조 구성',
      '다이닝→다용도실 히든 슬라이딩도어 유지',
      '지층에 주민공동시설 — 피트니스센터·다목적회의실·키즈카페·스터디카페',
      '세대당 2.6대(총 126대) 주차, 근린생활시설 2개호실',
    ],
    note: '당시 분양가 2층 4.62억~ / 3층 4.91억~ / 4층 일반형 5.37억~ / 4층 복층형 6.85억~.',
  },
};

const hmOverlay = document.getElementById('hmOverlay');
if (hmOverlay) {
  const hmPhoto = document.getElementById('hmPhoto');
  const hmTag = document.getElementById('hmTag');
  const hmTitle = document.getElementById('hmTitle');
  const hmSpecs = document.getElementById('hmSpecs');
  const hmGallery = document.getElementById('hmGallery');
  const hmFeat = document.getElementById('hmFeat');
  const hmNote = document.getElementById('hmNote');

  function openHistoryModal(phaseId) {
    const p = HISTORY_PHASES[phaseId];
    if (!p) return;
    hmPhoto.src = p.photo;
    hmTag.textContent = p.tag;
    hmTitle.textContent = p.title;
    hmSpecs.innerHTML = p.specs
      .map(([k, v]) => `<div class="hm-spec"><div class="k">${k}</div><div class="v">${v}</div></div>`)
      .join('');
    const galleryHtml = p.gallery
      .map(([src, lbl]) => `<div class="hm-gcell"><img src="${src}" alt="" loading="lazy"><div class="lbl">${lbl}</div></div>`)
      .join('');
    hmGallery.innerHTML = (p.galleryNote ? `<p class="hm-gallery-note">${p.galleryNote}</p>` : '') + galleryHtml;
    hmFeat.innerHTML = p.feat.map((f) => `<li>${f}</li>`).join('');
    hmNote.textContent = p.note;
    hmOverlay.classList.add('is-open');
  }

  function closeHistoryModal() {
    hmOverlay.classList.remove('is-open');
  }

  document.querySelectorAll('.htl-item[data-phase]').forEach((el) => {
    el.addEventListener('click', () => openHistoryModal(el.dataset.phase));
  });
  document.getElementById('hmClose').addEventListener('click', closeHistoryModal);
  hmOverlay.addEventListener('click', (e) => {
    if (e.target === hmOverlay) closeHistoryModal();
  });
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') closeHistoryModal();
  });
}

// Gallery bento — cursor-position auto-scroll per phase row + click-to-enlarge modal
const bgWrap = document.getElementById('bgWrap');
if (bgWrap) {
  const DEAD = 0.18; // center dead-zone (18% each side) so hovering a photo doesn't scroll
  const MAX_SPEED = 14; // px per animation frame at the very edge

  bgWrap.querySelectorAll('.bg-phase').forEach((phase) => {
    const scroller = phase.querySelector('.bg-scroller');
    const edgeL = phase.querySelector('.bg-edge-l');
    const edgeR = phase.querySelector('.bg-edge-r');
    const bar = phase.querySelector('.bg-track i');
    if (!scroller) return;

    let speed = 0;
    let inside = false;
    let raf = null;

    function updateBar() {
      const max = scroller.scrollWidth - scroller.clientWidth;
      bar.style.width = max > 0 ? `${(scroller.scrollLeft / max) * 100}%` : '0%';
    }

    function loop() {
      if (speed !== 0) scroller.scrollLeft += speed;
      updateBar();
      raf = inside ? requestAnimationFrame(loop) : null;
    }

    scroller.addEventListener('mousemove', (e) => {
      const rect = scroller.getBoundingClientRect();
      const t = (e.clientX - rect.left) / rect.width; // 0 (left) .. 1 (right)
      const off = t - 0.5;
      if (Math.abs(off) < DEAD) {
        speed = 0;
      } else {
        const k = (Math.abs(off) - DEAD) / (0.5 - DEAD);
        speed = Math.sign(off) * Math.pow(k, 1.7) * MAX_SPEED;
      }
      edgeL.classList.toggle('on', speed < 0);
      edgeR.classList.toggle('on', speed > 0);
    });

    scroller.addEventListener('mouseenter', () => {
      inside = true;
      if (!raf) raf = requestAnimationFrame(loop);
    });
    scroller.addEventListener('mouseleave', () => {
      inside = false;
      speed = 0;
      edgeL.classList.remove('on');
      edgeR.classList.remove('on');
    });

    updateBar();
  });

  // Flat list of all cells (across all phases) for prev/next navigation in the modal
  const bgCells = Array.from(bgWrap.querySelectorAll('.bg-cell'));
  const bgModal = document.getElementById('bgModal');
  const bgImg = document.getElementById('bgImg');
  const bgCapT = document.getElementById('bgCapT');
  const bgCapS = document.getElementById('bgCapS');
  let bgCur = 0;

  function openBentoModal(index) {
    bgCur = (index + bgCells.length) % bgCells.length;
    const cell = bgCells[bgCur];
    const img = cell.querySelector('img');
    const capB = cell.querySelector('.bg-cap b');
    const capSpan = cell.querySelector('.bg-cap span');
    const phaseMeta = cell.closest('.bg-phase').querySelector('.bg-head span').textContent;
    bgImg.src = img.src;
    bgCapT.textContent = capB ? capB.textContent : '';
    bgCapS.textContent = ` — ${capSpan ? capSpan.textContent : ''} · ${phaseMeta}`;
    bgModal.classList.add('is-open');
  }

  function closeBentoModal() {
    bgModal.classList.remove('is-open');
  }

  bgCells.forEach((cell, i) => {
    cell.addEventListener('click', () => openBentoModal(i));
  });
  document.getElementById('bgClose').addEventListener('click', closeBentoModal);
  document.getElementById('bgPrev').addEventListener('click', () => openBentoModal(bgCur - 1));
  document.getElementById('bgNext').addEventListener('click', () => openBentoModal(bgCur + 1));
  bgModal.addEventListener('click', (e) => {
    if (e.target === bgModal) closeBentoModal();
  });
  document.addEventListener('keydown', (e) => {
    if (!bgModal.classList.contains('is-open')) return;
    if (e.key === 'Escape') closeBentoModal();
    if (e.key === 'ArrowLeft') openBentoModal(bgCur - 1);
    if (e.key === 'ArrowRight') openBentoModal(bgCur + 1);
  });
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
