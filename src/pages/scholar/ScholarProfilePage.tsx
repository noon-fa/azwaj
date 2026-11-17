import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { Button } from '@/src/components/ui/button';
import { Checkbox } from '@/src/components/ui/checkbox';
import { Input } from '@/src/components/ui/input';
import { Label } from '@/src/components/ui/label';
import { Textarea } from '@/src/components/ui/textarea';
import { useAuth } from '@/src/contexts/AuthContext';
import {
  getScholarByUid,
  updateScholarOwnProfile,
} from '@/src/services/scholarService';
import type { CounsellingFormat, ScholarProfile } from '@/src/types/domain';

export function ScholarProfilePage() {
  const { firebaseUser } = useAuth();
  const [scholar, setScholar] = useState<ScholarProfile | null>(null);
  const [biography, setBiography] = useState('');
  const [cityLocation, setCityLocation] = useState('');
  const [formats, setFormats] = useState<CounsellingFormat[]>(['online']);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!firebaseUser) return;
    setLoading(true);
    getScholarByUid(firebaseUser.uid)
      .then((sch) => {
        setScholar(sch);
        if (sch) {
          setBiography(sch.biography);
          setCityLocation(sch.cityLocation || '');
          setFormats(sch.counsellingFormats);
        }
      })
      .finally(() => setLoading(false));
  }, [firebaseUser]);

  const toggleFormat = (fmt: CounsellingFormat) => {
    setFormats((prev) => {
      if (prev.includes(fmt)) {
        return prev.length > 1 ? prev.filter((f) => f !== fmt) : prev;
      }
      return [...prev, fmt];
    });
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!scholar) return;
    setSaving(true);
    try {
      await updateScholarOwnProfile({
        scholarId: scholar.scholarId,
        biography,
        counsellingFormats: formats,
        cityLocation,
      });
      toast.success('Scholar profile details updated.');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Unable to update scholar profile.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="h-64 rounded-xl border border-[#E5E0D5] bg-white animate-pulse" />;
  }

  if (!scholar) {
    return (
      <div className="rounded-xl border border-[#E5E0D5] bg-white p-6 text-sm text-[#54615C]">
        No linked scholar profile found.
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h1 className="font-serif text-3xl font-semibold text-[#1A2421]">
          My Scholar Profile
        </h1>
        <p className="text-sm text-[#54615C]">
          Core qualifications, fees, and active status are managed by Azwaj administrators.
        </p>
      </div>

      <form
        onSubmit={handleSave}
        className="rounded-xl border border-[#E5E0D5] bg-white p-6 space-y-5"
      >
        <div className="space-y-1 text-sm">
          <p className="font-semibold text-[#1A2421]">{scholar.fullName}</p>
          <p className="text-[#54615C]">
            {scholar.title} · {scholar.qualification}
          </p>
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="scholar-city">In-Person City / Location</Label>
          <Input
            id="scholar-city"
            value={cityLocation}
            onChange={(e) => setCityLocation(e.target.value)}
            placeholder="e.g. Colombo 04"
          />
        </div>

        <div className="space-y-2">
          <Label>Counselling Formats</Label>
          <div className="flex gap-5 text-sm">
            <label className="inline-flex items-center gap-2 cursor-pointer">
              <Checkbox
                checked={formats.includes('online')}
                onCheckedChange={() => toggleFormat('online')}
              />
              <span>Online Video</span>
            </label>
            <label className="inline-flex items-center gap-2 cursor-pointer">
              <Checkbox
                checked={formats.includes('in_person')}
                onCheckedChange={() => toggleFormat('in_person')}
              />
              <span>In-Person</span>
            </label>
          </div>
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="scholar-bio">Biography</Label>
          <Textarea
            id="scholar-bio"
            rows={5}
            value={biography}
            onChange={(e) => setBiography(e.target.value)}
            required
          />
        </div>

        <Button type="submit" disabled={saving}>
          {saving ? 'Saving…' : 'Save Changes'}
        </Button>
      </form>
    </div>
  );
}
