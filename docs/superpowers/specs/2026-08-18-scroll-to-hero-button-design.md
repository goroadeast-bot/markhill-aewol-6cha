# "맨 위로(히어로)" 플로팅 버튼 — 스펙

## 배경

`2026-08-17-markhill-aewol6-redesign-design.md`로 사이트를 8챕터 클릭 전환 구조에서 단일 연속 스크롤 구조로 전환했다. 그 결과 페이지가 매우 길어져(히어로 → 애월6차분양 4개 서브섹션 → 역사 → 갤러리 → 문의), 사용자가 페이지 중간/하단에서 다시 히어로(메인 화면)를 보고 싶을 때 수동으로 계속 스크롤해 올려야 하는 불편함이 생겼다. 이를 해소하기 위해 스크롤을 따라다니는 "맨 위로" 아이콘 버튼을 추가한다.

## 컴포넌트

**마크업**: `<a href="#hero-title" class="scroll-top-btn" id="scrollTopBtn" aria-label="맨 위로 이동">` 안에 위쪽 화살표 SVG 아이콘. `<body>` 최상위, `</main>` 이후(다른 fixed 요소들과 같은 레벨)에 배치.

**스타일** (`css/styles.css`에 추가):
- `position: fixed; right: 16px; bottom: 24px;` — 우측 하단, 브라우저 스크롤바 바로 안쪽(가려지지 않을 정도로 살짝 띄움).
- 44px 원형 버튼, 배경 `var(--dark-surface)`, 아이콘 색상 `var(--on-dark)` — 기존 `.hero-consult-link` 등에서 쓰는 다크 필 버튼과 동일 색상 조합이라 새 토큰 불필요.
- `z-index: 90` — `.chapter-nav`(100)보다 아래, `.phone-modal`(200)보다 아래. 서로 겹칠 일이 원래 없지만 안전하게 순서만 맞춰둔다.
- 기본 상태 `opacity: 0; visibility: hidden; pointer-events: none;`, 표시 상태는 `.is-visible` 클래스 토글로 `opacity: 1; visibility: visible; pointer-events: auto;`. `transition: opacity 0.2s ease`.
- `@media (prefers-reduced-motion: reduce)`에서 `transition: none`.
- 모바일(`max-width: 640px`)에서는 `right: 12px; bottom: 16px;`로 여백만 살짝 축소, 크기는 유지.

**동작 로직** (`js/script.js`에 추가, 새 파일 불필요 — 로직이 조건 하나짜리라 별도 pure 모듈로 뺄 만큼 복잡하지 않음):
- `IntersectionObserver`를 히어로 섹션(`.hero-split`) 하나에만 건다. 콜백: 히어로가 화면에서 완전히 벗어나면(`!entry.isIntersecting`) 버튼에 `is-visible` 추가, 히어로가 다시 보이면 제거.
- 클릭 시 별도 JS 스크롤 처리 불필요 — `href="#hero-title"`가 기존 전역 `scroll-behavior: smooth`(및 `prefers-reduced-motion`에서 자동으로 `auto`로 바뀌는 처리)를 그대로 탄다.
- 기존 스크롤 스파이(`NAV_ZONES`/`pickActiveNav`, 4개 네비 존 판정)와는 무관한 완전히 독립된 observer — 재사용하거나 얽지 않는다.

## 데이터 흐름

새로 생기는 상태는 "버튼이 보이는가/안 보이는가" 하나뿐이며, 이는 히어로 섹션의 가시성(브라우저가 이미 추적 중인 IntersectionObserver entry)에서 직접 파생된다. 서버/외부 데이터 없음.

## 에러 처리

`document.querySelector('.hero-split')`나 버튼 엘리먼트가 없으면(마크업이 바뀌는 등) observer를 등록하지 않고 조용히 스킵 — 기존 코드베이스의 다른 옵셔널 요소(`phoneModal`, `phoneCopyBtn` 등)와 동일한 패턴(`?.`/존재 체크 후 진행).

## 테스트

- `tests/content.test.mjs`: 버튼 마크업이 존재하고(`id="scrollTopBtn"`, `href="#hero-title"`, `aria-label` 존재), `#hero-title`이 실제로 존재하는 id인지(앵커가 깨진 링크가 아닌지) 확인하는 정적 검증 테스트 추가.
- 별도 pure-logic 유닛 테스트는 만들지 않는다 — 로직이 IntersectionObserver 콜백 안의 조건문 하나뿐이라 `scroll-spy.js`처럼 추출할 만한 순수 함수가 없음(YAGNI).
- Task 5에 해당하는 라이브 브라우저 검증(Playwright)으로 실제 스크롤 시 버튼이 나타나고/사라지고, 클릭 시 히어로로 스크롤되는지 확인.

## 스코프 밖

- 스크롤 진행률 표시(원형 프로그레스 링 등) — 요청되지 않음, 순수 "맨 위로" 버튼만.
- 다른 섹션으로의 바로가기 — 히어로 전용, 기존 상단 네비게이션 4개 링크가 이미 다른 섹션 이동을 담당.

## 자체 검토

- 플레이스홀더 스캔: 없음.
- 내부 일관성: 기존 상단 네비(`.chapter-nav`, z-index 100)·전화모달(`.phone-modal`, z-index 200)과 z-index 순서 명시적으로 정리, 충돌 없음.
- 스코프: 단일 소형 컴포넌트, 별도 분해 불필요.
- 모호성: 없음 — 위치(우측 하단, 스크롤바 근처)·표시 시점(히어로 이탈 즉시)·모양(원형 ↑ 버튼) 모두 사용자 확정.
