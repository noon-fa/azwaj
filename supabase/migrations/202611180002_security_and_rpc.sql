alter table users enable row level security;
alter table staff_permissions enable row level security;
alter table brother_profiles enable row level security;
alter table brother_private_details enable row level security;
alter table marriage_requests enable row level security;
alter table scholars enable row level security;
alter table scholar_availability enable row level security;
alter table counselling_bookings enable row level security;
alter table contact_inquiries enable row level security;
alter table audit_logs enable row level security;
alter table notifications enable row level security;
alter table platform_settings enable row level security;

create or replace function public.handle_new_auth_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.users (uid, email, display_name, email_verified)
  values (
    new.id,
    coalesce(new.email,''),
    coalesce(new.raw_user_meta_data->>'display_name', split_part(coalesce(new.email,''),'@',1), 'Azwaj Member'),
    coalesce(new.email_confirmed_at is not null, false)
  )
  on conflict (uid) do update set
    email = excluded.email,
    email_verified = excluded.email_verified,
    updated_at = now();
  return new;
end;
$$;
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created after insert or update of email_confirmed_at on auth.users
for each row execute function public.handle_new_auth_user();

create or replace function public.is_admin()
returns boolean language sql stable security definer set search_path = public
as $$ select exists (select 1 from users where uid=auth.uid() and role='admin'); $$;

create or replace function public.is_staff()
returns boolean language sql stable security definer set search_path = public
as $$ select exists (
  select 1 from staff_permissions sp
  join users u on u.uid=sp.uid
  where sp.uid=auth.uid() and sp.is_active and u.role='staff'
); $$;

create policy users_select_own on users for select using (uid=auth.uid() or is_admin());
create policy users_update_own on users for update using (uid=auth.uid()) with check (uid=auth.uid());
create policy staff_select on staff_permissions for select using (uid=auth.uid() or is_admin());

create policy public_brothers on brother_profiles for select
using (is_published and status='approved');
create policy brother_manage_public on brother_profiles for update
using (brother_id=auth.uid()) with check (brother_id=auth.uid());
create policy brother_insert_public on brother_profiles for insert
with check (brother_id=auth.uid());
create policy admin_manage_brothers on brother_profiles for all
using (is_admin()) with check (is_admin());

create policy brother_private_own on brother_private_details for select using (brother_id=auth.uid() or is_admin());
create policy brother_private_manage on brother_private_details for all using (brother_id=auth.uid()) with check (brother_id=auth.uid());

create policy public_scholars on scholars for select using (is_active);
create policy scholar_manage_profile on scholars for update using (uid=auth.uid()) with check (uid=auth.uid());

create policy scholar_availability_public on scholar_availability for select using (exists(select 1 from scholars s where s.scholar_id=scholar_availability.scholar_id and s.is_active));
create policy scholar_manage_availability on scholar_availability for all using (exists(select 1 from scholars s where s.scholar_id=scholar_availability.scholar_id and s.uid=auth.uid()));

create policy booking_visible on counselling_bookings for select using (
  client_uid=auth.uid()
  or exists(select 1 from scholars s where s.scholar_id=counselling_bookings.scholar_id and s.uid=auth.uid())
  or is_admin() or is_staff()
);

create policy public_settings on platform_settings for select using (true);

create policy audit_staff_read on audit_logs for select using (is_admin() or is_staff());

create or replace function public.prevent_user_role_change()
returns trigger language plpgsql security definer set search_path=public as $$
begin
  if auth.uid() is not null and new.role is distinct from old.role then
    raise exception 'role changes require trusted server administration';
  end;
  return new;
end;
$$;
drop trigger if exists prevent_user_role_change on users;
create trigger prevent_user_role_change before update on users
for each row execute function public.prevent_user_role_change();

create or replace function public.prevent_brother_moderation_change()
returns trigger language plpgsql security definer set search_path=public as $$
begin
  if auth.uid() is not null and (
    new.status in ('approved','rejected','suspended') or
    new.is_published
  ) then
    raise exception 'profile moderation requires authorized staff';
  end;
  return new;
end;
$$;
drop trigger if exists prevent_brother_moderation_change on brother_profiles;
create trigger prevent_brother_moderation_change before update on brother_profiles
for each row execute function public.prevent_brother_moderation_change();

create or replace function public.submit_marriage_request(p jsonb)
returns jsonb language plpgsql security definer set search_path=public as $$
declare
  v_request_id uuid;
  v_brother record;
  v_deadline timestamptz;
  v_email text;
