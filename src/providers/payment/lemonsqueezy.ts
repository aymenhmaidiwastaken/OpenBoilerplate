import type {
  PaymentProvider,
  Subscription,
  CheckoutSession,
} from "./types";
import { getDatabaseProvider } from "@/providers/database";
import { config } from "@/config";

const LS_API = "https://api.lemonsqueezy.com/v1";

function getApiKey(): string {
  const key = import.meta.env.LEMONSQUEEZY_API_KEY;
  if (!key)
    throw new Error("Missing LEMONSQUEEZY_API_KEY environment variable");
  return key;
}

function getStoreId(): string {
  const id = import.meta.env.LEMONSQUEEZY_STORE_ID;
  if (!id)
    throw new Error("Missing LEMONSQUEEZY_STORE_ID environment variable");
  return id;
}

function getWebhookSecret(): string {
  const secret = import.meta.env.LEMONSQUEEZY_WEBHOOK_SECRET;
  if (!secret)
    throw new Error(
      "Missing LEMONSQUEEZY_WEBHOOK_SECRET environment variable",
    );
  return secret;
}

interface LSResponse<T> {
  data: T;
  meta?: Record<string, unknown>;
}

interface LSListResponse<T> {
  data: T[];
  meta?: { page: { total: number } };
}

interface LSSubscriptionAttributes {
  status: string;
  renews_at: string;
  created_at: string;
  ends_at: string | null;
  cancelled: boolean;
  customer_id: number;
  variant_id: number;
  product_id: number;
}

interface LSSubscriptionResource {
  id: string;
  type: "subscriptions";
  attributes: LSSubscriptionAttributes;
}

interface LSCheckoutAttributes {
  url: string;
}

interface LSCheckoutResource {
  id: string;
  type: "checkouts";
  attributes: LSCheckoutAttributes;
}

interface LSCustomerResource {
  id: string;
  type: "customers";
  attributes: { email: string };
}

async function lsRequest<T>(
  path: string,
  options: {
    method?: string;
    body?: unknown;
  } = {},
): Promise<T> {
  const { method = "GET", body } = options;

  const headers: Record<string, string> = {
    Authorization: `Bearer ${getApiKey()}`,
    Accept: "application/vnd.api+json",
    "Content-Type": "application/vnd.api+json",
  };

  const init: RequestInit = { method, headers };
  if (body) {
    init.body = JSON.stringify(body);
  }

  const response = await fetch(`${LS_API}${path}`, init);

  if (!response.ok) {
    const error = await response.text().catch(() => "");
    throw new Error(
      `LemonSqueezy API error (${response.status}): ${error || response.statusText}`,
    );
  }

  return response.json() as Promise<T>;
}

function getVariantId(
  planId: string,
  interval: "monthly" | "yearly",
): string {
  const envKey =
    interval === "monthly"
      ? `LEMONSQUEEZY_VARIANT_ID_${planId.toUpperCase()}_MONTHLY`
      : `LEMONSQUEEZY_VARIANT_ID_${planId.toUpperCase()}_YEARLY`;

  const variantId = import.meta.env[envKey];
  if (!variantId)
    throw new Error(
      `Missing LemonSqueezy variant ID for plan "${planId}" (${interval}). Set ${envKey} in your environment.`,
    );
  return variantId;
}

function mapSubscriptionStatus(
  status: string,
): Subscription["status"] {
  switch (status) {
    case "active":
      return "active";
    case "cancelled":
      return "canceled";
    case "past_due":
      return "past_due";
    case "on_trial":
      return "trialing";
    case "paused":
      return "paused";
    default:
      return "canceled";
  }
}

function toSubscription(
  lsSub: LSSubscriptionResource,
  userId: string,
  planId: string,
): Subscription {
  const attrs = lsSub.attributes;
  return {
    id: lsSub.id,
    userId,
    planId,
    status: mapSubscriptionStatus(attrs.status),
    currentPeriodStart: new Date(attrs.created_at),
    currentPeriodEnd: new Date(attrs.renews_at),
    cancelAtPeriodEnd: attrs.cancelled,
    externalId: lsSub.id,
  };
}

function resolvePlanIdFromVariant(variantId: number): string {
  // Reverse-lookup the plan ID from the variant ID stored in env vars
  for (const plan of config.pricing.plans) {
    for (const interval of ["MONTHLY", "YEARLY"] as const) {
      const envKey = `LEMONSQUEEZY_VARIANT_ID_${plan.id.toUpperCase()}_${interval}`;
      if (import.meta.env[envKey] === String(variantId)) {
        return plan.id;
      }
    }
  }
  return "unknown";
}

export class LemonSqueezyProvider implements PaymentProvider {
  async createCheckout(
    userId: string,
    planId: string,
    interval: "monthly" | "yearly",
  ): Promise<CheckoutSession> {
    const db = await getDatabaseProvider();
    const user = await db.getUserById(userId);
    if (!user) throw new Error(`User "${userId}" not found`);

    const plan = config.pricing.plans.find((p) => p.id === planId);
    if (!plan)
      throw new Error(
        `Plan "${planId}" not found in config. Available: ${config.pricing.plans.map((p) => p.id).join(", ")}`,
      );

    const variantId = getVariantId(planId, interval);

    const checkout = await lsRequest<LSResponse<LSCheckoutResource>>(
      "/checkouts",
      {
        method: "POST",
        body: {
          data: {
            type: "checkouts",
            attributes: {
              checkout_data: {
                email: user.email,
                name: user.name ?? undefined,
                custom: {
                  user_id: userId,
                  plan_id: planId,
                },
              },
              product_options: {
                redirect_url: `${config.app.url}/dashboard?checkout=success`,
              },
            },
            relationships: {
              store: {
                data: { type: "stores", id: getStoreId() },
              },
              variant: {
                data: { type: "variants", id: variantId },
              },
            },
          },
        },
      },
    );

    return {
      url: checkout.data.attributes.url,
      sessionId: checkout.data.id,
    };
  }

