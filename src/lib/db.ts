import {
  Agency,
  Visit,
  Opportunity,
  OpportunityCost,
  OpportunityDocument,
  PaymentTerm,
  VerificationItem,
  FollowUp,
  OpportunityComplete,
} from '../types/database';
import { WizardFormData } from '../types/form';
import { getSupabase } from './supabase';
import { generateDemoData } from './demoData';
import { DEFAULT_VERIFICATION_ITEMS } from '../constants/workflowOptions';

export interface FileDatabase {
  agencies: Agency[];
  visits: Visit[];
  opportunities: Opportunity[];
  costs: OpportunityCost[];
  documents: OpportunityDocument[];
  payment_terms: PaymentTerm[];
  verification_items: VerificationItem[];
  follow_ups: FollowUp[];
}

let cachedDb: FileDatabase = {
  agencies: [],
  visits: [],
  opportunities: [],
  costs: [],
  documents: [],
  payment_terms: [],
  verification_items: [],
  follow_ups: []
};

let isLoadedFromFile = false;

const BACKUP_STORAGE_KEY = 'mph_file_db_backup';

export function generateUUID(): string {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

// Fetch directly from server disk file (data/db.json)
export async function fetchFileDatabase(): Promise<FileDatabase> {
  try {
    const res = await fetch('/api/db');
    const contentType = res.headers.get('content-type') || '';
    if (res.ok && contentType.includes('application/json')) {
      const data = await res.json();
      cachedDb = {
        agencies: Array.isArray(data.agencies) ? data.agencies : [],
        visits: Array.isArray(data.visits) ? data.visits : [],
        opportunities: Array.isArray(data.opportunities) ? data.opportunities : [],
        costs: Array.isArray(data.costs) ? data.costs : [],
        documents: Array.isArray(data.documents) ? data.documents : [],
        payment_terms: Array.isArray(data.payment_terms) ? data.payment_terms : [],
        verification_items: Array.isArray(data.verification_items) ? data.verification_items : [],
        follow_ups: Array.isArray(data.follow_ups) ? data.follow_ups : []
      };
      isLoadedFromFile = true;
      try {
        localStorage.setItem(BACKUP_STORAGE_KEY, JSON.stringify(cachedDb));
      } catch {}
      return cachedDb;
    }
  } catch (err) {
    console.warn('Could not read from /api/db file endpoint', err);
  }

  // Resilient fallback for static hosting / offline / Vercel
  try {
    const backup = localStorage.getItem(BACKUP_STORAGE_KEY);
    if (backup) {
      const parsed = JSON.parse(backup);
      cachedDb = {
        agencies: Array.isArray(parsed.agencies) ? parsed.agencies : [],
        visits: Array.isArray(parsed.visits) ? parsed.visits : [],
        opportunities: Array.isArray(parsed.opportunities) ? parsed.opportunities : [],
        costs: Array.isArray(parsed.costs) ? parsed.costs : [],
        documents: Array.isArray(parsed.documents) ? parsed.documents : [],
        payment_terms: Array.isArray(parsed.payment_terms) ? parsed.payment_terms : [],
        verification_items: Array.isArray(parsed.verification_items) ? parsed.verification_items : [],
        follow_ups: Array.isArray(parsed.follow_ups) ? parsed.follow_ups : []
      };
      isLoadedFromFile = true;
      return cachedDb;
    }
  } catch (e) {
    console.warn('Backup storage read error', e);
  }

  return cachedDb;
}

// Write directly to server disk file (data/db.json)
export async function saveToFileDisk(data: FileDatabase): Promise<boolean> {
  cachedDb = data;
  try {
    localStorage.setItem(BACKUP_STORAGE_KEY, JSON.stringify(data));
  } catch {}

  try {
    const res = await fetch('/api/db', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data, null, 2)
    });
    return res.ok;
  } catch (err) {
    console.warn('Could not write to file data/db.json, cached locally', err);
    return true;
  }
}

async function ensureDataLoaded(): Promise<FileDatabase> {
  if (!isLoadedFromFile) {
    return await fetchFileDatabase();
  }
  return cachedDb;
}

export function initializeLocalDatabase(userId: string) {
  // Trigger initial fetch from file on disk
  fetchFileDatabase();
}

