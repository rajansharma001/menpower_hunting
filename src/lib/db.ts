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
  VerificationStatus,
  FollowUpStatus
} from '../types/database';
import { WizardFormData } from '../types/form';
import { getSupabase } from './supabase';
import { generateDemoData } from './demoData';
import { DEFAULT_VERIFICATION_ITEMS } from '../constants/workflowOptions';

const STORAGE_KEYS = {
  AGENCIES: 'mph_agencies',
  VISITS: 'mph_visits',
  OPPORTUNITIES: 'mph_opportunities',
  COSTS: 'mph_costs',
  DOCUMENTS: 'mph_documents',
  PAYMENT_TERMS: 'mph_payment_terms',
  VERIFICATION_ITEMS: 'mph_verification_items',
  FOLLOW_UPS: 'mph_follow_ups',
  IS_INITIALIZED: 'mph_is_initialized'
};

function readLocal<T>(key: string): T[] {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : [];
  } catch (e) {
    console.error(`Error reading ${key} from localStorage`, e);
    return [];
  }
}

function writeLocal<T>(key: string, data: T[]): void {
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch (e) {
    console.error(`Error writing ${key} to localStorage`, e);
  }
}

// Mark local database initialized and wipe previous demo data
export function initializeLocalDatabase(userId: string) {
  const resetFlag = 'mph_cleared_previous_v2';
  if (!localStorage.getItem(resetFlag)) {
    clearAllData();
    localStorage.setItem(resetFlag, 'true');
  }
  localStorage.setItem(`${STORAGE_KEYS.IS_INITIALIZED}_${userId}`, 'true');
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
      console.warn('Falling back to local storage for getAgencies', err);
    }
  }

  const list = readLocal<Agency>(STORAGE_KEYS.AGENCIES);
  return list.filter(a => a.user_id === userId);
}

export async function createAgency(agencyData: Omit<Agency, 'id' | 'created_at' | 'updated_at'>): Promise<Agency> {
  const supabase = getSupabase();
  const now = new Date().toISOString();

  if (supabase) {
    try {
      const { data, error } = await supabase
        .from('agencies')
        .insert([{ ...agencyData, created_at: now, updated_at: now }])
        .select()
        .single();
      if (!error && data) return data as Agency;
    } catch (err) {
      console.warn('Falling back to local storage for createAgency', err);
    }
  }

  const newAgency: Agency = {
    ...agencyData,
    id: 'agency_' + Math.random().toString(36).substring(2, 9) + '_' + Date.now(),
    created_at: now,
    updated_at: now,
  };

  const list = readLocal<Agency>(STORAGE_KEYS.AGENCIES);
  list.unshift(newAgency);
  writeLocal(STORAGE_KEYS.AGENCIES, list);
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
      if (!error && data) return data as Agency;
    } catch (err) {
      console.warn('Falling back to local storage for updateAgency', err);
    }
  }

  const list = readLocal<Agency>(STORAGE_KEYS.AGENCIES);
  const idx = list.findIndex(a => a.id === id);
  if (idx !== -1) {
    list[idx] = { ...list[idx], ...updates, updated_at: now };
    writeLocal(STORAGE_KEYS.AGENCIES, list);
    return list[idx];
  }
  return null;
}

export async function deleteAgency(id: string): Promise<boolean> {
  const supabase = getSupabase();
  if (supabase) {
    try {
      const { error } = await supabase.from('agencies').delete().eq('id', id);
      if (!error) return true;
    } catch (err) {
      console.warn('Falling back to local storage for deleteAgency', err);
    }
  }

  let list = readLocal<Agency>(STORAGE_KEYS.AGENCIES);
  list = list.filter(a => a.id !== id);
  writeLocal(STORAGE_KEYS.AGENCIES, list);

  // Cascade delete opportunities associated with this agency
  let opps = readLocal<Opportunity>(STORAGE_KEYS.OPPORTUNITIES);
  opps = opps.filter(o => o.agency_id !== id);
  writeLocal(STORAGE_KEYS.OPPORTUNITIES, opps);

  return true;
}

