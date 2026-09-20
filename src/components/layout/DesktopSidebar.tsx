import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  PlusCircle,
  Briefcase,
  Building2,
  Globe2,
  CalendarCheck2,
  ShieldCheck,
  Settings,
  Search,
  ExternalLink
} from 'lucide-react';
import { useData } from '../../context/DataContext';

interface DesktopSidebarProps {
  onOpenSearch: () => void;
}

export const DesktopSidebar: React.FC<DesktopSidebarProps> = ({ onOpenSearch }) => {
  const { followUps, opportunities } = useData();

  const pendingFollowUps = followUps.filter(f => f.status === 'Pending').length;
  
  // Count unverified items
  const pendingVerifications = opportunities.reduce((acc, opp) => {
    const unverified = (opp.verification_items || []).filter(v => v.status === 'Needs Verification').length;
    return acc + unverified;
  }, 0);

  const navItems = [
    { to: '/', label: 'Dashboard', icon: LayoutDashboard, exact: true },
    { to: '/new-visit', label: 'New Visit', icon: PlusCircle, isAction: true },
    { to: '/opportunities', label: 'Opportunities', icon: Briefcase, count: opportunities.length },
    { to: '/agencies', label: 'Agencies', icon: Building2 },
    { to: '/countries', label: 'Countries', icon: Globe2 },
    { to: '/follow-ups', label: 'Follow-ups', icon: CalendarCheck2, count: pendingFollowUps > 0 ? pendingFollowUps : undefined, badgeColor: 'bg-amber-800 text-amber-100' },
    { to: '/verification', label: 'Verification', icon: ShieldCheck, count: pendingVerifications > 0 ? pendingVerifications : undefined, badgeColor: 'bg-blue-800 text-blue-100' },
    { to: '/settings', label: 'Settings', icon: Settings },
  ];

  return (
    <aside className="hidden md:flex flex-col w-64 bg-slate-900 text-slate-200 border-r border-slate-800 flex-shrink-0 select-none min-h-screen">
      {/* Brand */}
      <div className="p-4 border-b border-slate-800">
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 rounded bg-teal-600 flex items-center justify-center text-white font-bold text-base shadow-xs">
            NP
          </div>
          <div>
            <h1 className="text-sm font-bold text-white tracking-tight leading-tight">
              Foreign Employment
            </h1>
            <p className="text-2xs text-slate-400 uppercase tracking-wider font-semibold">
              Research Notebook • Nepal
            </p>
          </div>
        </div>
      </div>

      {/* Quick Search Bar Trigger */}
      <div className="p-3 border-b border-slate-800">
        <button
          onClick={onOpenSearch}
          className="w-full flex items-center justify-between px-3 py-2 text-xs bg-slate-800/80 hover:bg-slate-800 border border-slate-700/80 rounded text-slate-400 hover:text-slate-200 transition"
        >
          <div className="flex items-center space-x-2">
            <Search className="w-3.5 h-3.5" />
            <span>Search research...</span>
          </div>
          <kbd className="text-2xs px-1.5 py-0.5 bg-slate-900 border border-slate-700 rounded text-slate-400">
            Ctrl+K
          </kbd>
        </button>
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
        {navItems.map(item => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.exact}
            className={({ isActive }) =>
              `flex items-center justify-between px-3 py-2 rounded text-xs font-medium transition ${
                item.isAction
                  ? 'bg-teal-700 hover:bg-teal-600 text-white font-semibold my-2 shadow-xs'
                  : isActive
                  ? 'bg-slate-800 text-white border-l-2 border-teal-500 pl-2.5'
                  : 'text-slate-300 hover:bg-slate-800/60 hover:text-white'
              }`
            }
          >
            <div className="flex items-center space-x-2.5">
              <item.icon className={`w-4 h-4 ${item.isAction ? 'text-white' : 'text-slate-400'}`} />
              <span>{item.label}</span>
            </div>
            {item.count !== undefined && item.count > 0 && (
              <span
                className={`text-2xs font-semibold px-1.5 py-0.5 rounded ${
                  item.badgeColor || 'bg-slate-800 text-slate-300'
                }`}
              >
                {item.count}
              </span>
            )}
          </NavLink>
        ))}
      </nav>

      {/* Official Verification Resources Quick Links */}
      <div className="p-3 border-t border-slate-800/80 text-2xs text-slate-400">
        <div className="font-semibold text-slate-300 uppercase tracking-wider mb-2">
          Official DoFE Portals
        </div>
        <ul className="space-y-1.5">
          <li>
            <a
              href="https://dofe.gov.np"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-between hover:text-teal-400 transition"
            >
              <span>DoFE Nepal Official</span>
              <ExternalLink className="w-3 h-3 text-slate-500" />
            </a>
          </li>
          <li>
            <a
              href="https://feims.dofe.gov.np"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-between hover:text-teal-400 transition"
            >
              <span>FEIMS License Check</span>
              <ExternalLink className="w-3 h-3 text-slate-500" />
            </a>
          </li>
        </ul>
      </div>

      {/* App Version / Private note */}
      <div className="p-3 border-t border-slate-800 text-2xs text-slate-500 flex items-center justify-between">
        <span>Private Research Mode</span>
        <span>v1.0</span>
      </div>
    </aside>
  );
};
