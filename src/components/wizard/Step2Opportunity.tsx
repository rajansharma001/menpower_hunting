import React from 'react';
import { WizardFormData } from '../../types/form';
import { COUNTRIES } from '../../constants/countries';
import { JOB_SECTORS } from '../../constants/jobSectors';
import { Globe2, Briefcase, Building, MapPin } from 'lucide-react';
import { EmployerIdentified, IntermediaryType } from '../../types/database';
import { getDefaultCurrencyForCountry } from '../../lib/currency';

interface Step2Props {
  formData: WizardFormData;
  onChange: (field: keyof WizardFormData, value: any) => void;
}

export const Step2Opportunity: React.FC<Step2Props> = ({ formData, onChange }) => {
  return (
    <div className="space-y-4">
      {/* Country Selection */}
      <div className="bg-white border border-slate-200 rounded-md p-4 space-y-3">
        <label className="block text-xs font-semibold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
          <Globe2 className="w-3.5 h-3.5 text-teal-700" />
          <span>Country <span className="text-red-500">*</span></span>
        </label>
        <select
          required
          value={formData.country}
          onChange={e => {
            const selected = e.target.value;
            onChange('country', selected);
            const defaultCurr = getDefaultCurrencyForCountry(selected);
            onChange('salary_currency', defaultCurr);
            onChange('net_salary_currency', defaultCurr);
          }}
          className="w-full bg-white border border-slate-300 rounded px-3 py-2.5 text-sm text-slate-900 focus:outline-none focus:ring-1 focus:ring-teal-600 font-medium"
        >
          <option value="" disabled>-- Select Destination Country --</option>
          {COUNTRIES.map(c => (
            <option key={c.name} value={c.name}>
              {c.name} ({c.region})
            </option>
          ))}
        </select>
      </div>

      {/* Job Title & Sector */}
      <div className="bg-white border border-slate-200 rounded-md p-4 space-y-3">
        <div>
          <label className="block text-xs font-semibold text-slate-800 uppercase tracking-wider mb-1 flex items-center gap-1.5">
            <Briefcase className="w-3.5 h-3.5 text-teal-700" />
            <span>Job Title / Role <span className="text-red-500">*</span></span>
          </label>
          <input
            type="text"
            required
            placeholder="e.g. Warehouse Associate / Bakery Assistant / Mason"
            className="w-full bg-white border border-slate-300 rounded px-3 py-2.5 text-sm text-slate-900 focus:outline-none focus:ring-1 focus:ring-teal-600"
            value={formData.job_title}
            onChange={e => onChange('job_title', e.target.value)}
          />
        </div>

        <div>
          <label className="block text-xs font-medium text-slate-600 mb-1">
            Job Sector
          </label>
          <select
            value={formData.job_sector}
            onChange={e => onChange('job_sector', e.target.value)}
            className="w-full bg-white border border-slate-300 rounded px-3 py-2 text-sm text-slate-800 focus:outline-none"
          >
            <option value="">-- Select Job Sector --</option>
            {JOB_SECTORS.map(sector => (
              <option key={sector} value={sector}>
                {sector}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Employer Details */}
      <div className="bg-white border border-slate-200 rounded-md p-4 space-y-4">
        <div className="text-xs font-semibold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
          <Building className="w-3.5 h-3.5 text-teal-700" />
          <span>Employer Information</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1">
              Employer / Company Name
            </label>
            <input
              type="text"
              placeholder="e.g. Baltic Logistics Sp. z o.o."
              className="w-full bg-white border border-slate-300 rounded px-3 py-2 text-sm text-slate-900 focus:outline-none"
              value={formData.employer_name}
              onChange={e => onChange('employer_name', e.target.value)}
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1 flex items-center gap-1">
              <MapPin className="w-3 h-3 text-slate-400" />
              <span>Employer City / Region</span>
            </label>
            <input
              type="text"
              placeholder="e.g. Poznań / Zagreb / Bucharest"
              className="w-full bg-white border border-slate-300 rounded px-3 py-2 text-sm text-slate-900 focus:outline-none"
              value={formData.employer_city}
              onChange={e => onChange('employer_city', e.target.value)}
            />
          </div>
        </div>

        {/* Employer Identified */}
        <div>
          <label className="block text-xs font-medium text-slate-700 mb-1.5">
            Was the employer explicitly identified / disclosed?
          </label>
          <div className="grid grid-cols-3 gap-2">
            {(['Yes', 'No', 'Not Clear'] as EmployerIdentified[]).map(val => (
              <button
                key={val}
                type="button"
                onClick={() => onChange('employer_identified', val)}
                className={`py-2 px-3 text-xs rounded border text-center font-medium transition ${
                  formData.employer_identified === val
                    ? 'bg-teal-700 text-white border-teal-700 shadow-xs'
                    : 'bg-slate-50 text-slate-700 border-slate-300 hover:bg-slate-100'
                }`}
              >
                {val}
              </button>
            ))}
          </div>
        </div>

        {/* Intermediary Type */}
        <div>
          <label className="block text-xs font-medium text-slate-700 mb-1.5">
            Hiring Relationship / Intermediary
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
            {(['Direct Employer', 'Through Sub-agency / Broker', 'Not Clear'] as IntermediaryType[]).map(type => (
              <button
                key={type}
                type="button"
                onClick={() => onChange('intermediary_type', type)}
                className={`py-2 px-3 text-xs rounded border text-center font-medium transition ${
                  formData.intermediary_type === type
                    ? 'bg-teal-700 text-white border-teal-700 shadow-xs'
                    : 'bg-slate-50 text-slate-700 border-slate-300 hover:bg-slate-100'
                }`}
              >
                {type}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
