# 히어로 카피 추가 + 카드 정보 확장 + 등장/호버 애니메이션 — 스펙

## 배경

히어로 오른쪽 컬럼(`.hero-content-panel`, 전체 폭의 42%)이 비어 보인다는 지적에서 출발했다. 브라우저 목업으로 여러 안을 비교한 끝에 아래 조합으로 확정했다(2026-08-20).

- 워드마크 오른쪽에 브랜드 스토리 카피 추가
- 4개 카드에 한 줄 설명 + 화살표 추가
- 카피와 카드 설명 문구에 등장 애니메이션, 카드에 호버 애니메이션

**중요 — 기술 스택 제약:** 사용자가 참고로 제시한 React/shadcn/Tailwind + `motion` 라이브러리 컴포넌트(`text-reveal.tsx`)는 이 프로젝트에 설치하지 않는다. 이 사이트는 빌드 없는 순수 HTML/CSS/ES모듈이고 `package.json`도 npm 의존성도 없다. 그 컴포넌트가 만드는 **효과**(어절 단위 blur+fade+rise, `cubic-bezier(.23,1,.32,1)`, 0.6s)만 순수 CSS/JS로 재현한다.

## 변경 1 — 워드마크 오른쪽 카피

`.hero-head`(신규 flex 래퍼) 안에 기존 `.hero-wordmark`(h1)와 새 `.hero-copy`를 가로로 배치한다.

`.hero-copy`는 왼쪽에 2px `var(--accent)` 세로 액센트선(`::before`, `transform: scaleY()`로 위→아래로 자람)을 두고, 그 오른쪽에 4줄 카피:

```
2020년 애월에서 시작해        ← 강조(--ink, 700)
여섯 번째, 다시 애월로.        ← 강조(--ink, 700)
남건종합건설이 짓고            ← 본문(--ink-muted)
아승공인중개사가 함께합니다.    ← 본문(--ink-muted)
```

**출처(정직성):** 이 문구는 역사 섹션의 기존 문장 "애월 상귀리에서 시작해 노형, 그리고 다시 애월 하귀로 — 남건종합건설이 짓고 아승공인중개사가 함께한 마크힐의 여섯 걸음입니다"와 1차 카드의 "1차 · 2020~21 · 애월읍 상귀리"에 근거한다. 새로 지어낸 사실 없음.

**제외:** "서부지역 마지막 마크힐"은 이전 리디자인에서 히어로 금지로 정해졌고 테스트가 이를 검증하므로 쓰지 않는다(역사 섹션 6차 카드의 기존 사용은 그대로 유지).

## 변경 2 — 카드에 설명 + 화살표

기존 `.hero-card` 구조(아이콘 타일 + 제목 + 영문라벨) 오른쪽에 두 요소를 추가한다:

- `.hero-card-desc` — 왼쪽에 1px `var(--border)` 세로 구분선, `flex: 1`
- `.hero-card-arrow` — `›`, `var(--accent)`

각 카드의 설명 문구(전부 페이지 내 기존 사실):

| 카드 | 설명 | 근거 |
|---|---|---|
| 개요 | `84타입 20세대 · 근생 4실` | 개요 표 "도시형생활주택 중 단지형 연립주택(84타입 20세대) 및 근린생활시설(4실)" |
| 입지 | `하귀초·귀일중 도보 통학` | 입지 섹션 "하귀초등학교 · 귀일중학교 도보 통학 가능" |
| 타입&가격 | `4.48억~5.13억` | 가격표 44,800~51,300만원 |
| 프리미엄 | `전세대 태양광 · 선셋라운지` | 프리미엄 섹션 "전세대 태양광", "옥탑 선셋라운지" |

## 변경 3 — 애니메이션

전부 순수 CSS transition/animation + 소량의 vanilla JS(어절 분할, 지연값 설정). 새 의존성 없음.

**공통 이징:** `cubic-bezier(.23, 1, .32, 1)`

### 3-1. 등장 애니메이션 (페이지 로드 시 1회)

히어로는 첫 화면이므로 스크롤 트리거가 아니라 로드 직후 재생한다.

| 대상 | 효과 | 지속 | 스태거 |
|---|---|---|---|
| `.hero-copy::before` (액센트선) | `scaleY(0) → scaleY(1)`, origin top | 0.7s | — |
| `.hero-copy` 어절 | `opacity 0→1`, `translateY(9px)→0`, `blur(7px)→0` | 0.6s | 어절당 60ms |
| `.hero-card-desc` 어절 | `opacity 0→1`, `translateY(7px)→0`, `blur(5px)→0` | 0.5s | 어절당 45ms |
| `.hero-card-arrow` | `opacity 0→1` | 0.4s | 카드와 함께 |

