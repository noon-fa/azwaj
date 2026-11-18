import { useEffect, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { toast } from 'sonner';
import { Button } from '@/src/components/ui/button';
import { Input } from '@/src/components/ui/input';
import { Label } from '@/src/components/ui/label';
import { supabase } from '@/src/lib/supabase';

export function AuthCompletePage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const recovery = searchParams.get('mode') === 'recovery';
  const [password, setPassword] = useState('');
  const [status, setStatus] = useState<'ready' | 'error' | 'done'>('ready');
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    if (!recovery) {
      supabase.auth.getSession().then(({ data }) => {
        if (data.session) {
          toast.success('Email verified and signed in.');
          navigate('/dashboard', { replace: true });
        }
      });
    }
  }, [navigate, recovery]);

  const updatePassword = async (event: React.FormEvent) => {
    event.preventDefault();
    const { error } = await supabase.auth.updateUser({ password });
    if (error) {
      setErrorMsg(error.message);
      setStatus('error');
      return;
    }
    setStatus('done');
    toast.success('Password updated.');
  };

  return (
    <div className="mx-auto max-w-md px-4 py-16">
      <div className="rounded-xl border border-[#E5E0D5] bg-white p-8 space-y-5">
        <h1 className="font-serif text-2xl font-semibold text-[#1A2421]">
          {recovery ? 'Set a New Password' : 'Completing Email Verification'}
        </h1>
        {recovery && status !== 'done' ? (
          <form onSubmit={updatePassword} className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="new-password">New Password</Label>
              <Input id="new-password" type="password" value={password} onChange={(event) => setPassword(event.target.value)} required minLength={8} />
            </div>
            {status === 'error' && <p className="text-sm text-[#B91C1C]">{errorMsg}</p>}
            <Button type="submit" className="w-full">Update Password</Button>
          </form>
        ) : (
          <div className="space-y-4 text-sm text-[#54615C]">
            {status === 'done' ? <p>Your password has been updated.</p> : <p>Checking your Supabase verification session…</p>}
            <Button asChild variant="outline"><Link to="/sign-in">Return to Sign In</Link></Button>
          </div>
        )}
      </div>
    </div>
  );
}
