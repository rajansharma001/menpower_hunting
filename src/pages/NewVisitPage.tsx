import React from 'react';
import { QuickVisitWizard } from '../components/wizard/QuickVisitWizard';

export const NewVisitPage: React.FC = () => {
  return (
    <div className="min-h-full bg-slate-50/50">
      <QuickVisitWizard />
    </div>
  );
};