카드는 카피가 끝나는 **1240ms** 시점부터 **카드당 220ms** 간격으로 시작한다(11어절 × 60ms + 600ms ≈ 1240ms). 전체 시퀀스 약 2.2초.

**애니메이션 대상이 아닌 것(고정):** 아이콘 타일(`.hero-card-icon`), 카드 제목(`.hero-card-title`), 영문 라벨(`.hero-card-sub`), 워드마크. 처음부터 완성된 상태로 보인다.

### 3-2. 호버 애니메이션 (카드)

설명 문구의 어절이 물결처럼 순차적으로 떠올랐다가 액센트 색으로 정착한다.

```css
@keyframes heroCardWave {
  0%   { transform: translateY(0);     color: var(--ink-muted); }
  45%  { transform: translateY(-4px);  color: var(--accent); }
  100% { transform: translateY(0);     color: var(--accent); }
}
```

지속 0.55s, 어절당 40ms 지연. 함께 적용되는 것: 카드 자체의 기존 lift(`translateY(-1px)` + 그림자), 화살표 `translateX(3px)`.

### 3-3. 어절 분할

`.hero-copy`의 어절은 HTML에 `<span class="hero-copy-word">`로 직접 작성한다(줄바꿈 위치가 고정이라 마크업이 명확하고, JS 없이도 문구가 읽힘).

`.hero-card-desc`의 어절은 JS가 `textContent`를 공백으로 쪼개 `<span class="hero-card-word" style="--i:N">`로 감싼다(카드마다 어절 수가 달라 인덱스 계산이 필요하고, JS가 꺼져도 원문 텍스트는 그대로 보임).

### 3-4. `prefers-reduced-motion: reduce`

전역 오버라이드(`css/styles.css:94-101`)가 `transition-duration`/`animation-duration`을 0.01ms로 강제하지만, 이 기능은 **초기 상태가 `opacity: 0`**이므로 그것만으로는 부족하다. 전용 오버라이드를 추가해 초기 상태 자체를 무효화한다:

```css
@media (prefers-reduced-motion: reduce) {
  .hero-copy-word, .hero-card-word, .hero-card-arrow {
    opacity: 1; transform: none; filter: none; animation: none;
  }
  .hero-copy::before { transform: scaleY(1); }
}
```

JS 쪽도 `matchMedia('(prefers-reduced-motion: reduce)').matches`일 때 지연값 설정과 시퀀스 타이머를 건너뛰고 즉시 완성 상태로 만든다.

## 반응형

모바일(`max-width: 640px`)에서는 `.hero-head`가 세로로 쌓인다(워드마크 위, 카피 아래). 카드 설명은 유지하되, 폭이 좁아 줄바꿈될 경우를 대비해 `.hero-card-desc`의 글자 크기를 한 단계 줄인다. 호버 효과는 터치 기기에서 의미가 없으므로 `@media (hover: hover)`로 감싼다.

## 스코프 밖

- 히어로 좌우 비율(58:42) — 변경하지 않음(65:35은 이전에 시도 후 되돌림).
- 마크힐 역사·갤러리로 가는 추가 카드 — 이전 목업에서 검토했으나 이번 범위에 넣지 않음.
- 히어로 사진, 스탯바, 상단 네비 — 변경 없음.
- 카드 배경 사진/그라데이션 — 이전에 시도 후 폐기, 되살리지 않음.

## 테스트

- `tests/content.test.mjs`: 카피 4줄의 텍스트가 히어로 블록 안에 존재하는지, 카드 4개의 설명 문구가 각각 존재하는지, "서부지역 마지막 마크힐"이 여전히 히어로에 없는지 검증.
- 애니메이션 자체는 라이브 브라우저(Playwright)로 검증: 로드 후 카피/설명이 `opacity: 1`에 도달하는지, 호버 시 색이 `--accent`로 바뀌는지, reduced-motion 에뮬레이션에서 즉시 보이는지.
- 별도 pure-logic 유닛 테스트는 만들지 않는다 — 어절 분할은 `split(/\s+/)` 한 줄이라 추출할 순수 함수가 없음(YAGNI).

## 자체 검토

- 플레이스홀더 스캔: 없음.
- 정직성: 카피와 카드 설명 모두 페이지 내 기존 사실에 근거, 출처를 표에 명시. 금지 문구 제외 사유 기재.
- 내부 일관성: 등장 애니메이션의 1240ms 시작 시점이 카피 길이(11어절 × 60ms + 600ms)와 일치.
- 스코프: 히어로 오른쪽 컬럼 하나에 국한, 단일 플랜으로 처리 가능.
- 모호성: 애니메이션 대상/비대상, 어절 분할 방식(HTML vs JS), reduced-motion 처리를 모두 명시.
