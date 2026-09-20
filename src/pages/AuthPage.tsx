import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Lock, Mail, ArrowRight, ShieldCheck, CheckCircle2, AlertCircle } from 'lucide-react';

export const AuthPage: React.FC = () => {
  const [mode, setMode] = useState<'login' | 'signup' | 'forgot'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [message, setMessage] = useState<{ type: 'error' | 'success'; text: string } | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const { login, signup, resetPassword, isSupabaseConnected } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);
    setSubmitting(true);

    try {
      if (mode === 'login') {
        const res = await login(email, password);
        if (res.success) {
          navigate('/');
        } else {
          setMessage({ type: 'error', text: res.error || 'Login failed' });
        }
      } else if (mode === 'signup') {
        const res = await signup(email, password, name);
        if (res.success) {
          navigate('/');
        } else {
          setMessage({ type: 'error', text: res.error || 'Sign up failed' });
        }
      } else if (mode === 'forgot') {
        const res = await resetPassword(email);
        if (res.success) {
          setMessage({
            type: 'success',
            text: 'Password reset email sent (or instructions displayed). You can now log in.'
          });
        } else {
          setMessage({ type: 'error', text: res.error || 'Reset request failed' });
        }
      }
    } catch (err: any) {
      setMessage({ type: 'error', text: err.message || 'An error occurred' });
    } finally {
      setSubmitting(false);
    }
  };

  const handleQuickLocalEntry = async () => {
    await login('researcher@nepal-manpower.local', 'password');
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4 sm:p-6">
      <div className="max-w-md w-full bg-white rounded-lg shadow-2xl border border-slate-800 p-6 sm:p-8 space-y-6 animate-in fade-in zoom-in-95 duration-200">
        {/* Brand Header */}
        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-lg bg-teal-700 text-white font-bold text-xl flex items-center justify-center mx-auto shadow-sm">
            NP
          </div>
          <h1 className="text-lg font-bold text-slate-900 tracking-tight">
            Foreign Employment Research
          </h1>
          <p className="text-xs text-slate-500">
            Private field research notebook & agency comparison tool
          </p>
        </div>

        {/* Supabase / Local Badge */}
        <div className="flex items-center justify-center">
          <span className="text-2xs font-medium px-2.5 py-1 bg-slate-100 border border-slate-200 text-slate-600 rounded-full flex items-center gap-1.5">
            <span
              className={`w-1.5 h-1.5 rounded-full ${
                isSupabaseConnected ? 'bg-emerald-500' : 'bg-slate-400'
              }`}
            />
            <span>{isSupabaseConnected ? 'Supabase PostgreSQL Cloud' : 'Local Research Storage'}</span>
          </span>
        </div>

        {/* Message Alert */}
        {message && (
          <div
            className={`p-3 rounded text-xs flex items-center space-x-2 border ${
              message.type === 'success'
                ? 'bg-emerald-50 text-emerald-900 border-emerald-300'
                : 'bg-red-50 text-red-900 border-red-300'
            }`}
          >
            {message.type === 'success' ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
            ) : (
              <AlertCircle className="w-4 h-4 text-red-600 flex-shrink-0" />
            )}
            <span>{message.text}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          {mode === 'signup' && (
            <div>
              <label className="block font-medium text-slate-700 mb-1">Your Full Name</label>
              <input
                type="text"
                required
                placeholder="e.g. Ramesh Karki"
                className="w-full bg-white border border-slate-300 rounded px-3 py-2 text-xs text-slate-900 focus:outline-none focus:ring-1 focus:ring-teal-600"
                value={name}
                onChange={e => setName(e.target.value)}
              />
            </div>
          )}

          <div>
            <label className="block font-medium text-slate-700 mb-1">Email Address</label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="email"
                required
                placeholder="name@example.com"
                className="w-full bg-white border border-slate-300 rounded pl-9 pr-3 py-2 text-xs text-slate-900 focus:outline-none focus:ring-1 focus:ring-teal-600"
                value={email}
                onChange={e => setEmail(e.target.value)}
              />
            </div>
          </div>

          {mode !== 'forgot' && (
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="font-medium text-slate-700">Password</label>
                {mode === 'login' && (
                  <button
                    type="button"
                    onClick={() => {
                      setMode('forgot');
                      setMessage(null);
                    }}
                    className="text-2xs text-teal-700 hover:underline"
                  >
                    Forgot password?
                  </button>
                )}
              </div>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="password"
                  required
                  placeholder="••••••••"
                  className="w-full bg-white border border-slate-300 rounded pl-9 pr-3 py-2 text-xs text-slate-900 focus:outline-none focus:ring-1 focus:ring-teal-600"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                />
              </div>
            </div>
          )}

          <button
            type="submit"
            disabled={submitting}
            className="w-full py-2.5 bg-teal-700 hover:bg-teal-600 text-white font-semibold rounded text-xs shadow-xs transition flex items-center justify-center space-x-1.5"
          >
            <span>
              {submitting
                ? 'Processing...'
                : mode === 'login'
                ? 'Sign In to Private Notebook'
                : mode === 'signup'
                ? 'Create Research Account'
                : 'Send Password Reset'}
            </span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </form>

        {/* Quick Instant Entry for Pair Programming / Review */}
        <div className="pt-2 border-t border-slate-100">
          <button
            type="button"
            onClick={handleQuickLocalEntry}
            className="w-full py-2 bg-slate-100 hover:bg-slate-200 border border-slate-300 text-slate-700 rounded text-xs font-medium transition"
          >
            Instant Direct Entry (Field Researcher Mode)
          </button>
        </div>

        {/* Toggle between login / signup */}
        <div className="text-center text-xs text-slate-500">
          {mode === 'login' ? (
            <p>
              New researcher?{' '}
              <button
                type="button"
                onClick={() => {
                  setMode('signup');
                  setMessage(null);
                }}
                className="font-semibold text-teal-700 hover:underline"
              >
                Create an account
              </button>
            </p>
          ) : (
            <p>
              Already have an account?{' '}
              <button
                type="button"
                onClick={() => {
                  setMode('login');
                  setMessage(null);
                }}
                className="font-semibold text-teal-700 hover:underline"
              >
                Sign In
              </button>
            </p>
          )}
        </div>
      </div>
    </div>
  );
};
