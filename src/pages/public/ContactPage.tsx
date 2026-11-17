import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { CheckCircle2 } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/src/components/ui/button';
import { Input } from '@/src/components/ui/input';
import { Label } from '@/src/components/ui/label';
import { Textarea } from '@/src/components/ui/textarea';
import { contactInquirySchema, type ContactInquiryInput } from '@/src/schemas/validation';
import { submitContactInquiry } from '@/src/services/adminService';

export function ContactPage() {
  const [submittedId, setSubmittedId] = useState<string | null>(null);
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<ContactInquiryInput>({
    resolver: zodResolver(contactInquirySchema),
    defaultValues: {
      topic: 'General Question',
    },
  });

  const onSubmit = async (values: ContactInquiryInput) => {
    try {
      const id = await submitContactInquiry(values);
      setSubmittedId(id);
      reset();
      toast.success('Your message has been received by the Azwaj team.');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Unable to send message.');
    }
  };

  return (
    <div className="mx-auto max-w-3xl px-4 py-14 sm:px-6 lg:px-8 space-y-8">
      <header className="space-y-3">
        <p className="text-xs font-medium tracking-wide text-[#9A7B3E]">Contact Azwaj</p>
        <h1 className="font-serif text-4xl font-semibold text-[#1A2421]">
          Questions, family support, or moderation reports
        </h1>
        <p className="text-sm leading-relaxed text-[#54615C]">
          Use this form to contact our Sri Lanka administration team regarding marriage profiles,
          wali requests, counselling bookings, or privacy inquiries.
        </p>
      </header>

      {submittedId ? (
        <div className="rounded-xl border border-[#E5E0D5] bg-white p-8 space-y-4">
          <div className="flex items-center gap-2 text-[#15803D]">
            <CheckCircle2 className="h-5 w-5" />
            <h2 className="text-lg font-semibold text-[#1A2421]">Message Submitted</h2>
          </div>
          <p className="text-sm text-[#54615C]">
            Reference ID: <span className="font-mono text-[#1A2421]">{submittedId}</span>. Our
            staff will review and respond via email.
          </p>
          <Button variant="outline" onClick={() => setSubmittedId(null)}>
            Send Another Message
          </Button>
        </div>
      ) : (
        <form
          onSubmit={handleSubmit(onSubmit)}
          className="rounded-xl border border-[#E5E0D5] bg-white p-6 sm:p-8 space-y-5"
        >
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="name">Your Name</Label>
              <Input id="name" {...register('name')} placeholder="Full name" />
              {errors.name && (
                <p className="text-xs text-[#B91C1C]">{errors.name.message}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email Address</Label>
              <Input
                id="email"
                type="email"
                {...register('email')}
                placeholder="you@example.com"
              />
              {errors.email && (
                <p className="text-xs text-[#B91C1C]">{errors.email.message}</p>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="topic">Topic</Label>
            <select
              id="topic"
              {...register('topic')}
              className="flex h-10 w-full rounded-lg border border-[#E5E0D5] bg-white px-3.5 text-sm text-[#1A2421]"
            >
              <option value="General Question">General Question</option>
              <option value="Wali Introduction Support">Wali Introduction Support</option>
              <option value="Brother Profile Moderation">Brother Profile Moderation</option>
              <option value="Counselling Inquiry">Counselling Inquiry</option>
              <option value="Report Concern or Misconduct">Report Concern or Misconduct</option>
              <option value="Privacy or Account Deletion">Privacy or Account Deletion</option>
            </select>
            {errors.topic && (
              <p className="text-xs text-[#B91C1C]">{errors.topic.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="message">Message</Label>
            <Textarea
              id="message"
              rows={5}
              {...register('message')}
              placeholder="Please describe how we can assist you…"
            />
            {errors.message && (
              <p className="text-xs text-[#B91C1C]">{errors.message.message}</p>
            )}
          </div>

          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? 'Sending…' : 'Send Message'}
          </Button>
        </form>
      )}
    </div>
  );
}
