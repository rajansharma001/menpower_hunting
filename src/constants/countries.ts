export interface CountryOption {
  code: string;
  name: string;
  region: 'Europe' | 'Gulf' | 'Other';
}

export const COUNTRIES: CountryOption[] = [
  { code: 'PL', name: 'Poland', region: 'Europe' },
  { code: 'HR', name: 'Croatia', region: 'Europe' },
  { code: 'RO', name: 'Romania', region: 'Europe' },
  { code: 'RS', name: 'Serbia', region: 'Europe' },
  { code: 'SK', name: 'Slovakia', region: 'Europe' },
  { code: 'MT', name: 'Malta', region: 'Europe' },
  { code: 'CY', name: 'Cyprus', region: 'Europe' },
  { code: 'HU', name: 'Hungary', region: 'Europe' },
  { code: 'LT', name: 'Lithuania', region: 'Europe' },
  { code: 'EU_OTHER', name: 'Other Europe', region: 'Europe' },
  { code: 'GULF', name: 'Gulf', region: 'Gulf' },
  { code: 'OTHER', name: 'Other', region: 'Other' },
];

export const COUNTRY_NAMES = COUNTRIES.map(c => c.name);
