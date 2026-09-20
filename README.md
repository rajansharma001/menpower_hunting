# Foreign Employment / Manpower Research — Nepal

A private, mobile-first web application for personally researching manpower recruitment agencies and overseas employment opportunities in Nepal.

---

## Key Features

1. **Quick Visit Wizard (Mobile-First 8-Step Flow)**
   - Designed for fast in-person recording inside manpower offices in Kathmandu (2–3 minutes average).
   - Sticky bottom controls, large 44px+ tap targets, numeric inputs, auto-draft recovery in local storage.
   - Support for multiple opportunities under a single agency visit with 1-click `+ Add Another Opportunity`.
   - Real-time **Calculated Itemized Total** vs **Agency Quoted Total** with neutral **Unaccounted Difference** labeling.

2. **Supabase PostgreSQL & Security**
   - Relational database schema with primary and foreign keys, composite indexes, and `ON DELETE CASCADE`.
   - Complete Row Level Security (RLS) policies ensuring complete multi-tenant privacy (`auth.uid() = user_id`).
   - Storage bucket `opportunity-evidence` configured with user upload policies.
   - Built-in zero-config local engine allows immediate usage out-of-the-box, with seamless Supabase URL and key configuration in the Settings page.

3. **Comparison Matrix & Aggregates**
   - Filter by destination Country, Job Sector, Currency, Permit Status, Evidence Status, Agency, Accommodation, and Maximum Quoted Cost.
   - High-density comparison table on desktop; responsive, expandable comparison cards on mobile.
   - Centralized country aggregator with salary ranges, cost ranges, common sectors, and accommodation patterns.

4. **Post-Visit Research Workspace**
   - **Verification Center**: Dedicated checklist workspace for verifying DoFE licenses, employer registration on foreign commercial registers, work permit authentications, and contracts.
   - **Follow-up Tracker**: Categorized tabs for *Today's Due*, *Overdue*, *Upcoming*, and *Completed* actions.
   - **Agencies Directory**: Record counselor details, DoFE license numbers, contact info, and view all opportunities recorded per agency.
   - **Global Search**: Fast search across agencies, jobs, employers, contacts, and notes (<kbd>Ctrl+K</kbd>).

5. **Data Ownership & Export**
   - Export Opportunities and Agencies to CSV.
   - Multi-sheet Excel workbook export (`.xlsx`).
   - Complete unified research dataset export in standard JSON format.

---

## Running the Application

### Development Server
```bash
npm run dev
```
Open [http://localhost:5173](http://localhost:5173) in your browser.

### Production Build
```bash
npm run build
npm run preview
```

---

## Supabase PostgreSQL Setup

1. Create a project at [supabase.com](https://supabase.com).
2. Go to the **SQL Editor** in your Supabase dashboard.
3. Copy and run the contents of [`supabase/schema.sql`](supabase/schema.sql).
4. Run the storage setup from [`supabase/storage.sql`](supabase/storage.sql).
5. In the app, navigate to **Settings** and enter your Supabase **Project URL** and **Anon Key**, then click **Save & Apply**.
