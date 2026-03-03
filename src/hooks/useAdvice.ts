// src/hooks/useAdvice.ts
import { useState } from "react";
import { getHealthAdvice } from "@/lib/gemini";
import { Bird, Record } from "@/types/database";

export function useAdvice() {
  const [advice, setAdvice] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const fetchAdvice = async (bird: Bird, records: Record[]) => {
    setIsLoading(true);
    setError(null);
    try {
      const result = await getHealthAdvice(
        bird.name,
        bird.species,
        records.map((r) => ({
          date: r.date,
          weight: r.weight,
          food_amount: r.food_amount,
          droppings_count: r.droppings_count,
          memo: r.memo,
        }))
      );
      setAdvice(result);
    } catch (err) {
      setError(err instanceof Error ? err : new Error("Unknown error"));
    } finally {
      setIsLoading(false);
    }
  };

  const reset = () => {
    setAdvice(null);
    setError(null);
  };

  return { advice, isLoading, error, fetchAdvice, reset };
}
