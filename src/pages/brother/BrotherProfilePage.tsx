import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Upload, User } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/src/components/ui/button';
import { Checkbox } from '@/src/components/ui/checkbox';
import { Input } from '@/src/components/ui/input';
import { Label } from '@/src/components/ui/label';
import { StatusText } from '@/src/components/ui/StatusText';
import { Textarea } from '@/src/components/ui/textarea';
import {
  COMMON_LANGUAGES,
  SRI_LANKA_DISTRICTS,
  SUPPORTED_COUNTRIES_LIST,
} from '@/src/config/countries';
import { useAuth } from '@/src/contexts/AuthContext';
import { brotherRegistrationSchema, type BrotherRegistrationInput } from '@/src/schemas/validation';
import {
  getBrotherPrivateDetail,
  getBrotherPublicProfile,
  saveBrotherProfile,
  uploadBrotherPhoto,
} from '@/src/services/brotherService';

export function BrotherProfilePage() {
  const { supabaseUser } = useAuth();
  const [loading, setLoading] = useState(true);
  const [existingStatus, setExistingStatus] = useState<string | null>(null);
  const [reviewNote, setReviewNote] = useState<string | null>(null);
  const [photoUrl, setPhotoUrl] = useState<string | undefined>(undefined);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<BrotherRegistrationInput>({
    resolver: zodResolver(brotherRegistrationSchema),
    defaultValues: {
      country: 'Sri Lanka',
      cityDistrict: 'Colombo',
      nationality: 'Sri Lankan',
      maritalStatus: 'never_married',
      languages: ['English'],
      showPhotoPublicly: true,
    },
  });

  const selectedLanguages = watch('languages') || [];
  const showPhotoPublicly = watch('showPhotoPublicly');
  const consentToPublish = watch('consentToPublish');

  useEffect(() => {
    if (!supabaseUser) return;
    setLoading(true);
    Promise.all([
      getBrotherPublicProfile(supabaseUser.id),
      getBrotherPrivateDetail(supabaseUser.id),
    ])
      .then(([pub, priv]) => {
        if (pub) {
          setExistingStatus(pub.status);
          setPhotoUrl(pub.photoUrl);
          reset({
            fullName: priv?.fullName || pub.displayName,
            displayName: pub.displayName,
            phone: priv?.phone || '',
            dateOfBirth: priv?.dateOfBirth || `${pub.birthYear}-01-01`,
            country: pub.country,
            cityDistrict: pub.cityDistrict,
            nationality: pub.nationality,
            education: pub.education,
            occupation: pub.occupation,
            maritalStatus: pub.maritalStatus,
            religiousPractice: pub.religiousPractice,
            languages: pub.languages,
            marriagePreferences: pub.marriagePreferences,
            about: pub.about,
            showPhotoPublicly: pub.showPhotoPublicly,
            consentToPublish: true,
          });
        }
        if (priv?.adminReviewNote) {
          setReviewNote(priv.adminReviewNote);
        }
      })
      .finally(() => setLoading(false));
  }, [supabaseUser, reset]);

  const toggleLanguage = (lang: string) => {
    const next = selectedLanguages.includes(lang)
      ? selectedLanguages.filter((l) => l !== lang)
      : [...selectedLanguages, lang];
    setValue('languages', next, { shouldValidate: true });
  };

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !supabaseUser) return;
    setUploadingPhoto(true);
    try {
      const url = await uploadBrotherPhoto(supabaseUser.id, file);
      setPhotoUrl(url);
      toast.success('Photograph uploaded. Save your profile to apply changes.');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Unable to upload photograph.');
    } finally {
      setUploadingPhoto(false);
    }
  };

  const onSubmit = async (values: BrotherRegistrationInput) => {
    if (!supabaseUser || !supabaseUser.email) return;
    try {
      await saveBrotherProfile({
        uid: supabaseUser.id,
        email: supabaseUser.email,
        input: values,
        photoUrl,
      });
      setExistingStatus('pending_review');
      toast.success('Profile submitted for administrative review.');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Unable to save profile.');
    }
  };

  if (loading) {
    return <div className="h-96 rounded-xl border border-[#E5E0D5] bg-white animate-pulse" />;
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-serif text-3xl font-semibold text-[#1A2421]">
            Brother Marriage Profile
          </h1>
          <p className="text-sm text-[#54615C]">
            Saving or editing your profile sends it to Azwaj staff for moderation before public
            listing.
          </p>
        </div>
        {existingStatus && <StatusText status={existingStatus} />}
      </div>

      {reviewNote && (
        <div className="rounded-xl border border-[#E5E0D5] bg-white p-5 space-y-1">
          <p className="text-xs font-semibold text-[#9A7B3E]">Moderator Note</p>
          <p className="text-sm text-[#1A2421]">{reviewNote}</p>
        </div>
      )}

      <form
        onSubmit={handleSubmit(onSubmit)}
        className="rounded-xl border border-[#E5E0D5] bg-white p-6 sm:p-8 space-y-6"
      >
        {/* Photo */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center border-b border-[#E5E0D5] pb-6">
          <div className="h-20 w-20 shrink-0 overflow-hidden rounded-xl border border-[#E5E0D5] bg-[#F2EFE9] flex items-center justify-center">
            {photoUrl ? (
              <img
                src={photoUrl}
                alt="Brother profile preview"
                referrerPolicy="no-referrer"
                className="h-full w-full object-cover"
              />
            ) : (
              <User className="h-8 w-8 text-[#7B8682]" />
            )}
          </div>
          <div className="space-y-2">
            <Label htmlFor="photo-upload">Profile Photograph (Optional, max 5 MB)</Label>
            <div className="flex flex-wrap items-center gap-3">
              <label className="inline-flex items-center gap-2 rounded-lg border border-[#E5E0D5] bg-[#FAF9F6] px-3.5 py-2 text-xs font-medium text-[#1A2421] hover:bg-[#F2EFE9] cursor-pointer">
                <Upload className="h-3.5 w-3.5" />
                <span>{uploadingPhoto ? 'Uploading…' : 'Upload JPEG / PNG / WebP'}</span>
                <input
                  id="photo-upload"
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  onChange={handlePhotoUpload}
                  className="hidden"
                />
              </label>
              <label className="inline-flex items-center gap-2 text-xs text-[#54615C] cursor-pointer">
                <Checkbox
                  checked={showPhotoPublicly}
                  onCheckedChange={(checked) => setValue('showPhotoPublicly', checked === true)}
                />
                <span>Allow approved photograph to be shown in public directory</span>
              </label>
            </div>
          </div>
        </div>

        {/* Private PII Section */}
        <div className="space-y-4">
          <h2 className="text-sm font-semibold text-[#1A2421]">
            01. Private Identity &amp; Contact Information (Never Shown Publicly)
          </h2>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor="fullName">Full Legal Name</Label>
              <Input id="fullName" {...register('fullName')} placeholder="e.g. Abdullah Yusuf" />
              {errors.fullName && (
                <p className="text-xs text-[#B91C1C]">{errors.fullName.message}</p>
              )}
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="phone">Phone Number</Label>
              <Input id="phone" {...register('phone')} placeholder="+94 77 123 4567" />
              {errors.phone && (
                <p className="text-xs text-[#B91C1C]">{errors.phone.message}</p>
              )}
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="dateOfBirth">Date of Birth</Label>
              <Input id="dateOfBirth" type="date" {...register('dateOfBirth')} />
              {errors.dateOfBirth && (
                <p className="text-xs text-[#B91C1C]">{errors.dateOfBirth.message}</p>
              )}
            </div>
            <div className="space-y-1.5">
              <Label>Verified Email Address</Label>
              <Input value={supabaseUser?.email || ''} disabled />
            </div>
          </div>
        </div>

        {/* Public Profile Section */}
        <div className="space-y-4 border-t border-[#E5E0D5] pt-6">
          <h2 className="text-sm font-semibold text-[#1A2421]">
            02. Public Directory Information
          </h2>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor="displayName">Public Display Name</Label>
              <Input
                id="displayName"
                {...register('displayName')}
                placeholder="e.g. Br. Abdullah Y."
              />
              {errors.displayName && (
                <p className="text-xs text-[#B91C1C]">{errors.displayName.message}</p>
              )}
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="nationality">Nationality</Label>
              <Input id="nationality" {...register('nationality')} placeholder="Sri Lankan" />
              {errors.nationality && (
                <p className="text-xs text-[#B91C1C]">{errors.nationality.message}</p>
              )}
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="country">Country of Residence</Label>
              <select
                id="country"
                {...register('country')}
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
              <Label htmlFor="cityDistrict">City / District</Label>
              <select
                id="cityDistrict"
                {...register('cityDistrict')}
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
              <Label htmlFor="education">Education</Label>
              <Input
                id="education"
                {...register('education')}
                placeholder="e.g. B.Eng. Civil Engineering, University of Moratuwa"
              />
              {errors.education && (
                <p className="text-xs text-[#B91C1C]">{errors.education.message}</p>
              )}
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="occupation">Occupation</Label>
              <Input
                id="occupation"
                {...register('occupation')}
                placeholder="e.g. Structural Engineer"
              />
              {errors.occupation && (
                <p className="text-xs text-[#B91C1C]">{errors.occupation.message}</p>
              )}
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="maritalStatus">Marital Status</Label>
              <select
                id="maritalStatus"
                {...register('maritalStatus')}
                className="h-10 w-full rounded-lg border border-[#E5E0D5] bg-white px-3 text-sm"
              >
                <option value="never_married">Never Married</option>
                <option value="divorced">Divorced</option>
                <option value="widowed">Widowed</option>
              </select>
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
            {errors.languages && (
              <p className="text-xs text-[#B91C1C]">{errors.languages.message}</p>
            )}
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="religiousPractice">Religious Background &amp; Practice</Label>
            <Textarea
              id="religiousPractice"
              rows={3}
              {...register('religiousPractice')}
              placeholder="Share your commitment to daily prayers, Islamic learning, and family values…"
            />
            {errors.religiousPractice && (
              <p className="text-xs text-[#B91C1C]">{errors.religiousPractice.message}</p>
            )}
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="about">About Yourself</Label>
            <Textarea
              id="about"
              rows={4}
              {...register('about')}
              placeholder="Describe your character, family background, and goals…"
            />
            {errors.about && (
              <p className="text-xs text-[#B91C1C]">{errors.about.message}</p>
            )}
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="marriagePreferences">Marriage Preferences</Label>
            <Textarea
              id="marriagePreferences"
              rows={3}
              {...register('marriagePreferences')}
              placeholder="Describe what you value in a spouse and future household…"
            />
            {errors.marriagePreferences && (
              <p className="text-xs text-[#B91C1C]">{errors.marriagePreferences.message}</p>
            )}
          </div>
        </div>

        <div className="border-t border-[#E5E0D5] pt-5 space-y-2">
          <label className="flex items-start gap-3 text-sm text-[#1A2421] cursor-pointer">
            <Checkbox
              checked={Boolean(consentToPublish)}
              onCheckedChange={(checked) =>
                setValue('consentToPublish', checked === true ? true : (false as never), {
                  shouldValidate: true,
                })
              }
              className="mt-0.5"
            />
            <span>
              I explicitly consent to Azwaj moderating and publishing my non-contact profile
              details in the public brother directory once approved.
            </span>
          </label>
          {errors.consentToPublish && (
            <p className="text-xs text-[#B91C1C]">{errors.consentToPublish.message}</p>
          )}
        </div>

        <Button type="submit" size="lg" disabled={isSubmitting}>
          {isSubmitting ? 'Saving & Submitting…' : 'Submit Profile for Review'}
        </Button>
      </form>
    </div>
  );
}
