# 마크힐 애월6차 분양 홈페이지 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a static, single-HTML-file marketing site (챕터 클릭 네비게이션) that lets 아승공인중개사 promote the 마크힐애월6차 presale, grounded entirely in the official 분양안내자료 (2026.06.22) and real site photography, with all inquiries routed to 010-9347-1345.

**Architecture:** One `index.html` containing all 8 chapters as `<section data-chapter="...">` elements, hidden/shown by a small vanilla-JS router (`js/chapter-router.js` pure logic + `js/script.js` DOM wiring). No build step, no framework — fonts via CDN (Pretendard, JetBrains Mono), same approach as the sibling 아승공인중개사 site. Design tokens live in `css/styles.css` as CSS custom properties.

**Tech Stack:** Plain HTML5, CSS3 (custom properties, `prefers-reduced-motion`), vanilla ES modules JS. Testing: Node.js built-in test runner (`node --test`) — no new dependencies, since `npm`/`node` are already available in this environment and the site itself ships zero JS dependencies.

## Global Constraints

- Language: Korean (`<html lang="ko">`), every user-facing string in Korean.
- No frameworks, no bundler, no build step — files load directly in a browser (`file://` or any static server).
- Fonts loaded via CDN exactly as the sibling 아승 site does: `https://cdn.jsdelivr.net/gh/orioncactus/pretendard@v1.3.9/dist/web/static/pretendard.css` (body/headline) + `https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@500;600&display=swap` (data/numbers).
- The single contact channel throughout the entire site is **010-9347-1345** (아승공인중개사, 대표 안현정, 등록번호 50110-2019-00164). No other phone number, no email, no chat widget.
- No customer testimonials/reviews section. No lead-capture form (name/phone/message inputs) anywhere — every CTA is a `tel:` link or the phone modal.
- Every price, date, area, and unit-count figure must come verbatim from the 분양안내자료 (2026.06.22) facts recorded in the design spec (`docs/superpowers/specs/2026-08-15-markhill-aewol6-design.md`). The 타입&가격 chapter must carry the disclaimer: "본 정보는 2026.06.22 기준이며, 사업 진행 과정에서 변동될 수 있습니다."
- All decorative motion (Ken Burns, chapter-transition slide/fade, stagger reveals) must be disabled under `prefers-reduced-motion: reduce`.
- Source photos live under `D:\claude_markhillhomepage\markhill_image\...` with Korean folder/file names — never reference those paths from HTML/CSS. Copy the specific files needed into `images/` under new descriptive English filenames (Task 1 lists the exact mapping).
- Color tokens: `--bg:#F8F6F2; --bg-alt:#EFEAE2; --ink:#1A1815; --ink-muted:#5B564E; --ink-subtle:#8A8378; --border:#E2DBCF; --accent:#B5663A; --accent-ink:#7C4527; --dark-surface:#1F1B17; --on-dark:#F8F6F2; --on-dark-muted:#C9C2B8;`

---

## File Structure

- `index.html` — page shell, nav, all 8 `<section data-chapter>` blocks, phone modal, footer
- `css/styles.css` — reset, design tokens, typography, layout, chapter transitions, component styles, responsive breakpoints
- `js/chapter-router.js` — pure chapter-state logic (no DOM), ES module, unit-tested
- `js/script.js` — DOM wiring: nav click handlers, hero Ken Burns/reveal trigger, phone modal open/close, IntersectionObserver-based stagger reveal within a chapter
- `images/` — 14 curated real photos (see Task 1) with descriptive English filenames
- `tests/chapter-router.test.mjs` — unit tests for `js/chapter-router.js`
- `tests/content.test.mjs` — grows across tasks; asserts required real facts/strings are present in `index.html`

---

### Task 1: Curate and copy real photo assets

**Files:**
- Create: `images/` (14 files, copied from `markhill_image/`)
- Test: `tests/content.test.mjs` (new file, first assertion block)

**Interfaces:**
- Produces: the exact `images/<name>.jpg` filenames every later task's HTML references.

- [ ] **Step 1: Create the images directory and copy the 14 curated files**

