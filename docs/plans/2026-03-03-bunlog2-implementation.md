# Bunlog2 Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** 文鳥の健康管理アプリを Next.js + Supabase + Gemini API で構築し、GitHub Pages にデプロイする。

**Architecture:** クライアントサイドのみの静的アプリ。Supabase で認証・データ保存、Gemini API で健康アドバイス生成。GitHub Actions で自動デプロイ。

**Tech Stack:** Next.js 14 (Static Export), shadcn/ui, Tailwind CSS, Recharts, Zustand, TanStack Query, React Hook Form, Zod, Supabase, Gemini API

---

## Task 1: プロジェクト初期化

**Files:**
- Create: `package.json`
- Create: `next.config.ts`
- Create: `tailwind.config.ts`
- Create: `tsconfig.json`
- Create: `src/app/layout.tsx`
- Create: `src/app/page.tsx`

**Step 1: Next.js プロジェクトを作成**

```bash
npx create-next-app@latest . --typescript --tailwind --eslint --app --src-dir --import-alias "@/*" --use-npm
```

Expected: プロジェクトファイルが生成される

**Step 2: next.config.ts を Static Export 用に設定**

```typescript
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "export",
  basePath: "/bunlog2",
  images: {
    unoptimized: true,
  },
};

export default nextConfig;
```

**Step 3: 開発サーバーを起動して確認**

Run: `npm run dev`
Expected: http://localhost:3000 でページが表示される

**Step 4: コミット**

```bash
git add .
git commit -m "chore: initialize Next.js project with static export"
```

---

## Task 2: shadcn/ui セットアップ

**Files:**
- Create: `components.json`
- Create: `src/lib/utils.ts`
- Create: `src/components/ui/button.tsx`
- Create: `src/components/ui/card.tsx`
- Create: `src/components/ui/input.tsx`
- Create: `src/components/ui/label.tsx`
- Create: `src/components/ui/toast.tsx`
- Create: `src/components/ui/toaster.tsx`

**Step 1: shadcn/ui を初期化**

```bash
npx shadcn@latest init -d
```

Expected: `components.json` と `src/lib/utils.ts` が生成される

**Step 2: 必要なコンポーネントを追加**

```bash
npx shadcn@latest add button card input label toast dropdown-menu avatar form select tabs
```

Expected: `src/components/ui/` にコンポーネントが追加される

**Step 3: コミット**

```bash
git add .
git commit -m "chore: add shadcn/ui components"
```

---

## Task 3: 依存パッケージのインストール

**Files:**
- Modify: `package.json`

**Step 1: 状態管理・データフェッチ・フォームのパッケージをインストール**

```bash
npm install zustand @tanstack/react-query react-hook-form @hookform/resolvers zod
```

**Step 2: Supabase クライアントをインストール**

```bash
npm install @supabase/supabase-js
```

**Step 3: Gemini SDK をインストール**

```bash
npm install @google/generative-ai
```

**Step 4: グラフライブラリをインストール**

```bash
npm install recharts
```

**Step 5: 日付ライブラリをインストール**

```bash
npm install date-fns
```

**Step 6: コミット**

```bash
git add package.json package-lock.json
git commit -m "chore: add runtime dependencies"
```

---

## Task 4: 環境変数と Supabase クライアント設定

**Files:**
- Create: `.env.local.example`
- Create: `src/lib/supabase.ts`
- Modify: `.gitignore`

**Step 1: 環境変数のサンプルファイルを作成**

```bash
# .env.local.example
NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
NEXT_PUBLIC_GEMINI_API_KEY=your-gemini-api-key
```

**Step 2: Supabase クライアントを作成**

```typescript
// src/lib/supabase.ts
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
```

**Step 3: .gitignore に .env.local を追加確認**

Run: `grep ".env.local" .gitignore`
Expected: `.env.local` が含まれている（Next.js デフォルトで含まれる）

**Step 4: コミット**

```bash
git add .env.local.example src/lib/supabase.ts
git commit -m "chore: add Supabase client configuration"
```

---

## Task 5: 型定義とスキーマ

**Files:**
- Create: `src/types/database.ts`
- Create: `src/lib/schemas.ts`

**Step 1: データベースの型定義を作成**

```typescript
// src/types/database.ts
export type Bird = {
  id: string;
  user_id: string;
  name: string;
  birth_date: string | null;
  gender: "male" | "female" | "unknown";
  species: string | null;
  adopted_date: string | null;
  vet_name: string | null;
  vet_address: string | null;
  vet_phone: string | null;
  photo_url: string | null;
  created_at: string;
  updated_at: string;
};

export type Record = {
  id: string;
  bird_id: string;
  date: string;
  weight: number;
  food_amount: number;
  droppings_count: number;
  memo: string | null;
  created_at: string;
  updated_at: string;
};

export type Period = "1w" | "1m" | "3m";
```

**Step 2: Zod スキーマを作成**

```typescript
// src/lib/schemas.ts
import { z } from "zod";

export const birdSchema = z.object({
  name: z.string().min(1, "名前は必須です").max(50),
  birth_date: z.string().nullable(),
  gender: z.enum(["male", "female", "unknown"]),
  species: z.string().max(50).nullable(),
  adopted_date: z.string().nullable(),
  vet_name: z.string().max(100).nullable(),
  vet_address: z.string().max(200).nullable(),
  vet_phone: z.string().max(20).nullable(),
});

export const recordSchema = z.object({
  bird_id: z.string().uuid(),
  date: z.string(),
  weight: z.number().min(5, "5g以上").max(50, "50g以下"),
  food_amount: z.number().min(0, "0g以上").max(20, "20g以下"),
  droppings_count: z.number().int().min(0).max(100),
  memo: z.string().max(500).nullable(),
});

export type BirdFormData = z.infer<typeof birdSchema>;
export type RecordFormData = z.infer<typeof recordSchema>;
```

**Step 3: コミット**

```bash
git add src/types/database.ts src/lib/schemas.ts
git commit -m "feat: add type definitions and Zod schemas"
```

---

## Task 6: 認証ストア (Zustand)

**Files:**
- Create: `src/store/authStore.ts`

**Step 1: 認証ストアを作成**

```typescript
// src/store/authStore.ts
import { create } from "zustand";
import { User } from "@supabase/supabase-js";

type AuthState = {
  user: User | null;
  isLoading: boolean;
  setUser: (user: User | null) => void;
  setLoading: (loading: boolean) => void;
};

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isLoading: true,
  setUser: (user) => set({ user }),
  setLoading: (isLoading) => set({ isLoading }),
}));
```

