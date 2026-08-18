# "맨 위로(히어로)" 플로팅 버튼 구현 계획

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 히어로 섹션을 벗어나 스크롤하면 화면 우측 하단(스크롤바 근처)에 원형 ↑ 버튼이 나타나고, 클릭하면 히어로로 부드럽게 스크롤되는 플로팅 버튼을 추가한다.

**Architecture:** 새 파일 없이 기존 3개 파일(`index.html`, `css/styles.css`, `js/script.js`)에 소규모로 추가한다. 표시/숨김은 히어로 섹션(`.hero-split`) 하나에 붙는 독립된 `IntersectionObserver`로 판단하고, 클릭 이동은 `<a href="#hero-title">`가 기존 전역 `scroll-behavior: smooth`(및 `prefers-reduced-motion`에서 자동으로 꺼지는 처리)를 그대로 활용하므로 별도 스크롤 JS가 필요 없다. 기존 4개 존 스크롤 스파이(`NAV_ZONES`/`pickActiveNav`)와는 완전히 독립적이며 서로 얽지 않는다.

**Tech Stack:** Vanilla HTML/CSS/ES modules, no build step, no new dependencies. Static assertions via `node --test`. Live verification via Playwright (같은 방식으로 이 프로젝트에서 이미 사용 중).

## Global Constraints

- Reuse existing CSS custom properties only (`--bg`, `--bg-alt`, `--ink`, `--ink-muted`, `--ink-subtle`, `--border`, `--accent`, `--accent-ink`, `--dark-surface`, `--on-dark`, `--on-dark-muted`, `--font-body`, `--font-display`, `--font-mono`) — no new color tokens.
- The only phone number anywhere on the page is `010-9347-1345` — this feature does not touch phone number logic, but must not accidentally duplicate the phone modal's `id`/class names.
- `main#pageContent`의 기존 `.chapter { scroll-margin-top: 76px; }` 규칙과 `.chapter-nav`(`z-index: 100`)/`.phone-modal`(`z-index: 200`)의 z-index 순서를 깨지 않는다 — 새 버튼은 `z-index: 90`.
- 전역 `@media (prefers-reduced-motion: reduce)` 블록(`css/styles.css:92-99`)이 이미 모든 요소의 `transition-duration`을 0.01ms로 강제하므로, 이 기능에는 별도의 reduced-motion 오버라이드를 추가하지 않는다(중복 규칙 금지 — 이미 `*` 셀렉터가 커버함).
- No new npm dependencies, no `package.json`, no build step. Tests run via `node --test`.
- Follow existing naming conventions: kebab-case CSS classes prefixed by component (`.scroll-top-btn`), camelCase JS `id` references matching existing style (`scrollTopBtn`, cf. `phoneModal`, `phoneCopyBtn`).

---

## File Structure

- **Modify** `index.html` — 버튼 마크업을 `</main>` 뒤, `<footer>` 앞에 추가.
- **Modify** `css/styles.css` — `.scroll-top-btn` 규칙 추가(기존 `.phone-modal` 규칙 근처), 모바일 미디어쿼리에 여백 조정 1줄 추가.
- **Modify** `js/script.js` — 히어로 가시성 `IntersectionObserver` 추가(기존 스크롤 스파이 observer와 별개, 파일 하단 "Scroll-triggered stagger reveal" 섹션 앞에 배치).
- **Modify** `tests/content.test.mjs` — 버튼 마크업 정적 검증 테스트 추가.

---

### Task 1: 버튼 마크업 + 스타일 + 정적 콘텐츠 테스트

**Files:**
- Modify: `index.html`
- Modify: `css/styles.css`
- Modify: `tests/content.test.mjs`

**Interfaces:**
- Produces: `#scrollTopBtn` (`<a>` 엘리먼트, `href="#hero-title"`, class `.scroll-top-btn`) — Task 2의 JS가 `document.getElementById('scrollTopBtn')`로 참조.
- Consumes: 기존 `#hero-title` id(이미 존재, `index.html:37`).

이 태스크가 끝나면 버튼은 항상 `opacity: 0; visibility: hidden;`으로 화면에 보이지 않는 상태로 코드에는 존재한다(Task 2에서 `.is-visible` 토글 로직을 붙이기 전까지) — 페이지의 다른 동작에는 전혀 영향 없음.

- [ ] **Step 1: Write the failing test**

`tests/content.test.mjs`의 기존 `test('the top nav has exactly 4 links...`) 테스트 바로 다음에 추가:

```js
test('scroll-to-hero button exists, links to the real hero heading, and has an accessible label', () => {
  assert.ok(html.includes('id="scrollTopBtn"'), 'expected id="scrollTopBtn"');
  assert.ok(html.includes('class="scroll-top-btn"'), 'expected class="scroll-top-btn"');
  const btnBlock = html.match(/<a[^>]*id="scrollTopBtn"[^>]*>/)?.[0];
  assert.ok(btnBlock, 'expected a single <a> tag carrying id="scrollTopBtn"');
  assert.ok(btnBlock.includes('href="#hero-title"'), 'button must link to #hero-title');
  assert.ok(btnBlock.includes('aria-label="맨 위로 이동"'), 'button must have an accessible label');
  const heroTitleMatches = html.match(/id="hero-title"/g) ?? [];
  assert.equal(heroTitleMatches.length, 1, 'expected exactly one element with id="hero-title"');
});
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `node --test tests/content.test.mjs`
Expected: FAIL — `id="scrollTopBtn"` not found in `index.html`.

- [ ] **Step 3: Add the button markup**

In `index.html`, right after the `</main>` closing tag (line 329) and before `<footer class="site-footer">`, insert:

```html
<a href="#hero-title" class="scroll-top-btn" id="scrollTopBtn" aria-label="맨 위로 이동">
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
    <path d="M12 19V5"></path>
    <path d="M5 12l7-7 7 7"></path>
  </svg>
