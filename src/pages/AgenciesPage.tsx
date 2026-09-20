import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useData } from '../context/DataContext';
import { Agency } from '../types/database';
import { exportAgenciesCSV } from '../lib/export';
import {
  Building2,
  MapPin,
  Phone,
  User,
  Plus,
  Download,
  Briefcase,
  Globe2,
  Calendar,
  ExternalLink,
  Search,
  X
} from 'lucide-react';

export const AgenciesPage: React.FC = () => {
  const { agencies, opportunities, visits, addAgency, editAgency } = useData();
  const [searchTerm, setSearchTerm] = useState('');

  // Selected agency modal for detail view
  const [selectedAgency, setSelectedAgency] = useState<Agency | null>(null);

  // Add Agency modal
  const [showAddModal, setShowAddModal] = useState(false);
  const [name, setName] = useState('');
  const [location, setLocation] = useState('');
  const [phone, setPhone] = useState('');
  const [contactPerson, setContactPerson] = useState('');
  const [licenseNumber, setLicenseNumber] = useState('');
  const [website, setWebsite] = useState('');
  const [notes, setNotes] = useState('');

  const filteredAgencies = agencies.filter(a => {
    const q = searchTerm.toLowerCase();
    return (
      a.name.toLowerCase().includes(q) ||
      a.location?.toLowerCase().includes(q) ||
      a.contact_person?.toLowerCase().includes(q) ||
      a.license_number?.toLowerCase().includes(q)
    );
  });

  const handleCreateAgency = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    await addAgency({
      user_id: '',
      name: name.trim(),
      location: location.trim(),
      phone: phone.trim(),
      contact_person: contactPerson.trim(),
      license_number: licenseNumber.trim(),
      website: website.trim(),
      notes: notes.trim()
    });
    setName('');
    setLocation('');
    setPhone('');
    setContactPerson('');
    setLicenseNumber('');
    setWebsite('');
    setNotes('');
    setShowAddModal(false);
  };

  return (
    <div className="p-4 sm:p-6 max-w-7xl mx-auto space-y-4">
      {/* Header & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-200">
        <div>
          <h1 className="text-lg font-bold text-slate-900 tracking-tight">
            Manpower Agencies Directory
          </h1>
          <p className="text-xs text-slate-500">
            Factual repository of visited recruitment agencies in Nepal
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={() => exportAgenciesCSV(filteredAgencies)}
            className="flex items-center space-x-1 px-3 py-1.5 bg-white border border-slate-300 rounded text-xs font-medium text-slate-700 hover:bg-slate-50 shadow-2xs transition"
          >
            <Download className="w-3.5 h-3.5 text-slate-500" />
            <span>Export CSV</span>
          </button>
          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center space-x-1.5 px-3 py-1.5 bg-teal-700 hover:bg-teal-600 text-white rounded text-xs font-semibold shadow-xs transition"
          >
            <Plus className="w-4 h-4" />
            <span>Add Agency</span>
          </button>
        </div>
      </div>

      {/* Search Input */}
      <div className="bg-white border border-slate-200 rounded-md p-3 shadow-2xs flex items-center gap-2">
        <Search className="w-4 h-4 text-slate-400" />
        <input
          type="text"
          placeholder="Filter agencies by name, location, license, contact..."
          className="w-full bg-transparent border-none text-xs text-slate-900 focus:outline-none"
          value={searchTerm}
          onChange={e => setSearchTerm(e.target.value)}
        />
        {searchTerm && (
          <button onClick={() => setSearchTerm('')} className="text-slate-400 hover:text-slate-600">
            <X className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      {/* Agencies Table (Desktop) / Cards (Mobile) */}
      <div className="bg-white border border-slate-200 rounded-md overflow-hidden shadow-2xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead className="bg-slate-50 border-b border-slate-300 text-slate-700 uppercase text-2xs font-semibold tracking-wider">
              <tr>
                <th className="py-2.5 px-3.5">Agency Name</th>
                <th className="py-2.5 px-3.5">Location</th>
                <th className="py-2.5 px-3.5">License #</th>
                <th className="py-2.5 px-3.5">Contact Person</th>
                <th className="py-2.5 px-3.5 text-center">Opportunities</th>
                <th className="py-2.5 px-3.5 text-center">Countries</th>
                <th className="py-2.5 px-3.5 text-center">Pending Verif.</th>
                <th className="py-2.5 px-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredAgencies.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-8 text-center text-slate-500">
                    No agencies match your search.
                  </td>
                </tr>
              ) : (
                filteredAgencies.map(agency => {
                  const agencyOpps = opportunities.filter(o => o.agency_id === agency.id);
                  const distinctCountryCount = new Set(agencyOpps.map(o => o.country)).size;
                  const unverifiedCount = agencyOpps.reduce((acc, o) => {
                    return acc + (o.verification_items || []).filter(v => v.status === 'Needs Verification').length;
                  }, 0);

                  return (
                    <tr
                      key={agency.id}
                      className="hover:bg-slate-50/80 transition cursor-pointer"
                      onClick={() => setSelectedAgency(agency)}
                    >
                      <td className="py-3 px-3.5 font-bold text-slate-900">
                        {agency.name}
                        {agency.website && (
                          <a
                            href={agency.website}
                            target="_blank"
                            rel="noopener noreferrer"
                            onClick={e => e.stopPropagation()}
                            className="inline-block ml-1.5 text-teal-700 hover:text-teal-900"
                          >
                            <ExternalLink className="w-3 h-3 inline" />
                          </a>
                        )}
                      </td>
                      <td className="py-3 px-3.5 text-slate-600">
                        {agency.location || '—'}
                      </td>
                      <td className="py-3 px-3.5 font-mono text-2xs text-slate-700">
                        {agency.license_number || '—'}
                      </td>
                      <td className="py-3 px-3.5 text-slate-600">
                        {agency.contact_person ? (
                          <div>
                            <div>{agency.contact_person}</div>
                            {agency.phone && <div className="text-2xs text-slate-400">{agency.phone}</div>}
                          </div>
                        ) : (
                          '—'
                        )}
                      </td>
                      <td className="py-3 px-3.5 text-center font-semibold text-slate-800">
                        {agencyOpps.length}
                      </td>
                      <td className="py-3 px-3.5 text-center font-semibold text-teal-800">
                        {distinctCountryCount}
                      </td>
                      <td className="py-3 px-3.5 text-center">
                        {unverifiedCount > 0 ? (
                          <span className="font-semibold text-blue-800 bg-blue-50 border border-blue-200 px-2 py-0.5 rounded text-2xs">
                            {unverifiedCount}
                          </span>
                        ) : (
                          <span className="text-slate-400 text-2xs">—</span>
                        )}
                      </td>
                      <td className="py-3 px-3.5 text-right whitespace-nowrap" onClick={e => e.stopPropagation()}>
                        <button
                          onClick={() => setSelectedAgency(agency)}
                          className="text-xs font-semibold text-teal-700 hover:underline"
                        >
                          Details →
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Selected Agency Detail Modal */}
      {selectedAgency && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-md border border-slate-300 max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-xl p-5 space-y-4 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-start justify-between border-b border-slate-200 pb-3">
              <div>
                <h2 className="text-base font-bold text-slate-900">{selectedAgency.name}</h2>
                <div className="text-xs text-slate-500 flex items-center gap-2 mt-0.5">
                  {selectedAgency.location && <span>{selectedAgency.location}</span>}
                  {selectedAgency.license_number && (
                    <span>• License: <strong className="font-mono">{selectedAgency.license_number}</strong></span>
                  )}
                </div>
              </div>
              <button
                onClick={() => setSelectedAgency(null)}
                className="text-slate-400 hover:text-slate-600 p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Contact Details */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 p-3 bg-slate-50 rounded border border-slate-200 text-xs">
              <div>
                <span className="text-2xs text-slate-400 block">Contact Person</span>
                <span className="font-semibold text-slate-800">{selectedAgency.contact_person || '—'}</span>
              </div>
              <div>
                <span className="text-2xs text-slate-400 block">Phone</span>
                <span className="font-semibold text-slate-800">{selectedAgency.phone || '—'}</span>
              </div>
              <div>
                <span className="text-2xs text-slate-400 block">Website</span>
                {selectedAgency.website ? (
                  <a href={selectedAgency.website} target="_blank" rel="noreferrer" className="text-teal-700 underline truncate block">
                    {selectedAgency.website}
                  </a>
                ) : (
                  '—'
                )}
              </div>
            </div>

            {/* Opportunities at this Agency */}
            <div className="space-y-2">
              <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                Opportunities Recorded at this Agency
              </h3>

              {(() => {
                const agencyOpps = opportunities.filter(o => o.agency_id === selectedAgency.id);
                if (agencyOpps.length === 0) {
                  return (
                    <p className="text-xs text-slate-500 py-3 text-center">
                      No opportunities recorded under this agency yet.
                    </p>
                  );
                }
                return (
                  <div className="divide-y divide-slate-100 border border-slate-200 rounded">
                    {agencyOpps.map(opp => (
                      <div key={opp.id} className="p-3 flex items-center justify-between text-xs hover:bg-slate-50">
                        <div>
                          <div className="font-bold text-slate-900">
                            {opp.country} — {opp.job_title}
                          </div>
                          <div className="text-2xs text-slate-500">
                            Employer: {opp.employer_name || 'Not Disclosed'} • Cost: NPR {(opp.costs?.total_quoted_cost || 0).toLocaleString()}
                          </div>
                        </div>
                        <Link
                          to={`/opportunities/${opp.id}`}
                          onClick={() => setSelectedAgency(null)}
                          className="font-semibold text-teal-700 hover:underline"
                        >
                          View →
                        </Link>
                      </div>
                    ))}
                  </div>
                );
              })()}
            </div>

            {/* Close */}
            <div className="pt-2 border-t border-slate-200 flex justify-end">
              <button
                onClick={() => setSelectedAgency(null)}
                className="px-4 py-1.5 bg-slate-800 text-white rounded text-xs font-medium"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Agency Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-md border border-slate-300 max-w-md w-full p-5 space-y-3 shadow-xl">
            <div className="flex items-center justify-between border-b border-slate-200 pb-2">
              <h3 className="text-sm font-bold text-slate-900">Add New Manpower Agency</h3>
              <button onClick={() => setShowAddModal(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateAgency} className="space-y-3 text-xs">
              <div>
                <label className="block font-medium text-slate-700 mb-1">Agency Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Kathmandu Overseas Pvt. Ltd."
                  className="w-full bg-slate-50 border border-slate-300 rounded p-2 text-xs text-slate-900"
                  value={name}
                  onChange={e => setName(e.target.value)}
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-medium text-slate-700 mb-1">Location</label>
                  <input
                    type="text"
                    placeholder="e.g. Sinamangal"
                    className="w-full bg-slate-50 border border-slate-300 rounded p-2 text-xs text-slate-900"
                    value={location}
                    onChange={e => setLocation(e.target.value)}
                  />
                </div>
                <div>
                  <label className="block font-medium text-slate-700 mb-1">License Number</label>
                  <input
                    type="text"
                    placeholder="e.g. 1020/077"
                    className="w-full bg-slate-50 border border-slate-300 rounded p-2 text-xs text-slate-900"
                    value={licenseNumber}
                    onChange={e => setLicenseNumber(e.target.value)}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-medium text-slate-700 mb-1">Contact Person</label>
                  <input
                    type="text"
                    placeholder="e.g. Bimal"
                    className="w-full bg-slate-50 border border-slate-300 rounded p-2 text-xs text-slate-900"
                    value={contactPerson}
                    onChange={e => setContactPerson(e.target.value)}
                  />
                </div>
                <div>
                  <label className="block font-medium text-slate-700 mb-1">Phone</label>
                  <input
                    type="text"
                    placeholder="e.g. +977-..."
                    className="w-full bg-slate-50 border border-slate-300 rounded p-2 text-xs text-slate-900"
                    value={phone}
                    onChange={e => setPhone(e.target.value)}
                  />
                </div>
              </div>

              <div>
                <label className="block font-medium text-slate-700 mb-1">Website</label>
                <input
                  type="url"
                  placeholder="https://..."
                  className="w-full bg-slate-50 border border-slate-300 rounded p-2 text-xs text-slate-900"
                  value={website}
                  onChange={e => setWebsite(e.target.value)}
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-3 py-1.5 border border-slate-300 rounded text-slate-700 hover:bg-slate-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-teal-700 hover:bg-teal-600 text-white rounded font-medium"
                >
                  Save Agency
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
