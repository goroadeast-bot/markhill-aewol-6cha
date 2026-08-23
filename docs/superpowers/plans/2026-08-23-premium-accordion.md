# Premium Accordion Implementation Plan

> Implemented directly in this session (single-developer continuation), following the
> established pattern from the overview/location/types-pricing features: spec → plan →
> implement → test → Playwright-verify → commit → show in Chrome.

**Goal:** Replace `#premium`'s static feature-grid with the approved hover-accordion design.

**Architecture:** Pure HTML/CSS/JS, no new dependencies. Reuses the site's existing
repeat-reveal IntersectionObserver pattern and sweep-highlight pattern already used by
`.types-intro` / `.terms-hl`.

## Global Constraints

- Real photos already exist at `images/premium-01-solar.jpg` … `premium-06-bath.jpg`.
- `prefers-reduced-motion` overrides go immediately after each selector's base rule, not
  in the old centralized block.
- Do not port the mockup's `findScroller()` — real site scrolls `window`.
- No content changes to badges/copy beyond what's in the spec (researched, user-confirmed).

---

### Task 1: Replace `#premium` markup in `index.html`

**Files:** Modify `index.html:229-268` (the `#premium` section, up to and not including
`.signature-moment`, which stays as-is).

- [ ] Replace the eyebrow/title with a `.premium-intro` wrapper (same shape as
  `.types-intro`): eyebrow "프리미엄", `h2#premium-title` "지켜온 것 위에, 6차가 더한 것",
  lede "1차부터 이어온 구성은 차수가 거듭될수록 업그레이드 되었습니다."
- [ ] Replace `.feature-grid` with `.acc` containing 6 `.acc-item` divs, each with:
  `<img>` (real photo, `loading="lazy"`, descriptive `alt`), `.acc-num` (01-06),
  `.acc-badge` (`<span>` text, `is-new` class for 6차 items), `.acc-vert` (collapsed
  vertical label), `.acc-open` (`<h3>` + `<p>` with `.acc-key` spans for the numbers).
- [ ] Add `<p class="acc-note">` with the bolded "참고용 이미지" wrapped in
  `<span class="acc-note-hl">`.
- [ ] Run `node --test` — expect existing tests to still pass (they don't reference
  `.feature-grid` yet) and the new tests from Task 4 to fail (not written yet — fine).
- [ ] Commit: `feat: rebuild premium section as hover-expanding photo accordion`

### Task 2: CSS — `css/styles.css`

**Files:** Modify `css/styles.css` — remove old `.feature-grid`/`.feature-card` rules
(keep `.feature-title` — still used by `.location-text`), add new rules near where
`.types-intro` rules live for consistency.

- [ ] Add `.premium-intro > .eyebrow, .premium-intro > .section-title` hidden state +
  `.premium-intro.is-visible > ...` revealed state (copy `.types-intro` pattern exactly,
  including the reduced-motion override placed directly after).
- [ ] Add `.premium-intro > .section-lede` to the same reveal group with a further-delayed
  transition (120ms) since premium has a 3rd line the types section doesn't animate.
- [ ] Add `.acc` / `.acc-item` / `.acc-item img` / `.acc-item::after` / `:hover` rules per
  the mockup (flex-grow expansion, dim-at-rest/bright-on-hover image filter, gradient
  overlay).
- [ ] Add `.acc-num`, `.acc-badge`, `.acc-badge span`, `.acc-badge span.is-new`, `.acc-vert`,
  `.acc-open` (with `visibility:hidden` at rest), `.acc-open h3/p/.acc-key`.
- [ ] Add `.acc-note`, `.acc-note-hl` (sweep highlight, `background-size: 0% 100%` → 100%
  on `.acc-note.is-visible`).
- [ ] Add one `@media (prefers-reduced-motion: reduce)` block immediately after the `.acc*`
  rules disabling all the above transitions and forcing end-states visible.
- [ ] Run `node --test` (should still pass — CSS doesn't break HTML assertions).
- [ ] Commit: `style: add premium accordion panel styles`

### Task 3: JS — `js/script.js`

**Files:** Modify `js/script.js`, adding two blocks right after the existing
`typesIntro`/`termsBlock` blocks (around line 164).

```js
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
```

- [ ] Add the two blocks above.
- [ ] Run `node --test`.
- [ ] Commit: `feat: wire up premium accordion reveal and note highlight`

### Task 4: Tests — `tests/content.test.mjs`

**Files:** Modify `tests/content.test.mjs`.

- [ ] Add the 6 premium image paths to `requiredImages`.
- [ ] Add a test asserting `#premium` contains exactly 6 `.acc-item` blocks and each of
  the 6 expected badge texts (`6차 신규` ×2, `1차부터` ×3, `6차 강화` ×1) appears.
- [ ] Add a test asserting the note text contains "참고용 이미지" wrapped in
  `class="acc-note-hl"`.
- [ ] Run `node --test` — all tests pass.
- [ ] Commit: `test: cover premium accordion markup and images`

### Task 5: Live verification

- [ ] Start `python -m http.server 8099` from repo root if not already running.
- [ ] Playwright: load `index.html`, scroll to `#premium`, screenshot at rest and mid-hover
  on one panel; confirm no console errors.
- [ ] Toggle `prefers-reduced-motion: reduce` via Playwright's `page.emulateMedia` and
  confirm the section renders in its end-state with no animation (this is the check that
  caught the source-order bug twice before — do not skip it).
- [ ] Open the real Chrome browser to `http://localhost:8099/index.html` and show the user.
