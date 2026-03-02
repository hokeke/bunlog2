import { z } from "zod";

export const birdSchema = z.object({
  name: z.string().min(1, "名前は必須です").max(50),
  birth_date: z.string().nullable(),
  gender: z.enum(["male", "female", "unknown"]),
  species: z.string().max(50).nullable(),
  adopted_date: z.string().nullable(),
  vet_name: z.string().max(100).nullable(),
  vet_address: z.string().max(200).nullable(),
  vet_phone: z.string().max(20).nullable(),
});

export const recordSchema = z.object({
  bird_id: z.string().uuid(),
  date: z.string(),
  weight: z.number().min(5, "5g以上").max(50, "50g以下"),
  food_amount: z.number().min(0, "0g以上").max(20, "20g以下"),
  droppings_count: z.number().int().min(0).max(100),
  memo: z.string().max(500).nullable(),
});

export type BirdFormData = z.infer<typeof birdSchema>;
export type RecordFormData = z.infer<typeof recordSchema>;
