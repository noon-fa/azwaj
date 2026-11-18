import { supabase } from '@/src/lib/supabase';
import type { ScholarAvailability, ScholarProfile } from '@/src/types/domain';

export async function listActiveScholars(): Promise<ScholarProfile[]> {
  const { data, error } = await supabase.from('scholars').select('*').eq('is_active', true).order('full_name');
  if (error) throw error;
  return (data ?? []).map((row: any) => ({ ...row, scholarId: row.scholar_id, fullName: row.full_name, sessionPriceLkr: row.session_price_lkr }));
}

export async function getScholarById(scholarId: string): Promise<ScholarProfile | null> {
  const { data, error } = await supabase.from('scholars').select('*').eq('scholar_id', scholarId).eq('is_active', true).maybeSingle();
  if (error) throw error;
  return data ? ({ ...data, scholarId: data.scholar_id, fullName: data.full_name, sessionPriceLkr: data.session_price_lkr } as ScholarProfile) : null;
}

export async function getScholarByUid(uid: string): Promise<ScholarProfile | null> {
  const { data, error } = await supabase.from('scholars').select('*').eq('uid', uid).maybeSingle();
  if (error) throw error;
  return data ? ({ ...data, scholarId: data.scholar_id, fullName: data.full_name } as ScholarProfile) : null;
}

export async function getScholarAvailability(scholarId: string): Promise<ScholarAvailability | null> {
  const { data, error } = await supabase.from('scholar_availability').select('*').eq('scholar_id', scholarId).maybeSingle();
  if (error) throw error;
  return data ? ({ ...data, scholarId: data.scholar_id, weeklyHours: data.weekly_hours, unavailableDates: data.unavailable_dates } as ScholarAvailability) : null;
}

export async function saveScholarAvailability(params: {
  scholarId: string;
  scholarUid?: string;
  timezone: string;
  weeklyHours: ScholarAvailability['weeklyHours'];
  breaks: ScholarAvailability['breaks'];
  unavailableDates: string[];
}) {
  const { error } = await supabase.from('scholar_availability').upsert({
    scholar_id: params.scholarId,
    timezone: params.timezone,
    weekly_hours: params.weeklyHours,
    breaks: params.breaks,
    unavailable_dates: params.unavailableDates,
  });
  if (error) throw error;
}

export async function updateScholarOwnProfile(params: {
  scholarId: string;
  biography: string;
  counsellingFormats: ('online' | 'in_person')[];
  cityLocation: string;
}) {
  const { error } = await supabase.from('scholars').update({
    biography: params.biography,
    counselling_formats: params.counsellingFormats,
    city_location: params.cityLocation,
  }).eq('scholar_id', params.scholarId);
  if (error) throw error;
}
