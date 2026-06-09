-- Phase 4: email_verified, skills, points on User
-- email_verified: add with default TRUE so existing users aren't locked out,
-- then change the column default to FALSE for new signups (the signup route
-- explicitly sets email_verified = false and OTP flips it to true).
alter table "public"."User"
  add column if not exists "email_verified" boolean not null default true,
  add column if not exists "skills" text[] not null default '{}',
  add column if not exists "points" integer not null default 0;

alter table "public"."User"
  alter column "email_verified" set default false;

-- Phase 5: note_comments
create table if not exists "public"."note_comments" (
    "id"         uuid not null default gen_random_uuid(),
    "text"       text not null,
    "created_at" timestamptz not null default now(),
    "noteId"     uuid,
    "userId"     uuid,
    constraint "note_comments_pkey" primary key ("id"),
    constraint "note_comments_noteId_fkey" foreign key ("noteId") references "public"."notes"("id"),
    constraint "note_comments_userId_fkey" foreign key ("userId") references "public"."User"("id")
);

-- Phase 6: note_reviews
create table if not exists "public"."note_reviews" (
    "id"         uuid not null default gen_random_uuid(),
    "rating"     integer not null,
    "text"       text,
    "created_at" timestamptz not null default now(),
    "noteId"     uuid,
    "userId"     uuid,
    constraint "note_reviews_pkey" primary key ("id"),
    constraint "note_reviews_userId_noteId_key" unique ("userId", "noteId"),
    constraint "note_reviews_noteId_fkey" foreign key ("noteId") references "public"."notes"("id"),
    constraint "note_reviews_userId_fkey" foreign key ("userId") references "public"."User"("id")
);

-- Phase 6: subscriptions
create table if not exists "public"."subscriptions" (
    "id"         uuid not null default gen_random_uuid(),
    "created_at" timestamptz not null default now(),
    "userId"     uuid not null,
    "subCode"    text not null,
    constraint "subscriptions_pkey" primary key ("id"),
    constraint "subscriptions_userId_subCode_key" unique ("userId", "subCode"),
    constraint "subscriptions_userId_fkey" foreign key ("userId") references "public"."User"("id") on delete cascade,
    constraint "subscriptions_subCode_fkey" foreign key ("subCode") references "public"."subjects"("sub_code") on delete cascade
);

-- Phase 7: duration_minutes + instructions on tests, explanation on questions
alter table "public"."tests"
  add column if not exists "duration_minutes" integer,
  add column if not exists "instructions" text;

alter table "public"."questions"
  add column if not exists "explanation" text;
