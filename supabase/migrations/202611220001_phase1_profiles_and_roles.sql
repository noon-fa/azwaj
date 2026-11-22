create type public.intended_role as enum ('brother', 'sister');
create type public.app_role as enum (
  'member',
  'administrator',
  'counsellor',
  'scholar',
  'wali'
);
create type public.deletion_request_status as enum (
  'pending',
  'completed',
  'cancelled'
);

create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  intended_role public.intended_role not null,
  full_name text not null check (char_length(full_name) between 2 and 100),
  phone text not null check (char_length(phone) between 7 and 24),
  country text not null check (char_length(country) between 2 and 80),
  city text not null check (char_length(city) between 2 and 100),
  preferred_language text not null check (char_length(preferred_language) between 2 and 60),
  date_of_birth date not null,
  profile_visibility boolean not null default false,
  data_processing_consent_at timestamptz not null default now(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.user_roles (
  user_id uuid not null references auth.users (id) on delete cascade,
  role public.app_role not null default 'member',
  created_at timestamptz not null default now(),
  primary key (user_id, role)
);

create table public.account_deletion_requests (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  status public.deletion_request_status not null default 'pending',
  requested_at timestamptz not null default now(),
  processed_at timestamptz
);

create index profiles_intended_role_idx on public.profiles (intended_role);
create index profiles_created_at_idx on public.profiles (created_at desc);
create unique index one_pending_deletion_request_per_user
on public.account_deletion_requests (user_id)
where status = 'pending';

create function public.enforce_profile_minimum_age()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  if new.date_of_birth > (current_date - interval '18 years')::date then
    raise exception 'You must be at least 18 years old to create an Azwaj profile';
  end if;
  return new;
end;
$$;

create trigger profiles_minimum_age
before insert or update of date_of_birth on public.profiles
for each row execute function public.enforce_profile_minimum_age();

create function public.set_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger profiles_updated_at
before update on public.profiles
for each row execute function public.set_updated_at();

create function public.assign_default_member_role()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.user_roles (user_id, role)
  values (new.id, 'member');
  return new;
end;
$$;

create trigger on_auth_user_created_assign_role
after insert on auth.users
for each row execute function public.assign_default_member_role();

alter table public.profiles enable row level security;
alter table public.user_roles enable row level security;
alter table public.account_deletion_requests enable row level security;

revoke all on public.profiles from anon, authenticated;
grant select on public.profiles to authenticated;
grant insert (
  id,
  intended_role,
  full_name,
  phone,
  country,
  city,
  preferred_language,
  date_of_birth,
  profile_visibility
) on public.profiles to authenticated;
grant update (
  full_name,
  phone,
  country,
  city,
  preferred_language,
  date_of_birth,
  profile_visibility
) on public.profiles to authenticated;

create policy "Users can read only their own private profile"
on public.profiles for select to authenticated
using ((select auth.uid()) = id);

create policy "Users can create only their own private profile"
on public.profiles for insert to authenticated
with check ((select auth.uid()) = id);

create policy "Users can update only their own private profile"
on public.profiles for update to authenticated
using ((select auth.uid()) = id)
with check ((select auth.uid()) = id);

revoke all on public.user_roles from anon, authenticated;
grant select on public.user_roles to authenticated;

create policy "Users can read only their own assigned roles"
on public.user_roles for select to authenticated
using ((select auth.uid()) = user_id);

revoke all on public.account_deletion_requests from anon, authenticated;
grant select on public.account_deletion_requests to authenticated;
grant insert (user_id) on public.account_deletion_requests to authenticated;

create policy "Users can read only their own deletion requests"
on public.account_deletion_requests for select to authenticated
using ((select auth.uid()) = user_id);

create policy "Users can request deletion only for their own account"
on public.account_deletion_requests for insert to authenticated
with check ((select auth.uid()) = user_id and status = 'pending');

comment on table public.profiles is
  'Private account and onboarding details. Discovery must use approved, explicitly public fields through a separately authorized view or function.';
comment on table public.user_roles is
  'Trusted authorization roles. Clients may read their own roles but cannot insert, update, or delete role assignments.';
comment on table public.account_deletion_requests is
  'Users may create and read their own deletion requests. Only trusted administrators may process or change request status.';
