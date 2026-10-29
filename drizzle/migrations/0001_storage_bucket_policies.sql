-- listing-photos: owner-folder uploads, public can read via signed URLs minted by the app
create policy "Users upload own listing photos"
on storage.objects for insert to authenticated
with check (bucket_id = 'listing-photos' and (storage.foldername(name))[1] = auth.uid()::text);

create policy "Users update own listing photos"
on storage.objects for update to authenticated
using (bucket_id = 'listing-photos' and (storage.foldername(name))[1] = auth.uid()::text);

create policy "Users delete own listing photos"
on storage.objects for delete to authenticated
using (bucket_id = 'listing-photos' and (storage.foldername(name))[1] = auth.uid()::text);

create policy "Service manages listing photos"
on storage.objects for all to service_role
using (bucket_id = 'listing-photos') with check (bucket_id = 'listing-photos');

-- analysis-photos: strictly owner-only
create policy "Users upload own analysis photos"
on storage.objects for insert to authenticated
with check (bucket_id = 'analysis-photos' and (storage.foldername(name))[1] = auth.uid()::text);

create policy "Users read own analysis photos"
on storage.objects for select to authenticated
using (bucket_id = 'analysis-photos' and (storage.foldername(name))[1] = auth.uid()::text);

create policy "Users delete own analysis photos"
on storage.objects for delete to authenticated
using (bucket_id = 'analysis-photos' and (storage.foldername(name))[1] = auth.uid()::text);

create policy "Service manages analysis photos"
on storage.objects for all to service_role
using (bucket_id = 'analysis-photos') with check (bucket_id = 'analysis-photos');