# Knowledge Bundle Log

## 2026-11-12

* Initialized from `okf-project-template` and recorded the port in
  [`0002-single-tui-plugin`](./decisions/0002-single-tui-plugin.md) (accepted).
* Ported the v1 `native-sidebar` plugin to OpenCode v2 as a single TUI part
  claiming `sidebar.content`: roster from `ctx.data.location.agent.list()`,
  activity from `session.family()` + `status()`, two-line rows for a ~35-column
  panel, one shared clock pair (60 ms frames, 1 s data) at module scope. The v1
  server part and its `sidebar-state.json` snapshot are gone.
* Found and fixed two problems that made the panel invisible or slow:
  `~/.bashrc.local` still exported `XDG_CONFIG_HOME` into a deleted v1 config dir
  (so `opencode` never read `cli.json`), and per-instance timers doubled the frame
  rate because the host mounts the slot twice.
* Loading facts worth remembering, all in ADR 0002: TUI-only plugins live in
  `cli.json`; a local plugin directory must **not** have `exports` in its
  `package.json`; the host provides only `effect` and `@opencode/plugin`.
