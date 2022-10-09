import {
    Component,
    Setter,
    Accessor,
    For
} from "solid-js";
import { Message as MSG, Client } from "revolt.js";
import SolidMarkdown from "solid-markdown";
import type { settings, reply } from "../../types";
import { css } from "solid-styled-components";

interface MessageComponent {
    client: Client,
    message: MSG,
    settings: settings,
    signal: Accessor<reply[]>
    setter: Setter<reply[]>
    colour: string | undefined
}

const Message: Component<MessageComponent> = ({client, message, settings, setter, signal, colour}) => {
    return (
        <div
        class={"solenoid-message " + (message.mentions?.find((e) => e?._id === client.user?._id) ? "mentioned" : "")}
        onClick={() => setter([...signal(), {
            id: message._id,
            mention: false
        }])}
        >
        <div class="solenoid-message-author">
        {message.masquerade?.avatar ? (
            <img
                style={{
                    "max-width": "50px",
                    "max-height": "50px"
                }}
                class="solenoid-pfp"
                src={message.masquerade?.avatar}
            ></img>
        ) : message.author?.avatar ? (
            <img
                style={{
                    "max-width": "50px",
                    "max-height": "50px"
                }}
                class="solenoid-pfp"
                src={`${client.configuration?.features?.autumn?.url}/avatars/${message.author?.avatar?._id}`}
                title={`${message.author?.avatar?.filename}`}
            ></img>
        ) : (
            <img
                style={{
                    "max-width": "50px",
                    "max-height": "50px"
                }}
                class="solenoid-pfp"
                title="Default Avatar"
                src={`https://api.revolt.chat/users/${message.author?._id}/default_avatar`}
            ></img>
        ) }
        <span
        class={colour && colour.includes("gradient") ? css`
                background: ${colour};
                background-clip: text;
                -webkit-background-clip: text;
                -webkit-text-fill-color: transparent;
                font-weight: bold;
                ` : css`
                color: ${colour ?? "#fff"};
                font-weight: bold;
        `}
        > {
            message.masquerade?.name
            ?? message.member?.nickname
            ?? message.author?.username
            ??"Unknown User"
        }
        </span>
        {message.masquerade && <span class="solenoid-masquerade">(Masquerade)</span>}
        {message.author?.bot && <span class="solenoid-bot">(Bot)</span>}
        {message.author?._id === "01G1V3VWVQFC8XAKYEPNYHHR2C" && <span class="solenoid-dev">Solenoid Developer 😺</span>}
        {message.reply_ids && message.reply_ids.length > 1 ? (
            <span class="notimportant"> (Replying to {message?.reply_ids?.length} messages)</span>
        ) : (
            <For each={message.reply_ids}>
                {(r) => {
                    const msg = message.channel?.client.messages.get(r);
                    return (
                        <span class="notimportant">
                            (Replying to {msg?.author?.username ?? "Unknown User"})
                        </span>
                    );
                }}
            </For>

        )}

        {settings.suffix && (
            <>{settings.showSuffix ? " says " : ":"}</>
        )}
        </div>
        <SolidMarkdown class="solenoid-md" children={message.content ?? undefined} />
        <For each={message.attachments}>
            {(attachment) => {
                if (!settings.showImages) {
                    return <></>;
                } else if (attachment.metadata.type === "Image") {
                    //Basic image support :D
                    return (
                        <img
                            class="solenoid-message-image"
                            src={`https://autumn.revolt.chat/attachments/${attachment._id}`}
                            width={
                                attachment.metadata.width > 500
                                    ? attachment.metadata.width /
                                    settings.zoomLevel
                                    : attachment.metadata.width
                            }
                            height={
                                attachment.metadata.height > 500
                                    ? attachment.metadata.height /
                                    settings.zoomLevel
                                    : attachment.metadata.height
                            }
                        />
                    );
                } else if (attachment.metadata.type === "Video") {
                    return (
                        <video class="solenoid-message-video" src={`${client.configuration?.features.autumn.url}/attachments/${attachment._id}`} controls />
                    )
                } else {
                    return (
                        <div class="solenoid-message-file">
                            <h3 class="header">{message.author?.username} sent you a {attachment.metadata.type}</h3>
                            <p class="name">File Name: {attachment.filename}</p>
                            <a class="download" type="download" href={`${client.configuration?.features?.autumn?.url}/attachments/${attachment._id}`}>Download</a>
                        </div>
                    )
                }
            }}
        </For>
    </div>
    )
}

export {Message};
