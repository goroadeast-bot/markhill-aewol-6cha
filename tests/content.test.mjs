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
  'images/6cha-rooftop.jpg',
  'images/6cha-location.jpg',
  'images/6cha-siteplan.jpg',
  'images/icon-overview.jpeg',
  'images/icon-location.jpeg',
  'images/icon-price.jpeg',
  'images/icon-premium.jpeg',
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
  assert.ok(html.includes('class="btn btn-accent chapter-nav-cta" href="tel:010-9347-1345">분양상담</a>'));
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
