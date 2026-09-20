import React from 'react';
import { useData } from '../../context/DataContext';
import { AlertTriangle, Trash2, RotateCcw } from 'lucide-react';

export const DemoDataBanner: React.FC = () => {
  const { opportunities, purgeDemoData, resetDemoData } = useData();

  const demoCount = opportunities.filter(o => o.is_demo).length;

  if (demoCount === 0) return null;

  return (
    <div className="bg-amber-50/80 border-b border-amber-200 px-4 py-2.5 text-xs text-amber-900 flex flex-wrap items-center justify-between gap-2">
      <div className="flex items-center space-x-2">
        <AlertTriangle className="w-4 h-4 text-amber-700 flex-shrink-0" />
        <span>
          <strong className="font-semibold">DEMO DATA ACTIVE:</strong> Currently showing {demoCount} fictional sample record(s) for testing (Poland, Croatia, Romania).
        </span>
      </div>
      <div className="flex items-center space-x-3">
        <button
          onClick={purgeDemoData}
          className="inline-flex items-center space-x-1 text-amber-800 hover:text-red-700 font-medium underline transition"
        >
          <Trash2 className="w-3.5 h-3.5" />
          <span>Remove Demo Records</span>
        </button>
      </div>
    </div>
  );
};
