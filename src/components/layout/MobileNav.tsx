import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import {
  Home,
  PlusCircle,
  Briefcase,
  CalendarCheck2,
  Menu,
  X,
  Building2,
  Globe2,
  ShieldCheck,
  Settings,
  Search
} from 'lucide-react';
import { useData } from '../../context/DataContext';

interface MobileNavProps {
  onOpenSearch: () => void;
}

export const MobileNav: React.FC<MobileNavProps> = ({ onOpenSearch }) => {
  const [showMoreMenu, setShowMoreMenu] = useState(false);
  const { followUps, opportunities } = useData();

  const pendingFollowUps = followUps.filter(f => f.status === 'Pending').length;

  return (
    <>
      {/* More Menu Slide-up / Modal */}
      {showMoreMenu && (
        <div
          onClick={e => {
            if (e.target === e.currentTarget) setShowMoreMenu(false);
          }}
          className="md:hidden fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex flex-col justify-end"
        >
          <div className="bg-white rounded-t-xl p-4 shadow-2xl border-t border-slate-200 animate-in slide-in-from-bottom duration-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 mb-3">
              <span className="font-bold text-sm text-slate-900">More Research Sections</span>
              <button
                type="button"
                onClick={() => setShowMoreMenu(false)}
                className="p-1.5 rounded-md text-slate-500 hover:text-slate-800 hover:bg-slate-100 touch-manipulation transition"
                title="Close menu"
                aria-label="Close menu"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-2 mb-4">
              <NavLink
                to="/agencies"
                onClick={() => setShowMoreMenu(false)}
                className="flex items-center space-x-3 p-3 rounded-lg border border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-800 text-sm font-medium touch-manipulation"
              >
                <Building2 className="w-5 h-5 text-teal-700" />
                <span>Agencies</span>
              </NavLink>

              <NavLink
                to="/countries"
                onClick={() => setShowMoreMenu(false)}
                className="flex items-center space-x-3 p-3 rounded-lg border border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-800 text-sm font-medium touch-manipulation"
              >
                <Globe2 className="w-5 h-5 text-teal-700" />
                <span>Countries</span>
              </NavLink>

              <NavLink
                to="/verification"
                onClick={() => setShowMoreMenu(false)}
                className="flex items-center space-x-3 p-3 rounded-lg border border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-800 text-sm font-medium touch-manipulation"
              >
                <ShieldCheck className="w-5 h-5 text-blue-700" />
                <span>Verification</span>
              </NavLink>

              <NavLink
                to="/settings"
                onClick={() => setShowMoreMenu(false)}
                className="flex items-center space-x-3 p-3 rounded-lg border border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-800 text-sm font-medium touch-manipulation"
              >
                <Settings className="w-5 h-5 text-slate-700" />
                <span>Settings</span>
              </NavLink>
            </div>

            <div className="space-y-2">
              <button
                type="button"
                onClick={() => {
                  setShowMoreMenu(false);
                  onOpenSearch();
                }}
                className="w-full flex items-center justify-center space-x-2 py-2.5 rounded-lg border border-slate-300 text-slate-700 text-sm font-medium hover:bg-slate-50 touch-manipulation"
              >
                <Search className="w-4 h-4 text-slate-500" />
                <span>Search Research Data</span>
              </button>

              <button
                type="button"
                onClick={() => setShowMoreMenu(false)}
                className="w-full py-2.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-sm font-semibold text-center transition touch-manipulation"
              >
                Close Menu
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Persistent Bottom Bar */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-slate-200 h-14 flex items-center justify-around px-2 shadow-xs">
        <NavLink
          to="/"
          end
          className={({ isActive }) =>
            `flex flex-col items-center justify-center w-14 h-full text-2xs transition ${
              isActive ? 'text-teal-700 font-semibold' : 'text-slate-500 hover:text-slate-800'
            }`
          }
        >
          <Home className="w-5 h-5 mb-0.5" />
          <span>Home</span>
        </NavLink>

        <NavLink
          to="/opportunities"
          className={({ isActive }) =>
            `flex flex-col items-center justify-center w-14 h-full text-2xs transition ${
              isActive ? 'text-teal-700 font-semibold' : 'text-slate-500 hover:text-slate-800'
            }`
          }
        >
          <Briefcase className="w-5 h-5 mb-0.5" />
          <span>Opps</span>
        </NavLink>

        {/* Big Prominent Center New Visit Button */}
        <NavLink
          to="/new-visit"
          className="flex flex-col items-center justify-center -mt-4"
        >
          <div className="w-12 h-12 rounded-full bg-teal-700 hover:bg-teal-800 text-white flex items-center justify-center shadow-md border-2 border-white transition active:scale-95">
            <PlusCircle className="w-6 h-6" />
          </div>
          <span className="text-2xs font-semibold text-teal-800 mt-0.5">New Visit</span>
        </NavLink>

        <NavLink
          to="/follow-ups"
          className={({ isActive }) =>
            `relative flex flex-col items-center justify-center w-14 h-full text-2xs transition ${
              isActive ? 'text-teal-700 font-semibold' : 'text-slate-500 hover:text-slate-800'
            }`
          }
        >
          <div className="relative">
            <CalendarCheck2 className="w-5 h-5 mb-0.5" />
            {pendingFollowUps > 0 && (
              <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-amber-600 rounded-full border-2 border-white"></span>
            )}
          </div>
          <span>Follow-up</span>
        </NavLink>

        <button
          onClick={() => setShowMoreMenu(true)}
          className="flex flex-col items-center justify-center w-14 h-full text-2xs text-slate-500 hover:text-slate-800"
        >
          <Menu className="w-5 h-5 mb-0.5" />
          <span>More</span>
        </button>
      </nav>
    </>
  );
};
