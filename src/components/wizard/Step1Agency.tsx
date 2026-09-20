import React from 'react';
import { WizardFormData } from '../../types/form';
import { DISCOVERY_CHANNELS } from '../../constants/workflowOptions';
import { Agency } from '../../types/database';
import { Calendar, Building2, MapPin, User, Phone, FileText, Globe, Share2 } from 'lucide-react';

interface Step1Props {
  formData: WizardFormData;
  existingAgencies: Agency[];
  onChange: (field: keyof WizardFormData, value: any) => void;
  onAgencySelect: (agency: Agency) => void;
}

export const Step1Agency: React.FC<Step1Props> = ({
  formData,
  existingAgencies,
  onChange,
  onAgencySelect
}) => {
  return (
    <div className="space-y-4">
      <div className="bg-slate-50 border border-slate-200 rounded-md p-3">
        <label className="block text-xs font-semibold text-slate-700 mb-1 flex items-center gap-1.5">
          <Calendar className="w-3.5 h-3.5 text-slate-500" />
          <span>Visit Date</span>
        </label>
        <input
          type="date"
          className="w-full bg-white border border-slate-300 rounded px-3 py-2 text-sm text-slate-900 focus:outline-none focus:ring-1 focus:ring-teal-600"
          value={formData.visit_date}
          onChange={e => onChange('visit_date', e.target.value)}
        />
      </div>

      <div className="bg-white border border-slate-200 rounded-md p-4 space-y-3">
        <div className="flex items-center justify-between">
          <label className="block text-xs font-semibold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
            <Building2 className="w-3.5 h-3.5 text-teal-700" />
            <span>Agency Name <span className="text-red-500">*</span></span>
          </label>
          {existingAgencies.length > 0 && (
            <span className="text-2xs text-slate-500">
              Or pick from existing ({existingAgencies.length})
            </span>
          )}
        </div>

        {/* Existing agencies dropdown quick pick */}
        {existingAgencies.length > 0 && (
          <select
            className="w-full bg-slate-50 border border-slate-300 rounded px-2.5 py-1.5 text-xs text-slate-700 mb-2 focus:outline-none"
            onChange={e => {
              const matched = existingAgencies.find(a => a.id === e.target.value);
              if (matched) onAgencySelect(matched);
            }}
            defaultValue=""
          >
            <option value="" disabled>
              -- Select an existing agency to autofill --
            </option>
            {existingAgencies.map(a => (
              <option key={a.id} value={a.id}>
                {a.name} ({a.location || 'Location not specified'})
              </option>
            ))}
          </select>
        )}

        <input
          type="text"
          required
          placeholder="e.g. Apex Global Overseas Pvt. Ltd."
          className="w-full bg-white border border-slate-300 rounded px-3 py-2.5 text-sm text-slate-900 focus:outline-none focus:ring-1 focus:ring-teal-600"
          value={formData.agency_name}
          onChange={e => onChange('agency_name', e.target.value)}
        />

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1 flex items-center gap-1">
              <MapPin className="w-3 h-3 text-slate-400" />
              <span>Location / Office Area</span>
            </label>
            <input
              type="text"
              placeholder="e.g. Battisputali, Kathmandu"
              className="w-full bg-white border border-slate-300 rounded px-2.5 py-2 text-sm text-slate-900 focus:outline-none"
              value={formData.agency_location}
              onChange={e => onChange('agency_location', e.target.value)}
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1 flex items-center gap-1">
              <User className="w-3 h-3 text-slate-400" />
              <span>Contact Person / Counselor</span>
            </label>
            <input
              type="text"
              placeholder="e.g. Ramesh Adhikari"
              className="w-full bg-white border border-slate-300 rounded px-2.5 py-2 text-sm text-slate-900 focus:outline-none"
              value={formData.contact_person}
              onChange={e => onChange('contact_person', e.target.value)}
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1 flex items-center gap-1">
              <Phone className="w-3 h-3 text-slate-400" />
              <span>Phone / Mobile</span>
            </label>
            <input
              type="tel"
              placeholder="e.g. +977-1-4488990"
              className="w-full bg-white border border-slate-300 rounded px-2.5 py-2 text-sm text-slate-900 focus:outline-none"
              value={formData.phone}
              onChange={e => onChange('phone', e.target.value)}
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1 flex items-center gap-1">
              <FileText className="w-3 h-3 text-slate-400" />
              <span>DoFE License # (Optional)</span>
            </label>
            <input
              type="text"
              placeholder="e.g. 1088/078/079"
              className="w-full bg-white border border-slate-300 rounded px-2.5 py-2 text-sm text-slate-900 focus:outline-none"
              value={formData.license_number}
              onChange={e => onChange('license_number', e.target.value)}
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1 flex items-center gap-1">
              <Globe className="w-3 h-3 text-slate-400" />
              <span>Website (Optional)</span>
            </label>
            <input
              type="url"
              placeholder="https://..."
              className="w-full bg-white border border-slate-300 rounded px-2.5 py-2 text-sm text-slate-900 focus:outline-none"
              value={formData.website}
              onChange={e => onChange('website', e.target.value)}
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1 flex items-center gap-1">
              <Share2 className="w-3 h-3 text-slate-400" />
              <span>Facebook / Social Link (Optional)</span>
            </label>
            <input
              type="text"
              placeholder="e.g. facebook.com/..."
              className="w-full bg-white border border-slate-300 rounded px-2.5 py-2 text-sm text-slate-900 focus:outline-none"
              value={formData.social_link}
              onChange={e => onChange('social_link', e.target.value)}
            />
          </div>
        </div>
      </div>

      <div className="bg-slate-50 border border-slate-200 rounded-md p-4">
        <label className="block text-xs font-semibold text-slate-800 mb-2">
          Discovery Channel
        </label>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {DISCOVERY_CHANNELS.map(ch => (
            <button
              key={ch}
              type="button"
              onClick={() => onChange('discovery_channel', ch)}
              className={`py-2 px-3 text-xs rounded border text-left font-medium transition ${
                formData.discovery_channel === ch
                  ? 'bg-teal-700 text-white border-teal-700 shadow-xs'
                  : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-100'
              }`}
            >
              {ch}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