Run exactly these copies (source paths are under `D:\claude_markhillhomepage\markhill_image\`, all relative to project root `D:\claude_markhillhomepage`):

```bash
mkdir -p images
cp "markhill_image/markhill_3차_애월/KakaoTalk_20220616_230418724_12.jpg" "images/hero-living-3cha.jpg"
cp "markhill_image/markhill_1차_애월/KakaoTalk_20201215_090146114_05.jpg" "images/history-1cha.jpg"
cp "markhill_image/markhill_2차_애월/KakaoTalk_20220123_232003617_10.jpg" "images/history-2cha.jpg"
cp "markhill_image/markhill_3차_애월/KakaoTalk_20220616_230418724_10.jpg" "images/history-3cha.jpg"
cp "markhill_image/markhill_4차_애월/보정/KakaoTalk_20230326_142459419_04.jpg" "images/history-4cha.jpg"
cp "markhill_image/markhill_5차_노형/펜트하우스/KakaoTalk_20241202_164551740_12.jpg" "images/history-5cha-penthouse.jpg"
cp "markhill_image/markhill_1차_애월/KakaoTalk_20201215_090146114_10.jpg" "images/gallery-1cha-02.jpg"
cp "markhill_image/markhill_2차_애월/KakaoTalk_20220123_232014455.jpg" "images/gallery-2cha-02.jpg"
cp "markhill_image/markhill_3차_애월/KakaoTalk_20220616_091149755_08.jpg" "images/gallery-3cha-02.jpg"
cp "markhill_image/markhill_4차_애월/보정/KakaoTalk_20230326_142459419.jpg" "images/gallery-4cha-02.jpg"
cp "markhill_image/markhill_5차_노형/일반평수/KakaoTalk_20240919_204957857_08.jpg" "images/gallery-5cha-02.jpg"
cp "markhill_image/markhill_6차_애월/분양이미지/광고자료/옥탑공간.jpg" "images/6cha-rooftop.jpg"
cp "markhill_image/markhill_6차_애월/분양이미지/광고자료/입지조건.jpg" "images/6cha-location.jpg"
cp "markhill_image/markhill_6차_애월/분양이미지/KakaoTalk_20260624_180742923.jpg" "images/6cha-siteplan.jpg"
```

- [ ] **Step 2: Write the failing test**

Create `tests/content.test.mjs`:

```javascript
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { existsSync } from 'node:fs';

const requiredImages = [
  'images/hero-living-3cha.jpg',
  'images/history-1cha.jpg',
  'images/history-2cha.jpg',
  'images/history-3cha.jpg',
  'images/history-4cha.jpg',
  'images/history-5cha-penthouse.jpg',
  'images/gallery-1cha-02.jpg',
  'images/gallery-2cha-02.jpg',
  'images/gallery-3cha-02.jpg',
  'images/gallery-4cha-02.jpg',
  'images/gallery-5cha-02.jpg',
  'images/6cha-rooftop.jpg',
  'images/6cha-location.jpg',
  'images/6cha-siteplan.jpg',
];

test('all curated site photos exist in images/', () => {
  for (const path of requiredImages) {
    assert.ok(existsSync(path), `missing ${path}`);
  }
});
```

- [ ] **Step 3: Run the test to verify it fails first (before Step 1 if run out of order) or passes now**

Run: `node --test tests/content.test.mjs`
Expected: PASS (all 14 files exist after Step 1's copies)

If any file is missing, re-check the exact source filename with `ls` under the corresponding `markhill_image/...` folder — Korean filenames must match exactly including spacing.

- [ ] **Step 4: Commit**

```bash
git add images tests/content.test.mjs
git commit -m "chore: curate real site photos into images/"
```

---

### Task 2: Design tokens and base CSS

**Files:**
- Create: `css/styles.css`

**Interfaces:**
- Produces: CSS custom properties (`--bg`, `--bg-alt`, `--ink`, `--ink-muted`, `--ink-subtle`, `--border`, `--accent`, `--accent-ink`, `--dark-surface`, `--on-dark`, `--on-dark-muted`), utility classes (`.container`, `.eyebrow`, `.section-title`, `.mono`, `.btn`, `.btn-accent`, `.btn-outline-light`) that every later task's HTML relies on.

- [ ] **Step 1: Write `css/styles.css` reset, tokens, and typography base**

```css
:root {
  --bg: #F8F6F2;
  --bg-alt: #EFEAE2;
  --ink: #1A1815;
  --ink-muted: #5B564E;
  --ink-subtle: #8A8378;
  --border: #E2DBCF;
  --accent: #B5663A;
  --accent-ink: #7C4527;
  --dark-surface: #1F1B17;
  --on-dark: #F8F6F2;
  --on-dark-muted: #C9C2B8;
  --font-body: "Pretendard", -apple-system, sans-serif;
  --font-display: "Pretendard", -apple-system, sans-serif;
  --font-mono: "JetBrains Mono", monospace;
}

* { box-sizing: border-box; margin: 0; padding: 0; }

html { scroll-behavior: smooth; }

body {
  font-family: var(--font-body);
  background: var(--bg);
  color: var(--ink);
  line-height: 1.6;
  -webkit-font-smoothing: antialiased;
}

img { max-width: 100%; display: block; }

a { color: inherit; text-decoration: none; }

.container {
  width: 100%;
  max-width: 1160px;
  margin: 0 auto;
  padding: 0 24px;
}

.mono { font-family: var(--font-mono); font-variant-numeric: tabular-nums; }

.eyebrow {
  font-family: var(--font-mono);
  font-size: 13px;
  letter-spacing: 0.08em;
  color: var(--accent-ink);
  text-transform: uppercase;
  margin-bottom: 12px;
}

.section-title {
  font-family: var(--font-display);
  font-weight: 900;
  letter-spacing: -0.01em;
  font-size: clamp(28px, 4vw, 44px);
  line-height: 1.15;
  margin-bottom: 16px;
}

.section-lede {
  color: var(--ink-muted);
  font-size: 17px;
  max-width: 56ch;
}

.btn {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 14px 24px;
  border-radius: 999px;
  font-weight: 700;
  font-size: 15px;
  border: 1px solid transparent;
  cursor: pointer;
  transition: transform 0.15s ease, background 0.15s ease;
}

.btn:hover { transform: translateY(-1px); }

.btn-accent { background: var(--accent); color: var(--on-dark); }
.btn-accent:hover { background: var(--accent-ink); }

.btn-outline-light {
  background: transparent;
  color: var(--on-dark);
  border-color: rgba(248, 246, 242, 0.4);
}
.btn-outline-light:hover { background: rgba(248, 246, 242, 0.1); }

@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
    scroll-behavior: auto !important;
  }
}
```

- [ ] **Step 2: Verify visually**

There is no automated test for pure CSS tokens (nothing to assert against yet without HTML). Skip to commit; Task 3 will add the HTML shell that makes these rules visible and screenshot-testable.

- [ ] **Step 3: Commit**

```bash
git add css/styles.css
git commit -m "feat: design tokens and base CSS"
```

---

### Task 3: HTML shell, chapter nav, and JS router

**Files:**
- Create: `index.html`
- Create: `js/chapter-router.js`
- Create: `js/script.js`
- Test: `tests/chapter-router.test.mjs`

**Interfaces:**
- Consumes: CSS classes from Task 2 (`.container`, `.btn`, `.mono`, etc.)
- Produces: `js/chapter-router.js` exports `CHAPTER_IDS` (array of 8 strings, in order) and `resolveChapter(requestedId)` — returns `requestedId` if it's in `CHAPTER_IDS`, otherwise returns `CHAPTER_IDS[0]`. Every later chapter task adds one `<section data-chapter="...">` whose `data-chapter` value must be one of `CHAPTER_IDS`.

- [ ] **Step 1: Write the failing router test**

Create `tests/chapter-router.test.mjs`:

```javascript
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { CHAPTER_IDS, resolveChapter } from '../js/chapter-router.js';

test('CHAPTER_IDS lists the 8 chapters in order', () => {
  assert.deepEqual(CHAPTER_IDS, [
    'intro',
    'history',
    'overview',
    'premium',
    'types',
    'location',
    'gallery',
    'contact',
  ]);
});

test('resolveChapter returns a valid requested id unchanged', () => {
  assert.equal(resolveChapter('gallery'), 'gallery');
});

test('resolveChapter falls back to the first chapter for an unknown id', () => {
  assert.equal(resolveChapter('nonexistent'), 'intro');
});

test('resolveChapter falls back to the first chapter for empty/undefined input', () => {
  assert.equal(resolveChapter(undefined), 'intro');
  assert.equal(resolveChapter(''), 'intro');
});
```

- [ ] **Step 2: Run it to confirm it fails**

Run: `node --test tests/chapter-router.test.mjs`
Expected: FAIL — `js/chapter-router.js` does not exist yet

- [ ] **Step 3: Implement `js/chapter-router.js`**

```javascript
export const CHAPTER_IDS = [
  'intro',
  'history',
  'overview',
  'premium',
  'types',
  'location',
  'gallery',
  'contact',
];

export function resolveChapter(requestedId) {
  return CHAPTER_IDS.includes(requestedId) ? requestedId : CHAPTER_IDS[0];
}
```

- [ ] **Step 4: Run the test to confirm it passes**

Run: `node --test tests/chapter-router.test.mjs`
Expected: PASS (4 tests)

- [ ] **Step 5: Write `index.html` shell with nav and empty chapter placeholders**

Each chapter's real content is filled in by its own task (4–11); this step only creates the skeletal `<section>` so the router has real elements to control. Sections start empty except `data-chapter` and a heading placeholder that later tasks replace.

```html
<!doctype html>
<html lang="ko">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>마크힐애월6차 분양 | 아승공인중개사</title>
<meta name="description" content="제주 애월읍 하귀2리 마크힐애월6차 분양 안내. 아승공인중개사 010-9347-1345.">
<link rel="preconnect" href="https://cdn.jsdelivr.net">
<link rel="stylesheet" href="https://cdn.jsdelivr.net/gh/orioncactus/pretendard@v1.3.9/dist/web/static/pretendard.css">
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@500;600&display=swap">
<link rel="stylesheet" href="css/styles.css">
</head>
<body>

<nav class="chapter-nav" aria-label="챕터 이동">
  <div class="chapter-nav-inner">
    <span class="chapter-nav-brand">MARKHILL AEWOL</span>
    <ul class="chapter-nav-list">
      <li><button type="button" data-nav-target="intro">소개</button></li>
      <li><button type="button" data-nav-target="history">역사</button></li>
      <li><button type="button" data-nav-target="overview">애월6차</button></li>
      <li><button type="button" data-nav-target="premium">프리미엄</button></li>
      <li><button type="button" data-nav-target="types">타입&amp;가격</button></li>
      <li><button type="button" data-nav-target="location">입지</button></li>
      <li><button type="button" data-nav-target="gallery">갤러리</button></li>
      <li><button type="button" data-nav-target="contact">문의</button></li>
    </ul>
    <a class="btn btn-accent chapter-nav-cta" href="tel:010-9347-1345">전화 상담</a>
  </div>
</nav>

