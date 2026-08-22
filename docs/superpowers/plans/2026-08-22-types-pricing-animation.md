# 타입&가격 섹션 애니메이션 구현 계획

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 타입&가격 섹션에서 타이틀(이유브로우+제목)만 스크롤 반복 등장 애니메이션을 넣고, 표 2개는 내용·마크업을 절대 건드리지 않은 채 첫 열(타입/동)만 볼드 처리하며, 계약조건·이벤트의 핵심 수치·문구에 포인트색 스윕 하이라이트 애니메이션을 적용한다.

**Architecture:** `index.html`에서 eyebrow+title만 `.types-intro` div로 감싸고(표는 건드리지 않음), 계약조건/이벤트 문단의 강조 대상 4곳을 `.terms-hl` span으로 감싼다. `css/styles.css`는 `.types-intro`(개요 섹션과 같은 반복-등장 패턴), 표 `:first-child` 볼드(마크업 변경 없이 CSS만), `.terms-hl` 스윕 하이라이트(반복)를 추가한다. `js/script.js`는 개요/입지 섹션과 같은 패턴의 `IntersectionObserver` 2개(`.types-intro`용, `.terms-block`용)를 추가한다.

**Tech Stack:** Vanilla HTML/CSS/ES modules, no build step, no new dependencies. Static assertions via `node --test`. Live verification via Playwright.

## Global Constraints

- **표 내용 절대 변경 금지**: `area-table`/`price-table`의 셀 텍스트, `<tr>`/`<td>` 구조, 기존 class 속성(`mono` 등)을 단 하나도 바꾸지 않는다. 볼드는 CSS `:first-child` 선택자만으로 구현 — 기존 테스트 `'price table rows carry the exact 동/층/가격/조망 combination...'`(정확한 `<td>${dong}</td>` 매칭)를 절대 깨서는 안 된다.
- Reuse existing CSS custom properties only — 새 색상 토큰 없음. 하이라이트 배경은 개요/입지 섹션과 동일한 `rgba(181, 102, 58, 0.16~0.22)` 계열 리터럴 재사용.
- **공통 이징**: `cubic-bezier(0.23, 1, 0.32, 1)`.
- `prefers-reduced-motion: reduce`에서는 애니메이션 초기 상태가 즉시 무효화되어야 한다 — 전용 오버라이드는 **반드시 해당 base 규칙 바로 다음 소스 위치**에 둘 것(개요/입지 섹션에서 실제로 겪은 소스 순서 버그를 반복하지 않는다).
- No new npm dependencies, no `package.json`, no build step. Tests run via `node --test`.

---

## File Structure

- **Modify** `index.html` — `#types` 섹션: eyebrow+title를 `.types-intro`로 감싸고, `.terms-block` 안 4곳을 `.terms-hl`/`.terms-hl-num` span으로 감쌈. 표 2개와 `.price-disclaimer`는 **완전히 그대로**.
- **Modify** `css/styles.css` — `.types-intro` 반복-등장 규칙, `.area-table td:first-child`/`.price-table td:first-child` 볼드, `.terms-hl`/`.terms-hl-num` 스윕 하이라이트 규칙.
- **Modify** `js/script.js` — `.types-intro`용, `.terms-block`용 `IntersectionObserver` 2개 추가.
- **Modify** `tests/content.test.mjs` — `.types-intro` 마크업 검증, `.terms-hl` 4곳 검증 추가. 기존 표 관련 테스트는 **수정하지 않음**(회귀 확인용으로 그대로 통과해야 함).

---

### Task 1: 마크업 + 기본(비애니메이션) 스타일

**Files:**
- Modify: `index.html`
- Modify: `css/styles.css`
- Modify: `tests/content.test.mjs`

**Interfaces:**
- Produces: `.types-intro`(eyebrow+title 래퍼), `.terms-hl`(4개, 안에 `.terms-hl-num` 1개씩 포함한 3개 + 텍스트만인 1개) — Task 2가 이 클래스들에 애니메이션을 건다.

