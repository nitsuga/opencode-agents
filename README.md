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

TUI-only plugins are configured separately from server plugins, in
`~/.config/opencode/cli.json`:

```json
{
  "$schema": "https://opencode.ai/config.json",
  "plugins": ["/home/eric/workspaces/opencode-native-sidebar"]
}
```

The entry points at a **directory**, not a file. That directory must contain
`tui.tsx` at its root: when a local plugin's `package.json` has both `name` and
`exports`, the host resolves the part through the package name instead, which
fails for a directory that is not installed in a `node_modules`.

A published package can be installed instead with
`opencode plugin add nitsuga/opencode-native-sidebar` (npm or Git specs are
accepted; filesystem paths are not).

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
