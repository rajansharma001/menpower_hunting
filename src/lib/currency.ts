// ==============================================================================
// Nepal Foreign Employment Currency Normalizer & Break-Even Payback Engine
// Focused specifically on EU (Eurozone/Balkans) & Gulf (GCC) corridors
// Benchmarked to Nepal Rastra Bank (NRB) standard foreign exchange reference rates
// ==============================================================================

/**
 * Standard Nepal Rastra Bank (NRB) Reference Selling Rates to NPR (नेपाली रुपैयाँ)
 */
export const NRB_BENCHMARK_RATES: Record<string, number> = {
  // GULF (GCC) CURRENCIES
  AED: 36.62, // UAE Dirham (Pegged: ~3.6725 / USD)
  QAR: 36.90, // Qatari Riyal (Pegged: ~3.64 / USD)
  SAR: 35.85, // Saudi Riyal (Pegged: ~3.75 / USD)
  KWD: 440.0, // Kuwaiti Dinar
  BHD: 356.5, // Bahraini Dinar (Pegged: ~0.376 / USD)
  OMR: 349.5, // Omani Rial (Pegged: ~0.385 / USD)

  // EUROPEAN (EU & BALKANS) CURRENCIES
  EUR: 147.0, // Euro (Croatia, Malta, Cyprus, Slovakia, Lithuania, Portugal, etc.)
  PLN: 34.5, // Polish Zloty
  RON: 29.5, // Romanian Leu
  HUF: 0.37, // Hungarian Forint (100 HUF ≈ NPR 37.0)
  RSD: 1.25, // Serbian Dinar
  GBP: 176.0, // British Pound

  // OTHER COMMON DESTINATIONS
  USD: 134.5, // US Dollar
  MYR: 31.5, // Malaysian Ringgit
  JPY: 0.92, // Japanese Yen (100 JPY ≈ NPR 92.0)
  KRW: 0.1, // South Korean Won (1,000 KRW ≈ NPR 100.0)
  NPR: 1.0, // Nepalese Rupee
};

/**
 * Return default expected currency for a destination country
 */
export function getDefaultCurrencyForCountry(countryName: string): string {
  if (!countryName) return 'EUR';
  const c = countryName.trim().toLowerCase();

  // Gulf Countries
  if (c.includes('emirates') || c.includes('uae') || c.includes('dubai')) return 'AED';
  if (c.includes('qatar')) return 'QAR';
  if (c.includes('saudi')) return 'SAR';
  if (c.includes('kuwait')) return 'KWD';
  if (c.includes('bahrain')) return 'BHD';
  if (c.includes('oman')) return 'OMR';
  if (c === 'gulf') return 'AED';

  // European Countries
  if (c.includes('poland')) return 'PLN';
  if (c.includes('romania')) return 'RON';
  if (c.includes('hungary')) return 'HUF';
  if (c.includes('serbia')) return 'RSD';
  if (
    c.includes('croatia') ||
    c.includes('malta') ||
    c.includes('cyprus') ||
    c.includes('slovakia') ||
    c.includes('lithuania') ||
    c.includes('portugal') ||
    c.includes('greece') ||
    c.includes('czech') ||
    c.includes('europe')
  ) {
    return 'EUR';
  }

  // Other major corridors
  if (c.includes('malaysia')) return 'MYR';
  if (c.includes('japan')) return 'JPY';
  if (c.includes('korea')) return 'KRW';
  if (c.includes('uk') || c.includes('britain')) return 'GBP';

  return 'EUR';
}

/**
 * Identify if a country belongs to the European or Gulf corridor
 */
export function getCorridorForCountry(countryName: string): 'Gulf' | 'Europe' | 'Other' {
  if (!countryName) return 'Other';
  const c = countryName.trim().toLowerCase();
  if (
    c.includes('uae') ||
    c.includes('emirates') ||
    c.includes('qatar') ||
    c.includes('saudi') ||
    c.includes('kuwait') ||
    c.includes('bahrain') ||
    c.includes('oman') ||
    c === 'gulf'
  ) {
    return 'Gulf';
  }
  if (
    c.includes('poland') ||
    c.includes('croatia') ||
    c.includes('romania') ||
    c.includes('hungary') ||
    c.includes('serbia') ||
    c.includes('malta') ||
    c.includes('cyprus') ||
    c.includes('slovakia') ||
    c.includes('lithuania') ||
    c.includes('portugal') ||
    c.includes('greece') ||
    c.includes('czech') ||
    c.includes('europe')
  ) {
    return 'Europe';
  }
  return 'Other';
}

