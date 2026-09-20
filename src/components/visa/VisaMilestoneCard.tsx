import React, { useState } from 'react';
import {
  CheckCircle2,
  Clock,
  AlertTriangle,
  Circle,
  FileCheck,
  Building,
  UserCheck,
  ShieldCheck,
  Plane,
  FileText,
  Calendar,
  ChevronDown,
  ChevronUp,
  Edit2,
  Check,
  X,
  ExternalLink
} from 'lucide-react';
import { VisaMilestone, VisaMilestoneStatus } from '../../types/database';
import { OFFICIAL_VISA_PORTALS } from '../../lib/visaProcess';

interface VisaMilestoneCardProps {
  milestone: VisaMilestone;
  corridor: 'Europe' | 'Gulf' | 'Other';
  onStatusChange: (newStatus: VisaMilestoneStatus) => void;
  onUpdateDetails: (updates: {
    target_date?: string;
    completed_date?: string;
    reference_number?: string;
    notes?: string;
  }) => void;
}

export const VisaMilestoneCard: React.FC<VisaMilestoneCardProps> = ({
  milestone,
  corridor,
  onStatusChange,
  onUpdateDetails
}) => {
  const [isExpanded, setIsExpanded] = useState(milestone.status === 'In Progress' || milestone.status === 'Delayed');
  const [isEditing, setIsEditing] = useState(false);
  const [targetDate, setTargetDate] = useState(milestone.target_date || '');
  const [completedDate, setCompletedDate] = useState(milestone.completed_date || '');
  const [referenceNumber, setReferenceNumber] = useState(milestone.reference_number || '');
  const [notes, setNotes] = useState(milestone.notes || '');

  const getCategoryIcon = (cat?: string) => {
    switch (cat) {
      case 'dofe':
        return <FileCheck className="w-4 h-4 text-sky-600" />;
      case 'interview':
        return <UserCheck className="w-4 h-4 text-indigo-600" />;
      case 'permit':
        return <Building className="w-4 h-4 text-purple-600" />;
      case 'police':
        return <ShieldCheck className="w-4 h-4 text-emerald-600" />;
      case 'vfs':
        return <Calendar className="w-4 h-4 text-teal-600" />;
      case 'embassy':
        return <Building className="w-4 h-4 text-amber-600" />;
      case 'medical':
        return <FileText className="w-4 h-4 text-rose-600" />;
      case 'e_visa':
        return <FileCheck className="w-4 h-4 text-blue-600" />;
      case 'final_labour':
        return <CheckCircle2 className="w-4 h-4 text-emerald-600" />;
      case 'flight':
        return <Plane className="w-4 h-4 text-teal-600" />;
      default:
        return <FileText className="w-4 h-4 text-slate-600" />;
    }
  };

  const getStatusBadge = (status: VisaMilestoneStatus) => {
    switch (status) {
      case 'Completed':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800 border border-emerald-300">
            <CheckCircle2 className="w-3 h-3" /> सम्पन्न (Completed)
          </span>
        );
      case 'In Progress':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-teal-100 text-teal-900 border border-teal-300">
            <Clock className="w-3 h-3 text-teal-700 animate-spin" /> प्रक्रियामा (In Progress)
          </span>
        );
      case 'Delayed':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-red-100 text-red-800 border border-red-300">
            <AlertTriangle className="w-3 h-3" /> ढिलाइ (Delayed)
          </span>
        );
      case 'Pending':
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-600 border border-slate-200">
            <Circle className="w-2.5 h-2.5 text-slate-400" /> बाँकी (Pending)
          </span>
        );
    }
  };

  const getPortalLink = () => {
    if (milestone.category === 'police') {
      return { url: OFFICIAL_VISA_PORTALS.nepalPoliceOpcr, label: 'Police OPCR' };
    }
    if (milestone.category === 'vfs') {
      return { url: OFFICIAL_VISA_PORTALS.vfsGlobalNepal, label: 'VFS Global' };
    }
    if (milestone.category === 'medical') {
      return { url: OFFICIAL_VISA_PORTALS.gamcaWafidMedical, label: 'Wafid Medical' };
    }
    if (milestone.category === 'dofe' || milestone.category === 'final_labour') {
      return { url: OFFICIAL_VISA_PORTALS.dofeFeims, label: 'FEIMS Labour' };
    }
    return null;
  };

  const portal = getPortalLink();

  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateDetails({
      target_date: targetDate || undefined,
      completed_date: completedDate || undefined,
      reference_number: referenceNumber || undefined,
      notes: notes || undefined
    });
    setIsEditing(false);
  };

  return (
    <div
      className={`border rounded-xl transition-all duration-200 ${
        milestone.status === 'Completed'
          ? 'bg-white border-emerald-200/80 shadow-xs'
          : milestone.status === 'In Progress'
          ? 'bg-teal-50/40 border-teal-300 shadow-sm'
          : milestone.status === 'Delayed'
          ? 'bg-red-50/40 border-red-300 shadow-sm'
          : 'bg-white border-slate-200/80 hover:border-slate-300'
      }`}
    >
      {/* Main Row */}
      <div className="p-3.5 sm:p-4">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-start gap-3">
            {/* Step Number Badge */}
            <div
              className={`w-7 h-7 rounded-full flex items-center justify-center font-bold text-xs shrink-0 mt-0.5 ${
                milestone.status === 'Completed'
                  ? 'bg-emerald-600 text-white'
                  : milestone.status === 'In Progress'
                  ? 'bg-teal-600 text-white ring-2 ring-teal-200'
                  : milestone.status === 'Delayed'
                  ? 'bg-red-600 text-white ring-2 ring-red-200'
                  : 'bg-slate-100 text-slate-600 border border-slate-300'
              }`}
            >
              {milestone.status === 'Completed' ? <Check className="w-4 h-4" /> : milestone.step_number}
            </div>

            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="p-1 rounded bg-slate-100 border border-slate-200/60">
                  {getCategoryIcon(milestone.category)}
                </span>
                <h4 className="text-sm font-bold text-slate-900">{milestone.title}</h4>
                {getStatusBadge(milestone.status)}
              </div>
              {milestone.title_np && (
                <p className="text-xs text-slate-600 font-medium mt-0.5">{milestone.title_np}</p>
              )}

              {/* Condensed Date/Ref tags when collapsed */}
              <div className="flex flex-wrap items-center gap-2 mt-2">
                {milestone.target_date && (
                  <span className="inline-flex items-center gap-1 text-[11px] text-slate-600 bg-slate-100 px-2 py-0.5 rounded font-mono">
                    <Calendar className="w-3 h-3 text-slate-400" />
                    Target: {milestone.target_date}
                  </span>
                )}
                {milestone.completed_date && (
                  <span className="inline-flex items-center gap-1 text-[11px] text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded font-mono border border-emerald-200">
                    <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                    Done: {milestone.completed_date}
                  </span>
                )}
                {milestone.reference_number && (
                  <span className="inline-flex items-center gap-1 text-[11px] text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded font-mono border border-indigo-200">
                    Ref: {milestone.reference_number}
                  </span>
                )}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-1 shrink-0">
            {portal && (
              <a
                href={portal.url}
                target="_blank"
                rel="noopener noreferrer"
                className="p-1.5 rounded-lg text-slate-400 hover:text-teal-600 hover:bg-teal-50 transition"
                title={`Open ${portal.label}`}
              >
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            )}
            <button
              type="button"
              onClick={() => setIsExpanded(!isExpanded)}
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition"
              title={isExpanded ? 'Collapse' : 'Expand details'}
            >
              {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {/* Quick status switcher row */}
        <div className="mt-3 pt-2.5 border-t border-slate-100 flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-1 flex-wrap">
            <span className="text-xs text-slate-400 mr-1">स्थिति (Status):</span>
            {(['Pending', 'In Progress', 'Completed', 'Delayed'] as VisaMilestoneStatus[]).map(st => (
              <button
                key={st}
                type="button"
                onClick={() => onStatusChange(st)}
                className={`text-xs px-2 py-0.5 rounded transition ${
                  milestone.status === st
                    ? st === 'Completed'
                      ? 'bg-emerald-600 text-white font-bold'
                      : st === 'In Progress'
                      ? 'bg-teal-600 text-white font-bold'
                      : st === 'Delayed'
                      ? 'bg-red-600 text-white font-bold'
                      : 'bg-slate-700 text-white font-bold'
                    : 'bg-slate-100 hover:bg-slate-200 text-slate-600'
                }`}
              >
                {st}
              </button>
            ))}
          </div>

          {!isEditing && (
            <button
              type="button"
              onClick={() => {
                setTargetDate(milestone.target_date || '');
                setCompletedDate(milestone.completed_date || '');
                setReferenceNumber(milestone.reference_number || '');
                setNotes(milestone.notes || '');
                setIsEditing(true);
                setIsExpanded(true);
              }}
              className="inline-flex items-center gap-1 text-xs text-teal-700 hover:text-teal-800 font-medium"
            >
              <Edit2 className="w-3 h-3" /> विवरण थप्नुहोस् (Edit Details)
            </button>
          )}
        </div>
      </div>

      {/* Expanded Details / Edit Section */}
      {isExpanded && (
        <div className="px-4 pb-4 pt-1 bg-slate-50/70 border-t border-slate-100 rounded-b-xl text-xs text-slate-600">
          {isEditing ? (
            <form onSubmit={handleSaveEdit} className="space-y-3 pt-2">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                    Target Due Date (अनुमानित मिति)
                  </label>
                  <input
                    type="date"
                    value={targetDate}
                    onChange={e => setTargetDate(e.target.value)}
                    className="w-full bg-white border border-slate-300 rounded-lg px-2.5 py-1.5 text-xs text-slate-800 focus:outline-none focus:border-teal-500"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                    Completed Date (सम्पन्न मिति)
                  </label>
                  <input
                    type="date"
                    value={completedDate}
                    onChange={e => setCompletedDate(e.target.value)}
                    className="w-full bg-white border border-slate-300 rounded-lg px-2.5 py-1.5 text-xs text-slate-800 focus:outline-none focus:border-teal-500"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                    Tracking / Ref # (रेफरेन्स नं)
                  </label>
                  <input
                    type="text"
                    value={referenceNumber}
                    onChange={e => setReferenceNumber(e.target.value)}
                    placeholder="e.g. WP-2026-990, GAMCA-882"
                    className="w-full bg-white border border-slate-300 rounded-lg px-2.5 py-1.5 text-xs text-slate-800 focus:outline-none focus:border-teal-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                  Field Notes & Observations (टिप्पणी / एजेन्टको जानकारी)
                </label>
                <textarea
                  rows={2}
                  value={notes}
                  onChange={e => setNotes(e.target.value)}
                  placeholder="Record agency counseling notes, submission tokens, or delay reasons..."
                  className="w-full bg-white border border-slate-300 rounded-lg px-2.5 py-1.5 text-xs text-slate-800 focus:outline-none focus:border-teal-500"
                />
              </div>

              <div className="flex items-center gap-2 justify-end pt-1">
                <button
                  type="button"
                  onClick={() => setIsEditing(false)}
                  className="px-3 py-1.5 rounded-lg border border-slate-300 bg-white hover:bg-slate-100 text-slate-700 text-xs transition"
                >
                  रद्द गर्नुहोस् (Cancel)
                </button>
                <button
                  type="submit"
                  className="px-3 py-1.5 rounded-lg bg-teal-600 hover:bg-teal-700 text-white text-xs font-semibold transition"
                >
                  सुरक्षित गर्नुहोस् (Save)
                </button>
              </div>
            </form>
          ) : (
            <div className="pt-2 space-y-2">
              {milestone.notes && (
                <div className="p-2.5 rounded-lg bg-white border border-slate-200/80 text-xs text-slate-700 leading-relaxed">
                  <span className="font-semibold text-slate-900 block mb-0.5">टिप्पणी (Notes):</span>
                  {milestone.notes}
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
