import React from 'react';
import {
  CheckCircle2,
  AlertCircle,
  FileText,
  ExternalLink,
  ShieldCheck,
  Calendar,
  Check
} from 'lucide-react';
import { VisaDocumentCheck } from '../../types/database';
import { OFFICIAL_VISA_PORTALS } from '../../lib/visaProcess';

interface VisaDocumentChecklistProps {
  documents: VisaDocumentCheck[];
  corridor: 'Europe' | 'Gulf' | 'Other';
  onToggleDoc: (docId: string) => void;
}

export const VisaDocumentChecklist: React.FC<VisaDocumentChecklistProps> = ({
  documents,
  corridor,
  onToggleDoc
}) => {
  const readyCount = documents.filter(d => d.is_ready).length;
  const totalCount = documents.length;
  const percent = totalCount > 0 ? Math.round((readyCount / totalCount) * 100) : 0;

  const isEurope = corridor === 'Europe';

  return (
    <div className="bg-white rounded-xl border border-slate-200/80 shadow-xs overflow-hidden">
      {/* Header with progress */}
      <div className="p-4 bg-slate-50/70 border-b border-slate-200/80">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2">
          <div>
            <h4 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <FileText className="w-4 h-4 text-teal-600" />
              {isEurope
                ? 'European VFS & Consular Document Dossier'
                : 'Gulf Employment & GAMCA Medical Checklist'}
            </h4>
            <p className="text-xs text-slate-500 mt-0.5">
              {isEurope
                ? 'युरोप भिसा आवेदनका लागि आवश्यक सक्कल तथा प्रमाणीकरण कागजातहरू'
                : 'गल्फ रोजगार, मेडिकल तथा अन्तिम श्रम स्वीकृति कागजातहरू'}
            </p>
          </div>

          <div className="flex items-center gap-2 self-start sm:self-auto">
            <span className="text-xs font-bold font-mono px-2.5 py-1 rounded-full bg-slate-200 text-slate-800">
              {readyCount} / {totalCount} Ready ({percent}%)
            </span>
          </div>
        </div>

        {/* Progress bar */}
        <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
          <div
            className={`h-full transition-all duration-300 ${
              percent === 100 ? 'bg-emerald-500' : 'bg-teal-600'
            }`}
            style={{ width: `${percent}%` }}
          />
        </div>
      </div>

      {/* Checklist items */}
      <div className="divide-y divide-slate-100">
        {documents.map(doc => {
          const isPolice = doc.name.toLowerCase().includes('police');
          const isVfs = doc.name.toLowerCase().includes('vfs');
          const isGamca = doc.name.toLowerCase().includes('gamca') || doc.name.toLowerCase().includes('medical');

          return (
            <div
              key={doc.id}
              onClick={() => onToggleDoc(doc.id)}
              className={`p-3.5 sm:p-4 flex items-start justify-between gap-3 cursor-pointer transition-colors ${
                doc.is_ready ? 'bg-emerald-50/30 hover:bg-emerald-50/50' : 'hover:bg-slate-50/80'
              }`}
            >
              <div className="flex items-start gap-3">
                {/* Custom Checkbox */}
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    onToggleDoc(doc.id);
                  }}
                  className={`w-5 h-5 rounded flex items-center justify-center shrink-0 mt-0.5 transition ${
                    doc.is_ready
                      ? 'bg-emerald-600 text-white border-transparent'
                      : 'border-2 border-slate-300 hover:border-slate-400 bg-white'
                  }`}
                >
                  {doc.is_ready && <Check className="w-3.5 h-3.5" />}
                </button>

                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <span
                      className={`text-sm font-semibold ${
                        doc.is_ready ? 'text-slate-900 line-through text-opacity-75' : 'text-slate-800'
                      }`}
                    >
                      {doc.name}
                    </span>
                    {doc.is_ready ? (
                      <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700 bg-emerald-100/80 px-2 py-0.5 rounded">
                        <CheckCircle2 className="w-3 h-3" /> तयार छ (Ready)
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-[11px] font-medium text-amber-800 bg-amber-50 px-2 py-0.5 rounded border border-amber-200/80">
                        <AlertCircle className="w-3 h-3 text-amber-600" /> बाँकी (Missing)
                      </span>
                    )}
                  </div>

                  {doc.name_np && (
                    <p className="text-xs text-slate-500 font-medium mt-0.5">{doc.name_np}</p>
                  )}

                  {doc.notes && (
                    <p className="text-[11px] text-slate-500 mt-1 italic">
                      💡 {doc.notes}
                    </p>
                  )}
                </div>
              </div>

              {/* Direct Gov Portal Helper Link */}
              <div className="shrink-0 flex items-center gap-1.5" onClick={(e) => e.stopPropagation()}>
                {isPolice && (
                  <a
                    href={OFFICIAL_VISA_PORTALS.nepalPoliceOpcr}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-1.5 text-xs text-slate-500 hover:text-teal-600 bg-slate-100 hover:bg-teal-50 rounded border border-slate-200 inline-flex items-center gap-1 transition"
                    title="Apply Nepal Police OPCR Online"
                  >
                    <span>OPCR</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                )}
                {isGamca && (
                  <a
                    href={OFFICIAL_VISA_PORTALS.gamcaWafidMedical}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-1.5 text-xs text-slate-500 hover:text-teal-600 bg-slate-100 hover:bg-teal-50 rounded border border-slate-200 inline-flex items-center gap-1 transition"
                    title="Check GAMCA / Wafid Slip Status"
                  >
                    <span>Wafid</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                )}
                {isVfs && (
                  <a
                    href={OFFICIAL_VISA_PORTALS.vfsGlobalNepal}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-1.5 text-xs text-slate-500 hover:text-teal-600 bg-slate-100 hover:bg-teal-50 rounded border border-slate-200 inline-flex items-center gap-1 transition"
                    title="VFS Global Nepal Booking"
                  >
                    <span>VFS</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
