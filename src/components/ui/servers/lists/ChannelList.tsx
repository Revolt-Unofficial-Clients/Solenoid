import { Channel, Server } from "revolt.js"
import { For } from "solid-js";
import { setSelectedChannel } from ".."
import { setMessages } from "~/routes/client"
import { styled } from "solid-styled-components";
import { client } from "~/libs/revolt";

interface ChannelListProps {
    server: Server;
}

const ChannelContainer = styled("div")`
    background-color: ${props => props.theme["primary-background"]};
    padding: 0.5rem;
    margin-bottom: 0.25rem;
    cursor: pointer;
`

const ChannelList = (props: ChannelListProps) => {
    if (!props.server) return;

    const CHANNELS = props.server.channels;

    const ChannelBanner = styled("div")`
        background: linear-gradient(to top, ${props => props.theme["primary-background"]}, transparent) ,url(${client.configuration.features.autumn.url}/banners/${props.server.banner._id}), ${props => props.theme["secondary-background"]};
        background-size: cover;
        background-position: center;
        position: sticky;
        top: 0px;
        right: 0px;
        display: flex;
        height: fit-content;
        height: 6rem;
    `
    return (
        <div class="flex-1">
            {/* TODO: Move Channel Title to ChannelSidebar Component */}
            {/* TODO: Add Server Descriptions */}
            <ChannelBanner class="h-24">
                <h1 class="text-lg m-2 text-dark dark:text-slate-50 absolute bottom-0"><b>{props.server.name}</b></h1>
            </ChannelBanner>
            <For each={CHANNELS}>
                {(channel: Channel) => (
                    <ChannelContainer id={channel._id} class="bg-slate-300 dark:bg-slate-800 p-2 mb-1 cursor-pointer" onClick={async () => {
                        setSelectedChannel(channel)
                        await channel.fetchMessagesWithUsers({sort: "Latest"}).then(({messages}) => {
                            console.log("Getting Messages...")
                            setMessages(messages.reverse());
                        }).finally(() => {
                            console.log("Loaded Messages");
                        })
                        }}>
                        <p class="text-slate-800 dark:text-slate-200">{channel.name}</p>
                    </ChannelContainer>
                )}
            </For>
        </div>
    )
}

export default ChannelList;