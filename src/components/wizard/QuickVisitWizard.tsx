import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { WizardFormData } from '../../types/form';
import { Agency } from '../../types/database';
import { useData } from '../../context/DataContext';
import { Step1Agency } from './Step1Agency';
import { Step2Opportunity } from './Step2Opportunity';
import { Step3Salary } from './Step3Salary';
import { Step4Living } from './Step4Living';
import { Step5Costs } from './Step5Costs';
import { Step6Documents } from './Step6Documents';
import { Step7TimelinePayment } from './Step7TimelinePayment';
import { Step8NotesReview } from './Step8NotesReview';
import { ArrowLeft, ArrowRight, CheckCircle2, RotateCcw } from 'lucide-react';

const DRAFT_KEY = 'mph_wizard_draft_v1';

const INITIAL_FORM: WizardFormData = {
  agency_id: '',
  agency_name: '',
  agency_location: '',
  contact_person: '',
  phone: '',
  license_number: '',
  website: '',
  social_link: '',
  visit_date: new Date().toISOString().split('T')[0],
  discovery_channel: 'Walk-in',
  visit_notes: '',

  country: '',
  job_title: '',
  job_sector: '',
  employer_name: '',
  employer_city: '',
  employer_identified: 'Not Clear',
  intermediary_type: 'Direct Employer',

  advertised_salary: '',
  salary_currency: 'EUR',
  salary_type: 'Gross',
  expected_net_salary: '',
  net_salary_currency: 'EUR',
  working_hours: '8',
  working_days: '5',
  overtime_status: 'Available',
  overtime_rate: '',
  contract_length: '2 Years',
  probation: '3 Months',

  accommodation_type: 'Free / Provided',
  accommodation_cost: '',
  food_arrangement: 'Duty Meal',
  transportation: 'Free Company Bus',

  agency_service_charge: '',
  government_processing_fee: '25000',
  medical_exam: '12000',
  insurance: '15000',
  visa_fee: '20000',
  documentation: '10000',
  translation: '8000',
  training: '0',
  air_ticket: '90000',
  miscellaneous: '',
  total_quoted_cost: '',
  written_cost: false,
  cost_breakdown_status: 'Partial',

  work_permit_status: 'Employer Processing',
  dofe_lot_number: '',
  free_visa_free_ticket: false,
  documents_shown: {},

  estimated_total_processing_time: '4–6 months',
  timeline_basis: 'Agency Historical Average',
  payment_stages: ['After Offer Letter'],
  payment_method: 'Bank Transfer',
  receipt_status: 'Provided',
  refund_policy: 'Written Terms',
  refund_notes: '',

  evidence_status: 'Needs Verification',
  pressure_flags: ['None observed'],
  general_notes: ''
};

const STEP_TITLES = [
  'Agency Details',
  'Opportunity & Job',
  'Salary & Schedule',
  'Living Conditions',
  'Money & Costs (NPR)',
  'Work Permit & Docs',
  'Timeline & Payment',
  'Notes & Final Save'
];

