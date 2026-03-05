import { useState } from "react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";

export default function DeleteAccountSection() {
  const [confirmation, setConfirmation] = useState("");
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isConfirmed = confirmation === "DELETE";

  async function handleDelete(e: React.FormEvent) {
    e.preventDefault();
    if (!isConfirmed) return;

    setDeleting(true);
    setError(null);

    try {
      const res = await fetch("/api/auth/delete-account", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to delete account");
      }

      window.location.href = "/";
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
      setDeleting(false);
    }
  }

  return (
    <Card className="border-destructive/50">
      <CardHeader>
        <CardTitle className="text-destructive">Danger Zone</CardTitle>
        <CardDescription>
          Permanently delete your account and all associated data. This action cannot be undone.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleDelete} className="space-y-4 max-w-md">
          <div className="space-y-2">
            <Label htmlFor="delete-confirmation">
              Type <span className="font-mono font-bold">DELETE</span> to confirm
            </Label>
            <Input
              id="delete-confirmation"
              value={confirmation}
              onChange={(e) => setConfirmation(e.target.value)}
              placeholder="Type DELETE to confirm"
              autoComplete="off"
            />
          </div>

          {error && (
            <p className="text-sm text-destructive">{error}</p>
          )}

          <Button
            type="submit"
            variant="destructive"
            disabled={!isConfirmed || deleting}
          >
            {deleting ? "Deleting account..." : "Delete my account"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
