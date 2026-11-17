import { useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { Button } from '@/src/components/ui/button';
import { useAuth } from '@/src/contexts/AuthContext';

export function AuthActionPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { checkIsEmailSignInLink } = useAuth();

  useEffect(() => {
    const mode = searchParams.get('mode');
    if (mode === 'signIn' || checkIsEmailSignInLink(window.location.href)) {
      navigate(`/auth/complete${window.location.search}`, { replace: true });
    }
  }, [searchParams, checkIsEmailSignInLink, navigate]);

  return (
    <div className="mx-auto max-w-md px-4 py-16">
      <div className="rounded-xl border border-[#E5E0D5] bg-white p-8 space-y-4 text-center">
        <h1 className="font-serif text-2xl font-semibold text-[#1A2421]">
          Authentication Action
        </h1>
        <p className="text-sm text-[#54615C]">
          If your link is invalid or expired, please request a fresh sign-in link.
        </p>
        <Button asChild variant="outline">
          <Link to="/sign-in">Return to Sign In</Link>
        </Button>
      </div>
    </div>
  );
}
