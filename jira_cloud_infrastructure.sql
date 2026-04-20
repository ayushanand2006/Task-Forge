-- TaskForge Jira Cloud Infrastructure

-- Profiles: Handles Plan Tier and Identity
CREATE TABLE IF NOT EXISTS profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    full_name TEXT,
    avatar_url TEXT,
    plan_tier TEXT DEFAULT 'starter', -- starter, pro, enterprise
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Project Chat Messages
CREATE TABLE IF NOT EXISTS messages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
    user_id UUID REFERENCES auth.users(id),
    text TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Trigger to create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, plan_tier)
  VALUES (new.id, new.raw_user_meta_data->>'full_name', 'starter');
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can see all profiles" ON profiles FOR SELECT USING (true);
CREATE POLICY "Users can update own profile" ON profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Users can see project messages" ON messages FOR SELECT USING (true);
CREATE POLICY "Users can send messages" ON messages FOR INSERT WITH CHECK (auth.role() = 'authenticated');
