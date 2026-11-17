import { Link } from 'react-router-dom';
import { Button } from '@/src/components/ui/button';

export function HowItWorksPage() {
  return (
    <div className="mx-auto max-w-5xl px-4 py-14 sm:px-6 lg:px-8 space-y-14">
      <header className="max-w-2xl space-y-4">
        <p className="text-xs font-medium tracking-wide text-[#9A7B3E]">How It Works</p>
        <h1 className="font-serif text-4xl font-semibold text-[#1A2421]">
          Three clear pathways built around modesty and accountability.
        </h1>
        <p className="text-base leading-relaxed text-[#54615C]">
          Azwaj separates marriage introductions from scholarly counselling while keeping every
          workflow straightforward for families.
        </p>
      </header>

      <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
        <section className="rounded-xl border border-[#E5E0D5] bg-white p-7 space-y-5">
          <h2 className="font-serif text-2xl font-semibold text-[#1A2421]">
            For Sisters &amp; Walis
          </h2>
          <ol className="space-y-4 text-sm text-[#54615C]">
            <li>
              <strong className="text-[#1A2421]">1. Browse without an account:</strong> View
              approved, published brother profiles filtered by district, age, education, marital
              status, and languages.
            </li>
            <li>
              <strong className="text-[#1A2421]">2. Submit a private introduction:</strong>{' '}
              Complete the respectful wali form directly on a brother’s profile page. Only one
              active request per wali email is allowed for a given brother.
            </li>
            <li>
              <strong className="text-[#1A2421]">3. Seven-day decision window:</strong> The brother
              receives notification and has seven days to accept or decline. If accepted, family
              contact details are shared cleanly.
            </li>
          </ol>
          <Button asChild size="sm">
            <Link to="/marriage">Open Brother Directory</Link>
          </Button>
        </section>

        <section className="rounded-xl border border-[#E5E0D5] bg-white p-7 space-y-5">
          <h2 className="font-serif text-2xl font-semibold text-[#1A2421]">
            For Brothers Seeking Marriage
          </h2>
          <ol className="space-y-4 text-sm text-[#54615C]">
            <li>
              <strong className="text-[#1A2421]">1. Verify email ownership:</strong> Sign in using
              passwordless email-link verification and complete your profile with explicit consent
              to publish.
            </li>
            <li>
              <strong className="text-[#1A2421]">2. Administrative review:</strong> Azwaj staff
              review every submission before it enters the public directory. Private phone, email,
              and exact DOB remain hidden.
            </li>
            <li>
              <strong className="text-[#1A2421]">3. Review incoming requests:</strong> Inspect
              introduction requests in your dashboard and respond within seven days.
            </li>
          </ol>
          <Button asChild size="sm" variant="outline">
            <Link to="/sign-in">Register / Sign In</Link>
          </Button>
        </section>
      </div>

      <section className="rounded-xl border border-[#E5E0D5] bg-[#F2EFE9]/60 p-8 space-y-4">
        <h2 className="font-serif text-2xl font-semibold text-[#1A2421]">
          Islamic Marriage Counselling
        </h2>
        <p className="text-sm leading-relaxed text-[#54615C] max-w-3xl">
          All counselling scholars (Alims and Alimahs) are appointed directly by Azwaj. Choose a
          scholar, pick pre-marital, couples, or individual counselling, select an available time
          slot in Sri Lanka time, and receive an instant booking confirmation. Counselling records
          are kept completely separate from marriage introductions.
        </p>
        <Button asChild>
          <Link to="/scholars">View Scholars &amp; Book</Link>
        </Button>
      </section>
    </div>
  );
}
