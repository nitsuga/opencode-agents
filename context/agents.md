---
type: Concept
title: Agent roster and model assignments
description: Which agents exist, what each is for, and the model variant each runs at.
tags: [agents, models, delegation]
generated:
  by: deepseek/deepseek-flash
  at: 2026-11-12T18:50:00Z
---

# Roster

| Agent | Mode | Model#variant | Job |
|---|---|---|---|
| `orchestrator` | primary | `muse-spark-1.3-contributor#high` | Read-only router: understands the request, writes briefs, reconciles results |
| `explore` | subagent | `muse-spark-1.3-contributor#medium` | Research: code, tests, call paths inside the tree; docs, upstream, versions outside it |
| `general` | subagent | `muse-spark-1.3-contributor#high` | Implementation: edits, test runs, mechanical follow-up |
| `oracle` | subagent | `deepseek-v4.1-flash#high` | Independent review and hard reasoning |
| `designer` | subagent | `gpt-5.6-luna#xhigh` | UI/UX implementation |
| `observer` | subagent | `gpt-5.6-luna#medium` | Image, screenshot, PDF, and diagram analysis |
| `build`, `plan` | primary (native) | model default | Unused: `default_agent` is `orchestrator`, and primaries cannot be delegated to |

Definitions live in [`../agents/`](../agents/); the model pins live in
[`../config/opencode.jsonc`](../config/opencode.jsonc) under `agents.<id>.model`.

# Why these assignments

- **`orchestrator` at `high`** — it never implements, so its value is routing
  judgment and brief quality. It is the most-called agent, so this is also the most
  expensive pin; `medium` is the obvious economy if briefs stay sharp.
- **`explore` at `medium`** — it started at `low` as a file-finder. Once it absorbed
  external research (ADR 0004) its output became the material the orchestrator
  writes briefs from, which `low` under-serves. `medium` keeps it cheap.
- **`general` at `high`** — implementation is where silent mistakes cost the most;
  the behavioural discipline is in [`../agents/general.md`](../agents/general.md).
- **`oracle` at `high` on a different model family** — `deepseek-v4.1-flash` gives
  review independence from the muse-spark workers. Deliberately **not** raised to
  `max`: higher rungs showed diminishing quality per token and per second.
- **`designer` at `xhigh`** — layout, hierarchy, and interaction judgment are where
  effort pays off, and luna offers the rung.
- **`observer` at `medium`** — describing an image or a diagram is not a
  deep-reasoning task; `high` was over-provisioned.

# Ladder caveat

Variants are **per-model ladders, not comparable levels**:

| Model | Rungs |
|---|---|
| `muse-spark-1.3-contributor` | minimal · low · medium · high · xhigh |
| `deepseek-v4.1-flash` | low · high · max |
| `gpt-5.6-luna` | none · low · medium · high · xhigh · max |

So `#high` means something different on each, and "same as another agent" is not a
reason to pick a rung.

# Delegation

`orchestrator` is read-only — edit and shell denied — and allowlists `explore`,
`general`, `oracle`, `designer`, `observer`. `build` and `plan` are native
*primaries*; a subagent runs only in a child session, so they are not delegation
targets (ADR 0004).

# Changing an assignment

Edit `agents.<id>.model` in [`../config/opencode.jsonc`](../config/opencode.jsonc),
run `opencode reload`, confirm with `GET /api/agent`, and update the table above.
