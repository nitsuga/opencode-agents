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
  // Always measured from the root of the family, so the panel keeps the full
  // picture even while a subagent's session is the one on screen.
  const rootSession = createMemo(() => {
    beat();
    return props.ctx.data.session.root(props.sessionID);
  });

  const rootAgent = createMemo(() => {
    beat();
    const info = props.ctx.data.session.get(rootSession());
    return info?.agent ? String(info.agent) : undefined;
  });

  // Agent id -> the child session currently running it. Subagents run in their
  // own session, so this is also what a click on the row should focus.
  const busyAgents = createMemo(() => {
    beat();
    const { session } = props.ctx.data;
    const busy = new Map<string, string>();
    for (const id of session.family(rootSession())) {
      if (session.status(id) !== "running") continue;
      const info = session.get(id);
      if (info?.agent) busy.set(String(info.agent), id);
    }
    return busy;
  });

  /** Show that agent's session, the way v1 cycled subagent windows. */
  const focusAgent = (sessionID: string) => {
    // `tabs.focus` returns true for a child session but does not change the view,
    // so navigation is what actually shows a subagent's output.
    props.ctx.ui.router.navigate({ type: "session", sessionID });
  };

  const rows = createMemo(() => {
    beat();
    const glyph = SPINNER[frame() % SPINNER.length];
    const busy = busyAgents();
    return (props.ctx.data.location.agent.list() ?? [])
      .filter((agent) => !agent.hidden)
      .map((agent) => {
        const running = busy.get(String(agent.id));
        // The root agent is always clickable, so the user can get back to the
        // orchestrator from any subagent's output.
        const target = running ?? (String(agent.id) === rootAgent() ? rootSession() : undefined);
        return {
          name: agent.name.padEnd(13),
          variant: agent.model?.variant ? `#${agent.model.variant}` : "",
          model: agent.model?.id ?? "default",
          ticker: running ? glyph : " ",
          running: running !== undefined,
          target,
        };
      });
  });

  const theme = () => props.ctx.theme;
  const collapsed = () => props.collapsed.collapsed;
  const [hovered, setHovered] = createSignal<string | null>(null);
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
    <box style={{ flexDirection: "column" }}>
      <box style={{ flexDirection: "row" }} onMouseDown={toggle}>
        <text wrapMode="none" style={{ fg: color(theme().text.base) }}>
          {collapsed() ? "\u25b6 " : "\u25bc "}
        </text>
        <text wrapMode="none" style={{ fg: color(theme().text.base) }}>
          Agents
        </text>
        {collapsed() ? (
          <text wrapMode="none" style={{ fg: color(working() > 0 ? theme().text.feedback.success.base : theme().text.faint) }}>
            {summary()}
          </text>
        ) : null}
      </box>
      {collapsed() ? null : rows().map((row) => (
        <box
          style={{ flexDirection: "column" }}
          onMouseDown={row.target ? () => focusAgent(row.target!) : undefined}
          onMouseOver={row.target ? () => setHovered(row.name) : undefined}
          onMouseOut={row.target ? () => setHovered(null) : undefined}
        >
          <box style={{ flexDirection: "row" }}>
            <text
              wrapMode="none"
              style={{
                fg: color(
                  hovered() === row.name ? theme().text.feedback.success.base : theme().text.base,
                ),
              }}
            >
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
          id: "native-sidebar.root",
          title: "Return to the orchestrator session",
          description: "Leave an agent's output and go back to the session that spawned it",
          palette: true,
          bind: "<leader>o",
          run: () => {
            const route = ctx.ui.router.current();
            if (route.type !== "session") return;
            const root = ctx.data.session.root(route.sessionID);
            if (root && root !== route.sessionID) ctx.ui.router.navigate({ type: "session", sessionID: root });
          },
        },
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
