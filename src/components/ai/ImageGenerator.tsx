import { useState } from "react";
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

const SIZES = [
  { value: "256x256", label: "256 x 256" },
  { value: "512x512", label: "512 x 512" },
  { value: "1024x1024", label: "1024 x 1024" },
] as const;

interface GeneratedImage {
  url: string;
  prompt: string;
  size: string;
  createdAt: string;
}

export default function ImageGenerator() {
  const { credits, loading: creditsLoading, refresh } = useCredits();
  const [prompt, setPrompt] = useState("");
  const [size, setSize] = useState<string>("512x512");
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState("");
  const [images, setImages] = useState<GeneratedImage[]>([]);

  const creditCost = CREDIT_COSTS["ai-image"];

  async function handleGenerate() {
    if (!prompt.trim() || generating) return;

    setGenerating(true);
    setError("");

    try {
      const response = await fetch("/api/ai/generate-image", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt, size }),
      });

      if (!response.ok) {
        const err = await response.json().catch(() => ({ error: "Image generation failed" }));
        setError(err.error || "Image generation failed");
        return;
      }

      const data = await response.json();
      const newImages: GeneratedImage[] = (data.urls || []).map((url: string) => ({
        url,
        prompt,
        size,
        createdAt: new Date().toISOString(),
      }));

      setImages((prev) => [...newImages, ...prev]);
      refresh();
    } catch (err: any) {
      setError(err.message || "Image generation failed");
    } finally {
      setGenerating(false);
    }
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Generate Image</CardTitle>
          <CardDescription>
            Describe the image you want to create and select a size.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="image-prompt">Prompt</Label>
            <Textarea
              id="image-prompt"
              placeholder="A serene mountain landscape at sunset with vibrant colors..."
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              rows={4}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="image-size">Size</Label>
            <Select value={size} onValueChange={setSize}>
              <SelectTrigger id="image-size">
                <SelectValue placeholder="Select size" />
              </SelectTrigger>
              <SelectContent>
                {SIZES.map((s) => (
                  <SelectItem key={s.value} value={s.value}>
                    {s.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

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
            onClick={handleGenerate}
            disabled={!prompt.trim() || generating || credits < creditCost}
          >
            {generating ? (
              <>
                <svg
                  className="mr-2 h-4 w-4 animate-spin"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                  />
                </svg>
                Generating...
              </>
            ) : (
              "Generate Image"
            )}
          </Button>
        </CardFooter>
      </Card>

      {images.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Generated Images</CardTitle>
            <CardDescription>
              {images.length} image{images.length !== 1 ? "s" : ""} generated
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {images.map((img, i) => (
                <div
                  key={`${img.createdAt}-${i}`}
                  className="group relative overflow-hidden rounded-lg border border-border"
                >
                  <img
                    src={img.url}
                    alt={img.prompt}
                    className="aspect-square w-full object-cover"
                    loading="lazy"
                  />
                  <div className="absolute inset-0 flex items-end bg-gradient-to-t from-black/60 to-transparent opacity-0 transition-opacity group-hover:opacity-100">
                    <div className="w-full p-3">
                      <p className="line-clamp-2 text-xs text-white">{img.prompt}</p>
                      <p className="mt-1 text-xs text-white/70">{img.size}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