export async function createVisit(visitData: Omit<Visit, 'id' | 'created_at' | 'updated_at'>): Promise<Visit> {
  const supabase = getSupabase();
  const now = new Date().toISOString();

  if (supabase) {
    try {
      const { data, error } = await supabase
        .from('visits')
        .insert([{ ...visitData, created_at: now, updated_at: now }])
        .select()
        .single();
      if (!error && data) return data as Visit;
    } catch (err) {
      console.warn('Falling back to local storage for createVisit', err);
    }
  }

  const newVisit: Visit = {
    ...visitData,
    id: 'visit_' + Math.random().toString(36).substring(2, 9) + '_' + Date.now(),
    created_at: now,
    updated_at: now,
  };

  const list = readLocal<Visit>(STORAGE_KEYS.VISITS);
  list.unshift(newVisit);
  writeLocal(STORAGE_KEYS.VISITS, list);
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
      console.warn('Falling back to local storage for getVisits', err);
    }
  }

  const list = readLocal<Visit>(STORAGE_KEYS.VISITS);
  return list.filter(v => v.user_id === userId);
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
      console.warn('Falling back to local storage for getOpportunities', err);
    }
  }

  const opps = readLocal<Opportunity>(STORAGE_KEYS.OPPORTUNITIES).filter(o => o.user_id === userId);
  const agencies = readLocal<Agency>(STORAGE_KEYS.AGENCIES);
  const visits = readLocal<Visit>(STORAGE_KEYS.VISITS);
  const costs = readLocal<OpportunityCost>(STORAGE_KEYS.COSTS);
  const documents = readLocal<OpportunityDocument>(STORAGE_KEYS.DOCUMENTS);
  const paymentTerms = readLocal<PaymentTerm>(STORAGE_KEYS.PAYMENT_TERMS);
  const verificationItems = readLocal<VerificationItem>(STORAGE_KEYS.VERIFICATION_ITEMS);
  const followUps = readLocal<FollowUp>(STORAGE_KEYS.FOLLOW_UPS);

  return opps.map(opp => ({
    ...opp,
    agency: agencies.find(a => a.id === opp.agency_id),
    visit: visits.find(v => v.id === opp.visit_id),
    costs: costs.find(c => c.opportunity_id === opp.id),
    documents: documents.filter(d => d.opportunity_id === opp.id),
    payment_terms: paymentTerms.filter(p => p.opportunity_id === opp.id),
    verification_items: verificationItems.filter(v => v.opportunity_id === opp.id),
    follow_ups: followUps.filter(f => f.opportunity_id === opp.id)
  }));
}

export async function getOpportunity(id: string): Promise<OpportunityComplete | null> {
  const opps = await getOpportunities('');
  // When calling getOpportunities locally or in supabase, find by ID
  const allOpps = readLocal<Opportunity>(STORAGE_KEYS.OPPORTUNITIES);
  const opp = allOpps.find(o => o.id === id);
  if (!opp) {
    // If not found in local, check via supabase
    const supabase = getSupabase();
    if (supabase) {
      try {
        const { data, error } = await supabase
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
          .eq('id', id)
          .single();
        if (!error && data) {
          return {
            ...data,
            costs: Array.isArray(data.costs) ? data.costs[0] : data.costs
          } as OpportunityComplete;
        }
      } catch (err) {
        console.warn('Error fetching opportunity by ID', err);
      }
    }
    return null;
  }

  const agencies = readLocal<Agency>(STORAGE_KEYS.AGENCIES);
  const visits = readLocal<Visit>(STORAGE_KEYS.VISITS);
  const costs = readLocal<OpportunityCost>(STORAGE_KEYS.COSTS);
  const documents = readLocal<OpportunityDocument>(STORAGE_KEYS.DOCUMENTS);
  const paymentTerms = readLocal<PaymentTerm>(STORAGE_KEYS.PAYMENT_TERMS);
  const verificationItems = readLocal<VerificationItem>(STORAGE_KEYS.VERIFICATION_ITEMS);
  const followUps = readLocal<FollowUp>(STORAGE_KEYS.FOLLOW_UPS);

  return {
    ...opp,
    agency: agencies.find(a => a.id === opp.agency_id),
    visit: visits.find(v => v.id === opp.visit_id),
    costs: costs.find(c => c.opportunity_id === opp.id),
    documents: documents.filter(d => d.opportunity_id === opp.id),
    payment_terms: paymentTerms.filter(p => p.opportunity_id === opp.id),
    verification_items: verificationItems.filter(v => v.opportunity_id === opp.id),
    follow_ups: followUps.filter(f => f.opportunity_id === opp.id)
  };
}