<main id="chapterHost">
  <section class="chapter" data-chapter="intro" aria-labelledby="intro-title"><h1 id="intro-title">소개</h1></section>
  <section class="chapter" data-chapter="history" aria-labelledby="history-title" hidden><h2 id="history-title">마크힐의 역사</h2></section>
  <section class="chapter" data-chapter="overview" aria-labelledby="overview-title" hidden><h2 id="overview-title">애월6차 개요</h2></section>
  <section class="chapter" data-chapter="premium" aria-labelledby="premium-title" hidden><h2 id="premium-title">프리미엄</h2></section>
  <section class="chapter" data-chapter="types" aria-labelledby="types-title" hidden><h2 id="types-title">타입 &amp; 가격</h2></section>
  <section class="chapter" data-chapter="location" aria-labelledby="location-title" hidden><h2 id="location-title">입지</h2></section>
  <section class="chapter" data-chapter="gallery" aria-labelledby="gallery-title" hidden><h2 id="gallery-title">갤러리</h2></section>
  <section class="chapter" data-chapter="contact" aria-labelledby="contact-title" hidden><h2 id="contact-title">문의</h2></section>
</main>

<div class="phone-modal" id="phoneModal" aria-hidden="true">
  <div class="phone-modal-backdrop" data-phone-modal-close></div>
  <div class="phone-modal-panel" role="dialog" aria-modal="true" aria-labelledby="phoneModalTitle">
    <button class="phone-modal-close" type="button" data-phone-modal-close aria-label="닫기">×</button>
    <p class="eyebrow">전화 상담</p>
    <div class="phone-modal-word" id="phoneModalTitle">아승공인중개사</div>
    <a class="phone-modal-number mono" href="tel:010-9347-1345">010-9347-1345</a>
    <p class="phone-modal-hint">휴대폰으로 확인하시면 바로 통화 연결됩니다</p>
    <button type="button" class="btn btn-outline-light" id="phoneCopyBtn">번호 복사하기</button>
  </div>
</div>

<script type="module" src="js/script.js"></script>
</body>
</html>
```

- [ ] **Step 6: Add nav/router CSS to `css/styles.css`**

```css
.chapter-nav {
  position: fixed;
  top: 0; left: 0; right: 0;
  z-index: 100;
  background: rgba(248, 246, 242, 0.92);
  backdrop-filter: blur(8px);
  border-bottom: 1px solid var(--border);
}
.chapter-nav-inner {
  max-width: 1160px;
  margin: 0 auto;
  padding: 14px 24px;
  display: flex;
  align-items: center;
  gap: 24px;
}
.chapter-nav-brand {
  font-family: var(--font-display);
  font-weight: 900;
  letter-spacing: 0.04em;
  font-size: 15px;
}
.chapter-nav-list {
  list-style: none;
  display: flex;
  gap: 20px;
  flex: 1;
  overflow-x: auto;
}
.chapter-nav-list button {
  background: none;
  border: none;
  font: inherit;
  font-size: 14px;
  font-weight: 600;
  color: var(--ink-muted);
  cursor: pointer;
  padding: 6px 0;
  white-space: nowrap;
}
.chapter-nav-list button[aria-current="true"] { color: var(--accent); }
.chapter-nav-cta { padding: 10px 18px; font-size: 14px; white-space: nowrap; }

main#chapterHost { padding-top: 60px; }

.chapter { min-height: calc(100vh - 60px); padding: 64px 0; }
.chapter[hidden] { display: none; }

.chapter.is-entering { animation: chapterFadeIn 0.45s ease both; }
@keyframes chapterFadeIn {
  from { opacity: 0; transform: translateY(12px); }
  to { opacity: 1; transform: translateY(0); }
}

.phone-modal { position: fixed; inset: 0; z-index: 200; display: none; }
.phone-modal[aria-hidden="false"] { display: block; }
.phone-modal-backdrop { position: absolute; inset: 0; background: rgba(26, 24, 21, 0.6); }
.phone-modal-panel {
  position: relative;
  max-width: 360px;
  margin: 15vh auto 0;
  background: var(--dark-surface);
  color: var(--on-dark);
  border-radius: 16px;
  padding: 32px;
  text-align: center;
}
.phone-modal-close {
  position: absolute; top: 16px; right: 16px;
  background: none; border: none; color: var(--on-dark);
  font-size: 20px; cursor: pointer;
}
.phone-modal-word { font-family: var(--font-display); font-weight: 900; font-size: 20px; margin: 8px 0; }
.phone-modal-number { display: block; font-size: 28px; font-weight: 700; color: var(--accent); margin: 12px 0; }
.phone-modal-hint { color: var(--on-dark-muted); font-size: 13px; margin-bottom: 20px; }
```

- [ ] **Step 7: Implement `js/script.js` DOM wiring**

```javascript
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
```

- [ ] **Step 8: Add the shell content-check to `tests/content.test.mjs`**

Append to the file created in Task 1:

```javascript
import { readFileSync } from 'node:fs';

const html = readFileSync('index.html', 'utf8');

test('every chapter nav target matches a real chapter section', () => {
  const navTargets = [...html.matchAll(/data-nav-target="([^"]+)"/g)].map((m) => m[1]);
  const chapterIds = [...html.matchAll(/data-chapter="([^"]+)"/g)].map((m) => m[1]);
  assert.deepEqual(navTargets, chapterIds);
});

test('the only phone number on the page is 010-9347-1345', () => {
  const phoneMatches = html.match(/\b01[016789]-\d{3,4}-\d{4}\b/g) ?? [];
  for (const phone of phoneMatches) {
    assert.equal(phone, '010-9347-1345', `unexpected phone number ${phone}`);
  }
  assert.ok(phoneMatches.length > 0, 'expected at least one phone number on the page');
});
```

- [ ] **Step 9: Run all tests**

Run: `node --test`
Expected: PASS (chapter-router tests + content tests)

- [ ] **Step 10: Open in a browser and manually verify**

Serve the folder (e.g. `npx serve .` or any static server) and open `index.html`. Click each of the 8 nav buttons; confirm exactly one chapter is visible at a time, the URL hash updates, and the phone modal opens via any `[data-open-phone-modal]` trigger (none exist yet until Task 11 adds one — clicking the header "전화 상담" button should still work since it's a plain `tel:` link).

- [ ] **Step 11: Commit**

```bash
git add index.html js/chapter-router.js js/script.js css/styles.css tests/chapter-router.test.mjs tests/content.test.mjs
git commit -m "feat: chapter nav shell with JS router"
```

---

### Task 4: 소개 (Intro/Hero) chapter

**Files:**
- Modify: `index.html:` the `data-chapter="intro"` section
- Modify: `css/styles.css` (append hero styles)
- Modify: `js/script.js` (append hero load-sequence trigger)
- Modify: `tests/content.test.mjs` (append hero content assertions)

**Interfaces:**
- Consumes: `images/hero-living-3cha.jpg` (Task 1), `.btn .btn-accent` (Task 2), chapter/router plumbing (Task 3).

- [ ] **Step 1: Replace the intro section's content in `index.html`**

```html
<section class="chapter chapter-hero" data-chapter="intro" aria-labelledby="intro-title">
  <div class="hero-photo">
    <span class="hero-badge">서부지역 마지막 마크힐</span>
    <h1 id="intro-title" class="hero-headline">MARKHILL AEWOL<br>마크힐애월6차</h1>
    <p class="hero-sub">제주시 애월읍 하귀2리 · 단지형 연립주택 84타입 20세대 · 2027년 7월 입주 예정</p>
    <div class="hero-ctas">
      <a href="tel:010-9347-1345" class="btn btn-accent">전화 상담하기</a>
    </div>
    <p class="hero-agent">분양대행 아승공인중개사 · 010-9347-1345</p>
  </div>
