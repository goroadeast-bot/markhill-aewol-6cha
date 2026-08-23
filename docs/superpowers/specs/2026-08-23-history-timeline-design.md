# History Section Redesign — Sticky Year Timeline (Design Spec)

## Goal

Replace the flat 6-card `.timeline-grid` in `#history` with a two-column sticky
timeline: a left rail that updates as you scroll, and a right column of large
photos. Approved as "A안" from the mockup at
`.superpowers/brainstorm/3368-1787476756/content/history-redesign.html`.

The premium section already uses the accordion ("오르간") form, so this section
deliberately takes a different shape to avoid repeating it.

## Layout

Two-column grid (`250px 1fr`, 40px gap):

**Left rail** — `position: sticky`, sticks below the fixed nav:
- Large year (JetBrains Mono, ~52px) — swaps as each phase scrolls past
- Location line in accent color — swaps with the year
- Counter `01 / 06`
- Progress bar filling to `(index+1)/6`
- Divider, then `1~5차 누적 공급 / 127세대`

**Right column** — 6 phase items, each:
- Photo (270px tall, rounded, `object-fit: cover`) with a `1차`…`6차` label overlay
- Heading with the unit count in accent (`<em>18세대</em> · 3개동`)
- One-line description
- 6차 additionally carries the existing `6차 자세히 보기` CTA to `#overview`

## Animation

- Each item fades/rises in on scroll (repeat-reveal, non-unobserving observer).
- Rail year/location cross-fade on swap (fade out 190ms → swap text → fade in).
- Progress bar width transitions with `cubic-bezier(0.23, 1, 0.32, 1)`.
- Photos dim at rest (`saturate(.86) brightness(.86)`) and brighten on hover
  (`saturate(1.04) brightness(1.04)`) — same treatment as the premium accordion
  and rooftop bento.

## Content (unchanged facts, confirmed against existing markup)

| # | 연도 | 지역 | 규모 | 특징 |
|---|---|---|---|---|
| 1차 | 2020~21 | 애월읍 상귀리 | 18세대(3개동) | 마크힐 첫 공급, 준공 전 완판 |
| 2차 | 2022 | 애월읍 상귀리 | 23세대(4개동) | 환기 개선, 다이닝룸 구조기둥 제거로 개방감 확대 |
| 3차 | 2022 | 애월읍 상귀리 | 26세대 | 2차와 동시 진행, 오션뷰 2개동 + 정남향 1개동 배치 |
| 4차 | 2023 | 제주시 외도일동 | 12세대(2개동) | 가전·보일러 모바일 제어 최초 도입, 제주사회복지공동모금회 기부 |
| 5차 | 2024~25 | 노형동 | 48세대(8개동) | 최초 복층형 펜트하우스 8세대, 보이드 구조, 사용승인 2025.7.17 |
| 6차 | 2026~ | 애월읍 하귀2리 | 20세대 + 근생 4실 | 서부지역 마지막 마크힐, 전세대 태양광, 옥탑 선셋라운지 |

**누적 세대수**: `127세대` = 18+23+26+12+48. **1~5차만** 합산합니다 — 6차는 아직
공급 전이라 제외하며, 라벨에 "1~5차 누적 공급"이라고 명시합니다 (user-confirmed).

**6차 사진**: `images/rooftop-01-lounge.jpg` (옥탑 선셋라운지) — user-confirmed.
기존 6차 카드에는 사진이 없었고 CTA만 있었습니다.

**3차 사진**: 기존 `history-3cha.jpg`에 아승공인중개사 워터마크가 있어, 소스 폴더
(`markhill_image/markhill_3차_애월`)의 워터마크 없는 거실 사진으로 교체하고 톤을
보정했습니다 (commit `0b6ce56`, already applied).

## Constraints

- Real site scrolls `window` — do NOT port the mockup's `findScroller()` helper
  (that exists only because the visual-companion iframe scrolls an inner `.main`).
- Sticky rail `top` must clear the fixed nav (`main#pageContent` has 60px
  padding-top; `.chapter` uses `scroll-margin-top: 76px`). Use `top: 88px`.
- `prefers-reduced-motion` overrides colocated immediately after each new rule,
  per the project's established convention (never in the global block near the top).
- No fabricated facts; every figure above comes from the existing markup.

## Files touched

- `index.html` — replace the `.timeline-grid` block inside `#history`.
- `css/styles.css` — replace `.timeline-*` rules with `.htl-*` rules.
- `js/script.js` — add the rail-update + item-reveal logic.
- `tests/content.test.mjs` — update the reveal test (no more `.timeline-card`),
  add assertions for the new structure and the 127세대 figure.
