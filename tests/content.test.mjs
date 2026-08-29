import { test } from 'node:test';
import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';

const requiredImages = [
  'images/history-1cha.jpg',
  'images/history-2cha.jpg',
  'images/history-3cha.jpg',
  'images/history-4cha.jpg',
  'images/history-5cha-penthouse.jpg',
  'images/gallery-1cha-02.jpg',
  'images/gallery-2cha-02.jpg',
  'images/gallery-3cha-02.jpg',
  'images/gallery-4cha-02.jpg',
  'images/gallery-5cha-02.jpg',
  'images/gallery-bento-1cha-01.jpg',
  'images/gallery-bento-1cha-02.jpg',
  'images/gallery-bento-1cha-03.jpg',
  'images/gallery-bento-1cha-04.jpg',
  'images/gallery-bento-1cha-05.jpg',
  'images/gallery-bento-1cha-06.jpg',
  'images/gallery-bento-1cha-07.jpg',
  'images/gallery-bento-1cha-08.jpg',
  'images/gallery-bento-1cha-09.jpg',
  'images/gallery-bento-1cha-10.jpg',
  'images/gallery-bento-1cha-11.jpg',
  'images/gallery-bento-1cha-12.jpg',
  'images/gallery-bento-1cha-13.jpg',
  'images/gallery-bento-1cha-14.jpg',
  'images/gallery-bento-2cha-01.jpg',
  'images/gallery-bento-2cha-02.jpg',
  'images/gallery-bento-2cha-03.jpg',
  'images/gallery-bento-2cha-04.jpg',
  'images/gallery-bento-2cha-05.jpg',
  'images/gallery-bento-2cha-06.jpg',
  'images/gallery-bento-2cha-07.jpg',
  'images/gallery-bento-2cha-08.jpg',
  'images/gallery-bento-2cha-09.jpg',
  'images/gallery-bento-2cha-10.jpg',
  'images/gallery-bento-2cha-11.jpg',
  'images/gallery-bento-2cha-12.jpg',
  'images/gallery-bento-2cha-13.jpg',
  'images/gallery-bento-2cha-14.jpg',
  'images/gallery-bento-3cha-01.jpg',
  'images/gallery-bento-3cha-02.jpg',
  'images/gallery-bento-3cha-03.jpg',
  'images/gallery-bento-3cha-04.jpg',
  'images/gallery-bento-3cha-05.jpg',
  'images/gallery-bento-3cha-06.jpg',
  'images/gallery-bento-3cha-07.jpg',
  'images/gallery-bento-3cha-08.jpg',
  'images/gallery-bento-3cha-09.jpg',
  'images/gallery-bento-3cha-10.jpg',
  'images/gallery-bento-3cha-11.jpg',
  'images/gallery-bento-3cha-12.jpg',
  'images/gallery-bento-3cha-13.jpg',
  'images/gallery-bento-3cha-14.jpg',
  'images/gallery-bento-4cha-01.jpg',
  'images/gallery-bento-4cha-02.jpg',
  'images/gallery-bento-4cha-03.jpg',
  'images/gallery-bento-4cha-04.jpg',
  'images/gallery-bento-4cha-05.jpg',
  'images/gallery-bento-4cha-06.jpg',
  'images/gallery-bento-4cha-07.jpg',
  'images/gallery-bento-4cha-08.jpg',
  'images/gallery-bento-4cha-09.jpg',
  'images/gallery-bento-4cha-10.jpg',
  'images/gallery-bento-4cha-11.jpg',
  'images/gallery-bento-4cha-12.jpg',
  'images/gallery-bento-4cha-13.jpg',
  'images/gallery-bento-4cha-14.jpg',
  'images/gallery-bento-5cha-01.jpg',
  'images/gallery-bento-5cha-02.jpg',
  'images/gallery-bento-5cha-03.jpg',
  'images/gallery-bento-5cha-04.jpg',
  'images/gallery-bento-5cha-05.jpg',
  'images/gallery-bento-5cha-06.jpg',
  'images/gallery-bento-5cha-07.jpg',
  'images/gallery-bento-5cha-08.jpg',
  'images/gallery-bento-5cha-09.jpg',
  'images/gallery-bento-5cha-10.jpg',
  'images/gallery-bento-5cha-11.jpg',
  'images/gallery-bento-5cha-12.jpg',
  'images/gallery-bento-5cha-13.jpg',
  'images/gallery-bento-5cha-14.jpg',
  'images/rooftop-01-lounge.jpg',
  'images/rooftop-02-night.jpg',
  'images/rooftop-03-pet.jpg',
  'images/rooftop-04-yoga.jpg',
  'images/6cha-location.jpg',
  'images/6cha-siteplan.jpg',
  'images/icon-overview.jpeg',
  'images/icon-location.jpeg',
  'images/icon-price.jpeg',
  'images/icon-premium.jpeg',
  'images/location-edu-1.jpg',
  'images/location-edu-2.jpg',
  'images/location-life-1.jpg',
  'images/location-life-2.jpg',
  'images/location-view-1.jpg',
  'images/location-view-2.jpg',
  'images/premium-01-solar.jpg',
  'images/premium-02-kitchen.jpg',
  'images/premium-03-door.jpg',
  'images/premium-04-sprinkler.jpg',
  'images/premium-05-center.jpg',
  'images/premium-06-bath.jpg',
  'images/history-modal-1cha-living.jpg',
  'images/history-modal-1cha-kitchen.jpg',
  'images/history-modal-1cha-dining.jpg',
  'images/history-modal-1cha-master.jpg',
  'images/history-modal-2cha-living.jpg',
  'images/history-modal-2cha-kitchen.jpg',
  'images/history-modal-2cha-dining.jpg',
  'images/history-modal-2cha-master.jpg',
  'images/history-modal-4cha-living.jpg',
  'images/history-modal-4cha-kitchen.jpg',
  'images/history-modal-4cha-dining.jpg',
  'images/history-modal-4cha-master.jpg',
  'images/history-modal-5cha-living.jpg',
  'images/history-modal-5cha-kitchen.jpg',
  'images/history-modal-5cha-dining.jpg',
  'images/history-modal-5cha-master.jpg',
];

