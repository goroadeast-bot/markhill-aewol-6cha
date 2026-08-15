export const CHAPTER_IDS = [
  'intro',
  'history',
  'overview',
  'premium',
  'types',
  'location',
  'gallery',
  'contact',
];

export function resolveChapter(requestedId) {
  return CHAPTER_IDS.includes(requestedId) ? requestedId : CHAPTER_IDS[0];
}
