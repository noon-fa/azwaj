import { z } from 'zod';
import { authenticatedUser, supabaseService } from '../_lib/supabase';

export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed.' });
  if (req.body?.action === 'submit_inquiry') {
    const schema = z.object({ action:z.literal('submit_inquiry'), name:z.string().min(2),email:z.string().email(),topic:z.string().min(2),message:z.string().min(10) });
    const parsed=schema.safeParse(req.body);
    if (!parsed.success) return res.status(400).json({error:'Invalid inquiry.'});
    const supabase=supabaseService();
    const {data,error}=await supabase.from('contact_inquiries').insert({name:parsed.data.name,email:parsed.data.email,topic:parsed.data.topic,message:parsed.data.message}).select('inquiry_id').single();
    if(error) return res.status(500).json({error:'Unable to submit inquiry.'});
    return res.status(200).json({inquiryId:data.inquiry_id});
  }

  const user=await authenticatedUser(req);
  if(!user?.email_confirmed_at) return res.status(401).json({error:'Verified authentication required.'});
  const supabase=supabaseService();
  const {data:account}=await supabase.from('users').select('role').eq('uid',user.id).maybeSingle();
  if(account?.role!=='admin') return res.status(403).json({error:'Administrator access required.'});
  const action=req.body?.action;
  try {
    if(action==='moderate_brother'){
      const p=z.object({action:z.literal('moderate_brother'),brotherId:z.string().uuid(),status:z.enum(['pending_review','changes_requested','approved','rejected','suspended']),isPublished:z.boolean(),consentToPublish:z.boolean(),note:z.string().optional()}).parse(req.body);
      const published=p.status==='approved'&&p.consentToPublish?p.isPublished:false;
      await supabase.from('brother_profiles').update({status:p.status,is_published:published,updated_at:new Date().toISOString()}).eq('brother_id',p.brotherId);
      await supabase.from('brother_private_details').update({admin_review_note:p.note,reviewed_by:user.id,updated_at:new Date().toISOString()}).eq('brother_id',p.brotherId);
    } else if(action==='update_role'){
      const p=z.object({action:z.literal('update_role'),targetUid:z.string().uuid(),role:z.enum(['member','brother','scholar','staff','admin']),staffPerms:z.any().optional()}).parse(req.body);
      await supabase.from('users').update({role:p.role,updated_at:new Date().toISOString()}).eq('uid',p.targetUid);
      if(p.role==='staff'&&p.staffPerms) await supabase.from('staff_permissions').upsert({uid:p.targetUid,...p.staffPerms,updated_by:user.id});
    } else if(action==='save_scholar'){
      const p=z.object({action:z.literal('save_scholar'),scholarId:z.string().uuid().optional(),input:z.record(z.string(),z.any())}).parse(req.body);
      const i=p.input;
      const payload={full_name:i.fullName,email:i.email||null,gender:i.gender,title:i.title,qualification:i.qualification,education:i.education,expertise:i.expertise,languages:i.languages,biography:i.biography,experience_years:i.experienceYears,counselling_formats:i.counsellingFormats,counselling_types:i.counsellingTypes,session_duration_minutes:i.sessionDurationMinutes,session_price_lkr:i.sessionPriceLkr,currency:'LKR',country:i.country,city_location:i.cityLocation||null,timezone:i.timezone,is_active:i.isActive,uid:i.uid||null,photo_url:i.photoUrl||null};
      let scholarId=p.scholarId;
      if(scholarId) await supabase.from('scholars').update(payload).eq('scholar_id',scholarId);
      else {const {data}=await supabase.from('scholars').insert(payload).select('scholar_id').single(); scholarId=data?.scholar_id;}
      if(scholarId&&!p.scholarId) await supabase.from('scholar_availability').upsert({scholar_id:scholarId,timezone:i.timezone});
    } else if(action==='update_inquiry'){
      const p=z.object({action:z.literal('update_inquiry'),inquiryId:z.string().uuid(),status:z.enum(['new','reviewed','resolved'])}).parse(req.body);
      await supabase.from('contact_inquiries').update({status:p.status,updated_at:new Date().toISOString()}).eq('inquiry_id',p.inquiryId);
    } else if(action==='save_settings'){
      const p=z.object({action:z.literal('save_settings'),requestExpiryDays:z.number().int().min(1).max(30),emailProvider:z.enum(['resend','disabled']),supportEmail:z.string().email()}).parse(req.body);
      await supabase.from('platform_settings').upsert({setting_id:'LK',country_code:'LK',country_name:'Sri Lanka',default_currency:'LKR',default_timezone:'Asia/Colombo',request_expiry_days:p.requestExpiryDays,payments_enabled:false,email_provider:p.emailProvider,support_email:p.supportEmail});
    } else {
      return res.status(400).json({error:'Unknown admin action.'});
    }
    return res.status(200).json({ok:true});
  } catch {
    return res.status(400).json({error:'Invalid or failed admin operation.'});
  }
}
