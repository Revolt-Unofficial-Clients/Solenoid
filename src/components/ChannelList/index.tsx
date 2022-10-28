import type { Component} from "solid-js";
import { For } from "solid-js";
import type { Server, Channel } from "revolt.js";
import { css } from "solid-styled-components";
interface ChannelComponent {
  server: Server;
  channelSetter: (channel_id: string) => void;
  current_channel: Channel | undefined;
}

const ChannelList: Component<ChannelComponent> = (props) => {
  
  return (
    <>
      <div class={"solenoid-server-banner-container"}>
        <span class="servername">{props.server.name}</span>
        <div class="grad" />
        {props.server.banner && (
          <img
            class="solenoid-banner"
            width={256}
            src={`https://autumn.revolt.chat/banners/${props.server.banner?._id}`}
          ></img>
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
    </>
  );
};

export { ChannelList };
