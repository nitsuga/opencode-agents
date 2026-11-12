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

## In progress

- Nothing mid-change.

## Next

1. Watch whether `explore` at `#low` holds up now that it also does external
   research; raise it to `#high` in `config/opencode.jsonc` if it does not.
2. Re-test a package plugin install once
   [issue #1](https://github.com/nitsuga/opencode-agents/issues/1) is resolved.

## Known gaps

- Real plugin distribution is blocked by issue #1; the local install is the
  workaround.
- Terminal-only: the browser and desktop clients need a `gui-experimental` part.
- No automated tests; verification is running OpenCode and watching behavior.
