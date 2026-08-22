# 개요 섹션 스크롤 애니메이션 구현 계획

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 개요 섹션의 이유브로우+타이틀+표를 그룹으로 묶어 스크롤마다 반복 등장시키고, 배치도는 0.78배에서 시작해 화면 정중앙에서 100%가 되도록 스크롤에 연동시키며, 캡션은 배치도가 100%에 도달했을 때만 별도로 나타나게 하고, 표 안 셀링포인트 3개에 형광 하이라이트를 넣는다.

**Architecture:** `index.html`에 `.overview-intro`(텍스트 그룹 래퍼)와 `.siteplan-scaler`(이미지 스케일 래퍼)를 추가하고, 강조 대상 문구를 `.spec-highlight`/`.spec-strong` span으로 감싼다. `css/styles.css`는 각 클래스의 애니메이션 이전/이후 상태를 정의한다. `js/script.js`는 두 개의 독립된 메커니즘을 추가한다: (1) `.overview-intro`용 `IntersectionObserver` — 진입/이탈마다 클래스를 토글하고 `unobserve`하지 않아 반복되게 함, (2) 배치도+캡션용 `scroll` 리스너 — 매 스크롤마다 진행도를 계산해 `transform: scale()`과 캡션 클래스를 갱신. 기존 사이트 전역 `.reveal`(일회성) 시스템은 건드리지 않고, `.siteplan-block`만 그 클래스를 뗀다.

**Tech Stack:** Vanilla HTML/CSS/ES modules, no build step, no new dependencies. Static assertions via `node --test`. Live verification via Playwright.

## Global Constraints

