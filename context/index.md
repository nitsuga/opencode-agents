---
okf_version: "0.2"
---

# opencode-agents Knowledge Bundle

Agent-facing knowledge base for this project, in
[OKF](https://github.com/GoogleCloudPlatform/knowledge-catalog/blob/main/okf/SPEC.md)
v0.2. The agent owns this directory; humans curate sources and direct the work.

Read [`CONVENTIONS.md`](./CONVENTIONS.md) before ingesting or editing.

## Bundle guide

* [Conventions](./CONVENTIONS.md) — frontmatter, types, linking, ingest/query/lint rules.
* [Why these rules](./workflow-rationale.md) — the failure mode behind each
  planning-hygiene rule in `AGENTS.md`. Read before relaxing one.

## References

_(`type: Reference` — synthesis of an external source, citing the immutable original in `../references/`.)_


## Concepts

_(`type: Concept` — durable domain / design knowledge.)_

* [Plugin architecture](./decisions/0002-single-tui-plugin.md) — how the panel gets
  its roster, activity, and layout in v2 (recorded as an ADR rather than prose).
* [Agent roster](./decisions/0004-consolidate-agent-roster.md) — why the roster is
  the canonical v2 agents with our prompts, and what that trades off.

## Components

_(`type: Component` — modules / subsystems of the project.)_

* [`agents/`](../agents/) — the agent and delegation definitions: `orchestrator`
  (read-only router), `explore` (merged research brief over the built-in),
  `general` (implementation discipline over the built-in), `oracle`, `designer`,
  `observer`. Symlinked into `~/.config/opencode/agents`.
* [`skills/`](../skills/) — the skills those agents invoke.
* [`config/`](../config/) — `opencode.jsonc` (models, permissions, MCP),
  `cli.json` (TUI), and the runtime `AGENTS.md`.
* [`plugin/tui.tsx`](../plugin/tui.tsx) — the sidebar plugin: slot claim, roster,
  activity, rendering. No server part and no sidecar state.

## Decisions

_(`type: Decision` — ADRs: the *why* of resolved forks.)_

* [Decisions register](./decisions/index.md) — ADRs grouped under `decisions/`.

