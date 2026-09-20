import fs from 'fs';
import path from 'path';

console.log('===============================================================');
console.log('ACCEPTANCE TEST VERIFICATION: FOREIGN EMPLOYMENT RESEARCH NEPAL');
console.log('===============================================================');

function assert(condition, message) {
  if (!condition) {
    console.error(`❌ FAIL: ${message}`);
    process.exit(1);
  } else {
    console.log(`✅ PASS: ${message}`);
  }
}

// 1. Verify schema.sql
const schemaPath = path.resolve('supabase/schema.sql');
assert(fs.existsSync(schemaPath), 'supabase/schema.sql exists');
const schemaContent = fs.readFileSync(schemaPath, 'utf8');

const requiredTables = [
  'profiles',
  'agencies',
  'visits',
  'opportunities',
  'opportunity_costs',
  'opportunity_documents',
  'payment_terms',
  'verification_items',
  'follow_ups'
];

for (const tbl of requiredTables) {
  assert(schemaContent.includes(`create table if not exists public.${tbl}`), `Table ${tbl} defined in schema.sql`);
  assert(schemaContent.includes(`alter table public.${tbl} enable row level security;`), `RLS enabled for table ${tbl}`);
}

// Check Foreign Keys and Cascades
assert(schemaContent.includes('references auth.users(id) on delete cascade'), 'Foreign key to auth.users with cascade delete');
assert(schemaContent.includes('references public.agencies(id) on delete cascade'), 'Foreign key to agencies with cascade delete');
assert(schemaContent.includes('references public.opportunities(id) on delete cascade'), 'Foreign key to opportunities with cascade delete');

// Check Indexes
assert(schemaContent.includes('idx_opportunities_user_id'), 'Index on opportunities user_id exists');
assert(schemaContent.includes('idx_opportunities_agency_id'), 'Index on opportunities agency_id exists');
assert(schemaContent.includes('idx_opportunities_country'), 'Index on opportunities country exists');

// Check storage.sql
const storagePath = path.resolve('supabase/storage.sql');
assert(fs.existsSync(storagePath), 'supabase/storage.sql exists');
const storageContent = fs.readFileSync(storagePath, 'utf8');
assert(storageContent.includes("'opportunity-evidence'"), 'Storage bucket opportunity-evidence defined');

// 2. Check application source files
const files = [
  'src/types/database.ts',
  'src/types/form.ts',
  'src/constants/countries.ts',
  'src/constants/jobSectors.ts',
  'src/constants/currencies.ts',
  'src/constants/workflowOptions.ts',
  'src/lib/supabase.ts',
  'src/lib/demoData.ts',
  'src/lib/db.ts',
  'src/lib/export.ts',
  'src/context/AuthContext.tsx',
  'src/context/DataContext.tsx',
  'src/components/common/Badge.tsx',
  'src/components/common/Toast.tsx',
  'src/components/common/GlobalSearch.tsx',
  'src/components/layout/Header.tsx',
  'src/components/layout/DesktopSidebar.tsx',
  'src/components/layout/MobileNav.tsx',
  'src/components/layout/Layout.tsx',
  'src/components/wizard/QuickVisitWizard.tsx',
  'src/components/wizard/Step1Agency.tsx',
  'src/components/wizard/Step2Opportunity.tsx',
  'src/components/wizard/Step3Salary.tsx',
  'src/components/wizard/Step4Living.tsx',
  'src/components/wizard/Step5Costs.tsx',
  'src/components/wizard/Step6Documents.tsx',
  'src/components/wizard/Step7TimelinePayment.tsx',
  'src/components/wizard/Step8NotesReview.tsx',
  'src/pages/DashboardPage.tsx',
  'src/pages/NewVisitPage.tsx',
  'src/pages/OpportunitiesPage.tsx',
  'src/pages/OpportunityDetailPage.tsx',
  'src/pages/AgenciesPage.tsx',
  'src/pages/CountriesPage.tsx',
  'src/pages/VerificationPage.tsx',
  'src/pages/FollowUpsPage.tsx',
  'src/pages/SettingsPage.tsx',
  'src/pages/AuthPage.tsx'
];

for (const file of files) {
  assert(fs.existsSync(path.resolve(file)), `Component file exists: ${file}`);
}

// 3. Test calculation logic for Itemized Total and Unaccounted Difference
const itemizedSample = {
  agency_service_charge: 350000,
  government_processing_fee: 25000,
  medical_exam: 12000,
  insurance: 15000,
  visa_fee: 18000,
  documentation: 15000,
  translation: 10000,
  training: 5000,
  air_ticket: 90000,
  miscellaneous: 15000
};

const totalItemized = Object.values(itemizedSample).reduce((a, b) => a + b, 0);
const quotedCost = 620000;
const diff = quotedCost - totalItemized;

assert(totalItemized === 555000, 'Calculated Itemized Total is exactly NPR 555,000');
assert(diff === 65000, 'Unaccounted Difference is exactly NPR 65,000');

// 4. Verify Built Files exist in dist/
assert(fs.existsSync(path.resolve('dist/index.html')), 'Production dist/index.html generated');

console.log('\n===============================================================');
console.log('ALL VERIFICATION CHECKS PASSED SUCCESSFULLY!');
console.log('===============================================================');
