# 히어로 카피 + 카드 설명 + 애니메이션 구현 계획

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 히어로 워드마크 옆에 브랜드 스토리 카피를 추가하고, 4개 카드에 한 줄 설명 + 화살표를 추가하며, 카피/카드 설명에 로드 시 등장 애니메이션과 카드 호버 애니메이션을 적용한다.

**Architecture:** `index.html`에 정적 마크업(카피 4줄, 카드 설명 4개)을 추가하고, `css/styles.css`에 애니메이션 이전(before) 상태와 `.is-visible`/`.is-revealed` 클래스가 붙었을 때의 이후(after) 상태를 정의한다. `js/script.js`는 카드 설명 문구를 어절 단위 `<span>`으로 분해하고, 카피가 끝나는 시점(1240ms)부터 카드 4개를 220ms 간격으로 순차 공개하는 타이머만 담당한다. 새 라이브러리 없음 — 순수 CSS transition/animation + 최소한의 vanilla JS.

**Tech Stack:** Vanilla HTML/CSS/ES modules, no build step, no new dependencies. Static assertions via `node --test`. Live verification via Playwright (기존 프로젝트 방식대로 `npx`/캐시된 `playwright` 설치 사용).

## Global Constraints

- Reuse existing CSS custom properties only (`--bg`, `--bg-alt`, `--ink`, `--ink-muted`, `--ink-subtle`, `--border`, `--accent`, `--accent-ink`, `--dark-surface`, `--on-dark`, `--on-dark-muted`, `--font-body`, `--font-display`, `--font-mono`) — no new color tokens.
- **금지 문구**: "서부지역 마지막 마크힐"은 히어로에 등장해서는 안 된다(기존 테스트 `tests/content.test.mjs`가 이미 검증 — 이 플랜에서 절대 추가하지 않는다).
- **공통 이징**: `cubic-bezier(0.23, 1, 0.32, 1)`.
- **애니메이션 대상이 아닌 것(고정)**: `.hero-card-icon`, `.hero-card-title`, `.hero-card-sub`, `.hero-wordmark` — 처음부터 완성된 상태로 보여야 한다.
- `prefers-reduced-motion: reduce`에서는 전역 규칙(`css/styles.css:94-101`)이 모든 `transition-duration`/`animation-duration`을 0.01ms로 강제하지만, 이 기능이 쓰는 초기 상태(`opacity:0` 등)는 그것만으로 안 가려지므로 **전용 오버라이드가 반드시 필요**하다(Task 2에서 추가).
- No new npm dependencies, no `package.json`, no build step. Tests run via `node --test`.
- 카드 설명 문구는 전부 페이지 내 기존 사실에 근거해야 한다(아래 Task 1에 정확한 문구 명시).

---

## File Structure

- **Modify** `index.html` — 히어로 워드마크를 `.hero-head` 래퍼로 감싸고 옆에 `.hero-copy` 추가, 4개 `.hero-card`에 `.hero-card-desc` + `.hero-card-arrow` 추가.
- **Modify** `css/styles.css` — `.hero-head`/`.hero-copy`/`.hero-copy-word` 신규 규칙, `.hero-card-desc`/`.hero-card-word`/`.hero-card-arrow` 신규 규칙, 등장 애니메이션 상태, 호버 웨이브 키프레임, reduced-motion 오버라이드, 모바일 조정.
- **Modify** `js/script.js` — 카드 설명 어절 분해 + 등장 타이머.
- **Modify** `tests/content.test.mjs` — 카피/카드 설명 텍스트 정적 검증 추가.

---

### Task 1: 카피 + 카드 설명 마크업과 정적 스타일

**Files:**
- Modify: `index.html`
- Modify: `css/styles.css`
- Modify: `tests/content.test.mjs`

**Interfaces:**
- Produces: `.hero-copy`(카피 블록), `.hero-copy-word`(카피 어절 span, 11개), `.hero-card-desc`(카드 설명, 4개), `.hero-card-arrow`(카드 화살표, 4개) — Task 2·3이 이 클래스들의 초기/이후 상태를 정의.
- 이 태스크가 끝난 시점에는 애니메이션 이전(before) 상태 CSS가 아직 없으므로, 카피와 카드 설명은 **항상 보이는 상태**(정적)로 렌더링된다 — Task 2에서 애니메이션을 넣기 전까지는 그대로 보이는 게 정상.

