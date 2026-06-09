-- Enable RLS on tables that the browser reads, then grant only SELECT access
-- to anon/authenticated users. Prisma server routes use the DB owner role and
-- bypass RLS automatically.

alter table "public"."notes" enable row level security;
alter table "public"."tests" enable row level security;
alter table "public"."questions" enable row level security;
alter table "public"."subjects" enable row level security;
alter table "public"."semesters" enable row level security;
alter table "public"."branch" enable row level security;
alter table "public"."User" enable row level security;

revoke insert, update, delete on table "public"."notes" from anon, authenticated;
revoke insert, update, delete on table "public"."tests" from anon, authenticated;
revoke insert, update, delete on table "public"."questions" from anon, authenticated;
revoke insert, update, delete on table "public"."subjects" from anon, authenticated;
revoke insert, update, delete on table "public"."semesters" from anon, authenticated;
revoke insert, update, delete on table "public"."branch" from anon, authenticated;
revoke insert, update, delete on table "public"."User" from anon, authenticated;

grant select on table "public"."notes" to anon, authenticated;
grant select on table "public"."tests" to anon, authenticated;
grant select on table "public"."questions" to anon, authenticated;
grant select on table "public"."subjects" to anon, authenticated;
grant select on table "public"."semesters" to anon, authenticated;
grant select on table "public"."branch" to anon, authenticated;
grant select on table "public"."User" to anon, authenticated;

drop policy if exists "public read notes" on "public"."notes";
drop policy if exists "public read tests" on "public"."tests";
drop policy if exists "public read questions" on "public"."questions";
drop policy if exists "public read subjects" on "public"."subjects";
drop policy if exists "public read semesters" on "public"."semesters";
drop policy if exists "public read branch" on "public"."branch";
drop policy if exists "public read users" on "public"."User";

create policy "public read notes"
on "public"."notes"
for select
to anon, authenticated
using (true);

create policy "public read tests"
on "public"."tests"
for select
to anon, authenticated
using (true);

create policy "public read questions"
on "public"."questions"
for select
to anon, authenticated
using (true);

create policy "public read subjects"
on "public"."subjects"
for select
to anon, authenticated
using (true);

create policy "public read semesters"
on "public"."semesters"
for select
to anon, authenticated
using (true);

create policy "public read branch"
on "public"."branch"
for select
to anon, authenticated
using (true);

create policy "public read users"
on "public"."User"
for select
to anon, authenticated
using (true);