export async function getAgencies(userId: string): Promise<Agency[]> {
  const supabase = getSupabase();
  if (supabase) {
    try {
      const { data, error } = await supabase
        .from('agencies')
        .select('*')
        .order('name', { ascending: true });
      if (!error && data) return data as Agency[];
    } catch (err) {
      console.warn('Falling back to file database for getAgencies', err);
    }
  }

  const db = await ensureDataLoaded();
  return db.agencies.filter(a => !userId || a.user_id === userId);
}

function notifySupabaseError(action: string, error: any) {
  if (!error) return;
  const msg = error.message || (typeof error === 'string' ? error : 'Database operation failed');
  console.error(`[Supabase ${action} Error]:`, error);
  if (typeof window !== 'undefined') {
    let friendly = `Supabase ${action}: ${msg}`;
    if (msg.includes('relation "public.agencies" does not exist') || msg.includes('does not exist') || error.code === '42P01') {
      friendly = `Supabase database tables are missing. Run schema.sql in Supabase SQL Editor. (Data saved to local backup)`;
    } else if (msg.includes('violates row-level security') || error.code === '42501') {
      friendly = `Supabase permission blocked by RLS. Run updated schema.sql in Supabase SQL Editor. (Data saved to local backup)`;
    }
    window.dispatchEvent(new CustomEvent('mph-toast', {
      detail: { message: friendly, type: 'error' }
    }));
  }
}

export async function createAgency(agencyData: Omit<Agency, 'id' | 'created_at' | 'updated_at'>): Promise<Agency> {
  const supabase = getSupabase();
  const now = new Date().toISOString();
  const newAgency: Agency = {
    ...agencyData,
    id: generateUUID(),
    created_at: now,
    updated_at: now,
  };

  if (supabase) {
    try {
      const { data, error } = await supabase
        .from('agencies')
        .insert([newAgency])
        .select()
        .single();
      if (error) {
        notifySupabaseError('Agency create', error);
      } else if (data) {
        // created in Supabase successfully
      }
    } catch (err) {
      console.warn('Falling back to file database for createAgency', err);
      notifySupabaseError('Agency create', err);
    }
  }

  const db = await ensureDataLoaded();
  db.agencies.unshift(newAgency);
  await saveToFileDisk(db);
  return newAgency;
}

export async function updateAgency(id: string, updates: Partial<Agency>): Promise<Agency | null> {
  const supabase = getSupabase();
  const now = new Date().toISOString();

  if (supabase) {
    try {
      const { data, error } = await supabase
        .from('agencies')
        .update({ ...updates, updated_at: now })
        .eq('id', id)
        .select()
        .single();
      if (error) notifySupabaseError('Agency update', error);
      if (!error && data) return data as Agency;
    } catch (err) {
      console.warn('Falling back to file database for updateAgency', err);
      notifySupabaseError('Agency update', err);
    }
  }

  const db = await ensureDataLoaded();
  const idx = db.agencies.findIndex(a => a.id === id);
  if (idx !== -1) {
    db.agencies[idx] = { ...db.agencies[idx], ...updates, updated_at: now };
    await saveToFileDisk(db);
    return db.agencies[idx];
  }
  return null;
}

export async function deleteAgency(id: string): Promise<boolean> {
  const supabase = getSupabase();
  if (supabase) {
    try {
      const { error } = await supabase.from('agencies').delete().eq('id', id);
      if (error) notifySupabaseError('Agency delete', error);
      if (!error) return true;
    } catch (err) {
      console.warn('Falling back to file database for deleteAgency', err);
      notifySupabaseError('Agency delete', err);
    }
  }

  const db = await ensureDataLoaded();
  db.agencies = db.agencies.filter(a => a.id !== id);
  db.opportunities = db.opportunities.filter(o => o.agency_id !== id);
  await saveToFileDisk(db);
  return true;
}

export async function createVisit(visitData: Omit<Visit, 'id' | 'created_at' | 'updated_at'>): Promise<Visit> {
  const supabase = getSupabase();
  const now = new Date().toISOString();
  const newVisit: Visit = {
    ...visitData,
    id: generateUUID(),
    created_at: now,
    updated_at: now,
  };

  if (supabase) {
    try {
      const { data, error } = await supabase
        .from('visits')
        .insert([newVisit])
        .select()
        .single();
      if (error) notifySupabaseError('Visit create', error);
    } catch (err) {
      console.warn('Falling back to file database for createVisit', err);
      notifySupabaseError('Visit create', err);
    }
  }

  const db = await ensureDataLoaded();
  db.visits.unshift(newVisit);
  await saveToFileDisk(db);
  return newVisit;
}

