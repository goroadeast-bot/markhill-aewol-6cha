# 마크힐애월6차 리디자인 구현 계획

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Convert the existing 8-chapter click-to-switch site into one continuous-scroll page with a redesigned split-layout hero, and cut the fixed nav down to 4 anchor links with scroll-spy highlighting.

**Architecture:** Delete the JS chapter router (`js/chapter-router.js`, the hide/show logic in `js/script.js`) entirely. Sections stop being hidden/shown — they're always in the document, in a new order, and the fixed nav becomes plain `<a href="#id">` anchors relying on the page's existing `scroll-behavior: smooth` (already global) plus a new `scroll-margin-top` rule so the fixed nav never covers a section's heading. The only new JS is a small scroll-spy (IntersectionObserver) that highlights which of the 4 nav links is "active" as the user scrolls — implemented as a pure, unit-testable function (`pickActiveNav`) plus a thin DOM-wiring layer, mirroring the existing `resolveChapter` pattern in this codebase.

**Tech Stack:** Vanilla HTML/CSS/ES modules, no build step, no new dependencies. Tests run with `node --test` (Node 24, no test framework package). Live verification uses Playwright via `npx` (same approach already used in this project's history — no `package.json`/devDependency is added for it).

## Global Constraints

- Reuse existing CSS custom properties only (`--bg`, `--bg-alt`, `--ink`, `--ink-muted`, `--ink-subtle`, `--border`, `--accent`, `--accent-ink`, `--dark-surface`, `--on-dark`, `--on-dark-muted`, `--font-body`, `--font-display`, `--font-mono`) — no new color tokens.
- The only phone number anywhere on the page is `010-9347-1345`.
- The hero stat-bar sale price is `4.48억~5.13억` (102동 최저 44,800만 ~ 최고 51,300만원) — do not use `4.58억` (that figure was a mockup typo, never the real 102동 minimum).
- The reused hero photo (`images/history-5cha-penthouse.jpg`) is a 5차(노형) photo, not 6차. It must carry a visible "5차 노형 · 시공 사례" label in the hero — 6차 has no real photos yet (pre-construction), and nothing on the page may imply otherwise.
- The removed hero tagline "서부지역 마지막 마크힐" must not reappear in the hero. It legitimately still appears in the 마크힐의 역사 timeline's 6차 card (that usage predates this redesign and is sourced from the official brochure) — do not touch that occurrence.
- No customer testimonials, no lead-capture form, no fabricated statistics — unchanged from the base spec.
- `prefers-reduced-motion: reduce` must continue to be respected by every animated/transitioning rule (existing global override already disables `scroll-behavior: smooth` too — don't bypass it with JS-driven scrolling that ignores the media query).
- No new npm dependencies, no `package.json`, no build step. Tests run via `node --test`.
- Follow existing naming conventions: kebab-case CSS classes prefixed by component (`.hero-*`, `.timeline-*`, …), `.mono` utility class on any element showing digits/prices.

---

## File Structure

- **Create** `js/scroll-spy.js` — pure logic: which of the 4 nav zones is "active" given intersection ratios. Replaces `js/chapter-router.js`.
- **Create** `tests/scroll-spy.test.mjs` — unit tests for the above. Replaces `tests/chapter-router.test.mjs`.
- **Delete** `js/chapter-router.js`, `tests/chapter-router.test.mjs` — the click-to-switch router is gone.
- **Modify** `index.html` — reorder/unwrap the 애월6차분양 subsections, rebuild the hero section, rebuild the fixed nav to 4 links.
- **Modify** `css/styles.css` — remove chapter-router-era rules (`min-height`, `[hidden]`, `is-entering`/`chapterFadeIn`), remove the old hero rules, add the new split-hero + nav + scroll-margin rules.
- **Modify** `js/script.js` — remove all router usage, wire up the scroll-spy.
- **Modify** `tests/content.test.mjs` — replace the router-coupled assertions with anchor-integrity and new-hero-content assertions; add the 4 new icon images to the required-images list.

---

### Task 1: Scroll-spy pure logic module

**Files:**
- Create: `js/scroll-spy.js`
- Test: `tests/scroll-spy.test.mjs`

**Interfaces:**
- Produces: `NAV_ZONES` (array of `{ navTarget: string, sectionId: string }`, 4 entries, in nav order: sale, history, gallery, contact) and `pickActiveNav(visibleZones: {navTarget: string, ratio: number}[]): string | null` — both consumed by `js/script.js` in Task 4.

This task is purely additive — it does not touch `index.html`, `css/styles.css`, or the existing `js/chapter-router.js`/`js/script.js`, so the site keeps working exactly as it does today after this task.

- [ ] **Step 1: Write the failing test**

Create `tests/scroll-spy.test.mjs`:

```js
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { NAV_ZONES, pickActiveNav } from '../js/scroll-spy.js';

test('NAV_ZONES lists the 4 top-level nav zones in order', () => {
  assert.deepEqual(
    NAV_ZONES.map((zone) => zone.navTarget),
    ['sale', 'history', 'gallery', 'contact']
  );
});

test('NAV_ZONES navTarget and sectionId match for every zone', () => {
  for (const zone of NAV_ZONES) {
    assert.equal(zone.navTarget, zone.sectionId);
  }
});

test('pickActiveNav returns null when nothing is visible', () => {
  assert.equal(pickActiveNav([]), null);
});

test('pickActiveNav picks the zone with the highest intersection ratio', () => {
  const result = pickActiveNav([
    { navTarget: 'sale', ratio: 0.2 },
    { navTarget: 'history', ratio: 0.6 },
    { navTarget: 'gallery', ratio: 0.1 },
  ]);
  assert.equal(result, 'history');
});

test('pickActiveNav breaks ties by keeping the first-listed zone', () => {
  const result = pickActiveNav([
    { navTarget: 'sale', ratio: 0.5 },
    { navTarget: 'history', ratio: 0.5 },
  ]);
  assert.equal(result, 'sale');
});

test('pickActiveNav ignores zones with zero ratio when a positive one exists', () => {
  const result = pickActiveNav([
    { navTarget: 'sale', ratio: 0 },
    { navTarget: 'gallery', ratio: 0.3 },
  ]);
  assert.equal(result, 'gallery');
});
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `node --test tests/scroll-spy.test.mjs`
Expected: FAIL — `Cannot find module '../js/scroll-spy.js'`

- [ ] **Step 3: Write the minimal implementation**

Create `js/scroll-spy.js`:

```js
export const NAV_ZONES = [
  { navTarget: 'sale', sectionId: 'sale' },
  { navTarget: 'history', sectionId: 'history' },
  { navTarget: 'gallery', sectionId: 'gallery' },
  { navTarget: 'contact', sectionId: 'contact' },
];

export function pickActiveNav(visibleZones) {
  if (visibleZones.length === 0) return null;
  return visibleZones.reduce((best, zone) => (zone.ratio > best.ratio ? zone : best)).navTarget;
}
```

- [ ] **Step 4: Run the test to verify it passes**

Run: `node --test tests/scroll-spy.test.mjs`
Expected: PASS — 6/6 tests green.

- [ ] **Step 5: Commit**

```bash
git add js/scroll-spy.js tests/scroll-spy.test.mjs
git commit -m "feat: add scroll-spy pure logic module (replaces chapter-router)"
```

---

### Task 2: De-couple body sections from the router; reorder the 애월6차분양 subsections

**Files:**
- Modify: `index.html`
- Modify: `tests/content.test.mjs`

**Interfaces:**
- Consumes: nothing from Task 1.
- Produces: section ids `overview`, `location`, `types`, `premium` (wrapped together in `<div class="sale-group" id="sale">`, in that order), `history`, `gallery`, `contact` — consumed by Task 3 (hero cards + nav link hrefs) and Task 4 (`NAV_ZONES.sectionId` lookups).

The hero section (`data-chapter="intro"`) is intentionally left untouched here — Task 3 replaces it wholesale, so editing it now would be wasted work.

- [ ] **Step 1: Write the failing tests**

In `tests/content.test.mjs`, **replace** the existing test:

```js
test('every fixed-nav target matches a real chapter section', () => {
  const navBlock = html.match(/<nav class="chapter-nav"[\s\S]*?<\/nav>/)[0];
  const navTargets = [...navBlock.matchAll(/data-nav-target="([^"]+)"/g)].map((m) => m[1]);
  const chapterIds = [...html.matchAll(/data-chapter="([^"]+)"/g)].map((m) => m[1]);
  assert.deepEqual(navTargets, chapterIds);
});
```

with:

```js
test('the six non-hero sections use id, not the old data-chapter router attribute', () => {
  for (const id of ['overview', 'location', 'types', 'premium', 'history', 'gallery', 'contact']) {
    assert.ok(html.includes(`id="${id}"`), `expected id="${id}"`);
  }
  // The hero section hasn't been rebuilt yet in this task — it still carries
  // data-chapter="intro" until Task 3 replaces it.
  const dataChapterMatches = [...html.matchAll(/data-chapter="([^"]+)"/g)].map((m) => m[1]);
  assert.deepEqual(dataChapterMatches, ['intro']);
});

test('the 애월6차분양 subsections appear in the order 개요→입지→타입&가격→프리미엄, wrapped in #sale', () => {
  const saleGroupMatch = html.match(/<div class="sale-group" id="sale">([\s\S]*?)<\/div>\s*\n\s*<section/);
  assert.ok(saleGroupMatch, 'expected a <div class="sale-group" id="sale"> wrapping the four subsections');
  const saleGroupInner = saleGroupMatch[1];
  const idsInGroup = [...saleGroupInner.matchAll(/<section class="chapter" id="([^"]+)"/g)].map((m) => m[1]);
  assert.deepEqual(idsInGroup, ['overview', 'location', 'types', 'premium']);
});

test('the history 6cha card links to #overview instead of using the old router attribute', () => {
  const historyBlock = html.match(/<section class="chapter" id="history"[\s\S]*?<\/section>/)[0];
  assert.ok(historyBlock.includes('href="#overview"'));
  assert.ok(!historyBlock.includes('data-nav-target'));
  // Note: the old 8-button nav still has data-nav-target="overview" at this
  // point in the plan — it isn't rebuilt until Task 3 — so this assertion is
  // deliberately scoped to the history section only, not the whole page.
});
```

Also **delete** the now-covered-elsewhere image assertion is NOT needed here — leave `requiredImages` untouched in this task (Task 3 adds the new image entries).

- [ ] **Step 2: Run the tests to verify they fail**

Run: `node --test tests/content.test.mjs`
Expected: FAIL — the new/changed assertions fail because `index.html` still has the old `data-chapter`/ordering/`data-nav-target="overview"` structure.

- [ ] **Step 3: Restructure `index.html`**

Replace the entire block from `<section class="chapter" data-chapter="history" ...>` (the section right after the hero's closing `</section>`) through the closing `</section>` of the old `data-chapter="contact"` section — i.e. everything inside `<main>` **except** the still-untouched hero section — with:

```html
  <div class="sale-group" id="sale">
    <section class="chapter" id="overview" aria-labelledby="overview-title">
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
            <tr><th>주민공동시설</th><td>근생104호 마크힐센터(남건 직접 소유·운영 피트니스, 3년 확정운영) · 옥탑(요가&amp;스트레칭존, 펫플레이그라운드, 선셋라운지)</td></tr>
            <tr><th>일정</th><td class="mono">2026년 10월 샘플하우스 오픈 · 2027년 7월 입주 예정</td></tr>
          </tbody>
        </table>

        <div class="siteplan-block reveal">
          <img src="images/6cha-siteplan.jpg" alt="마크힐애월6차 배치도 항공사진" loading="lazy">
          <p class="siteplan-caption">101동·102동 배치도 — 하귀성당 사거리 북서측 코너부지</p>
        </div>
      </div>
    </section>
    <section class="chapter" id="location" aria-labelledby="location-title">
      <div class="container">
        <p class="eyebrow">입지</p>
        <h2 id="location-title" class="section-title">하귀2리, 교육과 조망을 함께</h2>

        <div class="location-grid">
          <div class="location-block reveal">
            <p class="feature-title">교육여건</p>
            <p>하귀초등학교 · 귀일중학교 도보 통학 가능. 하귀초 병설유치원 인접.</p>
          </div>
          <div class="location-block reveal">
            <p class="feature-title">생활여건</p>
            <p>공항 및 신제주 인접한 자연친화적 주거환경. 하귀·외도택지 생활권, 하나로마트 등 편의시설 인접. 일주서로/애조로 인접.</p>
          </div>
          <div class="location-block reveal">
            <p class="feature-title">조망권</p>
            <p>하귀2리 주거지 중 가장 높은 위치. 바다 및 자연조망향 동배치로 조망권 확보.</p>
          </div>
        </div>

        <img class="location-photo" src="images/6cha-location.jpg" alt="마크힐애월6차 입지 안내 — 교육/생활/조망권" loading="lazy">
      </div>
    </section>
    <section class="chapter" id="types" aria-labelledby="types-title">
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
    <section class="chapter" id="premium" aria-labelledby="premium-title">
      <div class="container">
        <p class="eyebrow">프리미엄</p>
        <h2 id="premium-title" class="section-title">마크힐이 6차에서도 지키는 것들</h2>

        <div class="feature-grid">
          <div class="feature-card reveal">
            <p class="feature-title">전세대 태양광</p>
            <p>세대당 2.93kw 태양광패널을 옥탑 구조물 형태로 설치합니다.</p>
          </div>
          <div class="feature-card reveal">
            <p class="feature-title">세라믹 상판 · 아일랜드 주방</p>
            <p>오염과 열기에 강한 세라믹 상판과 넓은 아일랜드 조리대.</p>
          </div>
          <div class="feature-card reveal">
            <p class="feature-title">시그니처 히든 슬라이딩도어</p>
            <p>다이닝 공간에서 다용도실로 이어지는, 1차부터 이어온 마크힐의 상징적 공간.</p>
          </div>
          <div class="feature-card reveal">
            <p class="feature-title">세대내 스프링클러</p>
            <p>화재 초기진압을 위한 전세대 스프링클러 설치.</p>
          </div>
          <div class="feature-card reveal">
            <p class="feature-title">마크힐센터</p>
            <p>근생104호, 남건 직접 소유·운영 피트니스센터 (3년 확정운영).</p>
          </div>
          <div class="feature-card reveal">
            <p class="feature-title">부부욕실 욕조</p>
            <p>안방 욕실에 욕조를 갖춘 여유로운 구성.</p>
          </div>
        </div>

        <figure class="signature-moment reveal">
          <img src="images/6cha-rooftop.jpg" alt="마크힐애월6차 옥탑 커뮤니티 시설 — 요가&스트레칭존, 펫플레이그라운드, 선셋라운지" loading="lazy">
          <figcaption>
            <p class="eyebrow" style="color:var(--accent);">시그니처</p>
            <p class="section-title" style="font-size:28px;">옥탑 선셋라운지</p>
            <p class="section-lede">요가&amp;스트레칭존, 펫플레이그라운드, 그리고 하귀2리 노을을 담은 선셋라운지까지 — 옥탑 전체를 주민공동공간으로 열었습니다.</p>
          </figcaption>
        </figure>
      </div>
    </section>
  </div>

  <section class="chapter" id="history" aria-labelledby="history-title">
    <div class="container">
      <p class="eyebrow">마크힐의 역사</p>
      <h2 id="history-title" class="section-title">2020년부터, 마크힐이 걸어온 길</h2>
      <p class="section-lede">애월 상귀리에서 시작해 노형, 그리고 다시 애월 하귀로 — 남건종합건설이 짓고 아승공인중개사가 함께한 마크힐의 여섯 걸음입니다.</p>

      <div class="timeline-grid">
        <article class="timeline-card reveal">
          <div class="timeline-photo" style="background-image:url('images/history-1cha.jpg')"></div>
          <div class="timeline-body">
            <p class="timeline-tag mono">1차 · 2020~21 · 애월읍 상귀리</p>
            <p>18세대(3개동). 마크힐 첫 공급, 준공 전 완판.</p>
          </div>
        </article>
        <article class="timeline-card reveal">
          <div class="timeline-photo" style="background-image:url('images/history-2cha.jpg')"></div>
          <div class="timeline-body">
            <p class="timeline-tag mono">2차 · 2022 · 애월읍 상귀리</p>
            <p>23세대(4개동). 환기 개선, 다이닝룸 구조기둥 제거로 개방감 확대.</p>
          </div>
        </article>
        <article class="timeline-card reveal">
          <div class="timeline-photo" style="background-image:url('images/history-3cha.jpg')"></div>
          <div class="timeline-body">
            <p class="timeline-tag mono">3차 · 2022 · 애월읍 상귀리</p>
            <p>26세대. 2차와 동시 진행, 오션뷰 2개동 + 정남향 1개동 배치.</p>
          </div>
        </article>
        <article class="timeline-card reveal">
          <div class="timeline-photo" style="background-image:url('images/history-4cha.jpg')"></div>
          <div class="timeline-body">
            <p class="timeline-tag mono">4차 · 2023 · 제주시 외도일동</p>
            <p>12세대(2개동). 가전·보일러 모바일 제어 최초 도입, 샘플하우스 디피 제품 판매수익 제주사회복지공동모금회 기부.</p>
          </div>
        </article>
        <article class="timeline-card reveal">
          <div class="timeline-photo" style="background-image:url('images/history-5cha-penthouse.jpg')"></div>
          <div class="timeline-body">
            <p class="timeline-tag mono">5차 · 2024~25 · 노형동</p>
            <p>48세대(8개동). 마크힐 최초 복층형 펜트하우스 8세대, 보이드 구조. 사용승인 2025.7.17.</p>
          </div>
        </article>
        <article class="timeline-card timeline-card-current reveal">
          <div class="timeline-body">
            <p class="timeline-tag mono">6차 · 2026~ · 애월읍 하귀2리</p>
            <p>20세대 + 근생 4실. 서부지역 마지막 마크힐, 전세대 태양광, 옥탑 선셋라운지.</p>
            <a class="btn btn-accent" href="#overview">6차 자세히 보기</a>
          </div>
        </article>
      </div>
    </div>
  </section>
  <section class="chapter" id="gallery" aria-labelledby="gallery-title">
    <div class="container">
      <p class="eyebrow">갤러리</p>
      <h2 id="gallery-title" class="section-title">6차 현장, 그리고 1~5차의 기록</h2>

      <div class="gallery-group gallery-group-current reveal">
        <p class="gallery-group-label mono">6차 · 애월읍 하귀2리 · 착공 전</p>
        <div class="gallery-row">
          <img src="images/6cha-rooftop.jpg" alt="마크힐애월6차 옥탑 커뮤니티" loading="lazy">
          <img src="images/6cha-siteplan.jpg" alt="마크힐애월6차 배치도" loading="lazy">
          <img src="images/6cha-location.jpg" alt="마크힐애월6차 입지 안내" loading="lazy">
        </div>
      </div>

      <div class="gallery-group reveal">
        <p class="gallery-group-label mono">1차 · 2020~21 · 애월읍 상귀리</p>
        <div class="gallery-row">
          <img src="images/history-1cha.jpg" alt="마크힐애월1차 주방·다이닝" loading="lazy">
          <img src="images/gallery-1cha-02.jpg" alt="마크힐애월1차 드레스룸" loading="lazy">
        </div>
      </div>
      <div class="gallery-group reveal">
        <p class="gallery-group-label mono">2차 · 2022 · 애월읍 상귀리</p>
        <div class="gallery-row">
          <img src="images/history-2cha.jpg" alt="마크힐애월2차 거실" loading="lazy">
          <img src="images/gallery-2cha-02.jpg" alt="마크힐애월2차 욕실" loading="lazy">
        </div>
      </div>
      <div class="gallery-group reveal">
        <p class="gallery-group-label mono">3차 · 2022 · 애월읍 상귀리</p>
        <div class="gallery-row">
          <img src="images/history-3cha.jpg" alt="마크힐애월3차 주방" loading="lazy">
          <img src="images/gallery-3cha-02.jpg" alt="마크힐애월3차 침실" loading="lazy">
        </div>
      </div>
      <div class="gallery-group reveal">
        <p class="gallery-group-label mono">4차 · 2023 · 제주시 외도일동</p>
        <div class="gallery-row">
          <img src="images/history-4cha.jpg" alt="마크힐애월4차 서재 공간" loading="lazy">
          <img src="images/gallery-4cha-02.jpg" alt="마크힐애월4차 드레스룸" loading="lazy">
        </div>
      </div>
      <div class="gallery-group reveal">
        <p class="gallery-group-label mono">5차 · 2024~25 · 노형동</p>
        <div class="gallery-row">
          <img src="images/history-5cha-penthouse.jpg" alt="마크힐노형 펜트하우스 주방" loading="lazy">
          <img src="images/gallery-5cha-02.jpg" alt="마크힐노형 일반평수 복도" loading="lazy">
        </div>
        <p class="gallery-note">* 5차(노형) 시공 사례입니다. 6차(애월)는 착공 전으로 실제 인테리어 사진이 아직 없습니다.</p>
      </div>
    </div>
  </section>
  <section class="chapter chapter-dark" id="contact" aria-labelledby="contact-title">
    <div class="container contact-block">
      <p class="eyebrow" style="color:var(--accent);">문의</p>
      <h2 id="contact-title" class="section-title">전화 한 통이면 충분합니다</h2>
      <p class="section-lede" style="color:var(--on-dark-muted);">마크힐애월6차 상담과 계약은 아승공인중개사가 함께합니다.</p>

      <div class="contact-card reveal">
        <p class="contact-name">아승공인중개사</p>
        <p class="contact-detail">대표 안현정 · 등록번호 50110-2019-00164</p>
        <button type="button" class="btn btn-accent" data-open-phone-modal>
          <span class="mono">010-9347-1345</span> 전화 상담하기
        </button>
      </div>
    </div>
  </section>
```

(Content inside each `<section>` is unchanged from before — only `data-chapter="X"` became `id="X"`, `hidden` was removed, the four sale subsections were reordered and wrapped in `.sale-group`, and the history 6차 card's button became `<a href="#overview">`.)

- [ ] **Step 4: Run the tests to verify they pass**

Run: `node --test tests/content.test.mjs`
Expected: PASS on the new/changed tests. Two pre-existing tests will now fail and that's expected at this checkpoint — **do not fix them in this task**:
- `'every timeline card, feature card, and gallery group opts into reveal animation'` (reveal.test.mjs) should still PASS (untouched count-wise).
- Any assertion in content.test.mjs that still references the old hero (none do directly — the hero-specific test checks `css.includes('images/hero-living-3cha.jpg')`, which is still true since Task 3 hasn't touched the hero or CSS yet).

Run the full suite to confirm nothing else broke: `node --test`
Expected: all PASS except none — this task should leave the whole suite green (the router-coupled test was replaced, not left broken).

- [ ] **Step 5: Commit**

```bash
git add index.html tests/content.test.mjs
git commit -m "refactor: de-couple body sections from the chapter router; reorder 애월6차분양 subsections"
```

---

### Task 3: Rebuild the hero section and the fixed nav

**Files:**
- Modify: `index.html`
- Modify: `css/styles.css`
- Modify: `tests/content.test.mjs`

**Interfaces:**
- Consumes: section ids from Task 2 (`sale`, `overview`, `location`, `types`, `premium`, `history`, `gallery`, `contact`).
- Produces: `.chapter-nav-list a[href]` (4 links, consumed by Task 4's scroll-spy wiring), `#hero-title` heading, `images/icon-*.jpeg` referenced as hero-card icons (already present in `images/` — confirmed via `git log` in this repo, no curation step needed).

- [ ] **Step 1: Write the failing tests**

In `tests/content.test.mjs`, **replace** the Task-2 checkpoint test:

```js
test('the six non-hero sections use id, not the old data-chapter router attribute', () => {
  for (const id of ['overview', 'location', 'types', 'premium', 'history', 'gallery', 'contact']) {
    assert.ok(html.includes(`id="${id}"`), `expected id="${id}"`);
  }
  // The hero section hasn't been rebuilt yet in this task — it still carries
  // data-chapter="intro" until Task 3 replaces it.
  const dataChapterMatches = [...html.matchAll(/data-chapter="([^"]+)"/g)].map((m) => m[1]);
  assert.deepEqual(dataChapterMatches, ['intro']);
});
```

with:

```js
test('no section uses the old data-chapter router attribute anymore', () => {
  for (const id of ['overview', 'location', 'types', 'premium', 'history', 'gallery', 'contact']) {
    assert.ok(html.includes(`id="${id}"`), `expected id="${id}"`);
  }
  assert.ok(!html.includes('data-chapter='), 'data-chapter should be fully removed');
  assert.ok(!html.includes('data-nav-target='), 'data-nav-target should be fully removed');
});

test('the top nav has exactly 4 links pointing to sections that exist exactly once', () => {
  const navBlock = html.match(/<ul class="chapter-nav-list">[\s\S]*?<\/ul>/)[0];
  const navTargets = [...navBlock.matchAll(/href="#([^"]+)"/g)].map((m) => m[1]);
  assert.deepEqual(navTargets, ['sale', 'history', 'gallery', 'contact']);
  for (const id of navTargets) {
    const idMatches = html.match(new RegExp(`id="${id}"`, 'g')) ?? [];
    assert.equal(idMatches.length, 1, `expected exactly one element with id="${id}"`);
  }
});

test('the hero quick-nav cards point to the 4 real subsections, each existing exactly once', () => {
  const heroCardsBlock = html.match(/<nav class="hero-cards"[\s\S]*?<\/nav>/)[0];
  const cardTargets = [...heroCardsBlock.matchAll(/href="#([^"]+)"/g)].map((m) => m[1]);
  assert.deepEqual(cardTargets, ['overview', 'location', 'types', 'premium']);
  for (const id of cardTargets) {
    const idMatches = html.match(new RegExp(`id="${id}"`, 'g')) ?? [];
    assert.equal(idMatches.length, 1, `expected exactly one element with id="${id}"`);
  }
});

test('hero section shows the real 6cha facts, the corrected sale price, and no invented tagline', () => {
  const heroBlock = html.match(/<section class="hero-split"[\s\S]*?<\/section>/)[0];
  assert.ok(heroBlock.includes('마크힐 애월6차'));
  assert.ok(heroBlock.includes('분양상담'));
  assert.ok(heroBlock.includes('하귀2리'));
  assert.ok(heroBlock.includes('84타입 20세대'));
  assert.ok(heroBlock.includes('4.48억'));
  assert.ok(heroBlock.includes('5.13억'));
  assert.ok(!heroBlock.includes('4.58억'), 'the mockup typo price must not end up in the real page');
  assert.ok(!heroBlock.includes('서부지역 마지막 마크힐'), 'hero copy must not include the removed tagline');
  assert.ok(html.includes('서부지역 마지막 마크힐'), 'the phrase must still appear as a documented fact in the history timeline');
  assert.ok(heroBlock.includes('src="images/history-5cha-penthouse.jpg"'));
  assert.ok(heroBlock.includes('5차 노형'), 'the reused hero photo must be labeled as a 5cha reference photo, not implied as 6cha');
});

test('hero consult link and nav CTA both dial the real phone number', () => {
  assert.ok(html.includes('class="hero-consult-link" href="tel:010-9347-1345"'));
  assert.ok(html.includes('class="btn btn-accent chapter-nav-cta" href="tel:010-9347-1345"'));
});
```

Also **update** `requiredImages` in the same file to add the 4 icon images and drop the now-unused hero photo:

```js
const requiredImages = [
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
  'images/icon-overview.jpeg',
  'images/icon-location.jpeg',
  'images/icon-price.jpeg',
  'images/icon-premium.jpeg',
];
```

(`images/hero-living-3cha.jpg` removed from the list — the new hero no longer references it, and no other section picks it up. The file itself is left on disk; nothing deletes it.)

Also **update** the existing `'hero chapter shows the real 6cha headline facts'` test — its CSS-background assertion no longer applies since the hero photo is now an `<img>`, not a CSS background:

```js
test('hero chapter shows the real 6cha headline facts', () => {
  assert.ok(html.includes('마크힐 애월6차'));
  assert.ok(html.includes('하귀2리'));
  assert.ok(html.includes('20세대'));
  assert.ok(html.includes('아승공인중개사'));
});
```

- [ ] **Step 2: Run the tests to verify they fail**

Run: `node --test tests/content.test.mjs`
Expected: FAIL — the hero/nav-related assertions fail because `index.html` still has the old hero and old 8-button nav.

- [ ] **Step 3: Rebuild the nav**

Replace the `<nav class="chapter-nav" ...>` block (currently 8 `<button data-nav-target>` items) with:

```html
<nav class="chapter-nav" aria-label="주요 섹션 이동">
  <div class="chapter-nav-inner">
    <span class="chapter-nav-brand">MARKHILL AEWOL</span>
    <ul class="chapter-nav-list">
      <li><a href="#sale">애월6차분양</a></li>
      <li><a href="#history">역사</a></li>
      <li><a href="#gallery">갤러리</a></li>
      <li><a href="#contact">문의</a></li>
    </ul>
    <a class="btn btn-accent chapter-nav-cta" href="tel:010-9347-1345">전화 상담</a>
  </div>
</nav>
```

- [ ] **Step 4: Rebuild the hero**

Replace `<main id="chapterHost">` with `<main id="pageContent">`.

Replace the entire old hero section:

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

with:

```html
  <section class="hero-split" aria-labelledby="hero-title">
    <div class="hero-split-top">
      <div class="hero-photo-panel">
        <img src="images/history-5cha-penthouse.jpg" alt="마크힐노형(5차) 펜트하우스 주방 — 마크힐의 실제 시공 사례" loading="eager" fetchpriority="high">
        <span class="hero-photo-tag mono">5차 노형 · 시공 사례</span>
      </div>
      <div class="hero-content-panel">
        <div class="hero-head-row">
          <h1 id="hero-title" class="hero-wordmark">마크힐 애월6차<span>분양</span></h1>
          <a class="hero-consult-link" href="tel:010-9347-1345">분양상담</a>
        </div>
        <nav class="hero-cards" aria-label="애월6차분양 바로가기">
          <a class="hero-card reveal" href="#overview">
            <div class="hero-card-icon"><img src="images/icon-overview.jpeg" alt="" loading="lazy"></div>
            <div class="hero-card-text">
              <div class="hero-card-title">개요</div>
              <div class="hero-card-sub mono">OVERVIEW</div>
            </div>
          </a>
          <a class="hero-card reveal" href="#location">
            <div class="hero-card-icon"><img src="images/icon-location.jpeg" alt="" loading="lazy"></div>
            <div class="hero-card-text">
              <div class="hero-card-title">입지</div>
              <div class="hero-card-sub mono">LOCATION</div>
            </div>
          </a>
          <a class="hero-card reveal" href="#types">
            <div class="hero-card-icon"><img src="images/icon-price.jpeg" alt="" loading="lazy"></div>
            <div class="hero-card-text">
              <div class="hero-card-title">타입&amp;가격</div>
              <div class="hero-card-sub mono">PRICE</div>
            </div>
          </a>
          <a class="hero-card reveal" href="#premium">
            <div class="hero-card-icon"><img src="images/icon-premium.jpeg" alt="" loading="lazy"></div>
            <div class="hero-card-text">
              <div class="hero-card-title">프리미엄</div>
              <div class="hero-card-sub mono">PREMIUM</div>
            </div>
          </a>
        </nav>
      </div>
    </div>
    <div class="hero-statbar">
      <div class="hero-stat"><b class="mono">하귀2리</b><span class="mono">제주 애월읍</span></div>
      <div class="hero-stat"><b class="mono">84타입 20세대</b><span class="mono">+근생 4실</span></div>
      <div class="hero-stat"><b class="mono">2027.7 입주</b><span class="mono">예정</span></div>
      <div class="hero-stat"><b class="mono">4.48억~5.13억</b><span class="mono">분양가</span></div>
    </div>
  </section>
```

- [ ] **Step 5: Update `css/styles.css`**

Replace the nav-list button rule:

```css
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
```

with:

```css
.chapter-nav-list a {
  font-size: 14px;
  font-weight: 600;
  color: var(--ink-muted);
  padding: 6px 0;
  white-space: nowrap;
}
.chapter-nav-list a[aria-current="true"] { color: var(--accent); }
```

Replace:

```css
main#chapterHost { padding-top: 60px; }

.chapter { min-height: calc(100vh - 60px); padding: 64px 0; }
.chapter[hidden] { display: none; }

.chapter.is-entering { animation: chapterFadeIn 0.45s ease both; }
@keyframes chapterFadeIn {
  from { opacity: 0; transform: translateY(12px); }
  to { opacity: 1; transform: translateY(0); }
}
```

with:

```css
main#pageContent { padding-top: 60px; }

.chapter { padding: 64px 0; }
.sale-group, .chapter { scroll-margin-top: 76px; }
```

Replace the entire old hero block (from `.chapter-hero` through the reduced-motion override that mentions `.hero-photo::after`):

```css
.chapter-hero { padding: 0; min-height: 100vh; }
.hero-photo {
  position: relative;
  z-index: 0;
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  justify-content: flex-end;
  padding: 48px 24px 80px;
  background-image: url('../images/hero-living-3cha.jpg');
  background-size: cover;
  background-position: 42% 40%;
  background-repeat: no-repeat;
  color: var(--on-dark);
  overflow: hidden;
}
.hero-photo::after {
  content: "";
  position: absolute; inset: 0;
  background-image: url('../images/hero-living-3cha.jpg');
  background-size: cover;
  background-position: 42% 40%;
  background-repeat: no-repeat;
  z-index: -2;
  transform-origin: 42% 40%;
  transform: scale(1.35);
  animation: heroKenBurns 20s ease-out forwards;
}
.hero-photo::before {
  content: "";
  position: absolute; inset: 0;
  background-image:
    linear-gradient(to top, rgba(26,24,21,0.85) 0%, rgba(26,24,21,0.25) 45%, rgba(26,24,21,0.05) 70%, transparent 100%),
    linear-gradient(to bottom, rgba(26,24,21,0.35) 0%, transparent 20%);
  background-size: cover, cover;
  background-position: center, center;
  background-repeat: no-repeat;
  z-index: -1;
}
@keyframes heroKenBurns {
  from { transform: scale(1.35); }
  to   { transform: scale(1.45); }
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
  color: var(--on-dark);
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

with:

```css
.hero-split { }
.hero-split-top { display: flex; min-height: 540px; }
.hero-photo-panel { position: relative; width: 58%; flex-shrink: 0; overflow: hidden; }
.hero-photo-panel img { width: 100%; height: 100%; object-fit: cover; display: block; }
.hero-photo-tag {
  position: absolute; left: 20px; bottom: 20px;
  background: rgba(26,24,21,0.72); color: var(--on-dark);
  font-size: 11px; letter-spacing: 0.04em;
  padding: 7px 14px; border-radius: 999px;
}
.hero-content-panel {
  width: 42%;
  display: flex; flex-direction: column; justify-content: center;
  gap: 20px;
  padding: 40px clamp(24px, 4vw, 56px);
}
.hero-head-row { display: flex; justify-content: space-between; align-items: flex-start; gap: 12px; }
.hero-wordmark {
  font-family: var(--font-display); font-weight: 900;
  font-size: clamp(24px, 2.6vw, 32px); line-height: 1.15; letter-spacing: -0.01em;
}
.hero-wordmark span { display: block; color: var(--accent); }
.hero-consult-link {
  display: inline-flex; align-items: center;
  background: var(--dark-surface); color: var(--on-dark);
  font-size: 12px; font-weight: 700;
  padding: 8px 14px; border-radius: 999px;
  white-space: nowrap; flex-shrink: 0;
}
.hero-consult-link:hover { background: var(--ink); }

.hero-cards { display: flex; flex-direction: column; gap: 10px; }
.hero-card {
  display: flex; align-items: center; gap: 12px;
  background: #fff; border: 1px solid var(--border); border-radius: 12px;
  padding: 12px 14px;
  transition: box-shadow 0.15s ease, transform 0.15s ease;
}
.hero-card:hover { box-shadow: 0 6px 18px rgba(26,24,21,0.1); transform: translateY(-1px); }
.hero-card-icon { width: 44px; height: 44px; border-radius: 10px; overflow: hidden; flex-shrink: 0; }
.hero-card-icon img { width: 100%; height: 100%; object-fit: cover; }
.hero-card-text { display: flex; flex-direction: column; }
.hero-card-title { font-weight: 700; font-size: 15px; }
.hero-card-sub { font-size: 10px; color: var(--ink-subtle); letter-spacing: 0.06em; }

.hero-statbar { display: flex; background: var(--bg-alt); border-top: 1px solid var(--border); border-bottom: 1px solid var(--border); }
.hero-stat { flex: 1; text-align: center; padding: 18px 8px; border-right: 1px solid var(--border); }
.hero-stat:last-child { border-right: none; }
.hero-stat b { display: block; font-size: 15px; font-weight: 700; color: var(--ink); margin-bottom: 4px; }
.hero-stat span { font-size: 12px; color: var(--ink-subtle); }

@media (prefers-reduced-motion: reduce) {
  .hero-card { transition: none; }
}
```

Finally, in the existing `@media (max-width: 640px)` block at the bottom of the file, add these rules (right after the existing `.chapter-nav-cta { padding: 8px 14px; font-size: 13px; }` line):

```css
  .hero-split-top { flex-direction: column; min-height: 0; }
  .hero-photo-panel { width: 100%; aspect-ratio: 4 / 3; }
  .hero-content-panel { width: 100%; padding: 28px 20px; }
  .hero-statbar { flex-wrap: wrap; }
  .hero-stat { width: 50%; flex: 0 0 50%; border-bottom: 1px solid var(--border); }
  .hero-stat:nth-child(2n) { border-right: none; }
```

- [ ] **Step 6: Run the tests to verify they pass**

Run: `node --test`
Expected: all PASS, including `reveal.test.mjs` (the 4 new `.hero-card.reveal` elements only add to the count).

- [ ] **Step 7: Commit**

```bash
git add index.html css/styles.css tests/content.test.mjs
git commit -m "feat: rebuild hero as split photo/content layout with quick-nav cards; rebuild nav to 4 anchor links"
```

---

### Task 4: Wire the scroll-spy into `js/script.js`; remove the router

**Files:**
- Modify: `js/script.js`
- Delete: `js/chapter-router.js`, `tests/chapter-router.test.mjs`

**Interfaces:**
- Consumes: `NAV_ZONES`, `pickActiveNav` from `js/scroll-spy.js` (Task 1); `.chapter-nav-list a[href]` and section ids `sale`/`history`/`gallery`/`contact` from Tasks 2–3.

- [ ] **Step 1: Delete the obsolete router and its test**

```bash
rm js/chapter-router.js tests/chapter-router.test.mjs
```

- [ ] **Step 2: Confirm the site is currently broken this way (documents the expected failure before the fix)**

Run: `node --test`
Expected: FAIL — `js/script.js` still does `import { CHAPTER_IDS, resolveChapter } from './chapter-router.js'`, which no longer exists. (No test file directly imports `script.js` — this failure will actually surface as a browser console error, not a `node --test` failure, since none of the current tests execute `script.js`. Confirm that instead by running: `node --check js/script.js` — Expected: this succeeds because `--check` only parses syntax, not resolves imports. Skip straight to Step 3; there is no automated red/green step for this particular deletion since nothing in the test suite imports `script.js` directly — the "test" here is the manual browser check in Task 5.)

- [ ] **Step 3: Rewrite `js/script.js`**

Replace the entire file with:

```js
import { NAV_ZONES, pickActiveNav } from './scroll-spy.js';

const navLinks = Array.from(document.querySelectorAll('.chapter-nav-list a[href]'));
const zoneRatios = new Map(NAV_ZONES.map((zone) => [zone.navTarget, 0]));
const sectionToZone = new Map(NAV_ZONES.map((zone) => [zone.sectionId, zone.navTarget]));

const zoneObserver = new IntersectionObserver(
  (entries) => {
    for (const entry of entries) {
      const navTarget = sectionToZone.get(entry.target.id);
      if (!navTarget) continue;
      zoneRatios.set(navTarget, entry.intersectionRatio);
    }
    const visibleZones = [...zoneRatios.entries()]
      .filter(([, ratio]) => ratio > 0)
      .map(([navTarget, ratio]) => ({ navTarget, ratio }));
    const active = pickActiveNav(visibleZones);
    for (const link of navLinks) {
      link.setAttribute('aria-current', link.getAttribute('href') === `#${active}` ? 'true' : 'false');
    }
  },
  { rootMargin: '-76px 0px -55% 0px', threshold: [0, 0.25, 0.5, 0.75, 1] }
);

for (const zone of NAV_ZONES) {
  const section = document.getElementById(zone.sectionId);
  if (section) zoneObserver.observe(section);
}

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
```

- [ ] **Step 4: Run the full test suite to verify nothing regressed**

Run: `node --test`
Expected: all PASS (this task doesn't change any HTML the tests assert on — it only changes JS behavior, which `node --test` doesn't execute in a browser context).

- [ ] **Step 5: Commit**

```bash
git add js/script.js
git rm js/chapter-router.js tests/chapter-router.test.mjs
git commit -m "refactor: remove chapter router; wire scroll-spy IntersectionObserver into script.js"
```

---

### Task 5: Live browser verification

**Files:**
- None committed — this is a verification pass, not a code change. If it finds a bug, fix it in the relevant file from Tasks 2–4 and commit that fix separately with a `fix:` message before proceeding.

**Interfaces:**
- Consumes: the fully assembled site from Tasks 1–4.

- [ ] **Step 1: Serve the site locally**

```bash
python -m http.server 8080
```

(Leave running in the background for this task.)

- [ ] **Step 2: Write and run a Playwright verification script**

Create a throwaway script (e.g. in the OS temp/scratch directory, not committed) — adjust the `NODE_PATH` to wherever Playwright is available in your environment (this project has no `package.json`, so use `npx playwright install chromium` once if needed, or reuse an existing cached install):

```js
import { chromium } from 'playwright';

const browser = await chromium.launch();
const results = [];

for (const viewport of [{ width: 375, height: 812 }, { width: 1440, height: 900 }]) {
  const page = await browser.newPage({ viewport });
  const consoleErrors = [];
  page.on('console', (msg) => { if (msg.type() === 'error') consoleErrors.push(msg.text()); });
  page.on('pageerror', (err) => consoleErrors.push(err.message));

  await page.goto('http://localhost:8080/index.html');
  await page.waitForTimeout(300);

  // Honesty label visible on the hero photo
  const tagVisible = await page.locator('.hero-photo-tag').isVisible();
  results.push(['hero photo tag visible', viewport.width, tagVisible]);

  // Hero consult link and nav CTA both dial the real number
  const heroTel = await page.locator('.hero-consult-link').getAttribute('href');
  results.push(['hero consult tel:', viewport.width, heroTel]);

  // Click each of the 4 hero cards and confirm the URL hash updates and the
  // target section's heading becomes visible below the fixed nav
  for (const [card, expectedHash, headingId] of [
    ['개요', '#overview', 'overview-title'],
    ['입지', '#location', 'location-title'],
    ['타입&가격', '#types', 'types-title'],
    ['프리미엄', '#premium', 'premium-title'],
  ]) {
    await page.goto('http://localhost:8080/index.html');
    await page.click(`.hero-card:has-text("${card}")`);
    await page.waitForTimeout(500);
    const hash = await page.evaluate(() => window.location.hash);
    const headingBox = await page.locator(`#${headingId}`).boundingBox();
    results.push([`hero card ${card}`, viewport.width, hash === expectedHash, headingBox && headingBox.y > 50]);
  }

  // Click each of the 4 top-nav links and confirm scroll-spy highlights it
  for (const [label, navHash] of [
    ['애월6차분양', '#sale'],
    ['역사', '#history'],
    ['갤러리', '#gallery'],
    ['문의', '#contact'],
  ]) {
    await page.goto('http://localhost:8080/index.html');
    await page.click(`.chapter-nav-list a:has-text("${label}")`);
    await page.waitForTimeout(600);
    const ariaCurrent = await page.locator(`.chapter-nav-list a[href="${navHash}"]`).getAttribute('aria-current');
    results.push([`nav ${label} scroll-spy active`, viewport.width, ariaCurrent === 'true']);
  }

  results.push(['console errors', viewport.width, consoleErrors]);
  await page.close();
}

console.log(JSON.stringify(results, null, 2));
await browser.close();
```

Run it with Node (resolving Playwright the same way used elsewhere in this project — via `NODE_PATH` pointed at an npx-cached `playwright` install, or `npx --yes -p playwright node <script>.mjs`).

- [ ] **Step 3: Confirm the results**

Expected, for both viewport widths:
- `hero photo tag visible` → `true`
- `hero consult tel:` → `"tel:010-9347-1345"`
- Every `hero card ...` row → `hash` matches and `headingBox.y > 50` (heading is not hidden under the fixed nav)
- Every `nav ... scroll-spy active` row → `true`
- `console errors` → `[]` (empty array)

If any assertion fails, fix the specific cause in `index.html`/`css/styles.css`/`js/script.js`, re-run `node --test`, then re-run this script before moving on.

- [ ] **Step 4: Take reference screenshots**

```js
await page.goto('http://localhost:8080/index.html');
await page.screenshot({ path: 'hero-mobile.png' });
```

Repeat at the 1440-wide viewport. Visually confirm: hero photo isn't stretched/cropped oddly, the 4 cards read clearly with their real icon images, the stat bar doesn't overflow, and the mobile layout stacks photo-above-content without overlap.

- [ ] **Step 5: Stop the local server**

Kill the `python -m http.server` process started in Step 1.

No commit for this task unless a fix was needed (in which case follow the `fix:` commit made during Step 3).
