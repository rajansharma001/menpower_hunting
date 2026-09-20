import React from 'react';
import { useData } from '../../context/DataContext';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';

export const Toast: React.FC = () => {
  const { toast, hideToast } = useData();

  if (!toast.visible) return null;

  const bgStyles = {
    success: 'bg-slate-900 text-white border-slate-700',
    info: 'bg-blue-900 text-white border-blue-700',
    warning: 'bg-amber-900 text-white border-amber-700',
    error: 'bg-red-900 text-white border-red-700'
  }[toast.type] || 'bg-slate-900 text-white border-slate-700';

  const Icon = {
    success: CheckCircle2,
    info: Info,
    warning: AlertCircle,
    error: AlertCircle
  }[toast.type] || Info;

  return (
    <div className="fixed bottom-16 md:bottom-6 right-4 z-50 max-w-sm w-full shadow-lg rounded-md border p-3 flex items-start space-x-3 transition-all animate-in fade-in slide-in-from-bottom-3 duration-200">
      <div className={`p-3 rounded-md w-full border flex items-center justify-between ${bgStyles}`}>
        <div className="flex items-center space-x-2">
          <Icon className="w-5 h-5 flex-shrink-0" />
          <span className="text-sm font-medium">{toast.message}</span>
        </div>
        <button
          onClick={hideToast}
          className="ml-3 text-slate-300 hover:text-white p-1 rounded transition"
          aria-label="Close"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