**Step 2: コミット**

```bash
git add src/store/authStore.ts
git commit -m "feat: add Zustand auth store"
```

---

## Task 7: TanStack Query プロバイダー

**Files:**
- Create: `src/components/providers/QueryProvider.tsx`
- Modify: `src/app/layout.tsx`

**Step 1: QueryProvider を作成**

```typescript
// src/components/providers/QueryProvider.tsx
"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useState, ReactNode } from "react";

export function QueryProvider({ children }: { children: ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 60 * 1000,
            retry: 3,
          },
        },
      })
  );

  return (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
}
```

**Step 2: layout.tsx に QueryProvider を追加**

```typescript
// src/app/layout.tsx
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { QueryProvider } from "@/components/providers/QueryProvider";
import { Toaster } from "@/components/ui/toaster";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Bunlog2 - 文鳥の健康管理",
  description: "文鳥の体重・食事・健康状態を記録・管理するアプリ",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ja">
      <body className={inter.className}>
        <QueryProvider>
          {children}
          <Toaster />
        </QueryProvider>
      </body>
    </html>
  );
}
```

**Step 3: コミット**

```bash
git add src/components/providers/QueryProvider.tsx src/app/layout.tsx
git commit -m "feat: add TanStack Query provider"
```

---

## Task 8: 認証フック

**Files:**
- Create: `src/hooks/useAuth.ts`

**Step 1: useAuth フックを作成**

```typescript
// src/hooks/useAuth.ts
"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { useAuthStore } from "@/store/authStore";

export function useAuth() {
  const { user, isLoading, setUser, setLoading } = useAuthStore();
  const router = useRouter();

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setUser(session?.user ?? null);
        setLoading(false);
      }
    );

    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, [setUser, setLoading]);

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    if (error) throw error;
    router.push("/");
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    router.push("/login");
  };

  return { user, isLoading, signIn, signOut };
}
```

**Step 2: コミット**

```bash
git add src/hooks/useAuth.ts
git commit -m "feat: add useAuth hook"
```

---

## Task 9: ログインページ

**Files:**
- Create: `src/app/login/page.tsx`

**Step 1: ログインページを作成**

```typescript
// src/app/login/page.tsx
"use client";

import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { signIn } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsSubmitting(true);

    try {
      await signIn(email, password);
    } catch (err) {
      setError("メールアドレスまたはパスワードが正しくありません");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-2xl text-center">Bunlog2</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">メールアドレス</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">パスワード</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
            {error && <p className="text-sm text-destructive">{error}</p>}
            <Button type="submit" className="w-full" disabled={isSubmitting}>
              {isSubmitting ? "ログイン中..." : "ログイン"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
```

**Step 2: コミット**

```bash
git add src/app/login/page.tsx
git commit -m "feat: add login page"
```

---

## Task 10: 認証ガード

**Files:**
- Create: `src/components/auth/AuthGuard.tsx`

**Step 1: AuthGuard コンポーネントを作成**

```typescript
// src/components/auth/AuthGuard.tsx
"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";

export function AuthGuard({ children }: { children: React.ReactNode }) {
  const { user, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !user) {
      router.push("/login");
    }
  }, [user, isLoading, router]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return <>{children}</>;
}
```

**Step 2: コミット**

```bash
git add src/components/auth/AuthGuard.tsx
git commit -m "feat: add AuthGuard component"
```

---

## Task 11: 文鳥データフック

**Files:**
- Create: `src/hooks/useBirds.ts`

**Step 1: useBirds フックを作成**

```typescript
// src/hooks/useBirds.ts
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { Bird } from "@/types/database";
import { BirdFormData } from "@/lib/schemas";
import { useAuthStore } from "@/store/authStore";

export function useBirds() {
  const queryClient = useQueryClient();
  const { user } = useAuthStore();

  const birdsQuery = useQuery({
    queryKey: ["birds"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("birds")
        .select("*")
        .order("created_at", { ascending: true });
      if (error) throw error;
      return data as Bird[];
    },
    enabled: !!user,
  });

  const createBird = useMutation({
    mutationFn: async (data: BirdFormData) => {
      const { data: bird, error } = await supabase
        .from("birds")
        .insert({ ...data, user_id: user!.id })
        .select()
        .single();
      if (error) throw error;
      return bird as Bird;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["birds"] });
    },
  });

  const updateBird = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: BirdFormData }) => {
      const { data: bird, error } = await supabase
        .from("birds")
        .update({ ...data, updated_at: new Date().toISOString() })
        .eq("id", id)
        .select()
        .single();
      if (error) throw error;
      return bird as Bird;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["birds"] });
    },
  });

  const deleteBird = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("birds").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["birds"] });
    },
  });

  return {
    birds: birdsQuery.data ?? [],
    isLoading: birdsQuery.isLoading,
    error: birdsQuery.error,
    createBird,
    updateBird,
    deleteBird,
  };
}
```

**Step 2: コミット**

```bash
git add src/hooks/useBirds.ts
git commit -m "feat: add useBirds hook"
```

---

## Task 12: 記録データフック

**Files:**
- Create: `src/hooks/useRecords.ts`

**Step 1: useRecords フックを作成**

```typescript
// src/hooks/useRecords.ts
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { Record, Period } from "@/types/database";
import { RecordFormData } from "@/lib/schemas";
import { subDays, subMonths, format } from "date-fns";

function getStartDate(period: Period): string {
  const now = new Date();
  switch (period) {
    case "1w":
      return format(subDays(now, 7), "yyyy-MM-dd");
    case "1m":
      return format(subMonths(now, 1), "yyyy-MM-dd");
    case "3m":
      return format(subMonths(now, 3), "yyyy-MM-dd");
  }
}

export function useRecords(birdId: string | null, period: Period = "1w") {
  const queryClient = useQueryClient();

  const recordsQuery = useQuery({
    queryKey: ["records", birdId, period],
    queryFn: async () => {
      const startDate = getStartDate(period);
      const { data, error } = await supabase
        .from("records")
        .select("*")
        .eq("bird_id", birdId)
        .gte("date", startDate)
        .order("date", { ascending: true });
      if (error) throw error;
      return data as Record[];
    },
    enabled: !!birdId,
  });

  const createRecord = useMutation({
    mutationFn: async (data: RecordFormData) => {
      const { data: record, error } = await supabase
        .from("records")
        .insert(data)
        .select()
        .single();
      if (error) throw error;
      return record as Record;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["records"] });
    },
  });

  const updateRecord = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<RecordFormData> }) => {
      const { data: record, error } = await supabase
        .from("records")
        .update({ ...data, updated_at: new Date().toISOString() })
        .eq("id", id)
        .select()
        .single();
      if (error) throw error;
      return record as Record;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["records"] });
    },
  });

  const deleteRecord = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("records").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["records"] });
    },
  });

  return {
    records: recordsQuery.data ?? [],
    isLoading: recordsQuery.isLoading,
    error: recordsQuery.error,
    createRecord,
    updateRecord,
    deleteRecord,
  };
}
```

