import { z } from 'zod';
import { supabaseService } from '../_lib/supabase';
import { sendEmail } from '../_lib/email';

const schema = z.object({
  brotherId: z.string().uuid(),
  waliName: z.string().trim().min(2).max(100),
  waliRelationship: z.string().trim().min(2).max(60),
  waliEmail: z.string().trim().email().max(180),
  waliPhone: z.string().trim().min(7).max(24),
  waliCountry: z.string().trim().min(2).max(60),
  waliCityDistrict: z.string().trim().min(2).max(80),
  sisterName: z.string().trim().min(2).max(100),
  sisterAge: z.number().int().min(18).max(80),
  sisterCountry: z.string().trim().min(2).max(60),
  sisterCityDistrict: z.string().trim().min(2).max(80),
  sisterEducation: z.string().trim().min(2).max(140),
  sisterOccupation: z.string().trim().max(120).optional(),
  sisterLanguages: z.array(z.string().trim().min(1).max(40)).min(1).max(10),
  sisterMarriageInfo: z.string().trim().min(10).max(800),
  sisterNote: z.string().trim().min(10).max(1000),
  additionalMessage: z.string().trim().max(800).optional(),
  confirmedWaliAuthority: z.literal(true),
  privacyConsent: z.literal(true),
});

export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed.' });
  const parsed = schema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: 'Invalid introduction request details.' });
  try {
    const supabase = supabaseService();
    const { data, error } = await supabase.rpc('submit_marriage_request', { p: parsed.data });
    if (error) return res.status(error.message.includes('active') ? 409 : 400).json({ error: error.message });

    const { data: brother } = await supabase.from('users').select('email,display_name').eq('uid', parsed.data.brotherId).maybeSingle();
    if (brother?.email) {
      await sendEmail(
        brother.email,
        'Azwaj: New Wali-Mediated Introduction Request',
        `Assalamu Alaikum ${brother.display_name}, a wali submitted a seven-day marriage introduction request. Sign in to review it: ${process.env.APP_URL}/dashboard/requests`
      );
    }
    return res.status(200).json(data);
  } catch {
    return res.status(500).json({ error: 'Unable to submit the introduction request.' });
  }
}
