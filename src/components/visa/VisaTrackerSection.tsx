import React, { useState } from 'react';
import {
  Compass,
  FileCheck2,
  Calendar,
  CheckCircle2,
  Shield,
  ExternalLink,
  ChevronRight,
  Globe,
  Clock
} from 'lucide-react';
import { OpportunityComplete, VisaMilestoneStatus } from '../../types/database';
import { useData } from '../../context/DataContext';
import {
  getCountryCorridor,
  calculateVisaProgress,
  OFFICIAL_VISA_PORTALS
} from '../../lib/visaProcess';
import { VfsAppointmentBanner } from './VfsAppointmentBanner';
import { VisaMilestoneCard } from './VisaMilestoneCard';
import { VisaDocumentChecklist } from './VisaDocumentChecklist';

interface VisaTrackerSectionProps {
  opportunity: OpportunityComplete;
}

export const VisaTrackerSection: React.FC<VisaTrackerSectionProps> = ({ opportunity }) => {
  const { updateMilestone, toggleVisaDoc } = useData();
  const [activeTab, setActiveTab] = useState<'timeline' | 'documents' | 'portals'>('timeline');

  const corridor = getCountryCorridor(opportunity.country);
  const isEurope = corridor === 'Europe';
  const isGulf = corridor === 'Gulf';

  const milestones = opportunity.visa_milestones || [];
  const documents = opportunity.visa_documents || [];

  const { completedCount, totalCount, percent, currentStep } = calculateVisaProgress(milestones);

  // Find the milestone representing VFS or GAMCA appointment
  const vfsMilestone = isEurope
    ? milestones.find(m => m.category === 'vfs') || milestones[4]
    : milestones.find(m => m.category === 'medical') || milestones[2];

  const handleUpdateAppointment = async (targetDate: string, refNum: string) => {
    if (!vfsMilestone) return;
    await updateMilestone(opportunity.id, vfsMilestone.id, {
      target_date: targetDate,
      reference_number: refNum,
      status: vfsMilestone.status === 'Pending' ? 'In Progress' : vfsMilestone.status
    });
  };

  const handleMilestoneStatusChange = async (milestoneId: string, newStatus: VisaMilestoneStatus) => {
    const updates: any = { status: newStatus };
    if (newStatus === 'Completed') {
      updates.completed_date = new Date().toISOString().split('T')[0];
    }
    await updateMilestone(opportunity.id, milestoneId, updates);
  };

  const handleMilestoneDetailsUpdate = async (
    milestoneId: string,
    details: {
      target_date?: string;
      completed_date?: string;
      reference_number?: string;
      notes?: string;
    }
  ) => {
    await updateMilestone(opportunity.id, milestoneId, details);
  };

  return (
    <div className="bg-white rounded-xl border border-slate-200/80 shadow-xs overflow-hidden">
      {/* Section Header */}
      <div className="p-4 sm:p-5 border-b border-slate-100 bg-gradient-to-b from-slate-50/70 to-white">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <span className="p-2.5 rounded-xl bg-teal-100/70 text-teal-800 border border-teal-200/60">
              <Compass className="w-5 h-5" />
            </span>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="text-base font-bold text-slate-900">
                  {isEurope
                    ? 'European Work Permit & VFS Biometrics Tracker'
                    : isGulf
                    ? 'Gulf GAMCA Medical & E-Visa Tracker'
                    : 'Embassy Visa & Departure Process Tracker'}
                </h3>
                <span
                  className={`text-xs px-2.5 py-0.5 rounded-full font-bold border ${
                    isEurope
                      ? 'bg-blue-50 text-blue-800 border-blue-200'
                      : isGulf
                      ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                      : 'bg-slate-100 text-slate-700 border-slate-200'
                  }`}
                >
                  {isEurope ? '🇪🇺 Europe Corridor' : isGulf ? '🇸🇦 Gulf Corridor' : '🌐 International Corridor'}
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                {isEurope
                  ? 'युरोप वर्क पर्मिट, VFS अपोइन्टमेन्ट र कन्सुलर भिसा प्रगति'
                  : 'गल्फ बायोमेट्रिक मेडिकल, ई-भिसा र अन्तिम श्रम स्वीकृति ट्र्याकर'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="text-right">
              <div className="text-xs font-semibold text-slate-500">समग्र प्रगति (Overall Progress)</div>
              <div className="text-sm font-bold text-teal-700 font-mono">
                {completedCount}/{totalCount} Steps ({percent}%)
              </div>
            </div>
          </div>
        </div>

        {/* Global Progress Bar */}
        <div className="mt-4">
          <div className="w-full bg-slate-200 h-2.5 rounded-full overflow-hidden">
            <div
              className={`h-full transition-all duration-300 ${
                percent === 100
                  ? 'bg-emerald-500'
                  : percent > 50
                  ? 'bg-teal-600'
                  : 'bg-indigo-600'
              }`}
              style={{ width: `${percent}%` }}
            />
          </div>

          {currentStep && (
            <div className="mt-2 flex items-center justify-between text-xs text-slate-600">
              <div className="flex items-center gap-1.5">
                <span className="font-semibold text-slate-900">हालको चरण (Current Stage):</span>
                <span className="inline-flex items-center gap-1 font-medium text-teal-800 bg-teal-50 px-2 py-0.5 rounded border border-teal-200">
                  <Clock className="w-3 h-3 text-teal-600" />
                  Step {currentStep.step_number}: {currentStep.title}
                </span>
              </div>
              <span className="text-slate-400 font-mono text-[11px] hidden sm:inline">
                {currentStep.title_np}
              </span>
            </div>
          )}
        </div>
      </div>

      <div className="p-4 sm:p-5">
        {/* VFS / GAMCA Appointment Countdown Banner */}
        <VfsAppointmentBanner
          milestone={vfsMilestone}
          corridor={corridor}
          onUpdateAppointment={handleUpdateAppointment}
        />

        {/* Navigation Tabs */}
        <div className="flex items-center gap-1 border-b border-slate-200 mb-4 pb-1">
          <button
            type="button"
            onClick={() => setActiveTab('timeline')}
            className={`px-3 py-2 text-xs font-bold rounded-lg transition inline-flex items-center gap-1.5 ${
              activeTab === 'timeline'
                ? 'bg-teal-600 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <Calendar className="w-3.5 h-3.5" />
            <span>प्रक्रिया चरणहरू (Milestones Pipeline)</span>
            <span className="ml-1 px-1.5 py-0.2 rounded-full text-[10px] bg-white/20">
              {milestones.length}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('documents')}
            className={`px-3 py-2 text-xs font-bold rounded-lg transition inline-flex items-center gap-1.5 ${
              activeTab === 'documents'
                ? 'bg-teal-600 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <FileCheck2 className="w-3.5 h-3.5" />
            <span>कागजात चेकलिस्ट (Dossier Checklist)</span>
            <span className="ml-1 px-1.5 py-0.2 rounded-full text-[10px] bg-white/20">
              {documents.length}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('portals')}
            className={`px-3 py-2 text-xs font-bold rounded-lg transition inline-flex items-center gap-1.5 ${
              activeTab === 'portals'
                ? 'bg-teal-600 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <Globe className="w-3.5 h-3.5" />
            <span>सरकारी पोर्टलहरू (Official Portals)</span>
          </button>
        </div>

        {/* Tab 1: Milestones Timeline */}
        {activeTab === 'timeline' && (
          <div className="space-y-3">
            {milestones.map(m => (
              <VisaMilestoneCard
                key={m.id}
                milestone={m}
                corridor={corridor}
                onStatusChange={status => handleMilestoneStatusChange(m.id, status)}
                onUpdateDetails={details => handleMilestoneDetailsUpdate(m.id, details)}
              />
            ))}
          </div>
        )}

        {/* Tab 2: Document Checklist */}
        {activeTab === 'documents' && (
          <VisaDocumentChecklist
            documents={documents}
            corridor={corridor}
            onToggleDoc={docId => toggleVisaDoc(opportunity.id, docId)}
          />
        )}

        {/* Tab 3: Official Portals Direct Directory */}
        {activeTab === 'portals' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/60 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-bold text-slate-900">VFS Global Nepal</h4>
                  <span className="text-[11px] font-semibold bg-blue-100 text-blue-800 px-2 py-0.5 rounded">
                    EU Consular
                  </span>
                </div>
                <p className="text-xs text-slate-600 mt-1">
                  Chhaya Center, Thamel. Book appointment slots for Poland, Croatia, Romania, and Schengen national employment visas.
                </p>
              </div>
              <a
                href={OFFICIAL_VISA_PORTALS.vfsGlobalNepal}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-3 inline-flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg bg-teal-600 hover:bg-teal-500 text-white text-xs font-semibold transition"
              >
                <span>Open VFS Global Nepal</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>

            <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/60 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-bold text-slate-900">Nepal Police OPCR Portal</h4>
                  <span className="text-[11px] font-semibold bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded">
                    Government
                  </span>
                </div>
                <p className="text-xs text-slate-600 mt-1">
                  Online Police Clearance Certificate application system. Required for all European employment visas and MOFA apostille.
                </p>
              </div>
              <a
                href={OFFICIAL_VISA_PORTALS.nepalPoliceOpcr}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-3 inline-flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg bg-teal-600 hover:bg-teal-500 text-white text-xs font-semibold transition"
              >
                <span>Apply OPCR Police Report</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>

            <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/60 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-bold text-slate-900">MOFA Attestation System</h4>
                  <span className="text-[11px] font-semibold bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded">
                    Consular
                  </span>
                </div>
                <p className="text-xs text-slate-600 mt-1">
                  Ministry of Foreign Affairs (Tripureshwor, Kathmandu) document legalisation, apostille, and electronic verification.
                </p>
              </div>
              <a
                href={OFFICIAL_VISA_PORTALS.mofaAttestation}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-3 inline-flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg bg-teal-600 hover:bg-teal-500 text-white text-xs font-semibold transition"
              >
                <span>MOFA Attestation Portal</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>

            <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/60 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-bold text-slate-900">Wafid (GAMCA) Medical</h4>
                  <span className="text-[11px] font-semibold bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded">
                    Gulf (GCC)
                  </span>
                </div>
                <p className="text-xs text-slate-600 mt-1">
                  Official Gulf Health Council medical slip registration, medical center allocation, and fitness result verification.
                </p>
              </div>
              <a
                href={OFFICIAL_VISA_PORTALS.gamcaWafidMedical}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-3 inline-flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg bg-teal-600 hover:bg-teal-500 text-white text-xs font-semibold transition"
              >
                <span>Wafid Medical Verification</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>

            <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/60 flex flex-col justify-between md:col-span-2">
              <div>
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-bold text-slate-900">DoFE FEIMS Portal (श्रम विभाग)</h4>
                  <span className="text-[11px] font-semibold bg-amber-100 text-amber-800 px-2 py-0.5 rounded">
                    Nepal Labour
                  </span>
                </div>
                <p className="text-xs text-slate-600 mt-1">
                  Department of Foreign Employment Foreign Employment Information Management System. Track Lot Approval, Pre-Departure Insurance, and Final Labour Approval Sticker.
                </p>
              </div>
              <a
                href={OFFICIAL_VISA_PORTALS.dofeFeims}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-3 inline-flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold transition"
              >
                <span>FEIMS Portal (feims.dofe.gov.np)</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
