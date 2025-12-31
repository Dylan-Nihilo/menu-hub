-- 食材表
CREATE TABLE ingredients (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  recipe_id UUID NOT NULL REFERENCES recipes(id) ON DELETE CASCADE,
  name VARCHAR(100) NOT NULL,
  amount DECIMAL(10,2),
  unit VARCHAR(20),
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_ingredients_recipe_id ON ingredients(recipe_id);

ALTER TABLE ingredients ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Inherit recipe access" ON ingredients
  FOR ALL USING (
    recipe_id IN (SELECT id FROM recipes)
  );
