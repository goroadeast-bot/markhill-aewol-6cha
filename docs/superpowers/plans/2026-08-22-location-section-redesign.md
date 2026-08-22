# 입지 섹션 리디자인 구현 계획

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 입지 섹션을 3열 그리드+통짜 이미지에서, 번호 매긴 좌우 교차 행 3개(교육여건/생활여건/조망권, 각 행에 실제 현장 사진 2장 + 세부 항목 3줄 + 결론 강조 문장) + 구글 지도로 재구성하고, 개요 섹션과 같은 톤의 순차 반복 등장 애니메이션과 사진 호버 효과를 적용한다.

**Architecture:** `index.html`의 `#location` 섹션 마크업을 전면 교체한다(`.location-row` × 3 + `.location-map`). `css/styles.css`는 `.location-grid`/`.location-block`/`.location-photo`(이제 안 쓰임)를 제거하고 새 클래스 규칙을 추가한다. `js/script.js`는 개요 섹션에서 이미 쓴 것과 동일한 반복형 `IntersectionObserver` 패턴을 `.location-row`/`.location-map` 4개 요소에 적용한다(새 옵저버 인스턴스, 코드 재사용은 하되 옵저버 자체는 별개).

**Tech Stack:** Vanilla HTML/CSS/ES modules, no build step, no new dependencies. Static assertions via `node --test`. Live verification via Playwright.

## Global Constraints

- Reuse existing CSS custom properties only — 새 색상 토큰 없음. 형광 하이라이트는 개요 섹션과 동일한 `rgba(181, 102, 58, 0.16)` 리터럴 재사용.
- **공통 이징**: `cubic-bezier(0.23, 1, 0.32, 1)` — 개요 섹션과 통일.
- `prefers-reduced-motion: reduce`에서는 애니메이션 초기 상태(`opacity:0` 등)가 즉시 무효화되어야 한다 — 전용 오버라이드 필수, 그리고 **그 오버라이드는 반드시 기본 규칙보다 소스 순서상 뒤에 와야 한다**(이전 태스크에서 순서를 잘못 둬 발생한 버그가 있었음 — 같은 실수 반복 금지, `.reveal`/`.reveal.is-visible` 바로 뒤에 붙이는 기존 패턴을 그대로 따를 것).
- No new npm dependencies, no `package.json`, no build step. Tests run via `node --test`.
- 6개 신규 이미지(`images/location-edu-1.jpg` 등)는 이미 저장소에 커밋되어 있음 — 새로 만들 필요 없음, 마크업에서 참조만 하면 됨.
- `images/6cha-location.jpg`는 삭제하지 않는다(디스크에 보존, 이 섹션에서 참조만 안 함).

---

## File Structure

- **Modify** `index.html` — `#location` 섹션 전체 재작성.
- **Modify** `css/styles.css` — `.location-grid`/`.location-block`/`.location-photo` 제거, `.location-row`/`.location-text`/`.location-num`/`.location-list`/`.location-concl`/`.location-pics`/`.location-map*` 신규 규칙 추가.
- **Modify** `js/script.js` — 입지 섹션 반복 리빌 옵저버 추가.
- **Modify** `tests/content.test.mjs` — 새 마크업 정적 검증, `requiredImages`에 6개 파일 추가.

---

### Task 1: 마크업 + 기본(비애니메이션) 스타일

**Files:**
- Modify: `index.html`
- Modify: `css/styles.css`
- Modify: `tests/content.test.mjs`

**Interfaces:**
- Produces: `.location-row`(3개, 두 번째는 `.location-row-flip` 추가 클래스), `.location-map` — Task 2가 이 두 셀렉터에 반복-리빌 애니메이션을 건다.

- [ ] **Step 1: Write the failing tests**

`tests/content.test.mjs`에서 기존 테스트를 찾아 **교체**:

```js
test('location chapter states the real education/living/view facts', () => {
  assert.ok(html.includes('하귀초등학교'));
  assert.ok(html.includes('귀일중학교'));
  assert.ok(html.includes('images/6cha-location.jpg'));
});
```

교체 후:

