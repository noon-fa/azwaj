import { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';

export function AuthActionPage() {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  useEffect(() => {
    navigate(`/auth/complete${window.location.search}`, { replace: true });
  }, [navigate, params]);
  return null;
}
