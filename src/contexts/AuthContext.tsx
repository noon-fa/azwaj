import React, { createContext, useCallback, useContext, useEffect, useState } from 'react';
import type { Session, User } from '@supabase/supabase-js';
import { supabase } from '@/src/lib/supabase';
import type { StaffPermission, UserAccount, UserRole } from '@/src/types/domain';

interface AuthContextValue {
  supabaseUser: User | null;
  session: Session | null;
  account: UserAccount | null;
  staffPermissions: StaffPermission | null;
  role: UserRole | null;
  isAdmin: boolean;
  isLoading: boolean;
  signInWithPassword: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, displayName: string) => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  signInWithGoogle: () => Promise<void>;
  logout: () => Promise<void>;
  refreshAccount: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [supabaseUser, setSupabaseUser] = useState<User | null>(null);
  const [account, setAccount] = useState<UserAccount | null>(null);
  const [staffPermissions, setStaffPermissions] = useState<StaffPermission | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const loadAccount = useCallback(async (user: User) => {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('uid', user.id)
      .maybeSingle();
    if (error) throw error;
    setAccount(data ? ({
      uid: data.uid,
      email: data.email,
      displayName: data.display_name,
      role: data.role,
      accountStatus: data.account_status,
      emailVerified: data.email_verified,
      countryCode: data.country_code,
      createdAt: data.created_at,
      updatedAt: data.updated_at,
    } as UserAccount) : null);
    if (data?.role === 'staff') {
      const { data: permissions } = await supabase
        .from('staff_permissions')
        .select('*')
        .eq('uid', user.id)
        .maybeSingle();
      setStaffPermissions(permissions as StaffPermission | null);
    } else {
      setStaffPermissions(null);
    }
  }, []);

  useEffect(() => {
    void supabase.auth.getSession().then(async ({ data }) => {
      const nextSession = data.session;
      setSession(nextSession);
      setSupabaseUser(nextSession?.user ?? null);
      if (nextSession?.user) await loadAccount(nextSession.user).catch(() => setAccount(null));
      setIsLoading(false);
    });
    const { data: subscription } = supabase.auth.onAuthStateChange(async (_event, nextSession) => {
      setSession(nextSession);
      setSupabaseUser(nextSession?.user ?? null);
      if (nextSession?.user) {
        await loadAccount(nextSession.user).catch(() => setAccount(null));
      } else {
        setAccount(null);
        setStaffPermissions(null);
      }
      setIsLoading(false);
    });
    return () => subscription.subscription.unsubscribe();
  }, [loadAccount]);

  const signUp = async (email: string, password: string, displayName: string) => {
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { display_name: displayName }, emailRedirectTo: `${window.location.origin}/auth/action` },
    });
    if (error) throw error;
  };

  const signInWithPassword = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw error;
  };

  const resetPassword = async (email: string) => {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/auth/action?mode=recovery`,
    });
    if (error) throw error;
  };

  const signInWithGoogle = async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: `${window.location.origin}/auth/action` },
    });
    if (error) throw error;
  };

  const logout = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  };

  const refreshAccount = async () => {
    if (supabaseUser) await loadAccount(supabaseUser);
  };

  const role = account?.role ?? null;
  return (
    <AuthContext.Provider value={{
      supabaseUser, session, account, staffPermissions, role,
      isAdmin: role === 'admin', isLoading, signInWithPassword, signUp,
      resetPassword, signInWithGoogle, logout, refreshAccount,
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider');
  return ctx;
}
