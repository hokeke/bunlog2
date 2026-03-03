"use client";

import { useParams, useRouter } from "next/navigation";
import { MainLayout } from "@/components/layout/MainLayout";
import { BirdForm } from "@/components/birds/BirdForm";
import { useBirds } from "@/hooks/useBirds";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { BirdFormData } from "@/lib/schemas";

export default function BirdDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { birds, updateBird, deleteBird } = useBirds();

  const bird = birds.find((b) => b.id === params.id);

  const handleSubmit = async (data: BirdFormData) => {
    try {
      await updateBird.mutateAsync({ id: params.id as string, data });
      toast.success("文鳥情報を更新しました");
      router.push("/birds");
    } catch (error) {
      toast.error("エラーが発生しました");
    }
  };

  const handleDelete = async () => {
    if (!confirm("この文鳥を削除しますか？記録も全て削除されます。")) {
      return;
    }
    try {
      await deleteBird.mutateAsync(params.id as string);
      toast.success("文鳥を削除しました");
      router.push("/birds");
    } catch (error) {
      toast.error("エラーが発生しました");
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
