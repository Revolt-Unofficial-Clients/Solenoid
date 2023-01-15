import { MessageBase } from "./Base";
import { For, Switch, Match} from "solid-js"
import { messages, servers } from "../../../../lib/solenoid";
import { BaseMessage, SystemMessage, SystemMessageType } from "revolt-toolset";

import type { Component } from "solid-js";
import { Markdown } from "../../../markdown";

const MessageContainer: Component = () => {
    return (
        <For each={messages()?.reverse()}>
            {message => {
                if (message?.isSystem()) {
                    return (
                    <div>
                        <p> System Message id {message.id}</p>
                    </div>
                )
                } else if (message?.isUser()) {
                    return (
                        <div>
                            <p>User Message Id {message.id}</p>
                            <MessageBase message={message} />
                        </div>
                    )
                }
            }}
        </For>
    )
}

export { MessageContainer }