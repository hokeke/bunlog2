"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { birdSchema, BirdFormData } from "@/lib/schemas";
import { Bird } from "@/types/database";

type BirdFormProps = {
  bird?: Bird;
  onSubmit: (data: BirdFormData) => Promise<void>;
  isSubmitting: boolean;
};

const speciesOptions = [
  "桜文鳥",
  "白文鳥",
  "シナモン文鳥",
  "シルバー文鳥",
  "クリーム文鳥",
  "その他",
];

export function BirdForm({ bird, onSubmit, isSubmitting }: BirdFormProps) {
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<BirdFormData>({
    resolver: zodResolver(birdSchema),
    defaultValues: {
      name: bird?.name ?? "",
      birth_date: bird?.birth_date ?? null,
      gender: bird?.gender ?? "unknown",
      species: bird?.species ?? null,
      adopted_date: bird?.adopted_date ?? null,
      vet_name: bird?.vet_name ?? null,
      vet_address: bird?.vet_address ?? null,
      vet_phone: bird?.vet_phone ?? null,
    },
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle>{bird ? "文鳥を編集" : "文鳥を登録"}</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">名前 *</Label>
            <Input id="name" {...register("name")} />
            {errors.name && (
              <p className="text-sm text-destructive">{errors.name.message}</p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="gender">性別</Label>
              <Select
                value={watch("gender")}
                onValueChange={(v) => setValue("gender", v as "male" | "female" | "unknown")}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="male">オス</SelectItem>
                  <SelectItem value="female">メス</SelectItem>
                  <SelectItem value="unknown">不明</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="species">品種</Label>
              <Select
                value={watch("species") ?? ""}
                onValueChange={(v) => setValue("species", v || null)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="選択" />
                </SelectTrigger>
                <SelectContent>
                  {speciesOptions.map((s) => (
                    <SelectItem key={s} value={s}>
                      {s}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="birth_date">生年月日</Label>
              <Input
                id="birth_date"
                type="date"
                {...register("birth_date")}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="adopted_date">お迎え日</Label>
              <Input
                id="adopted_date"
                type="date"
                {...register("adopted_date")}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="vet_name">かかりつけ医の名前</Label>
            <Input id="vet_name" {...register("vet_name")} />
          </div>

          <div className="space-y-2">
            <Label htmlFor="vet_address">かかりつけ医の住所</Label>
            <Input id="vet_address" {...register("vet_address")} />
          </div>

          <div className="space-y-2">
            <Label htmlFor="vet_phone">かかりつけ医の電話番号</Label>
            <Input id="vet_phone" type="tel" {...register("vet_phone")} />
          </div>

          <Button type="submit" className="w-full" disabled={isSubmitting}>
            {isSubmitting ? "保存中..." : "保存"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
