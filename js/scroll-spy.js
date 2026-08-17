export const NAV_ZONES = [
  { navTarget: 'sale', sectionId: 'sale' },
  { navTarget: 'history', sectionId: 'history' },
  { navTarget: 'gallery', sectionId: 'gallery' },
  { navTarget: 'contact', sectionId: 'contact' },
];

export function pickActiveNav(visibleZones) {
  if (visibleZones.length === 0) return null;
  return visibleZones.reduce((best, zone) => (zone.ratio > best.ratio ? zone : best)).navTarget;
}