test('all curated site photos exist in images/', () => {
  for (const path of requiredImages) {
    assert.ok(existsSync(path), `missing ${path}`);
  }
});

const html = readFileSync('index.html', 'utf8');

test('no section uses the old data-chapter router attribute anymore', () => {
  for (const id of ['overview', 'location', 'types', 'premium', 'history', 'gallery', 'contact']) {
    assert.ok(html.includes(`id="${id}"`), `expected id="${id}"`);
  }
  assert.ok(!html.includes('data-chapter='), 'data-chapter should be fully removed');
  assert.ok(!html.includes('data-nav-target='), 'data-nav-target should be fully removed');
});

test('the top nav has exactly 4 links pointing to sections that exist exactly once', () => {
  const navBlock = html.match(/<ul class="chapter-nav-list">[\s\S]*?<\/ul>/)[0];
  const navTargets = [...navBlock.matchAll(/href="#([^"]+)"/g)].map((m) => m[1]);
  assert.deepEqual(navTargets, ['sale', 'history', 'gallery', 'contact']);
  for (const id of navTargets) {
    const idMatches = html.match(new RegExp(`id="${id}"`, 'g')) ?? [];
    assert.equal(idMatches.length, 1, `expected exactly one element with id="${id}"`);
  }
});

test('scroll-to-hero button exists, links to the real hero heading, and has an accessible label', () => {
  assert.ok(html.includes('id="scrollTopBtn"'), 'expected id="scrollTopBtn"');
  assert.ok(html.includes('class="scroll-top-btn"'), 'expected class="scroll-top-btn"');
  const btnBlock = html.match(/<a[^>]*id="scrollTopBtn"[^>]*>/)?.[0];
  assert.ok(btnBlock, 'expected a single <a> tag carrying id="scrollTopBtn"');
  assert.ok(btnBlock.includes('href="#hero-title"'), 'button must link to #hero-title');
  assert.ok(btnBlock.includes('aria-label="맨 위로 이동"'), 'button must have an accessible label');
  const heroTitleMatches = html.match(/id="hero-title"/g) ?? [];
  assert.equal(heroTitleMatches.length, 1, 'expected exactly one element with id="hero-title"');
});

test('the hero quick-nav cards point to the 4 real subsections, each existing exactly once', () => {
  const heroCardsBlock = html.match(/<nav class="hero-cards"[\s\S]*?<\/nav>/)[0];
  const cardTargets = [...heroCardsBlock.matchAll(/href="#([^"]+)"/g)].map((m) => m[1]);
  assert.deepEqual(cardTargets, ['overview', 'location', 'types', 'premium']);
  for (const id of cardTargets) {
    const idMatches = html.match(new RegExp(`id="${id}"`, 'g')) ?? [];
    assert.equal(idMatches.length, 1, `expected exactly one element with id="${id}"`);
  }
});

test('hero section shows the real 6cha facts, the corrected sale price, and no invented tagline', () => {
  const heroBlock = html.match(/<section class="hero-split"[\s\S]*?<\/section>/)[0];
  assert.ok(heroBlock.includes('마크힐 애월6차'));
  assert.ok(heroBlock.includes('하귀2리'));
  assert.ok(heroBlock.includes('84타입 20세대'));
  assert.ok(heroBlock.includes('4.48억'));
  assert.ok(heroBlock.includes('5.13억'));
  assert.ok(!heroBlock.includes('4.58억'), 'the mockup typo price must not end up in the real page');
  assert.ok(!heroBlock.includes('서부지역 마지막 마크힐'), 'hero copy must not include the removed tagline');
  assert.ok(html.includes('서부지역 마지막 마크힐'), 'the phrase must still appear as a documented fact in the history timeline');
  assert.ok(heroBlock.includes('src="images/history-5cha-penthouse.jpg"'));
  assert.ok(heroBlock.includes('5차 노형'), 'the reused hero photo must be labeled as a 5cha reference photo, not implied as 6cha');
});

