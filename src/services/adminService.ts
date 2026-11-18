import { apiPost } from '@/src/lib/api';
import { supabase } from '@/src/lib/supabase';
import type { ContactInquiryInput, ScholarFormInput } from '@/src/schemas/validation';
import type { AuditLog, BrotherPrivateDetail, BrotherProfileStatus, BrotherPublicProfile, ContactInquiry, CounsellingBooking, MarriageRequest, PlatformSetting, ScholarProfile, StaffPermission, UserAccount, UserRole } from '@/src/types/domain';

export async function submitContactInquiry(input: ContactInquiryInput): Promise<string> {
  const data = await apiPost<{ inquiryId: string }>('/api/admin/action', { action:'submit_inquiry', ...input });
  return data.inquiryId;
}

export async function fetchAdminDashboardData(): Promise<{
  brothers: BrotherPublicProfile[]; requests: MarriageRequest[]; scholars: ScholarProfile[]; bookings: CounsellingBooking[];
  users: UserAccount[]; inquiries: ContactInquiry[]; auditLogs: AuditLog[]; staffPermissions: StaffPermission[]; settings: PlatformSetting|null;
}> {
  const [brothers,requests,scholars,bookings,users,inquiries,logs,staff,settings] = await Promise.all([
    supabase.from('brother_profiles').select('*').order('updated_at',{ascending:false}),
    supabase.from('marriage_requests').select('*').order('created_at',{ascending:false}),
    supabase.from('scholars').select('*').order('full_name'),
    supabase.from('counselling_bookings').select('*').order('slot_start',{ascending:false}),
    supabase.from('users').select('*').order('created_at',{ascending:false}),
    supabase.from('contact_inquiries').select('*').order('created_at',{ascending:false}),
    supabase.from('audit_logs').select('*').order('created_at',{ascending:false}),
    supabase.from('staff_permissions').select('*'),
    supabase.from('platform_settings').select('*').eq('setting_id','LK').maybeSingle(),
  ]);
  return {
    brothers:(brothers.data??[]).map((r:any)=>({...r,brotherId:r.brother_id,displayName:r.display_name,isPublished:r.is_published,status:r.status})) as any,
    requests:(requests.data??[]).map((r:any)=>({...r,requestId:r.request_id,brotherId:r.brother_id,responseDeadlineAt:r.response_deadline_at,createdAt:r.created_at})) as any,
    scholars:(scholars.data??[]).map((r:any)=>({...r,scholarId:r.scholar_id,fullName:r.full_name,sessionPriceLkr:r.session_price_lkr})) as any,
    bookings:(bookings.data??[]).map((r:any)=>({...r,bookingId:r.booking_id,scholarId:r.scholar_id,slotStartIso:r.slot_start,slotEndIso:r.slot_end,sessionPriceLkr:r.session_price_lkr})) as any,
    users:(users.data??[]).map((r:any)=>({...r,uid:r.uid,displayName:r.display_name,accountStatus:r.account_status,emailVerified:r.email_verified,countryCode:r.country_code,createdAt:r.created_at,updatedAt:r.updated_at})) as any,
    inquiries:(inquiries.data??[]).map((r:any)=>({...r,inquiryId:r.inquiry_id,createdAt:r.created_at})) as any,
    auditLogs:(logs.data??[]) as any,
    staffPermissions:(staff.data??[]) as any,
    settings:(settings.data??null) as any,
  };
}

export async function getBrotherFullApplicationForAdmin(brotherId:string):Promise<{publicProfile:BrotherPublicProfile|null;privateDetail:BrotherPrivateDetail|null}> {
  const [pub,priv]=await Promise.all([
    supabase.from('brother_profiles').select('*').eq('brother_id',brotherId).maybeSingle(),
    supabase.from('brother_private_details').select('*').eq('brother_id',brotherId).maybeSingle(),
  ]);
  return {publicProfile:(pub.data??null) as any,privateDetail:(priv.data??null) as any};
}

export async function logAdminAction(_params:any):Promise<void> { /* Audit logs are written by privileged server operations. */ }

export async function moderateBrotherProfile(params:{actorUid:string;actorEmail:string;brotherId:string;status:BrotherProfileStatus;isPublished:boolean;consentToPublish:boolean;note?:string}):Promise<void> {
  await apiPost('/api/admin/action',{action:'moderate_brother',brotherId:params.brotherId,status:params.status,isPublished:params.isPublished,consentToPublish:params.consentToPublish,note:params.note});
}

export async function saveScholarRecord(params:{actorUid:string;actorEmail:string;scholarId?:string;input:ScholarFormInput}):Promise<string> {
  await apiPost<{ok:boolean}>('/api/admin/action',{action:'save_scholar',scholarId:params.scholarId,input:params.input});
  return params.scholarId||'';
}

export async function updateUserRoleAndStaffPermissions(params:{actorUid:string;actorEmail:string;targetUser:UserAccount;newRole:UserRole;staffPerms?:any}):Promise<void> {
  await apiPost('/api/admin/action',{action:'update_role',targetUid:params.targetUser.uid,role:params.newRole,staffPerms:params.staffPerms});
}

export async function updateInquiryStatus(params:{inquiryId:string;status:'new'|'reviewed'|'resolved'}):Promise<void> {
  await apiPost('/api/admin/action',{action:'update_inquiry',...params});
}

export async function savePlatformSettings(params:{actorUid:string;actorEmail:string;requestExpiryDays:number;emailProvider:'resend'|'smtp'|'disabled';supportEmail:string}):Promise<void> {
  await apiPost('/api/admin/action',{action:'save_settings',requestExpiryDays:params.requestExpiryDays,emailProvider:params.emailProvider==='smtp'||params.emailProvider==='disabled'?'disabled':'resend',supportEmail:params.supportEmail});
}

export async function initializeSriLankaDirectorySeed(_params:{actorUid:string;actorEmail:string}):Promise<void> {
  await savePlatformSettings({actorUid:_params.actorUid,actorEmail:_params.actorEmail,requestExpiryDays:7,emailProvider:'resend',supportEmail:'support@azwaj.lk'});
}
