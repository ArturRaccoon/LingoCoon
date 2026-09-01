-- LingoCoon production public-schema baseline captured on 2026-09-01.
-- Schema only: no application rows, auth users, credentials, or Storage data.
-- Historical snapshot: do not apply to the existing production project.

create table public.profiles (
  id uuid not null,
  email text not null,
  nickname text,
  native_language text,
  target_language text,
  current_level text,
  learning_purpose text,
  learning_purpose_details text,
  onboarding_completed_at timestamptz,
  learning_profile jsonb not null default '{}'::jsonb,
  xp integer not null default 0,
  streak integer not null default 0,
  onboarding_completed boolean not null default false,
  created_at timestamptz not null default timezone('utc'::text, now()),
  updated_at timestamptz not null default timezone('utc'::text, now()),
  constraint profiles_pkey primary key (id),
  constraint profiles_id_fkey foreign key (id) references auth.users(id) on delete cascade,
  constraint learning_profile_size check (pg_column_size(learning_profile) < 1048576),
  constraint valid_xp check (xp >= 0),
  constraint valid_streak check (streak >= 0)
);

comment on table public.profiles is
  'User profiles with minimal essential data for language learning';

create table public.decks (
  user_id uuid not null,
  title text not null,
  description text,
  language_from text not null,
  language_to text not null,
  id uuid not null default gen_random_uuid(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint decks_pkey primary key (id),
  constraint decks_user_id_fkey foreign key (user_id) references auth.users(id) on delete cascade,
  constraint decks_title_check check (char_length(title) >= 1 and char_length(title) <= 200),
  constraint decks_language_from_check check (language_from = any (array['en'::text, 'it'::text, 'fr'::text, 'uk'::text])),
  constraint decks_language_to_check check (language_to = any (array['en'::text, 'it'::text, 'fr'::text, 'uk'::text])),
  constraint different_languages check (language_from <> language_to)
);

create table public.cards (
  deck_id uuid not null,
  front text not null,
  back text not null,
  example_sentence text,
  pronunciation text,
  id uuid not null default gen_random_uuid(),
  difficulty integer default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint cards_pkey primary key (id),
  constraint cards_deck_id_fkey foreign key (deck_id) references public.decks(id) on delete cascade,
  constraint cards_front_check check (char_length(front) >= 1 and char_length(front) <= 500),
  constraint cards_back_check check (char_length(back) >= 1 and char_length(back) <= 500),
  constraint cards_difficulty_check check (difficulty >= 0 and difficulty <= 5)
);

create table public.study_progress (
  user_id uuid not null,
  card_id uuid not null,
  last_reviewed_at timestamptz,
  quality_rating integer,
  id uuid not null default gen_random_uuid(),
  ease_factor real default 2.5,
  interval integer default 1,
  repetitions integer default 0,
  next_review_date timestamptz not null default now(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint study_progress_pkey primary key (id),
  constraint study_progress_user_id_fkey foreign key (user_id) references auth.users(id) on delete cascade,
  constraint study_progress_card_id_fkey foreign key (card_id) references public.cards(id) on delete cascade,
  constraint study_progress_user_id_card_id_key unique (user_id, card_id),
  constraint study_progress_quality_rating_check check (quality_rating >= 0 and quality_rating <= 5),
  constraint study_progress_ease_factor_check check (ease_factor >= 1.3::double precision),
  constraint study_progress_interval_check check (interval >= 0),
  constraint study_progress_repetitions_check check (repetitions >= 0)
);

create index idx_cards_created_at on public.cards using btree (created_at desc);
create index idx_cards_deck_id on public.cards using btree (deck_id);
create index idx_cards_difficulty on public.cards using btree (difficulty);
create index idx_decks_created_at on public.decks using btree (created_at desc);
create index idx_decks_language_from on public.decks using btree (language_from);
create index idx_decks_language_pair on public.decks using btree (language_from, language_to);
create index idx_decks_language_to on public.decks using btree (language_to);
create index idx_decks_user_id on public.decks using btree (user_id);
create index profiles_created_at_idx on public.profiles using btree (created_at desc);
create index profiles_learning_profile_idx on public.profiles using gin (learning_profile);
create index profiles_learning_purpose_idx on public.profiles using btree (learning_purpose)
  where learning_purpose is not null;
create index profiles_onboarding_completed_idx on public.profiles using btree (onboarding_completed)
  where onboarding_completed = false;
create index profiles_target_language_idx on public.profiles using btree (target_language)
  where target_language is not null;
create index idx_study_progress_card_id on public.study_progress using btree (card_id);
create index idx_study_progress_next_review on public.study_progress using btree (next_review_date);
create index idx_study_progress_user_id on public.study_progress using btree (user_id);
create index idx_study_progress_user_next_review on public.study_progress using btree (user_id, next_review_date);

create or replace function public.get_deck_stats(deck_uuid uuid)
returns table(total_cards bigint, cards_to_review bigint, mastered_cards bigint)
language plpgsql
security definer
as $function$
begin
  return query
  select
    count(c.id) as total_cards,
    count(case when sp.next_review_date <= now() then 1 end) as cards_to_review,
    count(case when sp.repetitions >= 5 then 1 end) as mastered_cards
  from public.cards c
  left join public.study_progress sp
    on sp.card_id = c.id and sp.user_id = auth.uid()
  where c.deck_id = deck_uuid;
end;
$function$;

create or replace function public.get_language_pair_name(lang_from text, lang_to text)
returns text
language plpgsql
as $function$
declare
  lang_names constant text[] := array['en', 'it', 'fr', 'uk'];
  lang_full_names constant text[] := array['English', 'Italian', 'French', 'Ukrainian'];
  from_name text;
  to_name text;
begin
  select lang_full_names[array_position(lang_names, lang_from)] into from_name;
  select lang_full_names[array_position(lang_names, lang_to)] into to_name;
  return from_name || ' → ' || to_name;
end;
$function$;

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path to 'public'
as $function$
begin
  insert into public.profiles (id, email, nickname)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'full_name', split_part(new.email, '@', 1))
  );
  return new;