**Step 2: コミット**

```bash
git add src/hooks/useRecords.ts
git commit -m "feat: add useRecords hook"
```

---

## Task 13: レイアウトコンポーネント

**Files:**
- Create: `src/components/layout/Header.tsx`
- Create: `src/components/layout/Sidebar.tsx`
- Create: `src/components/layout/MobileNav.tsx`
- Create: `src/components/layout/MainLayout.tsx`

**Step 1: Header を作成**

```typescript
// src/components/layout/Header.tsx
"use client";

import { useAuth } from "@/hooks/useAuth";
import { useBirds } from "@/hooks/useBirds";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Bird } from "@/types/database";

type HeaderProps = {
  selectedBird: Bird | null;
  onSelectBird: (bird: Bird) => void;
};

export function Header({ selectedBird, onSelectBird }: HeaderProps) {
  const { signOut } = useAuth();
  const { birds } = useBirds();

  return (
    <header className="border-b bg-card">
      <div className="flex h-16 items-center px-4 gap-4">
        <h1 className="text-xl font-bold">Bunlog2</h1>
        
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" className="ml-auto">
              <Avatar className="h-6 w-6 mr-2">
                <AvatarImage src={selectedBird?.photo_url ?? undefined} />
                <AvatarFallback>
                  {selectedBird?.name.charAt(0) ?? "?"}
                </AvatarFallback>
              </Avatar>
              {selectedBird?.name ?? "文鳥を選択"}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            {birds.map((bird) => (
              <DropdownMenuItem
                key={bird.id}
                onClick={() => onSelectBird(bird)}
              >
                {bird.name}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>

        <Button variant="ghost" onClick={signOut}>
          ログアウト
        </Button>
      </div>
    </header>
  );
}
```

**Step 2: Sidebar を作成**

```typescript
// src/components/layout/Sidebar.tsx
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

const navItems = [
  { href: "/", label: "ダッシュボード", icon: "📊" },
  { href: "/records/new", label: "記録する", icon: "✏️" },
  { href: "/birds", label: "文鳥管理", icon: "🐦" },
  { href: "/advice", label: "健康アドバイス", icon: "💡" },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="hidden md:flex w-64 flex-col border-r bg-card">
      <nav className="flex-1 p-4 space-y-2">
        {navItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors",
              pathname === item.href
                ? "bg-primary text-primary-foreground"
                : "hover:bg-muted"
            )}
          >
            <span>{item.icon}</span>
            {item.label}
          </Link>
        ))}
      </nav>
    </aside>
  );
}
```

**Step 3: MobileNav を作成**

```typescript
// src/components/layout/MobileNav.tsx
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
```

**Step 4: MainLayout を作成**

```typescript
// src/components/layout/MainLayout.tsx
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
```

**Step 5: コミット**

```bash
git add src/components/layout/
git commit -m "feat: add layout components"
```

---

## Task 14: ダッシュボードのグラフコンポーネント

**Files:**
- Create: `src/components/dashboard/WeightChart.tsx`
- Create: `src/components/dashboard/FoodChart.tsx`
- Create: `src/components/dashboard/DroppingsChart.tsx`
- Create: `src/components/dashboard/PeriodSelector.tsx`
- Create: `src/components/dashboard/StatsCard.tsx`

**Step 1: WeightChart を作成**

```typescript
// src/components/dashboard/WeightChart.tsx
"use client";

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Record } from "@/types/database";
import { format, parseISO } from "date-fns";
import { ja } from "date-fns/locale";

type WeightChartProps = {
  records: Record[];
};

export function WeightChart({ records }: WeightChartProps) {
  const data = records.map((r) => ({
    date: format(parseISO(r.date), "M/d", { locale: ja }),
    weight: r.weight,
  }));

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">体重 (g)</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-[200px]">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" fontSize={12} />
              <YAxis domain={["auto", "auto"]} fontSize={12} />
              <Tooltip />
              <Line
                type="monotone"
                dataKey="weight"
                stroke="hsl(var(--primary))"
                strokeWidth={2}
                dot={{ r: 4 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
```

**Step 2: FoodChart を作成**

```typescript
// src/components/dashboard/FoodChart.tsx
"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Record } from "@/types/database";
import { format, parseISO } from "date-fns";
import { ja } from "date-fns/locale";

type FoodChartProps = {
  records: Record[];
};

export function FoodChart({ records }: FoodChartProps) {
  const data = records.map((r) => ({
    date: format(parseISO(r.date), "M/d", { locale: ja }),
    food: r.food_amount,
  }));

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">ご飯の量 (g)</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-[200px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" fontSize={12} />
              <YAxis domain={[0, "auto"]} fontSize={12} />
              <Tooltip />
              <Bar dataKey="food" fill="hsl(var(--primary))" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
```

**Step 3: DroppingsChart を作成**

```typescript
// src/components/dashboard/DroppingsChart.tsx
"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Record } from "@/types/database";
import { format, parseISO } from "date-fns";
import { ja } from "date-fns/locale";

type DroppingsChartProps = {
  records: Record[];
};

export function DroppingsChart({ records }: DroppingsChartProps) {
  const data = records.map((r) => ({
    date: format(parseISO(r.date), "M/d", { locale: ja }),
    droppings: r.droppings_count,
  }));

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">うんちの数</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-[200px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" fontSize={12} />
              <YAxis domain={[0, "auto"]} fontSize={12} />
              <Tooltip />
              <Bar dataKey="droppings" fill="hsl(var(--chart-2))" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
```

**Step 4: PeriodSelector を作成**

```typescript
// src/components/dashboard/PeriodSelector.tsx
"use client";

import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Period } from "@/types/database";

type PeriodSelectorProps = {
  value: Period;
  onChange: (period: Period) => void;
};

export function PeriodSelector({ value, onChange }: PeriodSelectorProps) {
  return (
    <Tabs value={value} onValueChange={(v) => onChange(v as Period)}>
      <TabsList>
        <TabsTrigger value="1w">1週間</TabsTrigger>
        <TabsTrigger value="1m">1ヶ月</TabsTrigger>
        <TabsTrigger value="3m">3ヶ月</TabsTrigger>
      </TabsList>
    </Tabs>
  );
}
```

