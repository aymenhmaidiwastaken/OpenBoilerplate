import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useSubscription } from "@/hooks/useSubscription";
import { cn } from "@/lib/utils";
import type { Plan } from "@/config/schema";

interface PlanCardProps {
  plan: Plan;
  interval: "monthly" | "yearly";
  currentPlanId?: string;
  currency?: string;
}

export function PlanCard({ plan, interval, currentPlanId, currency = "USD" }: PlanCardProps) {
  const { checkout, loading } = useSubscription();
  const price = plan.price[interval];
  const isCurrentPlan = currentPlanId === plan.id;
  const isFree = price === 0;
  const isPopular = plan.popular === true;

  const formattedPrice = new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
    minimumFractionDigits: 0,
  }).format(price);

  function handleClick() {
    if (isCurrentPlan || isFree) return;
    checkout(plan.id, interval);
  }

  return (
    <Card
      className={cn(
        "flex flex-col relative",
        isPopular && "border-primary shadow-lg scale-[1.02]"
      )}
    >
      {isPopular && (
        <div className="absolute -top-3 left-1/2 -translate-x-1/2">
          <Badge>Most Popular</Badge>
        </div>
      )}

      <CardHeader className="text-center pb-2">
        <CardTitle className="text-xl">{plan.name}</CardTitle>
        <CardDescription>
          <span className="text-3xl font-bold text-foreground">{formattedPrice}</span>
          {!isFree && (
            <span className="text-muted-foreground ml-1">
              /{interval === "monthly" ? "mo" : "yr"}
            </span>
          )}
        </CardDescription>
        <p className="text-sm text-muted-foreground mt-1">
          {plan.credits.toLocaleString()} credits/month
        </p>
      </CardHeader>

      <CardContent className="flex-1">
        <ul className="space-y-3">
          {plan.features.map((feature) => (
            <li key={feature} className="flex items-start gap-2 text-sm">
              <svg
                className="h-4 w-4 mt-0.5 shrink-0 text-primary"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
              <span>{feature}</span>
            </li>
          ))}
        </ul>
      </CardContent>

      <CardFooter>
        <Button
          className="w-full"
          variant={isPopular ? "default" : "outline"}
          size="lg"
          disabled={isCurrentPlan || loading}
          onClick={handleClick}
        >
          {isCurrentPlan ? "Current Plan" : isFree ? "Get Started" : `Upgrade to ${plan.name}`}
        </Button>
      </CardFooter>
    </Card>
  );
}