exception
  when others then
    raise warning 'Failed to create profile for user %: %', new.id, sqlerrm;
    return new;
end;
$function$;

create or replace function public.handle_updated_at()
returns trigger
language plpgsql
security definer
set search_path to 'public'
as $function$
begin
  new.updated_at = timezone('utc'::text, now());
  return new;
end;
$function$;

create or replace function public.reset_learning_profile()
returns json
language plpgsql
security definer
set search_path to 'public'
as $function$
declare
  result json;
begin
  if auth.uid() is null then
    raise exception 'Not authenticated';
  end if;

  update public.profiles
  set learning_profile = '{}'::jsonb,
      updated_at = timezone('utc'::text, now())
  where id = auth.uid();

  select row_to_json(p.*) into result
  from public.profiles p
  where p.id = auth.uid();

  return result;
end;
$function$;

create or replace function public.update_learning_profile(new_data jsonb)
returns json
language plpgsql
security definer
set search_path to 'public'
as $function$
declare
  result json;
  new_size integer;
begin
  if auth.uid() is null then
    raise exception 'Not authenticated';
  end if;

  new_size := pg_column_size(new_data);
  if new_size > 1048576 then
    raise exception 'Learning profile data too large (max 1MB)';
  end if;

  update public.profiles
  set learning_profile = learning_profile || new_data,
      updated_at = timezone('utc'::text, now())
  where id = auth.uid();

  select row_to_json(p.*) into result
  from public.profiles p
  where p.id = auth.uid();

  return result;
end;
$function$;

create or replace function public.update_updated_at_column()
returns trigger
language plpgsql
as $function$
begin
  new.updated_at = now();
  return new;
