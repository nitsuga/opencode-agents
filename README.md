# opencode-native-sidebar

An OpenCode v2 TUI plugin: a `Native` panel in the terminal sidebar listing every
agent with its model variant, plus a spinner while the current session runs.

Ported from the OpenCode v1 plugin of the same name. The v1 version had two
halves — a server plugin that polled the agent roster into
`storage/native-sidebar/<scope>/sidebar-state.json` every 10 seconds, and a TUI
plugin that rendered it into v1's `sidebar_content` slot. Neither is needed in
v2: the host already publishes the roster, so this is a single TUI plugin with
no server part and no sidecar file.

## Load

TUI-only plugins are configured separately from server plugins, in
`~/.config/opencode/cli.json`:

```json
{
  "$schema": "https://opencode.ai/config.json",
  "plugins": ["/home/eric/workspaces/opencode-native-sidebar"]
}
```

Points at the directory, not a file. The directory must contain `tui.tsx` (or
`tui.js`) at its root: a `package.json` with both `name` and `exports` makes the
host resolve the part through the package name instead, which fails for a
directory that is not installed in a `node_modules`.

The sidebar is toggled with `ctrl+x b` (leader `b`) and its open/closed state
persists between runs, so a single toggle may close rather than open it.

## Develop

    npm install
    npx tsc --noEmit

`tui.tsx` is loaded directly by OpenCode's Bun runtime, so there is no build
step: edit the file and the host reloads it (changes under a watched config
directory reload automatically).

## How it renders

- Claims `append: "sidebar.content"`; the slot passes `{ sessionID }`.
- Roster: `ctx.data.location.agent.list()`, filtered to non-hidden agents.
- Activity: `ctx.data.session.status(sessionID) === "running"` drives the spinner.
- One row per agent, two lines each: `<name> #variant` then the model id. The
  panel is roughly 35 columns wide, so name + model on one line truncates the
  variant away — the part that actually distinguishes agents.
- A one-second tick refreshes the roster and animates the spinner. The host's
  collections are plain getters, so this avoids subscribing to every event for a
  handful of rows.

## Known gaps

- Built-in agents without an explicit model (`Build`, `Plan`) render with no
  model line; v1 showed `default` for them.
- The spinner path is implemented but has not been observed against a running
  session yet.
- Distribution is undecided: local path today, npm or a Git URL later.
