"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { recordSchema, RecordFormData } from "@/lib/schemas";
import { Bird } from "@/types/database";
import { format } from "date-fns";

type RecordFormProps = {
  birds: Bird[];
  onSubmit: (data: RecordFormData) => Promise<void>;
  isSubmitting: boolean;
};

export function RecordForm({ birds, onSubmit, isSubmitting }: RecordFormProps) {
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<RecordFormData>({
    resolver: zodResolver(recordSchema),
    defaultValues: {
      bird_id: birds[0]?.id ?? "",
      date: format(new Date(), "yyyy-MM-dd"),
      weight: 25,
      food_amount: 5,
      droppings_count: 20,
      memo: null,
    },
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle>今日の記録</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="bird_id">文鳥</Label>
            <Select
              value={watch("bird_id")}
              onValueChange={(v) => setValue("bird_id", v)}
            >
              <SelectTrigger>
                <SelectValue placeholder="選択" />
              </SelectTrigger>
              <SelectContent>
                {birds.map((bird) => (
                  <SelectItem key={bird.id} value={bird.id}>
                    {bird.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="date">日付</Label>
            <Input id="date" type="date" {...register("date")} />
          </div>

          <div className="space-y-2">
            <Label htmlFor="weight">体重 (g)</Label>
            <Input
              id="weight"
              type="number"
              step="0.1"
              {...register("weight", { valueAsNumber: true })}
            />
            {errors.weight && (
              <p className="text-sm text-destructive">{errors.weight.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="food_amount">ご飯の量 (g)</Label>
            <Input
              id="food_amount"
              type="number"
              step="0.1"
              {...register("food_amount", { valueAsNumber: true })}
            />
            {errors.food_amount && (
              <p className="text-sm text-destructive">
                {errors.food_amount.message}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="droppings_count">うんちの数</Label>
            <Input
              id="droppings_count"
              type="number"
              {...register("droppings_count", { valueAsNumber: true })}
            />
            {errors.droppings_count && (
              <p className="text-sm text-destructive">
                {errors.droppings_count.message}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="memo">メモ</Label>
            <Textarea
              id="memo"
              placeholder="今日の様子など"
              {...register("memo")}
            />
          </div>

          <Button type="submit" className="w-full" disabled={isSubmitting}>
            {isSubmitting ? "保存中..." : "記録する"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