</section>
```

- [ ] **Step 2: Append hero CSS**

```css
.chapter-hero { padding: 0; min-height: 100vh; }
.hero-photo {
  position: relative;
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  justify-content: flex-end;
  padding: 48px 24px 80px;
  background-image:
    linear-gradient(to top, rgba(26,24,21,0.85) 0%, rgba(26,24,21,0.25) 45%, rgba(26,24,21,0.05) 70%, transparent 100%),
    linear-gradient(to bottom, rgba(26,24,21,0.35) 0%, transparent 20%),
    url('../images/hero-living-3cha.jpg');
  background-size: 128% auto, 128% auto, 128% auto;
  background-position: center 38%, center 38%, center 38%;
  background-repeat: no-repeat;
  color: var(--on-dark);
  overflow: hidden;
}
.hero-photo::after {
  content: "";
  position: absolute; inset: 0;
  background-image: inherit;
  background-size: inherit;
  background-position: inherit;
  z-index: -1;
  animation: heroKenBurns 20s ease-out forwards;
}
@keyframes heroKenBurns {
  from { background-size: 128% auto, 128% auto, 128% auto; background-position: center 38%, center 38%, center 38%; }
  to   { background-size: 136% auto, 136% auto, 136% auto; background-position: center 32%, center 32%, center 32%; }
}
.hero-badge {
  display: inline-block;
  align-self: flex-start;
  font-family: var(--font-mono);
  font-size: 13px;
  letter-spacing: 0.06em;
  padding: 8px 16px;
  border: 1px solid rgba(248,246,242,0.4);
  border-radius: 999px;
  margin-bottom: 20px;
  opacity: 0;
  animation: heroFadeUp 0.7s ease 0.2s forwards;
}
.hero-headline {
  font-family: var(--font-display);
  font-weight: 900;
  font-size: clamp(36px, 6vw, 68px);
  line-height: 1.08;
  letter-spacing: -0.01em;
  margin-bottom: 20px;
  max-width: 16ch;
  opacity: 0;
  animation: heroFadeUp 0.7s ease 0.4s forwards;
}
.hero-sub {
  font-size: 17px;
  color: var(--on-dark-muted);
  max-width: 52ch;
  margin-bottom: 28px;
  opacity: 0;
  animation: heroFadeUp 0.7s ease 0.6s forwards;
}
.hero-ctas { opacity: 0; animation: heroFadeUp 0.7s ease 0.8s forwards; }
.hero-agent {
  margin-top: 16px;
  font-size: 13px;
  color: var(--on-dark-muted);
  opacity: 0;
  animation: heroFadeUp 0.7s ease 1s forwards;
}
@keyframes heroFadeUp {
  from { opacity: 0; transform: translateY(14px); }
  to { opacity: 1; transform: translateY(0); }
}
@media (prefers-reduced-motion: reduce) {
  .hero-photo::after { animation: none; }
  .hero-badge, .hero-headline, .hero-sub, .hero-ctas, .hero-agent { animation: none; opacity: 1; }
}
```

The Ken Burns effect is implemented purely in CSS (`::after` layer animating `background-size`/`background-position`) so no JS is required for it; this also means the effect runs once per page load rather than restarting on chapter re-entry, which is the intended "cinematic, not looping" feel. The `128%` zoom plus `center 38%` position frames the shot away from both corners where the original photo carries an 아승 watermark (top-left text band, bottom-right logo block), so neither watermark is visible in the cropped/zoomed view.

- [ ] **Step 3: Append hero content assertions to `tests/content.test.mjs`**

```javascript
test('hero chapter shows the real 6cha headline facts', () => {
  assert.ok(html.includes('마크힐애월6차'));
  assert.ok(html.includes('하귀2리'));
  assert.ok(html.includes('20세대'));
  assert.ok(html.includes('아승공인중개사'));
  assert.ok(html.includes('images/hero-living-3cha.jpg'));
});
```

- [ ] **Step 4: Run tests**

Run: `node --test`
Expected: PASS

- [ ] **Step 5: Visual check**

Serve and open the page. Confirm: the hero photo fills the viewport with no visible watermark text in either corner, the badge/headline/subcopy/CTA fade up in sequence on load, and toggling OS "reduce motion" (or forcing `prefers-reduced-motion` in devtools) shows everything instantly with no animation.

- [ ] **Step 6: Commit**

```bash
git add index.html css/styles.css tests/content.test.mjs
git commit -m "feat: hero chapter with Ken Burns and load sequence"
```

---

### Task 5: 마크힐의 역사 (History) chapter

**Files:**
- Modify: `index.html` (`data-chapter="history"` section)
- Modify: `css/styles.css` (timeline card styles)
- Modify: `tests/content.test.mjs`

**Interfaces:**
- Consumes: `images/history-1cha.jpg` … `images/history-5cha-penthouse.jpg` (Task 1).

- [ ] **Step 1: Replace the history section content**

```html
<section class="chapter" data-chapter="history" aria-labelledby="history-title" hidden>
  <div class="container">
    <p class="eyebrow">마크힐의 역사</p>
    <h2 id="history-title" class="section-title">2020년부터, 마크힐이 걸어온 길</h2>
    <p class="section-lede">애월 상귀리에서 시작해 노형, 그리고 다시 애월 하귀로 — 남건종합건설이 짓고 아승공인중개사가 함께한 마크힐의 여섯 걸음입니다.</p>

    <div class="timeline-grid">
      <article class="timeline-card">
        <div class="timeline-photo" style="background-image:url('images/history-1cha.jpg')"></div>
        <div class="timeline-body">
          <p class="timeline-tag mono">1차 · 2020~21 · 애월읍 상귀리</p>
          <p>18세대(3개동). 마크힐 첫 공급, 준공 전 완판.</p>
        </div>
      </article>
      <article class="timeline-card">
        <div class="timeline-photo" style="background-image:url('images/history-2cha.jpg')"></div>
        <div class="timeline-body">
          <p class="timeline-tag mono">2차 · 2022 · 애월읍 상귀리</p>
          <p>23세대(4개동). 환기 개선, 다이닝룸 구조기둥 제거로 개방감 확대.</p>
        </div>
      </article>
      <article class="timeline-card">
        <div class="timeline-photo" style="background-image:url('images/history-3cha.jpg')"></div>
        <div class="timeline-body">
          <p class="timeline-tag mono">3차 · 2022 · 애월읍 상귀리</p>
          <p>26세대. 2차와 동시 진행, 오션뷰 2개동 + 정남향 1개동 배치.</p>
        </div>
      </article>
      <article class="timeline-card">
        <div class="timeline-photo" style="background-image:url('images/history-4cha.jpg')"></div>
        <div class="timeline-body">
          <p class="timeline-tag mono">4차 · 2023 · 제주시 외도일동</p>
          <p>12세대(2개동). 가전·보일러 모바일 제어 최초 도입, 샘플하우스 디피 제품 판매수익 제주사회복지공동모금회 기부.</p>
        </div>
      </article>
      <article class="timeline-card">
        <div class="timeline-photo" style="background-image:url('images/history-5cha-penthouse.jpg')"></div>
        <div class="timeline-body">
          <p class="timeline-tag mono">5차 · 2024~25 · 노형동</p>
          <p>48세대(8개동). 마크힐 최초 복층형 펜트하우스 8세대, 보이드 구조. 사용승인 2025.7.17.</p>
        </div>
      </article>
      <article class="timeline-card timeline-card-current">
        <div class="timeline-body">
          <p class="timeline-tag mono">6차 · 2026~ · 애월읍 하귀2리</p>
          <p>20세대 + 근생 4실. 서부지역 마지막 마크힐, 전세대 태양광, 옥탑 선셋라운지.</p>
          <button type="button" class="btn btn-accent" data-nav-target="overview">6차 자세히 보기</button>
        </div>
      </article>
    </div>
  </div>
