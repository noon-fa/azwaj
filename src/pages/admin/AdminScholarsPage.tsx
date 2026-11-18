import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Plus } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/src/components/ui/button';
import { Checkbox } from '@/src/components/ui/checkbox';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/src/components/ui/dialog';
import { Input } from '@/src/components/ui/input';
import { Label } from '@/src/components/ui/label';
import { StatusText } from '@/src/components/ui/StatusText';
import { Switch } from '@/src/components/ui/switch';
import { Textarea } from '@/src/components/ui/textarea';
import { COMMON_LANGUAGES } from '@/src/config/countries';
import { useAuth } from '@/src/contexts/AuthContext';
import { AZWAJ_IMAGES } from '@/src/lib/images';
import { formatCurrencyLkr } from '@/src/lib/utils';
import { scholarFormSchema, type ScholarFormInput } from '@/src/schemas/validation';
import { fetchAdminDashboardData, saveScholarRecord } from '@/src/services/adminService';
import type { ScholarProfile } from '@/src/types/domain';

export function AdminScholarsPage() {
  const { supabaseUser } = useAuth();
  const [scholars, setScholars] = useState<ScholarProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | undefined>(undefined);
  const [expertiseText, setExpertiseText] = useState('Pre-marital preparation, Conflict resolution');

  const {
    register,
    handleSubmit,
    reset,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<ScholarFormInput>({
    resolver: zodResolver(scholarFormSchema),
    defaultValues: {
      gender: 'male',
      country: 'Sri Lanka',
      timezone: 'Asia/Colombo',
      sessionDurationMinutes: 45,
      sessionPriceLkr: 3500,
      experienceYears: 5,
      languages: ['English', 'Tamil'],
      expertise: ['Pre-marital preparation'],
      counsellingFormats: ['online'],
      counsellingTypes: ['pre_marital', 'married_couples', 'individual'],
      isActive: true,
    },
  });

  const languages = watch('languages') || [];
  const formats = watch('counsellingFormats') || [];
  const types = watch('counsellingTypes') || [];
  const isActive = watch('isActive');

  const loadScholars = async () => {
    setLoading(true);
    try {
      const res = await fetchAdminDashboardData();
      setScholars(res.scholars);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadScholars();
  }, []);

  const openCreateModal = () => {
    setEditingId(undefined);
    setExpertiseText('Pre-marital preparation, Conflict resolution');
    reset({
      fullName: '',
      email: '',
      uid: '',
      gender: 'male',
      title: 'Alim & Marriage Counsellor',
      qualification: '',
      education: '',
      expertise: ['Pre-marital preparation', 'Conflict resolution'],
      languages: ['English', 'Tamil'],
      biography: '',
      experienceYears: 5,
      counsellingFormats: ['online', 'in_person'],
      counsellingTypes: ['pre_marital', 'married_couples', 'individual'],
      sessionDurationMinutes: 45,
      sessionPriceLkr: 3500,
      country: 'Sri Lanka',
      cityLocation: 'Colombo',
      timezone: 'Asia/Colombo',
      photoUrl: AZWAJ_IMAGES.scholarAlim,
      isActive: true,
    });
    setModalOpen(true);
  };

  const openEditModal = (s: ScholarProfile) => {
    setEditingId(s.scholarId);
    setExpertiseText(s.expertise.join(', '));
    reset({
      fullName: s.fullName,
      email: s.email || '',
      uid: s.uid || '',
      gender: s.gender,
      title: s.title,
      qualification: s.qualification,
      education: s.education,
      expertise: s.expertise,
      languages: s.languages,
      biography: s.biography,
      experienceYears: s.experienceYears,
      counsellingFormats: s.counsellingFormats,
      counsellingTypes: s.counsellingTypes,
      sessionDurationMinutes: s.sessionDurationMinutes,
      sessionPriceLkr: s.sessionPriceLkr,
      country: s.country,
      cityLocation: s.cityLocation || '',
      timezone: s.timezone,
      photoUrl: s.photoUrl || '',
      isActive: s.isActive,
    });
    setModalOpen(true);
  };

  const toggleItem = <T extends string>(arr: T[], val: T, field: keyof ScholarFormInput) => {
    const next = arr.includes(val) ? arr.filter((x) => x !== val) : [...arr, val];
    setValue(field, next as never, { shouldValidate: true });
  };

  const onSubmit = async (values: ScholarFormInput) => {
    if (!supabaseUser || !supabaseUser.email) return;
    const parsedExpertise = expertiseText
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean);
    try {
      await saveScholarRecord({
        actorUid: supabaseUser.id,
        actorEmail: supabaseUser.email,
        scholarId: editingId,
        input: {
          ...values,
          expertise: parsedExpertise.length > 0 ? parsedExpertise : ['General marital guidance'],
        },
      });
      toast.success(editingId ? 'Scholar updated.' : 'Scholar created.');
      setModalOpen(false);
      await loadScholars();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Unable to save scholar.');
    }
  };

  if (loading) {
    return <div className="h-64 rounded-xl border border-[#E5E0D5] bg-white animate-pulse" />;
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-serif text-3xl font-semibold text-[#1A2421]">
            Scholar Management
          </h1>
          <p className="text-sm text-[#54615C]">
            Create and manage Azwaj-appointed Alims and Alimahs, pricing, and formats.
          </p>
        </div>
        <Button size="sm" onClick={openCreateModal}>
          <Plus className="h-4 w-4" />
          <span>Add Scholar</span>
        </Button>
      </div>

      {scholars.length === 0 ? (
        <div className="rounded-xl border border-[#E5E0D5] bg-white p-10 text-center text-sm text-[#54615C]">
          No scholars added yet. Click &ldquo;Add Scholar&rdquo; to appoint an Alim or Alimah.
        </div>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-[#E5E0D5] bg-white">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-[#E5E0D5] bg-[#FAF9F6] text-xs font-semibold text-[#54615C]">
              <tr>
                <th className="px-4 py-3">Scholar</th>
                <th className="px-4 py-3">Gender</th>
                <th className="px-4 py-3">Formats</th>
                <th className="px-4 py-3">Duration &amp; Fee</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E5E0D5]">
              {scholars.map((s) => (
                <tr key={s.scholarId} className="hover:bg-[#FAF9F6]">
                  <td className="px-4 py-3">
                    <p className="font-medium text-[#1A2421]">{s.fullName}</p>
                    <p className="text-xs text-[#54615C]">{s.title}</p>
                  </td>
                  <td className="px-4 py-3 text-[#54615C] capitalize">{s.gender}</td>
                  <td className="px-4 py-3 text-xs text-[#54615C]">
                    {s.counsellingFormats.join(', ')}
                  </td>
                  <td className="px-4 py-3 font-mono text-xs tabular-nums">
                    {s.sessionDurationMinutes}m · {formatCurrencyLkr(s.sessionPriceLkr, s.currency)}
                  </td>
                  <td className="px-4 py-3">
                    <StatusText
                      status={s.isActive ? 'active' : 'declined'}
                      labelOverride={s.isActive ? 'Active' : 'Inactive'}
                    />
                  </td>
                  <td className="px-4 py-3 text-right">
                    <Button size="sm" variant="outline" onClick={() => openEditModal(s)}>
                      Edit
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <Dialog open={modalOpen} onOpenChange={setModalOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{editingId ? 'Edit Scholar Record' : 'Appoint New Scholar'}</DialogTitle>
            <DialogDescription>
              Scholars are hired directly by Azwaj. Link their Supabase Auth UID once they sign in so
              they can access the Scholar Portal.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 text-sm">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="space-y-1">
                <Label htmlFor="sch-name">Full Name</Label>
                <Input id="sch-name" {...register('fullName')} />
                {errors.fullName && (
                  <p className="text-xs text-[#B91C1C]">{errors.fullName.message}</p>
                )}
              </div>
              <div className="space-y-1">
                <Label htmlFor="sch-gender">Gender</Label>
                <select
                  id="sch-gender"
                  {...register('gender')}
                  className="h-10 w-full rounded-lg border border-[#E5E0D5] bg-white px-3 text-sm"
                >
                  <option value="male">Male (Alim)</option>
                  <option value="female">Female (Alimah)</option>
                </select>
              </div>
              <div className="space-y-1">
                <Label htmlFor="sch-title">Title</Label>
                <Input id="sch-title" {...register('title')} />
              </div>
              <div className="space-y-1">
                <Label htmlFor="sch-qual">Qualification</Label>
                <Input id="sch-qual" {...register('qualification')} />
              </div>
              <div className="space-y-1">
                <Label htmlFor="sch-email">Scholar Email (Optional)</Label>
                <Input id="sch-email" type="email" {...register('email')} />
              </div>
              <div className="space-y-1">
                <Label htmlFor="sch-uid">Linked Supabase Auth UID (Optional)</Label>
                <Input id="sch-uid" {...register('uid')} placeholder="For Scholar Portal access" />
              </div>
              <div className="space-y-1">
                <Label htmlFor="sch-price">Session Price (LKR)</Label>
                <Input
                  id="sch-price"
                  type="number"
                  {...register('sessionPriceLkr', { valueAsNumber: true })}
                />
              </div>
              <div className="space-y-1">
                <Label htmlFor="sch-dur">Session Duration (Minutes)</Label>
                <Input
                  id="sch-dur"
                  type="number"
                  {...register('sessionDurationMinutes', { valueAsNumber: true })}
                />
              </div>
              <div className="space-y-1">
                <Label htmlFor="sch-city">City Location</Label>
                <Input id="sch-city" {...register('cityLocation')} />
              </div>
              <div className="space-y-1">
                <Label htmlFor="sch-exp">Experience (Years)</Label>
                <Input
                  id="sch-exp"
                  type="number"
                  {...register('experienceYears', { valueAsNumber: true })}
                />
              </div>
            </div>

            <div className="space-y-1">
              <Label htmlFor="sch-edu">Educational Background</Label>
              <Input id="sch-edu" {...register('education')} />
            </div>

            <div className="space-y-1">
              <Label htmlFor="sch-expertise">Areas of Expertise (comma-separated)</Label>
              <Input
                id="sch-expertise"
                value={expertiseText}
                onChange={(e) => setExpertiseText(e.target.value)}
              />
            </div>

            <div className="space-y-1.5">
              <Label>Languages</Label>
              <div className="flex flex-wrap gap-3">
                {COMMON_LANGUAGES.map((lang) => (
                  <label key={lang} className="inline-flex items-center gap-2 cursor-pointer">
                    <Checkbox
                      checked={languages.includes(lang)}
                      onCheckedChange={() => toggleItem(languages, lang, 'languages')}
                    />
                    <span>{lang}</span>
                  </label>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label>Counselling Formats</Label>
                <div className="flex gap-4">
                  {(['online', 'in_person'] as const).map((fmt) => (
                    <label key={fmt} className="inline-flex items-center gap-2 cursor-pointer">
                      <Checkbox
                        checked={formats.includes(fmt)}
                        onCheckedChange={() => toggleItem(formats, fmt, 'counsellingFormats')}
                      />
                      <span>{fmt === 'online' ? 'Online' : 'In-Person'}</span>
                    </label>
                  ))}
                </div>
              </div>
              <div className="space-y-1.5">
                <Label>Counselling Types</Label>
                <div className="flex flex-wrap gap-3">
                  {(['pre_marital', 'married_couples', 'individual'] as const).map((tp) => (
                    <label key={tp} className="inline-flex items-center gap-2 cursor-pointer">
                      <Checkbox
                        checked={types.includes(tp)}
                        onCheckedChange={() => toggleItem(types, tp, 'counsellingTypes')}
                      />
                      <span className="capitalize">{tp.replace('_', ' ')}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>

            <div className="space-y-1">
              <Label htmlFor="sch-bio">Biography</Label>
              <Textarea id="sch-bio" rows={3} {...register('biography')} />
              {errors.biography && (
                <p className="text-xs text-[#B91C1C]">{errors.biography.message}</p>
              )}
            </div>

            <div className="flex items-center justify-between border-t border-[#E5E0D5] pt-4">
              <div className="flex items-center gap-2">
                <Switch
                  checked={isActive}
                  onCheckedChange={(checked) => setValue('isActive', checked)}
                />
                <span>Active in Public Directory</span>
              </div>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? 'Saving…' : 'Save Scholar'}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
