@AGENTS.md
# PC Pilot — Master Project Context

## 1. What PC Pilot Is

PC Pilot is an AI-powered PC component recommendation engine and web application.

The goal is to let users describe/select their intended PC usage and hardware requirements, then have PC Pilot recommend the most appropriate components based on performance, compatibility, price, and workload.

The project is currently focused heavily on CPUs and GPUs, with the database and recommendation engine being built out first.

The project is not just a static product catalog. The long-term goal is a genuine recommendation system that understands the user's workload and requirements and dynamically determines which components make the most sense.

---

## 2. Development Style

Practical, direct help only.

Always:

* Get straight to the point.
* Give the actual answer first.
* No unnecessary introductions.
* No corporate/buzzword language.
* No excessive explanations unless asked.
* Don't repeat information already given.
* Don't pad responses with generic advice.
* No "Absolutely!", "Great question!", "Let's dive in!", etc.
* Don't over-explain simple things.
* When something is wrong, say directly what's wrong and how to fix it.
* When something works, say so and move on.
* Prefer concrete instructions over theory.
* When giving code changes, clearly identify the file and what needs to change.
* When giving SQL, give complete executable SQL whenever practical.
* Preserve existing functionality unless explicitly asked to change it.
* Don't randomly redesign parts of the project.
* Don't introduce unnecessary libraries, frameworks, abstractions, or architectural changes.

If asked "which files need changing?" — answer with files and why.
If asked "will this SQL work?" — answer whether it works, what it does, and any issues.
If asked for code — give exact code, say where it goes, no tutorial unless necessary.

---

## 3. Current Technology Stack

* Next.js
* React
* TypeScript
* Supabase (backend/database)
* Tailwind/CSS where applicable
* VS Code
* GitHub
* Vercel
* Claude Code / AI coding assistants
* Apify (scraping)
* PostHog
* Sentry
* Figma

---

## 4. Current Project Architecture

Key frontend files (paths may evolve — inspect repo before assuming):

* `app/page.tsx`
* `app/api/recommend/route.ts`
* `components/FilterBar.tsx`
* `components/ProductCard.tsx`
* `app/supabaseClient.ts`
* `sync.py` (Apify → Supabase scraping script, NOT part of the Next.js app)

Do NOT assume an old architecture is still present if the actual codebase shows otherwise. Always inspect the current implementation before proposing major changes.

---

## 5. Database Architecture — IMPORTANT

Originally one universal `products` table containing both CPUs and GPUs. This was deliberately replaced.

### Current structure

* `cpus` — CPU products only
* `gpus` — GPU products only

No universal `products` table should be used for both categories. No redundant `category` column — the table itself determines category.

Do not revert this architecture unless explicitly requested.

**Known gap:** `sync.py` has NOT been migrated yet — it still writes to a single `products` table with a `category` column. This is stale and contradicts the current architecture. Needs updating to write to `cpus`/`gpus` directly.

---

## 6. CPU Database — DONE

Fields implemented:

* `cpu_cores_threads`
* `cpu_boost_clock`
* `cpu_tdp`
* `cpu_benchmark_cinebench_r23_multi`

Examples: cores/threads `16/32`, boost clock `5.7GHz`, TDP in watts, Cinebench R23 multicore as integer score.

CPU table retains original product info from the old `products` table.

**Note:** i9-13900KS data was manually corrected during data cleaning — don't blindly overwrite without checking first.

---

## 7. GPU Database — IN PROGRESS (current priority)

Planned fields:

* VRAM capacity & type (e.g. 12GB GDDR7)
* Memory bus width
* TDP
* Ray tracing support
* DLSS / FSR / XeSS version support
* Benchmark score (Timespy/etc.)

Schema should be derived from what the recommendation engine actually needs — don't collect specs for their own sake.

---

## 8. Product ID History (legacy, not architectural)

Old combined table had roughly: CPUs ~842–942, GPUs ~937–1201. These overlapped because the table wasn't split yet. Irrelevant now that tables are separate — don't treat as meaningful.

---

## 9. Display / Resolution / Refresh Rate Inputs — DONE

Resolution options: `All, 1080p, 1440p, 4K`.

Principle:

* Higher refresh rate → stronger CPU weighting
* Higher resolution → stronger GPU weighting

Implemented in `app/api/recommend/route.ts` via `cpuWeight`/`gpuWeight`/`displayProfile` logic, fed from `FilterBar.tsx` resolution + refresh rate inputs.

---

## 10. Recommendation Engine

Core differentiator. Should NOT simply recommend the most powerful/expensive part — should determine what makes sense for the user's actual workload and budget.

Factors to eventually weigh: resolution, refresh rate, workload type, CPU/GPU performance, price, performance-per-dollar, compatibility, thermals/power, budget.

### Architectural separation (important)

* **Data layer** — Supabase/database. Source of truth for specs/prices.
* **Recommendation layer** — deterministic scoring, filtering, compatibility, pricing, benchmarks.
* **AI layer** — natural-language interpretation and explanation only. Must NOT invent specs/products — always pulls from the database.

---

## 11. Data Scraping & Quality

`sync.py` scrapes Apify dataset, normalizes, upserts into Supabase.

Expect from scraped data: inconsistent naming, missing fields, different units, duplicates, retailer-specific naming, incorrect specs, formatting inconsistencies.

**Data quality > data quantity.** When adding data:

* Preserve correct existing data.
* Don't overwrite manually corrected values without checking.
* Normalize units.
* Maintain consistent naming.
* Avoid duplicate products.
* Validate suspicious values.
* Keep benchmark methodology consistent.

