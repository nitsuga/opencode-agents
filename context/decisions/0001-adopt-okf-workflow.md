---
type: Decision
title: Adopt the OKF documentation workflow
decision_status: accepted
tags: [decision, meta, docs]
fork: 0
generated:
  by: deepseek/deepseek-flash
  at: 2026-11-12T18:05:00Z
---

# Context

This project started as a single-file plugin ported from OpenCode v1. Most of the
knowledge that made the port possible — how v2 loads plugins, which modules the
host provides, why the panel is two lines per agent — was hard-won in a session
and would be re-derived from scratch by the next agent, or lost entirely.

# Decision

Adopt the OKF-based agent documentation workflow from `okf-project-template`:
a `context/` knowledge bundle, ADRs for resolved forks, and `planning/` for the
live plan, with `AGENTS.md` as the canonical instruction file.

# Consequences

- Every significant change updates `context/log.md` and `planning/PROGRESS.md` in
  the same commit as the code.
- Design knowledge that would otherwise live in commit messages or a chat session
  goes into an ADR. ADR 0002 is the first real one: the port's architecture and
  the host behaviors that constrain it.
