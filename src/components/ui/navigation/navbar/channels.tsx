import classNames from "classnames";
import { Component, For, Show } from "solid-js";
import { className } from "solid-js/web/types";
import { setSolenoidServer, solenoidServer } from "../../../../lib/store/solenoidServerStore";
import { Markdown } from "../../../markdown";

async function getMessagesFromChannel() {
  await solenoidServer.channel?.current
    ?.messages.fetchMultiple({"include_users": true})
    .then(messages =>
      setSolenoidServer("channel", "messages", messages.reverse())
    );
  setSolenoidServer("displayHomescreen", false);
}

const ChannelNavigation: Component = () => {

  return (
    <div class="relative bottom-0 left-0 container w-96 h-screen bg-base-200 px-4 overflow-scroll overflow-x-hidden">
      <div class="prose py-2">
        <h2>{solenoidServer.current?.name}</h2>
      </div>
      <For each={solenoidServer.channel?.list}>
        {category => (
          <div class="flex flex-col gap-2">
            <p class="font-semibold m-2">{category.name}</p>
            <For each={category.channels}>
              {channel => (
                <button class={classNames({
                  "btn": true,
                  "flex": true,
                  "gap-2": true,
                  "btn-primary": channel.id === solenoidServer.channel?.current?.id
                })} onClick={() => {
                  setSolenoidServer("channel", "current", channel)
                  getMessagesFromChannel()
                }}><Markdown content={channel.name} /> {channel.unread && <div class="w-2 h-2 bg-white ml-auto rounded-full"></div>}</button>
              )}
            </For>
          </div>
        )}
      </For>
    </div>
  );
};

export default ChannelNavigation;
