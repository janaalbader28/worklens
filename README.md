# WorkLens

**All tasks, in sight.**

WorkLens is a prototype workforce capacity-management platform. It demonstrates how a
unified supervisor/employee experience can sit on top of an organization's existing
systems — showing who's working on what, who has capacity, and what comes next —
without requiring those systems to change.

This is a demo built with simulated organizational data. Nothing here is a real
integration; it's a working prototype meant to show the product concept end to end.

## The two-layer concept

The app is split into two conceptual layers, and the UI deliberately keeps them
looking distinct:

- **Enterprise Systems** (`/systems/*`) — mock source-of-truth systems an org already
  has: an **HR System** (employee master data), an **IT Ticket System**, **FLOW**
  (project/task tracking) and **SDLC** (development activity tracking). Each has its
  own look, its own "Sync" affordance, and its own data.
- **WorkLens** (`/worklens`, `/supervisor/*`, `/employee/*`) — the unified capacity
  platform supervisors and employees actually use, built from data that flows in from
  the systems above.

A core rule baked into the data model: **tickets are assigned to a unit, not a
person.** The IT Ticket System only knows which team owns a piece of work; deciding
which employee on that team actually picks it up happens inside WorkLens, on the
Supervisor **Tasks** page.

## Getting started

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) — this is the Enterprise Systems
gateway. From there, the **Enterprise Systems** button in the WorkLens header (or the
sidebar, once inside the app) gets you back to it.

## Demo accounts

No real authentication — both login screens just let you pick an identity.

- **Supervisor**: `supervisor@worklens.demo` / `demo123` (Nasser Al-Fahad, managing
  the IT Service Support unit)
- **Employee**: pick any employee shown on the login screen (IT Service Support unit,
  matching the supervisor above)

## How the demo data works

Each source system persists its own data to `localStorage` in the browser, simulating
a real system holding its own records. Ticket assignment is the one place data
crosses from an Enterprise System into WorkLens live, without a manual sync step —
the same way an HR System hire or profile edit is immediately reflected in WorkLens
employee lists.

Because state lives in the browser, **clearing site data for localhost (or a private
window) resets the demo back to its seed data.**

## Key pages

| Area | Pages |
|---|---|
| Enterprise Systems | Gateway (`/`), HR System, IT Ticket System, FLOW, SDLC |
| WorkLens | Landing page, Supervisor login, Employee login |
| Supervisor | Dashboard, Team Capacity, Calendar, Tasks, What-If Simulator, Handover Planner |
| Employee | Dashboard, My Work, My Skills, Handover Requests |

## Tech stack

- [Next.js](https://nextjs.org) 16 (App Router, Turbopack)
- React 19 + TypeScript
- Tailwind CSS v4
- [Recharts](https://recharts.org) for charts, [lucide-react](https://lucide.dev) for icons

## Scripts

```bash
npm run dev      # start the dev server
npm run build    # production build
npm run start    # run the production build
npm run lint     # eslint
```
