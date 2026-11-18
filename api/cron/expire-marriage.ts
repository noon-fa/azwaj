import { supabaseService } from '../_lib/supabase';

export default async function handler(req: any, res: any) {
  if (req.headers['x-vercel-protection-bypass'] && process.env.CRON_SECRET) {
    // Vercel Cron sends Authorization: Bearer CRON_SECRET
  }
  const authorization = req.headers.authorization;
  if (authorization !== `Bearer ${process.env.CRON_SECRET}`) return res.status(401).json({ error: 'Unauthorized.' });
  const supabase = supabaseService();
  const { data, error } = await supabase.rpc('expire_pending_marriage_requests');
  if (error) return res.status(500).json({ error: 'Expiration failed.' });
  return res.status(200).json({ expired: data ?? 0 });
}
