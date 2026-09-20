import React from 'react';
import { WizardFormData } from '../../types/form';
import { CURRENCIES } from '../../constants/currencies';
import { SalaryType, OvertimeStatus } from '../../types/database';
import { DollarSign, Clock, Calendar, Shield } from 'lucide-react';
import { convertToNpr, formatNpr, NRB_BENCHMARK_RATES } from '../../lib/currency';

interface Step3Props {
  formData: WizardFormData;
  onChange: (field: keyof WizardFormData, value: any) => void;
}

export const Step3Salary: React.FC<Step3Props> = ({ formData, onChange }) => {
  const advSalaryNum = parseFloat(formData.advertised_salary) || 0;
  const netSalaryNum = parseFloat(formData.expected_net_salary) || 0;
  const currCode = formData.salary_currency || 'EUR';
  const currRate = NRB_BENCHMARK_RATES[currCode] || 1;

  return (
    <div className="space-y-4">
      {/* Salary & Currency */}
      <div className="bg-white border border-slate-200 rounded-md p-4 space-y-3">
        <label className="block text-xs font-semibold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
          <DollarSign className="w-3.5 h-3.5 text-teal-700" />
          <span>Advertised Salary & Currency</span>
        </label>

        <div className="grid grid-cols-3 gap-2">
          <div className="col-span-2">
            <label className="block text-xs font-medium text-slate-600 mb-1">
              Advertised Salary Amount
            </label>
            <input
              type="number"
              inputMode="numeric"
              placeholder="e.g. 4200 or 950"
              className="w-full bg-white border border-slate-300 rounded px-3 py-2 text-sm text-slate-900 focus:outline-none focus:ring-1 focus:ring-teal-600 font-medium"
              value={formData.advertised_salary}
              onChange={e => onChange('advertised_salary', e.target.value)}
            />
            {advSalaryNum > 0 && currCode !== 'NPR' && (
              <div className="mt-1.5 text-2xs text-teal-900 font-semibold bg-teal-50 border border-teal-200 rounded px-2 py-0.5 inline-flex items-center gap-1">
                <span>≈ {formatNpr(convertToNpr(advSalaryNum, currCode))} / month</span>
                <span className="text-slate-500 font-normal">
                  (1 {currCode} = NPR {currRate})
                </span>
              </div>
            )}
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1">
              Currency
            </label>
            <select
              value={formData.salary_currency}
              onChange={e => {
                onChange('salary_currency', e.target.value);
                if (!formData.net_salary_currency) {
                  onChange('net_salary_currency', e.target.value);
                }
              }}
              className="w-full bg-white border border-slate-300 rounded px-2.5 py-2 text-sm text-slate-900 focus:outline-none"
            >
              {CURRENCIES.map(curr => (
                <option key={curr.code} value={curr.code}>
                  {curr.code} ({curr.symbol}) {curr.region ? `[${curr.region}]` : ''}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Salary Type: Gross vs Net */}
        <div>
          <label className="block text-xs font-medium text-slate-700 mb-1.5">
            Salary Quoted As
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {(['Gross', 'Net / Take-home', 'Both', 'Unclear'] as SalaryType[]).map(type => (
              <button
                key={type}
                type="button"
                onClick={() => onChange('salary_type', type)}
                className={`py-2 px-2 text-xs rounded border text-center font-medium transition ${
                  formData.salary_type === type
                    ? 'bg-teal-700 text-white border-teal-700 shadow-xs'
                    : 'bg-slate-50 text-slate-700 border-slate-300 hover:bg-slate-100'
                }`}
              >
                {type}
              </button>
            ))}
          </div>
        </div>

        {/* Expected Net Salary */}
        <div className="pt-2 border-t border-slate-100 space-y-1">
          <label className="block text-xs font-medium text-slate-700 mb-1">
            Expected Net Take-home Pay (after tax & deductions)
          </label>
          <div className="flex gap-2">
            <input
              type="number"
              inputMode="numeric"
              placeholder="e.g. 3150"
              className="w-full bg-white border border-slate-300 rounded px-3 py-2 text-sm text-slate-900 focus:outline-none"
              value={formData.expected_net_salary}
              onChange={e => onChange('expected_net_salary', e.target.value)}
            />
            <div className="flex items-center px-3 bg-slate-100 border border-slate-300 rounded text-xs font-semibold text-slate-600">
              {formData.salary_currency}
            </div>
          </div>
          {netSalaryNum > 0 && currCode !== 'NPR' && (
            <div className="text-2xs text-emerald-900 font-semibold bg-emerald-50 border border-emerald-200 rounded px-2 py-0.5 inline-flex items-center gap-1">
              <span>≈ {formatNpr(convertToNpr(netSalaryNum, currCode))} / month Net Remittance Potential</span>
            </div>
          )}
        </div>
      </div>

      {/* Working Hours & Overtime */}
      <div className="bg-white border border-slate-200 rounded-md p-4 space-y-3">
        <label className="block text-xs font-semibold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
          <Clock className="w-3.5 h-3.5 text-teal-700" />
          <span>Working Schedule & Overtime</span>
        </label>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1">
              Hours Per Day
            </label>
            <input
              type="number"
              inputMode="numeric"
              placeholder="e.g. 8"
              className="w-full bg-white border border-slate-300 rounded px-3 py-2 text-sm text-slate-900 focus:outline-none"
              value={formData.working_hours}
              onChange={e => onChange('working_hours', e.target.value)}
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1">
              Days Per Week
            </label>
            <input
              type="number"
              inputMode="numeric"
              placeholder="e.g. 5 or 6"
              className="w-full bg-white border border-slate-300 rounded px-3 py-2 text-sm text-slate-900 focus:outline-none"
              value={formData.working_days}
              onChange={e => onChange('working_days', e.target.value)}
            />
          </div>
        </div>

        {/* Overtime */}
        <div>
          <label className="block text-xs font-medium text-slate-700 mb-1.5">
            Overtime Availability
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {(['Available', 'Seasonal / Limited', 'None', 'Unknown'] as OvertimeStatus[]).map(st => (
              <button
                key={st}
                type="button"
                onClick={() => onChange('overtime_status', st)}
                className={`py-2 px-2 text-xs rounded border text-center font-medium transition ${
                  formData.overtime_status === st
                    ? 'bg-teal-700 text-white border-teal-700 shadow-xs'
                    : 'bg-slate-50 text-slate-700 border-slate-300 hover:bg-slate-100'
                }`}
              >
                {st}
              </button>
            ))}
          </div>
        </div>

        {formData.overtime_status === 'Available' || formData.overtime_status === 'Seasonal / Limited' ? (
          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1">
              Overtime Rate / Remarks
            </label>
            <input
              type="text"
              placeholder="e.g. 150% rate, or EUR 6/hr, or 20 hrs/month max"
              className="w-full bg-white border border-slate-300 rounded px-3 py-2 text-sm text-slate-900 focus:outline-none"
              value={formData.overtime_rate}
              onChange={e => onChange('overtime_rate', e.target.value)}
            />
          </div>
        ) : null}
      </div>

      {/* Contract & Probation */}
      <div className="bg-white border border-slate-200 rounded-md p-4 space-y-3">
        <label className="block text-xs font-semibold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
          <Calendar className="w-3.5 h-3.5 text-teal-700" />
          <span>Contract & Probation</span>
        </label>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1">
              Contract Length
            </label>
            <input
              type="text"
              placeholder="e.g. 1 Year / 2 Years (Renewable)"
              className="w-full bg-white border border-slate-300 rounded px-3 py-2 text-sm text-slate-900 focus:outline-none"
              value={formData.contract_length}
              onChange={e => onChange('contract_length', e.target.value)}
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1">
              Probation Period
            </label>
            <input
              type="text"
              placeholder="e.g. 1 Month / 3 Months"
              className="w-full bg-white border border-slate-300 rounded px-3 py-2 text-sm text-slate-900 focus:outline-none"
              value={formData.probation}
              onChange={e => onChange('probation', e.target.value)}
            />
          </div>
        </div>
      </div>
    </div>
  );
};
