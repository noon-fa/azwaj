import { Link } from 'react-router-dom';
import { Button } from '@/src/components/ui/button';
import { AZWAJ_IMAGES } from '@/src/lib/images';

export function CounsellingPage() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-14 sm:px-6 lg:px-8 space-y-14">
      <div className="grid grid-cols-1 items-stretch gap-10 lg:grid-cols-12">
        <div className="flex flex-col justify-center space-y-5 lg:col-span-6">
          <p className="text-xs font-medium tracking-wide text-[#9A7B3E]">
            Islamic Marriage Counselling
          </p>
          <h1 className="font-serif text-4xl font-semibold text-[#1A2421]">
            Thoughtful counsel from appointed Alims and Alimahs.
          </h1>
          <p className="text-base leading-relaxed text-[#54615C]">
            Azwaj connects individuals, engaged couples, and spouses with qualified Islamic
            scholars for confidential online or in-person consultations across Sri Lanka.
          </p>
          <div className="flex flex-wrap gap-3">
            <Button asChild size="lg">
              <Link to="/scholars">Choose a Scholar &amp; Book</Link>
            </Button>
          </div>
          <p className="text-xs text-[#7B8682]">
            Counselling sessions are stored in isolated records and never shared with the marriage
            directory team or used for marketing.
          </p>
        </div>

        <div className="lg:col-span-6">
          <div className="h-72 sm:h-96 lg:h-full overflow-hidden rounded-xl border border-[#E5E0D5] bg-[#F2EFE9]">
            <img
              src={AZWAJ_IMAGES.counsellingSanctuary}
              alt="Scholarly counselling study"
              referrerPolicy="no-referrer"
              className="h-full w-full object-cover"
            />
          </div>
        </div>
      </div>

      <section className="grid grid-cols-1 gap-6 md:grid-cols-3 border-t border-[#E5E0D5] pt-12">
        <div className="rounded-xl border border-[#E5E0D5] bg-white p-6 space-y-2">
          <h2 className="font-serif text-xl font-semibold text-[#1A2421]">
            01. Pre-Marital Counselling
          </h2>
          <p className="text-sm leading-relaxed text-[#54615C]">
            Guided preparation covering Islamic marital rights, communication expectations, family
            boundaries, and financial clarity prior to nikah.
          </p>
        </div>

        <div className="rounded-xl border border-[#E5E0D5] bg-white p-6 space-y-2">
          <h2 className="font-serif text-xl font-semibold text-[#1A2421]">
            02. Married Couples
          </h2>
          <p className="text-sm leading-relaxed text-[#54615C]">
            Structured mediation for spouses seeking reconciliation, deeper mutual understanding,
            and spiritually grounded conflict resolution.
          </p>
        </div>

        <div className="rounded-xl border border-[#E5E0D5] bg-white p-6 space-y-2">
          <h2 className="font-serif text-xl font-semibold text-[#1A2421]">
            03. Individual Consultations
          </h2>
          <p className="text-sm leading-relaxed text-[#54615C]">
            Private one-to-one consultations for brothers or sisters navigating marriage decisions,
            istikhara clarity, or personal family challenges.
          </p>
        </div>
      </section>
    </div>
  );
}
