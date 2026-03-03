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
