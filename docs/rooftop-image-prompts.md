# 옥탑공간 섹션 이미지 4장 — 구글 플로우 프롬프트

A안(에디토리얼 벤토그리드)에 들어갈 이미지입니다. 2.93kw 수치 타일은 색면이라 이미지가 필요 없습니다.

## 비율 — 타일마다 다릅니다

| # | 타일 | 비율 | 파일명 |
|---|---|---|---|
| 01 | 선셋라운지 (큰 타일) | **1:1 정사각** | `images/rooftop-01-lounge.jpg` |
| 02 | 야간 경관조명 | **3:2 가로** | `images/rooftop-02-night.jpg` |
| 03 | 펫플레이그라운드 | **3:2 가로** | `images/rooftop-03-pet.jpg` |
| 04 | 요가&스트레칭존 | **3:2 가로** | `images/rooftop-04-yoga.jpg` |

## [공통 스타일] — 4장 모두에 붙일 것

```
Editorial architectural photography of a rooftop amenity deck on a low-rise premium residential building on Jeju Island, Korea. Warm neutral palette of cream, pale concrete, warm oak decking and charcoal metal. Calm, minimal, uncluttered styling. Shot on a full-frame camera at 28mm, natural color grading, realistic materials. High-end Korean premium residential magazine quality. In the far background, a soft horizon of the sea and low volcanic hills. No people, no text, no lettering, no signage, no logos, no watermark.
```

> **중요**: 4장이 한 세트로 보이는 게 가장 중요합니다. 위 블록을 4개 프롬프트 전부에 그대로 붙이고, 주제부(앞부분)만 다르게 두시면 톤·조명·색감이 통일됩니다.

---

## 01. 선셋라운지 — 1:1 정사각 (가장 중요, 큰 타일)

```
A rooftop sunset lounge at golden hour. Overhead, a row of dark solar panels forms a sleek architectural pergola canopy on slim charcoal steel columns, casting long striped shadows across a pale concrete deck. Beneath the canopy, a built-in bench of warm oak slats faces outward toward a glowing orange sunset over the sea. Low planters with ornamental grasses at the edges. The composition is centered and square, with the canopy structure framing the sunset view.

[공통 스타일 붙이기]
```

## 02. 야간 경관조명 — 3:2 가로

```
The same rooftop deck at blue hour, just after sunset. Warm linear LED strips are recessed along the underside of the solar pergola beams and low along the planter edges, washing the pale concrete deck with soft pools of warm light. A strip of manicured lawn glows softly. The deep blue night sky and distant scattered town lights sit low on the horizon. Long, calm, cinematic wide composition.

[공통 스타일 붙이기]
```

## 03. 펫플레이그라운드 — 3:2 가로

```
A compact rooftop pet playground on the same deck. Bright artificial lawn turf, two or three simple rounded agility tunnels and a low hurdle in muted sage green, a small water bowl station, and a low charcoal metal safety fence along the perimeter. Clear bright daytime sky with a few soft clouds. Tidy and minimal — a considered design amenity, not a cluttered dog park.

[공통 스타일 붙이기]
```

## 04. 요가&스트레칭존 — 3:2 가로

```
A rooftop yoga and stretching deck on the same building. Warm oak deck boards laid in long straight lines, with four or five yoga mats in muted sage and grey laid out neatly in a row. Large charcoal planters with tall ornamental grasses frame both sides. A partial view of the solar pergola structure at the top edge of the frame. Bright soft midday daylight, open sky, sea horizon in the distance.

[공통 스타일 붙이기]
```

---

## 참고

- 4장 모두 **같은 옥상**처럼 보여야 합니다. 프롬프트에 "the same rooftop deck"을 넣어둔 이유입니다. 결과가 서로 다른 건물처럼 나오면, 01번을 먼저 확정한 뒤 나머지 3장을 01번 이미지 참조(reference)로 걸어서 생성하시면 톤이 잡힙니다.
- 실제 6차 시공 사진이 아니므로 섹션 하단에 **"* 이해를 돕기 위한 참고용 이미지입니다."** 문구를 유지합니다.
- 계획서에 이름이 적힌 시설은 **펫플레이그라운드 · 요가&스트레칭존 · 선셋라운지** 셋뿐이라 그 외 시설(옥외 운동기구 등)은 만들지 않았습니다. 실제로 들어가는 시설이 더 있으면 알려주시면 추가하겠습니다.
- 파일명은 위 표대로 `images/` 폴더에 넣어주시면 그대로 반영하겠습니다.
