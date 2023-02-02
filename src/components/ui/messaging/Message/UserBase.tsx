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

const UserMessageBase: Component<{ message: Message }> = ({ message }) => {

  const [replies, setReplies] = createSignal<BaseMessage[] | undefined>();

  message.fetchReplies().then(replies => {
    setReplies(replies);
  })

  return (
    <div>
      <Show when={replies()}>
        <For each={replies()}>
          {reply => reply.isUser() && (
            <div class="ml-2 my-2 flex gap-2">
              <span>^</span>
              <div class="avatar">
                <div class="w-5 h-5 rounded-full">
                  <img src={reply.author.generateAvatarURL() || ""} />
                </div>
              </div>
              <div>
                <span
                  class={ reply.member.colorRole && reply.member.colorRole.color.includes("gradient") ?
                    css`
                    background: ${reply.member.colorRole.color};
                    background-clip: text;
                    -webkit-background-clip: text;
                    -webkit-text-fill-color: transparent;
                  `
                  : css `
                    color: ${reply.member.colorRole?.color || "inherit"};
                  `
                }>
                  {
                    reply.masquerade?.name
                    || reply.member?.nickname
                    || reply.author?.username
                    || "Random Revolt User"
                  }
                </span>
              </div>
              <div>
                <Markdown content={
                  reply.content.length > 24 &&
                  reply.content.substring(0,24)|| "**No Content**"} />
              </div>
            </div>
          )}
        </For>
      </Show>
      <div class="flex gap-2 hover:bg-black/25">
        <div class="ml-2 mr-1 avatar top-3">
          <div class="w-9 h-9 rounded-full">
            <img src={ message.generateMasqAvatarURL() || message.member.generateAvatarURL() || message.author.generateAvatarURL()} />
          </div>
        </div>
        <div class="my-2 w-full">
          <div>
            <span
              class={ message.member.colorRole && message.member.colorRole.color.includes("gradient") ?
                css`
                  background: ${message.member.colorRole.color};
                  background-clip: text;
                  -webkit-background-clip: text;
                  -webkit-text-fill-color: transparent;
                `
                : css `
                  color: ${message.member.colorRole?.color || "inherit"};
                `
              }>
              {
                message.masquerade?.name
                || message.member?.nickname
                || message.author?.username
                || "Random Revolt User"
              }
            </span>
          </div>
          <div class="mr-3">
            <Markdown content={message.content || ""} />
          </div>
          <Show when={message.attachments}>
            <div class="my-2 mr-2">
              <For each={message.attachments}>
                {attachment => (
                  <Switch>
                    <Match when={attachment.metadata.type == "Image"}>
                      <img
                        src={attachment.generateURL()}
                        class="max-w-64 max-h-64"
                      />
                    </Match>
                    <Match when={attachment.metadata.type === "Video"}>
                      <video
                        src={attachment.generateURL()}
                        class="max-w-64 max-h-64"
                        controls
                      />
                    </Match>
                    <Match when={attachment.metadata.type === "Audio"}>
                      <audio
                        src={attachment.generateURL()}
                        controls
                      />
                    </Match>
                  </Switch>
                )}
              </For>
            </div>
          </Show>
        </div>
      </div>
    </div>
  );
};

export { UserMessageBase };
