export interface Subscription {
  id: string;
  userId: string;
  planId: string;
  status: "active" | "canceled" | "past_due" | "trialing" | "paused";
  currentPeriodStart: Date;
  currentPeriodEnd: Date;
  cancelAtPeriodEnd: boolean;
  externalId: string;
}

export interface CheckoutSession {
  url: string;
  sessionId: string;
}

export interface PaymentProvider {
  createCheckout(userId: string, planId: string, interval: "monthly" | "yearly"): Promise<CheckoutSession>;
  createPortalSession(userId: string): Promise<{ url: string }>;
  cancelSubscription(subscriptionId: string): Promise<Subscription>;
  getSubscription(userId: string): Promise<Subscription | null>;
  handleWebhook(payload: string, signature: string): Promise<{ event: string; data: unknown }>;
}
