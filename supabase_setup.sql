-- Supabase SQL Setup for TaskForge

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Projects (Workspaces)
CREATE TABLE IF NOT EXISTS projects (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title TEXT NOT NULL,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Project Members (Join table between auth.users and projects)
CREATE TABLE IF NOT EXISTS project_members (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
    user_id UUID REFERENCES auth.users(id),
    role TEXT DEFAULT 'member',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tickets (Kanban entries)
CREATE TABLE IF NOT EXISTS tickets (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
    creator_id UUID REFERENCES auth.users(id),
    title TEXT NOT NULL,
    description TEXT,
    status TEXT DEFAULT 'todo', -- todo, in_progress, done
    priority TEXT DEFAULT 'medium', -- low, medium, high
    type TEXT DEFAULT 'task', -- task, bug, story
    points INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Comments on tickets
CREATE TABLE IF NOT EXISTS comments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    ticket_id UUID REFERENCES tickets(id) ON DELETE CASCADE,
    user_id UUID REFERENCES auth.users(id),
    text TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- RLS (Row Level Security) - Simplified for starting
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE project_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE tickets ENABLE ROW LEVEL SECURITY;
ALTER TABLE comments ENABLE ROW LEVEL SECURITY;

-- Allow authenticated users to see projects they are members of
CREATE POLICY "Users can see joined projects" ON projects
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM project_members 
            WHERE project_members.project_id = projects.id 
            AND project_members.user_id = auth.uid()
        )
    );

-- Allow all authenticated users to create projects for now (for the demo)
CREATE POLICY "authenticated_can_create_projects" ON projects
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- All authenticated users can see tickets for projects they belong to
CREATE POLICY "Users can see project tickets" ON tickets
    FOR ALL USING (true); -- Simplified for internship demo

CREATE POLICY "Users can interact with comments" ON comments
    FOR ALL USING (true); -- Simplified for internship demo
