-- Migration: Move localStorage-based admin pages to Supabase
-- Run this in your Supabase SQL Editor

-- 1. Contacts table
CREATE TABLE IF NOT EXISTS contacts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  email TEXT,
  phone TEXT,
  whatsapp TEXT,
  type TEXT DEFAULT 'Buyer',
  status TEXT DEFAULT 'Active',
  last_contact TEXT,
  deals INTEGER DEFAULT 0,
  nationality TEXT,
  assigned_agent TEXT,
  notes TEXT,
  source TEXT DEFAULT 'Website',
  budget TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 2. Deals table
CREATE TABLE IF NOT EXISTS deals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ref_no TEXT,
  property TEXT,
  property_ref TEXT,
  lead TEXT,
  client TEXT,
  client_email TEXT,
  client_phone TEXT,
  agent TEXT,
  value BIGINT DEFAULT 0,
  commission BIGINT DEFAULT 0,
  stage TEXT DEFAULT 'Qualified',
  type TEXT DEFAULT 'Sale',
  closing_date DATE,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 3. Tasks table
CREATE TABLE IF NOT EXISTS tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  assignee TEXT,
  priority TEXT DEFAULT 'Medium',
  status TEXT DEFAULT 'Todo',
  category TEXT DEFAULT 'Admin',
  due_date DATE,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 4. Calendar events table
CREATE TABLE IF NOT EXISTS calendar_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  event_date DATE NOT NULL,
  time TEXT,
  type TEXT DEFAULT 'Meeting',
  owner TEXT DEFAULT 'team',
  attendees TEXT[] DEFAULT '{}',
  location TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 5. Marketing events (calendar) table
CREATE TABLE IF NOT EXISTS marketing_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  event_date DATE NOT NULL,
  time TEXT,
  campaign TEXT,
  channel TEXT DEFAULT 'Email',
  budget TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 6. Blog posts table
CREATE TABLE IF NOT EXISTS blog_posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  slug TEXT UNIQUE,
  excerpt TEXT,
  content TEXT,
  category TEXT DEFAULT 'Market Insights',
  author TEXT DEFAULT 'Admin',
  status TEXT DEFAULT 'Draft',
  views INTEGER DEFAULT 0,
  featured_image TEXT,
  tags TEXT[] DEFAULT '{}',
  meta_title TEXT,
  meta_desc TEXT,
  publish_date DATE,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 7. Campaigns table
CREATE TABLE IF NOT EXISTS campaigns (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  channel TEXT DEFAULT 'Email',
  status TEXT DEFAULT 'Draft',
  subject TEXT,
  audience TEXT,
  sent INTEGER DEFAULT 0,
  opens INTEGER DEFAULT 0,
  clicks INTEGER DEFAULT 0,
  budget BIGINT DEFAULT 0,
  spent BIGINT DEFAULT 0,
  start_date DATE,
  end_date DATE,
  content TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 8. Scheduled campaigns table
CREATE TABLE IF NOT EXISTS scheduled_campaigns (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  channel TEXT DEFAULT 'Email',
  scheduled_date DATE,
  audience TEXT,
  status TEXT DEFAULT 'Scheduled',
  budget BIGINT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS on all new tables
ALTER TABLE contacts ENABLE ROW LEVEL SECURITY;
ALTER TABLE deals ENABLE ROW LEVEL SECURITY;
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE calendar_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE marketing_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE blog_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE campaigns ENABLE ROW LEVEL SECURITY;
ALTER TABLE scheduled_campaigns ENABLE ROW LEVEL SECURITY;

-- Create permissive policies for authenticated users
CREATE POLICY "Authenticated users can do everything on contacts"
  ON contacts FOR ALL TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY "Authenticated users can do everything on deals"
  ON deals FOR ALL TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY "Authenticated users can do everything on tasks"
  ON tasks FOR ALL TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY "Authenticated users can do everything on calendar_events"
  ON calendar_events FOR ALL TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY "Authenticated users can do everything on marketing_events"
  ON marketing_events FOR ALL TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY "Authenticated users can do everything on blog_posts"
  ON blog_posts FOR ALL TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY "Authenticated users can do everything on campaigns"
  ON campaigns FOR ALL TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY "Authenticated users can do everything on scheduled_campaigns"
  ON scheduled_campaigns FOR ALL TO authenticated USING (true) WITH CHECK (true);
