import React, { useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { useData } from '../context/DataContext';
import { useAuth } from '../context/AuthContext';
import { Badge } from '../components/common/Badge';
import { FollowUp, FollowUpStatus } from '../types/database';
import {
  CalendarCheck2,
  Clock,
  CheckCircle2,
  Plus,
  Trash2,
  Calendar,
  AlertCircle,
  ExternalLink,
  X
} from 'lucide-react';

export const FollowUpsPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const { user } = useAuth();
  const { followUps, opportunities, editFollowUp, removeFollowUp, saveFollowUp } = useData();

  const [activeTab, setActiveTab] = useState<'all' | 'overdue' | 'today' | 'upcoming' | 'completed'>('all');

  // New follow up modal
  const newForOppId = searchParams.get('newFor');
  const defaultAction = searchParams.get('defaultAction') || '';

  const [showModal, setShowModal] = useState(!!newForOppId);
  const [action, setAction] = useState(defaultAction);
  const [targetOppId, setTargetOppId] = useState(newForOppId || (opportunities[0]?.id || ''));
  const [dueDate, setDueDate] = useState(new Date().toISOString().split('T')[0]);
  const [notes, setNotes] = useState('');

  const todayStr = new Date().toISOString().split('T')[0];

  const enrichedFollowUps = followUps.map(f => {
    const opp = opportunities.find(o => o.id === f.opportunity_id);
    return {
      ...f,
      oppTitle: opp ? `${opp.country} — ${opp.job_title}` : 'Opportunity',
      agencyName: opp?.agency?.name || 'Agency',
    };
  });

  const categorizedFollowUps = enrichedFollowUps.filter(f => {
    if (activeTab === 'completed') return f.status === 'Completed';
    if (f.status === 'Completed') return false; // In other tabs, exclude completed

    if (activeTab === 'overdue') return f.follow_up_date < todayStr;
    if (activeTab === 'today') return f.follow_up_date === todayStr;
    if (activeTab === 'upcoming') return f.follow_up_date > todayStr;
    return true; // 'all' non-completed
  });

  const handleToggleComplete = async (f: FollowUp) => {
    const nextStatus: FollowUpStatus = f.status === 'Completed' ? 'Pending' : 'Completed';
    await editFollowUp(f.id, { status: nextStatus });
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!action.trim() || !targetOppId) return;

    await saveFollowUp({
      user_id: user?.id || '',
      opportunity_id: targetOppId,
      follow_up_date: dueDate,
      action: action.trim(),
      status: 'Pending',
      notes: notes.trim()
    });

    setAction('');
    setNotes('');
    setShowModal(false);
  };

  return (
    <div className="p-4 sm:p-6 max-w-5xl mx-auto space-y-4">
      {/* Header */}
      <div className="pb-3 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-lg font-bold text-slate-900 tracking-tight">
            Follow-up Center
          </h1>
          <p className="text-xs text-slate-500">
            Keep track of required phone calls, permit checks, and agency promises
          </p>
        </div>

        <button
          onClick={() => setShowModal(true)}
          className="inline-flex items-center space-x-1.5 px-3 py-1.5 bg-teal-700 hover:bg-teal-600 text-white rounded text-xs font-semibold shadow-xs transition"
        >
          <Plus className="w-4 h-4" />
          <span>New Follow-up</span>
        </button>
      </div>

      {/* Tabs */}
      <div className="flex items-center space-x-1 bg-slate-100 p-1 rounded-md text-2xs font-semibold">
        {[
          { key: 'all', label: 'All Active' },
          { key: 'today', label: "Today's Due" },
          { key: 'overdue', label: 'Overdue' },
          { key: 'upcoming', label: 'Upcoming' },
          { key: 'completed', label: 'Completed' }
        ].map(tab => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key as any)}
            className={`px-3 py-1.5 rounded transition ${
              activeTab === tab.key
                ? 'bg-white text-slate-900 shadow-2xs font-bold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* List */}
      <div className="bg-white border border-slate-200 rounded-md overflow-hidden shadow-2xs">
        {categorizedFollowUps.length === 0 ? (
          <div className="p-8 text-center text-xs text-slate-500">
            No follow-ups in &ldquo;{activeTab}&rdquo; view.
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {categorizedFollowUps.map(f => {
              const isOverdue = f.follow_up_date < todayStr && f.status !== 'Completed';
              const isToday = f.follow_up_date === todayStr && f.status !== 'Completed';

              return (
                <div
                  key={f.id}
                  className="p-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-slate-50/80 transition"
                >
                  <div className="flex items-start space-x-3">
                    <button
                      onClick={() => handleToggleComplete(f)}
                      className={`mt-0.5 w-5 h-5 rounded border flex items-center justify-center transition flex-shrink-0 ${
                        f.status === 'Completed'
                          ? 'bg-emerald-600 border-emerald-600 text-white'
                          : 'border-slate-300 hover:border-teal-700 bg-white'
                      }`}
                    >
                      {f.status === 'Completed' && <CheckCircle2 className="w-3.5 h-3.5" />}
                    </button>

                    <div className="space-y-0.5">
                      <div
                        className={`text-xs font-semibold ${
                          f.status === 'Completed' ? 'line-through text-slate-400' : 'text-slate-900'
                        }`}
                      >
                        {f.action}
                      </div>

                      <div className="flex flex-wrap items-center gap-2 text-2xs text-slate-500">
                        <Link
                          to={`/opportunities/${f.opportunity_id}`}
                          className="font-medium text-teal-800 hover:underline flex items-center gap-0.5"
                        >
                          <span>{f.oppTitle}</span>
                          <ExternalLink className="w-2.5 h-2.5" />
                        </Link>
                        <span>•</span>
                        <span>{f.agencyName}</span>
                      </div>

                      {f.notes && (
                        <p className="text-2xs text-slate-600 pt-0.5">{f.notes}</p>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center space-x-3 flex-shrink-0 self-end sm:self-center">
                    <div className="text-right">
                      <div
                        className={`text-2xs font-semibold ${
                          isOverdue
                            ? 'text-red-700'
                            : isToday
                            ? 'text-amber-800'
                            : 'text-slate-600'
                        }`}
                      >
                        {isOverdue && '⚠️ Overdue: '}
                        {isToday && '📅 Due Today: '}
                        {f.follow_up_date}
                      </div>
                      <div className="mt-0.5">
                        <Badge status={f.status} size="sm">{f.status}</Badge>
                      </div>
                    </div>

                    <button
                      onClick={() => removeFollowUp(f.id)}
                      className="text-slate-400 hover:text-red-600 p-1"
                      title="Delete follow-up"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* New Follow-up Modal */}
      {showModal && (
        <div
          onClick={e => {
            if (e.target === e.currentTarget) setShowModal(false);
          }}
          className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4"
        >
          <div className="bg-white rounded-md border border-slate-300 max-w-md w-full p-5 space-y-3 shadow-xl">
            <div className="flex items-center justify-between border-b border-slate-200 pb-2">
              <h3 className="text-sm font-bold text-slate-900">Schedule Follow-up</h3>
              <button
                type="button"
                onClick={() => setShowModal(false)}
                className="text-slate-500 hover:text-slate-800 p-1.5 rounded hover:bg-slate-100 touch-manipulation transition"
                title="Close dialog"
                aria-label="Close dialog"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {opportunities.length === 0 ? (
              <div className="p-4 bg-amber-50 border border-amber-200 rounded-md text-xs text-amber-900 space-y-2.5">
                <p>No opportunity records found yet. Follow-ups are attached to specific job opportunities.</p>
                <div className="pt-1 flex gap-2">
                  <Link
                    to="/new-visit"
                    onClick={() => setShowModal(false)}
                    className="inline-block px-3.5 py-1.5 bg-teal-700 hover:bg-teal-600 text-white rounded text-xs font-semibold"
                  >
                    + Record First Visit Now →
                  </Link>
                  <button
                    type="button"
                    onClick={() => setShowModal(false)}
                    className="px-3 py-1.5 border border-slate-300 rounded text-xs text-slate-700 hover:bg-slate-100"
                  >
                    Close
                  </button>
                </div>
              </div>
            ) : (
              <form onSubmit={handleCreate} className="space-y-3 text-xs">
                <div>
                  <label className="block font-medium text-slate-700 mb-1">Target Opportunity *</label>
                  <select
                    value={targetOppId}
                    onChange={e => setTargetOppId(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 rounded p-2 text-xs text-slate-900"
                  >
                    {opportunities.map(o => (
                      <option key={o.id} value={o.id}>
                        {o.country} — {o.job_title} ({o.agency?.name || 'Agency'})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-medium text-slate-700 mb-1">Action Description *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Call counselor to confirm work permit filing receipt"
                    className="w-full bg-slate-50 border border-slate-300 rounded p-2 text-xs text-slate-900"
                    value={action}
                    onChange={e => setAction(e.target.value)}
                  />
                </div>

                <div>
                  <label className="block font-medium text-slate-700 mb-1">Follow-up Date *</label>
                  <input
                    type="date"
                    required
                    className="w-full bg-slate-50 border border-slate-300 rounded p-2 text-xs text-slate-900"
                    value={dueDate}
                    onChange={e => setDueDate(e.target.value)}
                  />
                </div>

                <div>
                  <label className="block font-medium text-slate-700 mb-1">Notes (Optional)</label>
                  <textarea
                    rows={2}
                    placeholder="e.g. Reference number mentioned by agency: #904"
                    className="w-full bg-slate-50 border border-slate-300 rounded p-2 text-xs text-slate-900"
                    value={notes}
                    onChange={e => setNotes(e.target.value)}
                  />
                </div>

                <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => setShowModal(false)}
                    className="px-3 py-1.5 border border-slate-300 rounded text-slate-700 hover:bg-slate-100"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-1.5 bg-teal-700 hover:bg-teal-600 text-white rounded font-medium"
                  >
                    Schedule
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
