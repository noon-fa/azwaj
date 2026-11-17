import { Link } from 'react-router-dom';
import { Button } from '@/src/components/ui/button';
import { AZWAJ_IMAGES } from '@/src/lib/images';

export function AboutPage() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-14 sm:px-6 lg:px-8 space-y-12">
      <header className="space-y-4">
        <p className="text-xs font-medium tracking-wide text-[#9A7B3E]">About Azwaj</p>
        <h1 className="font-serif text-4xl font-semibold text-[#1A2421]">
          Built for sincerity, family involvement, and amanah.
        </h1>
        <p className="text-base leading-relaxed text-[#54615C]">
          Azwaj was established to serve Muslim families in Sri Lanka seeking a marriage pathway
          that honours Islamic boundaries rather than mimicking swipe-based dating applications.
        </p>
      </header>

      <div className="overflow-hidden rounded-xl border border-[#E5E0D5] bg-[#F2EFE9] h-72 sm:h-96">
        <img
          src={AZWAJ_IMAGES.heroCourtyard}
          alt="Azwaj sanctuary architecture"
          referrerPolicy="no-referrer"
          className="h-full w-full object-cover"
        />
      </div>

      <section className="space-y-4 border-t border-[#E5E0D5] pt-8">
        <h2 className="font-serif text-2xl font-semibold text-[#1A2421]">
          Core Principles
        </h2>
        <ul className="space-y-3 text-sm leading-relaxed text-[#54615C]">
          <li>
            <strong className="text-[#1A2421]">Wali-mediated introductions:</strong> Every
            introduction toward a sister is initiated by her wali or authorized guardian, ensuring
            family awareness from the very first step.
          </li>
          <li>
            <strong className="text-[#1A2421]">Modesty and privacy:</strong> Sisters’ details are
            never displayed in a public gallery, and brothers’ contact details are never exposed on
            public pages.
          </li>
          <li>
            <strong className="text-[#1A2421]">Honest representation:</strong> Azwaj verifies
            email ownership during sign-in and moderates profiles prior to publication, but does
            not falsely claim government identity or background verification.
          </li>
          <li>
            <strong className="text-[#1A2421]">Regional readiness:</strong> Launched for Sri
            Lanka (Colombo, Kandy, Galle, Puttalam, Eastern Province, and nationwide) with a
            country-configurable foundation ready to expand to additional regions.
          </li>
        </ul>
      </section>

      <div className="flex flex-wrap gap-3 border-t border-[#E5E0D5] pt-8">
        <Button asChild>
          <Link to="/marriage">Browse Approved Brothers</Link>
        </Button>
        <Button asChild variant="outline">
          <Link to="/scholars">Meet Our Scholars</Link>
        </Button>
      </div>
    </div>
  );
}
