"use client";

import Link from "next/link";
import { MainLayout } from "@/components/layout/MainLayout";
import { useBirds } from "@/hooks/useBirds";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
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
