import { BaseMessage, Client, Message } from "revolt-toolset";
import {
  Accessor,
  Component,
  createResource,
  createSignal,
  For,
  Match,
  Setter,
  Show,
  Switch
} from "solid-js";
import { css } from "solid-styled-components";
import type { reply, settings } from "../../../../types";

import classNames from "classnames";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import {
  BiSolidLeftArrowAlt,
  BiSolidRightArrowAlt,
  BiSolidShieldX,
  BiSolidUserX
} from "solid-icons/bi";
import { servers, settings as config } from "../../../../lib/solenoid";
import { Markdown } from "../../../markdown";
import RevoltEmbeds from "../embeds";
import { revolt } from "../../../../lib/revolt";

dayjs.extend(relativeTime);


const [editing, setEditing] = createSignal<boolean>(false);
const [editMessageId, setEditMessageId] = createSignal<string>();
const [newMessage, setNewMessage] = createSignal<string>();

const [showPicker, setShowPicker] = createSignal<boolean>(false);

const MessageBase: Component<{message: Message}> = ({message}) => {

  const [replies] = createResource(message.fetchReplies);

  return (
    <div
      class={classNames({
        chat: true,
        "chat-end": message.author?.id === revolt.user.id,
        "chat-start": message.author?.id !== revolt.user.id,
        "mx-2": true,
      })}
    >
      <div class="chat-image avatar">
        <div class="w-10 h-10 rounded-full">
        <img
                src={
                  message.masquerade?.avatar ||
                  message.member?.generateAvatarURL() ||
                  message.author?.generateAvatarURL() ||
                  message.author?.defaultAvatarURL
                }
              />
        </div>
      </div>
      <div class="chat-header">
        <Show when={replies.state === "ready"}>
          <div class="flex flex-col gap-2">
            FIXME
          </div>
        </Show>
        <span
          class={
            message.member.colorRole.color && message.member.colorRole.color.includes("gradient")
              ? css`
                  background: ${message.member.colorRole.color};
                  background-clip: text;
                  -webkit-background-clip: text;
                  -webkit-text-fill-color: transparent;
                `
              : css`
                  color: ${message.member.colorRole.color || "inherit"};
                `
          }
        >
          {message.masquerade?.name ||
            message.member?.nickname ||
            message.author?.username}{" "}
        </span>
        {message.masquerade?.name && `(@${message.author?.username})`}
      </div>
      <div
        class={classNames({
          "chat-bubble": true,
          "chat-bubble-accent": message.author?.id === revolt.user?.id,
        })}
      >
        <Markdown disallowBigEmoji content={message.content || ""} />
        {/* {message.source.embeds && <RevoltEmbeds message={message} />} */}
        {message.attachments && (
          <For each={message.attachments}>
            {(attachment) => (
              <Show when={attachment.metadata.type === "Image"}>
                <img
                  src={`https://autumn.revolt.chat/attachments/${attachment.id}`}
                  class="w-auto max-h-64"
                />
              </Show>
            )}
          </For>
        )}
      </div>
      <div class="chat-footer opacity-50">
        {message.edited &&
          `Edited • ${dayjs.unix(message.edited.getTime() / 1000).fromNow()}`}
      </div>
    </div>
  );
};

export { MessageBase };