- [ ] **Step 1: Write the failing tests**

`tests/content.test.mjs`에 추가(파일 끝):

```js
test('types intro wraps only the eyebrow and title — the tables are untouched', () => {
  const typesBlock = html.match(/<section class="chapter" id="types"[\s\S]*?<\/section>/)[0];
  const introMatch = typesBlock.match(/<div class="types-intro">([\s\S]*?)<\/div>\s*<table class="area-table">/);
  assert.ok(introMatch, 'expected a <div class="types-intro"> wrapping the eyebrow/title, immediately followed by <table class="area-table">');
  const introInner = introMatch[1];
  assert.ok(introInner.includes('class="eyebrow"'));
  assert.ok(introInner.includes('class="section-title"'));
  assert.ok(!introInner.includes('<table'), 'the tables must not be inside .types-intro');
});

test('contract terms and event copy highlight the key figures with terms-hl spans', () => {
  const typesBlock = html.match(/<section class="chapter" id="types"[\s\S]*?<\/section>/)[0];
  const termsBlock = typesBlock.match(/<div class="terms-block">[\s\S]*?<\/div>/)[0];
  assert.ok(termsBlock.includes('<span class="terms-hl"><span class="terms-hl-num">5%</span>(계약)</span>'));
  assert.ok(termsBlock.includes('<span class="terms-hl"><span class="terms-hl-num">5%</span>(계약 1개월 후)</span>'));
  assert.ok(termsBlock.includes('<span class="terms-hl"><span class="terms-hl-num">90%</span>(소유권이전시)</span>'));
  assert.ok(termsBlock.includes('<span class="terms-hl">무상 제공</span>'));
});
```

- [ ] **Step 2: Run the tests to verify they fail**

Run: `node --test tests/content.test.mjs`
Expected: FAIL — `.types-intro`/`.terms-hl`는 아직 `index.html`에 없음.

- [ ] **Step 3: Update `index.html`**

`#types` 섹션 안에서, 다음 두 줄:

```html
        <p class="eyebrow">타입 &amp; 가격</p>
        <h2 id="types-title" class="section-title">84A-1 · 84A-2 · 84B</h2>
```

을 다음으로 교체(표 마크업은 바로 뒤에 그대로 이어짐 — 손대지 않음):

```html
        <div class="types-intro">
          <p class="eyebrow">타입 &amp; 가격</p>
          <h2 id="types-title" class="section-title">84A-1 · 84A-2 · 84B</h2>
        </div>
```

그리고 `.terms-block` 안 두 줄:

```html
          <p><strong>계약조건</strong> — 분양가 기준 5%(계약) + 5%(계약 1개월 후) + 90%(소유권이전시)</p>
          <p><strong>이벤트</strong> — 샘플하우스 오픈 전 계약 시 TV·세탁기/건조기·줄눈시공·입주청소 무상 제공</p>
```

을 다음으로 교체:

```html
          <p><strong>계약조건</strong> — 분양가 기준 <span class="terms-hl"><span class="terms-hl-num">5%</span>(계약)</span> + <span class="terms-hl"><span class="terms-hl-num">5%</span>(계약 1개월 후)</span> + <span class="terms-hl"><span class="terms-hl-num">90%</span>(소유권이전시)</span></p>
          <p><strong>이벤트</strong> — 샘플하우스 오픈 전 계약 시 TV·세탁기/건조기·줄눈시공·입주청소 <span class="terms-hl">무상 제공</span></p>
```

`area-table`/`price-table`/`price-disclaimer`의 마크업은 이번 태스크에서 단 한 글자도 바꾸지 않는다.

- [ ] **Step 4: Add base (non-animated) CSS**

`css/styles.css`의 `.area-table td, .price-table td { ... }` 규칙(정확한 셀렉터는 파일에서 `.area-table td, .price-table td {`로 검색) 바로 다음에 추가:

```css
.area-table td:first-child, .price-table td:first-child { font-weight: 700; color: var(--ink); }
```