export async function deleteOpportunity(id: string): Promise<boolean> {
  const supabase = getSupabase();
  if (supabase) {
    try {
      const { error } = await supabase.from('opportunities').delete().eq('id', id);
      if (!error) return true;
    } catch (err) {
      console.warn('Falling back to local storage for deleteOpportunity', err);
    }
  }

  let opps = readLocal<Opportunity>(STORAGE_KEYS.OPPORTUNITIES);
  opps = opps.filter(o => o.id !== id);
  writeLocal(STORAGE_KEYS.OPPORTUNITIES, opps);

  let costs = readLocal<OpportunityCost>(STORAGE_KEYS.COSTS);
  costs = costs.filter(c => c.opportunity_id !== id);
  writeLocal(STORAGE_KEYS.COSTS, costs);

  let docs = readLocal<OpportunityDocument>(STORAGE_KEYS.DOCUMENTS);
  docs = docs.filter(d => d.opportunity_id !== id);
  writeLocal(STORAGE_KEYS.DOCUMENTS, docs);

  let pt = readLocal<PaymentTerm>(STORAGE_KEYS.PAYMENT_TERMS);
  pt = pt.filter(p => p.opportunity_id !== id);
  writeLocal(STORAGE_KEYS.PAYMENT_TERMS, pt);

  let vi = readLocal<VerificationItem>(STORAGE_KEYS.VERIFICATION_ITEMS);
  vi = vi.filter(v => v.opportunity_id !== id);
  writeLocal(STORAGE_KEYS.VERIFICATION_ITEMS, vi);

  let fu = readLocal<FollowUp>(STORAGE_KEYS.FOLLOW_UPS);
  fu = fu.filter(f => f.opportunity_id !== id);
  writeLocal(STORAGE_KEYS.FOLLOW_UPS, fu);

  return true;
}

export async function saveOpportunityComplete(
  userId: string,
  formData: WizardFormData,
  existingAgencyId?: string,
  existingVisitId?: string
): Promise<{ opportunityId: string; agencyId: string; visitId: string }> {
  const now = new Date().toISOString();

  // 1. Resolve or Create Agency
  let agencyId = existingAgencyId || formData.agency_id;
  if (!agencyId) {
    const existingAgencies = await getAgencies(userId);
    const matched = existingAgencies.find(
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
  const opportunityId = 'opp_' + Math.random().toString(36).substring(2, 9) + '_' + Date.now();
  const oppRecord: Opportunity = {
    id: opportunityId,
    user_id: userId,
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
    id: 'cost_' + Math.random().toString(36).substring(2, 9) + '_' + Date.now(),
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
      id: 'doc_' + Math.random().toString(36).substring(2, 9) + '_' + Date.now(),
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
    id: 'pay_' + Math.random().toString(36).substring(2, 9) + '_' + Date.now(),
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
    id: 'ver_' + Math.random().toString(36).substring(2, 9) + '_' + Date.now(),
    opportunity_id: opportunityId,
    item: item,
    status: 'Needs Verification',
    created_at: now
  }));

  // Persist to Supabase if client active
  const supabase = getSupabase();
  if (supabase) {
    try {
      await supabase.from('opportunities').insert([oppRecord]);
      await supabase.from('opportunity_costs').insert([costRecord]);
      if (docRecords.length > 0) await supabase.from('opportunity_documents').insert(docRecords);
      if (paymentRecords.length > 0) await supabase.from('payment_terms').insert(paymentRecords);
      if (verificationRecords.length > 0) await supabase.from('verification_items').insert(verificationRecords);
    } catch (err) {
      console.warn('Falling back to local storage for saveOpportunityComplete', err);
    }
  }

  // Also keep local state updated
  const oppList = readLocal<Opportunity>(STORAGE_KEYS.OPPORTUNITIES);
  oppList.unshift(oppRecord);
  writeLocal(STORAGE_KEYS.OPPORTUNITIES, oppList);

  const costList = readLocal<OpportunityCost>(STORAGE_KEYS.COSTS);
  costList.unshift(costRecord);
  writeLocal(STORAGE_KEYS.COSTS, costList);

  const docList = readLocal<OpportunityDocument>(STORAGE_KEYS.DOCUMENTS);
  writeLocal(STORAGE_KEYS.DOCUMENTS, [...docRecords, ...docList]);

  const payList = readLocal<PaymentTerm>(STORAGE_KEYS.PAYMENT_TERMS);
  writeLocal(STORAGE_KEYS.PAYMENT_TERMS, [...paymentRecords, ...payList]);

  const verList = readLocal<VerificationItem>(STORAGE_KEYS.VERIFICATION_ITEMS);
  writeLocal(STORAGE_KEYS.VERIFICATION_ITEMS, [...verificationRecords, ...verList]);

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
      if (!error && data) return data as VerificationItem;
    } catch (err) {
      console.warn('Fallback to local for updateVerificationItem', err);
    }
  }

  const list = readLocal<VerificationItem>(STORAGE_KEYS.VERIFICATION_ITEMS);
  const idx = list.findIndex(v => v.id === id);
  if (idx !== -1) {
    list[idx] = { ...list[idx], ...updates };
    writeLocal(STORAGE_KEYS.VERIFICATION_ITEMS, list);
    return list[idx];
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
    id: 'ver_' + Math.random().toString(36).substring(2, 9) + '_' + Date.now(),
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
      if (!error && data) return data as VerificationItem;
    } catch (err) {
      console.warn('Fallback to local for addVerificationItem', err);
    }
  }

  const list = readLocal<VerificationItem>(STORAGE_KEYS.VERIFICATION_ITEMS);
  list.unshift(newItem);
  writeLocal(STORAGE_KEYS.VERIFICATION_ITEMS, list);
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
      console.warn('Fallback to local for getFollowUps', err);
    }
  }

  const list = readLocal<FollowUp>(STORAGE_KEYS.FOLLOW_UPS);
  return list.filter(f => f.user_id === userId);
}

