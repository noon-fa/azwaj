import * as admin from 'firebase-admin';
import { logger } from 'firebase-functions/v2';
import type { EmailMessage } from '../types.js';

const APP_BASE_URL = process.env.APP_URL || 'https://azwaj-lk.web.app';
const FROM_EMAIL = process.env.EMAIL_FROM || 'Azwaj <noreply@azwaj.lk>';

function wrapLayout(title: string, bodyHtml: string): string {
  return `
    <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background:#FAF9F6; padding:32px 16px; color:#1A2421;">
      <div style="max-width:580px; margin:0 auto; background:#FFFFFF; border:1px solid #E5E0D5; border-radius:10px; padding:32px;">
        <div style="border-bottom:1px solid #E5E0D5; padding-bottom:16px; margin-bottom:24px;">
          <span style="font-family: Georgia, serif; font-size:22px; font-weight:700; color:#14533C;">Azwaj</span>
          <span style="display:block; font-size:12px; color:#54615C; margin-top:4px;">Wali-Mediated Muslim Marriage &amp; Scholarly Counselling</span>
        </div>
        <h2 style="font-family: Georgia, serif; font-size:20px; color:#1A2421; margin:0 0 16px;">${title}</h2>
        <div style="font-size:15px; line-height:1.65; color:#2C3834;">${bodyHtml}</div>
        <div style="border-top:1px solid #E5E0D5; margin-top:28px; padding-top:16px; font-size:12px; color:#54615C;">
          Azwaj Sri Lanka · Respectful, confidential, and wali-mediated.<br/>
          Please do not reply directly to automated system notifications.
        </div>
      </div>
    </div>
  `;
}

export async function dispatchEmail(
  db: admin.firestore.Firestore,
  msg: EmailMessage
): Promise<void> {
  const provider = (process.env.EMAIL_PROVIDER || 'disabled').toLowerCase();
  const resendKey = process.env.RESEND_API_KEY;
  const notificationId = db.collection('notifications').doc().id;
  const now = admin.firestore.FieldValue.serverTimestamp();

  let status: 'queued' | 'sent' | 'failed' = 'queued';

  if (provider === 'resend' && resendKey) {
    try {
      const response = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${resendKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          from: FROM_EMAIL,
          to: [msg.to],
          subject: msg.subject,
          html: msg.html,
          text: msg.text,
        }),
      });
      status = response.ok ? 'sent' : 'failed';
      if (!response.ok) {
        logger.error('Resend API error', await response.text());
      }
    } catch (err) {
      status = 'failed';
      logger.error('Resend dispatch failed', err);
    }
  } else {
    logger.info('Email provider not configured; notification queued', {
      type: msg.type,
      to: msg.to,
      subject: msg.subject,
    });
  }

  await db.collection('notifications').doc(notificationId).set({
    notificationId,
    type: msg.type,
    recipientEmail: msg.to,
    subject: msg.subject.slice(0, 200),
    status,
    createdAt: now,
    updatedAt: now,
  });
}