`.terms-block { display: grid; gap: 8px; font-size: 15px; }` 바로 다음에 추가:

```css
.terms-hl {
  position: relative;
  font-weight: 700; color: var(--ink);
  background-image: linear-gradient(rgba(181, 102, 58, 0.22), rgba(181, 102, 58, 0.22));
  background-repeat: no-repeat;
  background-position: 0 0;
  padding: 0 3px;
  border-radius: 3px;
}
.terms-hl-num { color: var(--accent); }
```

(이 스텝에서는 `background-size`를 지정하지 않아 기본값 `auto`(=글자 크기만큼 100% 채워짐)로 보인다 — Task 2에서 스윕 애니메이션을 위한 `0%→100%` 상태를 추가한다.)

- [ ] **Step 5: Run the tests to verify they pass**

Run: `node --test`
Expected: all PASS(기존 표 관련 테스트도 전부 그대로 통과 — 표 마크업을 안 건드렸으므로).

- [ ] **Step 6: Commit**

```bash
git add index.html css/styles.css tests/content.test.mjs
git commit -m "feat: wrap types title for animation, highlight terms-block key figures (tables untouched)"
```

---

### Task 2: 타이틀 반복 등장 + 하이라이트 스윕 애니메이션

**Files:**
- Modify: `css/styles.css`
- Modify: `js/script.js`

**Interfaces:**
- Consumes: `.types-intro`, `.terms-hl`(Task 1 산출물).
- Produces: `.types-intro.is-visible`, `.terms-block.is-visible` 클래스 토글.

- [ ] **Step 1: Add the animated CSS states**

`css/styles.css`에서 Task 1의 `.area-table td:first-child, .price-table td:first-child { font-weight: 700; color: var(--ink); }` 다음, 그리고 `.terms-hl` 규칙보다 위쪽 아무 곳에 추가(예: 같은 자리):

```css
.types-intro > .eyebrow, .types-intro > .section-title {
  opacity: 0;
  transform: translateY(14px);
  filter: blur(5px);
}
.types-intro.is-visible > .eyebrow, .types-intro.is-visible > .section-title {
  opacity: 1; transform: none; filter: blur(0);
  transition: opacity 0.7s cubic-bezier(0.23, 1, 0.32, 1),
              transform 0.7s cubic-bezier(0.23, 1, 0.32, 1),
              filter 0.7s cubic-bezier(0.23, 1, 0.32, 1);
}
.types-intro.is-visible > .section-title { transition-delay: 90ms; }
@media (prefers-reduced-motion: reduce) {
  .types-intro > .eyebrow, .types-intro > .section-title { opacity: 1; transform: none; filter: none; }
}
```

`.terms-hl { ... }` 규칙(Task 1에서 추가한 것)을 다음으로 교체:

```css
.terms-hl {
  position: relative;
  font-weight: 700; color: var(--ink);
  background-image: linear-gradient(rgba(181, 102, 58, 0.22), rgba(181, 102, 58, 0.22));
  background-repeat: no-repeat;
  background-position: 0 0;
  background-size: 0% 100%;
  padding: 0 3px;
  border-radius: 3px;
}
.terms-block.is-visible .terms-hl {
  background-size: 100% 100%;
  transition: background-size 0.6s cubic-bezier(0.23, 1, 0.32, 1);
}
.terms-block.is-visible .terms-hl:nth-of-type(1) { transition-delay: 0ms; }
.terms-block.is-visible .terms-hl:nth-of-type(2) { transition-delay: 160ms; }
.terms-block.is-visible .terms-hl:nth-of-type(3) { transition-delay: 320ms; }
.terms-block.is-visible .terms-hl:nth-of-type(4) { transition-delay: 480ms; }
@media (prefers-reduced-motion: reduce) {
  .terms-hl { background-size: 100% 100%; }
}
```

