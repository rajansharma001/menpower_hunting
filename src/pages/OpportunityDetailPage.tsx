import React, { useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useData } from '../context/DataContext';
import { Badge } from '../components/common/Badge';
import { VerificationStatus } from '../types/database';
import {
  ArrowLeft,
  Building2,
  Briefcase,
  DollarSign,
  Home,
  Receipt,
  FileCheck,
  Hourglass,
  CreditCard,
  ShieldCheck,
  CalendarCheck2,
  Trash2,
  Plus,
  CheckCircle2,
  Clock,
  MapPin,
  Phone,
  User,
  AlertTriangle,
  X,
  Copy,
  ExternalLink,
  ShieldAlert
} from 'lucide-react';
import { auditLegalRecruitmentCost, getDofePortalUrl } from '../lib/dofe';
import { calculatePaybackAnalysis, convertToNpr, formatNpr, NRB_BENCHMARK_RATES } from '../lib/currency';

export const OpportunityDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const {
    opportunities,
    removeOpportunity,
    updateVerification,
    addVerification,
    saveFollowUp
  } = useData();

  const opp = opportunities.find(o => o.id === id);

  // New verification item modal / state
  const [showAddVerModal, setShowAddVerModal] = useState(false);
  const [newVerTitle, setNewVerTitle] = useState('');
  const [newVerNotes, setNewVerNotes] = useState('');

  // Quick schedule follow-up modal / state
  const [showAddFollowUpModal, setShowAddFollowUpModal] = useState(false);
  const [followUpDate, setFollowUpDate] = useState(new Date().toISOString().split('T')[0]);
  const [followUpAction, setFollowUpAction] = useState('');
  const [copiedLt, setCopiedLt] = useState(false);

  if (!opp) {
    return (
      <div className="p-8 max-w-4xl mx-auto text-center space-y-3">
        <p className="text-sm text-slate-600">Opportunity record not found.</p>
        <Link
          to="/opportunities"
          className="inline-flex items-center space-x-1.5 px-3 py-1.5 bg-teal-700 text-white rounded text-xs"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Opportunities</span>
        </Link>
      </div>
    );
  }

  const handleDelete = async () => {
    if (window.confirm('Are you sure you want to delete this opportunity record?')) {
      await removeOpportunity(opp.id);
      navigate('/opportunities');
    }
  };

  const handleCreateVerification = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newVerTitle.trim()) return;
    await addVerification(opp.id, newVerTitle.trim(), newVerNotes.trim());
    setNewVerTitle('');
    setNewVerNotes('');
    setShowAddVerModal(false);
  };

  const handleCreateFollowUp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!followUpAction.trim()) return;
    await saveFollowUp({
      user_id: opp.user_id,
      opportunity_id: opp.id,
      follow_up_date: followUpDate,
      action: followUpAction.trim(),
      status: 'Pending'
    });
    setFollowUpAction('');
    setShowAddFollowUpModal(false);
  };

  // Cost calculation
  const c = opp.costs;
  const itemizedTotal = c
    ? (c.agency_service_charge || 0) +
      (c.government_processing_fee || 0) +
      (c.medical_exam || 0) +
      (c.insurance || 0) +
      (c.visa_fee || 0) +
      (c.documentation || 0) +
      (c.translation || 0) +
      (c.training || 0) +
      (c.air_ticket || 0) +
      (c.miscellaneous || 0)
    : 0;
  const quotedTotal = c?.total_quoted_cost || 0;
  const difference = quotedTotal - itemizedTotal;
  const legalAudit = auditLegalRecruitmentCost(
    opp.country,
    quotedTotal,
    opp.free_visa_free_ticket
  );

  const netForeignSalary = opp.expected_net_salary || opp.advertised_salary || 0;
  const accomCostForeign =
    opp.accommodation_type === 'Worker Pays' || opp.accommodation_type === 'Salary Deduction'
      ? opp.accommodation_cost || 0
      : 0;
  const paybackAnalysis = calculatePaybackAnalysis(
    quotedTotal,
    netForeignSalary,
    opp.net_salary_currency || opp.salary_currency || 'EUR',
    opp.country,
    accomCostForeign
  );

  return (
    <div className="p-4 sm:p-6 max-w-5xl mx-auto space-y-5">
      {/* Top Breadcrumb & Actions Bar */}
      <div className="flex items-center justify-between gap-2 pb-3 border-b border-slate-200">
        <button
          onClick={() => navigate(-1)}
          className="inline-flex items-center space-x-1.5 text-xs text-slate-600 hover:text-slate-900 font-medium"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back</span>
        </button>

        <div className="flex items-center space-x-2">
          <button
            onClick={() => setShowAddFollowUpModal(true)}
            className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 border border-slate-300 rounded text-xs font-semibold text-slate-800 transition flex items-center gap-1.5"
          >
            <CalendarCheck2 className="w-3.5 h-3.5 text-amber-700" />
            <span>Add Follow-up</span>
          </button>

          <button
            onClick={() => setShowAddVerModal(true)}
            className="px-3 py-1.5 bg-teal-50 hover:bg-teal-100 border border-teal-300 rounded text-xs font-semibold text-teal-900 transition flex items-center gap-1.5"
          >
            <ShieldCheck className="w-3.5 h-3.5 text-teal-700" />
            <span>Add Checklist Item</span>
          </button>

          <button
            onClick={handleDelete}
            className="p-1.5 text-slate-400 hover:text-red-700 rounded border border-transparent hover:border-slate-300 transition"
            title="Delete Record"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Main Title Card */}
      <div className="bg-white border border-slate-200 rounded-md p-4 sm:p-5 shadow-2xs space-y-2">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center space-x-2">
            <span className="text-xs font-bold text-teal-800 uppercase tracking-wider bg-teal-50 border border-teal-200 px-2 py-0.5 rounded">
              {opp.country}
            </span>
            {opp.is_demo && (
              <span className="text-2xs font-semibold text-amber-800 bg-amber-50 border border-amber-300 px-2 py-0.5 rounded">
                DEMO RECORD
              </span>
            )}
            <Badge status={opp.evidence_status}>{opp.evidence_status}</Badge>
            {opp.free_visa_free_ticket && (
              <span className="text-2xs font-semibold text-emerald-800 bg-emerald-50 border border-emerald-300 px-2 py-0.5 rounded">
                Free Visa / Free Ticket
              </span>
            )}
            {opp.dofe_lot_number && (
              <span className="text-2xs font-mono font-bold text-blue-900 bg-blue-50 border border-blue-300 px-2 py-0.5 rounded">
                LT: {opp.dofe_lot_number}
              </span>
            )}
          </div>

          <span className="text-2xs text-slate-400">
            Recorded: {new Date(opp.created_at).toLocaleDateString()}
          </span>
        </div>

        <h1 className="text-xl font-bold text-slate-900">
          {opp.job_title}
        </h1>

        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-600">
          {opp.agency ? (
            <Link
              to={`/agencies/${opp.agency.id}`}
              className="font-semibold text-teal-800 hover:text-teal-950 hover:underline flex items-center gap-1"
            >
              <Building2 className="w-3.5 h-3.5 text-teal-700" />
              <span>{opp.agency.name}</span>
            </Link>
          ) : (
            <span className="font-semibold text-slate-800">Agency</span>
          )}
          {opp.employer_name && (
            <span>
              Employer: <strong className="text-slate-700">{opp.employer_name}</strong>
              {opp.employer_city ? ` (${opp.employer_city})` : ''}
            </span>
          )}
          {opp.job_sector && <span>Sector: {opp.job_sector}</span>}
        </div>
      </div>

      {/* 2-Column Responsive Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Left 2 Columns: Core Terms, Costs, Verification */}
        <div className="lg:col-span-2 space-y-5">
          {/* 1. Salary & Working Terms */}
          <div className="bg-white border border-slate-200 rounded-md p-4 space-y-3 shadow-2xs">
            <h2 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5 border-b border-slate-100 pb-2">
              <DollarSign className="w-4 h-4 text-teal-700" />
              <span>Compensation & Work Terms</span>
            </h2>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
              <div>
                <span className="text-2xs text-slate-400 block">Advertised Salary</span>
                <span className="font-bold text-slate-900 text-sm">
                  {opp.advertised_salary
                    ? `${opp.advertised_salary.toLocaleString()} ${opp.salary_currency}`
                    : '—'}
                </span>
                {opp.advertised_salary && opp.salary_currency !== 'NPR' && (
                  <span className="text-2xs text-teal-800 font-semibold block">
                    ≈ {formatNpr(convertToNpr(opp.advertised_salary, opp.salary_currency))} / mo
                  </span>
                )}
                <span className="text-2xs text-slate-500 block">Type: {opp.salary_type || 'Unclear'}</span>
              </div>

              <div>
                <span className="text-2xs text-slate-400 block">Expected Net Take-Home</span>
                <span className="font-bold text-teal-800 text-sm">
                  {opp.expected_net_salary
                    ? `${opp.expected_net_salary.toLocaleString()} ${opp.net_salary_currency || opp.salary_currency}`
                    : '—'}
                </span>
                {opp.expected_net_salary && (opp.net_salary_currency || opp.salary_currency) !== 'NPR' && (
                  <span className="text-2xs text-emerald-800 font-semibold block">
                    ≈ {formatNpr(convertToNpr(opp.expected_net_salary, opp.net_salary_currency || opp.salary_currency))} / mo in Nepal
                  </span>
                )}
                <span className="text-2xs text-slate-500 block">After taxes & living costs</span>
              </div>

              <div>
                <span className="text-2xs text-slate-400 block">Hours & Schedule</span>
                <span className="font-semibold text-slate-800">
                  {opp.working_hours ? `${opp.working_hours} hrs/day` : '—'},{' '}
                  {opp.working_days ? `${opp.working_days} days/wk` : ''}
                </span>
              </div>

              <div>
                <span className="text-2xs text-slate-400 block">Overtime</span>
                <span className="font-semibold text-slate-800">{opp.overtime_status}</span>
                {opp.overtime_rate && (
                  <span className="text-2xs text-slate-500 block">{opp.overtime_rate}</span>
                )}
              </div>

              <div>
                <span className="text-2xs text-slate-400 block">Contract Duration</span>
                <span className="font-semibold text-slate-800">{opp.contract_length || '—'}</span>
              </div>

              <div>
                <span className="text-2xs text-slate-400 block">Probation Period</span>
                <span className="font-semibold text-slate-800">{opp.probation || '—'}</span>
              </div>
            </div>
          </div>

          {/* 2. Costs Breakdown & Unaccounted Difference */}
          <div className="bg-white border border-slate-200 rounded-md p-4 space-y-3 shadow-2xs">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2">
              <h2 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                <Receipt className="w-4 h-4 text-teal-700" />
                <span>Financial Analysis & Quoted Costs</span>
              </h2>
              {c?.written_cost ? (
                <span className="text-2xs font-semibold text-emerald-800 bg-emerald-50 border border-emerald-300 px-2 py-0.5 rounded">
                  Written Quotation
                </span>
              ) : (
                <span className="text-2xs text-slate-600 bg-slate-100 border border-slate-300 px-2 py-0.5 rounded">
                  Verbal Quote Only
                </span>
              )}
            </div>

            {/* Total Comparison Highlights */}
            <div className="grid grid-cols-3 gap-2 bg-slate-50 p-3 rounded-md border border-slate-200 text-center">
              <div>
                <span className="text-2xs text-slate-500 block">Quoted Total</span>
                <span className="text-sm sm:text-base font-bold text-slate-900">
                  NPR {quotedTotal.toLocaleString()}
                </span>
              </div>
              <div>
                <span className="text-2xs text-slate-500 block">Itemized Total</span>
                <span className="text-sm sm:text-base font-bold text-slate-700">
                  NPR {itemizedTotal.toLocaleString()}
                </span>
              </div>
              <div>
                <span className="text-2xs text-slate-500 block">Unaccounted Difference</span>
                <span className={`text-sm sm:text-base font-bold ${difference !== 0 ? 'text-amber-800' : 'text-emerald-800'}`}>
                  NPR {difference.toLocaleString()}
                </span>
              </div>
            </div>

            {/* Legal Cost Directive Audit Banner */}
            {legalAudit.isRegulated && (
              <div
                className={`p-3 rounded-md border text-xs space-y-2 ${
                  legalAudit.status === 'violation'
                    ? 'bg-amber-50/90 border-amber-300 text-amber-950'
                    : 'bg-emerald-50/90 border-emerald-300 text-emerald-950'
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center space-x-1.5 font-bold">
                    {legalAudit.status === 'violation' ? (
                      <AlertTriangle className="w-4 h-4 text-amber-700 flex-shrink-0" />
                    ) : (
                      <CheckCircle2 className="w-4 h-4 text-emerald-700 flex-shrink-0" />
                    )}
                    <span>
                      {legalAudit.status === 'violation'
                        ? 'Nepal Legal Cost Ceiling Warning (नि:शुल्क भिसा तथा टिकट)'
                        : 'Compliant with Nepal Legal Cost Ceiling'}
                    </span>
                  </div>
                  {opp.free_visa_free_ticket && (
                    <span className="text-2xs font-semibold px-2 py-0.5 rounded bg-white/80 border border-slate-300 text-slate-700 flex-shrink-0">
                      Free Visa Declared
                    </span>
                  )}
                </div>

                <p className="text-2xs text-slate-700 leading-relaxed">
                  {legalAudit.status === 'violation'
                    ? legalAudit.warningMessage
                    : legalAudit.successMessage}
                </p>

                {legalAudit.status === 'violation' && (
                  <div className="pt-1.5 border-t border-amber-200 text-2xs text-amber-900 flex flex-wrap gap-x-4 gap-y-1">
                    <span>Govt Service Fee Ceiling: <strong>NPR {legalAudit.legalCapNpr.toLocaleString()}</strong></span>
                    <span>Agency Quoted Total: <strong>NPR {legalAudit.quotedCostNpr.toLocaleString()}</strong></span>
                    <span className="font-bold text-red-700">
                      Excess Surcharge: ~NPR {(legalAudit.quotedCostNpr - legalAudit.legalCapNpr).toLocaleString()}
                    </span>
                  </div>
                )}
              </div>
            )}

            {/* Break-Even Payback Period & Debt Risk Analysis Widget */}
            <div className="p-3.5 rounded-md border bg-slate-50/90 border-slate-200 space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1.5 border-b border-slate-200/80 pb-2">
                <div className="flex items-center space-x-1.5">
                  <Clock className="w-4 h-4 text-teal-700" />
                  <span className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                    Break-Even Payback & Debt Analysis (लागत असुली अवधि)
                  </span>
                </div>
                <span className={`text-2xs font-bold px-2 py-0.5 rounded border self-start sm:self-auto ${paybackAnalysis.riskBadgeColor}`}>
                  {paybackAnalysis.riskBadgeLabel}
                </span>
              </div>

              {/* Grid with core numbers */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 text-xs">
                <div className="bg-white p-2 rounded border border-slate-200">
                  <span className="text-2xs text-slate-500 block">Total Quoted Cost</span>
                  <span className="font-bold text-slate-900 text-sm">
                    {formatNpr(paybackAnalysis.totalCostNpr)}
                  </span>
                </div>

                <div className="bg-white p-2 rounded border border-slate-200">
                  <span className="text-2xs text-slate-500 block">Net Monthly Take-home</span>
                  <span className="font-bold text-teal-800 text-sm">
                    {formatNpr(paybackAnalysis.monthlyNetNpr)}
                  </span>
                  <span className="text-2xs text-slate-400 block">
                    (~{opp.net_salary_currency || opp.salary_currency} {paybackAnalysis.monthlyNetForeign.toLocaleString()})
                  </span>
                </div>

                <div className="bg-white p-2 rounded border border-slate-200">
                  <span className="text-2xs text-slate-500 block">Labor to Break Even</span>
                  <span className="font-bold text-slate-900 text-sm">
                    {paybackAnalysis.paybackMonthsFormatted} Months
                  </span>
                  <span className="text-2xs text-slate-400 block">
                    {paybackAnalysis.corridor} Corridor
                  </span>
                </div>

                <div className="bg-white p-2 rounded border border-slate-200">
                  <span className="text-2xs text-slate-500 block">2-Year Net Savings</span>
                  <span className="font-bold text-emerald-800 text-sm">
                    {formatNpr(paybackAnalysis.twoYearContractSavingsNpr)}
                  </span>
                  <span className="text-2xs text-slate-400 block">After paying costs</span>
                </div>
              </div>

              {/* Contextual debt & loan advisory */}
              <div className="p-2.5 bg-white rounded border border-slate-200 text-2xs space-y-1">
                <span className="font-bold text-slate-800 block">
                  Financial Feasibility & Loan Risk Advisory ({paybackAnalysis.corridor}):
                </span>
                <p className="text-slate-700 leading-relaxed">
                  {paybackAnalysis.debtAdvice}
                </p>
                {paybackAnalysis.totalCostNpr > 300000 && (
                  <p className="text-slate-500 pt-0.5 italic">
                    Note: If financing this cost with an informal loan in Nepal (typically 24%–36% per annum), interest alone equals ~NPR {Math.round((paybackAnalysis.totalCostNpr * 0.28) / 12).toLocaleString()} per month.
                  </p>
                )}
              </div>
            </div>

            {/* Individual Itemized Costs Table */}
            {c && (
              <div className="overflow-x-auto pt-1">
                <table className="w-full text-xs text-left">
                  <tbody className="divide-y divide-slate-100">
                    <tr>
                      <td className="py-1.5 text-slate-600">Agency Service Charge</td>
                      <td className="py-1.5 text-right font-medium text-slate-900">
                        NPR {(c.agency_service_charge || 0).toLocaleString()}
                      </td>
                    </tr>
                    <tr>
                      <td className="py-1.5 text-slate-600">Government Processing Fee (DoFE)</td>
                      <td className="py-1.5 text-right font-medium text-slate-900">
                        NPR {(c.government_processing_fee || 0).toLocaleString()}
                      </td>
                    </tr>
                    <tr>
                      <td className="py-1.5 text-slate-600">Air Ticket</td>
                      <td className="py-1.5 text-right font-medium text-slate-900">
                        NPR {(c.air_ticket || 0).toLocaleString()}
                      </td>
                    </tr>
                    <tr>
                      <td className="py-1.5 text-slate-600">Visa & VFS Fee</td>
                      <td className="py-1.5 text-right font-medium text-slate-900">
                        NPR {(c.visa_fee || 0).toLocaleString()}
                      </td>
                    </tr>
                    <tr>
                      <td className="py-1.5 text-slate-600">Medical Exam</td>
                      <td className="py-1.5 text-right font-medium text-slate-900">
                        NPR {(c.medical_exam || 0).toLocaleString()}
                      </td>
                    </tr>
                    <tr>
                      <td className="py-1.5 text-slate-600">Insurance</td>
                      <td className="py-1.5 text-right font-medium text-slate-900">
                        NPR {(c.insurance || 0).toLocaleString()}
                      </td>
                    </tr>
                    <tr>
                      <td className="py-1.5 text-slate-600">Documentation & Attestation</td>
                      <td className="py-1.5 text-right font-medium text-slate-900">
                        NPR {(c.documentation || 0).toLocaleString()}
                      </td>
                    </tr>
                    <tr>
                      <td className="py-1.5 text-slate-600">Translation / Apostille</td>
                      <td className="py-1.5 text-right font-medium text-slate-900">
                        NPR {(c.translation || 0).toLocaleString()}
                      </td>
                    </tr>
                    <tr>
                      <td className="py-1.5 text-slate-600">Training / Orientation</td>
                      <td className="py-1.5 text-right font-medium text-slate-900">
                        NPR {(c.training || 0).toLocaleString()}
                      </td>
                    </tr>
                    <tr>
                      <td className="py-1.5 text-slate-600">Miscellaneous</td>
                      <td className="py-1.5 text-right font-medium text-slate-900">
                        NPR {(c.miscellaneous || 0).toLocaleString()}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* 3. Verification Checklist Workspace */}
          <div className="bg-white border border-slate-200 rounded-md p-4 space-y-3 shadow-2xs">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2">
              <div>
                <h2 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-blue-700" />
                  <span>Verification Checklist</span>
                </h2>
                <p className="text-2xs text-slate-500">
                  Track external verification of DoFE license, employer, contract, and fees
                </p>
              </div>
              <button
                onClick={() => setShowAddVerModal(true)}
                className="text-2xs font-semibold text-teal-700 hover:text-teal-900 flex items-center gap-1"
              >
                <Plus className="w-3 h-3" />
                <span>Add Item</span>
              </button>
            </div>

            <div className="divide-y divide-slate-100">
              {(opp.verification_items || []).length === 0 ? (
                <div className="py-4 text-center text-xs text-slate-500">
                  No verification items. Click &ldquo;Add Item&rdquo; to add custom checks.
                </div>
              ) : (
                (opp.verification_items || []).map(item => (
                  <div key={item.id} className="py-2.5 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div className="space-y-0.5">
                      <div className="flex items-center space-x-2">
                        <span className="text-xs font-semibold text-slate-900">{item.item}</span>
                        <Badge status={item.status} size="sm">{item.status}</Badge>
                      </div>
                      {item.notes && (
                        <p className="text-2xs text-slate-600">{item.notes}</p>
                      )}
                      {item.source && (
                        <span className="text-2xs text-slate-400 block">
                          Source: {item.source}
                        </span>
                      )}
                    </div>

                    <div className="flex items-center space-x-1.5 flex-shrink-0">
                      <select
                        value={item.status}
                        onChange={e =>
                          updateVerification(item.id, {
                            status: e.target.value as VerificationStatus,
                            verified_date:
                              e.target.value === 'Verified'
                                ? new Date().toISOString().split('T')[0]
                                : undefined
                          })
                        }
                        className="bg-slate-50 border border-slate-300 rounded px-2 py-1 text-2xs font-medium text-slate-800 focus:outline-none"
                      >
                        <option value="Needs Verification">Needs Verification</option>
                        <option value="Partially Verified">Partially Verified</option>
                        <option value="Verified">Verified</option>
                        <option value="Not Provided">Not Provided</option>
                      </select>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Right Column: Agency, Living, Documents, Timeline, Follow-ups */}
        <div className="space-y-5">
          {/* DoFE Lot Number & Verification Card */}
          <div className="bg-white border border-slate-200 rounded-md p-4 space-y-2.5 shadow-2xs text-xs">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2">
              <h3 className="font-bold text-slate-900 uppercase tracking-wider text-2xs flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-blue-700" />
                <span>DoFE Pre-Approval (पूर्व स्वीकृति)</span>
              </h3>
              {opp.dofe_lot_number ? (
                <span className="text-2xs font-bold text-blue-800 bg-blue-50 border border-blue-200 px-2 py-0.5 rounded">
                  LT Number On File
                </span>
              ) : (
                <span className="text-2xs font-medium text-amber-800 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded">
                  No LT Number
                </span>
              )}
            </div>

            {opp.dofe_lot_number ? (
              <div className="space-y-2.5">
                <div className="p-2.5 bg-blue-50/60 rounded border border-blue-200 space-y-1">
                  <div className="text-2xs text-blue-800 font-semibold">
                    Approved Lot (LT) Number:
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-sm font-bold text-slate-900 tracking-wide">
                      {opp.dofe_lot_number}
                    </span>
                    <button
                      onClick={() => {
                        navigator.clipboard.writeText(opp.dofe_lot_number || '');
                        setCopiedLt(true);
                        setTimeout(() => setCopiedLt(false), 2000);
                      }}
                      className="px-2 py-1 bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 rounded text-2xs font-medium flex items-center gap-1 transition"
                      title="Copy LT Number"
                    >
                      {copiedLt ? (
                        <>
                          <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                          <span className="text-emerald-700">Copied</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3 h-3 text-slate-500" />
                          <span>Copy</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>

                <p className="text-2xs text-slate-600 leading-relaxed">
                  Verify this LT number on Nepal DoFE FEIMS to confirm quota, approved salary, contract terms, and licensed agency before signing or paying any advance.
                </p>

                <a
                  href={getDofePortalUrl(opp.dofe_lot_number)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full py-2 bg-blue-700 hover:bg-blue-600 text-white rounded text-xs font-semibold flex items-center justify-center gap-1.5 transition shadow-2xs"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  <span>Verify on Nepal DoFE Portal</span>
                </a>
              </div>
            ) : (
              <div className="space-y-2">
                <div className="p-2 bg-amber-50 rounded border border-amber-200 text-2xs text-amber-900 leading-relaxed">
                  <strong>Missing Lot Number:</strong> Authorized foreign recruitment demands in Nepal require an approved Pre-Approval Lot Number (पूर्व स्वीकृति लट नं).
                </div>
                <p className="text-2xs text-slate-600">
                  Ask the manpower agency for their DoFE LT number so you can independently verify vacancy authenticity.
                </p>
                <a
                  href={getDofePortalUrl()}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-2xs font-semibold text-teal-700 hover:text-teal-900 hover:underline"
                >
                  <span>Open DoFE Official Portal</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>
            )}
          </div>

          {/* Agency Details Card */}
          <div className="bg-white border border-slate-200 rounded-md p-4 space-y-2.5 shadow-2xs text-xs">
            <h3 className="font-bold text-slate-900 uppercase tracking-wider text-2xs flex items-center gap-1.5 border-b border-slate-100 pb-2">
              <Building2 className="w-3.5 h-3.5 text-teal-700" />
              <span>Agency Record</span>
            </h3>

            <div className="space-y-1.5">
              <div className="font-semibold text-slate-900 text-sm">
                {opp.agency?.name}
              </div>
              {opp.agency?.location && (
                <div className="flex items-center gap-1.5 text-slate-600">
                  <MapPin className="w-3.5 h-3.5 text-slate-400" />
                  <span>{opp.agency.location}</span>
                </div>
              )}
              {opp.agency?.phone && (
                <div className="flex items-center gap-1.5 text-slate-600">
                  <Phone className="w-3.5 h-3.5 text-slate-400" />
                  <span>{opp.agency.phone}</span>
                </div>
              )}
              {opp.agency?.contact_person && (
                <div className="flex items-center gap-1.5 text-slate-600">
                  <User className="w-3.5 h-3.5 text-slate-400" />
                  <span>{opp.agency.contact_person}</span>
                </div>
              )}
              {opp.agency?.license_number && (
                <div className="text-2xs text-slate-500 pt-1">
                  License: <span className="font-mono">{opp.agency.license_number}</span>
                </div>
              )}
              {opp.agency && (
                <div className="pt-2 border-t border-slate-100">
                  <Link
                    to={`/agencies/${opp.agency.id}`}
                    className="text-2xs font-semibold text-teal-700 hover:text-teal-900 hover:underline flex items-center justify-between"
                  >
                    <span>View Agency Profile</span>
                    <span>→</span>
                  </Link>
                </div>
              )}
            </div>
          </div>

          {/* Living Conditions */}
          <div className="bg-white border border-slate-200 rounded-md p-4 space-y-2 shadow-2xs text-xs">
            <h3 className="font-bold text-slate-900 uppercase tracking-wider text-2xs flex items-center gap-1.5 border-b border-slate-100 pb-2">
              <Home className="w-3.5 h-3.5 text-teal-700" />
              <span>Living & Facilities</span>
            </h3>

            <div className="space-y-1.5">
              <div className="flex justify-between">
                <span className="text-slate-500">Accommodation:</span>
                <span className="font-semibold text-slate-800">{opp.accommodation_type}</span>
              </div>
              {opp.accommodation_cost && (
                <div className="flex justify-between text-2xs text-slate-600">
                  <span>Monthly Cost:</span>
                  <span>{opp.accommodation_cost} {opp.salary_currency}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span className="text-slate-500">Food:</span>
                <span className="font-semibold text-slate-800">{opp.food_arrangement}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Transportation:</span>
                <span className="font-semibold text-slate-800">{opp.transportation}</span>
              </div>
            </div>
          </div>

          {/* Work Permit & Timeline */}
          <div className="bg-white border border-slate-200 rounded-md p-4 space-y-2 shadow-2xs text-xs">
            <h3 className="font-bold text-slate-900 uppercase tracking-wider text-2xs flex items-center gap-1.5 border-b border-slate-100 pb-2">
              <Hourglass className="w-3.5 h-3.5 text-teal-700" />
              <span>Permit & Processing</span>
            </h3>

            <div className="space-y-1.5">
              <div className="flex justify-between items-center">
                <span className="text-slate-500">Permit Status:</span>
                <Badge status={opp.work_permit_status} size="sm">{opp.work_permit_status}</Badge>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Estimated Departure:</span>
                <span className="font-semibold text-slate-800">{opp.estimated_total_processing_time || '—'}</span>
              </div>
              <div className="flex justify-between text-2xs">
                <span className="text-slate-500">Timeline Basis:</span>
                <span className="text-slate-700">{opp.timeline_basis}</span>
              </div>
            </div>
          </div>

          {/* Documents Shown in Office */}
          <div className="bg-white border border-slate-200 rounded-md p-4 space-y-2 shadow-2xs text-xs">
            <h3 className="font-bold text-slate-900 uppercase tracking-wider text-2xs flex items-center gap-1.5 border-b border-slate-100 pb-2">
              <FileCheck className="w-3.5 h-3.5 text-teal-700" />
              <span>Documents Shown ({opp.documents?.length || 0})</span>
            </h3>

            {(opp.documents || []).length === 0 ? (
              <p className="text-2xs text-slate-400">No documents shown during visit.</p>
            ) : (
              <ul className="space-y-1.5">
                {(opp.documents || []).map(d => (
                  <li key={d.id} className="p-2 bg-slate-50 rounded border border-slate-200 text-2xs space-y-0.5">
                    <div className="flex items-center justify-between font-semibold text-slate-900">
                      <span>{d.document_type}</span>
                      <span className="text-slate-500 font-normal">Photo: {d.photo_allowed}</span>
                    </div>
                    {d.notes && <p className="text-slate-600">{d.notes}</p>}
                  </li>
                ))}
              </ul>
            )}
          </div>

          {/* Scheduled Follow-ups */}
          <div className="bg-white border border-slate-200 rounded-md p-4 space-y-2 shadow-2xs text-xs">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2">
              <h3 className="font-bold text-slate-900 uppercase tracking-wider text-2xs flex items-center gap-1.5">
                <CalendarCheck2 className="w-3.5 h-3.5 text-amber-700" />
                <span>Follow-ups ({opp.follow_ups?.length || 0})</span>
              </h3>
              <button
                onClick={() => setShowAddFollowUpModal(true)}
                className="text-2xs font-semibold text-teal-700 hover:text-teal-900"
              >
                + Schedule
              </button>
            </div>

            {(opp.follow_ups || []).length === 0 ? (
              <p className="text-2xs text-slate-400">No follow-ups scheduled.</p>
            ) : (
              <ul className="space-y-1.5">
                {(opp.follow_ups || []).map(f => (
                  <li key={f.id} className="p-2 bg-slate-50 rounded border border-slate-200 text-2xs space-y-0.5">
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-slate-800">{f.action}</span>
                      <Badge status={f.status} size="sm">{f.status}</Badge>
                    </div>
                    <span className="text-slate-400 text-2xs block">Due: {f.follow_up_date}</span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </div>

      {/* Modal: Add Checklist Item */}
      {showAddVerModal && (
        <div
          onClick={e => {
            if (e.target === e.currentTarget) setShowAddVerModal(false);
          }}
          className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4"
        >
          <div className="bg-white rounded-md border border-slate-300 p-5 max-w-md w-full shadow-lg space-y-3">
            <div className="flex items-center justify-between border-b border-slate-200 pb-2">
              <h3 className="text-sm font-bold text-slate-900">Add Verification Checklist Item</h3>
              <button
                type="button"
                onClick={() => setShowAddVerModal(false)}
                className="text-slate-500 hover:text-slate-800 p-1.5 rounded hover:bg-slate-100 touch-manipulation transition"
                title="Close dialog"
                aria-label="Close dialog"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <form onSubmit={handleCreateVerification} className="space-y-3 text-xs">
              <div>
                <label className="block font-medium text-slate-700 mb-1">Check Item Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Check employer tax clearance with Polish tax portal"
                  className="w-full bg-slate-50 border border-slate-300 rounded p-2 text-xs text-slate-900"
                  value={newVerTitle}
                  onChange={e => setNewVerTitle(e.target.value)}
                />
              </div>

              <div>
                <label className="block font-medium text-slate-700 mb-1">Verification Notes / Source</label>
                <textarea
                  rows={2}
                  placeholder="e.g. Need to verify tax number on mf.gov.pl"
                  className="w-full bg-slate-50 border border-slate-300 rounded p-2 text-xs text-slate-900"
                  value={newVerNotes}
                  onChange={e => setNewVerNotes(e.target.value)}
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowAddVerModal(false)}
                  className="px-3 py-1.5 border border-slate-300 rounded text-slate-700 hover:bg-slate-100 touch-manipulation"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-teal-700 hover:bg-teal-600 text-white rounded font-medium touch-manipulation"
                >
                  Add Item
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Add Follow-up */}
      {showAddFollowUpModal && (
        <div
          onClick={e => {
            if (e.target === e.currentTarget) setShowAddFollowUpModal(false);
          }}
          className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4"
        >
          <div className="bg-white rounded-md border border-slate-300 p-5 max-w-md w-full shadow-lg space-y-3">
            <div className="flex items-center justify-between border-b border-slate-200 pb-2">
              <h3 className="text-sm font-bold text-slate-900">Schedule Follow-up Action</h3>
              <button
                type="button"
                onClick={() => setShowAddFollowUpModal(false)}
                className="text-slate-500 hover:text-slate-800 p-1.5 rounded hover:bg-slate-100 touch-manipulation transition"
                title="Close dialog"
                aria-label="Close dialog"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <form onSubmit={handleCreateFollowUp} className="space-y-3 text-xs">
              <div>
                <label className="block font-medium text-slate-700 mb-1">Action Description</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Call counselor Ramesh to ask for work permit submission proof"
                  className="w-full bg-slate-50 border border-slate-300 rounded p-2 text-xs text-slate-900"
                  value={followUpAction}
                  onChange={e => setFollowUpAction(e.target.value)}
                />
              </div>

              <div>
                <label className="block font-medium text-slate-700 mb-1">Scheduled Date</label>
                <input
                  type="date"
                  required
                  className="w-full bg-slate-50 border border-slate-300 rounded p-2 text-xs text-slate-900"
                  value={followUpDate}
                  onChange={e => setFollowUpDate(e.target.value)}
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowAddFollowUpModal(false)}
                  className="px-3 py-1.5 border border-slate-300 rounded text-slate-700 hover:bg-slate-100 touch-manipulation"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-teal-700 hover:bg-teal-600 text-white rounded font-medium touch-manipulation"
                >
                  Schedule Action
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
