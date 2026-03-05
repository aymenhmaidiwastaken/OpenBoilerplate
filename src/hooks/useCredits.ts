import { useState, useEffect } from "react";

export function useCredits() {
  const [credits, setCredits] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/credits")
      .then((r) => (r.ok ? r.json() : { credits: 0 }))
      .then((data) => setCredits(data.credits))
      .catch(() => setCredits(0))
      .finally(() => setLoading(false));
  }, []);

  function refresh() {
    fetch("/api/credits")
      .then((r) => (r.ok ? r.json() : { credits: 0 }))
      .then((data) => setCredits(data.credits))
      .catch(() => {});
  }

  return { credits, loading, refresh };
}
