// ==============================================================================
// Embassy Visa Process & VFS Appointment Engine for Europe & Gulf Corridors
// Tracks foreign work permits, VFS appointments, GAMCA medicals, and DoFE approvals
// ==============================================================================

import { VisaMilestone, VisaDocumentCheck, VisaMilestoneStatus } from '../types/database';
import { COUNTRIES } from '../constants/countries';
import { generateUUID } from './db';

export const OFFICIAL_VISA_PORTALS = {
  vfsGlobalNepal: 'https://visa.vfsglobal.com/npl/en/',
  nepalPoliceOpcr: 'https://opcr.nepalpolice.gov.np/',
  mofaAttestation: 'https://attest.mofa.gov.np/',
  gamcaWafidMedical: 'https://wafid.com/',
  dofeFeims: 'https://feims.dofe.gov.np/'
};

export function getCountryCorridor(countryName: string): 'Europe' | 'Gulf' | 'Other' {
  const match = COUNTRIES.find(c => c.name.toLowerCase() === (countryName || '').toLowerCase());
  return match ? match.region : 'Other';
}

/**
 * Generates corridor-specific default milestones for an opportunity
 */
export function generateDefaultMilestones(opportunityId: string, countryName: string): VisaMilestone[] {
  const corridor = getCountryCorridor(countryName);
  const now = new Date().toISOString();

  if (corridor === 'Europe') {
    return [
      {
        id: generateUUID(),
        opportunity_id: opportunityId,
        step_number: 1,
        title: 'DoFE Lot Pre-Approval',
        title_np: 'लट नं पूर्व स्वीकृति प्रमाणीकरण',
        category: 'dofe',
        status: 'Completed',
        notes: 'Verified against DoFE FEIMS vacancy demand approval',
        created_at: now
      },
      {
        id: generateUUID(),
        opportunity_id: opportunityId,
        step_number: 2,
        title: 'Interview & Selection Confirmation',
        title_np: 'अन्तर्वार्ता तथा छनोट',
        category: 'interview',
        status: 'In Progress',
        notes: 'Formal interview with agency/employer counselor',
        created_at: now
      },
      {
        id: generateUUID(),
        opportunity_id: opportunityId,
        step_number: 3,
        title: 'Destination Foreign Work Permit',
        title_np: 'वर्क पर्मिट प्रक्रिया (युरोप श्रम मन्त्रालय)',
        category: 'permit',
        status: 'Pending',
        notes: 'Submitted to host labor office (e.g. Poland Urząd, Croatia HZZ, Romania IGI). Average wait: 60–120 days.',
        created_at: now
      },
      {
        id: generateUUID(),
        opportunity_id: opportunityId,
        step_number: 4,
        title: 'Nepal Police Clearance & MOFA Apostille',
        title_np: 'प्रहरी रिपोर्ट र परराष्ट्र प्रमाणीकरण',
        category: 'police',
        status: 'Pending',
        notes: 'Online police clearance (opcr.nepalpolice.gov.np) & MOFA consular attestation (Tripureshwor)',
        created_at: now
      },
      {
        id: generateUUID(),
        opportunity_id: opportunityId,
        step_number: 5,
        title: 'VFS Global Biometrics & Passport Submission',
        title_np: 'VFS बायोमेट्रिक मिति तथा कागजात दाखिला',
        category: 'vfs',
        status: 'Pending',
        notes: 'Appointment at VFS Global (Chhaya Center, Thamel / New Delhi). Biometrics & original passport submission.',
        created_at: now
      },
      {
        id: generateUUID(),
        opportunity_id: opportunityId,
        step_number: 6,
        title: 'Embassy National D-Visa Stamping',
        title_np: 'दूतावास भिसा स्ट्याम्पिङ',
        category: 'embassy',
        status: 'Pending',
        notes: 'National employment visa decision and passport return',
        created_at: now
      },
      {
        id: generateUUID(),
        opportunity_id: opportunityId,
        step_number: 7,
        title: 'Nepal DoFE Final Labour Approval',
        title_np: 'अन्तिम श्रम स्वीकृति (श्रम स्टिकर)',
        category: 'final_labour',
        status: 'Pending',
        notes: 'Pre-departure orientation certificate, welfare fund, insurance, and DoFE biometric labour sticker',
        created_at: now
      },
      {
        id: generateUUID(),
        opportunity_id: opportunityId,
        step_number: 8,
        title: 'Air Ticket & Final Departure',
        title_np: 'हवाई टिकट तथा उडान',
        category: 'flight',
        status: 'Pending',
        notes: 'Flight confirmation and Tribhuvan International Airport departure briefing',
        created_at: now
      }
    ];
  }

  // Gulf (GCC) Corridor
  if (corridor === 'Gulf') {
    return [
      {
        id: generateUUID(),
        opportunity_id: opportunityId,
        step_number: 1,
        title: 'DoFE Pre-Approval Lot Number',
        title_np: 'लट नं पूर्व स्वीकृति (नि:शुल्क भिसा/टिकट)',
        category: 'dofe',
        status: 'Completed',
        notes: 'Government legal cost ceiling and quota verification',
        created_at: now
      },
      {
        id: generateUUID(),
        opportunity_id: opportunityId,
        step_number: 2,
        title: 'Standard Offer Letter Signed',
        title_np: 'आधिकारिक अफर लेटर हस्ताक्षर',
        category: 'interview',
        status: 'In Progress',
        notes: 'Verifying guaranteed basic salary, food, overtime, and accommodation terms',
        created_at: now
      },
      {
        id: generateUUID(),
        opportunity_id: opportunityId,
        step_number: 3,
        title: 'GAMCA / GCC Biometric Medical Exam',
        title_np: 'बायोमेट्रिक मेडिकल परीक्षण (GAMCA/Wafid)',
        category: 'medical',
        status: 'Pending',
        notes: 'Medical fitness test at approved GCC medical center in Kathmandu/Patan',
        created_at: now
      },
      {
        id: generateUUID(),
        opportunity_id: opportunityId,
        step_number: 4,
        title: 'Electronic Work Visa / Entry Permit',
        title_np: 'ई-भिसा / इन्ट्री परमिट जारी',
        category: 'e_visa',
        status: 'Pending',
        notes: 'Electronic visa issued by host Ministry of Interior (GDRFA, Mol, Qiwa)',
        created_at: now
      },
      {
        id: generateUUID(),
        opportunity_id: opportunityId,
        step_number: 5,
        title: 'Nepal DoFE Final Labour Approval',
        title_np: 'अन्तिम श्रम स्वीकृति (DoFE श्रम स्टिकर)',
        category: 'final_labour',
        status: 'Pending',
        notes: 'Orientation certificate, Welfare fund receipt, and 14 Lakh term insurance',
        created_at: now
      },
      {
        id: generateUUID(),
        opportunity_id: opportunityId,
        step_number: 6,
        title: 'Company Air Ticket & Departure',
        title_np: 'हवाई टिकट तथा उडान',
        category: 'flight',
        status: 'Pending',
        notes: 'Employer provided air ticket and TIA departure',
        created_at: now
      }
    ];
  }

  // Other Corridors (Malaysia, East Asia, etc.)
  return [
    {
      id: generateUUID(),
      opportunity_id: opportunityId,
      step_number: 1,
      title: 'DoFE Pre-Approval Verification',
      title_np: 'पूर्व स्वीकृति प्रमाणीकरण',
      category: 'dofe',
      status: 'Completed',
      created_at: now
    },
    {
      id: generateUUID(),
      opportunity_id: opportunityId,
      step_number: 2,
      title: 'Employer Interview & Offer Letter',
      title_np: 'अन्तर्वार्ता तथा अफर लेटर',
      category: 'interview',
      status: 'In Progress',
      created_at: now
    },
    {
      id: generateUUID(),
      opportunity_id: opportunityId,
      step_number: 3,
      title: 'Work Permit & Embassy Visa Processing',
      title_np: 'वर्क पर्मिट तथा भिसा प्रक्रिया',
      category: 'permit',
      status: 'Pending',
      created_at: now
    },
    {
      id: generateUUID(),
      opportunity_id: opportunityId,
      step_number: 4,
      title: 'Nepal DoFE Final Labour Approval',
      title_np: 'अन्तिम श्रम स्वीकृति',
      category: 'final_labour',
      status: 'Pending',
      created_at: now
    },
    {
      id: generateUUID(),
      opportunity_id: opportunityId,
      step_number: 5,
      title: 'Flight Booking & Departure',
      title_np: 'उडान तथा प्रस्थान',
      category: 'flight',
      status: 'Pending',
      created_at: now
    }
  ];
}

