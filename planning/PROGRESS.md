# opencode-native-sidebar — Progress

Current status only — **present tense, volatile, rewrite freely**. The
chronological history (what landed when, decision detail) lives in
[`../context/log.md`](../context/log.md); the decided-fork register is
[`../context/decisions/index.md`](../context/decisions/index.md); the plan is
[ROADMAP.md](./ROADMAP.md). This file does not re-narrate the past.

## Now

Installed at `~/.local/share/opencode-native-sidebar` by `scripts/install.sh`,
which keeps `cli.json` pointing at a checkout — the only path that renders live.
The panel lists every visible agent with its model variant and spins for the
agents actually working.

## In progress

- Nothing mid-change.

## Next

1. Re-test a package install once [issue #1](https://github.com/nitsuga/opencode-native-sidebar/issues/1)
   (no reactive updates from an installed package) is resolved, and switch
   `scripts/install.sh` over if it is.

## Known gaps

- Real distribution is blocked by issue #1; the local install is the workaround.
- Terminal-only: the browser and desktop clients need a `gui-experimental` part.
- No automated tests; verification is running OpenCode and watching the panel.
