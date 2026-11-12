# opencode-agents

Eric's OpenCode setup, versioned: the agent and delegation definitions, the skills
they use, the configuration that binds them, and the `Native` sidebar plugin that
shows which agents are working.

The agents are the point. They replaced an ad-hoc mix of custom and native
definitions with one canonical set: an `orchestrator` that routes work, read-only
specialists for local search and review, and `general` for implementation.

```
agents/          agent and delegation definitions (the source of truth)
skills/          reusable skills those agents invoke
config/          opencode.jsonc, cli.json, and the runtime AGENTS.md
plugin/          the Native sidebar plugin (OpenCode v2 TUI)
scripts/         install.sh (plugin) and link-config.sh (config)
```

## Install

Two independent halves. The config is symlinked so edits are live and versioned;
the plugin is installed as a checkout because a package install cannot update
reactively ([issue #1](https://github.com/nitsuga/opencode-agents/issues/1)).

```bash
git clone git@github.com:nitsuga/opencode-agents.git
cd opencode-agents
./scripts/link-config.sh     # agents/, skills/, config/ -> ~/.config/opencode
./scripts/install.sh         # plugin -> ~/.local/share/opencode-agents/plugin
```

Both are idempotent and take `--check` to report drift without changing anything.

`scripts/link-config.sh` links `agents/`, `skills/`, `config/AGENTS.md`, and
`config/opencode.jsonc`. It deliberately does **not** touch `cli.json` or
`service.json`: OpenCode rewrites `cli.json` when it persists TUI settings, and
`service.json` holds the server password. The `plugins` entry in `cli.json` is
`install.sh`'s job.

## Install

```bash
git clone git@github.com:nitsuga/opencode-agents.git
cd opencode-agents
./scripts/install.sh
```

The script clones (or fast-forwards) a checkout at
`~/.local/share/opencode-agents/plugin`, installs its dependencies, and points
`plugins` in `~/.config/opencode/cli.json` at it. Re-run it to update; `--check`
verifies the configured install is intact; `--target DIR` installs elsewhere.

Doing it by hand is the same three steps: put a checkout somewhere stable, run
`npm ci --omit=dev`, and add the **directory** (not a file) to `cli.json`:

```json
{
  "$schema": "https://opencode.ai/config.json",
  "plugins": ["/home/eric/.local/share/opencode-agents/plugin"]
}
```

That directory must have `tui.tsx` at its root, and its `package.json` must not
carry an `exports` field — with one, the host resolves the part by package name,
which only works for an installed package, and a checkout silently loads nothing.

### Why not a package install

Installing this repo as a package (`opencode plugin add
github:nitsuga/opencode-agents`) *loads* — the host resolves `tui.tsx` and
the panel's first paint renders. But **no reactive update ever reaches the
renderer**: not from the plugin's signals, and not from the host's own `storage`
store. Measured on OpenCode 2.2.7: a checkout shows all agents updating live; the
installed package renders once with whatever the first paint saw and then stays
frozen. Tracked in [issue #1](https://github.com/nitsuga/opencode-agents/issues/1);
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
