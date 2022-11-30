import { A, useNavigate } from "solid-start";
import { createEffect, createSignal, Show, Suspense, lazy } from "solid-js";
import { client as revolt } from "~/libs/revolt";
const ChannelSidebar = lazy(
    () => import("~/components/ui/sidebar/ChannelSidebar")
);
const MSGLoadingFallback = lazy(
    () => import("~/components/ui/sidebar/MSGLoadingFallback")
);
const ServerSidebar = lazy(
    () => import("~/components/ui/sidebar/ServerSidebar")
);
const MessageContainer = lazy(
    () => import("~/components/ui/servers/messages/MessageContainer")
);
const MessageBox = lazy(() => import("~/components/ui/compose/MessageBox"));
import { Message, User } from "revolt.js";
import { selectedChannel, selectedServer } from "~/components/ui/servers";
import { sendMessageToChannel } from "~/libs/revolt/servers/messages";

export const [newMessage, setNewMessage] = createSignal<string>("");
export const [usersTyping, setUsersTyping] = createSignal<User[]>();

export const [messages, setMessages] = createSignal<Message[]>();

export default function About() {
    const navigate = useNavigate();

    createEffect(() => {
        if (!revolt.user) navigate("/");
    });

    createEffect(() => {
        if (selectedChannel() && selectedChannel().typing) {
            setUsersTyping(selectedChannel().typing);
        }
        console.log(usersTyping());
    });

    revolt.on("message", async (e) => {
        if (selectedChannel() && e.channel_id === selectedChannel()._id) {
            await selectedChannel()
                .fetchMessagesWithUsers({ sort: "Latest" })
                .then(({ messages }) => {
                    setMessages(messages.reverse());
                });
        }
    });

    return (
        <main class="text-gray-700 flex flex-row flex-1">
            <Suspense>
                <ServerSidebar />
            </Suspense>
            <Show when={selectedServer()}>
                <Suspense>
                    <ChannelSidebar />
                </Suspense>
            </Show>
            <Show when={selectedChannel()}>
                    <div class="flex grow-0 flex-col h-screen w-full overflow-scroll overflow-x-hidden">
                        <Show
                            when={messages() && messages().length !== 0}
                            fallback={
                                <div>
                                    {/* TODO: Polish UI */}
                                    {/* TODO: Move Fallback to Separate Component */}
                                    <h1>This channel has no messages yet.</h1>
                                    <p>Be the first to talk here!</p>
                                </div>
                            }
                        >
                            <Suspense fallback={<MSGLoadingFallback />}>
                                <MessageContainer />
                            </Suspense>
                        </Show>
                        <Suspense>
                            <MessageBox />
                        </Suspense>
                    </div>
            </Show>
        </main>
    );
}
