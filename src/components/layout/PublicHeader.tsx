import { useState } from 'react';
import { Link, NavLink } from 'react-router-dom';
import { Menu, X } from 'lucide-react';
import { useAuth } from '@/src/contexts/AuthContext';
import { Button } from '@/src/components/ui/button';
import { AzwajLogo } from './AzwajLogo';

const NAV_ITEMS = [
  { label: 'Introductions', to: '/marriage' },
  { label: 'Scholars', to: '/scholars' },
  { label: 'Counselling', to: '/counselling' },
  { label: 'How It Works', to: '/how-it-works' },
  { label: 'About', to: '/about' },
];

export function PublicHeader() {
  const { supabaseUser, role } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);

  const dashboardPath =
    role === 'admin' || role === 'staff'
      ? '/admin'
      : role === 'scholar'
        ? '/scholar/dashboard'
        : '/dashboard';

  return (
    <header className="sticky top-0 z-40 border-b border-[#E5E0D5] bg-[#FAF9F6]/95 backdrop-blur-xs">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-8 px-4 sm:px-6 lg:px-8">
        <AzwajLogo />

        <nav
          aria-label="Primary navigation"
          className="hidden md:flex items-center gap-7 text-sm font-medium text-[#54615C]"
        >
          {NAV_ITEMS.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                `whitespace-nowrap shrink-0 transition-colors hover:text-[#14533C] hover:underline underline-offset-4 ${
                  isActive ? 'text-[#14533C] font-semibold' : ''
                }`
              }
            >
              {item.label}
            </NavLink>
          ))}
        </nav>

        <div className="flex items-center gap-3 shrink-0">
          {supabaseUser && supabaseUser.email_confirmed_at ? (
            <Button asChild size="sm">
              <Link to={dashboardPath}>Dashboard</Link>
            </Button>
          ) : (
            <Button asChild size="sm">
              <Link to="/sign-in">Brother Sign In</Link>
            </Button>
          )}

          <button
            type="button"
            aria-label={mobileOpen ? 'Close navigation menu' : 'Open navigation menu'}
            onClick={() => setMobileOpen((prev) => !prev)}
            className="inline-flex h-10 w-10 items-center justify-center rounded-lg border border-[#E5E0D5] bg-white text-[#1A2421] md:hidden cursor-pointer"
          >
            {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {mobileOpen && (
        <div className="border-t border-[#E5E0D5] bg-white px-4 py-4 md:hidden">
          <nav className="flex flex-col space-y-2">
            {NAV_ITEMS.map((item) => (
              <Link
                key={item.to}
                to={item.to}
                onClick={() => setMobileOpen(false)}
                className="rounded-lg px-3 py-2.5 text-sm font-medium text-[#1A2421] hover:bg-[#FAF9F6]"
              >
                {item.label}
              </Link>
            ))}
            <Link
              to="/contact"
              onClick={() => setMobileOpen(false)}
              className="rounded-lg px-3 py-2.5 text-sm font-medium text-[#1A2421] hover:bg-[#FAF9F6]"
            >
              Contact
            </Link>
          </nav>
        </div>
      )}
    </header>
  );
}
