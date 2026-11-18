import { supabase } from './supabase';

export async function apiPost<T>(path: string, body: unknown): Promise<T> {
  const { data } = await supabase.auth.getSession();
  const response = await fetch(path, {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
      ...(data.session?.access_token
        ? { authorization: `Bearer ${data.session.access_token}` }
        : {}),
    },
    body: JSON.stringify(body),
  });
  const payload = await response.json().catch(() => ({ error: 'Invalid server response.' }));
  if (!response.ok) throw new Error(payload.error || 'Request failed.');
  return payload as T;
}
