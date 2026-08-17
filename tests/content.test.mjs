import { test } from 'node:test';
import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';

const requiredImages = [
  'images/hero-living-3cha.jpg',
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
  'images/6cha-rooftop.jpg',
  'images/6cha-location.jpg',
  'images/6cha-siteplan.jpg',
];

test('all curated site photos exist in images/', () => {
  for (const path of requiredImages) {
    assert.ok(existsSync(path), `missing ${path}`);
  }
});

const html = readFileSync('index.html', 'utf8');

test('the six non-hero sections use id, not the old data-chapter router attribute', () => {
  for (const id of ['overview', 'location', 'types', 'premium', 'history', 'gallery', 'contact']) {
    assert.ok(html.includes(`id="${id}"`), `expected id="${id}"`);
  }
  // The hero section hasn't been rebuilt yet in this task — it still carries
  // data-chapter="intro" until Task 3 replaces it.
  const dataChapterMatches = [...html.matchAll(/data-chapter="([^"]+)"/g)].map((m) => m[1]);
  assert.deepEqual(dataChapterMatches, ['intro']);
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
  // Note: the old 8-button nav still has data-nav-target="overview" at this
  // point in the plan — it isn't rebuilt until Task 3 — so this assertion is
  // deliberately scoped to the history section only, not the whole page.
});

test('the only phone number on the page is 010-9347-1345', () => {
  const phoneMatches = html.match(/\b01[016789]-\d{3,4}-\d{4}\b/g) ?? [];
  for (const phone of phoneMatches) {
    assert.equal(phone, '010-9347-1345', `unexpected phone number ${phone}`);
  }
  assert.ok(phoneMatches.length > 0, 'expected at least one phone number on the page');
});

test('hero chapter shows the real 6cha headline facts', () => {
  assert.ok(html.includes('마크힐애월6차'));
  assert.ok(html.includes('하귀2리'));
  assert.ok(html.includes('20세대'));
  assert.ok(html.includes('아승공인중개사'));
  // The hero background photo is applied via CSS (background-image), not an
  // <img> tag, so its path lives in styles.css rather than index.html.
  const css = readFileSync('css/styles.css', 'utf8');
  assert.ok(css.includes('images/hero-living-3cha.jpg'));
});

test('history chapter covers all 6 phases with real facts', () => {
  assert.ok(html.includes('18세대(3개동)'));
  assert.ok(html.includes('23세대(4개동)'));
  assert.ok(html.includes('제주사회복지공동모금회'));
  assert.ok(html.includes('보이드 구조'));
  assert.ok(html.includes('2025.7.17'));
  assert.ok(html.includes('옥탑 선셋라운지'));
});

test('overview chapter states the official project facts', () => {
  assert.ok(html.includes('하귀2리 2089번지'));
  assert.ok(html.includes('84타입 20세대'));
  assert.ok(html.includes('2026년 10월 샘플하우스 오픈'));
  assert.ok(html.includes('2027년 7월 입주 예정'));
  assert.ok(html.includes('images/6cha-siteplan.jpg'));
});

test('premium chapter lists real 6cha amenities', () => {
  assert.ok(html.includes('2.93kw'));
  assert.ok(html.includes('선셋라운지'));
  assert.ok(html.includes('마크힐센터'));
  assert.ok(html.includes('images/6cha-rooftop.jpg'));
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

test('location chapter states the real education/living/view facts', () => {
  assert.ok(html.includes('하귀초등학교'));
  assert.ok(html.includes('귀일중학교'));
  assert.ok(html.includes('images/6cha-location.jpg'));
});

test('gallery chapter groups photos by phase and labels 5cha as a prior build', () => {
  for (const phase of ['1차', '2차', '3차', '4차', '5차']) {
    assert.ok(html.includes(`${phase} ·`), `missing gallery group label for ${phase}`);
  }
  assert.ok(html.includes('착공 전으로 실제 인테리어 사진이 아직 없습니다'));
});

test('contact chapter and footer only ever route to Aseung realty', () => {
  assert.ok(html.includes('아승공인중개사'));
  assert.ok(html.includes('안현정'));
  assert.ok(html.includes('50110-2019-00164'));
  assert.ok(!html.toLowerCase().includes('후기'));
  assert.ok(!html.includes('<form'));
});
