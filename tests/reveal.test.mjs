import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const html = readFileSync('index.html', 'utf8');

// Sections migrated to the repeat-reveal pattern (overview/location/types/premium/
// rooftop/history) no longer use the one-shot `.reveal` class. These three groups
// still do, so assert them by name rather than by a raw count that quietly decays.
test('hero cards, gallery groups, and the contact card opt into the one-shot reveal animation', () => {
  const heroCards = html.match(/class="hero-card reveal"/g) ?? [];
  assert.equal(heroCards.length, 4, 'expected 4 hero cards to opt into reveal');

  const galleryGroups = html.match(/class="gallery-group[^"]*\breveal\b[^"]*"/g) ?? [];
  assert.equal(galleryGroups.length, 6, 'expected 6 gallery groups to opt into reveal');

  assert.ok(html.includes('class="contact-card reveal"'), 'contact card must opt into reveal');
});

test('the history section no longer uses the one-shot reveal class', () => {
  const historyBlock = html.match(/<section class="chapter" id="history"[\s\S]*?<\/section>/)[0];
  assert.ok(!/\breveal\b/.test(historyBlock), 'history now uses the repeat-reveal .htl-item pattern');
});
