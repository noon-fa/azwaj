import { supabase } from '@/src/lib/supabase';
import type { BrotherRegistrationInput } from '@/src/schemas/validation';
import type { BrotherPrivateDetail, BrotherPublicProfile } from '@/src/types/domain';

export async function listPublishedBrothers(): Promise<BrotherPublicProfile[]> {
  const { data, error } = await supabase
    .from('brother_profiles')
    .select('*')
    .eq('is_published', true)
    .eq('status', 'approved')
    .order('updated_at', { ascending: false });
  if (error) throw error;
  return (data ?? []).map((row: any) => ({ ...row, brotherId: row.brother_id, birthYear: row.birth_year, isPublished: row.is_published }));
}

export async function getBrotherPublicProfile(brotherId: string): Promise<BrotherPublicProfile | null> {
  const { data, error } = await supabase
    .from('brother_profiles')
    .select('*')
    .eq('brother_id', brotherId)
    .eq('is_published', true)
    .eq('status', 'approved')
    .maybeSingle();
  if (error) throw error;
  return data ? ({ ...data, brotherId: data.brother_id } as BrotherPublicProfile) : null;
}

export async function getBrotherPrivateDetail(brotherId: string): Promise<BrotherPrivateDetail | null> {
  const { data, error } = await supabase.from('brother_private_details').select('*').eq('brother_id', brotherId).maybeSingle();
  if (error) throw error;
  return data ? ({ ...data, brotherId: data.brother_id } as BrotherPrivateDetail) : null;
}

export async function uploadBrotherPhoto(uid: string, file: File): Promise<string> {
  if (!['image/jpeg','image/png','image/webp'].includes(file.type)) throw new Error('Only JPEG, PNG, or WebP images are permitted.');
  if (file.size > 5 * 1024 * 1024) throw new Error('Profile photograph must be 5 MB or smaller.');
  const extension = file.type === 'image/png' ? 'png' : file.type === 'image/webp' ? 'webp' : 'jpg';
  const path = `${uid}/profile-${Date.now()}.${extension}`;
  const { error } = await supabase.storage.from('brother-photos').upload(path, file, { contentType: file.type, upsert: false });
  if (error) throw error;
  const { data, error: signedError } = await supabase.storage.from('brother-photos').createSignedUrl(path, 3600);
  if (signedError) throw signedError;
  return data.signedUrl;
}

export async function saveBrotherProfile(params: {
  uid: string;
  email: string;
  input: BrotherRegistrationInput;
  photoUrl?: string;
}) {
  const birthYear = new Date(params.input.dateOfBirth).getFullYear();
  const publicPayload = {
    brother_id: params.uid,
    display_name: params.input.displayName,
    birth_year: birthYear,
    country: params.input.country,
    city_district: params.input.cityDistrict,
    nationality: params.input.nationality,
    education: params.input.education,
    occupation: params.input.occupation,
    marital_status: params.input.maritalStatus,
    religious_practice: params.input.religiousPractice,
    languages: params.input.languages,
    marriage_preferences: params.input.marriagePreferences,
    about: params.input.about,
    show_photo_publicly: params.input.showPhotoPublicly,
    consent_to_publish: true,
    status: 'pending_review',
    is_published: false,
    ...(params.photoUrl ? { photo_url: params.photoUrl } : {}),
  };
  const privatePayload = {
    brother_id: params.uid,
    full_name: params.input.fullName,
    email: params.email,
    phone: params.input.phone,
    date_of_birth: params.input.dateOfBirth,
  };
  const publicResult = await supabase.from('brother_profiles').upsert(publicPayload);
  if (publicResult.error) throw publicResult.error;
  const privateResult = await supabase.from('brother_private_details').upsert(privatePayload);
  if (privateResult.error) throw privateResult.error;
}

export async function toggleBrotherPublication(params: { uid: string; isPublished: boolean }) {
  const { error } = await supabase.from('brother_profiles').update({
    is_published: params.isPublished,
    consent_to_publish: true,
  }).eq('brother_id', params.uid);
  if (error) throw error;
}