export const QuickVisitWizard: React.FC = () => {
  const [searchParams] = useSearchParams();
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState<WizardFormData>(INITIAL_FORM);
  const [saving, setSaving] = useState(false);
  const [savedSuccessInfo, setSavedSuccessInfo] = useState<{ oppId: string; title: string } | null>(null);

  // When adding multiple opportunities under the same visit
  const [activeAgencyId, setActiveAgencyId] = useState<string | undefined>(undefined);
  const [activeVisitId, setActiveVisitId] = useState<string | undefined>(undefined);
  const [opportunitiesCountThisVisit, setOpportunitiesCountThisVisit] = useState(0);

  const { agencies, saveOpportunity, showToast } = useData();
  const navigate = useNavigate();

  // Load auto-draft from local storage on mount & check search params
  useEffect(() => {
    const savedDraft = localStorage.getItem(DRAFT_KEY);
    if (savedDraft) {
      try {
        const parsed = JSON.parse(savedDraft);
        setFormData(parsed);
      } catch (e) {
        console.error('Error parsing wizard draft', e);
      }
    }

    const paramCountry = searchParams.get('country');
    const paramAgencyId = searchParams.get('agencyId');

    if (paramCountry) {
      setFormData(prev => ({ ...prev, country: paramCountry }));
    }
    if (paramAgencyId && agencies.length > 0) {
      const matched = agencies.find(a => a.id === paramAgencyId);
      if (matched) {
        handleAgencySelect(matched);
      }
    }
  }, [searchParams, agencies]);

  // Save auto-draft on field changes
  const updateField = (field: keyof WizardFormData, value: any) => {
    setFormData(prev => {
      const updated = { ...prev, [field]: value };
      localStorage.setItem(DRAFT_KEY, JSON.stringify(updated));
      return updated;
    });
  };

  const handleAgencySelect = (agency: Agency) => {
    setFormData(prev => ({
      ...prev,
      agency_id: agency.id,
      agency_name: agency.name,
      agency_location: agency.location || '',
      contact_person: agency.contact_person || '',
      phone: agency.phone || '',
      license_number: agency.license_number || '',
      website: agency.website || '',
      social_link: agency.social_link || ''
    }));
    setActiveAgencyId(agency.id);
  };

  const canProceed = () => {
    if (currentStep === 1) {
      return formData.agency_name.trim().length > 0;
    }
    if (currentStep === 2) {
      return formData.country.trim().length > 0 && formData.job_title.trim().length > 0;
    }
    if (currentStep === 5) {
      return (parseFloat(formData.total_quoted_cost || '0') || 0) > 0;
    }
    return true;
  };

  const handleNext = () => {
    if (!canProceed()) {
      if (currentStep === 1) showToast('Agency Name is required to continue.', 'warning');
      if (currentStep === 2) showToast('Country and Job Title are required.', 'warning');
      if (currentStep === 5) showToast('Quoted Total Cost is required.', 'warning');
      return;
    }
    if (currentStep < 8) {
      setCurrentStep(prev => prev + 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(prev => prev - 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleResetDraft = () => {
    if (window.confirm('Reset this visit form and start fresh?')) {
      localStorage.removeItem(DRAFT_KEY);
      setFormData(INITIAL_FORM);
      setCurrentStep(1);
      setActiveAgencyId(undefined);
      setActiveVisitId(undefined);
      setOpportunitiesCountThisVisit(0);
      setSavedSuccessInfo(null);
    }
  };

  const handleSave = async (mode: 'standard' | 'add_another' | 'add_followup') => {
    setSaving(true);
    try {
      const result = await saveOpportunity(formData, activeAgencyId, activeVisitId);
      setActiveAgencyId(result.agencyId);
      setActiveVisitId(result.visitId);
      setOpportunitiesCountThisVisit(prev => prev + 1);

      setSavedSuccessInfo({
        oppId: result.opportunityId,
        title: `${formData.country} — ${formData.job_title}`
      });

      if (mode === 'add_another') {
        // Retain agency and visit details, reset opportunity-specific fields
        setFormData(prev => ({
          ...INITIAL_FORM,
          agency_id: result.agencyId,
          agency_name: prev.agency_name,
          agency_location: prev.agency_location,
          contact_person: prev.contact_person,
          phone: prev.phone,
          license_number: prev.license_number,
          website: prev.website,
          social_link: prev.social_link,
          visit_date: prev.visit_date,
          discovery_channel: prev.discovery_channel,
          visit_notes: prev.visit_notes,
          salary_currency: prev.salary_currency,
        }));
        setCurrentStep(2); // Jump directly to Opportunity step
        showToast('Saved! Add your next opportunity for this agency visit.', 'success');
        window.scrollTo({ top: 0, behavior: 'smooth' });
      } else if (mode === 'add_followup') {
        localStorage.removeItem(DRAFT_KEY);
        navigate(`/follow-ups?newFor=${result.opportunityId}`);
      } else {
        // Standard save completed: keep confirmation on screen with easy links
        localStorage.removeItem(DRAFT_KEY);
      }
    } catch (err: any) {
      showToast(err.message || 'Error saving opportunity', 'error');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto px-4 py-4 sm:py-6">
      {/* Top Header & Reset Draft */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-200 mb-4">
        <div>
          <h1 className="text-lg font-bold text-slate-900 leading-tight">
            Record Agency Visit
          </h1>
          <p className="text-xs text-slate-500">
            Field notebook • Fast 2–3 minute data capture
          </p>
        </div>
        <button
          onClick={handleResetDraft}
          title="Reset Draft Form"
          className="flex items-center space-x-1 text-2xs text-slate-500 hover:text-red-700 px-2 py-1 rounded border border-slate-200 hover:border-slate-300 transition"
        >
          <RotateCcw className="w-3 h-3" />
          <span className="hidden sm:inline">Reset Draft</span>
        </button>
      </div>

      {/* Multiple opportunities counter notice */}
      {opportunitiesCountThisVisit > 0 && (
        <div className="mb-4 p-2.5 bg-teal-50 border border-teal-200 rounded-md text-xs text-teal-900 flex items-center justify-between">
          <span>
            <strong>{opportunitiesCountThisVisit}</strong> opportunity recorded under visit to{' '}
            <strong>{formData.agency_name}</strong>.
          </span>
          <span className="text-2xs font-semibold uppercase tracking-wider bg-teal-700 text-white px-1.5 py-0.5 rounded">
            Same Visit
          </span>
        </div>
      )}

      {/* Confirmation Card after saving */}
      {savedSuccessInfo && (
        <div className="mb-4 p-3.5 bg-emerald-50 border border-emerald-300 rounded-md text-emerald-900 text-xs flex items-center justify-between animate-in fade-in duration-150">
          <div className="flex items-center space-x-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-700 flex-shrink-0" />
            <div>
              <span className="font-semibold">Opportunity saved successfully: </span>
              <span>{savedSuccessInfo.title}</span>
            </div>
          </div>
          <button
            onClick={() => navigate(`/opportunities/${savedSuccessInfo.oppId}`)}
            className="font-medium underline hover:text-emerald-950 ml-2 whitespace-nowrap"
          >
            View Details →
          </button>
        </div>
      )}

      {/* Wizard Progress Bar */}
      <div className="mb-5">
        <div className="flex items-center justify-between text-xs font-semibold text-slate-700 mb-1.5">
          <span className="text-teal-800">
            Step {currentStep} of 8: {STEP_TITLES[currentStep - 1]}
          </span>
          <span className="text-slate-400 text-2xs">
            {Math.round((currentStep / 8) * 100)}% Completed
          </span>
        </div>
        <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden">
          <div
            className="bg-teal-700 h-full transition-all duration-200"
            style={{ width: `${(currentStep / 8) * 100}%` }}
          />
        </div>
      </div>

      {/* Step Components */}
      <div className="mb-20">
        {currentStep === 1 && (
          <Step1Agency
            formData={formData}
            existingAgencies={agencies}
            onChange={updateField}
            onAgencySelect={handleAgencySelect}
          />
        )}
        {currentStep === 2 && (
          <Step2Opportunity formData={formData} onChange={updateField} />
        )}
        {currentStep === 3 && (
          <Step3Salary formData={formData} onChange={updateField} />
        )}
        {currentStep === 4 && (
          <Step4Living formData={formData} onChange={updateField} />
        )}
        {currentStep === 5 && (
          <Step5Costs formData={formData} onChange={updateField} />
        )}
        {currentStep === 6 && (
          <Step6Documents formData={formData} onChange={updateField} />
        )}
        {currentStep === 7 && (
          <Step7TimelinePayment formData={formData} onChange={updateField} />
        )}
        {currentStep === 8 && (
          <Step8NotesReview
            formData={formData}
            saving={saving}
            onChange={updateField}
            onSave={handleSave}
          />
        )}
      </div>

      {/* Sticky Bottom Actions Bar */}
      <div className="fixed bottom-14 md:bottom-0 left-0 right-0 z-30 bg-white border-t border-slate-200 p-3 sm:px-6 shadow-md md:pl-64">
        <div className="max-w-2xl mx-auto flex items-center justify-between gap-3">
          <button
            type="button"
            onClick={handleBack}
            disabled={currentStep === 1}
            className="px-4 py-2.5 rounded-md border border-slate-300 text-slate-700 hover:bg-slate-50 disabled:opacity-30 disabled:pointer-events-none text-xs font-semibold flex items-center space-x-1.5 transition"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back</span>
          </button>

          <span className="text-2xs text-slate-400 font-mono">
            {currentStep}/8
          </span>

          {currentStep < 8 ? (
            <button
              type="button"
              onClick={handleNext}
              className="px-5 py-2.5 rounded-md bg-teal-700 hover:bg-teal-600 text-white text-xs font-semibold flex items-center space-x-1.5 shadow-xs transition"
            >
              <span>Continue</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          ) : (
            <button
              type="button"
              onClick={() => handleSave('standard')}
              disabled={saving}
              className="px-5 py-2.5 rounded-md bg-teal-700 hover:bg-teal-600 disabled:opacity-50 text-white text-xs font-semibold flex items-center space-x-1.5 shadow-xs transition"
            >
              <span>{saving ? 'Saving...' : 'Save Opportunity'}</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
