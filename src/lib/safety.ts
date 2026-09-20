// ==============================================================================
// Nepal Foreign Employment Safety & Red-Flag Threat Detector
// Enforces rules: Never pay personal accounts, No passport confiscation,
// Official VAT/PAN tax receipts, and realistic processing timelines
// ==============================================================================

import { OpportunityComplete, PaymentMethod, ReceiptStatus } from '../types/database';

export interface SafetyRuleCheck {
  id: string;
  title: string;
  titleNp: string;
  category: 'passport' | 'account' | 'receipt' | 'dofe' | 'advance' | 'timeline' | 'written';
  status: 'pass' | 'warning' | 'critical';
  headline: string;
  message: string;
  actionTip: string;
  isCriticalRedFlag: boolean;
}

export interface SafetyAssessment {
  score: number; // 0 - 100
  grade: 'A' | 'B' | 'C' | 'D' | 'F';
  riskLevel: 'safe' | 'caution' | 'danger';
  riskBadgeColor: string;
  riskBadgeLabel: string;
  criticalRedFlagsCount: number;
  warningCount: number;
  checks: SafetyRuleCheck[];
  criticalBanners: string[];
  recommendations: string[];
}

/**
 * Evaluates an opportunity against critical fraud & exploitation red-flags in Nepal
 */