/**
 * Generates corridor-specific document checklist for VFS/Embassy
 */
export function generateDefaultDocuments(opportunityId: string, countryName: string): VisaDocumentCheck[] {
  const corridor = getCountryCorridor(countryName);

  if (corridor === 'Europe') {
    return [
      {
        id: generateUUID(),
        opportunity_id: opportunityId,
        name: 'Original Passport (1.5+ years validity, 2+ blank pages)',
        name_np: 'सक्कल पासपोर्ट (कम्तीमा डेढ वर्ष म्याद र खाली पाना)',
        required_for: 'EU',
        is_ready: false,
        notes: 'Inspect for any damage or faded stamps'
      },
      {
        id: generateUUID(),
        opportunity_id: opportunityId,
        name: 'Official Foreign Work Permit Copy / Original',
        name_np: 'युरोप वर्क पर्मिट (कपी वा सक्कल)',
        required_for: 'EU',
        is_ready: false,
        notes: 'Check employer name and job title match exactly'
      },
      {
        id: generateUUID(),
        opportunity_id: opportunityId,
        name: 'Nepal Police Clearance Report (MOFA Apostille Attested)',
        name_np: 'प्रहरी चारित्रिक प्रमाणपत्र (परराष्ट्र प्रमाणीकरण सहित)',
        required_for: 'EU',
        is_ready: false,
        notes: 'Must be issued within last 3 to 6 months'
      },
      {
        id: generateUUID(),
        opportunity_id: opportunityId,
        name: 'Medical Fitness Certificate (Approved Center)',
        name_np: 'स्वास्थ्य परीक्षण प्रमाणपत्र',
        required_for: 'EU',
        is_ready: false
      },
      {
        id: generateUUID(),
        opportunity_id: opportunityId,
        name: 'Schengen Spec Photos (35mm x 45mm, White Background)',
        name_np: 'पासपोर्ट साइज फोटो (सेतो पृष्ठभूमि)',
        required_for: 'EU',
        is_ready: false,
        notes: 'Taken within last 3 months, 80% face coverage'
      },
      {
        id: generateUUID(),
        opportunity_id: opportunityId,
        name: 'VFS Appointment Confirmation Letter',
        name_np: 'VFS बायोमेट्रिक अपोइन्टमेन्ट लेटर',
        required_for: 'EU',
        is_ready: false,
        notes: 'Printed copy with barcode and time slot'
      },
      {
        id: generateUUID(),
        opportunity_id: opportunityId,
        name: 'Signed Employment Contract / Offer Letter',
        name_np: 'हस्ताक्षर गरिएको रोजगार सम्झौता पत्र',
        required_for: 'EU',
        is_ready: false
      }
    ];
  }

  // Gulf Checklist
  return [
    {
      id: generateUUID(),
      opportunity_id: opportunityId,
      name: 'Original Passport (Min. 6 months validity)',
      name_np: 'सक्कल पासपोर्ट (कम्तीमा ६ महिना म्याद)',
      required_for: 'Gulf',
      is_ready: false
    },
    {
      id: generateUUID(),
      opportunity_id: opportunityId,
      name: 'Standard Signed Unified Offer Letter',
      name_np: 'हस्ताक्षर गरिएको आधिकारिक अफर लेटर',
      required_for: 'Gulf',
      is_ready: false,
      notes: 'Verify basic salary matches DoFE approval'
    },
    {
      id: generateUUID(),
      opportunity_id: opportunityId,
      name: 'GAMCA / Wafid Biometric Medical Fit Slip',
      name_np: 'GAMCA बायोमेट्रिक मेडिकल फिट प्रमाणपत्र',
      required_for: 'Gulf',
      is_ready: false,
      notes: 'Valid on wafid.com'
    },
    {
      id: generateUUID(),
      opportunity_id: opportunityId,
      name: 'Electronic Work Visa / Entry Permit Copy',
      name_np: 'ई-भिसा / वर्क इन्ट्री परमिट',
      required_for: 'Gulf',
      is_ready: false
    },
    {
      id: generateUUID(),
      opportunity_id: opportunityId,
      name: 'Nepal Pre-departure Orientation Certificate',
      name_np: 'पूर्व प्रस्थान अभिमुखीकरण तालिम प्रमाणपत्र',
      required_for: 'Gulf',
      is_ready: false
    },
    {
      id: generateUUID(),
      opportunity_id: opportunityId,
      name: 'Welfare Fund & Term Insurance Deposit Slips',
      name_np: 'कल्याणकारी कोष र वैदेशिक रोजगार म्यादी बीमा रसिद',
      required_for: 'Gulf',
      is_ready: false
    }
  ];
}

