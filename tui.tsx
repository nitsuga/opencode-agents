// native-sidebar — OpenCode v2 TUI plugin.
//
// Renders a small panel in the `sidebar.content` slot listing every agent with
// its model variant, and spins only next to the agents that are working right
// now. The roster and activity come straight from the host's data layer, so
// unlike the v1 plugin there is no server half and no snapshot file to sync.
import { Plugin } from "@opencode/plugin/tui";
import { For, createMemo, createSignal } from "solid-js";

type Context = Plugin.Context;

const SPINNER = ["⠋", "⠙", "⠹", "⠸", "⠼", "⠴", "⠦", "⠧", "⠇", "⠏"];

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

  const rows = createMemo(() => {
    beat();
    const glyph = SPINNER[frame() % SPINNER.length];
    const busy = busyAgents();
    return (props.ctx.data.location.agent.list() ?? [])
      .filter((agent) => !agent.hidden)
      .map((agent) => ({
        name: agent.name,
        variant: agent.model?.variant ? `#${agent.model.variant}` : "",
        model: agent.model?.id ?? "default",
        ticker: busy.has(String(agent.id)) ? glyph : " ",
      }));
  });

  return (
    <box style={{ flexDirection: "column", paddingLeft: 1, paddingRight: 1 }}>
      <text>Native</text>
      <For each={rows()}>
        {(row) => (
          <box style={{ flexDirection: "column" }}>
            <text wrapMode="none">{`${row.name.padEnd(13)}${row.ticker} ${row.variant}`.trimEnd()}</text>
            <text wrapMode="none">{`  ${row.model}`}</text>
          </box>
        )}
      </For>
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
