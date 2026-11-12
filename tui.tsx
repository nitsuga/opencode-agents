// native-sidebar — OpenCode v2 TUI plugin.
//
// Renders a small panel in the `sidebar.content` slot listing every agent with
// its model, plus a spinner while the current session is running. The roster
// comes straight from the host's data layer, so unlike the v1 plugin there is
// no server half and no snapshot file to keep in sync.
import { Plugin } from "@opencode/plugin/tui";
import { For, Show, createMemo, createSignal, onCleanup } from "solid-js";

type Context = Plugin.Context;

const SPINNER = ["⠋", "⠙", "⠹", "⠸", "⠼", "⠴", "⠦", "⠧", "⠇", "⠏"];

function NativePanel(props: { ctx: Context; sessionID: string }) {
  // The host's collections are read through plain getters, so a one-second tick
  // both refreshes the roster and animates the spinner. A dozen string rows per
  // second is far cheaper than subscribing to every session event.
  const [tick, setTick] = createSignal(0);
  const timer = setInterval(() => setTick((value) => value + 1), 1000);
  onCleanup(() => clearInterval(timer));

  const rows = createMemo(() => {
    tick();
    const agents = props.ctx.data.location.agent.list() ?? [];
    return agents
      .filter((agent) => !agent.hidden)
      .map((agent) => ({
        name: agent.name,
        variant: agent.model?.variant ? `#${agent.model.variant}` : "",
        model: agent.model?.id ?? "",
      }));
  });

  const running = createMemo(() => {
    tick();
    return props.ctx.data.session.status(props.sessionID) === "running";
  });

  const ticker = createMemo(() => (running() ? SPINNER[tick() % SPINNER.length] : " "));

  return (
    <box style={{ flexDirection: "column", paddingLeft: 1, paddingRight: 1 }}>
      <text>Native</text>
      <For each={rows()}>
        {(row) => (
          <box style={{ flexDirection: "column" }}>
            <text wrapMode="none">{`${row.name.padEnd(13)}${ticker()} ${row.variant}`.trimEnd()}</text>
            <Show when={row.model}>
              <text wrapMode="none">{`  ${row.model}`}</text>
            </Show>
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
