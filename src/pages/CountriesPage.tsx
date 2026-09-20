import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useData } from '../context/DataContext';
import { COUNTRIES } from '../constants/countries';
import { Globe2, Briefcase, DollarSign, Hourglass, Home, ArrowRight } from 'lucide-react';

interface CountryAggregate {
  country: typeof COUNTRIES[0];
  count: number;
  minSalary: number | null;
  maxSalary: number | null;
  commonCurrency: string;
  minCost: number | null;
  maxCost: number | null;
  topSectors: string[];
  topAccom: string[];
}

export const CountriesPage: React.FC = () => {
  const { opportunities } = useData();
  const navigate = useNavigate();

  // Group opportunities by country
  const countryAggregates: CountryAggregate[] = COUNTRIES.map(country => {
    const opps = opportunities.filter(o => o.country.toLowerCase() === country.name.toLowerCase());
    if (opps.length === 0) {
      return {
        country,
        count: 0,
        minSalary: null,
        maxSalary: null,
        commonCurrency: 'EUR',
        minCost: null,
        maxCost: null,
        topSectors: [],
        topAccom: []
      };
    }

    // Salary range
    const salaries = opps
      .map(o => o.expected_net_salary || o.advertised_salary)
      .filter((s): s is number => typeof s === 'number' && s > 0);
    const minSalary = salaries.length > 0 ? Math.min(...salaries) : null;
    const maxSalary = salaries.length > 0 ? Math.max(...salaries) : null;
    const commonCurrency = opps[0]?.salary_currency || 'EUR';

    // Cost range (NPR)
    const costs = opps
      .map(o => o.costs?.total_quoted_cost)
      .filter((c): c is number => typeof c === 'number' && c > 0);
    const minCost = costs.length > 0 ? Math.min(...costs) : null;
    const maxCost = costs.length > 0 ? Math.max(...costs) : null;

    // Common sectors
    const sectorCounts: Record<string, number> = {};
    opps.forEach(o => {
      if (o.job_sector) {
        sectorCounts[o.job_sector] = (sectorCounts[o.job_sector] || 0) + 1;
      }
    });
    const topSectors = Object.entries(sectorCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3)
      .map(s => s[0]);

    // Accommodation patterns
    const accomCounts: Record<string, number> = {};
    opps.forEach(o => {
      if (o.accommodation_type) {
        accomCounts[o.accommodation_type] = (accomCounts[o.accommodation_type] || 0) + 1;
      }
    });
    const topAccom = Object.entries(accomCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 2)
      .map(a => a[0]);

    return {
      country,
      count: opps.length,
      minSalary,
      maxSalary,
      commonCurrency,
      minCost,
      maxCost,
      topSectors,
      topAccom
    };
  }).filter(c => c.count > 0); // Display countries with at least 1 recorded opportunity first

  const handleCountryClick = (countryName: string) => {
    navigate(`/opportunities?country=${encodeURIComponent(countryName)}`);
  };

  return (
    <div className="p-4 sm:p-6 max-w-7xl mx-auto space-y-5">
      {/* Header */}
      <div className="pb-3 border-b border-slate-200">
        <h1 className="text-lg font-bold text-slate-900 tracking-tight">
          Country Research Aggregates
        </h1>
        <p className="text-xs text-slate-500">
          Factual aggregates and recorded patterns across foreign employment destinations
        </p>
      </div>

      {countryAggregates.length === 0 ? (
        <div className="bg-white p-8 rounded-md border border-slate-200 text-center text-xs text-slate-500">
          No country opportunities recorded yet. Record your first agency visit to populate destination statistics.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {countryAggregates.map(item => (
            <div
              key={item.country.code}
              onClick={() => handleCountryClick(item.country.name)}
              className="bg-white border border-slate-200 hover:border-teal-600 rounded-md p-4 shadow-2xs cursor-pointer transition flex flex-col justify-between group space-y-3"
            >
              <div>
                <div className="flex items-center justify-between border-b border-slate-100 pb-2 mb-2">
                  <div className="flex items-center space-x-2">
                    <Globe2 className="w-4 h-4 text-teal-700" />
                    <h2 className="font-bold text-slate-900 text-sm group-hover:text-teal-900">
                      {item.country.name}
                    </h2>
                  </div>
                  <span className="text-2xs font-semibold px-2 py-0.5 bg-slate-100 border border-slate-200 text-slate-700 rounded-full">
                    {item.count} {item.count === 1 ? 'Opportunity' : 'Opportunities'}
                  </span>
                </div>

                <div className="space-y-2 text-xs">
                  {/* Salary Range */}
                  {item.minSalary !== null && (
                    <div className="flex items-start justify-between gap-2">
                      <span className="text-slate-500 text-2xs flex items-center gap-1">
                        <DollarSign className="w-3 h-3 text-slate-400" /> Net Salary Range:
                      </span>
                      <span className="font-semibold text-slate-800 text-right">
                        {item.minSalary === item.maxSalary
                          ? `${item.minSalary.toLocaleString()} ${item.commonCurrency}`
                          : `${item.minSalary.toLocaleString()} – ${item.maxSalary?.toLocaleString()} ${item.commonCurrency}`}
                      </span>
                    </div>
                  )}

                  {/* Quoted Cost Range */}
                  {item.minCost !== null && (
                    <div className="flex items-start justify-between gap-2">
                      <span className="text-slate-500 text-2xs flex items-center gap-1">
                        <Briefcase className="w-3 h-3 text-slate-400" /> Quoted Total Range:
                      </span>
                      <span className="font-bold text-slate-900 text-right">
                        {item.minCost === item.maxCost
                          ? `NPR ${item.minCost.toLocaleString()}`
                          : `NPR ${item.minCost.toLocaleString()} – ${item.maxCost?.toLocaleString()}`}
                      </span>
                    </div>
                  )}

                  {/* Common Sectors */}
                  {item.topSectors.length > 0 && (
                    <div className="pt-1">
                      <span className="text-slate-400 text-2xs block mb-1">Common Sectors:</span>
                      <div className="flex flex-wrap gap-1">
                        {item.topSectors.map(s => (
                          <span
                            key={s}
                            className="text-2xs px-2 py-0.5 bg-slate-50 border border-slate-200 text-slate-700 rounded"
                          >
                            {s}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Accommodation Patterns */}
                  {item.topAccom.length > 0 && (
                    <div className="pt-1">
                      <span className="text-slate-400 text-2xs block mb-1">Accommodation Patterns:</span>
                      <div className="flex flex-wrap gap-1">
                        {item.topAccom.map(a => (
                          <span
                            key={a}
                            className="text-2xs px-2 py-0.5 bg-slate-50 border border-slate-200 text-slate-700 rounded"
                          >
                            {a}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-2xs font-semibold text-teal-700 group-hover:text-teal-900">
                <span>View {item.country.name} Opportunities</span>
                <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition" />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
