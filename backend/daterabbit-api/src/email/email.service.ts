import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

interface SendEmailOptions {
  to: string;
  subject: string;
  htmlContent: string;
}

@Injectable()
export class EmailService {
  private readonly logger = new Logger(EmailService.name);
  private readonly brevoApiKey: string;
  private readonly senderEmail: string;
  private readonly senderName = 'DateRabbit';

  constructor(private configService: ConfigService) {
    this.brevoApiKey = this.configService.get<string>('BREVO_API_KEY') || '';
    this.senderEmail =
      this.configService.get<string>('BREVO_SENDER_EMAIL') || 'noreply@diagrams.love';
  }

  async sendEmail(options: SendEmailOptions): Promise<boolean> {
    if (!this.brevoApiKey) {
      this.logger.warn('BREVO_API_KEY not set — email not sent');
      return false;
    }

    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 10000); // 10s timeout

      const response = await fetch('https://api.brevo.com/v3/smtp/email', {
        method: 'POST',
        headers: {
          accept: 'application/json',
          'api-key': this.brevoApiKey,
          'content-type': 'application/json',
        },
        body: JSON.stringify({
          sender: { email: this.senderEmail, name: this.senderName },
          to: [{ email: options.to }],
          subject: options.subject,
          htmlContent: options.htmlContent,
        }),
        signal: controller.signal,
      });

      clearTimeout(timeout);

