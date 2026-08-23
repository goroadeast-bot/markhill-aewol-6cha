# History Sticky-Year Timeline — Implementation Plan

> Implemented directly in this session, following the established pattern:
> spec → plan → implement → `node --test` → Playwright verify (incl. reduced-motion)
> → commit per task.

**Goal:** Replace `#history`'s flat card grid with the approved sticky-year timeline.

**Architecture:** Vanilla HTML/CSS/JS, no dependencies. Left rail uses CSS
`position: sticky`; a scroll listener updates the year/location/counter/progress.
Item entrance reuses the site's repeat-reveal IntersectionObserver pattern.

## Global Constraints

- All phase facts copied verbatim from the existing markup — no rewording.
- 누적 세대수 is `127세대`, labelled `1~5차 누적 공급` (6차 excluded).
- Real site scrolls `window`; no `findScroller()`.
- Reduced-motion overrides colocated after each rule block.
- Sticky rail `top: 88px` to clear the fixed nav.

---

### Task 1: Replace `#history` markup

**Files:** Modify `index.html` — the `.timeline-grid` block (currently lines ~349-392).

- [ ] Replace `.timeline-grid` with `.htl` (grid) containing `.htl-rail` and `.htl-items`.
- [ ] Rail: `.htl-year` (`id="htlYear"`), `.htl-place` (`id="htlPlace"`),
      `.htl-count` with `id="htlIdx"`, `.htl-bar > i` (`id="htlBar"`), `.htl-total`.
- [ ] Items: 6 `<article class="htl-item">` each carrying `data-year`, `data-place`,
      `data-idx`, a `.htl-photo` with `<img loading="lazy">` + `.htl-no` label,
      an `.htl-h` heading with `<em>` around the unit count, and an `.htl-d` line.
- [ ] 6차 item gets `htl-item-now` and keeps the existing
      `<a class="btn btn-accent" href="#overview">6차 자세히 보기</a>`.
- [ ] Run `node --test` — the existing reveal test will fail (expected; fixed in Task 4).

### Task 2: CSS — `css/styles.css`

**Files:** Modify `css/styles.css`, replacing the `.timeline-*` block (lines ~314-341).

- [ ] Remove `.timeline-grid`, `.timeline-card`, `.timeline-photo`, `.timeline-body`,
      `.timeline-tag`, `.timeline-card-current` rules (nothing else references them —
      verify with a grep first).
- [ ] Add `.htl` grid (`250px 1fr`, gap 40px), `.htl-rail` (`position: sticky; top: 88px`).
- [ ] Add `.htl-year` / `.htl-place` with a `.swap` state (opacity 0 + slight rise)
      for the cross-fade, `.htl-count`, `.htl-bar` + `.htl-bar i`, `.htl-total`.
- [ ] Add `.htl-item` hidden state + `.htl-item.is-visible` revealed state.
- [ ] Add `.htl-photo` (270px, radius 14px), `.htl-photo img` with the dim-at-rest /
      brighten-on-hover filter, `.htl-no` overlay label.
- [ ] Add `.htl-h` / `.htl-h em` (accent) / `.htl-d`, and `.htl-item-now .btn` spacing.
- [ ] Add a single `@media (prefers-reduced-motion: reduce)` block **immediately after**
      these rules forcing end-states and disabling transitions.
- [ ] Add a mobile breakpoint collapsing `.htl` to one column and un-stickying the rail.
- [ ] Run `node --test`.

### Task 3: JS — `js/script.js`

**Files:** Modify `js/script.js`, adding after the rooftop block.

- [ ] Guard on `.htl` existing.
- [ ] IntersectionObserver (threshold 0.2, non-unobserving) toggling `is-visible`
      on each `.htl-item`.
- [ ] Scroll listener (passive) picking the last item whose top is above 38% of the
      viewport; when the active index changes, cross-fade the rail text and set the
      progress bar width.
- [ ] Under `reduceMotion`: mark all items visible, set the rail to the last phase,
      set the bar to 100%, and attach no scroll listener.
- [ ] Run `node --test`.

### Task 4: Tests — `tests/content.test.mjs`

**Files:** Modify `tests/content.test.mjs`.

- [ ] Update the `every timeline card, feature card, and gallery group opts into reveal`
      test — `.timeline-card` no longer exists.
- [ ] Add a test asserting: 6 `.htl-item` blocks; each of the 6 photos present;
      the `data-year`/`data-place` attributes match the 6 real phases; the
      `1~5차 누적 공급` label and `127세대` figure are present; the 6차 CTA still
      points at `#overview`.
- [ ] Run `node --test` — all pass.

### Task 5: Live verification

- [ ] Ensure `python -m http.server 8099` is running.
- [ ] Playwright: scroll through `#history`, assert the rail reads the right
      year/index/bar-width at two different scroll positions, screenshot, and
      confirm zero console errors.
- [ ] Re-run with `page.emulateMedia({ reducedMotion: 'reduce' })` and confirm the
      section renders fully in its end-state with no animation — this is the check
      that caught the CSS source-order bug twice before, so do not skip it.
- [ ] Commit each task separately, then show in Chrome.
