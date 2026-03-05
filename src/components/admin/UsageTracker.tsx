import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

interface UsageDataPoint {
  date: string;
  "ai-text": number;
  "ai-image": number;
  "ai-document": number;
}

interface UsageSummary {
  type: string;
  total: number;
  totalCredits: number;
}

interface UsageData {
  timeline: UsageDataPoint[];
  summary: UsageSummary[];
}

export function UsageTracker() {
  const [data, setData] = useState<UsageData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchUsage() {
      try {
        const res = await fetch("/api/admin/usage");
        if (res.ok) {
          const json = await res.json();
          setData(json);
        }
      } catch (err) {
        console.error("Failed to fetch usage data:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchUsage();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <p className="text-muted-foreground">Loading usage data...</p>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="flex items-center justify-center py-12">
        <p className="text-muted-foreground">Failed to load usage data.</p>
      </div>
    );
  }

  const typeLabels: Record<string, string> = {
    "ai-text": "AI Text",
    "ai-image": "AI Image",
    "ai-document": "AI Document",
  };

  const typeColors: Record<string, string> = {
    "ai-text": "hsl(var(--primary))",
    "ai-image": "hsl(210, 80%, 55%)",
    "ai-document": "hsl(150, 60%, 45%)",
  };

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid gap-4 sm:grid-cols-3">
        {data.summary.map((item) => (
          <Card key={item.type}>
            <CardContent className="p-6">
              <p className="text-sm font-medium text-muted-foreground">
                {typeLabels[item.type] || item.type}
              </p>
              <p className="mt-1 text-2xl font-bold">{item.total.toLocaleString()}</p>
              <p className="text-xs text-muted-foreground">
                {item.totalCredits.toLocaleString()} credits used
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Usage Over Time Chart */}
      <Card>
        <CardHeader>
          <CardTitle>AI Usage Over Time</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[400px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data.timeline}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                <XAxis
                  dataKey="date"
                  className="text-xs"
                  tick={{ fill: "hsl(var(--muted-foreground))" }}
                />
                <YAxis
                  className="text-xs"
                  tick={{ fill: "hsl(var(--muted-foreground))" }}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "hsl(var(--card))",
                    border: "1px solid hsl(var(--border))",
                    borderRadius: "8px",
                    color: "hsl(var(--foreground))",
                  }}
                />
                <Legend />
                <Bar
                  dataKey="ai-text"
                  name="AI Text"
                  fill={typeColors["ai-text"]}
                  radius={[4, 4, 0, 0]}
                  stackId="usage"
                />
                <Bar
                  dataKey="ai-image"
                  name="AI Image"
                  fill={typeColors["ai-image"]}
                  radius={[4, 4, 0, 0]}
                  stackId="usage"
                />
                <Bar
                  dataKey="ai-document"
                  name="AI Document"
                  fill={typeColors["ai-document"]}
                  radius={[4, 4, 0, 0]}
                  stackId="usage"
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