- [ ] **Step 1: Write the failing tests**

`tests/content.test.mjs`에 추가(파일 끝, 마지막 `test(...)` 다음):

```js
test('hero copy tells the real brand story and never repeats the banned tagline', () => {
  const heroBlock = html.match(/<section class="hero-split"[\s\S]*?<\/section>/)[0];
  const copyBlock = heroBlock.match(/<p class="hero-copy">[\s\S]*?<\/p>/)?.[0];
  assert.ok(copyBlock, 'expected a <p class="hero-copy"> block in the hero');
  for (const word of ['2020년', '애월에서', '시작해', '여섯', '번째,', '다시', '애월로.', '남건종합건설이', '짓고', '아승공인중개사가', '함께합니다.']) {
    assert.ok(copyBlock.includes(word), `expected copy to include "${word}"`);
  }
  const wordSpans = [...copyBlock.matchAll(/class="hero-copy-word"/g)];
  assert.equal(wordSpans.length, 11, 'expected exactly 11 hero-copy-word spans');
  assert.ok(!heroBlock.includes('서부지역 마지막 마크힐'), 'the banned tagline must not appear in the hero copy');
});

test('each hero card carries a one-line description grounded in real facts, plus an arrow', () => {
  const heroCardsBlock = html.match(/<nav class="hero-cards"[\s\S]*?<\/nav>/)[0];
  const cardBlocks = [...heroCardsBlock.matchAll(/<a class="hero-card reveal"[\s\S]*?<\/a>/g)].map((m) => m[0]);
  assert.equal(cardBlocks.length, 4, 'expected exactly 4 hero cards');

  const expectedDescriptions = [
    '84타입 20세대 · 근생 4실',
    '하귀초·귀일중 도보 통학',
    '4.48억~5.13억',
    '전세대 태양광 · 선셋라운지',
  ];
  cardBlocks.forEach((block, i) => {
    assert.ok(block.includes(`class="hero-card-desc"`), `card ${i} must have a hero-card-desc`);
    assert.ok(block.includes(expectedDescriptions[i]), `card ${i} must include "${expectedDescriptions[i]}"`);
    assert.ok(block.includes('class="hero-card-arrow"') && block.includes('›'), `card ${i} must have a hero-card-arrow with ›`);
  });
});
```

- [ ] **Step 2: Run the tests to verify they fail**

Run: `node --test tests/content.test.mjs`
Expected: FAIL — `.hero-copy`, `.hero-card-desc`, `.hero-card-arrow`는 아직 `index.html`에 없음.

- [ ] **Step 3: Update `index.html`**

`index.html:35-67`의 히어로 콘텐츠 패널 블록 전체를 다음으로 교체:

