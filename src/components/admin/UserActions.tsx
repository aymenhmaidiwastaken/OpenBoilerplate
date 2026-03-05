import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";

interface User {
  id: string;
  name?: string;
  email: string;
  role: "user" | "admin";
  banned?: boolean;
}

interface UserActionsProps {
  user: User;
  onRefresh: () => void;
}

export function UserActions({ user, onRefresh }: UserActionsProps) {
  async function handleRoleChange(role: "user" | "admin") {
    try {
      const res = await fetch(`/api/admin/users`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: user.id, role }),
      });
      if (res.ok) onRefresh();
    } catch (err) {
      console.error("Failed to change role:", err);
    }
  }

  async function handleBanToggle() {
    try {
      const res = await fetch(`/api/admin/users`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: user.id, banned: !user.banned }),
      });
      if (res.ok) onRefresh();
    } catch (err) {
      console.error("Failed to toggle ban:", err);
    }
  }

  async function handleDelete() {
    if (!confirm(`Are you sure you want to delete ${user.email}?`)) return;
    try {
      const res = await fetch(`/api/admin/users`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: user.id }),
      });
      if (res.ok) onRefresh();
    } catch (err) {
      console.error("Failed to delete user:", err);
    }
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon">
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <circle cx="12" cy="12" r="1" />
            <circle cx="12" cy="5" r="1" />
            <circle cx="12" cy="19" r="1" />
          </svg>
          <span className="sr-only">Actions</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem
          onClick={() => window.location.href = `/admin/users/${user.id}`}
        >
          View Details
        </DropdownMenuItem>
        <DropdownMenuSub>
          <DropdownMenuSubTrigger>Change Role</DropdownMenuSubTrigger>
          <DropdownMenuSubContent>
            <DropdownMenuItem
              onClick={() => handleRoleChange("user")}
              disabled={user.role === "user"}
            >
              User
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => handleRoleChange("admin")}
              disabled={user.role === "admin"}
            >
              Admin
            </DropdownMenuItem>
          </DropdownMenuSubContent>
        </DropdownMenuSub>
        <DropdownMenuItem onClick={handleBanToggle}>
          {user.banned ? "Unban User" : "Ban User"}
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          className="text-destructive focus:text-destructive"
          onClick={handleDelete}
        >
          Delete User
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
