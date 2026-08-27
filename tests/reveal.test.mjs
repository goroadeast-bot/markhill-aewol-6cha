import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const html = readFileSync('index.html', 'utf8');

// Sections migrated to the repeat-reveal pattern (overview/location/types/premium/
// rooftop/history) no longer use the one-shot `.reveal` class. These groups still do,
// so assert them by name rather than by a raw count that quietly decays. 1~5차 of the
// gallery moved to the cursor-driven .bg-phase bento rows (no .reveal); only the 6차
// group (still a plain static row — no interior photos exist yet) keeps it.
test('hero cards, the 6cha gallery group, and the contact card opt into the one-shot reveal animation', () => {
  const heroCards = html.match(/class="hero-card reveal"/g) ?? [];
  assert.equal(heroCards.length, 4, 'expected 4 hero cards to opt into reveal');

  const galleryGroups = html.match(/class="gallery-group[^"]*\breveal\b[^"]*"/g) ?? [];
  assert.equal(galleryGroups.length, 1, 'expected only the 6차 gallery group to opt into reveal');

  assert.ok(html.includes('class="contact-card reveal"'), 'contact card must opt into reveal');
});

test('the history section no longer uses the one-shot reveal class', () => {
  const historyBlock = html.match(/<section class="chapter" id="history"[\s\S]*?<\/section>/)[0];
  assert.ok(!/\breveal\b/.test(historyBlock), 'history now uses the repeat-reveal .htl-item pattern');
});
