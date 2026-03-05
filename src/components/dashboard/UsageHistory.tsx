import { useState, useEffect } from "react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import {
  Table,
  TableHeader,
  TableBody,
  TableHead,
  TableRow,
  TableCell,
} from "@/components/ui/table";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

interface UsageRecord {
  id: string;
  userId: string;
  type: "ai-text" | "ai-image" | "ai-document";
  credits: number;
  metadata?: Record<string, unknown>;
  createdAt: string;
}

const typeLabels: Record<string, string> = {
  "ai-text": "Text Generation",
  "ai-image": "Image Generation",
  "ai-document": "Document Analysis",
};

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function aggregateByDate(records: UsageRecord[]): { date: string; credits: number }[] {
  const map = new Map<string, number>();

  for (const record of records) {
    const day = new Date(record.createdAt).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    });
    map.set(day, (map.get(day) || 0) + record.credits);
  }

  return Array.from(map.entries())
    .map(([date, credits]) => ({ date, credits }))
    .reverse();
}

export default function UsageHistory() {
  const [records, setRecords] = useState<UsageRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/usage")
      .then((res) => {
        if (!res.ok) throw new Error("Failed to fetch usage data");
        return res.json();
      })
      .then((data) => setRecords(data.records || []))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="space-y-6">
        <Card>
          <CardContent className="p-6">
            <div className="animate-pulse space-y-4">
              <div className="h-4 bg-muted rounded w-1/3" />
              <div className="h-48 bg-muted rounded" />
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error) {
    return (
      <Card>
        <CardContent className="p-6">
          <p className="text-destructive">{error}</p>
        </CardContent>
      </Card>
    );
  }

  const chartData = aggregateByDate(records);

  return (
    <div className="space-y-6">
      {/* Usage Chart */}
      <Card>
        <CardHeader>
          <CardTitle>Usage Trend</CardTitle>
          <CardDescription>Credits consumed over time.</CardDescription>
        </CardHeader>
        <CardContent>
          {chartData.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={chartData}>
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
                    fontSize: "12px",
                  }}
                />
                <Line
                  type="monotone"
                  dataKey="credits"
                  stroke="hsl(var(--primary))"
                  strokeWidth={2}
                  dot={{ fill: "hsl(var(--primary))", r: 4 }}
                  activeDot={{ r: 6 }}
                />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex items-center justify-center h-48 text-muted-foreground">
              No usage data yet. Start using AI tools to see your usage trend.
            </div>
          )}
        </CardContent>
      </Card>

      {/* Usage Table */}
      <Card>
        <CardHeader>
          <CardTitle>Usage Records</CardTitle>
          <CardDescription>Detailed log of your AI credit consumption.</CardDescription>
        </CardHeader>
        <CardContent>
          {records.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead className="text-right">Credits</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {records.map((record) => (
                  <TableRow key={record.id}>
                    <TableCell className="text-muted-foreground">
                      {formatDate(record.createdAt)}
                    </TableCell>
                    <TableCell>{typeLabels[record.type] || record.type}</TableCell>
                    <TableCell className="text-right font-medium">
                      -{record.credits}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <div className="flex items-center justify-center py-12 text-muted-foreground">
              No usage records found. Your AI usage will appear here.
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
