export type IntermediaryType = 'Direct Employer' | 'Through Sub-agency / Broker' | 'Not Clear';
export type EmployerIdentified = 'Yes' | 'No' | 'Not Clear';
export type SalaryType = 'Gross' | 'Net / Take-home' | 'Both' | 'Unclear';
export type OvertimeStatus = 'Available' | 'Seasonal / Limited' | 'None' | 'Unknown';
export type AccommodationType = 'Free / Provided' | 'Worker Pays' | 'Salary Deduction' | 'Not Provided' | 'Unclear';
export type FoodArrangement = 'Fully Provided' | 'Duty Meal' | 'Subsidized' | 'Self Paid' | 'Unclear';
export type Transportation = 'Free Company Bus' | 'Self Paid / Public' | 'Walkable / On Site' | 'Not Clear';
export type WorkPermitStatus = 'Already Issued' | 'Application Lodged' | 'Employer Processing' | 'Quota Waiting / Not Started' | 'Unknown';
export type TimelineBasis = 'Official Source' | 'Agency Historical Average' | 'Previous Worker Cases' | 'Verbal Estimate' | 'Guarantee Given' | 'Unknown';
export type EvidenceStatus = 'Verified' | 'Partially Verified' | 'Needs Verification' | 'Not Provided';
export type CostBreakdownStatus = 'Full' | 'Partial' | 'Lump Sum';
export type PhotoAllowed = 'Yes' | 'Discreetly' | 'No' | 'Not Asked';
export type PaymentMethod = 'Bank Transfer' | 'Cash' | 'Both' | 'Unknown';
export type ReceiptStatus = 'Provided' | 'Promised' | 'Not Provided' | 'Not Asked';
export type RefundPolicy = 'Written Terms' | 'Verbal Promise' | 'Partial Refund' | 'Non-refundable' | 'Unknown';
export type VerificationStatus = 'Verified' | 'Partially Verified' | 'Needs Verification' | 'Not Provided';
export type FollowUpStatus = 'Pending' | 'Completed' | 'Waiting for Agency' | 'Waiting for Document' | 'Cancelled';

export interface Profile {
  id: string;
  name: string;
  email: string;
  created_at: string;
}

export interface Agency {
  id: string;
  user_id: string;
  name: string;
  location?: string;
  phone?: string;
  contact_person?: string;
  license_number?: string;
  website?: string;
  social_link?: string;
  notes?: string;
  created_at: string;
  updated_at: string;
}

export interface Visit {
  id: string;
  user_id: string;
  agency_id: string;
  visit_date: string;
  discovery_channel?: string;
  general_notes?: string;
  created_at: string;
  updated_at: string;
}

export interface Opportunity {
  id: string;
  user_id: string;
  agency_id: string;
  visit_id: string;
  country: string;
  job_title: string;
  job_sector?: string;
  employer_name?: string;
  employer_city?: string;
  employer_identified?: EmployerIdentified;
  intermediary_type?: IntermediaryType;
  advertised_salary?: number;
  salary_currency: string;
  salary_type?: SalaryType;
  expected_net_salary?: number;
  net_salary_currency: string;
  working_hours?: number;
  working_days?: number;
  overtime_status?: OvertimeStatus;
  overtime_rate?: string;
  contract_length?: string;
  probation?: string;
  accommodation_type?: AccommodationType;
  accommodation_cost?: number;
  food_arrangement?: FoodArrangement;
  transportation?: Transportation;
  work_permit_status?: WorkPermitStatus;
  estimated_total_processing_time?: string;
  timeline_basis?: TimelineBasis;
  dofe_lot_number?: string;
  free_visa_free_ticket?: boolean;
  evidence_status?: EvidenceStatus;
  pressure_flags?: string[];
  general_notes?: string;
  is_demo?: boolean;
  created_at: string;
  updated_at: string;
}

export interface OpportunityCost {
  id: string;
  opportunity_id: string;
  agency_service_charge: number;
  government_processing_fee: number;
  medical_exam: number;
  insurance: number;
  visa_fee: number;
  documentation: number;
  translation: number;
  training: number;
  air_ticket: number;
  miscellaneous: number;
  total_quoted_cost: number;
  written_cost: boolean;
  cost_breakdown_status: CostBreakdownStatus;
  created_at: string;
  updated_at: string;
}

export interface OpportunityDocument {
  id: string;
  opportunity_id: string;
  document_type: string;
  shown: boolean;
  photo_allowed?: PhotoAllowed;
  file_url?: string;
  notes?: string;
  created_at: string;
}

export interface PaymentTerm {
  id: string;
  opportunity_id: string;
  payment_stage: string;
  payment_method?: PaymentMethod;
  receipt_status?: ReceiptStatus;
  refund_policy?: RefundPolicy;
  refund_notes?: string;
  created_at: string;
}

export interface VerificationItem {
  id: string;
  opportunity_id: string;
  item: string;
  status: VerificationStatus;
  notes?: string;
  source?: string;
  verified_date?: string;
  created_at: string;
}

export interface FollowUp {
  id: string;
  user_id: string;
  opportunity_id: string;
  follow_up_date: string;
  action: string;
  status: FollowUpStatus;
  notes?: string;
  created_at: string;
}

export interface VoiceMemo {
  id: string;
  opportunity_id?: string;
  agency_id?: string;
  title: string;
  blob: Blob;
  duration_seconds: number;
  mime_type: string;
  file_size_bytes: number;
  created_at: string;
  notes?: string;
}

export type VisaMilestoneStatus = 'Pending' | 'In Progress' | 'Completed' | 'Delayed';

export interface VisaMilestone {
  id: string;
  opportunity_id: string;
  step_number: number;
  title: string;
  title_np: string;
  category: 'dofe' | 'interview' | 'permit' | 'police' | 'vfs' | 'embassy' | 'final_labour' | 'flight' | 'medical' | 'e_visa';
  status: VisaMilestoneStatus;
  target_date?: string;
  completed_date?: string;
  reference_number?: string;
  notes?: string;
  created_at: string;
  updated_at?: string;
}

export interface VisaDocumentCheck {
  id: string;
  opportunity_id: string;
  name: string;
  name_np: string;
  required_for: 'EU' | 'Gulf' | 'Both';
  is_ready: boolean;
  notes?: string;
}

export interface OpportunityComplete extends Opportunity {
  agency?: Agency;
  visit?: Visit;
  costs?: OpportunityCost;
  documents?: OpportunityDocument[];
  payment_terms?: PaymentTerm[];
  verification_items?: VerificationItem[];
  follow_ups?: FollowUp[];
  voice_memos?: VoiceMemo[];
  visa_milestones?: VisaMilestone[];
  visa_documents?: VisaDocumentCheck[];
}


