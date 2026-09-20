-- ==============================================================================
-- Supabase Storage Bucket Setup for Opportunity Evidence Documents & Photos
-- ==============================================================================

-- Create private bucket for opportunity evidence
insert into storage.buckets (id, name, public)
values ('opportunity-evidence', 'opportunity-evidence', true)
on conflict (id) do nothing;

-- Storage policies: Authenticated users can upload to their user folder or opportunity folder
create policy "Authenticated users can upload opportunity evidence"
  on storage.objects for insert
  to authenticated
  with check (bucket_id = 'opportunity-evidence');

create policy "Authenticated users can read opportunity evidence"
  on storage.objects for select
  to authenticated
  using (bucket_id = 'opportunity-evidence');

create policy "Authenticated users can update own opportunity evidence"
  on storage.objects for update
  to authenticated
  using (bucket_id = 'opportunity-evidence');

create policy "Authenticated users can delete own opportunity evidence"
  on storage.objects for delete
  to authenticated
  using (bucket_id = 'opportunity-evidence');
