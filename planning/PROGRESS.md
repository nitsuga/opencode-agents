# opencode-native-sidebar — Progress

Current status only — **present tense, volatile, rewrite freely**. The
chronological history (what landed when, decision detail) lives in
[`../context/log.md`](../context/log.md); the decided-fork register is
[`../context/decisions/index.md`](../context/decisions/index.md); the plan is
[ROADMAP.md](./ROADMAP.md). This file does not re-narrate the past.

## Now

Loaded from a checkout via `~/.config/opencode/cli.json`, which is the only path
that renders live: the panel lists every visible agent with its model variant and
spins for the agents actually working.

## In progress

- Nothing mid-change.

## Next

1. Report the package-install reactivity limitation upstream (OpenCode 2.2.7:
   installed plugins get no re-render), then re-test on a later host build.

## Known gaps

- Installed packages (`github:`/npm) paint once and then freeze — see ADR 0002.
  This blocks real distribution.
- Terminal-only: the browser and desktop clients need a `gui-experimental` part.
- No automated tests; verification is running OpenCode and watching the panel.
