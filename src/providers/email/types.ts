export interface EmailOptions {
  to: string;
  subject: string;
  html: string;
}

export interface EmailProvider {
  send(options: EmailOptions): Promise<{ id: string }>;
  sendWelcome(to: string, name: string): Promise<{ id: string }>;
  sendPasswordReset(to: string, resetUrl: string): Promise<{ id: string }>;
  sendSubscriptionConfirmation(to: string, planName: string): Promise<{ id: string }>;
  sendUsageWarning(to: string, currentUsage: number, limit: number): Promise<{ id: string }>;
}