**Step 5: StatsCard を作成**

```typescript
// src/components/dashboard/StatsCard.tsx
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

type StatsCardProps = {
  title: string;
  value: string | number;
  unit?: string;
  description?: string;
};

export function StatsCard({ title, value, unit, description }: StatsCardProps) {
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">
          {value}
          {unit && <span className="text-sm font-normal ml-1">{unit}</span>}
        </div>
        {description && (
          <p className="text-xs text-muted-foreground mt-1">{description}</p>
        )}
      </CardContent>
    </Card>
  );
}
```

**Step 6: コミット**

```bash
git add src/components/dashboard/
git commit -m "feat: add dashboard chart components"
```

---

## Task 15: ダッシュボードページ

**Files:**
- Modify: `src/app/page.tsx`

**Step 1: ダッシュボードページを実装**

```typescript
// src/app/page.tsx
"use client";

import { useState, useEffect } from "react";
import { MainLayout } from "@/components/layout/MainLayout";
import { WeightChart } from "@/components/dashboard/WeightChart";
import { FoodChart } from "@/components/dashboard/FoodChart";
import { DroppingsChart } from "@/components/dashboard/DroppingsChart";
import { PeriodSelector } from "@/components/dashboard/PeriodSelector";
import { StatsCard } from "@/components/dashboard/StatsCard";
import { useBirds } from "@/hooks/useBirds";
import { useRecords } from "@/hooks/useRecords";
import { Period, Bird } from "@/types/database";

export default function DashboardPage() {
  const { birds, isLoading: birdsLoading } = useBirds();
  const [selectedBird, setSelectedBird] = useState<Bird | null>(null);
  const [period, setPeriod] = useState<Period>("1w");
  const { records, isLoading: recordsLoading } = useRecords(
    selectedBird?.id ?? null,
    period
  );

  useEffect(() => {
    if (birds.length > 0 && !selectedBird) {
      setSelectedBird(birds[0]);
    }
  }, [birds, selectedBird]);

  const latestRecord = records[records.length - 1];
  const avgWeight =
    records.length > 0
      ? (records.reduce((sum, r) => sum + r.weight, 0) / records.length).toFixed(1)
      : "-";

  if (birdsLoading) {
    return (
      <MainLayout>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
        </div>
      </MainLayout>
    );
  }

  if (birds.length === 0) {
    return (
      <MainLayout>
        <div className="text-center py-12">
          <p className="text-muted-foreground mb-4">
            まだ文鳥が登録されていません
          </p>
          <a href="/birds/new" className="text-primary hover:underline">
            文鳥を登録する
          </a>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold">{selectedBird?.name}</h2>
          <PeriodSelector value={period} onChange={setPeriod} />
        </div>

        <div className="grid gap-4 grid-cols-2 md:grid-cols-4">
          <StatsCard
            title="最新の体重"
            value={latestRecord?.weight ?? "-"}
            unit="g"
          />
          <StatsCard
            title="平均体重"
            value={avgWeight}
            unit="g"
          />
          <StatsCard
            title="最新のご飯"
            value={latestRecord?.food_amount ?? "-"}
            unit="g"
          />
          <StatsCard
            title="最新のうんち"
            value={latestRecord?.droppings_count ?? "-"}
            unit="回"
          />
        </div>

        {recordsLoading ? (
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
          </div>
        ) : records.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground">この期間の記録がありません</p>
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            <WeightChart records={records} />
            <FoodChart records={records} />
            <DroppingsChart records={records} />
          </div>
        )}
      </div>
    </MainLayout>
  );
}
```

**Step 2: コミット**

```bash
git add src/app/page.tsx
git commit -m "feat: add dashboard page"
```

---

## Task 16: 文鳥フォームコンポーネント

**Files:**
- Create: `src/components/birds/BirdForm.tsx`

**Step 1: BirdForm を作成**

```typescript
// src/components/birds/BirdForm.tsx
"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { birdSchema, BirdFormData } from "@/lib/schemas";
import { Bird } from "@/types/database";

type BirdFormProps = {
  bird?: Bird;
  onSubmit: (data: BirdFormData) => Promise<void>;
  isSubmitting: boolean;
};

const speciesOptions = [
  "桜文鳥",
  "白文鳥",
  "シナモン文鳥",
  "シルバー文鳥",
  "クリーム文鳥",
  "その他",
];

export function BirdForm({ bird, onSubmit, isSubmitting }: BirdFormProps) {
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<BirdFormData>({
    resolver: zodResolver(birdSchema),
    defaultValues: {
      name: bird?.name ?? "",
      birth_date: bird?.birth_date ?? null,
      gender: bird?.gender ?? "unknown",
      species: bird?.species ?? null,
      adopted_date: bird?.adopted_date ?? null,
      vet_name: bird?.vet_name ?? null,
      vet_address: bird?.vet_address ?? null,
      vet_phone: bird?.vet_phone ?? null,
    },
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle>{bird ? "文鳥を編集" : "文鳥を登録"}</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">名前 *</Label>
            <Input id="name" {...register("name")} />
            {errors.name && (
              <p className="text-sm text-destructive">{errors.name.message}</p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="gender">性別</Label>
              <Select
                value={watch("gender")}
                onValueChange={(v) => setValue("gender", v as "male" | "female" | "unknown")}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="male">オス</SelectItem>
                  <SelectItem value="female">メス</SelectItem>
                  <SelectItem value="unknown">不明</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="species">品種</Label>
              <Select
                value={watch("species") ?? ""}
                onValueChange={(v) => setValue("species", v || null)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="選択" />
                </SelectTrigger>
                <SelectContent>
                  {speciesOptions.map((s) => (
                    <SelectItem key={s} value={s}>
                      {s}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="birth_date">生年月日</Label>
              <Input
                id="birth_date"
                type="date"
                {...register("birth_date")}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="adopted_date">お迎え日</Label>
              <Input
                id="adopted_date"
                type="date"
                {...register("adopted_date")}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="vet_name">かかりつけ医の名前</Label>
            <Input id="vet_name" {...register("vet_name")} />
          </div>

          <div className="space-y-2">
            <Label htmlFor="vet_address">かかりつけ医の住所</Label>
            <Input id="vet_address" {...register("vet_address")} />
          </div>

          <div className="space-y-2">
            <Label htmlFor="vet_phone">かかりつけ医の電話番号</Label>
            <Input id="vet_phone" type="tel" {...register("vet_phone")} />
          </div>

          <Button type="submit" className="w-full" disabled={isSubmitting}>
            {isSubmitting ? "保存中..." : "保存"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
```

