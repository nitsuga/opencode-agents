---
type: Decision
title: Consolidate the agent roster onto canonical v2 agents
decision_status: accepted
tags: [decision, agents, delegation]
fork: 4
generated:
  by: deepseek/deepseek-flash
  at: 2026-11-12T18:35:00Z
---

# Context

Six custom agents duplicated capabilities OpenCode v2 ships. Comparing the two
rosters turned up three facts that shaped the choice:

- **`build` is `primary`.** A subagent runs "only in a child session through the
  subagent tool"; only `mode: all` works both ways. The orchestrator is read-only
  (edit and shell denied), so it cannot delegate to `build` — the canonical
  *delegated implementer* is `general`, a subagent with broad tools that cannot
  spawn more subagents. Our config had `general` **disabled**.
- **`explore` covers more than its name suggests** — the docs describe it as
  searching "code or web sources" — so the custom `scout` (external docs and
  upstream research) overlapped it in domain.
- **Built-ins can be overridden** by a same-ID definition: definitions merge and
  `system` is a scalar, so a body in `agents/<id>.md` replaces that agent's prompt.

The custom files were not merely redundant, though. `scout` carried a research
brief (primary sources, version pinning, report shape) and denied shell; `fixer`
carried the implementation discipline (minimal diff, honest validation reporting,
no design work, no delegation, fixed report shape). `general` and `explore` ship
with no such prompt — `explore`'s native brief is a file-search prompt, a poor fit
for "what changed in this library at v3.2".

# Decision

Adopt the canonical agents and keep the discipline in their prompts:

- **`scout` is gone.** External research routes to `explore`.
- **`agents/explore.md`** overrides the built-in: a merged brief covering local
  discovery (files, call paths, conventions) and external sources (primary
  documentation, upstream code, versions, URLs), read-only, shell denied.
- **`agents/general.md`** replaces `fixer.md` under the canonical id, enabling the
  built-in and keeping the implementation discipline as its prompt.
- `config/opencode.jsonc`: `scout` and `fixer` model entries removed, `general`
  enabled and pinned to `muse-spark #high` (what `fixer` ran), `explore` left at
  `#low`.
- `orchestrator.md`: allowlist `general` in place of `fixer`, drop `scout`, and
  route external research to `explore` in the prose.

Resulting roster: `orchestrator` (ours, read-only router) plus `explore` and
`general` (canonical ids, our prompts) and `oracle`, `designer`, `observer` (ours,
no native equivalent).

# Alternatives considered

1. **Delete both custom agents and use the natives untouched.** Rejected: `general`
   has no system prompt at all, so the implementation discipline disappears, and
   `explore`'s file-search brief is wrong for documentation research.
2. **Keep `scout` and `fixer`.** Rejected: it leaves two parallel definitions of
   capabilities the host already ships, which is the redundancy this removes.
3. **Set `build` to `mode: all` and delegate to `build`.** Rejected: it mutates the
   default coding agent's mode globally to gain nothing — `build` still has no
   implementation-discipline prompt.
4. **Switch `default_agent` to `build` and drop `orchestrator`.** Deferred, not
   rejected: it is a larger change to how sessions are driven (the orchestrator's
   read-only routing is deliberate) and belongs in its own decision.

# Consequences

- `explore` and `general` are now *custom prompts over canonical agents*. Future
  OpenCode releases may change those agents' native behavior, modes, or permission
  defaults underneath our overrides; re-read this ADR when upgrading.
- `explore` moved from `#low` to `#medium` once it absorbed external research;
  `designer` went to `luna#xhigh` and `observer` down to `luna#medium`. `oracle`
  stays at `deepseek#high` deliberately — higher rungs showed diminishing quality
  per token and per second. The roster table and the reasoning behind each pin live
  in [`../agents.md`](../agents.md).
- Sessions created earlier that named `scout` or `fixer` reference agents that no
  longer exist; new turns use the canonical roster.
- The orchestrator's brief-writing rules now name `general`; the discipline those
  rules rely on lives in `agents/general.md`.
