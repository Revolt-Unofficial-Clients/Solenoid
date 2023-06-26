import classNames from "classnames";
import { Component, For, Show } from "solid-js";
import * as Solenoid from "../../../../lib/solenoid";
import { Markdown } from "../../../markdown";

async function getMessagesFromChannel() {
  await Solenoid.servers.current_channel?.messages
    .fetchMultiple({ include_users: true })
    .then((messages) => Solenoid.setMessages(messages.reverse()));
  Solenoid.setServers("isHome", false);
}

const ChannelNavigation: Component = () => {
  return (
    <div class="relative bottom-0 left-0 container w-96 h-screen bg-base-200 px-4 overflow-scroll overflow-x-hidden">
      <div class="prose py-2">
        <h2>{Solenoid.servers.current_server?.name}</h2>
      </div>
      <For each={Solenoid.servers.current_server?.orderedChannels}>
        {(category) => (
          <div class="flex flex-col gap-1">
            <Show when={category.name !== "Default"}>
              <p class="font-semibold m-2">{category.name}</p>
            </Show>

            <For each={category.channels}>
              {(channel) => (
                <button
                  class={classNames({
                    "w-full": true,
                    "h-auto": true,
                    "bg-slate-300": true,
                    "text-black": true,
                    "dark:bg-slate-900": true,
                    "dark:text-white": true,
                    "items-center": true,
                    "p-2": true,
                    "rounded-md": true,
                    flex: true,
                    "gap-1": true,
                    "my-2": true,
                    "btn-primary":
                      channel.id === Solenoid.servers.current_channel?.id,
                  })}
                  onClick={() => {
                    Solenoid.setServers("current_channel", channel);
                    getMessagesFromChannel();
                  }}
                >
                  <Markdown content={channel.name} />{" "}
                  {channel.unread && (
                    <div class="w-2 h-2 bg-white ml-auto mr-2 rounded-full"></div>
                  )}
                </button>
              )}
            </For>
          </div>
        )}
      </For>
    </div>
  );
};

export default ChannelNavigation;
