# Knowledge Bundle Log

## 2026-11-12

* Panel header renamed `Native` → `Agents` with a collapse caret, matching the MCP
  section: `▼ Agents` expanded, `▶ Agents (8)` collapsed, and
  `▶ Agents (8 · ⠹ 1 working)` while work is in flight, so the spinner and the
  count keep reporting activity when the rows are hidden. Toggle with `ctrl+x z`
  or by clicking the header; the state persists through `storage.store`.
  Follow-ups fixed: the block was inset by one cell and the caret was greyed out
  (both now match the MCP section, caret at the same column and in `text.base`),
  and the click handler was a no-op — OpenTUI renderables take `onMouseDown`, not
  a JSX `on:click` event.

* Plugin panel: rows are now intrinsic text nodes with theme colours — agent name
  at `text.base`, effort on the text ramp, model at `text.faint`, spinner in
  `text.feedback.success` — and the spinner moved to the left of the model. Theme
  colours are converted into the renderer's own `RGBA` class; passing the theme's
  instances renders nothing.
* Dropped `config/cli.json` from tracking and from `link-config.sh`: OpenCode
  rewrites `cli.json` when it persists TUI settings, replacing the symlink with a
  plain file, which left a stale plugin path behind and made plugin edits appear
  broken. `install.sh` owns that entry; ADR 0003 records the rule that
  host-written files are never symlinked.

* Reviewed model and variant assignments, recorded in
  [`agents.md`](./agents.md): `explore` raised `low` → `medium` (it now does
  external research), `designer` raised to `luna#xhigh`, `observer` lowered to
  `luna#medium`; `orchestrator`, `general`, and `oracle` unchanged — higher oracle
  rungs showed diminishing quality per token and per second.

* Consolidated the agent roster onto canonical v2 agents
  ([ADR 0004](./decisions/0004-consolidate-agent-roster.md)): deleted `scout`
  (external research now routes to `explore`), added `agents/explore.md` as a
  merged local+external research brief over the built-in, and renamed
  `agents/fixer.md` to `agents/general.md` enabling the native `general` with the
  same implementation discipline. `orchestrator.md` now allowlists `general`,
  and `config/opencode.jsonc` drops the two model entries and pins `general` to
  `muse-spark #high`. Roster: `orchestrator`, `explore`, `general`, `oracle`,
  `designer`, `observer`.

* Renamed to `opencode-agents` and took on the OpenCode configuration
  ([ADR 0003](./decisions/0003-track-opencode-config.md)): `agents/`, `skills/`,
  `config/{opencode.jsonc,cli.json,AGENTS.md}` are tracked and symlinked into
  `~/.config/opencode` by `scripts/link-config.sh` (`--check` reports drift). The
  plugin moved to `plugin/`, so `scripts/install.sh` now targets
  `~/.local/share/opencode-agents/plugin`. `service.json` stays out — it holds the
  server password. Config backed up first to
  `~/.local/share/opencode-backups/config-pre-symlink-*.tar.gz`.

* Added `scripts/install.sh`: clone or fast-forward a checkout at
  `~/.local/share/opencode-native-sidebar`, `npm ci --omit=dev`, and point
  `cli.json` at it (`--check` verifies, `--target` relocates). This is the
  distribution workaround for [issue #1](https://github.com/nitsuga/opencode-native-sidebar/issues/1),
  filed with the measurement that package installs get no reactive updates.
  Installed and verified: the panel renders agents live from the install path.

## 2026-11-12

* Tried moving the install from a checkout to a published package
  (`opencode plugin add github:nitsuga/opencode-native-sidebar`). It loads and
  paints, but receives no reactive updates: measured `host-n=12 ours=0 store=0`
  across samples, i.e. the host's own state reads correctly at first paint while
  neither the plugin's signals nor the host's `storage` store ever reach the
  renderer. Reverted to the checkout path; the finding and its two packaging
  side effects (JSX pragma, no `For`/`Show`) are in ADR 0002.

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
