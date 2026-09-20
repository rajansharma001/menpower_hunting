import React from 'react';
import { WizardFormData } from '../../types/form';
import { TimelineBasis, PaymentMethod, ReceiptStatus, RefundPolicy } from '../../types/database';
import { PAYMENT_STAGES } from '../../constants/workflowOptions';
import { Hourglass, CreditCard, Receipt, RotateCcw, ShieldAlert } from 'lucide-react';

interface Step7Props {
  formData: WizardFormData;
  onChange: (field: keyof WizardFormData, value: any) => void;
}

export const Step7TimelinePayment: React.FC<Step7Props> = ({ formData, onChange }) => {
  const togglePaymentStage = (stage: string) => {
    const current = [...(formData.payment_stages || [])];
    const idx = current.indexOf(stage);
    if (idx !== -1) {
      current.splice(idx, 1);
    } else {
      current.push(stage);
    }
    onChange('payment_stages', current);
  };

  return (
    <div className="space-y-4">
      {/* Estimated Timeline */}
      <div className="bg-white border border-slate-200 rounded-md p-4 space-y-3">
        <label className="block text-xs font-semibold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
          <Hourglass className="w-3.5 h-3.5 text-teal-700" />
          <span>Estimated Processing & Departure Timeline</span>
        </label>

        <div>
          <label className="block text-xs font-medium text-slate-600 mb-1">
            Estimated Time to Departure
          </label>
          <input
            type="text"
            placeholder="e.g. 4–6 months / 90 days"
            className="w-full bg-white border border-slate-300 rounded px-3 py-2 text-sm text-slate-900 focus:outline-none"
            value={formData.estimated_total_processing_time}
            onChange={e => onChange('estimated_total_processing_time', e.target.value)}
          />
        </div>

        <div>
          <label className="block text-xs font-medium text-slate-700 mb-1.5">
            Timeline Basis
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {(
              [
                'Official Source',
                'Agency Historical Average',
                'Previous Worker Cases',
                'Verbal Estimate',
                'Guarantee Given',
                'Unknown'
              ] as TimelineBasis[]
            ).map(basis => (
              <button
                key={basis}
                type="button"
                onClick={() => onChange('timeline_basis', basis)}
                className={`py-2 px-2 text-xs rounded border text-center font-medium transition ${
                  formData.timeline_basis === basis
                    ? 'bg-teal-700 text-white border-teal-700 shadow-xs'
                    : 'bg-slate-50 text-slate-700 border-slate-300 hover:bg-slate-100'
                }`}
              >
                {basis}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Payment Stages */}
      <div className="bg-white border border-slate-200 rounded-md p-4 space-y-3">
        <label className="block text-xs font-semibold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
          <CreditCard className="w-3.5 h-3.5 text-teal-700" />
          <span>When Does the Agency Demand Payment? (Stages)</span>
        </label>

        <div className="grid grid-cols-2 sm:grid-cols-2 gap-2">
          {PAYMENT_STAGES.map(stage => {
            const isSelected = (formData.payment_stages || []).includes(stage);
            return (
              <button
                key={stage}
                type="button"
                onClick={() => togglePaymentStage(stage)}
                className={`py-2 px-2.5 text-xs rounded border text-left font-medium transition flex items-center justify-between ${
                  isSelected
                    ? 'bg-teal-700 text-white border-teal-700 shadow-xs'
                    : 'bg-slate-50 text-slate-700 border-slate-300 hover:bg-slate-100'
                }`}
              >
                <span>{stage}</span>
                {isSelected && <span className="text-2xs font-bold">✓</span>}
              </button>
            );
          })}
        </div>
      </div>

      {/* Payment Method & Receipts */}
      <div className="bg-white border border-slate-200 rounded-md p-4 space-y-3">
        <label className="block text-xs font-semibold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
          <Receipt className="w-3.5 h-3.5 text-teal-700" />
          <span>Payment Method & Official Receipts</span>
        </label>

        <div>
          <label className="block text-xs font-medium text-slate-600 mb-1">
            Accepted Payment Method
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {(['Bank Transfer', 'Cash', 'Both', 'Unknown'] as PaymentMethod[]).map(m => (
              <button
                key={m}
                type="button"
                onClick={() => onChange('payment_method', m)}
                className={`py-2 px-2 text-xs rounded border text-center font-medium transition ${
                  formData.payment_method === m
                    ? 'bg-teal-700 text-white border-teal-700'
                    : 'bg-slate-50 text-slate-700 border-slate-300 hover:bg-slate-100'
                }`}
              >
                {m}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-xs font-medium text-slate-600 mb-1">
            Payment Receipt
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {(['Provided', 'Promised', 'Not Provided', 'Not Asked'] as ReceiptStatus[]).map(r => (
              <button
                key={r}
                type="button"
                onClick={() => onChange('receipt_status', r)}
                className={`py-2 px-2 text-xs rounded border text-center font-medium transition ${
                  formData.receipt_status === r
                    ? 'bg-teal-700 text-white border-teal-700'
                    : 'bg-slate-50 text-slate-700 border-slate-300 hover:bg-slate-100'
                }`}
              >
                {r}
              </button>
            ))}
          </div>
        </div>

        {/* Anti-Fraud Account & Receipt Warning */}
        <div className="p-3 bg-amber-50 border border-amber-300 rounded text-2xs text-amber-950 space-y-1 mt-2">
          <div className="flex items-center space-x-1.5 font-bold text-amber-900">
            <ShieldAlert className="w-3.5 h-3.5 text-amber-700 flex-shrink-0" />
            <span>नेपाल वैदेशिक रोजगार सुरक्षा सतर्कता (Anti-Fraud Rule)</span>
          </div>
          <p className="leading-relaxed">
            <strong>व्यक्तिगत खातामा पैसा नहाल्नुहोस्:</strong> एजेन्ट वा कर्मचारीको व्यक्तिगत बैंक खाता, ईसेवा वा खल्तीमा रकम नपठाउनुहोस्। म्यानपावरको दर्ता भएको आधिकारिक बैंक खातामा मात्र भुक्तानी गर्नुहोस् र जति रकम तिर्नुहुन्छ त्यतिकैको <strong>भ्याट/प्यान बिल</strong> अनिवार्य लिनुहोस्।
          </p>
          {formData.receipt_status === 'Not Provided' && (
            <p className="text-red-700 font-bold pt-1 border-t border-amber-200">
              🚨 रसिद नदिई भुक्तानी गर्दा ठगी भएमा कानुनबमोजिम कुनै प्रमाण रहँदैन।
            </p>
          )}
        </div>
      </div>

      {/* Refund Terms */}
      <div className="bg-white border border-slate-200 rounded-md p-4 space-y-3">
        <label className="block text-xs font-semibold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
          <RotateCcw className="w-3.5 h-3.5 text-teal-700" />
          <span>Refund Policy if Rejected or Delayed</span>
        </label>

        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
          {(
            [
              'Written Terms',
              'Verbal Promise',
              'Partial Refund',
              'Non-refundable',
              'Unknown'
            ] as RefundPolicy[]
          ).map(p => (
            <button
              key={p}
              type="button"
              onClick={() => onChange('refund_policy', p)}
              className={`py-2 px-2 text-xs rounded border text-center font-medium transition ${
                formData.refund_policy === p
                  ? 'bg-teal-700 text-white border-teal-700'
                  : 'bg-slate-50 text-slate-700 border-slate-300 hover:bg-slate-100'
              }`}
            >
              {p}
            </button>
          ))}
        </div>

        <div>
          <label className="block text-xs font-medium text-slate-600 mb-1">
            Refund Remarks / Conditions
          </label>
          <input
            type="text"
            placeholder="e.g. NPR 15,000 retained for processing if visa rejected"
            className="w-full bg-white border border-slate-300 rounded px-3 py-2 text-sm text-slate-900 focus:outline-none"
            value={formData.refund_notes}
            onChange={e => onChange('refund_notes', e.target.value)}
          />
        </div>
      </div>
    </div>
  );
};
