import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Search, Database, User, LogOut, Wifi, WifiOff } from 'lucide-react';
import { Link } from 'react-router-dom';

interface HeaderProps {
  onOpenSearch: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onOpenSearch }) => {
  const { user, isSupabaseConnected, logout } = useAuth();
  const [isOnline, setIsOnline] = useState(typeof navigator !== 'undefined' ? navigator.onLine : true);

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  return (
    <header className="sticky top-0 z-30 bg-white border-b border-slate-200 h-14 flex items-center justify-between px-4 sm:px-6">
      {/* Mobile Title (visible on mobile only) */}
      <div className="flex items-center space-x-2 md:hidden">
        <div className="w-6 h-6 rounded bg-teal-700 flex items-center justify-center text-white font-bold text-xs">
          NP
        </div>
        <span className="font-bold text-slate-900 text-sm tracking-tight truncate">
          Manpower Research
        </span>
      </div>

      {/* Desktop Search trigger */}
      <div className="hidden md:flex items-center space-x-3">
        <button
          id="open-global-search-btn"
          onClick={onOpenSearch}
          className="flex items-center space-x-2 text-xs text-slate-500 bg-slate-50 hover:bg-slate-100 border border-slate-200 px-3 py-1.5 rounded-md transition"
        >
          <Search className="w-3.5 h-3.5 text-slate-400" />
          <span>Quick search (agencies, employers, countries)...</span>
          <kbd className="text-2xs bg-white border border-slate-200 px-1 rounded text-slate-400">
            Ctrl+K
          </kbd>
        </button>
      </div>

      {/* Right controls */}
      <div className="flex items-center space-x-3">
        {/* Mobile Search Button */}
        <button
          onClick={onOpenSearch}
          className="md:hidden p-1.5 rounded-md text-slate-600 hover:bg-slate-100"
          aria-label="Search"
        >
          <Search className="w-5 h-5" />
        </button>

        {/* Online / Offline Indicator */}
        <div
          title={isOnline ? 'App is Online (अनलाइन)' : 'Offline Mode Active (अफलाइन मोड - स्थानीय डेटा प्रयोग हुँदैछ)'}
          className={`flex items-center space-x-1.5 text-2xs px-2.5 py-1 rounded-full border transition ${
            isOnline
              ? 'bg-emerald-50/70 border-emerald-200 text-emerald-800'
              : 'bg-amber-50 border-amber-300 text-amber-900 font-bold animate-pulse'
          }`}
        >
          {isOnline ? (
            <Wifi className="w-3 h-3 text-emerald-600" />
          ) : (
            <WifiOff className="w-3 h-3 text-amber-700" />
          )}
          <span className="hidden sm:inline">
            {isOnline ? 'Online' : 'Offline Mode'}
          </span>
          <span
            className={`w-1.5 h-1.5 rounded-full ${
              isOnline ? 'bg-emerald-500' : 'bg-amber-600'
            }`}
          />
        </div>

        {/* Database Status Indicator */}
        <Link
          to="/settings"
          title="Database Configuration"
          className="flex items-center space-x-1.5 text-2xs px-2.5 py-1 rounded-full border border-slate-200 bg-slate-50 text-slate-600 hover:border-slate-300 transition"
        >
          <Database className={`w-3 h-3 ${isSupabaseConnected ? 'text-emerald-600' : 'text-teal-600'}`} />
          <span className="hidden sm:inline">
            {isSupabaseConnected ? 'Supabase' : 'File: data/db.json'}
          </span>
          <span className={`w-1.5 h-1.5 rounded-full ${isSupabaseConnected ? 'bg-emerald-500' : 'bg-slate-400'}`} />
        </Link>

        {/* User Session Info */}
        {user && (
          <div className="flex items-center space-x-2 text-xs text-slate-700">
            <div className="w-7 h-7 rounded-full bg-slate-100 border border-slate-300 flex items-center justify-center text-slate-700 font-semibold text-xs">
              {user.name.slice(0, 1).toUpperCase()}
            </div>
            <span className="hidden lg:inline text-xs font-medium text-slate-800">
              {user.name}
            </span>
            <button
              onClick={() => logout()}
              title="Logout"
              className="text-slate-400 hover:text-slate-700 p-1 transition"
            >
              <LogOut className="w-3.5 h-3.5" />
            </button>
          </div>
        )}
      </div>
    </header>
  );
};