```html
      <div class="hero-content-panel">
        <div class="hero-head">
          <h1 id="hero-title" class="hero-wordmark">마크힐 애월6차<span>분양</span></h1>
          <p class="hero-copy">
            <strong>
              <span class="hero-copy-word" style="transition-delay:0ms">2020년</span> <span class="hero-copy-word" style="transition-delay:60ms">애월에서</span> <span class="hero-copy-word" style="transition-delay:120ms">시작해</span><br>
              <span class="hero-copy-word" style="transition-delay:180ms">여섯</span> <span class="hero-copy-word" style="transition-delay:240ms">번째,</span> <span class="hero-copy-word" style="transition-delay:300ms">다시</span> <span class="hero-copy-word" style="transition-delay:360ms">애월로.</span>
            </strong><br>
            <span class="hero-copy-word" style="transition-delay:420ms">남건종합건설이</span> <span class="hero-copy-word" style="transition-delay:480ms">짓고</span><br>
            <span class="hero-copy-word" style="transition-delay:540ms">아승공인중개사가</span> <span class="hero-copy-word" style="transition-delay:600ms">함께합니다.</span>
          </p>
        </div>
        <nav class="hero-cards" aria-label="애월6차분양 바로가기">
          <a class="hero-card reveal" href="#overview">
            <div class="hero-card-icon"><img src="images/icon-overview.jpeg" alt="" loading="lazy"></div>
            <div class="hero-card-text">
              <div class="hero-card-title">개요</div>
              <div class="hero-card-sub mono">OVERVIEW</div>
            </div>
            <div class="hero-card-desc">84타입 20세대 · 근생 4실</div>
            <span class="hero-card-arrow">›</span>
          </a>
          <a class="hero-card reveal" href="#location">
            <div class="hero-card-icon"><img src="images/icon-location.jpeg" alt="" loading="lazy"></div>
            <div class="hero-card-text">
              <div class="hero-card-title">입지</div>
              <div class="hero-card-sub mono">LOCATION</div>
            </div>
            <div class="hero-card-desc">하귀초·귀일중 도보 통학</div>
            <span class="hero-card-arrow">›</span>
          </a>
          <a class="hero-card reveal" href="#types">
            <div class="hero-card-icon"><img src="images/icon-price.jpeg" alt="" loading="lazy"></div>
            <div class="hero-card-text">
              <div class="hero-card-title">타입&amp;가격</div>
              <div class="hero-card-sub mono">PRICE</div>
            </div>
            <div class="hero-card-desc">4.48억~5.13억</div>
            <span class="hero-card-arrow">›</span>
          </a>
          <a class="hero-card reveal" href="#premium">
            <div class="hero-card-icon"><img src="images/icon-premium.jpeg" alt="" loading="lazy"></div>
            <div class="hero-card-text">
              <div class="hero-card-title">프리미엄</div>
              <div class="hero-card-sub mono">PREMIUM</div>
            </div>
            <div class="hero-card-desc">전세대 태양광 · 선셋라운지</div>
            <span class="hero-card-arrow">›</span>
          </a>
        </nav>
      </div>
```

(`transition-delay` 인라인 스타일은 Task 2에서 `.hero-copy-word`에 transition을 정의하기 전까지는 아무 효과가 없다 — 정상.)

- [ ] **Step 4: Add base (non-animated) CSS**

`css/styles.css`의 `.hero-wordmark span { display: block; color: var(--accent); }` 바로 다음에 추가:

```css
.hero-head { display: flex; align-items: center; gap: 16px; }
.hero-copy {
  position: relative;
  padding-left: 14px;
  font-size: 12px;
  line-height: 1.75;
  color: var(--ink-muted);
}
.hero-copy strong { color: var(--ink); font-weight: 700; }
.hero-copy::before {
  content: '';
  position: absolute; left: 0; top: 0;
  width: 2px; height: 100%;
  background: var(--accent);
}
```

그리고 `.hero-card-arrow { color: var(--accent); font-size: 16px; flex-shrink: 0; }`를 `.hero-card-sub { ... }` 바로 다음에, `.hero-card-desc { flex: 1; font-size: 11px; color: var(--ink-muted); padding-left: 13px; border-left: 1px solid var(--border); }`도 함께 추가.

(이 스텝까지는 세로 액센트선이 항상 100% 보이는 정적 상태 — Task 2에서 `scaleY(0)→scaleY(1)` 애니메이션으로 바뀐다.)

- [ ] **Step 5: Run the tests to verify they pass**

Run: `node --test`
Expected: all PASS.

- [ ] **Step 6: Commit**

```bash
git add index.html css/styles.css tests/content.test.mjs
git commit -m "feat: add hero brand-story copy and card descriptions"
```

---

### Task 2: 등장 애니메이션 (로드 시 1회)

**Files:**
- Modify: `css/styles.css`
- Modify: `js/script.js`

**Interfaces:**
- Consumes: `.hero-copy`, `.hero-copy-word`(11개, Task 1에서 `transition-delay` 인라인 스타일 이미 있음), `.hero-card-desc`(4개), `.hero-card-arrow`(4개) — Task 1 산출물.
- Produces: `.hero-copy.is-visible`, `.hero-card.is-revealed` 클래스 토글 — Task 3(호버)이 `.is-revealed` 상태를 전제로 동작.

