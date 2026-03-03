"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

const navItems = [
  { href: "/", label: "ホーム", icon: "📊" },
  { href: "/records/new", label: "記録", icon: "✏️" },
  { href: "/birds", label: "文鳥", icon: "🐦" },
  { href: "/advice", label: "相談", icon: "💡" },
];

export function MobileNav() {
  const pathname = usePathname();

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 border-t bg-card">
      <div className="flex justify-around py-2">
        {navItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "flex flex-col items-center gap-1 px-3 py-2 text-xs",
              pathname === item.href
                ? "text-primary"
                : "text-muted-foreground"
            )}
          >
            <span className="text-xl">{item.icon}</span>
            {item.label}
          </Link>
        ))}
      </div>
    </nav>
  );
}
