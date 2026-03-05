import { useState, useEffect } from "react";
import { X } from "lucide-react";

const navLinks = [
  { href: "/", label: "Home" },
  { href: "/pricing", label: "Pricing" },
  { href: "/blog", label: "Blog" },
  { href: "/about", label: "About" },
];

export function MobileNav() {
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const handler = () => setIsOpen(true);
    document.getElementById("mobile-menu-toggle")?.addEventListener("click", handler);
    return () => document.getElementById("mobile-menu-toggle")?.removeEventListener("click", handler);
  }, []);

  if (!isOpen) return null;

  const close = () => setIsOpen(false);

  return (
    <>
      <div className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm" onClick={close} />
      <div className="fixed inset-y-0 right-0 z-50 w-72 bg-background border-l border-border shadow-xl">
        <div className="flex items-center justify-between p-4 border-b border-border">
          <span className="font-semibold text-lg">Menu</span>
          <button onClick={close} className="inline-flex items-center justify-center h-9 w-9 rounded-md hover:bg-accent transition-colors">
            <X className="h-5 w-5" />
          </button>
        </div>
        <nav className="flex flex-col p-4 gap-1">
          {navLinks.map((link) => (
            <a key={link.href} href={link.href} onClick={close} className="flex items-center px-3 py-2.5 rounded-md text-sm font-medium text-foreground hover:bg-muted transition-colors">
              {link.label}
            </a>
          ))}
        </nav>
        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-border space-y-2">
          <a href="/auth/login" onClick={close} className="block w-full text-center px-4 py-2 rounded-md text-sm font-medium border border-border hover:bg-muted transition-colors">Login</a>
          <a href="/auth/register" onClick={close} className="block w-full text-center px-4 py-2 rounded-md text-sm font-medium bg-primary text-primary-foreground hover:bg-primary/90 transition-colors">Get Started</a>
        </div>
      </div>
    </>
  );
}
