import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const GRADIENTS = [
  "from-amber-400 via-orange-500 to-red-500",
  "from-purple-500 via-pink-500 to-rose-500",
  "from-cyan-400 via-blue-500 to-indigo-600",
  "from-emerald-400 via-teal-500 to-cyan-600",
];

export default function ImageDemo() {
  const [prompt, setPrompt] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [submittedPrompt, setSubmittedPrompt] = useState("");
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, []);

  const handleGenerate = () => {
    if (!prompt.trim() || isLoading) return;

    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    setSubmittedPrompt(prompt);
    setIsLoading(true);
    setShowResults(false);

    timeoutRef.current = setTimeout(() => {
      setIsLoading(false);
      setShowResults(true);
    }, 2000);
  };

  return (
    <div className="max-w-2xl mx-auto mt-10">
      <div className="rounded-xl border border-border bg-card p-6 shadow-lg">
        <p className="text-sm font-medium text-muted-foreground mb-3">
          Try it out — describe the image you want to create
        </p>
        <div className="flex gap-2">
          <Input
            placeholder="e.g. A sunset over mountains with a lake reflection..."
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            disabled={isLoading}
            onKeyDown={(e) => e.key === "Enter" && handleGenerate()}
          />
          <Button
            onClick={handleGenerate}
            disabled={!prompt.trim() || isLoading}
            className="shrink-0 bg-gradient-to-r from-amber-500 to-orange-500 text-white hover:opacity-90"
          >
            {isLoading ? "Creating..." : "Generate"}
          </Button>
        </div>

        {isLoading && (
          <div className="grid grid-cols-2 gap-3 mt-4">
            {[0, 1, 2, 3].map((i) => (
              <div
                key={i}
                className="aspect-square rounded-lg bg-muted animate-pulse"
              />
            ))}
          </div>
        )}

        {showResults && (
          <>
            <div className="grid grid-cols-2 gap-3 mt-4">
              {GRADIENTS.map((gradient, i) => (
                <div
                  key={i}
                  className={`aspect-square rounded-lg bg-gradient-to-br ${gradient} relative overflow-hidden`}
                >
                  <div className="absolute inset-0 flex items-end p-3">
                    <p className="text-xs text-white/80 font-medium line-clamp-2 drop-shadow-lg">
                      {submittedPrompt}
                    </p>
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-4 text-center">
              <a
                href="/auth/register"
                className="text-sm font-medium text-amber-600 dark:text-amber-400 hover:underline"
              >
                Sign up for the full experience &rarr;
              </a>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
