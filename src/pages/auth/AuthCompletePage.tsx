import { useEffect, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { toast } from 'sonner';
import { Button } from '@/src/components/ui/button';
import { Input } from '@/src/components/ui/input';
import { Label } from '@/src/components/ui/label';
import { useAuth } from '@/src/contexts/AuthContext';

export function AuthCompletePage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { checkIsEmailSignInLink, completeEmailLink } = useAuth();

  const emailHint = searchParams.get('emailHint') || '';
  const nextPath = searchParams.get('next') || '/dashboard';

  const [email, setEmail] = useState(emailHint);
  const [status, setStatus] = useState<'checking' | 'needs_email' | 'completing' | 'error'>(
    'checking'
  );
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    const href = window.location.href;
    if (!checkIsEmailSignInLink(href)) {
      setStatus('error');
      setErrorMsg('This sign-in link is invalid or has already expired. Please request a new link.');
      return;
    }
    if (emailHint) {
      setStatus('completing');
      completeEmailLink(emailHint, href)
        .then(() => {
          toast.success('Email verified and signed in.');
          navigate(nextPath, { replace: true });
        })
        .catch((err) => {
          setStatus('error');
          setErrorMsg(
            err instanceof Error
              ? err.message
              : 'The sign-in link has expired or could not be verified.'
          );
        });
    } else {
      setStatus('needs_email');
    }
  }, [checkIsEmailSignInLink, completeEmailLink, emailHint, navigate, nextPath]);

  const handleConfirmEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('completing');
    setErrorMsg(null);
    try {
      await completeEmailLink(email.trim(), window.location.href);
      toast.success('Email verified and signed in.');
      navigate(nextPath, { replace: true });
    } catch (err) {
      setStatus('error');
      setErrorMsg(
        err instanceof Error ? err.message : 'Unable to verify this email sign-in link.'
      );
    }
  };

  return (
    <div className="mx-auto max-w-md px-4 py-16">
      <div className="rounded-xl border border-[#E5E0D5] bg-white p-8 space-y-5">
        <h1 className="font-serif text-2xl font-semibold text-[#1A2421]">
          Completing Email Verification
        </h1>

        {(status === 'checking' || status === 'completing') && (
          <p className="text-sm text-[#54615C]">
            Verifying your secure sign-in link…
          </p>
        )}

        {status === 'needs_email' && (
          <form onSubmit={handleConfirmEmail} className="space-y-4">
            <p className="text-sm text-[#54615C]">
              To complete sign-in safely on this device, please confirm the email address you used
              to request the link.
            </p>
            <div className="space-y-1.5">
              <Label htmlFor="confirm-email">Email Address</Label>
              <Input
                id="confirm-email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <Button type="submit" className="w-full">
              Verify &amp; Sign In
            </Button>
          </form>
        )}

        {status === 'error' && (
          <div className="space-y-4">
            <p className="text-sm text-[#B91C1C]">{errorMsg}</p>
            <Button asChild variant="outline" className="w-full">
              <Link to="/sign-in">Request a Fresh Sign-In Link</Link>
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
