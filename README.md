# Capital Optimization & Risk Control Engine

An automated portfolio allocation and risk-monitoring system built for the
Fintech – Asset & Capital Management hackathon track.

---

## What this does

Given a portfolio's capital and risk preferences, the system:
1. Computes the mathematically optimal allocation across asset classes
   (Equity, Bonds, Gold, Cash) using Modern Portfolio Theory
2. Continuously monitors live/simulated market prices and flags any
   breach of configured risk limits
3. Lets a risk manager preview hypothetical market shocks before
   deciding whether to act on them

---

## Working Application / Engine

**Core logic lives in three pure Python modules, independent of the web
server:**

- `optimizer.py` — runs Markowitz mean-variance optimization
  (via `PyPortfolioOpt`) to find the allocation that maximizes the
  Sharpe ratio, subject to per-asset caps, a single-asset concentration
  limit, and a minimum liquidity floor.
- `risk_engine.py` — computes portfolio volatility and Value at Risk
  (VaR) from recent price returns, and checks them against configurable
  limits stored in the database.
- `price_feed.py` — a background job that ticks every 30 seconds,
  pulling real market prices where available and falling back to a
  simulated random walk when the API is unavailable or rate-limited.

These are wired together by `app.py` (Flask), which exposes them as
REST endpoints:

| Endpoint | Purpose |
|---|---|
| `POST /optimize` | Run optimizer, save new allocation |
| `GET /risk-status/:id` | Live risk check against stored limits |
| `POST /simulate-shock` | Preview a hypothetical market shock (non-destructive) |
| `POST /apply-scenario/:id` | Apply a previously previewed shock's proposed allocation |
| `GET /portfolio/:id`, `/alerts/:id`, `/performance/:id` | Read current state and history |

---

## Interactive UI / Dashboard

Built in React + Tailwind. Key views:
- **Portfolio** — current allocation (pie chart), holdings table, value
  over time
- **Optimisation** — set capital and constraints, run the optimizer,
  see the recommended split with expected return / risk / Sharpe ratio
- **Risk Control** — every configured risk rule shown side-by-side with
  its live current value and breach status, plus a running alert log
- **Scenarios** — pick a stress scenario (market crash, rate shock,
  inflation, or a custom % shock), preview the before/after portfolio
  impact, and apply the system's suggested response with one click

---

## System Architecture & Design Trade-offs

**Two data-access lanes, by design:**
- Simple reads (current holdings, past alerts) go **directly from React
  to Supabase** — no need to round-trip through Flask for a plain table
  lookup.
- Anything requiring computation (optimization, risk evaluation, shock
  simulation) goes **through Flask**, since that logic only exists in
  Python.

**Live monitoring and stress testing share one risk-evaluation function**,
fed two different inputs — real/simulated live price ticks, or a
hypothetical shock the user chooses to preview. This means testing a
scenario never touches real holdings unless the user explicitly applies
it, while live breaches can still auto-escalate.

**Rebalancing is threshold-based, not continuous** — the system only
proposes a new allocation when a configured limit is actually breached,
avoiding the transaction-cost drag of rebalancing on every price tick.

**Scope trade-off:** asset classes are fixed (Equity/Bonds/Gold/Cash)
rather than a fully dynamic user-defined asset list, and holdings are
tracked by weight rather than share count/cost basis — both deliberate
simplifications to keep the optimization and risk logic tractable
within a hackathon timeframe, without weakening the core financial
logic being demonstrated.

---

## Key Risk Metrics Monitored

- **Volatility** — standard deviation of portfolio returns
- **Value at Risk (95% confidence)** — expected worst-case daily loss
- **Concentration limits** — per-asset-class cap, single-asset cap,
  minimum liquidity (cash) floor

All limits are stored per-portfolio in `risk_rules` and are editable,
not hardcoded — the same evaluation function checks them for both live
monitoring and stress testing.

---
