import { Link } from 'react-router-dom';
import { AzwajLogo } from './AzwajLogo';

export function PublicFooter() {
  return (
    <footer className="border-t border-[#E5E0D5] bg-[#F2EFE9]/60">
      <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-10 md:grid-cols-4">
          <div className="space-y-3 md:col-span-2">
            <AzwajLogo />
            <p className="max-w-md text-sm leading-relaxed text-[#54615C]">
              A dignified, privacy-conscious Sri Lankan platform facilitating
              wali-mediated Muslim marriage introductions and confidential
              counselling with qualified Alims and Alimahs.
            </p>
            <p className="text-xs text-[#7B8682]">
              Initial deployment: Sri Lanka (LK) · Currency: LKR · Timezone: Asia/Colombo
            </p>
          </div>

          <div className="space-y-3">
            <h4 className="text-sm font-semibold text-[#1A2421]">Platform</h4>
            <ul className="space-y-2 text-sm text-[#54615C]">
              <li>
                <Link to="/marriage" className="hover:text-[#14533C]">
                  Marriage Introductions
                </Link>
              </li>
              <li>
                <Link to="/scholars" className="hover:text-[#14533C]">
                  Scholars Directory
                </Link>
              </li>
              <li>
                <Link to="/counselling" className="hover:text-[#14533C]">
                  Islamic Counselling
                </Link>
              </li>
              <li>
                <Link to="/how-it-works" className="hover:text-[#14533C]">
                  How It Works
                </Link>
              </li>
              <li>
                <Link to="/sign-in" className="hover:text-[#14533C]">
                  Brother Registration &amp; Sign In
                </Link>
              </li>
            </ul>
          </div>

          <div className="space-y-3">
            <h4 className="text-sm font-semibold text-[#1A2421]">Trust &amp; Legal</h4>
            <ul className="space-y-2 text-sm text-[#54615C]">
              <li>
                <Link to="/about" className="hover:text-[#14533C]">
                  About Azwaj
                </Link>
              </li>
              <li>
                <Link to="/contact" className="hover:text-[#14533C]">
                  Contact &amp; Support
                </Link>
              </li>
              <li>
                <Link to="/privacy" className="hover:text-[#14533C]">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link to="/terms" className="hover:text-[#14533C]">
                  Terms and Conditions
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-10 flex flex-col gap-3 border-t border-[#E5E0D5] pt-6 text-xs text-[#7B8682] sm:flex-row sm:items-center sm:justify-between">
          <p>© {new Date().getFullYear()} Azwaj. All rights reserved.</p>
          <p>
            Email verification confirms mailbox ownership only and does not constitute government identity verification.
          </p>
        </div>
      </div>
    </footer>
  );
}
