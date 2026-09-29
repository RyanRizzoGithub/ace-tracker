-- ACE Tracker — remove coach review notes
--
-- The review-notes feature was dropped: coaches now open a client's account
-- and screen-share the client's own Overview / Reports / Compare tabs instead.
-- The table was never used in production (it was empty when removed).
-- Coach sharing itself (coach_links, is_coach_of, read-only policies) stays.

drop table if exists public.review_notes;
