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
