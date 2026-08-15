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

test('every fixed-nav target matches a real chapter section', () => {
  const navBlock = html.match(/<nav class="chapter-nav"[\s\S]*?<\/nav>/)[0];
  const navTargets = [...navBlock.matchAll(/data-nav-target="([^"]+)"/g)].map((m) => m[1]);
  const chapterIds = [...html.matchAll(/data-chapter="([^"]+)"/g)].map((m) => m[1]);
  assert.deepEqual(navTargets, chapterIds);
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

test('location chapter states the real education/living/view facts', () => {
  assert.ok(html.includes('하귀초등학교'));
  assert.ok(html.includes('귀일중학교'));
  assert.ok(html.includes('images/6cha-location.jpg'));
});
