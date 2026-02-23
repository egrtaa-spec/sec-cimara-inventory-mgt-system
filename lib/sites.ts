export type SiteKey = 'ENAM' | 'MINFOPRA' | 'SUPPTIC' | 'ISMP' | 'SDP';

export interface SiteDef {
  key: SiteKey;
  label: string;
  dbName: string;
}

export const SITES: SiteDef[] = [
  { key: 'ENAM', label: 'ENAM', dbName: 'inventory_ENAM' },
  { key: 'MINFOPRA', label: 'MINFOPRA', dbName: 'inventory_MINFOPRA' },
  { key: 'SUPPTIC', label: "SUP'PTIC", dbName: 'inventory_SUPPTIC' },
  { key: 'ISMP', label: 'ISMP', dbName: 'inventory_ISMP' },
  { key: 'SDP', label: 'SDP', dbName: 'inventory_SDP' },
];

export const siteLabel = (key: string): string => {
  const site = SITES.find(s => s.key === key);
  return site ? site.label : key;
};