test('nav CTA reads "분양상담" and dials the real phone number; the redundant hero consult button is gone', () => {
  const navCta = html.slice(html.indexOf('class="btn btn-accent chapter-nav-cta"'), html.indexOf('</nav>'));
  assert.ok(navCta.includes('href="tel:010-9347-1345"'), '내비 CTA는 실제 번호로 연결되어야 함');
  assert.ok(navCta.includes('분양상담'));
  assert.ok(navCta.includes('<svg'), 'B안 — 전화 아이콘이 붙어 있어야 함');
  assert.ok(!html.includes('hero-consult-link'), 'the duplicate hero consult button should be removed');
  assert.ok(!html.includes('hero-head-row'), 'the now-single-child wrapper row should be removed');
  const heroTitleMatches = html.match(/id="hero-title"/g) ?? [];
  assert.equal(heroTitleMatches.length, 1, 'the hero wordmark heading must still exist exactly once');
});

test('the 애월6차분양 subsections appear in the order 개요→입지→타입&가격→프리미엄, wrapped in #sale', () => {
  const saleGroupMatch = html.match(/<div class="sale-group" id="sale">([\s\S]*?)<\/div>\s*\n\s*<section/);
  assert.ok(saleGroupMatch, 'expected a <div class="sale-group" id="sale"> wrapping the four subsections');
  const saleGroupInner = saleGroupMatch[1];
  const idsInGroup = [...saleGroupInner.matchAll(/<section class="chapter" id="([^"]+)"/g)].map((m) => m[1]);
  assert.deepEqual(idsInGroup, ['overview', 'location', 'types', 'premium']);
});

test('the history 6cha card links to #overview instead of using the old router attribute', () => {
  const historyBlock = html.match(/<section class="chapter" id="history"[\s\S]*?<\/section>/)[0];
  assert.ok(historyBlock.includes('href="#overview"'));
  assert.ok(!historyBlock.includes('data-nav-target'));
});

test('the only phone number on the page is 010-9347-1345', () => {
  const phoneMatches = html.match(/\b01[016789]-\d{3,4}-\d{4}\b/g) ?? [];
  for (const phone of phoneMatches) {
    assert.equal(phone, '010-9347-1345', `unexpected phone number ${phone}`);
  }
  assert.ok(phoneMatches.length > 0, 'expected at least one phone number on the page');
});

test('hero chapter shows the real 6cha headline facts', () => {
  assert.ok(html.includes('마크힐 애월6차'));
  assert.ok(html.includes('하귀2리'));
  assert.ok(html.includes('20세대'));
  assert.ok(html.includes('아승공인중개사'));
});

test('history chapter covers all 6 phases with real facts', () => {
  assert.ok(html.includes('<em>18세대</em> · 3개동'));
  assert.ok(html.includes('<em>23세대</em> · 4개동'));
  assert.ok(html.includes('제주사회복지공동모금회'));
  assert.ok(html.includes('보이드 구조'));
  assert.ok(html.includes('2025.7.17'));
  assert.ok(html.includes('옥탑 선셋라운지'));
});

