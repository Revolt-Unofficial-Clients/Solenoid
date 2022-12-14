import { Channel, Server } from "revolt.js";
import { createEffect, For } from "solid-js";
import { selectedChannel, setSelectedChannel } from "..";
import { setMessages } from "~/routes/client";
import { styled } from "solid-styled-components";
import { client } from "~/libs/revolt";

import { BiRegularHash, BiRegularSpeaker } from "solid-icons/bi";

interface ChannelListProps {
    server: Server;
}

const Item = styled("li")`
    background-color: ${(props) => props.theme["secondary-background"]};
    padding: 0.5rem;
    margin: 0.5rem;
    border-radius: 0.5rem;
    display: flex;
    align-items: center;
    gap: 5px;
    cursor: pointer;
    color: ${(props) => props.theme["tertiary-foreground"]};

    &[data-active="true"] {
        background-color: ${(props) => props.theme.hover};
        color: ${(props) => props.theme.foreground};
        cursor: unset;
    }
`;

const ChannelList = (props: ChannelListProps) => {
    createEffect(() => {
        if (!props.server) return;
    });

    const CHANNELS = props.server.channels;

    const ChannelBanner = styled("div")`
        background: linear-gradient(to top, ${(props) => props.theme["primary-background"]}, transparent),
            url(${client.configuration.features.autumn.url}/banners/${props.server.banner?._id}), ${(props) => props.theme["secondary-background"]};
        background-size: cover;
        background-position: center;
        position: sticky;
        top: 0px;
        right: 0px;
        display: flex;
        height: fit-content;
        height: 6rem;
    `;

    const ChannelTitle = styled("h1")`
        color: ${(props) => props.theme.foreground};
        margin: 0.5rem;
        position: absolute;
        bottom: 0px;
    `;
    return (
        <div class="flex-1">
            {/* TODO: Move Channel Title to ChannelSidebar Component */}
            {/* TODO: Add Server Descriptions */}
            <ChannelBanner class="h-24">
                <ChannelTitle>
                    <b>{props.server.name}</b>
                </ChannelTitle>
            </ChannelBanner>
            <ul>
                <For each={CHANNELS}>
                    {(channel: Channel) => (
                        <Item
                            id={channel._id}
                            class="bg-slate-300 dark:bg-slate-800 p-2 mb-1 cursor-pointer"
                            onClick={async () => {
                                setSelectedChannel(channel);
                                await channel
                                    .fetchMessagesWithUsers({ sort: "Latest" })
                                    .then(({ messages }) => {
                                        console.log("Getting Messages...");
                                        setMessages(messages.reverse());
                                    })
                                    .finally(() => {
                                        console.log("Loaded Messages");
                                    });
                            }}
                            data-active={channel._id === selectedChannel()?._id ? "true" : "false"}
                        >
                            {channel.channel_type === "TextChannel" ? (
                                <BiRegularHash />
                            ) : (
                                channel.channel_type === "VoiceChannel" && <BiRegularSpeaker />
                            )}
                            {channel.name}
                        </Item>
                    )}
                </For>
            </ul>
        </div>
    );
};

export default ChannelList;
