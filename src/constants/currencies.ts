export interface CurrencyOption {
  code: string;
  name: string;
  symbol: string;
}

export const CURRENCIES: CurrencyOption[] = [
  { code: 'EUR', name: 'Euro (€)', symbol: '€' },
  { code: 'PLN', name: 'Polish Złoty (zł)', symbol: 'zł' },
  { code: 'RON', name: 'Romanian Leu (lei)', symbol: 'lei' },
  { code: 'HUF', name: 'Hungarian Forint (Ft)', symbol: 'Ft' },
  { code: 'RSD', name: 'Serbian Dinar (din)', symbol: 'din' },
  { code: 'USD', name: 'US Dollar ($)', symbol: '$' },
  { code: 'NPR', name: 'Nepalese Rupee (Rs)', symbol: 'Rs' },
  { code: 'AED', name: 'UAE Dirham (AED)', symbol: 'AED' },
  { code: 'QAR', name: 'Qatari Riyal (QAR)', symbol: 'QAR' },
  { code: 'SAR', name: 'Saudi Riyal (SAR)', symbol: 'SAR' },
  { code: 'KWD', name: 'Kuwaiti Dinar (KWD)', symbol: 'KWD' },
  { code: 'GBP', name: 'British Pound (£)', symbol: '£' },
];
