# 네비 CTA 정리 + 전화번호 팝업 구현 계획

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 상단 고정 네비 버튼을 "분양상담"으로 통일하고 히어로의 중복 버튼을 제거하며, 브라우저 기본 스크롤바 화살표를 숨기고, `tel:` 링크 클릭 시 데스크톱에서는 전화번호 팝업이, 모바일에서는 바로 전화 연결이 되도록 만든다(자매 사이트 아승부동산과 동일한 동작).

**Architecture:** 새 파일 없이 기존 3개 파일(`index.html`, `css/styles.css`, `js/script.js`)만 수정한다. 전화 팝업 로직은 이미 존재하는 `#phoneModal` 마크업/CSS를 그대로 재사용하고, `js/script.js`에 아승부동산(`d:/claude_homepage/js/script.js:562-621`)과 동일한 패턴의 전역 `tel:` 링크 클릭 가로채기만 추가한다. 별도 pure-logic 모듈은 만들지 않는다 — `isMobileDevice()`는 한 줄짜리 UA 정규식 체크라 `scroll-spy.js`처럼 분리할 만큼의 복잡도가 없고(YAGNI), 실제 동작은 라이브 브라우저 검증(Playwright, 데스크톱/모바일 UA 각각)으로 확인한다.

**Tech Stack:** Vanilla HTML/CSS/ES modules, no build step, no new dependencies. Static assertions via `node --test`. Live verification via Playwright.

## Global Constraints

- Reuse existing CSS custom properties only — no new color tokens.
- The only phone number anywhere on the page is `010-9347-1345` (기존 테스트 `tests/content.test.mjs`의 `'the only phone number on the page is 010-9347-1345'`가 이미 검증 — 이 플랜에서 깨지지 않아야 함).
- `prefers-reduced-motion: reduce`는 이미 전역 규칙(`css/styles.css:92-99`)이 커버 — 이 플랜에서 새 애니메이션/트랜지션을 추가하지 않으므로 별도 대응 불필요.
- No new npm dependencies, no `package.json`, no build step. Tests run via `node --test`.
- 연락처 섹션(`#contact`)의 `data-open-phone-modal` 버튼은 건드리지 않는다 — 이미 항상 모달을 여는 의도된 동작.

---

## File Structure

- **Modify** `index.html` — 네비 CTA 텍스트 변경, 히어로의 `.hero-head-row`/`.hero-consult-link` 제거.
- **Modify** `css/styles.css` — 이제 안 쓰는 `.hero-head-row`/`.hero-consult-link*` 규칙 삭제, 스크롤바 화살표 숨김 규칙 추가.
- **Modify** `js/script.js` — `isMobileDevice()` + 전역 `tel:` 링크 클릭 가로채기 추가.
- **Modify** `tests/content.test.mjs` — 네비 CTA 텍스트/히어로 버튼 삭제를 반영해 정적 테스트 갱신.

---

### Task 1: 네비 CTA 텍스트 변경, 히어로 중복 버튼 삭제, 스크롤바 화살표 숨김

**Files:**
- Modify: `index.html`
- Modify: `css/styles.css`
- Modify: `tests/content.test.mjs`

**Interfaces:**
- Consumes: 기존 `#hero-title`(`index.html`, 이미 존재), 기존 `.chapter-nav-cta`/`.hero-consult-link` 마크업.
- Produces: 없음(다음 태스크가 이 태스크의 마크업 구조에 의존하지 않음 — Task 2는 `.chapter-nav-cta`의 `href="tel:..."`만 참조하며, 이는 이번 태스크로 변경되지 않는다).

- [ ] **Step 1: Write the failing test**

`tests/content.test.mjs`의 기존 테스트를 찾아 **교체**:

```js
test('hero consult link and nav CTA both dial the real phone number', () => {
  assert.ok(html.includes('class="hero-consult-link" href="tel:010-9347-1345"'));
  assert.ok(html.includes('class="btn btn-accent chapter-nav-cta" href="tel:010-9347-1345"'));
});
```

교체 후:

```js
test('nav CTA reads "분양상담" and dials the real phone number; the redundant hero consult button is gone', () => {
  assert.ok(html.includes('class="btn btn-accent chapter-nav-cta" href="tel:010-9347-1345">분양상담</a>'));
  assert.ok(!html.includes('hero-consult-link'), 'the duplicate hero consult button should be removed');
  assert.ok(!html.includes('hero-head-row'), 'the now-single-child wrapper row should be removed');
  const heroTitleMatches = html.match(/id="hero-title"/g) ?? [];
  assert.equal(heroTitleMatches.length, 1, 'the hero wordmark heading must still exist exactly once');
});
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `node --test tests/content.test.mjs`
Expected: FAIL — nav CTA still reads "전화 상담" and `hero-consult-link`/`hero-head-row` still present.

- [ ] **Step 3: Update `index.html`**

Change the nav CTA text (currently `<a class="btn btn-accent chapter-nav-cta" href="tel:010-9347-1345">전화 상담</a>`):

```html
<a class="btn btn-accent chapter-nav-cta" href="tel:010-9347-1345">분양상담</a>
```

Then find the hero head row block:

```html
        <div class="hero-head-row">
          <h1 id="hero-title" class="hero-wordmark">마크힐 애월6차<span>분양</span></h1>
          <a class="hero-consult-link" href="tel:010-9347-1345">분양상담</a>
        </div>
```

Replace it with the heading alone, promoted out of the now-unnecessary wrapper:

```html
        <h1 id="hero-title" class="hero-wordmark">마크힐 애월6차<span>분양</span></h1>