(`:nth-of-type`은 `.terms-hl`끼리의 등장 순서를 셀렉터만으로 매기는 방식 — 두 `<p>`에 걸쳐 있지만 각 `<p>` 안에서 `.terms-hl`이 나오는 순서와 무관하게 페이지 전체 `.terms-block .terms-hl` 4개 중 n번째를 가리키려면 이 셀렉터로는 부정확할 수 있다. 대신 Step 2에서 JS로 각 요소에 인라인 `transition-delay`를 직접 설정하는 방식을 쓴다 — 아래 Step 3에서 이 CSS의 `:nth-of-type` 4줄은 삭제하고 JS가 인라인 스타일로 지연을 건다.)

- [ ] **Step 2: Remove the `:nth-of-type` delay rules (JS will set delays inline instead)**

방금 추가한 4줄:

```css
.terms-block.is-visible .terms-hl:nth-of-type(1) { transition-delay: 0ms; }
.terms-block.is-visible .terms-hl:nth-of-type(2) { transition-delay: 160ms; }
.terms-block.is-visible .terms-hl:nth-of-type(3) { transition-delay: 320ms; }
.terms-block.is-visible .terms-hl:nth-of-type(4) { transition-delay: 480ms; }
```

를 삭제한다(각 `<p>` 안에서 `:nth-of-type`이 전체 4개 중 순번이 아니라 그 `<p>` 안에서의 순번을 가리켜서 부정확하기 때문 — 계약조건 문단엔 3개, 이벤트 문단엔 1개가 있어 `:nth-of-type(1)`이 두 군데서 각각 매치돼버린다).

- [ ] **Step 3: Wire the JS**

`js/script.js`에서 `// Location rows + map ...` 블록 다음에 추가:

```js
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
```

- [ ] **Step 4: Run the full test suite**

Run: `node --test`
Expected: all PASS.

- [ ] **Step 5: Commit**

```bash
git add css/styles.css js/script.js
git commit -m "feat: animate types title reveal and terms-block sweep highlight"
```

---

### Task 3: 라이브 브라우저 검증

**Files:**
- None committed unless a fix is needed (그 경우 `fix:` 커밋으로 처리).

**Interfaces:**
- Consumes: Task 1~2에서 완성된 타입&가격 섹션.

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
    const eyebrow = document.querySelector('.types-intro > .eyebrow');
    const hl = document.querySelectorAll('.terms-hl')[0];
    return {
      eyebrowOpacity: getComputedStyle(eyebrow).opacity,
      hlBgSize: getComputedStyle(hl).backgroundSize,
    };
  });
  results.push(['before scroll: eyebrow hidden', Number(before.eyebrowOpacity) < 0.5]);
  results.push(['before scroll: first highlight not swept', before.hlBgSize.startsWith('0%') || before.hlBgSize.startsWith('0px')]);

  // Tables must be visible immediately regardless of scroll (no animation on them)
  const tableOpacity = await page.evaluate(() => getComputedStyle(document.querySelector('.area-table')).opacity);
  results.push(['tables always visible (no animation)', Number(tableOpacity) === 1]);

  await page.evaluate(() => document.getElementById('types-title').scrollIntoView({ behavior: 'instant', block: 'center' }));
  await page.waitForTimeout(900);
  const mid = await page.evaluate(() => {
    const eyebrow = document.querySelector('.types-intro > .eyebrow');
    return { eyebrowOpacity: getComputedStyle(eyebrow).opacity };
  });
  results.push(['at types: eyebrow visible', Number(mid.eyebrowOpacity) > 0.95]);

  await page.evaluate(() => document.querySelector('.terms-block').scrollIntoView({ behavior: 'instant', block: 'center' }));
  await page.waitForTimeout(1200);
  const hlStates = await page.evaluate(() =>
    Array.from(document.querySelectorAll('.terms-hl')).map((el) => getComputedStyle(el).backgroundSize)
  );
  results.push(['all 4 highlights swept to 100%', hlStates.every((s) => s.startsWith('100%'))]);

  // Table content must be exactly unchanged
  const priceCellText = await page.evaluate(() =>
    document.querySelector('.price-table tbody tr').children[2].textContent
  );
  results.push(['first price row still reads 45,800', priceCellText.trim() === '45,800']);

  await page.evaluate(() => window.scrollTo(0, 0));
  await page.waitForTimeout(900);
  const afterUp = await page.evaluate(() => {
    const eyebrow = document.querySelector('.types-intro > .eyebrow');
    return { eyebrowOpacity: getComputedStyle(eyebrow).opacity };
  });
  results.push(['scrolled back to top: eyebrow hidden again (repeat)', Number(afterUp.eyebrowOpacity) < 0.5]);

  results.push(['console errors', consoleErrors]);
  await page.close();
}