/**
 * Computes milestone progression percentage and current active step
 */
export function calculateVisaProgress(milestones: VisaMilestone[] = []): {
  completedCount: number;
  totalCount: number;
  percent: number;
  currentStep: VisaMilestone | null;
} {
  if (!milestones || milestones.length === 0) {
    return { completedCount: 0, totalCount: 0, percent: 0, currentStep: null };
  }

  const completedCount = milestones.filter(m => m.status === 'Completed').length;
  const totalCount = milestones.length;
  const percent = Math.round((completedCount / totalCount) * 100);

  // Find first step that is not completed (in progress or pending)
  const currentStep =
    milestones.find(m => m.status === 'In Progress') ||
    milestones.find(m => m.status === 'Delayed') ||
    milestones.find(m => m.status === 'Pending') ||
    milestones[milestones.length - 1] ||
    null;

  return { completedCount, totalCount, percent, currentStep };
}

/**
 * Calculates countdown or overdue status for a target date
 */
export function calculateAppointmentCountdown(targetDateStr?: string): {
  days: number;
  isOverdue: boolean;
  isToday: boolean;
  label: string;
  badgeColor: string;
} {
  if (!targetDateStr) {
    return {
      days: 0,
      isOverdue: false,
      isToday: false,
      label: 'No appointment scheduled',
      badgeColor: 'bg-slate-100 text-slate-700 border-slate-300'
    };
  }

  const target = new Date(targetDateStr);
  if (isNaN(target.getTime())) {
    return {
      days: 0,
      isOverdue: false,
      isToday: false,
      label: 'Invalid date',
      badgeColor: 'bg-slate-100 text-slate-700 border-slate-300'
    };
  }

  const now = new Date();
  // Strip time for exact day comparison
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const appointmentDay = new Date(target.getFullYear(), target.getMonth(), target.getDate());

  const diffMs = appointmentDay.getTime() - today.getTime();
  const diffDays = Math.round(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays === 0) {
    return {
      days: 0,
      isOverdue: false,
      isToday: true,
      label: '⚡ TODAY: VFS / Embassy Appointment Day!',
      badgeColor: 'bg-red-500 text-white font-bold border-red-600 animate-pulse'
    };
  }

  if (diffDays > 0) {
    return {
      days: diffDays,
      isOverdue: false,
      isToday: false,
      label: `⏳ ${diffDays} day${diffDays > 1 ? 's' : ''} remaining`,
      badgeColor: diffDays <= 7
        ? 'bg-amber-100 text-amber-900 border-amber-300 font-bold'
        : 'bg-teal-50 text-teal-800 border-teal-300 font-semibold'
    };
  }

  const overdueDays = Math.abs(diffDays);
  return {
    days: overdueDays,
    isOverdue: true,
    isToday: false,
    label: `⚠️ Overdue by ${overdueDays} day${overdueDays > 1 ? 's' : ''}`,
    badgeColor: 'bg-red-50 text-red-800 border-red-300 font-bold'
  };
}
