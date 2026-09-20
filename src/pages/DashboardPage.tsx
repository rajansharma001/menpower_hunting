import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useData } from '../context/DataContext';
import { Badge } from '../components/common/Badge';
import { DemoDataBanner } from '../components/demo/DemoDataBanner';
import {
  Building2,
  Briefcase,
  Globe2,
  ShieldCheck,
  CalendarCheck2,
  Receipt,
  PlusCircle,
  ArrowRight,
  ExternalLink
} from 'lucide-react';

export const DashboardPage: React.FC = () => {
  const { opportunities, agencies, followUps, loading } = useData();
  const navigate = useNavigate();

  // Statistics calculation
  const totalAgencies = agencies.length;
  const totalOpportunities = opportunities.length;

  const distinctCountries = new Set(opportunities.map(o => o.country)).size;

  const pendingVerifications = opportunities.reduce((acc, opp) => {
    return acc + (opp.verification_items || []).filter(v => v.status === 'Needs Verification').length;
  }, 0);

  const pendingFollowUps = followUps.filter(f => f.status === 'Pending').length;

  const completeCostOpps = opportunities.filter(
    o => o.costs && o.costs.total_quoted_cost > 0 && o.costs.cost_breakdown_status === 'Full'
  ).length;

  const recentOpps = [...opportunities].slice(0, 7);

  return (
    <div className="p-4 sm:p-6 max-w-7xl mx-auto space-y-6">
      <DemoDataBanner />

      {/* Top Welcome & Primary Call to Action */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight">
            Research Dashboard
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Field notebook for foreign employment opportunities & agency verification
          </p>
        </div>

        <Link
          to="/new-visit"
          className="inline-flex items-center justify-center space-x-2 px-4 py-2.5 bg-teal-700 hover:bg-teal-600 text-white text-xs font-semibold rounded-md shadow-xs transition"
        >
          <PlusCircle className="w-4 h-4" />
          <span>Record New Agency Visit</span>
        </Link>
      </div>

      {/* Core Top Statistics Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-6 gap-3">
        <div className="bg-white border border-slate-200 rounded-md p-3.5 shadow-2xs">
          <div className="flex items-center justify-between text-slate-500 text-2xs font-semibold uppercase tracking-wider mb-1">
            <span>Agencies</span>
            <Building2 className="w-4 h-4 text-slate-400" />
          </div>
          <div className="text-2xl font-bold text-slate-900">{totalAgencies}</div>
          <Link to="/agencies" className="text-2xs text-teal-700 hover:underline mt-1 inline-block">
            View directory →
          </Link>
        </div>

        <div className="bg-white border border-slate-200 rounded-md p-3.5 shadow-2xs">
          <div className="flex items-center justify-between text-slate-500 text-2xs font-semibold uppercase tracking-wider mb-1">
            <span>Opportunities</span>
            <Briefcase className="w-4 h-4 text-slate-400" />
          </div>
          <div className="text-2xl font-bold text-slate-900">{totalOpportunities}</div>
          <Link to="/opportunities" className="text-2xs text-teal-700 hover:underline mt-1 inline-block">
            Compare all →
          </Link>
        </div>

        <div className="bg-white border border-slate-200 rounded-md p-3.5 shadow-2xs">
          <div className="flex items-center justify-between text-slate-500 text-2xs font-semibold uppercase tracking-wider mb-1">
            <span>Countries</span>
            <Globe2 className="w-4 h-4 text-slate-400" />
          </div>
          <div className="text-2xl font-bold text-slate-900">{distinctCountries}</div>
          <Link to="/countries" className="text-2xs text-teal-700 hover:underline mt-1 inline-block">
            Country stats →
          </Link>
        </div>

        <div className="bg-white border border-slate-200 rounded-md p-3.5 shadow-2xs">
          <div className="flex items-center justify-between text-slate-500 text-2xs font-semibold uppercase tracking-wider mb-1">
            <span>Needs Verification</span>
            <ShieldCheck className="w-4 h-4 text-blue-600" />
          </div>
          <div className="text-2xl font-bold text-blue-900">{pendingVerifications}</div>
          <Link to="/verification" className="text-2xs text-blue-700 hover:underline mt-1 inline-block">
            Checklist →
          </Link>
        </div>

        <div className="bg-white border border-slate-200 rounded-md p-3.5 shadow-2xs">
          <div className="flex items-center justify-between text-slate-500 text-2xs font-semibold uppercase tracking-wider mb-1">
            <span>Follow-ups Due</span>
            <CalendarCheck2 className="w-4 h-4 text-amber-600" />
          </div>
          <div className="text-2xl font-bold text-amber-900">{pendingFollowUps}</div>
          <Link to="/follow-ups" className="text-2xs text-amber-700 hover:underline mt-1 inline-block">
            Actions →
          </Link>
        </div>

        <div className="bg-white border border-slate-200 rounded-md p-3.5 shadow-2xs">
          <div className="flex items-center justify-between text-slate-500 text-2xs font-semibold uppercase tracking-wider mb-1">
            <span>Full Cost Data</span>
            <Receipt className="w-4 h-4 text-teal-600" />
          </div>
          <div className="text-2xl font-bold text-slate-900">{completeCostOpps}</div>
          <span className="text-2xs text-slate-400 mt-1 inline-block">
            of {totalOpportunities} opportunities
          </span>
        </div>
      </div>

      {/* Recent Opportunities Section */}
      <div className="bg-white border border-slate-200 rounded-md overflow-hidden shadow-2xs">
        <div className="p-3.5 border-b border-slate-200 flex items-center justify-between bg-slate-50/70">
          <div>
            <h2 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
              Recent Opportunities Recorded
            </h2>
            <p className="text-2xs text-slate-500">
              Latest field notes from manpower visits
            </p>
          </div>
          <Link
            to="/opportunities"
            className="text-xs font-medium text-teal-700 hover:text-teal-800 flex items-center gap-1"
          >
            <span>View Full Comparison</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {recentOpps.length === 0 ? (
          <div className="p-8 text-center">
            <p className="text-sm text-slate-500 mb-3">No opportunities recorded yet.</p>
            <Link
              to="/new-visit"
              className="inline-flex items-center space-x-1.5 px-3 py-1.5 bg-teal-700 text-white rounded text-xs font-medium"
            >
              <PlusCircle className="w-3.5 h-3.5" />
              <span>Record First Visit</span>
            </Link>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 uppercase text-2xs font-semibold">
                <tr>
                  <th className="py-2.5 px-3">Country</th>
                  <th className="py-2.5 px-3">Job Title & Sector</th>
                  <th className="py-2.5 px-3">Agency</th>
                  <th className="py-2.5 px-3">Employer</th>
                  <th className="py-2.5 px-3">Net Salary</th>
                  <th className="py-2.5 px-3">Quoted Cost</th>
                  <th className="py-2.5 px-3">Permit Status</th>
                  <th className="py-2.5 px-3">Evidence</th>
                  <th className="py-2.5 px-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {recentOpps.map(opp => (
                  <tr
                    key={opp.id}
                    className="hover:bg-slate-50/80 transition cursor-pointer"
                    onClick={() => navigate(`/opportunities/${opp.id}`)}
                  >
                    <td className="py-3 px-3 font-semibold text-slate-900 whitespace-nowrap">
                      {opp.country}
                    </td>
                    <td className="py-3 px-3">
                      <div className="font-medium text-slate-900">{opp.job_title}</div>
                      {opp.job_sector && (
                        <div className="text-2xs text-slate-500">{opp.job_sector}</div>
                      )}
                    </td>
                    <td className="py-3 px-3 text-slate-700">
                      {opp.agency?.name || '—'}
                    </td>
                    <td className="py-3 px-3 text-slate-600">
                      {opp.employer_name || (
                        <span className="text-slate-400 italic">Not Disclosed</span>
                      )}
                    </td>
                    <td className="py-3 px-3 font-medium text-slate-800 whitespace-nowrap">
                      {opp.expected_net_salary ? (
                        <span>
                          {opp.expected_net_salary.toLocaleString()} {opp.net_salary_currency}
                        </span>
                      ) : opp.advertised_salary ? (
                        <span>
                          {opp.advertised_salary.toLocaleString()} {opp.salary_currency} ({opp.salary_type || 'Gross'})
                        </span>
                      ) : (
                        '—'
                      )}
                    </td>
                    <td className="py-3 px-3 whitespace-nowrap">
                      {opp.costs?.total_quoted_cost ? (
                        <div>
                          <span className="font-bold text-slate-900">
                            NPR {opp.costs.total_quoted_cost.toLocaleString()}
                          </span>
                          {opp.costs.written_cost && (
                            <span className="text-2xs text-emerald-700 ml-1 font-mono">
                              [Written]
                            </span>
                          )}
                        </div>
                      ) : (
                        '—'
                      )}
                    </td>
                    <td className="py-3 px-3 whitespace-nowrap">
                      <Badge status={opp.work_permit_status} size="sm">
                        {opp.work_permit_status || 'Unknown'}
                      </Badge>
                    </td>
                    <td className="py-3 px-3 whitespace-nowrap">
                      <Badge status={opp.evidence_status} size="sm">
                        {opp.evidence_status || 'Needs Verification'}
                      </Badge>
                    </td>
                    <td className="py-3 px-3 text-right whitespace-nowrap" onClick={e => e.stopPropagation()}>
                      <Link
                        to={`/opportunities/${opp.id}`}
                        className="text-xs font-semibold text-teal-700 hover:text-teal-900 hover:underline"
                      >
                        Details →
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Field Research Tips / Guidelines Notice */}
      <div className="bg-slate-50 border border-slate-300 rounded-md p-4 text-xs text-slate-700 space-y-2">
        <h3 className="font-bold text-slate-900 uppercase tracking-wider text-2xs">
          Field Protocol When Visiting Agencies in Nepal:
        </h3>
        <ul className="list-disc pl-4 space-y-1 text-slate-600">
          <li>Always note down whether the demand letter has DoFE approval and lot number.</li>
          <li>Ask if the quoted salary is Gross or Net (after tax & accommodation deductions).</li>
          <li>Request a written cost breakdown and inquire which stages are refundable if the visa is not granted.</li>
          <li>Never leave original passport documents during initial inquiry visits.</li>
        </ul>
      </div>
    </div>
  );
};
