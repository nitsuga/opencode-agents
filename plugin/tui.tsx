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
import { StyledText, fg } from "@opentui/core";
import { Plugin } from "@opencode/plugin/tui";
import { createMemo, createSignal } from "solid-js";

type Context = Plugin.Context;

const SPINNER = ["⠋", "⠙", "⠹", "⠸", "⠼", "⠴", "⠦", "⠧", "⠇", "⠏"];

type Theme = Plugin.Context["theme"];

// The theme's RGBA and OpenTUI's ColorInput come from different packages, so the
// types are nominally distinct even though the values are identical at runtime.
const paint = (color: unknown, text: string) => fg(color as never)(text);

/** Effort is shown through the theme's text ramp: quiet at low, brightest at high. */
function effortColor(theme: Theme, variant: string): unknown {
  const v = variant.toLowerCase();
  if (v === "minimal" || v === "none" || v === "low") return theme.text.faint;
  if (v === "medium") return theme.text.muted;
  return theme.text.base;
}

// One pair of clocks for every mounted panel. The host renders `sidebar.content`
// in more than one place (the side region and the narrow-screen layout), so a
// timer per component instance doubles both the frame rate and the work. 60 ms
// gives a 0.6 s spinner revolution, which reads as motion rather than a crawl.
const [frame, setFrame] = createSignal(0);
const [beat, setBeat] = createSignal(0);
setInterval(() => setFrame((value) => value + 1), 60);
setInterval(() => setBeat((value) => value + 1), 1000);

function NativePanel(props: { ctx: Context; sessionID: string }) {

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

  // One text node for the whole panel. Control-flow components (`For`, `Show`)
  // do not reconcile when this file is loaded from an installed package under
  // node_modules, and static/reactive text does — so the rows are joined rather
  // than mapped into child elements.
  const panel = createMemo(() => {
    beat();
    const theme = props.ctx.theme;
    const glyph = SPINNER[frame() % SPINNER.length];
    const busy = busyAgents();
    const agents = (props.ctx.data.location.agent.list() ?? []).filter((agent) => !agent.hidden);
    const chunks = [paint(theme.text.muted, "Native")];

    for (const agent of agents) {
      const variant = agent.model?.variant ?? "";
      const model = agent.model?.id ?? "default";
      const running = busy.has(String(agent.id));

      chunks.push(paint(theme.text.base, `\n${agent.name.padEnd(13)}`));
      if (variant) chunks.push(paint(effortColor(theme, variant), `#${variant}`));
      // Spinner sits to the left of the model, on its own line.
      chunks.push(paint(theme.text.faint, "\n  "));
      chunks.push(paint(running ? theme.text.feedback.success.base : theme.text.faint, running ? glyph : " "));
      chunks.push(paint(theme.text.faint, ` ${model}`));
    }

    return new StyledText(chunks);
  });

  return (
    <box style={{ flexDirection: "column", paddingLeft: 1, paddingRight: 1 }}>
      <text content={panel()} wrapMode="none" />
    </box>
  );
}

export default Plugin.define({
  id: "native-sidebar",
  setup(ctx) {
    void ctx.data.location.agent.sync().catch(() => {});
    const dispose = ctx.ui.slot({
      append: "sidebar.content",
      render: (input) => <NativePanel ctx={ctx} sessionID={input.sessionID} />,
    });
    return () => dispose();
  },
});