- [ ] **Step 1: Add the animated (before/after) CSS states**

`css/styles.css`에서 Task 1의 `.hero-copy::before { ... }`를 다음으로 교체(애니메이션 추가):

```css
.hero-copy::before {
  content: '';
  position: absolute; left: 0; top: 0;
  width: 2px; height: 100%;
  background: var(--accent);
  transform: scaleY(0);
  transform-origin: top;
}
.hero-copy.is-visible::before { transform: scaleY(1); transition: transform 0.7s cubic-bezier(0.23, 1, 0.32, 1); }
```

`.hero-copy strong { color: var(--ink); font-weight: 700; }` 바로 다음에 추가:

```css
.hero-copy-word {
  display: inline-block;
  opacity: 0;
  transform: translateY(9px);
  filter: blur(7px);
}
.hero-copy.is-visible .hero-copy-word {
  opacity: 1; transform: none; filter: blur(0);
  transition: opacity 0.6s cubic-bezier(0.23, 1, 0.32, 1),
              transform 0.6s cubic-bezier(0.23, 1, 0.32, 1),
              filter 0.6s cubic-bezier(0.23, 1, 0.32, 1);
}
```

`.hero-card-desc { ... }` 바로 다음에 추가:

```css
.hero-card-word {
  display: inline-block;
  opacity: 0;
  transform: translateY(7px);
  filter: blur(5px);
}
.hero-card.is-revealed .hero-card-word {
  opacity: 1; transform: none; filter: blur(0);
  transition: opacity 0.5s cubic-bezier(0.23, 1, 0.32, 1),
              transform 0.5s cubic-bezier(0.23, 1, 0.32, 1),
              filter 0.5s cubic-bezier(0.23, 1, 0.32, 1);
  transition-delay: calc(var(--i) * 45ms);
}
```

`.hero-card-arrow { ... }`를 다음으로 교체:

```css
.hero-card-arrow {
  color: var(--accent);
  font-size: 16px;
  flex-shrink: 0;
  opacity: 0;
  transition: opacity 0.4s ease, transform 0.3s cubic-bezier(0.23, 1, 0.32, 1);
}
.hero-card.is-revealed .hero-card-arrow { opacity: 1; }
```

- [ ] **Step 2: Add the reduced-motion override**

기존 `@media (prefers-reduced-motion: reduce) { .hero-card { transition: none; } }` 블록(`css/styles.css:239-241` 부근)에 규칙을 추가:

```css
@media (prefers-reduced-motion: reduce) {
  .hero-card { transition: none; }
  .hero-copy-word, .hero-card-word, .hero-card-arrow {
    opacity: 1; transform: none; filter: none;
  }
  .hero-copy::before { transform: scaleY(1); }
}
```

- [ ] **Step 3: Wire the JS**

`js/script.js`에서 `// Scroll-to-hero floating button` 블록 바로 다음에 추가:

```js
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
```

- [ ] **Step 4: Run the full test suite to confirm nothing regressed**

