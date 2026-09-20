export interface CountryOption {
  code: string;
  name: string;
  region: 'Europe' | 'Gulf' | 'Other';
}

export const COUNTRIES: CountryOption[] = [
  // Europe (EU & Balkans)
  { code: 'HR', name: 'Croatia', region: 'Europe' },
  { code: 'PL', name: 'Poland', region: 'Europe' },
  { code: 'RO', name: 'Romania', region: 'Europe' },
  { code: 'HU', name: 'Hungary', region: 'Europe' },
  { code: 'RS', name: 'Serbia', region: 'Europe' },
  { code: 'MT', name: 'Malta', region: 'Europe' },
  { code: 'CY', name: 'Cyprus', region: 'Europe' },
  { code: 'SK', name: 'Slovakia', region: 'Europe' },
  { code: 'LT', name: 'Lithuania', region: 'Europe' },
  { code: 'PT', name: 'Portugal', region: 'Europe' },
  { code: 'GR', name: 'Greece', region: 'Europe' },
  { code: 'CZ', name: 'Czech Republic', region: 'Europe' },
  { code: 'EU_OTHER', name: 'Other Europe', region: 'Europe' },

  // Gulf (GCC)
  { code: 'AE', name: 'United Arab Emirates', region: 'Gulf' },
  { code: 'QA', name: 'Qatar', region: 'Gulf' },
  { code: 'SA', name: 'Saudi Arabia', region: 'Gulf' },
  { code: 'KW', name: 'Kuwait', region: 'Gulf' },
  { code: 'BH', name: 'Bahrain', region: 'Gulf' },
  { code: 'OM', name: 'Oman', region: 'Gulf' },

  // Other Major Corridors
  { code: 'MY', name: 'Malaysia', region: 'Other' },
  { code: 'JP', name: 'Japan', region: 'Other' },
  { code: 'KR', name: 'South Korea', region: 'Other' },
  { code: 'OTHER', name: 'Other Country', region: 'Other' },
];

export const COUNTRY_NAMES = COUNTRIES.map(c => c.name);
