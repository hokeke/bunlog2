"use client";

import { useRouter } from "next/navigation";
import { MainLayout } from "@/components/layout/MainLayout";
import { RecordForm } from "@/components/records/RecordForm";
import { useBirds } from "@/hooks/useBirds";
import { useRecords } from "@/hooks/useRecords";
import { toast } from "sonner";
import { RecordFormData } from "@/lib/schemas";

export default function NewRecordPage() {
  const router = useRouter();
  const { birds, isLoading } = useBirds();
  const { createRecord } = useRecords(null);

  const handleSubmit = async (data: RecordFormData) => {
    try {
      await createRecord.mutateAsync(data);
      toast.success("記録を保存しました");
      router.push("/");
    } catch (error) {
      toast.error("エラーが発生しました");
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
