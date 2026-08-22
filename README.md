# Margin — Safe to Spend

Margin is a full-stack household cash-flow planner that answers a simpler and
more useful question than “How much is in my account?”:

> How much is genuinely safe to spend after bills, irregular costs, savings,
> and spending already made this month?

**Live app:** [margin-safe-spend.mariokoshn.chatgpt.site](https://margin-safe-spend.mariokoshn.chatgpt.site)

![Margin social preview](public/og.png)

## The model

```text
safe to spend = net income
              − monthly commitments
              − annual and quarterly costs normalised per month
              − protected savings
              − flexible spending already made
```

Money is stored as integer cents in the database to avoid floating-point
rounding errors. The UI converts yearly costs with `amount / 12` and quarterly
costs with `amount / 3`, then calculates a daily safe allowance until payday.

## Features

- Responsive financial control-centre dashboard
- “Can I afford it?” purchase decision engine
- Purchase impact expressed in safe-spending days
- Monthly normalisation of yearly and quarterly commitments
- Editable income, savings target, spending, and payday horizon
- Add and delete household commitments
- Persistent Cloudflare D1 storage
- Validated REST API routes
- Drizzle schema and SQL migration with demo data
- Open Graph and Twitter social metadata

## Stack

- React 19 and Next.js-compatible App Router
- Vinext and Vite
- TypeScript
- Cloudflare Workers and D1
- Drizzle ORM
- Tailwind CSS 4 toolchain with a custom responsive design system

## Architecture

```text
React dashboard
    │
    ├── GET/POST /api/bills
    ├── DELETE   /api/bills/:id
    └── GET/PUT  /api/profile
                    │
                    └── Drizzle ORM → Cloudflare D1
```

## Run locally

Requirements: Node.js 22.13 or newer and a Linux environment.

```bash
npm ci
npm run dev
```

Open the local URL printed by Vite. The project scripts provide a development
D1 binding matching the production `DB` binding declared in
`.openai/hosting.json`.

Useful commands:

```bash
npm run db:generate  # generate SQL after schema changes
npm run lint         # lint the codebase
npm test             # build and run the rendered HTML test
```

## Data model

- `bills`: commitment name, amount in cents, frequency, category, due day, colour
- `profiles`: income, savings target, flexible spending, and days until payday

This is a planning tool, not financial advice.
