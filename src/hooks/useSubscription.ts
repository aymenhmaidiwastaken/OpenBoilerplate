import { useState, useEffect } from "react";

interface Subscription {
  planId: string;
  status: string;
  currentPeriodEnd: string;
  cancelAtPeriodEnd: boolean;
}

export function useSubscription() {
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/subscriptions/current")
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => setSubscription(data?.subscription ?? null))
      .catch(() => setSubscription(null))
      .finally(() => setLoading(false));
  }, []);

  async function checkout(planId: string, interval: "monthly" | "yearly") {
    const res = await fetch("/api/subscriptions/checkout", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ planId, interval }),
    });
    if (!res.ok) throw new Error("Checkout failed");
    const data = await res.json();
    window.location.href = data.url;
  }

  async function cancel() {
    const res = await fetch("/api/subscriptions/cancel", { method: "POST" });
    if (!res.ok) throw new Error("Cancel failed");
    const data = await res.json();
    setSubscription(data.subscription);
  }

  async function manage() {
    const res = await fetch("/api/subscriptions/portal", { method: "POST" });
    if (!res.ok) throw new Error("Portal failed");
    const data = await res.json();
    window.location.href = data.url;
  }

  return { subscription, loading, checkout, cancel, manage };
}
