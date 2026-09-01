-- Remove mutable search paths from the remaining public helper functions.

alter function public.get_language_pair_name(text, text) set search_path = '';
alter function public.update_updated_at_column() set search_path = '';
