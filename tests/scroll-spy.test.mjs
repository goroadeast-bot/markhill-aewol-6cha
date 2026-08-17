import { test } from 'node:test';
import assert from 'node:assert/strict';
import { NAV_ZONES, pickActiveNav } from '../js/scroll-spy.js';

test('NAV_ZONES lists the 4 top-level nav zones in order', () => {
  assert.deepEqual(
    NAV_ZONES.map((zone) => zone.navTarget),
    ['sale', 'history', 'gallery', 'contact']
  );
});

test('NAV_ZONES navTarget and sectionId match for every zone', () => {
  for (const zone of NAV_ZONES) {
    assert.equal(zone.navTarget, zone.sectionId);
  }
});

test('pickActiveNav returns null when nothing is visible', () => {
  assert.equal(pickActiveNav([]), null);
});

test('pickActiveNav picks the zone with the highest intersection ratio', () => {
  const result = pickActiveNav([
    { navTarget: 'sale', ratio: 0.2 },
    { navTarget: 'history', ratio: 0.6 },
    { navTarget: 'gallery', ratio: 0.1 },
  ]);
  assert.equal(result, 'history');
});

test('pickActiveNav breaks ties by keeping the first-listed zone', () => {
  const result = pickActiveNav([
    { navTarget: 'sale', ratio: 0.5 },
    { navTarget: 'history', ratio: 0.5 },
  ]);
  assert.equal(result, 'sale');
});

test('pickActiveNav ignores zones with zero ratio when a positive one exists', () => {
  const result = pickActiveNav([
    { navTarget: 'sale', ratio: 0 },
    { navTarget: 'gallery', ratio: 0.3 },
  ]);
  assert.equal(result, 'gallery');
});
