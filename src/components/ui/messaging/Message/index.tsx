import { Client, Message as MSG } from "revolt.js";
import {
  Accessor,
  Component,
  createResource,
  createSignal,
  For,
  Match,
  Setter,
  Show,
  Switch,
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
  BiSolidUserX,
} from "solid-icons/bi";
import { Markdown } from "../../../markdown";
import RevoltEmbeds from "../embeds";
import { servers, settings as config } from "../../../../lib/solenoid";

dayjs.extend(relativeTime);

interface MessageComponent {
  client: Client;
  message: MSG;
  settings: settings;
  signal: Accessor<reply[]>;
  setter: Setter<reply[]>;
  colour: string | undefined;
  deleteFunction: any;
  setTextbox?: Setter<string> | any;
  textbox?: Accessor<string> | any;
}

const [editing, setEditing] = createSignal<boolean>(false);
const [editMessageId, setEditMessageId] = createSignal<string>();
const [newMessage, setNewMessage] = createSignal<string>();

const [showPicker, setShowPicker] = createSignal<boolean>(false);

const Message: Component<MessageComponent> = ({
  client,
  message,
  settings,
  setter,
  signal,
  colour,
  deleteFunction,
  textbox,
  setTextbox,
}) => {
  async function findReplies() {
    try {
      //
      // eslint-disable-next-line prefer-const
      let msgs: (MSG | undefined)[] = [];
      message.reply_ids?.forEach(async (id) => {
        msgs.push(await message.channel?.client.messages.get(id));
      });

      return msgs;
    } catch (why) {
      console.error(why);
    }
  }

  function getrolecolour(message?: MSG) {
    if (!message) return "inherit";
    if (!message.member) return "inherit";
    for (const [, { colour }] of message.member.orderedRoles) {
      if (config.debug) console.log(colour);
      if (colour) {
        return colour;
      }
    }
  }

  const [replies] = createResource(findReplies);

  return (
    <div
      class={classNames({
        chat: true,
        "chat-end": message.author?._id === client.user?._id,
        "chat-start": message.author?._id !== client.user?._id,
        "mx-2": true,
      })}
    >
      <div class="chat-image avatar">
        <div class="w-10 h-10 rounded-full">
          <Switch>
            <Match when={message.system}>
              <img
                src={
                  "https://autumn.revolt.chat/attachments/download/ItfupS-VXfijXY80h0uQuFjB24eG2BC1aG5bTBcv_m"
                }
              />
            </Match>
            <Match when={!message.system}>
              <img
                src={
                  message.masquerade?.avatar ||
                  message.member?.generateAvatarURL() ||
                  message.author?.generateAvatarURL() ||
                  message.author?.defaultAvatarURL
                }
              />
            </Match>
          </Switch>
        </div>
      </div>
      <div class="chat-header">
        <Show when={!replies.loading}>
          <div class="flex flex-col gap-2">
            <For each={replies()}>
              {(reply) => {
                const roleColour = getrolecolour(reply);
                return (
                  <div class="p-2 bg-base-200 my-1 flex items-center gap-2">
                    <img
                      src={
                        reply?.member?.generateAvatarURL() ||
                        reply?.author?.generateAvatarURL()
                      }
                      class="w-4 h-4 rounded-full"
                    />{" "}
                    <span
                      class={
                        roleColour && roleColour.includes("gradient")
                          ? css`
                              background: ${roleColour};
                              background-clip: text;
                              -webkit-background-clip: text;
                              -webkit-text-fill-color: transparent;
                            `
                          : css`
                              color: ${colour || '#fff'};
                            `
                      }
                    >
                      {reply?.masquerade?.name ||
                        reply?.member?.nickname ||
                        reply?.author?.username}
                    </span>
                    <Markdown content={reply?.content?.substring(0, 70) || ""} />
                  </div>
                );
              }}
            </For>
          </div>
        </Show>
        <span
          class={
            colour && colour.includes("gradient")
              ? css`
                  background: ${colour};
                  background-clip: text;
                  -webkit-background-clip: text;
                  -webkit-text-fill-color: transparent;
                `
              : css`
                  color: ${colour || "inherit"};
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
          "chat-bubble-accent": message.author?._id === client.user?._id,
        })}
      >
        <Show when={!message.system}>
          <Markdown disallowBigEmoji content={message.content || ""} />
        </Show>
        <Show when={message.system}>
          <Switch>
            <Match when={message.asSystemMessage.type === "user_joined"}>
              <p class="flex items-center gap-1">
                <BiSolidRightArrowAlt />
                {message.asSystemMessage.type === "user_joined" &&
                  message.asSystemMessage.user?.username}{" "}
                joined
              </p>
            </Match>
            <Match when={message.asSystemMessage.type === "user_left"}>
              <p class="flex items-center gap-1">
                <BiSolidLeftArrowAlt />
                {message.asSystemMessage.type === "user_left" &&
                  message.asSystemMessage.user?.username}{" "}
                left
              </p>
            </Match>
            <Match when={message.asSystemMessage.type === "user_kicked"}>
              <p class="flex items-center gap-1">
                <BiSolidUserX />
                {message.asSystemMessage.type === "user_kicked" &&
                  message.asSystemMessage.user?.username}{" "}
                was yeeted
              </p>
            </Match>
            <Match when={message.asSystemMessage.type === "user_banned"}>
              <p class="flex items-center gap-1">
                <BiSolidShieldX />
                {message.asSystemMessage.type === "user_banned" &&
                  message.asSystemMessage.user?.username}{" "}
                was ejected
              </p>
            </Match>
          </Switch>
        </Show>

        {message.embeds && <RevoltEmbeds message={message} />}
        {message.attachments && (
          <For each={message.attachments}>
            {(attachment) => (
              <Show when={attachment.metadata.type === "Image"}>
                <img
                  src={`https://autumn.revolt.chat/attachments/${attachment._id}`}
                  class="w-auto max-h-64 rounded-lg"
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

export { Message };
