import { describe, it, expect } from "vitest";
import { recordSchema, birdSchema } from "../schemas";

describe("recordSchema", () => {
  it("validates correct record data", () => {
    const data = {
      bird_id: "550e8400-e29b-41d4-a716-446655440000",
      date: "2026-03-03",
      weight: 25,
      food_amount: 5,
      droppings_count: 20,
      memo: null,
    };
    expect(recordSchema.safeParse(data).success).toBe(true);
  });

  it("rejects weight below 5g", () => {
    const data = {
      bird_id: "550e8400-e29b-41d4-a716-446655440000",
      date: "2026-03-03",
      weight: 4,
      food_amount: 5,
      droppings_count: 20,
      memo: null,
    };
    expect(recordSchema.safeParse(data).success).toBe(false);
  });

  it("rejects weight above 50g", () => {
    const data = {
      bird_id: "550e8400-e29b-41d4-a716-446655440000",
      date: "2026-03-03",
      weight: 51,
      food_amount: 5,
      droppings_count: 20,
      memo: null,
    };
    expect(recordSchema.safeParse(data).success).toBe(false);
  });
});

describe("birdSchema", () => {
  it("validates correct bird data", () => {
    const data = {
      name: "ぴーちゃん",
      birth_date: "2024-01-01",
      gender: "male" as const,
      species: "桜文鳥",
      adopted_date: "2024-03-01",
      vet_name: null,
      vet_address: null,
      vet_phone: null,
    };
    expect(birdSchema.safeParse(data).success).toBe(true);
  });

  it("rejects empty name", () => {
    const data = {
      name: "",
      gender: "unknown" as const,
      birth_date: null,
      species: null,
      adopted_date: null,
      vet_name: null,
      vet_address: null,
      vet_phone: null,
    };
    expect(birdSchema.safeParse(data).success).toBe(false);
  });
});