/**
 * Converts a foreign currency amount to NPR
 */
export function convertToNpr(amount: number, currencyCode: string): number {
  if (!amount || isNaN(amount) || amount <= 0) return 0;
  const code = (currencyCode || 'NPR').trim().toUpperCase();
  const rate = NRB_BENCHMARK_RATES[code] || 1.0;
  return Math.round(amount * rate);
}

/**
 * Format NPR amounts with standard commas
 */
export function formatNpr(amount: number): string {
  if (!amount || isNaN(amount)) return 'NPR 0';
  return `NPR ${Math.round(amount).toLocaleString('en-US')}`;
}

export interface PaybackAnalysis {
  monthlyNetForeign: number;
  monthlyNetNpr: number;
  totalCostNpr: number;
  paybackMonths: number;
  paybackMonthsFormatted: string;
  riskTier: 'low' | 'moderate' | 'elevated' | 'high';
  riskBadgeColor: string;
  riskBadgeLabel: string;
  corridor: 'Gulf' | 'Europe' | 'Other';
  annualNetSavingsNpr: number;
  twoYearContractSavingsNpr: number;
  debtAdvice: string;
}

/**
 * Calculate the Break-Even Payback Period (लागत असुली महिना)
 * Evaluates how many working months are consumed solely to repay recruitment costs
 * and flags debt bondage / usury risks tailored for EU and Gulf dynamics.
 */
