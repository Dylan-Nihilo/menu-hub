-- 每日菜单表
CREATE TABLE daily_menus (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  couple_id UUID NOT NULL REFERENCES couples(id) ON DELETE CASCADE,
  menu_date DATE NOT NULL,
  status VARCHAR(20) DEFAULT 'planning',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(couple_id, menu_date)
);

CREATE INDEX idx_daily_menus_couple_date ON daily_menus(couple_id, menu_date);

ALTER TABLE daily_menus ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Couple members can manage menus" ON daily_menus
  FOR ALL USING (
    couple_id IN (
      SELECT id FROM couples
      WHERE partner_a_id = auth.uid() OR partner_b_id = auth.uid()
    )
  );
