-- 菜谱表
CREATE TABLE recipes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  couple_id UUID NOT NULL REFERENCES couples(id) ON DELETE CASCADE,
  created_by UUID NOT NULL REFERENCES auth.users(id),
  name VARCHAR(100) NOT NULL,
  description TEXT,
  cover_image TEXT,
  category VARCHAR(50),
  prep_time INTEGER,
  cook_time INTEGER,
  difficulty VARCHAR(20) CHECK (difficulty IN ('easy', 'medium', 'hard')),
  is_favorite BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_recipes_couple_id ON recipes(couple_id);

ALTER TABLE recipes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Couple members can manage recipes" ON recipes
  FOR ALL USING (
    couple_id IN (
      SELECT id FROM couples
      WHERE partner_a_id = auth.uid() OR partner_b_id = auth.uid()
    )
  );
