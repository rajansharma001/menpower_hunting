export interface CurrencyOption {
  code: string;
  name: string;
  symbol: string;
  region?: 'Gulf' | 'Europe' | 'Other';
}

export const CURRENCIES: CurrencyOption[] = [
  // Gulf Currencies (GCC)
  { code: 'AED', name: 'UAE Dirham (AED)', symbol: 'AED', region: 'Gulf' },
  { code: 'QAR', name: 'Qatari Riyal (QAR)', symbol: 'QAR', region: 'Gulf' },
  { code: 'SAR', name: 'Saudi Riyal (SAR)', symbol: 'SAR', region: 'Gulf' },
  { code: 'KWD', name: 'Kuwaiti Dinar (KWD)', symbol: 'KWD', region: 'Gulf' },
  { code: 'BHD', name: 'Bahraini Dinar (BD)', symbol: 'BD', region: 'Gulf' },
  { code: 'OMR', name: 'Omani Rial (OMR)', symbol: 'OMR', region: 'Gulf' },

  // European Currencies (EU & Balkans)
  { code: 'EUR', name: 'Euro (€)', symbol: '€', region: 'Europe' },
  { code: 'PLN', name: 'Polish Złoty (zł)', symbol: 'zł', region: 'Europe' },
  { code: 'RON', name: 'Romanian Leu (lei)', symbol: 'lei', region: 'Europe' },
  { code: 'HUF', name: 'Hungarian Forint (Ft)', symbol: 'Ft', region: 'Europe' },
  { code: 'RSD', name: 'Serbian Dinar (din)', symbol: 'din', region: 'Europe' },
  { code: 'GBP', name: 'British Pound (£)', symbol: '£', region: 'Europe' },

  // Other Major Currencies
  { code: 'NPR', name: 'Nepalese Rupee (Rs)', symbol: 'Rs', region: 'Other' },
  { code: 'USD', name: 'US Dollar ($)', symbol: '$', region: 'Other' },
  { code: 'MYR', name: 'Malaysian Ringgit (RM)', symbol: 'RM', region: 'Other' },
  { code: 'JPY', name: 'Japanese Yen (¥)', symbol: '¥', region: 'Other' },
  { code: 'KRW', name: 'South Korean Won (₩)', symbol: '₩', region: 'Other' },
];
