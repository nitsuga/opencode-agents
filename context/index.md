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

## Components

_(`type: Component` — modules / subsystems of the project.)_

* `tui.tsx` — the whole plugin: slot claim, roster, activity, rendering. No server
  part and no sidecar state.

## Decisions

_(`type: Decision` — ADRs: the *why* of resolved forks.)_

* [Decisions register](./decisions/index.md) — ADRs grouped under `decisions/`.

