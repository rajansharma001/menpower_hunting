import React, { useState } from 'react';
import { Calendar, Clock, ExternalLink, Edit3, Check, X, ShieldAlert } from 'lucide-react';
import { VisaMilestone } from '../../types/database';
import { calculateAppointmentCountdown, OFFICIAL_VISA_PORTALS } from '../../lib/visaProcess';

interface VfsAppointmentBannerProps {
  milestone?: VisaMilestone;
  corridor: 'Europe' | 'Gulf' | 'Other';
  onUpdateAppointment: (targetDate: string, refNum: string) => void;
}

export const VfsAppointmentBanner: React.FC<VfsAppointmentBannerProps> = ({
  milestone,
  corridor,
  onUpdateAppointment
}) => {
  const isEurope = corridor === 'Europe';
  const isGulf = corridor === 'Gulf';

  const [isEditing, setIsEditing] = useState(false);
  const [dateInput, setDateInput] = useState(milestone?.target_date || '');
  const [refInput, setRefInput] = useState(milestone?.reference_number || '');

  const countdown = calculateAppointmentCountdown(milestone?.target_date);

  const title = isEurope
    ? 'VFS Global Biometrics & Embassy Appointment'
    : isGulf
    ? 'GAMCA / Wafid Biometric Medical Appointment'
    : 'Consular Visa / Biometrics Appointment';

  const subtitleNp = isEurope
    ? 'युरोप VFS बायोमेट्रिक तथा सक्कल पासपोर्ट दाखिला मिति'
    : isGulf
    ? 'गल्फ GAMCA मेडिकल तथा बायोमेट्रिक मिति'
    : 'दूतावास तथा भिसा बायोमेट्रिक मिति';

  const portalUrl = isEurope
    ? OFFICIAL_VISA_PORTALS.vfsGlobalNepal
    : isGulf
    ? OFFICIAL_VISA_PORTALS.gamcaWafidMedical
    : OFFICIAL_VISA_PORTALS.dofeFeims;

  const portalLabel = isEurope
    ? 'VFS Global Portal'
    : isGulf
    ? 'Wafid (GAMCA) Portal'
    : 'DoFE FEIMS';

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateAppointment(dateInput, refInput);
    setIsEditing(false);
  };

  return (
    <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-indigo-950 text-white rounded-xl p-4 sm:p-5 shadow-sm border border-slate-700/60 mb-5 relative overflow-hidden">
      {/* Decorative background glow */}
      <div className="absolute -top-10 -right-10 w-40 h-40 bg-teal-500/10 rounded-full blur-2xl pointer-events-none" />

      <div className="relative z-10">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-700/80">
          <div className="flex items-center gap-2.5">
            <span className="p-2 rounded-lg bg-teal-500/20 text-teal-300 border border-teal-500/30">
              <Calendar className="w-5 h-5" />
            </span>
            <div>
              <h3 className="text-base font-bold text-white tracking-wide flex items-center gap-2">
                {title}
                {milestone?.status === 'Completed' && (
                  <span className="text-xs bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 px-2 py-0.5 rounded font-normal">
                    Completed
                  </span>
                )}
              </h3>
              <p className="text-xs text-slate-300 font-medium">{subtitleNp}</p>
            </div>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <a
              href={portalUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-700/70 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-600 transition"
              title="Open official portal"
            >
              <ExternalLink className="w-3.5 h-3.5 text-teal-400" />
              <span>{portalLabel}</span>
            </a>

            {!isEditing && (
              <button
                type="button"
                onClick={() => {
                  setDateInput(milestone?.target_date || '');
                  setRefInput(milestone?.reference_number || '');
                  setIsEditing(true);
                }}
                className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-teal-600 hover:bg-teal-500 text-white text-xs font-semibold transition shadow-sm"
              >
                <Edit3 className="w-3.5 h-3.5" />
                <span>{milestone?.target_date ? 'Change Date' : 'Set Date'}</span>
              </button>
            )}
          </div>
        </div>

        {/* Editing form */}
        {isEditing ? (
          <form onSubmit={handleSave} className="mt-4 pt-2 grid grid-cols-1 sm:grid-cols-12 gap-3 items-end">
            <div className="sm:col-span-4">
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Appointment Target Date (मिति)
              </label>
              <input
                type="date"
                value={dateInput}
                onChange={e => setDateInput(e.target.value)}
                className="w-full bg-slate-800 border border-slate-600 rounded-lg px-3 py-1.5 text-sm text-white focus:outline-none focus:border-teal-400"
                required
              />
            </div>

            <div className="sm:col-span-5">
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                {isEurope ? 'VFS Booking Ref / Token #' : isGulf ? 'GAMCA Slip # / MOI Permit Ref' : 'Reference / Token #'}
              </label>
              <input
                type="text"
                value={refInput}
                onChange={e => setRefInput(e.target.value)}
                placeholder="e.g. VFS-KTM-2026-8812"
                className="w-full bg-slate-800 border border-slate-600 rounded-lg px-3 py-1.5 text-sm text-white focus:outline-none focus:border-teal-400"
              />
            </div>

            <div className="sm:col-span-3 flex items-center gap-2">
              <button
                type="submit"
                className="flex-1 inline-flex items-center justify-center gap-1 px-3 py-2 rounded-lg bg-teal-500 hover:bg-teal-400 text-slate-950 font-bold text-xs transition"
              >
                <Check className="w-4 h-4" /> Save
              </button>
              <button
                type="button"
                onClick={() => setIsEditing(false)}
                className="px-3 py-2 rounded-lg bg-slate-700 hover:bg-slate-600 text-slate-300 text-xs transition"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </form>
        ) : (
          <div className="mt-3 flex flex-col md:flex-row md:items-center justify-between gap-3">
            <div className="flex flex-wrap items-center gap-3">
              {milestone?.target_date ? (
                <>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-slate-400">Scheduled Date:</span>
                    <span className="text-sm font-bold text-white font-mono bg-slate-800/80 px-2.5 py-1 rounded border border-slate-700">
                      {new Date(milestone.target_date).toLocaleDateString('en-US', {
                        weekday: 'short',
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric'
                      })}
                    </span>
                  </div>

                  <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold border ${countdown.badgeColor}`}>
                    <Clock className="w-3.5 h-3.5" />
                    {countdown.label}
                  </span>
                </>
              ) : (
                <div className="flex items-center gap-2 text-xs text-slate-300">
                  <Clock className="w-4 h-4 text-slate-400" />
                  <span>No appointment date set yet. Tap &ldquo;Set Date&rdquo; once your appointment is locked.</span>
                </div>
              )}
            </div>

            {milestone?.reference_number && (
              <div className="flex items-center gap-2 text-xs">
                <span className="text-slate-400">Booking Ref:</span>
                <span className="font-mono bg-slate-800 text-teal-300 px-2.5 py-1 rounded border border-teal-500/20 font-semibold tracking-wider">
                  {milestone.reference_number}
                </span>
              </div>
            )}
          </div>
        )}

        {/* Advisory footnote */}
        <div className="mt-3 pt-2.5 border-t border-slate-800 flex items-start gap-2 text-xs text-slate-400">
          <ShieldAlert className="w-3.5 h-3.5 text-amber-400 shrink-0 mt-0.5" />
          <span>
            {isEurope
              ? 'युरोप सुझाव: VFS मा बायोमेट्रिकको दिन सक्कल पासपोर्ट, Work Permit कपी, र MOFA प्रमाणीकरण भएको प्रहरी रिपोर्ट अनिवार्य लैजानुहोस्।'
              : 'गल्फ सुझाव: GAMCA मेडिकल फिट नभई कुनै पनि एजेन्टलाई थप रकम नबुझाउनुहोस्। अफर लेटरको सर्त राम्रोसँग जाँच्नुहोस्।'}
          </span>
        </div>
      </div>
    </div>
  );
};