**Step 2: コミット**

```bash
git add src/components/birds/BirdForm.tsx
git commit -m "feat: add BirdForm component"
```

---

## Task 17: 文鳥管理ページ

**Files:**
- Create: `src/app/birds/page.tsx`
- Create: `src/app/birds/new/page.tsx`
- Create: `src/app/birds/[id]/page.tsx`

**Step 1: 文鳥一覧ページを作成**

```typescript
// src/app/birds/page.tsx
"use client";

import Link from "next/link";
import { MainLayout } from "@/components/layout/MainLayout";
import { useBirds } from "@/hooks/useBirds";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export default function BirdsPage() {
  const { birds, isLoading } = useBirds();

  return (
    <MainLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold">文鳥管理</h2>
          <Button asChild>
            <Link href="/birds/new">新規登録</Link>
          </Button>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
          </div>
        ) : birds.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground mb-4">
              まだ文鳥が登録されていません
            </p>
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {birds.map((bird) => (
              <Link key={bird.id} href={`/birds/${bird.id}`}>
                <Card className="hover:bg-muted/50 transition-colors cursor-pointer">
                  <CardHeader className="flex flex-row items-center gap-4">
                    <Avatar className="h-12 w-12">
                      <AvatarImage src={bird.photo_url ?? undefined} />
                      <AvatarFallback>{bird.name.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <div>
                      <CardTitle className="text-lg">{bird.name}</CardTitle>
                      <p className="text-sm text-muted-foreground">
                        {bird.species ?? "品種未設定"}
                      </p>
                    </div>
                  </CardHeader>
                </Card>
              </Link>
            ))}
          </div>
        )}
      </div>
    </MainLayout>
  );
}
```

**Step 2: 新規登録ページを作成**

```typescript
// src/app/birds/new/page.tsx
"use client";

import { useRouter } from "next/navigation";
import { MainLayout } from "@/components/layout/MainLayout";
import { BirdForm } from "@/components/birds/BirdForm";
import { useBirds } from "@/hooks/useBirds";
import { useToast } from "@/hooks/use-toast";
import { BirdFormData } from "@/lib/schemas";

export default function NewBirdPage() {
  const router = useRouter();
  const { createBird } = useBirds();
  const { toast } = useToast();

  const handleSubmit = async (data: BirdFormData) => {
    try {
      await createBird.mutateAsync(data);
      toast({ title: "文鳥を登録しました" });
      router.push("/birds");
    } catch (error) {
      toast({
        title: "エラーが発生しました",
        variant: "destructive",
      });
    }
  };

  return (
    <MainLayout>
      <div className="max-w-md mx-auto">
        <BirdForm onSubmit={handleSubmit} isSubmitting={createBird.isPending} />
      </div>
    </MainLayout>
  );
}
```

**Step 3: 詳細・編集ページを作成**

```typescript
// src/app/birds/[id]/page.tsx
"use client";

import { useParams, useRouter } from "next/navigation";
import { MainLayout } from "@/components/layout/MainLayout";
import { BirdForm } from "@/components/birds/BirdForm";
import { useBirds } from "@/hooks/useBirds";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { BirdFormData } from "@/lib/schemas";

export default function BirdDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { birds, updateBird, deleteBird } = useBirds();
  const { toast } = useToast();

  const bird = birds.find((b) => b.id === params.id);

  const handleSubmit = async (data: BirdFormData) => {
    try {
      await updateBird.mutateAsync({ id: params.id as string, data });
      toast({ title: "文鳥情報を更新しました" });
      router.push("/birds");
    } catch (error) {
      toast({
        title: "エラーが発生しました",
        variant: "destructive",
      });
    }
  };

  const handleDelete = async () => {
    if (!confirm("この文鳥を削除しますか？記録も全て削除されます。")) {
      return;
    }
    try {
      await deleteBird.mutateAsync(params.id as string);
      toast({ title: "文鳥を削除しました" });
      router.push("/birds");
    } catch (error) {
      toast({
        title: "エラーが発生しました",
        variant: "destructive",
      });
    }
  };

  if (!bird) {
    return (
      <MainLayout>
        <div className="text-center py-12">
          <p className="text-muted-foreground">文鳥が見つかりません</p>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="max-w-md mx-auto space-y-4">
        <BirdForm
          bird={bird}
          onSubmit={handleSubmit}
          isSubmitting={updateBird.isPending}
        />
        <Button
          variant="destructive"
          className="w-full"
          onClick={handleDelete}
          disabled={deleteBird.isPending}
        >
          {deleteBird.isPending ? "削除中..." : "この文鳥を削除"}
        </Button>
      </div>
    </MainLayout>
  );
}
```

**Step 4: コミット**

```bash
git add src/app/birds/
git commit -m "feat: add bird management pages"
```

---

## Task 18: 記録フォームコンポーネント

**Files:**
- Create: `src/components/records/RecordForm.tsx`

**Step 1: RecordForm を作成**

```typescript
// src/components/records/RecordForm.tsx
"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { recordSchema, RecordFormData } from "@/lib/schemas";
import { Bird } from "@/types/database";
import { format } from "date-fns";

type RecordFormProps = {
  birds: Bird[];
  onSubmit: (data: RecordFormData) => Promise<void>;
  isSubmitting: boolean;
};

export function RecordForm({ birds, onSubmit, isSubmitting }: RecordFormProps) {
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<RecordFormData>({
    resolver: zodResolver(recordSchema),
    defaultValues: {
      bird_id: birds[0]?.id ?? "",
      date: format(new Date(), "yyyy-MM-dd"),
      weight: 25,
      food_amount: 5,
      droppings_count: 20,
      memo: null,
    },
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle>今日の記録</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="bird_id">文鳥</Label>
            <Select
              value={watch("bird_id")}
              onValueChange={(v) => setValue("bird_id", v)}
            >
              <SelectTrigger>
                <SelectValue placeholder="選択" />
              </SelectTrigger>
              <SelectContent>
                {birds.map((bird) => (
                  <SelectItem key={bird.id} value={bird.id}>
                    {bird.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="date">日付</Label>
            <Input id="date" type="date" {...register("date")} />
          </div>

          <div className="space-y-2">
            <Label htmlFor="weight">体重 (g)</Label>
            <Input
              id="weight"
              type="number"
              step="0.1"
              {...register("weight", { valueAsNumber: true })}
            />
            {errors.weight && (
              <p className="text-sm text-destructive">{errors.weight.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="food_amount">ご飯の量 (g)</Label>
            <Input
              id="food_amount"
              type="number"
              step="0.1"
              {...register("food_amount", { valueAsNumber: true })}
            />
            {errors.food_amount && (
              <p className="text-sm text-destructive">
                {errors.food_amount.message}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="droppings_count">うんちの数</Label>
            <Input
              id="droppings_count"
              type="number"
              {...register("droppings_count", { valueAsNumber: true })}
            />
            {errors.droppings_count && (
              <p className="text-sm text-destructive">
                {errors.droppings_count.message}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="memo">メモ</Label>
            <Textarea
              id="memo"
              placeholder="今日の様子など"
              {...register("memo")}
            />
          </div>

          <Button type="submit" className="w-full" disabled={isSubmitting}>
            {isSubmitting ? "保存中..." : "記録する"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
```

