import { For } from "solid-js";
import { UserMessageBase } from "./UserBase";
import { For, Switch, Match} from "solid-js"
import { messages, servers, setMessages } from "../../../../lib/solenoid";
import { BaseMessage, SystemMessage, SystemMessageType } from "revolt-toolset";

import type { Component } from "solid-js";
import { revolt } from "../../../../lib/revolt";
import { produce } from "solid-js/store";
import { SystemMessageBase } from "./SystemBase";

revolt.on("message", async m => {
    setMessages(produce((old) => old.push(m)))
})

const MessageContainer: Component = () => {
    return (
        <For each={messages?.reverse()}>
            {message => {
                if (message?.isSystem()) {
                    return (
                    <div>
                        <p> System Message id {message.id}</p>
                        <SystemMessageBase sysmessage={message} />
                    </div>
                )
                } else if (message?.isUser()) {
                    return (
                        <div>
                            <UserMessageBase message={message} />
                        </div>
                    )
                }
            }}
        </For>
    )
}

export { MessageContainer };

