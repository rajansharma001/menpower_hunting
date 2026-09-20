import React, { useState, useMemo } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { useData } from '../context/DataContext';
import { Badge } from '../components/common/Badge';
import { COUNTRIES } from '../constants/countries';
import { JOB_SECTORS } from '../constants/jobSectors';
import { exportOpportunitiesCSV, exportExcel } from '../lib/export';
import {
  Filter,
  Download,
  FileSpreadsheet,
  ChevronDown,
  ChevronUp,
  RotateCcw,
  Briefcase,
  Building2,
  MapPin,
  Eye
} from 'lucide-react';

export const OpportunitiesPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const { opportunities, agencies, followUps } = useData();

  // Filters
  const [selectedCountry, setSelectedCountry] = useState(searchParams.get('country') || '');
  const [selectedSector, setSelectedSector] = useState('');
  const [selectedCurrency, setSelectedCurrency] = useState('');
  const [selectedPermit, setSelectedPermit] = useState('');
  const [selectedEvidence, setSelectedEvidence] = useState('');
  const [selectedAgency, setSelectedAgency] = useState('');
  const [selectedAccom, setSelectedAccom] = useState('');
  const [maxCost, setMaxCost] = useState('');
  const [selectedFreeVisa, setSelectedFreeVisa] = useState('');
  const [selectedHasLt, setSelectedHasLt] = useState('');

  // Mobile expanded rows state
  const [expandedMobileRowId, setExpandedMobileRowId] = useState<string | null>(null);

  // Sorting
  const [sortField, setSortField] = useState<'created_at' | 'cost' | 'net_salary'>('created_at');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');

  const filteredOpportunities = useMemo(() => {
    return opportunities.filter(o => {
      if (selectedCountry && o.country !== selectedCountry) return false;
      if (selectedSector && o.job_sector !== selectedSector) return false;
      if (selectedCurrency && o.salary_currency !== selectedCurrency) return false;
      if (selectedPermit && o.work_permit_status !== selectedPermit) return false;
      if (selectedEvidence && o.evidence_status !== selectedEvidence) return false;
      if (selectedAgency && o.agency_id !== selectedAgency) return false;
      if (selectedAccom && o.accommodation_type !== selectedAccom) return false;
      if (maxCost && o.costs && o.costs.total_quoted_cost > parseFloat(maxCost)) return false;
      if (selectedFreeVisa === 'yes' && !o.free_visa_free_ticket) return false;
      if (selectedFreeVisa === 'no' && o.free_visa_free_ticket) return false;
      if (selectedHasLt === 'has_lt' && (!o.dofe_lot_number || !o.dofe_lot_number.trim())) return false;
      if (selectedHasLt === 'missing_lt' && o.dofe_lot_number && o.dofe_lot_number.trim()) return false;
      return true;
    }).sort((a, b) => {
      if (sortField === 'cost') {
        const costA = a.costs?.total_quoted_cost || 0;
        const costB = b.costs?.total_quoted_cost || 0;
        return sortDirection === 'asc' ? costA - costB : costB - costA;
      }
      if (sortField === 'net_salary') {
        const salA = a.expected_net_salary || a.advertised_salary || 0;
        const salB = b.expected_net_salary || b.advertised_salary || 0;
        return sortDirection === 'asc' ? salA - salB : salB - salA;
      }
      return sortDirection === 'asc'
        ? new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
        : new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
    });
  }, [
    opportunities,
    selectedCountry,
    selectedSector,
    selectedCurrency,
    selectedPermit,
    selectedEvidence,
    selectedAgency,
    selectedAccom,
    maxCost,
    selectedFreeVisa,
    selectedHasLt,
    sortField,
    sortDirection
  ]);

  const handleResetFilters = () => {
    setSelectedCountry('');
    setSelectedSector('');
    setSelectedCurrency('');
    setSelectedPermit('');
    setSelectedEvidence('');
    setSelectedAgency('');
    setSelectedAccom('');
    setMaxCost('');
    setSelectedFreeVisa('');
    setSelectedHasLt('');
    setSearchParams({});
  };

  const hasActiveFilters =
    selectedCountry ||
    selectedSector ||
    selectedCurrency ||
    selectedPermit ||
    selectedEvidence ||
    selectedAgency ||
    selectedAccom ||
    maxCost ||
    selectedFreeVisa ||
    selectedHasLt;

  return (
    <div className="p-4 sm:p-6 max-w-7xl mx-auto space-y-4">
      {/* Top Header & Export Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-200">
        <div>
          <h1 className="text-lg font-bold text-slate-900 tracking-tight">
            Opportunity Comparison
          </h1>
          <p className="text-xs text-slate-500">
            Compare verified opportunities across countries, costs, permits, and agencies
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={() => exportOpportunitiesCSV(filteredOpportunities)}
            className="flex items-center space-x-1 px-3 py-1.5 bg-white border border-slate-300 rounded text-xs font-medium text-slate-700 hover:bg-slate-50 shadow-2xs transition"
          >
            <Download className="w-3.5 h-3.5 text-slate-500" />
            <span>Export CSV</span>
          </button>
          <button
            onClick={() => exportExcel(filteredOpportunities, agencies, followUps)}
            className="flex items-center space-x-1 px-3 py-1.5 bg-white border border-slate-300 rounded text-xs font-medium text-slate-700 hover:bg-slate-50 shadow-2xs transition"
          >
            <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600" />
            <span>Export Excel</span>
          </button>
        </div>
      </div>

      {/* Multi-Filter Bar */}
      <div className="bg-white border border-slate-200 rounded-md p-3.5 space-y-3 shadow-2xs">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-slate-700 flex items-center gap-1.5">
            <Filter className="w-3.5 h-3.5 text-slate-500" />
            <span>Filter Comparison Matrix</span>
          </span>
          {hasActiveFilters && (
            <button
              onClick={handleResetFilters}
              className="text-2xs text-teal-700 hover:text-teal-900 font-semibold flex items-center gap-1"
            >
              <RotateCcw className="w-3 h-3" />
              <span>Reset Filters</span>
            </button>
          )}
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-5 lg:grid-cols-10 gap-2">
          {/* Country */}
          <div>
            <label className="block text-2xs font-medium text-slate-500 mb-1">Country</label>
            <select
              value={selectedCountry}
              onChange={e => setSelectedCountry(e.target.value)}
              className="w-full bg-slate-50 border border-slate-300 rounded px-2 py-1.5 text-xs text-slate-800 focus:outline-none"
            >
              <option value="">All Countries</option>
              {COUNTRIES.map(c => (
                <option key={c.name} value={c.name}>{c.name}</option>
              ))}
            </select>
          </div>

          {/* Job Sector */}
          <div>
            <label className="block text-2xs font-medium text-slate-500 mb-1">Job Sector</label>
            <select
              value={selectedSector}
              onChange={e => setSelectedSector(e.target.value)}
              className="w-full bg-slate-50 border border-slate-300 rounded px-2 py-1.5 text-xs text-slate-800 focus:outline-none"
            >
              <option value="">All Sectors</option>
              {JOB_SECTORS.map(s => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </div>

          {/* Work Permit Status */}
          <div>
            <label className="block text-2xs font-medium text-slate-500 mb-1">Work Permit</label>
            <select
              value={selectedPermit}
              onChange={e => setSelectedPermit(e.target.value)}
              className="w-full bg-slate-50 border border-slate-300 rounded px-2 py-1.5 text-xs text-slate-800 focus:outline-none"
            >
              <option value="">All Permits</option>
              <option value="Already Issued">Already Issued</option>
              <option value="Application Lodged">Application Lodged</option>
              <option value="Employer Processing">Employer Processing</option>
              <option value="Quota Waiting / Not Started">Quota Waiting</option>
              <option value="Unknown">Unknown</option>
            </select>
          </div>

          {/* Evidence Status */}
          <div>
            <label className="block text-2xs font-medium text-slate-500 mb-1">Evidence</label>
            <select
              value={selectedEvidence}
              onChange={e => setSelectedEvidence(e.target.value)}
              className="w-full bg-slate-50 border border-slate-300 rounded px-2 py-1.5 text-xs text-slate-800 focus:outline-none"
            >
              <option value="">All Evidence</option>
              <option value="Verified">Verified</option>
              <option value="Partially Verified">Partially Verified</option>
              <option value="Needs Verification">Needs Verification</option>
              <option value="Not Provided">Not Provided</option>
            </select>
          </div>

          {/* Agency */}
          <div>
            <label className="block text-2xs font-medium text-slate-500 mb-1">Agency</label>
            <select
              value={selectedAgency}
              onChange={e => setSelectedAgency(e.target.value)}
              className="w-full bg-slate-50 border border-slate-300 rounded px-2 py-1.5 text-xs text-slate-800 focus:outline-none"
            >
              <option value="">All Agencies</option>
              {agencies.map(a => (
                <option key={a.id} value={a.id}>{a.name}</option>
              ))}
            </select>
          </div>

          {/* Accommodation */}
          <div>
            <label className="block text-2xs font-medium text-slate-500 mb-1">Accommodation</label>
            <select
              value={selectedAccom}
              onChange={e => setSelectedAccom(e.target.value)}
              className="w-full bg-slate-50 border border-slate-300 rounded px-2 py-1.5 text-xs text-slate-800 focus:outline-none"
            >
              <option value="">All Types</option>
              <option value="Free / Provided">Free / Provided</option>
              <option value="Salary Deduction">Salary Deduction</option>
              <option value="Worker Pays">Worker Pays</option>
            </select>
          </div>

          {/* Max Quoted Cost (NPR) */}
          <div>
            <label className="block text-2xs font-medium text-slate-500 mb-1">Max Cost (NPR)</label>
            <input
              type="number"
              placeholder="e.g. 600000"
              value={maxCost}
              onChange={e => setMaxCost(e.target.value)}
              className="w-full bg-slate-50 border border-slate-300 rounded px-2 py-1.5 text-xs text-slate-800 focus:outline-none"
            />
          </div>

          {/* Free Visa / Free Ticket */}
          <div>
            <label className="block text-2xs font-medium text-slate-500 mb-1">Free Visa/Ticket</label>
            <select
              value={selectedFreeVisa}
              onChange={e => setSelectedFreeVisa(e.target.value)}
              className="w-full bg-slate-50 border border-slate-300 rounded px-2 py-1.5 text-xs text-slate-800 focus:outline-none"
            >
              <option value="">All</option>
              <option value="yes">Free Visa Declared</option>
              <option value="no">Standard Quoted</option>
            </select>
          </div>

          {/* DoFE LT Number */}
          <div>
            <label className="block text-2xs font-medium text-slate-500 mb-1">DoFE Pre-Approval</label>
            <select
              value={selectedHasLt}
              onChange={e => setSelectedHasLt(e.target.value)}
              className="w-full bg-slate-50 border border-slate-300 rounded px-2 py-1.5 text-xs text-slate-800 focus:outline-none"
            >
              <option value="">All</option>
              <option value="has_lt">Has LT Number</option>
              <option value="missing_lt">Missing LT Number</option>
            </select>
          </div>

          {/* Sort */}
          <div>
            <label className="block text-2xs font-medium text-slate-500 mb-1">Sort By</label>
            <select
              value={`${sortField}-${sortDirection}`}
              onChange={e => {
                const [f, d] = e.target.value.split('-');
                setSortField(f as any);
                setSortDirection(d as any);
              }}
              className="w-full bg-slate-50 border border-slate-300 rounded px-2 py-1.5 text-xs text-slate-800 focus:outline-none font-medium"
            >
              <option value="created_at-desc">Newest First</option>
              <option value="cost-asc">Cost: Low to High</option>
              <option value="cost-desc">Cost: High to Low</option>
              <option value="net_salary-desc">Highest Net Pay</option>
            </select>
          </div>
        </div>
      </div>

      {/* Results Count Summary */}
      <div className="text-xs text-slate-500 px-1 flex items-center justify-between">
        <span>
          Showing <strong>{filteredOpportunities.length}</strong> of{' '}
          {opportunities.length} opportunities
        </span>
      </div>

      {/* 1. DESKTOP COMPARISON TABLE (hidden on mobile, visible md and up) */}
      <div className="hidden md:block bg-white border border-slate-200 rounded-md overflow-hidden shadow-2xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead className="bg-slate-100 border-b border-slate-300 text-slate-700 uppercase text-2xs font-semibold tracking-wider sticky top-0 z-10">
              <tr>
                <th className="py-2.5 px-3 border-r border-slate-200">Country</th>
                <th className="py-2.5 px-3 border-r border-slate-200">Job Title</th>
                <th className="py-2.5 px-3 border-r border-slate-200">Agency</th>
                <th className="py-2.5 px-3 border-r border-slate-200">Employer</th>
                <th className="py-2.5 px-3 border-r border-slate-200">Gross</th>
                <th className="py-2.5 px-3 border-r border-slate-200">Net Take-Home</th>
                <th className="py-2.5 px-3 border-r border-slate-200">Quoted Total Cost</th>
                <th className="py-2.5 px-3 border-r border-slate-200">Accommodation</th>
                <th className="py-2.5 px-3 border-r border-slate-200">Food</th>
                <th className="py-2.5 px-3 border-r border-slate-200">Permit</th>
                <th className="py-2.5 px-3 border-r border-slate-200">Processing</th>
                <th className="py-2.5 px-3 border-r border-slate-200">Evidence</th>
                <th className="py-2.5 px-3 text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {filteredOpportunities.length === 0 ? (
                <tr>
                  <td colSpan={13} className="py-10 text-center text-slate-500">
                    <p className="mb-2">No opportunities found {hasActiveFilters ? 'matching selected filters' : 'recorded yet'}.</p>
                    <div className="flex justify-center gap-2 pt-1">
                      {hasActiveFilters && (
                        <button
                          onClick={handleResetFilters}
                          className="px-3 py-1.5 border border-slate-300 rounded text-xs text-slate-700 hover:bg-slate-50"
                        >
                          Reset Filters
                        </button>
                      )}
                      <Link
                        to="/new-visit"
                        className="px-3 py-1.5 bg-teal-700 text-white rounded text-xs font-semibold hover:bg-teal-600"
                      >
                        + Record New Visit
                      </Link>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredOpportunities.map(opp => {
                  const itemizedSum = opp.costs
                    ? (opp.costs.agency_service_charge || 0) +
                      (opp.costs.government_processing_fee || 0) +
                      (opp.costs.medical_exam || 0) +
                      (opp.costs.insurance || 0) +
                      (opp.costs.visa_fee || 0) +
                      (opp.costs.documentation || 0) +
                      (opp.costs.translation || 0) +
                      (opp.costs.training || 0) +
                      (opp.costs.air_ticket || 0) +
                      (opp.costs.miscellaneous || 0)
                    : 0;
                  const quotedCost = opp.costs?.total_quoted_cost || 0;
                  const diff = quotedCost - itemizedSum;

                  return (
                    <tr key={opp.id} className="hover:bg-slate-50/90 transition">
                      <td className="py-2.5 px-3 font-bold text-slate-900 border-r border-slate-100 whitespace-nowrap">
                        {opp.country}
                      </td>
                      <td className="py-2.5 px-3 border-r border-slate-100">
                        <div className="font-semibold text-slate-900">{opp.job_title}</div>
                        <div className="flex flex-wrap items-center gap-1 mt-0.5">
                          {opp.job_sector && (
                            <span className="text-2xs text-slate-500">{opp.job_sector}</span>
                          )}
                          {opp.dofe_lot_number && (
                            <span className="text-2xs font-mono font-bold text-blue-900 bg-blue-50 border border-blue-200 px-1.5 py-0.5 rounded">
                              LT: {opp.dofe_lot_number}
                            </span>
                          )}
                          {opp.free_visa_free_ticket && (
                            <span className="text-2xs font-semibold text-emerald-800 bg-emerald-50 border border-emerald-200 px-1.5 py-0.5 rounded">
                              Free Visa
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="py-2.5 px-3 text-slate-700 border-r border-slate-100">
                        {opp.agency?.name || '—'}
                      </td>
                      <td className="py-2.5 px-3 text-slate-600 border-r border-slate-100">
                        {opp.employer_name || (
                          <span className="text-slate-400 italic">Not Disclosed</span>
                        )}
                      </td>
                      <td className="py-2.5 px-3 border-r border-slate-100 whitespace-nowrap">
                        {opp.advertised_salary
                          ? `${opp.advertised_salary.toLocaleString()} ${opp.salary_currency}`
                          : '—'}
                      </td>
                      <td className="py-2.5 px-3 font-semibold text-teal-800 border-r border-slate-100 whitespace-nowrap">
                        {opp.expected_net_salary
                          ? `${opp.expected_net_salary.toLocaleString()} ${opp.net_salary_currency}`
                          : '—'}
                      </td>
                      <td className="py-2.5 px-3 border-r border-slate-100 whitespace-nowrap">
                        <div className="font-bold text-slate-900">
                          NPR {quotedCost.toLocaleString()}
                        </div>
                        {diff > 0 && (
                          <div className="text-2xs text-slate-500" title="Unaccounted Difference">
                            Diff: NPR {diff.toLocaleString()}
                          </div>
                        )}
                      </td>
                      <td className="py-2.5 px-3 text-slate-700 border-r border-slate-100 whitespace-nowrap">
                        {opp.accommodation_type}
                      </td>
                      <td className="py-2.5 px-3 text-slate-700 border-r border-slate-100 whitespace-nowrap">
                        {opp.food_arrangement}
                      </td>
                      <td className="py-2.5 px-3 border-r border-slate-100 whitespace-nowrap">
                        <Badge status={opp.work_permit_status} size="sm">
                          {opp.work_permit_status || 'Unknown'}
                        </Badge>
                      </td>
                      <td className="py-2.5 px-3 text-slate-600 border-r border-slate-100 whitespace-nowrap">
                        {opp.estimated_total_processing_time || '—'}
                      </td>
                      <td className="py-2.5 px-3 border-r border-slate-100 whitespace-nowrap">
                        <Badge status={opp.evidence_status} size="sm">
                          {opp.evidence_status || 'Needs Verification'}
                        </Badge>
                      </td>
                      <td className="py-2.5 px-3 text-center whitespace-nowrap">
                        <Link
                          to={`/opportunities/${opp.id}`}
                          className="inline-flex items-center space-x-1 px-2.5 py-1 bg-slate-100 hover:bg-slate-200 border border-slate-300 rounded text-xs font-semibold text-slate-800 transition"
                        >
                          <Eye className="w-3 h-3" />
                          <span>View</span>
                        </Link>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* 2. MOBILE EXPANDABLE CARDS (visible on mobile only) */}
      <div className="md:hidden space-y-2.5">
        {filteredOpportunities.length === 0 ? (
          <div className="bg-white p-6 text-center text-slate-500 rounded border border-slate-200 text-xs space-y-2">
            <p>No opportunities found {hasActiveFilters ? 'matching selected filters' : 'recorded yet'}.</p>
            <div className="flex justify-center gap-2 pt-1">
              <Link
                to="/new-visit"
                className="inline-block px-3.5 py-1.5 bg-teal-700 text-white rounded font-semibold text-xs"
              >
                + Record New Visit
              </Link>
            </div>
          </div>
        ) : (
          filteredOpportunities.map(opp => {
            const isExpanded = expandedMobileRowId === opp.id;
            const quotedCost = opp.costs?.total_quoted_cost || 0;

            return (
              <div
                key={opp.id}
                className="bg-white border border-slate-200 rounded-md overflow-hidden shadow-2xs"
              >
                <div
                  onClick={() => setExpandedMobileRowId(isExpanded ? null : opp.id)}
                  className="p-3.5 flex items-start justify-between cursor-pointer active:bg-slate-50 transition"
                >
                  <div className="space-y-1 pr-2">
                    <div className="flex items-center space-x-2">
                      <span className="font-bold text-xs text-teal-800 uppercase tracking-wider">
                        {opp.country}
                      </span>
                      <span className="text-slate-300">•</span>
                      <span className="text-2xs text-slate-600 truncate max-w-[150px]">
                        {opp.agency?.name || 'Agency'}
                      </span>
                    </div>

                    <div className="font-bold text-slate-900 text-sm">
                      {opp.job_title}
                    </div>

                    <div className="flex flex-wrap items-center gap-1.5 pt-0.5">
                      <span className="text-xs font-bold text-slate-800">
                        NPR {quotedCost.toLocaleString()}
                      </span>
                      {opp.expected_net_salary && (
                        <span className="text-2xs text-slate-600">
                          (Net: {opp.expected_net_salary} {opp.net_salary_currency})
                        </span>
                      )}
                      {opp.dofe_lot_number && (
                        <span className="text-2xs font-mono font-bold text-blue-900 bg-blue-50 border border-blue-200 px-1.5 py-0.5 rounded">
                          LT: {opp.dofe_lot_number}
                        </span>
                      )}
                      {opp.free_visa_free_ticket && (
                        <span className="text-2xs font-bold text-emerald-800 bg-emerald-50 border border-emerald-200 px-1.5 py-0.5 rounded">
                          Free Visa
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="flex flex-col items-end space-y-2 flex-shrink-0">
                    <Badge status={opp.evidence_status} size="sm">
                      {opp.evidence_status}
                    </Badge>
                    {isExpanded ? (
                      <ChevronUp className="w-4 h-4 text-slate-400" />
                    ) : (
                      <ChevronDown className="w-4 h-4 text-slate-400" />
                    )}
                  </div>
                </div>

                {isExpanded && (
                  <div className="px-3.5 pb-3.5 pt-2 border-t border-slate-100 bg-slate-50/50 space-y-2.5 text-xs animate-in fade-in duration-150">
                    <div className="grid grid-cols-2 gap-2 text-2xs">
                      <div>
                        <span className="text-slate-400 block">Employer:</span>
                        <span className="font-medium text-slate-800">{opp.employer_name || 'Not Disclosed'}</span>
                      </div>
                      <div>
                        <span className="text-slate-400 block">Permit Status:</span>
                        <span className="font-medium text-slate-800">{opp.work_permit_status}</span>
                      </div>
                      <div>
                        <span className="text-slate-400 block">Accommodation:</span>
                        <span className="font-medium text-slate-800">{opp.accommodation_type}</span>
                      </div>
                      <div>
                        <span className="text-slate-400 block">Food:</span>
                        <span className="font-medium text-slate-800">{opp.food_arrangement}</span>
                      </div>
                      <div>
                        <span className="text-slate-400 block">Processing Time:</span>
                        <span className="font-medium text-slate-800">{opp.estimated_total_processing_time || '—'}</span>
                      </div>
                      <div>
                        <span className="text-slate-400 block">Overtime:</span>
                        <span className="font-medium text-slate-800">{opp.overtime_status}</span>
                      </div>
                    </div>

                    <div className="pt-2 border-t border-slate-200 flex items-center justify-between">
                      <Link
                        to={`/opportunities/${opp.id}`}
                        className="w-full text-center py-2 bg-teal-700 hover:bg-teal-600 text-white font-semibold rounded text-xs transition"
                      >
                        View Full Details & Checklist →
                      </Link>
                    </div>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