export async function getVisits(userId: string): Promise<Visit[]> {
  const supabase = getSupabase();
  if (supabase) {
    try {
      const { data, error } = await supabase
        .from('visits')
        .select('*')
        .order('visit_date', { ascending: false });
      if (!error && data) return data as Visit[];
    } catch (err) {
      console.warn('Falling back to file database for getVisits', err);
    }
  }

  const db = await ensureDataLoaded();
  return db.visits.filter(v => !userId || v.user_id === userId);
}

export async function getOpportunities(userId: string): Promise<OpportunityComplete[]> {
  const supabase = getSupabase();
  if (supabase) {
    try {
      const { data: opps, error } = await supabase
        .from('opportunities')
        .select(`
          *,
          agency:agencies(*),
          visit:visits(*),
          costs:opportunity_costs(*),
          documents:opportunity_documents(*),
          payment_terms:payment_terms(*),
          verification_items:verification_items(*),
          follow_ups:follow_ups(*)
        `)
        .order('created_at', { ascending: false });

      if (!error && opps) {
        return opps.map((o: any) => ({
          ...o,
          costs: Array.isArray(o.costs) ? o.costs[0] : o.costs,
        })) as OpportunityComplete[];
      }
    } catch (err) {
      console.warn('Falling back to file database for getOpportunities', err);
    }
  }

  const db = await ensureDataLoaded();
  const opps = db.opportunities.filter(o => !userId || o.user_id === userId);

  return opps.map(opp => ({
    ...opp,
    agency: db.agencies.find(a => a.id === opp.agency_id),
    visit: db.visits.find(v => v.id === opp.visit_id),
    costs: db.costs.find(c => c.opportunity_id === opp.id),
    documents: db.documents.filter(d => d.opportunity_id === opp.id),
    payment_terms: db.payment_terms.filter(p => p.opportunity_id === opp.id),
    verification_items: db.verification_items.filter(v => v.opportunity_id === opp.id),
    follow_ups: db.follow_ups.filter(f => f.opportunity_id === opp.id)
  }));
}

export async function getOpportunity(id: string): Promise<OpportunityComplete | null> {
  const opps = await getOpportunities('');
  return opps.find(o => o.id === id) || null;
}

export async function deleteOpportunity(id: string): Promise<boolean> {
  const supabase = getSupabase();
  if (supabase) {
    try {
      const { error } = await supabase.from('opportunities').delete().eq('id', id);
      if (!error) return true;
    } catch (err) {
      console.warn('Falling back to file database for deleteOpportunity', err);
    }
  }

  const db = await ensureDataLoaded();
  db.opportunities = db.opportunities.filter(o => o.id !== id);
  db.costs = db.costs.filter(c => c.opportunity_id !== id);
  db.documents = db.documents.filter(d => d.opportunity_id !== id);
  db.payment_terms = db.payment_terms.filter(p => p.opportunity_id !== id);
  db.verification_items = db.verification_items.filter(v => v.opportunity_id !== id);
  db.follow_ups = db.follow_ups.filter(f => f.opportunity_id !== id);
  await saveToFileDisk(db);
  return true;
}

