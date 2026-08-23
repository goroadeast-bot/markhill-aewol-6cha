# Premium Section Accordion Redesign — Design Spec

## Goal

Replace the static 6-card `.feature-grid` in `#premium` with a horizontal row of 6
vertical panels that expand on hover to reveal a real photo, title, and description —
mirroring the reference design the user provided and the mockup validated in
`.superpowers/brainstorm/1539-1787453543/content/premium-accordion-v2.html`.

## Content accuracy (researched from `markhill_blog/*.docx`, confirmed with user)

Each panel gets a small badge indicating its actual history — this replaced an earlier
draft that wrongly implied all 6 features were unchanged since 1차:

| # | Feature | Badge | Fact |
|---|---|---|---|
| 01 | 전세대 태양광 | `6차 신규` (accent) | Genuine 6차 addition |
| 02 | 세라믹 상판·아일랜드 주방 | `1차부터` (neutral) | Island kitchen since 1차; countertop material upgraded to ceramic from 5차 (was marble) |
| 03 | 시그니처 히든 슬라이딩도어 | `1차부터` (neutral) | Present since 1차 (루바 도어), evolved into current hidden form |
| 04 | 세대내 스프링클러 | `6차 신규` (accent) | Genuine 6차 addition |
| 05 | 마크힐센터 | `6차 강화` (accent) | Started 5차, strengthened at 6차 (direct ownership, 3년 확정운영) |
| 06 | 부부욕실 욕조 | `1차부터` (neutral) | Present since 1차 (타일욕조), material evolved |

Title: **"지켜온 것 위에, 6차가 더한 것"**
Subtitle: **"1차부터 이어온 구성은 차수가 거듭될수록 업그레이드 되었습니다."**

## Layout / interaction

- 6 panels in a flex row, each `flex: 1 1 0`, fixed row height.
- Collapsed: vertical (`writing-mode: vertical-rl`) title label, centered, bottom-anchored.
- Hover: panel grows via `flex-grow` transition (cubic-bezier), image brightens/saturates
  (dim+desaturated at rest, brighter+saturated on hover — the "선택된 이미지는 좀 밝았으면"
  request), vertical label fades out, horizontal title+description fade/slide in from the
  bottom with a transition delay, badge and number shift from centered to left-aligned.
- Expanded content uses `visibility:hidden` at rest (not just `opacity:0`) to prevent text
  bleed-through behind the collapsed vertical label.
- Real photos: `images/premium-01-solar.jpg` … `images/premium-06-bath.jpg` (already
  committed, 896×1065, watermark-cropped).
- Bottom note: `* 이해를 돕기 위한 <b>참고용 이미지</b>입니다.` — bold, with a sweep-highlight
  animation on just the phrase "참고용 이미지" (not the whole sentence), triggered by
  scroll visibility of the note.
- Section title (eyebrow/h2/lede) gets the same repeat-reveal blur+rise animation used by
  `.overview-intro` / `.types-intro` (staggered 90ms, threshold 0.2, non-unobserving
  IntersectionObserver so it repeats on scroll in/out).

## Hard constraints carried over from this project

- Real site scrolls `window` directly — do NOT port the mockup's `findScroller()`
  workaround (that was only needed because the mockup tool's iframe scrolls an inner
  `.main` div).
- `prefers-reduced-motion` overrides must be placed immediately after each new selector's
  base rule in `css/styles.css`, matching the existing colocation convention — never
  centralize into the old global reduced-motion block near the top of the file.
- No fabricated stats; every badge/description is backed by the researched history above.

## Files touched

- `index.html` — replace `#premium` inner markup (`.feature-grid` block + eyebrow/h2)
  with the accordion markup; `.signature-moment` figure below stays untouched.
- `css/styles.css` — add `.premium-intro` (repeat-reveal wrapper), `.acc*` rules, remove
  now-unused `.feature-grid`/`.feature-card`/`.feature-title` rules only if nothing else
  references them (`.location-text .feature-title` at line 496 still uses `.feature-title`
  — keep that rule, only drop `.feature-grid`/`.feature-card`).
- `js/script.js` — add a repeat-reveal observer for `.premium-intro` (same pattern as
  `.types-intro`), an observer to stagger-delay and trigger `.acc-note`'s sweep highlight.
- `tests/content.test.mjs` — add assertions for the 6 images existing, the accordion
  markup structure, and the badge text values.
