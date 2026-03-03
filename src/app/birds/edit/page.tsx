"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { MainLayout } from "@/components/layout/MainLayout";
import { BirdForm } from "@/components/birds/BirdForm";
import { useBirds } from "@/hooks/useBirds";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { BirdFormData } from "@/lib/schemas";
import { Suspense } from "react";

function BirdEditContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { birds, updateBird, deleteBird, isLoading } = useBirds();

  const id = searchParams.get("id");
  const bird = birds.find((b) => b.id === id);

  const handleSubmit = async (data: BirdFormData) => {
    if (!id) return;
    try {
      await updateBird.mutateAsync({ id, data });
      toast.success("文鳥情報を更新しました");
      router.push("/birds");
    } catch (error) {
      toast.error("エラーが発生しました");
    }
  };

  const handleDelete = async () => {
    if (!id) return;
    if (!confirm("この文鳥を削除しますか？記録も全て削除されます。")) {
      return;
    }
    try {
      await deleteBird.mutateAsync(id);
      toast.success("文鳥を削除しました");
      router.push("/birds");
    } catch (error) {
      toast.error("エラーが発生しました");
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    );
  }

  if (!id || !bird) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">文鳥が見つかりません</p>
      </div>
    );
  }

  return (
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
  );
}

export default function BirdEditPage() {
  return (
    <MainLayout>
      <Suspense
        fallback={
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
          </div>
        }
      >
        <BirdEditContent />
      </Suspense>
    </MainLayout>
  );
}