export async function saveOpportunityComplete(
  userId: string,
  formData: WizardFormData,
  existingAgencyId?: string,
  existingVisitId?: string
): Promise<{ opportunityId: string; agencyId: string; visitId: string }> {
  const now = new Date().toISOString();
  const db = await ensureDataLoaded();

  // 1. Resolve or Create Agency
  let agencyId = existingAgencyId || formData.agency_id;
  if (!agencyId) {
    const matched = db.agencies.find(
      a => a.name.trim().toLowerCase() === formData.agency_name.trim().toLowerCase()
    );
    if (matched) {
      agencyId = matched.id;
    } else {
      const created = await createAgency({
        user_id: userId,
        name: formData.agency_name.trim(),
        location: formData.agency_location.trim(),
        contact_person: formData.contact_person.trim(),
        phone: formData.phone.trim(),
        license_number: formData.license_number.trim(),
        website: formData.website.trim(),
        social_link: formData.social_link.trim(),
        notes: ''
      });
      agencyId = created.id;
    }
  }

  // 2. Resolve or Create Visit
  let visitId = existingVisitId;
  if (!visitId) {
    const createdVisit = await createVisit({
      user_id: userId,
      agency_id: agencyId,
      visit_date: formData.visit_date || new Date().toISOString().split('T')[0],
      discovery_channel: formData.discovery_channel || 'Walk-in',
      general_notes: formData.visit_notes || ''
    });
    visitId = createdVisit.id;
  }

  // 3. Create Opportunity
  const opportunityId = generateUUID();

  let resolvedUserId = userId;
  const supabase = getSupabase();
  if (supabase) {
    try {
      const { data: authData } = await supabase.auth.getUser();
      if (authData?.user?.id) {
        resolvedUserId = authData.user.id;
      }
    } catch {}
  }

  const oppRecord: Opportunity = {
    id: opportunityId,
    user_id: resolvedUserId,
    agency_id: agencyId,
    visit_id: visitId,
    country: formData.country,
    job_title: formData.job_title,
    job_sector: formData.job_sector || undefined,
    employer_name: formData.employer_name || undefined,
    employer_city: formData.employer_city || undefined,
    employer_identified: formData.employer_identified,
    intermediary_type: formData.intermediary_type,
    advertised_salary: formData.advertised_salary ? parseFloat(formData.advertised_salary) : undefined,
    salary_currency: formData.salary_currency || 'EUR',
    salary_type: formData.salary_type,
    expected_net_salary: formData.expected_net_salary ? parseFloat(formData.expected_net_salary) : undefined,
    net_salary_currency: formData.net_salary_currency || formData.salary_currency || 'EUR',
    working_hours: formData.working_hours ? parseFloat(formData.working_hours) : undefined,
    working_days: formData.working_days ? parseFloat(formData.working_days) : undefined,
    overtime_status: formData.overtime_status,
    overtime_rate: formData.overtime_rate || undefined,
    contract_length: formData.contract_length || undefined,
    probation: formData.probation || undefined,
    accommodation_type: formData.accommodation_type,
    accommodation_cost: formData.accommodation_cost ? parseFloat(formData.accommodation_cost) : undefined,
    food_arrangement: formData.food_arrangement,
    transportation: formData.transportation,
    work_permit_status: formData.work_permit_status,
    estimated_total_processing_time: formData.estimated_total_processing_time || undefined,
    timeline_basis: formData.timeline_basis,
    evidence_status: formData.evidence_status,
    pressure_flags: formData.pressure_flags,
    general_notes: formData.general_notes || undefined,
    is_demo: false,
    created_at: now,
    updated_at: now
  };

  // 4. Create Opportunity Cost
  const costRecord: OpportunityCost = {
    id: generateUUID(),
    opportunity_id: opportunityId,
    agency_service_charge: parseFloat(formData.agency_service_charge || '0') || 0,
    government_processing_fee: parseFloat(formData.government_processing_fee || '0') || 0,
    medical_exam: parseFloat(formData.medical_exam || '0') || 0,
    insurance: parseFloat(formData.insurance || '0') || 0,
    visa_fee: parseFloat(formData.visa_fee || '0') || 0,
    documentation: parseFloat(formData.documentation || '0') || 0,
    translation: parseFloat(formData.translation || '0') || 0,
    training: parseFloat(formData.training || '0') || 0,
    air_ticket: parseFloat(formData.air_ticket || '0') || 0,
    miscellaneous: parseFloat(formData.miscellaneous || '0') || 0,
    total_quoted_cost: parseFloat(formData.total_quoted_cost || '0') || 0,
    written_cost: formData.written_cost,
    cost_breakdown_status: formData.cost_breakdown_status,
    created_at: now,
    updated_at: now
  };

  // 5. Create Documents Shown
  const docRecords: OpportunityDocument[] = Object.entries(formData.documents_shown || {})
    .filter(([_, doc]) => doc.shown)
    .map(([docType, doc]) => ({
      id: generateUUID(),
      opportunity_id: opportunityId,
      document_type: docType,
      shown: true,
      photo_allowed: doc.photo_allowed || 'Not Asked',
      file_url: doc.file_url,
      notes: doc.notes,
      created_at: now
    }));

  // 6. Create Payment Terms
  const paymentRecords: PaymentTerm[] = (formData.payment_stages || []).map(stage => ({
    id: generateUUID(),
    opportunity_id: opportunityId,
    payment_stage: stage,
    payment_method: formData.payment_method,
    receipt_status: formData.receipt_status,
    refund_policy: formData.refund_policy,
    refund_notes: formData.refund_notes,
    created_at: now
  }));

  // 7. Auto-generate Standard Verification Items
  const verificationRecords: VerificationItem[] = DEFAULT_VERIFICATION_ITEMS.map(item => ({
    id: generateUUID(),
    opportunity_id: opportunityId,
    item: item,
    status: 'Needs Verification',
    created_at: now
  }));

  // Persist to Supabase if client active
  if (supabase) {
    try {
      // 1. Ensure parent agency exists in Supabase so foreign key constraint succeeds
      const agencyRecord = db.agencies.find(a => a.id === agencyId);
      if (agencyRecord) {
        await supabase.from('agencies').upsert([agencyRecord], { onConflict: 'id' });
      }

      // 2. Ensure parent visit exists in Supabase so foreign key constraint succeeds
      const visitRecord = db.visits.find(v => v.id === visitId);
      if (visitRecord) {
        await supabase.from('visits').upsert([visitRecord], { onConflict: 'id' });
      }

      // 3. Insert opportunity
      const { error: oppErr } = await supabase.from('opportunities').insert([oppRecord]);
      if (oppErr) {
        notifySupabaseError('Opportunity save', oppErr);
      } else {
        // 4. Insert child records only after parent opportunity is confirmed
        const { error: costErr } = await supabase.from('opportunity_costs').insert([costRecord]);
        if (costErr) notifySupabaseError('Opportunity Cost save', costErr);

        if (docRecords.length > 0) {
          const { error: docErr } = await supabase.from('opportunity_documents').insert(docRecords);
          if (docErr) notifySupabaseError('Opportunity Documents save', docErr);
        }

        if (paymentRecords.length > 0) {
          const { error: payErr } = await supabase.from('payment_terms').insert(paymentRecords);
          if (payErr) notifySupabaseError('Payment Terms save', payErr);
        }

        if (verificationRecords.length > 0) {
          const { error: verErr } = await supabase.from('verification_items').insert(verificationRecords);
          if (verErr) notifySupabaseError('Verification Items save', verErr);
        }
      }
    } catch (err: any) {
      console.warn('Falling back to file database for saveOpportunityComplete', err);
      notifySupabaseError('Opportunity save', err);
    }
  }

  // Save directly to file on disk (data/db.json)
  db.opportunities.unshift(oppRecord);
  db.costs.unshift(costRecord);
  db.documents.unshift(...docRecords);
  db.payment_terms.unshift(...paymentRecords);
  db.verification_items.unshift(...verificationRecords);

  await saveToFileDisk(db);

  return {
    opportunityId,
    agencyId,
    visitId
  };
}