      if (response.ok) {
        this.logger.log(`Email sent to ${options.to}: ${options.subject}`);
        return true;
      } else {
        const errorText = await response.text();
        this.logger.error(`Brevo API error (${response.status}): ${errorText}`);
        return false;
      }
    } catch (error) {
      if (error instanceof Error && error.name === 'AbortError') {
        this.logger.error(`Brevo API timeout after 10s for ${options.to}`);
      } else {
        this.logger.error(`Failed to send email to ${options.to}: ${error}`);
      }
      return false;
    }
  }

  async sendOtp(email: string, otp: string): Promise<boolean> {
    return this.sendEmail({
      to: email,
      subject: 'Your DateRabbit Verification Code',
      htmlContent: this.buildOtpTemplate(otp),
    });
  }

  async sendBookingConfirmedToSeeker(data: {
    seekerEmail: string;
    seekerName: string;
    companionName: string;
    dateTime: Date;
    duration: number;
    activity: string;
    location?: string;
    totalPrice: number;
  }): Promise<boolean> {
    const dateStr = data.dateTime.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
    const timeStr = data.dateTime.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
    });

    return this.sendEmail({
      to: data.seekerEmail,
      subject: `Booking Confirmed — ${data.companionName} on ${dateStr}`,
      htmlContent: this.buildBookingConfirmedSeekerTemplate({
        ...data,
        dateStr,
        timeStr,
      }),
    });
  }

  async sendBookingConfirmedToCompanion(data: {
    companionEmail: string;
    companionName: string;
    seekerName: string;
    dateTime: Date;
    duration: number;
    activity: string;
    location?: string;
    totalPrice: number;
  }): Promise<boolean> {
    const dateStr = data.dateTime.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
    const timeStr = data.dateTime.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
    });

    return this.sendEmail({
      to: data.companionEmail,
      subject: `New Booking Confirmed — ${data.seekerName} on ${dateStr}`,
      htmlContent: this.buildBookingConfirmedCompanionTemplate({
        ...data,
        dateStr,
        timeStr,
      }),
    });
  }

  // ─── Transactional email methods ────────────────────────────────────────────

  async sendNewBookingRequest(data: {
    companionEmail: string;
    companionName: string;
    seekerName: string;
    dateTime: Date;
    duration: number;
    activity: string;
    location?: string;
  }): Promise<boolean> {
    const dateStr = data.dateTime.toLocaleDateString('en-US', {
      weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
    });
    const timeStr = data.dateTime.toLocaleTimeString('en-US', {
      hour: '2-digit', minute: '2-digit',
    });
    const activityFormatted = data.activity.charAt(0).toUpperCase() + data.activity.slice(1).toLowerCase();
    const locationRow = data.location
      ? `<tr><td style="padding:6px 0;font-size:14px;color:#555;">Location</td><td style="padding:6px 0;font-size:14px;color:#000;font-weight:600;">${data.location}</td></tr>`
      : '';
    return this.sendEmail({
      to: data.companionEmail,
      subject: `New Booking Request from ${data.seekerName}`,
      htmlContent: `<!DOCTYPE html><html lang="en"><head><meta charset="UTF-8"/><meta name="viewport" content="width=device-width,initial-scale=1.0"/><title>New Booking Request</title></head><body style="margin:0;padding:0;background:#F4F0EA;font-family:Arial,sans-serif;"><table width="100%" cellpadding="0" cellspacing="0" style="background:#F4F0EA;padding:40px 20px;"><tr><td align="center"><table width="480" cellpadding="0" cellspacing="0" style="background:#F4F0EA;border:3px solid #000;border-radius:12px;padding:32px;"><tr><td><p style="margin:0 0 4px 0;font-size:11px;font-weight:700;letter-spacing:3px;text-transform:uppercase;color:#FF2A5F;">DateRabbit</p><h1 style="margin:0 0 8px 0;font-size:24px;font-weight:700;color:#000;">New Booking Request!</h1><p style="margin:0 0 24px 0;font-size:15px;color:#333;">Hi ${data.companionName}, <strong>${data.seekerName}</strong> wants to book a date with you.</p><div style="background:#fff;border:3px solid #000;border-radius:8px;padding:20px;margin:0 0 24px 0;"><table width="100%" cellpadding="0" cellspacing="0"><tr><td colspan="2" style="padding:0 0 12px 0;font-size:12px;font-weight:700;letter-spacing:2px;text-transform:uppercase;color:#FF2A5F;border-bottom:2px solid #000;">Request Details</td></tr><tr><td style="padding:6px 0;font-size:14px;color:#555;">Guest</td><td style="padding:6px 0;font-size:14px;color:#000;font-weight:600;">${data.seekerName}</td></tr><tr><td style="padding:6px 0;font-size:14px;color:#555;">Date</td><td style="padding:6px 0;font-size:14px;color:#000;font-weight:600;">${dateStr}</td></tr><tr><td style="padding:6px 0;font-size:14px;color:#555;">Time</td><td style="padding:6px 0;font-size:14px;color:#000;font-weight:600;">${timeStr}</td></tr><tr><td style="padding:6px 0;font-size:14px;color:#555;">Duration</td><td style="padding:6px 0;font-size:14px;color:#000;font-weight:600;">${data.duration} hour${data.duration !== 1 ? 's' : ''}</td></tr><tr><td style="padding:6px 0;font-size:14px;color:#555;">Activity</td><td style="padding:6px 0;font-size:14px;color:#000;font-weight:600;">${activityFormatted}</td></tr>${locationRow}</table></div><p style="margin:0;font-size:13px;color:#666;">Open the DateRabbit app to accept or decline this request.</p></td></tr></table></td></tr></table></body></html>`,
    });
  }

  async sendBookingCancelledToCompanion(data: {
    companionEmail: string;
    companionName: string;
    seekerName: string;
    dateTime: Date;
    activity: string;
    reason?: string;
  }): Promise<boolean> {
    const dateStr = data.dateTime.toLocaleDateString('en-US', {
      weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
    });
    const reasonRow = data.reason
      ? `<tr><td style="padding:6px 0;font-size:14px;color:#555;">Reason</td><td style="padding:6px 0;font-size:14px;color:#000;font-weight:600;">${data.reason}</td></tr>`
      : '';
    return this.sendEmail({
      to: data.companionEmail,
      subject: `Booking Cancelled by ${data.seekerName}`,
      htmlContent: `<!DOCTYPE html><html lang="en"><head><meta charset="UTF-8"/><title>Booking Cancelled</title></head><body style="margin:0;padding:0;background:#F4F0EA;font-family:Arial,sans-serif;"><table width="100%" cellpadding="0" cellspacing="0" style="background:#F4F0EA;padding:40px 20px;"><tr><td align="center"><table width="480" cellpadding="0" cellspacing="0" style="background:#F4F0EA;border:3px solid #000;border-radius:12px;padding:32px;"><tr><td><p style="margin:0 0 4px 0;font-size:11px;font-weight:700;letter-spacing:3px;text-transform:uppercase;color:#FF2A5F;">DateRabbit</p><h1 style="margin:0 0 8px 0;font-size:24px;font-weight:700;color:#000;">Booking Cancelled</h1><p style="margin:0 0 24px 0;font-size:15px;color:#333;">Hi ${data.companionName}, <strong>${data.seekerName}</strong> has cancelled your booking on ${dateStr}.</p><div style="background:#fff;border:3px solid #000;border-radius:8px;padding:20px;margin:0 0 24px 0;"><table width="100%" cellpadding="0" cellspacing="0"><tr><td style="padding:6px 0;font-size:14px;color:#555;">Guest</td><td style="padding:6px 0;font-size:14px;color:#000;font-weight:600;">${data.seekerName}</td></tr><tr><td style="padding:6px 0;font-size:14px;color:#555;">Date</td><td style="padding:6px 0;font-size:14px;color:#000;font-weight:600;">${dateStr}</td></tr>${reasonRow}</table></div><p style="margin:0;font-size:13px;color:#666;">Your time slot is now available again.</p></td></tr></table></td></tr></table></body></html>`,
    });
  }

  async sendBookingDeclinedToSeeker(data: {
    seekerEmail: string;
    seekerName: string;
    companionName: string;
    dateTime: Date;
    activity: string;
    reason?: string;
  }): Promise<boolean> {
    const dateStr = data.dateTime.toLocaleDateString('en-US', {
      weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
    });
    const reasonRow = data.reason
      ? `<tr><td style="padding:6px 0;font-size:14px;color:#555;">Reason</td><td style="padding:6px 0;font-size:14px;color:#000;font-weight:600;">${data.reason}</td></tr>`
      : '';
    return this.sendEmail({
      to: data.seekerEmail,
      subject: `Booking Declined by ${data.companionName}`,
      htmlContent: `<!DOCTYPE html><html lang="en"><head><meta charset="UTF-8"/><title>Booking Declined</title></head><body style="margin:0;padding:0;background:#F4F0EA;font-family:Arial,sans-serif;"><table width="100%" cellpadding="0" cellspacing="0" style="background:#F4F0EA;padding:40px 20px;"><tr><td align="center"><table width="480" cellpadding="0" cellspacing="0" style="background:#F4F0EA;border:3px solid #000;border-radius:12px;padding:32px;"><tr><td><p style="margin:0 0 4px 0;font-size:11px;font-weight:700;letter-spacing:3px;text-transform:uppercase;color:#FF2A5F;">DateRabbit</p><h1 style="margin:0 0 8px 0;font-size:24px;font-weight:700;color:#000;">Booking Declined</h1><p style="margin:0 0 24px 0;font-size:15px;color:#333;">Hi ${data.seekerName}, unfortunately <strong>${data.companionName}</strong> has declined your booking request for ${dateStr}.</p><div style="background:#fff;border:3px solid #000;border-radius:8px;padding:20px;margin:0 0 24px 0;"><table width="100%" cellpadding="0" cellspacing="0"><tr><td style="padding:6px 0;font-size:14px;color:#555;">Companion</td><td style="padding:6px 0;font-size:14px;color:#000;font-weight:600;">${data.companionName}</td></tr><tr><td style="padding:6px 0;font-size:14px;color:#555;">Date</td><td style="padding:6px 0;font-size:14px;color:#000;font-weight:600;">${dateStr}</td></tr>${reasonRow}</table></div><p style="margin:0;font-size:13px;color:#666;">Browse other companions on DateRabbit and find your perfect match.</p></td></tr></table></td></tr></table></body></html>`,
    });
  }

  async sendPaymentReceived(data: {
    companionEmail: string;
    companionName: string;
    seekerName: string;
    amount: number;
    activity: string;
    dateTime: Date;
  }): Promise<boolean> {
    const dateStr = data.dateTime.toLocaleDateString('en-US', {
      weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
    });
    return this.sendEmail({
      to: data.companionEmail,
      subject: `Payment received — $${Number(data.amount).toFixed(2)} from ${data.seekerName}`,
      htmlContent: `<!DOCTYPE html><html lang="en"><head><meta charset="UTF-8"/><title>Payment Received</title></head><body style="margin:0;padding:0;background:#F4F0EA;font-family:Arial,sans-serif;"><table width="100%" cellpadding="0" cellspacing="0" style="background:#F4F0EA;padding:40px 20px;"><tr><td align="center"><table width="480" cellpadding="0" cellspacing="0" style="background:#F4F0EA;border:3px solid #000;border-radius:12px;padding:32px;"><tr><td><p style="margin:0 0 4px 0;font-size:11px;font-weight:700;letter-spacing:3px;text-transform:uppercase;color:#FF2A5F;">DateRabbit</p><h1 style="margin:0 0 8px 0;font-size:24px;font-weight:700;color:#000;">Payment Received!</h1><p style="margin:0 0 24px 0;font-size:15px;color:#333;">Hi ${data.companionName}, you received a payment from <strong>${data.seekerName}</strong>.</p><div style="background:#fff;border:3px solid #000;border-radius:8px;padding:20px;margin:0 0 24px 0;"><table width="100%" cellpadding="0" cellspacing="0"><tr><td style="padding:6px 0;font-size:14px;color:#555;">From</td><td style="padding:6px 0;font-size:14px;color:#000;font-weight:600;">${data.seekerName}</td></tr><tr><td style="padding:6px 0;font-size:14px;color:#555;">Date</td><td style="padding:6px 0;font-size:14px;color:#000;font-weight:600;">${dateStr}</td></tr><tr><td style="padding:12px 0 6px 0;font-size:14px;color:#555;border-top:2px solid #eee;">Amount</td><td style="padding:12px 0 6px 0;font-size:18px;color:#000;font-weight:700;border-top:2px solid #eee;">$${Number(data.amount).toFixed(2)}</td></tr></table></div><p style="margin:0;font-size:13px;color:#666;">Your earnings will be available for payout via your Stripe account.</p></td></tr></table></td></tr></table></body></html>`,
    });
  }

  async sendNewReview(data: {
    revieweeEmail: string;
    revieweeName: string;
    reviewerName: string;
    rating: number;
    comment?: string;
  }): Promise<boolean> {
    const stars = '★'.repeat(Math.round(data.rating)) + '☆'.repeat(5 - Math.round(data.rating));
    const commentRow = data.comment
      ? `<tr><td colspan="2" style="padding:12px 0 6px 0;font-size:14px;color:#333;border-top:2px solid #eee;font-style:italic;">"${data.comment}"</td></tr>`
      : '';
    return this.sendEmail({
      to: data.revieweeEmail,
      subject: `${data.reviewerName} left you a ${data.rating}-star review`,
      htmlContent: `<!DOCTYPE html><html lang="en"><head><meta charset="UTF-8"/><title>New Review</title></head><body style="margin:0;padding:0;background:#F4F0EA;font-family:Arial,sans-serif;"><table width="100%" cellpadding="0" cellspacing="0" style="background:#F4F0EA;padding:40px 20px;"><tr><td align="center"><table width="480" cellpadding="0" cellspacing="0" style="background:#F4F0EA;border:3px solid #000;border-radius:12px;padding:32px;"><tr><td><p style="margin:0 0 4px 0;font-size:11px;font-weight:700;letter-spacing:3px;text-transform:uppercase;color:#FF2A5F;">DateRabbit</p><h1 style="margin:0 0 8px 0;font-size:24px;font-weight:700;color:#000;">New Review!</h1><p style="margin:0 0 24px 0;font-size:15px;color:#333;">Hi ${data.revieweeName}, <strong>${data.reviewerName}</strong> just reviewed you.</p><div style="background:#fff;border:3px solid #000;border-radius:8px;padding:20px;margin:0 0 24px 0;"><table width="100%" cellpadding="0" cellspacing="0"><tr><td style="padding:6px 0;font-size:14px;color:#555;">From</td><td style="padding:6px 0;font-size:14px;color:#000;font-weight:600;">${data.reviewerName}</td></tr><tr><td style="padding:6px 0;font-size:14px;color:#555;">Rating</td><td style="padding:6px 0;font-size:22px;color:#FF2A5F;">${stars}</td></tr>${commentRow}</table></div><p style="margin:0;font-size:13px;color:#666;">Open the DateRabbit app to view your full reviews and respond.</p></td></tr></table></td></tr></table></body></html>`,
    });
  }

  // ─── HTML Templates ─────────────────────────────────────────────────────────

  private buildOtpTemplate(otp: string): string {
    return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Your DateRabbit Code</title>
</head>
<body style="margin:0;padding:0;background:#F4F0EA;font-family:Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#F4F0EA;padding:40px 20px;">
    <tr>
      <td align="center">
        <table width="400" cellpadding="0" cellspacing="0" style="background:#F4F0EA;border:3px solid #000;border-radius:12px;padding:32px;">
          <tr>
            <td>
              <p style="margin:0 0 4px 0;font-size:11px;font-weight:700;letter-spacing:3px;text-transform:uppercase;color:#FF2A5F;">DateRabbit</p>
              <h1 style="margin:0 0 24px 0;font-size:24px;font-weight:700;color:#000;">Your verification code</h1>
              <p style="margin:0 0 16px 0;font-size:15px;color:#333;">Enter this code in the app to sign in:</p>
              <div style="background:#fff;border:3px solid #000;border-radius:8px;padding:20px;text-align:center;margin:0 0 24px 0;">
                <span style="font-size:40px;font-weight:700;letter-spacing:10px;color:#000;">${otp}</span>
              </div>
              <p style="margin:0 0 8px 0;font-size:13px;color:#666;">This code expires in <strong>10 minutes</strong>.</p>
              <p style="margin:0;font-size:13px;color:#666;">If you didn't request this, you can safely ignore this email.</p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
    `.trim();
  }

  private buildBookingConfirmedSeekerTemplate(data: {
    seekerName: string;
    companionName: string;
    dateStr: string;
    timeStr: string;
    duration: number;
    activity: string;
    location?: string;
    totalPrice: number;
  }): string {
    const activityFormatted =
      data.activity.charAt(0).toUpperCase() + data.activity.slice(1).toLowerCase();
    const locationRow = data.location
      ? `<tr><td style="padding:6px 0;font-size:14px;color:#555;">Location</td><td style="padding:6px 0;font-size:14px;color:#000;font-weight:600;">${data.location}</td></tr>`
      : '';

    return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Booking Confirmed</title>
</head>
<body style="margin:0;padding:0;background:#F4F0EA;font-family:Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#F4F0EA;padding:40px 20px;">
    <tr>
      <td align="center">
        <table width="480" cellpadding="0" cellspacing="0" style="background:#F4F0EA;border:3px solid #000;border-radius:12px;padding:32px;">
          <tr>
            <td>
              <p style="margin:0 0 4px 0;font-size:11px;font-weight:700;letter-spacing:3px;text-transform:uppercase;color:#FF2A5F;">DateRabbit</p>
              <h1 style="margin:0 0 8px 0;font-size:24px;font-weight:700;color:#000;">Booking Confirmed!</h1>
              <p style="margin:0 0 24px 0;font-size:15px;color:#333;">Hi ${data.seekerName}, your date with <strong>${data.companionName}</strong> is confirmed.</p>

              <div style="background:#fff;border:3px solid #000;border-radius:8px;padding:20px;margin:0 0 24px 0;">
                <table width="100%" cellpadding="0" cellspacing="0">
                  <tr>
                    <td colspan="2" style="padding:0 0 12px 0;font-size:12px;font-weight:700;letter-spacing:2px;text-transform:uppercase;color:#FF2A5F;border-bottom:2px solid #000;">Date Details</td>
                  </tr>
                  <tr><td style="padding:6px 0;font-size:14px;color:#555;">With</td><td style="padding:6px 0;font-size:14px;color:#000;font-weight:600;">${data.companionName}</td></tr>
                  <tr><td style="padding:6px 0;font-size:14px;color:#555;">Date</td><td style="padding:6px 0;font-size:14px;color:#000;font-weight:600;">${data.dateStr}</td></tr>
                  <tr><td style="padding:6px 0;font-size:14px;color:#555;">Time</td><td style="padding:6px 0;font-size:14px;color:#000;font-weight:600;">${data.timeStr}</td></tr>
                  <tr><td style="padding:6px 0;font-size:14px;color:#555;">Duration</td><td style="padding:6px 0;font-size:14px;color:#000;font-weight:600;">${data.duration} hour${data.duration !== 1 ? 's' : ''}</td></tr>
                  <tr><td style="padding:6px 0;font-size:14px;color:#555;">Activity</td><td style="padding:6px 0;font-size:14px;color:#000;font-weight:600;">${activityFormatted}</td></tr>
                  ${locationRow}
                  <tr>
                    <td style="padding:12px 0 6px 0;font-size:14px;color:#555;border-top:2px solid #eee;margin-top:8px;">Total</td>
                    <td style="padding:12px 0 6px 0;font-size:18px;color:#000;font-weight:700;border-top:2px solid #eee;">$${Number(data.totalPrice).toFixed(2)}</td>
                  </tr>
                </table>
              </div>

              <p style="margin:0;font-size:13px;color:#666;">Open the DateRabbit app to view full details or message your companion.</p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
    `.trim();
  }

  private buildBookingConfirmedCompanionTemplate(data: {
    companionName: string;
    seekerName: string;
    dateStr: string;
    timeStr: string;
    duration: number;
    activity: string;
    location?: string;
    totalPrice: number;
  }): string {
    const activityFormatted =
      data.activity.charAt(0).toUpperCase() + data.activity.slice(1).toLowerCase();
    const locationRow = data.location
      ? `<tr><td style="padding:6px 0;font-size:14px;color:#555;">Location</td><td style="padding:6px 0;font-size:14px;color:#000;font-weight:600;">${data.location}</td></tr>`
      : '';

    return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>New Booking Confirmed</title>
</head>
<body style="margin:0;padding:0;background:#F4F0EA;font-family:Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#F4F0EA;padding:40px 20px;">
    <tr>
      <td align="center">
        <table width="480" cellpadding="0" cellspacing="0" style="background:#F4F0EA;border:3px solid #000;border-radius:12px;padding:32px;">
          <tr>
            <td>
              <p style="margin:0 0 4px 0;font-size:11px;font-weight:700;letter-spacing:3px;text-transform:uppercase;color:#FF2A5F;">DateRabbit</p>
              <h1 style="margin:0 0 8px 0;font-size:24px;font-weight:700;color:#000;">New Booking!</h1>
              <p style="margin:0 0 24px 0;font-size:15px;color:#333;">Hi ${data.companionName}, you confirmed a date with <strong>${data.seekerName}</strong>.</p>

              <div style="background:#fff;border:3px solid #000;border-radius:8px;padding:20px;margin:0 0 24px 0;">
                <table width="100%" cellpadding="0" cellspacing="0">
                  <tr>
                    <td colspan="2" style="padding:0 0 12px 0;font-size:12px;font-weight:700;letter-spacing:2px;text-transform:uppercase;color:#FF2A5F;border-bottom:2px solid #000;">Booking Details</td>
                  </tr>
                  <tr><td style="padding:6px 0;font-size:14px;color:#555;">Guest</td><td style="padding:6px 0;font-size:14px;color:#000;font-weight:600;">${data.seekerName}</td></tr>
                  <tr><td style="padding:6px 0;font-size:14px;color:#555;">Date</td><td style="padding:6px 0;font-size:14px;color:#000;font-weight:600;">${data.dateStr}</td></tr>
                  <tr><td style="padding:6px 0;font-size:14px;color:#555;">Time</td><td style="padding:6px 0;font-size:14px;color:#000;font-weight:600;">${data.timeStr}</td></tr>
                  <tr><td style="padding:6px 0;font-size:14px;color:#555;">Duration</td><td style="padding:6px 0;font-size:14px;color:#000;font-weight:600;">${data.duration} hour${data.duration !== 1 ? 's' : ''}</td></tr>
                  <tr><td style="padding:6px 0;font-size:14px;color:#555;">Activity</td><td style="padding:6px 0;font-size:14px;color:#000;font-weight:600;">${activityFormatted}</td></tr>
                  ${locationRow}
                  <tr>
                    <td style="padding:12px 0 6px 0;font-size:14px;color:#555;border-top:2px solid #eee;">Your earnings</td>
                    <td style="padding:12px 0 6px 0;font-size:18px;color:#000;font-weight:700;border-top:2px solid #eee;">$${Number(data.totalPrice).toFixed(2)}</td>
                  </tr>
                </table>
              </div>

              <p style="margin:0;font-size:13px;color:#666;">Open the DateRabbit app to message your guest or view booking details.</p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
    `.trim();
  }
}
