-- Fix 1: Unique constraint on marks(userId, testsId) prevents duplicate submissions
-- and race-condition points farming even when two requests arrive simultaneously.
ALTER TABLE "public"."marks"
  ADD CONSTRAINT "marks_userId_testsId_key" UNIQUE ("userId", "testsId");

-- Fix 3: Upgrade SET NULL → CASCADE on core relations so that deleting a parent
-- row (user, test, note, question) automatically removes orphaned child rows.

-- marks → User
ALTER TABLE "public"."marks" DROP CONSTRAINT "marks_userId_fkey";
ALTER TABLE "public"."marks"
  ADD CONSTRAINT "marks_userId_fkey"
  FOREIGN KEY ("userId") REFERENCES "User"(id) ON UPDATE CASCADE ON DELETE CASCADE;

-- marks → tests
ALTER TABLE "public"."marks" DROP CONSTRAINT "marks_testsId_fkey";
ALTER TABLE "public"."marks"
  ADD CONSTRAINT "marks_testsId_fkey"
  FOREIGN KEY ("testsId") REFERENCES tests(id) ON UPDATE CASCADE ON DELETE CASCADE;

-- answers → User
ALTER TABLE "public"."answers" DROP CONSTRAINT "answers_userId_fkey";
ALTER TABLE "public"."answers"
  ADD CONSTRAINT "answers_userId_fkey"
  FOREIGN KEY ("userId") REFERENCES "User"(id) ON UPDATE CASCADE ON DELETE CASCADE;

-- answers → questions
ALTER TABLE "public"."answers" DROP CONSTRAINT "answers_questionsId_fkey";
ALTER TABLE "public"."answers"
  ADD CONSTRAINT "answers_questionsId_fkey"
  FOREIGN KEY ("questionsId") REFERENCES questions(id) ON UPDATE CASCADE ON DELETE CASCADE;

-- questions → tests
ALTER TABLE "public"."questions" DROP CONSTRAINT "questions_testsId_fkey";
ALTER TABLE "public"."questions"
  ADD CONSTRAINT "questions_testsId_fkey"
  FOREIGN KEY ("testsId") REFERENCES tests(id) ON UPDATE CASCADE ON DELETE CASCADE;

-- note_comments → notes  (created in migration 002 without CASCADE)
ALTER TABLE "public"."note_comments" DROP CONSTRAINT "note_comments_noteId_fkey";
ALTER TABLE "public"."note_comments"
  ADD CONSTRAINT "note_comments_noteId_fkey"
  FOREIGN KEY ("noteId") REFERENCES "public"."notes"("id") ON DELETE CASCADE;

-- note_comments → User
ALTER TABLE "public"."note_comments" DROP CONSTRAINT "note_comments_userId_fkey";
ALTER TABLE "public"."note_comments"
  ADD CONSTRAINT "note_comments_userId_fkey"
  FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE CASCADE;

-- note_reviews → notes
ALTER TABLE "public"."note_reviews" DROP CONSTRAINT "note_reviews_noteId_fkey";
ALTER TABLE "public"."note_reviews"
  ADD CONSTRAINT "note_reviews_noteId_fkey"
  FOREIGN KEY ("noteId") REFERENCES "public"."notes"("id") ON DELETE CASCADE;

-- note_reviews → User
ALTER TABLE "public"."note_reviews" DROP CONSTRAINT "note_reviews_userId_fkey";
ALTER TABLE "public"."note_reviews"
  ADD CONSTRAINT "note_reviews_userId_fkey"
  FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE CASCADE;