- Reuse existing CSS custom properties only — 새 색상 토큰 추가 없음. 형광 하이라이트는 `rgba(181, 102, 58, 0.16)`(= `--accent` #B5663A의 저투명도 버전)를 리터럴로 사용(기존 `.hero-photo-tag`가 `rgba(26,24,21,0.72)`처럼 리터럴 rgba를 이미 쓰는 것과 같은 패턴).
- **공통 이징**: `cubic-bezier(0.23, 1, 0.32, 1)`.
- `prefers-reduced-motion: reduce`에서는 전역 규칙(`css/styles.css:93-100`)이 `transition-duration`/`animation-duration`을 0.01ms로 강제하지만, 이 기능이 쓰는 초기 상태(`opacity:0`, `scale(0.78)` 등)는 그것만으로 안 가려지므로 **전용 오버라이드가 반드시 필요**하다.
- No new npm dependencies, no `package.json`, no build step. Tests run via `node --test`.
- 강조 대상은 정확히 3개(`84타입 20세대`, `세대당 2.1대`, `2027년 7월 입주`)만 — 그 외 고유명사는 검정 볼드만, 형광 배경 없음.

---

## File Structure

- **Modify** `index.html` — `#overview` 섹션에 `.overview-intro` 래퍼, `.siteplan-scaler` 래퍼, `.spec-highlight`/`.spec-strong` span 추가, `.siteplan-block`에서 `reveal` 클래스 제거.
- **Modify** `css/styles.css` — `.overview-intro`/`.spec-highlight`/`.spec-strong` 신규 규칙, `.siteplan-scaler`/`.siteplan-caption` 애니메이션 상태, reduced-motion 오버라이드.
- **Modify** `js/script.js` — 텍스트 그룹 반복 옵저버 + 배치도/캡션 스크롤 연동 로직.
- **Modify** `tests/content.test.mjs` — 새 마크업 정적 검증.

---

### Task 1: 마크업 + 기본(비애니메이션) 스타일

**Files:**
- Modify: `index.html`
- Modify: `css/styles.css`
- Modify: `tests/content.test.mjs`

**Interfaces:**
- Produces: `.overview-intro`(텍스트 그룹 래퍼), `.siteplan-scaler`(이미지 스케일 래퍼), `.spec-highlight`(형광 하이라이트 span, 3개), `.spec-strong`(검정 볼드 span) — Task 2·3이 이 클래스들의 애니메이션 상태를 정의.
- 이 태스크가 끝난 시점에는 애니메이션 CSS가 아직 없으므로 텍스트/배치도/캡션 모두 **항상 보이는 정적 상태**로 렌더링된다 — Task 2·3 전까지는 정상.

- [ ] **Step 1: Write the failing tests**

`tests/content.test.mjs`에 추가(파일 끝):

```js
test('overview intro group wraps eyebrow, title, and spec table for the repeat-reveal animation', () => {
  const overviewBlock = html.match(/<section class="chapter" id="overview"[\s\S]*?<\/section>/)[0];
  const introMatch = overviewBlock.match(/<div class="overview-intro">([\s\S]*?)<\/div>\s*<div class="siteplan-block/);
  assert.ok(introMatch, 'expected a <div class="overview-intro"> wrapping the eyebrow/title/table');
  const introInner = introMatch[1];
  assert.ok(introInner.includes('class="eyebrow"'));
  assert.ok(introInner.includes('class="section-title"'));
  assert.ok(introInner.includes('class="spec-table"'));
});

test('the three overview selling points get highlight styling, other proper nouns get plain bold', () => {
  const overviewBlock = html.match(/<section class="chapter" id="overview"[\s\S]*?<\/section>/)[0];
  for (const phrase of ['84타입 20세대', '세대당 2.1대', '2027년 7월 입주']) {
    assert.ok(overviewBlock.includes(`<span class="spec-highlight">${phrase}</span>`), `expected "${phrase}" wrapped in spec-highlight`);
  }
  for (const phrase of ['남건종합건설㈜', '하귀2리 2089번지', '마크힐센터']) {
    assert.ok(overviewBlock.includes(`<span class="spec-strong">${phrase}</span>`), `expected "${phrase}" wrapped in spec-strong`);
  }
});

test('siteplan image sits inside a scaler wrapper and no longer uses the one-shot reveal class', () => {
  const overviewBlock = html.match(/<section class="chapter" id="overview"[\s\S]*?<\/section>/)[0];
  assert.ok(overviewBlock.includes('<div class="siteplan-block">'), 'siteplan-block must no longer carry the reveal class');
  assert.ok(!overviewBlock.includes('siteplan-block reveal'));
  assert.ok(overviewBlock.match(/<div class="siteplan-scaler">\s*<img src="images\/6cha-siteplan\.jpg"/), 'expected the siteplan img wrapped in a siteplan-scaler div');
});
```

- [ ] **Step 2: Run the tests to verify they fail**

Run: `node --test tests/content.test.mjs`
Expected: FAIL — `.overview-intro`/`.spec-highlight`/`.spec-strong`/`.siteplan-scaler`는 아직 `index.html`에 없음.

- [ ] **Step 3: Update `index.html`**

`#overview` 섹션 안의 개요 블록(`<p class="eyebrow">애월6차 개요</p>`부터 `</div>\n      </div>\n    </section>`까지, 즉 `.container` 안쪽 전체)을 다음으로 교체:

```html
        <div class="overview-intro">
          <p class="eyebrow">애월6차 개요</p>
          <h2 id="overview-title" class="section-title">남건휴먼스 마크힐애월(6차)</h2>

          <table class="spec-table">
            <tbody>
              <tr><th>단지명</th><td><span class="spec-strong">남건휴먼스 마크힐애월(6차)</span></td></tr>
              <tr><th>사업주체</th><td>사업시행자 휴먼스이엔씨㈜ / 시공자 <span class="spec-strong">남건종합건설㈜</span></td></tr>
              <tr><th>유형 및 규모</th><td>도시형생활주택 중 단지형 연립주택(<span class="spec-highlight">84타입 20세대</span>) 및 근린생활시설(4실)</td></tr>
              <tr><th>위치</th><td>제주시 애월읍 <span class="spec-strong">하귀2리 2089번지</span> (하귀성당 사거리 북서측 코너부지)</td></tr>
              <tr><th>주차대수</th><td>실질 주차계획 43대 (<span class="spec-highlight">세대당 2.1대</span>)</td></tr>
              <tr><th>주민공동시설</th><td>근생104호 <span class="spec-strong">마크힐센터</span>(남건 직접 소유·운영 피트니스, 3년 확정운영) · 옥탑(요가&amp;스트레칭존, 펫플레이그라운드, 선셋라운지)</td></tr>
              <tr><th>일정</th><td class="mono">2026년 10월 샘플하우스 오픈 · <span class="spec-highlight">2027년 7월 입주</span> 예정</td></tr>
            </tbody>
          </table>
        </div>

        <div class="siteplan-block">
          <div class="siteplan-scaler">
            <img src="images/6cha-siteplan.jpg" alt="마크힐애월6차 배치도 항공사진" loading="lazy">
          </div>
          <p class="siteplan-caption">101동·102동 배치도 — 하귀성당 사거리 북서측 코너부지</p>
        </div>
```

(`id="overview-title"`는 `aria-labelledby="overview-title"`가 가리키는 대상이라 그대로 유지 — h2에 옮겨 붙였는지 확인.)

- [ ] **Step 4: Add base (non-animated) CSS**

`css/styles.css`의 `.spec-table td { font-size: 15px; }` 바로 다음에 추가:

```css
.spec-highlight {
  font-weight: 700;
  color: var(--accent);
  background: linear-gradient(transparent 62%, rgba(181, 102, 58, 0.16) 62%);
  padding: 0 1px;
}
.spec-strong { font-weight: 700; color: var(--ink); }
```

`.siteplan-caption { margin-top: 12px; font-size: 13px; color: var(--ink-subtle); }` 바로 다음에 추가:

```css
.siteplan-scaler { transform-origin: center center; will-change: transform; }
```

- [ ] **Step 5: Run the tests to verify they pass**

Run: `node --test`
Expected: all PASS (including `tests/reveal.test.mjs` — reveal count drops from 28 to 27, still ≥ 12).

- [ ] **Step 6: Commit**

```bash
git add index.html css/styles.css tests/content.test.mjs
git commit -m "feat: add overview intro/siteplan wrappers and selling-point highlights"
```

---

### Task 2: 텍스트 그룹 반복 리빌

**Files:**
- Modify: `css/styles.css`
- Modify: `js/script.js`

**Interfaces:**
- Consumes: `.overview-intro`(Task 1 산출물, 직계 자식으로 `.eyebrow`/`.section-title`/`.spec-table`).
- Produces: `.overview-intro.is-visible` 클래스 토글.

- [ ] **Step 1: Add the animated CSS states**

`css/styles.css`의 `.siteplan-scaler { transform-origin: center center; will-change: transform; }` 바로 다음에 추가:

```css
.overview-intro > .eyebrow,
.overview-intro > .section-title,
.overview-intro > .spec-table {
  opacity: 0;
  transform: translateY(14px);
  filter: blur(5px);
}
.overview-intro.is-visible > .eyebrow,
.overview-intro.is-visible > .section-title,
.overview-intro.is-visible > .spec-table {
  opacity: 1; transform: none; filter: blur(0);
  transition: opacity 0.7s cubic-bezier(0.23, 1, 0.32, 1),
              transform 0.7s cubic-bezier(0.23, 1, 0.32, 1),
              filter 0.7s cubic-bezier(0.23, 1, 0.32, 1);
}
```

- [ ] **Step 2: Add the reduced-motion override**

기존 `@media (prefers-reduced-motion: reduce) { .hero-card { transition: none; } ... }` 블록에 추가:

```css
  .overview-intro > .eyebrow,
  .overview-intro > .section-title,
  .overview-intro > .spec-table {
    opacity: 1; transform: none; filter: none;
  }
```

- [ ] **Step 3: Wire the repeat-observer**

`js/script.js`에서 `// Hero copy + card entrance animation` 블록 전체 다음(그 블록의 닫는 `}`와 빈 줄 다음)에 추가:

```js
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
```

- [ ] **Step 4: Run the full test suite**

Run: `node --test`
Expected: all PASS.

- [ ] **Step 5: Commit**

```bash
git add css/styles.css js/script.js
git commit -m "feat: repeat-reveal the overview intro group on scroll in/out"
```

---

### Task 3: 배치도 스크롤 연동 스케일 + 캡션 트리거

**Files:**
- Modify: `css/styles.css`
- Modify: `js/script.js`

**Interfaces:**
- Consumes: `.siteplan-scaler`(Task 1 산출물), `.siteplan-caption`(기존 마크업).
- Produces: `.siteplan-caption.is-revealed` 클래스 토글.

- [ ] **Step 1: Add the caption's animated CSS states**

`css/styles.css`에서 `.siteplan-caption { margin-top: 12px; font-size: 13px; color: var(--ink-subtle); }`를 다음으로 교체:

```css
.siteplan-caption {
  margin-top: 12px; font-size: 13px; color: var(--ink-subtle);
  opacity: 0; transform: translateY(8px); filter: blur(4px);
}
.siteplan-caption.is-revealed {
  opacity: 1; transform: none; filter: blur(0);
  transition: opacity 0.55s cubic-bezier(0.23, 1, 0.32, 1),
              transform 0.55s cubic-bezier(0.23, 1, 0.32, 1),
              filter 0.55s cubic-bezier(0.23, 1, 0.32, 1);
}
```

- [ ] **Step 2: Add the reduced-motion override**

같은 `@media (prefers-reduced-motion: reduce)` 블록에 추가:

```css
  .siteplan-scaler { transform: none !important; }
  .siteplan-caption { opacity: 1; transform: none; filter: none; }
```

(`.siteplan-scaler`는 JS가 매 스크롤마다 인라인 `style.transform`을 계속 덮어쓰므로, reduced-motion에서 이를 확실히 무력화하려면 `!important`가 필요하다 — 인라인 스타일보다 우선순위가 높아야 함.)

- [ ] **Step 3: Wire the scroll-linked scale + caption logic**

`js/script.js`에서 Task 2의 `// Overview intro ...` 블록 다음에 추가:

```js
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
```

(`reduceMotion`은 Task 2 이전 커밋에서 이미 선언된 전역 상수 — `js/script.js`의 히어로 애니메이션 블록에서 `window.matchMedia('(prefers-reduced-motion: reduce)').matches`로 정의됨. 재사용한다.)

- [ ] **Step 4: Run the full test suite**

Run: `node --test`
Expected: all PASS (this task only changes JS/CSS animation behavior, which `node --test` doesn't execute in a browser context).

- [ ] **Step 5: Commit**

```bash
git add css/styles.css js/script.js
git commit -m "feat: scroll-link the siteplan scale (0.78 to 100%) and gate the caption on full scale"
```

---

### Task 4: 라이브 브라우저 검증

**Files:**
- None committed unless a fix is needed (그 경우 `fix:` 커밋으로 처리).

**Interfaces:**
- Consumes: Task 1~3에서 완성된 개요 섹션.

- [ ] **Step 1: Serve the site locally**

```bash
python -m http.server 8099
```

- [ ] **Step 2: Write and run a Playwright verification script**

```js
import { chromium } from 'playwright';

const browser = await chromium.launch();
const results = [];

// 1) 기본 시퀀스: 텍스트 그룹 반복 + 배치도 스케일 + 캡션 트리거
{
  const page = await browser.newPage({ viewport: { width: 1200, height: 800 } });
  const consoleErrors = [];
  page.on('console', (msg) => { if (msg.type() === 'error') consoleErrors.push(msg.text()); });
  page.on('pageerror', (err) => consoleErrors.push(err.message));

  await page.goto('http://localhost:8099/index.html');

  // 아직 개요 섹션 밖: 텍스트 숨김, 배치도 0.78, 캡션 숨김
  const before = await page.evaluate(() => {
    const eyebrow = document.querySelector('.overview-intro > .eyebrow');
    const scaler = document.querySelector('.siteplan-scaler');
    const cap = document.querySelector('.siteplan-caption');
    return {
      eyebrowOpacity: getComputedStyle(eyebrow).opacity,
      scalerTransform: getComputedStyle(scaler).transform,
      capOpacity: getComputedStyle(cap).opacity,
    };
  });
  results.push(['before scroll: eyebrow hidden', Number(before.eyebrowOpacity) < 0.5]);
  results.push(['before scroll: caption hidden', Number(before.capOpacity) < 0.5]);

  // 개요까지 스크롤 (텍스트 그룹은 보이되, 배치도는 아직 100%가 아님)
  await page.evaluate(() => document.getElementById('overview-title').scrollIntoView({ behavior: 'instant', block: 'center' }));
  await page.waitForTimeout(900);
  const mid = await page.evaluate(() => {
    const eyebrow = document.querySelector('.overview-intro > .eyebrow');
    return { eyebrowOpacity: getComputedStyle(eyebrow).opacity };
  });
  results.push(['at overview: eyebrow visible', Number(mid.eyebrowOpacity) > 0.95]);

  // 배치도까지 스크롤해서 중앙에 오도록
  await page.evaluate(() => {
    const scaler = document.querySelector('.siteplan-scaler');
    scaler.scrollIntoView({ behavior: 'instant', block: 'center' });
  });
  await page.waitForTimeout(900);
  const atPlan = await page.evaluate(() => {
    const scaler = document.querySelector('.siteplan-scaler');
    const cap = document.querySelector('.siteplan-caption');
    return {
      scalerTransform: getComputedStyle(scaler).transform,
      capOpacity: getComputedStyle(cap).opacity,
    };
  });
  results.push(['siteplan centered: caption visible', Number(atPlan.capOpacity) > 0.95]);
  results.push(['siteplan centered: transform is near-1 scale', atPlan.scalerTransform]);

  // 다시 위로 스크롤: 텍스트 그룹이 다시 숨겨져야 함(반복 확인)
  await page.evaluate(() => window.scrollTo(0, 0));
  await page.waitForTimeout(900);
  const afterScrollUp = await page.evaluate(() => {
    const eyebrow = document.querySelector('.overview-intro > .eyebrow');
    return { eyebrowOpacity: getComputedStyle(eyebrow).opacity };
  });
  results.push(['scrolled back to top: eyebrow hidden again (repeat, not one-shot)', Number(afterScrollUp.eyebrowOpacity) < 0.5]);

  results.push(['console errors', consoleErrors]);
  await page.close();
}

// 2) prefers-reduced-motion
{
  const page = await browser.newPage({ viewport: { width: 1200, height: 800 } });
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('http://localhost:8099/index.html');
  await page.waitForTimeout(200);
  const state = await page.evaluate(() => {
    const eyebrow = document.querySelector('.overview-intro > .eyebrow');
    const scaler = document.querySelector('.siteplan-scaler');
    const cap = document.querySelector('.siteplan-caption');
    return {
      eyebrowOpacity: getComputedStyle(eyebrow).opacity,
      scalerTransform: getComputedStyle(scaler).transform,
      capOpacity: getComputedStyle(cap).opacity,
    };
  });
  results.push(['reduced-motion: eyebrow visible immediately', Number(state.eyebrowOpacity) > 0.95]);
  results.push(['reduced-motion: caption visible immediately', Number(state.capOpacity) > 0.95]);
  results.push(['reduced-motion: siteplan not scaled down', state.scalerTransform === 'none' || state.scalerTransform === 'matrix(1, 0, 0, 1, 0, 0)']);
  await page.close();
}

console.log(JSON.stringify(results, null, 2));
await browser.close();
```

Run it with Node, resolving Playwright via a cached `npx`/`playwright` install(이 프로젝트에서 이미 쓰던 방식).

- [ ] **Step 3: Confirm the results**

Expected, all `true` (마지막 `console errors`는 `[]`):
- `before scroll: eyebrow hidden` → `true`
- `before scroll: caption hidden` → `true`
- `at overview: eyebrow visible` → `true`
- `siteplan centered: caption visible` → `true`
- `siteplan centered: transform is near-1 scale` → `matrix(1, 0, 0, 1, 0, 0)`에 가까운 값(로그로 직접 확인)
- `scrolled back to top: eyebrow hidden again (repeat, not one-shot)` → `true`
- `reduced-motion: eyebrow visible immediately` → `true`
- `reduced-motion: caption visible immediately` → `true`
- `reduced-motion: siteplan not scaled down` → `true`

`scrollIntoView({ block: 'center' })`가 정확히 뷰포트 중앙에 맞추므로 `siteplan centered` 값이 1.00에 아주 가깝게 나와야 한다(완전히 1.000이 아니어도 0.99 이상이면 정상 — `scrollIntoView`의 픽셀 반올림 오차).

만약 어떤 결과든 실패하면 원인을 `index.html`/`css/styles.css`/`js/script.js`에서 고치고, `node --test`로 재확인한 뒤 이 스크립트를 다시 실행.

- [ ] **Step 4: Take a reference screenshot**

```js
await page.evaluate(() => document.querySelector('.siteplan-scaler').scrollIntoView({ behavior: 'instant', block: 'center' }));
await page.waitForTimeout(900);
await page.screenshot({ path: 'overview-final.png' });
```

읽어서 육안으로 확인: 배치도가 정확히 100% 크기로 컨테이너 폭에 맞는지(잘리거나 넘치지 않는지), 캡션이 자연스럽게 보이는지, 강조 3곳(84타입 20세대/세대당 2.1대/2027년 7월 입주)에 형광 하이라이트가 제대로 보이는지.

- [ ] **Step 5: Stop the local server**

Kill the `python -m http.server` process started in Step 1.

No commit for this task unless a fix was needed(그 경우 `fix:` 커밋으로 처리하고 `node --test` 재확인).

---

## Self-Review Notes

- Spec coverage: 변경 1(텍스트 그룹 반복)은 Task 2, 변경 2(배치도 스케일)·변경 3(캡션 트리거)은 Task 3, 변경 4(강조)는 Task 1에 매핑. 반응형/접근성은 Task 2·3의 reduced-motion 스텝에 분산 반영.
- Placeholder scan: 없음.
- Type/name consistency: `.overview-intro`/`.is-visible`(텍스트), `.siteplan-scaler`/`.siteplan-caption`/`.is-revealed`(배치도·캡션), `.spec-highlight`/`.spec-strong`(강조) 네이밍이 Task 1~4 전체에서 일치. `reduceMotion` 전역 상수는 Task 2 이전(히어로 애니메이션 작업)에서 이미 선언된 것을 Task 3에서 재사용 — 새로 선언하지 않음.