{
  const page = await browser.newPage({ viewport: { width: 1200, height: 800 } });
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('http://localhost:8099/index.html');
  await page.waitForTimeout(200);
  const state = await page.evaluate(() => {
    const eyebrow = document.querySelector('.types-intro > .eyebrow');
    const hl = document.querySelectorAll('.terms-hl')[0];
    return {
      eyebrowOpacity: getComputedStyle(eyebrow).opacity,
      hlBgSize: getComputedStyle(hl).backgroundSize,
    };
  });
  results.push(['reduced-motion: eyebrow visible immediately', Number(state.eyebrowOpacity) > 0.95]);
  results.push(['reduced-motion: highlight already swept', state.hlBgSize.startsWith('100%')]);
  await page.close();
}

console.log(JSON.stringify(results, null, 2));
await browser.close();
```

Run it with Node, resolving Playwright via a cached `npx`/`playwright` install(이 프로젝트에서 이미 쓰던 방식).

- [ ] **Step 3: Confirm the results**

Expected, all `true`(마지막 `console errors`는 `[]`):
- `before scroll: eyebrow hidden` → `true`
- `before scroll: first highlight not swept` → `true`
- `tables always visible (no animation)` → `true`
- `at types: eyebrow visible` → `true`
- `all 4 highlights swept to 100%` → `true`
- `first price row still reads 45,800` → `true`(표 내용이 정말 안 바뀌었는지의 최종 확인)
- `scrolled back to top: eyebrow hidden again (repeat)` → `true`
- `reduced-motion: eyebrow visible immediately` → `true`
- `reduced-motion: highlight already swept` → `true`

실패가 있으면 원인을 고치고(특히 reduced-motion 오버라이드의 소스 순서), `node --test`로 재확인한 뒤 스크립트를 다시 실행.

- [ ] **Step 4: Take a reference screenshot**

```js
await page.evaluate(() => document.getElementById('types-title').scrollIntoView({ behavior: 'instant', block: 'start' }));
await page.waitForTimeout(1000);
await page.screenshot({ path: 'types-final.png', fullPage: true });
```

읽어서 육안으로 확인: 표 9행이 전부 그대로 보이는지, 첫 열만 볼드인지, 계약조건/이벤트 하이라이트가 자연스러운지.

- [ ] **Step 5: Stop the local server**

Kill the `python -m http.server` process started in Step 1.

No commit for this task unless a fix was needed(그 경우 `fix:` 커밋으로 처리하고 `node --test` 재확인).

---

## Self-Review Notes

- Spec coverage: 변경 1(타이틀만 애니메이션)은 Task 2, 변경 2(첫 열 볼드, 표 불변)는 Task 1, 변경 3(하이라이트 스윕)은 Task 1(마크업)+Task 2(애니메이션)에 매핑.
- Placeholder scan: 없음.
- Type/name consistency: `.types-intro`/`.terms-hl`/`.terms-hl-num`/`.is-visible` 네이밍이 전체 태스크에서 일치. `.terms-hl` 지연은 CSS `:nth-of-type`이 아니라 JS 인라인 스타일로 처리(Task 2 Step 2에서 명시적으로 정정).
- 표 불변 검증: Task 3의 Playwright 스크립트가 실제 셀 텍스트(`45,800`)를 읽어 최종 확인 — 가장 중요한 제약이므로 라이브 검증에도 명시적으로 포함.
