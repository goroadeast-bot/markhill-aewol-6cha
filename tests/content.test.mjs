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

test('every chapter nav target matches a real chapter section', () => {
  const navTargets = [...html.matchAll(/data-nav-target="([^"]+)"/g)].map((m) => m[1]);
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
