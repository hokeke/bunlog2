import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { Bird } from "@/types/database";
import { BirdFormData } from "@/lib/schemas";
import { useAuthStore } from "@/store/authStore";

export function useBirds() {
  const queryClient = useQueryClient();
  const { user } = useAuthStore();

  const birdsQuery = useQuery({
    queryKey: ["birds"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("birds")
        .select("*")
        .order("created_at", { ascending: true });
      if (error) throw error;
      return data as Bird[];
    },
    enabled: !!user,
  });

  const createBird = useMutation({
    mutationFn: async (data: BirdFormData) => {
      const { data: bird, error } = await supabase
        .from("birds")
        .insert({ ...data, user_id: user!.id })
        .select()
        .single();
      if (error) throw error;
      return bird as Bird;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["birds"] });
    },
  });

  const updateBird = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: BirdFormData }) => {
      const { data: bird, error } = await supabase
        .from("birds")
        .update({ ...data, updated_at: new Date().toISOString() })
        .eq("id", id)
        .select()
        .single();
      if (error) throw error;
      return bird as Bird;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["birds"] });
    },
  });

  const deleteBird = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("birds").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["birds"] });
    },
  });

  return {
    birds: birdsQuery.data ?? [],
    isLoading: birdsQuery.isLoading,
    error: birdsQuery.error,
    createBird,
    updateBird,
    deleteBird,
  };
}