end;
$function$;

create trigger on_auth_user_created
after insert on auth.users
for each row execute function public.handle_new_user();
create trigger set_updated_at
before update on public.profiles
for each row execute function public.handle_updated_at();
create trigger update_cards_updated_at
before update on public.cards
for each row execute function public.update_updated_at_column();
create trigger update_decks_updated_at
before update on public.decks
for each row execute function public.update_updated_at_column();
create trigger update_study_progress_updated_at
before update on public.study_progress
for each row execute function public.update_updated_at_column();

alter table public.profiles enable row level security;
alter table public.decks enable row level security;
alter table public.cards enable row level security;
alter table public.study_progress enable row level security;

create policy "users_select_own_profile" on public.profiles
for select to authenticated using (auth.uid() = id);
create policy "users_insert_own_profile" on public.profiles
for insert to authenticated with check (auth.uid() = id);
create policy "users_update_own_profile" on public.profiles
for update to authenticated using (auth.uid() = id) with check (auth.uid() = id);
create policy "Users can delete own profiles" on public.profiles
for delete to authenticated using (auth.uid() = id);

create policy "Users can view own decks" on public.decks
for select to authenticated using (auth.uid() = user_id);
create policy "Users can create own decks" on public.decks
for insert to authenticated with check (auth.uid() = user_id);
create policy "Users can update own decks" on public.decks
for update to authenticated using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "Users can delete own decks" on public.decks
for delete to authenticated using (auth.uid() = user_id);

create policy "Users can view cards in own decks" on public.cards
for select to authenticated using (
  exists (select 1 from public.decks where decks.id = cards.deck_id and decks.user_id = auth.uid())
);
create policy "Users can create cards in own decks" on public.cards
for insert to authenticated with check (
  exists (select 1 from public.decks where decks.id = cards.deck_id and decks.user_id = auth.uid())
);
create policy "Users can update cards in own decks" on public.cards
for update to authenticated using (
  exists (select 1 from public.decks where decks.id = cards.deck_id and decks.user_id = auth.uid())
);
create policy "Users can delete cards in own decks" on public.cards
for delete to authenticated using (
  exists (select 1 from public.decks where decks.id = cards.deck_id and decks.user_id = auth.uid())
);

create policy "Users can view own study progress" on public.study_progress
for select to authenticated using (auth.uid() = user_id);
create policy "Users can create own study progress" on public.study_progress
for insert to authenticated with check (auth.uid() = user_id);
create policy "Users can update own study progress" on public.study_progress
for update to authenticated using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "Users can delete own study progress" on public.study_progress
for delete to authenticated using (auth.uid() = user_id);

grant all on table public.cards, public.decks, public.study_progress
  to anon, authenticated, service_role;
grant select, insert, update on table public.profiles to authenticated;
grant all on table public.profiles to service_role;

grant execute on function public.get_deck_stats(uuid) to public, anon, authenticated, service_role;
grant execute on function public.get_language_pair_name(text, text) to public, anon, authenticated, service_role;
grant execute on function public.handle_new_user() to public, anon, authenticated, service_role;
grant execute on function public.handle_updated_at() to public, anon, authenticated, service_role;
grant execute on function public.reset_learning_profile() to public, anon, authenticated, service_role;
grant execute on function public.update_learning_profile(jsonb) to public, anon, authenticated, service_role;
grant execute on function public.update_updated_at_column() to public, anon, authenticated, service_role;

alter default privileges for role postgres in schema public
  grant all on tables to anon, authenticated, service_role;
alter default privileges for role postgres in schema public
  grant all on sequences to anon, authenticated, service_role;
alter default privileges for role postgres in schema public
  grant execute on functions to anon, authenticated, service_role;

-- The managed `supabase_admin` role had matching public-schema defaults at the
-- capture time. They are recorded here rather than replayed because `postgres`
-- is not a member of that managed role and cannot alter its defaults safely.
