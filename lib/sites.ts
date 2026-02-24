export type SiteKey = 'ENAM' | 'MINFOPRA' | 'SUPPTIC' | 'ISMP' | 'SDP';

export interface SiteDef {
  key: SiteKey;
  label: string;
  dbName: string;
}

// lib/sites.ts
export const SITES: SiteDef[] = [
  { key: 'ENAM', label: 'ENAM', dbName: 'ENAM' },
  { key: 'MINFOPRA', label: 'MINFOPRA', dbName: 'MINFOPRA' },
  // FIX: Change 'SUPPTIC' to "SUP'PTIC" to match your MongoDB Atlas
  { key: 'SUPPTIC', label: "SUP'PTIC", dbName: "SUP'PTIC" }, 
  { key: 'ISMP', label: 'ISMP', dbName: 'ISMP' },
  { key: 'SDP', label: 'SDP', dbName: 'SDP' },
];

export const siteLabel = (key: string): string => {
  const site = SITES.find(s => s.key === key);
  return site ? site.label : key;
};

export const getSiteDef = (identifier: string): SiteDef | undefined => {
  return SITES.find(s => s.key === identifier || s.label === identifier);
};