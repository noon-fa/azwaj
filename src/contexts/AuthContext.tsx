import React, { createContext, useCallback, useContext, useEffect, useState } from 'react';
import {
  GoogleAuthProvider,
  isSignInWithEmailLink,
  onAuthStateChanged,
  sendSignInLinkToEmail,
  signInWithEmailLink,
  signInWithPopup,
  signOut,
  type User,
} from 'firebase/auth';
import { doc, getDoc, serverTimestamp, setDoc } from 'firebase/firestore';
import { auth, db } from '@/src/lib/firebase';
import { handleFirestoreError, OperationType } from '@/src/lib/firestoreError';
import type { StaffPermission, UserAccount, UserRole } from '@/src/types/domain';

interface AuthContextValue {
  firebaseUser: User | null;
  account: UserAccount | null;
  staffPermissions: StaffPermission | null;
  role: UserRole | null;
  isAdmin: boolean;
  isLoading: boolean;
  sendPasswordlessLink: (email: string, nextPath?: string) => Promise<void>;
  completeEmailLink: (email: string, href: string) => Promise<void>;
  checkIsEmailSignInLink: (href: string) => boolean;
  signInWithGoogle: () => Promise<void>;
  logout: () => Promise<void>;
  refreshAccount: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

const BOOTSTRAP_ADMIN_EMAIL = 'itsmefminsaf@gmail.com';

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [firebaseUser, setFirebaseUser] = useState<User | null>(null);
  const [account, setAccount] = useState<UserAccount | null>(null);
  const [staffPermissions, setStaffPermissions] = useState<StaffPermission | null>(null);
  const [isAdminFlag, setIsAdminFlag] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const loadOrBootstrapUser = useCallback(async (user: User) => {
    try {
      const userRef = doc(db, 'users', user.uid);
      const userSnap = await getDoc(userRef);

      const isBootstrapEmail =
        user.email?.toLowerCase() === BOOTSTRAP_ADMIN_EMAIL.toLowerCase() &&
        user.emailVerified;

      if (!userSnap.exists()) {
        const initialRole: UserRole = isBootstrapEmail ? 'admin' : 'brother';
        const displayName =
          user.displayName?.trim() ||
          user.email?.split('@')[0] ||
          'Azwaj Member';

        await setDoc(userRef, {
          uid: user.uid,
          email: user.email || '',
          displayName: displayName.slice(0, 100),
          role: initialRole,
          accountStatus: 'active',
          emailVerified: user.emailVerified,
          countryCode: 'LK',
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        });

        if (isBootstrapEmail) {
          await setDoc(doc(db, 'admins', user.uid), {
            uid: user.uid,
            email: user.email || BOOTSTRAP_ADMIN_EMAIL,
            grantedBy: 'system_bootstrap',
            createdAt: serverTimestamp(),
          });
        }
      }

      const freshSnap = await getDoc(userRef);
      const userData = freshSnap.exists() ? (freshSnap.data() as UserAccount) : null;
      setAccount(userData);

      const adminSnap = await getDoc(doc(db, 'admins', user.uid));
      const resolvedIsAdmin =
        isBootstrapEmail || adminSnap.exists() || userData?.role === 'admin';
      setIsAdminFlag(resolvedIsAdmin);

      if (userData?.role === 'staff') {
        const staffSnap = await getDoc(doc(db, 'staffPermissions', user.uid));
        setStaffPermissions(
          staffSnap.exists() ? (staffSnap.data() as StaffPermission) : null
        );
      } else {
        setStaffPermissions(null);
      }
    } catch (error) {
      handleFirestoreError(error, OperationType.GET, `users/${user.uid}`);
    }
  }, []);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setFirebaseUser(user);
      if (user && user.emailVerified) {
        try {
          await loadOrBootstrapUser(user);
        } catch (err) {
          console.error('Failed to load user record:', err);
        }
      } else {
        setAccount(null);
        setStaffPermissions(null);
        setIsAdminFlag(false);
      }
      setIsLoading(false);
    });
    return () => unsubscribe();
  }, [loadOrBootstrapUser]);

  const sendPasswordlessLink = async (email: string, nextPath = '/dashboard') => {
    const continueUrl = new URL('/auth/complete', window.location.origin);
    continueUrl.searchParams.set('next', nextPath);
    continueUrl.searchParams.set('emailHint', email.trim());

    await sendSignInLinkToEmail(auth, email.trim(), {
      url: continueUrl.toString(),
      handleCodeInApp: true,
    });
  };

  const completeEmailLink = async (email: string, href: string) => {
    await signInWithEmailLink(auth, email.trim(), href);
  };

  const checkIsEmailSignInLink = (href: string) => {
    return isSignInWithEmailLink(auth, href);
  };

  const signInWithGoogle = async () => {
    const provider = new GoogleAuthProvider();
    provider.setCustomParameters({ prompt: 'select_account' });
    await signInWithPopup(auth, provider);
  };

  const logout = async () => {
    await signOut(auth);
    setAccount(null);
    setStaffPermissions(null);
    setIsAdminFlag(false);
  };

  const refreshAccount = async () => {
    if (firebaseUser) {
      await loadOrBootstrapUser(firebaseUser);
    }
  };

  const resolvedRole: UserRole | null = isAdminFlag
    ? 'admin'
    : account?.role ?? null;

  return (
    <AuthContext.Provider
      value={{
        firebaseUser,
        account,
        staffPermissions,
        role: resolvedRole,
        isAdmin: isAdminFlag,
        isLoading,
        sendPasswordlessLink,
        completeEmailLink,
        checkIsEmailSignInLink,
        signInWithGoogle,
        logout,
        refreshAccount,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider');
  return ctx;
}
