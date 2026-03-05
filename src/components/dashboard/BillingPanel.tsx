import { useSubscription } from "@/hooks/useSubscription";
import { useCredits } from "@/hooks/useCredits";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";

function UsageMeter({ used, limit }: { used: number; limit: number }) {
  const percentage = limit > 0 ? Math.min(100, Math.round((used / limit) * 100)) : 0;

  return (
    <div className="space-y-2">
      <div className="flex justify-between text-sm">
        <span className="text-muted-foreground">Credits used</span>
        <span className="font-medium">
          {used} / {limit}
        </span>
      </div>
      <Progress value={percentage} />
      <p className="text-xs text-muted-foreground">{percentage}% of your monthly allowance</p>
    </div>
  );
}

export default function BillingPanel() {
  const { subscription, loading: subLoading, checkout, manage } = useSubscription();
  const { credits, loading: creditsLoading } = useCredits();

  if (subLoading || creditsLoading) {
    return (
      <div className="space-y-4">
        <Card>
          <CardContent className="p-6">
            <div className="animate-pulse space-y-4">
              <div className="h-4 bg-muted rounded w-1/3" />
              <div className="h-8 bg-muted rounded w-1/4" />
              <div className="h-2 bg-muted rounded w-full" />
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  const planName = subscription?.planId
    ? subscription.planId.charAt(0).toUpperCase() + subscription.planId.slice(1)
    : "Free";
  const isFreePlan = !subscription || subscription.status !== "active";
  const monthlyLimit = isFreePlan ? 100 : 5000;
  const used = monthlyLimit - credits;
  const nextBilling = subscription?.currentPeriodEnd
    ? new Date(subscription.currentPeriodEnd).toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      })
    : null;

  return (
    <div className="space-y-6">
      {/* Current Plan */}
      <Card>
        <CardHeader>
          <CardTitle>Current Plan</CardTitle>
          <CardDescription>
            {isFreePlan
              ? "You are on the free plan. Upgrade to unlock more features."
              : `You are subscribed to the ${planName} plan.`}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-baseline gap-2">
            <span className="text-4xl font-bold">{planName}</span>
            {subscription?.status && (
              <span
                className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                  subscription.status === "active"
                    ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                    : "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400"
                }`}
              >
                {subscription.status}
              </span>
            )}
          </div>

          {/* Usage Meter */}
          <UsageMeter used={Math.max(0, used)} limit={monthlyLimit} />

          {nextBilling && (
            <p className="text-sm text-muted-foreground">
              Next billing date: <span className="font-medium text-foreground">{nextBilling}</span>
            </p>
          )}

          {subscription?.cancelAtPeriodEnd && (
            <p className="text-sm text-yellow-600 dark:text-yellow-400">
              Your subscription will be canceled at the end of the current billing period.
            </p>
          )}
        </CardContent>
        <CardFooter className="gap-3">
          {isFreePlan ? (
            <Button onClick={() => checkout("pro", "monthly")}>Upgrade to Pro</Button>
          ) : (
            <Button variant="outline" onClick={() => manage()}>
              Manage Subscription
            </Button>
          )}
        </CardFooter>
      </Card>

      {/* Credits Summary */}
      <Card>
        <CardHeader>
          <CardTitle>Credits</CardTitle>
          <CardDescription>Your remaining credits for AI operations.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-baseline gap-2">
            <span className="text-4xl font-bold">{credits}</span>
            <span className="text-muted-foreground">credits remaining</span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