</a>
```

- [ ] **Step 4: Add the CSS**

In `css/styles.css`, right after the `.phone-modal-hint { ... }` rule (around line 165, just before the `.hero-split-top` block), insert:

```css
.scroll-top-btn {
  position: fixed;
  right: 16px;
  bottom: 24px;
  z-index: 90;
  width: 44px;
  height: 44px;
  border-radius: 50%;
  background: var(--dark-surface);
  color: var(--on-dark);
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0;
  visibility: hidden;
  pointer-events: none;
  transition: opacity 0.2s ease;
}
.scroll-top-btn.is-visible {
  opacity: 1;
  visibility: visible;
  pointer-events: auto;
}
.scroll-top-btn:hover { background: var(--ink); }
```

Then, inside the existing `@media (max-width: 640px) { ... }` block at the bottom of the file, add one line (anywhere in the block, e.g. right after the `.hero-stat:nth-child(2n) { border-right: none; }` line):

```css
  .scroll-top-btn { right: 12px; bottom: 16px; }
```

- [ ] **Step 5: Run the tests to verify they pass**

Run: `node --test`
Expected: all PASS, including the new test. The button is present but permanently invisible at this point (no `.is-visible` toggle logic exists yet) — that's expected, Task 2 adds it.

- [ ] **Step 6: Commit**

```bash
git add index.html css/styles.css tests/content.test.mjs
git commit -m "feat: add scroll-to-hero floating button markup and styles"
```

---

### Task 2: 표시/숨김 동작(IntersectionObserver) + 라이브 브라우저 검증

**Files:**
- Modify: `js/script.js`

**Interfaces:**
- Consumes: `#scrollTopBtn` and `.hero-split` from Task 1 (`document.getElementById('scrollTopBtn')`, `document.querySelector('.hero-split')`).

- [ ] **Step 1: Add the visibility observer**

In `js/script.js`, insert this block right before the existing `// Phone modal` comment (currently line 62):

```js
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

```

- [ ] **Step 2: Run the full test suite to confirm nothing regressed**

Run: `node --test`
Expected: all PASS (this task only changes JS behavior, which `node --test` doesn't execute in a browser context — no test file directly imports `script.js`).

- [ ] **Step 3: Commit**

```bash
git add js/script.js
git commit -m "feat: show/hide scroll-to-hero button based on hero section visibility"
```

- [ ] **Step 4: Serve the site locally**

```bash
python -m http.server 8099
```

(Leave running in the background for this task.)

- [ ] **Step 5: Write and run a Playwright verification script**

Create a throwaway script (in the OS temp/scratch directory, not committed):

```js
import { chromium } from 'playwright';

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
const consoleErrors = [];
page.on('console', (msg) => { if (msg.type() === 'error') consoleErrors.push(msg.text()); });
page.on('pageerror', (err) => consoleErrors.push(err.message));

await page.goto('http://localhost:8099/index.html');
await page.waitForTimeout(300);

const results = [];

// Hidden while hero is in view
const initiallyVisible = await page.locator('#scrollTopBtn').evaluate((el) => el.classList.contains('is-visible'));
results.push(['button hidden at page top', initiallyVisible === false]);

// Scroll down past the hero
await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight * 0.5));
await page.waitForTimeout(400);
const visibleAfterScroll = await page.locator('#scrollTopBtn').evaluate((el) => el.classList.contains('is-visible'));
results.push(['button visible after scrolling past hero', visibleAfterScroll === true]);

// Click it and confirm we land back at the hero
await page.click('#scrollTopBtn');
await page.waitForTimeout(1500);
const heroBox = await page.locator('#hero-title').boundingBox();
results.push(['hero heading back near top after click', heroBox && heroBox.y < 200]);
const hiddenAgain = await page.locator('#scrollTopBtn').evaluate((el) => el.classList.contains('is-visible'));
results.push(['button hidden again after returning to hero', hiddenAgain === false]);

results.push(['console errors', consoleErrors]);
console.log(JSON.stringify(results, null, 2));
await browser.close();
```

Run it with Node (resolving Playwright the same way used elsewhere in this project — via a cached `npx`/`playwright` install).

- [ ] **Step 6: Confirm the results**

Expected:
- `button hidden at page top` → `true`
- `button visible after scrolling past hero` → `true`
- `hero heading back near top after click` → `true`
- `button hidden again after returning to hero` → `true`
- `console errors` → `[]`

If any assertion fails, fix the cause in `index.html`/`css/styles.css`/`js/script.js`, re-run `node --test`, then re-run this script before moving on.

- [ ] **Step 7: Stop the local server**

Kill the `python -m http.server` process started in Step 4.

No commit for this step unless a fix was needed (in which case follow the `fix:` commit pattern used elsewhere in this project's history).

---

## Self-Review Notes

- Spec coverage: 위치/z-index/표시조건/클릭동작/접근성/모바일 여백 — 스펙의 모든 항목이 Task 1(마크업+스타일) 또는 Task 2(동작+검증)에 매핑됨.
- Placeholder scan: 없음 — 모든 스텝에 실제 코드/명령 포함.
- Type/name consistency: `scrollTopBtn`(JS) ↔ `id="scrollTopBtn"`(HTML) ↔ `.scroll-top-btn`(CSS) ↔ `#scrollTopBtn`(테스트/Playwright) 전부 일치.
