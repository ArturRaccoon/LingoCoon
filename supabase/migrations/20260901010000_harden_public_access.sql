-- Fail closed for future public tables and remove unnecessary elevated access.

create schema if not exists private;
revoke all on schema private from public, anon, authenticated;

create or replace function private.rls_auto_enable()
returns event_trigger
language plpgsql
security definer
set search_path = pg_catalog
as $function$
declare
  cmd record;
begin
  for cmd in
    select *
    from pg_event_trigger_ddl_commands()
    where command_tag in ('CREATE TABLE', 'CREATE TABLE AS', 'SELECT INTO')
      and object_type in ('table', 'partitioned table')
  loop
    if cmd.schema_name = 'public' then
      execute format(
        'alter table if exists %s enable row level security',
        cmd.object_identity
      );
      raise log 'rls_auto_enable: enabled RLS on %', cmd.object_identity;
    end if;
  end loop;
end;
$function$;

revoke execute on function private.rls_auto_enable() from public, anon, authenticated;

drop event trigger if exists ensure_rls;
create event trigger ensure_rls
on ddl_command_end
when tag in ('CREATE TABLE', 'CREATE TABLE AS', 'SELECT INTO')
execute function private.rls_auto_enable();

alter function public.get_deck_stats(uuid) security invoker;
alter function public.get_deck_stats(uuid) set search_path = '';
alter function public.reset_learning_profile() security invoker;
alter function public.reset_learning_profile() set search_path = '';
alter function public.update_learning_profile(jsonb) security invoker;
alter function public.update_learning_profile(jsonb) set search_path = '';

revoke all on table public.profiles, public.decks, public.cards, public.study_progress
  from anon, authenticated;
grant select, insert, update on table public.profiles to authenticated;
grant select, insert, update, delete on table public.decks, public.cards, public.study_progress
  to authenticated;

revoke execute on all functions in schema public from public, anon, authenticated;
grant execute on function public.get_deck_stats(uuid) to authenticated;
grant execute on function public.get_language_pair_name(text, text) to authenticated;
grant execute on function public.reset_learning_profile() to authenticated;
grant execute on function public.update_learning_profile(jsonb) to authenticated;

alter default privileges for role postgres in schema public
  revoke all on tables from anon, authenticated;
alter default privileges for role postgres in schema public
  revoke all on sequences from anon, authenticated;
alter default privileges for role postgres in schema public
  revoke execute on functions from public, anon, authenticated;
