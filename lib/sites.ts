export type SiteKey = 'ENAM' | 'MINFOPRA' | 'SUPPTIC' | 'ISMP';

export const SITES: { key: SiteKey; label: string; env: string }[] = [
  { key: 'ENAM', label: 'ENAM', env: 'MONGODB_SITE_ENAM' },
  { key: 'MINFOPRA', label: 'MINFOPRA', env: 'MONGODB_SITE_MINFOPRA' },
  { key: 'SUPPTIC', label: "SUP'PTIC", env: 'MONGODB_SITE_SUPPTIC' },
  { key: 'ISMP', label: 'ISMP', env: 'MONGODB_SITE_ISMP' },
];

export function isValidSite(site: string): site is SiteKey {
  return SITES.some(s => s.key === site);
}

export function siteLabel(site: SiteKey): string {
  return SITES.find(s => s.key === site)?.label ?? site;
}