```

- [ ] **Step 4: Update `css/styles.css`**

Remove these three now-unused rules:

```css
.hero-head-row { display: flex; justify-content: space-between; align-items: flex-start; gap: 12px; }
```

```css
.hero-consult-link {
  display: inline-flex; align-items: center;
  background: var(--dark-surface); color: var(--on-dark);
  font-size: 12px; font-weight: 700;
  padding: 8px 14px; border-radius: 999px;
  white-space: nowrap; flex-shrink: 0;
}
.hero-consult-link:hover { background: var(--ink); }
```

Then add a new rule anywhere near the top of the file (e.g. right after the `:root { ... }` custom-property block) to hide the browser's default scrollbar arrow buttons:

```css
::-webkit-scrollbar-button { display: none; }
```

- [ ] **Step 5: Run the tests to verify they pass**

Run: `node --test`
Expected: all PASS.

- [ ] **Step 6: Commit**

```bash
git add index.html css/styles.css tests/content.test.mjs
git commit -m "feat: rename nav CTA to 분양상담, remove duplicate hero button, hide default scrollbar arrows"
```

---

### Task 2: 데스크톱 팝업 / 모바일 다이렉트 전화 연결 (아승부동산 방식)

**Files:**
- Modify: `js/script.js`

**Interfaces:**
- Consumes: `phoneModal` (already declared in `js/script.js`, `document.getElementById('phoneModal')`), all `a[href^="tel:"]` elements in the page (currently: `.chapter-nav-cta` and `.phone-modal-number`, per Task 1's output — `.hero-consult-link` no longer exists to be double-counted).

- [ ] **Step 1: Add the device check and click interception**

In `js/script.js`, insert this block right after the existing `const phoneModal = document.getElementById('phoneModal');` line and before the existing `const phoneCopyBtn = ...` line:

```js
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
```

- [ ] **Step 2: Run the full test suite to confirm nothing regressed**

Run: `node --test`
Expected: all PASS (no test file executes `script.js` directly — this is JS behavior verified live in Step 4).

- [ ] **Step 3: Commit**

```bash
git add js/script.js
git commit -m "feat: open phone popup on desktop tel: clicks, dial directly on mobile"
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
const results = [];

// Desktop: clicking the nav CTA should open the popup, not navigate to tel:
{
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  const consoleErrors = [];
  page.on('console', (msg) => { if (msg.type() === 'error') consoleErrors.push(msg.text()); });
  page.on('pageerror', (err) => consoleErrors.push(err.message));

  await page.goto('http://localhost:8099/index.html');
  await page.waitForTimeout(300);

  const hiddenBefore = await page.locator('#phoneModal').getAttribute('aria-hidden');
  results.push(['desktop: modal hidden before click', hiddenBefore === 'true']);

  await page.click('.chapter-nav-cta');
  await page.waitForTimeout(200);
  const hiddenAfter = await page.locator('#phoneModal').getAttribute('aria-hidden');
  results.push(['desktop: modal open after clicking nav CTA', hiddenAfter === 'false']);
  results.push(['desktop: console errors', consoleErrors]);
  await page.close();
}

// Mobile-emulated UA: clicking the nav CTA should NOT open the popup (native tel: dial instead)
{
  const context = await browser.newContext({
    viewport: { width: 390, height: 844 },
    userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15',
  });
  const page = await context.newPage();
  await page.goto('http://localhost:8099/index.html');
  await page.waitForTimeout(300);

  // A tel: navigation attempt shows up as a failed/aborted main-frame navigation in a headless
  // browser (no phone app to hand off to) — capture that instead of expecting a successful load.
  let navigatedToTel = false;
  page.on('framenavigated', (frame) => {
    if (frame === page.mainFrame() && frame.url().startsWith('tel:')) navigatedToTel = true;
  });

  await page.click('.chapter-nav-cta').catch(() => {});
  await page.waitForTimeout(300);
  const hiddenOnMobile = await page.locator('#phoneModal').getAttribute('aria-hidden');
  results.push(['mobile: modal stayed hidden after clicking nav CTA', hiddenOnMobile === 'true']);
  await context.close();
}

console.log(JSON.stringify(results, null, 2));
await browser.close();
```

Run it with Node (resolving Playwright the same way used elsewhere in this project — via a cached `npx`/`playwright` install; if module resolution fails with `ERR_MODULE_NOT_FOUND`, copy the script next to a `node_modules/playwright` directory found under the local `npm-cache/_npx/*` folders and run it from there).

- [ ] **Step 6: Confirm the results**

Expected:
- `desktop: modal hidden before click` → `true`
- `desktop: modal open after clicking nav CTA` → `true`
- `desktop: console errors` → `[]`
- `mobile: modal stayed hidden after clicking nav CTA` → `true`

If any assertion fails, fix the cause in `js/script.js`, re-run `node --test`, then re-run this script before moving on.

- [ ] **Step 7: Stop the local server**

Kill the `python -m http.server` process started in Step 4.

No commit for this step unless a fix was needed (in which case follow the `fix:` commit pattern used elsewhere in this project's history).

---

## Self-Review Notes

- Spec coverage: 스펙의 변경 1(텍스트/중복 버튼)·변경 2(스크롤바)는 Task 1, 변경 3(팝업 분기)은 Task 2에 매핑됨.
- Placeholder scan: 없음.
- Type/name consistency: `phoneModal`(기존 선언 재사용) ↔ `phoneLinks`(신규) ↔ `.chapter-nav-cta`/`.phone-modal-number`(기존 마크업) 모두 일치. `isMobileDevice()`는 Task 2 안에서만 쓰이는 로컬 함수로, 다른 태스크가 이름에 의존하지 않음.
