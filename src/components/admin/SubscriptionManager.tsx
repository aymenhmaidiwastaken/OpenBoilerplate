import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";

interface Subscription {
  id: string;
  userId: string;
  userEmail: string;
  plan: string;
  status: string;
  currentPeriodEnd: string;
  amount: number;
}

interface PlanDistribution {
  plan: string;
  count: number;
  percentage: number;
}

interface SubscriptionData {
  subscriptions: Subscription[];
  distribution: PlanDistribution[];
  total: number;
}

export function SubscriptionManager() {
  const [data, setData] = useState<SubscriptionData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchSubscriptions() {
      try {
        const res = await fetch("/api/admin/subscriptions");
        if (res.ok) {
          const json = await res.json();
          setData(json);
        }
      } catch (err) {
        console.error("Failed to fetch subscriptions:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchSubscriptions();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <p className="text-muted-foreground">Loading subscriptions...</p>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="flex items-center justify-center py-12">
        <p className="text-muted-foreground">Failed to load subscription data.</p>
      </div>
    );
  }

  const statusVariant = (status: string) => {
    switch (status) {
      case "active":
        return "default" as const;
      case "trialing":
        return "secondary" as const;
      case "canceled":
      case "past_due":
        return "destructive" as const;
      default:
        return "outline" as const;
    }
  };

  return (
    <div className="space-y-6">
      {/* Plan Distribution Summary */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {data.distribution.map((plan) => (
          <Card key={plan.plan}>
            <CardContent className="p-6">
              <p className="text-sm font-medium text-muted-foreground capitalize">
                {plan.plan} Plan
              </p>
              <p className="mt-1 text-2xl font-bold">{plan.count}</p>
              <p className="text-xs text-muted-foreground">
                {plan.percentage.toFixed(1)}% of total
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Subscriptions Table */}
      <Card>
        <CardHeader>
          <CardTitle>Active Subscriptions</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>User</TableHead>
                <TableHead>Plan</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Renewal Date</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.subscriptions.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="h-24 text-center">
                    <p className="text-muted-foreground">No active subscriptions.</p>
                  </TableCell>
                </TableRow>
              ) : (
                data.subscriptions.map((sub) => (
                  <TableRow key={sub.id}>
                    <TableCell>{sub.userEmail}</TableCell>
                    <TableCell className="capitalize">{sub.plan}</TableCell>
                    <TableCell>
                      <Badge variant={statusVariant(sub.status)}>
                        {sub.status}
                      </Badge>
                    </TableCell>
                    <TableCell>${(sub.amount / 100).toFixed(2)}/mo</TableCell>
                    <TableCell className="text-muted-foreground">
                      {new Date(sub.currentPeriodEnd).toLocaleDateString()}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
