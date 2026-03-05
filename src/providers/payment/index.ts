import type { PaymentProvider } from "./types";
import { config } from "@/config";

let _instance: PaymentProvider | null = null;

export async function getPaymentProvider(): Promise<PaymentProvider> {
  if (_instance) return _instance;

  switch (config.providers.payment) {
    case "lemonsqueezy": {
      const { LemonSqueezyProvider } = await import("./lemonsqueezy");
      _instance = new LemonSqueezyProvider();
      break;
    }
    case "stripe":
    default: {
      const { StripePaymentProvider } = await import("./stripe");
      _instance = new StripePaymentProvider();
      break;
    }
  }

  return _instance;
}

export type { PaymentProvider, Subscription, CheckoutSession } from "./types";
