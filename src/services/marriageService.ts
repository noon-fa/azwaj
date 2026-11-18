import { apiPost } from '@/src/lib/api';
import { supabase } from '@/src/lib/supabase';
import type { WaliIntroductionInput } from '@/src/schemas/validation';
import type { MarriageRequest } from '@/src/types/domain';

export async function submitWaliIntroductionRequest(params: {
  brotherId: string;
  input: WaliIntroductionInput;
}) {
  return apiPost<{ requestId: string; responseDeadlineAt: string }>(
    '/api/marriage/submit',
    { brotherId: params.brotherId, ...params.input }
  );
}

export async function listBrotherMarriageRequests(brotherId: string): Promise<MarriageRequest[]> {
  const { data, error } = await supabase
    .from('marriage_requests')
    .select('*')
    .eq('brother_id', brotherId)
    .order('created_at', { ascending: false });
  if (error) throw error;
  return (data ?? []).map((row: any) => ({
    ...row,
    requestId: row.request_id,
    brotherId: row.brother_id,
    responseDeadlineAt: row.response_deadline_at,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  }));
}

export async function respondToBrotherMarriageRequest(params: {
  requestId: string;
  lockId: string;
  decision: 'accepted' | 'declined';
  brotherSharedContact?: string;
}) {
  await apiPost('/api/marriage/respond', {
    requestId: params.requestId,
    decision: params.decision,
    brotherSharedContact: params.brotherSharedContact,
  });
}
