import { useState, useRef, useCallback } from "react";
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

const MODES = [
  { value: "summarize", label: "Summarize" },
  { value: "extract", label: "Extract Key Points" },
  { value: "qa", label: "Q&A" },
] as const;

export default function DocumentAnalyzer() {
  const { credits, loading: creditsLoading, refresh } = useCredits();
  const [mode, setMode] = useState<string>("summarize");
  const [question, setQuestion] = useState("");
  const [fileContent, setFileContent] = useState("");
  const [fileName, setFileName] = useState("");
  const [analyzing, setAnalyzing] = useState(false);
  const [result, setResult] = useState("");
  const [tokensUsed, setTokensUsed] = useState<number | null>(null);
  const [error, setError] = useState("");
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const creditCost = CREDIT_COSTS["ai-document"];

  const readFile = useCallback((file: File) => {
    setFileName(file.name);
    setError("");
    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target?.result;
      if (typeof text === "string") {
        setFileContent(text);
      } else {
        setError("Could not read file as text.");
      }
    };
    reader.onerror = () => {
      setError("Failed to read file.");
    };
    reader.readAsText(file);
  }, []);

  function handleDragOver(e: React.DragEvent) {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(true);
  }

  function handleDragLeave(e: React.DragEvent) {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    const file = e.dataTransfer.files?.[0];
    if (file) readFile(file);
  }

  function handleFileInput(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) readFile(file);
  }

  async function handleAnalyze() {
    if (!fileContent.trim() || analyzing) return;

    if (mode === "qa" && !question.trim()) {
      setError("Please enter a question for Q&A mode.");
      return;
    }

    setAnalyzing(true);
    setError("");
    setResult("");
    setTokensUsed(null);

    try {
      const response = await fetch("/api/ai/analyze-document", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          content: fileContent,
          mode,
          ...(mode === "qa" && { question }),
        }),
      });

      if (!response.ok) {
        const err = await response.json().catch(() => ({ error: "Analysis failed" }));
        setError(err.error || "Analysis failed");
        return;
      }

      const data = await response.json();
      setResult(data.text);
      setTokensUsed(data.tokensUsed ?? null);
      refresh();
    } catch (err: any) {
      setError(err.message || "Analysis failed");
    } finally {
      setAnalyzing(false);
    }
  }

  function handleClearFile() {
    setFileContent("");
    setFileName("");
    setResult("");
    setTokensUsed(null);
    setError("");
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  }

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <Card>
        <CardHeader>
          <CardTitle>Upload Document</CardTitle>
          <CardDescription>
            Upload a text document to analyze with AI.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            className={`flex min-h-[150px] cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed p-6 transition-colors ${
              dragActive
                ? "border-primary bg-primary/5"
                : "border-border hover:border-primary/50"
            }`}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept=".txt,.md,.csv,.json,.xml,.html,.log"
              onChange={handleFileInput}
              className="hidden"
            />
            {fileName ? (
              <div className="text-center">
                <p className="text-sm font-medium">{fileName}</p>
                <p className="mt-1 text-xs text-muted-foreground">
                  {fileContent.length.toLocaleString()} characters
                </p>
                <Button
                  variant="ghost"
                  size="sm"
                  className="mt-2"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleClearFile();
                  }}
                >
                  Remove
                </Button>
              </div>
            ) : (
              <div className="text-center">
                <svg
                  className="mx-auto h-10 w-10 text-muted-foreground"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={1.5}
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m6.75 12l-3-3m0 0l-3 3m3-3v6m-1.5-15H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z"
                  />
                </svg>
                <p className="mt-2 text-sm font-medium">
                  Drop a file here or click to browse
                </p>
                <p className="mt-1 text-xs text-muted-foreground">
                  Supports .txt, .md, .csv, .json, .xml, .html, .log
                </p>
              </div>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="analysis-mode">Analysis Mode</Label>
            <Select value={mode} onValueChange={setMode}>
              <SelectTrigger id="analysis-mode">
                <SelectValue placeholder="Select mode" />
              </SelectTrigger>
              <SelectContent>
                {MODES.map((m) => (
                  <SelectItem key={m.value} value={m.value}>
                    {m.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {mode === "qa" && (
            <div className="space-y-2">
              <Label htmlFor="question">Question</Label>
              <Textarea
                id="question"
                placeholder="What would you like to know about this document?"
                value={question}
                onChange={(e) => setQuestion(e.target.value)}
                rows={3}
              />
            </div>
          )}

          {error && (
            <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">
              {error}
            </div>
          )}
        </CardContent>
        <CardFooter className="flex items-center justify-between">
          <div className="text-sm text-muted-foreground">
            Cost: <span className="font-medium">{creditCost} credits</span>
            {" / "}
            Remaining:{" "}
            <span className="font-medium">
              {creditsLoading ? "..." : credits}
            </span>
          </div>
          <Button
            onClick={handleAnalyze}
            disabled={!fileContent.trim() || analyzing || credits < creditCost}
          >
            {analyzing ? "Analyzing..." : "Analyze"}
          </Button>
        </CardFooter>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Results</CardTitle>
          <CardDescription>
            {tokensUsed !== null
              ? `Analysis complete - ${tokensUsed.toLocaleString()} tokens used`
              : "Analysis results will appear here."}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="min-h-[200px] whitespace-pre-wrap rounded-md border border-border bg-muted/50 p-4 text-sm">
            {analyzing && (
              <span className="text-muted-foreground">Analyzing document...</span>
            )}
            {result || (!analyzing && (
              <span className="text-muted-foreground">
                Upload a document and run analysis to see results.
              </span>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
