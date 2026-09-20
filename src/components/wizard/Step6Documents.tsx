import React from 'react';
import { WizardFormData, DocumentEntry } from '../../types/form';
import { WorkPermitStatus, PhotoAllowed } from '../../types/database';
import { DOCUMENT_TYPES } from '../../constants/workflowOptions';
import { FileCheck, Camera, CheckSquare, Square } from 'lucide-react';

interface Step6Props {
  formData: WizardFormData;
  onChange: (field: keyof WizardFormData, value: any) => void;
}

export const Step6Documents: React.FC<Step6Props> = ({ formData, onChange }) => {
  const permitStatuses: WorkPermitStatus[] = [
    'Already Issued',
    'Application Lodged',
    'Employer Processing',
    'Quota Waiting / Not Started',
    'Unknown'
  ];

  const handleToggleDoc = (docType: string) => {
    const current = { ...formData.documents_shown };
    if (current[docType]?.shown) {
      delete current[docType];
    } else {
      current[docType] = {
        document_type: docType,
        shown: true,
        photo_allowed: 'Not Asked',
        notes: ''
      };
    }
    onChange('documents_shown', current);
  };

  const handleUpdateDocProp = (docType: string, prop: keyof DocumentEntry, val: any) => {
    const current = { ...formData.documents_shown };
    if (current[docType]) {
      current[docType] = { ...current[docType], [prop]: val };
      onChange('documents_shown', current);
    }
  };

  return (
    <div className="space-y-4">
      {/* Work Permit Status */}
      <div className="bg-white border border-slate-200 rounded-md p-4 space-y-3">
        <label className="block text-xs font-semibold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
          <FileCheck className="w-3.5 h-3.5 text-teal-700" />
          <span>Work Permit Status <span className="text-red-500">*</span></span>
        </label>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {permitStatuses.map(status => (
            <button
              key={status}
              type="button"
              onClick={() => onChange('work_permit_status', status)}
              className={`py-2.5 px-3 text-xs rounded border text-left font-medium transition ${
                formData.work_permit_status === status
                  ? 'bg-teal-700 text-white border-teal-700 shadow-xs'
                  : 'bg-slate-50 text-slate-700 border-slate-300 hover:bg-slate-100'
              }`}
            >
              {status}
            </button>
          ))}
        </div>
      </div>

      {/* Documents Shown in Office */}
      <div className="bg-white border border-slate-200 rounded-md p-4 space-y-3">
        <div className="flex items-center justify-between">
          <label className="block text-xs font-semibold text-slate-800 uppercase tracking-wider">
            Documents Shown By Agency
          </label>
          <span className="text-2xs text-slate-500">Select all shown</span>
        </div>

        <div className="space-y-2.5">
          {DOCUMENT_TYPES.map(docType => {
            const isSelected = !!formData.documents_shown[docType]?.shown;
            const docData = formData.documents_shown[docType];

            return (
              <div
                key={docType}
                className={`border rounded-md transition ${
                  isSelected ? 'border-teal-600 bg-teal-50/20' : 'border-slate-200 bg-slate-50/50'
                }`}
              >
                <div
                  onClick={() => handleToggleDoc(docType)}
                  className="p-3 flex items-center justify-between cursor-pointer select-none"
                >
                  <div className="flex items-center space-x-2.5">
                    {isSelected ? (
                      <CheckSquare className="w-4 h-4 text-teal-700 flex-shrink-0" />
                    ) : (
                      <Square className="w-4 h-4 text-slate-400 flex-shrink-0" />
                    )}
                    <span className={`text-xs font-medium ${isSelected ? 'text-slate-900' : 'text-slate-700'}`}>
                      {docType}
                    </span>
                  </div>
                </div>

                {isSelected && (
                  <div className="px-3 pb-3 pt-1 border-t border-teal-100 space-y-2">
                    <div className="flex items-center justify-between gap-2">
                      <label className="text-2xs font-medium text-slate-600 flex items-center gap-1">
                        <Camera className="w-3 h-3 text-slate-500" />
                        <span>Was photo / copy allowed?</span>
                      </label>
                      <div className="flex gap-1">
                        {(['Yes', 'Discreetly', 'No', 'Not Asked'] as PhotoAllowed[]).map(val => (
                          <button
                            key={val}
                            type="button"
                            onClick={() => handleUpdateDocProp(docType, 'photo_allowed', val)}
                            className={`px-2 py-1 text-2xs rounded border transition ${
                              docData?.photo_allowed === val
                                ? 'bg-teal-700 text-white border-teal-700'
                                : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-50'
                            }`}
                          >
                            {val}
                          </button>
                        ))}
                      </div>
                    </div>

                    <input
                      type="text"
                      placeholder="Notes on document (e.g. stamp date, lot number)..."
                      className="w-full bg-white border border-slate-300 rounded px-2.5 py-1 text-2xs text-slate-800 focus:outline-none"
                      value={docData?.notes || ''}
                      onChange={e => handleUpdateDocProp(docType, 'notes', e.target.value)}
                    />
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