export async function createFollowUp(
  data: Omit<FollowUp, 'id' | 'created_at'>
): Promise<FollowUp> {
  const supabase = getSupabase();
  const newFollowUp: FollowUp = {
    ...data,
    id: 'fol_' + Math.random().toString(36).substring(2, 9) + '_' + Date.now(),
    created_at: new Date().toISOString()
  };

  if (supabase) {
    try {
      const { data: res, error } = await supabase
        .from('follow_ups')
        .insert([newFollowUp])
        .select()
        .single();
      if (!error && res) return res as FollowUp;
    } catch (err) {
      console.warn('Fallback to local for createFollowUp', err);
    }
  }

  const list = readLocal<FollowUp>(STORAGE_KEYS.FOLLOW_UPS);
  list.unshift(newFollowUp);
  writeLocal(STORAGE_KEYS.FOLLOW_UPS, list);
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
      if (!error && data) return data as FollowUp;
    } catch (err) {
      console.warn('Fallback to local for updateFollowUp', err);
    }
  }

  const list = readLocal<FollowUp>(STORAGE_KEYS.FOLLOW_UPS);
  const idx = list.findIndex(f => f.id === id);
  if (idx !== -1) {
    list[idx] = { ...list[idx], ...updates };
    writeLocal(STORAGE_KEYS.FOLLOW_UPS, list);
    return list[idx];
  }
  return null;
}

export async function deleteFollowUp(id: string): Promise<boolean> {
  const supabase = getSupabase();
  if (supabase) {
    try {
      const { error } = await supabase.from('follow_ups').delete().eq('id', id);
      if (!error) return true;
    } catch (err) {
      console.warn('Fallback to local for deleteFollowUp', err);
    }
  }

  let list = readLocal<FollowUp>(STORAGE_KEYS.FOLLOW_UPS);
  list = list.filter(f => f.id !== id);
  writeLocal(STORAGE_KEYS.FOLLOW_UPS, list);
  return true;
}

// DEMO DATA MANAGEMENT
export function loadDemoData(userId: string) {
  const demo = generateDemoData(userId);

  // Filter out any existing demo data first
  clearDemoData(userId);

  const existingAgencies = readLocal<Agency>(STORAGE_KEYS.AGENCIES);
  writeLocal(STORAGE_KEYS.AGENCIES, [...demo.agencies, ...existingAgencies]);

  const existingVisits = readLocal<Visit>(STORAGE_KEYS.VISITS);
  writeLocal(STORAGE_KEYS.VISITS, [...demo.visits, ...existingVisits]);

  const existingOpps = readLocal<Opportunity>(STORAGE_KEYS.OPPORTUNITIES);
  writeLocal(STORAGE_KEYS.OPPORTUNITIES, [...demo.opportunities, ...existingOpps]);

  const existingCosts = readLocal<OpportunityCost>(STORAGE_KEYS.COSTS);
  writeLocal(STORAGE_KEYS.COSTS, [...demo.costs, ...existingCosts]);

  const existingDocs = readLocal<OpportunityDocument>(STORAGE_KEYS.DOCUMENTS);
  writeLocal(STORAGE_KEYS.DOCUMENTS, [...demo.documents, ...existingDocs]);

  const existingPay = readLocal<PaymentTerm>(STORAGE_KEYS.PAYMENT_TERMS);
  writeLocal(STORAGE_KEYS.PAYMENT_TERMS, [...demo.paymentTerms, ...existingPay]);

  const existingVer = readLocal<VerificationItem>(STORAGE_KEYS.VERIFICATION_ITEMS);
  writeLocal(STORAGE_KEYS.VERIFICATION_ITEMS, [...demo.verificationItems, ...existingVer]);

  const existingFol = readLocal<FollowUp>(STORAGE_KEYS.FOLLOW_UPS);
  writeLocal(STORAGE_KEYS.FOLLOW_UPS, [...demo.followUps, ...existingFol]);
}

