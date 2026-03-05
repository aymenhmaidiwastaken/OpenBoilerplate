import { useState, useEffect } from "react";

interface Heading {
  depth: number;
  text: string;
  slug: string;
}

interface Props {
  headings: Heading[];
}

export default function TableOfContents({ headings }: Props) {
  const [activeSlug, setActiveSlug] = useState<string>("");

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setActiveSlug(entry.target.id);
          }
        }
      },
      {
        rootMargin: "-80px 0px -70% 0px",
        threshold: 0,
      }
    );

    const headingElements = headings
      .map((h) => document.getElementById(h.slug))
      .filter(Boolean) as HTMLElement[];

    headingElements.forEach((el) => observer.observe(el));

    return () => observer.disconnect();
  }, [headings]);

  if (headings.length === 0) return null;

  return (
    <nav aria-label="Table of contents" className="space-y-1">
      <h4 className="mb-3 text-sm font-semibold text-foreground">
        On this page
      </h4>
      <ul className="space-y-1">
        {headings.map((heading) => (
          <li
            key={heading.slug}
            style={{ paddingLeft: `${(heading.depth - 2) * 12}px` }}
          >
            <a
              href={`#${heading.slug}`}
              className={`block rounded-md px-2 py-1 text-sm transition-colors ${
                activeSlug === heading.slug
                  ? "bg-primary/10 font-medium text-primary"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {heading.text}
            </a>
          </li>
        ))}
      </ul>
    </nav>
  );
}
