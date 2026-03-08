"use client";

import { useEffect } from "react";
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
import { Bird, Record } from "@/types/database";
import { format } from "date-fns";
import { useRecordByDate } from "@/hooks/useRecords";

type RecordFormProps = {
  birds: Bird[];
  onSubmit: (data: RecordFormData, existingRecordId?: string) => Promise<void>;
  isSubmitting: boolean;
};

export function RecordForm({ birds, onSubmit, isSubmitting }: RecordFormProps) {
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
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

  const selectedBirdId = watch("bird_id");
  const selectedDate = watch("date");

  const { record: existingRecord, isLoading: isLoadingRecord } = useRecordByDate(
    selectedBirdId,
    selectedDate
  );

  useEffect(() => {
    if (existingRecord) {
      setValue("weight", existingRecord.weight);
      setValue("food_amount", existingRecord.food_amount);
      setValue("droppings_count", existingRecord.droppings_count);
      setValue("memo", existingRecord.memo);
    } else if (selectedBirdId && selectedDate && !isLoadingRecord) {
      setValue("weight", 25);
      setValue("food_amount", 5);
      setValue("droppings_count", 20);
      setValue("memo", null);
    }
  }, [existingRecord, selectedBirdId, selectedDate, isLoadingRecord, setValue]);

  const handleFormSubmit = async (data: RecordFormData) => {
    await onSubmit(data, existingRecord?.id);
  };

  const isEditMode = !!existingRecord;

  return (
    <Card>
      <CardHeader>
        <CardTitle>
          {isEditMode ? "記録を編集" : "新しい記録"}
          {isLoadingRecord && (
            <span className="ml-2 text-sm text-muted-foreground">読込中...</span>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
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

          <Button type="submit" className="w-full" disabled={isSubmitting || isLoadingRecord}>
            {isSubmitting ? "保存中..." : isEditMode ? "更新する" : "記録する"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
