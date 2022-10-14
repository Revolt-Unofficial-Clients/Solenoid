import type { Component, Setter } from "solid-js";
import { For } from "solid-js";
import type { Server, Channel } from "revolt.js";

interface ChannelComponent {
  server: Server;
  channelSetter: (channel_id: string) => void;
}

const ChannelList: Component<ChannelComponent> = (props) => {
  return (
    <div class="solenoid-server-info-container">
      <div class="solenoid-server-banner-container">
        {props.server.banner && (
          <img
            class="solenoid-banner"
            src={`https://autumn.revolt.chat/banners/${props.server.banner?._id}`}
          />
        )}
      </div>
      <div class="solenoid-channelList">
        <For each={Array.from(props.server.channels.values())}>
          {(channel: Channel | null | undefined) => (
            <div
              class={
                "solenoid-channel" +
                (channel!._id === props.server?._id ? " active" : "")
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