test('history timeline pairs each phase with its real year, place, and photo', () => {
  const historyBlock = html.match(/<section class="chapter" id="history"[\s\S]*?<\/section>/)[0];
  const items = [...historyBlock.matchAll(/<article class="htl-item[^"]*"\s+data-year="([^"]+)"\s+data-place="([^"]+)"\s+data-idx="([^"]+)"/g)];
  assert.equal(items.length, 6, 'expected exactly 6 timeline items');

  assert.deepEqual(
    items.map((m) => [m[1], m[2], m[3]]),
    [
      ['2020~21', '애월읍 상귀리', '01'],
      ['2022', '애월읍 상귀리', '02'],
      ['2022', '애월읍 상귀리', '03'],
      ['2023', '제주시 외도일동', '04'],
      ['2024~25', '노형동', '05'],
      ['2026~', '애월읍 하귀2리', '06'],
    ]
  );

  for (const img of [
    'images/history-1cha.jpg',
    'images/history-2cha.jpg',
    'images/history-3cha.jpg',
    'images/history-4cha.jpg',
    'images/history-5cha-penthouse.jpg',
    'images/rooftop-01-lounge.jpg',
  ]) {
    assert.ok(historyBlock.includes(`src="${img}"`), `expected ${img} in the history timeline`);
  }

  // 6차 keeps its CTA into the sale section
  assert.ok(historyBlock.includes('<a class="btn btn-accent" href="#overview">6차 자세히 보기</a>'));
});

test('history rail totals only the delivered phases (1~5차), excluding the unbuilt 6차', () => {
  const historyBlock = html.match(/<section class="chapter" id="history"[\s\S]*?<\/section>/)[0];
  assert.ok(historyBlock.includes('1~5차 누적 공급'), 'the total must be labelled as covering 1~5차 only');
  assert.ok(historyBlock.includes('<b>127세대</b>'), '18+23+26+12+48 = 127');
  // 6차's 20세대 must not be folded into the cumulative figure
  assert.ok(!historyBlock.includes('147세대'));
});

test('overview chapter states the official project facts', () => {
  assert.ok(html.includes('하귀2리 2089번지'));
  assert.ok(html.includes('84타입 20세대'));
  assert.ok(html.includes('2026년 10월 샘플하우스 오픈'));
  assert.ok(html.includes('2027년 7월 입주') && html.includes('예정'));
  assert.ok(html.includes('images/6cha-siteplan.jpg'));
});

test('premium chapter lists real 6cha amenities', () => {
  assert.ok(html.includes('2.93kw'));
  assert.ok(html.includes('선셋라운지'));
  assert.ok(html.includes('마크힐센터'));
});

test('rooftop bento grid has 4 real photos, a mask-reveal title, and a count-up stat tile', () => {
  const rooftopBlock = html.match(/<div class="rooftop-intro">[\s\S]*?<p class="rooftop-note"[\s\S]*?<\/p>/)[0];
  for (const img of [
    'images/rooftop-01-lounge.jpg',
    'images/rooftop-02-night.jpg',
    'images/rooftop-03-pet.jpg',
    'images/rooftop-04-yoga.jpg',
  ]) {
    assert.ok(rooftopBlock.includes(`src="${img}"`), `expected ${img} in the rooftop bento grid`);
  }
  const words = [...rooftopBlock.matchAll(/<span class="rt-word"><i[^>]*>([^<]+)<\/i><\/span>/g)].map((m) => m[1]);
  assert.deepEqual(words, ['옥탑', '전체를,', '주민에게']);
  assert.ok(rooftopBlock.includes('id="rooftopNum"'));
  assert.ok(rooftopBlock.includes('<p class="rooftop-note" id="rooftopNote">* 이해를 돕기 위한 <span class="rooftop-note-hl">참고용 이미지</span>입니다.</p>'));
});

test('types & pricing chapter carries the exact official figures and disclaimer', () => {
  assert.ok(html.includes('45,800'));
  assert.ok(html.includes('51,300'));
  assert.ok(html.includes('오션뷰(간섭없음)'));
  assert.ok(html.includes('2026.06.22 기준'));
  assert.ok(html.includes('변동될 수 있습니다'));
});

test('price table rows carry the exact 동/층/가격/조망 combination together, not just anywhere on the page', () => {
  const priceTableBlock = html.match(/<table class="price-table">[\s\S]*?<\/table>/)[0];
  const rows = [...priceTableBlock.matchAll(/<tr>[\s\S]*?<\/tr>/g)].map((m) => m[0]);

  const expectedRows = [
    { dong: '101동', floor: '1층', price: '45,800', view: '자연뷰(간섭없음)/한라산뷰(일부간섭)' },
    { dong: '101동', floor: '4층', price: '51,300', view: '자연뷰(간섭없음)/한라산뷰(일부간섭)' },
    { dong: '102동', floor: '1층', price: '44,800', view: '오션뷰(일부간섭)' },
    { dong: '102동', floor: '4층', price: '51,300', view: '오션뷰(간섭없음)' },
  ];

  for (const expected of expectedRows) {
    const matchingRow = rows.find((row) =>
      row.includes(`<td>${expected.dong}</td>`) &&
      row.includes(`>${expected.floor}</td>`) &&
      row.includes(`>${expected.price}</td>`) &&
      row.includes(expected.view)
    );
    assert.ok(
      matchingRow,
      `expected a price-table row with ${expected.dong}/${expected.floor}/${expected.price}/${expected.view} all together`
    );
  }
});

test('location chapter states the real education/living/view facts with full detail lists, a map, and 6 real photos', () => {
  const locationBlock = html.match(/<section class="chapter" id="location"[\s\S]*?<\/section>/)[0];
  assert.ok(locationBlock.includes('하귀초등학교'));
  assert.ok(locationBlock.includes('귀일중학교'));

  for (const img of [
    'location-edu-1.jpg', 'location-edu-2.jpg',
    'location-life-1.jpg', 'location-life-2.jpg',
    'location-view-1.jpg', 'location-view-2.jpg',
  ]) {
    assert.ok(locationBlock.includes(`images/${img}`), `expected images/${img} in the location section`);
  }

  for (const detail of [
    '하귀초등학교 후문 연계 학교상권 발전 가능',
    '일주서로',
    '시 외곽지역 주거지 조망권은 매우 중요한 요인',
  ]) {
    assert.ok(locationBlock.includes(detail), `expected detail text "${detail}"`);
  }

  for (const concl of [
    '유아부터 중등까지 교육여건 매우 우수',
    '자연환경과 생활편의 모두 가능한 입지',
    '바다와 자연 조망이 가능한 입지',
  ]) {
    assert.ok(locationBlock.includes(concl), `expected conclusion "${concl}"`);
  }

  assert.ok(locationBlock.includes('하귀2리 2089'), 'expected the real address in the map label');
  assert.ok(locationBlock.match(/<iframe[^>]*src="https:\/\/maps\.google\.com/), 'expected a Google Maps iframe');
});

test('gallery chapter has a bento row per phase (1-5차) plus the existing 6차 group, and labels 6차 as pre-construction', () => {
  const galleryBlock = html.match(/<section class="chapter" id="gallery"[\s\S]*?<\/section>/)[0];
  for (const phase of ['1차', '2차', '3차', '4차', '5차']) {
    assert.ok(galleryBlock.includes(`<b>${phase}</b>`), `missing bg-head label for ${phase}`);
  }
  assert.ok(galleryBlock.includes('6차 · 애월읍 하귀2리 · 착공 전'));
  assert.ok(galleryBlock.includes('착공 전으로 실제 인테리어 사진이 아직 없습니다'));
});

test('gallery bento has exactly 70 real photos (14 per phase, 1-5차) with cursor-driven auto-scroll and a click-to-enlarge modal', () => {
  const galleryBlock = html.match(/<section class="chapter" id="gallery"[\s\S]*?<\/section>/)[0];

  const phaseBlocks = [...galleryBlock.matchAll(/<div class="bg-phase">[\s\S]*?<\/div>\s*<div class="bg-track">/g)];
  assert.equal(phaseBlocks.length, 5, 'expected exactly 5 .bg-phase rows (1~5차)');

  for (let n = 1; n <= 5; n++) {
    const cells = [...galleryBlock.matchAll(new RegExp(`images/gallery-bento-${n}cha-\\d{2}\\.jpg`, 'g'))];
    assert.equal(cells.length, 14, `expected 14 photos for phase ${n}, got ${cells.length}`);
  }

  assert.ok(galleryBlock.includes('class="bg-edge bg-edge-l"'), 'expected a left auto-scroll edge indicator');
  assert.ok(galleryBlock.includes('class="bg-edge bg-edge-r"'), 'expected a right auto-scroll edge indicator');
  assert.ok(galleryBlock.includes('class="bg-track"'), 'expected a scroll-position progress track');

  assert.ok(galleryBlock.includes('id="bgModal"'));
  for (const id of ['bgImg', 'bgCapT', 'bgCapS', 'bgPrev', 'bgNext', 'bgClose']) {
    assert.ok(galleryBlock.includes(`id="${id}"`), `expected #${id} inside the gallery modal`);
  }
});

test('gallery bento JS wires up cursor-position auto-scroll and the enlarge modal', () => {
  const js = readFileSync('js/script.js', 'utf8');
  assert.ok(js.includes("document.getElementById('bgWrap')"));
  assert.ok(js.includes('scroller.scrollLeft'), 'expected the auto-scroll logic to drive scrollLeft');
  assert.ok(js.includes('openBentoModal'));
  assert.ok(js.includes("e.key === 'ArrowLeft'") && js.includes("e.key === 'ArrowRight'"), 'expected arrow-key navigation in the modal');
});

test('contact chapter and footer only ever route to Aseung realty', () => {
  assert.ok(html.includes('아승공인중개사'));
  assert.ok(html.includes('안현정'));
  assert.ok(html.includes('50110-2019-00164'));
  assert.ok(!html.toLowerCase().includes('후기'));
  assert.ok(!html.includes('<form'));
});

test('hero copy tells the real brand story and never repeats the banned tagline', () => {
  const heroBlock = html.match(/<section class="hero-split"[\s\S]*?<\/section>/)[0];
  const copyBlock = heroBlock.match(/<p class="hero-copy">[\s\S]*?<\/p>/)?.[0];
  assert.ok(copyBlock, 'expected a <p class="hero-copy"> block in the hero');
  for (const word of ['2020년', '애월에서', '시작해', '여섯', '번째,', '다시', '애월로.', '남건종합건설이', '짓고', '아승공인중개사가', '함께합니다.']) {
    assert.ok(copyBlock.includes(word), `expected copy to include "${word}"`);
  }
  const wordSpans = [...copyBlock.matchAll(/class="hero-copy-word"/g)];
  assert.equal(wordSpans.length, 11, 'expected exactly 11 hero-copy-word spans');
  assert.ok(!heroBlock.includes('서부지역 마지막 마크힐'), 'the banned tagline must not appear in the hero copy');
});

test('each hero card carries a one-line description grounded in real facts, plus an arrow', () => {
  const heroCardsBlock = html.match(/<nav class="hero-cards"[\s\S]*?<\/nav>/)[0];
  const cardBlocks = [...heroCardsBlock.matchAll(/<a class="hero-card reveal"[\s\S]*?<\/a>/g)].map((m) => m[0]);
  assert.equal(cardBlocks.length, 4, 'expected exactly 4 hero cards');

  const expectedDescriptions = [
    '84타입 20세대 · 근생 4실',
    '하귀초·귀일중 도보 통학',
    '4.48억~5.13억',
    '전세대 태양광 · 선셋라운지',
  ];
  cardBlocks.forEach((block, i) => {
    assert.ok(block.includes(`class="hero-card-desc"`), `card ${i} must have a hero-card-desc`);
    assert.ok(block.includes(expectedDescriptions[i]), `card ${i} must include "${expectedDescriptions[i]}"`);
    assert.ok(block.includes('class="hero-card-arrow"') && block.includes('›'), `card ${i} must have a hero-card-arrow with ›`);
  });
});

test('overview intro group wraps eyebrow, title, and spec table for the repeat-reveal animation', () => {
  const overviewBlock = html.match(/<section class="chapter" id="overview"[\s\S]*?<\/section>/)[0];
  const introMatch = overviewBlock.match(/<div class="overview-intro">([\s\S]*?)<\/div>\s*<div class="siteplan-block/);
  assert.ok(introMatch, 'expected a <div class="overview-intro"> wrapping the eyebrow/title/table');
  const introInner = introMatch[1];
  assert.ok(introInner.includes('class="eyebrow"'));
  assert.ok(introInner.includes('class="section-title"'));
  assert.ok(introInner.includes('class="spec-table"'));
});

test('the three overview selling points get highlight styling, other proper nouns get plain bold', () => {
  const overviewBlock = html.match(/<section class="chapter" id="overview"[\s\S]*?<\/section>/)[0];
  for (const phrase of ['84타입 20세대', '세대당 2.1대', '2027년 7월 입주']) {
    assert.ok(overviewBlock.includes(`<span class="spec-highlight">${phrase}</span>`), `expected "${phrase}" wrapped in spec-highlight`);
  }
  for (const phrase of ['남건종합건설㈜', '하귀2리 2089번지', '마크힐센터']) {
    assert.ok(overviewBlock.includes(`<span class="spec-strong">${phrase}</span>`), `expected "${phrase}" wrapped in spec-strong`);
  }
});

test('siteplan image sits inside a scaler wrapper and no longer uses the one-shot reveal class', () => {
  const overviewBlock = html.match(/<section class="chapter" id="overview"[\s\S]*?<\/section>/)[0];
  assert.ok(overviewBlock.includes('<div class="siteplan-block">'), 'siteplan-block must no longer carry the reveal class');
  assert.ok(!overviewBlock.includes('siteplan-block reveal'));
  assert.ok(overviewBlock.match(/<div class="siteplan-scaler">\s*<img src="images\/6cha-siteplan\.jpg"/), 'expected the siteplan img wrapped in a siteplan-scaler div');
});

test('page declares an explicit light color-scheme so mobile dark-mode browsers do not auto-darken photos', () => {
  assert.ok(html.includes('<meta name="color-scheme" content="light">'), 'expected a color-scheme meta tag in <head>');
  const css = readFileSync('css/styles.css', 'utf8');
  assert.ok(css.match(/:root\s*{\s*color-scheme:\s*light;/), 'expected `color-scheme: light` as the first declaration in :root');
});

test('types intro wraps only the eyebrow and title — the tables are untouched', () => {
  const typesBlock = html.match(/<section class="chapter" id="types"[\s\S]*?<\/section>/)[0];
  const introMatch = typesBlock.match(/<div class="types-intro">([\s\S]*?)<\/div>\s*<table class="area-table">/);
  assert.ok(introMatch, 'expected a <div class="types-intro"> wrapping the eyebrow/title, immediately followed by <table class="area-table">');
  const introInner = introMatch[1];
  assert.ok(introInner.includes('class="eyebrow"'));
  assert.ok(introInner.includes('class="section-title"'));
  assert.ok(!introInner.includes('<table'), 'the tables must not be inside .types-intro');
});

test('contract terms and event copy highlight the key figures with terms-hl spans', () => {
  const typesBlock = html.match(/<section class="chapter" id="types"[\s\S]*?<\/section>/)[0];
  const termsBlock = typesBlock.match(/<div class="terms-block">[\s\S]*?<\/div>/)[0];
  assert.ok(termsBlock.includes('<span class="terms-hl"><span class="terms-hl-num">5%</span>(계약)</span>'));
  assert.ok(termsBlock.includes('<span class="terms-hl"><span class="terms-hl-num">5%</span>(계약 1개월 후)</span>'));
  assert.ok(termsBlock.includes('<span class="terms-hl"><span class="terms-hl-num">90%</span>(소유권이전시)</span>'));
  assert.ok(termsBlock.includes('<span class="terms-hl">무상 제공</span>'));
});

test('premium section has 6 accordion panels with real photos and history-accurate badges', () => {
  const premiumBlock = html.match(/<section class="chapter" id="premium"[\s\S]*?<\/section>/)[0];
  const accItems = [...premiumBlock.matchAll(/<div class="acc-item">/g)];
  assert.equal(accItems.length, 6, 'expected exactly 6 .acc-item panels');

  for (const img of [
    'images/premium-01-solar.jpg',
    'images/premium-02-kitchen.jpg',
    'images/premium-03-door.jpg',
    'images/premium-04-sprinkler.jpg',
    'images/premium-05-center.jpg',
    'images/premium-06-bath.jpg',
  ]) {
    assert.ok(premiumBlock.includes(`src="${img}"`), `expected ${img} in the premium accordion`);
  }

  const newBadges = [...premiumBlock.matchAll(/<span class="is-new">([^<]+)<\/span>/g)].map((m) => m[1]);
  assert.deepEqual(newBadges, ['6차 신규', '6차 신규', '6차 강화'], 'solar and sprinkler are 6차 신규, 마크힐센터 is 6차 강화');
  const neutralBadges = [...premiumBlock.matchAll(/<div class="acc-badge"><span>([^<]+)<\/span><\/div>/g)].map((m) => m[1]);
  assert.deepEqual(neutralBadges, ['1차부터', '1차부터', '1차부터'], 'kitchen, door and bathtub have been present since 1차');
});

test('premium reference-image note is bold with a highlighted key phrase', () => {
  const premiumBlock = html.match(/<section class="chapter" id="premium"[\s\S]*?<\/section>/)[0];
  assert.ok(premiumBlock.includes('<p class="acc-note">* 이해를 돕기 위한 <span class="acc-note-hl">참고용 이미지</span>입니다.</p>'));
});

test('history timeline: exactly the 1~5차 cards are clickable (data-phase), 6차 is not', () => {
  const historyBlock = html.match(/<section class="chapter" id="history"[\s\S]*?<\/section>/)[0];
  const phased = [...historyBlock.matchAll(/data-phase="(\d)"/g)].map((m) => m[1]);
  assert.deepEqual(phased, ['1', '2', '3', '4', '5'], 'only phases 1-5 should carry data-phase');
  const sixthItem = historyBlock.match(/<article class="htl-item htl-item-now"[\s\S]*?<\/article>/)[0];
  assert.ok(!sixthItem.includes('data-phase'), '6차 card must not open the modal — it already has its own CTA');
  assert.ok(sixthItem.includes('6차 자세히 보기'));
});

test('history modal overlay markup exists with all required elements', () => {
  const historyBlock = html.match(/<section class="chapter" id="history"[\s\S]*?<\/section>/)[0];
  assert.ok(historyBlock.includes('id="hmOverlay"'));
  for (const id of ['hmPhoto', 'hmTag', 'hmTitle', 'hmSpecs', 'hmGallery', 'hmFeat', 'hmNote', 'hmClose']) {
    assert.ok(historyBlock.includes(`id="${id}"`), `expected #${id} inside the history modal`);
  }
});

test('history modal data (js/script.js) covers phases 1-5 with a 4-photo gallery each, and phase 3 discloses reusing phase 2 photos', () => {
  const js = readFileSync('js/script.js', 'utf8');
  const phasesBlock = js.match(/const HISTORY_PHASES = \{[\s\S]*?\n\};/)[0];
  for (const n of [1, 2, 3, 4, 5]) {
    assert.ok(phasesBlock.includes(`  ${n}: {`), `expected HISTORY_PHASES[${n}]`);
  }
  const galleryImages = [...phasesBlock.matchAll(/images\/history-modal-(\dcha)-(living|kitchen|dining|master)\.jpg/g)];
  assert.equal(galleryImages.length, 20, 'expected 4 gallery photos referenced across 5 phase entries (3차 reuses 2차 files)');
  assert.ok(phasesBlock.includes('galleryNote'), 'phase 3 should disclose that it reuses phase 2 photos');
});


test('promo popup script closes on CTA/backdrop/Escape and honors the dismiss-for-today flag', () => {
  const js = readFileSync('js/script.js', 'utf8');
  const block = js.match(/\/\/ Entry promo popup[\s\S]*$/)[0];
  assert.ok(block.includes("data-promo-close"), 'backdrop and 닫기 버튼으로 닫혀야 함');
  assert.ok(block.includes("data-promo-cta"), 'CTA 클릭 시 팝업이 닫혀야 함');
  assert.ok(block.includes("e.key === 'Escape'"));
  assert.ok(block.includes('markhill.promoDismissedUntil'));
  assert.ok(!/preventDefault\(\)/.test(block), '팝업 스크립트는 tel: 기본 동작을 막지 않아야 함');
});
test('entry promo popup: 모델하우스 오픈이 메인, 아승공인중개사 표기는 하단', () => {
  const popup = html.match(/<div class="promo-popup" id="promoPopup"[\s\S]*?\n<\/div>/)[0];
  assert.ok(popup.includes('role="dialog"') && popup.includes('aria-modal="true"'));

  // 히어로(메인) — 배경 사진 + 모델하우스 오픈
  const hero = popup.match(/<header class="promo-hero">[\s\S]*?<\/header>/)[0];
  assert.ok(hero.includes('images/promo-bg-4cha-living.jpg'), '4차 애월 거실 사진이 배경이어야 함');
  assert.ok(existsSync('images/promo-bg-4cha-living.jpg'), '팝업 배경 이미지 파일이 존재해야 함');
  assert.match(hero, /모델하우스/);
  assert.match(hero, /OPEN/);
  assert.match(hero, /2026\. 10/);

  // 혜택
  const head = popup.slice(popup.indexOf('<div class="promo-benefits-head">'), popup.indexOf('<ul class="promo-benefit-list">'));
  assert.match(head, /모델하우스 오픈 전 계약 시 <b>한정 혜택<\/b>/);
  assert.ok(head.includes('class="promo-blink"'), '한정 혜택 배너에 점멸 인디케이터가 있어야 함');
  assert.match(popup, /TV · 세탁기 &amp; 건조기 증정/);
  assert.match(popup, /줄눈 시공 및 전문 입주 청소 무상/);

  // 하단 — 중개보수 0원 + 아승공인중개사 사인
  const info = popup.match(/<div class="promo-info">[\s\S]*?\n    <\/div>/)[0];
  assert.match(info, /마크힐은, <b>아승공인중개사<\/b>입니다/);
  assert.ok(!/중개보수|0원|직거래/.test(popup), '중개보수 0원 안내는 팝업에서 제외됨');
  assert.match(info, /분양대행 아승공인중개사/);
  assert.ok(popup.indexOf(hero) < popup.indexOf(info), '모델하우스 오픈 블록이 중개보수 블록보다 위에 있어야 함');

  const cta = popup.match(/<a class="promo-cta"[^>]*>/)[0];
  assert.ok(cta.includes('href="tel:010-9347-1345"'), '방문예약 버튼은 전화로 바로 연결되어야 함');
  assert.ok(cta.includes('data-promo-cta'));
  assert.ok(popup.includes('id="promoDismissToday"'), '오늘 하루 보지 않기 체크박스');
});

test('promo popup CSS: 한정 혜택 배너는 크게 강조되고 점멸하며, 모션 최소화 설정에서는 멈춘다', () => {
  const css = readFileSync('css/styles.css', 'utf8');
  const label = css.match(/\.promo-benefits-label \{[\s\S]*?\}/)[0];
  assert.match(label, /font-size: clamp\(14px, 4vw, 15\.5px\)/, '기존 12.5px보다 크게');
  assert.match(label, /font-weight: 800/);
  assert.ok(css.includes('@keyframes promoBlink'), '점멸 애니메이션');
  assert.ok(css.includes('@keyframes promoBannerPulse'), '배너 강조 애니메이션');
  const reduced = css.slice(css.lastIndexOf('@media (prefers-reduced-motion: reduce)'));
  assert.match(reduced, /\.promo-benefits-head, \.promo-blink \{ animation: none !important; \}/);
});

test('hero A-1: 사진 위 문구 · 와이프 오픈 · 오른쪽 본문은 그대로', () => {
  const photo = html.slice(html.indexOf('<div class="hero-photo-panel">'), html.indexOf('<div class="hero-content-panel">'));
  assert.ok(photo.includes('class="hero-photo-clip"'), '사진은 클립 래퍼 안에 있어야 와이프 오픈이 가능');
  assert.ok(photo.includes('images/history-5cha-penthouse.jpg'));
  const tagAt = photo.indexOf('hero-photo-tag');
  const overAt = photo.indexOf('hero-photo-over');
  assert.ok(tagAt > -1 && overAt > -1 && tagAt < overAt, '시공 사례 라벨과 사진 위 문구가 모두 있어야 함');
  assert.match(photo, /<i>마크힐은,<\/i>/);
  assert.match(photo, /<span class="accent">마크힐<\/span>을 아는 곳에서/);
  assert.ok(photo.includes('hero-over-rule'), '액센트 선');
  assert.match(photo, /1차부터 함께한 <b>아승공인중개사<\/b>/);

  // A-1은 오른쪽 본문을 줄이지 않고 그대로 둔다 (A-2와의 차이)
  const copy = html.slice(html.indexOf('<p class="hero-copy">'), html.indexOf('</p>', html.indexOf('<p class="hero-copy">')));
  assert.match(copy, /남건종합건설이/);
  assert.match(copy, /아승공인중개사가/);
  assert.match(copy, /함께합니다/);

  assert.ok(html.includes('<span class="w"><i>마크힐 애월6차</i></span><span class="w accent"><i>분양</i></span>'), '워드마크 마스크 구조');
});

test('hero A-1 모션: 켄번즈 · 와이프 · 문구 지연시간, 그리고 모션 최소화 대응', () => {
  const css = readFileSync('css/styles.css', 'utf8');
  assert.ok(css.includes('@keyframes heroKenBurns'), '켄번즈 줌');
  assert.match(css, /\.hero-split\.is-in \.hero-photo-clip \{ clip-path: inset\(0 0 0 0\); transition: clip-path 1\.05s/);
  assert.match(css, /\.hero-over-line:nth-of-type\(1\) i \{ transition-delay: 0\.92s; \}/);
  assert.match(css, /\.hero-over-line:nth-of-type\(2\) i \{ transition-delay: 1\.06s; \}/);
  assert.match(css, /\.hero-over-rule \{ width: 46px; transition: width 0\.55s cubic-bezier\(0\.19, 1, 0\.22, 1\) 1\.42s; \}/);

  const js = readFileSync('js/script.js', 'utf8');
  assert.ok(js.includes("heroSplit?.classList.add('is-in')"), '진입 시 is-in 을 붙여 애니메이션을 시작');
  assert.ok(js.includes("document.addEventListener('promo:done', startHeroEntrance"), '팝업이 닫힌 뒤에 히어로 시퀀스가 시작되어야 함');
  assert.ok(js.includes('updateHeroParallax'), '스크롤 패럴랙스');
  assert.ok(js.includes('heroPhotoImg.style.translate'), '켄번즈 transform 과 겹치지 않도록 translate 사용');
});
