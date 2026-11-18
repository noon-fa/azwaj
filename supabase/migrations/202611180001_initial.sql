create extension if not exists pgcrypto;
create extension if not exists btree_gist;

create type user_role as enum ('member','brother','scholar','staff','admin');
create type account_status as enum ('active','suspended','deletion_requested');
create type brother_profile_status as enum ('pending_review','changes_requested','approved','rejected','suspended');
create type marriage_request_status as enum ('pending','accepted','declined','expired');
create type counselling_type as enum ('pre_marital','married_couples','individual');
create type counselling_format as enum ('online','in_person');
create type booking_status as enum ('confirmed','completed','cancelled_by_client','cancelled_by_scholar','cancelled_by_admin');
create type payment_status as enum ('payment_not_enabled','pending','paid','refunded');

create table users (
  uid uuid primary key references auth.users(id) on delete cascade,
  email text not null,
  display_name text not null,
  role user_role not null default 'member',
  account_status account_status not null default 'active',
  email_verified boolean not null default false,
  country_code text not null default 'LK',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table staff_permissions (
  uid uuid primary key references users(uid) on delete cascade,
  email text not null,
  display_name text not null,
  can_review_brothers boolean not null default false,
  can_manage_requests boolean not null default false,
  can_manage_scholars boolean not null default false,
  can_manage_bookings boolean not null default false,
  can_view_audit_logs boolean not null default false,
  is_active boolean not null default false,
  updated_by uuid references users(uid),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table brother_profiles (
  brother_id uuid primary key references users(uid) on delete cascade,
  display_name text not null,
  birth_year int,
  country text,
  city_district text,
  nationality text,
  education text,
  occupation text,
  marital_status text,
  religious_practice text,
  languages text[] not null default '{}',
  marriage_preferences text,
  about text,
  photo_url text,
  show_photo_publicly boolean not null default false,
  consent_to_publish boolean not null default false,
  status brother_profile_status not null default 'pending_review',
  is_published boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create table brother_private_details (
  brother_id uuid primary key references users(uid) on delete cascade,
  full_name text not null,
  email text not null,
  phone text,
  date_of_birth date,
  admin_review_note text,
  reviewed_by uuid references users(uid),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table marriage_requests (
  request_id uuid primary key default gen_random_uuid(),
  brother_id uuid not null references users(uid),
  wali_name text not null,
  wali_relationship text not null,
  wali_email text not null,
  normalized_wali_email text not null,
  wali_phone text not null,
  wali_country text not null,
  wali_city_district text not null,
  sister_name text not null,
  sister_age int not null,
  sister_country text not null,
  sister_city_district text not null,
  sister_education text not null,
  sister_occupation text,
  sister_languages text[] not null,
  sister_marriage_info text not null,
  sister_note text not null,
  additional_message text,
  confirmed_wali_authority boolean not null default true,
  privacy_consent boolean not null default true,
  status marriage_request_status not null default 'pending',
  response_deadline_at timestamptz not null,
  responded_at timestamptz,
  contact_sharing_status text not null default 'locked',
  brother_shared_contact text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create unique index marriage_requests_active_wali_brother_key
  on marriage_requests (brother_id, normalized_wali_email)
  where status in ('pending','accepted');

create table scholars (
  scholar_id uuid primary key default gen_random_uuid(),
  uid uuid unique references users(uid),
  email text,
  full_name text not null,
  photo_url text,
  gender text not null,
  title text not null,
  qualification text not null,
  education text not null,
  expertise text[] not null,
  languages text[] not null,
  biography text not null,
  experience_years int not null default 0,
  counselling_formats counselling_format[] not null,
  counselling_types counselling_type[] not null,
  session_duration_minutes int not null,
  session_price_lkr int not null,
  currency text not null default 'LKR',
  country text not null,
  city_location text,
  timezone text not null default 'Asia/Colombo',
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table scholar_availability (
  scholar_id uuid primary key references scholars(scholar_id) on delete cascade,
  timezone text not null,
  weekly_hours jsonb not null default '{}',
  breaks jsonb not null default '[]',
  unavailable_dates text[] not null default '{}',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table counselling_bookings (
  booking_id uuid primary key default gen_random_uuid(),
  scholar_id uuid not null references scholars(scholar_id),
  client_uid uuid references users(uid),
  client_name text not null,
  client_email text not null,
  client_phone text not null,
  issue_summary text not null,
  counselling_type counselling_type not null,
  format counselling_format not null,
  slot_start timestamptz not null,
  slot_end timestamptz not null,
  timezone text not null,
  duration_minutes int not null,
  session_price_lkr int not null,
  currency text not null,
  status booking_status not null default 'confirmed',
  payment_status payment_status not null default 'payment_not_enabled',
  cancellation_reason text,
  private_counsellor_notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  exclude using gist (scholar_id with =, tstzrange(slot_start, slot_end) with &&)
);

create table contact_inquiries (
  inquiry_id uuid primary key default gen_random_uuid(),
  name text not null,
  email text not null,
  topic text not null,
  message text not null,
  status text not null default 'new',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table audit_logs (
  log_id uuid primary key default gen_random_uuid(),
  actor_uid uuid references users(uid),
  actor_email text,
  action text not null,
  target_collection text not null,
  target_id text not null,
  summary text not null,
  created_at timestamptz not null default now()
);

create table notifications (
  notification_id uuid primary key default gen_random_uuid(),
  type text not null,
  recipient_email text not null,
  subject text not null,
  status text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table platform_settings (
  setting_id text primary key,
  country_code text not null,
  country_name text not null,
  default_currency text not null default 'LKR',
  default_timezone text not null default 'Asia/Colombo',
  request_expiry_days int not null default 7,
  payments_enabled boolean not null default false,
  email_provider text not null default 'resend',
  support_email text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
