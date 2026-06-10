-- Enable RLS on all tables. Prisma server routes use the DB owner role and
-- bypass RLS automatically. Anon/authenticated (Supabase client) get read-only
-- access to public data; sensitive columns are hidden via column-level grants.

DO $$ DECLARE t text; BEGIN
  FOREACH t IN ARRAY ARRAY[
    'User','user_details','notes','tests','questions',
    'marks','answers','note_comments','note_reviews','note_likes',
    'favourites','subscriptions','subjects','semesters','branch','college'
  ]
  LOOP
    EXECUTE format('ALTER TABLE public.%I ENABLE ROW LEVEL SECURITY;', t);
    EXECUTE format('DROP POLICY IF EXISTS rls_read ON public.%I;', t);
    EXECUTE format(
      'CREATE POLICY rls_read ON public.%I FOR SELECT TO anon, authenticated USING (true);',
      t
    );
    EXECUTE format('REVOKE INSERT, UPDATE, DELETE ON public.%I FROM anon, authenticated;', t);
  END LOOP;
END $$;

-- Never expose password hashes through the public client.
REVOKE SELECT ON public."User" FROM anon, authenticated;
GRANT SELECT (id, first_name, last_name, mail_id, prof_image, role, sem_no,
              college_code, branch_name, skills, points)
  ON public."User" TO anon, authenticated;

-- Never expose the correct answer through the public client.
REVOKE SELECT ON public."questions" FROM anon, authenticated;
GRANT SELECT (id, question, choices, "testsId", explanation)
  ON public."questions" TO anon, authenticated;
