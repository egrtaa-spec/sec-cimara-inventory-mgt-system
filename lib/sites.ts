export type SiteKey = 'ENAM' | 'MINFOPRA' | 'SUPPTIC' | 'ISMP' | 'SDP';

export const SITES: { key: SiteKey; label: string; env: string }[] = [
  { key: 'ENAM', label: 'ENAM', env: 'MONGODB_SITE_ENAM' },
  { key: 'MINFOPRA', label: 'MINFOPRA', env: 'MONGODB_SITE_MINFOPRA' },
  { key: 'SUPPTIC', label: "SUP'PTIC", env: 'MONGODB_SITE_SUPPTIC' },
  { key: 'ISMP', label: 'ISMP', env: 'MONGODB_SITE_ISMP' },
  { key: 'SDP', label: 'SDP', env: 'MONGODB_SITE_SDP' },
];

export function isValidSite(site: string): site is SiteKey {
  return SITES.some(s => s.key === site);
}

export function siteLabel(site: SiteKey): string {
  return SITES.find(s => s.key === site)?.label ?? site;
}
