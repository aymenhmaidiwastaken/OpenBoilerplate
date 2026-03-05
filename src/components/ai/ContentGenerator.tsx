import { useState, useRef } from "react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useCredits } from "@/hooks/useCredits";
import { CREDIT_COSTS } from "@/lib/credits";

const TEMPLATES = [
  { value: "blog-post", label: "Blog Post" },
  { value: "marketing-copy", label: "Marketing Copy" },
  { value: "product-description", label: "Product Description" },
  { value: "email", label: "Email" },
  { value: "custom", label: "Custom" },
] as const;

export default function ContentGenerator() {
  const { credits, loading: creditsLoading, refresh } = useCredits();
  const [template, setTemplate] = useState<string>("blog-post");
  const [prompt, setPrompt] = useState("");
  const [temperature, setTemperature] = useState(0.7);
  const [output, setOutput] = useState("");
  const [generating, setGenerating] = useState(false);
  const [copied, setCopied] = useState(false);
  const abortRef = useRef<AbortController | null>(null);

  const creditCost = CREDIT_COSTS["ai-text"];

  async function handleGenerate() {
    if (!prompt.trim() || generating) return;

    setGenerating(true);
    setOutput("");

    try {
      abortRef.current = new AbortController();

      const response = await fetch("/api/ai/generate-content", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt, template, temperature }),
        signal: abortRef.current.signal,
      });

      if (!response.ok) {
        const err = await response.json().catch(() => ({ error: "Generation failed" }));
        setOutput(`Error: ${err.error || "Generation failed"}`);
        setGenerating(false);
        return;
      }

      const reader = response.body?.getReader();
      const decoder = new TextDecoder();

      if (!reader) {
        setOutput("Error: No response stream");
        setGenerating(false);
        return;
      }

      let buffer = "";
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split("\n");
        buffer = lines.pop() || "";

        for (const line of lines) {
          if (line.startsWith("data: ")) {
            const text = line.slice(6);
            if (text === "[DONE]") break;
            setOutput((prev) => prev + text);
          }
        }
      }

      refresh();
    } catch (err: any) {
      if (err.name !== "AbortError") {
        setOutput(`Error: ${err.message || "Generation failed"}`);
      }
    } finally {
      setGenerating(false);
      abortRef.current = null;
    }
  }

  function handleStop() {
    abortRef.current?.abort();
    setGenerating(false);
  }

  async function handleCopy() {
    if (!output) return;
    await navigator.clipboard.writeText(output);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <Card>
        <CardHeader>
          <CardTitle>Configure Generation</CardTitle>
          <CardDescription>
            Set up your content parameters and generate AI-powered text.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="template">Template</Label>
            <Select value={template} onValueChange={setTemplate}>
              <SelectTrigger id="template">
                <SelectValue placeholder="Select a template" />
              </SelectTrigger>
              <SelectContent>
                {TEMPLATES.map((t) => (
                  <SelectItem key={t.value} value={t.value}>
                    {t.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="prompt">Prompt</Label>
            <Textarea
              id="prompt"
              placeholder="Describe what you want to generate..."
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              rows={6}
            />
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="temperature">Temperature</Label>
              <span className="text-sm text-muted-foreground">{temperature.toFixed(1)}</span>
            </div>
            <input
              id="temperature"
              type="range"
              min={0}
              max={1}
              step={0.1}
              value={temperature}
              onChange={(e) => setTemperature(parseFloat(e.target.value))}
              className="w-full accent-primary"
            />
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>Precise</span>
              <span>Creative</span>
            </div>
          </div>
        </CardContent>
        <CardFooter className="flex items-center justify-between">
          <div className="text-sm text-muted-foreground">
            Cost: <span className="font-medium">{creditCost} credit{creditCost !== 1 ? "s" : ""}</span>
            {" / "}
            Remaining:{" "}
            <span className="font-medium">
              {creditsLoading ? "..." : credits}
            </span>
          </div>
          {generating ? (
            <Button variant="destructive" onClick={handleStop}>
              Stop
            </Button>
          ) : (
            <Button
              onClick={handleGenerate}
              disabled={!prompt.trim() || credits < creditCost}
            >
              Generate
            </Button>
          )}
        </CardFooter>
      </Card>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Output</CardTitle>
            {output && (
              <Button variant="outline" size="sm" onClick={handleCopy}>
                {copied ? "Copied!" : "Copy"}
              </Button>
            )}
          </div>
          <CardDescription>
            Generated content will appear here.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="min-h-[200px] whitespace-pre-wrap rounded-md border border-border bg-muted/50 p-4 text-sm">
            {generating && !output && (
              <span className="text-muted-foreground">Generating...</span>
            )}
            {output || (!generating && (
              <span className="text-muted-foreground">
                Your generated content will appear here.
              </span>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