begin
  v_email := lower(trim(p->>'waliEmail'));
  if v_email='' then raise exception 'valid wali email required'; end;
  select * into v_brother from brother_profiles
  where brother_id=(p->>'brotherId')::uuid and status='approved' and is_published;
  if not found then raise exception 'selected brother profile is not available'; end;

  insert into marriage_requests (
    brother_id,wali_name,wali_relationship,wali_email,normalized_wali_email,wali_phone,wali_country,wali_city_district,
    sister_name,sister_age,sister_country,sister_city_district,sister_education,sister_occupation,sister_languages,
    sister_marriage_info,sister_note,additional_message,response_deadline_at
  ) values (
    (p->>'brotherId')::uuid,p->>'waliName',p->>'waliRelationship',trim(p->>'waliEmail'),v_email,p->>'waliPhone',
    p->>'waliCountry',p->>'waliCityDistrict',p->>'sisterName',(p->>'sisterAge')::int,p->>'sisterCountry',
    p->>'sisterCityDistrict',p->>'sisterEducation',nullif(p->>'sisterOccupation',''),coalesce(array(select jsonb_array_elements_text(p->'sisterLanguages')),'{}'),
    p->>'sisterMarriageInfo',p->>'sisterNote',nullif(p->>'additionalMessage',''),now()+interval '7 days'
  ) returning request_id,response_deadline_at into v_request_id,v_deadline;
  return jsonb_build_object('requestId',v_request_id,'responseDeadlineAt',v_deadline);
exception
  when unique_violation then
    raise exception 'An active introduction request from this wali email already exists for this brother';
end;
$$;
revoke all on function public.submit_marriage_request(jsonb) from public;
grant execute on function public.submit_marriage_request(jsonb) to anon, authenticated;

create or replace function public.respond_marriage_request(p_request_id uuid,p_decision text,p_shared_contact text default null,p_actor uuid default null)
returns void language plpgsql security definer set search_path=public as $$
declare v record;
begin
  select * into v from marriage_requests where request_id=p_request_id;
  if not found then raise exception 'request not found'; end;
  if v.brother_id<>coalesce(p_actor,auth.uid()) then raise exception 'only the addressed brother can respond'; end;
  if v.status<> 'pending' then raise exception 'request already finalized'; end;
  if v.response_deadline_at <= now() then
    update marriage_requests set status='expired',updated_at=now() where request_id=p_request_id;
    raise exception 'request has expired';
  end;
  if p_decision='accepted' and coalesce(length(trim(p_shared_contact)),0)<5 then raise exception 'shared contact required'; end;
  update marriage_requests set
    status=p_decision::marriage_request_status,
    responded_at=now(),
    brother_shared_contact=case when p_decision='accepted' then trim(p_shared_contact) end,
    contact_sharing_status=case when p_decision='accepted' then 'exchanged' else 'locked' end,
    updated_at=now()
  where request_id=p_request_id;
end;
$$;
revoke all on function public.respond_marriage_request(uuid,text,text,uuid) from public;
grant execute on function public.respond_marriage_request(uuid,text,text,uuid) to authenticated;

create or replace function public.create_counselling_booking(p jsonb)
returns jsonb language plpgsql security definer set search_path=public as $$
declare v_scholar record; v_booking_id uuid;
begin
  select * into v_scholar from scholars where scholar_id=(p->>'scholarId')::uuid and is_active;
  if not found then raise exception 'scholar is not accepting bookings'; end;
  insert into counselling_bookings (
    scholar_id,client_uid,client_name,client_email,client_phone,issue_summary,counselling_type,format,
    slot_start,slot_end,timezone,duration_minutes,session_price_lkr,currency
  ) values (
    v_scholar.scholar_id,coalesce((p->>'clientUid')::uuid,auth.uid()),p->>'clientName',p->>'clientEmail',p->>'clientPhone',p->>'issueSummary',
    (p->>'counsellingType')::counselling_type,(p->>'format')::counselling_format,(p->>'slotStartIso')::timestamptz,
    (p->>'slotEndIso')::timestamptz,v_scholar.timezone,v_scholar.session_duration_minutes,v_scholar.session_price_lkr,v_scholar.currency
  ) returning booking_id into v_booking_id;
  return jsonb_build_object('bookingId',v_booking_id);
exception
  when exclusion_violation then raise exception 'this time slot is already booked';
end;
$$;
revoke all on function public.create_counselling_booking(jsonb) from public;
grant execute on function public.create_counselling_booking(jsonb) to authenticated;

create or replace function public.expire_pending_marriage_requests()
returns integer language plpgsql security definer set search_path=public as $$
declare v_count integer;
begin
  update marriage_requests set status='expired',updated_at=now()
  where status='pending' and response_deadline_at<=now();
  get diagnostics v_count=row_count;
  return v_count;
end;
$$;
