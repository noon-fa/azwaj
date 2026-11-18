import { z } from 'zod';
import { authenticatedUser, supabaseService } from '../_lib/supabase';
import { sendEmail } from '../_lib/email';

const schema = z.object({
  scholarId: z.string().uuid(),
  slotStartIso: z.string().datetime(),
  slotEndIso: z.string().datetime(),
  counsellingType: z.enum(['pre_marital','married_couples','individual']),
  format: z.enum(['online','in_person']),
  clientName: z.string().trim().min(2).max(100),
  clientEmail: z.string().trim().email().max(180),
  clientPhone: z.string().trim().min(7).max(24),
  issueSummary: z.string().trim().min(10).max(1000),
});

export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed.' });
  const user = await authenticatedUser(req);
  if (!user?.email_confirmed_at) return res.status(401).json({ error: 'Verified authentication required.' });
  const parsed = schema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: 'Invalid booking details.' });
  try {
    const supabase = supabaseService();
    const { data, error } = await supabase.rpc('create_counselling_booking', {
      p: { ...parsed.data, clientUid: user.id },
    });
    if (error) return res.status(409).json({ error: error.message });
    await sendEmail(parsed.data.clientEmail, 'Azwaj: Counselling Booking Confirmed',
      `Assalamu Alaikum ${parsed.data.clientName}, your counselling session is confirmed. Payment status: payment_not_enabled.`);
    return res.status(200).json(data);
  } catch {
    return res.status(500).json({ error: 'Unable to create booking.' });
  }
}
