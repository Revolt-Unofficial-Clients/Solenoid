import { client } from "~/libs/revolt";
import { Message, User } from "revolt.js";
import { For } from "solid-js";
import showdown from "showdown";
import { styled } from "solid-styled-components";

interface MessageProps {
    author: User;
    message: Message;
}

// TODO: Use Revolt GFM instead of Regular GFM
// TODO: Custom Emoji Support (Examples: :trol:, :01GHBG2J9Z8FPH6F4C2HK1J2SW:)
// TODO: Message Actions
// TODO: Audio/Video Support

const converter = new showdown.Converter();
converter.setFlavor("github")
converter.setOption("simplifiedAutoLink", true);
converter.setOption("tables", true);
converter.setOption("emoji", true);

const MessageBaseContainer = styled("div")`
    margin: 0.5rem;
    width: 100%;
    height: fit-content;
`

const MessageBase = (props: MessageProps) => {
    return (
        <MessageBaseContainer>
            {props.message.reply_ids && (
                <For each={props.message.reply_ids}>
                {(reply) => {
                    const msg =
                        props.message.channel?.client.messages.get(reply);
                    return (
                        <div class="p-2 mb-2 w-fit bg-gray-400 border-l-4 border-l-cyan-100 items-center">
                            <img src={msg?.author.avatarURL || msg?.author.generateAvatarURL() || msg?.author.defaultAvatarURL} width={24} class="rounded-full inline-flex mr-2" />
                            <span class="rounded-full bg-gray-500 p-1 pl-2 pr-2 text-cyan-100">@{msg?.member.nickname || msg?.username || "Unknown User"}</span> <span class="break-all">{msg?.content}</span>
                        </div>
                    );
                }}
            </For>
            )}
            <div class="flex items-center">
                <img
                    src={
                        props.author?.animatedAvatarURL ||
                        props.author?.generateAvatarURL() ||
                        props.author?.defaultAvatarURL ||
                        "https://autumn.revolt.chat/avatars/f3YE_u3ZySd-0SPGneOJNuS7YZ4e8wBZY6HykboVVZ?max_side=256"
                    }
                    width={32}
                    class="rounded-2xl mr-2"
                />
                <h1 class="text-md text-white">
                    <b>{props.author?.username || "User Not Loaded"}</b>
                </h1>
            </div>
            <div>
                <div class="break-all" innerHTML={converter.makeHtml(props.message.content)} />
                <For each={props.message.attachments}>
                    {(attachment) => {
                        if (attachment.metadata.type === "Image") {
                            return (
                                <img
                                    class={`m-w-5 m-h-4 w-64 block object-contain justify-end mt-2 rounded-md shadow-md`}
                                    src={`${client.configuration.features.autumn.url}/attachments/${attachment._id}`}
                                    width={attachment.metadata.width}
                                    height={attachment.metadata.height}
                                />
                            );
                        }
                    }}
                </For>
            </div>
        </MessageBaseContainer>
    );
};

export default MessageBase;