export async function updateVerificationItem(
  id: string,
  updates: Partial<VerificationItem>
): Promise<VerificationItem | null> {
  const supabase = getSupabase();
  if (supabase) {
    try {
      const { data, error } = await supabase
        .from('verification_items')
        .update(updates)
        .eq('id', id)
        .select()
        .single();
      if (error) notifySupabaseError('Verification update', error);
      if (!error && data) return data as VerificationItem;
    } catch (err) {
      console.warn('Fallback to file for updateVerificationItem', err);
      notifySupabaseError('Verification update', err);
    }
  }

  const db = await ensureDataLoaded();
  const idx = db.verification_items.findIndex(v => v.id === id);
  if (idx !== -1) {
    db.verification_items[idx] = { ...db.verification_items[idx], ...updates };
    await saveToFileDisk(db);
    return db.verification_items[idx];
  }
  return null;
}

export async function addVerificationItem(
  opportunityId: string,
  item: string,
  notes?: string
): Promise<VerificationItem> {
  const supabase = getSupabase();
  const newItem: VerificationItem = {
    id: generateUUID(),
    opportunity_id: opportunityId,
    item,
    status: 'Needs Verification',
    notes,
    created_at: new Date().toISOString()
  };

  if (supabase) {
    try {
      const { data, error } = await supabase
        .from('verification_items')
        .insert([newItem])
        .select()
        .single();
      if (error) notifySupabaseError('Verification add', error);
      if (!error && data) return data as VerificationItem;
    } catch (err) {
      console.warn('Fallback to file for addVerificationItem', err);
      notifySupabaseError('Verification add', err);
    }
  }

  const db = await ensureDataLoaded();
  db.verification_items.unshift(newItem);
  await saveToFileDisk(db);
  return newItem;
}