</section>
```

- [ ] **Step 2: Append timeline CSS**

```css
.timeline-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
  gap: 20px;
  margin-top: 40px;
}
.timeline-card {
  border: 1px solid var(--border);
  border-radius: 12px;
  overflow: hidden;
  background: #fff;
  display: flex;
  flex-direction: column;
}
.timeline-photo {
  aspect-ratio: 4 / 3;
  background-size: cover;
  background-position: center;
}
.timeline-body { padding: 18px; flex: 1; display: flex; flex-direction: column; gap: 8px; }
.timeline-tag { font-size: 12px; color: var(--accent-ink); }
.timeline-card-current {
  background: var(--dark-surface);
  color: var(--on-dark);
  justify-content: center;
}
.timeline-card-current .timeline-tag { color: var(--accent); }
.timeline-card-current .btn { align-self: flex-start; margin-top: 8px; }
```

Note: `data-nav-target` also appears on the "6차 자세히 보기" button inside a chapter body, not just in the fixed nav — `js/script.js`'s `document.querySelectorAll('[data-nav-target]')` from Task 3 already covers any element with that attribute anywhere in the document, so this button works with no additional JS. However this adds a second nav button with `data-nav-target="overview"`, which breaks the Task 3 test asserting nav targets map 1:1 to chapter order — update that test now.

- [ ] **Step 3: Fix the nav-target test to scope to the fixed nav only**

In `tests/content.test.mjs`, change the `data-nav-target` regex to only match inside `<nav class="chapter-nav">`:

```javascript
test('every fixed-nav target matches a real chapter section', () => {
  const navBlock = html.match(/<nav class="chapter-nav"[\s\S]*?<\/nav>/)[0];
  const navTargets = [...navBlock.matchAll(/data-nav-target="([^"]+)"/g)].map((m) => m[1]);
  const chapterIds = [...html.matchAll(/data-chapter="([^"]+)"/g)].map((m) => m[1]);
  assert.deepEqual(navTargets, chapterIds);
});
```

(This replaces the test with the same name added in Task 3 Step 8.)

- [ ] **Step 4: Append history content assertions**

```javascript
test('history chapter covers all 6 phases with real facts', () => {
  assert.ok(html.includes('18세대(3개동)'));
  assert.ok(html.includes('23세대(4개동)'));
  assert.ok(html.includes('제주사회복지공동모금회'));
  assert.ok(html.includes('보이드 구조'));
  assert.ok(html.includes('2025.7.17'));
  assert.ok(html.includes('옥탑 선셋라운지'));
});
```

- [ ] **Step 5: Run tests, then visual check, then commit**

Run: `node --test` → PASS. Serve and click "역사" tab; confirm 6 cards render, images load, and "6차 자세히 보기" jumps to the overview chapter.

```bash
git add index.html css/styles.css tests/content.test.mjs
git commit -m "feat: history chapter with 1-5cha timeline"
```

---

### Task 6: 애월6차 개요 (Overview) chapter

**Files:**
- Modify: `index.html` (`data-chapter="overview"` section)
- Modify: `css/styles.css` (spec table + site-plan layout)
- Modify: `tests/content.test.mjs`

**Interfaces:**
- Consumes: `images/6cha-siteplan.jpg` (Task 1).

- [ ] **Step 1: Replace the overview section content**

```html
<section class="chapter" data-chapter="overview" aria-labelledby="overview-title" hidden>
  <div class="container">
    <p class="eyebrow">애월6차 개요</p>
    <h2 id="overview-title" class="section-title">남건휴먼스 마크힐애월(6차)</h2>

    <table class="spec-table">
      <tbody>
        <tr><th>단지명</th><td>남건휴먼스 마크힐애월(6차)</td></tr>
        <tr><th>사업주체</th><td>사업시행자 휴먼스이엔씨㈜ / 시공자 남건종합건설㈜</td></tr>
        <tr><th>유형 및 규모</th><td>도시형생활주택 중 단지형 연립주택(84타입 20세대) 및 근린생활시설(4실)</td></tr>
        <tr><th>위치</th><td>제주시 애월읍 하귀2리 2089번지 (하귀성당 사거리 북서측 코너부지)</td></tr>
        <tr><th>주차대수</th><td>실질 주차계획 43대 (세대당 2.1대)</td></tr>
        <tr><th>주민공동시설</th><td>근생104호 마크힐센터(남건 직접 소유·운영 피트니스, 3년 확정운영) · 옥탑(요가&amp;스트레칭존, 펫플레이존, 선셋라운지)</td></tr>
        <tr><th>일정</th><td class="mono">2026년 10월 샘플하우스 오픈 · 2027년 7월 입주 예정</td></tr>
      </tbody>
    </table>

    <div class="siteplan-block">
      <img src="images/6cha-siteplan.jpg" alt="마크힐애월6차 배치도 항공사진" loading="lazy">
      <p class="siteplan-caption">101동·102동 배치도 — 하귀성당 사거리 북서측 코너부지</p>
    </div>
  </div>
</section>
```

- [ ] **Step 2: Append table/siteplan CSS**

```css
.spec-table { width: 100%; border-collapse: collapse; margin: 32px 0; }
.spec-table th, .spec-table td {
  text-align: left;
  padding: 16px 0;
  border-bottom: 1px solid var(--border);
  vertical-align: top;
}
.spec-table th { width: 160px; color: var(--ink-subtle); font-weight: 600; font-size: 14px; }
.spec-table td { font-size: 15px; }
.siteplan-block img { border-radius: 12px; border: 1px solid var(--border); }
.siteplan-caption { margin-top: 12px; font-size: 13px; color: var(--ink-subtle); }
```

- [ ] **Step 3: Append content assertions**

```javascript
test('overview chapter states the official project facts', () => {
  assert.ok(html.includes('하귀2리 2089번지'));
  assert.ok(html.includes('84타입 20세대'));
  assert.ok(html.includes('2026년 10월 샘플하우스 오픈'));
  assert.ok(html.includes('2027년 7월 입주 예정'));
  assert.ok(html.includes('images/6cha-siteplan.jpg'));
});
```

- [ ] **Step 4: Run tests, visual check, commit**

```bash
git add index.html css/styles.css tests/content.test.mjs
git commit -m "feat: 6cha overview chapter with spec table and site plan"
```

---

### Task 7: 프리미엄 (Premium) chapter

**Files:**
- Modify: `index.html` (`data-chapter="premium"` section)
- Modify: `css/styles.css` (feature grid + signature moment)
- Modify: `tests/content.test.mjs`

**Interfaces:**
- Consumes: `images/6cha-rooftop.jpg` (Task 1).

- [ ] **Step 1: Replace the premium section content**

```html
<section class="chapter" data-chapter="premium" aria-labelledby="premium-title" hidden>
  <div class="container">
    <p class="eyebrow">프리미엄</p>
    <h2 id="premium-title" class="section-title">마크힐이 6차에서도 지키는 것들</h2>

    <div class="feature-grid">
      <div class="feature-card">
        <p class="feature-title">전세대 태양광</p>
        <p>세대당 2.93kw 태양광패널을 옥탑 구조물 형태로 설치합니다.</p>
      </div>
      <div class="feature-card">
        <p class="feature-title">세라믹 상판 · 아일랜드 주방</p>
        <p>오염과 열기에 강한 세라믹 상판과 넓은 아일랜드 조리대.</p>
      </div>
      <div class="feature-card">
        <p class="feature-title">시그니처 히든 슬라이딩도어</p>
        <p>다이닝 공간에서 다용도실로 이어지는, 1차부터 이어온 마크힐의 상징적 공간.</p>
      </div>
      <div class="feature-card">
        <p class="feature-title">세대내 스프링클러</p>
        <p>화재 초기진압을 위한 전세대 스프링클러 설치.</p>
      </div>
      <div class="feature-card">
        <p class="feature-title">마크힐센터</p>
        <p>근생104호, 남건 직접 소유·운영 피트니스센터 (3년 확정운영).</p>
      </div>
      <div class="feature-card">
        <p class="feature-title">부부욕실 욕조</p>
        <p>안방 욕실에 욕조를 갖춘 여유로운 구성.</p>
      </div>
    </div>

    <figure class="signature-moment">
      <img src="images/6cha-rooftop.jpg" alt="마크힐애월6차 옥탑 커뮤니티 시설 — 요가&스트레칭존, 펫플레이그라운드, 선셋라운지" loading="lazy">
      <figcaption>
        <p class="eyebrow" style="color:var(--accent);">시그니처</p>
        <p class="section-title" style="font-size:28px;">옥탑 선셋라운지</p>
        <p class="section-lede">요가&amp;스트레칭존, 펫플레이그라운드, 그리고 하귀2리 노을을 담은 선셋라운지까지 — 옥탑 전체를 주민공동공간으로 열었습니다.</p>
      </figcaption>
    </figure>
  </div>
