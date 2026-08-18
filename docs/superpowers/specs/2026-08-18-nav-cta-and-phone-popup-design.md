# 네비 CTA 정리 + 전화번호 팝업(아승부동산 방식) — 스펙

## 배경

`2026-08-18-scroll-to-hero-button-design.md`로 스크롤 버튼을 추가한 뒤, 실제 크롬에서 확인한 사용자가 4가지를 지적했다: (1) 상단 고정 네비의 "전화 상담" 버튼과 히어로 안의 "분양상담" 버튼이 중복, (2) 브라우저 기본 스크롤바 화살표가 버튼 옆에 거슬리게 보임, (3) "분양상담" 클릭 시 자매 사이트(아승부동산, `d:/claude_homepage`)처럼 데스크톱에서는 전화번호 팝업이, 모바일에서는 바로 전화 연결이 되길 원함.

아승부동산 사이트(`d:/claude_homepage/js/script.js:562-621`)의 실제 구현을 확인했다: `isMobileDevice()`(UA로 Android/iPhone/iPad/iPod/Windows Phone 감지) + 페이지의 모든 `a[href^="tel:"]` 링크에 클릭 리스너를 걸어, 데스크톱이면 `preventDefault()`하고 기존 `#phoneModal`을 열고, 모바일이면 기본 동작(전화 앱 연결)을 그대로 둔다. 이 프로젝트에도 동일한 `#phoneModal`/`.phone-modal-*` 마크업과 CSS가 이미 있으므로(`index.html:339-349`, `css/styles.css`의 `.phone-modal*` 규칙), 새 모달을 만들 필요 없이 이 클릭 가로채기 로직만 추가하면 된다.

## 변경 1 — 네비 CTA 텍스트 변경, 히어로 중복 버튼 삭제

- `index.html:24`의 `.chapter-nav-cta` 텍스트를 "전화 상담" → "분양상담"으로 변경 (href는 그대로 `tel:010-9347-1345` 유지 — 변경 2의 클릭 가로채기가 이 href를 보고 동작함).
- `index.html:38`의 `.hero-consult-link`(히어로 안의 "분양상담" 버튼) 전체 삭제. 이를 감싸던 `.hero-head-row`(`div`, `flex; justify-content:space-between`) 래퍼도 함께 제거하고 `.hero-wordmark`(h1)를 `.hero-content-panel`의 직계 자식으로 승격 — 자식이 하나뿐인 flex 래퍼를 남겨두지 않는다(YAGNI).
- `css/styles.css`에서 `.hero-head-row`, `.hero-consult-link`, `.hero-consult-link:hover` 규칙 삭제(더 이상 쓰이지 않음).

## 변경 2 — 스크롤바 화살표 버튼 숨김

`css/styles.css`에 전역 규칙 1개 추가:

```css
::-webkit-scrollbar-button { display: none; }
```

`::-webkit-scrollbar`(트랙/썸)는 별도로 정의하지 않는다 — 정의하는 순간 Chrome이 전체 스크롤바 렌더링을 커스텀 모드로 전환해 스타일링 범위가 커지므로(스코프 밖), 버튼(화살표)만 targeted하게 숨긴다. 이 스펙에서 다루지 않는 범위: 스크롤바 트랙/썸 색상 재디자인.

## 변경 3 — 전화번호 팝업(디바이스 분기)

`js/script.js`에 아승부동산과 동일한 로직 추가:

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

기존 `phoneModal`(이미 선언됨) 변수를 재사용한다. 기존 `[data-open-phone-modal]` 클릭 리스너(연락처 섹션의 "전화 상담하기" 버튼용, `<button>`이라 `tel:` 셀렉터에 안 걸림)는 그대로 둔다 — 이 변경과 겹치지 않는 별개 트리거이며 손대지 않는다(스코프 밖).

이 로직을 붙이면 `phoneLinks`에 걸리는 3개 링크(`.chapter-nav-cta`, `.phone-modal-number` 자기 자신) 모두 데스크톱에서 모달을 연다 — `.phone-modal-number`는 이미 열려있는 모달 안의 링크이므로 재클릭해도 그냥 같은 모달이 유지될 뿐 부작용 없음(아승부동산 실제 구현도 이 링크를 배제하지 않고 동일하게 동작).

## 스코프 밖

- 연락처 섹션(`#contact`)의 "전화 상담하기" 버튼(`data-open-phone-modal`) — 이미 항상 모달을 여는 의도된 동작, 변경하지 않음.
- 스크롤바 트랙/썸 색상 재디자인 — 화살표 버튼만 숨김.
- 푸터의 전화번호(`footer-detail`)는 원래 링크가 아닌 일반 텍스트라 영향 없음.

## 자체 검토

- 플레이스홀더 스캔: 없음.
- 내부 일관성: `.chapter-nav-cta`의 href(`tel:010-9347-1345`)는 유지되므로 "the only phone number on the page is 010-9347-1345" 기존 테스트와 충돌 없음.
- 스코프: 3개의 독립적이지만 작은 변경 — 별도 분해 없이 하나의 플랜으로 처리 가능.
- 모호성: 없음 — 참고 사이트의 실제 코드를 확인해 반영.
