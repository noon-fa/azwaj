export type UserRole = 'member' | 'brother' | 'scholar' | 'staff' | 'admin';
export type AccountStatus = 'active' | 'suspended' | 'deletion_requested';

export type BrotherProfileStatus =
  | 'pending_review'
  | 'changes_requested'
  | 'approved'
  | 'rejected'
  | 'suspended';

export type MaritalStatus = 'never_married' | 'divorced' | 'widowed';

export type MarriageRequestStatus = 'pending' | 'accepted' | 'declined' | 'expired';

export type CounsellingType = 'pre_marital' | 'married_couples' | 'individual';
export type CounsellingFormat = 'online' | 'in_person';
export type BookingStatus =
  | 'confirmed'
  | 'completed'
  | 'cancelled_by_client'
  | 'cancelled_by_scholar'
  | 'cancelled_by_admin';

export interface UserAccount {
  uid: string;
  email: string;
  displayName: string;
  role: UserRole;
  accountStatus: AccountStatus;
  emailVerified: boolean;
  countryCode: string;
  createdAt: string;
  updatedAt: string;
}

export interface StaffPermission {
  uid: string;
  email: string;
  displayName: string;
  canReviewBrothers: boolean;
  canManageRequests: boolean;
  canManageScholars: boolean;
  canManageBookings: boolean;
  canViewAuditLogs: boolean;
  isActive: boolean;
  updatedBy: string;
  createdAt: string;
  updatedAt: string;
}

export interface BrotherPublicProfile {
  brotherId: string;
  displayName: string;
  birthYear: number;
  country: string;
  cityDistrict: string;
  nationality: string;
  education: string;
  occupation: string;
  maritalStatus: MaritalStatus;
  religiousPractice: string;
  languages: string[];
  marriagePreferences: string;
  about: string;
  photoUrl?: string;
  showPhotoPublicly: boolean;
  consentToPublish: boolean;
  status: BrotherProfileStatus;
  isPublished: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface BrotherPrivateDetail {
  brotherId: string;
  fullName: string;
  email: string;
  phone: string;
  dateOfBirth: string;
  adminReviewNote?: string;
  reviewedBy?: string;
  createdAt: string;
  updatedAt: string;
}

export interface MarriageRequest {
  requestId: string;
  lockId: string;
  brotherId: string;
  brotherDisplayName: string;
  waliName: string;
  waliRelationship: string;
  waliEmail: string;
  normalizedWaliEmail: string;
  waliPhone: string;
  waliCountry: string;
  waliCityDistrict: string;
  sisterName: string;
  sisterAge: number;
  sisterCountry: string;
  sisterCityDistrict: string;
  sisterEducation: string;
  sisterOccupation?: string;
  sisterLanguages: string[];
  sisterMarriageInfo: string;
  sisterNote: string;
  additionalMessage?: string;
  confirmedWaliAuthority: boolean;
  privacyConsent: boolean;
  status: MarriageRequestStatus;
  responseDeadlineAt: string;
  respondedAt?: string;
  contactSharingStatus: 'locked' | 'wali_contact_released' | 'exchanged';
  brotherSharedContact?: string;
  createdAt: string;
  updatedAt: string;
}

export interface ScholarProfile {
  scholarId: string;
  uid?: string;
  email?: string;
  fullName: string;
  photoUrl?: string;
  gender: 'male' | 'female';
  title: string;
  qualification: string;
  education: string;
  expertise: string[];
  languages: string[];
  biography: string;
  experienceYears: number;
  counsellingFormats: CounsellingFormat[];
  counsellingTypes: CounsellingType[];
  sessionDurationMinutes: number;
  sessionPriceLkr: number;
  currency: string;
  country: string;
  cityLocation?: string;
  timezone: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface DayAvailability {
  enabled: boolean;
  startTime: string; // "09:00"
  endTime: string;   // "17:00"
}

export interface BreakWindow {
  dayOfWeek: number; // 0 (Sun) - 6 (Sat)
  startTime: string;
  endTime: string;
}

export interface ScholarAvailability {
  scholarId: string;
  scholarUid?: string;
  timezone: string;
  weeklyHours: Record<string, DayAvailability>; // "0".."6"
  breaks: BreakWindow[];
  unavailableDates: string[]; // "YYYY-MM-DD"
  createdAt: string;
  updatedAt: string;
}

export interface CounsellingSlotLock {
  slotLockId: string;
  scholarId: string;
  bookingId: string;
  slotStartIso: string;
  slotEndIso: string;
  status: 'booked' | 'cancelled';
  createdAt: string;
  updatedAt: string;
}

export interface CounsellingBooking {
  bookingId: string;
  slotLockId: string;
  scholarId: string;
  scholarUid?: string;
  scholarName: string;
  counsellingType: CounsellingType;
  format: CounsellingFormat;
  slotStartIso: string;
  slotEndIso: string;
  timezone: string;
  durationMinutes: number;
  sessionPriceLkr: number;
  currency: string;
  clientName: string;
  clientEmail: string;
  clientPhone: string;
  issueSummary: string;
  status: BookingStatus;
  paymentStatus: 'payment_not_enabled';
  cancellationReason?: string;
  createdAt: string;
  updatedAt: string;
}

export interface ContactInquiry {
  inquiryId: string;
  name: string;
  email: string;
  topic: string;
  message: string;
  status: 'new' | 'reviewed' | 'resolved';
  createdAt: string;
  updatedAt: string;
}

export interface AuditLog {
  logId: string;
  actorUid: string;
  actorEmail: string;
  action: string;
  targetCollection: string;
  targetId: string;
  summary: string;
  createdAt: string;
}

export interface PlatformSetting {
  settingId: string;
  countryCode: string;
  countryName: string;
  defaultCurrency: string;
  defaultTimezone: string;
  requestExpiryDays: number;
  paymentsEnabled: boolean;
  emailProvider: 'resend' | 'smtp' | 'disabled';
  supportEmail: string;
  createdAt: string;
  updatedAt: string;
}
