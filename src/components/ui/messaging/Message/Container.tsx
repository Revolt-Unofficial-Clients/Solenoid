import { UserMessageBase } from "./UserBase";
import { For, Switch, Match} from "solid-js"
import { BaseMessage, SystemMessage, SystemMessageType } from "revolt-toolset";

import type { Component } from "solid-js";
import { Markdown } from "../../../markdown";
import { revolt } from "../../../../lib/revolt";
import { produce } from "solid-js/store";
import { SystemMessageBase } from "./SystemBase";
import { setSolenoidServer, solenoidServer } from "../../../../lib/store/solenoidServerStore";

revolt.on("message", async m => {
    if(m.channel.id === solenoidServer.channel?.current.id) {
        setSolenoidServer("channel", "messages", [...solenoidServer.channel.messages, m])
    }
})

const MessageContainer: Component = () => {
    return (
        <For each={solenoidServer.channel?.messages?.reverse()}>
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

export { MessageContainer }
