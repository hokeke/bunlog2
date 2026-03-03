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
