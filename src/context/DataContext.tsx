import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import {
  OpportunityComplete,
  Agency,
  FollowUp,
  Visit,
  VerificationItem,
  VerificationStatus,
  FollowUpStatus
} from '../types/database';
import { WizardFormData } from '../types/form';
import { useAuth } from './AuthContext';
import * as db from '../lib/db';

interface ToastState {
  message: string;
  type: 'success' | 'info' | 'warning' | 'error';
  visible: boolean;
}

interface DataContextType {
  opportunities: OpportunityComplete[];
  agencies: Agency[];
  followUps: FollowUp[];
  visits: Visit[];
  loading: boolean;
  toast: ToastState;
  showToast: (message: string, type?: 'success' | 'info' | 'warning' | 'error') => void;
  hideToast: () => void;
  refreshData: () => Promise<void>;
  saveOpportunity: (formData: WizardFormData, existingAgencyId?: string, existingVisitId?: string) => Promise<{ opportunityId: string; agencyId: string; visitId: string }>;
  removeOpportunity: (id: string) => Promise<boolean>;
  addAgency: (data: Omit<Agency, 'id' | 'created_at' | 'updated_at'>) => Promise<Agency>;
  editAgency: (id: string, updates: Partial<Agency>) => Promise<Agency | null>;
  removeAgency: (id: string) => Promise<boolean>;
  updateVerification: (id: string, updates: Partial<VerificationItem>) => Promise<void>;
  addVerification: (opportunityId: string, item: string, notes?: string) => Promise<void>;
  saveFollowUp: (data: Omit<FollowUp, 'id' | 'created_at'>) => Promise<FollowUp>;
  editFollowUp: (id: string, updates: Partial<FollowUp>) => Promise<void>;
  removeFollowUp: (id: string) => Promise<void>;
  resetDemoData: () => void;
  purgeDemoData: () => void;
  purgeAllData: () => void;
  syncToSupabase: () => Promise<{ success: boolean; message: string; counts?: any }>;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

export const DataProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const [opportunities, setOpportunities] = useState<OpportunityComplete[]>([]);
  const [agencies, setAgencies] = useState<Agency[]>([]);
  const [followUps, setFollowUps] = useState<FollowUp[]>([]);
  const [visits, setVisits] = useState<Visit[]>([]);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState<ToastState>({ message: '', type: 'success', visible: false });

  const showToast = useCallback((message: string, type: 'success' | 'info' | 'warning' | 'error' = 'success') => {
    setToast({ message, type, visible: true });
    setTimeout(() => {
      setToast(prev => ({ ...prev, visible: false }));
    }, 4000);
  }, []);

  const hideToast = useCallback(() => {
    setToast(prev => ({ ...prev, visible: false }));
  }, []);

  useEffect(() => {
    const handleMphToast = (e: any) => {
      if (e?.detail?.message) {
        showToast(e.detail.message, e.detail.type || 'info');
      }
    };
    window.addEventListener('mph-toast', handleMphToast);
    return () => window.removeEventListener('mph-toast', handleMphToast);
  }, [showToast]);

  const refreshData = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    try {
      const [opps, ags, fols, vsts] = await Promise.all([
        db.getOpportunities(user.id),
        db.getAgencies(user.id),
        db.getFollowUps(user.id),
        db.getVisits(user.id),
      ]);
      setOpportunities(opps);
      setAgencies(ags);
      setFollowUps(fols);
      setVisits(vsts);
    } catch (err) {
      console.error('Failed to load data', err);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    refreshData();
  }, [refreshData]);

  const saveOpportunity = async (formData: WizardFormData, existingAgencyId?: string, existingVisitId?: string) => {
    if (!user) throw new Error('User not authenticated');
    const res = await db.saveOpportunityComplete(user.id, formData, existingAgencyId, existingVisitId);
    await refreshData();
    showToast('Opportunity saved successfully.', 'success');
    return res;
  };

  const removeOpportunity = async (id: string) => {
    const ok = await db.deleteOpportunity(id);
    if (ok) {
      await refreshData();
      showToast('Opportunity deleted.', 'info');
    }
    return ok;
  };

  const addAgency = async (data: Omit<Agency, 'id' | 'created_at' | 'updated_at'>) => {
    const created = await db.createAgency(data);
    await refreshData();
    showToast('Agency recorded.', 'success');
    return created;
  };

  const editAgency = async (id: string, updates: Partial<Agency>) => {
    const updated = await db.updateAgency(id, updates);
    await refreshData();
    showToast('Agency updated.', 'success');
    return updated;
  };

  const removeAgency = async (id: string) => {
    const ok = await db.deleteAgency(id);
    if (ok) {
      await refreshData();
      showToast('Agency deleted.', 'info');
    }
    return ok;
  };

  const updateVerification = async (id: string, updates: Partial<VerificationItem>) => {
    await db.updateVerificationItem(id, updates);
    await refreshData();
    showToast('Verification updated.', 'success');
  };

  const addVerification = async (opportunityId: string, item: string, notes?: string) => {
    await db.addVerificationItem(opportunityId, item, notes);
    await refreshData();
    showToast('Verification checklist item added.', 'success');
  };

  const saveFollowUp = async (data: Omit<FollowUp, 'id' | 'created_at'>) => {
    const created = await db.createFollowUp(data);
    await refreshData();
    showToast('Follow-up scheduled.', 'success');
    return created;
  };

  const editFollowUp = async (id: string, updates: Partial<FollowUp>) => {
    await db.updateFollowUp(id, updates);
    await refreshData();
    showToast('Follow-up updated.', 'success');
  };

  const removeFollowUp = async (id: string) => {
    await db.deleteFollowUp(id);
    await refreshData();
    showToast('Follow-up removed.', 'info');
  };

  const resetDemoData = async () => {
    if (!user) return;
    await db.loadDemoData(user.id);
    await refreshData();
    showToast('Demo data reloaded.', 'info');
  };

  const purgeDemoData = async () => {
    if (!user) return;
    await db.clearDemoData(user.id);
    await refreshData();
    showToast('Demo data removed.', 'info');
  };

  const purgeAllData = async () => {
    if (!user) return;
    await db.clearAllData(user.id);
    await refreshData();
    showToast('All records cleared from file.', 'warning');
  };

  const syncToSupabase = async () => {
    setLoading(true);
    const res = await db.syncAllLocalDataToSupabase();
    await refreshData();
    setLoading(false);
    if (res.success) {
      showToast(res.message, 'success');
    } else {
      showToast(res.message, 'error');
    }
    return res;
  };

  return (
    <DataContext.Provider
      value={{
        opportunities,
        agencies,
        followUps,
        visits,
        loading,
        toast,
        showToast,
        hideToast,
        refreshData,
        saveOpportunity,
        removeOpportunity,
        addAgency,
        editAgency,
        removeAgency,
        updateVerification,
        addVerification,
        saveFollowUp,
        editFollowUp,
        removeFollowUp,
        resetDemoData,
        purgeDemoData,
        purgeAllData,
        syncToSupabase,
      }}
    >
      {children}
    </DataContext.Provider>
  );
};

export const useData = () => {
  const context = useContext(DataContext);
  if (!context) throw new Error('useData must be used within a DataProvider');
  return context;
};
