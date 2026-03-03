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

type DroppingsChartProps = {
  records: Record[];
};

export function DroppingsChart({ records }: DroppingsChartProps) {
  const data = records.map((r) => ({
    date: format(parseISO(r.date), "M/d", { locale: ja }),
    droppings: r.droppings_count,
  }));

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">うんちの数</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-[200px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" fontSize={12} />
              <YAxis domain={[0, "auto"]} fontSize={12} />
              <Tooltip />
              <Bar dataKey="droppings" fill="hsl(var(--chart-2))" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
