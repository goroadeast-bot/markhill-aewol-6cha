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

// 서비스면적 형광펜은 한때 #areaBlock 전체를 관찰했다. 블록은 리드 문구로 시작하므로
// 리드만 화면에 걸쳐도 threshold 를 넘겨, 정작 표가 화면 맨 아래 11% 만 보이는 시점에
// 스윕이 끝나버렸다(모바일에서 "강조가 안 된다"고 보이던 원인). 트리거는 표 자체에 건다.
test('service-area highlighter waits until the table itself is on screen', () => {
  const js = readFileSync('js/script.js', 'utf8');
  const block = js.match(/\/\/ 서비스면적 형광펜[\s\S]*?^}/m)[0];
  assert.ok(/observe\(\s*areaTable\s*\)/.test(block), '관찰 대상은 리드가 아니라 표여야 한다');
  const rootMargin = block.match(/rootMargin:\s*'([^']+)'/)?.[1];
  assert.ok(rootMargin, 'rootMargin 으로 화면 아래쪽을 잘라내야 한다');
  const bottom = rootMargin.trim().split(/\s+/)[2];
  assert.ok(/^-\d/.test(bottom), `아래쪽 여백은 음수여야 한다 (지금: ${bottom})`);
});

// 320px 화면에서 형광펜이 영영 켜지지 않던 회귀. 표는 600px 고정폭이라 가로 스크롤 상자에
// 잘리고, IntersectionObserver 는 그 클리핑까지 비율에 곱해 최대 0.45까지밖에 나오지 않는다.
test('service-area highlighter observes the scroller, not the clipped table', () => {
  const js = readFileSync('js/script.js', 'utf8');
  const block = js.match(/\/\/ 서비스면적 형광펜[\s\S]*?^}/m)[0];
  assert.ok(
    /areaBlock\?\.querySelector\('\.table-scroll'\)/.test(block),
    '가로로 잘리지 않는 .table-scroll 을 관찰해야 좁은 화면에서도 문턱에 닿는다'
  );
  assert.ok(
    !/querySelector\('\.area-table-svc'\)/.test(block),
    '가로로 잘리는 표 자체를 관찰하면 안 된다'
  );

  const css = readFileSync('css/styles.css', 'utf8');
  assert.match(css, /\.table-scroll\s*\{[^}]*overflow-x:\s*auto/, '.table-scroll 은 가로 스크롤 상자다');
});
