import type {
  PaymentProvider,
  Subscription,
  CheckoutSession,
} from "./types";
import { getDatabaseProvider } from "@/providers/database";
import { config } from "@/config";

const STRIPE_API = "https://api.stripe.com/v1";

function getSecretKey(): string {
  const key = import.meta.env.STRIPE_SECRET_KEY;
  if (!key) throw new Error("Missing STRIPE_SECRET_KEY environment variable");
  return key;
}

function getWebhookSecret(): string {
  const secret = import.meta.env.STRIPE_WEBHOOK_SECRET;
  if (!secret)
    throw new Error("Missing STRIPE_WEBHOOK_SECRET environment variable");
  return secret;
}

async function stripeRequest<T>(
  path: string,
  options: {
    method?: string;
    body?: Record<string, string | undefined>;
  } = {},
): Promise<T> {
  const { method = "GET", body } = options;

  const headers: Record<string, string> = {
    Authorization: `Bearer ${getSecretKey()}`,
    "Content-Type": "application/x-www-form-urlencoded",
  };

  const init: RequestInit = { method, headers };

  if (body) {
    const params = new URLSearchParams();
    for (const [key, value] of Object.entries(body)) {
      if (value !== undefined) params.append(key, value);
    }
    init.body = params.toString();
  }

  const response = await fetch(`${STRIPE_API}${path}`, init);

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(
      `Stripe API error (${response.status}): ${(error as Record<string, Record<string, string>>)?.error?.message ?? response.statusText}`,
    );
  }

  return response.json() as Promise<T>;
}

function getPlanPriceId(planId: string, interval: "monthly" | "yearly"): string {
  const envKey =
    interval === "monthly"
      ? `STRIPE_PRICE_ID_${planId.toUpperCase()}_MONTHLY`
      : `STRIPE_PRICE_ID_${planId.toUpperCase()}_YEARLY`;

  const priceId = import.meta.env[envKey];
  if (!priceId)
    throw new Error(
      `Missing Stripe price ID for plan "${planId}" (${interval}). Set ${envKey} in your environment.`,
    );
  return priceId;
}

function mapSubscriptionStatus(
  status: string,
): Subscription["status"] {
  switch (status) {
    case "active":
      return "active";
    case "canceled":
      return "canceled";
    case "past_due":
      return "past_due";
    case "trialing":
      return "trialing";
    case "paused":
      return "paused";
    default:
      return "canceled";
  }
}

interface StripeSubscription {
  id: string;
  status: string;
  current_period_start: number;
  current_period_end: number;
  cancel_at_period_end: boolean;
  metadata: Record<string, string>;
  items: {
    data: Array<{
      price: { id: string; product: string };
    }>;
  };
}

interface StripeCheckoutSession {
  id: string;
  url: string;
}

interface StripePortalSession {
  url: string;
}

interface StripeCustomerSearch {
  data: Array<{ id: string }>;
}

interface StripeSubscriptionList {
  data: StripeSubscription[];
}

function toSubscription(
  stripeSub: StripeSubscription,
  userId: string,
): Subscription {
  return {
    id: stripeSub.id,
    userId,
    planId: stripeSub.metadata?.plan_id ?? "unknown",
    status: mapSubscriptionStatus(stripeSub.status),
    currentPeriodStart: new Date(stripeSub.current_period_start * 1000),
    currentPeriodEnd: new Date(stripeSub.current_period_end * 1000),
    cancelAtPeriodEnd: stripeSub.cancel_at_period_end,
    externalId: stripeSub.id,
  };
}

async function getOrCreateStripeCustomer(userId: string): Promise<string> {
  const db = await getDatabaseProvider();
  const user = await db.getUserById(userId);
  if (!user) throw new Error(`User "${userId}" not found`);

  // Search for an existing Stripe customer by email
  const search = await stripeRequest<StripeCustomerSearch>(
    `/customers/search?query=email:'${encodeURIComponent(user.email)}'`,
  );

  if (search.data.length > 0) {
    return search.data[0].id;
  }

  // Create a new customer
  const customer = await stripeRequest<{ id: string }>("/customers", {
    method: "POST",
    body: {
      email: user.email,
      name: user.name ?? undefined,
      "metadata[user_id]": userId,
    },
  });

  return customer.id;
}

export class StripePaymentProvider implements PaymentProvider {
  async createCheckout(
    userId: string,
    planId: string,
    interval: "monthly" | "yearly",
  ): Promise<CheckoutSession> {
    const customerId = await getOrCreateStripeCustomer(userId);
    const priceId = getPlanPriceId(planId, interval);

    const plan = config.pricing.plans.find((p) => p.id === planId);
    if (!plan)
      throw new Error(
        `Plan "${planId}" not found in config. Available: ${config.pricing.plans.map((p) => p.id).join(", ")}`,
      );

    const session = await stripeRequest<StripeCheckoutSession>(
      "/checkout/sessions",
      {
        method: "POST",
        body: {
          customer: customerId,
          mode: "subscription",
          "line_items[0][price]": priceId,
          "line_items[0][quantity]": "1",
          success_url: `${config.app.url}/dashboard?checkout=success`,
          cancel_url: `${config.app.url}/pricing?checkout=canceled`,
          "subscription_data[metadata][user_id]": userId,
          "subscription_data[metadata][plan_id]": planId,
        },
      },
    );

    return {
      url: session.url,
      sessionId: session.id,
    };
  }

