import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const html = readFileSync('index.html', 'utf8');

test('every timeline card, feature card, and gallery group opts into reveal animation', () => {
  const revealCount = (html.match(/class="[^"]*\breveal\b[^"]*"/g) ?? []).length;
  assert.ok(revealCount >= 12, `expected at least 12 reveal-tagged elements, found ${revealCount}`);
});