**Step 2: コミット**

```bash
git add src/components/records/RecordForm.tsx
git commit -m "feat: add RecordForm component"
```

---

## Task 19: 記録ページ

**Files:**
- Create: `src/app/records/new/page.tsx`

**Step 1: 記録入力ページを作成**

```typescript
// src/app/records/new/page.tsx
"use client";

import { useRouter } from "next/navigation";
import { MainLayout } from "@/components/layout/MainLayout";
import { RecordForm } from "@/components/records/RecordForm";
import { useBirds } from "@/hooks/useBirds";
import { useRecords } from "@/hooks/useRecords";
import { useToast } from "@/hooks/use-toast";
import { RecordFormData } from "@/lib/schemas";

export default function NewRecordPage() {
  const router = useRouter();
  const { birds, isLoading } = useBirds();
  const { createRecord } = useRecords(null);
  const { toast } = useToast();

  const handleSubmit = async (data: RecordFormData) => {
    try {
      await createRecord.mutateAsync(data);
      toast({ title: "記録を保存しました" });
      router.push("/");
    } catch (error) {
      toast({
        title: "エラーが発生しました",
        variant: "destructive",
      });
    }
  };

  if (isLoading) {
    return (
      <MainLayout>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
        </div>
      </MainLayout>
    );
  }

  if (birds.length === 0) {
    return (
      <MainLayout>
        <div className="text-center py-12">
          <p className="text-muted-foreground mb-4">
            まず文鳥を登録してください
          </p>
          <a href="/birds/new" className="text-primary hover:underline">
            文鳥を登録する
          </a>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="max-w-md mx-auto">
        <RecordForm
          birds={birds}
          onSubmit={handleSubmit}
          isSubmitting={createRecord.isPending}
        />
      </div>
    </MainLayout>
  );
}
```

**Step 2: コミット**

```bash
git add src/app/records/
git commit -m "feat: add record input page"
```

---

## Task 20: Gemini API クライアント

**Files:**
- Create: `src/lib/gemini.ts`
- Create: `src/hooks/useAdvice.ts`

**Step 1: Gemini クライアントを作成**

```typescript
// src/lib/gemini.ts
import { GoogleGenerativeAI } from "@google/generative-ai";

const apiKey = process.env.NEXT_PUBLIC_GEMINI_API_KEY!;
const genAI = new GoogleGenerativeAI(apiKey);

export async function getHealthAdvice(
  birdName: string,
  species: string | null,
  records: Array<{
    date: string;
    weight: number;
    food_amount: number;
    droppings_count: number;
    memo: string | null;
  }>
): Promise<string> {
  const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

  const recordsText = records
    .map(
      (r) =>
        `${r.date}: 体重${r.weight}g, ご飯${r.food_amount}g, うんち${r.droppings_count}回${r.memo ? `, メモ: ${r.memo}` : ""}`
    )
    .join("\n");

  const prompt = `あなたは文鳥の健康管理に詳しい獣医師です。
以下は${species ? `${species}の` : ""}「${birdName}」の健康記録です。

${recordsText}

この記録を分析して、以下の観点からアドバイスをください：
- 体重の推移（増減傾向、適正範囲か）
- 食事量の変化
- 排泄状況
- 注意すべき点や推奨事項

文鳥の飼い主にわかりやすく、簡潔に説明してください。`;

  const result = await model.generateContent(prompt);
  const response = result.response;
  return response.text();
}
```

**Step 2: useAdvice フックを作成**

```typescript
// src/hooks/useAdvice.ts
import { useState } from "react";
import { getHealthAdvice } from "@/lib/gemini";
import { Bird, Record } from "@/types/database";

export function useAdvice() {
  const [advice, setAdvice] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const fetchAdvice = async (bird: Bird, records: Record[]) => {
    setIsLoading(true);
    setError(null);
    try {
      const result = await getHealthAdvice(
        bird.name,
        bird.species,
        records.map((r) => ({
          date: r.date,
          weight: r.weight,
          food_amount: r.food_amount,
          droppings_count: r.droppings_count,
          memo: r.memo,
        }))
      );
      setAdvice(result);
    } catch (err) {
      setError(err instanceof Error ? err : new Error("Unknown error"));
    } finally {
      setIsLoading(false);
    }
  };

  const reset = () => {
    setAdvice(null);
    setError(null);
  };

  return { advice, isLoading, error, fetchAdvice, reset };
}
```

**Step 3: コミット**

```bash
git add src/lib/gemini.ts src/hooks/useAdvice.ts
git commit -m "feat: add Gemini API client and useAdvice hook"
```

---

## Task 21: 健康アドバイスページ

**Files:**
- Create: `src/app/advice/page.tsx`

**Step 1: アドバイスページを作成**

