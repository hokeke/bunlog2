export type Bird = {
  id: string;
  user_id: string;
  name: string;
  birth_date: string | null;
  gender: "male" | "female" | "unknown";
  species: string | null;
  adopted_date: string | null;
  vet_name: string | null;
  vet_address: string | null;
  vet_phone: string | null;
  photo_url: string | null;
  created_at: string;
  updated_at: string;
};

export type Record = {
  id: string;
  bird_id: string;
  date: string;
  weight: number;
  food_amount: number;
  droppings_count: number;
  memo: string | null;
  created_at: string;
  updated_at: string;
};

export type Period = "1w" | "1m" | "3m";
