# ReWaste AI — Production Upgrade Roadmap

## Audit (existing state)
- Working: single-page AI analyzer (`/`) with photo upload + Lovable AI vision analysis (reuse/recycle/donate/sell/dispose + INR price range), donate/sell outbound links, green/mint brand, sonner toasts.
- Backend: Lovable Cloud connected, **no tables**, no auth in use, no storage buckets.
- Missing: everything else (accounts, marketplace, donations, centres, messaging, notifications, admin, legal pages, i18n).

## Phases
- [x] Phase 1 — Database schema (profiles, user_roles, analyses, listings, photos, favourites, reservations, conversations, messages, notifications, centres, reports, audit_logs, contact_messages), RLS + grants, storage buckets, profile-creation trigger
- [x] Phase 2 — Auth: email/password, Google + Sign in with Lovable, /auth page, _authenticated gate, profile management, account deletion
- [x] Phase 3 — Analyzer upgrade: confidence, uncertainty/more-info, repair options, verified-vs-AI-estimate labels, saved history, rate limit; /analyze route; home landing page
- [x] Phase 4 — Marketplace: listing CRUD (draft/active/pause/sold/removed), search + filters + sort + pagination, detail pages, favourites, reservations, prefilled-from-analysis flow
- [x] Phase 5 — Donations browse, verified centres directory (admin-entered only — no invented data), PIN search, directions links, pickup scheduling via reservation notes
- [x] Phase 6 — Buyer–seller messaging, notifications + unread counts, notification preferences
- [x] Phase 7 — Admin dashboard (role-gated server-side): stats, users, listing moderation, reports, centres, audit log
- [x] Phase 8 — Navbar/footer/breadcrumbs, Help, Contact, Terms, Privacy, Guidelines; en/ta language toggle; QA pass
