-- Link app tables to profiles so PostgREST can embed owner/seller/buyer names in queries.
alter table public.analyses
  add constraint analyses_user_fk foreign key (user_id) references public.profiles(id) on delete cascade;
alter table public.listings
  add constraint listings_owner_fk foreign key (owner_id) references public.profiles(id) on delete cascade;
alter table public.favourites
  add constraint favourites_user_fk foreign key (user_id) references public.profiles(id) on delete cascade;
alter table public.reservations
  add constraint reservations_requester_fk foreign key (requester_id) references public.profiles(id) on delete cascade;
alter table public.conversations
  add constraint conversations_buyer_fk foreign key (buyer_id) references public.profiles(id) on delete cascade,
  add constraint conversations_seller_fk foreign key (seller_id) references public.profiles(id) on delete cascade;
alter table public.messages
  add constraint messages_sender_fk foreign key (sender_id) references public.profiles(id) on delete cascade;
alter table public.notifications
  add constraint notifications_user_fk foreign key (user_id) references public.profiles(id) on delete cascade;
alter table public.centres
  add constraint centres_created_by_fk foreign key (created_by) references public.profiles(id) on delete set null;
alter table public.reports
  add constraint reports_reporter_fk foreign key (reporter_id) references public.profiles(id) on delete cascade,
  add constraint reports_resolved_by_fk foreign key (resolved_by) references public.profiles(id) on delete set null;