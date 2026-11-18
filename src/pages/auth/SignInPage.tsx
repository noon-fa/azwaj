import { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Mail, Info } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/src/components/ui/button';
import { Input } from '@/src/components/ui/input';
import { Label } from '@/src/components/ui/label';
import { useAuth } from '@/src/contexts/AuthContext';

export function SignInPage() {
  const { supabaseUser, role, signInWithPassword, signUp, resetPassword, signInWithGoogle } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const nextPath = (location.state as { from?: string } | null)?.from || '/dashboard';

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [mode, setMode] = useState<'signin'|'signup'|'reset'>('signin');
  const [sending, setSending] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);

  useEffect(() => {
    if (supabaseUser?.email_confirmed_at && role) {
      const target =
        role === 'admin' || role === 'staff'
          ? '/admin'
          : role === 'scholar'
            ? '/scholar/dashboard'
            : nextPath;
      navigate(target, { replace: true });
    }
  }, [supabaseUser, role, navigate, nextPath]);

  const handleEmailLink = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError(null);
    if (!email.trim() || !email.includes('@')) {
      setAuthError('Please enter a valid email address.');
      return;
    }
    setSending(true);
    try {
      if (mode === 'signup') {
        await signUp(email.trim(), password, displayName.trim());
        toast.success('Account created. Check your email to verify it.');
      } else if (mode === 'reset') {
        await resetPassword(email.trim());
        toast.success('Password reset email sent.');
      } else {
        await signInWithPassword(email.trim(), password);
        toast.success('Signed in successfully.');
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Unable to send sign-in link.';
      setAuthError(msg);
    } finally {
      setSending(false);
    }
  };

  const handleGoogle = async () => {
    setAuthError(null);
    try {
      await signInWithGoogle();
      toast.success('Signed in successfully.');
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Google sign-in failed.';
      setAuthError(msg);
    }
  };

  return (
    <div className="mx-auto max-w-md px-4 py-16 sm:px-6">
      <div className="rounded-xl border border-[#E5E0D5] bg-white p-8 space-y-6">
        <div className="space-y-2">
          <p className="text-xs font-medium tracking-wide text-[#9A7B3E]">
            Account Access
          </p>
          <h1 className="font-serif text-3xl font-semibold text-[#1A2421]">
            Sign in to Azwaj
          </h1>
          <p className="text-sm text-[#54615C]">
            For brothers registering a marriage profile, appointed scholars, and Azwaj staff.
            Walis do not need an account to submit introduction requests.
          </p>
        </div>

        {authError && (
          <div
            role="alert"
            className="rounded-lg border border-[#B91C1C]/30 bg-[#FEF2F2] p-3.5 text-xs leading-relaxed text-[#B91C1C]"
          >
            {authError}
          </div>
        )}

        <div className="flex gap-2">
          {(['signin','signup','reset'] as const).map((item) => (
            <Button key={item} type="button" variant={mode === item ? 'default' : 'outline'} size="sm" onClick={() => setMode(item)}>
              {item === 'signin' ? 'Sign in' : item === 'signup' ? 'Register' : 'Reset'}
            </Button>
          ))}
        </div>
        <form onSubmit={handleEmailLink} className="space-y-4">
            {mode === 'signup' && (
              <div className="space-y-1.5">
                <Label htmlFor="signin-name">Display Name</Label>
                <Input id="signin-name" value={displayName} onChange={(e) => setDisplayName(e.target.value)} required />
              </div>
            )}
            <div className="space-y-1.5">
              <Label htmlFor="signin-email">Email Address</Label>
              <Input
                id="signin-email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="brother@example.com"
                required
              />
            </div>
            {mode !== 'reset' && (
              <div className="space-y-1.5">
                <Label htmlFor="signin-password">Password</Label>
                <Input id="signin-password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required minLength={8} />
              </div>
            )}
            <Button type="submit" className="w-full" disabled={sending}>
              <Mail className="h-4 w-4" />
              <span>{sending ? 'Please wait…' : mode === 'signup' ? 'Create Account' : mode === 'reset' ? 'Send Reset Email' : 'Sign In'}</span>
            </Button>
        </form>

        <div className="relative py-1">
          <div className="absolute inset-0 flex items-center">
            <span className="w-full border-t border-[#E5E0D5]" />
          </div>
          <div className="relative flex justify-center text-xs">
            <span className="bg-white px-2 text-[#7B8682]">or continue with</span>
          </div>
        </div>

        <Button
          type="button"
          variant="outline"
          className="w-full"
          onClick={handleGoogle}
        >
          Sign in with Google
        </Button>

        <div className="rounded-lg border border-[#E5E0D5] bg-[#FAF9F6] p-3.5 flex items-start gap-2.5 text-xs text-[#54615C]">
          <Info className="h-4 w-4 text-[#14533C] shrink-0 mt-0.5" />
          <span>
            Email verification confirms mailbox ownership only; it does not serve as real-world
            identity verification.
          </span>
        </div>
      </div>
    </div>
  );
}
