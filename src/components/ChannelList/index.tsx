import type { Component} from "solid-js";
import { For, createEffect } from "solid-js";
import { styled } from "solid-styled-components";
import { rvCLient } from "../../App.tsx";

import type { Server, Channel } from "revolt.js";

interface ChannelComponent {
  server: Server;
  channelSetter: (channel_id: string) => void;
  current_channel: Channel | undefined;
}

const ChannelList: Component<ChannelComponent> = (props) => {
  
  const ServerBanner = styled("div")<{
    banner: string
  }>`
    display: flex;
    background: url(https://autumn.revolt.chat/banners/${props => props.banner});
    width: 100%;
    height: 100%;
    filter: blur(4px) grayscale(50%);
    background-size: cover;
    background-position: center;
  `

  return (
    <div class="solenoid-server-info-container">
      <div class="solenoid-server-banner-container">
        {props.server.banner && (
          <ServerBanner banner={props.server.banner._id}/>
        )}
      </div>
      <div class="solenoid-channelList">
        <For each={Array.from(props.server.channels.values())}>
          {(channel: Channel | null | undefined) => (
            <div
              class={
                "solenoid-channel " +
                (channel!._id === props.current_channel?._id ? "active" : "")
              }
              id={`channel_${channel!._id}`}
              onClick={() => props.channelSetter(channel!._id)}
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
            </div>
          )}
        </For>
      </div>
    </div>
  );
};

export { ChannelList };
