import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useData } from '../../context/DataContext';
import { Search, X, Building2, Briefcase, MapPin, User, ChevronRight } from 'lucide-react';

interface GlobalSearchProps {
  isOpen: boolean;
  onClose: () => void;
}

export const GlobalSearch: React.FC<GlobalSearchProps> = ({ isOpen, onClose }) => {
  const [query, setQuery] = useState('');
  const { opportunities, agencies } = useData();
  const navigate = useNavigate();
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
    } else {
      setQuery('');
    }
  }, [isOpen]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        if (isOpen) onClose();
        else {
          // Open search modal
          const btn = document.getElementById('open-global-search-btn');
          btn?.click();
        }
      }
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const q = query.trim().toLowerCase();

  // Filter opportunities
  const matchedOpps = q
    ? opportunities.filter(o => {
        return (
          o.job_title?.toLowerCase().includes(q) ||
          o.country?.toLowerCase().includes(q) ||
          o.employer_name?.toLowerCase().includes(q) ||
          o.employer_city?.toLowerCase().includes(q) ||
          o.agency?.name?.toLowerCase().includes(q) ||
          o.agency?.contact_person?.toLowerCase().includes(q) ||
          o.general_notes?.toLowerCase().includes(q)
        );
      }).slice(0, 8)
    : [];

  // Filter agencies
  const matchedAgencies = q
    ? agencies.filter(a => {
        return (
          a.name.toLowerCase().includes(q) ||
          a.location?.toLowerCase().includes(q) ||
          a.contact_person?.toLowerCase().includes(q) ||
          a.license_number?.toLowerCase().includes(q) ||
          a.notes?.toLowerCase().includes(q)
        );
      }).slice(0, 5)
    : [];

  const handleSelectOpportunity = (id: string) => {
    onClose();
    navigate(`/opportunities/${id}`);
  };

  const handleSelectAgency = (id: string) => {
    onClose();
    navigate(`/agencies/${id}`);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-start justify-center p-4 pt-16 sm:pt-24">
      <div className="bg-white border border-slate-300 rounded-lg shadow-xl w-full max-w-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        <div className="p-3 border-b border-slate-200 flex items-center gap-2 bg-slate-50">
          <Search className="w-5 h-5 text-slate-400 flex-shrink-0" />
          <input
            ref={inputRef}
            type="text"
            className="w-full bg-transparent border-none text-slate-900 placeholder-slate-400 focus:outline-none text-base"
            placeholder="Search agencies, employers, jobs, countries, notes... (ESC to close)"
            value={query}
            onChange={e => setQuery(e.target.value)}
          />
          {query && (
            <button
              onClick={() => setQuery('')}
              className="text-slate-400 hover:text-slate-600 p-1 rounded"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        <div className="max-h-96 overflow-y-auto p-2 divide-y divide-slate-100">
          {!query && (
            <div className="py-8 text-center text-slate-500 text-sm">
              Type to search opportunities, agencies, employers, and contact persons.
            </div>
          )}

          {query && matchedOpps.length === 0 && matchedAgencies.length === 0 && (
            <div className="py-8 text-center text-slate-500 text-sm">
              No results found for &ldquo;<span className="font-semibold text-slate-700">{query}</span>&rdquo;
            </div>
          )}

          {matchedOpps.length > 0 && (
            <div className="py-2">
              <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider px-3 mb-1">
                Opportunities ({matchedOpps.length})
              </div>
              {matchedOpps.map(opp => (
                <button
                  key={opp.id}
                  onClick={() => handleSelectOpportunity(opp.id)}
                  className="w-full text-left px-3 py-2 rounded-md hover:bg-slate-100 flex items-center justify-between group transition text-sm"
                >
                  <div className="flex items-center space-x-3 overflow-hidden">
                    <Briefcase className="w-4 h-4 text-slate-400 flex-shrink-0 group-hover:text-teal-700" />
                    <div className="truncate">
                      <div className="font-medium text-slate-900 group-hover:text-teal-900">
                        {opp.job_title}
                      </div>
                      <div className="text-xs text-slate-500 flex items-center gap-2">
                        <span className="font-medium text-slate-700">{opp.country}</span>
                        <span>•</span>
                        <span>{opp.agency?.name || 'Agency'}</span>
                        {opp.employer_name && (
                          <>
                            <span>•</span>
                            <span className="text-slate-600">{opp.employer_name}</span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-slate-400 opacity-0 group-hover:opacity-100 transition" />
                </button>
              ))}
            </div>
          )}

          {matchedAgencies.length > 0 && (
            <div className="py-2">
              <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider px-3 mb-1">
                Agencies ({matchedAgencies.length})
              </div>
              {matchedAgencies.map(agency => (
                <button
                  key={agency.id}
                  onClick={() => handleSelectAgency(agency.id)}
                  className="w-full text-left px-3 py-2 rounded-md hover:bg-slate-100 flex items-center justify-between group transition text-sm"
                >
                  <div className="flex items-center space-x-3 overflow-hidden">
                    <Building2 className="w-4 h-4 text-slate-400 flex-shrink-0 group-hover:text-teal-700" />
                    <div className="truncate">
                      <div className="font-medium text-slate-900 group-hover:text-teal-900">
                        {agency.name}
                      </div>
                      <div className="text-xs text-slate-500 flex items-center gap-2">
                        {agency.location && (
                          <span className="flex items-center gap-1">
                            <MapPin className="w-3 h-3" /> {agency.location}
                          </span>
                        )}
                        {agency.contact_person && (
                          <span className="flex items-center gap-1">
                            <User className="w-3 h-3" /> {agency.contact_person}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-slate-400 opacity-0 group-hover:opacity-100 transition" />
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="p-2 border-t border-slate-200 bg-slate-50 text-right text-xs text-slate-500">
          Press <kbd className="px-1.5 py-0.5 border border-slate-300 rounded bg-white font-mono text-2xs">ESC</kbd> to exit
        </div>
      </div>
    </div>
  );
};
