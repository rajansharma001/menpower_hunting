// ==============================================================================
// Nepal Foreign Employment Legal & DoFE Verification Utilities
// Handles DoFE LT (Lot Number) validation and "Free Visa, Free Ticket" rules
// ==============================================================================

export const FREE_VISA_COUNTRIES = [
  'United Arab Emirates',
  'UAE',
  'Qatar',
  'Saudi Arabia',
  'Saudi',
  'Kuwait',
  'Bahrain',
  'Oman',
  'Malaysia'
];

/**
 * Checks if a destination country falls under Nepal Government's
 * mandatory "Free Visa, Free Ticket" directive (GCC countries + Malaysia)
 */
export function isFreeVisaRegulatedCountry(country: string): boolean {
  if (!country) return false;
  const c = country.trim().toLowerCase();
  return FREE_VISA_COUNTRIES.some(fvc => c === fvc.toLowerCase() || c.includes(fvc.toLowerCase()));
}

export interface LegalCostAudit {
  isRegulated: boolean;
  country: string;
  isCompliant: boolean;
  legalCapNpr: number;
  quotedCostNpr: number;
  status: 'compliant' | 'violation' | 'standard';
  warningMessage?: string;
  successMessage?: string;
}

/**
 * Audits total quoted recruitment costs against Nepal Government legal ceilings.
 * For GCC & Malaysia: Maximum service charge is capped at NPR 10,000 (air ticket & visa paid by employer).
 */
export function auditLegalRecruitmentCost(
  country: string,
  totalCostNpr: number,
  freeVisaClaimed?: boolean
): LegalCostAudit {
  const isRegulated = isFreeVisaRegulatedCountry(country);
  const legalCap = 10000; // NPR 10,000 government ceiling

  if (!isRegulated) {
    return {
      isRegulated: false,
      country,
      isCompliant: true,
      legalCapNpr: 0,
      quotedCostNpr: totalCostNpr,
      status: 'standard'
    };
  }

  // If cost is within limit or 0 (pure free ticket/visa)
  if (totalCostNpr <= legalCap || (freeVisaClaimed && totalCostNpr === 0)) {
    return {
      isRegulated: true,
      country,
      isCompliant: true,
      legalCapNpr: legalCap,
      quotedCostNpr: totalCostNpr,
      status: 'compliant',
      successMessage: `Complies with Nepal Government 'Free Visa, Free Ticket' legal ceiling for ${country} (Max NPR 10,000 service fee).`
    };
  }

  const excess = totalCostNpr - legalCap;
  return {
    isRegulated: true,
    country,
    isCompliant: false,
    legalCapNpr: legalCap,
    quotedCostNpr: totalCostNpr,
    status: 'violation',
    warningMessage: `Exceeds Nepal Government Free Visa / Free Ticket directive. The legal cap for ${country} is NPR 10,000 service fee (quoted excess: ~NPR ${excess.toLocaleString()}).`
  };
}

/**
 * Official DoFE (Department of Foreign Employment) web portal search URLs
 */
export function getDofePortalUrl(ltNumber?: string): string {
  // feims.dofe.gov.np is the primary foreign employment information management system for vacancy search
  return 'https://feims.dofe.gov.np';
}

export function formatLtNumber(raw: string): string {
  const trimmed = raw.trim().toUpperCase();
  if (!trimmed) return '';
  if (trimmed.startsWith('LT-') || trimmed.startsWith('LT')) {
    return trimmed.replace(/^LT-?/, 'LT-');
  }
  return `LT-${trimmed}`;
}
