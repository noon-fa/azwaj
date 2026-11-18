import { createClient } from '@supabase/supabase-js';

export function supabaseService() {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) throw new Error('Supabase server configuration is missing.');
  return createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false } });
}

export async function authenticatedUser(req: { headers: Record<string, string | string[] | undefined> }) {
  const authorization = req.headers.authorization;
  const token = typeof authorization === 'string' ? authorization.replace(/^Bearer\s+/i, '') : '';
  if (!token) return null;
  const supabase = supabaseService();
  const { data, error } = await supabase.auth.getUser(token);
  if (error) return null;
  return data.user;
}
