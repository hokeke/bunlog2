import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getSupabase } from "@/lib/supabase";
import { Record, Period } from "@/types/database";
import { RecordFormData } from "@/lib/schemas";
import { subDays, subMonths, format } from "date-fns";

function getStartDate(period: Period): string {
  const now = new Date();
  switch (period) {
    case "1w":
      return format(subDays(now, 7), "yyyy-MM-dd");
    case "1m":
      return format(subMonths(now, 1), "yyyy-MM-dd");
    case "3m":
      return format(subMonths(now, 3), "yyyy-MM-dd");
  }
}

export function useRecords(birdId: string | null, period: Period = "1w") {
  const queryClient = useQueryClient();

  const recordsQuery = useQuery({
    queryKey: ["records", birdId, period],
    queryFn: async () => {
      const supabase = getSupabase();
      const startDate = getStartDate(period);
      const { data, error } = await supabase
        .from("records")
        .select("*")
        .eq("bird_id", birdId)
        .gte("date", startDate)
        .order("date", { ascending: true });
      if (error) throw error;
      return data as Record[];
    },
    enabled: !!birdId,
  });

  const createRecord = useMutation({
    mutationFn: async (data: RecordFormData) => {
      const supabase = getSupabase();
      const { data: record, error } = await supabase
        .from("records")
        .insert(data)
        .select()
        .single();
      if (error) throw error;
      return record as Record;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["records"] });
    },
  });

  const updateRecord = useMutation({
    mutationFn: async ({
      id,
      data,
    }: {
      id: string;
      data: Partial<RecordFormData>;
    }) => {
      const supabase = getSupabase();
      const { data: record, error } = await supabase
        .from("records")
        .update({ ...data, updated_at: new Date().toISOString() })
        .eq("id", id)
        .select()
        .single();
      if (error) throw error;
      return record as Record;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["records"] });
    },
  });

  const deleteRecord = useMutation({
    mutationFn: async (id: string) => {
      const supabase = getSupabase();
      const { error } = await supabase.from("records").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["records"] });
    },
  });

  return {
    records: recordsQuery.data ?? [],
    isLoading: recordsQuery.isLoading,
    error: recordsQuery.error,
    createRecord,
    updateRecord,
    deleteRecord,
  };
}

export function useRecordByDate(birdId: string | null, date: string | null) {
  const recordQuery = useQuery({
    queryKey: ["record", birdId, date],
    queryFn: async () => {
      const supabase = getSupabase();
      const { data, error } = await supabase
        .from("records")
        .select("*")
        .eq("bird_id", birdId)
        .eq("date", date)
        .maybeSingle();
      if (error) throw error;
      return data as Record | null;
    },
    enabled: !!birdId && !!date,
  });

  return {
    record: recordQuery.data ?? null,
    isLoading: recordQuery.isLoading,
    error: recordQuery.error,
  };
}