export async function getFollowUps(userId: string): Promise<FollowUp[]> {
  const supabase = getSupabase();
  if (supabase) {
    try {
      const { data, error } = await supabase
        .from('follow_ups')
        .select('*')
        .order('follow_up_date', { ascending: true });
      if (!error && data) return data as FollowUp[];
    } catch (err) {
      console.warn('Fallback to file for getFollowUps', err);
    }
  }

  const db = await ensureDataLoaded();
  return db.follow_ups.filter(f => !userId || f.user_id === userId);
}

export async function createFollowUp(
  data: Omit<FollowUp, 'id' | 'created_at'>
): Promise<FollowUp> {
  const supabase = getSupabase();
  let resolvedUserId = data.user_id;
  if (supabase) {
    try {
      const { data: authData } = await supabase.auth.getUser();
      if (authData?.user?.id) {
        resolvedUserId = authData.user.id;
      }
    } catch {}
  }

  const newFollowUp: FollowUp = {
    ...data,
    user_id: resolvedUserId,
    id: generateUUID(),
    created_at: new Date().toISOString()
  };

  if (supabase) {
    try {
      const { data: res, error } = await supabase
        .from('follow_ups')
        .insert([newFollowUp])
        .select()
        .single();
      if (error) notifySupabaseError('Follow-up create', error);
      if (!error && res) return res as FollowUp;
    } catch (err) {
      console.warn('Fallback to file for createFollowUp', err);
      notifySupabaseError('Follow-up create', err);
    }
  }

  const db = await ensureDataLoaded();
  db.follow_ups.unshift(newFollowUp);
  await saveToFileDisk(db);
  return newFollowUp;
}

export async function updateFollowUp(
  id: string,
  updates: Partial<FollowUp>
): Promise<FollowUp | null> {
  const supabase = getSupabase();
  if (supabase) {
    try {
      const { data, error } = await supabase
        .from('follow_ups')
        .update(updates)
        .eq('id', id)
        .select()
        .single();
      if (error) notifySupabaseError('Follow-up update', error);
      if (!error && data) return data as FollowUp;
    } catch (err) {
      console.warn('Fallback to file for updateFollowUp', err);
      notifySupabaseError('Follow-up update', err);
    }
  }

  const db = await ensureDataLoaded();
  const idx = db.follow_ups.findIndex(f => f.id === id);
  if (idx !== -1) {
    db.follow_ups[idx] = { ...db.follow_ups[idx], ...updates };
    await saveToFileDisk(db);
    return db.follow_ups[idx];
  }
  return null;
}

export async function deleteFollowUp(id: string): Promise<boolean> {
  const supabase = getSupabase();
  if (supabase) {
    try {
      const { error } = await supabase.from('follow_ups').delete().eq('id', id);
      if (error) notifySupabaseError('Follow-up delete', error);
      if (!error) return true;
    } catch (err) {
      console.warn('Fallback to file for deleteFollowUp', err);
      notifySupabaseError('Follow-up delete', err);
    }
  }

  const db = await ensureDataLoaded();
  db.follow_ups = db.follow_ups.filter(f => f.id !== id);
  await saveToFileDisk(db);
  return true;
}