export function clearDemoData(userId: string) {
  const opps = readLocal<Opportunity>(STORAGE_KEYS.OPPORTUNITIES);
  const demoOppIds = new Set(opps.filter(o => o.is_demo).map(o => o.id));

  writeLocal(
    STORAGE_KEYS.AGENCIES,
    readLocal<Agency>(STORAGE_KEYS.AGENCIES).filter(a => !a.name.includes('[DEMO DATA]'))
  );

  writeLocal(
    STORAGE_KEYS.VISITS,
    readLocal<Visit>(STORAGE_KEYS.VISITS).filter(v => !v.id.startsWith('demo-'))
  );

  writeLocal(
    STORAGE_KEYS.OPPORTUNITIES,
    opps.filter(o => !o.is_demo)
  );

  writeLocal(
    STORAGE_KEYS.COSTS,
    readLocal<OpportunityCost>(STORAGE_KEYS.COSTS).filter(c => !demoOppIds.has(c.opportunity_id))
  );

  writeLocal(
    STORAGE_KEYS.DOCUMENTS,
    readLocal<OpportunityDocument>(STORAGE_KEYS.DOCUMENTS).filter(d => !demoOppIds.has(d.opportunity_id))
  );

  writeLocal(
    STORAGE_KEYS.PAYMENT_TERMS,
    readLocal<PaymentTerm>(STORAGE_KEYS.PAYMENT_TERMS).filter(p => !demoOppIds.has(p.opportunity_id))
  );

  writeLocal(
    STORAGE_KEYS.VERIFICATION_ITEMS,
    readLocal<VerificationItem>(STORAGE_KEYS.VERIFICATION_ITEMS).filter(v => !demoOppIds.has(v.opportunity_id))
  );

  writeLocal(
    STORAGE_KEYS.FOLLOW_UPS,
    readLocal<FollowUp>(STORAGE_KEYS.FOLLOW_UPS).filter(f => !demoOppIds.has(f.opportunity_id))
  );
}

export function clearAllData(userId?: string) {
  if (userId) {
    writeLocal(STORAGE_KEYS.AGENCIES, readLocal<Agency>(STORAGE_KEYS.AGENCIES).filter(a => a.user_id !== userId));
    writeLocal(STORAGE_KEYS.VISITS, readLocal<Visit>(STORAGE_KEYS.VISITS).filter(v => v.user_id !== userId));
    writeLocal(STORAGE_KEYS.OPPORTUNITIES, readLocal<Opportunity>(STORAGE_KEYS.OPPORTUNITIES).filter(o => o.user_id !== userId));
    writeLocal(STORAGE_KEYS.FOLLOW_UPS, readLocal<FollowUp>(STORAGE_KEYS.FOLLOW_UPS).filter(f => f.user_id !== userId));
  } else {
    localStorage.removeItem(STORAGE_KEYS.AGENCIES);
    localStorage.removeItem(STORAGE_KEYS.VISITS);
    localStorage.removeItem(STORAGE_KEYS.OPPORTUNITIES);
    localStorage.removeItem(STORAGE_KEYS.FOLLOW_UPS);
  }
  localStorage.removeItem(STORAGE_KEYS.COSTS);
  localStorage.removeItem(STORAGE_KEYS.DOCUMENTS);
  localStorage.removeItem(STORAGE_KEYS.PAYMENT_TERMS);
  localStorage.removeItem(STORAGE_KEYS.VERIFICATION_ITEMS);
  localStorage.removeItem('mph_wizard_draft_v1');
}