  async createPortalSession(userId: string): Promise<{ url: string }> {
    const customerId = await getOrCreateStripeCustomer(userId);

    const session = await stripeRequest<StripePortalSession>(
      "/billing_portal/sessions",
      {
        method: "POST",
        body: {
          customer: customerId,
          return_url: `${config.app.url}/dashboard`,
        },
      },
    );

    return { url: session.url };
  }

  async cancelSubscription(subscriptionId: string): Promise<Subscription> {
    const stripeSub = await stripeRequest<StripeSubscription>(
      `/subscriptions/${subscriptionId}`,
      {
        method: "POST",
        body: {
          cancel_at_period_end: "true",
        },
      },
    );

    const userId = stripeSub.metadata?.user_id ?? "";
    const subscription = toSubscription(stripeSub, userId);

    // Persist the cancellation to the database
    const db = await getDatabaseProvider();
    await db.upsertSubscription(subscription);

    return subscription;
  }

  async getSubscription(userId: string): Promise<Subscription | null> {
    // First check the local database
    const db = await getDatabaseProvider();
    const local = await db.getSubscription(userId);
    if (local) return local;

    // Fall back to checking Stripe directly
    try {
      const customerId = await getOrCreateStripeCustomer(userId);
      const list = await stripeRequest<StripeSubscriptionList>(
        `/subscriptions?customer=${customerId}&status=active&limit=1`,
      );

      if (list.data.length === 0) return null;

      const subscription = toSubscription(list.data[0], userId);
      await db.upsertSubscription(subscription);
      return subscription;
    } catch {
      return null;
    }
  }

  async handleWebhook(
    payload: string,
    signature: string,
  ): Promise<{ event: string; data: unknown }> {
    // Verify the webhook signature using the Stripe-provided header
    const webhookSecret = getWebhookSecret();
    const verified = await verifyStripeSignature(
      payload,
      signature,
      webhookSecret,
    );
    if (!verified) {
      throw new Error("Invalid Stripe webhook signature");
    }

    const event = JSON.parse(payload) as {
      type: string;
      data: { object: StripeSubscription & { customer: string } };
    };

    const db = await getDatabaseProvider();

    switch (event.type) {
      case "checkout.session.completed": {
        // The checkout has been paid; subscription is already active.
        break;
      }

      case "customer.subscription.created":
      case "customer.subscription.updated": {
        const stripeSub = event.data.object;
        const userId = stripeSub.metadata?.user_id;
        if (userId) {
          const subscription = toSubscription(stripeSub, userId);
          await db.upsertSubscription(subscription);
        }
        break;
      }

      case "customer.subscription.deleted": {
        const stripeSub = event.data.object;
        const userId = stripeSub.metadata?.user_id;
        if (userId) {
          const subscription = toSubscription(stripeSub, userId);
          subscription.status = "canceled";
          await db.upsertSubscription(subscription);
        }
        break;
      }

      case "invoice.payment_failed": {
        const invoice = event.data.object as unknown as {
          subscription: string;
          customer: string;
        };
        if (invoice.subscription) {
          const stripeSub = await stripeRequest<StripeSubscription>(
            `/subscriptions/${invoice.subscription}`,
          );
          const userId = stripeSub.metadata?.user_id;
          if (userId) {
            const subscription = toSubscription(stripeSub, userId);
            subscription.status = "past_due";
            await db.upsertSubscription(subscription);
          }
        }
        break;
      }
    }

    return { event: event.type, data: event.data.object };
  }
}

/**
 * Verify a Stripe webhook signature (v1 scheme) using the Web Crypto API.
 * Stripe signatures use HMAC-SHA256 with the format:
 *   Stripe-Signature: t=<timestamp>,v1=<hex-signature>
 */
async function verifyStripeSignature(
  payload: string,
  signatureHeader: string,
  secret: string,
): Promise<boolean> {
  const TOLERANCE_SECONDS = 300; // 5 minutes

  const parts = signatureHeader.split(",").reduce(
    (acc, part) => {
      const [key, value] = part.split("=");
      if (key === "t") acc.timestamp = value;
      if (key === "v1") acc.signature = value;
      return acc;
    },
    {} as { timestamp?: string; signature?: string },
  );

  if (!parts.timestamp || !parts.signature) return false;

  const timestamp = parseInt(parts.timestamp, 10);
  const now = Math.floor(Date.now() / 1000);
  if (Math.abs(now - timestamp) > TOLERANCE_SECONDS) return false;

  const signedPayload = `${parts.timestamp}.${payload}`;
  const encoder = new TextEncoder();

  const key = await crypto.subtle.importKey(
    "raw",
    encoder.encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );

  const signatureBuffer = await crypto.subtle.sign(
    "HMAC",
    key,
    encoder.encode(signedPayload),
  );

  const expectedSignature = Array.from(new Uint8Array(signatureBuffer))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");

  return expectedSignature === parts.signature;
}
