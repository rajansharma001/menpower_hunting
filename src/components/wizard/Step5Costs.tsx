import React, { useState } from 'react';
import { WizardFormData } from '../../types/form';
import { CostBreakdownStatus } from '../../types/database';
import { Banknote, ChevronDown, ChevronUp, Calculator } from 'lucide-react';

interface Step5Props {
  formData: WizardFormData;
  onChange: (field: keyof WizardFormData, value: any) => void;
}

export const Step5Costs: React.FC<Step5Props> = ({ formData, onChange }) => {
  const [showAllBreakdown, setShowAllBreakdown] = useState(true);

  // Compute Itemized Total (sum of individual NPR costs)
  const itemizedTotal =
    (parseFloat(formData.agency_service_charge || '0') || 0) +
    (parseFloat(formData.government_processing_fee || '0') || 0) +
    (parseFloat(formData.medical_exam || '0') || 0) +
    (parseFloat(formData.insurance || '0') || 0) +
    (parseFloat(formData.visa_fee || '0') || 0) +
    (parseFloat(formData.documentation || '0') || 0) +
    (parseFloat(formData.translation || '0') || 0) +
    (parseFloat(formData.training || '0') || 0) +
    (parseFloat(formData.air_ticket || '0') || 0) +
    (parseFloat(formData.miscellaneous || '0') || 0);

  const quotedTotal = parseFloat(formData.total_quoted_cost || '0') || 0;
  const unaccountedDifference = quotedTotal - itemizedTotal;

  const costFields: { field: keyof WizardFormData; label: string; placeholder: string }[] = [
    { field: 'agency_service_charge', label: 'Agency Service Charge', placeholder: 'e.g. 350000' },
    { field: 'government_processing_fee', label: 'Government Processing Fee (DoFE)', placeholder: 'e.g. 25000' },
    { field: 'air_ticket', label: 'Air Ticket', placeholder: 'e.g. 90000' },
    { field: 'visa_fee', label: 'Visa & VFS Fee', placeholder: 'e.g. 20000' },
    { field: 'medical_exam', label: 'Medical Examination', placeholder: 'e.g. 12000' },
    { field: 'insurance', label: 'Foreign Employment Insurance', placeholder: 'e.g. 15000' },
    { field: 'documentation', label: 'Documentation / Attestation', placeholder: 'e.g. 15000' },
    { field: 'translation', label: 'Translation (Apostille / Police Report)', placeholder: 'e.g. 10000' },
    { field: 'training', label: 'Orientation / Pre-departure Training', placeholder: 'e.g. 5000' },
    { field: 'miscellaneous', label: 'Miscellaneous / Other', placeholder: 'e.g. 10000' },
  ];

  return (
    <div className="space-y-4">
      {/* Agency Quoted Total (Primary required comparison target) */}
      <div className="bg-white border-2 border-teal-800/20 rounded-md p-4 space-y-2">
        <label className="block text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center justify-between">
          <span className="flex items-center gap-1.5">
            <Banknote className="w-4 h-4 text-teal-700" />
            <span>Agency Quoted Total Cost (NPR) <span className="text-red-500">*</span></span>
          </span>
          <span className="text-2xs font-normal text-slate-500">Gross total stated by agency</span>
        </label>
        <input
          type="number"
          inputMode="numeric"
          required
          placeholder="e.g. 650000"
          className="w-full bg-white border border-slate-300 rounded px-3 py-2.5 text-base font-bold text-slate-900 focus:outline-none focus:ring-1 focus:ring-teal-600"
          value={formData.total_quoted_cost}
          onChange={e => onChange('total_quoted_cost', e.target.value)}
        />
      </div>

      {/* Itemized Cost Breakdown Rows */}
      <div className="bg-white border border-slate-200 rounded-md overflow-hidden">
        <button
          type="button"
          onClick={() => setShowAllBreakdown(!showAllBreakdown)}
          className="w-full p-3 bg-slate-50 border-b border-slate-200 flex items-center justify-between text-left hover:bg-slate-100 transition"
        >
          <div className="flex items-center space-x-2">
            <Calculator className="w-4 h-4 text-teal-700" />
            <span className="text-xs font-semibold text-slate-800 uppercase tracking-wider">
              Itemized Cost Breakdown (NPR)
            </span>
          </div>
          <div className="flex items-center space-x-2 text-xs text-slate-600">
            <span>Itemized: NPR {itemizedTotal.toLocaleString()}</span>
            {showAllBreakdown ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </div>
        </button>

        {showAllBreakdown && (
          <div className="p-3 divide-y divide-slate-100">
            {costFields.map(({ field, label, placeholder }) => (
              <div key={field} className="py-2 flex items-center justify-between gap-2">
                <label className="text-xs text-slate-700 flex-1">{label}</label>
                <div className="w-36 sm:w-44 flex-shrink-0">
                  <input
                    type="number"
                    inputMode="numeric"
                    placeholder={placeholder}
                    className="w-full bg-white border border-slate-300 rounded px-2.5 py-1.5 text-xs text-right text-slate-900 font-medium focus:outline-none"
                    value={formData[field] as string}
                    onChange={e => onChange(field, e.target.value)}
                  />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Automatic Calculation & Difference Card */}
      <div className="bg-slate-50 border border-slate-300 rounded-md p-4 space-y-2">
        <div className="flex items-center justify-between text-xs text-slate-700 py-1">
          <span>Calculated Itemized Total:</span>
          <span className="font-semibold text-slate-900">
            NPR {itemizedTotal.toLocaleString()}
          </span>
        </div>

        <div className="flex items-center justify-between text-xs text-slate-700 py-1 border-t border-slate-200">
          <span>Agency Quoted Total:</span>
          <span className="font-semibold text-slate-900">
            NPR {quotedTotal.toLocaleString()}
          </span>
        </div>

        <div className="flex items-center justify-between text-sm py-2 border-t-2 border-slate-300 font-bold">
          <span className="text-slate-800">Unaccounted Difference:</span>
          <span className={unaccountedDifference !== 0 ? 'text-amber-800' : 'text-emerald-800'}>
            NPR {unaccountedDifference.toLocaleString()}
          </span>
        </div>

        {unaccountedDifference > 0 && (
          <div className="text-2xs text-slate-600 bg-white border border-slate-200 rounded p-2">
            The agency quoted NPR {quotedTotal.toLocaleString()} but the specific itemized items total NPR {itemizedTotal.toLocaleString()}. Difference is recorded neutrally as Unaccounted Difference.
          </div>
        )}
      </div>

      {/* Written & Breakdown Status */}
      <div className="bg-white border border-slate-200 rounded-md p-4 space-y-3">
        <div>
          <label className="block text-xs font-medium text-slate-700 mb-1.5">
            Was the quoted total provided in writing?
          </label>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => onChange('written_cost', true)}
              className={`py-2 text-xs rounded border font-medium transition ${
                formData.written_cost === true
                  ? 'bg-teal-700 text-white border-teal-700'
                  : 'bg-slate-50 text-slate-700 border-slate-300 hover:bg-slate-100'
              }`}
            >
              Yes (Brochure / Paper / Slip)
            </button>
            <button
              type="button"
              onClick={() => onChange('written_cost', false)}
              className={`py-2 text-xs rounded border font-medium transition ${
                formData.written_cost === false
                  ? 'bg-teal-700 text-white border-teal-700'
                  : 'bg-slate-50 text-slate-700 border-slate-300 hover:bg-slate-100'
              }`}
            >
              No (Verbal Only)
            </button>
          </div>
        </div>

        <div>
          <label className="block text-xs font-medium text-slate-700 mb-1.5">
            Cost Breakdown Transparency
          </label>
          <div className="grid grid-cols-3 gap-2">
            {(['Full', 'Partial', 'Lump Sum'] as CostBreakdownStatus[]).map(st => (
              <button
                key={st}
                type="button"
                onClick={() => onChange('cost_breakdown_status', st)}
                className={`py-2 text-xs rounded border text-center font-medium transition ${
                  formData.cost_breakdown_status === st
                    ? 'bg-teal-700 text-white border-teal-700'
                    : 'bg-slate-50 text-slate-700 border-slate-300 hover:bg-slate-100'
                }`}
              >
                {st}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
