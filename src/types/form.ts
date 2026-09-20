import {
  EmployerIdentified,
  IntermediaryType,
  SalaryType,
  OvertimeStatus,
  AccommodationType,
  FoodArrangement,
  Transportation,
  WorkPermitStatus,
  TimelineBasis,
  EvidenceStatus,
  CostBreakdownStatus,
  PhotoAllowed,
  PaymentMethod,
  ReceiptStatus,
  RefundPolicy
} from './database';

export interface DocumentEntry {
  document_type: string;
  shown: boolean;
  photo_allowed: PhotoAllowed;
  file_url?: string;
  notes?: string;
}

export interface WizardFormData {
  // Step 1: Agency & Visit
  agency_id?: string;
  agency_name: string;
  agency_location: string;
  contact_person: string;
  phone: string;
  license_number: string;
  website: string;
  social_link: string;
  visit_date: string;
  discovery_channel: string;
  visit_notes: string;

  // Step 2: Opportunity & Employer
  country: string;
  job_title: string;
  job_sector: string;
  employer_name: string;
  employer_city: string;
  employer_identified: EmployerIdentified;
  intermediary_type: IntermediaryType;

  // Step 3: Salary & Job Terms
  advertised_salary: string; // string in form for easy numeric typing
  salary_currency: string;
  salary_type: SalaryType;
  expected_net_salary: string;
  net_salary_currency: string;
  working_hours: string;
  working_days: string;
  overtime_status: OvertimeStatus;
  overtime_rate: string;
  contract_length: string;
  probation: string;

  // Step 4: Living Conditions
  accommodation_type: AccommodationType;
  accommodation_cost: string;
  food_arrangement: FoodArrangement;
  transportation: Transportation;

  // Step 5: Money & Costs (NPR)
  agency_service_charge: string;
  government_processing_fee: string;
  medical_exam: string;
  insurance: string;
  visa_fee: string;
  documentation: string;
  translation: string;
  training: string;
  air_ticket: string;
  miscellaneous: string;
  total_quoted_cost: string;
  written_cost: boolean;
  cost_breakdown_status: CostBreakdownStatus;

  // Step 6: Work Permit & Documents
  work_permit_status: WorkPermitStatus;
  dofe_lot_number: string;
  free_visa_free_ticket: boolean;
  documents_shown: Record<string, DocumentEntry>;

  // Step 7: Timeline & Payment
  estimated_total_processing_time: string;
  timeline_basis: TimelineBasis;
  payment_stages: string[];
  payment_method: PaymentMethod;
  receipt_status: ReceiptStatus;
  refund_policy: RefundPolicy;
  refund_notes: string;

  // Step 8: Quick Field Notes
  evidence_status: EvidenceStatus;
  pressure_flags: string[];
  general_notes: string;
}
