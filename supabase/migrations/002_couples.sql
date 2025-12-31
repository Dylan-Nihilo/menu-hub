-- 情侣配对表
CREATE TABLE couples (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  invite_code VARCHAR(8) UNIQUE NOT NULL,
  partner_a_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  partner_b_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'active', 'dissolved')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  paired_at TIMESTAMPTZ
);

-- 索引
CREATE UNIQUE INDEX idx_couples_invite_code ON couples(invite_code);

-- 添加外键到 profiles
ALTER TABLE profiles ADD CONSTRAINT fk_profiles_couple
  FOREIGN KEY (couple_id) REFERENCES couples(id) ON DELETE SET NULL;

-- RLS
ALTER TABLE couples ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Couple members can view their couple" ON couples
  FOR SELECT USING (
    auth.uid() = partner_a_id OR auth.uid() = partner_b_id
  );

CREATE POLICY "Users can create couples" ON couples
  FOR INSERT WITH CHECK (auth.uid() = partner_a_id);

CREATE POLICY "Couple members can update" ON couples
  FOR UPDATE USING (
    auth.uid() = partner_a_id OR auth.uid() = partner_b_id
  );
