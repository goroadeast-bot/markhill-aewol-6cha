# 히어로 섹션 워크스루 영상 — 이미지 선별 & 프롬프트

5차(노형) 펜트하우스 실사진에서, 요청하신 "아일랜드 싱크대 → 좌측으로 회전 → 입구 → 거실 → 다이닝룸" 동선과 실제로 맞는 4장을 블로그 원본(펜트하우스 오픈 포스팅)에서 골랐습니다. 워터마크는 크롭으로 제거하고 톤을 사이트 톤에 맞춰 보정했습니다.

파일 위치: `docs/hero-video-frames/`

## 먼저 확인해 주실 점 (정직하게 말씀드리면)

이 4장은 **같은 카메라가 한 번에 돌면서 찍은 연속 샷이 아니라, 블로그용으로 따로따로 찍은 스틸 사진**입니다. 다만 원문 설명("거실과 대면하는 주방", "거실과 나란히 배치된 다이닝공간", "현관실에서 들어서 거실의 모습")을 근거로 실제 공간 배치상 **주방 ↔ 현관/거실 ↔ 다이닝이 하나의 오픈된 공간에서 이어진다**는 건 확인됐습니다. 그래서 순서와 내용은 정확하지만, AI 영상 툴이 이 4장을 보고 "완전히 매끄러운 한 번의 촬영"처럼 만들어낼 수 있는지는 툴 성능에 달려 있습니다.

**그래서 두 가지 방법을 같이 드립니다.** 1번(이어 붙이기)이 지금 나오는 영상 툴들 기준으로 훨씬 안정적으로 나옵니다. 2번(한 번에 통샷)은 되면 좋지만 안 될 수도 있는 도전적인 방법입니다.

---

## 방법 1 (권장) — 4개 짧은 클립을 만들어서 이어 붙이기

각 이미지를 시작 프레임으로 넣고, **그 공간 안에서의 카메라 움직임만** 요청합니다. 그런 다음 편집(컷 또는 짧은 디졸브)으로 4개를 이어 붙이면 "쭉 돌아보는" 느낌이 납니다.

### 클립 1 — `hero-video-01-island-sink.jpg` (시작)
```
Cinematic real estate walkthrough shot. Camera starts in a tight close-up on a modern kitchen faucet and marble island countertop, then slowly pulls back and pans left, revealing the full kitchen island, cabinetry, and a white marble staircase in the background. Smooth, slow, steady gimbal motion, warm natural daylight, luxury interior photography style, no people, no text.
```

### 클립 2 — `hero-video-02-kitchen-wide.jpg` (이어서)
```
Cinematic real estate walkthrough shot. Camera slowly pans left across a bright open kitchen with white cabinetry, a marble backsplash, and a floating staircase with glass railing, gradually turning to reveal an entryway beyond. Smooth, slow, steady gimbal motion, warm natural daylight, luxury interior photography style, no people, no text.
```

### 클립 3 — `hero-video-03-entrance-living.jpg` (이어서)
```
Cinematic real estate walkthrough shot. Camera slowly pans left from a marble-clad entry pillar into a bright double-height living room with sheer curtains and a wall-mounted TV, drifting gently forward. Smooth, slow, steady gimbal motion, warm natural daylight, luxury interior photography style, no people, no text.
```

### 클립 4 — `hero-video-04-dining.jpg` (마무리)
```
Cinematic real estate walkthrough shot. Camera continues panning left past a cream sofa, gently settling on a dining area with a pendant lamp and dining table framed by sheer curtains, coming to a smooth, calm stop. Smooth, slow, steady gimbal motion, warm natural daylight, luxury interior photography style, no people, no text.
```

**팁**: 4개 클립을 만든 뒤 컷 편집(또는 0.2~0.3초 크로스디졸브)으로 순서대로 붙이면 됩니다. 각 클립의 "다음 장면과 자연스럽게 이어질 방향(왼쪽)"으로 끝나도록 프롬프트에 이미 "pans left"를 넣어뒀습니다.

---

## 방법 2 (도전) — 한 번에 통샷으로 요청하기

툴이 여러 장의 참고 이미지(키프레임)를 순서대로 넣을 수 있다면, 4장을 그 순서 그대로 넣고 아래 프롬프트를 같이 주세요. 안 되면 방법 1로 돌아가시면 됩니다.

```
A single continuous cinematic real estate walkthrough shot, no cuts. The camera begins in close-up on a kitchen island faucet and marble countertop, then smoothly rotates left in one fluid motion — passing the kitchen and staircase, sweeping past a marble entry pillar, moving through a bright double-height living room, and finally settling on a dining table with a pendant lamp, where it comes to a gentle, steady stop. Continuous slow gimbal rotation throughout, consistent warm natural daylight, luxury Korean apartment interior, no people, no text, no jump cuts.
```

이미지를 한 장만 받는 툴이라면 `hero-video-01-island-sink.jpg`를 시작 프레임으로 넣고 이 프롬프트를 그대로 쓰시면 됩니다. 다만 이 경우 카메라가 사진에 없는 방(거실·다이닝)을 정확하게 "상상"해서 이어 붙여야 하므로, 실제 공간과 다르게 나올 위험이 방법 1보다 큽니다.

---

## 정리

| 클립 | 파일 | 내용 |
|---|---|---|
| 1 (시작) | `hero-video-01-island-sink.jpg` | 아일랜드 싱크대 클로즈업 |
| 2 | `hero-video-02-kitchen-wide.jpg` | 주방 전체 + 계단 |
| 3 | `hero-video-03-entrance-living.jpg` | 현관 기둥 → 거실 |
| 4 (끝) | `hero-video-04-dining.jpg` | 거실 → 다이닝 |

영상이 나오면 히어로 섹션에 어떻게 넣을지(배경 영상으로 풀스크린 재생 / 루프 여부 / 모바일 대응 등)는 그때 다시 목업으로 확인하고 진행하겠습니다.
