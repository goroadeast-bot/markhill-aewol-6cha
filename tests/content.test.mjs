import { test } from 'node:test';
import assert from 'node:assert/strict';
import { existsSync } from 'node:fs';

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
