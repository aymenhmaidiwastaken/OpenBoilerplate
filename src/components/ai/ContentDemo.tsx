import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";

const SAMPLE_RESPONSES = [
  "In today's fast-paced digital landscape, content is king — but creating it shouldn't feel like a full-time job. With AI-powered content generation, you can transform a simple prompt into a polished blog post, social media caption, or marketing email in seconds. Whether you're a solopreneur juggling multiple roles or a marketing team scaling output, AI helps you maintain quality while dramatically reducing production time. The result? More content, more engagement, and more time to focus on strategy.",
  "Struggling to keep up with your content calendar? You're not alone. Studies show that 60% of marketers create at least one piece of content daily — and the demand is only growing. AI content generation bridges the gap between ambition and execution. Simply describe your topic, choose a tone, and let the AI craft compelling copy that resonates with your audience. From SEO-optimized blog posts to high-converting product descriptions, the possibilities are endless.",
  "Great marketing starts with great copy, but writer's block doesn't care about your deadlines. That's where AI steps in. Our content generator analyzes thousands of high-performing examples to produce fresh, original text tailored to your needs. Need a professional LinkedIn article? A witty Instagram caption? A persuasive landing page? Just describe what you need, and watch as AI delivers polished, publication-ready content in moments.",
];

export default function ContentDemo() {
  const [prompt, setPrompt] = useState("");
  const [output, setOutput] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [isDone, setIsDone] = useState(false);
  const timeoutRef = useRef<ReturnType<typeof setTimeout>[]>([]);

  useEffect(() => {
    return () => {
      timeoutRef.current.forEach(clearTimeout);
    };
  }, []);

  const handleGenerate = () => {
    if (!prompt.trim() || isGenerating) return;

    timeoutRef.current.forEach(clearTimeout);
    timeoutRef.current = [];
    setOutput("");
    setIsGenerating(true);
    setIsDone(false);

    const response =
      SAMPLE_RESPONSES[Math.floor(Math.random() * SAMPLE_RESPONSES.length)];

    for (let i = 0; i < response.length; i++) {
      const id = setTimeout(() => {
        setOutput((prev) => prev + response[i]);
        if (i === response.length - 1) {
          setIsGenerating(false);
          setIsDone(true);
        }
      }, 20 * (i + 1));
      timeoutRef.current.push(id);
    }
  };

  return (
    <div className="max-w-2xl mx-auto mt-10">
      <div className="rounded-xl border border-border bg-card p-6 shadow-lg">
        <p className="text-sm font-medium text-muted-foreground mb-3">
          Try it out — describe the content you need
        </p>
        <textarea
          className="w-full rounded-lg border border-border bg-background px-4 py-3 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-violet-500/50 resize-none"
          rows={3}
          placeholder="e.g. Write a blog intro about the benefits of AI in marketing..."
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          disabled={isGenerating}
        />
        <Button
          onClick={handleGenerate}
          disabled={!prompt.trim() || isGenerating}
          className="mt-3 w-full bg-gradient-to-r from-violet-500 to-purple-500 text-white hover:opacity-90"
        >
          {isGenerating ? "Generating..." : "Generate Content"}
        </Button>

        {(output || isGenerating) && (
          <div className="mt-4 rounded-lg bg-muted/50 p-4 text-sm leading-relaxed min-h-[80px]">
            {output}
            {isGenerating && (
              <span className="inline-block w-0.5 h-4 bg-violet-500 animate-pulse ml-0.5 align-middle" />
            )}
          </div>
        )}

        {isDone && (
          <div className="mt-4 text-center">
            <a
              href="/auth/register"
              className="text-sm font-medium text-violet-600 dark:text-violet-400 hover:underline"
            >
              Sign up for the full experience &rarr;
            </a>
          </div>
        )}
      </div>
    </div>
  );
}
