import type { Component} from "solid-js";
import { For } from "solid-js";
import { styled } from "solid-styled-components";
import { setServers, servers } from "../../../../lib/solenoid"; 

import type { Server, Channel } from "revolt.js";
import classNames from "classnames";

interface ChannelComponent {
  server: Server;
  channelSetter: (channel_id: string) => void;
  current_channel: Channel | undefined;
}

const ChannelList: Component<ChannelComponent> = (props) => {

  return (
    <div class="btn-group btn-group-vertical h-60 overflow-scroll">
      <div class="prose text-center">
        <h1 >{props.server.name}</h1>
      </div>
      <For each={servers.current_server?.channels}>
          {(channel) => (
            <button
              class={
                classNames({
                  btn: true,
                  "btn-active": channel!._id === props.current_channel?._id
                })
              }
              id={`channel_${channel!._id}`}
              onClick={() => setServers("current_channel", channel)}
            >
              <span class="hashicon">
                {channel?.icon ? (
                  <img
                    width={24}
                    height={24}
                    src={`https://autumn.revolt.chat/icons/${channel.icon?._id}?max_side=256`}
                  />
                ) : (
                  "#"
                )}
              </span>
              <span class="channel_name">{channel!.name}</span>
            </button>
          )}
        </For>
    </div>
  );
};

export { ChannelList };
