import { Channel, Server } from "revolt.js"
import { For } from "solid-js";
import { setSelectedChannel } from ".."
import { setMessages } from "~/routes/client"

interface ChannelListProps {
    server: Server;
}

const ChannelList = (props: ChannelListProps) => {
    if (!props.server) return;

    const CHANNELS = props.server.channels;

    return (
        <div class="flex-1">
            {/* TODO: Move Channel Title to ChannelSidebar Component */}
            {/* TODO: Add Server Descriptions */}
            <div class={`bg-gradient-to-t from-slate-300 dark:from-slate-800 to-transparent bg-slate-300 dark:bg-slate-800 bg-center h-24 sticky top-0 right-0 flex`}>
                <h1 class="text-lg m-2 text-dark dark:text-slate-50 absolute bottom-0"><b>{props.server.name}</b></h1>
            </div>
            <For each={CHANNELS}>
                {(channel: Channel) => (
                    <div id={channel._id} class="bg-slate-300 dark:bg-slate-800 p-2 mb-1 cursor-pointer" onClick={async () => {
                        setSelectedChannel(channel)
                        await channel.fetchMessagesWithUsers({sort: "Latest"}).then(({messages}) => {
                            console.log("Getting Messages...")
                            setMessages(messages.reverse());
                        }).finally(() => {
                            console.log("Loaded Messages");
                        })
                        }}>
                        <p class="text-slate-800 dark:text-slate-200">{channel.name}</p>
                    </div>
                )}
            </For>
        </div>
    )
}

export default ChannelList;