```js
test('location chapter states the real education/living/view facts with full detail lists, a map, and 6 real photos', () => {
  const locationBlock = html.match(/<section class="chapter" id="location"[\s\S]*?<\/section>/)[0];
  assert.ok(locationBlock.includes('하귀초등학교'));
  assert.ok(locationBlock.includes('귀일중학교'));

  for (const img of [
    'location-edu-1.jpg', 'location-edu-2.jpg',
    'location-life-1.jpg', 'location-life-2.jpg',
    'location-view-1.jpg', 'location-view-2.jpg',
  ]) {
    assert.ok(locationBlock.includes(`images/${img}`), `expected images/${img} in the location section`);
  }

  for (const detail of [
    '하귀초등학교 후문 연계 학교상권 발전 가능',
    '일주서로',
    '시 외곽지역 주거지 조망권은 매우 중요한 요인',
  ]) {
    assert.ok(locationBlock.includes(detail), `expected detail text "${detail}"`);
  }

  for (const concl of [
    '유아부터 중등까지 교육여건 매우 우수',
    '자연환경과 생활편의 모두 가능한 입지',
    '바다와 자연 조망이 가능한 입지',
  ]) {
    assert.ok(locationBlock.includes(concl), `expected conclusion "${concl}"`);
  }

  assert.ok(locationBlock.includes('하귀2리 2089'), 'expected the real address in the map label');
  assert.ok(locationBlock.match(/<iframe[^>]*src="https:\/\/maps\.google\.com/), 'expected a Google Maps iframe');
});
```

Also, in the same file, add the 6 new images to `requiredImages`:

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
  'images/location-edu-1.jpg',
  'images/location-edu-2.jpg',
  'images/location-life-1.jpg',
  'images/location-life-2.jpg',
  'images/location-view-1.jpg',
  'images/location-view-2.jpg',
];
```

(정확한 기존 배열 내용은 파일을 직접 열어 확인하고, 위 6줄만 끝에 추가하는 형태로 반영할 것 — 다른 항목의 철자/순서를 임의로 바꾸지 말 것.)

- [ ] **Step 2: Run the tests to verify they fail**

Run: `node --test tests/content.test.mjs`
Expected: FAIL — 새 마크업이 아직 `index.html`에 없음.

- [ ] **Step 3: Replace the `#location` section in `index.html`**

`<section class="chapter" id="location" aria-labelledby="location-title">`부터 그 섹션의 닫는 `</section>`까지 전체를 다음으로 교체:

```html
    <section class="chapter" id="location" aria-labelledby="location-title">
      <div class="container">
        <p class="eyebrow">입지</p>
        <h2 id="location-title" class="section-title">하귀2리, 교육과 조망을 함께</h2>

        <div class="location-row" style="transition-delay:0ms">
          <div class="location-text">
            <p class="location-num mono">01 EDUCATION</p>
            <p class="feature-title">교육여건</p>
            <ul class="location-list">
              <li>하귀초등학교 · 귀일중학교 도보 통학 가능</li>
              <li>하귀초등학교 후문 연계 학교상권 발전 가능</li>
              <li>하귀초 병설유치원 인접</li>
            </ul>
            <p class="location-concl"><span>→</span> 유아부터 중등까지 교육여건 매우 우수</p>
          </div>
          <div class="location-pics">
            <img src="images/location-edu-1.jpg" alt="하귀초등학교" loading="lazy">
            <img src="images/location-edu-2.jpg" alt="귀일중학교" loading="lazy">
          </div>
        </div>

        <div class="location-row location-row-flip" style="transition-delay:110ms">
          <div class="location-text">
            <p class="location-num mono">02 LIVING</p>
            <p class="feature-title">생활여건</p>
            <ul class="location-list">
              <li>공항 및 신제주 인접한 자연친화적 주거환경 지역</li>
              <li>하귀 및 외도택지 생활권, 하나로마트 등 편의시설 인접</li>
              <li>일주서로·애조로 인접 교통편의 양호</li>
            </ul>
            <p class="location-concl"><span>→</span> 자연환경과 생활편의 모두 가능한 입지</p>
          </div>
          <div class="location-pics">
            <img src="images/location-life-1.jpg" alt="하나로마트" loading="lazy">
            <img src="images/location-life-2.jpg" alt="애월 해안" loading="lazy">
          </div>
        </div>

        <div class="location-row" style="transition-delay:220ms">
          <div class="location-text">
            <p class="location-num mono">03 VIEW</p>
            <p class="feature-title">조망권</p>
            <ul class="location-list">
              <li>하귀2리 주거지 중 가장 높은 위치로 조망권 우수</li>
              <li>바다 및 자연조망향 동배치로 조망권 확보</li>
              <li>시 외곽지역 주거지 조망권은 매우 중요한 요인</li>
            </ul>
            <p class="location-concl"><span>→</span> 바다와 자연 조망이 가능한 입지</p>
          </div>
          <div class="location-pics">
            <img src="images/location-view-1.jpg" alt="마크힐애월6차 단지 배치 도면" loading="lazy">
            <img src="images/location-view-2.jpg" alt="한라산 조망" loading="lazy">
          </div>
        </div>

        <div class="location-map" style="transition-delay:330ms">
          <p class="location-map-label mono">MAP · 제주시 애월읍 하귀2리 2089번지</p>
          <div class="location-map-embed">
            <iframe src="https://maps.google.com/maps?q=%EC%A0%9C%EC%A3%BC%ED%8A%B9%EB%B3%84%EC%9E%90%EC%B9%98%EB%8F%84%20%EC%A0%9C%EC%A3%BC%EC%8B%9C%20%EC%95%A0%EC%9B%94%EC%9D%8D%20%ED%95%98%EA%B7%802%EB%A6%AC%202089&output=embed" loading="lazy" referrerpolicy="no-referrer-when-downgrade" title="마크힐애월6차 위치 지도"></iframe>
          </div>
        </div>
      </div>
    </section>
```

