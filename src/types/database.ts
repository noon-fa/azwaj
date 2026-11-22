export type IntendedRole = "brother" | "sister";
export type AppRole =
  | "member"
  | "administrator"
  | "counsellor"
  | "scholar"
  | "wali";
export type DeletionRequestStatus = "pending" | "completed" | "cancelled";

export type Profile = {
  id: string;
  intended_role: IntendedRole;
  full_name: string;
  phone: string;
  country: string;
  city: string;
  preferred_language: string;
  date_of_birth: string;
  profile_visibility: boolean;
  data_processing_consent_at: string;
  created_at: string;
  updated_at: string;
};

type ProfileInsert = Omit<
  Profile,
  "created_at" | "updated_at" | "data_processing_consent_at"
> & {
  data_processing_consent_at?: string;
  created_at?: string;
  updated_at?: string;
};

export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: Profile;
        Insert: ProfileInsert;
        Update: Partial<ProfileInsert>;
        Relationships: [];
      };
      user_roles: {
        Row: {
          user_id: string;
          role: AppRole;
          created_at: string;
        };
        Insert: {
          user_id: string;
          role: AppRole;
          created_at?: string;
        };
        Update: never;
        Relationships: [];
      };
      account_deletion_requests: {
        Row: {
          id: string;
          user_id: string;
          status: DeletionRequestStatus;
          requested_at: string;
          processed_at: string | null;
        };
        Insert: {
          id?: string;
          user_id: string;
          status?: DeletionRequestStatus;
          requested_at?: string;
          processed_at?: string | null;
        };
        Update: never;
        Relationships: [];
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: {
      intended_role: IntendedRole;
      app_role: AppRole;
      deletion_request_status: DeletionRequestStatus;
    };
    CompositeTypes: Record<string, never>;
  };
};
