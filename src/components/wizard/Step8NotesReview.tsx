import React from 'react';
import { WizardFormData } from '../../types/form';
import { EvidenceStatus } from '../../types/database';
import { PRESSURE_FLAGS } from '../../constants/workflowOptions';
import { ShieldAlert, CheckCircle2, AlertCircle, BookmarkPlus, CalendarPlus, Save } from 'lucide-react';
import { evaluateSafetyScore } from '../../lib/safety';

interface Step8Props {
  formData: WizardFormData;
  saving: boolean;
  onChange: (field: keyof WizardFormData, value: any) => void;
  onSave: (mode: 'standard' | 'add_another' | 'add_followup') => void;
}

export const Step8NotesReview: React.FC<Step8Props> = ({
  formData,
  saving,
  onChange,
  onSave
}) => {
  const togglePressureFlag = (flag: string) => {
    let current = [...(formData.pressure_flags || [])];
    if (flag === 'None observed') {
      current = ['None observed'];
    } else {
      current = current.filter(f => f !== 'None observed');
      const idx = current.indexOf(flag);
      if (idx !== -1) {
        current.splice(idx, 1);
      } else {
        current.push(flag);
      }
      if (current.length === 0) current = ['None observed'];
    }
    onChange('pressure_flags', current);
  };

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
  const difference = quotedTotal - itemizedTotal;

  const safety = evaluateSafetyScore({
    pressure_flags: formData.pressure_flags,
    receipt_status: formData.receipt_status,
    payment_method: formData.payment_method,
    payment_stages: formData.payment_stages,
    timeline_basis: formData.timeline_basis,
    written_cost: formData.written_cost,
    dofe_lot_number: formData.dofe_lot_number,
    country: formData.country
  });

  return (
    <div className="space-y-4">
      {/* Evidence Status */}
      <div className="bg-white border border-slate-200 rounded-md p-4 space-y-3">
        <label className="block text-xs font-semibold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
          <ShieldAlert className="w-3.5 h-3.5 text-teal-700" />
          <span>Overall Initial Evidence Status</span>
        </label>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {(['Verified', 'Partially Verified', 'Needs Verification', 'Not Provided'] as EvidenceStatus[]).map(st => (
            <button
              key={st}
              type="button"
              onClick={() => onChange('evidence_status', st)}
              className={`py-2 px-2 text-xs rounded border text-center font-medium transition ${
                formData.evidence_status === st
                  ? 'bg-teal-700 text-white border-teal-700 shadow-xs'
                  : 'bg-slate-50 text-slate-700 border-slate-300 hover:bg-slate-100'
              }`}
            >
              {st}
            </button>
          ))}
        </div>
      </div>

      {/* Pressure / Factual Observations */}
      <div className="bg-white border border-slate-200 rounded-md p-4 space-y-3">
        <div className="flex items-center justify-between">
          <label className="block text-xs font-semibold text-slate-800 uppercase tracking-wider">
            Office Observations & Pressure Indicators
          </label>
          <span className="text-2xs text-slate-500">Factual record only</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {PRESSURE_FLAGS.map(flag => {
            const isSelected = (formData.pressure_flags || []).includes(flag);
            return (
              <button
                key={flag}
                type="button"
                onClick={() => togglePressureFlag(flag)}
                className={`py-2 px-2.5 text-xs rounded border text-left font-medium transition flex items-center justify-between ${
                  isSelected
                    ? 'bg-slate-800 text-white border-slate-800'
                    : 'bg-slate-50 text-slate-700 border-slate-300 hover:bg-slate-100'
                }`}
              >
                <span>{flag}</span>
                {isSelected && <span className="text-2xs">✓</span>}
              </button>
            );
          })}
        </div>
      </div>

      {/* Live Safety Assessment Card */}
      <div className={`p-3.5 rounded-md border text-xs space-y-2.5 ${
        safety.riskLevel === 'danger'
          ? 'bg-red-50/90 border-red-300 text-red-950'
          : safety.riskLevel === 'caution'
          ? 'bg-amber-50/90 border-amber-300 text-amber-950'
          : 'bg-emerald-50/90 border-emerald-300 text-emerald-950'
      }`}>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 border-b border-slate-200/80 pb-2">
          <span className="font-bold flex items-center gap-1.5 text-xs text-slate-900">
            <ShieldAlert className="w-4 h-4 text-amber-700 flex-shrink-0" />
            <span>Consultancy Safety & Red-Flag Audit (सुरक्षा मूल्याङ्कन)</span>
          </span>
          <span className={`text-2xs font-bold px-2 py-0.5 rounded border self-start sm:self-auto ${safety.riskBadgeColor}`}>
            {safety.riskBadgeLabel}
          </span>
        </div>

        {safety.criticalBanners.length > 0 && (
          <div className="space-y-1.5">
            {safety.criticalBanners.map((banner, idx) => (
              <div key={idx} className="p-2 bg-white rounded border border-red-300 text-2xs font-bold text-red-900 flex items-start gap-1.5">
                <span className="text-sm leading-none">🛑</span>
                <span className="leading-snug">{banner}</span>
              </div>
            ))}
          </div>
        )}

        <div className="flex flex-wrap gap-1.5 pt-0.5">
          {safety.checks.map(check => (
            <span
              key={check.id}
              className={`px-2 py-0.5 rounded border text-2xs ${
                check.status === 'critical'
                  ? 'bg-red-100 text-red-900 border-red-300 font-bold'
                  : check.status === 'warning'
                  ? 'bg-amber-100 text-amber-900 border-amber-300 font-medium'
                  : 'bg-white text-emerald-800 border-emerald-200'
              }`}
            >
              {check.status === 'pass' ? '✓ ' : check.status === 'critical' ? '🚨 ' : '⚠️ '}
              {check.titleNp}
            </span>
          ))}
        </div>
      </div>

      {/* Field Notes */}
      <div className="bg-white border border-slate-200 rounded-md p-4 space-y-2">
        <label className="block text-xs font-semibold text-slate-800 uppercase tracking-wider">
          Quick Visit & Conversation Notes
        </label>
        <textarea
          rows={3}
          placeholder="e.g. Counselor mentioned 15 people leaving next week; showed WhatsApp group of previous workers; seemed confident on Polish quota."
          className="w-full bg-white border border-slate-300 rounded p-2.5 text-xs text-slate-900 focus:outline-none"
          value={formData.general_notes}
          onChange={e => onChange('general_notes', e.target.value)}
        />
      </div>

      {/* Opportunity Review Summary Card */}
      <div className="bg-slate-900 text-white rounded-md p-4 space-y-3 shadow-xs">
        <div className="flex items-center justify-between border-b border-slate-800 pb-2">
          <span className="text-xs font-bold uppercase tracking-wider text-teal-400">
            Review Opportunity Record
          </span>
          <span className="text-2xs text-slate-400">Ready to save</span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 gap-x-4 gap-y-2 text-xs">
          <div>
            <span className="text-slate-400 text-2xs block">Agency</span>
            <span className="font-semibold">{formData.agency_name || '—'}</span>
          </div>

          <div>
            <span className="text-slate-400 text-2xs block">Country</span>
            <span className="font-semibold text-teal-300">{formData.country || '—'}</span>
          </div>

          <div>
            <span className="text-slate-400 text-2xs block">Job Role</span>
            <span className="font-semibold">{formData.job_title || '—'}</span>
          </div>

          <div>
            <span className="text-slate-400 text-2xs block">Employer</span>
            <span className="font-medium text-slate-200">{formData.employer_name || 'Not Disclosed'}</span>
          </div>

          <div>
            <span className="text-slate-400 text-2xs block">Salary</span>
            <span className="font-medium">
              {formData.advertised_salary ? `${formData.advertised_salary} ${formData.salary_currency}` : '—'}
              {formData.expected_net_salary && ` (Net: ${formData.expected_net_salary})`}
            </span>
          </div>

          <div>
            <span className="text-slate-400 text-2xs block">Total Quoted Cost</span>
            <span className="font-bold text-amber-300">
              NPR {quotedTotal.toLocaleString()}
            </span>
          </div>

          <div>
            <span className="text-slate-400 text-2xs block">Unaccounted Difference</span>
            <span className="font-medium text-slate-200">
              NPR {difference.toLocaleString()}
            </span>
          </div>

          <div>
            <span className="text-slate-400 text-2xs block">Accommodation</span>
            <span className="font-medium">{formData.accommodation_type}</span>
          </div>

          <div>
            <span className="text-slate-400 text-2xs block">Work Permit</span>
            <span className="font-medium text-blue-300">{formData.work_permit_status}</span>
          </div>

          <div>
            <span className="text-slate-400 text-2xs block">Estimated Processing</span>
            <span className="font-medium">{formData.estimated_total_processing_time || '—'}</span>
          </div>

          <div>
            <span className="text-slate-400 text-2xs block">Evidence Status</span>
            <span className="font-semibold text-emerald-300">{formData.evidence_status}</span>
          </div>
        </div>
      </div>

      {/* Save Action Buttons */}
      <div className="space-y-2 pt-2">
        <button
          type="button"
          disabled={saving}
          onClick={() => onSave('standard')}
          className="w-full flex items-center justify-center space-x-2 py-3 bg-teal-700 hover:bg-teal-600 disabled:opacity-50 text-white font-semibold rounded-md shadow-sm text-sm transition"
        >
          <Save className="w-4 h-4" />
          <span>{saving ? 'Saving...' : 'Save Opportunity'}</span>
        </button>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          <button
            type="button"
            disabled={saving}
            onClick={() => onSave('add_another')}
            className="flex items-center justify-center space-x-1.5 py-2.5 bg-slate-800 hover:bg-slate-700 disabled:opacity-50 text-white text-xs font-medium rounded-md transition"
          >
            <BookmarkPlus className="w-3.5 h-3.5 text-teal-400" />
            <span>Save & Add Another Opportunity</span>
          </button>

          <button
            type="button"
            disabled={saving}
            onClick={() => onSave('add_followup')}
            className="flex items-center justify-center space-x-1.5 py-2.5 bg-slate-100 hover:bg-slate-200 border border-slate-300 disabled:opacity-50 text-slate-800 text-xs font-medium rounded-md transition"
          >
            <CalendarPlus className="w-3.5 h-3.5 text-amber-700" />
            <span>Save & Schedule Follow-up</span>
          </button>
        </div>
      </div>
    </div>
  );
};
