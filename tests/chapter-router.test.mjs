import { test } from 'node:test';
import assert from 'node:assert/strict';
import { CHAPTER_IDS, resolveChapter } from '../js/chapter-router.js';

test('CHAPTER_IDS lists the 8 chapters in order', () => {
  assert.deepEqual(CHAPTER_IDS, [
    'intro',
    'history',
    'overview',
    'premium',
    'types',
    'location',
    'gallery',
    'contact',
  ]);
});

test('resolveChapter returns a valid requested id unchanged', () => {
  assert.equal(resolveChapter('gallery'), 'gallery');
});

test('resolveChapter falls back to the first chapter for an unknown id', () => {
  assert.equal(resolveChapter('nonexistent'), 'intro');
});

test('resolveChapter falls back to the first chapter for empty/undefined input', () => {
  assert.equal(resolveChapter(undefined), 'intro');
  assert.equal(resolveChapter(''), 'intro');
});
