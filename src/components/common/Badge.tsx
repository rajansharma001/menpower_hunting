import React from 'react';

interface BadgeProps {
  children: React.ReactNode;
  variant?: 'neutral' | 'info' | 'warning' | 'success' | 'danger' | 'evidence' | 'permit';
  status?: string;
  size?: 'sm' | 'md';
}

export const Badge: React.FC<BadgeProps> = ({
  children,
  variant = 'neutral',
  status,
  size = 'md'
}) => {
  let colorStyles = 'bg-slate-100 text-slate-700 border-slate-300';

  const text = (status || (typeof children === 'string' ? children : '')).toLowerCase();

  if (text.includes('verified') && !text.includes('needs') && !text.includes('partially') && !text.includes('not')) {
    colorStyles = 'bg-emerald-50 text-emerald-800 border-emerald-300';
  } else if (text.includes('partially')) {
    colorStyles = 'bg-amber-50 text-amber-800 border-amber-300';
  } else if (text.includes('needs verification') || text.includes('waiting')) {
    colorStyles = 'bg-blue-50 text-blue-800 border-blue-300';
  } else if (text.includes('not provided') || text.includes('cancelled') || text.includes('unknown') || text.includes('unclear')) {
    colorStyles = 'bg-slate-100 text-slate-600 border-slate-300';
  } else if (text.includes('issued') || text.includes('completed')) {
    colorStyles = 'bg-teal-50 text-teal-800 border-teal-300';
  } else if (text.includes('lodged') || text.includes('processing')) {
    colorStyles = 'bg-indigo-50 text-indigo-800 border-indigo-300';
  } else if (variant === 'warning') {
    colorStyles = 'bg-amber-50 text-amber-800 border-amber-300';
  } else if (variant === 'success') {
    colorStyles = 'bg-emerald-50 text-emerald-800 border-emerald-300';
  } else if (variant === 'info') {
    colorStyles = 'bg-blue-50 text-blue-800 border-blue-300';
  }

  const sizeStyles = size === 'sm' ? 'px-2 py-0.5 text-xs' : 'px-2.5 py-1 text-xs';

  return (
    <span
      className={`inline-flex items-center font-medium border rounded-md whitespace-nowrap ${sizeStyles} ${colorStyles}`}
    >
      {children}
    </span>
  );
};