</section>
```

- [ ] **Step 2: Append feature grid + signature-moment CSS**

```css
.feature-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  gap: 20px;
  margin: 32px 0 56px;
}
.feature-card {
  padding: 24px;
  border: 1px solid var(--border);
  border-radius: 12px;
  background: var(--bg-alt);
}
.feature-title { font-weight: 800; margin-bottom: 8px; }
.signature-moment {
  position: relative;
  border-radius: 16px;
  overflow: hidden;
}
.signature-moment img { width: 100%; }
.signature-moment figcaption {
  position: absolute;
  left: 0; bottom: 0; right: 0;
  padding: 32px;
  background: linear-gradient(to top, rgba(31,27,23,0.9), transparent);
  color: var(--on-dark);
}
```

- [ ] **Step 3: Append content assertions**

```javascript
test('premium chapter lists real 6cha amenities', () => {
  assert.ok(html.includes('2.93kw'));
  assert.ok(html.includes('선셋라운지'));
  assert.ok(html.includes('마크힐센터'));
  assert.ok(html.includes('images/6cha-rooftop.jpg'));
});
```

- [ ] **Step 4: Run tests, visual check, commit**

```bash
git add index.html css/styles.css tests/content.test.mjs
git commit -m "feat: premium chapter with rooftop signature moment"
```

---

### Task 8: 타입 & 가격 (Types & Pricing) chapter

**Files:**
- Modify: `index.html` (`data-chapter="types"` section)
- Modify: `css/styles.css` (pricing table styles)
- Modify: `tests/content.test.mjs`

- [ ] **Step 1: Replace the types section content**

```html
<section class="chapter" data-chapter="types" aria-labelledby="types-title" hidden>
  <div class="container">
    <p class="eyebrow">타입 &amp; 가격</p>
    <h2 id="types-title" class="section-title">84A-1 · 84A-2 · 84B</h2>

    <table class="area-table">
      <thead>
        <tr><th>타입</th><th>전용(㎡)</th><th>공급(㎡)</th><th>계약(평)</th><th>대지(평)</th><th>비고</th></tr>
      </thead>
      <tbody>
        <tr><td>84A-1</td><td class="mono">84.8</td><td class="mono">108.0</td><td class="mono">42.9</td><td class="mono">49.2</td><td>101동 12세대</td></tr>
        <tr><td>84A-2</td><td class="mono">84.8</td><td class="mono">108.0</td><td class="mono">42.9</td><td class="mono">49.2</td><td>102동 2호라인</td></tr>
        <tr><td>84B</td><td class="mono">84.4</td><td class="mono">107.3</td><td class="mono">42.5</td><td class="mono">49.0</td><td>102동 1호라인</td></tr>
      </tbody>
    </table>

    <table class="price-table">
      <thead>
        <tr><th>동</th><th>층</th><th>분양가(만원)</th><th>조망향</th><th>조망권</th></tr>
      </thead>
      <tbody>
        <tr><td>101동</td><td class="mono">1층</td><td class="mono">45,800</td><td>남서/남동</td><td>자연뷰(간섭없음)/한라산뷰(일부간섭)</td></tr>
        <tr><td>101동</td><td class="mono">2층</td><td class="mono">47,500</td><td>남서/남동</td><td>자연뷰(간섭없음)/한라산뷰(일부간섭)</td></tr>
        <tr><td>101동</td><td class="mono">3층</td><td class="mono">49,300</td><td>남서/남동</td><td>자연뷰(간섭없음)/한라산뷰(일부간섭)</td></tr>
        <tr><td>101동</td><td class="mono">4층</td><td class="mono">51,300</td><td>남서/남동</td><td>자연뷰(간섭없음)/한라산뷰(일부간섭)</td></tr>
        <tr><td>102동</td><td class="mono">1층</td><td class="mono">44,800</td><td>북</td><td>오션뷰(일부간섭)</td></tr>
        <tr><td>102동</td><td class="mono">2층</td><td class="mono">47,500</td><td>북</td><td>오션뷰(간섭없음)</td></tr>
        <tr><td>102동</td><td class="mono">3층</td><td class="mono">49,300</td><td>북</td><td>오션뷰(간섭없음)</td></tr>
        <tr><td>102동</td><td class="mono">4층</td><td class="mono">51,300</td><td>북</td><td>오션뷰(간섭없음)</td></tr>
        <tr><td>102동 근생</td><td class="mono">B01~B04</td><td class="mono">10,000~16,000</td><td>-</td><td>도로직접연결, 하귀초후문</td></tr>
      </tbody>
    </table>
    <p class="price-disclaimer">본 정보는 2026.06.22 기준이며, 사업 진행 과정에서 변동될 수 있습니다. 부가세 포함 금액입니다.</p>

    <div class="terms-block">
      <p><strong>계약조건</strong> — 분양가 기준 5%(계약) + 5%(계약 1개월 후) + 90%(소유권이전시)</p>
      <p><strong>이벤트</strong> — 샘플하우스 오픈 전 계약 시 TV·세탁기/건조기·줄눈시공·입주청소 무상 제공</p>
    </div>
  </div>
</section>
```

- [ ] **Step 2: Append pricing table CSS**

```css
.area-table, .price-table {
  width: 100%;
  border-collapse: collapse;
  margin: 24px 0;
  font-size: 14px;
}
.area-table th, .price-table th {
  text-align: left;
  padding: 10px 12px;
  background: var(--bg-alt);
  font-weight: 700;
  border-bottom: 1px solid var(--border);
}
.area-table td, .price-table td {
  padding: 10px 12px;
  border-bottom: 1px solid var(--border);
}
.price-disclaimer { font-size: 13px; color: var(--ink-subtle); margin-bottom: 32px; }
.terms-block { display: grid; gap: 8px; font-size: 15px; }
```

- [ ] **Step 3: Append content assertions**

```javascript
test('types & pricing chapter carries the exact official figures and disclaimer', () => {
  assert.ok(html.includes('45,800'));
  assert.ok(html.includes('51,300'));
  assert.ok(html.includes('오션뷰(간섭없음)'));
  assert.ok(html.includes('2026.06.22 기준'));
  assert.ok(html.includes('변동될 수 있습니다'));
});
```

- [ ] **Step 4: Run tests, visual check, commit**

```bash
git add index.html css/styles.css tests/content.test.mjs
git commit -m "feat: types and pricing chapter with disclaimer"
```

---

### Task 9: 입지 (Location) chapter

**Files:**
- Modify: `index.html` (`data-chapter="location"` section)
- Modify: `css/styles.css` (3-block layout)
- Modify: `tests/content.test.mjs`

**Interfaces:**
- Consumes: `images/6cha-location.jpg` (Task 1).

- [ ] **Step 1: Replace the location section content**

```html
<section class="chapter" data-chapter="location" aria-labelledby="location-title" hidden>
  <div class="container">
    <p class="eyebrow">입지</p>
    <h2 id="location-title" class="section-title">하귀2리, 교육과 조망을 함께</h2>

    <div class="location-grid">
      <div class="location-block">
        <p class="feature-title">교육여건</p>
        <p>하귀초등학교 · 귀일중학교 도보 통학 가능. 하귀초 병설유치원 인접.</p>
      </div>
      <div class="location-block">
        <p class="feature-title">생활여건</p>
        <p>공항 및 신제주 인접한 자연친화적 주거환경. 하귀·외도택지 생활권, 하나로마트 등 편의시설 인접. 일주서로/애조로 인접.</p>
      </div>
      <div class="location-block">
        <p class="feature-title">조망권</p>
        <p>하귀2리 주거지 중 가장 높은 위치. 바다 및 자연조망향 동배치로 조망권 확보.</p>
      </div>
    </div>

    <img class="location-photo" src="images/6cha-location.jpg" alt="마크힐애월6차 입지 안내 — 교육/생활/조망권" loading="lazy">
  </div>
