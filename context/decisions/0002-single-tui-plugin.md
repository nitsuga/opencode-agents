---
type: Decision
title: Port as a single TUI plugin, loaded from a local directory
decision_status: accepted
tags: [decision, plugin-architecture, tui, opencode-v2]
fork: 1
generated:
  by: deepseek/deepseek-flash
  at: 2026-11-12T18:05:00Z
---

# Context

The OpenCode v1 plugin had two parts. A server plugin polled the agent roster every
10 seconds and wrote it to a per-project snapshot under `storage/native-sidebar/`; a
TUI plugin rendered that snapshot into v1's `sidebar_content` slot. v1 hosts
validated a `{ id, tui }` contract and the plugin was declared in `tui.json` as a
`file://` URL.

OpenCode v2 replaced all of that:

- A plugin is one package with optional `server` (`.`), `tui` (`./tui`), `gui`
  (`./gui-experimental`), and `rpc` parts. Each part has its own SDK entry.
- The host *provides* only `effect` and `@opencode/plugin` to plugins. Everything
  else — `solid-js`, `@opentui/*` — resolves from the plugin's own dependencies.
- The TUI context publishes the data the v1 server part existed to scrape:
  `ctx.data.location.agent.list()` returns `{ id, name, model: { id, providerID,
  variant }, mode, hidden, … }`, and `ctx.data.session` exposes `family(id)`,
  `status(id)`, and `get(id)`.
- The TUI slot tree publishes `sidebar.content` (input `{ sessionID }`), claimed
  with `prepend` / `append` / `before` / `after` / `replace`.
- TUI-only plugins are configured in `~/.config/opencode/cli.json`, not in
  `opencode.jsonc` (which is what the *server* loads). `opencode plugin add`
  accepts npm and Git specs but rejects filesystem paths.

Two host behaviors were discovered only by testing: a local plugin directory with
both `name` and `exports` in its `package.json` is resolved by package name (and
silently loads nothing when it is not installed), and the host mounts
`sidebar.content` more than once.

# Decision

Ship **one TUI part and no server part**, at `tui.tsx` in the repo root:

- Roster from `ctx.data.location.agent.list()`, filtered to non-hidden agents.
- Activity from the session family: an agent spins while any session in
  `family(sessionID)` reports `status === "running"` with that agent.
- Two lines per agent — `name #variant`, then the model id — because the panel is
  about 35 columns wide and a single line truncated the variant away.
- One shared clock pair at module scope (60 ms frames, 1 s data refresh), not one
  per component instance.
- Loaded from `cli.json` by absolute directory path, with **no `exports` field**
  in `package.json`, so the host falls back to root filenames.

# Alternatives considered

1. **Keep the v1 shape (server part + snapshot file).** Rejected: it duplicates
   state the host already publishes, and a 10-second poll is strictly worse than
   reading the published collections.
2. **Single-line rows with truncation.** Rejected: at 35 columns the truncation
   ate `#high` / `#low`, which is the only thing distinguishing several agents.
3. **A timer per component instance.** Rejected: the host mounts the slot twice,
   so the observed frame rate was double the intent — measured at 15.6 ticks/s for
   a 120 ms timer.
4. **Publish as an npm package and add `exports`.** Not yet. Correct for
   distribution, but it breaks local-directory loading, so the repo stays on the
   root-filename path until there is a reason to publish.
5. **Build a `gui-experimental` part for the browser and desktop clients.** Out of
   scope here; it is a separate implementation against the `Panel` registry, not a
   port of the same code.

# Consequences

- The panel is **terminal-only**. The browser and desktop clients use a different
  extension surface, so a GUI part would be a second implementation.
- `tui.tsx` must stay at the repo root — moving it into `src/` breaks local
  loading unless `exports` is added back.
- Dependency pins must track the host (`@opencode/plugin` 2.2.7,
  `@opentui/*` 0.8.4, `solid-js` 1.9.19). Only `effect` and `@opencode/plugin` are
  provided at runtime.
- There is no automated test harness: verification is running OpenCode and
  watching the panel. Sampling a TUI to assert on it is unreliable (a fixed column
  window and sampling after the work finished both produced false negatives).