export const emailTemplates = {
  newMarriageRequestToBrother(params: {
    to: string;
    brotherName: string;
    waliName: string;
    waliRelationship: string;
    sisterCity: string;
    deadlineDate: string;
  }): EmailMessage {
    const html = wrapLayout(
      'New Wali-Mediated Introduction Request',
      `<p>Assalamu Alaikum ${params.brotherName},</p>
       <p>A wali (<strong>${params.waliName}</strong>, ${params.waliRelationship}) from <strong>${params.sisterCity}</strong> has submitted a respectful marriage introduction request on Azwaj.</p>
       <p>You have until <strong>${params.deadlineDate}</strong> (7 days) to review the sister's introduction details and respond.</p>
       <p><a href="${APP_BASE_URL}/dashboard/requests" style="display:inline-block;background:#14533C;color:#FFFFFF;padding:10px 18px;border-radius:6px;text-decoration:none;font-weight:600;">Review Request</a></p>`
    );
    return {
      to: params.to,
      subject: 'Azwaj: New Wali-Mediated Introduction Request (7-Day Response Window)',
      html,
      text: `Assalamu Alaikum ${params.brotherName}, a wali (${params.waliName}) from ${params.sisterCity} submitted an introduction request. Please respond by ${params.deadlineDate} at ${APP_BASE_URL}/dashboard/requests.`,
      type: 'marriage_request_new_brother',
    };
  },

  requestAcceptedToWali(params: {
    to: string;
    waliName: string;
    brotherDisplayName: string;
    brotherSharedContact: string;
  }): EmailMessage {
    const html = wrapLayout(
      'Introduction Request Accepted',
      `<p>Assalamu Alaikum ${params.waliName},</p>
       <p><strong>${params.brotherDisplayName}</strong> has accepted your marriage introduction request on Azwaj.</p>
       <p><strong>Brother's shared family/contact details:</strong><br/>${params.brotherSharedContact}</p>
       <p>Your contact details have likewise been shared with the brother so both families may proceed respectfully.</p>`
    );
    return {
      to: params.to,
      subject: `Azwaj: Introduction Request Accepted by ${params.brotherDisplayName}`,
      html,
      text: `Assalamu Alaikum ${params.waliName}, ${params.brotherDisplayName} accepted your introduction request. Contact details: ${params.brotherSharedContact}`,
      type: 'marriage_request_accepted_wali',
    };
  },

  requestDeclinedToWali(params: {
    to: string;
    waliName: string;
    brotherDisplayName: string;
  }): EmailMessage {
    const html = wrapLayout(
      'Update on Your Introduction Request',
      `<p>Assalamu Alaikum ${params.waliName},</p>
       <p>Thank you for submitting an introduction request regarding <strong>${params.brotherDisplayName}</strong>.</p>
       <p>After consideration, the brother has respectfully declined to proceed at this time. We ask Allah to grant ease and barakah in your search.</p>`
    );
    return {
      to: params.to,
      subject: 'Azwaj: Update on Your Introduction Request',
      html,
      text: `Assalamu Alaikum ${params.waliName}, ${params.brotherDisplayName} has respectfully declined to proceed with the introduction request at this time.`,
      type: 'marriage_request_declined_wali',
    };
  },

  requestExpiredToWali(params: {
    to: string;
    waliName: string;
    brotherDisplayName: string;
  }): EmailMessage {
    const html = wrapLayout(
      'Introduction Request Expired',
      `<p>Assalamu Alaikum ${params.waliName},</p>
       <p>Your marriage introduction request sent to <strong>${params.brotherDisplayName}</strong> did not receive a response within the 7-day window and has automatically expired.</p>
       <p>You are welcome to browse other approved profiles on Azwaj.</p>`
    );
    return {
      to: params.to,
      subject: 'Azwaj: Introduction Request Expired (7-Day Window Closed)',
      html,
      text: `Assalamu Alaikum ${params.waliName}, your introduction request to ${params.brotherDisplayName} expired after 7 days without a response.`,
      type: 'marriage_request_expired_wali',
    };
  },

  brotherApplicationStatus(params: {
    to: string;
    fullName: string;
    status: string;
    note?: string;
  }): EmailMessage {
    const statusLabels: Record<string, string> = {
      pending_review: 'Application Received — Pending Review',
      approved: 'Profile Approved',
      rejected: 'Application Not Approved',
      changes_requested: 'Profile Modifications Requested',
      suspended: 'Profile Suspended',
    };
    const title = statusLabels[params.status] || 'Profile Status Updated';
    const noteHtml = params.note ? `<p><strong>Moderator Note:</strong> ${params.note}</p>` : '';
    const html = wrapLayout(
      title,
      `<p>Assalamu Alaikum ${params.fullName},</p>
       <p>Your Azwaj brother profile status is now: <strong>${title}</strong>.</p>
       ${noteHtml}
       <p><a href="${APP_BASE_URL}/dashboard/profile" style="display:inline-block;background:#14533C;color:#FFFFFF;padding:10px 18px;border-radius:6px;text-decoration:none;font-weight:600;">Open Dashboard</a></p>`
    );
    return {
      to: params.to,
      subject: `Azwaj: ${title}`,
      html,
      text: `Assalamu Alaikum ${params.fullName}, your Azwaj profile status is now ${title}. ${params.note || ''}`,
      type: `brother_status_${params.status}`,
    };
  },

  counsellingBookingConfirmation(params: {
    to: string;
    clientName: string;
    scholarName: string;
    counsellingType: string;
    format: string;
    slotIso: string;
    timezone: string;
  }): EmailMessage {
    const html = wrapLayout(
      'Counselling Session Confirmed',
      `<p>Assalamu Alaikum ${params.clientName},</p>
       <p>Your confidential Islamic counselling session with <strong>${params.scholarName}</strong> is confirmed.</p>
       <ul>
         <li><strong>Type:</strong> ${params.counsellingType}</li>
         <li><strong>Format:</strong> ${params.format}</li>
         <li><strong>Scheduled Time:</strong> ${params.slotIso} (${params.timezone})</li>
         <li><strong>Payment Status:</strong> Payment processing is not yet enabled; Azwaj team will advise prior to session if applicable.</li>
       </ul>`
    );
    return {
      to: params.to,
      subject: `Azwaj: Counselling Session Confirmed with ${params.scholarName}`,
      html,
      text: `Assalamu Alaikum ${params.clientName}, your ${params.counsellingType} (${params.format}) session with ${params.scholarName} is confirmed for ${params.slotIso} (${params.timezone}).`,
      type: 'counselling_booking_confirmed',
    };
  },

  counsellingScholarAlert(params: {
    to: string;
    scholarName: string;
    clientName: string;
    counsellingType: string;
    format: string;
    slotIso: string;
  }): EmailMessage {
    const html = wrapLayout(
      'New Counselling Booking Assigned',
      `<p>Assalamu Alaikum ${params.scholarName},</p>
       <p>A new confidential counselling booking has been scheduled with you.</p>
       <p><strong>Client:</strong> ${params.clientName} · <strong>Type:</strong> ${params.counsellingType} · <strong>Format:</strong> ${params.format} · <strong>Time:</strong> ${params.slotIso}</p>
       <p><a href="${APP_BASE_URL}/scholar/bookings" style="display:inline-block;background:#14533C;color:#FFFFFF;padding:10px 18px;border-radius:6px;text-decoration:none;font-weight:600;">View Scholar Bookings</a></p>`
    );
    return {
      to: params.to,
      subject: `Azwaj Scholar Notice: New ${params.counsellingType} Booking`,
      html,
      text: `New booking with ${params.clientName} (${params.counsellingType}, ${params.format}) at ${params.slotIso}.`,
      type: 'counselling_scholar_notification',
    };
  },

  counsellingCancellation(params: {
    to: string;
    recipientName: string;
    scholarName: string;
    slotIso: string;
    reason?: string;
  }): EmailMessage {
    const html = wrapLayout(
      'Counselling Booking Cancelled',
      `<p>Assalamu Alaikum ${params.recipientName},</p>
       <p>The counselling session with <strong>${params.scholarName}</strong> scheduled for <strong>${params.slotIso}</strong> has been cancelled.</p>
       ${params.reason ? `<p><strong>Reason:</strong> ${params.reason}</p>` : ''}`
    );
    return {
      to: params.to,
      subject: 'Azwaj: Counselling Booking Cancelled',
      html,
      text: `Counselling session with ${params.scholarName} at ${params.slotIso} has been cancelled. ${params.reason || ''}`,
      type: 'counselling_booking_cancelled',
    };
  },

  counsellingReminder(params: {
    to: string;
    clientName: string;
    scholarName: string;
    slotIso: string;
    format: string;
  }): EmailMessage {
    const html = wrapLayout(
      'Upcoming Counselling Session Reminder',
      `<p>Assalamu Alaikum ${params.clientName},</p>
       <p>This is a gentle reminder of your upcoming ${params.format} counselling session with <strong>${params.scholarName}</strong> at <strong>${params.slotIso}</strong>.</p>`
    );
    return {
      to: params.to,
      subject: `Azwaj Reminder: Counselling Session with ${params.scholarName}`,
      html,
      text: `Reminder: Your ${params.format} session with ${params.scholarName} is scheduled for ${params.slotIso}.`,
      type: 'counselling_booking_reminder',
    };
  },
};