</section>
```

- [ ] **Step 2: Append location CSS**

```css
.location-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  gap: 20px;
  margin: 32px 0;
}
.location-block { padding: 20px 0; border-top: 2px solid var(--accent); }
.location-photo { width: 100%; border-radius: 12px; border: 1px solid var(--border); margin-top: 16px; }
```

- [ ] **Step 3: Append content assertions**

```javascript
test('location chapter states the real education/living/view facts', () => {
  assert.ok(html.includes('하귀초등학교'));
  assert.ok(html.includes('귀일중학교'));
  assert.ok(html.includes('images/6cha-location.jpg'));
});
```

- [ ] **Step 4: Run tests, visual check, commit**

```bash
git add index.html css/styles.css tests/content.test.mjs
git commit -m "feat: location chapter"
```

---

### Task 10: 갤러리 (Gallery) chapter

**Files:**
- Modify: `index.html` (`data-chapter="gallery"` section)
- Modify: `css/styles.css` (phase-grouped gallery grid)
- Modify: `tests/content.test.mjs`

**Interfaces:**
- Consumes: all `images/gallery-*` and `images/history-*` files (Task 1) — history images are reused here as each phase's first gallery photo, paired with a second `gallery-*-02` photo.

- [ ] **Step 1: Replace the gallery section content**

```html
<section class="chapter" data-chapter="gallery" aria-labelledby="gallery-title" hidden>
  <div class="container">
    <p class="eyebrow">갤러리</p>
    <h2 id="gallery-title" class="section-title">6차 현장, 그리고 1~5차의 기록</h2>

    <div class="gallery-group gallery-group-current">
      <p class="gallery-group-label mono">6차 · 애월읍 하귀2리 · 착공 전</p>
      <div class="gallery-row">
        <img src="images/6cha-rooftop.jpg" alt="마크힐애월6차 옥탑 커뮤니티" loading="lazy">
        <img src="images/6cha-siteplan.jpg" alt="마크힐애월6차 배치도" loading="lazy">
        <img src="images/6cha-location.jpg" alt="마크힐애월6차 입지 안내" loading="lazy">
      </div>
    </div>

    <div class="gallery-group">
      <p class="gallery-group-label mono">1차 · 2020~21 · 애월읍 상귀리</p>
      <div class="gallery-row">
        <img src="images/history-1cha.jpg" alt="마크힐애월1차 주방·다이닝" loading="lazy">
        <img src="images/gallery-1cha-02.jpg" alt="마크힐애월1차 드레스룸" loading="lazy">
      </div>
    </div>
    <div class="gallery-group">
      <p class="gallery-group-label mono">2차 · 2022 · 애월읍 상귀리</p>
      <div class="gallery-row">
        <img src="images/history-2cha.jpg" alt="마크힐애월2차 거실" loading="lazy">
        <img src="images/gallery-2cha-02.jpg" alt="마크힐애월2차 욕실" loading="lazy">
      </div>
    </div>
    <div class="gallery-group">
      <p class="gallery-group-label mono">3차 · 2022 · 애월읍 상귀리</p>
      <div class="gallery-row">
        <img src="images/history-3cha.jpg" alt="마크힐애월3차 주방" loading="lazy">
        <img src="images/gallery-3cha-02.jpg" alt="마크힐애월3차 침실" loading="lazy">
      </div>
    </div>
    <div class="gallery-group">
      <p class="gallery-group-label mono">4차 · 2023 · 제주시 외도일동</p>
      <div class="gallery-row">
        <img src="images/history-4cha.jpg" alt="마크힐애월4차 서재 공간" loading="lazy">
        <img src="images/gallery-4cha-02.jpg" alt="마크힐애월4차 드레스룸" loading="lazy">
      </div>
    </div>
    <div class="gallery-group">
      <p class="gallery-group-label mono">5차 · 2024~25 · 노형동</p>
      <div class="gallery-row">
        <img src="images/history-5cha-penthouse.jpg" alt="마크힐노형 펜트하우스 주방" loading="lazy">
        <img src="images/gallery-5cha-02.jpg" alt="마크힐노형 일반평수 복도" loading="lazy">
      </div>
      <p class="gallery-note">* 5차(노형) 시공 사례입니다. 6차(애월)는 착공 전으로 실제 인테리어 사진이 아직 없습니다.</p>
    </div>
  </div>
</section>
```

- [ ] **Step 2: Append gallery CSS**

```css
.gallery-group { margin: 40px 0; }
.gallery-group-label { color: var(--accent-ink); margin-bottom: 12px; }
.gallery-row {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  gap: 12px;
}
.gallery-row img { width: 100%; aspect-ratio: 4/3; object-fit: cover; border-radius: 10px; transition: transform 0.25s ease; }
.gallery-row img:hover { transform: scale(1.02); }
.gallery-group-current .gallery-row { grid-template-columns: repeat(auto-fit, minmax(260px, 1fr)); }
.gallery-note { margin-top: 12px; font-size: 13px; color: var(--ink-subtle); }
```

- [ ] **Step 3: Append content assertions**

```javascript
test('gallery chapter groups photos by phase and labels 5cha as a prior build', () => {
  for (const phase of ['1차', '2차', '3차', '4차', '5차']) {
    assert.ok(html.includes(`${phase} ·`), `missing gallery group label for ${phase}`);
  }
  assert.ok(html.includes('착공 전으로 실제 인테리어 사진이 아직 없습니다'));
});
```

- [ ] **Step 4: Run tests, visual check, commit**

```bash
git add index.html css/styles.css tests/content.test.mjs
git commit -m "feat: gallery chapter grouped by phase 1-6cha"
```

---

### Task 11: 문의 (Contact) chapter and footer

**Files:**
- Modify: `index.html` (`data-chapter="contact"` section, add footer after `</main>`)
- Modify: `css/styles.css` (contact layout, dark footer)
- Modify: `tests/content.test.mjs`

- [ ] **Step 1: Replace the contact section content**

```html
<section class="chapter chapter-dark" data-chapter="contact" aria-labelledby="contact-title" hidden>
  <div class="container contact-block">
    <p class="eyebrow" style="color:var(--accent);">문의</p>
    <h2 id="contact-title" class="section-title">전화 한 통이면 충분합니다</h2>
    <p class="section-lede" style="color:var(--on-dark-muted);">마크힐애월6차 상담과 계약은 아승공인중개사가 함께합니다.</p>

    <div class="contact-card">
      <p class="contact-name">아승공인중개사</p>
      <p class="contact-detail">대표 안현정 · 등록번호 50110-2019-00164</p>
      <button type="button" class="btn btn-accent" data-open-phone-modal>
        <span class="mono">010-9347-1345</span> 전화 상담하기
      </button>
    </div>
  </div>
