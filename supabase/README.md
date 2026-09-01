# Supabase Database Source

This directory contains the versioned public-schema baseline, forward
migrations, and database security checks for LingoCoon.

## Baseline

`baseline/20260901_public_schema.sql` records the production `public` schema as
observed on 2026-09-01. It contains schema objects and privileges, but no rows,
users, credentials, or Storage data.

The baseline is a historical snapshot. Do not run it against the existing
production project. A future Supabase CLI setup must mark or reconcile it as
the starting state before using `db push`.

## Forward migrations

Files under `migrations/` are ordered, reviewable changes. The first migration
enables RLS automatically for future `public` tables, changes three unnecessary
`SECURITY DEFINER` functions to invoker mode, and applies least-privilege grants.
The follow-up migration pins the remaining mutable helper-function search paths.

Create future `public` objects through versioned migrations executed by the
project `postgres` role. If another owner role is introduced, audit and narrow
that role's default privileges before exposing its objects through the Data API.

## Verification

Run `tests/database_security.sql` after the migration in a local, isolated, or
explicitly approved environment. The script uses a transaction and rolls back
its temporary probe table.

Never run `supabase db reset --linked` against production.
