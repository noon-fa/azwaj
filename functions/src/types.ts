export type UserRole = 'brother' | 'scholar' | 'staff' | 'admin';

export type MarriageRequestStatus = 'pending' | 'accepted' | 'declined' | 'expired';

export type BrotherProfileStatus =
  | 'pending_review'
  | 'changes_requested'
  | 'approved'
  | 'rejected'
  | 'suspended';

export type BookingStatus =
  | 'confirmed'
  | 'completed'
  | 'cancelled_by_client'
  | 'cancelled_by_scholar'
  | 'cancelled_by_admin';

export interface EmailMessage {
  to: string;
  subject: string;
  html: string;
  text: string;
  type: string;
}
