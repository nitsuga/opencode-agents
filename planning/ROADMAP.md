# opencode-agents — Roadmap

The plan: scope, sequencing, and **open** forks. Living doc — rewrite freely. For
"where are we right now" see [PROGRESS.md](./PROGRESS.md). Resolved forks and
their rationale live in [`../context/`](../context/) as `type: Decision` concepts;
the **decided register** (fork # ↔ ADR ↔ status) is
[`../context/decisions/index.md`](../context/decisions/index.md). This file does
not duplicate it — it tracks scope, phases, and forks still open.

## Scope

A sidebar panel for the OpenCode v2 terminal TUI, listing agents with their model
variants and live activity.

- **In**: the TUI panel, its roster and activity derivation, local plugin loading.
- **Out (for now)**: the browser/desktop UI (a separate `gui-experimental` part
  against the `Panel` registry), any server-side behavior, and the retired v1
  plugin's snapshot-file approach.

## Phases

- **Phase 0 — Port (done)**: single TUI plugin, roster and activity from the host
  data layer, verified in a live session.
- **Phase 1 — Track and consolidate the config (done)**: the agent definitions,
  skills, and configuration are versioned here and symlinked into place (ADR 0003),
  and the roster was reduced to canonical v2 agents with our prompts (ADR 0004).
- **Phase 2 — Distribution (blocked)**: a real plugin install path — npm or a Git
  spec — once the reactivity issue (#1) is resolved.
- **Phase 3 — GUI part (deferred)**: the same panel in the browser and desktop
  clients via the `Panel` registry.

## Open forks

A *fork* is a decision point — a branch in the plan/design that needs a choice
(see [`../context/CONVENTIONS.md`](../context/CONVENTIONS.md) § Decisions).

Status legend: `OPEN` (undiscussed) · `PROPOSED` (Decision concept written,
`decision_status: proposed`) · `DECIDED` / `DEFERRED` (has an ADR — see the
register).

**None open yet.** Genuinely open (undeliberated) forks get a line here until they
have an ADR; once decided they move to the
[register](../context/decisions/index.md) and leave this list. Candidate future
forks (not yet opened) can be listed here too — the single backlog. Incremental
*work* that needs no fork lives in [PROGRESS](./PROGRESS.md) "Next", not here.

Candidates (not yet opened as forks):

- **Agent output panel** ([#2](https://github.com/nitsuga/opencode-agents/issues/2)) —
  show a working agent's output in a `session.panel` instead of navigating to its
  child session (which drops the sidebar). Tabs cannot do this: `tabs.open` and
  `tabs.focus` report success for a child session and do nothing. The open design
  questions are message selection, live streaming, and one panel vs a tab per
  agent.


## Fork lifecycle

When a fork is deliberated, write a `type: Decision` concept in `../context/`
(`decision_status: proposed` → `accepted`), add its row to the decided register
([`../context/decisions/index.md`](../context/decisions/index.md)), and update
PROGRESS. A genuinely open (undeliberated) fork gets a line under **Open forks**
above until it has an ADR.
