import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { Search, User } from 'lucide-react';
import { Button } from '@/src/components/ui/button';
import { Input } from '@/src/components/ui/input';
import { COMMON_LANGUAGES, SRI_LANKA_DISTRICTS, SUPPORTED_COUNTRIES_LIST } from '@/src/config/countries';
import { calculateAgeFromBirthYear, MARITAL_STATUS_LABELS } from '@/src/lib/utils';
import { listPublishedBrothers } from '@/src/services/brotherService';
import type { BrotherPublicProfile } from '@/src/types/domain';

export function MarriageDirectoryPage() {
  const [brothers, setBrothers] = useState<BrotherPublicProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const [searchTerm, setSearchTerm] = useState('');
  const [countryFilter, setCountryFilter] = useState('All');
  const [districtFilter, setDistrictFilter] = useState('All');
  const [maritalFilter, setMaritalFilter] = useState('All');
  const [languageFilter, setLanguageFilter] = useState('All');
  const [minAge, setMinAge] = useState('');
  const [maxAge, setMaxAge] = useState('');

  useEffect(() => {
    let active = true;
    setLoading(true);
    listPublishedBrothers()
      .then((rows) => {
        if (active) {
          setBrothers(rows);
          setErrorMsg(null);
        }
      })
      .catch((err) => {
        if (active) {
          setErrorMsg(err instanceof Error ? err.message : 'Unable to load profiles.');
        }
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, []);

  const filteredBrothers = useMemo(() => {
    return brothers.filter((b) => {
      const age = calculateAgeFromBirthYear(b.birthYear);
      if (countryFilter !== 'All' && b.country !== countryFilter) return false;
      if (districtFilter !== 'All' && b.cityDistrict !== districtFilter) return false;
      if (maritalFilter !== 'All' && b.maritalStatus !== maritalFilter) return false;
      if (languageFilter !== 'All' && !b.languages.includes(languageFilter)) return false;
      if (minAge && age < Number(minAge)) return false;
      if (maxAge && age > Number(maxAge)) return false;
      if (searchTerm.trim()) {
        const q = searchTerm.toLowerCase();
        const hay = `${b.displayName} ${b.education} ${b.occupation} ${b.cityDistrict} ${b.about}`.toLowerCase();
        if (!hay.includes(q)) return false;
      }
      return true;
    });
  }, [brothers, countryFilter, districtFilter, maritalFilter, languageFilter, minAge, maxAge, searchTerm]);

  const resetFilters = () => {
    setSearchTerm('');
    setCountryFilter('All');
    setDistrictFilter('All');
    setMaritalFilter('All');
    setLanguageFilter('All');
    setMinAge('');
    setMaxAge('');
  };

  return (
    <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6 lg:px-8 space-y-8">
      <header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between border-b border-[#E5E0D5] pb-8">
        <div className="space-y-2 max-w-2xl">
          <p className="text-xs font-medium tracking-wide text-[#9A7B3E]">
            Wali-Mediated Introductions
          </p>
          <h1 className="font-serif text-4xl font-semibold text-[#1A2421]">
            Approved Brother Profiles
          </h1>
          <p className="text-sm leading-relaxed text-[#54615C]">
            Public directory of moderated profiles. Private phone numbers and email addresses are
            never displayed publicly. A sister’s wali may submit an introduction request directly on
            any profile without creating an account.
          </p>
        </div>
        <Button asChild variant="outline" size="sm">
          <Link to="/sign-in">Register as a Brother</Link>
        </Button>
      </header>

      {/* Filter Toolbar */}
      <section
        aria-label="Filter brother profiles"
        className="rounded-xl border border-[#E5E0D5] bg-white p-5 space-y-4"
      >
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-3 h-4 w-4 text-[#7B8682]" />
            <Input
              aria-label="Search by keyword, education, or occupation"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search education, occupation…"
              className="pl-9"
            />
          </div>

          <select
            aria-label="Filter by country"
            value={countryFilter}
            onChange={(e) => setCountryFilter(e.target.value)}
            className="h-10 rounded-lg border border-[#E5E0D5] bg-white px-3 text-sm text-[#1A2421]"
          >
            <option value="All">All Countries</option>
            {SUPPORTED_COUNTRIES_LIST.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>

          <select
            aria-label="Filter by district or city"
            value={districtFilter}
            onChange={(e) => setDistrictFilter(e.target.value)}
            className="h-10 rounded-lg border border-[#E5E0D5] bg-white px-3 text-sm text-[#1A2421]"
          >
            <option value="All">All Districts</option>
            {SRI_LANKA_DISTRICTS.map((d) => (
              <option key={d} value={d}>
                {d}
              </option>
            ))}
          </select>

          <select
            aria-label="Filter by marital status"
            value={maritalFilter}
            onChange={(e) => setMaritalFilter(e.target.value)}
            className="h-10 rounded-lg border border-[#E5E0D5] bg-white px-3 text-sm text-[#1A2421]"
          >
            <option value="All">All Marital Statuses</option>
            <option value="never_married">Never Married</option>
            <option value="divorced">Divorced</option>
            <option value="widowed">Widowed</option>
          </select>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
          <div className="flex flex-wrap items-center gap-3">
            <select
              aria-label="Filter by language"
              value={languageFilter}
              onChange={(e) => setLanguageFilter(e.target.value)}
              className="h-9 rounded-lg border border-[#E5E0D5] bg-white px-3 text-xs text-[#1A2421]"
            >
              <option value="All">All Languages</option>
              {COMMON_LANGUAGES.map((lang) => (
                <option key={lang} value={lang}>
                  {lang}
                </option>
              ))}
            </select>

            <div className="flex items-center gap-2 text-xs text-[#54615C]">
              <span>Age:</span>
              <Input
                type="number"
                min={18}
                max={80}
                value={minAge}
                onChange={(e) => setMinAge(e.target.value)}
                placeholder="Min"
                className="h-9 w-20 text-xs tabular-nums"
              />
              <span>–</span>
              <Input
                type="number"
                min={18}
                max={80}
                value={maxAge}
                onChange={(e) => setMaxAge(e.target.value)}
                placeholder="Max"
                className="h-9 w-20 text-xs tabular-nums"
              />
            </div>
          </div>

          <div className="flex items-center gap-4 text-xs text-[#54615C]">
            <span className="tabular-nums">
              {filteredBrothers.length} profile{filteredBrothers.length === 1 ? '' : 's'} shown
            </span>
            <button
              type="button"
              onClick={resetFilters}
              className="font-medium text-[#14533C] hover:underline cursor-pointer"
            >
              Reset filters
            </button>
          </div>
        </div>
      </section>

      {/* States */}
      {loading && (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="h-64 rounded-xl border border-[#E5E0D5] bg-white p-6 animate-pulse space-y-4"
            >
              <div className="h-5 w-2/3 rounded bg-[#F2EFE9]" />
              <div className="h-4 w-1/2 rounded bg-[#F2EFE9]" />
              <div className="h-20 w-full rounded bg-[#F2EFE9]" />
            </div>
          ))}
        </div>
      )}

      {!loading && errorMsg && (
        <div className="rounded-xl border border-[#E5E0D5] bg-white p-8 text-center space-y-3">
          <p className="text-sm font-medium text-[#B91C1C]">Unable to load profiles</p>
          <p className="text-xs text-[#54615C]">{errorMsg}</p>
        </div>
      )}

      {!loading && !errorMsg && filteredBrothers.length === 0 && (
        <div className="rounded-xl border border-[#E5E0D5] bg-white p-12 text-center space-y-3">
          <h2 className="font-serif text-2xl font-semibold text-[#1A2421]">
            No published profiles match your filters
          </h2>
          <p className="mx-auto max-w-md text-sm text-[#54615C]">
            Approved profiles appear here once a brother consents to publication and passes
            moderation review. Try adjusting your search criteria or check back soon.
          </p>
          <div className="pt-2">
            <Button variant="outline" size="sm" onClick={resetFilters}>
              Clear All Filters
            </Button>
          </div>
        </div>
      )}

      {!loading && !errorMsg && filteredBrothers.length > 0 && (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {filteredBrothers.map((brother) => {
            const age = calculateAgeFromBirthYear(brother.birthYear);
            return (
              <article
                key={brother.brotherId}
                className="flex flex-col justify-between rounded-xl border border-[#E5E0D5] bg-white p-6 transition-colors hover:border-[#14533C]/40"
              >
                <div className="space-y-4">
                  <div className="flex items-start gap-4">
                    <div className="h-14 w-14 shrink-0 overflow-hidden rounded-lg border border-[#E5E0D5] bg-[#F2EFE9] flex items-center justify-center">
                      {brother.showPhotoPublicly && brother.photoUrl ? (
                        <img
                          src={brother.photoUrl}
                          alt={brother.displayName}
                          referrerPolicy="no-referrer"
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <User className="h-6 w-6 text-[#7B8682]" />
                      )}
                    </div>
                    <div className="min-w-0">
                      <h2 className="truncate font-serif text-xl font-semibold text-[#1A2421]">
                        {brother.displayName}
                      </h2>
                      <p className="text-xs text-[#54615C] tabular-nums">
                        {age} yrs · {brother.cityDistrict}, {brother.country}
                      </p>
                      <p className="text-xs text-[#7B8682] mt-0.5">
                        {MARITAL_STATUS_LABELS[brother.maritalStatus] || brother.maritalStatus}
                      </p>
                    </div>
                  </div>

                  <div className="space-y-1.5 text-sm">
                    <p className="text-[#1A2421] font-medium truncate">{brother.occupation}</p>
                    <p className="text-xs text-[#54615C] truncate">{brother.education}</p>
                    <p className="text-xs text-[#7B8682]">
                      Languages: {brother.languages.join(' · ')}
                    </p>
                  </div>

                  <p className="line-clamp-3 text-sm leading-relaxed text-[#54615C]">
                    {brother.about}
                  </p>
                </div>

                <div className="mt-6 border-t border-[#E5E0D5] pt-4 flex items-center justify-between">
                  <span className="text-xs text-[#7B8682]">{brother.nationality}</span>
                  <Button asChild size="sm">
                    <Link to={`/marriage/${brother.brotherId}`}>
                      View &amp; Submit Request
                    </Link>
                  </Button>
                </div>
              </article>
            );
          })}
        </div>
      )}
    </div>
  );
}