</section>
```

- [ ] **Step 2: Add the footer after `</main>` in `index.html`**

```html
<footer class="site-footer">
  <div class="container footer-grid">
    <p class="footer-word">MARKHILL AEWOL</p>
    <p class="footer-detail">제주시 애월읍 하귀2리 2089번지 · 분양대행 아승공인중개사 안현정 · 010-9347-1345 · 등록번호 50110-2019-00164</p>
    <p class="footer-legal">본 페이지의 분양 정보는 2026.06.22 기준 분양안내자료를 근거로 하며, 사업 진행 과정에서 변동될 수 있습니다.</p>
  </div>
</footer>
```

- [ ] **Step 3: Append contact/footer CSS**

```css
.chapter-dark { background: var(--dark-surface); color: var(--on-dark); }
.contact-block { text-align: center; padding: 40px 0; }
.contact-card {
  margin: 32px auto 0;
  max-width: 420px;
  padding: 32px;
  border: 1px solid rgba(248,246,242,0.15);
  border-radius: 16px;
}
.contact-name { font-family: var(--font-display); font-weight: 900; font-size: 22px; margin-bottom: 8px; }
.contact-detail { color: var(--on-dark-muted); font-size: 14px; margin-bottom: 20px; }
.site-footer { background: var(--dark-surface); color: var(--on-dark-muted); padding: 40px 0; font-size: 13px; }
.footer-grid { display: grid; gap: 8px; }
.footer-word { font-family: var(--font-display); font-weight: 900; font-size: 18px; color: var(--on-dark); }
```

- [ ] **Step 4: Wire `[data-open-phone-modal]` to open the modal**

This already works — `js/script.js` (Task 3, Step 7) listens for clicks on `[data-open-phone-modal]` anywhere in the document via event delegation, so no JS changes are needed here.

- [ ] **Step 5: Append content assertions**

```javascript
test('contact chapter and footer only ever route to Aseung realty', () => {
  assert.ok(html.includes('아승공인중개사'));
  assert.ok(html.includes('안현정'));
  assert.ok(html.includes('50110-2019-00164'));
  assert.ok(!html.toLowerCase().includes('후기'));
  assert.ok(!html.includes('<form'));
});
```

- [ ] **Step 6: Run tests**

Run: `node --test`
Expected: PASS (all suites, including the earlier "only phone number is 010-9347-1345" test from Task 3 — this is the point where it's fully exercised across every chapter's real content)

- [ ] **Step 7: Visual check**

Serve and open. Click "문의" tab, click the "전화 상담하기" button, confirm the phone modal opens with 010-9347-1345 and the copy button works. Scroll to footer, confirm it renders below `#chapterHost` regardless of which chapter is active (footer is outside `<main>`, so it's always visible — verify this is the intended behavior; if not, wrap footer visibility logic is out of scope for this plan and should stay simple/always-visible).

- [ ] **Step 8: Commit**

```bash
git add index.html css/styles.css tests/content.test.mjs
git commit -m "feat: contact chapter, phone modal wiring, and footer"
```

---

### Task 12: Chapter-entry stagger reveal, responsive pass, and reduced-motion audit

**Files:**
- Modify: `js/script.js` (IntersectionObserver-driven stagger reveal)
- Modify: `css/styles.css` (reveal utility classes, responsive breakpoints)
- Create: `tests/reveal.test.mjs`

**Interfaces:**
- Consumes: every chapter section built in Tasks 4–11.
- Produces: a `.reveal` utility class and `data-reveal-group` attribute convention any future chapter content can opt into.

- [ ] **Step 1: Add `.reveal` opt-in markup to each chapter's direct content blocks**

In `index.html`, add `class="reveal"` to: each `.timeline-card`, each `.feature-card`, `.siteplan-block`, `.signature-moment`, each `.location-block`, each `.gallery-group`, and `.contact-card`. Example diff for one card:

```html
<article class="timeline-card reveal">
```

Repeat for the other elements listed above (12 elements total across Tasks 5, 6, 7, 9, 10, 11).

- [ ] **Step 2: Write the failing test for the reveal utility class markup**

Create `tests/reveal.test.mjs`:

```javascript
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const html = readFileSync('index.html', 'utf8');

test('every timeline card, feature card, and gallery group opts into reveal animation', () => {
  const revealCount = (html.match(/class="[^"]*\breveal\b[^"]*"/g) ?? []).length;
  assert.ok(revealCount >= 12, `expected at least 12 reveal-tagged elements, found ${revealCount}`);
});
```

- [ ] **Step 3: Run it to confirm it fails before Step 1, or passes now**

Run: `node --test tests/reveal.test.mjs`
Expected: PASS after Step 1's markup changes are in place.

- [ ] **Step 4: Append reveal CSS**

```css
.reveal { opacity: 0; transform: translateY(16px); transition: opacity 0.5s ease, transform 0.5s ease; }
.reveal.is-visible { opacity: 1; transform: translateY(0); }
@media (prefers-reduced-motion: reduce) {
  .reveal { opacity: 1; transform: none; transition: none; }
}
```

- [ ] **Step 5: Append the IntersectionObserver to `js/script.js`**

```javascript
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
```

- [ ] **Step 6: Responsive pass**

Append to `css/styles.css`:

```css
@media (max-width: 640px) {
  .chapter-nav-list { gap: 14px; }
  .hero-headline { font-size: clamp(28px, 9vw, 40px); }
  .spec-table th { width: 110px; font-size: 13px; }
  .area-table, .price-table { font-size: 12px; }
  .area-table th, .price-table th, .area-table td, .price-table td { padding: 8px 6px; }
}
```

- [ ] **Step 7: Run the full test suite**

Run: `node --test`
Expected: PASS — `chapter-router.test.mjs`, `content.test.mjs`, `reveal.test.mjs` all green.

- [ ] **Step 8: Manual QA pass (no automated test for this — visual/interaction only)**

Using the `run` skill or a plain static server, check at 375px, 768px, 1024px, 1440px widths:
- Nav doesn't overlap content, chapter tabs remain clickable and scrollable on mobile
- Hero headline never overflows its container
- All three tables (spec/area/price) remain legible without horizontal page scroll (they may scroll internally)
- Every image loads (no broken `images/` paths)
- Tab through the page with keyboard only — nav buttons, CTA links, and the phone modal's close button all show a visible focus outline (if not, add `:focus-visible { outline: 2px solid var(--accent); outline-offset: 2px; }` to `css/styles.css` and re-check)
- With OS/devtools "reduce motion" forced on: hero has no Ken Burns, no fade-up; chapters switch instantly; `.reveal` elements are visible immediately with no transition

- [ ] **Step 9: Commit**

```bash
git add index.html css/styles.css js/script.js tests/reveal.test.mjs
git commit -m "feat: staggered reveal animation, responsive pass, reduced-motion audit"
```

---

## Self-Review Notes

- **Spec coverage:** all 8 chapters from the design spec are implemented (Tasks 4–11); visual tokens/typography (Task 2); chapter-click navigation instead of long scroll (Task 3); Ken Burns hero + chapter-level motion (Tasks 4, 12); honesty-principle disclaimers and phase labeling (Tasks 8, 10); phone-only contact with no form/reviews (Task 11); real curated photography throughout, no AI-generated imagery was actually needed once real assets were found for every chapter — if a future content gap appears (e.g. a missing icon), generate it as an abstract/decorative asset only, never a fabricated interior photo, per the spec's AI-image guideline.
- **Type/interface consistency:** `CHAPTER_IDS` (Task 3) is the single source of truth for chapter order; every chapter's `data-chapter` value across Tasks 4–11 matches one of its 8 entries exactly (`intro`, `history`, `overview`, `premium`, `types`, `location`, `gallery`, `contact`).
- **No placeholders:** every task ships real Korean copy and real figures sourced from the spec; no `TBD`/`TODO` strings appear anywhere in this plan.