export function calculatePaybackAnalysis(
  totalCostNpr: number,
  monthlyNetSalaryForeign: number,
  currencyCode: string,
  countryName: string,
  accommodationDeductionForeign?: number,
  foodDeductionForeign?: number
): PaybackAnalysis {
  const corridor = getCorridorForCountry(countryName);

  // Calculate actual net monthly take-home in foreign currency
  const baseSalary = monthlyNetSalaryForeign > 0 ? monthlyNetSalaryForeign : 0;
  const accomCost = accommodationDeductionForeign || 0;
  const foodCost = foodDeductionForeign || 0;
  const effectiveForeignNet = Math.max(0, baseSalary - accomCost - foodCost);

  // Convert to monthly NPR
  const monthlyNetNpr = convertToNpr(effectiveForeignNet, currencyCode);
  const cost = Math.max(0, totalCostNpr || 0);

  // Handle zero cost (pure free visa free ticket)
  if (cost === 0 && monthlyNetNpr > 0) {
    const annualNet = monthlyNetNpr * 12;
    const twoYearNet = monthlyNetNpr * 24;
    return {
      monthlyNetForeign: effectiveForeignNet,
      monthlyNetNpr,
      totalCostNpr: 0,
      paybackMonths: 0,
      paybackMonthsFormatted: '0.0',
      riskTier: 'low',
      riskBadgeColor: 'bg-emerald-50 text-emerald-800 border-emerald-300',
      riskBadgeLabel: 'Instant Break-Even (Zero Cost)',
      corridor,
      annualNetSavingsNpr: annualNet,
      twoYearContractSavingsNpr: twoYearNet,
      debtAdvice:
        'Immediate profitability: zero upfront recruitment cost with direct positive savings from month 1.'
    };
  }

  // If no salary or zero net income
  if (monthlyNetNpr <= 0) {
    return {
      monthlyNetForeign: effectiveForeignNet,
      monthlyNetNpr: 0,
      totalCostNpr: cost,
      paybackMonths: 999,
      paybackMonthsFormatted: '—',
      riskTier: 'high',
      riskBadgeColor: 'bg-red-50 text-red-800 border-red-300',
      riskBadgeLabel: 'Cannot Determine (Missing Salary)',
      corridor,
      annualNetSavingsNpr: 0,
      twoYearContractSavingsNpr: 0,
      debtAdvice: 'Unable to calculate payback period without verified net monthly take-home salary.'
    };
  }

  const paybackMonths = cost / monthlyNetNpr;
  const paybackMonthsFormatted = paybackMonths.toFixed(1);

  // Calculate projected net savings over 1 and 2 year standard overseas contracts
  const annualGrossSavings = monthlyNetNpr * 12;
  const annualNetSavingsNpr = Math.max(0, annualGrossSavings - cost);
  const twoYearGrossSavings = monthlyNetNpr * 24;
  const twoYearContractSavingsNpr = Math.max(0, twoYearGrossSavings - cost);

  // Risk Classification tailored for EU & Gulf realities
  if (paybackMonths <= 2.0) {
    return {
      monthlyNetForeign: effectiveForeignNet,
      monthlyNetNpr,
      totalCostNpr: cost,
      paybackMonths,
      paybackMonthsFormatted,
      riskTier: 'low',
      riskBadgeColor: 'bg-emerald-50 text-emerald-800 border-emerald-300',
      riskBadgeLabel: `${paybackMonthsFormatted} Mo — Low Debt Risk (छिटो असुली)`,
      corridor,
      annualNetSavingsNpr,
      twoYearContractSavingsNpr,
      debtAdvice:
        corridor === 'Gulf'
          ? `Excellent Gulf payback. Recovers all agency costs in ~${paybackMonthsFormatted} months, leaving high net savings for remittances.`
          : `Exceptional European terms. Recovering upfront costs within 2 months protects against loan burdens.`
    };
  }

  if (paybackMonths <= 4.0) {
    return {
      monthlyNetForeign: effectiveForeignNet,
      monthlyNetNpr,
      totalCostNpr: cost,
      paybackMonths,
      paybackMonthsFormatted,
      riskTier: 'moderate',
      riskBadgeColor: 'bg-blue-50 text-blue-800 border-blue-300',
      riskBadgeLabel: `${paybackMonthsFormatted} Mo — Standard Payback (सामान्य)`,
      corridor,
      annualNetSavingsNpr,
      twoYearContractSavingsNpr,
      debtAdvice:
        corridor === 'Gulf'
          ? `Standard payback for the Gulf, though check if agency is charging above the Nepal legal ceiling of NPR 10,000.`
          : `Healthy European payback (~${paybackMonthsFormatted} months). Standard European work permits take ~3–4 months of net pay to break even.`
    };
  }

  if (paybackMonths <= 6.0) {
    return {
      monthlyNetForeign: effectiveForeignNet,
      monthlyNetNpr,
      totalCostNpr: cost,
      paybackMonths,
      paybackMonthsFormatted,
      riskTier: 'elevated',
      riskBadgeColor: 'bg-amber-50 text-amber-800 border-amber-300',
      riskBadgeLabel: `${paybackMonthsFormatted} Mo — Elevated Debt Burden (मध्यम सतर्कता)`,
      corridor,
      annualNetSavingsNpr,
      twoYearContractSavingsNpr,
      debtAdvice:
        corridor === 'Gulf'
          ? `High for Gulf recruitment: Half a year of labor will be spent merely repaying recruitment costs. Insist on Free Visa / Free Ticket.`
          : `Significant European cost: ~${paybackMonthsFormatted} months needed to break even. If financed through high-interest informal loans (24–36% in Nepal), interest will add 1–2 additional months of unpaid work.`
    };
  }

  // Over 6 months: High Debt Trap Risk
  return {
    monthlyNetForeign: effectiveForeignNet,
    monthlyNetNpr,
    totalCostNpr: cost,
    paybackMonths,
    paybackMonthsFormatted,
    riskTier: 'high',
    riskBadgeColor: 'bg-red-50 text-red-800 border-red-300',
    riskBadgeLabel: `${paybackMonthsFormatted} Mo — High Debt Trap Risk (उच्च ऋण जोखिम)`,
    corridor,
    annualNetSavingsNpr,
    twoYearContractSavingsNpr,
    debtAdvice:
      corridor === 'Europe'
        ? `Severe European Debt Trap Warning: At ${paybackMonthsFormatted} months of 100% take-home pay to break even, informal village loans at 24%–36% APR could make this contract financially unviable or risk bonded labor.`
        : `Severe Gulf Debt Trap Warning: Quoted costs consume ${paybackMonthsFormatted} months of your salary. This heavily violates Nepal Free Visa / Free Ticket regulations.`
  };
}
