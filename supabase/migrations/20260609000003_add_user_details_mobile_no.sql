-- Schema drift fix: user_details.mobile_no exists in prisma/schema.prisma
-- but was absent from the initial migration, causing a 500 on signup when
-- a mobile number is submitted.
ALTER TABLE "public"."user_details"
  ADD COLUMN IF NOT EXISTS "mobile_no" text;
