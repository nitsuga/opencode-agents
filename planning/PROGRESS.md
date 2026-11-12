# opencode-native-sidebar — Progress

Current status only — **present tense, volatile, rewrite freely**. The
chronological history (what landed when, decision detail) lives in
[`../context/log.md`](../context/log.md); the decided-fork register is
[`../context/decisions/index.md`](../context/decisions/index.md); the plan is
[ROADMAP.md](./ROADMAP.md). This file does not re-narrate the past.

## Now

The plugin works and is in daily use: the `Native` panel renders every visible
agent with its model variant and spins only for the agents actually working.
Verified in a live session — `orchestrator` spins while it waits, a spawned
`scout` spins alone, and the turn end clears it.

## In progress

- Nothing mid-change.

## Next

1. Decide distribution: publish to npm, or point at the GitHub repo with
   `opencode plugin add nitsuga/opencode-native-sidebar`, instead of the current
   absolute local path in `cli.json`.
2. Add a regression check for the invisible-plugin failure mode (a config that
   resolves `cli.json` but loads zero extra plugins) — see ADR 0002 § Consequences.

## Known gaps

- Terminal-only: the browser and desktop clients need a `gui-experimental` part.
- No automated tests; verification is running OpenCode and watching the panel.
- Dependency pins track the host by hand; a host upgrade can silently break the
  plugin (peer versions above are not enforced anywhere).
