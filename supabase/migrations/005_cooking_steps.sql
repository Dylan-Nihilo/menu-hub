-- 烹饪步骤表
CREATE TABLE cooking_steps (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  recipe_id UUID NOT NULL REFERENCES recipes(id) ON DELETE CASCADE,
  step_number INTEGER NOT NULL,
  description TEXT NOT NULL,
  image_url TEXT,
  duration INTEGER,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_steps_recipe_id ON cooking_steps(recipe_id);

ALTER TABLE cooking_steps ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Inherit recipe access" ON cooking_steps
  FOR ALL USING (
    recipe_id IN (SELECT id FROM recipes)
  );