Run: `node --test`
Expected: all PASS (this task only changes JS/CSS animation behavior, which `node --test` doesn't execute in a browser context — no test file imports `script.js` directly).

- [ ] **Step 5: Commit**

```bash
git add css/styles.css js/script.js
git commit -m "feat: animate hero copy and card descriptions in on page load"
```

---

### Task 3: 카드 호버 애니메이션

**Files:**
- Modify: `css/styles.css`

**Interfaces:**
- Consumes: `.hero-card.is-revealed .hero-card-word`(Task 2 산출물) — 호버 애니메이션은 이미 공개된(`is-revealed`) 카드에만 걸린다.

- [ ] **Step 1: Add the hover wave keyframes**

`css/styles.css`의 `.hero-card:hover { box-shadow: 0 6px 18px rgba(26,24,21,0.1); transform: translateY(-1px); }` 바로 다음에 추가:

```css
@keyframes heroCardWave {
  0%   { transform: translateY(0);    color: var(--ink-muted); }
  45%  { transform: translateY(-4px); color: var(--accent); }
  100% { transform: translateY(0);    color: var(--accent); }
}
@media (hover: hover) {
  .hero-card:hover.is-revealed .hero-card-word {
    animation: heroCardWave 0.55s cubic-bezier(0.23, 1, 0.32, 1) both;
    animation-delay: calc(var(--i) * 40ms);
  }
  .hero-card:hover .hero-card-arrow { transform: translateX(3px); }
}
```

(`@media (prefers-reduced-motion: reduce)`의 전역 규칙이 이미 모든 `animation-duration`을 0.01ms로 강제하고, Task 2에서 추가한 `.hero-card-word { opacity:1 !important 없이 transform:none }` 오버라이드가 `!important` 없이도 `heroCardWave`가 만드는 값보다 우선 적용되는지 확인 필요 — Step 3에서 라이브로 검증.)

- [ ] **Step 2: Run the full test suite**

Run: `node --test`
Expected: all PASS (호버는 CSS 전용이라 정적 테스트에 영향 없음).

- [ ] **Step 3: Commit**

```bash
git add css/styles.css
git commit -m "feat: add wave hover animation to card descriptions"
```

---

### Task 4: 라이브 브라우저 검증

**Files:**
- None committed unless a fix is needed (그 경우 `fix:` 커밋으로 별도 처리).

**Interfaces:**
- Consumes: Task 1~3에서 완성된 히어로 전체.

- [ ] **Step 1: Serve the site locally**

```bash
python -m http.server 8099
```

- [ ] **Step 2: Write and run a Playwright verification script**

```js
import { chromium } from 'playwright';

const browser = await chromium.launch();
const results = [];

// 1) 기본 등장 시퀀스
{
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  const consoleErrors = [];
  page.on('console', (msg) => { if (msg.type() === 'error') consoleErrors.push(msg.text()); });
  page.on('pageerror', (err) => consoleErrors.push(err.message));

  await page.goto('http://localhost:8099/index.html');

  // 로드 직후: 카피 단어들은 아직 opacity 0에 가까워야 함
  const earlyOpacity = await page.locator('.hero-copy-word').first().evaluate((el) => getComputedStyle(el).opacity);
  results.push(['copy word starts hidden', Number(earlyOpacity) < 0.5]);

  await page.waitForTimeout(2500); // 전체 시퀀스(약 2.2초) 완료 대기

  const copyOpacity = await page.locator('.hero-copy-word').first().evaluate((el) => getComputedStyle(el).opacity);
  results.push(['copy word visible after sequence', Number(copyOpacity) > 0.95]);

  const lastCardWordOpacity = await page.locator('.hero-card').last().locator('.hero-card-word').first().evaluate((el) => getComputedStyle(el).opacity);
  results.push(['last card word visible after sequence', Number(lastCardWordOpacity) > 0.95]);

  const arrowOpacity = await page.locator('.hero-card').first().locator('.hero-card-arrow').evaluate((el) => getComputedStyle(el).opacity);
  results.push(['first card arrow visible after sequence', Number(arrowOpacity) > 0.95]);

  // 고정 요소 확인: 아이콘/제목/영문라벨은 처음부터 opacity 1
  await page.goto('http://localhost:8099/index.html');
  const iconOpacity = await page.locator('.hero-card-icon').first().evaluate((el) => getComputedStyle(el).opacity);
  results.push(['icon never hidden', Number(iconOpacity) === 1]);
  const titleOpacity = await page.locator('.hero-card-title').first().evaluate((el) => getComputedStyle(el).opacity);
  results.push(['title never hidden', Number(titleOpacity) === 1]);

  results.push(['console errors', consoleErrors]);
  await page.close();
}

// 2) 호버 애니메이션 (시퀀스 완료 후)
{
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  await page.goto('http://localhost:8099/index.html');
  await page.waitForTimeout(2500);
  const before = await page.locator('.hero-card').first().locator('.hero-card-word').first().evaluate((el) => getComputedStyle(el).color);
  await page.hover('.hero-card >> nth=0');
  await page.waitForTimeout(300);
  const during = await page.locator('.hero-card').first().locator('.hero-card-word').first().evaluate((el) => getComputedStyle(el).color);
  results.push(['hover changes word color', before !== during]);
  await page.close();
}

// 3) prefers-reduced-motion: 즉시 완성 상태
{
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('http://localhost:8099/index.html');
  await page.waitForTimeout(200); // 시퀀스 타이머를 기다리지 않고 짧게만 대기
  const copyOpacity = await page.locator('.hero-copy-word').first().evaluate((el) => getComputedStyle(el).opacity);
  results.push(['reduced-motion: copy visible almost immediately', Number(copyOpacity) > 0.95]);
  const cardWordOpacity = await page.locator('.hero-card').last().locator('.hero-card-word').first().evaluate((el) => getComputedStyle(el).opacity);
  results.push(['reduced-motion: last card word visible almost immediately', Number(cardWordOpacity) > 0.95]);
  await page.close();
}

// 4) 모바일 레이아웃
{
  const page = await browser.newPage({ viewport: { width: 390, height: 844 } });
  await page.goto('http://localhost:8099/index.html');
  await page.waitForTimeout(2500);
  const headFlexDirection = await page.locator('.hero-head').evaluate((el) => getComputedStyle(el).flexDirection);
  results.push(['mobile: hero-head stacks vertically', headFlexDirection === 'column']);
  await page.close();
}

console.log(JSON.stringify(results, null, 2));
await browser.close();
```

Run it with Node, resolving Playwright via a cached `npx`/`playwright` install (이 프로젝트에서 이미 쓰던 방식 — `NODE_PATH`를 `npm-cache/_npx/*/node_modules`로 잡거나, 스크립트를 그 디렉터리 안에 복사해 실행).

- [ ] **Step 3: Confirm the results**

Expected, all `true` / empty:
- `copy word starts hidden` → `true`
- `copy word visible after sequence` → `true`
- `last card word visible after sequence` → `true`
- `first card arrow visible after sequence` → `true`
- `icon never hidden` → `true`
- `title never hidden` → `true`
- `console errors` → `[]`
- `hover changes word color` → `true`
- `reduced-motion: copy visible almost immediately` → `true`
- `reduced-motion: last card word visible almost immediately` → `true`
- `mobile: hero-head stacks vertically` → `true` (이 결과가 `false`면 Task 1의 모바일 미디어쿼리 조정이 빠진 것 — 아래 참고)

**참고 — 모바일 조정이 위 스텝들에 빠져 있다면:** `css/styles.css`의 기존 `@media (max-width: 640px) { ... }` 블록(`.hero-content-panel { width: 100%; padding: 28px 20px; }` 있는 곳) 안에 추가:

```css
  .hero-head { flex-direction: column; align-items: flex-start; gap: 10px; }
  .hero-card-desc { font-size: 10px; }
```

추가했다면 `node --test`로 재확인 후 이 스텝의 Playwright 스크립트를 다시 실행.

- [ ] **Step 4: Take a reference screenshot**

```js
await page.goto('http://localhost:8099/index.html');
await page.waitForTimeout(2500);
await page.screenshot({ path: 'hero-final.png' });
```

읽어서 육안으로 확인: 카피가 워드마크 옆에 자연스럽게 배치되는지, 카드 설명이 잘리지 않는지, 화살표가 카드 오른쪽 끝에 있는지.

- [ ] **Step 5: Stop the local server**

Kill the `python -m http.server` process started in Step 1.

No commit for this task unless a fix was needed (그 경우 `fix:` 커밋으로 처리하고 `node --test`를 재확인).

---

## Self-Review Notes

- Spec coverage: 변경 1(카피)·변경 2(카드 설명)은 Task 1, 변경 3-1(등장)은 Task 2, 변경 3-2(호버)는 Task 3, 3-4(reduced-motion)는 Task 2에 포함, 반응형은 Task 4에서 확인 후 필요시 추가.
- Placeholder scan: 없음 — 모든 스텝에 실제 코드 포함.
- Type/name consistency: `.hero-copy`/`.hero-copy-word`/`.is-visible`(카피 쪽)과 `.hero-card-desc`/`.hero-card-word`/`.is-revealed`/`.hero-card-arrow`(카드 쪽) 네이밍이 Task 1~4 전체에서 일치.
