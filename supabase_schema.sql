-- =========================================================
-- TaskFlow India MSME Suite Database Schema for Supabase
-- Self-Healing & Migration-Safe (Safe to run multiple times)
-- =========================================================

-- Enable pgcrypto for UUID generation
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- =========================================================
-- 1. EMPLOYEES & GAMIFIED LEADERBOARD TABLE
-- =========================================================
CREATE TABLE IF NOT EXISTS public.employees (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
    name TEXT NOT NULL,
    role TEXT NOT NULL,
    email TEXT,
    password TEXT DEFAULT 'password123',
    department TEXT DEFAULT 'Operations',
    avatar_color TEXT DEFAULT '#F56B2C',
    points INT DEFAULT 100,
    streak_days INT DEFAULT 1,
    badges JSONB DEFAULT '["New Joiner ⭐"]'::jsonb,
    kudos JSONB DEFAULT '[]'::jsonb,
    created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Ensure all columns exist even if the table was created previously without them:
ALTER TABLE public.employees ADD COLUMN IF NOT EXISTS email TEXT;
ALTER TABLE public.employees ADD COLUMN IF NOT EXISTS password TEXT DEFAULT 'password123';
ALTER TABLE public.employees ADD COLUMN IF NOT EXISTS department TEXT DEFAULT 'Operations';
ALTER TABLE public.employees ADD COLUMN IF NOT EXISTS avatar_color TEXT DEFAULT '#F56B2C';
ALTER TABLE public.employees ADD COLUMN IF NOT EXISTS points INT DEFAULT 100;
ALTER TABLE public.employees ADD COLUMN IF NOT EXISTS streak_days INT DEFAULT 1;
ALTER TABLE public.employees ADD COLUMN IF NOT EXISTS badges JSONB DEFAULT '["New Joiner ⭐"]'::jsonb;
ALTER TABLE public.employees ADD COLUMN IF NOT EXISTS kudos JSONB DEFAULT '[]'::jsonb;
ALTER TABLE public.employees ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now());

-- =========================================================
-- 2. TEAMS & CROSS-FUNCTIONAL PODS TABLE
-- =========================================================
CREATE TABLE IF NOT EXISTS public.teams (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
    name TEXT NOT NULL,
    description TEXT,
    department TEXT DEFAULT 'General',
    color TEXT DEFAULT '#F56B2C',
    member_ids JSONB DEFAULT '[]'::jsonb,
    created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE public.teams ADD COLUMN IF NOT EXISTS description TEXT;
ALTER TABLE public.teams ADD COLUMN IF NOT EXISTS department TEXT DEFAULT 'General';
ALTER TABLE public.teams ADD COLUMN IF NOT EXISTS color TEXT DEFAULT '#F56B2C';
ALTER TABLE public.teams ADD COLUMN IF NOT EXISTS member_ids JSONB DEFAULT '[]'::jsonb;
ALTER TABLE public.teams ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now());

-- =========================================================
-- 3. TASKS & DELIVERABLES TABLE
-- =========================================================
CREATE TABLE IF NOT EXISTS public.tasks (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
    title TEXT NOT NULL,
    description TEXT,
    tag TEXT DEFAULT 'General',
    assignee_id TEXT REFERENCES public.employees(id) ON DELETE SET NULL,
    assignee_ids JSONB DEFAULT '[]'::jsonb,
    team_id TEXT REFERENCES public.teams(id) ON DELETE SET NULL,
    team_name TEXT,
    priority TEXT NOT NULL DEFAULT 'Medium' CHECK (priority IN ('Low', 'Medium', 'High', 'Urgent')),
    deadline TIMESTAMPTZ NOT NULL,
    status TEXT NOT NULL DEFAULT 'Pending' CHECK (status IN ('Pending', 'In Progress', 'Done')),
    created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE public.tasks ADD COLUMN IF NOT EXISTS description TEXT;
ALTER TABLE public.tasks ADD COLUMN IF NOT EXISTS tag TEXT DEFAULT 'General';
ALTER TABLE public.tasks ADD COLUMN IF NOT EXISTS assignee_id TEXT;
ALTER TABLE public.tasks ADD COLUMN IF NOT EXISTS assignee_ids JSONB DEFAULT '[]'::jsonb;
ALTER TABLE public.tasks ADD COLUMN IF NOT EXISTS team_id TEXT;
ALTER TABLE public.tasks ADD COLUMN IF NOT EXISTS team_name TEXT;
ALTER TABLE public.tasks ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now());

