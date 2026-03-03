"use client";

import { useRouter } from "next/navigation";
import { MainLayout } from "@/components/layout/MainLayout";
import { BirdForm } from "@/components/birds/BirdForm";
import { useBirds } from "@/hooks/useBirds";
import { toast } from "sonner";
import { BirdFormData } from "@/lib/schemas";

export default function NewBirdPage() {
  const router = useRouter();
  const { createBird } = useBirds();

  const handleSubmit = async (data: BirdFormData) => {
    try {
      await createBird.mutateAsync(data);
      toast.success("文鳥を登録しました");
      router.push("/birds");
    } catch (error) {
      toast.error("エラーが発生しました");
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