```typescript
// src/app/advice/page.tsx
"use client";

import { useState, useEffect } from "react";
import { MainLayout } from "@/components/layout/MainLayout";
import { useBirds } from "@/hooks/useBirds";
import { useRecords } from "@/hooks/useRecords";
import { useAdvice } from "@/hooks/useAdvice";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Bird, Period } from "@/types/database";
import { PeriodSelector } from "@/components/dashboard/PeriodSelector";

export default function AdvicePage() {
  const { birds, isLoading: birdsLoading } = useBirds();
  const [selectedBird, setSelectedBird] = useState<Bird | null>(null);
  const [period, setPeriod] = useState<Period>("1m");
  const { records } = useRecords(selectedBird?.id ?? null, period);
  const { advice, isLoading, error, fetchAdvice, reset } = useAdvice();

  useEffect(() => {
    if (birds.length > 0 && !selectedBird) {
      setSelectedBird(birds[0]);
    }
  }, [birds, selectedBird]);

  useEffect(() => {
    reset();
  }, [selectedBird, period]);

  const handleAnalyze = () => {
    if (selectedBird && records.length > 0) {
      fetchAdvice(selectedBird, records);
    }
  };

  if (birdsLoading) {
    return (
      <MainLayout>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
        </div>
      </MainLayout>
    );
  }

  if (birds.length === 0) {
    return (
      <MainLayout>
        <div className="text-center py-12">
          <p className="text-muted-foreground">文鳥を登録してください</p>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="max-w-2xl mx-auto space-y-6">
        <h2 className="text-2xl font-bold">健康アドバイス</h2>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">分析対象</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex gap-4 flex-wrap">
              <Select
                value={selectedBird?.id ?? ""}
                onValueChange={(v) =>
                  setSelectedBird(birds.find((b) => b.id === v) ?? null)
                }
              >
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="文鳥を選択" />
                </SelectTrigger>
                <SelectContent>
                  {birds.map((bird) => (
                    <SelectItem key={bird.id} value={bird.id}>
                      {bird.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <PeriodSelector value={period} onChange={setPeriod} />
            </div>

            <p className="text-sm text-muted-foreground">
              記録数: {records.length}件
            </p>

            <Button
              onClick={handleAnalyze}
              disabled={isLoading || records.length === 0}
              className="w-full"
            >
              {isLoading ? "分析中..." : "AIに相談する"}
            </Button>
          </CardContent>
        </Card>

        {error && (
          <Card className="border-destructive">
            <CardContent className="pt-6">
              <p className="text-destructive">
                エラーが発生しました: {error.message}
              </p>
              <Button variant="outline" onClick={handleAnalyze} className="mt-4">
                再試行
              </Button>
            </CardContent>
          </Card>
        )}

        {advice && (
          <Card>
            <CardHeader>
              <CardTitle className="text-base">アドバイス</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="prose prose-sm dark:prose-invert max-w-none whitespace-pre-wrap">
                {advice}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </MainLayout>
  );
}
```

**Step 2: コミット**

```bash
git add src/app/advice/
git commit -m "feat: add health advice page"
```

---

## Task 22: ダークモード対応

**Files:**
- Create: `src/components/providers/ThemeProvider.tsx`
- Modify: `src/app/layout.tsx`

**Step 1: ThemeProvider を作成**

```typescript
// src/components/providers/ThemeProvider.tsx
"use client";

import { createContext, useContext, useEffect, useState } from "react";

type Theme = "dark" | "light" | "system";

type ThemeProviderProps = {
  children: React.ReactNode;
  defaultTheme?: Theme;
};

type ThemeProviderState = {
  theme: Theme;
  setTheme: (theme: Theme) => void;
};

const ThemeProviderContext = createContext<ThemeProviderState | undefined>(
  undefined
);

export function ThemeProvider({
  children,
  defaultTheme = "system",
}: ThemeProviderProps) {
  const [theme, setTheme] = useState<Theme>(defaultTheme);

  useEffect(() => {
    const root = window.document.documentElement;
    root.classList.remove("light", "dark");

    if (theme === "system") {
      const systemTheme = window.matchMedia("(prefers-color-scheme: dark)")
        .matches
        ? "dark"
        : "light";
      root.classList.add(systemTheme);
    } else {
      root.classList.add(theme);
    }
  }, [theme]);

  return (
    <ThemeProviderContext.Provider value={{ theme, setTheme }}>
      {children}
    </ThemeProviderContext.Provider>
  );
}

export const useTheme = () => {
  const context = useContext(ThemeProviderContext);
  if (!context) throw new Error("useTheme must be used within ThemeProvider");
  return context;
};
```

**Step 2: layout.tsx を更新**

```typescript
// src/app/layout.tsx
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { QueryProvider } from "@/components/providers/QueryProvider";
import { ThemeProvider } from "@/components/providers/ThemeProvider";
import { Toaster } from "@/components/ui/toaster";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Bunlog2 - 文鳥の健康管理",
  description: "文鳥の体重・食事・健康状態を記録・管理するアプリ",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ja" suppressHydrationWarning>
      <body className={inter.className}>
        <ThemeProvider defaultTheme="system">
          <QueryProvider>
            {children}
            <Toaster />
          </QueryProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
```

**Step 3: コミット**

```bash
git add src/components/providers/ThemeProvider.tsx src/app/layout.tsx
git commit -m "feat: add dark mode support"
```

---

## Task 23: GitHub Actions ワークフロー

**Files:**
- Create: `.github/workflows/deploy.yml`

**Step 1: デプロイワークフローを作成**

```yaml
# .github/workflows/deploy.yml
name: Deploy to GitHub Pages

on:
  push:
    branches: [main]
  workflow_dispatch:

permissions:
  contents: read
  pages: write
  id-token: write

concurrency:
  group: "pages"
  cancel-in-progress: false

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout
        uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: "20"
          cache: "npm"

      - name: Install dependencies
        run: npm ci

      - name: Build
        run: npm run build
        env:
          NEXT_PUBLIC_SUPABASE_URL: ${{ secrets.SUPABASE_URL }}
          NEXT_PUBLIC_SUPABASE_ANON_KEY: ${{ secrets.SUPABASE_ANON_KEY }}
          NEXT_PUBLIC_GEMINI_API_KEY: ${{ secrets.GEMINI_API_KEY }}

      - name: Upload artifact
        uses: actions/upload-pages-artifact@v3
        with:
          path: ./out

  deploy:
    environment:
      name: github-pages
      url: ${{ steps.deployment.outputs.page_url }}
    runs-on: ubuntu-latest
    needs: build
    steps:
      - name: Deploy to GitHub Pages
        id: deployment
        uses: actions/deploy-pages@v4
```

**Step 2: コミット**

```bash
git add .github/workflows/deploy.yml
git commit -m "ci: add GitHub Pages deploy workflow"
```

---

## Task 24: Supabase マイグレーションファイル

**Files:**
- Create: `supabase/migrations/001_initial_schema.sql`

**Step 1: マイグレーションファイルを作成**

