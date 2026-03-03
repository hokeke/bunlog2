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
