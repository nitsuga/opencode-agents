# opencode-native-sidebar

An OpenCode v2 TUI plugin: a **Native** panel in the terminal sidebar listing every
agent with its model variant, and a spinner next to whichever agents are working
right now.

```
Native
orchestrator   ⠹ #high
  muse-spark-1.3-contributor
Build
  default
Explore        ⠋ #low
  muse-spark-1.3-contributor
oracle         #high
  deepseek-v4.1-flash
```

Ported from the OpenCode **v1** plugin of the same name. The v1 version had two
halves: a server plugin that polled the agent roster into
a per-project snapshot under `storage/native-sidebar/` every 10 seconds, and a TUI
plugin that rendered the snapshot into v1's `sidebar_content` slot. Neither is
needed in v2 — the host already publishes the roster and the activity state — so
this is a single TUI plugin with no server part and no sidecar file.

## Install

```bash
git clone git@github.com:nitsuga/opencode-native-sidebar.git
cd opencode-native-sidebar
./scripts/install.sh
```

The script clones (or fast-forwards) a checkout at
`~/.local/share/opencode-native-sidebar`, installs its dependencies, and points
`plugins` in `~/.config/opencode/cli.json` at it. Re-run it to update; `--check`
verifies the configured install is intact; `--target DIR` installs elsewhere.

Doing it by hand is the same three steps: put a checkout somewhere stable, run
`npm ci --omit=dev`, and add the **directory** (not a file) to `cli.json`:

```json
{
  "$schema": "https://opencode.ai/config.json",
  "plugins": ["/home/eric/.local/share/opencode-native-sidebar"]
}
```

That directory must have `tui.tsx` at its root, and its `package.json` must not
carry an `exports` field — with one, the host resolves the part by package name,
which only works for an installed package, and a checkout silently loads nothing.

### Why not a package install

Installing this repo as a package (`opencode plugin add
github:nitsuga/opencode-native-sidebar`) *loads* — the host resolves `tui.tsx` and
the panel's first paint renders. But **no reactive update ever reaches the
renderer**: not from the plugin's signals, and not from the host's own `storage`
store. Measured on OpenCode 2.2.7: a checkout shows all agents updating live; the
installed package renders once with whatever the first paint saw and then stays
frozen. Tracked in [issue #1](https://github.com/nitsuga/opencode-native-sidebar/issues/1);
until it behaves, use the checkout path (`scripts/install.sh`).

Two further packaging gotchas, both load-blocking:

- **JSX runtime per file.** Bun does not apply a project `tsconfig.json` to files
  under `node_modules`, so a package install compiles JSX against the React
  runtime and fails with `Cannot find package 'react'`. `tui.tsx` therefore
  carries a `/** @jsxImportSource @opentui/solid */` pragma.
- **Control flow does not reconcile** in a package install: `<For>`/`<Show>`
  children never render, while intrinsic `<text>`/`<box>` do. The panel is
  therefore one reactive text node rather than mapped children.

## Use

The sidebar is toggled with `ctrl+x b` (leader `ctrl+x`). Its open/closed state
persists between runs, so a single toggle may close rather than open it.

An agent spins only while a session in its family is running with that agent: the
orchestrator spins while it waits for a subagent, the spawned `scout` spins while
it works, and everything else stays blank.

## Develop

```bash
npm install
npx tsc --noEmit
```

There is no build step. OpenCode loads `tui.tsx` through its Bun runtime, so JSX
compiles at import and the host reloads the plugin when the file changes.

## Layout

| Path | Role |
|---|---|
| `tui.tsx` | The whole plugin: slot claim, roster, activity, rendering. |
| `package.json` | Dependencies pinned to the host's versions (`@opencode/plugin` 2.2.7, `@opentui/*` 0.8.4, `solid-js` 1.9.19). |
| `context/`, `planning/` | Agent knowledge bundle and plan — see `AGENTS.md`. |
| `references/`, `docs/` | Sources and human-facing guides. |

## License

0BSD — see [LICENSE](./LICENSE).
