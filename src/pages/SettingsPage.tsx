import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useData } from '../context/DataContext';
import {
  testSupabaseConnection,
  getSupabaseCredentials,
  resetSupabaseClient,
  checkSupabaseHealth,
  SupabaseStatus
} from '../lib/supabase';
import schemaSql from '../../supabase/schema.sql?raw';
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
  LogOut,
  Copy,
  Check,
  ExternalLink,
  RefreshCw,
  Code2,
  ChevronDown,
  ChevronUp,
  UploadCloud
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
    syncToSupabase,
    showToast
  } = useData();

  const creds = getSupabaseCredentials();
  const [supabaseUrl, setSupabaseUrl] = useState(creds.url);
  const [supabaseAnonKey, setSupabaseAnonKey] = useState(creds.anonKey);
  const [testResult, setTestResult] = useState<{ success: boolean; message: string } | null>(null);
  const [testing, setTesting] = useState(false);
  const [healthStatus, setHealthStatus] = useState<{ status: SupabaseStatus; message: string; agencyCount?: number } | null>(null);
  const [copiedSchema, setCopiedSchema] = useState(false);
  const [showSqlViewer, setShowSqlViewer] = useState(false);
  const [syncingToDb, setSyncingToDb] = useState(false);

  // Check health on initial load if credentials exist
  useEffect(() => {
    if (creds.url && creds.anonKey) {
      checkSupabaseHealth().then(setHealthStatus);
    }
  }, [creds.url, creds.anonKey]);

  const handleTestConnection = async () => {
    if (!supabaseUrl.trim() || !supabaseAnonKey.trim()) {
      setTestResult({ success: false, message: 'Please enter both Supabase URL and Anon Key.' });
      return;
    }
    setTesting(true);
    const res = await testSupabaseConnection(supabaseUrl.trim(), supabaseAnonKey.trim());
    setTestResult(res);
    const health = await checkSupabaseHealth();
    setHealthStatus(health);
    setTesting(false);
  };

  const handleCopySchema = async () => {
    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(schemaSql);
      } else {
        const textArea = document.createElement('textarea');
        textArea.value = schemaSql;
        document.body.appendChild(textArea);
        textArea.select();
        document.execCommand('copy');
        document.body.removeChild(textArea);
      }
      setCopiedSchema(true);
      showToast('schema.sql copied to clipboard! Paste and run it in Supabase SQL Editor.', 'success');
      setTimeout(() => setCopiedSchema(false), 3000);
    } catch {
      showToast('Failed to copy to clipboard. You can view and copy the code below.', 'error');
    }
  };

  const handleSyncToSupabase = async () => {
    setSyncingToDb(true);
    const res = await syncToSupabase();
    setSyncingToDb(false);
    if (res.success) {
      const health = await checkSupabaseHealth();
      setHealthStatus(health);
    }
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
              healthStatus?.status === 'ready'
                ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                : healthStatus?.status === 'missing_schema' || healthStatus?.status === 'rls_error'
                ? 'bg-amber-50 text-amber-900 border-amber-300'
                : isSupabaseConnected
                ? 'bg-teal-50 text-teal-800 border-teal-300'
                : 'bg-slate-100 text-slate-700 border-slate-300'
            }`}
          >
            {healthStatus?.status === 'ready'
              ? 'PostgreSQL Active & Ready'
              : healthStatus?.status === 'missing_schema'
              ? 'Tables Missing in Supabase'
              : healthStatus?.status === 'rls_error'
              ? 'RLS Permission Blocked'
              : isSupabaseConnected
              ? 'Credentials Connected'
              : 'Local Storage Engine Active'}
          </span>
        </div>

        {/* Database Health & Schema Notification Banner */}
        {healthStatus && healthStatus.status === 'missing_schema' && (
          <div className="p-3.5 bg-amber-50 border border-amber-300 rounded-md text-amber-900 space-y-2.5 text-xs">
            <div className="flex items-start gap-2">
              <AlertCircle className="w-4 h-4 text-amber-700 flex-shrink-0 mt-0.5" />
              <div>
                <strong className="font-semibold block text-amber-950">
                  Database Tables Not Initialized Yet
                </strong>
                <span>
                  Your project URL and key are connected, but the PostgreSQL database tables (
                  <code className="bg-amber-100 px-1 py-0.5 rounded font-mono text-2xs">agencies</code>,{' '}
                  <code className="bg-amber-100 px-1 py-0.5 rounded font-mono text-2xs">opportunities</code>, etc.)
                  do not exist in your Supabase project yet.
                </span>
              </div>
            </div>

            <div className="pl-6 space-y-1.5 text-slate-700 text-2xs">
              <p className="font-medium text-slate-900">How to initialize in 1 minute:</p>
              <ol className="list-decimal list-inside space-y-1">
                <li>Click <strong>Copy SQL Schema</strong> below.</li>
                <li>Click <strong>Open Supabase SQL Editor</strong> to open your project in a new tab.</li>
                <li>Paste the script into the SQL editor and click <strong>RUN</strong>.</li>
                <li>Return here and click <strong>Sync Local Records to Supabase</strong> to upload any existing data!</li>
              </ol>
            </div>

            <div className="pl-6 flex flex-wrap gap-2 pt-1">
              <button
                onClick={handleCopySchema}
                className="px-3 py-1.5 bg-amber-700 hover:bg-amber-800 text-white rounded text-2xs font-semibold flex items-center gap-1.5 shadow-xs transition"
              >
                {copiedSchema ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedSchema ? 'SQL Copied!' : 'Copy SQL Schema (schema.sql)'}</span>
              </button>

              <a
                href="https://supabase.com/dashboard"
                target="_blank"
                rel="noreferrer"
                className="px-3 py-1.5 bg-white hover:bg-amber-100 text-amber-900 border border-amber-400 rounded text-2xs font-medium flex items-center gap-1.5 transition"
              >
                <ExternalLink className="w-3.5 h-3.5 text-amber-700" />
                <span>Open Supabase SQL Editor</span>
              </a>

              <button
                onClick={() => setShowSqlViewer(!showSqlViewer)}
                className="px-2.5 py-1.5 text-slate-600 hover:text-slate-900 text-2xs font-medium flex items-center gap-1 transition"
              >
                <Code2 className="w-3.5 h-3.5" />
                <span>{showSqlViewer ? 'Hide SQL Code' : 'View SQL Code'}</span>
                {showSqlViewer ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
              </button>
            </div>
          </div>
        )}

        {healthStatus && healthStatus.status === 'ready' && (
          <div className="p-3 bg-emerald-50 border border-emerald-300 rounded-md text-emerald-900 text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div className="flex items-center space-x-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
              <span>
                <strong>PostgreSQL Database Connected & Ready:</strong> All 8 relational tables verified. New records are saving directly to Supabase.
              </span>
            </div>
            <button
              onClick={handleSyncToSupabase}
              disabled={syncingToDb}
              className="px-3 py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded text-2xs font-semibold flex items-center justify-center gap-1.5 shadow-xs transition flex-shrink-0"
            >
              <UploadCloud className="w-3.5 h-3.5" />
              <span>{syncingToDb ? 'Syncing...' : 'Sync Local Records to Supabase'}</span>
            </button>
          </div>
        )}

        {/* Collapsible SQL Script Viewer */}
        {showSqlViewer && (
          <div className="border border-slate-200 rounded bg-slate-900 text-slate-100 p-3 space-y-2">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2">
              <span className="text-2xs font-mono text-slate-400">supabase/schema.sql</span>
              <button
                onClick={handleCopySchema}
                className="px-2 py-1 bg-slate-800 hover:bg-slate-700 rounded text-2xs text-slate-200 flex items-center gap-1 transition"
              >
                {copiedSchema ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                <span>{copiedSchema ? 'Copied' : 'Copy All'}</span>
              </button>
            </div>
            <pre className="text-2xs font-mono max-h-56 overflow-y-auto whitespace-pre leading-relaxed text-slate-300">
              {schemaSql}
            </pre>
          </div>
        )}

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
              Supabase Publishable / Anon Key (VITE_SUPABASE_PUBLISHABLE_KEY or anon public)
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
              onClick={handleCopySchema}
              className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 border border-slate-300 rounded text-xs font-medium text-slate-800 transition flex items-center gap-1.5"
            >
              {copiedSchema ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5 text-slate-600" />}
              <span>{copiedSchema ? 'SQL Copied!' : 'Copy SQL Schema'}</span>
            </button>

            <button
              onClick={handleSyncToSupabase}
              disabled={syncingToDb || !isSupabaseConnected}
              className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 border border-slate-300 rounded text-xs font-medium text-slate-800 transition flex items-center gap-1.5 disabled:opacity-50"
            >
              <UploadCloud className="w-3.5 h-3.5 text-slate-600" />
              <span>{syncingToDb ? 'Syncing...' : 'Sync Local Data to Supabase'}</span>
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
