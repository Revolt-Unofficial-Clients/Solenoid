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
import { createSignal } from "solid-js";
import { Picker } from "../Picker";

import type { Badges } from "../../assets/badges/types";
import badgeList from "../../assets/badges/badges.json";

import { FiAtSign, FiDelete, FiEdit, FiRepeat } from "solid-icons/fi";
import { HiSolidReply } from 'solid-icons/hi'
import {FaRegularFaceGrin} from "solid-icons/fa"

import rehypeKatex from "rehype-katex"
import rehypePrism from "rehype-prism"
import remarkBreaks from "remark-breaks"
import remarkGfm from "remark-gfm"
import remarkMath from "remark-math"

console.log(badgeList);

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
  setTextbox
}) => {
  return (
    <div
      class={
        "solenoid-message " +
        (!settings.experiments.compact &&
        message.mentions?.find((e) => e?._id === client.user?._id)
          ? "mentioned"
          : "")
      }
    >
      <div class="solenoid-message-author">
        {!settings.experiments.compact && (
          <a onClick={() => setTextbox(textbox() + `<@${message.author?._id}>`)}>
            {message.masquerade?.avatar ? (
              <img
                style={{
                  "max-width": "50px",
                  "max-height": "50px",
                }}
                class="solenoid-pfp"
                src={message.masquerade?.avatar}
              ></img>
            ) : message.member?.avatar ? (
              <img
                style={{
                  "max-width": "50px",
                  "max-height": "50px",
                }}
                class="solenoid-pfp"
                src={`${client.configuration?.features?.autumn?.url}/avatars/${message.member?.avatar?._id}`}
                title={`${message.member?.avatar?.filename}`}
              ></img>
            ) : message.author?.avatar ? (
              <img
                style={{
                  "max-width": "50px",
                  "max-height": "50px",
                }}
                class="solenoid-pfp"
                src={`${client.configuration?.features?.autumn?.url}/avatars/${message.author?.avatar?._id}`}
                title={`${message.author?.avatar?.filename}`}
              ></img>
            ) : (
              <img
                style={{
                  "max-width": "50px",
                  "max-height": "50px",
                }}
                class="solenoid-pfp"
                title="Default Avatar"
                src={`https://api.revolt.chat/users/${message.author?._id}/default_avatar`}
              ></img>
            )}
          </a>
        )}
        <span
          class={
            colour && colour.includes("gradient")
              ? css`
                  background: ${colour};
                  background-clip: text;
                  -webkit-background-clip: text;
                  -webkit-text-fill-color: transparent;
                  font-weight: bold;
                `
              : css`
                  color: ${colour ?? "#fff"};
                  font-weight: bold;
                `
          }
        >
          {" "}
          {message.masquerade?.name ??
            message.member?.nickname ??
            message.author?.username ??
            "Unknown User"}
        </span>
        {message.masquerade && (
          <span class="solenoid-masquerade">(Masquerade)</span>
        )}
        {message.author?.bot && <span class="solenoid-bot">(Bot)</span>}
        {!settings.experiments.compact && (
          <div class="badges">
            <For each={badgeList}>
              {(element: Badges) => {
                if (element.id instanceof Array<string>) {
                  return (
                    <For each={element.id}>
                      {(e) => {
                        if (e === message.author_id) {
                          return (
                            <span
                              class={
                                element.bkg?.includes("gradient")
                                  ? css`
                                      background: ${element.bkg};
                                      font-weight: bold;
                                      padding: 2px;
                                      border-radius: 3px;
                                      margin-left: 0.5rem;
                                      margin-right: 0.5rem;
                                      color: ${element.colour ?? "#000"};
                                    `
                                  : css`
                                      background-color: ${element.bkg ??
                                      "#212121"};
                                      padding: 2px;
                                      border-radius: 3px;
                                      margin-left: 0.5rem;
                                      margin-right: 0.5rem;
                                      color: ${element.colour ?? "#fff"};
                                    `
                              }
                            >
                              {element.title}{" "}
                              {element.url && (
                                <img
                                  src={element.url}
                                  width={20}
                                  height={20}
                                  class="badgeIcon"
                                />
                              )}
                            </span>
                          );
                        }
                      }}
                    </For>
                  );
                } else if (
                  typeof element.id === "string" &&
                  message.author?._id === element.id
                ) {
                  return (
                    <span
                      class={
                        element.bkg && element.bkg.includes("gradient")
                          ? css`
                              background: ${element.bkg};
                              padding: 2px;
                              border-radius: 3px;
                              margin-left: 0.5rem;
                              margin-right: 0.5rem;
                            `
                          : css`
                              background-color: ${element.bkg ?? "var(--badge-default)"};
                              padding: 2px;
                              border-radius: 3px;
                              margin-left: 0.5rem;
                              margin-right: 0.5rem;
                            `
                      }
                    >
                      {element.title}{" "}
                      {element.url && (
                        <img src={element.url} width={15} height={15} />
                      )}
                    </span>
                  );
                }
              }}
            </For>
          </div>
        )}
        {!settings.experiments.compact && (
          <>
            {message.reply_ids && message.reply_ids.length > 1 ? (
              <span class="notimportant">
                {" "}
                (Replying to {message?.reply_ids?.length} messages)
              </span>
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
          </>
        )}

        {settings.experiments.compact && message.reply_ids && (
          <>
            <FiRepeat class="icon" color="#636363" />
            <span style="margin-right:5px">{message.reply_ids.length}</span>
          </>
        )}

        {settings.experiments.compact &&
          message.mentions?.find((e) => e?._id === client.user?._id) && (
            <FiAtSign class="icon" color="rgb(122, 189, 255)" />
          )}

        {settings.experiments.compact && message.edited && (
          <FiEdit class="icon" color="rgb(122, 189, 255)" />
        )}
        {!settings.experiments.compact && message.edited && (
          <span class="notimportant">
            Edited:{" "}
            {settings.experiments.edited_format === "ISO"
              ? message.edited.toISOString()
              : settings.experiments.edited_format === "UTC"
              ? message.edited.toUTCString()
              : message.edited.toLocaleString()}
          </span>
        )}

        {settings.suffix && <span>{settings.showSuffix ? " says " : ":"}</span>}

        {settings.experiments.compact && (
          <>
            {editing() && editMessageId() === message._id ? (
              <div class="message-container compact">
                <textarea
                  value={newMessage()}
                  onChange={(e) => setNewMessage(e.currentTarget.value)}
                  autofocus
                  class="solenoid-send-input compact"
                />
                <div
                  role="button"
                  class="done"
                  onClick={() => {
                    message
                      .edit({
                        content: newMessage(),
                      })
                      .then(() => {
                        setEditing(false);
                        setNewMessage();
                      });
                  }}
                >
                  <span class="edit done">Done</span>
                </div>
              </div>
            ) : (
              <SolidMarkdown
                class="solenoid-md compact"
                rehypePlugins={[rehypeKatex, rehypePrism]}
                remarkPlugins={[remarkBreaks, remarkGfm, remarkMath]}
                children={message.content ?? undefined}
                
              />
            )}
          </>
        )}

        <div class="button-container">
          {message.author?._id === client.user?._id && !editing() && (
            <>
              <div
                role="button"
                class="edit"
                onClick={() => {
                  setEditing(true);
                  setEditMessageId(message._id);
                  setNewMessage(message.content ?? "");
                }}
              >
                 <span><FiEdit/> Edit</span>
              </div>
              <div
                role="button"
                class="delete"
                onClick={() => deleteFunction(message)}
              >
                 <span><FiDelete/> Delete</span>
              </div>
            </>
          )}
          <div
            role="button"
            class="reply"
            onClick={() =>
              setter([
                ...signal(),
                {
                  id: message._id,
                  mention: false,
                },
              ])
            }
          >
            <span><HiSolidReply/> Reply</span>
          </div>
          <div
            role="button"
            class="react"
            onClick={() => {
              setShowPicker(true);
              setEditMessageId(message._id);
            }}
          >
            <span><FaRegularFaceGrin/> React</span>
          </div>
        </div>
      </div>
      {!settings.experiments.compact && (
        <div class="content">
          {editing() && editMessageId() === message._id ? (
            <div>
              <textarea
                value={newMessage()}
                onChange={(e) => setNewMessage(e.currentTarget.value)}
                autofocus
                class="solenoid-send-input"
              />
              <div
                role="button"
                class="done"
                onClick={() => {
                  message
                    .edit({
                      content: newMessage(),
                    })
                    .then(() => {
                      setEditing(false);
                      setNewMessage();
                    });
                }}
              >
                <span>Done</span>
              </div>
            </div>
          ) : (
            <SolidMarkdown
              class="solenoid-md"
              rehypePlugins={[rehypeKatex, rehypePrism]}
              remarkPlugins={[remarkBreaks, remarkGfm, remarkMath]}
              children={message.content ?? undefined}
            />
          )}
        </div>
      )}
      {showPicker() &&
        editMessageId() === message._id &&
        settings.experiments.picker && (
          <Picker
            setMessage={setNewMessage}
            messageToReact={message}
            type="react"
            setOpen={setShowPicker}
          />
        )}
        <div class="attachments">
          <For each={message.attachments}>
        {(attachment) => {
          if (!settings.showImages) {
            return (
              <span>
                Attachments have been disabled, Enable Image Rendering through
                settings.
              </span>
            );
          } else if (attachment.metadata.type === "Image") {
            //Basic image support :D
            return (
              <a href={`https://autumn.revolt.chat/attachments/${attachment._id}`} target="_blank" rel="noopener noreferrer">
                <img
                class="solenoid-message-image"
                src={`https://autumn.revolt.chat/attachments/${attachment._id}`}
                width={attachment.metadata.width}
                height={attachment.metadata.height}
                title={`Click to mention @${message.author?.username}`}
              />
            </a>
            );
          } else if (attachment.metadata.type === "Video") {
            return (
              <video
                class="solenoid-message-video"
                src={`${client.configuration?.features.autumn.url}/attachments/${attachment._id}`}
                width={attachment.metadata.width}
                height={attachment.metadata.height}
                controls
              />
            );
          } else {
            return (
              <div class="solenoid-message-file">
                <h3 class="header">
                  {message.author?.username} sent you a{" "}
                  {attachment.metadata.type}
                </h3>
                <p class="name">File Name: {attachment.filename}</p>
                <a
                  class="download"
                  type="download"
                  href={`${client.configuration?.features?.autumn?.url}/attachments/${attachment._id}`}
                >
                  Download
                </a>
              </div>
            );
          }
        }}
      </For>
        </div>
    </div>
  );
};

export { Message };
