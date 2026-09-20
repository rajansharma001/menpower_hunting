import {
  Agency,
  Visit,
  Opportunity,
  OpportunityCost,
  OpportunityDocument,
  PaymentTerm,
  VerificationItem,
  FollowUp
} from '../types/database';

export interface DemoDataset {
  agencies: Agency[];
  visits: Visit[];
  opportunities: Opportunity[];
  costs: OpportunityCost[];
  documents: OpportunityDocument[];
  paymentTerms: PaymentTerm[];
  verificationItems: VerificationItem[];
  followUps: FollowUp[];
}

export function generateDemoData(userId: string): DemoDataset {
  const now = new Date().toISOString();
  const todayStr = new Date().toISOString().split('T')[0];

  const agency1Id = 'demo-agency-1';
  const agency2Id = 'demo-agency-2';

  const visit1Id = 'demo-visit-1';
  const visit2Id = 'demo-visit-2';

  const opp1Id = 'demo-opp-1';
  const opp2Id = 'demo-opp-2';
  const opp3Id = 'demo-opp-3';

  const agencies: Agency[] = [
    {
      id: agency1Id,
      user_id: userId,
      name: 'Apex Global Overseas Hub [DEMO DATA]',
      location: 'Battisputali, Kathmandu',
      phone: '+977-1-4488990',
      contact_person: 'Ramesh Adhikari',
      license_number: '1088/078/079',
      website: 'https://demo-apex-overseas.example.com',
      social_link: 'facebook.com/demoapexoverseas',
      notes: 'Clean office, informative counselor. Promised quota for Poland & Croatia.',
      created_at: now,
      updated_at: now,
    },
    {
      id: agency2Id,
      user_id: userId,
      name: 'Everest Cross-Border Placements [DEMO DATA]',
      location: 'Sinamangal, Kathmandu',
      phone: '+977-1-4112233',
      contact_person: 'Sunita Thapa',
      license_number: '954/076/077',
      website: 'https://demo-everest-placement.example.com',
      notes: 'Direct demand for Romanian construction firm. Showed pre-approval papers.',
      created_at: now,
      updated_at: now,
    }
  ];

  const visits: Visit[] = [
    {
      id: visit1Id,
      user_id: userId,
      agency_id: agency1Id,
      visit_date: todayStr,
      discovery_channel: 'Walk-in',
      general_notes: 'Walk-in visit. Met Ramesh. Discussed European warehouse & food manufacturing vacancies.',
      created_at: now,
      updated_at: now,
    },
    {
      id: visit2Id,
      user_id: userId,
      agency_id: agency2Id,
      visit_date: todayStr,
      discovery_channel: 'Friend / Referral',
      general_notes: 'Recommended by friend who went to Romania last year. Met Sunita.',
      created_at: now,
      updated_at: now,
    }
  ];

  const opportunities: Opportunity[] = [
    {
      id: opp1Id,
      user_id: userId,
      agency_id: agency1Id,
      visit_id: visit1Id,
      country: 'Poland',
      job_title: 'Warehouse Associate [DEMO DATA]',
      job_sector: 'Warehouse',
      employer_name: 'Baltic Logistics Sp. z o.o. [DEMO]',
      employer_city: 'Poznań',
      employer_identified: 'Yes',
      intermediary_type: 'Direct Employer',
      advertised_salary: 4200,
      salary_currency: 'PLN',
      salary_type: 'Gross',
      expected_net_salary: 3150,
      net_salary_currency: 'PLN',
      working_hours: 8,
      working_days: 5,
      overtime_status: 'Available',
      overtime_rate: '150% standard rate (approx 26 PLN/hr)',
      contract_length: '2 Years (Renewable)',
      probation: '3 Months',
      accommodation_type: 'Salary Deduction',
      accommodation_cost: 450, // 450 PLN deduction
      food_arrangement: 'Duty Meal',
      transportation: 'Free Company Bus',
      work_permit_status: 'Employer Processing',
      estimated_total_processing_time: '5–7 months',
      timeline_basis: 'Agency Historical Average',
      evidence_status: 'Partially Verified',
      pressure_flags: ['None observed'],
      general_notes: 'Direct client order. Polish Voivodeship work permit processing takes ~4 months. Uniform & safety shoes provided.',
      is_demo: true,
      created_at: now,
      updated_at: now,
    },
    {
      id: opp2Id,
      user_id: userId,
      agency_id: agency1Id,
      visit_id: visit1Id,
      country: 'Croatia',
      job_title: 'Bakery Production Worker [DEMO DATA]',
      job_sector: 'Food / Bakery',
      employer_name: 'Adriatic Pekara d.o.o. [DEMO]',
      employer_city: 'Zagreb',
      employer_identified: 'Yes',
      intermediary_type: 'Through Sub-agency / Broker',
      advertised_salary: 950,
      salary_currency: 'EUR',
      salary_type: 'Gross',
      expected_net_salary: 800,
      net_salary_currency: 'EUR',
      working_hours: 8,
      working_days: 6,
      overtime_status: 'Seasonal / Limited',
      overtime_rate: 'EUR 6 / hr in peak summer',
      contract_length: '1 Year (Renewable)',
      probation: '2 Months',
      accommodation_type: 'Free / Provided',
      food_arrangement: 'Duty Meal',
      transportation: 'Walkable / On Site',
      work_permit_status: 'Quota Waiting / Not Started',
      estimated_total_processing_time: '4–6 months',
      timeline_basis: 'Verbal Estimate',
      evidence_status: 'Needs Verification',
      pressure_flags: ['Gross/net unclear'],
      general_notes: 'Bakery located 20km outside Zagreb. Shared hostel accommodation (2 persons per room) with WiFi.',
      is_demo: true,
      created_at: now,
      updated_at: now,
    },
    {
      id: opp3Id,
      user_id: userId,
      agency_id: agency2Id,
      visit_id: visit2Id,
      country: 'Romania',
      job_title: 'Construction Worker (Masonry & Formwork) [DEMO DATA]',
      job_sector: 'Construction',
      employer_name: 'Carpathian Build SRL [DEMO]',
      employer_city: 'Cluj-Napoca',
      employer_identified: 'Yes',
      intermediary_type: 'Direct Employer',
      advertised_salary: 850,
      salary_currency: 'EUR',
      salary_type: 'Net / Take-home',
      expected_net_salary: 850,
      net_salary_currency: 'EUR',
      working_hours: 9,
      working_days: 6,
      overtime_status: 'Available',
      overtime_rate: 'Standard hourly overtime',
      contract_length: '2 Years',
      probation: '1 Month',
      accommodation_type: 'Free / Provided',
      food_arrangement: 'Fully Provided',
      transportation: 'Free Company Bus',
      work_permit_status: 'Application Lodged',
      estimated_total_processing_time: '3–5 months',
      timeline_basis: 'Official Source',
      evidence_status: 'Verified',
      pressure_flags: ['None observed'],
      general_notes: 'Romanian Immigration Inspectorate (IGI) work authorization already in progress. 3 meals provided daily at camp.',
      is_demo: true,
      created_at: now,
      updated_at: now,
    }
  ];

  const costs: OpportunityCost[] = [
    {
      id: 'demo-cost-1',
      opportunity_id: opp1Id,
      agency_service_charge: 350000,
      government_processing_fee: 25000,
      medical_exam: 12000,
      insurance: 15000,
      visa_fee: 18000,
      documentation: 15000,
      translation: 10000,
      training: 5000,
      air_ticket: 90000,
      miscellaneous: 15000,
      total_quoted_cost: 620000, // Itemized sum: 555000 -> Unaccounted difference: 65000
      written_cost: true,
      cost_breakdown_status: 'Partial',
      created_at: now,
      updated_at: now,
    },
    {
      id: 'demo-cost-2',
      opportunity_id: opp2Id,
      agency_service_charge: 320000,
      government_processing_fee: 25000,
      medical_exam: 12000,
      insurance: 15000,
      visa_fee: 22000,
      documentation: 10000,
      translation: 8000,
      training: 0,
      air_ticket: 88000,
      miscellaneous: 0,
      total_quoted_cost: 530000, // Itemized sum: 500000 -> Unaccounted difference: 30000
      written_cost: false,
      cost_breakdown_status: 'Partial',
      created_at: now,
      updated_at: now,
    },
    {
      id: 'demo-cost-3',
      opportunity_id: opp3Id,
      agency_service_charge: 280000,
      government_processing_fee: 25000,
      medical_exam: 12000,
      insurance: 15000,
      visa_fee: 20000,
      documentation: 10000,
      translation: 8000,
      training: 0,
      air_ticket: 85000,
      miscellaneous: 0,
      total_quoted_cost: 455000, // Itemized sum: 455000 -> Unaccounted difference: 0
      written_cost: true,
      cost_breakdown_status: 'Full',
      created_at: now,
      updated_at: now,
    }
  ];

  const documents: OpportunityDocument[] = [
    {
      id: 'demo-doc-1',
      opportunity_id: opp1Id,
      document_type: 'Demand Letter',
      shown: true,
      photo_allowed: 'Yes',
      notes: 'Demand letter authenticated by Embassy of Nepal in Berlin (covers Poland).',
      created_at: now,
    },
    {
      id: 'demo-doc-2',
      opportunity_id: opp1Id,
      document_type: 'Job Offer',
      shown: true,
      photo_allowed: 'Discreetly',
      notes: 'Sample contract from Baltic Logistics shown in office.',
      created_at: now,
    },
    {
      id: 'demo-doc-3',
      opportunity_id: opp2Id,
      document_type: 'Job Offer',
      shown: true,
      photo_allowed: 'No',
      notes: 'Showed brochure and job description printed paper; no photography permitted.',
      created_at: now,
    },
    {
      id: 'demo-doc-4',
      opportunity_id: opp3Id,
      document_type: 'Demand Letter',
      shown: true,
      photo_allowed: 'Yes',
      notes: 'Official pre-approval letter with DoFE verification stamp shown.',
      created_at: now,
    },
    {
      id: 'demo-doc-5',
      opportunity_id: opp3Id,
      document_type: 'Employer Registration',
      shown: true,
      photo_allowed: 'Yes',
      notes: 'Romanian Trade Register certificate (ONRC) copy shown.',
      created_at: now,
    }
  ];

  const paymentTerms: PaymentTerm[] = [
    {
      id: 'demo-pay-1',
      opportunity_id: opp1Id,
      payment_stage: 'Registration / Interview',
      payment_method: 'Bank Transfer',
      receipt_status: 'Provided',
      refund_policy: 'Written Terms',
      refund_notes: '10,000 NPR registration fee deducted if applicant withdraws after interview; fully refundable if employer rejects.',
      created_at: now,
    },
    {
      id: 'demo-pay-2',
      opportunity_id: opp1Id,
      payment_stage: 'After Work Permit',
      payment_method: 'Bank Transfer',
      receipt_status: 'Provided',
      refund_policy: 'Written Terms',
      refund_notes: '50% payment upon receiving scanned Polish Voivodeship permit.',
      created_at: now,
    },
    {
      id: 'demo-pay-3',
      opportunity_id: opp2Id,
      payment_stage: 'Before Visa',
      payment_method: 'Cash',
      receipt_status: 'Promised',
      refund_policy: 'Verbal Promise',
      refund_notes: 'Cash payment requested before embassy submission. Verbal promise of partial refund if visa denied.',
      created_at: now,
    },
    {
      id: 'demo-pay-4',
      opportunity_id: opp3Id,
      payment_stage: 'After Visa Approval',
      payment_method: 'Bank Transfer',
      receipt_status: 'Provided',
      refund_policy: 'Written Terms',
      refund_notes: 'Balance paid via formal bank deposit only after visa sticker verified at DoFE.',
      created_at: now,
    }
  ];

  const verificationItems: VerificationItem[] = [
    {
      id: 'demo-ver-1',
      opportunity_id: opp1Id,
      item: 'DoFE License',
      status: 'Verified',
      notes: 'Agency license #1088/078/079 is currently active on FEIMS portal.',
      source: 'FEIMS Nepal Portal (dofe.gov.np)',
      verified_date: todayStr,
      created_at: now,
    },
    {
      id: 'demo-ver-2',
      opportunity_id: opp1Id,
      item: 'Employer Legal Registration',
      status: 'Verified',
      notes: 'Baltic Logistics Sp. z o.o. verified on Polish KRS national business register.',
      source: 'ekrs.ms.gov.pl',
      verified_date: todayStr,
      created_at: now,
    },
    {
      id: 'demo-ver-3',
      opportunity_id: opp1Id,
      item: 'Work Permit',
      status: 'Needs Verification',
      notes: 'Check if permit is submitted under standard A-type or seasonal authorization.',
      created_at: now,
    },
    {
      id: 'demo-ver-4',
      opportunity_id: opp1Id,
      item: 'Accommodation',
      status: 'Partially Verified',
      notes: 'Confirmed 450 PLN deduction. Need to check room occupancy count.',
      created_at: now,
    },
    {
      id: 'demo-ver-5',
      opportunity_id: opp2Id,
      item: 'Employer Legal Registration',
      status: 'Needs Verification',
      notes: 'Look up Adriatic Pekara on Croatian court registry (sudreg.pravosudje.hr).',
      created_at: now,
    },
    {
      id: 'demo-ver-6',
      opportunity_id: opp2Id,
      item: 'Total Cost',
      status: 'Needs Verification',
      notes: 'Inquire why NPR 30,000 difference exists between quoted sum and itemized items.',
      created_at: now,
    },
    {
      id: 'demo-ver-7',
      opportunity_id: opp3Id,
      item: 'DoFE License',
      status: 'Verified',
      notes: 'Everest Cross-Border license active and verified.',
      source: 'FEIMS',
      verified_date: todayStr,
      created_at: now,
    },
    {
      id: 'demo-ver-8',
      opportunity_id: opp3Id,
      item: 'Job Demand',
      status: 'Verified',
      notes: 'Demand lot number verified on Baideshik Rojgar app.',
      source: 'Baideshik Rojgar App',
      verified_date: todayStr,
      created_at: now,
    }
  ];

  const followUps: FollowUp[] = [
    {
      id: 'demo-fol-1',
      user_id: userId,
      opportunity_id: opp1Id,
      follow_up_date: todayStr,
      action: 'Call Ramesh to check Polish Voivodeship work permit submission receipt',
      status: 'Pending',
      notes: 'Agency promised permit lodging confirmation by end of month.',
      created_at: now,
    },
    {
      id: 'demo-fol-2',
      user_id: userId,
      opportunity_id: opp2Id,
      follow_up_date: new Date(Date.now() + 86400000 * 3).toISOString().split('T')[0],
      action: 'Request official written cost breakdown from Apex counselor',
      status: 'Pending',
      notes: 'Clarify if airfare is refundable if flight is delayed.',
      created_at: now,
    },
    {
      id: 'demo-fol-3',
      user_id: userId,
      opportunity_id: opp3Id,
      follow_up_date: new Date(Date.now() - 86400000 * 2).toISOString().split('T')[0],
      action: 'Verify Romanian employer registration document number with online database',
      status: 'Completed',
      notes: 'Registration confirmed active. Capital registered matches active contractor.',
      created_at: now,
    }
  ];

  return {
    agencies,
    visits,
    opportunities,
    costs,
    documents,
    paymentTerms,
    verificationItems,
    followUps,
  };
}
