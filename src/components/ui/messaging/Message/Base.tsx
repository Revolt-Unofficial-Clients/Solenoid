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

const MessageBase: Component<{ message: Message }> = ({ message }) => {

  const [replies] = createResource(message.fetchReplies);

  return (
    <div
      class={classNames({
        chat: true,
        "flex": true,
        "hover:bg-black/25": true
      })}
    >
      <div class="avatar top-2 mx-1">
        <div class="w-9 h-9 rounded-full">
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
      <div>
        <div class="chat-header">
          <Show when={replies.state === "ready"}>
            <div class="flex flex-col gap-2">
              FIXME
            </div>
          </Show>
          <span
            class={
              message.member.colorRole && message.member.colorRole.color && message.member.colorRole.color.includes("gradient")
                ? css`
                  background: ${message.member.colorRole.color};
                  background-clip: text;
                  -webkit-background-clip: text;
                  -webkit-text-fill-color: transparent;
                `
                : css`
                  color: ${message.member.colorRole?.color || "inherit"};
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
          class="my-2 w-full"
        >
          <Markdown content={message.content || ""} />
          {/* {message.source.embeds && <RevoltEmbeds message={message} />} */}
          <div class="my-2">
          {message.attachments && (
            <For each={message.attachments}>
              {(attachment) => (
                <Show when={attachment.metadata.type === "Image"}>
                  <img
                    src={`https://autumn.revolt.chat/attachments/${attachment.id}`}
                    class="max-w-64 max-h-64 rounded-md"
                  />
                </Show>
              )}
            </For>
          )}
          </div>
        </div>
        <div class="chat-footer opacity-50">
          {message.edited &&
            `Edited • ${dayjs.unix(message.edited.getTime() / 1000).fromNow()}`}
        </div>
      </div>
    </div>
  );
};

export { MessageBase };