export async function syncAllLocalDataToSupabase(): Promise<{
  success: boolean;
  message: string;
  counts?: { agencies: number; visits: number; opportunities: number };
}> {
  const supabase = getSupabase();
  if (!supabase) {
    return { success: false, message: 'Supabase is not connected. Check credentials in Settings.' };
  }

  try {
    const db = await ensureDataLoaded();

    // Verify agencies table existence
    const { error: testErr } = await supabase.from('agencies').select('id', { head: true, count: 'exact' });
    if (testErr) {
      if (testErr.code === '42P01' || testErr.message?.includes('does not exist')) {
        return {
          success: false,
          message: 'PostgreSQL tables not found in Supabase. Please copy and run schema.sql in your Supabase SQL Editor.'
        };
      }
      return { success: false, message: `Supabase error: ${testErr.message}` };
    }

    // 1. Sync Agencies
    if (db.agencies.length > 0) {
      const { error } = await supabase.from('agencies').upsert(db.agencies, { onConflict: 'id' });
      if (error) throw new Error(`Agencies sync failed: ${error.message}`);
    }

    // 2. Sync Visits
    if (db.visits.length > 0) {
      const { error } = await supabase.from('visits').upsert(db.visits, { onConflict: 'id' });
      if (error) throw new Error(`Visits sync failed: ${error.message}`);
    }

    // 3. Sync Opportunities (strip joined objects)
    if (db.opportunities.length > 0) {
      const cleanOpps = db.opportunities.map(o => {
        const copy = { ...o };
        delete (copy as any).agency;
        delete (copy as any).visit;
        delete (copy as any).costs;
        delete (copy as any).documents;
        delete (copy as any).payment_terms;
        delete (copy as any).verification_items;
        delete (copy as any).follow_ups;
        return copy;
      });
      const { error } = await supabase.from('opportunities').upsert(cleanOpps, { onConflict: 'id' });
      if (error) throw new Error(`Opportunities sync failed: ${error.message}`);
    }

    // 4. Sync Costs
    if (db.costs.length > 0) {
      const { error } = await supabase.from('opportunity_costs').upsert(db.costs, { onConflict: 'id' });
      if (error) throw new Error(`Opportunity costs sync failed: ${error.message}`);
    }

    // 5. Sync Documents
    if (db.documents.length > 0) {
      const { error } = await supabase.from('opportunity_documents').upsert(db.documents, { onConflict: 'id' });
      if (error) throw new Error(`Opportunity documents sync failed: ${error.message}`);
    }

    // 6. Sync Payment Terms
    if (db.payment_terms.length > 0) {
      const { error } = await supabase.from('payment_terms').upsert(db.payment_terms, { onConflict: 'id' });
      if (error) throw new Error(`Payment terms sync failed: ${error.message}`);
    }

    // 7. Sync Verification Items
    if (db.verification_items.length > 0) {
      const { error } = await supabase.from('verification_items').upsert(db.verification_items, { onConflict: 'id' });
      if (error) throw new Error(`Verification items sync failed: ${error.message}`);
    }

    // 8. Sync Follow-ups
    if (db.follow_ups.length > 0) {
      const { error } = await supabase.from('follow_ups').upsert(db.follow_ups, { onConflict: 'id' });
      if (error) throw new Error(`Follow-ups sync failed: ${error.message}`);
    }

    return {
      success: true,
      message: `Successfully synchronized ${db.agencies.length} agencies, ${db.visits.length} visits, and ${db.opportunities.length} opportunities to Supabase!`,
      counts: {
        agencies: db.agencies.length,
        visits: db.visits.length,
        opportunities: db.opportunities.length
      }
    };
  } catch (err: any) {
    return {
      success: false,
      message: err.message || 'Sync operation failed'
    };
  }
}

// DEMO DATA CONTROLS
export async function loadDemoData(userId: string) {
  const demo = generateDemoData(userId);
  await clearDemoData(userId);

  const db = await ensureDataLoaded();
  db.agencies.unshift(...demo.agencies);
  db.visits.unshift(...demo.visits);
  db.opportunities.unshift(...demo.opportunities);
  db.costs.unshift(...demo.costs);
  db.documents.unshift(...demo.documents);
  db.payment_terms.unshift(...demo.paymentTerms);
  db.verification_items.unshift(...demo.verificationItems);
  db.follow_ups.unshift(...demo.followUps);

  await saveToFileDisk(db);
}

export async function clearDemoData(userId: string) {
  const db = await ensureDataLoaded();
  const demoOppIds = new Set(db.opportunities.filter(o => o.is_demo).map(o => o.id));

  db.agencies = db.agencies.filter(a => !a.name.includes('[DEMO DATA]'));
  db.visits = db.visits.filter(v => !v.id.startsWith('demo-'));
  db.opportunities = db.opportunities.filter(o => !o.is_demo);
  db.costs = db.costs.filter(c => !demoOppIds.has(c.opportunity_id));
  db.documents = db.documents.filter(d => !demoOppIds.has(d.opportunity_id));
  db.payment_terms = db.payment_terms.filter(p => !demoOppIds.has(p.opportunity_id));
  db.verification_items = db.verification_items.filter(v => !demoOppIds.has(v.opportunity_id));
  db.follow_ups = db.follow_ups.filter(f => !demoOppIds.has(f.opportunity_id));

  await saveToFileDisk(db);
}

export async function clearAllData(userId?: string) {
  const emptyDb: FileDatabase = {
    agencies: [],
    visits: [],
    opportunities: [],
    costs: [],
    documents: [],
    payment_terms: [],
    verification_items: [],
    follow_ups: []
  };
  await saveToFileDisk(emptyDb);
  localStorage.removeItem('mph_wizard_draft_v1');
}
