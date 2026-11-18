import { z } from 'zod';
import { authenticatedUser, supabaseService } from '../_lib/supabase';
import { sendEmail } from '../_lib/email';

const schema = z.object({
  requestId: z.string().uuid(),
  decision: z.enum(['accepted','declined']),
  brotherSharedContact: z.string().trim().max(300).optional(),
});

export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed.' });
  const user = await authenticatedUser(req);
  if (!user?.email_confirmed_at) return res.status(401).json({ error: 'Verified authentication required.' });
  const parsed = schema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: 'Invalid response payload.' });
  if (parsed.data.decision === 'accepted' && (!parsed.data.brotherSharedContact || parsed.data.brotherSharedContact.length < 5)) {
    return res.status(400).json({ error: 'Shared contact details are required.' });
  }
  try {
    const supabase = supabaseService();
    const { data: request } = await supabase
      .from('marriage_requests')
      .select('wali_email,wali_name,brother_id,status')
      .eq('request_id', parsed.data.requestId)
      .maybeSingle();
    if (!request) return res.status(404).json({ error: 'Request not found.' });
    const { error } = await supabase.rpc('respond_marriage_request', {
      p_request_id: parsed.data.requestId,
      p_decision: parsed.data.decision,
      p_shared_contact: parsed.data.brotherSharedContact ?? null,
      p_actor: user.id,
    });
    if (error) return res.status(403).json({ error: error.message });
    if (parsed.data.decision === 'accepted') {
      await sendEmail(request.wali_email, 'Azwaj: Introduction Request Accepted',
        `Assalamu Alaikum ${request.wali_name}, the brother accepted your request. Shared contact: ${parsed.data.brotherSharedContact}`);
    } else {
      await sendEmail(request.wali_email, 'Azwaj: Introduction Request Updated',
        `Assalamu Alaikum ${request.wali_name}, the brother respectfully declined this request.`);
    }
    return res.status(200).json({ ok: true });
  } catch {
    return res.status(500).json({ error: 'Unable to respond to the request.' });
  }
}
