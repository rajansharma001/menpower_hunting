import React from 'react';
import { WizardFormData } from '../../types/form';
import { AccommodationType, FoodArrangement, Transportation } from '../../types/database';
import { Home, Utensils, Bus } from 'lucide-react';

interface Step4Props {
  formData: WizardFormData;
  onChange: (field: keyof WizardFormData, value: any) => void;
}

export const Step4Living: React.FC<Step4Props> = ({ formData, onChange }) => {
  const showMonthlyAccomCost =
    formData.accommodation_type === 'Worker Pays' ||
    formData.accommodation_type === 'Salary Deduction';

  return (
    <div className="space-y-4">
      {/* Accommodation */}
      <div className="bg-white border border-slate-200 rounded-md p-4 space-y-3">
        <label className="block text-xs font-semibold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
          <Home className="w-3.5 h-3.5 text-teal-700" />
          <span>Accommodation Arrangement</span>
        </label>

        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
          {(
            [
              'Free / Provided',
              'Salary Deduction',
              'Worker Pays',
              'Not Provided',
              'Unclear'
            ] as AccommodationType[]
          ).map(type => (
            <button
              key={type}
              type="button"
              onClick={() => onChange('accommodation_type', type)}
              className={`py-2 px-2.5 text-xs rounded border text-center font-medium transition ${
                formData.accommodation_type === type
                  ? 'bg-teal-700 text-white border-teal-700 shadow-xs'
                  : 'bg-slate-50 text-slate-700 border-slate-300 hover:bg-slate-100'
              }`}
            >
              {type}
            </button>
          ))}
        </div>

        {/* Conditional Monthly Accommodation Cost */}
        {showMonthlyAccomCost && (
          <div className="pt-2 border-t border-slate-100 animate-in fade-in duration-150">
            <label className="block text-xs font-medium text-slate-700 mb-1">
              Monthly Accommodation Cost / Deduction ({formData.salary_currency || 'Currency'})
            </label>
            <input
              type="number"
              inputMode="numeric"
              placeholder="e.g. 450 (PLN) or 150 (EUR)"
              className="w-full bg-white border border-slate-300 rounded px-3 py-2 text-sm text-slate-900 focus:outline-none"
              value={formData.accommodation_cost}
              onChange={e => onChange('accommodation_cost', e.target.value)}
            />
          </div>
        )}
      </div>

      {/* Food Arrangement */}
      <div className="bg-white border border-slate-200 rounded-md p-4 space-y-3">
        <label className="block text-xs font-semibold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
          <Utensils className="w-3.5 h-3.5 text-teal-700" />
          <span>Food / Meal Arrangement</span>
        </label>

        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
          {(
            [
              'Fully Provided',
              'Duty Meal',
              'Subsidized',
              'Self Paid',
              'Unclear'
            ] as FoodArrangement[]
          ).map(f => (
            <button
              key={f}
              type="button"
              onClick={() => onChange('food_arrangement', f)}
              className={`py-2 px-2.5 text-xs rounded border text-center font-medium transition ${
                formData.food_arrangement === f
                  ? 'bg-teal-700 text-white border-teal-700 shadow-xs'
                  : 'bg-slate-50 text-slate-700 border-slate-300 hover:bg-slate-100'
              }`}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      {/* Transportation */}
      <div className="bg-white border border-slate-200 rounded-md p-4 space-y-3">
        <label className="block text-xs font-semibold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
          <Bus className="w-3.5 h-3.5 text-teal-700" />
          <span>Commute / Local Transportation</span>
        </label>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {(
            [
              'Free Company Bus',
              'Self Paid / Public',
              'Walkable / On Site',
              'Not Clear'
            ] as Transportation[]
          ).map(t => (
            <button
              key={t}
              type="button"
              onClick={() => onChange('transportation', t)}
              className={`py-2 px-2 text-xs rounded border text-center font-medium transition ${
                formData.transportation === t
                  ? 'bg-teal-700 text-white border-teal-700 shadow-xs'
                  : 'bg-slate-50 text-slate-700 border-slate-300 hover:bg-slate-100'
              }`}
            >
              {t}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
