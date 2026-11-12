/** @jsxImportSource @opentui/solid */
// The pragma above is load-bearing: when this package is installed (and so lives
// under node_modules), Bun does not apply a project tsconfig.json, and JSX would
// otherwise compile against the React runtime, which the host does not provide.
// native-sidebar — OpenCode v2 TUI plugin.
//
// Renders a small panel in the `sidebar.content` slot listing every agent with
// its model variant, and spins only next to the agents that are working right
// now. The roster and activity come straight from the host's data layer, so
// unlike the v1 plugin there is no server half and no snapshot file to sync.
import { RGBA as TuiColor } from "@opentui/core";
import { Plugin } from "@opencode/plugin/tui";
import { createMemo, createSignal } from "solid-js";

type Context = Plugin.Context;
type Theme = Context["theme"];

const SPINNER = ["⠋", "⠙", "⠹", "⠸", "⠼", "⠴", "⠦", "⠧", "⠇", "⠏"];

// One pair of clocks for every mounted panel. The host renders `sidebar.content`
// in more than one place (the side region and the narrow-screen layout), so a
// timer per component instance doubles both the frame rate and the work. 60 ms
// gives a 0.6 s spinner revolution, which reads as motion rather than a crawl.
const [frame, setFrame] = createSignal(0);
const [beat, setBeat] = createSignal(0);
setInterval(() => setFrame((value) => value + 1), 60);
setInterval(() => setBeat((value) => value + 1), 1000);

/**
 * The theme exposes its own RGBA class, and the renderer rejects foreign
 * instances: convert into the renderer's own type so the value is accepted.
 */
function color(value: unknown): string | TuiColor {
  const source = value as { toInts?: () => [number, number, number, number] };
  if (typeof source?.toInts === "function") {
    const [r, g, b, a] = source.toInts();
    return TuiColor.fromInts(r, g, b, a);
  }
  return String(value);
}

/** Effort rides the theme's text ramp: quiet at low, brightest at high effort. */
function effortColor(theme: Theme, variant: string): string | TuiColor {
  const value = variant.replace(/^#/, "").toLowerCase();
  if (value === "minimal" || value === "none" || value === "low") return theme.text.faint;
  if (value === "medium") return theme.text.muted;
  return theme.text.base;
}

type Collapse = readonly [
  { readonly collapsed: boolean },
  (mutation: (draft: { collapsed: boolean }) => void) => void | Promise<void>,
];

function AgentPanel(props: {
  ctx: Context;
  sessionID: string;
  collapsed: Collapse[0];
  setCollapsed: Collapse[1];
}) {
  // Which agents are working. A subagent runs in a child session, so the whole
  // session family has to be consulted — checking only the visible session
  // would spin every row whenever anything was running.
  const busyAgents = createMemo(() => {
    beat();
    const { session } = props.ctx.data;
    const busy = new Set<string>();
    for (const id of session.family(props.sessionID)) {
      if (session.status(id) !== "running") continue;
      const info = session.get(id);
      if (info?.agent) busy.add(String(info.agent));
    }
    return busy;
  });

  const rows = createMemo(() => {
    beat();
    const glyph = SPINNER[frame() % SPINNER.length];
    const busy = busyAgents();
    return (props.ctx.data.location.agent.list() ?? [])
      .filter((agent) => !agent.hidden)
      .map((agent) => {
        const running = busy.has(String(agent.id));
        return {
          name: agent.name.padEnd(13),
          variant: agent.model?.variant ? `#${agent.model.variant}` : "",
          model: agent.model?.id ?? "default",
          ticker: running ? glyph : " ",
          running,
        };
      });
  });

  const theme = () => props.ctx.theme;
  const collapsed = () => props.collapsed.collapsed;
  const working = createMemo(() => rows().filter((row) => row.running).length);

  // Collapsed shows the count, plus what is working, so hiding the rows does not
  // also hide the activity the panel exists to report.
  const summary = createMemo(() => {
    const total = rows().length;
    const busy = working();
    if (busy === 0) return ` (${total})`;
    // A collapsed panel still reports progress: the spinner keeps ticking so the
    // header itself shows that work is in flight.
    const glyph = SPINNER[frame() % SPINNER.length];
    return ` (${total} \u00b7 ${glyph} ${busy} working)`;
  });

  const toggle = () => {
    void props.setCollapsed((draft) => {
      draft.collapsed = !draft.collapsed;
    });
  };

  return (
    <box style={{ flexDirection: "column", paddingLeft: 1, paddingRight: 1 }}>
      <box style={{ flexDirection: "row" }}>
        <text wrapMode="none" on:click={toggle} style={{ fg: color(theme().text.muted) }}>
          {collapsed() ? "\u25b6 " : "\u25bc "}
        </text>
        <text wrapMode="none" on:click={toggle} style={{ fg: color(theme().text.base) }}>
          Agents
        </text>
        {collapsed() ? (
          <text wrapMode="none" style={{ fg: color(working() > 0 ? theme().text.feedback.success.base : theme().text.faint) }}>
            {summary()}
          </text>
        ) : null}
      </box>
      {collapsed() ? null : rows().map((row) => (
        <box style={{ flexDirection: "column" }}>
          <box style={{ flexDirection: "row" }}>
            <text wrapMode="none" style={{ fg: color(theme().text.base) }}>
              {row.name}
            </text>
            {row.variant ? (
              <text wrapMode="none" style={{ fg: color(effortColor(theme(), row.variant)) }}>
                {row.variant}
              </text>
            ) : null}
          </box>
          <box style={{ flexDirection: "row" }}>
            <text
              wrapMode="none"
              style={{ fg: color(row.running ? theme().text.feedback.success.base : theme().text.faint) }}
            >
              {`  ${row.ticker} `}
            </text>
            <text wrapMode="none" style={{ fg: color(theme().text.faint) }}>
              {row.model}
            </text>
          </box>
        </box>
      ))}
    </box>
  );
}

export default Plugin.define({
  id: "native-sidebar",
  setup(ctx) {
    void ctx.data.location.agent.sync().catch(() => {});
    const [collapsed, setCollapsed] = ctx.storage.store("native-sidebar", {
      initial: { collapsed: false },
    });

    ctx.keymap.layer(() => ({
      mode: "global",
      commands: [
        {
          id: "native-sidebar.toggle",
          title: "Toggle agent list",
          description: "Collapse or expand the Agents panel in the sidebar",
          palette: true,
          bind: "<leader>z",
          run: () => {
            void setCollapsed((draft) => {
              draft.collapsed = !draft.collapsed;
            });
          },
        },
      ],
    }));

    const dispose = ctx.ui.slot({
      append: "sidebar.content",
      render: (input) => (
        <AgentPanel
          ctx={ctx}
          sessionID={input.sessionID}
          collapsed={collapsed}
          setCollapsed={setCollapsed}
        />
      ),
    });
    return () => dispose();
  },
});
