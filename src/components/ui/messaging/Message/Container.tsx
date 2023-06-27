import { UserMessageBase } from "./UserBase";
import { For } from "solid-js";
import { messages } from "../../../../lib/solenoid";

import type { Component } from "solid-js";
import { SystemMessageBase } from "./SystemBase";


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
