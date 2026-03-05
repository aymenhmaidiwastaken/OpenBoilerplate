import { Progress } from "@/components/ui/progress";

interface UsageMeterProps {
  used: number;
  total: number;
}

export function UsageMeter({ used, total }: UsageMeterProps) {
  const percentage = total > 0 ? Math.min(Math.round((used / total) * 100), 100) : 0;
  const remaining = Math.max(total - used, 0);
  const isNearLimit = percentage >= 80;
  const isAtLimit = percentage >= 100;

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between text-sm">
        <span className="font-medium">Credits Used</span>
        <span className="text-muted-foreground">
          {used.toLocaleString()} / {total.toLocaleString()}
        </span>
      </div>

      <Progress value={percentage} />

      <div className="flex items-center justify-between text-xs text-muted-foreground">
        <span>
          {isAtLimit
            ? "No credits remaining"
            : `${remaining.toLocaleString()} credits remaining`}
        </span>
        <span
          className={
            isAtLimit
              ? "text-destructive font-medium"
              : isNearLimit
                ? "text-yellow-600 dark:text-yellow-400 font-medium"
                : ""
          }
        >
          {percentage}%
        </span>
      </div>
    </div>
  );
}
