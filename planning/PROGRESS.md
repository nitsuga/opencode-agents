# opencode-agents — Progress

Current status only — **present tense, volatile, rewrite freely**. The
chronological history (what landed when, decision detail) lives in
[`../context/log.md`](../context/log.md); the decided-fork register is
[`../context/decisions/index.md`](../context/decisions/index.md); the plan is
[ROADMAP.md](./ROADMAP.md). This file does not re-narrate the past.

## Now

The roster runs on canonical v2 agents: `orchestrator` routes work, `explore`
researches (local tree and external sources under one brief), `general`
implements, and `oracle`, `designer`, `observer` cover review, UI, and media. The
config and agent definitions are tracked here and symlinked into
`~/.config/opencode`, so edits land on the next turn of a running session.

The sidebar panel lists each agent with its model variant and spins for the agents
actually working; the header collapses to `▶ Agents (8 · ⠹ 1 working)`, a click on
a working agent shows its output, and `<leader>o` returns to the orchestrator.

## In progress

- Nothing mid-change.

## Next

1. Revisit the variant pins after a week of real use — the open question is whether
   `designer` earns `luna#xhigh` and `observer` is fine at `luna#medium`.
2. Re-test a package plugin install once
   [issue #1](https://github.com/nitsuga/opencode-agents/issues/1) is resolved.

## Known gaps

- Real plugin distribution is blocked by issue #1; the local install is the
  workaround.
- Terminal-only: the browser and desktop clients need a `gui-experimental` part.
- No automated tests; verification is running OpenCode and watching behavior.