export function evaluateSafetyScore(
  opp: Partial<OpportunityComplete> & {
    pressure_flags?: string[];
    payment_method?: PaymentMethod;
    receipt_status?: ReceiptStatus;
    payment_stages?: string[];
    timeline_basis?: string;
    written_cost?: boolean;
    dofe_lot_number?: string;
    total_quoted_cost?: number;
    country?: string;
  }
): SafetyAssessment {
  const flags = opp.pressure_flags || [];
  const checks: SafetyRuleCheck[] = [];
  const criticalBanners: string[] = [];
  const recommendations: string[] = [];

  let score = 100;

  // --------------------------------------------------------------------------
  // 1. PASSPORT CONFISCATION CHECK (पासपोर्ट जफत चेतावनी)
  // --------------------------------------------------------------------------
  const passportDemanded = flags.some(
    f => f.toLowerCase().includes('passport') || f.includes('पासपोर्ट')
  );

  if (passportDemanded) {
    score -= 35;
    const msg =
      'Demanding original passport before visa approval is illegal under Nepal foreign employment laws. It severely restricts your freedom and is a common coercion tactic.';
    checks.push({
      id: 'passport',
      title: 'Original Passport Demanded',
      titleNp: 'अन्तरवार्ता अगावै पासपोर्ट जफत',
      category: 'passport',
      status: 'critical',
      headline: 'CRITICAL RED FLAG: Original Passport Demanded (पासपोर्ट जफत चेतावनी)',
      message: msg,
      actionTip:
        'Never surrender your original passport during initial visits or interviews. Provide only photocopies until formal VFS/embassy submission.',
      isCriticalRedFlag: true
    });
    criticalBanners.push(
      'पासपोर्ट जफत चेतावनी: भिसा प्रक्रिया निश्चित नभएसम्म सक्कल पासपोर्ट कसैलाई नबुझाउनुहोस्।'
    );
  } else {
    checks.push({
      id: 'passport',
      title: 'Passport Custody Clean',
      titleNp: 'सक्कल पासपोर्ट मागिएको छैन',
      category: 'passport',
      status: 'pass',
      headline: 'Safe: No Original Passport Pressure Observed',
      message: 'No pressure to surrender original passport recorded during this visit.',
      actionTip: 'Retain original passport until embassy biometric appointment.',
      isCriticalRedFlag: false
    });
  }

  // --------------------------------------------------------------------------
  // 2. PERSONAL BANK / WALLET PAYMENT (व्यक्तिगत खातामा पैसा नहाल्ने)
  // --------------------------------------------------------------------------
  const personalAccountDemanded = flags.some(
    f =>
      f.toLowerCase().includes('personal') ||
      f.toLowerCase().includes('esewa') ||
      f.toLowerCase().includes('khalti') ||
      f.includes('व्यक्तिगत')
  );

  if (personalAccountDemanded) {
    score -= 35;
    const msg =
      'Depositing money into a personal bank account or digital wallet (eSewa/Khalti) of an agent is the #1 indicator of recruitment fraud. Agencies disclaim liability when transactions are personal.';
    checks.push({
      id: 'account',
      title: 'Personal Account Transfer Asked',
      titleNp: 'व्यक्तिगत खातामा भुक्तानी माग',
      category: 'account',
      status: 'critical',
      headline: 'CRITICAL WARNING: Personal Account Transfer (व्यक्तिगत खातामा पैसा नहाल्ने)',
      message: msg,
      actionTip:
        'DO NOT deposit money into personal accounts. Demand the agency’s official registered corporate bank account.',
      isCriticalRedFlag: true
    });
    criticalBanners.push(
      'व्यक्तिगत खातामा पैसा नहाल्ने चेतावनी: दलाल वा एजेन्टको व्यक्तिगत खाता वा ईसेवामा कहिल्यै पैसा नहाल्नुहोस्। म्यानपावरको आधिकारिक बैंक खातामा मात्र डिपोजिट गर्नुहोस्।'
    );
  } else {
    checks.push({
      id: 'account',
      title: 'Official Banking Channel',
      titleNp: 'आधिकारिक बैंकिङ माध्यम',
      category: 'account',
      status: 'pass',
      headline: 'Safe: No Personal Account Pressure',
      message: 'No record of demands to transfer funds into personal bank accounts.',
      actionTip: 'Always verify bank account name matches the licensed agency.',
      isCriticalRedFlag: false
    });
  }

  // --------------------------------------------------------------------------
  // 3. OFFICIAL TAX RECEIPT & VAT BILL (रसिद तथा भ्याट बिल)
  // --------------------------------------------------------------------------
  const receiptStatus = opp.receipt_status || (opp.payment_terms && opp.payment_terms[0]?.receipt_status);
  const noReceipt =
    receiptStatus === 'Not Provided' ||
    flags.some(f => f.toLowerCase().includes('receipt') || f.includes('रसिद'));

  if (noReceipt) {
    score -= 25;
    checks.push({
      id: 'receipt',
      title: 'No Official VAT/PAN Bill',
      titleNp: 'आधिकारिक भ्याट/प्यान रसिद नदिने',
      category: 'receipt',
      status: 'critical',
      headline: 'SEVERE WARNING: Refusal to Provide Official Tax Invoice (रसिद बिनाको भुक्तानी)',
      message:
        'Paying cash without an official VAT/PAN receipt means you have ZERO legal proof of payment if the agency defaults or defrauds you.',
      actionTip:
        'Insist on an official company VAT invoice with registered stamp matching the full paid amount.',
      isCriticalRedFlag: true
    });
    criticalBanners.push(
      'रसिद बिना भुक्तानी निषेध: जति रकम बुझाउनुहुन्छ, त्यतिकै रकमको आधिकारिक भ्याट/प्यान बिल अनिवार्य लिनुहोस्।'
    );
  } else if (receiptStatus === 'Promised') {
    score -= 10;
    checks.push({
      id: 'receipt',
      title: 'Receipt Only Promised',
      titleNp: 'रसिद दिने मौखिक आश्वासन मात्र',
      category: 'receipt',
      status: 'warning',
      headline: 'Caution: Receipt Promised Later',
      message: 'Verbal promise to issue receipt later is risky. Receipts must be issued immediately upon payment.',
      actionTip: 'Do not hand over cash until the invoice is prepared and stamped.',
      isCriticalRedFlag: false
    });
  } else {
    checks.push({
      id: 'receipt',
      title: 'Official Receipt Assured',
      titleNp: 'आधिकारिक रसिद सुनिश्चित',
      category: 'receipt',
      status: 'pass',
      headline: 'Safe: Official Receipt Confirmed',
      message: 'Agency issues official payment receipts.',
      actionTip: 'Keep physical copies and photos of all vouchers.',
      isCriticalRedFlag: false
    });
  }

  // --------------------------------------------------------------------------
  // 4. DOFE PRE-APPROVAL LOT NUMBER (पूर्व स्वीकृति लट नं)
  // --------------------------------------------------------------------------
  const hasLt = opp.dofe_lot_number && opp.dofe_lot_number.trim().length > 0;
  if (!hasLt) {
    score -= 15;
    checks.push({
      id: 'dofe',
      title: 'Missing DoFE Pre-Approval',
      titleNp: 'वैदेशिक रोजगार विभागको लट नं नभएको',
      category: 'dofe',
      status: 'warning',
      headline: 'Warning: No DoFE Lot (LT) Number Recorded',
      message:
        'Vacancy has not been linked to an approved Pre-Approval Lot Number (पूर्व स्वीकृति लट नं). The vacancy may not be authorized by the Nepal Government.',
      actionTip: 'Ask the agency for their 6–7 digit DoFE Lot Number and verify on feims.dofe.gov.np.',
      isCriticalRedFlag: false
    });
    recommendations.push('DoFE वेबसाइटमा लट नम्बर जाँच नगरी कुनै पनि अग्रिम रकम नतिर्नुहोस्।');
  } else {
    checks.push({
      id: 'dofe',
      title: 'DoFE Lot Number On File',
      titleNp: 'पूर्व स्वीकृति लट नं प्रमाणित',
      category: 'dofe',
      status: 'pass',
      headline: `Verified: DoFE LT Number (${opp.dofe_lot_number})`,
      message: 'Vacancy has an approved DoFE Lot Number on record.',
      actionTip: 'Double check approved quota and salary on FEIMS portal.',
      isCriticalRedFlag: false
    });
  }

  // --------------------------------------------------------------------------
  // 5. ADVANCE PAYMENT STAGE (छनोट अगावै पेस्की माग)
  // --------------------------------------------------------------------------
  const paymentStages = opp.payment_stages || [];
  const demandsEarlyCash =
    paymentStages.includes('Registration / Interview') ||
    flags.some(f => f.toLowerCase().includes('immediate cash') || f.includes('पेस्की'));

  if (demandsEarlyCash) {
    score -= 15;
    checks.push({
      id: 'advance',
      title: 'Upfront Cash Demanded Early',
      titleNp: 'अन्तर्वार्ता अगावै रकम माग',
      category: 'advance',
      status: 'warning',
      headline: 'Warning: Advance Payment Demanded Before Selection',
      message:
        'Demanding substantial cash before interview selection or contract signing is a common scam tactic.',
      actionTip: 'Never pay large advance fees before interview results and official visa quotas are confirmed.',
      isCriticalRedFlag: false
    });
  } else {
    checks.push({
      id: 'advance',
      title: 'Safe Payment Stages',
      titleNp: 'छनोट पछिको भुक्तानी तालिका',
      category: 'advance',
      status: 'pass',
      headline: 'Safe: Milestone-Based Payment Structure',
      message: 'Payment is requested after offer letter, work permit, or visa approval.',
      actionTip: 'Follow progressive milestone payments only.',
      isCriticalRedFlag: false
    });
  }

  // --------------------------------------------------------------------------
  // 6. TIMELINE & VISA GUARANTEE (भ्रामक ग्यारेन्टी)
  // --------------------------------------------------------------------------
  const guaranteedVisa =
    opp.timeline_basis === 'Guarantee Given' ||
    flags.some(f => f.toLowerCase().includes('guarantee') || f.includes('ग्यारेन्टी'));

  if (guaranteedVisa) {
    score -= 15;
    checks.push({
      id: 'timeline',
      title: '100% Visa Guarantee Given',
      titleNp: 'भ्रामक भिसा ग्यारेन्टी',
      category: 'timeline',
      status: 'warning',
      headline: 'Suspicious Claim: 100% Visa Guarantee Given',
      message:
        'No agency can guarantee a visa. Visa issuance is solely at the discretion of foreign sovereign embassies (Poland, Croatia, UAE, etc.). Guarantees are deceptive marketing.',
      actionTip: 'Treat visa guarantees with extreme skepticism. Inquire about formal refund terms.',
      isCriticalRedFlag: false
    });
  } else {
    checks.push({
      id: 'timeline',
      title: 'Realistic Processing Timeline',
      titleNp: 'स्वाभाविक समयसीमा',
      category: 'timeline',
      status: 'pass',
      headline: 'Safe: Realistic Timeline Expectations',
      message: 'Agency has not made deceptive 100% visa guarantee claims.',
      actionTip: 'Budget for normal embassy backlog periods.',
      isCriticalRedFlag: false
    });
  }

  // --------------------------------------------------------------------------
  // 7. WRITTEN CONTRACT / QUOTE (लिखित सम्झौता)
  // --------------------------------------------------------------------------
  const writtenRefused =
    flags.some(f => f.toLowerCase().includes('written') || f.includes('लिखित')) ||
    (opp.costs && !opp.costs.written_cost && opp.costs.total_quoted_cost > 0);

  if (writtenRefused) {
    score -= 10;
    checks.push({
      id: 'written',
      title: 'Verbal Quote Only',
      titleNp: 'मौखिक सहमति मात्र (कागजात नभएको)',
      category: 'written',
      status: 'warning',
      headline: 'Caution: Verbal Only Terms (No Written Quotation)',
      message: 'All figures are verbal. Manpower agencies often inflate fees later if terms are not documented.',
      actionTip: 'Ask for written terms, itemized receipt breakdown, or contract drafts.',
      isCriticalRedFlag: false
    });
  } else {
    checks.push({
      id: 'written',
      title: 'Written Terms Provided',
      titleNp: 'लिखित विवरण उपलब्ध',
      category: 'written',
      status: 'pass',
      headline: 'Safe: Written Cost Terms',
      message: 'Quotation or terms documented in writing.',
      actionTip: 'Retain all official paperwork.',
      isCriticalRedFlag: false
    });
  }

  // Final score clamping
  const finalScore = Math.max(0, Math.min(100, score));

  // Determine critical red flags and warnings count
  const criticalRedFlagsCount = checks.filter(c => c.status === 'critical').length;
  const warningCount = checks.filter(c => c.status === 'warning').length;

  // Grade & Risk Tier
  let grade: 'A' | 'B' | 'C' | 'D' | 'F' = 'A';
  let riskLevel: 'safe' | 'caution' | 'danger' = 'safe';
  let riskBadgeColor = 'bg-emerald-50 text-emerald-800 border-emerald-300';
  let riskBadgeLabel = `Safety Score: ${finalScore}% (Safe / न्यून जोखिम)`;

  if (criticalRedFlagsCount > 0 || finalScore < 50) {
    grade = 'F';
    riskLevel = 'danger';
    riskBadgeColor = 'bg-red-50 text-red-900 border-red-400 font-bold';
    riskBadgeLabel = `🚨 HIGH THREAT (${criticalRedFlagsCount} Critical Red Flags)`;
  } else if (finalScore < 70 || warningCount >= 3) {
    grade = 'C';
    riskLevel = 'caution';
    riskBadgeColor = 'bg-amber-50 text-amber-900 border-amber-400 font-semibold';
    riskBadgeLabel = `⚠️ Caution Needed (${finalScore}% Safety Score)`;
  } else if (finalScore < 85) {
    grade = 'B';
    riskLevel = 'safe';
    riskBadgeColor = 'bg-blue-50 text-blue-900 border-blue-300';
    riskBadgeLabel = `Acceptable Standards (${finalScore}%)`;
  }

  return {
    score: finalScore,
    grade,
    riskLevel,
    riskBadgeColor,
    riskBadgeLabel,
    criticalRedFlagsCount,
    warningCount,
    checks,
    criticalBanners,
    recommendations
  };
}
