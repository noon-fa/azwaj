import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { ArrowLeft, CheckCircle2, ShieldCheck, User } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/src/components/ui/button';
import { Checkbox } from '@/src/components/ui/checkbox';
import { Input } from '@/src/components/ui/input';
import { Label } from '@/src/components/ui/label';
import { Textarea } from '@/src/components/ui/textarea';
import { COMMON_LANGUAGES, SRI_LANKA_DISTRICTS, SUPPORTED_COUNTRIES_LIST } from '@/src/config/countries';
import { calculateAgeFromBirthYear, MARITAL_STATUS_LABELS } from '@/src/lib/utils';
import { waliIntroductionSchema, type WaliIntroductionInput } from '@/src/schemas/validation';
import { getBrotherPublicProfile } from '@/src/services/brotherService';
import { submitWaliIntroductionRequest } from '@/src/services/marriageService';
import type { BrotherPublicProfile } from '@/src/types/domain';

export function BrotherDetailPage() {
  const { brotherId } = useParams<{ brotherId: string }>();
  const [brother, setBrother] = useState<BrotherPublicProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [confirmation, setConfirmation] = useState<{
    requestId: string;
    deadlineIso: string;
  } | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<WaliIntroductionInput>({
    resolver: zodResolver(waliIntroductionSchema),
    defaultValues: {
      waliCountry: 'Sri Lanka',
      waliCityDistrict: 'Colombo',
      sisterCountry: 'Sri Lanka',
      sisterCityDistrict: 'Colombo',
      sisterLanguages: ['English'],
    },
  });

  const selectedLanguages = watch('sisterLanguages') || [];
  const confirmedWali = watch('confirmedWaliAuthority');
  const privacyAccepted = watch('privacyConsent');

  useEffect(() => {
    if (!brotherId) return;
    setLoading(true);
    getBrotherPublicProfile(brotherId)
      .then((profile) => {
        if (profile && profile.status === 'approved' && profile.isPublished) {
          setBrother(profile);
        } else {
          setBrother(null);
        }
      })
      .catch(() => setBrother(null))
      .finally(() => setLoading(false));
  }, [brotherId]);

  const toggleLanguage = (lang: string) => {
    const next = selectedLanguages.includes(lang)
      ? selectedLanguages.filter((l) => l !== lang)
      : [...selectedLanguages, lang];
    setValue('sisterLanguages', next, { shouldValidate: true });
  };

  const onSubmit = async (values: WaliIntroductionInput) => {
    if (!brotherId) return;
    setSubmitError(null);
    try {
      const res = await submitWaliIntroductionRequest({
        brotherId,
        input: values,
      });
      setConfirmation({
        requestId: res.requestId,
        deadlineIso: res.responseDeadlineAt,
      });
      toast.success('Wali-mediated introduction request submitted.');
    } catch (err) {
      const msg =
        err instanceof Error ? err.message : 'Unable to submit introduction request.';
      setSubmitError(msg);
      toast.error(msg);
    }
  };

  if (loading) {
    return (
      <div className="mx-auto max-w-5xl px-4 py-14 sm:px-6 lg:px-8">
        <div className="h-72 rounded-xl border border-[#E5E0D5] bg-white animate-pulse" />
      </div>
    );
  }

  if (!brother) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-16 text-center space-y-4">
        <h1 className="font-serif text-3xl font-semibold text-[#1A2421]">
          Profile Not Available
        </h1>
        <p className="text-sm text-[#54615C]">
          This profile is unpublished, pending moderation, or does not exist.
        </p>
        <Button asChild variant="outline">
          <Link to="/marriage">Back to Directory</Link>
        </Button>
      </div>
    );
  }

  const age = calculateAgeFromBirthYear(brother.birthYear);

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-8 space-y-8">
      <Link
        to="/marriage"
        className="inline-flex items-center gap-2 text-sm font-medium text-[#54615C] hover:text-[#14533C]"
      >
        <ArrowLeft className="h-4 w-4" />
        <span>Back to Brother Directory</span>
      </Link>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-12 items-start">
        {/* Brother Profile Summary */}
        <section className="rounded-xl border border-[#E5E0D5] bg-white p-6 sm:p-8 space-y-6 lg:col-span-5">
          <div className="flex items-start gap-4">
            <div className="h-20 w-20 shrink-0 overflow-hidden rounded-xl border border-[#E5E0D5] bg-[#F2EFE9] flex items-center justify-center">
              {brother.showPhotoPublicly && brother.photoUrl ? (
                <img
                  src={brother.photoUrl}
                  alt={brother.displayName}
                  referrerPolicy="no-referrer"
                  className="h-full w-full object-cover"
                />
              ) : (
                <User className="h-8 w-8 text-[#7B8682]" />
              )}
            </div>
            <div>
              <h1 className="font-serif text-3xl font-semibold text-[#1A2421]">
                {brother.displayName}
              </h1>
              <p className="mt-1 text-sm text-[#54615C] tabular-nums">
                {age} years · {brother.cityDistrict}, {brother.country}
              </p>
              <p className="text-xs text-[#7B8682] mt-0.5">
                {brother.nationality} ·{' '}
                {MARITAL_STATUS_LABELS[brother.maritalStatus] || brother.maritalStatus}
              </p>
            </div>
          </div>

          <div className="space-y-4 border-t border-[#E5E0D5] pt-5 text-sm">
            <div>
              <p className="text-xs font-medium text-[#7B8682]">Education</p>
              <p className="mt-0.5 text-[#1A2421]">{brother.education}</p>
            </div>
            <div>
              <p className="text-xs font-medium text-[#7B8682]">Occupation</p>
              <p className="mt-0.5 text-[#1A2421]">{brother.occupation}</p>
            </div>
            <div>
              <p className="text-xs font-medium text-[#7B8682]">Languages</p>
              <p className="mt-0.5 text-[#1A2421]">{brother.languages.join(' · ')}</p>
            </div>
            <div>
              <p className="text-xs font-medium text-[#7B8682]">About</p>
              <p className="mt-1 leading-relaxed text-[#54615C] whitespace-pre-line">
                {brother.about}
              </p>
            </div>
            <div>
              <p className="text-xs font-medium text-[#7B8682]">
                Religious Background &amp; Practice
              </p>
              <p className="mt-1 leading-relaxed text-[#54615C] whitespace-pre-line">
                {brother.religiousPractice}
              </p>
            </div>
            <div>
              <p className="text-xs font-medium text-[#7B8682]">Marriage Preferences</p>
              <p className="mt-1 leading-relaxed text-[#54615C] whitespace-pre-line">
                {brother.marriagePreferences}
              </p>
            </div>
          </div>

          <div className="rounded-lg border border-[#E5E0D5] bg-[#FAF9F6] p-4 text-xs text-[#54615C] space-y-1">
            <div className="flex items-center gap-1.5 font-medium text-[#14533C]">
              <ShieldCheck className="h-4 w-4" />
              <span>Privacy &amp; Verification Notice</span>
            </div>
            <p>
              Private contact details are withheld until the brother accepts an introduction
              request. Profile publication reflects administrative review and confirmed email
              access, not government ID verification.
            </p>
          </div>
        </section>

        {/* Wali-Mediated Introduction Form */}
        <section className="rounded-xl border border-[#E5E0D5] bg-white p-6 sm:p-8 lg:col-span-7">
          {confirmation ? (
            <div className="space-y-5 py-4">
              <div className="flex items-center gap-2.5 text-[#15803D]">
                <CheckCircle2 className="h-6 w-6" />
                <h2 className="font-serif text-2xl font-semibold text-[#1A2421]">
                  Introduction Request Submitted
                </h2>
              </div>
              <p className="text-sm leading-relaxed text-[#54615C]">
                Your request on behalf of the sister has been recorded securely and assigned to{' '}
                <strong className="text-[#1A2421]">{brother.displayName}</strong>.
              </p>
              <div className="rounded-lg border border-[#E5E0D5] bg-[#FAF9F6] p-4 text-sm space-y-2">
                <p>
                  <span className="text-[#54615C]">Request Reference:</span>{' '}
                  <span className="font-mono text-[#1A2421]">{confirmation.requestId}</span>
                </p>
                <p>
                  <span className="text-[#54615C]">7-Day Response Deadline:</span>{' '}
                  <span className="font-mono text-[#1A2421]">
                    {confirmation.deadlineIso.slice(0, 10)}
                  </span>
                </p>
              </div>
              <p className="text-xs text-[#54615C]">
                If the brother accepts, contact details will be exchanged. If he declines or does
                not respond within seven days, the request closes automatically.
              </p>
              <Button asChild variant="outline">
                <Link to="/marriage">Return to Directory</Link>
              </Button>
            </div>
          ) : (
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              <div className="space-y-1.5 border-b border-[#E5E0D5] pb-4">
                <h2 className="font-serif text-2xl font-semibold text-[#1A2421]">
                  Submit Wali-Mediated Introduction Request
                </h2>
                <p className="text-sm text-[#54615C]">
                  No account required. Please complete all sections accurately as the sister’s
                  wali or authorized family representative.
                </p>
              </div>

              {submitError && (
                <div
                  role="alert"
                  className="rounded-lg border border-[#B91C1C]/30 bg-[#FEF2F2] p-3.5 text-sm text-[#B91C1C]"
                >
                  {submitError}
                </div>
              )}

              {/* Wali Details */}
              <div className="space-y-4">
                <h3 className="text-sm font-semibold text-[#1A2421]">
                  01. Wali / Guardian Information
                </h3>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div className="space-y-1.5">
                    <Label htmlFor="waliName">Wali Full Name</Label>
                    <Input id="waliName" {...register('waliName')} placeholder="e.g. Mohamed Fareed" />
                    {errors.waliName && (
                      <p className="text-xs text-[#B91C1C]">{errors.waliName.message}</p>
                    )}
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="waliRelationship">Relationship to the Sister</Label>
                    <Input
                      id="waliRelationship"
                      {...register('waliRelationship')}
                      placeholder="e.g. Father, Elder Brother, Uncle"
                    />
                    {errors.waliRelationship && (
                      <p className="text-xs text-[#B91C1C]">{errors.waliRelationship.message}</p>
                    )}
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="waliEmail">Wali Email Address</Label>
                    <Input
                      id="waliEmail"
                      type="email"
                      {...register('waliEmail')}
                      placeholder="wali@example.com"
                    />
                    {errors.waliEmail && (
                      <p className="text-xs text-[#B91C1C]">{errors.waliEmail.message}</p>
                    )}
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="waliPhone">Wali Phone Number</Label>
                    <Input id="waliPhone" {...register('waliPhone')} placeholder="+94 77 123 4567" />
                    {errors.waliPhone && (
                      <p className="text-xs text-[#B91C1C]">{errors.waliPhone.message}</p>
                    )}
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="waliCountry">Wali Country</Label>
                    <select
                      id="waliCountry"
                      {...register('waliCountry')}
                      className="h-10 w-full rounded-lg border border-[#E5E0D5] bg-white px-3 text-sm"
                    >
                      {SUPPORTED_COUNTRIES_LIST.map((c) => (
                        <option key={c} value={c}>
                          {c}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="waliCityDistrict">Wali City / District</Label>
                    <select
                      id="waliCityDistrict"
                      {...register('waliCityDistrict')}
                      className="h-10 w-full rounded-lg border border-[#E5E0D5] bg-white px-3 text-sm"
                    >
                      {SRI_LANKA_DISTRICTS.map((d) => (
                        <option key={d} value={d}>
                          {d}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              {/* Sister Details */}
              <div className="space-y-4 border-t border-[#E5E0D5] pt-5">
                <h3 className="text-sm font-semibold text-[#1A2421]">
                  02. Sister’s Profile Summary (Kept Private)
                </h3>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div className="space-y-1.5">
                    <Label htmlFor="sisterName">Sister’s Name (or Family Reference)</Label>
                    <Input id="sisterName" {...register('sisterName')} placeholder="e.g. Sister Amina" />
                    {errors.sisterName && (
                      <p className="text-xs text-[#B91C1C]">{errors.sisterName.message}</p>
                    )}
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="sisterAge">Sister’s Age</Label>
                    <Input
                      id="sisterAge"
                      type="number"
                      min={18}
                      max={80}
                      {...register('sisterAge', { valueAsNumber: true })}
                    />
                    {errors.sisterAge && (
                      <p className="text-xs text-[#B91C1C]">{errors.sisterAge.message}</p>
                    )}
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="sisterCountry">Sister’s Country</Label>
                    <select
                      id="sisterCountry"
                      {...register('sisterCountry')}
                      className="h-10 w-full rounded-lg border border-[#E5E0D5] bg-white px-3 text-sm"
                    >
                      {SUPPORTED_COUNTRIES_LIST.map((c) => (
                        <option key={c} value={c}>
                          {c}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="sisterCityDistrict">Sister’s City / District</Label>
                    <select
                      id="sisterCityDistrict"
                      {...register('sisterCityDistrict')}
                      className="h-10 w-full rounded-lg border border-[#E5E0D5] bg-white px-3 text-sm"
                    >
                      {SRI_LANKA_DISTRICTS.map((d) => (
                        <option key={d} value={d}>
                          {d}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="sisterEducation">Education</Label>
                    <Input
                      id="sisterEducation"
                      {...register('sisterEducation')}
                      placeholder="e.g. B.Sc. Computer Science"
                    />
                    {errors.sisterEducation && (
                      <p className="text-xs text-[#B91C1C]">{errors.sisterEducation.message}</p>
                    )}
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="sisterOccupation">Occupation (Optional)</Label>
                    <Input
                      id="sisterOccupation"
                      {...register('sisterOccupation')}
                      placeholder="e.g. Educator, Homemaker"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Languages Spoken</Label>
                  <div className="flex flex-wrap gap-3">
                    {COMMON_LANGUAGES.map((lang) => (
                      <label
                        key={lang}
                        className="inline-flex items-center gap-2 text-sm text-[#1A2421] cursor-pointer"
                      >
                        <Checkbox
                          checked={selectedLanguages.includes(lang)}
                          onCheckedChange={() => toggleLanguage(lang)}
                        />
                        <span>{lang}</span>
                      </label>
                    ))}
                  </div>
                  {errors.sisterLanguages && (
                    <p className="text-xs text-[#B91C1C]">{errors.sisterLanguages.message}</p>
                  )}
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="sisterMarriageInfo">
                    Relevant Marriage Information (Marital Status, Religious Practice, Family Background)
                  </Label>
                  <Textarea
                    id="sisterMarriageInfo"
                    rows={3}
                    {...register('sisterMarriageInfo')}
                    placeholder="Never married, practicing Muslimah, modest family values..."
                  />
                  {errors.sisterMarriageInfo && (
                    <p className="text-xs text-[#B91C1C]">{errors.sisterMarriageInfo.message}</p>
                  )}
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="sisterNote">Short Introduction Note</Label>
                  <Textarea
                    id="sisterNote"
                    rows={3}
                    {...register('sisterNote')}
                    placeholder="Share a brief, respectful introduction on behalf of the sister and family..."
                  />
                  {errors.sisterNote && (
                    <p className="text-xs text-[#B91C1C]">{errors.sisterNote.message}</p>
                  )}
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="additionalMessage">Additional Message to the Brother (Optional)</Label>
                  <Textarea
                    id="additionalMessage"
                    rows={2}
                    {...register('additionalMessage')}
                    placeholder="Any preferred times for family discussion..."
                  />
                </div>
              </div>

              {/* Confirmations */}
              <div className="space-y-3 border-t border-[#E5E0D5] pt-5">
                <label className="flex items-start gap-3 text-sm text-[#1A2421] cursor-pointer">
                  <Checkbox
                    checked={Boolean(confirmedWali)}
                    onCheckedChange={(checked) =>
                      setValue('confirmedWaliAuthority', checked === true ? true : (false as never), {
                        shouldValidate: true,
                      })
                    }
                    className="mt-0.5"
                  />
                  <span>
                    I confirm that I am acting as the sister’s wali or authorized family
                    representative with her full awareness and consent.
                  </span>
                </label>
                {errors.confirmedWaliAuthority && (
                  <p className="text-xs text-[#B91C1C]">{errors.confirmedWaliAuthority.message}</p>
                )}

                <label className="flex items-start gap-3 text-sm text-[#1A2421] cursor-pointer">
                  <Checkbox
                    checked={Boolean(privacyAccepted)}
                    onCheckedChange={(checked) =>
                      setValue('privacyConsent', checked === true ? true : (false as never), {
                        shouldValidate: true,
                      })
                    }
                    className="mt-0.5"
                  />
                  <span>
                    I agree to the Azwaj{' '}
                    <Link to="/privacy" className="text-[#14533C] underline">
                      Privacy Policy
                    </Link>{' '}
                    and understand this request has a 7-day response window.
                  </span>
                </label>
                {errors.privacyConsent && (
                  <p className="text-xs text-[#B91C1C]">{errors.privacyConsent.message}</p>
                )}
              </div>

              <Button type="submit" size="lg" disabled={isSubmitting}>
                {isSubmitting ? 'Submitting Request…' : 'Submit Introduction Request'}
              </Button>
            </form>
          )}
        </section>
      </div>
    </div>
  );
}