-- =========================================================
-- 4. TASK ACTIVITY NOTES TABLE
-- =========================================================
CREATE TABLE IF NOT EXISTS public.task_notes (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
    task_id TEXT NOT NULL REFERENCES public.tasks(id) ON DELETE CASCADE,
    author TEXT NOT NULL DEFAULT 'Rajesh Sharma',
    content TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- =========================================================
-- 5. ROW LEVEL SECURITY (RLS) & PUBLIC ACCESS POLICIES
-- =========================================================
ALTER TABLE public.employees ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.teams ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.task_notes ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public access to employees" ON public.employees;
CREATE POLICY "Public access to employees" ON public.employees FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Public access to teams" ON public.teams;
CREATE POLICY "Public access to teams" ON public.teams FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Public access to tasks" ON public.tasks;
CREATE POLICY "Public access to tasks" ON public.tasks FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Public access to task_notes" ON public.task_notes;
CREATE POLICY "Public access to task_notes" ON public.task_notes FOR ALL USING (true) WITH CHECK (true);

-- =========================================================
-- 6. SEED DATA: EMPLOYEES
-- =========================================================
INSERT INTO public.employees (id, name, role, email, password, department, avatar_color, points, streak_days, badges, kudos) VALUES
('emp-1', 'Priya Patel', 'Lead UI/UX & Product Designer', 'priya.patel@bharattech.in', 'password123', 'Design & Experience', '#F56B2C', 980, 7, '["Task Titan 🥇", "Sprint Champion", "Zero Overdue 🛡️"]'::jsonb, '[{"from":"Rajesh Sharma","text":"Stunning Diwali creative assets!","date":"Yesterday"}]'::jsonb),
('emp-2', 'Aarav Mehta', 'Senior Full-Stack & UPI Dev', 'aarav.mehta@bharattech.in', 'password123', 'Engineering', '#3B82F6', 860, 5, '["Velocity Star 🥈", "Razorpay Ninja ⚡", "Bug Crusher"]'::jsonb, '[{"from":"Priya Patel","text":"Super clean webhook implementation!","date":"2 days ago"}]'::jsonb),
('emp-3', 'Sneha Rao', 'Head of Finance & Operations', 'sneha.rao@bharattech.in', 'password123', 'Finance & Compliance', '#10B981', 810, 6, '["Compliance Hero 🥉", "GST Master 📑", "Audit Star"]'::jsonb, '[{"from":"Rajesh Sharma","text":"Saved us 18% penalty on ITC reconciliation!","date":"1 week ago"}]'::jsonb),
('emp-4', 'Vikram Malhotra', 'Client Success & Enterprise Sales', 'vikram.m@bharattech.in', 'password123', 'Sales & Growth', '#8B5CF6', 690, 4, '["Deal Maker 🤝", "Client Magnet", "On-Time Pioneer"]'::jsonb, '[{"from":"Sneha Rao","text":"Great onboarding for Bangalore client!","date":"Yesterday"}]'::jsonb),
('emp-5', 'Ananya Sen', 'Digital Marketing & Community Lead', 'ananya.sen@bharattech.in', 'password123', 'Growth Marketing', '#EC4899', 590, 3, '["Growth Hacker 🚀", "Social Wizard", "Festive Champ"]'::jsonb, '[{"from":"Vikram Malhotra","text":"LinkedIn engagement hit 40k views!","date":"4 days ago"}]'::jsonb)
ON CONFLICT (id) DO UPDATE SET
    name = EXCLUDED.name,
    role = EXCLUDED.role,
    email = EXCLUDED.email,
    password = EXCLUDED.password,
    department = EXCLUDED.department,
    avatar_color = EXCLUDED.avatar_color,
    points = EXCLUDED.points,
    streak_days = EXCLUDED.streak_days,
    badges = EXCLUDED.badges,
    kudos = EXCLUDED.kudos;

-- =========================================================
-- 7. SEED DATA: TEAMS & CROSS-FUNCTIONAL PODS
-- =========================================================
INSERT INTO public.teams (id, name, description, department, color, member_ids) VALUES
('team-1', 'Tech & UPI Engineering Squad', 'Core product architecture, Razorpay/UPI gateway integrations, webhooks, and mobile app sprints.', 'Engineering', '#3B82F6', '["emp-2", "emp-1"]'::jsonb),
('team-2', 'GST & Statutory Compliance Pod', 'GSTR-3B filings, Input Tax Credit (ITC) reconciliation, TDS ledgers, MCA filings, and audits.', 'Finance & Compliance', '#10B981', '["emp-3"]'::jsonb),
('team-3', 'Growth & Client Success Alliance', 'B2B client onboarding, corporate partner pitches, LinkedIn outbound sales, and festive marketing.', 'Sales & Growth', '#8B5CF6', '["emp-4", "emp-5", "emp-1"]'::jsonb)
ON CONFLICT (id) DO UPDATE SET
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    department = EXCLUDED.department,
    color = EXCLUDED.color,
    member_ids = EXCLUDED.member_ids;

-- =========================================================
-- 8. SEED DATA: TASKS & DELIVERABLES
-- =========================================================
INSERT INTO public.tasks (id, title, description, tag, assignee_id, assignee_ids, team_id, team_name, priority, deadline, status, created_at) VALUES
('task-101', 'GSTR-3B Filing & Input Tax Credit (ITC) Reconciliation', 'Verify GSTR-2B purchase invoices against supplier uploads on GST Portal before the 20th deadline to prevent penalty interest.', 'GST & Compliance', 'emp-3', '["emp-3"]'::jsonb, 'team-2', 'GST & Statutory Compliance Pod', 'Urgent', now() - interval '2 days', 'In Progress', now() - interval '5 days'),
('task-102', 'Client Onboarding: Bangalore Retail Tech Pvt Ltd', 'Finalize Master Services Agreement (MSA), set up enterprise tenant workspace, and schedule founder kickoff call on Google Meet.', 'Client Deliverable', 'emp-4', '["emp-4", "emp-5"]'::jsonb, 'team-3', 'Growth & Client Success Alliance', 'High', now() - interval '1 day', 'Pending', now() - interval '4 days'),
('task-103', 'Integrate Razorpay UPI & Netbanking Webhooks v3', 'Deploy auto-reconciliation webhook handler for instant UPI QR payments and test refund flows in sandbox with Axis Bank gateway.', 'UPI Payments', 'emp-2', '["emp-2", "emp-1"]'::jsonb, 'team-1', 'Tech & UPI Engineering Squad', 'High', now() + interval '4 hours', 'In Progress', now() - interval '2 days'),
('task-104', 'Diwali Festive Sale Creatives & Banners', 'Design responsive homepage hero banners, Instagram carousel ads, and WhatsApp promotion templates with warm festive colors.', 'Festive Campaign', 'emp-1', '["emp-1", "emp-5"]'::jsonb, 'team-3', 'Growth & Client Success Alliance', 'Medium', now() + interval '7 hours', 'Pending', now() - interval '3 days'),
('task-105', 'TDS Deduction Reconciliation with TRACES Form 26AS', 'Reconcile vendor TDS deducted under Section 194C & 194J against TRACES portal ledger before quarterly Challan payment.', 'Income Tax TDS', 'emp-3', '["emp-3"]'::jsonb, 'team-2', 'GST & Statutory Compliance Pod', 'Medium', now() + interval '2 days', 'Pending', now() - interval '1 day'),
('task-106', 'WhatsApp Business API Customer Support Bot Setup', 'Configure automated WhatsApp order status tracking triggers and FAQ responses via Gupshup/Interakt API webhook.', 'WhatsApp Bot', 'emp-2', '["emp-2"]'::jsonb, 'team-1', 'Tech & UPI Engineering Squad', 'Low', now() + interval '3 days', 'In Progress', now() - interval '2 days'),
('task-107', 'B2B Founder Outreach on LinkedIn: Tier-1 Hubs', 'Execute outbound campaign targeting 150 D2C brands across Mumbai, Gurugram, and Hyderabad for Q3 corporate pilot program.', 'B2B Sales', 'emp-5', '["emp-5", "emp-4"]'::jsonb, 'team-3', 'Growth & Client Success Alliance', 'Low', now() + interval '5 days', 'Pending', now() - interval '1 day'),
('task-108', 'Annual MCA Compliance & Director KYC Verification', 'Complete DIR-3 KYC for active directors and submit annual statutory records to Registrar of Companies (ROC Bangalore).', 'ROC Compliance', 'emp-3', '["emp-3"]'::jsonb, 'team-2', 'GST & Statutory Compliance Pod', 'High', now() - interval '3 days', 'Done', now() - interval '8 days'),
('task-109', 'Mobile App Hindi & Regional Language UI Localization', 'Translate onboarding strings into Hindi and Marathi for tier-2/tier-3 merchants across India.', 'Localization', 'emp-1', '["emp-1", "emp-2"]'::jsonb, 'team-1', 'Tech & UPI Engineering Squad', 'Medium', now() - interval '4 days', 'Done', now() - interval '9 days'),
('task-110', 'Bangalore Tech Summit Booth Collateral & Pitch Deck', 'Printed QR brochures, standee artwork, and investor summary one-pager prepared for Palace Grounds booth setup.', 'Marketing', 'emp-4', '["emp-4", "emp-1"]'::jsonb, 'team-3', 'Growth & Client Success Alliance', 'Medium', now() - interval '1 day', 'Done', now() - interval '6 days')
ON CONFLICT (id) DO UPDATE SET
    title = EXCLUDED.title,
    description = EXCLUDED.description,
    tag = EXCLUDED.tag,
    assignee_id = EXCLUDED.assignee_id,
    assignee_ids = EXCLUDED.assignee_ids,
    team_id = EXCLUDED.team_id,
    team_name = EXCLUDED.team_name,
    priority = EXCLUDED.priority,
    deadline = EXCLUDED.deadline,
    status = EXCLUDED.status;

-- =========================================================
-- 9. SEED DATA: TASK ACTIVITY NOTES
-- =========================================================
INSERT INTO public.task_notes (id, task_id, author, content, created_at) VALUES
('note-1', 'task-101', 'Sneha Rao (Finance)', 'Uploaded ₹14.8 Lakh invoices to the CA portal. 2 vendor invoices still pending verification for input tax credit.', now() - interval '1 day'),
('note-2', 'task-102', 'Vikram Malhotra (Sales)', 'Client founder requested kickoff call scheduled for Thursday 3:30 PM IST. Sent Zoom link and welcome pack on WhatsApp.', now() - interval '12 hours'),
('note-3', 'task-103', 'Aarav Mehta (Dev)', 'Razorpay UPI auto-capture tested with test UPI ID @okhdfcbank. 100% success rate on 15 test transactions.', now() - interval '2 hours')
ON CONFLICT (id) DO NOTHING;