- [ ] **Step 4: Update `css/styles.css`**

Remove these three now-unused rules:

```css
.location-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  gap: 20px;
  margin: 32px 0;
}
.location-block { padding: 20px 0; border-top: 2px solid var(--accent); }
.location-photo { width: 100%; border-radius: 12px; border: 1px solid var(--border); margin-top: 16px; aspect-ratio: 1376 / 768; object-fit: cover; }
```

Add in their place:

```css
.location-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 32px;
  align-items: center;
  padding: 30px 0;
  border-top: 1px solid var(--border);
}
.location-row:first-of-type { border-top: none; padding-top: 6px; }
.location-row-flip .location-text { order: 2; }
.location-num {
  font-size: 13px; font-weight: 600;
  color: var(--accent); letter-spacing: 0.1em;
  margin-bottom: 10px;
  display: flex; align-items: center; gap: 10px;
}
.location-num::after { content: ''; flex: 1; height: 1px; background: var(--border); }
.location-text .feature-title { font-size: 22px; margin-bottom: 14px; }
.location-list { list-style: none; padding: 0; margin: 0 0 16px; }
.location-list li {
  position: relative; padding-left: 14px; margin-bottom: 7px;
  font-size: 13.5px; line-height: 1.65; color: var(--ink-muted);
}
.location-list li::before {
  content: ''; position: absolute; left: 0; top: 9px;
  width: 5px; height: 1px; background: var(--accent);
}
.location-concl {
  display: inline-flex; align-items: center; gap: 8px;
  font-weight: 700; font-size: 14.5px; color: var(--ink);
  background: linear-gradient(transparent 62%, rgba(181, 102, 58, 0.16) 62%);
  padding: 0 2px;
}
.location-concl span { color: var(--accent); }
.location-pics { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; }
.location-pics img {
  width: 100%; height: 150px; object-fit: cover; display: block;
  border-radius: 10px; border: 1px solid var(--border);
}

.location-map { margin-top: 34px; }
.location-map-label { font-size: 11.5px; letter-spacing: 0.08em; color: var(--ink-subtle); margin-bottom: 10px; }
.location-map-embed { border-radius: 12px; overflow: hidden; border: 1px solid var(--border); height: 300px; }
.location-map-embed iframe { width: 100%; height: 100%; border: 0; display: block; }
```

- [ ] **Step 5: Run the tests to verify they pass**

Run: `node --test`
Expected: all PASS (including `tests/reveal.test.mjs` — removing `reveal` from the three old `.location-block` divs drops the count by 3, still ≥ 12).

- [ ] **Step 6: Commit**

```bash
git add index.html css/styles.css tests/content.test.mjs
git commit -m "feat: rebuild location section as alternating rows with real photos and a map"
```

---

### Task 2: 반복 등장 애니메이션

**Files:**
- Modify: `css/styles.css`
- Modify: `js/script.js`

**Interfaces:**
- Consumes: `.location-row`(3개), `.location-map`(Task 1 산출물).
- Produces: `.is-visible` 클래스 토글(각 요소 독립적으로).

- [ ] **Step 1: Add the animated CSS states**

`css/styles.css`의 `.location-map-embed iframe { width: 100%; height: 100%; border: 0; display: block; }` 바로 다음에 추가:

