import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const SAMPLE_DOCUMENT = `QUARTERLY FINANCIAL REPORT — Q4 2025

Revenue for Q4 reached $12.4 million, representing a 23% increase year-over-year. Operating expenses totaled $8.1 million, with R&D accounting for 35% of the budget. Net income was $2.8 million, up from $1.9 million in Q4 2024. The company expanded into three new markets during the quarter, contributing $1.2 million in new revenue. Customer retention rate improved to 94%, while average contract value grew by 18%. The board approved a $5 million investment in AI infrastructure for the upcoming fiscal year.`;

const RESULTS: Record<string, string> = {
  summarize:
    "This Q4 2025 report shows strong growth: revenue hit $12.4M (+23% YoY), net income rose to $2.8M, and the company expanded into 3 new markets generating $1.2M. Customer retention is at 94% with 18% higher contract values. A $5M AI infrastructure investment was approved.",
  extract:
    "Key data points extracted:\n- Revenue: $12.4M (+23% YoY)\n- Operating Expenses: $8.1M\n- R&D Budget: 35% of expenses\n- Net Income: $2.8M (up from $1.9M)\n- New Markets: 3 ($1.2M new revenue)\n- Customer Retention: 94%\n- Avg Contract Value Growth: +18%\n- Approved Investment: $5M (AI infrastructure)",
  qa: "Based on the document, the company's net income for Q4 2025 was $2.8 million, which represents a significant increase from $1.9 million in Q4 2024 — approximately a 47% year-over-year improvement in profitability.",
};

type Mode = "summarize" | "extract" | "qa";

export default function DocumentDemo() {
  const [mode, setMode] = useState<Mode>("summarize");
  const [question, setQuestion] = useState("");
  const [result, setResult] = useState("");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isDone, setIsDone] = useState(false);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, []);

  const handleAnalyze = () => {
    if (isAnalyzing) return;
    if (mode === "qa" && !question.trim()) return;

    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    setIsAnalyzing(true);
    setResult("");
    setIsDone(false);

    timeoutRef.current = setTimeout(() => {
      setResult(RESULTS[mode]);
      setIsAnalyzing(false);
      setIsDone(true);
    }, 1500);
  };

  const modes: { key: Mode; label: string }[] = [
    { key: "summarize", label: "Summarize" },
    { key: "extract", label: "Extract" },
    { key: "qa", label: "Q&A" },
  ];

  return (
    <div className="max-w-2xl mx-auto mt-10">
      <div className="rounded-xl border border-border bg-card p-6 shadow-lg">
        <p className="text-sm font-medium text-muted-foreground mb-3">
          Try it out — analyze this sample document
        </p>

        <div className="rounded-lg bg-muted/50 p-4 text-xs leading-relaxed text-muted-foreground max-h-32 overflow-y-auto mb-4 font-mono">
          {SAMPLE_DOCUMENT}
        </div>

        <div className="flex rounded-lg border border-border overflow-hidden mb-4">
          {modes.map((m) => (
            <button
              key={m.key}
              onClick={() => {
                setMode(m.key);
                setResult("");
                setIsDone(false);
              }}
              className={`flex-1 px-4 py-2 text-sm font-medium transition-colors ${
                mode === m.key
                  ? "bg-emerald-500 text-white"
                  : "bg-background hover:bg-muted"
              }`}
            >
              {m.label}
            </button>
          ))}
        </div>

        {mode === "qa" && (
          <Input
            placeholder="e.g. What was the net income in Q4?"
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            className="mb-4"
            disabled={isAnalyzing}
          />
        )}

        <Button
          onClick={handleAnalyze}
          disabled={isAnalyzing || (mode === "qa" && !question.trim())}
          className="w-full bg-gradient-to-r from-emerald-500 to-teal-500 text-white hover:opacity-90"
        >
          {isAnalyzing ? "Analyzing..." : "Analyze Document"}
        </Button>

        {isAnalyzing && (
          <div className="mt-4 h-2 rounded-full bg-muted overflow-hidden">
            <div className="h-full w-full bg-gradient-to-r from-emerald-500 to-teal-500 animate-pulse rounded-full" />
          </div>
        )}

        {result && (
          <div className="mt-4 rounded-lg bg-muted/50 p-4 text-sm leading-relaxed whitespace-pre-line">
            {result}
          </div>
        )}

        {isDone && (
          <div className="mt-4 text-center">
            <a
              href="/auth/register"
              className="text-sm font-medium text-emerald-600 dark:text-emerald-400 hover:underline"
            >
              Sign up for the full experience &rarr;
            </a>
          </div>
        )}
      </div>
    </div>
  );
}
