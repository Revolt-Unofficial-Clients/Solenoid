import classNames from "classnames";
import { Component, For, Show } from "solid-js";
import * as Solenoid from "../../../../lib/solenoid";
import { Markdown } from "../../../markdown";

async function getMessagesFromChannel() {
  await Solenoid.servers.current_channel
    ?.fetchMessagesWithUsers()
    .then(({ messages }) =>
      Solenoid.setServers("messages", messages.reverse())
    );
  Solenoid.setServers("isHome", false);
}

const ChannelNavigation: Component = () => {

  return (
    <div class="relative bottom-0 left-0 container w-96 h-screen bg-base-200 px-4 overflow-scroll overflow-x-hidden">
      <div class="prose flex items-center justify-center py-2">
        <h2>{Solenoid.servers.current_server?.name}</h2>
      </div>
      <For each={Solenoid.servers.current_server_channels}>
        {(channel) => (
          <Show when={channel?.channel_type === "TextChannel"}>
            <button
              class={classNames({
                btn: true,
                "btn-sm": true,
                "w-full": true,
                "my-1": true,
                "btn-accent": Solenoid.servers.current_channel === channel,
                "break-all": true,
              })}
              onClick={() => {
                Solenoid.setServers("current_channel", channel);
                Solenoid.setServers("isHome", false);
                Solenoid.setServers("messages", []);
                getMessagesFromChannel();
              }}
            >
              <Markdown disallowBigEmoji content={channel?.name || ""} />
            </button>
          </Show>
        )}
      </For>
    </div>
  );
};

export default ChannelNavigation;