```css
.location-row, .location-map {
  opacity: 0;
  transform: translateY(16px);
  filter: blur(5px);
}
.location-row.is-visible, .location-map.is-visible {
  opacity: 1; transform: none; filter: blur(0);
  transition: opacity 0.7s cubic-bezier(0.23, 1, 0.32, 1),
              transform 0.7s cubic-bezier(0.23, 1, 0.32, 1),
              filter 0.7s cubic-bezier(0.23, 1, 0.32, 1);
}
@media (prefers-reduced-motion: reduce) {
  .location-row, .location-map { opacity: 1; transform: none; filter: none; }
}
```

(reduced-motion 오버라이드를 base 규칙 바로 다음, 같은 자리에 둔다 — 소스 순서 버그를 피하기 위한 필수 조치.)

- [ ] **Step 2: Wire the repeat-observer**

`js/script.js`에서 개요 섹션 옵저버 블록(`// Overview intro — repeats...`) 다음에 추가:

```js
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
```

- [ ] **Step 3: Run the full test suite**

Run: `node --test`
Expected: all PASS.

- [ ] **Step 4: Commit**

```bash
git add css/styles.css js/script.js
git commit -m "feat: repeat-reveal location rows and map on scroll in/out"
```

---

### Task 3: 사진 호버 효과

**Files:**
- Modify: `css/styles.css`

**Interfaces:**
- Consumes: `.location-row`, `.location-pics img`(Task 1 산출물).

- [ ] **Step 1: Add the hover transition**

`css/styles.css`의 `.location-pics img { ... }` 규칙을 다음으로 교체:

```css
.location-pics img {
  width: 100%; height: 150px; object-fit: cover; display: block;
  border-radius: 10px; border: 1px solid var(--border);
  transition: transform 0.5s cubic-bezier(0.23, 1, 0.32, 1), box-shadow 0.35s ease;
}
```

`.location-map-embed iframe { ... }` 앞이 아니라, 같은 `.location-pics` 규칙 블록 바로 다음에 추가:

```css
.location-row:hover .location-pics img {
  transform: translateY(-3px);
  box-shadow: 0 10px 26px rgba(26, 24, 21, 0.13);
}
.location-row:hover .location-pics img:last-child { transition-delay: 0.06s; }
@media (prefers-reduced-motion: reduce) {
  .location-pics img { transition: none; }
}
```

- [ ] **Step 2: Run the full test suite**

Run: `node --test`
Expected: all PASS(호버는 CSS 전용이라 정적 테스트에 영향 없음).

- [ ] **Step 3: Commit**

```bash
git add css/styles.css
git commit -m "feat: add photo lift-on-hover to location rows"
```

---

### Task 4: 라이브 브라우저 검증

**Files:**
- None committed unless a fix is needed (그 경우 `fix:` 커밋으로 처리).

**Interfaces:**
- Consumes: Task 1~3에서 완성된 입지 섹션.

- [ ] **Step 1: Serve the site locally**

```bash
python -m http.server 8099
```

- [ ] **Step 2: Write and run a Playwright verification script**

