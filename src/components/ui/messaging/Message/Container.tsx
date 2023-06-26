import { UserMessageBase } from "./UserBase";
import { For } from "solid-js";
import { messages, servers, setMessages } from "../../../../lib/solenoid";

import type { Component } from "solid-js";
import { revolt } from "../../../../lib/revolt";
import { SystemMessageBase } from "./SystemBase";

revolt.on("message", async (m) => {
  if (m.channelID !== servers.current_channel?.id) return;
  setMessages((old) => [...old, m]);
});

const MessageContainer: Component = () => {

  return (
    <For each={messages} fallback={<p>No items</p>}>
      {(message) => {
        if (message?.isSystem()) {
          return (
            <div>
              <p> System Message id {message.id}</p>
              <SystemMessageBase sysmessage={message} />
            </div>
          );
        } else if (message?.isUser()) {
          return (
            <div>
              <UserMessageBase message={message} />
            </div>
          );
        }
      }}
    </For>
  );
};

export { MessageContainer };
