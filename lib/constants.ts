// CIMARA Company Sites
export const SESSION_COOKIE_NAME = 'inventory_session_token';

export const CIMARA_SITES = [
  'ENAM',
  'MINFOPRA',
  'SUP\'PTIC',
  'ISMP',
  'SDP',
  'Main Warehouse',
] as const;

export const EQUIPMENT_UNITS = [
  'pieces',
  'packets',
  'meters',
  'kilograms',
  'liters',
  'boxes',
  'sets'
] as const;

export const EQUIPMENT_CATEGORIES = [
  'power-tools',
  'hand-tools',
  'safety-equipment',
  'materials',
  'machinery',
  'electronic',
  'other'
] as const;

export const EQUIPMENT_CONDITIONS = [
  'new',
  'good',
  'fair',
  'needs_repair'
] as const;
