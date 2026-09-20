import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useData } from '../context/DataContext';
import { Badge } from '../components/common/Badge';
import { VerificationItem, VerificationStatus } from '../types/database';
import {
  ShieldCheck,
  CheckCircle2,
  Clock,
  CalendarCheck2,
  ExternalLink,
  Search,
  Filter,
  FileText
} from 'lucide-react';

export const VerificationPage: React.FC = () => {
  const { opportunities, updateVerification, saveFollowUp } = useData();
  const [filterStatus, setFilterStatus] = useState<string>('Needs Verification');
  const [activeItemForNote, setActiveItemForNote] = useState<VerificationItem | null>(null);
  const [noteInput, setNoteInput] = useState('');
  const [sourceInput, setSourceInput] = useState('');

  // Collect all verification items across opportunities
  const allItems = opportunities.flatMap(opp => {
    return (opp.verification_items || []).map(item => ({
      ...item,
      oppTitle: `${opp.country} — ${opp.job_title}`,
      agencyName: opp.agency?.name || 'Agency',
      oppId: opp.id,
      country: opp.country
    }));
  });

  const filteredItems = allItems.filter(item => {
    if (filterStatus === 'ALL') return true;
    return item.status === filterStatus;
  });

  // Group by Opportunity
  const groupedByOpp = filteredItems.reduce((acc, item) => {
    if (!acc[item.oppId]) {
      acc[item.oppId] = {
        oppTitle: item.oppTitle,
        agencyName: item.agencyName,
        country: item.country,
        oppId: item.oppId,
        items: []
      };
    }
    acc[item.oppId].items.push(item);
    return acc;
  }, {} as Record<string, { oppTitle: string; agencyName: string; country: string; oppId: string; items: typeof allItems }>);

  const handleOpenNoteModal = (item: VerificationItem) => {
    setActiveItemForNote(item);
    setNoteInput(item.notes || '');
    setSourceInput(item.source || '');
  };

  const handleSaveNote = async () => {
    if (!activeItemForNote) return;
    await updateVerification(activeItemForNote.id, {
      notes: noteInput,
      source: sourceInput
    });
    setActiveItemForNote(null);
  };

  const handleQuickVerify = async (id: string) => {
    await updateVerification(id, {
      status: 'Verified',
      verified_date: new Date().toISOString().split('T')[0]
    });
  };

  return (
    <div className="p-4 sm:p-6 max-w-7xl mx-auto space-y-4">
      {/* Header */}
      <div className="pb-3 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-lg font-bold text-slate-900 tracking-tight">
            Verification Center
          </h1>
          <p className="text-xs text-slate-500">
            Post-visit research workspace for checking DoFE legality, employer registration, and contracts
          </p>
        </div>

        {/* Filter Tabs */}
        <div className="flex items-center space-x-1 bg-slate-100 p-1 rounded-md text-2xs font-semibold">
          {[
            { key: 'Needs Verification', label: 'Needs Verification' },
            { key: 'Partially Verified', label: 'Partially Verified' },
            { key: 'Verified', label: 'Verified' },
            { key: 'ALL', label: 'All Items' }
          ].map(tab => (
            <button
              key={tab.key}
              onClick={() => setFilterStatus(tab.key)}
              className={`px-3 py-1.5 rounded transition ${
                filterStatus === tab.key
                  ? 'bg-white text-slate-900 shadow-2xs font-bold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Grouped Opportunities Checklist Cards */}
      {Object.values(groupedByOpp).length === 0 ? (
        <div className="bg-white p-8 rounded-md border border-slate-200 text-center text-xs text-slate-500 space-y-3">
          <p>No verification checklist items currently marked as &ldquo;{filterStatus}&rdquo;.</p>
          <div className="flex justify-center gap-2">
            <Link
              to="/new-visit"
              className="inline-block px-3.5 py-1.5 bg-teal-700 hover:bg-teal-600 text-white rounded font-semibold text-xs transition"
            >
              + Record Agency Visit
            </Link>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          {Object.values(groupedByOpp).map(group => (
            <div
              key={group.oppId}
              className="bg-white border border-slate-200 rounded-md overflow-hidden shadow-2xs"
            >
              {/* Group Header */}
              <div className="bg-slate-50/80 px-4 py-3 border-b border-slate-200 flex items-center justify-between">
                <div>
                  <h2 className="font-bold text-slate-900 text-sm">{group.oppTitle}</h2>
                  <p className="text-2xs text-slate-500">{group.agencyName}</p>
                </div>
                <Link
                  to={`/opportunities/${group.oppId}`}
                  className="text-xs font-semibold text-teal-700 hover:underline flex items-center gap-1"
                >
                  <span>Opportunity Details</span>
                  <ExternalLink className="w-3 h-3" />
                </Link>
              </div>

              {/* Items List */}
              <div className="p-4 divide-y divide-slate-100">
                {group.items.map(item => (
                  <div
                    key={item.id}
                    className="py-3 first:pt-0 last:pb-0 flex flex-col md:flex-row md:items-center justify-between gap-3"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center space-x-2">
                        <span className="text-xs font-bold text-slate-800">{item.item}</span>
                        <Badge status={item.status} size="sm">{item.status}</Badge>
                      </div>

                      {item.notes && (
                        <p className="text-2xs text-slate-600 bg-slate-50 p-1.5 rounded border border-slate-100">
                          {item.notes}
                        </p>
                      )}

                      {item.source && (
                        <span className="text-2xs text-slate-400 block">
                          Verified via: <strong className="text-slate-600">{item.source}</strong>
                          {item.verified_date ? ` on ${item.verified_date}` : ''}
                        </span>
                      )}
                    </div>

                    {/* Quick Inline Actions */}
                    <div className="flex items-center space-x-2 flex-shrink-0">
                      {item.status !== 'Verified' && (
                        <button
                          onClick={() => handleQuickVerify(item.id)}
                          className="px-2.5 py-1 bg-emerald-50 hover:bg-emerald-100 border border-emerald-300 text-emerald-800 text-2xs font-semibold rounded transition flex items-center gap-1"
                        >
                          <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                          <span>Mark Verified</span>
                        </button>
                      )}

                      <button
                        onClick={() => handleOpenNoteModal(item)}
                        className="px-2.5 py-1 bg-slate-50 hover:bg-slate-100 border border-slate-300 text-slate-700 text-2xs font-semibold rounded transition flex items-center gap-1"
                      >
                        <FileText className="w-3 h-3 text-slate-500" />
                        <span>Add Note / Source</span>
                      </button>

                      <Link
                        to={`/follow-ups?newFor=${group.oppId}&defaultAction=Follow up on ${encodeURIComponent(item.item)}`}
                        className="px-2.5 py-1 bg-amber-50 hover:bg-amber-100 border border-amber-300 text-amber-800 text-2xs font-semibold rounded transition flex items-center gap-1"
                      >
                        <CalendarCheck2 className="w-3 h-3 text-amber-700" />
                        <span>Schedule Follow-up</span>
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Note / Source Modal */}
      {activeItemForNote && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-md border border-slate-300 max-w-md w-full p-5 space-y-3 shadow-xl">
            <h3 className="text-sm font-bold text-slate-900">
              Verification Notes: {activeItemForNote.item}
            </h3>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block font-medium text-slate-700 mb-1">
                  Findings / Observations
                </label>
                <textarea
                  rows={3}
                  className="w-full bg-slate-50 border border-slate-300 rounded p-2 text-xs text-slate-900 focus:outline-none"
                  placeholder="e.g. Looked up on government commercial register; active status confirmed."
                  value={noteInput}
                  onChange={e => setNoteInput(e.target.value)}
                />
              </div>

              <div>
                <label className="block font-medium text-slate-700 mb-1">
                  Verification Source / Link
                </label>
                <input
                  type="text"
                  className="w-full bg-slate-50 border border-slate-300 rounded p-2 text-xs text-slate-900 focus:outline-none"
                  placeholder="e.g. feims.dofe.gov.np or official embassy portal"
                  value={sourceInput}
                  onChange={e => setSourceInput(e.target.value)}
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setActiveItemForNote(null)}
                  className="px-3 py-1.5 border border-slate-300 rounded text-slate-700 hover:bg-slate-100"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleSaveNote}
                  className="px-4 py-1.5 bg-teal-700 hover:bg-teal-600 text-white rounded font-medium"
                >
                  Save Changes
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