**Security note:** `sync.py` and `supabaseClient.ts` currently have hardcoded API keys (Apify token, Supabase anon key) in source. Supabase anon key is normal client-side if RLS is configured correctly, but the Apify token should move to env vars — flagged, not yet fixed.

---

## 12. SQL Rules

* Make it executable.
* State clearly whether it creates, alters, deletes, migrates, or updates data.
* Be extremely careful with destructive queries — explicitly flag anything that can delete/overwrite data.
* Prefer migrations that preserve existing data.
* Don't create duplicate columns/tables unnecessarily.
* Don't reintroduce the old `products` architecture.
* Don't add a `category` column to `cpus` or `gpus`.

---

## 13. Coding Rules

Prefer: simple, readable code, existing project conventions, minimal dependencies, maintainable components, type safety, reusable logic where it genuinely helps.

Avoid: unnecessary abstractions, massive refactors for small features, unnecessary packages, over-engineering, rewriting working code without reason.

---

## 14. Debugging Rules

1. What is failing?
2. Where is it failing?
3. What data is being passed?
4. What does the code expect?
5. What does the database actually contain?
6. What is the smallest fix?

Use actual error messages/screenshots/terminal output rather than guessing.

---

## 15. Git / Project Safety

Avoid destructive changes unless explicitly requested. Before recommending deleting tables, dropping columns, deleting products, rewriting large sections, or changing database architecture — explain exactly what will happen. Preserve working functionality.

---

## 16. Workflow Expectations

When given a task:

1. Inspect the existing implementation.
2. Understand how it currently works.
3. Identify exactly what needs changing.
4. Make the smallest sensible change.
5. Preserve existing functionality.
6. Explain what changed.
7. Explain how to test it.

If multiple files need changing, list them explicitly with reasons before making changes.

The actual repository is the source of truth for implementation details — this doc describes goals, architecture, history, and preferences. If code contradicts this doc, inspect the code and flag the discrepancy rather than assuming.

---

## 17. Communication Style

Straight to the point. No buzzwords, corporate language, filler, fake enthusiasm, repetitive explanations, or walls of text for simple questions.

Use: direct answers, concise explanations, exact file names, exact SQL, exact code, numbered steps when needed, tables when comparing things, warnings only when they matter.

---

## 18. About Me

Senior Director at NVIDIA. Building PC Pilot as a serious software project alongside office work. Comfortable with technical concepts — no need to explain basics unless asked. Explain unfamiliar architecture/technology clearly when it comes up.

---

# 🚀 Roadmap

## 1. Live Pricing & Data Pipeline

**Scheduled Scraping**
* Interval-based scraping, configurable refresh (1–6 hrs)
* Support multiple retailers in future

**Price History**
* Store historical prices
* "Price Dropped" indicators
* Price trend graphs (future)

**Backend Reliability**
* Retry failed scrapes
* Fallback to last known valid data
* Display last-updated timestamp
* Prevent incomplete data from reaching users

## 2. Affiliate Integration

* Newegg Affiliate Program application, replace direct links
* Centralized affiliate link generation, scalable to Amazon/Best Buy/Canada Computers/Memory Express

## 3. Hardware Database

**CPU Specs — DONE:** cores/threads, boost clock, TDP, benchmark score

**GPU Specs — TODO:** VRAM capacity & type, memory bus width, TDP, ray tracing support, DLSS/FSR/XeSS version support, benchmark score

## 4. UI/UX Overhaul

Modern design system, defined color palette, accent colors, card-based layouts, spacing/typography, animations, responsive design, dark/light mode, cleaner dashboard.

(Sequencing note: do this after GPU specs + Evaluate Choices are functional, not before — avoids re-skinning components twice.)

## ⭐ Flagship Feature — Evaluate Choices

User manually enters any CPU + GPU combo → full performance evaluation. This is a hardware analysis engine, not just a recommender.

**Overall Build Score (0–100)**, weighted metrics, displayed as percentage bars.

Universal metrics: CPU/GPU balance, price-to-performance, power efficiency, upgradeability, estimated system power draw.

Personalized metrics (weights shift by use case): gaming performance, esports performance, productivity, AI performance, content creation.

**FPS Estimation Engine (core feature, hardest data problem)**
* Support popular games
* Resolution (1080p/1440p/4K), preset (Low–Ultra), ray tracing on/off, upscaling (DLSS/FSR/XeSS/off)
* Output: average FPS (range, not single number), 1% lows, cost per frame
* **Open decision:** scrape/license real benchmark data (TechPowerUp, Tom's Hardware — inconsistent methodology) vs. build a regression/estimation model off relative performance tiers. Decide before building schema.

**Target Display Experience — DONE**
* Resolution + refresh rate selection → fed into recommendation engine → dynamic CPU/GPU weighting (higher refresh = more CPU, higher resolution = more GPU)

**Bottleneck Analysis**
* CPU limited / GPU limited / Balanced
* Severity: Minimal / Moderate / Significant
* Short explanation

**Benchmark Section**
* CPU benchmark score, GPU benchmark score, combined system performance, performance percentile

---

## Suggested Build Order

1. GPU database schema + population
2. Price pipeline / scraping reliability (parallel-safe with #1)
3. Affiliate integration (parallel-safe with #1/#2)
4. Evaluate Choices — Build Score + Bottleneck Analysis first
5. FPS Estimation Engine (data source decision required first)
6. UI/UX overhaul
7. Compatibility engine / full PC builder / additional component categories (future)

---

## Apps in Use

VS Code, Supabase, Claude Code, Apify, GitHub, Vercel, PostHog, Sentry, Figma