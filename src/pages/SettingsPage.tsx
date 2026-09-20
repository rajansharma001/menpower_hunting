import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useData } from '../context/DataContext';
import {
  testSupabaseConnection,
  getSupabaseCredentials,
  resetSupabaseClient
} from '../lib/supabase';
import {
  exportOpportunitiesCSV,
  exportAgenciesCSV,
  exportExcel,
  exportCompleteDatasetJSON
} from '../lib/export';
import {
  Database,
  Download,
  FileSpreadsheet,
  FileJson,
  RotateCcw,
  Trash2,
  CheckCircle2,
  AlertCircle,
  KeyRound,
  Shield,
  LogOut
} from 'lucide-react';

export const SettingsPage: React.FC = () => {
  const { user, isSupabaseConnected, logout } = useAuth();
  const {
    opportunities,
    agencies,
    followUps,
    resetDemoData,
    purgeDemoData,
    purgeAllData,
    showToast
  } = useData();

  const creds = getSupabaseCredentials();
  const [supabaseUrl, setSupabaseUrl] = useState(creds.url);
  const [supabaseAnonKey, setSupabaseAnonKey] = useState(creds.anonKey);
  const [testResult, setTestResult] = useState<{ success: boolean; message: string } | null>(null);
  const [testing, setTesting] = useState(false);

  const handleTestConnection = async () => {
    if (!supabaseUrl.trim() || !supabaseAnonKey.trim()) {
      setTestResult({ success: false, message: 'Please enter both Supabase URL and Anon Key.' });
      return;
    }
    setTesting(true);
    const res = await testSupabaseConnection(supabaseUrl.trim(), supabaseAnonKey.trim());
    setTestResult(res);
    setTesting(false);
  };

  const handleSaveCredentials = () => {
    localStorage.setItem('manpower_supabase_url', supabaseUrl.trim());
    localStorage.setItem('manpower_supabase_anon_key', supabaseAnonKey.trim());
    resetSupabaseClient();
    showToast('Supabase credentials saved. Reloading connection...', 'info');
    setTimeout(() => {
      window.location.reload();
    }, 1000);
  };

  const handleClearCredentials = () => {
    localStorage.removeItem('manpower_supabase_url');
    localStorage.removeItem('manpower_supabase_anon_key');
    resetSupabaseClient();
    setSupabaseUrl('');
    setSupabaseAnonKey('');
    showToast('Credentials cleared. Switched to local storage engine.', 'info');
    setTimeout(() => {
      window.location.reload();
    }, 1000);
  };

  const handleExportAllJSON = () => {
    exportCompleteDatasetJSON({
      agencies,
      opportunities,
      followUps,
      exportedAt: new Date().toISOString()
    });
    showToast('Complete research dataset exported as JSON.', 'success');
  };

  return (
    <div className="p-4 sm:p-6 max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="pb-3 border-b border-slate-200">
        <h1 className="text-lg font-bold text-slate-900 tracking-tight">
          Application & Database Settings
        </h1>
        <p className="text-xs text-slate-500">
          Configure Supabase PostgreSQL, export research data, and manage demo datasets
        </p>
      </div>

      {/* 1. Supabase PostgreSQL Configuration */}
      <div className="bg-white border border-slate-200 rounded-md p-4 sm:p-5 shadow-2xs space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
          <div className="flex items-center space-x-2">
            <Database className="w-4 h-4 text-teal-700" />
            <h2 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
              Supabase PostgreSQL Connection
            </h2>
          </div>
          <span
            className={`text-2xs font-semibold px-2.5 py-0.5 rounded-full border ${
              isSupabaseConnected
                ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                : 'bg-slate-100 text-slate-700 border-slate-300'
            }`}
          >
            {isSupabaseConnected ? 'Connected to Supabase' : 'Local Storage Engine Active'}
          </span>
        </div>

        <p className="text-xs text-slate-600">
          Connect your dedicated Supabase project to persist records into your own PostgreSQL database with Row Level Security (RLS). You can also run schema migrations by copying the SQL from <code className="bg-slate-100 px-1 py-0.5 rounded font-mono text-2xs">supabase/schema.sql</code>.
        </p>

        <div className="space-y-3 text-xs">
          <div>
            <label className="block font-medium text-slate-700 mb-1">
              Supabase Project URL
            </label>
            <input
              type="text"
              placeholder="https://xyzcompany.supabase.co"
              className="w-full bg-slate-50 border border-slate-300 rounded px-3 py-2 text-xs font-mono text-slate-900 focus:outline-none"
              value={supabaseUrl}
              onChange={e => setSupabaseUrl(e.target.value)}
            />
          </div>

          <div>
            <label className="block font-medium text-slate-700 mb-1">
              Supabase Anon / Public Key
            </label>
            <input
              type="password"
              placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
              className="w-full bg-slate-50 border border-slate-300 rounded px-3 py-2 text-xs font-mono text-slate-900 focus:outline-none"
              value={supabaseAnonKey}
              onChange={e => setSupabaseAnonKey(e.target.value)}
            />
          </div>

          {testResult && (
            <div
              className={`p-3 rounded text-xs flex items-center space-x-2 border ${
                testResult.success
                  ? 'bg-emerald-50 text-emerald-900 border-emerald-300'
                  : 'bg-red-50 text-red-900 border-red-300'
              }`}
            >
              {testResult.success ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
              ) : (
                <AlertCircle className="w-4 h-4 text-red-600 flex-shrink-0" />
              )}
              <span>{testResult.message}</span>
            </div>
          )}

          <div className="flex flex-wrap items-center gap-2 pt-1">
            <button
              onClick={handleTestConnection}
              disabled={testing}
              className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 border border-slate-300 rounded text-xs font-medium text-slate-800 transition"
            >
              {testing ? 'Testing...' : 'Test Connection'}
            </button>

            <button
              onClick={handleSaveCredentials}
              className="px-4 py-1.5 bg-teal-700 hover:bg-teal-600 text-white rounded text-xs font-semibold shadow-xs transition"
            >
              Save & Apply
            </button>

            {creds.url && (
              <button
                onClick={handleClearCredentials}
                className="px-3 py-1.5 text-slate-500 hover:text-red-700 text-xs font-medium transition"
              >
                Disconnect / Switch to Local
              </button>
            )}
          </div>
        </div>
      </div>

      {/* 2. Research Data Export Center */}
      <div className="bg-white border border-slate-200 rounded-md p-4 sm:p-5 shadow-2xs space-y-3">
        <div className="flex items-center space-x-2 border-b border-slate-100 pb-2.5">
          <Download className="w-4 h-4 text-teal-700" />
          <h2 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
            Export Research Dataset
          </h2>
        </div>
        <p className="text-xs text-slate-600">
          The database will never lock you in. Export all records, itemized costs, follow-ups, and verification logs at any time.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 pt-1">
          <button
            onClick={() => exportOpportunitiesCSV(opportunities)}
            className="flex items-center justify-center space-x-2 p-3 rounded border border-slate-300 hover:bg-slate-50 text-xs font-medium text-slate-800 transition"
          >
            <Download className="w-4 h-4 text-slate-500" />
            <span>Opportunities (CSV)</span>
          </button>

          <button
            onClick={() => exportAgenciesCSV(agencies)}
            className="flex items-center justify-center space-x-2 p-3 rounded border border-slate-300 hover:bg-slate-50 text-xs font-medium text-slate-800 transition"
          >
            <Download className="w-4 h-4 text-slate-500" />
            <span>Agencies (CSV)</span>
          </button>

          <button
            onClick={() => exportExcel(opportunities, agencies, followUps)}
            className="flex items-center justify-center space-x-2 p-3 rounded border border-emerald-300 bg-emerald-50/50 hover:bg-emerald-50 text-xs font-semibold text-emerald-900 transition"
          >
            <FileSpreadsheet className="w-4 h-4 text-emerald-700" />
            <span>Complete Workbook (Excel)</span>
          </button>
        </div>

        <div className="pt-2">
          <button
            onClick={handleExportAllJSON}
            className="w-full flex items-center justify-center space-x-2 p-2.5 rounded border border-slate-300 bg-slate-50 hover:bg-slate-100 text-xs font-medium text-slate-700 transition"
          >
            <FileJson className="w-4 h-4 text-teal-700" />
            <span>Export Complete Research Dataset (Full JSON Format)</span>
          </button>
        </div>
      </div>

      {/* 3. Demo Data Management */}
      <div className="bg-white border border-slate-200 rounded-md p-4 sm:p-5 shadow-2xs space-y-3">
        <div className="flex items-center space-x-2 border-b border-slate-100 pb-2.5">
          <RotateCcw className="w-4 h-4 text-amber-700" />
          <h2 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
            Demo Data Controls
          </h2>
        </div>
        <p className="text-xs text-slate-600">
          Load or clear fictional sample records (Poland Warehouse, Croatia Bakery, Romania Construction) for previewing and testing the comparison system.
        </p>

        <div className="flex flex-wrap items-center gap-2 pt-1">
          <button
            onClick={resetDemoData}
            className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 border border-slate-300 rounded text-xs font-medium text-slate-800 transition flex items-center gap-1.5"
          >
            <RotateCcw className="w-3.5 h-3.5 text-slate-600" />
            <span>Reload Demo Data</span>
          </button>

          <button
            onClick={purgeDemoData}
            className="px-3 py-1.5 bg-amber-50 hover:bg-amber-100 border border-amber-300 rounded text-xs font-medium text-amber-900 transition flex items-center gap-1.5"
          >
            <Trash2 className="w-3.5 h-3.5 text-amber-700" />
            <span>Remove Demo Records Only</span>
          </button>

          <button
            onClick={() => {
              if (window.confirm('Clear all opportunities, agencies, and follow-ups in this account?')) {
                purgeAllData();
              }
            }}
            className="px-3 py-1.5 text-red-700 hover:bg-red-50 rounded text-xs font-medium transition"
          >
            Purge All Data
          </button>
        </div>
      </div>

      {/* 4. Authenticated Researcher Session */}
      <div className="bg-white border border-slate-200 rounded-md p-4 sm:p-5 shadow-2xs space-y-3">
        <div className="flex items-center space-x-2 border-b border-slate-100 pb-2.5">
          <Shield className="w-4 h-4 text-teal-700" />
          <h2 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
            Researcher Session
          </h2>
        </div>

        <div className="text-xs text-slate-700 space-y-1">
          <div>Logged in as: <strong className="text-slate-900">{user?.email}</strong></div>
          <div className="text-slate-500">User ID: <code className="text-2xs font-mono">{user?.id}</code></div>
        </div>

        <div className="pt-2">
          <button
            onClick={() => logout()}
            className="px-3 py-1.5 border border-slate-300 rounded text-xs font-medium text-slate-700 hover:bg-slate-50 flex items-center gap-1.5 transition"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Log Out</span>
          </button>
        </div>
      </div>
    </div>
  );
};
