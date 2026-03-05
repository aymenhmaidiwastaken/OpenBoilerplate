import { Resend } from "resend";
import type { EmailProvider, EmailOptions } from "./types";

function getResendClient(): Resend {
  const apiKey = import.meta.env.RESEND_API_KEY;
  if (!apiKey) {
    throw new Error("RESEND_API_KEY is not set in environment variables");
  }
  return new Resend(apiKey);
}

function getFromAddress(): string {
  const from = import.meta.env.EMAIL_FROM;
  if (!from) {
    throw new Error("EMAIL_FROM is not set in environment variables");
  }
  return from;
}

function baseLayout(title: string, body: string): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${title}</title>
</head>
<body style="margin:0;padding:0;background-color:#f4f4f5;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#f4f4f5;padding:40px 0;">
    <tr>
      <td align="center">
        <table width="560" cellpadding="0" cellspacing="0" style="background-color:#ffffff;border-radius:8px;padding:40px;box-shadow:0 1px 3px rgba(0,0,0,0.1);">
          <tr>
            <td>
              ${body}
            </td>
          </tr>
          <tr>
            <td style="padding-top:32px;border-top:1px solid #e4e4e7;margin-top:32px;">
              <p style="font-size:12px;color:#a1a1aa;margin:0;">This is an automated message. Please do not reply directly to this email.</p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

export class ResendEmailProvider implements EmailProvider {
  private client: Resend;
  private from: string;

  constructor() {
    this.client = getResendClient();
    this.from = getFromAddress();
  }

  async send(options: EmailOptions): Promise<{ id: string }> {
    const { data, error } = await this.client.emails.send({
      from: this.from,
      to: options.to,
      subject: options.subject,
      html: options.html,
    });

    if (error || !data) {
      throw new Error(`Failed to send email: ${error?.message ?? "Unknown error"}`);
    }

    return { id: data.id };
  }

  async sendWelcome(to: string, name: string): Promise<{ id: string }> {
    const html = baseLayout(
      "Welcome",
      `
      <h1 style="font-size:24px;font-weight:700;color:#18181b;margin:0 0 16px;">Welcome, ${name}!</h1>
      <p style="font-size:16px;color:#3f3f46;line-height:1.6;margin:0 0 16px;">
        We're excited to have you on board. Your account has been created successfully and you're all set to get started.
      </p>
      <p style="font-size:16px;color:#3f3f46;line-height:1.6;margin:0 0 24px;">
        If you have any questions, feel free to reach out to our support team at any time.
      </p>
      <a href="#" style="display:inline-block;background-color:#18181b;color:#ffffff;text-decoration:none;padding:12px 24px;border-radius:6px;font-size:14px;font-weight:600;">
        Get Started
      </a>
      `
    );

    return this.send({ to, subject: `Welcome, ${name}!`, html });
  }

  async sendPasswordReset(to: string, resetUrl: string): Promise<{ id: string }> {
    const html = baseLayout(
      "Reset Your Password",
      `
      <h1 style="font-size:24px;font-weight:700;color:#18181b;margin:0 0 16px;">Reset Your Password</h1>
      <p style="font-size:16px;color:#3f3f46;line-height:1.6;margin:0 0 16px;">
        We received a request to reset your password. Click the button below to choose a new password.
      </p>
      <p style="font-size:16px;color:#3f3f46;line-height:1.6;margin:0 0 24px;">
        If you did not request a password reset, you can safely ignore this email. The link will expire in 1 hour.
      </p>
      <a href="${resetUrl}" style="display:inline-block;background-color:#18181b;color:#ffffff;text-decoration:none;padding:12px 24px;border-radius:6px;font-size:14px;font-weight:600;">
        Reset Password
      </a>
      <p style="font-size:12px;color:#a1a1aa;line-height:1.6;margin:16px 0 0;">
        Or copy and paste this link: ${resetUrl}
      </p>
      `
    );

    return this.send({ to, subject: "Reset Your Password", html });
  }

  async sendSubscriptionConfirmation(to: string, planName: string): Promise<{ id: string }> {
    const html = baseLayout(
      "Subscription Confirmed",
      `
      <h1 style="font-size:24px;font-weight:700;color:#18181b;margin:0 0 16px;">Subscription Confirmed</h1>
      <p style="font-size:16px;color:#3f3f46;line-height:1.6;margin:0 0 16px;">
        Your subscription to the <strong>${planName}</strong> plan has been confirmed. Thank you for your purchase!
      </p>
      <p style="font-size:16px;color:#3f3f46;line-height:1.6;margin:0 0 24px;">
        You now have access to all the features included in your plan. Visit your dashboard to start exploring.
      </p>
      <a href="#" style="display:inline-block;background-color:#18181b;color:#ffffff;text-decoration:none;padding:12px 24px;border-radius:6px;font-size:14px;font-weight:600;">
        Go to Dashboard
      </a>
      `
    );

    return this.send({ to, subject: `Subscription Confirmed: ${planName}`, html });
  }

  async sendUsageWarning(to: string, currentUsage: number, limit: number): Promise<{ id: string }> {
    const percentage = Math.round((currentUsage / limit) * 100);

    const html = baseLayout(
      "Usage Warning",
      `
      <h1 style="font-size:24px;font-weight:700;color:#18181b;margin:0 0 16px;">Usage Warning</h1>
      <p style="font-size:16px;color:#3f3f46;line-height:1.6;margin:0 0 16px;">
        You have used <strong>${percentage}%</strong> of your plan's limit.
      </p>
      <table width="100%" cellpadding="0" cellspacing="0" style="margin:0 0 16px;">
        <tr>
          <td style="background-color:#e4e4e7;border-radius:4px;height:8px;">
            <div style="background-color:${percentage >= 90 ? "#ef4444" : "#f59e0b"};border-radius:4px;height:8px;width:${Math.min(percentage, 100)}%;"></div>
          </td>
        </tr>
      </table>
      <p style="font-size:14px;color:#71717a;margin:0 0 24px;">
        ${currentUsage.toLocaleString()} of ${limit.toLocaleString()} used
      </p>
      <p style="font-size:16px;color:#3f3f46;line-height:1.6;margin:0 0 24px;">
        Consider upgrading your plan to avoid service interruptions when you reach your limit.
      </p>
      <a href="#" style="display:inline-block;background-color:#18181b;color:#ffffff;text-decoration:none;padding:12px 24px;border-radius:6px;font-size:14px;font-weight:600;">
        Upgrade Plan
      </a>
      `
    );

    return this.send({ to, subject: `Usage Warning: ${percentage}% of limit reached`, html });
  }
}
