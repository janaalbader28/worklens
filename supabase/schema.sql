-- WorkLens shared backend schema.
--
-- Run this once in the Supabase project's SQL editor (Database > SQL Editor >
-- New query). Safe to re-run: tables use IF NOT EXISTS, policies are dropped
-- and recreated, and the realtime publication grant is wrapped to ignore
-- "already added" errors.
--
-- Column names intentionally match the app's existing TypeScript field names
-- exactly (camelCase, quoted) rather than the usual snake_case Postgres
-- convention — this lets every store read/write rows with zero mapping code
-- between the DB and the `Employee` / `Ticket` / etc. types already used
-- throughout the app.

-- ============================================================================
-- Tables
-- ============================================================================

create table if not exists employees (
  id text primary key,
  name text not null,
  title text not null,
  department text not null,
  "supervisorId" text,
  "employeeIdNumber" text,
  email text,
  "availabilityOverride" text,
  "supervisorNameOverride" text,
  skills jsonb not null default '[]',
  "knowledgeAreas" jsonb not null default '[]',
  "workingSchedule" text,
  "weeklyHours" integer,
  workload jsonb not null default '{}',
  "currentUtilization" integer,
  "futureCapacity" integer,
  "forecast8Week" jsonb not null default '[]',
  "upcomingProjects" jsonb not null default '[]',
  "upcomingTickets" jsonb not null default '[]',
  adhoc jsonb not null default '[]',
  "leaveEvents" jsonb not null default '[]',
  "createdAt" timestamptz not null default now(),
  "updatedAt" timestamptz not null default now()
);

create table if not exists tickets (
  id text primary key,
  title text not null,
  description text,
  status text not null,
  priority text not null,
  "assignedUnit" text not null,
  "assignedEmployeeId" text,
  "raisedDate" text,
  "estimatedHours" numeric,
  "slaHours" numeric,
  "expectedResolutionDate" text,
  "resolvedDate" text,
  "createdBy" text,
  "assignedBy" text,
  "relatedSkills" jsonb,
  "createdAt" timestamptz not null default now(),
  "updatedAt" timestamptz not null default now()
);

create table if not exists flow_projects (
  id text primary key,
  project text not null,
  task text not null,
  description text,
  "taskDescription" text,
  owner text,
  status text not null,
  priority text not null,
  "assignedUnit" text not null,
  "assignedEmployee" text,
  "estimatedHours" numeric,
  "startDate" text,
  deadline text,
  budget text,
  milestones jsonb not null default '[]',
  "createdAt" timestamptz not null default now(),
  "updatedAt" timestamptz not null default now()
);

create table if not exists sdlc_activities (
  id text primary key,
  application text not null,
  activity text not null,
  description text,
  stage text not null,
  "assignedUnit" text not null,
  "assignedEmployee" text,
  "estimatedHours" numeric,
  "startDate" text,
  deadline text,
  status text not null,
  "relatedMilestone" text,
  "createdAt" timestamptz not null default now(),
  "updatedAt" timestamptz not null default now()
);

create table if not exists handover_requests (
  id text primary key,
  "employeeId" text not null,
  note text,
  "startDate" text,
  "endDate" text,
  "affectedWork" jsonb not null default '[]',
  status text not null,
  "submittedAt" text,
  "createdAt" timestamptz not null default now()
);

create table if not exists work_log_entries (
  "employeeId" text not null,
  "itemId" text not null,
  "workflowStatus" text,
  notes jsonb not null default '[]',
  messages jsonb not null default '[]',
  "updatedAt" timestamptz not null default now(),
  primary key ("employeeId", "itemId")
);

-- ============================================================================
-- Row Level Security
--
-- This is a prototype with no real per-user login (both "supervisor" and
-- "employee" sign-in are identity pickers, not authentication), so policies
-- are intentionally permissive: anyone with the anon key (i.e. anyone with the
-- deployed URL) can read and write every table. There is no delete policy —
-- the app never deletes rows. See the README for this tradeoff.
-- ============================================================================

alter table employees enable row level security;
alter table tickets enable row level security;
alter table flow_projects enable row level security;
alter table sdlc_activities enable row level security;
alter table handover_requests enable row level security;
alter table work_log_entries enable row level security;

-- RLS policies alone aren't enough — Postgres also requires the base table-level
-- privilege grant. New tables don't always inherit Supabase's default grants for
-- anon/authenticated, which surfaces as "permission denied for table X" even with
-- correct RLS policies in place. Grant explicitly so this isn't environment-dependent.
grant select, insert, update on employees, tickets, flow_projects, sdlc_activities, handover_requests, work_log_entries to anon, authenticated;

drop policy if exists "anon select" on employees;
drop policy if exists "anon insert" on employees;
drop policy if exists "anon update" on employees;
create policy "anon select" on employees for select to anon, authenticated using (true);
create policy "anon insert" on employees for insert to anon, authenticated with check (true);
create policy "anon update" on employees for update to anon, authenticated using (true) with check (true);

drop policy if exists "anon select" on tickets;
drop policy if exists "anon insert" on tickets;
drop policy if exists "anon update" on tickets;
create policy "anon select" on tickets for select to anon, authenticated using (true);
create policy "anon insert" on tickets for insert to anon, authenticated with check (true);
create policy "anon update" on tickets for update to anon, authenticated using (true) with check (true);

drop policy if exists "anon select" on flow_projects;
drop policy if exists "anon insert" on flow_projects;
drop policy if exists "anon update" on flow_projects;
create policy "anon select" on flow_projects for select to anon, authenticated using (true);
create policy "anon insert" on flow_projects for insert to anon, authenticated with check (true);
create policy "anon update" on flow_projects for update to anon, authenticated using (true) with check (true);

drop policy if exists "anon select" on sdlc_activities;
drop policy if exists "anon insert" on sdlc_activities;
drop policy if exists "anon update" on sdlc_activities;
create policy "anon select" on sdlc_activities for select to anon, authenticated using (true);
create policy "anon insert" on sdlc_activities for insert to anon, authenticated with check (true);
create policy "anon update" on sdlc_activities for update to anon, authenticated using (true) with check (true);

drop policy if exists "anon select" on handover_requests;
drop policy if exists "anon insert" on handover_requests;
drop policy if exists "anon update" on handover_requests;
create policy "anon select" on handover_requests for select to anon, authenticated using (true);
create policy "anon insert" on handover_requests for insert to anon, authenticated with check (true);
create policy "anon update" on handover_requests for update to anon, authenticated using (true) with check (true);

drop policy if exists "anon select" on work_log_entries;
drop policy if exists "anon insert" on work_log_entries;
drop policy if exists "anon update" on work_log_entries;
create policy "anon select" on work_log_entries for select to anon, authenticated using (true);
create policy "anon insert" on work_log_entries for insert to anon, authenticated with check (true);
create policy "anon update" on work_log_entries for update to anon, authenticated using (true) with check (true);

-- ============================================================================
-- Realtime — lets other devices see writes without a manual refresh.
-- ============================================================================

do $$
begin
  alter publication supabase_realtime add table employees, tickets, flow_projects, sdlc_activities, handover_requests, work_log_entries;
exception
  when duplicate_object then null;
end $$;
