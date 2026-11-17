import { Link } from 'react-router-dom';
import { ArrowRight, BookOpen, Lock, ShieldCheck, Users } from 'lucide-react';
import { Button } from '@/src/components/ui/button';
import { AZWAJ_IMAGES } from '@/src/lib/images';

export function HomePage() {
  return (
    <div>
      {/* Hero Section: Asymmetric Split with 16:9 Architectural Sanctuary */}
      <section className="relative border-b border-[#E5E0D5] bg-islamic-lattice">
        <div className="mx-auto max-w-6xl px-4 py-14 sm:px-6 lg:px-8 lg:py-20">
          <div className="grid grid-cols-1 items-stretch gap-10 lg:grid-cols-12">
            <div className="flex flex-col justify-center space-y-6 lg:col-span-6">
              <p className="text-xs font-medium tracking-wide text-[#9A7B3E]">
                Sri Lanka · Wali-Mediated Introductions &amp; Scholarly Counselling
              </p>
              <h1 className="font-serif text-4xl font-semibold tracking-tight text-[#1A2421] sm:text-5xl lg:text-[3.35rem] lg:leading-[1.08]">
                A dignified path to nikah, guided by family trust.
              </h1>
              <p className="max-w-xl text-base leading-relaxed text-[#54615C]">
                Azwaj connects sincere Muslim brothers in Sri Lanka with sisters represented by
                their wali—protecting modesty, eliminating unnecessary interaction, and offering
                confidential guidance from qualified Alims and Alimahs.
              </p>

              <div className="flex flex-wrap items-center gap-3 pt-2">
                <Button asChild size="lg">
                  <Link to="/marriage">
                    <span>Browse Brother Profiles</span>
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </Button>
                <Button asChild variant="outline" size="lg">
                  <Link to="/scholars">Book Scholar Counselling</Link>
                </Button>
              </div>

              <p className="text-xs text-[#7B8682]">
                Walis browse and submit introduction requests without creating an account.
              </p>
            </div>

            <div className="lg:col-span-6">
              <div className="relative h-72 sm:h-96 lg:h-full min-h-[340px] overflow-hidden rounded-xl border border-[#E5E0D5] bg-[#F2EFE9]">
                <img
                  src={AZWAJ_IMAGES.heroCourtyard}
                  alt="Sunlit contemporary Sri Lankan Islamic courtyard sanctuary with geometric wooden screens"
                  referrerPolicy="no-referrer"
                  className="h-full w-full object-cover"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Core Safeguards Strip */}
      <section className="border-b border-[#E5E0D5] bg-white">
        <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-[#14533C]">
                <ShieldCheck className="h-4 w-4 shrink-0" />
                <h2 className="font-sans text-base font-semibold text-[#1A2421]">
                  Wali-Mediated by Design
                </h2>
              </div>
              <p className="text-sm leading-relaxed text-[#54615C]">
                Introductions begin strictly between a sister’s wali and the prospective brother.
                There is no public browsing of sisters and no open chat feeds.
              </p>
            </div>

            <div className="space-y-2">
              <div className="flex items-center gap-2 text-[#14533C]">
                <Lock className="h-4 w-4 shrink-0" />
                <h2 className="font-sans text-base font-semibold text-[#1A2421]">
                  Private Contact Protection
                </h2>
              </div>
              <p className="text-sm leading-relaxed text-[#54615C]">
                Emails, phone numbers, and sister details are isolated from public pages and
                exchanged only when a brother formally accepts an introduction request.
              </p>
            </div>

            <div className="space-y-2">
              <div className="flex items-center gap-2 text-[#14533C]">
                <BookOpen className="h-4 w-4 shrink-0" />
                <h2 className="font-sans text-base font-semibold text-[#1A2421]">
                  Alim &amp; Alimah Counselling
                </h2>
              </div>
              <p className="text-sm leading-relaxed text-[#54615C]">
                Dedicated pre-marital, couples, and individual Islamic consultations with vetted
                scholars—stored completely separately from marriage introduction records.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Editorial Workflow Section */}
      <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-12 lg:grid-cols-12">
          <div className="space-y-4 lg:col-span-4">
            <p className="text-xs font-medium tracking-wide text-[#9A7B3E]">
              How Azwaj Works
            </p>
            <h2 className="font-serif text-3xl font-semibold text-[#1A2421]">
              Clear, respectful steps from introduction to consultation.
            </h2>
            <p className="text-sm leading-relaxed text-[#54615C]">
              Every workflow is built for clarity—even for parents and elders who rarely use
              digital platforms.
            </p>
            <div className="pt-2">
              <Button asChild variant="outline" size="sm">
                <Link to="/how-it-works">Read Full Process</Link>
              </Button>
            </div>
          </div>

          <div className="divide-y divide-[#E5E0D5] border-y border-[#E5E0D5] lg:col-span-8">
            <div className="py-6 flex flex-col gap-2 sm:flex-row sm:items-baseline sm:gap-8">
              <span className="font-mono text-sm font-medium text-[#9A7B3E] tabular-nums shrink-0">
                01.
              </span>
              <div className="space-y-1">
                <h3 className="text-base font-semibold text-[#1A2421]">
                  Brothers submit a moderated profile
                </h3>
                <p className="text-sm leading-relaxed text-[#54615C]">
                  Brothers verify email ownership via passwordless sign-in, consent to
                  publication, and submit their background for Azwaj staff review before appearing
                  in the directory.
                </p>
              </div>
            </div>

            <div className="py-6 flex flex-col gap-2 sm:flex-row sm:items-baseline sm:gap-8">
              <span className="font-mono text-sm font-medium text-[#9A7B3E] tabular-nums shrink-0">
                02.
              </span>
              <div className="space-y-1">
                <h3 className="text-base font-semibold text-[#1A2421]">
                  A sister’s wali submits an introduction request
                </h3>
                <p className="text-sm leading-relaxed text-[#54615C]">
                  Walis browse approved brother profiles publicly without an account and submit a
                  structured, private introduction form on behalf of the sister.
                </p>
              </div>
            </div>

            <div className="py-6 flex flex-col gap-2 sm:flex-row sm:items-baseline sm:gap-8">
              <span className="font-mono text-sm font-medium text-[#9A7B3E] tabular-nums shrink-0">
                03.
              </span>
              <div className="space-y-1">
                <h3 className="text-base font-semibold text-[#1A2421]">
                  Seven-day response window &amp; dignified closure
                </h3>
                <p className="text-sm leading-relaxed text-[#54615C]">
                  The brother has seven days to accept or respectfully decline. Unanswered requests
                  automatically expire so families are never left waiting indefinitely.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Counselling Feature Split */}
      <section className="border-t border-[#E5E0D5] bg-white">
        <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 items-stretch gap-10 lg:grid-cols-12">
            <div className="lg:col-span-5">
              <div className="h-72 sm:h-80 lg:h-full overflow-hidden rounded-xl border border-[#E5E0D5] bg-[#F2EFE9]">
                <img
                  src={AZWAJ_IMAGES.counsellingSanctuary}
                  alt="Quiet Islamic scholarly counselling room with timber bookshelves and warm natural daylight"
                  referrerPolicy="no-referrer"
                  className="h-full w-full object-cover"
                />
              </div>
            </div>

            <div className="flex flex-col justify-center space-y-5 lg:col-span-7">
              <p className="text-xs font-medium tracking-wide text-[#9A7B3E]">
                Scholarly Guidance
              </p>
              <h2 className="font-serif text-3xl font-semibold text-[#1A2421]">
                Confidential marriage counselling with Alims and Alimahs.
              </h2>
              <p className="text-sm leading-relaxed text-[#54615C]">
                Whether preparing for nikah, strengthening an existing marriage, or seeking
                individual advice on marital responsibilities, book an online or in-person session
                directly with qualified scholars appointed by Azwaj.
              </p>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-3 pt-1 text-sm">
                <div className="rounded-lg border border-[#E5E0D5] bg-[#FAF9F6] p-4">
                  <p className="font-semibold text-[#1A2421]">Pre-Marital</p>
                  <p className="mt-1 text-xs text-[#54615C]">
                    Expectations, compatibility, and Islamic rights.
                  </p>
                </div>
                <div className="rounded-lg border border-[#E5E0D5] bg-[#FAF9F6] p-4">
                  <p className="font-semibold text-[#1A2421]">Married Couples</p>
                  <p className="mt-1 text-xs text-[#54615C]">
                    Communication, mediation, and family harmony.
                  </p>
                </div>
                <div className="rounded-lg border border-[#E5E0D5] bg-[#FAF9F6] p-4">
                  <p className="font-semibold text-[#1A2421]">Individual</p>
                  <p className="mt-1 text-xs text-[#54615C]">
                    Personal consultation in strict confidence.
                  </p>
                </div>
              </div>
              <div className="flex flex-wrap items-center gap-3 pt-2">
                <Button asChild>
                  <Link to="/scholars">Explore Scholars</Link>
                </Button>
                <Button asChild variant="ghost">
                  <Link to="/sign-in">
                    <Users className="h-4 w-4" />
                    <span>Brother Profile Registration</span>
                  </Link>
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