```js
import { chromium } from 'playwright';

const browser = await chromium.launch();
const results = [];

{
  const page = await browser.newPage({ viewport: { width: 1200, height: 800 } });
  const consoleErrors = [];
  page.on('console', (msg) => { if (msg.type() === 'error') consoleErrors.push(msg.text()); });
  page.on('pageerror', (err) => consoleErrors.push(err.message));

  await page.goto('http://localhost:8099/index.html');

  const before = await page.evaluate(() => {
    const row = document.querySelector('.location-row');
    const map = document.querySelector('.location-map');
    return { rowOpacity: getComputedStyle(row).opacity, mapOpacity: getComputedStyle(map).opacity };
  });
  results.push(['before scroll: first row hidden', Number(before.rowOpacity) < 0.5]);
  results.push(['before scroll: map hidden', Number(before.mapOpacity) < 0.5]);

  await page.evaluate(() => document.getElementById('location-title').scrollIntoView({ behavior: 'instant', block: 'center' }));
  await page.waitForTimeout(900);
  const mid = await page.evaluate(() => {
    const row = document.querySelector('.location-row');
    return { rowOpacity: getComputedStyle(row).opacity };
  });
  results.push(['at location: first row visible', Number(mid.rowOpacity) > 0.95]);

  await page.evaluate(() => document.querySelector('.location-map').scrollIntoView({ behavior: 'instant', block: 'center' }));
  await page.waitForTimeout(900);
  const atMap = await page.evaluate(() => {
    const map = document.querySelector('.location-map');
    const iframe = document.querySelector('.location-map-embed iframe');
    return { mapOpacity: getComputedStyle(map).opacity, iframeSrc: iframe.getAttribute('src') };
  });
  results.push(['at map: visible', Number(atMap.mapOpacity) > 0.95]);
  results.push(['map iframe src', atMap.iframeSrc]);

  await page.evaluate(() => window.scrollTo(0, 0));
  await page.waitForTimeout(900);
  const afterUp = await page.evaluate(() => {
    const row = document.querySelector('.location-row');
    return { rowOpacity: getComputedStyle(row).opacity };
  });
  results.push(['scrolled back to top: first row hidden again (repeat)', Number(afterUp.rowOpacity) < 0.5]);

  // hover check
  await page.evaluate(() => document.querySelector('.location-row').scrollIntoView({ behavior: 'instant', block: 'center' }));
  await page.waitForTimeout(900);
  const firstImg = page.locator('.location-row .location-pics img').first();
  const beforeHover = await firstImg.evaluate((el) => getComputedStyle(el).transform);
  await page.hover('.location-row');
  await page.waitForTimeout(300);
  const duringHover = await firstImg.evaluate((el) => getComputedStyle(el).transform);
  results.push(['hover lifts the photo', beforeHover !== duringHover]);

  results.push(['console errors', consoleErrors]);
  await page.close();
}

{
  const page = await browser.newPage({ viewport: { width: 1200, height: 800 } });
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('http://localhost:8099/index.html');
  await page.waitForTimeout(200);
  const state = await page.evaluate(() => {
    const row = document.querySelector('.location-row');
    const map = document.querySelector('.location-map');
    return { rowOpacity: getComputedStyle(row).opacity, mapOpacity: getComputedStyle(map).opacity };
  });
  results.push(['reduced-motion: row visible immediately', Number(state.rowOpacity) > 0.95]);
  results.push(['reduced-motion: map visible immediately', Number(state.mapOpacity) > 0.95]);
  await page.close();
}

console.log(JSON.stringify(results, null, 2));
await browser.close();
```

Run it with Node, resolving Playwright via a cached `npx`/`playwright` install(이 프로젝트에서 이미 쓰던 방식).

- [ ] **Step 3: Confirm the results**

Expected, all `true`(마지막 `console errors`는 `[]`, `map iframe src`는 `https://maps.google.com/maps?q=...하귀2리 2089...`를 포함하는 실제 URL):
- `before scroll: first row hidden` → `true`
- `before scroll: map hidden` → `true`
- `at location: first row visible` → `true`
- `at map: visible` → `true`
- `scrolled back to top: first row hidden again (repeat)` → `true`
- `hover lifts the photo` → `true`
- `reduced-motion: row visible immediately` → `true`
- `reduced-motion: map visible immediately` → `true`

만약 실패가 있으면 원인을 `index.html`/`css/styles.css`/`js/script.js`에서 고치고(특히 reduced-motion 오버라이드의 소스 순서를 다시 확인), `node --test`로 재확인한 뒤 이 스크립트를 다시 실행.

- [ ] **Step 4: Take a reference screenshot**

```js
await page.evaluate(() => document.getElementById('location-title').scrollIntoView({ behavior: 'instant', block: 'start' }));
await page.waitForTimeout(1000);
await page.screenshot({ path: 'location-final.png' });
```

읽어서 육안으로 확인: 3개 행이 좌우로 잘 교차되는지(2번째 행만 반전), 사진이 잘리거나 비율이 깨지지 않는지, 지도가 정상적으로 로드되는지.

- [ ] **Step 5: Stop the local server**

Kill the `python -m http.server` process started in Step 1.

No commit for this task unless a fix was needed(그 경우 `fix:` 커밋으로 처리하고 `node --test` 재확인).

---

## Self-Review Notes

- Spec coverage: 변경 1(사진 분리)·변경 2(좌우교차+넘버링)는 Task 1, 변경 3(지도)도 Task 1에 포함, 변경 4(애니메이션: 등장은 Task 2, 호버는 Task 3)에 매핑.
- Placeholder scan: 없음.
- Type/name consistency: `.location-row`/`.location-row-flip`/`.location-text`/`.location-num`/`.location-list`/`.location-concl`/`.location-pics`/`.location-map`/`.location-map-label`/`.location-map-embed` 네이밍이 Task 1~4 전체에서 일치. `.is-visible` 토글은 개요 섹션과 동일한 이름 재사용(다른 옵저버 인스턴스지만 클래스명 통일).
- 알려진 위험: reduced-motion 오버라이드의 CSS 소스 순서 — 개요 섹션 작업에서 실제로 겪은 버그이므로, Task 2 Step 1에서 명시적으로 "base 규칙 바로 다음"이라고 못박아 재발 방지.
