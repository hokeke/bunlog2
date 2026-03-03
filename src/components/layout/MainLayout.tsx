"use client";

import { useState, useEffect } from "react";
import { Header } from "./Header";
import { Sidebar } from "./Sidebar";
import { MobileNav } from "./MobileNav";
import { AuthGuard } from "@/components/auth/AuthGuard";
import { useBirds } from "@/hooks/useBirds";
import { Bird } from "@/types/database";

export function MainLayout({ children }: { children: React.ReactNode }) {
  const { birds } = useBirds();
  const [selectedBird, setSelectedBird] = useState<Bird | null>(null);

  useEffect(() => {
    if (birds.length > 0 && !selectedBird) {
      setSelectedBird(birds[0]);
    }
  }, [birds, selectedBird]);

  return (
    <AuthGuard>
      <div className="min-h-screen bg-background">
        <Header selectedBird={selectedBird} onSelectBird={setSelectedBird} />
        <div className="flex">
          <Sidebar />
          <main className="flex-1 p-4 pb-20 md:pb-4">{children}</main>
        </div>
        <MobileNav />
      </div>
    </AuthGuard>
  );
}
