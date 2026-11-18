import { Resend } from 'resend';

export async function sendEmail(to: string, subject: string, text: string) {
  if (!process.env.RESEND_API_KEY) return { sent: false };
  const resend = new Resend(process.env.RESEND_API_KEY);
  await resend.emails.send({
    from: process.env.EMAIL_FROM || 'Azwaj <noreply@example.com>',
    to,
    subject,
    text,
  });
  return { sent: true };
}
