-- supabase/migrations/001_initial_schema.sql

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Birds table
CREATE TABLE birds (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    birth_date DATE,
    gender TEXT NOT NULL DEFAULT 'unknown' CHECK (gender IN ('male', 'female', 'unknown')),
    species TEXT,
    adopted_date DATE,
    vet_name TEXT,
    vet_address TEXT,
    vet_phone TEXT,
    photo_url TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Records table
CREATE TABLE records (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    bird_id UUID NOT NULL REFERENCES birds(id) ON DELETE CASCADE,
    date DATE NOT NULL,
    weight DECIMAL(5,2) NOT NULL CHECK (weight >= 5 AND weight <= 50),
    food_amount DECIMAL(5,2) NOT NULL CHECK (food_amount >= 0 AND food_amount <= 20),
    droppings_count INTEGER NOT NULL CHECK (droppings_count >= 0 AND droppings_count <= 100),
    memo TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(bird_id, date)
);

-- RLS Policies
ALTER TABLE birds ENABLE ROW LEVEL SECURITY;
ALTER TABLE records ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own birds"
ON birds FOR ALL
USING (auth.uid() = user_id);

CREATE POLICY "Users can manage own records"
ON records FOR ALL
USING (bird_id IN (SELECT id FROM birds WHERE user_id = auth.uid()));

-- Storage bucket (run in Supabase dashboard)
-- INSERT INTO storage.buckets (id, name, public) VALUES ('bird-photos', 'bird-photos', false);

-- Storage policy
-- CREATE POLICY "Users can manage own photos"
-- ON storage.objects FOR ALL
-- USING (bucket_id = 'bird-photos' AND auth.uid()::text = (storage.foldername(name))[1]);
