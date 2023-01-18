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

  const [replies] = createResource(message.fetchReplies);

  return (
    <div class="flex items-center gap-2 hover:bg-black/10">
      <div class="flex-shrink-0">
        <img class="rounded-lg avatar w-10 h-10" src={message.author.generateAvatarURL()} />
      </div>
      <div>
        <div>
          <span style={{
            color: message.member.colorRole.color || "inherit"
          }} class="font-semibold">{message.author.username}</span>
        </div>
        <div>
          <Markdown content={message.content || ""} />
        </div>
      </div>
    </div>
  );
};

export { UserMessageBase };
