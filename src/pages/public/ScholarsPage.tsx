import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { User } from 'lucide-react';
import { Button } from '@/src/components/ui/button';
import { COMMON_LANGUAGES } from '@/src/config/countries';
import { COUNSELLING_FORMAT_LABELS, formatCurrencyLkr } from '@/src/lib/utils';
import { listActiveScholars } from '@/src/services/scholarService';
import type { ScholarProfile } from '@/src/types/domain';

export function ScholarsPage() {
  const [scholars, setScholars] = useState<ScholarProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [languageFilter, setLanguageFilter] = useState('All');
  const [genderFilter, setGenderFilter] = useState('All');
  const [expertiseFilter, setExpertiseFilter] = useState('All');

  useEffect(() => {
    setLoading(true);
    listActiveScholars()
      .then(setScholars)
      .catch(() => setScholars([]))
      .finally(() => setLoading(false));
  }, []);

  const allExpertise = useMemo(() => {
    const set = new Set<string>();
    scholars.forEach((s) => s.expertise.forEach((e) => set.add(e)));
    return Array.from(set).sort();
  }, [scholars]);

  const filteredScholars = useMemo(() => {
    return scholars.filter((s) => {
      if (languageFilter !== 'All' && !s.languages.includes(languageFilter)) return false;
      if (genderFilter !== 'All' && s.gender !== genderFilter) return false;
      if (expertiseFilter !== 'All' && !s.expertise.includes(expertiseFilter)) return false;
      return true;
    });
  }, [scholars, languageFilter, genderFilter, expertiseFilter]);

  return (
    <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6 lg:px-8 space-y-8">
      <header className="space-y-3 border-b border-[#E5E0D5] pb-8 max-w-3xl">
        <p className="text-xs font-medium tracking-wide text-[#9A7B3E]">
          Appointed Islamic Scholars
        </p>
        <h1 className="font-serif text-4xl font-semibold text-[#1A2421]">
          Alims &amp; Alimahs for Marriage Counselling
        </h1>
        <p className="text-sm leading-relaxed text-[#54615C]">
          All scholars on Azwaj are appointed directly by our platform administration. Select a
          scholar to view their qualifications, counselling formats, and available calendar slots.
        </p>
      </header>

      <section className="flex flex-wrap items-center gap-3 rounded-xl border border-[#E5E0D5] bg-white p-4">
        <select
          aria-label="Filter by language"
          value={languageFilter}
          onChange={(e) => setLanguageFilter(e.target.value)}
          className="h-10 rounded-lg border border-[#E5E0D5] bg-white px-3 text-sm"
        >
          <option value="All">All Languages</option>
          {COMMON_LANGUAGES.map((lang) => (
            <option key={lang} value={lang}>
              {lang}
            </option>
          ))}
        </select>

        <select
          aria-label="Filter by scholar gender"
          value={genderFilter}
          onChange={(e) => setGenderFilter(e.target.value)}
          className="h-10 rounded-lg border border-[#E5E0D5] bg-white px-3 text-sm"
        >
          <option value="All">All Scholars (Alims &amp; Alimahs)</option>
          <option value="male">Alim (Male Scholar)</option>
          <option value="female">Alimah (Female Scholar)</option>
        </select>

        <select
          aria-label="Filter by area of expertise"
          value={expertiseFilter}
          onChange={(e) => setExpertiseFilter(e.target.value)}
          className="h-10 rounded-lg border border-[#E5E0D5] bg-white px-3 text-sm"
        >
          <option value="All">All Areas of Expertise</option>
          {allExpertise.map((exp) => (
            <option key={exp} value={exp}>
              {exp}
            </option>
          ))}
        </select>

        <span className="ml-auto text-xs text-[#54615C] tabular-nums">
          {filteredScholars.length} scholar{filteredScholars.length === 1 ? '' : 's'}
        </span>
      </section>

      {loading ? (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          {[1, 2].map((i) => (
            <div key={i} className="h-60 rounded-xl border border-[#E5E0D5] bg-white animate-pulse" />
          ))}
        </div>
      ) : filteredScholars.length === 0 ? (
        <div className="rounded-xl border border-[#E5E0D5] bg-white p-12 text-center space-y-2">
          <h2 className="font-serif text-2xl font-semibold text-[#1A2421]">
            No active scholars found
          </h2>
          <p className="text-sm text-[#54615C]">
            Scholars are added directly by Azwaj administrators. Check back soon or contact support.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          {filteredScholars.map((scholar) => (
            <article
              key={scholar.scholarId}
              className="flex flex-col justify-between rounded-xl border border-[#E5E0D5] bg-white p-6 space-y-5"
            >
              <div className="space-y-4">
                <div className="flex items-start gap-4">
                  <div className="h-20 w-20 shrink-0 overflow-hidden rounded-xl border border-[#E5E0D5] bg-[#F2EFE9] flex items-center justify-center">
                    {scholar.photoUrl ? (
                      <img
                        src={scholar.photoUrl}
                        alt={scholar.fullName}
                        referrerPolicy="no-referrer"
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <User className="h-8 w-8 text-[#7B8682]" />
                    )}
                  </div>
                  <div className="min-w-0">
                    <h2 className="font-serif text-2xl font-semibold text-[#1A2421]">
                      {scholar.fullName}
                    </h2>
                    <p className="text-sm font-medium text-[#14533C]">{scholar.title}</p>
                    <p className="text-xs text-[#54615C] mt-1">{scholar.qualification}</p>
                  </div>
                </div>

                <p className="text-sm leading-relaxed text-[#54615C] line-clamp-3">
                  {scholar.biography}
                </p>

                <div className="space-y-1 text-xs text-[#54615C]">
                  <p>
                    <strong className="text-[#1A2421]">Languages:</strong>{' '}
                    {scholar.languages.join(' · ')}
                  </p>
                  <p>
                    <strong className="text-[#1A2421]">Expertise:</strong>{' '}
                    {scholar.expertise.join(' · ')}
                  </p>
                  <p>
                    <strong className="text-[#1A2421]">Formats:</strong>{' '}
                    {scholar.counsellingFormats
                      .map((f) => COUNSELLING_FORMAT_LABELS[f] || f)
                      .join(' · ')}
                  </p>
                </div>
              </div>

              <div className="flex items-center justify-between border-t border-[#E5E0D5] pt-4">
                <div className="text-sm tabular-nums">
                  <span className="font-semibold text-[#1A2421]">
                    {formatCurrencyLkr(scholar.sessionPriceLkr, scholar.currency)}
                  </span>
                  <span className="text-xs text-[#7B8682]">
                    {' '}
                    · {scholar.sessionDurationMinutes} min
                  </span>
                </div>
                <Button asChild size="sm">
                  <Link to={`/scholars/${scholar.scholarId}`}>Book Consultation</Link>
                </Button>
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}
