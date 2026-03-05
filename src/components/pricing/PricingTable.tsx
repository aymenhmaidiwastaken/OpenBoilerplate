import { useState } from "react";
import { Switch } from "@/components/ui/switch";
import { PlanCard } from "./PlanCard";
import configData from "../../../openboil.config";

interface PricingTableProps {
  currentPlanId?: string;
}

export function PricingTable({ currentPlanId }: PricingTableProps) {
  const [interval, setInterval] = useState<"monthly" | "yearly">("monthly");
  const plans = configData.pricing.plans;
  const currency = configData.pricing.currency;

  return (
    <div>
      {/* Billing interval toggle */}
      <div className="flex items-center justify-center gap-3 mb-12">
        <span
          className={`text-sm font-medium ${
            interval === "monthly" ? "text-foreground" : "text-muted-foreground"
          }`}
        >
          Monthly
        </span>
        <Switch
          checked={interval === "yearly"}
          onCheckedChange={(checked) => setInterval(checked ? "yearly" : "monthly")}
        />
        <span
          className={`text-sm font-medium ${
            interval === "yearly" ? "text-foreground" : "text-muted-foreground"
          }`}
        >
          Yearly
        </span>
        {interval === "yearly" && (
          <span className="ml-1 text-xs font-medium text-primary bg-primary/10 px-2 py-0.5 rounded-full">
            Save ~17%
          </span>
        )}
      </div>

      {/* Plan cards grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
        {plans.map((plan) => (
          <PlanCard
            key={plan.id}
            plan={plan}
            interval={interval}
            currentPlanId={currentPlanId}
            currency={currency}
          />
        ))}
      </div>
    </div>
  );
}
