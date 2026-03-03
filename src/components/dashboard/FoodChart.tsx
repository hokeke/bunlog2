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
