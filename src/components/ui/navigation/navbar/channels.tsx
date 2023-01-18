import classNames from "classnames";
import { Component, For, Show } from "solid-js";
import * as Solenoid from "../../../../lib/solenoid";
import { Markdown } from "../../../markdown";

async function getMessagesFromChannel() {
  await Solenoid.servers.current_channel
    ?.messages.fetchMultiple({"include_users": true})
    .then(messages =>
      Solenoid.setMessages(messages.reverse())
    );
  Solenoid.setServers("isHome", false);
}

const ChannelNavigation: Component = () => {

  return (
    <div class="relative bottom-0 left-0 container w-96 h-screen bg-base-200 px-4 overflow-scroll overflow-x-hidden">
      <div class="prose py-2">
        <h2>{Solenoid.servers.current_server?.name}</h2>
      </div>
      <For each={Solenoid.servers.current_server?.orderedChannels}>
        {category => (
          <div class="flex flex-col gap-2">
            <p class="font-semibold m-2">{category.name}</p>
            <For each={category.channels}>
              {channel => (
                <button class="btn" onClick={() => {
                  Solenoid.setServers("current_channel", channel)
                  getMessagesFromChannel()
                }}>{channel.name} {channel.unread && "*"}</button>
              )}
            </For>
          </div>
        )}
      </For>
    </div>
  );
};

export default ChannelNavigation;
