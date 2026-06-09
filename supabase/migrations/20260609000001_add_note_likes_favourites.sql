-- Adds the note_likes and favourites tables that exist in prisma/schema.prisma
-- but were absent from the initial migration.

create table if not exists "public"."note_likes" (
    "id"     uuid not null default gen_random_uuid(),
    "userId" uuid not null,
    "noteId" uuid not null,
    "type"   text not null,
    constraint "note_likes_pkey" primary key ("id"),
    constraint "note_likes_userId_noteId_type_key" unique ("userId", "noteId", "type"),
    constraint "note_likes_userId_fkey" foreign key ("userId") references "public"."User"("id") on delete cascade,
    constraint "note_likes_noteId_fkey" foreign key ("noteId") references "public"."notes"("id") on delete cascade
);

create table if not exists "public"."favourites" (
    "id"       uuid not null default gen_random_uuid(),
    "notes_id" uuid not null,
    "usersId"  uuid not null,
    constraint "favourites_pkey" primary key ("id"),
    constraint "favourites_usersId_notes_id_key" unique ("usersId", "notes_id"),
    constraint "favourites_notes_id_fkey" foreign key ("notes_id") references "public"."notes"("id") on delete cascade,
    constraint "favourites_usersId_fkey"  foreign key ("usersId")  references "public"."User"("id") on delete cascade
);