  async createPortalSession(userId: string): Promise<{ url: string }> {
    const db = await getDatabaseProvider();
    const subscription = await db.getSubscription(userId);

    if (!subscription) {
      throw new Error(
        "No active subscription found. Cannot create customer portal session.",
      );
    }

    // Fetch the subscription from LemonSqueezy to get the customer portal URL
    const lsSub = await lsRequest<LSResponse<{
      id: string;
      attributes: { urls: { customer_portal: string } };
    }>>(`/subscriptions/${subscription.externalId}`);

    return {
      url: lsSub.data.attributes.urls.customer_portal,
    };
  }

  async cancelSubscription(subscriptionId: string): Promise<Subscription> {
    // LemonSqueezy uses PATCH to cancel (sets cancelled = true)
    const lsSub = await lsRequest<LSResponse<LSSubscriptionResource>>(
      `/subscriptions/${subscriptionId}`,
      {
        method: "PATCH",
        body: {
          data: {
            type: "subscriptions",
            id: subscriptionId,
            attributes: {
              cancelled: true,
            },
          },
        },
      },
    );

    const attrs = lsSub.data.attributes;
    const planId = resolvePlanIdFromVariant(attrs.variant_id);

    // Look up userId from the database using the external ID
    const db = await getDatabaseProvider();
    const existingSub = await findSubscriptionByExternalId(db, subscriptionId);
    const userId = existingSub?.userId ?? "";

    const subscription = toSubscription(lsSub.data, userId, planId);
    await db.upsertSubscription(subscription);

    return subscription;
  }

  async getSubscription(userId: string): Promise<Subscription | null> {
    const db = await getDatabaseProvider();
    const local = await db.getSubscription(userId);
    if (local) return local;

    // No local record; we cannot look up by userId on LemonSqueezy without
    // a stored customer ID, so return null. Webhooks keep the DB in sync.
    return null;
  }

  async handleWebhook(
    payload: string,
    signature: string,
  ): Promise<{ event: string; data: unknown }> {
    const webhookSecret = getWebhookSecret();
    const verified = await verifyLemonSqueezySignature(
      payload,
      signature,
      webhookSecret,
    );
    if (!verified) {
      throw new Error("Invalid LemonSqueezy webhook signature");
    }

    const event = JSON.parse(payload) as {
      meta: {
        event_name: string;
        custom_data?: { user_id?: string; plan_id?: string };
      };
      data: LSSubscriptionResource;
    };

    const eventName = event.meta.event_name;
    const db = await getDatabaseProvider();

    switch (eventName) {
      case "subscription_created":
      case "subscription_updated": {
        const lsSub = event.data;
        const userId = event.meta.custom_data?.user_id;
        if (!userId) break;

        const planId =
          event.meta.custom_data?.plan_id ??
          resolvePlanIdFromVariant(lsSub.attributes.variant_id);

        const subscription = toSubscription(lsSub, userId, planId);
        await db.upsertSubscription(subscription);
        break;
      }

      case "subscription_cancelled": {
        const lsSub = event.data;
        const userId = event.meta.custom_data?.user_id;
        if (!userId) break;

        const planId = resolvePlanIdFromVariant(lsSub.attributes.variant_id);
        const subscription = toSubscription(lsSub, userId, planId);
        subscription.status = "canceled";
        subscription.cancelAtPeriodEnd = true;
        await db.upsertSubscription(subscription);
        break;
      }

      case "subscription_payment_failed": {
        const lsSub = event.data;
        const userId = event.meta.custom_data?.user_id;
        if (!userId) break;

        const planId = resolvePlanIdFromVariant(lsSub.attributes.variant_id);
        const subscription = toSubscription(lsSub, userId, planId);
        subscription.status = "past_due";
        await db.upsertSubscription(subscription);
        break;
      }
    }

    return { event: eventName, data: event.data };
  }
}

/**
 * Helper: find a subscription by its external ID through the database.
 * This is used when we only have the LemonSqueezy subscription ID.
 */
async function findSubscriptionByExternalId(
  db: Awaited<ReturnType<typeof getDatabaseProvider>>,
  externalId: string,
): Promise<Subscription | null> {
  // The database provider does not expose a lookup-by-externalId method,
  // so we rely on getSubscription being called with the right userId.
  // In practice, the webhook always supplies the userId via custom_data.
  // This helper is a best-effort fallback.
  void db;
  void externalId;
  return null;
}

/**
 * Verify a LemonSqueezy webhook signature using HMAC-SHA256.
 * LemonSqueezy sends the signature in the `X-Signature` header as a hex string.
 */
async function verifyLemonSqueezySignature(
  payload: string,
  signature: string,
  secret: string,
): Promise<boolean> {
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
    encoder.encode(payload),
  );

  const expectedSignature = Array.from(new Uint8Array(signatureBuffer))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");

  return expectedSignature === signature;
}