```sql
-- supabase/migrations/001_initial_schema.sql

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Birds table
CREATE TABLE birds (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    birth_date DATE,
    gender TEXT NOT NULL DEFAULT 'unknown' CHECK (gender IN ('male', 'female', 'unknown')),
    species TEXT,
    adopted_date DATE,
    vet_name TEXT,
    vet_address TEXT,
    vet_phone TEXT,
    photo_url TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Records table
CREATE TABLE records (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    bird_id UUID NOT NULL REFERENCES birds(id) ON DELETE CASCADE,
    date DATE NOT NULL,
    weight DECIMAL(5,2) NOT NULL CHECK (weight >= 5 AND weight <= 50),
    food_amount DECIMAL(5,2) NOT NULL CHECK (food_amount >= 0 AND food_amount <= 20),
    droppings_count INTEGER NOT NULL CHECK (droppings_count >= 0 AND droppings_count <= 100),
    memo TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(bird_id, date)
);

-- RLS Policies
ALTER TABLE birds ENABLE ROW LEVEL SECURITY;
ALTER TABLE records ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own birds"
ON birds FOR ALL
USING (auth.uid() = user_id);

CREATE POLICY "Users can manage own records"
ON records FOR ALL
USING (bird_id IN (SELECT id FROM birds WHERE user_id = auth.uid()));

-- Storage bucket (run in Supabase dashboard)
-- INSERT INTO storage.buckets (id, name, public) VALUES ('bird-photos', 'bird-photos', false);

-- Storage policy
-- CREATE POLICY "Users can manage own photos"
-- ON storage.objects FOR ALL
-- USING (bucket_id = 'bird-photos' AND auth.uid()::text = (storage.foldername(name))[1]);
```

**Step 2: コミット**

```bash
mkdir -p supabase/migrations
git add supabase/
git commit -m "chore: add Supabase migration file"
```

---

## Task 25: README 作成

**Files:**
- Create: `README.md`

**Step 1: README を作成**

```markdown
# Bunlog2

文鳥の健康管理アプリ。毎日の体重・ご飯の量・うんちの数を記録し、グラフで可視化。Gemini APIで健康アドバイスを取得できます。

## 機能

- 文鳥の登録・管理（2〜5羽）
- 毎日の記録（体重、ご飯の量、うんちの数、メモ）
- ダッシュボード（グラフ表示、期間選択）
- 健康アドバイス（Gemini API）
- ダークモード対応
- レスポンシブデザイン

## 技術スタック

- Next.js 14 (Static Export)
- shadcn/ui + Tailwind CSS
- Recharts
- Supabase (Auth, Database, Storage)
- Gemini API
- GitHub Pages

## セットアップ

### 1. 依存関係のインストール

```bash
npm install
```

### 2. 環境変数の設定

`.env.local` を作成:

```bash
NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
NEXT_PUBLIC_GEMINI_API_KEY=your-gemini-api-key
```

### 3. Supabase のセットアップ

1. Supabase プロジェクトを作成
2. `supabase/migrations/001_initial_schema.sql` を実行
3. Authentication でユーザーを作成

### 4. 開発サーバーの起動

```bash
npm run dev
```

### 5. ビルド

```bash
npm run build
```

## デプロイ

GitHub に push すると自動で GitHub Pages にデプロイされます。

GitHub Secrets に以下を設定:

- `SUPABASE_URL`
- `SUPABASE_ANON_KEY`
- `GEMINI_API_KEY`
```

**Step 2: コミット**

```bash
git add README.md
git commit -m "docs: add README"
```

---

## Task 26: テストセットアップ

**Files:**
- Create: `vitest.config.ts`
- Create: `src/lib/__tests__/schemas.test.ts`
- Modify: `package.json`

**Step 1: Vitest をインストール**

```bash
npm install -D vitest @testing-library/react @testing-library/jest-dom jsdom
```

**Step 2: vitest.config.ts を作成**

```typescript
// vitest.config.ts
import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";
import path from "path";

export default defineConfig({
  plugins: [react()],
  test: {
    environment: "jsdom",
    globals: true,
    setupFiles: "./src/test/setup.ts",
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
});
```

**Step 3: テストセットアップファイルを作成**

```typescript
// src/test/setup.ts
import "@testing-library/jest-dom";
```

**Step 4: スキーマのテストを作成**

```typescript
// src/lib/__tests__/schemas.test.ts
import { describe, it, expect } from "vitest";
import { recordSchema, birdSchema } from "../schemas";

describe("recordSchema", () => {
  it("validates correct record data", () => {
    const data = {
      bird_id: "550e8400-e29b-41d4-a716-446655440000",
      date: "2026-03-03",
      weight: 25,
      food_amount: 5,
      droppings_count: 20,
      memo: null,
    };
    expect(recordSchema.safeParse(data).success).toBe(true);
  });

  it("rejects weight below 5g", () => {
    const data = {
      bird_id: "550e8400-e29b-41d4-a716-446655440000",
      date: "2026-03-03",
      weight: 4,
      food_amount: 5,
      droppings_count: 20,
      memo: null,
    };
    expect(recordSchema.safeParse(data).success).toBe(false);
  });

  it("rejects weight above 50g", () => {
    const data = {
      bird_id: "550e8400-e29b-41d4-a716-446655440000",
      date: "2026-03-03",
      weight: 51,
      food_amount: 5,
      droppings_count: 20,
      memo: null,
    };
    expect(recordSchema.safeParse(data).success).toBe(false);
  });
});

describe("birdSchema", () => {
  it("validates correct bird data", () => {
    const data = {
      name: "ぴーちゃん",
      birth_date: "2024-01-01",
      gender: "male" as const,
      species: "桜文鳥",
      adopted_date: "2024-03-01",
      vet_name: null,
      vet_address: null,
      vet_phone: null,
    };
    expect(birdSchema.safeParse(data).success).toBe(true);
  });

  it("rejects empty name", () => {
    const data = {
      name: "",
      gender: "unknown" as const,
      birth_date: null,
      species: null,
      adopted_date: null,
      vet_name: null,
      vet_address: null,
      vet_phone: null,
    };
    expect(birdSchema.safeParse(data).success).toBe(false);
  });
});
```

**Step 5: package.json にテストスクリプトを追加**

```bash
npm pkg set scripts.test="vitest"
npm pkg set scripts.test:run="vitest run"
```

**Step 6: テストを実行して確認**

Run: `npm run test:run`
Expected: テストがパスする

**Step 7: コミット**

```bash
git add vitest.config.ts src/test/ src/lib/__tests__/ package.json package-lock.json
git commit -m "test: add Vitest setup and schema tests"
```

---

## 完了

全タスク完了後、以下を確認:

1. `npm run dev` でローカル動作確認
2. `npm run build` でビルド成功
3. `npm run test:run` でテスト成功
4. GitHub にプッシュして Actions でデプロイ確認
